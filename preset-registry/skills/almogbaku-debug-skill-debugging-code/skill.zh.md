---
name: debugging-code
description: Interactively debug source code — set breakpoints, step through execution line by line, inspect live variable state, evaluate expressions against the running program, and navigate the call stack to trace root causes. Use when a program crashes, raises unexpected exceptions, produces wrong output, when you need to understand how execution reached a certain state, or when print-statement debugging isn't revealing enough.
allowed-tools: Bash(dap *)
---
# 交互式调试器

当程序崩溃、产生错误输出，或者你需要确切了解执行过程如何到达某一特定状态时使用——并且重新运行程序、添加更多打印语句无法足够快地给出答案。

你可以随时暂停正在运行的程序，读取该时刻的实时变量值和调用栈，逐行向前执行或跳转到下一个断点，并针对实时进程计算任意表达式——所有这些操作都无需重新启动程序。

## 设置

此技能使用 `dap`，这是一个 CLI 工具，它通过后台守护进程使用 DAP Protocol 与调试器交互并维护调试器状态，因此你只需通过多次调用即可与调试器交互。

如果尚未安装 `dap`（检查：`command -v dap`），请立即安装。
继续安装前，请先询问/通知用户。

通过 Homebrew 安装（macOS）

```bash
brew install AlmogBaku/tap/dap
```

安装脚本：

```bash
bash scripts/install-dap.sh
```

从源代码安装：

```bash
go install github.com/AlmogBaku/debug-skill/cmd/dap@latest
```

此工具已开源并托管在 [GitHub](https://github.com/AlmogBaku/debug-skill) 上，由专人维护并遵循最佳实践。

原生支持 Python、Go、Node.js/TypeScript、Rust、C/C++，以及任何其他支持 DAP 的语言。

如果缺少调试器后端或后端启动失败，请参阅 `references/installing-debuggers.md`

如需查看所有命令和标志：`dap --help` 或 `dap <cmd> --help`。

## 启动会话

`dap debug <file>` 会在调试器中启动程序。后端会根据文件扩展名自动检测。

根据你已掌握的信息选择启动策略：

- **已有假设**——在你预期出现错误的位置设置断点：`dap debug script.py --break script.py:42`
- **条件断点**——仅在满足条件时停止：`dap debug script.py --break "script.py:42:x > 5"`（
  包含条件的规范始终要用引号括起来）
- **多文件应用程序**——在多个模块中设置断点：`--break src/api/routes.py:55 --break src/models/user.py:30`
- **没有假设，程序较小**——从入口开始逐步执行：`dap debug script.py --stop-on-entry`（大型项目应避免使用——
  启动代码会产生大量干扰；请改用断点进行二分排查）
- **异常，位置未知**——`dap debug script.py --break-on-exception raised`（Python）/ `all`（Go/JS）
- **远程进程**——`dap debug --attach host:port --backend <name>`
- **进程已在运行（服务器卡住、线上问题）**——无需重启即可附加：
  `dap debug --pid <PID> --backend <name>`
  > **macOS + Go 注意事项：** `dlv --pid` 要求禁用 SIP（`csrutil disable`）。
  > 建议改为在调试器中启动程序，或附加到远程调试器！

**会话隔离：** `--session <name>` 可防止并发代理相互干扰。
提示：如果可用，你可能希望使用你的会话 ID（${CLAUDE_SESSION_ID}）。

运行 `dap debug --help` 查看所有标志、后端和示例。

## 调试思维

当仅阅读源代码无法验证根本原因时，请使用调试器。
调试器让你能够*观察*实际*发生*的情况：真实的值、真实的路径、真实的状态。
当实际情况偏离*应当*发生的情况时，你就找到了错误。

**两次碰壁，就要重新思考。** 如果两个假设在同一位置都失败了，说明你的思维模型有误。
重新阅读代码，提出一个使用不同断点的、*完全不同*的理论。

**逐步升级。** 先使用 `dap eval` 快速检验假设。使用条件断点
过滤干扰。只有在需要交互式控制时，才退回到完整断点加单步执行。

**模拟用户操作路径。** 如果你正在调试一个用户流程，请沿着你预期代码会经过的路径设置断点。
如果你原本预期 `compute()` 会被调用，但它从未被调用，那么错误就在调用方——不是 `compute()`，而是原本
应该调用它的代码。

**用断点代替打印。** 当你想打印某些内容时，改为设置断点。

## 了解当前状态

每条 `dap` 执行命令都会自动返回完整上下文：当前位置、源代码、局部变量、调用栈和
输出。每次暂停时，都要问：

- 局部变量的值是否符合预期？
- 调用栈显示的代码路径是否符合预期？
- 到目前为止的输出是否揭示了任何意外情况？

**沿调用栈向上追溯因果关系。** 如果第 0 帧中的值有误，请使用 `dap eval "<expr>" --frame 1` 查看
调用方传入了什么。继续向上检查（`--frame 2`、`--frame 3`），直到找到该值最初出错的栈帧——
那里才是错误的源头，而不是症状。

暂停时的输出示例：

```
Stopped at compute() · script.py:41
  39:   def compute(items):
  40:       result = None
> 41:       return result
Locals: items=[]  result=None
Stack:  main [script.py:10] → compute [script.py:41]
Output: (none)
```

如果程序在命中断点前退出：

```
Program terminated · Exit code: 1
```

→ 将断点前移，或使用 `--stop-on-entry` 重新启动。

## 提出假设

设置断点前：*"我认为错误位于 X，因为 Y。"* 好的假设应当是可证伪的——你的下一次
观察将确认或推翻它。还没有假设？使用两个断点进行二分，以缩小搜索范围，或
参阅上面的起步策略。

## 有策略地设置断点

- 在问题*开始*的位置设置断点，而不是在问题*显现*的位置
- 第 80 行出现异常？根本原因在上游——从更早的位置开始
- 不确定？进行二分：`--break f:20 --break f:60`——判断错误状态出现在前半段还是后半段，即可将搜索范围缩小一半

**断点应设置在：**

- **边界**——数据跨越格式、表示形式或模块边界的位置；这里的状态最清晰
- **状态转换**——为损坏的值赋值或对其进行修改的代码行
- **错误分支**——输入导致程序进入错误路径的条件
- **反模式**——不要在库代码内部设置断点；应改在调用处设置。不要在
  紧密循环中使用无条件断点——应使用条件断点。

### 在会话过程中管理断点

随着了解的深入，在可疑代码的更深处添加断点，并移除那些已经
完成使命的断点——无需重新启动即可逐步缩小范围：

```bash
dap continue --break app.py:50              # add breakpoint deeper, then continue
dap continue --remove-break app.py:20       # drop a breakpoint you're done with
dap break add app.py:42 app.py:60           # add multiple breakpoints at once
dap break list                              # see what's set
dap break clear                             # start fresh
```

如果断点位于无效行，或适配器对其进行了调整，`dap` 会在输出中发出警告。

### 条件断点

仅在条件为真时停止——这对于循环、热点路径和特定输入值至关重要。
语法：`"file:line:condition"`（始终使用引号）。

```bash
dap debug app.py --break "app.py:42:i == 100"            # skip 99 iterations, stop on the one that matters
dap debug app.py --break "app.py:30:user_id == 123"      # reproduce a user-specific bug
dap continue --break "app.py:50:len(items) == 0"         # catch the empty-list case mid-session
```

### 不变量断点

将条件断点用作运行时断言——在问题发生的*那一刻*停止：

```bash
dap debug app.py --break "bank.py:68:balance < 0"          # catch the overdraft
dap debug app.py --break "pipe.py:30:type(val) != int"     # type violation
```

## 控制执行流程

每次停止时，根据你的怀疑选择如何继续：

如果你连续单步执行超过 3 次，那么你需要的是断点，而不是更多次单步执行。

```bash
dap step                         # step over — trust this call, advance to next line
dap step in                      # step into — suspect what's inside this function
dap step out                     # step out — you're in the wrong place, return to caller
dap continue                     # jump to next breakpoint
dap continue --to file:line      # run to line (temp breakpoint, auto-removed)
dap context                      # re-inspect current state without stepping
dap output                       # drain buffered stdout/stderr without full context
dap inspect <var> --depth N      # expand nested/complex objects
dap pause                        # interrupt a running/hanging program
dap restart                      # restart with same args and breakpoints
dap threads                      # list all threads
dap thread <id>                  # switch thread context
```

每次停止都会显示当前的 `file:line`，因此你始终知道自己位于何处。

使用 `dap eval "<expr>"` 探查实时状态，而无需单步执行：

```bash
dap eval "len(items)"
dap eval "user.profile.settings"
dap eval "expected == actual"       # test hypothesis on live state
dap eval "self.config" --frame 1    # frame 1 = caller (may be a different file)
```

避免使用会调用具有副作用的方法的 eval 表达式——它们会改变程序状态，并可能破坏你的调试
会话。除非你是在有意测试修复方案，否则应坚持只进行只读访问。

## 向前跳转

当你想快速查看特定行，又不想设置永久断点时，请使用
`dap continue --to file:line`。它是一个一次性断点——停止一次后便会消失。适用于
“我只想看看第 50 行的 `x` 是什么样”这类无需管理断点生命周期的场景。

## 高级场景

有关高级场景——程序挂起、并发错误、深层嵌套状态、循环二分定位——
请参阅 `${CLAUDE_SKILL_DIR}/references/advanced-techniques.md`。

## 演练

**错误：`compute()` 返回 `None`**

```
Hypothesis: result not assigned before return
→ dap debug script.py --break script.py:41
  Locals: result=None, items=[]   ← wrong, and input is also empty

New hypothesis: caller passing empty list
→ dap eval "items" --frame 1      → []   ← confirmed
→ dap step out                    → caller at line 10, no guard for empty input
→ dap continue --break script.py:8 --remove-break script.py:41
  ← narrowing: add breakpoint at data source, drop the one we're done with
  Stopped at main():8, items loaded from config as []

Root cause: missing guard. Fix → dap stop.
```

**没有假设（异常，位置未知）：**

```
Exception: TypeError, location unknown
→ dap debug script.py --break-on-exception raised
  Stopped at compute():41, items=None
Root cause: None passed where list expected.
```

## 验证修复

在程序因 bug 暂停时，使用 `eval` 根据实时状态测试你提出的修复表达式。如果它在
eval 中有效，那么在代码中也会有效。然后编辑代码并执行 `dap restart`，进行端到端确认。

应用修复后，重新运行相同场景进行验证。`dap restart` 会使用相同的参数和
断点重新运行，从而形成快速反馈循环。在发现 bug 的同一断点处观察到正确行为之前，不要相信
修复已经生效。

## 清理

当程序退出或空闲超时后，`dap` 会话通常会自动终止。
当应用程序未正确关闭时（例如，你在调试期间终止了它），可以手动终止会话：`dap stop`。