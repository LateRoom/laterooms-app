/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'midnight': {
          DEFAULT: '#0a0a12',
          50: '#12121f',
          100: '#1a1a2a',
          200: '#252535',
        },
        'gold': {
          DEFAULT: '#D9A441',
          light: '#F4D03F',
          dark: '#c4922f',
        },
        'purple': {
          secret: '#8A2BE2',
          light: '#DA70D6',
        }
      },
      fontFamily: {
        'display': ['Georgia', 'serif'],
        'body': ['Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
