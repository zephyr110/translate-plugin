// Google 翻译 API — 免费、无需密钥，作为百度翻译的回退方案
__TP.Translators = __TP.Translators || {};

__TP.Translators.Google = {
  name: 'Google',

  translate: async function(text, targetLang) {
    var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl='
      + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
    var resp = await fetch(url);
    if (!resp.ok) throw new Error('Google HTTP ' + resp.status);
    var data = await resp.json();
    if (!(data && data[0])) throw new Error('Google format error');
    var translatedText = data[0].map(function(item) { return item[0]; }).join('');
    var detectedLang = data[2] || 'auto';
    return {
      originalText: text,
      translatedText: translatedText,
      sourceLanguage: detectedLang,
      targetLanguage: targetLang
    };
  }
};
