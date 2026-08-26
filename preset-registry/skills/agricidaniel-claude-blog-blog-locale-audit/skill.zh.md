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
  version: "2.2.0"
  category: blog
---
# 博客区域设置审计，多语言质量控制

审计多语言博客内容目录，确保每种语言版本都完整、一致、标记正确并经过 SEO 优化。
在国际化内容影响排名之前，及时发现相关问题。

> 改编自 Chris Mueller 的 `claude-blog-multilingual`（Pro Hub Challenge，
> 2026 年 3 月）。原文：https://github.com/Chriss54/multilingual-int

## 工作流程

### 阶段 1：发现

1. 在项目根目录/当前工作目录内解析目标目录。拒绝符号链接目录以及超出根目录范围的路径遍历，
   然后扫描博客内容，并使用以下方式按语言对文章进行分组：
   - 子目录名称（`en/`、`de/`、`fr/`）。
   - Frontmatter 中的 `lang` 和 `translatedFrom` 字段。
   - 如果存在，则使用 `hreflang-map.json`。
2. 使用 `blog-translate`、`blog-localize` 和 `blog-multilingual` 共同使用的多语言区域设置规则，
   规范化检测到的语言代码：小写的 ISO 639-1 语言代码，可选的首字母大写 ISO 15924
   文字代码，以及可选的大写 ISO 3166-1 Alpha-2 地区代码。除非内容声明了明确的中性模式，
   否则将 `es`、`pt` 和 `zh` 等含义不明确的仅语言代码标记出来。
3. 构建内容矩阵，映射每篇文章存在哪些语言版本中。在比较 slug 之前，使用稳定的翻译组键：
   `translationGroupId`、`sourceSlug`、架构中的 `translationOfWork.url`，或
   `hreflang-map.json` 中的 ID 和 URL。仅当不存在稳定键时，才回退到规范化的源 slug。
4. 检测源语言（最常见的 `translatedFrom` 目标，或 `hreflang-map.json` 中的
   `sourceLanguage` 字段，如果存在）。

### 阶段 2：完整性审计

显示缺失的翻译：

```
### 翻译覆盖矩阵

| 文章（EN） | DE | FR | ES | JA |
|------------|----|----|----|----|
| how-to-avoid-ai-slop | 正常 | 正常 | 缺失 | 缺失 |
| content-marketing-2026 | 正常 | 缺失 | 正常 | 缺失 |

覆盖率：60%（预计 10 个翻译中已有 6 个）
缺失：需要补充 4 个翻译
```

### 阶段 3：内容对等性审计

对于存在多个语言版本的每篇文章：

| 检查项 | 内容 | 严重性 |
|-------|------|----------|
| Section 数量 | H2 和 H3 section 的数量相同 | 严重 |
| FAQ 数量 | FAQ 项目数量相同 | 高 |
| 图片数量 | 图片数量相同 | 高 |
| 图表数量 | 图表（SVG figures）数量相同 | 高 |
| 字数比例 | 在语言对预期范围内（DE +20% 至 +30%，JA -20%，ES +10%） | 中 |
| 链接数量 | 内部链接和外部链接数量相近 | 中 |
| 有证据支持的声明 | 各版本中的受支持声明和引用相同 | 中 |
| Frontmatter 对等性 | 每个版本都包含所有必需字段 | 高 |

将每一项重大偏差标记为问题。

### 阶段 4：SEO 对等性审计

验证每个语言版本：

| 元素 | 检查项 | 严重性 |
|---------|-------|----------|
| Title tag | 存在、已本地化、清晰且适合该页面 | 严重 |
| Meta description | 存在、已本地化、准确，并与可见内容一致 | 严重 |
| `lang` 属性或 frontmatter `lang` | 存在，并且是有效的、兼容 Google 的 hreflang 或 BCP 47 语言标签 | 严重 |
| Canonical URL | 指向相同语言的页面，而不是源语言页面或 x-default | 严重 |
| Schema `inLanguage` | 与 `lang` 匹配 | 高 |
| Schema `translationOfWork` | 指向源 URL | 高 |
| Alt 文本 | 已翻译（非 EN 文章中不得使用英文 alt） | 高 |
| Slug | 已本地化（非 EN 文章中不得使用英文 slug） | 中 |
| Tags | 已本地化 | 中 |
| Keywords | 已本地化 | 中 |

### 阶段 5：Hreflang 审计

如果目录中存在 `hreflang-tags.html`、`hreflang-sitemap.xml` 或 `hreflang-map.json`：

| 检查项 | 内容 | 严重程度 |
|-------|------|----------|
| 自引用 | 每个页面都引用自身 | 严重 |
| 返回标签 | 每个关系都是双向的 | 严重 |
| 规范链接一致性 | 每个 hreflang 页面都将规范链接指向其同语言 URL | 严重 |
| `x-default` | 存在，并指向不匹配语言的回退页面，例如语言选择器或默认市场页面 | 严重 |
| 语言代码 | 有效且兼容 Google 的 hreflang 标签：ISO 639-1 语言代码，加上可选的 ISO 15924 脚本代码或 ISO 3166-1 Alpha-2 区域代码 | 高 |
| URL 一致性 | 使用相同协议、相同的尾部斜杠约定 | 中 |
| 完整性 | 覆盖每个语言版本 | 高 |

如果不存在 hreflang 文件，将其报告为严重缺口，并提供以下建议：

"运行 `/blog multilingual <topic> --languages ...` 以重新生成，或手动创建
hreflang-tags.html。"

如果已安装 claude-seo 中的 `seo-hreflang`，建议运行它进行更深入的验证。

### 阶段 6：新鲜度审计

对于 frontmatter 中包含 `translatedDate` 的文章：

| 检查项 | 内容 | 严重程度 |
|-------|------|----------|
| 翻译后源内容已更新 | 源内容在 `translatedDate` 之后被修改 | 严重 |
| 源内容发生漂移 | 存储的源哈希值或源 `dateModified` 与当前源内容不同 | 严重 |
| 翻译内容发生漂移 | 存储的翻译哈希值与当前本地化文件不同 | 中 |
| 翻译时间超过 90 天 | 可能需要刷新 | 中 |
| 各版本的 `lastUpdated` 不一致 | 各版本不同步 | 中 |
| Git 或文件 mtime 晚于 `translatedDate` | 内容发生更改但未更新 frontmatter | 警告 |

如果可用，在仅依赖 `translatedDate` 之前，存储并比较 `sourceHash`、源 `dateModified`、`translationHash` 和 Git mtime。

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

默认以 markdown 格式输出。如果用户传入 `--html`，还要将报告写入 `locale-audit-report.html`，且只能写入经过审计的项目根目录内。在渲染 HTML 之前，使用 `html.escape(value, quote=True)` 转义所有动态文件名、标题、URL 和问题文本，并拒绝符号链接或根目录之外的报告路径。

```
## 多语言内容审计报告

### 摘要
- 已审计文章：[N] 篇，涵盖 [N] 种语言
- 总体健康度：[score] / 100
- 严重问题：[N]
- 警告：[N]

### 翻译覆盖率
[阶段 2 中的矩阵]

### 发现的问题
#### 严重问题
- [包含文件引用的问题]

#### 警告
- [包含文件引用的问题]

#### 已通过
- [已通过的检查]

### 优先修复项
1. [影响最高的操作]
2. [...]

### 过时翻译提醒
[阶段 6 中的可执行命令]

### 快速修复
- 对于 [N] 个缺失的翻译，运行 `/blog translate <file> --to <missing-langs>`。
- 运行 `/blog multilingual` 以重新生成 hreflang 资源。
- 运行 `/blog localize <file> --locale <code>` 以改进文化适配较弱的内容。
```

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 目录为空 | "在 [path] 中未找到博客文章" |
| 仅存在一种语言 | 报告覆盖情况，建议目标语言 |
| 没有 hreflang 文件 | 标记为关键缺口，提供重新生成选项 |
| 无法识别的文件格式 | 跳过并发出警告 |

## 交叉引用

- 填充缺失的翻译：`/blog translate <file> --to <missing-codes>`
- 深化较弱的本地化改编：`/blog localize <file> --locale <code>`
- 重新生成 hreflang 资源：`/blog multilingual <topic> --languages <codes>`