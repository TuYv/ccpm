---
name: "boardroom"
description: "/cs:boardroom <brief> — 6-phase multi-role deliberation across the C-suite with Phase 2 isolation, critic pre-screen, and synthesis. Outputs a board memo. Use when a decision spans multiple executive domains — e.g. a pricing change touching finance, positioning, and product, or a raise-vs-cut runway call."
---
# /cs:boardroom — 多角色董事会审议

**命令：** `/cs:boardroom <brief-path>`

针对单份战略简报，在整个高管团队中运行 `board-meeting` 技能协议。这是**插件的核心**——多角色审议，而 gstack 的审查链只能近似实现这一点。

## 流程位置

```
/cs:office-hours  →  /cs:brief  →  /cs:boardroom  →  /cs:decide  →  /cs:execute  →  /cs:post-mortem
                                     ↑ 你现在所在的位置
```

## 6 个阶段（来自 board-meeting 技能）

### 阶段 1 — 简报
- Chief of Staff 将简报分发给 **Affected Roles** 中标记的所有顾问。
- 每位顾问阅读 company-context.md 和简报。
- 暂不进行讨论。

### 阶段 2 — 独立思考（隔离）
- **关键：**每位顾问都必须**独立**形成自己的立场，不能看到其他人的立场。
- 这可以避免群体思维，并暴露异议。
- 每位顾问都要撰写：以其角色口吻进行的开场陈述、建议、最重要的 3 项担忧、最重要的 3 项支持理由。

### 阶段 3 — 交叉质询
- 同时公开所有立场。
- 每位顾问根据自己负责的维度，对其他人的立场进行批评：
  - cs-cfo-advisor 质疑数学计算
  - cs-ciso-advisor 质疑风险
  - cs-cpo-advisor 质疑 JTBD
  - cs-cmo-advisor 质疑定位
  - cs-cro-advisor 质疑收入计算
  - 等等。

### 阶段 4 — 反方论证环节
- `executive-mentor/devils-advocate` agent 针对领先选项运行 `/em:challenge`。
- 提出三项担忧，并标注严重程度。

### 阶段 5 — 综合
- Chief of Staff 进行综合：哪个选项获得多数支持，以及尚未解决的异议是什么。
- 生成包含建议和异议的**董事会备忘录**。

### 阶段 6 — 决策交接
- 将备忘录提交给创始人。
- 创始人接受、修改或拒绝。
- 获批准的备忘录将转交 `/cs:decide` 进行记录。

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

## 为什么阶段 2 的隔离很重要

如果顾问在形成自己的立场之前就看到彼此的立场，他们就会受到先入立场的影响。阶段 2 的隔离是董事会会议协议中杠杆作用最高的做法——它能暴露那些原本会被迎合行为压制的异议。

## 为什么这胜过 gstack 的审查链

| | gstack `/autoplan` | `/cs:boardroom` |
|---|---|---|
| 角色 | CEO → 设计 → 工程（3 个） | 最多 10 个 C 级角色 |
| 顺序 | 顺序执行 | 第 2 阶段隔离，然后同时进行 |
| 异议记录 | 隐式 | 明确的异议列 |
| 对抗性审查 | 无 | 第 4 阶段的魔鬼代言人 |
| 输出 | 经审查的计划 | 包含异议和终止标准的投票备忘录 |

## 工作流

1. 从 `~/.claude/briefs/<file>` 读取简报
2. 确定受影响的角色
3. 独立调用每位 cs-* 顾问（第 2 阶段）
4. 汇总各方立场
5. 运行交叉质询环节（第 3 阶段）
6. 对领先选项运行 `/em:challenge`（第 4 阶段）
7. 综合备忘录（第 5 阶段）
8. 移交给创始人（第 6 阶段）

## 路由

- `/cs:decide` — 记录已批准的备忘录
- `/cs:cross-eval` — 高风险事项的第二意见
- `/cs:freeze` — 冷静期锁定

## 相关内容

- 代理：[`cs-chief-of-staff`](../../agents/cs-chief-of-staff.md)
- 技能：[`board-meeting`](../../../c-level-advisor/skills/board-meeting/SKILL.md)、[`executive-mentor`](../../../c-level-advisor/executive-mentor/)

---

**版本：** 1.0.0。