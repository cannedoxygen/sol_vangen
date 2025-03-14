// Terminal effect componentimport React, { useEffect, useRef } from 'react';

/**
 * Terminal component that provides a retro command-line interface look
 * with Matrix-inspired styling
 */
const Terminal = ({ children }) => {
    const terminalRef = useRef(null);
    
    // Effect to scroll to bottom of terminal whenever content changes
    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, [children]);
    
    // Effect to add cursor blink animation
    useEffect(() => {
      // Add occasional "glitch" effects to the terminal
      const glitchInterval = setInterval(() => {
        if (Math.random() > 0.95) { // 5% chance of glitch
          const terminal = terminalRef.current;
          if (terminal) {
            // Apply a quick flicker effect
            terminal.classList.add('terminal-glitch');
            setTimeout(() => {
              terminal.classList.remove('terminal-glitch');
            }, 150);
          }
        }
      }, 2000);
      
      return () => clearInterval(glitchInterval);
    }, []);
    
    return (
      <div className="terminal-container">
        <div className="terminal-header">
          <div className="terminal-title">ANON'S TERMINAL</div>
          <div className="terminal-controls">
            <div className="terminal-control terminal-minimize"></div>
            <div className="terminal-control terminal-maximize"></div>
            <div className="terminal-control terminal-close"></div>
          </div>
        </div>
        
        <div 
          ref={terminalRef}
          className="terminal-content"
        >
          <div className="terminal-output">
            {/* Matrix-style boot sequence text */}
            <div className="terminal-boot-sequence">
              <p>SYSTEM INITIALIZED...</p>
              <p>ESTABLISHING SECURE CONNECTION...</p>
              <p>BYPASSING SURVEILLANCE PROTOCOLS...</p>
              <p>CONNECTED TO THE MATRIX</p>
              <p>===============================</p>
            </div>
            
            {/* Rendered children (messages and user input) */}
            {children}
            
            {/* Blinking cursor */}
            <span className="terminal-cursor">_</span>
          </div>
        </div>
      </div>
    );
  };
  
  export default Terminal;