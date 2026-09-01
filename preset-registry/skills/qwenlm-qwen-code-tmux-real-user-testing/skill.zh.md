---
name: tmux-real-user-testing
description: This skill should be used when the user asks to "用 tmux 做真实测试", "保存 tmux 日志", "像真实用户一样测试 Qwen", "生成可复查的 TUI 测试报告", "测试 slash command 交互", or requests a tmux-based real user E2E run with complete readable logs. It guides real TUI usage with step-by-step capture-pane snapshots rather than ANSI raw pipe logs.
---
# tmux 真实用户测试

像用户一样，在真实的 tmux TUI 会话中运行 Qwen Code：浏览对话框、
触发斜杠命令、执行工作流，并保存一份可读日志，供维护者查看。当目标不仅是
判断通过或失败，而是生成一份展示屏幕上发生了什么的叙事性产物时，优先使用此工作流。

## 核心原则

将 tmux 用作真实使用场景的测试工具。使用符合实际的键盘操作驱动 TUI，
然后在每次有意义的状态变化后，使用 `tmux capture-pane -p` 保存逐步的可读记录。

避免将 `tmux pipe-pane` 作为主要报告方式。`pipe-pane` 会捕获 React Ink TUI 输出中的原始
ANSI/控制流，将其作为纯文本打开时通常会显示为乱码。仅将 `pipe-pane` 用作可选的取证产物。
将 `tmux-readable-full.log` 作为主要交付物。

## 使用时机

在以下情况下使用此工作流：

- TUI 行为、渲染、对话框、键盘导航、斜杠命令或身份验证流程。
- 维护者希望事后阅读完整过程的真实工作流。
- 回归测试，其中最终状态不足以完成验证，而中间界面很重要。
- 面向用户的流程，例如 `/auth`、`/model`、`/manage-models`、MCP 设置、
  权限、引导流程或交互式错误恢复。

仅当需要对工具执行或模型 API 行为进行结构化断言时，才改用无头 JSON E2E。

## 标准产物布局

在项目的 `tmp/` 下创建带时间戳的目录：

```text
tmp/<scenario>-tmux-YYYYMMDD-HHMMSS/
├── tmux-readable-full.log   # 主要报告：逐步的可读快照
├── tmux-final-capture.log   # 仅包含最终屏幕
├── current-pane.txt         # 最新轮询/快照的临时文件
└── report.md                # 包含结果和产物指针的简短摘要
```

不要覆盖之前的运行结果。除非用户明确要求进行脱敏或裁剪，否则请保留完整日志。

## 推荐的辅助脚本

使用 `scripts/tmux-real-user-log.sh`，避免重复编写 shell 胶水代码。该脚本可以
启动会话、追加带标签的快照、发送按键、等待文本并完成收尾。

`start` 命令会输出 `export` 语句——使用 `eval` 直接在 shell 中设置变量：

```bash
eval "$(bash .qwen/skills/tmux-real-user-testing/scripts/tmux-real-user-log.sh \
  start <scenario> . npm run dev -- --approval-mode yolo)"
# → $SESSION、$OUTDIR、$LOG 现在可用
```

在运行新场景前，先显示完整用法：

```bash
bash .qwen/skills/tmux-real-user-testing/scripts/tmux-real-user-log.sh help
```

## 手动工作流

### 1. 启动 TUI

使用较大的 tmux 视口，以便对话框能够完整渲染。在交互之前等待 TUI 完成渲染——
不要盲目休眠，而是轮询已知的启动字符串：

```bash
TS=$(date +%Y%m%d-%H%M%S)
PROJECT_ROOT="$(pwd)"
OUT="$PROJECT_ROOT/tmp/<scenario>-$TS"
SESSION="<scenario>-$TS"
mkdir -p "$OUT"
tmux new-session -d -s "$SESSION" -x 200 -y 50 \
  -c "$PROJECT_ROOT" \
  "npm run dev -- --approval-mode yolo"

# 轮询直到 TUI 就绪（调整正则表达式以匹配应用的启动行）
for i in $(seq 1 30); do
  sleep 1
  if tmux capture-pane -t "$SESSION" -p -S -100 | grep -q "Ready\|>"; then
    break
  fi
done
```

仅在验证构建后的 bundle 时，使用 `node dist/cli.js`，不要使用 `npm run dev`。仅在复现用户报告的已安装版本 bug 时，使用全局安装的 `qwen`。

### 2. 追加带标签的可读快照

每次有意义的操作之后，将一个章节标题和 `capture-pane -p` 的输出追加到完整日志中：

```bash
LOG="$OUT/tmux-readable-full.log"
{
  printf '\n===== 01 /auth dialog =====\n'
  tmux capture-pane -t "$SESSION" -p -S -240
} >> "$LOG"
```

随着会话内容增长，增大 `-S` 的值（每个章节增加约 100 行）。关键在于每个章节都是渲染后的画面，而不是原始 ANSI 输出。

### 3. 像用户一样发送按键

将输入和 Enter 分开，避免提交操作被吞掉：

```bash
tmux send-keys -t "$SESSION" "/auth"
sleep 0.5
tmux send-keys -t "$SESSION" Enter
sleep 2
```

导航时：

```bash
tmux send-keys -t "$SESSION" Down
tmux send-keys -t "$SESSION" Space
tmux send-keys -t "$SESSION" Escape
```

向 Ink 字段输入文本时，如果批量输入未被处理，优先逐个发送按键：

```bash
tmux send-keys -t "$SESSION" e n a b l e d
```

### 4. 轮询完成状态，而不是盲目等待

使用屏幕上的文本作为完成条件。超时时，导出当前窗格，以便日志记录等待过期时屏幕上显示的内容：

```bash
for i in $(seq 1 60); do
  sleep 2
  tmux capture-pane -t "$SESSION" -p -S -400 > "$OUT/current-pane.txt"
  if grep -q "Successfully configured\|Error\|failed" \
    "$OUT/current-pane.txt"; then
    break
  fi
done
# 始终将最后一次轮询结果（匹配成功或超时）追加到日志中
{
  printf '\n===== 04 auth result =====\n'
  cat "$OUT/current-pane.txt"
} >> "$LOG"
```

### 5. 干净地结束

捕获最终画面，将其追加到日志中，然后终止会话：

```bash
tmux capture-pane -t "$SESSION" -p -S -10000 > "$OUT/tmux-final-capture.log"
{
  printf '\n===== final capture before cleanup =====\n'
  cat "$OUT/tmux-final-capture.log"
} >> "$LOG"
tmux kill-session -t "$SESSION"
```

## 报告要求

编写 `report.md`，包含：

- 日期、tmux 会话名称、命令、工作区。
- 场景范围和测试的确切步骤。
- PASS/FAIL 结果。
- 关键屏幕观察结果和重要状态转换。
- 工件列表，并将 `tmux-readable-full.log` 标记为主要日志。
- 任何已知副作用，例如设置更新、打开的浏览器窗口或 API 调用。

确保断言都与日志中的证据相关联。优先使用“日志章节
`07 toggle model on` 显示 `16 enabled`”之类的表述，而不是没有依据的总结。

## 设计测试场景

一个好的场景是一系列线性的、可观察的状态转换。将其设计为一系列步骤，使每一步都产生可捕获的 TUI 输出：

1. **入口点** — 启动流程的斜杠命令或操作。
2. **分支点** — 需要使用导航按键（Arrow、Space、Enter）的对话框或选择器。
3. **等待状态** — 需要使用 `wait-for` 轮询的加载画面、身份验证回调或异步操作。
4. **确认** — 屏幕上显示的、标志流程完成的成功/错误文本。
5. **副作用** — 流程触发的外部操作（打开浏览器、写入文件、修改配置），这些操作可能会影响后续运行。

对于每个步骤，定义：

- 要发送的**按键**（`/auth`、`Down`、`Enter` 等）
- 要等待的**预期文本**（`Successfully configured`、`Error`、`Saved`）
- 何时进行**快照**（每次交互之前和之后）

### 简短示例：测试 /auth → OAuth

```bash
HELPER=.qwen/skills/tmux-real-user-testing/scripts/tmux-real-user-log.sh

# Start
eval "$(bash "$HELPER" start auth-test . npm run dev -- --approval-mode yolo)"
# → prints SESSION=... OUTDIR=...

# Trigger /auth, navigate to OAuth provider
bash "$HELPER" type-submit "$SESSION" /auth
bash "$HELPER" snapshot "$SESSION" "$OUTDIR" "01 auth menu"
bash "$HELPER" send "$SESSION" Down Down Enter
bash "$HELPER" snapshot "$SESSION" "$OUTDIR" "02 provider selected"

# Wait for OAuth flow to complete (may involve browser interaction)
bash "$HELPER" wait-for "$SESSION" "$OUTDIR" "Successfully configured|Error|failed"
bash "$HELPER" snapshot "$SESSION" "$OUTDIR" "03 auth result"

# Finish
bash "$HELPER" finish "$SESSION" "$OUTDIR"
```

对于涉及浏览器 OAuth 回调的流程，用户完成浏览器步骤后，`wait-for` 轮询将捕获结果。如果该流程要求 LLM 自行打开浏览器，请在场景设计中记录这一副作用。

## 安全与隐私

删除日志或还原设置前请先询问。如果用户明确要求完整日志，默认不要进行清理。如果日志可能会被分享给外部人员，请提供单独的清理副本，而不是修改原始日志。

开始前说明可能产生的副作用：OAuth 可能会打开浏览器、写入 Qwen 设置、设置 API 密钥配置，并更新模型提供商条目。

## 常见陷阱

- 在 macOS 上执行 `open <file>` 后终端没有输出是正常现象；它会在关联的应用中打开该文件。
- `tmux-final-capture.log` 只包含最后一个屏幕；它不是完整的操作过程。
- `tmux-readable-full.log` 是可用于报告的产物。
- `tmux pipe-pane` 原始日志可能包含 ANSI 控制序列，看起来会乱码。
- 搜索框和输入字段有时会忽略批量文本；请逐个发送字符。
- `capture-pane` 记录的是当前渲染状态，而不是短暂的闪烁内容。
- 每次运行都使用带时间戳的输出目录，以避免覆盖证据。