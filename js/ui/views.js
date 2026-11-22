/* Views: funções que devolvem HTML. Não mudam estado; quem decide o que mostrar é o app.js. */
window.App = window.App || {};
(function (App) {
  "use strict";
  const { esc, formatClock, percent } = App.Utils;
  const P = App.Progress;
  const LETTERS = ["A", "B", "C", "D"];
  const DIFFICULTY = {
    1: { label: "Fácil", cls: "diff-easy" },
    2: { label: "Médio", cls: "diff-medium" },
    3: { label: "Difícil", cls: "diff-hard" },
  };

  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  const A = App.Art;
  const icon = (name, size = 24, cls = "") => A.icon(name, { size, cls });
  const mascot = (pose = "happy", size = 110, who = "raiz", opts) => A.mascot(pose, size, who, opts);

  function starRow(n, size = 16) {
    return [0, 1, 2].map((i) => icon(i < n ? "star" : "star-empty", size)).join("");
  }

  /* ---------- Vidas ---------- */
  function intervalText() {
    const min = Math.round(P.HEART_INTERVAL_MS / 60000);
    return `${min} ${min === 1 ? "minuto" : "minutos"}`;
  }

  function heartSubText(st) {
    return st.full ? "Vidas completas" : `+1 em ${formatClock(st.msNext)}`;
  }

  /* Linha "Próxima vida em 1:42" (atualizada a cada segundo pelo app via data-heart-line). */
  function heartLine(st) {
    return st.full
      ? "Vidas completas!"
      : `Próxima vida em <b class="num">${formatClock(st.msNext)}</b>`;
  }

  function heartRow(st, size = 32) {
    let html = "";
    for (let i = 0; i < st.max; i += 1) {
      if (i < st.hearts) {
        html += `<span class="heart-slot full">${icon("heart", size)}</span>`;
      } else if (i === st.hearts && !st.full) {
        // vida recarregando: o coração vai enchendo de baixo para cima
        html += `<span class="heart-slot filling" data-heart-fill style="--p:${st.ratio.toFixed(3)}">`
          + `${icon("heart-empty", size)}<span class="heart-fill">${icon("heart", size)}</span></span>`;
      } else {
        html += `<span class="heart-slot">${icon("heart-empty", size)}</span>`;
      }
    }
    return html;
  }

  function heartsPanel(profile, now) {
    const st = P.heartsStatus(profile, now);
    const pose = st.hearts === 0 ? "wrong" : st.full ? "happy" : "encourage";
    return `
      <div class="hearts-panel" id="hearts-panel" role="dialog" aria-label="Suas vidas">
        <div class="hp-head">
          ${mascot(pose, 58, "raiz", { label: "" })}
          <div class="hp-text">
            <p class="hp-title">Suas vidas</p>
            <p class="hp-count">Você possui <b>${st.hearts} de ${st.max}</b> vidas.</p>
          </div>
          <button type="button" class="icon-btn sm" data-action="toggle-hearts" aria-label="Fechar painel de vidas">${icon("close", 18)}</button>
        </div>
        <div class="hp-row" aria-hidden="true">${heartRow(st, 34)}</div>
        <p class="hp-next" data-heart-line aria-live="off">${heartLine(st)}</p>
        <ul class="hp-rules">
          <li>Você recupera 1 vida a cada ${intervalText()}, mesmo com o app fechado.</li>
          <li>Só os erros nas lições gastam vidas.</li>
          <li>Revisão e simulado não gastam vidas.</li>
        </ul>
        ${st.hearts === 0 ? `<button type="button" class="btn btn-ghost btn-block" data-action="start-practice" data-arg="">Praticar sem gastar vidas</button>` : ""}
      </div>`;
  }

  function heartsChip(profile, now, open) {
    const st = P.heartsStatus(profile, now);
    return `
      <div class="hearts-wrap">
        <button type="button" class="chip chip-hearts${st.hearts === 0 ? " is-empty" : ""}" data-action="toggle-hearts"
          aria-expanded="${open}" aria-controls="hearts-panel"
          aria-label="Vidas: ${st.hearts} de ${st.max}. Ver detalhes" title="Vidas">
          ${icon("heart", 22, st.hearts === 0 ? "ico-dim" : "")}
          <span class="hearts-txt"><b>${st.hearts}/${st.max}</b><small data-heart-sub>${heartSubText(st)}</small></span>
        </button>
        ${open ? heartsPanel(profile, now) : ""}
      </div>`;
  }

  /* Trechos que dependem do número de vidas e são trocados pelo app quando uma vida volta. */
  function heartsLive(kind, profile, now) {
    const st = P.heartsStatus(profile, now);
    if (kind === "quiz") {
      return `<span class="chip chip-hearts compact" aria-label="${st.hearts} de ${st.max} vidas">${icon("heart", 20)} <b>${st.hearts}</b>`
        + `${st.full ? "" : `<small data-heart-sub>${heartSubText(st)}</small>`}</span>`;
    }
    return st.hearts > 0
      ? `${icon("heart", 18)} ${st.hearts} ${st.hearts === 1 ? "vida disponível" : "vidas disponíveis"}`
      : `${icon("heart-empty", 18)} Sem vidas no momento. <span data-heart-line>${heartLine(st)}</span>`;
  }

  function soundButton(profile) {
    const on = profile.sound !== false;
    return `<button type="button" class="chip chip-btn" data-action="toggle-sound" aria-pressed="${on}"
      aria-label="Efeitos sonoros ${on ? "ligados" : "desligados"}" title="Efeitos sonoros">${icon(on ? "sound" : "sound-off", 22)}</button>`;
  }

  function statsChips(profile, now, heartsOpen = false) {
    const info = P.levelInfo(profile.xp);
    const streak = P.currentStreak(profile, now);
    return `
      <span class="chip chip-streak" title="Sequência de dias">${icon("flame", 22)} <b>${streak}</b><span class="sr-only"> dias de sequência</span></span>
      <span class="chip chip-xp" title="XP total e nível">${icon("star", 22)} <b>${profile.xp}</b><span class="sr-only"> XP, nível ${info.level}</span>
        <span class="chip-level" aria-hidden="true">${A.levelEmblem(info.level, 26, { label: "" })}</span></span>
      ${heartsChip(profile, now, heartsOpen)}
      ${soundButton(profile)}`;
  }

  function avatarButtons(selected) {
    return App.AVATARS.map((emoji) => `
      <button type="button" class="avatar-opt" data-action="pick-avatar" data-arg="${emoji}"
        aria-pressed="${emoji === selected}" aria-label="Avatar ${emoji}">${emoji}</button>`).join("");
  }

  function onboardingView(avatar, name) {
    return `
    <section class="page narrow onboard">
      <div class="onboard-hero">
        <span class="cast cast-l">${mascot("happy", 86, "lumi")}</span>
        ${mascot("encourage", 160, "raiz")}
        <span class="cast cast-r">${mascot("happy", 86, "brasa")}</span>
      </div>
      <div class="speech">Oi! Eu sou o Raiz. Com o Lumi e a Brasa, vamos montar a sua trilha de álgebra?</div>
      <h1 tabindex="-1">Bem-vindo ao Desafio!</h1>
      <form class="card form" data-form="onboarding">
        <label for="name">Como podemos te chamar?</label>
        <input id="name" name="name" maxlength="24" autocomplete="nickname"
          placeholder="Seu nome ou apelido" value="${esc(name)}" />
        <span class="label" id="avatar-label">Escolha seu avatar</span>
        <div class="avatar-grid" role="group" aria-labelledby="avatar-label">${avatarButtons(avatar)}</div>
        <button class="btn btn-primary btn-block btn-xl" type="submit">Começar a jogar →</button>
      </form>
    </section>`;
  }

  function nodeHtml(s, i, isNext) {
    const cls = s.completed ? "done" : s.unlocked ? "open" : "locked";
    const side = i % 2 === 0 ? "left" : "right";
    const content = s.completed ? icon("check", 44) : s.unlocked ? s.lesson.number : icon("lock", 34);
    const aria = s.completed
      ? `, concluída, ${s.stars} de 3 estrelas`
      : s.unlocked ? "" : ", bloqueada";
    const attrs = s.unlocked ? `data-action="go" data-arg="#/lesson/${s.lesson.id}"` : "disabled";
    const crown = s.stars === 3 ? `<span class="crown" aria-hidden="true">${icon("crown", 30)}</span>` : "";
    const bubble = isNext ? '<span class="start-bubble" aria-hidden="true">COMEÇAR</span>' : "";
    const stars = s.completed ? `<span class="stars" aria-hidden="true">${starRow(s.stars, 18)}</span>` : "";
    return `
    <li class="path-item ${side}">
      ${bubble}
      <button type="button" class="node ${cls}" ${attrs}
        aria-label="Lição ${s.lesson.number}: ${esc(s.lesson.title)}${aria}">
        ${crown}<span aria-hidden="true">${content}</span>
      </button>
      <span class="node-label">${esc(s.lesson.title)}</span>
      ${stars}
    </li>`;
  }

  function homeView(profile, states, now) {
    const next = states.find((s) => s.unlocked && !s.completed);
    const streak = P.currentStreak(profile, now);
    const info = P.levelInfo(profile.xp);
    const ratio = Math.round(info.ratio * 100);
    const streakText = streak > 0
      ? `Sequência de ${plural(streak, "dia", "dias")}! Não quebre a corrente.`
      : "Complete uma lição hoje e acenda sua sequência!";
    const tier = A.levelTier(info.level);
    const cta = next
      ? `<button type="button" class="btn btn-primary btn-block btn-xl" data-action="go" data-arg="#/lesson/${next.lesson.id}">Continuar: ${esc(next.lesson.title)} →</button>`
      : `<p class="done-note">Trilha concluída! Treine a revisão e os simulados para manter o nível.</p>`;

    const units = App.Data.units.map((unit, idx) => {
      const items = states.filter((s) => s.lesson.unitId === unit.id);
      const done = items.filter((s) => s.completed).length;
      return `
      <section class="unit unit-${unit.color}" aria-labelledby="unit-${unit.id}">
        <header class="unit-banner">
          <span class="unit-emoji" aria-hidden="true">${A.UNIT_ICONS[unit.id] ? icon(A.UNIT_ICONS[unit.id], 38) : esc(unit.emoji)}</span>
          <div class="unit-text">
            <small>UNIDADE ${idx + 1}</small>
            <h2 id="unit-${unit.id}">${esc(unit.title)}</h2>
          </div>
          <span class="unit-count">${done}/${items.length}</span>
        </header>
        <ol class="path">${items.map((s, i) => nodeHtml(s, i, s === next)).join("")}</ol>
      </section>`;
    }).join("");

    return `
    <section class="page">
      <div class="card hero">
        <div class="hero-mascot">${mascot(streak > 0 ? "streak" : "encourage", 120)}</div>
        <div class="hero-text">
          <h1 tabindex="-1">Olá${profile.name ? `, ${esc(profile.name)}` : ""}! ${esc(profile.avatar)}</h1>
          <div class="speech">${esc(streakText)}</div>
          <div class="hero-level">
            ${A.levelEmblem(info.level, 52)}
            <div class="hero-level-text">
              <p class="eyebrow">NÍVEL ${info.level} · ${esc(tier.name.toUpperCase())}</p>
              <div class="bar xp" role="progressbar" aria-label="Progresso até o nível ${info.level + 1}"
            aria-valuemin="0" aria-valuemax="100" aria-valuenow="${ratio}">
            <span style="width:${ratio}%"></span>
          </div>
              <small class="muted">${info.into} de ${info.span} XP para o nível ${info.level + 1}</small>
            </div>
          </div>
        </div>
        <div class="hero-cta">${cta}</div>
      </div>
      ${units}
    </section>`;
  }

  function theoryView(lesson, profile) {
    const blocks = lesson.theory.map((b) => typeof b === "string"
      ? `<p>${esc(b)}</p>`
      : `<div class="example"><strong>Exemplo</strong><p>${esc(b.example)}</p></div>`).join("");
    return `
    <section class="page narrow">
      <a class="back" href="#/">← Voltar à trilha</a>
      <div class="theory-head">
        ${mascot("study", 100)}
        <div>
          <p class="eyebrow">${esc(lesson.unitTitle)} · LIÇÃO ${lesson.number}</p>
          <h1 tabindex="-1">${esc(lesson.title)}</h1>
        </div>
      </div>
      <article class="card theory">${blocks}</article>
      <p class="muted center">${plural(lesson.questions.length, "exercício", "exercícios")} · até 20 XP ao concluir</p>
      <p class="muted center hearts-line" data-hearts-live="theory">${heartsLive("theory", profile, Date.now())}</p>
      <button type="button" class="btn btn-primary btn-block btn-xl" data-action="start-lesson" data-arg="${lesson.id}">Começar exercícios</button>
    </section>`;
  }

  function lockedView(lesson) {
    return `
    <section class="page narrow">
      <a class="back" href="#/">← Voltar à trilha</a>
      <div class="card result">
        <div class="result-hero">${mascot("idle", 120, "lumi")}<span class="emblem" aria-hidden="true">${icon("lock", 44)}</span></div>
        <h1 tabindex="-1">Lição bloqueada</h1>
        <p class="muted">Conclua a lição anterior para desbloquear "${esc(lesson.title)}".</p>
        <a class="btn btn-primary" href="#/">Ir para a trilha</a>
      </div>
    </section>`;
  }

  function quizView(s, kind, profile, now) {
    const item = s.queue[s.index];
    const q = item.q;
    const diff = DIFFICULTY[q.difficulty] || DIFFICULTY[1];
    const progress = Math.round((s.resolved / s.total) * 100);
    const counter = `${Math.min(s.resolved + 1, s.total)} de ${s.total}`;

    const options = item.options.map((opt, i) => {
      let cls = "answer";
      if (s.verified) {
        if (opt === q.answer) cls += " correct";
        else if (i === s.selected) cls += " wrong";
      } else if (i === s.selected) {
        cls += " selected";
      }
      return `
      <button type="button" class="${cls}" data-action="select" data-arg="${i}"
        aria-pressed="${i === s.selected}" ${s.verified ? "disabled" : ""}>
        <span class="key" aria-hidden="true">${LETTERS[i]}</span>
        <span class="txt">${esc(opt)}</span>
      </button>`;
    }).join("");

    const topRight = kind === "lesson"
      ? `<span data-hearts-live="quiz">${heartsLive("quiz", profile, now)}</span>`
      : kind === "simulado"
        ? `<span class="chip" aria-label="Tempo decorrido">${icon("timer", 20)} <b data-since="${s.startedAt}">${formatClock(now - s.startedAt)}</b></span>`
        : `<span class="chip chip-review">${icon("review", 20)} Revisão</span>`;

    const hint = s.hintUsed && !s.verified
      ? `<div class="hint" role="note">${mascot("idle", 48, "lumi", { label: "" })}<p><b>Dica do Lumi:</b> ${esc(q.hint)}</p></div>`
      : "";

    let bottom;
    if (!s.verified) {
      const canHint = kind !== "simulado" && !s.hintUsed;
      bottom = `
      <div class="footer">
        ${canHint ? `<button type="button" class="btn btn-ghost" data-action="hint">${icon("bulb", 22)} Dica</button>` : "<span></span>"}
        <button type="button" class="btn btn-primary btn-xl" data-action="verify" ${s.selected === null ? "disabled" : ""}>
          ${kind === "simulado" ? "Confirmar" : "Verificar"}
        </button>
      </div>`;
    } else {
      const ok = s.lastCorrect;
      const onFire = ok && s.combo >= 3;
      const pose = ok ? (onFire ? "streak" : "correct") : "wrong";
      const title = ok
        ? (onFire ? `Sequência de ${s.combo} acertos!` : "Isso aí! Correto!")
        : "Ops! Não foi dessa vez.";
      bottom = `
      <div class="feedback ${ok ? "ok" : "no"}" role="status" aria-live="polite">
        <div class="fb-mascot">${mascot(pose, 76)}</div>
        <div class="fb-text">
          <p class="fb-title">${title}</p>
          <p>${esc(q.explain)}</p>
        </div>
      </div>
      <div class="footer">
        <button type="button" class="btn btn-primary btn-block btn-xl" data-action="next">
          ${s.outOfHearts ? "Ver resultado" : "Continuar"} →
        </button>
      </div>`;
    }

    const shake = s.verified && !s.lastCorrect ? " card-shake" : "";
    return `
    <section class="page quiz-page">
      <header class="quiz-top">
        <button type="button" class="icon-btn" data-action="quit" aria-label="Sair">${icon("close", 20)}</button>
        <div class="progress" role="progressbar" aria-label="Progresso da sessão"
          aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
          <span style="width:${progress}%"></span>
        </div>
        ${topRight}
      </header>
      <article class="card question${shake}">
        <div class="meta">
          <span class="badge ${diff.cls}">${diff.label}</span>
          <span class="topic">${esc(q.topic)}</span>
          ${item.retry ? `<span class="pill-retry">Revisitar</span>` : ""}
          <span class="counter">${counter}</span>
        </div>
        <h2 tabindex="-1">${esc(q.text)}</h2>
        ${hint}
        <div class="answers" role="group" aria-label="Alternativas">${options}</div>
      </article>
      <div class="bottom">${bottom}</div>
    </section>`;
  }

  function resultView(r, profile) {
    const stars = typeof r.stars === "number"
      ? `<div class="stars big" role="img" aria-label="${r.stars} de 3 estrelas">${[0, 1, 2].map((i) =>
          `<span class="star ${i < r.stars ? "on" : "off"}" style="animation-delay:${0.2 + i * 0.18}s">${icon(i < r.stars ? "star" : "star-empty", 52)}</span>`).join("")}</div>`
      : "";
    const level = r.leveledUp
      ? `<div class="level-up" role="status">${A.levelEmblem(r.leveledUp, 76)}
           <div><b>Você subiu para o nível ${r.leveledUp}!</b><span>Novo emblema: ${esc(A.levelTier(r.leveledUp).name)}</span></div></div>`
      : "";
    const countdown = r.heartClock
      ? `<p class="muted" data-heart-line>${heartLine(P.heartsStatus(profile, Date.now()))}</p>`
      : "";
    const stats = (r.stats || [])
      .map((s) => `<div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`)
      .join("");
    const badges = r.newBadges && r.newBadges.length
      ? `<div class="unlocked">
           <p class="eyebrow">CONQUISTAS DESBLOQUEADAS</p>
           <div class="pill-row">${r.newBadges.map((b) => `<span class="pill">${A.badgeArt(b.id, true, 30)} ${esc(b.name)}</span>`).join("")}</div>
         </div>`
      : "";
    const actions = r.actions.map((a) => {
      const action = a.action || "go";
      const arg = a.action ? (a.arg ?? "") : a.to;
      return `<button type="button" class="btn ${a.primary ? "btn-primary btn-xl" : "btn-ghost"} btn-block"
        data-action="${action}" data-arg="${esc(arg)}">${esc(a.label)}</button>`;
    }).join("");

    return `
    <section class="page narrow">
      <div class="card result">
        <div class="result-hero">
          ${mascot(r.leveledUp ? "levelup" : r.mood || "happy", 140, r.who || "raiz")}
          ${r.icon ? `<span class="emblem" aria-hidden="true">${icon(r.icon, 46)}</span>` : ""}
        </div>
        <p class="eyebrow">${esc(r.eyebrow)}</p>
        <h1 tabindex="-1">${esc(r.title)}</h1>
        <p class="muted">${esc(r.subtitle)}</p>
        ${stars}
        ${level}
        ${countdown}
        ${stats ? `<div class="result-stats">${stats}</div>` : ""}
        ${badges}
        <div class="stack">${actions}</div>
      </div>
    </section>`;
  }

  function practiceIntroView(profile, bank) {
    const pending = bank.filter((q) => profile.mistakes[q.id]).length;
    return `
    <section class="page narrow">
      <div class="theory-head">
        ${mascot("encourage", 100, "brasa")}
        <div>
          <p class="eyebrow">REVISÃO</p>
          <h1 tabindex="-1">Treine o que mais erra</h1>
        </div>
      </div>
      <p class="muted">Montamos 10 questões priorizando os erros que ainda não foram superados. A revisão não consome vidas.</p>
      <div class="card info-row">${icon("review", 30)}<p>Questões com erro pendente: <b>${pending}</b></p></div>
      <button type="button" class="btn btn-primary btn-block btn-xl" data-action="start-practice" data-arg="">Começar revisão</button>
    </section>`;
  }

  function simuladoIntroView(profile) {
    const last = profile.simulados[0];
    const lastText = last
      ? `Último resultado: ${last.hits} de ${last.total} acertos em ${formatClock(last.seconds * 1000)}.`
      : "Você ainda não fez nenhum simulado.";
    return `
    <section class="page narrow">
      <div class="theory-head">
        ${mascot("study", 100, "lumi")}
        <div>
          <p class="eyebrow">ESTILO ENEM</p>
          <h1 tabindex="-1">Simulado</h1>
        </div>
      </div>
      <p class="muted">10 questões sorteadas do banco, com cronômetro. Não há dicas, não se usam vidas e as respostas só são corrigidas no final.</p>
      <div class="card">
        <ul class="rules">
          <li>Cada acerto de primeira vale 5 XP.</li>
          <li>Erros não voltam para a fila, como em uma prova.</li>
          <li>Se sair antes do fim, o simulado não é contabilizado.</li>
        </ul>
        <p class="muted">${esc(lastText)}</p>
      </div>
      <button type="button" class="btn btn-primary btn-block btn-xl" data-action="start-simulado" data-arg="">Começar simulado</button>
    </section>`;
  }

  function profileView(profile, now) {
    const t = profile.totals;
    const info = P.levelInfo(profile.xp);
    const topics = P.topicReport(profile);
    const topicRows = topics.length
      ? topics.map((tp) => {
          const tone = tp.accuracy >= 80 ? "tone-good" : tp.accuracy >= 60 ? "tone-ok" : "tone-bad";
          return `
          <li>
            <div class="row-head"><span>${esc(tp.topic)}</span><b>${tp.accuracy}%</b></div>
            <div class="bar thin" role="img" aria-label="${esc(tp.topic)}: ${tp.accuracy}% de acerto"><span class="${tone}" style="width:${tp.accuracy}%"></span></div>
            <small class="muted">${tp.correct} de ${tp.answered} acertos</small>
          </li>`;
        }).join("")
      : `<li class="muted">Responda algumas questões para ver seu desempenho por assunto.</li>`;

    const tier = A.levelTier(info.level);
    const ratio = Math.round(info.ratio * 100);
    const journey = A.TIERS.map((tt, i) => {
      const lv = i + 1;
      const reached = info.level >= lv;
      const label = i === A.TIERS.length - 1 ? `Nv ${lv}+` : `Nv ${lv}`;
      return `<li class="${reached ? "reached" : ""}${tier.index === i ? " current" : ""}">
        ${A.levelEmblem(lv, 58, { locked: !reached, label: `Nível ${lv}: ${tt.name}${reached ? "" : " (bloqueado)"}` })}
        <b>${esc(tt.name)}</b><small>${label}</small></li>`;
    }).join("");

    const badges = P.BADGES.map((b) => {
      const on = !!profile.badges[b.id];
      return `
      <div class="badge-tile ${on ? "on" : ""}">
        <span class="badge-art">${A.badgeArt(b.id, on, 64)}</span>
        <b>${esc(b.name)}</b>
        <small>${esc(b.desc)}</small>
      </div>`;
    }).join("");

    const history = profile.simulados.length
      ? profile.simulados.map((s) => `
          <li><span>${esc(s.date)}</span><b>${s.hits} de ${s.total}</b><span>${formatClock(s.seconds * 1000)}</span></li>`).join("")
      : `<li class="muted">Nenhum simulado ainda.</li>`;

    const sound = profile.sound !== false;

    return `
    <section class="page profile">
      <div class="theory-head">
        ${mascot("happy", 96)}
        <div>
          <p class="eyebrow">PERFIL · NÍVEL ${info.level}</p>
          <h1 tabindex="-1">Seu progresso</h1>
        </div>
      </div>

      <form class="card form inline" data-form="profile-name">
        <div class="avatar-current" aria-hidden="true">${esc(profile.avatar)}</div>
        <label class="sr-only" for="pname">Nome</label>
        <input id="pname" name="name" maxlength="24" value="${esc(profile.name)}" placeholder="Seu nome" />
        <button type="submit" class="btn btn-primary">Salvar nome</button>
      </form>

      <div class="card">
        <span class="label" id="avatar-label-profile">Trocar avatar</span>
        <div class="avatar-grid" role="group" aria-labelledby="avatar-label-profile">${avatarButtons(profile.avatar)}</div>
      </div>

      <div class="card settings-row">
        <span>Efeitos sonoros</span>
        <button type="button" class="btn btn-ghost" data-action="toggle-sound" aria-pressed="${sound}">${icon(sound ? "sound" : "sound-off", 22)} ${sound ? "Ligados" : "Desligados"}</button>
      </div>

      <div class="card level-card">
        ${A.levelEmblem(info.level, 104)}
        <div class="level-card-text">
          <p class="eyebrow">SEU NÍVEL</p>
          <h2>Nível ${info.level} · ${esc(tier.name)}</h2>
          <div class="bar xp" role="progressbar" aria-label="Progresso até o nível ${info.level + 1}"
            aria-valuemin="0" aria-valuemax="100" aria-valuenow="${ratio}"><span style="width:${ratio}%"></span></div>
          <small class="muted">${info.into} de ${info.span} XP para o nível ${info.level + 1}</small>
        </div>
      </div>

      <h2 class="h-ico">${icon("level", 28)} Jornada de níveis</h2>
      <ol class="journey">${journey}</ol>

      <div class="stat-grid">
        <div class="card stat">${icon("star", 30)}<b>${profile.xp}</b><span>XP total</span></div>
        <div class="card stat">${icon("level", 30)}<b>${info.level}</b><span>Nível</span></div>
        <div class="card stat">${icon("flame", 30)}<b>${P.currentStreak(profile, now)}</b><span>Sequência atual</span></div>
        <div class="card stat">${icon("trophy", 30)}<b>${profile.bestStreak}</b><span>Maior sequência</span></div>
        <div class="card stat">${icon("paper", 30)}<b>${t.answered}</b><span>Questões respondidas</span></div>
        <div class="card stat">${icon("check", 30)}<b>${t.correct}</b><span>Acertos</span></div>
        <div class="card stat">${icon("close", 30)}<b>${t.wrong}</b><span>Erros</span></div>
        <div class="card stat">${icon("target", 30)}<b>${percent(t.correct, t.answered)}%</b><span>Taxa de acerto</span></div>
      </div>

      <h2 class="h-ico">${icon("target", 28)} Desempenho por assunto</h2>
      <div class="card">
        <ul class="topic-list">${topicRows}</ul>
        ${topics.length ? `<button type="button" class="btn btn-ghost btn-block" data-action="go" data-arg="#/practice">Revisar meus erros →</button>` : ""}
      </div>

      <h2 class="h-ico">${icon("medal", 28)} Conquistas</h2>
      <div class="badge-grid">${badges}</div>

      <h2 class="h-ico">${icon("podium", 28)} Placar dos simulados</h2>
      <div class="card"><ul class="history">${history}</ul></div>

      <div class="danger-zone">
        <button type="button" class="btn btn-ghost" data-action="reset-progress">Apagar progresso</button>
      </div>
    </section>`;
  }

  function notFoundView() {
    return `
    <section class="page narrow">
      <div class="card result">
        <div class="result-hero">${mascot("wrong", 120, "lumi")}<span class="emblem" aria-hidden="true">${icon("u-compass", 44)}</span></div>
        <h1 tabindex="-1">Página não encontrada</h1>
        <a class="btn btn-primary" href="#/">Voltar à trilha</a>
      </div>
    </section>`;
  }

  App.Views = {
    mascot,
    icon,
    statsChips,
    heartsChip,
    heartsLive,
    heartSubText,
    heartLine,
    onboardingView,
    homeView,
    theoryView,
    lockedView,
    quizView,
    resultView,
    practiceIntroView,
    simuladoIntroView,
    profileView,
    notFoundView,
  };
})(window.App);
