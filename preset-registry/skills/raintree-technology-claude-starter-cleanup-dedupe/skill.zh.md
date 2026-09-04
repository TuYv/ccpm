---
name: cleanup-dedupe
description: "Detect duplicated code blocks and refactor to DRY where it reduces complexity. Runs jscpd (multi-language), filters by signal-to-noise, and auto-extracts only token-identical blocks ≥30 LOC. Use when the user asks to deduplicate, DRY up, find copy-paste, or consolidate repeated logic. Example queries — \"DRY this up\", \"find copy-paste in the codebase\", \"consolidate repeated logic\", \"where are the duplicated blocks\"."
argument-hint: "[scope (optional path or glob)]"
user-invocable: true
---
查找重复代码，并在能降低复杂度之处进行整合。只自动提取 token 完全一致且有一定规模的代码块。较小或存在分歧的重复往往不应做 DRY 化——过早抽象比 3 行相似代码更糟。

## 预检

1. **语言检测** — jscpd 支持 150+ 种语言，因此无论项目中存在哪些语言都可以直接运行。
2. **Git 状态**：工作树不干净时拒绝自动应用。
3. **报告目录**：确保 `.claude/cleanup-reports/` 存在。
4. **阅读现有的工具函数约定**：项目把共享工具放在哪里？寻找 `lib/`、`utils/`、`shared/`、`common/` 以及包目录。提取出的代码就放在那里。

## 检测

```bash
# jscpd - the standard for cross-language clone detection
bunx jscpd --min-tokens 70 --min-lines 30 --threshold 0 --reporters json --output /tmp/jscpd-out . 2>/dev/null \
  || npx jscpd --min-tokens 70 --min-lines 30 --reporters json --output /tmp/jscpd-out .
```

解析 `/tmp/jscpd-out/jscpd-report.json`。每个重复条目包含 `firstFile`、`secondFile`、`lines`、`tokens` 以及实际代码片段。

在进一步分析之前先**过滤噪音**：
- 丢弃位于 `node_modules/`、`dist/`、`build/`、`.next/`、`__generated__/`、`*.generated.*` 中的匹配项。
- 丢弃互相镜像的测试文件内部的匹配项（测试设置的重复往往是有意为之）。
- 丢弃仅是类型/接口定义的匹配项——那些归 `cleanup-types` 处理。
- 丢弃迁移文件中的匹配项。

## 评估

编写 `.claude/cleanup-reports/cleanup-dedupe-{YYYY-MM-DD}.md`：

```markdown
# Duplication Assessment — YYYY-MM-DD

## Summary
- Total clones found: N (after filtering noise)
- HIGH confidence (auto-extractable): X
- MEDIUM (similar but divergent): Y
- LOW (structural similarity, intentional): Z
- Estimated LOC saved (HIGH only): ~N

## Clones

### Clone 1 — HIGH (extract to `packages/utils/src/format.ts`)
- Files: `apps/app/features/holdings/format.ts:15-67`, `apps/admin/features/users/format.ts:22-74`
- 52 lines, 380 tokens, identical
- Both implement `formatCompactNumber(n: number): string`
- Extract to: `
