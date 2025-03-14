// Typing effect componentimport React, { useState, useEffect, useRef } from 'react';

/**
 * TypingEffect component that simulates text being typed out character by character
 * 
 * Props:
 * - text: The full text to display
 * - speed: Typing speed in milliseconds per character
 * - onComplete: Callback function to run when typing is complete
 * - className: Additional CSS classes
 */
const TypingEffect = ({ 
    text, 
    speed = 70,  // Default typing speed
    onComplete = () => {}, 
    className = '' 
  }) => {
    // Current text displayed
    const [displayedText, setDisplayedText] = useState('');
    // Current character index
    const [index, setIndex] = useState(0);
    // Track if typing is complete
    const [isComplete, setIsComplete] = useState(false);
    // Track if typing is paused
    const [isPaused, setIsPaused] = useState(false);
    // Reference to timeout for cleanup
    const timeoutRef = useRef(null);
  
    // Add random typing delays for more natural effect
    const getRandomDelay = () => {
      // Occasionally add a longer pause (like a human thinking)
      if (Math.random() > 0.95) {
        return speed * 5;
      }
      // Normal variation in typing speed
      return speed * (0.5 + Math.random());
    };
  
    // Effect to handle the typing animation
    useEffect(() => {
      // If we're done typing or paused, don't do anything
      if (isComplete || isPaused || !text) return;
      
      // If we haven't reached the end of the text
      if (index < text.length) {
        // Set a timeout to add the next character
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(prev => prev + text[index]);
          setIndex(prevIndex => prevIndex + 1);
          
          // Random chance to briefly pause typing
          if (Math.random() > 0.9) {
            setIsPaused(true);
            setTimeout(() => setIsPaused(false), getRandomDelay());
          }
        }, getRandomDelay());
      } else {
        // We've reached the end of the text
        setIsComplete(true);
        onComplete();
      }
      
      // Clean up the timeout when the component unmounts or when dependencies change
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [text, index, isComplete, isPaused, speed, onComplete]);
  
    // Render the typed text with a custom class
    return (
      <div className={`typing-effect ${className}`}>
        {displayedText}
      </div>
    );
  };
  
  export default TypingEffect;