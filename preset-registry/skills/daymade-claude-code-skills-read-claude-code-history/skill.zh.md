---
name: read-claude-code-history
description: >-
  Reads, searches, and exports local Claude Code history without resuming work.
  Covers recent session inventory, exact session timelines, verbatim human input
  including queued mid-turn prompts, full-event keyword search, hybrid recall
  when wording changed, end-state triage, and deleted-file recovery across active
  Claude homes plus registered archives. Use whenever the user asks what they or
  Claude said, wants a Claude Code session ID or original context, remembers prior
  work vaguely, needs an old file from a transcript, or must prove what a Claude
  session contained before continuing it. Also owns the only Kimi CLI surface, via
  its Kimi inventory and search flags. For Codex history use read-codex-history;
  when the request names no platform at all or spans providers, start at
  local-conversation-history.
argument-hint: "[session-id | keywords | workspace-path]"
---
# 读取 Claude Code 历史记录

仅读取 Claude Code 证据。不要恢复旧进程、编辑其项目，也不要将读取请求转变为继续任务。当用户之后要求执行操作时，将已验证的证据交给 `daymade-claude-code:continue-claude-code-work`。

## 根据请求的结果进行路由

| 用户想要 | 使用 |
|---|---|
| 最近的 Claude Code 会话、标题、日期或 ID | `scripts/list_local_history.py --source claude` |
| 将一个已知会话重构为按时间顺序排列的证据简报 | `scripts/read_claude_session.py --session <ID>` |
| 用户最近输入的内容，包括人工排队的提示 | `scripts/extract_user_messages.py` |
| 按关键词查找某段对话、引述、文件、工具结果或操作 | `scripts/analyze_sessions.py search` |
| 之前的工作（其措辞可能已经改变） | 检查索引状态后使用 `scripts/history_index.py recall` |
| 某个时间范围内的会话是如何结束的 | `scripts/analyze_sessions.py triage` |
| Claude 文件历史记录中保存的已删除/覆盖文件 | `scripts/recover_content.py` |
| Kimi CLI 会话 — 此 Skill 拥有唯一的实时 Kimi 界面 | 清单：`scripts/list_local_history.py --source kimi`；全文：`scripts/analyze_sessions.py search --kimi` |
| 继续已验证的 Claude 会话 | 停止读取并调用 `daymade-claude-code:continue-claude-code-work` |

请求的输出优先于背景故事。如果用户要求提供其原始输入的按时间顺序排列的表格，就返回该表格；不要因为其动机提到了某个事件，就改为提供主题分析。

## 证据范围与完整性

默认情况下，发现所有活跃的 Claude 配置目录，以及 `~/.claude/history-sources.json` 中注册的所有归档。根据 Session ID 和内容标识对物理副本去重，并使用记录时间戳，而不是文件 mtime。限定到某个明确 `--home` 的结果只是诊断切片，不代表完整性。

将 Claude 的记录标签视为存储元数据，而不是作者身份的证明。顶层的 `type: user` 记录可能包含命令封装、钩子样板、完整粘贴的文档、由代理生成的文本，或系统占位符。用户在助手忙碌时输入的文本可能位于 `attachment.queued_command.prompt` 中，并带有 `origin.kind: human`；不要只读取 user 记录而遗漏这些更正。

在解释架构、作者身份、sidechain、附件记录、压缩或文件历史快照时，请阅读 [references/session_file_format.md](references/session_file_format.md)。在构建或修复可选的 BM25/向量索引之前，请阅读
[references/hybrid_history_recall.md](references/hybrid_history_recall.md)。有关精确的搜索、分类和恢复示例，请阅读
[references/workflow_examples.md](references/workflow_examples.md)。

## 命令

将每个脚本解析为相对于此 SKILL.md 的路径；不要在机器上搜索同名辅助程序，也不要在内联方式中重新创建 JSONL 解析器。

### 最近清单

```text
<skill-dir>/scripts/list_local_history.py \
  --source claude --cwd <workspace> --limit 20 --language zh
```

预期输出：包含明确源诊断信息、Session ID、
内部时间范围、项目、标题以及归档/子代理标记的 Claude 部分。当工作区未知时，使用
`--all-projects`。

### 精确 Session 证据

```text
<skill-dir>/scripts/read_claude_session.py --session <SESSION_ID>

# Add this only when the caller intentionally wants to restrict lookup to one workspace.
<skill-dir>/scripts/read_claude_session.py --session <SESSION_ID> --project <workspace>
```

预期输出：`# Claude Code Session Evidence Briefing`、Session 身份、
压缩边界、按时间顺序排列的用户/助手交接记录、排队中的人工提示、
结束原因、未解决的调用、子代理状态、涉及的文件、记忆以及当前工作区状态。精确读取器始终解析每一条物理 Session 记录，
包括压缩之前的记录；`--full` 仅会取消输出字符截断。它会检查活动副本和已注册的归档副本，
只接受完全相同的副本或严格追加记录的超集；如果副本存在分歧、存在多个 Session 身份、缺少记录级 Session 身份、
JSONL 格式错误或字节不可读，则会显式失败。使用精确的 Session ID 且不指定 `--project` 时，
它会搜索已发现的活动主目录和已注册归档中的每个项目；显式指定的 `--project` 仍然会严格限制搜索范围。
文件名本身绝不能证明 Session 身份。

### 全事件关键词搜索

```text
<skill-dir>/scripts/analyze_sessions.py search \
  --all-projects --exclude-session <CURRENT_ID> \
  --from-date <YYYY-MM-DD> --to-date <YYYY-MM-DD> \
  '<keyword-1>' '<keyword-2>'
```

搜索用户/助手消息、思考内容、工具输入/结果、压缩摘要、
附件、队列和文件快照。排除当前 Session，因为否则查询本身必然会匹配到当前 Session。
默认排除代理提示；仅当用户明确要求包含这些内容时，才添加 `--include-agent-prompts`。

### 人工输入导出

```text
<skill-dir>/scripts/extract_user_messages.py \
  <persistent-output-base> --days 7 --group-by session
```

这会生成 Markdown 和 HTML。它会将存储污染与人工撰写的文本分离，
并恢复排队中的提示。保留时间戳、重复项和 Session 边界；
除非用户要求，否则不要再添加第二层主题分类。

### 已删除内容恢复

恢复操作会写入文件，因此应与普通读取分开。首先针对精确的 Session 文件运行恢复报告，
检查每个拟定目标位置，然后仅在用户要求恢复内容后才执行写入。绝不要直接恢复到当前项目树上进行覆盖。

## 读取结果约定

每个回答都必须说明：

1. **读取的来源** — 活动主目录、已注册归档、精确的 Session 文件。
2. **覆盖范围** — Session ID 和内部时间窗口。
3. **结果** — 按要求的格式提供原始时间顺序或匹配到的证据。
4. **缺口** — 无法读取的文件、缺失的父级/附件字节、排除的旁支，
   或任何未搜索的范围。

“未找到”意味着“在所声明的覆盖范围内未找到”，绝不意味着“从未发生过”。
不要将压缩摘要称为逐字历史记录；它是用于继续工作的辅助内容，对于承载关键结论的声明，
必须结合原始记录和当前工作区进行核查。

## 防护规则

- 保持普通读取模式为只读。
- 不要运行 `claude --resume` 或 `claude --continue`。
- 不要使用文件 mtime 作为对话时间顺序。
- 当精确的 Session ID、日期范围、项目或现有混合索引可以回答问题时，不要运行无界的全历史扫描。
- 未经用户明确批准，不要将原始历史记录分享至本地机器之外；其中可能包含凭据和私密业务上下文。
- 在超时或源数据格式错误后，不要报告搜索已完成。

## 路由器与旧版兼容性

`daymade-claude-code:local-conversation-history` 是跨提供商路由器。它会将 Claude 读取请求和所有 Kimi CLI 请求发送到此处，并且不会替代此 Skill 的身份或证据契约。新的 Codex 请求会路由至 `daymade-claude-code:read-codex-history`。

**Kimi CLI 是此 Skill 的实时入口，而不是旧版入口。** 它没有自己的读取器，因此只能通过上方任务表中的两个命令访问；仅根据 Claude 数据回答 Kimi 问题会产生错误的“从未发生过”结论。主目录解析顺序为 `--kimi-home` > `KIMI_HOME` > `~/.kimi-code`。

以前的 `claude-code-history-files-finder` 还提供可选的 Codex 和 Kimi 分支。其原始说明保留在
[references/legacy_cross_provider_workflow.md](references/legacy_cross_provider_workflow.md)
中，作为迁移和回归证据的冻结快照——应阅读它以了解旧契约的内容，但不要将其当作当前发布内容的说明。