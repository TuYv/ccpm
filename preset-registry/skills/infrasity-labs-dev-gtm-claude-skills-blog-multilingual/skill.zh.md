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
compatibility: Requires claude-blog (blog-write). Optional integration with claude-seo (seo-hreflang) for richer hreflang validation.
---
# 博客多语言一键国际化发布

旗舰级多语言编排器。将博客写作、翻译、文化适配和完整的国际 SEO 整合到单个命令中。为每种目标语言生成可直接发布的博客文章，并包含 hreflang 标签、本地化 JSON-LD schema 和 CMS 集成元数据。

## 依赖项

由此编排器在内部调用：

| 组件 | 来源 | 必需 |
|-----------|--------|----------|
| `blog-write` | claude-blog（此插件） | 是 |
| `blog-translate` | claude-blog（此插件） | 是 |
| `blog-localize` | claude-blog（此插件） | 是（当 `--localize` 开启时，默认开启） |
| `seo-hreflang` | claude-seo（同级插件） | 否，缺失时回退到内置生成器 |

如果未安装 `seo-hreflang`，编排器会使用自己的最小化生成器（参见下方阶段 5）生成 hreflang 标签，并在交付摘要中注明此限制。在这种情况下，hreflang 验证仅检查结构，不会执行 `seo-hreflang` 所提供的更深入验证。

## 命令语法

```
/blog multilingual <topic> --languages <lang1,lang2,...> [--source <lang>] [--no-localize] [--format <md|mdx|html>]
```

| 参数 | 必需 | 默认值 | 描述 |
|----------|----------|---------|-------------|
| `<topic>` | 是 | , | 博客主题或暂定标题 |
| `--languages` | 是 | , | 以逗号分隔的 ISO 639-1 代码（例如 `de,fr,es,ja,pt-BR`） |
| `--source` | 否 | `en` | 撰写原文所使用的源语言 |
| `--no-localize` | 否 | 关闭 | 跳过文化适配（仅翻译） |
| `--format` | 否 | 自动 | 输出格式：`md`、`mdx` 或 `html` |

如果缺少 `--languages`，请在执行任何操作之前询问用户一次：
“博客应以哪些语言发布？请提供以逗号分隔的 ISO 639-1 代码（例如 `de,fr,es,ja,pt-BR`）。文章将先使用 `<source>` 撰写，然后再进行翻译。”

## 工作流程

### 阶段 1：配置

1. 解析参数。提取主题、目标语言、源语言和格式。
2. 根据 ISO 639-1 验证每个语言代码（也接受类似 `pt-BR`、`es-MX`、`zh-TW` 的地区后缀）。
3. 从项目中检测输出格式（frontmatter 约定、文件扩展名、框架提示），或使用 `--format`。
4. 确定源语言。如果某种目标语言与 `--source` 相同，则将其从翻译列表中移除并发出通知。
5. 在当前工作目录内创建输出目录：
   ```
   multilingual/
     {source-lang}/
     {lang-1}/
     {lang-2}/
     ...
   ```
   输出必须位于项目根目录内。绝不要写入 cwd 之外的位置。

进度：`Phase 1: Configuration complete, [N] languages selected ([codes])`

### 阶段 2：撰写原始博客

调用 `blog-write` 子技能（通过 `/blog write` 路由，以便应用所有现有规则：自动选择模板、带来源的统计数据、引用胶囊、FAQ schema、内部链接区域、图表、图片嵌入）。传入主题以及用户提供的任何 blog-write 参数。

将原文保存到 `multilingual/{source-lang}/{slug}.{ext}`。

进度：`Phase 2: Original written, multilingual/{source-lang}/{slug}.{ext}`

### 阶段 3：翻译成所有目标语言

针对每种目标语言，调用 `blog-translate`：

- 输入：阶段 2 中生成的原始博客文章。
- 目标：指定的语言代码。
- 在运行环境支持的情况下，并行处理各个目标语言（每种语言一个 Task），以缩短实际耗时。

将译文保存到 `multilingual/{lang}/{localized-slug}.{ext}`。

每种语言的进度：`Phase 3: Translating to [lang] ([X]/[N])`，全部完成后为
`Phase 3: All translations complete`。

### 阶段 4：文化本地化适配

如果未设置 `--no-localize`，则针对每篇已翻译的文章调用
`blog-localize`：

- 输入：已翻译的博客文章。
- 区域设置：目标语言或地区代码。
- 并行运行。

直接更新原文件。本地化工具会替换品牌示例、调整 CTA、替换法律法规引用，并调整正式程度。有关完整的适配流程，请参阅
`../blog-localize/SKILL.md`。

进度：`Phase 4: Cultural adaptation complete for [N] languages`。

### 阶段 5：生成国际 SEO

生成三项产物以及本地化 schema。如果已安装 claude-seo 中的 `seo-hreflang` skill，则将验证工作委托给它。否则，使用下方的自包含生成器。

#### 5a. Hreflang 标签（HTML）

可直接复制粘贴到 `<head>` 中的标签：

```html
<!-- Hreflang tags. Paste into <head> of each language version. -->
<link rel="alternate" hreflang="{source}" href="{source-url}" />
<link rel="alternate" hreflang="{lang-1}" href="{lang-1-url}" />
<link rel="alternate" hreflang="{lang-2}" href="{lang-2-url}" />
<link rel="alternate" hreflang="x-default" href="{source-url}" />
```

规则（与 `seo-hreflang` 保持一致）：

- 每个页面都引用包括自身在内的所有替代版本（自引用）。
- `x-default` 指向源语言版本。
- 所有 URL 均使用相同的协议（HTTPS）和尾部斜杠约定。
- 双向引用：每个关系都必须是相互的。

保存到 `multilingual/hreflang-tags.html`。

#### 5b. Hreflang 站点地图片段

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>{source-url}</loc>
    <xhtml:link rel="alternate" hreflang="{source}" href="{source-url}" />
    <xhtml:link rel="alternate" hreflang="{lang-1}" href="{lang-1-url}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="{source-url}" />
  </url>
  <!-- Repeat one <url> block per language version -->
</urlset>
```

保存到 `multilingual/hreflang-sitemap.xml`。

#### 5c. Hreflang 映射（JSON）

用于 CMS 集成的机器可读映射：

```json
{
  "sourceSlug": "how-to-avoid-ai-slop",
  "sourceLanguage": "en",
  "generatedDate": "YYYY-MM-DD",
  "versions": [
    {
      "lang": "en",
      "slug": "how-to-avoid-ai-slop",
      "file": "en/how-to-avoid-ai-slop.md",
      "title": "How to Avoid AI Slop in 2026",
      "description": "..."
    },
    {
      "lang": "de",
      "slug": "wie-man-ki-slop-vermeidet",
      "file": "de/wie-man-ki-slop-vermeidet.md",
      "title": "KI-Slop vermeiden in 2026",
      "description": "..."
    }
  ],
  "hreflang": {
    "method": "html",
    "x-default": "en"
  }
}
```

保存到 `multilingual/hreflang-map.json`。

#### 5d. 本地化 Schema（可选）

如果用户提出要求，或者 frontmatter 中存在 `schema: true` 标志，则在每个语言版本中附加或更新 JSON-LD，并包含 `inLanguage` 和 `translationOfWork` 字段：

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

如果希望每个版本都包含更丰富的 Schema（FAQ、Person、Breadcrumb），请使用现有的 `/blog schema` 子技能。

### 阶段 6：交付摘要

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
- Localized schema embedded per version (if requested)

### Total
- [N] posts in [N] languages
- [N] SEO assets generated

### Next steps
- Replace `{url}` placeholders in hreflang tags with your real URLs.
- Merge `hreflang-sitemap.xml` into your existing sitemap.
- Run `/blog locale-audit multilingual/` to verify completeness.
- Resolve `[INTERNAL-LINK]` placeholders with locale-specific URLs.
- If claude-seo is installed, run `/seo hreflang multilingual/` for
  deeper validation.
```

## 交叉引用

| 场景 | 运行 |
|------|-----|
| 重新生成或改写源内容 | `/blog write <topic>` |
| 仅翻译一个现有文件 | `/blog translate <file> --to <codes>` |
| 深化单个文件的文化适配 | `/blog localize <file> --locale <code>` |
| 审核多语言目录 | `/blog locale-audit <directory>` |
| 进行更深入的 hreflang 验证 | `/seo hreflang <directory>`（claude-seo，可选） |

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 缺少 `blog-write` | 错误：“此技能需要 `blog-write`。请重新安装 claude-blog。” |
| 某个翻译失败 | 完成其余翻译，报告部分结果，并建议重试命令 |
| 源语言与目标语言相同 | 跳过该目标语言，并记录通知 |
| 目标语言超过 10 种 | 提醒实际耗时，确认后继续 |
| 未安装 `seo-hreflang` | 使用内置生成器，并在摘要中注明 |

## 命令回顾

| 命令 | 用途 |
|---------|---------|
| `/blog multilingual <topic> --languages de,fr,es` | 撰写源内容、翻译、本地化并生成 hreflang 资源 |
| `/blog translate <file> --to de,fr,es` | 将单个文件翻译成目标语言 |
| `/blog localize <file> --locale de-DE` | 对单个已翻译文件进行深度文化适配 |
| `/blog locale-audit <directory>` | 对目录执行多语言质量检查 |