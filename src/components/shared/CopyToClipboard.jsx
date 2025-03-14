// Clipboard copying utilityimport React, { useState, useEffect } from 'react';

/**
 * Copy to clipboard button component
 * 
 * Props:
 * - text: Text to copy to clipboard
 * - successMessage: Message to show after successful copy
 * - className: Additional CSS classes
 * - buttonText: Text to show on the button (default is 'Copy')
 * - showFeedback: Whether to show feedback after copying
 * - feedbackDuration: Duration in ms to show feedback
 */
const CopyToClipboard = ({
    text,
    successMessage = 'Copied!',
    className = '',
    buttonText = 'Copy',
    showFeedback = true,
    feedbackDuration = 2000
  }) => {
    // State to track if text was copied
    const [copied, setCopied] = useState(false);
    
    // Reset copied state after duration
    useEffect(() => {
      if (copied && showFeedback) {
        const timer = setTimeout(() => {
          setCopied(false);
        }, feedbackDuration);
        
        return () => clearTimeout(timer);
      }
    }, [copied, showFeedback, feedbackDuration]);
    
    // Handle copy click
    const handleCopy = async () => {
      try {
        // Use clipboard API to copy text
        await navigator.clipboard.writeText(text);
        
        // Update state to show feedback
        setCopied(true);
        
        // Play success sound
        try {
          const audio = new Audio('/public/sounds/success.mp3');
          audio.volume = 0.2;
          audio.play().catch(() => {
            // Silently fail if audio cannot be played
          });
        } catch (error) {
          // Ignore audio errors
        }
      } catch (err) {
        console.error('Failed to copy text:', err);
        
        // Fallback copy method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
          } else {
            console.error('Fallback copy failed');
          }
        } catch (err) {
          console.error('Fallback copy error:', err);
        }
        
        document.body.removeChild(textArea);
      }
    };
    
    // Combine classes
    const buttonClasses = [
      'copy-button',
      className,
      copied ? 'copied' : ''
    ].filter(Boolean).join(' ');
    
    return (
      <button
        className={buttonClasses}
        onClick={handleCopy}
        title="Copy to clipboard"
        aria-label={`Copy ${text} to clipboard`}
      >
        {copied && showFeedback ? (
          <span className="copy-feedback">
            {successMessage}
          </span>
        ) : (
          <span className="copy-text">
            {buttonText}
          </span>
        )}
      </button>
    );
  };
  
  export default CopyToClipboard;