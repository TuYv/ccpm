---
name: foundation-meeting-recap
description: Produces a topic-segmented post-meeting summary for attendees with decisions highlighted and actions captured inline per topic (plus a consolidated action view at the end). Auto-populates topic skeleton from a sibling meeting-agenda when available and reconciles planned vs. actual topics. Accepts transcripts from Zoom, Meet, Otter, Fireflies, Krisp MCP, or manual notes; runs on variable-quality input without blocking. For synthesizing user research interviews across participants, use discover-interview-synthesis.
license: Apache-2.0
metadata:
  classification: foundation
  version: "1.2.0"
  updated: 2026-07-05
  category: meeting
  frameworks: [meeting-skills-family]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 会议回顾

会议回顾是会后面向参会者及小范围传播的、按主题分段的摘要。它按主题而非时间顺序组织内容，以视觉方式突出决策，并在每个主题分段中就地记录行动项（包括负责人、截止日期和依赖项），最后附上汇总的行动项视图，便于快速浏览。

此技能吸收了原本可能作为独立 `meeting-actions` 技能存在的功能。此类行动项与使其具有意义的上下文并列存在，而不是放在一个同级的独立产物中。

此技能属于 Meeting Skills Family。它符合 [Meeting Skills Family Contract](../../docs/reference/skill-families/meeting-skills-contract.md)。

## 使用时机

- 任何会产生影响参会者的决策或行动项的内部会议之后
- 当同级的 `foundation-meeting-agenda` 存在且需要进行核对时（计划主题与实际主题）
- 当团队需要一份按主题组织的参考资料，而不是按时间顺序堆叠的会议记录时
- 当输入包含会议转录（Zoom、Meet、Otter、Fireflies、Krisp MCP）或笔记与转录的混合内容时

## 不使用时机

- 在会议开始前设置参会者将看到的会前结构（主题、负责人、时间块）。请使用 `foundation-meeting-agenda`。recap 总结会议结束后发生的事情；agenda 则在会议前设定预期。
- 为一次重要会议准备用户的私人战略定位。请使用 `foundation-meeting-brief`。recap 是会后共享记录；brief 是不会展示给参会者的会前战术准备材料。
- 向未参会者传达会议结果。请使用 `foundation-stakeholder-update`。recap 假设读者了解相关上下文；stakeholder-update 则面向不了解上下文的读者进行转述。
- 跨会议综合（提炼多次会议之间的模式）。请使用 `foundation-meeting-synthesize`。
- 综合多个参与者的用户研究访谈，而不是单次会议参会者的内容。请使用 `discover-interview-synthesis`。recap 按主题组织单次会议；interview-synthesis 则从多次研究对话中发现模式。
- 实时记录会议笔记。此技能使用已经完成的输入；它不会实时进行转录。

## 零摩擦执行

根据该系列技能契约，此技能不会因盘问而阻塞。默认流程：

1. 阅读所有提供的输入（转录、笔记或混合内容），并在开头注明输入质量
2. 通过在同一目录中匹配文件名前缀 `*_{title}_agenda.md`，自动发现相关议程
3. 运行推断：从内容中提取会议元数据，根据语言标记识别决策，根据祈使句—将来时模式识别行动项，并根据参会者上下文确定负责人
4. 提供简短的推断摘要，并接受单词 `go` 或修正意见
5. 生成会议回顾

如果使用 `--go` 调用，则跳过推断摘要。如果用户预先提供了全部元数据，则不会出现检查点。

## 禁止编造

此技能绝不会编造负责人、决策或行动项。当行动项缺少明确负责人时，应记录为 `[owner: unassigned, needs confirmation]`，而不是自行杜撰。当决策是隐含的（“听起来我们决定了 X”）时，应使用置信度标记予以标注，而不是将其陈述为事实。编造造成的信任损耗，比标记不确定性带来的轻微摩擦更为严重。

## 所有权协调阈值（v1.1.0）

当未分配操作数与操作总数的比率超过 **0.3**（30%）时，**或者**任何高优先级操作缺少负责人时，该技能会在回顾顶部（主题分段上方）显示专门的 `## ⚠ Ownership reconciliation required` 部分，其中列出：

- 所有未分配的操作
- 每项操作的建议下一步（根据主题上下文推断可能应由谁负责，并标记为推断）
- 推荐的后续行动（Slack 线程、15 分钟同步会、异步问卷）

触发条件满足时，可分享摘要也会以此标记开头：`⚠ Ownership reconciliation required: N of M actions lack owners.`

`unassigned_action_ratio` frontmatter 字段（浮点数 0.0-1.0）记录该比率，供下游工具使用。

理由：一份有 60% 操作没有负责人的回顾，虽然符合上述禁止编造的要求，但在实际执行层面是失效的——只是一堆坏掉的工单。该阈值会让这一问题显现出来，而不是悄无声息地交付。

## 指令

当被要求创建会议回顾时，请遵循以下步骤：

1. **解析输入并检测类型**
   输入可能是会议记录（带时间戳且标注发言人的行）、笔记（项目符号或散文形式）或混合形式。提前说明输入质量。会议记录加结构化笔记属于高质量；零散的项目符号属于低质量。

2. **自动发现相关议程**
   在同一目录中查找匹配模式 `{YYYY-MM-DD}_{HH-MMtimezone}_{title-slug}_agenda.md` 的文件。如果找到，则加载该文件。其主题列表是回顾的主题骨架，其 `desired_outcomes` 驱动会议质量协调。

3. **呈现 go 模式推断摘要**
   显示检测到的会议日期、标题、参会者（如果能够推断出），以及输入质量评估。接受 `go` 或更正信息。

4. **按主题分段整理内容**
   - 如果已加载议程，则使用其主题列表作为框架（加上任何新出现的主题）
   - 如果没有议程，则根据会议记录中的话语标记识别主题（例如“接下来讨论……”“另一件事是……”）

5. **针对每个主题分段提取**
   - **讨论摘要**：用 2-3 句话概括讨论内容
   - **已作出的决定**：以粗体进行视觉标记。绝不编造。如果不确定，则标记为“似乎决定了 X [confidence: medium]”
   - **操作事项**：负责人 + 截止日期 + 依赖项。缺少负责人时标记为 `[owner: unassigned]`，缺少日期时标记为 `[due: not specified]`。绝不臆测。
   - **开放问题**：尚未解决的事项，并标注其确实未解决还是只是未被再次提出的置信度

6. **按负责人整合操作事项**
   将所有操作事项按负责人重新分组。这样便于单负责人查看（“这次会议后我需要负责什么？”）。

7. **协调议程**（如果已加载议程）
   - `topics_planned`：来自议程主题列表
   - `topics_hit`：实际讨论过的主题
   - `topics_skipped`：计划中但未讨论的主题，并附上简要原因
   - `topics_emerged`：讨论过但不在议程中的主题

8. **评估会议质量信号**
   - `outcomes_achieved`：议程中 `desired_outcomes` 已达成项的 N/M 比率（有议程时）
   - `started_on_time` / `ended_on_time`：在有时间戳时根据时间戳确定；没有时间戳时跳过
   - `key_attendees_present`：如果决策者缺席，则进行标记

9. **明确后续步骤**
   下次重新开会时，在此之前关键路径上需要完成哪些事项。

10. **渲染 TEMPLATE.md 并进行验证**
    - 每个行动项的负责人都出现在 `attendees` 中，或明确标记为 `unassigned`
    - 填充 `meeting_quality.outcomes_achieved` 时，其值符合 `N/M` 格式
    - 即使列表为空，也必须存在 `agenda_reconciliation` 字段

## 项目记忆契约

仅当 `.claude/pm-skills.local.md` 存在时启用。没有该文件时，完全忽略本节，
并严格按照上述说明执行。

- **读取：**读取 `active_initiative`，确保决策记录归属于其所属的倡议。
- **写入：**将会议中实际达成的每项决策写入 `## Decisions` 部分，注明日期和归属人；此外，将会议回顾本身作为一个 `decision` 工件写入。
- **执行方式：**提出待写入条目并等待确认后再写入；但如果设置了 `memory_auto_append: true`，则直接追加，并回显已写入的内容。
- **写入纪律：**在写入前立即重新读取文件，绝不能使用生成提案的副本。如果文件在此期间发生变化，则将你的条目合并到当前状态中，并重新提出，而不是覆盖文件；只能添加你自己的条目，其他字段和部分必须逐字节保持不变。运行时不会强制执行这些要求，而且该文件被 gitignore 忽略，因此粗心地写入整个文件会丢失其他会话的工作，且无法恢复。

上述禁止捏造规定无例外地适用于此次写入：只能记录已经明确陈述的决策。未记录的决策仍可恢复；而被捏造并写入持久记忆的决策则无法恢复。这与基于文件名的串联机制相互补充，而不是取而代之：文件名仍用于定位某次会议的相关工件，而项目记忆则在不同会议之间传递持久的产品上下文。

## 质量检查清单

- [ ] 如实标记输入质量（高 / 中 / 低）
- [ ] 尝试自动发现议程；在生成上下文中记录结果
- [ ] 每个主题片段都有 Discussion / Decisions / Actions / Open questions 小节
- [ ] 决策使用粗体标记；绝不捏造；如为推断，标注置信度
- [ ] 每个行动项都有负责人（或明确标记为 `unassigned`）以及截止日期（或明确标记为 `not specified`）
- [ ] 按负责人重新归组，形成汇总行动项视图
- [ ] 议程已加载时，填写议程对照信息
- [ ] 使用可用数据填写会议质量信号；对跳过的字段进行标记
- [ ] 可分享摘要为 5-6 行，以决策和最重要的行动项开头
- [ ] Sources and References 生成上下文记录了会议记录来源，以及任何缺失的负责人/日期

## 另请参阅

- [会议技能系列契约](../../docs/reference/skill-families/meeting-skills-contract.md)
- [`foundation-meeting-agenda`](../foundation-meeting-agenda/SKILL.md)。上游：提供主题骨架和预期成果
- [`foundation-meeting-synthesize`](../foundation-meeting-synthesize/SKILL.md)。下游：使用会议回顾进行跨会议综合
- [`foundation-stakeholder-update`](../foundation-stakeholder-update/SKILL.md)。下游：将会议回顾成果传达给未参会者