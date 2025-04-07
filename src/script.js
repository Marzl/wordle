
// =======================
// DADOS
// =======================

const quizQuestions = [
  {
    question: "Qual país tem a maior população do mundo?",
    options: ["China", "Índia", "Estados Unidos", "Rússia"],
    answer: 1
  },
  {
    question: "Qual país tem a maior área territorial?",
    options: ["Canadá", "Estados Unidos", "China", "Rússia"],
    answer: 3
  },
  {
    question: "Qual desses países não está na Europa?",
    options: ["Portugal", "Noruega", "Austrália", "França"],
    answer: 2
  },
  {
    question: "Qual é o país da Torre Eiffel?",
    options: ["Itália", "Inglaterra", "França", "Espanha"],
    answer: 2
  },
  {
    question: "Onde está localizado o Monte Fuji?",
    options: ["Coreia do Sul", "China", "Japão", "Tailândia"],
    answer: 2
  },
  {
    question: "Qual país é conhecido como Terra dos Mil Lagos?",
    options: ["Canadá", "Finlândia", "Suécia", "Islândia"],
    answer: 1
  },
  {
    question: "Qual país tem o Cristo Redentor?",
    options: ["México", "Brasil", "Argentina", "Colômbia"],
    answer: 1
  },
  {
    question: "Qual desses é um país africano?",
    options: ["Nepal", "Quênia", "Turquia", "Laos"],
    answer: 1
  },
  {
    question: "Qual é a capital da Alemanha?",
    options: ["Berlim", "Munique", "Hamburgo", "Frankfurt"],
    answer: 0
  },
  {
    question: "Qual país é famoso pelos cangurus?",
    options: ["Austrália", "Nova Zelândia", "África do Sul", "Índia"],
    answer: 0
  }
];

let quizIndex = 0;
let correctAnswers = 0;

let paises = [];

const API_URL = "https://restcountries.com/v3.1/all";


fetch(API_URL)
  .then(res => res.json())
  .then(dados => {
    paises = dados.map(pais => {
      return {
        nome: pais.translations?.por?.common || pais.name.common,
        continente: pais.region,
        idioma: Object.values(pais.languages || {}).join(", "),
        populacao: (pais.population / 1_000_000).toFixed(1) + " milhões",
        bandeira: pais.flags.svg,
        moeda: Object.values(pais.currencies || {}).map(m => m.symbol).join(", ")
      };
    });

    paisCorreto = paises[Math.floor(Math.random() * paises.length)];
    console.log("Dados carregados com sucesso");
  })
  .catch(err => {
    console.error("Erro ao buscar dados:", err);
    alert("Erro ao carregar dados dos países. Tente novamente mais tarde.");
  });


let paisesEscolhidos = [];
let paisCorreto = null; // Será definido no modo clássico

// =======================
// AUTOCOMPLETE INPUT
// =======================

const guessInput = document.getElementById("guessInput");
const suggestionsBox = document.getElementById("suggestions");

guessInput.addEventListener("input", () => {
  const query = guessInput.value.toLowerCase().trim();
  suggestionsBox.innerHTML = "";

  if (query.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  const suggestions = paises.filter(p => {
  const nomePadronizado = p.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return nomePadronizado.startsWith(query) && !paisesEscolhidos.includes(nomePadronizado);
});


  if (suggestions.length > 0) {
    suggestionsBox.style.display = "block";

    suggestions.forEach(pais => {
      const item = document.createElement("div");
      item.classList.add("suggestion-item");
      item.innerHTML = `
        <img src="${pais.bandeira}" alt="${pais.nome}" />
        <span>${pais.nome}</span>
      `;
      item.addEventListener("click", () => {
        guessInput.value = pais.nome;
        suggestionsBox.style.display = "none";
        guessInput.focus();
      });
      suggestionsBox.appendChild(item);
    });

  } else {
    suggestionsBox.style.display = "none";
  }
});

// Fecha sugestões ao clicar fora
document.addEventListener("click", (e) => {
  if (!suggestionsBox.contains(e.target) && e.target !== guessInput) {
    suggestionsBox.style.display = "none";
  }
});

// =======================
// LÓGICA DO JOGO
// =======================

const squaresContainer = document.getElementById("squaresContainer");

function makeGuess() {
  const guess = guessInput.value.trim().toLowerCase();
  if (!guess) return;
  
  if (paisesEscolhidos.includes(guess)) {
    alert("Você já escolheu esse país!");
    guessInput.value = "";
    return;
  }

  const pais = paises.find(p => 
  p.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === 
  guess.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
);
  if (!pais) {
    alert("País não encontrado!");
    guessInput.value = "";
    return;
  }

  const guessPadronizado = guess.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
paisesEscolhidos.push(guessPadronizado);


  if (squaresContainer.children.length === 0) {
    const legend = document.createElement("div");
    legend.className = "legend-row";
legend.innerHTML = `
  <span>País</span>
  <span>Continente</span>
  <span>Idioma</span>
  <span>População</span>
  <span>Moeda</span>
`;

    squaresContainer.appendChild(legend);
  }

  const row = document.createElement("div");
  row.className = "square-row";

row.appendChild(createImageSquare(pais.nome, pais.bandeira, check(pais.nome, paisCorreto.nome)));
row.appendChild(createTextSquare(pais.continente, check(pais.continente, paisCorreto.continente)));
row.appendChild(createTextSquare(pais.idioma, check(pais.idioma, paisCorreto.idioma)));
row.appendChild(createTextSquare(pais.populacao, check(pais.populacao, paisCorreto.populacao)));
row.appendChild(createTextSquare(pais.moeda, check(pais.moeda, paisCorreto.moeda), "moeda"));



  squaresContainer.appendChild(row);

if (pais.nome === paisCorreto.nome) { 
  document.getElementById("resultMessage").textContent = "🎉 Você acertou!";
  guessInput.disabled = true;
  document.querySelector(".input-section").style.display = "none";
  document.getElementById("actionButtons").style.display = "flex";

  setTimeout(() => {
    document.getElementById("resultMessage").scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, 300); 
}

  guessInput.value = "";
}

// =======================
// CRIAÇÃO DE ELEMENTOS
// =======================

function createImageSquare(nome, imagem, classe) {
  const box = document.createElement("div");
  box.className = `square ${classe}`;
  box.innerHTML = `
    <img src="${imagem}" alt="${nome}" />
    <span class="nome-tooltip">${nome}</span>
  `;
  return box;
}

function createTextSquare(texto, classe, tipo = "") {
  const box = document.createElement("div");
  box.className = `square ${classe}`;

  if (tipo === "moeda") {
    box.innerHTML = `
      <span class="label">Moeda</span>
      <span class="moeda-simbolo">${texto}</span>
    `;
  } else {
    box.textContent = texto;
  }

  return box;
}


// =======================
// LÓGICA DE COMPARAÇÃO
// =======================

function check(resposta, correta) {
  resposta = resposta.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  correta = correta.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (resposta === correta) return "acerto";
  if (correta.includes(resposta)) return "parcial";
  return "erro";
}

// =======================
// MODOS DE JOGO
// =======================

function startClassicMode() {
  paisCorreto = paises[Math.floor(Math.random() * paises.length)];
  document.querySelector(".menu-wrapper").style.display = "none";
  document.getElementById("gameContainer").style.display = "block";
}

function startQuizMode() {
  document.querySelector(".menu-wrapper").style.display = "none";
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("quizContainer").style.display = "block";
  quizIndex = 0;
  correctAnswers = 0;
  showQuizQuestion();
}

function showQuizQuestion() {
  const container = document.getElementById("quizContent");
  container.innerHTML = "";

  if (quizIndex >= quizQuestions.length) {
    showQuizResult();
    return;
  }

  const q = quizQuestions[quizIndex];
  const questionEl = document.createElement("h2");
  questionEl.textContent = q.question;
  container.appendChild(questionEl);

  const optionsContainer = document.createElement("div");
  optionsContainer.classList.add("options");

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;

    btn.onclick = () => {
      // Desabilita todos os botões e destaca respostas
      const allButtons = optionsContainer.querySelectorAll("button");
      allButtons.forEach((button, idx) => {
        button.disabled = true;
        button.style.cursor = "not-allowed";

        if (idx === q.answer) {
          button.classList.add("acerto"); // verde
        } else if (idx === i) {
          button.classList.add("erro"); // vermelho
        } else {
          button.classList.add("desabilitado"); // neutro/cinza se quiser
        }
      });

      if (i === q.answer) correctAnswers++;

      // Espera 1.5 segundos antes de ir para próxima pergunta
      setTimeout(() => {
        quizIndex++;
        showQuizQuestion();
      }, 1500);
    };

    optionsContainer.appendChild(btn);
  });

  container.appendChild(optionsContainer);
}


function showQuizResult() {
  document.getElementById("quizContent").style.display = "none";
  document.getElementById("quizResult").style.display = "block";
  document.getElementById("score").textContent = correctAnswers;

  const canvas = document.getElementById("resultCircle");
  const ctx = canvas.getContext("2d");
  const percent = correctAnswers / 10;

  ctx.clearRect(0, 0, 120, 120);

  // Fundo
  ctx.beginPath();
  ctx.arc(60, 60, 50, 0, 2 * Math.PI);
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 10;
  ctx.stroke();

  // Progresso
  ctx.beginPath();
  ctx.arc(60, 60, 50, -Math.PI / 2, (2 * Math.PI * percent) - Math.PI / 2);
  ctx.strokeStyle = "#00c3ff";
  ctx.lineWidth = 10;
  ctx.stroke();
}

function reiniciarJogo() {
  guessInput.value = "";
  guessInput.disabled = false;
  document.querySelector(".input-section").style.display = "flex";
  document.getElementById("squaresContainer").innerHTML = "";
  document.getElementById("resultMessage").textContent = "";
  document.getElementById("actionButtons").style.display = "none";
  paisCorreto = paises[Math.floor(Math.random() * paises.length)];
  paisesEscolhidos = [];
}

function voltarMenu() {

  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("quizContainer").style.display = "none";

  document.querySelector(".menu-wrapper").style.display = "flex";
  reiniciarJogo();

  quizIndex = 0;
  correctAnswers = 0;
  const quizContent = document.getElementById("quizContent");
  if (quizContent) quizContent.innerHTML = "";
}
