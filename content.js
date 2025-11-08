// 划词翻译内容脚本
let selectedText = '';
let translationPopup = null;

// 监听鼠标释放事件（选中文本后）
document.addEventListener('mouseup', function(event) {
  selectedText = window.getSelection().toString().trim();
  
  if (selectedText.length > 0) {
    // 延迟显示翻译弹窗，避免干扰正常操作
    setTimeout(() => {
      showTranslationPopup(event.pageX, event.pageY, selectedText);
    }, 300);
  } else {
    // 如果没有选中文本，隐藏翻译弹窗
    hideTranslationPopup();
  }
});

// 监听点击事件，点击其他地方时隐藏弹窗
document.addEventListener('click', function(event) {
  if (translationPopup && !translationPopup.contains(event.target)) {
    hideTranslationPopup();
  }
});

// 显示翻译弹窗
function showTranslationPopup(x, y, text) {
  hideTranslationPopup(); // 先隐藏已存在的弹窗
  
  translationPopup = document.createElement('div');
  translationPopup.className = 'translation-popup';
  translationPopup.innerHTML = `
    <div class="translation-content">
      <div class="translation-loading">正在翻译...</div>
    </div>
  `;
  
  // 设置弹窗位置
  translationPopup.style.left = x + 'px';
  translationPopup.style.top = (y + 20) + 'px';
  
  document.body.appendChild(translationPopup);
  
  // 执行翻译
  translateText(text);
}

// 隐藏翻译弹窗
function hideTranslationPopup() {
  if (translationPopup) {
    translationPopup.remove();
    translationPopup = null;
  }
}

// 翻译文本
async function translateText(text) {
  try {
    const result = await detectAndTranslate(text);
    updateTranslationResult(result);
  } catch (error) {
    updateTranslationError('翻译失败，请稍后重试');
    console.error('Translation error:', error);
  }
}

// 优先使用百度翻译，失败后回退到 Google，再回退到 LibreTranslate
async function detectAndTranslate(text) {
  // 根据文本简单判断目标语言：中文 -> 英文，非中文 -> 中文
  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  const targetLang = isChinese ? 'en' : 'zh';

  // 1) 先尝试百度翻译
  try {
    const baiduResult = await translateWithBaidu(text, targetLang);
    updateTranslationStats();
    return baiduResult;
  } catch (e) {
    console.warn('Baidu translate failed, falling back to Google:', e);
  }

  // 2) 回退到 Google 翻译
  try {
    const googleResult = await translateWithGoogle(text, targetLang);
    updateTranslationStats();
    return googleResult;
  } catch (e) {
    console.warn('Google translate failed, falling back to LibreTranslate:', e);
  }

  // 3) 最后回退到 LibreTranslate
  const alt = await translateWithAlternativeAPI(text);
  updateTranslationStats();
  return alt;
}

// 计算百度签名所需的 MD5（简化版实现）
function md5(str) {
  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

  function md5cycle(x, k) {
    let a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -205492279);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function md5blk(s) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  function md51(s) {
    let n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      i;
    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    const tail = new Array(16).fill(0);
    for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[s.length >> 2] |= 0x80 << ((s.length % 4) << 3);
    if (s.length > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function rhex(n) {
    const s = '0123456789abcdef';
    let j, out = '';
    for (j = 0; j < 4; j++) out += s.charAt((n >> (j * 8 + 4)) & 0x0F) + s.charAt((n >> (j * 8)) & 0x0F);
    return out;
  }

  function hex(x) {
    for (let i = 0; i < x.length; i++) x[i] = rhex(x[i]);
    return x.join('');
  }

  function add32(a, b) { return (a + b) & 0xFFFFFFFF; }

  return hex(md51(str));
}

// 获取百度配置（从 storage.sync），未配置则抛错用于触发回退
function getBaiduConfig() {
  return new Promise((resolve, reject) => {
    if (!chrome?.storage?.sync) {
      return reject(new Error('Chrome storage.sync unavailable'));
    }
    chrome.storage.sync.get(['baiduAppId', 'baiduAppKey'], (res) => {
      const appid = res.baiduAppId;
      const key = res.baiduAppKey;
      if (appid && key) resolve({ appid, key });
      else reject(new Error('Baidu AppId/Key not set'));
    });
  });
}

// 使用百度翻译
async function translateWithBaidu(text, targetLang) {
  const { appid, key } = await getBaiduConfig();
  const salt = Date.now().toString();
  const sign = md5(appid + text + salt + key);
  const to = targetLang === 'zh' ? 'zh' : targetLang; // 兼容 zh-CN -> zh
  const query = new URLSearchParams({
    q: text,
    from: 'auto',
    to,
    appid,
    salt,
    sign
  }).toString();
  const url = `https://api.fanyi.baidu.com/api/trans/vip/translate?${query}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Baidu HTTP ${resp.status}`);
  const data = await resp.json();
  if (data.error_code) throw new Error(`Baidu error ${data.error_code}: ${data.error_msg}`);
  const translatedText = (data.trans_result || []).map(it => it.dst).join('');
  return {
    originalText: text,
    translatedText,
    sourceLanguage: data.from || 'auto',
    targetLanguage: data.to || to
  };
}

// 使用 Google 翻译（回退路径）
async function translateWithGoogle(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Google HTTP ${resp.status}`);
  const data = await resp.json();
  if (!(data && data[0])) throw new Error('Google format error');
  const translatedText = data[0].map(item => item[0]).join('');
  const detectedLang = data[2] || 'auto';
  return {
    originalText: text,
    translatedText,
    sourceLanguage: detectedLang,
    targetLanguage: targetLang
  };
}

// 备用翻译API（使用LibreTranslate）
async function translateWithAlternativeAPI(text) {
  try {
    // 首先尝试检测语言（通过简单的字符判断）
    const isChinese = /[\u4e00-\u9fa5]/.test(text);
    const targetLang = isChinese ? 'en' : 'zh';
    
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLang,
        format: 'text'
      })
    });
    
    const data = await response.json();
    
    if (data && data.translatedText) {
      return {
        originalText: text,
        translatedText: data.translatedText,
        sourceLanguage: isChinese ? 'zh' : 'en',
        targetLanguage: targetLang
      };
    }
  } catch (error) {
    throw new Error('Translation failed');
  }
}

// 更新翻译结果显示
function updateTranslationResult(result) {
  if (!translationPopup) return;
  
  const contentDiv = translationPopup.querySelector('.translation-content');
  contentDiv.innerHTML = `
    <div class="translation-original">
      <div class="translation-text">${result.originalText}</div>
    </div>
    <div class="translation-result">
      <div class="translation-text">${result.translatedText}</div>
    </div>
  `;
}

// 更新翻译错误信息
function updateTranslationError(message) {
  if (!translationPopup) return;
  
  const contentDiv = translationPopup.querySelector('.translation-content');
  contentDiv.innerHTML = `
    <div class="translation-error">
      <strong>翻译失败：</strong>${message}
    </div>
  `;
}

// 切换语言（沿用：优先百度，失败回退 Google，再回退 LibreTranslate）
async function swapLanguage(text) {
  if (!translationPopup) return;
  
  const contentDiv = translationPopup.querySelector('.translation-content');
  contentDiv.innerHTML = '<div class="translation-loading">正在切换语言...</div>';
  
  try {
    const isChinese = /[\u4e00-\u9fa5]/.test(text);
    const targetLang = isChinese ? 'en' : 'zh';
    let result;
    try {
      result = await translateWithBaidu(text, targetLang);
    } catch (e) {
      result = await translateWithGoogle(text, targetLang);
    }
    updateTranslationResult(result);
  } catch (error) {
    updateTranslationError('语言切换失败');
  }
}

// 获取语言名称
function getLanguageName(langCode) {
  const languageNames = {
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
  
  return languageNames[langCode] || langCode;
}

// 更新翻译统计信息
function updateTranslationStats() {
  chrome.storage.local.get(['translationStats'], function(result) {
    const stats = result.translationStats || { today: 0, total: 0, lastDate: new Date().toDateString() };
    
    // 检查是否是新的一天
    const today = new Date().toDateString();
    if (stats.lastDate !== today) {
      stats.today = 0;
      stats.lastDate = today;
    }
    
    stats.today += 1;
    stats.total += 1;
    
    chrome.storage.local.set({ translationStats: stats });
    
    // 通知弹出窗口更新统计
    chrome.runtime.sendMessage({ action: 'updateStats' });
  });
}