const aspectRatio = require("@tailwindcss/aspect-ratio");

module.exports = {
  content: ["*.md", "*.html", "_includes/*.html", "_data/*.yaml"],
  safelist: ["tippy-box", "tippy-content", "tippy-arrow"],
  theme: {
    extend: {
      variants: {
        sm: "400px",
        md: "600px",
        lg: "800px",
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
