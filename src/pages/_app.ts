import type { App } from "vue";
import VueTippy from "vue-tippy";
import "tippy.js/dist/tippy.css";

export default (app: App) => {
  app.use(VueTippy, {
    directive: "tippy",
    component: "tippy",
    defaultProps: {
      interactive: true,
      allowHTML: true,
      // onHide: () => false,
    },
  });
};
