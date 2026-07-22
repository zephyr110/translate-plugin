// Content Script 入口 — 事件监听 + 翻译流程编排
(function() {
  var selectedText = '';

  // 检查自动翻译是否启用
  function isAutoTranslateEnabled() {
    return __TP.Storage.getSync(['autoTranslate']).then(function(result) {
      return result.autoTranslate !== false; // 默认开启
    });
  }

  // 执行翻译流程
  async function translateText(text) {
    try {
      var result = await __TP.Translators.detectAndTranslate(text);
      await __TP.Stats.recordTranslation();
      __TP.PopupUI.showResult(result);
    } catch (error) {
      __TP.PopupUI.showError('翻译失败，请稍后重试');
      console.error('Translation error:', error);
    }
  }

  // 切换语言回调
  async function handleSwap(text, currentTargetLang) {
    try {
      var result = await __TP.Translators.swapLanguage(text, currentTargetLang);
      await __TP.Stats.recordTranslation();
      __TP.PopupUI.showResult(result);
    } catch (error) {
      __TP.PopupUI.showError('语言切换失败');
      console.error('Swap error:', error);
    }
  }

  // 注册切换回调
  __TP.PopupUI.onSwap(handleSwap);

  // 监听鼠标释放事件（选中文本后）
  document.addEventListener('mouseup', async function(event) {
    var text = window.getSelection().toString().trim();

    if (text.length > 0) {
      var x = event.pageX;
      var y = event.pageY;

      // 检查自动翻译开关
      try {
        var enabled = await isAutoTranslateEnabled();
        if (!enabled) {
          __TP.PopupUI.hide();
          return;
        }
      } catch (e) {
        // 存储读取失败时默认开启翻译
        console.warn('Failed to read autoTranslate setting:', e);
      }

      // 延迟显示翻译弹窗，避免干扰正常选择操作
      setTimeout(function() {
        __TP.PopupUI.show(x, y, text);
        translateText(text);
      }, 300);
    } else {
      __TP.PopupUI.hide();
    }
  });

  // 监听点击事件，点击弹窗外部时隐藏
  document.addEventListener('click', function(event) {
    var popupEl = __TP.PopupUI.getElement();
    if (popupEl && !popupEl.contains(event.target)) {
      __TP.PopupUI.hide();
    }
  });
})();
