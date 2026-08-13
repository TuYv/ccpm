---
name: seo-local
description: >
  Local SEO analysis covering Google Business Profile optimization, NAP
  consistency, citation health, review signals, local schema markup,
  location page quality, multi-location SEO, and industry-specific
  recommendations. Detects business type (brick-and-mortar, SAB, hybrid)
  and industry vertical. Use when user says "local SEO", "Google Business
  Profile", "GBP", "map pack", "local pack", "citations", "NAP
  consistency", "service area", or "multi-location".
user-invocable: true
argument-hint: "[url]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.4"
  category: seo
---
# 本地 SEO 分析（2026 年 3 月）

## 关键统计数据

| 指标 | 数值 | 来源 |
|--------|-------|--------|
| GBP 信号在本地结果包权重中的占比 | 32% | Whitespark 2026 |
| 距离因素在排名方差中的占比 | 55.2% | Search Atlas 机器学习研究 |
| 评论信号占比（从 16% 上升） | ~20% | Whitespark 2026 |
| 寻找本地信息的 Google 搜索占比 | 46% | 行业数据 |
| 在 24 小时内促成到店的移动端“附近”搜索占比 | 76% | Google 已确认 |
| 使用 ChatGPT/AI 获取本地推荐的比例 | 45%（从 6% 上升） | BrightLocal LCRS 2026 |
| ChatGPT 本地转化率 | 15.9% | Seer Interactive |
| Google 本地自然搜索转化率 | 1.76% | Seer Interactive |
| 本地结果包广告增长（2025 年 1 月至 2026 年 1 月） | 1% 至 22% | Sterling Sky |

---

## 商家类型检测

在分析前根据页面信号进行检测。这将决定适用哪些检查项。

### 实体门店
- 页面内容或页脚中显示实体街道地址
- 嵌入带有地点标记/路线的 Google 地图
- “到店访问我们”“位于”“欢迎前来”
- LocalBusiness schema 中的结构化地址

### 服务区域型商家（SAB）
- 不显示实体地址
- 提及服务区域：“服务于[城市/地区]”“服务区域包括”
- “我们上门服务”“现场服务”“移动[服务]”
- schema 中包含 `areaServed`，但不包含 `address.streetAddress`

### 混合型
- 同时包含实体地址和服务区域相关表述
- “参观我们的展厅”与“我们还服务于[区域]”同时出现

**对检查项的影响**：SAB 跳过嵌入式地图验证和实体地址一致性检查。实体门店需接受完整的 NAP + 地图检查。

---

## 行业垂直领域检测

根据页面信号和 GBP 类别模式进行检测。根据检测结果转至 `../seo/references/local-schema-types.md` 中针对特定行业的检查项。

| 垂直领域 | 检测信号 |
|----------|------------------|
| **餐饮** | /menu、菜单项、预订、菜系类型、餐饮订购、“堂食”、“外带” |
| **医疗保健** | 接受的保险、患者、预约、NPI、医疗术语、“Dr.”、HIPAA 声明 |
| **法律** | 律师、法律执业者、业务领域、律师执业资格、案件结果、“免费咨询” |
| **家居服务** | 服务区域、紧急服务、“免费估价”、持证/已投保/已担保、“全天候服务” |
| **房地产** | 房源、MLS、出售/出租物业、经纪人简介、经纪公司、“开放参观” |
| **汽车** | 库存、VIN、试驾、经销商、服务部门、“新车/二手车/认证车” |

如果未检测到垂直领域，则使用通用 `LocalBusiness` 分析路径。

---

## 分析维度

### 1. GBP 信号（25%）

主要类别是**最重要的单一本地结果包因素**（Whitespark 排名第 1，得分：193）。主要类别不正确是**排名第 1 的负面因素**（得分：176）。

**检查以下内容：**
- 页面上是否可检测到 GBP 嵌入内容或引用（地图 iframe、地点 ID、评论小组件）
- 主要类别是否恰当（根据页面内容与可见的 GBP 数据进行推断）
- 是否存在辅助类别的证据（根据 BrightLocal，最优数量为额外 4 个）
- 是否存在 GBP 帖子（根据 WebFX，其不会直接影响排名，但会触发帖子理由说明）
- 照片/视频证据（根据 Agency Jet，包含照片可使路线请求增加 45%）
- 问答内容：检查 GBP 问答是否适用于该商家的类别/地区；如果可用，则优化问题和商家回答
- Google Verified 徽章资格（于 2025 年 10 月取代 Guaranteed/Screened）
- GBP 链接 URL 策略：不要链接到网站上表现最强的页面（Sterling Sky Diversity Update——可能会抑制自然搜索排名）
- 页面上的营业时间可见性（搜索时处于营业状态的商家排名更高，该因素排名第 5）

**评分指南：**
- 满分：存在 GBP 嵌入，类别信号一致，帖子保持活跃，且有照片
- 部分得分：存在部分 GBP 信号，但不完整
- 低分：网站上没有可见的 GBP 集成

### 2. 评价与声誉（20%）

评价增长速度比评价总数更重要。**18 天规则**（Sterling Sky）：如果连续 3 周没有新评价，排名会断崖式下跌。

**检查以下内容：**
- 页面或 Schema 中是否显示 Google 评价总数（关键阈值：10 条，Sterling Sky）
- 星级评分（31% 的消费者只选择 4.5 星及以上的商家，68% 只选择 4 星及以上的商家，BrightLocal 2026）
- 评价新近度指标（74% 的消费者只关注最近 3 个月内的评价）
- Schema 中的 `aggregateRating`（ratingValue、reviewCount、bestRating）
- 第三方评价平台覆盖情况（消费者平均使用 6 个评价网站，BrightLocal 2026）
- 商家回复模式（88% 的消费者愿意选择会回复评价的商家，BrightLocal）
- 评价筛选检测：在将用户引导至评价平台之前，以任何方式预先筛选满意度，均违反 Google 的虚假互动政策和 FTC 规定（每次违规罚款 53,088 美元）

**行业特定要求：**
- 医疗保健：HIPAA 禁止在回复中确认或否认评价者是否为患者
- 法律：回复评价时需考虑律师—客户保密特权

**评分指南：**
- 满分：10 条以上评价、4.5 星以上、近期有活动、商家有回复、覆盖多个平台
- 部分得分：有一些评价，但在新近度、评分或回复率方面存在不足
- 低分：少于 10 条评价、近期无活动、无回复、仅覆盖单一平台

### 3. 本地页面 SEO（20%）

专门的服务页面是**本地自然搜索排名的第 1 大因素，也是 AI 可见性的第 2 大因素**（Whitespark 2026）。

**检查以下内容：**
- Title 标签包含城市/服务关键词
- H1 标签具有本地意图（城市 + 服务）
- 页面 HTML 中可见 NAP（名称、地址、电话号码）（页脚、联系区域、页眉）
- 专门的服务页面（每项核心服务对应一个页面）
- 多地点网站的位置页面质量：
  - 至少有 **>60-70% 的独特内容**（行业共识，Google 未确认具体阈值）
  - **替换测试**：如果替换城市名称后内容仍然成立，则该页面属于门页（RicketyRoo 方法）。一家 HVAC 公司因采用这种模式，在 2024 年 3 月核心更新后排名下降 80%，流量下降 63%
  - 本地照片、特定地区的客户评价、本地 FAQ
- 嵌入式 Google 地图（增强地理信号，并非直接排名因素——应使用延迟加载以减轻对速度的影响）
- 一键拨号按钮（`tel:` 链接）以及首屏内的联系表单
- 内部链接架构：中心辐射式结构，每个关键页面距离首页不超过 3 次点击
- 每 1,000 字包含 2-5 个上下文内部链接，并使用描述性锚文本

**多地点网站特定要求：**
- 门店查找器应提供可单独抓取的 URL（SSR/SSG 优于 CSR）
- 子目录结构：`domain.com/locations/city-name/`（子目录能更好地整合链接权重，Bruce Clay：流量提升 50% 以上）
- 每个位置页面都有包含 `@id` 的独特 LocalBusiness Schema

**评分指南：**
- 满分：Title + H1 中包含城市，NAP 可见，有专门的服务页面，不存在门页模式，内部链接良好
- 部分得分：存在一些本地信号，但缺少服务页面或存在门页风险
- 低分：Title/H1 过于宽泛，NAP 不可见，位置页面内容单薄

### 4. NAP 一致性与引文（15%）

引文对传统地图包排名的影响正在下降，但 **AI 可见性的前 5 大因素中有 3 个与引文相关**（Whitespark 2026）。Google 在 2025 年 7 月更新文档时，从知名度定义中移除了“目录”。

**检查以下内容：**
- NAP 提取：比较以下来源中的名称、地址和电话号码：
  1. 页面可见 HTML（页脚、联系页面）
  2. LocalBusiness JSON-LD 架构
  3. 任何可见的 GBP 数据
  - 标记这三个来源之间的所有差异
- 一级目录中的引文情况（通过 WebFetch 或 site: 搜索模式检查）：
  - 页面上的 Google 商家资料信号
  - Yelp：`site:yelp.com "Business Name"`
  - BBB：`site:bbb.org "Business Name"`
  - Facebook 商家页面引用
- **Apple 地图 / Apple 商家列表**意识：认领并维护 Apple 商家列表；对于 Apple Business 统一平台上线/更名的说法，应视为源自 TechRadar，并在断言前依据 Apple 一手资料进行核实。
- Bing Places 意识（为 ChatGPT、Copilot、Alexa 提供支持——建议认领并优化）
- 特定行业的目录建议：加载 `../seo/references/local-schema-types.md` 以获取各垂直行业的引文来源
- 数据聚合商意识：Data Axle、Foursquare、Neustar/TransUnion（建议提交，以便向下游分发）

**评分指南：**
- 满分：页面/架构中的 NAP 一致，检测到一级目录引文，并存在行业目录
- 部分得分：存在 NAP 但不一致，缺少部分引文
- 低分：NAP 存在差异，未检测到引文，且无架构地址

### 5. 本地架构标记（10%）

架构并非直接排名因素（John Mueller 已确认）。但它可以启用富媒体搜索结果（点击率提升 43%，Webstix 案例研究），并帮助 AI 系统解析商家信息。

**检查以下内容：**
- 是否存在 LocalBusiness 架构（提取 JSON-LD 块）
- 必需属性：`name`、`address`，且后者包含 PostalAddress 子属性
- 推荐属性：`geo`（至少保留 5 位小数，已确认）、`openingHoursSpecification`、`telephone`、`url`、`priceRange`（少于 100 个字符）、`image`、`aggregateRating`
- **行业子类型是否正确**——加载 `../seo/references/local-schema-types.md`：
  - 餐厅使用 `Restaurant`，而不是通用的 `LocalBusiness`
  - 法律行业使用 `LegalService`，而不是已弃用的 `Attorney`
  - 汽车经销商使用 `AutoDealer`，而不是已弃用的 `VehicleListing`
  - 医疗保健行业使用 `MedicalClinic`/`Hospital`/`Dentist`，而不是通用的 `MedicalBusiness`
- SAB 特定要求：使用包含具名城市的 `areaServed`（推荐使用；不在 Google 官方列表中，但受 Schema.org 支持）
- 多地点：每个地点页面都有自己的 LocalBusiness 和唯一的 `@id`，并通过 `branchOf` 链接到首页上的 Organization
- 特定行业的架构模式（依据 `../seo/references/local-schema-types.md`）：
  - 餐厅：Menu + MenuSection + MenuItem + ReserveAction（注意：Reservation/Order 操作不是 Google 支持的富媒体搜索结果；其价值在于提供机器可读的商家数据）
  - 医疗保健：Physician（Person）+ MedicalSpecialty + 指向 NPI 的 sameAs
  - 法律：LegalService + Person + Service（执业领域）
  - 家庭服务：子类型 + areaServed + Service
  - 房地产：RealEstateAgent + Person + RealEstateListing
  - 汽车：AutoDealer + Car + Offer（各部门使用独立架构）

**评分指南：**
- 满分：子类型正确，包含所有推荐属性，采用行业特定模式，JSON-LD 有效
- 部分得分：存在 LocalBusiness，但类型过于通用或缺少推荐属性
- 低分：没有本地商家架构，或架构存在错误/占位内容

### 6. 本地链接与权威性信号（10%）

链接对本地搜索结果包排名的影响正在下降，但仍占**本地自然搜索排名因素的约 26%**（Whitespark 2026，排名因素组第 2 位）。“最佳”榜单入选情况是 **AI 可见性引用因素第 1 位**。

**检查以下内容：**
- 可从页面检测到的本地反向链接指标：
  - 商会提及或链接（Trust Flow 较高，可带来约 80% 的消费者访问量增长，GlueUp）
  - BBB 认证/徽章（Google 使用 BBB 验证商家）
  - 本地新闻/媒体报道
  - 社区参与信号（赞助、本地活动、合作关系）
- 是否入选“最佳”榜单（根据 Whitespark 2026，这是最重要的 AI 可见性因素）
- 数字公关信号：目前 66.2% 的公关从业者将 AI 引用作为 KPI 进行跟踪（BuzzStream 2026）
- 品牌提及与 AI 可见性的相关性比传统反向链接**强 3 倍**（Ahrefs：相关系数 0.664 对 0.218）
- 链接增长速度基准：小型企业每月获得 5-10 个高质量本地链接（行业共识）

**评分指南：**
- 满分：可见本地权威性信号（商会、BBB、媒体报道），且有明显的社区参与
- 部分得分：存在一些权威性信号，但本地链接指标有限
- 低分：未检测到本地权威性信号

---

## AI 搜索对本地搜索的影响

**不要重复 seo-geo 分析。** 提供本地特定的 AI 背景信息，并建议运行 `/seo geo <url>` 进行完整分析。

关键的本地 AI 数据：
- AI Overviews 出现在多达 68% 的本地搜索中（Whitespark 2025 年第 2 季度）
- ChatGPT 的转化率为 15.9%，而 Google 自然搜索的转化率为 1.76%（Seer Interactive）
- AI 可见性排名前 5 的因素中，有 3 个与引用相关（Whitespark 2026）
- ChatGPT 不会直接访问 GBP，而是从 Bing 索引、Yelp、TripAdvisor、BBB、Reddit 获取信息
- Bing Places 至关重要：为 ChatGPT、Copilot、Alexa 提供支持
- 第三方观察到的本地 AI 界面变化（美国移动端）可能只显示 1-2 家商家，显示数量减少 32%（Sterling Sky）

**建议**：运行 `/seo geo <url>`，对 AI 搜索可见性进行全面分析，包括可引用性评分、llms.txt 检查和品牌提及审计。

---

## 参考文件

根据需要按需加载：
- `../seo/references/local-seo-signals.md`：排名因素、评论基准、引用层级、GBP 功能状态、算法更新
- `../seo/references/local-schema-types.md`：按行业划分的 LocalBusiness 子类型、架构模式、各垂直行业的引用来源

---

## 输出

生成 `LOCAL-SEO-ANALYSIS-{domain}.md`，其中包含：

1. **本地 SEO 评分：XX/100**，并附各维度明细表
2. **商家类型**：实体门店 / SAB / 混合型
3. **检测到的垂直行业** + 行业特定发现
4. **GBP 优化检查清单**（检测到的信号与缺失项）
5. **评论健康状况概览**（评分、数量、增长速度指标、回复模式）
6. **NAP 一致性审计**（页面与架构之间的差异、跨来源比较）
7. **引用存在情况检查**（第 1 层级目录状态）
8. **本地架构状态**（存在/缺失/格式错误 + 可直接使用的修复方案）
9. **地点页面质量**（如果有多个地点：独特内容比例、门页风险、门店查找器）
10. **优先级最高的 10 项行动**（严重 > 高 > 中 > 低）
11. **局限性免责声明**：本分析无法评估的内容（地理网格排名、Domain Authority、完整的反向链接、GBP Insights 数据、实时本地搜索结果包位置），以及哪些付费工具可以弥补这些不足

---

## 快速见效项

1. 认领并优化 Apple Maps / Apple 商家信息；任何有关 Apple Business 发布或更名的说法，都应先通过 Apple 官方一手信息核实
2. 认领并优化 Bing Places（为 ChatGPT、Copilot、Alexa 提供支持）
3. 修复页面、结构化数据和 GBP 之间所有不一致的 NAP 信息
4. 添加 LocalBusiness 结构化数据，并使用正确的行业子类型
5. 添加 `geo` 坐标，精度至少为小数点后 5 位
6. 确保电话号码使用 `tel:` 链接，以支持点击拨号
7. 在标题标签和 H1 中添加城市名 + 服务关键词

## 中等工作量

1. 为每项核心服务创建专属页面（Whitespark：本地自然搜索排名第一的影响因素）
2. 制定评论获取策略，保持至少每 18 天新增一条评论的频率
3. 向三个数据聚合商（Data Axle、Foursquare、Neustar/TransUnion）提交信息，以便向下游分发
4. 认领行业专属目录中的商家信息（依据各垂直行业的建议）
5. 添加行业专属的结构化数据模式（例如餐厅使用 Menu，医疗保健机构使用 Physician 等）
6. 为服务/位置页面实施中心辐射式内部链接结构

## 高影响力事项

1. 制定以“最佳”榜单为目标的本地数字公关策略（AI 可见度的首要影响因素）
2. 为每个位置页面开发独特且不可互换的内容（独特内容占比 >60%）
3. 在 ChatGPT 引用的信息源平台上建立影响力（Yelp、TripAdvisor、BBB、Reddit）
4. 争取加入商会和 BBB（权威性 + 验证信号）
5. 创建社区参与内容（赞助、本地活动、合作伙伴关系）

---

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `business_data_business_listings_search` 实时提取 GBP/商家信息数据，并审查各目录中的引用信息；使用 `serp_organic_live_advanced` 获取实时本地搜索结果包排名。

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 失败、连接被拒绝） | 清楚地报告错误。不要猜测网站内容。建议用户核实 URL 后重试。 |
| 页面上未检测到本地信号 | 报告未发现本地商家指标。建议用户确认这是否为本地商家，并在可用时提供 GBP 商家信息 URL。 |
| 页面 HTML 中未找到 NAP | 检查结构化数据和元标签。如果仍然不存在，则标记为严重问题。建议在页脚和联系页面中添加可见的 NAP 信息。 |
| 垂直行业不明确 | 提供检测到的前两个垂直行业及相应的支持信号。在应用行业专属建议之前，请用户确认。 |
| 多位置业务拥有 50 个以上的位置页面 | 应用 seo 编排器中的质量门槛：达到 30 个以上页面时发出 WARNING（强制要求独特内容占比达到 60% 以上）；达到 50 个以上页面时执行 HARD STOP（要求用户提供合理理由后方可继续）。 |

## FLOW 框架集成

对于提示引导式本地优化，请使用 `/seo flow local <url>`，FLOW 的 11 个本地优化阶段提示涵盖 GBP 优化、元描述、标题标签和结构化本地审查工作流。