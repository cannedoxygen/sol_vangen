import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const GeneratorContext = createContext(null);

/**
 * Custom hook to use the Generator context
 */
export const useGenerator = () => {
  const context = useContext(GeneratorContext);
  if (!context) {
    throw new Error('useGenerator must be used within a GeneratorProvider');
  }
  return context;
};

/**
 * GeneratorProvider component that manages state for the vanity address generator
 */
export const GeneratorProvider = ({ children }) => {
  // Vanity generator state
  const [prefix, setPrefix] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [wasmLoaded, setWasmLoaded] = useState(false);
  const [worker, setWorker] = useState(null);

  // Load WebAssembly module on component mount
  useEffect(() => {
    const loadWasm = async () => {
      try {
        // Import the vanity generator wrapper
        const vanityModule = await import('../lib/vanityGenerator');
        
        // Check if the module loaded successfully
        if (vanityModule) {
          setWasmLoaded(true);
          console.log('WASM module loaded successfully');
        }
      } catch (err) {
        console.error('Failed to load WASM module:', err);
        setError('Failed to initialize generator. Please refresh the page.');
      }
    };

    loadWasm();

    // Cleanup function
    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, []);

  // Start the vanity address generation
  const startGeneration = async (prefixValue) => {
    if (!wasmLoaded) {
      setError('Generator not initialized yet. Please wait.');
      return;
    }

    if (!prefixValue || prefixValue.trim() === '') {
      setError('Please enter a valid prefix.');
      return;
    }

    try {
      setPrefix(prefixValue);
      setIsGenerating(true);
      setAttempts(0);
      setError(null);
      setResult(null);

      // Import the vanity generator module
      const { generateVanityAddress } = await import('../lib/vanityGenerator');

      // Counter for periodic UI updates
      let attemptCounter = 0;
      const updateInterval = 50; // Update UI every 50 attempts

      // Start generation with callback
      const generatorResult = await generateVanityAddress(
        prefixValue.trim(),
        (currentAttempts) => {
          // Update attempts count periodically to avoid excessive re-renders
          attemptCounter++;
          if (attemptCounter % updateInterval === 0) {
            setAttempts(currentAttempts);
          }
        }
      );

      // Set the final result
      setResult(generatorResult);
      setIsGenerating(false);

      // Play success sound
      try {
        const successSound = new Audio('/public/sounds/success.mp3');
        successSound.play();
      } catch (soundError) {
        console.error('Failed to play success sound:', soundError);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
      setIsGenerating(false);
      
      // Play error sound
      try {
        const errorSound = new Audio('/public/sounds/error.mp3');
        errorSound.play();
      } catch (soundError) {
        console.error('Failed to play error sound:', soundError);
      }
    }
  };

  // Stop the generation process
  const stopGeneration = () => {
    if (isGenerating) {
      setIsGenerating(false);
      // Additional cleanup if needed
    }
  };

  // Reset the generator state
  const resetGenerator = () => {
    setPrefix('');
    setIsGenerating(false);
    setAttempts(0);
    setResult(null);
    setError(null);
  };

  // Context value to be provided
  const contextValue = {
    prefix,
    isGenerating,
    attempts,
    result,
    error,
    wasmLoaded,
    startGeneration,
    stopGeneration,
    resetGenerator,
  };

  return (
    <GeneratorContext.Provider value={contextValue}>
      {children}
    </GeneratorContext.Provider>
  );
};