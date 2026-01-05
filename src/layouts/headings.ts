import { slugify } from "@/util/string";

const processHeadings = async () => {
  const headings = document.querySelectorAll<HTMLAnchorElement>("h2, h3, h4");
  for (const heading of headings) {
    /** make headings into links */
    let link: HTMLAnchorElement;
    const parent = heading.parentElement;
    if (parent instanceof HTMLAnchorElement) link = parent;
    else {
      link = document.createElement("a");
      link.style.display = "contents";
      heading.replaceWith(link);
      link.append(heading);
    }
    const id = slugify(heading.textContent || "");
    heading.id = id;
    link.href = `#${id}`;
  }
};

window.addEventListener("astro:page-load", () => {
  processHeadings();
  new MutationObserver(processHeadings).observe(document.body, {
    childList: true,
    subtree: true,
  });
});
