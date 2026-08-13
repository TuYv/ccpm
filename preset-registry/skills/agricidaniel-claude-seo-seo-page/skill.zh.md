---
name: seo-page
description: >
  Deep single-page SEO analysis covering on-page elements, content quality,
  technical meta tags, schema, images, and performance. Use when user says
  "analyze this page", "check page SEO", "single URL", "check this page",
  "page analysis", or provides a single URL for review.
user-invocable: true
argument-hint: "[url]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.4"
  category: seo
---
# 单页面分析

## 分析内容

### 页面 SEO
- 标题标签：50-60 个字符，包含主要关键词，且具有唯一性
- Meta 描述：150-160 个字符，具有吸引力，包含关键词
- H1：有且仅有一个，符合页面意图，包含关键词
- H2-H6：层级结构合理（不跳级），描述清晰
- URL：简短、具有描述性、使用连字符、不含参数
- 内部链接：数量充足，锚文本相关，不存在孤立页面
- 外部链接：指向权威来源，数量合理

### 内容质量
- 字数是否达到对应页面类型的最低要求（参见 quality-gates.md）
- 可读性：Flesch 阅读易读性评分、年级水平
- 关键词密度：自然（1-3%），包含语义变体
- E-E-A-T 信号：作者简介、资质证明、第一手经验标志
- 内容新鲜度：发布日期、最后更新日期

### 技术元素
- Canonical 标签：存在，指向自身或设置正确
- Meta robots：除非有意屏蔽，否则应为 index/follow
- Open Graph：og:title、og:description、og:image、og:url
- Twitter Card：twitter:card、twitter:title、twitter:description
- Hreflang：如果是多语言页面，应正确实施

### Schema 标记
- 检测所有类型（优先使用 JSON-LD）
- 验证必需属性
- 识别缺失的应用机会
- 绝不推荐 HowTo（已弃用）或用于富媒体搜索结果的 FAQ（将于 2026 年 5 月退役）；无需移除现有的 FAQPage，对于真实的问答内容应使用 QAPage

### 图片
- Alt 文本：存在、描述准确，并在自然的情况下包含关键词
- 文件大小：>200KB 标记为警告，>500KB 标记为严重问题
- 格式：建议使用 WebP/AVIF，而非 JPEG/PNG
- 尺寸：设置 width/height 以防止 CLS
- 延迟加载：报告每张图片的 `lazy_method`（native | perfmatters | ewww | js-generic | none）。检测到 JS 延迟加载器（Perfmatters、EWWW、lazysizes）时，不要标记为“未延迟加载”，因为这些工具会有意移除原生 `loading="lazy"` 属性并使用 `data-src` 占位符

### Core Web Vitals（仅供参考，无法仅通过 HTML 进行测量）
- 标记潜在的 LCP 问题（超大首屏主图、阻塞渲染的资源）
- 标记潜在的 INP 问题（大量 JS、未使用 async/defer）
- 标记潜在的 CLS 问题（图片尺寸缺失、动态注入的内容）

## 输出

### 页面评分卡
```
Overall Score: XX/100

On-Page SEO:     XX/100  ████████░░
Content Quality: XX/100  ██████████
Technical:       XX/100  ███████░░░
Schema:          XX/100  █████░░░░░
Images:          XX/100  ████████░░
```

### 发现的问题
按优先级组织：严重 -> 高 -> 中 -> 低

### 建议
具体、可执行的改进措施以及预期影响

### Schema 建议
针对已发现机会提供可直接使用的 JSON-LD 代码

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `serp_organic_live_advanced` 获取真实的 SERP 排名，并使用 `backlinks_summary` 获取反向链接数据和垃圾链接评分。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 失败、连接被拒绝） | 清楚地报告错误。不要猜测页面内容。建议用户验证 URL 后重试。 |
| 页面需要身份验证（401/403） | 报告该页面受身份验证保护。建议用户直接提供渲染后的 HTML 或可公开访问的 URL。 |
| JavaScript 渲染的内容（HTML 中的 body 为空） | 说明关键内容可能由客户端渲染。分析可用的 HTML，并标明结果可能不完整。如果可以，建议使用浏览器渲染的快照。 |