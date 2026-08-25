---
name: seo-google
description: >
  Google SEO APIs: Search Console (Search Analytics, URL Inspection, Sitemaps),
  PageSpeed Insights v5, CrUX field data with 25-week history, Indexing API v3,
  and GA4 organic traffic. Provides real Google field data for Core Web Vitals,
  indexation status, search performance, and organic traffic trends. Use when
  user says "search console", "GSC", "PageSpeed", "CrUX", "field data",
  "indexing API", "GA4 organic", "URL inspection", or "real CWV data".
user-invocable: true
argument-hint: "[command] [url|property]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.5"
  category: seo
---
# Google SEO APIs

直接访问 Google 自有的 SEO 数据。弥合基于抓取的分析（现有的 claude-seo skills）与 Google 实时现场数据之间的差距：真实的 Chrome 用户指标、实际索引状态、搜索表现和自然流量。

所有 API 均免费。设置需要一个 Google Cloud 项目以及 API key 和/或 service account——运行 `/seo google setup` 获取分步说明。

## 前置条件

执行任何命令前，检查凭据：
```bash
claude-seo run google_auth.py --check --json
```

配置文件：`~/.config/claude-seo/google-api.json`
```json
{
  "service_account_path": "/path/to/service_account.json",
  "api_key": "<GOOGLE_API_KEY>",
  "default_property": "sc-domain:example.com",
  "ga4_property_id": "properties/123456789"
}
```

如果缺少配置，请阅读 `references/auth-setup.md` 并引导用户完成设置。

### 凭据层级

| 层级 | 检测条件 | 可用命令 |
|------|-----------|-------------------|
| **0** (API Key) | 存在 `api_key` | `pagespeed`、`crux`、`crux-history`、`youtube`、`nlp` |
| **1** (OAuth/SA) | + OAuth token 或 service account | 层级 0 + `gsc`、`inspect`、`sitemaps`、`index` |
| **2** (完整) | + 已配置 `ga4_property_id` | 层级 1 + `ga4`、`ga4-pages` |
| **3** (Ads) | + `ads_developer_token` + `ads_customer_id` | 层级 2 + `keywords`、`volume` |

运行命令前，始终先告知检测到的层级。

## 快速参考

| 命令 | 功能 | 层级 |
|---------|-------------|------|
| `/seo google setup` | 检查/配置 API 凭据 | -- |
| `/seo google pagespeed <url>` | PSI Lighthouse + CrUX 现场数据 | 0 |
| `/seo google crux <url>` | 仅 CrUX 现场数据（p75 指标） | 0 |
| `/seo google crux-history <url>` | 25 周 CWV 趋势分析 | 0 |
| `/seo google gsc <property>` | Search Console：点击次数、展示次数、CTR、排名 | 1 |
| `/seo google inspect <url>` | URL Inspection：索引状态、规范 URL、抓取信息 | 1 |
| `/seo google inspect-batch <file>` | 从文件批量执行 URL Inspection | 1 |
| `/seo google sitemaps <property>` | GSC sitemap 状态 | 1 |
| `/seo google index <url>` | 将 URL 提交至 Indexing API | 1 |
| `/seo google index-batch <file>` | 批量提交最多 200 个 URL | 1 |
| `/seo google ga4 [property-id]` | GA4 自然流量报告 | 2 |
| `/seo google ga4-pages [property-id]` | 热门自然流量落地页 | 2 |
| `/seo google youtube <query>` | YouTube 视频搜索（观看次数、点赞数、时长） | 0 |
| `/seo google youtube-video <id>` | YouTube 视频详情 + 热门评论 | 0 |
| `/seo google nlp <url-or-text>` | NLP 实体提取 + 情感分析 + 分类 | 0 |
| `/seo google entities <url-or-text>` | 仅实体分析（用于 E-E-A-T） | 0 |
| `/seo google keywords <seed>` | 使用 Google Ads Keyword Planner 获取关键词建议 | 3 |
| `/seo google volume <keywords>` | 使用 Keyword Planner 查询搜索量 | 3 |
| `/seo google entity <query>` | Knowledge Graph 实体检查 | 0 |
| `/seo google safety <url>` | Web Risk URL 安全检查 | 0 |
| `/seo google quotas` | 显示所有 API 的速率限制 | -- |

---

## PageSpeed + CrUX

### `/seo google pagespeed <url>`

结合 Lighthouse 实验室数据与 CrUX 真实用户数据。

**脚本：** `claude-seo run pagespeed_check.py <url> --json`  
**参考：** `references/pagespeed-crux-api.md`  
**默认值：** 移动端和桌面端两种策略，以及所有 Lighthouse 类别。

输出将实验室评分（特定时间点的 Lighthouse 数据）与真实用户数据（过去 28 天的
Chrome 用户指标）合并。CrUX 会先尝试使用 URL 级数据，失败后回退到来源级数据。

### `/seo google crux <url>`

仅 CrUX 真实用户数据（不运行 Lighthouse）。速度更快。

**脚本：** `claude-seo run pagespeed_check.py <url> --crux-only --json`

### `/seo google crux-history <url>`

过去 25 周的 CrUX 历史趋势。显示 CWV 指标是在改善、保持稳定还是恶化。

**脚本：** `claude-seo run crux_history.py <url> --json`  
**参考：** `references/pagespeed-crux-api.md`

输出包括每项指标的趋势方向、百分比变化和每周 p75 值。

---

## Search Console

### `/seo google gsc <property>`

搜索分析：过去 28 天的点击次数、展示次数、CTR 和排名。

**脚本：** `claude-seo run gsc_query.py --property <property> --json`  
**参考：** `references/search-console-api.md`  
**默认值：** 28 天，维度=query,page，类型=web，限制=1000。

包含快速获胜机会检测：排名处于 4-10 位且展示次数较高的查询。
`totals` 块来自单独的不带维度的汇总查询，因为查询级行可能会省略匿名化的低流量。
只有当 `totals_complete` 为 true 时，才能将 totals 视为全站数据。`--limit` 限制返回的
维度行总数，而不是每次分页请求的大小。

> **GSC 中的 AI 展示面（2026）：**
> - **生成式 AI 性能报告**（于 2026-06-03 发布）是专门用于查看 **AI Overviews + AI Mode** 可见性的视图。仅提供**展示次数**（不提供点击次数/CTR/排名/查询）；维度包括页面/国家/设备/日期（太平洋时间）；限制为 1,000 行；最新数据为初步数据；此外还存在单独的 Discover 生成式 AI 报告。该功能正在向部分资源逐步推出。
> - **AI Mode 已计入标准性能报告的总数据**（Web 搜索类型），AI Mode 中的点击（外部链接点击）和展示次数都会计入常规报告，因此你**无法**仅根据总数据清晰地区分“经典”流量与“AI”流量。对于仅包含展示次数的 AI 可见性数据，请使用生成式 AI 报告。
> - **数据可靠性注意事项：** GSC 的日志记录错误导致 **2025-05-13 至 2026-04-27 期间的展示次数、CTR 和平均排名不可靠**（点击次数不受影响；该问题仅向前修复，**没有回填数据**）。对于跨越该时间段的展示次数/CTR/排名趋势，应谨慎解读；预计修复后展示次数会出现表面上的下降。

> **平台资源（2026）：** Search Console 可以将经过验证的 TikTok、
> Instagram、X 和 YouTube 账号作为独立资源公开。除非账号已通过已声明的 Search
> 个人资料添加，否则应分别验证每个账号。对于 Google 搜索效果分析，请使用这些资源，
> 但不要将其作为平台自身分析工具的替代品。来源：
> developers.google.com/search/docs/monitor-debug/analyze-social-video-content

### `/seo google inspect <url>`

URL 检查：来自 Google 的真实索引状态。

**脚本：** `claude-seo run gsc_inspect.py <url> --json`

返回：判定结果（PASS/FAIL）、覆盖状态、robots.txt 状态、索引状态、
页面抓取状态、规范 URL 选择、移动设备易用性、富媒体搜索结果。

### `/seo google inspect-batch <file>`

从文件批量检查（每行一个 URL）。每个站点每天限制 2,000 次。

**脚本：** `claude-seo run gsc_inspect.py --batch <file> --json`

### `/seo google sitemaps <property>`

列出已提交的站点地图及其状态、错误和警告。站点地图内容报告的仅是
提交数量；对于特定 URL 是否已编入索引，URL Inspection API 才是判断依据。

**脚本：** `claude-seo run gsc_query.py sitemaps --property <property> --json`

---

## 索引 API

### `/seo google index <url>`

通知 Google 某个 URL 已更新。

**脚本：** `claude-seo run indexing_notify.py <url> --json`
**参考：** `references/indexing-api.md`

Indexing API 官方适用于 JobPosting 和 BroadcastEvent/VideoObject 页面。
务必告知用户这一限制。每日配额：200 次发布请求。

### `/seo google index-batch <file>`

从文件批量提交 URL。跟踪配额使用情况。

**脚本：** `claude-seo run indexing_notify.py --batch <file> --json`

---

## GA4 流量

### `/seo google ga4 [property-id]`

自然流量报告：每日会话数、用户数、页面浏览量、跳出率、参与度。

**脚本：** `claude-seo run ga4_report.py --property <id> --json`
**参考：** `references/ga4-data-api.md`
**默认值：** 最近 28 天，筛选为 Organic Search 渠道组。

> **GA4“AI Assistants”渠道（约于 2026-05-13 正式上线）：** GA4 新增了原生的 *AI Assistants* 默认渠道组。由已识别的 AI 助手引荐的会话会获得 `medium=ai-assistant`。Google 识别的来源包括 **ChatGPT、Gemini、Claude、Deepseek、Copilot、Grok**，且该渠道 **不包括** Google AI Overviews / AI Mode。**如有需要，请单独验证 Perplexity**；不受支持的来源可能仍会归入 Referral，而大多数 AI 会话不会携带引荐来源，最终会归入 **Direct**，因此该渠道会低估 AI 流量。仅向前统计，不回填历史数据。

### `/seo google ga4-pages [property-id]`

按会话数排名的热门自然流量落地页。

**脚本：** `claude-seo run ga4_report.py --property <id> --report top-pages --json`

---

## YouTube（视频 SEO）

一些第三方研究报告称，YouTube 提及量与 AI 可见性之间的相关系数为 0.737。应将其视为取决于研究方法的信号。免费使用，仅需 API 密钥。

### `/seo google youtube <query>`

在 YouTube 上搜索视频。返回标题、频道、观看次数、点赞数和时长。

**脚本：** `claude-seo run youtube_search.py search "<query>" --json`
**参考：** `references/youtube-api.md`
**配额：** 每次搜索 100 个单位（免费额度每天 10,000 个单位）。

### `/seo google youtube-video <video_id>`

详细的视频信息 + 标签 + 前 10 条评论。

**脚本：** `claude-seo run youtube_search.py video <video_id> --json`
**配额：** 2 个单位（视频详情 + 评论）。

---

## NLP 内容分析

用于内部内容质量检查的 Google NLP 实体/情感分析输出。请勿将其视为 Google E-E-A-T 评分。

### `/seo google nlp <url-or-text>`

完整的 NLP 分析：实体、情感、内容分类。

**脚本：** `claude-seo run nlp_analyze.py --url <url> --json` 或 `--text "..."`
**参考：** `references/nlp-api.md`
**免费额度：** 每月 5,000 个单位。需要在 GCP 项目中启用结算。

### `/seo google entities <url-or-text>`

仅提取实体（速度更快、配额消耗更少）。

**脚本：** `claude-seo run nlp_analyze.py --url <url> --features entities --json`

---

## 关键词研究（Google Ads）

黄金标准的关键词搜索量数据。需要 Google Ads 账号。

### `/seo google keywords <seed>`

根据种子词生成关键词建议。

**脚本：** `claude-seo run keyword_planner.py ideas "<seed>" --json`
**参考：** `references/keyword-planner-api.md`
**要求：** 在配置中提供 Ads 开发者令牌和客户 ID（第 3 层级）。

### `/seo google volume <keywords>`

查询指定关键词的搜索量（以逗号分隔）。

**脚本：** `claude-seo run keyword_planner.py volume "<kw1>,<kw2>" --json`

---

## 补充功能

### `/seo google entity <query>`

知识图谱实体检查。验证品牌是否存在。

**参考：** `references/supplementary-apis.md`
使用带有 API 密钥的 Knowledge Graph Search API。

### `/seo google safety <url>`

使用 Web Risk API 检查恶意软件/社会工程攻击标记。

**参考：** `references/supplementary-apis.md`

### `/seo google quotas`

显示速率限制表。读取 `references/rate-limits-quotas.md`。

---

## 报告

执行任何分析命令后，主动询问是否生成 PDF/HTML 报告。

### `/seo google report <type>`

生成包含图表和分析数据的专业 PDF 报告。

**脚本：** `claude-seo run google_report.py --type <type> --data <json> --domain <domain> --format pdf`

| 类型 | 输入 | 输出 |
|------|-------|--------|
| `cwv-audit` | PSI + CrUX + CrUX History 数据 | 包含仪表盘、时间线和分布图的 Core Web Vitals 审计报告 |
| `gsc-performance` | GSC 查询数据 | 包含查询表格和快速优化机会的 Search Console 报告 |
| `indexation` | 批量检查数据 | 包含覆盖情况环形图的索引状态报告 |
| `full` | 所有组合数据 | 全面的 Google SEO 报告（包含所有部分） |

**工作流程：**
1. 运行数据收集命令（pagespeed、gsc、inspect-batch 等）
2. 将 JSON 输出保存到文件：`claude-seo run pagespeed_check.py <url> --json > data.json`
3. 生成报告：`claude-seo run google_report.py --type cwv-audit --data data.json --domain <domain>`

**约定：** 分析完成后，建议：“是否生成报告？使用 `/seo google report <type>`”

---

## 速率限制

| API | 每分钟 | 每天 | 身份验证 |
|-----|-----------|---------|------|
| PSI v5 | 240 QPM | 25,000 QPD | API 密钥 |
| CrUX + History | 150 QPM（共享） | 无限制 | API 密钥 |
| GSC Search Analytics | 1,200 QPM/站点 | 30M QPD | 服务账号 |
| GSC URL Inspection | 600 QPM | 2,000 QPD/站点 | 服务账号 |
| Indexing API | 380 RPM | 200 次发布/天 | 服务账号 |
| GA4 Data API | 10 个并发请求 | 约 25K 个令牌/天 | 服务账号 |

## 跨 Skill 集成

- **seo-audit**：生成 `seo-google` agent，以获取实时 CWV 和索引数据（有条件执行）
- **seo-technical**：使用 pagespeed_check.py 获取真实的 CWV 字段数据
- **seo-performance**：使用 CrUX 字段数据补充 Lighthouse 实验室数据
- **seo-sitemap**：GSC 站点地图状态会显示已提交数量、错误和警告；使用网址检查确认实际索引情况
- **seo-content**：GSC 查询数据可为关键词定位提供依据
- **seo-geo**：在可用的情况下，使用 GSC 生成式 AI 效果报告，以及 AI Overviews/AI Mode/Discover 的生成式 AI 纳入/排除控制项

## 输出格式

- CWV 指标：交通信号灯评级（良好 / 需要改进 / 较差）
- 性能报告：使用包含可排序列的表格
- 始终包含数据新鲜度说明
- 将报告保存为 `GOOGLE-API-REPORT-{domain}.md`
- `assets/templates/` 中的 Markdown/LLM 模板：`cwv-audit-report.md`、`gsc-performance-report.md`、`indexation-status-report.md`；与 `google_report.py` 的 PDF 流程不同

## 技术说明

- INP 已于 2024 年 3 月 12 日取代 FID。绝不要引用 FID。
- CrUX 中的 CLS 值以字符串形式编码（例如 `"0.05"`）。脚本会处理解析。
- CrUX 404 表示流量不足，而不是身份验证错误。
- Search Analytics 数据存在 2～3 天的延迟。
- `round_trip_time` 已于 2025 年 2 月在 CrUX 中取代 `effectiveConnectionType`。
- Custom Search JSON API 已于 2025 年停止接受新客户。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 未配置凭据 | 运行 `/seo google setup`。列出仅使用 API 密钥即可运行的第 0 层级命令。 |
| 服务账号缺少 GSC 访问权限 | 报告错误。指示用户：将 `client_email` 添加到 GSC > 设置 > 用户 > 添加。 |
| CrUX 数据不可用（404） | 报告 Chrome 流量不足。建议使用 PSI 实验室数据作为备用方案。 |
| 找不到 GA4 媒体资源 | 报告错误。说明如何在 GA4 管理 > 媒体资源详情中查找媒体资源 ID。 |
| 超出 Indexing API 配额 | 报告每天 200 次的限制。建议优先处理最重要的网址。 |
| 速率限制（429） | 等待后使用指数退避重试。报告触发限制的 API。 |