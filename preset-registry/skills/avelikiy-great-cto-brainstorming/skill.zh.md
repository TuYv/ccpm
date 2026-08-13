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

创意工作分为三个阶段：**发散 → 辩论 → 收敛**。大多数团队会跳过中间阶段，直接收敛到第一个看似可行的想法上。本技能的核心正是辩论小组。

## 1. 发散——生成真正不同的押注

从一个*已明确框定的问题*（服务对象 · 痛点成本 · 为何是现在 · 成功指标）出发，提出 **3–5 种截然不同的方法**——它们应是不同的押注，而不是表面上的变体。每种方法都必须至少在以下一个维度上体现差异：

- **不同的用户**（你首先服务谁）
- **不同的切入点**（你主打的那一个功能）
- **不同的范围**（礼宾式/人工服务与完全自助式服务）
- **不同的商业形态**（出售工具与交付成果）

对于每种方法，说明：*核心押注 · 能够验证它的最小版本 · 主要风险。*
拒绝近似重复的方案——如果两个选项基于相同的押注，就删除其中一个，并努力提出一个更具逆向思维的替代方案。

## 2. 辩论——创意辩论小组

四种角色，**四个不同的模型**，两轮辩论。模型多样性很重要：不同模型家族的失败方式不同，因此能够发现不同的漏洞。

| 角色 | 立场——主张…… | 模型 | 调用方式 |
|---|---|---|---|
| **愿景家** | 最有力的支持论点——如果成功，如何实现 10 倍成果 | `claude-opus-4-8` | `Task`, `model: opus` |
| **怀疑者** | 最有力的反对论点——它为何会失败 / 谁尝试过并以失败告终 | `claude-sonnet-4-6` | `Task`, `model: sonnet` |
| **用户倡导者** | 用户的真实反应——我会付费 / 转换 / 在意吗？此外，对于任何会向最终接收者发送消息或收集其数据的产品，还要考虑接收者同意/选择加入的阻力（TCPA / 选择退出 / 垃圾信息疲劳 / 谁会拒绝） | `claude-haiku-4-5` | `Task`, `model: haiku` |
| **实干家** | 成本、交付时间、自建还是购买、单位经济效益 | Kimi K2 | `mcp__great_cto_llm_router__ask_kimi` |

### 第 1 轮——开场立场（相互不知情，并行）

在**一条消息中**启动三个 `Task` 角色（并行），同时为实干家调用 Kimi 路由器。每个角色都会获得已框定的问题、发散阶段的选项，以及**仅属于自己的立场**。提示词模板：

> 你是产品辩论小组中的 **{persona}**。立场：**{stance}**。
> 问题：{framing}。待讨论的选项：{options}。
> 提出尽可能有力的{支持/反对}论点。要具体明确——指出机制、可比案例和数字。最后给出：结论（BUILD / DON'T /
> PIVOT-to-which-option）+ 你最担忧的一个问题。

### 第 2 轮——反驳（知情）

向每个角色提供**其他三位角色在第 1 轮中的立场**。要求：

> 以下是其他小组成员的立场：{r1_others}。反驳其中你最不同意的一个。
> 然后给出你更新后的结论，以及**一个会让你改变看法的条件。**

### 收敛防护机制

如果四个角色在第 1 轮中意见完全一致，说明问题框定得过于宽松——使用更尖锐、明确持逆向立场的怀疑者重新运行（“假设这是一个坏主意；证明这一点”）。只有在怀疑者获得了所有推翻它的机会后，真正的共识才算数。

## 3. 收敛——综合判断（由主席决策）

产品负责人（Opus）是**主席**，而不是计票员。阅读全部八份陈述并产出：

- **决定性考量**——真正能够一锤定音的那条论据
- **最有力的支持理由**和**最有力的反对理由**（以最强形式呈现，并注明提出者）
- **结论**——BUILD / DON'T BUILD / PIVOT，并用一句话说明理由
- **什么会改变结论**——终止标准 / 重新评估的条件
- **保留异议**——如果某个角色持有强烈的少数派观点，请将其记录下来；
  不要粉饰或抹去它。明天那句“我们当初为什么没想到 X”就根源于此。

将其直接填入产品简报的**辩论摘要**部分。

## 成本说明

每个创意的评审成本约为 $0.30–0.60（每轮分别调用一次 Opus、Sonnet、Haiku 和 Kimi，
共进行 2 轮）。这是整个流程中成本最低的保障措施：它发生在投入任何工程时间之前，
此时说“不”无需成本，而说“是”代价高昂。