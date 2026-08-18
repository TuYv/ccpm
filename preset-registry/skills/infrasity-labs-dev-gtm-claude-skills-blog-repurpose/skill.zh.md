---
name: blog-repurpose
description: >
  Repurpose blog posts for social media, email, YouTube, Reddit, and LinkedIn.
  Generates Twitter/X threads, LinkedIn articles, YouTube scripts, Reddit
  discussion posts, email newsletter excerpts. Adapts tone for each platform.
  Use when user says "repurpose", "blog repurpose", "share blog", "social media",
  "twitter thread", "linkedin post", "youtube script", "reddit post".
user-invokable: true
argument-hint: "<file-path>"
---
# 博客内容再利用：跨平台内容适配

将博客文章转化为针对社交媒体、电子邮件、视频和社区渠道优化的内容。每项输出都会调整语气、格式和长度，以符合平台惯例和受众预期。

**FLOW 双触点思维（适用时）。** 当原始博客文章所针对的查询也出现在某个社区中（Reddit 帖子、YouTube 评论、LinkedIn 讨论）时，应以能够强化博客内容的方式，将其改编为社区内容。建立双向交叉链接：博客将社区讨论作为社会认同加以引用；社区帖子则将博客作为权威的长篇答案进行引用。这就是 FLOW 触点 5 的实际应用。有关双触点评分卡，请参阅 `skills/blog/references/flow-alignment.md` 和 `/blog flow win`。

## 工作流程

### 第 1 步：阅读与分析

阅读博客文章并提取核心内容要素：

- **标题** - 原始博客文章标题
- **关键洞见**（5-7 条）- 最重要的要点，每条都应是可独立理解的陈述
- **统计数据** - 所有注明来源和出处的数据点
- **引语** - 任何值得关注的引用或专家陈述
- **核心论点** - 用 1-2 句话概括中心论点
- **摘要** - 用 2-3 句话进行总结，使其本身即可提供完整价值
- **目标受众** - 博客的目标读者群体
- **主题类别** - 用于选择 subreddit 和话题标签

### 第 2 步：询问用户

提示用户选择要为哪些平台生成内容：

1. Twitter/X 帖子串
2. LinkedIn 文章
3. YouTube 视频脚本
4. Reddit 讨论帖
5. 电子邮件新闻简报节选
6. 以上全部

如果用户直接指定了平台（例如“改编为 Twitter 内容”），
则跳过此步骤，仅为该平台生成内容。

### 第 3 步：Twitter/X 帖子串

生成针对 Twitter/X 互动效果优化的完整帖子串：

**开场帖**（第 1 条）：
- 以引发好奇的问题或大胆的统计数据开场
- 必须少于 280 个字符
- 应能让用户停止滚动浏览
- 模式：“[令人惊讶的统计数据或反常识观点]。以下是[受众]需要了解的内容：”

**洞见帖**（第 2-6 条）：
- 每条包含一个关键要点，并且每条都能独立提供价值
- 尽可能加入统计数据及其来源
- 使用换行提高可读性
- 即使单独阅读，每条帖子也应能够成立

**结尾帖**（最后一条）：
- 用一句话总结核心要点
- 包含清晰的行动号召，并链接至完整文章
- 添加相关话题标签（每条帖子最多 2 个）
- 模式：“阅读完整分析：[link]\n\n#hashtag1 #hashtag2”

**帖子串格式规则：**
- 为清晰起见，使用 1/、2/ 等形式为帖子编号
- 任何一条帖子均不得超过 280 个字符
- 帖子串长度：共 7-9 条
- 语气：对话式、直接、洞见密集

### 第 4 步：LinkedIn 文章

针对 LinkedIn 的专业受众和内容格式调整博客：

**长度：** 800-1,200 词（短于博客文章）

**开场**（点击“查看更多”前可见的前 2-3 行）：
- 以个人故事、观察或反常识观点开场
- 这是吸引读者的钩子——必须能促使读者点击“查看更多”
- 绝不要以“我很高兴与大家分享……”或类似的陈词滥调开场

**正文结构：**
- 使用 LinkedIn 原生格式：用粗体文本强调重点、单行成段，
  各要点之间留出充足的空行
- 使用编号列表呈现关键要点
- 使用短段落（每段 1-3 句话）
- 包含 2-3 项关键统计数据及其来源
- 比原始博客更具个人色彩和观点倾向

**结尾：**
- 以鼓励读者发表评论的互动问题收尾
- 模式："你在 [topic] 方面有哪些经验？欢迎在评论区分享。"
- 正文中不得包含外部链接（LinkedIn 会降低其优先级）
- 改为在第一条评论中添加博客链接（在输出中注明这一点）

**语气：** 专业但自然亲切。采用第一人称视角。分享你学到或观察到的内容，而不只是陈述数据所反映的结果。

### 第 5 步：YouTube 脚本

生成一份以提高观众留存率为目标、结构完整的视频脚本：

**开场钩子**（0-15 秒）：
- 从博客最有力的洞见中提炼出大胆论断或令人惊讶的问题
- 模式："你知道 [shocking stat] 吗？今天，我将向你展示 [promise]。"
- 必须在观众离开之前抓住其注意力

**引言**（15-60 秒）：
- 观众将学到什么（3 个要点）
- 为什么这在当下很重要
- 简要说明可信度
- "[SHOW TITLE CARD]"

**主要内容**（3-5 个论述要点）：
- 从博客的 H2 章节中提炼
- 每个部分包括：关键观点、支持数据、实际示例
- 全程加入视觉提示：
  - `[SHOW CHART: description]` - 用于数据可视化
  - `[CUT TO SCREENCAST]` - 用于演示
  - `[B-ROLL: description]` - 用于丰富视觉画面
  - `[TEXT ON SCREEN: key stat]` - 用于强调
- 各部分之间使用过渡语句

**行动号召**（最后 15-30 秒）：
- 提示观众订阅并说明理由
- 在视频描述中添加完整博客文章的链接
- 预告下一个相关视频的主题

**脚本元数据：**
- 根据字数估算时长（口播速度约为每分钟 150 个单词）
- 建议标题（少于 60 个字符、关键词丰富）
- 建议缩略图构思（文字 + 视觉元素）
- 包含时间戳、博客链接和关键要点的视频描述

### 第 6 步：Reddit 帖子

将博客内容重新组织为真实自然的社区讨论：

**Subreddit 建议：**
- 根据博客主题推荐 2-3 个相关的 subreddit
- 考虑 subreddit 的规模、规则和发帖惯例
- 检查该 subreddit 是否允许链接，或更倾向于纯文本帖子

**帖子格式：**
- 标题：以问题或观察结果的形式呈现，而不是宣传博客
  - 好例子："分析了 500 个营销活动后，我发现了真正推动 ROI 的因素"
  - 坏例子："来看看我新发布的营销 ROI 博客文章"
- 以一个问题或有趣的观察开头
- 像向同行汇报结果一样分享关键发现
- 使用 Reddit Markdown 格式（标题、项目符号、粗体）
- 包含 3-5 个关键数据点及其来源
- 以讨论引导语结尾："还有其他人观察到类似的结果吗？"

**自我推广合规要求：**
- 遵循 10% 规则：自我推广内容最多只能占所发帖子的 10%
- 切勿使用标题党或误导性标题
- 在帖子本身提供真正的价值——即使不点击链接，读者也应有所收获
- 在末尾自然地附上博客链接："包含图表的完整分析：[link]"

**语气：** 同行之间、谦逊、以讨论为导向。绝不带有推销意味。

### 第 7 步：电子邮件新闻简报摘要

生成一个针对电子邮件互动进行优化的简洁新闻简报版块：

**主题行：**
- 40-60 个字符
- 以激发好奇心或传递价值为导向（不要使用标题党）
- 可选模式：
  - 好奇心："The [topic] metric nobody tracks (but should)"
  - 价值："[N] [topic] insights from [source/study]"
  - 紧迫性："[Topic] changed this month. Here's what to do."

**预览文本：**
- 40-90 个字符，对主题行形成补充（而非重复）
- 显示在收件箱中的主题行之后——将其视为第二个标题

**正文：**
- **TL;DR**（2-3 句话）：可独立理解的摘要，包含核心要点
- **3 个关键要点**（项目符号列表）：每个要点都包含一项统计数据及其来源
- **CTA**：指向完整博客文章的清晰链接
  - 按钮文本："Read the full analysis" 或类似的行动导向短语

**总长度：** 150-200 个单词。每个词都必须发挥作用。

**格式：**
- 使用短段落（1-2 句话）
- 将**关键短语加粗**，方便快速浏览
- 只使用一个 CTA（不要让多个链接相互争夺注意力）

### 第 8 步：保存

将所有生成的输出保存到 `repurposed/` 目录中，并使用特定于平台的
文件名：

```
repurposed/
  {slug}-twitter-thread.md
  {slug}-linkedin-article.md
  {slug}-youtube-script.md
  {slug}-reddit-post.md
  {slug}-email-newsletter.md
```

如果 `repurposed/` 目录不存在，请创建该目录。

保存后显示摘要：

```
## Repurposed Content: [Blog Title]

### Generated Outputs
- Twitter/X thread: repurposed/{slug}-twitter-thread.md (X tweets)
- LinkedIn article: repurposed/{slug}-linkedin-article.md (~X words)
- YouTube script: repurposed/{slug}-youtube-script.md (~X min estimated)
- Reddit post: repurposed/{slug}-reddit-post.md (X subreddits suggested)
- Email excerpt: repurposed/{slug}-email-newsletter.md (~X words)

### Quick Stats
- Key insights extracted: X
- Statistics reused: X across Y platforms
- Total content pieces: X

### Next Steps
- Review and customize each piece for your brand voice
- Schedule posts using your preferred social media tool
- For Twitter: post thread during peak hours (9-11am or 1-3pm local time)
- For LinkedIn: post Tuesday-Thursday for highest engagement
- For Reddit: post during US morning hours (8-10am EST)
```