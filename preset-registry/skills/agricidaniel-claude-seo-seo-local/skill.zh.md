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
  version: "2.2.5"
  category: seo
---
# 本地 SEO 分析（2026 年 3 月）

## 关键统计数据

| 指标 | 数值 | 来源 |
|--------|-------|--------|
| GBP 信号在本地结果包权重中的占比 | 32% | Whitespark 2026 |
| 距离因素在排名方差中的占比 | 55.2% | Search Atlas ML study |
| 评论信号占比（从 16% 上升） | ~20% | Whitespark 2026 |
| 旨在查找本地信息的 Google 搜索占比 | 46% | Industry data |
| 在 24 小时内促成到店访问的移动端“附近”搜索占比 | 76% | Google confirmed |
| 使用 ChatGPT/AI 获取本地推荐的比例 | 45%（从 6% 上升） | BrightLocal LCRS 2026 |
| ChatGPT 本地转化率 | 15.9% | Seer Interactive |
| Google 本地自然搜索转化率 | 1.76% | Seer Interactive |
| 本地结果包广告增长（2025 年 1 月至 2026 年 1 月） | 1% 至 22% | Sterling Sky |

---

## 企业类型检测

分析前根据页面信号进行检测。这将决定适用哪些检查。

### 实体门店
- 页面内容或页脚中显示实体街道地址
- 嵌入带有图钉/路线的 Google 地图
- “到店访问”、“位于”、“欢迎前来”
- LocalBusiness schema 中的结构化地址

### 服务区域型企业（SAB）
- 不显示实体地址
- 提及服务区域：“服务于 [城市/地区]”、“服务区域包括”
- “我们上门服务”、“现场服务”、“移动 [服务]”
- schema 中存在 `areaServed`，但没有 `address.streetAddress`

### 混合型
- 同时存在实体地址和服务区域相关表述
- “参观我们的展厅”与“我们还服务于 [地区]”同时出现

**对检查的影响**：SAB 跳过嵌入式地图验证和实体地址一致性检查。实体门店执行完整的 NAP + 地图检查。

---

## 行业垂直领域检测

根据页面信号和 GBP 类别模式进行检测。根据检测结果，转至 `../seo/references/local-schema-types.md` 中的行业特定检查。

| 垂直领域 | 检测信号 |
|----------|------------------|
| **餐饮** | /menu、菜单项、预订、菜系类型、餐饮点单、“堂食”、“外带” |
| **医疗保健** | 接受的保险、患者、预约、NPI、医学术语、“Dr.”、HIPAA 声明 |
| **法律** | 律师、法律顾问、执业领域、律师执业资格、案件结果、“免费咨询” |
| **家居服务** | 服务区域、紧急服务、“免费估价”、持有执照/已投保/有担保、“24/7” |
| **房地产** | 房源、MLS、待售/待租房产、经纪人简介、经纪公司、“开放参观” |
| **汽车** | 库存、VIN、试驾、经销商、服务部门、“新车/二手车/认证车” |

如果未检测到垂直领域，则使用通用的 `LocalBusiness` 分析路径。

---

## 分析维度

### 1. GBP 信号（25%）

主要类别是**最重要的单一本地结果包影响因素**（Whitespark 排名第 1，得分：193）。主要类别不正确是**排名第 1 的负面因素**（得分：176）。

**检查以下内容：**
- 页面上是否可检测到 GBP 嵌入内容或引用（Maps iframe、place ID、评论小组件）
- 主要类别是否恰当（根据页面内容与可见的 GBP 数据进行推断）
- 是否有次要类别的证据（BrightLocal 建议的最佳数量：额外 4 个）
- 是否存在 GBP 帖子（根据 WebFX，其不直接影响排名，但会触发帖子理由说明）
- 照片/视频证据（根据 Agency Jet，有照片可使路线请求增加 45%）
- 问答内容：检查 GBP 问答功能是否适用于该企业类别/地区；可用时优化问题和商家回答
- Google Verified 徽章资格（于 2025 年 10 月取代 Guaranteed/Screened）
- GBP 链接 URL 策略：不要链接到网站中表现最强的页面（Sterling Sky Diversity Update——可能会抑制自然搜索排名）
- 页面上是否显示营业时间（搜索时正在营业的企业排名更高，该因素排名第 5）

**评分指南：**
- 满分：存在 GBP 嵌入，类别信号一致，帖子保持活跃，包含照片
- 部分得分：存在一些 GBP 信号，但不完整
- 低分：网站上没有可见的 GBP 集成

### 2. 评论与声誉 (20%)

评论增长速度比评论总数更重要。**18 天规则**（Sterling Sky）：如果连续 3 周没有新评论，排名会断崖式下跌。

**检查以下内容：**
- 页面或 schema 中可见的 Google 评论总数（神奇阈值：10 条，Sterling Sky）
- 星级评分（31% 的消费者只选择 4.5 星以上的商家，68% 只选择 4 星以上的商家，BrightLocal 2026）
- 评论时效性指标（74% 的消费者只关心最近 3 个月内的评论）
- schema 中的 `aggregateRating`（ratingValue、reviewCount、bestRating）
- 第三方评论平台覆盖情况（消费者平均使用 6 个评论网站，BrightLocal 2026）
- 商家回复模式（88% 的消费者愿意选择会回复评论的商家，BrightLocal）
- 评论筛选检测：在将用户引导至评论平台之前，以任何方式预先筛选其满意度，均违反 Google 的虚假互动政策及 FTC 规定（每次违规罚款 $53,088）

**行业特定注意事项：**
- 医疗保健：HIPAA 禁止在回复中确认或否认评论者是否为患者
- 法律：回复评论时需考虑律师与客户之间的保密特权

**评分指南：**
- 满分：10 条以上评论、4.5 星以上、近期有活动、商家有回复、覆盖多个平台
- 部分得分：有一些评论，但在时效性、评分或回复率方面存在不足
- 低分：评论少于 10 条、近期无活动、无回复、仅覆盖单一平台

### 3. 本地页面 SEO (20%)

独立服务页面是**本地自然搜索的首要因素，也是 AI 可见度的第二大因素**（Whitespark 2026）。

**检查以下内容：**
- title 标签包含城市/服务关键词
- H1 标签具有本地意图（城市 + 服务）
- 页面 HTML 中可见 NAP（名称、地址、电话）（页脚、联系信息部分、页眉）
- 独立服务页面（每项核心服务对应一个页面）
- 多地点网站的地点页面质量：
  - 至少有 **>60-70% 的独特内容**（行业共识，Google 未确认具体阈值）
  - **替换测试**：如果替换城市名称后，内容仍然合理，那么这就是门页（RicketyRoo 方法）。某暖通空调公司因采用这种模式，在 2024 年 3 月核心更新后排名下降 80%，流量下降 63%
  - 本地照片、特定区域的客户评价、本地常见问题
- 嵌入 Google 地图（增强地理位置信号，并非直接排名因素——使用延迟加载以减轻对速度的影响）
- 点击拨号按钮（`tel:` 链接）以及首屏内的联系表单
- 内部链接架构：中心辐射式结构，每个关键页面距首页不超过 3 次点击
- 每 1,000 字包含 2-5 个上下文相关的内部链接，并使用描述性锚文本

**多地点网站特定要求：**
- 门店定位器包含各地点独立且可抓取的 URL（优先使用 SSR/SSG，而非 CSR）
- 子目录结构：`domain.com/locations/city-name/`（子目录能够更好地集中链接权重，Bruce Clay：流量提升 50% 以上）
- 每个地点页面均包含独特的 LocalBusiness schema 和 `@id`

**评分指南：**
- 满分：title 和 H1 中包含城市，NAP 可见，具备独立服务页面，不存在门页模式，内部链接良好
- 部分得分：存在一些本地信号，但缺少服务页面或存在门页风险
- 低分：title/H1 内容泛化、NAP 不可见、地点页面内容单薄

### 4. NAP 一致性与引用（15%）

传统地图包排名中的引用数量正在下降，但 **AI 可见性的前 5 个因素中有 3 个与引用相关**（Whitespark 2026）。Google 2025 年 7 月的文档更新从显著性定义中移除了“目录”。

**检查以下内容：**
- NAP 提取：比较以下来源中的名称、地址和电话：
  1. 页面可见 HTML（页脚、联系页面）
  2. LocalBusiness JSON-LD schema
  3. 任何可见的 GBP 数据
  - 标记这三个来源之间的任何差异
- Tier 1 目录中的引用存在情况（通过 WebFetch 或 `site:` 搜索模式检查）：
  - 页面上的 Google Business Profile 信号
  - Yelp：`site:yelp.com "Business Name"`
  - BBB：`site:bbb.org "Business Name"`
  - Facebook 商家页面引用
- **了解 Apple Maps / Apple 商家列表**：认领并维护 Apple 列表；将 Apple Business 统一平台发布/更名的说法视为 TechRadar 来源的信息，并在断言之前与 Apple 官方来源进行核实。
- 了解 Bing Places（为 ChatGPT、Copilot、Alexa 提供支持——建议认领并优化）
- 特定行业的目录建议：加载 `../seo/references/local-schema-types.md`，获取各垂直行业的引用来源
- 了解数据聚合商：Data Axle、Foursquare、Neustar/TransUnion（建议提交，以便下游分发）

**评分指南：**
- 完整：页面/schema 中的 NAP 一致，检测到 Tier 1 引用，并且存在行业目录
- 部分：存在 NAP，但有不一致之处，部分引用缺失
- 低：NAP 存在差异，未检测到引用，没有 schema 地址

### 5. 本地 Schema 标记（10%）

Schema **不是直接的排名因素**（John Mueller 已确认）。但它能够启用富媒体搜索结果（点击率提升 43%，Webstix 案例研究），并帮助 AI 系统解析商家信息。

**检查以下内容：**
- 是否存在 LocalBusiness schema（提取 JSON-LD 区块）
- 必需属性：`name`、带有 PostalAddress 子属性的 `address`
- 推荐属性：`geo`（至少 5 位小数，已确认）、`openingHoursSpecification`、`telephone`、`url`、`priceRange`（<100 个字符）、`image`、`aggregateRating`
- **适用于行业的正确子类型** —— 加载 `../seo/references/local-schema-types.md`：
  - 餐厅使用 `Restaurant`，而不是通用的 `LocalBusiness`
  - 法律行业使用 `LegalService`，而不是已弃用的 `Attorney`
  - 汽车经销商使用 `AutoDealer`，而不是已弃用的 `VehicleListing`
  - 医疗行业使用 `MedicalClinic`/`Hospital`/`Dentist`，而不是通用的 `MedicalBusiness`
- SAB 特定要求：使用包含命名城市的 `areaServed`（推荐；不在 Google 的官方列表中，但受 Schema.org 支持）
- 多地点：每个地点页面都有自己的 LocalBusiness，并具有唯一的 `@id`；通过 `branchOf` 将其链接到首页上的 Organization
- 特定行业的 schema 模式（依据 `../seo/references/local-schema-types.md`）：
  - 餐厅：Menu + MenuSection + MenuItem + ReserveAction（注意：Reservation/Order 操作不是 Google 支持的富媒体搜索结果；其价值在于提供机器可读的商家数据）
  - 医疗：Physician (Person) + MedicalSpecialty + 与 NPI 对应的 sameAs
  - 法律：LegalService + Person + Service（业务领域）
  - 家庭服务：子类型 + areaServed + Service
  - 房地产：RealEstateAgent + Person + RealEstateListing
  - 汽车行业：AutoDealer + Car + Offer（单独的部门 schema）

**评分指南：**
- 完整：子类型正确，包含所有推荐属性、行业特定模式，并且 `JSON-LD` 有效
- 部分：存在 `LocalBusiness`，但类型过于通用，或缺少推荐属性
- 低：没有本地架构，或架构中存在错误/占位内容

### 6. 本地链接与权威性信号（10%）

本地搜索包中的链接作用正在下降，但仍占**约 26% 的本地自然搜索排名影响因素**（Whitespark 2026，第 2 大因素组）。“最佳榜单”收录是**AI 可见度排名第 1 的引用因素**。

**检查以下内容：**
- 页面中可检测到的本地反向链接指标：
  - 商会提及或链接（高 Trust Flow、消费者访问量约增加 80%，GlueUp）
  - BBB 认证/徽章（Google 使用 BBB 验证企业）
  - 本地新闻/媒体报道
  - 社区参与信号（赞助、当地活动、合作伙伴关系）
- 是否出现在“最佳榜单”中（根据 Whitespark 2026，这是 AI 可见度的首要因素）
- 数字公关信号：目前 66.2% 的公关从业者已将 AI 引用作为 KPI 进行跟踪（BuzzStream 2026）
- 品牌提及与 AI 可见度的相关性比传统反向链接高 **3 倍**（Ahrefs：相关系数分别为 0.664 与 0.218）
- 链接增长速度基准：小型企业每月 5–10 个高质量本地链接（行业共识）

**评分指南：**
- 完整：可见本地权威性信号（商会、BBB、媒体报道），并且能看出社区参与
- 部分：存在一些权威性信号，但本地链接指标有限
- 低：未检测到本地权威性信号

---

## AI 搜索对本地业务的影响

**不要重复 seo-geo 分析。**提供本地特定的 AI 背景信息，并建议运行 `/seo geo <url>` 以获取完整分析。

本地 AI 的关键事实：
- AI 概览可能出现在最多 68% 的本地搜索中（Whitespark 2025 年第二季度）
- ChatGPT 的转化率为 15.9%，而 Google 自然搜索为 1.76%（Seer Interactive）
- AI 可见度排名前 5 的因素中，有 3 个与引用相关（Whitespark 2026）
- ChatGPT **不会直接访问 GBP**——其信息来源包括 Bing 索引、Yelp、TripAdvisor、BBB、Reddit
- Bing Places 至关重要：它为 ChatGPT、Copilot 和 Alexa 提供支持
- 第三方观察到的本地 AI 界面变化（美国移动端）可能只展示 1–2 家企业，展示数量减少 32%（Sterling Sky）

**建议**：运行 `/seo geo <url>`，进行全面的 AI 搜索可见度分析，包括可引用性评分、`llms.txt` 检查和品牌提及审计。

---

## 参考文件

根据需要按需加载：
- `../seo/references/local-seo-signals.md`：排名因素、评论基准、引用层级、GBP 功能状态、算法更新
- `../seo/references/local-schema-types.md`：按行业划分的 `LocalBusiness` 子类型、架构模式、各垂直领域的引用来源

---

## 输出

生成 `LOCAL-SEO-ANALYSIS-{domain}.md`，内容包括：

1. **本地 SEO 得分：XX/100**，以及维度 breakdown 表格
2. **业务类型**：实体店 / SAB / 混合型
3. **检测到的行业垂直领域** + 行业特定发现
4. **GBP 优化检查清单**（已检测信号与缺失项）
5. **评论健康状况快照**（评分、数量、增长速度指标、回复模式）
6. **NAP 一致性审计**（页面与架构之间的差异、跨来源对比）
7. **引用存在性检查**（Tier 1 目录状态）
8. **本地架构状态**（存在/缺失/格式错误 + 可直接使用的修复方案）
9. **位置页面质量**（如果是多地点：独特内容占比、门页风险、门店定位器）
10. **按优先级排序的前 10 项行动**（严重 > 高 > 中 > 低）
11. **局限性免责声明**：说明本分析无法评估的内容（地理网格排名、Domain Authority、全面反向链接、GBP Insights 数据、实时本地搜索包位置），以及哪些付费工具可以弥补这些空白

---

## 快速见效项

1. 认领并优化 Apple Maps / Apple business listings；任何关于 Apple Business 上线/更名的说法，首先应通过 Apple 官方一手信息进行核实
2. 认领并优化 Bing Places（为 ChatGPT、Copilot、Alexa 提供数据支持）
3. 修复页面、schema 和 GBP 之间的任何 NAP 差异
4. 添加包含正确行业子类型的 LocalBusiness schema
5. 添加精度达到 5 位以上小数的 `geo` 坐标
6. 确保电话号码使用 `tel:` 链接，以支持点击拨号
7. 在 title tag 和 H1 中添加城市 + 服务关键词

## 中等工作量

1. 为每项核心服务创建专属页面（Whitespark：本地自然搜索排名第一因素）
2. 制定评价获取策略，保持至少每 18 天一次的频率
3. 提交至三个数据聚合商（Data Axle、Foursquare、Neustar/TransUnion），以便向下游分发
4. 认领特定行业的目录列表（根据各垂直行业的建议）
5. 添加特定行业的 schema 模式（餐厅使用 Menu，医疗保健使用 Physician 等）
6. 为服务页面/位置页面实施中心辐射式内部链接

## 高影响力项目

1. 制定本地数字公关策略，争取进入“最佳”榜单（AI 可见性的第一因素）
2. 为每个位置页面开发独特且不可互换的内容（独特内容超过 60%）
3. 在 ChatGPT 获取信息的平台上建立存在感（Yelp、TripAdvisor、BBB、Reddit）
4. 争取加入 Chamber of Commerce 和 BBB（权威性 + 验证信号）
5. 创建社区参与相关内容（赞助、本地活动、合作伙伴关系）

---

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `business_data_business_listings_search` 获取实时 GBP/商家列表数据并对各目录进行引文审计，同时使用 `serp_organic_live_advanced` 获取实时本地包排名。

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 故障、连接被拒绝） | 清楚地报告错误。不要猜测网站内容。建议用户验证 URL 后重试。 |
| 页面上未检测到本地信号 | 报告未发现本地商家指标。建议用户确认这是否为本地商家，并在可用时提供 GBP 列表 URL。 |
| 页面 HTML 中未找到 NAP | 检查 schema 和 meta 标签。如果仍然缺失，则标记为 Critical issue。建议在页脚和联系页面添加可见的 NAP。 |
| 行业垂直领域不明确 | 列出检测到的前两个垂直领域及其支持信号。在应用特定行业建议之前，请用户确认。 |
| 拥有 50 个以上位置页面的多地点网站 | 应用 seo orchestrator 中的质量门槛：30 个以上页面时发出 WARNING（强制要求 60% 以上的独特内容），50 个以上页面时执行 HARD STOP（继续之前必须要求用户说明理由）。 |

## FLOW 框架集成

对于提示词引导的本地优化，请使用 `/seo flow local <url>`；FLOW 的 11 个本地阶段提示词涵盖 GBP 优化、元描述、title tag 和结构化本地审计工作流。