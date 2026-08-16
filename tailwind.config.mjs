/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E63946',
          navy: '#374364',
          'navy-light': '#CFD8EE',
        },
        ink: {
          dark: '#1D1D1D',
          light: '#ECECEC',
        },
        success: '#4caf50',
        error: '#f44336',
      },
    },
  },
  plugins: [],
};
