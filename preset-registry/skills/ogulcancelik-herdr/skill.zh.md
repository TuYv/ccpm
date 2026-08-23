---
name: herdr
description: "Control Herdr, a terminal multiplexer for coding agents. Use only when the user explicitly mentions Herdr or asks to use Herdr to inspect or control panes, tabs, workspaces, commands, or another agent. Do not use merely because a task could benefit from a background terminal, delegation, or parallel work. Requires HERDR_ENV=1."
---
# Herdr

Herdr 将终端组织到工作区、标签页和窗格中，能够识别窗格内运行的编码智能体，并通过 `herdr` CLI 公开当前会话。

在发出任何控制命令之前，请验证此智能体是否正在 Herdr 管理的窗格内运行：

```bash
test "${HERDR_ENV:-}" = 1
```

如果检查失败，请说明你当前并非在 Herdr 内运行，然后停止。不要从 Herdr 外部检查或控制当前聚焦的 Herdr 会话。

检查通过后，`PATH` 中的 `herdr` 二进制文件会与当前会话通信。使用它来检查相邻任务、创建终端布局、启动智能体和命令、读取输出，以及等待状态变化。

## 了解当前 CLI

已安装的二进制文件是命令语法的权威来源。首先运行：

```bash
herdr --help
```

然后通过运行不带子命令的命令组来输出相关命令组的帮助信息：

```bash
herdr agent
herdr pane
herdr workspace
herdr tab
herdr worktree
herdr terminal
herdr notification
herdr integration
herdr session
```

不要运行不带参数的 `herdr` 来探索命令；它会启动或附加到 TUI。不要通过省略参数来探查具有修改作用的嵌套命令。诸如 `herdr workspace create` 之类的命令使用默认值时也是有效的，并且会直接执行。

大多数控制命令会返回 JSON。请从这些响应中读取标识符和状态，而不是自行推测。

## 了解布局、窗格和智能体

请选择与任务相匹配的基本操作对象：

- 工作区、标签页和窗格拓扑用于组织终端位置。
- 窗格命令用于控制原始终端、shell、测试、服务器、输入和输出。
- 智能体命令用于控制当前占据窗格且已被识别的编码智能体。

无论窗格是否包含智能体，它都独立存在。`agent start` 需要一个现有的可用 shell 窗格，并且绝不会创建、拆分或移动布局。普通进程请使用窗格命令。当 Herdr 必须验证智能体身份或解析 `idle`、`working`、`blocked`、`done` 和 `unknown` 生命周期状态时，请使用智能体命令。

智能体命令接受唯一的活动智能体名称，或当前承载该智能体的窗格 ID。它们不接受终端 ID 或单独的智能体种类标签。名称必须匹配 `[a-z][a-z0-9_-]{0,31}`，并且在活动智能体中唯一。名称会跟随当前窗格占用者，并在该智能体退出、被释放或被替换时清除。

`idle` 表示智能体已准备好接收输入，并且其标签页已在当前聚焦的 Herdr UI 中被查看。`done` 表示后台未查看的任务完成后处于相同的底层空闲状态。聚焦标签页，或通过聚焦命令指定窗格或智能体，会将其标记为已查看。CLI 读取操作不会将其标记为已查看。`blocked` 表示 Herdr 识别到了审批或提问 UI。`unknown` 表示智能体存在，但 Herdr 无法可靠地对其进行分类；这并不能证明任务已完成。

## 使用 ID 和调用者上下文

公共 ID 是不透明且稳定的句柄：

- 工作区：`w1`
- 标签页：`w1:t1`
- 窗格：`w1:p1`

已关闭的标签页和窗格 ID 不会被重复使用。移动到另一个工作区的窗格会获得一个新的、带工作区限定的窗格 ID。执行 `pane move` 后，请继续使用 `.result.move_result.pane.pane_id` 或活动智能体名称。旧值会记录在 `.result.move_result.previous_pane_id` 中；只有被移动进程继承的调用者上下文仍能解析该旧 ID，因此不要将其用作通用的智能体目标。

Herdr 会将调用方的上下文注入每个受管理的窗格：

```bash
printf '%s\n' "$HERDR_WORKSPACE_ID" "$HERDR_TAB_ID" "$HERDR_PANE_ID"
```

当窗格命令应以调用方窗格为目标时，优先使用 `--current`。省略目标可能会使用 UI 当前聚焦的窗格，而该窗格可能属于用户或其他客户端。

使用以下命令发现实时状态：

```bash
herdr workspace list
herdr tab list --workspace "$HERDR_WORKSPACE_ID"
herdr pane current --current
herdr pane list --workspace "$HERDR_WORKSPACE_ID"
herdr agent list
```

创建操作的响应会提供后续要使用的 ID。`workspace create` 返回 `.result.workspace`、`.result.tab` 和 `.result.root_pane`。`tab create` 返回 `.result.tab` 和 `.result.root_pane`。`pane split` 将新窗格作为 `.result.pane` 返回。

## 启动并协调代理

默认在当前标签页中、以当前工作目录创建同级窗格。除非用户明确要求相应的拓扑结构或位置，否则不要创建工作区、标签页、工作树，也不要使用不同的 cwd。

遵循用户要求的方向。否则，检查调用方窗格：

```bash
herdr pane layout --pane "$HERDR_PANE_ID"
```

较宽的窗格向右拆分，较窄或较高的窗格向下拆分。避免沿同一方向反复拆分，以免产生窄到无法使用的列或矮到无法使用的行。将用户焦点保留在调用方窗格中，并明确保留调用方的工作目录：

```bash
herdr pane split --current --direction right --cwd "$PWD" --no-focus
```

适当时，将 `right` 替换为 `down`。从 `.result.pane.pane_id` 读取新窗格 ID。

可用的 shell 窗格必须处于交互式提示符状态，shell 本身位于前台，并且没有正在前台运行的命令、编辑器或代理。使用一个有意义且唯一的名称，在该窗格中启动受支持的代理：

```bash
herdr agent start reviewer --kind codex --pane <returned-pane-id>
```

使用用户要求的 kind。运行 `herdr agent` 以查看已安装的 kind 列表和选项。仅在 `--` 之后传递代理原生参数：

```bash
herdr agent start reviewer --kind codex --pane <returned-pane-id> -- <agent-args...>
```

只有在 Herdr 检测到预期代理位于同一窗格中，并认为其已准备好接收交互式输入后，`agent start` 才会返回。其默认启动超时时间为 30 秒。

通过代理界面提交工作：

```bash
herdr agent prompt reviewer "Review the current diff and report only actionable findings." --wait --timeout 120000
```

`agent prompt` 会以原子方式提交文本和编码后的 Enter，同时遵循窗格实时的括号粘贴模式。对于常规代理工作，使用 `--wait` 即可：它会等待首次进入稳定的 `idle`、`done` 或 `blocked` 状态。不要使用 `--until` 重复指定这些默认值。

从非工作状态发送的提示必须在五秒内产生可观测到的生命周期变化。否则，Herdr 将返回 `agent_prompt_stalled`，而不是无限期等待。此等待跟踪的是生命周期状态，而非单个轮次；如果代理已处于工作状态，当前轮次完成便可能满足等待条件。

仅在针对特定状态的工作流中使用 `--until`，例如等待一个已在运行的代理请求输入：

```bash
herdr agent wait reviewer --until blocked --timeout 120000
```

如果不使用 `--until`，独立的 `agent wait` 会采用与 `agent prompt --wait` 相同的稳定状态默认值。

对交互式代理 UI 控件使用逻辑按键：

```bash
herdr agent send-keys reviewer esc
herdr agent send-keys reviewer ctrl+c
```

Herdr 会在写入任何字节之前验证所有按键。通过解析后的代理读取结果：

```bash
herdr agent get reviewer
herdr agent read reviewer --source recent-unwrapped --lines 120
```

如果等待失败或返回 `blocked`，请先检查 `agent get` 和 `agent read`，再决定发送什么输入。仅在有意进行原始终端控制时使用窗格界面。

## 在另一个窗格中运行普通命令

使用相同的几何布局规则创建一个同级窗格，保留调用方的工作目录，并使用户焦点保持不变：

```bash
herdr pane split --current --direction right --cwd "$PWD" --no-focus
```

从 `.result.pane.pane_id` 读取新窗格 ID，然后运行并检查命令：

```bash
herdr pane run <returned-pane-id> "just test"
herdr pane wait-output <returned-pane-id> --match "test result" --timeout 120000
herdr pane read <returned-pane-id> --source recent-unwrapped --lines 120
```

`pane run` 会以原子方式发送命令文本和 Enter 键。`pane wait-output` 会立即搜索所选快照，因此已存在的输出也可以匹配。使用 `--match <text>` 匹配字面子字符串，或使用 `--regex <pattern>` 匹配 Rust 正则表达式。省略 `--timeout` 可无限期等待。

使用与任务相匹配的读取源：

- `visible`：当前渲染的视口。
- `recent`：最近渲染的输出，包括软换行。
- `recent-unwrapped`：已合并软换行的最近输出；对于日志和对话记录优先使用此项。
- `detection`：用于代理检测的纯文本底部缓冲区快照。

当颜色和终端样式可作为证据时，使用 `--format ansi`。否则使用文本。

`--lines` 会要求 Herdr 从窗格的可用屏幕和宿主回滚缓冲区中返回更多行。如果增加该值仍无法显示已完成响应的更多内容，则该窗格中的代理很可能运行在终端的备用屏幕上。离开备用屏幕的行不会进入 Herdr 的宿主回滚缓冲区，因此增加行数也无法恢复它们。

在此次读取失败后，让代理将其完整响应以 Markdown 格式写入临时目录，并仅回复文件路径，然后直接读取该文件。仅将此方法用作后备方案；不要在初始提示中要求输出到文件。

## 安全与协调规则

- 除非用户要求切换上下文，否则对后台工作使用 `--no-focus`。
- 使用 `--current`、明确的窗格 ID 或唯一的代理名称。不要依赖另一个客户端中获得焦点的窗格。
- 从 JSON 响应中解析 ID。不要根据侧边栏顺序或示例推导 ID。
- 除非用户明确要求，否则不要关闭并非由你创建的工作区、标签页、窗格或会话。
- 除非用户明确意图停止服务器及其窗格进程，否则绝不要从活动会话中运行 `herdr server stop`。
- 绝不要终止 Herdr 主进程。对于需要隔离服务器的实验，请使用具名测试会话。
- CLI 服务器错误会以 JSON 格式写入 stderr，并以状态码 1 退出。CLI 语法错误以状态码 2 退出。