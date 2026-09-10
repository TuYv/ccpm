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
  version: "2.3.1"
  category: seo
---
# 单页分析

## 分析内容

### 页面 SEO
- 标题标签：50-60 个字符，包含核心关键词，且具有唯一性
- Meta 描述：150-160 个字符，具有吸引力，包含关键词
- Meta 描述不是标题的复述：运行
  `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run metadata_template.py --title "<title>" --description "<desc>" --json`
  （启发式、确定性的字符串比较）。以重复自身标题开头、并以套话式 CTA（“Try it free now.”、“Start free!”）结尾的描述属于模板化元数据，这种形式是批量生成任务在全站范围内产生的，且重复或模板化的元数据是已有文档记录的内容质量问题，无论正文内容有多原创
- H1：恰好一个，符合页面意图，包含关键词
- H2-H6：层级逻辑合理（不跳级），具有描述性
- URL：简短、具有描述性、使用连字符、不含参数
- 内部链接：数量充足、相关性强、锚文本恰当、没有孤立页面
- 外部链接：链接至权威来源，数量合理

### 内容质量
- 字数是否达到页面类型的最低要求（参见 quality-gates.md）
- 可读性：Flesch 阅读易读性评分、年级水平
- 关键词密度：自然（1-3%），包含语义变体
- E-E-A-T 信号：作者简介、资质、第一手经验标志
- 内容时效性：发布日期、最后更新时间

### 技术元素
- Canonical 标签：存在，且为自引用或正确指向
- Meta robots：除非有意屏蔽，否则应为 index/follow
- Open Graph：og:title、og:description、og:image、og:url
- Twitter Card：twitter:card、twitter:title、twitter:description
- Hreflang：如果支持多语言，检查实现是否正确

### Schema 标记
- 检测所有类型（优先 JSON-LD）
- 验证必填属性
- 识别缺失的机会
- 绝不推荐 HowTo（已弃用）或用于富媒体搜索结果的 FAQ（已于 2026 年 5 月退役）；无需删除现有的 FAQPage，真实问答应使用 QAPage

### 图片
- Alt 文本：存在、具有描述性，并在自然的情况下包含关键词
- 文件大小：超过 200KB 标记为警告，超过 500KB 标记为严重
- 格式：建议使用 WebP/AVIF 而不是 JPEG/PNG
- 尺寸：设置 width/height 以防止 CLS
- 延迟加载：针对每张图片报告 `lazy_method`（native | perfmatters | ewww | js-generic | none）。检测到 JS 延迟加载器（Perfmatters、EWWW、lazysizes）时，不要标记为“未延迟加载”，因为它们会有意移除原生 `loading="lazy"` 属性，并使用 `data-src` 占位符

### Core Web Vitals（仅供参考，无法仅通过 HTML 测量）
- 标记潜在的 LCP 问题（超大的主视觉图片、渲染阻塞资源）
- 标记潜在的 INP 问题（大量 JS、未使用 async/defer）
- 标记潜在的 CLS 问题（缺少图片尺寸、注入内容）

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
针对检测到的机会提出具体、可执行的改进建议，并说明预期影响

### Schema 建议
针对检测到的机会提供可直接使用的 JSON-LD 代码

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `serp_organic_live_advanced` 获取真实的 SERP 排名，并使用 `backlinks_summary` 获取反向链接数据和垃圾评分。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 故障、连接被拒绝） | 清晰地报告错误。不要猜测页面内容。建议用户验证 URL 后重试。 |
| 页面需要身份验证（401/403） | 报告该页面需要身份验证。建议用户直接提供渲染后的 HTML，或提供一个可公开访问的 URL。 |
| JavaScript 渲染的内容（HTML 中 body 为空） | 说明关键内容可能是在客户端渲染的。分析可用的 HTML，并指出结果可能不完整。如果有浏览器渲染的快照，建议使用该快照。 |