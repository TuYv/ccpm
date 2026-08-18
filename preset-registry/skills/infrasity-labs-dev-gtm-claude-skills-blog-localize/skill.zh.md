---
name: blog-localize
description: >
  Cultural adaptation for translated content. Run AFTER blog-translate
  completes. Adjusts brand examples, CTAs, legal references, and formality
  for the target market (German, French, Japanese, Spanish, etc.).
  Deep cultural adaptation of translated blog posts. Goes beyond translation
  to swap brand examples, adapt CTAs, substitute legal references, localize
  statistic sources where possible, and adjust formality (Sie/du, tu/vous,
  formal/informal). Built-in profiles for DACH, Francophone, Hispanic, and
  Japanese markets, plus a custom-locale template. Makes content feel
  locally authored, not translated.
  Use when user says "localize blog", "blog localize", "cultural adaptation",
  "adapt for Germany", "adapt for France", "lokalisieren", "localiser",
  "adaptar".
user-invokable: true
argument-hint: "<file> --locale <locale-code>"
compatibility: Standalone within claude-blog. Invoked by blog-multilingual.
---
# 博客本地化与文化深度适配

对已翻译的博客文章进行文化适配，使最终成果读起来像是专为目标市场撰写的，而不是翻译成目标语言的。  
这是位于 `blog-translate` 之上的一层：它会替换示例、调整语气、更换文化指涉，并对整体阅读体验进行本地化。

## 关键参考资料

- `../blog-translate/references/cultural-adaptation.md`，共享的文化画像文件，其中包含适用于 DACH、法语区、西班牙语区、日本以及自定义模板的替换表。请勿重复创建此文件。

## 何时使用

- 在 `blog-translate` 生成基础译文后立即使用。
- 当现有译文读起来像是“从英语翻译而来”时。
- 当目标是特定市场，而不仅仅是某种语言时。
- 当内容需要本地统计数据、示例和品牌指涉时。

## 工作流程

### 阶段 1：了解区域设置

1. 解析区域设置代码。接受完整代码（`de-DE`、`fr-CA`、`es-MX`、`pt-BR`、`zh-TW`）或纯语言代码（`de`、`fr`）。
2. 从
   `../blog-translate/references/cultural-adaptation.md`
   加载文化画像。
   - 如果该区域设置有对应画像，请使用它。
   - 如果没有，请遵循该参考资料中的“自定义区域设置模板”部分，直接构建一个最小化画像。
3. 阅读已翻译的文章并识别适配目标。

### 阶段 2：文化审查

扫描会暴露内容源自国外的元素：

| 元素 | 检查内容 |
|---------|------------------|
| 品牌示例 | 与当地无关的美国或英国品牌 |
| 统计数据来源 | 仅针对美国的研究和调查 |
| CTA | 美式的强势行动号召 |
| 习语 | 按字面直译的英语表达 |
| 法律指涉 | 在当地法律适用时引用外国法律（CCPA、FTC），而非当地法律（DSGVO、RGPD） |
| 文化指涉 | 外国节日、活动、习俗 |
| 货币和定价 | 未经换算或缺少背景说明的 USD |
| 语气 | 对目标市场而言过于随意或过于正式 |
| 称呼形式 | Sie/du、tu/vous、正式/非正式称呼使用不一致 |

输出一份审查报告，列出每个适配目标及其严重程度（关键、建议、可选）。

### 阶段 3：适配

#### 3a. 示例替换

将外国示例替换为当地对等示例：

- 使用 WebSearch 查找当地案例研究、品牌或场景。
- 直接替换，同时保留相同的论点和结构。
- 如果不存在当地对等示例，请保留原示例，但补充当地背景（“在德国市场，对应的动态是 X”）。

#### 3b. 统计数据本地化

- 搜索对等的当地统计数据（`[topic] statistik [country] 2025
  2026`）。
- 如果存在当地数据，请同时替换来源和数值。每项论断保留一个具名来源。
- 如果不存在，请保留原统计数据，但标明其地理范围（“在美国，……”）。
- 绝不删除来源归属信息。

#### 3c. CTA 适配

根据文化画像重写行动号召：

- 调整强势程度（DACH 和 JA 偏好信息型表达，US 偏好祈使型表达）。
- 使用符合当地文化的行动动词。
- 调整紧迫感的表达方式。

#### 3d. 语气校准

- 根据地区配置匹配正式程度（DACH 的 B2B 内容默认使用 Sie，B2C
  生活方式类内容使用 du；FR 默认使用 vous；JA 会根据受众显著调整语体）。
- 确保整篇文档始终使用一致的正式或非正式称谓。
- 遵循当地的内容风格惯例。

#### 3e. 法律与监管背景

- 将外国法律替换为当地对应法律（在 DE，CCPA 替换为
  DSGVO；在 FR 替换为 RGPD；在 BR 替换为 LGPD）。
- 在有助于读者理解的地方添加当地合规说明。
- 删除不相关的外国监管内容。

#### 3f. 品牌示例替换（速查表）

`../blog-translate/references/cultural-adaptation.md` 中的地区配置提供了
替换表。常见示例如下：

| 来源（美国） | DACH | FR | ES（西班牙） | LATAM | JA |
|-------------|------|----|----|-------|----|
| Walmart | MediaMarkt | Carrefour | El Corte Ingles | Walmart MX | Aeon |
| Target | Saturn | Auchan | Hipercor | Liverpool | Ito-Yokado |
| FTC | Bundeskartellamt | DGCCRF | CNMC | Profeco (MX) | JFTC |
| CCPA | DSGVO | RGPD | RGPD | LGPD (BR) | APPI |

### 阶段 4：质量验证

- 所有关键的本地化调整目标均已处理。
- 全文语气一致。
- 不再残留源自外国的标记。
- 统计数据具有有效来源（原始来源或本地化来源）。
- CTA 符合当地文化预期。
- 正式或非正式称谓从头到尾保持一致。
- 内容仍然支持与原文相同的论点。
- SEO 元素仍保持优化（关键词、元数据、标题）。
- 字数处于该语言对的预期比例范围内。

### 阶段 5：保存并报告

1. 保存本地化版本。默认：覆盖已翻译的文件。
   可选：如果用户希望保留本地化前的版本，则另存为 `{slug}-localized.{ext}`。

2. 展示摘要：

   ```
   ## Localization complete: [Title]

   ### Target locale: [locale-code] ([locale-name])

   ### Adaptations made
   | Type | Count | Examples |
   |------|-------|----------|
   | Brand examples | [N] | Walmart -> MediaMarkt |
   | Statistics | [N] | US survey -> DACH survey |
   | CTAs | [N] | "Buy now" -> "Jetzt entdecken" |
   | Tone adjustments | [N] | Casual -> Sie |
   | Legal references | [N] | CCPA -> DSGVO |
   | Cultural references | [N] | Thanksgiving -> Weihnachtsgeschaeft |

   ### Cultural fit score
   - Naturalness: [1-10]
   - Market relevance: [1-10]
   - Tone match: [1-10]
   - Overall: [N]/30

   ### Remaining recommendations
   - [Optional adaptations not applied]
   ```

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 没有该地区的文化配置 | 使用自定义地区模板构建最小配置，然后继续 |
| 文件未使用预期语言 | 警告用户，并提议先进行翻译 |
| 没有可用的当地统计数据 | 保留原始统计数据，并添加地理适用范围说明 |
| 地区代码存在歧义（例如 `pt`） | 询问：“你指的是 `pt-BR`（巴西）还是 `pt-PT`（葡萄牙）？” |

## 交叉引用

- 前置步骤（翻译）：`/blog translate <file> --to <code>`
- 跨语言版本 QA：`/blog locale-audit <directory>`
- 一键式流程：`/blog multilingual <topic> --languages <codes>`