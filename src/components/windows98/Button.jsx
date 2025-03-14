// Win98 style buttonsimport React, { useState } from 'react';

/**
 * Windows 98 style button component
 * 
 * Props:
 * - children: Button content/label
 * - onClick: Click handler function
 * - disabled: Whether the button is disabled
 * - className: Additional CSS classes
 * - type: Button type (button, submit, reset)
 * - icon: Optional icon class name
 * - active: Whether the button should appear pressed
 */
const Button = ({ 
    children, 
    onClick, 
    disabled = false, 
    className = '', 
    type = 'button',
    icon,
    active = false,
    ...props 
  }) => {
    // State to track if button is pressed
    const [isPressed, setIsPressed] = useState(false);
  
    // Handle mouse down event
    const handleMouseDown = (e) => {
      if (!disabled) {
        setIsPressed(true);
        
        // Play click sound
        try {
          const audio = new Audio('/public/sounds/click.mp3');
          audio.volume = 0.2; // Lower volume for better user experience
          audio.play().catch(err => {
            // Silently fail if audio cannot be played
            console.log('Audio not available');
          });
        } catch (error) {
          // Ignore audio errors
        }
      }
    };
  
    // Handle mouse up event
    const handleMouseUp = () => {
      if (!disabled) {
        setIsPressed(false);
      }
    };
  
    // Handle mouse leave event (in case mouse up happens outside the button)
    const handleMouseLeave = () => {
      if (isPressed) {
        setIsPressed(false);
      }
    };
  
    // Handle click event
    const handleClick = (e) => {
      if (!disabled && onClick) {
        onClick(e);
      }
    };
  
    // Combine classes based on state
    const buttonClasses = [
      'win98-button',
      className,
      disabled ? 'disabled' : '',
      isPressed || active ? 'pressed' : '',
      icon ? 'with-icon' : ''
    ].filter(Boolean).join(' ');
  
    return (
      <button
        type={type}
        className={buttonClasses}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        {...props}
      >
        {icon && <span className={`button-icon ${icon}`}></span>}
        <span className="button-text">{children}</span>
      </button>
    );
  };
  
  export default Button;