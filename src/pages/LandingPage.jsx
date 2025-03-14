// Terminal interaction pageimport React, { useState, useEffect } from 'react';
import Terminal from '../components/landing/Terminal';
import UserPrompt from '../components/landing/UserPrompt';
import TypingEffect from '../components/landing/TypingEffect';

/**
 * Landing page with Matrix-inspired terminal interface
 * Displays cryptic messages and prompts the user to continue
 */
const LandingPage = ({ onContinue }) => {
  // State to track whether the intro messages have finished typing
  const [showPrompt, setShowPrompt] = useState(false);
  // State to track the current message being displayed
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Array of cryptic messages to display in sequence
  const messages = [
    "Do you even know who you are?",
    "They've been watching.",
    "We've been expecting you, Anon.",
    "Ready to find your true identity?"
  ];

  // When a message finishes typing, move to the next one or show the prompt
  const handleMessageComplete = () => {
    if (currentMessageIndex < messages.length - 1) {
      // Short delay before showing the next message
      setTimeout(() => {
        setCurrentMessageIndex(currentMessageIndex + 1);
      }, 1200);
    } else {
      // All messages complete, show the prompt
      setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
    }
  };

  // Handle user's response to the prompt
  const handleUserResponse = (response) => {
    if (response.toLowerCase() === 'yes') {
      // Play a success sound if available
      try {
        const successSound = new Audio('/public/sounds/success.mp3');
        successSound.play();
      } catch (error) {
        console.error('Failed to play success sound:', error);
      }
      
      // Navigate to the generator page
      setTimeout(() => {
        onContinue();
      }, 800);
    } else {
      // Show a message and reload the page after a delay
      alert('Connection terminated. The Matrix has you...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="landing-container">
      <Terminal>
        {currentMessageIndex >= 0 && (
          <TypingEffect 
            text={messages[currentMessageIndex]} 
            onComplete={handleMessageComplete}
            className="matrix-text"
            speed={50}
          />
        )}
        
        {showPrompt && (
          <UserPrompt onSubmit={handleUserResponse} />
        )}
      </Terminal>
    </div>
  );
};

export default LandingPage;