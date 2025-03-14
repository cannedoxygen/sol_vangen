// Vanity address generator logic hookimport { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for vanity address generation
 * 
 * This hook manages the state and logic for generating vanity addresses
 * using WebAssembly for performance.
 * 
 * @returns {Object} State and functions for vanity address generation
 */
const useVanityGenerator = () => {
    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [prefix, setPrefix] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    
    // WebAssembly module state
    const [wasmModule, setWasmModule] = useState(null);
    const [isWasmLoaded, setIsWasmLoaded] = useState(false);
    
    // Reference to WebWorker for multi-threaded generation
    const workerRef = useRef(null);
    
    // Load WebAssembly module on mount
    useEffect(() => {
      const loadWasm = async () => {
        try {
          // Check if WebAssembly is supported
          if (typeof WebAssembly === 'undefined') {
            throw new Error('WebAssembly is not supported in this browser');
          }
          
          // Import the compiled WebAssembly module
          const wasmResponse = await fetch('/wasm/vanity_generator.wasm');
          const wasmBuffer = await wasmResponse.arrayBuffer();
          const wasmModule = await WebAssembly.instantiate(wasmBuffer);
          
          setWasmModule(wasmModule.instance.exports);
          setIsWasmLoaded(true);
          setError(null);
        } catch (err) {
          console.error('Failed to load WASM module:', err);
          setError(`Failed to initialize generator: ${err.message}`);
          setIsWasmLoaded(false);
        }
      };
      
      loadWasm();
      
      // Clean up any workers on unmount
      return () => {
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      };
    }, []);
    
    // Start the generation process
    const startGeneration = (desiredPrefix) => {
      if (!isWasmLoaded) {
        setError('WASM module not loaded yet');
        return;
      }
      
      if (!desiredPrefix || desiredPrefix.trim() === '') {
        setError('Please provide a valid prefix');
        return;
      }
      
      // Reset state
      setPrefix(desiredPrefix.trim());
      setAttempts(0);
      setResult(null);
      setError(null);
      setIsGenerating(true);
      
      // Check if we can use web workers
      const useWorker = typeof Worker !== 'undefined';
      
      if (useWorker) {
        // Create a web worker for multithreaded generation
        try {
          // Terminate existing worker if there is one
          if (workerRef.current) {
            workerRef.current.terminate();
          }
          
          // Create new worker
          const worker = new Worker('/src/lib/vanityGeneratorWorker.js');
          workerRef.current = worker;
          
          // Set up message handler for worker communication
          worker.onmessage = (event) => {
            const { type, data } = event.data;
            
            switch (type) {
              case 'attempts':
                setAttempts(data);
                break;
              case 'result':
                setResult(data);
                setIsGenerating(false);
                break;
              case 'error':
                setError(data);
                setIsGenerating(false);
                break;
            }
          };
          
          // Start the worker
          worker.postMessage({
            type: 'start',
            prefix: desiredPrefix.trim()
          });
        } catch (err) {
          console.error('Failed to create worker:', err);
          // Fall back to main thread generation
          generateOnMainThread(desiredPrefix.trim());
        }
      } else {
        // Fall back to generating on the main thread
        generateOnMainThread(desiredPrefix.trim());
      }
    };
    
    // Generate on the main thread as a fallback
    const generateOnMainThread = async (desiredPrefix) => {
      // This is a simplified implementation for when web workers aren't available
      // In a real implementation, you'd want to use the WASM module directly
      
      try {
        let attemptCount = 0;
        const updateFrequency = 100; // Update UI every 100 attempts
        
        // Mock implementation - in production this would use the actual WASM module
        const findAddress = () => {
          // Simulate address generation
          attemptCount++;
          
          // Update the attempts count periodically
          if (attemptCount % updateFrequency === 0) {
            setAttempts(attemptCount);
          }
          
          // For demo purposes, we'll "find" a match after a random number of attempts
          // In a real implementation, this would check if the generated address starts with the prefix
          const shouldFind = Math.random() < 0.0001; // 0.01% chance per attempt
          
          if (shouldFind) {
            // Mock result - in production this would be the actual generated key pair
            const mockResult = {
              address: `${desiredPrefix}${'x'.repeat(40 - desiredPrefix.length)}`,
              publicKey: `pub_${Math.random().toString(36).substring(2, 15)}`,
              privateKey: `priv_${Math.random().toString(36).substring(2, 15)}`
            };
            
            setResult(mockResult);
            setIsGenerating(false);
            return true;
          }
          
          return false;
        };
        
        // Run the generation process with periodic breaks to keep the UI responsive
        const runGeneration = () => {
          if (!isGenerating) return;
          
          // Process a batch of attempts
          let found = false;
          for (let i = 0; i < 1000; i++) {
            found = findAddress();
            if (found || !isGenerating) break;
          }
          
          // Continue if not found and still generating
          if (!found && isGenerating) {
            setTimeout(runGeneration, 0);
          }
        };
        
        // Start the generation process
        runGeneration();
      } catch (err) {
        console.error('Generation error:', err);
        setError(`Error: ${err.message}`);
        setIsGenerating(false);
      }
    };
    
    // Stop the generation process
    const stopGeneration = () => {
      setIsGenerating(false);
      
      // Terminate worker if it exists
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' });
      }
    };
    
    // Reset the generator state
    const resetGenerator = () => {
      setIsGenerating(false);
      setPrefix('');
      setAttempts(0);
      setResult(null);
      setError(null);
      
      // Terminate worker if it exists
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
    
    return {
      isGenerating,
      attempts,
      prefix,
      result,
      error,
      isWasmLoaded,
      startGeneration,
      stopGeneration,
      resetGenerator
    };
  };
  
  export default useVanityGenerator;