---
name: grill-with-docs
description: Runs a relentless interview that sharpens a plan or design and creates docs (ADRs and glossary) along the way. Use when the user wants to stress-test a plan or design, or produce decision records.
disable-model-invocation: true
---
运行一次 `/mattpocock:grilling` 会话，并使用 `/mattpocock:domain-modeling` 技能。

## 关键：加载文档技能进行追问

在启用 `/mattpocock:domain-modeling` 技能的情况下运行 `/mattpocock:grilling` 会话。随着每个经过推敲的术语和最终确定的决策逐渐成形，都要将其记录到 `CONTEXT.md` 或 ADR 中——这条书面记录链正是此技能与 `/mattpocock:grill-me` 的区别所在。访谈问题通过 AskUserQuestion 工具提出，并且每次调用只提一个问题，严格遵循 `/mattpocock:grilling` 的规定。