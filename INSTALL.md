# 本地开发配置指南

## 步骤1：准备文件
确保所有插件文件都在同一个文件夹中：
- `manifest.json`
- `content.js`
- `styles.css`
- `popup.html`
- `popup.css`
- `popup.js`
- `icons/`（建议 PNG 图标齐全）
  - `icon16.png`, `icon24.png`, `icon32.png`, `icon48.png`, `icon64.png`, `icon128.png`

## 步骤2：在 Chrome 中加载扩展
1. 打开Chrome浏览器
2. 地址栏输入：`chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择插件文件夹

## 步骤3：配置百度翻译（可选但推荐）
百度为首选翻译服务，需要 `appid` 与 `key`：

1. 在扩展的弹出页或控制台打开开发者工具。
2. 在控制台执行：
   ```
   chrome.storage.sync.set({
     baiduAppId: "你的appid",
     baiduAppKey: "你的key"
   })
   ```
3. 在 `manifest.json` 的 `host_permissions` 中加入：
   ```
   "host_permissions": [
     "https://translate.googleapis.com/*",
     "https://api-free.deepl.com/*",
     "https://api.fanyi.baidu.com/*"
   ]
   ```

若未配置或请求失败，扩展会自动回退到 Google，再回退到 LibreTranslate。

## 步骤4：开始使用
1. 在任意网页上划选英文或中文文本
2. 等待翻译弹窗出现
3. 查看翻译结果

## 注意事项
- 需要网络连接
- 支持中英文自动互译（中文→英，非中文→中）
- 点击弹窗外部可关闭
- 工具栏图标建议使用透明 PNG，尺寸 `16/24/32`
- 扩展管理页/商店图标建议 `16/32/48/64/128`

## 问题排查
如果插件无法工作：
1. 检查网络连接与 API 可用性（尤其是百度/Goolge）
2. 在 `chrome://extensions/` 中点击“重新加载”扩展
3. 打开网页控制台查看错误信息
4. 确认已在普通网页上测试（非扩展页面/Chrome商店）
5. 若本地预览 `popup.html`，请使用：
   - `python3 -m http.server 8001` 并访问 `http://localhost:8001/popup.html`
   - 本地预览没有扩展环境，代码已对 `chrome.*` API 做环境守卫