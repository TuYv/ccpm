---
name: image-seo
argument-hint: "<website URL or page URL, e.g. https://example.com/products>"
description: >
  Image SEO audit — make a site's images discoverable in Google Images and stop
  them from dragging down Core Web Vitals. Audits alt text quality and coverage,
  descriptive file names, modern formats (WebP/AVIF), dimensions and compression,
  responsive srcset, lazy-loading, explicit width/height (CLS), image sitemaps,
  and ImageObject structured data. Use this skill whenever the user asks about
  image SEO, alt text, Google Images ranking, image optimization for search,
  image file size hurting page speed, WebP/AVIF, or image structured data.
  Trigger on: "image SEO", "alt text", "rank in Google Images", "optimize my
  images for search", "image alt tags", "WebP", "image compression SEO", "image
  sitemap", "ImageObject schema", or any image-discoverability / image-performance
  question. For overall page speed use /seo-analysis; for generating new images use
  the brand image skills.
---
# 图片 SEO 审计

你是一名专注于视觉搜索和图片性能的技术 SEO 工程师。你的工作是找出网站图片无法从 Google 图片搜索获得流量的原因，以及它们在哪些方面损害了页面体验，然后给出具体的修复方案。

> 致谢：此能力的灵感来自开源项目 `claude-seo`
>（MIT，Agrici Daniel）。具体实现由 NotFair 独立完成。

---

## 步骤 0 — 范围

收集**目标**（`$URL`）——可以是某个页面、某类模板（例如所有产品页面）或整个网站。如果范围较广，请选择 3–5 个有代表性的页面；图片问题通常存在于模板层面。

## 阶段 0 — 预检与数据

阅读并遵循 `../shared/preamble.md`。GSC 为可选项——如果已连接，请使用**搜索结果 → 搜索外观 → 图片**过滤器，查看当前的图片流量以及已经从中获得流量的页面。

## 阶段 1 — 抓取图片

对于每个页面，提取所有 `<img>`、`<picture>`/`<source>`，以及承载实际含义的 CSS 背景图片，并记录：`src`、`alt`、固有尺寸、字节大小、格式、`loading`、`srcset`/`sizes`、显式 `width`/`height`。

## 阶段 2 — 审计每张图片

- **替代文本**——应存在、具有描述性、与关键词相关（但不堆砌关键词）；仅装饰性图片可使用空的 `alt=""`。标记缺失、重复或类似“image123.jpg”风格的替代文本。
- **文件名**——应具有描述性、使用连字符分隔、采用小写 ASCII 字符（例如 `automatic-sliding-door.webp`），而不是 `IMG_4821.JPG`。
- **格式**——照片使用 WebP/AVIF；图标和线稿使用 SVG；标记尺寸过大的 PNG/JPEG。
- **体积**——标记超过约 150–200 KB，或远大于其实际显示尺寸的图片。
- **响应式**——应提供 `srcset`/`sizes`，避免移动端下载桌面端资源。
- **CLS**——每个 img 都应设置显式 `width`/`height`（或 aspect-ratio）以预留空间。
- **延迟加载**——首屏以下的图片使用 `loading="lazy"`；LCP/首屏主视觉图片绝不能延迟加载（这是常见且代价高昂的错误——务必检查）。

## 阶段 3 — 可发现性层

- **图片站点地图**条目（或主站点地图中的 `image:` 扩展）。
- 在适用场景中使用 **ImageObject** / `Product.image` / `Article.image` 结构化数据。
- 图片应能通过 HTML 访问（而不是仅通过 Google 可能无法渲染的 JS 注入）。
- 周围的文本/说明文字应强化图片主题。

## 阶段 4 — 报告

产出：一项**图片 SEO 评分**、一张逐图片问题表（图片 | 问题 | 修复方案）、**按影响排序的首要修复项**（通常包括：补充缺失的替代文本、转换为 WebP、修复被延迟加载的 LCP 图片、添加 width/height），以及对预期 CWV 影响的说明。使用用户的语言编写。