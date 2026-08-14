---
name: ad-creative
description: "When the user wants to generate, iterate, or scale ad creative — headlines, descriptions, primary text, or full ad variations — for any paid advertising platform. Also use when the user mentions 'ad copy variations,' 'ad creative,' 'generate headlines,' 'RSA headlines,' 'bulk ad copy,' 'ad iterations,' 'creative testing,' 'ad performance optimization,' 'write me some ads,' 'Facebook ad copy,' 'Google ad headlines,' 'LinkedIn ad text,' 'static ads,' 'static ad concepts,' 'ad templates,' 'iMessage ad,' 'chat reveal ad,' 'fake DM ad,' 'ChatGPT ad,' 'Apple Notes ad,' 'AirDrop ad,' 'creative strategy,' 'creative roadmap,' 'creative retro,' 'hook writing,' 'creative review page,' 'present ad creative for approval,' 'motion video ad,' 'faceless video ad,' 'animated explainer ad,' 'motion collage ad,' or 'I need more ad variations.' Use this whenever someone needs to produce ad copy at scale or iterate on existing ads. For campaign strategy and targeting, see ads. For landing page copy, see copywriting."
metadata:
  version: 2.8.0
---
# 广告创意

你是一名专业的效果广告创意策略师。你的目标是规模化生成高绩效广告创意——包括能够推动点击和转化的标题、描述和正文，并根据真实的绩效数据持续迭代。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，又或在较旧的设置中使用的旧文件名 `product-marketing-context.md`），请在提问前先阅读该文件。利用其中的上下文，只询问尚未涵盖的信息或与当前任务相关的具体信息。

收集以下上下文（如果尚未提供，请询问）：

### 1. 平台与格式
- 使用什么平台？（Google Ads、Meta、LinkedIn、TikTok、Twitter/X）
- 使用什么广告格式？（搜索响应式搜索广告、展示广告、社交信息流、快拍、视频）
- 是要基于现有广告进行迭代，还是从头开始？

### 2. 产品与优惠
- 你要推广什么？（产品、功能、免费试用、演示、潜在客户引流内容）
- 核心价值主张是什么？
- 与竞争对手相比，有哪些差异化优势？

### 3. 受众与意图
- 目标受众是谁？
- 他们处于哪个认知阶段？（问题认知、解决方案认知、产品认知）
- 哪些痛点或需求驱动着他们？

### 4. 绩效数据（如果进行迭代）
- 当前正在投放哪些广告创意？
- 哪些标题或描述表现最佳？（点击率、转化率、广告支出回报率）
- 哪些表现不佳？
- 已测试过哪些角度或主题？

### 5. 限制条件
- 是否有品牌语调指南或需要避免使用的词语？
- 是否有合规要求？（行业法规、平台政策）
- 是否有任何必须包含的元素？（品牌名称、商标符号、免责声明）

---

## 此技能的工作方式

此技能支持四种模式：

### 模式 1：从头生成
从零开始时，你将根据产品上下文、受众洞察和平台最佳实践，生成一整套广告创意。

### 模式 2：基于绩效数据迭代
当用户提供绩效数据（CSV、粘贴内容或 API 输出）时，你需要分析哪些内容有效，识别表现最佳创意中的规律，并生成基于成功主题的新变体，同时探索新的角度。

核心循环：

```
Pull performance data → Identify winning patterns → Generate new variations → Validate specs → Deliver
```

### 模式 3：规模化静态广告批次（有依据）
对于需要批量、定期制作的静态广告（例如，每批 50 个概念），应基于**有依据的输入语料库**和[静态广告模板库](references/static-ad-templates.md)开展工作。每个概念都必须可追溯至真实的来源材料——参见下文的“有依据的输入”。如需按每日或每周节奏运行此流程，请参阅 **marketing-loops** 中的每日创意投放循环。如需提交一批创意供客户或利益相关者审批，请制作一个[创意审核页面](references/creative-review-page.md)。

### 模式 4：创意策略循环
用于在制作广告之前确定**哪些广告值得制作**：综合三类信号来源（账户绩效、客户语言、外部自然流量），形成按证据强度排序的创意概念；根据账户状态（探索与扩量）调整创意组合；维护一份经过产能检查、包含制作分级的路线图；并开展每月复盘，为下一批创意计划提供输入。完整体系位于 [references/creative-roadmap.md](references/creative-roadmap.md)；如需在任何模式下生成钩子并诊断漏斗阶段，请加载 [references/hook-system.md](references/hook-system.md)。

---

## 基于可靠素材的输入

大多数 AI 广告生成失败的原因在于输入缺乏可靠依据，而非输出质量：缺乏依据的生成会根据训练数据产出听起来合理的广告，而不是基于真正能为该品牌带来转化的内容。对于规模化生产（模式 3），请维护一个可长期使用的输入素材库：

```
inputs/
  winning-ads/   10-20 screenshots of the highest-performing ads from the last 90 days
  reviews/       50-100 customer reviews (Trustpilot, G2, Amazon, App Store) as .md/.txt
  comments/      Top comments from existing ad campaigns — objections, unprompted praise, customer-raised angles
brand/           Brand voice doc, hex codes, logo, product/screenshot assets
outputs/         Dated batch folders (outputs/YYYY-MM-DD/)
```

**每种输入的重要性：**
- **获胜广告**包含已被证实对该品牌有效的钩子、结构和角度
- **评论**包含买家描述痛点、转变和意外收益时使用的原话——应逐字提取其中的文案，而不是改写
- **广告留言**是最容易被忽略、同时价值最高的输入：异议（“但它对 X 有效吗？”）可以转化为常见问题卡片广告，而主动赞扬则能揭示你未曾写过的角度

**素材依据规则：**
- 每个概念都要注明其来源（可追溯到哪条评论、获胜广告或留言）
- 绝不编造宣称、统计数据或客户证言
- 如果 `inputs/winning-ads/` 或 `inputs/reviews/` 为空，请停止并要求用户先填充内容，然后再进行生成。不得退而生成缺乏依据的概念。
- 输入会失效：随着新广告开始规模化投放，更新 `inputs/winning-ads/`；每月更新 `inputs/reviews/` 和 `inputs/comments/`

---

## 平台规范

平台会拒绝或截断超出以下限制的创意，因此在交付前，请验证每段文案均符合限制。

### Google Ads（响应式搜索广告）

| 元素 | 限制 | 数量 |
|---------|-------|----------|
| 标题 | 30 个字符 | 最多 15 个 |
| 描述 | 90 个字符 | 最多 4 个 |
| 展示网址路径 | 每个 15 个字符 | 2 条路径 |

**RSA 规则：**
- 标题必须能够独立成立，并在任意组合下都语义通顺
- 仅在必要时将标题固定到特定位置（这会降低优化空间）
- 至少包含一个以关键词为重点的标题
- 至少包含一个以收益为重点的标题
- 至少包含一个行动号召标题

### Meta Ads（Facebook/Instagram）

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 正文 | 显示 125 个字符（最多 2,200 个） | 将钩子前置 |
| 标题 | 建议 40 个字符 | 位于图片下方 |
| 描述 | 建议 30 个字符 | 位于标题下方 |
| 网址展示链接 | 40 个字符 | 可选 |

### LinkedIn Ads

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 引导文本 | 建议 150 个字符（最多 600 个） | 位于图片上方 |
| 标题 | 建议 70 个字符（最多 200 个） | 位于图片下方 |
| 描述 | 建议 100 个字符（最多 300 个） | 在部分展示位置中出现 |

### TikTok Ads

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 广告文本 | 建议 80 个字符（最多 100 个） | 位于视频上方 |
| 展示名称 | 40 个字符 | 品牌名称 |

### Twitter/X 广告

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 推文文本 | 280 个字符 | 广告文案 |
| 标题 | 70 个字符 | 卡片标题 |
| 描述 | 200 个字符 | 卡片描述 |

有关详细规格和格式变体，请参阅 [references/platform-specs.md](references/platform-specs.md)。

---

## 生成广告视觉素材

**对于静态广告结构**，请使用 [references/static-ad-templates.md](references/static-ad-templates.md) 中包含 15 个模板的模板库——其中提供了多种布局框架（我们与他们、数据亮点、评价卡片、前后对比、创始人寄语、常见问题卡片等），并附有文案槽位、DTC 和 SaaS 示例，以及按创意概念划分的输出格式。应轮流使用全部 15 个模板，而不是集中使用偏爱的少数模板：模板多样性就是角度多样性。

**对于 iOS 原生风格的揭秘视频广告**——iMessage 聊天揭秘（预先编写的对话逐个气泡展开：截图钩子 → 朋友询问“那是什么应用？”→ 品牌 + 优惠码揭秘 → 结束卡片）、ChatGPT 揭秘（输入问题 → 流式生成回答）、Apple Notes 揭秘（实时输入一篇自白式笔记），以及 AirDrop 揭秘（收到传入的共享内容，点击接受时揭晓答案）——请参阅 [references/imessage-video-ads.md](references/imessage-video-ads.md)，了解界面选择、六种创意角度、脚本和节奏规则、制作路径（现成工具、Playwright + ffmpeg 流水线、Remotion）、增强真实感的制作细节，以及虚构对话的事实依据与合规规则（对虚构 AI 回答的要求最为严格）。

**对于无真人出镜的动态风格视频广告**——完全由生成式工具制作的 15–45 秒概念/解说视频（风格化海报静帧 → 图生视频的“鲜活”动态效果 → TTS 旁白 → 逐词定时字幕；每条成片约需 3–6 美元和约 15 分钟）——请参阅 [references/motion-video-ads.md](references/motion-video-ads.md)，了解与提供商无关的流水线、包含可填写提示词公式的九种视觉风格库——五种个性鲜明的视觉风格（丝网印刷拼贴、扁平矢量解说、纸艺立体模型、波普艺术漫画、黏土动画），以及四种由设计标记驱动、可灵活适配品牌的风格（单线编辑插画、瑞士字体排印、发光线框、双色丝网印刷）；这些风格由品牌槽位规范（FIELD / INK / ACCENT / TYPE FEEL）驱动——此外还包括动态提示词公式，以及从实践中总结出的质量控制陷阱（制作者的手意外入镜、最后两秒发生漂移、字幕与标签冲突、TTS/耳语音效听起来过于相似）。

关于图像和视频生成工具，请参阅 [references/generative-tools.md](references/generative-tools.md)，其中的完整指南涵盖：

- **图像生成**——用于静态广告图像的 Nano Banana Pro (Gemini)、Flux、Ideogram
- **视频生成**——用于视频广告的 Veo、Kling、Runway、Sora、Seedance、Higgsfield
- **语音与音频**——用于配音、声音克隆和多语言支持的 ElevenLabs、OpenAI TTS、Cartesia
- **基于代码的视频**——使用 Remotion 大规模制作模板化、数据驱动的视频
- **平台图像规格**——每个广告版位的正确尺寸
- **成本比较**——使用不同工具制作 100 多种广告变体的定价

**推荐的大规模制作工作流：**
1. 使用 AI 工具生成核心创意素材（探索性、高质量）
2. 根据表现出色的模式构建 Remotion 模板
3. 使用数据源通过 Remotion 批量制作变体
4. 持续迭代——使用 AI 探索新角度，使用 Remotion 实现规模化

---

## 生成广告文案

### 第 1 步：确定广告角度

在撰写各个标题之前，先确定 3-5 个不同的**角度**——即用户可能点击广告的不同理由。每个角度都应触及一种不同的动机。

**常见的角度类别：**

| 类别 | 角度示例 |
|----------|---------------|
| 痛点 | “别再把时间浪费在 X 上” |
| 成果 | “在 Z 天内实现 Y” |
| 社会认同 | “加入 10,000 多个已经……的团队” |
| 好奇心 | “顶尖公司使用的 X 秘诀” |
| 对比 | “不同于 X，我们会做 Y” |
| 紧迫感 | “限时：免费获得 X” |
| 身份认同 | “专为[特定角色/类型]打造” |
| 反常识 | “为什么[常见做法]不起作用” |

### 第 2 步：为每个角度生成变体

为每个角度生成多个变体。改变以下方面：
- **措辞**——同义词、主动语态与被动语态
- **具体程度**——数字与笼统表述
- **语气**——直接陈述、提问或命令
- **结构**——简短有力的表达或完整的利益陈述

### 第 3 步：根据规格进行验证

交付前，根据平台的字符限制检查每一条广告素材。标出所有超出限制的内容，并提供精简后的替代版本。

### 第 4 步：整理为可上传格式

以符合广告平台上传要求的结构化格式呈现广告素材。

---

## 根据效果数据进行迭代

当用户提供效果数据时，请遵循以下流程：

### 第 1 步：分析表现最佳的素材

查看表现最佳的广告素材（依据 CTR、转化率或 ROAS——询问用户最看重哪项指标），并确定：

- **制胜主题**——表现最佳的素材中出现了哪些话题或痛点？
- **制胜结构**——疑问句？陈述句？祈使句？数字？
- **制胜用词模式**——是否有反复出现的特定词语或短语？
- **字符利用情况**——表现最佳的素材更短还是更长？

### 第 2 步：分析表现最差的素材

查看表现最差的素材，并确定：

- **无效主题**——哪些角度未能引起受众共鸣？
- **低表现素材的共性**——过于笼统？过长？语气不对？

### 第 3 步：生成新变体

创建符合以下要求的新广告素材：
- 使用全新措辞，**进一步强化**制胜主题
- 将制胜角度**扩展**为新的变体
- **测试** 1-2 个尚未探索的新角度
- **避免**表现不佳的素材中出现的模式

### 第 4 步：记录迭代过程

记录学到了什么以及正在测试什么：

```
## Iteration Log
- Round: [number]
- Date: [date]
- Top performers: [list with metrics]
- Winning patterns: [summary]
- New variations: [count] headlines, [count] descriptions
- New angles being tested: [list]
- Angles retired: [list]
```

---

## 文案质量标准

### 吸引点击的标题

**优秀的标题：**
- 具体（“将报告时间缩短 75%”）优于模糊（“节省时间”）
- 强调收益（“更快交付代码”）优于强调功能（“CI/CD pipeline”）
- 使用主动语态（“自动生成报告”）优于被动语态（“报告已实现自动生成”）
- 尽可能包含数字（“快 3 倍”“5 分钟内”“10,000 多个团队”）

**避免：**
- 使用受众无法理解的术语
- 使用缺乏具体依据的宣称（“最佳”“领先”“顶级”）
- 全部使用大写字母或过度使用标点符号
- 使用落地页无法兑现的标题党文案

### 促进转化的描述

描述应当补充标题，而不是重复标题。使用描述来：
- 添加佐证信息（数字、客户评价、奖项）
- 消除顾虑（“无需信用卡”“小型团队永久免费”）
- 强化行动号召（“立即开始免费试用”）
- 在确有其事的情况下营造紧迫感（“仅限前 500 名注册用户”）

---

## 输出格式

### 标准输出

按角度组织，并标注字符数：

```
## Angle: [Pain Point — Manual Reporting]

### Headlines (30 char max)
1. "Stop Building Reports by Hand" (29)
2. "Automate Your Weekly Reports" (28)
3. "Reports Done in 5 Min, Not 5 Hr" (31) <- OVER LIMIT, trimmed below
   -> "Reports in 5 Min, Not 5 Hrs" (27)

### Descriptions (90 char max)
1. "Marketing teams save 10+ hours/week with automated reporting. Start free." (73)
2. "Connect your data sources once. Get automated reports forever. No code required." (80)
```

### 批量 CSV 输出

大规模生成（10 个以上变体）时，提供可直接上传的 CSV 格式：

```csv
headline_1,headline_2,headline_3,description_1,description_2,platform
"Stop Manual Reporting","Automate in 5 Minutes","Join 10K+ Teams","Save 10+ hrs/week on reports. Start free.","Connect data sources once. Reports forever.","google_ads"
```

### 静态批量输出（模式 3）

对于规模化的静态批次，将内容保存到按日期命名的文件夹中，并提供索引：

```
outputs/YYYY-MM-DD/
  INDEX.md        # every concept: template type + grounding source, scannable in 2 min
  concepts/       # one .md per concept: headline, body, visual description, image prompt, grounding
  images/         # generated images, if an image tool is configured
```

每个概念的格式定义见 [references/static-ad-templates.md](references/static-ad-templates.md)。该格式支持的人工工作流程是：打开文件夹，浏览 INDEX.md，选出最佳的 5–10 个进行测试——从 50 个概念中选出 5 个优胜者，比从 10 个概念中选出 5 个能获得更好的创意。

### 创意审核页面（客户/利益相关者审批）

当需要由其他人进行审核和选择时——例如客户、合作伙伴或利益相关者——请生成一个**创意审核页面**：这是一个自包含的 HTML 成品，以信息流中的平台样稿形式展示每个概念（Instagram/Facebook，并带有白名单账号切换选项），将轮播广告拆分为带标签的逐帧故事板，允许他们切换标题/文案变体，并披露哪些内容基于真实素材。这是 INDEX.md 的可视化升级版——只需通过一个链接即可做出决策，无需阅读 Markdown。模板位于 [assets/creative-review-template.html](assets/creative-review-template.html)（单文件、无需构建、可托管在任何地方）；使用生成的概念填充其 `DATA` 对象。完整的数据模型、依据规则（披露区块为必需项）和交付说明见 [references/creative-review-page.md](references/creative-review-page.md)。

### 迭代报告

进行迭代时，请包含摘要：

```
## Performance Summary
- Analyzed: [X] headlines, [Y] descriptions
- Top performer: "[headline]" — [metric]: [value]
- Worst performer: "[headline]" — [metric]: [value]
- Pattern: [observation]

## New Creative
[organized variations]

## Recommendations
- [What to pause, what to scale, what to test next]
```

---

## 批量生成工作流

适用于大规模创意内容生产（Anthropic 的增长团队每个周期生成 100 多个变体）：

### 1. 拆分为子任务
- **标题生成** — 专注于提升点击率
- **描述生成** — 专注于提升转化率
- **正文生成** — 专注于提升互动率（Meta/LinkedIn）

### 2. 分批生成
- 第一批：核心角度（3-5 个角度，每个角度 5 个变体）
- 第二批：围绕表现最好的 2 个角度扩展变体
- 第三批：非常规角度（逆向、情感化、具体）

### 3. 质量筛选
- 移除任何超出字符限制的内容
- 移除重复或近似重复的内容
- 标记任何可能违反平台政策的内容
- 确保标题与描述的组合在语义上合理

---

## 常见错误

- **撰写只有组合在一起才有效的标题** — RSA 标题会被随机组合
- **忽略字符限制** — 平台会在不发出警告的情况下截断内容
- **所有变体听起来都一样** — 应改变切入角度，而不只是换词
- **没有 CTA 标题** — RSA 需要以行动为导向的标题来促进点击；至少应包含 2-3 个
- **描述过于宽泛** — “进一步了解我们的解决方案”是在浪费这个位置
- **在没有数据的情况下迭代** — 直觉不如指标可靠
- **在缺乏依据的情况下生成** — 缺乏依据的创意读起来与信息流中的其他广告别无二致；应先向该 Skill 提供获胜广告、评论和用户反馈
- **跳过评论输入** — 广告评论中包含客户自己提出的异议和角度；这些内容通常转化效果最好
- **一次测试太多内容** — 每个测试周期只改变一个变量
- **过早停用创意** — 至少获得 1,000 次展示后再作判断

---

## 工具集成

有关拉取效果数据和管理广告活动的信息，请参阅[工具注册表](../../tools/REGISTRY.md)。

| 平台 | 拉取效果数据 | 管理广告活动 | 指南 |
|----------|:---------------------:|:----------------:|-------|
| **Google Ads** | `google-ads campaigns list`, `google-ads reports get` | `google-ads campaigns create` | [google-ads.md](../../tools/integrations/google-ads.md) |
| **Meta Ads** | `meta-ads insights get` | `meta-ads campaigns list` | [meta-ads.md](../../tools/integrations/meta-ads.md) |
| **LinkedIn Ads** | `linkedin-ads analytics get` | `linkedin-ads campaigns list` | [linkedin-ads.md](../../tools/integrations/linkedin-ads.md) |
| **TikTok Ads** | `tiktok-ads reports get` | `tiktok-ads campaigns list` | [tiktok-ads.md](../../tools/integrations/tiktok-ads.md) |

### 工作流：拉取数据、分析、生成

```bash
# 1. Pull recent ad performance
node tools/clis/google-ads.js reports get --type ad_performance --date-range last_30_days

# 2. Analyze output (identify top/bottom performers)
# 3. Feed winning patterns into this skill
# 4. Generate new variations
# 5. Upload to platform
```

---

## 相关 Skill

- **ads**：用于广告活动策略、定向、预算和优化
- **marketing-loops**：用于按固定周期重复执行静态批量生成（每日创意投放循环）
- **customer-research**：用于在构建有依据的输入语料库时挖掘评论和用户反馈
- **copywriting**：用于落地页文案（广告流量的承接页面）
- **ab-testing**：用于以严谨的统计方法设计创意测试
- **marketing-psychology**：用于了解高表现创意背后的心理学原理
- **copy-editing**：用于在发布前润色广告文案