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

仅阅读 Codex 证据。不要继续旧任务或更改其项目。如果用户希望在读取完成后执行操作，请将已验证的证据传递给 `daymade-claude-code:continue-codex-work`。

## Codex 有三个不同的历史记录界面

| 界面 | 权威性 | 用途 |
|---|---|---|
| `<codex-home>/history.jsonl` | 用户提交的内容，以 Session ID 和内部 epoch 时间戳为键 | 精确的近期用户输入表 |
| `state_*.sqlite` | 清单元数据，例如 cwd、标题、更新时间和 rollout 路径 | 快速列出和发现候选项 |
| `sessions/**/rollout-*.jsonl` 和 `archived_sessions/**` | 完整的用户/助手/工具/压缩/分叉事件流 | Session 证据、血缘关系、行为审计和关键词搜索 |

不要用一个界面替代另一个界面。提示词账本中的一行只能证明提交了什么，不能证明 Agent 回复了什么。状态数据库中的路径在 rollout 的 `session_meta.id` 匹配之前只能视为候选项。rollout 可能存在而没有提示词账本记录，`/fork` 提示也可能存在而没有子 rollout。

请阅读 [references/storage_and_portability.md](references/storage_and_portability.md)，了解源发现、时间戳、写入锁语义、旧版 Kimi 兼容性和存储故障。解释分叉快照、压缩、事件流或结束原因之前，请阅读
[references/codex_rollout_format.md](references/codex_rollout_format.md)。

## 根据请求的结果进行路由

| 用户想要 | 使用 |
|---|---|
| 近期 Codex Session、标题、ID 或明确的写入锁证据 | `scripts/list_local_history.py --source codex` |
| 从最新到最旧的精确近期用户输入，按 Session 分组 | `scripts/list_codex_user_inputs.py` |
| 按内部标识定位一个精确的 rollout | `scripts/analyze_sessions.py locate-codex <ID>` |
| 重建一个 Session 及其声明的父快照 | `scripts/read_codex_session.py --session <ID>` |
| 按关键词搜索完整 rollout 事件 | `scripts/analyze_sessions.py search --codex-only` |
| 证据收集完成后继续 | 停止读取并调用 `daymade-claude-code:continue-codex-work` |

请求的输出优先于请求的动机。“显示我最近的原始输入”意味着按时间顺序排列的原始输入表，而不是反馈分类、主题挖掘、交互式应用或所有历史 Session。

## 命令

相对于此 SKILL.md 解析脚本路径。不要使用临时的 SQLite、Node、`jq` 或递归 grep 重新构建连接。

### 近期清单

```text
<skill-dir>/scripts/list_local_history.py \
  --source codex --cwd <workspace> --limit 20 --language zh
```

写入锁输出仅包含肯定结果：持有的锁证明在快照期间持有了该精确的咨询锁。但它不能确定进程，也不能证明进程仍然存活；未标记的行不能证明该 Session 已停止。

### 精确的原始输入

```text
# Global recent window, then group by Session
<skill-dir>/scripts/list_codex_user_inputs.py --recent 200 --language zh

# Expand exact Sessions already shown, preserving their order
<skill-dir>/scripts/list_codex_user_inputs.py \
  --session-id <ID-1> --session-id <ID-2> \
  --per-session 100 --language zh
```

Markdown 是面向人类的呈现层；JSON 保留存储的字符串值，供取证或机器使用。保留重复项、行顺序、时间戳、措辞以及 Session 边界。不要臆造标题，也不要将一个 Session 拆分为语义类别。

### 精确的 Session 证据与血缘关系

```text
<skill-dir>/scripts/read_codex_session.py --session <SESSION_ID> --full
```

预期输出：`# Codex Session Evidence Briefing`、已验证的选定身份、从根到子级的分叉血缘关系、精确的父级字节边界、按时间顺序的交接、压缩后的上下文、最新计划、工具调用、文件、错误、结束原因以及工作区状态。如果状态数据库指向身份不匹配的 rollout，读取器必须拒绝该 rollout，并尝试使用精确的 `session_meta.id` 定位器；绝不能因为其标题或文件名看起来接近就从错误的文件继续读取。当实时副本和归档副本共享同一个 ID 时，读取器接受字节完全相同的副本，或严格的仅追加超集；否则将其判定为有歧义并失败。每条选定的及继承的 JSONL 记录都必须严格解析；格式错误的行不能构成一份看起来完整的回执。

### 有界的完整事件搜索

```text
<skill-dir>/scripts/analyze_sessions.py search \
  --codex-only --all-projects --exclude-session <CURRENT_ID> \
  --from-date <YYYY-MM-DD> --to-date <YYYY-MM-DD> \
  '<keyword-1>' '<keyword-2>'
```

从精确 ID、项目、日期或已知资产名称开始。广泛扫描必须设置止损条件，并且必须明确失败，而不是将部分结果呈现为完整结果。精确 ID 定位器比语料库扫描节省数秒。

## 身份与血缘关系门禁

在对命名的 Session 作出任何行为声明之前：

1. 如果引用用户输入，验证提示词账本中的 Session ID。
2. 根据内部的 `session_meta.id` 定位 rollout 候选项，不能仅依据文件名。
3. 解析选定的 rollout，并要求 `session_meta.id == requested ID`。
4. 对于每条分叉边，要求其声明的父级 ID 以及精确的 `history_base.end_byte_offset`；对于缺失、存在歧义、形成循环或不匹配的祖先关系，应拒绝读取，而不是读取父级当前的尾部。
5. 明确报告仅存在提示词或仅存在 rollout 的缺口。

此门禁直接针对两个已观察到的案例进行纠正：提示词账本中的 Session 所对应的状态数据库指向了另一个 rollout，以及没有子级 rollout 的 `/fork` 输入。

## 读取结果契约

每个回答都必须说明：

1. **读取的来源** — 提示词账本、状态数据库、实时/归档 rollout。
2. **覆盖范围** — Session ID、项目、内部时间范围。
3. **结果** — 所请求的原始表格、时间线或匹配项。
4. **身份/血缘关系状态** — 已验证、仅提示词、仅 rollout，或不匹配。
5. **缺口** — 格式错误/无法读取的来源、缺失的父级、未包含的附件字节、超时或未搜索的范围。

“未找到”仅适用于此覆盖范围。不要将超时或不完整的扫描称为否定结果。

## 防护措施

- 保持此 Skill 为只读；它不会恢复、归档、重命名、删除或修复。
- 不要运行 `codex resume`、`codex --continue` 或新的实现实验。
- 不要将数兆字节的 rollout 直接加载到上下文中；使用随附的读取器。
- 不要从进程名称、cwd 或写入器锁缺失推断 Session 状态或所有权。
- 除非用户明确要求共享，否则将原始历史保留在本地。

## Legacy 兼容性

之前的 `local-conversation-history` 汇总了 Claude、Codex 和 Kimi 的记录。
其完整说明仍保留在
[references/legacy_multi_provider_inventory.md](references/legacy_multi_provider_inventory.md)
中，因此 Kimi 分支和旧的命令契约不会被悄然删除。新的 Claude
请求会路由至 `daymade-claude-code:read-claude-code-history`。