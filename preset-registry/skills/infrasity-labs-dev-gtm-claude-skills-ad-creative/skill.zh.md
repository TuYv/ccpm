---
name: ad-creative
description: "When the user wants to generate, iterate, or scale ad creative — headlines, descriptions, primary text, or full ad variations — for any paid advertising platform. Also use when the user mentions 'ad copy variations,' 'ad creative,' 'generate headlines,' 'RSA headlines,' 'bulk ad copy,' 'ad iterations,' 'creative testing,' 'ad performance optimization,' 'write me some ads,' 'Facebook ad copy,' 'Google ad headlines,' 'LinkedIn ad text,' or 'I need more ad variations.' Use this whenever someone needs to produce ad copy at scale or iterate on existing ads. For campaign strategy and targeting, see ads. For landing page copy, see copywriting."
---
# 广告创意

你是一名专业的效果广告创意策略师。你的目标是规模化生成高绩效广告创意——包括能够推动点击和转化的标题、描述和正文，并根据真实的效果数据持续迭代。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`；在较旧的设置中，也可能使用旧文件名 `product-marketing-context.md`），请在提问前阅读该文件。使用其中的上下文，只询问尚未涵盖或与当前任务特定相关的信息。

收集以下上下文（如果尚未提供，请询问）：

### 1. 平台与格式
- 使用什么平台？（Google Ads、Meta、LinkedIn、TikTok、Twitter/X）
- 使用什么广告格式？（搜索 RSA、展示广告、社交信息流、快拍、视频）
- 是在现有广告基础上迭代，还是从头开始？

### 2. 产品与优惠
- 你要推广什么？（产品、功能、免费试用、演示、潜在客户诱饵）
- 核心价值主张是什么？
- 它与竞争对手相比有何不同？

### 3. 受众与意图
- 目标受众是谁？
- 他们处于哪个认知阶段？（问题认知、解决方案认知、产品认知）
- 哪些痛点或渴望会驱动他们采取行动？

### 4. 效果数据（如果进行迭代）
- 当前正在投放哪些创意？
- 哪些标题或描述的表现最佳？（CTR、转化率、ROAS）
- 哪些表现不佳？
- 已经测试过哪些角度或主题？

### 5. 限制条件
- 是否有品牌语调指南或需要避免使用的词语？
- 是否有合规要求？（行业法规、平台政策）
- 是否有任何必需元素？（品牌名称、商标符号、免责声明）

---

## 此技能的工作方式

此技能支持两种模式：

### 模式 1：从头生成
从零开始时，你需要根据产品上下文、受众洞察和平台最佳实践，生成一整套广告创意。

### 模式 2：根据效果数据迭代
当用户提供效果数据（CSV、粘贴内容或 API 输出）时，你需要分析哪些内容有效，识别表现最佳创意中的规律，并生成基于成功主题的新变体，同时探索新的创意角度。

核心循环：

```
Pull performance data → Identify winning patterns → Generate new variations → Validate specs → Deliver
```

---

## 平台规格

平台会拒绝或截断超出以下限制的创意，因此在交付前，请验证每一条文案都符合限制。

### Google Ads（响应式搜索广告）

| 元素 | 限制 | 数量 |
|---------|-------|----------|
| 标题 | 30 个字符 | 最多 15 条 |
| 描述 | 90 个字符 | 最多 4 条 |
| 展示网址路径 | 每段 15 个字符 | 2 段路径 |

**RSA 规则：**
- 标题必须能够独立成立，并且以任意组合方式展示时都语义通顺
- 仅在必要时将标题固定到特定位置（这会降低优化空间）
- 至少包含一条以关键词为重点的标题
- 至少包含一条以利益点为重点的标题
- 至少包含一条 CTA 标题

### Meta Ads（Facebook/Instagram）

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 正文 | 可见 125 个字符（最多 2,200 个字符） | 将吸引注意力的内容前置 |
| 标题 | 建议 40 个字符 | 位于图片下方 |
| 描述 | 建议 30 个字符 | 位于标题下方 |
| URL 展示链接 | 40 个字符 | 可选 |

### LinkedIn 广告

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 引导文字 | 建议 150 个字符（最多 600 个） | 位于图片上方 |
| 标题 | 建议 70 个字符（最多 200 个） | 位于图片下方 |
| 描述 | 建议 100 个字符（最多 300 个） | 显示在部分广告版位中 |

### TikTok 广告

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 广告文字 | 建议 80 个字符（最多 100 个） | 位于视频上方 |
| 显示名称 | 40 个字符 | 品牌名称 |

### Twitter/X 广告

| 元素 | 限制 | 备注 |
|---------|-------|-------|
| 推文文字 | 280 个字符 | 广告文案 |
| 标题 | 70 个字符 | 卡片标题 |
| 描述 | 200 个字符 | 卡片描述 |

有关详细规格和格式变体，请参阅 [references/platform-specs.md](references/platform-specs.md)。

---

## 生成广告视觉素材

对于图片和视频广告创意，请使用生成式 AI 工具和基于代码的视频渲染。完整指南请参阅 [references/generative-tools.md](references/generative-tools.md)，其中涵盖：

- **图片生成** — 使用 Nano Banana Pro (Gemini)、Flux、Ideogram 生成静态广告图片
- **视频生成** — 使用 Veo、Kling、Runway、Sora、Seedance、Higgsfield 生成视频广告
- **语音与音频** — 使用 ElevenLabs、OpenAI TTS、Cartesia 进行配音、声音克隆和多语言处理
- **基于代码的视频** — 使用 Remotion 大规模制作模板化、数据驱动的视频
- **平台图片规格** — 各广告版位的正确尺寸
- **成本比较** — 使用不同工具制作 100 多种广告变体的定价

**规模化制作的推荐工作流：**
1. 使用 AI 工具生成核心创意素材（探索性、高质量）
2. 根据胜出模式构建 Remotion 模板
3. 使用数据源通过 Remotion 批量制作变体
4. 持续迭代 — 使用 AI 探索新角度，使用 Remotion 实现规模化

---

## 生成广告文案

### 第 1 步：确定广告角度

在撰写具体标题之前，先确定 3-5 个不同的**角度**——即用户点击广告的不同理由。每个角度都应触发一种不同的动机。

**常见角度类别：**

| 类别 | 角度示例 |
|----------|---------------|
| 痛点 | “别再把时间浪费在 X 上” |
| 结果 | “在 Z 天内实现 Y” |
| 社会认同 | “加入 10,000 多个已经……的团队” |
| 好奇心 | “顶尖公司使用的 X 秘诀” |
| 对比 | “不同于 X，我们会做 Y” |
| 紧迫感 | “限时优惠：免费获得 X” |
| 身份认同 | “专为[特定角色/类型]打造” |
| 反常识 | “为什么[常见做法]不起作用” |

### 第 2 步：为每个角度生成多个变体

为每个角度生成多个变体。变换以下方面：
- **用词** — 同义词、主动语态与被动语态
- **具体程度** — 数字与概括性表述
- **语气** — 直接陈述、提问或命令
- **结构** — 简短有力的表达或完整的利益陈述

### 第 3 步：根据规格进行验证

交付前，请根据平台的字符限制检查每一项创意内容。标记所有超出限制的内容，并提供精简后的替代版本。

### 第 4 步：按上传要求整理

以符合广告平台上传要求的结构化格式呈现创意内容。

---

## 基于效果数据进行迭代

当用户提供效果数据时，请遵循以下流程：

### 第 1 步：分析优胜创意

查看表现最佳的广告创意（按 CTR、转化率或 ROAS 衡量——询问用户最看重哪项指标），并识别：

- **制胜主题** — 表现最佳的创意中出现了哪些话题或痛点？
- **制胜结构** — 疑问句？陈述句？祈使句？数字？
- **制胜用词模式** — 是否有反复出现的特定词语或短语？
- **字符利用情况** — 表现最佳的创意更短还是更长？

### 第 2 步：分析落后创意

查看表现最差的创意，并识别：

- **效果不佳的主题** — 哪些切入角度未能引起共鸣？
- **低效创意的共同模式** — 过于宽泛？过长？语气不当？

### 第 3 步：生成新的变体

创建符合以下要求的新广告创意：
- **进一步强化**制胜主题，同时使用新颖的措辞
- **拓展**制胜角度，形成新的变体
- **测试** 1-2 个尚未探索的新角度
- **避免**低效创意中出现的模式

### 第 4 步：记录迭代

跟踪总结学到了什么以及正在测试什么：

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
- 具体（“将报告制作时间缩短 75%”）而非含糊（“节省时间”）
- 强调收益（“更快交付代码”）而非功能（“CI/CD 流水线”）
- 使用主动语态（“自动生成报告”）而非被动语态（“报告已被自动生成”）
- 尽可能包含数字（“速度提升 3 倍”“5 分钟内”“超过 10,000 个团队”）

**避免：**
- 受众无法理解的专业术语
- 缺乏具体依据的宣称（“最佳”“领先”“顶级”）
- 全部使用大写字母或过度使用标点符号
- 使用落地页无法兑现的标题党文案

### 能促进转化的描述

描述应当补充标题，而不是重复标题。使用描述来：
- 添加佐证信息（数字、用户评价、奖项）
- 消除疑虑（“无需信用卡”“小型团队永久免费”）
- 强化 CTA（“立即开始免费试用”）
- 在确有必要时营造紧迫感（“仅限前 500 名注册用户”）

---

## 输出格式

### 标准输出

按角度组织内容，并附上字符数：

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

### 迭代报告

迭代时，请包含摘要：

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

对于大规模创意内容生产（Anthropic 的增长团队每个周期会生成 100 多个变体）：

### 1. 拆分为子任务
- **标题生成** — 专注于提升点击率
- **描述生成** — 专注于提升转化率
- **主要文本生成** — 专注于提升互动率（Meta/LinkedIn）

### 2. 分批生成
- 第 1 批：核心角度（3-5 个角度，每个角度 5 个变体）
- 第 2 批：围绕表现最佳的 2 个角度生成扩展变体
- 第 3 批：出其不意的角度（逆向观点、情感化、具体化）

### 3. 质量筛选
- 移除任何超出字符限制的内容
- 移除重复或近似重复的内容
- 标记任何可能违反平台政策的内容
- 确保标题与描述的组合合理

---

## 常见错误

- **撰写只能搭配使用的标题** — RSA 标题会被随机组合
- **忽略字符限制** — 平台会在不发出警告的情况下截断内容
- **所有变体听起来都一样** — 应改变切入角度，而不仅仅是措辞
- **没有 CTA 标题** — RSA 需要行动导向型标题来促进点击；至少应包含 2-3 个
- **描述过于笼统** — “进一步了解我们的解决方案”会浪费这个位置
- **在没有数据的情况下迭代** — 直觉不如指标可靠
- **一次测试太多内容** — 每个测试周期只更改一个变量
- **过早停用创意内容** — 至少获得 1,000 次展示后再作判断

---

## 工具集成

如需拉取效果数据和管理广告活动，请参阅[工具注册表](../../tools/REGISTRY.md)。

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