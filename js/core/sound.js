/* Efeitos sonoros sintetizados com Web Audio (sem arquivos externos). Só tocam após um gesto do usuário. */
window.App = window.App || {};
(function (App) {
  "use strict";
  let ctx = null;
  let enabled = true;

  function audio() {
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type = "sine", vol = 0.14) {
    const a = audio();
    if (!a) return;
    const t0 = a.currentTime + start;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(a.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  const SOUNDS = {
    tap: () => tone(560, 0, 0.05, "triangle", 0.08),
    correct: () => { tone(660, 0, 0.12); tone(990, 0.09, 0.2); },
    wrong: () => { tone(220, 0, 0.22, "sawtooth", 0.07); tone(165, 0.14, 0.3, "sawtooth", 0.07); },
    complete: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.28, "triangle", 0.14)),
    levelUp: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.3, "square", 0.06)),
  };

  function play(name) {
    if (!enabled || !SOUNDS[name]) return;
    try { SOUNDS[name](); } catch (e) { /* áudio indisponível: segue em silêncio */ }
  }

  App.Sound = {
    play,
    setEnabled(value) { enabled = !!value; },
    isEnabled() { return enabled; },
  };
})(window.App);
