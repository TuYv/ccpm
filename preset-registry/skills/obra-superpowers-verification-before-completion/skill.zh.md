---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
---
# 完成前的验证

## 概览

**核心原则：** 先有证据，再作断言，始终如此。

**违反该规则的文字规定，也就违反了该规则的精神。**

## 铁律

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

如果你没有在本消息中运行验证命令，就不能声称其通过。

## 门禁函数

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

## 常见失败

| 声明 | 需要 | 不足 |
|-------|----------|----------------|
| 测试通过 | 测试命令输出：0 个失败 | 上次运行，“应该通过” |
| Linter 干净 | Linter 输出：0 个错误 | 部分检查，外推 |
| 构建成功 | 构建命令：退出码 0 | Linter 通过，日志看起来很正常 |
| Bug 修复 | 原始问题测试通过 | 改了代码，就认为修复 |
| 回归测试有效 | 红绿循环已验证 | 测试只通过一次 |
| Agent 完成 | VCS diff 显示有变更 | Agent 报告“成功” |
| 需求满足 | 逐行核对清单 | 测试通过 |

## 红旗警报 - 停止

- 使用“should”、“probably”、“seems to”
- 在验证前表达满意（“Great!”、“Perfect!”、“Done!”等）
- 在未验证前准备提交/推送/发起 PR
- 盲目信任 agent 成功报告
- 依赖部分验证
- 以为“就这一次”
- 疲惫并想快速结束工作
- **任何暗示成功但未进行验证的表述**

## 合理化预防

| 借口 | 现实 |
|--------|---------|
| “现在应该可以用了” | 运行验证 |
| “我有信心” | 信心 ≠ 证据 |
| “就这一次” | 没有例外 |
| “Linter passed” | Linter 不等于 compiler |
| “Agent 说成功” | 独立验证 |
| “我很累了” | 疲惫不是借口 |
| “部分检查就足够了” | 部分检查无法证明 |
| “说法不同所以规则不适用” | 精神重于字面 |

## 关键模式

**测试：**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**回归测试（TDD 红绿）:**
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

## 适用时机

**始终在以下情形之前：**
- 成功/完成表述的任何变体
- 满意表达的任何形式
- 关于工作状态的任何积极表述
- 提交、创建 PR、任务完成
- 进入下一项任务
- 委派给其他 agent

**规则适用于：**
- 完整短语
- 改写和同义替换
- 成功的含蓄表达
- 任何暗示完成/正确的沟通
