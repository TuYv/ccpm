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
  version: "2.2.6"
  category: seo
---
# 搜索体验优化（SXO）

SXO 弥合了 SEO（Google 会奖励的内容）与 UX（用户需要的内容）之间的差距。  
传统 SEO 审核会检查技术健康度。SXO 会追问：“根据 Google 在 SERP 中实际奖励的内容，这个页面是否值得针对该关键词排名？”

## 核心洞察

一个页面的技术 SEO 得分可以达到 95/100，却仍然无法获得排名，因为它对于该关键词来说是**错误的页面类型**。如果 Google 针对你的关键词展示了 8 个产品页面和 2 个对比页面，那么你的博客文章永远无法突破，无论优化得多么完善。

## 命令

| 命令 | 用途 |
|---------|---------|
| `/seo sxo <url>` | 完整 SXO 分析（自动从页面中检测关键词） |
| `/seo sxo <url> <keyword>` | 针对指定关键词进行完整 SXO 分析 |
| `/seo sxo wireframe <url>` | 生成包含具体占位内容的 IST/SOLL 线框图 |
| `/seo sxo personas <url>` | 仅进行用户画像评分（跳过 SERP 分析） |

## 执行流程

### 第 1 步：获取目标

1. 通过 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run render_page.py <URL> --mode auto` 获取目标 URL（支持 SPA 且具备 SSRF 防护）
2. 使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run parse_html.py <URL>` 进行解析，以提取：标题、H1、元描述、标题层级、字数、结构化数据标记、CTA、媒体元素
3. 如果未提供关键词，则从 title 标签与 H1 的重叠内容中提取主要关键词
4. 在继续之前，验证关键词不为空

### 第 2 步：SERP 逆向分析

阅读 `references/page-type-taxonomy.md` 了解分类规则。

1. 在 Google 中搜索目标关键词（WebSearch）
2. 对排名前 10 的每个自然搜索结果记录：
   - URL 和域名权威度层级（品牌 / 细分领域权威 / 未知）
   - 页面类型（使用分类法进行分类）
   - 内容格式（长篇内容、列表文章、操作指南、对比、工具、视频）
   - 估算字数（根据摘要长度和页面结构）
   - 存在的结构化数据类型（基于当前支持的 SERP 特性；排除 FAQ/HowTo）
   - 媒体信号（视频轮播、图片包、缩略图存在情况）
3. 记录存在的 SERP 特性：
   - 精选摘要（段落 / 列表 / 表格 / 视频）
   - 其他用户也会问的问题（提取所有可见问题）
   - 广告（顶部和底部：统计数量并分析广告文案主题）
   - 相关搜索（提取全部内容）
   - 知识面板 / 本地搜索包 / 购物结果
   - AI Overview 的存在情况及来源类型
4. 计算 SERP 共识：
   - 主导页面类型（>60% = 强共识，40-60% = 混合，<40% = 碎片化）
   - 内容深度预期（平均字数层级）
   - 结构化数据预期（最常见的结构化数据类型）
   - 媒体预期（是否必须提供视频？图片是否关键？）

### 第 3 步：页面类型错配检测

这是 SXO 的核心洞察。将目标页面类型与 SERP 共识进行比较。

**错配严重程度：**

| 目标类型 | SERP 预期 | 严重程度 | 建议 |
|-------------|-------------|----------|----------------|
| 博客文章 | 产品页面 | 严重 | 创建专门的产品页面 |
| 博客文章 | 对比页面 | 高 | 重构为带矩阵的对比页面 |
| 产品页面 | 信息型内容 | 高 | 添加教育性内容层 |
| 落地页 | 工具/计算器 | 高 | 构建交互式工具组件 |
| 服务页面 | 本地搜索结果 | 中 | 添加位置相关信号和本地结构化数据 |
| 任意类型匹配 | - | 对齐 | 重点关注内容深度和 UX |

**分类规则：**
- 使用 `references/page-type-taxonomy.md` 对目标页面进行分类
- 使用相同的分类体系对每个 SERP 结果进行分类
- 如果目标类型与 SERP 主导类型不同，则标记为不匹配
- 如果 SERP 呈碎片化状态（没有主导类型），则指出差异化机会

### 第 4 步：用户故事推导

阅读 `references/user-story-framework.md` 获取完整框架。

根据 SERP 信号推导用户故事：

1. **PAA 问题**揭示知识缺口和顾虑
2. **广告文案主题**揭示商业触发因素和价值主张
3. **相关搜索**揭示搜索旅程（搜索之前/之后的内容）
4. **精选摘要格式**揭示预期的答案结构
5. **AI Overview** 揭示 Google 认定的权威答案

针对每个信号簇，生成一个用户故事：
```
As a [persona derived from signal],
I want to [goal derived from query intent],
because [emotional driver from ad copy / PAA tone],
but I'm blocked by [barrier derived from PAA questions / related searches].
```

生成 3-5 个用户故事，覆盖主要意图角度。

### 第 5 步：差距分析

从以下 7 个维度比较目标页面与 SERP 预期：

| 维度 | 对比内容 | 分数 |
|-----------|----------------|-------|
| 页面类型 | 目标类型与 SERP 主导类型 | 0-15 |
| 内容深度 | 字数、标题层级、主题覆盖范围 | 0-15 |
| UX 信号 | CTA 清晰度、首屏内容、移动端布局 | 0-15 |
| Schema 标记 | 是否具备预期的结构化数据类型 | 0-15 |
| 媒体丰富度 | 图片、视频、交互元素与 SERP 常态的对比 | 0-15 |
| 权威性信号 | E-E-A-T 标记、社会认同、资质证明 | 0-15 |
| 时效性 | 最后更新时间、日期信号、内容新近程度 | 0-10 |

**总计：0-100 SXO 差距评分**（越低 = 差距越大，越高 = 对齐度越好）

### 第 6 步：基于 Persona 的评分

阅读 `references/persona-scoring.md` 获取方法论。

1. 根据 SERP 意图信号推导 4-7 个 persona：
   - 按主题聚类 PAA 问题
   - 按目标受众细分广告文案
   - 将相关搜索映射到旅程阶段
2. 针对每个 persona，从 4 个维度对目标页面评分（每项 25 分）：
   - **相关性**：页面是否满足该 persona 的需求？
   - **清晰度**：该 persona 能否在 10 秒内找到答案？
   - **信任度**：是否具备满足该 persona 需求的充分信任信号？
   - **行动**：是否为该 persona 提供了明确的下一步？
3. 输出包含评分和具体改进建议的 persona 卡片
4. 按最弱 persona 优先排序建议（机会最大）

### 第 7 步：线框图生成（可选）

仅当调用 `/seo sxo wireframe` 时执行。

阅读 `references/wireframe-templates.md` 获取模板。

1. 根据解析后的页面结构生成 IST（当前状态）线框图
2. 根据以下内容生成 SOLL（目标状态）线框图：
   - SERP 共识页面类型
   - 差距分析结果
   - Persona 评分中的薄弱项
3. 使用极其具体的占位内容：
   - 不要： “在此处添加 CTA”
   - 要： “在 hero 区域下方添加带年度优惠徽章的定价 CTA，链接至 /pricing#enterprise”
4. 以带注释的语义化 HTML 区块大纲形式输出

## DataForSEO 集成

如果 DataForSEO MCP 工具可用：

1. **在任何 API 调用之前**，运行成本估算并向用户确认
2. 使用 `serp_organic_live_advanced` 获取精确的 SERP 数据（排名、特征、摘要）
3. 使用 `kw_data_google_ads_search_volume` 获取搜索量和竞争度指标
4. 如果 DataForSEO 不可用，则回退到 WebSearch，并在输出中注明精度有所降低

## SXO 分数与 SEO 健康分数

SXO 分数与主要的 SEO 健康分数**相互独立**。

- SEO 健康分数 = 技术合规性（可抓取性、速度、结构化数据等）
- SXO 差距分数 = 页面与 SERP 预期之间的一致性
- 页面可能达到 SEO 95 分 + SXO 30 分 = 技术上非常完善，但战略上不匹配
- 如果两项分数都可用，应同时报告

## 跨技能引用

| 发现 | 转交给 |
|---------|-------------|
| Persona 评分中的 E-E-A-T 差距 | `/seo content` 进行深入的 E-E-A-T 审计 |
| 缺失的结构化数据类型 | `/seo schema` 进行生成 |
| SERP 中检测到本地意图 | `/seo local` 进行 GBP 分析 |
| 内容深度差距 | `/seo page` 进行深入的页面分析 |
| 获取页面时发现技术问题 | `/seo technical` 进行完整审计 |
| 图片/媒体差距 | `/seo images` 进行优化 |

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
| URL 获取失败 | 报告错误，建议检查 URL 是否可访问 |
| 未提供或未检测到关键词 | 要求用户提供目标关键词 |
| WebSearch 返回少于 5 个结果 | 使用现有数据继续，并注明样本有限 |
| SERP 没有自然搜索结果（全部为广告） | 注明该 SERP 商业意图很强，仅分析广告文案 |
| 目标页面由 JavaScript 渲染 | 注明该限制，使用可用的 HTML 内容 |
| DataForSEO 成本超过阈值 | 回退到 WebSearch，并通知用户 |

## 质量检查清单

交付结果前，确认：
- [ ] 已通过 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run render_page.py <URL> --mode auto` 获取目标 URL（而非使用原始 curl/fetch）
- [ ] 页面类型分类使用参考文档中的分类体系
- [ ] 至少分析了 5 个 SERP 结果
- [ ] 用户故事引用了具体的 SERP 信号作为证据
- [ ] Persona 评分包含具体的改进建议
- [ ] SXO 分数明确标注为独立于 SEO 健康分数
- [ ] 存在限制部分，并且内容诚实
- [ ] 在相关情况下包含跨技能建议