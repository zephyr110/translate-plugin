// LibreTranslate API — 开源翻译服务，作为最终兜底方案
__TP.Translators = __TP.Translators || {};

__TP.Translators.Libre = {
  name: 'LibreTranslate',

  translate: async function(text, targetLang) {
    var response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) throw new Error('LibreTranslate HTTP ' + response.status);

    var data = await response.json();

    if (data && data.translatedText) {
      return {
        originalText: text,
        translatedText: data.translatedText,
        sourceLanguage: 'auto',
        targetLanguage: targetLang
      };
    }
    throw new Error('LibreTranslate returned empty result');
  }
};
