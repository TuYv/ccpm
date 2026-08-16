---
name: storm-outline
description: Run STORM phase 2 — outline generation. This skill should be used when the user asks to "generate an outline for a storm article", "draft a wikipedia-style outline", or invokes /storm:outline. Produces a draft outline from parametric knowledge then refines it using the research information table.
user-invocable: true
argument-hint: "<topic> [--output-dir PATH | --save] [--force]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash(mktemp:*)", "Bash(mkdir:*)", "Bash(date:*)", "Skill"]
---
# /storm:outline

STORM 流水线的第 2 阶段。首先根据模型的参数化知识起草大纲，然后使用研究对话对其进行完善，以反映实际了解到的内容。

## 关键：前置条件

- 通过 Skill 工具加载 `storm-engine`。
- `research/sources.json` 必须存在（第 1 阶段已完成）。如果不存在，请停止并指示用户先运行 `/storm:research`。不得将仅基于参数化知识生成的大纲作为最终产物。

## 完成条件

当且仅当 `outline.md` 存在且包含至少 2 个章节时，此阶段才算完成。如果未设置 `--force` 且该文件已存在，则跳过并提前退出。

## 流程

1. 确定输出目录。
2. 读取 `research/conversations.jsonl` 和 `research/sources.json`。将对话历史拼接起来，作为完善大纲的输入。
3. **起草**——仅根据参数化知识生成 `outline-draft.md`。这是模型针对该主题的先验结构。使用 Markdown `## Section` 标题。
4. **完善**——使用对话历史重新组织草稿：合并重复章节，为研究中发现但草稿遗漏的材料添加章节，删除研究未能支持的章节。将结果写入 `outline.md`。
5. 如果存在“引言”“结论”“摘要”章节，请将其标记为占位符——这些章节会在 `polish` 阶段填充，而不是在此阶段。
6. 验证 `outline.md` 是否包含至少 2 个章节。更新 `run-config.json`：`phases.outline = "completed"` 以及章节数量。

## 输出

报告：草稿章节数量、完善后的章节数量、完善过程中添加/删除的章节，以及 `outline.md` 的路径。