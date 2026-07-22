// Popup 入口 — DOMContentLoaded 初始化 + 跨脚本消息监听
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // 加载设置
    __TP.Popup.loadSettings();
    __TP.Popup.bindAutoTranslateSwitch();

    // 加载统计
    __TP.Popup.loadStats();
    __TP.Popup.bindClearButton();
  });

  // 监听来自 content script 的统计更新消息
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.action === 'updateStats') {
        __TP.Popup.updateStatsDisplay();
        sendResponse({ success: true });
      }
    });
  }
})();
