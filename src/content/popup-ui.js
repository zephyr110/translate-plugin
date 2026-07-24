// 翻译弹窗 UI — 所有 DOM 操作集中管理，弹窗元素引用为模块私有状态

var _popup = null;
var _generation = 0;  // 代际计数器：每次 show() 递增，防止异步结果写入旧弹窗

// HTML 转义
function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// 获取语言名称
function getLanguageName(langCode) {
  var names = {
    'zh': '中文',
    'zh-CN': '简体中文',
    'zh-TW': '繁体中文',
    'en': '英语',
    'ja': '日语',
    'ko': '韩语',
    'fr': '法语',
    'de': '德语',
    'es': '西班牙语',
    'ru': '俄语',
    'auto': '自动检测'
  };
  return names[langCode] || langCode;
}

// 验证当前弹窗是否属于指定代际
function _isCurrentGen(gen) {
  return _popup && _popup._gen === gen;
}

// 显示弹窗（含边界检测定位）
export function show(x, y) {
  console.log("[translate] show() called with x=", x, "y=", y, "body=", !!document.body);
  hide();
  _generation++;

  _popup = document.createElement('div');
  _popup._gen = _generation;
  _popup.className = 'translation-popup';
  _popup.innerHTML = '<div class="translation-content"><div class="translation-loading">正在翻译...</div></div>';

  // 先隐藏添加到 DOM 以测量尺寸
  _popup.style.visibility = 'hidden';
  _popup.style.left = '0px';
  _popup.style.top = '0px';
  document.body.appendChild(_popup);

  // 边界检测
  var pw = _popup.offsetWidth;
  var ph = _popup.offsetHeight;
  var vw = window.innerWidth;
  var vh = window.innerHeight;
  var sx = window.scrollX;
  var sy = window.scrollY;

  var left = x;
  var top = y + 20;

  if (left + pw > sx + vw - 10) left = sx + vw - pw - 10;
  if (left < sx + 10) left = sx + 10;
  if (top + ph > sy + vh - 10) top = y - ph - 10;
  if (top < sy + 10) top = sy + 10;

  _popup.style.visibility = 'visible';
  _popup.style.left = left + 'px';
  _popup.style.top = top + 'px';
}

// 显示弹窗（public API — alias to show）
export function showPopup(x, y) {
  show(x, y);
}

// 隐藏弹窗
export function hide() {
  if (_popup) {
    _popup.remove();
    _popup = null;
  }
}

// 判断弹窗是否可见
export function isVisible() {
  return _popup !== null;
}

// 获取弹窗 DOM（用于 contains 检查）
export function getElement() {
  return _popup;
}

// 显示翻译结果（仅当弹窗未被替换时生效）
export function showResult(result) {
  if (!_isCurrentGen(_generation)) return;

  var contentDiv = _popup.querySelector('.translation-content');
  var langLabel = escapeHtml(getLanguageName(result.targetLanguage));
  contentDiv.innerHTML =
    '<div class="translation-original">' +
      '<div class="translation-text">' + escapeHtml(result.originalText) + '</div>' +
    '</div>' +
    '<div class="translation-result">' +
      '<div class="translation-result-header">' +
        '<span class="translation-lang-label">' + langLabel + '</span>' +
        '<button class="translation-swap-btn" title="切换翻译方向">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M8 3 4 7l4 4"/>' +
            '<path d="M4 7h16"/>' +
            '<path d="m16 21 4-4-4-4"/>' +
            '<path d="M20 17H4"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="translation-text">' + escapeHtml(result.translatedText) + '</div>' +
    '</div>';

  // 绑定切换按钮
  var swapBtn = contentDiv.querySelector('.translation-swap-btn');
  if (swapBtn) {
    swapBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      handleSwap(result.originalText, result.targetLanguage);
    });
  }
}

// 显示翻译错误（仅当弹窗未被替换时生效）
export function showError(message) {
  if (!_isCurrentGen(_generation)) return;
  var contentDiv = _popup.querySelector('.translation-content');
  contentDiv.innerHTML =
    '<div class="translation-error">' + escapeHtml(message) + '</div>';
}

// 切换语言回调：由 main.js 注入
var _onSwap = null;
export function onSwap(callback) {
  _onSwap = callback;
}

function handleSwap(text, currentTargetLang) {
  if (_onSwap) {
    _onSwap(text, currentTargetLang);
  }
}

// ── Public API aliases expected by index.ts ──

export function updatePopupResult(_el, result) {
  showResult(result);
}

export function updatePopupError(_el, message) {
  showError(message);
}

export function removePopup() {
  hide();
}

export function isInsidePopup(target) {
  return _popup && _popup.contains(target);
}

export function hasPopup() {
  return isVisible();
}

// ── Legacy global (backward compatibility) ──
if (typeof __TP !== 'undefined') {
  __TP.PopupUI = {
    show: show,
    hide: hide,
    isVisible: isVisible,
    getElement: getElement,
    showResult: showResult,
    showError: showError,
    onSwap: onSwap,
    showPopup: showPopup,
    updatePopupResult: updatePopupResult,
    updatePopupError: updatePopupError,
    removePopup: removePopup,
    isInsidePopup: isInsidePopup,
    hasPopup: hasPopup
  };
}
