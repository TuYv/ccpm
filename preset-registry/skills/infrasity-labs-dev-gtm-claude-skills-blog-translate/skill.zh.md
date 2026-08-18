---
name: blog-translate
description: >
  Translate existing blog posts into one or more target languages with
  SEO-optimized localization. Produces native-quality translations that
  preserve markdown structure, frontmatter, schema JSON-LD, image and chart
  embeds, and citation capsules. Localizes keywords, meta tags, numbers,
  dates, currencies, and quote styles per locale. Flags machine-translation
  artifacts for review. Run BEFORE blog-localize: this handles language
  conversion; localize handles cultural adaptation after translation
  completes.
  Use when user says "translate blog", "blog translate", "uebersetzen",
  "traduire", "traducir", "translate post", "blog auf Deutsch", "blog en
  espanol".
user-invokable: true
argument-hint: "<file> --to <comma-separated-codes>"
compatibility: Standalone within claude-blog. Invoked by blog-multilingual.
---
# 博客翻译，SEO 优化的博客翻译

将现有博客文章翻译成一种或多种目标语言。与通用翻译不同，此技能可生成经过 SEO 优化、可直接发布的内容，并包含本地化关键词、元标签以及符合当地文化习惯的格式。

## 关键参考资料

按需加载：

- `references/translation-rules.md`：格式保留、各区域设置的数字/日期/货币格式、引号处理和质量标准。
- `references/cultural-adaptation.md`：各区域设置的文化概况（德语区、法语区、西班牙语区、日语区、自定义）。此文件与 `blog-localize` 共享（请勿重复创建）。

## 工作流程

### 阶段 1：输入解析

1. 读取源文件（markdown、MDX 或 HTML）。
2. 自动检测源语言。优先顺序：
   - Frontmatter `lang` 字段。
   - HTML `lang` 属性。
   - 内容分析（文字系统、常见停用词）。
3. 从 `--to` 中解析以逗号分隔的 ISO 639-1 目标语言代码（`de,fr,es,ja,pt-BR`）。如果缺少 `--to`，询问用户一次：“您希望翻译成哪些语言？请提供 ISO 639-1 代码（例如 de、fr、es、ja、pt-BR）。”
4. 验证每个代码。拒绝无效代码并给出建议（`jp` 应提示“您指的是日语代码 `ja` 吗？”）。如果目标语言与源语言相同，则跳过并发出通知。

### 阶段 2：内容分析

提取可翻译内容：

- Frontmatter：`title`、`description`、`tags`、`author`（仅在内容可翻译时，例如角色标签，而非人名）。
- 所有标题（H1、H2、H3）。
- 正文段落。
- 图片 `alt` 文本和 `<figcaption>` 内容。
- 图表中的 `<text>` 和 `<tspan>` 内容；保留每个 SVG 属性（`x`、`y`、`font-size`、`fill`、`transform`）。
- FAQ 问题和答案。
- 引用卡片文本。
- “关键要点”或摘要框。
- CTA 文本。
- 内部链接区域的锚文本。

保持不变：

- Markdown 和 HTML 结构、标签及属性。
- 图片 URL、链接 URL、frontmatter 键。
- 代码块（仅在有实际意义时翻译行内注释）。
- 内部链接区域标记（`[INTERNAL-LINK: ...]`）。
- 引用中的来源组织名称（Gartner、McKinsey 等）。
- 人名。
- Schema JSON-LD 块（仅翻译面向用户的字符串值）。

识别供阶段 3 使用的主要关键词和次要关键词。

### 阶段 3：关键词本地化

对于每种目标语言：

1. 判断源关键词是否为目标市场中的惯用术语。如果是（例如，德语中仍使用“Content Marketing”），则予以保留。
2. 如果本地对应词确实存在搜索行为，则替换为该对应词。
3. 对次要关键词应用相同逻辑。
4. 记录映射关系。翻译代理使用该映射统一更新标题、元描述和 H2 标题。

### 阶段 4：翻译

通过 Task 为每种目标语言启动 `blog-translator` 代理，并提供：

- 源内容。
- 阶段 3 生成的关键词本地化映射。
- 目标语言代码。
- 指向 `references/translation-rules.md` 的引用，以及目标区域设置存在对应文化概况时，指向 `references/cultural-adaptation.md` 中该文化概况的引用。

在翻译成多种语言时，并行运行多个代理。

代理会以与输入相同的格式返回完整翻译后的文章。

### 阶段 5：后处理

对于每个翻译版本：

1. 添加或更新语言区域 frontmatter：
   ```yaml
   lang: "de"
   translatedFrom: "en"
   translatedDate: "YYYY-MM-DD"
   slug: "wie-man-ki-slop-vermeidet"
   ```
2. 验证结构完整性：
   - H2 和 H3 章节的数量与原文相同。
   - 所有图片均存在，并带有翻译后的替代文本。
   - 所有 SVG 图表均存在，并带有翻译后的文本标签（已调整长度：
     DE +30%、FR +15%、JA -20%，其他语言请参阅 `references/translation-rules.md`）。
   - FAQ 数量一致。
   - 每个 H2 中均包含引用胶囊。
3. 保存翻译后的文件：
   ```
   translations/
     {lang}/{localized-slug}.{ext}
   ```
   从 `blog-multilingual` 调用时，改为保存到
   `multilingual/{lang}/{localized-slug}.{ext}`。

### 阶段 6：翻译质量防护措施

在报告完成之前，扫描输出中是否存在机器翻译痕迹：

- 直译习语（照字面翻译英文习语，而未进行本地化调整）。
- 不自然的语序（将 SOV 语序翻译成非 SVO 语言中的 SVO 语序，或反之）。
- 混合语言的句子（公认的外来词除外）。
- 数字、日期或货币字符串仍采用源语言格式。
- Frontmatter 字符串仍使用源语言。

逐项以内联方式标记所有问题（文件路径、行号、修复建议）。
翻译代理应在交付前重新处理所有被标记的段落。

### 阶段 7：交付

```
## Translation complete: [Original title]

### Source
- Language: [source]
- File: [source path]

### Translations
| Language | File | Keywords adapted | Status |
|----------|------|------------------|--------|
| de | translations/de/{slug}.md | [N] | ok |
| fr | translations/fr/{slug}.md | [N] | ok |

### Quality checks
- Structural integrity: pass / fail per language
- Meta tags localized: pass / fail per language
- Numbers, dates, currencies formatted per locale: pass / fail
- Keywords localized: [N] keywords adapted
- Machine-translation artifacts flagged: [N] (see notes above)

### Next steps
- Run `/blog localize <file> --locale <code>` for cultural deep-adaptation.
- Run `/blog locale-audit translations/` to verify completeness.
- Use `/blog multilingual` to combine write, translate, localize, hreflang
  in one command.
```

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 不支持的语言代码 | 建议正确的 ISO 639-1 代码 |
| 源语言与目标语言相同 | 跳过，并提示“源文件已使用 [lang]” |
| 未找到文件 | 报告错误并提供建议路径 |
| 翻译代理超时 | 重试一次，然后报告部分结果 |
| 二进制或非文本文件 | 报告错误，并建议正确的文件 |

## 交叉引用

- 下一步（深度文化适配）：`/blog localize <file> --locale <code>`
- 对所有语言版本进行 QA 全面检查：`/blog locale-audit <directory>`
- 单命令流水线：`/blog multilingual <topic> --languages <codes>`