// Helpers
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

// Footer year
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Topbar close
const topbar = $("#topbar");
const topbarClose = $(".topbar-close");
if (topbar && topbarClose) {
  topbarClose.addEventListener("click", () => {
    topbar.classList.add("is-hidden");
  });
}

// Mobile nav
const navToggle = $(".nav-toggle");
const navList = $("#navList");

if (navToggle && navList) {
  const closeNav = () => {
    navList.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const open = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close menu on link tap (mobile)
  $$(".nav-link").forEach((a) => {
    a.addEventListener("click", () => {
      closeNav();
    });
  });

  // Close when clicking outside or pressing Esc
  document.addEventListener("click", (e) => {
    if (!navList.classList.contains("open")) return;
    if (navList.contains(e.target) || navToggle.contains(e.target)) return;
    closeNav();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
}

// Active nav on scroll
const sections = $$("main section[id]");
const navLinks = $$(".nav-link");

function setActiveLink() {
  const y = window.scrollY + 120;
  let current = "home";
  sections.forEach(sec => {
    if (y >= sec.offsetTop) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}
if (sections.length && navLinks.length) {
  window.addEventListener("scroll", setActiveLink);
  window.addEventListener("load", setActiveLink);
}



// Header shadow on scroll
const headerEl = document.querySelector('.header');
function setHeaderShadow(){
  if (!headerEl) return;
  headerEl.classList.toggle('scrolled', window.scrollY > 8);
}
window.addEventListener('scroll', setHeaderShadow, { passive: true });
window.addEventListener('load', setHeaderShadow);

// Auto-add reveal to key blocks, then reveal on scroll
['.section-head', '.menu-item', '.value-card', '.order-box', '.gallery-item', '.contact-card', '.contact-grid > .card', '.hero-card', '.mini', '.badge', '.cta-row'].forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal','');
  });
});

const revealEls = [...document.querySelectorAll('[data-reveal]')];
if (revealEls.length && 'IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {

      if (entry.isIntersecting) {
        if (entry.target.classList.contains('reveal-in')) {
          entry.target.classList.remove('reveal-in');
          void entry.target.offsetWidth;
        }
        entry.target.classList.add('reveal-in');
      } else {
        entry.target.classList.remove('reveal-in');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('reveal-in'));
}

// Gallery lightbox
(function galleryLightbox(){
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const closeBtn = document.querySelector('.lightbox-close');
  const items = [...document.querySelectorAll('.gallery-item')];

  if (!box || !img || !closeBtn || !items.length) return;

  function open(src, alt){
    img.src = src;
    img.alt = alt || 'Preview foto';
    box.hidden = false;
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close(){
    box.hidden = true;
    box.setAttribute('aria-hidden', 'true');
    img.src = '';
    document.body.style.overflow = '';
  }

  items.forEach(btn => {
    btn.addEventListener('click', () => {
      const full = btn.getAttribute('data-full');
      const im = btn.querySelector('img');
      open(full || (im ? im.getAttribute('src') : ''), im ? im.getAttribute('alt') : 'Preview foto');
    });
  });

  closeBtn.addEventListener('click', close);
  box.addEventListener('click', (e) => {
    if (e.target === box) close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !box.hidden) close();
  });
})();
// Menu filter
const chips = $$(".chip");
const menuItems = $$(".menu-item");

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => {
      c.classList.remove("active");
      c.setAttribute("aria-selected", "false");
    });
    chip.classList.add("active");
    chip.setAttribute("aria-selected", "true");

    const filter = chip.dataset.filter;
    menuItems.forEach(item => {
      const cat = item.dataset.category;
      const show = filter === "all" || cat === filter;
      item.style.display = show ? "" : "none";
    });
  });
});

// Contact form demo
const form = $("#contactForm");
const toast = $("#toast");

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => (toast.hidden = true), 3000);
}

if (form && toast) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);

    const name = (data.get("name") || "").toString().trim();
    const contact = (data.get("contact") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();

    if (!name || !contact || !message) {
      showToast("Isi semua field dulu ya 🙂");
      return;
    }

    const packed = `Nama: ${name}
Kontak: ${contact}
Pesan: ${message}`;
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(packed).catch(()=>{});
    }

    form.reset();
    showToast("Terkirim (demo). Pesan tersalin ke clipboard — tinggal paste ke DM/WhatsApp.");
  });
}


// HERO SLIDER (auto + buttons + dots)
(function heroSlider() {
  const slides = [...document.querySelectorAll("#heroSlides .slide")];
  const prev = document.getElementById("heroPrev");
  const next = document.getElementById("heroNext");
  const dotsWrap = document.getElementById("heroDots");

  if (!slides.length || !prev || !next || !dotsWrap) return;

  let idx = slides.findIndex((s) => s.classList.contains("active"));
  if (idx < 0) idx = 0;

  function renderDots() {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "slider-dot" + (i === idx ? " active" : "");
      d.setAttribute("aria-label", `Go to image ${i + 1}`);
      d.addEventListener("click", () => {
        idx = i;
        update();
      });
      dotsWrap.appendChild(d);
    });
  }

  function update() {
    slides.forEach((s, i) => s.classList.toggle("active", i === idx));
    renderDots();
  }

  function go(step) {
    idx = (idx + step + slides.length) % slides.length;
    update();
  }

  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));

  // Auto play + pause on hover
  let timer = setInterval(() => go(1), 4500);
  const slider = document.querySelector(".hero-photo.slider");

  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", () => {
    timer = setInterval(() => go(1), 4500);
  });

  // Swipe for mobile (simple)
  let startX = 0;
  slider.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    if (Math.abs(diff) > 40) go(diff > 0 ? -1 : 1);
  }, { passive: true });

  update();
})();
