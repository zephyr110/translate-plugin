import type { TranslationStats } from "../types";

/** Check if chrome.storage APIs are available */
function hasChromeStorage(): boolean {
  return !!(typeof chrome !== "undefined" && chrome.storage);
}

// ── Sync storage (persisted across devices) ──

/**
 * Get all settings from sync storage.
 * In non-extension environments, returns defaults.
 */
export function getSettings(): Promise<{
  autoTranslate: boolean;
  baiduAppId?: string;
  baiduAppKey?: string;
}> {
  if (!hasChromeStorage()) {
    return Promise.resolve({ autoTranslate: true });
  }
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ["autoTranslate", "baiduAppId", "baiduAppKey"],
      (result) => {
        resolve({
          autoTranslate: result.autoTranslate !== false,
          baiduAppId: result.baiduAppId,
          baiduAppKey: result.baiduAppKey,
        });
      }
    );
  });
}

/**
 * Set the autoTranslate flag.
 */
export function setAutoTranslate(enabled: boolean): Promise<void> {
  if (!hasChromeStorage()) return Promise.resolve();
  return new Promise((resolve) => {
    chrome.storage.sync.set({ autoTranslate: enabled }, resolve);
  });
}

/**
 * Listen for changes to sync storage settings.
 * Returns a cleanup function to remove the listener.
 */
export function onSettingsChanged(
  callback: (changes: Record<string, chrome.storage.StorageChange>) => void
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    namespace: string
  ) => {
    if (namespace === "sync") callback(changes);
  };
  if (hasChromeStorage()) {
    chrome.storage.onChanged.addListener(listener);
  }
  return () => {
    if (hasChromeStorage()) {
      chrome.storage.onChanged.removeListener(listener);
    }
  };
}

// ── Local storage (stats, per-device) ──

/**
 * Get translation statistics.
 */
export function getStats(): Promise<TranslationStats> {
  const todayDefault = { today: 0, total: 0, lastDate: new Date().toDateString() };
  if (!hasChromeStorage()) {
    return Promise.resolve(todayDefault);
  }
  const todayStr = new Date().toDateString();
  return new Promise((resolve) => {
    chrome.storage.local.get(["translationStats"], (result) => {
      const stats: TranslationStats = result.translationStats || todayDefault;

      // Reset today counter if it's a new day
      if (stats.lastDate !== todayStr) {
        stats.today = 0;
        stats.lastDate = todayStr;
        // Persist the date reset immediately so the popup sees the correct value
        chrome.storage.local.set({ translationStats: stats });
      }

      resolve(stats);
    });
  });
}

/**
 * Increment the translation counter.
 * Sends a message to the popup if it's open (error is silently ignored).
 */
export function incrementStats(): Promise<void> {
  if (!hasChromeStorage()) return Promise.resolve();

  return new Promise((resolve) => {
    getStats().then((stats) => {
      stats.today += 1;
      stats.total += 1;
      chrome.storage.local.set({ translationStats: stats }, () => {
        // Notify popup if open — .catch() handles the async Promise rejection
        chrome.runtime.sendMessage({ action: "updateStats" }).catch(() => {
          // Popup not open; ignore
        });
        resolve();
      });
    });
  });
}

/**
 * Reset all statistics.
 */
export function resetStats(): Promise<void> {
  const empty: TranslationStats = {
    today: 0,
    total: 0,
    lastDate: new Date().toDateString(),
  };
  if (!hasChromeStorage()) return Promise.resolve();
  return new Promise((resolve) => {
    chrome.storage.local.set({ translationStats: empty }, resolve);
  });
}
