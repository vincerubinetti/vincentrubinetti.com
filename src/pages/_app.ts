import type { App } from "vue";
import VueTippy from "vue-tippy";
import AppSection from "@/components/AppSection.vue";
import AppButton from "@/components/AppButton.vue";
import { vAppear } from "@/global/directives";

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
    .directive("appear", vAppear)
    .component("AppSection", AppSection)
    .component("AppButton", AppButton);
};
