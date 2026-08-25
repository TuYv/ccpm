---
name: define-problem-statement
description: Creates a clear problem framing document with user impact, business context, and success criteria. Use when starting a new initiative, realigning a drifted project, or communicating up to leadership.
license: Apache-2.0
metadata:
  phase: define
  version: "2.1.0"
  updated: 2026-06-10
  category: problem-framing
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 问题陈述

问题陈述是一份简明的文档，用于描述你正在解决的问题，阐明该问题对用户和业务的影响，并定义清晰的成功标准。它通过确保团队在开始思考*如何*解决问题之前，先对要解决的*是什么*问题达成一致，成为后续所有产品工作的基础。

## 适用场景

- 启动新的计划或项目，以建立共同理解
- 让偏离方向的项目回归其最初意图
- 向领导层或利益相关者沟通优先事项
- 评估某个提议的解决方案是否真正解决了核心问题
- 为新团队成员提供背景信息，帮助其完成入职

## 不适用场景

- 问题已经达成共识，而工程团队需要规格说明 -> 使用 `deliver-prd`
- 你希望提出并比较不同的解决方案方案 -> 使用 `develop-solution-brief`
- 你记录的是客户动机，而不是业务问题 -> 使用 `define-jtbd-canvas`
- 所谓的“问题”实际上是一个未经验证的假设 -> 使用 `define-hypothesis` 对其进行框定，并在让团队投入之前先进行测试

## 指南

当被要求创建问题陈述时，请遵循以下步骤：

1. **确定用户群体**
   询问是谁正在经历这个问题。具体明确用户画像、角色或细分群体。避免使用“用户”这类模糊描述——应具体到“正在完成结账的移动端购物者”或“管理 50 名以上用户的企业管理员”。

2. **了解痛点**
   深入了解用户遇到的阻碍、挫折或未满足的需求。通过追问来了解问题的严重程度和发生频率。寻找来自用户研究、支持工单或行为数据的证据。

3. **明确业务背景**
   将用户问题与业务影响联系起来。这个问题如何影响收入、留存、增长或战略目标？为什么组织应该现在投入资源解决，而不是以后再解决？

4. **定义成功指标**
   确定如何衡量成功。如果问题得到解决，哪些指标会发生变化？明确当前基线和目标改进幅度。具体说明时间范围。

5. **识别约束和注意事项**
   记录会影响解决方案空间的技术限制、资源约束、监管要求或依赖关系。

6. **记录开放性问题**
   记录当前尚未了解的内容。哪些假设需要验证？还需要开展哪些额外研究？

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的问题陈述应填写模板中的每个部分：问题摘要；用户影响；业务背景；成功标准；约束和注意事项；以及开放性问题。

## 质量检查清单

完成最终版本前，请确认：

- [ ] 问题针对明确的用户群体，而不是“所有用户”
- [ ] 影响通过数据或合理估算进行量化
- [ ] 成功指标包含基线和目标
- [ ] 问题描述的是“是什么”，而不是规定“如何”解决
- [ ] 业务背景解释了为什么现在解决这个问题很重要
- [ ] 已记录开放性问题，便于后续跟进

## 示例

请参阅 `references/EXAMPLE.md` 查看完整示例。