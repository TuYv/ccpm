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
  version: "2.2.4"
  category: seo
---
# 地图智能分析（2026 年 3 月）

面向本地商家的地图平台分析。使用外部 API 评估商家在 Google Maps、Bing Places、Apple Maps 和 OpenStreetMap 上的展示情况。

**与 seo-local 的边界：** 此技能分析商家在地图平台上的表现（通过 API）。seo-local 分析网站上的本地 SEO 信号（通过 HTML 抓取）。不要重复执行 seo-local 的页面分析。对于网站层面的检查，建议使用 `/seo local <url>`。

---

## 快速参考

| 命令 | 功能 | 层级 |
|---------|-------------|------|
| `/seo maps <url>` | 完整的地图展示审核（自动选择层级） | 0+ |
| `/seo maps grid <keyword> <location>` | 地理网格排名扫描（7x7，默认 1 个关键词） | 1+ |
| `/seo maps reviews <business> <location>` | 跨平台评论情报分析 | 1+ |
| `/seo maps competitors <keyword> <location>` | 竞争对手覆盖半径映射 | 0+ |
| `/seo maps nap <business-name>` | 跨平台 NAP 验证 | 0+ |
| `/seo maps schema <business-name>` | 根据数据生成 LocalBusiness JSON-LD | 0+ |
| `/seo maps gbp <business> <location>` | GBP 完整度审核 | 1+ |

---

## 三级能力检测

在进行任何分析之前，检测可用的能力层级：

### 层级 0（免费）
**检测：** DataForSEO MCP 工具不可用。
**能力：** Overpass API 竞争对手发现、Geoapify POI 搜索、Nominatim 地理编码、静态 GBP 检查清单、Schema 生成、跨平台 NAP 指导。
**加载：** `../seo/references/maps-free-apis.md`

### 层级 1（DataForSEO）
**检测：** `business_data_business_listings_search` MCP 工具可用。
**能力：** 层级 0 的全部能力，另加地理网格排名跟踪、实时 GBP 资料审核、评论情报分析（增长速度、情感倾向、分布）、GBP 帖子活跃度、问答数据，以及 Tripadvisor/Trustpilot 评论。
**加载：** `../seo/references/maps-api-endpoints.md`

### 层级 2（DataForSEO + Google Maps Platform）
**检测：** 层级 1 可用，并且环境中存在 Google Maps API 密钥。
**能力：** 层级 1 的全部能力，另加 Google Places 详细信息、实时营业状态、AI 驱动的地点摘要和照片分析。
**注意：** Google 服务条款规定只能存储 `place_id`。纬度/经度最多可缓存 30 天。

**分析开始时，始终向用户说明检测到的层级。**

---

## 地理网格排名跟踪（层级 1+）

通过多个 GPS 坐标模拟 Google Maps 搜索，以展示某个地理区域内的排名变化。需要 DataForSEO。

**加载：** `../seo/references/maps-geo-grid.md`，以获取算法、SoLV 公式和热力图格式。
**加载：** `../seo/references/maps-api-endpoints.md`，以获取 Maps SERP 端点的详细信息。

### 工作流程

1. 对商家地址进行地理编码，获取中心点纬度/经度
2. 使用 Haversine 偏移公式生成网格点（默认：7x7，半径 5 公里）
3. **显示费用估算，并在继续之前请求确认**
4. 为每个网格点使用 `location_coordinate` 发起 DataForSEO Maps SERP API 调用
5. 查找目标商家在每个点的排名
6. 计算 SoLV：`(top_3_count / total_points) * 100`
7. 在输出中渲染 ASCII 热力图

### 成本警告（必需）

每次执行地理网格扫描前，显示：
```
Geo-Grid Scan: [keyword] at [location]
Grid: 7x7 (49 points) | Keywords: [N] | Est. cost: $[amount]
DataForSEO credits will be consumed. Proceed?
```

---

## GBP 商家资料审计（首选 Tier 1，Tier 0 手动）

审计影响 Google 商家资料质量和排名的 25 个字段。

**加载：** `../seo/references/maps-gbp-checklist.md`，以获取完整检查清单和评分标准。

> **AI 与 2026 年背景（第三方报道）：** 据美联社报道，**Ask Maps**
> 是一项由 Gemini 驱动的对话式地图功能，于 2026-03-12 推出（iOS/Android，
> 美国和印度）。**AI Mode**（月活跃用户超过 10 亿，数据引自 Google I/O 2026 主题演讲相关报道；尚未得到 Google 自有来源确认）
> 越来越多地呈现第三方术语中所称的 1-2 个商家本地 AI 界面；面向本地服务（房屋维修、美容、宠物护理）的**智能体式
> 预约/致电**功能将于 2026 年夏季向所有美国用户推出（Google 可代表用户致电商家）。
> 2026 年新增的 GBP API 功能包括：评价媒体 URL、定期本地帖子排期、
> 评价回复状态/审核，以及邀请 Place ID。来源：
> blog.google/products-and-platforms/products/search/search-io-2026/ ·
> developers.google.com/my-business/content/latest-updates

### Tier 1 工作流

1. 通过 DataForSEO My Business Info API 获取商家资料（使用关键词或 CID）
2. 将 API 响应字段映射到包含 25 个字段的检查清单
3. 对每个字段评分：已提供且已优化 = 2 分，已提供 = 1 分，缺失 = 0 分
4. 应用特定行业的权重乘数
5. 归一化为 0-100 分

### Tier 0 工作流

1. 通过 WebFetch 获取商家网站
2. 提取所有可见的 GBP 信号（地图嵌入、地点引用、评价小组件）
3. 根据可检测到的信号应用静态检查清单
4. 将无法检测的字段标记为“未知（需要 DataForSEO 获取实时数据）”

---

## 评价智能分析（Tier 1+）

跨平台评价分析：评价速度、情感、评分分布、虚假评价检测。

**参考：** `../seo/references/local-seo-signals.md` 中的基准数据（与 seo-local 共享）。

### 工作流

1. 通过 DataForSEO Reviews API 获取 Google 评价（按最新排序）
2. 计算评价速度：过去 6 个月内每月的评价数量
3. 检查 18 天规则（Sterling Sky）：任何连续 3 周的空档期都意味着排名风险
4. 分析评分分布：健康状态 = 向 5 星倾斜的钟形曲线
5. 计算商家回复率：已回复评价数 / 评价总数
6. 获取 Tripadvisor 和 Trustpilot 评价（如有）
7. 生成跨平台对比表

### 虚假评价检测信号

标记符合以下 2 种或更多模式的评价：
- 时间高度一致（同一天/同一小时出现多条评价）
- 评价者账号历史记录有限或仅发布过一条评价
- 地理位置不一致（评价者位置与商家位置不符）
- 纯 5 星评价速度激增（相较于历史基准）
- 多条评价中的文本完全相同或近乎相同
- 在没有相应营销活动的情况下，评价数量突然激增

---

## 竞争对手半径映射（Tier 0+）

识别并分析指定半径范围内的竞争对手。

### 层级 0（Overpass API）

**加载：** `../seo/references/maps-free-apis.md` 以获取查询模板。

1. 对商家地址进行地理编码
2. 查询 Overpass API，查找指定半径内具有相同 OSM 标签的商家
3. 解析结果：名称、地址、电话、网站、距中心点的距离
4. 按距离排序，并以竞争格局表的形式呈现

### 层级 1（DataForSEO）

1. 使用 Maps SERP API，并传入商家关键词和位置
2. 提取排名前 20 的竞争对手及其完整资料数据
3. 比较：评分、评论数量、类别、照片、属性
4. 计算竞争密度得分：每 km^2 的竞争对手数量

---

## 跨平台 NAP 验证（层级 0+）

检查 Google、Bing Places、Apple 和 OSM 上商家信息的一致性。

### 工作流程

1. 在各个平台上搜索商家名称：
   - Google：根据 GBP 数据或 Maps SERP 结果推断
   - Bing：`WebFetch https://www.bing.com/maps?q=BUSINESS+NAME+LOCATION`
   - Apple：手动检查（无公开 API——验证/认领 Apple 商家信息是否存在；在 Apple 官方来源确认之前，将 Apple Business 的发布/更名说法视为来源于 TechRadar）
   - OSM：使用 Overpass 或 Nominatim 搜索
2. 从每个来源提取 NAP（名称、地址、电话）
3. 比较一致性：完全匹配、部分匹配、缺失或冲突
4. 将差异标记为严重（名称不匹配）、高（地址不匹配）、中（电话不匹配）
5. 建议认领尚未认领的资料

---

## Schema 生成（层级 0+）

根据收集的数据生成 LocalBusiness JSON-LD 标记。

**参考：** `../seo/references/local-schema-types.md`，用于获取行业子类型（与 seo-local 共享）。

### 工作流程

1. 确定该行业最具体的 schema 子类型
2. 填充必需属性：`@type`、`name`、`address`、`image`
3. 添加推荐属性：`telephone`、`url`、`geo`、`openingHoursSpecification`、`priceRange`
4. 为多地点商家添加策略性属性：`branchOf`、`areaServed`、`sameAs`
5. 如果有评论数据，则添加 `aggregateRating`
6. 输出可直接实施的有效 JSON-LD 代码块

**不要生成自利性评论标记**——Google 会忽略商家自身提供的 LocalBusiness 评论标记。只标记页面上可见的第三方评论。

---

## 参考文件

根据需要按需加载（不要在启动时全部加载）：
- `../seo/references/maps-api-endpoints.md`：DataForSEO 端点详情、参数、成本
- `../seo/references/maps-free-apis.md`：Overpass、Geoapify、Nominatim 查询模板
- `../seo/references/maps-geo-grid.md`：网格算法、SoLV 公式、热力图渲染
- `../seo/references/maps-gbp-checklist.md`：包含行业权重的 25 字段 GBP 审核
- `../seo/references/local-seo-signals.md`：排名因素、评论基准（共享）
- `../seo/references/local-schema-types.md`：按行业划分的 LocalBusiness 子类型（共享）

---

## 输出

生成 `MAPS-ANALYSIS-{domain}.md`，其中包含：

1. **地图健康评分：XX/100**，附各维度明细表
2. **检测到的能力层级**（层级 0 或层级 1），并说明可用功能
3. **地理网格热力图**（层级 1）：包含 SoLV 百分比和平均排名的 ASCII 网格
4. **GBP 资料审核**：按字段评分，并应用特定行业权重
5. **评论情报**：增长速度图表、评分分布、回复率、跨平台比较
6. **竞争格局**：指定半径内的竞争对手数量、按评分/评论数排序的前 5 名、竞争密度
7. **跨平台展示情况**：Google/Bing/Apple/OSM 商家信息状态
8. **Schema 建议**：生成的 LocalBusiness JSON-LD（如果缺失或不完整）
9. **优先级最高的 10 项行动**（严重 > 高 > 中 > 低）
10. **成本报告**：分析期间消耗的 DataForSEO 点数（仅限层级 1）
11. **局限性免责声明**：当前层级无法评估的内容

---

## 跨 Skill 委派

- 网站页面内本地信号：建议使用 `/seo local <url>`
- 完整的 AI 搜索可见性：建议使用 `/seo geo <url>`
- Schema 验证与修复：建议使用 `/seo schema <url>`
- 实时 SERP 和关键词数据：建议使用 `/seo dataforseo [command]`

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| DataForSEO MCP 不可用 | 降级至 Tier 0。告知用户：“未检测到 DataForSEO。正在运行免费层级分析。如需使用地理网格跟踪和评论情报功能，请安装 DataForSEO 扩展。” |
| 在 Maps SERP 中未找到商家 | 使用关键词尝试 My Business Info。如果仍未找到，则报告：“未在 Google Maps 中找到此位置的商家。” |
| 地理编码失败（Nominatim） | 请用户提供坐标或更具体的地址。 |
| 达到 API 速率限制 | 报告该限制。建议等待，或使用标准（排队）方法而非实时方法。 |
| 未找到评论 | 报告零评论状态。建议采用以 18 天为目标周期的评论获取策略。 |
| 检测到多个地点 | 询问用户要分析哪个地点，或提供批处理模式及每个地点的成本估算。 |