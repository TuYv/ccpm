---
name: acestep
description: AI music generation with ACE-Step 1.5 — background music, vocal tracks, covers, stem extraction, audio repainting, and continuation for video production. Use when generating music, soundtracks, jingles, or working with audio stems. Triggers include background music, soundtrack, jingle, music generation, stem extraction, cover, style transfer, repaint, continuation, or musical composition tasks.
---
# ACE-Step 1.5 音乐生成

通过 `tools/music_gen.py` 开源生成音乐。

**云服务提供商：**
- **acemusic**（默认）— 官方 ACE-Step 云 API，使用 XL Turbo (4B) 模型 + 5Hz LM 思考模式。可从 [acemusic.ai/api-key](https://acemusic.ai/api-key) 免费获取 API 密钥。无需 GPU。
- **modal** — 在 Modal 上自托管 ACE-Step 2B Turbo。需要 `MODAL_MUSIC_GEN_ENDPOINT_URL`。
- **runpod** — 在 RunPod 上自托管 ACE-Step 2B Turbo。需要 `RUNPOD_ACESTEP_ENDPOINT_ID`。

## 设置

```bash
# acemusic (recommended — free, best quality, no GPU)
echo "ACEMUSIC_API_KEY=your_key" >> .env
# Get key at https://acemusic.ai/api-key

# Self-hosted (optional fallback)
uv run tools/music_gen.py --setup             # RunPod
uv run modal deploy docker/modal-music-gen/app.py    # Modal
```

## 快速参考

```bash
# Basic generation (uses acemusic XL Turbo by default)
uv run tools/music_gen.py --prompt "Upbeat tech corporate" --duration 60 --output bg.mp3

# Generate 4 variations, pick the best
uv run tools/music_gen.py --prompt "Calm ambient piano" --duration 30 --variations 4 --output ambient.mp3

# Fast mode (disable thinking)
uv run tools/music_gen.py --no-thinking --prompt "Quick draft" --duration 30 --output draft.mp3

# With musical control
uv run tools/music_gen.py --prompt "Calm ambient piano" --duration 30 --bpm 72 --key "D Major" --output ambient.mp3

# Scene presets (video production)
uv run tools/music_gen.py --preset corporate-bg --duration 60 --output bg.mp3
uv run tools/music_gen.py --preset tension --duration 20 --output problem.mp3
uv run tools/music_gen.py --preset cta --brand digital-samba --duration 15 --output cta.mp3

# Vocals with lyrics
uv run tools/music_gen.py --prompt "Indie pop jingle" --lyrics "[verse]\nBuild it better\nShip it faster" --duration 30 --output jingle.mp3

# Cover / style transfer
uv run tools/music_gen.py --cover --reference theme.mp3 --prompt "Jazz piano version" --duration 60 --output jazz_cover.mp3

# Repaint a weak section
uv run tools/music_gen.py --repaint --input track.mp3 --repaint-start 15 --repaint-end 25 --prompt "Guitar solo" --output fixed.mp3

# Continue from existing audio
uv run tools/music_gen.py --continuation --input track.mp3 --prompt "Continue with jazz piano" --output extended.mp3

# Stem extraction
uv run tools/music_gen.py --extract vocals --input mixed.mp3 --output vocals.mp3

# Fall back to self-hosted
uv run tools/music_gen.py --cloud modal --prompt "Background music" --duration 60 --output bg.mp3
```

## 修复“千篇一律”的输出

如果生成的音乐听起来重复性很高或缺乏变化，请按以下顺序尝试：

1. **使用 acemusic 云服务**（默认）— XL Turbo 4B 模型的能力明显强于 Modal/RunPod 上的 2B 模型
2. **保持思考模式开启**（acemusic 的默认设置）— 5Hz LM 会将简单的提示词扩展为详细的音乐描述
3. **生成多个变体** — `--variations 4` 会生成 4 个版本，从中选出最佳版本
4. **使用随机推理** — `--infer-method sde` 会增加随机性（相同的种子也会产生不同结果）
5. **在不同场景中改变 BPM 和调性** — 不要为每个场景使用相同的预设
6. **编写更简洁的提示词** — “Upbeat indie rock” 比过度详细的描述能为模型提供更大的创作自由度
7. **改变种子** — 省略 `--seed`，让每次生成都具有独特性

## 创建歌曲（分步操作）

### 1. 器乐背景音轨（最简单）
```bash
uv run tools/music_gen.py --prompt "Upbeat indie rock, driving drums, jangly guitar" --duration 60 --bpm 120 --key "G Major" --output track.mp3
```

### 2. 带人声和歌词的歌曲
将歌词写入临时文件，或以内联方式传入。使用结构标签来控制歌曲段落。

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
uv run tools/music_gen.py \
  --prompt "Upbeat indie rock anthem, male vocal, driving drums, electric guitar, studio polish" \
  --lyrics "$(cat /tmp/lyrics.txt)" \
  --duration 60 \
  --bpm 128 \
  --key "G Major" \
  --output my_song.mp3
```

### 3. 重绘较弱的段落
如果副歌听起来较弱，可以只重新生成该段落：
```bash
uv run tools/music_gen.py --repaint --input my_song.mp3 --repaint-start 20 --repaint-end 35 --prompt "Powerful anthemic chorus, big drums" --output fixed.mp3
```

### 4. 继续/延长音轨
```bash
uv run tools/music_gen.py --continuation --input my_song.mp3 --prompt "Continue with gentle acoustic outro" --output extended.mp3
```

### 获得良好效果的关键提示
- **Caption = 整体风格**（流派、乐器、情绪、制作质量）
- **Lyrics = 时间结构**（主歌/副歌的衔接、人声演唱方式）
- **歌词中的大写字母** = 更高的人声强度
- **圆括号** = 背景人声："We rise (together)"
- **每行保持 6-10 个音节**，以获得自然的节奏
- **不要在 caption 中描述旋律**——描述*声音*和*感觉*
- 迭代调整提示词/歌词时，使用 `--seed` 锁定随机性

### 控制人声性别
模型本身无法可靠地遵循 "female vocal" 或 "male vocal"。请将以下两种方式结合使用：
1. **在提示词中**：明确说明——"solo female singer, alto voice" 或 "female vocalist only, breathy intimate voice"。加入艺术家参考也会有所帮助（例如，"Brandi Carlile style"）。
2. **在歌词中**：在每个段落前添加 `[female vocal]` 标签：
```
[female vocal]
[Verse 1]
Walking through the morning light...

[female vocal]
[Chorus - anthemic]
WE KEEP MOVING FORWARD...
```
仅在提示词中说 "female vocal" 往往会被忽略。提示词与歌词标签的组合才是有效的方式。

### 二重唱和人声交替
对于男女声交替演唱主歌的二重唱，请同时使用提示词和逐段歌词标签：
- **Prompt**: "duet, male and female vocals trading verses, warm harmonies on chorus"
- **Lyrics**: 为每个段落添加演唱者标签：
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
这样可以可靠地实现段落之间的人声交替，以及共同演唱部分的和声。

## 场景预设

| 预设 | BPM | 调性 | 使用场景 |
|--------|-----|----------|----------|
| `corporate-bg` | 110 | C 大调 | 专业背景、演示文稿 |
| `upbeat-tech` | 128 | G 大调 | 产品发布、技术演示 |
| `ambient` | 72 | D 大调 | 概览幻灯片、反思性内容 |
| `dramatic` | 90 | D 小调 | 揭示、公告 |
| `tension` | 85 | A 小调 | 问题陈述、挑战 |
| `hopeful` | 120 | C 大调 | 解决方案揭示、问题解决 |
| `cta` | 135 | E 大调 | 行动号召、结尾时的活力 |
| `lofi` | 85 | F 大调 | 屏幕录制、编程演示 |

## 任务类型

### text2music（默认）
根据文本提示词 + 可选歌词生成音乐。

### cover
根据参考音频进行风格迁移。使用 `--cover-strength` (0.0-1.0) 控制混合程度：
- **0.2** — 宽松的风格灵感（更大的创作自由度）
- **0.5** — 平衡的风格迁移
- **0.7** — 接近原始结构（默认）
- **1.0** — 最大程度还原源音频

### extract
音轨分离——从混合音频中隔离单独的音轨。
音轨：`vocals`、`drums`、`bass`、`guitar`、`piano`、`keyboard`、`strings`、`brass`、`woodwinds`、`other`

### repainting（仅限 acemusic）
在保留其余音频的同时，重新生成现有音频中的特定时间片段。
```bash
uv run tools/music_gen.py --repaint --input track.mp3 --repaint-start 15 --repaint-end 25 --prompt "Guitar solo" --output fixed.mp3
```

### continuation（仅限 acemusic）
从现有音频的结尾处继续生成，以延长音频。
```bash
uv run tools/music_gen.py --continuation --input track.mp3 --prompt "Continue with jazz piano" --output extended.mp3
```

## 提示词工程

### 标题撰写——层次维度

通过叠加多个描述维度来撰写标题，而不是使用单个词语进行描述。

**应包含的维度：**
- **流派/风格**：流行、摇滚、爵士、电子、lo-fi、合成器流行、管弦乐
- **情绪/氛围**：忧郁、欣喜若狂、梦幻、怀旧、亲密、紧张
- **乐器**：木吉他、合成器铺底、808 鼓、弦乐、铜管、钢琴
- **音色**：温暖、清脆、空灵、有冲击力、丰富、精致、原始
- **时代**："80 年代合成器流行"、"现代独立音乐"、"浪漫主义古典乐"
- **制作**：lo-fi、录音室精修、现场录音、电影感
- **人声**：气声、有力量、假声、沙哑、口语（或 "纯器乐"）

**好**："缓慢而忧郁的钢琴抒情曲，搭配亲密感十足的女声，温暖的弦乐逐渐铺陈至充满力量的副歌，录音室精修制作"
**差**："悲伤的歌曲"

### 核心原则

1. **具体胜过模糊**——描述乐器、情绪和制作风格
2. **避免矛盾**——不要同时要求"古典弦乐"和"硬核金属"
3. **重复可以强化优先级**——重复重要元素以强调其重要性
4. **简略的标题 = 更多创作自由**——详细的标题会限制模型
5. **使用元数据参数指定 BPM/调性**——不要在标题中写"120 BPM"，而应使用 `--bpm 120`

### 歌词格式

**结构标签**（在歌词中使用，而不是在标题中）：
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

**人声控制**（前置于行或段落）：
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
- 括号 = 背景人声（"We rise (together)"）
- 在各段落中让每行保持 6-10 个音节，以获得自然的节奏

## 视频制作集成

### 各类场景的音乐

| 场景 | 预设 | 时长 | 备注 |
|-------|--------|-------|-------|
| 标题 | `dramatic` 或 `ambient` | 3-5s | 简短，用于营造氛围 |
| 问题 | `tension` | 10-15s | 黑暗、令人不安 |
| 解决方案 | `hopeful` | 10-15s | 舒缓、乐观 |
| 演示 | `lofi` 或 `corporate-bg` | 30-120s | 不喧宾夺主，与演示时长匹配 |
| 数据 | `upbeat-tech` | 8-12s | 逐步建立可信度 |
| CTA | `cta` | 5-10s | 最大能量，简洁有力 |
| 片尾字幕 | `ambient` | 5-10s | 柔和淡出 |

### 时间安排工作流

1. 先规划场景时长（根据配音脚本）
2. 生成匹配的音乐：`--duration <scene_seconds>`
3. 音乐时长是精确的（与请求时长相差不超过 0.1 秒）
4. 对于跨越多个场景的背景音乐：生成一条较长的音轨

### 与配音结合

在 Remotion 中，背景音乐的混音音量应设置为 10-20%：
```tsx
<Audio src={staticFile('voiceover.mp3')} volume={1} />
<Audio src={staticFile('bg-music.mp3')} volume={0.15} />
```

配合旁白使用的音乐：使用器乐预设（`corporate-bg`、`ambient`、`lofi`）。
以音乐为主的场景（标题、CTA）：可以使用更高的音量或人声曲目。

### 品牌一致性

使用 `--brand <name>` 从 `brands/<name>/brand.json` 加载提示信息。
使用 `--cover --reference brand_theme.mp3` 创建品牌声音标识的变体。
为了在整个项目中保持声音一致：固定种子（`--seed 42`），只改变时长/提示词。

## 高级参数

| 标志 | 默认值 | 描述 |
|------|---------|-------------|
| `--thinking` | on (acemusic) | 5Hz LM 丰富提示词并生成音频代码 |
| `--no-thinking` | - | 更快地生成，跳过 LM 推理 |
| `--variations N` | 1 | 生成 N 个变体（1-8，仅限 acemusic） |
| `--guidance-scale` | 7.0 | 提示词遵循程度（1.0-15.0） |
| `--infer-method` | ode | `ode`（确定性）或 `sde`（随机性，更丰富的变化） |
| `--seed` | random | 锁定随机性，以便复现 |

## 技术细节

- **acemusic 云端**：XL Turbo 4B DiT + 4B LM，质量最佳，每次生成约需 5-15 秒
- **Modal/RunPod**：标准 Turbo 2B DiT，无 LM，每次生成约需 2-3 秒
- **输出**：48kHz MP3/WAV/FLAC
- **时长范围**：10-600 秒
- **BPM 范围**：30-300

### 不应使用 ACE-Step 的情况
- **声音克隆** — 改用 Qwen3-TTS 或 ElevenLabs
- **音效** — 使用 ElevenLabs SFX（`tools/sfx.py`）
- **语音/旁白** — 使用配音工具，而不是音乐生成
- **从视频中提取音轨** — 先使用 FFmpeg 提取音频，然后使用 `--extract`