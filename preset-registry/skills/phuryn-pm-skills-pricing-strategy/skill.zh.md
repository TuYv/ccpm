---
name: pricing-strategy
description: "Analyze and design pricing strategies including pricing models, competitive pricing analysis, willingness-to-pay estimation, and price elasticity. Use when setting prices, evaluating pricing models, preparing for a pricing change, or comparing freemium vs paid approaches."
---
## 定价策略

制定一套以价值交付、竞争定位和支付意愿为基础的定价策略。

### 背景

你正在为 **$ARGUMENTS** 制定定价策略。

如果用户提供了文件（竞争对手定价、调研数据、财务模型或使用数据），请先阅读这些文件。如有需要，使用网络搜索研究竞争对手的定价。

### 说明

1. **了解所交付的价值**：
   - 核心价值主张是什么？
   - 客户的替代方案是什么（以及其成本）？
   - 产品带来了哪些可量化的结果？（节省的时间、增加的收入、降低的成本）
   - 基于这些价值，客户的支付意愿是多少？

2. **评估定价模式** — 推荐最合适的模式：

   | 模式 | 最适合的场景 | 示例 |
   |---|---|---|
   | **固定费率** | 简单产品、成本可预测的产品 | Basecamp（$99/月固定费用） |
   | **按席位计费** | 协作工具、团队产品 | Slack、Figma |
   | **按使用量计费** | 基础设施、API 产品 | AWS、Twilio |
   | **分层定价** | 面向不同用户群体的产品 | 大多数 SaaS（免费版/专业版/企业版） |
   | **免费增值** | 具有病毒式传播效应/网络效应的产品 | Spotify、Notion |
   | **免费增值 + 按使用量计费** | 平台型产品 | Vercel、OpenAI API |
   | **基于价值定价** | 影响力较大的企业工具 | Salesforce、Palantir |

3. **分析竞争对手的定价**：
   - 梳理竞争对手的定价层级及各层级包含的内容
   - 确定你的产品所处的位置（高端、中端市场、预算型）
   - 找出定价空白或机会
   - 注意行业中的定价惯例

4. **设计定价结构**：
   - **层级**：定义 2-4 个层级，并明确区分各层级
   - **功能限制**：哪些功能应放入哪个层级？（使用价值指标，而不是任意限制）
   - **价值指标**：按什么单位收费？（用户、事件、存储空间、API 调用次数）
   - **锚定定价**：让最受欢迎的层级显得是显而易见的选择
   - **年度折扣**：通常比月度定价优惠 15-20%

5. **估算价格敏感度**：
   - 价格敏感度计（如果有调研数据）：
     - 过于便宜 → 担心质量
     - 便宜 → 物有所值
     - 昂贵 → 开始犹豫
     - 过于昂贵 → 不会购买
   - 或者，根据竞争对手的定价和所交付的价值进行估算

6. **规划定价实验**：
   - 对定价页面进行 A/B 测试（不同的价格点、层级名称、功能组合）
   - 通过创始人主导的销售沟通测试支付意愿
   - 使用不同的价格锚点进行落地页测试
   - 按价格点对转化率进行群组分析

7. **输出定价建议**：
   ```
   Recommended Model: [Model type]
   Value Metric: [What you charge on]

   | Tier | Price | Target Segment | Key Features | Positioning |
   |---|---|---|---|---|

   Key Assumptions:
   - [Assumption] → [How to test]

   Risks:
   - [Risk] → [Mitigation]
   ```

逐步思考。以 markdown 格式保存。标记出所有需要在发布前验证的假设。

---

### 延伸阅读

- [产品定价策略入门](https://www.productcompass.pm/p/product-pricing-strategies-101)
- [AI 产品定价大师课：OpenAI 产品负责人谈 SaaS 定价为何在 AI 时代失效（以及如何修复）](https://www.productcompass.pm/p/ai-product-pricing)（视频课程）