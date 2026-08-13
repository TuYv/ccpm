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
  version: "2.2.4"
  category: seo
---
# 竞品对比与替代方案页面

创建高转化率的对比与替代方案页面，通过准确、结构化的内容定位具有竞品比较意图的关键词。

## 页面类型

### 1. “X vs Y”对比页面
- 对两款产品/服务进行直接的一对一比较
- 按功能进行均衡分析
- 给出明确的结论或建议，并说明理由
- 目标关键词：`[Product A] vs [Product B]`

### 2. “X 的替代方案”页面
- 列出特定产品/服务的替代方案
- 为每个替代方案提供简要概述、优缺点和最适合的使用场景
- 目标关键词：`[Product] alternatives`、`best alternatives to [Product]`

### 3. “最佳[类别]工具”榜单页面
- 精选某一类别中的顶级工具/服务
- 明确说明排名标准
- 目标关键词：`best [category] tools [year]`、`top [category] software`

### 4. 对比表页面
- 以多款产品为列的功能矩阵
- 如果是交互式页面，应支持排序/筛选
- 目标关键词：`[category] comparison`、`[category] comparison chart`

## 对比表生成

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
- 定价必须为最新价格（包含“截至[日期]”的说明）
- 更新频率：每季度审查一次，或在竞品发布重大变更时进行审查
- 尽可能为每个竞品数据点提供来源链接

## Schema 标记建议

### 包含 AggregateRating 的 Product Schema
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

### ItemList（用于榜单页面）
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

### 比较意图模式
| 模式 | 示例 | 搜索量信号 |
|---------|---------|---------------------|
| `[A] vs [B]` | "Slack vs Teams" | 高 |
| `[A] alternative` | "Figma alternatives" | 高 |
| `[A] alternatives [year]` | "Notion alternatives 2026" | 高 |
| `best [category] tools` | "best project management tools" | 高 |
| `[A] vs [B] for [use case]` | "AWS vs Azure for startups" | 中 |
| `[A] review [year]` | "Monday.com review 2026" | 中 |
| `[A] vs [B] pricing` | "HubSpot vs Salesforce pricing" | 中 |
| `is [A] better than [B]` | "is Notion better than Confluence" | 中 |

### 标题标签公式
- X 与 Y 对比：`[A] vs [B]: [Key Differentiator] ([Year])`
- 替代方案：`[N] Best [A] Alternatives in [Year] (Free & Paid)`
- 汇总：`[N] Best [Category] Tools in [Year], Compared & Ranked`

### H1 模式
- 与标题标签的意图保持一致
- 自然地包含主要关键词
- 保持在 70 个字符以内

## 转化优化布局

### CTA 放置位置
- **首屏**：简短的比较摘要和主要 CTA
- **比较表之后**："免费试用 [Your Product]" CTA
- **页面底部**：最终建议和 CTA
- 避免在竞品介绍部分使用过于激进的 CTA（会降低信任度）

### 社会认同部分
- 与比较标准相关的客户评价
- G2/Capterra/TrustPilot 评分（附来源链接）
- 展示从竞品迁移的案例研究
- “从 [Competitor] 迁移而来”的故事

### 定价亮点
- 清晰的定价比较表
- 突出价值优势（而不仅仅是最低价格）
- 包含隐藏成本（设置费、按用户计费、超额费用）
- 链接到完整的定价页面

### 信任信号
- “最后更新于 [date]”时间戳
- 具备相关专业知识的作者
- 披露方法论（说明如何进行比较）
- 披露与自有产品的关联

## 公平性准则

- **准确性**：所有竞品信息都必须能够通过公开来源验证
- **不得诽谤**：绝不对竞品作出虚假或误导性陈述
- **引用来源**：链接到竞品网站、评测网站或文档
- **及时更新**：竞品发布重大变更时进行审查和更新
- **披露关联**：明确说明哪个产品是你的
- **平衡呈现**：如实承认竞品的优势
- **定价准确性**：所有定价数据都应包含“截至 [date]”的免责声明
- **功能验证**：尽可能测试竞品功能，否则应引用相关文档

## 内部链接

- 从比较部分链接到你自己的产品/服务页面
- 在相关比较页面之间交叉链接（例如，“A vs B”链接到“A vs C”）
- 讨论具体功能时，链接到对应的功能页面
- 面包屑：首页 > 比较 > [This Page]
- 在页面底部添加相关比较部分
- 链接到比较中提及的案例研究和客户评价

## 输出

### 比较页面模板
- `COMPARISON-PAGE.md`：包含各部分、可直接实施的页面结构
- 功能矩阵表
- 包含字数目标的内容大纲（至少 1,500 字）

### Schema 标记
- `comparison-schema.json`：Product/SoftwareApplication/ItemList JSON-LD

### 关键词策略
- 主要和次要关键词
- 相关长尾关键词机会
- 与现有竞品页面相比的内容缺口

### 建议
- 改进现有对比页面的内容
- 创建新对比页面的机会
- 添加 Schema 标记
- 转化率优化建议

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 竞品 URL 无法访问 | 报告无法访问的竞品 URL。使用可用数据继续分析，并注明对比中的信息缺口。 |
| 竞品数据不足（定价、功能不可用） | 明确标示缺失的数据点。在对比表中使用“未公开提供”，而不是猜测。 |
| 未发现产品/服务重叠 | 说明这些产品面向不同市场。建议具有功能重叠的其他竞品，或改用同类产品汇总形式。 |