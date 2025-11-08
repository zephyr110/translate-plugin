// 弹出窗口脚本
document.addEventListener('DOMContentLoaded', function() {
  // 加载设置
  loadSettings();
  
  // 加载统计信息
  loadStats();
  
  // 绑定事件监听器
  bindEventListeners();
});

// 加载设置
function loadSettings() {
  const autoTranslateSwitch = document.getElementById('autoTranslate');
  if (!autoTranslateSwitch) return;

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['autoTranslate'], function(result) {
      const enabled = result.autoTranslate !== false;
      autoTranslateSwitch.classList.toggle('ant-switch-checked', enabled);
    });
  } else {
    // 非扩展环境默认开启以便预览
    autoTranslateSwitch.classList.add('ant-switch-checked');
  }
}

// 加载统计信息
function loadStats() {
  const updateUI = (s) => {
    document.getElementById('todayCount').textContent = s.today;
    document.getElementById('totalCount').textContent = s.total;
  };

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['translationStats'], function(result) {
      const stats = result.translationStats || { today: 0, total: 0, lastDate: new Date().toDateString() };
      const today = new Date().toDateString();
      if (stats.lastDate !== today) {
        stats.today = 0;
        stats.lastDate = today;
      }
      updateUI(stats);
    });
  } else {
    updateUI({ today: 0, total: 0 });
  }
}

// 绑定事件监听器
function bindEventListeners() {
  // 自动翻译设置
  const autoTranslateSwitch = document.getElementById('autoTranslate');
  if (autoTranslateSwitch) {
    autoTranslateSwitch.addEventListener('click', function() {
      const isChecked = this.classList.contains('ant-switch-checked');
      this.classList.toggle('ant-switch-checked', !isChecked);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ autoTranslate: !isChecked });
      }
    });
  }
  
  // 清除统计按钮
  document.getElementById('clearStats').addEventListener('click', function() {
    clearStats();
  });
}

// 清除统计信息
function clearStats() {
  if (!confirm('确定要清除所有统计信息吗？')) return;
  const done = () => {
    document.getElementById('todayCount').textContent = '0';
    document.getElementById('totalCount').textContent = '0';
    showNotification('统计信息已清除');
  };
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ translationStats: { today: 0, total: 0, lastDate: new Date().toDateString() } }, done);
  } else {
    done();
  }
}

// 显示通知
function showNotification(message) {
  // 创建临时通知元素
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #4CAF50;
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 1000;
    font-size: 13px;
    max-width: 250px;
    word-wrap: break-word;
  `;
  
  document.body.appendChild(notification);
  
  // 3秒后自动移除
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// 监听来自内容脚本的消息
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateStats') {
      updateStatsDisplay();
      sendResponse({ success: true });
    }
  });
}

// 更新统计显示
function updateStatsDisplay() {
  loadStats();
}