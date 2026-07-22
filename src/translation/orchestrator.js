// 翻译编排器 — 三级回退链 + 反向翻译
__TP.Translators = __TP.Translators || {};

// 回退链顺序：百度 → Google → LibreTranslate
var FALLBACK_CHAIN = [
  __TP.Translators.Baidu,
  __TP.Translators.Google,
  __TP.Translators.Libre
];

// 内部：遍历回退链，返回第一个成功的结果（含 engine 字段）
async function _tryChain(text, targetLang, label) {
  for (var i = 0; i < FALLBACK_CHAIN.length; i++) {
    var engine = FALLBACK_CHAIN[i];
    if (!engine) continue;
    try {
      var result = await engine.translate(text, targetLang);
      result.engine = engine.name;
      return result;
    } catch (e) {
      console.warn(engine.name + ' ' + label + ' failed, falling back:', e);
    }
  }
  throw new Error('All translation engines failed');
}

// 自动检测语言并按回退链翻译
__TP.Translators.detectAndTranslate = async function(text) {
  var targetLang = __TP.detectTargetLang(text);
  return _tryChain(text, targetLang, 'translate');
};

// 反向翻译（用于 ⇄ 切换按钮）
__TP.Translators.swapLanguage = async function(text, currentTargetLang) {
  var targetLang = currentTargetLang === 'zh' ? 'en' : 'zh';
  return _tryChain(text, targetLang, 'swap');
};
