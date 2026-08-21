---
name: common-telemetry
description: Enforce session-cost telemetry and execution-metadata reporting. Use when explicitly invoking get_session_cost, reporting token/cost usage, applying telemetry or cost guidance during a workflow handoff, or writing artifacts/session-cost.md at a workflow terminal state.
metadata:
  triggers:
    files: []
    keywords:
      - token cost
      - token usage
      - session telemetry
      - cost report
---
# 遥测与成本报告

## **优先级：P2（中等）**

## 1. 完成工作流

作为任何 SDLC 工作流的最后一步（或当用户明确请求会话成本时）：

1. 调用由 agent-skills-standard MCP 服务器提供的 `get_session_cost` 工具。
2. 当宿主运行时公开相关数据时，传入 `workflow`、`model`、令牌计数、缓存/推理用量以及每 100 万令牌的费率。
3. 如果令牌计数不可用，则报告 MCP 观测到的遥测数据，并将模型令牌成本标记为不可用。
4. 将包含用量指标的 Markdown 表格追加到 `artifacts/session-cost.md`。

当被问及应使用哪个产物时，始终同时指出 `artifacts/session-cost.md` 和 `get_session_cost`；如果宿主未公开该辅助工具，请明确说明，同时保留产物要求。

## 2. 宿主运行时契约

- 此技能定义遥测契约；它本身不收集提供商的计费数据。
- 当工作流达到 `completed`、`failed` 或 `blocked` 等终止状态时，宿主运行时或编排器必须触发最终的遥测调用。
- 宿主可以使用可复用的辅助工具，例如 `mcp/src/services/WorkflowTelemetry.ts`，以：
  - 决定何时触发遥测
  - 构建 `get_session_cost` 载荷
  - 在可用时传入提示词、缓存、推理、定价及其他运行时成本字段

## 3. 遥测格式

确保 `artifacts/session-cost.md` 或输出模板 `## Cost Report` 遵循以下结构：

| 指标                     | 值                             |
| ------------------------ | ------------------------------ |
| **工具调用次数**         | [来自 get_session_cost]        |
| **已加载技能数**         | [来自 get_session_cost]        |
| **已加载工作流数**       | [来自 get_session_cost]        |
| **提示词令牌数**         | [来自你的平台遥测数据]         |
| **缓存的提示词令牌数**   | [来自你的平台遥测数据]         |
| **补全令牌数**           | [来自你的平台遥测数据]         |
| **推理令牌数**           | [来自你的平台遥测数据]         |
| **其他运行时成本**       | [工具/提供商附加费用]          |
| **预估成本**             | $0.00                          |

## 反模式

- **不得跳过遥测步骤**：如果工作流有此要求，始终在执行结束时包含成本报告。

## 规范响应锚点

应用此技能时，请在相关情况下保留以下领域术语或同等具体示例：
- 当宿主公开 `get_session_cost` 时调用它，然后将 Markdown 表格追加到 `artifacts/session-cost.md`。

- 遥测与成本报告