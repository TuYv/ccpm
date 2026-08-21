---
name: common-business-requirements
description: Standardize BRD and BRD-lite discovery for business goals, stakeholder impact, current-to-future state, and measurable value outcomes. Use when creating BRD, business case, project justification, ROI narrative, or AS-IS to TO-BE scope.
metadata:
  triggers:
    files:
      - "BRD.md"
      - "docs/brd/brd-*.md"
      - "specs/*.md"
    keywords:
      - create brd
      - business requirements
      - business case
      - stakeholder impact
      - as-is to to-be
      - roi justification
---
# 业务需求专家

## **优先级：P0（关键）**

在产品或技术规格之前阐明业务“为什么”。

## 1. 探索工作流

- 起草执行摘要：目的、成果、发起人、验证负责人。
- 对于模糊的“实现 X”请求，先起草轻量版 BRD，并仅提出会造成阻塞的 BA 问题，同时提供建议的默认选项。
- 确认业务目标和成功指标。
- 识别发起人、决策者和受影响的利益相关者。
- 记录现状流程的痛点和目标状态。
- 定义范围边界、排除项、假设和约束。
- 记录价值假设：对成本、收入、风险、合规或周期时间的影响。
- **移交质量**：确定**移交负责人**（BA 负责人）和下一位承担责任的团队成员（产品经理）。
- 当利益相关者或领域术语可能被误解时，添加术语表条目。
- 当工作流复杂性会影响审批时，添加 Mermaid 现状/目标流程图。

## 2. 轻量版 BRD 起草

- 加载 `references/brd-template.md`。
- 确保每个目标都符合 SMART 原则：具体、可衡量、可实现、相关且有时限。
- 将每个 BRD 目标链接到一个候选 PRD 需求占位符（`REQ-*`）。
- **适合离岸交付**：为远程交付团队纳入利益相关者验证计划和验收期限。
- 添加成果报告初始内容：`feature_status`、`requirement_trace`、已完成/缺失的证据、所需决策以及建议的下一工作流（`plan-feature`）。
- 写入 `docs/brd/brd-[slug].md`。

## 3. 质量门禁

- 每个目标都有负责人和 KPI 目标值。
- 每个范围内事项都有相应的理由和范围外配对项。
- 风险登记册包含缓解措施负责人。
- 明确记录利益相关者的批准和未解决的决策。
- 功能行为应归入 PRD/SRS，而不是隐藏在 BRD 中。

## 反模式

- 不在 BRD 中进行解决方案设计。
- 不允许缺少基线和目标的模糊目标（“提高效率”）。
- 目标或风险不得缺少负责人。
- 在明确 BA 负责人、价值指标和范围边界之前，不得进入编码或 QA 流程。
- 获得批准后，不得在未明确说明的情况下扩大范围。
- 术语表中未收录的行话不得使用。

## 参考资料

- [BRD 模板](references/brd-template.md)
- [BRD 检查清单](references/checklist.md)
- [需求基线](references/standards-baseline.md)