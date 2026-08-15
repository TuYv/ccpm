---
name: acestep
description: AI music generation with ACE-Step 1.5 — background music, vocal tracks, covers, stem extraction, audio repainting, and continuation for video production. Use when generating music, soundtracks, jingles, or working with audio stems. Triggers include background music, soundtrack, jingle, music generation, stem extraction, cover, style transfer, repaint, continuation, or musical composition tasks.
---
# ACE-Step 1.5 音乐生成

通过 `tools/music_gen.py` 使用开源音乐生成功能。

**云服务提供商：**
- **acemusic**（默认）— 官方 ACE-Step 云 API，使用 XL Turbo（4B）模型和 5Hz LM 思考模式。可从 [acemusic.ai/api-key](https://acemusic.ai/api-key) 免费获取 API 密钥。无需 GPU。
- **modal** — 在 Modal 上自行托管 ACE-Step 2B Turbo。需要 `MODAL_MUSIC_GEN_ENDPOINT_URL`。
- **runpod** — 在 RunPod 上自行托管 ACE-Step 2B Turbo。需要 `RUNPOD_ACESTEP_ENDPOINT_ID`。

## 设置

```bash
# acemusic (recommended — free, best quality, no GPU)
echo "ACEMUSIC_API_KEY=your_key" >> .env
# Get key at https://acemusic.ai/api-key

# Self-hosted (optional fallback)
python tools/music_gen.py --setup             # RunPod
modal deploy docker/modal-music-gen/app.py    # Modal
```

## 快速参考

```bash
# Basic generation (uses acemusic XL Turbo by default)
python tools/music_gen.py --prompt "Upbeat tech corporate" --duration 60 --output bg.mp3

# Generate 4 variations, pick the best
python tools/music_gen.py --prompt "Calm ambient piano" --duration 30 --variations 4 --output ambient.mp3

# Fast mode (disable thinking)
python tools/music_gen.py --no-thinking --prompt "Quick draft" --duration 30 --output draft.mp3

# With musical control
python tools/music_gen.py --prompt "Calm ambient piano" --duration 30 --bpm 72 --key "D Major" --output ambient.mp3

# Scene presets (video production)
python tools/music_gen.py --preset corporate-bg --duration 60 --output bg.mp3
python tools/music_gen.py --preset tension --duration 20 --output problem.mp3
python tools/music_gen.py --preset cta --brand digital-samba --duration 15 --output cta.mp3

# Vocals with lyrics
python tools/music_gen.py --prompt "Indie pop jingle" --lyrics "[verse]\nBuild it better\nShip it faster" --duration 30 --output jingle.mp3

# Cover / style transfer
python tools/music_gen.py --cover --reference theme.mp3 --prompt "Jazz piano version" --duration 60 --output jazz_cover.mp3

# Repaint a weak section
python tools/music_gen.py --repaint --input track.mp3 --repaint-start 15 --repaint-end 25 --prompt "Guitar solo" --output fixed.mp3

# Continue from existing audio
python tools/music_gen.py --continuation --input track.mp3 --prompt "Continue with jazz piano" --output extended.mp3

# Stem extraction
python tools/music_gen.py --extract vocals --input mixed.mp3 --output vocals.mp3

# Fall back to self-hosted
python tools/music_gen.py --cloud modal --prompt "Background music" --duration 60 --output bg.mp3
```

## 修复输出“千篇一律”的问题

如果生成的音乐听起来重复或缺乏变化，请按以下顺序尝试：

1. **使用 acemusic 云服务**（默认）— XL Turbo 4B 模型的能力显著强于 Modal/RunPod 上的 2B 模型
2. **保持思考模式开启**（acemusic 默认设置）— 5Hz LM 会将简略的提示词扩充为详细的音乐描述
3. **生成多个变体** — `--variations 4` 会生成 4 个版本，从中选择最佳版本
4. **使用随机推理** — `--infer-method sde` 会增加随机性（相同的种子也会产生不同的结果）
5. **在不同场景中改变 BPM 和调性** — 不要对每个场景都使用相同的预设
6. **编写更简略的提示词** — 与极其详细的描述相比，"Upbeat indie rock" 能给予模型更多的创作自由
7. **改变种子** — 省略 `--seed`，使每次生成的结果都独一无二

## 创建歌曲（分步指南）

### 1. 纯器乐背景音轨（最简单）
```bash
python tools/music_gen.py --prompt "Upbeat indie rock, driving drums, jangly guitar" --duration 60 --bpm 120 --key "G Major" --output track.mp3
```

### 2. 带人声和歌词的歌曲
将歌词写入临时文件，或以内联方式传入。使用段落结构标签控制歌曲的各个部分。

```bash
# Write lyrics to a file first (recommended for longer songs)
cat > /tmp/lyrics.txt << 'LYRICS'
[Verse 1]
Walking through the morning light
Coffee in my hand feels right
Another day to build and dream
Nothing's ever what it seems

[Chorus - anthemic]
WE KEEP MOVING FORWARD
Through the noise and doubt
We keep moving forward
That's what it's about

[Verse 2]
Screens are glowing late at night
Shipping code until it's right
The deadline's close but so are we
Almost there, just wait and see

[Chorus - bigger]
WE KEEP MOVING FORWARD
Through the noise and doubt
We keep moving forward
That's what it's about

[Outro - fade]
(Moving forward...)
LYRICS

# Generate the song
python tools/music_gen.py \
  --prompt "Upbeat indie rock anthem, male vocal, driving drums, electric guitar, studio polish" \
  --lyrics "$(cat /tmp/lyrics.txt)" \
  --duration 60 \
  --bpm 128 \
  --key "G Major" \
  --output my_song.mp3
```

### 3. 重绘效果不佳的片段
如果副歌听起来效果不佳，只需重新生成该片段：
```bash
python tools/music_gen.py --repaint --input my_song.mp3 --repaint-start 20 --repaint-end 35 --prompt "Powerful anthemic chorus, big drums" --output fixed.mp3
```

### 4. 续写/延长音轨
```bash
python tools/music_gen.py --continuation --input my_song.mp3 --prompt "Continue with gentle acoustic outro" --output extended.mp3
```

### 获得良好效果的关键技巧
- **Caption = 整体风格**（流派、乐器、情绪、制作质量）
- **Lyrics = 时间结构**（主歌/副歌走向、人声演绎方式）
- **歌词中的大写字母** = 较强的人声力度
- **圆括号** = 背景人声："We rise (together)"
- **每行保持 6-10 个音节**，以获得自然的节奏
- **不要在 caption 中描述旋律** — 应描述*声音*和*感觉*
- **使用 `--seed`** 在迭代调整 prompt/lyrics 时锁定随机性

### 控制人声性别
模型本身并不能可靠地遵循 "female vocal" 或 "male vocal"。请结合使用以下**两种**方法：
1. **在 prompt 中**：明确说明 — "solo female singer, alto voice" 或 "female vocalist only, breathy intimate voice"。加入艺术家风格参考会有所帮助（例如 "Brandi Carlile style"）。
2. **在歌词中**：在每个段落前添加 `[female vocal]` 标签：
```
[female vocal]
[Verse 1]
Walking through the morning light...

[female vocal]
[Chorus - anthemic]
WE KEEP MOVING FORWARD...
```
仅在 prompt 中指定 "female vocal" 往往会被忽略。真正有效的是将 prompt 与歌词标签结合使用。

### 二重唱与人声交替
对于男女声交替演唱主歌的二重唱，请同时使用 prompt 和逐段歌词标签：
- **Prompt**："duet, male and female vocals trading verses, warm harmonies on chorus"
- **Lyrics**：为每个段落标注演唱者：
```
[Verse 1 - male vocal, storytelling]
First verse lyrics here...

[Chorus - male and female duet, harmonies]
Chorus lyrics here...

[Verse 2 - female vocal, wry]
Second verse lyrics here...

[Bridge - male vocal, spoken]
Spoken bridge...

[Bridge - female vocal, sung]
Sung response...
```
这种方法可以可靠地生成段落间的人声交替，并在共同演唱的部分加入和声。

## 场景预设

| 预设 | BPM | 调性 | 使用场景 |
|--------|-----|-----|----------|
| `corporate-bg` | 110 | C 大调 | 专业背景音乐、演示文稿 |
| `upbeat-tech` | 128 | G 大调 | 产品发布、技术演示 |
| `ambient` | 72 | D 大调 | 概览幻灯片、反思性内容 |
| `dramatic` | 90 | D 小调 | 揭晓、公告 |
| `tension` | 85 | A 小调 | 问题陈述、挑战 |
| `hopeful` | 120 | C 大调 | 解决方案揭晓、问题解决 |
| `cta` | 135 | E 大调 | 行动号召、收尾氛围 |
| `lofi` | 85 | F 大调 | 屏幕录制、编程演示 |

## 任务类型

### text2music（默认）
根据文本提示词和可选歌词生成音乐。

### cover
基于参考音频进行风格迁移。使用 `--cover-strength`（0.0-1.0）控制融合程度：
- **0.2** — 宽松的风格借鉴（创作自由度更高）
- **0.5** — 平衡的风格迁移
- **0.7** — 接近原始结构（默认）
- **1.0** — 最大程度忠实于源音频

### extract
音轨分离——从混合音频中分离单独的音轨。
音轨：`vocals`、`drums`、`bass`、`guitar`、`piano`、`keyboard`、`strings`、`brass`、`woodwinds`、`other`

### repainting（仅限 acemusic）
重新生成现有音频中的特定时间片段，同时保留其余部分。
```bash
python tools/music_gen.py --repaint --input track.mp3 --repaint-start 15 --repaint-end 25 --prompt "Guitar solo" --output fixed.mp3
```

### continuation（仅限 acemusic）
从现有音频的结尾处继续生成，以延长音频。
```bash
python tools/music_gen.py --continuation --input track.mp3 --prompt "Continue with jazz piano" --output extended.mp3
```

## 提示词工程

### 描述文本编写——多维度分层

通过叠加多个描述维度来编写描述文本，而不是使用单一词语进行描述。

**应包含的维度：**
- **流派/风格**：流行、摇滚、爵士、电子、低保真、合成器浪潮、管弦乐
- **情感/氛围**：忧郁、欣快、梦幻、怀旧、亲密、紧张
- **乐器**：原声吉他、合成器铺底音色、808 鼓、弦乐、铜管乐器、钢琴
- **音色**：温暖、清晰、空灵、有冲击力、丰富、精致、原始
- **年代**：“80 年代合成器流行乐”、“现代独立音乐”、“古典浪漫主义”
- **制作方式**：低保真、录音室精制、现场录音、电影化
- **人声**：气声、有力量、假声、沙哑、念白（或“纯音乐”）

**良好示例**：“缓慢忧郁的钢琴叙事曲，搭配亲密的女声演唱和温暖的弦乐，逐渐推进至富有力量的副歌，采用录音室精制制作”
**不佳示例**：“悲伤的歌曲”

### 核心原则

1. **具体胜于模糊**——描述乐器、氛围和制作风格
2. **避免矛盾**——不要同时要求“古典弦乐”和“硬核金属”
3. **重复可强化优先级**——重复重要元素以示强调
4. **描述越简略，创作自由度越高**——详细的描述会限制模型
5. **使用元数据参数设置 BPM/调性**——不要在描述文本中写“120 BPM”，而应使用 `--bpm 120`

### 歌词格式

**结构标签**（用于歌词，而非描述文本）：
```
[Intro]
[Verse]
[Chorus]
[Bridge]
[Outro]
[Instrumental]
[Guitar Solo]
[Build]
[Drop]
[Breakdown]
```

**人声控制**（为行或段落添加前缀）：
```
[raspy vocal]
[whispered]
[falsetto]
[powerful belting]
[harmonies]
[ad-lib]
```

**能量指示：**
- 大写字母 = 高强度（"WE RISE ABOVE"）
- 圆括号 = 背景人声（"We rise (together)"）
- 每个段落中的每行保持 6-10 个音节，以获得自然的节奏

## 视频制作集成

### 不同场景类型的音乐

| 场景 | 预设 | 时长 | 备注 |
|-------|--------|----------|-------|
| 标题 | `dramatic` 或 `ambient` | 3-5 秒 | 简短、营造氛围 |
| 问题 | `tension` | 10-15 秒 | 阴暗、令人不安 |
| 解决方案 | `hopeful` | 10-15 秒 | 释然、乐观 |
| 演示 | `lofi` 或 `corporate-bg` | 30-120 秒 | 不分散注意力，与演示时长匹配 |
| 统计数据 | `upbeat-tech` | 8-12 秒 | 增强可信度 |
| 行动号召 | `cta` | 5-10 秒 | 能量最大化，简短有力 |
| 片尾字幕 | `ambient` | 5-10 秒 | 柔和淡出 |

### 时间规划工作流

1. 首先规划场景时长（根据旁白脚本）
2. 生成与其匹配的音乐：`--duration <scene_seconds>`
3. 音乐时长非常精确（与请求时长的误差在 0.1 秒以内）
4. 对于跨越多个场景的背景音乐：生成一条较长的音轨

### 与旁白合成

在 Remotion 中，背景音乐应以 10-20% 的音量进行混音：
```tsx
<Audio src={staticFile('voiceover.mp3')} volume={1} />
<Audio src={staticFile('bg-music.mp3')} volume={0.15} />
```

用于旁白下方的音乐：使用纯音乐预设（`corporate-bg`、`ambient`、`lofi`）。
对于以音乐为主的场景（标题、行动号召）：可以使用更高音量或人声曲目。

### 品牌一致性

使用 `--brand <name>` 从 `brands/<name>/brand.json` 加载提示。
使用 `--cover --reference brand_theme.mp3` 创建品牌声音标识的变体。
为了在整个项目中保持声音一致：固定种子（`--seed 42`），仅改变时长/提示词。

## 高级参数

| 标志 | 默认值 | 描述 |
|------|---------|-------------|
| `--thinking` | 开启（acemusic） | 5Hz LM 丰富提示词并生成音频编码 |
| `--no-thinking` | - | 更快生成，跳过 LM 推理 |
| `--variations N` | 1 | 生成 N 个变体（1-8，仅限 acemusic） |
| `--guidance-scale` | 7.0 | 提示词遵循程度（1.0-15.0） |
| `--infer-method` | ode | `ode`（确定性）或 `sde`（随机性，更多变化） |
| `--seed` | 随机 | 锁定随机性以实现可复现性 |

## 技术细节

- **acemusic 云端**：XL Turbo 4B DiT + 4B LM，质量最佳，每次生成约需 5-15 秒
- **Modal/RunPod**：Standard Turbo 2B DiT，无 LM，每次生成约需 2-3 秒
- **输出**：48kHz MP3/WAV/FLAC
- **时长范围**：10-600 秒
- **BPM 范围**：30-300

### 不应使用 ACE-Step 的情况
- **声音克隆** — 改用 Qwen3-TTS 或 ElevenLabs
- **音效** — 使用 ElevenLabs SFX（`tools/sfx.py`）
- **语音/旁白** — 使用旁白工具，而非音乐生成工具
- **从视频中提取分轨** — 先使用 FFmpeg 提取音频，然后使用 `--extract`