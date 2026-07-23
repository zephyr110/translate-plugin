import type { TranslationResult } from "../types";
import { TRANSLATING } from "../utils/strings";

/** The active popup element, if any */
let popup: HTMLElement | null = null;

/**
 * Create and show the translation popup at a given position.
 * Returns the popup element for later updates.
 */
export function showPopup(x: number, y: number): HTMLElement {
  removePopup();

  const el = document.createElement("div");
  el.className = "translation-popup";
  el.style.left = `${x}px`;
  el.style.top = `${y + 20}px`;

  // Loading state
  const content = document.createElement("div");
  content.className = "translation-content";

  const loading = document.createElement("div");
  loading.className = "translation-loading";
  loading.textContent = TRANSLATING;
  content.appendChild(loading);
  el.appendChild(content);

  document.body.appendChild(el);
  popup = el;
  return el;
}

/**
 * Update the popup with a successful translation result.
 * Uses textContent (not innerHTML) to prevent XSS.
 */
export function updatePopupResult(
  popupEl: HTMLElement,
  result: TranslationResult
): void {
  const content = popupEl.querySelector(".translation-content");
  if (!content) return;

  content.textContent = ""; // clear

  // Original text section
  const originalDiv = document.createElement("div");
  originalDiv.className = "translation-original";

  const originalText = document.createElement("div");
  originalText.className = "translation-text";
  originalText.textContent = result.originalText;
  originalDiv.appendChild(originalText);

  // Result section
  const resultDiv = document.createElement("div");
  resultDiv.className = "translation-result";

  const translatedText = document.createElement("div");
  translatedText.className = "translation-text";
  translatedText.textContent = result.translatedText;
  resultDiv.appendChild(translatedText);

  content.appendChild(originalDiv);
  content.appendChild(resultDiv);
}

/**
 * Update the popup with an error message.
 * Uses textContent (not innerHTML) to prevent XSS.
 */
export function updatePopupError(
  popupEl: HTMLElement,
  message: string
): void {
  const content = popupEl.querySelector(".translation-content");
  if (!content) return;

  content.textContent = ""; // clear

  const errorDiv = document.createElement("div");
  errorDiv.className = "translation-error";

  const strong = document.createElement("strong");
  strong.textContent = "翻译失败：";
  errorDiv.appendChild(strong);
  errorDiv.appendChild(document.createTextNode(message));

  content.appendChild(errorDiv);
}

/**
 * Remove the popup from the DOM if it exists.
 */
export function removePopup(): void {
  if (popup) {
    popup.remove();
    popup = null;
  }
}

/**
 * Check if the given node is inside the translation popup.
 */
export function isInsidePopup(node: Node): boolean {
  return !!(popup && popup.contains(node));
}

/**
 * Check if a popup is currently active.
 */
export function hasPopup(): boolean {
  return popup !== null;
}
