---
name: analyze-feature-requests
description: "Analyze and prioritize a list of feature requests by theme, strategic alignment, impact, effort, and risk. Use when reviewing customer feature requests, triaging a backlog, or making prioritization decisions."
---
## 分析功能请求

根据产品目标，对客户功能请求进行分类、评估并确定优先级。

### 背景

你正在分析针对 **$ARGUMENTS** 的功能请求。

如果用户提供了文件（包含功能请求的电子表格、CSV 或文档），请直接读取并分析。如果数据采用结构化格式，请考虑创建汇总表。

### 领域背景

绝不允许客户设计解决方案。应优先考虑**机会（问题）**，而不是功能。使用**机会评分**（Dan Olsen）评估客户报告的问题：机会评分 = 重要性 ×（1 − 满意度），并将其归一化到 0–1。有关完整详情和模板，请参阅 `prioritization-frameworks` skill。

### 说明

用户将描述其产品目标并提供功能请求。请按照以下步骤开展工作：

1. **理解目标**：确认将用于指导优先级排序的产品目标和预期成果。

2. **将请求归类为主题**：将相关请求归为一组，并为每个主题命名。

3. **评估战略一致性**：针对每个主题，评估其与既定目标的一致程度。

4. **确定排名前三的功能**，依据如下：
   - **影响**：客户价值和受影响的用户数量
   - **投入**：所需的开发和设计资源
   - **风险**：技术和市场不确定性
   - **战略一致性**：与产品愿景和目标的契合度

5. **针对每个排名靠前的功能**，提供：
   - 理由（客户需求、战略一致性）
   - 值得考虑的替代解决方案
   - 高风险假设
   - 如何以最小投入测试这些假设

逐步思考。保存为 Markdown 或创建结构化输出文档。

---

### 延伸阅读

- [Kano 模型：如何在不沦为功能工厂的情况下取悦客户](https://www.productcompass.pm/p/kano-model-how-to-delight-your-customers)
- [持续产品发现大师课（CPDM）](https://www.productcompass.pm/p/cpdm)（视频课程）