// 百度翻译 API — 需要 appid 和 key 配置在 chrome.storage.sync 中
__TP.Translators = __TP.Translators || {};

__TP.Translators.Baidu = {
  name: 'Baidu',

  translate: async function(text, targetLang) {
    var config = await __TP.Storage.getSync(['baiduAppId', 'baiduAppKey']);
    var appid = config.baiduAppId;
    var key = config.baiduAppKey;
    if (!appid || !key) throw new Error('Baidu AppId/Key not set');

    var salt = Date.now().toString();
    var sign = __TP.md5(appid + text + salt + key);
    var to = targetLang === 'zh' ? 'zh' : targetLang; // 兼容 zh-CN -> zh
    var query = new URLSearchParams({
      q: text,
      from: 'auto',
      to: to,
      appid: appid,
      salt: salt,
      sign: sign
    }).toString();

    var url = 'https://api.fanyi.baidu.com/api/trans/vip/translate?' + query;
    var resp = await fetch(url);
    if (!resp.ok) throw new Error('Baidu HTTP ' + resp.status);
    var data = await resp.json();
    if (data.error_code) throw new Error('Baidu error ' + data.error_code + ': ' + data.error_msg);

    var translatedText = (data.trans_result || []).map(function(it) { return it.dst; }).join('');
    return {
      originalText: text,
      translatedText: translatedText,
      sourceLanguage: data.from || 'auto',
      targetLanguage: data.to || to
    };
  }
};
