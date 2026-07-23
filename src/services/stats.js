// 翻译统计服务 — 记录、读取、清除翻译次数，并通知 popup 刷新
// 使用写入队列序列化 read-modify-write 操作，防止并发写丢失计数
var _writeQueue = Promise.resolve();

__TP.Stats = {
  // 记录一次翻译（序列化写入以防止竞态）
  recordTranslation: function() {
    var result = _writeQueue.then(function() {
      return __TP.Storage.getLocal(['translationStats']).then(function(result) {
        var stats = result.translationStats || { today: 0, total: 0, lastDate: new Date().toDateString() };

        // 检查是否是新的一天
        var today = new Date().toDateString();
        if (stats.lastDate !== today) {
          stats.today = 0;
          stats.lastDate = today;
        }

        stats.today += 1;
        stats.total += 1;

        return __TP.Storage.setLocal({ translationStats: stats }).then(function() {
          // 通知弹出窗口更新统计
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ action: 'updateStats' }).catch(function() {});
          }
          return stats;
        });
      });
    }).catch(function(e) {
      console.warn('Failed to record translation stats:', e);
    });

    _writeQueue = result;
    return result;
  },

  // 获取当前统计数据（含跨天处理）
  getStats: function() {
    return __TP.Storage.getLocal(['translationStats']).then(function(result) {
      var stats = result.translationStats || { today: 0, total: 0, lastDate: new Date().toDateString() };
      var today = new Date().toDateString();
      if (stats.lastDate !== today) {
        stats.today = 0;
        stats.lastDate = today;
      }
      return stats;
    });
  },

  // 清除统计数据
  clearStats: function() {
    return __TP.Storage.setLocal({
      translationStats: { today: 0, total: 0, lastDate: new Date().toDateString() }
    });
  }
};
