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
compatibility: Standalone within claude-blog. Optional richer hreflang validation via claude-seo seo-hreflang.
---
# 博客本地化审计与多语言质量控制

审计多语言博客内容目录，确保每个语言版本内容完整、保持一致、标记正确并针对 SEO 进行了优化。在国际化内容问题损害搜索排名之前将其发现。

## 工作流程

### 阶段 1：发现

1. 扫描目标目录。使用以下信息按语言对博客文章进行分组：
   - 子目录名称（`en/`、`de/`、`fr/`）。
   - Frontmatter 中的 `lang` 和 `translatedFrom` 字段。
   - `hreflang-map.json`（如果存在）。
2. 构建内容矩阵，映射每篇文章具有哪些语言版本。
3. 检测源语言（最常见的 `translatedFrom` 目标，或者 `hreflang-map.json` 中的 `sourceLanguage` 字段（如果存在））。

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

对于具有多个语言版本的每篇文章：

| 检查项 | 检查内容 | 严重程度 |
|-------|------|----------|
| 章节数量 | H2 和 H3 章节数量相同 | 严重 |
| FAQ 数量 | FAQ 条目数量相同 | 高 |
| 图片数量 | 图片数量相同 | 高 |
| 图表数量 | 图表（SVG 图形）数量相同 | 高 |
| 字数比例 | 处于相应语言对的预期范围内（DE +20% 到 +30%，JA -20%，ES +10%） | 中 |
| 链接数量 | 内部和外部链接数量相近 | 中 |
| 引用信息框数量 | 各版本中每个 H2 下的数量相同 | 中 |
| Frontmatter 一致性 | 每个版本均包含所有必需字段 | 高 |

将每一项显著偏差标记为问题。

### 阶段 4：SEO 一致性审计

验证每个语言版本：

| 元素 | 检查项 | 严重程度 |
|---------|-------|----------|
| 标题标签 | 存在，且长度适合相应语言 | 严重 |
| 元描述 | 存在，长度正确，且包含一项统计数据 | 严重 |
| `lang` 属性或 Frontmatter 中的 `lang` | 存在，且为有效的 ISO 639-1 代码 | 严重 |
| Schema `inLanguage` | 与 `lang` 匹配 | 高 |
| Schema `translationOfWork` | 指向源 URL | 高 |
| 替代文本 | 已翻译（非英语文章中不得包含英语替代文本） | 高 |
| Slug | 已本地化（非英语文章中不得使用英语 Slug） | 中 |
| 标签 | 已本地化 | 中 |
| 关键词 | 已本地化 | 中 |

### 阶段 5：Hreflang 审计

如果目录中存在 `hreflang-tags.html`、`hreflang-sitemap.xml` 或 `hreflang-map.json`：

| 检查项 | 检查内容 | 严重程度 |
|-------|------|----------|
| 自引用 | 每个页面都引用自身 | 严重 |
| 返回标签 | 每个关联关系均为双向 | 严重 |
| `x-default` | 存在，且指向源语言 | 严重 |
| 语言代码 | 有效的 ISO 639-1 代码（可带地区代码） | 高 |
| URL 一致性 | 使用相同协议，并遵循相同的尾部斜杠约定 | 中 |
| 完整性 | 包含每个语言版本 | 高 |

如果不存在 hreflang 文件，请将其报告为严重缺失，并提供：
“运行 `/blog multilingual <topic> --languages ...` 重新生成，或手动创建
hreflang-tags.html。”

如果已安装 claude-seo 中的 `seo-hreflang`，建议运行它以进行更深入的验证。

### 阶段 6：时效性审计

对于 frontmatter 中包含 `translatedDate` 的文章：

| 检查项 | 内容 | 严重程度 |
|-------|------|----------|
| 源文在翻译后更新 | 源文在 `translatedDate` 之后被修改 | 严重 |
| 翻译已超过 90 天 | 可能需要更新 | 中等 |
| 各版本的 `lastUpdated` 不一致 | 版本不同步 | 中等 |
| 文件 mtime 晚于 `translatedDate` | 内容已更改，但未更新 frontmatter | 警告 |

为每个过期文件输出可执行的命令：

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

默认以 markdown 格式输出。如果用户传入 `--html`，还要将相同内容的报告写入
`locale-audit-report.html`。

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
| 目录为空 | “在 [path] 中未找到博客文章” |
| 仅存在一种语言 | 报告覆盖情况，并建议目标语言 |
| 不存在 hreflang 文件 | 标记为严重缺失，并提供重新生成选项 |
| 无法识别的文件格式 | 跳过并发出警告 |

## 交叉引用

- 补充缺失的翻译：`/blog translate <file> --to <missing-codes>`
- 深化薄弱的本地化改编：`/blog localize <file> --locale <code>`
- 重新生成 hreflang 资源：`/blog multilingual <topic> --languages <codes>`