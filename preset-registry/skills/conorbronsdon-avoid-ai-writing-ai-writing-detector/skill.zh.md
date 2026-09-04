---
name: ai-writing-detector
description: Use when the user asks to detect, scan, audit, score, or flag AI-writing patterns without rewriting the text, including requests for a deterministic local detector result when the host can execute Node.
---
# AI 写作检测器

使用原始的 Avoid AI Writing 规则执行仅检测审查。除非用户更改请求，否则绝不重写。

## 权威依据

规范规则手册是 `../avoid-ai-writing/SKILL.md`。其中关于误报、上下文、受保护材料和作者身份声明的注意事项在此适用。

对于跨 Skill 工作，请遵循 `../avoid-ai-writing-router/references/handoff-contract.md` 以及 `../avoid-ai-writing-router/references/skill-graph.json` 中的类型化边。

## 连接契约

### 输入

接受来自以下来源的检测器工作：

- 来自 `avoid-ai-writing-router` 的 `ROUTE`，适用于仅检测请求、多阶段请求的审查阶段，或在另一个终端阶段将控制权交还给路由器后重新收集信号。
- 来自 `preservation-verifier` 的有界 `RECHECK`，但仅限请求中包含收敛或残余审计的情况。

不要接受来自 `false-positive-reviewer` 的直接交接。该 Skill 在图中是终端节点；需要重新收集信号时，必须将控制权交还给 `avoid-ai-writing-router`。这可以防止审查器与检测器之间形成循环。

沿用现有的 `context_mode`、受保护约束、阶段状态和风险标记。不要重置它们。

### 产出

使用以下内容更新交接信封：

- 仅当捆绑的检测器实际运行时，才将 `execution_evidence.detector` 设为 `executed`，否则设为 `model_only`。
- 仅当由已执行的检测器代码生成时，才提供 `detector_summary.score` 和 `label`。
- 从实际发现中提取 `detector_summary.issue_types`。
- 记录用户请求中观察到的任何 `consequential_authorship_claim` 风险标记。

### 输出

- 仅当用户同时请求返回文本重写时，才将发现以 `FEED` 形式发送给 `voice-preserving-rewriter`。
- 仅当用户明确请求修改指定文件时，才将发现以 `FEED` 形式发送给 `file-edit-in-place`。
- 当用户询问这些发现能够对作者身份或其他重要结论证明什么时，向 `false-positive-reviewer` 执行 `ESCALATE`。
- 否则，在仅检测结果之后停止。

检测器发现是证据输入。它们不是强制性的编辑指令，也绝不授权执行修改。

## AI 工程证据视角

应用 `agency-ai-engineer` 视角，该视角编码于 `../avoid-ai-writing-router/references/agency-role-lenses.md`：

- 将确定性输出与仅由模型产生的观察结果分开；
- 在后续交接过程中保留选定的上下文模式；
- 将分数和标签视为信号，而非绝对真相；
- 考虑误报以及体裁和语域的影响；
- 绝不将模式检测转化为作者身份分类声明。

## 首选路径

当当前主机可以安全执行 Node 时：

1. 将提供的文本传递给 `scripts/detect.js`。
2. 对于适当的代码相关或技术性正文，使用 `--context technical`。否则使用 `general`。
3. 报告检测器的分数、标签、问题类型、严重性、匹配文本和建议。
4. 将确定性发现与仅存在于完整规则手册中的编辑性观察结果分开。
5. 除非命令确实运行，否则绝不声称已执行。

示例：

```bash
printf '%s' "$TEXT" | node scripts/detect.js --context general
```

对于文件：

```bash
node scripts/detect.js --file path/to/draft.md --context general
```

如果 Node 或 shell 执行不可用，请执行规范 `avoid-ai-writing` Skill 中的仅检测工作流，并明确说明未运行确定性检测器。

## 停止条件

如果请求仅限检测，到此为止。不要仅仅因为相关 Skill 可用，就继续进行重写、文件修改或解读。

残留的 `RECHECK` 最多可以运行一次。遵守规范的两遍限制和图的循环策略。

## 输出

返回执行时得到的总体标签和分数、按严重性分组的检测模式、对明确问题与可能误报的简短上下文评估、执行状态；除非控制权已明确移交给重写负责人，否则不要返回重写后的版本。