import React, { useState, useEffect, useRef } from 'react';

/**
 * UserPrompt component that allows users to type responses in the terminal
 * 
 * Props:
 * - onSubmit: Callback function that receives the user's input
 */
const UserPrompt = ({ onSubmit }) => {
  // State to track user input
  const [input, setInput] = useState('');
  // Reference to the input element
  const inputRef = useRef(null);

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setInput(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  // Handle key press events
  const handleKeyPress = (e) => {
    // Only allow alphanumeric characters and spaces
    const isValidKey = /^[a-zA-Z0-9 ]$/.test(e.key);
    if (!isValidKey && e.key !== 'Enter' && e.key !== 'Backspace') {
      e.preventDefault();
    }
  };

  return (
    <div className="user-prompt">
      <div className="prompt-label">
        &gt; <span className="prompt-question">Will you proceed?</span>
      </div>
      
      <form onSubmit={handleSubmit} className="prompt-input-container">
        &gt; <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="prompt-input"
          placeholder="yes/no"
          maxLength={10}
          autoFocus
          aria-label="Type yes or no"
        />
      </form>
      
      <div className="prompt-hint">
        <span className="blink-slow">Type 'yes' to proceed or 'no' to terminate connection</span>
      </div>
    </div>
  );
};

export default UserPrompt;