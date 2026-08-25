---
name: prioritize-assumptions
description: "Prioritize assumptions using an Impact × Risk matrix and suggest experiments for each. Use when triaging a list of assumptions, deciding what to test first, or applying the assumption prioritization canvas."
---
## 为假设排序

使用影响 × 风险矩阵对假设进行分级，并提出有针对性的实验。

### 上下文

你正在帮助确定 **$ARGUMENTS** 中假设的优先级。

如果用户提供了包含假设或研究数据的文件，请先阅读这些文件。

### 领域背景

**ICE** 适用于假设排序：影响（机会得分 × 客户数量）× 信心度（1–10）× 易行性（1–10）。机会得分 = 重要性 × (1 − 满意度)，并标准化为 0–1（Dan Olsen）。**RICE** 将影响拆分为触达范围 × 影响，分别计算：(R × I × C) / E。有关完整公式和模板，请参阅 `prioritization-frameworks` skill。

### 指令

用户将提供一个需要排序的假设列表。应用以下框架：

1. **对于每个假设**，评估两个维度：
   - **影响**：验证该假设所创造的价值，以及受影响的客户数量（在 ICE 中：影响 = 机会得分 × 客户数量）
   - **风险**：定义为 (1 - 信心度) × 工作量

2. 使用影响 × 风险矩阵对每个假设进行**分类**：
   - **低影响、低风险** → 延后测试，直到处理完优先级更高的假设
   - **高影响、低风险** → 进入实施阶段（低风险、高回报）
   - **低影响、高风险** → 放弃该想法（不值得投入）
   - **高影响、高风险** → 设计实验对其进行测试

3. **对于需要测试的每个假设**，提出一个实验，该实验应：
   - 以最小工作量最大化经验证的学习成果
   - 衡量实际行为，而非观点
   - 具有明确的成功指标和阈值

4. 将结果以优先级矩阵或表格的形式**呈现**。

请逐步思考。如果输出内容较多，请保存为 markdown。

---

### 延伸阅读

- [假设优先级画布：如何识别并测试正确的假设](https://www.productcompass.pm/p/assumption-prioritization-canvas)
- [持续产品探索大师课（CPDM）](https://www.productcompass.pm/p/cpdm)（视频课程）