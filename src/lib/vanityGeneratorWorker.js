/**
 * Web Worker for vanity address generation
 * 
 * This worker runs the computationally intensive address generation
 * in a separate thread to keep the UI responsive.
 */

// Flag to track if we're actively generating
let isGenerating = false;
// Track attempts for progress reporting
let attemptCount = 0;
// WebAssembly module and memory
let wasmModule = null;
let memory = null;
// Interval for reporting progress back to main thread
let progressInterval = null;

// Handle messages from the main thread
self.onmessage = async (event) => {
  const { type, prefix } = event.data;
  
  switch (type) {
    case 'start':
      // Start generation with the given prefix
      await startGeneration(prefix);
      break;
      
    case 'stop':
      // Stop any ongoing generation
      stopGeneration();
      break;
      
    default:
      console.error('Unknown message type:', type);
  }
};

/**
 * Initialize the WebAssembly module
 */
async function initWasm() {
  try {
    if (wasmModule) return; // Already initialized
    
    // Load and instantiate the WASM module
    const response = await fetch('/wasm/vanity_generator.wasm');
    const buffer = await response.arrayBuffer();
    
    const result = await WebAssembly.instantiate(buffer, {
      env: {
        // Function for WASM to report attempt count
        reportAttempts: (count) => {
          attemptCount = count;
        },
        // Function for WASM to log messages
        log: (ptr, len) => {
          if (!memory) return;
          const buffer = new Uint8Array(memory.buffer, ptr, len);
          const message = new TextDecoder().decode(buffer);
          console.log('[WASM Worker]', message);
        }
      }
    });
    
    wasmModule = result.instance.exports;
    memory = wasmModule.memory;
    
  } catch (error) {
    console.error('Failed to initialize WASM in worker:', error);
    self.postMessage({
      type: 'error',
      data: `Failed to initialize generator: ${error.message}`
    });
  }
}

/**
 * Start the address generation process
 * @param {string} prefix - Desired address prefix
 */
async function startGeneration(prefix) {
  if (isGenerating) {
    stopGeneration();
  }
  
  isGenerating = true;
  attemptCount = 0;
  
  try {
    await initWasm();
    
    if (!wasmModule) {
      throw new Error('WASM module not initialized');
    }
    
    // Set up progress reporting interval
    progressInterval = setInterval(() => {
      if (isGenerating) {
        self.postMessage({
          type: 'attempts',
          data: attemptCount
        });
      }
    }, 100); // Report progress every 100ms
    
    // Prepare the prefix for WASM
    const prefixPtr = stringToWasm(prefix);
    
    // Call the WASM function
    const resultPtr = wasmModule.generate_vanity_address(prefixPtr, prefix.length);
    
    // Check if we're still generating (might have been cancelled)
    if (!isGenerating) {
      if (prefixPtr) wasmModule.dealloc(prefixPtr);
      if (resultPtr) wasmModule.dealloc(resultPtr);
      return;
    }
    
    // Process and return the result
    if (resultPtr === 0) {
      throw new Error('Failed to generate address');
    }
    
    // Extract result data
    const result = parseResult(resultPtr);
    
    // Free memory
    wasmModule.dealloc(prefixPtr);
    wasmModule.dealloc(resultPtr);
    
    // Send result back to main thread
    self.postMessage({
      type: 'result',
      data: result
    });
    
  } catch (error) {
    console.error('Error in vanity generation worker:', error);
    self.postMessage({
      type: 'error',
      data: error.message || 'Unknown error in generator'
    });
  } finally {
    stopGeneration();
  }
}

/**
 * Stop the generation process
 */
function stopGeneration() {
  isGenerating = false;
  
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  
  if (wasmModule && wasmModule.cancel_generation) {
    wasmModule.cancel_generation();
  }
}

/**
 * Convert a JavaScript string to a pointer in WASM memory
 * @param {string} str - String to store in WASM memory
 * @returns {number} Pointer to the string in WASM memory
 */
function stringToWasm(str) {
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
}

/**
 * Convert a WASM memory pointer to a JavaScript string
 * @param {number} ptr - Pointer to string in WASM memory
 * @param {number} len - Length of the string
 * @returns {string} Decoded string
 */
function wasmToString(ptr, len) {
  if (!memory) {
    throw new Error('WASM module not initialized');
  }
  
  const buffer = new Uint8Array(memory.buffer, ptr, len);
  return new TextDecoder().decode(buffer);
}

/**
 * Parse the result structure from WASM
 * @param {number} resultPtr - Pointer to the result in WASM memory
 * @returns {Object} Object with address, public key, and private key
 */
function parseResult(resultPtr) {
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
  
  return {
    address,
    publicKey,
    privateKey
  };
}

// Initialize as soon as the worker starts
initWasm().catch(error => {
  console.error('Failed to initialize worker:', error);
});