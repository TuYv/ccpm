---
name: ln-630-test-auditor
description: "Use when auditing the test surface through the evaluation platform with mandatory research, coordinated test audit workers, and structured summaries."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L2 协调器  
**类别：** 6XX 审计

# 测试审计器

## 必读内容

**必须阅读：** 加载 `references/evaluation_coordinator_runtime_contract.md`、`references/evaluation_summary_contract.md`、`references/evaluation_research_contract.md`  
**必须阅读：** 加载 `references/audit_final_report_contract.md`  
**必须阅读：** 加载 `references/test_audit_worker_boundaries.md`  
**必须阅读：** 加载 `references/risk_based_testing_guide.md`、`references/research_tool_fallback.md`  
条件阅读：仅当工作器发现需要完整的方法论示例或反模式详情时，加载 `references/risk_based_testing_methodology.md`。  
条件阅读：仅当来源可信度或声明的不确定性影响问题验证时，加载 `references/epistemic_protocol.md`。

## 目的

- 通过相互独立的工作器视角审计测试套件的价值：产品行为、E2E 用户旅程、组合价值、关键覆盖率、可信度、手动证据、结构和预期结果判定强度
- 协调 `ln-631` 至 `ln-638`
- 要求研究当前的测试最佳实践

## 运行时契约

运行时系列：
- `evaluation-runtime`

标识符：
- `test-audit`

阶段顺序：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_RESEARCH`
4. `PHASE_3_DELEGATE`
5. `PHASE_4_AGGREGATE`
6. `PHASE_5_REPORT`
7. `PHASE_6_SELF_CHECK`

## 工作器集合

- `ln-631-test-business-logic-auditor`
- `ln-632-test-e2e-priority-auditor`
- `ln-633-test-value-auditor`
- `ln-634-test-coverage-auditor`
- `ln-635-test-isolation-auditor`
- `ln-636-manual-test-auditor`
- `ln-637-test-structure-auditor`
- `ln-638-test-oracle-effectiveness-auditor`

## 工作器调用（必须）

**宿主技能调用：** 必须通过 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：完全按照所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用技能中找到指定技能，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该技能工作流，然后携带其结果/产物返回此处。
- 不要内联工作器逻辑，也不要在未执行目标技能的情况下将工作器标记为已完成。

使用 Skill 工具调用委派的工作器。不要在协调器内部内联工作器逻辑。

TodoWrite 格式（必须）：
- `Resolve audit scope and build manifest`
- `Load test infrastructure and coverage`
- `Run best-practice research`
- `Delegate to domain audit workers`
- `Aggregate worker findings`
- `Generate final audit report and remediation plan`
- `Verify cleanup and self-check`

代表性调用：

```text
Skill(skill: "ln-631-test-business-logic-auditor", args: "{scope}")
Skill(skill: "ln-632-test-e2e-priority-auditor", args: "{scope}")
Skill(skill: "ln-633-test-value-auditor", args: "{scope}")
Skill(skill: "ln-634-test-coverage-auditor", args: "{scope}")
Skill(skill: "ln-635-test-isolation-auditor", args: "{scope}")
Skill(skill: "ln-636-manual-test-auditor", args: "{scope}")
Skill(skill: "ln-637-test-structure-auditor", args: "{scope}")
Skill(skill: "ln-638-test-oracle-effectiveness-auditor", args: "{scope}")
```

## 工作流

1. 启动 `evaluation-runtime`。
2. 发现自动化和手动测试范围。
3. 执行强制性研究。
4. 委派审计工作者。
5. 通过读取每个工作者的 `report_path`，根据 `references/test_audit_worker_boundaries.md` 规范化操作、去重问题、解决工作者之间的冲突，并依据 `references/evaluation_research_contract.md` 验证可操作的问题，将发现汇总为一份基于风险的测试审计报告。
6. 按照 `references/audit_final_report_contract.md`，将包含整改计划的报告写入 `.hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-630--final-report.md`。
7. 包含最终精简分组：删除低价值测试、合并重复测试、重写为面向产品行为的测试、添加缺失的基于风险的测试，以及保留高价值的回归/业务风险测试。
8. 删除临时工作者 Markdown 报告并记录清理证据。
9. 写入 `evaluation-coordinator` 摘要，并将 `report_path` 设置为最终报告。

## 完成定义

- [ ] 已启动评估运行时
- [ ] 已发现测试范围
- [ ] 已完成强制性研究
- [ ] 已记录所有计划中的工作者摘要
- [ ] 已使用 `test_audit_worker_boundaries.md` 解决工作者之间的冲突
- [ ] 已写入最终报告和整改计划
- [ ] 已删除临时工作者 Markdown 报告
- [ ] 已写入 `evaluation-coordinator` 摘要
- [ ] 运行时已完成

## 元分析

可选参考：仅当用户要求进行运行后元分析或按协议格式进行运行反思时，才加载 `references/meta_analysis_protocol.md`。

当在协调器运行后收到请求时，按照协议第 7 节分析会话，并在最终测试审计结果中包含按协议格式生成的输出。

## 参考资料

- 工作者：`../ln-631-test-business-logic-auditor/SKILL.md`、`../ln-632-test-e2e-priority-auditor/SKILL.md`、`../ln-633-test-value-auditor/SKILL.md`、`../ln-634-test-coverage-auditor/SKILL.md`、`../ln-635-test-isolation-auditor/SKILL.md`、`../ln-636-manual-test-auditor/SKILL.md`、`../ln-637-test-structure-auditor/SKILL.md`、`../ln-638-test-oracle-effectiveness-auditor/SKILL.md`

---
**版本：** 4.0.0
**最后更新：** 2025-12-23