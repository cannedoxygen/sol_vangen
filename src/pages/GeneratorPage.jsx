// Vanity generator UI pageimport React, { useState } from 'react';
import Window from '../components/windows98/Window';
import Button from '../components/windows98/Button';
import TextInput from '../components/windows98/TextInput';
import ProgressBar from '../components/windows98/ProgressBar';
import MessageBox from '../components/windows98/MessageBox';
import CopyToClipboard from '../components/shared/CopyToClipboard';
import SocialShare from '../components/shared/SocialShare';
import { useGenerator } from '../context/GeneratorContext';

/**
 * Generator Page component with Windows 98 styling
 * Displays the vanity address generator interface
 */
const GeneratorPage = ({ onBack }) => {
  const { 
    prefix,
    isGenerating, 
    attempts, 
    result, 
    error, 
    wasmLoaded,
    startGeneration, 
    stopGeneration, 
    resetGenerator 
  } = useGenerator();
  
  // Local state for input field
  const [inputPrefix, setInputPrefix] = useState('');
  // State for showing the success message box
  const [showSuccessBox, setShowSuccessBox] = useState(false);
  // State for console messages
  const [consoleMessages, setConsoleMessages] = useState([
    { text: 'System initialized.', type: 'info' },
    { text: 'Ready to search for your true identity...', type: 'info' }
  ]);

  // Handle input change
  const handlePrefixChange = (e) => {
    setInputPrefix(e.target.value);
  };

  // Add a message to the console
  const addConsoleMessage = (text, type = 'info') => {
    setConsoleMessages(prev => {
      // Keep only the last 15 messages to avoid excessive scrolling
      const newMessages = [...prev, { text, type }];
      if (newMessages.length > 15) {
        return newMessages.slice(newMessages.length - 15);
      }
      return newMessages;
    });
  };

  // Start the generation process
  const handleStartGeneration = () => {
    if (!inputPrefix.trim()) {
      addConsoleMessage('Error: Please enter a valid prefix.', 'error');
      return;
    }
    
    addConsoleMessage(`Searching for address with prefix: ${inputPrefix}...`, 'info');
    // Add random matrix references
    setTimeout(() => {
      addConsoleMessage('Decoding the Matrix...', 'matrix');
    }, 800);
    
    startGeneration(inputPrefix);
  };

  // Stop the generation process
  const handleStopGeneration = () => {
    stopGeneration();
    addConsoleMessage('Search aborted by user.', 'warning');
  };

  // Handle successful generation result
  React.useEffect(() => {
    if (result) {
      addConsoleMessage(`Found matching address! The Matrix has revealed your identity.`, 'success');
      setShowSuccessBox(true);
    }
  }, [result]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      addConsoleMessage(`Error: ${error}`, 'error');
    }
  }, [error]);

  // Add periodic console messages during generation
  React.useEffect(() => {
    if (isGenerating && attempts > 0 && attempts % 500 === 0) {
      // Add random messages to make it more engaging
      const messages = [
        `Attempt #${attempts}... searching...`,
        `Still looking through ${attempts} possibilities...`,
        `The Matrix is dense today. Continuing search...`,
        `Bypassing firewall... attempt #${attempts}`,
        `Glitch detected. Recalibrating search parameters...`
      ];
      const randomIndex = Math.floor(Math.random() * messages.length);
      addConsoleMessage(messages[randomIndex], 'info');
    }
  }, [attempts, isGenerating]);

  // Close the success message box
  const closeSuccessBox = () => {
    setShowSuccessBox(false);
    resetGenerator();
    setInputPrefix('');
  };

  return (
    <div className="generator-page win98-background">
      <div className="windows98-desktop">
        {/* Main generator window */}
        <Window
          title="Vanity Address Generator"
          icon="key-icon"
          initialWidth={600}
          initialHeight={500}
          initialLeft={100}
          initialTop={50}
        >
          <div className="generator-content">
            <div className="generator-header">
              <h2 className="win98-heading">Find Your True Identity</h2>
              <p className="win98-text">Enter a prefix to generate a custom Sui wallet address.</p>
            </div>

            <div className="generator-input-group">
              <TextInput
                label="Address Prefix:"
                value={inputPrefix}
                onChange={handlePrefixChange}
                placeholder="Enter 1-6 characters"
                maxLength={6}
                disabled={isGenerating || !wasmLoaded}
              />
              
              <div className="generator-buttons">
                <Button
                  onClick={handleStartGeneration}
                  disabled={isGenerating || !wasmLoaded || !inputPrefix.trim()}
                >
                  {wasmLoaded ? 'Start Generation' : 'Loading...'}
                </Button>
                
                <Button
                  onClick={handleStopGeneration}
                  disabled={!isGenerating}
                >
                  Stop
                </Button>
              </div>
            </div>

            {isGenerating && (
              <div className="generator-progress">
                <ProgressBar animated={isGenerating} />
                <div className="attempts-counter">
                  Attempts: {attempts.toLocaleString()}
                </div>
              </div>
            )}

            {/* Console output window */}
            <div className="console-window">
              <div className="console-header">
                <span>Console Output</span>
              </div>
              <div className="console-content">
                {consoleMessages.map((msg, index) => (
                  <div key={index} className={`console-message console-${msg.type}`}>
                    &gt; {msg.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Window>

        {/* Success message box */}
        {showSuccessBox && result && (
          <MessageBox
            title="Identity Found!"
            icon="success-icon"
            onClose={closeSuccessBox}
            buttons={[{ label: 'OK', onClick: closeSuccessBox }]}
          >
            <div className="success-content">
              <h3 className="win98-heading">Welcome to your new identity</h3>
              <p className="win98-text">The Matrix has revealed your true self:</p>
              
              <div className="address-details">
                <div className="address-field">
                  <label>Address:</label>
                  <div className="address-value">
                    {result.address}
                    <CopyToClipboard text={result.address} />
                  </div>
                </div>
                
                <div className="address-field">
                  <label>Public Key:</label>
                  <div className="address-value">
                    {result.publicKey}
                    <CopyToClipboard text={result.publicKey} />
                  </div>
                </div>
                
                <div className="address-field">
                  <label>Private Key:</label>
                  <div className="address-value secret-key">
                    {result.privateKey}
                    <CopyToClipboard text={result.privateKey} />
                  </div>
                </div>
              </div>
              
              <div className="share-container">
                <SocialShare
                  text={`I've just escaped the Matrix and found my Sui Vanity Address with prefix ${prefix} at Matrix Wallet—Time to bend reality! #Sui #VanityWallet`}
                />
              </div>
            </div>
          </MessageBox>
        )}

        {/* Back button in the "taskbar" */}
        <div className="win98-taskbar">
          <Button onClick={onBack} className="taskbar-button">
            Back to Terminal
          </Button>
          
          <div className="taskbar-status">
            {wasmLoaded ? (
              <span className="status-ready">Generator Ready</span>
            ) : (
              <span className="status-loading">Loading...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage;