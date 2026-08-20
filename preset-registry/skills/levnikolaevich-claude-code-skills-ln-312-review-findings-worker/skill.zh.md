---
name: ln-312-review-findings-worker
description: "Use when an evaluation coordinator needs normalized findings from target artifacts and research evidence."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L3 工作器
**类别：** 3XX 规划

# 审查发现工作器

## 必读内容

**必读：** 加载 `references/evaluation_worker_runtime_contract.md`、`references/evaluation_summary_contract.md`
**必读：** 加载 `../ln-310-multi-agent-validator/references/phase2_research_audit.md`、`../ln-310-multi-agent-validator/references/penalty_points.md`
**必读：** 加载 `../ln-310-multi-agent-validator/references/premortem_validation.md`、`../ln-310-multi-agent-validator/references/cross_reference_validation.md`

## 目的

- 分析目标产物或差异
- 将证据转换为规范化的发现
- 对于 `mode=story`：依据 `phase2_research_audit.md`，计算全部 30 项标准的扣分
- 对于 `mode=plan_review`：仅评估标准 #5、#6、#21、#28（不累积扣分）
- 避免仅包含叙述的审查输出

## 模式门控

- `mode=story`：完整流程——预演失败分析、交叉引用、对全部 30 项标准计算扣分、构建修复计划
- `mode=plan_review`：适用性检查、技术栈检测，仅评估标准 #5（标准）、#6（库版本）、#21（替代方案）、#28（库功能），规范化发现但不累积扣分

## 运行时

运行时系列：
- `evaluation-worker-runtime`

清单必填字段：
- `identifier`
- `phase_order`
- `summary_kind=review-findings`
- `operation=findings`

建议的 `phase_order`：
1. `PHASE_0_CONFIG`
2. `PHASE_1_LOAD_TARGET`
3. `PHASE_2_PREMORTEM`（mode=story，复杂度 >= 中等）
4. `PHASE_3_CROSS_REFERENCE`（mode=story，多用户故事 Epic）
5. `PHASE_4_CRITERIA_AUDIT`
6. `PHASE_5_PENALTY_CALCULATION`（仅限 mode=story）
7. `PHASE_6_NORMALIZE_FINDINGS`
8. `PHASE_7_WRITE_SUMMARY`
9. `PHASE_8_SELF_CHECK`

## 工作流

### 阶段 0：配置

加载运行时清单、目标标识符以及所有已链接的研究产物路径。

### 阶段 1：加载目标

仅加载审查范围所需的目标产物。

### 阶段 2：预演失败分析（mode=story）

按照 `premortem_validation.md` 执行预演失败分析：
1. 对简单用户故事跳过此步骤（1-2 个任务、无外部依赖、使用已知技术）。
2. 对复杂度 >= 中等的用户故事执行此步骤（3 个以上任务、存在外部依赖或使用不熟悉的技术）。
3. 老虎（有证据支持的风险）归入风险标准 #20——在计算扣分之前将其添加到风险表。
4. 大象（未明确说明的假设）归入假设标准 #24——使用 `[pre-mortem]` 标签添加，Confidence=LOW。
5. 纸老虎（没有证据支持的担忧）——记录并排除。
6. 在审计报告中包含预演失败分析表。

### 阶段 3：交叉引用（mode=story）

按照 `cross_reference_validation.md` 执行交叉引用分析：
1. 如果 Epic 只有 1 个用户故事，或者所有同级用户故事均为已完成/已取消，则跳过此步骤。
2. 通过 `list_issues(project=Epic.id)` 加载同级用户故事。
3. 检查 AC 重叠（#25）：优先采用结构化可追溯性，关键词回退仅作为建议。
4. 检查任务重复（#26）：以结构化匹配为主。
5. 在审计报告中包含交叉引用发现。

### 阶段 4：标准审计

1. `mode=story`：根据 `phase2_research_audit.md` 中的自动修复操作参考，对故事/任务评估全部 30 项标准。
2. `mode=plan_review`：仅评估标准 #5、#6、#21、#28（标准 + 解决方案组）。
3. 如果提供了研究证据，则根据这些证据交叉核验相关声明。

### 阶段 5：罚分计算（mode=story）

1. 使用 `phase2_research_audit.md` 中的严重程度级别，为每项违规分配罚分（CRITICAL=10、HIGH=5、MEDIUM=3、LOW=1）。
2. 根据 `penalty_points.md` 中的计算规则应用多重违规规则。
3. 计算罚分总数。
4. 为每项违规制定修复计划。
5. 根据 `penalty_points.md` 中的报告格式设置罚分审计表的格式。

### 阶段 6：规范化发现项

每个发现项应优先使用以下结构化字段：
- `id`
- `severity`
- `category`
- `subject`
- `evidence`
- `recommendation`

### 阶段 7：编写摘要

输出 `summary_kind=review-findings`。

载荷必须包括：
- `worker=ln-312`
- `status`
- `operation=findings`
- `warnings`

如果可用，优先使用以下字段：
- `findings`
- `metrics.penalty_total`（mode=story）
- `metrics.criteria_violated`（标准编号列表）
- `metrics.fix_plan`（由 {criterion, action, severity} 组成的数组）
- `metrics.premortem_summary`（执行后）
- `metrics.cross_reference_summary`（执行后）

### 阶段 8：自检

1. 删除重复项。
2. 删除缺乏依据的声明。
3. 验证罚分计算是否符合 `penalty_points.md` 的规则（mode=story）。
4. 仅在写入摘要后记录 `pass=true`。

## 完成定义

- [ ] 已加载目标产物
- [ ] 已执行预演分析，或说明了跳过的理由（mode=story）
- [ ] 已执行交叉引用，或说明了跳过的理由（mode=story）
- [ ] 已完成标准审计（故事模式为全部 30 项，其他模式为 #5/#6/#21/#28）
- [ ] 已计算罚分并制定修复计划（mode=story）
- [ ] 已规范化发现项
- [ ] 已删除缺乏依据的声明
- [ ] 已写入 `review-findings` 摘要
- [ ] 自检已通过

**版本：** 1.0.0
**最后更新：** 2026-04-10