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
  const starsText = (n) => "★".repeat(n) + "☆".repeat(3 - n);

  /* Xis, o mascote. Humor: happy | cheer | sad | idle */
  function mascot(mood = "happy", size = 110) {
    const mouth = {
      happy: '<path class="m-stroke" d="M46 76 Q60 90 74 76"/>',
      idle: '<path class="m-stroke" d="M50 78 Q60 84 70 78"/>',
      cheer: '<path class="m-mouth" d="M44 74 Q60 100 76 74 Z"/>',
      sad: '<path class="m-stroke" d="M48 88 Q60 78 72 88"/>',
    }[mood] || '<path class="m-stroke" d="M46 76 Q60 90 74 76"/>';
    const eyes = mood === "cheer"
      ? '<path class="m-stroke" d="M34 54 Q42 42 50 54"/><path class="m-stroke" d="M70 54 Q78 42 86 54"/>'
      : mood === "sad"
        ? '<circle class="m-eye" cx="42" cy="54" r="6.5"/><circle class="m-eye" cx="78" cy="54" r="6.5"/>'
          + '<path class="m-stroke" d="M32 44 L50 48"/><path class="m-stroke" d="M88 44 L70 48"/>'
        : '<circle class="m-eye" cx="42" cy="52" r="7"/><circle class="m-eye" cx="78" cy="52" r="7"/>'
          + '<circle class="m-pupil" cx="44" cy="54" r="3"/><circle class="m-pupil" cx="80" cy="54" r="3"/>';
    return `
    <svg class="mascot mascot-${mood}" viewBox="0 0 120 124" width="${size}" height="${size}" role="img" aria-label="Xis, o mascote">
      <ellipse class="m-shadow" cx="60" cy="119" rx="34" ry="5"/>
      <g class="m-arm m-arm-l"><ellipse cx="11" cy="74" rx="9" ry="15"/></g>
      <g class="m-arm m-arm-r"><ellipse cx="109" cy="74" rx="9" ry="15"/></g>
      <g class="m-body">
        <path class="m-fill" d="M60 8C92 8 110 34 108 66C106 98 86 112 60 112C34 112 14 98 12 66C10 34 28 8 60 8Z"/>
        <ellipse class="m-shine" cx="42" cy="32" rx="13" ry="7"/>
        <circle class="m-cheek" cx="28" cy="72" r="7"/>
        <circle class="m-cheek" cx="92" cy="72" r="7"/>
        ${eyes}
        ${mouth}
        <text class="m-sigma" x="60" y="104" text-anchor="middle">∑</text>
      </g>
    </svg>`;
  }

  function soundButton(profile) {
    const on = profile.sound !== false;
    return `<button type="button" class="chip chip-btn" data-action="toggle-sound" aria-pressed="${on}"
      aria-label="Efeitos sonoros ${on ? "ligados" : "desligados"}" title="Efeitos sonoros">${on ? "🔊" : "🔇"}</button>`;
  }

  function statsChips(profile, now) {
    const info = P.levelInfo(profile.xp);
    const streak = P.currentStreak(profile, now);
    return `
      <span class="chip chip-streak" title="Sequência de dias"><span aria-hidden="true">🔥</span> <b>${streak}</b></span>
      <span class="chip chip-xp" title="XP total"><span aria-hidden="true">⭐</span> <b>${profile.xp}</b><small> · Nv ${info.level}</small></span>
      <span class="chip chip-hearts" title="Vidas"><span aria-hidden="true">❤️</span> <b>${profile.hearts}</b></span>
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
      <div class="onboard-hero">${mascot("cheer", 150)}</div>
      <div class="speech">Oi! Eu sou o Xis. Vamos montar a sua trilha de álgebra?</div>
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
    const content = s.completed ? "✓" : s.unlocked ? s.lesson.number : "🔒";
    const aria = s.completed
      ? `, concluída, ${s.stars} de 3 estrelas`
      : s.unlocked ? "" : ", bloqueada";
    const attrs = s.unlocked ? `data-action="go" data-arg="#/lesson/${s.lesson.id}"` : "disabled";
    const crown = s.stars === 3 ? '<span class="crown" aria-hidden="true">👑</span>' : "";
    const bubble = isNext ? '<span class="start-bubble" aria-hidden="true">COMEÇAR</span>' : "";
    const stars = s.completed ? `<span class="stars" aria-hidden="true">${starsText(s.stars)}</span>` : "";
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
      ? `Sequência de ${plural(streak, "dia", "dias")}! Não quebre a corrente 🔥`
      : "Complete uma lição hoje e acenda sua sequência 🔥";
    const cta = next
      ? `<button type="button" class="btn btn-primary btn-block btn-xl" data-action="go" data-arg="#/lesson/${next.lesson.id}">Continuar: ${esc(next.lesson.title)} →</button>`
      : `<p class="done-note">🎉 Trilha concluída! Treine a revisão e os simulados para manter o nível.</p>`;

    const units = App.Data.units.map((unit, idx) => {
      const items = states.filter((s) => s.lesson.unitId === unit.id);
      const done = items.filter((s) => s.completed).length;
      return `
      <section class="unit unit-${unit.color}" aria-labelledby="unit-${unit.id}">
        <header class="unit-banner">
          <span class="unit-emoji" aria-hidden="true">${unit.emoji}</span>
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
        <div class="hero-mascot">${mascot(streak > 0 ? "cheer" : "happy", 110)}</div>
        <div class="hero-text">
          <h1 tabindex="-1">Olá${profile.name ? `, ${esc(profile.name)}` : ""}! ${esc(profile.avatar)}</h1>
          <div class="speech">${esc(streakText)}</div>
          <p class="eyebrow">NÍVEL ${info.level}</p>
          <div class="bar xp" role="progressbar" aria-label="Progresso até o nível ${info.level + 1}"
            aria-valuemin="0" aria-valuemax="100" aria-valuenow="${ratio}">
            <span style="width:${ratio}%"></span>
          </div>
          <small class="muted">${info.into} de ${info.span} XP para o nível ${info.level + 1}</small>
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
    const hearts = profile.hearts > 0
      ? `❤️ ${profile.hearts} ${profile.hearts === 1 ? "vida disponível" : "vidas disponíveis"}`
      : "Sem vidas no momento. Elas voltam com o tempo.";
    return `
    <section class="page narrow">
      <a class="back" href="#/">← Voltar à trilha</a>
      <div class="theory-head">
        ${mascot("idle", 96)}
        <div>
          <p class="eyebrow">${esc(lesson.unitTitle)} · LIÇÃO ${lesson.number}</p>
          <h1 tabindex="-1">${esc(lesson.title)}</h1>
        </div>
      </div>
      <article class="card theory">${blocks}</article>
      <p class="muted center">${plural(lesson.questions.length, "exercício", "exercícios")} · até 20 XP ao concluir · ${hearts}</p>
      <button type="button" class="btn btn-primary btn-block btn-xl" data-action="start-lesson" data-arg="${lesson.id}">Começar exercícios</button>
    </section>`;
  }

  function lockedView(lesson) {
    return `
    <section class="page narrow">
      <a class="back" href="#/">← Voltar à trilha</a>
      <div class="card result">
        <div class="result-icon" aria-hidden="true">🔒</div>
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
      ? `<span class="chip chip-hearts" aria-label="${profile.hearts} vidas"><span aria-hidden="true">❤️</span> <b>${profile.hearts}</b></span>`
      : kind === "simulado"
        ? `<span class="chip" aria-label="Tempo decorrido">⏱ <b data-since="${s.startedAt}">${formatClock(now - s.startedAt)}</b></span>`
        : `<span class="chip chip-review">♻️ Revisão</span>`;

    const hint = s.hintUsed && !s.verified
      ? `<div class="hint" role="note"><b>💡 Dica:</b> ${esc(q.hint)}</div>`
      : "";

    let bottom;
    if (!s.verified) {
      const canHint = kind !== "simulado" && !s.hintUsed;
      bottom = `
      <div class="footer">
        ${canHint ? `<button type="button" class="btn btn-ghost" data-action="hint">💡 Dica</button>` : "<span></span>"}
        <button type="button" class="btn btn-primary btn-xl" data-action="verify" ${s.selected === null ? "disabled" : ""}>
          ${kind === "simulado" ? "Confirmar" : "Verificar"}
        </button>
      </div>`;
    } else {
      const ok = s.lastCorrect;
      bottom = `
      <div class="feedback ${ok ? "ok" : "no"}" role="status" aria-live="polite">
        <div class="fb-mascot">${mascot(ok ? "cheer" : "sad", 64)}</div>
        <div class="fb-text">
          <p class="fb-title">${ok ? "Isso aí! Correto!" : "Ops! Não foi dessa vez."}</p>
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
        <button type="button" class="icon-btn" data-action="quit" aria-label="Sair">✕</button>
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

  function resultView(r) {
    const stars = typeof r.stars === "number"
      ? `<div class="stars big" role="img" aria-label="${r.stars} de 3 estrelas">${[0, 1, 2].map((i) =>
          `<span class="star ${i < r.stars ? "on" : "off"}" style="animation-delay:${0.2 + i * 0.18}s">${i < r.stars ? "★" : "☆"}</span>`).join("")}</div>`
      : "";
    const level = r.leveledUp
      ? `<div class="level-up" role="status">🎉 Você subiu para o nível ${r.leveledUp}!</div>`
      : "";
    const countdown = r.until
      ? `<p class="muted">Próxima vida em <b data-until="${r.until}">--:--</b></p>`
      : "";
    const stats = (r.stats || [])
      .map((s) => `<div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`)
      .join("");
    const badges = r.newBadges && r.newBadges.length
      ? `<div class="unlocked">
           <p class="eyebrow">CONQUISTAS DESBLOQUEADAS</p>
           <div class="pill-row">${r.newBadges.map((b) => `<span class="pill">${b.icon} ${esc(b.name)}</span>`).join("")}</div>
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
          ${mascot(r.mood || "happy", 130)}
          <span class="emblem" aria-hidden="true">${r.icon}</span>
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
        ${mascot("idle", 96)}
        <div>
          <p class="eyebrow">REVISÃO</p>
          <h1 tabindex="-1">Treine o que mais erra</h1>
        </div>
      </div>
      <p class="muted">Montamos 10 questões priorizando os erros que ainda não foram superados. A revisão não consome vidas.</p>
      <div class="card"><p>Questões com erro pendente: <b>${pending}</b></p></div>
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
        ${mascot("cheer", 96)}
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

    const badges = P.BADGES.map((b) => {
      const on = !!profile.badges[b.id];
      return `
      <div class="badge-tile ${on ? "on" : ""}">
        <span aria-hidden="true">${on ? b.icon : "🔒"}</span>
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
        ${mascot("happy", 88)}
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
        <button type="button" class="btn btn-ghost" data-action="toggle-sound" aria-pressed="${sound}">${sound ? "🔊 Ligados" : "🔇 Desligados"}</button>
      </div>

      <div class="stat-grid">
        <div class="card stat"><b>${profile.xp}</b><span>XP total</span></div>
        <div class="card stat"><b>${info.level}</b><span>Nível</span></div>
        <div class="card stat"><b>${P.currentStreak(profile, now)}</b><span>Sequência atual</span></div>
        <div class="card stat"><b>${profile.bestStreak}</b><span>Maior sequência</span></div>
        <div class="card stat"><b>${t.answered}</b><span>Questões respondidas</span></div>
        <div class="card stat"><b>${t.correct}</b><span>Acertos</span></div>
        <div class="card stat"><b>${t.wrong}</b><span>Erros</span></div>
        <div class="card stat"><b>${percent(t.correct, t.answered)}%</b><span>Taxa de acerto</span></div>
      </div>

      <h2>Desempenho por assunto</h2>
      <div class="card">
        <ul class="topic-list">${topicRows}</ul>
        ${topics.length ? `<button type="button" class="btn btn-ghost btn-block" data-action="go" data-arg="#/practice">Revisar meus erros →</button>` : ""}
      </div>

      <h2>Conquistas</h2>
      <div class="badge-grid">${badges}</div>

      <h2>Simulados</h2>
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
        <div class="result-icon" aria-hidden="true">🧭</div>
        <h1 tabindex="-1">Página não encontrada</h1>
        <a class="btn btn-primary" href="#/">Voltar à trilha</a>
      </div>
    </section>`;
  }

  App.Views = {
    mascot,
    statsChips,
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
