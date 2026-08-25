---
name: foundation-meeting-agenda
description: Produces an attendee-facing agenda that sets what will be discussed, who owns each topic, and how time will be spent. Supports ten meeting type variants (standup, planning, review, decision-making, brainstorm, 1-on-1, stakeholder-review, project-kickoff, working-session, exec-briefing). Emits a shareable summary suitable for Slack or email plus a full agenda with time-boxed topics, type tags, owners, attendee prep, and logistics.
license: Apache-2.0
metadata:
  classification: foundation
  version: "1.1.0"
  updated: 2026-07-04
  category: meeting
  frameworks: [meeting-skills-family]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 会议议程

会议议程是一份面向参会者的结构化文档，用于在会议前设定预期。它回答了“我们将讨论什么、每个主题由谁负责、我们将如何分配时间，以及什么样才算完成？”与会议简报不同，会议简报是用户私下进行战略准备的材料；议程会与参会者共享，重点关注结构和流程。

此技能属于会议技能家族。它遵循[会议技能家族契约](../../docs/reference/skill-families/meeting-skills-contract.md)，该契约定义了所有会议技能共用的 frontmatter、文件命名方式、go 模式行为模式，以及通用输出要求。

## 适用场景

- 主持或组织跨职能工作会议、项目启动会、利益相关者评审会或决策会议
- 任何参会者超过三人或时长超过三十分钟的会议
- 需要每次都进行新一轮框架设定的周期性会议（一对一会议、团队同步会）
- 在项目推进过程中，需要通过明确的期望成果来避免偏离方向的对齐时刻

## 不适用场景

- 用户的准备工作是私下且偏战术性的（定位、利益相关者判断、沟通诉求）。改用 `foundation-meeting-brief`。
- 会议已经结束。使用 `foundation-meeting-recap` 进行会后总结。
- 用户希望向未参会者传达会议成果。会后使用 `foundation-stakeholder-update`。

## 零摩擦执行

根据家族契约，此技能绝不会因盘问而阻塞。默认流程如下：

1. 读取所有已提供的输入（主题、任何被引用的文件、参会者列表、约束条件）
2. 对缺失值进行推断（根据主题关键词判断会议类型、默认时长、根据主题措辞判断目标、根据上下文判断参会者角色）
3. 提供简短的推断摘要，并接受单词 `go` 或修正意见
4. 生成会议议程

如果使用 `--go` 调用，则跳过推断摘要，直接使用默认值生成输出（时长 30 分钟，会议类型为 `other`，依此类推）。如果用户预先提供了所有值，则不会出现检查点。

仅当关键输入的推断置信度确实较低且不存在合理默认值时，才会提出阻塞性问题。这种情况应当很少发生。

## 反会议检查

此技能会以一个明确的问题开场：“这件事确实需要开会吗，还是可以异步处理？”

**v1.1.0：现在要求明确说明同步进行的正向价值。** 只有在至少指出以下一项时，会议才算通过检查：

- **需要讨论的权衡**。存在多个选项，且偏好尚不明确
- **需要解决的冲突**。明确的利益相关者之间存在分歧
- **共同创作**。在会议中共同进行白板讨论或文档撰写
- **关系建立**。首次与利益相关者会面，进行相互校准
- **阻塞问题升级**。需要及时解除阻塞

如果以上情况均不适用，此技能会建议采用异步替代方案（书面更新、文档评审、Slack 投票），并生成一份简短的一页式“如何异步处理此事”的框架，而不是会议议程。

此检查的 v1.0.0 版本（“single-owner decision with no tradeoffs”“pure information broadcast”“status-only sync with >5 people”）太容易被绕过。用户会把参会人数保持在五人，或在主题中添加“decision”。更严格的 v1.1.0 版本倾向于异步处理；用户仍然可以手动覆盖。

此检查与 `foundation-meeting-brief` 共享，不由会后技能（recap、synthesize、stakeholder-update）运行。

## Instructions

当用户要求创建会议议程时，请遵循以下步骤：

1. **运行反会议检查**
   应用上述触发模式。如果用户的目标符合这些模式，则提出异步替代方案并请求覆盖。只有在用户明确覆盖后，才能继续执行第 2 步。

2. **解析并加载输入**
   阅读主题或目的。加载所提供的所有 `@file` 引用。提取任何参会者列表、时间限制或链接文档。

3. **推断缺失值**
   应用以下推断规则：

   | Value | Inferred from | Default |
   |-------|---------------|---------|
   | 会议类型 | 主题关键词、参会者资历组合 | `other`（低置信度） |
   | 时长 | 主题文档中的明确说明（较少见）；当类型以中等或更高置信度推断得出时，使用特定会议类型的默认值 | v1.1.0：特定类型的时长（见 family contract）。仅 `other`、`1-on-1`、`exec-briefing`、`customer-call` 使用 30 分钟。Kickoff = 60，working-session = 60，decision-making = 45，等等。 |
   | 目标 | 主题措辞 | 推断；在摘要中呈现 |
   | 参会者 RACI | 资历、主题归属线索 | 标记所有推断结果 |
   | 期望产出 | 目标加会议类型启发式规则 | 提供初步方案 |

   **承载关键作用的推断门槛**（v1.1.0）：当参会者 RACI 或期望产出是以低于高置信度推断得出时，在 go-mode 摘要中使用 `⚠` 标记。参见 family contract 中的“Zero-friction execution”部分。

4. **呈现 go-mode 推断摘要**
   显示带有置信度标记的推断值。接受 `go` 以继续，或接受更正内容以进行修改。每次更正后都要重新运行推断，并再次呈现摘要。

5. **设计限时主题列表**
   应用会议类型变体（见下文）。设置各主题的时间，使其总和等于会议时长。如果主题列表超出可用时间，明确标记并请求协调（不要静默删减）。

   每个主题必须包含：
   - 类型标签：`Discussion | Decision | Information | Working`
   - 负责人（姓名或团队）
   - 目标（完成时应达到的状态）
   - 时间分配
   - 预读材料链接（如有）

6. **明确参会者准备事项**
   列出必需的准备事项、链接和预计准备时间。为希望了解更深层背景的参会者添加建议性背景信息。添加“准备好……”形式的预期，强制明确每位参会者将贡献什么。

7. **添加停车场和后勤占位符**
   停车场用于记录会议期间提出的偏题事项。后勤部分涵盖加入链接、所需材料和录制归属。

8. **使用填充后的值渲染 TEMPLATE.md**
   从最终产物中移除所有指导性引用块。

9. **验证输出**
   - Frontmatter 结构符合该系列契约的通用基础字段以及议程专用字段（`meeting_duration_minutes`、`desired_outcomes`）
   - 主题时间总和等于会议时长（允许 +/- 2 分钟的误差）
   - 至少列出一个预期成果
   - 反会议检查结果已记录在 `Generation context` 中

## 会议类型变体

在第 5 步应用。每种变体都会重新组织主题列表，以匹配会议目的。

- **1-on-1**：滚动式结构。上次遗留事项、本次主题、成长或发展、阻碍因素。默认 30 分钟。
- **standup**：按顺序进行状态汇报、升级事项、所需决策。默认 15 分钟。
- **planning**：聚焦承诺、检查产能、确认依赖关系。默认 60 分钟。
- **review**：优先进行演示，充分准备预读材料，并提供明确的反馈记录机制。默认 60 分钟。
- **decision-making**：提前列出选项、明确决策标准、提出明确的决策请求。必须提供包含提案的预读材料。默认 45 分钟。
- **brainstorm**：最简议程、生成式提示，不施加决策压力。默认 45 分钟。
- **stakeholder-review**：优先给出 TL;DR，围绕业务影响进行说明，并提前提出明确请求。默认 45 分钟。
- **project-kickoff**：范围、角色、成功标准、风险、沟通计划。默认 60 分钟。
- **working-session**：最简议程，必须完成会前工作，并明确交付物。默认 60 至 90 分钟。
- **exec-briefing**：优先给出 TL;DR，之后再提供支持性细节。默认 30 分钟。
- **other**：通用主题结构，默认 30 分钟。

## 项目记忆契约

仅当 `.claude/pm-skills.local.md` 存在时启用。没有该文件时，完全忽略本节，并严格按照上述说明执行。

- **读取：**读取 `active_initiative` 和最近的 `decision` artifacts，使议程反映已经确定的事项，而不会安排时间重新讨论这些事项。
- **写入：**不写入任何内容。议程是尚未举行的会议计划；摘要才是会被持久化的内容。
- **处理方式：**在写入前提出该条目并等待确认，除非设置了 `memory_auto_append: true`；在这种情况下，追加内容并回显已写入的内容。

这会补充该系列基于文件名的串联机制，而不是取代它：文件名仍用于定位同一会议的关联 artifacts，而项目记忆则在不同会议之间传递持久化的产品上下文。

## 质量检查清单

交付议程前，验证以下内容：

- [ ] 已执行并记录反会议检查
- [ ] 已设置会议类型（或明确设置为 `other` 并标记为低置信度）
- [ ] 已设置时长（未提供时默认为 30 分钟，并标记为默认值）
- [ ] 预期成果具体且可验证（不要写“讨论 X”，而应写“决定是否发布 X”）
- [ ] 每个主题都有类型标签、负责人、目标和时间
- [ ] 主题时间总和等于会议时长
- [ ] 已列出预读准备时间（未注明时长时，参会者会跳过准备）
- [ ] Logistics 部分包含加入链接和材料引用
- [ ] 可分享摘要为 5-6 行，可直接粘贴到 Slack
- [ ] Sources and References 部分包含 `Generation context`，并记录已应用的默认值和作出的推断

## 另请参阅

- [Meeting Skills Family Contract](../../docs/reference/skill-families/meeting-skills-contract.md)。共享的行为和结构要求
- [`foundation-meeting-brief`](../foundation-meeting-brief/SKILL.md)。用户的私有准备材料（共享 anti-meeting check）
- [`foundation-meeting-recap`](../foundation-meeting-recap/SKILL.md)。下游：recap 会根据此议程的主题列表自动填充
- [`foundation-stakeholder-update`](../foundation-stakeholder-update/SKILL.md)。下游：将会议结果传达给未参会者