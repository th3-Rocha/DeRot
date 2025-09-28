import { SOUNDS_PATHS } from "./consts/sounds";

const emojiSpamState = {
  isActive: false,
  animationFrameId: 0,
  lastEmojiTime: 0,
  interval: 300,
  lastAudioTime: 0,
  audioInterval: 10000,
};

function playRandomSound() {
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
  const emoji = document.createElement("span");
  emoji.innerText = ["🧠🔥", "🚨", "🛑", "📉", "⏳"].at(
    Math.floor(Math.random() * 5)
  )!;
  emoji.style.position = "fixed";
  emoji.style.left = `${Math.random() * 90}vw`;
  emoji.style.top = `${Math.random() * 90}vh`;
  emoji.style.fontSize = `${20 + Math.random() * 30}px`;
  emoji.style.opacity = "0";
  emoji.style.zIndex = "99999";
  emoji.style.pointerEvents = "none";
  emoji.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
  emoji.style.transform = "scale(0.5)";

  document.body.appendChild(emoji);

  console.log("Emoji criado:", emoji.innerText);

  setTimeout(() => {
    emoji.style.opacity = "1";
    emoji.style.transform = "scale(1)";
  }, 50);

  setTimeout(() => {
    emoji.style.opacity = "0";
    emoji.style.transform = "scale(0.5)";
    setTimeout(() => emoji.remove(), 500);
  }, 1500);
}

function animationLoop(timestamp: number) {
  if (!emojiSpamState.isActive) return;

  if (timestamp - emojiSpamState.lastEmojiTime > emojiSpamState.interval) {
    createEmoji();
    emojiSpamState.lastEmojiTime = timestamp;
  }

  if (timestamp - emojiSpamState.lastAudioTime > emojiSpamState.audioInterval) {
    playRandomSound();
    emojiSpamState.lastAudioTime = timestamp;
  }

  emojiSpamState.animationFrameId = requestAnimationFrame(animationLoop);
}

function startEmojiSpam() {
  if (emojiSpamState.isActive) return;

  console.log("Recebido comando START_SPAM. Ativando emojis.");
  emojiSpamState.isActive = true;
  emojiSpamState.animationFrameId = requestAnimationFrame(animationLoop);
}

function stopEmojiSpam() {
  if (!emojiSpamState.isActive) return;

  console.log("Recebido comando STOP_SPAM. Desativando emojis.");
  emojiSpamState.isActive = false;
  cancelAnimationFrame(emojiSpamState.animationFrameId);

  document
    .querySelectorAll('span[style*="z-index: 99999"]')
    .forEach((el) => el.remove());
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.command) {
    case "START_SPAM":
      startEmojiSpam();
      break;
    case "STOP_SPAM":
      stopEmojiSpam();
      break;
  }
  sendResponse({ status: "ok" });
  return true;
});

console.log("Content script carregado e ouvindo por comandos.");
