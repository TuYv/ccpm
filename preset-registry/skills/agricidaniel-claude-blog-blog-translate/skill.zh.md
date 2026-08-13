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
license: MIT
compatibility: Standalone within claude-blog. Invoked by blog-multilingual.
metadata:
  author: AgriciDaniel
  version: "1.11.0"
  category: blog
---
# 博客翻译，SEO 优化的博客翻译

将现有博客文章翻译成一种或多种目标语言。与通用翻译不同，
此 Skill 可生成经过 SEO 优化、可直接发布的内容，并提供本地化关键词、
元标签以及符合当地文化习惯的格式。

> 改编自 Chris Mueller 的 `claude-blog-multilingual`（Pro Hub Challenge，
> 2026 年 3 月）。原始项目：https://github.com/Chriss54/multilingual-int

## 关键参考资料

按需加载：

- `references/translation-rules.md`，包括格式保留、各区域设置的数字/日期/货币
  格式、引号处理和质量标准。
- `references/cultural-adaptation.md`，包括各区域设置的文化概况（DACH、
  法语区、西班牙语区、日本、自定义）。此文件与
  `blog-localize` 共享（请勿重复创建）。

## 工作流程

### 阶段 1：输入解析

1. 仅在根据项目根目录/当前工作目录解析源文件路径后，读取源文件（markdown、MDX 或 HTML）。
   拒绝符号链接路径、越出根目录的路径、超过 10 MB 的文件以及二进制文件。
2. 自动检测源语言。优先顺序：
   - Frontmatter 的 `lang` 字段。
   - HTML 的 `lang` 属性。
   - 内容分析（文字系统、常见停用词）。
3. 将 `--to` 中的目标语言解析为以逗号分隔且与 Google 兼容的
   hreflang 标签（`de`、`fr`、`es-MX`、`ja`、`pt-BR`、`zh-Hant`）。
   如果缺少 `--to`，询问用户一次：“我应该翻译成哪些语言？
   请提供 hreflang 标签，例如 de、fr、es-MX、ja、pt-BR。”
4. 使用 `blog-multilingual`、`blog-localize` 和 `blog-locale-audit`
   共用的多语言区域设置规则规范化每个代码：ISO 639-1 语言代码使用小写，
   可选的 ISO 15924 文字代码使用首字母大写，可选的 ISO 3166-1 Alpha-2
   地区代码使用大写。拒绝无效代码并提供建议（`jp` 对应的建议为
   “你是否想使用日语代码 `ja`？”）。对于 `es`、`pt` 和 `zh`
   等存在歧义且仅指定语言的目标，要求指定地区或明确使用中性模式。
   如果某个目标与规范化后的源语言相同，则跳过该目标并发出通知。

### 阶段 2：内容分析

提取可翻译内容：

- Frontmatter：`title`、`description`、`tags`、`author`（仅当内容可翻译时，
  例如角色标签，而非个人姓名）。
- 所有标题（H1、H2、H3）。
- 正文段落。
- 图片 `alt` 文本和 `<figcaption>` 内容。
- 图表中的 `<text>` 和 `<tspan>` 内容；保留每个 SVG 属性（`x`、
  `y`、`font-size`、`fill`、`transform`）。
- FAQ 问题和答案。
- 引文胶囊中的文本。
- 关键要点或摘要框。
- CTA 文本。
- 内部链接区域的锚文本。

保持不变：

- Markdown 和 HTML 结构、标签、属性。
- 图片 URL、链接 URL、frontmatter 键。
- 可执行代码围栏和行内代码。仅翻译可执行代码之外的注释，或在用户明确要求
  对教程注释进行本地化时翻译注释。
- 内部链接区域标记（`[INTERNAL-LINK: ...]`）。
- 引文中的来源组织名称（Gartner、McKinsey 等）。
- 人名。
- Schema JSON-LD 块（仅翻译面向用户的内容字符串；切勿翻译 Person、
  Organization 或 Brand 名称、URL、ID、`@id` 或 `sameAs`）。

确定第 3 阶段的主要关键词和次要关键词。

### 第 3 阶段：关键词本地化

对于每种目标语言：

1. 判断源关键词是否为目标市场中的通用术语。如果是（例如，德语中仍使用 "Content Marketing"），则予以保留。
2. 如果本地对应词确实存在搜索行为，则替换为该对应词。
3. 对次要关键词应用相同的逻辑。
4. 记录映射关系。翻译代理会使用该映射，以一致地更新标题、元描述和 H2 标题。

### 第 4 阶段：翻译

通过 Task 为每种目标语言启动 `blog-translator` 代理，并提供：

- 源内容。
- 第 3 阶段生成的关键词本地化映射。
- 目标语言代码。
- 指向 `references/translation-rules.md` 的指针。
- 指示本阶段仅处理语言、语体、自然的主题覆盖和格式。品牌、法律、统计数据和文化方面的替换应留给 `blog-localize` 处理。

翻译成多种语言时，并行运行代理。

代理会以与输入相同的格式返回完整翻译后的文章。

### 第 5 阶段：后处理

对于每个翻译版本：

1. 添加或更新语言区域 frontmatter：
   ```yaml
   lang: "de"
   translatedFrom: "en"
   translatedDate: "YYYY-MM-DD"
   slug: "wie-man-ki-slop-vermeidet"
   ```
2. 验证结构完整性：
   - H2 和 H3 章节数量与原文相同。
   - 所有图片均存在，并带有翻译后的替代文本。
   - 所有 SVG 图表均存在，并带有翻译后的文本标签（已根据长度调整：DE +30%、FR +15%、JA -20%，其他语言请参阅 `references/translation-rules.md`）。
   - FAQ 数量一致。
   - 每个 H2 中都包含引用胶囊。
3. 保存翻译后的文件：
   ```
   translations/
     {lang}/{localized-slug}.{ext}
   ```
   从 `blog-multilingual` 调用时，则保存到
   `multilingual/{lang}/{localized-slug}.{ext}`。
   写入之前，将 `{localized-slug}` 转换为仅包含小写 ASCII 字符
   `a-z`、`0-9` 和连字符的 slug，并拒绝空名称或保留名称。仅使用规范化后的 hreflang 代码创建语言目录。解析最终路径，并确保其位于预期输出根目录内；拒绝使用符号链接的输出路径。

### 第 6 阶段：翻译质量防护措施

完成报告之前，扫描输出中是否存在机器翻译痕迹：

- 直译习语（对英语习语进行音译，而不是适配）。
- 不自然的语序（将 SOV 语序翻译为非 SVO 语言中的 SVO 语序，或反之）。
- 混合语言的句子（公认的外来词除外）。
- 仍采用源格式的数字、日期或货币字符串。
- 仍使用源语言的 frontmatter 字符串。

以内联方式标记每个问题（文件路径、行号、修复建议）。交付之前，翻译代理应重新处理所有被标记的段落。

### 第 7 阶段：交付

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
| 不支持的语言代码 | 建议使用正确且与 Google 兼容的 hreflang 代码 |
| 源语言与目标语言相同 | 跳过并提示“源语言已经是 [lang]” |
| 找不到文件 | 报告错误并提供建议路径 |
| 翻译代理超时 | 重试一次，然后报告部分结果 |
| 二进制或非文本文件 | 报告错误并建议使用正确的文件 |

## 交叉引用

- 下一步（深度文化适配）：`/blog localize <file> --locale <code>`
- 对所有语言版本进行全面 QA：`/blog locale-audit <directory>`
- 一键式流水线：`/blog multilingual <topic> --languages <codes>`