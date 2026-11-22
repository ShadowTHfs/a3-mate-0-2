/*
 * Mundos do mapa de fases: cenário de cada mundo, ilhas flutuantes (uma por fase),
 * cadeado, baú de recompensa e medalhão do mundo. Tudo em SVG.
 * Cada unidade da trilha vira um mundo temático (WORLDS[unit.id]).
 */
window.App = window.App || {};
(function (App) {
  "use strict";

  const INK = "#2a1d3d";
  const OL = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;

  const WORLDS = {
    u1: {
      theme: "forest", name: "Floresta das Variáveis", short: "Floresta",
      sky: ["#86dcff", "#dcf8d2"], ground: ["#8ee66f", "#34a84a"], dirt: ["#a8703f", "#6b4426"], rock: ["#b98b5e", "#5e4028"],
      accent: "#1f8a3c", glow: "#b6ff7a", particle: "firefly", bottom: "#2f8f52",
    },
    u2: {
      theme: "desert", name: "Deserto do Equilíbrio", short: "Deserto",
      sky: ["#ffa65c", "#ffe9b8"], ground: ["#ffe596", "#e9b04a"], dirt: ["#d99b5b", "#a8642c"], rock: ["#e0a466", "#8f5426"],
      accent: "#b45309", glow: "#ffe066", particle: "dust", bottom: "#d18a3a",
    },
    u3: {
      theme: "ice", name: "Picos Gelados", short: "Gelo",
      sky: ["#6fb8ff", "#eaf6ff"], ground: ["#ffffff", "#c4e4ff"], dirt: ["#9cc6ef", "#5f88bd"], rock: ["#a3c4e6", "#47679a"],
      accent: "#1f5fa8", glow: "#9ff4ff", particle: "snow", bottom: "#a9cdee",
    },
    u4: {
      theme: "volcano", name: "Vulcão das Funções", short: "Vulcão",
      sky: ["#2b1238", "#c2410c"], ground: ["#6b5a62", "#3b2f38"], dirt: ["#4a3a44", "#241b27"], rock: ["#54434e", "#1f1722"],
      accent: "#c2410c", glow: "#ff9b3d", particle: "ember", bottom: "#2b1d26",
    },
    u5: {
      theme: "reef", name: "Recife das Parábolas", short: "Recife",
      sky: ["#139fc2", "#9df0e4"], ground: ["#ffe7b8", "#f0bc78"], dirt: ["#ffa3b5", "#d9567d"], rock: ["#ff9ab0", "#a8325e"],
      accent: "#be185d", glow: "#7ef9ff", particle: "bubble", bottom: "#0f7f9c",
    },
    u6: {
      theme: "sky", name: "Céu do ENEM", short: "Céu",
      sky: ["#140d45", "#5b3bc4"], ground: ["#ffffff", "#d4ccff"], dirt: ["#b7a6ff", "#6d4fe0"], rock: ["#9b86ff", "#3d2596"],
      accent: "#5a3fd6", glow: "#d6c8ff", particle: "star", bottom: "#2a1d6e",
    },
  };
  const FALLBACK = "u1";
  const world = (unitId) => WORLDS[unitId] || WORLDS[FALLBACK];

  /* Pseudoaleatório determinístico (mesmo desenho a cada renderização). */
  function rng(seed) {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  /* ================= Gradientes e símbolos (vão no sprite global) ================= */
  function defs() {
    const lg = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    let out = "";
    for (const w of Object.values(WORLDS)) {
      const t = w.theme;
      out += lg(`w-${t}-sky`, w.sky[0], w.sky[1]) + lg(`w-${t}-ground`, w.ground[0], w.ground[1])
        + lg(`w-${t}-dirt`, w.dirt[0], w.dirt[1]) + lg(`w-${t}-rock`, w.rock[0], w.rock[1]);
      out += `<radialGradient id="w-${t}-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${w.glow}" stop-opacity=".9"/><stop offset="1" stop-color="${w.glow}" stop-opacity="0"/></radialGradient>`;
    }
    out += lg("w-wood", "#c98a4b", "#7a4a22") + lg("w-gold", "#fff2a6", "#e09b00") + lg("w-steel", "#eef2fb", "#8792a8")
      + lg("w-plaque", "#fffaf0", "#e8dcc6") + lg("w-crystal", "#e8fdff", "#38c6f0", 1, 1) + lg("w-lava", "#ffe066", "#ff4d1a")
      + lg("w-obsidian", "#6b4f8f", "#241838") + lg("w-coral", "#ffb3c7", "#f0457a") + lg("w-portal", "#ff8ef5", "#7c5cff", 1, 1)
      + lg("w-leaf", "#8ee66f", "#2b8f3e") + lg("w-cream", "#fffaf0", "#f0dcb8") + lg("w-red", "#ff7a8a", "#d91e45")
      + lg("w-snow", "#ffffff", "#d6ecff") + lg("w-shell", "#fff1e6", "#ffb38a")
      + '<radialGradient id="w-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe0"/><stop offset=".55" stop-color="#ffe680" stop-opacity=".9"/><stop offset="1" stop-color="#ffe680" stop-opacity="0"/></radialGradient>'
      + '<radialGradient id="w-chest-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe066" stop-opacity=".95"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>';
    // Elementos de cenário reaproveitados
    out += `
      <clipPath id="w-clip"><circle cx="40" cy="40" r="34"/></clipPath>
      <symbol id="w-pine" viewBox="0 0 40 70"><path d="M20 2L36 30H28L38 50H26V68H14V50H2L12 30H4Z"/></symbol>
      <symbol id="w-cloud" viewBox="0 0 120 50"><path d="M20 46C8 46 2 38 6 30C10 22 20 22 24 24C26 12 38 6 50 10C58 2 76 2 84 14C96 10 110 18 108 30C118 32 118 46 106 46Z"/></symbol>
      <symbol id="w-cactus" viewBox="0 0 40 70"><path d="M16 68V12Q16 4 20 4Q24 4 24 12V68ZM16 40H8Q4 40 4 34V22Q4 18 7 18Q10 18 10 22V33H16ZM24 30H30V18Q30 14 33 14Q36 14 36 18V32Q36 38 30 38H24Z"/></symbol>
      <symbol id="w-seaweed" viewBox="0 0 30 90"><path d="M14 90C4 76 22 66 12 52C4 40 20 30 12 16C10 10 14 4 16 2C20 12 26 22 18 34C12 44 28 54 20 66C14 76 24 82 20 90Z"/></symbol>`;
    return out;
  }

  /* ================= Cenário de cada mundo (viewBox 800×800, recorte "slice") ================= */
  function particles(kind, count, seed) {
    const r = rng(seed);
    let out = "";
    for (let i = 0; i < count; i += 1) {
      const x = Math.round(40 + r() * 720);
      const y = Math.round(60 + r() * 680);
      const d = (r() * 6).toFixed(2);
      const dur = (4 + r() * 5).toFixed(2);
      const style = `style="animation-delay:-${d}s;animation-duration:${dur}s"`;
      if (kind === "firefly") out += `<circle class="wp wp-float" ${style} cx="${x}" cy="${y}" r="${(3 + r() * 3).toFixed(1)}" fill="#f6ff9e"/>`;
      else if (kind === "snow") out += `<circle class="wp wp-fall" ${style} cx="${x}" cy="${y - 200}" r="${(2.5 + r() * 4).toFixed(1)}" fill="#fff"/>`;
      else if (kind === "ember") out += `<circle class="wp wp-rise" ${style} cx="${x}" cy="${y + 150}" r="${(2 + r() * 3).toFixed(1)}" fill="#ffb24d"/>`;
      else if (kind === "bubble") out += `<circle class="wp wp-rise" ${style} cx="${x}" cy="${y + 150}" r="${(4 + r() * 6).toFixed(1)}" fill="none" stroke="#e8ffff" stroke-width="2"/>`;
      else if (kind === "dust") out += `<circle class="wp wp-drift" ${style} cx="${x}" cy="${y}" r="${(2 + r() * 2).toFixed(1)}" fill="#fff4cf"/>`;
      else out += `<path class="wp wp-twinkle" ${style} d="M${x} ${y - 9}L${x + 2.5} ${y - 2.5}L${x + 9} ${y}L${x + 2.5} ${y + 2.5}L${x} ${y + 9}L${x - 2.5} ${y + 2.5}L${x - 9} ${y}L${x - 2.5} ${y - 2.5}Z" fill="#fff"/>`;
    }
    return `<g class="w-particles">${out}</g>`;
  }

  const SCENES = {
    forest: () => `
      <circle cx="640" cy="140" r="130" fill="url(#w-sun)"/>
      <use href="#w-cloud" class="w-drift" x="60" y="80" width="200" height="84" fill="#fff" opacity=".85"/>
      <use href="#w-cloud" class="w-drift w-d2" x="470" y="230" width="150" height="62" fill="#fff" opacity=".7"/>
      <path d="M0 420Q120 330 260 390T520 370T800 350V800H0Z" fill="#9ce3b5"/>
      ${[60, 120, 170, 300, 360, 600, 660, 720].map((x, i) => `<use href="#w-pine" x="${x}" y="${330 + (i % 3) * 14}" width="${40 + (i % 2) * 10}" height="${70 + (i % 2) * 16}" fill="#5fbf8a"/>`).join("")}
      <path d="M0 560Q160 470 340 530T800 500V800H0Z" fill="#62c785"/>
      <path d="M-20 800V560Q30 520 80 560Q120 500 170 560V800Z" fill="#3fa868"/>
      <g fill="#2f8f52"><circle cx="40" cy="520" r="70"/><circle cx="120" cy="470" r="60"/><circle cx="0" cy="440" r="60"/></g>
      <rect x="62" y="540" width="24" height="200" rx="8" fill="#7a4a22"/>
      <g fill="#2f8f52"><circle cx="760" cy="500" r="70"/><circle cx="690" cy="460" r="55"/><circle cx="800" cy="430" r="60"/></g>
      <rect x="732" y="520" width="24" height="220" rx="8" fill="#7a4a22"/>
      <path d="M0 720Q60 680 120 720Q180 690 240 730Q320 690 400 726Q480 690 560 730Q640 690 700 722Q760 690 800 716V800H0Z" fill="#2f8f52"/>
      <g><rect x="196" y="700" width="8" height="18" fill="#fff4dc"/><path d="M186 704Q200 682 214 704Z" fill="#ff5c6c"/></g>
      <g><rect x="616" y="708" width="7" height="14" fill="#fff4dc"/><path d="M607 711Q619 693 631 711Z" fill="#ff5c6c"/></g>`,
    desert: () => `
      <circle cx="600" cy="170" r="150" fill="url(#w-sun)"/>
      <use href="#w-cloud" class="w-drift" x="80" y="110" width="170" height="70" fill="#fff6e0" opacity=".7"/>
      <path d="M0 440Q200 360 420 420T800 400V800H0Z" fill="#ffd28a"/>
      <path d="M470 420L560 300L650 420Z" fill="#f3b55e"/><path d="M560 300L650 420H560Z" fill="#d18a3a"/>
      <path d="M600 420L660 340L720 420Z" fill="#f3b55e"/><path d="M660 340L720 420H660Z" fill="#d18a3a"/>
      <path d="M0 560Q180 480 400 540T800 520V800H0Z" fill="#f2b766"/>
      <use href="#w-cactus" x="30" y="500" width="70" height="122" fill="#3fa868"/>
      <use href="#w-cactus" x="700" y="560" width="56" height="98" fill="#2f8f52"/>
      <path d="M0 700Q140 650 300 700T600 690T800 680V800H0Z" fill="#d18a3a"/>`,
    ice: () => `
      <path class="w-aurora" d="M0 160Q200 90 400 170T800 140V230Q600 260 400 210T0 250Z" fill="#8affd8" opacity=".35"/>
      <path class="w-aurora w-d2" d="M0 220Q220 160 420 230T800 200V270Q600 300 400 260T0 300Z" fill="#c69bff" opacity=".28"/>
      <path d="M0 470L130 300L230 420L360 250L500 430L620 290L800 460V800H0Z" fill="#cfe6ff"/>
      <path d="M130 300L165 345L140 340L115 360L100 340ZM360 250L400 300L372 296L348 314L330 290ZM620 290L655 335L630 330L605 348L592 330Z" fill="#fff"/>
      <path d="M0 580Q200 500 400 560T800 540V800H0Z" fill="#e6f3ff"/>
      ${[40, 90, 700, 750].map((x, i) => `<use href="#w-pine" x="${x}" y="${470 + (i % 2) * 20}" width="48" height="86" fill="#5f88bd"/>`).join("")}
      <path d="M0 710Q120 670 260 710T540 700T800 690V800H0Z" fill="#fff"/>`,
    volcano: () => `
      <path d="M230 480L360 200H440L570 480Z" fill="#3b2230"/>
      <path class="w-lavaglow" d="M360 200Q400 170 440 200L430 222Q400 205 370 222Z" fill="url(#w-lava)"/>
      <path d="M392 214Q400 300 380 400Q398 330 412 250Z" fill="url(#w-lava)" opacity=".85"/>
      <circle class="w-smoke" cx="400" cy="160" r="40" fill="#5b4552" opacity=".55"/>
      <circle class="w-smoke w-d2" cx="430" cy="110" r="30" fill="#5b4552" opacity=".45"/>
      <path d="M0 520Q160 440 320 500T640 470T800 480V800H0Z" fill="#3a2a35"/>
      <path d="M0 640Q200 590 400 640T800 620V800H0Z" fill="#2b1d26"/>
      <path class="w-lavaglow" d="M120 680Q200 670 260 700Q320 720 420 700M540 660Q600 690 700 670" fill="none" stroke="url(#w-lava)" stroke-width="6" stroke-linecap="round"/>
      <path d="M30 640L60 590L95 640ZM690 610L720 565L760 615Z" fill="#1f1520"/>`,
    reef: () => `
      <path class="w-rays" d="M140 0L220 0L120 600L60 600ZM420 0L470 0L420 600L360 600ZM640 0L700 0L720 600L650 600Z" fill="#fff" opacity=".12"/>
      <path d="M0 470Q200 420 400 470T800 460V800H0Z" fill="#11a5c2" opacity=".55"/>
      <use href="#w-seaweed" class="w-sway" x="20" y="470" width="50" height="160" fill="#20b07a"/>
      <use href="#w-seaweed" class="w-sway w-d2" x="70" y="520" width="40" height="120" fill="#16956a"/>
      <use href="#w-seaweed" class="w-sway" x="720" y="480" width="50" height="160" fill="#20b07a"/>
      <path d="M0 640Q200 600 400 640T800 630V800H0Z" fill="#f0c890"/>
      <g fill="none" stroke="#ff6f9a" stroke-width="12" stroke-linecap="round"><path d="M640 660V600M640 625L615 600M640 615L665 585"/></g>
      <g fill="none" stroke="#ffb02e" stroke-width="10" stroke-linecap="round"><path d="M170 670V620M170 640L150 615M170 630L192 608"/></g>
      <path d="M0 730Q200 700 400 730T800 720V800H0Z" fill="#e0aa6c"/>`,
    sky: () => {
      const r = rng(7);
      let stars = "";
      for (let i = 0; i < 40; i += 1) stars += `<circle cx="${Math.round(r() * 800)}" cy="${Math.round(r() * 520)}" r="${(0.8 + r() * 1.8).toFixed(1)}" fill="#fff" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
      return `${stars}
      <circle cx="640" cy="150" r="62" fill="#ffb3e1"/><circle cx="626" cy="136" r="62" fill="#ff8fd1" opacity=".5"/>
      <ellipse cx="640" cy="150" rx="110" ry="20" fill="none" stroke="#ffe0f4" stroke-width="6" opacity=".8" transform="rotate(-14 640 150)"/>
      <circle cx="140" cy="210" r="34" fill="#fff6c4"/><circle cx="154" cy="200" r="30" fill="#140d45" opacity=".35"/>
      <g class="w-bob"><path d="M520 380Q560 360 600 380Q590 410 560 420Q530 410 520 380Z" fill="#6d4fe0"/><ellipse cx="560" cy="380" rx="40" ry="10" fill="#d4ccff"/></g>
      <use href="#w-cloud" class="w-drift" x="-20" y="620" width="300" height="125" fill="#c9c0ff" opacity=".75"/>
      <use href="#w-cloud" class="w-drift w-d2" x="520" y="650" width="320" height="133" fill="#b8adff" opacity=".7"/>
      <path d="M0 740Q200 700 400 740T800 730V800H0Z" fill="#9d8cff" opacity=".7"/>`;
    },
  };

  function scene(unitId, seed = 1) {
    const w = world(unitId);
    const t = w.theme;
    return `<svg class="world-scene" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="800" height="800" fill="url(#w-${t}-sky)"/>${SCENES[t]()}${particles(w.particle, 12, seed * 31)}</svg>`;
  }

  /* ================= Construções sobre as ilhas (coord. da ilha 160×170) ================= */
  const STRUCTURES = {
    forest: [
      () => `<rect x="73" y="30" width="14" height="36" rx="4" fill="url(#w-wood)" ${OL}/>
        <g class="isl-sway" fill="url(#w-leaf)" ${OL}><circle cx="62" cy="34" r="16"/><circle cx="98" cy="34" r="16"/><circle cx="80" cy="20" r="22"/></g>
        <circle cx="70" cy="22" r="3.4" fill="#ff5c6c"/><circle cx="92" cy="30" r="3.4" fill="#ff5c6c"/><circle cx="82" cy="12" r="3" fill="#ff5c6c"/>
        <path d="M66 12Q72 6 80 6" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/>`,
      () => `<path d="M64 66V44Q64 38 70 38H90Q96 38 96 44V66Z" fill="url(#w-cream)" ${OL}/>
        <rect x="74" y="50" width="12" height="16" rx="6" fill="#7a4a22" ${OL}/>
        <path d="M48 42Q80 0 112 42Q80 50 48 42Z" fill="url(#w-red)" ${OL}/>
        <g fill="#fff"><circle cx="66" cy="30" r="4"/><circle cx="84" cy="20" r="5"/><circle cx="98" cy="34" r="3.4"/></g>`,
    ],
    desert: [
      () => `<path d="M46 66L80 16L114 66Z" fill="#ffd88a" ${OL}/><path d="M80 16L114 66H80Z" fill="#e0a050"/>
        <path d="M46 66L80 16L114 66Z" fill="none" ${OL}/>
        <path d="M60 46H100M53 56H107M67 36H93" stroke="#c98a3a" stroke-width="1.6"/>
        <path d="M74 66V56Q80 50 86 56V66Z" fill="#6b4426" ${OL}/><circle cx="80" cy="12" r="4" fill="url(#w-gold)" ${OL} stroke-width="1.4"/>`,
      () => `<rect x="54" y="30" width="13" height="36" rx="2" fill="#f2cf8a" ${OL}/><rect x="93" y="38" width="13" height="28" rx="2" fill="#f2cf8a" ${OL}/>
        <path d="M50 24H110V33H50Z" fill="#e8bb6a" ${OL}/><path d="M93 38L106 36V30" fill="none" ${OL}/>
        <path d="M58 36V60M97 44V60" stroke="#c98a3a" stroke-width="1.6"/>
        <circle cx="80" cy="44" r="7" fill="url(#w-crystal)" ${OL} class="isl-glow"/>`,
    ],
    ice: [
      () => `<path d="M80 4L93 30L87 66H73L67 30Z" fill="url(#w-crystal)" ${OL}/>
        <path d="M58 26L66 40L64 66H54L50 40Z" fill="url(#w-crystal)" ${OL}/><path d="M102 30L110 44L106 66H96L94 44Z" fill="url(#w-crystal)" ${OL}/>
        <path d="M80 4L80 66M67 30L80 38L93 30" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" fill="none"/>
        <path d="M74 14L78 8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" class="isl-glow"/>`,
      () => `<path d="M52 66Q52 28 80 28Q108 28 108 66Z" fill="url(#w-snow)" ${OL}/>
        <path d="M56 52H104M60 40H100M70 28V40M90 28V40M66 40V52M80 40V52M94 40V52" stroke="#a9cdee" stroke-width="1.6" fill="none"/>
        <path d="M70 66V56Q80 46 90 56V66Z" fill="#2b4a7a" ${OL}/>`,
    ],
    volcano: [
      () => `<path d="M48 66L70 26H90L112 66Z" fill="#5a4552" ${OL}/>
        <path d="M70 26Q80 20 90 26L86 33Q80 28 74 33Z" fill="url(#w-lava)" class="isl-glow"/>
        <path d="M78 30Q80 46 72 60" stroke="url(#w-lava)" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle class="isl-smoke" cx="80" cy="12" r="8" fill="#8a7480"/><circle class="isl-smoke isl-d2" cx="88" cy="4" r="6" fill="#8a7480"/>`,
      () => `<path d="M64 66V28L80 10L96 28V66Z" fill="url(#w-obsidian)" ${OL}/>
        <rect x="74" y="34" width="12" height="16" rx="6" fill="url(#w-lava)" class="isl-glow"/>
        <path d="M80 10V2" ${OL}/><circle cx="80" cy="2" r="3" fill="#ff9b3d"/>
        <path d="M64 46H58V66H64M96 46H102V66H96" fill="#4a3a5e" ${OL}/>`,
    ],
    reef: [
      () => `<g fill="none" stroke-linecap="round">
        <path d="M80 66V24M80 44L64 28M80 36L96 18M64 28V18M96 18L104 12" stroke="${INK}" stroke-width="12"/>
        <path d="M80 66V24M80 44L64 28M80 36L96 18M64 28V18M96 18L104 12" stroke="url(#w-coral)" stroke-width="8"/></g>
        <circle cx="64" cy="16" r="5" fill="#ffd1dc" ${OL}/><circle cx="104" cy="11" r="4.5" fill="#ffd1dc" ${OL}/>
        <path class="isl-fish" d="M104 46Q112 40 120 46Q112 52 104 46ZM120 46L126 41V51Z" fill="#ffb02e" ${OL} stroke-width="1.6"/>`,
      () => `<path d="M50 64Q48 26 80 18Q112 26 110 64Z" fill="url(#w-shell)" ${OL}/>
        <path d="M80 20V64M66 23L70 64M94 23L90 64M56 32L62 64M104 32L98 64" stroke="#e08a5e" stroke-width="1.8" fill="none"/>
        <circle cx="80" cy="54" r="7" fill="#fff" ${OL} class="isl-glow"/><circle cx="77.6" cy="51.6" r="2" fill="#fff"/>`,
    ],
    sky: [
      () => `<path d="M58 66L62 54H98L102 66Z" fill="#8f7bff" ${OL}/>
        <ellipse cx="80" cy="34" rx="20" ry="26" fill="${INK}" opacity=".9"/>
        <ellipse class="isl-portal" cx="80" cy="34" rx="15" ry="20" fill="url(#w-portal)"/>
        <ellipse cx="80" cy="34" rx="22" ry="28" fill="none" stroke="url(#w-gold)" stroke-width="5"/>
        <ellipse cx="80" cy="34" rx="22" ry="28" fill="none" ${OL}/>
        <circle cx="80" cy="5" r="3.6" fill="#fff" class="isl-glow"/>`,
      () => `<rect x="64" y="34" width="32" height="32" rx="3" fill="#ede9ff" ${OL}/>
        <path d="M60 36Q60 12 80 12Q100 12 100 36Z" fill="url(#w-portal)" ${OL}/>
        <path d="M80 12V34" stroke="${INK}" stroke-width="4"/>
        <path d="M86 22L104 8" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M86 22L104 8" stroke="#ffe066" stroke-width="3.6" stroke-linecap="round"/>
        <rect x="74" y="48" width="12" height="18" rx="6" fill="#5a3fd6" ${OL}/>`,
    ],
  };

  const HANGING = {
    forest: '<path d="M54 120Q50 136 56 148M96 126Q102 140 96 152M74 140Q72 150 76 158" fill="none" stroke="#6b4426" stroke-width="3" stroke-linecap="round"/>',
    desert: '<path d="M70 150Q72 160 70 166M90 146Q88 158 92 164" fill="none" stroke="#e9b04a" stroke-width="3" stroke-dasharray="2 5" stroke-linecap="round"/>',
    ice: '<path d="M44 102L48 124L52 104ZM100 116L104 140L108 114ZM70 130L74 152L78 130Z" fill="#e8fdff" stroke="#7fb3e6" stroke-width="1.5" stroke-linejoin="round"/>',
    volcano: '<path class="isl-glow" d="M62 124Q60 136 64 144Q68 136 66 124ZM98 118Q96 130 100 138Q104 130 102 118Z" fill="url(#w-lava)"/>',
    reef: '<g fill="none" stroke="#ff9ab0" stroke-width="4" stroke-linecap="round"><path d="M52 112Q44 126 48 138"/><path d="M106 116Q114 128 110 142"/></g>',
    sky: '<g fill="#e7e2ff" opacity=".85"><circle cx="50" cy="118" r="10"/><circle cx="62" cy="124" r="12"/><circle cx="104" cy="120" r="11"/><circle cx="94" cy="128" r="9"/></g>',
  };

  const CAP_DECOR = {
    forest: '<path d="M24 66l4-8 3 8M126 70l4-9 3 9M40 74l3-6 3 6M114 78l3-6 3 6" fill="none" stroke="#2b8f3e" stroke-width="2.2" stroke-linecap="round"/><circle cx="36" cy="66" r="3" fill="#ffd23f"/><circle cx="122" cy="76" r="3" fill="#ff8fd1"/>',
    desert: '<path d="M26 70Q34 66 42 70M118 72Q126 68 134 72" stroke="#d99b4b" stroke-width="2" fill="none" stroke-linecap="round"/>',
    ice: '<ellipse cx="38" cy="70" rx="10" ry="4" fill="#fff"/><ellipse cx="124" cy="72" rx="9" ry="3.5" fill="#fff"/>',
    volcano: '<path d="M28 70L34 62L40 70ZM120 72L127 63L133 72Z" fill="#2b1d26"/><path d="M50 78Q70 82 84 76" stroke="url(#w-lava)" stroke-width="2.4" fill="none" stroke-linecap="round" class="isl-glow"/>',
    reef: '<path d="M30 70q4-10 8 0M120 72q4-10 8 0" stroke="#20b07a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="44" cy="74" r="3.4" fill="#fff" stroke="#e08a5e"/>',
    sky: '<path d="M30 66l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z" fill="#ffe680"/><path d="M126 70l2 4 4 1-3 2 1 4-4-2-3 2 1-4-3-2 4-1Z" fill="#ffe680"/>',
  };

  /*
   * Ilha de uma fase. variant escolhe a construção (0/1), number vai na placa.
   */
  function island(unitId, variant, number) {
    const w = world(unitId);
    const t = w.theme;
    const build = STRUCTURES[t][variant % STRUCTURES[t].length]();
    return `<svg class="island-svg" viewBox="0 0 160 170" aria-hidden="true" focusable="false">
      <ellipse class="isl-shadow" cx="80" cy="164" rx="34" ry="5" fill="#000" opacity=".16"/>
      <g class="isl-float">
        ${HANGING[t]}
        <path d="M14 70Q80 92 146 70Q142 108 110 130Q94 156 80 164Q66 156 50 130Q18 108 14 70Z" fill="url(#w-${t}-rock)" ${OL}/>
        <path d="M28 92Q80 112 132 92M44 116Q80 130 116 116M60 138Q80 146 100 138" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M12 66Q80 98 148 66V74Q80 108 12 74Z" fill="url(#w-${t}-dirt)" ${OL}/>
        <ellipse cx="80" cy="66" rx="68" ry="24" fill="url(#w-${t}-ground)" ${OL}/>
        <path d="M30 58Q60 44 104 46" stroke="#fff" stroke-opacity=".45" stroke-width="4" fill="none" stroke-linecap="round"/>
        ${CAP_DECOR[t]}
        <g class="isl-build">${build}</g>
        <g class="isl-plaque">
          <rect x="59" y="86" width="42" height="28" rx="9" fill="#000" opacity=".22" transform="translate(0 3)"/>
          <rect x="59" y="86" width="42" height="28" rx="9" fill="url(#w-plaque)" ${OL}/>
          <text x="80" y="107" text-anchor="middle" font-size="19" font-weight="900" fill="${w.accent}" font-family="Nunito, system-ui, sans-serif">${number}</text>
        </g>
      </g>
    </svg>`;
  }

  /* Cadeado desenhado (fases bloqueadas). */
  function lock(size = 46) {
    return `<svg class="lock-svg" width="${size}" height="${size}" viewBox="0 0 48 52" aria-hidden="true" focusable="false">
      <path d="M14 24V16a10 10 0 0 1 20 0v8" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
      <path d="M14 24V16a10 10 0 0 1 20 0v8" fill="none" stroke="url(#w-steel)" stroke-width="5" stroke-linecap="round"/>
      <rect x="6" y="22" width="36" height="28" rx="8" fill="#000" opacity=".25" transform="translate(0 2)"/>
      <rect x="6" y="22" width="36" height="28" rx="8" fill="url(#w-gold)" ${OL}/>
      <rect x="10" y="26" width="28" height="6" rx="3" fill="#fff" opacity=".4"/>
      <path d="M24 33a4 4 0 0 1 2 7.5V45h-4v-4.5A4 4 0 0 1 24 33Z" fill="${INK}"/>
    </svg>`;
  }

  /* Baú de recompensa do mundo: fechado ou aberto (mundo concluído). */
  function chest(open, size = 96) {
    const lid = open
      ? `<g class="chest-lid-open"><path d="M18 40L24 16Q50 6 76 16L82 40Z" fill="url(#w-wood)" ${OL}/><path d="M22 26Q50 16 78 26" stroke="url(#w-gold)" stroke-width="5" fill="none"/></g>
         <ellipse class="chest-glow" cx="50" cy="44" rx="36" ry="22" fill="url(#w-chest-glow)"/>
         <g class="chest-loot"><circle cx="38" cy="42" r="6" fill="url(#w-gold)" ${OL} stroke-width="1.6"/><circle cx="58" cy="40" r="6" fill="url(#w-gold)" ${OL} stroke-width="1.6"/>
         <path d="M50 26l3 6 6.5.6-5 4.3 1.5 6.4-6-3.4-6 3.4 1.5-6.4-5-4.3 6.5-.6Z" fill="url(#w-gold)" ${OL} stroke-width="1.6"/></g>`
      : `<path d="M14 46Q14 22 50 22Q86 22 86 46Z" fill="url(#w-wood)" ${OL}/><path d="M18 36Q50 26 82 36" stroke="url(#w-gold)" stroke-width="5" fill="none"/>`;
    return `<svg class="chest-svg${open ? " is-open" : ""}" width="${size}" height="${Math.round(size * 0.9)}" viewBox="0 0 100 90" aria-hidden="true" focusable="false">
      <ellipse cx="50" cy="84" rx="34" ry="5" fill="#000" opacity=".2"/>
      ${open ? "" : lid}
      <rect x="14" y="44" width="72" height="38" rx="6" fill="url(#w-wood)" ${OL}/>
      <path d="M14 56H86" stroke="#5e3a1a" stroke-width="2"/>
      <rect x="26" y="44" width="8" height="38" fill="url(#w-gold)" ${OL} stroke-width="1.6"/>
      <rect x="66" y="44" width="8" height="38" fill="url(#w-gold)" ${OL} stroke-width="1.6"/>
      <rect x="42" y="50" width="16" height="16" rx="4" fill="url(#w-gold)" ${OL} stroke-width="1.8"/>
      <circle cx="50" cy="57" r="2.4" fill="${INK}"/>
      ${open ? lid : ""}
    </svg>`;
  }

  /* Medalhão do mundo (barra de mundos). */
  function emblem(unitId, size = 56) {
    const w = world(unitId);
    const t = w.theme;
    return `<svg class="world-emblem" width="${size}" height="${size}" viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <circle cx="40" cy="42" r="36" fill="#000" opacity=".2"/>
      <g clip-path="url(#w-clip)"><rect width="80" height="80" fill="url(#w-${t}-sky)"/>
        <ellipse cx="40" cy="74" rx="40" ry="14" fill="url(#w-${t}-ground)"/>
        <g transform="translate(0 30) scale(.5)">${STRUCTURES[t][0]()}</g></g>
      <circle cx="40" cy="40" r="34" fill="none" stroke="#fff" stroke-width="4"/>
      <circle cx="40" cy="40" r="36.5" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="1.5"/>
    </svg>`;
  }

  App.World = { WORLDS, world, defs, scene, island, lock, chest, emblem };
})(window.App);
