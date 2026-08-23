---
name: autopilot-pane-control
description: OpenAgents desktop pane and CAD control for Codex via openagents.* tool calls.
metadata:
  oa:
    project: openagents
    identifier: autopilot-pane-control
    version: "0.1.0"
    expires_at_unix: 1798761600
    capabilities:
      - codex:tool-call
      - desktop:pane-control
      - cad:intent-control
---
# Autopilot 窗格控制

当用户请求需要在 OpenAgents 中操作桌面窗格和/或更改 CAD 状态时，请使用此技能。

## 何时使用

- 打开/聚焦/关闭窗格以准备 UI 状态。
- 填写窗格输入并触发窗格操作。
- 应用 CAD 意图/操作。

## 工具约定

仅使用以下工具：

- `openagents.pane.list`
- `openagents.pane.open`
- `openagents.pane.focus`
- `openagents.pane.close`
- `openagents.pane.set_input`
- `openagents.pane.action`
- `openagents.cad.intent`
- `openagents.cad.action`

详细的模式定义和示例位于：

- `docs/codex/CODEX_PANE_CAD_TOOLING.md`
- `references/tool-cheatsheet.md`

## 操作规则

1. 如果窗格状态未知，先使用 `openagents.pane.list`。
2. 设置输入之前，打开/聚焦所需窗格。
3. 使用确定性的操作名称，并在选择行时提供 `index`。
4. 对于 CAD 编辑，优先使用结构化的 `intent_json`，而不是含义不明确的提示文本。
5. 更改状态后，通过带有 `snapshot` 的 `openagents.pane.action` 读回状态以进行确认。

## 最小操作序列

### 钱包发票操作序列

1. 对钱包使用 `openagents.pane.open`
2. `openagents.pane.set_input` -> `invoice_amount`
3. `openagents.pane.action` -> `create_invoice`

### CAD 操作序列

1. 对 CAD 使用 `openagents.pane.open`
2. 使用带有 `intent_json` 的 `openagents.cad.intent`
3. 使用 `openagents.cad.action` 执行视图/渲染/时间线操作