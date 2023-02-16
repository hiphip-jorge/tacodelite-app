/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    screens: {
      'sm': '320px',
      // => @media (min-width: 320px) { ... }
      'md': '640px',
      // => @media (min-width: 640px) { ... }
      'lg': '812px',
      // => @media (min-width: 812px) { ... } 
      'xl': '1024px',
      // => @media (min-width: 1024px) { ... }
      '2xl': '1280px',
      // => @media (min-width: 1280px) { ... }
    },
    extend: {
      colors: {
        green: {
          primary: 'var(--color-primary-main)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)'
        },
        light: 'var(--color-light)',
        dark: 'var(--color-dark)'
      },
      fontFamily: {
        'primary-solid': ['acier-bat-solid', 'sans-serif'],
        'primary-gris': ['acier-bat-gris', 'sans-serif'],
        'primary-outline': ['acier-bat-outline', 'sans-serif'],
        'secondary-secular': ['Secular One', 'sans-serif']
      },
    },
  },
  plugins: [],
};
