// Popup 设置 — 自动翻译开关的加载与绑定
__TP.Popup = __TP.Popup || {};

__TP.Popup.loadSettings = function() {
  var autoTranslateSwitch = document.getElementById('autoTranslate');
  if (!autoTranslateSwitch) return;

  __TP.Storage.getSync(['autoTranslate']).then(function(result) {
    var enabled = result.autoTranslate !== false;
    autoTranslateSwitch.checked = enabled;
  });
};

__TP.Popup.bindAutoTranslateSwitch = function() {
  var autoTranslateSwitch = document.getElementById('autoTranslate');
  if (!autoTranslateSwitch) return;

  autoTranslateSwitch.addEventListener('change', function() {
    __TP.Storage.setSync({ autoTranslate: this.checked }).catch(function(e) {
      console.warn('Failed to save autoTranslate setting:', e);
    });
  });
};
