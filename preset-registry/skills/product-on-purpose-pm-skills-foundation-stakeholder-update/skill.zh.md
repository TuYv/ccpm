---
name: foundation-stakeholder-update
description: Produces async communication to stakeholders, primarily non-attendees and secondarily some attendees who want a reference. Translates meeting outcomes into what-it-means language for readers, with channel variants (slack, teams, email, notion, exec-memo) and audience variants (engineering, design, leadership, customer-facing, mixed). Surfaces a primary CTA up front, flags technical-to-business translations for user verification, and detects thread continuation from prior updates.
license: Apache-2.0
metadata:
  classification: foundation
  version: "1.1.0"
  updated: 2026-07-05
  category: meeting
  frameworks: [meeting-skills-family]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 利益相关者更新

利益相关者更新是一种异步沟通，用于向需要了解会议结果的读者传达信息。主要受众是未参会者；次要受众是希望获得参考版本的部分参会者（迟到、临时离席，或需要转发给他人）。

它在受众、格式和目的上均不同于 `foundation-meeting-recap`：recap 是为在场人员总结发生了什么；stakeholder-update 则是将结果转化为对读者而言意味着什么（根据其角色进行定制，并在受众需要时将技术内容转译为业务语言）。

它不同于 `/discover-stakeholder-summary`：该技能关注的是理解利益相关者（作为用户工作的输入）；本技能关注的是向利益相关者传达信息（作为用户工作的输出）。

此技能属于 Meeting Skills Family。它符合 [Meeting Skills Family Contract](../../docs/reference/skill-families/meeting-skills-contract.md)。

## 适用场景

- 会议结束后，会议结果会影响未参会的团队
- 某项决策或承诺需要异步传达给下游团队
- 已有会议回顾，需要将其转译为面向特定受众的语言
- 需要读者采取行动（明确的 CTA），且不能让 CTA 淹没在其他内容中

## 不适用场景

- 为参会者总结发生了什么。请使用 `foundation-meeting-recap`。
- 在没有针对特定受众进行定制的情况下广播状态。普通 Slack 消息即可满足需求；只有在翻译或 CTA 表述很重要时，该技能才有价值。
- 向利益相关者传达研究结果。请使用 `/discover-interview-synthesis`，再配合有针对性的沟通。
- 来源不是单次会议的结果，而是一份更广泛的产物（规范、探索综合、研究报告、GTM 计划或实验结果），需要从一个规范主文档向多个受众分别定制的简报进行扩散。请使用 `foundation-stakeholder-briefings`。

## 零摩擦执行

根据 family contract，此技能绝不会因盘问而阻塞。默认流程：

1. 加载相关回顾（首选）或原始会议笔记
2. 扫描同一目录中与相同 `project`/`topics` 相关的既有 stakeholder-updates，检测是否为线程延续
3. 推断渠道（如果未指定）：根据受众变体进行判断：工程 / 设计 → slack；领导层 → email；混合受众 → notion
4. 提供简短的推断摘要（检测到的渠道、受众、CTA、是否延续线程、可进行翻译的内容）
5. 接受 `go` 或修正意见
6. 生成针对相应渠道定制的更新

如果使用 `--go` 调用，则跳过推断摘要。整个输出都是可直接分享的内容（根据 family contract，不需要单独的摘要区块）。

## 说明

当被要求创建利益相关者更新时，请遵循以下步骤：

1. **加载相关回顾**
   解析 frontmatter，提取会议背景、决策、行动和结果。如果未提供回顾，则接受原始会议笔记，但需降低输入质量标记。

2. **检测线程延续关系**
   扫描同一目录，查找 `project` / `topics` 匹配的既有 `stakeholder-update` 成果。如果找到，则在 frontmatter 的 `thread_continuation_of` 字段中引用之前的更新。

3. **呈现 go-mode 推断摘要**
   展示推断出的渠道（如果未指定）、检测到的受众、拟议的 CTA、线程延续状态、翻译候选项（标记可能无法被受众理解的术语或缩略词）。

4. **提炼关键结果**
   从回顾或笔记中，选出对目标受众重要的 3-5 项结果。不要包含回顾中的所有内容。根据受众相关性进行筛选。

5. **设计 CTA**
   如果需要采取行动：将其置于开头，不要埋在正文中  
   如果仅供知悉：在 TL;DR 中明确说明

6. **将技术语言转化为业务语言**
   标记受众不太可能理解的术语和缩略词。提供更通俗的替代表述。在输出的 Generation context 中保留翻译应用日志，供用户核验。

7. **构建适配渠道的变体**

   - **Slack / Teams**：标题（包含一行行动导向的内容，可选择添加一个 emoji）、TL;DR 3 个要点、背景句、“这对 [audience] 意味着什么”、CTA（如果需要采取行动，则使用粗体并带标记；如果不需要，则使用斜体的 “FYI-only”）、线程延续链接、更多链接页脚
   - **Email**：主题行（主题 + 结果）、问候语（“Hi [audience]”）、开场句（标题 + 他们为何会收到这封邮件）、TL;DR、2-3 句背景说明、已决定 / 已推进的事项、这对你的团队意味着什么、我需要你做什么（包含截止时间）、线程引用、署名
   - **Notion**：丰富的 H1/H2/H3 结构、更长的背景信息块、用于详细内容的可折叠部分、用于决策和行动的表格
   - **Exec-memo**：首先呈现 TL;DR（3-4 行）、最多分为 3 个部分的支持性细节、在前面设置请求部分、正式语气、不使用 emoji

8. **使用选定的变体渲染 TEMPLATE.md**
   将选定的变体作为主要内容。为方便用户灵活使用，可以将其他变体作为可折叠的备选项纳入。移除最终成果中的所有指导性引用块。

9. **验证**
   - `channel` 属于枚举值
   - `audience_variant` 属于枚举值
   - `primary_cta` 非空（如果不需要采取行动，则使用 “FYI-only”）
   - `related_recap` 是有效的文件名引用，或已标记为 raw-notes 输入

## 质量检查清单

- [ ] 渠道变体与指定或推断出的渠道匹配
- [ ] 受众变体中的“这对你意味着什么”经过具体定制（而非泛泛而谈）
- [ ] CTA 被置于前面，而不是埋在正文中
- [ ] 技术语言到业务语言的翻译已记录在 Generation context 中，供用户核验（INTERNAL，位于可分享边界之外）
- [ ] 如果存在同一主题的既有更新，则引用线程延续关系
- [ ] 存在 `## Shareable update` 部分，并包含适配渠道的正文（v1.1.0. 已取代 v1.0.0. 中的“整个输出均可分享”）
- [ ] Shareable update 与内部部分（翻译、来源）之间存在明确的边界标记
- [ ] Sources and References 部分列出来源回顾以及线程中的任何既有更新（INTERNAL）
- [ ] 文件名使用 v1.1.0 变体格式：`YYYY-MM-DD_HH-MMtimezone_title_stakeholder-update-{channel}-{audience}.md`

## 另请参阅

- [会议技能系列契约](../../docs/reference/skill-families/meeting-skills-contract.md)
- [`foundation-meeting-recap`](../foundation-meeting-recap/SKILL.md)。上游：主要输入来源
- [`/discover-stakeholder-summary`](../discover-stakeholder-summary/SKILL.md)。用途不同（用于了解利益相关者，而非与其沟通）。