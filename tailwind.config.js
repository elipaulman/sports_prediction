/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF8B00',    // March Madness orange
        secondary: '#0B2546',  // Deep blue
        accent: '#36B37E',     // Victory green
        alert: '#FF5630',      // Upset red
        neutral: '#8C6B4F',    // Basketball brown
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
        special: ['Graduate', 'serif'],
      },
    },
  },
  plugins: [],
} 