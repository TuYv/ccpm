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
  version: "2.2.5"
  category: seo
---
# 竞品比较与替代方案页面

创建高转化的比较页面和替代方案页面，针对具有竞争意图的关键词，并提供准确、结构化的内容。

## 页面类型

### 1. “X vs Y”比较页面
- 直接对比两个产品/服务
- 按功能逐项进行平衡分析
- 提供清晰的结论或推荐，并说明理由
- 目标关键词：`[Product A] vs [Product B]`

### 2. “Alternatives to X”页面
- 列出某个特定产品/服务的替代方案
- 为每个替代方案提供简短摘要、优点/缺点以及最适用的场景
- 目标关键词：`[Product] alternatives`、`best alternatives to [Product]`

### 3. “Best [Category] Tools”汇总页面
- 精选某个类别中的顶级工具/服务列表
- 明确说明排名标准
- 目标关键词：`best [category] tools [year]`、`top [category] software`

### 4. 比较表页面
- 使用多列展示多个产品的功能矩阵
- 如果具有交互功能，则支持排序/筛选
- 目标关键词：`[category] comparison`、`[category] comparison chart`

## 比较表生成

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
- 所有功能声明都必须能够从公开来源核实
- 价格必须保持最新（附上“截至 [date]”的说明）
- 更新频率：每季度审核一次，或在竞品发布重大更新时审核
- 尽可能为每个竞品数据点链接来源

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

### SoftwareApplication（用于软件比较）
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
- 保持在 70 个字符以内

## 转化优化布局

### CTA 放置位置
- **首屏上方**：简短的对比摘要与主要 CTA
- **对比表格之后**："Try [Your Product] free" CTA
- **页面底部**：最终建议与 CTA
- 避免在竞争对手描述部分使用过于激进的 CTA（会降低信任度）

### 社会证明部分
- 与对比标准相关的客户评价
- G2/Capterra/TrustPilot 评分（附来源链接）
- 展示从竞争对手迁移过来的案例研究
- "Switched from [Competitor]" 故事

### 定价亮点
- 清晰的定价对比表
- 突出价值优势（而不只是最低价格）
- 包含隐藏成本（设置费用、按用户计费、超额费用）
- 链接到完整定价页面

### 信任信号
- "Last updated [date]" 时间戳
- 具备相关专业经验的作者
- 方法披露（说明对比是如何进行的）
- 披露自有产品的关联关系

## 公平性指南

- **准确性**：所有竞争对手信息都必须能够通过公开来源验证
- **不得诽谤**：绝不对竞争对手作出虚假或误导性声明
- **引用来源**：链接到竞争对手网站、评测网站或文档
- **及时更新**：竞争对手发布重大变更时进行审查和更新
- **披露关联关系**：明确说明哪个产品属于你方
- **平衡呈现**：如实承认竞争对手的优势
- **定价准确性**：所有定价数据都附上 "as of [date]" 免责声明
- **功能验证**：尽可能测试竞争对手的功能，否则引用相关文档

## 内部链接

- 从对比部分链接到自己的产品/服务页面
- 在相关对比页面之间交叉链接（例如，"A vs B" 链接到 "A vs C"）
- 讨论单项功能时，链接到对应的功能专页
- 面包屑：Home > Comparisons > [This Page]
- 在页面底部添加相关对比部分
- 链接到对比中提及的案例研究和客户评价

## 输出

### 对比页面模板
- `COMPARISON-PAGE.md`：可直接实施的页面结构，包含各个部分
- 功能矩阵表
- 内容大纲与字数目标（至少 1,500 字）

### Schema 标记
- `comparison-schema.json`：Product/SoftwareApplication/ItemList JSON-LD

### 关键词策略
- 主要关键词和次要关键词
- 相关的长尾关键词机会
- 与现有竞争对手页面相比的内容缺口

### 建议
- 改进现有对比页面的内容
- 新的对比页面机会
- Schema 标记添加项
- 转化优化建议

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 无法访问竞争对手 URL | 报告访问失败的竞争对手 URL。使用可用数据继续处理，并注明对比中的缺口。 |
| 竞争对手数据不足（价格、功能不可用） | 明确标记缺失的数据点。在对比表中使用“公开信息不可用”，而不是进行猜测。 |
| 未发现产品/服务重叠 | 报告这些产品面向不同的市场。建议其他具有功能重叠的竞争对手，或改为采用类别汇总格式。 |