/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- This matches components AND pages
  ],
  theme: {
    extend: {
      colors: {
        'repl-bg': '#0e1117',        // Main dark background
        'repl-sidebar': '#161b22',   // Slightly lighter sidebar
        'repl-border': '#30363d',    // Borders
        'repl-green': '#238636',     // GitHub-style green button
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      }
    },
  },
  plugins: [],
}