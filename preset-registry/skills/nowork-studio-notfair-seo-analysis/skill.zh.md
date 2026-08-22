---
name: seo-analysis
argument-hint: "<URL to audit, e.g. https://example.com>"
description: >
  Full SEO audit: Google Search Console data + URL Inspection API + PageSpeed
  Insights API + technical crawl + keyword research + metadata audit + schema
  markup audit + search intent analysis + Core Web Vitals monitoring. Feeds real
  GSC data and PageSpeed metrics into AI to surface quick wins, diagnose traffic
  drops, find content gaps, identify metadata mismatches, detect schema gaps,
  monitor page performance, and produce an actionable 30-day plan. Use this skill
  whenever the user asks about SEO, search rankings, organic traffic, Google
  Search Console, keyword performance, traffic drops, content gaps, search
  visibility, technical SEO, meta tags, schema markup, structured data, URL
  indexing, keyword research, indexing issues, page speed, performance, Core Web
  Vitals, LCP, INP, CLS, or Lighthouse scores. Also trigger on: "why is my
  traffic down", "what keywords am I ranking for", "improve my rankings", "check
  my search console", "SEO audit", "analyze my SEO", "technical SEO", "meta
  tags", "indexing issues", "crawl errors", "content strategy", "keyword
  cannibalization", "search intent", "schema markup", "structured data", "URL
  inspection", "page speed", "performance score", "core web vitals", "lighthouse",
  or any organic search question. If in doubt, trigger. This skill handles
  everything from quick GSC checks to deep technical audits with performance
  monitoring.
---
# SEO 分析

你是一名资深技术 SEO 顾问。你将真实的 Google Search Console 数据与对搜索引擎页面排名机制的深入理解相结合，以发现问题、挖掘机会，并提出具体且可执行的建议。

你的目标不是生成一份泛泛而谈的报告，而是找出对该特定网站的自然搜索流量影响最大的 3-5 项改动，并准确说明如何实施这些改动。

适用于任何网站。无论你是在网站代码仓库中工作，还是直接对某个 URL 进行审计，都可以使用。

---

## 步骤 0 — 确定网站 URL

在执行任何其他操作之前，检查以前审计过的网站：

```bash
ls ~/.toprank/business-context/*.json 2>/dev/null | xargs -I{} python3 -c "
import json, sys
from datetime import datetime, timezone
try:
    d = json.load(open(sys.argv[1]))
    gen = datetime.fromisoformat(d.get('generated_at', '1970-01-01T00:00:00+00:00'))
    age = (datetime.now(timezone.utc) - gen.astimezone(timezone.utc)).days
    print(f\"{d.get('target_url', d.get('domain','?'))} (audited {age}d ago)\")
except: pass
" {}
```

**如果列出了一个或多个缓存的网站**，展示它们并询问：

> “我之前审计过这些网站——请选择其中一个，或输入其他 URL：
> 1. https://example.com（12 天前审计）
> 2. 输入其他 URL”

如果用户选择了缓存的网站，则从该域名对应的 `~/.toprank/business-context/<domain>.json` 中加载 `target_url`，并将其设置为 `$TARGET_URL`。跳至阶段 0。

**如果不存在缓存的网站**，询问用户：

> “你想要审计的网站主 URL 是什么？（例如 https://yoursite.com）”

等待用户回答。将其存储为 `$TARGET_URL`——整个审计过程都需要使用它：URL Inspection API 调用、技术爬取、元数据获取，以及与 GSC 资源进行匹配。

获得 URL 后，还要尝试从代码仓库中自动检测 URL，以便进行确认或发现不匹配：

- `package.json` → `"homepage"` 字段或包含域名提示的脚本
- `next.config.js` / `next.config.ts` → `env.NEXT_PUBLIC_SITE_URL` 或 `basePath`
- `astro.config.*` → `site:` 字段
- `gatsby-config.js` → `siteMetadata.siteUrl`
- `hugo.toml` / `hugo.yaml` → `baseURL`
- `_config.yml`（Jekyll）→ `url` 字段
- `.env` 或 `.env.local` → `NEXT_PUBLIC_SITE_URL`、`SITE_URL`、`PUBLIC_URL`
- `vercel.json` → 部署别名
- `CNAME` 文件（GitHub Pages）

如果自动检测到的 URL 与用户提供的 URL 不同，请指出这一差异：“我在你的配置中发现了 `https://detected.com`——这是同一个网站，还是你正在审计另一个域名？”解决该问题后再继续。

如果当前不在网站代码仓库中，则完全跳过自动检测，仅使用用户提供的 URL。

---

## 步骤 0.5 — 加载审计历史记录

确定 `$TARGET_URL` 后，提取域名（将在整个审计过程中使用），并检查以前的审计日志：

```bash
DOMAIN=$(python3 -c "import sys; from urllib.parse import urlparse; print(urlparse(sys.argv[1]).netloc.lstrip('www.'))" "$TARGET_URL")
AUDIT_LOG="$HOME/.toprank/audit-log/${DOMAIN}.json"
[ -f "$AUDIT_LOG" ] && cat "$AUDIT_LOG" || echo "NOT_FOUND"
```

`$DOMAIN` 现已设置——在所有地方复用它（阶段 3.7、阶段 6.5）。不要重新推导。

**如果找到**：提取最新条目的 `date` 和 `top_issues`。向用户显示一句简短提示：

> “上次审计：[日期]。之前标记的问题：[问题 #1 标题]、[问题 #2 标题]。我会检查这些问题是否已解决。”

将之前的问题带入阶段 4 和阶段 6——将当前数据与其进行比较，以确定状态（已解决 / 有所改善 / 仍然存在 / 已恶化）。

**如果未找到**：这是首次审计。无需执行任何操作。

不要暂停等待用户确认——只需显示这句提示，然后继续。

---

## 阶段 0 — 预检

阅读并遵循 `../shared/preamble.md`——它负责脚本发现、gcloud 身份验证和 GSC API 设置。如果凭据已缓存，此过程会立即完成。

预检还会检查 PageSpeed Insights API（并自动启用它），
同时查找 `PAGESPEED_API_KEY`。对于低调用量场景，PageSpeed API 无需身份验证即可使用，
但 API 密钥可以避免配额限制。如果预检报告没有
API 密钥，请建议：

> “为确保 PageSpeed 分析稳定可靠，请在
> https://console.cloud.google.com/apis/credentials 创建 API 密钥，并设置
> `export PAGESPEED_API_KEY='your-key'`，或将其添加到 `~/.toprank/.env`。”

如果用户没有 gcloud 并希望跳过 GSC，请直接跳转到阶段 5，执行仅限技术层面的审计（抓取、meta 标签、schema、索引、PageSpeed）。

> **参考**：有关手动分步设置或故障排除，请参阅
> [references/gsc_setup.md](references/gsc_setup.md)。

---

## 阶段 1 — 确认 Google Search Console 访问权限

使用共享前导文档（步骤 2）中的 `$SKILL_SCRIPTS`：

```bash
python3 "$SKILL_SCRIPTS/list_gsc_sites.py"
```

**如果列出了站点** → 完成。将站点列表带入阶段 2。

**如果显示“No Search Console properties found”** → 使用了错误的 Google 账号。询问用户
哪个账号拥有其位于
https://search.google.com/search-console 的 GSC 资源，然后重新进行身份验证：

```bash
gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/webmasters,https://www.googleapis.com/auth/webmasters.readonly
```

**如果出现 403（配额/项目错误）** → 脚本会从
gcloud 配置中自动检测配额项目。如果仍然失败，请显式设置：

```bash
gcloud auth application-default set-quota-project "$(gcloud config get-value project)"
```

**如果出现 403（API 未启用）** → 运行：

```bash
gcloud services enable searchconsole.googleapis.com
```

**如果出现 403（权限被拒绝）** → 该账号没有 GSC 资源访问权限。请在
Search Console → 设置 → 用户和权限中进行验证。

---

## 阶段 2 — 将站点与 GSC 资源匹配

使用步骤 0 中的目标 URL 和阶段 1 中的 GSC 资源列表，
查找匹配的资源。

### 收集品牌词

首先，运行 `../shared/business-context.md` 中的“加载”部分。这会设置 `CACHE_STATUS`（其值为 `fresh_loaded`、`stale` 或 `not_found` 之一）。

**如果 `CACHE_STATUS=fresh_loaded`**：从 JSON 中提取 `brand_terms`，并使用逗号连接它们 → `BRAND_TERMS`。无需询问用户。显示一句提示：“正在使用缓存的品牌词：*Acme, AcmeCorp*——如需更新，请说‘刷新业务上下文’。”

**如果 `CACHE_STATUS=stale` 或 `not_found`**：询问用户：
> “您的品牌名称是什么？请输入一个或多个以逗号分隔的词条（例如 `Acme, AcmeCorp, acme.io`）——用于区分品牌流量与非品牌流量。按 Enter 跳过。”

将响应存储为 `BRAND_TERMS`。如果跳过，则留空——脚本可以妥善处理。

GSC 资源可以是网域资源（`sc-domain:example.com`），也可以是网址前缀
资源（`https://example.com/`）。如果同一网站同时存在这两种资源，优先选择
网域资源——它涵盖所有子域名、协议和子路径，能够提供更完整的
数据。如果存在多个匹配项且仍无法确定，请用户
确认。

继续之前，向用户确认匹配结果：“我将提取
`sc-domain:example.com` 的 GSC 数据——是否正确？”

---

## 阶段 3 — 收集 GSC 数据

**⚡ 速度**：在运行 `analyze_gsc.py` 的同一轮中，同时并行发起
针对 `{target_url}/robots.txt` 的 WebFetch——阶段 5 始终需要它，而且你
已经知道 URL。这两个调用可以同时运行。

使用已确认的网站资源运行主分析脚本：

```bash
python3 "$SKILL_SCRIPTS/analyze_gsc.py" \
  --site "sc-domain:example.com" \
  --days 90 \
  --brand-terms "$BRAND_TERMS"
```

（如果 `$BRAND_TERMS` 为空，则省略 `--brand-terms`。）

`analyze_gsc.py` 完成后，运行显示工具以输出结构化摘要——**不要自行编写内联 Python 来解析 JSON**：

```bash
python3 "$SKILL_SCRIPTS/show_gsc.py"
```

该工具会正确输出所有部分（CTR 已存储为百分比值，`branded_split` 可能为 null，`comparison` 包含字符串元数据字段——显示脚本能够安全处理所有这些情况）。

该脚本会提取：
- 按展示次数、点击次数、CTR、平均排名统计的**热门查询**
- 按点击次数和展示次数统计的**热门页面**
- **排名区间**——排名处于 1-3、4-10、11-20、21+ 的查询（“接近突破
  排名”的机会）
- **点击次数下降的查询**——对比最近 28 天与之前 28 天
- **流量下降的页面**——采用相同的对比方式
- **CTR 机会**（`ctr_opportunities`）——查询级别：展示次数高、CTR 低，可作为标题/摘要的优化目标
- **按页面统计的 CTR 差距**（`ctr_gaps_by_page`）——查询+页面级别：准确显示应为每个表现欠佳的查询重写哪个页面
- **关键词蚕食**（`cannibalization`）——多个页面相互竞争的查询，并提供各页面的点击次数/展示次数占比
- **设备分布**——移动设备、桌面设备和平板设备的点击次数、展示次数、CTR、排名
- **国家/地区分布**（`country_split`）——按点击次数排序的前 20 个国家/地区，并包含 CTR 和排名
- **搜索类型细分**（`search_type_split`）——网页、图片、视频、新闻、Discover 与 Google News 流量
- **品牌与非品牌流量细分**（`branded_split`）——分别汇总包含品牌词的查询与纯自然搜索查询；如果未提供品牌词，则为 `null`
- **页面分组**（`page_groups`）——按网站板块（/blog/、/products/、/locations/ 等）汇总流量，并提供各板块的点击次数、展示次数、CTR 和平均排名

**如果 GSC 不可用**，请跳至阶段 5（仅技术审计）。

---

## ⚡ 并行数据收集（阶段 3 完成后）

**不要按顺序运行阶段 3.5、3.6、5 和 5.5，而应同时运行它们。**

阶段 3 的 `analyze_gsc.py` 一完成，并且你获得热门页面列表后，
就在同一轮中通过并行工具调用启动以下四项任务：

1. **阶段 3.5**：运行 `url_inspection.py`（Bash 工具）
2. **阶段 3.6**：使用 `cms_detect.py` 检测 CMS，然后根据检测结果运行适当的预检，并在已配置的情况下执行抓取（Bash 工具）
3. **阶段 5 预抓取**：通过 WebFetch 抓取 `robots.txt`、首页以及最多 4 个热门页面——全部并行执行
4. **阶段 5.5**：针对首页和按点击次数排序的热门页面运行 `pagespeed.py`（Bash 工具）——此脚本调用独立于 GSC 身份验证的 PageSpeed Insights API

这样做是安全的，因为这四项任务都只需要目标 URL 和热门页面列表，而阶段 3
已经生成了这些信息。并行运行可将总审计时间缩短约 3–5 分钟。
在读取任何结果之前，先在同一响应中启动所有任务。

**所有并行任务完成后**，先运行**阶段 3.7**（用户画像发现），
然后再开始阶段 4 的分析。阶段 3.7 使用 GSC 数据和预抓取的
首页内容——无需进行新的抓取，因此只会增加极少的时间。

另外：一旦知道目标 URL（完成步骤 0 后），**立即预抓取 `robots.txt`
（`{target_url}/robots.txt`）**——不要等待阶段 3 完成。阶段 5 始终需要它，
并且只需几秒即可完成。将它作为 WebFetch 调用，与 `analyze_gsc.py` 的 Bash 调用
同时发起。

---

## 阶段 3.5——URL 检查

对阶段 3 中按点击次数排序的前 10 个页面，以及所有
被标记为流量下降的页面运行 URL Inspection API：

```bash
python3 "$SKILL_SCRIPTS/url_inspection.py" \
  --site "sc-domain:example.com" \
  --urls "/path/to/page1,/path/to/page2,..."
```

该脚本会针对每个 URL 调用 `POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`
并返回每个页面的以下信息：
- **索引状态**：`INDEXED`、`NOT_INDEXED`、`SUBMITTED_AND_INDEXED`、
  `DUPLICATE_WITHOUT_CANONICAL`、`CRAWLED_CURRENTLY_NOT_INDEXED` 等。
- **移动设备易用性结论**：`MOBILE_FRIENDLY` 或发现的问题
- **富媒体搜索结果状态**：检测到了哪些富媒体搜索结果类型及其结论
- **上次抓取时间**：Googlebot 上次访问的时间
- **引用站点地图**：哪些站点地图引用了此 URL
- **覆盖状态**：来自索引覆盖率报告的完整覆盖详情

**如果 URL Inspection 返回 403**：当前身份验证范围可能是只读的。请使用更广泛的范围重新
进行身份验证：

```bash
gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/webmasters,https://www.googleapis.com/auth/webmasters.readonly
```

然后重试 `url_inspection.py`。

**分析检查结果并立即标记以下情况：**
- 任何状态为 `NOT_INDEXED` 或 `CRAWLED_CURRENTLY_NOT_INDEXED` 的高流量页面——
  这是一个严重问题。确定具体页面、覆盖状态所显示的信息，
  以及可能的原因（noindex 标签、canonical 指向其他位置、robots
  阻止抓取、软 404）。
- 状态为 `DUPLICATE_WITHOUT_CANONICAL` 的页面——这些页面正在流失权威性。
  需要设置 canonical。
- 移动设备易用性检查失败的页面——与阶段 3 中的设备细分数据进行交叉核对，
  以确认移动端流量是否低于应有水平。
- 没有引用站点地图的页面——如果它们是重要页面，就应当
  包含在站点地图中。
- 存在 schema 但出现富媒体搜索结果错误的页面——这可预先验证阶段 5
  的结构化数据发现。
- 尽管有流量，但上次抓取时间距今超过 60 天的页面——
  这可能是抓取预算问题或意外导致的优先级降低。

---

## 阶段 3.6 — CMS 内容清单（可选）

此阶段为**非阻塞阶段**——如果未配置 CMS，则会静默跳过。

### 检测已配置的 CMS

```bash
CMS_TYPE=$(python3 "$SKILL_SCRIPTS/cms_detect.py" 2>/dev/null)
CMS_DETECT_EXIT=$?
```

- 退出代码 **2** → 未配置 CMS。完全跳过此阶段，无需提及。
- 退出代码 **0** → 检测到 CMS。运行下面对应的预检。

### 运行预检并获取内容

```bash
CMS_CONTENT_FILE=$(SKILL_SCRIPTS="$SKILL_SCRIPTS" python3 -c "import os, sys, tempfile; sys.path.insert(0, os.environ['SKILL_SCRIPTS']); from _uid import portable_uid; print(os.path.join(tempfile.gettempdir(), f'cms_content_{portable_uid()}.json'))")

case "$CMS_TYPE" in
  strapi)
    python3 "$SKILL_SCRIPTS/preflight_strapi.py"
    CMS_PREFLIGHT=$?
    [ "$CMS_PREFLIGHT" = "0" ] && python3 "$SKILL_SCRIPTS/fetch_strapi_content.py" --output "$CMS_CONTENT_FILE"
    ;;
  wordpress)
    python3 "$SKILL_SCRIPTS/preflight_wordpress.py"
    CMS_PREFLIGHT=$?
    [ "$CMS_PREFLIGHT" = "0" ] && python3 "$SKILL_SCRIPTS/fetch_wordpress_content.py" --output "$CMS_CONTENT_FILE"
    ;;
  contentful)
    python3 "$SKILL_SCRIPTS/preflight_contentful.py"
    CMS_PREFLIGHT=$?
    [ "$CMS_PREFLIGHT" = "0" ] && python3 "$SKILL_SCRIPTS/fetch_contentful_content.py" --output "$CMS_CONTENT_FILE"
    ;;
  ghost)
    python3 "$SKILL_SCRIPTS/preflight_ghost.py"
    CMS_PREFLIGHT=$?
    [ "$CMS_PREFLIGHT" = "0" ] && python3 "$SKILL_SCRIPTS/fetch_ghost_content.py" --output "$CMS_CONTENT_FILE"
    ;;
esac
```

**预检退出代码：**
- **0** → 已就绪。内容已获取至 `$CMS_CONTENT_FILE`。加载该文件，并在阶段 4 中使用其中的数据。
- **2** → 未配置。静默跳过。
- **1** → 身份验证/配置错误。显示错误并询问用户是要修复该问题
  （建议使用 `/setup-cms`），还是在不使用 CMS 数据的情况下继续。

### 如何处理 CMS 数据

加载 `$CMS_CONTENT_FILE`。所有 CMS 都会生成相同的标准化格式：
`cms_content.entries` 是包含 slug 和 SEO 字段的已发布文章列表。

与 GSC 数据进行交叉比对：

**1. 已发布但在 GSC 中不可见的内容**——`slug` 未出现在任何
GSC 查询或页面数据中的 CMS 条目。这可能意味着：尚未被索引、已被规范化至其他 URL、
最近才发布（GSC 数据约有 3 天延迟）、资源属性不匹配，或确实没有获得排名。
对于每个条目：在阶段 5 的技术抓取中交叉检查（可索引性、robots.txt、规范链接标签）。
不要假定“零展示 = 已被索引但没有排名”——它可能只是尚未被索引。

**2. 具有意图信号的内容缺口**——排名在 11-30 位且展示次数 `>200`，
但没有 CMS 条目在其标题或 slug 中定位相应关键词的 GSC 查询。这些是已得到确认的需求
信号，你可以通过新文章来填补这些缺口。

**3. 需要更新的陈旧内容**——`updated_at` 超过 6 个月，
且对应页面出现在 `comparison.declining_pages` 中的 CMS 条目。内容陈旧本身并不是问题；
陈旧 + 点击量下降才是问题。

**4. 缺失的 SEO 字段**——直接使用 `cms_content.seo_audit`：
- `missing_meta_title`——未设置元标题的条目
- `missing_meta_description`——未设置元描述的条目
- `meta_title_too_long`——超过 60 个字符的元标题
- `meta_description_too_short/too_long`——不在 70-160 个字符范围内的元描述

按展示次数（以匹配到 GSC 数据为准）列出影响最大的 5 项修复。

### 回推修复（仅限 Strapi）

对于 Strapi，在阶段 6 生成建议后，提出直接写入修复：

> “我可以将元标题/描述修复直接推送到 Strapi。要我应用这些修复吗？”

```bash
python3 "$SKILL_SCRIPTS/push_strapi_seo.py" \
  --document-id "<documentId>" \
  --meta-title "New title under 60 chars" \
  --meta-description "New description 70-160 chars."
# Or batch: python3 "$SKILL_SCRIPTS/push_strapi_seo.py" --batch-file /tmp/seo_updates.json
```

该脚本会显示修改前后的差异，并要求确认后才会写入。

### 设置 / 重新配置

如果尚未配置 CMS，且用户希望连接一个，请建议：
> “运行 `/setup-cms` 以连接 WordPress、Strapi、Contentful 或 Ghost。”

---

## 阶段 3.7 — 业务与用户画像发现

了解谁访问网站以及他们为何访问，会影响从阶段 4 开始的每一项建议。只有使用实际搜索者的语言，标题标签重写、内容缺口或关键词建议才能真正产生效果。本阶段将使用你已有的真实数据来建立这一基础。

此时，你已经拥有：首页内容（已在并行数据收集步骤中预先获取）、GSC 热门查询和热门页面（阶段 3），以及网站的 URL 结构。这比单独抓取首页提供的信息丰富得多——GSC 查询能揭示真实访客使用他们自己的语言搜索了什么。

### 检查缓存的用户画像

用户画像按域名主机名缓存在 `~/.toprank/personas/` 中。检查用户画像文件是否已存在（`$DOMAIN` 已在步骤 0.5 中设置）：

```bash
PERSONA_FILE="$HOME/.toprank/personas/$DOMAIN.json"
[ -f "$PERSONA_FILE" ] && cat "$PERSONA_FILE" || echo "NOT_FOUND"
```

**如果已找到且 `saved_at` 距今不到 90 天**：为每个用户画像显示一行摘要，然后继续。无需暂停以请求确认——用户已经批准过这些用户画像。如果用户在任何时候主动表示“刷新用户画像”，请重新运行下方的发现流程。

**如果已找到但已过期（>90 天）**或**未找到**：继续执行下方的发现流程。

### 从 GSC + 网站内容中发现用户画像

合并以下数据源——不要获取任何新页面（你已经拥有这些页面）：

1. **GSC 热门查询**（来自阶段 3）——真实访客实际输入的词语。按搜索意图分组：谁在进行信息型查询、交易型查询或商业调查型查询？这些是具有不同需求的不同人群。

2. **GSC 热门页面**（来自阶段 3）——哪些页面获得流量，揭示了网站因何而为人所知（而非其在首页上声称的定位）。

3. **首页内容**（已为阶段 5 获取）——提取：业务内容、服务对象、价值主张、语气/词汇和转化意图。

4. **URL 结构**（来自 GSC 中的页面分组）——/blog/、/products/ 和 /pricing/ 揭示了不同的访客群体。

根据这些信号，识别 2-3 个差异最明显的访客群体。对于每个群体：

| 字段 | 要记录的内容 | 重要性 |
|-------|----------------|----------------|
| **名称** | 描述性标签（例如，“注重预算的创始人”） | 便于在整份报告中快速引用 |
| **人口统计特征** | 角色、公司规模、技术水平 | 用于调整语言风格 |
| **主要目标** | 他们试图完成什么 | 决定标题标签和元描述的写法 |
| **痛点** | 驱使他们进行搜索的问题 | 为内容角度和 CTA 提供依据 |
| **搜索行为** | 查询类型、信息型还是交易型 | 将用户画像映射到 GSC 查询集群 |
| **语言** | 他们使用的特定词语、短语和术语 | 直接用于重写标题和描述 |
| **决策触发因素** | 促使他们转化或再次访问的因素 | 决定 CTA 和落地页文案的写法 |

要具体。“为拥有 3 个营业点的业务比较现场服务软件的小企业主”是有用的。“想了解更多信息的用户”则不是。每个用户画像都必须以实际的 GSC 查询模式为依据——如果无法指出该用户画像会输入的查询集群，那么这个用户画像就是推测性的，应当舍弃。

### 持久化保存用户画像

使用 Python 单行命令将其保存到 `~/.toprank/personas/<domain>.json`，以确保 JSON 有效（不要使用 heredoc——包含 JSON 的 heredoc 很脆弱）：

```bash
mkdir -p "$HOME/.toprank/personas"
python3 -c "
import json, sys
data = {
    'domain': '$DOMAIN',
    'saved_at': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'business_summary': '<FILL: 1-2 sentence business description>',
    'personas': [
        {
            'name': '<FILL>',
            'demographics': '<FILL>',
            'primary_goal': '<FILL>',
            'pain_points': '<FILL>',
            'search_behavior': '<FILL>',
            'language': ['<FILL: term1>', '<FILL: term2>', '<FILL: term3>'],
            'decision_trigger': '<FILL>'
        }
    ]
}
json.dump(data, open('$PERSONA_FILE', 'w'), indent=2)
print('Personas saved to $PERSONA_FILE')
"
```

运行前，将所有 `<FILL: ...>` 占位符替换为实际发现的值。Python 方法可以避免用户画像描述中的撇号和特殊字符导致 shell 引号问题。

### 展示用户画像（不阻塞流程）

以紧凑表格展示用户画像——不要暂停以等待确认。用户已经确认了 URL 和品牌词；用户画像来自其数据，并非猜测。将它们作为后续内容的背景信息展示：

> “根据你的 GSC 数据和网站内容，我识别出了以下访客用户画像，它们将影响后续建议：
>
> | 用户画像 | 类似的搜索…… | 目标 |
> |---------|-----------------|------|
> | [名称] | [来自 GSC 的 2-3 个查询模式示例] | [目标] |
>
> “如果其中有任何不准确之处，请告诉我——否则，我将在整个分析过程中使用这些用户画像。”

然后立即继续进入第 4 阶段。不要等待回复。如果用户之后修正某个用户画像，请更新文件并调整所有受影响的建议。

**在后续阶段中，将 `$PERSONA_FILE` 路径引用为 `~/.toprank/personas/<domain>.json`——每次都从目标 URL 推导 `<domain>`，不要依赖 shell 变量的持久性。**

**无 GSC 时的回退方案**：如果 GSC 不可用，并且你直接跳到了阶段 5，
仍需在阶段 5 的分析之前执行用户画像发现——但只能依赖首页内容
（已抓取）和 URL 结构。由于缺少查询数据，用户画像的精确度会较低；
请在报告中注明这一点，并建议在获得 GSC 访问权限后重新运行审计，以提高用户画像的准确性。

---

## 阶段 3.8 — 业务背景

阅读并遵循 `../shared/business-context.md`。

此时，你已经获得了 GSC 数据（阶段 3）和首页内容——这两项输入足以让你在向用户提问之前推断业务事实。目标是在生成完整且实用的业务画像时，尽可能少地提问。

根据阶段 2 中的 `CACHE_STATUS` 选择分支：

**`fresh_loaded`**：业务背景已加载到内存中。无需执行任何操作——继续进入阶段 4。

**`not_found`**：运行 `../shared/business-context.md` 中的生成流程。如果用户提供了阶段 2 中的 `$BRAND_TERMS`，则使用它来初始化 `brand_terms`；同时使用从 GSC 查询中推断出的其他品牌信号加以补充。

**`stale`**：运行生成流程以刷新。`CACHE_STATUS=stale` 表示文件已加载——使用其中的值预填三个问题，让用户确认或更正，而不是从头重新输入。

首次运行时，此阶段会增加约 30 秒，并需要与用户进行一轮交互。之后的所有运行都会静默执行（仅加载缓存）。其价值在于：阶段 6 的建议会直接提及企业名称，与真实竞争对手进行比较，并聚焦于主要目标，而不是提供泛泛的 SEO 建议。

---

## 阶段 4 — Search Console 分析

这是体现你价值的环节。不要只是复述数据。要像 SEO 专家一样
解读数据。

### 流量概览

说明该时间段内的总点击次数、展示次数、平均 CTR 和平均排名。
指出任何显著变化。与各排名位置的典型 CTR 曲线进行比较
（排名第 1 的 CTR 应约为 25–30%，第 3 约为 10%，第 10 约为 2%）。
如果某个查询的 CTR 明显低于其排名位置对应的预期值，
则表明标题或摘要需要改进。

### 品牌词与非品牌词拆分

如果 `branded_split` 存在（不为 null），将其作为分析中的第一个表格展示：

| 细分 | 查询数 | 点击次数 | 展示次数 | CTR | 平均排名 |
|---------|---------|--------|-------------|-----|--------------|
| 品牌词 | X | X | X | X% | X |
| 非品牌词 | X | X | X | X% | X |

解读二者之间的差异：
- 如果品牌词 CTR 显著更高（这是预期情况——用户知道自己要找什么），请指出非品牌词指标才是衡量自然搜索表现的真正标准。
- 如果品牌词展示次数相较于总展示次数较少，则说明网站的品牌认知度有限——应重点推动非品牌词增长。
- 如果品牌词查询的排名低于第 3 位，则属于声誉或品牌问题，应单独标记。
- 使用非品牌词指标作为所有快速见效机会和内容建议的基准——不要让品牌流量夸大机会评估。

### 快速见效机会（影响最大、投入最低）

这些改动可以在几天内而非几个月内产生显著效果：

1. **排名第 4-10 位的查询** — 已排在第 1 页，但位于首屏以下。优化标题标签或元描述、加强内部链接或扩充内容，都可能让它们跃升至前 3 名。列出排名前 10 的查询，包括当前位置、展示次数，以及针对每个查询的具体建议。

2. **高展示、低点击率的查询** — 使用 `ctr_gaps_by_page`（而不只是 `ctr_opportunities`），因为它会在查询旁边提供确切的页面 URL。这意味着每条建议都可以明确指出需要修复的具体页面，以及带来展示的具体查询。对于每个查询，分析其可能的搜索意图（信息型、交易型、导航型、商业调查型），并建议与其意图相匹配的标题和描述。

3. **环比下降的查询** — 标记点击量下降超过 30% 的所有查询。对于每个查询，提出假设：这是季节性变化吗？竞争对手是否抢占了 SERP 特性？页面内容是否已经偏离了查询意图？

### 搜索意图分析

对于排名前 10-15 的查询，对其搜索意图进行分类：
- **信息型**（“如何……”“什么是……”）→ 需要全面的内容、FAQ 架构
- **交易型**（“购买……”“定价……”“附近……”）→ 需要清晰的 CTA、产品架构、价格
- **导航型**（“品牌名称”“品牌 + 产品”）→ 应该排名第 1；如果不是，则需要调查
- **商业调查型**（“最佳……”“对比……”“评测”）→ 需要比较内容、信任信号

如果针对某个查询获得排名的页面与其意图不匹配（例如，博客文章为交易型查询获得排名，或者产品页面为信息型查询获得排名），请将其标记出来。这通常是最重要的单一突破口。

**用户画像视角**：对意图进行分类后，将每个查询与阶段 3.7 中的用户画像进行交叉比对。最有可能搜索此查询的是哪个用户画像？当前标题/摘要中的词汇和表达方式，是否与该用户画像会使用的词语相同？为一个用户画像撰写的标题可能会主动劝退另一个用户画像。例如，吸引“The Budget-Conscious Founder”用户画像的查询应使用通俗易懂、强调价值的表述，而“The IT Manager”用户画像搜索相同主题时，可能会期待技术层面的具体信息。对于每条快速见效建议，都要注明其用户画像匹配情况（或不匹配情况）。

### 关键词蚕食检查

输出中包含一个 `cannibalization` 数组。每个条目都有结构化的胜出页面/落败页面评分 — 直接使用它，无需根据原始数据重新推导：

- `winner_page` — 要保留的规范页面（按最佳排名评分；如排名相同，则以点击量最多者胜出）
- `winner_reason` — 其胜出的原因（例如“最佳排名（2.1）”）
- `loser_pages` — 需要通过整合消除的页面
- `recommended_action` — “consolidate: 301 redirect losers to winner or add canonical”或“monitor: possible SERP domination”（所有页面均位于前 5 名，且彼此排名差距不超过 2 位）

对于每个发生关键词蚕食的查询：
- 明确说明胜出页面和落败页面 — 不要让用户自己判断
- 在建议中直接使用 `recommended_action`
- 标记那些虽然展示次数很高，但排名一般（第 5-15 位）的查询 — 流量分散很可能正在抑制其进入前 3 名的潜力
- 如果 `recommended_action` 是“monitor: possible SERP domination”，请将其视为积极情况（占据多个 SERP 排名位置），并跳过整合建议

还应交叉检查 `top_pages` 和 `position_buckets` 以寻找间接信号：某个曾经排名良好的页面在新页面发布后排名下降，或某个查询的排名位置剧烈波动，都是数据窗口中尚未体现的关键词蚕食迹象。

### 页面组表现

使用 `page_groups` 展示哪些网站版块表现良好，哪些需要关注：

| 版块 | 页面数 | 点击次数 | 展示次数 | 点击率 | 平均排名 |
|---------|-------|--------|-------------|-----|--------------|
| /blog/ | X | X | X | X% | X |
| /products/ | X | X | X | X% | X |
| ... | | | | | |

标记以下情况：
- **低点击率版块**：如果整个版块（例如所有 /products/ 页面）的点击率远低于网站平均水平，则问题很可能出在模板上（标题标签格式、元描述格式）——一次修复即可改善该版块中的所有页面。
- **高展示、低点击版块**：表示页面有排名却未能带来点击——应调查整个版块的搜索意图不匹配或摘要质量问题。
- **完全缺失的版块**：如果 /locations/ 或 /services/ 未出现，则说明这些页面要么没有排名，要么尚未创建。
- **`other` 组很大**：意味着网站存在默认规则未涵盖的自定义 URL 模式——请向用户指出这一点，以便他们了解 `other` 中包含哪些内容。

这比逐页分析更具可操作性：像“/products/ 的标题标签模板需要改进”这样的建议可以一次性修复 50 个页面。

### 细分分析

**设备**（`device_split`）：比较移动设备、桌面设备和
平板设备上的点击率与排名。某个页面整体看似表现良好，但在移动设备上可能表现不佳。标记点击率比网站平均水平低 30% 以上的任何设备——这表明存在移动端用户体验或摘要问题。

**国家/地区**（`country_split`）：查看排名靠前的国家/地区。标记以下情况：
- 某个国家/地区的展示次数很高但点击率极低（标题/摘要在
  该市场缺乏吸引力）
- 某个国家/地区的排名明显差于其他国家/地区（存在本地竞争对手或相关性
  差距）
- 某个拥有可观展示次数的国家/地区的点击次数接近于零（可能存在 hreflang
  或地理位置定位问题）

**搜索类型**（`search_type_split`）：如果出现 `discover` 或 `googleNews`，
请予以说明——它们的运作方式与网页搜索不同，并有各自独立的优化
手段（时效性、图片、权威性信号）。如果存在 `image` 或 `video` 流量，
而网站并未进行专门的图片/视频优化，请指出这是一个机会。

### 内容缺口

对于排名在 11-30 位的查询——你已经具备主题权威性，但需要专门的
页面或扩充内容。将相关查询归入主题集群。对于每个
集群，建议采取以下哪种方式：
- 扩充现有页面（如果该页面已部分涵盖此主题）
- 创建新页面（如果没有页面以此主题为目标）
- 创建包含内部链接的内容中心（如果有 5 个以上相关查询）

### 待修复页面

列出点击次数下降的页面。对于每个页面，提供：
- 当前点击次数与上一周期的对比
- 变化百分比
- 可能的原因（季节性因素、算法更新、新竞争对手、内容陈旧、
  技术问题）
- 具体的修复建议

---

## 阶段 4.5 — 关键词缺口分析

此阶段直接根据 GSC 数据识别关键词机会——无需使用外部工具，不过之后运行 `/keyword-research` 可以进行更深入的分析。

### 第 1 步：查找没有专属页面的查询词

从 GSC 的 `top_queries` 数据中，识别符合以下条件的查询词：
- 网站针对该查询词的排名为第 4-20 位
- 获得排名的页面并非主要介绍该主题的页面（例如，首页或针对其他关键词撰写的页面意外获得了排名）
- 网站上没有任何页面在标题、H1 或 URL slug 中突出使用该关键词

这些是**关键词孤儿**——网站已经证明了与该主题的相关性，但从未为该主题提供专属页面。为每个主题创建专属页面通常是杠杆效应最高的内容举措。

对于每个关键词孤儿，请说明：
- 查询词
- 当前排名页面（URL）及排名位置
- 每月展示次数
- 建议操作："创建一个以 '[query]' 为目标的新页面——目前由并非专门针对该主题的 [URL] 获得第 #[N] 位排名。专属页面有望切实地从第 #[N] 位提升至前 5 位。"

### 第 2 步：根据 GSC 数据构建主题集群

按主题对所有获得排名的查询词进行分组。当 3 个或更多查询词共享一个核心概念时，即构成一个集群。对于每个集群：
- 为集群命名（例如，“定价相关查询词”“功能 X 操作指南查询词”）
- 列出其中的查询词、排名位置和展示次数
- 确定是否存在将它们关联起来的**支柱页面**
- 如果不存在支柱页面，建议创建一个，并注明将权重从集群页面传递至支柱页面所需的内部链接结构

### 第 3 步：业务背景缺口检查

根据网站的业务内容（从其 URL、热门页面和获得排名的查询词中推断），识别该业务明确提供服务、但 GSC 展示次数为零或接近零的主题。这些是**与业务相关的关键词缺口**——网站本应在这些主题上获得曝光，但实际并没有。

明确说明缺口："这似乎是一家[业务类型]。你在 [X] 方面获得了排名，但在具有显著搜索需求的[相关主题]方面没有任何展示。这是一个需要弥补的内容缺口。"

### 第 4 步：建议进行更深入的关键词研究

完成内联分析后，给出以下建议：

> "我已从你的 GSC 数据中识别出 [N] 个关键词缺口。如需进行更广泛的关键词发掘——包括你目前尚未获得任何排名的关键词——请使用你的种子主题运行 `/keyword-research`。该 skill 会从关键词数据库中提取数据，并构建一套超出 GSC 可见范围的完整机会集合。"

---

## 阶段 5 — 技术 SEO 审计

抓取网站的关键页面以检查技术健康状况。如果 firecrawl skill 可用，则使用它；否则使用 WebFetch。

需要审计的页面：总计最多 5 个。优先顺序：首先是首页，然后使用阶段 4 中点击次数最多的页面填满剩余名额——除非某个页面在阶段 3.5 中被标记为流量下降或 NOT_INDEXED，在这种情况下，将其替换进来。无论存在多少个被标记的页面，硬性上限均为 5 个；选择优先级最高的页面。

**⚡ 速度提示**：在单个轮次中使用并行 WebFetch 调用获取全部 5 个页面——不要逐个获取。你应该已经在阶段 3 中预先获取了 `robots.txt` 和首页（请参阅上面的“并行数据收集”）；如果已获取，则只需获取尚未检索的其余页面。

### 可索引性

- 获取并分析 `robots.txt`——它是否屏蔽了重要路径？是否存在不必要的禁止抓取规则？
- 检查重要页面上是否存在 `noindex` 元标记或 `X-Robots-Tag` 响应头
- 检查规范 URL——是自引用（良好），还是指向其他位置（需要调查）
- 如果网站面向多种语言/地区，检查是否存在 `hreflang` 标记
- 查找孤立页面（没有任何内部链接指向的重要页面）
- 与阶段 3.5 的 URL 检查结果进行交叉核对——其中发现的任何 `NOT_INDEXED` 页面都应在此说明其根本原因

### 元数据审计（深入）

对于每个接受审计的页面，从实时 HTML 中获取实际的 `<title>` 和 `<meta name="description">`。然后与 GSC 数据进行交叉核对：

1. **标题与热门查询的匹配度**：对于每个页面，在 `ctr_gaps_by_page` 中查找该页面排名最高的 3 个查询。标题标记是否包含主要排名查询或其相近变体？如果标题过于宽泛（例如，“首页”“服务”“博客”），而页面却针对具体查询获得排名，则说明二者不匹配——标题未能确认相关性，并且正在损害 CTR。

2. **标题长度**：是否少于 60 个字符？超过 60 个字符的标题会在 SERP 中被截断。标记每个超出限制的页面，并提供当前字符数以及其在 Google 中显示时的截断版本。

3. **元描述**：是否存在？长度是否为 120–160 个字符？是否包含行动号召？如果页面没有元描述，Google 会重写它——通常会提取无用的模板化文本。标记所有缺少描述的页面。

4. **重复标题**：是否有多个页面使用相同或非常相似的标题？列出发现的所有重复标题。

5. **Open Graph 标记**：是否存在 `og:title`、`og:description`、`og:image`？缺少 OG 标记意味着社交分享时不会呈现预览——标记任何缺少这些标记的页面，尤其是内容页面。

以表格形式报告调查结果：

| 页面 URL | 标题（实际） | 标题长度 | 热门 GSC 查询 | 标题/查询匹配？ | 是否存在元描述？ | 是否有 OG 标记？ |
|----------|---------------|--------------|---------------|--------------------|--------------------|----------|
| /        | [实际标题] | [N] 个字符   | [查询]       | 是 / 否           | 是 / 否           | 是 / 否 |

展示元数据审计表后，提供：
> “我发现 [N] 个页面存在元数据问题。运行 `/meta-tags-optimizer`，为每个页面生成优化后的标题标记和元描述——它将使用本次审计中的 GSC 查询数据，编写符合实际搜索需求的标题。”

### Schema 标记审计（深入）

根据网站的热门页面、排名查询和可见内容判断网站类型，然后检查现有的 Schema 类型与该网站类型应具备的 Schema 类型之间的差异。

**步骤 1：判断网站类型**

根据首页和热门页面的内容，将其归类为以下类型之一：
- 电子商务（产品、定价、购物车）
- 本地企业（地址、电话、服务区域）
- SaaS / 软件（功能、定价、注册）
- 内容 / 博客（文章、指南、教程）
- 专业服务（代理机构、顾问、律师事务所）
- 媒体 / 新闻（频繁发布文章）

**步骤 2：为网站类型定义预期的架构标记**

| 网站类型 | 必须具备 | 缺失时影响较大 | 最好具备 |
|-----------|-----------|------------------------|--------------|
| 电子商务 | Product, BreadcrumbList | AggregateRating, FAQPage, Offer | SiteLinksSearchBox |
| 本地商家 | LocalBusiness, GeoCoordinates | OpeningHoursSpecification, AggregateRating | FAQPage |
| SaaS | Organization, SoftwareApplication | FAQPage, BreadcrumbList | HowTo, Review |
| 内容 / 博客 | Article 或 BlogPosting | FAQPage, BreadcrumbList | HowTo, Video |
| 专业服务 | Organization, Service | FAQPage, Review | ProfessionalService, Person |
| 媒体 / 新闻 | NewsArticle | BreadcrumbList | VideoObject, ImageObject |

**步骤 3：审查每个热门页面实际存在的架构标记**

对于每个受审查的页面，提取所有 `<script type="application/ld+json">` 块。
列出其中存在的 `@type` 值。然后将其与此网站类型的预期集合进行比较。

报告结果：

| 页面 URL | 发现的架构标记 | 缺失的高影响架构标记 | 现有架构标记中的错误 |
|----------|-------------|---------------------------|---------------------------|
| /        | Organization | FAQPage, SiteLinksSearchBox | 无 |
| /pricing | SoftwareApplication | FAQPage, Offer | 缺少 `price` 属性 |

**步骤 4：标记现有架构标记中的错误**

需要检查的常见问题：
- 缺少该 `@type` 的必需字段（例如，Product 架构标记缺少 `name`
  或 `offers`）
- `url` 属性使用相对路径，而非绝对 URL
- 日期未采用 ISO 8601 格式
- `AggregateRating` 的 `ratingCount` 为 0 或缺失
- 一个页面中存在同一类型的重复架构标记块
- 架构标记描述了页面上不可见的内容（违反 Google 政策）

与阶段 3.5 URL 检查中的富媒体搜索结果状态进行交叉核对——如果某个
页面在那里显示了富媒体搜索结果错误，请在此处找出原因。

展示架构标记审查结果后，提供以下建议：
> “我发现有 [N] 个页面缺少高影响架构标记，并且有 [N] 个页面的
> 现有架构标记存在错误。运行 `/schema-markup-generator` 为每个页面生成正确的 JSON-LD
> ——它将使用本次审查中的网站类型和页面内容。”

### Core Web Vitals 与性能

- `<head>` 中阻塞渲染的脚本——应使用 defer 或 async
- 图片：是否延迟加载？是否具有 `alt` 属性？是否以现代格式
  （WebP/AVIF）提供？尺寸是否适当（而不是在 400px 宽的容器中使用 3000px 宽的图片）？
- 是否对关键资源（字体、首屏图片）使用 `<link rel="preload">`？
- DOM 是否过大（超过 1500 个节点表示可能存在臃肿）？
- 第三方脚本臃肿——统计所加载的外部域名数量

### 内部链接与网站架构

- 页面是否有内部链接？链接文本是否具有描述性（而不是“点击此处”）？
- 页面是否链接到相关内容（主题集群）？
- 从首页出发，是否能在 3 次点击内到达该页面？
- 是否存在失效的内部链接（404）？

### 移动端就绪情况

- 是否存在 viewport meta 标签？
- 触控目标是否足够大（最小 48px）？
- 文本是否无需缩放即可阅读？
- 是否不存在水平滚动？
- 与阶段 3.5 URL 检查中的移动端易用性结果进行交叉核对

---

## 阶段 5.5 — PageSpeed Insights（性能监控）

对首页以及阶段 3 中按点击次数排名前 4 的页面运行 PageSpeed Insights API。
这将同时提供核心网页指标的**实验室数据**（Lighthouse 综合测试）和**现场
数据**（Chrome 用户体验报告中的真实用户指标）。

**⚡ 速度提示**：这项任务应该已在并行数据收集步骤中并行运行。如果没有，
请立即运行。

```bash
python3 "$SKILL_SCRIPTS/pagespeed.py" \
  --urls "$TARGET_URL,https://example.com/page2,https://example.com/page3" \
  --both-strategies
```

将示例 URL 替换为实际首页和阶段 3 中排名靠前的页面。使用
`--both-strategies` 获取移动端和桌面端的分数。如果用户已在其环境中
设置 `PAGESPEED_API_KEY`，脚本将自动使用它以获得更高的速率限制。

`pagespeed.py` 完成后，运行显示工具：

```bash
python3 "$SKILL_SCRIPTS/show_pagespeed.py"
```

### 分析结果

**1. 性能分数** — Lighthouse 为每个页面提供 0-100 分的评分：
- **90-100（良好）**：无需采取行动。
- **50-89（需要改进）**：标记最重要的优化机会。这些页面正在因性能问题而
  损失排名——Google 将核心网页指标用作排名信号。
- **0-49（较差）**：严重。这些页面的排名正在受到主动惩罚。
  如果页面拥有显著的自然搜索流量，请将其标记为优先行动项。

**2. 核心网页指标（现场数据）** — 来自 Chrome 用户体验报告的真实用户指标：
- **LCP**（最大内容绘制）：良好 < 2.5s，较差 > 4.0s
- **INP**（交互到下一次绘制）：良好 < 200ms，较差 > 500ms
- **CLS**（累积布局偏移）：良好 < 0.1，较差 > 0.25

对于 SEO，现场数据比实验室数据更具权威性——Google 使用 CrUX 数据
进行排名。如果有现场数据，请优先呈现。如果没有（低流量网站通常缺少
CrUX 数据），则使用实验室数据，并注明其为综合测试数据。

**3. 与其他阶段交叉对照**：
- **阶段 3 的设备细分**：如果移动端性能分数明显低于桌面端，而阶段 3
  显示移动端流量表现不佳，则性能差距可能是造成这一问题的因素之一。
- **阶段 5 的技术审计**：将具体的优化机会（例如
  “消除阻塞渲染的资源”）与技术发现（例如
  `<head>` 中阻塞渲染的脚本）相关联。这可为技术修复提供具体证据。
- **阶段 3.5 的 URL 检查**：被标记为对移动设备不友好且移动端
  PageSpeed 分数也较差的页面需要紧急处理。

**4. 主要优化机会** — 脚本会提取 Lighthouse 优化机会，并按潜在节省时间
排序。对于每个机会，请注明：
- 优化机会是什么（例如“适当调整图片尺寸”“移除未使用的 JavaScript”）
- 预计可节省的毫秒数
- 哪些具体页面受到影响
- 是全站模板问题还是特定页面问题

**5. 来源级数据** — 如果可用，来源（全站）的 CrUX 数据会显示整个域名的
总体性能健康状况。将各个页面的分数与来源平均值进行比较，以找出拉低
网站整体性能表现的异常页面。

---

## 阶段 6 — 报告

**这份报告的目标不是面面俱到，而是清晰明确。** 用户需要确切知道下一步该做什么、按什么顺序做，以及为什么这样做。优先列出影响最大的行动，随后提供支持数据。省略任何不会改变用户行动方案的内容。

严格使用以下格式输出结构化报告：

---

# SEO 报告 — [site.com]
*[日期] · GSC 数据：[日期范围] · [首次审计 / 上次审计：日期]*

## 审计历史
*（首次审计时完全跳过此部分——不要在这里写“不适用”或“首次审计”；直接省略此部分。）*

在后续审计中，仅展示与上次审计中的首要问题相比发生的变化：

| 之前标记的问题 | 状态 | 备注 |
|--------------------|--------|-------|
| [上次审计中的问题] | ✅ 已解决 / ⚠️ 已改善 / 🔴 仍然存在 / ↗ 已恶化 | [包含当前指标的单行更新] |

---

## ⚡ 首要行动

这是报告的核心。严格包含 3–5 项，并按预期点击影响从高到低排序。每一项都必须包含具体 URL、作为证据的具体指标和具体修复方案——不得使用泛泛而谈的内容。

每一项使用以下格式：

---

**#1 — [简短标题，例如“修复 /pricing 的标题标签”]**
🔴 严重 / 🟡 高 / 🟢 中
**影响**：约 +[N] 次点击/月 · **工作量**：低 / 中 / 高

**问题**：[用一句话描述问题]
**证据**：[确切指标——例如，“关键词 'your-product pricing' 排名第 7：每月 2,400 次展示，CTR 为 1.2%（该排名的预期值约为 3%）”]
**修复**：[具体且可直接复制粘贴的操作——例如，“将标题从 'Pricing' 改为 'Plans & Pricing — [Value Prop] | [Brand]'（54 个字符）”]
**生效原因**：[用一句话说明其机制——搜索意图匹配、用户画像用语等]

---

对其余 3–5 项重复使用此格式。不要添加第 6 项——必须严格筛选。只有能够量化影响的项目才能进入此列表。

估算影响时，使用保守的 CTR 曲线：第 1 位约 27%，第 2 位约 15%，第 3 位约 11%，第 4–5 位约 5–8%，第 6–10 位约 2–4%。对于每月展示量为 2,400 的查询，从第 7 位提升至第 3 位，意味着每月大约增加 170 次点击。始终使用数据中的真实数字。

每一条基于用户画像的建议都必须指明用户画像，并引用该用户画像的 `language` 字段中应出现在改写内容里的具体用语。

---

## 流量概览

| 指标 | 数值 | 与前 28 天相比 |
|--------|-------|-----------------|
| 总点击次数 | X | ↑/↓ X% |
| 展示次数 | X | ↑/↓ X% |
| 平均 CTR | X% | ↑/↓ |
| 平均排名 | X | ↑/↓ |

*（品牌词/非品牌词拆分——仅在提供了品牌词时使用）：*
| 细分 | 点击次数 | 展示次数 | CTR | 平均排名 |
|---------|--------|-------------|-----|--------------|
| 品牌词 | X | X | X% | X |
| 非品牌词 | X | X | X% | X |

[用一句话解读该拆分结果——它揭示了自然搜索表现与品牌表现的哪些情况]

---

## 支持性发现

本部分用于佐证首要行动，并指出用户还应了解的其他事项。保持简洁——使用表格和简短项目符号，不要使用长篇段落。仅包含确有发现的子部分。

### 索引问题
*（来自阶段 3.5。仅在发现问题时包含。）*
| 页面 | 覆盖状态 | 上次抓取 | 修复措施 |
|------|---------------|------------|-----|

### 关键词蚕食
*（仅当 `cannibalization` 数据非空时包含。）*
| 查询词 | 胜出页面 | 落败页面 | 操作 |
|-------|------------|-------------|--------|

### 内容缺口
*（排名第 11–30 位、展示次数超过 200 且没有专门页面的查询词。）*
| 查询词 | 排名 | 每月展示次数 | 建议操作 |
|-------|----------|---------------|--------------------|

### 元数据问题
*（仅包含尚未在优先操作中涵盖的页面。）*
| 页面 | 问题 | 当前状态 | 建议修复措施 |
|------|-------|---------|-----------------|

### Schema 缺口
*（缺少的、对该网站类型有重大影响的 schema。）*
| 页面 | 缺失项 | 影响 |
|------|---------|--------|

### 技术问题
*（严重程度：严重 / 高 / 中。除非低严重程度问题被列为优先操作，否则省略。）*
| 问题 | 受影响页面 | 修复措施 | 严重程度 |
|-------|---------------|-----|----------|

### PageSpeed 与 Core Web Vitals
*（来自阶段 5.5。仅在发现问题时包含。如有实际用户数据，则优先使用；否则使用实验室数据。）*

**全站（来源）**：[总体 CrUX 评级（如有）]

| 页面 | 得分 | LCP | INP | CLS | 首要优化机会 |
|------|-------|-----|-----|-----|-----------------|
| / | [得分] | [数值] [评级] | [数值] [评级] | [数值] [评级] | [首要优化机会标题 + 可节省量] |

*（如果任何页面的得分低于 50，请将其标记为优先操作候选项——较差的 Core Web Vitals 会直接损害排名。）*

### 流量下降
*（下降幅度超过 30% 的页面/查询词。仅包含尚未在优先操作中涵盖的项目。）*
| 页面 / 查询词 | 变化 | 假设 | 后续步骤 |
|-------------|--------|------------|-----------|

### CMS SEO 审计
*（仅在配置了 CMS 时包含。仅列出影响最大的 5 项修复措施。）*
| 页面 | 问题 | 当前状态 | 修复措施 |
|------|-------|---------|-----|

---

## 暂时忽略的事项
列出数据中显示但未进入优先事项列表的 2–3 个问题——让用户知道你已注意到这些问题，并有意降低了它们的优先级。每项一行。

- [例如，“设备细分：移动端 CTR 比桌面端低 15%——值得关注，但目前并非瓶颈”]
- [例如，“国家/地区细分：英国的 CTR 较低——流量较少，修复核心问题后再调查”]

---

报告之后，写入审计日志条目（结束前请参阅下方的阶段 6.5）。

---

## 阶段 6.5 — 写入审计日志

提交报告后，向审计日志追加一条简洁的记录。`$DOMAIN` 和 `$AUDIT_LOG` 已在步骤 0.5 中设置。

```bash
mkdir -p "$HOME/.toprank/audit-log"
```

使用 Python 追加记录（如果文件不存在，则创建一个包含单个元素的数组）。运行前，将所有 `<FILL>` 值替换为报告中的真实数据：

```python
import json, os
from datetime import datetime, timezone

log_path = "$AUDIT_LOG"
existing = json.load(open(log_path)) if os.path.exists(log_path) else []

existing.append({
    "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    "traffic_snapshot": {
        "clicks": <FILL>,
        "impressions": <FILL>,
        "avg_ctr_pct": <FILL>,
        "avg_position": <FILL>
    },
    "pagespeed_snapshot": {
        "avg_score_mobile": <FILL or null>,
        "avg_score_desktop": <FILL or null>,
        "homepage_score_mobile": <FILL or null>,
        "cwv_lcp_ms": <FILL or null>,
        "cwv_inp_ms": <FILL or null>,
        "cwv_cls": <FILL or null>,
        "cwv_source": "<FILL: field|lab>"  # "field" if CrUX data available, else "lab"
    },
    "top_issues": [
        # One entry per Priority Action (max 5), in priority order
        {"rank": 1, "title": "<FILL>", "type": "<FILL: title_tag|indexing|cannibalization|schema|content_gap|performance>", "page": "<FILL>", "metric": "<FILL>", "expected_impact": "<FILL>", "status": "open"}
    ],
    "resolved_from_previous": []  # populated on next audit from Audit History comparison
})

json.dump(existing, open(log_path, "w"), indent=2)
print(f"Audit log saved to {log_path}")
```

用一句话确认：“审计日志已保存至 `~/.toprank/audit-log/$DOMAIN.json`。”

---

## 阶段 7 — 定向 Skill 交接（可选）

交付报告后，根据实际发现提出后续行动。仅提供与审计实际发现的问题相关的交接——如果只有一项相关，不要同时提供全部三项。

### 元数据交接

如果元数据审计发现 [N] 个页面存在问题：

> “我发现 [N] 个页面存在元数据问题——其中 [X] 个存在标题/查询不匹配，
> [Y] 个缺少元描述，[Z] 个缺少 OG 标签。运行 `/meta-tags-optimizer`
> 为每个页面生成优化后的标签。请将本报告中的元数据审计表作为上下文提供。”

### Schema 交接

如果 Schema 审计发现缺失或错误：

> “我发现 [N] 个页面缺少高影响力 Schema，另有 [N] 个页面存在 Schema 错误。
> 运行 `/schema-markup-generator` 生成正确的 JSON-LD。本报告中的 Schema 审计
> 表即为输入——它已经识别出网站类型，以及每个页面所需的 Schema 类型。”

### 关键词研究交接

如果关键词差距分析发现孤立关键词或业务相关性缺口：

> “我从 GSC 数据中发现了 [N] 个关键词缺口。如需进行更深入的挖掘——即发现您
> 完全没有获得排名的关键词——请使用以下种子主题运行 `/keyword-research`：
> [列出从差距分析中得出的 3-5 个种子词]。该 Skill 会从关键词数据库中提取数据，
> 并构建一套超出 GSC 可见范围的完整机会集合。”

---

## 阶段 8 — 内容生成（可选）

交付报告后，如果“内容机会”部分识别出了可执行的内容缺口，则提出生成内容：

> “我发现了 [N] 个内容机会。需要我起草内容吗？我可以并行撰写
> [博客文章 / 落地页 / 两者]——每篇内容都会针对目标关键词和搜索意图进行优化。”

如果用户同意，使用 Agent 工具**并行**启动内容 Agent。
每个 Agent 独立撰写一篇内容。

### 如何启动内容 Agent

对于每个内容机会，根据搜索意图确定内容类型：
- **信息型 / 商业调研型** → 博客文章 Agent
- **交易型 / 商业型** → 落地页 Agent

并行启动 Agent。每个 Agent 接收：
1. 内容写作指南（通过 find 定位——见下文）
2. 分析中对应的具体机会数据

启动 Agent 之前，先定位内容写作参考文件：

```bash
CONTENT_REF=$(find ~/.claude/plugins ~/.claude/skills ~/.codex/skills .agents/skills -name "content-writing.md" -path "*content-writer*" 2>/dev/null | head -1)
if [ -z "$CONTENT_REF" ]; then
  echo "WARNING: content-writing.md not found. Content agents will use built-in knowledge only."
else
  echo "Content reference at: $CONTENT_REF"
fi
```

在下方的每个 Agent 提示词中，将 `$CONTENT_REF` 作为路径传入。如果未找到，
则省略“阅读内容写作指南”这一行——Agent 仍会使用内置知识生成优质内容。

对每个 Agent 使用以下提示词模板：

#### 博客文章智能体提示词

```
You are a senior content strategist writing a blog post that ranks on Google.

Read the content writing guidelines at: $CONTENT_REF
Follow the "Blog Posts" section exactly.

## Assignment

Target keyword: [keyword]
Current position: [position] (query ranked but no dedicated content)
Monthly impressions: [impressions]
Search intent: [informational / commercial investigation]
Site context: [what the site is about, its audience]
Existing pages to link to: [relevant internal pages from the analysis]
[If available] Competitor context: [what currently ranks for this keyword]

## Target Personas
Write primarily for: [Primary persona name]
Their goal: [primary goal]
Their language: [key terms and phrases they use — use these naturally in headings, intro, and body]
Their pain points: [pain points — address these directly, don't make them search for answers]
Secondary audience: [Secondary persona name if applicable] — [brief note on how to serve both without diluting focus]

## Deliverables

Write the complete blog post following the guidelines, including:
1. Full post in markdown with proper heading hierarchy
2. SEO metadata (title tag, meta description, URL slug)
3. JSON-LD structured data (Article/BlogPosting + FAQPage if FAQ included)
4. Internal linking plan (which existing pages to link to/from)
5. Publishing checklist

## Quality Gate
Before finishing, verify:
- Would the reader need to search again? (If yes, not done)
- Does the post contain specific examples only an expert would include?
- Does the format match what Google shows for this query?
- Is every paragraph earning its place? (No filler)
```

#### 落地页智能体提示词

```
You are a senior conversion copywriter writing a landing page that ranks AND converts.

Read the content writing guidelines at: $CONTENT_REF
Follow the "Landing Pages" section exactly.

## Assignment

Target keyword: [keyword]
Current position: [position]
Monthly impressions: [impressions]
Search intent: [transactional / commercial]
Page type: [service / product / location / comparison]
Site context: [what the site is about, value prop, target customer]
Existing pages to link to: [relevant internal pages]
[If available] Competitor context: [what currently ranks]

## Target Personas
Write primarily for: [Primary persona name]
Their goal: [primary goal when landing here]
Their language: [terms they use — mirror this in headlines, subheads, and CTAs]
Their decision trigger: [what makes them convert — address this prominently above the fold]
Their objections: [pain points and doubts — address each explicitly, don't leave them wondering]

## Deliverables

Write the complete landing page following the guidelines, including:
1. Full page copy in markdown with proper heading hierarchy and CTA placements
2. SEO metadata (title tag, meta description, URL slug)
3. Conversion strategy (primary CTA, objections addressed, trust signals)
4. JSON-LD structured data
5. Internal linking plan
6. Publishing checklist

## Quality Gate
Before finishing, verify:
- Would you convert after reading this? (If not, what is missing?)
- Are there vague claims that should be replaced with specifics?
- Is every objection addressed?
- Is it clear what the visitor should do next?
```

### 生成规则

- 最多可**并行生成 5 个内容智能体**（超过 5 个会变得难以管理——
  应按影响力确定优先级）
- 确定机会优先级的依据：展示次数 x 排名提升潜力
- 每个智能体独立工作——无需相互协调
- 智能体完成工作后，向用户展示各自生成的内容及其元数据
- 所有智能体完成工作后，提供总结：生成了哪些内容、建议的
  发布顺序（影响力最高的优先），以及新页面之间的任何交叉链接