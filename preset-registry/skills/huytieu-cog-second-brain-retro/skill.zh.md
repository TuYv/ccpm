---
name: retro
description: >
  CP-7 retrospective: audit checkpoints, evidence quality, action items,
  and harvest candidates. Closes the V-model cycle and feeds the next run.
  Use via /retro after ship, escalate, or significant session.
---
# /retro — CP-7 收拢 V

每个已交付或升级的非 `tiny` 运行都要进行复盘。复盘是**建议性的**，但强烈要求执行：这是测试框架持续改进的方式。

## 运行时机

- CP-6 交付之后（已批准发布、PR 已合并、vault 交付物已完成）
- 升级之后（记录验证器失败的原因）
- `/ultragoal` 阶段结束时（每个阶段进行一次复盘）
- 手动执行：`/retro <run-dir or spec path>`

## 阶段 1 — 收集证据包

阅读：

1. 规范或卡片描述 + 验收标准
2. `04-projects/harness/runs/<id>/evidence/`（ledger、checkpoints.tsv、CP-* 文件）
3. `.claude/logs/loop-ledger.tsv`（本次运行的最后几行）
4. 如果是 ultragoal 阶段，则阅读 `04-projects/<goal>/STATUS.md`

## 阶段 2 — 检查点审计

对于该泳道要求的每个 CP，标记预期情况与实际情况之间的差距：

| CP | `tiny` | `normal` | `full` |
|---|---|---|---|
| CP-1 spec | 跳过 | 必需 | 必需 |
| CP-3v component | 跳过 | 必需 | 必需 |
| CP-4 integration | 跳过 | 跳过 | 多任务时必需 |
| CP-5 acceptance | 发生变更时 | 必需 | 必需 |
| CP-6 ship | 对外部交付时 | 对外部交付时 | 必需 |

## 阶段 3 — 证据质量检查

询问：

- 是否存在没有 PASS 证据行就已交付的 AC-n？（可追溯性违规）
- 是否存在 observation 为工具返回值而非制品的 PASS 行？（自信但未经检查）
- 是否有任何标准无法证伪？（在下一份规范中修复）

## 阶段 4 — 撰写复盘

将 `references/retro-template.md` 复制到：

`04-projects/harness/retro/YYYY-MM-DD-<slug>.md`

填写所有部分。为行动项分配 ID（`AI-01`…）。

## 阶段 5 — 向前反馈

1. **收集**：将行动项 + 经验教训追加到当天的 harvest 暂存区
2. **待办列表**：如果属于测试框架工作，则将 `AI-n` 行添加到 `04-projects/harness/BACKLOG.md`
3. **STATUS.md**：如果是 ultragoal 阶段，则推进阶段状态 + 记录未解决的 `AC-n`
4. **规范检查点日志**：更新规范中的 `## Checkpoint log` CP-7 行
5. 记录：`bash .claude/lib/checkpoint.sh record <run-dir> CP-7 PASS "retro: <path>"`

## 输出给用户

TL;DR：结果、最重要的经验教训、最重要的行动项、复盘路径。