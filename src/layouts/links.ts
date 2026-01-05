const processLinks = async () => {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    "a[href]:not([target])",
  );
  for (const link of links) {
    const href = link.getAttribute("href");
    if (!href) continue;
    /** make all external links open in a new tab */
    if (href.match(/^https?/)) link.setAttribute("target", "_blank");
    /** disable links that point to the current page */
    if (
      new URL(href, window.location.href).href ===
      window.location.href.replace(/\/$/, "")
    )
      link.removeAttribute("href");
  }
};

window.addEventListener("astro:page-load", () => {
  processLinks();
  new MutationObserver(processLinks).observe(document.body, {
    childList: true,
    subtree: true,
  });
});
