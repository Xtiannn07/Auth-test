import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'fb-left': '#e7f3ff',   // Pale lavender-blue
        'fb-mid': '#f0f2f5',    // Neutral midpoint
        'fb-right': '#f5f6f7',  // Warm white-gray
      },
      animation: {
        bounce: 'bounce 1.5s infinite ease-in-out'
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-1rem)' }
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
