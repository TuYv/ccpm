---
name: local-conversation-history
description: >-
  Lists recent local Claude Code, OpenAI Codex, and Kimi CLI conversations for
  a workspace in one read-only command. Claude inventory combines active config
  homes with every archive registered in ~/.claude/history-sources.json,
  de-duplicates IDs, and uses internal timestamps instead of file mtime. Marks
  every in-scope Codex session whose canonical per-thread advisory lock is held,
  appending hits outside the recent limit; this proves lock state, not holder
  identity or liveness, and no marker does not prove “stopped.” Outputs
  Markdown or JSON with titles, timezone-qualified timestamps, provenance,
  session IDs, runtime/archive markers, and visible diagnostics while excluding
  internal sub-agents by default. Use when the user asks to list or browse local
  chats, task history, or session IDs across Claude Code, Codex, and Kimi CLI
  (kimi-code), or asks which Codex session locks are held or may still be in
  use. Do not use for keyword/full-event search, deleted-file recovery, or
  resuming work.
argument-hint: "[workspace-path]"
---
# 本地对话历史

列出项目范围内的本地历史记录，无需临时拼凑 `rg`、`stat`、`jq` 或 SQLite 管道。随附脚本会在单个进程中完成提供商与归档发现、模式内省、筛选、去重、标题提取、按内部时间排序、仅记录正向结果的 Codex 写入锁观察以及结果渲染。

## 完整性不变量

对于常规的 Claude Code 清单，来源集合不可分割：

1. 自动发现的活跃主目录（`~/.claude`、配置文件主目录以及当前的 `CLAUDE_CONFIG_DIR`），以及
2. 在 `~/.claude/history-sources.json` 中注册的每个归档。

除非输出表明已搜索注册的归档，否则不要声称某个 Claude 对话不存在。必需的归档不可用属于严重配置错误，不能以此为由返回不完整的结果。显式指定 `--claude-home` 是用于诊断的范围覆盖，会有意绕过注册表；切勿使用它来作出完整性声明。

## 请求路由

- 列出/查看近期/显示/浏览本地对话：运行随附脚本一次。
- 对可能仍在使用的 Codex 会话进行初步排查：使用自动生成的 `writer-lock file held` 标记。该命令会探测每一条纳入结果的 Codex 记录，并将所有正向命中追加到近期记录限制之外。命中仅能证明在快照期间有某个进程持有 Codex 的标准建议锁；它无法识别该进程，也不能证明会话正在运行。没有标记的记录不能证明会话已经停止。
- 了解带标记的 Codex 会话正在执行什么操作：将其准确的会话 ID 传递给 `daymade-claude-code:continue-codex-work`。标题、近期时间戳或已持有的写入锁标记只能识别线程锁，无法识别锁的持有者、当前任务或进度。
- 限制为单个提供商：传递 `--source claude`、`--source codex` 或 `--source kimi`（Kimi CLI，也称 kimi-code）。
- 指向非默认的 Kimi CLI 主目录：传递 `--kimi-home <dir>`；解析顺序为 `--kimi-home` > `KIMI_HOME` > `~/.kimi-code`。
- 包含某个目录下的子工作区：传递 `--recursive`。
- 列出所有工作区：传递 `--all-projects`；省略 `--cwd`。
- 包含已归档的 Codex 线程或已归档的 Kimi CLI 会话：传递 `--include-archived`。
- 按对话日期进行限制：传递 `--from-date` 和/或 `--to-date`。
- 仅在明确要求时包含内部代理或明显的冒烟测试提示词：传递 `--include-subagents` 或 `--include-automated`。
- 搜索完整转录内容、恢复已删除文件或分析工具调用：改用 `daymade-claude-code:claude-code-history-files-finder` 技能。
- 使用 `daymade-claude-code:continue-claude-work` 重建并继续 Claude Code 会话；对于 Codex 线程，则使用 `daymade-claude-code:continue-codex-work`。

## 只运行一条清单命令

相对于此 SKILL.md 解析 `scripts/list_local_history.py`。不要在机器上搜索该脚本，也不要以内联方式重新实现其逻辑。

在 macOS 或 Linux 上，当脚本具有可执行权限位时，直接执行该脚本；否则使用 Python 3。在 Windows 上，使用 `py` 或 `python`：

```text
<skill-dir>/scripts/list_local_history.py --cwd <workspace> --limit 10 --language en
py <skill-dir>/scripts/list_local_history.py --cwd <workspace> --limit 10 --language en
```

当用户使用中文交流时，请选择 `--language zh`。如果用户未提供路径，请显式传入 shell 的当前工作目录。Windows 命令示例中使用正斜杠，但允许实际的 `--cwd` 值使用平台的原生路径格式。

预期输出已经是可直接展示的 Markdown：

```markdown
# Local conversation history
Scope: `<workspace>`

## Codex — 3 conversations
Runtime: `writer-lock file held` proves lock contention, not holder identity; an unmarked row is not evidence that a session stopped.
| Updated | Title | Session ID | Flags |
|---|---|---|---|
| 2026-01-15 10:30 +00:00 | Review authentication flow | `019...` | writer-lock file held |
```

直接返回该输出，最多附加一条简短说明。不要仅仅为了复述结果而继续运行 `find`、`rg`、`stat` 或数据库调用。当用户询问某个带标记的 Codex 线程正在做什么时，获准使用的后续操作是针对该确切 ID 的 `daymade-claude-code:continue-codex-work`，而不是根据进程名称或 cwd 进行猜测。

## 保持证据边界

将该命令视为清单工具，而不是会话记录导出工具：

- 保持脚本只读。它绝不会恢复、重命名、归档、删除或修复会话。
- 仅报告标题；除非用户之后要求查看特定会话，否则不要粘贴原始 JSONL 或完整提示词。
- 保留每个已显示时间戳中的明确时区偏移量。
- 对于 Claude Code，将 JSONL 中有效的顶层 `timestamp` 值的最小值和最大值视为会话时间范围。绝不要用文件 mtime 替代：复制或迁移归档会改变 mtime，但不会改变会话时间。
- 对于 Codex，优先使用状态数据库中的内部创建和更新时间字段。如果数据库不可用，则根据内部顶层事件时间戳和 `session_meta.payload.timestamp` 计算 rollout 时间范围；绝不要使用 rollout mtime 或数据库文件 mtime 表示时间顺序。
- 将 `writer-lock file held` 仅视为以下证据：在生成快照时，某个进程持有该线程的规范 advisory lock。它无法识别该进程，也不能证明存在打开的 UI、正在执行的代理、持续进行的工具调用、业务进展、仓库权限或项目租约。会探测范围内的每一条 Codex 记录；`--limit` 范围外的正匹配结果会被追加。绝不要将缺少标记反向解释为“非活动”。
- 对于 Kimi CLI，优先使用 `state.json` 中的 `createdAt`/`updatedAt`（epoch 毫秒）。如果 `state.json` 缺失或不包含这些字段，则根据内部 wire `time` 字段（以及元数据记录中的 `created_at`，同样以毫秒为单位）计算时间范围；绝不要使用文件 mtime 表示时间顺序。
- 仅含日期的过滤条件表示整个本地日历日。日期时间过滤条件必须包含 `Z` 或明确的 UTC 偏移量。启用日期过滤条件时，没有内部时间戳的会话会被排除，并显示明确警告。
- 完全按照打印结果保留提供方标签和会话 ID。
- 输出脚本产生的警告，而不是静默隐藏缺失、不可读或不受支持的存储。
- 不要声称结果中包含 Claude Desktop 原生聊天。此处的 Claude 来源是 Claude Code 历史记录；Codex 涵盖本地 Codex CLI/Desktop 线程存储；Kimi CLI 涵盖本地 kimi-code 会话存储，而不是 Kimi Web 产品。

## 处理源配置和故障

该脚本遵循 `CLAUDE_CONFIG_DIR`、`CODEX_HOME` 和 `KIMI_HOME`。只需在 `~/.claude/history-sources.json` 中注册一次持久化 Claude 归档，之后默认命令将在每次运行时搜索这些归档。使用 `--history-sources <file>` 测试其他注册表。仅当用户明确要求精确限定到单一存储的诊断范围时，才使用 `--claude-home <dir>`、`--codex-home <dir>` 或 `--kimi-home <dir>`。

如果没有显示任何对话，请使用同一命令已输出的诊断信息。当需要诊断格式、路径或写入器锁的观测结果时，请阅读 [references/storage_and_portability.md](references/storage_and_portability.md)；其中记录了源注册表、已检查的存储、内部时间策略、锁语义、Windows 路径规范化以及已知边界。

## 维护者验证

在源代码仓库中，`daymade-claude-code/_conversation_core/` 是此技能、`claude-code-history-files-finder`、`continue-claude-work` 和 `continue-codex-work` 共享代码的单一事实来源（SSOT）。由于 `sync_core.py` 会将该包复制到每个 `scripts/_core/` 中，因此这四个技能在安装时仍然是自包含的。切勿直接编辑捆绑的 `_core` 副本。

更改共享代码后，请同步并验证全部四个捆绑包，然后运行此技能的标准库回归测试套件：

```text
uv run python ../sync_core.py sync
uv run python ../sync_core.py check
python -m unittest discover -s tests -p "test_*.py"
```

该测试套件会构建相互隔离的 Claude 和 Codex 固定测试数据，其中包括 SQLite 和原始 JSONL 路径，因此绝不依赖维护者的个人对话内容。开发触发用例位于 `evals/evals.json`。