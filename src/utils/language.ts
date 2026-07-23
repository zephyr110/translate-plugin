import type { LanguageDirection } from "../types";

// Covers CJK Unified Ideographs (U+4E00-U+9FFF) and CJK Extension A (U+3400-U+4DBF)
const CHINESE_CHAR_RE = /[㐀-䶿一-鿿]/;

/**
 * Detect whether the text is primarily Chinese or English,
 * return the translation direction.
 */
export function detectLanguageDirection(text: string): LanguageDirection {
  return CHINESE_CHAR_RE.test(text) ? "zh->en" : "en->zh";
}

/**
 * Get the target language code for a given direction.
 */
export function targetLangFor(direction: LanguageDirection): string {
  return direction === "zh->en" ? "en" : "zh";
}
