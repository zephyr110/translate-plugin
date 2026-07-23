// 构建脚本：将 src/ 下的模块按依赖顺序拼接为 dist/ 中的单文件
// 零外部依赖，仅使用 Node.js 内置模块
//
// ⚠️ 文件顺序至关重要：每个模块依赖列表中它之前的模块。
// 例如 orchestrator.js 必须在所有 translator 之后，
// main.js 必须在 popup-ui.js 之后。
// 改变顺序会导致运行时 __TP.* 未定义错误。
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// 确保输出目录存在
if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

/**
 * 构建目标文件
 * @param {string} target - 输出文件名 (如 'content.js')
 * @param {string[]} files - 源文件相对路径列表 (相对于 src/)
 */
function build(target, files) {
  const parts = [];
  parts.push('(function(){');
  parts.push("'use strict';");
  parts.push('var __TP = window.__TP = {};');
  parts.push('');

  for (const file of files) {
    const filePath = path.join(SRC, file);
    if (!fs.existsSync(filePath)) {
      console.error(`  ERROR: File not found: ${filePath}`);
      process.exit(1);
    }
    const code = fs.readFileSync(filePath, 'utf8');
    parts.push(`// ====== ${file} ======`);
    parts.push(code);
    parts.push('');
  }

  parts.push('})();');

  const output = parts.join('\n');
  const outputPath = path.join(DIST, target);
  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`  ${target} (${(output.length / 1024).toFixed(1)} KB) — ${files.length} modules`);
}

console.log('Building...');

// ====== content.js ======
build('content.js', [
  'lib/md5.js',
  'lib/lang-detect.js',
  'services/storage.js',
  'services/stats.js',
  'translation/baidu.js',
  'translation/google.js',
  'translation/libre.js',
  'translation/orchestrator.js',
  'content/popup-ui.js',
  'content/main.js',
]);

// ====== popup.js ======
build('popup.js', [
  'services/storage.js',
  'services/stats.js',
  'popup/ui.js',
  'popup/settings.js',
  'popup/stats.js',
  'popup/main.js',
]);

console.log('Build complete.');
