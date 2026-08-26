---
name: blog-localize
description: >
  Deep cultural adaptation of translated blog posts. Run after blog-translate
  completes. Goes beyond translation to swap brand examples, adapt CTAs,
  substitute legal references, localize statistic sources where possible, and
  adjust formality (Sie/du, tu/vous, formal/informal). Built-in profiles for
  DACH, Francophone, Hispanic, and Japanese markets.
  Use when user says "localize blog", "blog localize", "cultural adaptation",
  "adapt for Germany", "lokalisieren", "localiser", "adaptar".
user-invokable: true
argument-hint: "<file> --locale <locale-code>"
license: MIT
compatibility: Standalone within claude-blog. Invoked by blog-multilingual.
metadata:
  author: AgriciDaniel
  version: "2.2.0"
  category: blog
---
# 博客本地化与文化深度适配

接收一篇已翻译的博客文章，并执行文化适配，使最终结果读起来像是为目标市场撰写的，而不是翻译成目标市场的语言。
这是位于 `blog-translate` 之上的一层：替换示例、调整语气、替换引用，并将整个阅读体验进行本地化。

> 改编自 Chris Mueller 的 `claude-blog-multilingual`（Pro Hub Challenge，
> 2026 年 3 月）。原文：https://github.com/Chriss54/multilingual-int

## 关键参考资料

- `../blog-translate/references/cultural-adaptation.md`，包含 DACH、法语地区、西语地区、日语地区以及自定义模板替换表的共享文化配置文件。不要重复此文件。

## 使用时机

- 在 `blog-translate` 生成基础翻译后立即使用。
- 当已有的译文读起来像是“从英语翻译过来的”时。
- 当目标是特定市场，而不仅仅是某种语言时。
- 当内容需要本地统计数据、示例和品牌引用时。

## 工作流

### 阶段 1：了解地区设置

1. 使用 `blog-translate`、`blog-multilingual` 和 `blog-locale-audit` 采用的共享多语言地区规则解析地区代码：ISO 639-1 语言代码使用小写，可选的 ISO 15924 文字代码使用标题格式，可选的 ISO 3166-1 Alpha-2 地区代码使用大写。接受完整代码（`de-DE`、`fr-CA`、`es-MX`、`pt-BR`、`zh-Hant`）以及无歧义的纯语言代码（`de`、`fr`）。对于 `es`、`pt` 和 `zh` 等仅包含语言、存在歧义的目标，必须指定地区或明确使用中性模式。
2. 从 `../blog-translate/references/cultural-adaptation.md` 加载文化配置文件。
   - 如果该地区有对应配置文件，则使用该配置。
   - 如果没有，则遵循该参考文件中的“自定义地区模板”部分，在当前流程中构建最小配置。
3. 只有在项目根目录/当前工作目录内解析并确认译文文章的位置后，才能读取该文章。拒绝符号链接路径、超出根目录的路径遍历、超过 10 MB 的文件以及二进制文件。然后识别适配目标。

### 阶段 2：文化审查

扫描能够表明内容源自外国的元素：

| 元素 | 需要查找的内容 |
|---------|------------------|
| 品牌示例 | 与本地无关的美国或英国品牌 |
| 统计数据来源 | 仅针对美国的研究和调查 |
| CTA | 美式、过于强硬的行动号召 |
| 习语 | 按字面翻译的英语表达 |
| 法律引用 | 在适用本地法律时仍使用外国法律（CCPA、FTC），例如应使用本地法律（DSGVO、RGPD） |
| 文化引用 | 外国节日、活动和习俗 |
| 货币和定价 | 未进行换算或提供语境说明的 USD |
| 语气 | 对目标市场而言过于随意或过于正式 |
| 称谓形式 | Sie/du、tu/vous、正式/非正式称谓使用不一致 |

输出一份审查报告，列出每个目标，并标注严重程度（关键、建议、可选）。

### 阶段 3：适配

#### 3a. 示例替换

将外国示例替换为本地对应内容：

- 使用 WebSearch 查找本地案例研究、品牌或场景。
- 在保留相同论点和结构的前提下进行替换。
- 对每个不明显的本地替换，记录来源 URL、访问日期和替换理由。
- 如果不存在本地对应内容，则保留原内容，但添加本地语境（“在德国市场，具有等同作用的情形是 X”）。

#### 3b. 统计数据本地化

- 使用主要或高质量的本地来源替换统计数据：
  国家统计机构、监管机构、官方行业组织、学术数据集，或附有方法论说明的具名研究报告。
- 不要依赖通用 WebSearch 摘要作为证据。获取被引用的页面，核实数据及其上下文，并记录来源 URL 和日期。
- 仅在完成 SSRF 检查后获取被引用的页面：只允许使用 `https` URL；DNS 解析后，拒绝 `javascript:`、`data:`、`file:`、localhost、环回地址、私有地址、链路本地地址、组播地址和保留 IP；禁用重定向，或使用相同检查验证最终 URL；限制重定向次数、响应大小和请求时间；记录最终 URL 和访问日期。
- 如果存在方法论可比的本地数据，则同时替换来源和数据。每条主张保留一个具名来源。
- 如果本地数据与原数据相关，但采用了不同的方法论或时间范围，不要悄悄替换。保留原主张的适用范围，或重写主张以匹配本地来源。
- 如果不存在，则保留原统计数据，但标明其地理范围（“在美国，……”）。
- 绝不要删除来源归属。

#### 3c. CTA 适配

根据文化特征调整行动号召：

- 调整强硬程度（DACH 和 JA 偏好信息型表达，美国偏好祈使式表达）。
- 使用符合当地文化的行动动词。
- 调整紧迫感的表达方式。

#### 3d. 语气校准

- 根据特征匹配正式程度（DACH 在 B2B 场景默认使用 Sie，在 B2C 生活方式场景使用 du；FR 默认使用 vous；JA 会根据受众显著调整语域）。
- 确保整篇文档中的正式或非正式称谓保持一致。
- 遵循当地的内容风格惯例。

#### 3e. 法律与监管背景

- 按问题和司法管辖区映射法律引用。如果主张明确涉及美国合规，则保留原法律。只有在当地法律处理同一问题时才进行替换，例如将 DE 中的 CCPA 替换为 DSGVO、FR 中的 RGPD、BR 中的 LGPD、MX 中的 LFPDPPP、CO 中的 Ley 1581，或 AR 中的 Ley 25.326。
- 在有助于读者理解的情况下，添加当地合规说明。
- 删除无关的外国监管引用。

#### 3f. 品牌示例替换（速查表）

`../blog-translate/references/cultural-adaptation.md` 中的特征说明提供了替换表。常见示例：

| 来源（美国） | DACH | FR | ES（西班牙） | LATAM | JA |
|-------------|------|----|----|-------|----|
| Walmart | MediaMarkt | Carrefour | El Corte Inglés | Walmart MX | Aeon |
| Target | Saturn | Auchan | Hipercor | Liverpool | Ito-Yokado |
| FTC | Bundeskartellamt | DGCCRF | CNMC | PROFECO (MX) | JFTC |
| CCPA | DSGVO | RGPD | RGPD | LFPDPPP (MX)、Ley 1581 (CO)、Ley 25.326 (AR)、LGPD (BR) | APPI |

### 第 4 阶段：质量验证

- 已处理所有关键适配目标。
- 全文语气保持一致。
- 不再残留源文化标记。
- 统计数据具有有效来源（原始来源或本地化来源）。
- CTA 符合文化预期。
- 从头到尾，正式或非正式称谓保持一致。
- 内容仍然支持与原文相同的论点。
- SEO 元素在关键词布局之外仍保持优化：本地化标题和 meta、标题意图、slug、alt 文本、内部链接锚文本、相同语言的 canonical、hreflang 兼容性，以及 schema `inLanguage`。
- 字数处于该语言对的预期比例范围内。

### 阶段 5：保存并报告

1. 保存本地化版本。默认情况下，将经过审核的副本写入
   `{slug}-localized.{ext}`。只有在用户要求覆盖时，才覆盖已翻译的文件；覆盖前，创建带时间戳的备份并显示差异摘要。将所有输出路径解析到项目根目录内，并拒绝路径遍历、符号链接路径或写入该根目录之外。

2. 呈现摘要：

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
| 没有该语言区域的文化概况 | 根据自定义语言区域模板构建最小化概况，然后继续 |
| 文件不是预期语言 | 警告用户，并提供先进行翻译的选项 |
| 没有可用的本地统计数据 | 保留原始统计数据，并附加地理范围说明 |
| 语言区域代码不明确（例如 `pt`） | 询问：“您指的是 `pt-BR`（巴西）还是 `pt-PT`（葡萄牙）？” |

## 交叉引用

- 前置步骤（翻译）：`/blog translate <file> --to <code>`
- 跨语言版本 QA：`/blog locale-audit <directory>`
- 一键式流水线：`/blog multilingual <topic> --languages <codes>`