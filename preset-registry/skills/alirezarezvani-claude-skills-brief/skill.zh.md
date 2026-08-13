---
name: "brief"
description: "/cs:brief <topic> — Generate a one-page strategy brief from an office-hours intake. First step in the strategic sprint pipeline. Use when a strategic question needs to be framed before boardroom deliberation — e.g. locking options, assumptions, and success criteria for a pricing change or a market-entry decision."
---
# /cs:brief — 单页战略简报

**命令：** `/cs:brief <topic>` 或 `/cs:brief <office-hours-output>`

将信息采集结果（原始问题或办公时间输出）转化为一份可供董事会审议的单页战略简报。这是战略冲刺流程的**第 1 步**。

## 流程位置

```
/cs:office-hours  →  /cs:brief  →  /cs:boardroom  →  /cs:decide  →  /cs:execute  →  /cs:post-mortem
                       ↑ you are here
```

## 输入

- 一个主题字符串，**或**
- 一份办公时间简报（首选——更严谨）
- `~/.claude/company-context.md`（自动加载）

## 输出

在 `~/.claude/briefs/YYYY-MM-DD-<slug>.md` 下生成一个 Markdown 文件，结构如下：

```markdown
# Strategy Brief: <topic>
**Date:** YYYY-MM-DD
**Author:** cs-chief-of-staff
**Status:** DRAFT | UNDER REVIEW | APPROVED | RETIRED

## Context
[1-2 paragraphs: where the company sits today on this topic — pulled from company-context.md]

## Question
[The one sentence question the boardroom must answer]

## Options
1. **Option A:** <name> — <one-sentence summary>
2. **Option B:** <name> — <one-sentence summary>
3. **Option C:** <name> — <one-sentence summary>

(Minimum 2 options. "Do nothing" is always an option.)

## Assumptions
- <assumption 1 — explicit>
- <assumption 2>
- <assumption 3>

## Constraints
- Time: <by when must this decide>
- Money: <budget envelope>
- People: <who can / can't be reallocated>
- Reversibility: <one-way door | two-way door>

## Affected Roles
[Which cs-* advisors should weigh in. Used to route to /cs:boardroom panel composition.]

- [ ] cs-ceo-advisor
- [ ] cs-cfo-advisor
- [ ] cs-cto-advisor
- [ ] cs-cmo-advisor
- [ ] cs-cro-advisor
- [ ] cs-cpo-advisor
- [ ] cs-coo-advisor
- [ ] cs-chro-advisor
- [ ] cs-ciso-advisor
- [ ] cs-general-counsel-advisor
- [ ] cs-cdo-advisor
- [ ] cs-caio-advisor
- [ ] cs-cco-advisor
- [ ] cs-vpe-advisor
- [ ] cs-chief-of-staff

## Success Criteria
[Measurable outcomes that define success — set BEFORE the decision]
- <metric 1, threshold, timeframe>
- <metric 2, threshold, timeframe>

## Kill Criteria
[What signal would tell you in 90 days that this was the wrong call]
- <metric, threshold, action if missed>
```

## 工作流程

1. 通过 context-engine 加载 company-context.md
2. 如果输入是办公时间输出，则解析 6 个回答
3. 如果输入是原始主题，则向创始人询问缺失的信息
4. 起草 2–3 个选项（绝不能只有一个——每份简报都需要一个反事实选项）
5. 明确列出假设和约束条件
6. 确定受影响的角色 → 用于决定 `/cs:boardroom` 的评审小组构成
7. 在决策**之前**编写成功标准和终止标准（这是体现严谨性的关键时刻）
8. 保存到 `~/.claude/briefs/`

## 此步骤存在的原因

决策过程中最大的失败，是在尚未就问题达成一致之前便开始讨论实施方案。简报会锁定问题、选项和成功标准，使董事会能够在不发生范围蔓延的情况下进行审议。

这也是**制品交接**环节——下一个命令使用的是此文件，而不是你的记忆。

## 路由

- `/cs:boardroom <brief>` — 多角色审议
- `/cs:cross-eval <brief>` — 董事会审议前的多模型合理性检查（适用于高风险事项）
- `/cs:freeze <brief>` — 针对不可逆决策的冷静期锁定

## 相关内容

- 智能体：[`cs-chief-of-staff`](../../agents/cs-chief-of-staff.md)
- 技能：[`context-engine`](../../../skills/context-engine/SKILL.md)、[`board-meeting`](../../../skills/board-meeting/SKILL.md)

---

**版本：** 1.0.0