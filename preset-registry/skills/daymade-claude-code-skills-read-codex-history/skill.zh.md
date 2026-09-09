---
name: read-codex-history
description: >-
  Reads, searches, and exports local OpenAI Codex history without continuing the
  old task. Lists recent Codex sessions, extracts exact prompt-ledger inputs by
  Session, locates a rollout by verified session_meta identity, reconstructs one
  chronological user/assistant timeline with fork and compaction lineage, and
  performs bounded keyword search across live and archived rollouts. Use whenever
  the user asks what they told Codex, wants recent original inputs, a Codex Session
  ID, full prior context, fork ancestry, or evidence of what a Codex run did. For
  Claude Code history use read-claude-code-history.
argument-hint: "[session-id | keywords | workspace-path]"
---
# 读取 Codex 历史记录

仅读取 Codex 证据。不要继续旧任务，也不要修改其项目。如果用户希望在读取完成后执行操作，请将已验证的证据传递给 `daymade-claude-code:continue-codex-work`。

## Codex 有三个不同的历史记录界面

| 界面 | 权威性 | 用途 |
|---|---|---|
| `<codex-home>/history.jsonl` | 用户提交的内容，以 Session ID 和内部 epoch 时间戳为键 | 精确的近期用户输入表 |
| `state_*.sqlite` | 库存元数据，例如 cwd、标题、更新时间和 rollout 路径 | 快速列出记录和发现候选项 |
| `sessions/**/rollout-*.jsonl` 和 `archived_sessions/**` | 完整的用户/助手/工具/压缩/分叉事件流 | 会话证据、谱系、行为审计和关键词搜索 |

不要用一个界面替代另一个界面。提示词日志中的一行只能证明用户提交了什么，不能证明 Agent 回答了什么。状态数据库中的路径在 rollout 的 `session_meta.id` 匹配之前只能作为候选项。rollout 可能存在但没有提示词日志记录，`/fork` 提示也可能存在但没有子 rollout。

请阅读 [references/storage_and_portability.md](references/storage_and_portability.md)，了解源发现、时间戳、写入锁语义、旧版 Kimi 兼容性和存储失败。请在解释分叉快照、压缩、事件流或结束原因之前阅读
[references/codex_rollout_format.md](references/codex_rollout_format.md)。

## 根据请求的结果选择路径

| 用户想要 | 使用 |
|---|---|
| 近期 Codex 会话、标题、ID 或确认存在写入锁的证据 | `scripts/list_local_history.py --source codex` |
| 按从新到旧顺序列出精确的近期用户输入，并按 Session 分组 | `scripts/list_codex_user_inputs.py` |
| 整个对话的原始输入数量和引文，包括继承的历史记录 | `scripts/reconcile_codex_inputs.py --session <ID>` |
| 根据内部身份定位一个确切的 rollout | `scripts/analyze_sessions.py locate-codex <ID>` |
| 按关键词搜索完整的 rollout 事件 | `scripts/analyze_sessions.py search --codex-only` |
| 证据完成后继续执行 | 停止读取并调用 `daymade-claude-code:continue-codex-work` |

请求的输出优先于请求的动机。“显示我近期的原始输入”意味着按时间顺序排列的原始输入表，而不是反馈分类、主题挖掘、交互式应用或所有历史会话。

对于“这次对话中我发送了多少条消息/反馈；逐字列出它们”，请阅读 [references/user_input_reconciliation.md](references/user_input_reconciliation.md)。使用 reconciler 组合现有日志和严格的谱系读取器。它会保留每次出现、原始字符串和来源坐标。将退出码 2 或 `complete: false` 视为结果不完整：`scope_input_count: null` 不等于零，已验证的输入也不构成完整总数。在提供任何基于哈希的注入排除项之前，根据其实际来源检查未匹配的记录。说明计数单位和截止点；不要将消息数量称为不同批评的数量。普通的近期输入请求仍使用仅日志路径。

## 命令

相对于此 SKILL.md 解析脚本路径。不要使用临时拼接的 SQLite、Node、`jq` 或递归 grep 重新构建连接。

### 最近清单

```text
<skill-dir>/scripts/list_local_history.py \
  --source codex --cwd <workspace> --limit 20 --language zh
```

写入者锁输出仅包含肯定结果：持有锁证明在快照期间持有了该确切的咨询锁。它无法识别进程或证明进程仍然存活；未标记的行也不能证明 Session 已停止。

### 确切的原始输入

```text
# Global recent window, then group by Session
<skill-dir>/scripts/list_codex_user_inputs.py --recent 200 --language zh

# Expand exact Sessions already shown, preserving their order
<skill-dir>/scripts/list_codex_user_inputs.py \
  --session-id <ID-1> --session-id <ID-2> \
  --per-session 100 --language zh
```

Markdown 是供人阅读的表面形式；JSON 保留存储的字符串值，供取证或机器使用。保留重复项、行顺序、时间戳、措辞和 Session 边界。不要臆造标题，也不要将一个 Session 拆分为语义类别。

### 对齐后的完整对话输入

```text
<skill-dir>/scripts/reconcile_codex_inputs.py --session <EXACT_ID> --format json
```

对于所选 Session 中明确的包含性截止点，使用 `--through-record`；仅在用户确实要求排除时使用 `--omit-first` / `--omit-last`。这两个选项都不能决定某条消息是开场指令还是反馈。解决间隙后，使用 `--format markdown` 获取逐字的编号引文。阅读关联的对齐参考，了解结果字段、已审查的排除项、部分结果以及仅用于确定性测试装置的验证。

### 确切的 Session 证据和谱系

```text
<skill-dir>/scripts/read_codex_session.py --session <SESSION_ID> --full
```

预期输出：`# Codex Session Evidence Briefing`、经过验证的所选身份、从根节点到子节点的分叉谱系、确切的父级字节边界、按时间顺序的交接、压缩后的上下文、最新计划、工具调用、文件、错误、结束原因以及工作区状态。如果状态数据库指向身份不匹配的 rollout，读取器必须拒绝它，并尝试使用确切的 `session_meta.id` 定位器；绝不能因为标题或文件名看起来接近，就继续使用错误的文件。如果实时副本和归档副本共享同一个 ID，读取器接受字节完全相同的副本，或严格的仅追加超集；否则必须因存在歧义而失败。每条选定的 JSONL 记录以及继承的 JSONL 记录都必须严格解析；格式错误的行不能被纳入一个看似完整的回执。

如果完整简报对于单个模型上下文而言过大，则将其一次性写入私有临时文件，并在读取前记录其 SHA-256 和行数。这个不可变文件仍然是唯一的简报；“一份简报”并不意味着一次 stdout 负载或一次单体式上下文加载。使用其现有标题或确切的记录坐标读取有界且不重叠的范围，依据已记录的行数保持覆盖范围，并将每个未读取范围报告为间隙。不要使用不同的截断方式重新运行读取器，再将输出拼接成一份看似完整的时间线。

### 有界的完整事件搜索

```text
<skill-dir>/scripts/analyze_sessions.py search \
  --codex-only --all-projects --exclude-session <CURRENT_ID> \
  --from-date <YYYY-MM-DD> --to-date <YYYY-MM-DD> \
  '<keyword-1>' '<keyword-2>'
```

从精确的 ID、项目、日期或已知资源名称开始。广泛扫描设有止损机制，必须明确失败，而不能将部分结果呈现为完整结果。精确 ID 定位器比语料库扫描节省数秒。

## 身份与谱系门禁

在对命名 Session 作出任何行为声明之前：

1. 如果引用用户输入，验证 prompt-ledger 中的 Session ID。
2. 根据内部的 `session_meta.id` 定位 rollout 候选项，而不能仅依据文件名。
3. 解析选定的 rollout，并要求 `session_meta.id == requested ID`。
4. 对每条 fork 边，要求其声明的父 ID 以及精确的 `history_base.end_byte_offset`；对于缺失、含糊、循环或谱系不匹配的情况，应拒绝读取父项当前的尾部。对于没有 `history_base`、且将其父项的 session_meta 作为紧接着的下一条记录内联的旧版 rollout，则应逐条记录与真实父文件进行验证，然后才能信任其派生的字节边界。
5. 明确报告仅存在 prompt 或仅存在 rollout 的缺口。

此门禁直接修正了两个已观察到的案例：prompt-ledger 中的 Session 指向了另一个 rollout 的状态 DB，以及一个没有子 rollout 的 `/fork` 输入。

## 读取结果契约

每个回答必须说明：

1. **已读取的来源** — prompt ledger、state DB、live/archive rollouts。
2. **覆盖范围** — Session IDs、项目、内部时间范围。
3. **结果** — 请求的原始表格、时间线或匹配项。
4. **身份/谱系状态** — 已验证、仅 prompt、仅 rollout 或不匹配。
5. **缺口** — 格式错误/无法读取的来源、缺失的父项、未包含的附件字节、超时或未搜索的范围。

“未找到”仅适用于此次覆盖范围。不要将超时或不完整的扫描称为否定结果。

## 防护措施

- 保持此 Skill 为只读；不得恢复、归档、重命名、删除或修复。
- 不要运行 `codex resume`、`codex --continue` 或新的实现实验。
- 不要直接将数 MB 的 rollout 加载到上下文中；使用随附的读取器。
- 不要根据进程名称、cwd 或写入锁缺失来推断 Session 状态或所有权。
- 除非用户明确要求分享，否则将原始历史保留在本地。

## 路由器与旧版兼容性

当前的 `local-conversation-history` 是跨提供商路由器；它会将特定于提供商的 Codex 读取请求发送到此处，但不会取代此 Skill 的身份、谱系或证据契约。旧版的组合命令契约仍保留在 [references/legacy_multi_provider_inventory.md](references/legacy_multi_provider_inventory.md) 中，因此其 Kimi 分支和历史标志不会被静默删除。特定于提供商的 Claude 请求会路由到 `daymade-claude-code:read-claude-code-history`。