---
name: ln-641-pattern-fitness-auditor
description: "Audits whether one implemented architectural pattern fits project needs and best practices. Use when checking pattern fitness."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__find_implementations, mcp__hex-graph__find_symbols, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 模式适用性审计器

**类型：** L3 工作器

用于根据最佳实践和项目需求分析单个架构模式的 L3 工作器。

## 目的与范围
- 每次调用分析一个模式（接收模式名称、位置和最佳实践）
- 查找代码库中的所有实现（Glob/Grep）
- 验证实现是否存在且有效
- 计算 4 项评分：合规性、完整性、质量、实现度
- 识别差距和问题，并估算严重程度和工作量
- 返回结构化分析结果
- 输出 `KEEP_PATTERN`、`SIMPLIFY_PATTERN`、`COMPLETE_PATTERN` 或 `REPLACE_PATTERN`

**范围之外：**
- 圈复杂度阈值（>10、>20）
- 方法/类长度阈值（>50、>100、>500 行）
- 质量评分侧重于模式特定的质量（模式内的 SOLID、模式级坏味道），而不是通用代码指标

## 输入

```
- pattern: string          # Pattern name (e.g., "Job Processing")
- locations: string[]      # Known file paths/directories
- bestPractices: object    # Best practices from MCP Ref/Context7/WebSearch
- output_dir: string       # e.g., ".hex-skills/runtime-artifacts/runs/{run_id}/audit-report"
```

> **注意：** 如果模式证据由托管运行提供，请使用该证据，而不是从头重新发现同一模式。

## 工作流

**强制阅读：** 加载 `references/mcp_tool_preferences.md`。

检测策略：使用双层检测（候选扫描，然后进行上下文验证）；仅当验证方法不明确时加载 `references/two_layer_detection.md`。
工具策略：你可能会作为隔离的子代理运行，此时宿主的 `AGENTS.md` 不在作用域内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时加载 `references/mcp_integration_patterns.md`。

当实现发现能显著提高置信度时，优先使用 `hex-graph`。如果可用，优先使用 `hex-line` 读取本地代码。如果 MCP 不可用、不受支持或尚未建立索引，则继续使用内置的 `Read/Grep/Glob/Bash`，并在报告中说明已使用回退方案。

### 阶段 1：查找实现

**强制阅读：** 加载 `references/pattern_library.md`——使用“Pattern Detection (Grep)”表中每种模式对应的检测关键字。

```
IF pattern.source == "adaptive":
  # Pattern evidence was already provided by the caller
  files = pattern.evidence.files
  SKIP detection keyword search (already done in Phase 1b)
ELSE:
  # Baseline pattern -- use library detection keywords
  files = Glob(locations)
  additional = Grep("{pattern_keywords}", "**/*.{ts,js,py,rb,cs,java}")
  files = deduplicate(files + additional)
```

### 阶段 2：读取并分析代码

```
FOR EACH file IN files (limit: 10 key files):
  Read(file)
  Extract: components, patterns, error handling, logging, tests
```

### 阶段 3：计算 4 项评分

**强制阅读：** 加载 `references/scoring_rules.md`——遵循每项标准的 Detection 列。

| 分数项 | scoring_rules.md 中的来源 | 最高分 |
|-------|---------------------------|-----|
| 合规性 | “Compliance Score”章节——行业标准、命名、约定、反模式 | 100 |
| 完整性 | “Completeness Score”章节——必需组件表（按模式）、错误处理、测试 | 100 |
| 质量 | “Quality Score”章节——方法长度、复杂度、代码异味、SOLID | 100 |
| 实现 | “Implementation Score”章节——可编译、生产环境使用、集成、监控 | 100 |

**每项标准的评分流程：**
1. 运行 scoring_rules.md 中的 Detection Grep/Glob
2. 如果找到匹配项 -> 按标准加分
3. 如果检测到反模式/代码异味 -> 按扣分表扣分
4. 记录证据：每项评分依据对应的文件路径 + 行号

### 阶段 4：识别问题和差距

```
FOR EACH bestPractice NOT implemented:
  issues.append({
    severity: "HIGH" | "MEDIUM" | "LOW",
    category: "compliance" | "completeness" | "quality" | "implementation",
    issue: description,
    suggestion: how to fix,
    effort: "S" | "M" | "L"
  })

# Layer 2 context check (MANDATORY):
# Deviation documented in code comment or ADR? -> downgrade to LOW
# Pattern intentionally simplified for project scale? -> skip


gaps = {
  missingComponents: required components not found in code,
  inconsistencies: conflicting or incomplete implementations
}
```

### 阶段 5：计算分数

**必须阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/audit_scoring.md`。

**诊断子分数**（每项 0-100）分别计算，并在 AUDIT-META 中报告，仅用于诊断：
- 合规性、完整性、质量、实现

### 阶段 6：编写报告

**必须阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作程序根据共享契约自行生成限定于本次运行的工件路径。

```
# Build pattern name slug: "Job Processing" -> "job-processing"
slug = pattern.name.lower().replace(" ", "-")

# Build markdown report in memory with:
# - AUDIT-META (extended: score [penalty-based] + diagnostic score_compliance/completeness/quality/implementation)
# - Checks table (compliance_check, completeness_check, quality_check, implementation_check)
# - Findings table (issues sorted by severity)
# - DATA-EXTENDED: {pattern, codeReferences, gaps, recommendations}

Write to {output_dir}/ln-641--{slug}.md (atomic single Write call)
```

### 阶段 7：返回摘要

```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-641--job-processing.md
Score: 7.9/10 (C:72 K:85 Q:68 I:90) | Issues: 3 (H:1 M:2 L:0)
```

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **仅限一个模式：** 仅分析输入中提供的模式
- **先阅读再评分：** 未阅读实际代码时绝不评分
- **基于检测的评分：** 使用 scoring_rules.md 中的 Grep/Glob 模式，而不是主观假设
- **工作量估算：** 始终为每个问题提供 S/M/L 估算
- **代码引用：** 发现项中始终包含文件路径
- **唯一视角：** 仅审计一个模式的架构适配性。不要审计通用代码质量、依赖拓扑、包健康状况或运行时操作。
- **必需操作：** 每个发现项使用 `KEEP_PATTERN`、`SIMPLIFY_PATTERN`、`COMPLETE_PATTERN` 或 `REPLACE_PATTERN`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 通过 Glob/Grep 找到所有实现（使用 pattern_library.md 关键词或自适应证据）
- [ ] 已读取并分析关键文件
- [ ] 使用 scoring_rules.md 检测模式计算 4 项评分
- [ ] 已识别问题，并注明严重程度、类别、建议和工作量
- [ ] 已记录差距（缺失的组件、不一致之处）
- [ ] 已提供建议
- [ ] 报告已写入 `{output_dir}/ln-641--{slug}.md`（通过单次原子 Write 调用）
- [ ] 已按照契约编写摘要

## 参考文件

- 评分规则：`references/scoring_rules.md`
- 模式库：`references/pattern_library.md`

---
**版本：** 2.0.0
**最后更新：** 2026-02-08