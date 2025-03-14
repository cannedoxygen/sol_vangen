// Win98 style popupsimport React, { useEffect, useState } from 'react';
import Button from './Button';

/**
 * Windows 98 style message box dialog component
 * 
 * Props:
 * - title: Dialog title
 * - icon: Optional icon type ('info', 'warning', 'error', 'success', 'question')
 * - children: Dialog content
 * - buttons: Array of button configurations { label, onClick, primary }
 * - onClose: Callback when dialog is closed
 * - type: Message box type ('info', 'warning', 'error', 'success', 'question')
 * - autoClose: Time in ms to auto-close (0 to disable)
 */
const MessageBox = ({
  title = 'Message',
  icon,
  children,
  buttons = [{ label: 'OK' }],
  onClose,
  type = 'info',
  autoClose = 0
}) => {
  // State to track if dialog is open
  const [isOpen, setIsOpen] = useState(true);
  // State to track auto-close timer
  const [timeLeft, setTimeLeft] = useState(autoClose);

  // Determine icon class based on type or explicit icon prop
  const iconClass = icon || type;

  // Auto-close timer effect
  useEffect(() => {
    if (autoClose > 0 && isOpen) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            clearInterval(timer);
            handleClose();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoClose, isOpen]);

  // Handle dialog close
  const handleClose = () => {
    setIsOpen(false);
    
    // Play close sound
    try {
      const audio = new Audio('/public/sounds/error.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {
        // Silently fail if audio cannot be played
      });
    } catch (error) {
      // Ignore audio errors
    }
    
    if (onClose) {
      onClose();
    }
  };

  // Handle button click
  const handleButtonClick = (button) => {
    if (button.onClick) {
      button.onClick();
    } else {
      handleClose();
    }
  };

  // If dialog is closed, don't render anything
  if (!isOpen) {
    return null;
  }

  return (
    <div className="win98-message-box-overlay">
      <div className="win98-message-box">
        {/* Message box title bar */}
        <div className="message-box-title-bar">
          <div className="message-box-title">{title}</div>
          <button 
            className="message-box-close"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        {/* Message box content */}
        <div className="message-box-content">
          {/* Icon */}
          {iconClass && (
            <div className={`message-box-icon message-box-icon-${iconClass}`}>
              {/* Icon character based on type */}
              {type === 'error' && '✕'}
              {type === 'warning' && '⚠'}
              {type === 'info' && 'i'}
              {type === 'success' && '✓'}
              {type === 'question' && '?'}
            </div>
          )}
          
          {/* Message */}
          <div className="message-box-message">
            {children}
            
            {/* Auto-close indicator */}
            {autoClose > 0 && timeLeft > 0 && (
              <div className="message-box-auto-close">
                Closing in {Math.ceil(timeLeft / 1000)} seconds...
              </div>
            )}
          </div>
        </div>
        
        {/* Buttons */}
        <div className="message-box-buttons">
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={() => handleButtonClick(button)}
              className={`message-box-button ${button.primary ? 'primary' : ''}`}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageBox;