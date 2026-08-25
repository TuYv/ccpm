---
name: tool-design-sprint-brief
description: Pre-sprint brief that locks challenge, sprint questions, team and role assignments, customer recruiting plan, prototype medium, interview format, logistics, and success criteria before Monday of a Design Sprint. Use after the readiness verdict is Go and before Monday begins. Produces a two-page artifact the team and Decider sign off on as the contract for the next five days.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: design-sprint
  move: brief
  category: coordination
  frameworks:
    - design-sprint
    - sprint
  timebox_minutes: 75
  roles:
    - facilitator
    - pm
    - decider
    - researcher
  prerequisites:
    - tool-design-sprint-readiness
  inputs:
    - readiness verdict and recommendations
    - challenge description
    - founding hypothesis (optional; from a prior Foundation Sprint)
    - team roster
    - customer recruiting source and plan
    - format (in-person | remote | hybrid; per Ratified Decision 6)
    - logistics constraints
  outputs:
    - challenge statement and why-now
    - sprint questions
    - decider attendance windows
    - team roster with role assignments
    - customer recruiting plan
    - prototype medium decision
    - interview format
    - logistics plan
    - success criteria
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 设计冲刺简报

在周一开始之前，产出一份让团队就挑战、冲刺问题、参与者、客户招募、原型媒介、访谈形式、后勤安排和成功标准达成一致的简报。一份构建完善的简报可以避免周一早上重新争论“我们这周到底要测试什么？”；而缺失或含糊不清的简报几乎必然会导致这种情况。

所属系列契约：[`docs/reference/skill-families/design-sprint-skills-contract.md`](../../docs/reference/skill-families/design-sprint-skills-contract.md)。此技能属于 `design-sprint-skills`。

## 适用时机

- `tool-design-sprint-readiness` 给出的准备就绪结论为 Go（或前置条件已清除的 Conditional Go）。
- 冲刺日期已经锁定在日历上，而你需要一份明确说明本次冲刺目标的产物。
- 团队已经启动客户招募，而你需要在招募结束前确定招募计划、酬金预算和周五安排。
- 一位持怀疑态度的高管想知道“团队要花五天时间做什么，还要付出多少客户成本？”，而你需要一份能控制在两页以内的答案。

## 不适用时机

- 冲刺已经开始。简报是准备阶段的产物，而不是冲刺期间的交付物。如果周一已经开始，请改用 `tool-design-sprint-map-and-target`。
- 准备就绪结论为 Wait。简报无法解决团队尚未准备就绪的问题；先完成前置条件，再重新运行准备度评估，然后调用此技能。
- 团队想要一份利益相关者策略文档。简报是内部准备材料，而不是对外交付物。如果需要利益相关者文档，那属于下游产物（周五评分卡或后续步骤备忘录）。
- 客户招募尚未开始。简报可以锁定招募计划，但不能替代招募人员。如果没有指定招募负责人，请返回准备就绪的 Wait 结论。

## 此技能产出什么

一份包含九个部分的完整产物：

1. **挑战陈述及为何现在**：用一段话说明可测试的挑战，以及为什么本周开展冲刺而不是之后再开展。
2. **冲刺问题**：周五测试需要回答的 2-4 个具体问题。任何此前 Foundation Sprint 中的最高风险假设，都应成为首要问题。
3. **决策者出席时间窗口**：承载关键决策的时段（至少包括周一上午、周三上午和周五下午）；如果可以，应完整锁定这些时段。
4. **团队名单及角色分配**：每天有哪些人参与，以及每个人在这一周中承担什么角色。
5. **客户招募计划**：目标画像、来源、人数、激励、招募负责人、招募截止时间和周五安排。
6. **原型媒介决策**：可点击原型、幻灯片、服务角色扮演、纸质原型、实体模型或其他形式；并说明理由。
7. **访谈形式**：现场或远程；主持式或非主持式；录制与同意的处理方式；观察者房间设置。
8. **后勤计划**：日期、时间、地点、形式（现场、远程、混合）、工具和每日节奏。
9. **成功标准**：用于判断冲刺成功或不成功的可观察结果。

参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解 Brainshelf 图书目录简介。

## 推断输入

| 输入 | 技能如何处理 |
|---|---|
| 准备度结论和建议（来自 `tool-design-sprint-readiness`） | 提取建议的参会者、客户招募计划、冲刺前活动和原型媒介提案；标记尚未完成的前置条件 |
| 挑战描述 | 压缩为挑战陈述，并推导出 2-4 个冲刺问题 |
| 创始假设（可选；来自先前的基础冲刺） | FS 评分卡中风险最高的假设成为主要冲刺问题；首要押注成为设计方向；备选方案成为周五验证无效时的后备决策 |
| 团队名单 | 将人员映射到所需的设计冲刺角色（决策者、引导者、产品经理、设计、工程、研究员或客户专家）；确认团队规模在 4-7 人范围内 |
| 客户招募来源和计划 | 确定招募负责人、目标画像、来源渠道、酬金预算、截止日期和周五安排 |
| 形式（线下、远程、混合；依据已批准决策 6） | 在形式影响撰写的部分进行分支：招募计划（线下要求地理位置相近的群体；远程允许跨时区）、原型媒介（某些媒介更适合线下；例如实体模型）、访谈形式（现场主持或远程主持）、观察者设置（现场房间或 Zoom 分组房间） |
| 后勤约束 | 生成日期/时间/地点/工具矩阵；标记任何会迫使冲刺超过 5 天或跨日历周拆分的约束 |

## 简报长度规范

简报 MUST 控制在两页（或两个屏幕）以内。DS 简报有意比 FS 简报更长，因为客户招募、原型媒介和访谈形式这几个部分在 FS 中没有对应内容，必须在周一之前确定。

- 挑战陈述：一段话，最多四句话。
- 冲刺问题：2-4 个编号问题，每个问题一句话。
- 团队名单：表格，每人一行。
- 客户招募：表格。
- 原型媒介：一段话，包括理由。
- 访谈形式：一段话。
- 后勤：表格。
- 成功标准：3-5 个项目符号列出的结果。

如果简报扩展到两页以上，说明冲刺还没开始就已经被过度设计。解决办法不是写更长的简报，而是让冲刺问题更精准，并更明确地确定原型媒介。

## 常见陷阱

- **冲刺问题含糊。** “用户会喜欢它吗？”不是冲刺问题。“每年阅读 25+ 本书的用户能否在不到 3 秒内完成相机拍摄而不中途放弃？”才是。冲刺问题必须能够通过周五对 5 位客户的访谈得出答案。
- **招募计划与目标客户不匹配。** 如果从一个年龄偏低或人口特征不同于指定目标客户的样本库中招募，周五获得的数据就无法检验真正的假设。将招募来源与准备度评估中的客户画像进行交叉核对。
- **跳过原型媒介决策。** 将原型媒介留到周四早上，会迫使团队临时做选择，并带来原型无法在周五进行测试的风险。将其锁定在简报中；如有需要，可在周三故事板完成后进行更改，但要预先确定一个默认方案。
- **把简报当作利益相关者交付物。** 利益相关者阅读的是周五评分卡和决策者的后续步骤备忘录，而不是简报。公开分享简报会引发冲刺前争论，而冲刺本来就是为了解决这些争论。
- **后勤安排漂移。** “我们有时会再决定远程还是线下”表明团队尚未做出承诺。要么锁定一种形式，要么说明准备度结论是错误的。
- **没有确定访谈形式。** 周五的访谈主持人、观察室设置以及录音/同意安排都应该写入简报。忘记这些事项是周五超时最常见的原因。

## 权威来源

- Knapp, J., Zeratsky, J., and Kowitz, B. *Sprint: 如何在短短五天内解决重大问题并测试新想法*. Simon and Schuster, 2016. 第 3 章“设定阶段”，介绍冲刺简报的构成。
- Character Capital。“设计冲刺前期指南。” https://www.character.vc
- Google Design Sprint Kit。“冲刺简报模板。” https://designsprintkit.withgoogle.com/
- AJ and Smart“远程设计冲刺”模板。针对远程和混合形式部分进行了改编。

## 跨技能使用

前置条件：`tool-design-sprint-readiness`。该简报将 readiness 输出作为其主要输入。在遵循 `prerequisites` 时，简报会继承 readiness 的结论、客户招募计划草案、参与者建议和冲刺前活动；随后该技能会对它们进行细化和锁定。

如果团队在未明确运行 readiness skill 的情况下完成了等效准备工作（例如，熟悉冲刺流程且了解 readiness 标准的冲刺引导者），则可以直接调用 brief skill。在这种情况下，技能正文会提示团队在生成简报之前确认已满足 readiness 标准。

从 Foundation Sprint 过来的团队应将 Founding Hypothesis 和假设评分卡作为输入。简报的 Sprint Questions 部分会逐字提取风险最高的假设，作为首要问题。无需桥接技能；相关叙事交接记录在 `_workflows/foundation-to-design.md` 中。

冲刺中的下一次调用：周一上午调用 `tool-design-sprint-map-and-target`。

## 决策者检查点

该技能以 `references/TEMPLATE.md` 中的 Decider Checkpoint 结束。Decider 将对范围（挑战和冲刺问题）、团队（成员名单和出席时间窗口）、招募计划（目标画像、来源、酬金预算）、原型媒介、访谈形式以及明确的成功标准进行签字确认。没有签字确认时，简报仅供参考；完成签字确认后，它就是接下来五天的契约，也是客户招募支出的授权。