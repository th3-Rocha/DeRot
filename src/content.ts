import { EMOTES_PATH } from "./consts/emotes";
import { SOUNDS_PATHS } from "./consts/sounds";

const emojiSpamState = {
  isActive: false,
  animationFrameId: 0,
  lastEmojiTime: 0,
  interval: 300,
  lastAudioTime: 0,
  audioInterval: 5000,
  showEmojis: true,
  playAudio: true,
};

function playRandomSound() {
  if (!emojiSpamState.playAudio) return;

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
  if (!emojiSpamState.showEmojis) return;

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

function startEmojiSpam(settings?: {
  showEmojis?: boolean;
  playAudio?: boolean;
}) {
  if (emojiSpamState.isActive) return;

  if (settings) {
    emojiSpamState.showEmojis = settings.showEmojis !== false;
    emojiSpamState.playAudio = settings.playAudio !== false;
  }

  console.log(
    "Recebido comando START_SPAM. Ativando emojis com configurações:",
    {
      showEmojis: emojiSpamState.showEmojis,
      playAudio: emojiSpamState.playAudio,
    }
  );

  emojiSpamState.isActive = true;
  emojiSpamState.animationFrameId = requestAnimationFrame(animationLoop);
}

function stopEmojiSpam() {
  if (!emojiSpamState.isActive) return;

  console.log("Recebido comando STOP_SPAM. Desativando emojis.");
  emojiSpamState.isActive = false;
  cancelAnimationFrame(emojiSpamState.animationFrameId);

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

console.log("Content script carregado e ouvindo por comandos.");
