---
name: skill-review
description: Use when reviewing Codex, Qoder, or repo-local skills and their prompt chains for trigger quality, workflow clarity, progressive disclosure, duplicated instructions, template ownership, output readability, validation gaps, or whether a skill should be edited.
---
# 技能审查

将技能作为执行契约而非散文进行审查。追踪代理将如何进入、加载、委派、生成产物并验证结果；然后报告能够改进该链路的最小变更。

## 审查工作流

1. 解析目标技能或提示词链。如果用户指定了路径，则停留在该路径及其直接链接的资源范围内。
2. 首先阅读仓库指令：最近的 `AGENTS.md`、插件清单，以及目标 `SKILL.md` 的 frontmatter/正文。
3. 追踪从入口点到引用、模板、脚本、检测器、测试、生成产物和验证命令的完整链路。建立所有权映射：
   哪个文件负责工作流、输出结构、运行时规则、样式和测试。
4. 在编辑之前审计契约。使用 [审计清单](references/audit-checklist.md)
   和 [参考模式](references/reference-patterns.md) 作为审查视角。
5. 如果用户要求进行变更，只修改最小范围的所属文件。除非生成的辅助工具、冒烟脚本和本地实验是技能必须使用的持久资源，否则将它们放在 `SKILL.md` 之外。
6. 使用可用的最轻量级真实门禁进行验证：技能验证器、仓库测试、插件验证，或有界代理冒烟测试。说明任何无法运行的门禁。

仅将子代理用作评估表面或独立的广泛研究。主代理负责审查、最终校准和文件编辑。向子代理传递原始产物和任务局部范围；不要传递预期答案。

## 审查视角

- [审计清单](references/audit-checklist.md)：触发契约、渐进式披露、工作流/委派、模板所有权、可读性、证据。
- [参考模式](references/reference-patterns.md)：可复用的设计视角，例如触发器/协议拆分、门禁函数和输出契约槽位。
- [快速检查命令](references/inspection-commands.md)：适用于该仓库的起始 `rg`、`wc` 和 `git diff --check` 探查命令。

## 问题严重级别

- **P0**：技能指向缺失、空内容、相互矛盾或无效的资源；代理遵循指令后会失败。
- **P1**：技能可以运行，但浪费上下文、重复所有权、隐藏关键约束或生成难以阅读的输出。
- **P2**：会降低可扫描性但不会破坏工作流的样式、命名、措辞或组织问题。

## 报告格式

以问题开头，并按严重级别排序。使每个问题具体明确：

```text
P1 - <short title>
File: <path>:<line>
Why it matters: <execution or output risk>
Evidence: <quoted phrase, command result, or linked resource>
Fix: <smallest owning-file change>
Validation: <command or smoke that should prove it>
```

在问题之后，仅在其阻碍安全变更时添加待确认问题。如果用户要求进行编辑，则在问题之后包含变更文件和验证结果。默认使用用户的语言。