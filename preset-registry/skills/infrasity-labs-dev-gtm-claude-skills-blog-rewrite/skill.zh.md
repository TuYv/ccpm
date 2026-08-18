---
name: blog-rewrite
description: >
  Rewrite and optimize existing blog posts for Google rankings (December 2025
  Core Update, E-E-A-T) and AI citations (GEO/AEO). Full rewrite for both
  Google rankings AND AI citations. For AI-citation-only audit (no Google
  work), use blog-geo instead. Replaces fabricated statistics with sourced
  data, applies answer-first formatting, adds Pixabay/Unsplash images,
  generates built-in SVG charts, injects FAQ schema, performs AI content
  detection, adds citation capsules and information gain markers, and
  updates freshness signals. Works with any blog format (MDX, markdown,
  HTML). Use when user says "rewrite blog", "optimize blog", "update blog",
  "improve blog", "fix blog", "refresh blog post", "blog optimization".
user-invokable: true
argument-hint: "<file-path>"
---
# 博客重写器：优化现有文章

重写和优化现有博客文章，以同时提升其在 Google 搜索和 AI 引用平台上的排名。在应用 6 大优化支柱的同时，保留作者的写作风格。

**关键参考资料：**
- `references/quality-scoring.md` - 5 类评分（内容 30、SEO 25、E-E-A-T 15、技术 15、AI 引用 15）
- `references/eeat-signals.md` - 经验、专业知识、权威性和可信度标记
- `references/internal-linking.md` - 链接策略和锚文本规则
- `references/visual-media.md` - 图片来源和图表样式
- `skills/blog/references/synthesis-contract.md` - 重写期间确保再次引用规范的 6 条法则（v1.8.0；跨 Skill 引用位于编排器的参考资料目录中）
- `skills/blog/references/research-quality.md` - 用于替代统计数据研究的跨来源聚类（v1.8.0）

## 交叉引用

有关可直接应用于重写工作的 21 个证据驱动型优化提示词（AI 检测器测试、CTR 审核、schema、PAA 改写、技术审核、ChatGPT 可见性），请参阅 `/blog flow optimize`。

## 工作流

### 阶段 1：审核（只读）

1. **阅读博客文章** - 检测格式（MDX、markdown、HTML）
2. **依据 `references/quality-scoring.md` 运行质量检查清单**：
   - 统计虚构数据与有来源数据的数量
   - 检查答案优先格式（H2 -> 第一句中是否包含统计数据？）
   - 统计图片和图表数量（类型是否多样？）
   - 测量段落长度（是否有超过 150 个单词的段落？）
   - 检查标题层级（H1 -> H2 -> H3，是否存在跳级？）
   - 查找 FAQ schema
   - 检查时效性信号（lastUpdated、dateModified）
   - 评估自我推广程度
   - 评估引用来源层级的质量
3. **AI 内容检测扫描**：
   - **突发性得分** - 测量整篇文章中句子长度的差异。差异较低（大多数句子的长度相差在 3-5 个单词以内）是明显的 AI 信号。计算方式：句子单词数的标准差。目标 SD > 6。
   - **已知 AI 短语扫描** - 检查以下高频 AI 短语：
     - "in today's digital landscape"、"it's important to note"、"dive into"
     - "game-changer"、"navigate the landscape"、"revolutionize"、"seamlessly"
     - "cutting-edge"、"harness the power of"、"leverage"（用作动词）
     - "delve"、"crucial"、"elevate"、"foster"、"landscape"（过度使用）
     - "multifaceted"、"robust"、"tapestry"、"embark"
     - 完整列表位于 `agents/blog-writer.md`
   - **词汇多样性** - 计算类符-形符比（TTR）：不同单词数 /
     总单词数。较低的 TTR（< 0.40）表明可能存在 AI 生成的重复措辞。
     自然文风的目标为 TTR > 0.50。
   - **AI 内容比例估算** - 根据突发性、短语密度和
     TTR，估算内容中读起来像 AI 生成的比例（0-100%）。
     按以下格式报告："AI content estimate: ~X%"
   - **二阶结构性惯性扫描**（v1.8.0）- 上述一阶检查位于词汇层面。二阶检查用于捕捉替换掉明显词语后仍然残留的特征：LLM 默认采用的结构和节奏习惯。依据
     `skills/blog/references/ai-slop-detection.md` 执行检查。至少标记：
     - 问句式 H2 占标题总数的比例超过 70%
     - 有三个或更多以 "Here..." 开头的段落
     - 任意 200 词窗口内，三分句式句子节奏的占比超过 50%
     - 任意 20 词范围内出现超过 2 个模糊限定词（"may"、"often"、"typically"、"generally"）
     - 对称列表膨胀（列表项单词数的 SD 低于 5）
     - 超过 2 个总结式反问句（"What does this mean for...?"）
     - 超过一半的 H2 开篇以过渡词起始
     - 以 "The key insight is..." 或 "What's important here is..." 开头的句子
     - 列表式文章在列表前的引言超过 250 个单词
     - 开头词重复：使用频率最高的三个首词所占比例超过 25%
     - 段落形态的 SD 低于 25（视觉单调）
     只有两轮检查均无问题时，草稿才算通过“AI 检测清洁”标准。两套命名空间术语（内容冗余检测使用一阶/二阶，来源权威性使用 Tier 1/2/3）是有意为之：有关这些标签为何在 v1.8.1 中出现分化，请参阅 `skills/blog/references/ai-slop-detection.md`。
4. **视频嵌入检查**：
   - 统计文章中现有的 YouTube 嵌入数量
   - 如果嵌入数量为 0，则标记："No video embeds. YouTube has the strongest AI visibility correlation (0.737)"
   - 如果存在，则检查：是否使用延迟加载？是否有 aria-labels？是否有 noscript 回退？是否有 VideoObject schema？
5. **关键词蚕食检查**：
   - 根据标题、H1 和第一段确定文章的主要关键词
   - 在博客目录中搜索定位相同关键词的其他文章：
     - 对所有博客文章中的标题和 meta 描述执行 Grep 搜索
     - 标记关键词存在显著重叠的所有文章
   - 如果发现关键词蚕食，则报告：
     - 哪些文章在竞争同一个关键词
     - 建议：**合并**（整合为一篇更有竞争力的文章）或**差异化**
       （将其中一篇文章调整为定位相关但不同的关键词）
6. **计算当前得分**，涵盖 5 个类别：
   - 按 5 个类别评分（内容质量 30、SEO 优化 25、E-E-A-T 信号 15、技术要素 15、AI 引用就绪度 15）
   - 总分：0-100
7. **提交审核摘要**，包含具体发现、AI 检测结果、视频状态、关键词蚕食状态和得分
8. **进入计划模式** - 提交逐章节优化计划

继续操作前，请等待用户批准。

### 阶段 2：研究

1. **从现有内容中识别博客的核心主题**
2. **为任何虚构或无来源的数据查找替代统计数据**：
   - 搜索：`[topic] study 2025 2026 data statistics`
   - 仅使用第 1-3 级来源
3. **如果文章中的图片少于 3 张，则查找图片**：
   - Pixabay：`site:pixabay.com [topic keywords]`
   - Unsplash：`site:unsplash.com [topic keywords]`
   - 验证每个 URL 均返回 HTTP 200
   - 如果已配置 nanobanana-mcp，则提出通过 `blog-image` 使用 AI 生成缺失或不足的图片
4. **如果文章中的图表少于 2 个，则规划图表**：
   - 识别适合可视化的数据
   - 选择多样化的图表类型

### 阶段 3：图表生成（内置）

当文章需要更多视觉元素时，调用 `blog-chart` 子技能：

1. 使用多样性规则选择图表类型（每篇文章不得重复使用同一类型）
2. 传入：图表类型、标题、数据值、来源、平台格式
3. 将返回的 SVG 直接嵌入 `<figure>` 包装器中
4. 每篇 2,000 词的文章以包含 2-4 个图表为目标

有关图表类型选择和样式规则，请参阅 `references/visual-media.md`。

### 阶段 4：内容重写

按以下顺序应用更改：

#### 4a. 保留有效内容
- 保留作者的文风和独特视角
- 保留原创见解和第一手经验
- 保留现有的高质量图片和图表
- 保留内部链接

#### 4b. 修复 Frontmatter
- 添加 `lastUpdated: "YYYY-MM-DD"`（当天日期）
- 保持原始 `date` 不变
- 修复元描述：信息密集，150-160 个字符，包含 1 项统计数据
- 如果缺失，则添加 `coverImage` + `coverImageAlt` + `ogImage`
  - 在 Pixabay/Unsplash/Pexels 中搜索宽幅主图（1200x630）
  - 或通过 `blog-chart` 生成自定义 SVG 封面（渐变背景上的文字，并包含关键统计数据）
  - 或通过 `blog-image` 子技能生成自定义 AI 图片（如果已配置 nanobanana-mcp）
- 验证标签/分类是否恰当

#### 4c. 应用答案优先格式
每个 H2 章节都必须以一段 40-60 词的文字开头，其中包含：
- 至少一项带来源归属的具体统计数据
- 对标题隐含问题的直接回答

#### 4d. 替换虚构统计数据
- 搜索以下模式："X% of..."、"X out of Y..."、无来源的断言
- 使用第 1-3 级来源中的真实数据进行替换
- 始终包含行内来源归属：`([Source Name](url), year)`

#### 4e. 改进标题
- 在自然的情况下，将陈述式标题改为疑问式标题（目标占比 60-70%）
- 保留 2-3 个陈述式标题，以增加多样性
- 确保关键词自然地出现在 2-3 个标题中

#### 4f. 修复段落长度
- 拆分任何超过 150 词的段落
- 每段以 40-80 词为目标
- 确保每个段落都以最重要的句子开头

#### 4g. 添加视觉元素
- 在 H2 标题后嵌入新图片，并均匀分布
- 在相关章节中嵌入图表
- 如果已配置 nanobanana-mcp：为缺少优质图库匹配图片的章节生成自定义图片（通过 Task 调用 `blog-image` 子技能）
- 根据检测到的平台调整嵌入格式（MDX、markdown 或 HTML）

#### 4h. 添加视频嵌入
如果文章缺少 YouTube 视频嵌入：
- 使用 `references/video-embeds.md` 中的质量标准搜索 2-3 个相关视频
- 使用适合平台的格式进行嵌入（srcdoc 延迟加载）
- 放置位置：引言后 1 个，文章中部章节中 1-2 个
- 为 AI 爬虫提供 noscript 后备内容

#### 4i. 添加/改进 FAQ
- 如果没有 FAQ，则添加一个（3-5 个问题）
- 如果已有 FAQ，确保答案为 40-60 字，并包含统计数据
- 添加适合相应平台的 FAQ schema 标记

#### 4j. 减少自我宣传
- 最多提及品牌 1 次（仅限作者简介语境）
- 移除“在 [Company]，我们……”模式
- 将宣传性章节改为教育性内容

#### 4k. 注入引用胶囊
为每个 H2 章节生成（或改进现有的）引用胶囊：
- 每个 H2 包含一段 40-60 字、可独立理解的内容
- 包含：一项具体论断 + 一个数据点 + 来源归属
- 使用陈述性风格撰写，以便 AI 系统能够直接提取并引用
- 自然地放置在章节正文中，而不是作为单独的提示框

示例：
```markdown
According to a 2026 Gartner study, 58% of enterprise buyers now consult AI
assistants before contacting a vendor ([Gartner](https://www.gartner.com), 2026).
This shift means B2B content must answer specific questions concisely enough
for AI systems to extract and cite in their responses.
```

引用胶囊对应 `references/quality-scoring.md` 中的“AI 引用就绪度”类别
（15 分）。

#### 4l. 反 AI 检测模式
应用以下转换，减少可被检测为 AI 生成的写作模式：
- **消除长破折号** - 将每个长破折号（-）替换为逗号、连字符（-）、
  冒号或句号。必要时拆分句子。长破折号是 AI 写作的典型特征。
- **替换标记短语** - 将检测到的每个 AI 短语（来自
  阶段 1 第 3 步的扫描）替换为自然的表达。示例：
  - “需要特别注意的是” -> “值得注意的是”或“请记住”
  - “在当今的数字化环境中” -> “目前”或“在 [具体年份]”
  - “利用” -> “使用”、“应用”、“充分运用”
  - “深入探讨” -> “审视”、“探索”、“深入了解”
  - “稳健的” -> “强大的”、“扎实的”、“可靠的”
  - “至关重要的” -> “关键的”、“必要的”、“核心的”（或重构句子）
- **刻意改变句子长度** - 重写后，扫描每个段落。
  在较长句子（18-25 个词）之间插入简短有力的句子（5-10 个词）。
  目标：长度差在 5 个词以内的连续句子不超过 3 个。
- **加入反问句** - 每 200-300 个词至少添加一个反问句，
  以打破陈述句的单调感。
- **自然使用缩写形式** - 在听起来自然的地方，将正式表达替换为缩写形式：
  “it is” -> “it's”，“we have” -> “we've”，
  “do not” -> “don't”，“is not” -> “isn't”。
- **加入模糊限制语** - 穿插能体现真实经验的第一人称限制语：
  “根据我们的经验”、“我们发现”、“就我们所见”、
  “这往往会”、“这取决于具体情况”。

#### 4m. 摘要框（关键要点）
如果文章缺少摘要框，请在引言后立即添加：
```markdown
> **Key Takeaways**
> - [Core finding with statistic and source]
> - [Second key insight or recommendation]
> - [Third actionable takeaway]
> (3-5 bullets, 40-60 words combined. Self-contained - reader gets
> the core value without reading the full article.)
```
默认标签为“关键要点”，但可以根据不同的人设或品牌调性进行配置（例如，“结论”“快速摘要”“你需要了解的内容”）。

如果已有 TL;DR 框，请将其转换为关键要点的项目符号格式。验证其满足 40-60 个单词的要求，并包含至少一项注明来源的统计数据。

#### 4n. 信息增益标记注入
检查文章是否提供原创价值，并使用以下标记进行标注：
- `[ORIGINAL DATA]` - 作者亲自收集的任何专有数据、调查结果、实验数据或案例研究指标
- `[PERSONAL EXPERIENCE]` - 第一手观察和经验教训
- `[UNIQUE INSIGHT]` - 有数据支持的新颖分析或反主流观点

如果文章缺少原创价值标记：
- 请作者提供可纳入文章的第一手数据或经验
- 至少添加能够以新方式关联现有研究的分析性见解
- 目标：每篇文章至少包含 2-3 个标记

根据文章风格，使用 HTML 注释（`<!-- [ORIGINAL DATA] -->`）或可见的提示框。

### 阶段 5：验证

重写后，验证所有质量门槛均已通过：

#### 核心质量门槛
1. 每个 H2 均以统计数据和来源开头
2. 任何段落均不超过 150 个单词
3. 不得包含任何捏造的统计数据
4. 标题层级清晰
5. 包含带有 schema 的 FAQ 部分
6. 图片具有描述性 alt 文本
7. frontmatter 中包含封面图片（coverImage + ogImage）
8. 如果是 MDX：构建项目以验证不存在编译错误

#### 新增元素验证
9. 引言后包含 TL;DR 框（40-60 个单词，包含统计数据）
10. 至少包含 2-3 个信息增益标记
11. 主要 H2 部分中包含引用信息块（40-60 个单词，可独立理解）
12. 已标记内部链接区域或包含实际链接（每 2,000 个单词包含 5-10 个）
13. 禁用列表中不再残留可被检测为 AI 生成的短语

#### 节奏变化与自然度检查
14. 句子长度差异：SD > 6（长短句混合）
15. 全文自然使用缩略形式
16. 包含反问句（每 200-300 个单词 1 个）
17. AI 内容估算比例较审计基线有所降低
18. 与阶段 1 审计相比，全部 5 个类别的评分均有所提高
19. 包含 YouTube 视频嵌入，并具有延迟加载、aria-label 和 noscript 回退内容

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

### AI Detection
- Before: ~[X]% AI-detected content
- After: ~[Y]% AI-detected content
- Phrases replaced: [N]
- Burstiness improved: [before SD] -> [after SD]

### Cannibalization
- [Status: none found / flagged N posts / resolved]

### Changes Made
- [X] statistics replaced with sourced data
- [X] SVG charts added (types: ...)
- [X] images added from Pixabay/Unsplash
- Answer-first formatting applied to [N] H2 sections
- FAQ schema injected with [N] questions
- TL;DR box: [added/updated]
- Information gain markers: [N] ([types])
- Citation capsules: [N] across H2 sections
- AI phrases replaced: [N]
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

## 阶段 5.5：交付契约执行

在展示改写后的草稿之前，按照 `skills/blog/references/blog-delivery-contract.md` 执行五道关卡的交付契约。该契约对改写文章和新文章同样适用：绝不能让用户成为第一个审阅者。

步骤：

1. **首图检查**：如果现有文章已引用首图且该图片仍存在于磁盘上，则予以保留。如果改写后的主题发生了重大变化，或者首图缺失，则通过 `python scripts/generate_hero.py --topic "<new title>" --tags "<tags>" --out <folder>` 重新生成。
2. **重新渲染**：运行 `python scripts/blog_render.py --md <slug>.md --out-dir <folder>`，根据更新后的 `.md` 刷新 `.html` 和 `.pdf`。
3. **派发审阅任务**：派发 `blog-reviewer` 智能体审阅渲染后的 `.html`。通过阈值：评分达到或超过 90/100，并且 P0 问题为零。
4. **预检**：运行 `python scripts/blog_preflight.py --draft <folder> --strict`。退出码为 0 = 交付；退出码为 1 = 阻止交付。
5. **失败后迭代**：最多迭代 3 次。第 3 次失败后，停止并展示 `<folder>/preflight-report.json` 中的诊断结果。

改写文章具有更高的隐性门槛，因为现有草稿很可能已经发布。不得重新展示比原文更差的内容。如果改写后的评分低于原文评分，则该情况本身即构成 P0 条件。

## 更新模式

当通过 `/blog update <file>` 调用时，重点关注时效性：
1. 将统计数据更新为可获取的最新数据（2025-2026 年）
2. 补充自上次更新以来的新进展
3. 刷新已有 1 年以上的图片
4. 更新 frontmatter 中的 `lastUpdated`
5. 保留现有结构——尽量减少改写
6. 目标：至少更改 30% 的内容，以便被 AI 爬虫识别为“新鲜”内容