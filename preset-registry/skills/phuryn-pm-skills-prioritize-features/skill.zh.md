---
name: prioritize-features
description: "Prioritize a backlog of feature ideas based on impact, effort, risk, and strategic alignment with top 5 recommendations. Use when prioritizing a feature backlog, making scope decisions, or ranking product ideas."
---
## 优先排列功能待办事项

评估并排列功能创意待办事项，确定最值得推进的前 5 项。

### 上下文

你正在帮助确定 **$ARGUMENTS** 的功能优先级。

如果用户提供了文件（电子表格、待办事项列表、机会评估），请直接读取并分析这些文件。

### 领域背景

有关框架选择的指导，请参阅 `prioritization-frameworks` skill。关键建议如下：

**机会评分**（Dan Olsen，《The Lean Product Playbook》）推荐用于评估客户问题：机会评分 = 重要性 × (1 − 满意度)，标准化为 0–1。高重要性 + 低满意度 = 最佳机会。优先考虑**问题（机会）**，而不是解决方案。

对于快速评估计划，推荐使用 **ICE**：影响力（机会评分 × 客户数量）× 信心度 × 易实施度。对于规模更大的团队，**RICE** 会额外加入覆盖范围这一因素。

### 指示

用户将描述其产品目标、期望成果，并提供功能创意。请按以下步骤进行：

1. **了解优先事项**：确认产品目标和成功指标。

2. 根据以下标准**评估每项功能**：
   - **影响力**：它对期望成果的推动程度如何？如果有客户数据，请考虑机会评分。
   - **工作量**：需要投入多少开发、设计和协调工作？
   - **风险**：存在多大程度的不确定性？需要验证哪些假设？
   - **战略一致性**：它与产品愿景和当前目标的契合程度如何？

3. **推荐排名前 5 的功能**，包括：
   - 明确的排名（1-5）
   - 每项入选的简要理由
   - 所考虑的关键权衡
   - 被降低优先级的内容及其原因

4. 如果有帮助，请以优先级排序表的形式呈现。

逐步思考。如果输出内容较多，请保存为 markdown。

---

### 延伸阅读

- [Kano 模型：如何取悦客户而不沦为功能工厂](https://www.productcompass.pm/p/kano-model-how-to-delight-your-customers)
- [产品管理框架汇编 + 模板](https://www.productcompass.pm/p/the-product-frameworks-compendium)
- [持续产品探索大师班（CPDM）](https://www.productcompass.pm/p/cpdm)（视频课程）