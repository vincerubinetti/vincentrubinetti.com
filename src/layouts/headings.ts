import { sleep } from "@/util/misc";
import { slugify } from "@/util/string";

const processHeadings = async () => {
  /** wait for hydration */
  await sleep(100);
  const headings = document.querySelectorAll<HTMLAnchorElement>("h2, h3, h4");
  for (const heading of headings) {
    heading.id = slugify(heading.textContent || "");
    heading.role = "link";
    heading.tabIndex = 0;
    heading.style.cursor = "pointer";
    const nav = (event: Event) => {
      if (
        event.type === "click" ||
        (event instanceof KeyboardEvent && event.key === "Enter")
      )
        window.location.hash = `#${heading.id}`;
    };
    heading.addEventListener("click", nav);
    heading.addEventListener("keydown", nav);
  }
};

window.addEventListener("load", () => {
  processHeadings();
  new MutationObserver(processHeadings).observe(document.body, {
    childList: true,
    subtree: true,
  });
});
