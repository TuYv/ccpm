---
name: deliver-edge-cases
description: Documents edge cases, error states, boundary conditions, race conditions, and recovery paths for a feature - the systematic catalog of what can go wrong and the failure modes to design for. Use during specification to map the failure surface and ensure comprehensive coverage, or during QA planning to identify boundary and limit scenarios to test. Distinct from deliver-acceptance-criteria, which writes story-level Given/When/Then checks; this skill produces the whole-feature edge-case catalog.
license: Apache-2.0
metadata:
  phase: deliver
  version: "2.1.1"
  updated: 2026-06-13
  category: specification
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 边界情况

边界情况文档系统地整理功能中的异常、边界和错误场景。虽然正常路径流程通常都有完善的规范，但边界情况往往在生产环境中才被发现——从而导致错误、糟糕的用户体验和支持负担。提前记录边界情况可以确保工程团队有意识地处理这些情况，并让 QA 知道需要测试什么。

## 适用场景

- 当你需要枚举失败模式、竞态条件、超时以及边界或限制场景——所有可能出错的情况——并为每种情况定义恢复路径时
- 在工程工作开始前进行功能规格说明时
- 准备 QA 测试计划时
- 发现生产环境错误后，以防止类似问题再次发生时
- 审查 PRD 或用户故事的完整性时
- 发布前确保错误状态已经完成设计时

## 不适用场景

- 你需要用于交接的、限定于用户故事范围的 Given/When/Then 检查项 -> 使用 `deliver-acceptance-criteria`；此技能整理的是整个功能的失败面
- 功能的规格说明还不足以枚举输入、状态和限制 -> 先使用 `deliver-prd`
- 生产事故已经发生，并且你希望将经验记录下来 -> 使用 `iterate-lessons-log`，然后用新案例更新此目录
- 你需要的是发布准备协调，而不是失败分析 -> 使用 `deliver-launch-checklist`

## 说明

当被要求记录边界情况时，请遵循以下步骤：

1. **定义功能范围**
   清晰描述你正在分析的功能或流程。边界情况取决于上下文——同一个输入在一个功能中可能有效，在另一个功能中却可能无效。

2. **逐项检查输入验证**
   考虑每一种用户输入：如果为空怎么办？太长怎么办？格式错误怎么办？包含特殊字符怎么办？有效值的最小值和最大值是多少？

3. **探索边界条件**
   找出可接受范围的边界。如果字段接受 1-100，则测试 0、1、100 和 101。考虑分页边界、超时阈值和速率限制。

4. **梳理错误状态**
   识别可能出错的情况：网络故障、权限被拒绝、资源未找到、并发修改、会话过期。记录场景和预期行为。

5. **考虑并发问题**
   如果两个用户同时操作怎么办？如果用户双击怎么办？如果数据在加载和保存之间发生变化怎么办？竞态条件往往会导致细微的错误。

6. **定义恢复路径**
   对于每个错误，明确用户如何恢复。他们会看到什么消息？可以重试吗？数据会保留吗？良好的错误处理可以将挫败感转化为信心。

7. **按可能性和影响进行优先级排序**
   并非所有边界情况都需要同等关注。高可能性 + 高影响的情况需要稳健处理；罕见 + 低影响的情况可能只需要优雅地失败。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的边界情况目录应填写模板中的每个部分：功能概览；边界情况类别；错误消息；恢复路径；以及测试场景。

## 质量检查清单

在最终确定之前，请验证：

- [ ] 已记录所有用户输入的验证边界情况
- [ ] 已明确列出边界条件
- [ ] 已涵盖网络/系统故障场景
- [ ] 每种错误状态都有定义好的面向用户的消息
- [ ] 已指定恢复路径（而不仅仅是错误检测）
- [ ] 已根据发生可能性和影响对边界情况进行优先级排序

## 示例

请参阅 `references/EXAMPLE.md`，其中包含一个完整示例。