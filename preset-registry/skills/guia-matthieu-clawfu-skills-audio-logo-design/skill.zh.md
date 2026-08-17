---
name: audio-logo-design
description: "Create memorable sonic logos using design principles from Intel, Netflix, and McDonald's—crafting 2-5 second audio signatures that achieve instant brand recognition. Use when: Creating a sonic logo for a brand; Evaluating audio logo proposals from agencies; Understanding what makes sonic logos effective; Briefing sound designers on logo requirements; Analyzing competitor sonic logos"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 声音标志设计

> 运用来自英特尔、Netflix 和麦当劳的设计原则，创造令人难忘的声音标志——打造时长 2 至 5 秒、能够让人瞬间识别品牌的声音签名。

## 何时使用此技能

- 为品牌创作声音标志
- 评估代理机构提交的声音标志方案
- 了解声音标志取得成效的原因
- 向声音设计师说明标志需求
- 分析竞争对手的声音标志
- 针对新场景调整现有标志

## 方法论基础

**来源**：Walter Werzowa（英特尔）+ 案例研究（Netflix、麦当劳、万事达卡）

**核心原则**：“提示音越简单，就越容易被记住。”英特尔的 5 音符标志每五分钟就会在世界某处播放一次。Netflix 的双拍“ta-dum”在全球广为人知。有效的声音标志会将品牌精髓提炼成尽可能简单的声音签名，从而让人瞬间识别。

**为何重要**：声音标志相当于视觉标志的声音版本——会在每一个触点被使用成千上万次。做得好，能够持续累积品牌资产；做得不好，则意味着不断制造噪声污染，不仅无法建设品牌，反而会损害品牌。

## Claude 做什么与你决定什么

| Claude 做什么 | 你决定什么 |
|-------------|------------|
| 规划制作工作流程 | 最终创意方向 |
| 建议技术方法 | 设备和工具选择 |
| 创建模板和检查清单 | 质量标准 |
| 识别最佳实践 | 品牌／声音风格决策 |
| 生成脚本大纲 | 最终脚本审批 |

## 此技能的作用

1. **应用经过验证的设计原则** - 简洁性、独特性、灵活性
2. **指导作曲** - 音符选择、时长、配器
3. **评估效果** - 成功标准
4. **确保长久适用** - 永恒选择与潮流选择
5. **规划灵活应用** - 变体与调整方式

## 使用方法

### 设计声音标志
```
Help me design a sonic logo for [brand].
Brand personality: [traits]
Visual logo description: [what it looks like]
Primary use case: [where it will be heard most]
Duration target: [seconds]
```

### 评估声音标志
```
Evaluate this sonic logo design against best practices:
[Describe the logo or provide context]
Brand it represents: [brand]
Concerns: [what you're unsure about]
```

### 创建设计简报
```
Create a sonic logo brief for a sound designer:
Brand: [company]
Values: [personality]
References: [sonic logos you like]
Requirements: [technical constraints]
```

## 说明

设计声音标志时，请遵循以下方法论：

### 第 1 步：理解设计原则

来自大师们的核心原则。

```
## The 5 Principles of Effective Sonic Logos

### 1. SIMPLICITY
"The simpler the chime, the more memorable."

**Intel** (Walter Werzowa, 1994):
- 5 notes, 3 seconds
- Pattern: D♭ D♭ G♭ D♭ A♭
- "Estimated to play somewhere in the world every five minutes"

**Netflix** (2015):
- 2 notes (16th note timpani), 2.5 seconds
- D2 and D3 (octave)
- "The unofficial sound of binge-watch sessions"

**Rule**: If you can't hum it after one hearing, it's too complex.

### 2. DISTINCTIVENESS
Must be unlike anything else in the category.

**What makes it unique?**
- Unusual interval combination
- Distinctive timbre
- Unexpected rhythm
- Signature production element

**Test**: Play for someone who's never heard it.
"What brand might this be for?"
If they guess correctly (or close), you've hit brand alignment.
If they guess your competitor, redesign.

### 3. ALIGNMENT
Sound must match visual identity and brand values.

**Intel's logic** (Werzowa):
"Marrying computerized and physical sounds" created both
"futuristic" and "familiar"—matching Intel's position as
the technology behind everyday computing.

**Translation test**:
If your visual logo became a sound, what would it be?
- Sharp angles = percussive, defined
- Soft curves = rounded, flowing
- Bold colors = full, saturated sound
- Minimal design = sparse, clean audio

### 4. FLEXIBILITY
Must work across every context.

**Test across**:
- Video end-frame (with logo)
- Audio-only (radio, podcast, phone)
- Large format (cinema, event)
- Small format (notification, app)
- Different durations (full vs. abbreviated)

**Mastercard's approach**:
Same 6-note DNA used in:
- Full sonic logo
- Payment confirmation beep
- Hold music
- Brand advertising

### 5. TIMELESSNESS
Should work for 10+ years without feeling dated.

**Timeless elements**:
- Classic instruments or synthesis
- Clean production
- Focus on melody over production tricks
- Avoids trendy sounds

**Dating elements** (avoid):
- Heavily processed vocals
- Specific genre markers
- Technology-dependent sounds
- Trendy production techniques

**Intel's longevity**: Created 1994, still recognizable 30+ years later.
Same basic DNA with occasional production refreshes.
```

---

### 步骤 2：定义参数

在创作之前确定约束条件。

```
## Sonic Logo Specifications

### Duration
| Length | Use Case | Trade-off |
|--------|----------|-----------|
| 1-2 sec | Notifications, quick hits | Less melodic, more impact |
| 2-3 sec | Standard logo | Ideal balance |
| 3-5 sec | Video end-frames, cinema | More expression, attention required |
| 5+ sec | Extended brand moment | Risk of overstaying welcome |

**Recommendation**: Design at 2.5-3 seconds, create shorter cut-downs.

### Note Count
- **2-3 notes**: Ultra-simple, impact-focused (Netflix)
- **4-5 notes**: Balanced memorability (Intel)
- **6-7 notes**: More melodic, requires more time (Mastercard)
- **8+ notes**: Usually too complex

### Tonal Considerations
- **Key**: Major (positive), minor (dramatic), modal (unique)
- **Interval**: Distinctive but not dissonant
- **Resolution**: Typically ends on stable tone

### Instrumentation Categories
| Style | Character | Example Brands |
|-------|-----------|----------------|
| Electronic/Synthetic | Modern, tech-forward | Intel, Audi |
| Orchestral | Premium, established | NBC, THX |
| Acoustic | Warm, human | McDonald's |
| Hybrid | Balanced, versatile | Netflix |
| Vocal | Distinctive, human | T-Mobile |
```

---

### 步骤 3：分析经典案例

从经过验证的成功案例中学习。

```
## Case Study Analysis

### Intel - "The Bong" (1994)
**Creator**: Walter Werzowa
**Notes**: D♭ D♭ G♭ D♭ A♭ (5 notes)
**Duration**: 3 seconds

**What makes it work**:
- "Marrying computerized and physical sounds"
- Starts with repetition (D♭ D♭) for attention
- Rises to unexpected note (G♭) for interest
- Returns home but ends on A♭ (not D♭)—creates forward momentum
- Sound design: synth + mallet percussion hybrid

**Lesson**: Blend familiar and unexpected. Create journey in 3 seconds.

---

### Netflix - "Ta-Dum" (2015)
**Notes**: D2, D3 (2 notes, octave apart)
**Duration**: 2.5 seconds

**What makes it work**:
- Ultra-simple (just 2 beats)
- Deep timpani = gravitas, cinema quality
- Octave jump = opening, invitation
- Reverb creates space = premium positioning
- Perfect timing triggers anticipation

**Lesson**: Brevity is power. Two beats can be enough.

---

### McDonald's - "I'm Lovin' It" (2003)
**Notes**: D E F# B A ("ba-da-ba-ba-ba")
**Duration**: ~2 seconds (melodic hook)

**What makes it work**:
- Musical pattern is the identifier (no lyrics needed)
- Rhythmic pattern as memorable as notes
- Works as vocal or instrumental
- Adapts to any language/market
- Ultra-flexible for variations

**Lesson**: Melodic pattern > specific lyrics. Flexibility = longevity.

---

### Mastercard - "Sonic DNA" (2019)
**Notes**: 6-note tune
**Duration**: Variable (full logo to single confirmation tone)

**What makes it work**:
- Same DNA in every asset
- Sonic logo, acceptance sound, brand music all connected
- "Seamless familiarity" across touchpoints
- System thinking, not just logo thinking

**Lesson**: Design the DNA, then derive everything from it.
```

---

### 步骤 4：创作方法

如何创作声音标志。

```
## Composition Process

### Approach 1: Start with Feeling

1. What emotion should the logo trigger?
2. What musical elements create that emotion?
3. Simplify to essence

**Example**:
- Target emotion: "Confident anticipation"
- Musical elements: Rising motion, strong resolution, moderate tempo
- Simplify: 4-note upward phrase, ending on firm beat

### Approach 2: Start with Brand Shape

1. Describe the visual logo as sound
2. Translate characteristics to audio
3. Compose to match

**Example**:
- Visual: Sharp angles, bold sans-serif, red and black
- Audio translation: Percussive, defined edges, bold timbre
- Compose: Staccato notes, clean synthesis, strong attack

### Approach 3: Start with Use Case

1. Where will this primarily be heard?
2. What audio context surrounds it?
3. Design to stand out appropriately

**Example**:
- Primary use: Video end-frames after voice-over
- Context: Following human speech, preceding silence
- Design: Contrast from speech (melodic), bridges to silence (reverb tail)

### Iteration Process

1. **Create 5-10 variations** (rough sketches)
2. **Test with fresh ears** (sleep on it, revisit)
3. **Narrow to 3 candidates** (different approaches)
4. **Test in context** (actual use cases, not isolation)
5. **Refine winner** (polish production)
6. **Create variations** (short, long, stems)
```

---

### 步骤 5：评估与测试

系统地评估效果。

```
## Evaluation Criteria

### Immediate Tests

**Singability Test**
Play once. Wait 5 minutes. Can you hum it?
□ Yes (pass) □ No (simplify)

**Distraction Test**
Play while doing something else. Does it grab attention?
□ Yes (pass) □ No (increase impact)

**Context Test**
Play after video content. Does it feel like natural ending?
□ Yes (pass) □ No (adjust dynamics)

### Comparative Tests

**Distinctiveness Test**
Play your logo, then 3 competitor logos (randomized).
Ask listener to identify yours.
□ Easy to identify (pass) □ Confused with others (differentiate)

**Attribute Association Test**
Play logo, ask: "What words describe this brand?"
□ Matches brand values (pass) □ Wrong associations (redesign)

### Long-Term Tests

**Fatigue Test**
Listen 10+ times in a row. Do you hate it?
□ Still tolerable (pass) □ Annoying (simplify or adjust timbre)

**Memory Test**
Wait 24 hours. Can you recall it?
□ Yes (pass) □ No (make more distinctive)

### Stakeholder Evaluation

Rate each criterion 1-5:

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Simplicity | /5 | |
| Distinctiveness | /5 | |
| Brand alignment | /5 | |
| Flexibility | /5 | |
| Emotional impact | /5 | |
| Memorability | /5 | |
| **Total** | /30 | |

**Scoring**:
- 25-30: Excellent candidate
- 20-24: Good, minor refinement
- 15-19: Needs significant work
- Below 15: Start over
```

---

### 步骤 6：制作与交付

专业交付的最后步骤。

```
## Production Specifications

### Technical Requirements

**Master Files**:
- Format: WAV, 48kHz, 24-bit
- Stereo and mono versions
- Headroom: Peak at -1 dB
- No limiting on master (allow flexibility)

**Delivery Formats**:
- WAV (master quality)
- AIFF (Apple ecosystem)
- MP3 320kbps (web use)
- M4A/AAC (mobile)

### Variation Suite

**Duration Variations**:
- Full (primary logo, ~3 sec)
- Short (truncated, ~1.5 sec)
- Sting (single hit, <1 sec)

**Context Variations**:
- With reverb tail (video end)
- Dry/tight (tight edits)
- Extended (event/cinema)

**Stem Delivery**:
- Melodic elements (separate)
- Rhythmic elements (separate)
- Full mix

### Documentation

Deliver with:
- Technical specifications
- Usage guidelines
- Variation descriptions
- Contact for questions

### File Naming Convention

```
[Brand]_SonicLogo_[Variation]_[Format].[ext]

示例：
TechBrand_SonicLogo_Full_Master.wav
TechBrand_SonicLogo_Short_Stereo.wav
TechBrand_SonicLogo_Sting_Mono.mp3
```
```

## 示例

### 示例 1：科技初创公司的声音标识

**背景**：为一款效率应用创建声音标识。

**输入**：
> 为 FlowState 设计一个声音标识，这是一款专注/效率应用。品牌风格沉静、专注、高端。视觉标识是一个边缘柔和、带有微妙渐变的圆形。主要用途：应用启动音和任务完成音。

**输出**：

## FlowState 声音标识设计

### 品牌分析
- **价值观**：沉静、专注、高端
- **视觉**：柔和渐变、圆形、温和
- **情境**：应用音效（需要不打扰用户）

### 设计方向

**情感目标**：“平静抵达”——进入专注状态时安定下来的感觉

**声音转化**：
- 沉静 → 柔和的起音、圆润的音色、大小调模糊感
- 专注 → 干净、不杂乱、单一旋律线
- 高端 → 精致的音色、微妙的复杂度、空间感

### 作曲建议

**结构**：3 音下行乐句 + 解决
- 音符：G → E → C →（呼吸）→ G（高八度，轻柔）
- 该模式代表：先安定下来，然后提升并进入专注状态

**设计依据**：
- 下行走向 = 令人平静（脑科学研究对此有支持）
- 最后的上行音符 = 乐观、开始
- 大调解决 = 积极完成

**时长**：2.5 秒

**配器**：
- 主要：柔和的槌击乐器（颤音琴/马林巴琴混合音色）
- 辅助：微妙的正弦波铺底音色
- 特质：温暖、有机、高端

### 制作说明

- 柔和的起音（无打击感）
- 充足的混响（空间宽广，但不显遥远）
- 轻柔的压缩（自然动态）
- 滤波器：略微衰减高频（增加温暖感）

### 变体套件

| 变体 | 时长 | 使用场景 |
|-----------|----------|----------|
| 完整版 | 2.5 秒 | 应用启动、营销 |
| 完成版 | 1.5 秒 | 任务完成音 |
| 轻量版 | 1 秒 | 后台通知 |
| 加长版 | 4 秒 | 品牌视频结尾 |

### 提供给声音设计师的样稿简述

“使用柔和的槌击乐器音色创作一个 3 音下行旋律乐句，
随后接上一个轻柔的上行解决音。想象一下：深吸一口气，
安定下来并投入高效工作的感觉。温暖、高端，绝不刺耳。
应当给人邀请感，而不是命令感。”

---

### 示例 2：评估代理机构的提案

**背景**：评估代理机构提供的三个声音标识方案。

**输入**：
> 我们收到了代理机构提供的 3 个声音标识方案。该如何评估它们？品牌是一家 B2B 金融科技公司，其价值观是信任、创新、精准。

**输出**：

## 声音标识评估框架

### 评估计分表

按照以下标准，以 1–5 分为每个方案评分：

| 评估标准 | 方案 A | 方案 B | 方案 C |
|-----------|----------|----------|----------|
| **简洁性**（听 1 遍后能否哼唱？） | | | |
| **独特性**（是否有别于竞争对手？） | | | |
| **信任感**（是否能唤起可靠感？） | | | |
| **创新性**（是否现代而不噱头化？） | | | |
| **精准性**（是否干净、不杂乱？） | | | |
| **灵活性**（是否适用于所有情境？） | | | |
| **记忆度**（24 小时后能否回想起来？） | | | |
| **总分** | /35 | /35 | /35 |

### 情境测试

在实际使用中测试每个方案：
1. 放在产品演示视频之后
2. 用作通知音（更轻、更短）
3. 通过电话线路播放（压缩音频）
4. 在展会环境中播放（嘈杂）

| 情境 | 方案 A | 方案 B | 方案 C |
|---------|----------|----------|----------|
| 视频结束画面 | | | |
| 通知 | | | |
| 电话音质 | | | |
| 嘈杂环境 | | | |

### 利益相关者直觉检验

询问 3-5 位尚未听过这些方案的同事：

1. 盲听每个方案（不要透露各自对应哪个方案）
2. 询问：“哪些词可以描述这家公司？”
3. 询问：“你会信任哪一个品牌来管理你的钱？”
4. 询问：“哪一个最令人难忘？”

### 需要注意的危险信号

**如有以下情况则应避免**：
- 太长（主要用途下超过 4 秒）
- 太复杂（超过 6 个不同音符）
- 听起来像现有品牌（存在法律风险）
- 使用了会很快过时的流行声音设计
- 团队不喜欢，但无法说清原因
- 需要解释才能理解

### 最终决策框架

**选择符合以下条件的声音标志**：
1. 综合得分最高
2. 在所有情境下都表现良好（而不只是在某一种情境下）
3. 获得利益相关者的一致认可（或多数认可）
4. 代理机构能够清楚阐述选择它的“原因”
5. 听过 1,000 次后你也不会厌倦

## 检查清单与模板

### 声音标志设计简报

```
## Sonic Logo Brief: [Brand]

### Brand Context
**Company**: [name]
**Industry**: [sector]
**Brand values**: [3-5 traits]
**Visual logo description**: [what it looks like]

### Audio Direction
**Primary emotion**: [target feeling]
**Sonic references**: [2-3 logos you admire]
**What to avoid**: [sounds/styles not right]

### Technical Requirements
**Primary duration**: [X seconds]
**Variations needed**: [list]
**File formats**: [WAV, MP3, etc.]

### Use Cases (Priority Order)
1. [Primary use]
2. [Secondary use]
3. [Tertiary use]

### Timeline
**First concepts**: [date]
**Revisions**: [date]
**Final delivery**: [date]

### Budget
[Range]

### Approval Process
**Decision maker**: [name]
**Stakeholders**: [names]
```

---

### 评估快速检查清单

```
## Sonic Logo Evaluation

□ Memorable after one listen?
□ Distinctive from competitors?
□ Aligned with brand values?
□ Works in video context?
□ Works as notification/short version?
□ Not annoying after 10 listens?
□ Still memorable after 24 hours?
□ Production quality is professional?
□ Duration appropriate for use cases?
□ Stakeholders approve?
```

## 技能边界

### 此技能擅长的方面
- 构建音频制作工作流程
- 提供技术指导
- 创建质量检查清单
- 提出创意方法建议

### 此技能无法做到的事情
- 取代音频工程专业知识
- 作出主观的创意决策
- 直接访问或编辑音频文件
- 保证商业成功

## 参考资料

- Walter Werzowa。《关于英特尔声音标志的访谈》
- Twenty Thousand Hertz。“Intel Inside”播客单集
- Adweek。“5 家公司如何打造声音标志”
- Voices.com。“声音标志大师课”

## 相关技能

- [声音品牌塑造](../sonic-branding/) - 完整的音频品牌战略
- [用户体验声音设计](../ux-sound-design/) - 产品声音系统
- [默奇声音设计](../sound-design-murch/) - 音频设计原则

---

## Skill 元数据（内部使用）

```yaml
name: audio-logo-design
category: audio
subcategory: branding
version: 1.0
author: MKTG Skills
source_expert: Walter Werzowa, Intel/Netflix/McDonald's Case Studies
source_work: Sonic Logo Best Practices
difficulty: advanced
estimated_value: $5,000-50,000 (equivalent design project)
tags: [sonic-logo, audio-branding, mnemonic, brand-sound]
created: 2026-01-26
updated: 2026-01-26
```