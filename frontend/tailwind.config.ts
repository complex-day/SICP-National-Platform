import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d8eeff",
          200: "#b9e1ff",
          300: "#89ceff",
          400: "#52b1ff",
          500: "#2b90ff",
          600: "#136ef5",
          700: "#0d55e1",
          800: "#1145b5",
          900: "#143d8f",
          950: "#112657",
        },
      },
    },
  },
  plugins: [],
};
export default config;
