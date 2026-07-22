// 语言检测 — 统计 CJK 和拉丁字符比例，决定翻译方向
// 返回值: 'en' (翻译为英文) 或 'zh' (翻译为中文)
__TP.detectTargetLang = function(text) {
  var cjkCount = 0;
  var latinCount = 0;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (/[一-龥㐀-䶿豈-﫿]/.test(ch)) {
      cjkCount++;
    } else if (/[a-zA-Z]/.test(ch)) {
      latinCount++;
    }
  }
  // CJK 占比达到 25% 视为中文文本，翻译为英文
  var meaningfulTotal = cjkCount + latinCount;
  if (meaningfulTotal === 0) return 'zh';
  return cjkCount / meaningfulTotal >= 0.25 ? 'en' : 'zh';
};
