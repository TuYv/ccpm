---
name: blog-locale-audit
description: >
  Audit a directory of multilingual blog content for completeness, consistency,
  hreflang correctness, meta-tag parity, and freshness. Builds a translation
  coverage matrix, flags stale translations, validates hreflang and schema,
  and emits a prioritized report with runnable fix commands.
  Use when user says "locale audit", "blog locale-audit", "check translations",
  "multilingual audit", "translation check", "hreflang check",
  "Uebersetzungen pruefen".
user-invokable: true
argument-hint: "<directory>"
license: MIT
compatibility: Standalone within claude-blog. Optional richer hreflang validation via claude-seo seo-hreflang.
metadata:
  author: AgriciDaniel
  version: "2.1.1"
  category: blog
---
# 博客区域设置审计与多语言质量控制

审计多语言博客内容目录，确保每种语言的版本都完整、一致、标记正确并针对 SEO 进行了优化。
在国际化内容问题损害排名之前将其发现。

> 改编自 Chris Mueller 的 `claude-blog-multilingual`（Pro Hub Challenge，
> 2026 年 3 月）。原项目：https://github.com/Chriss54/multilingual-int

## 工作流程

### 阶段 1：发现

1. 解析项目根目录/当前工作目录内的目标目录。拒绝符号链接目录以及根目录之外的路径遍历，
   然后扫描博客内容，并使用以下信息按语言对文章进行分组：
   - 子目录名称（`en/`、`de/`、`fr/`）。
   - Frontmatter 中的 `lang` 和 `translatedFrom` 字段。
   - `hreflang-map.json`（如果存在）。
2. 使用 `blog-translate`、`blog-localize` 和 `blog-multilingual` 共用的多语言区域设置规则，
   对检测到的语言代码进行规范化：小写的 ISO 639-1 语言代码、可选的首字母大写 ISO 15924 文字代码、
   可选的大写 ISO 3166-1 Alpha-2 地区代码。除非内容声明了明确的中性模式，
   否则应标记 `es`、`pt` 和 `zh` 等含义不明确的纯语言代码。
3. 构建内容矩阵，映射每篇文章存在哪些语言版本。在比较 slug 之前，使用稳定的翻译组键：
   `translationGroupId`、`sourceSlug`、schema `translationOfWork.url`，或
   `hreflang-map.json` 中的 ID 和 URL。仅当不存在稳定键时，才回退到规范化的源 slug。
4. 检测源语言（最常见的 `translatedFrom` 目标；如果存在 `hreflang-map.json`，
   也可以使用其中的 `sourceLanguage` 字段）。

### 阶段 2：完整性审计

显示缺少哪些翻译：

```
### Translation coverage matrix

| Post (EN) | DE | FR | ES | JA |
|-----------|----|----|----|----|
| how-to-avoid-ai-slop | ok | ok | missing | missing |
| content-marketing-2026 | ok | missing | ok | missing |

Coverage: 60% (6 of 10 expected translations present)
Missing: 4 translations needed
```

### 阶段 3：内容一致性审计

对于存在多个语言版本的每篇文章：

| 检查项 | 检查内容 | 严重程度 |
|-------|------|----------|
| 章节数量 | H2 和 H3 章节数量相同 | 严重 |
| FAQ 数量 | FAQ 条目数量相同 | 高 |
| 图片数量 | 图片数量相同 | 高 |
| 图表数量 | 图表（SVG 图形）数量相同 | 高 |
| 字数比例 | 处于相应语言对的预期范围内（DE +20% 到 +30%，JA -20%，ES +10%） | 中 |
| 链接数量 | 内部链接和外部链接数量相近 | 中 |
| 有证据支持的声明 | 各版本包含相同的、有依据支持的声明和引用 | 中 |
| Frontmatter 一致性 | 每个版本都包含所有必需字段 | 高 |

将每一项显著偏差标记为问题。

### 阶段 4：SEO 一致性审计

验证每个语言版本：

| 元素 | 检查内容 | 严重程度 |
|---------|-------|----------|
| 标题标签 | 存在、已本地化、表述清晰且适合该页面 | 严重 |
| Meta 描述 | 存在、已本地化、内容准确且与可见内容一致 | 严重 |
| `lang` 属性或 Frontmatter `lang` | 存在，且为有效的、与 Google 兼容的 hreflang 或 BCP 47 语言标签 | 严重 |
| 规范 URL | 指向同语言页面，而不是源语言页面或 x-default | 严重 |
| Schema `inLanguage` | 与 `lang` 匹配 | 高 |
| Schema `translationOfWork` | 指向源 URL | 高 |
| 替代文本 | 已翻译（非 EN 文章中不得包含英文替代文本） | 高 |
| Slug | 已本地化（非 EN 文章中不得使用英文 slug） | 中 |
| 标签 | 已本地化 | 中 |
| 关键词 | 已本地化 | 中 |

### 阶段 5：Hreflang 审计

如果目录中存在 `hreflang-tags.html`、`hreflang-sitemap.xml` 或 `hreflang-map.json`：

| 检查项 | 检查内容 | 严重程度 |
|-------|------|----------|
| 自引用 | 每个页面都引用自身 | 严重 |
| 返回标签 | 每个关系都是双向的 | 严重 |
| 规范链接一致性 | 每个 hreflang 页面都将其同语言 URL 设为规范链接 | 严重 |
| `x-default` | 存在，并指向未匹配语言的后备页面，例如语言选择器或默认市场页面 | 严重 |
| 语言代码 | 有效且与 Google 兼容的 hreflang 标签：ISO 639-1 语言代码，加上可选的 ISO 15924 文字代码或 ISO 3166-1 Alpha-2 地区代码 | 高 |
| URL 一致性 | 使用相同协议和相同的尾部斜杠约定 | 中 |
| 完整性 | 包含每个语言版本 | 高 |

如果不存在 hreflang 文件，将其报告为严重缺失，并提供：
"Run `/blog multilingual <topic> --languages ...` to regenerate, or create
hreflang-tags.html manually."

如果已安装 claude-seo 中的 `seo-hreflang`，建议运行它以进行更深入的验证。

### 阶段 6：时效性审计

对于 frontmatter 中包含 `translatedDate` 的文章：

| 检查项 | 检查内容 | 严重程度 |
|-------|------|----------|
| 源内容在翻译后更新 | 源内容在 `translatedDate` 之后被修改 | 严重 |
| 源内容漂移 | 存储的源哈希值或源 `dateModified` 与当前源内容不同 | 严重 |
| 翻译漂移 | 存储的翻译哈希值与当前本地化文件不同 | 中 |
| 翻译早于 90 天前 | 可能需要更新 | 中 |
| 各版本间的 `lastUpdated` 不匹配 | 版本不同步 | 中 |
| Git 或文件 mtime 晚于 `translatedDate` | 内容已更改，但未更新 frontmatter | 警告 |

如果可用，请存储并比较 `sourceHash`、源 `dateModified`、
`translationHash` 和 Git mtime，而不要仅依赖 `translatedDate`。

为每个过时文件输出可执行的命令：

```
3 translations are stale:
- de/ki-trends-2026.md (source updated 2 days ago)
  -> Run: /blog translate en/ai-trends-2026.md --to de
- fr/ki-trends-2026.md (source updated 2 days ago)
  -> Run: /blog translate en/ai-trends-2026.md --to fr
- es/tendencias-ia-2026.md (translation > 90 days old)
  -> Run: /blog translate en/ai-trends-2026.md --to es
```

### 阶段 7：报告

默认以 Markdown 格式输出。如果用户传入 `--html`，还需将
报告写入仅位于被审计项目根目录内的 `locale-audit-report.html`。
渲染 HTML 之前，使用 `html.escape(value, quote=True)` 转义所有动态文件名、标题、URL 和问题文本，并拒绝符号链接的
或位于根目录之外的报告路径。

```
## Multilingual content audit report

### Summary
- Posts audited: [N] across [N] languages
- Overall health: [score] / 100
- Critical issues: [N]
- Warnings: [N]

### Translation coverage
[Matrix from Phase 2]

### Issues found
#### Critical
- [Issue with file references]

#### Warnings
- [Issue with file references]

#### Passed
- [Checks that passed]

### Prioritized fixes
1. [Highest-impact action]
2. [...]

### Stale-translation alerts
[Runnable commands from Phase 6]

### Quick fixes
- Run `/blog translate <file> --to <missing-langs>` for [N] missing translations.
- Run `/blog multilingual` to regenerate hreflang assets.
- Run `/blog localize <file> --locale <code>` for weak cultural adaptations.
```

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 空目录 | “在 [path] 中未找到博客文章” |
| 仅存在一种语言 | 报告覆盖情况，并建议目标语言 |
| 没有 hreflang 文件 | 标记为严重缺失，并提供重新生成选项 |
| 无法识别的文件格式 | 跳过并发出警告 |

## 交叉引用

- 补充缺失的翻译：`/blog translate <file> --to <missing-codes>`
- 深化薄弱的本地化改编：`/blog localize <file> --locale <code>`
- 重新生成 hreflang 资源：`/blog multilingual <topic> --languages <codes>`