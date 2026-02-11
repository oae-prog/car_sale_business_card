// Helpers
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Header / UI
const burger = $("#burger");
const nav = $("#nav");
const toTop = $("#toTop");
const year = $("#year");

// Modals
const success = $("#success");
const successClose = $("#successClose");

// Lightbox
const lightbox = $("#lightbox");
const lbImg = $("#lbImg");
const lbClose = $("#lbClose");
const lbPrev = $("#lbPrev");
const lbNext = $("#lbNext");

// Form (отправка на почту через Formspree: https://formspree.io)
const form = $("#leadForm");
const FORMSPREE_ID = "xwvnvnqr"; // Замените на ID формы с formspree.io (например: xjweqwke)
const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_ID}`;

// Current year
year.textContent = new Date().getFullYear();

// Mobile menu toggle
burger.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(isOpen));
});

// Close menu on link click
$$(".nav__link").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  });
});

// Active link on scroll
const sections = ["#services", "#process", "#gallery", "#faq", "#contact"]
  .map((id) => $(id))
  .filter(Boolean);

const links = Array.from($$(".nav__link"));
const map = new Map();
links.forEach((a) => map.set(a.getAttribute("href"), a));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove("is-active"));
        const id = "#" + entry.target.id;
        const active = map.get(id);
        if (active) active.classList.add("is-active");
      }
    });
  },
  { threshold: 0.55 }
);

sections.forEach((sec) => observer.observe(sec));

// Scroll-to-top button
window.addEventListener("scroll", () => {
  if (window.scrollY > 600) toTop.classList.add("is-show");
  else toTop.classList.remove("is-show");
});

toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Modal helpers
function openModal(modalEl) {
  modalEl.classList.add("is-open");
  modalEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal(modalEl) {
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

[success, lightbox].forEach((m) => {
  m.addEventListener("click", (e) => {
    const close = e.target?.dataset?.close === "true";
    if (close) closeModal(m);
  });
});

successClose.addEventListener("click", () => closeModal(success));
lbClose.addEventListener("click", () => closeModal(lightbox));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (success.classList.contains("is-open")) closeModal(success);
    if (lightbox.classList.contains("is-open")) closeModal(lightbox);
  }
});

// ===== Lightbox gallery =====
const items = Array.from($$(".gitem"));
const images = items.map((btn) => ({
  src: btn.dataset.img,
  alt: btn.dataset.alt || "Фото автомобиля"
}));

let currentIndex = 0;

function showImage(idx) {
  const safe = ((idx % images.length) + images.length) % images.length;
  currentIndex = safe;
  lbImg.src = images[safe].src;
  lbImg.alt = images[safe].alt;
}

items.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    showImage(idx);
    openModal(lightbox);
  });
});

lbPrev.addEventListener("click", () => showImage(currentIndex - 1));
lbNext.addEventListener("click", () => showImage(currentIndex + 1));

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (e.key === "ArrowLeft") showImage(currentIndex - 1);
  if (e.key === "ArrowRight") showImage(currentIndex + 1);
});

// ===== Form (отправка на почту через Formspree) =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (name.length < 2 || phone.length < 10 || message.length < 10) {
    alert("Пожалуйста, заполните форму корректно 🙂");
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Отправка…";

  try {
    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      form.reset();
      openModal(success);
    } else {
      const err = await response.json();
      alert(err.error || "Не удалось отправить заявку. Попробуйте позже или позвоните: +7 962 633-38-40");
    }
  } catch (err) {
    alert("Ошибка сети. Проверьте интернет и попробуйте снова или позвоните: +7 962 633-38-40");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
