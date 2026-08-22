---
name: e2e-scenario-testing
description: Use when verifying a running application end-to-end through its real interface — a web UI, a CLI, or a TUI — by writing and executing agent-run "scenario cards" against a freshly built instance with falsifiable assertions. Trigger on "test it end to end", "prove the UI actually works", "write/run a scenario", or after a change touches a user-facing surface that unit tests can't fully cover. Not for unit tests, pure code review, or API-only checks.
---
# 端到端场景测试

通过像用户一样操作正在*运行中*的应用程序真实界面，验证其行为是否符合宣称。工作单元是**场景卡片**：一种简短的 Markdown 测试，由智能体负责执行，而不是 Playwright/expect 脚本。卡片足够高层，不会因小幅 UI 调整而失效；同时又足够精确，确保两个智能体运行同一张卡片时能够得出相同的结论。

绿色通过的单元测试证明各部分在隔离状态下的连接正确。场景则证明这些连接在*完成组装并渲染后*仍然正确。它们能捕获不同类型的缺陷——即使单元测试已经通过，也要编写场景卡片。

## 何时使用

- 某项功能涉及面向用户的界面元素（按钮、命令面板命令、状态指示器、快捷键、渲染后的消息），并且你希望证明它在实际运行时有效。
- 用户要求“进行端到端测试”／“证明 UI 正常工作”／“运行一个场景”。
- 你修改了某个层（投影、能力门控、渲染器），而其效果只能在组装完成的 UI 中观察到。

不要将它用于没有 UI 界面的逻辑（应对其进行单元测试），也不要在生产环境门控导致实际运行路径不可达时使用（参见下文的*过度指定*）。

## 卡片格式

一张卡片 = 一个 `.md` 文件。保留以下各节；如果场景很简单，可以将任意一节压缩为一行。不要填充无用内容。

```markdown
# <area>-<behavior>: one-line title

**What this covers**: the feature + the specific commits/IDs it exercises.
If something else breaks this, it should be caught here.

## Pre-state
What must be true before starting: a freshly built instance running, auth/creds
in place, a clean workdir. Give the exact commands to reach it.

## Steps
Numbered actions described by **intent**, each with the concrete command or
tool call and a real UI label (prefer labels the user sees over brittle
selectors like `#nav > li:nth-child(3)`).

## Expected
For each step, what you should observe — and the **falsification condition**:
"if you see X instead, the test fails." Silence is not success.

## Cleanup
Idempotent teardown so reruns are hermetic. Never touch state you didn't create.

## Sharp edges
Footguns, timing/ordering caveats, nondeterminism noted while recording.
```

## 运行卡片

1. **基于待测试代码进行全新构建。** 最常见的错误就是测试了过时的二进制文件。重新构建改动所涉及的每一层（服务端、客户端、嵌入式资源），并确认正在运行的是新实例，而不是某人昨天遗留下来的进程。
2. **进行隔离。** 在隔离的工作目录中运行。如果应用持有主机级单例资源（锁、固定端口、共享状态目录），请让测试实例使用自己的副本——例如覆盖 `$HOME`/state-dir/port——这样它既不会与真实实例冲突或污染真实实例，也不会受到真实实例的污染。使用符号链接共享只读输入（creds、tokens）；将可变状态分开保存。
3. **操作界面**（具体方法见下文）。
4. **依据权威记录进行断言，而不只是查看像素。** UI 可能显示错误或存在延迟；磁盘状态／日志／数据库才是事实依据。当断言存在歧义时，应使用这些记录交叉核对渲染出的结果。
5. **留存证据**——截图、捕获的窗格内容、磁盘上的产物。
6. **清理**——关闭你启动的进程，删除临时目录，让预先存在的实例继续运行且不受影响。

## 驱动 Web UI（浏览器）

使用 Chrome/CDP 浏览器工具。完成身份验证并导航后，尽可能通过针对应用自身 JS 入口点执行 `eval` 来驱动页面，而不是模拟点击——这种方式对布局变化更加稳健。

- **乐观状态与稳定状态断言**：触发操作但*不要等待它完成*，先获取一次同步 DOM 快照（待处理占位符在*此刻*存在），然后等待操作完成并再次获取快照。如果没有这次不等待的捕获，就无法区分“先渲染再协调”与“从未渲染”。
- 从 `eval` 返回**纯字符串**（使用 `\n` 拼接你的发现）；某些桥接器会将返回的对象字符串化为 `[object Object]`。
- 当 DOM 含义不明确时，通过应用的单例（`window.<App>?.state` 等）检查内部状态。

## 驱动 CLI / TUI（tmux）

每个场景使用各自命名的 tmux 会话（清理操作需要确定性的名称）。固定尺寸以获得确定性的捕获结果；如果应用提供纯文本/内联模式，优先使用该模式。

```bash
tmux new-session -d -s <name> -x 200 -y 50 "<cmd> 2>/tmp/<name>-stderr.log"
tmux send-keys -t <name> -l "literal text"   # -l = no key-name parsing (paths, slashes)
tmux send-keys -t <name> Enter
tmux capture-pane -t <name> -p                # -p = plain text; add -e only for styling
```

- 对用户输入的字符串始终使用 `-l`；如果不使用，`/foo/bar` 会被解析为转义序列。
- 轮询 `capture-pane` 以查找状态字符串；grep **字形/单词**，而不是颜色。
- 将 stderr 重定向到文件——panic 和调试探针会出现在那里，而不是窗格中。

## 来之不易的原则

- **始终进行证伪。** 每个断言都要说明失败是什么样子。无法失败的步骤什么也证明不了。观察结果时，应确保检查会在失败路径上触发，而不只是在成功路径上触发。
- **验证*正确的*表层。** 同一个概念通常存在于多个层级（内部能力与其 REST 投影；模型字段与渲染出的标签）。确认断言读取的是实际承载该信号的表层——所谓“缺失”的值通常存在于相邻层级。
- **存在但不可见 ≠ 不存在。** 可滚动主体、虚拟化列表以及自动滚动到底部，通常会把真实存在的元素推到捕获窗口之外。在断定某个内容没有渲染之前，先滚动/展开到它应当出现的位置。当视觉内容难以捕获时，通过同级读取（读取相同状态的状态命令）进行确认。
- **执行卡片就是在测试卡片。** 应当预期在自己的场景中发现错误——错误的选择器、错误的层级、UI 无法展示的断言。边执行边修复卡片；一张因为检查毫无实质作用而“通过”的卡片，比没有卡片更糟。
- **过度指定陷阱。** 卡片可能会描述一条被生产环境门控机制阻止的路径（例如，在当前模式下不起作用的快捷键绑定）。应在源代码中确认门控条件，而不是通过 UI 与之对抗；使用单元测试验证底层行为，并在卡片中注明该门控条件。
- **清理是测试的一部分。** 只关闭一半的服务集群会导致下一次运行的轮询返回误报。确保拆卸操作具有幂等性，并且其范围仅限于你创建的内容。

## 收尾

将每项断言报告为通过/失败，并附上具体观察结果（渲染出的文本、磁盘上的值），而不是“看起来不错”。如果某个卡片失败，请记录证据，并修复该错误或提交缺陷；不要弱化结论。