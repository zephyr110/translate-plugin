import type { Translator } from "./types";
import type { TranslationResult } from "../types";
import { md5 } from "../utils/md5";

/**
 * Baidu Translate API adapter.
 * Requires baiduAppId and baiduAppKey in chrome.storage.sync.
 */
export const baiduTranslator: Translator = {
  name: "Baidu",

  async translate(text: string, targetLang: string): Promise<TranslationResult> {
    const { appid, key } = await getBaiduConfig();
    const salt = Date.now().toString();
    const sign = md5(appid + text + salt + key);
    // Normalize Chinese variant codes (zh-CN, zh-TW, etc.) to bare "zh" for Baidu
    const to = targetLang.startsWith("zh") ? "zh" : targetLang;

    const params = new URLSearchParams({
      q: text,
      from: "auto",
      to,
      appid,
      salt,
      sign,
    });

    const url = `https://api.fanyi.baidu.com/api/trans/vip/translate?${params}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Baidu HTTP ${resp.status}`);
    }

    const data = await resp.json();
    if (data.error_code) {
      throw new Error(`Baidu error ${data.error_code}: ${data.error_msg}`);
    }

    const translatedText = (data.trans_result || [])
      .map((it: { dst: string }) => it.dst)
      .join("");

    return {
      originalText: text,
      translatedText,
      sourceLanguage: data.from || "auto",
      targetLanguage: data.to || to,
    };
  },
};

/** Resolve Baidu credentials from sync storage; rejects if not configured. */
function getBaiduConfig(): Promise<{ appid: string; key: string }> {
  return new Promise((resolve, reject) => {
    if (!chrome?.storage?.sync) {
      return reject(new Error("Chrome storage.sync unavailable"));
    }
    chrome.storage.sync.get(["baiduAppId", "baiduAppKey"], (res) => {
      const appid = res.baiduAppId;
      const key = res.baiduAppKey;
      if (appid && key) {
        resolve({ appid, key });
      } else {
        reject(new Error("Baidu AppId/Key not set"));
      }
    });
  });
}
