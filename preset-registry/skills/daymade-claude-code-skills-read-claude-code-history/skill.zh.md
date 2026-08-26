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
  session contained before continuing it. For Codex history use read-codex-history.
argument-hint: "[session-id | keywords | workspace-path]"
---
# 读取 Claude Code 历史记录

仅读取 Claude Code 证据。不要恢复旧进程、编辑其项目，或将读取请求转变为继续任务。当用户之后要求执行操作时，将经过验证的证据交给 `daymade-claude-code:continue-claude-code-work`。

## 根据请求的结果进行路由

| 用户想要的内容 | 使用 |
|---|---|
| 最近的 Claude Code 会话、标题、日期或 ID | `scripts/list_local_history.py --source claude` |
| 将一个已知会话重建为按时间顺序排列的证据简报 | `scripts/read_claude_session.py --session <ID>` |
| 用户最近输入的内容，包括人工排队的提示 | `scripts/extract_user_messages.py` |
| 按关键词查找某段对话、引文、文件、工具结果或操作 | `scripts/analyze_sessions.py search` |
| 之前的工作（其措辞可能已发生变化） | 在检查索引状态后使用 `scripts/history_index.py recall` |
| 某个时间窗口内会话的结束方式 | `scripts/analyze_sessions.py triage` |
| Claude 文件历史记录中保存的已删除/覆盖文件 | `scripts/recover_content.py` |
| 继续经过验证的 Claude 会话 | 停止读取并调用 `daymade-claude-code:continue-claude-code-work` |

请求的输出优先于背景故事。如果用户要求提供其原始输入的时间顺序表格，就返回该表格；不要因为其动机提到了某个事件，就用主题分析替代它。

## 证据范围与完整性

默认情况下，发现所有活动中的 Claude 配置主目录，以及 `~/.claude/history-sources.json` 中登记的所有归档。根据 Session ID 和内容身份标识对物理副本去重，并使用记录时间戳，而不是文件 mtime。限定到一个明确的 `--home` 的结果只是诊断切片，不代表完整性声明。

将 Claude 的记录标签视为存储元数据，而不是作者身份的证明。顶层 `type: user` 记录可能包含命令封装、钩子样板、完整粘贴的文档、代理生成的文本或系统占位符。用户在助手忙碌时输入的文本可能位于 `attachment.queued_command.prompt` 中，并带有 `origin.kind: human`；不要只读取 user 记录而遗漏这些更正。

解释架构、作者身份、sidechain、附件记录、压缩或文件历史快照时，请阅读 [references/session_file_format.md](references/session_file_format.md)。在构建或修复可选的 BM25/向量索引之前，请阅读
[references/hybrid_history_recall.md](references/hybrid_history_recall.md)。有关精确的搜索、分类和恢复示例，请阅读
[references/workflow_examples.md](references/workflow_examples.md)。

## 命令

将每个脚本相对于此 SKILL.md 进行解析；不要在机器上搜索同名辅助程序，也不要在内联代码中重新创建 JSONL 解析器。

### 最近记录清单

```text
<skill-dir>/scripts/list_local_history.py \
  --source claude --cwd <workspace> --limit 20 --language zh
```

预期输出：一个 Claude 部分，其中包含明确的来源诊断信息、Session ID、内部时间范围、项目、标题，以及归档/子代理标记。在工作区未知时使用
`--all-projects`。

### 精确的 Session 证据

```text
<skill-dir>/scripts/read_claude_session.py --session <SESSION_ID> --project <workspace>
```

预期输出：`# Claude Code Session Evidence Briefing`、Session 身份、
压缩边界、按时间顺序排列的用户/助手交接记录、
排队中的人工提示、结束原因、未解决的调用、子代理状态、
涉及的文件、记忆以及当前工作区状态。精确读取器始终解析每一条物理
Session 记录，包括压缩前的记录；`--full` 仅取消输出字符截断。它会检查活动副本和已注册的归档副本，
只接受完全一致的副本或严格追加的超集；如果副本存在差异、存在多个
Session 身份、缺少记录级 Session 身份、JSONL 格式错误或字节无法读取，
则会明确失败。单凭文件名绝不能证明 Session 身份。

### 全事件关键词搜索

```text
<skill-dir>/scripts/analyze_sessions.py search \
  --all-projects --exclude-session <CURRENT_ID> \
  --from-date <YYYY-MM-DD> --to-date <YYYY-MM-DD> \
  '<keyword-1>' '<keyword-2>'
```

搜索用户/助手消息、思考内容、工具输入/结果、压缩摘要、
附件、队列和文件快照。排除当前 Session，因为否则查询本身必然会匹配到当前 Session。
默认排除代理提示；只有当用户明确要求时，才添加 `--include-agent-prompts`。

### 人工输入导出

```text
<skill-dir>/scripts/extract_user_messages.py \
  <persistent-output-base> --days 7 --group-by session
```

此操作会生成 Markdown 和 HTML。它会将存储污染与人工撰写的文本分离，
并恢复排队中的提示。保留时间戳、重复内容和 Session 边界；
除非用户要求，否则不要再添加第二层主题分类。

### 已删除内容恢复

恢复操作会写入文件，因此应与普通读取分开处理。首先针对精确的 Session 文件运行
恢复报告，审阅每个拟定的目标位置，然后仅在用户要求恢复内容后再写入。
绝不要直接恢复并覆盖当前项目树。

## 读取结果契约

每个回答都必须说明：

1. **读取的来源** — 活动存储位置、已注册的归档、精确的 Session 文件。
2. **覆盖范围** — Session ID 和内部时间窗口。
3. **结果** — 按请求的格式提供原始时间线或匹配证据。
4. **缺口** — 无法读取的文件、缺失的父记录/附件字节、排除的旁支，
   或任何未搜索的范围。

“未找到”意味着“在所述覆盖范围内未找到”，绝不意味着“从未发生”。
不要将压缩摘要称为逐字历史；它是用于继续工作的辅助信息，必须针对原始记录和当前工作区
核查其中承载关键结论的内容。

## 防护措施

- 保持普通读取模式为只读。
- 不要运行 `claude --resume` 或 `claude --continue`。
- 不要使用文件 mtime 作为对话时间线。
- 当精确 Session ID、日期范围、项目或现有混合索引能够回答问题时，
  不要运行无界的全历史扫描。
- 未经用户明确批准，不要将原始历史分享至本地计算机之外；
  其中可能包含凭据和私密业务上下文。
- 在超时或源格式错误后，不要将搜索报告为已完成。

## 旧版兼容性

原先的 `claude-code-history-files-finder` 还提供了可选的 Codex 和 Kimi
分支。它们的原始说明保留在
[references/legacy_cross_provider_workflow.md](references/legacy_cross_provider_workflow.md)
中，用于迁移和回归证据。新的 Codex 请求必须路由到
`daymade-claude-code:read-codex-history`；旧版 Kimi 命令仍仅可通过该参考文档使用，
除非实际使用证明有必要提供专用的 Kimi 读取器。