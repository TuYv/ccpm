---
name: closed-loop
description: >
  V-model execute: CP-2 plan → CP-3 build → CP-3v component verify →
  CP-4 integration verify (full) → CP-5 acceptance. Worker never grades
  its own homework; evidence rows trace back to AC-n. Use via /execute.
---
# 闭环执行（V 模型右臂）

机械化验证流水线。每个验证步骤都会生成与验收标准 ID（`AC-n`）关联的**证据行**。

## 使用时机

- `/execute <task>` 或 `/execute <spec-path>`
- 实现完成后，任何处于 `normal` 及以上通道的技能
- 代码变更、部署、多步骤仓库交付物

## 阶段 0 — 通道 + 运行文件夹

```bash
bash .claude/lib/lane-classify.sh explain "<task>"
bash .claude/lib/checkpoint.sh init 04-projects/harness/runs/<YYYY-MM-DD-HHmm>
```

| 通道 | 检查点 |
|---|---|
| `tiny` | CP-3 → CP-5（如有变更） |
| `normal` | CP-1 → CP-2 → CP-3 → CP-3v → CP-5 |
| `full` | + CP-4 + claim-verifier + CP-6 |
| `bug` | CP-3 之前先建立根因账本（CP-0） |

记录：`checkpoint.sh record <run-dir> CP-0 PASS|SKIP "<lane>"`

## 阶段 1 — CP-1 规格（验收标准）

如果规格已存在，使用其中的 `## Acceptance criteria` 和可追溯性矩阵。否则，使用 `04-projects/harness/templates/SPEC-template.md` 编写：

`04-projects/harness/runs/<id>/criteria.md`（仅包含标准和矩阵）。

每条标准：**可证伪** + `AC-n` ID + 验证方法。

记录：`checkpoint.sh record <run-dir> CP-1 PASS "N criteria"`

## 阶段 2 — CP-2 计划

在 `evidence/CP-2-plan.md` 中建立任务 → AC ID 的映射。将矩阵状态更新为 `pending`。

记录：`checkpoint.sh record <run-dir> CP-2 PASS`

## 阶段 3 — CP-3 构建

工作代理执行实现。仅返回交付物路径。

## 阶段 4 — CP-3v 组件验证

```
retry=0
loop:
  spawn task-verifier (fresh context, read-only)
  merge EVIDENCE rows into evidence/ledger.md
  if PASS → break
  if FAIL:escalate → record CP-3v FAIL, escalate
  if FAIL:fixable && retry < 2 → fix-agent → retry++
  else → escalate
```

将验证器生成的 EVIDENCE 行复制到 `evidence/CP-3v-component.md`。

记录：`checkpoint.sh record <run-dir> CP-3v PASS|FAIL`

## 阶段 5 — CP-4 集成验证（`full` 或多任务）

启动 `integration-verifier`（只读）。将证据行追加到账本。

单任务 `normal` 跳过此步骤。

记录：`checkpoint.sh record <run-dir> CP-4 PASS|SKIP`

## 阶段 6 — CP-5 验收（后置条件）

对于每项变更，观察产物（curl、截图、重新获取）。生成：

`EVIDENCE AC-n | CP-5 | PASS | <observation> | <artifact>`

**UI/UX 流程变更：**后置条件是*视觉性的*。使用 browser-harness 进行捕获（每个状态使用 `evidence_shot`；流程使用 `FlowRecorder`→`.save_gif()`；使用 `pixel_diff` 与预期/先前状态进行比较），然后查看图像，并在判定 PASS 前确认不存在溢出/错位/裁切/颜色错误/响应式布局损坏。Observation 必须描述你所看到的内容；artifact 是 `evidence/` 中的截图/GIF。修复所有视觉缺陷并重新捕获。参见 CLAUDE.md → 视觉验证。

编写 `evidence/CP-5-acceptance.md`。**可追溯性闭环**：矩阵中的每个 AC 在账本中都至少有 1 条 PASS 行。

记录：`checkpoint.sh record <run-dir> CP-5 PASS|FAIL`

## 阶段 7 — 记录 + 交接

- 追加到 `.claude/logs/loop-ledger.tsv`
- 将规格可追溯性矩阵中的状态更新为 `verified`
- **`full` 通道/大型任务：**使用 `04-projects/harness/templates/report.html` 生成 HTML 汇总报告 → `04-projects/harness/runs/<id>/report.html`，内容取自 `criteria.md` + `evidence/ledger.md`（标准、AC 可追溯性、验证器结论、后置条件观察结果）。报告需自包含；通过 `SendUserFile` 发送，或发布为 Artifact。`normal`/`tiny` 跳过此步骤。
- 建议对 CP-7 使用 `/retro <run-dir>`

## 集成

| Skill | 通道 | CP-4 |
|---|---|---|
| ultragoal | 每个阶段均为 `full`（绝不降级） | integration-verifier + north-star 验收 |
| team-brief | full | claim-verifier |
| dogfood-release | full | Playwright 交叉验证 |
| blog-publish | normal | skip |
| content-factory | normal | skip |

## 升级模板

```
ESCALATED — <task>
Lane: <lane> | Last CP: <CP-n>
Evidence bundle: 04-projects/harness/runs/<id>/evidence/
Open AC IDs: <list without PASS rows>
Decision needed: <one question>
```