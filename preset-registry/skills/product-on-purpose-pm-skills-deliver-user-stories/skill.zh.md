---
name: deliver-user-stories
description: Generates user stories in the standard persona, action, benefit story format from product requirements or feature descriptions. Use when breaking a feature into stories for sprint planning, writing tickets, or communicating scope to engineering. For testable Given/When/Then acceptance criteria on a story, use deliver-acceptance-criteria; for boundary and failure scenarios, use deliver-edge-cases.
license: Apache-2.0
metadata:
  phase: deliver
  version: "2.1.0"
  updated: 2026-06-10
  category: specification
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 用户故事

用户故事是从用户视角对功能的简洁描述。它们记录谁需要什么、他们需要它的原因，而不规定应如何构建。优秀的用户故事能够帮助团队将大型功能拆分为可估算、可交付的增量，同时始终聚焦于用户价值。

## 适用场景

- PRD 获得批准后，将功能拆分为实现任务时
- Sprint 规划期间，创建可执行的工作项时
- 为工程团队编写工单时
- 以易于理解的方式向利益相关者传达需求时
- 基于用户价值确定待办事项优先级时

## 不适用场景

- 你需要针对单个故事或切片进行更深入、可供 QA 使用的 Given/When/Then 覆盖时 -> 使用 `deliver-acceptance-criteria`
- 你需要覆盖整个功能的边界条件和失败场景目录时 -> 使用 `deliver-edge-cases`
- 功能本身尚未完成规格定义时 -> 先使用 `deliver-prd`；故事应能够追溯到已记录的需求
- 你希望获得细化会议的结果（估算、范围决策、待解决问题）时 -> 使用 `iterate-refinement-notes`

## 指令

当被要求创建用户故事时，请遵循以下步骤：

1. **理解功能背景**
   查看 PRD 或功能描述。理解整体目标、目标用户和范围边界。用户故事应能够追溯到已记录的需求。

2. **识别用户角色**
   确定哪些用户会与此功能交互。每个故事都应针对特定角色编写，而不是笼统的“用户”。不同角色对于同一功能可能需要不同的故事。

3. **按用户目标拆分**
   将功能拆解为不同的用户目标。每个故事都应交付一项完整且有价值的能力——即故事完成后用户可以实际完成的事情。

4. **编写故事陈述**
   使用以下格式：“作为一名[角色]，我希望[操作]，以便[收益]。”收益部分至关重要——它解释了这为何重要，并有助于确定优先级。

5. **定义验收标准**
   使用 Given/When/Then 格式编写具体、可测试的标准。验收标准定义了“完成”的含义——如果所有标准都通过，则故事完成。

6. **应用 INVEST 标准**
   根据 INVEST 对每个故事进行验证：Independent（独立）、Negotiable（可协商）、Valuable（有价值）、Estimable（可估算）、Small（小型）、Testable（可测试）。修改不符合这些标准的故事。

7. **添加背景和备注**
   包含相关的设计参考、技术考量和依赖关系。这些内容有助于实现人员了解完整情况。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。完整的输出应针对每个故事包含：故事标题；用户故事陈述；背景与上下文；验收标准；设计备注；技术备注；依赖关系；不在范围内的内容；以及仍待解决的问题（如有）。多故事文档应将这些部分嵌套在每个故事各自的标题下，如示例所示。

## 质量检查清单

完成前，请确认：

- [ ] 每个故事都遵循“As a... I want... so that...”格式
- [ ] 故事彼此独立（可以按任意顺序构建）
- [ ] 验收标准使用 Given/When/Then 格式
- [ ] 每条标准都可测试（有人能够验证其通过或失败）
- [ ] 故事足够小，可以在一个 sprint 内完成
- [ ] 故事陈述中没有实现细节
- [ ] 受益条款说明了这对用户为何重要

## 示例

请参阅 `references/EXAMPLE.md`，其中包含一个完整示例。