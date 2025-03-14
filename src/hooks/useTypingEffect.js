// Typing animation hookimport { useState, useEffect, useRef } from 'react';

/**
 * Custom hook that creates a typing effect animation
 * 
 * @param {string} text - The full text to be animated
 * @param {Object} options - Configuration options
 * @param {number} options.typingSpeed - Base typing speed in milliseconds
 * @param {number} options.deletingSpeed - Base speed for deleting characters
 * @param {boolean} options.startTypingOnMount - Whether to start typing immediately
 * @param {boolean} options.loop - Whether to loop the animation
 * @param {number} options.delayAfterComplete - Delay after typing completes before callback
 * @param {Function} options.onComplete - Callback when typing completes
 * @returns {Object} Hook state and controls
 */
const useTypingEffect = ({
    text = '',
    typingSpeed = 70,
    deletingSpeed = 50,
    startTypingOnMount = true,
    loop = false,
    delayAfterComplete = 1000,
    onComplete = () => {}
  } = {}) => {
    // Current displayed text
    const [displayedText, setDisplayedText] = useState('');
    // Current position in the text
    const [index, setIndex] = useState(0);
    // Whether we're currently typing or deleting
    const [isTyping, setIsTyping] = useState(true);
    // Whether the typing effect is currently paused
    const [isPaused, setIsPaused] = useState(!startTypingOnMount);
    // Whether the entire animation is finished
    const [isComplete, setIsComplete] = useState(false);
    // Reference to the timeout for cleanup
    const timeoutRef = useRef(null);
  
    // Get a random delay for more natural typing
    const getRandomDelay = (baseSpeed) => {
      // Occasionally add a much longer pause (like a human thinking)
      if (Math.random() > 0.95) {
        return baseSpeed * 5;
      }
      // Normal variation in typing speed
      return baseSpeed * (0.5 + Math.random());
    };
  
    // Start typing animation
    const startTyping = () => {
      setIsPaused(false);
    };
  
    // Pause typing animation
    const pauseTyping = () => {
      setIsPaused(true);
    };
  
    // Reset typing animation
    const resetTyping = (startImmediately = true) => {
      setDisplayedText('');
      setIndex(0);
      setIsTyping(true);
      setIsPaused(!startImmediately);
      setIsComplete(false);
    };
  
    // Handle typing effect
    useEffect(() => {
      // Do nothing if paused or text is empty
      if (isPaused || !text) return;
  
      // Cleanup previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
  
      // Handle typing phase
      if (isTyping) {
        if (index < text.length) {
          // Set timeout to add next character
          timeoutRef.current = setTimeout(() => {
            setDisplayedText(prev => prev + text[index]);
            setIndex(prevIndex => prevIndex + 1);
  
            // Random chance to briefly pause typing
            if (Math.random() > 0.9) {
              setIsPaused(true);
              timeoutRef.current = setTimeout(() => {
                setIsPaused(false);
              }, getRandomDelay(typingSpeed));
            }
          }, getRandomDelay(typingSpeed));
        } else {
          // Typing complete
          if (loop) {
            // If looping, set a delay before starting to delete
            timeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, delayAfterComplete);
          } else {
            // If not looping, mark as complete
            setIsComplete(true);
            onComplete();
          }
        }
      } 
      // Handle deleting phase (for loop animation)
      else {
        if (displayedText.length > 0) {
          // Set timeout to remove last character
          timeoutRef.current = setTimeout(() => {
            setDisplayedText(prev => prev.slice(0, -1));
          }, deletingSpeed);
        } else {
          // Deleting complete, reset to start typing again
          setIsTyping(true);
          setIndex(0);
        }
      }
  
      // Cleanup on unmount or when dependencies change
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [
      text, 
      index, 
      isTyping, 
      isPaused, 
      displayedText, 
      loop, 
      typingSpeed, 
      deletingSpeed, 
      delayAfterComplete, 
      onComplete
    ]);
  
    return {
      displayedText,
      isTyping,
      isPaused,
      isComplete,
      startTyping,
      pauseTyping,
      resetTyping
    };
  };
  
  export default useTypingEffect;