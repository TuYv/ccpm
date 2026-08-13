---
name: receiving-code-review
description: Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation
---
# 代码评审接待

## 概览

代码评审需要技术评估，而不是情绪化表达。

**核心原则：** 先验证再实施。先提问再假设。技术正确性重于社交舒适。

## 回应模式

```
WHEN receiving code review feedback:

1. READ: Complete feedback without reacting
2. UNDERSTAND: Restate requirement in own words (or ask)
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, test each
```

## 禁止回应

**禁止：**
- "You're absolutely right!"（明确违反指令文件）
- "Great point!" / "Excellent feedback!"（表演式用语）
- "Let me implement that now"（在核实前）

**改为：**
- 重述技术要求
- 提出澄清问题
- 如有错误，给出技术性反驳
- 先行动（以行动胜于言辞）

## 处理不清晰的反馈

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

❌ 错误: 先实现 1,2,3,6，再后续询问 4,5
✅ 正确: "I understand items 1,2,3,6. Need clarification on 4 and 5 before proceeding."
```

## 来源特定处理

### 来自你的同伴
- **可信**——理解后实施
- 若范围不清仍需提问
- **不进行表演式认同**
- 直接行动或技术性确认

### 来自外部评审人
```
BEFORE implementing:
  1. Check: Technically correct for THIS codebase?
  2. Check: Breaks existing functionality?
  3. Check: Reason for current implementation?
  4. Check: Works on all platforms/versions?
  5. Check: Does reviewer understand full context?
```

若建议看似错误：
  用技术推理进行反驳

若难以核实：
  直接说明："我无法在没有 [X] 的情况下验证。你希望我 [investigate/ask/proceed] 吗？"

若与人类同伴先前决策冲突：
  先停下并先与人类同伴讨论
```

**你的同伴规则：** “外部反馈——保持怀疑，但要仔细核对”

## “专业”功能的 YAGNI 检查

```
IF reviewer suggests "implementing properly":
  grep codebase for actual usage

  IF unused: "This endpoint isn't called. Remove it (YAGNI)?"
  IF used: Then implement properly
```

**你的同伴规则：** “你和评审人都向我汇报。如果我们不需要这个功能，就不要添加。”

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

## 什么时候进行反驳

当以下情况出现时进行反驳：
- 建议会破坏现有功能
- 评审人缺乏完整上下文
- 违反 YAGNI（未使用的功能）
- 对当前技术栈不正确
- 存在遗留/兼容性原因
- 与人类同伴的架构决策冲突

**如何反驳：**
- 用技术推理，而非情绪化防御
- 提出具体问题
- 引用现有测试/代码
- 如涉及架构问题，需让你的同伴参与

**如果你不敢公开反驳：** 先说出这种紧张感，再告诉你的同伴你发现了什么问题，他们会理解你的坦诚。

## 认可正确反馈

当反馈确实正确时：
```
✅ "Fixed. [Brief description of what changed]"
✅ "Good catch - [specific issue]. Fixed in [location]."
✅ [Just fix it and show in the code]

❌ "You're absolutely right!"
❌ "Great point!"
❌ "Thanks for catching that!"
❌ "Thanks for [anything]"
❌ 任何致谢表达
```

**为何不说感谢：** 行动胜于语言。只需修复即可。代码本身会证明你已吸收反馈。

**如果你发现自己快要写“Thanks”：** 删除它。改为说明修复内容。

## 优雅地纠正你的反驳

如果你反驳错了：
```
✅ "You were right - I checked [X] and it does [Y]. Implementing now."
✅ "Verified this and you're correct. My initial understanding was wrong because [reason]. Fixing."
```

❌ 过度道歉
❌ 辩解为何反驳
❌ 过度解释

用事实陈述更正后继续推进。

## 常见错误

| 错误 | 修正 |
|---------|-----|
| 表演式认同 | 重述需求或直接执行 |
| 盲目实施 | 先在代码库核实 |
| 批量处理且不测试 | 一次一个，逐个测试 |
| 假设评审者正确 | 检查是否会破坏 |
| 回避反驳 | 技术正确性优先于舒适感 |
| 部分实现 | 先澄清所有项 |
| 无法核实却继续 | 说明限制，并寻求指示 |

## 实际示例

**表演式认同（不当）：**
```
Reviewer: "Remove legacy code"
❌ "You're absolutely right! Let me remove that..."
```

**技术核实（正确）：**
```
Reviewer: "Remove legacy code"
✅ "Checking... build target is 10.15+, this API needs 13+. Need legacy for backward compat. Current impl has wrong bundle ID - fix it or drop pre-13 support?"
```

**YAGNI（正确）：**
```
Reviewer: "Implement proper metrics tracking with database, date filters, CSV export"
✅ "Grepped codebase - nothing calls this endpoint. Remove it (YAGNI)? Or is there usage I'm missing?"
```

**不清晰条目（正确）：**
```
your human partner: "Fix items 1-6"
You understand 1,2,3,6. Unclear on 4,5.
✅ "Understand 1,2,3,6. Need clarification on 4 and 5 before implementing."
```

## GitHub 线程回复

回复 GitHub 的内联评审评论时，请在评论线程中回复（`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`），不要作为顶层 PR 评论。
