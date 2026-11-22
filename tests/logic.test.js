"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const FILES = [
  "js/core/utils.js",
  "js/core/store.js",
  "js/core/progress.js",
  "js/core/quiz.js",
  "js/data/questions.js",
  "js/data/units.js",
];
const MIN = 60 * 1000;
const DAY_NOON = (day) => new Date(2026, 0, day, 12).getTime();

function loadApp(storage = null) {
  const ctx = { console };
  ctx.window = ctx;
  if (storage) ctx.localStorage = storage;
  vm.createContext(ctx);
  for (const file of FILES) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), ctx, { filename: file });
  }
  return ctx.App;
}

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

/* ---------- Banco de questões e trilha ---------- */

test("banco: ids únicos, 3 distratores distintos e gabarito fora dos distratores", () => {
  const { Data } = loadApp();
  const ids = new Set();
  for (const q of Data.questions) {
    assert.ok(!ids.has(q.id), `id duplicado: ${q.id}`);
    ids.add(q.id);
    assert.equal(q.distractors.length, 3, `${q.id} deve ter 3 distratores`);
    assert.equal(new Set([q.answer, ...q.distractors]).size, 4, `alternativas repetidas em ${q.id}`);
    assert.ok([1, 2, 3].includes(q.difficulty), `dificuldade inválida em ${q.id}`);
    assert.ok(q.text && q.hint && q.explain && q.topic, `campo vazio em ${q.id}`);
  }
});

test("trilha: cada questão está em exatamente uma lição e todas as referências existem", () => {
  const { Data } = loadApp();
  const bankIds = Data.questions.map((q) => q.id);
  const used = Data.units.flatMap((u) => u.lessons.flatMap((l) => l.questions));
  assert.deepEqual([...used].sort(), [...bankIds].sort());
  assert.equal(new Set(used).size, used.length, "questão usada em mais de uma lição");
});

test("trilha: ids de lição únicos e teoria presente", () => {
  const { Data } = loadApp();
  const lessons = Data.units.flatMap((u) => u.lessons);
  assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length);
  for (const l of lessons) assert.ok(l.theory.length > 0, `${l.id} sem teoria`);
});

/* ---------- Níveis, vidas, sequência ---------- */

test("níveis: limites de XP", () => {
  const { Progress: P } = loadApp();
  assert.equal(P.levelInfo(0).level, 1);
  assert.equal(P.levelInfo(99).level, 1);
  assert.equal(P.levelInfo(100).level, 2);
  assert.equal(P.levelInfo(299).level, 2);
  assert.equal(P.levelInfo(300).level, 3);
});

test("vidas: regeneração de 1 a cada 2 minutos, com limite de 5", () => {
  const { Progress: P, Store } = loadApp();
  assert.equal(P.HEART_INTERVAL_MS, 2 * MIN);
  const p = Store.createProfile(0);
  p.hearts = 3;
  p.heartsUpdatedAt = 0;
  P.refillHearts(p, 1.5 * MIN);
  assert.equal(p.hearts, 3, "antes de 2 minutos nada muda");
  assert.equal(P.msUntilNextHeart(p, 1.5 * MIN), 0.5 * MIN);
  P.refillHearts(p, 2 * MIN);
  assert.equal(p.hearts, 4, "exatamente aos 2:00 volta 1 vida");
  assert.equal(p.heartsUpdatedAt, 2 * MIN);
  assert.equal(P.msUntilNextHeart(p, 3 * MIN), 1 * MIN);
  P.refillHearts(p, 200 * MIN);
  assert.equal(p.hearts, 5);
  assert.equal(P.msUntilNextHeart(p, 200 * MIN), 0);
});

test("vidas: tempo fora do app conta várias vidas e preserva a sobra", () => {
  const { Progress: P, Store } = loadApp();
  const p = Store.createProfile(0);
  p.hearts = 1;
  p.heartsUpdatedAt = 0;
  P.refillHearts(p, 5 * MIN); // 5 min fora: +2 vidas, 1 min já andado da próxima
  assert.equal(p.hearts, 3);
  assert.equal(P.msUntilNextHeart(p, 5 * MIN), 1 * MIN);
  P.refillHearts(p, 60 * MIN);
  assert.equal(p.hearts, 5, "nunca passa do máximo");
});

test("vidas: cheio não tem contador; status para a interface", () => {
  const { Progress: P, Store } = loadApp();
  const p = Store.createProfile(0);
  const full = P.heartsStatus(P.refillHearts(p, 10 * MIN), 10 * MIN);
  assert.equal(full.full, true);
  assert.equal(full.msNext, 0);
  assert.equal(p.heartsUpdatedAt, 10 * MIN);
  P.loseHeart(p, 10 * MIN);
  const st = P.heartsStatus(p, 10.5 * MIN);
  assert.equal(st.hearts, 4);
  assert.equal(st.full, false);
  assert.equal(st.msNext, 1.5 * MIN);
  assert.ok(Math.abs(st.ratio - 0.25) < 1e-9);
});

test("vidas: perder vida com contador rodando não reinicia o contador", () => {
  const { Progress: P, Store } = loadApp();
  const p = Store.createProfile(0);
  P.loseHeart(p, 0);            // 4/5, contador começa em 0
  P.loseHeart(p, 1.5 * MIN);    // 3/5, contador continua de 0
  assert.equal(p.hearts, 3);
  assert.equal(p.heartsUpdatedAt, 0);
  P.loseHeart(p, 2.5 * MIN);    // aos 2:00 voltou 1 (4), agora perde 1 (3); próxima em 1:30
  assert.equal(p.hearts, 3);
  assert.equal(P.msUntilNextHeart(p, 2.5 * MIN), 1.5 * MIN);
});

test("vidas: dados inválidos e relógio no futuro são corrigidos", () => {
  const { Progress: P, Store } = loadApp();
  const p = Store.createProfile(0);
  p.hearts = 9;
  P.refillHearts(p, 1000);
  assert.equal(p.hearts, 5);
  p.hearts = "abc";
  P.refillHearts(p, 1000);
  assert.equal(p.hearts, 5);
  p.hearts = -3;
  p.heartsUpdatedAt = 50 * MIN; // relógio do aparelho voltou no tempo
  P.refillHearts(p, 10 * MIN);
  assert.equal(p.hearts, 0);
  assert.equal(p.heartsUpdatedAt, 10 * MIN, "contagem recomeça agora em vez de travar");
  assert.equal(P.msUntilNextHeart(p, 10 * MIN), 2 * MIN);
});

test("vidas: recarregar a página (salvar e carregar) não reinicia o contador", () => {
  const storage = memoryStorage();
  const A = loadApp(storage);
  const p = A.Store.createProfile(0);
  A.Progress.loseHeart(p, 0);
  A.Progress.loseHeart(p, 0);
  A.Store.save(p);
  const B = loadApp(storage); // "nova aba"/página recarregada
  const back = B.Progress.refillHearts(B.Store.load(3 * MIN), 3 * MIN);
  assert.equal(back.hearts, 4);
  assert.equal(B.Progress.msUntilNextHeart(back, 3 * MIN), 1 * MIN);
});

test("quiz: combo conta acertos seguidos e zera no erro", () => {
  const { Quiz: Q, Data } = loadApp();
  const qs = Data.questions.slice(0, 4);
  const s = Q.createSession({ mode: "practice", questions: qs, rng: () => 0.5 });
  const answerRight = () => { Q.present(s); const it = Q.current(s); Q.select(s, it.options.indexOf(it.q.answer)); return Q.verify(s); };
  Q.present(s);
  let r = answerRight(); assert.equal(r.combo, 1); Q.next(s);
  r = answerRight(); assert.equal(r.combo, 2); Q.next(s);
  const it = Q.current(s);
  Q.select(s, it.options.findIndex((o) => o !== it.q.answer));
  r = Q.verify(s);
  assert.equal(r.combo, 0);
  assert.equal(s.bestCombo, 2);
});

test("vidas: perder vida no máximo inicia o temporizador", () => {
  const { Progress: P, Store } = loadApp();
  const p = Store.createProfile(0);
  P.loseHeart(p, 1000);
  assert.equal(p.hearts, 4);
  assert.equal(p.heartsUpdatedAt, 1000);
  for (let i = 0; i < 10; i += 1) P.loseHeart(p, 2000);
  assert.equal(p.hearts, 0, "vidas não podem ficar negativas");
});

test("sequência: dias consecutivos, reinício e sequência atual", () => {
  const { Progress: P, Store } = loadApp();
  const p = Store.createProfile(0);
  P.touchStreak(p, DAY_NOON(10));
  assert.equal(p.streak, 1);
  P.touchStreak(p, DAY_NOON(10));
  assert.equal(p.streak, 1, "mesmo dia não soma");
  P.touchStreak(p, DAY_NOON(11));
  assert.equal(p.streak, 2);
  P.touchStreak(p, DAY_NOON(14));
  assert.equal(p.streak, 1, "pulou dias: reinicia");
  assert.equal(p.bestStreak, 2);
  assert.equal(P.currentStreak(p, DAY_NOON(14)), 1);
  assert.equal(P.currentStreak(p, DAY_NOON(16)), 0, "dois dias sem estudar zera a exibição");
});

/* ---------- XP, respostas e conclusões ---------- */

test("respostas: XP por dificuldade, metade com dica ou revisitação, vida perdida no erro", () => {
  const { Progress: P, Store } = loadApp();
  const p = Store.createProfile(0);
  const q = { id: "x1", topic: "Equações", difficulty: 2 };
  const now = DAY_NOON(5);
  assert.equal(P.recordAnswer(p, q, { correct: true, usedHint: false, isRetry: false, consumesHearts: true, now }).xp, 15);
  assert.equal(P.recordAnswer(p, q, { correct: true, usedHint: true, isRetry: false, consumesHearts: true, now }).xp, 7);
  assert.equal(P.recordAnswer(p, q, { correct: true, usedHint: false, isRetry: true, consumesHearts: true, now }).xp, 7);
  assert.equal(p.xp, 29);

  const wrong = P.recordAnswer(p, q, { correct: false, usedHint: false, isRetry: false, consumesHearts: true, now });
  assert.equal(wrong.heartLost, true);
  assert.equal(p.hearts, 4);
  assert.equal(p.mistakes.x1, 1);

  const fixed = P.recordAnswer(p, q, { correct: true, usedHint: false, isRetry: false, consumesHearts: true, now });
  assert.equal(fixed.xp, 15);
  assert.equal(p.mistakes.x1, undefined, "acerto posterior quita o erro pendente");

  assert.equal(p.totals.answered, 5);
  assert.equal(p.totals.correct, 4);
  assert.equal(p.totals.wrong, 1);
  assert.equal(p.byTopic["Equações"].answered, 5);
});

test("modo simulado: acerto não dá XP por questão e erro não consome vida", () => {
  const { Progress: P, Store } = loadApp();
  const p = Store.createProfile(0);
  const r = P.recordAnswer(p, { id: "y", topic: "Sistemas", difficulty: 3 }, {
    correct: true, usedHint: false, isRetry: false, consumesHearts: false, awardXp: false, now: DAY_NOON(1),
  });
  assert.equal(r.xp, 0);
  assert.equal(p.xp, 0);
  const w = P.recordAnswer(p, { id: "y", topic: "Sistemas", difficulty: 3 }, {
    correct: false, usedHint: false, isRetry: false, consumesHearts: false, now: DAY_NOON(1),
  });
  assert.equal(w.heartLost, false);
  assert.equal(p.hearts, 5);
});

test("lições: estrelas pelo número de erros e XP só cheio na primeira conclusão", () => {
  const { Progress: P, Store } = loadApp();
  const p = Store.createProfile(0);
  const a = P.completeLesson(p, "u1-l1", { mistakes: 0, now: DAY_NOON(1) });
  assert.deepEqual([a.stars, a.xp, a.first], [3, 20, true]);
  const b = P.completeLesson(p, "u1-l1", { mistakes: 2, now: DAY_NOON(1) });
  assert.deepEqual([b.stars, b.xp, b.first], [1, 5, false], "resultado mostra a tentativa");
  assert.equal(p.lessons["u1-l1"].stars, 3, "registro guarda o melhor resultado");
  const c = P.completeLesson(p, "u1-l2", { mistakes: 2, now: DAY_NOON(1) });
  assert.equal(c.stars, 1);
  const d = P.completeLesson(p, "u1-l2", { mistakes: 1, now: DAY_NOON(1) });
  assert.equal(d.stars, 2);
  assert.equal(p.lessons["u1-l2"].stars, 2);
});

test("trilha: lições só desbloqueiam em sequência", () => {
  const { Progress: P, Store, Data } = loadApp();
  const p = Store.createProfile(0);
  const lessons = Data.units.flatMap((u) => u.lessons);
  let states = P.lessonStates(p, lessons);
  assert.equal(states[0].unlocked, true);
  assert.equal(states[1].unlocked, false);
  P.completeLesson(p, lessons[0].id, { mistakes: 0, now: DAY_NOON(1) });
  states = P.lessonStates(p, lessons);
  assert.equal(states[1].unlocked, true);
  assert.equal(states[2].unlocked, false);
});

test("conquistas: desbloqueiam uma única vez", () => {
  const { Progress: P, Store } = loadApp();
  const p = Store.createProfile(0);
  P.completeLesson(p, "u1-l1", { mistakes: 0, now: DAY_NOON(1) });
  const first = P.evaluateBadges(p, DAY_NOON(1));
  const ids = first.map((b) => b.id);
  assert.ok(ids.includes("first-lesson"));
  assert.ok(ids.includes("perfect"));
  assert.equal(P.evaluateBadges(p, DAY_NOON(1)).length, 0);
});

/* ---------- Sessão de quiz ---------- */

test("quiz: acerto avança a fila e encerra ao fim", () => {
  const { Quiz: Q, Data } = loadApp();
  const qs = Data.questions.slice(0, 2);
  const s = Q.createSession({ mode: "practice", questions: qs, now: 0 });
  let item = Q.present(s);
  assert.equal(Q.select(s, item.options.indexOf(item.q.answer)), true);
  const r = Q.verify(s);
  assert.equal(r.correct, true);
  assert.equal(s.resolved, 1);
  assert.equal(s.correctFirst, 1);
  Q.next(s);
  item = Q.current(s);
  assert.equal(item.q.id, qs[1].id);
  Q.select(s, item.options.indexOf(item.q.answer));
  Q.verify(s);
  Q.next(s);
  assert.equal(s.finished, true);
  assert.equal(s.correctFirst, 2);
});

test("quiz: erro na primeira tentativa reenfileira a questão uma vez", () => {
  const { Quiz: Q, Data } = loadApp();
  const q = Data.questions[0];
  const s = Q.createSession({ mode: "lesson", questions: [q], lessonId: "u1-l1", now: 0 });
  let item = Q.present(s);
  Q.select(s, item.options.indexOf(q.distractors[0]));
  const wrong = Q.verify(s);
  assert.equal(wrong.correct, false);
  assert.equal(wrong.requeued, true);
  assert.equal(s.queue.length, 2);
  assert.equal(s.resolved, 0);
  Q.next(s);
  assert.equal(s.finished, false);
  item = Q.current(s);
  assert.equal(item.retry, true);
  Q.select(s, item.options.indexOf(q.answer));
  Q.verify(s);
  Q.next(s);
  assert.equal(s.finished, true);
  assert.equal(s.resolved, 1);
  assert.equal(s.mistakes, 1);
  assert.equal(s.correctFirst, 0);
});

test("quiz: erro na revisitação encerra a questão sem nova fila", () => {
  const { Quiz: Q, Data } = loadApp();
  const q = Data.questions[1];
  const s = Q.createSession({ mode: "lesson", questions: [q], now: 0 });
  Q.present(s);
  Q.select(s, 0); Q.verify(s); Q.next(s); // primeira falha (ou acerto, não importa para o teste)
  // força um cenário controlado: monta de novo com a fila já na revisitação
  const s2 = Q.createSession({ mode: "lesson", questions: [q], now: 0 });
  Q.present(s2);
  const wrongIdx = s2.queue[0].options.findIndex((o) => o !== q.answer);
  Q.select(s2, wrongIdx); Q.verify(s2); Q.next(s2);
  Q.select(s2, s2.queue[1].options.findIndex((o) => o !== q.answer));
  const again = Q.verify(s2);
  assert.equal(again.correct, false);
  assert.equal(again.requeued, false);
  Q.next(s2);
  assert.equal(s2.finished, true);
});

test("quiz: simulado não reenfileira erros", () => {
  const { Quiz: Q, Data } = loadApp();
  const q = Data.questions[2];
  const s = Q.createSession({ mode: "simulado", questions: [q], now: 0 });
  const item = Q.present(s);
  Q.select(s, item.options.indexOf(q.distractors[1]));
  const r = Q.verify(s);
  assert.equal(r.requeued, false);
  assert.equal(s.queue.length, 1);
  Q.next(s);
  assert.equal(s.finished, true);
});

test("quiz: dica marca o uso e só funciona antes de verificar", () => {
  const { Quiz: Q, Data } = loadApp();
  const s = Q.createSession({ mode: "lesson", questions: [Data.questions[0]], now: 0 });
  Q.present(s);
  assert.equal(Q.useHint(s), Data.questions[0].hint);
  assert.equal(Q.useHint(s), null, "dica não repete");
  Q.select(s, 0);
  Q.verify(s);
  assert.equal(Q.useHint(s), null);
  assert.equal(Q.current(s).usedHint, true);
});

test("quiz: revisão prioriza erros pendentes e não repete questões", () => {
  const { Quiz: Q, Data, Store } = loadApp();
  const p = Store.createProfile(0);
  p.mistakes = { q05: 2, q10: 1 };
  const set = Q.buildPractice(p, Data.questions, 10, () => 0.5);
  const ids = set.map((q) => q.id);
  assert.equal(set.length, 10);
  assert.equal(new Set(ids).size, 10);
  assert.ok(ids.includes("q05") && ids.includes("q10"));
});

/* ---------- Persistência ---------- */

test("persistência: salvar, carregar e tolerar JSON inválido", () => {
  const storage = memoryStorage();
  const App = loadApp(storage);
  const p = App.Store.load(0);
  assert.equal(p.onboarded, false);
  p.name = "Ana";
  p.xp = 42;
  assert.equal(App.Store.save(p), true);
  const again = App.Store.load(0);
  assert.equal(again.name, "Ana");
  assert.equal(again.xp, 42);
  storage.setItem(App.Store.KEY, "{quebrado");
  assert.equal(App.Store.load(0).xp, 0);
});

test("persistência: sem localStorage, o progresso é mantido em memória durante a sessão", () => {
  const App = loadApp(null);
  const p = App.Store.load(0);
  p.xp = 7;
  assert.equal(App.Store.save(p), false, "save deve sinalizar que não persistiu no navegador");
  assert.equal(App.Store.load(0).xp, 7, "o fallback em memória evita perder o progresso sem quebrar");
  App.Store.reset(0);
  assert.equal(App.Store.load(0).xp, 0);
});

/* ---------- Arte (SVG) ---------- */

function loadArt() {
  const ctx = { console };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const file of ["js/core/utils.js", "js/ui/art.js"]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), ctx, { filename: file });
  }
  return ctx.App.Art;
}

test("arte: todos os personagens e poses geram SVG sem ícones faltando", () => {
  const Art = loadArt();
  const sprite = Art.spriteMarkup();
  const defined = new Set([...sprite.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  const check = (svg, what) => {
    assert.ok(svg.startsWith("<svg"), what);
    for (const [, ref] of svg.matchAll(/(?:href="#|url\(#)([^")]+)/g)) {
      assert.ok(defined.has(ref), `${what}: referência inexistente #${ref}`);
    }
  };
  for (const who of Object.keys(Art.CHARS)) {
    for (const pose of Art.POSES) check(Art.mascot(pose, 100, who), `${who}/${pose}`);
  }
  for (const name of Object.keys(Art.ICONS)) check(Art.icon(name), `ícone ${name}`);
  for (let lv = 1; lv <= 12; lv += 1) check(Art.levelEmblem(lv, 64), `nível ${lv}`);
  for (const id of Object.keys(Art.BADGE_ART)) {
    check(Art.badgeArt(id, true), `conquista ${id}`);
    check(Art.badgeArt(id, false), `conquista bloqueada ${id}`);
  }
});

test("arte: toda conquista tem emblema próprio e os níveis progridem", () => {
  const Art = loadArt();
  const { Progress: P } = loadApp();
  for (const b of P.BADGES) assert.ok(Art.BADGE_ART[b.id], `conquista sem arte: ${b.id}`);
  assert.equal(Art.levelTier(1).name, "Semente");
  assert.equal(Art.levelTier(4).index, 3);
  assert.equal(Art.levelTier(99).index, Art.TIERS.length - 1, "níveis altos usam o último emblema");
  assert.equal(Art.levelTier(0).index, 0);
  assert.equal(Art.mascot("cheer", 10), Art.mascot("correct", 10), "humor antigo cai na pose nova");
});

