(function () {
  var script = document.currentScript;
  if (!script || !script.src) return;

  var root = new URL("../", script.src);
  var stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("assets/nav.css", root).href;
  document.head.appendChild(stylesheet);

  var dock = document.createElement("nav");
  dock.className = "site-dock";
  dock.setAttribute("aria-label", "Page navigation");

  function addLink(label, href) {
    var link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    dock.appendChild(link);
  }

  addLink("Home", new URL("index.html", root).href);

  var weekName = window.location.pathname
    .split("/")
    .map(function (part) {
      try { return decodeURIComponent(part); } catch { return part; }
    })
    .find(function (part) { return /^Week\s+\d+$/i.test(part); });

  if (weekName) {
    addLink("Week", new URL(encodeURIComponent(weekName) + "/index.html", root).href);
  }

  var back = document.createElement("button");
  back.type = "button";
  back.textContent = "Back";
  back.addEventListener("click", function () {
    if (window.history.length > 1) window.history.back();
    else window.location.href = new URL("index.html", root).href;
  });
  dock.appendChild(back);
  document.body.appendChild(dock);

  if (!document.querySelector("footer")) {
    var footer = document.createElement("footer");
    footer.className = "shared-site-footer";
    footer.textContent = "Created by Muhammadali Manopov · Student ID: 202537299";
    document.body.appendChild(footer);
  }
})();
