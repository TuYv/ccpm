---
name: quality-engineering-zephyr-coverage-analysis
description: Audit test coverage health, gaps, and QE debt for Jira stories or epics. Produces coverage_analysis_report.md with AC-to-TC heatmap, risk scores, and prioritized action plan. Use when assessing coverage percentage, pre-release readiness, sprint readiness, or identifying missing test cases. Do NOT use for TC creation — use zephyr-test-generation instead.
metadata:
  triggers:
    files:
    - 'coverage_analysis_report.md'
    keywords:
    - coverage analysis
    - test coverage
    - coverage gaps
    - QE debt
    - QE audit
    - pre-release readiness
    - sprint readiness
    - zephyr coverage
    - test gap
    - AC coverage
    - test-ready
---
# Zephyr 覆盖率分析

## **优先级：P1 (HIGH)**

## 工作流程

> **关键要求 — 严格阅读并遵循工作流文件。不得凭记忆或根据此描述实施。**
> 内联实施会绕过 `jira-analyst` 和 `zephyr-scanner` 子代理。

读取并执行 `.agents/workflows/zephyr-coverage-analysis.md`。

## 反模式

- **不得创建 TC**：分析为只读操作——调用 quality-engineering-zephyr-test-generation 来创建 TC。
- **不得优先使用分页**：在回退到分页之前，始终先使用 `Get Issue Link Test Cases`（直接查找）。
- **不得使用工单级平台信息**：从每个 AC 表格行的 HTML 中读取 Platform，而不是从工单标题部分读取。
- **不得合并 WEB+MOBILE 覆盖槽位**：将每个平台视为独立的覆盖槽位——Mobile covered ≠ Web covered。
- **不得跳过 QE Debt**：扫描范围不能仅限于 AC 行——始终在第 4 节中包含数据正确性、负向流程、角色差异和回归风险。

## 参考资料

- [报告模板](references/coverage_report_template.md) — 构建 coverage_analysis_report.md 时加载（工作流第 5 步）
- [影响分析协议](../quality-engineering-zephyr-test-generation/references/impact_analysis.md) — TC 发现协议
- [Zephyr 测试生成](../quality-engineering-zephyr-test-generation/SKILL.md) — 分析完成后调用，以创建缺失的 TC

## 规范响应锚点

应用此技能时，请在相关情况下保留以下领域术语，或在回答中提供等效的具体示例：
- HIGH
- P1
- QE Debt
- coverage_analysis_report.md
- covered

- 其他基于任务的精确锚点：zephyr-test-generation