---
name: storm-write
description: Run STORM phase 3 — per-section article writing. This skill should be used when the user asks to "write the article sections", "draft the storm article", or invokes /storm:write. Writes each outline section in parallel with inline citations grounded in the research sources.
user-invocable: true
argument-hint: "<topic> [--retrieve-top-k N] [--output-dir PATH | --save] [--force]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash(mktemp:*)", "Bash(mkdir:*)", "Bash(date:*)", "Task", "Skill"]
---
# /storm:write

STORM 流水线的第 3 阶段。并行撰写大纲中的每个章节（每个章节使用一个 Task 子代理），每个章节均基于研究信息表中最相关的 top-k 个来源，并使用行内 `[n]` 引用。

## 关键：前置条件

- 通过 Skill 工具加载 `storm-engine`。
- `outline.md` 必须存在（第 2 阶段已完成）。如果不存在，则停止并指示用户先运行 `/storm:outline`。

## 完成契约

当且仅当 `article.md` 存在，且大纲中的每个章节（“Introduction”/“Conclusion”/“Summary”占位章节除外）都有正文时，此阶段才算完成。如果未设置 `--force` 且该文件已存在，则跳过并提前退出。

## 流程

1. 解析输出目录。
2. 读取 `outline.md` 和 `research/sources.json`。为来源建立检索索引（简单方法：按照关键词/标题与章节标题的重合度进行排序）。
3. **识别要撰写的章节**——跳过标题恰好为“Introduction”“Conclusion”或“Summary”的章节（这些章节将在 `polish` 中填充）。
4. **并行撰写**——针对每个章节，启动一个 Task 子代理（单条消息，并行执行）。每个子代理：
   - 接收：主题、章节标题、最相关的 top-k 个来源（`--retrieve-top-k` 默认为 3），以及作为上下文的完整大纲。
   - 撰写章节正文，并使用映射到 `sources.json` 中 id 的行内 `[n]` 引用。
   - 如果没有相关来源，则撰写无引用内容，并标记 `<!-- TODO: no source -->`。
   - 返回该章节的 Markdown。
5. **组装**——按照大纲顺序，将各章节内容拼接到对应标题下并写入 `article.md`。保留 `outline.md` 中的标题层级。
6. 验证每个非占位章节都有正文。更新 `run-config.json`：`phases.write = "completed"`、章节数量，以及所有带 TODO 标记的章节。

## 引用规则

- 仅当 `n` 是 `sources.json` 中已存在的 `id` 时，才能引用 `[n]`。切勿在此处创建新的 id。
- 将 `[n]` 紧跟在其所支持的论断之后。由多个来源支持的论断使用 `[1][2]`。
- 不要在占位章节中添加引用。

## 输出

报告：已撰写的章节数量、使用的引用数量、标记为 TODO（无来源）的章节列表，以及 `article.md` 的路径。