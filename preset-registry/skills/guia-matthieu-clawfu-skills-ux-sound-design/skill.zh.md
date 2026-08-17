---
name: ux-sound-design
description: "Create functional and emotionally resonant audio for digital products using Audio UX methodology—from notification sounds to complete sonic systems. Use when: Designing notification sounds for an app; Creating a complete audio system for a digital product; Adding audio feedback to UI interactions; Building accessible audio cues; Defining audio guidelines for product teams"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# UX 声音设计

> 使用音频 UX 方法论为数字产品打造兼具功能性与情感共鸣的音频——从通知声音到完整的声音系统。

## 何时使用此技能

- 为应用设计通知声音
- 为数字产品创建完整的音频系统
- 为 UI 交互添加音频反馈
- 构建无障碍音频提示
- 为产品团队制定音频规范
- 评估并改进现有的产品声音

## 方法论基础

**来源**：音频 UX + 设计思维原则

**核心原则**：“音频 UX 是以策略性和目的性方式运用声音来提升用户体验。”与音乐或娱乐音频不同，UX 声音设计首先服务于功能。优秀的产品声音在正常发挥作用时不易被察觉，只有在某些事项需要引起注意时才会变得明显。

**为何重要**：声音是数字产品设计中最未被充分利用的工具。研究表明，音频反馈能够提高任务完成率、减少错误，并建立更强的品牌联想。然而，大多数产品要么完全忽视声音，要么使用千篇一律、令人过耳即忘的音频。


## Claude 做什么，您决定什么

| Claude 做什么 | 您决定什么 |
|-------------|------------|
| 构建制作工作流程 | 最终创意方向 |
| 建议技术方案 | 设备和工具选择 |
| 创建模板和检查清单 | 质量标准 |
| 识别最佳实践 | 品牌和声音风格决策 |
| 生成脚本大纲 | 最终脚本审批 |

## 此技能的作用

1. **设计功能性音频提示** - 通过声音传达状态、确认和错误
2. **建立情感连接** - 使用音频强化品牌个性
3. **构建音频系统** - 创建协调一致的相关声音系列
4. **确保无障碍性** - 为视障用户提供音频
5. **编写音频规范文档** - 制定确保一致实施的规范

## 使用方法

### 设计产品声音
```
Help me design audio for [product/feature].
Interaction: [what the user does]
Feedback needed: [what the sound should communicate]
Brand personality: [tone/feeling]
```

### 创建音频系统
```
Create an audio system for [app/product].
Key interactions: [list]
Brand: [personality traits]
Constraints: [technical limitations]
```

### 评审现有音频
```
Review these product sounds for UX effectiveness:
[describe current sounds]
Issues: [problems you've noticed]
```

## 说明

设计 UX 声音时，请遵循以下方法论：

### 第 1 步：了解功能类别

每种产品声音都服务于以下某种用途。

```
## UX Sound Categories

### 1. FEEDBACK SOUNDS
Confirm that an action was registered.

| Type | Purpose | Example |
|------|---------|---------|
| Confirmation | Action completed | Send button click |
| Progress | Something is happening | Upload progress |
| Success | Task finished successfully | Payment confirmed |
| Error | Something went wrong | Form validation error |
| Warning | Attention needed | Low battery |

### 2. NOTIFICATION SOUNDS
Alert user to external events.

| Type | Purpose | Example |
|------|---------|---------|
| Alert | Immediate attention | New message |
| Reminder | Scheduled prompt | Calendar event |
| Update | Information available | Download complete |
| Social | Human interaction | Someone liked your post |

### 3. NAVIGATION SOUNDS
Spatial orientation and movement.

| Type | Purpose | Example |
|------|---------|---------|
| Transition | Moving between views | Screen change |
| Selection | Choosing an option | Menu item hover |
| Boundary | End of scrollable content | List bottom reached |

### 4. AMBIENT/BACKGROUND
Context and mood.

| Type | Purpose | Example |
|------|---------|---------|
| Presence | App is running | Subtle background tone |
| Mode | Current state | Focus mode active |
| Celebration | Achievement | Goal reached |
```

---

### 步骤 2：应用设计原则

有效 UX 音频的核心原则。

```
## UX Sound Design Principles

### 1. FUNCTION FIRST
- Sound must communicate something useful
- Ask: "What information does this convey?"
- If no clear function, consider no sound

### 2. DISTINCT BUT RELATED
- Each sound should be recognizably different
- All sounds should feel like a family
- Use consistent:
  - Tonal palette (key/scale)
  - Timbral characteristics
  - Duration ranges
  - Dynamic levels

### 3. APPROPRIATE URGENCY
- Match sound urgency to message urgency
- Error ≠ always alarming
- Success ≠ always celebratory
- Scale:
  1. Subtle acknowledgment
  2. Gentle notification
  3. Attention-getting alert
  4. Urgent alarm

### 4. CONTEXT AWARE
- Consider when/where users hear this
- Public spaces: shorter, more subtle
- Private: can be more expressive
- Frequency: often-heard sounds must be less intrusive

### 5. ACCESSIBLE
- Don't rely solely on sound
- Always pair with visual feedback
- Consider frequency range (avoid only high frequencies)
- Ensure distinctiveness for users who can't see visual cues

### 6. CONTROLLABLE
- Users must be able to mute/adjust
- Provide volume controls
- Respect system settings
- Never surprise with unexpected sound
```

---

### 步骤 3：创建声音调色板

定义音频系统的基础素材。

```
## Sound Palette Development

### Step 3.1: Define Brand Sound Attributes

Translate brand personality into audio terms:

| Brand Attribute | Sound Translation |
|-----------------|-------------------|
| Playful | Bouncy, melodic, varied pitch |
| Professional | Clean, precise, consonant |
| Innovative | Modern synthesis, unique timbres |
| Warm | Rounded, organic, mid-range |
| Energetic | Fast attack, bright, rhythmic |
| Calm | Soft attack, slow decay, filtered |

### Step 3.2: Choose Your Palette Elements

**Tonal Center**
- Pick a key (e.g., C major, F major)
- All sounds should relate to this key
- Create harmonic cohesion

**Timbre Family**
- Acoustic (piano, bells, wood)
- Synthetic (sine, FM, wavetable)
- Hybrid (processed acoustic)
- Choose based on brand

**Duration Range**
- Micro: 50-150ms (feedback)
- Short: 150-500ms (notifications)
- Medium: 500-1500ms (transitions)
- Long: 1500ms+ (celebrations)

**Dynamic Range**
- Define min/max volume levels
- Relative loudness between sound types
- Error > Notification > Feedback (typically)

### Step 3.3: Document the Palette

```markdown
## [Product] Sound Palette

**Tonal Center**: F major
**Character**: Warm, professional, approachable

**Primary Timbre**: Rounded sine with subtle harmonics
**Secondary Timbre**: Soft mallet (marimba-like)
**Accent Timbre**: Clean bell tone

**Durations**:
- Feedback: 80-120ms
- Notification: 200-400ms
- Transition: 300-600ms
- Celebration: 800-1500ms

**Loudness Hierarchy** (relative to baseline):
1. Alerts: +3dB
2. Notifications: 0dB (baseline)
3. Feedback: -6dB
4. Ambient: -12dB
```
```

---

### 步骤 4：设计单个声音

创建每个声音的流程。

```
## Sound Design Process

### For Each Sound:

**1. Define the Function**
- What exactly does this communicate?
- What action triggered it?
- What should user understand?

**2. Determine Urgency Level**
- 1 (subtle) → 5 (urgent)
- This affects: loudness, duration, pitch, complexity

**3. Consider Context**
- How often is it heard?
- Where is user when hearing it?
- What's user's emotional state?

**4. Design Parameters**

| Parameter | Low Urgency | High Urgency |
|-----------|-------------|--------------|
| Duration | Shorter | Longer |
| Attack | Soft | Sharp |
| Pitch | Neutral | Higher or dissonant |
| Complexity | Simple | More layers |
| Volume | Quieter | Louder |

**5. Create Variations**
- Design 3-5 options
- Test in context
- Get user feedback
- Iterate

### Common Patterns

**Confirmation/Success**:
- Rising pitch (positive)
- Clean, resolved harmony
- Quick, satisfying
- Example: Two notes ascending a third

**Error/Warning**:
- Falling or dissonant
- More complex/harsh
- Attention-getting but not alarming
- Example: Minor second interval, longer duration

**Notification**:
- Distinct melodic motif
- Balanced urgency
- Memorable but not annoying
- Example: 3-4 note sequence
```

---

### 步骤 5：构建系统

创建一组协调统一、相互关联的声音。

```
## Audio System Architecture

### Core Sound Set (Minimum Viable)

1. **Generic feedback** - Neutral acknowledgment
2. **Success** - Positive confirmation
3. **Error** - Something went wrong
4. **Notification** - New information
5. **Alert** - Requires attention

### Extended Sound Set

**Feedback family**:
- Tap/click (lightest)
- Selection
- Confirmation
- Success (fullest)

**Notification family**:
- Subtle update
- Standard notification
- Message received
- Urgent alert

**Navigation family**:
- Transition in
- Transition out
- Boundary reached
- Mode change

### Sound Relationships

```
         QUIET ←───────────────────→ LOUD

    Feedback    Notification    Alert    Alarm
      ○            ●             ◉        ◎

         SUBTLE ←────────────────→ URGENT
```

### Variation Strategy

For each core sound, create:
- Standard version
- Subtle version (-6dB, shorter)
- Emphasized version (+3dB, fuller)
- This allows contextual flexibility
```

---

### 步骤 6：编写文档并交付

用于实现的规范。

```
## Audio Guidelines Document

### Overview
[Product] uses sound to enhance user experience through
clear feedback, gentle notifications, and brand presence.

### Sound Files

| Sound Name | File | Duration | Usage |
|------------|------|----------|-------|
| feedback_tap | tap.wav | 80ms | Button presses |
| feedback_success | success.wav | 250ms | Completed actions |
| feedback_error | error.wav | 350ms | Validation errors |
| notif_message | message.wav | 400ms | New messages |
| notif_alert | alert.wav | 600ms | Important updates |

### Implementation Guidelines

**When to Play**:
- Play sounds AFTER visual feedback, not before
- Never play sounds on page load
- Respect system mute settings
- Throttle rapid-fire triggers (max 1 per 100ms)

**Volume Control**:
- All sounds respect master volume
- Users can disable sound in settings
- Haptic feedback should accompany (mobile)

**Accessibility**:
- Every sound has visual equivalent
- Screen reader announcements pair with audio
- Don't rely on sound alone for critical info

### File Specifications

- Format: WAV (for development), MP3/AAC (production)
- Sample rate: 44.1kHz
- Bit depth: 16-bit minimum
- Channels: Mono (reduces file size, consistent playback)
- Peak level: -1dB (avoid clipping)
```

## 示例

### 示例 1：移动应用通知系统

**背景**：为一款效率应用设计声音。

**输入**：
> 帮我为一款任务管理应用设计音频系统。关键时刻包括：任务创建、任务完成、提醒、当天所有任务完成。品牌风格是沉静、专注、专业。

**输出**：

## 任务应用音频系统

### 品牌声音转化

**品牌属性**：沉静、专注、专业
**声音转化**：
- 沉静 → 柔和的起音、圆润的音色、大调/中性和声
- 专注 → 干净、简洁、由单一元素构成的声音
- 专业 → 精致、不活泼、不使用新奇音效

### 声音基调

**调性中心**：C 大调（中性、通用）
**主要音色**：柔和的木槌乐器/颤音琴质感
**时长范围**：100ms - 800ms
**特性**：清晰、如木质般的共鸣，带有柔和的衰减

### 声音设计

**1. 任务已创建** (feedback_subtle)
- 功能：确认任务已添加
- 紧迫度：1/5（轻微）
- 设计：单个木槌音符（G4），柔和起音，120ms
- 感受：温和的确认，就像轻声说一句“知道了”

**2. 任务已完成** (feedback_success)
- 功能：庆祝任务完成，奖励用户操作
- 紧迫度：2/5（令人满足但不造成打扰）
- 设计：两个上行音符（C4 → E4），总计 250ms
- 感受：积极、向前推进、干净利落的解决感

**3. 提醒** (notification_standard)
- 功能：提醒用户预定的提醒事项
- 紧迫度：3/5（需要引起注意，但不会令人惊慌）
- 设计：三音旋律模式（G4 → C5 → E5），400ms
- 感受：像友好地轻拍肩膀，“嘿，别忘了”

**4. 所有任务均已完成** (celebration)
- 功能：奖励用户完成当天的全部任务
- 紧迫度：2/5（有庆祝感，但不过分夸张）
- 设计：上行琶音（C4 → E4 → G4 → C5），800ms
- 带有细微的混响尾音，以增强满足感
- 感受：成就已解锁，充实的一天圆满结束

### 音频指南

```yaml
Sound System: TaskFlow v1.0

Palette:
  tonal_center: C_major
  timbre: mallet_vibraphone
  character: calm_professional

Sounds:
  - name: task_created
    file: sounds/task_created.wav
    duration_ms: 120
    trigger: task.create
    volume: -9dB (relative)

  - name: task_completed
    file: sounds/task_completed.wav
    duration_ms: 250
    trigger: task.complete
    volume: -6dB (relative)

  - name: reminder
    file: sounds/reminder.wav
    duration_ms: 400
    trigger: reminder.fire
    volume: 0dB (baseline)

  - name: daily_complete
    file: sounds/daily_complete.wav
    duration_ms: 800
    trigger: tasks.all_complete
    volume: 0dB (baseline)

Rules:
  - Respect system mute
  - Pair all sounds with haptic (mobile)
  - Throttle: max 1 sound per 200ms
  - No sound on app open
```

---

### 示例 2：电子商务结账声音

**背景**：为结账流程添加音频反馈。

**输入**：
> 为电子商务结账流程设计声音：添加到购物车、从购物车移除、应用优惠券、支付处理中、购买完成。品牌风格是现代、可信赖且略带活泼感。

**输出**：

## 电子商务结账音频

### 品牌声音转化

**现代感**：简洁的合成音，而非原声
**可信赖**：协和、完整、稳定
**略带趣味**：有少量旋律变化，不显呆板

### 声音风格

**调性中心**：F 大调（温暖、友好）
**音色**：圆润的数字音色，略带闪烁感
**特质**：友好而专业，就像一位优秀的销售人员

### 声音设计

**加入购物车** ✚
- 功能：确认商品已添加
- 频率：高（每个会话中会出现多次）
- 设计：快速上扬的音高滑音 + 柔和的“啵”声（100ms）
- 非常轻盈、令人满意，但不会吸引过多注意
- 就像把东西放进柔软的袋子里

**从购物车移除** ✕
- 功能：确认商品已移除
- 设计：与添加音效相反——短促的下行滑音（80ms）
- 中性，而非负面（移除并不是坏事）
- 比添加音效更轻（-3dB）

**优惠券已应用** 🎟️
- 功能：奖励，确认已获得优惠
- 设计：小型庆祝动机（C5 → A5 → F5），200ms
- 带有闪耀元素——如同意外捡到钱一般
- 与常规反馈音效有明显区别

**付款处理中** ⏳
- 功能：表明正在处理，缓解焦虑
- 设计：细微的脉冲音，可循环播放
- 平静、自信，传达“事情正在进行中”
- 音量非常低，作为背景存在

**购买完成** 🎉
- 功能：重要的成功时刻，情绪高潮
- 设计：凯旋式琶音配合延续和弦（1000ms）
- 整个系统中最具分量的声音
- 引发真切的满足感
- 与视觉庆祝效果配合

### 实现说明

```javascript
// Sound trigger logic

// Add to cart - play immediately on success
cartAPI.add(item).then(() => {
  playSound('cart_add', { volume: 0.4 });
  // Throttle: won't play again within 150ms
});

// Purchase complete - play after visual confirmation
if (purchaseSuccess) {
  // Short delay so visual leads
  setTimeout(() => {
    playSound('purchase_complete', { volume: 0.8 });
  }, 200);
}

// Processing - loop while waiting
const processingSound = playSound('processing', {
  loop: true,
  volume: 0.2
});
// Stop when complete
paymentAPI.process().finally(() => {
  processingSound.stop();
});
```

## 检查清单与模板

### UX 声音审核检查清单

```
## Current State Assessment

□ What sounds exist currently?
□ Are they consistent (family feel)?
□ Do users complain about any sounds?
□ Are sounds controllable (mute option)?
□ Are visual alternatives provided?

## Function Check

□ Every sound serves a clear purpose
□ Users understand what each sound means
□ Urgency matches message importance
□ Frequency considered (annoying over time?)

## Brand Check

□ Sounds match brand personality
□ Sounds distinct from competitors
□ Consistent with visual design language
□ Appropriate for target audience

## Technical Check

□ Files optimized for platform
□ Plays reliably across devices
□ Respects system audio settings
□ No clipping or distortion
```

---

### 声音设计规范模板

```
## Sound: [Name]

### Function
- Purpose:
- Trigger:
- User action that causes this:

### Context
- How often heard:
- User emotional state:
- Environment:

### Design
- Urgency level: _/5
- Duration: _ms
- Tonal content:
- Timbre description:

### Technical
- File: [filename.wav]
- Sample rate: 44.1kHz
- Channels: Mono
- Peak level: -1dB
- Relative volume:

### Relationships
- Replaces: [if replacing existing sound]
- Similar to: [related sounds in system]
- Distinct from: [sounds it must differ from]
```

## 技能边界

### 此技能擅长的领域
- 构建音频制作工作流
- 提供技术指导
- 创建质量检查清单
- 提出创意方法建议

### 此技能无法做到的事情
- 取代音频工程专业知识
- 做出主观的创意决策
- 直接访问或编辑音频文件
- 保证商业成功

## 参考资料

- Audio UX.《声音品牌的未来》（与 Lippincott 合作）
- LANDR.《Audio UX 声音设计》——实用方法论
- UX Collective.《声音设计如何为品牌创造奇迹》
- Apple 人机界面指南——声音设计章节
- Material Design——UI 中的声音

## 相关技能

- [声音品牌](../sonic-branding/) - 品牌层面的音频识别体系
- [音频标志设计](../audio-logo-design/) - 创建声音标志
- [默奇声音设计](../sound-design-murch/) - 电影声音原则
- [语音设计](../voice-design/) - 语音界面

---

## 技能元数据（内部使用）

```yaml
name: ux-sound-design
category: audio
subcategory: sound-design
version: 1.0
author: MKTG Skills
source_expert: Audio UX
source_work: Audio UX Methodology
difficulty: intermediate
estimated_value: $2,000-10,000 per audio system (equivalent design work)
tags: [ux, sound-design, product, notifications, audio-feedback]
created: 2026-01-26
updated: 2026-01-26
```