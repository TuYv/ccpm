---
name: seo-dataforseo
description: >
  Live SEO data via DataForSEO MCP server: SERP analysis, keyword research
  (volume, difficulty, intent, trends), backlink profiles, on-page analysis,
  competitor and content analysis, business listings, AI visibility (LLM
  mention tracking), and domain analytics. Requires DataForSEO extension
  installed. Use when user says "dataforseo", "live SERP", "keyword volume",
  "backlink data", "AI visibility check", or "real search data".
user-invocable: true
argument-hint: "[command] [query]"
license: MIT
compatibility: "Requires DataForSEO MCP server"
metadata:
  author: AgriciDaniel
  version: "2.2.5"
  category: seo
---
# DataForSEO：实时 SEO 数据（扩展）

通过 DataForSEO MCP 服务器获取实时搜索数据。提供实时 SERP 结果
（自然搜索结果 + 图片）、关键词指标、反向链接配置文件、页面分析、内容
分析、商家列表、AI 可见性检查，以及跨 9 个 API 模块、79+ 个 MCP 工具的
LLM 提及跟踪。

## 前置条件

此技能需要安装 DataForSEO 扩展：
```bash
./extensions/dataforseo/install.sh
```

**检查可用性：** 在使用任何 DataForSEO 工具之前，请通过检查
`serp_organic_live_advanced` 或其他任何 DataForSEO 工具是否可用，来确认 MCP 服务器
已连接。如果工具不可用，请告知用户扩展尚未安装，并提供安装说明。

## API 额度注意事项

DataForSEO 按 API 调用次数收费。请提高效率：
- 优先使用批量端点，而不是多次单独调用
- 除非用户另有指定，否则使用默认参数（美国、英语）
- 在会话中记住结果；不要重复获取相同数据
- 在运行高成本操作（完整反向链接抓取、大型关键词列表）之前警告用户

## 成本控制

**每次 DataForSEO MCP 调用之前，都要运行成本估算：**
```
claude-seo run dataforseo_costs.py check <endpoint> [--count N]
```

- 如果 `"status": "approved"` → 继续进行 API 调用
- 如果 `"status": "needs_approval"` → 向用户展示成本估算，并在继续之前请求确认
- 如果 `"status": "blocked"` → 告知用户将超出每日预算上限；不要继续

**每次 API 调用完成后，都要记录成本：**
```
claude-seo run dataforseo_costs.py log <endpoint> <actual_cost>
```

**用于成本管理的用户命令：**
- `/seo dataforseo costs today` → 显示今天的支出明细
- `/seo dataforseo costs summary` → 显示最近 7 天的支出历史
- `/seo dataforseo costs config --mode threshold --threshold 0.50` → 配置审批模式

加载 `references/cost-tiers.md` 以获取完整的定价表、预算预设和降低成本的技巧。

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/seo dataforseo serp <keyword>` | Google 自然搜索 SERP 结果 |
| `/seo dataforseo serp-images <keyword>` | Google 图片 SERP 结果 |
| `/seo dataforseo serp-youtube <keyword>` | YouTube 搜索结果 |
| `/seo dataforseo youtube <video_id>` | YouTube 视频深度分析 |
| `/seo dataforseo keywords <seed>` | 关键词创意和建议 |
| `/seo dataforseo volume <keywords>` | 关键词搜索量 |
| `/seo dataforseo difficulty <keywords>` | 关键词难度分数 |
| `/seo dataforseo intent <keywords>` | 搜索意图分类 |
| `/seo dataforseo trends <keyword>` | Google Trends 数据 |
| `/seo dataforseo backlinks <domain>` | 完整反向链接配置文件 |
| `/seo dataforseo competitors <domain>` | 竞争对手域名分析 |
| `/seo dataforseo ranked <domain>` | 域名排名关键词 |
| `/seo dataforseo intersection <domains>` | 关键词/反向链接重叠情况 |
| `/seo dataforseo traffic <domains>` | 批量流量估算 |
| `/seo dataforseo subdomains <domain>` | 具有排名数据的子域名 |
| `/seo dataforseo top-searches <domain>` | 提及该域名的热门查询 |
| `/seo dataforseo onpage <url>` | 页面分析（Lighthouse + 解析） |
| `/seo dataforseo tech <domain>` | 技术栈检测 |
| `/seo dataforseo whois <domain>` | WHOIS 注册数据 |
| `/seo dataforseo content <keyword/url>` | 内容分析和趋势 |
| `/seo dataforseo listings <keyword>` | 商家列表搜索 |
| `/seo dataforseo ai-scrape <query>` | 用于 GEO 的 ChatGPT 网页抓取器 |
| `/seo dataforseo ai-mentions <keyword>` | 用于 GEO 的 LLM 提及跟踪 |

---

## SERP 分析

### `/seo dataforseo serp <keyword>`

获取实时 Google 自然搜索结果。

**MCP 工具：** `serp_organic_live_advanced`

**默认参数：** location_code=2840 (US)、language_code=en、device=desktop、depth=100

**同时支持：** `serp_organic_live_advanced` 工具通过 `se` 参数支持 Google、Bing 和 Yahoo。指定 "bing" 或 "yahoo" 可切换搜索引擎。

**输出：** 排名、URL、标题、描述、域名、精选摘要、AI 概览引用、用户也会问。

### `/seo dataforseo serp-youtube <keyword>`

获取 YouTube 搜索结果。对 GEO 很有价值。YouTube 提及与 AI 引用的相关性最强。

**MCP 工具：** `serp_youtube_organic_live_advanced`

**输出：** 视频标题、频道、观看次数、上传日期、描述、URL。

### `/seo dataforseo youtube <video_id>`

对特定 YouTube 视频进行深度分析：信息、评论和字幕。一些第三方研究报告称，YouTube 提及与 AI 可见性之间存在 0.737 的相关性，因此应将其视为依赖方法论的 GEO 信号。

**MCP 工具：** `serp_youtube_video_info_live_advanced`、`serp_youtube_video_comments_live_advanced`、`serp_youtube_video_subtitles_live_advanced`

**参数：** video_id（YouTube 视频 ID，例如 "dQw4w9WgXcQ"）

**输出：** 视频元数据（标题、频道、观看次数、点赞数、描述）、按互动度排序的热门评论、字幕/文字记录内容。

### `/seo dataforseo serp-images <keyword>`

获取实时 Google 图片搜索结果。查看哪些图片在某个关键词下排名、哪些域名在图片结果中占据主导地位，并识别视觉内容机会。

**MCP 工具：** `serp_google_images_live_advanced`

**默认参数：** location_code=2840 (US)、language_code=en、device=desktop、depth=100

**参数：** keyword（必填）、depth（可选，最大值为 700，按每增加 100 条结果计费）、search_param（可选，例如 "site:example.com"）

**费用警告：** 使用 `site:` 或 `filetype:` 运算符会产生 **5 倍 API 费用**。运行筛选查询前，先警告用户。

**输出：** 位置、标题、替代文本、来源页面 URL、直接图片 URL、域名、编码后的 URL。

**应提供的分析：**
- 域名主导地位：哪些网站占据最多的图片排名（按数量统计的前 10 个域名）
- 替代文本模式：排名靠前图片中常见的标题/替代文本模式
- 格式分布：前列结果中的 WebP、JPEG 和 PNG 分布（根据 image_url 扩展名推断）
- 机会识别：用户拥有自然排名但没有图片展示的位置对应的关键词

---

## 关键词研究

### `/seo dataforseo keywords <seed>`

根据种子关键词生成关键词创意、建议和相关词。

**MCP 工具：** `dataforseo_labs_google_keyword_ideas`、`dataforseo_labs_google_keyword_suggestions`、`dataforseo_labs_google_related_keywords`

**默认参数：** location_code=2840 (US)、language_code=en、limit=50

**输出：** 关键词、搜索量、CPC、竞争程度、关键词难度、趋势。

### `/seo dataforseo volume <keywords>`

获取关键词列表的搜索量和指标。

**MCP 工具：** `kw_data_google_ads_search_volume`

**参数：** keywords (array, comma-separated), location_code, language_code

**输出：** 关键词、月搜索量、CPC、竞争度、月度趋势数据。

### `/seo dataforseo difficulty <keywords>`

计算关键词难度分数，以评估排名竞争力。

**MCP 工具：** `dataforseo_labs_bulk_keyword_difficulty`

**参数：** keywords (array), location_code, language_code

**输出：** 关键词、难度分数 (0-100)、解读 (Easy/Medium/Hard/Very Hard)。

### `/seo dataforseo intent <keywords>`

根据用户的搜索意图对关键词进行分类。

**MCP 工具：** `dataforseo_labs_search_intent`

**参数：** keywords (array), location_code, language_code

**输出：** 关键词、意图类型 (informational, navigational, commercial, transactional)、置信度分数。

### `/seo dataforseo trends <keyword>`

使用 Google Trends 数据分析关键词随时间的趋势。

**MCP 工具：** `kw_data_google_trends_explore`

**参数：** keywords (array), location_code, date_from, date_to, language_code

**输出：** 关键词、时间序列数据、趋势方向、季节性信号。

---

## 域名与竞争对手分析

### `/seo dataforseo backlinks <domain>`

全面分析反向链接概况。

**MCP 工具：** `backlinks_summary`, `backlinks_backlinks`, `backlinks_anchors`, `backlinks_referring_domains`, `backlinks_bulk_spam_score`, `backlinks_timeseries_summary`

**默认参数：** 每个子调用 limit=100

**输出：** 反向链接总数、引用域名数、域名排名、垃圾链接分数、热门锚文本、随时间变化的新建/丢失反向链接、dofollow 比例、热门引用域名。

### `/seo dataforseo competitors <domain>`

识别竞争域名并估算流量。

**MCP 工具：** `dataforseo_labs_google_competitors_domain`, `dataforseo_labs_google_domain_rank_overview`, `dataforseo_labs_bulk_traffic_estimation`

**输出：** 竞争对手域名、关键词重叠率 %、估算流量、域名排名、共同关键词。

### `/seo dataforseo ranked <domain>`

列出某个域名排名涉及的关键词及其排名位置和页面数据。

**MCP 工具：** `dataforseo_labs_google_ranked_keywords`, `dataforseo_labs_google_relevant_pages`

**默认参数：** limit=100, location_code=2840

**输出：** 关键词、排名位置、URL、搜索量、流量占比、SERP 特性。

### `/seo dataforseo intersection <domain1> <domain2> [...]`

查找 2-20 个域名之间的共享关键词和反向链接来源。

**MCP 工具：** `dataforseo_labs_google_domain_intersection`, `backlinks_domain_intersection`

**参数：** domains (2-20 array)

**输出：** 各域名对应排名位置的共享关键词、共享反向链接来源、各域名的独有关键词。

### `/seo dataforseo traffic <domains>`

估算一个或多个域名的自然搜索流量。

**MCP 工具：** `dataforseo_labs_bulk_traffic_estimation`

**参数：** domains (array)

**输出：** 域名、估算自然流量、估算流量成本、热门关键词。

### `/seo dataforseo subdomains <domain>`

枚举子域名及其排名数据和流量估算。

**MCP 工具：** `dataforseo_labs_google_subdomains`

**参数：** target（域名）、location_code、language_code

**输出：** 子域名、获得排名的关键词数量、预估流量、自然搜索成本。

### `/seo dataforseo top-searches <domain>`

查找搜索结果中提及特定域名的最热门搜索查询。

**MCP 工具：** `dataforseo_labs_google_top_searches`

**参数：** target（域名）、location_code、language_code

**输出：** 查询、搜索量、域名排名、SERP 特性、流量份额。

---

## 技术 / 页面内

### `/seo dataforseo onpage <url>`

运行页面内分析，包括 Lighthouse 审计和内容解析。

**MCP 工具：** `on_page_instant_pages`、`on_page_content_parsing`、`on_page_lighthouse`

**用法：**
- `on_page_instant_pages`：快速页面分析（状态码、元标签、内容大小、页面计时、失效链接、页面内检查）
- `on_page_content_parsing`：提取并解析页面内容（纯文本、字数、结构）
- `on_page_lighthouse`：完整的 Lighthouse 审计（性能评分、可访问性、最佳实践、SEO、核心网页指标）

**输出：** 抓取的页面、状态码、元标签、标题、内容大小、加载时间、Lighthouse 评分、失效链接、资源分析。

### `/seo dataforseo tech <domain>`

检测域名使用的技术。

**MCP 工具：** `domain_analytics_technologies_domain_technologies`

**输出：** 技术名称、版本、类别（CMS、分析、CDN、框架等）。

### `/seo dataforseo whois <domain>`

获取 WHOIS 注册数据。

**MCP 工具：** `domain_analytics_whois_overview`

**输出：** 注册商、创建日期、到期日期、名称服务器、注册人信息（如果公开）。

---

## 内容与业务数据

### `/seo dataforseo content <keyword/url>`

分析内容质量、按主题搜索内容，并跟踪短语趋势。

**MCP 工具：** `content_analysis_search`、`content_analysis_summary`、`content_analysis_phrase_trends`

**参数：** keyword（用于搜索/趋势）或 URL（用于摘要）

**输出：** 匹配的内容及其质量评分、情感分析、可读性指标、随时间变化的短语趋势数据。

### `/seo dataforseo listings <keyword>`

搜索商家列表，用于本地 SEO 竞争分析。

**MCP 工具：** `business_data_business_listings_search`

**参数：** keyword、location（可选）

**输出：** 商家名称、描述、类别、地址、电话、域名、评分、评论数量、认领状态。

---

## AI 可见性 / GEO

### `/seo dataforseo ai-scrape <query>`

抓取 ChatGPT 网页搜索针对某个查询返回的内容。检查 ChatGPT 可见性：查看 ChatGPT 为目标关键词引用了哪些来源。在可用时，使用 GSC 生成式 AI 报告检查 Google AI Overviews 和 AI Mode。

**MCP 工具：** `ai_optimization_chat_gpt_scraper`

**参数：** query、location_code（可选）、language_code（可选）。使用 `ai_optimization_chat_gpt_scraper_locations` 查找可用位置。

**输出：** ChatGPT 响应内容、引用的来源/URL、引用的域名。

### `/seo dataforseo ai-mentions <keyword>`

跟踪 LLM 如何提及品牌、域名和主题。这对 GEO 至关重要，可衡量品牌在多个 LLM 平台上的实际 AI 可见度。

**MCP 工具：** `ai_opt_llm_ment_search`、`ai_opt_llm_ment_top_domains`、`ai_opt_llm_ment_top_pages`、`ai_opt_llm_ment_agg_metrics`

**参数：** keyword、location_code（可选）、language_code（可选）。使用 `ai_opt_llm_ment_loc_and_lang` 获取可用的位置/语言，使用 `ai_optimization_llm_models` 获取受支持的 LLM 模型。

**工作流：**
1. 使用 `ai_opt_llm_ment_search` 搜索 LLM 提及内容（在 LLM 响应中查找对品牌/关键词的提及）
2. 使用 `ai_opt_llm_ment_top_domains` 获取被引用最多的域名（针对该主题，哪些域名被引用得最多）
3. 使用 `ai_opt_llm_ment_top_pages` 获取被引用最多的页面（哪些具体页面被引用得最多）
4. 使用 `ai_opt_llm_ment_agg_metrics` 获取汇总指标（总体提及量、趋势）

**输出：** LLM 提及次数、按频率排列的热门引用域名、热门引用页面、随时间变化的提及趋势、跨平台可见度评分。

**高级用法：** 使用 `ai_opt_llm_ment_cross_agg_metrics` 进行跨模型比较（比较 ChatGPT、Claude、Perplexity 等平台上的提及差异）。

---

## 可用的实用工具

其他 DataForSEO MCP 工具可供内部使用，但没有专用命令。需要查找特定实用工具（位置查询、批量操作、历史数据、筛选选项）时，加载 `references/tool-catalog.md`。

## 跨 Skill 集成

DataForSEO MCP 工具可用时，其他 claude-seo skill 可以利用实时数据：

- **seo-audit**：派生 `seo-dataforseo` agent，获取真实 SERP、反向链接、页面和商家列表数据
- **seo-technical**：使用 `on_page_instant_pages` / `on_page_lighthouse` 获取真实抓取数据，使用 `domain_analytics_technologies_domain_technologies` 检测技术栈
- **seo-content**：使用 `kw_data_google_ads_search_volume`、`dataforseo_labs_bulk_keyword_difficulty`、`dataforseo_labs_search_intent` 获取真实关键词指标，使用 `content_analysis_summary` 获取内容质量数据
- **seo-page**：使用 `serp_organic_live_advanced` 获取真实 SERP 排名，使用 `backlinks_summary` 获取链接数据
- **seo-images**：使用 `serp_google_images_live_advanced` 获取竞争对手图片 SERP 数据，并与页面图片审计结果交叉参考
- **seo-geo**：使用 `ai_optimization_chat_gpt_scraper` 获取真实 ChatGPT 可见度，使用 `ai_opt_llm_ment_search` 跟踪 LLM 提及
- **seo-plan**：使用 `dataforseo_labs_google_competitors_domain`、`dataforseo_labs_google_domain_intersection`、`dataforseo_labs_bulk_traffic_estimation` 获取真实竞争情报

## 错误处理

- **MCP 服务器未连接**：报告 DataForSEO 扩展未安装或 MCP 服务器无法访问。建议运行 `./extensions/dataforseo/install.sh`
- **API 身份验证失败**：报告凭据无效。建议检查 MCP 配置中的 DataForSEO API 登录名/密码
- **超出速率限制**：报告已触发的限制，并建议稍后再试
- **未返回结果**：针对该查询报告“未找到数据”，不要猜测。建议扩大查询范围，或检查位置/语言代码
- **位置代码无效**：报告错误，并建议使用位置查询工具查找正确的代码

## 输出格式

匹配现有的 claude-seo 输出模式：
- 对于比较数据，使用表格
- 按 Critical > High > Medium > Low 的优先级排列问题
- 提供具体、可操作的建议
- 在适用时，将分数显示为 XX/100
- 将数据源标注为 "DataForSEO (live)"，以区别于静态分析