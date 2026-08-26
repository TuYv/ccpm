---
name: seo-maps
description: >
  Maps intelligence for local SEO: geo-grid rank tracking, GBP profile
  auditing via API, review intelligence across Google/Tripadvisor/Trustpilot,
  cross-platform NAP verification, competitor radius mapping, and
  LocalBusiness schema generation. Three tiers: free (Overpass + Geoapify),
  DataForSEO, and DataForSEO + Google. Use when user says "maps", "geo-grid",
  "rank tracking", "GBP audit", "review velocity", "competitor radius", or
  "SoLV".
user-invocable: true
argument-hint: "[command] [url|keyword|location]"
license: MIT
compatibility: "DataForSEO MCP for Tier 1+, Google Maps API for Tier 2"
metadata:
  author: AgriciDaniel
  version: "2.2.5"
  category: seo
---
# 地图智能（2026 年 3 月）

面向本地企业的地图平台分析。通过外部 API 评估企业在 Google Maps、Bing Places、Apple Maps 和 OpenStreetMap 上的呈现情况。

**与 seo-local 的边界：** 此 skill 通过 API 分析企业在地图**平台**上的情况。seo-local 通过 HTML fetch 分析**网站**上的本地 SEO 信号。不要重复进行 seo-local 的页面分析。对于网站层面的检查，建议使用 `/seo local <url>`。

---

## 快速参考

| 命令 | 功能 | 层级 |
|---------|-------------|------|
| `/seo maps <url>` | 全面的地图呈现审计（自动选择层级） | 0+ |
| `/seo maps grid <keyword> <location>` | 地理网格排名扫描（7x7，默认 1 个关键词） | 1+ |
| `/seo maps reviews <business> <location>` | 跨平台评论情报分析 | 1+ |
| `/seo maps competitors <keyword> <location>` | 竞争对手半径地图 | 0+ |
| `/seo maps nap <business-name>` | 跨平台 NAP 验证 | 0+ |
| `/seo maps schema <business-name>` | 根据数据生成 LocalBusiness JSON-LD | 0+ |
| `/seo maps gbp <business> <location>` | GBP 完整性审计 | 1+ |

---

## 三层能力检测

在进行任何分析之前，检测可用的能力层级：

### 层级 0（免费）
**检测方式：** DataForSEO MCP 工具不可用。
**能力：** 通过 Overpass API 发现竞争对手、通过 Geoapify 搜索 POI、通过 Nominatim 进行地理编码、静态 GBP 检查清单、schema 生成、跨平台 NAP 指导。
**加载：** `../seo/references/maps-free-apis.md`

### 层级 1（DataForSEO）
**检测方式：** `business_data_business_listings_search` MCP 工具可用。
**能力：** 包含层级 0 的全部能力，另外还包括地理网格排名跟踪、实时 GBP 资料审计、评论情报分析（评论速度、情感、分布）、GBP 帖子活跃度、问答数据、Tripadvisor/Trustpilot 评论。
**加载：** `../seo/references/maps-api-endpoints.md`

### 层级 2（DataForSEO + Google Maps Platform）
**检测方式：** 层级 1 可用，并且环境中存在 Google Maps API 密钥。
**能力：** 包含层级 1 的全部能力，另外还包括 Google Places 详情、实时企业状态、AI 驱动的地点摘要、照片分析。
**注意：** Google ToS 限制只能存储 `place_id`。缓存的纬度/经度最长为 30 天。

**始终在分析开始时向用户说明检测到的层级。**

---

## 地理网格排名跟踪（层级 1+）

模拟从多个 GPS 坐标进行 Google Maps 搜索，以展示某个地理区域内的排名变化。需要 DataForSEO。

**加载：** `../seo/references/maps-geo-grid.md` 以获取算法、SoLV 公式和热力图格式。
**加载：** `../seo/references/maps-api-endpoints.md` 以获取 Maps SERP 端点详情。

### 工作流程

1. 对企业地址进行地理编码，获取中心纬度/经度
2. 使用 Haversine 偏移公式生成网格点（默认：7x7，半径 5km）
3. **显示成本估算，并在继续之前请求确认**
4. 使用每个网格点对应的 `location_coordinate` 调用 DataForSEO Maps SERP API
5. 查找目标企业在每个点的排名
6. 计算 SoLV：`(top_3_count / total_points) * 100`
7. 在输出中渲染 ASCII 热力图

### 成本警告（必需）

在每次地理网格扫描之前，显示：
```
Geo-Grid Scan: [keyword] at [location]
Grid: 7x7 (49 points) | Keywords: [N] | Est. cost: $[amount]
DataForSEO credits will be consumed. Proceed?
```

---

## GBP 资料审核（优先使用 Tier 1，Tier 0 手动执行）

审核影响 Google Business Profile 质量和排名的 25 个字段。

**加载：** `../seo/references/maps-gbp-checklist.md` 以获取完整检查清单和评分标准。

> **AI 与 2026 年背景（第三方报道）：** **Ask Maps** 据 AP News 报道，是一项于 2026-03-12 发布的 Gemini 对话式 Maps 功能（适用于 iOS/Android，覆盖美国和印度）。**AI Mode**（拥有 10 亿以上 MAU，据 Google I/O 2026 主题演讲报道；Google 官方来源尚未确认）越来越多地以第三方术语呈现 1-2 个本地商家的 AI 界面；面向本地服务（家庭维修、美容、宠物护理）的**代理式预订/呼叫**功能将于 2026 年夏季向所有美国用户推出（Google 可以代表用户致电商家）。
> 2026 年新增的 GBP API 功能：评价媒体 URL、定期本地帖子排程、评价回复状态/审核，以及邀请 Place ID。来源：
> blog.google/products-and-platforms/products/search/search-io-2026/ ·
> developers.google.com/my-business/content/latest-updates

### Tier 1 工作流程

1. 通过 DataForSEO My Business Info API（keyword 或 CID）获取商家资料
2. 将 API 响应字段映射到 25 个字段的检查清单
3. 为每个字段评分：已存在 + 已优化 = 2 分，已存在 = 1 分，缺失 = 0 分
4. 应用行业特定的权重乘数
5. 归一化为 0-100 分制

### Tier 0 工作流程

1. 通过 WebFetch 获取商家网站
2. 提取任何可见的 GBP 信号（Maps 嵌入、地点引用、评价小组件）
3. 根据可检测到的信号应用静态检查清单
4. 将无法检测的字段标记为“未知（需要 DataForSEO 才能获取实时数据）”

---

## 评价情报（Tier 1+）

跨平台评价分析：增长速度、情感、评分分布、虚假评价检测。

**参考：** `../seo/references/local-seo-signals.md` 获取基准数据（与 seo-local 共用）。

### 工作流程

1. 通过 DataForSEO Reviews API 获取 Google 评价（按最新排序）
2. 计算评价增长速度：过去 6 个月每月的评价数量
3. 检查 18 天规则（Sterling Sky）：任何 3 周间隔都属于排名风险
4. 分析评分分布：健康分布 = 向 5 星偏斜的钟形曲线
5. 计算商家回复率：回复数 / 评价总数
6. 获取 Tripadvisor 和 Trustpilot 评价（如果有）
7. 跨平台对比表

### 虚假评价检测信号

标记符合以下 2 个或更多模式的评价：
- 时间高度一致（多条评价发布于同一天/同一小时）
- 评价者账户历史有限，或仅发布过一条评价
- 地理位置不一致（评价者所在地与商家所在地不符）
- 评分增长突然全部为 5 星（与历史基线相比）
- 多条评价之间存在完全相同或近乎相同的文本
- 评价数量突然激增，但没有相应的营销活动

---

## 竞争对手半径地图（Tier 0+）

识别并分析指定半径范围内的竞争对手。

### Tier 0（Overpass API）

**加载：** `../seo/references/maps-free-apis.md` 以获取查询模板。

1. 对商家地址进行地理编码
2. 查询 Overpass API，获取半径范围内具有相同 OSM 标签的商家
3. 解析结果：名称、地址、电话、网站、与中心点的距离
4. 按距离排序，并以竞争对手概览表的形式呈现

### Tier 1（DataForSEO）

1. 使用 Maps SERP API，根据商家关键词和位置进行查询
2. 提取排名前 20 的竞争对手及其完整档案数据
3. 对比：评分、评论数量、类别、照片、属性
4. 计算竞争密度得分：每平方公里的竞争对手数量

---

## 跨平台 NAP 验证（Tier 0+）

检查商家信息在 Google、Bing Places、Apple 和 OSM 上的一致性。

### 工作流程

1. 在每个平台上搜索商家名称：
   - Google：从 GBP 数据或 Maps SERP 结果中推断
   - Bing：`WebFetch https://www.bing.com/maps?q=BUSINESS+NAME+LOCATION`
   - Apple：手动检查（没有公开 API——验证/认领 Apple 商家信息是否存在；在 Apple 官方确认之前，将 TechRadar 来源的 Apple Business 上线/更名声明视为待确认信息）
   - OSM：使用 Overpass 或 Nominatim 搜索
2. 从每个来源提取 NAP（名称、地址、电话）
3. 对比一致性：完全匹配、部分匹配、缺失或冲突
4. 将差异标记为严重（名称不匹配）、高（地址不匹配）、中（电话不匹配）
5. 建议认领尚未认领的档案

---

## Schema 生成（Tier 0+）

根据收集的数据生成 LocalBusiness JSON-LD 标记。

**参考：** `../seo/references/local-schema-types.md`，了解各行业的子类型（与 seo-local 共享）。

### 工作流程

1. 确定该行业最具体的 Schema 子类型
2. 填充必需属性：`@type`、`name`、`address`、`image`
3. 添加推荐属性：`telephone`、`url`、`geo`、`openingHoursSpecification`、`priceRange`
4. 为多地点业务添加策略性属性：`branchOf`、`areaServed`、`sameAs`
5. 如果有评论数据，添加 `aggregateRating`
6. 输出可直接实施的有效 JSON-LD 代码块

**不要生成自利性评论标记**——Google 会忽略商家自身提供的 LocalBusiness 评论标记。仅标记页面上可见的第三方评论。

---

## 参考文件

根据需要按需加载（**不要**在启动时全部加载）：
- `../seo/references/maps-api-endpoints.md`：DataForSEO 端点详情、参数、费用
- `../seo/references/maps-free-apis.md`：Overpass、Geoapify、Nominatim 查询模板
- `../seo/references/maps-geo-grid.md`：网格算法、SoLV 公式、热力图渲染
- `../seo/references/maps-gbp-checklist.md`：包含行业权重的 25 项 GBP 审核清单
- `../seo/references/local-seo-signals.md`：排名因素、评论基准（共享）
- `../seo/references/local-schema-types.md`：按行业划分的 LocalBusiness 子类型（共享）

---

## 输出

生成 `MAPS-ANALYSIS-{domain}.md`，包含：

1. **Maps 健康度评分：XX/100**，以及维度分解表
2. **检测到的能力层级**（Tier 0 或 Tier 1），并说明可用功能
3. **地理网格热力图**（Tier 1）：包含 SoLV 百分比和平均排名的 ASCII 网格
4. **GBP 档案审核**：根据行业特定权重进行逐字段评分
5. **评论分析**：增长速度图表、评分分布、回复率、跨平台对比
6. **竞争对手概览**：半径范围内的数量、按评分/评论数量排名的前 5 名、竞争密度
7. **跨平台展示情况**：Google/Bing/Apple/OSM 信息状态
8. **Schema 建议**：生成 LocalBusiness JSON-LD（如果缺失或不完整）
9. **排名前 10 的优先行动项**（严重 > 高 > 中 > 低）
10. **费用报告**：分析期间消耗的 DataForSEO credits（仅 Tier 1）
11. **局限性声明**：当前层级无法评估的内容

---

## 跨技能委派

- 网站页面本地信号：推荐使用 `/seo local <url>`
- 完整的 AI 搜索可见性：推荐使用 `/seo geo <url>`
- Schema 验证与修复：推荐使用 `/seo schema <url>`
- 实时 SERP 和关键词数据：推荐使用 `/seo dataforseo [command]`

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| DataForSEO MCP 不可用 | 降级至 Tier 0。告知用户：“未检测到 DataForSEO。正在运行免费层级分析。如需地理网格跟踪和评论情报，请安装 DataForSEO 扩展。” |
| 在 Maps SERP 中未找到商家 | 使用关键词尝试 My Business Info。如果仍未找到，则报告“在此位置的 Google Maps 中未找到商家。” |
| 地理编码失败（Nominatim） | 请求用户提供坐标或更具体的地址。 |
| 达到 API 速率限制 | 报告该限制。建议等待，或使用标准（排队）方法代替实时方法。 |
| 未找到评论 | 报告评论数为零的状态。建议采用评论生成策略，目标是 18 天的发布周期。 |
| 检测到多个位置 | 询问用户要分析哪个位置，或提供批量模式，并给出每个位置的成本估算。 |