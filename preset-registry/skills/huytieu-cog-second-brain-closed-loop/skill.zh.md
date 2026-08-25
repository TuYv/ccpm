---
name: closed-loop
description: >
  Run one task through the V-model verification loop: CP-2 plan → CP-3 build →
  CP-3v component verify → CP-4 integration verify (full lane) → CP-5 acceptance.
  The worker never grades its own homework; evidence rows trace back to AC-n.
  Opt-in: invoke with /closed-loop or by asking for the closed loop, proper
  verification, or an evidence trail. Ordinary work does not run this.
---
# 闭环执行（V 模型右臂）

机械化验证流水线。每个验证步骤都会生成与验收标准 ID（`AC-n`）关联的 **证据行**。

## 使用时机

该工具链需选择启用。在以下情况下运行：

- 通过 `/closed-loop <task>` 或 `/closed-loop <spec-path>` 调用。
- 用户要求执行闭环、进行适当验证或提供证据链。
- `00-inbox/MY-PROFILE.md` 中的 `verification_harness: on` 已启用，且这是一个构建任务。
- 声明了 `normal`+ 通道的其他 skill 到达其验证步骤。

**不要**在用户未要求时运行。笔记、简报、研究、草稿和普通编辑不是工具链运行，在这些任务上建立检查点台账只会造成额外开销。

## 阶段 0 — 通道 + 运行文件夹

```bash
bash .claude/lib/lane-classify.sh explain "<task>"
bash .claude/lib/checkpoint.sh init 04-projects/harness/runs/<YYYY-MM-DD-HHmm>
```

| 通道 | 检查点 |
|---|---|
| `tiny` | CP-3 → CP-5（如果有变更） |
| `normal` | CP-1 → CP-2 → CP-3 → CP-3v → CP-5 |
| `full` | + CP-4 + claim-verifier + CP-6 |
| `bug` | 在 CP-3 之前建立根因台账（CP-0） |

记录：`checkpoint.sh record <run-dir> CP-0 PASS|SKIP "<lane>"`

## 阶段 1 — CP-1 规格（验收标准）

如果规格存在，则使用其中的 `## Acceptance criteria` + 可追溯性矩阵。否则，使用 `references/spec-template.md`（仅包含 criteria + matrix 部分）编写：

`04-projects/harness/runs/<id>/criteria.md`

每条标准必须：**可证伪** + `AC-n` ID + 验证方法。

记录：`checkpoint.sh record <run-dir> CP-1 PASS "N criteria"`

## 阶段 2 — CP-2 计划

在 `evidence/CP-2-plan.md` 中将任务映射到 AC ID。将矩阵状态更新为 `pending`。

记录：`checkpoint.sh record <run-dir> CP-2 PASS`

## 阶段 3 — CP-3 构建

Worker 负责实现。仅返回交付物路径。

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

将验证器的 EVIDENCE 行复制到 `evidence/CP-3v-component.md`。

记录：`checkpoint.sh record <run-dir> CP-3v PASS|FAIL`

## 阶段 5 — CP-4 集成验证（`full` 或多任务）

生成 `integration-verifier`（只读）。将行追加到台账。

单任务的 `normal` 通道跳过此步骤。

记录：`checkpoint.sh record <run-dir> CP-4 PASS|SKIP`

## 阶段 6 — CP-5 验收（后置条件）

对于每次变更，观察交付物（curl、截图、重新获取）。生成：

`EVIDENCE AC-n | CP-5 | PASS | <observation> | <artifact>`

**UI/UX 流程变更：**后置条件是*视觉上的*。使用环境中可用的任意浏览器工具，为每个有意义的状态截图，然后读取图像并确认没有溢出、错位、裁剪、颜色错误或损坏的响应式布局，之后才能 PASS。Observation 必须描述你所看到的内容；artifact 是 `evidence/` 中的截图/GIF。修复所有视觉缺陷并重新截图。参见 CLAUDE.md → Visual Verification。

编写 `evidence/CP-5-acceptance.md`。**可追溯性闭环**：矩阵中的每个 AC 在台账中至少有一行 PASS 记录。

记录：`checkpoint.sh record <run-dir> CP-5 PASS|FAIL`

## 阶段 7 — 记录 + 交接

- 追加到 `.claude/logs/loop-ledger.tsv`
- 将规格可追溯性矩阵中的状态更新为 `verified`
- **`full` 通道 / 大型任务：** 从 `references/report-template.html` 生成 HTML 汇总 → `04-projects/harness/runs/<id>/report.html`，内容根据 `criteria.md` + `evidence/ledger.md` 填充（标准、AC 可追溯性、验证者裁决、后置条件观察结果）。文档必须自包含；通过 `SendUserFile` 发送给用户，或发布为 Artifact。`normal`/`tiny` 跳过。
- 建议在 CP-7 使用 `/retro <run-dir>`

## 集成

| Skill | 通道 | CP-4 |
|---|---|---|
| `ultragoal` | 每个阶段均为 `full`（绝不降级） | integration-verifier + 北极星验收 |
| `team-brief` | full | claim-verifier |
| `comprehensive-analysis`、`auto-research` | full | 对引用的声明使用 claim-verifier |
| `content-factory` | normal | 跳过 |
| `review-cockpit` | normal | 跳过；CP-6 是用户对每张卡片的批准 |

## 升级模板

```
ESCALATED — <task>
Lane: <lane> | Last CP: <CP-n>
Evidence bundle: 04-projects/harness/runs/<id>/evidence/
Open AC IDs: <list without PASS rows>
Decision needed: <one question>
```