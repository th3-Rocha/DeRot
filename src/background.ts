import { isUrlRotPage } from "./lib/is-url-rot-page";

let activeTabId: number | undefined;
let sessionStartTime: number | undefined;
let activeSessionHost: string | undefined;

interface SessionData {
  site: string;
  entryTime: string;
  exitTime: string;
  timeSpent: number;
}

async function endAndSaveCurrentSession() {
  if (!sessionStartTime || !activeSessionHost) return;

  const sessionEndTime = Date.now();
  const sessionDuration = Math.round(
    (sessionEndTime - sessionStartTime) / 1000
  );

  if (sessionDuration <= 0) {
    sessionStartTime = undefined;
    activeSessionHost = undefined;
    return;
  }

  const newSession: SessionData = {
    site: activeSessionHost,
    entryTime: new Date(sessionStartTime).toISOString(),
    exitTime: new Date(sessionEndTime).toISOString(),
    timeSpent: sessionDuration,
  };

  const totalData = await chrome.storage.local.get("timeSpent");
  const totalTime = totalData.timeSpent || {};
  totalTime[activeSessionHost] =
    (totalTime[activeSessionHost] || 0) + sessionDuration;
  await chrome.storage.local.set({ timeSpent: totalTime });

  const historyData = await chrome.storage.local.get("rotHistory");
  const history = historyData.rotHistory || [];
  history.push(newSession);
  await chrome.storage.local.set({ rotHistory: history });

  console.log(
    `Session ended for ${activeSessionHost}: ${sessionDuration}s. Total:`,
    totalTime
  );

  sessionStartTime = undefined;
  activeSessionHost = undefined;
}

async function startNewSession(tabId: number, url: string) {
  await endAndSaveCurrentSession();
  activeTabId = tabId;

  if (isUrlRotPage(url)) {
    chrome.tabs.sendMessage(tabId, { command: "START_SPAM" }).catch(() => {});
    console.log(`START_SPAM command sent to tab ${tabId}`);

    const urlObj = new URL(url);
    activeSessionHost = urlObj.hostname.replace("www.", "");
    sessionStartTime = Date.now();
    console.log(`Starting new session on ${activeSessionHost}`);
  } else {
    chrome.tabs.sendMessage(tabId, { command: "STOP_SPAM" }).catch(() => {});
    console.log(`STOP_SPAM command sent to tab ${tabId}`);
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    await startNewSession(activeInfo.tabId, tab.url);
  } else {
    await endAndSaveCurrentSession();
    activeTabId = activeInfo.tabId;
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url && tab.url) {
    await startNewSession(tabId, tab.url);
  }
});

chrome.tabs.onReplaced.addListener(async (addedTabId, removedTabId) => {
  if (removedTabId === activeTabId) {
    const tab = await chrome.tabs.get(addedTabId);
    if (tab.url) {
      await startNewSession(addedTabId, tab.url);
    } else {
      await endAndSaveCurrentSession();
      activeTabId = addedTabId;
    }
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === activeTabId) {
    await endAndSaveCurrentSession();
    activeTabId = undefined;
  }
});

chrome.runtime.onSuspend.addListener(() => endAndSaveCurrentSession());
chrome.runtime.onInstalled.addListener(() =>
  console.log("DeRot Extension installed/updated.")
);

console.log("Background script started.");
