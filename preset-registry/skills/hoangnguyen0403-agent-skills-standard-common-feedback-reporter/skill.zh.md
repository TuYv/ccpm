---
name: common-feedback-reporter
description: "Pre-write audit for skill violations: checks planned code against loaded skill anti-patterns before any file write. Use when writing Flutter/Dart/TS code or editing SKILL.md files with active project skills. Load as composite; on auto-fixed violation, also load +common/common-learning-log."
metadata:
  triggers:
    files:
      - "SKILL.md"
      - "**/*.dart"
      - "**/*.ts"
      - "**/*.tsx"
      - "+common/common-learning-log"
    keywords:
      - skill violation
      - pre-write audit
      - audit violations
---
# 反馈报告器

## **优先级：P0（严重）** — 在写入文件前自动检测技能违规。

## 强制执行约定

对于任何编写代码或编辑 `SKILL.md` 的请求，将所请求的更改视为计划写入。在展示代码之前，执行此审计；如果违反了已加载的技能规则，则输出完整的违规信息块。该信息块必须包含以下原样标签：`SKILL VIOLATION DETECTED`、`Auto-fixed`、`Root Cause`、`User Intent` 和 `Skill Gap`。然后应用修复并展示修正后的结果。不要静默生成违规实现，也不要用摘要替代所要求的信息块。

对以下情况应用相同的约定：

- 如果 `SKILL.md` 草稿超过 100 行限制，报告 `100` 行违规，将大型示例移至 `references/`，并在重写前包含 `Root Cause`、`User Intent` 和 `Skill Gap`。
- 如果技能推荐了已过时的框架路径或 API，报告 `OUTDATED_GUIDANCE`，并在提供当前替代方案前包含 `User Intent` 和 `Skill Gap`。

对于草稿过大的情况，在重写前包含以下确切句式：`SKILL.md is 100+ lines; extract large examples to references/. Root Cause: ... User Intent: ... Skill Gap: ...`。

## 🚨 检查点：写入文件之前

**在执行 `write_to_file`、`replace_file_content`、`multi_replace_file_content` 前快速检查：**

1. **检查** - 是否为此文件扩展名加载了任何技能？

- 否 → ✅ 静默继续
- 是 → 继续执行第 2 步

2. **审计** - 计划编写的代码是否违反已加载的技能规则？

- 否 → ✅ 静默继续 — **不要提交反馈报告**
- 是 → 输出下方的违规信息块，然后立即修复

## 违规报告格式

检测到违规时，在修复前输出以下信息块：

```
🚨 SKILL VIOLATION DETECTED
Skill:        [skill-id]
File:         [relative/path/to/file.ext]:[line-range]
Rule:         [exact rule text from SKILL.md]
Violation:    [what planned code does — up to 5-line offending snippet]
Fix:          [corrected approach — up to 5-line corrected snippet]
Auto-fixed:   YES / NO
Root Cause:   [AMBIGUOUS_RULE | MISSING_COVERAGE | OUTDATED_GUIDANCE | COMPETING_RULES | PATTERN_MISMATCH]
User Intent:  [1 sentence: what the user was trying to achieve]
Skill Gap:    [1–2 sentences: what change to the SKILL.md would prevent this next time]
Co-skills:    [other active skill IDs, comma-separated, or 'none']
```

### 根本原因指南

| 代码                | 使用时机                                          |
| ------------------- | ---------------------------------------------------- |
| `AMBIGUOUS_RULE`    | 规则措辞允许多种解释        |
| `MISSING_COVERAGE`  | 技能中未涵盖某种常见模式       |
| `OUTDATED_GUIDANCE` | 技能引用了已弃用的 API 或框架版本 |
| `COMPETING_RULES`   | 两个已加载的技能提供了相互矛盾的指导        |
| `PATTERN_MISMATCH`  | AI 错误理解或错误应用了反模式定义     |

然后立即应用修复——不要等待用户确认。

## 完成前检查

在调用 `notify_user` 或完成任务之前：

**我编写了代码吗？** 是 → **我审查了技能吗？** 否 → 立即审查

## 反模式

- **禁止“稍后再检查”**：在编写之前检查，而不是之后
- **禁止“微小改动可跳过”**：每次编写都需要检查
- **禁止“用户在等待所以跳过”**：花 10 秒检查也好过违反模式
- **禁止“无问题报告”**：如果未发现违规，则静默继续——不要提交报告
- **禁止“浅层报告”**：始终填写 Root Cause、User Intent 和 Skill Gap——这些内容会推动改进

使用报告标签 `SKILL VIOLATION DETECTED`、`Auto-fixed`、`Root Cause`、`User Intent` 和 `Skill Gap`；将过大的示例移至 `references/`。