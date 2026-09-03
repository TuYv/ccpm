---
name: before-you-build
description: Pre-build product and feature risk review for founders, product managers, and AI-assisted builders. Use this skill when the user is about to build a landing page, MVP, SaaS product, internal tool, agent workflow, or major feature and needs to check demand, positioning, monetization, retention, trust, distribution, and adoption risk before implementation starts.
---
# 在构建之前

在动手实现之前，先进行一次简短的事前剖析（pre-mortem）。其目标不是阻止构建，而是识别风险最高的假设、最小的验证步骤，以及应当推迟到证据改善之后再进行的构建范围。

## 何时使用

当用户要求构建或发布以下内容时，使用此技能：

- 全新产品、MVP、原型、落地页、SaaS 应用、交易市场、内容网站、智能体工作流或内部工具
- 对采用率、收入、留存、信任或分发影响尚不明确的重要功能
- 定位薄弱可能浪费开发或推广投入的公开发布类资产

当任务属于以下情形时跳过此技能：范围狭窄的实现修复、重构、测试修复、依赖更新，或具有明确验收标准的已验证变更。

## 风险清单

从以下风险维度审视该想法：

- **需求：** 是否有证据表明某个具体的买家或用户迫切需要它？
- **定位：** 目标用户能否用一句话理解它是什么以及它为何重要？
- **变现：** 是否存在通往付费、预算或战略价值的可信路径？
- **留存：** 用户在首次尝试之后有理由再次回来吗？
- **信任：** 该产品是否需要可信度、数据访问、集成或用户可能抗拒的行为改变？
- **分发：** 是否有可复用的方式触达目标用户？
- **功能采用：** 对于功能开发而言，该功能会改变用户行为，还是只是徒增表面积？

如果结论并不明显，请使用 `references/risk-checklist.md` 获取更深入的问题。

## 输出格式

保持回答简短且以决策为导向：

1. **风险结论：** 低、中或高风险，并用一句话解释原因。
2. **主要假设：** 最可能导致项目失败的那个单一假设。
3. **优先寻找的证据：** 在投入更多构建之前能获取的最小有效信号。
4. **下一步行动：** 一个具体的验证步骤或缩减后的构建范围。
5. **推迟事项：** 暂时不要构建的内容。

## 指引

- 对证据薄弱之处直言不讳，但避免否定用户的想法。
- 倾向于小型验证步骤，而非庞大的调研计划。
- 将产品风险与工程难度区分开来。
- 如果该想法已得到验证，请说明是什么证据使其风险较低，并建议最小的实现切片。
- 如果缺少事实，请指明缺失的证据，而不是编造市场论断。
