---
name: verify
license: MIT
description: >-
  Self-test the Citadel hook pipeline from within a live session. Exercises
  real tool calls (Write, Edit, Bash, Read) and checks that hooks fired,
  telemetry accumulated, and no errors occurred. Reports HOOK HEALTH: PASS
  or HOOK HEALTH: FAIL with a per-hook breakdown.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - verify
  - verify hooks
  - hook health
  - self-test
  - check hooks
  - harness health
last-updated: 2026-03-27
---
# /verify — Hook 管道自检

在以下情况使用此技能：
- Hooks 近期有更新，需要做一次实时健全性检查
- 感觉有哪里不对劲（工具似乎过慢、质量门未触发）
- 在新项目中安装了 Citadel 之后

## 协议

### 第 1 步：基线

读取当前的遥测状态：
```
.planning/telemetry/hook-timing.jsonl  → count lines (baseline_timing)
.planning/telemetry/audit.jsonl        → count lines (baseline_audit)
.planning/telemetry/hook-errors.log    → size in bytes (baseline_errors)
```

如果遥测目录不存在，请记录这一情况（init-project 可能尚未运行）。

### 第 2 步：触发各 hook

按顺序执行以下工具调用。每个调用会触发一个不同的 hook：

1. **Write** 一个临时文件到 `.planning/verify-temp.ts`：
   ```typescript
   // citadel verify probe
   export const verifyProbe = true;
   ```
   → 触发：PreToolUse（protect-files、governance），PostToolUse（post-edit）

2. **Edit** 同一个文件 —— 把 `true` 改为 `false`：
   → 触发：PreToolUse（protect-files、governance），PostToolUse（post-edit）

3. **Bash** 运行一条无害的读取命令：`echo "verify-probe"`
   → 触发：PreToolUse（governance）

4. **Read** 读回该临时文件
   → 触发：PreToolUse（protect-files —— 应当放行，因为它不是 .env）

5. **Delete** 删除该临时文件：`rm .planning/verify-temp.ts` 或等效命令
   → 清理

### 第 3 步：检查副作用

所有工具调用完成后，再次读取遥测数据：

| 检查项 | 预期结果 | 结果 |
|---|---|---|
| hook-timing.jsonl 有增长 | +2 行或更多（Write + Edit 的 post-hooks） | PASS/FAIL |
| audit.jsonl 有增长 | +3 行或更多（Write + Edit + Bash 的 pre-hooks） | PASS/FAIL |
| hook-errors.log 无变化 | 与基线大小相同 | PASS/FAIL |

### 第 4 步：报告

输出一个结果块：

```
=== HOOK HEALTH CHECK ===

hook-timing.jsonl:  +N lines  [PASS / FAIL]
audit.jsonl:        +N lines  [PASS / FAIL]
hook-errors.log:    no errors [PASS / FAIL — N new errors]

HOOK HEALTH: PASS
```

或者，如果有任何检查项失败：

```
HOOK HEALTH: FAIL

Failing checks:
- hook-timing.jsonl did not grow: PostToolUse hooks may not be firing
  → Verify hooks are installed: node scripts/verify-hooks.js
  → Check settings.json: cat .claude/settings.json | grep PostToolUse

- audit.jsonl did not grow: governance hook may not be firing
  → Check: node hooks_src/governance.js <<< '{}'
```

## 边缘情况

**没有 .planning/telemetry/ 目录**：init-project 可能尚未运行。
输出："HOOK HEALTH: FAIL — .planning/telemetry/ not found. Run: node hooks_src/init-project.js"

**已安装 hooks 但遥测数据仍为零**：项目可能存在一个禁用了遥测的 harness.json。请检查 .claude/harness.json 中的 `features.telemetry`。

**首次运行（无基线）**：如果这些文件在测试前不存在，它们应在测试期间被创建。请将“文件已创建”视为等同于“有增长”。

## 本技能不测试的内容

- hooks 在边缘情况下的正确性（为此请使用 verify-hooks.js）
- 完整的 PreToolUse → 工具 → PostToolUse 序列隔离（为此请使用 integration-test.js）
- 技能输出质量（为此请使用 skill-bench.js --execute）

## 质量门

- 全部 3 项遥测检查必须通过：timing 有增长、audit 有增长、无新增错误
- 无论结果是通过还是失败，都必须清理临时文件
- 报告必须包含精确计数（+N 行），而不仅是 PASS/FAIL
- 如果 .planning/telemetry/ 不存在，立即判定为 FAIL —— 不得捏造计数

## 情境门

**披露：** 测试期间会创建并删除 `.planning/verify-temp.ts`。不修改其他任何文件。
**可逆性：** green —— 临时文件在完成后删除；无持久性变更。
**信任门：** 任意 —— 无限制。

## 退出协议

```
---HANDOFF---
- Hook pipeline: PASS / FAIL
- hook-timing.jsonl: +N lines
- audit.jsonl: +N lines
- hook-errors.log: N new errors (0 expected)
- Reversibility: green — no persistent changes; verify-temp.ts cleaned up
- Next: if FAIL, run node scripts/verify-hooks.js for deeper diagnostics
---
```
