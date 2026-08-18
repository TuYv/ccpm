---
name: seo-dataforseo
description: >
  Live SEO data via DataForSEO MCP server. SERP analysis (Google, Bing, Yahoo,
  YouTube, Google Images), keyword research (volume, difficulty, intent, trends),
  backlink profiles, on-page analysis (Lighthouse, content parsing), competitor
  analysis, content analysis, business listings, AI visibility (ChatGPT scraper,
  LLM mention tracking), and domain analytics. Requires DataForSEO extension
  installed. Use when user says "dataforseo", "live SERP", "keyword volume",
  "backlink data", "competitor data", "AI visibility check", "LLM mentions",
  "image SERP", "google images", "image rankings", or "real search data".
user-invokable: true
argument-hint: "[command] [query]"
compatibility: "Requires DataForSEO MCP server"
metadata:
  category: seo
---
# DataForSEO：实时 SEO 数据（扩展）

通过 DataForSEO MCP 服务器获取实时搜索数据。提供实时 SERP 结果（自然搜索 + 图片）、关键词指标、反向链接概况、页面分析、内容分析、商家信息、AI 可见性检查以及 LLM 提及追踪，涵盖 10 个 API 模块和 79 个以上的 MCP 工具。

## 前置要求

此 Skill 要求安装 DataForSEO 扩展：
```bash
./extensions/dataforseo/install.sh
```

**检查可用性：** 使用任何 DataForSEO 工具之前，请检查 `serp_organic_live_advanced` 或任何 DataForSEO 工具是否可用，以确认 MCP 服务器已连接。如果工具不可用，请告知用户该扩展尚未安装，并提供安装说明。

## API 额度注意事项

DataForSEO 按 API 调用收费。请高效使用：
- 优先使用批量端点，而不是多次单独调用
- 除非用户另有指定，否则使用默认参数（美国、英语）
- 在会话期间记住并复用结果；不要重复获取相同数据
- 在执行高成本操作（完整反向链接抓取、大型关键词列表）之前警告用户

## 成本防护规则

**每次调用 DataForSEO MCP 之前**，运行成本估算：
```
python scripts/dataforseo_costs.py check <endpoint> [--count N]
```

- 如果 `"status": "approved"` → 继续执行 API 调用
- 如果 `"status": "needs_approval"` → 向用户显示成本估算，并在继续之前请求确认
- 如果 `"status": "blocked"` → 告知用户该操作将超出每日预算限制；不要继续执行

**每次 API 调用完成后**，记录成本：
```
python scripts/dataforseo_costs.py log <endpoint> <actual_cost>
```

**用于成本管理的用户命令：**
- `/seo dataforseo costs today` → 显示今日支出明细
- `/seo dataforseo costs summary` → 显示 7 天支出历史
- `/seo dataforseo costs config --mode threshold --threshold 0.50` → 配置审批模式

加载 `references/cost-tiers.md` 以查看完整定价表、预算预设和成本降低技巧。

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/seo dataforseo serp <keyword>` | Google 自然搜索 SERP 结果 |
| `/seo dataforseo serp-images <keyword>` | Google 图片 SERP 结果 |
| `/seo dataforseo serp-youtube <keyword>` | YouTube 搜索结果 |
| `/seo dataforseo youtube <video_id>` | YouTube 视频深度分析 |
| `/seo dataforseo keywords <seed>` | 关键词创意和建议 |
| `/seo dataforseo volume <keywords>` | 关键词搜索量 |
| `/seo dataforseo difficulty <keywords>` | 关键词难度评分 |
| `/seo dataforseo intent <keywords>` | 搜索意图分类 |
| `/seo dataforseo trends <keyword>` | Google Trends 数据 |
| `/seo dataforseo backlinks <domain>` | 完整反向链接概况 |
| `/seo dataforseo competitors <domain>` | 竞争对手域名分析 |
| `/seo dataforseo ranked <domain>` | 域名参与排名的关键词 |
| `/seo dataforseo intersection <domains>` | 关键词/反向链接重叠情况 |
| `/seo dataforseo traffic <domains>` | 批量流量估算 |
| `/seo dataforseo subdomains <domain>` | 包含排名数据的子域名 |
| `/seo dataforseo top-searches <domain>` | 提及域名的热门查询 |
| `/seo dataforseo onpage <url>` | 页面分析（Lighthouse + 解析） |
| `/seo dataforseo tech <domain>` | 技术栈检测 |
| `/seo dataforseo whois <domain>` | WHOIS 注册数据 |
| `/seo dataforseo content <keyword/url>` | 内容分析和趋势 |
| `/seo dataforseo listings <keyword>` | 商家信息搜索 |
| `/seo dataforseo ai-scrape <query>` | 用于 GEO 的 ChatGPT 网页抓取工具 |
| `/seo dataforseo ai-mentions <keyword>` | 用于 GEO 的 LLM 提及追踪 |

---

## SERP 分析

### `/seo dataforseo serp <keyword>`

获取实时 Google 自然搜索结果。

**MCP 工具：** `serp_organic_live_advanced`

**默认参数：** location_code=2840 (US), language_code=en, device=desktop, depth=100

**还支持：** `serp_organic_live_advanced` 工具通过 `se` 参数支持 Google、Bing 和 Yahoo。指定 "bing" 或 "yahoo" 即可切换搜索引擎。

**输出：** 排名、URL、标题、描述、域名、精选摘要、AI 概览引用、“其他用户还问了”问题。

### `/seo dataforseo serp-youtube <keyword>`

获取 YouTube 搜索结果。对 GEO 很有价值。YouTube 提及与 AI 引用的相关性最强。

**MCP 工具：** `serp_youtube_organic_live_advanced`

**输出：** 视频标题、频道、观看次数、上传日期、描述、URL。

### `/seo dataforseo youtube <video_id>`

深入分析特定 YouTube 视频：信息、评论和字幕。YouTube 提及与 AI 可见性的相关性最强（0.737），因此这对 GEO 分析至关重要。

**MCP 工具：** `serp_youtube_video_info_live_advanced`、`serp_youtube_video_comments_live_advanced`、`serp_youtube_video_subtitles_live_advanced`

**参数：** video_id（YouTube 视频 ID，例如 "dQw4w9WgXcQ"）

**输出：** 视频元数据（标题、频道、观看次数、点赞数、描述）、互动量最高的评论、字幕/转录文本。

### `/seo dataforseo serp-images <keyword>`

获取实时 Google 图片搜索结果。查看哪些图片在某个关键词下排名靠前、
哪些域名主导图片搜索结果，并发现视觉内容机会。

**MCP 工具：** `serp_google_images_live_advanced`

**默认参数：** location_code=2840 (US), language_code=en, device=desktop, depth=100

**参数：** keyword（必需）、depth（可选，最大值为 700，每增加 100 条结果计费一次）、search_param（可选，例如 "site:example.com"）

**成本警告：** 使用 `site:` 或 `filetype:` 运算符会产生 **5 倍 API 成本**。在运行筛选查询前警告用户。

**输出：** 位置、标题、替代文本、来源页面 URL、直接图片 URL、域名、编码后的 URL。

**需提供的分析：**
- 域名主导程度：哪些网站占据了最多的图片位置（按数量排名前 10 的域名）
- 替代文本模式：排名靠前的图片中常见的标题/替代文本模式
- 格式分布：排名靠前的结果中 WebP、JPEG 与 PNG 的占比（根据 image_url 扩展名推断）
- 机会识别：用户拥有自然搜索排名但没有图片曝光的关键词

---

## 关键词研究

### `/seo dataforseo keywords <seed>`

根据种子关键词生成关键词创意、建议和相关词。

**MCP 工具：** `dataforseo_labs_google_keyword_ideas`、`dataforseo_labs_google_keyword_suggestions`、`dataforseo_labs_google_related_keywords`

**默认参数：** location_code=2840 (US), language_code=en, limit=50

**输出：** 关键词、搜索量、CPC、竞争程度、关键词难度、趋势。

### `/seo dataforseo volume <keywords>`

获取关键词列表的搜索量和指标。

**MCP 工具：** `kw_data_google_ads_search_volume`

**参数：** keywords（数组，以逗号分隔）、location_code、language_code

**输出：** 关键词、月度搜索量、CPC、竞争度、月度趋势数据。

### `/seo dataforseo difficulty <keywords>`

计算关键词难度分数，以衡量排名竞争力。

**MCP 工具：** `dataforseo_labs_bulk_keyword_difficulty`

**参数：** keywords（数组）、location_code、language_code

**输出：** 关键词、难度分数（0-100）、解读（简单/中等/困难/非常困难）。

### `/seo dataforseo intent <keywords>`

根据用户搜索意图对关键词进行分类。

**MCP 工具：** `dataforseo_labs_search_intent`

**参数：** keywords（数组）、location_code、language_code

**输出：** 关键词、意图类型（信息型、导航型、商业型、交易型）、置信度分数。

### `/seo dataforseo trends <keyword>`

使用 Google Trends 数据分析关键词随时间变化的趋势。

**MCP 工具：** `kw_data_google_trends_explore`

**参数：** keywords（数组）、location_code、date_from、date_to、language_code

**输出：** 关键词、时间序列数据、趋势方向、季节性信号。

---

## 域名与竞争对手分析

### `/seo dataforseo backlinks <domain>`

全面分析反向链接概况。

**MCP 工具：** `backlinks_summary`、`backlinks_backlinks`、`backlinks_anchors`、`backlinks_referring_domains`、`backlinks_bulk_spam_score`、`backlinks_timeseries_summary`

**默认参数：** 每个子调用 limit=100

**输出：** 反向链接总数、引用域名、域名排名、垃圾内容分数、热门锚文本、随时间变化的新增/丢失反向链接、dofollow 链接比例、热门引用域名。

### `/seo dataforseo competitors <domain>`

识别竞争域名并估算流量。

**MCP 工具：** `dataforseo_labs_google_competitors_domain`、`dataforseo_labs_google_domain_rank_overview`、`dataforseo_labs_bulk_traffic_estimation`

**输出：** 竞争域名、关键词重合率、预估流量、域名排名、共同关键词。

### `/seo dataforseo ranked <domain>`

列出域名参与排名的关键词及其排名位置和页面数据。

**MCP 工具：** `dataforseo_labs_google_ranked_keywords`、`dataforseo_labs_google_relevant_pages`

**默认参数：** limit=100、location_code=2840

**输出：** 关键词、排名位置、URL、搜索量、流量份额、SERP 特性。

### `/seo dataforseo intersection <domain1> <domain2> [...]`

查找 2-20 个域名之间的共同关键词和反向链接来源。

**MCP 工具：** `dataforseo_labs_google_domain_intersection`、`backlinks_domain_intersection`

**参数：** domains（包含 2-20 个元素的数组）

**输出：** 共同关键词及其在各域名中的排名位置、共同反向链接来源、各域名的独有关键词。

### `/seo dataforseo traffic <domains>`

估算一个或多个域名的自然搜索流量。

**MCP 工具：** `dataforseo_labs_bulk_traffic_estimation`

**参数：** domains（数组）

**输出：** 域名、预估自然流量、预估流量成本、热门关键词。

### `/seo dataforseo subdomains <domain>`

枚举子域名及其排名数据和流量估算。

**MCP 工具：** `dataforseo_labs_google_subdomains`

**参数：** target（域名）、location_code、language_code

**输出：** 子域名、参与排名的关键词数量、预估流量、自然搜索成本。

### `/seo dataforseo top-searches <domain>`

查找搜索结果中提及特定域名的最热门搜索查询。

**MCP 工具：** `dataforseo_labs_google_top_searches`

**参数：** target（域名）、location_code、language_code

**输出：** 查询、搜索量、域名排名位置、SERP 功能、流量占比。

---

## 技术 / 页面内 SEO

### `/seo dataforseo onpage <url>`

运行页面内分析，包括 Lighthouse 审核和内容解析。

**MCP 工具：** `on_page_instant_pages`、`on_page_content_parsing`、`on_page_lighthouse`

**用法：**
- `on_page_instant_pages`：快速页面分析（状态码、元标签、内容大小、页面加载时间、失效链接、页面内检查）
- `on_page_content_parsing`：提取并解析页面内容（纯文本、字数、结构）
- `on_page_lighthouse`：完整的 Lighthouse 审核（性能得分、无障碍性、最佳实践、SEO、Core Web Vitals）

**输出：** 已抓取页面、状态码、元标签、标题、内容大小、加载时间、Lighthouse 得分、失效链接、资源分析。

### `/seo dataforseo tech <domain>`

检测域名使用的技术。

**MCP 工具：** `domain_analytics_technologies_domain_technologies`

**输出：** 技术名称、版本、类别（CMS、分析工具、CDN、框架等）。

### `/seo dataforseo whois <domain>`

检索 WHOIS 注册数据。

**MCP 工具：** `domain_analytics_whois_overview`

**输出：** 注册商、创建日期、到期日期、域名服务器、注册人信息（若公开）。

---

## 内容与商业数据

### `/seo dataforseo content <keyword/url>`

分析内容质量、按主题搜索内容并跟踪短语趋势。

**MCP 工具：** `content_analysis_search`、`content_analysis_summary`、`content_analysis_phrase_trends`

**参数：** keyword（用于搜索/趋势）或 URL（用于摘要）

**输出：** 包含质量得分的内容匹配结果、情感分析、可读性指标、短语随时间变化的趋势数据。

### `/seo dataforseo listings <keyword>`

搜索商家列表，以进行本地 SEO 竞争分析。

**MCP 工具：** `business_data_business_listings_search`

**参数：** keyword、location（可选）

**输出：** 商家名称、描述、类别、地址、电话、域名、评分、评论数量、认领状态。

---

## AI 可见性 / GEO

### `/seo dataforseo ai-scrape <query>`

抓取 ChatGPT 网页搜索针对某个查询返回的内容。真正的 GEO 可见性检查：查看 ChatGPT 针对目标关键词引用了哪些来源。

**MCP 工具：** `ai_optimization_chat_gpt_scraper`

**参数：** query、location_code（可选）、language_code（可选）。使用 `ai_optimization_chat_gpt_scraper_locations` 查询可用位置。

**输出：** ChatGPT 响应内容、引用的来源/URL、提及的域名。

### `/seo dataforseo ai-mentions <keyword>`

追踪 LLM 如何提及品牌、域名和主题。这对 GEO 至关重要。衡量多个 LLM 平台上的实际 AI 可见性。

**MCP 工具：** `ai_opt_llm_ment_search`、`ai_opt_llm_ment_top_domains`、`ai_opt_llm_ment_top_pages`、`ai_opt_llm_ment_agg_metrics`

**参数：** keyword、location_code（可选）、language_code（可选）。使用 `ai_opt_llm_ment_loc_and_lang` 获取可用的位置/语言，使用 `ai_optimization_llm_models` 获取支持的 LLM 模型。

**工作流程：**
1. 使用 `ai_opt_llm_ment_search` 搜索 LLM 提及（在 LLM 响应中查找对某个品牌/关键词的提及）
2. 使用 `ai_opt_llm_ment_top_domains` 获取最常被引用的域名（此主题下哪些域名被引用最多）
3. 使用 `ai_opt_llm_ment_top_pages` 获取最常被引用的页面（哪些具体页面被引用最多）
4. 使用 `ai_opt_llm_ment_agg_metrics` 获取聚合指标（总体提及量、趋势）

**输出：** LLM 提及次数、最常被引用的域名及其频次、最常被引用的页面、提及量随时间变化的趋势、跨平台可见性得分。

**高级用法：** 使用 `ai_opt_llm_ment_cross_agg_metrics` 进行跨模型比较（比较 ChatGPT、Claude、Perplexity 等平台之间的提及差异）。

---

## 可用的实用工具

还有其他 DataForSEO MCP 工具可供内部使用，但没有专用命令。需要查找特定的实用工具（位置查询、批量操作、历史数据、筛选选项）时，请加载 `references/tool-catalog.md`。

## 跨技能集成

当 DataForSEO MCP 工具可用时，其他 seo-skills 技能可以利用实时数据：

- **seo-audit**：生成 `seo-dataforseo` 代理，以获取真实的 SERP、反向链接、页面内和商家信息数据
- **seo-technical**：使用 `on_page_instant_pages` / `on_page_lighthouse` 获取真实的抓取数据，使用 `domain_analytics_technologies_domain_technologies` 检测技术栈
- **seo-content**：使用 `kw_data_google_ads_search_volume`、`dataforseo_labs_bulk_keyword_difficulty`、`dataforseo_labs_search_intent` 获取真实的关键词指标，使用 `content_analysis_summary` 评估内容质量
- **seo-page**：使用 `serp_organic_live_advanced` 获取真实的 SERP 排名，使用 `backlinks_summary` 获取链接数据
- **seo-images**：使用 `serp_google_images_live_advanced` 获取竞争对手的图片 SERP 数据，并与页面内图片审核结果进行交叉核对
- **seo-geo**：使用 `ai_optimization_chat_gpt_scraper` 获取真实的 ChatGPT 可见性，使用 `ai_opt_llm_ment_search` 追踪 LLM 提及
- **seo-plan**：使用 `dataforseo_labs_google_competitors_domain`、`dataforseo_labs_google_domain_intersection`、`dataforseo_labs_bulk_traffic_estimation` 获取真实的竞争情报

## 错误处理

- **MCP 服务器未连接**：报告 DataForSEO 扩展未安装或 MCP 服务器不可访问。建议运行 `./extensions/dataforseo/install.sh`
- **API 身份验证失败**：报告凭据无效。建议检查 MCP 配置中的 DataForSEO API 登录名/密码
- **超出速率限制**：报告已触发限制，并建议等待后重试
- **未返回结果**：针对查询报告“未找到数据”，而不是进行猜测。建议扩大查询范围或检查位置/语言代码
- **位置代码无效**：报告错误，并建议使用位置查询工具查找正确的代码

## 输出格式

遵循现有的 seo-skills 输出模式：
- 使用表格展示比较数据
- 按 Critical > High > Medium > Low 的顺序确定问题优先级
- 提供具体、可执行的建议
- 在适用情况下以 XX/100 格式显示评分
- 将数据源注明为 "DataForSEO (live)"，以区别于静态分析