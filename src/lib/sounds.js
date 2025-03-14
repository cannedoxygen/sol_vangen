// Sound effects management/**
 * Sound effects manager for the application
* 
* This module provides a simple API for playing sound effects
* with volume control and error handling.
*/

// Cache for preloaded audio elements
const audioCache = {};

// Default volume for all sounds (0.0 to 1.0)
let globalVolume = 0.3;

// Sound file paths
const SOUNDS = {
 SUCCESS: '/public/sounds/success.mp3',
 ERROR: '/public/sounds/error.mp3',
 CLICK: '/public/sounds/click.mp3',
 TYPING: '/public/sounds/typing.mp3',
 GLITCH: '/public/sounds/glitch.mp3',
};

/**
* Preload sounds into browser cache
* @param {Array} soundIds - Optional array of sound IDs to preload
* @returns {Promise} Promise that resolves when sounds are loaded
*/
export const preloadSounds = async (soundIds = Object.keys(SOUNDS)) => {
 const promises = soundIds.map(id => {
   return new Promise((resolve, reject) => {
     const path = SOUNDS[id];
     if (!path) {
       reject(new Error(`Unknown sound ID: ${id}`));
       return;
     }

     // Create audio element if not in cache
     if (!audioCache[id]) {
       const audio = new Audio();
       audio.preload = 'auto';
       
       // Set up event listeners
       audio.addEventListener('canplaythrough', () => resolve(id), { once: true });
       audio.addEventListener('error', (err) => reject(err), { once: true });
       
       // Start loading
       audio.src = path;
       audioCache[id] = audio;
     } else {
       // Already cached
       resolve(id);
     }
   });
 });

 try {
   await Promise.all(promises);
   return true;
 } catch (error) {
   console.warn('Failed to preload some sounds:', error);
   return false;
 }
};

/**
* Set the global volume for all sounds
* @param {number} volume - Volume level (0.0 to 1.0)
*/
export const setVolume = (volume) => {
 if (typeof volume !== 'number' || volume < 0 || volume > 1) {
   console.error('Invalid volume level. Must be between 0.0 and 1.0');
   return;
 }
 
 globalVolume = volume;
 
 // Update volume for any cached audio elements
 Object.values(audioCache).forEach(audio => {
   audio.volume = globalVolume;
 });
};

/**
* Get the current global volume
* @returns {number} Current volume (0.0 to 1.0)
*/
export const getVolume = () => {
 return globalVolume;
};

/**
* Play a sound effect
* @param {string} soundId - ID of the sound to play
* @param {Object} options - Playback options
* @param {number} options.volume - Override volume for this sound
* @param {boolean} options.loop - Whether to loop the sound
* @param {Function} options.onEnd - Callback when sound ends
* @returns {HTMLAudioElement|null} The Audio element or null if failed
*/
export const playSound = (soundId, options = {}) => {
 // Check if sound is available
 const path = SOUNDS[soundId];
 if (!path) {
   console.error(`Unknown sound ID: ${soundId}`);
   return null;
 }

 try {
   // Get volume (use override if provided)
   const volume = options.volume !== undefined ? options.volume : globalVolume;
   
   // Get or create audio element
   let audio = audioCache[soundId];
   if (!audio) {
     audio = new Audio(path);
     audioCache[soundId] = audio;
   }
   
   // Clone the audio element if it's already playing
   if (!audio.paused) {
     audio = new Audio(path);
   }
   
   // Configure audio
   audio.volume = volume;
   audio.loop = !!options.loop;
   
   if (options.onEnd && typeof options.onEnd === 'function') {
     audio.addEventListener('ended', options.onEnd, { once: true });
   }
   
   // Play the sound
   const playPromise = audio.play();
   
   // Handle play promise (required for modern browsers)
   if (playPromise !== undefined) {
     playPromise.catch(error => {
       // Auto-play was prevented or another error occurred
       console.warn(`Failed to play sound ${soundId}:`, error);
     });
   }
   
   return audio;
 } catch (error) {
   console.error(`Error playing sound ${soundId}:`, error);
   return null;
 }
};

/**
* Stop a currently playing sound
* @param {string} soundId - ID of the sound to stop
*/
export const stopSound = (soundId) => {
 const audio = audioCache[soundId];
 if (audio) {
   audio.pause();
   audio.currentTime = 0;
 }
};

/**
* Check if a sound is currently playing
* @param {string} soundId - ID of the sound to check
* @returns {boolean} True if sound is playing
*/
export const isPlaying = (soundId) => {
 const audio = audioCache[soundId];
 return audio ? !audio.paused : false;
};

/**
* Play the success sound
* @param {Object} options - Playback options
* @returns {HTMLAudioElement|null} The Audio element or null if failed
*/
export const playSuccess = (options = {}) => {
 return playSound('SUCCESS', options);
};

/**
* Play the error sound
* @param {Object} options - Playback options
* @returns {HTMLAudioElement|null} The Audio element or null if failed
*/
export const playError = (options = {}) => {
 return playSound('ERROR', options);
};

/**
* Play the click sound
* @param {Object} options - Playback options
* @returns {HTMLAudioElement|null} The Audio element or null if failed
*/
export const playClick = (options = {}) => {
 return playSound('CLICK', options);
};

/**
* Play the typing sound
* @param {Object} options - Playback options
* @returns {HTMLAudioElement|null} The Audio element or null if failed
*/
export const playTyping = (options = {}) => {
 return playSound('TYPING', options);
};

/**
* Play the glitch sound
* @param {Object} options - Playback options
* @returns {HTMLAudioElement|null} The Audio element or null if failed
*/
export const playGlitch = (options = {}) => {
 return playSound('GLITCH', options);
};

// Default export with all functions
export default {
 preloadSounds,
 setVolume,
 getVolume,
 playSound,
 stopSound,
 isPlaying,
 playSuccess,
 playError,
 playClick,
 playTyping,
 playGlitch,
 SOUNDS
};