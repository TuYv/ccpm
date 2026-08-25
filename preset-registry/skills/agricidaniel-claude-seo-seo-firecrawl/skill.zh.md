---
name: seo-firecrawl
description: >
  Full-site crawling, scraping, and site mapping via Firecrawl MCP.
  Use when user says "crawl site", "map site", "full crawl",
  "find all pages", "broken links", "site structure",
  "discover pages", "JS rendering", or needs site-wide analysis.
user-invocable: true
argument-hint: "[command] <url>"
license: MIT
compatibility: "Requires Firecrawl MCP server"
metadata:
  author: AgriciDaniel
  version: "2.2.5"
  category: seo
---
# Claude SEO 的 Firecrawl 扩展

此技能要求安装 Firecrawl 扩展：
```bash
./extensions/firecrawl/install.sh
```

**检查可用性：** 在使用任何 Firecrawl 工具之前，请通过检查 `firecrawl_scrape` 或任何 Firecrawl 工具是否可用，验证 MCP 服务器已连接。如果工具不可用，请告知用户扩展尚未安装，并提供安装说明。

## 快速参考

| 命令 | 用途 |
|---------|---------|
| `/seo firecrawl crawl <url>` | 使用内容提取功能进行全站抓取 |
| `/seo firecrawl map <url>` | 发现网站结构（仅 URL，速度快） |
| `/seo firecrawl scrape <url>` | 对单个页面进行抓取并渲染 JS |
| `/seo firecrawl search <query> <url>` | 在已抓取的网站内搜索 |

## 命令

### crawl -- 全站抓取

从给定 URL 开始抓取整个网站。返回所有已发现页面的页面内容、
元数据和链接。

**MCP 工具：** `firecrawl_crawl`

**参数：**
- `url`（必需）：抓取起始 URL
- `limit`：最多抓取的页面数（默认：100，最大：500）
- `maxDepth`：从起始 URL 开始的最大链接深度（默认：3）
- `includePaths`：要包含的 glob 模式数组（例如：`["/blog/*"]`）
- `excludePaths`：要排除的 glob 模式数组（例如：`["/admin/*", "/api/*"]`）
- `scrapeOptions.formats`：输出格式 -- `["markdown", "html", "links"]`

**SEO 使用模式：**
1. **全面审计抓取**：抓取整个网站，提取所有页面供子代理分析
2. **针对特定分区的抓取**：使用 `includePaths` 仅审计 `/blog/*` 或 `/products/*`
3. **断链检测**：使用 `["links"]` 格式进行抓取，检查所有 href 是否返回 404
4. **内容清单**：批量提取所有页面标题、元描述和 H1
5. **SPA/JS 渲染网站**：Firecrawl 会渲染 JavaScript，从而解决 Issue #11 问题

**`/seo audit` 的编排示例：**
```
1. firecrawl_map(url) -> get all URLs (fast, no content)
2. Filter to top 50 most important pages (homepage, key sections)
3. firecrawl_crawl(url, limit=50) -> get full content
4. Feed content to seo-technical, seo-content, seo-schema agents
```

**成本注意事项：**
- 免费套餐：每月 500 个 credits
- 1 个 credit = 抓取或采集 1 个页面
- Map 操作成本更低（每发现一个 URL 消耗 0.5 个 credits）
- 在进行大规模抓取之前，务必告知用户预计的 credit 使用量

### map -- 网站结构发现

发现网站上的所有 URL，而不获取内容。速度快且节省 credits。

**MCP 工具：** `firecrawl_map`

**参数：**
- `url`（必需）：要进行映射的网站 URL
- `limit`：最多发现的 URL 数量（默认：5000）
- `search`：用于筛选 URL 的可选搜索词

**SEO 使用模式：**
1. **站点地图对比**：对网站进行映射，将发现的 URL 与 XML 站点地图进行比较
2. **孤立页面检测**：检测存在于站点地图中但未从任何页面链接的 URL
3. **抓取预算分析**：分析可索引页面总数与从首页链接的页面数
4. **URL 模式分析**：识别 URL 结构模式、重复项和参数膨胀
5. **审计前发现**：先运行 map，然后对关键分区进行定向抓取

**输出：** URL 数组。格式如下：
```
Site: example.com
Pages discovered: 342

URL Pattern Breakdown:
  /blog/*          - 128 pages (37%)
  /products/*      - 89 pages (26%)
  /category/*      - 45 pages (13%)
  /pages/*         - 32 pages (9%)
  / (root pages)   - 48 pages (14%)
```

### scrape -- 单页面深度抓取

使用完整的 JavaScript 渲染抓取单个页面。比
`fetch_page.py` 更为全面，因为它会执行 JS 并等待动态内容。

**MCP 工具：** `firecrawl_scrape`

**参数：**
- `url`（必需）：要抓取的页面 URL
- `formats`：输出格式 -- `["markdown", "html", "links", "screenshot"]`
- `onlyMainContent`：移除导航栏、页脚和侧边栏（默认：true）
- `waitFor`：等待内容的 CSS 选择器或毫秒数
- `timeout`：请求超时时间，单位为毫秒（默认：30000）
- `actions`：抓取前执行的浏览器操作（点击、滚动、等待）

**SEO 使用模式：**
1. **SPA 内容提取**：抓取由 JS 渲染的 React/Vue/Angular 页面
2. **动态内容审计**：审计首屏以下包含延迟加载内容的页面
3. **付费墙/登录检测**：识别需要身份验证才能访问的内容
4. **主要内容提取**：使用 `onlyMainContent` 进行干净的 E-E-A-T 分析
5. **截图捕获**：使用 `screenshot` 格式进行视觉分析

**何时使用 scrape，何时使用 fetch_page.py：**
| 场景 | 使用 |
|----------|-----|
| 静态 HTML 页面 | `fetch_page.py`（无 API 成本） |
| JS 渲染的 SPA | `firecrawl_scrape`（渲染 JS） |
| 需要响应标头 | `fetch_page.py`（返回标头） |
| 需要干净的 markdown | `firecrawl_scrape`（提取效果更好） |
| 受到速率限制/阻止 | `firecrawl_scrape`（处理反爬机制） |

### search -- 站点范围搜索

在网站内搜索特定内容。适用于查找与某个主题相关的页面，
而无需抓取全部内容。

**MCP 工具：** `firecrawl_search`

**参数：**
- `query`（必需）：搜索查询
- `url`（必需）：要在其中进行搜索的网站
- `limit`：最大结果数（默认：10）
- `scrapeOptions.formats`：匹配页面的输出格式

**SEO 使用模式：**
1. **内容差距验证**：在网站上搜索关键词，以检查是否存在相关内容
2. **内部链接机会**：查找提及某个主题且可以相互链接的页面
3. **重复内容检测**：搜索关键短语，以查找近似重复内容
4. **竞争对手内容研究**：在竞争对手网站上搜索特定主题

## 跨 Skill 集成

### 与 seo-audit（完整审计）集成
当 `/seo audit` 期间 Firecrawl 可用时：
1. 使用 `firecrawl_map` 发现网站的所有 URL
2. 与 XML sitemap（seo-sitemap）进行比较，以查找孤立页面/缺失页面
3. 选择顶级页面进行深度分析
4. 将抓取的内容提供给所有子代理（技术、内容、结构化数据、地理定位）
5. 报告可抓取页面总数、URL 模式和抓取深度

### 与 seo-technical 集成
- 断链检测：抓取所有内部链接，检查是否存在 404
- 重定向链映射：跟踪所有重定向，标记跳数超过 2 跳的链
- 混合内容检测：检查 HTTPS 页面上的 HTTP 资源
- 规范 URL 验证：将规范 URL 与实际 URL 进行比较

### 借助 seo-sitemap
- Sitemap 覆盖率：已抓取页面中存在于 Sitemap 的页面所占百分比
- 孤立页面：通过抓取发现但缺失于 Sitemap 的页面
- 过时的 Sitemap 条目：Sitemap 中返回 404/410 的 URL

### 借助 seo-content
- 内容提取：将干净的 markdown 提供给 E-E-A-T 分析
- 薄内容检测：批量识别少于 300 个单词的页面
- 重复内容：比较页面之间的内容，查找近似重复内容

### 借助 seo-schema
- Schema 提取：从所有已抓取页面中提取 JSON-LD
- Schema 覆盖率：包含结构化数据的页面所占百分比
- Schema 验证：批量验证提取出的 Schema

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|-----------|
| `FIRECRAWL_API_KEY not set` | MCP 未配置 | 运行 `./extensions/firecrawl/install.sh` |
| `402 Payment Required` | Credits 已耗尽 | 在 firecrawl.dev/app 查看使用情况，升级套餐 |
| `429 Too Many Requests` | 受到速率限制 | 等待 60 秒，降低抓取并发数 |
| `408 Timeout` | 页面渲染速度过慢 | 增加 `timeout`，尝试不使用 JS 渲染 |
| `403 Forbidden` | 网站阻止抓取 | 检查 robots.txt，可能需要跳过该网站 |

**优雅降级：** 如果 Firecrawl 不可用，请告知用户并建议：
1. 使用 `fetch_page.py` 进行单页面分析（无 API 费用）
2. 使用 `WebFetch` 工具获取基础 HTML
3. 安装 Firecrawl：`./extensions/firecrawl/install.sh`