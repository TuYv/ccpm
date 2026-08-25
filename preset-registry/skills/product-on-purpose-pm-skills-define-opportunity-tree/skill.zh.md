---
name: define-opportunity-tree
description: Creates an opportunity solution tree connecting a desired outcome to customer opportunities and candidate solutions, preventing solution-first jumps in continuous discovery. Use when structuring scattered feature ideas or communicating how the roadmap traces to outcomes. For ranking an existing flat list of candidates, use define-prioritization-framework instead; this skill discovers the list, it does not score one.
license: Apache-2.0
metadata:
  phase: define
  version: "2.2.0"
  updated: 2026-07-04
  category: problem-framing
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 机会解决方案树

机会解决方案树（OST）是一种用于产品探索的可视化框架，它将业务成果与客户机会及潜在解决方案连接起来。该框架由 Teresa Torres 开发，通过确保每个功能创意都能追溯到客户需求和可衡量的成果，避免陷入直接跳到解决方案这一常见误区。

## 适用场景

- 在持续进行产品探索期间组织学习
- 确定要追求哪些机会的优先级时
- 向利益相关者传达产品战略时
- 功能创意过多、需要建立结构时
- 用户研究之后，将洞察与行动联系起来时
- 让团队对最重要的成果达成一致时

## 不适用场景

- 你需要为一份已知候选项的扁平列表评分和排序 -> 使用 `define-prioritization-framework`；树用于组织探索，而不是进行排序
- 你需要为团队梳理一个具体问题 -> 使用 `define-problem-statement`
- 你准备测试一个单独的假设 -> 使用 `define-hypothesis`，然后使用 `measure-experiment-design`
- 你希望推动的成果尚未达成一致 -> 先使用 `foundation-okr-writer` 确定成果；没有共识成果的树只是在装饰观点

## 操作说明

当被要求创建机会解决方案树时，请遵循以下步骤：

1. **定义期望成果**
   从顶部开始，明确一个清晰、可衡量的业务或产品成果。这应该是你能够通过产品变更影响的成果。尽可能用定量方式表达（例如，“将 30 天留存率从 40% 提升至 55%”）。

2. **识别机会领域**
   分支出 3-5 个机会领域。即可以解决客户需求或痛点的地方。机会不是解决方案；它们是客户的问题、需求或愿望。请从客户的角度进行表述。

3. **添加支持证据**
   对于每个机会，记录支持它的证据：用户研究引述、行为数据、支持工单或市场趋势。强有力的机会通常有多个证据来源。

4. **头脑风暴解决方案**
   针对每个机会，生成 2-4 个潜在解决方案。在这一阶段不要自我审查。解决方案可以从快速实验到大型功能不等。保持足够具体，以便进行评估。

5. **定义假设测试**
   对于每个有潜力的解决方案，识别风险最高的假设，并设计一个轻量级实验来测试它。良好的测试能够验证该解决方案是否确实会解决这一机会。

6. **确定树的优先级**
   并非所有分支都同等重要。根据潜在影响、信心和投入，标记你将首先推进的机会和解决方案。这棵树是一份动态文档。你会随着学习不断迭代。

7. **将结构可视化**
   创建一个树状图，展示层级结构：顶部是成果，下方是机会，每个机会下方是解决方案，叶节点是实验。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一棵完整的树应填充模板中的每个部分：期望结果；视觉化树；机会分支；优先级排序；实验待办事项；学习日志；以及后续步骤。

## 质量检查清单

定稿前，请确认：

- [ ] 结果可衡量，且在产品团队的影响范围内
- [ ] 机会以客户为中心（需求/问题，而非功能）
- [ ] 每个机会都有记录在案的支持性证据
- [ ] 每个机会都有多个解决方案（而不是直接跳到某一个方案）
- [ ] 假设明确，并且已设计相应实验
- [ ] 优先级清晰（先探索哪个分支）

## 示例

请参阅 `references/EXAMPLE.md` 中的完整示例。