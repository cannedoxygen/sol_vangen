// Win98 style progress barimport React, { useEffect, useState, useRef } from 'react';

/**
 * Windows 98 style progress bar component
 * 
 * Props:
 * - value: Current progress value (0-100)
 * - max: Maximum value (defaults to 100)
 * - animated: Whether to show animation for indeterminate progress
 * - striped: Whether to show striped style
 * - className: Additional CSS classes
 * - label: Optional text label to show
 * - showPercentage: Whether to show percentage text
 */
const ProgressBar = ({
    value,
    max = 100,
    animated = false,
    striped = false,
    className = '',
    label = '',
    showPercentage = false
  }) => {
    // Calculate percentage
    const percentage = value !== undefined ? Math.min(100, Math.max(0, (value / max) * 100)) : null;
    
    // State for animation position
    const [animationPos, setAnimationPos] = useState(0);
    
    // Reference to animation frame
    const animationFrameRef = useRef(null);
    
    // Handle indeterminate animation
    useEffect(() => {
      if (animated && percentage === null) {
        let position = 0;
        let direction = 1;
        
        const animate = () => {
          // Move position by 2% each frame
          position += 2 * direction;
          
          // Reverse direction at edges
          if (position >= 100) {
            direction = -1;
          } else if (position <= 0) {
            direction = 1;
          }
          
          setAnimationPos(position);
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animationFrameRef.current = requestAnimationFrame(animate);
        
        return () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        };
      }
    }, [animated, percentage]);
    
    // Animation for determinate progress
    useEffect(() => {
      if (animated && percentage !== null) {
        const blocks = 5;
        let blockPos = 0;
        
        const animate = () => {
          blockPos = (blockPos + 1) % blocks;
          setAnimationPos(blockPos);
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animationFrameRef.current = requestAnimationFrame(animate);
        
        return () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        };
      }
    }, [animated, percentage]);
    
    // Combine classes
    const progressClasses = [
      'win98-progress',
      className,
      animated ? 'animated' : '',
      striped ? 'striped' : '',
      percentage === null ? 'indeterminate' : ''
    ].filter(Boolean).join(' ');
    
    // Styles for progress bar
    const progressStyle = percentage !== null
      ? { width: `${percentage}%` }
      : animated
        ? { width: '30%', left: `${animationPos}%` }
        : { width: '100%' };
    
    return (
      <div className="win98-progress-container">
        {label && <div className="win98-progress-label">{label}</div>}
        
        <div className={progressClasses}>
          {/* Track (background) */}
          <div className="win98-progress-track">
            {/* Bar (filled portion) */}
            <div
              className="win98-progress-bar"
              style={progressStyle}
              role="progressbar"
              aria-valuenow={percentage !== null ? Math.round(percentage) : undefined}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {/* Animated blocks for Windows 98 effect */}
              {animated && (
                <div className="win98-progress-blocks">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="win98-progress-block"
                      style={{
                        opacity: (i + animationPos) % 4 === 0 ? 1 : 0.7
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showPercentage && percentage !== null && (
          <div className="win98-progress-percentage">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  };
  
  export default ProgressBar;