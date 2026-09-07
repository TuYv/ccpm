---
name: vc-generate-spec
description: Create or update a product-discovery SPEC (requirements doc) for user review. Use when turning RESEARCH findings plus user intent into a reviewable requirements artifact before INNOVATE/PLAN.
argument-hint: "[feature idea or task slug]"
trigger_keywords: spec, requirements doc, product discovery, what and why, requirements artifact
layer: contract
metadata:
  author: vibecode-pro-max-kit
  version: "1.0.0"
---
# 生成 SPEC

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md` —— 回答先行、语言平实、不使用未加解释的术语，长回复附 TL;DR。

使用此技能为某个任务产出权威的**产品发现 SPEC** 产物 —— 一份面向**用户评审**而非工程师、用平实语言写成的需求文档。

SPEC 捕获的是**用户想要什么以及为什么**，让用户能够阅读它、辨认出自己的意图，并在任何方案或代码被选定之前确认“是的，就做这个”。它是 RESEARCH（事实）与 INNOVATE（怎么做）之间的桥梁。对于非琐碎的工作，必须先有 SPEC，PLAN 才能开始。

**SPEC 消费：** RESEARCH 发现 + 用户陈述的意图/头脑风暴。它**不**消费已选定的方案或 Decision Summary —— 在 SPEC 阶段尚不存在任何方案。

常规输出为一个 SPEC 文件：`{slug}_SPEC_{dd-mm-yy}.md`。

对于阶段式程序（phase program），程序级（伞形）SPEC 在外层循环中编写一次，统辖每一个内层阶段。该情形请使用 `templates/program-spec-template.md`。内层循环从不编写 SPEC。

## 工作流程

1. 阅读 `references/spec-contract.md`，了解逐节的完整写作规则。
2. 在选定文件名之前先运行 `date +%d-%m-%y`。
3. 确认输入已具备：RESEARCH 发现 + 用户陈述的意图。若两者均不存在，则发出 `SPEC_INTENT_BLOCKED`，而不是继续编写。
4. 先阅读 `process/context/all-context.md`，然后加载相关的上下文组。当工作涉及测试/验证时，阅读 `process/context/tests/all-tests.md`，使验收标准场景立足于真实的测试上下文链。
5. 将 SPEC 与计划一起保存在任务文件夹内：`process/features/{feature}/active/{slug}_{date}/{slug}_SPEC_{date}.md`（或 `process/general-plans/active/{slug}_{date}/{slug}_SPEC_{date}.md`）。对于阶段式程序，伞形任务文件夹存放 `{program-slug}_SPEC_{date}.md`。按照任务文件夹产物同址存放的规则，绝不写入已弃用的同级 `reports/` 或 `references/` 目录。
6. 按规范顺序编写 SPEC 的各个章节（参见 `references/spec-contract.md`）：
   - `## Summary`
   - `## User Stories / Jobs To Be Done`
   - `## What The User Wants (Behavioral Outcomes)`
   - `## Flow / State Diagram`（ASCII）
   - `## Acceptance Criteria (Testable Outcomes)` —— 每条标准都附带 `proven by:` + `strategy:`
   - `## Out Of Scope`
   - `## Constraints`
   - `## Open Questions`
   - `## Background / Research Findings`
7. 保持文档面向**用户评审**：平实语言，不含文件路径、库名、schema 或代码。任何仅面向工程师的内容移入 Background 或后续阶段。
8. 每条验收标准必须可由全面的测试证明，凡属可自动化的行为，都须设置全自动的 E2E/集成门禁。Agent-Probe / Known-Gap 仅可作为附带明确理由的残余手段。禁止 vacuous-green（空洞绿灯）。
9. 若在定稿（交互式会话）时 `## Open Questions` 不为空：发出 `SPEC_INTENT_BLOCKED` 并停止。在 /goal 下：将每条记录为待办备注并继续。
10. 一旦 Open Questions 为空/"None"（或已在 /goal 下记入待办）：保存文件，代理发出 `PHASE_COMPLETE: SPEC`。

## 重要规则

- SPEC 是为人类评审者编写的。如果某句话只有工程师才看得懂，请改写它，或将其移入 Background。
- 不要选定实现方案（这是下游 INNOVATE 的职责）、编写实现步骤（PLAN）、做 schema 决策，或包含代码/库引用。
- 除正在创建的 SPEC 文件外，不得修改任何文件。
- 验收标准场景必须立足于 RESEARCH 的测试上下文发现，而不是在此凭空编造。
- 一旦 INNOVATE/PLAN 开始，SPEC 即被冻结 —— 之后的范围缺口记入阶段报告的 `## SPEC Gaps` 标题下并附一条待办备注，绝不直接修改 SPEC。
- 对于阶段式程序，伞形 SPEC 只编写一次；内层循环只读取它，从不为单个阶段编写 SPEC。

## 必需的 SPEC 章节

每个 SPEC 文件必须按以下顺序包含下列全部章节：

- `## Summary` —— 一段平实语言的段落：为用户带来什么变化、为什么
- `## User Stories / Jobs To Be Done` —— 文档的核心；“As a [user], I want [X], so that [Y]”或 JTBD
- `## What The User Wants (Behavioral Outcomes)` —— 仅描述可观察的行为，不涉及实现
- `## Flow / State Diagram` —— 至少一张 ASCII 流程图/状态图
- `## Acceptance Criteria (Testable Outcomes)` —— 可观察的结果，每条附有 `proven by:` + `strategy:`；最多 20 条
- `## Out Of Scope` —— 至少一项
- `## Constraints` —— 用户明确提出的、系统/流程层面的，以及来自调研的技术限制
- `## Open Questions` —— 每条须指明负责人；定稿（交互式）要求为空/"None"
- `## Background / Research Findings` —— 来自 RESEARCH 的、塑造了这些需求的关键事实

使用 Markdown 结构化章节，而不是另建一套仅供机器读取的 schema。Markdown 章节在所有代理（Claude、Codex 以及未来的系统）之间保持稳定，无需解析器。
