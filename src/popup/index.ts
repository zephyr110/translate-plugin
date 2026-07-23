import {
  getSettings,
  setAutoTranslate,
  getStats,
  resetStats,
} from "../utils/storage";
import { STATS_CLEARED, CONFIRM_CLEAR } from "../utils/strings";

// ── DOM references ──

const autoTranslateCheckbox = document.getElementById(
  "autoTranslate"
) as HTMLInputElement | null;
const todayCountEl = document.getElementById("todayCount");
const totalCountEl = document.getElementById("totalCount");
const clearStatsBtn = document.getElementById("clearStats");

// ── Init ──

document.addEventListener("DOMContentLoaded", () => {
  void initPopup();
});

async function initPopup(): Promise<void> {
  await loadSettings();
  await loadStats();
  bindEvents();
}

// ── Settings ──

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  if (autoTranslateCheckbox) {
    autoTranslateCheckbox.checked = settings.autoTranslate;
  }
}

// ── Stats ──

async function loadStats(): Promise<void> {
  const stats = await getStats();
  if (todayCountEl) todayCountEl.textContent = String(stats.today);
  if (totalCountEl) totalCountEl.textContent = String(stats.total);
}

// ── Events ──

function bindEvents(): void {
  // Auto-translate toggle — uses native checkbox change event
  if (autoTranslateCheckbox) {
    autoTranslateCheckbox.addEventListener("change", () => {
      void setAutoTranslate(autoTranslateCheckbox.checked);
    });
  }

  // Clear stats
  if (clearStatsBtn) {
    clearStatsBtn.addEventListener("click", () => {
      void handleClearStats();
    });
  }
}

async function handleClearStats(): Promise<void> {
  if (!confirm(CONFIRM_CLEAR)) return;

  await resetStats();

  if (todayCountEl) todayCountEl.textContent = "0";
  if (totalCountEl) totalCountEl.textContent = "0";

  showNotification(STATS_CLEARED);
}

// ── Notification (toast pattern) ──

const toastEl = document.getElementById("toast");
const toastMessageEl = document.getElementById("toastMessage");
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showNotification(message: string): void {
  if (!toastEl || !toastMessageEl) return;

  // Clear any existing timer
  if (toastTimer) clearTimeout(toastTimer);

  toastMessageEl.textContent = message;
  toastEl.classList.add("show");

  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
    toastTimer = null;
  }, 3000);
}

// ── Listen for stats updates from content script ──

if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "updateStats") {
      void loadStats();
      sendResponse({ success: true });
    }
  });
}
