import { EMOTES_PATH } from "./consts/emotes";
import { SOUNDS_PATHS } from "./consts/sounds";

const emojiSpamState = {
  isActive: false,
  animationFrameId: 0,
  lastEmojiTime: 0,
  interval: 3000, // Intervalo para math challenge
  emojiInterval: 300, // Intervalo para emojis
  lastAudioTime: 0,
  audioInterval: 5000,
  useMathChallenge: true, // true = math challenge, false = emoji spam
  isPaused: false, // Para controlar a pausa de 1 minuto
  pauseUntil: 0, // Timestamp até quando pausar
  hasActiveModal: false, // Controlar se já existe um modal ativo
  correctAnswers: 0, // Acertos consecutivos para dificuldade
  difficultyLevel: 1, // Nível de dificuldade (1, 2, 3, 4+)
};

function generateMathProblem(): { question: string; answer: number } {
  const level = emojiSpamState.difficultyLevel;

  // Nível 1: Operações básicas (soma, subtração, multiplicação)
  if (level === 1) {
    const operations = ["+", "-", "*"];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1: number, num2: number, answer: number;

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        break;
      case "*":
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }

    return {
      question: `${num1} ${operation} ${num2} = ?`,
      answer: answer,
    };
  }

  // Nível 2: Inclui divisão
  else if (level === 2) {
    const operations = ["+", "-", "*", "/"];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1: number, num2: number, answer: number;

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 75) + 1;
        num2 = Math.floor(Math.random() * 75) + 1;
        answer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 75) + 50;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 - num2;
        break;
      case "*":
        num1 = Math.floor(Math.random() * 15) + 1;
        num2 = Math.floor(Math.random() * 15) + 1;
        answer = num1 * num2;
        break;
      case "/":
        // Garantir divisão exata
        answer = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 12) + 2;
        num1 = answer * num2;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }

    return {
      question: `${num1} ${operation} ${num2} = ?`,
      answer: answer,
    };
  }

  // Nível 3: Potências de 2 e raiz quadrada
  else if (level === 3) {
    const types = ["power2", "sqrt", "mixed"];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === "power2") {
      const base = Math.floor(Math.random() * 8) + 2; // 2 a 9
      const answer = Math.pow(base, 2);
      return {
        question: `${base}² = ?`,
        answer: answer,
      };
    } else if (type === "sqrt") {
      const answer = Math.floor(Math.random() * 12) + 3; // 3 a 14
      const num = answer * answer;
      return {
        question: `√${num} = ?`,
        answer: answer,
      };
    } else {
      // Operação mista: ex: 5 + 3²
      const num1 = Math.floor(Math.random() * 20) + 1;
      const base = Math.floor(Math.random() * 6) + 2;
      const operation = Math.random() > 0.5 ? "+" : "-";

      let answer: number;
      if (operation === "+") {
        answer = num1 + base * base;
        return {
          question: `${num1} + ${base}² = ?`,
          answer: answer,
        };
      } else {
        const powerValue = base * base;
        if (num1 < powerValue) {
          // Trocar ordem para evitar negativo
          answer = powerValue - num1;
          return {
            question: `${base}² - ${num1} = ?`,
            answer: answer,
          };
        } else {
          answer = num1 - powerValue;
          return {
            question: `${num1} - ${base}² = ?`,
            answer: answer,
          };
        }
      }
    }
  }

  // Nível 4+: Equações complexas
  else {
    const types = ["equation", "complex"];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === "equation") {
      // Tipo: 2x + 5 = 15, encontre x
      const x = Math.floor(Math.random() * 10) + 1;
      const coef = Math.floor(Math.random() * 5) + 2;
      const constant = Math.floor(Math.random() * 15) + 1;
      const result = coef * x + constant;

      return {
        question: `${coef}x + ${constant} = ${result}, x = ?`,
        answer: x,
      };
    } else {
      // Combinação complexa: √25 + 3² - 8
      const sqrt_num = Math.floor(Math.random() * 6) + 4; // 4 a 9
      const sqrt_value = sqrt_num * sqrt_num;
      const power_base = Math.floor(Math.random() * 4) + 2; // 2 a 5
      const subtract = Math.floor(Math.random() * 10) + 5;

      const answer = sqrt_num + power_base * power_base - subtract;

      return {
        question: `√${sqrt_value} + ${power_base}² - ${subtract} = ?`,
        answer: answer,
      };
    }
  }
}

function playRandomSound() {
  if (emojiSpamState.useMathChallenge) return;

  const soundFile =
    SOUNDS_PATHS[Math.floor(Math.random() * SOUNDS_PATHS.length)];
  const soundUrl = chrome.runtime.getURL(`public/audio/${soundFile}`);
  const audio = new Audio(soundUrl);
  audio.volume = 0.4;
  audio
    .play()
    .catch((error) => console.warn("Audio playback failed:", error.message));
}

function createEmoji() {
  const emoji = document.createElement("img");
  const randomEmote =
    EMOTES_PATH[Math.floor(Math.random() * EMOTES_PATH.length)];
  const emoteUrl = chrome.runtime.getURL(randomEmote);

  emoji.src = emoteUrl;
  emoji.style.position = "fixed";
  emoji.style.left = `${Math.random() * 90}vw`;
  emoji.style.top = `${Math.random() * 90}vh`;
  emoji.style.width = `${150 + Math.random() * 200}px`;
  emoji.style.opacity = "1";
  emoji.style.zIndex = "99999";
  emoji.style.pointerEvents = "none";
  emoji.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
  emoji.style.transform = "scale(0.5)";
  emoji.style.background = "none";
  emoji.style.border = "none";

  document.body.appendChild(emoji);

  setTimeout(() => {
    emoji.style.transform = "scale(1)";
  }, 50);

  setTimeout(() => {
    emoji.style.transform = "scale(0.5)";
    setTimeout(() => emoji.remove(), 500);
  }, 1500);
}

function createMathModal() {
  if (emojiSpamState.hasActiveModal) return;

  emojiSpamState.hasActiveModal = true;
  const mathProblem = generateMathProblem();
  let timeLeft = 30;

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.zIndex = "99999";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.fontFamily = "Arial, sans-serif";

  const modal = document.createElement("div");
  modal.style.backgroundColor = "#1e293b";
  modal.style.padding = "2rem";
  modal.style.borderRadius = "12px";
  modal.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.3)";
  modal.style.border = "2px solid #6366f1";
  modal.style.maxWidth = "400px";
  modal.style.width = "90%";
  modal.style.textAlign = "center";

  const title = document.createElement("h2");
  title.textContent = `🧠 Level ${emojiSpamState.difficultyLevel} - Solve to continue!`;
  title.style.color = "#f1f5f9";
  title.style.marginBottom = "0.5rem";
  title.style.fontSize = "1.5rem";
  title.style.fontWeight = "bold";

  // Progresso dos acertos
  const progress = document.createElement("div");
  progress.textContent = `Correct answers: ${emojiSpamState.correctAnswers}/3 (Next level at 3)`;
  progress.style.color = "#94a3b8";
  progress.style.fontSize = "0.9rem";
  progress.style.marginBottom = "1rem";

  const timer = document.createElement("div");
  timer.textContent = `⏰ Time: ${timeLeft}s`;
  timer.style.color = "#fbbf24";
  timer.style.fontSize = "1rem";
  timer.style.fontWeight = "bold";
  timer.style.marginBottom = "1.5rem";

  const question = document.createElement("div");
  question.textContent = mathProblem.question;
  question.style.color = "#e2e8f0";
  question.style.fontSize = "2rem";
  question.style.fontWeight = "bold";
  question.style.marginBottom = "1.5rem";
  question.style.fontFamily = "monospace";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Your answer...";
  input.style.width = "100%";
  input.style.padding = "12px";
  input.style.fontSize = "1.2rem";
  input.style.border = "2px solid #475569";
  input.style.borderRadius = "8px";
  input.style.backgroundColor = "#334155";
  input.style.color = "#f1f5f9";
  input.style.textAlign = "center";
  input.style.marginBottom = "1rem";
  input.style.outline = "none";
  input.style.webkitAppearance = "none";
  (
    input.style as CSSStyleDeclaration & { mozAppearance: string }
  ).mozAppearance = "textfield";

  const feedback = document.createElement("div");
  feedback.style.minHeight = "24px";
  feedback.style.marginBottom = "1rem";
  feedback.style.fontSize = "1rem";

  const checkButton = document.createElement("button");
  checkButton.textContent = "Check";
  checkButton.style.backgroundColor = "#6366f1";
  checkButton.style.color = "white";
  checkButton.style.border = "none";
  checkButton.style.padding = "12px 24px";
  checkButton.style.borderRadius = "8px";
  checkButton.style.fontSize = "1rem";
  checkButton.style.fontWeight = "bold";
  checkButton.style.cursor = "pointer";
  checkButton.style.marginRight = "10px";
  checkButton.style.transition = "all 0.3s ease";

  const timerInterval = setInterval(() => {
    timeLeft--;
    timer.textContent = `⏰ Time: ${timeLeft}s`;

    if (timeLeft <= 10) {
      timer.style.color = "#ef4444";
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      feedback.textContent = "⏰ Time's up! Restarting...";
      feedback.style.color = "#ef4444";
      setTimeout(() => {
        emojiSpamState.hasActiveModal = false;
        overlay.remove();
        setTimeout(() => createMathModal(), 100);
      }, 1500);
    }
  }, 1000);

  const checkAnswer = () => {
    const userAnswer = parseInt(input.value);
    if (userAnswer === mathProblem.answer) {
      clearInterval(timerInterval);
      emojiSpamState.correctAnswers++;

      if (emojiSpamState.correctAnswers >= 3) {
        emojiSpamState.difficultyLevel++;
        emojiSpamState.correctAnswers = 0; // Reset contador
        feedback.textContent = `🎉 Correct! Level up to ${emojiSpamState.difficultyLevel}! Pausing 1 min...`;
      } else {
        feedback.textContent = `🎉 Correct! ${
          3 - emojiSpamState.correctAnswers
        } more for next level. Pausing 1 min...`;
      }

      feedback.style.color = "#22c55e";

      // Configurar pausa de 1 minuto
      emojiSpamState.isPaused = true;
      emojiSpamState.pauseUntil = Date.now() + 60000;

      setTimeout(() => {
        emojiSpamState.hasActiveModal = false;
        overlay.remove();
      }, 1500);
    } else {
      // Resposta incorreta - NÃO para o timer, só dá feedback
      feedback.textContent = "❌ Incorrect. Keep trying!";
      feedback.style.color = "#ef4444";
      input.value = "";
      input.focus();

      // Timer continua rodando normalmente
    }
  };

  checkButton.addEventListener("click", checkAnswer);

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  });

  checkButton.addEventListener("mouseenter", () => {
    checkButton.style.backgroundColor = "#5b5bf6";
    checkButton.style.transform = "scale(1.05)";
  });

  checkButton.addEventListener("mouseleave", () => {
    checkButton.style.backgroundColor = "#6366f1";
    checkButton.style.transform = "scale(1)";
  });

  modal.appendChild(title);
  modal.appendChild(timer);
  modal.appendChild(question);
  modal.appendChild(input);
  modal.appendChild(feedback);
  modal.appendChild(checkButton);
  overlay.appendChild(modal);

  document.body.appendChild(overlay);

  setTimeout(() => input.focus(), 100);
}

function animationLoop(timestamp: number) {
  if (!emojiSpamState.isActive) return;

  if (emojiSpamState.isPaused) {
    if (Date.now() >= emojiSpamState.pauseUntil) {
      emojiSpamState.isPaused = false;
      console.log("1-minute pause finished. Reactivating...");
    } else {
      emojiSpamState.animationFrameId = requestAnimationFrame(animationLoop);
      return;
    }
  }

  const currentInterval = emojiSpamState.useMathChallenge
    ? emojiSpamState.interval
    : emojiSpamState.emojiInterval;

  if (timestamp - emojiSpamState.lastEmojiTime > currentInterval) {
    if (emojiSpamState.useMathChallenge) {
      createMathModal();
    } else {
      createEmoji();
    }
    emojiSpamState.lastEmojiTime = timestamp;
  }

  if (timestamp - emojiSpamState.lastAudioTime > emojiSpamState.audioInterval) {
    playRandomSound();
    emojiSpamState.lastAudioTime = timestamp;
  }

  emojiSpamState.animationFrameId = requestAnimationFrame(animationLoop);
}

function startEmojiSpam(settings?: { useMathChallenge?: boolean }) {
  if (emojiSpamState.isActive) return;

  if (settings) {
    emojiSpamState.useMathChallenge = settings.useMathChallenge !== false;
  }

  const modeText = emojiSpamState.useMathChallenge ? "math modals" : "emojis";
  console.log(
    `Received START_SPAM command. Activating ${modeText} with settings:`,
    {
      useMathChallenge: emojiSpamState.useMathChallenge,
    }
  );

  emojiSpamState.isActive = true;
  emojiSpamState.animationFrameId = requestAnimationFrame(animationLoop);
}

function stopEmojiSpam() {
  if (!emojiSpamState.isActive) return;

  console.log("Received STOP_SPAM command. Deactivating spam.");
  emojiSpamState.isActive = false;
  emojiSpamState.isPaused = false;
  emojiSpamState.hasActiveModal = false;
  emojiSpamState.correctAnswers = 0; // Reset acertos consecutivos
  emojiSpamState.difficultyLevel = 1; // Reset dificuldade
  cancelAnimationFrame(emojiSpamState.animationFrameId);

  document
    .querySelectorAll('div[style*="z-index: 99999"]')
    .forEach((el) => el.remove());

  document
    .querySelectorAll('img[style*="z-index: 99999"]')
    .forEach((el) => el.remove());
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.command) {
    case "START_SPAM":
      startEmojiSpam(message.settings);
      break;
    case "STOP_SPAM":
      stopEmojiSpam();
      break;
  }
  sendResponse({ status: "ok" });
  return true;
});

console.log("Content script loaded and listening for commands.");
