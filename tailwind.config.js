const colors = require("tailwindcss/colors");
const aspectRatio = require("@tailwindcss/aspect-ratio");

module.exports = {
  purge: ["*.md", "*.html", "_includes/*.html", "_data/*.yaml"],
  darkMode: false,
  theme: {
    extend: {
      screens: {
        sm: "400px",
        md: "600px",
        lg: "800px",
        xl: "1000px",
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
        default: "opacity, color, background-color, border-color, transform",
      },
    },
    colors,
  },
  variants: {
    extend: {
      textColor: ["group-hover"],
    },
  },
  plugins: [aspectRatio],
};
