---
name: define-hypothesis
description: Defines a testable hypothesis with clear success metrics and a validation approach. Use when forming assumptions to test or aligning a team on what success looks like, before any experiment is designed. To design the A/B test or experiment that will validate the hypothesis, use measure-experiment-design.
license: Apache-2.0
metadata:
  phase: define
  version: "2.1.0"
  updated: 2026-06-10
  category: ideation
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 假设

假设是关于某项变更将如何影响用户行为或业务结果的可测试预测。它将各种假定转化为可以通过实验验证或证伪的明确陈述。结构良好的假设能够防止团队基于未经验证的想法构建功能，并帮助团队就成功的表现形成共识。

## 适用场景

- 完成问题界定后、决定投入某个解决方案之前
- 设计实验或 A/B 测试时
- 团队成员对用户行为存在不同假设时
- 在为某项功能投入大量工程资源之前
- 调整方向并需要验证新方案时

## 不适用场景

- 你已经准备好设计实际的 A/B 测试（变体、样本量、持续时间）-> 使用 `measure-experiment-design`；此技能用于界定要测试的内容，而不是说明如何测试
- 问题本身尚未完成界定 -> 首先使用 `define-problem-statement`
- 你希望将多个假设和想法组织成一个探索结构 -> 使用 `define-opportunity-tree`
- 团队需要完整的商业模式全貌，而不是一项可测试的主张 -> 使用 `foundation-lean-canvas`

## 说明

当被要求创建一个假设时，请按照以下步骤操作：

1. **陈述信念**
   明确阐述你认为会发生什么。使用以下结构化格式：“我们相信，对[目标用户]实施[行动/变更]将会带来[预期结果]。”要具体说明干预措施——模糊的假设无法进行测试。

2. **确定目标用户**
   明确定义该假设适用的对象。关于“用户”的假设范围过于宽泛。请明确细分群体：首次使用后处于第一周的新用户、使用次数达到 10 次以上的高频用户、回访的流失用户等。

3. **定义预期结果**
   你预期会出现什么行为变化或结果？在可能的情况下，应使用用户行为来描述，例如完成引导流程、完成购买、在 7 天内回访，而不是使用内部指标。

4. **设定成功指标**
   选择一个能够直接衡量预期结果的主要指标。包括能够提供背景信息的次要指标，以及能够确保你没有在其他方面造成损害的护栏指标。

5. **描述验证方法**
   你将如何测试这一假设？A/B 测试、用户访谈、原型测试、队列分析？请具体说明样本量、持续时间和统计要求。

6. **记录风险和假设**
   除了测试结果之外，还有什么因素可能使这一假设失效？哪些尚未验证、但你假定为真实的事项？

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的假设文档应填写模板中的每个部分：假设陈述；背景与依据；目标用户细分；成功指标；验证方法；风险与假设；以及时间线。

## 质量检查清单

完成前，请确认：

- [ ] 假设是可证伪的（有可能证明其错误）
- [ ] 成功指标包含明确的数值目标
- [ ] 目标用户细分定义清晰
- [ ] 验证方法切实可行且有明确的时间限制
- [ ] 通过/失败标准明确无歧义
- [ ] 假设没有预先假定解决方案有效

## 示例

请参阅 `references/EXAMPLE.md` 查看完整示例。