---
name: blog-rewrite
description: >
  Rewrite and optimize existing blog posts for Google SEO (May 2026 Core
  Update, E-E-A-T) and AI citation visibility as one SEO discipline. For
  AI-citation-only audit (no Google work), use blog-geo instead. Replaces
  fabricated statistics with sourced data, applies answer-first formatting,
  adds images, generates SVG charts, and updates freshness signals. Works
  with any blog format (MDX, markdown, HTML). Use when user says "rewrite
  blog", "optimize blog", "update blog", "improve blog", "fix blog".
user-invokable: true
argument-hint: "<file-path>"
license: MIT
---
# 博客重写器：优化现有文章

重写并优化现有博客文章，以同时提升在 Google 搜索和 AI 引用平台上的排名。在应用
六大优化支柱的同时，保留作者的写作风格。

**关键参考资料：**
- `skills/blog/references/quality-scoring.md` - 5 类评分（内容 30、SEO 25、E-E-A-T 15、技术 15、AI 引用 15）
- `skills/blog/references/eeat-signals.md` - 经验、专业知识、权威性和可信度标志
- `skills/blog/references/internal-linking.md` - 链接策略和锚文本规则
- `skills/blog/references/visual-media.md` - 图片来源和图表样式
- `skills/blog/references/synthesis-contract.md` - 重写期间用于保持再次引用规范的 6 条 LAWs（v1.8.0；跨 Skill 引用位于编排器的 references 目录中）
- `skills/blog/references/research-quality.md` - 用于替代统计数据研究的跨来源聚类（v1.8.0）

## 交叉引用

有关 21 个以证据为导向、可直接应用于重写工作的优化提示词（质量跟进、CTR 审核、schema、
PAA 改写、技术审核、ChatGPT 可见性），请参阅 `/blog flow optimize`。

## 工作流程

### 阶段 1：审核（只读）

1. **阅读博客文章** - 检测格式（MDX、markdown、HTML）
2. **依据 `skills/blog/references/quality-scoring.md` 运行质量检查清单**：
   - 统计虚构数据与有来源数据的数量
   - 检查答案优先格式（H2 -> 第一句中是否包含统计数据？）
   - 统计图片和图表数量（类型是否多样？）
   - 结合上下文审查段落节奏；仅将长度记录为描述性辅助信息
   - 检查标题层级（H1 -> H2 -> H3，是否存在跳级？）
   - 检查 schema 是否存在且有效，优先关注 Article/BlogPosting、Person、Organization 和 BreadcrumbList；FAQPage 仅作为可选的实体标记
   - 检查时效性信号（lastUpdated、dateModified）
   - 评估自我推广程度
   - 评估引用层级的质量
3. **建议性编辑风格扫描**：
   - **句子长度变化** - 当节奏需要
     审查时，以描述性方式报告。它无法判定作者身份，也没有通过/不通过阈值。
   - **已知 AI 短语扫描** - 检查以下高频 AI 短语：
     - “在当今的数字环境中”、“需要注意的是”、“深入探讨”
     - “颠覆性变革”、“驾驭这一格局”、“彻底革新”、“无缝地”
     - “前沿的”、“充分利用……的力量”、“利用”（作为动词）
     - “深入研究”、“至关重要”、“提升”、“促进”、“格局”（过度使用）
     - “多层面的”、“稳健的”、“织锦”、“开启”
     - 完整列表见 `agents/blog-writer.md`
   - **词汇样本** - 以描述性方式报告词符比（TTR），并
     结合文本长度和专业术语对其进行解读。
   - 切勿根据 TTR、句子长度变化、标点符号或短语密度推断 AI 作者身份。
     这些仅是针对项目风格的建议性观察。
   - **二阶结构惯性扫描**（v1.8.0）- 上述一阶检查
     针对词汇层面。二阶检查审查那些可能在简单措辞修改后仍然存在的
     结构性重复。依据
     `skills/blog/references/ai-slop-detection.md` 执行。至少标记：
     - 不符合读者意图的重复问句节奏 H2
     - 三个或更多以“这里……”开头的段落
     - 任意 200 词窗口中，三分句句式节奏占比超过 50%
     - 任意 20 词范围内出现超过 2 个模糊限定词（“可能”、“经常”、“通常”、“一般而言”）
     - 对称式列表膨胀（列表项字数标准差低于 5）
     - 超过 2 个用于收尾的反问句（“这对……意味着什么？”）
     - 超过一半的 H2 开头以过渡词起始
     - 以“关键洞见是……”或“这里重要的是……”作为句子开头
     - 列表文章在进入列表前的引言超过 250 词
     - 开头词重复：使用频率最高的三个首词占比超过 25%
     - 段落形态标准差低于 25（视觉单调）
     运用编辑判断；这些指标均不会改变评分或阻止交付。
4. **视频嵌入检查**：
   - 统计文章中现有的 YouTube 嵌入数量
   - 如果嵌入数量为 0，则标记：“没有视频嵌入。可考虑在能够提供有用背景信息时，添加相关的高质量 YouTube 嵌入。”
   - 如果存在，则检查：是否延迟加载？是否有 aria-labels？是否有 noscript 后备内容？是否有 VideoObject schema？
5. **关键词蚕食检查**：
   - 根据标题、H1 和第一段识别文章的主要关键词
   - 在博客目录中搜索以相同关键词为目标的其他文章：
     - 对所有博客文章的标题和元描述执行 Grep
     - 标记任何存在显著关键词重叠的文章
   - 如果发现关键词蚕食，则报告：
     - 哪些文章在竞争同一个关键词
     - 建议：**合并**（整合为一篇更强的文章）或**差异化**
       （将其中一篇文章转向相关但不同的关键词）
6. **计算当前评分**，涵盖 5 个类别：
   - 按 5 个类别评分（内容质量 30、SEO 优化 25、E-E-A-T 信号 15、技术要素 15、AI 引用就绪度 15）
   - 总分：0-100
7. **提供审核摘要**，包含具体发现、建议性风格诊断、视频状态、关键词蚕食状态和评分
8. **进入计划模式** - 提供按章节划分的优化计划

继续操作前，请等待用户批准。

### 阶段 2：研究

1. **从现有内容中识别博客的核心主题**
2. **为所有虚构或无来源的数据寻找替代统计数据**：
   - 搜索：`[topic] study 2025 2026 data statistics`
   - 仅使用一级至三级来源
3. **如果文章中的图片少于 3 张，则寻找图片**：
   - 如有可用内容，优先选择原创截图、产品视觉素材、图表或数据图形
   - 对于图库素材，请使用 Openverse、Unsplash、Pexels 或 Pixabay 等官方提供商 API，以便记录许可证、创作者、来源 URL 和下载 URL
   - 将获准使用的素材下载到本地，保存署名信息，并拒绝 `javascript:`、`data:` 和 `file:` URL
   - 如果 `blog-image` 可用，则提议使用 AI 生成缺失或不足的图片，并记录所选模型 ID
4. **如果文章中的图表少于 2 个，则规划图表**：
   - 识别适合可视化的数据
   - 选择多样化的图表类型

### 阶段 3：图表生成（内置）

当文章需要更多视觉元素时，调用 `blog-chart` 子技能：

1. 按照多样性规则选择图表类型（每篇文章不得重复使用相同类型）
2. 传入：图表类型、标题、数据值、来源、平台格式
3. 将返回的 SVG 直接嵌入 `<figure>` 包装器中
4. 每篇 2,000 字的文章以包含 2-4 个图表为目标

有关图表类型选择和样式规则，请参阅 `skills/blog/references/visual-media.md`。

### 阶段 4：内容重写

按以下顺序应用更改：

#### 4a. 保留有效内容
- 保留作者的表达风格和独特视角
- 保留原创见解和第一手经验
- 保留现有的高质量图片和图表
- 保留内部链接

#### 4b. 修正 Frontmatter
- 仅当重写对事实、方法或建议产生实质性更改时，才更新 `lastUpdated`
- 保持原始 `date` 不变
- 修正元描述，使其准确、具体地概括
  可见内容
- 如果缺失，则添加 `coverImage` + `coverImageAlt` + `ogImage`
  - 在 Pixabay/Unsplash/Pexels 上搜索宽幅主视觉图片（1200x630）
  - 或通过 `blog-chart` 生成自定义 SVG 封面（带关键统计数据的渐变背景文字）
  - 或在可用时通过 `blog-image` 子技能生成自定义 AI 图片；记录模型 ID
- 验证标签/分类是否恰当

#### 4c. 应用目的优先的格式
尽早说明重要章节的要点，然后补充每项声明所需的经核实证据和
背景信息。不要强行添加统计数据或限定字数区间。

#### 4d. 替换虚构统计数据
- 搜索以下模式："X% of..."、"X out of Y..."、无来源声明
- 使用一级至三级来源中的真实数据进行替换
- 为每项重要声明提供足够的出处信息，以便核实和解读。必要时应包括
  发布者或文档详情、相关日期、研究方法、局限性以及
  稳定 URL；不要强制使用固定的引用格式。

#### 4e. 改进标题
- 根据读者意图使用疑问式或陈述式标题；不设比例目标
- 确保关键词自然地出现在 2-3 个标题中

#### 4f. 修正段落长度
- 仅在有助于理解时拆分段落
- 将段落长度作为可选的规划参考，而非固定目标
- 确保每个段落都以最重要的句子开头

#### 4g. 添加视觉元素
- 在 H2 标题后嵌入新图片，并均匀分布
- 在相关章节中嵌入图表
- 如果 `blog-image` 可用：为缺少合适图库素材的章节生成自定义图片，优先使用当前的图片模型注册表，并记录模型 ID
- 根据检测到的平台调整嵌入格式（MDX、markdown 或 HTML）

#### 4h. 添加视频嵌入
如果文章缺少 YouTube 视频嵌入：
- 使用 `skills/blog/references/video-embeds.md` 中的质量标准搜索 2-3 个相关视频
- 使用适合平台的格式嵌入（srcdoc 延迟加载）
- 放置位置：引言后 1 个，文章中部章节 1-2 个
- 为 AI 爬虫添加 noscript 后备内容

#### 4i. 添加或改进 FAQ
- 如果查询集表明有必要添加 FAQ，且当前不存在 FAQ，则添加一个（3-5 个问题）
- 如果已存在 FAQ，确保回答完整，并在需要时提供经过验证的依据
- FAQPage 仅为可选的实体标记。Google 已于 2026-05-07 对所有网站全面停用 FAQ 富媒体搜索结果，因此不要将 FAQPage 作为 Google 富媒体搜索结果的核心准入条件。

#### 4j. 减少自我宣传
- 最多提及品牌 1 次（仅限作者简介语境）
- 删除“在 [Company]，我们……”这类表述
- 将宣传性章节改为教育性内容

#### 4k. 基于证据的解释
对于重要论断，生成或改进能够独立成立的完整解释，并提供
足够的背景信息和经过验证的依据。不要为了填充内容而扩展每个 H2。
- 自然地放在章节正文中，而不是作为单独的醒目提示

示例：
```markdown
[Verified source title], a [method or sample description] published on [date],
found [specific metric] for [audience or market] ([Source name](https://example.com/full-report),
retrieved YYYY-MM-DD). In practical terms, connect the evidence to one action
the reader should take before making a claim or changing a workflow.
```

不要将解释填充到固定长度，也不要仅仅为了获得就绪度
分数而添加解释。

#### 4l. 项目语气和重复内容审查
仅在有助于改善已配置语气时应用以下转换：
- **消除长破折号** - 将每个 U+2014 字符替换为逗号、连字符、
  冒号或句号。必要时拆分句子。这是项目的风格规则。
- **替换标记出的短语** - 将检测到的每个 AI 短语（来自
  阶段 1 步骤 3 的扫描）替换为自然的表达。示例：
  - “需要特别注意的是” -> “值得注意的是”或“请记住”
  - “在当今的数字环境中” -> “现在”或“在 [具体年份]”
  - “利用” -> “使用”“应用”“充分利用”
  - “深入探讨” -> “查看”“探索”“深入研究”
  - “稳健的” -> “强大的”“扎实的”“可靠的”
  - “至关重要的” -> “关键的”“必不可少的”“重要的”（或重构句子）
- **有意识地改变句子长度** - 重写后扫描每个段落。
  在较长的句子（18-25 个单词）之间插入简短有力的句子（5-10 个单词）。
  目标：长度相差不超过 5 个单词的连续句子不超过 3 个。
- **谨慎使用反问句** - 仅当有助于明确读者下一步决策时才添加一个。
- **自然使用缩写形式** - 在听起来自然的情况下，将正式表达替换为缩写形式：
  “it is” -> “it's”，“we have” -> “we've”，
  “do not” -> “don't”，“is not” -> “isn't”。
- **支持第一手表述** - 仅当方法、观察结果或证据能够证实相关论断时，
  才保留“我们测试过”或“根据我们的经验”等表述。

#### 4m. 摘要框（关键要点）
如果文章缺少摘要框，请在引言后立即添加：
```markdown
> **Key Takeaways**
> - [Core finding with statistic and source]
> - [Second key insight or recommendation]
> - [Third actionable takeaway]
> (Use concise bullets sized to the material. Keep the summary self-contained so the reader gets
> the core value without reading the full article.)
```
默认标签为 "Key Takeaways"，但可以根据不同的角色设定或品牌语调进行配置（例如 "The Bottom Line"、"Quick Summary"、"What You Need to Know"）。

如果现有的 TL;DR 框有用，请将其转换为简洁的关键要点，并验证每一项事实陈述都有依据。不要仅仅为了符合格式而添加统计数据。

#### 4n. 信息增益标记注入
检查文章是否包含原创价值，并为其添加标记：
- `[ORIGINAL DATA]` - 作者亲自收集的任何专有数据、调查结果、实验或案例研究指标
- `[PERSONAL EXPERIENCE]` - 第一手观察和经验教训
- `[UNIQUE INSIGHT]` - 由数据支持的新颖分析或反主流观点

如果文章缺少原创价值标记：
- 请作者提供可纳入文章的第一手数据或经验
- 至少添加以新方式关联现有研究的分析性见解
- 目标：每篇文章至少包含 2-3 个标记

根据文章风格，使用 HTML 注释（`<!-- [ORIGINAL DATA] -->`）或可见的醒目标注。

### 阶段 5：验证

重写后，验证所有质量门槛均已通过：

#### 核心质量门槛
1. 重要主张清晰表达其要点，并在需要时提供经过验证的依据
2. 段落和句子的节奏适合目标受众；不能仅因长度而判定审核不通过
3. 不得捏造任何统计数据
4. 标题层级清晰
5. 以文章为优先的 schema 已提供且有效；仅在有用时将 FAQPage 用作可选的实体标记
6. 图片具有描述性的 alt 文本
7. frontmatter 中包含封面图片（coverImage + ogImage）
8. 如果是 MDX：构建项目以验证不存在编译错误

#### 新增元素验证
9. 可选摘要具有实用价值，且不包含无依据的主张
10. 所有信息增益标记均指向有依据的原创材料
11. 重要且可复用的主张能够独立成立，并有证据支持
12. 已标记内部链接区域或已提供实际链接（每 2,000 个单词包含 5-10 个）
13. 已结合上下文检查项目配置的风格词表中的术语

#### 编辑风格检查
14. 以描述性方式检查句子长度变化，不对作者身份作出判断
15. 全文自然使用缩略形式
16. 仅在有用时使用反问句
17. 不包含无依据的第一手主张
18. 与阶段 1 的审核相比，全部 5 个类别的评分均有所提高
19. YouTube 视频嵌入已提供延迟加载、aria-labels 和 noscript 回退内容

### 阶段 6：总结

```
## Blog Optimization Complete: [Title]

### Score Change
- Before: [X]/100 ([Rating])
  - Content Quality: [X]/30
  - SEO Optimization: [X]/25
  - E-E-A-T Signals: [X]/15
  - Technical Elements: [X]/15
  - AI Citation Readiness: [X]/15
- After: [Y]/100 ([Rating])
  - Content Quality: [Y]/30
  - SEO Optimization: [Y]/25
  - E-E-A-T Signals: [Y]/15
  - Technical Elements: [Y]/15
  - AI Citation Readiness: [Y]/15

### Editorial Style Diagnostics
- Configured style-list terms reviewed: [N]
- Sentence-length variation: [descriptive observation]
- These observations do not infer authorship and do not affect the score.

### Cannibalization
- [Status: none found / flagged N posts / resolved]

### Changes Made
- [X] statistics replaced with sourced data
- [X] SVG charts added (types: ...)
- [X] images added from Pixabay/Unsplash
- Answer-first formatting applied to [N] H2 sections
- FAQ section updated with [N] questions; FAQPage emitted only as optional entity markup if appropriate
- TL;DR box: [added/updated]
- Information gain markers: [N] ([types])
- Evidence-backed explanations improved: [N]
- Configured project style-list terms reviewed: [N]
- lastUpdated set to [date]
- Self-promotion reduced to [N] mentions

### Visual Elements
- Charts: [count] ([types])
- Images: [count]
- YouTube videos: [count] ([titles])

### Ready for
- `/blog analyze <file>` to verify final score
- Publishing / deploying
```

## 阶段 5.5：交付契约执行 (v1.9.0)

在呈现改写后的草稿之前，请按照 `skills/blog/references/blog-delivery-contract.md` 执行五道关卡的交付契约。该契约对改写文章和新文章同样适用：用户绝不能成为第一位审阅者。

步骤：

1. **首图检查**：如果现有文章已经引用了首图，且该图片仍存在于磁盘上，请予以保留。如果改写导致主题发生重大变化，或者首图缺失，请通过 `python3 scripts/generate_hero.py --topic "<new title>" --tags "<tags>" --out <folder>` 重新生成。
2. **重新渲染**：运行 `python3 scripts/blog_render.py --md <slug>.md --out-dir <folder>`，根据更新后的 `.md` 刷新 `.html` 和 `.pdf`。
3. **分派审阅者**：分派 `blog-reviewer` 代理审阅渲染后的 `.html`。阈值：评分达到或高于 90/100，且 P0 问题为零。
4. **预检**：运行 `python3 scripts/blog_preflight.py --draft <folder> --strict`。退出码为 0 = 可交付；退出码为 1 = 阻止交付。
5. **失败时迭代**：最多迭代 3 次。第 3 次失败后，停止并呈现 `<folder>/preflight-report.json` 中的诊断信息。

改写文章的隐含门槛更高，因为现有草稿很可能已经发布。重新呈现比原文更差的内容是不可接受的。如果改写后的评分低于原文评分，这本身就构成 P0 情况。

## 更新模式

当通过 `/blog update <file>` 调用时，重点关注内容的新鲜度：
1. 将统计数据更新为最新可用数据（2025-2026）
2. 添加自上次更新以来的新进展
3. 更新已有一年以上的图片
4. 更新 frontmatter 中的 `lastUpdated`
5. 保留现有结构——尽量减少改写
6. 目标：只进行真正提升新鲜度的更新。替换过时的统计数据，添加真实的新进展，并更新 `lastUpdated`/`dateModified`；不要为了达到某个改动百分比阈值而改写。