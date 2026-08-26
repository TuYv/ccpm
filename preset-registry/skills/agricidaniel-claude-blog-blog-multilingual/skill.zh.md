---
name: blog-multilingual
description: >
  One-command multilingual blog creation. Writes a blog post, translates it
  into user-specified languages, applies cultural adaptation, and emits
  hreflang tags, sitemap entries, and a CMS-ready language map. The complete
  write-to-publish pipeline for international content. Orchestrates blog-write,
  blog-translate, blog-localize, and (optionally) seo-hreflang.
  Use when user says "multilingual blog", "blog multilingual", "write in
  multiple languages", "international blog", "mehrsprachiger Blog", "blog
  multilingue", "blog multilingue", "create blog in German and French".
user-invokable: true
argument-hint: "<topic> --languages <comma-separated-codes>"
license: MIT
compatibility: Requires claude-blog (blog-write). Optional integration with claude-seo (seo-hreflang) for richer hreflang validation.
metadata:
  author: AgriciDaniel
  version: "2.2.0"
  category: blog
---
# 博客多语言，一条命令完成国际化发布

旗舰级多语言编排器。将博客撰写、翻译、文化适配和完整的国际 SEO 集成到一条命令中。  
为每种目标语言生成可直接发布的博客文章，并包含 hreflang 标签、本地化 JSON-LD schema 以及 CMS 集成元数据。

> 改编自 Chris Mueller 的 `claude-blog-multilingual`（AI Marketing Hub  
> Pro Hub Challenge 提交作品，2026 年 3 月，评分 85/100，熟练级）。  
> 原始项目：https://github.com/Chriss54/multilingual-int  
> 此移植版本移除了审计中指出的原始 `curl | bash` 安装器和凭据处理，将其集成为核心技能，并使用 `blog-translate/references/` 下共享的文化适配参考资料。

## 依赖项

由此编排器在内部调用：

| 组件 | 来源 | 必需 |
|-----------|--------|----------|
| `blog-write` | claude-blog（此插件） | 是 |
| `blog-translate` | claude-blog（此插件） | 是 |
| `blog-localize` | claude-blog（此插件） | 是（启用 `--localize` 时，默认为启用） |
| `seo-hreflang` | claude-seo（同级插件） | 否，回退到自包含生成器 |

如果未安装 `seo-hreflang`，编排器会使用其自身的最小生成器（见下方阶段 5）生成 hreflang 标签，并在交付摘要中说明这一限制。在这种情况下，hreflang 验证仅限于结构验证，而不是 `seo-hreflang` 所提供的更深入验证。

## 命令语法

```
/blog multilingual <topic> --languages <lang1,lang2,...> [--source <lang>] [--no-localize] [--format <md|mdx|html>]
```

| 参数 | 必需 | 默认值 | 描述 |
|----------|----------|---------|-------------|
| `<topic>` | 是 | 必需 | 博客主题或工作标题 |
| `--languages` | 是 | 必需 | 以逗号分隔、兼容 Google 的 hreflang 标签（例如 `de,fr,es-MX,ja,pt-BR`） |
| `--source` | 否 | `en` | 用于撰写原文的源语言 |
| `--no-localize` | 否 | 关闭 | 跳过文化适配（仅翻译） |
| `--format` | 否 | 自动 | 输出格式：`md`、`mdx` 或 `html` |

如果缺少 `--languages`，请在执行任何操作前询问用户一次：  
“博客应该发布为哪些语言？请提供以逗号分隔的 hreflang 标签（例如 `de,fr,es-MX,ja,pt-BR`）。文章将首先以 `<source>` 撰写，然后进行翻译。”

## 工作流程

### 阶段 1：配置

1. 解析参数。提取主题、目标语言、源语言和格式。
2. 使用 `blog-translate`、`blog-localize` 和 `blog-locale-audit` 所采用的共享多语言区域设置规则，验证每个语言代码：ISO 639-1 语言代码必须为小写，可选的 ISO 15924 脚本代码必须为标题大小写，可选的 ISO 3166-1 Alpha-2 区域代码必须为大写。对于 `es`、`pt` 和 `zh` 等存在歧义的仅语言目标，要求提供区域代码或明确的中性模式。
3. 从项目中检测输出格式（前置元数据约定、文件扩展名、框架提示），或使用 `--format`。
4. 确定源语言。如果某个目标语言等于 `--source`，则将其从翻译列表中移除，并显示通知。
5. 在当前工作目录内创建输出目录：
   ```
   multilingual/
     {source-lang}/
     {lang-1}/
     {lang-2}/
     ...
   ```
   将所有输出保留在项目根目录内；不要写入 cwd 之外的目录。

进度：`Phase 1: Configuration complete, [N] languages selected ([codes])`

### Phase 2：撰写原始博客文章

调用 `blog-write` 子技能（通过 `/blog write` 路由，以便应用所有现有规则：模板自动选择、带来源的统计数据、引用摘要、Article schema 优先级、仅在存在可见 FAQ 内容时将 FAQPage 作为实体信号、内部链接区域、图表、图片嵌入）。传入主题以及用户提供的任何博客撰写参数。

将原始文章保存至 `multilingual/{source-lang}/{slug}.{ext}`。

进度：`Phase 2: Original written, multilingual/{source-lang}/{slug}.{ext}`

### Phase 3：翻译为所有目标语言

针对每种目标语言，调用 `blog-translate`：

- 输入：Phase 2 生成的原始博客文章。
- 目标：指定的语言代码。
- 在运行时支持的情况下并行运行各目标（每种语言使用一个 Task），以减少总耗时。

将翻译保存至 `multilingual/{lang}/{localized-slug}.{ext}`。

进度：每种语言对应 `Phase 3: Translating to [lang] ([X]/[N])`，然后显示
`Phase 3: All translations complete`。

### Phase 4：文化适配

如果未设置 `--no-localize`，则对每篇已翻译文章调用 `blog-localize`：

- 输入：已翻译的博客文章。
- 区域设置：目标语言或地区代码。
- 并行运行。

仅在解析出 `multilingual/` 内的生成路径、拒绝符号链接并在覆盖时创建备份后，才应用本地化输出。
本地化工具会替换品牌示例、调整 CTA、替换法律引用并调整正式程度。完整的适配流程请参阅
`../blog-localize/SKILL.md`。

进度：`Phase 4: Cultural adaptation complete for [N] languages`。

### Phase 5：国际 SEO 生成

生成三个工件以及本地化 schema。如果已安装来自 claude-seo 的 `seo-hreflang` 技能，则将验证委托给该技能。否则使用下面的自包含生成器。

#### 5a. Hreflang 标签（HTML）

可直接复制粘贴到 `<head>` 中的标签：

```html
<!-- Hreflang tags. Paste into <head> of each language version. -->
<link rel="alternate" hreflang="{source}" href="https://example.com/{source-url}" />
<link rel="alternate" hreflang="{lang-1}" href="https://example.com/{lang-1-url}" />
<link rel="alternate" hreflang="{lang-2}" href="https://example.com/{lang-2-url}" />
<link rel="alternate" hreflang="x-default" href="https://example.com/{fallback-url}" />
```

规则（与 `seo-hreflang` 保持一致）：

- 每个页面都引用所有替代版本，包括自身（自引用）。
- 每个 `href`（包括 `x-default`）都必须是完整的绝对 `https://...` URL。
- `x-default` 指向未匹配语言的备用页面，例如全局语言选择器或默认市场页面。不必指向源语言版本。
- 所有 URL 使用相同的协议（HTTPS）和尾部斜杠约定。
- 双向：每种关系都必须是相互对应的。

保存至 `multilingual/hreflang-tags.html`。

#### 5b. Hreflang Sitemap 片段

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://example.com/{source-url}</loc>
    <xhtml:link rel="alternate" hreflang="{source}" href="https://example.com/{source-url}" />
    <xhtml:link rel="alternate" hreflang="{lang-1}" href="https://example.com/{lang-1-url}" />
    <xhtml:link rel="alternate" hreflang="{lang-2}" href="https://example.com/{lang-2-url}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/{fallback-url}" />
  </url>
  <url>
    <loc>https://example.com/{lang-1-url}</loc>
    <xhtml:link rel="alternate" hreflang="{source}" href="https://example.com/{source-url}" />
    <xhtml:link rel="alternate" hreflang="{lang-1}" href="https://example.com/{lang-1-url}" />
    <xhtml:link rel="alternate" hreflang="{lang-2}" href="https://example.com/{lang-2-url}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/{fallback-url}" />
  </url>
  <url>
    <loc>https://example.com/{lang-2-url}</loc>
    <xhtml:link rel="alternate" hreflang="{source}" href="https://example.com/{source-url}" />
    <xhtml:link rel="alternate" hreflang="{lang-1}" href="https://example.com/{lang-1-url}" />
    <xhtml:link rel="alternate" hreflang="{lang-2}" href="https://example.com/{lang-2-url}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/{fallback-url}" />
  </url>
</urlset>
```

为每个区域设置生成一个 `<url>` 块。每个块都必须包含针对每个区域设置的完全相同的完整 `<xhtml:link>` alternate 集合，以及自身链接和可选的 `x-default`，并使用完整限定的 `https://...` URL。

保存到 `multilingual/hreflang-sitemap.xml`。

#### 5c. Hreflang 映射（JSON）

供 CMS 集成使用的机器可读映射：

```json
{
  "sourceSlug": "how-to-avoid-ai-slop",
  "sourceLanguage": "en",
  "generatedDate": "YYYY-MM-DD",
  "versions": [
    {
      "lang": "en",
      "locale": "en",
      "hreflang": "en",
      "slug": "how-to-avoid-ai-slop",
      "file": "en/how-to-avoid-ai-slop.md",
      "url": "https://example.com/en/how-to-avoid-ai-slop/",
      "canonical": "https://example.com/en/how-to-avoid-ai-slop/",
      "xDefault": true,
      "title": "How to Avoid AI Slop in 2026",
      "description": "..."
    },
    {
      "lang": "de",
      "locale": "de-DE",
      "hreflang": "de-DE",
      "slug": "wie-man-ki-slop-vermeidet",
      "file": "de/wie-man-ki-slop-vermeidet.md",
      "url": "https://example.com/de/wie-man-ki-slop-vermeidet/",
      "canonical": "https://example.com/de/wie-man-ki-slop-vermeidet/",
      "xDefault": false,
      "title": "KI-Slop vermeiden in 2026",
      "description": "..."
    }
  ],
  "hreflang": {
    "method": "html",
    "x-default": "https://example.com/"
  }
}
```

保存到 `multilingual/hreflang-map.json`。

#### 5d. 本地化文章 Schema（必需）

在每个语言版本上附加或更新 Article/BlogPosting JSON-LD，并包含
`inLanguage` 和 `translationOfWork` 字段：

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "[Localized title]",
  "description": "[Localized description]",
  "inLanguage": "[lang-code]",
  "isPartOf": { "@type": "Blog", "inLanguage": "[lang-code]" },
  "translationOfWork": {
    "@type": "BlogPosting",
    "inLanguage": "[source-lang]",
    "url": "[source-url]"
  }
}
```

使用现有的 `/blog schema` 子技能，为每个版本生成更丰富的 schema。
将 Article/BlogPosting、Person、Organization 和 BreadcrumbList 作为优先级堆栈。FAQPage
是可选项，仅适用于作为实体和 AI 引用信号的可见 FAQ 内容，而不是 Google 富结果目标。

### 第 6 阶段：交付摘要

```
## Multilingual blog complete: [Title]

### Original
- Language: [source]
- File: multilingual/{source}/{slug}.{ext}

### Translations
| Language | File | Localized | Keywords adapted |
|----------|------|-----------|------------------|
| de | multilingual/de/{slug}.md | yes | [N] |
| fr | multilingual/fr/{slug}.md | yes | [N] |
| es | multilingual/es/{slug}.md | yes | [N] |

### International SEO assets
- multilingual/hreflang-tags.html
- multilingual/hreflang-sitemap.xml
- multilingual/hreflang-map.json
- Localized Article schema embedded per version

### Total
- [N] posts in [N] languages
- [N] SEO assets generated

### Next steps
- Replace `{source-url}`, `{lang-1-url}`, `{lang-2-url}`, and
  `{fallback-url}` placeholders in hreflang tags with real absolute HTTPS
  URLs.
- Merge `hreflang-sitemap.xml` into your existing sitemap.
- Run `/blog locale-audit multilingual/` to verify completeness.
- Resolve `[INTERNAL-LINK]` placeholders with locale-specific URLs.
- If claude-seo is installed, run `/seo hreflang multilingual/` for
  deeper validation.
```

## 交叉引用

| 时机 | 运行 |
|------|-----|
| 要重新生成或改写源文档 | `/blog write <topic>` |
| 仅翻译一个现有文件 | `/blog translate <file> --to <codes>` |
| 要加深单个文件的文化适配 | `/blog localize <file> --locale <code>` |
| 要审核多语言目录 | `/blog locale-audit <directory>` |
| 要进行更深入的 hreflang 验证 | `/seo hreflang <directory>`（claude-seo，可选） |

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 缺少 `blog-write` | 错误："此技能需要 `blog-write`。请重新安装 claude-blog。" |
| 一个翻译失败 | 完成其余翻译，报告部分结果，并建议重试命令 |
| 源语言等于目标语言之一 | 跳过该目标语言，并记录通知 |
| 目标语言达到 10 种或以上 | 在写入前停止。说明规模化内容滥用风险，并要求分批审核，每批最多 9 种目标语言 |
| 未安装 `seo-hreflang` | 使用自包含生成器，并在摘要中注明 |

## 命令回顾

| 命令 | 用途 |
|---------|---------|
| `/blog multilingual <topic> --languages de,fr,es` | 撰写源文档、翻译、本地化并生成 hreflang 资源 |
| `/blog translate <file> --to de,fr,es` | 将一个文件翻译成目标语言 |
| `/blog localize <file> --locale de-DE` | 对单个已翻译文件进行文化层面的深度适配 |
| `/blog locale-audit <directory>` | 对目录执行多语言质量检查 |