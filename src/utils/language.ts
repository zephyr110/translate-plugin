import type { LanguageDirection } from "../types";

/**
 * Detect whether the text is primarily Chinese or English,
 * return the translation direction.
 *
 * Uses character-count ratio: if Chinese characters outnumber Latin letters,
 * translate zh→en; otherwise translate en→zh. Pure symbols/numbers default
 * to en→zh since the user's browser locale is likely Chinese.
 */
export function detectLanguageDirection(text: string): LanguageDirection {
  const chineseCount = text.split(/[㐀-䶿一-鿿]/).length - 1;
  const latinCount = text.split(/[a-zA-Z]/).length - 1;

  // If neither script is present (e.g. pure numbers/symbols), default en→zh
  if (chineseCount === 0 && latinCount === 0) return "en->zh";

  return chineseCount > latinCount ? "zh->en" : "en->zh";
}

/**
 * Get the target language code for a given direction.
 */
export function targetLangFor(direction: LanguageDirection): string {
  return direction === "zh->en" ? "en" : "zh";
}
