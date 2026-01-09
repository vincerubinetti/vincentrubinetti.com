import { sleep } from "@/util/misc";

const processTitles = async () => {
  /** wait for hydration */
  await sleep(100);
  const titles = document.querySelectorAll<HTMLAnchorElement>("[title]");
  for (const title of titles)
    title.setAttribute("aria-label", title.getAttribute("title") || "");
};

window.addEventListener("load", () => {
  processTitles();
  new MutationObserver(processTitles).observe(document.body, {
    childList: true,
    subtree: true,
  });
});
