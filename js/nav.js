(function () {
  var body = document.body;
  var btn = document.querySelector(".tl-nav-toggle");
  var nav = document.querySelector(".tl-nav");
  var drops = Array.prototype.slice.call(document.querySelectorAll(".tl-nav__drop"));
  var mobile = window.matchMedia("(max-width: 768px)");
  var fingerprintRoot = document.querySelector("[data-fingerprint-root]");
  var fingerprintItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-fingerprint-state]")
  );

  function syncNavState() {
    if (!btn || !nav) return;
    var isOpen = body.classList.contains("tl-nav-open");
    nav.classList.toggle("open", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
  }

  function closeNav() {
    body.classList.remove("tl-nav-open");
    drops.forEach(function (drop) {
      drop.classList.remove("active");
    });
    syncNavState();
  }

  function flashElement(target) {
    if (!target) return;
    target.classList.remove("is-spotlit");
    void target.offsetWidth;
    target.classList.add("is-spotlit");
    window.setTimeout(function () {
      target.classList.remove("is-spotlit");
    }, 1400);
  }

  function scrollToTarget(target) {
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    flashElement(target);
  }

  function activateFingerprint(state, options) {
    if (!fingerprintRoot || !state) return false;

    fingerprintRoot.setAttribute("data-active", state);
    fingerprintItems.forEach(function (item) {
      var active = item.getAttribute("data-fingerprint-state") === state;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    if (!options || options.scroll !== false) {
      scrollToTarget(document.getElementById("fingerprints") || fingerprintRoot);
    } else {
      flashElement(fingerprintRoot);
    }

    return true;
  }

  function resolveFocusTarget(targetName) {
    if (!targetName) return false;

    if (fingerprintRoot && document.querySelector('[data-fingerprint-state="' + targetName + '"]')) {
      return activateFingerprint(targetName);
    }

    var directTarget = document.getElementById(targetName);
    if (directTarget) {
      scrollToTarget(directTarget);
      return true;
    }

    return false;
  }

  function triggerAction(target) {
    if (!target) return;

    var focusTarget = target.getAttribute("data-focus-target");
    if (focusTarget && resolveFocusTarget(focusTarget)) {
      return;
    }

    var href = target.getAttribute("data-href");
    if (!href) return;

    var external = target.getAttribute("data-external") === "true" || /^https?:/i.test(href);
    if (external) {
      window.open(href, "_blank", "noopener");
      return;
    }

    window.location.href = href;
  }

  function initInteractiveTargets() {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll("[data-href], [data-focus-target]")
    );

    targets.forEach(function (target) {
      if (!target.hasAttribute("tabindex") && target.tagName !== "A" && target.tagName !== "BUTTON") {
        target.tabIndex = 0;
      }

      target.classList.add("tl-actionable");

      target.addEventListener("click", function (event) {
        var nestedAction = event.target.closest("a, button");
        if (nestedAction && nestedAction !== target) return;
        triggerAction(target);
      });

      target.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        triggerAction(target);
      });
    });
  }

  function initAccordions() {
    Array.prototype.slice.call(document.querySelectorAll("[data-accordion]")).forEach(function (section) {
      var toggle = section.querySelector("[data-accordion-toggle]");
      var panel = section.querySelector("[data-accordion-body]");
      if (!toggle || !panel) return;

      function setOpen(open) {
        section.setAttribute("data-open", open ? "true" : "false");
        section.classList.toggle("is-collapsed", !open);
        toggle.setAttribute("aria-expanded", String(open));
        panel.hidden = !open;
      }

      toggle.addEventListener("click", function () {
        setOpen(section.getAttribute("data-open") !== "true");
      });

      setOpen(section.getAttribute("data-open") !== "false");
    });
  }

  function syncHashTarget() {
    if (!window.location.hash) return;
    var target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;

    var accordion = target.matches("[data-accordion]") ? target : target.closest("[data-accordion]");
    if (accordion) {
      accordion.setAttribute("data-open", "true");
      accordion.classList.remove("is-collapsed");
      var toggle = accordion.querySelector("[data-accordion-toggle]");
      var panel = accordion.querySelector("[data-accordion-body]");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
      if (panel) panel.hidden = false;
    }

    window.setTimeout(function () {
      scrollToTarget(target);
    }, 120);
  }

  if (btn && nav) {
    btn.addEventListener("click", function () {
      body.classList.toggle("tl-nav-open");
      syncNavState();
    });

    drops.forEach(function (drop) {
      var trigger = drop.querySelector(".tl-nav__item");
      var panel = drop.querySelector(".tl-nav__drop-panel");
      if (!trigger || !panel) return;

      trigger.addEventListener("click", function (event) {
        if (!mobile.matches) return;

        event.preventDefault();

        var shouldOpen = !drop.classList.contains("active");
        drops.forEach(function (item) {
          item.classList.remove("active");
        });

        if (shouldOpen) {
          drop.classList.add("active");
        }
      });
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (mobile.matches && !link.closest(".tl-nav__drop")) {
          closeNav();
        }
      });
    });

    window.addEventListener("resize", function () {
      if (!mobile.matches) {
        closeNav();
      }
    });

    syncNavState();
  }

  fingerprintItems.forEach(function (item) {
    item.addEventListener("click", function () {
      activateFingerprint(item.getAttribute("data-fingerprint-state"), { scroll: false });
    });
  });

  initInteractiveTargets();
  initAccordions();

  if (document.readyState === "complete") {
    syncHashTarget();
  } else {
    window.addEventListener("load", syncHashTarget);
  }
})();
