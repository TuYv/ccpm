---
name: "brief"
description: "/cs:brief <topic> — Generate a one-page strategy brief from an office-hours intake. First step in the strategic sprint pipeline. Use when a strategic question needs to be framed before boardroom deliberation — e.g. locking options, assumptions, and success criteria for a pricing change or a market-entry decision."
---
# /cs:brief — 一页式战略简报

**命令：** `/cs:brief <topic>` 或 `/cs:brief <office-hours-output>`

将输入内容（原始问题或 office-hours 输出）转化为一页式战略简报，供董事会讨论决策。这是战略冲刺流程的**第 1 步**。

## 流程位置

```
/cs:office-hours  →  /cs:brief  →  /cs:boardroom  →  /cs:decide  →  /cs:execute  →  /cs:post-mortem
                       ↑ you are here
```

## 输入

- 一个主题字符串，**或**
- 一份 office-hours 简报（推荐 — 更加严谨）
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
2. 如果输入是 office-hours 输出，解析其中的 6 个回答
3. 如果输入是原始主题，提示创始人补充缺失信息
4. 起草 2-3 个选项（绝不能只有一个 — 每份简报都需要一个反事实选项）
5. 明确列出假设和约束
6. 识别受影响的角色 → 决定 `/cs:boardroom` 的讨论小组构成
7. 在决策**之前**写明成功标准和终止标准（这是严谨性的关键时刻）
8. 保存到 `~/.claude/briefs/`

## 为什么需要这一步

决策失败最常见的原因，是在尚未就问题达成一致之前就开始讨论实施方案。这份简报会锁定问题、选项和成功标准，让董事会能够在不发生范围蔓延的情况下进行讨论决策。

这同时也是**成果交接环节**——下一条命令读取的是这个文件，而不是你的记忆。

## 路由

- `/cs:boardroom <brief>` — 多角色审议
- `/cs:cross-eval <brief>` — 董事会会议前的多模型合理性检查（适用于高风险事项）
- `/cs:freeze <brief>` — 不可逆决策的冷却锁定

## 相关内容

- Agent：[`cs-chief-of-staff`](../../agents/cs-chief-of-staff.md)
- Skills：[`context-engine`](../../../c-level-advisor/skills/context-engine/SKILL.md)、[`board-meeting`](../../../c-level-advisor/skills/board-meeting/SKILL.md)

---

**版本：** 1.0.0