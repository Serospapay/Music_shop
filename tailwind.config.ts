import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-instrument)", "Georgia", "serif"],
      },
      colors: {
        brand: {
          50: "#faf4ec",
          100: "#f0e4d4",
          200: "#e8c49a",
          300: "#deb882",
          400: "#d4a574",
          500: "#c4925e",
          600: "#a67848",
          700: "#7d5a38",
        },
        accent: {
          300: "#b8d9f0",
          400: "#9cc8e8",
          500: "#7eb8da",
          600: "#5a9ec4",
        },
        surface: {
          950: "#060607",
          900: "#0c0c0f",
          850: "#101014",
          800: "#16161c",
          700: "#1c1c24",
        },
      },
      boxShadow: {
        brand: "0 0 40px -8px rgba(212, 165, 116, 0.25)",
        "brand-sm": "0 0 24px -6px rgba(212, 165, 116, 0.2)",
        card: "0 18px 48px -14px rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};

export default config;
