/* ═══════════════════════════════════════════════
   STARS NETWORK · Landing Page
   script.js  —  Conexión Netlify Forms + WhatsApp
   ═══════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   ★ CONFIGURACIÓN
────────────────────────────────────────────── */
const WA_CONFIG = {
  numero: "573147961679", // Tu número de WhatsApp Business
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
   1. BOTONES DE WHATSAPP (Flotante y Final)
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
   2. FORMULARIO → NETLIFY FORMS + WHATSAPP
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

    // Validación básica
    if (!nombre || !telefono || !meta) {
      shakeForm(form);
      highlightEmptyFields();
      return;
    }

    const btnSubmit = document.getElementById("btn-form");
    setButtonState(btnSubmit, "loading");

    // ── PASO 1: Guardar datos en Netlify ──
    const formData = new FormData(form);
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
    .then(() => {
      // ── PASO 2: Si Netlify guardó, abrir WhatsApp ──
      console.log("Datos capturados por Netlify correctamente.");
      setButtonState(btnSubmit, "success");
      abrirWhatsApp(nombre, telefono, email, meta);
    })
    .catch((error) => {
      console.error("Error al guardar en Netlify:", error);
      // Abrimos WhatsApp de todos modos para no perder la venta
      setButtonState(btnSubmit, "success");
      abrirWhatsApp(nombre, telefono, email, meta);
    });
  });
}

/* Construye el mensaje personalizado y abre el chat */
function abrirWhatsApp(nombre, telefono, email, meta) {
  const lineas = [
    "¡Hola! Me acabo de registrar en Stars Network.",
    "",
   
    "Quiero empezar a generar ingresos. ¿Cuáles son los siguientes pasos?",
  ].filter(Boolean).join("\n");

  window.open(buildWaURL(lineas), "_blank", "noopener,noreferrer");
}

/* Cambia el estado visual del botón */
function setButtonState(btn, state) {
  const estados = {
    loading: { texto: "⏳ Guardando info...", disabled: true,  opacity: "0.75" },
    success: { texto: "✅ ¡Yendo a WhatsApp!",  disabled: false, opacity: "1"    },
    reset:   { texto: "Quiero Saber Más por WhatsApp", disabled: false, opacity: "1"    },
  };
  const cfg = estados[state];
  if (!cfg) return;

  btn.disabled = cfg.disabled;
  btn.style.opacity = cfg.opacity;
  
  // Si el botón tiene texto directo o dentro de un span
  if (btn.lastChild.nodeType === 3) {
    btn.lastChild.textContent = " " + cfg.texto;
  }
  
  if (state === "success") {
    setTimeout(() => setButtonState(btn, "reset"), 4000);
  }
}

/* ──────────────────────────────────────────────
   3. EFECTOS VISUALES Y ANIMACIONES
────────────────────────────────────────────── */
function shakeForm(form) {
  form.classList.add("shake");
  setTimeout(() => form.classList.remove("shake"), 600);
}

function highlightEmptyFields() {
  ["f-nombre", "f-telefono", "f-meta"].forEach((id) => {
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

function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });
}

function initScrollReveal() {
  const elements = document.querySelectorAll(".scroll-reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach((el) => observer.observe(el));
}

function initCounters() {
  const els = document.querySelectorAll(".stat-num[data-target]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        observer.unobserve(e.target);
        animateCounter(e.target);
      }
    });
  }, { threshold: 0.5 });
  els.forEach((el) => observer.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const isDec  = el.hasAttribute("data-decimal");
  const prefix = el.dataset.prefix || "";
  const steps  = 60;
  const inc    = target / steps;
  let s = 0;
  const timer = setInterval(() => {
    s++;
    let cur = inc * s;
    if (s >= steps) { cur = target; clearInterval(timer); }
    el.textContent = prefix + (isDec ? cur.toFixed(1) : Math.floor(cur).toLocaleString("es"));
  }, 1800 / steps);
}

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
document.addEventListener("DOMContentLoaded", () => {
  injectStyles();
  initWhatsAppButtons();
  initForm();
  initNavbar();
  initScrollReveal();
  initCounters();
});