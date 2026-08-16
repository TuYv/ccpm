---
name: storm-polish
description: Run STORM phase 4 — article polishing. This skill should be used when the user asks to "polish the storm article", "finalize the article", or invokes /storm:polish. Adds a summary section, removes duplicate content, and verifies citation integrity.
user-invocable: true
argument-hint: "<topic> [--remove-duplicate] [--output-dir PATH | --save] [--force]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash(mktemp:*)", "Bash(mkdir:*)", "Bash(date:*)", "Skill"]
---
# /storm:polish

STORM 流水线的第 4 阶段。添加摘要/引言章节，移除各章节间的重复内容，并验证每个行内 `[n]` 引文均可解析到“参考文献”条目，反之亦然。

## 关键：前置条件

- 通过 Skill 工具加载 `storm-engine`。
- `article.md` 必须存在（第 3 阶段已完成）。如果不存在，请停止并指示用户先运行 `/storm:write`。

## 完成契约

当且仅当 `article-polished.md` 存在时，此阶段才算完成。如果未设置 `--force` 且该文件已存在，则跳过并提前退出。

## 流程

1. 解析输出目录。
2. 读取 `article.md`、`outline.md` 和 `research/sources.json`。
3. **摘要章节** — 如果 `outline.md` 中包含“Introduction”或“Summary”占位符，则撰写一个综合文章要点的摘要章节（1-2 段）。不得引入正文中尚未出现的新论断或引文。
4. **移除重复内容**（默认启用；`--remove-duplicate` 用于显式指定，但该行为默认开启）— 检测各章节间近似重复的段落并移除较后出现的段落，保留位于主题更契合章节中的段落。
5. **引文完整性** — 构建正文中出现的 `[n]` 键集合。追加一个 `## 参考文献` 章节，仅列出这些来源，编号与引文一致，每条格式为 `n. title — url (accessed YYYY-MM-DD)`。删除正文中没有对应来源的所有 `[n]`（替换为 `<!-- TODO: missing source -->`）。删除所有未被引用的来源（不要在参考文献中列出未引用的来源）。
6. 写入 `article-polished.md`。
7. 更新 `run-config.json`：`phases.polish = "completed"`、最终字数、来源数量以及所有完整性警告。

## 输出

报告：最终字数、被引用来源的数量、移除的重复段落数量、所有完整性警告（缺失来源/TODO 章节），以及 `article-polished.md` 的绝对路径。