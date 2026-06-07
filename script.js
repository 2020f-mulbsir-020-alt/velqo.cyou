(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------
     Utility: Intersection Observer for reveals
     ------------------------------------------ */
  function initRevealObserver() {
    const targets = document.querySelectorAll('.reveal, .section--grid, .section--canvas, .balance-field, .final-field');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (entry.target.classList.contains('section--canvas')) {
              entry.target.classList.add('is-scrolled');
            }
            if (entry.target.classList.contains('balance-field')) {
              entry.target.classList.add('is-balanced');
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------
     Canvas scroll emergence
     ------------------------------------------ */
  function initCanvasScroll() {
    const canvas = document.querySelector('.section--canvas');
    if (!canvas) return;

    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 50) {
          canvas.classList.add('is-scrolled');
        }
      },
      { passive: true }
    );
  }

  /* ------------------------------------------
     Radial Menu
     ------------------------------------------ */
  function initRadialMenu() {
    const trigger = document.getElementById('menuTrigger');
    const menu = document.getElementById('radialMenu');
    const links = menu.querySelectorAll('.radial-menu__link');
    const radius = 100;

    function positionLinks() {
      links.forEach((link) => {
        const angle = parseFloat(link.dataset.angle) * (Math.PI / 180);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        link.style.left = `${x}px`;
        link.style.top = `${y}px`;
      });
    }

    function openMenu() {
      menu.hidden = false;
      menu.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-label', 'Close navigation menu');

      links.forEach((link, i) => {
        link.style.transitionDelay = `${i * 0.06}s`;
      });
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-label', 'Open navigation menu');

      links.forEach((link) => {
        link.style.transitionDelay = '0s';
      });

      setTimeout(() => {
        if (!menu.classList.contains('is-open')) {
          menu.hidden = true;
        }
      }, 800);
    }

    function toggleMenu() {
      if (menu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    positionLinks();
    window.addEventListener('resize', positionLinks);

    trigger.addEventListener('click', toggleMenu);

    links.forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        trigger.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (
        menu.classList.contains('is-open') &&
        !menu.contains(e.target) &&
        !trigger.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ------------------------------------------
     Idea Flow — Sequential fade statements
     ------------------------------------------ */
  function initIdeaFlow() {
    const statements = document.querySelectorAll('.flow-statement');
    if (!statements.length || prefersReducedMotion) {
      statements.forEach((s, i) => {
        if (i === 0) s.classList.add('is-active');
      });
      return;
    }

    const section = document.querySelector('.section--flow');
    let currentIndex = 0;
    let intervalId = null;
    let started = false;

    const DISPLAY_DURATION = 3500;
    const FADE_DURATION = 1500;

    function showStatement(index) {
      statements.forEach((s) => {
        s.classList.remove('is-active', 'is-fading');
      });

      const current = statements[index];
      current.classList.add('is-active');

      setTimeout(() => {
        current.classList.add('is-fading');
        current.classList.remove('is-active');
      }, DISPLAY_DURATION);
    }

    function startFlow() {
      if (started) return;
      started = true;
      showStatement(0);

      intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % statements.length;
        showStatement(currentIndex);
      }, DISPLAY_DURATION + FADE_DURATION);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startFlow();
          } else if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            started = false;
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);
  }

  /* ------------------------------------------
     Thinking Room — Complete fragments on interact
     ------------------------------------------ */
  function initThinkingRoom() {
    const fragments = document.querySelectorAll('.thought-fragment');

    fragments.forEach((fragment) => {
      function complete() {
        if (fragment.classList.contains('is-complete')) return;
        fragment.classList.add('is-complete');
        fragment.textContent = fragment.dataset.complete;
      }

      fragment.addEventListener('click', complete);
      fragment.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          complete();
        }
      });
    });
  }

  /* ------------------------------------------
     Reduction Wall — Lines → Points → Emptiness
     ------------------------------------------ */
  function initReductionWall() {
    const btn = document.getElementById('reductionBtn');
    const layers = document.querySelectorAll('.reduction-layer');
    let stage = 0;

    layers[0].classList.add('is-active');

    function advance() {
      if (stage >= 2) {
        stage = 0;
        layers.forEach((l) => {
          l.classList.remove('is-active', 'is-dissolving');
        });
        layers[0].classList.add('is-active');
        btn.textContent = 'Reduce';
        return;
      }

      const current = layers[stage];
      current.classList.add('is-dissolving');

      setTimeout(() => {
        current.classList.remove('is-active', 'is-dissolving');
        stage++;
        layers[stage].classList.add('is-active');

        if (stage === 2) {
          btn.textContent = 'Reset';
        }
      }, 1200);
    }

    btn.addEventListener('click', advance);
  }

  /* ------------------------------------------
     Silence Zone — Subtle background noise
     ------------------------------------------ */
  function initSilenceZone() {
    const canvas = document.getElementById('silenceCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId = null;
    let isVisible = false;

    function resize() {
      const parent = canvas.parentElement;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }

    function drawNoise() {
      if (!isVisible || prefersReducedMotion) return;

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = 247 + Math.random() * 4 - 2;
        data[i] = value;
        data[i + 1] = value + 1;
        data[i + 2] = value + 2;
        data[i + 3] = 3;
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(drawNoise);
    }

    function start() {
      if (isVisible) return;
      isVisible = true;
      resize();
      drawNoise();
    }

    function stop() {
      isVisible = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas.parentElement);
  }

  /* ------------------------------------------
     Balance Field — Gentle continuous shift
     ------------------------------------------ */
  function initBalanceField() {
    if (prefersReducedMotion) return;

    const field = document.querySelector('.balance-field');
    if (!field) return;

    let offset = 0;

    function animate() {
      if (!field.classList.contains('is-balanced')) {
        requestAnimationFrame(animate);
        return;
      }

      offset += 0.002;
      const leftEl = field.querySelector('.balance-element--left');
      const rightEl = field.querySelector('.balance-element--right');

      const shift = Math.sin(offset) * 8;
      leftEl.style.transform = `translateY(-50%) translateX(${30 + shift}px)`;
      rightEl.style.transform = `translateY(-50%) translateX(${-20 - shift}px)`;

      requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(field);
  }

  /* ------------------------------------------
     Footer year
     ------------------------------------------ */
  function initFooter() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ------------------------------------------
     Initialize
     ------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initRevealObserver();
    initCanvasScroll();
    initRadialMenu();
    initIdeaFlow();
    initThinkingRoom();
    initReductionWall();
    initSilenceZone();
    initBalanceField();
    initFooter();
  });
})();
