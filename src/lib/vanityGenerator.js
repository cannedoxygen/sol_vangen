// Address generation (JavaScript/WASM wrapper)/**
 * Vanity Address Generator JavaScript Wrapper
* 
* This module provides a JavaScript interface to the WebAssembly vanity address generator.
* It handles loading the WASM module, preparing input for the WASM functions,
* and processing the results returned by the WASM code.
*/

// Memory buffer for transferring data between JS and WASM
let memory = null;
// WebAssembly module instance
let wasmModule = null;
// Flag to track if generation is actively running
let isGenerating = false;

/**
* Initialize the WASM module
* @returns {Promise<void>} Promise that resolves when the module is loaded
*/
export const initializeWasm = async () => {
 if (wasmModule) {
   return; // Already initialized
 }

 try {
   // Load and instantiate the WebAssembly module
   const response = await fetch('/wasm/vanity_generator.wasm');
   const buffer = await response.arrayBuffer();
   const result = await WebAssembly.instantiate(buffer, {
     env: {
       // Environment functions that the WASM module can call
       reportAttempts: (count) => {
         // Called by WASM to report attempt count
         if (typeof window !== 'undefined') {
           window.dispatchEvent(new CustomEvent('vanity-attempts', { 
             detail: { count } 
           }));
         }
       },
       log: (ptr, len) => {
         // Called by WASM to log messages
         if (!memory) return;
         const buffer = new Uint8Array(memory.buffer, ptr, len);
         const message = new TextDecoder().decode(buffer);
         console.log('[WASM]', message);
       },
     },
   });

   // Store reference to the instantiated module
   wasmModule = result.instance.exports;
   memory = wasmModule.memory;

   return wasmModule;
 } catch (error) {
   console.error('Failed to initialize WASM module:', error);
   throw new Error(`WASM initialization failed: ${error.message}`);
 }
};

/**
* Convert a JavaScript string to a pointer in WASM memory
* @param {string} str - String to store in WASM memory
* @returns {number} Pointer to the string in WASM memory
*/
const stringToWasm = (str) => {
 if (!wasmModule || !memory) {
   throw new Error('WASM module not initialized');
 }

 // Encode the string to UTF-8
 const encoder = new TextEncoder();
 const data = encoder.encode(str);
 
 // Allocate memory in the WASM module
 const ptr = wasmModule.alloc(data.length + 1); // +1 for null terminator
 
 // Write the string data to WASM memory
 const buffer = new Uint8Array(memory.buffer, ptr, data.length + 1);
 buffer.set(data);
 buffer[data.length] = 0; // Null terminator
 
 return ptr;
};

/**
* Convert a WASM memory pointer to a JavaScript string
* @param {number} ptr - Pointer to string in WASM memory
* @param {number} len - Length of the string
* @returns {string} Decoded string
*/
const wasmToString = (ptr, len) => {
 if (!memory) {
   throw new Error('WASM module not initialized');
 }
 
 const buffer = new Uint8Array(memory.buffer, ptr, len);
 return new TextDecoder().decode(buffer);
};

/**
* Generate a vanity address with the specified prefix
* @param {string} prefix - The desired prefix for the address
* @param {Function} onProgress - Callback function for progress updates
* @returns {Promise<Object>} Object containing the generated address, public key, and private key
*/
export const generateVanityAddress = async (prefix, onProgress = null) => {
 // Initialize WASM if not already initialized
 if (!wasmModule) {
   await initializeWasm();
 }
 
 // Validate prefix
 if (!prefix || typeof prefix !== 'string') {
   throw new Error('Prefix must be a non-empty string');
 }
 
 // Check if we're already generating
 if (isGenerating) {
   throw new Error('Another generation process is already running');
 }
 
 isGenerating = true;
 let progressListener = null;
 
 try {
   // Set up progress tracking if a callback was provided
   if (onProgress && typeof onProgress === 'function') {
     progressListener = (event) => {
       onProgress(event.detail.count);
     };
     
     window.addEventListener('vanity-attempts', progressListener);
   }
   
   // Prepare the prefix for WASM
   const prefixPtr = stringToWasm(prefix);
   
   // Call the WASM function
   const resultPtr = wasmModule.generate_vanity_address(prefixPtr, prefix.length);
   
   // Check if generation was cancelled
   if (!isGenerating) {
     throw new Error('Generation was cancelled');
   }
   
   // Process the result
   if (resultPtr === 0) {
     throw new Error('Failed to generate address');
   }
   
   // Read the result structure
   // Format: address_len|address|pubkey_len|pubkey|privkey_len|privkey
   const buffer = new Uint8Array(memory.buffer);
   let offset = resultPtr;
   
   // Read address
   const addressLen = buffer[offset++];
   const address = wasmToString(offset, addressLen);
   offset += addressLen;
   
   // Read public key
   const pubKeyLen = buffer[offset++];
   const publicKey = wasmToString(offset, pubKeyLen);
   offset += pubKeyLen;
   
   // Read private key
   const privKeyLen = buffer[offset++];
   const privateKey = wasmToString(offset, privKeyLen);
   
   // Free the allocated memory
   wasmModule.dealloc(prefixPtr);
   wasmModule.dealloc(resultPtr);
   
   return {
     address,
     publicKey,
     privateKey
   };
 } catch (error) {
   console.error('Error generating vanity address:', error);
   throw error;
 } finally {
   // Clean up
   isGenerating = false;
   
   if (progressListener) {
     window.removeEventListener('vanity-attempts', progressListener);
   }
 }
};

/**
* Cancel any ongoing generation
*/
export const cancelGeneration = () => {
 isGenerating = false;
 
 if (wasmModule && wasmModule.cancel_generation) {
   wasmModule.cancel_generation();
 }
};

/**
* Check if the WASM module is loaded and ready
* @returns {boolean} True if the module is ready
*/
export const isWasmReady = () => {
 return !!wasmModule;
};

// Export a default object with all functions
export default {
 initializeWasm,
 generateVanityAddress,
 cancelGeneration,
 isWasmReady
};