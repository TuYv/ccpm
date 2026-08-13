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
  version: "2.2.4"
  category: seo
---
# Sitemap 分析与生成

## 模式 1：分析现有 Sitemap

在报告 Sitemap 缺失之前，先发现候选项：

```bash
claude-seo run sitemap_discovery.py <url> --json
```

该辅助工具会读取 robots.txt 中每条有界的 `Sitemap:` 声明，通过共享的 SSRF 安全获取层验证
跨主机目标，并且即使声明的 Sitemap 已过时或无效，也仍会探测
常见路径。仅使用 `found` 中的条目；应将声明目标的验证失败保留为问题发现，而不要仅凭 robots.txt
中的一行声明就认定 Sitemap 有效。

### 验证检查
- XML 格式有效
- 单文件限制：**≤50,000 个 URL 且未压缩大小 ≤50MB**（以先达到的限制为准）
- 所有 URL 均返回 HTTP 200
- `<lastmod>` 准确：必须是有效的 **W3C Datetime**，并反映**最近一次
  重大内容变更**（主要内容、结构化数据、链接，而非
  版权信息/样板内容编辑）。Google 仅在 `<lastmod>` 始终
  准确且可验证时才会采信它，因此当其值高度一致或比页面实际内容
  更新时，应发出警告。
- 不含已弃用标签：Google 会忽略 `<priority>` 和 `<changefreq>`
- Sitemap 已在 robots.txt 中引用
- 对比已抓取页面与 Sitemap；标记缺失页面

### 质量信号
- URL 超过 50k 时使用 Sitemap 索引文件
- 按内容类型拆分（页面、文章、图片、视频）
- Sitemap 中不含非规范 URL
- Sitemap 中不含已设置 noindex 的 URL
- Sitemap 中不含重定向 URL
- 仅包含 HTTPS URL（不含 HTTP）

### 常见问题
| 问题 | 严重程度 | 修复方法 |
|-------|----------|-----|
| 单个文件中超过 50k 个 URL | 严重 | 使用 Sitemap 索引拆分 |
| 单个文件未压缩大小超过 50MB | 严重 | 使用 Sitemap 索引拆分 |
| 非 200 响应的 URL | 高 | 移除或修复失效 URL |
| 包含已设置 noindex 的 URL | 高 | 从 Sitemap 中移除 |
| 包含重定向 URL | 中 | 更新为最终 URL |
| 所有 lastmod 均相同 | 低 | 使用实际修改日期 |
| 使用了 priority/changefreq | 提示 | 可以移除（Google 会忽略） |

### 扩展 Sitemap（图片 / 视频 / 新闻）

Google 记录了三种具有各自规则的子类型，应按子类型分别验证：
- **图片**（`http://www.google.com/schemas/sitemap-image/1.1`）：目前仅剩两个有效
  标签：`<image:image>` 和 `<image:loc>`（每个 `<url>` 最多包含 **1,000** 个 `<image:image>`
  ）。`<image:caption>`/`<image:geo_location>`/`<image:title>`/
 `<image:license>` 已于 2022 年弃用，应标记为提示级别的可移除项。
- **视频**：必须包含 `<video:video>`，以及 `<video:thumbnail_loc>`、
  `<video:title>`、`<video:description>`，另加 `<video:content_loc>` 或
  `<video:player_loc>`；也支持 mRSS。将已弃用/移除的标签
  （`<video:category>`、`<video:gallery_loc>`、`<video:price>`、`<video:tvshow>`、
  播放器的 autoplay/allow_embed）标记为提示级别的可移除项；引用移除日期前，应重新查阅 Google 文档。
- **新闻**：每个文件最多包含 **1,000** 个 `<news:news>`（而非 50,000 个）；仅包含
  **过去 2 天**内的文章；必须包含 `<news:publication>`/`<news:name>`/
  `<news:language>`/`<news:publication_date>`/`<news:title>`；通过
  Search Console 或 robots.txt/Sitemap 索引提交或供系统发现；仅在相关情况下使用 Publisher Center
  进行出版物管理。检测到 `news:` 命名空间时，应使用 1,000 条上限覆盖通用的
  50k 检查。

## 模式 2：生成新站点地图

### 流程
1. 询问业务类型（或从现有网站自动检测）
2. 从 `../seo-plan/assets/` 目录加载行业模板
3. 与用户以交互方式规划结构
4. 应用质量门槛：
   - ⚠️ 警告：位置页面达到 30 个以上（要求 60% 以上的独特内容）
   - 🛑 强制停止：位置页面达到 50 个以上（要求提供合理理由）
5. 生成有效的 XML 输出
6. 在以下任一限制先达到时进行拆分：50,000 个 URL 或未压缩大小 50MB，并生成站点地图索引
7. 生成 STRUCTURE.md 文档

### 可安全规模化生成的程序化页面
✅ 集成页面（包含真实的设置文档）
✅ 模板/工具页面（包含可下载内容）
✅ 术语表页面（定义不少于 200 个单词）
✅ 产品页面（包含独特的规格和评论）
✅ 用户资料页面（包含用户生成的内容）

### 惩罚风险（避免规模化生成）
❌ 仅替换城市名称的位置页面
❌ 缺乏行业特定价值的“最适合 [industry] 的 [tool]”
❌ 缺乏真实比较数据的“[Competitor] 替代方案”
❌ 未经人工审核且不具备独特价值的 AI 生成页面

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

### 站点地图索引（适用于超过 50,000 个 URL）
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

- **URL 无法访问**：报告 HTTP 状态码，并建议检查网站是否已上线
- **未找到站点地图**：运行 `sitemap_discovery.py`，并且仅当检查已声明的候选项和常见候选项后，其 `found` 列表仍为空时，才报告“未找到”
- **XML 格式无效**：报告具体的解析错误及其行号
- **检测到速率限制**：执行退避，并报告部分结果，同时注明重试时间

## 输出

### 用于分析
- `VALIDATION-REPORT.md`：分析结果
- 按严重程度列出的问题清单
- 建议

### 用于生成
- `sitemap.xml`（或带索引的拆分文件）
- `STRUCTURE.md`：网站架构文档
- URL 数量和组织结构摘要