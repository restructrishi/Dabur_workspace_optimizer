/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dabur-gold': '#D1A272',
                'dabur-light-gold': '#f5d7a8',
                'dabur-burgundy': '#8B1538',
                'dabur-coral': '#c97a5f',
            },
            animation: {
                'gradient-shift': 'gradient-shift 15s ease infinite',
                'float': 'float 8s ease-in-out infinite',
            },
            keyframes: {
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(5deg)' },
                },
            },
        },
    },
    plugins: [],
}
