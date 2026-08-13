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
  version: "2.1.1"
  category: blog
---
# 博客本地化与文化深度适配

接收一篇已翻译的博客文章并进行文化适配，使最终结果读起来像是专门为目标市场撰写的，而不是翻译成目标语言的。  
这是 `blog-translate` 之上的一层：它会替换示例、调整语气、更换引用，并对整个阅读体验进行本地化。

> 改编自 Chris Mueller 的 `claude-blog-multilingual`（Pro Hub Challenge，
> 2026 年 3 月）。原项目：https://github.com/Chriss54/multilingual-int

## 关键参考资料

- `../blog-translate/references/cultural-adaptation.md`，共享的文化
  档案文件，其中包含适用于 DACH、法语地区、西班牙语地区、
  日本以及自定义模板的替换表。请勿复制此文件。

## 何时使用

- 在 `blog-translate` 生成基础译文后立即使用。
- 当现有翻译内容读起来像是“从英文翻译而来”时。
- 当目标是特定市场，而不仅仅是一种语言时。
- 当内容需要本地统计数据、示例和品牌引用时。

## 工作流程

### 阶段 1：理解区域设置

1. 使用 `blog-translate`、`blog-multilingual` 和 `blog-locale-audit`
   共同采用的多语言区域设置规则解析区域设置代码：ISO 639-1
   语言代码使用小写，可选的 ISO 15924 文字代码使用首字母大写，
   可选的 ISO 3166-1 Alpha-2 地区代码使用大写。接受完整代码（`de-DE`、
   `fr-CA`、`es-MX`、`pt-BR`、`zh-Hant`）以及含义明确的纯语言代码
   （`de`、`fr`）。对于 `es`、`pt` 和 `zh` 等含义不明确的
   纯语言目标，必须指定地区或明确的中立模式。
2. 从
   `../blog-translate/references/cultural-adaptation.md`
   加载文化档案。
   - 如果该区域设置有对应档案，则使用该档案。
   - 如果没有，则按照该参考资料中的“自定义区域设置模板”部分，
     内联构建一个最小化档案。
3. 仅在项目根目录/当前工作目录中解析已翻译文章后再读取它。
   拒绝符号链接路径、遍历到根目录之外的路径、超过 10 MB 的文件
   以及二进制文件。然后识别适配目标。

### 阶段 2：文化审查

扫描表明内容源自外国的元素：

| 元素 | 要查找的内容 |
|---------|------------------|
| 品牌示例 | 与本地无关的美国或英国品牌 |
| 统计数据来源 | 仅针对美国的研究和调查 |
| CTA | 美式的激进号召性用语 |
| 习语 | 按字面翻译的英语表达 |
| 法律引用 | 在本地法律适用时引用外国法律（CCPA、FTC），而非本地法律（DSGVO、RGPD） |
| 文化引用 | 外国的节日、活动和习俗 |
| 货币与定价 | 未经换算或未提供背景说明的 USD |
| 语气 | 对目标市场而言过于随意或过于正式 |
| 称呼形式 | Sie/du、tu/vous、正式/非正式称呼不一致 |

输出一份审查报告，列出每个目标及其严重程度（严重、
建议、可选）。

### 阶段 3：适配

#### 3a. 示例替换

将外国示例替换为本地对应示例：

- 使用 WebSearch 查找本地案例研究、品牌或场景。
- 直接在原文中替换，同时保留相同的论点和结构。
- 对于每项不明显的本地替换，记录来源 URL、访问日期和替换理由。
- 如果不存在本地对应示例，则保留原示例，但添加本地背景说明
  （“在德国市场中，对应的动态是 X”）。

#### 3b. 统计数据本地化

- 使用本地一手或高质量来源替换统计数据：
  国家统计机构、监管机构、官方行业组织、学术
  数据集，或具名且说明了研究方法的研究报告。
- 不要依赖通用 WebSearch 摘要作为证据。获取被引用的页面，
  核实数据及其上下文，并记录来源 URL 和日期。
- 仅在完成 SSRF 检查后获取被引用的页面：只允许 `https` URL；拒绝
  `javascript:`、`data:`、`file:`、localhost、环回地址、私有地址、链路本地地址、
  组播地址，以及 DNS 解析后的保留 IP；禁用重定向，或
  使用相同的检查验证最终 URL；限制重定向次数、响应大小
  和请求时长；记录最终 URL 和访问日期。
- 如果存在研究方法可比的本地数据，应同时替换来源和
  数据。每项声明只保留一个具名来源。
- 如果本地数据与之相关，但使用了不同的研究方法或时间范围，则
  不要直接替换。保留原声明的适用范围，或重写声明，使其
  与本地来源一致。
- 如果不存在，则保留原统计数据，但标明其地理适用范围（“在
  美国，……”）。
- 绝不能删除来源归属信息。

#### 3c. CTA 调整

根据文化画像重写行动号召：

- 调整强势程度（DACH 和 JA 偏好信息型表达，US 偏好
  祈使型表达）。
- 使用符合当地文化的行动动词。
- 调整紧迫感的表达方式。

#### 3d. 语气校准

- 根据画像匹配正式程度（DACH 的 B2B 场景默认使用 Sie，B2C
  生活方式类场景使用 du；FR 默认使用 vous；JA 会根据受众显著调整语体）。
- 确保整篇文档始终一致地使用正式或非正式称谓。
- 遵循当地的内容风格惯例。

#### 3e. 法律和监管背景

- 按议题和司法管辖区映射法律引用。当声明专门涉及美国合规要求时，
  保留原法律。只有当地法律处理同一议题时才进行替换，例如在 DE
  将 CCPA 替换为 DSGVO，在 FR 替换为 RGPD，在 BR 替换为 LGPD，在 MX
  替换为 LFPDPPP，在 CO 替换为 Ley 1581，或在 AR 替换为 Ley 25.326。
- 在有助于读者理解的情况下，添加本地合规说明。
- 删除无关的外国监管引用。

#### 3f. 品牌示例替换（快速对照表）

`../blog-translate/references/cultural-adaptation.md` 中的画像提供了
替换表。常见示例如下：

| 来源（US） | DACH | FR | ES（西班牙） | LATAM | JA |
|-------------|------|----|----|-------|----|
| Walmart | MediaMarkt | Carrefour | El Corte Inglés | Walmart MX | Aeon |
| Target | Saturn | Auchan | Hipercor | Liverpool | Ito-Yokado |
| FTC | Bundeskartellamt | DGCCRF | CNMC | PROFECO (MX) | JFTC |
| CCPA | DSGVO | RGPD | RGPD | LFPDPPP (MX), Ley 1581 (CO), Ley 25.326 (AR), LGPD (BR) | APPI |

### 阶段 4：质量验证

- 已处理所有关键调整目标。
- 全文语气一致。
- 不再残留源地区标记。
- 统计数据具有有效来源（原始来源或本地化来源）。
- CTA 符合当地文化预期。
- 正式或非正式称谓从头到尾保持一致。
- 内容仍然支持与原文相同的论点。
- SEO 元素在关键词布局之外仍保持优化：本地化标题和
  meta、标题意图、slug、alt text、内部链接锚文本、同语言
  canonical、hreflang 兼容性，以及 schema `inLanguage`。
- 字数处于该语言对的预期比例范围内。

### 阶段 5：保存并报告

1. 保存本地化版本。默认：将审核后的副本写入
   `{slug}-localized.{ext}`。仅当用户要求覆盖时才覆盖已翻译的文件；覆盖前，创建带时间戳的备份并
   显示差异摘要。确保所有输出路径均解析到项目根目录内，并
   拒绝路径遍历、符号链接路径或向该根目录之外写入。

2. 显示摘要：

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
| 没有该区域设置的文化档案 | 基于自定义区域设置模板构建最小档案，然后继续 |
| 文件并非使用预期语言 | 警告用户，并提议先进行翻译 |
| 没有可用的本地统计数据 | 保留原始统计数据，并添加地理范围说明 |
| 区域设置代码存在歧义（例如 `pt`） | 询问：“你指的是 `pt-BR`（巴西）还是 `pt-PT`（葡萄牙）？” |

## 交叉引用

- 前置步骤（翻译）：`/blog translate <file> --to <code>`
- 跨语言版本的质量保证：`/blog locale-audit <directory>`
- 一键式流程：`/blog multilingual <topic> --languages <codes>`