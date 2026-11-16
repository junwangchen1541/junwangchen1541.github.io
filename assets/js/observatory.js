(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.querySelector('#motion-toggle');
  let manualPause = false;
  let motionPaused = reduceMotion.matches;
  let frame = 0;
  let elapsed = 0;
  let lastTime = 0;
  let heroVisible = true;
  let atlasVisible = false;

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-nav');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  matchMedia('(max-width: 800px)').addEventListener('change', closeMenu);

  const progress = document.querySelector('.reading-progress');
  let scrollQueued = false;
  function updateScroll() {
    const length = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${length > 0 ? scrollY / length : 0})`;
    scrollQueued = false;
  }
  addEventListener(
    'scroll',
    () => {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(updateScroll);
      }
    },
    { passive: true },
  );
  addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !motionPaused) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
      },
      { threshold: 0.08 },
    );
    reveals.forEach((element) => {
      element.classList.add('reveal-pending');
      revealObserver.observe(element);
    });
  }

  document.querySelectorAll('.research-topics details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (detail.open && !motionPaused) {
        detail.querySelector('.topic-body').animate(
          [
            { opacity: 0, transform: 'translateY(-6px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 350, easing: 'ease-out' },
        );
      }
      updateScroll();
    });
  });

  const hero = document.querySelector('.hero');
  if (!hero) return;
  const heroArt = document.querySelector('.hero-art');
  const canvas = document.querySelector('#night-sky');
  const context = canvas.getContext('2d');
  const contours = document.querySelector('#atlas-contours');
  const atlas = document.querySelector('.research-atlas');
  const cursor = { x: -1000, y: -1000, tx: 0, ty: 0, xSmooth: 0, ySmooth: 0 };
  let width = 1;
  let height = 1;
  let stars = [];
  let seed = 1541;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const contourPaths = [];
  for (let index = 0; index < 13; index++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.style.opacity = String(0.35 + index / 24);
    contours.append(path);
    contourPaths.push(path);
  }

  function drawContours(time) {
    contourPaths.forEach((path, index) => {
      const base = 25 + index * 10;
      const points = [];
      for (let step = 0; step <= 120; step++) {
        const angle = (step / 120) * Math.PI * 2;
        const radius =
          base +
          Math.sin(angle * 3 + index * 0.13 + time * 0.07) * 12 +
          Math.cos(angle * 5 - index * 0.11 + time * 0.04) * 7 +
          Math.sin(angle * 7 + index * 0.17) * 3;
        points.push(
          `${step ? 'L' : 'M'}${(250 + Math.cos(angle) * radius * 1.03).toFixed(1)},${(250 + Math.sin(angle) * radius * 0.9).toFixed(1)}`,
        );
      }
      path.setAttribute('d', points.join('') + 'Z');
    });
  }
  drawContours(0);

  function resizeSky() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    if (context) context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    seed = 1541;
    stars = Array.from({ length: Math.min(160, Math.round((width * height) / 8000)) }, () => ({
      x: random() * width,
      y: random() * height * 0.83,
      radius: 0.35 + random() * 0.85,
      phase: random() * Math.PI * 2,
      depth: 0.2 + random() * 0.8,
      alpha: 0.15 + random() * 0.5,
    }));
    drawSky(0);
  }

  function drawSky(time) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    const nearby = [];
    for (const star of stars) {
      const x = star.x + cursor.xSmooth * star.depth * 0.45;
      const y = star.y + cursor.ySmooth * star.depth * 0.45;
      const pulse = motionPaused ? 0.8 : 0.75 + Math.sin(time * 0.65 + star.phase) * 0.25;
      context.fillStyle = `rgba(207,222,235,${star.alpha * pulse})`;
      context.beginPath();
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fill();
      if (!motionPaused && Math.hypot(x - cursor.x, y - cursor.y) < 145) nearby.push({ x, y });
    }
    if (nearby.length) {
      context.lineWidth = 0.6;
      for (let i = 0; i < nearby.length; i++) {
        for (let j = i + 1; j < nearby.length; j++) {
          const distance = Math.hypot(nearby[i].x - nearby[j].x, nearby[i].y - nearby[j].y);
          if (distance > 110) continue;
          context.strokeStyle = `rgba(199,179,136,${(1 - distance / 110) * 0.4})`;
          context.beginPath();
          context.moveTo(nearby[i].x, nearby[i].y);
          context.lineTo(nearby[j].x, nearby[j].y);
          context.stroke();
        }
      }
    }
  }

  hero.addEventListener(
    'pointermove',
    (event) => {
      if (!finePointer.matches || motionPaused) return;
      const rect = hero.getBoundingClientRect();
      cursor.x = event.clientX - rect.left;
      cursor.y = event.clientY - rect.top;
      cursor.tx = (cursor.x / width - 0.5) * 18;
      cursor.ty = (cursor.y / height - 0.5) * 14;
    },
    { passive: true },
  );
  hero.addEventListener('pointerleave', () => {
    cursor.tx = cursor.ty = 0;
    cursor.x = cursor.y = -1000;
  });

  let lastContourTime = 0;
  function animate(time) {
    frame = 0;
    if (motionPaused || document.hidden || (!heroVisible && !atlasVisible)) return;
    const delta = lastTime ? Math.min(time - lastTime, 50) : 16;
    elapsed += delta / 1000;
    lastTime = time;
    if (heroVisible) {
      const ease = 1 - Math.exp(-delta / 170);
      cursor.xSmooth += (cursor.tx - cursor.xSmooth) * ease;
      cursor.ySmooth += (cursor.ty - cursor.ySmooth) * ease;
      heroArt.style.setProperty('--px', `${cursor.xSmooth.toFixed(2)}px`);
      heroArt.style.setProperty('--py', `${cursor.ySmooth.toFixed(2)}px`);
      drawSky(elapsed);
    }
    if (atlasVisible && time - lastContourTime > 80) {
      drawContours(elapsed);
      lastContourTime = time;
    }
    frame = requestAnimationFrame(animate);
  }
  function schedule() {
    if (!frame && !motionPaused && !document.hidden && (heroVisible || atlasVisible)) {
      lastTime = 0;
      frame = requestAnimationFrame(animate);
    }
  }
  function syncMotion() {
    motionPaused = manualPause || reduceMotion.matches;
    root.classList.toggle('motion-paused', motionPaused);
    toggle.setAttribute('aria-pressed', String(motionPaused));
    toggle.querySelector('span').textContent = motionPaused ? 'off' : 'on';
    toggle.disabled = reduceMotion.matches;
    toggle.setAttribute(
      'aria-label',
      reduceMotion.matches
        ? 'Motion is off, following your system preference'
        : motionPaused
          ? 'Motion is off. Enable animation'
          : 'Motion is on. Pause animation',
    );
    if (motionPaused) {
      cancelAnimationFrame(frame);
      frame = 0;
      cursor.tx = cursor.ty = cursor.xSmooth = cursor.ySmooth = 0;
      drawSky(elapsed);
      document.getAnimations().forEach((animation) => {
        if (animation.effect.getTiming().iterations !== Infinity) animation.finish();
      });
    } else schedule();
  }
  toggle.addEventListener('click', () => {
    if (reduceMotion.matches) {
      toggle.setAttribute(
        'aria-label',
        'Animation follows your system’s reduced motion preference',
      );
      return;
    }
    manualPause = !manualPause;
    syncMotion();
  });
  reduceMotion.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    } else schedule();
  });
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === atlas) atlasVisible = entry.isIntersecting;
      }
      schedule();
    });
    animationObserver.observe(hero);
    animationObserver.observe(atlas);
  }
  new ResizeObserver(resizeSky).observe(hero);
  resizeSky();
  syncMotion();
  if (!motionPaused) {
    document.querySelectorAll('.hero-content > *').forEach((element, index) => {
      element.animate(
        [
          { opacity: 0, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: 1000,
          delay: index * 90,
          easing: 'cubic-bezier(.2,.7,.2,1)',
          fill: 'backwards',
        },
      );
    });
  }
})();
