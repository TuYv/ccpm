---
name: cmux-workspace
description: "Work inside the current cmux workspace and terminal. Use for cmux workspace, current workspace, caller surface, panes, surfaces, socket targeting, and non-interfering cmux automation."
---
# cmux 工作区

将工作范围限定在调用该代理的 cmux 工作区内。

- **窗口**：一个 macOS cmux 窗口。
- **工作区**：侧边栏中的一个条目。UI 将其称为标签页；CLI/socket API 将其称为工作区。
- **窗格**：工作区内的一个拆分区域。
- **表面**：窗格内的一个标签页，可以是终端或浏览器。
- **面板**：表面内的内部内容类型。优先使用 CLI 表面命令，而非面板内部机制。

## 默认规则

除非用户明确要求操作其他工作区、其他窗口或全局状态，否则将操作范围限定在当前调用方工作区。不要假定视觉上获得焦点的工作区就是正确目标：代理可能运行在一个工作区中，而用户正在查看另一个工作区。

```bash
printf 'workspace=%s\nsurface=%s\nsocket=%s\n' \
  "${CMUX_WORKSPACE_ID:-}" "${CMUX_SURFACE_ID:-}" "${CMUX_SOCKET_PATH:-}"
cmux identify --json
```

`CMUX_WORKSPACE_ID` 是默认的工作区锚点，`CMUX_SURFACE_ID` 是默认的调用方终端锚点。如果缺少这些变量，则回退到使用 `cmux identify --json`，并明确说明你正在使用当前获得焦点的上下文。

## 非干扰式自动化

将布局和焦点视为相互独立的事项。`select-workspace`、`focus-pane`、`focus-panel` 以及会更改焦点的 `tab-action` 动作都是会影响用户的操作，就像点击一样。切勿试探性地调用它们，即使是在调用方自己的工作区内，因为用户此时可能正在查看其他位置。

使用能够创建已填充正确表面的窗格的命令，一次性以增量方式构建布局：

```bash
cmux new-pane --workspace "${CMUX_WORKSPACE_ID}" --type browser --direction right --url "http://127.0.0.1:8765"
cmux new-pane --workspace "${CMUX_WORKSPACE_ID}" --type terminal --direction down
```

避免使用“创建后再移动、再聚焦”的命令链。只要动作支持，就传入 `--focus false`（`move-surface --focus false` 可保持用户的注意力不受干扰；未来可能有更多命令支持该标志，参见 https://github.com/manaflow-ai/cmux/issues/1418 和 https://github.com/manaflow-ai/cmux/issues/2820）。如果布局命令拒绝有效的 `surface:` 或 `pane:` 引用，请报告该错误并停止操作，而不是通过更改焦点来绕过问题。

## 右侧辅助窗格

对于辅助输出（预览应用、TUI、日志、一次性 shell、浏览器检查），复用调用方终端右侧的一个辅助窗格。首先使用 `cmux identify --json`、`cmux list-panes` 和 `cmux list-pane-surfaces` 进行检查，然后：

- 辅助窗格已存在：向其中添加一个表面。
  ```bash
  cmux new-surface --workspace "${CMUX_WORKSPACE_ID:-}" --pane pane:<helper> --type terminal --focus false
  ```
- 不存在辅助窗格：只创建一个。
  ```bash
  cmux new-pane --workspace "${CMUX_WORKSPACE_ID:-}" --type terminal --direction right --focus false
  ```
- 存在多个明显由同一自动化流程遗留的辅助窗格，并且用户要求整理：保留一个并清理重复项。切勿关闭无法确信是陈旧辅助输出的窗格。

通过显式的表面引用向新建或复用的表面发送命令。重复的“打开它”请求应在现有的右侧辅助窗格内创建标签页，而不是创建更多拆分区域。

## 调用方终端

调用代理的界面是执行相对操作时最安全的锚点。

```bash
cmux send "npm test\n"                                    # focused terminal in caller workspace
cmux send --surface "${CMUX_SURFACE_ID:-}" "git status\n"  # exact caller surface
cmux send-key --surface "${CMUX_SURFACE_ID:-}" enter
```

除非用户明确指定目标，否则不要向其他工作区发送按键、关闭界面或更改焦点。

## 移动界面

```bash
cmux move-surface --surface "${CMUX_SURFACE_ID}" --before surface:3   # also --after, --index
cmux move-surface --surface surface:240 --pane pane:172 --focus false
cmux drag-surface-to-split --surface surface:240 down
```

已知的小问题：`drag-surface-to-split` 会通过 V1 处理，并根据 UI 焦点解析工作区，因此当调用方的工作区并非视觉上获得焦点的工作区时，它会失败并返回 `ERROR: Surface not found`（https://github.com/manaflow-ai/cmux/issues/1901，相关问题：https://github.com/manaflow-ai/cmux/issues/3189）。在该问题解决之前，请以增量方式构建布局。绝不要调用 `focus-pane` 或 `focus-panel` 来尝试从移动失败中恢复；应报告失败并停止。

## 侧边栏状态

将状态、进度和日志附加到当前工作区，以便侧边栏反映此任务。

```bash
cmux set-status build "running" --workspace "${CMUX_WORKSPACE_ID:-}" --color "#ff9500"
cmux set-progress 0.4 --label "Building" --workspace "${CMUX_WORKSPACE_ID:-}"
cmux log --workspace "${CMUX_WORKSPACE_ID:-}" --level info -- "Started build"
cmux sidebar-state --workspace "${CMUX_WORKSPACE_ID:-}" --json
```

## 贡献者重新加载

对于 cmux 源码检出中的 cmux 应用或运行时更改，请从当前活跃的工作树执行带标签的重新加载。它会创建隔离的应用名称、Bundle ID、调试套接字和 DerivedData 路径。绝不要构建或启动未带标签的 `cmux DEV`。

```bash
./scripts/reload.sh --tag <short-tag>
CMUX_SOCKET_PATH=/tmp/cmux-debug-<short-tag>.sock cmux identify --json
```

## 套接字访问

在使用任何默认值之前，请先使用 cmux 提供的套接字路径：`SOCK="${CMUX_SOCKET_PATH:-/tmp/cmux.sock}"`。套接字访问可能处于关闭状态、仅限 cmux 启动的进程，或向所有本地进程开放。如果命令无法连接，请先检查 `cmux capabilities --json` 和 `cmux ping`，再更改设置。

## 规则

- 默认在调用方工作区中操作；对于会产生变更的操作，即使已设置环境变量，也应优先显式使用 `--workspace` 和 `--surface` 标志，以便自动化过程可审计。
- 除非用户明确要求，否则绝不要调用 `focus-pane`、`focus-panel`、`select-workspace` 或会更改焦点的 `tab-action` 动词。
- 在 `move-surface` 以及任何支持该参数的创建命令中传入 `--focus false`。
- 使用 `new-pane --type ... --url ...` 以增量方式构建布局，而不是先创建、再移动、再聚焦。
- 如果 CLI 命令拒绝有效的界面或窗格引用，请报告该问题。不要通过聚焦来规避。
- 除非用户明确指定目标，否则不要关闭、聚焦、移动其他工作区中的内容，也不要向其中发送输入。
- 在聊天和示例中使用短引用；UUID 仅用于日志、持久化或调试。

## 参考资料

- [references/commands.md](references/commands.md)：完整的工作区、窗格、界面、通知和实用工具命令列表。
- [../cmux-browser/SKILL.md](../cmux-browser/SKILL.md)：遵循同一当前工作区规则的浏览器界面。