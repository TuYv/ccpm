---
name: desktop-develop
description: Develop, debug, and verify the OpenWork desktop/Electron app with an agent-readable harness. Use when working on packages/desktop, Electron renderer/main/preload code, desktop UI bugs, local desktop runtime failures, Chrome DevTools MCP investigation, desktop logs, messaging gateway issues, or when improving the development feedback loop for desktop features.
---
# 桌面开发测试框架

## 概述

使用此 skill 将桌面端工作转变为紧凑的测试框架循环：收集运行时上下文，在代理可见 UI 和日志的情况下复现问题，进行最小范围的修复，通过相同路径验证，并将任何缺失的辅助能力补充回仓库。

当任务涉及开发工作流、可观测性、文档、测试或面向代理的测试框架本身时，阅读 `references/harness-principles.md`。

## 快速上下文

对于错误报告、UI 失败、卡顿、启动问题、消息传递问题，或任何涉及正在运行的桌面应用的问题，直接检查运行时日志。
重要路径：

- `~/Library/Logs/@craft-agent/electron/main.log`
- `~/Library/Logs/@craft-agent/electron/main.old.log`
- `~/.craft-agent/logs/messaging-gateway.log`

先搜索日志，再进行猜测：

```bash
rg -n "error|warn|failed|exception|crash|Unhandled|rejection|browser-cdp|messaging-gateway" \
  "$HOME/Library/Logs/@craft-agent/electron/main.log" \
  "$HOME/.craft-agent/logs/messaging-gateway.log"
```

## 测试框架循环

1. **梳理范围。** 确定任务涉及 Electron 主进程、preload、渲染进程、共享桌面端包、服务器、消息传递还是浏览器 CDP。编辑前阅读相关代码和测试。
2. **收集实时证据。** 在复现问题的同时读取并持续追踪相关日志。将缺失或含义不明确的日志视为问题的一部分。
3. **驱动 UI。** 当涉及浏览器/渲染器页面时，使用 Chrome DevTools MCP：`list_pages`、`select_page`、`take_snapshot`，然后检查控制台/网络。推理时优先使用无障碍快照，而不是截图。
4. **先复现。** 对于错误，记录确切的观察结果以及能够证明该结果的证据。如果复现结果与用户报告不同，则比较环境、应用状态、构建产物、账户、时序和日志。
5. **针对性修复。** 将改动限制在已证实的原因范围内。只有在确实能减少重复工作或让未来的代理更容易理解应用时，才添加结构。
6. **通过相同路径验证。** 重新运行复现流程，再次检查日志和 DevTools，然后针对改动的包运行专注的测试/类型检查。
7. **必要时改进测试框架。** 如果修复依赖隐藏知识，则添加简短文档、测试、日志字段或 skill 更新，使下一个代理能够直接看到这些信息。

## 运行桌面端

使用 `packages/desktop` 中的桌面端专用命令：

```bash
cd packages/desktop
bun run electron:dev
bun run electron:dev:terminal
bun run electron:dev:logs
```

当错误涉及进程输出、启动或关闭时，使用 `electron:dev:terminal`。当应用已经运行且你需要实时追踪日志时，使用 `electron:dev:logs`。

## Chrome DevTools MCP

如果 DevTools 工具未加载，先搜索 `chrome-devtools` 工具。
然后：

1. 调用 `mcp__chrome_devtools.list_pages`。
2. 使用 `mcp__chrome_devtools.select_page` 选择相关页面。
3. 使用 `mcp__chrome_devtools.take_snapshot` 获取无障碍快照。
4. 使用 `mcp__chrome_devtools.list_console_messages` 检查运行时失败，然后对重要条目调用 `mcp__chrome_devtools.get_console_message`。
5. 当涉及网络状态时，使用 `mcp__chrome_devtools.get_network_request` 检查选定的网络请求。
6. 对于内存问题，使用 `mcp__chrome_devtools.take_heapsnapshot` 保存堆快照，并将其保存在 `.qwen/` 或 `/tmp` 下，而不是源代码目录中。

每次执行会改变 UI 的操作后，都要获取一个新的快照。不要依赖过时的
元素 id 或旧的控制台状态。

## 聚焦验证

选择能够覆盖所触及表面的最小范围检查：

```bash
cd packages/desktop && bun run typecheck:electron
cd packages/desktop && bun run typecheck:all
cd packages/desktop && bun run validate:dev
cd packages/desktop/apps/electron && bun run lint
cd packages/desktop/packages/shared && bun test path/to/file.test.ts
```

对于根 CLI/core 更改，改用 `AGENTS.md` 中的根仓库命令。对于仅涉及 desktop
的更改，优先使用 desktop 包命令。

## 便于 Agent 阅读的更改

优先进行便于未来 Agent 检查和验证的更改：

- 在失败边界附近添加结构化日志字段，而不是使用含糊的消息。
- 当 DevTools 快照难以解读时，添加无障碍名称或稳定的 UI 操作入口。
- 将文档作为带有链接的地图，指向更深入的来源。不要创建庞大的手册。
- 将重复的手动调试步骤转换为文档、测试或结构化日志。
- 将非平凡的调查记录在 `.qwen/investigations/` 中。

只有在缺失的输入无法在本地发现，且合理的假设可能导致更改错误行为时，才暂停并询问用户。