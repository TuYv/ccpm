---
name: seo-competitor-pages
description: >
  Generate SEO-optimized competitor comparison and alternatives pages. Covers
  "X vs Y" layouts, "alternatives to X" pages, feature matrices, schema markup,
  and conversion optimization. Use when user says "comparison page", "vs page",
  "alternatives page", "competitor comparison", "X vs Y", "versus",
  "compare competitors", or "alternative to".
user-invocable: true
argument-hint: "[url or generate] [competitor]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.3.1"
  category: seo
---
# 竞争对比与替代方案页面

创建高转化的对比页面和替代方案页面，覆盖具有竞争意图的关键词，并提供准确、结构化的内容。

## 页面类型

### 1. “X vs Y”对比页面
- 对两款产品/服务进行直接的正面对比
- 按功能逐项进行平衡分析
- 提供明确的结论或推荐，并说明理由
- 目标关键词：`[Product A] vs [Product B]`

### 2. “X 的替代方案”页面
- 列出某款产品/服务的替代方案
- 为每个替代方案提供简短摘要、优点/缺点以及最适合的使用场景
- 目标关键词：`[Product] alternatives`、`best alternatives to [Product]`

### 3. “最佳 [Category] 工具”汇总页面
- 汇总某个类别中精选的顶级工具/服务
- 明确说明排名标准
- 目标关键词：`best [category] tools [year]`、`top [category] software`

### 4. 对比表格页面
- 在列中展示多个产品的功能矩阵
- 如果具有交互性，可支持排序/筛选
- 目标关键词：`[category] comparison`、`[category] comparison chart`

## 对比表格生成

### 功能矩阵布局
```
| Feature          | Your Product | Competitor A | Competitor B |
|------------------|:------------:|:------------:|:------------:|
| Feature 1        | ✅           | ✅           | ❌           |
| Feature 2        | ✅           | ⚠️ Partial   | ✅           |
| Feature 3        | ✅           | ❌           | ❌           |
| Pricing (from)   | $X/mo        | $Y/mo        | $Z/mo        |
| Free Tier        | ✅           | ❌           | ✅           |
```

### 数据准确性要求
- 所有功能声明都必须能够通过公开来源验证
- 定价必须保持最新，并注明“截至 [date]”的说明
- 更新频率：每季度审核一次，或在竞争对手发布重大变更时审核
- 尽可能为每个竞争对手的数据点添加来源链接

## Schema 标记建议

### 带有 AggregateRating 的 Product Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Product Name]",
  "description": "[Product Description]",
  "brand": {
    "@type": "Brand",
    "name": "[Brand Name]"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "[Rating]",
    "reviewCount": "[Count]",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

### SoftwareApplication（用于软件对比）
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[Software Name]",
  "applicationCategory": "[Category]",
  "operatingSystem": "[OS]",
  "offers": {
    "@type": "Offer",
    "price": "[Price]",
    "priceCurrency": "USD"
  }
}
```

### ItemList（用于汇总页面）
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Best [Category] Tools [Year]",
  "itemListOrder": "https://schema.org/ItemListOrderDescending",
  "numberOfItems": "[Count]",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "[Product Name]",
      "url": "[Product URL]"
    }
  ]
}
```

## 关键词定位

### 对比意图模式
| 模式 | 示例 | 搜索量信号 |
|---------|---------|-----|
| `[A] vs [B]` | "Slack vs Teams" | 高 |
| `[A] alternative` | "Figma alternatives" | 高 |
| `[A] alternatives [year]` | "Notion alternatives 2026" | 高 |
| `best [category] tools` | "best project management tools" | 高 |
| `[A] vs [B] for [use case]` | "AWS vs Azure for startups" | 中 |
| `[A] review [year]` | "Monday.com review 2026" | 中 |
| `[A] vs [B] pricing` | "HubSpot vs Salesforce pricing" | 中 |
| `is [A] better than [B]` | "is Notion better than Confluence" | 中 |

### Title Tag 公式
- X vs Y：`[A] vs [B]: [Key Differentiator] ([Year])`
- 替代方案：`[N] Best [A] Alternatives in [Year] (Free & Paid)`
- 汇总：`[N] Best [Category] Tools in [Year], Compared & Ranked`

### H1 模式
- 匹配 title tag 的意图
- 自然地包含主要关键词
- 控制在 70 个字符以内

## 转化优化布局

### CTA 放置位置
- **首屏上方**：简短的对比摘要以及主要 CTA
- **对比表格之后**："免费试用 [Your Product]" CTA
- **页面底部**：最终建议以及 CTA
- 避免在竞品介绍部分放置过于激进的 CTA（会降低可信度）

### 社会证明部分
- 与对比标准相关的客户评价
- G2/Capterra/TrustPilot 评分（附来源链接）
- 展示从竞品迁移的案例研究
- “从 [Competitor] 切换过来”的故事

### 定价重点
- 清晰的定价对比表
- 突出价值优势，而不仅仅是最低价格
- 纳入隐藏成本（设置费用、按用户计费、超额费用）
- 链接到完整的定价页面

### 信任信号
- “最后更新于 [date]”时间戳
- 具备相关专业知识的作者
- 方法论披露（说明如何进行对比）
- 披露自有产品的关联关系

## 公平性指南

- **准确性**：所有竞品信息都必须能够通过公开来源验证
- **不得诽谤**：绝不对竞品作出虚假或误导性陈述
- **引用来源**：链接到竞品网站、评测网站或文档
- **及时更新**：竞品发布重大变更时进行检查和更新
- **披露关联关系**：明确说明哪个产品属于自己
- **平衡呈现**：诚实地承认竞品的优势
- **定价准确性**：所有定价数据都添加“截至 [date]”免责声明
- **功能验证**：尽可能测试竞品功能，否则引用相关文档

## 内部链接

- 从对比部分链接到自己的产品/服务页面
- 在相关对比页面之间交叉链接（例如，“A vs B”链接到“A vs C”）
- 讨论单项功能时，链接到具体功能页面
- 面包屑：Home > Comparisons > [This Page]
- 在页面底部添加相关对比部分
- 链接到对比中提及的案例研究和客户评价

## 输出

### 对比页面模板
- `COMPARISON-PAGE.md`：包含各部分的可直接实施的页面结构
- 功能矩阵表
- 内容大纲及字数目标（至少 1,500 字）

### Schema 标记
- `comparison-schema.json`：Product/SoftwareApplication/ItemList JSON-LD

### 关键词策略
- 主要和次要关键词
- 相关的长尾关键词机会
- 与现有竞争对手页面相比的内容缺口

### 建议
- 改进现有对比页面的内容
- 新的对比页面机会
- Schema 标记补充
- 转化率优化建议

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 竞争对手 URL 无法访问 | 报告哪些竞争对手 URL 访问失败。使用可用数据继续，并注明对比中的数据缺口。 |
| 竞争对手数据不足（无法获取价格、功能等信息） | 明确标记缺失的数据点。在对比表中使用“未公开”而不是猜测。 |
| 未发现产品/服务之间的重叠 | 报告这些产品面向不同的市场。建议具有相似功能的其他竞争对手，或改为分类汇总格式。 |