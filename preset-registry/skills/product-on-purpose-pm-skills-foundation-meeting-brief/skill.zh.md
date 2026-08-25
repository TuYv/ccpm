---
name: foundation-meeting-brief
description: Produces a private strategic preparation document for the user before a meeting that matters. Captures stakes, stakeholder positions and reads, ranked desired outcomes, key messages, anticipated questions with prepared responses, risks and tensions, specific asks, and success signals. Distinct from meeting-agenda because this artifact is not shared with attendees; it is the user's personal tactical prep for meetings where positioning matters.
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
# 会议简报

会议简报是用户为会议准备的私人战略文档，适用于上下文、利害关系或立场定位十分重要的场合。它记录用户需要了解的内容、希望达成的目标、需要与哪些人沟通，以及如何应对这场对话。这是战略准备，而不是会议结构，因此有别于会议议程。

此技能属于 Meeting Skills Family。它符合 [Meeting Skills Family Contract](../../docs/reference/skill-families/meeting-skills-contract.md)。

## 适用场景

- 参加利益相关者评审、高管简报会或与谈判相关的对话前
- 与新利益相关者的首次会议，且关系定位很重要
- 用户需要从他人那里获得某些东西的会议（产能投入承诺、决策、批准）
- 任何需要进行特定立场定位、信息传达或风险应对的对话

## 不适用场景

- 准备供参会者查看的议程。请改用 `foundation-meeting-agenda`。
- 会后总结。请改用 `foundation-meeting-recap`。
- 会议风险低且流程成熟（例行团队同步会、站会）。为这些会议准备简报属于额外负担；仅议程就足够了。

## 零摩擦执行

根据该系列的契约，此技能不会因盘问而阻塞。默认流程如下：

1. 读取所有已提供的输入（主题、参会者、过往会议回顾、利益相关者摘要、用户的首要诉求）
2. 通过 `project` 或 `topics` 前置元数据匹配，自动发现相关工件
3. 对缺失值进行推断（根据过往会议回顾推断利益相关者立场、根据主题推断首要诉求、根据会议类型推断排名前三的目标）
4. 提供简短的推断摘要，并接受单词 `go` 或修正意见
5. 生成简报

如果使用 `--go` 调用，则跳过推断摘要。如果用户预先提供了所有值，则不会出现检查点。

当未提供利益相关者摘要时，该技能会基于推断出的利益相关者立场运行，并标记低置信度；不会因缺少输入而阻塞。

## 反会议检查

此技能以共享的反会议检查开头。完整检查请参见 [`foundation-meeting-agenda`](../foundation-meeting-agenda/SKILL.md)。

**v1.1.0**：检查要求提供积极的同步价值声明（需要讨论的权衡、需要解决的冲突、共同创作、关系建立或阻塞事项升级）。简报准备场景通常能够通过，因为它们往往涉及应对利益相关者立场或谈判动态，这些都属于“需要解决的冲突”或“关系建立”。但检查仍会运行；如果未指出任何同步价值，技能会在生成简报前建议采用异步替代方案。

**承载关键作用的推断门槛**（v1.1.0）：当利益相关者立场、首要诉求或决策者归属的推断置信度低于高置信度时，在 go 模式摘要中使用 `⚠` 标记。简报的战术指导依赖于这些内容；默默接受薄弱的推断会产生有风险的建议。请参见系列契约中的“零摩擦执行”部分。

## 指令

当被要求创建会议简报时，请遵循以下步骤：

1. **运行反会议检查**
   应用触发模式。如果匹配，则提出异步替代方案并等待用户覆盖。

2. **解析并加载输入**
   阅读主题。加载所有 `@file` 引用。自动发现相关产物：同一主题的既往复盘（相同的 `project`/`topics` frontmatter）、来自 `/discover-stakeholder-summary` 输出的利益相关者摘要、相关项目文档。

3. **推断缺失值**
   应用以下规则：

   | 值 | 推断依据 | 置信度 |
   |-------|---------------|------------|
   | 利益相关者立场 | 既往复盘中的措辞、利益相关者摘要内容 | 如果复盘引用了直接引语，则为高；如果立场出现在 2 个以上来源中，则为中；否则为低 |
   | 每位与会者的利害关系 | 角色加上主题归属线索 | 始终标记为推断 |
   | Top 3 目标 | 用户的主要诉求加上会议类型 | 在 go-mode 中以排序后的试拟方案提供 |
   | 预期问题 | 利益相关者立场分析加上按角色通常会提出的异议 | 标记为推断 |
   | 风险 / 紧张关系 | 既往复盘中的冲突模式 | 如果既往复盘标记了矛盾，则为高 |

4. **呈现 go-mode 推断摘要**
   展示推断出的利益相关者立场、主要诉求、Top 3 目标。接受 `go` 或修正意见。

5. **构建背景部分**
   说明相关历史、过往决策和近期进展。在可用时按文件名交叉引用既往复盘。

6. **逐位分析利益相关者**
   对每位关键与会者说明：对主题的立场、利害关系（他们将获得或失去什么）、可能的担忧、关系状态（牢固 / 中立 / 紧张）、策略性备注（如何与其互动）。

7. **排列期望成果**
   必须达成 / 应该达成 / 最好达成。明确提出取舍要求。

8. **起草关键信息**
   按优先级排列，以便传达。不要写成供人照读的项目符号；要写成你实际会说的话。

9. **预判问题并准备回答**
   使用表格格式：问题 | 准备好的回答。目标是列出用户最可能遇到的三个问题。

10. **识别风险和紧张关系**
    同时明确缓解措施。标记任何可能使会议偏离正轨的事项。

11. **明确请求**
    说明用户需要具体向哪些人提出什么请求。不要写笼统的“取得一致意见”，而要写成“请 alex 在周四前承诺为 Q2 提供工程资源”。

12. **定义成功信号**
    说明用户如何在当下判断会议进展顺利。关注行为线索，而不仅仅是结果指标。

13. **渲染 TEMPLATE.md 并进行验证**
    - 默认使用 `visibility: private`
    - 如果存在利益相关者列表，则至少包含最少字段（姓名、立场）
    - 主要诉求不得为空（如果没有具体诉求，则使用“达成一致”或“收集信息”）

## 项目记忆契约

仅当 `.claude/pm-skills.local.md` 存在时启用。没有该文件时，完全忽略本节，并严格按照上述说明执行。

- **读取：** `active_initiative` 和近期的 `decision` 产物，以便简报能够陈述当前立场，而无需你重新提供。
- **写入：** 不写入任何内容。简报用于准备；复盘才会形成持久记录。
- **操作方式：** 在写入前提出条目并等待确认，除非设置了 `memory_auto_append: true`；在这种情况下追加内容，并回显所写入的内容。

这补充了该系列基于文件名的串联机制，而不是取而代之：文件名仍用于定位同一次会议的同级产物，而项目记忆则在不同会议之间承载持久的产品上下文。

## 质量检查清单

- [ ] 已执行并记录反会议检查
- [ ] 已应用 `visibility: private` 默认值
- [ ] 背景部分在可用时交叉引用此前的会议回顾
- [ ] 每位关键利益相关者都有立场、利益攸关点、担忧和关系状态条目（对推断字段标注置信度）
- [ ] 期望结果已按优先级排序（必须 / 应该 / 锦上添花），而不是平铺罗列
- [ ] 关键信息已按照便于传达而非便于阅读的方式措辞
- [ ] 预期问答表至少包含 3 个条目
- [ ] 请求具体明确（指定人员、具体请求、完成期限）
- [ ] 可分享摘要仅适合供可信顾问审阅（已明确标注）
- [ ] Sources and References 部分包含 Generation context，并标明其中的推断

## 另请参阅

- [会议技能系列契约](../../docs/reference/skill-families/meeting-skills-contract.md)
- [`foundation-meeting-agenda`](../foundation-meeting-agenda/SKILL.md)。共享反会议检查
- [`/discover-stakeholder-summary`](../discover-stakeholder-summary/SKILL.md)。利益相关者立场的上游输入来源