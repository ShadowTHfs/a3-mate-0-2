/* Regras de gamificação: XP, níveis, vidas, sequência, estrelas e conquistas. Funções puras sobre o perfil. */
window.App = window.App || {};
(function (App) {
  "use strict";
  const { dateKey, addDays, percent } = App.Utils;

  const MAX_HEARTS = 5;
  const HEART_INTERVAL_MS = 2 * 60 * 1000; // 1 vida a cada 2 minutos
  const XP_BY_DIFFICULTY = { 1: 10, 2: 15, 3: 20 };
  const XP_LESSON_FIRST = 20;
  const XP_LESSON_REPEAT = 5;
  const XP_PRACTICE = 10;
  const XP_SIMULADO_HIT = 5;

  /* ---------- Níveis: nível L começa em 50·(L−1)·L XP ---------- */
  function xpForLevel(level) {
    return 50 * (level - 1) * level;
  }

  function levelInfo(xp) {
    let level = 1;
    while (xpForLevel(level + 1) <= xp) level += 1;
    const start = xpForLevel(level);
    const next = xpForLevel(level + 1);
    const span = next - start;
    const into = xp - start;
    return { level, start, next, into, span, ratio: into / span };
  }

  /* ---------- Vidas ----------
   * Tudo é calculado a partir de heartsUpdatedAt (instante em que o relógio da próxima vida começou),
   * que fica salvo no perfil. Por isso recarregar, fechar o navegador ou trocar de página
   * não reinicia a contagem: na volta, o app calcula quantas vidas já deveriam ter voltado.
   */

  /* Corrige dados antigos ou corrompidos: vidas fora de 0..MAX e horário inválido ou no futuro. */
  function sanitizeHearts(profile, now) {
    let hearts = Number(profile.hearts);
    if (!Number.isFinite(hearts)) hearts = MAX_HEARTS;
    profile.hearts = Math.max(0, Math.min(MAX_HEARTS, Math.floor(hearts)));
    const at = Number(profile.heartsUpdatedAt);
    // Horário no futuro (relógio do aparelho voltou) travaria a recarga: recomeça a contagem agora.
    profile.heartsUpdatedAt = Number.isFinite(at) && at <= now ? at : now;
    return profile;
  }

  function refillHearts(profile, now) {
    sanitizeHearts(profile, now);
    if (profile.hearts >= MAX_HEARTS) {
      profile.heartsUpdatedAt = now; // cheio: nenhum contador rodando
      return profile;
    }
    const gained = Math.floor((now - profile.heartsUpdatedAt) / HEART_INTERVAL_MS);
    if (gained > 0) {
      profile.hearts = Math.min(MAX_HEARTS, profile.hearts + gained);
      // Mantém a "sobra" de tempo: quem ficou 5 min fora ganha 2 vidas e já tem 1 min andado da 3ª.
      profile.heartsUpdatedAt =
        profile.hearts >= MAX_HEARTS ? now : profile.heartsUpdatedAt + gained * HEART_INTERVAL_MS;
    }
    return profile;
  }

  function msUntilNextHeart(profile, now) {
    if (profile.hearts >= MAX_HEARTS) return 0;
    return Math.max(0, Math.min(HEART_INTERVAL_MS, profile.heartsUpdatedAt + HEART_INTERVAL_MS - now));
  }

  /* Situação das vidas para a interface. ratio = quanto da próxima vida já recarregou (0..1). */
  function heartsStatus(profile, now) {
    const full = profile.hearts >= MAX_HEARTS;
    const ms = msUntilNextHeart(profile, now);
    return {
      hearts: profile.hearts,
      max: MAX_HEARTS,
      full,
      msNext: ms,
      ratio: full ? 1 : 1 - ms / HEART_INTERVAL_MS,
    };
  }

  function loseHeart(profile, now) {
    refillHearts(profile, now); // contabiliza o que já recarregou antes de descontar
    if (profile.hearts <= 0) return false;
    if (profile.hearts === MAX_HEARTS) profile.heartsUpdatedAt = now; // o temporizador começa agora
    profile.hearts -= 1;
    return true;
  }

  /* ---------- Sequência de dias ---------- */
  function touchStreak(profile, now) {
    const today = dateKey(new Date(now));
    if (profile.lastActiveDate === today) return profile;
    profile.streak = profile.lastActiveDate === addDays(today, -1) ? profile.streak + 1 : 1;
    profile.lastActiveDate = today;
    profile.bestStreak = Math.max(profile.bestStreak, profile.streak);
    return profile;
  }

  function currentStreak(profile, now) {
    const today = dateKey(new Date(now));
    const last = profile.lastActiveDate;
    return last === today || last === addDays(today, -1) ? profile.streak : 0;
  }

  /* ---------- Respostas ---------- */
  function questionXp(difficulty, { usedHint, isRetry }) {
    const base = XP_BY_DIFFICULTY[difficulty] || 10;
    return usedHint || isRetry ? Math.floor(base / 2) : base;
  }

  function topicEntry(profile, topic) {
    if (!profile.byTopic[topic]) profile.byTopic[topic] = { answered: 0, correct: 0 };
    return profile.byTopic[topic];
  }

  /*
   * Registra uma tentativa. Opções:
   * { correct, usedHint, isRetry, consumesHearts, awardXp, now }
   * Acerto zera 1 erro pendente da questão (recuperação); erro soma 1.
   */
  function recordAnswer(profile, question, o) {
    const t = profile.totals;
    const topic = topicEntry(profile, question.topic);
    t.answered += 1;
    topic.answered += 1;
    let xp = 0;
    let heartLost = false;

    if (o.correct) {
      t.correct += 1;
      topic.correct += 1;
      if (profile.mistakes[question.id]) {
        profile.mistakes[question.id] -= 1;
        if (profile.mistakes[question.id] <= 0) delete profile.mistakes[question.id];
      }
      if (o.awardXp !== false) {
        xp = questionXp(question.difficulty, o);
        profile.xp += xp;
      }
    } else {
      t.wrong += 1;
      profile.mistakes[question.id] = (profile.mistakes[question.id] || 0) + 1;
      if (o.consumesHearts) heartLost = loseHeart(profile, o.now);
    }
    touchStreak(profile, o.now);
    return { xp, heartLost };
  }

  /* ---------- Conclusões ---------- */
  function starsFor(mistakes) {
    return mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1;
  }

  function completeLesson(profile, lessonId, { mistakes, now }) {
    const stars = starsFor(mistakes);
    const rec = profile.lessons[lessonId] || { stars: 0, completions: 0 };
    const first = rec.completions === 0;
    const xp = first ? XP_LESSON_FIRST : XP_LESSON_REPEAT;
    rec.completions += 1;
    rec.stars = Math.max(rec.stars, stars);
    profile.lessons[lessonId] = rec;
    profile.totals.lessonsCompleted += 1;
    profile.xp += xp;
    touchStreak(profile, now);
    return { stars, xp, first };
  }

  function completePractice(profile, { now }) {
    profile.totals.practiceSessions += 1;
    profile.xp += XP_PRACTICE;
    touchStreak(profile, now);
    return { xp: XP_PRACTICE };
  }

  function completeSimulado(profile, { hits, total, seconds, now }) {
    const xp = hits * XP_SIMULADO_HIT;
    profile.totals.simulados += 1;
    profile.xp += xp;
    profile.simulados.unshift({ date: dateKey(new Date(now)), hits, total, seconds });
    profile.simulados = profile.simulados.slice(0, 10);
    touchStreak(profile, now);
    return { xp };
  }

  /* ---------- Conquistas ---------- */
  const BADGES = [
    { id: "first-lesson", name: "Primeiro passo", desc: "Conclua sua primeira lição.", check: (p) => p.totals.lessonsCompleted >= 1 },
    { id: "perfect", name: "Perfeição", desc: "Conclua uma lição sem nenhum erro.", check: (p) => Object.values(p.lessons).some((l) => l.stars === 3) },
    { id: "streak-3", name: "Em chamas", desc: "Estude 3 dias seguidos.", check: (p) => p.bestStreak >= 3 },
    { id: "streak-7", name: "Semana perfeita", desc: "Estude 7 dias seguidos.", check: (p) => p.bestStreak >= 7 },
    { id: "correct-50", name: "Atirador", desc: "Acerte 50 questões.", check: (p) => p.totals.correct >= 50 },
    { id: "level-3", name: "Em órbita", desc: "Alcance o nível 3.", check: (p) => levelInfo(p.xp).level >= 3 },
    { id: "practice", name: "Revisor", desc: "Conclua uma revisão de erros.", check: (p) => p.totals.practiceSessions >= 1 },
    { id: "simulado", name: "Simulado feito", desc: "Conclua um simulado.", check: (p) => p.totals.simulados >= 1 },
  ];

  function evaluateBadges(profile, now) {
    const unlocked = [];
    for (const badge of BADGES) {
      if (!profile.badges[badge.id] && badge.check(profile)) {
        profile.badges[badge.id] = now;
        unlocked.push(badge);
      }
    }
    return unlocked;
  }

  /* ---------- Trilha e relatórios ---------- */
  function lessonStates(profile, lessons) {
    let previousDone = true;
    return lessons.map((lesson) => {
      const rec = profile.lessons[lesson.id];
      const completed = !!(rec && rec.completions > 0);
      const unlocked = previousDone;
      previousDone = completed;
      return { lesson, completed, unlocked, stars: rec ? rec.stars : 0 };
    });
  }

  function topicReport(profile) {
    return Object.entries(profile.byTopic)
      .filter(([, v]) => v.answered > 0)
      .map(([topic, v]) => ({
        topic,
        answered: v.answered,
        correct: v.correct,
        accuracy: percent(v.correct, v.answered),
      }))
      .sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered);
  }

  App.Progress = {
    MAX_HEARTS,
    HEART_INTERVAL_MS,
    xpForLevel,
    levelInfo,
    refillHearts,
    msUntilNextHeart,
    heartsStatus,
    sanitizeHearts,
    loseHeart,
    touchStreak,
    currentStreak,
    questionXp,
    recordAnswer,
    starsFor,
    completeLesson,
    completePractice,
    completeSimulado,
    BADGES,
    evaluateBadges,
    lessonStates,
    topicReport,
  };
})(window.App);
