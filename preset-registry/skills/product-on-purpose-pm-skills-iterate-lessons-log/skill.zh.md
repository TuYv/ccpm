---
name: iterate-lessons-log
description: Creates a structured lessons learned entry for organizational memory. Use after an incident, a completed project, or a significant learning to record knowledge for future teams and initiatives. Distinct from iterate-retrospective, which facilitates the team ceremony; this skill writes the durable lessons entry that outlives it.
license: Apache-2.0
metadata:
  phase: iterate
  version: "2.1.0"
  updated: 2026-06-10
  category: reflection
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 经验日志

经验日志条目以一种对未来未亲历相关事件的团队有用的格式，记录项目、事件或经历中的重要学习成果。与回顾会议不同（回顾会议关注团队改进），经验日志关注能够超越单个团队的组织知识，包括模式、反模式和来之不易的经验。

## 适用时机

- 完成重要项目或计划之后
- 发生重大事件、服务中断或失败之后
- 当你意识到某件重要事情，认为其他人也应该知道时
- 发现某种模式反复出现之后
- 有经验的团队成员离开时（记录他们的知识）
- 在事后复盘期间保留经验教训

## 不适用时机

- 你正在主持团队仪式本身 -> 使用 `iterate-retrospective`；此技能用于沉淀能够长期留存的条目
- 你正在根据结果决定是否改变方向 -> 使用 `iterate-pivot-decision`
- 学习内容是一次实验结果汇报 -> 首先使用 `measure-experiment-results`，然后将可迁移的经验沉淀到此处
- 你正在向利益相关者同步所学内容 -> 使用 `foundation-stakeholder-update`

## 说明

当被要求创建经验日志条目时，请遵循以下步骤：

1. **选择描述性标题**
   撰写一个正在搜索该主题的人能够找到的标题。包含能够描述情境和经验的关键词。避免使用“项目 X 经验”之类的通用标题。

2. **提供背景**
   充分解释相关情境，使未亲历事件的人能够理解。包括项目、时间线、团队以及任何相关约束条件。未来的读者需要这些背景来判断该经验是否适用。

3. **描述发生了什么**
   对发生的事情进行事实性描述。具体说明采取了哪些行动、做出了哪些决策，以及观察到了哪些结果。避免归咎于个人，关注事件和系统。

4. **提炼经验**
   清晰阐述你学到了什么。经验应当具有可操作性，即其他人能够应用。区分你观察到的事实，以及你对其重要性的解释。

5. **提出建议**
   为未来面临类似情境的团队提供具体指导。他们应该做什么？应该避免什么？应该提出哪些问题？

6. **明确适用性**
   帮助读者了解该经验何时适用。哪些情境会触发其相关性？哪些背景会使其更适用或不那么适用？

7. **添加便于搜索的标签**
   包含能够帮助未来搜索者找到该条目的关键词和分类。思考一下，面临类似情境的人会搜索什么。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。完整条目应填写模板中的每个部分：元数据；摘要；背景；发生了什么；经验；建议；适用性；支持性证据；标签和分类；以及审查和更新。

## 质量检查清单

在最终确定之前，请确认：

- [ ] 标题具有描述性且便于搜索
- [ ] 上下文足够完整，即使不在场的人也能理解
- [ ] 经验教训表达清晰且可付诸行动
- [ ] 建议具体明确，而非含糊笼统
- [ ] 条目可独立理解（不需要外部上下文）
- [ ] 标签便于未来查找

## 示例

请参阅 `references/EXAMPLE.md` 中的完整示例。