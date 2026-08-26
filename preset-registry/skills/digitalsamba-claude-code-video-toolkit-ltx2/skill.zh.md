---
name: ltx2
description: AI video generation with LTX-2.3 22B — text-to-video, image-to-video clips for video production. Use when generating video clips, animating images, creating b-roll, animated backgrounds, or motion content. Triggers include video generation, animate image, b-roll, motion, video clip, text-to-video, image-to-video.
---
# LTX-2.3 视频生成

使用 LTX-2.3 22B DiT 模型，根据文本提示词或图像生成约 5 秒的视频片段。  
在 Modal（A100-80GB）上运行。需要在 `.env` 中配置 `MODAL_LTX2_ENDPOINT_URL`。

## 快速参考

```bash
# Text-to-video
uv run tools/ltx2.py --prompt "A sunset over the ocean, golden light on waves, cinematic" --output sunset.mp4

# Image-to-video (animate a still image)
uv run tools/ltx2.py --prompt "Gentle camera drift, soft ambient motion" --input photo.jpg --output animated.mp4

# Custom resolution and duration
uv run tools/ltx2.py --prompt "..." --width 1024 --height 576 --num-frames 161 --output wide.mp4

# Fast mode (fewer steps, quicker)
uv run tools/ltx2.py --prompt "..." --quality fast --output quick.mp4

# Reproducible output
uv run tools/ltx2.py --prompt "..." --seed 42 --output reproducible.mp4
```

## 参数

| 参数 | 默认值 | 描述 |
|-----------|---------|-------------|
| `--prompt` | （必需） | 视频的文本描述 |
| `--input` | - | 用于图像转视频的输入图像 |
| `--width` | 768 | 视频宽度（必须能被 64 整除） |
| `--height` | 512 | 视频高度（必须能被 64 整除） |
| `--num-frames` | 121 | 帧数，必须满足 `(n-1) % 8 == 0` |
| `--fps` | 24 | 每秒帧数 |
| `--quality` | standard | `standard`（30 步）或 `fast`（15 步） |
| `--steps` | 30 | 直接覆盖推理步数 |
| `--seed` | random | 用于确保结果可复现的种子 |
| `--output` | auto | 输出文件路径 |
| `--negative-prompt` | sensible default | 需要避免的内容 |
| `--lora` | none | 风格 LoRA 预设。目前可用：`crt-terminal`。 |

## 风格 LoRA

风格 LoRA 会使输出倾向于特定的视觉美学效果。它们已预先集成到 Modal 镜像中，并按请求进行选择；切换 LoRA 会触发流水线重建（每个容器生命周期内每次切换一次，约需 60 秒）。

### `crt-terminal` — CRT / 像素艺术终端

基础模型：LTX-2.3 22B，由 [@lovis93](https://huggingface.co/lovis93/crt-animation-terminal-ltx-2.3-lora) 训练（Apache 2.0）。

```bash
# Trigger word is auto-prepended — write the prompt normally
uv run tools/ltx2.py --lora crt-terminal \
  --prompt "a terminal typing out \"\\$ claude --continue\" character by character in glowing green pixel font, scanlines, phosphor glow, low choppy frame rate, hacker mood" \
  --output crt_claude.mp4
```

**该预设的变化：**
- 将 `crtanim,` 添加到提示词开头（这是该 LoRA 的触发词）
- 默认使用 1024×1024、121 帧（该 LoRA 的训练比例）
- 放宽默认负面提示词，因此屏幕上的文字不会被过滤掉

**提示词结构：** `<CRT aesthetic> → <color palette> → <animation style> → <subject> → <literal text in quotes> → <mood>`。将屏幕上的文字控制在 1–3 个单词以内——模型无法可靠地渲染较长的字符串。该 LoRA 更偏好固定机位；如果需要镜头移动，请明确提出。

## 有效帧数

`(n - 1) % 8 == 0`：25（约 1 秒）、49（约 2 秒）、73（约 3 秒）、97（约 4 秒）、**121（默认约 5 秒）**、161（约 6.7 秒）、193（实际最长约 8 秒）。

## 常见分辨率

| 分辨率 | 比例 | 备注 |
|------------|-------|-------|
| 768x512 | 3:2 | 默认，平衡性好 |
| 512x512 | 1:1 | 方形，速度最快 |
| 1024x576 | 16:9 | 宽屏 |
| 576x1024 | 9:16 | 肖像/竖屏 |

## 提示词指南

LTX-2 对电影化描述响应良好。请结合以下维度进行分层描述：

- **镜头：**“缓慢向前推进”，“航拍无人机镜头”，“跟拍镜头”，“静态广角”
- **光照：**“黄金时刻”，“电影感光照”，“霓虹灯照明”，“柔和的漫射光”
- **运动：**“……的延时摄影”，“慢动作”，“镜头轻柔漂移”，“逐渐过渡”
- **风格：**“使用 35mm 胶片拍摄”，“纪录片风格”，“简洁的极简美学”
- **负面提示：**始终会隐式避免“质量最差、模糊、抖动、水印、文字、标志”

将提示词控制在 200 个单词以内。请具体描述场景。

### 优秀提示词

```
# Atmospheric b-roll
"Aerial drone shot slowly flying over turquoise ocean waves breaking on white sand, golden hour sunlight, cinematic"

# Product/tech scene
"Close-up of hands typing on a mechanical keyboard, shallow depth of field, soft desk lamp lighting, cozy atmosphere"

# Abstract background
"Dark moody abstract background with flowing blue light streaks, subtle geometric grid, bokeh particles floating, cinematic tech atmosphere"

# Animate a portrait
"Professional headshot, subtle natural head movement, confident warm expression, studio lighting, shallow depth of field"

# Animate a slide/screenshot
"Gentle subtle particle effects floating across a presentation slide, soft ambient light shifts, very slight camera drift"
```

### 糟糕的提示词

```
# Too vague
"A cool video"

# Too many competing ideas
"A cat riding a skateboard while juggling fire on the moon during a thunderstorm"

# Describing text/UI (model can't render text reliably)
"A website showing the text 'Welcome to our platform'"
```

## 视频制作使用场景

### B-Roll 片段
生成时长为 5 秒、用于旁白场景之间转场的氛围镜头：
```bash
uv run tools/ltx2.py --prompt "Futuristic holographic interface, glowing data visualizations, clean workspace, cinematic" --output broll_tech.mp4
uv run tools/ltx2.py --prompt "Aerial view of European city at golden hour, modern architecture" --output broll_europe.mp4
```

### 动画幻灯片背景
输入幻灯片截图并添加细微的动态效果：
```bash
uv run tools/ltx2.py --prompt "Gentle particle effects, soft ambient light shifts, very slight camera drift" --input slide.png --output animated_slide.mp4
```

### 动画肖像
让静态头像动起来：
```bash
uv run tools/ltx2.py --prompt "Subtle natural head movement, warm expression, professional lighting" --input headshot.png --output animated_portrait.mp4
```

### 风格化角色客串（SadTalker 替代方案）
对于非写实面孔——奇幻角色、蒙面人物、浓密胡须、头盔、插画等——SadTalker 通常会产生诡异的效果或糟糕的唇形同步，因为它是在写实人类图像上训练的。当**唇形同步的精确度并非关键**时，LTX-2 的图生视频通常是更好的选择（只要画面中有某些东西在动，观众的大脑就会自动补足其中的差异）。提示词应围绕*运动 + 氛围*，而不是音素：

```bash
uv run tools/ltx2.py \
  --input character_portrait.png \
  --prompt "Ancient warrior speaks slowly with gravitas, beard shifts subtly, glowing aura pulses, embers drift past, slow head movement, cinematic close-up, mystical atmosphere" \
  --width 768 --height 768 \
  --output character_speaking.mp4
```

**LTX-2 优于 SadTalker 的情况：**
- 风格化／插画风／奇幻角色
- 浓密的面部毛发或遮挡嘴部的配饰
- 戴面具或头盔的人物
- 重氛围而非重精确度的简短客串台词
- 戏剧性旁白，而非对话

**SadTalker 仍然更具优势的情况：**
- 照片级真实感的人类演讲者
- 需要让嘴型与音素匹配的完整句子
- 教程／出镜讲解视频，观众实际上是在读唇

### 品牌片头／片尾
为标题卡生成抽象动态背景：
```bash
uv run tools/ltx2.py --prompt "Dark moody background with flowing blue and coral light streaks, bokeh particles, cinematic tech atmosphere, no text" --output intro_bg.mp4
```

### 与其他工具结合

LTX-2 生成原始片段。将其与工具包中的其他工具结合使用：

| 工作流 | 工具 |
|----------|-------|
| 生成片段 → 放大 | `ltx2.py` → `upscale.py` |
| 生成片段 → 添加到 Remotion | `ltx2.py` → 在合成中用作 `<OffthreadVideo>` |
| 生成图像 → 制作动画 | `flux2.py` → `ltx2.py --input` |
| 生成片段 → 提取音频 | `ltx2.py` → `ffmpeg -i clip.mp4 -vn audio.wav` |
| 生成片段 → 添加旁白 | `ltx2.py` → 与 `qwen3_tts.py` 的输出混音 |

## 技术细节

- **模型：** LTX-2.3 22B DiT（Lightricks），bf16
- **GPU：** Modal 上的 A100-80GB（约 $4.68/小时）
- **推理：** 每个片段约 2.5 分钟（768x512、121 帧、30 步）
- **成本：** 每个 5 秒片段约 $0.20-0.25
- **冷启动：** 约 60-90 秒（加载约 55GB 权重）
- **输出：** 带同步环境音频的 H.264 MP4（24fps）
- **最大时长：** 每个片段约 8 秒（193 帧）

### 已知限制

- **训练数据伪影：** 约 30% 的生成结果可能包含训练数据中的非预期徽标／文本。使用不同的 `--seed` 重新运行。
- **文本渲染：** 无法可靠地在视频中生成可读文本。请改用 Remotion 叠加层。
- **最大时长：** 每个片段约 8 秒。更长的内容需要拼接。
- **音频：** 生成的音频仅包含环境／氛围音。语音和音乐请使用旁白／音乐工具。
- **许可证：** Community License——收入低于 $10M 时可免费使用，超过该金额则需要商业许可证。

## 设置

```bash
# 1. Create Modal secret for HuggingFace (one-time)
uv run modal secret create huggingface-token HF_TOKEN=hf_your_token

# 2. Deploy (downloads ~55GB of weights, takes ~10 min)
uv run modal deploy docker/modal-ltx2/app.py

# 3. Save endpoint URL to .env
echo "MODAL_LTX2_ENDPOINT_URL=https://yourname--video-toolkit-ltx2-ltx2-generate.modal.run" >> .env

# 4. Test
uv run tools/ltx2.py --prompt "A candle flickering on a dark table, cinematic" --output test.mp4
```

**重要：** HuggingFace token 需要具有读取权限范围。部署前请接受 [Gemma 3 license](https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized)。未经身份验证的下载会受到严格的速率限制。