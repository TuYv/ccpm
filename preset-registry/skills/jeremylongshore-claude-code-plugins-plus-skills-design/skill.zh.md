---
name: design
description: |
  Use when the user wants the visual/experiential design of a product done systematically — a design system, a screen, a landing page, or a visual identity — grounded in researched real-world prior art and free of AI slop. Establishes/extends the design system, invokes the matching local taste skill, dispatches the designer specialist, and reviews for taste + accessibility. Standalone — ends with a handoff gate into the chain.
  Trigger with /hyperflow:design, "design the UI", "make a design system", "design this screen", "give this a visual identity", "redesign this".
allowed-tools: Read, Glob, Grep, Agent, Skill, AskUserQuestion
argument-hint: "[target | brief]"
version: 1.0.0
license: MIT
compatibility: Designed for Claude Code
tags: [design, design-system, ui, creative, anti-slop, multi-agent]
---
# 设计

系统化、反低质的产品设计。所有代理继承会话模型。审查者加粗标注；工作者使用普通字体。

此技能涵盖 **第 4 层（头脑风暴/规范）** 以及 **第 0 层（项目分析）** 的设计层。这是
**思考，而非构建**——此处不会编写源代码。唯一的写入目标是 `.hyperflow/design/system.md` 和
`.hyperflow/specs/`。流程以交接关卡结束，进入 `/hyperflow:plan` → `/hyperflow:dispatch` 进行构建。

## 铁律

- **先建立设计系统。** 每次运行都会根据 [`../hyperflow/design-system.md`](../hyperflow/design-system.md) 在设计界面
  之前建立或扩展 `.hyperflow/design/system.md`。系统只创建一次并持续扩展，绝不重新生成。
- **基于研究，而非凭空发明。** 每个方向都必须以项目领域中的 **≥2 个**真实产品为基础，将它们结合起来，
  然后通过一个刻意设计的标志性特征实现分化（方法见 [`design-system.md`](../hyperflow/design-system.md)）。
- **本地风格技能实时调用。** 主会话调用 `Skill` 来调用匹配的风格技能；被调度的 `designer` 代理读取
  `SKILL.md` 并应用它（它没有 `Skill` 工具）。
- **逐步使用代理（DOCTRINE 规则 12）。** 不得内联设计——由 [`designer`](../../agents/designer.md) 专家
  负责工作；`accessibility-reviewer` 负责审查并对结果进行关卡审核。
- **设计阶段不得编写代码。** 设计阶段产出系统文件和设计规范；由 `dispatch` 执行它们。
- **失败恢复（DOCTRINE 规则 14）** 遵循 [`../hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md)。
- **任何写入文件中都不得提及 AI。**

## 逐步代理映射（DOCTRINE 规则 12）

| 步骤 | 子阶段 | 工作者 | 审查者 | 备注 |
|---|---|---|---|---|
| 1 — 分类 | — | — | — | 根据 [`../hyperflow/task-triage.md`](../hyperflow/task-triage.md) 进行机械分类（豁免） |
| 2 — 设计系统 | 2a — 建立/扩展 `.hyperflow/design/system.md` | `designer` | **审查者** | 缺失时创建；存在时扩展 |
| 3 — 研究 + 方向 | 3a — 先例研究 + 结合 + 分化 | `designer`（按维度扇出 ≤ 3） | **审查者** | 优先进行网络研究；≥2 个参考对象 |
| 4 — 设计规范 | 4a — 将方向转化为令牌/规范 | `designer` | **审查者** | 写入 `.hyperflow/specs/<slug>.md` |
| 5 — 风格 + 无障碍审查 | — | — | — | **`designer`** 裁决 + **`accessibility-reviewer`** |
| 6 — 交接关卡 | — | — | — | 仅使用 `AskUserQuestion`（豁免——结构性关卡） |

## 审批关卡

| 关卡 | 时机 | 格式 |
|---|---|---|
| 交接关卡 | 第 6 步，规范写入之后 | `AskUserQuestion` — 立即构建 / 先制定计划 / 停止 |

## 流程

### 第 1 步 — 分类

根据 [`../hyperflow/task-triage.md`](../hyperflow/task-triage.md) 对请求进行分类。`types` 将包含 `ui`
和/或 `creative`；[Brain](../../agents/brain.md) 确认 `designer` 在代理名册中。

### 第 2 步 — 设计系统

读取 `.hyperflow/design/system.md`。如果缺失，则调度 `designer — establish design system` 来创建它（领域、
令牌、字号层级、间距、动效、语气、组件、参考对象、反模式），具体遵循
[`design-system.md`](../hyperflow/design-system.md)。如果已存在，则调度 `designer — extend design system`，仅添加
此简报所需的内容。然后执行 `**审查者** — 设计系统覆盖检查`。

### 第 3 步 — 研究 + 方向

通过 `Skill` 实时调用匹配的本地审美技能（依据 `design-system.md` 中的索引）。然后派发
`designer — research prior art + propose direction`（按视觉语言 / 动效 + 交互 / IA 进行扇出，最多 3 个；当
界面范围较广时）：研究该领域中 ≥2 个真实系统，进行组合，并以一个命名的标志性特征实现差异化。然后执行
`**Reviewer** — direction grounding check`（结合 ≥2 个参考案例，而非照搬；标志性特征应是经过刻意设计的）。

### 第 4 步 — 设计规范

派发 `designer — author design spec`，将选定的方向转化为绑定的设计系统 tokens，并将其写入
`.hyperflow/specs/<slug>.md`（格式遵循 [`../hyperflow/artefact-format.md`](../hyperflow/artefact-format.md)）。
然后执行 `**Reviewer** — spec sanity check`。

### 第 5 步 — 审美 + 无障碍评审

并行派发：`**designer** — taste verdict`（反低质模板底线） ∥ `**accessibility-reviewer** — a11y floor`
（WCAG AA、焦点、减少动效、RTL）。如果无障碍要求发生冲突，以底线为准（第 5 步服从无障碍评审结论）。

### 第 6 步 — 交接闸门（结构性闸门 · DOCTRINE 规则 8）

```
?  设计规范已准备完毕，位于 .hyperflow/specs/<slug>.md — 是否构建？

   立即构建（推荐）  — 链接至 /hyperflow:plan → /hyperflow:dispatch
   先制定计划         — 打开 /hyperflow:plan，在暂不构建的情况下进行拆解
   停止               — 保留规范；稍后再构建
```

选择 **立即构建** → 使用 `skill: plan` 和 `args: "session=one spec=.hyperflow/specs/<slug>.md"` 调用 `Skill`。选择
**先制定计划** → 调用 `plan`，但不自动派发。选择 **停止** → 输出一行并停止。如果 `AskUserQuestion` 不可用，则将该闸门输出为
`Hyperflow Question` 区块并等待——绝不能静默自动构建。

## 输出格式

两个输出：

1. `.hyperflow/design/system.md` 中的**设计系统** — 持续维护的 token 文档（本次创建或扩展）。
2. `.hyperflow/specs/<slug>.md` 中的**设计规范** — 方向、tokens、标志性特征以及 `References:` 区块。

聊天中显示一个指向这些文件的状态框，绝不显示 token 明细（文件优先，规则 8）：

```
── 设计结果 ─────────────────────
简述:     <一行内容>
系统:     .hyperflow/design/system.md（已创建 | 已扩展）
规范:     .hyperflow/specs/<slug>.md
结论:     审美 PASS · 无障碍 PASS
─────────────────────────────────
```

## 交接

- **制定计划** — 自动链接至 `/hyperflow:plan` 进行拆解；计划随后会在构建位置闸门处停止，并询问构建位置（绝不会自动实现）。
- **停止** — 规范会保留，以便稍后构建。

## 原则

完整规则见 [DOCTRINE.md](../hyperflow/DOCTRINE.md)。设计方法、审美技能索引以及反低质模板底线见
[design-system.md](../hyperflow/design-system.md)。Persona 标准（`ui`、`creative`）见
[personas-A.md](../hyperflow/personas-A.md) —— 由 `designer` 绑定，不再重复说明。

## 概览

`/hyperflow:design` 执行系统化产品设计：建立或扩展项目的设计系统，研究项目所属领域中的真实案例，调用匹配的本地审美技能，派发
`designer` 专家来组合参考案例并通过一个经过刻意设计的标志性特征实现差异化，然后在交接至构建链之前，通过审美 +
无障碍评审对结果进行闸门检查。

## 前置条件

- 建议使用 `.hyperflow/` 缓存（Layer 0 分析有助于提升设计上下文）。如果缺少该缓存，请先运行 `/hyperflow:scaffold`。
- 已安装位于 `~/.claude/skills/` 下的本地品味技能（如果缺少特定的品味技能，该技能会优雅降级为 `design-system.md` 中定义的反垃圾设计底线）。