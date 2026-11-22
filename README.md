# Desafio Algébrico — Rumo ao ENEM

Plataforma gamificada para aprender álgebra do Ensino Médio e treinar para o ENEM, com
trilha de lições, vidas, XP, níveis, sequência de dias, conquistas e simulados.

## Funcionalidades

- **Trilha de aprendizado:** 6 unidades e 11 lições. Cada lição começa com uma teoria curta e depois os exercícios. A próxima lição só desbloqueia quando a anterior é concluída.
- **Exercícios com feedback imediato:** explicação após cada resposta, dica opcional (que reduz pela metade o XP da questão) e revisitação de questões erradas no fim da fila.
- **Vidas:** 5 vidas. Um erro em lição tira uma vida, e **uma vida volta a cada 2 minutos**. O contador é real: ele usa o horário salvo no perfil, então continua contando ao recarregar a página, trocar de tela, fechar o navegador ou abrir outra aba. Quem fica 5 minutos fora volta com +2 vidas e com 1 minuto já andado da próxima. Com 5/5 não há contador. Sem vidas, a lição não inicia (a revisão continua disponível).
- **Painel "Suas vidas":** clique nas vidas no topo para ver os corações (o próximo vai enchendo), quantas vidas você tem e quanto falta para a próxima.
- **Gamificação:** XP por acerto (10, 15 ou 20 conforme a dificuldade), estrelas por lição (3 sem erros, 2 com um erro, 1 nos demais casos), níveis com 9 emblemas de evolução (Semente, Broto, Explorador, Cristal, Safira, Ametista, Rubi, Diamante e Lenda), sequência de dias e 8 conquistas com emblemas próprios.
- **Revisão de erros:** monta 10 questões priorizando o que você mais erra. Acertar uma questão depois de errá-la quita o erro pendente.
- **Simulado:** 10 questões sorteadas, com cronômetro, sem dicas e sem vidas. Erros não voltam para a fila.
- **Perfil:** nome, avatar, estatísticas gerais, desempenho por assunto (do mais fraco para o mais forte), conquistas e histórico de simulados.
- **Visual de jogo:** três mascotes originais desenhados em SVG: **Raiz** (o principal, verde, com um broto na cabeça), **Lumi** (azul, das dicas e do simulado) e **Brasa** (laranja, da revisão). O Raiz tem poses para estudar, acertar, errar, sequência de acertos, incentivar, concluir e subir de nível. Ícones em um único estilo, confete ao concluir, XP flutuante e efeitos sonoros sintetizados.
- **Acessibilidade:** navegação por teclado (teclas 1 a 4 para escolher, Enter para verificar e continuar), foco visível, leitores de tela (rótulos ARIA, status das respostas), suporte a `prefers-reduced-motion` e modo escuro automático.
- **Responsivo:** no celular a navegação vai para a barra inferior.

## Como executar

Não há etapa de build. O projeto é HTML, CSS e JavaScript puro.

- Abra o `index.html` diretamente no navegador, ou
- sirva a pasta com um servidor estático (mais estável para o `localStorage`), por exemplo:
  `python3 -m http.server 8080` e depois acesse `http://localhost:8080`.

## Testes

```bash
npm test
```

Os testes cobrem o banco de questões (gabaritos, distratores, referências da trilha), as regras de XP, vidas, sequência, estrelas, conquistas, o motor de sessão de quiz e a persistência.

## Estrutura

```
index.html              Casca da página (navegação e áreas de conteúdo)
css/styles.css          Sistema visual: cores, componentes, animações, responsivo e modo escuro
js/core/utils.js        Utilitários (escape de HTML, datas, embaralhamento, formatação)
js/core/store.js        Persistência do perfil (localStorage, com fallback em memória)
js/core/progress.js     Regras de gamificação (XP, níveis, vidas, sequência, estrelas, conquistas)
js/core/quiz.js         Motor de sessão de quiz, sem DOM
js/data/questions.js    Banco de questões
js/data/units.js        Trilha: unidades, lições, teoria e questões de cada lição
js/ui/art.js            Arte vetorial: ícones, mascotes, emblemas de nível e de conquistas
js/ui/views.js          Telas em HTML
js/app.js               Roteamento por hash, ações do usuário e fluxo das sessões
tests/logic.test.js     Testes automatizados da lógica e dos dados
```

### Como adicionar uma questão

Acrescente um objeto em `js/data/questions.js`:

```js
{ id: "q45", topic: "Função afim", difficulty: 2,
  text: "Enunciado da questão.",
  answer: "Resposta correta",             // texto exato da alternativa correta
  distractors: ["Errada 1", "Errada 2", "Errada 3"],
  hint: "Dica curta.",
  explain: "Explicação mostrada após a resposta." }
```

Depois, inclua o `id` na lista `questions` de uma lição em `js/data/units.js`. O `npm test` avisa se uma questão ficar sem lição, se um id estiver repetido ou se houver alternativas duplicadas.

O gabarito é guardado pelo texto da alternativa, e não pelo índice. Por isso as alternativas podem ser embaralhadas sem risco de marcar a resposta errada.

## Publicar na Vercel

1. Envie o repositório para o GitHub.
2. Na Vercel, importe o repositório.
3. Framework Preset: **Other**. Build Command e Output Directory: vazios.
4. Clique em Deploy.

## Limitações atuais

- O progresso é salvo apenas no navegador onde o app foi usado. Ele não sincroniza entre dispositivos.
- O contador de vidas usa o relógio do aparelho. Se a pessoa adiantar o relógio, ganha vidas antes da hora (só um servidor resolveria isso). Se atrasar, o contador recomeça em vez de travar.
- Os avatares do perfil continuam sendo emojis.
- Uma sessão em andamento não sobrevive a um recarregamento da página.
- Os efeitos sonoros dependem do navegador liberar o áudio após o primeiro toque.
- O banco tem 44 questões. Cada lição usa sempre as mesmas questões, na mesma ordem (só a ordem das alternativas muda).

## Próximos passos

- **Supabase:** login e sincronização do progresso. A troca fica concentrada em `js/core/store.js`, mantendo o mesmo formato de perfil.
- **Ranking da turma** a partir dos XP sincronizados.
- **Painel do professor** com desempenho por aluno e por assunto.
- **Banco maior de questões**, com imagens e gráficos.
- **Relatório dos assuntos em que o aluno mais erra**, em formato exportável.
