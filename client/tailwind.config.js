/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Dark Theme Colors
                dark: {
                    bg: {
                        primary: '#0a0a0a',
                        secondary: '#1a1a1a',
                        accent: '#2a2a2a',
                        hover: '#333333',
                    },
                    text: {
                        primary: '#ffffff',
                        secondary: '#a0a0a0',
                        muted: '#707070',
                    }
                },
                // Light Theme Colors
                light: {
                    bg: {
                        primary: '#ffffff',
                        secondary: '#f3f4f6',
                        accent: '#e5e7eb',
                        hover: '#d1d5db',
                    },
                    text: {
                        primary: '#1f2937',
                        secondary: '#6b7280',
                        muted: '#9ca3af',
                    }
                },
                // Accent Colors
                accent: {
                    DEFAULT: '#ef4444',
                    hover: '#dc2626',
                    light: '#fca5a5',
                },
                // Status Colors
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
                info: '#3b82f6',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 4px 20px rgba(0, 0, 0, 0.1)',
                'premium-lg': '0 10px 40px rgba(0, 0, 0, 0.15)',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-10px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
