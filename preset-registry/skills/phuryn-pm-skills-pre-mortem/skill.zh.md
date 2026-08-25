---
name: pre-mortem
description: "Run a pre-mortem risk analysis on a PRD or launch plan. Categorizes risks as Tigers (real problems), Paper Tigers (overblown concerns), and Elephants (unspoken worries), then classifies as launch-blocking, fast-follow, or track. Use when preparing for launch, stress-testing a product plan, or identifying what could go wrong."
---
# 事前验尸：产品发布风险分析

## 目的

你是一名资深产品经理，正在对 $ARGUMENTS 进行事前验尸分析。这项技能会假设发布失败，并反向推导以识别真实风险，将其与主观担忧区分开来，并制定行动计划，以降低可能阻碍发布的问题。

## 背景

事前验尸是一项结构化的风险识别练习，迫使团队在发布前、仍有时间采取行动时，批判性地思考可能出错的地方。通过假设失败，我们可以发现隐藏的担忧，并将合理的威胁与被夸大的忧虑区分开来。

## 说明

1. **收集 PRD**：如果用户提供了 PRD 或产品计划文件，请彻底阅读。了解产品、目标市场、关键假设和时间线。如有相关性，使用网络搜索研究竞争格局或市场状况。

2. **逐步思考**：
   - 想象产品将在 14 天后发布
   - 现在想象它失败了——客户没有采用，收入目标未达成，声誉受到影响
   - 出了什么问题？
   - 我们遗漏了什么，或哪些事情执行得不够好？
   - 我们对什么过于自信？

3. **对风险分类**：将每个潜在失败归类为以下三种类型之一：

   **猛虎**：你亲自发现的、可能导致项目脱轨的真实问题
   - 基于证据、过往经验或清晰的逻辑
   - 应该让你夜不能寐
   - 需要采取行动

   **纸老虎**：其他人可能会担心的问题，但你不认为它们是真正的风险
   - 表面上是合理的担忧，但不太可能发生，或被夸大了
   - 不值得投入大量资源
   - 值得记录下来，以便利益相关者达成一致

   **大象**：你不确定是否存在问题，但团队没有充分讨论的事项
   - 没有说出口的担忧，或没有人验证的假设
   - 可能是真实问题；你并不确定
   - 值得在发布前进行调查

4. **按紧迫程度对猛虎分类**：

   **阻碍发布**：必须在发布前解决
   - 示例：核心功能损坏、监管障碍、未满足关键客户依赖

   **快速跟进**：必须在发布后的 30 天内解决
   - 示例：性能问题、次要功能未完成

   **跟踪观察**：发布后进行监控；如果演变成问题再解决
   - 示例：锦上添花的功能、边缘情况

5. **制定行动计划**：针对每个阻碍发布的猛虎：
   - 清晰描述风险
   - 提出具体的缓解行动
   - 确定最佳负责人（职能/人员）
   - 设定决策/完成日期

6. **组织输出**：将分析呈现为：

   ```
   ## Pre-Mortem Analysis: [Product Name]

   ### Tigers (Real Risks)
   [List each real risk with category and mitigation plan]

   ### Paper Tigers (Overblown Concerns)
   [List each, explain why it's not a true risk]

   ### Elephants (Unspoken Worries)
   [List each, recommend investigation approach]

   ### Action Plans for Launch-Blocking Tigers
   [For each, include: Risk, Mitigation, Owner, Due Date]
   ```

7. **保存输出**：保存为 Markdown 文档：`PreMortem-[product-name]-[date].md`

## 注意事项

- 保持诚实且具有建设性——目标是提高发布准备度，而不是追究责任
- 不确定时默认选择“Tiger”；尽早应对风险更好
- 在分析中纳入跨职能视角（工程、设计、市场推广）
- 在发布前 2–3 周重新审视事前复盘，以确认缓解措施按计划推进

---

### 延伸阅读

- [Meta 和 Instagram 如何使用事前复盘来避免事后复盘](https://www.productcompass.pm/p/how-to-run-pre-mortem-template)
- [如何以产品经理的身份管理风险](https://www.productcompass.pm/p/how-to-manage-risks-as-a-product-manager)