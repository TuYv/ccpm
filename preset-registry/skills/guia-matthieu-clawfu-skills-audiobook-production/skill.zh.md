---
name: audiobook-production
description: "Master ACX-compliant audiobook production using Audible's technical standards and Richard Mayer's multimedia learning principles for engaging, professional audio. Use when: Producing an audiobook for Audible/ACX distribution; Creating audio versions of courses or written content; Setting up narration workflow for long-form content; Ensuring audio meets professional distribution standards; Self-producing an audiobook as an author"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 有声书制作

> 运用 Audible 的技术标准和 Richard Mayer 的多媒体学习原则，掌握符合 ACX 要求的有声书制作方法，打造引人入胜的专业音频。

## 何时使用此技能

- 制作用于 Audible/ACX 分发的有声书
- 为课程或书面内容创建音频版本
- 为长篇内容搭建旁白录制工作流
- 确保音频符合专业分发标准
- 作者自行制作有声书
- 管理有声书制作项目

## 方法论基础

**来源**：ACX（Audiobook Creation Exchange，有声书创作交易平台）+ Richard Mayer（多媒体学习）

**核心原则**：专业有声书制作需要在卓越的技术质量（符合严格的 ACX 标准）与引人入胜的演绎（应用学习科学原则）之间取得平衡。正如 Mayer 的研究所示：“与机器声音相比，人们通过亲切的人声能够获得更好的学习效果”（声音原则）。

**为何重要**：ACX/Audible 会拒绝不符合技术规范的有声书，从而浪费制作时间和资金。除了满足技术要求之外，了解听众如何处理音频信息，有助于做出能够最大限度提升参与度和记忆留存率的制作决策。


## Claude 做什么，您决定什么

| Claude 做什么 | 您决定什么 |
|-------------|------------|
| 设计制作工作流的结构 | 最终创意方向 |
| 提出技术方案建议 | 设备和工具选择 |
| 创建模板和检查清单 | 质量标准 |
| 识别最佳实践 | 品牌与声音风格决策 |
| 生成脚本大纲 | 最终脚本审批 |

## 此技能的作用

1. **确保符合 ACX 技术要求** - 涵盖比特率、采样率、RMS、峰值和噪声基底的规范
2. **规划有声书项目结构** - 章节编排、演职员表、零售样本
3. **应用学习原则** - 采用有助于理解的节奏、语气和演绎方式
4. **管理制作工作流** - 从脚本到最终母版
5. **处理校对与质量控制** - 在提交前发现错误

## 使用方法

### 检查是否符合 ACX 要求
```
Help me verify this audiobook meets ACX submission requirements.
[provide audio specs or describe setup]
```

### 规划有声书结构
```
Help me structure an audiobook from this manuscript:
Total word count: [X]
Chapters: [Y]
Type: [Fiction/Non-fiction]
```

### 创建制作工作流
```
Create a production plan for my audiobook project:
Book length: [word count]
Narrator: [self/hired]
Deadline: [date]
```

## 操作说明

制作有声书时，请遵循以下方法：

### 第 1 步：了解 ACX 技术要求

ACX 有严格的规范，必须满足这些规范才能通过验收。

```
## ACX Audio Specifications (2026)

### File Format
- MP3, 192 kbps or higher (constant bit rate)
- 44.1 kHz sample rate
- Mono (single channel)

### Audio Levels
- RMS: -23dB to -18dB
- Peak values: -3dB maximum (no clipping)
- Noise floor: -60dB or lower

### File Naming
- Chapter files: [BookTitle]_[ChapterNumber].mp3
- Opening credits: [BookTitle]_Opening_Credits.mp3
- Closing credits: [BookTitle]_Closing_Credits.mp3

### Content Requirements
- Opening credits (first file): Title, author, narrator
- Closing credits (last file): "This has been [title] by [author], narrated by [narrator]"
- Each chapter file is standalone (no cross-file audio)
- Consistent room tone throughout

### Quality Requirements
- No extraneous sounds (mouth clicks, pops, page turns)
- Consistent audio quality across all files
- Retail sample: ~5 minutes of representative content
```

**关键要求**：提交前对每个文件运行 ACX Check 工具。

---

### 第 2 步：准备书稿

录制前，针对音频呈现优化文本。

```
## Manuscript Preparation Checklist

### Structure
□ Chapter breaks clearly marked
□ Section breaks identified (longer pause points)
□ Footnotes converted to in-text explanations or removed
□ Visual content (charts, tables) adapted for audio or noted for skip

### Pronunciation Guide
□ Character names with phonetic spelling
□ Foreign words and phrases
□ Technical terms and jargon
□ Place names and proper nouns
□ Acronyms expanded or spelled out

### Narrator Notes
□ Tone shifts marked
□ Character voice cues (if fiction)
□ Emphasis suggestions (minimal)
□ "As shown in Figure X" → adapted for audio
□ Author asides or commentary identified

### Timing Estimate
□ Word count per chapter
□ Total word count
□ Estimated runtime: words ÷ 9,300 = hours (approx)
   - 50,000 words ≈ 5-6 hours
   - 80,000 words ≈ 8-9 hours
```

---

### 第 3 步：搭建录音环境

要获得稳定且高质量的录音，需要进行适当的设置。

```
## Home Studio Essentials

### Minimum Equipment
- **Microphone**: USB condenser (AT2020, Blue Yeti) or XLR setup
- **Pop filter**: Essential for plosives
- **Mic stand**: Stable positioning
- **Headphones**: Closed-back, wired

### Room Treatment
- Record in smallest, most furnished room available
- Hang blankets on hard surfaces
- Use reflection filter behind mic
- Close windows, turn off HVAC
- Eliminate electronic hum (fridges, computers)

### Recording Software (DAW)
- Free: Audacity, GarageBand
- Professional: Adobe Audition, Reaper, Pro Tools
- ACX-specific: Hindenburg Pro (audiobook workflow)

### Test Recording Checklist
□ Record 30 seconds of room tone
□ Record test passage
□ Check RMS levels (-23 to -18 dB)
□ Check peak levels (below -3 dB)
□ Check noise floor (below -60 dB)
□ Listen for room echo or hum
□ Verify consistent mic positioning
```

---

### 第 4 步：应用梅耶多媒体学习原则

运用有科学依据的技巧制作引人入胜的音频。

```
## Mayer's Principles for Audiobook Delivery

### Voice Principle
"People learn better from human voice than machine voice."
→ Warm, conversational delivery beats polished broadcast voice
→ Let personality come through
→ Avoid monotone "reading" voice

### Personalization Principle
"People learn better when words are conversational rather than formal."
→ Write/deliver as if talking to one person
→ Use "you" and "we"
→ Contractions are encouraged

### Segmenting Principle
"People learn better when content is in learner-paced segments."
→ Clear chapter breaks
→ Section pauses for complex material
→ Chapter summaries for dense non-fiction

### Redundancy Principle (for video/slides)
"People learn better from graphics and narration than graphics + narration + text."
→ For audiobooks: don't describe visual elements you can't show
→ Adapt visual content or acknowledge it's omitted

### Coherence Principle
"People learn better when extraneous material is excluded."
→ Cut verbal filler
→ Remove tangents that don't serve the chapter
→ Every word earns its place
```

---

### 第 5 步：制作工作流程

从脚本到母版的系统化流程。

```
## Audiobook Production Pipeline

### Phase 1: Pre-Production (Week 1-2)
□ Manuscript finalized and proofread
□ Pronunciation guide complete
□ Chapter structure confirmed
□ Recording schedule created
□ Test recordings approved

### Phase 2: Recording (Weeks 2-6, varies by length)
□ Opening credits recorded first
□ Chapters recorded in order (usually)
□ Room tone captured each session
□ Daily backup of raw files
□ Notes logged for pickups needed

### Phase 3: Editing (Concurrent or following)
□ Remove mistakes and restart takes
□ Remove excessive breaths (keep natural ones)
□ Eliminate mouth clicks and pops
□ Smooth edits (crossfade)
□ Consistent pacing throughout

### Phase 4: Mastering
□ Noise reduction applied (light touch)
□ Compression for consistent levels
□ Limiting to prevent peaks
□ Final RMS check (-23 to -18 dB)
□ Export to ACX specs (192 kbps MP3, 44.1kHz, mono)

### Phase 5: Quality Control
□ Listen to every file start to finish
□ Check first/last 5 seconds of each file
□ Verify file naming convention
□ Run ACX Check or similar tool
□ Create retail sample (5 min)
```

---

### 第 6 步：片头片尾署名与样音

片头、片尾和零售样音的具体要求。

```
## Opening Credits Script
(Must be first audio file)

"[Book Title]"
Written by [Author Name]
Narrated by [Narrator Name]

[Optional: Publisher name]
[Optional: Copyright year]

---

## Closing Credits Script
(Must be last audio file)

"This has been [Book Title], written by [Author Name],
narrated by [Narrator Name]."

[Optional: "Visit [website] for more" or other approved callout]
[Optional: "Audiobook production by [producer]"]

---

## Retail Sample Guidelines

**Length**: Approximately 5 minutes
**Content**: Representative excerpt that hooks listeners
**Selection criteria**:
- Showcases narrator's ability
- Engages interest without major spoilers
- Demonstrates the book's voice/style
- Often from early chapters (context not required)

**Do NOT include**: Credits or chapter announcements in sample
```

## 示例

### 示例 1：自出版的非虚构有声书

**背景**：一位作者正在亲自朗读自己的商业书籍。

**输入**：
> 请帮我规划一本 55,000 字商业书籍的有声书制作。我会亲自朗读。我有一支 Blue Yeti 麦克风，并在家中的办公室录音。

**输出**：

## 制作计划：商业书籍有声书

### 项目规格
- **字数**：55,000 字
- **预计时长**：5.5-6 小时
- **朗读者**：作者（亲自朗读）
- **设备**：Blue Yeti USB 麦克风（足以满足 ACX 要求）

### 前期制作（第 1-3 天）

**稿件准备**
- 审阅全部 12 个章节，进行音频适配
- 转换或改写正文中引用的 8 幅图表
- 为行业术语创建发音指南
- 标记章节分隔点和段落停顿
- 估算每章平均 4,500 字 = 每章约 29 分钟

**房间准备**
- 评估家庭办公室的声学环境
- 在录音位置后方的墙上挂一条毯子
- 也可将挂有衣物的衣橱用作录音间
- 在一天中的 3 个不同时间段进行录音测试（暖通空调、交通噪声）

**示例脚本**：
“如图 3 所示” → “它的工作原理是这样的：想象一个包含三个阶段的漏斗……”

### 录制计划（第 1-3 周）

**每日录制时段**：最多 2 小时（避免嗓音疲劳）  
**每次录制目标**：1.5-2 章（8,000 字）  
**所需录制次数总计**：约 8-10 次

**日程安排**：
- 第 1 天：片头演职员表 + 第 1 章
- 第 2 天：第 2-3 章
- 第 3 天：第 4-5 章
- [继续沿用此模式]
- 第 8 天：第 12 章 + 片尾演职员表
- 第 9-10 天：补录和问题片段

**录制流程**：
1. 提前 30 分钟补充水分（饮用室温水）
2. 声音热身（5 分钟）
3. 录制室内环境底噪（10 秒）
4. 试录并检查电平
5. 录制章节
6. 记录补录备注

### 后期制作（第 4 周）

**每章的编辑工作流程**：
1. 导入原始音频
2. 删除错误和备选录音
3. 清理呼吸声和口腔杂音
4. 应用轻度降噪
5. 将 RMS 标准化至 -20 dB
6. 检查峰值（低于 -3 dB）
7. 导出为 MP3（192 kbps、44.1 kHz、单声道）

**文件命名**：
- BusinessBookTitle_Opening_Credits.mp3
- BusinessBookTitle_001.mp3
- BusinessBookTitle_002.mp3
- ...
- BusinessBookTitle_012.mp3
- BusinessBookTitle_Closing_Credits.mp3

### 质量控制（第 1-2 天）

- 按照检查清单完整听取每个文件
- 对所有文件运行 ACX Check
- 从第 2 章制作一段 5 分钟的零售样音
- 验证所有章节的声音是否一致
- 最终审核片头和片尾演职员表

### 技术设置

**录制**：
- 44.1 kHz、24-bit WAV（以高质量格式进行编辑）
- 单声道输入
- 调整增益，使峰值达到 -12 dB

**导出（符合 ACX 要求）**：
- MP3、192 kbps CBR
- 44.1 kHz
- 单声道
- RMS：-20 dB（处于 -23 到 -18 的范围内）
- 峰值：最高 -3 dB

---

### 示例 2：ACX 故障排除

**背景**：有声书文件被 ACX 拒绝。

**输入**：
> 我的有声书提交被拒绝了。ACX 提示“RMS 电平不符合规范”和“本底噪声过高”。我该如何解决？

**输出**：

## 修复 ACX 拒绝问题：RMS 和本底噪声

### 问题诊断

**RMS 不符合规范**：音频要么过小（低于 -23 dB），要么过大（高于 -18 dB）

**本底噪声过高**：背景嘶声或嗡嗡声高于 -60 dB

### 分步修复方法

**修复 1：RMS 电平**

在 Audacity 中：
1. 选择所有音频（Ctrl+A）
2. Effect → Loudness Normalization
3. 设置为：-20 dB RMS（ACX 范围的中间值）
4. 应用

在 Adobe Audition 中：
1. 全选
2. Effects → Amplitude → Match Loudness
3. 将 Target Loudness 设置为 -20 LUFS
4. 处理

**修复 2：本底噪声**

*如果噪声较轻（仅有室内环境底噪）*：
1. 找到 2-3 秒的“静音”（仅包含室内环境底噪）
2. 将其选为噪声配置文件
3. 对完整音轨应用降噪
4. 使用最低限度的设置（降低 6-12 dB），以避免产生伪影

在 Audacity 中：
- Effect → Noise Reduction → Get Noise Profile
- Select all → Noise Reduction → 6-12 dB, 6 Sensitivity

*如果噪声很明显*：
- 在更安静的环境中重新录制
- 使用噪声门（移除低于阈值的声音）
- 考虑使用 iZotope RX 进行专业修复

**修复 3：验证峰值**

调整 RMS 后，峰值可能会超过 -3 dB：
1. Effect → Limiter
2. 将 ceiling 设置为 -3.0 dB
3. 应用

### 验证工作流程

1. 首先修复一个章节
2. 运行 ACX Check 插件或在线工具
3. 验证所有规格均符合要求：
   - RMS：-23 至 -18 dB ✓
   - 峰值：-3 dB 或更低 ✓
   - 本底噪声：-60 dB 或更低 ✓
4. 对所有文件应用相同的处理流程
5. 重新提交前再次检查每个文件

### 未来的预防措施

**录音检查清单**：
- 录音前确保本底噪声低于 -60 dB
- 设置增益，使说话时的峰值达到 -12 dB
- 每次录音时录制房间底噪
- 完整录音前先检查测试文件

## 检查清单与模板

### ACX 提交前检查清单

```
## Technical Compliance

□ All files are 192 kbps MP3, 44.1 kHz, mono
□ RMS levels between -23 and -18 dB
□ Peak values at or below -3 dB
□ Noise floor at or below -60 dB
□ No clipping or distortion
□ Consistent levels across all chapters

## File Structure

□ Opening credits file present
□ Closing credits file present
□ Files named correctly: [Title]_[Number].mp3
□ Chapter numbers are sequential
□ No missing chapters
□ Retail sample created (≈5 minutes)

## Content Quality

□ First/last 5 seconds of each file are clean (room tone or fade)
□ No extraneous sounds (clicks, pops, breaths)
□ No room echo or reverb issues
□ Consistent voice quality throughout
□ All pickups and corrections completed
□ Credits read correctly (title, author, narrator)

## Final Review

□ Listened to complete audiobook
□ Spot-checked transitions between chapters
□ Verified retail sample is representative
□ Cover art meets ACX specs (if applicable)
□ All metadata entered correctly
```

---

### 制作进度模板

```
## Audiobook Production Schedule

**Title**: ________________________________
**Word count**: ___________ | **Est. runtime**: ___________
**Narrator**: _____________________________
**Target completion**: ____________________

### Pre-Production: Week ___

| Task | Due | Done |
|------|-----|------|
| Manuscript finalized | | □ |
| Pronunciation guide | | □ |
| Room/equipment tested | | □ |
| Opening credits scripted | | □ |

### Recording: Weeks ___ - ___

| Session | Chapters | Words | Est. Time | Done |
|---------|----------|-------|-----------|------|
| 1 | Credits + Ch 1 | | | □ |
| 2 | Ch 2-3 | | | □ |
| 3 | Ch 4-5 | | | □ |
| ... | | | | □ |

### Post-Production: Week ___

| Task | Due | Done |
|------|-----|------|
| Editing complete | | □ |
| Mastering complete | | □ |
| ACX specs verified | | □ |
| QC listen-through | | □ |
| Retail sample created | | □ |

### Submission: ___________
```

## Skill 的能力边界

### 此 Skill 擅长的方面
- 构建音频制作工作流程
- 提供技术指导
- 创建质量检查清单
- 提出创意方法建议

### 此 Skill 无法完成的事项
- 取代音频工程专业知识
- 做出主观的创意决策
- 直接访问或编辑音频文件
- 保证商业成功

## 参考资料

- ACX。《音频提交要求》——官方技术规范
- Richard Mayer。《多媒体学习》（2009）——音频学习的科学原理
- iZotope。《专业配音录制技巧》——录音技术指导
- Audacity Team。《Audacity 手册》——免费编辑软件

## 相关技能

- [voiceover-direction](../voiceover-direction/) - 指导演播人员实现高质量呈现
- [audio-editing](../audio-editing/) - 后期制作基础
- [voice-design](../voice-design/) - 用于旁白的 AI 语音替代方案
- [transcription-to-content](../transcription-to-content/) - 将有声书内容重新用于其他用途

---

## 技能元数据（内部使用）

```yaml
name: audiobook-production
category: audio
subcategory: voiceover
version: 1.0
author: MKTG Skills
source_expert: ACX, Richard Mayer
source_work: ACX Submission Requirements, Multimedia Learning
difficulty: intermediate
estimated_value: $500-2,000 per audiobook (equivalent production management)
tags: [audiobook, acx, audible, narration, production]
created: 2026-01-26
updated: 2026-01-26
```