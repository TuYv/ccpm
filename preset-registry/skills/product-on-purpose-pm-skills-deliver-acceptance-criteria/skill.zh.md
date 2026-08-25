---
name: deliver-acceptance-criteria
description: Generates structured Given/When/Then acceptance criteria for a user story or feature slice, covering the happy path, key failure scenarios, and non-functional expectations in testable form. Use when turning requirements into verifiable scenarios for engineering handoff and QA sign-off. For a dedicated catalog of boundary conditions, error states, and recovery paths across a feature, use deliver-edge-cases; to write the stories themselves, use deliver-user-stories.
license: Apache-2.0
metadata:
  phase: deliver
  version: "1.1.0"
  updated: 2026-06-10
  category: specification
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 验收标准

验收标准定义了一个故事或功能要被视为完成时必须满足的可观察行为。此技能将功能上下文转化为简洁、可测试的 Given/When/Then 场景，使工程师和 QA 无需猜测意图即可进行验证。

## 适用场景

- 用户故事、PRD 章节或功能切片已经定义之后
- 团队需要明确的通过/失败条件来指导实现时
- 为迭代规划或交接编写可供 QA 使用的标准时
- 故事包含应明确说明的边界情况、错误路径或非功能性预期时

## 不适用场景

- 你需要编写用户故事本身 -> 使用 `deliver-user-stories`；此技能用于深化已有故事
- 你需要覆盖整个功能的系统性失败场景 -> 使用 `deliver-edge-cases`；此技能的范围限定在单个故事内
- 目前还没有可作为验收标准依据的故事或切片 -> 先使用 `deliver-prd` 或 `deliver-user-stories`
- 你正在为实验定义成功指标，而不是为故事定义完成标准 -> 使用 `measure-experiment-design`

## 指令

当被要求创建验收标准时，请遵循以下步骤：

1. **确认故事或功能范围**
   识别确切的工作切片。如果范围不明确，请在起草标准前要求提供用户故事、PRD 章节或功能描述。

2. **将正常路径与例外情况分开**
   先从主要成功流程开始，然后补充遗漏后可能造成较大影响或较为常见的边界情况和错误状态。

3. **将每条标准写成可观察的场景**
   仅使用 Given/When/Then 语言。确保每条标准都可以独立测试，并避免涉及实现细节。

4. **覆盖恢复和失败行为**
   描述验证失败、依赖项不可用或保存操作无法完成时，用户能看到什么或可以执行什么操作。

5. **包含非功能性预期**
   在与故事相关时，添加关于性能、可访问性、安全性、可靠性或可审计性的标准。

6. **避免重复和重叠**
   每条标准都应测试一个结果。如果两条标准描述的是相同的行为，请将它们合并或拆分，直到意图清晰为止。

7. **检查可测试性**
   确保评审者无需解释即可判定每条标准通过或失败。如果某项表述较为主观，请将其改写为可衡量的结果。

## 输出约定

使用 `references/TEMPLATE.md` 作为输出格式。完整的响应应：

- 重述功能或故事上下文
- 将标准分组为正常路径、边界情况、错误状态和非功能性标准
- 为每条标准使用明确的 Given/When/Then 表述
- 当上下文不完整时，注明假设或待解决问题

## 质量检查清单

在最终确定之前，请验证：

- [ ] 标准对应于具体的故事或功能切片
- [ ] 首先覆盖了正常路径
- [ ] 边界情况已明确说明，而不是隐含表达
- [ ] 错误状态包含面向用户的恢复行为
- [ ] 在相关情况下包含了非功能性标准
- [ ] 每条标准都可测试，并且只有一个明确的结果
- [ ] 验收标准中没有泄露实现细节

## 示例

请参阅 `references/EXAMPLE.md`，其中提供了一个基于真实电商结账流程的完整示例。