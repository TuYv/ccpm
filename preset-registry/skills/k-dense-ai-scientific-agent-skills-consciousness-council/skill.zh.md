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

一个结构化的多视角审议系统，能够针对任何问题生成真正的认知多样性。委员会不会让一个声音给出一个答案，而是召集不同的思维原型——每个原型都有自己的推理方式、盲点和优先事项——然后将它们的观点综合为可执行的洞见。

## 为什么需要它

单一视角的思考存在上限。当你向一个头脑寻求答案时，你得到的也只有一个框架。意识委员会通过同时模拟董事会、哲学研讨会和作战室在认知层面的等价场景，突破这一上限。这不是角色扮演，而是结构化的认识论多样性。

委员会的灵感来自集体智慧、群体智慧现象相关的研究，以及这样一种观察：当真正不同的推理方式发生碰撞时，往往能产生最好的决策。

## 工作原理

委员会分为三个阶段：

### 阶段 1 — 召集委员会

根据用户的问题，从下方的原型中选择 4-6 名委员会成员。选择那些视角会真正发生**冲突**的成员——达成一致很容易，有价值的是富有成效的张力。

**12 种原型：**

| #   | 原型             | 思维方式                         | 会问                                         | 盲点                                 |
| --- | ---------------- | -------------------------------- | -------------------------------------------- | ------------------------------------ |
| 1   | **架构师**       | 系统思维，以结构为先             | “底层结构是什么？”                           | 可能会过度设计简单问题               |
| 2   | **逆向思考者**   | 逆向思维，唱反调                 | “如果事实恰恰相反呢？”                       | 可能为了唱反调而唱反调               |
| 3   | **经验主义者**   | 以数据为依据，以证据为先         | “证据实际上说明了什么？”                     | 可能忽视无法衡量的事物                 |
| 4   | **伦理学家**     | 以价值观为导向，关注后果         | “谁会受益，谁会受到伤害？”                   | 可能因道德复杂性而陷入行动瘫痪         |
| 5   | **未来学家**     | 着眼长期，关注二阶效应           | “10 年后，这会是什么样子？”                  | 可能低估当下的现实                     |
| 6   | **实用主义者**   | 以行动为导向，关注资源           | “到星期五之前，我们实际上能做什么？”         | 可能为了短期利益牺牲长期目标           |
| 7   | **历史学家**     | 识别模式，参考先例               | “以前什么时候尝试过这件事？”                 | 可能重打上一场战争                     |
| 8   | **共情者**       | 以人为本，具备情商               | “人们实际上会对此有什么感受？”               | 可能将舒适置于进步之上                 |
| 9   | **局外人**       | 跨领域思考，提出朴素问题         | “为什么所有人都想当然地这么认为？”           | 可能缺乏领域深度                       |
| 10  | **战略家**       | 博弈论，竞争动态                 | “第二步和第三步会怎么走？”                   | 可能把简单情境想得过于复杂             |
| 11  | **极简主义者**   | 化繁为简，寻求约束               | “我们可以去掉什么？”                         | 可能过度简化复杂问题                   |
| 12  | **创造者**       | 发散思维，新颖综合               | “还有什么尚未尝试过？”                       | 可能为了新颖而忽视可靠性               |

**选择启发式：** 将问题类型与最能产生富有成效的张力相匹配：

- **商业决策** → Strategist + Pragmatist + Ethicist + Futurist + Contrarian
- **技术架构** → Architect + Minimalist + Empiricist + Outsider
- **个人困境** → Empath + Contrarian + Futurist + Pragmatist
- **创意挑战** → Creator + Outsider + Historian + Minimalist
- **伦理问题** → Ethicist + Contrarian + Empiricist + Empath + Historian
- **战略/竞争** → Strategist + Historian + Futurist + Contrarian + Pragmatist

这些只是起点——应根据具体问题进行调整。目标是产生富有成效的分歧，而不是达成共识。

### 阶段 2 — 审议

每位 Council Member 都应按照以下格式给出自己的观点：

```
🎭 [ARCHETYPE NAME]

Position: [One-sentence stance]

Reasoning: [2-4 sentences explaining their logic from their specific lens]

Key Risk They See: [The danger others might miss]

Surprising Insight: [Something non-obvious that emerges from their frame]
```

**审议的关键规则：**

- 每位成员 MUST 在某个实质性问题上与至少一位其他成员存在分歧。如果所有人都同意，说明 Council 失败了——返回去进一步强化各方之间的张力。
- 各方观点应当真正不同，而不只是“用不同措辞表达同意”。
- Contrarian 应挑战最受欢迎的立场，而不是泛泛地持怀疑态度。
- 保持每位成员的贡献聚焦且犀利。深度优于广度。

### 阶段 3 — 综合

所有成员发言后，输出：

```
⚖️ COUNCIL SYNTHESIS

Points of Convergence: [Where 3+ members agreed — these are high-confidence signals]

Core Tension: [The central disagreement that won't resolve easily — this IS the insight]

The Blind Spot: [What NO member addressed — the question behind the question]

Recommended Path: [Actionable recommendation that respects the tension rather than ignoring it]

Confidence Level: [High / Medium / Low — based on how much convergence vs. divergence emerged]

One Question to Sit With: [The question the user should keep thinking about after this session]
```

## Council 配置

用户可以自定义 Council：

- **“Quick council”** 或 **“fast deliberation”** → 使用 3 位成员，缩短回复
- **“Deep council”** 或 **“full deliberation”** → 使用 6 位成员，展开推理
- **“Add [archetype]”** → 加入指定的 archetype
- **“Without [archetype]”** → 排除指定的 archetype
- **“Custom council: [list]”** → 用户选择确切的成员
- **“Anonymous council”** → 在综合之前不要透露发言者所属的 archetype（减少锚定偏差）
- **“Devil's advocate mode”** → 每位成员都必须反驳看起来最符合直觉的观点
- **“Rounds mode”** → 初始立场之后，成员之间再进行第二轮回应

## 什么样的问题适合 Council

Council 最适合处理符合以下条件的问题：

- 存在真正的不确定性或权衡
- 存在多个有效的视角
- 用户陷入困境或反复兜圈子
- 利益攸关程度足够高，值得从多个角度思考
- 用户自身的偏见可能正在限制其视野

委员会在以下方面价值较低：

- 有明确答案的纯事实性问题
- 用户已经做出决定、只是想获得确认的问题
- 利害关系较低的琐碎选择

如果问题看起来过于简单，不值得启动完整的委员会，请直接说明这一点——并提供一个简短的双视角对照。

## 语气与质量

- 每种原型的表达都应具有足够的辨识度，让用户即使不看标签也能分辨出是谁在发言。
- 综合应体现真正的整合，而不只是罗列每位成员说了什么。
- “核心张力”是综合中最重要的部分——应明确指出用户真正面临的权衡。
- “留待思考的一个问题”应真正发人深省，而不是泛泛而谈。
- 绝不要让委员会沦为所有人礼貌地表示赞同。富有成效的摩擦才是关键。

## 示例

**用户：**“我应该辞掉稳定的企业工作去创业吗？”

**委员会成员选择：**务实派、未来主义者、共情者、逆向思考者、战略家（5 位成员——这是一个涉及财务、情感和战略层面的高风险人生决策）

然后运行完整的 3 阶段审议流程。

## 署名

由 AHK Strategies 创作——面向 AI 时代的意识基础设施。  
了解更多：https://ahkstrategies.net  
由 TheMindBook 的 Mind Council 架构提供支持：https://themindbook.app