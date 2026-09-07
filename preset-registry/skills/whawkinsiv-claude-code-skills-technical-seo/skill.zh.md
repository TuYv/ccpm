---
name: technical-seo
description: "Use this skill to implement technical SEO optimizations in code — meta tags, schema markup, Core Web Vitals, crawlability, robots.txt, sitemaps, and GEO (Generative Engine Optimization) for AI search engines. This is the implementation skill — for strategy see seo, for content writing see seo-content, for auditing see seo-audit."
---
# 技术 SEO 实现

本技能是技术 SEO 的实现参考。当你需要在代码中添加、修复或优化 SEO 元素——meta 标签、结构化数据标记（schema markup）、Core Web Vitals、可抓取性以及 GEO——时使用本技能。

本技能涵盖**如何在代码中实现**。其他 SEO 相关事项：
- **seo** — 策略与规划（关键词研究、内容架构、要构建什么）
- **seo-content** — 撰写内容（简报、人味行文、SERP 特性定位）
- **seo-audit** — 审计现有代码库（扫描、诊断、产出行动计划）

---

## 元数据

每个可索引页面都需要正确设置以下元素：

- **标题标签：** 50-60 字符，主关键词前置
- **元描述：** 120-155 字符，包含 CTA
- **Canonical 标签：** 自引用或指向正确目标
- **Robots 标签：** 无意外设置的 noindex
- **Open Graph：** 用于社交分享的 og:title、og:description、og:image

详细的规格说明和代码示例，参见 [ON-PAGE-SEO.md](ON-PAGE-SEO.md)。

## HTML 结构

- 每页恰好一个 H1，包含主关键词
- 不跳过标题层级（H1 → H2 → H3）
- 语义化 HTML：`<header>`、`<nav>`、`<main>`、`<article>`、`<section>`

## 可抓取性

- robots.txt 存在，未屏蔽重要路径
- XML 站点地图存在，包含所有重要 URL
- 每个页面都有 canonical 标签
- 无孤立页面，内部链接合理

详细的可抓取性检查清单，参见 [TECHNICAL-AUDIT.md](TECHNICAL-AUDIT.md)。

## Core Web Vitals

目标指标（2026 年阈值）：

| 指标 | 良好 | 需要改进 | 较差 |
|--------|------|-------------------|------|
| **LCP**（最大内容绘制） | ≤ 2.5s | 2.5s - 4s | > 4s |
| **INP**（下次绘制交互） | ≤ 200ms | 200ms - 500ms | > 500ms |
| **CLS**（累积布局偏移） | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

**注意**：INP 于 2024 年 3 月取代 FID 成为一项 Core Web Vitals 指标。

优化技术（LCP、INP、CLS），参见 [TECHNICAL-AUDIT.md](TECHNICAL-AUDIT.md)。

## E-E-A-T 与结构化数据

| 信号 | 实现方式 |
|--------|----------------|
| **经验（Experience）** | 亲测体验、案例研究、原创照片 |
| **专业（Expertise）** | 作者资历、专业认证 |
| **权威（Authoritativeness）** | 高质量外链、行业提及 |
| **可信（Trustworthiness）** | HTTPS、联系信息、隐私政策、引用来源 |

必需的 JSON-LD 结构化数据：Organization、WebSite、Article/BlogPosting、FAQPage、BreadcrumbList、Person（作者）。

结构化数据代码示例和作者简介模板，参见 [EEAT-AND-SCHEMA.md](EEAT-AND-SCHEMA.md)。

## GEO（生成式引擎优化）

针对 AI 驱动的搜索引擎进行优化：

| 方面 | 传统 SEO | GEO |
|--------|----------------|-----|
| **目标** | 在搜索结果中排名 | 在 AI 回答中被引用 |
| **成功指标** | 点击率 | 被引用频率 |
| **方法** | 关键词、外链 | 实体清晰度、权威信号 |
| **优化对象** | 页面和摘要 | 可引用的事实和答案 |

GEO 技术、llms.txt 实现以及 AI 爬虫管理，参见 [GEO.md](GEO.md)。

---

## 修复优先级

发现问题后，按以下顺序修复：

### 优先级 1：严重（立即修复）
- 404 错误和失效链接
- 标题标签缺失或重复
- canonical 标签失效
- 重要页面被设置 noindex
- HTTPS/安全问题
- 被 robots.txt 屏蔽

### 优先级 2：高（1 周内修复）
- Core Web Vitals 不达标
- 元描述缺失
- 多个 H1 标签
- 关键图片缺少 alt 文本
- 孤立页面（无内部链接）
- 结构化数据标记缺失

### 优先级 3：中（1 个月内修复）
- 薄内容页面
- 标题层级问题
- 内部链接优化
- 图片优化（格式、压缩）
- 锚文本改进
- 内容时效性更新

### 优先级 4：低（持续优化）
- A/B 测试改进
- 高级结构化数据类型
- 国际化 SEO 扩展
- 主题集群的新内容
- 竞争差距分析

---

## 修复后验证

应用修复之后：

1. **重新抓取**受影响的页面
2. **验证** DOM 变更已上线生效
3. **检查** robots.txt 未屏蔽新路径
4. 使用 Google 的 Rich Results Test **验证**结构化数据
5. 用 Lighthouse **测试** Core Web Vitals
6. **监控** Search Console 中的索引问题

---

## 监控节奏

**每日：** 检查 Search Console 中的抓取错误。监控网站正常运行时间。查看安全警报。

**每周：** 查看 Core Web Vitals 趋势。检查新出现的 404。监控 AI 推荐流量。查看排名变化。

**每月：** 完整技术审计。内容时效性审查。外链概况分析。结构化数据验证。

**每季度：** 全面 SEO 策略审查。GEO 表现分析。内容差距分析。

---

## 快速参考

### SEO 规格说明

| 元素 | 规格 |
|---------|---------------|
| 标题标签 | 50-60 字符，关键词前置 |
| 元描述 | 120-155 字符，包含 CTA |
| H1 | 每页恰好 1 个，包含关键词 |
| URL | 小写、连字符、具有描述性 |
| 图片 | WebP/AVIF，<200KB，alt 文本，尺寸 |
| Canonical 标签 | 每个页面自引用 |
| robots.txt | 允许重要路径，屏蔽管理页面 |
| 站点地图 | 所有可索引 URL，lastmod 日期 |

### GEO 检查清单

| 元素 | 是否必需 |
|---------|----------|
| FAQPage 结构化数据 | 是 |
| 答案优先的内容 | 是 |
| 带来源的统计数据 | 是 |
| 专家引述 | 推荐 |
| TL;DR 块 | 推荐 |
| llms.txt | 推荐 |
| 新鲜内容（<90 天） | 是 |

---

## 配套文件

- [TECHNICAL-AUDIT.md](TECHNICAL-AUDIT.md) — Core Web Vitals 优化、可抓取性、移动优先、HTTPS
- [ON-PAGE-SEO.md](ON-PAGE-SEO.md) — 标题标签、元描述、标题层级、图片、内部链接
- [EEAT-AND-SCHEMA.md](EEAT-AND-SCHEMA.md) — E-E-A-T 实现、结构化数据标记库（JSON-LD）
- [GEO.md](GEO.md) — 生成式引擎优化、llms.txt、AI 爬虫、特定框架的 SEO

---

## 版本历史

- **v3.0**（2026 年 3 月）：重新定位为实现参考（审计功能移至 seo-audit 技能），新增对 seo-content 和 seo 技能的交叉引用，将元描述规格统一为 120-155 字符
- **v2.0**（2025 年 12 月）：新增 GEO 章节、AI 爬虫管理、llms.txt、GA4 AI 追踪，更新 Core Web Vitals（INP），扩充结构化数据库，新增特定框架指南
- **v1.0**（2024 年 12 月）：初始版本，包含技术审计、页面级 SEO、基础结构化数据
