---
name: cleanup-all
description: "Run all 8 cleanup skills in sequence: unused → cycles → dedupe → types → weak-types → defensive → legacy → slop. Each step verifies before the next runs; halts on first failure. Produces one consolidated report. Use when the user asks to clean up the whole codebase, run all cleanup skills, do a full code-quality pass, or sweep the repo. Example queries — \"clean up the whole codebase\", \"run a full code-quality pass\", \"sweep this repo\", \"do all the cleanups in order\"."
argument-hint: "[scope (optional path or glob)]"
user-invocable: true
---
编排完整的清理流水线。按照经过审慎选择的顺序运行全部 8 个清理技能，使每一步都为下一步缩小处理范围。

一旦验证失败就停止，以便你在级联操作继续之前进行调查。

## 预检

1. **确认意图**：这将产生最多 8 个独立提交，并且可能修改许多文件。如果工作树相对于上游分支存在领先提交，则向用户展示计划的执行顺序并请求确认（这可能会与他们尚未推送的工作叠加）。
2. **Git 状态**：如果工作树不干净则拒绝执行。每个子技能都需要一个干净的基线来执行其验证步骤。
3. **创建主报告**：`.claude/cleanup-reports/cleanup-all-{YYYY-MM-DD}.md` — 子技能报告将从此处链接。
4. **估算基线**：记录 LOC、文件数量、依赖数量、knip 发现项、madge 循环数量和弱类型数量。用于最后的前后对比。

## 执行顺序

每个子工作流都会通过加载与当前 agent 目标匹配的本地技能说明来运行。每一步之后，运行该技能的验证步骤。**任何验证失败都会停止流水线** — 不要继续下一步。

1. **`cleanup-unused`** — 首先删除死代码。减少下游所有步骤需要扫描的内容。
2. **`cleanup-cycles`** — 接下来修复依赖图。在无环图中进行其他重构更安全。
3. **`cleanup-dedupe`** — 提取重复内容。现在死代码已被移除且依赖图已清理，真正的重复内容会浮现出来。
4. **`cleanup-types`** — 整合类型。去重通常也会暴露类型重复问题。
5. **`cleanup-weak-types`** — 强化类型。在类型模块整合到位后，这一步会更容易。
6. **`cleanup-defensive`** — 移除无意义的 try/catch。类型强化有时会使错误的捕获逻辑变得显而易见。
7. **`cleanup-legacy`** — 移除已弃用逻辑和回退逻辑。类型变更可能已经暴露出死分支。
8. **`cleanup-slop`** — 最后清除无帮助的注释。属于外观调整，不改变逻辑。

### 为什么采用这个顺序

- **先破坏，再构建，最后做外观调整**。先删除内容，可以减少后续技能的处理范围。
- **先处理结构，再处理内容**。循环和未使用代码属于图级别问题；去重和类型属于内容级别问题；slop 属于行级别问题。
- **在差异较小且人工审查更快时，尽早处理风险最高但可逆的变更**。slop 放在最后，因为它最安全，并且会产生最大的注释差异。
- 如果用户想撤销某个阶段，每一步的提交都可以作为干净的回退点。

### 每步协议

对于按顺序执行的每个技能：

1. 输出：`▶ Running cleanup-X (step Y/8)…`
2. 加载并运行匹配的清理技能说明，并使用相同的范围参数（如果有）。
3. 等待技能完成 — 它会生成自己的提交并返回验证结果。
4. 如果技能验证失败：停止，输出 `✗ cleanup-X verify failed — halting pipeline. See report at <path>.`
5. 如果验证通过：将发现项数量 + LOC 变化追加到主报告，然后继续。

## 主报告

写入 `.claude/cleanup-reports/cleanup-all-{YYYY-MM-DD}.md`：

```markdown
# Full Cleanup — YYYY-MM-DD

## Baseline
- LOC: N
- Files: M
- Dependencies: K
- Cycles (madge): C
- Weak types: W
- Knip-flagged unused: U

## Pipeline Run

| # | Skill | Status | Items removed | LOC delta | Commit | Report |
|---|-------|--------|---------------|-----------|--------|--------|
| 1 | cleanup-unused | pass | 12 (3 files, 8 exports, 1 dep) | -340 | `<commit>` | `[link]` |
| 2 | cleanup-cycles | pass | 3 cycles broken | +12 (extracted leaves) | `<commit>` | `[link]` |
| 3 | cleanup-dedupe | ✓ | 5 utils extracted | -180 | ... | ... |
| 4 | cleanup-types | ✓ | 4 types consolidated | -60 | ... | ... |
| 5 | cleanup-weak-types | ✓ | 22 weak types strengthened | 0 | ... | ... |
| 6 | cleanup-defensive | halted | unsafe pattern requires review | - | - | `[link]` |
| 7 | cleanup-legacy | (not run — pipeline halted at step 6) | | | | |
| 8 | cleanup-slop | (not run) | | | | |

## After (steps 1-5 only)
- LOC: N - 568
- Files: M - 3
- Dependencies: K - 1
- Cycles: 0
- Weak types: W - 22

## Halt Reason
- Step 6 (`cleanup-defensive`) verify failed: 3 tests broke when removing 2 swallow-and-return-null catches in `services/payment.ts`. The hidden errors were real bugs. See child report for details.

## Next Steps
1. Review halted step's report. Decide whether the surfaced bugs need fixing now.
2. Re-run pipeline starting from the halted step: `/cleanup-defensive` then `/cleanup-legacy` then `/cleanup-slop`.

## Deferred Items
[Aggregated MEDIUM/LOW findings across all run steps — N items requiring human review.]
```

## After Completion (or Halt)

End-of-turn message:
- Steps completed: X / 8
- Total items removed: N
- Total LOC delta: -M
- Halt reason (if any) — quote first 2 lines from halted skill's verify failure.
- Path to master report.
- Next-step suggestion: either "all steps green — review master report" or "halted at step X — see report and decide next action."

## NEVER

- Continue past a verify failure — the next skill might compound the breakage.
- Squash the per-skill commits — they're the rollback granularity.
- Auto-fix the halted skill's failure — that's a human decision (the failure may be a real bug worth investigating).
- Run on a dirty working tree — refuse and ask user to commit/stash.
- Run when the repo is mid-rebase, mid-merge, or mid-cherry-pick — git state will confuse the per-step commits.
- Skip the baseline measurement — without it, the master report has no before/after delta.