---
name: audio-editing
description: "Master the essential audio post-production techniques—normalization, compression, EQ, and noise reduction—using the correct processing order to achieve professional-quality audio. Use when: Editing podcast episodes or video soundtracks; Cleaning up recorded voiceovers; Improving audio quality for marketing content; Preparing audio files for distribution; Troubleshooting common audio issues"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 音频编辑基础

> 掌握音频后期制作的核心技术——标准化、压缩、均衡和降噪——并按照正确的处理顺序获得专业品质的音频。

## 何时使用此技能

- 编辑播客节目或视频配乐
- 清理录制的旁白
- 提升营销内容的音频质量
- 为分发准备音频文件
- 排查常见音频问题
- 统一整个项目中的音频电平

## 方法论基础

**来源**：iZotope + 行业最佳实践

**核心原则**：音频处理必须按照正确的顺序进行——每一步都建立在前一步的基础上。“先降噪后压缩，可以避免放大噪声。先压缩后均衡，可以避免破坏已经完成的电平调整。”目标是服务于内容，而不是炫耀处理技巧。

**为什么这很重要**：音频编辑不佳，是原本优质的内容听起来不专业的最常见原因。理解这些基础知识，可以让营销人员自行润色录音，或与音频工程师进行有效沟通。


## Claude 做什么与你决定什么

| Claude 做什么 | 你决定什么 |
|-------------|------------|
| 构建制作工作流 | 最终创意方向 |
| 建议技术方案 | 设备和工具选择 |
| 创建模板和检查清单 | 质量标准 |
| 确定最佳实践 | 品牌/声音风格决策 |
| 生成脚本大纲 | 最终脚本审批 |

## 此技能的作用

1. **应用正确的处理顺序** - 增益 → 降噪 → 压缩 → 均衡 → 限幅
2. **设置适当的电平** - 标准化、响度标准（LUFS）、峰值管理
3. **智能降噪** - 不引入伪影
4. **平衡动态** - 针对人声和音乐的压缩设置
5. **塑造音色** - 通过均衡调整提升清晰度和温暖感

## 使用方法

### 修复音频问题
```
My audio has [describe problem: too quiet, noisy background, inconsistent levels, muddy sound].
Help me fix it using proper processing order.
```

### 为平台准备音频
```
Help me prepare this audio for [podcast/YouTube/Spotify/broadcast].
Current state: [describe audio]
```

### 掌握音频工作流
```
Create an audio editing workflow for [content type].
Include settings for [software: Audacity/Audition/etc.]
```

## 操作说明

编辑音频时，请遵循以下方法：

### 第 1 步：处理顺序

始终按照此顺序进行处理，以避免问题叠加。

```
## Correct Processing Order

1. GAIN STAGING
   ↓
2. NOISE REDUCTION
   ↓
3. COMPRESSION
   ↓
4. EQUALIZATION
   ↓
5. FINAL NORMALIZATION / LIMITING

Why this order:
- Noise reduction BEFORE compression: Prevents amplifying noise
- Compression BEFORE EQ: Prevents EQ changes affecting dynamics
- Limiting LAST: Sets final ceiling after all processing
```

---

### 第 2 步：增益分级

在进行任何处理之前设置初始电平。

```
## Gain Staging Guidelines

**Recording (target during capture)**:
- Peaks at -12 to -6 dB
- Leaves headroom for processing

**Initial Normalization (start of editing)**:
- Normalize peaks to -6 dB
- Creates consistent starting point

**Two Types of Normalization**:

1. **Peak Normalization**
   - Adjusts based on loudest point
   - Use for: Initial gain staging
   - Does NOT change dynamic range

2. **RMS/Loudness Normalization**
   - Adjusts based on average level
   - Use for: Final delivery
   - Better for perceived loudness matching
```

**工具特定设置**：
| 软件 | 标准化功能 |
|----------|-------------------|
| Audacity | Effect → Normalize |
| Audition | Effects → Amplitude → Normalize |
| Logic Pro | Region → Normalize |

---

### 步骤 3：降噪

去除不需要的背景声音，同时避免产生伪影。

```
## Noise Reduction Approach

**When to use**:
- Consistent background hiss/hum
- Air conditioning, computer fan noise
- Not for variable noise (traffic, voices)

**Method 1: Spectral Noise Reduction**
1. Find 2-3 seconds of "silence" (noise only)
2. Use as noise profile
3. Apply reduction to full track
4. Use conservative settings

**Settings Guide** (Audacity example):
- Noise Reduction: 6-12 dB (start low)
- Sensitivity: 4-6 (higher = more aggressive)
- Frequency Smoothing: 3-6 bands

**Method 2: Noise Gate**
- Sets threshold; audio below is silenced
- Better for breaths between speech
- Doesn't affect audio during speech

**Warning Signs of Over-Processing**:
- "Underwater" or "robotic" sound
- Swirling artifacts
- Unnatural silence between words

**Rule**: If choosing between slight noise or artifacts, keep the noise.
```

---

### 步骤 4：压缩

均衡动态范围——降低响亮部分的音量，提升安静部分的音量。

```
## Compression for Voice

**What It Does**:
- Reduces volume of sounds above threshold
- Results in more consistent, fuller sound

**Key Parameters**:

| Parameter | What It Does | Voice Setting |
|-----------|--------------|---------------|
| Threshold | Level where compression starts | -20 to -12 dB |
| Ratio | How much to reduce | 2:1 to 4:1 |
| Attack | How fast compression kicks in | 10-30 ms |
| Release | How fast compression stops | 100-300 ms |
| Makeup Gain | Boosts output after compression | To taste |

**Voice Compression Starting Point**:
- Threshold: -18 dB
- Ratio: 3:1
- Attack: 15 ms (fast enough for transients)
- Release: 150 ms
- Gain: +3-6 dB (compensate for reduction)

**Multi-Band Compression** (advanced):
- Different settings for different frequency ranges
- Useful for controlling low-end rumble without affecting highs
- Overkill for most marketing audio

**When NOT to Compress**:
- Already consistent audio (well-recorded)
- Music meant to be dynamic
- Over-compression sounds "squashed"
```

---

### 步骤 5：均衡（EQ）

塑造音色——削减问题频段，增强清晰度。

```
## EQ for Voice

**Philosophy**: Cut more than boost. Removing problems is safer than adding "goodness."

**Voice Frequency Guide**:

| Range | Frequency | Effect |
|-------|-----------|--------|
| Rumble | Below 80 Hz | Cut (high-pass filter) |
| Muddiness | 200-400 Hz | Cut if boomy |
| Body/Warmth | 150-250 Hz | Boost slightly for thin voice |
| Boxy/Nasal | 400-800 Hz | Cut if honky |
| Clarity/Presence | 2-4 kHz | Boost for intelligibility |
| Sibilance | 5-8 kHz | Cut if harsh "s" sounds |
| Air/Brightness | 8-12 kHz | Boost for expensive studio feel |

**Standard Voice EQ Recipe**:
1. High-pass filter at 80 Hz (removes rumble)
2. Cut 2-3 dB around 300 Hz (reduces muddiness)
3. Boost 2-3 dB around 3 kHz (adds clarity)
4. High-shelf boost at 10 kHz if needed (adds air)

**De-essing**:
- Tames harsh "s" and "sh" sounds
- Target: 5-8 kHz range
- Use de-esser plugin OR narrow EQ cut
```

---

### 第 6 步：最终标准化 / 限幅

为交付平台设置输出电平。

```
## Loudness Standards by Platform

| Platform | Target | Measurement |
|----------|--------|-------------|
| Podcast (general) | -16 LUFS | Integrated loudness |
| Spotify/Apple Podcasts | -14 LUFS | May normalize further |
| YouTube | -14 LUFS | Recommended |
| Broadcast TV (US) | -24 LKFS | FCC regulation |
| ACX/Audiobooks | -23 to -18 dB RMS | Per chapter |

**Final Steps**:

1. **Loudness Normalization**
   - Match to platform standard (e.g., -16 LUFS)
   - Use loudness meter, not peak meter

2. **Limiting**
   - Prevents clipping
   - Set ceiling at -1 dB (leaves headroom for encoding)
   - Catches peaks that exceed ceiling

3. **Export Settings**
   - Podcast: 128-192 kbps MP3, stereo
   - Video: Match video project settings
   - Audiobook: 192 kbps MP3, 44.1 kHz, mono
```

## 示例

### 示例 1：修复有噪声的播客录音

**背景**：录制了一次远程播客访谈，其中存在可听见的背景嗡声。

**输入**：
> 我的播客嘉宾使用笔记本电脑的麦克风进行了录音。录音中有持续的低频嗡声，而且电平忽高忽低——有时太小，有时又太大。我该如何修复？

**输出**：

## 播客音频修复工作流

### 评估
- 问题 1：低频嗡声（可能是电气噪声，50/60 Hz）
- 问题 2：电平不一致（录音时未进行压缩）
- 问题 3：可能使用了笔记本电脑麦克风 = 声音单薄、刺耳

### 分步修复

**1. 增益分级**
- 将峰值标准化到 -6 dB
- 这样可以为后续处理留出余量

**2. 消除嗡声**

*如果是电气嗡声（音高恒定）*：
- 在 60 Hz（美国）或 50 Hz（欧洲）处使用陷波滤波器
- 同时对谐波进行陷波：120 Hz、180 Hz、240 Hz
- 设置：Q 值非常窄（高），深度衰减（-12 至 -20 dB）

*如果是宽带噪声（嘶声）*：
- 找到 2 秒只有嗡声的片段（语音间隙）
- 将其用作噪声配置文件
- 应用降噪：8-10 dB，灵敏度 5
- 注意聆听是否出现伪影；如果声音像机器人，则减小处理强度

**3. 均衡电平**

压缩设置：
- 阈值：-18 dB
- 压缩比：4:1（由于原始录音较差，因此高于正常值）
- 启动时间：20 ms
- 释放时间：200 ms
- 补偿增益：+5 dB

**4. 修复单薄的声音**

EQ 调整：
- 在 100 Hz 处进行高通滤波（反正笔记本电脑麦克风也没有优质的低频）
- 在 200 Hz 处提升 2 dB（增加厚度）
- 在 500 Hz 处衰减 3 dB（减少箱体感）
- 在 3 kHz 处提升 2 dB（增强清晰度）
- 如果声音刺耳，则在 6 kHz 处衰减 2 dB

**5. 最终输出**
- 将响度标准化至 -16 LUFS
- 将峰值限制在 -1 dB
- 导出：192 kbps MP3

### 前后效果检查
- 使用旁路进行 A/B 对比
- 检查声音听起来是否过度“处理”
- 最好的编辑是让人察觉不到的

---

### 示例 2：按内容类型设置音频参数

**背景**：为不同类型的音频内容设置模板。

**输入**：
> 我制作三种类型的内容：YouTube 视频、播客节目和用于销售的 Loom 视频。你能分别为它们提供处理模板吗？

**输出**：

## 音频处理模板

### 模板 1：YouTube 视频

**目标**：确保人声在背景音乐之上清晰可辨，并且通过手机扬声器和耳机播放时都有良好效果

**处理链**：
1. **噪声门**：阈值 -40 dB，消除语音间隙中的房间噪声
2. **高通滤波器**：100 Hz，消除低频隆隆声
3. **压缩**：阈值 -16 dB，压缩比 3:1
4. **均衡器**：
   - 在 350 Hz 处衰减 3 dB
   - 在 3.5 kHz 处提升 3 dB
   - 在 8 kHz 处使用高频搁架提升 +2 dB
5. **齿音消除器**：目标频率 6 kHz，中等阈值
6. **限制器**：上限 -1 dB

**导出**：-14 LUFS，立体声，与视频编解码器匹配

**人声/音乐平衡**：人声设为 -12 dB，音乐设为 -20 至 -24 dB（比人声低 8-12 dB）

---

### 模板 2：播客节目

**目标**：为长时间使用耳机收听提供亲切、稳定的声音

**处理链**：
1. **标准化**：峰值调整至 -6 dB
2. **降噪**：轻度（最大 6 dB）
3. **压缩**：阈值 -18 dB，压缩比 2.5:1，较慢的释放时间（250 ms）
4. **均衡器**：
   - 在 80 Hz 处进行高通滤波
   - 在 200 Hz 处略微提升温暖感
   - 在 2.5 kHz 处提升临场感
5. **限制器**：上限 -1 dB

**导出**：-16 LUFS，128-192 kbps MP3，立体声或单声道

**多位说话者**：分别处理每条轨道，然后进行平衡（同时播放时，各轨道的响度应相同）

---

### 模板 3：Loom/销售视频

**目标**：专业而自然，注重清晰度，并针对笔记本电脑扬声器进行优化

**处理链**：
1. **高通滤波器**：120 Hz（较为激进，因为笔记本电脑扬声器本来就无法重现低于此频率的声音）
2. **压缩**：阈值 -14 dB，压缩比 3.5:1（为演示提供稳定的电平）
3. **均衡器**：
   - 在 300-400 Hz 处衰减 4 dB（减少笔记本电脑声音的浑浊感）
   - 在 2-4 kHz 处提升 3 dB（使声音在小型扬声器上更加突出）
4. **限制器**：上限 -3 dB（为 Loom 压缩预留余量）

**导出**：-14 LUFS，针对文件大小进行优化（可接受较低的比特率）

**专业提示**：请使用笔记本电脑扬声器而非录音室监听音箱测试播放效果——买家将通过这种方式听到声音

## 检查清单与模板

### 音频编辑检查清单

```
## Pre-Processing
□ Imported audio to project
□ Listened through once for problems
□ Noted specific issues (noise, pops, volume spikes)
□ Backed up original file

## Processing (in order)
□ 1. Gain staging: peaks at -6 dB
□ 2. Noise reduction applied (if needed)
□    - Used clean noise sample
□    - Checked for artifacts
□ 3. Compression applied
□    - Threshold set appropriately
□    - Gain reduction 3-6 dB typical
□ 4. EQ applied
□    - High-pass engaged
□    - Problem frequencies cut
□ 5. Final limiting
□    - Ceiling at -1 dB (or per platform)

## Quality Check
□ A/B comparison with bypass
□ Listened on headphones
□ Listened on different speakers
□ No artifacts or processing sounds
□ Loudness matches target spec
```

---

### 平台速查表

```
## Quick Reference: Delivery Specs

PODCASTS
- Loudness: -16 LUFS
- Format: 128-192 kbps MP3
- Channels: Mono or Stereo

YOUTUBE
- Loudness: -14 LUFS
- Format: Match video settings
- Note: Will be normalized by platform

AUDIOBOOKS (ACX)
- RMS: -23 to -18 dB
- Peak: -3 dB max
- Noise floor: -60 dB
- Format: 192 kbps MP3, 44.1 kHz, mono

BROADCAST (US)
- Loudness: -24 LKFS
- True peak: -2 dB
- Note: FCC regulated

MUSIC STREAMING
- Loudness: -14 LUFS (Spotify reference)
- Platforms normalize, but masters are louder
```

## 技能边界

### 此技能擅长的方面
- 构建音频制作工作流
- 提供技术指导
- 创建质量检查清单
- 提出创意方法建议

### 此技能无法做到的方面
- 取代音频工程专业知识
- 做出主观的创意决策
- 直接访问或编辑音频文件
- 保证商业成功

## 参考资料

- iZotope.《在家录制专业品质配音的技巧》
- Riverside.《完整的后期制作指南》
- Lower Street.《如何编辑播客》
- MixingMonster.《音频后期制作指南》

## 相关技能

- [pydub-automation](../pydub-automation/) - 用于批量处理的 Python 脚本
- [audiobook-production](../audiobook-production/) - 符合 ACX 标准的母带处理
- [podcast-production](../podcast-production/) - 完整的播客工作流
- [voiceover-direction](../voiceover-direction/) - 获得更好的原始录音

---

## 技能元数据（内部使用）

```yaml
name: audio-editing
category: audio
subcategory: editing
version: 1.0
author: MKTG Skills
source_expert: iZotope, Industry Best Practices
source_work: Audio Engineering Standards
difficulty: beginner
estimated_value: $50-200 per hour (equivalent engineering time)
tags: [audio, editing, eq, compression, normalization, post-production]
created: 2026-01-26
updated: 2026-01-26
```