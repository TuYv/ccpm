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
  version: "2.3.1"
  category: seo
---
# Sitemap 分析与生成

## 模式 1：分析现有 Sitemap

在报告 Sitemap 缺失之前，先发现候选项：

```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run sitemap_discovery.py <url> --json
```

该辅助工具会读取 robots.txt 中所有有界的 `Sitemap:` 声明，通过共享的 SSRF 安全抓取层验证跨主机目标；即使已声明的 Sitemap 已失效或无效，它仍会探测常见路径。仅使用 `found` 中的条目；将已声明但验证失败的条目作为发现结果保留，不要仅凭 robots.txt 中的一行声明就认定 Sitemap 可用。

### 验证检查
- 有效的 XML 格式
- 单文件限制：**≤50,000 个 URL 且 ≤50MB 未压缩大小**（以先达到的限制为准）
- 所有 URL 均返回 HTTP 200
- `<lastmod>` 准确：必须是有效的 **W3C Datetime**，并反映**最后一次重大内容变更**（主要内容、结构化数据、链接的变更，不包括版权信息或模板内容的编辑）。只有当 `<lastmod>` 持续且可验证地准确时，Google 才会采纳它，因此当值看起来过于统一，或比页面实际内容更新日期更晚时，应发出警告。
- 不包含已弃用的标签：`<priority>` 和 `<changefreq>` 会被忽略
- Sitemap 已在 robots.txt 中引用
- 对比已抓取页面与 Sitemap；标记缺失的页面

### 质量信号
- 如果 URL 数量超过 50,000，使用 Sitemap 索引文件
- 按内容类型拆分（页面、文章、图片、视频）
- Sitemap 中不包含非规范 URL
- Sitemap 中不包含 noindex URL
- Sitemap 中不包含重定向 URL
- 仅使用 HTTPS URL（不使用 HTTP）

### 常见问题
| 问题 | 严重程度 | 修复方法 |
|-------|----------|----------|
| 单个文件包含超过 50k 个 URL | 严重 | 使用 Sitemap 索引进行拆分 |
| 单个未压缩文件超过 50MB | 严重 | 使用 Sitemap 索引进行拆分 |
| 存在非 200 URL | 高 | 移除或修复损坏的 URL |
| 包含 noindex URL | 高 | 从 Sitemap 中移除 |
| 包含重定向 URL | 中 | 更新为最终 URL |
| 所有 lastmod 均相同 | 低 | 使用实际修改日期 |
| 使用了 priority/changefreq | 信息 | 可以移除（Google 会忽略） |

### 扩展 Sitemap（图片 / 视频 / 新闻）

Google 针对三种子类型分别制定了规则，请按子类型进行验证：
- **图片**（`http://www.google.com/schemas/sitemap-image/1.1`）：目前仅保留两个有效标签：`<image:image>` 和 `<image:loc>`（每个 `<url>` 最多 **1,000** 个 `<image:image>`）。`<image:caption>`/`<image:geo_location>`/`<image:title>`/`<image:license>` 已被弃用（2022 年），应将其标记为信息级可移除项。
- **视频**：必须包含 `<video:video>`，以及 `<video:thumbnail_loc>`、`<video:title>`、`<video:description>`，同时还必须包含 `<video:content_loc>` 或 `<video:player_loc>`；也支持 mRSS。将已弃用/移除的标签（`<video:category>`、`<video:gallery_loc>`、`<video:price>`、`<video:tvshow>`、播放器 autoplay/allow_embed）标记为信息级可移除项；引用移除日期前请重新核对 Google 文档。
- **新闻**：每个文件最多 **1,000** 个 `<news:news>`（不是 50,000 个）；仅包含最近 **2 天**内的文章；必须包含 `<news:publication>`/`<news:name>`/`<news:language>`/`<news:publication_date>`/`<news:title>`；通过 Search Console 或 robots.txt/Sitemap 索引提交/发现；在适用情况下，仅使用 Publisher Center 进行出版物管理。当检测到 `news:` 命名空间时，应使用 1,000 的上限覆盖通用的 50k 检查。

## 模式 2：生成新站点地图

### 流程
1. 询问业务类型（或从现有网站自动检测）
2. 从 `../seo-plan/assets/` 目录加载行业模板
3. 与用户交互式规划结构
4. 应用质量门槛：
   - ⚠️ 警告：达到 30 个以上位置页面时（要求 60% 以上的独特内容）
   - 🛑 硬性停止：达到 50 个以上位置页面时（要求提供理由）
5. 生成有效的 XML 输出
6. 在达到以下任一条件时进行拆分：50,000 个 URL 或未压缩时 50MB，并生成站点地图索引
7. 生成 STRUCTURE.md 文档

### 可安全进行程序化生成的页面（可大规模生成）
✅ 集成页面（包含真实的设置文档）  
✅ 模板/工具页面（包含可下载内容）  
✅ 术语表页面（包含 200 字以上的定义）  
✅ 产品页面（包含独特规格和评价）  
✅ 用户资料页面（包含用户生成的内容）

### 处罚风险（避免大规模生成）
❌ 仅替换城市名称的位置页面  
❌ 不包含针对行业的具体价值的“适用于[行业]的最佳[工具]”页面  
❌ 不包含真实对比数据的“[竞争对手]替代方案”页面  
❌ 未经人工审核且缺乏独特价值的 AI 生成页面

## 站点地图格式

### 标准站点地图
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2026-02-07</lastmod>
  </url>
</urlset>
```

### 站点地图索引（超过 50k 个 URL 时）
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
- **未找到站点地图**：运行 `sitemap_discovery.py`，仅当检查已声明的候选项和常见候选项后其 `found` 列表为空时，才报告“未找到”
- **XML 格式无效**：报告具体的解析错误及其行号
- **检测到速率限制**：降低请求频率，并报告部分结果，同时注明重试时间

## 输出

### 用于分析
- `VALIDATION-REPORT.md`：分析结果
- 按严重程度排列的问题列表
- 建议

### 用于生成
- `sitemap.xml`（或包含索引的拆分文件）
- `STRUCTURE.md`：网站架构文档
- URL 数量和组织摘要