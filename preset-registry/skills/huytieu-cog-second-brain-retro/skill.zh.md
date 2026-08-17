---
name: retro
description: >
  CP-7 retrospective: audit checkpoints, evidence quality, action items,
  and harvest candidates. Closes the V-model cycle and feeds the next run.
  Use via /retro after ship, escalate, or significant session.
---
# /retro — CP-7 闭合 V

每个已交付或升级处理的非 `tiny` 运行都需要进行复盘。复盘具有**建议性质**，但强烈建议执行：这是工具链持续改进的方式。

## 何时运行

- CP-6 交付之后（发布获批、PR 已合并、知识库交付物已完成）
- 升级处理之后（记录验证器失败的原因）
- `/ultragoal` 阶段结束时（每个阶段进行一次复盘）
- 手动运行：`/retro <run-dir or spec path>`

## 阶段 1 — 收集证据包

阅读：

1. 规格或卡片描述及验收标准
2. `04-projects/harness/runs/<id>/evidence/`（台账、checkpoints.tsv、CP-* 文件）
3. `.claude/logs/loop-ledger.tsv`（此运行的最后几行）
4. 如果是 ultragoal 阶段，则阅读 `04-projects/<goal>/STATUS.md`

## 阶段 2 — 检查点审计

对于执行通道要求的每个 CP，标记预期、实际和差距：

| CP | `tiny` | `normal` | `full` |
|---|---|---|---|
| CP-1 规格 | 跳过 | 必需 | 必需 |
| CP-3v 组件 | 跳过 | 必需 | 必需 |
| CP-4 集成 | 跳过 | 跳过 | 多任务时必需 |
| CP-5 验收 | 有变更时必需 | 必需 | 必需 |
| CP-6 交付 | 对外时必需 | 对外时必需 | 必需 |

## 阶段 3 — 证据质量检查

询问：

- 是否有任何 AC-n 在没有 PASS 证据行的情况下完成交付？（可追溯性违规）
- 是否有任何 PASS 行的观察结果来自工具返回值而非制品？（自信但未经检查）
- 是否有任何标准无法被证伪？（在下一份规格中修正）

## 阶段 4 — 编写复盘

将 `04-projects/harness/templates/retro.md` 复制到：

`04-projects/harness/retro/YYYY-MM-DD-<slug>.md`

填写所有章节。行动项使用 ID（`AI-01`…）。

## 阶段 5 — 前馈

1. **收获**：将行动项和经验教训追加到今天的收获暂存区
2. **待办事项**：如果属于工具链工作，则将 `AI-n` 行添加到 `04-projects/harness/BACKLOG.md`
3. **STATUS.md**：如果是 ultragoal 阶段，则推进阶段状态并记录仍未关闭的 `AC-n`
4. **规格检查点日志**：更新规格中 `## Checkpoint log` 的 CP-7 行
5. 记录：`bash .claude/lib/checkpoint.sh record <run-dir> CP-7 PASS "retro: <path>"`

## 向用户输出

TL;DR：结果、最重要的经验、最重要的行动项、复盘路径。