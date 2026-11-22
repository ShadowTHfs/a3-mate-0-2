/* Controlador: roteamento por hash, estado da sessão, ações do usuário e ciclo de persistência. */
window.App = window.App || {};
(function (App) {
  "use strict";
  const { Store, Progress: P, Quiz: Q, Views: V, Utils: U, Sound, Fx, Art } = App;

  const state = {
    profile: null,
    session: null,   // sessão de quiz em andamento (lição, revisão ou simulado)
    result: null,    // tela de resultado; só aparece na rota onde foi gerada
    draftAvatar: null,
    draftName: null,
    heartsOpen: false, // painel "Suas vidas" aberto no topo
  };

  const now = () => Date.now();
  const currentHash = () => location.hash || "#/";

  /* ---------- Dados e helpers ---------- */
  function flatLessons() {
    return App.Data.units.flatMap((u) => u.lessons);
  }

  function indexLessons() {
    let number = 0;
    App.Data.units.forEach((unit) => {
      unit.lessons.forEach((lesson) => {
        number += 1;
        Object.assign(lesson, {
          number,
          unitId: unit.id,
          unitTitle: unit.title,
          unitColor: unit.color,
        });
      });
    });
  }

  function allStates() {
    return P.lessonStates(state.profile, flatLessons());
  }

  function findNextLesson(id) {
    const all = flatLessons();
    const i = all.findIndex((l) => l.id === id);
    return all[i + 1] || null;
  }

  function persist() {
    Store.save(state.profile);
  }

  function parseRoute() {
    const [name, ...rest] = location.hash.replace(/^#\/?/, "").split("/");
    if (name === "lesson" && rest[0]) return { name: "lesson", id: rest[0] };
    if (["practice", "simulado", "profile"].includes(name)) return { name };
    return { name: "home" };
  }

  function isSessionOf(mode) {
    return !!state.session && state.session.mode === mode && !state.session.finished;
  }

  /* ---------- Renderização ---------- */
  function routeView(route, t) {
    const profile = state.profile;
    if (state.result && state.result.route === currentHash()) {
      return { html: V.resultView(state.result, profile), route: route.name };
    }
    switch (route.name) {
      case "lesson": {
        const st = allStates().find((s) => s.lesson.id === route.id);
        if (!st) return { html: V.notFoundView(), route: "home" };
        if (!st.unlocked) return { html: V.lockedView(st.lesson), route: "lesson" };
        if (isSessionOf("lesson") && state.session.lessonId === route.id) {
          return { html: V.quizView(state.session, "lesson", profile, t), route: "lesson", quiz: true };
        }
        return { html: V.theoryView(st.lesson, profile), route: "lesson" };
      }
      case "practice":
        if (isSessionOf("practice")) {
          return { html: V.quizView(state.session, "practice", profile, t), route: "practice", quiz: true };
        }
        return { html: V.practiceIntroView(profile, App.Data.questions), route: "practice" };
      case "simulado":
        if (isSessionOf("simulado")) {
          return { html: V.quizView(state.session, "simulado", profile, t), route: "simulado", quiz: true };
        }
        return { html: V.simuladoIntroView(profile), route: "simulado" };
      case "profile":
        return { html: V.profileView(profile, t), route: "profile" };
      default: {
        const states = allStates();
        return { html: V.homeView(profile, states, t, unlockAnimationTarget(states)), route: "home" };
      }
    }
  }

  /* Animação de desbloqueio: toca uma vez quando o mapa mostra uma fase recém-liberada. */
  const SEEN_KEY = "desafio-algebrico:seen-unlocked";
  function unlockAnimationTarget(states) {
    const unlocked = states.filter((s) => s.unlocked).length;
    let seen = 0;
    try {
      seen = Number(localStorage.getItem(SEEN_KEY)) || 0;
      localStorage.setItem(SEEN_KEY, String(unlocked));
    } catch (e) {
      return null; // sem armazenamento: só não anima
    }
    if (!seen || unlocked <= seen) return null;
    const cur = states.find((s) => s.unlocked && !s.completed);
    return cur ? cur.lesson.id : null;
  }

  function scrollToWorld(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function updateNav(routeName) {
    const key = routeName === "lesson" ? "home" : routeName;
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const active = a.dataset.nav === key;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function renderStats() {
    const el = document.getElementById("stats");
    if (el) el.innerHTML = V.statsChips(state.profile, now(), state.heartsOpen);
  }

  /* Atualiza tudo que mostra vidas. full=true quando o NÚMERO de vidas mudou (redesenha os trechos). */
  function refreshHearts(full) {
    const t = now();
    if (full) {
      const chip = document.activeElement && document.activeElement.closest && document.activeElement.closest(".hearts-wrap");
      renderStats();
      if (chip) {
        const btn = document.querySelector(".chip-hearts[data-action=toggle-hearts]");
        if (btn) btn.focus({ preventScroll: true });
      }
      document.querySelectorAll("[data-hearts-live]").forEach((el) => {
        el.innerHTML = V.heartsLive(el.dataset.heartsLive, state.profile, t);
      });
    }
    const st = P.heartsStatus(state.profile, t);
    document.querySelectorAll("[data-heart-sub]").forEach((el) => { el.textContent = V.heartSubText(st); });
    document.querySelectorAll("[data-heart-line]").forEach((el) => { el.innerHTML = V.heartLine(st); });
    document.querySelectorAll("[data-heart-fill]").forEach((el) => { el.style.setProperty("--p", st.ratio.toFixed(3)); });
  }

  function setHeartsOpen(open, focusChip = false) {
    if (state.heartsOpen === open) return;
    state.heartsOpen = open;
    renderStats();
    if (focusChip || open) {
      const btn = document.querySelector(".chip-hearts[data-action=toggle-hearts]");
      if (btn) btn.focus({ preventScroll: true });
    }
  }

  function focusAfterRender(opts) {
    const main = document.getElementById("main");
    let el = opts.focus ? main.querySelector(opts.focus) : null;
    if (!el) el = main.querySelector("h1[tabindex], h2[tabindex]");
    if (el) el.focus({ preventScroll: true });
  }

  function render(opts = {}) {
    const t = now();
    P.refillHearts(state.profile, t);
    document.body.classList.toggle("onboarding", !state.profile.onboarded);

    let view;
    if (!state.profile.onboarded) {
      const name = state.draftName ?? state.profile.name;
      view = { html: V.onboardingView(state.draftAvatar || state.profile.avatar, name), route: "onboarding" };
    } else {
      view = routeView(parseRoute(), t);
    }

    document.body.classList.toggle("in-quiz", !!view.quiz);
    document.getElementById("main").innerHTML = view.html;
    renderStats();
    updateNav(view.route);
    if (opts.navigate) window.scrollTo(0, 0);
    focusAfterRender(opts);
  }

  /* ---------- Sessões ---------- */
  function failedResult() {
    return {
      route: currentHash(),
      eyebrow: "SEM VIDAS",
      icon: "heart-empty",
      mood: "wrong",
      title: "Você ficou sem vidas",
      subtitle: `Sua lição não foi concluída. As vidas voltam sozinhas, uma a cada ${Math.round(P.HEART_INTERVAL_MS / 60000)} minutos, mesmo com o app fechado.`,
      heartClock: true,
      actions: [
        { label: "Praticar sem gastar vidas", action: "start-practice", arg: "", primary: true },
        { label: "Voltar à trilha", to: "#/" },
      ],
    };
  }

  function startLesson(id) {
    const st = allStates().find((s) => s.lesson.id === id);
    if (!st || !st.unlocked) return render();
    state.result = null;
    if (state.profile.hearts <= 0) {
      state.result = failedResult();
      return render({ navigate: true });
    }
    const questions = Q.lessonQuestions(st.lesson, App.Data.questions);
    state.session = Q.createSession({
      mode: "lesson", questions, lessonId: id, xpStart: state.profile.xp, now: now(),
    });
    Q.present(state.session);
    location.hash = `#/lesson/${id}`;
    render({ navigate: true });
  }

  function startPractice() {
    state.result = null;
    const questions = Q.buildPractice(state.profile, App.Data.questions, 10);
    state.session = Q.createSession({ mode: "practice", questions, xpStart: state.profile.xp, now: now() });
    Q.present(state.session);
    location.hash = "#/practice";
    render({ navigate: true });
  }

  function startSimulado() {
    state.result = null;
    const questions = Q.buildSimulado(App.Data.questions, 10);
    state.session = Q.createSession({ mode: "simulado", questions, xpStart: state.profile.xp, now: now() });
    Q.present(state.session);
    location.hash = "#/simulado";
    render({ navigate: true });
  }

  function onSelect(i) {
    if (state.session && Q.select(state.session, i)) {
      Sound.play("tap");
      render({ focus: `.answer[data-arg="${i}"]` });
    }
  }

  function onHint() {
    if (state.session && Q.useHint(state.session)) {
      render({ focus: ".question h2" });
    }
  }

  function onVerify() {
    const s = state.session;
    if (!s || s.verified || s.selected === null) return;
    const res = Q.verify(s);
    if (!res) return;

    const rec = P.recordAnswer(state.profile, res.item.q, {
      correct: res.correct,
      usedHint: res.usedHint,
      isRetry: res.item.retry,
      consumesHearts: s.mode === "lesson",
      awardXp: s.mode !== "simulado",
      now: now(),
    });
    s.xp += rec.xp;
    if (rec.heartLost) s.heartsLost += 1;
    if (s.mode === "lesson" && state.profile.hearts <= 0 && !res.correct) s.outOfHearts = true;
    persist();

    if (s.mode === "simulado") return onNext();
    Sound.play(res.correct ? "correct" : "wrong");
    render({ focus: '[data-action="next"]' });
    if (rec.xp > 0) Fx.floatText(document.querySelector(".feedback"), `+${rec.xp} XP`);
  }

  function onNext() {
    const s = state.session;
    if (!s || !s.verified) return;
    if (s.outOfHearts) return endSession("failed");
    Q.next(s);
    if (s.finished) return endSession("done");
    render({ focus: ".question h2" });
  }

  function onQuit() {
    const s = state.session;
    const started = !!s && (s.resolved > 0 || s.verified || s.selected !== null);
    if (started && !confirm("Sair agora? A sessão não será concluída. Os acertos já contabilizados continuam salvos.")) {
      return;
    }
    state.session = null;
    state.result = null;
    location.hash = "#/";
    render({ navigate: true });
  }

  function endSession(outcome) {
    const s = state.session;
    const t = now();
    const route = currentHash();
    const levelBefore = P.levelInfo(s.xpStart).level;
    let result;
    let celebrate = false;

    if (outcome === "failed") {
      result = failedResult();
      Sound.play("wrong");
    } else if (s.mode === "lesson") {
      const r = P.completeLesson(state.profile, s.lessonId, { mistakes: s.mistakes, now: t });
      s.xp += r.xp;
      const next = findNextLesson(s.lessonId);
      const actions = next
        ? [
            { label: "Próxima lição", to: `#/lesson/${next.id}`, primary: true },
            { label: "Refazer esta lição", action: "start-lesson", arg: s.lessonId },
            { label: "Voltar à trilha", to: "#/" },
          ]
        : [
            { label: "Voltar à trilha", to: "#/", primary: true },
            { label: "Refazer esta lição", action: "start-lesson", arg: s.lessonId },
          ];
      celebrate = r.stars >= 2;
      result = {
        eyebrow: "LIÇÃO CONCLUÍDA",
        icon: r.stars === 3 ? "trophy" : "star",
        mood: r.stars === 3 ? "finish" : "correct",
        title: r.stars === 3 ? "Lição perfeita!" : "Lição concluída!",
        subtitle: `${s.correctFirst} de ${s.total} acertos na primeira tentativa.`,
        stars: r.stars,
        stats: [
          { value: `+${s.xp}`, label: "XP ganhos" },
          { value: `${U.percent(s.correctFirst, s.total)}%`, label: "Acertos de 1ª" },
          { value: s.mistakes, label: "Erros" },
        ],
        actions,
      };
      Sound.play("complete");
    } else if (s.mode === "practice") {
      const r = P.completePractice(state.profile, { now: t });
      s.xp += r.xp;
      result = {
        eyebrow: "REVISÃO CONCLUÍDA",
        icon: "review",
        mood: "correct",
        who: "brasa",
        title: "Revisão concluída!",
        subtitle: `${s.correctFirst} de ${s.total} acertos na primeira tentativa.`,
        stats: [
          { value: `+${s.xp}`, label: "XP ganhos" },
          { value: `${U.percent(s.correctFirst, s.total)}%`, label: "Acertos de 1ª" },
          { value: s.mistakes, label: "Erros" },
        ],
        actions: [
          { label: "Revisar de novo", action: "start-practice", arg: "", primary: true },
          { label: "Voltar à trilha", to: "#/" },
        ],
      };
      Sound.play("complete");
    } else {
      const hits = s.correctFirst;
      const seconds = Math.round((t - s.startedAt) / 1000);
      const r = P.completeSimulado(state.profile, { hits, total: s.total, seconds, now: t });
      const pct = U.percent(hits, s.total);
      celebrate = pct >= 60;
      result = {
        eyebrow: "SIMULADO CONCLUÍDO",
        icon: pct >= 80 ? "trophy" : pct >= 60 ? "target" : "book",
        mood: pct >= 80 ? "finish" : pct >= 60 ? "correct" : "encourage",
        who: "lumi",
        title: pct >= 80 ? "Excelente desempenho!" : pct >= 60 ? "Bom trabalho!" : "Hora de reforçar a base",
        subtitle: `Você acertou ${hits} de ${s.total} na primeira tentativa.`,
        stats: [
          { value: `${hits}/${s.total}`, label: "Acertos" },
          { value: `${pct}%`, label: "Aproveitamento" },
          { value: U.formatClock(seconds * 1000), label: "Tempo" },
          { value: `+${r.xp}`, label: "XP" },
        ],
        actions: [
          { label: "Novo simulado", action: "start-simulado", arg: "", primary: true },
          { label: "Ver meu perfil", to: "#/profile" },
        ],
      };
      Sound.play("complete");
    }

    const levelAfter = P.levelInfo(state.profile.xp).level;
    if (levelAfter > levelBefore) {
      result.leveledUp = levelAfter;
      celebrate = true;
      setTimeout(() => Sound.play("levelUp"), 500);
    }
    result.newBadges = P.evaluateBadges(state.profile, t);
    result.route = route;

    persist();
    state.session = null;
    state.result = result;
    render({ navigate: true });
    if (celebrate) Fx.confetti();
  }

  /* ---------- Perfil ---------- */
  function onboard(form) {
    const name = form.elements.name.value.trim().slice(0, 24);
    state.profile.name = name || "Estudante";
    state.profile.avatar = state.draftAvatar || state.profile.avatar;
    state.profile.onboarded = true;
    state.draftAvatar = null;
    state.draftName = null;
    persist();
    render({ navigate: true });
  }

  function saveName(form) {
    state.profile.name = form.elements.name.value.trim().slice(0, 24);
    persist();
    render({ focus: "#pname" });
  }

  /* Redesenhar a tela não pode apagar o que a pessoa já digitou no campo de nome. */
  function onPickAvatar(id) {
    if (!App.AVATARS.includes(id)) return;
    const input = document.querySelector("input[name=name]");
    const typed = input ? input.value.trim().slice(0, 24) : null;
    if (!state.profile.onboarded) {
      state.draftAvatar = id;
      if (typed !== null) state.draftName = typed;
    } else {
      state.profile.avatar = id;
      if (typed) state.profile.name = typed;
      persist();
    }
    render({ focus: `[data-arg="${id}"]` });
  }

  function onToggleSound() {
    state.profile.sound = state.profile.sound === false;
    Sound.setEnabled(state.profile.sound);
    persist();
    render();
    const btn = document.querySelector("[data-action=toggle-sound]");
    if (btn) btn.focus({ preventScroll: true });
    if (state.profile.sound) Sound.play("tap");
  }

  function onReset() {
    if (!confirm("Apagar todo o progresso deste navegador? Isso não pode ser desfeito.")) return;
    state.profile = Store.reset(now());
    state.session = null;
    state.result = null;
    state.draftAvatar = null;
    location.hash = "#/";
    render({ navigate: true });
  }

  /* ---------- Ações, eventos e relógio ---------- */
  const handlers = {
    go(arg) {
      if (arg === currentHash()) render({ navigate: true });
      else location.hash = arg;
    },
    "start-lesson": startLesson,
    "start-practice": startPractice,
    "start-simulado": startSimulado,
    select: (arg) => onSelect(Number(arg)),
    hint: onHint,
    verify: onVerify,
    next: onNext,
    quit: onQuit,
    "pick-avatar": onPickAvatar,
    "toggle-sound": onToggleSound,
    "reset-progress": onReset,
    "scroll-world": scrollToWorld,
    "toggle-hearts": () => setHeartsOpen(!state.heartsOpen, true),
  };

  function tick() {
    const t = now();
    const before = state.profile.hearts;
    P.refillHearts(state.profile, t);
    const changed = state.profile.hearts !== before;
    if (changed) persist();
    refreshHearts(changed);
    document.querySelectorAll("[data-until]").forEach((el) => {
      el.textContent = U.formatClock(Number(el.dataset.until) - t);
    });
    document.querySelectorAll("[data-since]").forEach((el) => {
      el.textContent = U.formatClock(t - Number(el.dataset.since));
    });
  }

  /* Ícones da navegação, marca e favicon vêm da arte vetorial. */
  function decorateShell() {
    Art.mount();
    document.querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = Art.icon(el.dataset.icon, { size: Number(el.dataset.size) || 22 });
    });
    const mark = document.querySelector(".brand-mark");
    if (mark) mark.innerHTML = Art.mascot("happy", 44, "raiz", { still: true, label: "" });
    let fav = document.querySelector("link[rel=icon]");
    if (!fav) {
      fav = document.createElement("link");
      fav.rel = "icon";
      document.head.appendChild(fav);
    }
    fav.type = "image/svg+xml";
    fav.href = Art.faviconDataUri();
  }

  /* Outra aba salvou o perfil (ex.: perdeu vida lá): traz o estado atualizado sem reiniciar contadores. */
  function onStorage(e) {
    if (e.key !== Store.KEY || !e.newValue) return;
    const before = state.profile.hearts;
    state.profile = Store.load(now());
    P.refillHearts(state.profile, now());
    refreshHearts(true);
    if (state.profile.hearts !== before) renderStats();
  }

  function init() {
    decorateShell();
    indexLessons();
    state.profile = Store.load(now());
    Sound.setEnabled(state.profile.sound !== false);
    P.refillHearts(state.profile, now());
    if (!location.hash) history.replaceState(null, "", "#/");
    window.addEventListener("hashchange", () => {
      if (state.result && state.result.route !== currentHash()) state.result = null;
      render({ navigate: true });
    });
    window.addEventListener("storage", onStorage);
    // Ao voltar para a aba (celular bloqueado, aba em segundo plano), recalcula na hora.
    document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
    window.addEventListener("pageshow", () => tick());
    setInterval(tick, 1000);
    render();
  }

  document.addEventListener("click", (e) => {
    if (state.heartsOpen && !e.target.closest(".hearts-wrap")) setHeartsOpen(false);
    const el = e.target.closest("[data-action]");
    if (!el || el.disabled) return;
    const fn = handlers[el.dataset.action];
    if (fn) {
      e.preventDefault();
      if (state.heartsOpen && el.dataset.action !== "toggle-hearts" && el.closest(".hearts-panel")) setHeartsOpen(false);
      fn(el.dataset.arg);
    }
  });

  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (form.dataset.form === "onboarding") {
      e.preventDefault();
      onboard(form);
    } else if (form.dataset.form === "profile-name") {
      e.preventDefault();
      saveName(form);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.heartsOpen) {
      setHeartsOpen(false, true);
      return;
    }
    const s = state.session;
    if (!s || s.finished || !document.body.classList.contains("in-quiz")) return;
    const target = e.target instanceof Element ? e.target : null;
    if (target && target.matches("input, textarea, select")) return;
    if (/^[1-4]$/.test(e.key) && !s.verified) {
      e.preventDefault();
      onSelect(Number(e.key) - 1);
      return;
    }
    if (e.key === "Enter" && !(target && ["BUTTON", "A"].includes(target.tagName))) {
      if (s.verified) onNext();
      else if (s.selected !== null) onVerify();
    }
  });

  document.addEventListener("DOMContentLoaded", init);
})(window.App);
