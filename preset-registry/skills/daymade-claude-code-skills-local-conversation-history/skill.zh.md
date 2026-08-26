---
name: local-conversation-history
description: >-
  Lists recent local Claude Code, OpenAI Codex, and Kimi CLI conversations, and
  extracts exact recent Codex user inputs grouped by session, through bundled
  read-only commands. Inventory covers registered Claude archives, internal
  timestamps, session IDs, provenance, archive/runtime markers, and
  positive-only Codex writer-lock evidence. Verbatim-input mode preserves the
  user's wording, duplicates, chronology, and session boundaries without
  thematic classification. Outputs Markdown or JSON. Use when the user asks to
  list or browse local chats, task history, session IDs, what they recently
  said, their original/verbatim inputs, chronological user wording, or expanded
  inputs for several Codex sessions. Do not use for keyword/full-event search,
  deleted-file recovery, or resuming work.
argument-hint: "[workspace-path]"
---
# 本地对话历史

无需自行拼接 `rg`、`stat`、`jq`、SQLite 或 JSONL 管道，即可列出项目范围内的历史记录，或精确获取 Codex 提示词账本中的行。这两个内置命令将两项工作分开：对话清单返回标题和元数据；逐字输入模式仅返回会话 ID、时间戳以及用户存储的输入文本。

## 在调用工具前确定任务

将用户意图视为路由依据；单独出现“历史记录”一词并不意味着要获取清单。

| 用户意图 | 路由 |
|---|---|
| 列出最近的对话、标题、日期、会话 ID 或持有的 Codex 写入锁 | 运行此技能的内置清单命令一次 |
| 按从新到旧的顺序，列出用户最近在 Codex 中说过的内容，以原始/逐字输入的形式并按会话分组 | 运行内置的 Codex 逐字输入命令；不要调用历史记录查找器 |
| 根据先前的结果展开多个 Codex 会话，同时保持每个会话的完整性 | 使用这些确切的会话 ID 和每个会话一个限制值，重新运行逐字输入命令 |
| 查找出现过某个主题、操作、引文、文件或工具结果的对话——包括“我记得我们做过 X”“找找以前那次聊天”或“我们之前讨论过 Y 吗？” | 直接调用 `daymade-claude-code:claude-code-history-files-finder`；不要先运行最近记录清单 |
| 从一个已经确定的会话继续工作 | 调用匹配的 `daymade-claude-code:continue-claude-work` 或 `daymade-claude-code:continue-codex-work` 技能 |

用户请求的输出优先于背景动机。如果用户解释了一个问题，并要求检查其自身原始输入的某个时间顺序窗口，则返回该窗口，即使解释中包含主题线索。只有当请求的结果是*匹配的对话/内容*（例如“找出我们之前讨论 DINO 的历史对话”）时，才路由到完整内容搜索。

路由内容搜索时，保留用户范围中未知的部分：

- 如果提供方未知，或用户说“我们的历史记录”，则要求查找器覆盖 Claude、Codex 和 Kimi CLI；仅有 Claude 的结果不足以支持“不存在”的结论。
- 如果项目未知，则要求查找器搜索所有项目，而不是猜测当前工作区。
- 在将新命中视为历史证据之前排除当前会话；用户的查询和代理的搜索命令会记录在当前会话记录中，否则会与自身匹配。

让查找器负责其确切命令、查询扩展、来源诊断和结果解释。此技能只负责清单与搜索之间的决策。

## 完整性不变量

对于普通的 Claude Code 清单，来源集合不可拆分：

1. 自动发现的活动主目录（`~/.claude`、配置文件主目录以及当前的 `CLAUDE_CONFIG_DIR`），以及
2. `~/.claude/history-sources.json` 中注册的每个归档。

除非输出显示已搜索注册的归档，否则不得声称某个 Claude 对话不存在。所需归档不可用属于严重配置错误，而不是返回不完整结果的许可。显式的 `--claude-home` 是诊断范围覆盖选项，会有意绕过注册表；绝不要使用它来声称结果完整。

## 路由请求

- 列出/最近/显示/浏览本地会话：运行一次随附脚本。
- 列出最近的原始 Codex 输入：运行 `scripts/list_codex_user_inputs.py`
  并传入 `--recent <N>`。它按会话对选定的全局输入窗口进行分组；
  不会根据推断出的主题为会话命名、分类、总结或拆分会话。
- 展开特定的 Codex 会话：按照用户已经看到的顺序重复传入 `--session-id <ID>`，
  然后设置 `--per-session <N>`。保留重复输入；
  重复项属于输入账本的一部分，不应作为噪声去重。
- 对可能仍在使用中的 Codex 会话进行分诊：使用自动添加的
  `writer-lock file held` 标记。该命令会探测每一条获准的 Codex 记录，
  并将任何命中项追加到最近记录数量限制之外。命中仅证明在创建快照期间某个进程持有 Codex 的规范咨询锁；
  它无法识别该进程，也不能证明会话正在运行。未标记的记录也不能证明会话已停止。
- 了解带标记的 Codex 会话正在执行什么：将其准确的会话 ID 传递给
  `daymade-claude-code:continue-codex-work`。标题、最近时间戳或持有的写入锁标记只表明线程锁，
  不代表锁的持有者、当前任务或进度。
- 限定为一个提供商：传入 `--source claude`、`--source codex` 或 `--source kimi`
  （Kimi CLI，也称为 kimi-code）。
- 指定非默认的 Kimi CLI 主目录：传入 `--kimi-home <dir>`；解析顺序为
  `--kimi-home` > `KIMI_HOME` > `~/.kimi-code`。
- 包含某个目录下的子工作区：传入 `--recursive`。
- 列出所有工作区：传入 `--all-projects`；省略 `--cwd`。
- 包含已归档的 Codex 线程或已归档的 Kimi CLI 会话：传入 `--include-archived`。
- 按会话日期限定范围：传入 `--from-date` 和/或 `--to-date`。
- 仅在明确要求时包含内部代理或明显的冒烟测试提示：
  传入 `--include-subagents` 或 `--include-automated`。
- 搜索完整记录、恢复已删除的文件或分析工具调用：
  改用 `daymade-claude-code:claude-code-history-files-finder` 技能。
- 使用 `daymade-claude-code:continue-claude-work` 重建并继续 Claude Code 会话；
  对 Codex 线程使用 `daymade-claude-code:continue-codex-work`。

## 运行匹配的随附命令

### 会话清单

相对于此 SKILL.md 解析 `scripts/list_local_history.py`。不要在机器上搜索该脚本，也不要在内联代码中重新实现其逻辑。

在 macOS 或 Linux 上，如果脚本具有可执行权限，则直接执行；否则使用 Python 3。在 Windows 上，使用 `py` 或 `python`：

```text
<skill-dir>/scripts/list_local_history.py --cwd <workspace> --limit 10 --language en
py <skill-dir>/scripts/list_local_history.py --cwd <workspace> --limit 10 --language en
```

当用户使用中文时选择 `--language zh`。如果用户未提供路径，则显式传入 shell 的当前工作目录。Windows 命令示例中使用正斜杠，同时允许实际的 `--cwd` 值使用平台原生的路径格式。

预期输出已经是可直接用于展示的 Markdown：

```markdown
# Local conversation history
Scope: `<workspace>`

## Codex — 3 conversations
Runtime: `writer-lock file held` proves lock contention, not holder identity; an unmarked row is not evidence that a session stopped.
| Updated | Title | Session ID | Flags |
|---|---|---|---|
| 2026-01-15 10:30 +00:00 | Review authentication flow | `019...` | writer-lock file held |
```

直接返回该输出，最多附带一条简短观察。不要仅仅为了复述结果而运行后续的
`find`、`rg`、`stat` 或数据库调用。
当用户询问带标记的 Codex 线程正在做什么时，针对该确切 ID，获准的后续操作是
`daymade-claude-code:continue-codex-work`，而不是猜测进程名或 cwd。

### Verbatim Codex user inputs

将 `scripts/list_codex_user_inputs.py` 相对于此 SKILL.md 解析。提示历史账本已经存储了 `session_id`、`ts` 和输入框文本；
使用捆绑的解析器，而不是用 Node、SQLite 或一次性 JSONL 脚本重新构建这个连接。

对于最近的全局输入窗口：

```text
<skill-dir>/scripts/list_codex_user_inputs.py --recent 100 --language zh
```

对于扩展已显示 Sessions 的后续查询：

```text
<skill-dir>/scripts/list_codex_user_inputs.py \
  --session-id <first-id> --session-id <second-id> \
  --per-session 50 --language zh
```

仅当用户要求机器可读输出时，才使用 `--format json`。
Markdown 已经可以直接用于展示：Session 标题仅包含确切的 ID 和计数，
行仅包含带时区的时间以及可读的原始输入。它会对字面标记进行 HTML 转义，并规范化用于展示的换行形式；
只有在字节级字符串保真度很重要时，才使用 `--format json`。
返回任一格式时，都不要添加主题标题或第二层分类。

如果完整 Markdown 无法在一条响应中容纳，将同一命令的 stdout 重定向到一个清楚标明的持久化 `.md` 文件，并向用户提供其链接。
不要静默截断、选择“重要”行或替换为摘要。

## Preserve the evidence boundary

根据每条命令的证据来源处理它：

- 保持脚本只读。它不会恢复、重命名、归档、删除或修复会话。
- Inventory 模式只报告标题和元数据。Verbatim-input 模式是用户明确要求的例外：它会报告一个或多个 Sessions 中的 Codex 提示账本行，但绝不会报告 assistant 文本、思考过程、工具调用或 transcript 正文。
- 将提示账本行视为确切存储的输入序列。保留措辞、换行、重复行和 Session 边界；不要推断哪些行是“反馈”，不要合并重复输入，也不要按语义类型拆分一个 Session。
- 保留每个显示时间戳的显式时区偏移。
- 对于 Claude Code，将 JSONL 中顶层有效 `timestamp` 值的最小值和最大值视为会话范围。绝不要用文件 mtime 替代：复制或迁移归档会改变 mtime，但不会改变对话时间。
- 对于 Codex，优先使用状态数据库的内部创建/更新时间字段。如果数据库不可用，则根据内部顶层事件时间戳以及 `session_meta.payload.timestamp` 计算 rollout 范围；绝不要使用 rollout mtime 或数据库文件 mtime 作为时间顺序依据。
- 将 `writer-lock file held` 仅视为某个进程在快照期间持有规范的每线程 advisory lock 的证据。它无法识别该进程，也不能证明 UI 处于打开状态、agent 正在执行、工具正在持续使用、业务正在推进、仓库权限或项目租约。每个范围内的 Codex 行都会被探测；`--limit` 范围之外的正向命中会追加显示。绝不要将缺少标记反推为“不活跃”。
- 对于 Kimi CLI，优先使用 `state.json` 的 `createdAt`/`updatedAt`（epoch 毫秒）。如果 `state.json` 缺失或不包含这些字段，则根据内部 wire `time` 字段（以及元数据记录的 `created_at`，同样为毫秒）计算范围；绝不要使用文件 mtime 作为时间顺序依据。
- 仅日期筛选表示整个本地日历日。日期时间筛选必须包含 `Z` 或显式的 UTC 偏移。当日期筛选生效时，没有内部时间戳的 Sessions 会被排除，并显示可见警告。
- 完全按照打印结果保留 provider 标签和 session ID。
- 输出脚本发出的警告，不要静默隐藏缺失、无法读取或不受支持的存储。
- 不要声称包含 Claude Desktop 原生聊天。此处的 Claude 来源是 Claude Code 历史记录；Codex 涵盖本地 Codex CLI/Desktop 线程存储；Kimi CLI 涵盖本地 kimi-code 会话存储，而不是 Kimi Web 产品。
- Codex verbatim-input 模式目前仅适用于 Codex。它严格读取 `<codex-home>/history.jsonl`，当账本缺失、格式错误或包含不受支持的行结构时会失败，而不是渲染部分结果。

## 处理源配置和故障

该脚本遵循 `CLAUDE_CONFIG_DIR`、`CODEX_HOME` 和 `KIMI_HOME`。在
`~/.claude/history-sources.json` 中注册持久化的 Claude 存档；默认命令
随后会在每次运行时搜索这些存档。使用 `--history-sources <file>` 测试
其他注册表。仅当用户明确要求精确的单存储诊断范围时，才使用
`--claude-home <dir>`、`--codex-home <dir>` 或
`--kimi-home <dir>`。

如果没有显示任何对话，或 Codex 提示词账本无法支持完整结果，请使用同一
命令已经打印出的诊断信息。当需要诊断格式、路径或写入器锁定观察结果时，
请阅读
[references/storage_and_portability.md](references/storage_and_portability.md)
；其中记录了源注册表、检查过的存储、内部时间策略、锁语义、
Windows 路径规范化方式以及已知边界。

## 维护者验证

在源代码仓库中，`daymade-claude-code/_conversation_core/` 是此技能、
`claude-code-history-files-finder`、
`continue-claude-work` 和 `continue-codex-work` 共用的代码
SSOT。这四个技能在安装时仍保持自包含，因为 `sync_core.py` 会将该包复制到
各自的 `scripts/_core/` 中。切勿直接编辑捆绑的 `_core` 副本。

修改共享代码后，请同步并验证全部四个捆绑包，然后运行此技能的标准库回归测试套件：

```text
uv run python ../sync_core.py sync
uv run python ../sync_core.py check
python -m unittest discover -s tests -p "test_*.py"
```

测试套件会构建隔离的 Claude 和 Codex fixture，包括 SQLite 和原始
JSONL 路径，因此绝不会依赖维护者个人的对话内容。开发触发用例位于
`evals/evals.json`。