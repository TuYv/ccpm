---
name: ln-610-docs-auditor
description: "Use when auditing project documentation through the evaluation platform with mandatory research, coordinated audit workers, and structured summaries."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L2 协调器  
**类别：** 6XX 审计

# 文档审计器

## 必读内容

**必须阅读：** 加载 `references/evaluation_coordinator_runtime_contract.md`、`references/evaluation_summary_contract.md`、`references/evaluation_research_contract.md`  
**必须阅读：** 加载 `references/audit_final_report_contract.md`  
**必须阅读：** 加载 `references/research_tool_fallback.md`  
条件性阅读：仅当来源可信度或声明不确定性影响问题验证时，加载 `references/epistemic_protocol.md`。

## 目的

- 审计文档结构、相关性、注释和事实准确性
- 协调 `ln-611`、`ln-612`、`ln-613`、`ln-614`
- 在最终评分前要求提供有研究依据的标准

## 运行时契约

运行时系列：
- `evaluation-runtime`

标识符：
- `docs-audit`

阶段顺序：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_RESEARCH`
4. `PHASE_3_DELEGATE`
5. `PHASE_4_AGGREGATE`
6. `PHASE_5_REPORT`
7. `PHASE_6_SELF_CHECK`

## 工作器集合

- `ln-611-docs-structure-auditor`
- `ln-612-semantic-content-auditor`
- `ln-613-code-comments-auditor`
- `ln-614-docs-fact-checker`

## 工作器调用（必须）

**宿主技能调用：** 必须通过 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用技能中找到指定技能，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该技能工作流，然后携其结果/产物返回此处。
- 不得内联工作器逻辑，也不得在未执行目标技能的情况下将工作器标记为已完成。

使用 Skill 工具调用委派的工作器。不要在协调器中内联工作器逻辑。

TodoWrite 格式（必须）：
- `Resolve audit scope and build manifest`
- `Load project documentation tree`
- `Run best-practice research`
- `Delegate to domain audit workers`
- `Aggregate worker findings`
- `Generate final audit report and remediation plan`
- `Verify cleanup and self-check`

代表性调用：

```text
Skill(skill: "ln-611-docs-structure-auditor", args: "{scope}")
Skill(skill: "ln-612-semantic-content-auditor", args: "{scope}")
Skill(skill: "ln-613-code-comments-auditor", args: "{scope}")
Skill(skill: "ln-614-docs-fact-checker", args: "{scope}")
```

## 工作流

### 阶段 0：配置

以 `required_research=true` 启动 `evaluation-runtime`。

### 阶段 1：发现

发现文档覆盖面并确定范围。

### 阶段 2：研究

必需的研究来源：
1. 官方文档或标准
2. MCP Ref
3. 当框架文档相关时使用 Context7
4. 当前的 Web 最佳实践研究

### 阶段 3：委派

委派专业审计工作器。

子工作器必须使用 `evaluation-worker-runtime`，并生成与评估兼容的摘要，通过 `evaluation-runtime` 进行记录。

### 阶段 4：汇总

将工作器摘要合并为一个文档审计结果。读取每个工作器的 `report_path`，规范化发现项，去除重复问题，并按照 `references/evaluation_research_contract.md` 中的研究来源顺序验证每个可操作问题。

### 阶段 5：报告

按照 `references/audit_final_report_contract.md` 编写 `.hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-610--final-report.md`。包括修复计划、每个已确认问题的来源支持验证，以及清理说明。合并后删除临时工作器 Markdown 报告。`evaluation-coordinator` 摘要中的 `report_path` 必须仅指向最终报告。

### 阶段 6：自检

必需检查：
- [ ] 已完成强制研究
- [ ] 已记录所有工作器摘要
- [ ] 聚合摘要已存在
- [ ] 已编写最终修复报告
- [ ] 已删除临时工作器 Markdown 报告
- [ ] 已验证清理
- [ ] 已记录协调器摘要

## 摘要契约

写入 `summary_kind=evaluation-coordinator`。

## 完成定义

- [ ] 评估运行时已启动
- [ ] 研究已完成
- [ ] 所有文档审计工作器均已完成
- [ ] 聚合已完成
- [ ] 最终报告和修复计划已编写
- [ ] 临时工作器 Markdown 报告已删除
- [ ] `evaluation-coordinator` 摘要已编写
- [ ] 运行时已完成

## 元分析

可选参考：仅当用户要求进行运行后元分析或采用协议格式的运行反思时，才加载 `references/meta_analysis_protocol.md`。

在协调器运行结束后收到请求时，按照协议第 7 节分析会话，并将协议格式的输出与最终文档审计结果一并提供。

## 参考资料

- 工作器：`../ln-611-docs-structure-auditor/SKILL.md`、`../ln-612-semantic-content-auditor/SKILL.md`、`../ln-613-code-comments-auditor/SKILL.md`、`../ln-614-docs-fact-checker/SKILL.md`

---
**版本：** 5.0.0
**最后更新：** 2026-03-01