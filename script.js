
"use strict";

// ==========================================
// 🌈 MUNDO DE LAS PALABRAS
// VERSIÓN COMPLETA 2.0
// ==========================================

const SAVE_KEY = "mundoPalabrasSave";

// ==========================================
// 🌍 MUNDOS
// ==========================================

const worlds = [
  { name:"Bosque de las vocales", emoji:"🌳", description:"Descubre las vocales", color:"#a9edc2" },
  { name:"Villa de las sílabas", emoji:"🏡", description:"Aprende a separar sonidos", color:"#ffe1a8" },
  { name:"Océano de palabras", emoji:"🌊", description:"Explora nuevas palabras", color:"#a6ddff" },
  { name:"Castillo de oraciones", emoji:"🏰", description:"Completa palabras", color:"#e4c6ff" },
  { name:"Montaña lectora", emoji:"⛰️", description:"Domina las letras", color:"#c9e9a6" },
  { name:"Reino mágico", emoji:"✨", description:"Conviértete en maestro lector", color:"#ffc6e6" }
];

// ==========================================
// 📚 60 PALABRAS DIFERENTES
// ==========================================

const words = [
  "abeja","avion","arbol","anillo","amigo","arana","ardilla","avena","ala","arco",
  "elefante","estrella","escuela","espejo","erizo","espada","escoba","enano","escalera","enfermera",
  "iglesia","isla","iguana","iman","invierno","idea","imagen","indio","insecto","inicio",
  "oso","oreja","oveja","olla","ojo","oruga","olivo","oro","onda","orquesta",
  "uva","uno","uniforme","universo","unicornio","urgencia","urbano","uso","usuario","unidad",
  "gato","perro","casa","mesa","pelota","mariposa","conejo","caballo","tortuga","pato"
];

const emojis = [
  "🐝","✈️","🌳","💍","🧑","🕷️","🐿️","🌾","🪽","🌈",
  "🐘","⭐","🏫","🪞","🦔","⚔️","🧹","🧙","🪜","👩‍⚕️",
  "⛪","🏝️","🦎","🧲","❄️","💡","🖼️","🧍","🐞","🚀",
  "🐻","👂","🐑","🍲","👁️","🐛","🌿","🥇","🌊","🎼",
  "🍇","1️⃣","👔","🌌","🦄","🚨","🏙️","🛠️","👤","🧩",
  "🐱","🐶","🏠","🪑","⚽","🦋","🐰","🐴","🐢","🦆"
];

const shopItems = [
  { id:"crown", name:"Corona real", emoji:"👑", price:50 },
  { id:"glasses", name:"Gafas mágicas", emoji:"🕶️", price:35 },
  { id:"rainbow", name:"Arcoíris", emoji:"🌈", price:70 },
  { id:"wings", name:"Alas mágicas", emoji:"🪽", price:90 },
  { id:"heart", name:"Vida extra", emoji:"❤️", price:25 },
  { id:"hint", name:"Pista extra", emoji:"💡", price:15 }
];

// ==========================================
// 💾 PROGRESO Y GUARDADO
// ==========================================

function defaultSave() {
  return {
    name: "Jugador",
    theme: "light",
    coins: 100,
    stars: 0,
    lives: 5,
    hints: 3,
    completed: worlds.map(() => []),
    owned: [],
    equipped: [],
    ranking: [],
    lastDaily: "",
    sound: true,
    speech: true
  };
}

function loadSave() {
  try {
    const stored = JSON.parse(localStorage.getItem(SAVE_KEY));

    if (!stored || typeof stored !== "object") {
      return defaultSave();
    }

    const base = defaultSave();

    return {
      ...base,
      ...stored,
      completed: Array.from({ length:6 }, (_, i) =>
        Array.isArray(stored.completed?.[i])
          ? stored.completed[i].filter(n =>
              Number.isInteger(n) && n >= 1 && n <= 60
            )
          : []
      ),
      owned: Array.isArray(stored.owned) ? stored.owned : [],
      equipped: Array.isArray(stored.equipped) ? stored.equipped : [],
      ranking: Array.isArray(stored.ranking) ? stored.ranking : []
    };
  } catch {
    return defaultSave();
  }
}

let save = loadSave();

function persist() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (error) {
    console.warn("No se pudo guardar el progreso.");
  }

  updateStats();
}

function updateStats() {
  document.getElementById("coins").textContent = save.coins;
  document.getElementById("lives").textContent = save.lives;
  document.getElementById("stars").textContent = save.stars;
}

// ==========================================
// 🧭 NAVEGACIÓN
// ==========================================

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const screen = document.getElementById(id);
  if (!screen) return;

  screen.classList.add("active");

  if (id === "worlds") renderWorlds();
  if (id === "levels") renderLevels();
  if (id === "shop") renderShop();
  if (id === "ranking") renderRanking();

  window.scrollTo({ top:0, behavior:"smooth" });
}

function completedCount(index) {
  return save.completed[index].length;
}

function isWorldUnlocked(index) {
  return index === 0 || completedCount(index - 1) === 60;
}

function isLevelUnlocked(world, level) {
  if (!isWorldUnlocked(world)) return false;
  return level === 1 || save.completed[world].includes(level - 1);
}

// ==========================================
// 🌳 MOSTRAR MUNDOS
// ==========================================

let currentWorld = 0;
let currentLevel = 1;

function renderWorlds() {
  const grid = document.getElementById("worldGrid");
  grid.innerHTML = "";

  worlds.forEach((world, index) => {
    const unlocked = isWorldUnlocked(index);
    const card = document.createElement("button");

    card.className = "world-card" + (unlocked ? "" : " locked");
    card.style.borderColor = world.color;

    card.innerHTML = `
      <div class="world-emoji">${world.emoji}</div>
      <h3>${world.name}</h3>
      <p>${world.description}</p>
      <p>${unlocked ? "⭐ " + completedCount(index) + "/60 niveles" : "🔒 Bloqueado"}</p>
    `;

    card.disabled = !unlocked;

    card.addEventListener("click", () => {
      currentWorld = index;
      showScreen("levels");
    });

    grid.appendChild(card);
  });
}

// ==========================================
// 🔢 MOSTRAR 60 NIVELES
// ==========================================

function renderLevels() {
  const world = worlds[currentWorld];

  document.getElementById("levelTitle").textContent =
    world.emoji + " " + world.name;

  const grid = document.getElementById("levelGrid");
  grid.innerHTML = "";

  for (let level = 1; level <= 60; level++) {
    const done = save.completed[currentWorld].includes(level);
    const unlocked = isLevelUnlocked(currentWorld, level);

    const button = document.createElement("button");

    button.className =
      "level-btn" +
      (done ? " done" : "") +
      (!unlocked ? " locked" : "");

    button.textContent =
      done ? "⭐" + level : unlocked ? level : "🔒";

    button.disabled = !unlocked;

    button.addEventListener("click", () => {
      openLevel(currentWorld, level);
    });

    grid.appendChild(button);
  }
}

// ==========================================
// 🧠 PREGUNTAS
// ==========================================

function countSyllables(word) {
  const groups = word.toLowerCase().match(/[aeiouáéíóúü]+/g);
  return groups ? groups.length : 1;
}

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getQuestion(worldIndex, level) {
  const index = level - 1;
  const word = words[index];
  const emoji = emojis[index];

  let question;
  let visual = emoji;
  let answer;
  let options;

  if (worldIndex === 0) {
    answer = word.match(/[aeiou]/i)[0].toUpperCase();
    question = `¿Cuál es la primera vocal de ${word.toUpperCase()}?`;
    options = ["A","E","I","O","U"];
    visual += " 🔤";
  }

  else if (worldIndex === 1) {
    answer = String(countSyllables(word));
    question = `¿Cuántas sílabas tiene ${word.toUpperCase()}?`;
    options = ["1","2","3","4","5"];
    visual += " 🧩";
  }

  else if (worldIndex === 2) {
    answer = word[word.length - 1].toUpperCase();
    question = `¿Con qué letra termina ${word.toUpperCase()}?`;
    options = [answer,"A","E","O","S","R","L"];
    visual += " 🌊";
  }

  else if (worldIndex === 3) {
    answer = word[0].toUpperCase();
    question = `Completa la palabra: ${word.slice(1).toUpperCase()}`;
    options = [answer,"A","E","M","P","S","T"];
    visual += " 🏰";
  }

  else if (worldIndex === 4) {
    answer = String(word.length);
    question = `¿Cuántas letras tiene ${word.toUpperCase()}?`;
    options = [
      answer,
      String(word.length + 1),
      String(Math.max(1, word.length - 1)),
      String(word.length + 2)
    ];
    visual += " ⛰️";
  }

  else {
    answer = word[word.length - 1].toUpperCase();
    question = `Completa la última letra: ${word.slice(0,-1).toUpperCase()}___`;
    options = [answer,"A","E","O","S","N","R"];
    visual += " ✨";
  }

  options = [...new Set(options)];

  const extras = [
    "B","C","D","F","G","H","J","K","L",
    "M","N","P","Q","R","S","T","V","X","Z"
  ];

  while (options.length < 4) {
    const extra = extras[Math.floor(Math.random() * extras.length)];
    if (!options.includes(extra)) options.push(extra);
  }

  options = shuffle(options.slice(0,4));

  if (!options.includes(answer)) {
    options[0] = answer;
    options = shuffle(options);
  }

  return { question, visual, answer, options };
}

// ==========================================
// 🎮 JUGAR
// ==========================================

let currentQuestion = null;
let answered = false;
let attempts = 0;
let hintUsed = false;
let levelReward = 0;

function startAdventure() {
  for (let w = 0; w < 6; w++) {
    if (!isWorldUnlocked(w)) continue;

    for (let l = 1; l <= 60; l++) {
      if (!save.completed[w].includes(l)) {
        openLevel(w,l);
        return;
      }
    }
  }

  showScreen("worlds");
  document.getElementById("homeMessage").textContent =
    "¡Felicidades! ¡Has conquistado todos los mundos! 🏆";
}

function openLevel(world, level) {
  if (!isLevelUnlocked(world,level)) return;

  currentWorld = world;
  currentLevel = level;
  attempts = 0;
  hintUsed = false;
  answered = false;
  levelReward = 0;

  if (save.lives <= 0) {
    save.lives = 5;
  }

  currentQuestion = getQuestion(world,level);

  document.getElementById("worldName").textContent =
    worlds[world].emoji + " " + worlds[world].name;

  document.getElementById("levelNumber").textContent =
    `Nivel ${level}/60`;

  document.getElementById("progressBar").style.width =
    (level / 60 * 100) + "%";

  document.getElementById("questionType").textContent =
    "RETO " + (world + 1);

  document.getElementById("questionText").textContent =
    currentQuestion.question;

  document.getElementById("questionVisual").textContent =
    currentQuestion.visual;

  document.getElementById("feedback").textContent =
    "¡Elige tu respuesta!";

  const options = document.getElementById("answerOptions");
  options.innerHTML = "";

  currentQuestion.options.forEach(option => {
    const button = document.createElement("button");

    button.className = "answer-btn";
    button.textContent = option;

    button.addEventListener("click", () => {
      checkAnswer(option,button);
    });

    options.appendChild(button);
  });

  updateStats();
  showScreen("game");
}

// ==========================================
// ✅ RESPUESTAS Y RECOMPENSAS
// ==========================================

function checkAnswer(answer,button) {
  if (answered) return;

  if (answer === currentQuestion.answer) {
    answered = true;

    button.classList.add("correct");

    levelReward = 5 + Math.floor(currentLevel / 5);

    save.coins += levelReward;
    save.stars += 1;

    if (!save.completed[currentWorld].includes(currentLevel)) {
      save.completed[currentWorld].push(currentLevel);
    }

    updateRanking();
    persist();

    document.getElementById("feedback").textContent =
      "🎉 ¡Correcto! ¡Eres increíble!";

    document.querySelectorAll(".answer-btn").forEach(b => {
      b.disabled = true;
    });

    playSound(true);

    setTimeout(showResult,650);

  } else {
    attempts++;

    button.classList.add("wrong");
    button.disabled = true;

    save.lives = Math.max(0,save.lives - 1);
    persist();

    document.getElementById("feedback").textContent =
      "❌ ¡Inténtalo otra vez!";

    playSound(false);

    if (save.lives === 0) {
      alert("❤️ ¡Recuperaste 5 vidas para seguir jugando!");
      save.lives = 5;
      persist();
    }
  }
}

function showResult() {
  document.getElementById("resultIcon").textContent =
    currentLevel === 60 ? "🏆" : "🌟";

  document.getElementById("resultTitle").textContent =
    currentLevel === 60 ? "¡Mundo completado!" : "¡Excelente trabajo!";

  document.getElementById("resultText").textContent =
    `¡Has superado el nivel ${currentLevel}!`;

  document.getElementById("resultRewards").textContent =
    `🪙 +${levelReward} monedas ⭐ +1 estrella`;

  showScreen("result");
}

function nextLevel() {
  if (currentLevel < 60) {
    openLevel(currentWorld,currentLevel + 1);
  } else if (currentWorld < 5) {
    openLevel(currentWorld + 1,1);
  } else {
    alert("¡Has completado los 360 niveles! 🏆");
    showScreen("worlds");
  }
}

// ==========================================
// 💡 PISTAS
// ==========================================

function useHint() {
  if (answered || hintUsed) return;

  if (save.hints <= 0) {
    document.getElementById("feedback").textContent =
      "¡No tienes pistas! Compra más en la tienda.";
    return;
  }

  const buttons = [...document.querySelectorAll(".answer-btn")];

  const wrongButtons = shuffle(
    buttons.filter(b =>
      b.textContent !== currentQuestion.answer && !b.disabled
    )
  );

  wrongButtons.slice(0,2).forEach(button => {
    button.disabled = true;
    button.style.opacity = ".4";
  });

  save.hints--;
  hintUsed = true;
  persist();

  document.getElementById("feedback").textContent =
    "💡 ¡Eliminé dos respuestas incorrectas!";
}

// ==========================================
// 🔊 SONIDOS
// ==========================================

function playSound(correct) {
  if (!save.sound) return;

  try {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return;

    const ctx = new AudioClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.value = correct ? 660 : 220;
    gain.gain.value = 0.08;

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.18);
    oscillator.onended = () => ctx.close();
  } catch (error) {
    console.log("Sonido no disponible");
  }
}

function readQuestion() {
  if (!save.speech) return;

  if (!("speechSynthesis" in window)) {
    document.getElementById("feedback").textContent =
      "Lectura en voz alta no disponible.";
    return;
  }

  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(currentQuestion.question);
  speech.lang = "es-ES";
  speech.rate = 0.85;

  speechSynthesis.speak(speech);
}

// ==========================================
// 🦄 LUNA INTERACTIVA
// ==========================================

const lunaMessages = [
  "¡Hola! ¡Vamos a aprender juntos! 🦄",
  "¡Eres mi mejor amigo! 💖",
  "¡Sigue practicando! ¡Tú puedes!",
  "¡Me encanta jugar contigo! 🌈",
  "¡Vamos a descubrir nuevas palabras!"
];

function petLuna() {
  const message =
    lunaMessages[Math.floor(Math.random() * lunaMessages.length)];

  document.getElementById("homeMessage").textContent = message;

  const feedback = document.getElementById("feedback");
  if (feedback) feedback.textContent = message;

  document.querySelectorAll(".hero-unicorn,.game-luna").forEach(luna => {
    luna.animate(
      [
        { transform:"scale(1) rotate(0)" },
        { transform:"scale(1.2) rotate(-12deg)" },
        { transform:"scale(1) rotate(12deg)" },
        { transform:"scale(1)" }
      ],
      { duration:600 }
    );
  });
}

// ==========================================
// 🛍️ TIENDA
// ==========================================

function renderShop() {
  const grid = document.getElementById("shopGrid");
  grid.innerHTML = "";

  shopItems.forEach(item => {
    const owned = save.owned.includes(item.id);
    const equipped = save.equipped.includes(item.id);

    const card = document.createElement("div");
    card.className = "shop-item";

    const icon = document.createElement("div");
    icon.className = "item-icon";
    icon.textContent = item.emoji;

    const title = document.createElement("h3");
    title.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = `🪙 ${item.price} monedas`;

    const button = document.createElement("button");

    if (item.id === "heart" || item.id === "hint") {
      button.textContent = `Comprar 🪙 ${item.price}`;
      button.disabled = save.coins < item.price;
    } else {
      button.textContent = equipped ? "Equipado ✓" :
        owned ? "Equipar" : `Comprar 🪙 ${item.price}`;

      button.disabled =
        equipped || (!owned && save.coins < item.price);
    }

    button.addEventListener("click",() => buyItem(item.id));

    card.append(icon,title,price,button);
    grid.appendChild(card);
  });
}

function buyItem(id) {
  const item = shopItems.find(product => product.id === id);
  if (!item) return;

  if (save.coins < item.price) {
    alert("¡No tienes suficientes monedas!");
    return;
  }

  if (id === "heart") {
    save.coins -= item.price;
    save.lives++;
  } else if (id === "hint") {
    save.coins -= item.price;
    save.hints++;
  } else {
    if (save.owned.includes(id)) {
      save.equipped = save.equipped.filter(x =>
        !shopItems.some(other =>
          other.id === x && other.id !== id
        )
      );
      save.equipped.push(id);
    } else {
      save.coins -= item.price;
      save.owned.push(id);
      save.equipped.push(id);
    }
  }

  persist();
  renderShop();
}

// ==========================================
// 🎁 REGALO DIARIO
// ==========================================

function dailyReward() {
  const today = new Date().toLocaleDateString("en-CA");

  if (save.lastDaily === today) {
    alert("🎁 ¡Ya recibiste tu regalo de hoy!");
    return;
  }

  save.lastDaily = today;
  save.coins += 30;
  save.hints++;

  persist();

  alert("🎉 ¡Regalo recibido! +30 monedas y +1 pista.");
}

// ==========================================
// 🏆 RANKING DE JUGADORES
// ==========================================

function getTotalCompleted() {
  return save.completed.reduce(
    (total,levels) => total + levels.length,0
  );
}

function updateRanking() {
  const name = (save.name || "Jugador").trim() || "Jugador";
  const score = getTotalCompleted() * 100 + save.stars;

  if (!Array.isArray(save.ranking)) save.ranking = [];

  const existing = save.ranking.find(player =>
    player.name.toLowerCase() === name.toLowerCase()
  );

  if (existing) {
    existing.score = Math.max(existing.score,score);
    existing.levels = Math.max(
      existing.levels || 0,
      getTotalCompleted()
    );
  } else {
    save.ranking.push({
      name,
      score,
      levels:getTotalCompleted()
    });
  }

  save.ranking.sort((a,b) => b.score - a.score);
  save.ranking = save.ranking.slice(0,50);
}

function savePlayerName() {
  const input = document.getElementById("playerName");
  const name = input.value.trim();

  if (!name) {
    alert("¡Escribe tu nombre primero!");
    return;
  }

  const oldName = save.name || "Jugador";
  save.name = name.slice(0,18);

  // Actualiza el nombre del registro personal.
  const existing = save.ranking.find(p =>
    p.name.toLowerCase() === oldName.toLowerCase()
  );

  if (existing) {
    existing.name = save.name;
  }

  updateRanking();
  persist();
  renderRanking();

  document.getElementById("profileMessage").textContent =
    "¡Tu nombre se guardó correctamente! 🎉";
}

function renderRanking() {
  const list = document.getElementById("rankingList");
  const input = document.getElementById("playerName");

  input.value = save.name || "";

  const ranking = [...save.ranking].sort(
    (a,b) => b.score - a.score
  );

  list.innerHTML = "";

  if (ranking.length === 0) {
    list.textContent =
      "¡Todavía no hay jugadores! Sé el primero en jugar.";
    return;
  }

  ranking.forEach((player,index) => {
    const row = document.createElement("div");
    row.className = "ranking-row";

    const position = document.createElement("span");
    position.className = "ranking-position";
    position.textContent =
      ["🥇","🥈","🥉"][index] || `#${index + 1}`;

    const name = document.createElement("strong");
    name.textContent = player.name;

    const score = document.createElement("span");
    score.textContent = `${player.score} puntos`;

    row.append(position,name,score);
    list.appendChild(row);
  });
}

// ==========================================
// 🎨 TEMAS DE COLORES
// ==========================================

function changeTheme(theme) {
  const valid = ["light","dark","blue","pink"];
  if (!valid.includes(theme)) return;

  document.body.classList.remove(
    "dark-theme","blue-theme","pink-theme"
  );

  if (theme === "dark") {
    document.body.classList.add("dark-theme");
  }

  if (theme === "blue") {
    document.body.classList.add("blue-theme");
  }

  if (theme === "pink") {
    document.body.classList.add("pink-theme");
  }

  save.theme = theme;
  persist();
}

function loadTheme() {
  const theme = save.theme || "light";

  document.getElementById("themeSelect").value = theme;
  changeTheme(theme);
}

// ==========================================
// ⚙️ AJUSTES
// ==========================================

document.getElementById("soundToggle").addEventListener("change",e => {
  save.sound = e.target.checked;
  persist();
});

document.getElementById("speechToggle").addEventListener("change",e => {
  save.speech = e.target.checked;
  persist();
});

function resetGame() {
  if (!confirm("¿Seguro que quieres borrar TODO tu progreso?")) {
    return;
  }

  save = defaultSave();
  persist();

  document.getElementById("soundToggle").checked = save.sound;
  document.getElementById("speechToggle").checked = save.speech;

  loadTheme();
  showScreen("home");

  alert("¡Tu aventura comienza de nuevo!");
}

// ==========================================
// ⌨️ CONTROLES DE PC
// ==========================================

document.addEventListener("keydown",event => {
  if (!document.getElementById("game").classList.contains("active")) {
    return;
  }

  if (answered) return;

  const number = Number(event.key);

  if (number >= 1 && number <= 4) {
    document.querySelectorAll(".answer-btn")[number - 1]?.click();
  }
});

// ==========================================
// 🚀 INICIALIZAR JUEGO
// ==========================================

function initializeGame() {
  document.getElementById("soundToggle").checked = save.sound;
  document.getElementById("speechToggle").checked = save.speech;

  updateRanking();
  loadTheme();
  updateStats();
  renderWorlds();

  document.getElementById("homeMessage").textContent =
    `¡Hola, ${save.name}! Luna está esperando jugar contigo. 🦄`;

  showScreen("home");
}

initializeGame();
