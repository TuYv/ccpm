---
name: verification-loop
description: "A comprehensive verification system for Claude Code sessions. Use when verifying a Claude Code session's work before claiming it is complete."
---
# 验证循环技能

用于 Claude Code 会话的综合验证系统。

## 使用时机

在以下情况下调用此技能：
- 完成功能或重大代码更改后
- 创建 PR 前
- 希望确保通过质量门禁时
- 重构后

## 验证阶段

### 阶段 1：构建验证
```bash
# Check if project builds
npm run build 2>&1 | tail -20
# OR
pnpm build 2>&1 | tail -20
```

如果构建失败，请停止并修复问题，然后再继续。

### 阶段 2：类型检查
```bash
# TypeScript projects
npx tsc --noEmit 2>&1 | head -30

# Python projects
pyright . 2>&1 | head -30
```

报告所有类型错误。继续之前修复关键错误。

### 阶段 3：Lint 检查
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

### 阶段 4：测试套件
```bash
# Run tests with coverage
npm run test -- --coverage 2>&1 | tail -50

# Check coverage threshold
# Target: 80% minimum
```

报告：
- 测试总数：X
- 通过：X
- 失败：X
- 覆盖率：X%

### 阶段 5：安全扫描
```bash
# Check for secrets
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# Check for console.log
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### 阶段 6：差异审查
```bash
# Show what changed
git diff --stat
git diff HEAD~1 --name-only
```

审查每个已更改的文件，检查：
- 非预期更改
- 缺少错误处理
- 潜在的边界情况

## 输出格式

运行所有阶段后，生成验证报告：

```
VERIFICATION REPORT
==================

Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY] for PR

Issues to Fix:
1. ...
2. ...
```

## 持续模式

对于长时间会话，每 15 分钟或在重大更改后运行一次验证：

```markdown
Set a mental checkpoint:
- After completing each function
- After finishing a component
- Before moving to next task

Run: /verify
```

## 与 Hooks 集成

此技能是对 PostToolUse hooks 的补充，可提供更深入的验证。
Hooks 可立即发现问题；此技能则提供全面审查。