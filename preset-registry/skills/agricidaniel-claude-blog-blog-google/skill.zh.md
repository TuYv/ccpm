---
name: blog-google
description: >
  Google API integration for blog performance: PageSpeed Insights, CrUX Core Web
  Vitals with 25-week history, Search Console performance, URL Inspection, Indexing
  API, GA4 organic traffic, NLP entity analysis for E-E-A-T, YouTube video search
  for embedding, and Google Ads Keyword Planner. Progressive feature availability
  based on credential tier (API key, OAuth/service account, GA4, Ads). Shares
  config with claude-seo at ~/.config/claude-seo/google-api.json. Use when user
  says "google data", "page speed", "core web vitals", "search console",
  "indexation", "GA4", "keyword research", "nlp entities", "blog performance",
  "youtube search", "google api setup".
user-invokable: true
argument-hint: "[setup|pagespeed|crux|crux-history|gsc|inspect|index|ga4|nlp|youtube|keywords|report|quotas] [url|property|query]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.1.1"
  category: blog
---
# Blog Google：用于博客性能分析的 Google API 数据

直接访问 Google 的 SEO API，进行博客性能分析。提供真实的
Chrome 用户指标、索引状态、搜索表现、实体分析、YouTube
视频发现、关键词搜索量，以及 PDF/HTML 性能报告。

所有 API 在正常使用量下均免费。设置时需要一个 Google Cloud 项目，
以及 API 密钥和/或服务账号。

## 前置条件

**运行任何命令前，始终先检查凭据：**
```bash
python3 skills/blog-google/scripts/run.py google_auth --check --json
```

**配置文件：** `~/.config/claude-seo/google-api.json`（与 claude-seo 共享）
```json
{
  "api_key": "AIzaSy...",
  "oauth_client_path": "/path/to/client_secret.json",
  "default_property": "sc-domain:example.com",
  "ga4_property_id": "properties/123456789",
  "ads_developer_token": "...",
  "ads_customer_id": "123-456-7890",
  "ads_login_customer_id": "123-456-7890"
}
```

如果缺失，请阅读 `references/auth-setup.md`，并逐步引导用户完成设置。

### 凭据层级

| 层级 | 检测条件 | 可用命令 |
|------|-----------|-------------------|
| **0**（API 密钥） | 存在 `api_key` | `pagespeed`、`crux`、`crux-history`、`youtube`、`nlp` |
| **1**（OAuth/SA） | + OAuth 令牌或服务账号 | 层级 0 + `gsc`、`inspect`、`index` |
| **2**（完整） | + 已配置 `ga4_property_id` | 层级 1 + `ga4` |
| **3**（Ads） | + `ads_developer_token` + `ads_customer_id` | 层级 2 + `keywords` |

运行命令前，始终告知用户检测到的层级。

## 快速参考

| 命令 | 功能 | 层级 |
|---------|-------------|------|
| `/blog google setup` | 检查/配置 API 凭据 |: |
| `/blog google pagespeed <url>` | PSI Lighthouse + CrUX 实际数据 | 0 |
| `/blog google crux <url>` | 仅获取 CrUX 实际数据（p75 指标） | 0 |
| `/blog google crux-history <url>` | 25 周 CWV 趋势分析 | 0 |
| `/blog google youtube <query>` | YouTube 视频搜索（观看次数、点赞数、时长） | 0 |
| `/blog google nlp <url-or-text>` | NLP 实体提取 + 情感分析 | 0 |
| `/blog google gsc <property>` | Search Console：点击次数、展示次数、CTR、排名 | 1 |
| `/blog google inspect <url>` | URL 检查：索引状态、规范网址 | 1 |
| `/blog google index <url>` | 将 URL 提交至 Indexing API | 1 |
| `/blog google ga4 [property-id]` | GA4 自然搜索流量报告 | 2 |
| `/blog google keywords <seed>` | 来自 Google Ads Keyword Planner 的关键词建议 | 3 |
| `/blog google report <type>` | PDF/HTML 性能报告 |: |
| `/blog google quotas` | 显示所有 API 的速率限制 |: |

---

## PageSpeed + CrUX

### `/blog google pagespeed <url>`

针对已发布博客文章的 Lighthouse 实验室数据 + CrUX 实际数据组合。

**脚本：** `python3 skills/blog-google/scripts/run.py pagespeed_check <url> --json`
**参考：** `references/api-reference.md`

输出将实验室评分（特定时间点的 Lighthouse 数据）与实际数据（28 天的
Chrome 用户指标）合并。CrUX 会先尝试获取 URL 级数据，如不可用则回退到来源级数据。

### `/blog google crux <url>`

仅获取 CrUX 实测数据（不运行 Lighthouse）。速度更快。

**脚本：** `python3 skills/blog-google/scripts/run.py pagespeed_check <url> --crux-only --json`

### `/blog google crux-history <url>`

25 周的 CrUX 历史趋势。显示 CWV 指标是在改善、保持稳定还是恶化。

**脚本：** `python3 skills/blog-google/scripts/run.py crux_history <url> --json`

---

## Search Console

### `/blog google gsc <property>`

搜索分析：过去 28 天的点击次数、展示次数、CTR 和排名。

**脚本：** `python3 skills/blog-google/scripts/run.py gsc_query --property <property> --json`
**默认值：** 28 天，dimensions=query,page，type=web，limit=1000。

包括快速优化机会检测：展示次数较高且排名在第 4-10 位的查询。

Search Console 中专门的生成式 AI 报告目前正在 UI 中面向部分用户逐步推出。
这些报告具有独立的搜索和 Discover 视图；搜索视图涵盖 AI Overviews 和 AI Mode。
不要承诺能够从这些专用视图中获取点击次数、查询或通过 API 检索数据。在 Google
提供 API 文档之前，应将该能力报告为 `SKIPPED` 或不可用，并引导用户前往 UI。

Search Console 针对 Instagram、TikTok、X 和 YouTube 的平台资源也在逐步推出。
其 UI 可以显示搜索和 Discover 效果数据，但 `/blog google gsc` 不得声称能够通过
当前 API 检索这些平台报告。

### `/blog google inspect <url>`

网址检查：获取 Google 中真实的索引状态。

**脚本：** `python3 skills/blog-google/scripts/run.py gsc_inspect <url> --json`

返回：verdict（PASS/FAIL）、coverage state、robots.txt status、indexing state、
page fetch state、canonical selection、mobile usability、rich results。

修复规范化问题后，Google 可能会将该 URL 保留在重复网页集群中长达两周。
如果当前实现已经正确，并且修复时间仍在该期限内，应报告
`PENDING_REEVALUATION`，而不是立即判定失败。Search Console 的请求编入索引功能
存在配额限制；请仅将其用于重要 URL。

批量检查：`python3 skills/blog-google/scripts/run.py gsc_inspect --batch <file> --json`

---

## Indexing API

### `/blog google index <url>`

通过 Indexing API 通知 Google 某个 URL 已更新。

**脚本：** `python3 skills/blog-google/scripts/run.py indexing_notify <url> --json`
**参考：** `references/api-reference.md`

Indexing API 官方仅适用于 JobPosting 和 BroadcastEvent/VideoObject 页面。
务必告知用户此限制。每日配额：200 个发布请求。
不要将其描述为网址检查中请求编入索引功能的通用替代方案。

批量操作：`python3 skills/blog-google/scripts/run.py indexing_notify --batch <file> --json`

---

## GA4 流量

### `/blog google ga4 [property-id]`

自然流量报告：每日会话数、用户数、网页浏览量、跳出率和互动情况。

**脚本：** `python3 skills/blog-google/scripts/run.py ga4_report --property <id> --json`
**默认值：** 28 天，筛选为 Organic Search 渠道组。

对于热门落地页：`python3 skills/blog-google/scripts/run.py ga4_report --property <id> --report top-pages --json`

---

## YouTube（视频发现）

YouTube 调研可以补充有用的相关媒体和分发背景信息。任何第三方可见度相关性都只是观察结果，并非 Google 排名或引用要求。免费，仅需 API 密钥。由 blog-write 和 blog-rewrite 用于嵌入视频。

### `/blog google youtube <query>`

在 YouTube 上搜索与博客主题相关的视频。

**脚本：** `python3 skills/blog-google/scripts/run.py youtube_search search "<query>" --json`
**配额：** 每次搜索 100 个单位（每天免费 10,000 个单位）。

返回：标题、频道、观看次数、点赞数、时长、描述、标签。

如需视频详情和评论：`python3 skills/blog-google/scripts/run.py youtube_search video <video_id> --json`

---

## NLP 内容分析

Google 的实体和情感分析可辅助主题和编辑审核。它不会公开排名系统分数，而且 E-E-A-T 并不是一个数值化的 Google 排名因素。

### `/blog google nlp <url-or-text>`

完整 NLP 分析：实体、情感、内容分类。

**脚本：** `python3 skills/blog-google/scripts/run.py nlp_analyze --url <url> --json`
**免费层级：** 每月 5,000 个单位。要求在 GCP 项目中启用结算功能。

仅提取实体：`python3 skills/blog-google/scripts/run.py nlp_analyze --url <url> --features entities --json`

---

## 关键词研究（Google Ads）

行业标杆级的关键词搜索量数据。需要 Google Ads 账号（Tier 3）。

### `/blog google keywords <seed>`

根据种子词生成关键词建议，用于博客主题调研。

**脚本：** `python3 skills/blog-google/scripts/run.py keyword_planner ideas "<seed>" --json`

查询搜索量：`python3 skills/blog-google/scripts/run.py keyword_planner volume "<kw1>,<kw2>" --json`

---

## 报告

### `/blog google report <type>`

生成包含图表和表格的 PDF/HTML 报告。

**脚本：** `python3 skills/blog-google/scripts/run.py google_report --type <type> --data <json> --domain <domain> --format pdf`

| 类型 | 输入 | 输出 |
|------|-------|--------|
| `cwv-audit` | PSI + CrUX + CrUX History 数据 | 包含仪表和时间线的 Core Web Vitals 审计 |
| `gsc-performance` | GSC 查询数据 | 包含查询表格的 Search Console 报告 |
| `indexation` | 批量检查数据 | 包含覆盖情况环形图的索引状态 |
| `full` | 所有数据的组合 | 全面的 Google SEO 报告 |

**注意：** 生成 PDF 需要系统库：`sudo apt install libpango1.0-dev libcairo2-dev`。
如果 WeasyPrint 不可用或 PDF 渲染失败，则回退为 HTML。

---

## 速率限制

| API | 每分钟 | 每天 | 身份验证 |
|-----|-----------|---------|------|
| PSI v5 | 240 QPM | 25,000 QPD | API 密钥 |
| CrUX + History | 150 QPM（共享） | 无限制 | API 密钥 |
| GSC Search Analytics | 1,200 QPM/网站 | 30M QPD | 服务账号 |
| GSC URL Inspection | 600 QPM | 2,000 QPD/网站 | 服务账号 |
| Indexing API | 380 RPM | 每天发布 200 次 | 服务账号 |
| GA4 Data API | 10 个并发请求（360 为 50 个） | 每天 200K Core Tokens（360 为 2M） | 服务账号 |
| YouTube Data |: | 每天 10,000 个单位 | API 密钥 |
| NLP API |: | 每月 5,000 个单位 | API 密钥（需启用结算） |

阅读 `references/rate-limits-quotas.md`，了解详细的配额管理方法。

## 博客工作流集成

此技能既可由用户调用（`/blog google pagespeed`），也可由其他博客子技能在内部调用：

- **blog-seo-check**：对已发布文章的 URL 运行 PSI + CrUX，以获取实时 CWV 数据
- **blog-rewrite**：进行 NLP 实体分析，以识别 E-E-A-T 实体缺口
- **blog-geo**：获取 GSC 效果数据，以深入了解实际搜索展示情况
- **blog-audit**：对所有已发布的博客 URL 批量执行 CWV + 索引收录检查
- **blog-write / blog-rewrite**：搜索 YouTube 视频以进行嵌入

未配置凭据时会优雅降级。

## 技术说明

- INP 已于 2024 年 3 月 12 日取代 FID。切勿引用 FID。
- 来自 CrUX 的 CLS 值采用字符串编码（例如，"0.05"）。脚本会处理解析。
- CrUX 404 表示 Chrome 流量不足，而非身份验证错误。
- Search Analytics 数据存在 2-3 天的延迟。
- Indexing API 官方仅适用于 JobPosting/BroadcastEvent 页面。
- 所有使用的 Google API 在正常使用量下均为免费。
- 在诊断命名更新、规范网址变更、Discover 可见性、Google 生成式 AI 报告、平台属性、Preferred Sources、AMP 或抓取工具字节限制问题之前，请阅读 `references/search-currentness.md`。
- 命名更新的日期无法证明单个网站发生变化的原因。请在发布完成后等待整整一周再比较数据，并分别分析 Web、Image、Video 和 News 的效果。
- Googlebot 仅处理受支持文件的前 2MB，以及 PDF 的前 64MB。请将关键元数据和主要内容置于截断位置之前。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 未配置凭据 | 运行 `/blog google setup`。列出 Tier 0 命令（仅需 API 密钥）。 |
| 服务账号缺少 GSC 访问权限 | 将 `client_email` 添加到 GSC > 设置 > 用户 > 添加。 |
| CrUX 数据不可用（404） | Chrome 流量不足。使用 PSI 实验室数据作为后备。 |
| 找不到 GA4 媒体资源 | 在 GA4 管理 > 媒体资源详细信息中查找媒体资源 ID。 |
| 超出 Indexing API 配额 | 每日限制为 200 次。优先处理最重要的 URL。 |
| 速率限制（429） | 等待，并使用指数退避重试。 |