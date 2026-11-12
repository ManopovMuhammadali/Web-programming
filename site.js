(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  var themeButton = document.getElementById('theme-toggle');
  var themeColor = document.querySelector('meta[name="theme-color"]');
  var menuButton = document.getElementById('menu-toggle');
  var navigation = document.getElementById('primary-navigation');
  var progress = document.getElementById('scroll-progress');
  var year = document.getElementById('current-year');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Theme: keeps the visitor's choice, but never depends on storage. */
  function setTheme(theme, save) {
    root.setAttribute('data-theme', theme);
    if (themeButton) {
      var dark = theme === 'dark';
      themeButton.setAttribute('aria-pressed', String(dark));
      themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      themeButton.setAttribute('title', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (themeColor) {
      themeColor.setAttribute('content', theme === 'dark' ? '#191512' : '#F4EEE7');
    }
    if (save) {
      try { localStorage.setItem('mm-portfolio-theme', theme); } catch (error) { /* Storage is optional. */ }
    }
  }

  setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);

  if (themeButton) {
    themeButton.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next, true);
    });
  }

  /* Mobile navigation: Escape, outside click and link selection all close it. */
  function closeMenu(returnFocus) {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
    if (returnFocus) menuButton.focus();
  }

  if (menuButton && navigation) {
    menuButton.addEventListener('click', function () {
      var open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      navigation.classList.toggle('is-open', !open);
    });

    navigation.addEventListener('click', function (event) {
  var link = event.target.closest('a');

  if (!link) return;

  var href = link.getAttribute('href') || '';

  // Let normal page links work, but close the mobile menu.
  if (!href.startsWith('#')) {
    closeMenu(false);
    return;
  }

  var target = document.getElementById(href.slice(1));

  if (!target) {
    closeMenu(false);
    return;
  }

  event.preventDefault();
  closeMenu(false);

  // Keep the URL hash in sync with the section.
  try {
    window.history.pushState(null, '', href);
  } catch (error) {
    // Scrolling still works if history updates are unavailable.
  }

  target.scrollIntoView({
    behavior: reducedMotion ? 'auto' : 'smooth',
    block: 'start'
  });
});

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navigation.classList.contains('is-open')) closeMenu(true);
    });

    document.addEventListener('click', function (event) {
      if (navigation.classList.contains('is-open') &&
          !navigation.contains(event.target) && !menuButton.contains(event.target)) {
        closeMenu(false);
      }
    });
  }

  /* Scroll position and reading progress. */
  function updateScrollProgress() {
    if (!progress) return;
    var page = document.documentElement;
    var available = page.scrollHeight - page.clientHeight;
    var amount = available > 0 ? page.scrollTop / available : 0;
    progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, amount)) + ')';
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  updateScrollProgress();

  /* Project filters. Buttons remain fully keyboard-operable. */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var projectCards = Array.prototype.slice.call(document.querySelectorAll('.project-card[data-category]'));

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var selected = button.getAttribute('data-filter');
      filterButtons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      projectCards.forEach(function (card) {
        var categories = (card.getAttribute('data-category') || '').split(/\s+/);
        card.hidden = selected !== 'all' && categories.indexOf(selected) === -1;
      });
    });
  });

  /* Reveal content only when it approaches the viewport. */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* Keep the active navigation item in sync with the section being read. */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.primary-nav a[href^="#"]'));
  var observedSections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-20% 0px -65% 0px' });
    observedSections.forEach(function (section) { navObserver.observe(section); });
  }

  if (year) year.textContent = String(new Date().getFullYear());

  /*
   * Pointer feel: deliberately subtle and desktop-only.
   * A soft follower, warm page glow, project-card spotlight/tilt and magnetic
   * buttons give movement a little weight without hiding the native cursor.
   */
  if (finePointer && !reducedMotion) {
    var follower = document.createElement('div');
    follower.className = 'pointer-follower';
    follower.setAttribute('aria-hidden', 'true');
    follower.innerHTML = '<span></span>';
    document.body.appendChild(follower);

    var pointerX = -100;
    var pointerY = -100;
    var followerX = -100;
    var followerY = -100;
    var followerFrame = 0;

    function animateFollower() {
      followerX += (pointerX - followerX) * 0.19;
      followerY += (pointerY - followerY) * 0.19;
      follower.style.transform = 'translate3d(' + followerX + 'px,' + followerY + 'px,0) translate(-50%,-50%)';
      if (Math.abs(pointerX - followerX) + Math.abs(pointerY - followerY) > 0.35) {
        followerFrame = window.requestAnimationFrame(animateFollower);
      } else {
        followerFrame = 0;
      }
    }

    window.addEventListener('pointermove', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      root.style.setProperty('--pointer-x', pointerX + 'px');
      root.style.setProperty('--pointer-y', pointerY + 'px');
      follower.classList.add('is-visible');
      if (!followerFrame) followerFrame = window.requestAnimationFrame(animateFollower);
    }, { passive: true });

    document.addEventListener('pointerover', function (event) {
      if (event.target.closest('a, button, [role="button"]')) root.classList.add('pointer-over-control');
    });
    document.addEventListener('pointerout', function (event) {
      if (event.target.closest('a, button, [role="button"]') &&
          (!event.relatedTarget || !event.relatedTarget.closest ||
           !event.relatedTarget.closest('a, button, [role="button"]'))) {
        root.classList.remove('pointer-over-control');
      }
      if (!event.relatedTarget) follower.classList.remove('is-visible');
    });
    document.addEventListener('pointerdown', function () { root.classList.add('pointer-pressed'); });
    document.addEventListener('pointerup', function () { root.classList.remove('pointer-pressed'); });
    document.addEventListener('pointercancel', function () { root.classList.remove('pointer-pressed'); });

    /* Magnetic pull is capped at a few pixels so controls never wander. */
    var magneticItems = Array.prototype.slice.call(document.querySelectorAll('.button, .nav-cta, .theme-toggle'));
    magneticItems.forEach(function (item) {
      item.setAttribute('data-magnetic', '');
      item.addEventListener('pointermove', function (event) {
        var rect = item.getBoundingClientRect();
        var dx = (event.clientX - (rect.left + rect.width / 2)) / Math.max(rect.width, 1);
        var dy = (event.clientY - (rect.top + rect.height / 2)) / Math.max(rect.height, 1);
        item.style.setProperty('--mag-x', (dx * 5).toFixed(2) + 'px');
        item.style.setProperty('--mag-y', (dy * 4).toFixed(2) + 'px');
      });
      item.addEventListener('pointerleave', function () {
        item.style.setProperty('--mag-x', '0px');
        item.style.setProperty('--mag-y', '0px');
      });
    });

    /* Tilt and light tracking: only on the largest visual surfaces. */
    var tiltItems = Array.prototype.slice.call(document.querySelectorAll('.project-card, .snapshot-card'));
    tiltItems.forEach(function (item) {
      item.addEventListener('pointermove', function (event) {
        var rect = item.getBoundingClientRect();
        var x = (event.clientX - rect.left) / Math.max(rect.width, 1);
        var y = (event.clientY - rect.top) / Math.max(rect.height, 1);
        var rotateY = (x - 0.5) * (item.classList.contains('project-card') ? 5 : 3.5);
        var rotateX = (0.5 - y) * (item.classList.contains('project-card') ? 5 : 3.5);

        if (item.classList.contains('project-card')) {
          item.style.setProperty('--spot-x', (x * 100).toFixed(1) + '%');
          item.style.setProperty('--spot-y', (y * 100).toFixed(1) + '%');
          item.style.transform = 'perspective(1100px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-5px)';
        } else {
          item.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) rotateZ(1.2deg)';
        }
      });
      item.addEventListener('pointerleave', function () {
        item.style.transform = '';
      });
    });

    /* A very small parallax drift in the hero, not a full-screen camera move. */
    var heroVisual = document.querySelector('.hero-visual');
    var hero = document.querySelector('.hero');
    if (heroVisual && hero) {
      hero.addEventListener('pointermove', function (event) {
        var rect = hero.getBoundingClientRect();
        var x = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
        var y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
        heroVisual.style.setProperty('--drift-x', (x * 7).toFixed(2) + 'px');
        heroVisual.style.setProperty('--drift-y', (y * 6).toFixed(2) + 'px');
      });
      hero.addEventListener('pointerleave', function () {
        heroVisual.style.setProperty('--drift-x', '0px');
        heroVisual.style.setProperty('--drift-y', '0px');
      });
    }
  }
}());
