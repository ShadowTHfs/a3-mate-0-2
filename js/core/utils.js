/* Utilitários compartilhados. Tudo é pendurado no namespace global window.App. */
window.App = window.App || {};
(function (App) {
  "use strict";

  const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
  const pad = (n) => String(n).padStart(2, "0");

  /* Data local no formato AAAA-MM-DD (evita problemas de fuso com toISOString). */
  function dateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function addDays(key, delta) {
    const [y, m, d] = key.split("-").map(Number);
    return dateKey(new Date(y, m - 1, d + delta));
  }

  function shuffle(list, rng = Math.random) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function formatClock(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(total / 60)}:${pad(total % 60)}`;
  }

  function percent(part, whole) {
    return whole ? Math.round((part / whole) * 100) : 0;
  }

  App.AVATARS = ["🦊", "🐼", "🐯", "🦁", "🐸", "🐙", "🦉", "🚀", "🐬", "🦄", "🐧", "🤖"];
  App.Utils = { esc, dateKey, addDays, shuffle, formatClock, percent };
})(window.App);
