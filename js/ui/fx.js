/* Efeitos visuais: confete e texto flutuante. Respeitam prefers-reduced-motion. */
window.App = window.App || {};
(function (App) {
  "use strict";
  const reduceMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COLORS = ["#6d5efc", "#f5a524", "#16a34a", "#ec4899", "#3b82f6", "#f97316", "#14b8a6"];

  function confetti(count = 90) {
    if (reduceMotion()) return;
    const layer = document.createElement("div");
    layer.className = "confetti";
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("i");
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = COLORS[i % COLORS.length];
      piece.style.animationDelay = `${Math.random() * 0.5}s`;
      piece.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 3600);
  }

  function floatText(anchor, text) {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const el = document.createElement("span");
    el.className = "xp-float";
    el.textContent = text;
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${rect.top + rect.height / 3}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  App.Fx = { confetti, floatText };
})(window.App);
