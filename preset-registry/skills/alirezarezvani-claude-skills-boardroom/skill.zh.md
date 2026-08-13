---
name: "boardroom"
description: "/cs:boardroom <brief> — 6-phase multi-role deliberation across the C-suite with Phase 2 isolation, critic pre-screen, and synthesis. Outputs a board memo. Use when a decision spans multiple executive domains — e.g. a pricing change touching finance, positioning, and product, or a raise-vs-cut runway call."
---
# /cs:boardroom — 多角色董事会审议

**命令：** `/cs:boardroom <brief-path>`

针对单个战略简报，在整个高管团队中运行 `board-meeting` 技能协议。这是**插件的核心**——gstack 的审查链只能近似模拟这种多角色审议。

## 流程位置

```
/cs:office-hours  →  /cs:brief  →  /cs:boardroom  →  /cs:decide  →  /cs:execute  →  /cs:post-mortem
                                     ↑ you are here
```

## 六个阶段（来自 board-meeting 技能）

### 阶段 1 — 情况简报
- 幕僚长将简报分发给所有在**受影响角色**中标记的顾问。
- 每位顾问阅读 company-context.md 和简报。
- 此时尚不进行讨论。

### 阶段 2 — 独立思考（隔离）
- **关键：**每位顾问都要在看不到其他人立场的情况下，**独立**提出自己的立场。
- 这可以防止群体迷思，并使异议浮现。
- 每位顾问需要写下：其角色视角下的开场陈述、建议、最重要的 3 项担忧、最有力的 3 项支持理由。

### 阶段 3 — 交叉质询
- 所有立场同时公开。
- 每位顾问从自己负责的维度批评其他人的立场：
  - cs-cfo-advisor 审查计算
  - cs-ciso-advisor 审查风险
  - cs-cpo-advisor 审查 JTBD
  - cs-cmo-advisor 审查市场定位
  - cs-cro-advisor 审查收入测算
  - 以此类推。

### 阶段 4 — 反方论证环节
- `executive-mentor/devils-advocate` 智能体针对领先选项运行 `/em:challenge`。
- 提出三项担忧，并标注严重程度。

### 阶段 5 — 综合研判
- 幕僚长进行综合研判：哪个选项获得多数支持，以及还存在哪些未解决的异议。
- 生成包含建议和异议的**董事会备忘录**。

### 阶段 6 — 决策移交
- 将备忘录提交给创始人。
- 创始人接受、修改或拒绝该备忘录。
- 已批准的备忘录会转交至 `/cs:decide` 进行记录。

## 输出：董事会备忘录

保存至 `~/.claude/boardroom/YYYY-MM-DD-<slug>.md`：

```markdown
# Board Memo: <topic>
**Date:** YYYY-MM-DD
**Brief:** <link to /cs:brief file>
**Status:** AWAITING FOUNDER DECISION | APPROVED | REJECTED

## Question
[One sentence from the brief]

## Recommended Option
**<Option name>** — chosen because <synthesis reasoning>

## Vote Tally
| Advisor | Vote | One-Sentence Reason |
|---|---|---|
| cs-ceo-advisor | A | <reason> |
| cs-cfo-advisor | A | <reason> |
| cs-cto-advisor | B | <reason> |
| ... | | |

## Dissent
- **<dissenter>:** <unresolved concern>

## Devil's Advocate Concerns
1. **CRITICAL** — <concern> — Mitigation: <plan>
2. **HIGH** — <concern> — Mitigation: <plan>
3. **MEDIUM** — <concern> — Mitigation: <plan>

## Success & Kill Criteria
[Copied from brief, refined by the panel]

## Recommended Decision Path
- `/cs:decide` → log the decision
- `/cs:execute` → 90-day plan
- `/cs:cross-eval` → multi-model sanity check (optional, high-stakes)
- `/cs:freeze N` → cooldown lock (optional, irreversible)
```

## 为什么阶段 2 的隔离至关重要

如果顾问在形成自己的立场之前就看到其他人的立场，他们就会受到锚定效应影响。阶段 2 的隔离是 board-meeting 协议中杠杆效应最高的一项实践——它能让那些原本会被谄媚迎合所压制的异议浮现出来。

## 为什么这优于 gstack 的审查链

| | gstack `/autoplan` | `/cs:boardroom` |
|---|---|---|
| 角色 | CEO → 设计 → 工程（3 个） | 最多 10 个高管角色 |
| 顺序 | 依次进行 | 阶段 2 隔离评议，随后同步进行 |
| 异议记录 | 隐式 | 明确的异议列 |
| 对抗性审查 | 无 | 阶段 4 魔鬼代言人 |
| 输出 | 经审查的计划 | 经投票表决的备忘录，包含异议和终止标准 |

## 工作流程

1. 从 `~/.claude/briefs/<file>` 读取简报
2. 确定受影响的角色
3. 独立调用每位 cs-* 顾问（阶段 2）
4. 汇总各方立场
5. 进行交叉质询（阶段 3）
6. 对领先选项运行 `/em:challenge`（阶段 4）
7. 综合形成备忘录（阶段 5）
8. 移交给创始人（阶段 6）

## 路由

- `/cs:decide` — 记录已批准的备忘录
- `/cs:cross-eval` — 针对高风险事项获取第二意见
- `/cs:freeze` — 冷静期锁定

## 相关内容

- 智能体：[`cs-chief-of-staff`](../../agents/cs-chief-of-staff.md)
- 技能：[`board-meeting`](../../../skills/board-meeting/SKILL.md)、[`executive-mentor`](../../../executive-mentor/)

---

**版本：** 1.0.0