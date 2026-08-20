---
name: ln-620-codebase-auditor
description: "Use when auditing the codebase through the evaluation platform with mandatory research, coordinated domain audit workers, and structured summaries."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L2 协调器
**类别：** 6XX 审计

# 代码库审计器

## 必读内容

**必须阅读：** 加载 `references/evaluation_coordinator_runtime_contract.md`、`references/evaluation_summary_contract.md`、`references/evaluation_research_contract.md`
**必须阅读：** 加载 `references/audit_final_report_contract.md`
**必须阅读：** 加载 `references/codebase_audit_worker_boundaries.md`
**必须阅读：** 加载 `references/research_tool_fallback.md`
条件式阅读：仅当来源可信度或声明的不确定性会影响问题验证时，才加载 `references/epistemic_protocol.md`。

## 目的

- 审计运行时/代码库风险：安全性、交付门禁、依赖项/复用健康度、可维护性、死代码、可诊断性、并发、生命周期和配置验证
- 精确协调 `ln-621` 至 `ln-629`
- 要求在评分前进行具备技术栈针对性的研究

## 运行时契约

运行时系列：
- `evaluation-runtime`

标识符：
- `codebase-audit`

阶段顺序：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_RESEARCH`
4. `PHASE_3_DELEGATE`
5. `PHASE_4_AGGREGATE`
6. `PHASE_5_REPORT`
7. `PHASE_6_SELF_CHECK`

## 工作器集合

- `ln-621-security-boundary-auditor`
- `ln-622-build-delivery-gate-auditor`
- `ln-623-duplication-overabstraction-auditor`
- `ln-624-code-maintainability-hotspot-auditor`
- `ln-625-dependency-reuse-auditor`
- `ln-626-dead-code-pruning-auditor`
- `ln-627-diagnosability-auditor`
- `ln-628-concurrency-correctness-auditor`
- `ln-629-runtime-lifecycle-config-auditor`

## 工作器调用（强制）

**宿主技能调用：** 必须使用 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用技能中找到指定技能，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该技能工作流，然后携带其结果/产物返回此处。
- 不得内联工作器逻辑，也不得在未执行目标技能的情况下将工作器标记为已完成。

使用 Skill 工具调用委派的工作器。不得在协调器内部内联工作器逻辑。

TodoWrite 格式（强制）：
- `Resolve audit scope and build manifest`
- `Load codebase structure and stack`
- `Run best-practice research`
- `Delegate to domain audit workers`
- `Aggregate worker findings`
- `Generate final audit report and remediation plan`
- `Verify cleanup and self-check`

代表性调用：

```text
Skill(skill: "ln-621-security-boundary-auditor", args: "{scope}")
Skill(skill: "ln-622-build-delivery-gate-auditor", args: "{scope}")
Skill(skill: "ln-623-duplication-overabstraction-auditor", args: "{scope}")
Skill(skill: "ln-624-code-maintainability-hotspot-auditor", args: "{scope}")
Skill(skill: "ln-625-dependency-reuse-auditor", args: "{scope}")
Skill(skill: "ln-626-dead-code-pruning-auditor", args: "{scope}")
Skill(skill: "ln-627-diagnosability-auditor", args: "{scope}")
Skill(skill: "ln-628-concurrency-correctness-auditor", args: "{scope}")
Skill(skill: "ln-629-runtime-lifecycle-config-auditor", args: "{scope}")
```

## 工作流

### 阶段 0：配置

以 `required_research=true` 启动 `evaluation-runtime`。

### 阶段 1：发现

检测项目类型、技术栈以及审计工作器的适用性。

### 阶段 2：研究

强制要求的研究来源：
1. 官方文档或标准
2. MCP Ref
3. 当框架文档相关时使用 Context7
4. 当前的 Web 最佳实践研究

### 阶段 3：委派

向适用的审计工作器委派任务。子工作器必须使用 `evaluation-worker-runtime`，并生成与评估兼容的摘要。

### 阶段 4：汇总

使用 `references/codebase_audit_worker_boundaries.md` 合并运行时/代码库风险发现。读取每个工作器的 `report_path`，规范化行动项，去除重复问题，解决工作器之间的冲突，并按照 `references/evaluation_research_contract.md` 中的研究来源顺序验证每个可行动问题。

### 阶段 5：报告

按照 `references/audit_final_report_contract.md` 编写 `.hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-620--final-report.md`。包含修复计划、每个已确认问题由来源支持的验证结果，以及清理说明。整合完成后删除临时工作器 Markdown 报告。`evaluation-coordinator` 摘要的 `report_path` 必须仅指向最终报告。

### 阶段 6：自检

必需检查项：
- [ ] 研究已完成
- [ ] 所有适用的工作器摘要均已记录
- [ ] 已使用 `codebase_audit_worker_boundaries.md` 解决工作器冲突
- [ ] 汇总已完成
- [ ] 最终修复报告已编写
- [ ] 清理已验证
- [ ] 临时工作器 Markdown 报告已删除
- [ ] 协调器摘要已记录

## 摘要契约

写入 `summary_kind=evaluation-coordinator`。

## 完成定义

- [ ] 评估运行时已启动
- [ ] 适用的工作器已选择
- [ ] 研究已完成
- [ ] 所有适用的工作器摘要均已记录
- [ ] 工作器集合始终严格保持为 `ln-621` 至 `ln-629`
- [ ] 已使用 `codebase_audit_worker_boundaries.md` 解决工作器冲突
- [ ] 最终报告和修复计划已编写
- [ ] 临时工作器 Markdown 报告已删除
- [ ] `evaluation-coordinator` 摘要已编写
- [ ] 运行时已完成

## 元分析

可选参考：仅当用户请求运行后元分析或采用协议格式的运行反思时，加载 `references/meta_analysis_protocol.md`。

在协调器运行后收到请求时，按照协议第 7 节分析会话，并在最终代码库审计结果中包含采用协议格式的输出。

## 参考资料

- 工作器：`../ln-621-security-boundary-auditor/SKILL.md`、`../ln-622-build-delivery-gate-auditor/SKILL.md`、`../ln-623-duplication-overabstraction-auditor/SKILL.md`、`../ln-624-code-maintainability-hotspot-auditor/SKILL.md`、`../ln-625-dependency-reuse-auditor/SKILL.md`、`../ln-626-dead-code-pruning-auditor/SKILL.md`、`../ln-627-diagnosability-auditor/SKILL.md`、`../ln-628-concurrency-correctness-auditor/SKILL.md`、`../ln-629-runtime-lifecycle-config-auditor/SKILL.md`

---
**版本：** 5.0.0
**最后更新：** 2025-12-23