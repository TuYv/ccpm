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
  version: "2.2.0"
  category: blog
---
# Blog Google：用于博客性能分析的 Google API 数据

直接访问 Google 的 SEO API，用于博客性能分析。提供真实的 Chrome 用户指标、索引状态、搜索性能、实体分析、YouTube
视频发现、关键词搜索量，以及 PDF/HTML 性能报告。

大多数集成在其文档规定的配额范围内不收取使用费。Cloud
Natural Language 需要启用结算，超出每月免费层级后可能产生费用。Google Ads 需要符合条件的账号和开发者令牌。未经用户明确批准，绝不要启用结算或发起付费请求。

## 前置条件

**运行任何命令前，始终检查凭据：**
```bash
python3 skills/blog-google/scripts/run.py google_auth --check --json
```

**配置文件：** `~/.config/claude-seo/google-api.json`（与 claude-seo 共享）
```json
{
  "api_key": "YOUR_GOOGLE_API_KEY",
  "oauth_client_path": "/path/to/client_secret.json",
  "default_property": "sc-domain:example.com",
  "ga4_property_id": "properties/123456789",
  "ads_developer_token": "...",
  "ads_customer_id": "123-456-7890",
  "ads_login_customer_id": "123-456-7890"
}
```

如果缺少配置，请阅读 `references/auth-setup.md`，并引导用户完成设置。

### 凭据层级

| 层级 | 检测方式 | 可用命令 |
|------|-----------|---------|
| **0**（API 密钥） | 存在 `api_key` | `pagespeed`、`crux`、`crux-history`、`youtube`、`nlp` |
| **1**（OAuth/SA） | + OAuth 令牌或服务账号 | 层级 0 + `gsc`、`inspect`、`index` |
| **2**（完整） | + 已配置 `ga4_property_id` | 层级 1 + `ga4` |
| **3**（Ads） | + `ads_developer_token` + `ads_customer_id` | 层级 2 + `keywords` |

运行命令前，始终先告知检测到的层级。

## 快速参考

| 命令 | 功能 | 层级 |
|---------|-------------|------|
| `/blog google setup` | 检查/配置 API 凭据 |: |
| `/blog google pagespeed <url>` | PSI Lighthouse + CrUX 真实用户数据 | 0 |
| `/blog google crux <url>` | 仅 CrUX 真实用户数据（p75 指标） | 0 |
| `/blog google crux-history <url>` | 25 周 CWV 趋势分析 | 0 |
| `/blog google youtube <query>` | YouTube 视频搜索（观看次数、点赞数、时长） | 0 |
| `/blog google nlp <url-or-text>` | NLP 实体提取 + 情感分析 | 0 |
| `/blog google gsc <property>` | Search Console：点击次数、展示次数、CTR、排名 | 1 |
| `/blog google inspect <url>` | URL 检查：索引状态、规范网址 | 1 |
| `/blog google index <url>` | 向 Indexing API 提交 URL | 1 |
| `/blog google ga4 [property-id]` | GA4 自然流量报告 | 2 |
| `/blog google keywords <seed>` | 来自 Google Ads Keyword Planner 的关键词提示 | 3 |
| `/blog google report <type>` | PDF/HTML 性能报告 |: |
| `/blog google quotas` | 显示所有 API 的速率限制 |: |

---

## PageSpeed + CrUX

### `/blog google pagespeed <url>`

为已发布的博客文章组合 Lighthouse 实验室数据和 CrUX 真实用户数据。

**脚本：** `python3 skills/blog-google/scripts/run.py pagespeed_check <url> --json`  
**参考：** `references/api-reference.md`

输出将实验室评分（某一时点的 Lighthouse）与现场数据（28 天的
Chrome 用户指标）合并。CrUX 会首先尝试 URL 级别的数据，失败后回退到来源级别。

### `/blog google crux <url>`

仅限 CrUX 现场数据（不运行 Lighthouse）。速度更快。

**脚本：** `python3 skills/blog-google/scripts/run.py pagespeed_check <url> --crux-only --json`

### `/blog google crux-history <url>`

25 周 CrUX 历史趋势。显示 CWV 指标是在改善、保持稳定还是恶化。

**脚本：** `python3 skills/blog-google/scripts/run.py crux_history <url> --json`

---

## 搜索控制台

### `/blog google gsc <property>`

搜索分析：过去 28 天的点击次数、展示次数、点击率和排名。

**脚本：** `python3 skills/blog-google/scripts/run.py gsc_query --property <property> --json`
**默认值：** 28 天，维度=query,page，类型=web，限制=1000。

包括快速获益检测：排名在 4-10 位且展示次数较高的查询。

专门的 Search Console 生成式 AI 报告正在 Search Console 界面中逐步向部分用户
推出。这些报告分别提供 Search 和 Discover 视图；Search 视图涵盖 AI Overviews
和 AI Mode。不要承诺能够从这些专门视图中获取点击次数、查询或 API 数据。在
Google 发布 API 文档之前，应将该功能报告为 `SKIPPED` 或不可用，并引导用户
前往界面查看。

Google 于 7 月 29 日发布的 Search Central 公告称，面向 Instagram、TikTok、X
和 YouTube 的 Search Console 平台属性已在全球范围内可用。当前的帮助中心仍称
其正在逐步推出。应将此报告为 Google 来源之间的冲突，在用户的账户中验证可用性，
并且不要声称 `/blog google gsc` 能够通过当前 API 获取这些平台报告。

### `/blog google inspect <url>`

URL 检查：来自 Google 的真实索引状态。

**脚本：** `python3 skills/blog-google/scripts/run.py gsc_inspect <url> --json`

返回：判定结果（PASS/FAIL）、覆盖状态、robots.txt 状态、索引状态、
页面抓取状态、规范 URL 选择、移动设备易用性、富媒体搜索结果。

修复规范化问题后，Google 可能会在最多两周内将该 URL 保留在重复内容集群中。
如果当前实现已经正确，且修复发生在这一时间窗口内，应报告为
`PENDING_REEVALUATION`，而不是立即判定为失败。Search Console 的“请求编入索引”
功能受配额限制；应将其保留给重要 URL。

批量检查：`python3 skills/blog-google/scripts/run.py gsc_inspect --batch <file> --json`

---

## 索引 API

### `/blog google index <url>`

通过 Indexing API 通知 Google 某个 URL 已更新。

**脚本：** `python3 skills/blog-google/scripts/run.py indexing_notify <url> --json`
**参考：** `references/api-reference.md`

Indexing API 官方仅适用于 JobPosting 和 BroadcastEvent/VideoObject 页面。
始终告知用户这一限制。每日配额：200 个发布请求。
不要将其描述为 URL 检查“请求编入索引”功能的通用替代方案。

批量操作：`python3 skills/blog-google/scripts/run.py indexing_notify --batch <file> --json`

---

## GA4 流量

### `/blog google ga4 [property-id]`

自然流量报告：每日会话数、用户数、页面浏览量、跳出率、互动度。

**脚本：** `python3 skills/blog-google/scripts/run.py ga4_report --property <id> --json`  
**默认值：** 28 天，筛选为自然搜索渠道组。

如需查看热门落地页：`python3 skills/blog-google/scripts/run.py ga4_report --property <id> --report top-pages --json`

---

## YouTube（视频发现）

YouTube 研究可以为博客主题补充有用且相关的媒体和分发背景。任何第三方可见性相关性都属于观察结果，并非 Google 排名或引用要求。免费使用，仅需 API 密钥。由 blog-write 和 blog-rewrite 用于嵌入视频。

### `/blog google youtube <query>`

搜索与博客主题相关的 YouTube 视频。

**脚本：** `python3 skills/blog-google/scripts/run.py youtube_search search "<query>" --json`  
**配额：** 每次搜索 100 个单位（每天免费 10,000 个单位）。

返回：标题、频道、观看次数、点赞数、时长、描述、标签。

如需获取视频详情和评论：`python3 skills/blog-google/scripts/run.py youtube_search video <video_id> --json`

---

## NLP 内容分析

Google 的实体和情感分析可以支持主题和编辑审查。它不会公开排名系统分数，并且 E-E-A-T 不是 Google 的数值排名因素。

### `/blog google nlp <url-or-text>`

完整的 NLP 分析：实体、情感、内容分类。

**脚本：** `python3 skills/blog-google/scripts/run.py nlp_analyze --url <url> --json`  
**免费层级：** 每月 5,000 个单位。需要在 GCP 项目中启用结算功能。

仅提取实体：`python3 skills/blog-google/scripts/run.py nlp_analyze --url <url> --features entities --json`

---

## 关键词研究（Google Ads）

黄金标准的关键词搜索量数据。需要 Google Ads 账号（Tier 3）。

### `/blog google keywords <seed>`

根据种子词生成关键词创意，用于博客主题研究。

**脚本：** `python3 skills/blog-google/scripts/run.py keyword_planner ideas "<seed>" --json`

如需查询搜索量：`python3 skills/blog-google/scripts/run.py keyword_planner volume "<kw1>,<kw2>" --json`

---

## 报告

### `/blog google report <type>`

生成包含图表和表格的 PDF/HTML 报告。

**脚本：** `python3 skills/blog-google/scripts/run.py google_report --type <type> --data <json> --domain <domain> --format pdf`

| 类型 | 输入 | 输出 |
|------|-------|--------|
| `cwv-audit` | PSI + CrUX + CrUX History 数据 | 包含仪表盘和时间线的 Core Web Vitals 审计 |
| `gsc-performance` | GSC 查询数据 | 包含查询表格的 Search Console 报告 |
| `indexation` | 批量检查数据 | 包含覆盖率环形图的索引状态 |
| `full` | 所有数据合并 | 综合 Google SEO 报告 |

**注意：** PDF 生成需要系统库：`sudo apt install libpango1.0-dev libcairo2-dev`。  
如果 WeasyPrint 不可用或 PDF 渲染失败，则回退为 HTML。

---

## 速率限制

| API | 每分钟 | 每天 | 认证方式 |
|-----|-----------|---------|------|
| PSI v5 | 240 QPM | 25,000 QPD | API 密钥 |
| CrUX + History | 150 QPM（共享） | 不限 | API 密钥 |
| GSC Search Analytics | 1,200 QPM/站点 | 30M QPD | 服务账号 |
| GSC URL Inspection | 600 QPM | 2,000 QPD/站点 | 服务账号 |
| Indexing API | 380 RPM | 每天发布 200 次 | 服务账号 |
| GA4 Data API | 10 个并发（360 为 50 个） | 每天 200K Core Tokens（360 为 2M） | 服务账号 |
| YouTube Data |: | 每天 10,000 个单位 | API 密钥 |
| NLP API |: | 每月 5,000 个单位 | API 密钥（需结算） |

阅读 `references/rate-limits-quotas.md` 以了解详细的配额管理。

## 博客工作流集成

此技能既可由用户调用（`/blog google pagespeed`），也可由其他博客子技能在内部调用：

- **blog-seo-check**：对已发布文章的 URL 运行 PSI + CrUX，以获取实时 CWV 数据
- **blog-rewrite**：进行 NLP 实体分析，以识别 E-E-A-T 实体缺口
- **blog-geo**：获取 GSC 性能数据，以了解真实的搜索展现情况
- **blog-audit**：对所有已发布博客 URL 批量执行 CWV + 索引状态检查
- **blog-write / blog-rewrite**：搜索 YouTube，以嵌入视频

凭据未配置时会优雅降级。

## 报告模板

当工作流请求生成持久化、便于人类阅读的报告时，使用随附的模板。将不可用的账户数据标记为 `SKIPPED`；绝不要使用估算指标填充空白部分。

- `assets/templates/cwv-audit-report.md` 用于 PageSpeed 和 CrUX 证据。
- `assets/templates/gsc-performance-report.md` 用于 Search Analytics 导出数据。
- `assets/templates/indexation-status-report.md` 用于 URL Inspection 证据。

## 技术说明

- INP 已于 2024 年 3 月 12 日取代 FID。绝不要引用 FID。
- CrUX 中的 CLS 值采用字符串编码（例如 `"0.05"`）。脚本会处理解析。
- CrUX 404 表示 Chrome 流量不足，而不是身份验证错误。
- Search Analytics 数据会延迟 2–3 天。
- Indexing API 官方仅适用于 JobPosting/BroadcastEvent 页面。
- 大多数集成在配额范围内无需支付使用费。Cloud Natural Language 需要结算，并且可能产生费用；Google Ads 需要账户和开发者令牌访问权限。
- 在诊断命名更新、规范链接变更、Discover 可见性、Google 生成式 AI 报告、平台属性、首选来源、AMP 或爬虫字节限制问题之前，先阅读 `references/search-currentness.md`。
- 命名更新的日期并不能证明是什么导致了单个网站的变化。部署完成后等待整整一周再进行数据比较，并分别区分 Web、Image、Video 和 News 的表现。
- Googlebot 仅处理受支持文件的前 2MB，以及 PDF 的前 64MB。将关键元数据和主要内容放在截止位置之前。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 未配置凭据 | 运行 `/blog google setup`。列出 Tier 0 命令（仅需 API key）。 |
| 服务账号缺少 GSC 访问权限 | 将 `client_email` 添加到 GSC > Settings > Users > Add。 |
| CrUX 数据不可用（404） | Chrome 流量不足。使用 PSI 实验室数据作为后备。 |
| 未找到 GA4 属性 | 在 GA4 Admin > Property Details 中查找属性 ID。 |
| Indexing API 配额超限 | 每日 200 次的限制。优先处理最重要的 URL。 |
| 速率限制（429） | 等待后使用指数退避重试。 |