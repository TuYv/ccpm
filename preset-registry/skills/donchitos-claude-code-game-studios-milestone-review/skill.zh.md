---
name: milestone-review
description: "Generates a comprehensive milestone progress review including feature completeness, quality metrics, risk assessment, and go/no-go recommendation. Use at milestone checkpoints or when evaluating readiness for a milestone deadline."
argument-hint: "[milestone-name|current] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Task, AskUserQuestion
model: sonnet
---
## 阶段 0：解析参数

提取里程碑名称（`current` 或具体名称），并确定审查模式（仅确定一次，并存储供本次运行中的所有关卡生成使用）：
1. 如果传入了 `--review [full|lean|solo]` → 使用该值
2. 否则读取 `production/review-mode.txt` → 使用其中的值
3. 否则 → 默认为 `lean`

完整的检查模式请参阅 `.claude/docs/director-gates.md`。

---

## 阶段 1：加载里程碑数据

从 `production/milestones/` 读取里程碑定义。如果参数为 `current`，则使用最近修改的里程碑文件。

从 `production/sprints/` 读取此里程碑内所有冲刺的报告。

---

## 阶段 2：扫描代码库健康状况

- 扫描表示工作尚未完成的 `TODO`、`FIXME`、`HACK` 标记
- 检查 `production/risk-register/` 中的风险登记表

---

## 阶段 3：生成里程碑审查报告

```markdown
# Milestone Review: [Milestone Name]

## Overview
- **Target Date**: [Date]
- **Current Date**: [Today]
- **Days Remaining**: [N]
- **Sprints Completed**: [X/Y]

## Feature Completeness

### Fully Complete
| Feature | Acceptance Criteria | Test Status |
|---------|-------------------|-------------|

### Partially Complete
| Feature | % Done | Remaining Work | Risk to Milestone |
|---------|--------|---------------|------------------|

### Not Started
| Feature | Priority | Can Cut? | Impact of Cutting |
|---------|----------|----------|------------------|

## Quality Metrics
- **Open S1 Bugs**: [N] -- [List]
- **Open S2 Bugs**: [N]
- **Open S3 Bugs**: [N]
- **Test Coverage**: [X%]
- **Performance**: [Within budget? Details]

## Code Health
- **TODO count**: [N across codebase]
- **FIXME count**: [N]
- **HACK count**: [N]
- **Technical debt items**: [List critical ones]

## Risk Assessment
| Risk | Status | Impact if Realized | Mitigation Status |
|------|--------|-------------------|------------------|

## Velocity Analysis
- **Planned vs Completed** (across all sprints): [X/Y tasks = Z%]
- **Trend**: [Improving / Stable / Declining]
- **Adjusted estimate for remaining work**: [Days needed at current velocity]

## Scope Recommendations
### Protect (Must ship with milestone)
- [Feature and why]

### At Risk (May need to cut or simplify)
- [Feature and risk]

### Cut Candidates (Can defer without compromising milestone)
- [Feature and impact of cutting]

## Go/No-Go Assessment

**Recommendation**: [GO / CONDITIONAL GO / NO-GO]

**Conditions** (if conditional):
- [Condition 1 that must be met]
- [Condition 2 that must be met]

**Rationale**: [Explanation of the recommendation]

## Action Items
| # | Action | Owner | Deadline |
|---|--------|-------|----------|
```

---

## 阶段 3b：制作人风险评估

**审查模式检查** — 在生成 PR-MILESTONE 之前应用：
- `solo` → 跳过。注明："PR-MILESTONE skipped — Solo mode." 在没有制作人结论的情况下呈现 Go/No-Go 部分。
- `lean` → 跳过（不是 PHASE-GATE）。注明："PR-MILESTONE skipped — Lean mode." 在没有制作人结论的情况下呈现 Go/No-Go 部分。
- `full` → 正常生成。

在生成 Go/No-Go 建议之前，通过 Task 启动 `producer`，并使用关卡 **PR-MILESTONE**（`.claude/docs/director-gates.md`）。

传入：里程碑名称和目标日期、当前完成百分比、被阻塞的故事数量、冲刺报告中的速率数据（如有）、可裁减项列表。

在 Go/No-Go 部分中以内联方式呈现 producer 的评估。producer 的结论（ON TRACK / AT RISK / OFF TRACK）将作为整体建议的依据。

如果结论为 OFF TRACK，请在生成建议之前使用 `AskUserQuestion`：
- 提示："Producer 结论：OFF TRACK。该里程碑面临严重风险。本次评审将建议 NO-GO。你希望如何继续？"
- 选项：
  - `[A] 接受 NO-GO — 生成包含该建议的完整评审`
  - `[B] 覆盖为 CONDITIONAL GO — 我会自行记录已接受的风险`
  - `[C] 停止 — 我希望先处理阻塞项，再生成评审`

如果结论为 AT RISK，请使用 `AskUserQuestion`：
- 提示："Producer 结论：AT RISK。里程碑可能延期。Go/No-Go 部分应如何表述？"
- 选项：
  - `[A] CONDITIONAL GO — 在评审中包含 producer 提出的条件`
  - `[B] NO-GO — 无法及时满足这些条件`
  - `[C] GO — 我接受风险并希望继续推进`

除非用户明确选择上述 [B]，否则不得在结论为 OFF TRACK 时给出 GO。

---

## 阶段 4：保存评审

向用户呈现评审。

询问："可以将此内容写入 `production/milestones/[milestone-name]-review.md` 吗？"

如果同意，则写入文件，并在需要时创建目录。结论：**COMPLETE** — 里程碑评审已保存。

如果不同意，则在此停止。结论：**BLOCKED** — 用户拒绝写入。

---

## 阶段 5：后续步骤

- 如果此里程碑标志着开发阶段的边界，请运行 `/gate-check` 以获得正式的阶段关卡结论。
- 运行 `/sprint-plan`，根据上述范围建议调整下一个冲刺。