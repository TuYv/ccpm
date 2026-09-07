---
name: wiki
license: MIT
description: >-
  Markdown-first knowledge base where the LLM acts as librarian. Ingests raw
  sources, compiles and interlinks topic files, self-maintains an index. No
  vector DB or embeddings required -- uses LLM-native navigation over structured
  markdown up to ~400K words.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - wiki
  - knowledge base
  - llm wiki
  - project wiki
  - build a wiki
  - maintain knowledge
  - knowledge management
  - llm-wiki
  - karpathy wiki
last-updated: 2026-04-06
---
# /wiki -- LLM 原生知识库

## 功能定位

**使用场景：** 构建和查询以 markdown 为优先的知识库 —— 摄取原始笔记、去重、呈现答案。
**不适用场景：** 将会话所学捕获到 evolve 流水线中（使用 /learn）；生成结构化代码文档（使用 /doc-gen）。

## 目录结构

```text
wiki/
  index.md              # Master index
  raw/                  # Unprocessed sources (timestamped files)
  topics/               # Compiled topic files (one per topic, interlinked)
  .wiki-meta.json       # Stats: topic count, source count, last compaction
```

## 命令

| 命令 | 行为 |
|---|---|
| `/wiki` | 状态概览：主题数量、最近更新、待处理的原始来源 |
| `/wiki --add [source]` | 将新来源摄取进 wiki |
| `/wiki --query [question]` | 使用 wiki 知识回答问题 |
| `/wiki --status` | 详细的 wiki 健康状况：主题数量、陈旧度、孤儿检测 |
| `/wiki --compact` | 合并、去重并重新组织主题 |
| `/wiki --rebuild-index` | 根据当前主题文件重新生成 index.md |
| `/wiki init [path]` | 在指定路径初始化一个新 wiki |

## 协议

### 命令：`/wiki init [path]`

创建 `wiki/`、`wiki/raw/`、`wiki/topics/`、空的 `wiki/index.md`，以及包含以下字段的 `wiki/.wiki-meta.json`：`created`、`lastUpdated`、`topicCount: 0`、`sourceCount: 0`、`totalWords: 0`、`lastCompaction: null`。默认路径：项目根目录下的 `wiki/`。

### 命令：`/wiki --add [source]`

将新来源摄取进 wiki。

**步骤 1：** 确定来源类型 —— URL（用 WebFetch 抓取）、文件路径（读取）、原始文本（直接使用）、无参数（询问用户）。

**步骤 2：** 将原始内容写入 `wiki/raw/source-{timestamp}.md`，头部包含：标题/URL、摄取日期、类型、原始出处。

**步骤 3：** 识别 1-5 个主题。对每个主题：检查是否已存在对应的主题文件 —— 追加到现有文件，或创建 `wiki/topics/{slug}.md`。

**步骤 4：** 每个主题文件包含：标题、`> Last updated`、`> Sources`、编纂后的内容，以及带有 `[[slug]]` 交叉链接的 `## Related Topics`。写入时扫描现有主题以建立交叉链接。

**步骤 5：** 重新生成 `wiki/index.md`，包含统计头部、Topics 表格（`[[slug]]` | 摘要 | 最近更新）以及 Recent Sources 表格。

**步骤 6：** 用新的计数更新 `wiki/.wiki-meta.json`。

**步骤 7：** 输出：来源描述、创建的主题、更新的主题、索引计数。

### 命令：`/wiki --query [question]`

1. 读取 `wiki/index.md`，识别 1-5 个相关的主题文件，简要说明理由
2. 读取这些主题；如相关，沿 `[[cross-links]]` 最多追踪 2 跳
3. 给出清晰的答案，并引用所使用的具体主题文件
4. 如果 wiki 信息不足：说明它已知的内容，列出缺口，并建议对缺失的领域使用 `/wiki --add`

### 命令：`/wiki --status`

读取元数据，统计主题文件和原始来源数量，检查是否存在孤儿主题、失效的交叉链接以及陈旧主题（30 天以上）。输出：主题/来源/字数计数、最近更新/压缩日期，以及带有计数和列表的健康问题。

### 命令：`/wiki --compact`

1. 读取 `wiki/index.md` 和所有主题文件
2. 识别：合并候选（主题相互重叠）、拆分候选（包含多个不同主题）、陈旧/过时的内容、重复内容
3. 对每项变更：说明改了什么以及为什么，执行变更，更新所有受影响的交叉链接
4. 重建 `wiki/index.md`，并用 `lastCompaction` 和新的计数更新 `wiki/.wiki-meta.json`
5. 输出：已合并/拆分/移除/处理的主题、最终数量、预估字数

### 命令：`/wiki --rebuild-index`

读取所有主题文件，提取标题/摘要/日期，写入全新的 `wiki/index.md`。输出："Index rebuilt with {count} topics."

## 边缘情况

- **`.planning/` 不存在**：先运行 `/do setup` 初始化 harness 状态目录。
- **没有 wiki 目录**：提示运行 `/wiki init`。在执行查询或状态检查时不要自动创建。
- **来源超过 5 万词**：拆分为多个部分，并警告用户。
- **主题名称冲突**：合并到现有主题中，不要覆盖。
- **查询空的 wiki**："The wiki is empty. Add sources with `/wiki --add`."
- **交叉链接失效**：在压缩/重建期间 —— 予以标记。在 --add 期间 —— 若没有上下文，则创建占位符 `[[missing-topic]] (stub -- needs content)`。
- **URL 抓取失败**：报告失败，建议直接粘贴内容。
- **wiki 超过约 40 万词**：在 --status 期间发出警告，建议归档或使用 `/wiki --compact`。

## 上下文门控

**披露：**"Updating wiki at `.planning/wiki/`. Files will be created or modified."
**可逆性：** 琥珀色 —— 会创建和修改 `.planning/wiki/` 下的文件；可通过删除或还原已更改的文件来撤销。
**信任门控：**
- 任意：所有 wiki 命令（init、add、query、status、compact、rebuild-index）。

## 质量门控

- 每个主题文件必须包含标题、最近更新日期和来源列表
- 每个主题文件必须至少有一个指向其他主题的交叉链接（除非它是唯一的主题）
- 索引必须准确反映所有主题文件（--add 或 --compact 之后不得存在孤儿主题）
- 不得有重复的主题文件（相同 slug = 相同文件）
- 原始来源保存在 wiki/raw/ 中，永不删除
- --query 命令必须引用具体的主题文件，不得捏造信息

## 退出协议

输出与所执行命令相称的摘要，然后：

```
---HANDOFF---
- Wiki: {command executed} at {wiki path}
- Topics: {count} total, {new/updated/merged count} changed
- Status: {healthy | needs compaction | has orphans/broken links}
---
```
