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

仅读取 Codex 证据。不要继续旧任务，也不要更改其项目。如果用户希望在读取完成后执行操作，请将已验证的证据传递给 `daymade-claude-code:continue-codex-work`。

## Codex 有三个不同的历史记录界面

| 界面 | 权威性 | 用途 |
|---|---|---|
| `<codex-home>/history.jsonl` | 用户提交的内容，按 Session ID 和内部 epoch 时间戳索引 | 精确的近期用户输入表 |
| `state_*.sqlite` | 包含 cwd、标题、更新时间和 rollout 路径等清单元数据 | 快速列出记录和发现候选项 |
| `sessions/**/rollout-*.jsonl` 和 `archived_sessions/**` | 完整的用户/助手/工具/压缩/分支事件流 | 会话证据、血缘关系、行为审计和关键词搜索 |

不要用一个界面替代另一个界面。提示词账本中的一行只能证明提交了什么，不能证明 Agent 回答了什么。状态数据库中的路径在 rollout 的 `session_meta.id` 匹配之前只能视为候选项。rollout 可能存在但没有提示词账本行，而 `/fork` 提示可能存在但没有子 rollout。

请阅读 [references/storage_and_portability.md](references/storage_and_portability.md)，了解源发现、时间戳、写入锁语义、旧版 Kimi 兼容性和存储故障。解读 fork 快照、压缩、事件流或结束原因之前，请阅读 [references/codex_rollout_format.md](references/codex_rollout_format.md)。

## 根据请求的结果进行路由

| 用户想要 | 使用 |
|---|---|
| 最近的 Codex 会话、标题、ID 或明确的写入锁证据 | `scripts/list_local_history.py --source codex` |
| 从最新到最旧的精确近期用户输入，按 Session 分组 | `scripts/list_codex_user_inputs.py` |
| 按内部身份定位一个确切的 rollout | `scripts/analyze_sessions.py locate-codex <ID>` |
| 重建一个 Session 及其声明的父快照 | `scripts/read_codex_session.py --session <ID>` |
| 按关键词搜索完整的 rollout 事件 | `scripts/analyze_sessions.py search --codex-only` |
| 证据收集完成后继续执行 | 停止读取并调用 `daymade-claude-code:continue-codex-work` |

请求的输出优先于请求动机。“显示我最近的原始输入”意味着按时间顺序排列的原始输入表，而不是反馈分类、主题挖掘、交互式应用或所有历史会话。

## 命令

根据此 SKILL.md 的位置解析脚本路径。不要使用临时的 SQLite、Node、`jq` 或递归 grep 重建关联关系。

### 最近的清单

```text
<skill-dir>/scripts/list_local_history.py \
  --source codex --cwd <workspace> --limit 20 --language zh
```

写入锁输出仅表示正向结果：持有锁证明在该快照期间持有了确切的咨询锁。它不会标识进程，也不能证明进程仍处于活动状态；未标记的行不能证明 Session 已停止。

### 精确的原始输入

```text
# 全局近期窗口，然后按 Session 分组
<skill-dir>/scripts/list_codex_user_inputs.py --recent 200 --language zh

# 展开已显示的确切 Session，并保持其顺序
<skill-dir>/scripts/list_codex_user_inputs.py \
  --session-id <ID-1> --session-id <ID-2> \
  --per-session 100 --language zh
```

Markdown 是面向人类的表层表示；JSON 保留存储的字符串值，供取证或机器使用。保留重复项、行顺序、时间戳、措辞和 Session 边界。不要臆造标题，也不要将一个 Session 拆分为语义类别。

### 精确的 Session 证据和沿袭关系

```text
<skill-dir>/scripts/read_codex_session.py --session <SESSION_ID> --full
```

预期输出：`# Codex Session Evidence Briefing`、经过验证的选定身份、从根到子级的分叉沿袭关系、精确的父级字节边界、按时间顺序排列的交接记录、压缩后的上下文、最新计划、工具调用、文件、错误、结束原因以及工作区状态。如果状态数据库指向身份错误的 rollout，读取器必须拒绝它，并尝试使用精确的 `session_meta.id` 定位器；绝不能因为其标题或文件名看起来接近，就从错误的文件继续读取。当实时副本和归档副本共享同一个 ID 时，读取器接受字节完全相同的副本，或严格的仅追加超集；否则必须因存在歧义而失败。每条选定的及继承的 JSONL 记录都必须严格解析；格式错误的行不能构成一份看起来完整的回执。

如果完整简报对于单个模型上下文来说过大，则将其一次性写入私有临时文件，并在读取前记录其 SHA-256 和行数。该不可变文件仍然是唯一的简报；“一份简报”并不意味着一个 stdout 负载或一次整体的上下文加载。使用其现有标题或精确的记录坐标，读取有界且互不重叠的范围；根据已记录的行数保持覆盖范围，并将每个未读取的范围报告为缺口。不要使用不同的截断参数重新运行读取器，再将输出融合成一份看起来完整的时间顺序记录。

### 有界的完整事件搜索

```text
<skill-dir>/scripts/analyze_sessions.py search \
  --codex-only --all-projects --exclude-session <CURRENT_ID> \
  --from-date <YYYY-MM-DD> --to-date <YYYY-MM-DD> \
  '<keyword-1>' '<keyword-2>'
```

从精确 ID、项目、日期或已知资产名称开始。广泛扫描必须设置止损机制，并且必须显式失败，不能将部分结果呈现为完整结果。精确 ID 定位器比语料库扫描节省数秒。

## 身份和沿袭关系门禁

在对某个具名 Session 做出任何行为声明之前：

1. 如果引用用户输入，验证提示词日志中的 Session ID。
2. 根据其内部的 `session_meta.id` 定位 rollout 候选项，不能仅依据文件名。
3. 解析选定的 rollout，并要求 `session_meta.id == requested ID`。
4. 对于每条分叉边，要求声明的父级 ID 以及精确的
   `history_base.end_byte_offset`；如果祖先关系缺失、存在歧义、形成循环或不匹配，则拒绝读取父级当前的尾部，而不是继续读取。
5. 明确报告仅存在于提示词或仅存在于 rollout 中的缺口。

该门禁直接针对已观察到的两种情况进行修正：状态数据库指向另一 rollout 的提示词日志 Session，以及没有子级 rollout 的 `/fork` 输入。

## 读取结果契约

每个回答都必须说明：

1. **读取的来源** — 提示词日志、状态数据库、实时/归档 rollout。
2. **覆盖范围** — Session ID、项目、内部时间范围。
3. **结果** — 所请求的原始表格、时间线或匹配项。
4. **身份/沿袭关系状态** — 已验证、仅提示词、仅 rollout 或不匹配。
5. **缺口** — 格式错误/无法读取的来源、缺失的父级、未包含的附件字节、超时，或未搜索的范围。

“未找到”仅适用于此覆盖范围。不要将超时或未完成的扫描视为否定结果。

## 防护措施

- 保持此 Skill 为只读；不得恢复、归档、重命名、删除或修复。
- 不要运行 `codex resume`、`codex --continue`，也不要开始新的实现实验。
- 不要直接将数兆字节的 rollout 加载到上下文中；请使用随附的读取器。
- 不要根据进程名称、cwd 或缺少 writer-lock 来推断 Session 状态或所有权。
- 除非用户明确要求分享，否则将原始历史保留在本地。

## 路由器与旧版兼容性

当前的 `local-conversation-history` 是一个跨提供商路由器；它会将特定于提供商的 Codex 读取请求路由到此处，但不会取代此 Skill 的身份、谱系或证据契约。旧版的组合命令契约仍保留在
[references/legacy_multi_provider_inventory.md](references/legacy_multi_provider_inventory.md)
中，因此其中的 Kimi 分支和历史标志不会被静默删除。特定于提供商的 Claude 请求会路由到
`daymade-claude-code:read-claude-code-history`。