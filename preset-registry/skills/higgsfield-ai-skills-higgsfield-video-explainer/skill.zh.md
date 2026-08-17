---
version: 0.12.0
name: higgsfield-video-explainer
description: |
  Build a complete non-photoreal narrated explainer or story video from
  ordered 10-second blocks: one narrator, one universal style key, one Seed
  Audio take and one Gemini Omni clip per block, then server-side assembly
  with explainer_video. Use when: "make an explainer video", "explain this in
  a video", "turn this topic or document into a narrated video", "tell this
  story as an animated video", "make a faceless narrated video", or "show me
  explainer styles". Supports live CMS presets, custom style references,
  mascot/faceless modes, two aspects, and optional burned subtitles. NOT for:
  photoreal films, ads/UGC, talking heads, podcasts, motion typography reels,
  one-off clips without narration, or editing a finished video.
argument-hint: "[topic or source files] [duration] [language] [aspect ratio]"
allowed-tools: Bash
---
# Higgsfield 视频解说器

通过 Higgsfield CLI 运行 MCP 视频解说工作流。锁定一个视觉风格键，为每个 10 秒分块编写一句旁白和一个与之匹配的视觉提示词，先生成所有语音版本，再生成所有视频片段，然后立即使用 `explainer_video` 按顺序组装这些配对。

在此 Skill 中，绝不使用一体化的 `video_explainer` 作业。

## MCP 到 CLI 的映射

| MCP 工作流操作 | CLI 等效命令 |
|---|---|
| `get_explainer_presets` | `higgsfield preset list video-explainer --json` |
| `resolve_explainer_preset` | `higgsfield preset resolve video-explainer <preset_id> --json` |
| `generate_image` / `nano_banana_pro` | `higgsfield generate create nano_banana_2 ...` |
| `list_voices` | `higgsfield voices list --json` |
| `generate_audio` / `seed_audio` | `higgsfield generate create seed_audio ...` |
| `generate_video` / `gemini_omni` | `higgsfield generate create gemini_omni ...` |
| `job_status` | `--wait --json` 或 `higgsfield generate wait <job_id> --json` |
| `explainer_video` | `higgsfield generate create explainer_video ...` |

`nano_banana_2` 是 MCP 工作流所用 Nano Banana Pro 风格键模型的公开 CLI id。

## 初始化

1. 如果 `higgsfield` 不可用，请安装：

   ```bash
   curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh
   ```

2. 如果 `higgsfield account status` 执行失败，请让用户运行 `higgsfield auth login`，然后等待。
3. 首次提交前检查实时契约：

   ```bash
   higgsfield model get nano_banana_2
   higgsfield model get seed_audio
   higgsfield model get gemini_omni
   higgsfield model get explainer_video
   ```

## 阶段 0 — 先询问

按照以下顺序，在两个独立的对话轮次中收集选项。绝不要合并这两个轮次。

### 第 1 轮 — 仅选择风格

始终加载实时 CMS 目录：

```bash
higgsfield preset list video-explainer --json
```

展示预设名称及其缩略图/视频预览 URL。用一句简短的话请用户选择一个预设、描述自定义风格或附加风格参考图片，然后结束该轮对话。不要在同一轮中询问制作相关问题。风格选择是必需的；除非用户明确说“你来选”，否则绝不要擅自选择。

仅当请求中已包含 `explainer preset id: <uuid>` 时跳过此轮。确认该 UUID 存在于实时目录中，并将其保留至阶段 1。

### 第 2 轮 — 制作设置

仅在风格选定后，收集所有尚未确定的设置：

- 时长：一到十个整分钟。`N = duration_minutes × 6` 个固定的 10 秒分块。
- 旁白语言：默认为英语，但仍需提供选择。
- 角色：反复出现的吉祥物，或不露脸的风格化场景。始终询问。
- 宽高比：默认为 `16:9`，或选择 `9:16` 竖屏。
- 字幕：默认关闭。说明字幕会按每个有配音的分块收取 0.05 credit。如果启用，必须让用户选择 `patrick`、`caveat`、`marker` 或 `anton`；绝不要擅自选择。

每个选项都应由用户决定，除非他们明确委托你代为选择。

## 输入

- 主题或个人/哲学故事。
- 可选的本地源文档；编写脚本前先读取/提取其内容。它们是事实输入，而非生成媒体。
- 可选的预设 UUID，与自定义风格参考图像互斥。
- 可选的风格参考图像。仅使用其渲染风格和色彩分级；除非用户要求，否则绝不复制其中的人物、文本、徽标或物体。
- 阶段 0 中确定的时长、语言、角色模式、宽高比和字幕选项。

对于本地风格来源图像，使用重复的 `--image` 传入每个路径。对于网络图像，请先将其下载到本地，或使用已有的已上传媒体 ID。

## 硬性规则

- 确保每个视觉画面都严格采用非照片写实风格。在每个片段提示词中重复相同的 STYLE 描述和非写实负面提示词。
- 视频生成中不得包含任何口述内容。片段音频只能是环境音或音乐；不得包含对白、口型同步或内嵌旁白。
- 每个带标签的区块必须且只能使用一条旁白和一个片段。区块 N 的音频始终映射到区块 N 的视频。
- 为每个片段附加同一张风格键图像。
- 所有图像/视频提示词均使用英文编写。只有旁白使用所选语言。
- 编写脚本前先研究真实主题。不得虚构引语、日期、数字或事件。
- 必须在同一次运行中自动完成组装。仅返回零散片段即视为失败。

## 流程

| 阶段 | 输出 | CLI |
|---|---|---|
| 0 询问 | 先确定风格；然后确定时长、语言、角色、宽高比、字幕 | `preset list` + 用户问题 |
| R 研究 | 经核实的事实和来源 | 可用的研究工具 |
| 1 风格键 | 一张通用风格图像 | `preset resolve` 或 `nano_banana_2` |
| 2 旁白 | N 条带标签的旁白文本 | 推理 |
| 3 区块提示词 | N 条带标签的视频提示词 | 推理 |
| 4 语音 | 用户选择一种声音；生成 N 条音频 | `voices list` + `seed_audio` |
| 5 片段 | 生成 N 个 10 秒片段 | `gemini_omni` |
| 6 组装 | 一个最终 MP4 | `explainer_video` |

在阶段 1–3 之前阅读 `references/prompts.md`。

## 阶段 R — 研究

对于真实主题，使用可用的网络研究工具和权威来源，核实足以支撑每个区块的事实。保留一份简短的来源列表。绝不得仅凭记忆为事实讲解内容编写脚本。

对于个人故事，跳过网络研究，仅使用用户提供的细节。不得虚构任何事实。

## 阶段 1 — 创建或解析风格键

编写一个可复用的 STYLE 描述：媒介、调色板、线条/填充方式、纹理/完成效果，然后加上 `non-photorealistic, illustrated, not a photo, no live-action, no realism`。

### 已选择的 CMS 预设

将隐藏的风格图像解析到当前工作区：

```bash
higgsfield preset resolve video-explainer "<preset UUID>" --json
```

将返回的 `media_id` 保存为 `STYLE_KEY_ID`。跳过图像生成：此导入媒体即为风格键。基于返回的预设名称和强制性的非照片写实规则构建 STYLE 描述。不得根据预设名称重新创建预设。

预设参考会控制画面构图。如果它与阶段 0 中要求的宽高比冲突，请停止并让用户选择，而不是在不告知用户的情况下强行对抗参考图。

### 自定义风格或参考图像

仅生成一张关键图像。使用 `references/prompts.md` 中的抽象色板模板；启用角色模式时，则使用其吉祥物变体。为每个风格来源重复使用 `--image`：

```bash
higgsfield generate create nano_banana_2 \
  --prompt "<style-key prompt>" \
  --aspect_ratio 16:9 \
  --resolution 2k \
  --wait \
  --json
```

竖屏使用 `9:16`。将已完成图像任务的 UUID 保存为 `STYLE_KEY_ID`；后续 CLI 生成可以复用已完成任务的 UUID 作为图像参考。

## 阶段 2 — 编写旁白

使用选定的语言编写恰好 `N` 个带标签的旁白块：

```text
Block 1
<line spoken over clip 1>
Block 2
<line spoken over clip 2>
```

- 每个块一行，通常为 20–24 个单词，时长约 8–9 秒。
- 每次录音的时长应控制在约 9.5 秒以内。
- 仅使用直白的口语文本：不要使用时间码、情绪提示、括号说明或舞台指示。
- 用文字拼写数字。
- 使用具体明确的语气，绝不要说“在这个视频中”。
- 对于主题内容，应从吸引注意的开场逐步推进到最终收获。对于个人故事，应保留用户提供的细节和主人公。

## 阶段 3 — 编写匹配的视频提示词

使用 `references/prompts.md` 中的模板，编写恰好 `N` 个带标签的英文提示词：

```text
Block N
STYLE REFERENCE: Match the attached reference image EXACTLY. <same STYLE descriptor>
SCENE: <one scene and action matching Block N narration>
MOTION: <camera move and animation behavior>
AUDIO: <ambient SFX or music only; no voice, dialogue, or narration>
NEGATIVE: <style drift and realism bans; no lip-sync, captions, text, logos, or watermark>
```

对于吉祥物模式，第 1 个块中的角色应闭着嘴用手势打招呼，最后一个块应挥手告别，中间各块仅在有用时保持一致地客串出现。对于无脸模式，仅使用风格化场景。每个块只保留一个清晰的动作。

## 阶段 4 — 首先生成所有语音录音

列出可用的在线语音，展示可选项，然后等待用户选择一位旁白者：

```bash
higgsfield voices list --json
```

保留所选语音的准确 `id` 和 `type`（`preset` 或 `element`）。除非用户明确授权，否则绝不要虚构或自动选择语音。

为每个旁白块生成一个已完成的 `seed_audio` 任务，并始终使用同一个语音：

```bash
higgsfield generate create seed_audio \
  --prompt "<Block N narration only>" \
  --voice_type "<preset|element>" \
  --voice_id "<voice UUID>" \
  --wait \
  --json
```

按块的顺序记录每个音频任务的 UUID。仅重新生成失败或时长过长的录音。必要时可缩短该块的内容，或适度调整 `--speech_rate`。在全部 `N` 个音频任务完成之前，不要开始阶段 5。

## 阶段 5 — 随后生成所有片段

为每个块生成一个已完成的 10 秒 `gemini_omni` 片段。每次调用都附加同一个风格关键图：

```bash
higgsfield generate create gemini_omni \
  --prompt "<Block N video prompt>" \
  --image "<STYLE_KEY_ID>" \
  --duration 10 \
  --resolution 720p \
  --aspect_ratio 16:9 \
  --wait \
  --json
```

选择竖屏时使用 `9:16`。按分块顺序记录每个视频任务的 UUID。在此阶段内，互不依赖的任务可以并发运行，但音频阶段的屏障必须严格遵守。仅重新提交失败的分块。绝不能悄悄替换 `gemini_omni`；如果该模型不可用，请检查实时视频模型目录。

## 阶段 6 — 立即组装

创建 `blocks.json`，其中至少包含两组有序的分块对。CLI 模型契约要求使用带类型的引用，因此请使用通用的已完成任务类型：

```json
[
  {
    "video": {"id": "<clip 1 job UUID>", "type": "video_job"},
    "audio": {"id": "<voice 1 job UUID>", "type": "audio_job"}
  },
  {
    "video": {"id": "<clip 2 job UUID>", "type": "video_job"},
    "audio": {"id": "<voice 2 job UUID>", "type": "audio_job"}
  }
]
```

立即提交服务端组装器：

```bash
higgsfield generate create explainer_video \
  --items @blocks.json \
  --width 1280 \
  --height 720 \
  --wait \
  --json
```

竖屏视频使用 `--width 720 --height 1280`。启用字幕时，添加所选字体：

```bash
--subtitles '{"font":"patrick"}'
```

组装器会将每个分块精确保持为 10 秒：将较短的配音片段居中放置，对小幅超时的配音进行保持音高的安全加速，绝不拉伸视频，按顺序拼接分块，并可选择将定时字幕烧录到视频中。总时长精确为 `N × 10` 秒。

不要使用本地 ffmpeg、旧版组装脚本或一体化的 `video_explainer` 任务。

## 检查点与恢复

- 阶段 5 之前：必须具备一个风格键、恰好 `N` 条旁白文本和提示词、一个已选定的声音，以及 `N` 个已完成的音频任务。
- 阶段 6 之前：必须具备 `N` 个已完成的视频任务，并确保分块严格一一配对，不存在缺失或重复的 ID。
- 缺少预设：刷新 `preset list`；绝不要重复使用或伪造 ID。
- 预设解析失败：验证工作区选择，然后重试一次。
- 风格漂移或趋于写实：强化共享的 STYLE 和 NEGATIVE 文本，然后仅重新生成该片段。
- 超时：使用 `higgsfield generate wait <job_id> --json` 重新加入等待；绝不要重复创建仍在运行的任务。
- 连续两次相同的失败意味着必须更改提示词或参数。

## 交付

返回最终组装视频的 URL、精确时长、宽高比、旁白语言、所选风格、旁白声音、字幕状态，以及研究型主题的来源列表。除非用户提出要求，否则将中间任务 ID 和零散素材 URL 保持为内部信息。