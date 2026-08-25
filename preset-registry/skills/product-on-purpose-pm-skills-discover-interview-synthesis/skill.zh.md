---
name: discover-interview-synthesis
description: Synthesizes user research interviews into actionable insights, patterns, and recommendations. Use after conducting user interviews, customer calls, or usability sessions to extract and communicate findings across participants. Distinct from foundation-meeting-recap, which summarizes one internal meeting for its attendees; this skill aggregates research conversations into evidence-backed findings.
license: Apache-2.0
metadata:
  phase: discover
  version: "2.3.0"
  updated: 2026-07-05
  category: research
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 访谈综合

访谈综合将原始用户研究数据转化为结构化洞察，从而推动产品决策。优秀的综合并非只是简单罗列参与者说了什么，而是要识别不同访谈之间的模式，将观察结果与潜在的用户需求联系起来，并将研究发现转化为可执行的建议。

## 适用场景

- 完成一轮用户访谈后（通常为 5 名以上参与者）
- 客户探索电话或销售反馈会议之后
- 可用性测试结束后，用于汇总观察结果
- 利益相关者需要研究发现摘要时
- 创意构思会议之前，帮助团队立足于真实的用户情况

## 不适用场景

- 你要为会议参与者总结一次内部会议 -> 使用 `foundation-meeting-recap`
- 你需要分析一段时间内多次会议之间的模式 -> 使用 `foundation-meeting-synthesize`
- 你的数据是调查问卷回复，而不是访谈 -> 使用 `measure-survey-analysis`
- 研究发现已经完成综合，你准备开始界定问题 -> 使用 `define-problem-statement`
- 你已经综合了研究发现，并希望将其映射到客户跨越不同阶段和触点的旅程中 -> 使用 `discover-journey-map`

## 说明

当被要求综合访谈发现时，请遵循以下步骤：

1. **收集原始材料**
   收集所有访谈笔记、文字记录或录音。确保你至少拥有 3 名参与者的数据，以便识别有意义的模式。记录研究目标和所采用的方法。

2. **创建参与者档案**
   记录每位参与者的相关背景：其角色、细分群体、任职时长以及任何值得注意的特征。这有助于读者评估研究发现的代表性。

3. **识别反复出现的主题**
   通读所有笔记，并按主题为观察结果添加标签。寻找在多名参与者之间出现的主题（理想情况下为 3 名以上）。区分经常被提及的主题与偶发评论。

4. **提取有意义的引述**
   每个主题记录 3-5 条能够有力说明洞察的逐字引述。优秀的引述应当具体、富有情感或表达得特别清晰。始终将引述归因到参与者 ID。

5. **综合为洞察**
   将主题转化为洞察陈述。洞察应超越观察结果（“用户提到了 X”），进一步解释其含义（“用户因为 Z 而需要 Y”）。将你听到的内容与其重要性联系起来。

6. **制定建议**
   根据洞察提出经过优先级排序的行动建议。每条建议都应直接对应一条洞察。根据证据的强度注明置信度等级。

7. **记录局限性**
   说明你未了解到的内容、样本偏差或需要进一步研究的领域。坦诚地说明局限性有助于提升可信度。

## 项目记忆约定

仅当 `.claude/pm-skills.local.md` 存在时才启用。没有该文件时，完全忽略本节，
并严格按照上述说明执行。

- **读取：**`phase` 和 `active_initiative`，因此研究发现会围绕当前进行中的 initiative 展开，而不是要求你重新陈述它。
- **写入：**将人物角色和研究发现作为 `interpretation` artifact 写入，以便后续 skill 无需你再次粘贴即可使用它们。
- **操作方式：**先提出写入内容并等待确认，然后再执行写入；但如果设置了
  `memory_auto_append: true`，则追加写入并回显所写入的内容。
- **写入规范：**在写入前立即重新读取文件，绝不能使用生成提议时所读取的副本。如果文件在此期间发生变化，应将你的条目合并到当前状态中，并重新提出写入，而不是覆盖文件；只添加你自己的条目，并让其他所有字段和段落保持逐字节一致。运行时没有任何机制强制执行这一点，而且该文件被 gitignore，因此粗心地写入整个文件会丢失另一个会话的工作，且无法恢复。

这是 cohort 存在的目的所要展示的循环中的写入端：此 skill 记录的内容，`deliver-prd` 稍后会读取。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的综合结果应填充模板中的每个部分：研究概览；关键主题；重要引语；洞察；建议；以及附录。

## 质量检查清单

完成前，请确认：

- [ ] 主题有来自 3 名或以上参与者的证据支持
- [ ] 引语为逐字引用，并注明参与者 ID
- [ ] 洞察解释了“为什么”，而不仅仅是“是什么”
- [ ] 建议具体且可执行
- [ ] 参与者身份受到保护（不包含 PII）
- [ ] 已说明局限性和偏差

## 示例

参见 `references/EXAMPLE.md` 查看完整示例。