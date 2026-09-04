---
name: codex
description: Use when the user asks to run Codex CLI (codex exec, codex resume) or references OpenAI Codex for code analysis, refactoring, or automated editing. Uses GPT-5.2 by default for state-of-the-art software engineering.
---
# Codex 技能指南

## 运行任务
1. 默认使用 `gpt-5.2` 模型。通过 `AskUserQuestion` 询问用户使用哪种推理强度（`xhigh`、`high`、`medium` 或 `low`）。如有需要，用户可以覆盖模型选择（参见下方的模型选项）。
2. 选择任务所需的沙盒模式；除非需要进行编辑或网络访问，否则默认使用 `--sandbox read-only`。
3. 使用适当的选项组装命令：
   - `-m, --model <MODEL>`
   - `--config model_reasoning_effort="<high|medium|low>"`
   - `--sandbox <read-only|workspace-write|danger-full-access>`
   - `--full-auto`
   - `-C, --cd <DIR>`
   - `--skip-git-repo-check`
3. 始终使用 --skip-git-repo-check。
4. 继续之前的会话时，通过 stdin 使用 `codex exec --skip-git-repo-check resume --last`。恢复会话时不要使用任何配置标志，除非用户明确要求，例如用户在请求恢复会话时指定了模型或推理强度。恢复语法：`echo "your prompt here" | codex exec --skip-git-repo-check resume --last 2>/dev/null`。所有标志都必须插入在 exec 和 resume 之间。
5. **重要**：默认情况下，为所有 `codex exec` 命令追加 `2>/dev/null`，以抑制思考 token（stderr）。仅当用户明确要求查看思考 token 或需要调试时，才显示 stderr。
6. 运行命令，捕获 stdout/stderr（视情况进行过滤），并为用户总结结果。
7. **Codex 完成后**，告知用户："你可以随时通过说 'codex resume' 或让我继续进行额外的分析或修改来恢复此 Codex 会话。"

### 快速参考
| 使用场景 | 沙盒模式 | 关键标志 |
| --- | --- | --- |
| 只读审查或分析 | `read-only` | `--sandbox read-only 2>/dev/null` |
| 应用本地编辑 | `workspace-write` | `--sandbox workspace-write --full-auto 2>/dev/null` |
| 允许网络或广泛访问 | `danger-full-access` | `--sandbox danger-full-access --full-auto 2>/dev/null` |
| 恢复最近的会话 | 继承自原会话 | `echo "prompt" \| codex exec --skip-git-repo-check resume --last 2>/dev/null`（不允许使用任何标志） |
| 从其他目录运行 | 根据任务需求匹配 | `-C <DIR>` 加上其他标志 `2>/dev/null` |

## 模型选项

| 模型 | 最适用于 | 上下文窗口 | 关键特性 |
| --- | --- | --- | --- |
| `gpt-5.2-max` | **Max 模型**：超复杂推理、深度问题分析 | 400K 输入 / 128K 输出 | 76.3% SWE-bench，自适应推理，$1.25/$10.00 |
| `gpt-5.2` ⭐ | **旗舰模型**：软件工程、智能体编码工作流 | 400K 输入 / 128K 输出 | 76.3% SWE-bench，自适应推理，$1.25/$10.00 |
| `gpt-5.2-mini` | 高性价比编码（用量额度为 4 倍） | 400K 输入 / 128K 输出 | 接近 SOTA 的性能，$0.25/$2.00 |
| `gpt-5.1-thinking` | 超复杂推理、深度问题分析 | 400K 输入 / 128K 输出 | 自适应思考深度，在最难的任务上运行耗时翻倍 |

**GPT-5.2 优势**：76.3% SWE-bench（相比 GPT-5 的 72.8%），在一般任务上速度提升 30%，更出色的工具处理能力，更少的幻觉，更高的代码质量。知识截止日期：2024 年 9 月 30 日。

**推理强度级别**：
- `xhigh` - 超复杂任务（深度问题分析、复杂推理、对问题的深入理解）
- `high` - 复杂任务（重构、架构、安全分析、性能优化）
- `medium` - 标准任务（重构、代码组织、功能添加、缺陷修复）
- `low` - 简单任务（快速修复、简单更改、代码格式化、文档）

**缓存输入折扣**：针对重复上下文享有 90% 折扣（$0.125/M tokens），缓存最长可持续 24 小时。

## 后续跟进
- 每次执行 `codex` 命令后，立即使用 `AskUserQuestion` 确认下一步操作、收集澄清信息，或决定是否使用 `codex exec resume --last` 恢复会话。
- 恢复会话时，通过 stdin 管道传入新的提示词：`echo "new prompt" | codex exec resume --last 2>/dev/null`。恢复的会话会自动使用与原会话相同的模型、推理强度和沙盒模式。
- 在提出后续行动时，重述所选的模型、推理强度和沙盒模式。

## 错误处理
- 每当 `codex --version` 或 `codex exec` 命令以非零值退出时，停止并报告失败；在重试之前请求指示。
- 在使用高影响标志（`--full-auto`、`--sandbox danger-full-access`、`--skip-git-repo-check`）之前，使用 AskUserQuestion 征求用户许可，除非用户已事先授权。
- 当输出包含警告或部分结果时，对其加以总结，并使用 `AskUserQuestion` 询问如何调整。

## CLI 版本

需要 Codex CLI v0.57.0 或更高版本才能支持 GPT-5.2 模型。CLI 在 macOS/Linux 上默认使用 `gpt-5.2`，在 Windows 上默认使用 `gpt-5.2`。检查版本：`codex --version`

在 Codex 会话中使用 `/model` 斜杠命令来切换模型，或在 `~/.codex/config.toml` 中配置默认模型。
