import type { Directive } from "vue";

/** intersection listener */
const inView = new IntersectionObserver((entries, observer) => {
  console.log("hi");
  for (const { isIntersecting, target } of entries) {
    /** when element comes into view */
    if (!isIntersecting) continue;
    /** get direct children elements */
    const children = target.querySelectorAll(":scope > *");
    for (const [key, element] of Object.entries(children)) {
      if (!(element instanceof HTMLElement)) continue;
      /** don't run again */
      observer.unobserve(target);
      /** start appear */
      start(element, Number(key));
      /** cleanup appear when done */
      element.addEventListener("animationend", () => cleanup(element), {
        once: true,
      });
      /** or when reaching max fallback time */
      window.setTimeout(() => cleanup(element), 3000);
    }
  }
});

/** start appear */
const start = (element: HTMLElement, index: number) => {
  /** start animation */
  element.setAttribute("data-appear", "true");
  /** delay based on child number */
  const delay = 50 * index;
  /** account for parent appear */
  element.setAttribute("data-appear-delay", String(delay));
  const parent = element.closest("[data-appear-delay]");
  const parentDelay = Number(parent?.getAttribute("data-appear-delay")) || 0;
  /** set total delay */
  element.style.setProperty("animation-delay", parentDelay + delay + "ms");
};

/** cleanup appear */
const cleanup = (element: HTMLElement) => {
  element.removeAttribute("data-appear");
  element.style.removeProperty("animation-delay");
  /** wait for all appears to finish */
  window.setTimeout(() => element.removeAttribute("data-appear-delay"), 3000);
};

/** make element's children appear with staggered delay */
export const vAppear: Directive<HTMLElement> = {
  mounted: (element) => {
    element
      .querySelectorAll(":scope > *")
      .forEach((child) => child.setAttribute("data-appear", "false"));
    inView.observe(element);
  },
  beforeUnmount: (element) => {
    inView.unobserve(element);
  },
};
