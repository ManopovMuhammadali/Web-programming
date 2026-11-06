(function () {
  const script = document.currentScript;
  if (!script || !script.src) return;

  // The folder is named "assests" in this repository.
  const root = new URL("../", script.src);

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("assests/nav.css", root).href;
  document.head.appendChild(stylesheet);

  const dock = document.createElement("nav");
  dock.className = "site-dock";
  dock.setAttribute("aria-label", "Page navigation");

  function addLink(label, href) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    dock.appendChild(link);
  }

  addLink("Home", new URL("index.html", root).href);

  const weekName = location.pathname
    .split("/")
    .map(part => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    })
    .find(part => /^Week\s+\d+$/i.test(part));

  if (weekName) {
    addLink(
      "Week",
      new URL(encodeURIComponent(weekName) + "/index.html", root).href
    );
  }

  const back = document.createElement("button");
  back.type = "button";
  back.textContent = "Back";

  back.addEventListener("click", () => {
    if (history.length > 1) {
      history.back();
    } else {
      location.href = new URL("index.html", root).href;
    }
  });

  dock.appendChild(back);
  document.body.appendChild(dock);

  if (!document.querySelector("footer")) {
    const footer = document.createElement("footer");
    footer.className = "shared-site-footer";
    footer.textContent = "Created by Muhammadali Manopov";
    document.body.appendChild(footer);
  }
})();
