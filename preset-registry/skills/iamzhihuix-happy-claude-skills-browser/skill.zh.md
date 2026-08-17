---
name: browser
description: Minimal Chrome DevTools Protocol tools for browser automation and scraping. Use when you need to start Chrome, navigate pages, execute JavaScript, take screenshots, or interactively pick DOM elements. Triggers include "browse website", "scrape page", "take screenshot", "automate browser", "extract DOM", "web scraping".
metadata:
  author: iamzhihuix
  version: "1.0.0"
---
# 浏览器工具

用于协作式网站探索和抓取的精简 CDP 工具。

**致谢**：基于 [Mario Zechner](https://mariozechner.at) 的文章[《如果你并不需要 MCP 呢？》](https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp/)，并改编自 [Factory.ai](https://docs.factory.ai/guides/skills/browser)。

## 设置

首次使用前，请安装依赖项：

```bash
npm install --prefix skills/browser
```

## 启动 Chrome

```bash
./skills/browser/scripts/start.js              # Fresh profile
./skills/browser/scripts/start.js --profile    # Copy your profile (cookies, logins)
```

使用远程调试在 `:9222` 上启动 Chrome。

## 导航

```bash
./skills/browser/scripts/nav.js https://example.com
./skills/browser/scripts/nav.js https://example.com --new
```

在当前标签页中导航或打开新标签页。

## 执行 JavaScript

```bash
./skills/browser/scripts/eval.js 'document.title'
./skills/browser/scripts/eval.js 'document.querySelectorAll("a").length'
```

在活动标签页中执行 JavaScript（异步上下文）。

**重要提示**：代码必须是单个表达式，或使用 IIFE 执行多条语句：

- 单个表达式：`'document.title'`
- 多条语句：`'(() => { const x = 1; return x + 1; })()'`
- 避免在代码字符串中使用换行符——将其保持在一行内

## 截图

```bash
./skills/browser/scripts/screenshot.js
```

截取当前视口，返回临时文件路径。

## 选取元素

```bash
./skills/browser/scripts/pick.js "Click the submit button"
```

交互式元素选取器。单击进行选择，使用 Cmd/Ctrl+单击进行多选，按 Enter 完成。

## 工作流程

1. 使用 `start.js --profile` **启动 Chrome**，以同步你的身份验证状态。
2. 通过 `nav.js https://target.app` **进行导航**，或使用 `--new` 打开辅助标签页。
3. 使用 `eval.js` **检查 DOM**，以快速统计数量、检查属性或提取 JSON 载荷。
4. 使用 `screenshot.js` **捕获产物**以提供视觉证据；需要精确选择器或文本快照时，则使用 `pick.js`。

## 使用说明

- 使用其他工具前，请先启动 Chrome
- `--profile` 标志会同步你的实际 Chrome 配置文件，因此你在所有网站上都会保持登录状态
- JavaScript 求值在页面的异步上下文中运行
- 选取工具允许你通过单击 DOM 元素，以可视化方式选择它们