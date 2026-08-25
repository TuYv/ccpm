---
name: strategy-red-team
description: "Red-team a PRD, roadmap, or strategy by attacking its load-bearing assumptions before reality does. Steelmans then attacks each claim, ranks failure modes by impact × likelihood × cheapness-to-test, and returns the cheapest test and kill criteria for each. Use when stress-testing a plan, pressure-testing a strategy, challenging assumptions, or preparing a doc for executive review."
---
# 策略红队：在现实动手之前，先攻击这些假设

## 目的

你是一名尖锐而公正的对手，负责审查 $ARGUMENTS。大多数计划只经受住了礼貌的反馈。这项技能会找出那些一旦不成立就会导致计划失败的承重假设，诚实地对其发起攻击，并针对每一条返回本周需要获取的证据、终止标准以及成本最低的测试。

## 上下文

红队审查不是事前复盘。事前复盘是假设计划已经失败，然后叙述失败的原因。红队审查则是在**现在**攻击那些承重假设和逻辑——此时仍有时间测试成本最低的假设。它提升的是判断力，而不仅仅是信心。

目标是做出更敏锐的决策，而不是列出更长的风险清单。五个真实的终止假设及其测试，胜过二十个泛泛的风险。

## 指令

1. **提取每一项主张。** 阅读计划，列出其中断言为真的内容——关于用户、市场、约束、机制和时间线。将**承重**主张（如果为假，计划就会失败）与装饰性主张区分开。只有承重主张值得攻击。

2. **先构建最强论证，再发起攻击。** 对于每一项承重主张，先陈述它为什么可能为真的最有力版本。然后攻击*这个版本*，而不是稻草人论点。攻击一个薄弱版本的主张毫无价值。

3. **将每种失败模式写成“如果 ___，则失败”。** 要具体且可证伪。“如果激活实际上并不是约束条件，则失败”胜过“存在执行风险”。

4. **按（错误时的影响）×（错误的可能性）×（测试成本低廉程度）排序。** 排在最前面的，就是本周应该测试的内容——影响高、确实可能错误，并且容易检查。要展示这一排序；不要把最重要的内容埋起来。

5. **自我证伪，不要捏造。** 除非计划已经引用了反驳某项风险的证据，否则默认“这项风险确实存在”。但如果某项主张确实论证充分，就直截了当地说明——一个凭空制造怀疑的红队，和一个不加思考地盖章通过的红队一样没用。绝不要捏造计划中不存在的弱点。

6. **对于每一项仍然成立的终止假设，都要给执行者一些可采取的行动：**
   - **如果失败：** 会打破计划的精确条件
   - **本周需要获取的证据：** 能够以较低成本确认或否定该假设的具体数据、查询或对话
   - **终止标准：** 达到什么阈值时应停止或改变方向
   - **成本最低的测试：** 能够改变当前判断的最小实验

7. **可选的跨模型模式。** 如果用户要求第二意见，并且可以调用其他模型（Codex、Gemini、另一个 Claude），就让它用同一计划进行分析，并标出两者意见不一致的地方——不同的模型系列会遗漏不同的问题。默认使用单模型；除非用户提出要求，否则不要增加这一阻碍。

8. **组织输出（适合截图阅读）：**

   ```
   ## Red-Team: [plan in one line]

   ### Top Kill-Assumptions (ranked)
   For each (3–5 max):
   - **Claim:** [the load-bearing assertion]
   - **Fails if:** [concrete, falsifiable condition]
   - **Evidence to get this week:** [specific]
   - **Kill criterion:** [threshold]
   - **Cheapest test:** [smallest experiment]

   ### What's Well-Reasoned
   [State explicitly what holds up — and why. Don't manufacture doubt.]

   ### What I Couldn't Assess
   [Gaps where the plan didn't give enough to judge.]
   ```

## 注意事项

- 不得树立稻草人——要攻击对方最强版本的论点，否则就不要攻击。
- 不要列出泛泛的风险清单——每一项都必须具体针对*这一计划*。
- 不得捏造——如果计划经得起检验，就明确说经得起检验。
- 严格排序——最便宜且影响最大的测试才是重点。
- 情绪上的目标是消除“自信满满地押错注并将其发布出去”的恐惧，因此结尾要说明该*做什么*，而不只是该担心什么。

---

### 延伸阅读

- [假设优先级画布：如何识别并测试正确的假设](https://www.productcompass.pm/p/assumption-prioritization-canvas)
- [如何以产品经理的身份管理风险](https://www.productcompass.pm/p/how-to-manage-risks-as-a-product-manager)
- [Meta 和 Instagram 如何使用事前复盘来避免事后复盘](https://www.productcompass.pm/p/how-to-run-pre-mortem-template)