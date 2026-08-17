---
name: voice-design
description: "Select and create the perfect AI voice for your content using ElevenLabs, Qwen3-TTS, and other platforms—matching voice characteristics to brand personality and audience. Use when: Choosing an AI voice for video narration; Creating a consistent brand voice across content; Cloning a voice for scalable production; Comparing voice synthesis platforms; Designing voice characteristics by description"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# AI 语音设计

> 使用 ElevenLabs、Qwen3-TTS 和其他平台，为你的内容选择并创建完美的 AI 语音，使语音特征与品牌个性和受众相匹配。

## 何时使用此技能

- 为视频旁白选择 AI 语音
- 在不同内容中创建一致的品牌声音
- 克隆语音以实现规模化制作
- 比较语音合成平台
- 通过描述设计语音特征
- 为不同角色或用途选配多种语音

## 方法论基础

**来源**：ElevenLabs + Qwen3-TTS + 语音设计最佳实践

**核心原则**：“语音决定了视频 50% 的感染力”——选择不当或生成质量不佳的语音会破坏沉浸感。最好的 AI 语音，是听众察觉不到它是 AI 的语音。这要求语音特征（年龄、性别、语气、语速）与内容类型及受众预期相匹配。

**为何这很重要**：对于大多数使用场景，AI 语音合成已经达到人类水平的质量，能够支持规模化内容创作。但这项技术的实际效果取决于语音选择。无论语音听起来多么自然，不匹配的语音都会削弱内容效果。


## Claude 做什么，什么由你决定

| Claude 做什么 | 你决定什么 |
|-------------|------------|
| 构建制作工作流 | 最终创意方向 |
| 建议技术方案 | 设备和工具选择 |
| 创建模板和检查清单 | 质量标准 |
| 识别最佳实践 | 品牌与语音决策 |
| 生成脚本大纲 | 最终脚本审批 |

## 此技能的作用

1. **使语音与品牌匹配** - 将品牌属性转化为语音特征
2. **选择最佳平台** - 根据需求在 ElevenLabs、Qwen3-TTS 和其他替代方案之间进行选择
3. **通过描述设计语音** - 根据文本提示创建自定义语音
4. **管理语音一致性** - 在不同项目中保持使用相同的语音
5. **为多语音项目选角** - 为对话或角色选择相互协调的语音

## 使用方法

### 选择 AI 语音
```
Help me choose an AI voice for [content type].
Brand: [personality]
Audience: [who]
Content: [describe]
Platform preference: [if any]
```

### 设计自定义语音
```
Design a voice for my brand:
Brand personality: [traits]
Target audience: [who]
Use cases: [where voice will be used]
```

### 比较平台
```
Compare voice platforms for my needs:
Volume: [how much content]
Languages: [which]
Budget: [range]
Features needed: [cloning, real-time, etc.]
```

## 操作说明

设计 AI 语音时，请遵循以下方法论：

### 第 1 步：定义语音需求

在选择平台或语音之前，先记录你的需求。

```
## Voice Requirements Worksheet

### Brand Alignment
**Brand personality** (3-5 traits):
**Tone of voice** (formal/casual/playful/etc.):
**Existing brand sounds** (if any):

### Audience Match
**Primary audience** (age, context):
**What voice would they trust?**
**What voice would feel authentic to them?**

### Technical Requirements
**Languages needed**:
**Monthly volume** (minutes/hours):
**Real-time needed?** (yes/no):
**Voice cloning needed?** (yes/no):
**Budget** (monthly):

### Content Types
□ Long-form narration (courses, audiobooks)
□ Short-form video (social, ads)
□ Conversational (chatbots, assistants)
□ Character voices (multiple speakers)
□ Localization (same voice, multiple languages)
```

---

### 第 2 步：选择平台

根据需求匹配平台。

```
## Platform Decision Matrix (2026)

### ElevenLabs
**Best for**: Premium quality, voice cloning, multilingual
**Pricing**: $5-330/mo
**Languages**: 29+
**Voice cloning**: Yes (from $22/mo)
**Latency**: 75ms (Flash v2.5)

**Choose if**:
- Quality is top priority
- Need professional voice cloning
- Require many languages with same voice
- Budget allows $20+/mo

### Qwen3-TTS (Open Source)
**Best for**: Self-hosted, zero marginal cost, privacy
**Pricing**: Free (+ GPU costs)
**Languages**: 10
**Voice cloning**: Yes (zero-shot from 3 seconds)
**Latency**: 97ms streaming

**Choose if**:
- Processing sensitive data locally
- High volume (cost per minute matters)
- Technical capability to self-host
- Need real-time streaming

### Murf.ai
**Best for**: Professional voiceover, video workflow
**Pricing**: $19-99/mo
**Languages**: 45+
**Voice cloning**: Limited
**Special**: "Say It My Way" intonation control

**Choose if**:
- Need studio voiceover quality
- Video production workflow
- Team collaboration needed
- Want precise pronunciation control

### OpenAI TTS
**Best for**: Simple integration, developer-focused
**Pricing**: $15/M characters
**Languages**: Limited
**Voices**: 6 presets (alloy, echo, fable, onyx, nova, shimmer)

**Choose if**:
- Already using OpenAI ecosystem
- Simple API integration needed
- Don't need customization
- Light usage

### Budget Decision

| Budget | Recommendation |
|--------|----------------|
| $0 | Qwen3-TTS (self-hosted) |
| $5-20/mo | ElevenLabs Starter |
| $20-50/mo | ElevenLabs Creator (with cloning) |
| $100+/mo | ElevenLabs Pro or Murf Pro |
| High volume | Self-hosted Qwen3-TTS |
```

---

### 第 3 步：将品牌转化为声音

将品牌属性转换为声音参数。

```
## Brand-to-Voice Translation

### Voice Attributes

| Brand Trait | Voice Translation |
|-------------|-------------------|
| Professional | Lower pitch, measured pace, clear articulation |
| Friendly | Mid-pitch, warm tone, slight smile quality |
| Authoritative | Deep, resonant, slower pace, confident pauses |
| Energetic | Higher pitch variation, faster pace, dynamic range |
| Trustworthy | Steady, consistent, neutral accent, clear |
| Innovative | Modern quality, subtle processing, distinctive |
| Warm | Rich mid-tones, soft consonants, unhurried |
| Premium | Controlled, polished, slight reverb/space |

### Voice Parameter Guide

**Pitch Range**:
- Low: Authority, seriousness, gravitas
- Mid: Versatility, approachability
- High: Energy, youth, friendliness

**Pace**:
- Slow: Premium, thoughtful, serious content
- Medium: Most content, versatile
- Fast: Energetic, urgent, young audience

**Accent**:
- Neutral: Universal appeal, no specific region
- Regional: Authenticity for specific markets
- International: European/British for sophistication (to US ears)
```

---

### 第 4 步：通过描述设计声音（ElevenLabs）

ElevenLabs 支持通过文本描述来设计声音。

```
## Voice Design Prompts

### Template
"A [gender] voice in their [age range], with a [accent] accent.
The voice is [tone qualities] with [delivery characteristics].
[Additional characteristics or limitations]."

### Examples

**Corporate Explainer**:
"A male voice in his late 30s, with a neutral American accent.
The voice is warm and professional with clear articulation and
measured pacing. Sounds like a trusted advisor, not a salesman."

**E-learning Instructor**:
"A female voice in her early 40s, with a slight British accent.
The voice is encouraging and patient with a natural, conversational
delivery. Sounds like a supportive teacher who makes complex
topics accessible."

**Tech Product Demo**:
"A young male voice in his late 20s, with a West Coast American accent.
The voice is confident and energetic with a modern, casual delivery.
Sounds knowledgeable but not condescending, like explaining to a
friend who's also into tech."

**Luxury Brand**:
"A female voice in her 30s, with a subtle French accent.
The voice is sophisticated and understated with elegant pacing
and restrained emotion. Sounds exclusive but welcoming, never rushed."

### Tips for Better Results
- Be specific about age (not just "young" but "late 20s")
- Describe the feeling, not just mechanics
- Reference the context/listener relationship
- Iterate: try 3-5 variations, pick the best
```

---

### 第 5 步：多声音角色配置

当内容需要多个说话者时。

```
## Voice Casting for Multi-Speaker Content

### Dialogue Principles

**Contrast**:
- Different pitches (one higher, one lower)
- Different timbres (one warm, one bright)
- Different energies (one measured, one dynamic)

**Cohesion**:
- Similar quality level
- Compatible accents
- Both feel "from the same world"

### Example Cast

**Corporate Training Video (3 voices)**:

| Role | Voice Type | Platform Choice |
|------|-----------|-----------------|
| Narrator | Authoritative female, 40s | ElevenLabs "Charlotte" |
| Employee A | Friendly male, 30s | ElevenLabs "Daniel" |
| Employee B | Energetic female, 20s | ElevenLabs "Elli" |

**Podcast-Style Explainer (2 voices)**:

| Role | Voice Type | Characteristics |
|------|-----------|-----------------|
| Host | Warm male, mid-30s | Conversational, asks questions |
| Expert | Authoritative female, 40s | Knowledgeable, explains |

### Casting Checklist

□ Voices are clearly distinguishable by ear
□ Voices complement (not clash)
□ Power dynamic appropriate for content
□ All voices pass the "would I trust this person?" test
□ Consistent quality/processing across all voices
```

---

### 第 6 步：声音一致性管理

在不同项目中保持相同的声音。

```
## Voice Consistency System

### Documentation

Create a Voice ID Card for each brand voice:

```markdown
## Voice ID: [Brand Name] Primary

**Platform**: ElevenLabs
**Voice ID/Name**: [voice identifier]
**Created**: [date]

### Specifications
- Base voice: [name or description]
- Stability: 0.7 (or setting used)
- Clarity: 0.8 (or setting used)
- Style exaggeration: 0 (or setting used)

### Usage Guidelines
- Primary use: [main content types]
- Never use for: [inappropriate contexts]
- Pair with: [complementary voices]

### Reference Sample
[Link to audio sample]
[Link to key content using this voice]

### Settings History
- v1.0 (date): Initial settings
- v1.1 (date): Adjusted clarity for better consonants
```

### 质量控制

□ 使用参考样本检验新内容
□ 使用克隆声音时检查是否出现偏移
□ 确认处理方式/效果保持一致
□ 在多种播放设备上测试
□ 定期请外部人员进行听感检查
```

## 示例

### 示例 1：SaaS 产品演示声音

**背景**：为产品演示视频选择 AI 声音。

**输入**：
> 帮我为我们的 SaaS 产品演示选择一个 AI 声音。品牌调性专业但友好，受众是 B2B 决策者（30-50 岁），我们每月制作 4-5 个视频。

**输出**：

## 声音选择：SaaS 演示视频

### 需求分析
- **品牌**：专业 + 友好（平易近人的权威感）
- **受众**：B2B 决策者，30-50 岁
- **用量**：每月 4-5 个视频（总计约 30-60 分钟）
- **隐含需求**：值得信赖、清晰、不带推销感

### 平台推荐：ElevenLabs Creator（$22/月）

**原因**：
- 质量符合专业 B2B 场景的预期
- 用量符合套餐限制
- 专业声音库
- 如果之后有需要，还可以克隆创始人的声音

### 声音选择

**主要声音**：Rachel（ElevenLabs）
- 女性、美式口音、听起来约 35 岁
- 专业而温暖，发音清晰
- 既适合功能演示，也适合朗读客户感言
- 对大多数人来说，听起来不像“AI”

**备选声音**：Josh（ElevenLabs）
- 男性、美式口音、听起来约 40 岁出头
- 有权威感但不古板
- 适合深入讲解技术内容

### 设置

```
Voice: Rachel
Stability: 0.75 (natural variation)
Clarity + Similarity: 0.80 (prioritize clarity)
Style: 0 (neutral, professional)
```

### 示例脚本测试

在最终确定之前，使用具有代表性的内容进行测试：

“DataFlow 可在几分钟内与你现有的工具集成，
而不是几个月。具体方法如下：只需通过我们安全的 OAuth 流程
连接你的 Salesforce 实例，我们就会自动映射你的
自定义字段。无需提交 IT 工单。”

→ 注意聆听：语流是否自然、技术术语是否清晰、语速是否合适

---

### 示例 2：多语言品牌声音

**背景**：将内容扩展到多个市场，同时保持声音一致。

**输入**：
> 我们需要用英语、法语和西班牙语制作内容，并保持一致的品牌声音。在所有语言中都要听起来像是同一个“人”。只要解决方案合适，预算可以灵活调整。

**输出**：

## 多语言声音策略

### 挑战
在不同语言间保持一致的品牌“角色”——不仅是翻译，还要让听众感受到是同一个人在说话。

### 推荐平台：ElevenLabs Pro（$99/月）

**选择 ElevenLabs 处理多语言内容的原因**：
- 同一个声音可以自然地说 29 种以上的语言
- 在不同语言间保留语气和角色特征
- 在保持品牌一致性方面，优于分别使用不同的母语声音
- 配音功能可以保持口型同步

### 实施方案

**方案 1：设计一种声音，跨语言使用**

1. 使用 Voice Design 创建完美的英语声音
2. 将完全相同的声音用于法语和西班牙语
3. ElevenLabs 会根据不同语言真实地处理口音

**声音设计提示词**：
“一种温暖、自信、听起来 30 岁出头的声音。性别中性，
略偏女性化。发音清晰、专业，具有现代感和国际化特质。
无论是在纽约、巴黎还是马德里，都应该听起来自然契合。
展现平易近人的专家气质。”

**方案 2：克隆创始人/发言人的声音**

如果有一位能够体现品牌特质的真人：
1. 克隆其声音（需要 30 分钟以上的样本）
2. 将克隆声音用于所有语言
3. 其声音的“神韵”会得到保留，同时口音会自动适配

### 特定语言注意事项

| 语言 | 注意事项 |
|----------|--------------|
| 英语 | 基础声音，主要开发语言 |
| 法语 | 语速稍慢，遵循法语发音模式 |
| 西班牙语 | 选择卡斯蒂利亚变体或拉丁美洲变体 |

### 质量控制

- 由各语言的母语人士审核
- 检查品牌术语是否存在不自然的发音
- 验证数字和日期的读法是否正确
- 测试技术词汇

## 检查清单与模板

### 声音选择检查清单

```
## Before Selecting

□ Brand personality documented
□ Audience defined
□ Content types listed
□ Volume estimated
□ Budget confirmed
□ Languages needed identified

## Selection Process

□ Shortlist 3-5 candidate voices
□ Test with real script content
□ Listen on target devices (phone, laptop)
□ Get team feedback
□ Test for ear fatigue (listen to 5+ minutes)
□ Verify consistency across sample content

## After Selection

□ Document voice settings
□ Save reference samples
□ Create usage guidelines
□ Test with production content
□ Plan for localization if needed
```

---

### 语音平台对比

```
## Quick Reference

| Need | Best Choice |
|------|-------------|
| Premium quality | ElevenLabs |
| Zero cost | Qwen3-TTS (self-hosted) |
| Voice cloning | ElevenLabs Creator+ |
| 29+ languages | ElevenLabs |
| Video workflow | Murf.ai |
| OpenAI ecosystem | OpenAI TTS |
| Real-time | Qwen3-TTS or ElevenLabs Flash |
| Data privacy | Qwen3-TTS (self-hosted) |
```

## 技能边界

### 此技能擅长的事项
- 构建音频制作工作流
- 提供技术指导
- 创建质量检查清单
- 提出创意方案

### 此技能无法完成的事项
- 取代音频工程专业知识
- 作出主观的创意决策
- 直接访问或编辑音频文件
- 保证商业成功

## 参考资料

- ElevenLabs 文档——声音设计与克隆指南
- Qwen3-TTS 与 ElevenLabs 对比——ByteIota
- 2026 年最佳文本转语音 AI——AIML API 评测
- Murf AI 评测——声音设计工作流

## 相关技能

- [voice-localization](../voice-localization/) - 跨语言使用相同声音
- [voiceover-direction](../voiceover-direction/) - 与真人配音人才合作
- [sonic-branding](../sonic-branding/) - 品牌音频标识
- [video-testimonial](../video-testimonial/) - 客户视频内容

---

## Skill 元数据（内部使用）

```yaml
name: voice-design
category: audio
subcategory: voice
version: 1.0
author: MKTG Skills
source_expert: ElevenLabs, Qwen3-TTS
source_work: Platform Documentation, Industry Comparisons
difficulty: intermediate
estimated_value: $200-1,000 per voice design project
tags: [ai-voice, tts, elevenlabs, voice-synthesis, brand-voice]
created: 2026-01-26
updated: 2026-01-26
```