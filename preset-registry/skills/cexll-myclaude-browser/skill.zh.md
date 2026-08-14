---
name: browser
description: This skill should be used for browser automation tasks using Chrome DevTools Protocol (CDP). Triggers when users need to launch Chrome with remote debugging, navigate pages, execute JavaScript in browser context, capture screenshots, or interactively select DOM elements. No MCP server required.
---
# 浏览器自动化

无需设置 MCP 服务器即可进行浏览器自动化的精简版 Chrome DevTools Protocol (CDP) 辅助工具。

## 设置

首次使用前安装依赖项：

```bash
npm install --prefix ~/.claude/skills/browser/browser ws
```

## 脚本

所有脚本均连接到 `localhost:9222` 上的 Chrome。

### start.js - 启动 Chrome

```bash
scripts/start.js              # 使用全新配置文件
scripts/start.js --profile    # 使用持久化配置文件（保留 Cookie/身份验证信息）
```

### nav.js - 导航

```bash
scripts/nav.js https://example.com        # 在当前标签页中导航
scripts/nav.js https://example.com --new  # 在新标签页中打开
```

### eval.js - 执行 JavaScript

```bash
scripts/eval.js 'document.title'
scripts/eval.js '(() => { const x = 1; return x + 1; })()'
```

使用单个表达式，或使用 IIFE 执行多条语句。

### screenshot.js - 截取屏幕截图

```bash
scripts/screenshot.js
```

返回保存在临时目录中的 PNG 文件的 `{ path, filename }`。

### pick.js - 可视化元素选择器

```bash
scripts/pick.js "Click the submit button"
```

返回元素元数据：标签、ID、类、文本、href、选择器、矩形区域。

## 工作流程

1. 启动 Chrome：对于已通过身份验证的会话，使用 `scripts/start.js --profile`
2. 导航：`scripts/nav.js <url>`
3. 检查：`scripts/eval.js 'document.querySelector(...)'`
4. 截取：`scripts/screenshot.js` 或 `scripts/pick.js`
5. 返回收集的数据

## 要点

- 所有操作均在本地运行——凭据绝不会离开本机
- 使用 `--profile` 标志保留 Cookie 和身份验证令牌
- 脚本返回供智能体使用的结构化 JSON