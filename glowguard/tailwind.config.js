/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gg: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d',
        },
        cream: '#fbfdf9',
        ink: '#1a2b22',
        muted: '#5b6f64',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Poppins', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        sparkle: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.25)' },
        },
      },
      animation: {
        sparkle: 'sparkle 2.6s ease-in-out infinite',
      },
      boxShadow: {
        card: '0 10px 30px rgba(20, 83, 45, .10)',
        pop: '0 18px 40px rgba(20, 83, 45, .16)',
      },
    },
  },
  plugins: [],
}
