---
name: dev-browser
description: Browser automation with persistent page state. Use when users ask to navigate websites, fill forms, take screenshots, extract web data, test web apps, or automate browser workflows. Trigger phrases include "go to [url]", "click on", "fill out the form", "take a screenshot", "scrape", "automate", "test the website", "log into", or any browser interaction request.
---
# Dev Browser

一个使用沙箱化 JavaScript 脚本控制浏览器的 CLI。

## 安装

```bash
npm install -g dev-browser
dev-browser install
```

## 用法

运行 `dev-browser --help` 了解更多信息。

由守护进程启动的具名浏览器默认会保持运行。对于无人值守的工作，`--idle-timeout 5m` 会在每个已启动的浏览器处于非活动状态达到指定时间后将其关闭，同时保留其配置文件和登录状态。该设置绝不会关闭通过 `--connect` 附加的 Chrome；使用 `--idle-timeout 0` 可禁用已配置的清理机制。