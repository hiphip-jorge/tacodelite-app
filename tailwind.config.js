/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            borderRadius: {
                bubbly: '1.5rem',
                'bubbly-md': '1.75rem',
                'bubbly-lg': '2rem',
                'bubbly-xl': '2.5rem',
            },
            fontFamily: {
                acier: ['acier-bat-grotesque', 'sans-serif'],
                secular: ['Secular One', 'sans-serif'],
            },
            colors: {
                taco: {
                    yellow: {
                        50: '#fefce8',
                        100: '#fef9c3',
                        200: '#fef08a',
                        300: '#fde047',
                        400: '#facc15',
                        500: '#eab308',
                        600: '#ca8a04',
                        700: '#a16207',
                        800: '#854d0e',
                        900: '#713f12',
                    },
                    blue: {
                        50: '#eff6ff',
                        100: '#dbeafe',
                        200: '#bfdbfe',
                        300: '#93c5fd',
                        400: '#60a5fa',
                        500: '#3b82f6',
                        600: '#2563eb',
                        700: '#1d4ed8',
                        800: '#1e40af',
                        900: '#1e3a8a',
                    },
                    green: {
                        50: '#ecfdf5',
                        100: '#d1fae5',
                        200: '#a7f3d0',
                        300: '#6ee7b7',
                        400: '#34d399',
                        500: '#10b981',
                        600: '#059669',
                        700: '#047857',
                        800: '#065f46',
                        900: '#064e3b',
                    },
                },
            },
        },
    },
    plugins: [],
};
