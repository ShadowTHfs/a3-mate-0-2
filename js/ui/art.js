/*
 * Arte do app, 100% vetorial (SVG): ícones, mascotes, emblemas de nível e de conquistas.
 * Nada aqui é imagem em pixel, então tudo fica nítido em qualquer tamanho e tela.
 * Os gradientes e ícones ficam num "sprite" único inserido uma vez na página (mount).
 */
window.App = window.App || {};
(function (App) {
  "use strict";

  /* ================= Paleta ================= */
  // [claro, base, escuro(profundidade)]
  const TONES = {
    red: ["#ff8aa3", "#f0294f", "#b3123a"],
    orange: ["#ffd84d", "#ff7a1a", "#c2410c"],
    gold: ["#ffe680", "#ffb020", "#c77c00"],
    purple: ["#c1b0ff", "#7c5cff", "#5a3fd6"],
    blue: ["#9fd6ff", "#3b82f6", "#1f5fc4"],
    green: ["#9df08a", "#22b04a", "#15803d"],
    teal: ["#7eeadb", "#14a898", "#0d7a6e"],
    pink: ["#ffa8d2", "#ff4fa3", "#c42d78"],
    gray: ["#f0eff8", "#c6c4de", "#9c9abb"],
    cyan: ["#c4f6ff", "#38c6f0", "#1a8fb8"],
  };
  const FONT = 'font-family="Nunito, system-ui, sans-serif" font-weight="900"';
  const g = (tone) => `url(#g-${tone})`;
  const dk = (tone) => TONES[tone][2];
  const f2 = (n) => Number(n.toFixed(2));

  /* ================= Geometria ================= */
  const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const rrect = (x, y, w, h, r) =>
    `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;

  function starPath(cx, cy, R, r, n = 5, rot = -90) {
    let d = "";
    for (let i = 0; i < n * 2; i += 1) {
      const rad = i % 2 ? r : R;
      const a = ((rot + (i * 180) / n) * Math.PI) / 180;
      d += `${i ? "L" : "M"}${f2(cx + rad * Math.cos(a))} ${f2(cy + rad * Math.sin(a))}`;
    }
    return `${d}Z`;
  }

  function polyPath(cx, cy, R, n, rot = -90) {
    let d = "";
    for (let i = 0; i < n; i += 1) {
      const a = ((rot + (i * 360) / n) * Math.PI) / 180;
      d += `${i ? "L" : "M"}${f2(cx + R * Math.cos(a))} ${f2(cy + R * Math.sin(a))}`;
    }
    return `${d}Z`;
  }

  /* Forma "em relevo": camada escura deslocada (profundidade) + preenchimento em gradiente. */
  const solid = (d, tone, depth = 1.4, round = 0) => {
    const r = round ? ` stroke-linejoin="round" stroke-width="${round}"` : "";
    return `<path d="${d}" fill="${dk(tone)}"${round ? ` stroke="${dk(tone)}"` : ""}${r} transform="translate(0 ${depth})"/>`
      + `<path d="${d}" fill="${g(tone)}"${round ? ` stroke="${g(tone)}"` : ""}${r}/>`;
  };
  const line = (d, tone, w = 2.6, depth = 1.2) =>
    `<path d="${d}" fill="none" stroke="${dk(tone)}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${depth})"/>`
    + `<path d="${d}" fill="none" stroke="${g(tone)}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const shine = (d, o = 0.55) => `<path d="${d}" fill="#fff" opacity="${o}"/>`;
  const white = (d, w = 2.2, o = 1) =>
    `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;

  /* ================= Ícones (viewBox 24×24) ================= */
  const HEART = "M12 21.2C11.6 21.2 3 15.6 3 9.3 3 6.2 5.3 4 8 4c1.8 0 3.2 1 4 2.3C12.8 5 14.2 4 16 4c2.7 0 5 2.2 5 5.3 0 6.3-8.6 11.9-9 11.9Z";
  const FLAME = "M12 2.5c1 3.5 5.5 5.5 5.5 11 0 4.1-2.5 7.3-5.5 7.3s-5.5-3.2-5.5-7c0-2.8 1.5-4.2 2.7-5.5.2 1.7 1 2.7 1.8 2.9-.4-3.2.2-6.2 1-8.7Z";
  const SHIELD = "M12 2.5 19.5 5.5V11.5C19.5 16.2 16.2 19.8 12 21.5 7.8 19.8 4.5 16.2 4.5 11.5V5.5Z";
  const PUZZLE = "M4 7h4.2a2.3 2.3 0 1 1 4.6 0H17v4.2a2.3 2.3 0 1 1 0 4.6V20h-4.2a2.3 2.3 0 1 0-4.6 0H4Z";

  const ICONS = {
    heart: solid(HEART, "red") + shine("M6.3 7.8c.5-1.3 1.9-2 3-1.6.6.3.4 1-.2 1.2-.8.3-1.4.8-1.8 1.5-.4.7-1.3.2-1-.5Z", 0.7),
    "heart-empty": solid(HEART, "gray"),
    flame: solid(FLAME, "orange") + '<path d="M12 11.5c1.4 1.5 2.6 2.8 2.6 4.9 0 1.7-1.2 2.9-2.6 2.9s-2.6-1.2-2.6-2.9c0-1.8 1.4-3 2.6-4.9Z" fill="#fff1a8"/>'
      + shine("M9.2 10.6c.4-.9 1-1.5 1.5-1.6.3.6-.2 1.6-.8 2.2-.4.3-.9 0-.7-.6Z"),
    star: solid(starPath(12, 12.8, 9.4, 4.6), "gold", 1.4, 2) + `<path d="${starPath(12, 12.8, 4.4, 2.2)}" fill="#fff6c7" opacity=".7"/>`,
    "star-empty": solid(starPath(12, 12.8, 9.4, 4.6), "gray", 1.4, 2),
    level: solid(SHIELD, "purple") + white("M8.3 13.3 12 9.6l3.7 3.7", 2.6) + white("M9.6 16.4 12 14l2.4 2.4", 2, 0.7)
      + shine("M7 6.6 11.6 4.8V7L7.6 8.6Z", 0.45),
    medal: solid("M6.5 2.5h4.2l2.2 7H8.7Z", "blue", 1) + solid("M17.5 2.5h-4.2l-2.2 7h4.2Z", "pink", 1)
      + solid(circ(12, 14.6, 6.4), "gold") + `<path d="${starPath(12, 14.8, 3.6, 1.6)}" fill="#fff"/>`
      + shine("M8.2 12.6c.5-1.2 1.6-2 2.8-2.1.4.4 0 .9-.5 1-.7.2-1.2.7-1.5 1.3-.3.4-.9.3-.8-.2Z"),
    target: solid(circ(12, 12, 9.2), "pink") + `<path d="${circ(12, 12, 6.3)}" fill="#fff"/>`
      + `<path d="${circ(12, 12, 3.6)}" fill="${g("pink")}"/>` + line("M12 12 19.5 4.5", "blue", 2, 0.8)
      + solid("M18 3.2h3v3l-1.6 1.2-2.6-2.6Z", "blue", 0.8),
    podium: solid(rrect(2.6, 12, 6.4, 9.5, 1.6), "gray") + solid(rrect(8.8, 7.5, 6.4, 14, 1.6), "gold")
      + solid(rrect(15, 14, 6.4, 7.5, 1.6), "orange") + `<path d="${starPath(12, 4.2, 2.6, 1.1)}" fill="${g("gold")}"/>`
      + `<text x="12" y="16.4" text-anchor="middle" font-size="6" fill="#fff" ${FONT}>1</text>`,
    trophy: line("M7.2 6.2H4.6c0 3 1.2 4.6 3.4 5M16.8 6.2h2.6c0 3-1.2 4.6-3.4 5", "gold", 1.8, 0.8)
      + solid("M7 3.5h10V8c0 3.3-2.2 5.5-5 5.5S7 11.3 7 8Z", "gold") + solid(rrect(10.8, 13, 2.4, 3.6, 0.6), "gold", 0.6)
      + solid(rrect(7.5, 16.4, 9, 3.8, 1.3), "orange") + shine("M8.6 5h1.6v3.2c0 .6-.9.7-1.1.1-.3-.9-.5-2-.5-3.3Z"),
    profile: solid(circ(12, 8.4, 4.2), "blue") + solid("M4.5 20.5c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7c0 .6-.4 1-1 1h-13c-.6 0-1-.4-1-1Z", "blue")
      + shine("M9.4 7.2c.3-1 1.1-1.6 2-1.6.3.4 0 .8-.4.9-.5.2-.8.6-1 1-.2.4-.7.2-.6-.3Z", 0.7),
    book: solid("M2.5 5.5c3-1.2 6.2-1 9.5 1v14c-3.3-2-6.5-2.2-9.5-1Z", "green") + solid("M21.5 5.5c-3-1.2-6.2-1-9.5 1v14c3.3-2 6.5-2.2 9.5-1Z", "teal")
      + white("M5 9.2c1.6-.4 3.3-.2 4.6.5M5 12.4c1.6-.4 3.3-.2 4.6.5M14.4 9.7c1.3-.7 3-.9 4.6-.5", 1.4, 0.8),
    review: line("M18.6 9.6A7.4 7.4 0 0 0 5.8 7.7", "teal", 3) + line("M5.4 14.4a7.4 7.4 0 0 0 12.8 1.9", "teal", 3)
      + solid("M20.6 4.4v6.1h-6.1Z", "teal", 1, 1.6) + solid("M3.4 19.6v-6.1h6.1Z", "teal", 1, 1.6),
    sound: solid("M4 9.2h3l4.6-4v13.6L7 14.8H4a1 1 0 0 1-1-1V10.2a1 1 0 0 1 1-1Z", "purple", 1.2, 1.4)
      + line("M15.2 9.2c1.4 1.5 1.4 4.1 0 5.6M18 6.6c2.8 3 2.8 7.8 0 10.8", "purple", 2, 0.8),
    "sound-off": solid("M4 9.2h3l4.6-4v13.6L7 14.8H4a1 1 0 0 1-1-1V10.2a1 1 0 0 1 1-1Z", "gray", 1.2, 1.4)
      + line("M15.5 9.5l5 5M20.5 9.5l-5 5", "red", 2.2, 0.8),
    lock: line("M8 11V8a4 4 0 0 1 8 0v3", "gray", 2.6) + solid(rrect(5, 10.5, 14, 10.5, 3), "gray")
      + `<path d="${circ(12, 15, 1.6)}M11.2 15.6h1.6l.4 2.6h-2.4Z" fill="${dk("gray")}"/>`,
    check: solid(circ(12, 12, 9.4), "green") + white("M7.6 12.4l3 3 6-6.4", 2.8)
      + shine("M6 9.4c.7-1.7 2.2-2.9 3.9-3.2.5.4.2 1-.4 1.2-1 .4-1.8 1.1-2.3 2-.3.6-1.4.6-1.2 0Z", 0.5),
    crown: solid("M3.5 8.5l4.5 4 4-7 4 7 4.5-4-1.8 10.5H5.3Z", "gold", 1.4, 1.4) + solid(rrect(5.3, 17.6, 13.4, 3, 1.2), "orange", 1)
      + `<path d="${circ(12, 14.4, 1.5)}" fill="${g("red")}"/><path d="${circ(3.5, 8.3, 1.3)}${circ(20.5, 8.3, 1.3)}${circ(12, 5.2, 1.3)}" fill="${g("gold")}"/>`,
    bulb: solid("M12 2.8a6.6 6.6 0 0 1 3.9 11.9c-.6.5-.9 1.1-.9 1.8V17H9v-.5c0-.7-.3-1.3-.9-1.8A6.6 6.6 0 0 1 12 2.8Z", "gold")
      + solid(rrect(8.9, 17.6, 6.2, 3.6, 1.4), "gray", 1) + white("M10.4 12.4 12 14l1.6-1.6", 1.4, 0.8)
      + shine("M8.6 6.6c.7-1.2 1.9-2 3.1-2.2.4.4.1.9-.4 1.1-.8.3-1.4.8-1.8 1.5-.3.5-1.1.3-.9-.4Z", 0.7),
    timer: solid(rrect(10, 1.8, 4, 2.6, 1), "gray", 0.8) + solid(circ(12, 13.4, 8.2), "blue")
      + `<path d="${circ(12, 13.4, 6)}" fill="#fff"/>` + `<path d="M12 13.4V9.2" stroke="${dk("blue")}" stroke-width="2.2" stroke-linecap="round"/>`
      + `<path d="M12 13.4l3 1.8" stroke="${dk("red")}" stroke-width="1.8" stroke-linecap="round"/>`,
    gem: solid("M7 4h10l4.5 5.5L12 21 2.5 9.5Z", "cyan", 1.4, 1.2) + white("M2.8 9.5h18.4M7 4l2.4 5.5L12 21l2.6-11.5L17 4", 1, 0.7)
      + shine("M7.6 4.8h3.4L9.4 9H4.6Z", 0.6),
    sprout: solid("M6.5 18.5h11l-1.4 3H7.9Z", "orange", 1) + line("M12 18.5V10", "green", 2.2, 0.8)
      + solid("M12 11.5C9.5 7 5.5 6 3 7.2c.8 4 4.6 5.6 9 4.3Z", "green", 1) + solid("M12 10C14 5 18.5 3.5 21.2 4.6c-.4 4.6-4.4 6.8-9.2 5.4Z", "green", 1)
      + shine("M5 7.9c1.4-.2 3 .4 4 1.3-1.5.3-3-.2-4-1.3Z", 0.55),
    rocket: solid("M12 2c3.6 2.2 5.4 6 5.1 10.6L14.6 16H9.4l-2.5-3.4C6.6 8 8.4 4.2 12 2Z", "purple")
      + solid("M7 12.2 4 15.4l.4 3.3 3.8-2.2ZM17 12.2l3 3.2-.4 3.3-3.8-2.2Z", "pink", 1)
      + `<path d="${circ(12, 9.2, 2.4)}" fill="#fff"/><path d="${circ(12, 9.2, 1.4)}" fill="${g("blue")}"/>`
      + solid("M9.8 16.6h4.4L12 22Z", "orange", 0.6),
    paper: solid(rrect(4.5, 3.5, 15, 18, 3), "blue") + solid(rrect(8.5, 2, 7, 3.6, 1.4), "gray", 0.8)
      + `<path d="${rrect(6.8, 7, 10.4, 12, 1.6)}" fill="#fff"/>`
      + `<path d="M8.6 10.6h6.8M8.6 13.4h4.4" stroke="${TONES.gray[1]}" stroke-width="1.4" stroke-linecap="round"/>`
      + `<path d="M10.2 16.6l1.4 1.4 3-3" fill="none" stroke="${TONES.green[1]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    spark: solid("M12 2c.9 5.1 4.9 9.1 10 10-5.1.9-9.1 4.9-10 10-.9-5.1-4.9-9.1-10-10 5.1-.9 9.1-4.9 10-10Z", "gold", 0.8),
    play: solid(circ(12, 12, 9.6), "green") + '<path d="M10 8.2v7.6l6-3.8Z" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>',
    close: line("M6.5 6.5l11 11M17.5 6.5l-11 11", "gray", 3, 1),
    // Ícones das unidades da trilha
    "u-expr": solid(rrect(2.5, 3.5, 19, 17, 5), "blue") + `<text x="12" y="16.6" text-anchor="middle" font-size="11" fill="#fff" ${FONT}>x²</text>`
      + shine("M5 6.2h5c.5 0 .5.8 0 .9-1.6.3-2.9 1-3.9 2-.4.4-1.1.1-1.1-.5V6.2Z", 0.45),
    "u-scale": solid(rrect(11, 4.5, 2, 15, 1), "gray", 0.8) + solid(rrect(7.5, 18.5, 9, 3, 1.4), "gray", 0.8)
      + line("M4 7.5h16", "green", 2.2, 0.8) + solid("M1.8 13.5h6.4L5 8.2Z", "green", 1, 1.4) + solid("M15.8 13.5h6.4L19 8.2Z", "green", 1, 1.4)
      + `<path d="${circ(12, 5.2, 1.8)}" fill="${g("gold")}"/>`,
    "u-puzzle": solid(PUZZLE, "purple", 1.4, 1) + shine("M5.4 8.6h2.2v1.2c-.9.2-1.6.7-2.2 1.3Z", 0.5),
    "u-chart": solid(rrect(3.5, 13, 4, 7.5, 1.2), "orange", 1) + solid(rrect(10, 9.5, 4, 11, 1.2), "orange", 1)
      + solid(rrect(16.5, 5.5, 4, 15, 1.2), "orange", 1) + line("M3 10.5 9 6l4 2.5L20 2.8", "red", 1.8, 0.6),
    "u-parabola": solid(rrect(2.5, 3.5, 19, 17, 5), "pink") + white("M6 6.5Q12 26 18 6.5", 2.4)
      + `<path d="${circ(12, 16.2, 1.8)}" fill="${g("gold")}"/>`,
    "u-compass": solid(circ(12, 12, 9.4), "teal") + `<path d="${circ(12, 12, 6.8)}" fill="#fff"/>`
      + `<path d="M12 5.6l2.2 6.4h-4.4Z" fill="${g("red")}"/><path d="M12 18.4l2.2-6.4h-4.4Z" fill="${TONES.gray[1]}"/>`
      + `<path d="${circ(12, 12, 1.3)}" fill="${dk("teal")}"/>`,
  };

  const UNIT_ICONS = { u1: "u-expr", u2: "u-scale", u3: "u-puzzle", u4: "u-chart", u5: "u-parabola", u6: "u-compass" };

  function icon(name, opts = {}) {
    const size = opts.size ?? 24;
    const cls = opts.cls ? ` ${opts.cls}` : "";
    const a11y = opts.label
      ? `role="img" aria-label="${App.Utils.esc(opts.label)}"`
      : 'aria-hidden="true" focusable="false"';
    return `<svg class="ico ico-${name}${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" ${a11y}><use href="#i-${name}"/></svg>`;
  }

  /* ================= Mascotes ================= */
  const CHARS = {
    raiz: { name: "Raiz", light: "#c8f8a4", mid: "#5fd35a", dark: "#23913d", rim: "#1c7633", belly: ["#f4ffe9", "#c6f3a8"], mark: "√" },
    lumi: { name: "Lumi", light: "#cdeeff", mid: "#55b6f7", dark: "#1f6fd1", rim: "#18569f", belly: ["#f2faff", "#c4e5ff"], mark: "∞" },
    brasa: { name: "Brasa", light: "#ffe2b2", mid: "#ff9d42", dark: "#e05d17", rim: "#a9430d", belly: ["#fff6e8", "#ffd9ab"], mark: "π" },
  };

  // Mapeia os humores antigos para as poses novas.
  const POSE_ALIAS = { cheer: "correct", sad: "wrong" };
  const POSES = ["idle", "happy", "study", "correct", "wrong", "streak", "encourage", "finish", "levelup"];

  const BODY = "M80 30C117 30 135 58 135 92C135 125 112 145 80 145C48 145 25 125 25 92C25 58 43 30 80 30Z";
  const INK = "#2a1d3d";
  const LINE_ATTR = `fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;

  function mascotDefs(key) {
    const c = CHARS[key];
    return `
      <radialGradient id="m-${key}-body" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c.light}"/><stop offset=".5" stop-color="${c.mid}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient>
      <linearGradient id="m-${key}-limb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.mid}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>
      <radialGradient id="m-${key}-belly" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="${c.belly[0]}"/><stop offset="1" stop-color="${c.belly[1]}"/></radialGradient>`;
  }

  const SHARED_MASCOT_DEFS = `
    <radialGradient id="m-eyewhite" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe5f2"/></radialGradient>
    <radialGradient id="m-iris" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#6a7fc0"/><stop offset=".6" stop-color="#2c3770"/><stop offset="1" stop-color="#151b3d"/></radialGradient>
    <linearGradient id="m-shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    <radialGradient id="m-shine" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="m-leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b6f58c"/><stop offset="1" stop-color="#2f9e45"/></linearGradient>
    <radialGradient id="m-glow" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fffbe0"/><stop offset="1" stop-color="#ffc23d"/></radialGradient>
    <radialGradient id="m-burst" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe066" stop-opacity=".85"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>`;

  function eyeOpen(cx, cy, [dx, dy] = [0, 0], ir = 10) {
    const ix = cx + dx;
    const iy = cy + dy + 2;
    return `<g class="m-eye">
      <ellipse cx="${cx}" cy="${cy}" rx="14" ry="16.5" fill="url(#m-eyewhite)" stroke="${INK}" stroke-opacity=".2" stroke-width="1.5"/>
      <circle cx="${ix}" cy="${iy}" r="${ir}" fill="url(#m-iris)"/>
      <circle cx="${ix}" cy="${iy}" r="${f2(ir * 0.45)}" fill="#0b0f22"/>
      <circle cx="${ix - 3.6}" cy="${iy - 3.6}" r="3.6" fill="#fff"/>
      <circle cx="${ix + 3.6}" cy="${iy + 3.4}" r="1.7" fill="#fff" opacity=".85"/>
    </g>`;
  }
  const eyeHappy = (cx, cy) => `<path ${LINE_ATTR} d="M${cx - 11} ${cy + 4}Q${cx} ${cy - 11} ${cx + 11} ${cy + 4}"/>`;

  const MOUTHS = {
    smile: '<path LINEATTR d="M68 104Q80 115 92 104"/>',
    soft: '<path LINEATTR d="M70 106Q80 112 90 106"/>',
    grin: `<path d="M64 101Q80 124 96 101Q80 107 64 101Z" fill="${INK}"/><path d="M72 112Q80 106 88 112Q80 118 72 112Z" fill="#ff7a9c"/>`,
    open: `<path d="M70 103Q80 116 90 103Q80 106 70 103Z" fill="${INK}"/>`,
    frown: '<path LINEATTR d="M69 113Q80 104 91 113"/>',
    o: `<ellipse cx="80" cy="108" rx="4.5" ry="5" fill="${INK}"/>`,
  };

  function arm(side, angle, extra = "") {
    const px = side === "l" ? 32 : 128;
    const rot = side === "l" ? angle : -angle;
    return `<g class="m-arm m-arm-${side}${extra}" style="transform-origin:${px}px 96px">
      <g transform="rotate(${rot} ${px} 96)"><ellipse cx="${px}" cy="${angle > 90 ? 116 : 113}" rx="10" ry="${angle > 90 ? 20 : 17}" fill="url(#m-KEY-limb)"/></g></g>`;
  }

  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="8.5" fill="url(#m-KEY-body)" stroke="RIMC" stroke-width="1.5"/>`;
  const useIcon = (name, x, y, s, cls = "") => `<use href="#i-${name}" x="${x}" y="${y}" width="${s}" height="${s}"${cls ? ` class="${cls}"` : ""}/>`;

  function headFeature(key) {
    if (key === "raiz") {
      return `<g class="m-sprout" style="transform-origin:80px 34px">
        <path d="M80 36C79 26 81 19 84 13" fill="none" stroke="url(#m-raiz-limb)" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M83 16C74 5 60 6 56 13C63 21 76 22 83 16Z" fill="url(#m-leaf)" stroke="#1c7633" stroke-width="1.5"/>
        <path d="M84 14C90 2 104 1 109 7C103 16 91 19 84 14Z" fill="url(#m-leaf)" stroke="#1c7633" stroke-width="1.5"/>
        <path d="M82 15Q71 11 61 12M86 13Q96 8 104 7" fill="none" stroke="#1c7633" stroke-opacity=".4" stroke-width="1.3" stroke-linecap="round"/>
      </g>`;
    }
    if (key === "lumi") {
      return `<path d="M66 38C62 26 57 20 50 15M94 38C98 26 103 20 110 15" fill="none" stroke="url(#m-lumi-limb)" stroke-width="4" stroke-linecap="round"/>
        <circle class="m-glow" cx="50" cy="15" r="10" fill="#ffe066" opacity=".35"/><circle class="m-glow" cx="110" cy="15" r="10" fill="#ffe066" opacity=".35"/>
        <circle cx="50" cy="15" r="5.5" fill="url(#m-glow)"/><circle cx="110" cy="15" r="5.5" fill="url(#m-glow)"/>`;
    }
    // brasa: orelhinhas e topete de chama
    return `<circle cx="44" cy="50" r="12" fill="url(#m-brasa-limb)"/><circle cx="44" cy="50" r="6" fill="#ffb3a0"/>
      <circle cx="116" cy="50" r="12" fill="url(#m-brasa-limb)"/><circle cx="116" cy="50" r="6" fill="#ffb3a0"/>
      <g class="m-flame" style="transform-origin:80px 36px">
        <path d="M80 8C87 17 97 21 95 33C93 40 67 40 65 33C63 25 71 21 73 13C76 19 78 21 80 23C80 17 79 12 80 8Z" fill="url(#g-orange)"/>
        <path d="M80 20C84 25 88 28 87 34C85 37 75 37 73 34C72 29 77 27 80 20Z" fill="#fff1a8"/>
      </g>`;
  }

  /* Monta o rosto, braços e acessórios de cada pose. */
  function poseParts(pose) {
    const P = { arms: ["l", 22, "r", 22], eyes: "open", look: [0, 0], ir: 10, mouth: "smile", brows: "", back: "", front: "", face: "" };
    switch (pose) {
      case "idle":
        Object.assign(P, { arms: ["l", 16, "r", 16], look: [0, 1], mouth: "soft" });
        break;
      case "study":
        Object.assign(P, { arms: null, look: [0, 4], mouth: "o" });
        P.face = `<g fill="rgba(255,255,255,.14)" stroke="${INK}" stroke-width="3"><circle cx="62" cy="82" r="17.5"/><circle cx="98" cy="82" r="17.5"/></g>
          <path d="M79.5 80Q80 77 80.5 80" stroke="${INK}" stroke-width="3" fill="none"/>`;
        P.front = `<g class="m-book">
          <path d="M42 116Q61 107 80 115Q99 107 118 116V142Q99 134 80 141Q61 134 42 142Z" fill="url(#g-purple)"/>
          <path d="M46 115Q63 108 80 115V137Q63 131 46 137Z" fill="#fff"/>
          <path d="M114 115Q97 108 80 115V137Q97 131 114 137Z" fill="#f1eeff"/>
          <path d="M52 121Q63 116 74 121M52 127Q63 122 74 127M86 121Q97 116 108 121M86 127Q97 122 108 127" stroke="#c9c3f0" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          ${hand(46, 131)}${hand(114, 131)}</g>`;
        break;
      case "correct":
        Object.assign(P, { arms: ["l", 135, "r", 135], eyes: "happy", mouth: "grin" });
        P.front = useIcon("spark", 6, 26, 24, "m-spark") + useIcon("spark", 128, 20, 28, "m-spark m-spark-2") + useIcon("spark", 138, 84, 18, "m-spark m-spark-3");
        break;
      case "wrong":
        Object.assign(P, { arms: ["l", 6, "r", 6], look: [-1, 4], ir: 8, mouth: "frown" });
        P.brows = '<path LINEATTR d="M48 62 70 55M112 62 90 55"/>';
        P.face = '<path class="m-tear" d="M47 98C43 105 43 109 47 109S51 105 47 98Z" fill="url(#g-cyan)"/>';
        break;
      case "streak":
        Object.assign(P, { arms: ["l", 22, "r", 140], look: [2, -2], mouth: "grin" });
        P.brows = '<path LINEATTR d="M49 58 70 62M111 58 90 62"/>';
        P.front = `<g class="m-held-flame" style="transform-origin:143px 66px">${useIcon("flame", 124, 26, 38)}</g>` + useIcon("spark", 6, 40, 18, "m-spark");
        break;
      case "encourage":
        Object.assign(P, { arms: ["l", 22, "r", 140, " m-wave"], eyes: "wink", mouth: "open" });
        P.front = useIcon("heart", 128, 14, 22, "m-float");
        break;
      case "finish":
        Object.assign(P, { arms: null, eyes: "happy", mouth: "grin" });
        P.front = `<g class="m-trophy">${useIcon("trophy", 50, 100, 60)}${hand(64, 121)}${hand(96, 121)}</g>`
          + useIcon("spark", 8, 34, 20, "m-spark") + useIcon("spark", 132, 30, 22, "m-spark m-spark-2");
        break;
      case "levelup":
        Object.assign(P, { arms: ["l", 135, "r", 135], eyes: "happy", mouth: "grin" });
        P.back = `<path class="m-burst" style="transform-origin:80px 84px" d="${starPath(80, 84, 82, 50, 12)}" fill="url(#m-burst)"/>`;
        P.front = useIcon("star", 14, 12, 22, "m-spark") + useIcon("star", 124, 6, 26, "m-spark m-spark-2") + useIcon("star", 140, 70, 16, "m-spark m-spark-3");
        break;
      default: // happy
        break;
    }
    return P;
  }

  function mascot(pose = "happy", size = 110, key = "raiz", opts = {}) {
    pose = POSE_ALIAS[pose] || pose;
    if (!POSES.includes(pose)) pose = "happy";
    if (!CHARS[key]) key = "raiz";
    const c = CHARS[key];
    const p = poseParts(pose);
    const eyes = p.eyes === "happy"
      ? eyeHappy(62, 82) + eyeHappy(98, 82)
      : p.eyes === "wink"
        ? eyeOpen(62, 82, p.look, p.ir) + eyeHappy(98, 82)
        : eyeOpen(62, 82, p.look, p.ir) + eyeOpen(98, 82, p.look, p.ir);
    const arms = p.arms
      ? arm(p.arms[0], p.arms[1]) + arm(p.arms[2], p.arms[3], p.arms[4] || "")
      : "";
    const label = opts.label ?? `${c.name}, mascote`;
    const a11y = label ? `role="img" aria-label="${App.Utils.esc(label)}"` : 'aria-hidden="true" focusable="false"';
    const defs = opts.standalone
      ? `<defs>${SHARED_MASCOT_DEFS}${mascotDefs(key)}${gradientDefs()}</defs>`
      : "";
    const still = opts.still ? " mascot-still" : "";
    const body = `
      ${p.back}
      <ellipse class="m-shadow" cx="80" cy="151" rx="40" ry="6" fill="#22204a" opacity=".16"/>
      <g class="m-body">
        ${headFeature(key)}
        <ellipse cx="60" cy="143" rx="15" ry="8" fill="url(#m-KEY-limb)"/>
        <ellipse cx="100" cy="143" rx="15" ry="8" fill="url(#m-KEY-limb)"/>
        ${arms}
        <path d="${BODY}" fill="url(#m-KEY-body)" stroke="RIMC" stroke-width="2"/>
        <path d="${BODY}" fill="url(#m-shade)"/>
        <ellipse cx="80" cy="129" rx="27" ry="13" fill="url(#m-KEY-belly)"/>
        <text x="80" y="134" text-anchor="middle" font-size="14" fill="RIMC" opacity=".45" ${FONT}>${c.mark}</text>
        <ellipse cx="56" cy="50" rx="20" ry="11" transform="rotate(-22 56 50)" fill="url(#m-shine)"/>
        <circle cx="42" cy="68" r="3" fill="#fff" opacity=".6"/>
        <ellipse cx="44" cy="102" rx="8" ry="5" fill="#ff8fb8" opacity=".5"/>
        <ellipse cx="116" cy="102" rx="8" ry="5" fill="#ff8fb8" opacity=".5"/>
        ${p.brows}${eyes}${MOUTHS[p.mouth]}${p.face}
        ${p.front}
      </g>`.replace(/KEY/g, key).replace(/RIMC/g, c.rim).replace(/LINEATTR/g, LINE_ATTR);
    return `<svg class="mascot mascot-${pose} char-${key}${still}" viewBox="0 0 160 160" width="${size}" height="${size}" ${a11y}>${defs}${body}</svg>`;
  }

  /* ================= Emblemas de nível (viewBox 100×100) ================= */
  const TIERS = [
    { name: "Semente", shape: "medal", metal: "bronze", stars: 1, ribbon: "orange" },
    { name: "Broto", shape: "medal", metal: "silver", stars: 2, ribbon: "blue" },
    { name: "Explorador", shape: "medal", metal: "gold", stars: 3, ribbon: "purple" },
    { name: "Cristal", shape: "shield", metal: "gold", gem: "emerald", ribbon: "green" },
    { name: "Safira", shape: "shield", metal: "gold", gem: "sapphire", wings: true, ribbon: "blue" },
    { name: "Ametista", shape: "star", metal: "gold", gem: "amethyst", wings: true, ribbon: "purple" },
    { name: "Rubi", shape: "star", metal: "gold", gem: "ruby", wings: true, crown: true, ribbon: "red" },
    { name: "Diamante", shape: "hex", metal: "platinum", gem: "diamond", wings: true, crown: true, rays: true, ribbon: "cyan" },
    { name: "Lenda", shape: "hex", metal: "gold", gem: "prism", wings: true, crown: true, rays: true, ribbon: "pink" },
  ];
  const METALS = {
    bronze: ["#ffd5ad", "#d88a4b", "#8f4c1e"],
    silver: ["#ffffff", "#cfd6e2", "#7d889e"],
    gold: ["#fff2a6", "#ffc23d", "#b86f00"],
    platinum: ["#ffffff", "#dfe7f5", "#8a9bbd"],
  };
  const GEMS = {
    emerald: ["#b4ffd4", "#22c55e", "#0f6b3a"],
    sapphire: ["#bfe0ff", "#3b82f6", "#1e3a8a"],
    amethyst: ["#e6ceff", "#9b5cff", "#4c1d95"],
    ruby: ["#ffbdc9", "#f43f5e", "#881337"],
    diamond: ["#ffffff", "#a5f3fc", "#38bdf8"],
  };

  function levelTier(level) {
    const index = Math.max(0, Math.min(TIERS.length, Math.floor(level) || 1) - 1);
    return { ...TIERS[index], index, total: TIERS.length };
  }

  function emblemShape(t) {
    const m = `url(#e-${t.metal})`;
    const md = METALS[t.metal][2];
    const layer = (d, extra = "") =>
      `<path d="${d}" fill="${md}" transform="translate(0 3)"/><path d="${d}" fill="${m}" stroke="${md}" stroke-width="1.5" stroke-linejoin="round"${extra}/>`;
    const inner = (d) => `<path d="${d}" fill="${t.gem ? `url(#e-${t.gem})` : "rgba(0,0,0,.1)"}" opacity="${t.gem ? 0.35 : 1}"/>`
      + `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>`;
    if (t.shape === "medal") return layer(circ(50, 46, 32)) + inner(circ(50, 46, 24));
    if (t.shape === "shield") {
      return layer("M50 10L80 20V46C80 66 67 80 50 88C33 80 20 66 20 46V20Z")
        + inner("M50 18L73 26V46C73 61 63 72 50 79C37 72 27 61 27 46V26Z");
    }
    if (t.shape === "star") return layer(starPath(50, 47, 38, 29, 8, -90)) + inner(circ(50, 47, 22));
    return layer(polyPath(50, 47, 38, 6)) + inner(polyPath(50, 47, 29, 6));
  }

  function emblemCenter(t) {
    if (t.shape === "medal") {
      const starFill = t.metal === "gold" ? "#fff" : g("gold");
      const starD = t.metal === "gold" ? "#c77c00" : dk("gold");
      const pos = t.stars === 1 ? [[50, 47, 15]] : t.stars === 2 ? [[39, 47, 11], [61, 47, 11]] : [[35, 50, 9.5], [50, 40, 12], [65, 50, 9.5]];
      return pos.map(([x, y, r]) => {
        const d = starPath(x, y, r, r * 0.48);
        return `<path d="${d}" fill="${starD}" stroke="${starD}" stroke-width="2" stroke-linejoin="round" transform="translate(0 1.6)"/>`
          + `<path d="${d}" fill="${starFill}" stroke="${starFill}" stroke-width="2" stroke-linejoin="round"/>`;
      }).join("");
    }
    const fill = `url(#e-${t.gem})`;
    return `<g class="em-gem">
      <path d="M50 27L65 37.5L58.5 62H41.5L35 37.5Z" fill="rgba(0,0,0,.25)" transform="translate(0 2.5)"/>
      <path d="M50 27L65 37.5L58.5 62H41.5L35 37.5Z" fill="${fill}" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M35 37.5L50 44L65 37.5M50 27V44L41.5 62M50 44L58.5 62" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>
      <path d="M50 27L42 36L50 44Z" fill="#fff" opacity=".5"/></g>`;
  }

  function levelEmblem(level, size = 64, opts = {}) {
    const lv = Math.max(1, Math.floor(level) || 1);
    const t = levelTier(lv);
    const wing = '<path d="M24 52C10 52 2 42 2 30C8 36 13 38 19 38C12 34 9 28 9 21C15 28 21 31 27 31C22 28 20 23 21 17C26 25 31 30 32 38Z" fill="url(#e-wing)" stroke="#b9c3e6" stroke-width="1.5" stroke-linejoin="round"/>';
    const rays = t.rays ? `<path class="em-rays" style="transform-origin:50px 47px" d="${starPath(50, 47, 50, 34, 16)}" fill="url(#e-rays)"/>` : "";
    const wings = t.wings ? `<g class="em-wings">${wing}<g transform="translate(100 0) scale(-1 1)">${wing}</g></g>` : "";
    const crown = t.crown
      ? `<path d="M36 13L41 3L50 10L59 3L64 13L62 19H38Z" fill="${dk("gold")}" transform="translate(0 2)"/><path d="M36 13L41 3L50 10L59 3L64 13L62 19H38Z" fill="${g("gold")}" stroke="${dk("gold")}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="50" cy="14" r="2.4" fill="${g("red")}"/>`
      : "";
    const ribbonD = "M20 74H80L75 82L80 90H20L25 82Z";
    const ribbon = `<path d="${ribbonD}" fill="${dk(t.ribbon)}" transform="translate(0 2)"/><path d="${ribbonD}" fill="${g(t.ribbon)}"/>`
      + `<text x="50" y="86.4" text-anchor="middle" font-size="11" fill="#fff" ${FONT}>NV ${lv}</text>`;
    const label = opts.label ?? `Nível ${lv}: ${t.name}`;
    const a11y = label ? `role="img" aria-label="${App.Utils.esc(label)}"` : 'aria-hidden="true" focusable="false"';
    const cls = `emblem-level tier-${t.index + 1}${opts.locked ? " em-locked" : ""}${opts.cls ? ` ${opts.cls}` : ""}`;
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 100 100" ${a11y}>${rays}${wings}${emblemShape(t)}${emblemCenter(t)}`
      + `<ellipse cx="38" cy="26" rx="10" ry="5" transform="rotate(-30 38 26)" fill="#fff" opacity=".45"/>${crown}${ribbon}</svg>`;
  }

  /* ================= Conquistas (viewBox 64×64) ================= */
  const BADGE_ART = {
    "first-lesson": { glyph: "sprout", tone: "green" },
    perfect: { glyph: "gem", tone: "cyan" },
    "streak-3": { glyph: "flame", tone: "orange", count: "3" },
    "streak-7": { glyph: "flame", tone: "red", count: "7" },
    "correct-50": { glyph: "target", tone: "pink", count: "50" },
    "level-3": { glyph: "rocket", tone: "purple" },
    practice: { glyph: "review", tone: "teal" },
    simulado: { glyph: "paper", tone: "blue" },
  };

  function badgeArt(id, on = true, size = 64, opts = {}) {
    const a = BADGE_ART[id] || { glyph: "medal", tone: "gold" };
    const tone = on ? a.tone : "gray";
    const frame = polyPath(32, 30, 26, 6);
    const glyph = on ? a.glyph : "lock";
    const count = on && a.count
      ? `<circle cx="50" cy="49" r="10" fill="${dk("gold")}" transform="translate(0 1.5)"/><circle cx="50" cy="49" r="10" fill="${g("gold")}" stroke="#fff" stroke-width="2"/>`
        + `<text x="50" y="53" text-anchor="middle" font-size="${a.count.length > 1 ? 9 : 11}" fill="#fff" ${FONT}>${a.count}</text>`
      : "";
    const label = opts.label ?? "";
    const a11y = label ? `role="img" aria-label="${App.Utils.esc(label)}"` : 'aria-hidden="true" focusable="false"';
    return `<svg class="emblem-badge${on ? "" : " em-locked"}" width="${size}" height="${size}" viewBox="0 0 64 64" ${a11y}>
      <path d="${frame}" fill="${dk(tone)}" stroke="${dk(tone)}" stroke-width="6" stroke-linejoin="round" transform="translate(0 3)"/>
      <path d="${frame}" fill="${g(tone)}" stroke="${g(tone)}" stroke-width="6" stroke-linejoin="round"/>
      <path d="${polyPath(32, 30, 20, 6)}" fill="#fff" opacity="${on ? 0.92 : 0.6}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
      <path d="M14 20Q22 8 32 6" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round"/>
      ${useIcon(glyph, 18, 16, 28)}${count}</svg>`;
  }

  /* ================= Sprite (gradientes + ícones) ================= */
  function gradientDefs() {
    const lg = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    const diag = (id, [a, b, c]) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
    return Object.entries(TONES).map(([k, [a, b]]) => lg(`g-${k}`, a, b)).join("")
      + Object.entries(METALS).map(([k, v]) => diag(`e-${k}`, v)).join("")
      + Object.entries(GEMS).map(([k, v]) => diag(`e-${k}`, v)).join("")
      + '<linearGradient id="e-prism" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9acb"/><stop offset=".3" stop-color="#ffe066"/><stop offset=".55" stop-color="#7ee6a8"/><stop offset=".8" stop-color="#7cc4ff"/><stop offset="1" stop-color="#b79bff"/></linearGradient>'
      + lg("e-wing", "#ffffff", "#d7dffa")
      + '<radialGradient id="e-rays" cx=".5" cy=".5" r=".5"><stop offset=".4" stop-color="#ffe066" stop-opacity=".9"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>';
  }

  function spriteMarkup() {
    const symbols = Object.entries(ICONS)
      .map(([name, body]) => `<symbol id="i-${name}" viewBox="0 0 24 24" overflow="visible">${body}</symbol>`)
      .join("");
    const defs = gradientDefs() + SHARED_MASCOT_DEFS + Object.keys(CHARS).map(mascotDefs).join("")
      + (App.World ? App.World.defs() : "") + (App.Avatars ? App.Avatars.defs() : "");
    // Sem display:none: em alguns navegadores isso desligaria os gradientes referenciados.
    return `<svg id="art-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>${defs}</defs>${symbols}</svg>`;
  }

  function mount(doc = document) {
    if (doc.getElementById("art-sprite")) return;
    doc.body.insertAdjacentHTML("afterbegin", spriteMarkup());
  }

  /* Favicon: o Raiz em um SVG independente (leva os próprios gradientes). */
  function faviconDataUri() {
    return `data:image/svg+xml,${encodeURIComponent(mascot("happy", 64, "raiz", { standalone: true, still: true, label: "" })
      .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '))}`;
  }

  App.Art = {
    ICONS,
    UNIT_ICONS,
    CHARS,
    POSES,
    TIERS,
    BADGE_ART,
    icon,
    mascot,
    levelTier,
    levelEmblem,
    badgeArt,
    spriteMarkup,
    mount,
    faviconDataUri,
  };
})(window.App);
