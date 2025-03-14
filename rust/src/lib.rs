// Rust implementation of Solana vanity generatoruse ed25519_dalek::{Keypair, PublicKey, SecretKey};
use rand::rngs::OsRng;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use wasm_bindgen::prelude::*;

// Global cancellation flag
static mut CANCEL_FLAG: Option<Arc<AtomicBool>> = None;

// Attempt counter
static mut ATTEMPT_COUNT: usize = 0;

// External function to report progress back to JS
#[wasm_bindgen]
extern "C" {
    fn reportAttempts(count: usize);
    fn log(ptr: *const u8, len: usize);
}

// Helper function to log messages to JS console
fn console_log(msg: &str) {
    unsafe {
        log(msg.as_ptr(), msg.len());
    }
}

// Report attempt count to JS
fn report_progress(count: usize) {
    unsafe {
        reportAttempts(count);
    }
}

#[wasm_bindgen]
pub fn alloc(size: usize) -> *mut u8 {
    // Allocate memory on the wasm heap
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr
}

#[wasm_bindgen]
pub fn dealloc(ptr: *mut u8, size: usize) {
    // Deallocate memory on the wasm heap
    unsafe {
        let _ = Vec::from_raw_parts(ptr, 0, size);
    }
}

#[wasm_bindgen]
pub fn cancel_generation() {
    // Set the cancellation flag
    unsafe {
        if let Some(flag) = &CANCEL_FLAG {
            flag.store(true, Ordering::SeqCst);
            console_log("Generation cancelled");
        }
    }
}

#[wasm_bindgen]
pub fn generate_vanity_address(prefix_ptr: *const u8, prefix_len: usize) -> *mut u8 {
    // Initialize cancellation flag
    let cancel_flag = Arc::new(AtomicBool::new(false));
    unsafe {
        CANCEL_FLAG = Some(cancel_flag.clone());
        ATTEMPT_COUNT = 0;
    }

    // Convert prefix pointer to a string
    let prefix_bytes = unsafe { std::slice::from_raw_parts(prefix_ptr, prefix_len) };
    let prefix = match std::str::from_utf8(prefix_bytes) {
        Ok(s) => s.to_lowercase(),
        Err(_) => {
            console_log("Invalid UTF-8 in prefix");
            return std::ptr::null_mut();
        }
    };

    console_log(&format!("Starting generation for prefix: {}", prefix));

    // Check if prefix is valid
    if prefix.is_empty() || prefix.len() > 10 {
        console_log("Prefix must be between 1 and 10 characters");
        return std::ptr::null_mut();
    }

    // Generate keypairs until we find one with the desired prefix
    let mut attempt_count: usize = 0;
    let mut csprng = OsRng;

    loop {
        // Check for cancellation
        if cancel_flag.load(Ordering::SeqCst) {
            console_log("Generation was cancelled");
            return std::ptr::null_mut();
        }

        // Generate a new keypair
        let keypair = match Keypair::generate(&mut csprng) {
            Ok(kp) => kp,
            Err(e) => {
                console_log(&format!("Error generating keypair: {}", e));
                continue;
            }
        };

        // Create address from public key (in a real implementation, this would
        // follow the Sui address derivation rules)
        let address = format!("{:x}", sha2::Sha256::digest(keypair.public.as_bytes()));

        // Update attempt counter
        attempt_count += 1;
        unsafe {
            ATTEMPT_COUNT = attempt_count;
        }

        // Report progress periodically
        if attempt_count % 100 == 0 {
            report_progress(attempt_count);
        }

        // Check if the address starts with our prefix
        if address.to_lowercase().starts_with(&prefix) {
            // Success! Return the result
            console_log(&format!("Found matching address after {} attempts", attempt_count));
            report_progress(attempt_count);

            // Format the result as a flattened structure:
            // address_len|address|pubkey_len|pubkey|privkey_len|privkey
            let pub_key_hex = hex::encode(keypair.public.as_bytes());
            let priv_key_hex = hex::encode(keypair.secret.as_bytes());

            // Calculate total buffer size needed
            let addr_len = address.len();
            let pub_len = pub_key_hex.len();
            let priv_len = priv_key_hex.len();
            let total_len = 1 + addr_len + 1 + pub_len + 1 + priv_len;

            // Allocate buffer for result
            let buffer = Vec::with_capacity(total_len);
            let buffer_ptr = buffer.as_ptr() as *mut u8;
            std::mem::forget(buffer);

            // Write data to buffer
            unsafe {
                let mut offset = 0;

                // Write address
                *buffer_ptr.add(offset) = addr_len as u8;
                offset += 1;
                std::ptr::copy_nonoverlapping(
                    address.as_ptr(),
                    buffer_ptr.add(offset),
                    addr_len,
                );
                offset += addr_len;

                // Write public key
                *buffer_ptr.add(offset) = pub_len as u8;
                offset += 1;
                std::ptr::copy_nonoverlapping(
                    pub_key_hex.as_ptr(),
                    buffer_ptr.add(offset),
                    pub_len,
                );
                offset += pub_len;

                // Write private key
                *buffer_ptr.add(offset) = priv_len as u8;
                offset += 1;
                std::ptr::copy_nonoverlapping(
                    priv_key_hex.as_ptr(),
                    buffer_ptr.add(offset),
                    priv_len,
                );
            }

            return buffer_ptr;
        }
    }
}