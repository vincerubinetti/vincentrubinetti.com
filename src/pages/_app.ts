import type { App } from "vue";
import AppSection from "@/components/AppSection.vue";
import AppButton from "@/components/AppButton.vue";
import AppFlex from "@/components/AppFlex.vue";
import VueTippy from "vue-tippy";
import "tippy.js/dist/tippy.css";

export default (app: App) => {
  app
    .use(VueTippy, {
      directive: "tippy",
      component: "tippy",
      defaultProps: {
        interactive: true,
        allowHTML: true,
        appendTo: () => document.body,
        trigger: "click mouseenter focus",
        aria: {
          content: "describedby",
        },
        // onHide: () => false,
      },
    })
    .component("AppSection", AppSection)
    .component("AppButton", AppButton)
    .component("AppFlex", AppFlex);
};
