---
name: seo-sxo
description: >
  Search Experience Optimization: reads Google SERPs backwards to detect page-type
  mismatches, derives user stories from search intent signals, and scores pages
  from multiple persona perspectives. Identifies why well-optimized pages fail
  to rank by analyzing what Google rewards for each keyword. Use when user says
  "SXO", "search experience", "page type mismatch", "SERP analysis", "user story",
  "persona scoring", "why isn't my page ranking", "intent mismatch", or "wireframe".
user-invocable: true
argument-hint: "<url> [keyword]"
license: MIT
metadata:
  author: AgriciDaniel
  original_author: "Florian Schmitz (Pro Hub Challenge)"
  version: "2.2.4"
  category: seo
---
# 搜索体验优化（SXO）

SXO 弥合了 SEO（Google 奖励什么）与 UX（用户需要什么）之间的差距。  
传统 SEO 审核检查技术健康状况。SXO 则会问：“根据 Google 在 SERP 中实际奖励的内容，这个页面是否值得凭借这个关键词获得排名？”

## 核心洞察

一个页面的技术 SEO 得分可能达到 95/100，却仍然无法获得排名，因为它属于与该关键词**不匹配的页面类型**。如果 Google 针对你的关键词展示了 8 个产品页面和 2 个比较页面，那么你的博客文章将永远无法脱颖而出——无论它的优化有多完善。

## 命令

| 命令 | 用途 |
|---------|---------|
| `/seo sxo <url>` | 完整的 SXO 分析（自动从页面检测关键词） |
| `/seo sxo <url> <keyword>` | 针对特定关键词进行完整的 SXO 分析 |
| `/seo sxo wireframe <url>` | 生成带有具体占位内容的 IST/SOLL 线框图 |
| `/seo sxo personas <url>` | 仅进行用户画像评分（跳过 SERP 分析） |

## 执行流程

### 第 1 步：获取目标

1. 通过 `scripts/render_page.py --mode auto` 获取目标 URL（支持 SPA 且可防范 SSRF）
2. 使用 `scripts/parse_html.py` 进行解析，以提取：标题、H1、元描述、标题层级、字数、Schema 标记、CTA、媒体元素
3. 如果未提供关键词，则从 title 标签与 H1 的重合内容中提取主要关键词
4. 在继续之前，验证关键词不为空

### 第 2 步：SERP 反向分析

阅读 `references/page-type-taxonomy.md` 以了解分类规则。

1. 在 Google 中搜索目标关键词（WebSearch）
2. 对排名前 10 的自然搜索结果，分别记录：
   - URL 和域名权威等级（品牌 / 垂直领域权威站点 / 未知）
   - 页面类型（使用分类法进行分类）
   - 内容格式（长篇内容、列表文章、操作指南、比较、工具、视频）
   - 字数估算（根据摘要长度和页面结构）
   - 存在的 Schema 类型（基于当前支持的 SERP 功能；排除 FAQ/HowTo）
   - 媒体信号（视频轮播、图片包、是否存在缩略图）
3. 记录存在的 SERP 功能：
   - 精选摘要（段落 / 列表 / 表格 / 视频）
   - “其他用户还问了以下问题”（提取所有可见问题）
   - 广告（顶部和底部——统计数量并分析广告文案主题）
   - 相关搜索（全部提取）
   - 知识面板 / 本地结果包 / 购物结果
   - 是否存在 AI 概览及其来源类型
4. 计算 SERP 共识：
   - 主导页面类型（>60% = 强共识，40-60% = 混合，<40% = 分散）
   - 内容深度预期（平均字数等级）
   - Schema 预期（最常见的结构化数据类型）
   - 媒体预期（是否必须有视频？图片是否至关重要？）

### 第 3 步：检测页面类型不匹配

这是 SXO 的核心洞察。将目标页面类型与 SERP 共识进行比较。

**不匹配严重程度级别：**

| 目标类型 | SERP 预期类型 | 严重程度 | 建议 |
|-------------|-------------|----------|----------------|
| 博客文章 | 产品页面 | 严重 | 创建专门的产品页面 |
| 博客文章 | 比较页面 | 高 | 重构为带有对比矩阵的比较页面 |
| 产品页面 | 信息型页面 | 高 | 添加教育性内容层 |
| 着陆页 | 工具/计算器 | 高 | 构建交互式工具组件 |
| 服务页面 | 本地搜索结果 | 中 | 添加位置相关信号 + 本地 Schema |
| 任意匹配类型 | - | 匹配 | 专注于内容深度和 UX |

**分类规则：**
- 使用 `references/page-type-taxonomy.md` 对目标页面进行分类
- 使用相同的分类法对每个 SERP 结果进行分类
- 如果目标页面类型与 SERP 主导类型不同，则标记为不匹配
- 如果 SERP 较为分散（没有主导类型），则指出差异化机会

### 步骤 4：用户故事推导

阅读 `references/user-story-framework.md` 以了解完整框架。

根据 SERP 信号推导用户故事：

1. **PAA 问题**揭示知识缺口和顾虑
2. **广告文案主题**揭示商业触发因素和价值主张
3. **相关搜索**揭示搜索旅程（之前/之后搜索什么）
4. **精选摘要格式**揭示预期的答案结构
5. **AI 概览**揭示 Google 认定的权威答案

针对每组信号，生成一个用户故事：
```
As a [persona derived from signal],
I want to [goal derived from query intent],
because [emotional driver from ad copy / PAA tone],
but I'm blocked by [barrier derived from PAA questions / related searches].
```

生成 3-5 个用户故事，涵盖主要意图角度。

### 步骤 5：差距分析

从 7 个维度比较目标页面与 SERP 预期：

| 维度 | 比较内容 | 分数 |
|-----------|----------------|-------|
| 页面类型 | 目标页面类型与 SERP 主导类型 | 0-15 |
| 内容深度 | 字数、标题层级深度、主题覆盖范围 | 0-15 |
| UX 信号 | CTA 清晰度、首屏内容、移动端布局 | 0-15 |
| Schema 标记 | 当前存在的结构化数据类型与预期类型 | 0-15 |
| 媒体丰富度 | 图片、视频、交互式元素与 SERP 常见水平 | 0-15 |
| 权威性信号 | E-E-A-T 标志、社会认同、资质证明 | 0-15 |
| 时效性 | 最后更新时间、日期信号、内容新近程度 | 0-10 |

**总分：0-100 SXO 差距评分**（分数越低 = 差距越大，分数越高 = 匹配度越好）

### 步骤 6：基于用户画像的评分

阅读 `references/persona-scoring.md` 以了解方法。

1. 根据 SERP 意图信号推导 4-7 个用户画像：
   - 按主题对 PAA 问题进行聚类
   - 按目标受众对广告文案进行细分
   - 将相关搜索映射到用户旅程阶段
2. 针对每个用户画像，从 4 个维度对目标页面进行评分（每项 25 分）：
   - **相关性**：页面是否满足该用户画像的需求？
   - **清晰度**：该用户画像能否在 10 秒内找到答案？
   - **信任度**：是否为该用户画像提供了充分的信任信号？
   - **行动引导**：是否为该用户画像提供了清晰的下一步？
3. 输出用户画像卡片，包括评分和具体的改进建议
4. 按最弱的用户画像优先排列建议（即最大的机会点）

### 步骤 7：线框图生成（可选）

仅在调用 `/seo sxo wireframe` 时执行。

阅读 `references/wireframe-templates.md` 以了解模板。

1. 根据解析后的页面结构生成 IST（当前状态）线框图
2. 根据以下内容生成 SOLL（目标状态）线框图：
   - SERP 共识页面类型
   - 差距分析结果
   - 用户画像评分中的薄弱项
3. 使用极其具体的占位说明：
   - 不要这样写："Add a CTA here"
   - 应该这样写："Add pricing CTA with annual savings badge below hero, linking to /pricing#enterprise"
4. 以带注释的语义化 HTML 章节大纲形式输出

## DataForSEO 集成

如果 DataForSEO MCP 工具可用：

1. **在进行任何 API 调用之前**，运行成本估算并与用户确认
2. 使用 `serp_organic_live_advanced` 获取精确的 SERP 数据（排名、特性、摘要）
3. 使用 `kw_data_google_ads_search_volume` 获取搜索量和竞争指标
4. 如果 DataForSEO 不可用，则回退到 WebSearch——在输出中注明精确度有所降低

## SXO 评分与 SEO 健康评分

SXO 评分与主要的 SEO 健康评分**相互独立**。

- SEO 健康评分 = 技术合规性（可抓取性、速度、Schema 等）
- SXO 差距评分 = 页面与 SERP 预期之间的一致程度
- 一个页面可能获得 95 SEO + 30 SXO = 技术上完美，但策略上存在偏差
- 当两个评分均可用时，应一并报告

## 跨 Skill 参考

| 发现 | 转交至 |
|---------|-------------|
| 用户画像评分中的 E-E-A-T 差距 | `/seo content`，进行深入的 E-E-A-T 审计 |
| 缺少 Schema 类型 | `/seo schema`，用于生成 Schema |
| 在 SERP 中检测到本地意图 | `/seo local`，进行 GBP 分析 |
| 内容深度差距 | `/seo page`，进行深入的页面分析 |
| 抓取过程中发现技术问题 | `/seo technical`，进行完整审计 |
| 图片/媒体差距 | `/seo images`，进行优化 |

## 输出格式

### 完整 SXO 分析

```
## SXO Analysis: [URL]
### Target Keyword: [keyword]

### 1. SERP Landscape
- Dominant page type: [type] ([confidence]% consensus)
- SERP features: [list]
- Content depth norm: [word count range]
- Schema expectation: [types]

### 2. Page-Type Alignment
- Your page type: [type]
- SERP expects: [type]
- Verdict: [ALIGNED | MISMATCH (severity)]
- Impact: [explanation]

### 3. User Stories (derived from SERP signals)
[3-5 user stories with source signals]

### 4. Gap Analysis (SXO Score: XX/100)
[7-dimension breakdown table]

### 5. Persona Scores
[4-7 persona cards with 4-dimension scores]

### 6. Priority Actions
[Ranked list: fix mismatch first, then weakest persona gaps]

### 7. Limitations
[What could not be assessed, data source notes]
```

## 错误处理

| 错误 | 操作 |
|-------|--------|
| URL 抓取失败 | 报告错误，并建议检查 URL 的可访问性 |
| 未提供或未检测到关键词 | 要求用户提供目标关键词 |
| WebSearch 返回少于 5 个结果 | 使用现有数据继续，并注明样本有限 |
| SERP 没有自然搜索结果（全部为广告） | 注明该 SERP 具有高度商业属性，仅分析广告文案 |
| 目标页面由 JavaScript 渲染 | 注明限制，并使用可获取的 HTML 内容 |
| DataForSEO 成本超过阈值 | 回退到 WebSearch，并通知用户 |

## 质量检查清单

交付结果前，请验证：
- [ ] 目标 URL 已通过 `scripts/render_page.py --mode auto` 抓取（而非原始 curl/fetch）
- [ ] 页面类型分类使用参考资料中的分类体系
- [ ] 至少分析了 5 个 SERP 结果
- [ ] 用户故事引用具体的 SERP 信号作为证据
- [ ] 用户画像评分包含具体的改进建议
- [ ] SXO 评分已明确标注为独立于 SEO 健康评分
- [ ] 包含限制部分，且内容如实
- [ ] 在相关情况下包含跨 Skill 建议