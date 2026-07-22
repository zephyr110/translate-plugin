// Chrome Storage Promise 封装 — 统一处理回调式 API 和缺少 chrome 的环境
__TP.Storage = {
  // chrome.storage.sync — 用于设置项（autoTranslate、baiduAppId 等）
  getSync: function(keys) {
    return new Promise(function(resolve, reject) {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        return resolve({});  // 非扩展环境返回空对象
      }
      chrome.storage.sync.get(keys, function(result) {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(result);
      });
    });
  },

  setSync: function(obj) {
    return new Promise(function(resolve, reject) {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        return resolve();  // 非扩展环境静默成功
      }
      chrome.storage.sync.set(obj, function() {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  },

  // chrome.storage.local — 用于翻译统计数据
  getLocal: function(keys) {
    return new Promise(function(resolve, reject) {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        return resolve({});
      }
      chrome.storage.local.get(keys, function(result) {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(result);
      });
    });
  },

  setLocal: function(obj) {
    return new Promise(function(resolve, reject) {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        return resolve();
      }
      chrome.storage.local.set(obj, function() {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  }
};
