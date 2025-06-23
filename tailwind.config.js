/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',       // App Router support
    './pages/**/*.{js,ts,jsx,tsx}',     // Pages Router support
    './components/**/*.{js,ts,jsx,tsx}',// Any shared components
  ],
  theme: {
    extend: {
        fontFamily: {
            sans: ['var(--font-inter)', 'sans-serif'],
        },
        fontSize: {
            title: '1.5rem', // 24px
            subtitle: '1.125rem', // 18px
            caption: '0.875rem', // 14px
        },
        fontWeight: {
            thin: '200',
            regular: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
        spacing: {
            '18': '4.5rem',  // now you can use p-18
            '22px': '1.375rem',
        },
    },
  },
  plugins: [],
}
