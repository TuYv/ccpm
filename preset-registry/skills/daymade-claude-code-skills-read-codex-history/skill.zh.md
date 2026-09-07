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
| `<codex-home>/history.jsonl` | 用户提交的内容，以会话 ID 和内部纪元时间戳为索引 | 精确的近期用户输入表 |
| `state_*.sqlite` | 清单元数据，例如 cwd、标题、更新时间和 rollout 路径 | 快速列出记录和发现候选项 |
| `sessions/**/rollout-*.jsonl` 和 `archived_sessions/**` | 完整的用户/助手/工具/压缩/分叉事件流 | 会话证据、血缘关系、行为审计和关键词搜索 |

不要用一个界面替代另一个界面。提示词账本中的一行可以证明提交了什么，但不能证明 Agent 回答了什么。状态数据库中的路径在 rollout 的 `session_meta.id` 匹配之前，仅仅是候选项。rollout 可能存在而没有提示词账本行，`/fork` 提示也可能存在而没有子 rollout。

请阅读 [references/storage_and_portability.md](references/storage_and_portability.md)，了解源发现、时间戳、写入锁语义、旧版 Kimi 兼容性和存储失败。请在解释分叉快照、压缩、事件流或结束原因之前，阅读
[references/codex_rollout_format.md](references/codex_rollout_format.md)。

## 根据请求的结果进行路由

| 用户想要 | 使用 |
|---|---|
| 近期 Codex 会话、标题、ID 或明确的写入锁证据 | `scripts/list_local_history.py --source codex` |
| 按时间从新到旧排列、按会话分组的精确近期用户输入 | `scripts/list_codex_user_inputs.py` |
| 根据内部身份定位一个确切的 rollout | `scripts/analyze_sessions.py locate-codex <ID>` |
| 重建一个会话及其声明的父级快照 | `scripts/read_codex_session.py --session <ID>` |
| 按关键词搜索完整的 rollout 事件 | `scripts/analyze_sessions.py search --codex-only` |
| 证据收集完成后继续 | 停止读取并调用 `daymade-claude-code:continue-codex-work` |

请求的输出优先于动机。“显示我近期的原始输入”意味着按时间顺序排列的原始输入表，而不是反馈分类、主题挖掘、交互式应用或所有历史会话。

## 命令

相对于此 SKILL.md 解析脚本路径。不要使用临时的 SQLite、Node、`jq` 或递归 grep 重建连接。

### 近期清单

```text
<skill-dir>/scripts/list_local_history.py \
  --source codex --cwd <workspace> --limit 20 --language zh
```

写入锁输出仅包含肯定结果：持有锁证明该确切的咨询锁在快照期间被持有。它无法识别进程，也不能证明进程仍在运行；未标记的行不能证明会话已停止。

### 精确的原始输入

```text
# 全局近期窗口，然后按 Session 分组
<skill-dir>/scripts/list_codex_user_inputs.py --recent 200 --language zh

# 展开已显示的确切 Sessions，同时保留其顺序
<skill-dir>/scripts/list_codex_user_inputs.py \
  --session-id <ID-1> --session-id <ID-2> \
  --per-session 100 --language zh
```

Markdown 是面向人类的表层；JSON 保留存储的字符串值，供取证或机器使用。保留重复项、行顺序、时间戳、措辞和 Session 边界。不要臆造标题，也不要将一个 Session 拆分为语义类别。

### 精确的 Session 证据和沿袭关系

```text
<skill-dir>/scripts/read_codex_session.py --session <SESSION_ID> --full
```

预期输出：`# Codex Session Evidence Briefing`、已验证的选定身份、从根到子级的分叉沿袭关系、精确的父级字节边界、按时间顺序的交接记录、压缩后的上下文、最新计划、工具调用、文件、错误、结束原因和工作区状态。如果状态数据库指向身份不匹配的 rollout，读取器必须拒绝它，并尝试使用精确的 `session_meta.id` 定位器；绝不能因为其标题或文件名看起来接近，就继续读取错误的文件。当在线副本和归档副本共享同一 ID 时，读取器接受字节完全相同的副本，或严格的仅追加超集；否则必须因存在歧义而失败。每条选定的 JSONL 记录和继承的 JSONL 记录都必须严格解析；格式错误的行不能被拼接成一份看似完整的回执。

如果完整简报对于单个模型上下文而言过大，则将其一次性写入私有临时文件，并在读取前记录其 SHA-256 和行数。该不可变文件仍然是唯一的简报；“一份简报”并不意味着一次 stdout 负载或一次整体上下文加载。使用其现有标题或精确记录坐标读取有界且不重叠的范围，根据记录的行数保持覆盖范围，并将每个未读取的范围报告为缺口。不要使用不同的截断参数重新运行读取器，再将输出拼接成一份看似完整的时间线。

### 有界的完整事件搜索

```text
<skill-dir>/scripts/analyze_sessions.py search \
  --codex-only --all-projects --exclude-session <CURRENT_ID> \
  --from-date <YYYY-MM-DD> --to-date <YYYY-MM-DD> \
  '<keyword-1>' '<keyword-2>'
```

从精确 ID、项目、日期或已知资产名称开始。广泛扫描具有止损机制，并且必须明确失败，而不是将部分结果呈现为完整结果。精确 ID 定位器比语料库扫描节省数秒。

## 身份和沿袭关系门禁

在对某个具名 Session 做出任何行为声明之前：

1. 如果引用用户输入，验证提示词台账中的 Session ID。
2. 根据其内部的 `session_meta.id` 定位 rollout 候选项，而不能仅根据文件名定位。
3. 解析选定的 rollout，并要求 `session_meta.id == requested ID`。
4. 对于每条分叉边，都要求其声明的父级 ID 以及精确的
   `history_base.end_byte_offset`；拒绝缺失、歧义、循环或不匹配的祖先关系，而不是读取父级当前的尾部。对于没有 `history_base`、且将其父级的 session_meta 作为紧接下一条记录内联的旧版 rollout，则必须逐条记录与真实父级文件进行核验，然后才能信任其派生的字节边界。
5. 明确报告仅提示词或仅 rollout 的缺口。

此门禁直接修正了两个已观察到的案例：提示词台账中的 Session 其状态数据库指向了另一个 rollout，以及没有子级 rollout 的 `/fork` 输入。

## 读取结果契约

每个回答都必须说明：

1. **已读取的来源** — prompt ledger、state DB、live/archive rollouts。
2. **覆盖范围** — Session IDs、项目、内部时间范围。
3. **结果** — 请求的原始表格、时间线或匹配项。
4. **身份/血缘状态** — 已验证、仅来自 prompt、仅来自 rollout 或不匹配。
5. **缺口** — 格式错误/无法读取的来源、缺失的父项、未包含的附件字节、
   超时，或未搜索的范围。

“未找到”仅适用于此覆盖范围。不要将超时或不完整扫描称为否定结果。

## 防护措施

- 保持此 Skill 为只读；它不会恢复、归档、重命名、删除或修复。
- 不要运行 `codex resume`、`codex --continue` 或新的实现实验。
- 不要将数 MB 的 rollouts 直接加载到上下文中；使用捆绑的读取器。
- 不要根据进程名称、cwd 或缺少 writer-lock 来推断 Session 状态或所有权。
- 除非用户明确要求共享，否则将原始历史保留在本地。

## 路由器与旧版兼容性

当前的 `local-conversation-history` 是跨提供商路由器；它会将特定提供商的 Codex 读取请求发送到此处，并不会取代此 Skill 的身份、血缘或证据契约。旧版的合并命令契约仍保留在
[references/legacy_multi_provider_inventory.md](references/legacy_multi_provider_inventory.md)
中，因此其 Kimi 分支和历史标志不会被静默删除。特定提供商的 Claude 请求会路由到
`daymade-claude-code:read-claude-code-history`。