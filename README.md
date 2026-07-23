# 划词翻译助手

Chrome 浏览器插件，页面划选中英文自动互译。

## 功能

- **划词翻译** — 选中文本自动弹出翻译结果
- **双向翻译** — 中文→英文，英文→中文，自动检测
- **三级回退** — 百度翻译 → Google 翻译 → LibreTranslate
- **shadcn/ui 风格** — HSL 色彩系统 + 暗色模式自适应，Lucide 图标
- **翻译统计** — 今日/累计计数，自动跨天重置

## 安装

```bash
npm install
npm run build
```

加载 `dist/` 为 Chrome 未打包扩展，详见 [INSTALL.md](INSTALL.md)。

## 配置百度翻译（可选）

在扩展 DevTools 控制台执行：

```js
chrome.storage.sync.set({ baiduAppId: "id", baiduAppKey: "key" })
```

未配置时自动回退到 Google → LibreTranslate。

## 项目结构

```
src/
├── content/          # 内容脚本（划词监听 + 弹窗渲染）
├── popup/            # 弹出页（设置 + 统计）
├── translators/      # 翻译适配器（Baidu / Google / LibreTranslate）
├── utils/            # MD5 / 语言检测 / storage 封装 / 文案
└── types/            # 共享类型
public/               # popup.html, test.html
styles/               # popup.css, content.css
scripts/build.mjs     # Vite 双入口构建
```

## 技术栈

TypeScript · Vite · Chrome Manifest V3 · shadcn/ui 设计令牌

## 许可证

MIT
