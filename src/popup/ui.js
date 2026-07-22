// Popup 通知组件 — 临时 toast 提示
__TP.Popup = __TP.Popup || {};

__TP.Popup.showNotification = function(message) {
  var notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  // Styles are defined in popup.css .notification class

  document.body.appendChild(notification);

  // 3 秒后自动移除
  setTimeout(function() {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
};
