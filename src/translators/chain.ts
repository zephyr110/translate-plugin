import type { Translator } from "./types";
import type { TranslationResult } from "../types";

/**
 * Try each translator in order until one succeeds.
 * If all fail, throws the last error encountered.
 *
 * @example
 * const chain = createTranslationChain([baiduTranslator, googleTranslator, libreTranslateTranslator]);
 * const result = await chain.translate("hello", "zh");
 */
export function createTranslationChain(translators: Translator[]): Translator {
  return {
    name: "Chain",
    async translate(text: string, targetLang: string): Promise<TranslationResult> {
      let lastError: Error | undefined;

      for (const translator of translators) {
        try {
          return await translator.translate(text, targetLang);
        } catch (e) {
          console.warn(
            `${translator.name} translate failed, falling back:`,
            e
          );
          lastError = e instanceof Error ? e : new Error(String(e));
        }
      }

      throw lastError || new Error("All translators failed");
    },
  };
}
