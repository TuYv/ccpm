---
name: reality-verification
description: This skill should be used when the user asks to "verify a fix", "reproduce failure", "diagnose issue", "check BEFORE/AFTER state", "VF task", "reality check", "check test quality", "mock-only tests", or needs guidance on verifying fixes by reproducing failures before and after implementation, or detecting mock-heavy test anti-patterns.
version: 0.2.0
user-invocable: false
---
# 现实验证

对于修复类目标：在开始工作之前（BEFORE）复现故障，在完成之后（AFTER）验证问题已解决。

## 目标检测

对用户目标进行分类，以判断是否需要诊断。详细模式请参见 `references/goal-detection-patterns.md`。

**快速参考：**
- 修复类指示词：fix, repair, resolve, debug, patch, broken, failing, error, bug
- 新增类指示词：add, create, build, implement, new
- 冲突处理：若两者同时出现，按修复类（Fix）处理

## 命令映射

| 目标关键词 | 复现命令 |
|---------------|---------------------|
| CI, pipeline | `gh run view --log-failed` |
| test, tests | 项目测试命令 |
| type, typescript | `pnpm check-types` 或 `tsc --noEmit` |
| lint | `pnpm lint` |
| build | `pnpm build` |
| E2E, UI | Playwright MCP 浏览器工具 |
| API, endpoint | WebFetch 工具 |

对于 E2E/部署验证，请使用 MCP 工具（UI 使用 Playwright MCP 浏览器工具，API 使用 WebFetch 工具）。

## BEFORE/AFTER 文档记录

### BEFORE 状态（诊断）

在 `.progress.md` 的 `## Reality Check (BEFORE)` 小节下记录：

```markdown
## Reality Check (BEFORE)

**Goal type**: Fix
**Reproduction command**: `pnpm test`
**Failure observed**: Yes
**Output**:
```
FAIL src/auth.test.ts
  Expected: 200
  Received: 401
```
**Timestamp**: 2026-01-16T10:30:00Z
```

### AFTER 状态（验证）

在 `.progress.md` 的 `## Reality Check (AFTER)` 小节下记录：

```markdown
## Reality Check (AFTER)

**Command**: `pnpm test`
**Result**: PASS
**Output**:
```
PASS src/auth.test.ts
All tests passed
```
**Comparison**: BEFORE failed with 401, AFTER passes
**Verified**: Issue resolved
```

## VF 任务格式

对于修复类规格说明，将其作为任务 4.3（在创建 PR 之后）添加：

```markdown
- [ ] 4.3 VF: Verify original issue resolved
  - **Do**:
    1. Read BEFORE state from .progress.md
    2. Re-run reproduction command: `<command>`
    3. Compare output with BEFORE state
    4. Document AFTER state in .progress.md
  - **Verify**: `grep -q "Verified: Issue resolved" ./specs/<name>/.progress.md`
  - **Done when**: AFTER shows issue resolved, documented in .progress.md
  - **Commit**: `chore(<name>): verify fix resolves original issue`
```

## 测试质量检查

在验证与测试相关的修复时，请检查是否存在“仅 mock 测试”反模式。详细模式请参见 `references/mock-quality-checks.md`。

**快速参考危险信号：**
- mock 声明数量超过真实断言的 3 倍
- 缺少对被测实际模块的导入
- 所有断言均为 mock 交互检查（toHaveBeenCalled）
- 没有集成测试
- 缺少 mock 清理（afterEach）

## 为什么这很重要

| 没有 | 有 |
|---------|------|
| “修复 CI”的规格说明已完成，但 CI 仍然报红 | 合并前已验证 CI 变绿 |
| 测试“已修复”，但原始故障原因不明 | 通过前后对比证明修复有效 |
| 隐性回归 | 显式复现故障 |
| 需要人工验证 | 工作流中的自动化验证 |
| 测试通过，但只测试了 mock | 测试验证的是真实行为，而非 mock 行为 |
| 绿色测试带来的虚假安全感 | 确信测试能捕获真实 bug |
