---
name: suede-marketing-psychology
description: "Suede-affiliated ethical application of behavioral science to marketing decisions, including framing, anchoring, social proof, loss aversion, choice architecture, and friction. Use when the user needs a named psychological model, an evidence-aware application, and a testable hypothesis. NOT FOR: clinical or mental-health advice, deceptive dark patterns, page implementation (use suede-site-alchemy), or pricing design (use suede-pricing)."
metadata:
  version: 2.0.0
---
# Suede 道德营销心理学

Suede 将行为模型作为符合伦理、可检验的假设来应用，而不是将其视为普遍解释或操纵他人的许可。识别相关机制，说明其证据局限，将其转化为具体的营销应用，并定义用户可以如何衡量它是否有所帮助。

## 如何使用此技能

如果 `.agents/product-marketing.md` 存在，请先阅读它，并且只询问其中未涵盖的内容；路径回退方案请参阅 `suede-product-marketing`。

然后：

1. 使用下面的快速参考表，将用户面临的挑战缩小到两到三个候选模型。
2. 只阅读 `references/model-catalog.md` 中对应的条目——这是完整的模型库，每个条目都标注了证据等级。每当你即将提及某个模型时，都要阅读该文件；绝不要凭记忆推荐模型，因为证据等级决定了你可以提出的主张边界。
3. 按照下面的约定，为每条建议输出一个区块。缺少以下四个部分中的任何一个，都不得发布建议。

### 每条建议的约定

```
**Mechanism:** [named model] — [the behavior it predicts, in one sentence]
**Evidence:** [Robust / Context-dependent / Contested / Folklore / Framework,
copied from the catalog entry] — [what that tier means for how hard you may
lean on it here]
**Application:** [the specific change to this product, page, price, or
sequence — not a generic tactic]
**Test:** [what changes, what you measure, the success threshold, and how long
it runs before you decide]
```

如果目录条目的等级是 **Contested** 或 **Folklore**，请在建议中明确说明，并将应用呈现为一项待执行的实验，绝不要将其作为该变更会奏效的理由。如果目录中没有任何合适的模型，请明确说明，而不是牵强附会地套用模型——无论听起来多么合理，缺乏证据支持的行为主张都不在允许范围内。

## 快速参考

面对营销挑战时，可以考虑下列模型，然后从 `references/model-catalog.md` 中提取对应条目：

| 挑战 | 相关模型 |
|-----------|-----------------|
| 转化率低 | Hick's Law、Activation Energy、BJ Fogg Behavior Model |
| 价格异议 | Anchoring、Framing、Mental Accounting、Loss Aversion |
| 建立信任 | Authority、Social Proof、Reciprocity、Pratfall Effect |
| 提高紧迫感 | Scarcity、Loss Aversion、Zeigarnik Effect |
| 留存/流失 | Endowment Effect、Switching Costs、Status-Quo Bias |
| 增长停滞 | Theory of Constraints、Local vs Global Optima、Compounding |
| 决策瘫痪 | Paradox of Choice、Default Effect、Nudge Theory |
| 新手引导 | Goal-Gradient、IKEA Effect、Commitment & Consistency |

---

## 针对任务的问题

1. 你试图影响的具体行为是什么？
2. 客户在接触你的营销内容之前持有什么看法？
3. 这发生在用户旅程的哪个阶段（认知 → 考虑 → 决策）？
4. 当前是什么在阻碍期望的行动？
5. 你是否已用真实客户进行过测试？

---

## 边界

- 不要诊断他人、推断受保护特征，或将营销模型描述为临床事实或普遍真理。
- 不要建议欺骗、胁迫、虚假稀缺、隐藏默认选项、阻碍取消，或其他暗黑模式。
- 不要在没有证据的情况下声称某种行为效应一定会发生；应将其表达为假设，并定义测试方案。
- 不要为用户发布文案、修改界面，或决定伦理与法律风险。

## 路由

- 使用 `suede-site-alchemy` 处理页面应用，使用 `suede-copy` 进行消息框架设计。
- 使用 `suede-pricing` 设计定价架构，使用 `suede-paywalls` 处理产品内升级时刻。
- 使用 `suede-ab-testing` 测试行为假设。