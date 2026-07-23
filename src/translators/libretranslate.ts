import type { Translator } from "./types";
import type { TranslationResult } from "../types";
import { detectLanguageDirection } from "../utils/language";

/**
 * LibreTranslate API adapter (free, open-source).
 * Used as the final fallback.
 */
export const libreTranslateTranslator: Translator = {
  name: "LibreTranslate",

  async translate(text: string, targetLang: string): Promise<TranslationResult> {
    const direction = detectLanguageDirection(text);
    const tl = targetLang || (direction === "zh->en" ? "en" : "zh");

    const response = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: tl,
        format: "text",
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.translatedText) {
      return {
        originalText: text,
        translatedText: data.translatedText,
        sourceLanguage: direction === "zh->en" ? "zh" : "en",
        targetLanguage: tl,
      };
    }

    throw new Error("LibreTranslate returned empty result");
  },
};
