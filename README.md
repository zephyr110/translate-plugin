# 划词翻译助手 - Chrome 浏览器插件

一个简单易用的 Chrome 浏览器插件，支持页面划词翻译功能，实现中英文自动互译。

![](https://cdn.jsdelivr.net/gh/tienouc/blog-img/20251108192416345.gif)

## 功能特点

- ✅ **页面划词翻译**：在任何网页上划选文本即可自动翻译
- ✅ **智能语言检测**：基于 CJK/Latin 字符比例（25% 阈值）自动判断翻译方向
- ✅ **双向翻译**：中文→英文，英文→中文自动切换，支持 ⇄ 一键反向翻译
- ✅ **三级 API 回退**：百度翻译 → Google 翻译 → LibreTranslate，自动降级
- ✅ **shadcn/ui 设计风格**：干净、现代的 UI，HSL 色彩系统 + 系统暗色模式自适应
- ✅ **Lucide 图标**：一致描边风格的 SVG 图标
- ✅ **翻译统计**：记录今日和累计翻译次数（自动跨天重置）
- ✅ **智能弹窗定位**：四边边界检测，防止弹出屏幕
- ✅ **自动翻译开关**：可随时开启/关闭划词翻译
- ✅ **XSS 防护**：翻译结果 HTML 转义，安全渲染

## 快速开始

### 1. 构建

```bash
npm run build   # 生成 dist/content.js 和 dist/popup.js
```

构建脚本 (`src/build.js`) 将 `src/` 下的模块按依赖顺序拼接，零外部依赖。

### 2. 加载到 Chrome

1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目文件夹
5. 插件图标出现在工具栏中

### 3. 使用

1. 在任意网页上划选英文或中文文本
2. 翻译弹窗自动出现
3. 点击 ⇄ 按钮反向翻译
4. 点击弹窗外部关闭

## 项目结构

```
translate-plugin/
├── manifest.json              # 插件配置 (Manifest V3)
├── package.json               # npm build 脚本
├── src/
│   ├── build.js               # 拼接构建脚本（零依赖）
│   ├── lib/
│   │   ├── md5.js             # MD5 哈希（百度签名）
│   │   └── lang-detect.js     # 语言检测（CJK/Latin 比例）
│   ├── services/
│   │   ├── storage.js         # chrome.storage Promise 封装
│   │   └── stats.js           # 翻译统计服务（写入队列防竞态）
│   ├── translation/
│   │   ├── baidu.js           # 百度翻译引擎
│   │   ├── google.js          # Google 翻译引擎
│   │   ├── libre.js           # LibreTranslate 引擎
│   │   └── orchestrator.js    # 三级回退链 + 反向翻译
│   ├── content/
│   │   ├── popup-ui.js        # 弹窗 DOM 管理（代际计数器防竞态）
│   │   └── main.js            # 事件监听 + 翻译流程编排
│   └── popup/
│       ├── main.js            # 弹窗入口 + 消息监听
│       ├── settings.js        # 自动翻译开关
│       ├── stats.js           # 统计显示 + 清除
│       └── ui.js              # Toast 通知
├── dist/                      # 构建产物（gitignore）
│   ├── content.js             # 内容脚本（10 模块拼接）
│   └── popup.js               # 弹窗脚本（6 模块拼接）
├── popup.html                 # 扩展弹出页
├── popup.css                  # 弹出页样式 (shadcn/ui)
├── styles.css                 # 翻译弹窗注入样式 (shadcn/ui)
├── test.html                  # 本地测试页面
├── icons/                     # 扩展图标（PNG + SVG）
│   ├── icon16.png / .svg
│   ├── icon32.png / .svg
│   ├── icon48.png / .svg
│   ├── icon64.png / .svg
│   └── icon128.png / .svg
└── README.md
```

## 技术架构

### 翻译 API 优先级

| 优先级 | 引擎 | API 地址 | 配置要求 |
|--------|------|----------|----------|
| 1 | 百度翻译 | `api.fanyi.baidu.com` | 需配置 `appid` + `key` |
| 2 | Google 翻译 | `translate.googleapis.com` | 无需配置 |
| 3 | LibreTranslate | `libretranslate.de` | 无需配置 |

### 模块架构

源码按职责拆分为 14 个独立模块，通过 `src/build.js` 拼接为两个输出文件。每个模块通过 `__TP` 命名空间挂载导出，模块间依赖由构建顺序显式控制。

### UI 设计

- **shadcn/ui 风格**：HSL 色彩令牌系统，`border` + `shadow-sm` + `rounded` 卡片组件
- **Lucide 图标**：7 个内联 SVG（Sparkles、MousePointerClick、MessageSquareText、Zap、BarChart3、ArrowLeftRight、Trash2）
- **暗色模式**：`prefers-color-scheme: dark` 媒体查询，自动切换
- **弹出页宽度**：300px，响应式适配

## 设置选项

点击插件图标打开设置面板：

- **自动翻译**：开启/关闭划词翻译（默认开启）
- **翻译统计**：今日和累计翻译次数
- **清除统计**：重置翻译数据

## 配置百度翻译（可选）

在扩展控制台执行：

```js
chrome.storage.sync.set({
  baiduAppId: "你的appid",
  baiduAppKey: "你的key"
});
```

未配置时自动回退到 Google → LibreTranslate。

## 兼容性

- Chrome 101+（使用 CSS Color Level 4 相对颜色语法）
- Manifest V3
- 支持系统暗色模式

## 本地开发

```bash
# 构建
npm run build

# 预览弹出页（无扩展环境）
python3 -m http.server 8001
# 访问 http://localhost:8001/popup.html
```

`chrome.*` API 调用均已做环境守卫处理，本地预览不会报错。

## 开发计划

- [ ] 添加更多翻译 API 选项
- [ ] 支持更多语言对
- [ ] 添加单词发音功能
- [ ] 支持翻译历史记录
- [ ] 添加自定义快捷键

## 问题反馈

- 在项目中提交 Issue
- 提供详细的错误信息和复现步骤
- 附上相关截图和浏览器版本信息

## 许可证

MIT

## 致谢

- [shadcn/ui](https://ui.shadcn.com) 设计系统
- [Lucide](https://lucide.dev) 图标库
- Baidu Translate API / Google Translate API / LibreTranslate
- Chrome Extensions 开发文档
