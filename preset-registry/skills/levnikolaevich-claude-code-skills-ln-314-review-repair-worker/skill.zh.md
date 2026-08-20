---
name: ln-314-review-repair-worker
description: "Use when accepted findings require bounded repair changes and a structured repair summary."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L3 工作器
**类别：** 3XX 规划

# 审查修复工作器

## 必读内容

**必读：** 加载 `references/evaluation_worker_runtime_contract.md`、`references/evaluation_summary_contract.md`
**必读：** 加载 `../ln-310-multi-agent-validator/references/plan_review_pipeline.md`、`../ln-310-multi-agent-validator/references/penalty_points.md`
条件性读取：在 `mode=story` 下，仅加载已接受发现中所涉及组的验证检查清单文件，然后再应用这些组的修复。仅当启动后台工具或进程时，才加载 `references/cleanup_evidence_contract.md`。

## 目的

- 使用 11 组系统化验证结构应用已接受的低风险修复
- 将修复与聚合及批准分离
- 如果启动后台工具，则记录清理证据

## 模式门控

- `mode=story`：使用 ln-312 的发现执行完整的 11 组修复
- `mode=plan_review`：仅应用已接受的更正（根据 `../ln-310-multi-agent-validator/references/plan_review_pipeline.md` 中的“比较与更正安全规则”，最多更正 5 项）

## 11 组验证结构（mode=story）

下表是路由映射。仅当已接受的发现中包含某个组时，才加载该组的检查清单；不要预加载无关的验证目录。

| # | 组 | 标准 | 检查清单 |
|---|-------|----------|-----------|
| 1 | 结构 | #1-#4, #23-#24 | `../ln-310-multi-agent-validator/references/structural_validation.md` |
| 2 | 规范 | #5 | `../ln-310-multi-agent-validator/references/standards_validation.md` |
| 3 | 解决方案 | #6, #21, #28 | `../ln-310-multi-agent-validator/references/solution_validation.md` |
| 4 | 工作流 | #7-#13 | `../ln-310-multi-agent-validator/references/workflow_validation.md` |
| 5 | 质量 | #14-#15 | `../ln-310-multi-agent-validator/references/quality_validation.md` |
| 6 | 依赖项 | #18-#19/#19b | `../ln-310-multi-agent-validator/references/dependency_validation.md` |
| 7 | 交叉引用 | #25-#26 | `../ln-310-multi-agent-validator/references/cross_reference_validation.md` |
| 8 | 风险 | #20 | `../ln-310-multi-agent-validator/references/risk_validation.md` |
| 9 | 预演分析 | #27 | `../ln-310-multi-agent-validator/references/premortem_validation.md` |
| 10 | 验证 | #22 | `../ln-310-multi-agent-validator/references/traceability_validation.md` |
| 11 | 可追溯性 | #16-#17, #17b-#17c | `../ln-310-multi-agent-validator/references/traceability_validation.md` |

## 修复规则

- 仅当缺陷确实已修复（而非仅被确认）时，才将惩罚分清零。
- 仅当需要人工判断且自动修复无法安全继续时，才使用 `FLAGGED`。
- 最大惩罚分以 `../ln-310-multi-agent-validator/references/penalty_points.md` 为准（不要硬编码）。
- 测试策略章节可以存在，但可保持为空。
- 严格按照各检查清单中“自动修复操作”列的规定应用自动修复操作。

## 运行时

运行时系列：
- `evaluation-worker-runtime`

必需的清单字段：
- `identifier`
- `phase_order`
- `summary_kind=review-repair`
- `operation=repair`

推荐的 `phase_order`：
1. `PHASE_0_CONFIG`
2. `PHASE_1_LOAD_FINDINGS`
3. `PHASE_2_GROUP_STRUCTURAL`（#1-#4、#23-#24）
4. `PHASE_3_GROUP_STANDARDS_SOLUTION`（#5、#6、#21、#28）
5. `PHASE_4_GROUP_WORKFLOW_QUALITY`（#7-#15）
6. `PHASE_5_GROUP_DEPS_XREF`（#18-#19/#19b、#25-#26）
7. `PHASE_6_GROUP_RISK_PREMORTEM`（#20、#27）
8. `PHASE_7_GROUP_VERIFICATION_TRACE`（#22、#16-#17、#17b-#17c）
9. `PHASE_8_VERIFY_LOCAL_RESULT`
10. `PHASE_9_WRITE_SUMMARY`
11. `PHASE_10_SELF_CHECK`

## 摘要

输出 `summary_kind=review-repair`。

载荷必须包含：
- `worker=ln-314`
- `status`
- `operation=repair`
- `warnings`

如果可用，优先包含以下字段：
- `penalty_before`（来自 ln-312 的发现）
- `penalty_after`（修复后）
- `flagged_items`（需要人工判断的项目列表）
- `coverage_summary`（AC 覆盖率百分比）
- `groups_processed`（数量）

## 完成定义

- [ ] 已加载来自 ln-312 的发现
- [ ] 已处理全部 11 个组（mode=story），或已应用获准的更正（mode=plan_review）
- [ ] 已跟踪修复前后的惩罚值
- [ ] 已记录 FLAGGED 项目
- [ ] 已完成本地验证
- [ ] 已在需要时记录清理证据
- [ ] 已写入 `review-repair` 摘要
- [ ] 自检已通过

**版本：** 1.0.0
**最后更新：** 2026-04-10