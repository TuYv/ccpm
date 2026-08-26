---
name: agent-reproduce-feature
description: Use when reproducing an existing Codex or Claude Code feature in Qwen Code or another agent CLI by choosing a reference agent, capturing HTTP request bodies, prompts, tool/function schemas, terminal output, and then implementing the matching behavior in the target repo.
---
# Agent Reproduce 功能

## 目的

使用此 skill 将从参考 agent 观察到的功能转化为 Qwen Code 的实现任务。该工作流将当前会话作为外层 harness，并运行一个嵌套的参考 agent 进程作为被测程序。

默认目标仓库：当前工作目录。仅当用户明确提供路径时，才使用用户指定的路径。

## 参考 Agent 选择

首先选择且仅选择一个参考 agent：

- `codex`：使用嵌套的 Codex 作为参考实现。
- `claude-code`：使用嵌套的 Claude Code 作为参考实现。

如果用户未选择，则在捕获前询问一次。然后发现本地命令，而不是假定命令名称：

```sh
command -v codex || true
command -v claude || command -v claude-code || true
```

在运行记录或场景中记录所选适配器：

```json
{
  "reference_agent": "codex",
  "reference_interactive_command": "codex",
  "reference_headless_command": "codex exec",
  "target_agent": "qwen-code",
  "target_repo": "."
}
```

## 工作流

1. 用一句话定义功能范围：命令、触发方式、预期 UI/输出，以及一个能够触发该功能的最小提示词。
2. 选择 `codex` 或 `claude-code` 作为参考 agent，并发现其本地启动命令。
3. 在修改代码前检查目标仓库，以识别可能的模块边界和 Qwen Code 启动命令。
4. 启用捕获功能，针对该功能运行嵌套的参考 agent：
   - 使用 `scripts/capture_state.py` 在场景执行前后捕获本地状态。
   - 使用 `scripts/run_with_mitm.sh` 捕获 HTTP/请求体。
   - 当功能具有交互性或可在 TUI 中看到时，使用 `scripts/run_tmux_capture.sh` 捕获终端。
   - 当功能具有稳定的命令行路径时，使用无头/非交互式执行。
5. 从跟踪记录中提取行为事实：
   - 与该功能相关的系统/开发者提示词差异
   - 请求体结构，包括 `messages`、`tools`、`functions`、架构、工具选择、模型设置
   - 可见的终端状态和命令输出
   - 本地 agent 状态变更、文件编辑、退出状态和错误路径
6. 使用 Qwen Code 中现有的模式，实现最小兼容行为。
7. 添加聚焦测试或可复现的 smoke 命令。
8. 在实现完成且需要迭代以实现对齐时，交接给 `$agent-reproduce-align`。

首次在会话中运行捕获前，请阅读 `references/capture-workflow.md`。

## 捕获默认设置

每次运行优先使用全新的输出目录：

```sh
mkdir -p .repro-runs/slash-command-baseline
.qwen/skills/agent-reproduce-feature/scripts/run_with_mitm.sh \
  .repro-runs/slash-command-baseline \
  -- codex exec "exercise the Codex feature here"
```

对于 Claude Code，如果有可用的无头命令，则使用已发现的无头命令；否则使用 tmux：

```sh
.qwen/skills/agent-reproduce-feature/scripts/run_tmux_capture.sh \
  .repro-runs/slash-command-claude \
  claude
```

对于交互式斜杠命令或终端渲染，使用 tmux：

```sh
.qwen/skills/agent-reproduce-feature/scripts/run_tmux_capture.sh \
  .repro-runs/slash-command-tui \
  codex
```

mitm 脚本会为基于 Node、Python 和 curl 的 CLI 设置通用代理和 CA 变量。如果 TLS 失败，请阅读 `references/capture-workflow.md` 中的证书说明，并先修复信任问题，再将缺失的流量解读为产品行为。

在运行前后捕获参考代理的状态：

```sh
.qwen/skills/agent-reproduce-feature/scripts/capture_state.py \
  snapshot .repro-runs/slash-command-baseline/state-before \
  --agent codex

# 在此处运行参考场景。

.qwen/skills/agent-reproduce-feature/scripts/capture_state.py \
  snapshot .repro-runs/slash-command-baseline/state-after \
  --agent codex

.qwen/skills/agent-reproduce-feature/scripts/capture_state.py \
  diff \
  .repro-runs/slash-command-baseline/state-before \
  .repro-runs/slash-command-baseline/state-after \
  --out-dir .repro-runs/slash-command-baseline/state-diff
```

使用 `--agent claude-code` 可捕获 `~/.claude`，而不是 `~/.codex`。  
仅在使用自定义状态目录或进行测试时使用 `--root PATH`。

## 实现规则

- 不要将捕获的全部提示文本复制到 Qwen Code 中。将其转换为所需的最小行为、模式或测试。
- 将捕获的请求正文视为敏感的本地构件。将示例保存到文档、提交、问题或 PR 之前，先删除令牌。
- 同样将状态差异视为敏感的本地构件。状态工具会删除常见的令牌形式，并省略敏感路径的内容，但在将任何摘录复制到受版本控制的文件之前，请先检查 `state-diff.md`。
- 首次实现应保持范围狭窄：一个功能、一条触发路径、一个可观察的对等目标。
- 优先选择断言行为的兼容性测试，而不是断言确切提示措辞的脆弱测试。
- 如果捕获的模式揭示了稳定的公共契约，请在 Qwen Code 中将该契约编码为类型化结构或 fixture。

## 完成标准

- `.repro-runs/` 或等效的被忽略/本地路径下存在参考代理的基线跟踪记录。
- 已捕获参考代理的状态变化，或明确标记该场景与状态变化无关。
- Qwen Code 包含聚焦的实现以及至少一条验证路径。
- 如果 Qwen Code 的代码库已经记录了类似功能，则应记录任何面向用户的命令行为。
- 下一步对等工作可由 `$agent-reproduce-align` 运行，而无需重新发现设置。