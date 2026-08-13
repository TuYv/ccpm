---
name: save
description: >
  Save the current conversation, answer, or insight into the Obsidian wiki vault as a
  structured note. Analyzes the chat, determines the right note type, creates frontmatter,
  files it in the correct wiki folder, and updates index, log, and hot cache.
  Triggers on: "save this", "save that answer", "/save", "file this",
  "save to wiki", "save this session", "file this conversation", "keep this",
  "save this analysis", "add this to the wiki".
allowed-tools: Read Write Edit Glob Grep
---
# save：将对话归档到 Wiki

好的回答和见解不应该消失在聊天记录中。此技能会将刚刚讨论的内容整理为永久的 Wiki 页面。

Wiki 会不断积累并产生复利效应。请经常保存。

---

## 传输方式（v1.7+）

会话笔记的写入本身遵循标准传输策略。读取 `.vault-meta/transport.json`（由 `bash scripts/detect-transport.sh` 自动创建）：

- **cli** — `obsidian-cli write "$VAULT" "$NOTE" < session.md`；参见 [`skills/wiki-cli/SKILL.md`](../wiki-cli/SKILL.md)
- **mcp-obsidian** / **mcpvault** — `mcp__obsidian-vault__write_note`
- **filesystem** — 使用 Claude 的 `Write` 工具并传入绝对路径

完整决策树：[`wiki/references/transport-fallback.md`](../../wiki/references/transport-fallback.md)。索引、日志和热点更新使用相同的传输方式。

---

## 模式感知（v1.8+）

创建会话笔记之前，通过 `python3 scripts/wiki-mode.py route session "<topic-summary>"` 查询知识库的方法论模式。路由器会返回知识库相对路径：

- **generic**：`wiki/sessions/<date>-<topic>.md`（v1.7 默认值）
- **LYT**：`wiki/notes/<date>-<topic>.md` + 更新相关的会话/日志 MOC
- **PARA**：`wiki/projects/inbox/<date>-<topic>.md`（由用户重新路由到具体项目）
- **Zettelkasten**：`wiki/<ID>-session-<topic>.md`（带时间戳的 ID 作为文件名前缀）

如果 `.vault-meta/mode.json` 不存在，路由器会返回 mode=generic 路径。**重要的全局规则**：根据全局 CLAUDE.md 中的 `/save` 约定，跨项目工作的会话仍应归档到 `~/Documents/Obsidian Vault/sessions/`，而不是项目的 Wiki。模式路由器仅在归档到项目自身的 wiki/ 时适用，不适用于归档到全局个人知识库的情况。

## 并发（v1.7+）

写入会话笔记之前，必须执行 `wiki-lock acquire`：

```bash
NOTE_PATH="wiki/questions/<slug>.md"   # or wiki/concepts/, wiki/meta/, etc.
bash scripts/wiki-lock.sh acquire "$NOTE_PATH" || {
  echo "skipped: $NOTE_PATH currently locked by another writer"; exit 0
}
# … write the note via §Transport-selected method …
bash scripts/wiki-lock.sh release "$NOTE_PATH"
```

对于多文件保存（例如，会话笔记 + 索引更新 + 日志追加），应按路径排序顺序获取每个锁，以避免死锁。索引、日志和热点更新与内容页面采用相同的加锁方式。

完整的锁语义参见 `skills/wiki-ingest/SKILL.md` 的 §Concurrency。

---

## 笔记类型决策

根据对话内容确定最合适的类型：

| 类型 | 文件夹 | 适用场景 |
|------|--------|---------|
| synthesis | wiki/questions/ | 多步骤分析、比较或对特定问题的回答 |
| concept | wiki/concepts/ | 解释或定义某个理念、模式或框架 |
| source | wiki/sources/ | 对会话中讨论的外部材料进行总结 |
| decision | wiki/meta/ | 已作出的架构、项目或战略决策 |
| session | wiki/meta/ | 完整的会话总结：记录讨论的所有内容 |

如果用户指定了类型，请使用该类型。否则，根据内容选择最合适的类型。如有疑问，请使用 `synthesis`。

---

## 保存工作流

**步骤 0：确定目标根目录。** 按以下顺序检查：

1. **用户明确覆盖。** 如果用户说“保存到此项目的 wiki”／“保存到个人知识库”／指定了具体路径，请遵照执行。
2. **项目 CLAUDE.md 或全局 `~/.claude/CLAUDE.md` 中的 `/save` 规则。** 如果其中任一文件声明了个人知识库目标位置（例如 `~/Documents/Obsidian Vault/`），则该位置为目标根目录。下方的笔记类型表描述的是相对于当前有效根目录的路径。按照该文件现有的格式，将新笔记追加到 `<root>/log/ingest-log.md` 的顶部。
3. **默认。** 项目自身的 `wiki/` 文件夹。

归档到项目自身的 `wiki/` 时，使用模式路由器（`python3 scripts/wiki-mode.py route session "<topic>"`）。归档到个人知识库根目录时，使用该知识库的 CLAUDE.md 中记录的规范文件夹（通常为 `sessions/`、`concepts/`、`sources/`）——默认情况下，写入个人知识库时**不**查询模式路由器。无论使用哪个根目录，文件名清理（slug + safe_name）始终适用：移除路径分隔符、NUL 字节、控制字符以及开头的点号／连字符。

**然后继续执行工作流：**

1. **扫描**当前对话。确定最值得保留的内容。
2. **询问**（如果尚未命名）：“这篇笔记应该叫什么？”名称应简短且具有描述性。
3. 使用上表**确定**笔记类型。
4. 从对话中**提取**所有相关内容。将其改写为陈述式现在时（不要写“用户询问了”，而要直接陈述实际内容）。
5. 在 `<destination-root>/<chosen-folder>/<title>.md` 中**创建**笔记（依照步骤 0）。包含完整的 frontmatter。如果相同路径的笔记已存在，请在覆盖前先询问。
6. **收集链接**：找出对话中提及的所有 wiki 页面。将它们添加到 frontmatter 的 `related` 中。
7. **更新** `wiki/index.md`。在相关章节顶部添加新条目。
8. **追加**到 `wiki/log.md`。将新条目添加到顶部：
   ```
   ## [YYYY-MM-DD] save | Note Title
   - Type: [note type]
   - Location: wiki/[folder]/Note Title.md
   - From: conversation on [brief topic description]
   ```
9. **更新** `wiki/hot.md` 以反映新增内容。
10. **确认**：“已将其保存为 `wiki/[folder]/` 中的 [[Note Title]]。”

---

## Frontmatter 模板

```yaml
---
type: <synthesis|concept|source|decision|session>
title: "Note Title"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - <relevant-tag>
status: developing
related:
  - "[[Any Wiki Page Mentioned]]"
sources:
  - "[[.raw/source-if-applicable.md]]"
---
```

对于 `question` 类型，添加：
```yaml
question: "The original query as asked."
answer_quality: solid
```

对于 `decision` 类型，添加：
```yaml
decision_date: YYYY-MM-DD
status: active
```

---

## 写作风格

- 使用陈述式现在时。记录知识，而不是对话。
- 不要写：“用户询问了 X，Claude 解释了……”
- 应写：“X 通过执行 Y 来运作。关键洞见是 Z。”
- 包含所有相关上下文。后续会话应能在没有任何背景信息的情况下直接阅读此页面。
- 使用 wiki 链接来链接提及的每个概念、实体或 wiki 页面。
- 在适用时引用来源：`(Source: [[Page]])`。

---

## 保存什么，跳过什么

保存：
- 不易显见的洞见或综合结论
- 包含理由的决策
- 付出了大量精力的分析
- 可能会再次参考的比较
- 研究发现

跳过：
- 机械式问答（答案显而易见的查询问题）
- 已在其他地方记录的设置步骤
- 没有持久洞见的临时调试会话
- Wiki 中已有的任何内容

如果 Wiki 中已经存在相关内容，请更新现有页面，而不是创建重复页面。

---

## 如何思考（10 项原则映射）

处理此技能时，请应用 10 项原则循环。规范框架请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|-----------|-------------------|
| 1 | 观察（外部） | 阅读完整对话。识别实际的决策和综合结论，而不是逐字记录。 |
| 2 | 观察（内部） | 我是否正处于什么都想保存的状态？有些会话并没有持久的洞见；跳过标准的存在是有理由的。 |
| 3 | 倾听 | 用户是否指定了目标位置或类型？首先遵循其明确的覆盖要求，其次才使用默认值。 |
| 4 | 思考 | 先选择目标根目录（步骤 0），然后选择笔记类型，再选择文件夹。使路径清理方式与目标位置的约定相匹配。 |
| 5 | 连接（横向） | 此内容是否已经有对应的 Wiki 页面？更新还是创建至关重要——重复内容会污染索引。 |
| 6 | 连接（系统） | 索引、日志、热缓存和 frontmatter 关系必须一起更新——原子性很重要。 |
| 7 | 感受 | 文件名应让未来的自己在不了解上下文时也能看懂；frontmatter 应支持搜索。避免让噪声淹没信号。 |
| 8 | 接受 | 有些会话不值得保存。遵守跳过标准；不要归档所有内容。 |
| 9 | 创造 | 写入笔记，将内容追加到日志顶部，更新索引，并刷新热缓存。 |
| 10 | 成长 | 被跳过的保存内容也是一种信号——是什么阈值过滤了它们？随着时间推移完善类型表。 |