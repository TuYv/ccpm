---
name: examples-auto-run
description: Run python examples in auto mode with logging, rerun helpers, and background control.
---
# examples-auto-run

## 功能

- 运行 `uv run examples/run_examples.py`，并包含：
  - 默认启用可选依赖扩展：
    `litellm`、`any-llm`、`sqlalchemy`、`redis`、`blaxel`、`modal`、`runloop` 和 `temporal`。
  - `EXAMPLES_INTERACTIVE_MODE=auto`（自动输入/自动批准）。
  - 每个示例的日志位于 `.tmp/examples-start-logs/` 下。
  - 通过 `--main-log` 传入主汇总日志路径（同样位于 `.tmp/examples-start-logs/` 下）。
  - 设置 `--write-rerun` 时，在 `.tmp/examples-rerun.txt` 生成失败项的重新运行列表。
- 通过 `run.sh` 提供启动、停止、状态、日志、日志跟踪、收集和重新运行辅助命令。
- 后台选项通过 pidfile 让进程持续运行；`stop` 会将其清理。

## 用法

```bash
# Start (auto mode; interactive included by default)
.agents/skills/examples-auto-run/scripts/run.sh start [extra args to run_examples.py]
# Examples:
.agents/skills/examples-auto-run/scripts/run.sh start --filter basic
.agents/skills/examples-auto-run/scripts/run.sh start --include-server --include-audio

# Check status
.agents/skills/examples-auto-run/scripts/run.sh status

# Stop running job
.agents/skills/examples-auto-run/scripts/run.sh stop

# List logs
.agents/skills/examples-auto-run/scripts/run.sh logs

# Tail latest log (or specify one)
.agents/skills/examples-auto-run/scripts/run.sh tail
.agents/skills/examples-auto-run/scripts/run.sh tail main_20260113-123000.log

# Collect rerun list from a main log (defaults to latest main_*.log)
.agents/skills/examples-auto-run/scripts/run.sh collect

# Rerun only failed entries from rerun file (auto mode)
.agents/skills/examples-auto-run/scripts/run.sh rerun
```

## Codex 执行环境

- 当 Codex 调用 `start` 或 `rerun` 时，默认在 Codex 沙箱外运行命令（`sandbox_permissions=require_escalated`）。许多示例会启动嵌套沙箱、浏览器、npm 辅助工具或云端/本地服务进程；在 Codex 沙箱内运行可能会产生仅由环境导致的失败，例如 `sandbox-exec: sandbox_apply: Operation not permitted`、Playwright 缓存权限错误或 npm 缓存权限错误。
- 仅当用户明确要求时，或者运行不会执行示例的小范围试运行/日志检查命令时，才使用沙箱执行。

## 默认值（可通过 env 覆盖）

- `EXAMPLES_INTERACTIVE_MODE=auto`
- `EXAMPLES_INCLUDE_INTERACTIVE=1`
- `EXAMPLES_INCLUDE_SERVER=0`
- `EXAMPLES_INCLUDE_AUDIO=0`
- `EXAMPLES_INCLUDE_EXTERNAL=0`
- `EXAMPLES_UV_EXTRAS="litellm any-llm sqlalchemy redis blaxel modal runloop temporal"`（设置为空字符串可禁用扩展）
- 自动模式下的自动批准设置：`APPLY_PATCH_AUTO_APPROVE=1`、`SHELL_AUTO_APPROVE=1`、`AUTO_APPROVE_MCP=1`

## 日志位置

- 主日志：`.tmp/examples-start-logs/main_*.log`
- 每个示例的日志（来自 `run_examples.py`）：`.tmp/examples-start-logs/<module_path>.log`
- 重新运行列表：`.tmp/examples-rerun.txt`
- 标准输出日志：`.tmp/examples-start-logs/stdout_*.log`

## 备注

- 运行器会委托给 `uv run --extra ... examples/run_examples.py`，后者已能够写入每个示例的日志，并支持 `--collect`、`--rerun-file` 和 `--print-auto-skip`。
- 由于凭证问题，`examples/sandbox/extensions/vercel_runner.py` 暂时从自动运行中排除。在凭证设置修复之前，请勿强制运行它。
- `start` 使用 `--write-rerun`，因此失败项会被自动捕获。
- 如果 `.tmp/examples-rerun.txt` 存在且非空，在不带参数的情况下调用该 skill 默认会运行 `rerun`。

## 行为验证（Codex/LLM 的职责）

运行器不会执行任何自动化行为验证。每次前台执行 `start` 或 `rerun` 后，**Codex 必须手动验证**所有退出码为 0 的条目：

1. 阅读示例源代码（包括注释），以推断预期流程、使用的工具和预期的关键输出。
2. 打开 `.tmp/examples-start-logs/` 下与示例匹配的日志。
3. 确认预期的操作和结果确实发生；标记任何遗漏或偏差。
4. 对**所有通过的示例**执行此操作，而不只是抽样检查。
5. 运行结束后立即报告，并简洁引用能够证明验证结果的确切日志行。