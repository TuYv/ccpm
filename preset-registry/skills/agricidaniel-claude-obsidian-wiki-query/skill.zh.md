---
name: wiki-query
description: "Answer questions using the Obsidian wiki vault. Reads hot cache first, then index, then relevant pages. Synthesizes answers with citations. Files good answers back as wiki pages. Supports quick, standard, and deep modes. Triggers on: what do you know about, query:, what is, explain, summarize, find in wiki, search the wiki, based on the wiki, wiki query quick, wiki query deep."
allowed-tools: Read Glob Grep
---
# wiki-query：查询 Wiki

Wiki 已经完成了信息综合工作。请有策略地阅读、精确地回答，并将高质量答案归档回 Wiki，让知识持续积累。

---

## 传输方式（v1.7+）

读取操作应优先采用插件其余部分所使用的相同传输方式。查看 `.vault-meta/transport.json`（由 `bash scripts/detect-transport.sh` 自动创建），并使用其中的 `preferred` 条目：

- **cli** — `obsidian-cli read "$VAULT" "$NOTE"` 和 `obsidian-cli search "$VAULT" "<query>"`（Obsidian 原生排序）；参见 [`skills/wiki-cli/SKILL.md`](../wiki-cli/SKILL.md)
- **mcp-obsidian** / **mcpvault** — `mcp__obsidian-vault__read_note`、`search_notes`；参见 [`skills/wiki/references/mcp-setup.md`](../wiki/references/mcp-setup.md)
- **filesystem** — Claude 的 `Read` 和 `Glob`/`Grep` 工具（最终保底方案；始终可用）

完整决策树：[`wiki/references/transport-fallback.md`](../../wiki/references/transport-fallback.md)。快速模式（仅 hot.md）与传输方式无关——始终使用 `Read`。

---

## 检索（v1.7+）

如果检测到 `wiki-retrieve` 功能——`[ -x scripts/retrieve.py ] && [ -d .vault-meta/chunks ] && [ -f .vault-meta/bm25/index.json ]`——标准模式和深度模式会在旧版 hot→index→drill 链之前查询它：

```bash
python3 scripts/retrieve.py "<the user's question verbatim>" --top 5
```

输出为包含 `candidates` 数组的 JSON。每个候选项都包含指向源页面的 `absolute_path`、`snippet`，以及 `bm25_score` + `rerank_score`。读取引用的页面（使用上文“传输方式”一节中的传输选择器），并结合分块级引用进行综合回答。

如果 `retrieve.py` 以状态码 10 退出（功能尚未配置），或者管线中的任何步骤发生错误，则回退到下方标准/深度工作流中描述的 v1.6 旧版读取顺序——不会出现用户可见的中断。

快速模式始终跳过检索（仅使用 hot.md——将预算维持在约 1,500 个 token）。

完整规范：[`skills/wiki-retrieve/SKILL.md`](../wiki-retrieve/SKILL.md)。设置：`bash bin/setup-retrieve.sh`。未安装 wiki-retrieve 时，下方旧版读取顺序工作流仍为权威流程。

---

## 查询模式

共有三种深度。根据问题的复杂程度进行选择。

| 模式 | 触发方式 | 读取范围 | Token 成本 | 最适合 |
|------|---------|-------|------------|---------|
| **快速** | `query quick: ...` 或简单事实型问题 | 仅 hot.md + index.md | ~1,500 | “X 是什么？”、日期查询、快速查找事实 |
| **标准** | 默认（无标志） | hot.md + index + 3-5 个页面 | ~3,000 | 大多数问题 |
| **深度** | `query deep: ...` 或“详尽”“全面” | 完整 Wiki + 可选的 Web | ~8,000+ | “从各方面比较 A 与 B”、综合分析、差距分析 |

---

## 快速模式

当答案很可能存在于热缓存或索引摘要中时使用。

1. 读取 `wiki/hot.md`。如果其中能够回答问题，立即响应。
2. 如果不能，则读取 `wiki/index.md`。扫描描述以查找答案。
3. 如果在索引摘要中找到答案，则直接响应，不要打开任何页面。
4. 如果未找到，则回复“快速缓存中不存在。要改用标准查询吗？”

在快速模式下，不要打开单独的 Wiki 页面。

---

## 标准查询工作流

1. 首先**读取** `wiki/hot.md`。其中可能已经包含答案或直接相关的上下文。
2. **读取** `wiki/index.md`，找出最相关的页面（浏览标题和描述）。
3. **读取**这些页面。对于关键实体，沿 Wiki 链接深入至第 2 层。不要继续深入。
4. 在聊天中**综合整理**答案。使用 Wiki 链接引用来源：`（来源：[[页面名称]]）`。
5. **询问是否归档**答案：“这份分析似乎值得保留。要我将其保存为 `wiki/questions/answer-name.md` 吗？”
6. 如果问题暴露出**信息缺口**，请说：“我没有足够的 X 相关信息。要查找一个来源吗？”

---

## 深度模式

适用于综合分析问题、比较问题或“告诉我关于 X 的一切”这类问题。

1. 读取 `wiki/hot.md` 和 `wiki/index.md`。
2. 找出所有相关部分（概念、实体、来源、比较）。
3. 读取每一个相关页面。不得跳过。
4. 如果 Wiki 覆盖的信息较少，询问是否通过 Web 搜索进行补充。
5. 综合整理出包含完整引用的全面答案。
6. 始终将结果归档为 Wiki 页面。深度回答价值太高，不应丢失。

---

## Token 管控

只读取所需的最少内容：

| 从这里开始 | 成本（约） | 何时停止 |
|------------|---------------|--------------|
| hot.md | ~500 tokens | 如果其中已有答案 |
| index.md | ~1000 tokens | 如果可以确定 3-5 个相关页面 |
| 3-5 个 Wiki 页面 | 每个约 ~300 tokens | 通常已足够 |
| 10 个以上 Wiki 页面 | 成本高昂 | 仅用于综合整个 Wiki 的内容 |

如果 hot.md 中已有答案，则直接回复，无需继续读取。

---

## 索引格式参考

主索引（`wiki/index.md`）如下所示：

```markdown
## Domains
- [[Domain Name]]: description (N sources)

## Entities
- [[Entity Name]]: role (first: [[Source]])

## Concepts
- [[Concept Name]]: definition (status: developing)

## Sources
- [[Source Title]]: author, date, type

## Questions
- [[Question Title]]: answer summary
```

首先浏览各节标题，以确定需要读取哪些部分。

---

## 领域子索引格式

每个领域文件夹都包含一个用于聚焦查询的 `_index.md`：

```markdown
---
type: meta
title: "Entities Index"
updated: YYYY-MM-DD
---
# Entities

## People
- [[Person Name]]: role, org

## Organizations
- [[Org Name]]: what they do

## Products
- [[Product Name]]: category
```

当问题限定在某一领域时，使用子索引。对于范围较窄的查询，避免读取完整的主索引。

---

## 将答案归档

优质答案会在 Wiki 中不断积累并产生复利。不要让洞见消失在聊天记录中。

归档答案时：

```yaml
---
type: question
title: "Short descriptive title"
question: "The exact query as asked."
answer_quality: solid
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [question, <domain>]
related:
  - "[[Page referenced in answer]]"
sources:
  - "[[wiki/sources/relevant-source.md]]"
status: developing
---
```

然后将答案写入页面正文。包含引用。为提及的每个概念或实体添加链接。

归档后，在 `wiki/index.md` 的 Questions 下添加一个条目，并追加到 `wiki/log.md`。

---

## 缺口处理

如果无法从 Wiki 中找到问题的答案：

1. 明确说明：“Wiki 中的信息不足以让我妥善回答这个问题。”
2. 指出具体缺口：“我没有关于 [subtopic] 的任何信息。”
3. 建议：“想找一个关于这个主题的信息来源吗？我可以帮助你搜索或处理一个来源。”
4. 不要编造。如果问题涉及此 Wiki 中的特定领域，不要依据训练数据作答。

---

## 如何思考（10 项原则映射）

使用此 Skill 时，请应用 10 项原则循环。规范框架请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|-----------|-------------------|
| 1 | 观察（外部） | 先阅读 `wiki/hot.md`，然后阅读 `wiki/index.md`，最后阅读具体页面。不要跳过缓存。 |
| 2 | 观察（内部） | 我是否在根据训练数据中的记忆进行综合，而本应引用 Wiki 页面？检查每项论断的来源。 |
| 3 | 倾听 | 用户真正的问题是什么？表面问题通常是更深层需求的替代性表达。 |
| 4 | 思考 | 快速、标准还是深度模式？根据问题的复杂程度而非作答热情来匹配深度。 |
| 5 | 连接（横向） | 是否有我遗漏且会改变答案的页面？回答前交叉检查相关页面。 |
| 6 | 连接（系统） | 热点缓存 + 索引 + wiki-retrieve（配置后）共同构成一条统一的检索流水线。 |
| 7 | 感受 | 引用具体页面，而不是含糊的参考资料。未来的我需要能够追溯到来源页面。 |
| 8 | 接受 | 当 Wiki 中没有答案时，要明确说明。不要根据训练数据编造。 |
| 9 | 创造 | 提供带引用的答案，并在答案值得保留时询问是否需要将其归档。 |
| 10 | 成长 | Wiki 无法回答的问题就是内容缺口——将其记录为 autoresearch 的输入。 |