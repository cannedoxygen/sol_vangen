// Main React App componentimport React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import GeneratorPage from './pages/GeneratorPage';
import { GeneratorProvider } from './context/GeneratorContext';
import './styles/global.css';
import './styles/windows98.css';
import './styles/terminal.css';

/**
 * Main application component that manages routing between pages
 * and wraps the application in the generator context provider
 */
function App() {
  // Simple state to manage which page to display
  const [currentPage, setCurrentPage] = useState('landing');

  // Function to navigate to the generator page
  const navigateToGenerator = () => {
    setCurrentPage('generator');
  };

  // Function to navigate back to landing page
  const navigateToLanding = () => {
    setCurrentPage('landing');
  };

  return (
    <GeneratorProvider>
      <div className="app-container">
        {currentPage === 'landing' ? (
          <LandingPage onContinue={navigateToGenerator} />
        ) : (
          <GeneratorPage onBack={navigateToLanding} />
        )}
      </div>
    </GeneratorProvider>
  );
}

export default App;