import type { TranslationResult } from "../types";

/**
 * A pluggable translator adapter.
 * Each implementation wraps one translation API.
 */
export interface Translator {
  /** Human-readable name (e.g. "Baidu", "Google") */
  readonly name: string;

  /**
   * Attempt to translate. Throws on failure so the chain can fall back.
   * @param text — The text to translate
   * @param targetLang — Target language code ("zh" or "en")
   */
  translate(text: string, targetLang: string): Promise<TranslationResult>;
}
