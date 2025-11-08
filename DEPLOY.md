# 发布与打包指南（Chrome/Edge/Firefox）

本指南描述如何将“划词翻译助手”打包并发布到浏览器扩展市场。默认以 Chrome Web Store 为例，其它平台的要点见文末。

## 准备工作
- 确认 `manifest.json` 为 Manifest V3。
- 图标建议使用 PNG，并确保尺寸齐全：`16/32/48/64/128`，工具栏推荐 `16/24/32`。
- 将工具栏与扩展管理页图标路径指向 `icons/*.png`。
- 在 `host_permissions` 中包含实际访问的域：
  - `https://api.fanyi.baidu.com/*`
  - `https://translate.googleapis.com/*`
  - 如需保留：`https://api-free.deepl.com/*`
- 版本号规范：每次发布或更新需递增 `version`（例如 `1.0.1`）。
- 本地验证：在 `chrome://extensions/` 加载已解压扩展，完整测试划词翻译、弹窗、统计、设置等功能。
- 在扩展环境写入百度凭证（首选）：
  ```
  chrome.storage.sync.set({ baiduAppId: "<你的appid>", baiduAppKey: "<你的key>" })
  ```

### manifest.json 示例
```
{
  "manifest_version": 3,
  "name": "划词翻译助手",
  "version": "1.0.0",
  "permissions": ["activeTab", "storage"],
  "host_permissions": [
    "https://api.fanyi.baidu.com/*",
    "https://translate.googleapis.com/*",
    "https://api-free.deepl.com/*"
  ],
  "action": {
    "default_title": "划词翻译助手",
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "24": "icons/icon24.png",
      "32": "icons/icon32.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "64": "icons/icon64.png",
    "128": "icons/icon128.png"
  }
}
```

## 打包（生成 ZIP）
- 在项目根目录执行：
  - `zip -r selection-translate-<version>.zip manifest.json content.js popup.html popup.css popup.js styles.css icons/`
- 打包内容建议仅包含运行所需文件：
  - `manifest.json`、`content.js`、`popup.*`、`styles.css`、`icons/*.png`。
  - 文档（`README.md`、`INSTALL.md`）可保留但不是必须。
  - 排除无关大文件与临时产物。

## 发布到 Chrome Web Store
1. 注册开发者账号（一次性费用约 5 美元）。
2. 进入开发者控制台，创建新项目并上传上述 ZIP。
3. 填写商店信息：
   - 名称与简短描述、详细描述（突出功能与使用方式）。
   - 类别与地区。
   - 图标与截图：
     - 图标：`128×128` PNG（使用 `icons/icon128.png`）。
     - 截图：建议 `1280×800` 或 `640×400`，展示划词、弹窗与设置界面。
   - 权限与域说明：
     - `activeTab`：在当前标签页工作。
     - `storage`：保存设置与统计。
     - 域访问：百度/Google（及可选的 Deepl）。
   - 隐私与数据安全：
     - 声明不收集个人可识别信息，不与第三方共享；仅为翻译请求访问所列域名。
     - 提供隐私政策链接（推荐在项目内或独立页面提供）。
4. 提交审核并等待结果，通过后自动上架。

## 更新发布
- 修改代码后递增 `version`。
- 本地验证通过后重新执行打包命令，得到新的 ZIP。
- 在开发者控制台上传新版本并提交审核，用户将自动更新。

## Edge / Firefox 要点（可选）
- Edge Add-ons：
  - 与 Chrome 基本兼容，ZIP 与 `manifest.json` 通常可直接使用。
  - 提交流程与商店信息填写类似。
- Firefox Add-ons：
  - 注意 API 差异（`browser.*`）与权限声明可能不同。
  - 如遇 Manifest 兼容问题，参考 Mozilla 扩展文档调整。

## 常见问题与排查
- 审核驳回：通常是权限说明不充分、隐私政策缺失或描述不清。补充权限用途与隐私说明即可。
- 图标不显示或模糊：确认工具栏与管理页图标路径均为 PNG，尺寸为推荐值；检查透明背景与留白统一。
- 翻译请求失败：检查 `host_permissions` 是否包含域、确认已写入百度凭证；注意接口限流与网络环境。
- 本地预览 `popup.html`：本地无扩展环境，`chrome.*` 不可用；代码已加入环境守卫用于预览。

## 发布前检查清单
- `version` 已递增且与 ZIP 名一致。
- `icons/*.png` 尺寸齐全，路径正确。
- `host_permissions` 包含百度与 Google 域。
- 已在扩展环境写入百度凭证并通过实测。
- 提供清晰截图与隐私政策说明。