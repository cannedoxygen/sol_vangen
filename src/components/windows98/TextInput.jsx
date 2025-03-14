// Win98 style input fieldsimport React, { useState, useRef } from 'react';

/**
 * Windows 98 style text input component
 * 
 * Props:
 * - label: Input label
 * - value: Input value
 * - onChange: Change handler function
 * - placeholder: Placeholder text
 * - disabled: Whether the input is disabled
 * - className: Additional CSS classes
 * - error: Error message to display
 * - type: Input type (text, password, etc.)
 * - maxLength: Maximum input length
 * - id: Input ID (generated if not provided)
 * - required: Whether the input is required
 */
const TextInput = ({
    label,
    value,
    onChange,
    placeholder = '',
    disabled = false,
    className = '',
    error = '',
    type = 'text',
    maxLength,
    id,
    required = false,
    ...props
  }) => {
    // Generate a unique ID if not provided
    const uniqueId = useRef(`win98-input-${Math.random().toString(36).substr(2, 9)}`);
    const inputId = id || uniqueId.current;
    
    // State to track focus
    const [isFocused, setIsFocused] = useState(false);
  
    // Handle focus event
    const handleFocus = (e) => {
      setIsFocused(true);
      
      // If there's an onFocus prop, call it
      if (props.onFocus) {
        props.onFocus(e);
      }
    };
  
    // Handle blur event
    const handleBlur = (e) => {
      setIsFocused(false);
      
      // If there's an onBlur prop, call it
      if (props.onBlur) {
        props.onBlur(e);
      }
    };
  
    // Handle change event
    const handleChange = (e) => {
      if (onChange) {
        onChange(e);
      }
    };
  
    // Combine classes based on state
    const inputContainerClasses = [
      'win98-input-container',
      className,
      disabled ? 'disabled' : '',
      isFocused ? 'focused' : '',
      error ? 'has-error' : ''
    ].filter(Boolean).join(' ');
  
    return (
      <div className={inputContainerClasses}>
        {label && (
          <label htmlFor={inputId} className="win98-input-label">
            {label}
            {required && <span className="required-indicator"> *</span>}
          </label>
        )}
        
        <div className="win98-input-field">
          <input
            id={inputId}
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            required={required}
            className="win98-input"
            {...props}
          />
        </div>
        
        {error && <div className="win98-input-error">{error}</div>}
      </div>
    );
  };
  
  export default TextInput;