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
  version: "2.3.1"
  category: seo
---
# 电商 SEO 分析

全面的产品页面优化、市场情报和竞争性定价分析。可独立运行（页面 SEO + schema），也可结合 DataForSEO Merchant API 获取实时 Google Shopping 和 Amazon 数据。

## 命令

| 命令 | 用途 | DataForSEO？ |
|---------|---------|-------------|
| `/seo ecommerce <url>` | 对产品页面或商店进行完整的电商 SEO 分析 | 可选 |
| `/seo ecommerce products <keyword>` | Google Shopping 竞争分析 | 必需 |
| `/seo ecommerce gaps <domain>` | 关键词差距分析：自然搜索与 Shopping 的可见性对比 | 必需 |
| `/seo ecommerce schema <url>` | 产品 schema 验证与增强 | 否 |

---

## 1. 产品页面分析（无需 DataForSEO）

抓取并解析任意产品页面，评估页面 SEO 质量。

### 工作流程

```
1. "${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run render_page.py <url> --mode auto → raw/rendered HTML
2. "${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run parse_html.py --url <url>   → SEO elements
3. Analyze product-specific signals (below)
```

### 产品 SEO 检查清单

#### Title 标签
- [ ] 包含主要产品关键词
- [ ] 包含品牌名称
- [ ] 少于 60 个字符（避免在 SERP 中被截断）
- [ ] 格式：`[Product Name] - [Key Feature] | [Brand]`

#### Meta Description
- [ ] 包含产品关键词 + 产品优势
- [ ] 包含价格或 “from $XX”（可激发对富摘要的兴趣）
- [ ] 包含行动号召（立即购买、购买、免费配送）
- [ ] 少于 155 个字符

#### Heading 结构
- [ ] 只有一个与主要产品名称匹配的 H1
- [ ] 使用 H2 表示：功能、规格、评价、相关产品
- [ ] 不同产品变体之间没有重复的 H1 标签

#### 产品图片
- [ ] Alt 文本包含产品名称 + 区分性特征
- [ ] 文件名具有描述性（不要使用 `IMG_001.jpg`）
- [ ] 提供 WebP 格式（并以 JPEG 作为回退格式）
- [ ] 每个产品至少包含 3 张图片（主图、细节图、生活方式图）
- [ ] 图片尺寸 >= 800px，以符合 Google Shopping 资格要求
- [ ] 仅对首屏以下的图片启用延迟加载

#### 内部链接
- [ ] 面包屑导航：主页 > 类别 > 子类别 > 产品
- [ ] 相关产品部分（交叉销售 / 向上销售）
- [ ] 使用包含丰富关键词的锚文本链接回类别页面
- [ ] 如果评价页面单独存在，评价部分应链接到完整评价页面

#### 内容质量
- [ ] 独特的产品描述（不是直接复制制造商文案）
- [ ] 产品描述正文词数 >= 200
- [ ] 提供规格表（而不只是 prose）
- [ ] 页面上包含用户评价（UGC 信号）

### 评分

| 类别 | 权重 | 标准 |
|----------|---------|----------|
| Schema 完整性 | 25% | 必需 + 推荐的 Product 字段 |
| Title 与 meta | 15% | 关键词位置、长度、格式 |
| 图片优化 | 20% | Alt 文本、格式、尺寸、数量 |
| 内容质量 | 20% | 独特描述、规格、评价 |
| 内部链接 | 10% | 面包屑、相关产品、类别 |
| 技术因素 | 10% | 页面速度、移动端渲染、canonical |

---

## 2. Google Shopping 智能分析（DataForSEO Merchant API）

基于 Google Shopping 结果进行实时竞争分析。

### 成本控制（强制要求）

在每次 Merchant API 调用之前：
```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run dataforseo_costs.py check merchant_google_products_search
```

- `"status": "approved"` -- 继续执行
- `"status": "needs_approval"` -- 显示成本并询问用户
- `"status": "blocked"` -- 停止执行并通知用户

每次调用之后：
```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run dataforseo_costs.py log merchant_google_products_search <cost>
```

### 工作流程

```bash
# Product search: who sells what at what price
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run dataforseo_merchant.py search "<keyword>" --marketplace google

# Seller analysis: merchant ratings and dominance
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run dataforseo_merchant.py sellers "<keyword>"

# Normalize results for analysis
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run dataforseo_normalize.py results.json --module merchant
```

### 分析输出

#### 价格智能分析
- 价格分布：最小值、最大值、中位数、P25、P75
- 价格异常值（距中位数超过 2 个标准差）
- 价格与评分的相关性
- 货币标准化为 USD（或用户指定的货币）

#### 卖家格局
- 按商品列表数量排名的前 10 位卖家
- 商家评分分布
- 免运费的普及率
- 新卖家与成熟卖家的对比

#### 商品列表质量
- 顶部商品列表中的标题关键词模式
- 平均评分和评论数量基准
- 每个商品列表的图片数量
- 可用状态分布

加载 `references/marketplace-endpoints.md` 以获取完整的 API 参数详情。

---

## 3. Amazon Marketplace（DataForSEO）

比较 Google Shopping 和 Amazon，获取跨市场智能分析。

### 成本控制（强制要求）

```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run dataforseo_costs.py check merchant_amazon_products_search
```

Amazon 端点位于 `warn_endpoints` 集合中，始终需要用户批准。

### 工作流程

```bash
# Amazon product search
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run dataforseo_merchant.py search "<keyword>" --marketplace amazon

# Cross-marketplace comparison
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run dataforseo_merchant.py compare "<keyword>"
```

### 跨市场报告

| 指标 | Google Shopping | Amazon |
|--------|---------------|--------|
| 平均价格 | $ | $ |
| 中位数评分 | X.X | X.X |
| 平均评论数量 | N | N |
| 顶级卖家份额 | % | % |
| 免运费比例 | % | % |

---

## 4. 市场关键词缺口

识别自然搜索与 Shopping 可见性之间的不匹配。

### 工作流程

1. 通过 seo-dataforseo 获取自然搜索排名：
   针对域名使用 `dataforseo_labs_google_ranked_keywords`
2. 通过 Merchant API 获取 Google Shopping 展示情况：
   针对排名靠前的自然搜索关键词使用 `merchant_google_products_search`
3. 交叉参考结果

### 缺口类型

| 缺口类型 | 含义 | 操作 |
|----------|---------|--------|
| **仅自然搜索** | 在自然搜索中排名，但没有 Shopping 广告 | 创建 Google Merchant Center feed，针对这些关键词进行竞价 |
| **仅 Shopping** | 有 Shopping 可见性，但自然搜索较弱或没有自然搜索排名 | 针对这些关键词创建内容（购买指南、对比页面） |
| **两者均有** | 在两个渠道中均可见 | 进行优化：确保价格一致性，完善 schema |
| **两者均无** | 在任何一个渠道中都没有可见性 | 除非搜索量较高，否则优先级较低 |

### 关键词差距分析：example.com

### 机会：自然搜索 → 购物（12 个关键词）
| 关键词 | 自然搜索排名 | 搜索量 | CPC | 建议操作 |
|---------|------------|--------|-----|-------------------|

### 机会：购物 → 自然搜索（8 个关键词）
| 关键词 | 购物排名 | 搜索量 | CPC | 所需内容类型 |
|---------|-------------|--------|-----|-------------------|


---

## 5. 产品结构化数据增强

按照 Google 当前要求验证并生成 Product 结构化数据。

### 已确认的必需属性（Google Merchant）

已确认的必需字段为 `name`、`image` 和 `offers`；对于 Merchant listings，应使用 `Offer`，而不是 `AggregateOffer`。

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
- `gtin13` / `gtin14` / `mpn` -- 全球贸易项目标识符
- `aggregateRating` -- 星级评分 + 评论数量
- `review` -- 单条评论（至少 1 条）
- `color`、`material`、`size` -- 变体属性
- `shippingDetails` -- 包含费率和配送时间的 ShippingDetails（也支持通过 Merchant Center 级别的 `ShippingService` 设置配送；无需 Merchant Center 账号，也可以在 Search Console 中设置配送和退货）
- `hasMerchantReturnPolicy` -- 包含类型和天数的 MerchantReturnPolicy
- `hasAdultConsideration` -- **成人导向产品必需**（于 2026-05-20 添加到 Product variant / Merchant listing）；Google 搜索仅支持值 `https://schema.org/SexualContentConsideration`
- `category` -- `Text`、`CategoryCode` 或混合两者的数组。对于商家定义的产品类型，使用自定义
  文本；对于 Google 产品类别，使用包含 Google
  分类法 URL 和 `codeValue` 的 `CategoryCode`。

### 验证规则

1. `price` 必须是数字字符串，不能是 "$29.99"（不得包含货币符号）
2. `availability` 必须使用完整的 Schema.org URL 枚举值
3. `image` 应为包含至少 1 个高分辨率图片 URL 的数组
4. `priceCurrency` 必须是 ISO 4217（USD、EUR、GBP）
5. 如果存在 `brand`，则 `brand.name` 不得为空或为 "N/A"
6. 促销期间使用 `validFrom` 加上 `validThrough` 或
   `priceValidUntil`，格式为 ISO 8601。已知时间和时区时应将其包含在内。
7. 如果存在 `aggregateRating`：则必须包含 `ratingValue` 和 `reviewCount`
8. 不要在可见内容或结构化数据中包含虚假评论或未披露的激励性评论。应清晰且醒目地披露激励信息。

### 结构化数据评分

| 完整度 | 分数 |
|-------------|-------|
| 所有必需字段 | 50/100 |
| + aggregateRating | 65/100 |
| + sku/gtin/mpn | 75/100 |
| + shippingDetails | 85/100 |
| + merchantReturnPolicy | 90/100 |
| + 评论（3 条以上） | 100/100 |

---

## 跨 Skill 集成

| 技能 | 集成点 |
|-------|------------------|
| **seo-schema** | 委托生成 Product schema；复用验证逻辑 |
| **seo-images** | 产品图片审计（替代文本、格式、尺寸），以及为 AI 生成的产品图片添加 `DigitalSourceType: TrainedAlgorithmicMedia` IPTC 标签（Merchant Center 要求） |
| **seo-content** | 产品描述的 E-E-A-T 和独特性分析 |
| **seo-dataforseo** | 用于差距分析的自然关键词排名 |
| **seo-technical** | 产品页面的 Core Web Vitals（首屏图片的 LCP） |
| **seo-hreflang** | 区域特定的结果单元：EEA、南非和土耳其的产品查询可以显示供应商单元和轮播图，并有各自的资格规则（记录于 2026-09-08） |
| **seo-google** | 产品 URL 的 GSC 索引状态和 Performance 数据（**不是** Merchant Center feed 验证；该验证在 Merchant Center / **Merchant API** 中完成；旧版 Shopping Content API 将于 2026-08-18 停止服务） |

## UCP：通用商务协议（已上线）

由 Google 发起的开放标准（与 Shopify、Etsy、Wayfair、Target、Walmart 共同开发；支付合作方包括 Visa/Mastercard/Stripe/Adyen/Amex），用于让 AI agent 在无需一次性集成的情况下发现商家、与商家协商并完成交易。Google 确认已在 Search 的 AI Mode 中为对话式购买提供首个参考实现。更广泛的 Universal Cart 发布细节来自 Google I/O 2026 主题演讲的报道；Google 官方来源尚未确认。ucp.dev 将 **2026-04-08** 列为其**基于日期的版本方案**中的最新版本，而不是 `1.0`；有两种集成路径：**Native**（默认）和 **Embedded**（经批准的商家）。该协议与 **AP2**（据报道正逐步转向 FIDO 治理）配合使用。规范地址：developers.google.com/merchant/ucp 和 ucp.dev。

已经使用 **Google Merchant Center** 且 Product schema 完整的商家，可以在 `/.well-known/ucp` 声明 UCP 配置文件，其中列出功能（`dev.ucp.shopping.checkout`、`.fulfillment`、`.discount`）。有关审计标准、功能示例以及与 AP2（Agent Payments Protocol）的关系，请参阅 `references/ucp-universal-commerce-protocol.md`。

### 审计命令

```bash
# Discover and validate the UCP profile
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run ucp_check.py https://store.example.com --json

# With endpoint reachability probes (HEAD each declared capability)
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run ucp_check.py https://store.example.com --probe-endpoints --json
```

该脚本返回：配置文件是否存在、版本、已声明的功能、结构问题（缺少字段、未知的功能 ID），以及（使用 `--probe-endpoints` 时）每个端点的可达性。SSRF 阻止的端点会被明确报告。缺少配置文件会被报告为机会，而不是失败。UCP 本身已经上线；尚处早期阶段的是商家的广泛采用。将字面值 `"version": "1.0"` 标记为无效（UCP 版本采用基于日期的格式，例如 `2026-04-08`）。

---

## 错误处理

| 错误 | 原因 | 响应 |
|-------|-------|----------|
| 未找到 Product schema | 页面缺少 JSON-LD | 分析页面内容，生成推荐的 schema |
| 缺少 DataForSEO 凭据 | 未设置环境变量 | 在没有 marketplace 数据的情况下运行分析，并注明限制 |
| 成本检查被阻止 | 已超出每日预算 | 告知用户，并提供仅使用免费数据的分析选项 |
| Shopping 结果为空 | 该关键词没有产品 | 建议使用更宽泛的关键词，检查位置设置 |
| Amazon API 超时 | 网络/速率限制 | 使用退避策略重试，回退到仅使用 Google |
| URL 无效 | 输入格式错误 | 通过 `google_auth.validate_url()` 验证，显示错误 |
| 非产品页面 | URL 是分类页/主页 | 检测页面类型，建议改用 `/seo ecommerce schema` |

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

生成 PDF 报告？使用 `/seo google report`