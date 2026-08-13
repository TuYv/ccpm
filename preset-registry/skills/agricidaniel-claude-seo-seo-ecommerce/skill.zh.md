---
name: seo-ecommerce
description: >
  E-commerce SEO analysis: Google Shopping visibility, Amazon marketplace
  intelligence, product schema validation, competitor pricing analysis, and
  marketplace keyword gaps. Combines on-page product SEO with marketplace data
  from DataForSEO Merchant API. Use when user says "ecommerce SEO", "product SEO",
  "Google Shopping", "marketplace SEO", "product schema", "Amazon SEO",
  "product listings", "shopping ads", or "merchant SEO".
user-invocable: true
argument-hint: "<url or keyword>"
license: MIT
compatibility: "Enhanced with DataForSEO Merchant API (optional)"
metadata:
  author: AgriciDaniel
  original_author: "Matej Marjanovic (Pro Hub Challenge)"
  version: "2.2.4"
  category: seo
---
# 电商 SEO 分析

全面的产品页面优化、市场情报和竞争性定价分析。既可独立运行（页面 SEO + 结构化数据），也可配合 DataForSEO Merchant API 获取实时 Google Shopping 和 Amazon 数据。

## 命令

| 命令 | 用途 | 是否需要 DataForSEO？ |
|---------|---------|-------------|
| `/seo ecommerce <url>` | 对产品页面或商店进行完整的电商 SEO 分析 | 可选 |
| `/seo ecommerce products <keyword>` | Google Shopping 竞争分析 | 必需 |
| `/seo ecommerce gaps <domain>` | 关键词差距分析：自然搜索与 Shopping 可见度对比 | 必需 |
| `/seo ecommerce schema <url>` | 产品结构化数据验证与增强 | 否 |

---

## 1. 产品页面分析（无需 DataForSEO）

抓取并解析任意产品页面，以评估页面 SEO 质量。

### 工作流程

```
1. claude-seo run render_page.py <url> --mode auto → raw/rendered HTML
2. claude-seo run parse_html.py --url <url>   → SEO elements
3. Analyze product-specific signals (below)
```

### 产品 SEO 检查清单

#### 标题标签
- [ ] 包含主要产品关键词
- [ ] 包含品牌名称
- [ ] 不超过 60 个字符（避免在搜索结果页面中被截断）
- [ ] 格式：`[Product Name] - [Key Feature] | [Brand]`

#### 元描述
- [ ] 包含产品关键词和优势
- [ ] 包含价格或“from $XX”（有助于提升富媒体摘要的吸引力）
- [ ] 包含行动号召（Shop now、Buy、Free shipping）
- [ ] 不超过 155 个字符

#### 标题结构
- [ ] 仅有一个与主要产品名称匹配的 H1
- [ ] 使用 H2 分别表示：功能、规格、评价、相关产品
- [ ] 不同产品变体之间不存在重复的 H1 标签

#### 产品图片
- [ ] 替代文本包含产品名称和区分性特征
- [ ] 文件名具有描述性（而不是 `IMG_001.jpg`）
- [ ] 提供 WebP 格式（并以 JPEG 作为后备格式）
- [ ] 每个产品至少有 3 张图片（主图、细节图、场景图）
- [ ] 图片尺寸 >= 800px，以符合 Google Shopping 的资格要求
- [ ] 仅对首屏以下的图片使用延迟加载

#### 内部链接
- [ ] 面包屑导航：首页 > 类目 > 子类目 > 产品
- [ ] 相关产品部分（交叉销售/追加销售）
- [ ] 使用富含关键词的锚文本链接回类目页面
- [ ] 评价部分链接到完整的评价页面（如果评价页面独立存在）

#### 内容质量
- [ ] 独特的产品描述（不是复制粘贴制造商文案）
- [ ] 产品描述正文的字数 >= 200
- [ ] 包含规格表（而非仅使用散文式描述）
- [ ] 页面中包含用户评价（UGC 信号）

### 评分

| 类别 | 权重 | 标准 |
|----------|--------|----------|
| 结构化数据完整性 | 25% | 必需及建议的 Product 字段 |
| 标题与元信息 | 15% | 关键词位置、长度、格式 |
| 图片优化 | 20% | 替代文本、格式、尺寸、数量 |
| 内容质量 | 20% | 独特描述、规格、评价 |
| 内部链接 | 10% | 面包屑、相关产品、类目 |
| 技术 | 10% | 页面速度、移动端渲染、规范链接 |

---

## 2. Google Shopping 情报（DataForSEO Merchant API）

来自 Google Shopping 结果的实时竞争分析。

### 成本防护机制（强制）

在每次调用 Merchant API 之前：
```bash
claude-seo run dataforseo_costs.py check merchant_google_products_search
```

- `"status": "approved"` -- 继续
- `"status": "needs_approval"` -- 显示成本并询问用户
- `"status": "blocked"` -- 停止并通知用户

每次调用后：
```bash
claude-seo run dataforseo_costs.py log merchant_google_products_search <cost>
```

### 工作流程

```bash
# Product search: who sells what at what price
claude-seo run dataforseo_merchant.py search "<keyword>" --marketplace google

# Seller analysis: merchant ratings and dominance
claude-seo run dataforseo_merchant.py sellers "<keyword>"

# Normalize results for analysis
claude-seo run dataforseo_normalize.py results.json --module merchant
```

### 分析输出

#### 定价情报
- 价格分布：最低值、最高值、中位数、P25、P75
- 价格异常值（与中位数相差超过 2 个标准差）
- 价格与评分的相关性
- 将货币统一换算为美元（或用户指定的货币）

#### 卖家格局
- 按商品列表数量排名的前 10 名卖家
- 商家评分分布
- 免运费的普及程度
- 新卖家与成熟卖家的对比

#### 商品列表质量
- 热门商品列表中的标题关键词模式
- 平均评分和评论数量基准
- 每个商品列表的图片数量
- 可用状态分布

加载 `references/marketplace-endpoints.md` 以获取完整的 API 参数详情。

---

## 3. Amazon 市场（DataForSEO）

对比 Google Shopping 和 Amazon 的跨市场情报。

### 成本防护机制（强制）

```bash
claude-seo run dataforseo_costs.py check merchant_amazon_products_search
```

Amazon 端点位于 `warn_endpoints` 集合中 -- 始终需要用户批准。

### 工作流程

```bash
# Amazon product search
claude-seo run dataforseo_merchant.py search "<keyword>" --marketplace amazon

# Cross-marketplace comparison
claude-seo run dataforseo_merchant.py compare "<keyword>"
```

### 跨市场报告

| 指标 | Google Shopping | Amazon |
|--------|---------------|--------|
| 平均价格 | $ | $ |
| 评分中位数 | X.X | X.X |
| 平均评论数量 | N | N |
| 头部卖家份额 | % | % |
| 免运费比例 | % | % |

---

## 4. 市场关键词差距

识别自然搜索可见性与 Shopping 可见性之间的不匹配。

### 工作流程

1. 通过 seo-dataforseo 获取自然搜索排名：
   域名的 `dataforseo_labs_google_ranked_keywords`
2. 通过 Merchant API 获取 Google Shopping 覆盖情况：
   针对排名靠前的自然搜索关键词使用 `merchant_google_products_search`
3. 交叉比对结果

### 差距类型

| 差距类型 | 含义 | 行动 |
|----------|---------|--------|
| **仅自然搜索** | 有自然搜索排名，但没有 Shopping 广告 | 创建 Google Merchant Center 数据 Feed，并对这些关键词出价 |
| **仅 Shopping** | 有 Shopping 可见性，但自然搜索表现弱或不可见 | 针对这些关键词创建内容（购买指南、对比页面） |
| **两者均有** | 在两个渠道中均可见 | 优化：确保价格一致，增强 Schema |
| **两者皆无** | 在任一渠道中均不可见 | 除非搜索量很高，否则优先级较低 |

### 输出格式

```
## Keyword Gap Analysis: example.com

### Opportunities: Organic → Shopping (12 keywords)
| Keyword | Organic Pos | Volume | CPC | Recommended Action |
|---------|------------|--------|-----|-------------------|

### Opportunities: Shopping → Organic (8 keywords)
| Keyword | Shopping Rank | Volume | CPC | Content Type Needed |
|---------|-------------|--------|-----|-------------------|
```

---

## 5. 产品 Schema 增强

根据 Google 当前的要求验证并生成 Product schema。

### 已确认的必需属性（Google Merchant）

已确认的必需字段为 `name`、`image` 和 `offers`；对于商家商品信息，应使用 `Offer`，而不是 `AggregateOffer`。

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "",
  "image": [""],
  "offers": {
    "@type": "Offer",
    "url": "",
    "priceCurrency": "USD",
    "price": "0.00",
    "availability": "https://schema.org/InStock"
  }
}
```

### 推荐属性（增强富媒体搜索结果）

- `sku` -- 产品标识符
- `description`、`brand`、`offers.seller` -- 推荐的上下文字段
- `gtin13` / `gtin14` / `mpn` -- 全球贸易标识符
- `aggregateRating` -- 星级评分 + 评价数量
- `review` -- 单条评价（至少 1 条）
- `color`、`material`、`size` -- 变体属性
- `shippingDetails` -- 包含费率和配送时间的 ShippingDetails（也支持通过 `ShippingService` 设置商家级配送信息；无需 Merchant Center 账号，也可在 Search Console 中设置配送/退货信息）
- `hasMerchantReturnPolicy` -- 包含类型和天数的 MerchantReturnPolicy
- `hasAdultConsideration` -- **成人导向型产品的必需属性**（于 2026-05-20 添加到 Product 变体 / 商家商品信息中）；Google 搜索仅支持值 `https://schema.org/SexualContentConsideration`

### 验证规则

1. `price` 必须是数字字符串，而不是 "$29.99"（不得包含货币符号）
2. `availability` 必须使用完整的 Schema.org URL 枚举值
3. `image` 应为包含 >= 1 个高分辨率图片 URL 的数组
4. `priceCurrency` 必须符合 ISO 4217（USD、EUR、GBP）
5. 如果存在 `brand`，则 `brand.name` 不得为空或为 "N/A"
6. `priceValidUntil` 中的日期必须符合 ISO 8601
7. 如果存在 `aggregateRating`：必须提供 `ratingValue` 和 `reviewCount`

### Schema 评分

| 完整度 | 分数 |
|-------------|-------|
| 包含所有必需字段 | 50/100 |
| + aggregateRating | 65/100 |
| + sku/gtin/mpn | 75/100 |
| + shippingDetails | 85/100 |
| + merchantReturnPolicy | 90/100 |
| + 评价（3 条以上） | 100/100 |

---

## 跨 Skill 集成

| Skill | 集成点 |
|-------|------------------|
| **seo-schema** | 委托生成 Product schema；复用验证逻辑 |
| **seo-images** | 产品图片审核（替代文本、格式、尺寸），以及为 AI 生成的产品图片添加 `DigitalSourceType: TrainedAlgorithmicMedia` IPTC 标签（Merchant Center 要求） |
| **seo-content** | 产品描述的 E-E-A-T 和独特性分析 |
| **seo-dataforseo** | 用于差距分析的自然搜索关键词排名 |
| **seo-technical** | 产品页面的 Core Web Vitals（首图的 LCP） |
| **seo-google** | 产品 URL 的 GSC 索引状态 + 效果数据（不包括 Merchant Center Feed 验证，该验证在 Merchant Center / **Merchant API** 中完成；旧版 Content API for Shopping 将于 2026-08-18 停用） |

## UCP：通用商务协议（已上线）

由 Google 发起的开放标准（与 Shopify、Etsy、Wayfair、Target、Walmart 共同开发；支付合作伙伴包括 Visa/Mastercard/Stripe/Adyen/Amex），旨在让 AI 智能体无需一次性集成即可发现商家、与商家协商并完成交易。Google 已确认在 Google 搜索的 AI Mode 中推出首个对话式购物参考实现。关于 Universal Cart 更广泛的推出细节，来自 Google I/O 2026 主题演讲的相关报道；尚未得到 Google 自有来源的确认。ucp.dev 将 **2026-04-08** 列为其**基于日期的版本控制**方案中的最新版本，而非 `1.0`；提供两种集成路径：**Native**（默认）和 **Embedded**（适用于获批商家）。与 **AP2** 配合使用（据报道正转向由 FIDO 治理）。权威来源：developers.google.com/merchant/ucp 和 ucp.dev。

已使用 **Google Merchant Center** 且 Product schema 规范的商家，可以在 `/.well-known/ucp` 声明 UCP 配置文件，其中列出相关能力（`dev.ucp.shopping.checkout`、`.fulfillment`、`.discount`）。有关审核标准、能力示例以及与 AP2（Agent Payments Protocol）的关系，请参阅 `references/ucp-universal-commerce-protocol.md`。

### 审核命令

```bash
# Discover and validate the UCP profile
claude-seo run ucp_check.py https://store.example.com --json

# With endpoint reachability probes (HEAD each declared capability)
claude-seo run ucp_check.py https://store.example.com --probe-endpoints --json
```

该脚本返回：配置文件是否存在、版本、声明的能力、结构问题（缺少字段、未知能力 ID），以及（使用 `--probe-endpoints` 时）各端点的可访问性。因 SSRF 防护而被阻止的端点会被明确报告。缺少配置文件会被报告为机会，而非失败。UCP 本身已经上线；尚处于早期阶段的是商家的广泛采用。应将字面值 `"version": "1.0"` 标记为无效（UCP 版本基于日期，例如 `2026-04-08`）。

---

## 错误处理

| 错误 | 原因 | 响应 |
|-------|-------|----------|
| 未找到 Product schema | 页面缺少 JSON-LD | 分析页面内容，生成推荐的 schema |
| 缺少 DataForSEO 凭据 | 未设置环境变量 | 在没有市场数据的情况下运行分析，并注明限制 |
| 成本检查被阻止 | 超出每日预算 | 通知用户，并提供仅使用免费功能的分析 |
| Shopping 结果为空 | 该关键词没有产品 | 建议使用更宽泛的关键词，并检查位置设置 |
| Amazon API 超时 | 网络问题/速率限制 | 使用退避策略重试，并回退到仅使用 Google |
| URL 无效 | 输入格式错误 | 通过 `google_auth.validate_url()` 验证，并显示错误 |
| 非产品页面 | URL 是分类页面/主页 | 检测页面类型，并建议改用 `/seo ecommerce schema` |

---

## 输出模板

```
## E-commerce SEO Report: [URL or Keyword]

### Overall Score: XX/100

### Product Page SEO
- Schema Completeness: XX/100
- Title & Meta: XX/100
- Image Optimization: XX/100
- Content Quality: XX/100
- Internal Linking: XX/100

### Marketplace Intelligence (if DataForSEO available)
- Google Shopping Listings: N products found
- Price Range: $XX - $XX (median: $XX)
- Top Seller: [name] (XX% market share)
- Amazon Comparison: [available/not checked]

### Top Recommendations
1. [Critical] ...
2. [High] ...
3. [Medium] ...

Generate a PDF report? Use `/seo google report`
```