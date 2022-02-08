const aspectRatio = require("@tailwindcss/aspect-ratio");

module.exports = {
  content: ["*.md", "*.html", "_includes/*.html", "_data/*.yaml"],
  safelist: ["tippy-box", "tippy-content", "tippy-arrow"],
  theme: {
    extend: {
      screens: {
        sm: "440px",
        md: "640px",
        lg: "840px",
        xl: "1040px"
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
      letterSpacing: {
        wide: "0.1em",
        wider: "0.2em",
        widest: "0.3em",
      },
      transitionProperty: {
        default:
          "opacity, color, background-color, border-color, transform, box-shadow",
      },
    },
  },
  plugins: [aspectRatio],
};
