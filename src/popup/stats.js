// Popup 统计显示 — 加载、刷新和清除翻译统计数据
__TP.Popup = __TP.Popup || {};

__TP.Popup.loadStats = function() {
  __TP.Stats.getStats().then(function(stats) {
    var todayEl = document.getElementById('todayCount');
    var totalEl = document.getElementById('totalCount');
    if (todayEl) todayEl.textContent = stats.today;
    if (totalEl) totalEl.textContent = stats.total;
  });
};

__TP.Popup.updateStatsDisplay = function() {
  __TP.Popup.loadStats();
};

__TP.Popup.clearStats = function() {
  if (!confirm('确定要清除所有统计信息吗？')) return;

  __TP.Stats.clearStats().then(function() {
    var todayEl = document.getElementById('todayCount');
    var totalEl = document.getElementById('totalCount');
    if (todayEl) todayEl.textContent = '0';
    if (totalEl) totalEl.textContent = '0';
    __TP.Popup.showNotification('统计信息已清除');
  });
};

__TP.Popup.bindClearButton = function() {
  var clearBtn = document.getElementById('clearStats');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      __TP.Popup.clearStats();
    });
  }
};
