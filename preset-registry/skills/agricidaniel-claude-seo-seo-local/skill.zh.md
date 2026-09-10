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
  version: "2.3.1"
  category: seo
---
# 本地 SEO 分析（2026 年 3 月）

## 关键统计数据

| 指标 | 数值 | 来源 |
|--------|-------|--------|
| GBP 信号在本地包权重中的占比 | 32% | Whitespark 2026 |
| 距离在排名方差中的占比 | 55.2% | Search Atlas ML study |
| 评价信号占比（从 16% 上升） | ~20% | Whitespark 2026 |
| 寻找本地信息的 Google 搜索占比 | 46% | Industry data |
| 移动端 "near me" 搜索在 24 小时内带来访问的比例 | 76% | Google confirmed |
| ChatGPT/AI 用于本地推荐的使用率 | 45%（从 6% 上升） | BrightLocal LCRS 2026 |
| ChatGPT 本地转化率 | 15.9% | Seer Interactive |
| Google 自然本地转化率 | 1.76% | Seer Interactive |
| 本地包广告增长（2025 年 1 月至 2026 年 1 月） | 1% 到 22% | Sterling Sky |

---

## 业务类型检测

在分析前根据页面信号进行检测。这决定适用哪些检查。

### 实体门店
- 页面内容或页脚中可见实体街道地址
- 带有图钉/路线的 Google Maps 嵌入
- "Visit us at"、"Located at"、"Come see us"
- LocalBusiness schema 中的结构化地址

### 服务区域业务（SAB）
- 没有可见的实体地址
- 服务区域提及："serving [city/region]"、"service area includes"
- "We come to you"、"On-site service"、"Mobile [service]"
- schema 中有 `areaServed`，但没有 `address.streetAddress`

### 混合型
- 同时存在实体地址和服务区域语言
- "Visit our showroom" 与 "We also serve [areas]" 结合出现

**对检查的影响**：SAB 跳过嵌入地图验证和实体地址一致性检查。实体门店执行完整的 NAP + 地图检查。

---

## 行业垂直领域检测

根据页面信号和 GBP 类别模式进行检测。路由到 `../seo/references/local-schema-types.md` 中的行业特定检查。

| 垂直领域 | 检测信号 |
|----------|------------------|
| **餐厅** | /menu、菜单项、预订、菜系类型、食品订购、"dine-in"、"takeout" |
| **医疗保健** | 接受的保险、患者、预约、NPI、医疗术语、"Dr."、HIPAA notice |
| **法律** | attorney、lawyer、执业领域、律师资格、案件结果、"free consultation" |
| **家政/上门服务** | 服务区域、紧急服务、"free estimate"、licensed/insured/bonded、"24/7" |
| **房地产** | 房源、MLS、待售/出租物业、经纪人简介、经纪公司、"open house" |
| **汽车** | 库存、VIN、试驾、经销商、服务部门、"new/used/certified" |

如果未检测到垂直领域，则使用通用 `LocalBusiness` 分析路径。

---

## 分析维度

### 1. GBP 信号（25%）

主类别是**最重要的单一本地包因素**（Whitespark #1，分数：193）。主类别不正确是**#1 负面因素**（分数：176）。

**检查内容：**
- 页面上可检测到 GBP 嵌入或引用（Maps iframe、place ID、评价小组件）
- 主类别适当性（根据页面内容与可见 GBP 数据推断）
- 次要类别证据（最佳：根据 BrightLocal，额外 4 个）
- GBP posts 存在（根据 WebFX，无直接排名影响，但会触发 Post Justifications）
- 照片/视频证据（有照片可多获得 45% 的路线请求，Agency Jet）
- Q&A 内容：检查 GBP Q&A 是否适用于该业务类别/地区；可用时优化问题和业主回答
- Google Verified badge 资格（于 2025 年 10 月替代 Guaranteed/Screened）
- GBP 链接 URL 策略：不要链接到最强的网站页面（Sterling Sky Diversity Update -- 有抑制自然排名的风险）
- 页面上可见营业时间（搜索时处于营业状态的商家排名更高，因素 #5）

**评分指南：**
- 完整：存在 GBP 嵌入，类别信号一致，帖子活跃，有照片
- 部分：存在部分 GBP 信号，但不完整
- 低：网站上没有可见的 GBP 集成

### 2. 评价与声誉（20%）

评价增长速度比评价总数更重要。**18 天规则**（Sterling Sky）：如果连续 3 周没有新评价，排名会大幅下滑。

**检查以下内容：**
- 页面或 schema 中可见的 Google 评价总数（神奇阈值：10，Sterling Sky）
- 星级评分（31% 的消费者只选择 4.5 星以上，68% 只选择 4 星以上，BrightLocal 2026）
- 评价近期程度指标（74% 的消费者只关注过去 3 个月内的评价）
- schema 中的 `aggregateRating`（ratingValue、reviewCount、bestRating）
- 是否存在第三方评价（消费者平均使用 6 个评价网站，BrightLocal 2026）
- 商家回复模式（88% 的消费者愿意选择会回复评价的商家，BrightLocal）
- 评价筛选检测：在将用户引导至评价平台前，先对满意度进行预筛选的做法违反 Google 的政策（虚假互动政策）以及 FTC 规定（每次违规罚款 $53,088）

**行业特定要求：**
- 医疗保健：HIPAA 禁止在回复中确认或否认评价者是患者
- 法律：回复评价时需考虑律师与委托人之间的特权保护问题

**评分指南：**
- 完整：10 条以上评价、4.5 星以上、近期有活动、商家有回复、出现在多个平台
- 部分：有一些评价，但在近期程度、评分或回复率方面存在缺口
- 低：少于 10 条评价、近期没有活动、没有回复、仅存在于单一平台

### 3. 本地页面 SEO（20%）

专门的服务页面 = **本地自然搜索排名的第 1 大因素，也是 AI 可见性的第 2 大因素**（Whitespark 2026）。

**检查以下内容：**
- 标题标签包含城市/服务关键词
- H1 标签具有本地搜索意图（城市 + 服务）
- NAP（名称、地址、电话）在页面 HTML 中可见（页脚、联系区域、页眉）
- 专门的服务页面（每项核心服务对应一个页面）
- 多地点网站的地点页面质量：
  - **至少超过 60-70% 的内容具有独特性**（行业共识，Google 未确认具体阈值）
  - **替换测试**：如果将城市名称替换后，内容仍然通顺合理，那么这就是一个门页（RicketyRoo 方法）。一家 HVAC 公司因存在这种模式，在 2024 年 3 月核心更新后排名下降了 80%，流量下降了 63%
  - 本地照片、特定区域的客户评价、本地常见问题
- 嵌入 Google 地图（强化地理信号，但不是直接的排名因素 -- 使用延迟加载来减轻对速度的影响）
- 点击拨号按钮（`tel:` 链接）和首屏上方的联系表单
- 内部链接架构：中心辐射式，每个关键页面距离首页不超过 3 次点击
- 每 1,000 个词设置 2-5 个上下文相关的内部链接，并使用描述性锚文本

**多地点特定要求：**
- 包含独立可抓取 URL 的门店定位器（优先使用 SSR/SSG，而非 CSR）
- 子目录结构：`domain.com/locations/city-name/`（子目录能够更好地集中链接权益，Bruce Clay：流量提升 50% 以上）
- 每个地点页面都有带 `@id` 的独特 LocalBusiness schema

**评分指南：**
- 完整：标题 + H1 中包含城市名称，NAP 可见，有专门的服务页面，没有门页模式，内部链接良好
- 部分：存在一些本地信号，但缺少服务页面或存在门页风险
- 低：标题/H1 通用，NAP 不可见，地点页面内容单薄

### 4. NAP 一致性与引文（15%）

传统本地 3-pack 排名中的引文数量正在下降，但 AI 可见性排名前 5 的因素中有 **3 项与引文相关**（Whitespark 2026）。Google 2025 年 7 月的文档更新已从 prominence 定义中移除“目录”。

**检查以下内容：**
- NAP 提取：比较以下来源中的名称、地址、电话：
  1. 可见页面 HTML（页脚、联系页面）
  2. LocalBusiness JSON-LD schema
  3. 任何可见的 GBP 数据
  - 标记这三个来源之间的任何差异
- Tier 1 目录中的引文存在情况（通过 WebFetch 或 site: 搜索模式检查）：
  - 页面上的 Google Business Profile 信号
  - Yelp：`site:yelp.com "Business Name"`
  - BBB：`site:bbb.org "Business Name"`
  - Facebook 商业页面引用
- **了解 Apple Maps / Apple business listings：**认领并维护 Apple 商家列表；将 Apple Business 统一平台发布/更名的说法视为 TechRadar 来源的信息，并在断言之前通过 Apple 官方来源进行验证。
- 了解 Bing Places（为 ChatGPT、Copilot、Alexa 提供支持，建议认领并优化）
- 行业特定的目录建议：加载 `../seo/references/local-schema-types.md`，获取各垂直行业的引文来源
- 了解数据聚合商：Data Axle、Foursquare、Neustar/TransUnion（建议提交，以便向下游分发）

**评分指南：**
- 满分：页面/schema 中的 NAP 一致，检测到 Tier 1 引文，并且存在行业目录
- 部分得分：存在 NAP，但有不一致之处，部分引文缺失
- 低分：NAP 存在差异，未检测到引文，schema 中没有地址

### 5. 本地 Schema 标记（10%）

Schema 并不是直接的排名因素（John Mueller 已确认）。但它能够启用富媒体搜索结果（Webstix 案例研究显示点击率提升 43%），并帮助 AI 系统解析商家信息。

**检查以下内容：**
- 是否存在 LocalBusiness schema（提取 JSON-LD 代码块）
- 必需属性：`name`、包含 PostalAddress 子属性的 `address`
- 推荐属性：`geo`（至少 5 位小数，已确认）、`openingHoursSpecification`、`telephone`、`url`、`priceRange`（少于 100 个字符）、`image`、`aggregateRating`
- **行业对应的正确子类型**——加载 `../seo/references/local-schema-types.md`：
  - 餐厅使用 `Restaurant`，而不是通用的 `LocalBusiness`
  - 法律行业使用 `LegalService`，而不是已弃用的 `Attorney`
  - 汽车经销商使用 `AutoDealer`，而不是已弃用的 `VehicleListing`
  - 医疗行业使用 `MedicalClinic`/`Hospital`/`Dentist`，而不是通用的 `MedicalBusiness`
- SAB 特定要求：使用命名城市设置 `areaServed`（建议使用；不在 Google 官方列表中，但 Schema.org 支持）
- 多地点：每个地点页面都有自己的 LocalBusiness，并使用唯一的 `@id`，通过 `branchOf` 与主页上的 Organization 建立关联
- 行业特定的 schema 模式（根据 `../seo/references/local-schema-types.md`）：
  - 餐厅：Menu + MenuSection + MenuItem + ReserveAction（注意：Reservation/Order actions 并不是 Google 支持的富媒体搜索结果；其价值在于提供机器可读的商家数据）
  - 医疗：Physician（Person）+ MedicalSpecialty + 指向 NPI 的 sameAs
  - 法律：LegalService + Person + Service（业务领域）
  - 家庭服务：子类型 + areaServed + Service
  - 房地产：RealEstateAgent + Person + RealEstateListing
  - 汽车行业：AutoDealer + Car + Offer（分别设置部门 schema）

**评分指南：**
- 完整：子类型正确，包含所有推荐属性、行业特定模式，JSON-LD 有效
- 部分：存在 LocalBusiness，但类型通用或缺少推荐属性
- 低：没有本地 schema，或 schema 存在错误/占位内容

### 6. 本地链接与权威信号（10%）

链接对本地包排名的影响正在下降，但仍约占 **26% 的本地自然排名因素**（Whitespark 2026，排名第 2 的因素组）。入选“最佳”榜单 = **AI 可见度排名第 1 的引用因素**。

**检查项：**
- 页面可检测到的本地反向链接指标：
  - 商会提及或链接（Trust Flow 较高，消费者访问量约增加 80%，GlueUp）
  - BBB 认证/徽章（Google 使用 BBB 验证企业）
  - 本地新闻/媒体报道提及
  - 社区参与信号（赞助、当地活动、合作关系）
- “最佳”榜单收录情况（根据 Whitespark 2026，这是 AI 可见度的首要因素）
- 数字公关信号：目前 66.2% 的公关从业者将 AI 引用作为 KPI 进行跟踪（BuzzStream 2026）
- 品牌提及与 AI 可见度的相关性比传统反向链接高 **3 倍**（Ahrefs：相关性分别为 0.664 与 0.218）
- 链接增长速度基准：小型企业每月 5-10 个高质量本地链接（共识）

**评分指南：**
- 完整：可看到本地权威信号（商会、BBB、媒体报道），并能确认有社区参与
- 部分：存在一些权威信号，但可见的本地链接指标有限
- 低：无法检测到本地权威信号

---

## AI 搜索对本地业务的影响

**不要重复 seo-geo 分析。** 提供本地特定的 AI 上下文，并建议运行 `/seo geo <url>` 进行完整分析。

本地 AI 关键事实：
- AI Overviews 最多出现在 **68% 的本地搜索**中（Whitespark 2025 年第二季度）
- ChatGPT 的转化率为 15.9%，Google 自然搜索为 1.76%（Seer Interactive）
- AI 可见度排名前 5 的因素中，有 3 个与引用相关（Whitespark 2026）
- ChatGPT **无法直接访问 GBP**，其信息来源于 Bing 索引、Yelp、TripAdvisor、BBB、Reddit
- Bing Places 至关重要：为 ChatGPT、Copilot、Alexa 提供支持
- 第三方观察到的本地 AI 界面变化（美国移动端）可能只展示 1-2 家企业，展示数量减少 32%（Sterling Sky）

**建议**：运行 `/seo geo <url>`，进行全面的 AI 搜索可见度分析，包括可引用性评分、llms.txt 检查和品牌提及审计。

---

## 参考文件

根据需要按需加载：
- `../seo/references/local-seo-signals.md`：排名因素、评论基准、引用层级、GBP 功能状态、算法更新
- `../seo/references/local-schema-types.md`：按行业划分的 LocalBusiness 子类型、schema 模式、各垂直领域的引用来源

---

## 输出

生成 `LOCAL-SEO-ANALYSIS-{domain}.md`，包含：

1. **本地 SEO 评分：XX/100**，以及维度明细表
2. **业务类型**：实体店 / SAB / 混合型
3. **检测到的行业垂直领域** + 行业特定发现
4. **GBP 优化检查清单**（已检测到的信号与缺失项）
5. **评论健康状况快照**（评分、数量、增长速度指标、回复模式）
6. **NAP 一致性审计**（页面与 schema 的差异、跨来源比较）
7. **引用存在性检查**（一级目录状态）
8. **本地 schema 状态**（存在/缺失/格式错误 + 可直接使用的修复方案）
9. **位置页面质量**（如果是多地点：独特内容比例、门页风险、门店定位器）
10. **排名前 10 的优先行动项**（严重 > 高 > 中 > 低）
11. **限制免责声明**：本分析无法评估的内容（地理网格排名、Domain Authority、全面的反向链接、GBP Insights 数据、实时本地包排名），以及哪些付费工具可以弥补这些不足

---

## 快速见效

1. 认领并优化 Apple Maps / Apple 商家信息；任何关于 Apple Business 上线/更名的说法，须先通过 Apple 官方来源核实
2. 认领并优化 Bing Places（为 ChatGPT、Copilot、Alexa 提供支持）
3. 修复页面、schema 和 GBP 之间的任何 NAP 不一致
4. 添加正确行业子类型的 LocalBusiness schema
5. 添加精度达到 5 位以上小数的 `geo` 坐标
6. 确保电话号码使用 `tel:` 链接，以支持点击拨号
7. 在标题标签和 H1 中添加城市 + 服务关键词

## 中等工作量

1. 为每项核心服务创建专属页面（Whitespark：本地自然搜索排名第一大因素）
2. 制定评论获取策略，保持至少 18 天的发布间隔
3. 向三家数据聚合商提交信息（Data Axle、Foursquare、Neustar/TransUnion），以便向下游分发
4. 认领行业特定的目录列表（根据各垂直行业的建议）
5. 添加行业特定的 schema 模式（餐厅使用 Menu，医疗行业使用 Physician 等）
6. 为服务页面/位置页面实施中心辐射式内部链接

## 高影响力

1. 制定本地数字公关策略，争取进入“最佳”榜单（AI 可见性的第一大因素）
2. 为每个位置页面开发独特且不可互换的内容（独特内容比例 >60%）
3. 在 ChatGPT 获取信息的平台上建立存在感（Yelp、TripAdvisor、BBB、Reddit）
4. 争取加入商会并成为 BBB 会员（权威性 + 验证信号）
5. 创建社区参与相关内容（赞助、当地活动、合作伙伴关系）

---

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `business_data_business_listings_search` 提取实时 GBP/商家列表数据并审核各目录中的引文，同时使用 `serp_organic_live_advanced` 获取实时本地包排名。

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 故障、连接被拒绝） | 清晰报告错误。不要猜测网站内容。建议用户验证 URL 后重试。 |
| 页面未检测到本地信号 | 报告未发现本地商家指标。建议用户确认这是否为本地商家，并在可用时提供 GBP 列表 URL。 |
| 页面 HTML 中未找到 NAP | 检查 schema 和 meta 标签。如果仍未找到，则标记为 Critical 问题。建议将可见的 NAP 添加到页脚和联系页面。 |
| 行业垂直领域不明确 | 提供检测到的排名前两位的垂直领域及其支持信号。在应用行业特定建议前，请用户确认。 |
| 拥有 50 个以上位置页面的多位置网站 | 应用 seo orchestrator 中的质量门槛：页面达到 30 个以上时发出 WARNING（强制要求 60% 以上的内容独特）；页面达到 50 个以上时 HARD STOP（继续前要求用户说明理由）。 |

## FLOW 框架集成

对于提示词引导的本地优化，请使用 `/seo flow local <url>`，FLOW 的 11 个本地阶段提示词涵盖 GBP 优化、元描述、标题标签以及结构化本地审核工作流。