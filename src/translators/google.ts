import type { Translator } from "./types";
import type { TranslationResult } from "../types";

/**
 * Google Translate API adapter (free endpoint).
 * Used as the first fallback after Baidu.
 */
export const googleTranslator: Translator = {
  name: "Google",

  async translate(text: string, targetLang: string): Promise<TranslationResult> {
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}` +
      `&dt=t&q=${encodeURIComponent(text)}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Google HTTP ${resp.status}`);
    }

    const data = await resp.json();
    if (!(data && data[0])) {
      throw new Error("Google format error");
    }

    const translatedText = data[0]
      .map((item: string[]) => item[0])
      .join("");
    const detectedLang = data[2] || "auto";

    return {
      originalText: text,
      translatedText,
      sourceLanguage: detectedLang,
      targetLanguage: targetLang,
    };
  },
};
