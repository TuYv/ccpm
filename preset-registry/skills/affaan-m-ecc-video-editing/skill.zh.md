---
name: video-editing
description: AI-assisted video editing workflows for cutting, structuring, and augmenting real footage. Covers the full pipeline from raw capture through FFmpeg, Remotion, ElevenLabs, fal.ai, and final polish in Descript or CapCut. Use when the user wants to edit video, cut footage, create vlogs, or build video content.
---
# 视频剪辑

对实拍素材进行 AI 辅助剪辑。不是根据提示词生成视频，而是快速剪辑现有视频。

## 何时启用

- 用户想要编辑、剪切或编排视频素材
- 将长时间录制内容制作成短视频
- 使用原始拍摄素材制作 Vlog、教程或演示视频
- 为现有视频添加叠加层、字幕、音乐或旁白
- 针对不同平台（YouTube、TikTok、Instagram）重新调整视频画面比例
- 用户说“编辑视频”“剪切这段素材”“制作 Vlog”或“视频工作流”

## 核心论点

当你不再要求 AI 创建整段视频，而是开始用它来压缩、编排和增强实拍素材时，AI 视频剪辑才真正有用。其价值不在于生成，而在于压缩。

## 工作流

```
Screen Studio / raw footage
  → Claude / Codex
  → FFmpeg
  → Remotion
  → ElevenLabs / fal.ai
  → Descript or CapCut
```

每一层都有特定的工作。不要跳过任何层，也不要试图让一个工具完成所有工作。

## 第 1 层：采集（Screen Studio / 原始素材）

收集源素材：
- **Screen Studio**：适用于应用演示、编程过程和浏览器工作流的精美屏幕录制
- **原始相机素材**：Vlog 素材、访谈和活动录像
- **通过 VideoDB 捕获桌面内容**：带有实时上下文的会话录制（参见 `videodb` skill）

输出：可供整理的原始文件。

## 第 2 层：整理（Claude / Codex）

使用 Claude Code 或 Codex：
- **转录并标注**：生成转录文本，识别话题和主题
- **规划结构**：决定保留哪些内容、剪掉哪些内容，以及采用何种顺序
- **识别无效片段**：找出停顿、跑题内容和重复拍摄的片段
- **生成剪辑决策列表**：提供剪切时间戳和需要保留的片段
- **搭建 FFmpeg 和 Remotion 代码框架**：生成命令和合成代码

```
Example prompt:
"Here's the transcript of a 4-hour recording. Identify the 8 strongest segments
for a 24-minute vlog. Give me FFmpeg cut commands for each segment."
```

这一层关注的是结构，而不是最终的创意品味。

## 第 3 层：确定性剪切（FFmpeg）

FFmpeg 负责处理枯燥但至关重要的工作：分割、修剪、拼接和预处理。

### 按时间戳提取片段

```bash
ffmpeg -i raw.mp4 -ss 00:12:30 -to 00:15:45 -c copy segment_01.mp4
```

### 根据剪辑决策列表批量剪切

```bash
#!/bin/bash
# cuts.txt: start,end,label
while IFS=, read -r start end label; do
  ffmpeg -i raw.mp4 -ss "$start" -to "$end" -c copy "segments/${label}.mp4"
done < cuts.txt
```

### 拼接片段

```bash
# Create file list
for f in segments/*.mp4; do echo "file '$f'"; done > concat.txt
ffmpeg -f concat -safe 0 -i concat.txt -c copy assembled.mp4
```

### 创建代理文件以加快剪辑速度

```bash
ffmpeg -i raw.mp4 -vf "scale=960:-2" -c:v libx264 -preset ultrafast -crf 28 proxy.mp4
```

### 提取音频以进行转录

```bash
ffmpeg -i raw.mp4 -vn -acodec pcm_s16le -ar 16000 audio.wav
```

### 标准化音频电平

```bash
ffmpeg -i segment.mp4 -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:v copy normalized.mp4
```

## 第 4 层：可编程合成（Remotion）

Remotion 将剪辑问题转化为可组合的代码。适合用它处理传统编辑器难以完成的任务：

### 何时使用 Remotion

- 叠加元素：文本、图像、品牌标识、下三分之一字幕
- 数据可视化：图表、统计数据、动态数字
- 动态图形：转场、解说动画
- 可组合场景：可跨视频复用的模板
- 产品演示：带注释的截图、UI 高亮

### 基础 Remotion 合成

```tsx
import { AbsoluteFill, Sequence, Video, useCurrentFrame } from "remotion";

export const VlogComposition: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {/* Main footage */}
      <Sequence from={0} durationInFrames={300}>
        <Video src="/segments/intro.mp4" />
      </Sequence>

      {/* Title overlay */}
      <Sequence from={30} durationInFrames={90}>
        <AbsoluteFill style={{
          justifyContent: "center",
          alignItems: "center",
        }}>
          <h1 style={{
            fontSize: 72,
            color: "white",
            textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
          }}>
            The AI Editing Stack
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* Next segment */}
      <Sequence from={300} durationInFrames={450}>
        <Video src="/segments/demo.mp4" />
      </Sequence>
    </AbsoluteFill>
  );
};
```

### 渲染输出

```bash
npx remotion render src/index.ts VlogComposition output.mp4
```

有关详细模式和 API 参考，请参阅 [Remotion 文档](https://www.remotion.dev/docs)。

## 第 5 层：生成式素材（ElevenLabs / fal.ai）

只生成你需要的内容。不要生成整个视频。

### 使用 ElevenLabs 生成旁白

```python
import os
import requests

resp = requests.post(
    f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
    headers={
        "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
        "Content-Type": "application/json"
    },
    json={
        "text": "Your narration text here",
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
    }
)
with open("voiceover.mp3", "wb") as f:
    f.write(resp.content)
```

### 使用 fal.ai 生成音乐和音效

使用 `fal-ai-media` 技能完成以下任务：
- 生成背景音乐
- 生成音效（使用 ThinkSound 模型实现视频转音频）
- 生成转场音效

### 使用 fal.ai 生成视觉素材

用于生成不存在的插入镜头、缩略图或补充镜头：
```
generate(model_name: "fal-ai/nano-banana-pro", input: {
  "prompt": "professional thumbnail for tech vlog, dark background, code on screen",
  "image_size": "landscape_16_9"
})
```

### VideoDB 生成式音频

如果已配置 VideoDB：
```python
voiceover = coll.generate_voice(text="Narration here", voice="alloy")
music = coll.generate_music(prompt="lo-fi background for coding vlog", duration=120)
sfx = coll.generate_sound_effect(prompt="subtle whoosh transition")
```

## 第 6 层：最终润色（Descript / CapCut）

最后一层由人来完成。使用传统编辑器处理：
- **节奏**：调整感觉过快或过慢的剪辑
- **字幕**：先自动生成，再手动校正
- **调色**：进行基础校正并营造氛围
- **最终音频混音**：平衡人声、音乐和音效的音量
- **导出**：使用适合特定平台的格式和质量设置

品味体现在这里。AI 负责清除重复性工作。最终由你做决定。

## 社交媒体画面重构

不同平台需要不同的宽高比：

| 平台 | 宽高比 | 分辨率 |
|----------|-------------|------------|
| YouTube | 16:9 | 1920x1080 |
| TikTok / Reels | 9:16 | 1080x1920 |
| Instagram 动态 | 1:1 | 1080x1080 |
| X / Twitter | 16:9 或 1:1 | 1280x720 或 720x720 |

### 使用 FFmpeg 重构画面

```bash
# 16:9 to 9:16 (center crop)
ffmpeg -i input.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" vertical.mp4

# 16:9 to 1:1 (center crop)
ffmpeg -i input.mp4 -vf "crop=ih:ih,scale=1080:1080" square.mp4
```

### 使用 VideoDB 重构画面

```python
# Smart reframe (AI-guided subject tracking)
reframed = video.reframe(start=0, end=60, target="vertical", mode=ReframeMode.smart)
```

## 场景检测与自动剪辑

### FFmpeg 场景检测

```bash
# Detect scene changes (threshold 0.3 = moderate sensitivity)
ffmpeg -i input.mp4 -vf "select='gt(scene,0.3)',showinfo" -vsync vfr -f null - 2>&1 | grep showinfo
```

### 用于自动剪辑的静音检测

```bash
# Find silent segments (useful for cutting dead air)
ffmpeg -i input.mp4 -af silencedetect=noise=-30dB:d=2 -f null - 2>&1 | grep silence
```

### 精彩片段提取

使用 Claude 分析转录文本和场景时间戳：
```
"Given this transcript with timestamps and these scene change points,
identify the 5 most engaging 30-second clips for social media."
```

## 各工具最擅长的工作

| 工具 | 优势 | 劣势 |
|------|----------|----------|
| Claude / Codex | 组织、规划、代码生成 | 不负责创意品味层 |
| FFmpeg | 确定性剪辑、批量处理、格式转换 | 没有可视化编辑界面 |
| Remotion | 可编程叠加层、可组合场景、可复用模板 | 对非开发者有学习门槛 |
| Screen Studio | 即刻产出精美的屏幕录制视频 | 仅支持屏幕录制 |
| ElevenLabs | 语音、旁白、音乐、音效 | 不是工作流的核心 |
| Descript / CapCut | 最终节奏调整、字幕、润色 | 需要手动操作，无法自动化 |

## 核心原则

1. **编辑，而不是生成。** 此工作流用于剪辑真实素材，而不是通过提示词创建内容。
2. **先结构，后风格。** 在处理任何视觉内容之前，先在第 2 层讲好故事。
3. **FFmpeg 是支柱。** 虽然枯燥，但至关重要。它能让长素材变得易于处理。
4. **用 Remotion 实现可重复性。** 如果某项工作要做不止一次，就把它制作成 Remotion 组件。
5. **有选择地生成。** 仅对不存在的素材使用 AI 生成，而不是生成所有内容。
6. **品味是最后一层。** AI 负责清除重复性工作。最终的创意决策由你来做。

## 相关 Skills

- `fal-ai-media` — AI 图像、视频和音频生成
- `videodb` — 服务端视频处理、索引和流式传输
- `content-engine` — 平台原生内容分发