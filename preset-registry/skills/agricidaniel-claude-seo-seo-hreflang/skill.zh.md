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
  version: "2.2.5"
  category: seo
---
# Hreflang 与国际 SEO

验证现有的 hreflang 实现，或为多语言和多地区网站生成正确的 hreflang 标签。支持 HTML、HTTP 标头和 XML 站点地图实现。

## 验证检查

### 1. 自引用标签
- 每个页面都必须包含一个指向自身的 hreflang 标签
- 自引用 URL 必须与页面的规范 URL 完全匹配
- 缺少自引用标签会导致 Google 忽略整个 hreflang 集合

### 2. 返回标签
- 如果页面 A 通过 hreflang 链接到页面 B，页面 B 也必须链接回页面 A
- 每个 hreflang 关系都必须是双向的（A→B 和 B→A）
- 缺少返回标签会使两个页面的 hreflang 信号都失效
- 检查所有语言版本是否互相引用（全互联）

### 3. x-default 标签
- 当存在选择器/后备 URL 时，建议使用：它会将该页面指定为未匹配语言/地区的后备页面
- 通常指向语言选择器页面或英语版本
- 每组替代页面只能有一个 x-default
- 所有其他语言版本也必须包含指向它的返回标签

### 4. 语言代码验证
- 必须使用 ISO 639-1 双字母代码（例如 `en`、`fr`、`de`、`ja`）
- **可选的 ISO 15924 文字体系子标签**是用于指定文字体系的、有文档记录的官方机制：`zh-Hant`（繁体）/ `zh-Hans`（简体）。文字体系可与地区组合，例如 `zh-Hans-US` 是有效的（语言 + 文字体系 + 地区）。
- 常见错误：
  - 使用 `eng` 而不是 `en`（ISO 639-2，不适用于 hreflang）
  - 使用 `jp` 而不是 `ja`（错误的日语代码）
  - `zh` 有效，但对于特定文字体系的页面含义不明确；定位特定文字体系时，优先使用 `zh-Hans` 或 `zh-Hant`

### 5. 地区代码验证
- 可选的地区限定符使用 ISO 3166-1 Alpha-2（例如 `en-US`、`en-GB`、`pt-BR`）
- 格式：`language-REGION`（语言使用小写，地区使用大写）
- **仅使用国家/地区代码是无效的**，不能在没有语言的情况下指定地区（Google 自己给出的错误示例是 `be`，它实际上是白俄罗斯语的*语言*代码，而不是比利时）。
- 常见错误：
  - 使用 `en-uk` 而不是 `en-GB`（UK 不是有效的 ISO 3166-1 地区代码）
  - 使用 `EU` / `UN` 作为地区（不是有效的 ISO 3166-1 值）
  - `es-LA`（拉丁美洲不是一个国家；应使用具体国家）
  - 地区代码没有语言前缀

### 5b. 地理定位信号层级
- 实用的区域设置信号启发式排序：**ccTLD > hreflang 注释 > 服务器位置/IP > 地址/语言/货币/商家资料**。不要将其表述为 Google 已确认的排名顺序。hreflang 是一种**提示，而非指令**。Google 会**忽略**位置元标签和 HTML 地理定位属性。
- Search Console 的**国际定位报告和手动国家/地区定位设置已于 2022 年移除**，**不要**建议在 GSC 中设置国家/地区定位；hreflang 是目前剩余的手段。

### 6. 规范 URL 对齐
- Hreflang 标签只能出现在规范 URL 上
- 如果页面的 `rel=canonical` 指向其他位置，则该页面上的 hreflang 会被忽略
- 规范 URL 与 hreflang URL 必须完全匹配（包括末尾斜杠）
- 非规范页面不应包含在任何 hreflang 集合中

### 7. 协议一致性
- hreflang 集合中的所有 URL 必须使用相同的协议（HTTPS 或 HTTP）
- hreflang 集合中混用 HTTP/HTTPS 会导致验证失败
- 迁移到 HTTPS 后，将所有 hreflang 标签更新为 HTTPS

### 8. 跨域支持
- Hreflang 可跨不同域名使用（例如 example.com 和 example.de）
- 跨域 hreflang 要求两个域名上都有返回标签
- 需要时，使用 Google Search Console 验证进行监控，或提交跨站点站点地图
- 对于跨域配置，建议使用基于站点地图的实现方式

## 常见错误

| 问题 | 严重程度 | 修复方法 |
|-------|----------|-----|
| 缺少自引用标签 | 严重 | 添加指向同一页面 URL 的 hreflang |
| 缺少返回标签（A→B，但没有 B→A） | 严重 | 在所有替代页面上添加匹配的返回标签 |
| 需要回退行为时缺少 x-default | 中等 | 添加指向回退页面/选择器页面的 x-default |
| 无效的语言代码（例如 `eng`） | 高 | 使用 ISO 639-1 双字母代码 |
| 无效的地区代码（例如 `en-uk`） | 高 | 使用 ISO 3166-1 Alpha-2 代码 |
| 在非规范 URL 上使用 Hreflang | 高 | 仅将 hreflang 移至规范 URL |
| URL 中的 HTTP/HTTPS 不匹配 | 中等 | 将所有 URL 统一为 HTTPS |
| 尾部斜杠不一致 | 中等 | 与规范 URL 格式完全匹配 |
| 同时在 HTML 和站点地图中使用 Hreflang | 低 | 选择一种方法（大型网站首选站点地图） |
| 需要地区信息时仅使用语言代码 | 低 | 为针对特定地理区域的内容添加地区限定符 |

## 实现方法

### 方法 1：HTML Link 标签
最适合：每个页面的语言/地区变体少于 50 个的网站。

```html
<link rel="alternate" hreflang="en-US" href="https://example.com/page" />
<link rel="alternate" hreflang="en-GB" href="https://example.co.uk/page" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

放置在 `<head>` 部分。每个页面都必须包含所有替代页面，包括其自身。

### 方法 2：HTTP Headers
最适合：非 HTML 文件（PDF、文档）。

```
Link: <https://example.com/page>; rel="alternate"; hreflang="en-US",
      <https://example.com/fr/page>; rel="alternate"; hreflang="fr",
      <https://example.com/page>; rel="alternate"; hreflang="x-default"
```

通过服务器配置或 CDN 规则进行设置。

### 方法 3：XML Sitemap（推荐用于大型网站）
最适合：拥有大量语言变体、跨域配置或 50 个以上页面的网站。

请参阅下方的 Hreflang 站点地图生成部分。

### 方法比较
| 方法 | 最适合 | 优点 | 缺点 |
|--------|----------|------|------|
| HTML link 标签 | 小型网站（少于 50 个变体） | 易于实现，可在源代码中看到 | 会使 `<head>` 臃肿，难以进行大规模维护 |
| HTTP headers | 非 HTML 文件 | 适用于 PDF、图像 | 服务器配置复杂，在 HTML 中不可见 |
| XML sitemap | 大型网站、跨域配置 | 可扩展，集中式管理 | 在页面上不可见，需要维护站点地图 |

## Hreflang 生成

### 流程
1. **检测语言**：扫描网站中的语言标识（URL 路径、子域名、TLD、HTML lang 属性）
2. **映射对应页面**：匹配不同语言/地区之间的对应页面
3. **验证语言代码**：根据 ISO 639-1 和 ISO 3166-1 验证所有代码
4. **生成标签**：为每个页面创建 hreflang 标签，包括自引用标签
5. **验证返回标签**：确认所有关系均为双向
6. **添加 x-default**：为每组页面设置后备页面
7. **输出**：生成实施代码（HTML、HTTP 标头或站点地图 XML）

## Hreflang 站点地图生成

### 包含 Hreflang 的站点地图
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
- 每个 `<url>` 条目都必须包含所有语言的替代版本（包括自身）
- 每个替代版本都必须作为单独的 `<url>` 条目出现，并包含其自身完整的替代版本集合
- 当达到以下任一限制时进行拆分：每个站点地图文件包含 50,000 个 URL，或未压缩大小达到 50MB

## 输出

### Hreflang 验证报告

#### 摘要
- 扫描的页面总数：XX
- 检测到的语言版本：XX
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
- `hreflang-sitemap.xml`（如果选择站点地图方法）

### 建议
- 需要补充的缺失实施项
- 需要修正的错误代码
- 方法迁移建议（例如，为提高可扩展性，从 HTML 迁移到站点地图）

## 文化适配评估

分析多语言网站时，除了进行 hreflang 技术验证，还应评估内容是否针对各个目标市场进行了文化适配。

加载 `references/cultural-profiles.md` 以使用预构建的文化档案（DACH、法语地区、西班牙语地区、日本）。

**评估步骤：**
1. 识别所有语言版本及其目标市场
2. 加载相关的文化档案
3. 检查 CTA 是否符合文化预期（直接与间接）
4. 检查信任信号是否适合相应地区（认证、法律页面）
5. 检查本地化页面上是否存在外国品牌引用
6. 检查数字、日期和货币格式的一致性
7. 将文化适配问题标记为中等严重程度

**输出：** 每个语言版本的文化适配评分（0-100），并附具体发现。

## 内容对等性审计

**命令：** `/seo hreflang audit <directory-or-url>`

审计网站或本地内容目录中所有语言版本的内容对等性。

加载 `references/content-parity.md`，获取完整的对等性矩阵和评分方法。

**检查内容：**
- 所有已声明语言中是否都存在相应页面
- 章节结构是否对等（H2/H3 数量）
- SEO 元素是否对等（标题、元描述、schema 本地化）
- 验证字数比例（DE 应比 EN 长 25-35%，JA 应比 EN 短 10-25%）
- 内容新鲜度跟踪（通过时间戳检测过时的翻译）
- 文化标记扫描（外国品牌、错误的法律引用、未翻译元素）

**输出：** 包含各页面评分和按优先级排序的行动项的对等性矩阵表。

## 地区格式验证

加载 `references/locale-formats.md`，获取各地区的数字、日期、货币、地址和电话格式参考表。

**检查内容：**
- 数字格式是否一致（例如，de-DE 页面上的 "1,000.00" 应为 "1.000,00"）
- 日期格式是否符合地区预期
- 货币符号及其位置对于目标市场是否正确
- 电话号码是否使用带有正确国家/地区代码的国际格式

## 参考文件

根据需要按需加载（启动时不要全部加载）：
- `references/cultural-profiles.md`：DACH、法语区、西班牙语区和日本的文化适配档案
- `references/locale-formats.md`：各地区的数字、日期、货币、地址和电话格式表
- `references/content-parity.md`：内容对等性审计方法和评分标准

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS 解析失败、连接被拒绝） | 清晰地报告错误。不要猜测网站结构。建议用户验证 URL 后重试。 |
| 未找到 hreflang 标签 | 报告标签缺失。检查其他国际化信号（子目录、子域名、ccTLD），并推荐适当的 hreflang 实现方法。 |
| 检测到无效的语言/地区代码 | 列出每个无效代码及其正确替代项。提供一组可直接实施的修正后 hreflang 标签。 |
| 没有适用于该语言的文化档案 | 使用 cultural-profiles.md 中的默认档案检查清单。注明该评估基于通用准则，而非预构建档案。 |
| 内容对等性目录为空 | 报告未找到任何内容文件。建议验证目录路径，或提供 URL 以分析线上网站。 |