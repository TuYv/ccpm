---
name: ln-640-pattern-evolution-auditor
description: "Use when auditing architectural patterns through the evaluation platform with mandatory best-practice research, coordinated pattern workers, and structured summaries."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L2 协调器  
**类别：** 6XX 审计

# 模式演进审计器

## 必读内容

**必须阅读：** 加载 `references/evaluation_coordinator_runtime_contract.md`、`references/evaluation_summary_contract.md`、`references/evaluation_research_contract.md`  
**必须阅读：** 加载 `references/audit_final_report_contract.md`  
**必须阅读：** 加载 `references/architecture_audit_worker_boundaries.md`  
**必须阅读：** 加载 `references/research_tool_fallback.md`  
条件性阅读：仅当来源可信度或声明的不确定性影响问题验证时，加载 `references/epistemic_protocol.md`。

## 目的

- 审计架构/设计演进：模式适用性、分层归属、服务/API 契约、依赖拓扑、现代化、物理结构和配置边界
- 精确协调 `ln-641` 至 `ln-647`
- 要求在模式评分前开展研究

## 运行时契约

运行时系列：
- `evaluation-runtime`

标识符：
- `pattern-audit`

阶段顺序：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_RESEARCH`
4. `PHASE_3_BOUNDARY_AUDITS`
5. `PHASE_4_PATTERN_ANALYSIS`
6. `PHASE_5_AGGREGATE`
7. `PHASE_6_REPORT`
8. `PHASE_7_SELF_CHECK`

## 工作器集合

- `ln-641-pattern-fitness-auditor`
- `ln-642-layer-ownership-boundary-auditor`
- `ln-643-api-contract-auditor`
- `ln-644-dependency-topology-auditor`
- `ln-645-architecture-modernization-auditor`
- `ln-646-project-structure-auditor`
- `ln-647-configuration-boundary-auditor`

## 工作器调用（强制）

**宿主技能调用：** 必须使用 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用技能中找到指定技能，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该技能的工作流，然后携带其结果/产物返回此处。
- 不得内联工作器逻辑，也不得在未执行目标技能的情况下将工作器标记为已完成。

对委派的工作器使用 Skill 工具。不要在协调器内部内联工作器逻辑。

TodoWrite 格式（强制）：
- `Resolve audit scope and build manifest`
- `Load architecture patterns and layers`
- `Run best-practice research`
- `Run boundary and contract audits`
- `Analyze pattern compliance and gaps`
- `Aggregate worker findings`
- `Generate final audit report and remediation plan`
- `Verify cleanup and self-check`

代表性调用：

```text
Skill(skill: "ln-641-pattern-fitness-auditor", args: "{scope}")
Skill(skill: "ln-642-layer-ownership-boundary-auditor", args: "{scope}")
Skill(skill: "ln-643-api-contract-auditor", args: "{scope}")
Skill(skill: "ln-644-dependency-topology-auditor", args: "{scope}")
Skill(skill: "ln-645-architecture-modernization-auditor", args: "{scope}")
Skill(skill: "ln-646-project-structure-auditor", args: "{scope}")
Skill(skill: "ln-647-configuration-boundary-auditor", args: "{scope}")
```

## 工作流

1. 启动 `evaluation-runtime`。
2. 识别候选模式及其适用性。
3. 首先执行强制研究：
   - 官方文档或标准
   - MCP Ref
   - 涉及库/框架模式时使用 Context7
   - 当前 Web 最佳实践研究
4. 在模式评分之前执行边界审计。
5. 仅在已有边界审计结果和研究成果后，才执行模式分析。
6. 通过读取每个工作器的 `report_path`，按照 `references/architecture_audit_worker_boundaries.md` 规范化操作、对问题去重、解决工作器冲突，并依据 `references/evaluation_research_contract.md` 验证可操作的问题，以汇总评分和工作器发现。
7. 按照 `references/audit_final_report_contract.md`，将包含修复计划的报告写入 `.hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-640--final-report.md`。
8. 删除临时工作器 Markdown 报告并记录清理证据。
9. 写入 `evaluation-coordinator` 摘要，并将 `report_path` 设置为最终报告。

## 完成定义

- [ ] 评估运行时已启动
- [ ] 模式适用性已确定
- [ ] 最佳实践研究已完成
- [ ] 边界审计摘要已记录
- [ ] 模式分析摘要已记录
- [ ] 工作器集合始终严格保持为 `ln-641` 至 `ln-647`
- [ ] 已使用 `architecture_audit_worker_boundaries.md` 解决工作器冲突
- [ ] 最终报告和修复计划已写入
- [ ] 临时工作器 Markdown 报告已删除
- [ ] `evaluation-coordinator` 摘要已写入
- [ ] 运行时已完成

## 元分析

可选参考资料：仅当用户请求运行后元分析或采用协议格式的运行反思时，才加载 `references/meta_analysis_protocol.md`。

在协调器运行完成后收到请求时，按照协议第 7 节分析会话，并在最终模式审计结果中包含协议格式的输出。

## 参考资料

- 工作器：`../ln-641-pattern-fitness-auditor/SKILL.md`、`../ln-642-layer-ownership-boundary-auditor/SKILL.md`、`../ln-643-api-contract-auditor/SKILL.md`、`../ln-644-dependency-topology-auditor/SKILL.md`、`../ln-645-architecture-modernization-auditor/SKILL.md`、`../ln-646-project-structure-auditor/SKILL.md`、`../ln-647-configuration-boundary-auditor/SKILL.md`
- 共享模式参考资料：`references/layer_rules.md`；模式和评分手册位于 `../ln-641-pattern-fitness-auditor/references/`

---
**版本：** 2.0.0
**最后更新：** 2026-02-08