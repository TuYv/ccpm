---
name: elevenlabs
description: Generate AI voiceovers, sound effects, and music using ElevenLabs APIs. Use when creating audio content for videos, podcasts, or games. Triggers include generating voiceovers, narration, dialogue, sound effects from descriptions, background music, soundtrack generation, voice cloning, or any audio synthesis task.
---
# ElevenLabs 音频生成

需要在 `.env` 中配置 `ELEVENLABS_API_KEY`。

## 文本转语音

```python
from elevenlabs.client import ElevenLabs
from elevenlabs import save, VoiceSettings
import os

client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

audio = client.text_to_speech.convert(
    text="Welcome to my video!",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    model_id="eleven_multilingual_v2",
    voice_settings=VoiceSettings(
        stability=0.5,
        similarity_boost=0.75,
        style=0.5,
        speed=1.0
    )
)
save(audio, "voiceover.mp3")
```

### 模型

| 模型 | 质量 | SSML 支持 | 备注 |
|-------|---------|--------------|-------|
| `eleven_multilingual_v2` | 一致性最高 | 无 | 稳定、可用于生产环境，支持 29 种语言 |
| `eleven_flash_v2_5` | 良好 | `<break>`、`<phoneme>` | 速度快，支持停顿/发音标签 |
| `eleven_turbo_v2_5` | 良好 | `<break>`、`<phoneme>` | 延迟最低 |
| `eleven_v3` | 表现力最强 | 无 | Alpha 版——不可靠，需要提示词工程 |

**选择建议：** 注重可靠性时使用 multilingual_v2；需要 SSML 控制时使用 flash/turbo；追求最强表现力时使用 v3（可能需要重新生成）。

### 不同风格的语音设置

| 风格 | stability | similarity | style | speed |
|-------|-----------|------------|-------|-------|
| 自然/专业 | 0.75-0.85 | 0.9 | 0.0-0.1 | 1.0 |
| 对话式 | 0.5-0.6 | 0.85 | 0.3-0.4 | 0.9-1.0 |
| 活力型/YouTuber 风格 | 0.3-0.5 | 0.75 | 0.5-0.7 | 1.0-1.1 |

### 章节之间的停顿

**使用 flash/turbo 模型时：** 在文本中内联使用 SSML break 标签：
```
...end of section. <break time="1.5s" /> Start of next...
```
每次停顿最长 3 秒。停顿过多可能导致语速异常。

**使用 multilingual_v2 / v3 时：** 不支持 SSML。可选方案：
- 段落分隔（空行）——会产生约 0.3-0.5 秒的自然停顿
- 使用 ffmpeg 进行后期处理：拆分音频并插入静音

**警告：** `...`（省略号）并不是可靠的停顿方式——它可能会被朗读成单词或声音。请勿使用省略号作为实现停顿的机制。

### 发音控制

**音标式拼写（适用于任何模型）：** 按照你希望的发音方式书写单词：
- `Janus` → `Jan-us`
- `nginx` → `engine-x`
- 使用连字符、大写字母和撇号来引导发音

**SSML phoneme 标签（仅适用于 flash/turbo）：**
```
<phoneme alphabet="ipa" ph="ˈdʒeɪnəs">Janus</phoneme>
```

### 迭代式工作流程

1. 生成 → 试听 → 找出发音/节奏问题
2. 调整：音标式拼写、break 标签、语音设置
3. 重新生成。如果停顿不够精确，请在后期使用 ffmpeg 添加静音，而不是反复调整 TTS 引擎。

## 语音克隆

### 即时语音克隆

```python
with open("sample.mp3", "rb") as f:
    voice = client.voices.ivc.create(
        name="My Voice",
        files=[f],
        remove_background_noise=True
    )
print(f"Voice ID: {voice.voice_id}")
```

- 使用 `client.voices.ivc.create()`（而不是 `client.voices.clone()`）
- 传入以二进制模式（`"rb"`）打开的文件句柄，而不是路径
- 先转换 m4a：`ffmpeg -i input.m4a -codec:a libmp3lame -qscale:a 2 output.mp3`
- 使用多个样本（2-3 个片段）可提高准确度
- 保存 voice ID 以便重复使用

**专业语音克隆：** 需要 Creator 计划或更高级别，且需 30 分钟以上的音频。请参阅 [reference.md](reference.md)。

## 音效

每次生成最长 22 秒。

```python
result = client.text_to_sound_effects.convert(
    text="Thunder rumbling followed by heavy rain",
    duration_seconds=10,
    prompt_influence=0.3
)
with open("thunder.mp3", "wb") as f:
    for chunk in result:
        f.write(chunk)
```

**提示词技巧：** 要具体明确——“木地板上沉重的脚步声，缓慢而刻意，伴随着吱嘎声”

## 音乐生成

时长为 10 秒至 5 分钟。使用 `client.music.compose()`（而不是 `.generate()`）。

```python
result = client.music.compose(
    prompt="Upbeat indie rock, catchy guitar riff, energetic drums, travel vlog",
    music_length_ms=60000,
    force_instrumental=True
)
with open("music.mp3", "wb") as f:
    for chunk in result:
        f.write(chunk)
```

**提示词结构：** 流派、情绪、乐器、节奏、使用场景。添加“无人声”，或为背景音乐使用 `force_instrumental=True`。

## Remotion 集成

### 完整工作流：从脚本到同步场景

```
VOICEOVER-SCRIPT.md → voiceover.py → public/audio/ → Remotion composition
        ↓                  ↓               ↓                 ↓
  Scene narration    Generate MP3    Audio files     <Audio> component
  with durations     per scene       with timing     synced to scenes
```

### 第 1 步：生成逐场景音频

使用工具包的旁白工具为每个场景生成音频：

```bash
# Generate voiceover files for each scene
python tools/voiceover.py --scene-dir public/audio/scenes --json

# Output:
# public/audio/scenes/
#   ├── scene-01-title.mp3
#   ├── scene-02-problem.mp3
#   ├── scene-03-solution.mp3
#   └── manifest.json  (durations for each file)
```

`manifest.json` 包含时间信息：
```json
{
  "scenes": [
    { "file": "scene-01-title.mp3", "duration": 4.2 },
    { "file": "scene-02-problem.mp3", "duration": 12.8 },
    { "file": "scene-03-solution.mp3", "duration": 15.3 }
  ],
  "totalDuration": 32.3
}
```

### 第 2 步：在 Remotion 合成中使用音频

```tsx
// src/Composition.tsx
import { Audio, staticFile, Series, useVideoConfig } from 'remotion';

// Import scene components
import { TitleSlide } from './scenes/TitleSlide';
import { ProblemSlide } from './scenes/ProblemSlide';
import { SolutionSlide } from './scenes/SolutionSlide';

// Scene durations (from manifest.json, converted to frames at 30fps)
const SCENE_DURATIONS = {
  title: Math.ceil(4.2 * 30),      // 126 frames
  problem: Math.ceil(12.8 * 30),   // 384 frames
  solution: Math.ceil(15.3 * 30),  // 459 frames
};

export const MainComposition: React.FC = () => {
  return (
    <>
      {/* Scene sequence */}
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.title}>
          <TitleSlide />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.problem}>
          <ProblemSlide />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.solution}>
          <SolutionSlide />
        </Series.Sequence>
      </Series>

      {/* Audio track - plays continuously across all scenes */}
      <Audio src={staticFile('audio/voiceover.mp3')} volume={1} />

      {/* Optional: Background music at lower volume */}
      <Audio src={staticFile('audio/music.mp3')} volume={0.15} />
    </>
  );
};
```

### 第 3 步：为每个场景添加音频（替代方案）

若需更精细的控制，可分别为每个场景添加音频：

```tsx
// src/scenes/ProblemSlide.tsx
import { Audio, staticFile, useCurrentFrame } from 'remotion';

export const ProblemSlide: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{ /* slide styles */ }}>
      <h1>The Problem</h1>
      {/* Scene content */}

      {/* Audio starts when this scene starts (frame 0 of this sequence) */}
      <Audio src={staticFile('audio/scenes/scene-02-problem.mp3')} />
    </div>
  );
};
```

### 将视觉画面与旁白同步

应根据音频计算场景时长，而不是反过来：

```tsx
// src/config/timing.ts
import manifest from '../../public/audio/scenes/manifest.json';

const FPS = 30;

// Convert audio durations to frame counts
export const sceneDurations = manifest.scenes.reduce((acc, scene) => {
  const name = scene.file.replace(/^scene-\d+-/, '').replace('.mp3', '');
  acc[name] = Math.ceil(scene.duration * FPS);
  return acc;
}, {} as Record<string, number>);

// Usage in composition:
// <Series.Sequence durationInFrames={sceneDurations.title}>
```

### 音频时序模式

```tsx
import { Audio, Sequence, interpolate, useCurrentFrame } from 'remotion';

// Fade in audio
export const FadeInAudio: React.FC<{ src: string; fadeFrames?: number }> = ({
  src,
  fadeFrames = 30
}) => {
  const frame = useCurrentFrame();
  const volume = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return <Audio src={src} volume={volume} />;
};

// Delayed audio start
export const DelayedAudio: React.FC<{ src: string; delayFrames: number }> = ({
  src,
  delayFrames
}) => (
  <Sequence from={delayFrames}>
    <Audio src={src} />
  </Sequence>
);

// Usage:
// <FadeInAudio src={staticFile('audio/music.mp3')} fadeFrames={60} />
// <DelayedAudio src={staticFile('audio/sfx/whoosh.mp3')} delayFrames={45} />
```

### 旁白与演示视频同步

当一个场景同时包含旁白和演示视频时：

```tsx
import { Audio, OffthreadVideo, staticFile, useVideoConfig } from 'remotion';

export const DemoScene: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  // Calculate playback rate to fit demo into voiceover duration
  const demoDuration = 45; // seconds (original demo length)
  const sceneDuration = durationInFrames / fps; // seconds (from voiceover)
  const playbackRate = demoDuration / sceneDuration;

  return (
    <>
      <OffthreadVideo
        src={staticFile('demos/feature-demo.mp4')}
        playbackRate={playbackRate}
      />
      <Audio src={staticFile('audio/scenes/scene-04-demo.mp3')} />
    </>
  );
};
```

### 错误处理

```tsx
import { Audio, staticFile, delayRender, continueRender } from 'remotion';
import { useEffect, useState } from 'react';

export const SafeAudio: React.FC<{ src: string }> = ({ src }) => {
  const [handle] = useState(() => delayRender());
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    const audio = new window.Audio(src);
    audio.oncanplaythrough = () => {
      setAudioReady(true);
      continueRender(handle);
    };
    audio.onerror = () => {
      console.error(`Failed to load audio: ${src}`);
      continueRender(handle); // Continue without audio rather than hang
    };
  }, [src, handle]);

  if (!audioReady) return null;
  return <Audio src={src} />;
};
```

### 工具包命令：/generate-voiceover

`/generate-voiceover` 命令负责处理完整的工作流程：

```
/generate-voiceover

1. Reads VOICEOVER-SCRIPT.md
2. Extracts narration for each scene
3. Generates audio via ElevenLabs API
4. Saves to public/audio/scenes/
5. Creates manifest.json with durations
6. Updates project.json with timing info
```

## 常用语音

- George：`JBFqnCBsd6RMkjVDRZzb`（温暖的旁白音色）
- Rachel：`21m00Tcm4TlvDq8ikWAM`（清晰的女声）
- Adam：`pNInz6obpgDQGcFmaJgB`（专业的男声）

列出全部语音：`client.voices.get_all()`

完整的 API 文档请参阅 [reference.md](reference.md)。