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

仅阅读 Claude Code 证据。不要恢复旧进程，不要编辑其项目，也不要将读取请求转变为继续任务。当用户之后要求执行操作时，将已验证的证据交给 `daymade-claude-code:continue-claude-code-work`。

## 根据请求的结果进行路由

| 用户想要 | 使用 |
|---|---|
| 最近的 Claude Code 会话、标题、日期或 ID | `scripts/list_local_history.py --source claude` |
| 将一个已知会话重建为按时间顺序排列的证据简报 | `scripts/read_claude_session.py --session <ID>` |
| 用户最近的原话，包括人工排队的提示 | `scripts/extract_user_messages.py` |
| 按关键词查找对话、引文、文件、工具结果或操作 | `scripts/analyze_sessions.py search` |
| 之前的工作，其措辞可能已经发生变化 | 在检查索引状态后使用 `scripts/history_index.py recall` |
| 没有已知会话 ID、日期或项目时进行广泛关键词扫描 | 先使用 `scripts/history_index.py recall` 获取线索，然后根据其返回结果限定范围，使用 `analyze_sessions.py search` |
| 某个时间范围内会话如何结束 | `scripts/analyze_sessions.py triage` |
| 恢复 Claude 文件历史记录中保留的已删除/覆盖文件 | `scripts/recover_content.py` |
| Kimi CLI 会话，此 Skill 仅负责唯一的实时 Kimi 界面 | 库存（限定为 Kimi）：`scripts/list_local_history.py --source kimi --all-projects`；全文搜索（**扩大** Claude 搜索范围，绝不限定为 Kimi）：`scripts/analyze_sessions.py search --kimi` —— 在依赖任一结果前，请先阅读下方的 **Kimi CLI** |
| 继续一个已验证的 Claude 会话 | 停止读取并调用 `daymade-claude-code:continue-claude-code-work` |

请求的输出优先于背景故事。如果用户要求的是其原始输入的时间顺序表格，就返回该表格；不要因为其动机提到了某个事件，就改为提供主题分析。

## 证据范围与完整性

默认情况下，发现所有活跃的 Claude 配置主目录，以及 `~/.claude/history-sources.json` 中注册的所有归档。按会话 ID 和内容身份对物理副本去重，并使用记录时间戳而不是文件修改时间。限定到某个显式 `--home` 的结果只是诊断切片，不代表完整性声明。

将 Claude 的记录标签视为存储元数据，而不是作者身份的证明。顶层 `type: user` 记录可能包含命令封装、钩子样板、完整粘贴的文档、代理生成的文本或系统占位符。助手忙碌时由人类输入的文本可能位于 `attachment.queued_command.prompt` 中，并带有 `origin.kind: human`；不要只读取 user 记录而遗漏这些更正。

在解释架构、作者身份、支线、附件记录、压缩或文件历史快照时，请阅读 [references/session_file_format.md](references/session_file_format.md)。在构建或修复可选的 BM25/向量索引之前，请阅读
[references/hybrid_history_recall.md](references/hybrid_history_recall.md)。有关确切的搜索、分流和恢复示例，请阅读
[references/workflow_examples.md](references/workflow_examples.md)。当你需要了解布局而非消息架构时，请阅读 [references/claude_session_format.md](references/claude_session_format.md) —— 会话在磁盘上的存储位置、项目路径如何规范化为目录名称、`sessions-index.json` 字段，以及表明转录内容已被摘要而非截断的 `compact_boundary` 标记。

## 命令

所有脚本都必须相对于此 SKILL.md 解析；不要在机器上搜索同名辅助工具，也不要内联重建 JSONL 解析器。

### 最近记录清单

```text
<skill-dir>/scripts/list_local_history.py \
  --source claude --cwd <workspace> --limit 20 --language zh
```

预期输出：包含明确来源诊断信息的 Claude 部分、Session ID、内部时间范围、项目、标题，以及归档/子代理标记。工作区未知时使用 `--all-projects`。

### 精确 Session 证据

```text
<skill-dir>/scripts/read_claude_session.py --session <SESSION_ID>

# Add this only when the caller intentionally wants to restrict lookup to one workspace.
<skill-dir>/scripts/read_claude_session.py --session <SESSION_ID> --project <workspace>
```

预期输出：`# Claude Code Session Evidence Briefing`、Session 身份、压缩边界、按时间顺序排列的用户/助手交接信息、排队中的人工提示、结束原因、未解决的调用、子代理状态、已修改文件、记忆，以及当前工作区状态。精确读取器始终解析每条物理 Session 记录，包括压缩前的记录；`--full` 仅取消输出字符截断。它会检查活动副本和已注册的归档副本，只接受完全相同或严格追加的超集；如果副本存在分歧、存在多个 Session 身份、缺少记录级 Session 身份、JSONL 格式错误或字节不可读，则会明确失败。使用精确 Session ID 且不指定 `--project` 时，它会搜索已发现的所有活动主目录和已注册归档中的每个项目；显式指定 `--project` 时则严格限制搜索范围。文件名本身绝不能证明 Session 身份。

### 全事件关键词搜索

```text
<skill-dir>/scripts/analyze_sessions.py search \
  --all-projects --exclude-session <CURRENT_ID> \
  --from-date <YYYY-MM-DD> --to-date <YYYY-MM-DD> \
  '<keyword-1>' '<keyword-2>'
```

搜索用户/助手消息、思考内容、工具输入/结果、压缩摘要、附件、排队内容和文件快照。排除当前 Session，因为否则查询本身必然会匹配自身。默认排除代理提示；只有当用户明确要求时，才添加 `--include-agent-prompts`。

### 人工输入导出

```text
<skill-dir>/scripts/extract_user_messages.py \
  <persistent-output-base> --days 7 --group-by session
```

该命令会生成 Markdown 和 HTML。它会将存储污染与人工撰写的正文分开，并恢复排队中的提示。保留时间戳、重复内容和 Session 边界；除非用户要求，否则不要增加第二层主题分类。

### 已删除内容恢复

恢复操作会写入文件，因此应与普通读取分开。首先针对精确 Session 文件运行恢复报告，审查每个建议的目标位置；只有在用户要求恢复内容后才写入。绝不要直接恢复到当前项目树中。

## 读取结果约定

每个回答都必须说明：

1. **读取的来源** — 活动主目录、已注册归档、精确 Session 文件。
2. **覆盖范围** — Session ID 和内部时间窗口。
3. **结果** — 按请求格式提供原始时间顺序或匹配证据。
4. **缺口** — 无法读取的文件、缺失的父记录/附件字节、排除的旁支，或未搜索的范围。

“未找到”表示“在所述覆盖范围内未找到”，绝不表示“从未发生过”。
不要把紧凑摘要逐字视为历史记录；它是用于继续工作的辅助信息，必须针对原始记录和当前工作区核查其中承载关键结论的内容。

## 防护措施

- 保持普通读取模式为只读。
- 不要运行 `claude --resume` 或 `claude --continue`。
- 不要使用文件 mtime 作为对话时间顺序。
- 当确切的 Session ID、日期范围、项目或现有混合索引可以回答问题时，不要运行无界的全历史扫描。多提供商扫描属于高成本操作，不得因此豁免：对索引覆盖的提供商运行 `recall`，然后仅扫描索引未覆盖的部分。在将结果视为完整之前，检查 `recall` 的 `coverage` 行。
- 未经用户明确批准，不要将原始历史记录共享到本机之外；其中可能包含凭据和私有业务上下文。
- 超时或源格式错误后，不要报告搜索已完成。

## 路由器与旧版兼容性

`daymade-claude-code:local-conversation-history` 是跨提供商路由器。它将 Claude 读取请求以及每个 Kimi CLI 请求发送到这里，并不取代本 Skill 的身份或证据契约。新的 Codex 请求路由到 `daymade-claude-code:read-codex-history`。

**Kimi CLI 是本 Skill 的实时界面，而不是旧版界面。** 它没有自己的读取器，因此任务表中的两个命令是访问它的唯一方式；仅根据 Claude 数据回答 Kimi 问题会错误地得出“从未发生过”的结论。Home 解析顺序为 `--kimi-home` > `KIMI_HOME` > `~/.kimi-code`。

**当默认 home 不存在时，并不表示存储缺失，而是它位于其他位置，工具会说明这一点。** Kimi 桌面客户端将 CLI 捆绑在自己的 Electron 运行时中，并将会话保存在该运行时下，而不是 home 目录中。因此，一台拥有数百个真实对话的机器，查询默认路径时可能完全没有结果。清单会将其尝试过的 home 打印为诊断行；在报告 Kimi 结果为空之前，先读取该行，因为“未找到 home”和“没有对话”是不同的发现。

请按以下顺序定位真实 home，而不要猜测：

1. **如果 recall 索引曾将 Kimi 纳入范围，先询问该索引。**
   `scripts/history_index.py status` 会打印 `scope.sources`，其中的 `provider:
   kimi` 条目包含其建立索引所使用的绝对 `home` 路径。只需一个命令，无需搜索。只有在 Kimi 曾被建立索引后它才能提供答案，因此在已配置的机器上这是最快的路径，在全新机器上则不会提供结果。
2. **从正在运行的进程中读取桌面客户端的用户数据目录。**
   Electron 应用会在其命令行中携带 `--user-data-dir`（`ps ax | grep -i <client>`）。捆绑的 CLI **并不直接位于其下方**：home 位于 `<user-data-dir>/daimon-share/daimon/runtime/kimi-code/home`。注意末尾的 `home` 部分：`.../runtime/kimi-code` 是 CLI 安装目录，无法通过第 4 步的测试，而其子目录 `home/` 才是存储目录。
3. **跟随 transcript 记录中的 `meta.sourcePath`。** 客户端会将对话镜像到
   `<user-data-dir>/daimon-share/daimon/agents/<agent>/memory/transcripts/days/<YYYY-MM-DD>/conv-*.jsonl`，
   每条记录的 `meta.sourcePath` 都是其来源的绝对 wire 路径，其中包含 home。不要查看 `kimi-agent/conversation-archive.json` ——该文件只保存标题和时间戳，不包含任何路径。
4. **在使用前进行确认。** 真正的 Kimi home 包含 `session_index.jsonl` 和 `sessions/wd_<workspace>_<hash>/` 树；只有在两者都存在时，才将其作为 `--kimi-home` 传入。这项测试可以区分存储目录与上一级的 CLI 安装目录。

决定已定位存储读取是否正确的两个 schema 事实。较新的构建会从每个会话的 `state.json` 中移除 `id` 和 `cwd`，并仅将工作目录保存在 `session_index.jsonl` 中，因此会话所属项目必须来自该映射，而不能来自其自身的状态文件。同一个 `sessions/` 树中还包含内部代理运行记录和真实对话，它们唯一的区别是目录前缀——标题生成、保管库维护和技能摘要都是机器产生的聊天内容，不属于历史记录；在真实存储中，它们的数量还超过了真正的对话。

**正确的 Kimi 命令仍会返回一个看似可信但实际错误的答案的三种方式。**
每种情况都已在真实存储上复现；它们都不会明确报错，因此在报告 Kimi 结果前请检查：

- **清单默认限定为当前目录。** Kimi 会话的项目是其自身的工作区，而这几乎从来不是你运行命令时所在的目录，因此在正确的主目录上执行裸命令会返回 `0 conversations`，**且不会有诊断行**，因为已找到主目录，并没有发生错误。对于任何未明确针对当前仓库的问题，都应添加 `--all-projects`。这个零值最容易被报告为“你没有 Kimi 对话”。
- **`--kimi` 会扩大 Claude 搜索范围，而不会将其限定为 Kimi。** 与只选择 Kimi 的 `--source kimi` 不同，`--kimi` 的含义是*同时*搜索 Kimi：该运行仍会扫描所有 Claude 来源，并且 Kimi 判定会出现在输出末尾，而输出可能多达数万行。没有仅限 Kimi 的搜索模式。请专门读取 Kimi 部分，绝不要将此次运行的标题匹配数报告为 Kimi 数量。
- **搜索路径没有自动会话过滤器。** 清单默认排除内部代理运行记录并报告数量；搜索不会排除，因此 `ctitle-` / `dvlt-` / `sklsum-` 命中会与真实对话混在一起，必须根据 session-id 前缀手动过滤。

**读取一个已定位的 Kimi 会话没有捆绑命令。** `read_claude_session.py` 只解析 Claude 会话文件，在接收 Kimi 会话 ID 时会以非零状态退出。Kimi 方面的功能是清单和关键词搜索；要显示对话内容，请直接读取会话的 `agents/<agent>/wire.jsonl`，并根据上述记录类型进行解释。请说明这是直接读取文件，而不要将其描述为与 Claude reader 产生的经过验证的重建结果相同。

原先的 `claude-code-history-files-finder` 还提供可选的 Codex 和 Kimi 分支。其原始说明保存在
[references/legacy_cross_provider_workflow.md](references/legacy_cross_provider_workflow.md)
中，作为迁移和回归证据的冻结快照——应阅读它以了解旧合约的内容，但绝不要将其作为当前发布内容的描述。