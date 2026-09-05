---
name: brainstorming
description: Structured idea generation + multi-LLM debate for the product-owner stage. Diverge (generate genuinely different bets), debate (a 4-persona panel on 4 models argues over 2 rounds), converge (synthesize a recommendation). Used by product-owner before architect; available to architect for design-space exploration.
when_to_use: |
  Apply when:
  - product-owner is turning a raw idea/problem into a validated brief
  - the decision is "what/whether to build", not "how to build it"
  - an idea needs adversarial pressure-testing before committing engineering time
  - architect wants to explore a wide design space before picking an approach
effort: medium
allowed-tools: Read, Write, Task, mcp__great_cto_llm_router__ask_kimi
---
# 头脑风暴

创意工作包含三个阶段：**发散 → 辩论 → 收敛**。大多数团队会跳过中间的辩论阶段，直接收敛到第一个看似可行的想法。辩论小组正是这项技能的核心。

## 1. 发散——生成真正不同的下注方向

从一个*界定清晰的问题*（服务对象 · 痛苦成本 · 为什么是现在 · 成功指标）出发，提出
**3–5 个不同的方案**——是不同的下注方向，而不是表面上的变体。每个方案至少要沿着一个轴实现差异化：

- **不同的用户**（你首先服务谁）
- **不同的切入点**（你率先推出的那项功能）
- **不同的范围**（人工代办/人工服务 vs 完全自助）
- **不同的业务形态**（销售工具 vs 交付结果）

对每个方案说明：*核心下注 · 用于验证它的最小版本 · 主要风险。*
拒绝近似重复项——如果两个选项共享同一个下注方向，就删掉其中一个，并推动提出更具反传统性的替代方案。

## 2. 辩论——创意辩论小组

四个角色，**四种不同的模型**，进行两轮辩论。模型多样性很重要：不同的模型家族会以不同方式失败，因此它们能发现不同的漏洞。

| 角色 | 立场——主张…… | 模型 | 调用方式 |
|---|---|---|---|
| **远见者** | 最有力的支持理由——如果成功，可能带来的 10 倍结果 | `claude-opus-5` | `Task`，`model: opus` |
| **怀疑者** | 最有力的反对理由——它为什么会失败/谁曾尝试后失败 | `claude-sonnet-5` | `Task`，`model: sonnet` |
| **用户代言人** | 用户的真实反应——我会付费/切换/在乎吗？并且，对于任何会向最终接收者发送消息或收集数据的产品，还要考虑接收者的同意/选择加入阻力（TCPA / opt-out / 垃圾信息疲劳 / 谁会拒绝） | `claude-haiku-4-5` | `Task`，`model: haiku` |
| **务实派** | 成本、交付时间、自己构建还是购买、单位经济效益 | Kimi K2 | `mcp__great_cto_llm_router__ask_kimi` |

### 第 1 轮——开场立场（盲评、并行）

在**同一条消息中**（并行）启动三个 `Task` 角色，并调用 Kimi
路由器处理务实派。每个角色都获得界定清晰的问题 + 发散阶段的方案，并且
**只能获得自己的立场**。提示词模板：

> 你是产品辩论小组中的**{persona}**。立场：**{stance}**。
> 问题：{framing}。当前考虑的方案：{options}。
> 尽可能有力地论证{for/against}。具体且务实——说明机制、可比对象和数字。
> 结尾给出：结论（BUILD / DON'T / PIVOT-to-which-option）+ 你最大的单一担忧。

### 第 2 轮——反驳（知情）

向每个角色提供**其他三个角色的第 1 轮立场**。要求：

> 以下是其他小组成员的立场：{r1_others}。反驳你最不同意的那一位。
> 然后给出你更新后的结论，以及**一个会改变你想法的条件**。

### 收敛防护

如果四个角色在第 1 轮中全部同意，说明问题界定得过于宽松——以更尖锐、明确反传统的怀疑者立场重新运行（“假设这是个糟糕的想法；证明它确实如此”）。只有当怀疑者获得了充分机会去否定它时，真正的共识才算成立。

## 3. 收敛——综合判断（由主持人决策）

产品负责人（Opus）是**主持人**，而不是计票人。阅读全部八段陈述并产出：

- **决定性考量** — 真正能够一锤定音的那个论点
- **最有力的支持论点**和**最有力的反对论点**（以最强方式阐述，并标明提出者）
- **结论** — BUILD / DON'T BUILD / PIVOT，并用一句话说明原因
- **什么情况会改变结论** — 否决标准 / 重新评估的条件
- **保留异议** — 如果某个角色持有有力的少数意见，请记录下来；
  不要将其抹平。明天的“我们当时怎么没想到 X”就会留在这里。

将此内容直接填入产品简报的 **辩论摘要** 部分。

## 成本说明

每个想法的评审成本约为 $0.30–0.60（一次 Opus、一次 Sonnet、一次 Haiku 和一次 Kimi 调用 × 2 轮）。这是整个流程中最便宜的保险：它在任何工程时间投入之前运行，正处于“否定”不需要付出代价，而“肯定”成本高昂的阶段。