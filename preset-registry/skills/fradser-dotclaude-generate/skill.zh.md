---
name: storm-generate
description: Run the full STORM pipeline end-to-end. This skill should be used when the user asks to "generate a storm article", "write a wikipedia-style article about X", "research and write a long-form piece on X", or invokes /storm:generate. Orchestrates research -> outline -> write -> polish, skipping already-completed phases.
user-invocable: true
argument-hint: "<topic> [--max-perspective N] [--max-turns N] [--output-dir PATH | --save] [--docs DIR] [--docs-only] [--force] [--retriever mcp|web|local]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash(mktemp:*)", "Bash(mkdir:*)", "Bash(date:*)", "WebSearch", "WebFetch", "Task", "Skill", "ToolSearch"]
---
# /storm:generate

端到端的 STORM 文章生成。依次运行全部四个阶段，并跳过产物已存在的阶段（除非指定 `--force`）。

## 关键要求：首先加载引擎

在执行任何其他操作之前，通过 Skill 工具加载 `storm-engine` skill。它定义了此编排流程所依赖的产物布局、阶段门控约定、引用规范和检索回退机制。不要自行设计这些内容。

## 参数

- `<topic>`（必填）— 文章的主题。
- `--max-perspective N`（默认值为 3）— 要发现的角色数量。
- `--max-turns N`（默认值为 3）— 每个角色的最大问答轮数。
- `--output-dir PATH` — 明确指定输出位置。与 `--save` 互斥。
- `--save` — 持久化保存到 `docs/storm/<slug>/`，而不是临时目录。
- `--docs DIR` — 除 Web 外，也基于本地文档生成内容；如果与 `--docs-only` 一起使用，则仅基于本地文档。
- `--force` — 即使产物已存在，也重新运行所有阶段。
- `--retriever mcp|web|local` — 覆盖检索来源（默认值：mcp，并提供回退机制）。

## 流程

1. 解析参数；如果未提供主题，则调用 `AskUserQuestion` 请求用户提供。
2. 根据引擎约定派生 `<slug>` 并解析 `<output_dir>`。创建该目录。
3. 写入包含所有参数快照的 `run-config.json`。使用 `date -u +%Y-%m-%dT%H:%M:%SZ` 设置 `started_at`（这是唯一生成时间戳的位置）。
4. 按顺序处理每个阶段 — `research`、`outline`、`write`、`polish`：
   a. 检查该阶段的完成产物（遵循引擎约定）。
   b. 如果已完成且未指定 `--force`：在 `run-config.json` 中将 `phases.<name>` 标记为 `"skipped"`，并记录日志 "Skipping <name> (artifact present)"。
   c. 否则：通过 Skill 工具调用对应的 `/storm:<phase>` skill，并传入解析后的输出目录和运行参数。返回后，验证其产物，并将 `phases.<name>` 标记为 `"completed"`（如果发生错误，则标记为 `"failed"` 并记录错误）。
5. 所有阶段完成后，读取 `article-polished.md` 并输出摘要：主题、字数、引用的来源数量、章节数量，以及最终文章的绝对路径。
6. 如果本次运行使用了临时目录，请醒目显示其绝对路径，以便用户保留产物。

## 并发

`research` 和 `write` 阶段会在内部使用 Task 子代理（请参阅它们各自的 SKILL.md 文件）。此编排 skill 会严格按顺序运行各个阶段 — 绝不要跨阶段并行执行，因为每个阶段都依赖前一个阶段的产物。

## 失败处理

如果某个阶段失败，请停止并报告。不要继续进入下一个阶段。使用失败原因更新 `run-config.json`。再次调用时（不指定 `--force`），由于之前已完成的阶段会被跳过，因此将从失败的阶段继续运行。

## 输出

发送给用户的最终消息必须包括：
- `article-polished.md` 的绝对路径。
- 字数和章节数量。
- 引用的来源数量。
- 输出目录（尤其是在使用临时目录时）。
- 一行说明：不指定 `--force` 重新运行时，将从第一个未完成的阶段继续。