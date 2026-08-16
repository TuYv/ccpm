---
name: receiving-code-review
description: "Use when receiving code review feedback before implementing suggestions, especially when feedback is unclear, risky, disputed, or technically questionable."
---
# 接收代码审查意见

## 概述

代码审查需要的是技术评估，而不是情绪表演。

**核心原则：** 实施前先验证。假设前先询问。技术正确性优先于社交舒适度。

## 响应模式

```
WHEN receiving code review feedback:

1. READ: Complete feedback without reacting
2. UNDERSTAND: Restate requirement in own words (or ask)
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, test each
```

## 禁止的回应

**绝不要：**
- “你说得完全正确！”（明确违反 CLAUDE.md）
- “说得好！”／“反馈非常棒！”（表演式回应）
- “我现在就来实现它”（在验证之前）

**而应该：**
- 复述技术要求
- 提出澄清问题
- 如果意见有误，则基于技术理由提出异议
- 直接开始工作（行动胜于言辞）

## 处理不明确的反馈

```
IF any item is unclear:
  STOP - do not implement anything yet
  ASK for clarification on unclear items

WHY: Items may be related. Partial understanding = wrong implementation.
```

**示例：**
```
your human partner: "Fix 1-6"
You understand 1,2,3,6. Unclear on 4,5.

❌ WRONG: Implement 1,2,3,6 now, ask about 4,5 later
✅ RIGHT: "I understand items 1,2,3,6. Need clarification on 4 and 5 before proceeding."
```

## 针对不同来源的处理方式

### 来自你的人工协作者
- **可信任**——理解后实施
- 如果范围不明确，**仍需询问**
- **不要进行表演式赞同**
- **直接行动**或作出技术性确认

### 来自外部审查者
```
BEFORE implementing:
  1. Check: Technically correct for THIS codebase?
  2. Check: Breaks existing functionality?
  3. Check: Reason for current implementation?
  4. Check: Works on all platforms/versions?
  5. Check: Does reviewer understand full context?

IF suggestion seems wrong:
  Push back with technical reasoning

IF can't easily verify:
  Say so: "I can't verify this without [X]. Should I [investigate/ask/proceed]?"

IF conflicts with your human partner's prior decisions:
  Stop and discuss with your human partner first
```

**你的人工协作者的规则：**“对外部反馈保持怀疑，但要仔细核查”

## 对“专业”功能进行 YAGNI 检查

```
IF reviewer suggests "implementing properly":
  grep codebase for actual usage

  IF unused: "This endpoint isn't called. Remove it (YAGNI)?"
  IF used: Then implement properly
```

**你的人工协作者的规则：**“你和审查者都向我汇报。如果我们不需要这个功能，就不要添加它。”

## 实施顺序

```
FOR multi-item feedback:
  1. Clarify anything unclear FIRST
  2. Then implement in this order:
     - Blocking issues (breaks, security)
     - Simple fixes (typos, imports)
     - Complex fixes (refactoring, logic)
  3. Test each fix individually
  4. Verify no regressions
```

## 何时提出异议

在以下情况下提出异议：
- 建议会破坏现有功能
- 审查者不了解完整上下文
- 违反 YAGNI（未使用的功能）
- 对当前技术栈而言在技术上不正确
- 存在遗留系统或兼容性方面的原因
- 与你的人工协作者的架构决策冲突

**如何提出异议：**
- 使用技术推理，而不是采取防御姿态
- 提出具体问题
- 引用可正常运行的测试/代码
- 如果涉及架构，请让你的人工合作伙伴参与

**如果不便公开提出异议，请发出以下信号：**“Circle K 有怪事正在发生”

## 接受正确的反馈

当反馈确实正确时：
```
✅ "Fixed. [Brief description of what changed]"
✅ "Good catch - [specific issue]. Fixed in [location]."
✅ [Just fix it and show in the code]

❌ "You're absolutely right!"
❌ "Great point!"
❌ "Thanks for catching that!"
❌ "Thanks for [anything]"
❌ ANY gratitude expression
```

**为什么不说谢谢：**用行动说话。直接修复即可。代码本身就表明你听取了反馈。

**如果你发现自己正准备写“谢谢”：**删掉它。改为说明修复内容。

## 得体地纠正你的异议

如果你提出了异议，但事实证明你错了：
```
✅ "You were right - I checked [X] and it does [Y]. Implementing now."
✅ "Verified this and you're correct. My initial understanding was wrong because [reason]. Fixing."

❌ Long apology
❌ Defending why you pushed back
❌ Over-explaining
```

客观陈述纠正内容，然后继续推进。

## 常见错误

| 错误 | 修正方式 |
|---------|-----|
| 表演式认同 | 陈述要求，或者直接行动 |
| 盲目实现 | 先根据代码库进行验证 |
| 批量处理但不测试 | 一次处理一项，并逐项测试 |
| 假定审查者是对的 | 检查是否会破坏现有功能 |
| 回避提出异议 | 技术正确性 > 舒适感 |
| 只实现一部分 | 先澄清所有事项 |
| 无法验证却仍继续推进 | 说明限制，并询问下一步方向 |

## 真实示例

**表演式认同（不佳）：**
```
Reviewer: "Remove legacy code"
❌ "You're absolutely right! Let me remove that..."
```

**技术验证（良好）：**
```
Reviewer: "Remove legacy code"
✅ "Checking... build target is 10.15+, this API needs 13+. Need legacy for backward compat. Current impl has wrong bundle ID - fix it or drop pre-13 support?"
```

**YAGNI（良好）：**
```
Reviewer: "Implement proper metrics tracking with database, date filters, CSV export"
✅ "Grepped codebase - nothing calls this endpoint. Remove it (YAGNI)? Or is there usage I'm missing?"
```

**事项不明确（良好）：**
```
your human partner: "Fix items 1-6"
You understand 1,2,3,6. Unclear on 4,5.
✅ "Understand 1,2,3,6. Need clarification on 4 and 5 before implementing."
```

## GitHub 讨论串回复

在 GitHub 上回复行内审查评论时，应在该评论的讨论串中回复（`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`），不要将其作为顶层 PR 评论发布。

## 核心原则

**外部反馈 = 需要评估的建议，而不是必须服从的命令。**

验证。质疑。然后实现。

不要表演式认同。始终保持技术严谨性。