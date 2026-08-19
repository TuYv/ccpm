---
name: hyperflow-sticky
description: Hyperflow auto-routing mode. Use to control how aggressively hyperflow auto-routes — "make hyperflow sticky", "stop using hyperflow", "auto-route to hyperflow", "disable hyperflow auto-routing". Sets on (every task-shaped message routes) / auto (intent-verb messages route — default) / off (no auto-routing).
---
# hyperflow-sticky — 自动路由模式（Antigravity 单代理）

控制 hyperflow 的自动路由积极程度。遵循 `hyperflow` 原则。

## 模式

- **on** — 每条任务型消息都会通过 hyperflow 工作流进行路由。
- **auto**（默认）— 仅首个动词匹配路由表（build/fix/audit/scope/design/ship…）的消息会进行路由。
- **off** — 不进行自动路由；只有在显式调用 `/hyperflow*` 命令时才运行 hyperflow。

## 步骤

1. 读取请求的模式（on / auto / off）。
2. 将其写入 `.hyperflow/.sticky-mode`（一个单词）。
3. 核心 `hyperflow` 技能会在每项任务中读取该文件，以决定是否自动路由。
4. 输出新模式。

## 规则

- 这只会更改路由行为——绝不会执行工作。文件不存在时，默认为 `auto`。