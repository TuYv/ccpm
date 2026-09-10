---
name: seo-hreflang
description: >
  Hreflang and international SEO audit, validation, and generation. Detects
  common mistakes, validates language/region codes, and generates correct
  hreflang implementations. Use when user says "hreflang", "i18n SEO",
  "international SEO", "multi-language", "multi-region", or "language tags".
user-invocable: true
argument-hint: "[url]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.3.1"
  category: seo
---
# Hreflang 与国际 SEO

验证现有的 hreflang 实现，或为多语言和多地区网站生成正确的 hreflang 标签。
支持 HTML、HTTP 标头和 XML sitemap 实现。

## 验证检查

### 1. 自引用标签
- 每个页面都必须包含指向自身的 hreflang 标签
- 自引用 URL 必须与页面的规范 URL 完全匹配
- 缺少自引用标签会导致 Google 忽略整个 hreflang 集合

### 2. 返回标签
- 如果页面 A 通过 hreflang 链接到页面 B，页面 B 必须链接回页面 A
- 每个 hreflang 关系都必须是双向的（A→B 和 B→A）
- 缺少返回标签会使两个页面的 hreflang 信号都失效
- 检查所有语言版本是否相互引用（完整网格）

### 3. x-default 标签
- 当存在选择器/回退 URL 时建议使用：用于指定不匹配的语言/地区所使用的回退页面
- 通常指向语言选择器页面或英文版本
- 每组替代页面只能有一个 x-default
- 所有其他语言版本也必须包含返回标签

### 4. 语言代码验证
- 必须使用 ISO 639-1 双字母代码（例如：`en`、`fr`、`de`、`ja`）
- 文档规定且官方支持的脚本表示机制是**可选的 ISO 15924 脚本子标签**：
  `zh-Hant`（繁体）/ `zh-Hans`（简体）。脚本可以与地区组合，例如 `zh-Hans-US` 有效（语言 + 脚本 + 地区）。
- 常见错误：
  - 使用 `eng` 而不是 `en`（这是 ISO 639-2 代码，不适用于 hreflang）
  - 使用 `jp` 而不是 `ja`（日语的错误代码）
  - `zh` 有效，但对于特定脚本的页面来说含义不明确；针对脚本进行定位时，优先使用 `zh-Hans` 或 `zh-Hant`

### 5. 地区代码验证
- 可选的地区限定符使用 ISO 3166-1 Alpha-2（例如：`en-US`、`en-GB`、`pt-BR`）
- 格式：`language-REGION`（语言小写，地区大写）
- 单独使用国家代码无效，不能在没有语言的情况下指定地区（Google 给出的错误示例是 `be`，它实际上是白俄罗斯语的*语言*代码，而不是比利时）
- 常见错误：
  - 使用 `en-uk` 而不是 `en-GB`（UK 不是有效的 ISO 3166-1 地区代码）
  - 使用 `EU` / `UN` 作为地区（不是有效的 ISO 3166-1 值）
  - 使用 `es-LA`（拉丁美洲不是一个国家；应使用具体国家）
  - 缺少语言前缀的地区代码

### 5b. 地理定位信号层级
- 实际使用的地区信号启发式层级：**ccTLD > hreflang 注释 >
  服务器位置/IP > 地址/语言/货币/Business Profile**。不要将其描述为已确认的 Google 排名顺序。hreflang 是**提示，而非指令**。Google **会忽略**定位元标签和 HTML 地理定位属性。
- Search Console 的**国际定位报告和手动国家定位设置已于 2022 年移除**，**不要**建议在 GSC 中设置国家定位；hreflang 是目前仍可使用的手段。

### 5c. 特定地区的搜索单元（EEA、South Africa、Turkiye）
- Google 记录了仅在特定国家/地区提供的搜索体验：面向 EEA、South Africa 和 Turkiye 用户的酒店、航班、长途交通和产品查询中展示的**聚合商单元**、**供应商单元**及轮播（文档于 2026-09-08 添加）。每个单元的资格要求和参与方式均有单独文档说明；它们不是排名信号。
- 当网站通过 hreflang 变体服务这些地区时，请在报告中注明该企业是聚合商还是直接供应商，并指向相应地区的文档，以免客户对这些市场中不同的结果布局感到意外。

### 6. 规范 URL 一致性
- Hreflang 标签只能出现在规范 URL 上
- 如果页面的 `rel=canonical` 指向其他位置，该页面上的 hreflang 会被忽略
- 规范 URL 和 hreflang URL 必须完全匹配（包括尾部斜杠）
- 非规范页面不应包含在任何 hreflang 集合中

### 7. 协议一致性
- hreflang 集合中的所有 URL 必须使用相同协议（HTTPS 或 HTTP）
- hreflang 集合中混用 HTTP/HTTPS 会导致验证失败
- 迁移到 HTTPS 后，将所有 hreflang 标签更新为 HTTPS

### 8. 跨域支持
- Hreflang 可跨不同域名工作（例如，example.com 和 example.de）
- 跨域 hreflang 要求两个域名上都存在返回标签
- 必要时，使用 Google Search Console 验证进行监控，或提交跨站点站点地图
- 建议跨域设置使用基于站点地图的实现方式

## 常见错误

| 问题 | 严重程度 | 修复方法 |
|-------|----------|-----|
| 缺少自引用标签 | 严重 | 添加指向同一页面 URL 的 hreflang |
| 缺少返回标签（A→B 但没有 B→A） | 严重 | 在所有备用页面上添加匹配的返回标签 |
| 需要回退行为时缺少 x-default | 中等 | 添加指向回退/选择器页面的 x-default |
| 无效的语言代码（例如，`eng`） | 高 | 使用 ISO 639-1 双字母代码 |
| 无效的区域代码（例如，`en-uk`） | 高 | 使用 ISO 3166-1 Alpha-2 代码 |
| 非规范 URL 上存在 Hreflang | 高 | 仅将 hreflang 移至规范 URL |
| URL 中的 HTTP/HTTPS 不匹配 | 中等 | 将所有 URL 统一为 HTTPS |
| 尾部斜杠不一致 | 中等 | 完全匹配规范 URL 格式 |
| HTML 和站点地图中同时存在 Hreflang | 低 | 选择一种方法（大型站点推荐站点地图） |
| 需要时未指定区域的语言 | 低 | 为地理定向内容添加区域限定符 |

## 实现方法

### 方法 1：HTML 链接标签
最适合：每页语言/区域变体少于 50 个的站点。

```html
<link rel="alternate" hreflang="en-US" href="https://example.com/page" />
<link rel="alternate" hreflang="en-GB" href="https://example.co.uk/page" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

放置在 `<head>` 部分。每个页面都必须包含所有备用页面，包括自身。

### 方法 2：HTTP 标头
最适合：非 HTML 文件（PDF、文档）。

```
Link: <https://example.com/page>; rel="alternate"; hreflang="en-US",
      <https://example.com/fr/page>; rel="alternate"; hreflang="fr",
      <https://example.com/page>; rel="alternate"; hreflang="x-default"
```

通过服务器配置或 CDN 规则设置。

### 方法 3：XML 站点地图（推荐用于大型站点）
最适合：具有多种语言变体、跨域设置或超过 50 个页面的站点。

请参阅下方的 Hreflang 站点地图生成部分。

### 方法比较
| 方法 | 最适合 | 优点 | 缺点 |
|--------|----------|------|------|
| HTML 链接标签 | 小型站点（<50 个变体） | 易于实现，在源代码中可见 | 会使 `<head>` 膨胀，难以大规模维护 |
| HTTP 标头 | 非 HTML 文件 | 适用于 PDF、图像 | 服务器配置复杂，在 HTML 中不可见 |
| XML 站点地图 | 大型站点、跨域 | 可扩展、集中管理 | 页面中不可见，需要维护站点地图 |

## Hreflang 生成

### 流程
1. **检测语言**：扫描网站中的语言指标（URL 路径、子域名、TLD、HTML lang 属性）
2. **映射页面对应关系**：匹配不同语言/地区之间的对应页面
3. **验证语言代码**：根据 ISO 639-1 和 ISO 3166-1 验证所有代码
4. **生成标签**：为每个页面创建 hreflang 标签，包括自引用
5. **验证返回标签**：确认所有关系均为双向
6. **添加 x-default**：为每组页面设置回退页面
7. **输出**：生成实现代码（HTML、HTTP 标头或 sitemap XML）

## Hreflang Sitemap 生成

### 包含 Hreflang 的 Sitemap
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://example.com/page</loc>
    <xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/page" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
    <xhtml:link rel="alternate" hreflang="de" href="https://example.de/page" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/page" />
  </url>
  <url>
    <loc>https://example.com/fr/page</loc>
    <xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/page" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
    <xhtml:link rel="alternate" hreflang="de" href="https://example.de/page" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/page" />
  </url>
</urlset>
```

关键规则：
- 包含 `xmlns:xhtml` 命名空间声明
- 每个 `<url>` 条目必须包含所有语言替代页面（包括自身）
- 每个替代页面都必须作为单独的 `<url>` 条目出现，并包含其完整集合
- 在以下任一条件先达到时进行拆分：每个 sitemap 文件 50,000 个 URL 或未压缩时 50MB

## 输出

### Hreflang 验证报告

#### 摘要
- 扫描页面总数：XX
- 检测到的语言变体：XX
- 发现的问题：XX（严重：X，高：X，中：X，低：X）

#### 验证结果
| 语言 | URL | 自引用 | 返回标签 | x-default | 状态 |
|----------|-----|----------|-------------|-----------|--------|
| en-US | https://... | ✅ | ✅ | ✅ | ✅ |
| fr | https://... | ❌ | ⚠️ | ✅ | ❌ |
| de | https://... | ✅ | ❌ | ✅ | ❌ |

### 生成的 Hreflang 标签
- HTML `<link>` 标签（如果选择 HTML 方法）
- HTTP 标头值（如果选择标头方法）
- `hreflang-sitemap.xml`（如果选择 sitemap 方法）

### 建议
- 需要添加的缺失实现
- 需要修正的错误代码
- 方法迁移建议（例如，对于大规模网站从 HTML 迁移到 sitemap）

## 文化适配评估

分析多语言网站时，除了技术层面的 hreflang 验证，还要评估内容是否针对每个目标市场进行了文化适配。

加载 `references/cultural-profiles.md`，获取预构建的配置文件（DACH、法语区、西班牙语区、日本）。

**评估步骤：**
1. 识别所有语言版本及其目标市场
2. 加载相关文化配置文件
3. 检查 CTA 是否符合文化预期（直接或间接）
4. 检查信任信号是否符合当地情况（认证、法律页面）
5. 检查本地化页面中是否存在外国品牌引用
6. 检查数字、日期和货币格式的一致性
7. 将文化适配问题标记为中等严重性

**输出：**每个语言版本的文化适配分数（0-100），并附带具体发现。

## 内容一致性审计

**命令：** `/seo hreflang audit <directory-or-url>`

审计网站或本地内容目录中所有语言版本之间的内容一致性。

加载 `references/content-parity.md` 以获取完整的一致性矩阵和评分方法。

**检查内容：**
- 所有声明语言中的页面是否存在
- 章节结构等效性（H2/H3 数量）
- SEO 元素一致性（标题、meta、schema 本地化）
- 字数比例验证（DE 应比 EN 长 25-35%，JA 应比 EN 短 10-25%）
- 新鲜度跟踪（检测基于时间戳的过时翻译）
- 文化标记扫描（外国品牌、错误的法律引用、未翻译元素）

**输出：**包含每页分数的内容一致性矩阵表，以及按优先级排序的行动项。

## 地区格式验证

加载 `references/locale-formats.md`，获取每个地区的数字、日期、货币、地址和电话格式参考表。

**检查内容：**
- 数字格式一致性（例如，de-DE 页面中的 `"1,000.00"` 应为 `"1.000,00"`）
- 日期格式是否符合地区规范
- 货币符号及其位置是否适合目标市场
- 电话号码是否使用带有正确国家代码的国际格式

## 参考文件

按需加载以下文件（启动时不要全部加载）：
- `references/cultural-profiles.md`：DACH、法语区、西语区、日本的文化适配配置文件
- `references/locale-formats.md`：各地区的数字、日期、货币、地址和电话格式表
- `references/content-parity.md`：内容一致性审计方法和评分标准

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 失败、连接被拒绝） | 清楚地报告错误。不要猜测网站结构。建议用户验证 URL 后重试。 |
| 未找到 hreflang 标签 | 报告缺少该标签。检查其他国际化信号（子目录、子域名、ccTLD），并建议采用适当的 hreflang 实现方式。 |
| 检测到无效的语言/地区代码 | 列出每个无效代码及其正确替代项。提供可直接实施的已修正 hreflang 标签集。 |
| 没有适用于该语言的文化配置文件 | 使用 cultural-profiles.md 中的 Default Profile 检查清单。说明评估基于通用指南，而非预先构建的配置文件。 |
| 内容一致性目录为空 | 报告未找到内容文件。建议验证目录路径，或提供 URL 以进行实时网站分析。 |