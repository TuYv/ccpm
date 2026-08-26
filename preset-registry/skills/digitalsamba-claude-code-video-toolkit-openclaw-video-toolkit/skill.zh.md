---
name: video_toolkit
description: Create professional videos autonomously using claude-code-video-toolkit — AI voiceovers, image generation, music, talking heads, and Remotion rendering.
metadata:
  openclaw:
    emoji: "🎬"
    skillKey: "video-toolkit"
    os: ["darwin", "linux"]
    requires:
      bins: ["node", "python3", "ffmpeg", "npm"]
---
# Video Toolkit

从文本简报创建专业的讲解视频。该工具包使用云 GPU（Modal 或 RunPod）上的开源 AI 模型来生成旁白、图像、音乐和会说话的头像动画。Remotion（React）负责合成与渲染。

## CRITICAL: Toolkit Path

工具包位于固定路径。**运行任何工具命令前，必须始终先 `cd` 到此路径。**

```bash
TOOLKIT=~/.openclaw/workspace/claude-code-video-toolkit
cd $TOOLKIT
```

**绝对不要在项目目录内运行工具命令。**工具会以工具包根目录为基准解析路径。

## CRITICAL: Progress Reporting

**每个云 GPU 工具命令都必须始终添加 `--progress json`。**这样会在 stderr 上提供结构化的 JSON Lines，便于你监控任务状态、检测卡住的任务，并实时向用户报告进度。

```bash
# CORRECT — always include --progress json
uv run tools/music_gen.py --preset corporate-bg --duration 60 --output bg.mp3 --progress json

# WRONG — no visibility into job status
uv run tools/music_gen.py --preset corporate-bg --duration 60 --output bg.mp3
```

支持 `--progress json` 的工具：`music_gen.py`、`qwen3_tts.py`、`flux2.py`、`upscale.py`、`sadtalker.py`、`image_edit.py`、`dewatermark.py`、`ltx2.py`、`chain_video.py`。

有关输出格式和阶段定义，请参阅下面的 **Progress Reporting** 部分。

## CRITICAL: Long-Running Tasks — Use yieldMs, Not background:true

**任何耗时超过 30 秒的工具命令都必须使用带有 `yieldMs` 的 `exec`，以便实时向用户报告进度。**这包括：批量 FLUX 生成、chain_video、SadTalker、音乐生成以及任何多场景流水线。

```
exec command:"cd ~/.openclaw/workspace/claude-code-video-toolkit && uv run tools/chain_video.py --output-dir /path/ --progress json ..." yieldMs:10000
```

**轮询循环：**
1. 使用 `yieldMs:10000` 的 `exec` 启动命令，每 10 秒将控制权交还给你
2. 读取 `--progress json` 输出——查找 `"stage":"item"`（场景完成）或 `"stage":"complete"`（全部完成）
3. 向用户报告进度（“Scene 05/30 complete, 17%”）
4. 再次轮询：`process action:poll sessionId:<id>`
5. 重复上述步骤，直到出现 `"stage":"complete"`

**原因：**你的代理运行会在你完成响应时结束。如果使用 `bash background:true`，你将无法报告进度——用户只能在提醒你之前一直看不到任何反馈。使用 `yieldMs` 可以让你持续处于循环中。

**绝对不要这样做：**
- `bash background:true command:"long running thing"`，然后承诺“会监控”——你无法做到这一点，因为本次运行会结束
- 将批处理拆分成多个工具调用，分散到不同消息中——每次调用之间你的运行都会结束
- 承诺“会继续自主执行”——如果没有外部触发，你实际上无法做到

## Setup

### Step 1: Check Current State

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv run tools/verify_setup.py
```

如果所有项目都显示 `[x]`，则跳过下面的“Quick Test”，继续执行。否则继续进行设置。

### Step 2: Install Python Dependencies

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv sync
```

注意：`uv sync` 会根据锁文件创建自己的 `.venv/`，因此可以绕过 Debian/Ubuntu 受管 Python 的限制（PEP 668）——无需使用 `--break-system-packages`。如果缺少 `uv`，请先安装：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 步骤 3：配置云 GPU 端点

工具包需要在 `.env` 中配置云 GPU 端点 URL。检查 `.env` 是否存在，以及其中是否包含 Modal 端点：

```bash
cat ~/.openclaw/workspace/claude-code-video-toolkit/.env | grep MODAL
```

如果已配置 Modal 端点，即可继续。如果尚未配置，**请让用户提供 Modal 端点 URL**，或设置 Modal：

```bash
uv sync --extra modal
uv run modal setup   # Opens browser for authentication

# Deploy each tool — capture the endpoint URL from output
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv run modal deploy docker/modal-qwen3-tts/app.py
uv run modal deploy docker/modal-flux2/app.py
uv run modal deploy docker/modal-music-gen/app.py
uv run modal deploy docker/modal-sadtalker/app.py
uv run modal deploy docker/modal-image-edit/app.py
uv run modal deploy docker/modal-upscale/app.py
uv run modal deploy docker/modal-propainter/app.py
uv run modal deploy docker/modal-ltx2/app.py      # Requires: uv run modal secret create huggingface-token HF_TOKEN=hf_...
```

**LTX-2 前置条件：**部署 LTX-2 之前，创建 HuggingFace secret 并接受 [Gemma 3 许可证](https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized)：

```bash
uv run modal secret create huggingface-token HF_TOKEN=hf_your_read_access_token
```

将每个 URL 添加到 `.env`：

```
ACEMUSIC_API_KEY=...                          # Free key from acemusic.ai/api-key (best music quality)
MODAL_QWEN3_TTS_ENDPOINT_URL=https://...modal.run
MODAL_FLUX2_ENDPOINT_URL=https://...modal.run
MODAL_MUSIC_GEN_ENDPOINT_URL=https://...modal.run
MODAL_SADTALKER_ENDPOINT_URL=https://...modal.run
MODAL_IMAGE_EDIT_ENDPOINT_URL=https://...modal.run
MODAL_UPSCALE_ENDPOINT_URL=https://...modal.run
MODAL_DEWATERMARK_ENDPOINT_URL=https://...modal.run
MODAL_LTX2_ENDPOINT_URL=https://...modal.run
```

可选但推荐配置 —— 使用 Cloudflare R2 实现可靠的文件传输：

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=video-toolkit
```

### 步骤 4：验证并快速测试

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv run tools/verify_setup.py
```

所有工具都应显示 `[x]`。然后运行快速测试，以确认 GPU 流水线正常工作：

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv run tools/qwen3_tts.py --text "Hello, this is a test." --speaker Ryan --tone warm --output /tmp/video-toolkit-test.mp3 --cloud modal
```

如果获得有效的 .mp3 文件，则表示设置完成。如果失败，请检查：
- `.env` 中是否包含正确的 `MODAL_QWEN3_TTS_ENDPOINT_URL`
- 运行 `uv run tools/verify_setup.py --json`，并检查 `modal_tools`，确认哪些端点缺失

**费用：**Modal 每月包含价值 $30 的免费计算额度。生成一个典型的 60 秒视频通常需要 $1-3。

---

## 创建视频

### 步骤 1：创建项目

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
cp -r templates/product-demo projects/PROJECT_NAME
cd projects/PROJECT_NAME
npm install
```

模板：`product-demo`（营销/讲解）、`sprint-review`、`sprint-review-v2`（可组合场景）。

### 第 2 步：编写配置

编辑 `projects/PROJECT_NAME/src/config/demo-config.ts`：

```typescript
export const demoConfig: ProductDemoConfig = {
  product: {
    name: 'My Product',
    tagline: 'What it does in one line',
    website: 'example.com',
  },
  scenes: [
    { type: 'title', durationSeconds: 9, content: { headline: '...', subheadline: '...' } },
    { type: 'problem', durationSeconds: 14, content: { headline: '...', problems: ['...', '...'] } },
    { type: 'solution', durationSeconds: 13, content: { headline: '...', highlights: ['...', '...'] } },
    { type: 'stats', durationSeconds: 12, content: { stats: [{value: '99%', label: '...'}, ...] } },
    { type: 'cta', durationSeconds: 10, content: { headline: '...', links: ['...'] } },
  ],
  audio: {
    backgroundMusicFile: 'audio/bg-music.mp3',
    backgroundMusicVolume: 0.12,
  },
};
```

场景类型：`title`、`problem`、`solution`、`demo`、`feature`、`stats`、`cta`。

**时长规则：**将 `durationSeconds` 估算为 `ceil(word_count / 2.5) + 2`。在第 4 步生成音频后，你需要对此进行调整。

### 第 3 步：编写配音脚本

创建 `projects/PROJECT_NAME/VOICEOVER-SCRIPT.md`：

```markdown
## Scene 1: Title (9s, ~17 words)
Build videos with AI. The product name toolkit makes it easy.

## Scene 2: Problem (14s, ~30 words)
The problem statement goes here. Keep it punchy and relatable.
```

**每个场景的词数预算：**`(durationSeconds - 2) * 2.5` 个词。减去的 2 秒包括 1 秒音频延迟和 1 秒留白。

### 第 4 步：生成资源

**重要：以下所有命令都必须从工具包根目录运行，而不是从项目目录运行。**

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
```

#### 4a. 背景音乐

默认提供商是 **acemusic**（官方云端 API，提供免费密钥）。无需 GPU。如果未配置，则回退到 Modal/RunPod 进行自托管。

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit

# Using acemusic cloud API (default — best quality, XL Turbo 4B model)
uv run tools/music_gen.py \
  --preset corporate-bg \
  --duration 90 \
  --output projects/PROJECT_NAME/public/audio/bg-music.mp3 \
  --progress json

# Or with custom prompt and thinking mode
uv run tools/music_gen.py \
  --prompt "Subtle ambient tech, soft synth pads" \
  --duration 90 \
  --output projects/PROJECT_NAME/public/audio/bg-music.mp3 \
  --progress json

# Fall back to self-hosted Modal if no acemusic key
uv run tools/music_gen.py \
  --preset corporate-bg \
  --duration 90 \
  --output projects/PROJECT_NAME/public/audio/bg-music.mp3 \
  --cloud modal --progress json
```

预设：`corporate-bg`、`upbeat-tech`、`ambient`、`dramatic`、`tension`、`hopeful`、`cta`、`lofi`。

设置：`echo "ACEMUSIC_API_KEY=your_key" >> .env`（在 acemusic.ai/api-key 获取免费密钥）。

#### 4b. 配音（按场景）

每个场景生成一个 `.mp3` 文件。不要生成单个配音文件。

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit

# Scene 01
uv run tools/qwen3_tts.py \
  --text "The voiceover text for scene one." \
  --speaker Ryan --tone warm \
  --output projects/PROJECT_NAME/public/audio/scenes/01.mp3 \
  --cloud modal --progress json

# Scene 02
uv run tools/qwen3_tts.py \
  --text "The voiceover text for scene two." \
  --speaker Ryan --tone warm \
  --output projects/PROJECT_NAME/public/audio/scenes/02.mp3 \
  --cloud modal --progress json

# ... repeat for each scene
```

**说话人：** `Ryan`、`Aiden`、`Vivian`、`Serena`、`Uncle_Fu`、`Dylan`、`Eric`、`Ono_Anna`、`Sohee`  
**语气：** `neutral`、`warm`、`professional`、`excited`、`calm`、`serious`、`storyteller`、`tutorial`

进行声音克隆（需要参考录音）：
```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv run tools/qwen3_tts.py \
  --text "Text to speak" \
  --ref-audio assets/voices/reference.m4a \
  --ref-text "Exact transcript of the reference audio" \
  --output projects/PROJECT_NAME/public/audio/scenes/01.mp3 \
  --cloud modal --progress json
```

#### 4c. 场景图片

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv run tools/flux2.py \
  --prompt "Dark tech background with blue geometric grid, cinematic lighting" \
  --width 1920 --height 1080 \
  --output projects/PROJECT_NAME/public/images/title-bg.png \
  --cloud modal --progress json
```

图片预设（使用 `--preset` 代替 `--prompt --width --height`）：
`title-bg`、`problem`、`solution`、`demo-bg`、`stats-bg`、`cta`、`thumbnail`、`portrait-bg`

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv run tools/flux2.py \
  --preset title-bg \
  --output projects/PROJECT_NAME/public/images/title-bg.png \
  --cloud modal --progress json
```

#### 4d. 视频片段 — B-Roll 和动态背景（可选）

为 B-roll 插入镜头、动态幻灯片背景或片头/片尾序列生成 AI 视频片段：

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit

# B-roll clip from text
uv run tools/ltx2.py \
  --prompt "Aerial drone shot over a European city at golden hour, cinematic wide angle" \
  --output projects/PROJECT_NAME/public/videos/broll-europe.mp4 \
  --cloud modal --progress json

# Animate a slide/screenshot (image-to-video)
uv run tools/ltx2.py \
  --prompt "Gentle particle effects, soft ambient light shifts, very slight camera drift" \
  --input projects/PROJECT_NAME/public/images/title-bg.png \
  --output projects/PROJECT_NAME/public/videos/animated-title.mp4 \
  --cloud modal --progress json

# Abstract intro/outro background
uv run tools/ltx2.py \
  --prompt "Dark moody abstract background with flowing blue light streaks, bokeh particles, cinematic" \
  --output projects/PROJECT_NAME/public/videos/intro-bg.mp4 \
  --cloud modal --progress json
```

在 Remotion 合成中使用 `<OffthreadVideo>`：
```tsx
<OffthreadVideo src={staticFile('videos/broll-europe.mp4')} />
```

**LTX-2 规则：**
- 每个片段最长约 8 秒（24fps 下为 193 帧）。默认约 5 秒（121 帧）。
- 宽度/高度必须可被 64 整除。默认值：768x512。
- 每个片段约 $0.20-0.25，生成时间约 2.5 分钟。
- 冷启动约需 60-90 秒。在已预热的 GPU 上生成后续片段会更快。
- 生成的音频仅为环境音——如需语音和音乐，请使用配音/音乐工具。
- 约 30% 的生成结果可能带有训练数据伪影（徽标/文本）。使用 `--seed` 重新运行以改变结果。

#### 4d-chain. 链式视频序列（视觉连续性）

生成一系列视频片段，使每个场景都从前一个场景的最后一帧自然衔接。**整个过程通过单条命令运行**——无需在场景之间手动调整。

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit

# Chain scenes 1-30 from a directory of FLUX images
uv run tools/chain_video.py \
  --scenes-dir projects/PROJECT_NAME/public/images/scenes/ \
  --output-dir projects/PROJECT_NAME/public/videos/chain/ \
  --prompt "Cinematic continuation, flowing transition" \
  --start 1 --end 30 \
  --progress json

# Resume from scene 10 (skips existing files automatically)
uv run tools/chain_video.py \
  --scenes-dir projects/PROJECT_NAME/public/images/scenes/ \
  --output-dir projects/PROJECT_NAME/public/videos/chain/ \
  --start 10 --end 30 \
  --progress json

# Per-scene prompts from JSON file
uv run tools/chain_video.py \
  --scenes-dir projects/PROJECT_NAME/public/images/scenes/ \
  --output-dir projects/PROJECT_NAME/public/videos/chain/ \
  --prompts-file projects/PROJECT_NAME/scenes.json \
  --progress json

# Chain from an existing clip (no scene images needed)
uv run tools/chain_video.py \
  --first-clip output/chain-04.mp4 \
  --output-dir output/ \
  --start 5 --end 30 \
  --prompt "Celtic mythology, flowing transition" \
  --progress json
```

**提示词文件格式**（`scenes.json`）：
```json
{"1": "Ancient stone circle at dawn", "2": "Celtic spirals emerge from stone", "3": "Portal opens with golden light"}
```

**链式规则：**
- 提取场景 N 的最后一帧，并通过 LTX-2 将其作为 `--input` 传入场景 N+1
- 自动跳过磁盘上已经存在的场景（可安全恢复运行）
- 如果链式处理失败，则回退到 `--scenes-dir` 中的场景图像
- 使用 `--prefix` 设置输出文件名前缀（默认值：`chain`）
- 每个场景约需 2.5 分钟，每个片段约 $0.20-0.25
- 额外参数（例如 `--negative-prompt`、`--seed`）会直接传递给 `ltx2.py`

**关键：链式序列中的风格漂移。**LTX-2 约有 30% 的训练数据污染（动漫/亚洲内容）。诸如“cinematic transition”之类的通用提示词会在连续 5-10 个场景后逐渐漂移为动漫风格。为防止这种情况：

1. **始终使用 `--prompts-file`**，为每个场景指定具体的提示词——不要为整个链式序列使用单个通用提示词
2. **始终添加 `--negative-prompt`**，排除不需要的风格：
   ```
   --negative-prompt "anime, manga, asian, cartoon, illustration, watermark, text, logo"
   ```
3. 每个场景的提示词都应包含**强有力的风格锚点**（例如 “Irish landscape, Celtic knotwork, oil painting style”），而不只是主体描述

**关键：使用 `yieldMs` 运行，以实时报告进度。** 不要将其拆分为按场景分别调用工具——OpenClaw 的 agent run 会在调用之间结束，导致序列停滞。相反，请使用带有 `yieldMs` 的 `exec`，这样你可以持续跟进并向用户转达进度：

```
exec command:"cd ~/.openclaw/workspace/claude-code-video-toolkit && uv run tools/chain_video.py --scenes-dir /path/to/images/ --output-dir /path/to/output/ --prompts-file scenes.json --progress json" yieldMs:10000
```

**工作原理：**
- `yieldMs:10000` 每 10 秒将控制权交还给你
- 读取 `--progress json` 的输出（stderr 上包含 stage/pct/msg 的 JSON Lines）
- 向用户报告进度（“场景 05/30 完成，17%”）
- 然后再次轮询：`process action:poll sessionId:<id>`
- 持续重复，直到出现 `"stage":"complete"`

**这是所有长时间运行工具命令的正确模式**（chain_video、batch flux、batch sadtalker 等）。绝不要使用 `bash background:true` 后置之不理——请使用 `exec` + `yieldMs` + `process poll` 循环，以便实时报告进度。

#### 4e. 口播头像（可选）

生成一张演示者头像，然后按场景生成动画片段：

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit

# 1. Generate portrait
uv run tools/flux2.py \
  --prompt "Professional presenter portrait, clean style, dark background, facing camera, upper body" \
  --width 1024 --height 576 \
  --output projects/PROJECT_NAME/public/images/presenter.png \
  --cloud modal --progress json

# 2. Generate per-scene narrator clips (one per scene, NOT one long video)
uv run tools/sadtalker.py \
  --image projects/PROJECT_NAME/public/images/presenter.png \
  --audio projects/PROJECT_NAME/public/audio/scenes/01.mp3 \
  --preprocess full --still --expression-scale 0.8 \
  --output projects/PROJECT_NAME/public/narrator-01.mp4 \
  --cloud modal --progress json

# Repeat for each scene that needs a narrator
```

**SadTalker 规则——请严格遵循：**
- **始终**使用 `--preprocess full`（默认的 `crop` 会输出正方形，宽高比不正确）
- **始终**使用 `--still`（可减少头部移动，观感更专业）
- **始终**按场景生成片段（每段 6-15 秒），绝不要生成一个长视频
- 处理时间：在 Modal A10G 上，每 10 秒音频约需 3-4 分钟
- `--expression-scale 0.8` 可使表情保持细微自然（范围为 0.0-1.5）

#### 4e. 图像编辑（可选）

从现有图像创建场景变体：

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv run tools/image_edit.py \
  --input projects/PROJECT_NAME/public/images/title-bg.png \
  --prompt "Make it darker with red tones, more ominous" \
  --output projects/PROJECT_NAME/public/images/problem-bg.png \
  --cloud modal --progress json
```

#### 4f. 放大（可选）

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv run tools/upscale.py \
  --input projects/PROJECT_NAME/public/images/some-image.png \
  --output projects/PROJECT_NAME/public/images/some-image-4x.png \
  --scale 4 --cloud modal --progress json
```

### 步骤 5：同步时长

**生成配音后始终执行此操作。** 音频时长与估算值不同。

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
for f in projects/PROJECT_NAME/public/audio/scenes/*.mp3; do
  echo "$(basename $f): $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")s"
done
```

将 `demo-config.ts` 中每个场景的 `durationSeconds` 更新为：`ceil(actual_audio_duration + 2)`。

示例：如果 `01.mp3` 为 6.8 秒，则将场景 1 的 `durationSeconds` 设置为 `9`（ceil(6.8 + 2) = 9）。

### 步骤 6：检查静帧

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit/projects/PROJECT_NAME
npx remotion still src/index.ts ProductDemo --frame=100 --output=/tmp/review-scene1.png
npx remotion still src/index.ts ProductDemo --frame=400 --output=/tmp/review-scene2.png
```

检查：文本截断、动画时序、旁白 PiP 的位置、背景对比度。

### 步骤 7：渲染

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit/projects/PROJECT_NAME
npm run render
```

**输出：** `out/ProductDemo.mp4`

---

## 组合模式

### 每个场景的音频

使用每个场景单独的音频，并延迟 1 秒（`from={30}` = 30 帧 = 在 30fps 下为 1 秒）：

```tsx
<Sequence from={30}>
  <Audio src={staticFile('audio/scenes/01.mp3')} volume={1} />
</Sequence>
```

### 每个场景的旁白 PiP

```tsx
<Sequence from={30}>
  <OffthreadVideo
    src={staticFile('narrator-01.mp4')}
    style={{ width: 320, height: 180, objectFit: 'cover' }}
    muted
  />
</Sequence>
```

**始终使用 `<OffthreadVideo>`，绝不要使用 `<video>`。** Remotion 要求使用其自有组件来实现逐帧精确渲染。

### 转场

```tsx
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { glitch } from '../../../lib/transitions/presentations/glitch';
import { lightLeak } from '../../../lib/transitions/presentations/light-leak';
```

**绝不要从 `lib/transitions` barrel 导入**——应直接从 `lib/transitions/presentations/` 导入自定义转场。

---

## 进度报告

所有云端 GPU 工具都支持结构化进度输出，以便进行自动化监控。

### 用法

在任意工具命令中添加 `--progress json`，即可在 stderr 上获取 JSON Lines：

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
uv run tools/music_gen.py \
  --preset corporate-bg --duration 60 \
  --output projects/PROJECT_NAME/public/audio/bg-music.mp3 \
  --progress json
```

### 输出格式

stderr 上的每一行都是一个 JSON 对象：

```json
{"ts":"14:23:15","stage":"submit","msg":"Sending to acemusic.ai (XL Turbo 4B, thinking: on)...","pct":null,"elapsed":0.0}
{"ts":"14:23:30","stage":"waiting","msg":"Waiting for acemusic.ai response... (15s)","pct":null,"elapsed":15.0}
{"ts":"14:23:45","stage":"waiting","msg":"Waiting for acemusic.ai response... (30s)","pct":null,"elapsed":30.0}
{"ts":"14:24:02","stage":"complete","msg":"Saved: bg-music.mp3 (245 KB, 60.1s)","pct":100,"elapsed":47.3}
```

### 阶段

| 阶段 | 含义 |
|-------|---------|
| `submit` | 作业已发送至提供商 |
| `queue` | RunPod：正在等待 GPU |
| `processing` | RunPod：GPU 正在处理 |
| `waiting` | 同步调用期间的心跳（acemusic、Modal） |
| `complete` | 作业成功完成 |
| `error` | 出现错误——检查 `msg` 获取详细信息 |
| `item` | 多项目进度（例如场景 3/7）——`pct` 已填充 |
| `cost` | 操作的预估成本 |

### 按提供商划分的行为

- **acemusic**：发出 `submit` → 定期发送 `waiting` 心跳（每 15 秒一次）→ `complete`
- **RunPod**：发出 `submit` → `queue` → `processing` → `complete`（每次轮询时）
- **Modal**：发出 `submit` → 定期发送 `waiting` 心跳 → `complete`

默认模式（`--progress human`）会以彩色终端输出显示相同的事件——现有行为不变。

---

## 错误恢复

| 问题 | 解决方案 |
|---------|----------|
| 工具命令失败并显示 "No module named..." | 在工具包根目录运行 `uv sync`，并通过 `uv run` 调用工具 |
| "MODAL_*_ENDPOINT_URL not configured" | 检查 `.env` 中是否包含端点 URL。运行 `uv run tools/verify_setup.py` |
| SadTalker 输出为正方形/被裁剪 | 忘记添加 `--preprocess full`。使用该标志重新运行 |
| 音频对于场景来说过短/过长 | 重新运行步骤 5（同步时间），并更新配置 |
| `npm run render` 失败 | 确保当前位于项目目录，而不是工具包根目录。先运行 `npm install` |
| Remotion 中出现 "Cannot find module" | 检查导入路径。自定义组件使用相对于 `../../../lib/` 的路径 |
| Modal 冷启动超时 | 空闲后的首次调用需要 30-120 秒。重试一次——第二次调用会使用预热后的 GPU |
| SadTalker 客户端超时（音频较长） | 客户端 HTTP 请求可能会在 Modal 完成之前超时。**Modal 仍会将结果上传到 R2。** 检查 `video-toolkit` R2 存储桶中的 `sadtalker/results/`，获取输出结果。使用 `.env` 中的 R2 凭据运行 `uv run python -c "import boto3; ..."` 以列出文件并生成预签名 URL |

---

## 成本估算（Modal）

| 工具 | 典型成本 | 备注 |
|------|-------------|-------|
| Qwen3-TTS | ~$0.01/场景 | 预热后的 GPU 上每个场景约需 20 秒 |
| FLUX.2 | ~$0.01/图像 | 预热后约 3 秒，冷启动约 30 秒 |
| ACE-Step | ~$0.02-0.05 | 取决于时长 |
| SadTalker | ~$0.05-0.20/场景 | 每 10 秒音频约需 3-4 分钟 |
| Qwen-Edit | ~$0.03-0.15 | 冷启动约 8 分钟（25GB 模型） |
| RealESRGAN | ~$0.005/图像 | 非常快 |
| LTX-2.3 | ~$0.20-0.25/片段 | 每 5 秒片段约需 2.5 分钟，使用 A100-80GB |

**一个 60 秒视频的总成本：**约为 $1-3，具体取决于场景和旁白片段数量。

Modal Starter 计划：每月 $30 的免费计算额度。应用在空闲时会缩容至零。