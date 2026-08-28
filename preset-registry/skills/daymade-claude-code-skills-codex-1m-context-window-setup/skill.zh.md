---
name: codex-1m-context-window-setup
description: >-
  Configures and verifies an expanded, model-aware context window for OpenAI
  Codex CLI and Codex Desktop by safely updating the shared base config. Use
  whenever Codex shows about 258K context, the user asks for 500K or 1M context,
  auto-compaction happens too often, model_context_window or
  model_auto_compact_token_limit needs repair, or a workstation/classroom needs
  the same long-context setup across macOS and Windows. Detects the selected
  model's live maximum, requests up to 1M tokens, sets compaction to 60% of the
  attainable window, preserves unrelated TOML, backs up changes, and fails
  rather than guessing when the model contract cannot be verified.
argument-hint: "[doctor|apply|verify]"
---
# Codex 1m 上下文窗口设置

扩展未来的 Codex 会话，但不要假设每个模型都支持一百万个 token。随附的脚本会读取 Codex 当前的模型目录，将请求上限限制为所选模型声明的最大值，并应用用户已设定的 60% 自动压缩策略。

## 路由请求

| 用户意图 | 操作 |
|---|---|
| 查看当前限制、解释 258K 或预览建议 | 运行 `doctor` |
| 配置/修复/提升上下文窗口 | 运行 `apply` |
| 在更新或切换模型后确认之前的设置仍然正确 | 运行 `verify` |

不要向用户询问原始 token 数量。模型目录是权威来源，脚本会推导出可达到的数值。

## 运行工作流

加载此 Skill 时，宿主会公开其安装路径。请显式解析该路径：

- 在 Codex 中，从当前 **Available skills** 目录中此 Skill 的 `file:` 条目获取包含 `SKILL.md` 的目录。
- 在 Claude Code 中，使用 Skill 加载结果所显示的 **Base directory for this skill**。

不要在主目录中搜索其他副本。如果宿主未公开安装路径，请停止并显示 `installed Skill path not exposed`，不要猜测路径。

在 macOS/Linux 上，设置该确切目录并运行：

```bash
SKILL_DIR="/absolute/path/from-the-loaded-skill-metadata"
uv run --no-project python "$SKILL_DIR/scripts/codex_context_window.py" doctor
uv run --no-project python "$SKILL_DIR/scripts/codex_context_window.py" apply
uv run --no-project python "$SKILL_DIR/scripts/codex_context_window.py" verify
```

在 Windows PowerShell 上，使用同一个已公开的目录，并使用正斜杠：

```powershell
$SkillDir = "C:/absolute/path/from-the-loaded-skill-metadata"
uv run --no-project python "$SkillDir/scripts/codex_context_window.py" doctor
uv run --no-project python "$SkillDir/scripts/codex_context_window.py" apply
uv run --no-project python "$SkillDir/scripts/codex_context_window.py" verify
```

### `doctor`

首先运行。它是只读的，并会报告：

- Codex 解析出的所选模型；
- 目录默认值、模型最大值和可用百分比；
- 请求的原始窗口（最高 1,000,000）、可用窗口和 60% 压缩点；
- 当前基础配置值，以及是否需要运行 `apply`；
- 确切的 `$CODEX_HOME/config.toml` 目标。

如果 Codex 无法返回实时模型目录，请停止。不要替换为记忆中的模型限制、API 营销数字或随附的默认值。

### `apply`

仅在 `doctor` 成功后运行。该脚本会：

1. 重新读取实时模型契约。
2. 仅更改顶层的 `model_context_window` 和
   `model_auto_compact_token_limit` 键。
3. 仅在字节内容即将发生变化时创建内容寻址备份。
4. 使用同目录原子替换，并拒绝覆盖被并发更改的配置。
5. 运行 Codex 严格配置诊断；如果失败，则恢复之前的确切字节内容。
6. 读回写入的文件，并报告未来会话将使用的值。

现有会话不会在原地扩展。成功后，请告知用户启动新的 CLI 线程，或重启/打开新的 Codex Desktop 线程。

### `verify`

在 Codex 升级、默认模型更改或新配置机器上运行。

当当前基础配置不再等于面向模型的建议配置时，它会以非零状态退出。报告不匹配情况；不要将其称为已配置。

## 报告结果

从脚本输出中复制准确值。包括：

- 模型 slug；
- 已配置的原始窗口；
- 向会话显示的可用窗口；
- 自动压缩阈值；
- 模型是否限制了 1M 请求；
- 配置路径和备份路径；
- 应用更改后设置 `restart_required: true`。

## 拒绝扩大范围

此 Skill 不会：

- 更改所选模型、推理力度、服务层级、沙箱、审批、插件、MCP 服务器、浏览器/计算机使用设置或 shell 别名；
- 编辑特定配置文件或覆盖每条命令中的 `-c` 标志；
- 声称当前正在运行的线程已扩展；
- 当所选模型声明了更小的最大值时强制使用 1M；
- 回退到过时或猜测的模型元数据。

在诊断模型上限、95% 可用窗口显示或压缩语义时，阅读 [references/context_window_contract.md](references/context_window_contract.md)。