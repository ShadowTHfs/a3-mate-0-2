/*
 * Persistência do perfil.
 * Hoje: localStorage deste navegador. Para migrar para Supabase depois,
 * basta trocar load/save/reset mantendo o mesmo formato de perfil.
 */
window.App = window.App || {};
(function (App) {
  "use strict";

  const KEY = "desafio-algebrico:profile";
  const VERSION = 1;
  let memoryFallback = null; // usado se o localStorage estiver bloqueado (modo privado, etc.)

  function createProfile(now) {
    return {
      version: VERSION,
      name: "",
      avatar: App.AVATARS[0],
      onboarded: false,
      createdAt: now,
      xp: 0,
      hearts: 5,
      heartsUpdatedAt: now,
      streak: 0,
      bestStreak: 0,
      lastActiveDate: null,
      totals: { answered: 0, correct: 0, wrong: 0, lessonsCompleted: 0, practiceSessions: 0, simulados: 0 },
      byTopic: {},
      mistakes: {},
      lessons: {},
      badges: {},
      simulados: [],
    };
  }

  function load(now = Date.now()) {
    let raw = null;
    try {
      raw = window.localStorage.getItem(KEY);
    } catch (e) {
      raw = memoryFallback;
    }
    if (!raw) return createProfile(now);
    try {
      const saved = JSON.parse(raw);
      const base = createProfile(now);
      // Mescla com os padrões: campos novos em versões futuras não quebram perfis antigos.
      return { ...base, ...saved, totals: { ...base.totals, ...(saved.totals || {}) } };
    } catch (e) {
      return createProfile(now);
    }
  }

  function save(profile) {
    const json = JSON.stringify(profile);
    try {
      window.localStorage.setItem(KEY, json);
      return true;
    } catch (e) {
      memoryFallback = json;
      return false;
    }
  }

  function reset(now = Date.now()) {
    try {
      window.localStorage.removeItem(KEY);
    } catch (e) {
      /* ignora */
    }
    memoryFallback = null;
    return createProfile(now);
  }

  App.Store = { KEY, createProfile, load, save, reset };
})(window.App);
