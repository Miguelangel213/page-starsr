/* ═══════════════════════════════════════════════
   WEALTH NETWORK · Landing Page
   script.js  —  con integración a Google Sheets
   ═══════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   ★ CONFIGURACIÓN — EDITA SOLO ESTAS 2 LÍNEAS
────────────────────────────────────────────── */
const WA_CONFIG = {
  numero:    "573147961679",              // ← Tu número WhatsApp (ej: "573001234567")
  sheetsURL: "https://script.google.com/macros/s/AKfycbzVBnoXqQ9GiIB_k78PWsxWuAYNfG5A3CySsmF12ICWQF1qTJypKqB4A__mtdnVo8Pr/exec", // ← URL que te da Google Apps Script
  mensajeFloat: "¡Hola! Vi tu página y quiero saber más sobre la oportunidad de inversión.",
  mensajeFinal: "¡Hola! Quiero unirme a la red de inversiones. Por favor dame más información.",
};

/* ──────────────────────────────────────────────
   UTILIDAD: construir URL de WhatsApp
────────────────────────────────────────────── */
function buildWaURL(mensaje) {
  return "https://wa.me/" + WA_CONFIG.numero + "?text=" + encodeURIComponent(mensaje);
}

/* ──────────────────────────────────────────────
   1. BOTONES DE WHATSAPP
────────────────────────────────────────────── */
function initWhatsAppButtons() {
  const btnFloat = document.getElementById("wa-float");
  if (btnFloat) btnFloat.href = buildWaURL(WA_CONFIG.mensajeFloat);

  const btnFinal = document.getElementById("btn-final");
  if (btnFinal) btnFinal.href = buildWaURL(WA_CONFIG.mensajeFinal);

  const btnNav = document.getElementById("nav-cta");
  if (btnNav) {
    btnNav.addEventListener("click", function (e) {
      if (window.innerWidth <= 640) {
        e.preventDefault();
        window.open(buildWaURL(WA_CONFIG.mensajeFloat), "_blank", "noopener,noreferrer");
      }
    });
  }
}

/* ──────────────────────────────────────────────
   2. FORMULARIO → GOOGLE SHEETS + WHATSAPP
   Flujo:
   1) Valida campos
   2) Envía datos a Google Sheets en segundo plano
   3) Abre WhatsApp al instante con los datos del lead
────────────────────────────────────────────── */
function initForm() {
  const form = document.getElementById("lead-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre   = document.getElementById("f-nombre").value.trim();
    const telefono = document.getElementById("f-telefono").value.trim();
    const email    = document.getElementById("f-email").value.trim();
    const meta     = document.getElementById("f-meta").value;

    if (!nombre || !telefono || !meta) {
      shakeForm(form);
      highlightEmptyFields();
      return;
    }

    const btnSubmit = document.getElementById("btn-form");
    setButtonState(btnSubmit, "loading");

    // ── Guardar en Google Sheets (background) ──
    fetch(WA_CONFIG.sheetsURL, {
      method:  "POST",
      mode:    "no-cors",   // Apps Script requiere no-cors
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ nombre, telefono, email, meta }),
    })
    .finally(function () {
      // Siempre abrimos WhatsApp, haya o no error de red
      setButtonState(btnSubmit, "success");
      abrirWhatsApp(nombre, telefono, email, meta);
    });
  });
}

/* Construye el mensaje y abre WhatsApp */
function abrirWhatsApp(nombre, telefono, email, meta) {
  const lineas = [
    "¡Hola! Me registré en tu página web.",
    "",
    "👤 Nombre:        " + nombre,
    "📱 Teléfono:      " + telefono,
    email ? "📧 Email:         " + email : null,
    "💰 Meta mensual:  " + meta,
    "",
    "Quiero más información sobre la oportunidad de inversión.",
  ].filter(Boolean).join("\n");

  window.open(buildWaURL(lineas), "_blank", "noopener,noreferrer");
}

/* Cambia el estado visual del botón de submit */
function setButtonState(btn, state) {
  const estados = {
    loading: { texto: "⏳ Guardando tu información...", disabled: true,  opacity: "0.75" },
    success: { texto: "✅ ¡Redirigiendo a WhatsApp!",  disabled: false, opacity: "1"    },
    reset:   { texto: "Quiero Saber Más por WhatsApp", disabled: false, opacity: "1"    },
  };
  const cfg = estados[state];
  if (!cfg) return;
  btn.disabled      = cfg.disabled;
  btn.style.opacity = cfg.opacity;
  const label = btn.querySelector(".btn-label");
  if (label) label.textContent = cfg.texto;
  if (state === "success") {
    setTimeout(function () { setButtonState(btn, "reset"); }, 3500);
  }
}

/* ──────────────────────────────────────────────
   3. VALIDACIÓN VISUAL
────────────────────────────────────────────── */
function shakeForm(form) {
  form.classList.add("shake");
  setTimeout(function () { form.classList.remove("shake"); }, 600);
}

function highlightEmptyFields() {
  ["f-nombre", "f-telefono", "f-meta"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el && !el.value.trim()) {
      el.style.borderColor = "#FF4D6D";
      el.addEventListener("input", function reset() {
        el.style.borderColor = "";
        el.removeEventListener("input", reset);
      });
    }
  });
}

/* ──────────────────────────────────────────────
   4. NAVBAR — efecto al hacer scroll
────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  function update() { navbar.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ──────────────────────────────────────────────
   5. SCROLL REVEAL con IntersectionObserver
────────────────────────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll(".scroll-reveal");
  if (!elements.length) return;
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const idx = Array.from(entry.target.parentElement.children).indexOf(entry.target);
      entry.target.style.transitionDelay = (idx * 80) + "ms";
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  elements.forEach(function (el) { observer.observe(el); });
}

/* ──────────────────────────────────────────────
   6. CONTADORES ANIMADOS DE ESTADÍSTICAS
────────────────────────────────────────────── */
function initCounters() {
  const els = document.querySelectorAll(".stat-num[data-target]");
  if (!els.length) return;
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      observer.unobserve(e.target);
      animateCounter(e.target);
    });
  }, { threshold: 0.5 });
  els.forEach(function (el) { observer.observe(el); });
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const isDec  = el.hasAttribute("data-decimal");
  const prefix = el.dataset.prefix || "";
  const steps  = 60;
  const inc    = target / steps;
  let   cur    = 0;
  let   s      = 0;
  const timer  = setInterval(function () {
    s++; cur = inc * s;
    if (s >= steps) { cur = target; clearInterval(timer); }
    el.textContent = prefix + (isDec ? cur.toFixed(1) : Math.floor(cur).toLocaleString("es"));
  }, 1800 / steps);
}

/* ──────────────────────────────────────────────
   7. INYECTAR CSS de animación shake
────────────────────────────────────────────── */
function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-8px); }
      40%     { transform: translateX(8px); }
      60%     { transform: translateX(-5px); }
      80%     { transform: translateX(5px); }
    }
    .shake { animation: shake .5s ease; }
  `;
  document.head.appendChild(style);
}

/* ──────────────────────────────────────────────
   INIT GENERAL
────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function () {
  injectStyles();
  initWhatsAppButtons();
  initForm();
  initNavbar();
  initScrollReveal();
  initCounters();

  // Avisos de configuración pendiente en consola del navegador
  if (WA_CONFIG.numero === "COLOCA_TU_NUMERO_AQUI") {
    console.warn("%c⚠ WhatsApp: reemplaza WA_CONFIG.numero con tu número real.", "color:#F0B429;font-size:13px;font-weight:bold");
  }
  if (WA_CONFIG.sheetsURL === "COLOCA_TU_URL_DE_APPS_SCRIPT_AQUI") {
    console.warn("%c⚠ Google Sheets: reemplaza WA_CONFIG.sheetsURL con la URL de tu Apps Script.", "color:#F0B429;font-size:13px;font-weight:bold");
  }
});