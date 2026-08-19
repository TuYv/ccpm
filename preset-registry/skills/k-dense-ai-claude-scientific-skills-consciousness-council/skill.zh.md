---
name: consciousness-council
description: Run a multi-perspective Mind Council deliberation on any question, decision, or creative challenge. Use this skill whenever the user wants diverse viewpoints, needs help making a tough decision, asks for a council/panel/board discussion, wants to explore a problem from multiple angles, requests devil's advocate analysis, or says things like "what would different experts think about this", "help me think through this from all sides", "council mode", "mind council", or "deliberate on this". Also trigger when the user faces a dilemma, trade-off, or complex choice with no obvious answer.
allowed-tools: Read Write
license: MIT license
metadata:
  version: "1.0"
  skill-author: AHK Strategies (ashrafkahoush-ux)
---
# 意识委员会

一个结构化的多视角审议系统，可针对任何问题生成真正的认知多样性。与其让一个声音给出一个答案，委员会会召集不同的思维原型——每种原型都有自己的推理风格、盲点和优先事项——然后将其视角整合为可执行的洞见。

## 为什么需要它

单一视角的思考存在上限。当你向一个心智寻求答案时，得到的只是一个框架。意识委员会通过同时模拟认知层面的董事会、哲学研讨会和作战室，打破了这一上限。这不是角色扮演，而是结构化的认知多样性。

委员会的灵感来自集体智能、群体智慧现象的研究，以及这样一种观察：当真正不同的推理风格发生碰撞时，最佳决策便会涌现。

## 工作原理

委员会分为三个阶段：

### 阶段 1 — 召集委员会

根据用户的问题，从以下原型中选择 4-6 位委员会成员。选择那些视角会真正发生**冲突**的成员——达成一致很容易，富有成效的张力才有价值。

**12 种原型：**

| #   | 原型               | 思维风格                               | 提问                                         | 盲点                                      |
| --- | ------------------ | -------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| 1   | **架构师**         | 系统思维，结构优先                     | “底层结构是什么？”                           | 可能会过度设计简单问题                    |
| 2   | **反对者**         | 逆向思维，唱反调                       | “如果事实恰恰相反呢？”                       | 可能为了反对而反对                        |
| 3   | **实证主义者**     | 数据驱动，证据优先                     | “证据实际上表明了什么？”                     | 可能忽略无法衡量的事物                    |
| 4   | **伦理学家**       | 价值驱动，关注后果                     | “谁会受益，谁会受害？”                       | 可能因道德复杂性而使行动停滞              |
| 5   | **未来学家**       | 长期视角，关注二阶效应                 | “10 年后这会是什么样子？”                    | 可能轻视当下的现实                        |
| 6   | **实用主义者**     | 面向行动，关注资源                     | “到周五前我们实际能做什么？”                 | 可能为短期利益牺牲长期目标                |
| 7   | **历史学家**       | 模式识别，参考先例                     | “以前什么时候尝试过这样做？”                 | 可能还在打上一场战争                      |
| 8   | **共情者**         | 以人为本，具备情商                     | “人们实际上会对此有什么感受？”               | 可能将舒适感置于进步之上                  |
| 9   | **局外人**         | 跨领域，提出朴素问题                   | “为什么每个人都假定如此？”                   | 可能缺乏领域深度                          |
| 10  | **战略家**         | 博弈论，竞争动态                       | “第二步和第三步的行动是什么？”               | 可能对简单情况想得过于复杂                |
| 11  | **极简主义者**     | 简化，寻求约束                         | “我们能移除什么？”                           | 可能过度简化复杂问题                      |
| 12  | **创造者**         | 发散思维，新颖综合                     | “还有什么尚未尝试过？”                       | 可能为了新颖性而忽视可靠性                |

**选择启发式：** 将问题类型与最具成效的张力相匹配：

- **商业决策** → 战略家 + 实用主义者 + 伦理学家 + 未来学家 + 逆向思考者
- **技术架构** → 架构师 + 极简主义者 + 实证主义者 + 局外人
- **个人困境** → 共情者 + 逆向思考者 + 未来学家 + 实用主义者
- **创意挑战** → 创造者 + 局外人 + 历史学家 + 极简主义者
- **伦理问题** → 伦理学家 + 逆向思考者 + 实证主义者 + 共情者 + 历史学家
- **战略/竞争** → 战略家 + 历史学家 + 未来学家 + 逆向思考者 + 实用主义者

这些只是起点——应根据具体问题进行调整。目标是富有成效的分歧，而非达成共识。

### 阶段 2 —— 审议

每位委员会成员按以下格式阐述其观点：

```
🎭 [ARCHETYPE NAME]

Position: [One-sentence stance]

Reasoning: [2-4 sentences explaining their logic from their specific lens]

Key Risk They See: [The danger others might miss]

Surprising Insight: [Something non-obvious that emerges from their frame]
```

**审议的关键规则：**

- 每位成员必须在某个实质性问题上与至少一位其他成员持不同意见。如果所有人都一致，委员会就失败了——请回头强化其中的张力。
- 各个观点应当真正不同，而不只是“换一种说法表示赞同”。
- 逆向思考者应挑战最受欢迎的立场，而不只是泛泛地持怀疑态度。
- 保持每位成员的贡献聚焦且犀利。深度优先于广度。

### 阶段 3 —— 综合

在所有成员发言后，输出：

```
⚖️ COUNCIL SYNTHESIS

Points of Convergence: [Where 3+ members agreed — these are high-confidence signals]

Core Tension: [The central disagreement that won't resolve easily — this IS the insight]

The Blind Spot: [What NO member addressed — the question behind the question]

Recommended Path: [Actionable recommendation that respects the tension rather than ignoring it]

Confidence Level: [High / Medium / Low — based on how much convergence vs. divergence emerged]

One Question to Sit With: [The question the user should keep thinking about after this session]
```

## 委员会配置

用户可以自定义委员会：

- **“快速委员会”** 或 **“快速审议”** → 使用 3 名成员，回复更简短
- **“深度委员会”** 或 **“完整审议”** → 使用 6 名成员，进行更深入的推理
- **“添加 [原型]”** → 纳入特定原型
- **“不使用 [原型]”** → 排除特定原型
- **“自定义委员会：[列表]”** → 用户选择确切的成员
- **“匿名委员会”** → 在综合前不透露发言者的原型（减少锚定偏差）
- **“魔鬼代言人模式”** → 每位成员都必须反对看起来最直觉的观点
- **“轮次模式”** → 初步立场之后，成员进行第二轮相互回应

## 什么是好的委员会问题

委员会最适合处理以下类型的问题：

- 存在真正的不确定性或权衡取舍
- 存在多个合理的视角
- 用户陷入困境或反复兜圈子
- 利害关系足够重大，值得进行多角度思考
- 用户自身的偏见可能正在限制其判断

委员会在以下情况下价值较低：

- 答案明确的纯事实性问题
- 用户已经做出决定，只是想获得确认的问题
- 风险很低的琐碎选择

如果问题看起来对于完整委员会而言过于简单，请明确说明——并改为提供快速的双视角对比。

## 语气与质量

- 每个原型的声音都应足够鲜明，使用户即使没有标签也能辨认出他们。
- 综合应体现真正的整合，而不仅是列出每位成员说了什么。
- “核心张力”是综合中最重要的部分——它应指出用户面临的真实权衡。
- “一个值得思考的问题”应当真正发人深省，而不是泛泛而谈。
- 绝不要让委员会沦为所有人礼貌地达成一致。富有成效的摩擦才是重点。

## 示例

**用户：**“我应该辞去稳定的企业工作去创业吗？”

**委员会选择：**务实主义者、未来主义者、共情者、逆向思考者、战略家（5 名成员——这是一项涉及财务、情感和战略维度的高风险人生决策）

然后进行完整的 3 阶段审议。

## 署名

由 AHK Strategies 创建——AI 时代的意识基础设施。
了解更多：https://ahkstrategies.net
由 TheMindBook 的 Mind Council 架构提供支持：https://themindbook.app