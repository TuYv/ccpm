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
  version: "2.3.1"
  category: seo
---
# Google SEO APIs

直接访问 Google 自有的 SEO 数据。弥合基于抓取的分析（现有的 claude-seo skills）与 Google 实时现场数据之间的差距：实际的 Chrome 用户指标、真实的索引状态、搜索表现和自然流量。

所有 API 均免费。设置需要一个 Google Cloud 项目以及 API key 和/或 service account -- 运行 `/seo google setup` 获取分步说明。

## 前置条件

执行任何命令前，检查凭据：
```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run google_auth.py --check --json
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

如果缺少凭据，请阅读 `references/auth-setup.md` 并引导用户完成设置。

### 凭据层级

| 层级 | 检测条件 | 可用命令 |
|------|-----------|------|
| **0** (API Key) | 存在 `api_key` | `pagespeed`、`crux`、`crux-history`、`youtube`、`nlp` |
| **1** (OAuth/SA) | + OAuth token 或 service account | Tier 0 + `gsc`、`inspect`、`sitemaps`、`index` |
| **2** (Full) | + 已配置 `ga4_property_id` | Tier 1 + `ga4`、`ga4-pages` |
| **3** (Ads) | + `ads_developer_token` + `ads_customer_id` | Tier 2 + `keywords`、`volume` |

运行命令前，始终先告知检测到的层级。

## 快速参考

| 命令 | 功能 | 层级 |
|---------|-------------|------|
| `/seo google setup` | 检查/配置 API 凭据 | -- |
| `/seo google pagespeed <url>` | PSI Lighthouse + CrUX 现场数据 | 0 |
| `/seo google crux <url>` | 仅 CrUX 现场数据（p75 指标） | 0 |
| `/seo google crux-history <url>` | 25 周 CWV 趋势分析 | 0 |
| `/seo google gsc <property>` | Search Console：点击次数、展示次数、CTR、排名 | 1 |
| `/seo google inspect <url>` | URL Inspection：索引状态、规范网址、抓取信息 | 1 |
| `/seo google inspect-batch <file>` | 从文件批量执行 URL Inspection | 1 |
| `/seo google sitemaps <property>` | GSC 站点地图状态 | 1 |
| `/seo google index <url>` | 向 Indexing API 提交 URL | 1 |
| `/seo google index-batch <file>` | 批量提交最多 200 个 URL | 1 |
| `/seo google ga4 [property-id]` | GA4 自然流量报告 | 2 |
| `/seo google ga4-pages [property-id]` | 主要自然流量落地页 | 2 |
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

整合 Lighthouse 实验室数据与 CrUX 现场数据。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run pagespeed_check.py <url> --json`
**参考：** `references/pagespeed-crux-api.md`
**默认：** 移动端和桌面端策略，以及所有 Lighthouse 类别。

输出将实验室评分（特定时间点的 Lighthouse 数据）与现场数据（过去 28 天的 Chrome 用户指标）合并。CrUX 首先尝试 URL 级别的数据，失败后回退到来源级别的数据。

### `/seo google crux <url>`

仅 CrUX 现场数据（不运行 Lighthouse）。速度更快。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run pagespeed_check.py <url> --crux-only --json`

### `/seo google crux-history <url>`

过去 25 周的 CrUX 历史趋势。显示 CWV 指标是在改善、保持稳定还是恶化。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run crux_history.py <url> --json`
**参考：** `references/pagespeed-crux-api.md`

输出包括每项指标的趋势方向、百分比变化和每周 p75 值。

---

## Search Console

### `/seo google gsc <property>`

搜索分析：过去 28 天的点击次数、展示次数、点击率和排名。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run gsc_query.py --property <property> --json`
**参考：** `references/search-console-api.md`
**默认：** 28 天，dimensions=query,page，type=web，limit=1000。

包括快速获益检测：排名在 4-10 位且展示次数较高的查询。`totals` 块来自单独的无维度汇总查询，因为查询级别的行可能会省略匿名化的低流量数据。只有当 `totals_complete` 为 true 时，才应将 totals 视为全站数据。`--limit` 限制返回的维度行总数，而不是每次分页请求的大小。

> **GSC 中的 AI 展示位置（2026）：**
> - **生成式 AI 效果报告**（于 2026-06-03 发布）是一个专门展示 **AI Overviews + AI Mode** 可见性的视图。该报告**仅提供展示次数**（不提供点击次数、点击率、排名或查询）；维度包括页面、国家/地区、设备和日期（太平洋时间）；上限为 1,000 行；最新数据为初步数据；此外还存在单独的 Discover 生成式 AI 报告。该功能正在向部分资源逐步推出。
> - **AI Mode 已计入标准效果报告的总数**（Web 搜索类型），AI Mode 中的点击（外部链接点击）和展示次数都会计入标准报告，因此**无法**根据总数清晰区分“经典”流量和“AI”流量。对于仅展示次数的 AI 可见性数据，请使用生成式 AI 报告。
> - **数据可靠性注意事项：** GSC 日志记录错误导致 **2025-05-13 至 2026-04-27 期间的展示次数、点击率和平均排名不可靠**（点击次数不受影响；该问题已修复，但仅对后续数据生效，**没有回填**）。对跨越该时间段的展示次数、点击率和排名趋势应谨慎解读；修复后预计会出现展示次数下降。

> **平台资源（2026）：** Search Console 可以将已验证的 TikTok、
> Instagram、X 和 YouTube 账号作为单独的资源公开。除非账号已通过已声明的 Search
> 个人资料添加，否则请分别验证每个账号。将这些资源用于 Google 搜索效果分析，
> 不要将其作为平台自身分析工具的替代方案。来源：
> developers.google.com/search/docs/monitor-debug/analyze-social-video-content

### `/seo google inspect <url>`

URL 检查：来自 Google 的真实索引状态。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run gsc_inspect.py <url> --json`

返回：判定结果（PASS/FAIL）、覆盖状态、robots.txt 状态、索引状态、
页面抓取状态、规范网址选择、移动设备适用性、富媒体搜索结果。

### `/seo google inspect-batch <file>`

从文件批量检查（每行一个 URL）。每个站点每天限制 2,000 次。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run gsc_inspect.py --batch <file> --json`

### `/seo google sitemaps <property>`

列出已提交的站点地图及其状态、错误和警告。站点地图内容报告的计数仅表示已提交的数量；对于特定 URL 是否已编入索引，URL Inspection API 才是判断依据。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run gsc_query.py sitemaps --property <property> --json`

---

## 索引 API

### `/seo google index <url>`

通知 Google 某个 URL 已更新。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run indexing_notify.py <url> --json`
**参考：** `references/indexing-api.md`

Indexing API 官方仅适用于 JobPosting 和 BroadcastEvent/VideoObject 页面。
务必告知用户此限制。每日配额：200 次发布请求。

### `/seo google index-batch <file>`

从文件批量提交 URL。跟踪配额使用情况。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run indexing_notify.py --batch <file> --json`

---

## GA4 流量

### `/seo google ga4 [property-id]`

自然流量报告：每日会话数、用户数、页面浏览量、跳出率、互动度。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run ga4_report.py --property <id> --json`
**参考：** `references/ga4-data-api.md`
**默认值：** 28 天，筛选为 Organic Search 渠道组。

> **GA4 “AI Assistants” 渠道（约于 2026-05-13 上线）：** GA4 新增了原生的 *AI Assistants* Default Channel Group。由已识别的 AI 助手引荐的会话会获得 `medium=ai-assistant`。Google 识别的来源包括 **ChatGPT、Gemini、Claude、Deepseek、Copilot、Grok**，该渠道**不包括** Google AI Overviews / AI Mode。**如有需要，请单独验证 Perplexity**；不受支持的来源可能仍会归入 Referral，而且大多数 AI 会话不会携带引荐来源，因而会归入 **Direct**，所以该渠道会低估 AI 流量。仅向前生效，不会回填历史数据。

### `/seo google ga4-pages [property-id]`

按会话数排名的热门自然流量落地页。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run ga4_report.py --property <id> --report top-pages --json`

---

## YouTube（视频 SEO）

一些第三方研究报告称，YouTube 提及次数与 AI 可见性之间的相关系数为 0.737。请将其视为取决于研究方法的信号。免费，仅需 API key。

### `/seo google youtube <query>`

搜索 YouTube 视频。返回标题、频道、观看次数、点赞数和时长。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run youtube_search.py search "<query>" --json`
**参考：** `references/youtube-api.md`
**配额：** 每次搜索 100 个单位（免费配额每天 10,000 个单位）。

### `/seo google youtube-video <video_id>`

详细的视频信息、标签和排名前 10 的评论。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run youtube_search.py video <video_id> --json`  
**配额：** 2 个单位（视频详情 + 评论）。

---

## NLP 内容分析

用于内部内容质量检查的 Google NLP 实体/情感输出。不要将其视为 Google E-E-A-T 评分。

### `/seo google nlp <url-or-text>`

完整的 NLP 分析：实体、情感和内容分类。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run nlp_analyze.py --url <url> --json` 或 `--text "..."`  
**参考：** `references/nlp-api.md`  
**免费层级：** 每月 5,000 个单位。需要在 GCP 项目中启用结算。

### `/seo google entities <url-or-text>`

仅提取实体（速度更快，配额消耗更少）。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run nlp_analyze.py --url <url> --features entities --json`

---

## 关键词研究（Google Ads）

黄金标准的关键词搜索量数据。需要 Google Ads 账号。

### `/seo google keywords <seed>`

根据种子词生成关键词提示。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run keyword_planner.py ideas "<seed>" --json`  
**参考：** `references/keyword-planner-api.md`  
**需要：** 在配置中设置 Ads 开发者令牌和客户 ID（第 3 层级）。

### `/seo google volume <keywords>`

查询指定关键词的搜索量（以逗号分隔）。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run keyword_planner.py volume "<kw1>,<kw2>" --json`

---

## 补充功能

### `/seo google entity <query>`

知识图谱实体检查。验证品牌是否存在。

**参考：** `references/supplementary-apis.md`  
使用带 API 密钥的 Knowledge Graph Search API。

### `/seo google safety <url>`

使用 Web Risk API 检查恶意软件/社会工程学风险标记。

**参考：** `references/supplementary-apis.md`

### `/seo google quotas`

显示速率限制表。读取 `references/rate-limits-quotas.md`。

---

## 报告

在任何分析命令之后，提供生成 PDF/HTML 报告的选项。

### `/seo google report <type>`

生成包含图表和分析数据的专业 PDF 报告。

**脚本：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run google_report.py --type <type> --data <json> --domain <domain> --format pdf`

| 类型 | 输入 | 输出 |
|------|-------|--------|
| `cwv-audit` | PSI + CrUX + CrUX History 数据 | 包含仪表盘、时间线和分布图的核心网页指标审计 |
| `gsc-performance` | GSC 查询数据 | 包含查询表格和快速改进项的 Search Console 报告 |
| `indexation` | 批量检查数据 | 包含索引状态和覆盖率环形图 |
| `full` | 所有合并数据 | 综合 Google SEO 报告（包含所有部分） |

**工作流：**
1. 运行数据收集命令（pagespeed、gsc、inspect-batch 等）
2. 将 JSON 输出保存到文件：`"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run pagespeed_check.py <url> --json > data.json`
3. 生成报告：`"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run google_report.py --type cwv-audit --data data.json --domain <domain>`

**约定：**完成分析后，建议：“生成报告？使用 `/seo google report <type>`”

---

## 速率限制

| API | 每分钟 | 每天 | 身份验证 |
|-----|-----------|---------|------|
| PSI v5 | 240 QPM | 25,000 QPD | API Key |
| CrUX + History | 150 QPM（共享） | 无限 | API Key |
| GSC Search Analytics | 1,200 QPM/site | 30M QPD | Service Account |
| GSC URL Inspection | 600 QPM | 2,000 QPD/site | Service Account |
| Indexing API | 380 RPM | 每天 200 次发布 | Service Account |
| GA4 Data API | 10 个并发请求 | 约 25K tokens/day | Service Account |

## 跨 Skill 集成

- **seo-audit**：生成 `seo-google` agent，以获取实时 CWV + indexation 数据（有条件）
- **seo-technical**：使用 pagespeed_check.py 获取真实 CWV 字段数据
- **seo-performance**：CrUX 字段数据补充 Lighthouse 实验室数据
- **seo-sitemap**：GSC sitemap 状态显示已提交数量、错误和警告；使用 URL Inspection 获取 indexation 的真实情况
- **seo-content**：GSC 查询数据为关键词定位提供参考
- **seo-geo**：在可用时，使用 GSC Generative AI performance reports 以及 AI Overviews/AI Mode/Discover gen-AI include/exclude 控制项

## 输出格式

- CWV 指标：使用交通灯评级（Good / Needs Improvement / Poor）
- 性能报告：使用带可排序列的表格
- 始终包含数据新鲜度说明
- 将报告保存为 `GOOGLE-API-REPORT-{domain}.md`
- `assets/templates/` 中的 Markdown/LLM 模板：`cwv-audit-report.md`、`gsc-performance-report.md`、`indexation-status-report.md`；这些模板不同于 `google_report.py` 的 PDF pipeline

## 技术说明

- INP 于 2024 年 3 月 12 日取代 FID。绝不要引用 FID。
- CrUX 中的 CLS 值以字符串编码（例如 `"0.05"`）。脚本会处理解析。
- CrUX 404 = 流量不足，而不是身份验证错误。
- Search Analytics 数据存在 2 至 3 天的延迟。
- CrUX 中的 `round_trip_time` 于 2025 年 2 月取代 `effectiveConnectionType`。
- Custom Search JSON API 已于 2025 年对新客户关闭。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 未配置凭据 | 运行 `/seo google setup`。列出仅使用 API key 即可运行的 Tier 0 命令。 |
| Service account 缺少 GSC 访问权限 | 报告错误。说明：将 `client_email` 添加到 GSC > Settings > Users > Add。 |
| CrUX 数据不可用（404） | 报告 Chrome 流量不足。建议将 PSI 实验室数据作为备用方案。 |
| 找不到 GA4 property | 报告错误。展示如何在 GA4 Admin > Property Details 中查找 property ID。 |
| Indexing API 配额超限 | 报告每天 200 次的限制。建议优先处理最重要的 URL。 |
| 速率限制（429） | 等待并使用指数退避重试。报告触发限制的 API。 |