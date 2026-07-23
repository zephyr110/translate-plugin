/** Result of a translation operation */
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/** Language direction for translation */
export type LanguageDirection = "zh->en" | "en->zh";

/** Translator settings stored in chrome.storage.sync */
export interface TranslatorSettings {
  autoTranslate: boolean;
  baiduAppId?: string;
  baiduAppKey?: string;
}

/** Translation statistics stored in chrome.storage.local */
export interface TranslationStats {
  today: number;
  total: number;
  lastDate: string;
}
