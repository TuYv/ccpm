---
name: storm-engine
description: Provides the shared STORM methodology, artifact layout, stage-gating contract, citation hygiene, and retrieval fallback. Use when executing any /storm:* skill (generate, research, outline, write, polish). Internal knowledge; never user-invocable.
---
# STORM 引擎

STORM 插件的内部知识。将源自 Stanford STORM（NAACL'24 / EMNLP'24）的方法论编码为 Claude 原生流水线。每个 `/storm:*` skill 都会自动加载此文档。

## 关键：两阶段流水线

该流水线包含两个阶段和四个环节。每个环节均可独立运行和恢复——已完成环节会从制品目录中加载，绝不会重新运行。

```
Stage 1 (Pre-writing)        Stage 2 (Writing)
  research  --------->  outline  --------->  write  --------->  polish
   (persona               (draft +            (per-section,        (summary +
    discovery,            refine from         cited, parallel)     dedup)
    simulated Q&A,        research)
    information table)
```

**绝不要跳过阶段 1。** 仅根据参数化记忆生成的文章不是 STORM 文章——它会产生虚假引用，并缺少定义该方法的多视角事实依据。如果 `research/` 不存在，请先运行 `/storm:research`。

**绝不要编造引用。** 每个行内 `[n]` 都必须映射到研究期间收集的 `sources.json` 中的一个条目。如果某个章节没有支持来源，请在不添加引用的情况下撰写，并在润色环节标记这一缺口——不要伪造参考文献。

## 关键：制品布局

所有环节都从同一个按主题划分的目录中读取并向其中写入：

```
<output_dir>/<slug>/
  research/
    personas.json          # discovered personas (name + perspective + rationale)
    conversations.jsonl   # one record per (persona, turn): question, queries, snippets, answer
    sources.json          # deduplicated Information objects: {id, title, url, description, snippets}
  outline.md              # refined outline (markdown headings)
  outline-draft.md        # pre-research draft (kept for reference)
  article.md              # per-section draft with inline [n] citations
  article-polished.md     # final polished article
  run-config.json         # snapshot of run parameters
```

**阶段门控约定**：当某个环节的主要制品存在且非空时，即视为该环节已完成。运行环节前，请检查其输出制品：

- `research` 完成，当且仅当 `research/sources.json` 存在且包含 ≥1 个条目。
- `outline` 完成，当且仅当 `outline.md` 存在且包含 ≥2 个章节。
- `write` 完成，当且仅当 `article.md` 存在，且大纲中的每个章节（Introduction/Conclusion/Summary 除外）都有正文内容。
- `polish` 完成，当且仅当 `article-polished.md` 存在。

如果环节已完成且用户未传入 `--force`，则跳过该环节并读取其制品。记录被跳过的内容。

## Slug 推导

从主题推导 `<slug>`：转换为小写，将连续的非字母数字字符替换为 `-`，移除开头和结尾的 `-`，并截断为 60 个字符。两个主题不得发生冲突——如果目录已存在，且其中 `run-config.json` 的主题不同，则追加 `-2`、`-3` 等。

## 输出目录解析

1. 如果给出了 `--output-dir <path>` → 使用 `<path>/<slug>/`。
2. 否则，如果给出了 `--save` → 使用 `docs/storm/<slug>/`（相对于 cwd；若不存在则创建）。
3. 否则 → 使用临时目录：`$(mktemp -d)/storm-<slug>/`。写入包含 `"temporary": true` 的 `run-config.json`，并告知用户绝对路径，以便其在需要时保留制品。插件不会清理临时目录（交由操作系统处理），因此用户仍可在会话期间恢复运行。

## 检索：MCP 优先，WebSearch 兜底

关键要求：优先使用已连接的 MCP 搜索工具；仅当没有可用的 MCP 搜索工具时，才回退到内置 Web 搜索。

1. 通过 ToolSearch 探测 MCP 搜索工具：`exa-mcp-server__code-search`、`exa-mcp-server__research-paper-search`、`exa-mcp-server__company-search`、`exa-mcp-server__personal-site-search`、`exa-mcp-server__financial-report-search`、`exa-mcp-server__x-search`。
2. 如果至少有一个 MCP 搜索工具可用，则在研究阶段使用它（根据每个查询选择最相关的类型——例如，学术主题使用 `research-paper-search`，组织相关主题使用 `company-search`）。
3. 仅当没有连接任何 MCP 搜索工具时，才回退到内置的 `WebSearch` + `WebFetch`。
4. 为基于用户提供的文档进行事实支撑（VectorRM 风格），接受 `--docs <dir>` 参数；如果提供了该参数，则将这些文件作为额外的来源池，与 Web 结果一起使用（如果指定了 `--docs-only`，则仅使用这些文件）。

**来源结构**（与上游 `Information` 保持一致）：每个来源都必须规范化为
```json
{"id": 1, "title": "...", "url": "...", "description": "...", "snippets": ["..."]}
```
来源添加时，为其分配连续的 `id`。`id` 是内联 `[n]` 中使用的引用键。

## 引用规范

- 内联引用使用 `[1]` / `[1][2]` 格式，紧跟在其所支持的陈述之后。
- 文末的 `## References` 部分列出每个被引用的来源，编号与正文匹配，格式为 `title — url (accessed YYYY-MM-DD)`。
- 在复用现有来源中的片段之前（例如，将其用作后续问题的上下文），移除该片段自身包含的所有内联引用——这可以避免多跳引用混淆。函数：`strip_citations(text) -> text`，移除所有 `[n]` 和 `[n][m]` 模式。
- 未引用的来源仍可出现在研究过程中，但不得出现在参考资料中。参考资料必须恰好对应正文中出现的所有 `[n]` 键。
- 如果某个章节确实没有支持来源，则不添加引用。使用 HTML 注释 `<!-- TODO: no source -->` 标记，以便润色阶段发现。

## 角色发现

让角色基于真实结构，而非凭空臆造——复现 STORM 的“抓取相关 Wikipedia 目录”步骤：

1. 在 Web 上搜索该主题以及 2-3 个密切相关的概念。
2. 对于每个看起来像参考页面的热门结果（Wikipedia、手册、综述），获取页面并提取其目录/章节标题。
3. 将这些真实标题作为生成角色的灵感：让 LLM 提出 N 个视角（默认为 3 个），使每个角色都能从不同类别的角度对该主题提出问题。此外，始终包含一个“基础事实撰稿人”角色。
4. 每条角色记录：`{"name": "...", "perspective": "...", "rationale": "..."}`。

## 模拟对话（按角色）

对于每个角色，运行 WikiWriter（提出问题）与 TopicExpert（根据检索结果作答）之间的多轮对话：

1. 撰稿人从其角色视角提出问题。
2. 专家将问题拆分为 1-3 个搜索查询（`question_to_query`），通过上述检索约定进行检索，并在回答中使用内联来源标注。
3. 当撰稿人说“非常感谢你的帮助！”或达到 `max_turns`（默认为 3）时，对话结束。
4. 将每个 `(question, queries, snippets, answer)` 元组收集到 `conversations.jsonl` 中，并将每个被引用的来源收集到 `sources.json` 中（按 URL 去重）。

## 大纲生成

1. 仅根据参数化知识起草大纲（`outline-draft.md`）——这是 LLM 的先验结构。
2. 使用拼接后的对话历史进行完善：重新组织、添加/删除章节，使大纲反映实际了解到的内容。写入 `outline.md`。
3. 两个文件都会保留。完善后的 `outline.md` 将由 `write` 使用。

## 分章节撰写

1. 为 `sources.json` 建立索引以供检索。
2. 针对每个大纲章节（通过 Task 子代理并行处理），检索 top-k 个相关来源，并使用行内 `[n]` 引文撰写该章节。
3. 跳过自动生成的章节（“Introduction”“Conclusion”“Summary”）——这些章节会在 `polish` 中填充。
4. 在保留大纲标题结构的情况下，拼接为 `article.md`。

## 润色

1. 如果大纲中有“Introduction”或“Summary”占位符，则添加摘要/引言章节。
2. 删除各章节之间的重复内容。
3. 验证正文中的每个 `[n]` 都能对应到 References 条目，反之亦然；删除任一侧的孤立条目。
4. 写入 `article-polished.md`。

## 运行配置

`run-config.json` 始终包含：
```json
{
  "topic": "<original topic>",
  "slug": "<derived>",
  "temporary": <bool>,
  "output_dir": "<absolute>",
  "max_perspective": 3,
  "max_turns": 3,
  "search_top_k": 3,
  "retrieve_top_k": 3,
  "retriever": "mcp" | "web" | "local",
  "started_at": "<ISO from caller>",
  "phases": {"research": "completed|skipped|pending", ...}
}
```

时间戳：在确定性上下文中，插件绝不能自行调用 `date`——应通过调用方的环境接受来自调用技能的 `started_at`。实际使用中，调用方 `/storm:*` 技能会传入当前时间；`storm-engine` 从不生成时间戳。