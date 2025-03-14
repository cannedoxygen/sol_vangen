// React DOM rendering entry pointimport React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

/**
 * Application entry point
 * Renders the main App component to the DOM
 */

// Preload essential sounds and assets
const preloadAssets = async () => {
  try {
    // Import sound manager
    const { preloadSounds } = await import('./lib/sounds');
    
    // Preload essential sounds
    await preloadSounds(['SUCCESS', 'ERROR', 'CLICK']);
  } catch (error) {
    console.warn('Failed to preload some assets:', error);
    // Continue anyway - app can still function
  }
};

// Initialize WASM module
const initializeWasm = async () => {
  try {
    const { initializeWasm } = await import('./lib/vanityGenerator');
    await initializeWasm();
  } catch (error) {
    console.error('Failed to initialize WASM module:', error);
    // App will handle this error in the UI
  }
};

// Create root element if it doesn't exist
const rootElement = document.getElementById('root') || (() => {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  return root;
})();

// Create React root
const root = ReactDOM.createRoot(rootElement);

// Render the application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize assets and modules
Promise.all([
  preloadAssets(),
  initializeWasm()
]).catch(error => {
  console.error('Initialization error:', error);
});

// Log application start
console.log('Matrix Vanity Generator initialized');