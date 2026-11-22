/*
 * Trilha de aprendizado. Cada unidade tem lições; cada lição tem uma teoria curta
 * (strings = parágrafos; { example } = destaque) e a lista de ids das questões.
 */
window.App = window.App || {};
(function (App) {
  "use strict";
  App.Data = App.Data || {};
  App.Data.units = [
    {
      id: "u1", title: "Expressões algébricas", color: "blue",
      lessons: [
        {
          id: "u1-l1", title: "Termos semelhantes", questions: ["q01", "q02", "q03", "q04"],
          theory: [
            "Uma expressão algébrica combina números, letras e operações. As letras representam valores que podem variar.",
            { example: "2x + 3x − 5 = 5x − 5" },
            "Só somamos termos semelhantes: aqueles que têm a mesma parte literal, ou seja, a mesma letra com o mesmo expoente.",
          ],
        },
        {
          id: "u1-l2", title: "Valor numérico", questions: ["q05", "q06", "q07", "q08"],
          theory: [
            "Calcular o valor numérico de uma expressão é substituir as letras pelos números dados e seguir a ordem das operações.",
            { example: "Se x = 3: x² + 2x = 3² + 2 · 3 = 9 + 6 = 15" },
            "Atenção: (−2)² = 4, mas −2² = −4. Potências vêm antes de multiplicações e somas.",
          ],
        },
      ],
    },
    {
      id: "u2", title: "Equações do 1º grau", color: "green",
      lessons: [
        {
          id: "u2-l1", title: "Resolvendo equações", questions: ["q09", "q10", "q11", "q12"],
          theory: [
            "Uma equação é uma igualdade com uma incógnita. Para resolvê-la, fazemos as mesmas operações dos dois lados até isolar x.",
            { example: "3x + 6 = 21 → 3x = 15 → x = 5" },
            "Somar, subtrair, multiplicar ou dividir os dois lados pelo mesmo valor mantém a igualdade verdadeira.",
          ],
        },
        {
          id: "u2-l2", title: "Problemas com equações", questions: ["q13", "q14", "q15", "q16"],
          theory: [
            "Para resolver um problema, traduza o texto para a linguagem matemática: escolha a incógnita, escreva a equação e resolva.",
            { example: "Um número mais o dobro dele é 45: x + 2x = 45 → 3x = 45 → x = 15" },
          ],
        },
      ],
    },
    {
      id: "u3", title: "Sistemas de equações", color: "purple",
      lessons: [
        {
          id: "u3-l1", title: "Resolvendo sistemas", questions: ["q17", "q18", "q19", "q20"],
          theory: [
            "Um sistema reúne duas equações com as mesmas incógnitas. Pelo método da adição, somamos as equações para eliminar uma variável.",
            { example: "x + y = 10 e x − y = 2 → 2x = 12 → x = 6, logo y = 4" },
            "Pelo método da substituição, isole uma variável em uma equação e substitua na outra.",
          ],
        },
        {
          id: "u3-l2", title: "Problemas com sistemas", questions: ["q21", "q22", "q23"],
          theory: [
            "Quando um problema tem dois valores desconhecidos e duas informações, ele vira um sistema. Dê nome a cada incógnita, por exemplo x = preço da caneta e y = preço do caderno.",
            { example: "2x + 3y = 31 e x + 2y = 19 → y = 7" },
          ],
        },
      ],
    },
    {
      id: "u4", title: "Função afim", color: "orange",
      lessons: [
        {
          id: "u4-l1", title: "Lei e gráfico", questions: ["q24", "q25", "q26", "q27"],
          theory: [
            "Uma função afim tem a forma f(x) = ax + b. O coeficiente a é a inclinação, ou taxa de variação, e b é o valor de f quando x = 0.",
            { example: "f(x) = 2x + 10 → f(5) = 20" },
            "Se a > 0, a função é crescente. Se a < 0, é decrescente.",
          ],
        },
        {
          id: "u4-l2", title: "Zero e aplicações", questions: ["q28", "q29", "q30", "q31"],
          theory: [
            "O zero da função é o valor de x em que f(x) = 0, ou seja, onde a reta corta o eixo x.",
            "Em problemas de custo e receita, o lucro é zero quando a receita se iguala ao custo.",
            { example: "R(x) = 30x e C(x) = 10x + 400 → 30x = 10x + 400 → x = 20" },
          ],
        },
      ],
    },
    {
      id: "u5", title: "Função quadrática", color: "pink",
      lessons: [
        {
          id: "u5-l1", title: "Raízes e fatoração", questions: ["q32", "q33", "q34", "q35"],
          theory: [
            "Uma função quadrática tem a forma f(x) = ax² + bx + c, com a diferente de zero. Seu gráfico é uma parábola.",
            "As raízes são os valores de x em que f(x) = 0. Fatorar ajuda: x² − 5x + 6 = (x − 2)(x − 3), então as raízes são 2 e 3.",
            "Também é possível usar a fórmula de Bhaskara: x = (−b ± √Δ) / 2a.",
          ],
        },
        {
          id: "u5-l2", title: "Vértice e valor máximo", questions: ["q36", "q37", "q38", "q39"],
          theory: [
            "O vértice da parábola tem x_v = −b / (2a). Se a < 0, a parábola abre para baixo e o vértice é um ponto de máximo. Se a > 0, é um ponto de mínimo.",
            { example: "y = x² − 4x + 1 → x_v = −(−4) / 2 = 2" },
          ],
        },
      ],
    },
    {
      id: "u6", title: "Problemas do cotidiano", color: "teal",
      lessons: [
        {
          id: "u6-l1", title: "Estilo ENEM", questions: ["q40", "q41", "q42", "q43", "q44"],
          theory: [
            "No ENEM, a matemática aparece em situações do dia a dia. Uma estratégia: 1) o que o problema fornece? 2) o que preciso descobrir? 3) qual relação conecta as informações?",
            { example: "Plano A: 120 + 80m e Plano B: 100m → iguale e resolva para m" },
          ],
        },
      ],
    },
  ];
})(window.App);
