---
name: brand-voice-learner
description: Analyze existing brand content to extract voice patterns, create voice guidelines, and ensure consistent brand expression
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 品牌声音学习器

> 分析现有品牌内容以提取声音特征，创建可执行的声音指南，并确保所有传播内容中的品牌表达保持一致。

## 何时使用此技能

- 创建品牌声音指南
- 帮助新作者入职
- 审核声音一致性
- 针对不同渠道调整声音
- 训练 AI 写作工具

## 方法论基础

基于 **NN/g 声音研究**和**内容策略最佳实践**，结合：
- 语言模式分析
- 声音维度映射
- 指南制定
- 一致性衡量

## Claude 做什么，以及由你决定什么

| Claude 做什么 | 由你决定什么 |
|-------------|------------|
| 分析现有内容 | 要分析的内容来源 |
| 提取声音模式 | 声音的演进方向 |
| 创建声音指南 | 审批指南 |
| 识别不一致之处 | 例外情况的处理 |
| 提供声音示例建议 | 最终的声音选择 |

## 说明

### 第 1 步：收集声音样本

**要分析的内容：**
| 来源 | 用途 |
|--------|---------|
| 网站文案 | 核心品牌声音 |
| 博客文章 | 扩展声音 |
| 社交媒体 | 轻松随意的变化 |
| 电子邮件营销活动 | 直接沟通 |
| 产品 UI | 功能性声音 |
| 客户支持 | 富有同理心的声音 |

**样本要求：**
- 至少 10-15 份
- 涵盖多种情境
- 包含最佳示例
- 涵盖不同语气

### 第 2 步：分析声音维度

**声音维度框架：**

| 维度 | 光谱 |
|-----------|----------|
| 正式程度 | 随意 ←→ 正式 |
| 个性 | 严肃 ←→ 活泼 |
| 直接程度 | 间接 ←→ 直接 |
| 热情程度 | 克制 ←→ 热情 |
| 技术性 | 简单 ←→ 专业 |
| 亲和度 | 疏离 ←→ 亲切 |

### 第 3 步：提取模式

**语言元素：**
| 元素 | 要识别的内容 |
|---------|-----------------|
| 句子长度 | 短、中、长 |
| 用词选择 | 常用词、专业词、品牌专用词 |
| 缩写形式 | 使用、避免使用、混合使用 |
| 主动/被动语态 | 偏好 |
| 代词 | We/you/they 的使用模式 |
| 标点符号 | 感叹号、省略号等 |

### 第 4 步：编写指南

**指南结构：**
1. 声音原则（3-5 条）
2. 维度评分
3. 应做/不应做示例
4. 渠道差异
5. 词汇表

### 第 5 步：创建一致性工具

**要创建的工具：**
- 声音检查清单
- 示例库
- 词语/短语词典
- 渠道指南

## 示例

### 示例 1：完整声音分析

**输入：**
```
Analyze brand voice from these samples:

Website: "We build tools that actually work. No fluff, no complexity—
just software that helps you get stuff done."

Blog: "Here's the thing about productivity apps: most of them make
your life harder, not easier. We think that's backwards."

Email: "Hey there! Your trial is almost over. Before you go, we wanted
to make sure you saw everything [Product] can do."

Social: "Mondays are hard. Your software shouldn't be. ☕"
```

**输出：**
```
## Brand Voice Analysis

### Voice Summary

**Overall Character:** Confident, casual, anti-corporate

Your brand sounds like a smart friend who's direct and relatable—
someone who gets frustrated by the same things your customers do
and isn't afraid to call out industry BS.

---

### Voice Dimensions

```
Formality     [===|======] Casual (3/10)
Personality   [======|===] Playful (7/10)
Directness    [========|=] Very Direct (9/10)
Enthusiasm    [=====|====] Moderate (6/10)
Technical     [====|=====] Accessible (4/10)
Warmth        [======|===] Warm (7/10)
```

---

### Voice Principles

#### 1. Say it Straight
No corporate speak, no jargon inflation. If you can say it
in fewer words, do it.

**Examples:**
- ✅ "We build tools that actually work"
- ❌ "We leverage cutting-edge solutions to optimize..."

#### 2. Take Their Side
Position as ally against frustration. You share their pain
with the status quo.

**Examples:**
- ✅ "Most productivity apps make your life harder"
- ❌ "Our competitors offer suboptimal experiences"

#### 3. Stay Human
Contractions, casual language, occasional humor. Sound like
a person, not a press release.

**Examples:**
- ✅ "Here's the thing about..."
- ❌ "It is important to note that..."

#### 4. Confident, Not Arrogant
State opinions clearly without hedging, but don't put
others down.

**Examples:**
- ✅ "No fluff, no complexity"
- ❌ "Unlike those other terrible apps..."

---

### Linguistic Patterns

| Element | Pattern | Examples |
|---------|---------|----------|
| Sentence length | Short to medium (8-15 words average) | "We think that's backwards." |
| Contractions | Always used | "That's", "shouldn't", "we're" |
| Pronouns | Heavy "we/you" | Creates conversational feel |
| Active voice | Strong preference | "We build" not "Tools are built" |
| Punctuation | Occasional em-dashes, rare exclamations | "No fluff—just software" |
| Emoji | Occasional, relevant | Coffee emoji for Monday post |

---

### Voice Do's and Don'ts

#### DO ✅

| Pattern | Example |
|---------|---------|
| Use contractions | "We're building" not "We are building" |
| Start with "Here's the thing" | Conversational opener |
| Use "actually" for emphasis | "Tools that actually work" |
| Reference shared frustrations | "Mondays are hard" |
| Keep paragraphs short | 2-3 sentences max |
| Use second person | "Your trial" "helps you" |

#### DON'T ❌

| Pattern | Why Not |
|---------|---------|
| "Leverage" "optimize" "synergy" | Corporate jargon |
| "We are pleased to announce" | Stiff, formal |
| Passive voice | "Was built by our team" |
| Hedging language | "We think maybe possibly..." |
| Long, complex sentences | Loses casual feel |
| Excessive exclamation points | Feels fake enthusiastic |

---

### Word Choice Guide

#### Preferred Terms

| Instead of | Use |
|------------|-----|
| Utilize | Use |
| Leverage | Use |
| Solutions | Tools, software |
| Empower | Help |
| Seamless | Easy, simple |
| Robust | Strong, reliable |
| Best-in-class | (just show, don't tell) |
| Cutting-edge | New, latest |

#### Signature Phrases

| Phrase | When to Use |
|--------|-------------|
| "Here's the thing" | Starting opinion pieces |
| "Actually" | Emphasizing real value |
| "No [negative], no [negative]" | Simple value props |
| "That's backwards" | Calling out industry norms |

---

### Channel Variations

#### Website (Core Voice)
- Most polished version
- Still casual but refined
- Slightly higher stakes language

#### Blog (Extended Voice)
- More conversational
- Can be longer, more exploratory
- Personal opinions encouraged

#### Social Media (Compressed Voice)
- Shortest, punchiest
- More humor allowed
- Emoji occasionally OK
- Can reference current events/culture

#### Email (Direct Voice)
- Friendly but action-oriented
- "Hey there" openings OK
- Clear CTAs
- Personal where possible

#### Support (Empathetic Voice)
- Warmer, more patient
- Solution-focused
- Less attitude, more help
- Still casual but careful

---

### Voice Checklist

Before publishing, check:

- [ ] Would you say this to a friend?
- [ ] Are there any "corporate speak" words?
- [ ] Is it shorter than it could be?
- [ ] Is the main point clear?
- [ ] Does it sound like us, not a competitor?
- [ ] Would it make sense without context?
```

### 示例 2：快速品牌语言审核

**输入：**
```
Does this match our voice?
"We are delighted to inform you that your request has been
processed and the desired outcome has been achieved."
```

**输出：**
```
## Voice Audit

### Verdict: ❌ Does Not Match

---

### Issues Found

| Problem | Example | Should Be |
|---------|---------|-----------|
| Too formal | "We are delighted" | "Great news!" |
| Passive voice | "has been processed" | "We processed" |
| Corporate speak | "desired outcome" | "what you wanted" |
| Stiff structure | Full sentence | Shorter, direct |

---

### Rewritten

**Original:**
> "We are delighted to inform you that your request has been
> processed and the desired outcome has been achieved."

**On-brand version:**
> "Good news! We've taken care of your request—you're all set."

**Even more casual:**
> "Done! Your request went through. You're good to go."

---

### What Went Wrong

This sounds like a corporate auto-reply, not your brand.
It has:
- No contractions
- Passive voice
- Formal phrasing
- No personality

Your brand would sound like a helpful friend delivering good news,
not a legal notice.
```

## Skill 边界

### 此 Skill 擅长的工作
- 分析现有内容
- 提取品牌语言模式
- 创建指南
- 审核一致性

### 此 Skill 无法完成的工作
- 从零开始创造品牌语言
- 了解你的品牌策略
- 访问你的所有内容
- 取代品牌判断

## 迭代指南

**后续提示词：**
- “使用我们的品牌语言重写此内容”
- “为[渠道]创建品牌语言变体”
- “审核这些样本的一致性”
- “添加到我们的词汇/短语字典中”

## 参考资料

- NN/g 品牌语言与语调指南
- 内容策略联盟
- Mailchimp 品牌语言与语调
- Buffer 品牌语言指南

## 相关 Skill

- `brand-strategy` - 整体品牌建设
- `copywriting-ogilvy` - 写作技巧
- `storytelling-storybrand` - 叙事语言

## Skill 元数据

- **领域**：品牌 / 内容
- **复杂度**：中级
- **模式**：cyborg
- **价值实现时间**：完整指南需要 2-4 小时
- **前提条件**：内容样本、品牌背景