// Draggable window componentimport React, { useState, useRef, useEffect } from 'react';

/**
 * Windows 98 style draggable window component
 * 
 * Props:
 * - title: Window title
 * - icon: Optional icon class
 * - children: Window content
 * - initialWidth: Initial window width in pixels
 * - initialHeight: Initial window height in pixels
 * - initialLeft: Initial window left position
 * - initialTop: Initial window top position
 * - onClose: Optional callback when close button is clicked
 * - onMinimize: Optional callback when minimize button is clicked
 */
const Window = ({ 
    title = 'Window',
    icon,
    children,
    initialWidth = 400,
    initialHeight = 300,
    initialLeft = 50,
    initialTop = 50,
    onClose,
    onMinimize
  }) => {
    // State for window position
    const [position, setPosition] = useState({ x: initialLeft, y: initialTop });
    // State for window size
    const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
    // State for drag status
    const [isDragging, setIsDragging] = useState(false);
    // State for window maximized status
    const [isMaximized, setIsMaximized] = useState(false);
    // Previous size and position before maximizing
    const prevState = useRef({ position: null, size: null });
    // Reference to the window element
    const windowRef = useRef(null);
    // Drag offset
    const dragOffset = useRef({ x: 0, y: 0 });
  
    // Handle drag start
    const handleMouseDown = (e) => {
      // Only handle drag from title bar
      if (e.target.closest('.window-title-bar')) {
        setIsDragging(true);
        dragOffset.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y
        };
        
        // Add the grabbing cursor
        document.body.style.cursor = 'grabbing';
        // Prevent text selection during drag
        e.preventDefault();
      }
    };
  
    // Handle dragging
    const handleMouseMove = (e) => {
      if (isDragging && !isMaximized) {
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        
        // Set new position
        setPosition({
          x: newX,
          y: Math.max(0, newY) // Prevent dragging window above the top edge
        });
      }
    };
  
    // Handle drag end
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };
  
    // Handle window maximize toggle
    const handleMaximize = () => {
      if (isMaximized) {
        // Restore previous size and position
        setIsMaximized(false);
        setSize(prevState.current.size);
        setPosition(prevState.current.position);
      } else {
        // Save current size and position
        prevState.current = {
          size: { ...size },
          position: { ...position }
        };
        
        // Maximize the window
        setIsMaximized(true);
        setPosition({ x: 0, y: 0 });
        setSize({
          width: window.innerWidth,
          height: window.innerHeight - 30 // Leave space for taskbar
        });
      }
    };
  
    // Handle window close
    const handleClose = () => {
      if (onClose) {
        onClose();
      }
    };
  
    // Handle window minimize
    const handleMinimize = () => {
      if (onMinimize) {
        onMinimize();
      }
    };
  
    // Add global mouse event listeners for dragging
    useEffect(() => {
      const handleGlobalMouseMove = (e) => {
        handleMouseMove(e);
      };
      
      const handleGlobalMouseUp = () => {
        handleMouseUp();
      };
      
      if (isDragging) {
        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);
      }
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }, [isDragging]);
  
    // Window styles based on state
    const windowStyle = isMaximized
      ? {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: `calc(100% - 30px)`, // Leave space for taskbar
          zIndex: 10
        }
      : {
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          zIndex: 10
        };
  
    return (
      <div 
        className={`win98-window ${isMaximized ? 'maximized' : ''}`}
        style={windowStyle}
        ref={windowRef}
        onMouseDown={handleMouseDown}
      >
        {/* Window title bar */}
        <div className={`window-title-bar ${isDragging ? 'dragging' : ''}`}>
          {icon && <span className={`window-icon ${icon}`}></span>}
          <div className="window-title">{title}</div>
          
          <div className="window-controls">
            <button 
              className="window-control window-minimize"
              onClick={handleMinimize}
              aria-label="Minimize"
            >
              _
            </button>
            
            <button
              className="window-control window-maximize"
              onClick={handleMaximize}
              aria-label="Maximize"
            >
              □
            </button>
            
            <button
              className="window-control window-close"
              onClick={handleClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Window content */}
        <div className="window-content">
          {children}
        </div>
        
        {/* Resizers */}
        {!isMaximized && (
          <>
            <div className="window-resizer window-resizer-right"></div>
            <div className="window-resizer window-resizer-bottom"></div>
            <div className="window-resizer window-resizer-corner"></div>
          </>
        )}
      </div>
    );
  };
  
  export default Window;