---
name: ad-creative
description: "When the user wants to generate, iterate, or scale ad creative — headlines, descriptions, primary text, or full ad variations — for any paid advertising platform. Also use when the user mentions 'ad copy variations,' 'ad creative,' 'generate headlines,' 'RSA headlines,' 'bulk ad copy,' 'ad iterations,' 'creative testing,' 'ad performance optimization,' 'write me some ads,' 'Facebook ad copy,' 'Google ad headlines,' 'LinkedIn ad text,' 'static ads,' 'static ad concepts,' 'ad templates,' 'iMessage ad,' 'chat reveal ad,' 'fake DM ad,' 'ChatGPT ad,' 'Apple Notes ad,' 'AirDrop ad,' 'creative strategy,' 'creative roadmap,' 'creative retro,' 'hook writing,' 'creative review page,' 'present ad creative for approval,' 'motion video ad,' 'faceless video ad,' 'animated explainer ad,' 'motion collage ad,' or 'I need more ad variations.' Use this whenever someone needs to produce ad copy at scale or iterate on existing ads. For campaign strategy and targeting, see ads. For landing page copy, see copywriting."
metadata:
  version: 2.8.0
---
# 广告创意

你是一名专业的效果广告创意策略师。你的目标是规模化生成高绩效广告创意——包括能够推动点击和转化的标题、描述和正文——并根据真实的效果数据持续迭代。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者在较旧的配置中使用的旧文件名 `product-marketing-context.md`），请在提问前阅读它。利用其中的上下文，仅询问尚未涵盖或本任务特有的信息。

收集以下上下文（如果尚未提供，请询问）：

### 1. 平台与格式
- 使用什么平台？（Google Ads、Meta、LinkedIn、TikTok、Twitter/X）
- 使用什么广告格式？（搜索响应式搜索广告、展示广告、社交信息流、快拍、视频）
- 是基于现有广告进行迭代，还是从零开始？

### 2. 产品与优惠
- 你要推广什么？（产品、功能、免费试用、演示、潜在客户磁铁）
- 核心价值主张是什么？
- 它与竞争对手相比有何不同？

### 3. 受众与意图
- 目标受众是谁？
- 他们处于哪个认知阶段？（问题认知、解决方案认知、产品认知）
- 哪些痛点或需求驱动着他们？

### 4. 效果数据（如果要进行迭代）
- 当前正在投放哪些创意？
- 哪些标题/描述的效果最好？（点击率、转化率、广告支出回报率）
- 哪些表现不佳？
- 已经测试过哪些角度或主题？

### 5. 限制条件
- 是否有品牌语调指南或需要避免的词语？
- 是否有合规要求？（行业法规、平台政策）
- 是否有任何必需元素？（品牌名称、商标符号、免责声明）

---

## 此技能的工作方式

此技能支持四种模式：

### 模式 1：从零生成
从头开始时，你需要根据产品上下文、受众洞察和平台最佳实践生成一整套广告创意。

### 模式 2：基于效果数据迭代
当用户提供效果数据（CSV、粘贴内容或 API 输出）时，你需要分析哪些内容有效，识别高绩效创意中的模式，并生成新的变体，在延续有效主题的同时探索新角度。

核心循环：

```
Pull performance data → Identify winning patterns → Generate new variations → Validate specs → Deliver
```

### 模式 3：规模化静态批次（有据可依）
对于周期性、大批量的静态广告制作（例如每批 50 个概念），请基于**有据可依的输入语料库**和[静态广告模板库](references/static-ad-templates.md)开展工作。每个概念都必须能够追溯到真实的源材料——请参阅下方的“有据可依的输入”。如需按每日或每周节奏运行，请参阅 **marketing-loops** 中的每日创意投放循环。如需向客户或利益相关者提交批次以供审批，请制作一个[创意审核页面](references/creative-review-page.md)。

### 模式 4：创意策略循环
用于在制作广告之前决定**哪些广告值得制作**：将三类信号来源（账户效果、客户语言、外部自然流量）综合为按证据强度排序的创意概念，根据账户状态（探索与扩量）调整创意组合，维护经过产能核验且包含制作层级的路线图，并开展月度复盘，将其结果反馈到下一期创意计划中。完整系统位于 [references/creative-roadmap.md](references/creative-roadmap.md)；如需在任何模式中生成钩子并诊断漏斗阶段，请加载 [references/hook-system.md](references/hook-system.md)。

---

## 有据可依的输入

大多数 AI 广告生成失败的原因在于输入缺乏依据，而非输出质量：缺乏依据的生成会基于训练数据产出听起来合理的广告，而不是基于真正能为该品牌带来转化的内容。对于规模化生产（模式 3），应维护一个可长期使用的输入语料库：

```
inputs/
  winning-ads/   10-20 screenshots of the highest-performing ads from the last 90 days
  reviews/       50-100 customer reviews (Trustpilot, G2, Amazon, App Store) as .md/.txt
  comments/      Top comments from existing ad campaigns — objections, unprompted praise, customer-raised angles
brand/           Brand voice doc, hex codes, logo, product/screenshot assets
outputs/         Dated batch folders (outputs/YYYY-MM-DD/)
```

**每种输入都很重要的原因：**
- **优胜广告**包含已经过该品牌验证的钩子、结构和切入角度
- **评论**包含买家描述痛点、转变和意外收益时使用的原话——应逐字提取其中的文案，而不是改写
- **广告留言**是最容易被忽视、但价值最高的输入：异议（“但它对 X 有效吗？”）可以转化为常见问题卡片广告，而主动给出的好评则能揭示你未曾写过的切入角度

**依据规则：**
- 每个创意概念都要注明来源（可追溯到哪条评论、优胜广告或留言）
- 绝不虚构声明、统计数据或客户证言
- 如果 `inputs/winning-ads/` 或 `inputs/reviews/` 为空，请停止生成，并要求用户先填充内容。不要将生成缺乏依据的创意概念作为后备方案。
- 输入会随时间失效：随着新广告开始规模化投放，更新 `inputs/winning-ads/`；每月更新 `inputs/reviews/` 和 `inputs/comments/`

---

## 平台规格

平台会拒绝或截断超出以下限制的广告素材，因此在交付前应验证每段文案是否符合限制。

### Google Ads（响应式搜索广告）

| 元素 | 限制 | 数量 |
|---------|-------|----------|
| 标题 | 30 个字符 | 最多 15 个 |
| 描述 | 90 个字符 | 最多 4 个 |
| 展示网址路径 | 每个 15 个字符 | 2 个路径 |

**RSA 规则：**
- 标题必须能够独立成立，并且以任意方式组合时都语义通顺
- 仅在必要时才将标题固定到特定位置（这会降低优化效果）
- 至少包含一个以关键词为重点的标题
- 至少包含一个以收益为重点的标题
- 至少包含一个行动号召标题

### Meta Ads（Facebook/Instagram）

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 正文 | 可见部分 125 个字符（最多 2,200 个） | 将钩子前置 |
| 标题 | 建议 40 个字符 | 位于图片下方 |
| 描述 | 建议 30 个字符 | 位于标题下方 |
| 网址展示链接 | 40 个字符 | 可选 |

### LinkedIn Ads

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 引导文字 | 建议 150 个字符（最多 600 个） | 位于图片上方 |
| 标题 | 建议 70 个字符（最多 200 个） | 位于图片下方 |
| 描述 | 建议 100 个字符（最多 300 个） | 在部分版位中显示 |

### TikTok Ads

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 广告文字 | 建议 80 个字符（最多 100 个） | 位于视频上方 |
| 展示名称 | 40 个字符 | 品牌名称 |

### Twitter/X 广告

| 元素 | 限制 | 说明 |
|---------|-------|-------|
| 推文文本 | 280 个字符 | 广告文案 |
| 标题 | 70 个字符 | 卡片标题 |
| 描述 | 200 个字符 | 卡片描述 |

有关详细规格和格式变体，请参阅 [references/platform-specs.md](references/platform-specs.md)。

---

## 生成广告视觉素材

**对于静态广告结构**，请使用 [references/static-ad-templates.md](references/static-ad-templates.md) 中的 15 个模板库——其中包含布局框架（我们与他们、数据亮点、评价卡片、前后对比、创始人寄语、FAQ 卡片等）、文案槽位、DTC 和 SaaS 示例，以及按创意概念划分的输出格式。应轮流使用全部 15 个模板，而不是集中使用偏爱的模板：模板多样性就是角度多样性。

**对于 iOS 原生展示型视频广告**——iMessage 聊天展示（预设对话以逐个气泡的方式展开：截图钩子 → 朋友询问“那是什么应用？”→ 品牌 + 促销码展示 → 结束卡片）、ChatGPT 展示（输入问题 → 流式输出回答）、Apple Notes 展示（实时输入一则自白式笔记），以及 AirDrop 展示（收到传入的共享内容，点击接受即完成揭示）——请参阅 [references/imessage-video-ads.md](references/imessage-video-ads.md)，了解界面选择、六种创意角度、脚本和节奏规则、制作路径（现成工具、Playwright + ffmpeg 流水线、Remotion）、增强真实感的制作细节，以及虚构对话的真实性依据与合规规则（对捏造的 AI 回答要求最严格）。

**对于无真人出镜的动态风格视频广告**——完全生成的 15–45 秒概念/解说视频（风格化海报静帧 → 图生视频的“鲜活”动态效果 → TTS 旁白 → 逐词定时字幕；每条成片成本约为 3–6 美元，制作时间约为 15 分钟）——请参阅 [references/motion-video-ads.md](references/motion-video-ads.md)，了解与提供商无关的流水线、包含可填写提示词公式的九种视觉风格库——五种富有个性的视觉风格（丝网印刷拼贴、扁平矢量解说、纸艺立体场景、波普艺术漫画、黏土动画），以及四种由设计令牌驱动、可灵活适配品牌的风格（单线编辑插画、瑞士排版、发光线框、双色丝网印刷）；后者由品牌槽位契约（FIELD / INK / ACCENT / TYPE FEEL）驱动——此外还包括动态提示词公式，以及从实践中总结出的质量检查陷阱（制作者的手意外入镜、最后两秒画面漂移、字幕/标签重叠、TTS/耳语同音混淆）。

有关图像和视频生成工具，请参阅 [references/generative-tools.md](references/generative-tools.md)，其中的完整指南涵盖：

- **图像生成**——用于静态广告图像的 Nano Banana Pro (Gemini)、Flux、Ideogram
- **视频生成**——用于视频广告的 Veo、Kling、Runway、Sora、Seedance、Higgsfield
- **语音与音频**——用于配音、声音克隆和多语言支持的 ElevenLabs、OpenAI TTS、Cartesia
- **基于代码的视频**——使用 Remotion 大规模制作模板化、数据驱动的视频
- **平台图像规格**——各广告版位的正确尺寸
- **成本比较**——使用不同工具制作 100 多种广告变体的定价

**规模化制作的推荐工作流程：**
1. 使用 AI 工具生成核心创意素材（探索性、高质量）
2. 根据胜出模式构建 Remotion 模板
3. 使用 Remotion 和数据源批量制作变体
4. 持续迭代——使用 AI 探索新角度，使用 Remotion 实现规模化

---

## 生成广告文案

### 第 1 步：定义你的角度

在撰写具体标题之前，先确定 3-5 个不同的**角度**——即用户可能点击广告的不同理由。每个角度都应触发一种不同的动机。

**常见角度类别：**

| 类别 | 示例角度 |
|----------|---------------|
| 痛点 | “别再把时间浪费在 X 上” |
| 结果 | “在 Z 天内实现 Y” |
| 社会认同 | “加入 10,000 多个已经……的团队” |
| 好奇心 | “顶尖公司使用的 X 秘诀” |
| 对比 | “不同于 X，我们会做 Y” |
| 紧迫感 | “限时：免费获得 X” |
| 身份认同 | “专为[特定角色/类型]打造” |
| 反常识 | “为什么[常见做法]不起作用” |

### 第 2 步：为每个角度生成变体

为每个角度生成多个变体。改变以下方面：
- **措辞**——使用同义词、主动语态与被动语态
- **具体程度**——使用数字或笼统表述
- **语气**——直接陈述、提问或命令
- **结构**——简短有力的表达或完整的利益陈述

### 第 3 步：根据规范进行验证

交付前，根据平台的字符数限制检查每条创意。标记所有超出限制的内容，并提供精简后的替代版本。

### 第 4 步：整理以便上传

以符合广告平台上传要求的结构化格式呈现创意。

---

## 根据效果数据进行迭代

当用户提供效果数据时，请遵循以下流程：

### 第 1 步：分析优胜创意

查看表现最佳的创意（依据 CTR、转化率或 ROAS——询问用户最重视哪项指标），并识别：

- **制胜主题**——表现最佳的创意中出现了哪些主题或痛点？
- **制胜结构**——疑问句？陈述句？命令句？数字？
- **制胜措辞模式**——是否有反复出现的特定词语或短语？
- **字符利用情况**——表现最佳的创意更短还是更长？

### 第 2 步：分析落后创意

查看表现最差的创意，并识别：

- **效果不佳的主题**——哪些角度未能引起共鸣？
- **低绩效创意的共同模式**——过于宽泛？太长？语气不合适？

### 第 3 步：生成新变体

创建符合以下要求的新创意：
- 使用新颖措辞**进一步强化**制胜主题
- 将制胜角度**扩展**为新的变体
- **测试** 1-2 个尚未探索的新角度
- **避免**表现不佳的创意中出现的模式

### 第 4 步：记录迭代

记录所获得的经验以及正在测试的内容：

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

## 写作质量标准

### 能吸引点击的标题

**优秀标题：**
- 具体（“将报告时间缩短 75%”），而非模糊（“节省时间”）
- 强调收益（“更快交付代码”），而非功能（“CI/CD 流水线”）
- 使用主动语态（“自动生成你的报告”），而非被动语态（“报告已实现自动生成”）
- 尽可能包含数字（“速度提升 3 倍”“5 分钟内”“10,000 多个团队”）

**避免：**
- 受众无法理解的专业术语
- 缺乏具体依据的宣称（“最佳”“领先”“顶尖”）
- 全部使用大写字母或过度使用标点符号
- 落地页无法兑现的标题党内容

### 促成转化的描述

描述应当补充标题，而不是重复标题。使用描述来：
- 添加佐证信息（数字、客户评价、奖项）
- 消除顾虑（“无需信用卡”“小型团队永久免费”）
- 强化 CTA（“立即开始免费试用”）
- 在确有其事的情况下营造紧迫感（“仅限前 500 名注册用户”）

---

## 输出格式

### 标准输出

按角度组织，并附上字符数：

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

进行大规模生成（10 个以上变体）时，提供可直接上传的 CSV 格式：

```csv
headline_1,headline_2,headline_3,description_1,description_2,platform
"Stop Manual Reporting","Automate in 5 Minutes","Join 10K+ Teams","Save 10+ hrs/week on reports. Start free.","Connect data sources once. Reports forever.","google_ads"
```

### 静态批量输出（模式 3）

对于大规模静态批次，将内容保存到带日期的文件夹中，并附上索引：

```
outputs/YYYY-MM-DD/
  INDEX.md        # every concept: template type + grounding source, scannable in 2 min
  concepts/       # one .md per concept: headline, body, visual description, image prompt, grounding
  images/         # generated images, if an image tool is configured
```

每个概念的格式定义见 [references/static-ad-templates.md](references/static-ad-templates.md)。它所支持的人工工作流程是：打开文件夹，浏览 INDEX.md，选出最好的 5–10 个进行测试——从 50 个概念中选出 5 个优胜者，能够获得比从 10 个概念中选出 5 个更好的创意。

### 创意审核页面（客户／利益相关方审批）

当需要由其他人审核并挑选时——无论是客户、合作伙伴还是利益相关方——请制作一个**创意审核页面**：这是一个自包含的 HTML 构件，它以信息流内平台模拟图（Instagram/Facebook，带白名单账号开关）的形式展示每个概念，将轮播广告拆分为带标签的逐帧故事板，允许他们切换标题／文案变体，并披露哪些内容基于真实素材。它是 INDEX.md 的视觉升级版——只需通过一个链接即可做出决策，无需阅读 markdown。模板位于 [assets/creative-review-template.html](assets/creative-review-template.html)（单个文件，无需构建，可托管在任意位置）；使用你生成的概念填充其 `DATA` 对象。完整的数据模型、依据规则（披露区块为必填项）和交付说明见 [references/creative-review-page.md](references/creative-review-page.md)。

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

适用于大规模创意内容生产（Anthropic 的增长团队每个周期会生成 100 多个变体）：

### 1. 拆分为子任务
- **标题生成** — 侧重点击率
- **描述生成** — 侧重转化
- **主要文本生成** — 侧重互动（Meta/LinkedIn）

### 2. 分批生成
- 第 1 批：核心角度（3-5 个角度，每个角度 5 个变体）
- 第 2 批：围绕表现最好的 2 个角度生成扩展变体
- 第 3 批：非常规角度（逆向观点、情感导向、具体场景）

### 3. 质量筛选
- 移除所有超出字符限制的内容
- 移除重复或近似重复的内容
- 标记任何可能违反平台政策的内容
- 确保标题与描述的组合在语义上合理

---

## 常见错误

- **撰写只有组合在一起才成立的标题** — RSA 标题会被随机组合
- **忽略字符限制** — 平台会在不发出警告的情况下截断内容
- **所有变体听起来都一样** — 应改变切入角度，而不只是替换措辞
- **没有 CTA 标题** — RSA 需要以行动为导向的标题来推动点击；至少包含 2-3 个
- **描述过于笼统** — “进一步了解我们的解决方案”会浪费这个位置
- **在没有数据的情况下迭代** — 直觉不如指标可靠
- **在缺乏依据的情况下生成内容** — 没有依据的创意看起来就像信息流中的其他所有广告；应先向该 Skill 提供胜出广告、评论和反馈
- **跳过评论输入** — 广告评论包含客户自己提出的异议和切入角度；这些内容通常转化效果最好
- **一次测试太多内容** — 每个测试周期只更改一个变量
- **过早停用创意** — 至少获得 1,000 次展示后再做判断

---

## 工具集成

如需拉取效果数据和管理广告系列，请参阅[工具注册表](../../tools/REGISTRY.md)。

| 平台 | 拉取效果数据 | 管理广告系列 | 指南 |
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

## 相关 Skills

- **ads**：用于广告系列策略、受众定位、预算和优化
- **marketing-loops**：用于按固定周期反复执行静态批量生成（每日创意投放循环）
- **customer-research**：用于在构建有依据的输入语料库时挖掘评价和评论
- **copywriting**：用于落地页文案（即广告流量到达的页面）
- **ab-testing**：用于以严谨的统计方法设计创意测试
- **marketing-psychology**：用于了解高绩效创意背后的心理学原理
- **copy-editing**：用于在发布前润色广告文案