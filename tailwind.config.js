/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        background: {
          DEFAULT: '#1a1b23',
          secondary: '#2a2d3a',
        },
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        accent: {
          DEFAULT: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
};
