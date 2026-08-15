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
# 视频工具包

根据文本简报创建专业的讲解视频。该工具包使用云端 GPU（Modal 或 RunPod）上的开源 AI 模型来生成配音、图像、音乐和说话头像动画。Remotion（React）负责合成和渲染。

## 关键要求：工具包路径

工具包位于固定路径。**运行任何工具命令之前，务必先 `cd` 到此处。**

```bash
TOOLKIT=~/.openclaw/workspace/claude-code-video-toolkit
cd $TOOLKIT
```

**切勿从项目目录内部运行工具命令。** 工具会相对于工具包根目录解析路径。

## 关键要求：进度报告

**每条云端 GPU 工具命令都必须添加 `--progress json`。** 这会在 stderr 上提供结构化的 JSON Lines，以便你监控任务状态、检测卡住的任务，并实时向用户报告进度。

```bash
# CORRECT — always include --progress json
python3 tools/music_gen.py --preset corporate-bg --duration 60 --output bg.mp3 --progress json

# WRONG — no visibility into job status
python3 tools/music_gen.py --preset corporate-bg --duration 60 --output bg.mp3
```

支持 `--progress json` 的工具：`music_gen.py`、`qwen3_tts.py`、`flux2.py`、`upscale.py`、`sadtalker.py`、`image_edit.py`、`dewatermark.py`、`ltx2.py`、`chain_video.py`。

有关输出格式和阶段定义，请参阅下方的**进度报告**部分。

## 关键要求：长时间运行的任务——使用 yieldMs，而非 background:true

**任何耗时超过 30 秒的工具命令都必须通过带有 `yieldMs` 的 `exec` 执行，以便你能实时向用户报告进度。** 这包括：批量 FLUX 生成、chain_video、SadTalker、音乐生成，以及任何多场景流水线。

```
exec command:"cd ~/.openclaw/workspace/claude-code-video-toolkit && python3 tools/chain_video.py --output-dir /path/ --progress json ..." yieldMs:10000
```

**轮询循环：**
1. 带有 `yieldMs:10000` 的 `exec` 启动命令，并每隔 10 秒将控制权交还给你
2. 读取 `--progress json` 输出——查找 `"stage":"item"`（场景已完成）或 `"stage":"complete"`（全部完成）
3. 向用户报告进度（“场景 05/30 已完成，17%”）
4. 再次轮询：`process action:poll sessionId:<id>`
5. 重复上述步骤，直到出现 `"stage":"complete"`

**原因：** 当你结束响应时，智能体运行也会结束。如果使用 `bash background:true`，你将无法继续报告进度——用户只会看到一片沉默，直到他们再次提醒你。使用 `yieldMs`，你可以持续处于循环中。

**切勿这样做：**
- 执行 `bash background:true command:"long running thing"`，然后承诺会“监控”——你做不到，因为你的运行会结束
- 将一个批次拆分成多条单独的工具调用，并分散到多条消息中——每条消息之间你的运行都会结束
- 承诺“自主继续”——没有外部触发器，你实际上无法做到

## 设置

### 第 1 步：检查当前状态

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
python3 tools/verify_setup.py
```

如果所有项目都显示 `[x]`，请跳至下方的“快速测试”。否则，请继续设置。

### 第 2 步：安装 Python 依赖项

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
pip3 install --break-system-packages -r tools/requirements.txt
```

注意：在使用托管 Python（PEP 668）的 Debian/Ubuntu 上需要使用 `--break-system-packages`。在容器内使用是安全的。

### 步骤 3：配置云 GPU 端点

该工具包需要在 `.env` 中配置云 GPU 端点 URL。检查 `.env` 是否存在并包含 Modal 端点：

```bash
cat ~/.openclaw/workspace/claude-code-video-toolkit/.env | grep MODAL
```

如果已配置 Modal 端点，则准备工作已经完成。如果尚未配置，**请用户提供 Modal 端点 URL**，或设置 Modal：

```bash
pip3 install --break-system-packages modal
python3 -m modal setup   # Opens browser for authentication

# Deploy each tool — capture the endpoint URL from output
cd ~/.openclaw/workspace/claude-code-video-toolkit
modal deploy docker/modal-qwen3-tts/app.py
modal deploy docker/modal-flux2/app.py
modal deploy docker/modal-music-gen/app.py
modal deploy docker/modal-sadtalker/app.py
modal deploy docker/modal-image-edit/app.py
modal deploy docker/modal-upscale/app.py
modal deploy docker/modal-propainter/app.py
modal deploy docker/modal-ltx2/app.py      # Requires: modal secret create huggingface-token HF_TOKEN=hf_...
```

**LTX-2 前置条件：**部署 LTX-2 之前，请创建 HuggingFace 密钥并接受 [Gemma 3 许可证](https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized)：
```bash
modal secret create huggingface-token HF_TOKEN=hf_your_read_access_token
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

可选但推荐——使用 Cloudflare R2 实现可靠的文件传输：
```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=video-toolkit
```

### 步骤 4：验证并快速测试

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
python3 tools/verify_setup.py
```

所有工具都应显示 `[x]`。然后运行快速测试，确认 GPU 流水线可以正常工作：

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
python3 tools/qwen3_tts.py --text "Hello, this is a test." --speaker Ryan --tone warm --output /tmp/video-toolkit-test.mp3 --cloud modal
```

如果获得有效的 .mp3 文件，则设置完成。如果失败，请检查：
- `.env` 中是否包含正确的 `MODAL_QWEN3_TTS_ENDPOINT_URL`
- 运行 `python3 tools/verify_setup.py --json`，并检查 `modal_tools` 以确定缺少哪些端点

**费用：**Modal 每月包含价值 $30 的免费计算额度。一个典型的 60 秒视频费用为 $1-3。

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

**时长规则：** 按照 `ceil(word_count / 2.5) + 2` 估算 `durationSeconds`。在第 4 步生成音频后，你需要对此进行调整。

### 第 3 步：编写旁白脚本

创建 `projects/PROJECT_NAME/VOICEOVER-SCRIPT.md`：

```markdown
## Scene 1: Title (9s, ~17 words)
Build videos with AI. The product name toolkit makes it easy.

## Scene 2: Problem (14s, ~30 words)
The problem statement goes here. Keep it punchy and relatable.
```

**每个场景的字数预算：** `(durationSeconds - 2) * 2.5` 个单词。减去的 2 秒包括 1 秒音频延迟和 1 秒留白。

### 第 4 步：生成素材

**关键：以下所有命令都必须从工具包根目录运行，而不是项目目录。**

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
```

#### 4a. 背景音乐

默认提供商为 **acemusic**（官方云 API，可免费获取密钥）。无需 GPU。若不可用，则回退到 Modal/RunPod 自托管方案。

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit

# Using acemusic cloud API (default — best quality, XL Turbo 4B model)
python3 tools/music_gen.py \
  --preset corporate-bg \
  --duration 90 \
  --output projects/PROJECT_NAME/public/audio/bg-music.mp3 \
  --progress json

# Or with custom prompt and thinking mode
python3 tools/music_gen.py \
  --prompt "Subtle ambient tech, soft synth pads" \
  --duration 90 \
  --output projects/PROJECT_NAME/public/audio/bg-music.mp3 \
  --progress json

# Fall back to self-hosted Modal if no acemusic key
python3 tools/music_gen.py \
  --preset corporate-bg \
  --duration 90 \
  --output projects/PROJECT_NAME/public/audio/bg-music.mp3 \
  --cloud modal --progress json
```

预设：`corporate-bg`、`upbeat-tech`、`ambient`、`dramatic`、`tension`、`hopeful`、`cta`、`lofi`。

设置：`echo "ACEMUSIC_API_KEY=your_key" >> .env`（可在 acemusic.ai/api-key 免费获取密钥）。

#### 4b. 旁白（逐场景）

每个场景生成一个独立的 .mp3 文件。不要生成单个旁白文件。

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit

# Scene 01
python3 tools/qwen3_tts.py \
  --text "The voiceover text for scene one." \
  --speaker Ryan --tone warm \
  --output projects/PROJECT_NAME/public/audio/scenes/01.mp3 \
  --cloud modal --progress json

# Scene 02
python3 tools/qwen3_tts.py \
  --text "The voiceover text for scene two." \
  --speaker Ryan --tone warm \
  --output projects/PROJECT_NAME/public/audio/scenes/02.mp3 \
  --cloud modal --progress json

# ... repeat for each scene
```

**说话人：** `Ryan`、`Aiden`、`Vivian`、`Serena`、`Uncle_Fu`、`Dylan`、`Eric`、`Ono_Anna`、`Sohee`
**语气：** `neutral`、`warm`、`professional`、`excited`、`calm`、`serious`、`storyteller`、`tutorial`

对于声音克隆（需要参考录音）：
```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
python3 tools/qwen3_tts.py \
  --text "Text to speak" \
  --ref-audio assets/voices/reference.m4a \
  --ref-text "Exact transcript of the reference audio" \
  --output projects/PROJECT_NAME/public/audio/scenes/01.mp3 \
  --cloud modal --progress json
```

#### 4c. 场景图像

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
python3 tools/flux2.py \
  --prompt "Dark tech background with blue geometric grid, cinematic lighting" \
  --width 1920 --height 1080 \
  --output projects/PROJECT_NAME/public/images/title-bg.png \
  --cloud modal --progress json
```

图像预设（使用 `--preset` 代替 `--prompt --width --height`）：
`title-bg`、`problem`、`solution`、`demo-bg`、`stats-bg`、`cta`、`thumbnail`、`portrait-bg`

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
python3 tools/flux2.py \
  --preset title-bg \
  --output projects/PROJECT_NAME/public/images/title-bg.png \
  --cloud modal --progress json
```

#### 4d. 视频片段——B-Roll 与动态背景（可选）

为 B-Roll 插入镜头、动态幻灯片背景或片头/片尾序列生成 AI 视频片段：

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit

# B-roll clip from text
python3 tools/ltx2.py \
  --prompt "Aerial drone shot over a European city at golden hour, cinematic wide angle" \
  --output projects/PROJECT_NAME/public/videos/broll-europe.mp4 \
  --cloud modal --progress json

# Animate a slide/screenshot (image-to-video)
python3 tools/ltx2.py \
  --prompt "Gentle particle effects, soft ambient light shifts, very slight camera drift" \
  --input projects/PROJECT_NAME/public/images/title-bg.png \
  --output projects/PROJECT_NAME/public/videos/animated-title.mp4 \
  --cloud modal --progress json

# Abstract intro/outro background
python3 tools/ltx2.py \
  --prompt "Dark moody abstract background with flowing blue light streaks, bokeh particles, cinematic" \
  --output projects/PROJECT_NAME/public/videos/intro-bg.mp4 \
  --cloud modal --progress json
```

在 Remotion 合成中通过 `<OffthreadVideo>` 使用：
```tsx
<OffthreadVideo src={staticFile('videos/broll-europe.mp4')} />
```

**LTX-2 规则：**
- 每个片段最长约 8 秒（24fps 下为 193 帧）。默认为约 5 秒（121 帧）。
- 宽度/高度必须能被 64 整除。默认值：768x512。
- 每个片段约 $0.20-0.25，生成时间约 2.5 分钟。
- 冷启动约需 60-90 秒。在已预热的 GPU 上生成后续片段会更快。
- 生成的音频仅包含环境声——请使用旁白/音乐工具制作语音和音乐。
- 约 30% 的生成结果可能包含训练数据伪影（徽标/文本）。使用 `--seed` 重新运行可获得不同结果。

#### 4d-chain. 链式视频序列（视觉连续性）

生成一系列视频片段，使每个场景都从前一个场景的最后一帧自然衔接。**此操作通过单条命令运行**——无需在场景之间手动调整。

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit

# Chain scenes 1-30 from a directory of FLUX images
python3 tools/chain_video.py \
  --scenes-dir projects/PROJECT_NAME/public/images/scenes/ \
  --output-dir projects/PROJECT_NAME/public/videos/chain/ \
  --prompt "Cinematic continuation, flowing transition" \
  --start 1 --end 30 \
  --progress json

# Resume from scene 10 (skips existing files automatically)
python3 tools/chain_video.py \
  --scenes-dir projects/PROJECT_NAME/public/images/scenes/ \
  --output-dir projects/PROJECT_NAME/public/videos/chain/ \
  --start 10 --end 30 \
  --progress json

# Per-scene prompts from JSON file
python3 tools/chain_video.py \
  --scenes-dir projects/PROJECT_NAME/public/images/scenes/ \
  --output-dir projects/PROJECT_NAME/public/videos/chain/ \
  --prompts-file projects/PROJECT_NAME/scenes.json \
  --progress json

# Chain from an existing clip (no scene images needed)
python3 tools/chain_video.py \
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

**串联规则：**
- 从场景 N 中提取最后一帧，并通过 LTX-2 将其作为 `--input` 传给场景 N+1
- 跳过磁盘上已存在的场景（可安全地恢复执行）
- 如果串联失败，则回退使用 `--scenes-dir` 中的场景图像
- 使用 `--prefix` 设置输出文件名前缀（默认值：`chain`）
- 每个场景约需 2.5 分钟，每个片段约需 0.20–0.25 美元
- 额外参数（例如 `--negative-prompt`、`--seed`）会原样传递给 ltx2.py

**关键：串联序列中的风格漂移。** LTX-2 的训练数据中约有 30% 的污染数据（动漫/亚洲内容）。使用类似“cinematic transition”这样的通用提示词，会导致风格在串联 5–10 个场景后逐渐偏向动漫美学。为防止这种情况：

1. **始终使用 `--prompts-file`**，为每个场景提供具体的提示词——切勿为整个串联使用单个通用提示词
2. **始终添加 `--negative-prompt`**，以排除不需要的风格：
   ```
   --negative-prompt "anime, manga, asian, cartoon, illustration, watermark, text, logo"
   ```
3. 每个场景的提示词都应包含**强风格锚点**（例如“Irish landscape, Celtic knotwork, oil painting style”），而不仅仅是主体描述

**关键：使用 `yieldMs` 运行，以实时报告进度。** 不要将其拆分成逐场景的工具调用——OpenClaw 的代理运行会在调用之间结束，导致序列停滞。应改用带有 `yieldMs` 的 `exec`，这样你就能持续参与执行过程，并向用户转达进度：

```
exec command:"cd ~/.openclaw/workspace/claude-code-video-toolkit && python3 tools/chain_video.py --scenes-dir /path/to/images/ --output-dir /path/to/output/ --prompts-file scenes.json --progress json" yieldMs:10000
```

**工作原理：**
- `yieldMs:10000` 每 10 秒将控制权交还给你
- 读取 `--progress json` 的输出（stderr 上包含 stage/pct/msg 的 JSON Lines）
- 向用户报告进度（“场景 05/30 已完成，17%”）
- 然后再次轮询：`process action:poll sessionId:<id>`
- 重复此操作，直到出现 `"stage":"complete"`

**这是所有长时间运行工具命令的正确模式**（chain_video、批量 flux、批量 sadtalker 等）。绝不要使用 `bash background:true` 后就置之不理——应使用 `exec` + `yieldMs` + `process poll` 循环，以便实时报告进度。

#### 4e. 口播讲解员（可选）

生成演示者肖像，然后为每个场景制作动画片段：

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit

# 1. Generate portrait
python3 tools/flux2.py \
  --prompt "Professional presenter portrait, clean style, dark background, facing camera, upper body" \
  --width 1024 --height 576 \
  --output projects/PROJECT_NAME/public/images/presenter.png \
  --cloud modal --progress json

# 2. Generate per-scene narrator clips (one per scene, NOT one long video)
python3 tools/sadtalker.py \
  --image projects/PROJECT_NAME/public/images/presenter.png \
  --audio projects/PROJECT_NAME/public/audio/scenes/01.mp3 \
  --preprocess full --still --expression-scale 0.8 \
  --output projects/PROJECT_NAME/public/narrator-01.mp4 \
  --cloud modal --progress json

# Repeat for each scene that needs a narrator
```

**SadTalker 规则——请严格遵循：**
- **始终**使用 `--preprocess full`（默认的 `crop` 会输出正方形，宽高比不正确）
- **始终**使用 `--still`（减少头部移动，呈现更专业的效果）
- **始终**为每个场景单独生成片段（每段 6-15 秒），绝不要生成一个长视频
- 处理时间：在 Modal A10G 上，每 10 秒音频约需 3-4 分钟
- `--expression-scale 0.8` 可使表情保持细微自然（范围为 0.0-1.5）

#### 4e. 图像编辑（可选）

基于现有图像创建场景变体：

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
python3 tools/image_edit.py \
  --input projects/PROJECT_NAME/public/images/title-bg.png \
  --prompt "Make it darker with red tones, more ominous" \
  --output projects/PROJECT_NAME/public/images/problem-bg.png \
  --cloud modal --progress json
```

#### 4f. 图像放大（可选）

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
python3 tools/upscale.py \
  --input projects/PROJECT_NAME/public/images/some-image.png \
  --output projects/PROJECT_NAME/public/images/some-image-4x.png \
  --scale 4 --cloud modal --progress json
```

### 第 5 步：同步时间

**生成旁白后务必执行此步骤。** 音频时长与预估值会有所不同。

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
for f in projects/PROJECT_NAME/public/audio/scenes/*.mp3; do
  echo "$(basename $f): $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")s"
done
```

将 `demo-config.ts` 中每个场景的 `durationSeconds` 更新为：`ceil(actual_audio_duration + 2)`。

示例：如果 `01.mp3` 的时长为 6.8 秒，则将场景 1 的 `durationSeconds` 设置为 `9`（ceil(6.8 + 2) = 9）。

### 第 6 步：检查静止帧

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit/projects/PROJECT_NAME
npx remotion still src/index.ts ProductDemo --frame=100 --output=/tmp/review-scene1.png
npx remotion still src/index.ts ProductDemo --frame=400 --output=/tmp/review-scene2.png
```

检查：文本截断、动画时序、旁白画中画位置、背景对比度。

### 步骤 7：渲染

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit/projects/PROJECT_NAME
npm run render
```

**输出：** `out/ProductDemo.mp4`

---

## 合成模式

### 每场景音频

使用延迟 1 秒的每场景音频（`from={30}` = 30 帧 = 30fps 下的 1 秒）：

```tsx
<Sequence from={30}>
  <Audio src={staticFile('audio/scenes/01.mp3')} volume={1} />
</Sequence>
```

### 每场景旁白画中画

```tsx
<Sequence from={30}>
  <OffthreadVideo
    src={staticFile('narrator-01.mp4')}
    style={{ width: 320, height: 180, objectFit: 'cover' }}
    muted
  />
</Sequence>
```

**始终使用 `<OffthreadVideo>`，绝不要使用 `<video>`。** Remotion 需要使用其自有组件来实现帧精确渲染。

### 转场

```tsx
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { glitch } from '../../../lib/transitions/presentations/glitch';
import { lightLeak } from '../../../lib/transitions/presentations/light-leak';
```

**绝不要从 `lib/transitions` 桶文件导入**——请直接从 `lib/transitions/presentations/` 导入自定义转场。

---

## 进度报告

所有云端 GPU 工具均支持结构化进度输出，以便进行自动化监控。

### 用法

在任意工具命令中添加 `--progress json`，即可在 stderr 上获取 JSON Lines：

```bash
cd ~/.openclaw/workspace/claude-code-video-toolkit
python3 tools/music_gen.py \
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
| `complete` | 作业已成功完成 |
| `error` | 出现错误——请检查 `msg` 了解详情 |
| `item` | 多项目进度（例如场景 3/7）——`pct` 中会填充相应值 |
| `cost` | 操作的预估成本 |

### 各提供商的行为

- **acemusic**：依次发出 `submit` → 定期 `waiting` 心跳（每 15 秒一次）→ `complete`
- **RunPod**：依次发出 `submit` → `queue` → `processing` → `complete`（每次轮询时）
- **Modal**：依次发出 `submit` → 定期 `waiting` 心跳 → `complete`

默认模式（`--progress human`）会以彩色终端输出显示相同事件——现有行为不会发生变化。

---

## 错误恢复

| 问题 | 解决方案 |
|---------|----------|
| 工具命令失败并显示 "No module named..." | 在工具包根目录运行 `pip3 install --break-system-packages -r tools/requirements.txt` |
| "MODAL_*_ENDPOINT_URL not configured" | 检查 `.env` 中是否包含端点 URL。运行 `python3 tools/verify_setup.py` |
| SadTalker 输出为正方形或被裁剪 | 你忘记添加 `--preprocess full`。使用该标志重新运行 |
| 音频对于场景而言太短或太长 | 重新运行第 5 步（同步时间），并更新配置 |
| `npm run render` 失败 | 确保你位于项目目录，而不是工具包根目录。先运行 `npm install` |
| Remotion 中出现 "Cannot find module" | 检查导入路径。自定义组件使用相对路径 `../../../lib/` |
| Modal 冷启动超时 | 空闲后的首次调用需要 30–120 秒。重试一次——第二次调用将使用已预热的 GPU |
| SadTalker 客户端超时（长音频） | 客户端 HTTP 请求可能会在 Modal 完成之前超时。**Modal 仍会将结果上传到 R2。**在 `video-toolkit` R2 存储桶的 `sadtalker/results/` 中查找输出。使用 `python3 -c "import boto3; ..."` 并配合 `.env` 中的 R2 凭据来列出文件并生成预签名 URL |

---

## 成本估算（Modal）

| 工具 | 典型成本 | 备注 |
|------|-------------|-------|
| Qwen3-TTS | 约 $0.01/场景 | GPU 已预热时每个场景约需 20 秒 |
| FLUX.2 | 约 $0.01/张图片 | 已预热时约 3 秒，冷启动时约 30 秒 |
| ACE-Step | 约 $0.02–0.05 | 取决于时长 |
| SadTalker | 约 $0.05–0.20/场景 | 每 10 秒音频约需 3–4 分钟 |
| Qwen-Edit | 约 $0.03–0.15 | 冷启动约需 8 分钟（25GB 模型） |
| RealESRGAN | 约 $0.005/张图片 | 速度非常快 |
| LTX-2.3 | 约 $0.20–0.25/片段 | 每个 5 秒片段约需 2.5 分钟，A100-80GB |

**一个 60 秒视频的总成本：**约 $1–3，具体取决于场景和旁白人物片段。

Modal Starter 计划：每月提供价值 $30 的免费计算额度。应用在空闲时会缩容至零。