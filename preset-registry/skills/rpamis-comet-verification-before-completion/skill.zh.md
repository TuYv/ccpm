---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
---
# 完成前的验证

## 概述

在未验证的情况下声称工作已完成，是不诚实，而不是效率。

**核心原则：** 先有证据，再做声明，永远如此。

**违反这条规则的字面，就是在违反这条规则的精神。**

## 铁律

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

如果你在这条消息中没有运行过验证命令，你就不能声称它通过了。

## 门控函数

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## 常见失败情形

| 声明 | 所需证据 | 不算充分的证据 |
|-------|----------|----------------|
| 测试通过 | 测试命令输出：0 个失败 | 之前的运行结果、“应该会通过” |
| Linter 无报错 | Linter 输出：0 个错误 | 部分检查、主观推断 |
| 构建成功 | 构建命令：退出码 0 | Linter 通过、日志看起来正常 |
| 缺陷已修复 | 对原始症状的测试：通过 | 改了代码、想当然认为已修复 |
| 回归测试有效 | 红-绿循环已验证 | 测试只通过了一次 |
| Agent 已完成 | VCS diff 显示有变更 | Agent 报告“成功” |
| 需求已满足 | 逐条核对的检查清单 | 测试通过 |

## 危险信号 - 立即停止

- 使用“应该”、“大概”、“看起来”
- 在验证之前表达满足感（“太好了！”、“完美！”、“搞定！”等）
- 未验证就准备 commit/push/PR
- 信任 agent 的成功报告
- 依赖部分验证
- 心想“就这一次”
- 疲惫不堪、只想赶紧把工作结束掉
- **任何在未运行验证的情况下暗示成功的措辞**

## 防止自我合理化

| 借口 | 现实 |
|--------|---------|
| “现在应该可以了” | 去运行验证 |
| “我很有信心” | 信心 ≠ 证据 |
| “就这一次” | 没有例外 |
| “Linter 通过了” | Linter ≠ 编译器 |
| “Agent 说成功了” | 独立验证 |
| “我累了” | 疲惫 ≠ 借口 |
| “部分检查就够了” | 部分检查证明不了任何东西 |
| “换了措辞，规则就不适用了” | 精神高于字面 |

## 关键模式

**测试：**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**回归测试（TDD 红-绿）：**
```
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

**构建：**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**需求：**
```
✅ Re-read plan → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, phase complete"
```

**Agent 委派：**
```
✅ Agent reports success → Check VCS diff → Verify changes → Report actual state
❌ Trust agent report
```

## 为什么这很重要

来自 24 条失败记忆：
- 你的人类搭档说过“我不相信你”——信任已经破裂
- 交付了未定义的函数——会导致崩溃
- 交付时遗漏了需求——功能不完整
- 时间浪费在虚假的完成声明上 → 转向 → 返工
- 违反了：“诚实是核心价值观。如果你撒谎，你就会被替换。”

## 何时应用

**始终在以下操作之前：**
- 任何形式的成功/完成声明
- 任何满足感的表达
- 任何对工作状态的正面陈述
- 提交 commit、创建 PR、宣布任务完成
- 进入下一个任务
- 委派给 agent

**规则适用于：**
- 字面完全一致的措辞
- 改述和同义表达
- 对成功的暗示
- 任何暗示完成/正确的沟通

## 底线

**验证没有捷径。**

运行命令。阅读输出。然后再宣布结果。

这一点没有商量余地。
