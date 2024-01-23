/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        system: "#EBEBEB",
        secondary: "#9699A3"
      },
      borderWidth: {
        px: "1px",
      },
      borderColor: {
        primary: "#6E6E6E",
      },
      textColor: {
        primary: "#000",
        secondary: "#737884",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
