---
name: canvas
description: |
  **The primary skill for terminal TUI components.** Covers spawning, controlling, and interacting with terminal canvases.
  Use when displaying calendars, documents, or flight bookings.
---
# Canvas TUI 工具包

**使用终端画布时请从这里开始。** 此技能涵盖整体工作流、画布类型和 IPC 通信。

## 示例提示词

可以尝试向 Claude 提出以下请求：

**日历：**
- "安排下周与团队开会"
- "找一个 Alice 和 Bob 都有空的时间"

**文档：**
- "起草一封发给销售团队的电子邮件，介绍新功能"
- "帮我编辑这份文档——让我选择要修改的内容"

**航班：**
- "查找下周五从 SFO 飞往 Denver 的航班"
- "帮我预订早班航班的靠窗座位"

## 概述

Canvas 提供 Claude 可以启动和控制的交互式终端显示界面（TUI）。每种画布类型都支持多种场景，以适应不同的交互模式。

## 可用的画布类型

| 画布 | 用途 | 场景 |
|--------|---------|-----------|
| `calendar` | 显示日历、选择会议时间 | `display`、`meeting-picker` |
| `document` | 查看/编辑 markdown 文档 | `display`、`edit`、`email-preview` |
| `flight` | 航班比较和座位选择 | `booking` |

## 快速开始

```bash
cd ${CLAUDE_PLUGIN_ROOT}

# Run canvas in current terminal
bun run src/cli.ts show calendar

# Spawn canvas in new tmux split
bun run src/cli.ts spawn calendar --scenario meeting-picker --config '{...}'
```

## 启动画布

**对于交互式场景，始终使用 `spawn`**——这会在 tmux 拆分窗格中打开画布，同时保持对话终端可用。

```bash
bun run src/cli.ts spawn [kind] --scenario [name] --config '[json]'
```

**参数：**
- `kind`：画布类型（calendar、document、flight）
- `--scenario`：交互模式（例如 display、meeting-picker、edit）
- `--config`：画布的 JSON 配置
- `--id`：用于 IPC 的可选画布实例 ID

## IPC 通信

交互式画布通过 Unix 域套接字进行通信。

**画布 → 控制器：**
```typescript
{ type: "ready", scenario }        // Canvas is ready
{ type: "selected", data }         // User made a selection
{ type: "cancelled", reason? }     // User cancelled
{ type: "error", message }         // Error occurred
```

**控制器 → 画布：**
```typescript
{ type: "update", config }  // Update canvas configuration
{ type: "close" }           // Request canvas to close
{ type: "ping" }            // Health check
```

## 高级 API

如需以编程方式使用，请导入 API 模块：

```typescript
import { pickMeetingTime, editDocument, bookFlight } from "${CLAUDE_PLUGIN_ROOT}/src/api";

// Spawn meeting picker and wait for selection
const result = await pickMeetingTime({
  calendars: [...],
  slotGranularity: 30,
});

if (result.success && result.data) {
  console.log(`Selected: ${result.data.startTime}`);
}
```

## 要求

- **tmux**：启动画布需要 tmux 会话
- **支持鼠标的终端**：用于基于点击的交互
- **Bun**：用于执行画布命令的运行时

## 技能参考

| 技能 | 用途 |
|-------|---------|
| `calendar` | 日历显示和会议时间选择器的详细信息 |
| `document` | 文档渲染和文本选择 |
| `flight` | 航班比较和座位图的详细信息 |