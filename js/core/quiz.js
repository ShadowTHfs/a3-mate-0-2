/*
 * Motor de sessão de quiz (sem DOM). Controla fila, alternativas, dicas e reenvio de erros.
 * O gabarito é comparado pelo TEXTO da alternativa, então embaralhar nunca troca a resposta certa.
 */
window.App = window.App || {};
(function (App) {
  "use strict";
  const { shuffle } = App.Utils;

  function lessonQuestions(lesson, bank) {
    return lesson.questions.map((id) => bank.find((q) => q.id === id)).filter(Boolean);
  }

  /* Revisão: primeiro as questões com erros pendentes (mais erros primeiro), o resto completa com sorteio. */
  function buildPractice(profile, bank, size = 10, rng = Math.random) {
    const weak = bank
      .filter((q) => profile.mistakes[q.id])
      .sort((a, b) => profile.mistakes[b.id] - profile.mistakes[a.id]);
    const picked = weak.slice(0, size);
    if (picked.length < size) {
      const rest = shuffle(bank.filter((q) => !picked.includes(q)), rng);
      picked.push(...rest.slice(0, size - picked.length));
    }
    return shuffle(picked, rng);
  }

  function buildSimulado(bank, size = 10, rng = Math.random) {
    return shuffle(bank, rng).slice(0, size);
  }

  function newItem(q, retry, attempts) {
    return { q, retry, attempts, options: [], usedHint: false };
  }

  function createSession({ mode, questions, lessonId = null, xpStart = 0, rng = Math.random, now = Date.now() }) {
    return {
      mode,
      lessonId,
      rng,
      xpStart,
      allowRetry: mode !== "simulado", // simulado não reenfileira erros, como uma prova
      startedAt: now,
      queue: questions.map((q) => newItem(q, false, 0)),
      index: 0,
      total: questions.length,
      resolved: 0,
      selected: null,
      verified: false,
      hintUsed: false,
      lastCorrect: null,
      mistakes: 0,
      correctFirst: 0,
      xp: 0,
      heartsLost: 0,
      outOfHearts: false,
      finished: false,
    };
  }

  function current(session) {
    return session.queue[session.index] || null;
  }

  /* Prepara a questão atual: embaralha as alternativas e zera o estado da rodada. */
  function present(session) {
    const item = current(session);
    if (!item) return null;
    item.options = shuffle([item.q.answer, ...item.q.distractors], session.rng);
    session.selected = null;
    session.verified = false;
    session.hintUsed = false;
    session.lastCorrect = null;
    return item;
  }

  function select(session, index) {
    const item = current(session);
    if (!item || session.verified || session.finished) return false;
    if (index < 0 || index >= item.options.length) return false;
    session.selected = index;
    return true;
  }

  function useHint(session) {
    const item = current(session);
    if (!item || session.verified || session.hintUsed) return null;
    session.hintUsed = true;
    item.usedHint = true;
    return item.q.hint;
  }

  function verify(session) {
    const item = current(session);
    if (!item || session.verified || session.selected === null) return null;
    const correct = item.options[session.selected] === item.q.answer;
    item.attempts += 1;
    session.verified = true;
    session.lastCorrect = correct;

    let requeued = false;
    if (correct) {
      session.resolved += 1;
      if (!item.retry && item.attempts === 1) session.correctFirst += 1;
    } else {
      session.mistakes += 1;
      if (session.allowRetry && !item.retry) {
        session.queue.push(newItem(item.q, true, item.attempts)); // volta ao fim da fila uma vez
        requeued = true;
      } else {
        session.resolved += 1; // segunda falha ou simulado: a questão se encerra
      }
    }
    return { correct, item, usedHint: item.usedHint, requeued };
  }

  function next(session) {
    if (!session.verified) return null;
    session.index += 1;
    if (session.index >= session.queue.length) {
      session.finished = true;
      return null;
    }
    return present(session);
  }

  App.Quiz = {
    lessonQuestions,
    buildPractice,
    buildSimulado,
    createSession,
    current,
    present,
    select,
    useHint,
    verify,
    next,
  };
})(window.App);
