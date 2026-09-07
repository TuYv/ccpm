---
name: unknown
description: This skill should be used when the user provides a strategy, plan, or decision document and wants to surface hidden assumptions and blind spots using the Known/Unknown 4-quadrant framework. Trigger on "known unknown", "4분면 분석", "blind spots", "뭘 놓치고 있지", "뭘 모르는지 모르겠어", "전략 점검", "전략 분석", "assumption check", "가정 점검", "quadrant analysis", "what am I missing". Strategy-level blind spot analysis with hypothesis-driven questioning. For requirement clarification use vague; for content-vs-form reframing use metamedium.
---
# Unknown：用已知/未知象限揭示盲点

运用已知/未知象限框架和假设驱动式提问，揭示任何战略、计划或决策中隐藏的假设与盲点。

## 何时使用

- 需要仔细审视的战略或规划文档
- 方向不明或存在隐性假设的决策
- 任何“我们不知道什么”比“我们知道什么”更重要的情形

如需针对具体需求的澄清（功能请求、缺陷报告），请使用 **vague** 技能。如需内容与形式之间的重新框定（在既有形式内优化 vs. 发明一种新形式），请使用 **metamedium** 技能。

## 核心原则：假设即选项

对 R1/R2/R3 中的每一个问题都**始终使用 AskUserQuestion 工具**——绝不要以纯文本形式提问。结构化格式会强制采用“假设即选项”，并控制选择疲劳。

以选项而非开放式问题的形式呈现假设。假设本身就是分析——只要把选项设计好，80% 的分析工作在用户作答之前就已经完成。用户的任务是确认、纠正，或带来意外。

```
BAD:  "Why can't you do video content?"           ← open question, high load
GOOD: "Time / Skill gap / No guests / High bar"   ← pick one or more
```

- 每个选项本身就是关于用户情况的一个可检验假设
- 使用 multiSelect: true 来捕捉复合成因
- "Other" 选项始终可用，用于框架之外的回答

## 三轮深化模式

| 轮次 | 目的 | 问题数 | 关键特征 |
|-------|---------|-----------|-----------|
| R1 | 验证草拟的象限 | 3-4 | 宽泛，覆盖所有象限 |
| R2 | 深挖薄弱环节 | 2-3 | 有针对性，顺着 R1 的回答展开 |
| R3 | 敲定执行细节 | 2-3 | 具体，可选 |

**关键**：用第 N-1 轮的回答生成第 N 轮的问题。绝不在各轮之间沿用预先准备好的问题。总问题数控制在 7-10 个以内。

## 流程

### 阶段 1：接收

**提供了文件**：阅读并提取目标、组成部分、隐性假设和缺失要素。

**仅提供主题关键词**：直接从 R1 问题开始，以确立范围。阶段 3 的草稿会更粗糙，但 R1 会加以纠正。

### 阶段 2：上下文

收集相关上下文，以发现未知的已知——即用户可能没有意识到自己拥有的资产：

- 用 **Glob** 查找相关文件：CLAUDE.md、README、决策记录、项目中的过往分析
- 用 **Read** 读取项目上下文：近期目标、团队结构、进行中的举措
- **识别**未被充分利用的资产：闲置未用的工具/技能、含可复用模式的过往项目、未被调动的团队专长

在这里发现的条目将成为 UK 候选项，以及 R1 问题中的选项。

### 阶段 3：草拟 + R1 问题

生成初始的四象限分类。**草稿有意保持粗糙**——R1 的存在是为了纠正它，而非确认它。对拿不准的条目，宁可归为 KU，也不要归为 KK。

设计用于测试象限边界的 R1 问题。**将所有 R1 问题合并到一次 AskUserQuestion 调用中**（最多 4 个问题）：

| 目标 | 模式 | 示例 |
|--------|---------|---------|
| KK | “这真的是确定的吗？” | “主要收入来源？”（选项） |
| KU | “最薄弱的环节在哪里？” | “哪一条飞轮连接最薄弱？” |
| UK | “有什么是存在但未被使用的？” | 基于上下文中的发现 |
| UU | “最大的担忧是什么？” | 以风险场景作为选项 |

### 阶段 4：深化 + R2 问题

分析 R1 的回答，找出最不确定的区域并深入挖掘。

**R2 触发条件**：复合型回答（混乱区域）、出乎意料的回答（草稿有误）、选择了 "Other"（超出框架）。

关于详细的 R2 问题类型，参见 `references/question-design.md`。

### 阶段 5：执行 + R3 问题（可选）

在优先级确定后，为优先级最高的条目敲定执行细节。如果 R2 已提供足够的细节，则跳过。

### 阶段 6：行动手册输出

生成结构化的四象限行动手册文件。完整输出模板参见 `references/playbook-template.md`。

**输出结构：**
```
# {Topic}: Known/Unknown Quadrant Analysis

## Current State Diagnosis
## Quadrant Matrix (ASCII with resource %)
## 1. Known Knowns: Systematize (60%)
## 2. Known Unknowns: Design Experiments (25%)
   - Each KU: Diagnosis → Experiment → Success Criteria → Deadline → Promotion Condition
## 3. Unknown Knowns: Leverage (10%)
## 4. Unknown Unknowns: Set Up Antennas (5%)
## Strategic Decision: What to Stop
## Execution Roadmap (week-by-week)
## Core Principles (3-5 decision criteria)
```

**资源百分比（60/25/10/5）为默认值。**请根据具体情况调整——例如，一家正在探索产品市场契合的初创公司可能会将 40% 分配给 KU，30% 分配给 KK。

## 反模式

- 开放式问题（“你想做什么？”）——改用假设选项
- 每个问题 5 个以上选项——导致选择疲劳
- 设计 R2 时忽略 R1 的回答——表演式提问
- 对所有象限平均用力——浪费时间，失去焦点
- 没有“停止做什么”部分——只做加法不做减法

## 示例

**输入**：增长战略文档

**R1**：收入来源？→ 工作坊。最薄弱环节？→ 业务→知识。阻碍？→ 技能差距 + 高门槛（multiSelect）。最大担忧？→ 执行分散。

**R2**（由“执行分散”驱动）：要砍掉什么？→ 产品开发。为什么没有知识→内容？→ 没有流程 + 没有时间 + 难以抽象。角色是否清晰？→ 不清晰。

**R3**：视频形式？→ 屏幕录制。复盘的阻碍？→ 不知道该捕捉什么。什么内容引起了共鸣？→ 原始发现。

**关键发现**：不需要抽象——原始洞见效果更好。将三重瓶颈压缩成 15 分钟的流水线。

## 规则

1. **假设，而非问题**：每个选项都是可检验的假设
2. **回答驱动深度**：R2 源自 R1，R3 源自 R2
3. **最多 7-10 个问题**：超过就会疲劳
4. **停止 > 开始**：始终包含“要停止做什么”
5. **晋升或淘汰**：每个 KU 都要设定晋升条件和淘汰条件
6. **原始 > 完美**：鼓励最小可行实验，而非完美计划
7. **草稿是可抛弃的**：初始象限本来就是用来被纠正的

## 补充资源

### 参考文件

- **`references/question-design.md`** —— 各轮的详细问题类型、触发条件和 AskUserQuestion 格式指南
- **`references/playbook-template.md`** —— 完整输出模板及逐节指南
