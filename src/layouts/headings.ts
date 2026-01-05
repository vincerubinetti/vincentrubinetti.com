import { slugify } from "@/util/string";

const processHeadings = () => {
  const headings = document.querySelectorAll<HTMLAnchorElement>("h2,h3,h4");
  for (const heading of headings) {
    /** make headings into links */
    if (heading.parentElement?.tagName === "A") continue;
    const id = slugify(heading.textContent || "");
    heading.id = id;
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.style.display = "contents";
    heading.replaceWith(link);
    link.append(heading);
  }
};

window.addEventListener("load", () => {
  processHeadings();
  new MutationObserver(processHeadings).observe(document.body, {
    childList: true,
    subtree: true,
  });
});
