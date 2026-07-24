import { detectLanguageDirection, targetLangFor } from "../utils/language";
import { getSettings, onSettingsChanged, incrementStats } from "../utils/storage";
import { baiduTranslator } from "../translators/baidu";
import { googleTranslator } from "../translators/google";
import { libreTranslateTranslator } from "../translators/libretranslate";
import { createTranslationChain } from "../translators/chain";
import {
  showPopup,
  updatePopupResult,
  updatePopupError,
  removePopup,
  isInsidePopup,
  hasPopup,
} from "./popup-ui";
import { TRANSLATE_FAILED } from "../utils/strings";

// ── Translator chain (Baidu → Google → LibreTranslate) ──

const translator = createTranslationChain([
  baiduTranslator,
  googleTranslator,
  libreTranslateTranslator,
]);

// ── State ──

let autoTranslateEnabled = true; // default; synced from storage

// ── Init ──

/** Load settings and listen for changes. */
async function init(): Promise<void> {
  const settings = await getSettings();
  autoTranslateEnabled = settings.autoTranslate;

  onSettingsChanged((changes) => {
    if ("autoTranslate" in changes) {
      autoTranslateEnabled = changes.autoTranslate.newValue !== false;
    }
  });
}

// ── Debounced text selection handler ──

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounce delay in ms before showing the translation popup.
 * Prevents popups from flashing on every rapid selection.
 */
const DEBOUNCE_MS = 300;

function handleMouseUp(event: MouseEvent): void {
  console.log("[translate] handleMouseUp fired, autoTranslateEnabled =", autoTranslateEnabled);

  if (!autoTranslateEnabled) {
    console.log("[translate] autoTranslate disabled, returning");
    return;
  }

  const selectedText = window.getSelection()?.toString().trim() ?? "";
  // Capture only the coordinates needed — avoids retaining the full MouseEvent
  const { pageX, pageY } = event;

  console.log("[translate] selectedText =", JSON.stringify(selectedText.slice(0, 50)));

  if (selectedText.length > 0) {
    // Debounce: reset timer on each selection (true debounce, not just delay)
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      // Re-check the flag — user may have disabled auto-translate during the debounce
      if (!autoTranslateEnabled) return;
      console.log("[translate] debounce fired, calling doTranslate");
      doTranslate(pageX, pageY, selectedText);
    }, DEBOUNCE_MS);
  } else if (!hasPopup()) {
    // Only clean up timer if no popup is showing; don't dismiss existing popup
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  }
}

// ── Click-outside handler ──

function handleClick(event: MouseEvent): void {
  if (!hasPopup()) return;
  const target = event.target as Node | null;
  if (target && !isInsidePopup(target)) {
    removePopup();
  }
}

// ── Core translation flow ──

async function doTranslate(
  x: number,
  y: number,
  text: string
): Promise<void> {
  console.log("[translate] doTranslate called, text =", JSON.stringify(text.slice(0, 50)));
  const popupEl = showPopup(x, y);
  console.log("[translate] showPopup returned, popupEl =", popupEl);

  try {
    const direction = detectLanguageDirection(text);
    const targetLang = targetLangFor(direction);
    console.log("[translate] translating, direction =", direction, "targetLang =", targetLang);
    const result = await translator.translate(text, targetLang);

    console.log("[translate] translation result:", result);
    updatePopupResult(popupEl, result);

    // Increment stats after successful UI update (fire-and-forget)
    incrementStats();
  } catch (error) {
    console.error("Translation error:", error);
    updatePopupError(popupEl, TRANSLATE_FAILED);
  }
}

// ── Bootstrap ──

void init().then(() => {
  console.log("[translate] init complete, autoTranslateEnabled =", autoTranslateEnabled);
});
document.addEventListener("mouseup", handleMouseUp);
document.addEventListener("click", handleClick);
console.log("[translate] content script loaded, listeners registered");
