// Twitter sharingimport React from 'react';
import Button from '../windows98/Button';

/**
 * Social share component for sharing content to social media platforms
 * 
 * Props:
 * - text: Text to share
 * - url: URL to share (defaults to current page)
 * - title: Title for the shared content
 * - platforms: Array of platforms to show buttons for
 * - className: Additional CSS classes
 */
const SocialShare = ({
  text = '',
  url = window.location.href,
  title = 'Check this out!',
  platforms = ['twitter'],
  className = ''
}) => {
  // Encode parameters for sharing
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  // Generate Twitter share URL
  const getTwitterShareUrl = () => {
    return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  };

  // Generate Facebook share URL
  const getFacebookShareUrl = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
  };

  // Handle share click
  const handleShare = (platform) => {
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = getTwitterShareUrl();
        break;
      case 'facebook':
        shareUrl = getFacebookShareUrl();
        break;
      default:
        console.warn(`Unsupported platform: ${platform}`);
        return;
    }

    // Open share dialog in a new window
    window.open(
      shareUrl,
      `Share on ${platform}`,
      'width=550,height=420,resizable=yes,scrollbars=yes'
    );

    // Play sound
    try {
      const audio = new Audio('/public/sounds/success.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {
        // Silently fail if audio cannot be played
      });
    } catch (error) {
      // Ignore audio errors
    }
  };

  // Combine classes
  const containerClasses = [
    'social-share-container',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="social-share-label">Share your discovery:</div>
      
      <div className="social-share-buttons">
        {platforms.includes('twitter') && (
          <Button
            onClick={() => handleShare('twitter')}
            className="social-share-button twitter-share"
            icon="twitter-icon"
          >
            Share on Twitter
          </Button>
        )}
        
        {platforms.includes('facebook') && (
          <Button
            onClick={() => handleShare('facebook')}
            className="social-share-button facebook-share"
            icon="facebook-icon"
          >
            Share on Facebook
          </Button>
        )}
      </div>
    </div>
  );
};

export default SocialShare;