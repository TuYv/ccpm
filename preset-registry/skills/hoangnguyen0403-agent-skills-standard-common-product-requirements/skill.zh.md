---
name: common-product-requirements
description: Standardize PRD discovery and drafting for product scope, user outcomes, requirement IDs, and acceptance criteria. Use when creating PRD, product requirements, feature specification, or acceptance criteria plan.
metadata:
  triggers:
    files:
      - "PRD.md"
      - "docs/prd/prd-*.md"
      - "specs/*.md"
    keywords:
      - create prd
      - product requirements
      - draft requirements
      - new feature spec
      - acceptance criteria
---
# 产品需求专家

## **优先级：P0（关键）**

**角色**：由 PM 负责的产品规格负责人。在技术设计或实施之前定义产品的“做什么”。

## 1. 探索阶段（迭代式）

- **上下文注入**：询问关联的 BRD 目标和业务成功指标。
- **差距分析**：识别缺失信息（问题、角色画像/JTBD、用例、指标、平台、流程、约束、优先级、分析、发布、开放问题）。
- **主动询问**：
- 每次提出 3-5 个澄清问题。
- **必须**提供 (a, b, c) 选项以降低用户操作成本。
- _示例_：“目标平台？a) Web b) Mobile c) Both”
- **重复**：持续进行，直到达到`可执行状态`。

## 2. 起草阶段（记录系统）

- **文件系统**：确保 `docs/prd/` 存在。
- **加载模板**：读取 `references/prd-template.md`。
- **Slug 对齐**：使用源文件 `docs/brd/brd-[slug].md` 中相同的 `[slug]`，以保持文件名级别的可追溯性。
- **填充与修正**：将探索阶段的答案映射到模板。将未知项标记为 `TBD`。
- **可追溯性**：分配稳定的 `REQ-*` 和 `AC-*` ID，并将每项需求映射到 BRD 目标引用。
- **用户故事**：要求明确的角色画像、清晰的业务价值，并进行 INVEST 自检。
- **验收标准**：对于可能被误解的行为，使用 Given/When/Then；覆盖正常、边界和负向路径。
- **实施门禁**：在每个切片明确 `REQ-*`、`AC-*`、负责人、状态、优先级和验证通道之前，不得移交给工程团队。
- **移交质量**：明确需求负责人、状态，并定义发布/运维。确定是否需要 `design-solution`。
- **就绪路径**：缺少 PRD/AC 证明的现有代码属于部分完成/未验证；通过 `implementation-readiness` 处理。
- **结果报告**：包括 `feature_status`、需求追踪、已完成/缺失的证据、所需决策和建议的下一工作流。
- **动态规格**：包括分析、风险、发布、决策和变更日志。
- **输出**：写入 `docs/prd/prd-[slug].md`。

## 3. 验证检查清单（必需）

- [ ] **功能**：是否定义了所有用户流程？
- [ ] **可追溯性**：每个 AC 是否都映射到 `REQ-*` 和业务目标？
- [ ] **非功能性**：性能？安全性？离线模式？
- [ ] **分析/运维**：事件、护栏、发布和支持就绪情况？
- [ ] **技术约束**：对 DB schema 的影响？API 变更？
- [ ] **边界情况**：空状态？错误状态？
- [ ] **范围规范**：是否明确列出了范围外事项？

## 反模式

- **不得假设**：绝不猜测业务逻辑。应主动询问。
- **不得含糊**：将“快速”改为“加载 < 200ms”。
- **不得涉及实施**：PRD = “做什么”，Implementation Plan = “怎么做”。
- **AC 完成前不得编码**：如果缺少 AC、负责人或 RACI，则退回 PM 规划流程。
- **离岸移交**：在开发开始前，明确包含 PM/BA/Engineering/QA **RACI**，并指定验证负责人。
- **不得存在孤立需求**：每项需求都必须有负责人、状态和关联目标。
- **不得混淆 BRD/SRS**：将纯业务事项交由 BRD skill 处理，将技术契约事项交由 SRS skill 处理。
- **不得使用泛化参与者**：用具体角色或角色画像替换“用户”。

## 参考资料

- [完整 PRD 模板](references/prd-template.md)
- [验证检查清单](references/checklist.md)

## 负责人检查清单

- 为每项需求或发布决策记录产品负责人、工程负责人和 QA/发布负责人。

## 规范响应锚点

应用此技能时，请在相关情况下保留以下领域术语或同等具体示例：
- Discovery,What outcome,Which channels
- docs/prd
- implementation-readiness