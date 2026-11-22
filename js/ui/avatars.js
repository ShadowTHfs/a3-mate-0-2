/*
 * Personagens jogáveis (avatares). Sprites originais em SVG, no mesmo estilo dos mascotes:
 * contorno escuro limpo, gradientes para volume e animação idle (respirar, piscar, acessórios).
 * O perfil guarda só o id do personagem (ex.: "kai").
 */
window.App = window.App || {};
(function (App) {
  "use strict";

  const INK = "#2a1d3d";
  const O = `stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;

  /* Cores por personagem: [claro, escuro] */
  const CHARACTERS = [
    {
      id: "kai", name: "Kai", role: "Aventureiro",
      bio: "Topa qualquer desafio e nunca desiste de uma questão difícil.",
      stats: { logica: 3, velocidade: 4, criatividade: 4 },
      color: "#22b04a",
      c: { skin: ["#ffd9b5", "#e3a57a"], hair: ["#a8622f", "#5e2f14"], outfit: ["#6fd27f", "#2f8a45"], pants: ["#7a5a3a", "#4b3420"], shoe: ["#8a4b25", "#5e2f14"], accent: ["#ff6b6b", "#c92a3a"] },
    },
    {
      id: "nova", name: "Nova", role: "Tecnológica",
      bio: "Resolve tudo com método. Se tem padrão, ela encontra.",
      stats: { logica: 5, velocidade: 3, criatividade: 3 },
      color: "#14a898",
      c: { skin: ["#b47852", "#7a4a2c"], hair: ["#a98bff", "#5b2fc4"], outfit: ["#4fe0cc", "#0f8f80"], pants: ["#3b3f6b", "#22254a"], shoe: ["#eef2ff", "#a5adcf"], accent: ["#7ef9ff", "#16b8d6"] },
    },
    {
      id: "lyra", name: "Lyra", role: "Maga",
      bio: "Transforma equações em feitiços. Adora uma boa incógnita.",
      stats: { logica: 4, velocidade: 2, criatividade: 5 },
      color: "#9b5cff",
      c: { skin: ["#ffe6d6", "#f0b89a"], hair: ["#f6c2ff", "#b05ad8"], outfit: ["#c99cff", "#6a35c9"], pants: ["#6a35c9", "#40208a"], shoe: ["#40208a", "#2a145e"], accent: ["#ffe680", "#e09b00"] },
    },
    {
      id: "tor", name: "Tor", role: "Guerreiro",
      bio: "Encara a prova de frente. Sequência de acertos é com ele.",
      stats: { logica: 3, velocidade: 3, criatividade: 2 },
      color: "#f0294f",
      c: { skin: ["#e8ab7c", "#b06e42"], hair: ["#ff8a5c", "#c2410c"], outfit: ["#ff6b81", "#b3123a"], pants: ["#4a3b6b", "#2b2245"], shoe: ["#7a4a2c", "#4b2a16"], accent: ["#f4f6fb", "#97a3ba"] },
    },
    {
      id: "iara", name: "Iara", role: "Exploradora",
      bio: "Descobre o caminho mais curto até a resposta certa.",
      stats: { logica: 4, velocidade: 4, criatividade: 3 },
      color: "#ff7a1a",
      c: { skin: ["#c88a60", "#8a5233"], hair: ["#5a3826", "#1e110a"], outfit: ["#ffb867", "#e8590c"], pants: ["#6b7a3a", "#454f22"], shoe: ["#7a4a2c", "#4b2a16"], accent: ["#f4e2b5", "#b8914a"] },
    },
    {
      id: "bit", name: "Bit", role: "Robô",
      bio: "Calcula em milissegundos e nunca esquece uma fórmula.",
      stats: { logica: 5, velocidade: 5, criatividade: 1 },
      color: "#3b82f6",
      c: { skin: ["#cfe8ff", "#5b9cf6"], hair: ["#9aa6c4", "#5d6788"], outfit: ["#b9d8ff", "#3b82f6"], pants: ["#8b97b8", "#56607f"], shoe: ["#56607f", "#363d57"], accent: ["#7ef9ff", "#16b8d6"] },
    },
    {
      id: "sombra", name: "Sombra", role: "Misteriosa",
      bio: "Silenciosa e atenta. Acha a pegadinha antes de todo mundo.",
      stats: { logica: 4, velocidade: 4, criatividade: 4 },
      color: "#4c3d9e",
      c: { skin: ["#f2cdb2", "#cf9c7c"], hair: ["#3a2f63", "#1a1436"], outfit: ["#6a58c9", "#231a5c"], pants: ["#2b2350", "#17122e"], shoe: ["#17122e", "#0b0818"], accent: ["#ff8ef5", "#c026d3"] },
    },
    {
      id: "zip", name: "Zip", role: "Veloz",
      bio: "Responde antes de você piscar. Simulado cronometrado é com ele.",
      stats: { logica: 3, velocidade: 5, criatividade: 3 },
      color: "#ffb020",
      c: { skin: ["#ffe0bd", "#e0a979"], hair: ["#ffe066", "#ff8a1f"], outfit: ["#7cb7ff", "#1d4ed8"], pants: ["#2b3b6b", "#18224a"], shoe: ["#ff6b6b", "#c92a3a"], accent: ["#ffe066", "#f59f00"] },
    },
  ];
  const BY_ID = Object.fromEntries(CHARACTERS.map((ch) => [ch.id, ch]));
  const STAT_LABELS = { logica: "Lógica", velocidade: "Velocidade", criatividade: "Criatividade" };

  const gid = (id, part) => `url(#av-${id}-${part})`;

  /* ---------- Peças comuns ---------- */
  const legs = (id) => `
    <rect x="46" y="114" width="12" height="20" rx="5" fill="${gid(id, "pants")}" ${O}/>
    <rect x="62" y="114" width="12" height="20" rx="5" fill="${gid(id, "pants")}" ${O}/>
    <path d="M41 139Q41 129 52 129Q60 129 60 139Z" fill="${gid(id, "shoe")}" ${O}/>
    <path d="M60 139Q60 129 68 129Q79 129 79 139Z" fill="${gid(id, "shoe")}" ${O}/>`;

  const torso = (id, extra = "") => `
    <path d="M38 94Q38 84 48 84H72Q82 84 82 94V114Q82 121 75 121H45Q38 121 38 114Z" fill="${gid(id, "outfit")}" ${O}/>${extra}`;

  /* Braço: contorno grosso + manga + mão. side l|r, pose "down" ou "up" */
  function arm(id, side, pose = "down", sleeve = "outfit", hand = "skin") {
    const l = side === "l";
    const path = pose === "up"
      ? (l ? "M44 92Q32 84 28 70" : "M76 92Q88 84 92 70")
      : (l ? "M44 92Q33 100 33 113" : "M76 92Q87 100 87 113");
    const end = pose === "up" ? (l ? [28, 68] : [92, 68]) : (l ? [33, 115] : [87, 115]);
    return `<g class="av-arm av-arm-${side}">
      <path d="${path}" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
      <path d="${path}" fill="none" stroke="${gid(id, sleeve)}" stroke-width="10" stroke-linecap="round"/>
      <circle cx="${end[0]}" cy="${end[1]}" r="6.2" fill="${gid(id, hand)}" ${O}/></g>`;
  }

  const head = (id, ears = true) => `
    ${ears ? `<circle cx="29" cy="58" r="7" fill="${gid(id, "skin")}" ${O}/><circle cx="91" cy="58" r="7" fill="${gid(id, "skin")}" ${O}/>` : ""}
    <circle cx="60" cy="52" r="31" fill="${gid(id, "skinr")}" ${O}/>
    <ellipse cx="42" cy="66" rx="6" ry="3.6" fill="#ff7fa8" opacity=".45"/>
    <ellipse cx="78" cy="66" rx="6" ry="3.6" fill="#ff7fa8" opacity=".45"/>`;

  function eyes(kind = "open") {
    if (kind === "wink") {
      return `<g class="av-eyes"><ellipse cx="48" cy="56" rx="5" ry="6.8" fill="${INK}"/><circle cx="49.8" cy="53.4" r="2.1" fill="#fff"/></g>
        <path d="M66 57Q72 51 78 57" fill="none" ${O} stroke-width="3"/>`;
    }
    if (kind === "narrow") {
      return `<g class="av-eyes"><path d="M42 56Q48 51 54 56Q48 59 42 56Z" fill="#c026d3" ${O} stroke-width="2"/>
        <path d="M66 56Q72 51 78 56Q72 59 66 56Z" fill="#c026d3" ${O} stroke-width="2"/>
        <circle cx="48" cy="55.6" r="1.4" fill="#fff"/><circle cx="72" cy="55.6" r="1.4" fill="#fff"/></g>`;
    }
    const lash = kind === "lash"
      ? `<path d="M42.5 51.5l-3-2.5M77.5 51.5l3-2.5" ${O} stroke-width="2"/>`
      : "";
    return `<g class="av-eyes"><ellipse cx="48" cy="56" rx="5" ry="6.8" fill="${INK}"/><ellipse cx="72" cy="56" rx="5" ry="6.8" fill="${INK}"/>
      <circle cx="49.8" cy="53.4" r="2.1" fill="#fff"/><circle cx="73.8" cy="53.4" r="2.1" fill="#fff"/>
      <circle cx="46.6" cy="59" r="1" fill="#fff" opacity=".8"/><circle cx="70.6" cy="59" r="1" fill="#fff" opacity=".8"/>${lash}</g>`;
  }

  const MOUTH = {
    grin: `<path d="M51 67Q60 78 69 67Q60 70 51 67Z" fill="#7a1f3d" ${O} stroke-width="2"/>`,
    smile: `<path d="M53 68Q60 74 67 68" fill="none" ${O} stroke-width="2.6"/>`,
    smirk: `<path d="M53 69Q62 73 68 66" fill="none" ${O} stroke-width="2.6"/>`,
    open: `<path d="M53 66Q60 80 67 66Z" fill="#7a1f3d" ${O} stroke-width="2"/><path d="M56 73Q60 70 64 73Q60 76 56 73Z" fill="#ff8fa3"/>`,
    tongue: `<path d="M51 66Q60 78 69 66Q60 69 51 66Z" fill="#7a1f3d" ${O} stroke-width="2"/><path d="M60 72Q64 72 64 76Q61 79 59 75Z" fill="#ff8fa3"/>`,
  };
  const brows = (d) => `<path d="${d}" fill="none" ${O} stroke-width="3"/>`;

  /* ---------- Cada personagem ---------- */
  const DRAW = {
    kai(id) {
      return {
        back: "",
        body: legs(id) + torso(id, `
          <path d="M46 85L52 121M74 85L68 121" stroke="#7a4a2c" stroke-width="4" stroke-linecap="round"/>
          <rect x="38" y="106" width="44" height="6" fill="#7a4a2c" ${O} stroke-width="1.8"/>
          <rect x="56" y="104.5" width="8" height="9" rx="2" fill="#ffd23f" ${O} stroke-width="1.6"/>
          <path d="M46 84Q60 96 74 84Q74 90 60 94Q46 90 46 84Z" fill="${gid(id, "accent")}" ${O} stroke-width="2"/>`)
          + arm(id, "l") + arm(id, "r", "up"),
        face: brows("M42 46Q48 43 54 46M66 46Q72 43 78 46") + eyes() + MOUTH.grin,
        front: `
          <path d="M29 52C26 30 40 17 60 17C80 17 94 30 91 52L85 42L80 48L74 37L68 45L60 34L52 45L46 37L40 48L35 42Z" fill="${gid(id, "hair")}" ${O}/>
          <path d="M29 43Q60 31 91 43L91 49Q60 37 29 49Z" fill="${gid(id, "accent")}" ${O} stroke-width="2"/>
          <path d="M90 45L103 38L101 50Z" fill="${gid(id, "accent")}" ${O} stroke-width="2"/>
          <path d="M40 30Q48 24 58 24" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>`,
        extra: "",
      };
    },
    nova(id) {
      return {
        back: `<path d="M26 52C26 26 42 16 60 16C78 16 94 26 94 52V80Q94 87 87 87H33Q26 87 26 80Z" fill="${gid(id, "hair")}" ${O}/>`,
        body: legs(id) + torso(id, `
          <path d="M48 94H56V102H64V94H72M60 102V112" stroke="#b8fff3" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/>
          <circle cx="60" cy="112" r="3.6" fill="${gid(id, "accent")}" class="av-glow"/>
          <path d="M44 84Q60 98 76 84" fill="none" ${O} stroke-width="2"/>`)
          + arm(id, "l") + arm(id, "r"),
        face: brows("M42 46Q48 44 54 47M66 45Q72 42 78 45") + eyes() + MOUTH.smirk,
        front: `
          <path d="M28 52C28 28 44 18 62 18C80 18 92 30 92 47C80 41 67 35 57 27C51 38 41 46 28 52Z" fill="${gid(id, "hair")}" ${O}/>
          <path d="M30 42Q60 4 90 42" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
          <path d="M30 42Q60 4 90 42" fill="none" stroke="#4b5170" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="28" cy="56" r="9" fill="#4b5170" ${O}/><circle cx="28" cy="56" r="4.5" fill="${gid(id, "accent")}" class="av-glow"/>
          <circle cx="92" cy="56" r="9" fill="#4b5170" ${O}/><circle cx="92" cy="56" r="4.5" fill="${gid(id, "accent")}" class="av-glow"/>
          <path d="M26 64Q28 74 44 73" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
          <circle cx="45" cy="73" r="3" fill="${gid(id, "accent")}" ${O} stroke-width="1.6"/>`,
        extra: "",
      };
    },
    lyra(id) {
      return {
        back: `<path d="M26 50C24 30 40 20 60 20C80 20 96 30 94 50C98 76 96 100 88 114C81 102 83 86 82 76H38C37 86 39 102 32 114C24 100 22 76 26 50Z" fill="${gid(id, "hair")}" ${O}/>`,
        body: `
          <path d="M41 136Q42 104 46 90Q52 84 60 84Q68 84 74 90Q78 104 79 136Z" fill="${gid(id, "outfit")}" ${O}/>
          <path d="M52 86L60 100L68 86" fill="none" stroke="${gid(id, "accent")}" stroke-width="3" stroke-linecap="round"/>
          <circle cx="60" cy="104" r="3" fill="${gid(id, "accent")}" ${O} stroke-width="1.4"/>
          <path d="M44 128Q60 134 76 128" fill="none" stroke="${gid(id, "accent")}" stroke-width="2.4"/>`
          + arm(id, "l") + `
          <g class="av-float"><path d="M87 116L101 88" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
          <path d="M87 116L101 88" stroke="#a0673a" stroke-width="3" stroke-linecap="round"/>
          <path d="M102 76l2.6 6 6.4.6-4.8 4.2 1.4 6.3-5.6-3.3-5.6 3.3 1.4-6.3-4.8-4.2 6.4-.6Z" fill="${gid(id, "accent")}" ${O} stroke-width="1.8" class="av-glow"/></g>`
          + arm(id, "r"),
        face: brows("M43 47Q48 45 53 47M67 47Q72 45 77 47") + eyes("lash") + MOUTH.smile,
        front: `
          <path d="M30 48C32 32 44 26 60 26C76 26 88 32 90 48C80 42 70 40 62 33C56 42 44 46 30 48Z" fill="${gid(id, "hair")}" ${O}/>
          <ellipse cx="60" cy="29" rx="40" ry="9" fill="#6a35c9" ${O}/>
          <path d="M37 28Q48 6 57-5Q66-12 84-8Q71-1 73 9L84 28Z" fill="url(#av-lyra-hat)" ${O}/>
          <path d="M38 24Q60 30 83 24L84 28Q60 34 37 28Z" fill="${gid(id, "accent")}" ${O} stroke-width="1.8"/>
          <circle cx="58" cy="12" r="2" fill="#ffe680"/><circle cx="68" cy="2" r="1.6" fill="#ffe680"/><circle cx="50" cy="20" r="1.4" fill="#ffe680"/>`,
        extra: "",
      };
    },
    tor(id) {
      return {
        back: `<path d="M27 50Q22 70 32 82Q36 70 35 58ZM93 50Q98 70 88 82Q84 70 85 58Z" fill="${gid(id, "hair")}" ${O}/>`,
        body: legs(id) + torso(id, `
          <path d="M42 88Q60 82 78 88V108Q60 116 42 108Z" fill="${gid(id, "accent")}" ${O}/>
          <path d="M60 88V110" stroke="#97a3ba" stroke-width="2"/>
          <circle cx="40" cy="90" r="8" fill="${gid(id, "accent")}" ${O}/><circle cx="80" cy="90" r="8" fill="${gid(id, "accent")}" ${O}/>`)
          + arm(id, "r") + arm(id, "l") + `
          <g class="av-float"><circle cx="30" cy="110" r="16" fill="#3b82f6" ${O}/>
          <circle cx="30" cy="110" r="12" fill="none" stroke="#ffd23f" stroke-width="3"/>
          <text x="30" y="116" text-anchor="middle" font-size="15" font-weight="900" fill="#ffd23f" font-family="Nunito, system-ui, sans-serif">Σ</text></g>`,
        face: brows("M42 45L54 48M78 45L66 48") + eyes() + MOUTH.grin,
        front: `
          <path d="M28 47C28 22 42 13 60 13C78 13 92 22 92 47Z" fill="url(#av-tor-helm)" ${O}/>
          <path d="M28 44H92V50H28Z" fill="#c9d1e0" ${O} stroke-width="2"/>
          <path d="M60 13V44" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>
          <path d="M28 34Q14 30 10 16Q22 22 30 26ZM92 34Q106 30 110 16Q98 22 90 26Z" fill="#fff" ${O} stroke-width="2"/>
          <path d="M40 22Q46 17 54 16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`,
        extra: "",
      };
    },
    iara(id) {
      return {
        back: `<g fill="${gid(id, "hair")}" ${O}><circle cx="34" cy="42" r="15"/><circle cx="86" cy="42" r="15"/><circle cx="30" cy="62" r="11"/><circle cx="90" cy="62" r="11"/></g>`,
        body: legs(id) + torso(id, `
          <path d="M52 84L56 121H64L68 84Z" fill="#fff4dc" ${O} stroke-width="2"/>
          <rect x="42" y="100" width="10" height="9" rx="2" fill="#e8590c" ${O} stroke-width="1.6"/>
          <rect x="68" y="100" width="10" height="9" rx="2" fill="#e8590c" ${O} stroke-width="1.6"/>
          <path d="M48 85Q60 98 72 85" fill="none" stroke="${INK}" stroke-width="2"/>
          <g class="av-float"><rect x="50" y="94" width="20" height="9" rx="3" fill="#3a3f5c" ${O} stroke-width="1.8"/>
          <circle cx="54" cy="104" r="5" fill="#3a3f5c" ${O} stroke-width="1.8"/><circle cx="66" cy="104" r="5" fill="#3a3f5c" ${O} stroke-width="1.8"/>
          <circle cx="54" cy="104" r="2.4" fill="#7ef9ff"/><circle cx="66" cy="104" r="2.4" fill="#7ef9ff"/></g>`)
          + arm(id, "l") + arm(id, "r", "up"),
        face: brows("M42 45Q48 41 54 45M66 45Q72 41 78 45") + eyes() + MOUTH.open,
        front: `
          <path d="M31 48Q34 34 46 32Q50 38 60 36Q70 38 74 32Q86 34 89 48Q80 42 72 44Q66 40 60 42Q54 40 48 44Q40 42 31 48Z" fill="${gid(id, "hair")}" ${O}/>
          <ellipse cx="60" cy="30" rx="41" ry="8.5" fill="${gid(id, "accent")}" ${O}/>
          <path d="M38 30Q39 7 60 7Q81 7 82 30Z" fill="${gid(id, "accent")}" ${O}/>
          <path d="M38.6 24Q60 30 81.4 24L82 30Q60 36 38 30Z" fill="#8a5a2b" ${O} stroke-width="1.8"/>
          <path d="M48 14Q54 10 62 10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`,
        extra: "",
      };
    },
    bit(id) {
      return {
        back: "",
        body: `
          <rect x="46" y="114" width="12" height="18" rx="3" fill="${gid(id, "pants")}" ${O}/>
          <rect x="62" y="114" width="12" height="18" rx="3" fill="${gid(id, "pants")}" ${O}/>
          <rect x="40" y="128" width="20" height="10" rx="4" fill="${gid(id, "shoe")}" ${O}/>
          <rect x="60" y="128" width="20" height="10" rx="4" fill="${gid(id, "shoe")}" ${O}/>
          <rect x="38" y="84" width="44" height="36" rx="10" fill="${gid(id, "outfit")}" ${O}/>
          <rect x="47" y="92" width="26" height="18" rx="5" fill="#1b1d3a" ${O} stroke-width="2"/>
          <circle cx="54" cy="101" r="3" fill="#ff6b6b" class="av-glow"/><circle cx="60" cy="101" r="3" fill="#ffe066" class="av-glow av-d1"/><circle cx="66" cy="101" r="3" fill="#7ef9ff" class="av-glow av-d2"/>`
          + arm(id, "l", "down", "hair", "hair") + arm(id, "r", "up", "hair", "hair"),
        face: `
          <rect x="36" y="36" width="48" height="34" rx="10" fill="#1b1d3a" ${O}/>
          <g class="av-eyes"><rect x="44" y="46" width="9" height="12" rx="4.5" fill="${gid(id, "accent")}"/><rect x="67" y="46" width="9" height="12" rx="4.5" fill="${gid(id, "accent")}"/></g>
          <path d="M52 62Q60 67 68 62" fill="none" stroke="${gid(id, "accent")}" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M40 40H58" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>`,
        front: `
          <path d="M60 22V8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M60 22V8" stroke="#9aa6c4" stroke-width="2.4" stroke-linecap="round"/>
          <circle cx="60" cy="6" r="5" fill="#ff6b6b" ${O} class="av-glow"/>`,
        extra: "",
        headOverride: `
          <rect x="24" y="48" width="8" height="16" rx="3" fill="#9aa6c4" ${O}/><rect x="88" y="48" width="8" height="16" rx="3" fill="#9aa6c4" ${O}/>
          <rect x="29" y="22" width="62" height="58" rx="16" fill="${gid(id, "skin")}" ${O}/>
          <path d="M36 30Q44 25 56 25" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>`,
      };
    },
    sombra(id) {
      return {
        back: `<path d="M22 62C18 26 40 10 60 10C80 10 102 26 98 62C97 80 86 92 60 94C34 92 23 80 22 62Z" fill="${gid(id, "outfit")}" ${O}/>`,
        body: `
          <path d="M34 136Q36 100 44 88Q52 82 60 82Q68 82 76 88Q84 100 86 136Q74 130 60 136Q46 130 34 136Z" fill="${gid(id, "outfit")}" ${O}/>
          <path d="M60 86V132" stroke="#17122e" stroke-width="2" opacity=".5"/>
          <path d="M56 88A6 6 0 1 0 64 94A4.6 4.6 0 1 1 56 88Z" fill="#ffd23f" ${O} stroke-width="1.6"/>`
          + arm(id, "l", "down", "outfit") + arm(id, "r", "down", "outfit"),
        face: `
          <path d="M34 72Q60 84 86 72V76Q80 86 60 88Q40 86 34 76Z" fill="#2b2350" ${O} stroke-width="2"/>
          ${brows("M42 49L54 52M78 49L66 52")}${eyes("narrow")}`,
        front: `
          <path d="M42 36Q54 32 66 42Q56 38 46 46Z" fill="${gid(id, "hair")}" ${O} stroke-width="2"/>
          <path d="M28 60C28 30 44 18 60 18C76 18 92 30 92 60C88 40 76 30 60 30C44 30 32 40 28 60Z" fill="${gid(id, "outfit")}" ${O}/>
          <path d="M40 26Q50 20 62 20" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none" stroke-linecap="round"/>`,
        extra: `<circle class="av-orb" cx="100" cy="40" r="4" fill="${gid(id, "accent")}"/><circle class="av-orb av-d1" cx="18" cy="84" r="3" fill="${gid(id, "accent")}"/><circle class="av-orb av-d2" cx="102" cy="100" r="2.6" fill="${gid(id, "accent")}"/>`,
        headOverride: `<circle cx="60" cy="58" r="27" fill="${gid(id, "skinr")}" ${O}/>`,
      };
    },
    zip(id) {
      return {
        back: `<g class="av-speed" stroke="${gid(id, "accent")}" stroke-width="4" stroke-linecap="round" opacity=".7"><path d="M4 90H22"/><path d="M0 104H18"/><path d="M8 118H24"/></g>`,
        body: legs(id) + torso(id, `
          <path d="M63 88L52 104H60L55 118L69 99H61L66 88Z" fill="${gid(id, "accent")}" ${O} stroke-width="1.8"/>
          <path d="M44 84Q50 92 52 84M76 84Q70 92 68 84" fill="#fff" ${O} stroke-width="1.6"/>`)
          + arm(id, "l") + arm(id, "r"),
        face: brows("M42 46Q48 42 54 46M66 45Q72 42 78 46") + eyes("wink") + MOUTH.tongue,
        front: `
          <path d="M28 52C24 30 42 15 64 17C84 19 98 29 106 24C102 35 97 39 92 41C101 43 105 47 110 45C103 56 95 54 90 50C88 41 77 34 64 34C50 34 37 40 30 52Z" fill="${gid(id, "hair")}" ${O}/>
          <path d="M30 39Q60 30 90 39" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
          <path d="M30 39Q60 30 90 39" fill="none" stroke="#3a3f5c" stroke-width="4" stroke-linecap="round"/>
          <circle cx="48" cy="35" r="9" fill="#ffb020" ${O}/><circle cx="48" cy="35" r="5.6" fill="#9ff4ff"/>
          <circle cx="72" cy="35" r="9" fill="#ffb020" ${O}/><circle cx="72" cy="35" r="5.6" fill="#9ff4ff"/>
          <path d="M45 32L49 30M69 32L73 30" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
        extra: "",
      };
    },
  };

  /* Gradientes de todos os personagens (vão para o sprite global da página). */
  function defs() {
    const lg = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    let out = "";
    for (const ch of CHARACTERS) {
      for (const [part, [a, b]] of Object.entries(ch.c)) out += lg(`av-${ch.id}-${part}`, a, b);
      out += `<radialGradient id="av-${ch.id}-skinr" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="${ch.c.skin[0]}"/><stop offset=".7" stop-color="${ch.c.skin[0]}"/><stop offset="1" stop-color="${ch.c.skin[1]}"/></radialGradient>`;
    }
    out += lg("av-lyra-hat", "#9b7bff", "#4c2fb5") + lg("av-tor-helm", "#ffffff", "#97a3ba");
    out += '<radialGradient id="av-stage" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
    return out;
  }

  /*
   * Sprite completo. opts.portrait = só busto (cabeça e ombros), para chips e listas.
   * opts.label = texto acessível ("" = decorativo).
   */
  function sprite(id, size = 120, opts = {}) {
    const ch = BY_ID[id] || CHARACTERS[0];
    const d = DRAW[ch.id](ch.id);
    const headPart = d.headOverride != null ? d.headOverride : head(ch.id);
    const label = opts.label ?? `${ch.name}, ${ch.role.toLowerCase()}`;
    const a11y = label ? `role="img" aria-label="${App.Utils.esc(label)}"` : 'aria-hidden="true" focusable="false"';
    const vb = opts.portrait ? "16 -4 88 96" : "-4 -14 128 160";
    const h = opts.portrait ? size : Math.round(size * 1.25);
    const still = opts.still ? " av-still" : "";
    return `<svg class="avatar-sprite av-${ch.id}${still}" viewBox="${vb}" width="${size}" height="${h}" ${a11y}>
      ${opts.portrait ? "" : '<ellipse class="av-shadow" cx="60" cy="140" rx="30" ry="5" fill="#22204a" opacity=".2"/>'}
      ${d.back ? `<g class="av-back">${d.back}</g>` : ""}
      <g class="av-body">${d.body}</g>
      <g class="av-head">${headPart}${d.face}${d.front}</g>
      ${d.extra}
    </svg>`;
  }

  const normalize = (value) => App.normalizeAvatar(value);

  App.Avatars = { CHARACTERS, BY_ID, STAT_LABELS, sprite, defs, normalize, get: (id) => BY_ID[normalize(id)] };
})(window.App);
