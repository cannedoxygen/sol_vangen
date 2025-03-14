// Tailwind configuration/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Matrix theme colors
          matrix: {
            black: '#000000',
            green: '#33ff33',
            darkGreen: '#003300',
            lightGreen: '#7fff7f',
            text: '#ccffcc',
            glow: '#88ff88',
          },
          // Windows 98 theme colors
          win98: {
            bg: '#c0c0c0',
            text: '#000000',
            borderLight: '#ffffff',
            borderDark: '#808080',
            borderDarker: '#404040',
            buttonFace: '#c0c0c0',
            titleActive: '#000080',
            titleText: '#ffffff',
            blue: '#000080',
            desktop: '#008080',
          },
        },
        fontFamily: {
          // Matrix style font
          matrix: ['Courier New', 'monospace'],
          // Windows 98 style fonts
          win98: ['MS Sans Serif', 'Tahoma', 'sans-serif'],
          win98Bold: ['MS Sans Serif Bold', 'Tahoma', 'sans-serif'],
        },
        boxShadow: {
          // Windows 98 style shadows
          'win98-out': '2px 2px 0 #404040, -2px -2px 0 #ffffff',
          'win98-in': 'inset 2px 2px 0 #404040, inset -2px -2px 0 #ffffff',
          'win98-button': '1px 1px 0 #ffffff, -1px -1px 0 #808080, 1px 1px 0 #c0c0c0 inset, -1px -1px 0 #c0c0c0 inset',
          'win98-button-pressed': '1px 1px 0 #808080, -1px -1px 0 #ffffff, 1px 1px 0 #c0c0c0 inset, -1px -1px 0 #c0c0c0 inset',
        },
        animation: {
          'blink': 'blink 1s step-end infinite',
          'blink-slow': 'blink 2s step-end infinite',
          'matrix-glow': 'matrix-glow 2s ease-in-out infinite',
          'win98-progress': 'win98-progress 2s infinite',
          'glitch': 'glitch 0.3s ease-in-out',
        },
        keyframes: {
          blink: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0' },
          },
          'matrix-glow': {
            '0%, 100%': { textShadow: '0 0 5px rgba(51, 255, 51, 0.7)' },
            '50%': { textShadow: '0 0 15px rgba(51, 255, 51, 0.9), 0 0 20px rgba(51, 255, 51, 0.4)' },
          },
          'win98-progress': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '30px 0' },
          },
          glitch: {
            '0%, 100%': { transform: 'translateX(0)' },
            '20%': { transform: 'translateX(-2px)' },
            '40%': { transform: 'translateX(2px)' },
            '60%': { transform: 'translateX(-1px)' },
            '80%': { transform: 'translateX(1px)' },
          },
        },
        backgroundImage: {
          'win98-stripes': 'linear-gradient(45deg, #000080 25%, transparent 25%, transparent 50%, #000080 50%, #000080 75%, transparent 75%, transparent)',
          'win98-desktop': 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAIElEQVQoU2NkYGD4z4AAVK8PAhiZGBgYobL4FZBsAQBzDQgGvEcAkwAAAABJRU5ErkJggg==")',
        },
        backgroundSize: {
          'win98-stripes': '30px 30px',
        },
        spacing: {
          'win98-border': '2px',
        },
      },
    },
    plugins: [],
  }