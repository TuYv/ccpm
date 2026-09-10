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
  version: "2.2.6"
  category: seo
---
# Hreflang 与国际 SEO

验证现有的 hreflang 实现，或为多语言和多地区网站生成正确的 hreflang 标签。支持 HTML、HTTP header 和 XML sitemap 实现。

## 验证检查

### 1. 自引用标签
- 每个页面都必须包含一个指向自身的 hreflang 标签
- 自引用 URL 必须与页面的 canonical URL 完全匹配
- 缺少自引用标签会导致 Google 忽略整个 hreflang 集合

### 2. 返回标签
- 如果页面 A 通过 hreflang 链接到页面 B，页面 B 必须链接回页面 A
- 每个 hreflang 关系都必须是双向的（A→B 和 B→A）
- 缺少返回标签会使两个页面的 hreflang 信号都失效
- 检查所有语言版本是否相互引用（完整网状结构）

### 3. x-default 标签
- 当存在选择器/回退 URL 时建议使用：用于指定不匹配的语言/地区所使用的回退页面
- 通常指向语言选择器页面或英文版本
- 每组替代页面中只能有一个 x-default
- 所有其他语言版本也必须包含返回该页面的标签

### 4. 语言代码验证
- 必须使用 ISO 639-1 两字母代码（例如 `en`、`fr`、`de`、`ja`）
- **可选的 ISO 15924 脚本子标签**是文档规定的官方脚本表示机制：`zh-Hant`（繁体）/ `zh-Hans`（简体）。脚本可以与地区组合，例如 `zh-Hans-US` 有效（语言 + 脚本 + 地区）。
- 常见错误：
  - 使用 `eng` 而不是 `en`（这是 ISO 639-2 代码，对 hreflang 无效）
  - 使用 `jp` 而不是 `ja`（日语的错误代码）
  - `zh` 有效，但对于特定脚本的页面来说含义不明确；针对脚本进行定位时，优先使用 `zh-Hans` 或 `zh-Hant`

### 5. 地区代码验证
- 可选的地区限定符使用 ISO 3166-1 Alpha-2（例如 `en-US`、`en-GB`、`pt-BR`）
- 格式：`language-REGION`（语言小写，地区大写）
- 单独使用国家代码无效，不能在没有语言的情况下指定地区（Google 给出的错误示例是 `be`，它实际上是白俄罗斯语的*语言*代码，而不是比利时）
- 常见错误：
  - 使用 `en-uk` 而不是 `en-GB`（UK 不是有效的 ISO 3166-1 地区代码）
  - 使用 `EU` / `UN` 作为地区（不是有效的 ISO 3166-1 值）
  - 使用 `es-LA`（拉丁美洲不是一个国家；应使用具体国家）
  - 在没有语言前缀的情况下使用地区代码

### 5b. 地理定位信号层级
- 实际的地区信号经验法则：**ccTLD > hreflang 注释 >
  server location/IP > addresses/language/currency/Business Profile**。不要将其表述为已确认的 Google 排名顺序。hreflang 是**提示，而非指令**。Google **会忽略**位置元标签和 HTML 地理定位属性。
- Search Console 的 **International Targeting 报告和手动国家定位设置已于 2022 年移除**，不要建议在 GSC 中设置国家定位；hreflang 是目前仍可使用的手段。

### 6. Canonical URL 对齐
- hreflang 标签只能出现在 canonical URL 上
- 如果页面的 `rel=canonical` 指向其他位置，则该页面上的 hreflang 会被忽略
- canonical URL 和 hreflang URL 必须完全匹配（包括末尾斜杠）
- 非 canonical 页面不应加入任何 hreflang 集合

### 7. 协议一致性
- hreflang 集中的所有 URL 必须使用相同的协议（HTTPS 或 HTTP）
- hreflang 集中混用 HTTP/HTTPS 会导致验证失败
- HTTPS 迁移后，将所有 hreflang 标签更新为 HTTPS

### 8. 跨域支持
- hreflang 支持不同域名之间的配置（例如 example.com 和 example.de）
- 跨域 hreflang 要求两个域名都添加返回标签
- 需要时，使用 Google Search Console 验证进行监控，或提交跨站点 sitemap
- 对于跨域设置，建议使用基于 sitemap 的实现

## 常见错误

| 问题 | 严重性 | 修复方法 |
|-------|----------|-----|
| 缺少指向自身的标签 | 严重 | 添加指向同一页面 URL 的 hreflang |
| 缺少返回标签（A→B，但没有 B→A） | 严重 | 为所有替代页面添加匹配的返回标签 |
| 需要回退行为时缺少 x-default | 中 | 添加指向回退页面/选择器页面的 x-default |
| 无效的语言代码（例如 `eng`） | 高 | 使用 ISO 639-1 双字母代码 |
| 无效的地区代码（例如 `en-uk`） | 高 | 使用 ISO 3166-1 Alpha-2 代码 |
| hreflang 位于非规范 URL 上 | 高 | 仅将 hreflang 移至规范 URL |
| URL 中的 HTTP/HTTPS 不匹配 | 中 | 将所有 URL 统一为 HTTPS |
| 末尾斜杠不一致 | 中 | 与规范 URL 格式完全匹配 |
| HTML 和 sitemap 中同时存在 hreflang | 低 | 选择一种方法（大型网站优先使用 sitemap） |
| 需要地区时仅使用语言代码 | 低 | 为面向特定地理区域的内容添加地区限定符 |

## 实现方法

### 方法 1：HTML Link 标签
适用于：每个页面包含少于 50 个语言/地区变体的网站。

```html
<link rel="alternate" hreflang="en-US" href="https://example.com/page" />
<link rel="alternate" hreflang="en-GB" href="https://example.co.uk/page" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

放置在 `<head>` 部分。每个页面都必须包含所有替代页面，包括自身。

### 方法 2：HTTP 标头
适用于：非 HTML 文件（PDF、文档）。

```
Link: <https://example.com/page>; rel="alternate"; hreflang="en-US",
      <https://example.com/fr/page>; rel="alternate"; hreflang="fr",
      <https://example.com/page>; rel="alternate"; hreflang="x-default"
```

通过服务器配置或 CDN 规则进行设置。

### 方法 3：XML Sitemap（大型网站推荐）
适用于：包含大量语言变体的网站、跨域设置，或包含 50 个以上页面的网站。

请参阅下方的 Hreflang Sitemap 生成部分。

### 方法比较
| 方法 | 最适用场景 | 优点 | 缺点 |
|--------|----------|------|------|
| HTML link 标签 | 小型网站（少于 50 个变体） | 易于实现，可在源代码中查看 | 会使 `<head>` 变得臃肿，难以在大规模场景下维护 |
| HTTP 标头 | 非 HTML 文件 | 适用于 PDF、图片 | 服务器配置复杂，无法在 HTML 中查看 |
| XML sitemap | 大型网站、跨域设置 | 可扩展、集中管理 | 页面上不可见，需要维护 sitemap |

## Hreflang 生成

### 流程
1. **检测语言**：扫描网站中的语言指示信息（URL 路径、子域名、TLD、HTML lang 属性）
2. **映射页面对应关系**：匹配不同语言/地区之间的对应页面
3. **验证语言代码**：根据 ISO 639-1 和 ISO 3166-1 验证所有代码
4. **生成标签**：为每个页面创建 hreflang 标签，包括自引用标签
5. **验证返回标签**：确认所有关系均为双向
6. **添加 x-default**：为每个页面集合设置回退页面
7. **输出**：生成实现代码（HTML、HTTP 标头或 sitemap XML）

## Hreflang Sitemap 生成

### 带 Hreflang 的 Sitemap
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
- 每个替代页面必须作为单独的 `<url>` 条目出现，并包含其完整集合
- 每个 sitemap 文件在以下限制中取先达到者进行拆分：50,000 个 URL 或未压缩时 50MB

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
- 添加缺失的实现
- 修正错误的代码
- 方法迁移建议（例如，对于大规模网站，从 HTML 迁移到 sitemap）

## 文化适配评估

分析多语言网站时，除了进行技术性的 hreflang 验证之外，还应评估内容是否针对每个目标市场进行了文化适配。

加载 `references/cultural-profiles.md`，获取预构建的配置文件（DACH、法语区、西语区、日本）。

**评估步骤：**
1. 识别所有语言版本及其目标市场
2. 加载相关的文化配置文件
3. 检查 CTA 是否符合文化预期（直接式与间接式）
4. 检查信任信号是否适合当地（认证、法律页面）
5. 检查本地化页面中是否存在外国品牌引用
6. 检查数字、日期和货币格式的一致性
7. 将文化适配问题标记为中等严重性

**输出：**每个语言版本的文化适配评分（0-100），并提供具体发现。

## 内容一致性审计

**命令：** `/seo hreflang audit <directory-or-url>`

审计网站或本地内容目录中所有语言版本之间的内容一致性。

加载 `references/content-parity.md`，获取完整的一致性矩阵和评分方法。

**检查内容：**
- 所有声明语言中的页面是否存在
- 章节结构是否等效（H2/H3 数量）
- SEO 元素一致性（标题、元描述、schema 本地化）
- 字数比例验证（DE 应比 EN 长 25-35%，JA 应比 EN 短 10-25%）
- 新鲜度跟踪（检测基于时间戳的过时翻译）
- 文化标记扫描（外国品牌、错误的法律引用、未翻译元素）

**输出：**包含每页评分的内容一致性矩阵表，以及按优先级排序的行动项。

## 区域格式验证

加载 `references/locale-formats.md`，获取每个区域设置对应的数字、日期、货币、地址和电话格式参考表。

**检查内容：**
- 数字格式一致性（例如，`de-DE` 页面上的 `"1,000.00"` 应为 `"1.000,00"`）
- 日期格式是否符合区域设置预期
- 货币符号及其位置是否适合目标市场
- 电话号码是否使用带有正确国家/地区代码的国际格式

## 参考文件

按需加载以下文件（启动时不要全部加载）：
- `references/cultural-profiles.md`：DACH、法语区、西班牙语区、日本的文化适配资料
- `references/locale-formats.md`：每个区域设置对应的数字、日期、货币、地址和电话格式表
- `references/content-parity.md`：内容一致性审计方法和评分标准

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 失败、连接被拒绝） | 清楚地报告错误。不要猜测网站结构。建议用户验证 URL 后重试。 |
| 未找到 hreflang 标签 | 报告缺少该标签。检查其他国际化信号（子目录、子域名、ccTLD），并建议采用适当的 hreflang 实现方式。 |
| 检测到无效的语言/区域代码 | 列出每个无效代码及其正确替代项。提供可直接实施的修正后 hreflang 标签集合。 |
| 语言没有可用的文化资料 | 使用 cultural-profiles.md 中的 Default Profile 检查清单。注明评估基于通用指南，而非预先构建的资料。 |
| 内容一致性目录为空 | 报告未找到内容文件。建议验证目录路径，或提供 URL 以进行实时网站分析。 |