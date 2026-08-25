---
name: seo-sitemap
description: >
  Analyze existing XML sitemaps or generate new ones with industry templates.
  Validates format, URLs, and structure. Use when user says "sitemap",
  "generate sitemap", "sitemap issues", or "XML sitemap".
user-invocable: true
argument-hint: "[url or generate]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.5"
  category: seo
---
# Sitemap 分析与生成

## 模式 1：分析现有 Sitemap

在报告 Sitemap 缺失之前，先发现候选项：

```bash
claude-seo run sitemap_discovery.py <url> --json
```

该辅助工具会读取 robots.txt 中所有有边界限制的 `Sitemap:` 声明，通过共享的 SSRF 安全抓取层验证跨主机目标；当声明的 Sitemap 已失效或无效时，仍会探测常见路径。只能使用 `found` 中的条目；将声明的失败项保留为发现结果，而不要仅凭 robots.txt 中的一行内容就认定 Sitemap 可用。

### 验证检查
- 有效的 XML 格式
- 单文件限制：**≤50,000 个 URL 且 ≤50MB 未压缩大小**（以先达到的限制为准）
- 所有 URL 均返回 HTTP 200
- `<lastmod>` 准确：必须是有效的 **W3C Datetime**，并反映**最近一次重大内容变更**（主要内容、结构化数据、链接，不包括版权信息或样板内容的编辑）。Google 只有在 `<lastmod>` 持续且可验证地准确时才会采用它，因此当值看起来高度统一，或比页面实际内容更新得更晚时，应发出警告。
- 不得使用已弃用的标签：`<priority>` 和 `<changefreq>` 会被 Google 忽略
- Sitemap 已在 robots.txt 中引用
- 比较已抓取页面与 Sitemap；标记缺失页面

### 质量信号
- URL 超过 50k 时使用 Sitemap 索引文件
- 按内容类型拆分（页面、文章、图片、视频）
- Sitemap 中不得包含非规范 URL
- Sitemap 中不得包含 noindexed URL
- Sitemap 中不得包含重定向 URL
- 仅使用 HTTPS URL（不使用 HTTP）

### 常见问题
| 问题 | 严重性 | 修复 |
|-------|----------|-----|
| 单个文件中包含超过 50k 个 URL | 严重 | 使用 Sitemap 索引进行拆分 |
| 单个文件未压缩大小超过 50MB | 严重 | 使用 Sitemap 索引进行拆分 |
| 存在非 200 URL | 高 | 移除或修复失效 URL |
| 包含 noindexed URL | 高 | 从 Sitemap 中移除 |
| 包含重定向 URL | 中 | 更新为最终 URL |
| 所有 lastmod 均相同 | 低 | 使用实际修改日期 |
| 使用 priority/changefreq | 信息 | 可以移除（Google 会忽略） |

### 扩展 Sitemap（图片 / 视频 / 新闻）

Google 记录了三种具有各自规则的子类型，应按子类型分别进行验证：
- **图片**（`http://www.google.com/schemas/sitemap-image/1.1`）：目前仅有两个有效标签，即 `<image:image>` 和 `<image:loc>`（每个 `<url>` 最多 **1,000** 个 `<image:image>`）。`<image:caption>`/`<image:geo_location>`/`<image:title>`/
 `<image:license>` 已被弃用（2022 年），标记为信息级别的可移除项。
- **视频**：需要 `<video:video>`，以及 `<video:thumbnail_loc>`、
  `<video:title>`、`<video:description>`，另外还需要
  `<video:content_loc>` 或 `<video:player_loc>`；同时支持 mRSS。将已弃用/移除的标签
  （`<video:category>`、`<video:gallery_loc>`、`<video:price>`、`<video:tvshow>`、
  播放器 autoplay/allow_embed）标记为信息级别的可移除项；在引用移除日期之前，重新检查 Google 文档。
- **新闻**：每个文件最多 **1,000** 个 `<news:news>`（不是 50,000 个）；仅包含**最近 2 天**内的文章；必须包含 `<news:publication>`/`<news:name>`/
  `<news:language>`/`<news:publication_date>`/`<news:title>`；通过
  Search Console 或 robots.txt/Sitemap 索引提交/发现；仅在相关情况下使用 Publisher Center 管理出版物。当检测到 `news:` 命名空间时，应使用 1,000 的上限覆盖通用的 50k 检查。

## 模式 2：生成新 Sitemap

### 流程
1. 询问业务类型（或从现有网站自动检测）
2. 从 `../seo-plan/assets/` 目录加载行业模板
3. 与用户互动规划结构
4. 应用质量门槛：
   - ⚠️ 位置页面达到 30 个及以上时发出警告（要求 60% 以上的独特内容）
   - 🛑 位置页面达到 50 个及以上时硬性停止（要求提供理由）
5. 生成有效的 XML 输出
6. 在以下任一条件先满足时进行拆分：50,000 个 URL 或 50MB 未压缩内容，并生成 sitemap 索引
7. 生成 STRUCTURE.md 文档

### 可安全批量生成的程序化页面
✅ 集成页面（包含真实的设置文档）  
✅ 模板/工具页面（包含可下载内容）  
✅ 术语表页面（包含 200 个以上单词的定义）  
✅ 产品页面（包含独特规格和评论）  
✅ 用户个人资料页面（包含用户生成的内容）

### 存在处罚风险的类型（避免批量生成）
❌ 仅替换城市名称的位置页面  
❌ “适用于 [行业] 的最佳 [工具]”页面，但不提供行业特定的价值  
❌ “[竞争对手] 替代方案”页面，但不提供真实的比较数据  
❌ 未经人工审核且不具备独特价值的 AI 生成页面

## Sitemap 格式

### 标准 Sitemap
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2026-02-07</lastmod>
  </url>
</urlset>
```

### Sitemap 索引（适用于超过 50k 个 URL）
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-pages.xml</loc>
    <lastmod>2026-02-07</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-posts.xml</loc>
    <lastmod>2026-02-07</lastmod>
  </sitemap>
</sitemapindex>
```

## 错误处理

- **URL 无法访问**：报告 HTTP 状态码，并建议检查网站是否正常运行
- **未找到 sitemap**：运行 `sitemap_discovery.py`，仅当检查已声明的候选项和常见候选项后其 `found` 列表为空时，才报告“未找到”
- **XML 格式无效**：报告包含行号的具体解析错误
- **检测到速率限制**：降低请求频率，并报告部分结果，同时注明重试时间

## 输出

### 对于分析
- `VALIDATION-REPORT.md`：分析结果
- 按严重程度列出问题
- 建议

### 对于生成
- `sitemap.xml`（或包含索引的拆分文件）
- `STRUCTURE.md`：网站架构文档
- URL 数量和组织摘要