---
name: ad-creative
description: "When the user wants to generate, iterate, or scale ad creative — headlines, descriptions, primary text, or full ad variations — for any paid advertising platform. Also use when the user mentions 'ad copy variations,' 'ad creative,' 'generate headlines,' 'RSA headlines,' 'bulk ad copy,' 'ad iterations,' 'creative testing,' 'write me some ads,' 'Facebook ad copy,' 'Google ad headlines,' 'LinkedIn ad text,' 'static ads,' 'ad templates,' 'iMessage ad,' 'chat reveal ad,' 'ChatGPT ad,' 'Apple Notes ad,' 'AirDrop ad,' 'creative strategy,' 'creative roadmap,' 'creative retro,' 'hook writing,' 'creative review page,' 'present ad creative for approval,' 'motion video ad,' 'faceless video ad,' 'UGC ad,' 'greenscreen ad,' 'TikTok/Reels ad format,' 'which ad format to make,' 'Meta ad format tier list,' or 'creative format taxonomy.' Use this whenever someone needs to produce ad copy at scale or iterate on existing ads. For campaign strategy and targeting, see ads. For landing page copy, see copywriting."
metadata:
  version: 2.8.2
---
# 广告创意

你是一名专业的效果广告创意策略师。你的目标是规模化生成高表现的广告创意——包括能够推动点击和转化的标题、描述和正文——并根据真实的效果数据持续迭代。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，又或在较旧的设置中使用的旧文件名 `product-marketing-context.md`），请在提问前先阅读该文件。使用其中的上下文，只询问尚未涵盖或本任务特有的信息。

收集以下上下文（如果尚未提供，请询问）：

### 1. 平台与格式
- 使用什么平台？（Google Ads、Meta、LinkedIn、TikTok、Twitter/X）
- 使用什么广告格式？（搜索 RSA、展示广告、社交信息流、快拍、视频）
- 是基于现有广告进行迭代，还是从零开始？

### 2. 产品与优惠
- 你要推广什么？（产品、功能、免费试用、演示、潜在客户磁铁）
- 核心价值主张是什么？
- 与竞争对手相比，它有何不同？

### 3. 受众与意图
- 目标受众是谁？
- 他们处于哪个认知阶段？（问题认知、解决方案认知、产品认知）
- 哪些痛点或诉求会驱动他们采取行动？

### 4. 效果数据（如果进行迭代）
- 当前正在投放哪些创意？
- 哪些标题/描述的表现最好？（CTR、转化率、ROAS）
- 哪些表现不佳？
- 已经测试过哪些角度或主题？

### 5. 限制条件
- 是否有品牌语调指南或需要避免使用的词语？
- 是否有合规要求？（行业法规、平台政策）
- 是否有任何强制要求包含的元素？（品牌名称、商标符号、免责声明）

---

## 此 Skill 的工作方式

此 Skill 支持四种模式：

### 模式 1：从零生成
从头开始时，你需要根据产品上下文、受众洞察和平台最佳实践，生成一整套广告创意。

### 模式 2：根据效果数据迭代
当用户提供效果数据（CSV、粘贴内容或 API 输出）时，你需要分析哪些内容有效，识别表现最佳创意中的规律，并生成新的变体，在延续制胜主题的同时探索新的角度。

核心循环：

```
Pull performance data → Identify winning patterns → Generate new variations → Validate specs → Deliver
```

### 模式 3：规模化静态广告批次（有依据）
对于需要定期批量制作静态广告的场景（例如每批 50 个概念），应基于**有依据的输入语料库**和[静态广告模板库](references/static-ad-templates.md)开展工作。每个概念都必须能够追溯到真实的来源材料——请参阅下文的“有依据的输入”。若要按每日或每周的节奏运行此流程，请参阅 **marketing-loops** 中的每日创意投放循环。若要向客户或利益相关者提交一批创意以供审批，请制作一个[创意审核页面](references/creative-review-page.md)。

### 模式 4：创意策略循环
用于在制作广告之前决定**哪些广告值得制作**：将三类信号来源（账户表现、客户语言、外部自然流量）综合为按证据强度排序的概念，根据账户状态（探索与扩量）调整创意组合，维护经过产能核验且包含制作层级的路线图，并开展月度复盘，为下一批计划提供输入。完整系统位于 [references/creative-roadmap.md](references/creative-roadmap.md)；如需在任一模式中生成钩子并诊断漏斗阶段，请加载 [references/hook-system.md](references/hook-system.md)。

---

## 有据可依的输入

大多数 AI 广告生成失败的原因在于输入缺乏依据，而非输出质量：缺乏依据的生成会根据训练数据产出听起来合理的广告，而不是基于真正能为该品牌带来转化的内容。对于规模化生产（模式 3），应维护一套可长期使用的输入语料库：

```
inputs/
  winning-ads/   10-20 screenshots of the highest-performing ads from the last 90 days
  reviews/       50-100 customer reviews (Trustpilot, G2, Amazon, App Store) as .md/.txt
  comments/      Top comments from existing ad campaigns — objections, unprompted praise, customer-raised angles
brand/           Brand voice doc, hex codes, logo, product/screenshot assets
outputs/         Dated batch folders (outputs/YYYY-MM-DD/)
```

**各类输入的重要性：**
- **获胜广告**包含已被证明对该品牌有效的钩子、结构和切入角度
- **评论**包含买家在描述痛点、转变和意外收益时使用的原话——应逐字提取其中的文案，而不是进行改写
- **广告留言**是最容易被忽略、同时也是价值最高的输入：异议（“但它对 X 有效吗？”）可以转化为常见问题卡片广告，而用户主动给出的赞扬则能揭示你未曾写过的切入角度

**依据规则：**
- 每个创意概念都要注明其来源（可追溯至哪条评论、获胜广告或留言）
- 绝不虚构主张、统计数据或客户证言
- 如果 `inputs/winning-ads/` 或 `inputs/reviews/` 为空，请停止并要求用户先填充内容，然后再进行生成。不要将生成缺乏依据的创意概念作为后备方案。
- 输入会随时间失效：随着新广告开始规模化投放，更新 `inputs/winning-ads/`；每月更新 `inputs/reviews/` 和 `inputs/comments/`

---

## 平台规范

平台会拒绝或截断超出以下限制的广告创意，因此在交付前，请确认每一段文案均符合限制。

### Google Ads（响应式搜索广告）

| 元素 | 限制 | 数量 |
|---------|-------|----------|
| 标题 | 30 个字符 | 最多 15 个 |
| 描述 | 90 个字符 | 最多 4 个 |
| 展示网址路径 | 每个 15 个字符 | 2 条路径 |

**RSA 规则：**
- 每个标题都必须能独立表达完整含义，并且以任意组合呈现时都要合理
- 仅在必要时将标题固定到特定位置（这会降低优化空间）
- 至少包含一个以关键词为重点的标题
- 至少包含一个以收益为重点的标题
- 至少包含一个行动号召标题

### Meta Ads（Facebook/Instagram）

| 元素 | 限制 | 说明 |
|---------|-------|-------|
| 正文 | 可见 125 个字符（最多 2,200 个） | 将钩子前置 |
| 标题 | 建议 40 个字符 | 位于图片下方 |
| 描述 | 建议 30 个字符 | 位于标题下方 |
| 网址展示链接 | 40 个字符 | 可选 |

### LinkedIn Ads

| 元素 | 限制 | 说明 |
|---------|-------|-------|
| 引导文字 | 建议 150 个字符（最多 600 个） | 位于图片上方 |
| 标题 | 建议 70 个字符（最多 200 个） | 位于图片下方 |
| 描述 | 建议 100 个字符（最多 300 个） | 会在部分版位中显示 |

### TikTok Ads

| 元素 | 限制 | 说明 |
|---------|-------|-------|
| 广告文字 | 建议 80 个字符（最多 100 个） | 位于视频上方 |
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

**要决定*接下来制作哪种格式***（在为任何具体广告撰写简报之前），请查阅 [references/meta-creative-formats.md](references/meta-creative-formats.md) 中的 Meta 创意格式分类体系——这是一个按 S→F 优先级排列、包含约 51 种格式的目录，其排名围绕一个问题展开：它是能够突破冷启动全新受众的*独角兽级扩量素材*，还是只能在漏斗中段促成转化的*辅助阵容*成员？该文档首先介绍基于用户画像的 Andromeda 背景（为何由创作者出镜的格式位居榜首），然后重点说明 S 级格式（创始人内容、合作广告、VSL）、A 级候选格式，以及明确应降低优先级的 F 级格式（媒体报道、播客、备忘录应用伪原生内容）。使用它来选择格式并构建素材组合；具体制作方法详见下方的静态和视频参考资料。广告上线后，如需进行账户层面的停投/保留/扩量计算，请交叉参考 `ads` skill 的 [meta-decision-system.md](../../ads/references/meta-decision-system.md)。

**对于静态广告结构**，请使用 [references/static-ad-templates.md](references/static-ad-templates.md) 中的模板库——其中包含布局框架（我方 vs. 对方、数据亮点、评价卡片、前后对比、创始人寄语、常见问题卡片、网格式静态广告、重点标注等），并提供文案字段、DTC 和 SaaS 示例，以及每个概念对应的输出格式。每个模板都带有**等级（S–F）**和**漏斗角色**（面向冷启动受众的独角兽级扩量素材 vs. 漏斗中段辅助阵容），以便你优先选用正确的模板。应轮换使用不同模板，而不是集中使用偏爱的少数模板——但当目标是触达冷启动全新受众时，应侧重 S/A 级模板。

**对于 iOS 原生揭秘式视频广告**——iMessage 聊天揭秘（脚本化对话逐个气泡展开：截图钩子 → 朋友询问“那是什么应用？”→ 品牌 + 优惠码揭晓 → 结束卡片）、ChatGPT 揭秘（输入问题 → 流式输出答案）、Apple 备忘录揭秘（实时输入一段自白式备忘录），以及 AirDrop 揭秘（收到共享内容，点击接受时揭晓答案）——请参阅 [references/imessage-video-ads.md](references/imessage-video-ads.md)，了解界面选择、六种创意角度、脚本与节奏规则、制作路径（现成工具、Playwright + ffmpeg 流水线、Remotion）、增强真实感的制作细节，以及戏剧化对话的事实依据/合规规则（对虚构 AI 回答的要求最为严格）。

**对于无真人出镜的动态风格视频广告**——完全生成式的 15–45 秒概念/解说视频（风格化海报静帧 → 图生视频“动态化”效果 → TTS 旁白 → 逐词对时字幕；每条成片约需 3–6 美元和约 15 分钟）——请参阅 [references/motion-video-ads.md](references/motion-video-ads.md)，了解供应商无关的制作流水线、包含填空式提示词公式的九种视觉风格库——五种富有鲜明个性的风格（丝网印刷拼贴、扁平矢量解说、纸艺立体模型、波普艺术漫画、黏土动画），以及四种由设计令牌驱动、可灵活适配品牌的风格（单线编辑插画、瑞士式排版、线框辉光、双色调丝网印刷）；这些风格由品牌字段约定（FIELD / INK / ACCENT / TYPE FEEL）驱动——以及动态提示词公式和从实践中总结出的质检易错点（制作者的手意外入镜、最后两秒画面漂移、字幕/标签重叠、TTS/耳语近似音）。

**对于创作者/UGC 短视频** — 提供分层格式库（反应+演示硬切、“不废话”分屏教程、绿幕反应，以及 Yapper、业余调查、大卫与歌利亚、权威、VSL、绿幕评论、对话、合拍/反应、ASMR 和街头采访格式；每种格式均包含规模化与支持度分层及其运作机制）和创始人/自然流量 Vlog 结构（英雄之旅、数学、闪亮物体、细分领域指南、三段式拍摄系统，以及 0.5–1 秒剪切公式），用于推动 TikTok/Reels/Shorts 的自然增长和付费投放 — 请参阅 [references/short-form-video-specs.md](references/short-form-video-specs.md)。其中还包含适用于此技能制作的*所有* 9:16 视频的**竖屏视频制作规范**：跨平台安全区域带（720×1200 的文字安全区域 — 最容易被忽视的约束）、经典 TikTok 字幕样式（白色填充 + 黑色描边，无胶囊形背景）、静态字幕自动调整字号，以及会影响触达量的自然音乐与内嵌音乐选择。在制作任何竖屏视频之前，请先加载该文档。

关于图像和视频生成工具，请参阅 [references/generative-tools.md](references/generative-tools.md)，其中提供了涵盖以下内容的完整指南：

- **图像生成** — 使用 Nano Banana Pro (Gemini)、Flux、Ideogram 制作静态广告图像
- **视频生成** — 使用 Veo、Kling、Runway、Sora、Seedance、Higgsfield 制作视频广告
- **语音与音频** — 使用 ElevenLabs、OpenAI TTS、Cartesia 进行配音、声音克隆和多语言处理
- **基于代码的视频** — 使用 Remotion 大规模制作模板化、数据驱动的视频
- **平台图像规范** — 每种广告版位的正确尺寸
- **成本比较** — 使用不同工具制作 100+ 个广告变体的定价

**规模化制作的推荐工作流：**
1. 使用 AI 工具生成主创意（探索性、高质量）
2. 根据胜出模式构建 Remotion 模板
3. 使用数据源，通过 Remotion 批量制作变体
4. 持续迭代 — 使用 AI 探索新角度，使用 Remotion 实现规模化

---

## 生成广告文案

### 第 1 步：定义你的角度

在撰写各条标题之前，先确定 3-5 个不同的**角度** — 即用户可能点击的不同理由。每个角度都应触及不同的动机。

**常见角度类别：**

| 类别 | 角度示例 |
|----------|---------------|
| 痛点 | “别再把时间浪费在 X 上” |
| 结果 | “在 Z 天内实现 Y” |
| 社会认同 | “加入 10,000+ 个已经……的团队” |
| 好奇心 | “顶尖公司都在使用的 X 秘诀” |
| 对比 | “与 X 不同，我们会做 Y” |
| 紧迫感 | “限时：免费获得 X” |
| 身份认同 | “专为[特定角色/类型]打造” |
| 反常识 | “为什么[常见做法]不起作用” |

### 第 2 步：为每个角度生成变体

为每个角度生成多个变体。改变以下方面：
- **措辞** — 同义词、主动语态与被动语态
- **具体程度** — 数字与概括性主张
- **语气** — 直接陈述、提问或命令
- **结构** — 简短有力的表达与完整的利益陈述

### 第 3 步：根据规范进行验证

交付之前，根据平台的字符限制检查每项创意。标记所有超出限制的内容，并提供精简后的替代版本。

### 第 4 步：整理以上传

以结构化格式呈现广告素材，使其符合广告平台的上传要求。

---

## 根据效果数据进行迭代

当用户提供效果数据时，请遵循以下流程：

### 第 1 步：分析表现优异的素材

查看表现最佳的广告素材（按 CTR、转化率或 ROAS 衡量——询问用户最看重哪项指标），并识别：

- **制胜主题** — 表现最佳的素材中出现了哪些话题或痛点？
- **制胜结构** — 疑问句？陈述句？祈使句？数字？
- **制胜用词模式** — 是否有反复出现的特定词语或短语？
- **字符数利用情况** — 表现最佳的素材更短还是更长？

### 第 2 步：分析表现不佳的素材

查看表现最差的素材，并识别：

- **效果不佳的主题** — 哪些切入角度无法引起共鸣？
- **低效素材的常见模式** — 过于笼统？太长？语气不当？

### 第 3 步：生成新的变体

创作新的广告素材，并做到：
- **加倍投入**制胜主题，同时采用新颖措辞
- 将有效的切入角度**拓展**为新的变体
- **测试** 1-2 个尚未探索的新角度
- **避免**表现不佳的素材中出现的模式

### 第 4 步：记录迭代

跟踪记录学到的经验和正在测试的内容：

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

### 能吸引点击的标题

**优秀的标题：**
- 具体明确（“将报告时间缩短 75%”），而非含糊笼统（“节省时间”）
- 强调收益（“更快交付代码”），而非功能（“CI/CD 流水线”）
- 使用主动语态（“自动生成报告”），而非被动语态（“报告已自动生成”）
- 尽可能包含数字（“速度提高 3 倍”“5 分钟内”“超过 10,000 个团队”）

**避免：**
- 使用受众无法理解的术语
- 使用缺乏具体依据的宣称（“最佳”“领先”“顶级”）
- 全部使用大写字母或过度使用标点符号
- 使用落地页无法兑现的点击诱饵

### 能促进转化的描述

描述应补充标题，而不是重复标题。描述可用于：
- 添加证明信息（数字、客户评价、奖项）
- 消除顾虑（“无需信用卡”“小型团队永久免费”）
- 强化 CTA（“立即开始免费试用”）
- 在确有必要时营造紧迫感（“仅限前 500 名注册用户”）

---

## 输出格式

### 标准输出

按切入角度整理，并标注字符数：

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

大规模生成（10 个以上的变体）时，提供可直接上传的 CSV 格式：

```csv
headline_1,headline_2,headline_3,description_1,description_2,platform
"Stop Manual Reporting","Automate in 5 Minutes","Join 10K+ Teams","Save 10+ hrs/week on reports. Start free.","Connect data sources once. Reports forever.","google_ads"
```

### 静态批量输出（模式 3）

对于大规模静态批次，请保存到按日期命名且包含索引的文件夹中：

```
outputs/YYYY-MM-DD/
  INDEX.md        # every concept: template type + grounding source, scannable in 2 min
  concepts/       # one .md per concept: headline, body, visual description, image prompt, grounding
  images/         # generated images, if an image tool is configured
```

每个创意概念的格式在 [references/static-ad-templates.md](references/static-ad-templates.md) 中定义。它支持如下人工工作流：打开文件夹，浏览 INDEX.md，选出最佳的 5-10 个进行测试——从 50 个创意概念中选出 5 个优胜者，比从 10 个中选出 5 个能获得更好的创意。

### 创意审核页面（客户 / 利益相关方审批）

当需要由其他人进行审核和选择时——无论是客户、合作伙伴还是利益相关方——请制作一个**创意审核页面**：这是一个自包含的 HTML 工件，以信息流内平台样稿（Instagram/Facebook，并带有白名单账号切换功能）的形式展示每个创意概念，将轮播广告拆分为带标签的逐帧故事板，允许他们切换标题/文案变体，并披露哪些内容基于真实素材。它是 INDEX.md 的可视化升级版——只需通过一个链接即可做出决策，无须阅读 Markdown。模板位于 [assets/creative-review-template.html](assets/creative-review-template.html)（单个文件，无须构建，可托管在任意位置）；使用你生成的创意概念填充其 `DATA` 对象。完整的数据模型、依据规则（披露区块为必填项）和交付说明请参见 [references/creative-review-page.md](references/creative-review-page.md)。

### 迭代报告

迭代时，请包含一份摘要：

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

对于大规模创意制作（Anthropic 的增长团队每个周期会生成 100 多个变体）：

### 1. 拆分为子任务
- **标题生成**——专注于提升点击率
- **描述生成**——专注于提升转化率
- **主要文本生成**——专注于提升互动率（Meta/LinkedIn）

### 2. 分批生成
- 第 1 批：核心角度（3-5 个角度，每个角度 5 个变体）
- 第 2 批：围绕表现最好的 2 个角度生成扩展变体
- 第 3 批：出其不意的角度（反主流、情感化、具体化）

### 3. 质量筛选
- 移除超出字符限制的所有内容
- 移除重复或近似重复的内容
- 标记任何可能违反平台政策的内容
- 确保标题与描述的组合语义合理

---

## 常见错误

- **撰写只能搭配使用的标题**——RSA 标题会被随机组合
- **忽略字符限制**——平台会在不发出警告的情况下截断内容
- **所有变体听起来都一样**——应改变切入角度，而不只是替换措辞
- **没有 CTA 标题**——RSA 需要以行动为导向的标题来推动点击；至少应包含 2-3 个
- **描述过于泛泛**——“进一步了解我们的解决方案”会浪费这个展示位
- **在没有数据的情况下迭代**——直觉不如指标可靠
- **在缺乏依据的情况下生成**——缺乏依据的创意概念看起来与信息流中的其他广告千篇一律；请先向该技能提供效果出色的广告、评论和留言
- **跳过留言输入**——广告留言中包含客户自己提出的异议和角度；这些内容通常转化效果最佳
- **一次测试过多内容**——每个测试周期只更改一个变量
- **过早停用创意**——至少获得 1,000 次展示后再做判断

---

## 工具集成

有关拉取效果数据和管理广告活动的信息，请参阅[工具注册表](../../tools/REGISTRY.md)。

| 平台 | 拉取效果数据 | 管理广告活动 | 指南 |
|----------|:---------------------:|:----------------:|-------|
| **Google Ads** | `google-ads campaigns list`, `google-ads reports get` | `google-ads campaigns create` | [google-ads.md](../../tools/integrations/google-ads.md) |
| **Meta Ads** | `meta-ads insights get` | `meta-ads campaigns list` | [meta-ads.md](../../tools/integrations/meta-ads.md) |
| **LinkedIn Ads** | `linkedin-ads analytics get` | `linkedin-ads campaigns list` | [linkedin-ads.md](../../tools/integrations/linkedin-ads.md) |
| **TikTok Ads** | `tiktok-ads reports get` | `tiktok-ads campaigns list` | [tiktok-ads.md](../../tools/integrations/tiktok-ads.md) |

### 工作流程：拉取数据、分析、生成

```bash
# 1. Pull recent ad performance
node tools/clis/google-ads.js reports get --type ad_performance --date-range last_30_days

# 2. Analyze output (identify top/bottom performers)
# 3. Feed winning patterns into this skill
# 4. Generate new variations
# 5. Upload to platform
```

---

## 相关技能

- **ads**：用于广告活动策略、定向、预算和优化
- **marketing-loops**：用于按固定周期运行静态批量生成（每日创意投放循环）
- **customer-research**：用于在构建基于事实的输入语料库时挖掘评论和留言
- **copywriting**：用于落地页文案（广告流量的着陆页面）
- **ab-testing**：用于以严谨的统计方法设计创意测试
- **marketing-psychology**：用于了解高效果创意背后的心理学原理
- **copy-editing**：用于在发布前润色广告文案