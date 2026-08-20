---
name: talking-head-recut
description: Package an existing talking-head / interview / podcast video with timed, designed GRAPHIC OVERLAY cards — kinetic titles, lower-thirds, data callouts, quotes, side panels, picture-in-picture — synced to the transcript, on a 16:9 / 9:16 / 4:5 canvas of your choice; the clip plays untouched underneath. Trigger on "graphic overlays", "on-screen graphics", "package / dress up my video". Not plain subtitles (/embedded-captions). Unclear → /hyperframes.
---
> **首先，保持此技能为最新版本——静默运行，无需询问：** `npx hyperframes skills update talking-head-recut`。当所有内容均为最新时会快速无操作；否则，会在你依赖此技能之前刷新该技能及其所依赖的核心领域技能。

# Talking Head 再剪辑

Talking Head 再剪辑会接收一段**完整播放**的本地视频，并在其上叠加一系列定时设计的**图形卡片**——标题、下三分之一字幕条、数据标注、引用、侧边面板、画中画——与所说内容同步。智能体负责设计卡片（时机 + 内容），并在对话中**直接编写每张卡片的 HTML**，随后组装成单个合成 HTML，并通过 `hyperframes` 将其渲染为 MP4。没有固定的原型列表，也没有规定的卡片结构——叠加内容应源自转录文本实际表达的内容。

> **入口是 `/hyperframes`。** 此技能将**现有的出镜讲话片段**与**设计好的图形卡片**（标题、下三分之一字幕条、数据标注、引用、侧边面板、PiP）组合——而不是普通字幕（以文本呈现的口语内容）。**视频片段保持原样播放。** 任何其他意图——普通字幕、独立图形、从零开始制作的视频——或任何不确定情况 → 请先阅读 `/hyperframes`：意图层负责所有路由决策。

> **`embedded-captions` 的图形包装同级技能。** 字幕将_说出的文字_
> 作为可读字幕添加；此技能则在播放的视频上添加_设计好的图形_。
> 普通字幕 → `embedded-captions`。从零开始制作视频 → 创作
> 工作流（`product-launch-video` / `faceless-explainer` / …）。

通过 `/hyperframes` 路由时，意图层仅确认输入内容（使用哪个视频片段），并**声明**将渲染策略问题延后询问——画幅比例、布局、风格组和卡片数量均保留至第 7 步，届时探测到的视频素材和转录文本将为推荐方案提供依据；该层的运行形态问题不适用。如存在 `BRIEF.md`，其中会包含已确认的输入内容和任何用户备注——请先阅读它。

工作目录中可检查的中间文件：

- `metadata.json` — 时长 / 宽度 / 高度 / fps
- `audio.mp3` — 提取的音频
- `transcript.json` — 平铺的**词语数组** `[{ text, start, end }, …]`（Whisper；没有 `segments`，也没有 `words` 包装器）
- `storyboard.json` — 轻量级卡片大纲（智能体的计划）
- `public/cards/card-XX.html` — 每张卡片对应一个 HTML 片段
- `public/index.html` — 最终组装的合成内容
- `output.mp4` — 渲染的视频

## CLI 解析

```bash
# hyperframes — transcription (local Whisper) + rendering the assembled HTML to MP4
npx hyperframes --help
```

此技能完全通过 **hyperframes** CLI 和系统 `ffmpeg` / `ffprobe` 运行。
转录使用通过 `hyperframes transcribe` 调用的本地 **Whisper**——无需第三方
服务、API 密钥或受速率限制的代理。

## 工作流

### 1. 检查环境

```bash
npx hyperframes doctor          # ffmpeg, headless browser, render deps
# confirm bundled assets:
ls "<SKILL_DIR>/assets/fonts" "<SKILL_DIR>/assets/vendor/gsap.min.js"
```

必需：

- `ffmpeg` / `ffprobe`（系统）
- `<SKILL_DIR>/assets/fonts/*.woff2`、`<SKILL_DIR>/assets/vendor/gsap.min.js`（随此 skill 一起打包，在第 9 步暂存到工作目录中）

转录不需要密钥——`hyperframes transcribe` 在本地运行 Whisper（第 4 步）。

在 macOS 上，强烈建议为 `hyperframes render` 设置：

```bash
export PRODUCER_BROWSER_GPU_MODE=hardware
```

### 2. 创建工作目录

所有产物都位于 `videos/<project-name>/` 下——这与其他
视频工作流（`product-launch-video` / `faceless-explainer` / `pr-to-video`）采用相同的约定。将 cwd 保持在工作区根目录；以下所有操作都会写入这一子目录。

```bash
VIDEO_PATH="/absolute/path/input.mp4"
WORK_DIR="videos/$(basename "$VIDEO_PATH" | sed 's/\.[^.]*$//')"
mkdir -p "$WORK_DIR"
```

### 3. 提取音频和元数据

```bash
# metadata — duration / width / height / fps
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate \
  -show_entries format=duration -of json "$VIDEO_PATH" > "$WORK_DIR/metadata.json"
# audio
ffmpeg -y -i "$VIDEO_PATH" -vn -acodec libmp3lame -q:a 2 "$WORK_DIR/audio.mp3"
```

输出：`metadata.json`（读取 `width`/`height`/`duration`；fps = 对 `r_frame_rate`
分数求值，例如 `30000/1001 → 29.97`）+ `audio.mp3`。

### 4. 转录

```bash
npx hyperframes transcribe "$WORK_DIR/audio.mp3" -d "$WORK_DIR" --json --model small.en
```

本地 **Whisper**——无需 API 密钥、无需代理、没有速率限制。它会向工作目录写入一个词级别的
`transcript.json`（词 `text` + `start` / `end` 时间戳）。
请读取它以获取驱动第 6 步卡片时序的词语 / 句子时间；如果需要片段级
区块，请自行按标点 / 停顿将词语分组成句子。

**限制在媒体时长内。** Whisper 可能会返回最后一个词的 `end`，略微超过
实际片段长度——将每张卡片的 `endSec` 和 `composition.durationSeconds` 限制为
`metadata.json` 中的时长，否则渲染结果会在视频之后显示一段黑屏。

### 5. 修正转录文本

`transcript.json` 是一个**扁平的词对象数组**——`[{ "text": "...", "start": s, "end": s }, …]`（没有 `segments` 数组，也没有 `words` 包装器；每个词的键是 **`text`**）。读取它并修正明显的 ASR 错误：

- 同音词、产品名称、技术术语、标点
- 原地编辑词语的 `text`；**保留其 `start` / `end`** 时间戳
- 没有预先分组的 `segments` 数组——当你需要用于卡片时序的片段级区块时，**请自行将词语分组成句子**（按句末标点 / 停顿切分）

### 6. 起草轻量级分镜（在聊天中）

**不涉及 CLI。** 读取 `transcript.json` + `metadata.json`，然后直接设计
卡片。`storyboard.json` 是仅供代理内部使用的规划产物
——没有任何 CLI 命令会使用它；它的存在是为了让你在编写每张卡片的 HTML 前，
能够清晰地思考时序和内容。请保持结构与下方示例一致，以便相同的大纲能够驱动你在第 9 步编写的合成内容：

```json
{
  "schemaVersion": 3,
  "composition": {
    "fps": 30,
    "width": 1080,
    "height": 1920,
    "durationSeconds": 121.2,
    "layout": "portrait",
    "themeId": "noir",
    "seed": 42
  },
  "videoTrack": {
    "sourcePath": "input-video.mp4",
    "startSec": 0,
    "endSec": 121.2,
    "bounds": { "x": 0, "y": 0, "width": 1080, "height": 1920 }
  },
  "subtitles": { "enabled": false },
  "cards": [
    {
      "id": "card-01",
      "intent": "Hook with the speaker's anxious midnight question",
      "startSec": 0.5,
      "endSec": 13.0,
      "accentIndex": 0,
      "zone": "fullscreen",
      "contentHints": {
        "kicker": "AN HONEST QUESTION",
        "title": "The soul-searching question at 11 PM",
        "detail": "Client's 60-second voice message: 'If the RMB appreciates, does that mean my USD policy is a terrible loss?'"
      }
    }
  ]
}
```

**必填 Card 字段：**

| 字段                    | 类型                                       | 用途                                                                                               |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `id`                    | string                                     | 用于 card HTML 和 GSAP 选择器的稳定 id                                                          |
| `intent`                | string                                     | 自然语言描述；传递给 card synthesis                                                               |
| `startSec` / `endSec`   | number                                     | 以秒为单位的时间（endSec > startSec）                                                              |
| `accentIndex`           | 0 \| 1 \| 2 \| 3 \| 4                      | 此 card 所使用的 5 种主题强调色中的哪一种                                                        |
| `zone`                  | enum（见下文）                             | card 在画布上的位置                                                                                |
| `contentHints`          | object                                     | 自由形式的容器；agent 在此放置 kicker/title/detail/data/quote                                      |
| `archetype`（可选）     | string                                     | 可附加的自由形式标签，用于记住 card 的模式；缺失 = free-form，后者为默认值                         |
| `transition`（可选）    | enum: `cut` \| `fade` \| `slide` \| `wipe` | 声明式的 card 到 card 过渡                                                                        |

**五种 `zone` 值：**

| zone              | 解析后的边界                                | 使用场景                             |
| ----------------- | ------------------------------------------- | ------------------------------------ |
| `fullscreen`      | 覆盖整个画布                                | 主视觉时刻、大数字、宣言             |
| `whiteboard-area` | 内缩 40px 边距（或肖像高度的 45%）          | 密集数据 / 带注释的内容              |
| `lower-third`     | 底部 30% 区域                               | 在可见视频上叠加注释                 |
| `side-panel`      | 右侧 42%（横向）或底部 40%（纵向）          | 一侧数据，另一侧视频                 |
| `video-overlay`   | 整个画布，预期为大部分透明的 card           | 全出血视频上的注释叠加层             |

当你在第 9 步组装合成内容时，按照上表将每个 card 的 `zone`
解析为 card-host wrapper 上的像素边界。
视频边界只在合成层级设置**一次**（`videoTrack.bounds`）；
若要使视频看起来在“不同 card 之间移动”，请在合成内容的 `<script>` 中
针对 `#video-wrap` 编写 GSAP tween（参见第 9 步）。

**没有规定的 card 角色，也没有规定的叙事弧。**Card 应由
视频实际说出的内容自然产生 —— 可以全部是引用，也可以全部是数据，
可以用一个数字开场，也可以用一个故事开场。让转录文本决定
节奏。

**要点数量？——根据时长 + 信息密度自动推断。** 不设固定
上限。先根据视频时长选择一个**基础节奏**，再根据**信息密度**调整。
仅**下限固定：至少 5 张卡片**，确保即使是短视频也有节奏感。

**第 1 步 —— 按时长确定基础节奏**（中等密度下自然的每卡秒数）：

| 视频时长             | 基础节奏（每张卡片秒数） | 理由                                        |
| -------------------- | ------------------------ | ------------------------------------------- |
| < 60 秒（短 Reels）  | **6–8 秒**               | 观众期待短内容中更快的切换                   |
| 60 秒 – 3 分钟       | **8–12 秒**              | 常规社交媒体节奏                            |
| 3 – 10 分钟          | **12–20 秒**             | 留出呼吸空间；每张卡片承载更多内容           |
| 10 – 30 分钟         | **20–35 秒**             | 长篇讲座 / 访谈节奏                         |
| > 30 分钟            | **30–60 秒**             | 分集式、接近章节的感受                      |

**第 2 步 —— 密度乘数**（乘以基础节奏）：

| 转录文本中的信号                                                                                                           | 乘数       | 效果                     |
| -------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------ |
| **高密度** —— 大量数字、明确主张、短促节奏、列表式枚举、每 1–2 句话就是一个新观点                                        | **× 0.7**  | 切换更快，卡片更多       |
| **中等密度** —— 数据与叙述兼具的混合流动                                                                                  | **× 1.0**  | 基础节奏                 |
| **低密度** —— 一个延展故事、反复重构表达、缓慢的反思节奏、单一论点逐步展开                                               | **× 1.5**  | 切换更慢，卡片更少       |

**第 3 步 —— 计算：**

```
secPerCard = basePace × densityMultiplier
cardCount  = max(5, round(videoDurationSec / secPerCard))
```

示例（注意 —— **没有上限钳制**；长视频会自然产生更多卡片）：

- **30 秒短 Reels，单一爆点（低密度）** → 7 × 1.5 = 10.5 秒/卡片 → round(30/10.5)=3 → 下限提升至 **5** 张卡片
- **60 秒反思式独白（低密度）** → 10 × 1.5 = 15 秒/卡片 → **4** → 下限提升至 **5** 张卡片
- **121 秒、数据丰富的口播视频（高密度）** → 10 × 0.7 = 7 秒/卡片 → **17** 张卡片
- **5 分钟访谈，混合密度** → 16 × 1.0 = 16 秒/卡片 → **19** 张卡片
- **10 分钟深度解析，高密度** → 16 × 0.7 = 11 秒/卡片 → **55** 张卡片
- **30 分钟讲座，中等密度** → 28 × 1.0 = 28 秒/卡片 → **64** 张卡片
- **1 小时播客，低密度** → 45 × 1.5 = 67.5 秒/卡片 → **53** 张卡片

当一张卡片持续超过约 15 秒时，应规划更丰富的卡片内容（数据块、
多步骤揭示、通过错开动画逐步展开的多个子要点）——静态单行文案超过
8 秒就会变得乏味。对于许多卡片超过 30 秒的长内容，请考虑**将时间线拆分为
子合成**（每个章节一个 .html，并通过
`data-composition-src` 挂载），以便让每个文件中的 GSAP 时间线保持易于管理
——参见 `timeline_track_too_dense` HyperFrames lint 警告。

`content` 可以是纯字符串（`"Title: annualized 5.69%\nNotes: ..."`），也可以是任何能够承载数据的 JSON
结构。智能体会针对每张卡片决定其结构。

**可选片尾。** 此技能**不提供固定的品牌片尾**。如果用户需要片尾卡片，请自行设计一个中性的片尾（文字标识 + 单行标语，约 1.5-2 秒，淡入 -> 短暂停留 -> 淡出），将其追加到 `cards[]`，并将 `composition.durationSeconds` 延长至其 `endSec`。否则，在最后一张内容卡片结束。

### 7. 决定渲染策略

#### 与用户确认视觉方向（请先执行此步骤）

在开始设计卡片或确定边界之前，**请用户选择输出比例、布局、风格和卡片密度
预设**。帧会根据所选的布局 × 风格组合自动选择（参见下方“自动选择帧”表）。发送问题之前，**预先计算两项内容**：

1. 根据源视频的宽高比（`metadata.json` 的宽度 / 高度）计算 **`recommendedRatio`**：
   - `sourceAspect = width / height`
   - `sourceAspect ≥ 1.5`（≥ 约 3:2 的宽画幅）→ 建议使用 **`16:9`**
   - `sourceAspect ≤ 0.7`（≤ 约 9:13 的竖画幅）→ 建议使用 **`9:16`**
   - `0.7 < sourceAspect < 1.5`（接近正方形）→ 建议使用 **`4:5`**

   在推荐选项的标签中标记“（推荐 · 与源视频 X:Y 匹配）”，
   让用户了解推荐原因。

2. 根据第 6 步计算 **`autoCount`**（`max(5, round(videoSec / (basePace ×
densityMultiplier)))`），以便“自动”选项的标签能够显示具体数量。

**环境兼容性——选择最佳可用的提问通道。**
并非每个运行时都提供相同的结构化提问工具。请按以下顺序处理：

1. **原生澄清工具**——使用下面的结构化 4 问调用。
2. **其他原生澄清工具**（例如 `ask_question`、
   `request_user_input`、IDE 专用提示）——使用该工具，并采用相同的 4 个问题文本和选项列表。保留推荐标记和预先计算的值。
3. **没有原生工具**（Codex CLI、纯文本运行时）——**直接在正常对话中提问**。使用本节末尾的纯文本模板。保持为**一条消息、4 个编号问题**
   （全局限制为每轮 2-5 个问题；这里符合限制）。

适用于每个通道的规则：

- 每轮最多询问 **2-5 个问题**。这里的 4 个问题符合要求。
- 即使缺失信息不会阻碍渲染，也要**询问一次，以确认会实质影响最终输出的参数**（比例、
  布局、风格、`cardCount`）。
- 如果用户已经预先批准默认值（“just use defaults”、“no need to ask”、“auto-pick everything”），要求你不要提问，或者本次运行带有持续的自主决策信号（“surprise me” / “decide for me”——
  `../hyperframes-core/references/brief-contract.md` § 1），则**完全跳过提问**，并使用：`recommendedRatio`、`layout="stack"`（最安全的跨比例默认值）、根据转录文本语气从最中性分组（编辑 / 数据）中选择的 `style`、`autoCount`。用一句话告诉用户你的选择，然后继续。

**通道 A — 原生 `AskUserQuestion`：**

```
// Precompute before the call:
//   recommendedRatio = "16:9" | "9:16" | "4:5"
//   autoCount        = integer (from Step 6)

AskUserQuestion({
  questions: [
    {
      question: "Output video aspect ratio (canvas):",
      header: "Aspect ratio",
      multiSelect: false,
      // Reorder so the recommended option appears FIRST (per AskUserQuestion convention).
      // Append " (recommended · matches source video W×H)" to the recommended option's label.
      options: [
        { label: "16:9 (1920×1080) landscape", description: "TV / YouTube / desktop playback. Most natural when the source video is already landscape; widest canvas." },
        { label: "9:16 (1080×1920) portrait", description: "TikTok / Reels / short-form mobile. Most natural for portrait source; native mobile experience." },
        { label: "4:5 (1080×1350) near-portrait", description: "Instagram feed / WeChat Moments. Best when source is near-square or you want to cover both platforms." }
      ]
    },
    {
      question: "Choose the overall layout: how should the video and cards coexist on the canvas?",
      header: "Layout",
      multiSelect: false,
      options: [
        { label: "side-by-side (split)",  description: "Video and card each take half the canvas. Most stable for interview / data side-by-side; clear visual separation." },
        { label: "top-bottom (stack)",    description: "Video on top (~52%), card below. Classic combo of speaker face + summary card; works well in portrait too." },
        { label: "picture-in-picture (pip)", description: "Card fills the canvas, video shrinks to a rounded corner window. Use when content is primary and speaker is secondary." },
        { label: "full-screen overlay (overlay)", description: "Video plays full-bleed, card floats as a glass layer on top. Strong cinematic / emotional feel." }
      ]
    },
    {
      question: "Choose the card visual style (style):",
      header: "Style group",
      multiSelect: false,
      // NOTE: these 3 groups intentionally match the frame auto-pick matrix
      // rows below, so picking a group resolves both `style` group AND the
      // frame matrix column in one step. Memberships are mutually exclusive.
      options: [
        { label: "warm paper (warm-paper)", description: "academic notebook · editorial big-type · whiteboard hand-drawn · xhs social. Best for interview reflections, product launches, lifestyle, emotional stories." },
        { label: "clinical / cold (clinical)",   description: "audit magazine · swiss grid · terminal CLI · minimal modern. Best for financial analysis, investigative reports, technical tutorials, serious presentations." },
        { label: "experimental / avant-garde (experimental)", description: "geom color-clash geometry · spotlight dark-background. Best for short-form highlights, product launches, strong emotion, cinematic feel." }
      ]
    },
    {
      question: "Card count (takeaway pacing): how many cards to cut?",
      header: "Card count",
      multiSelect: false,
      options: [
        { label: "Auto (recommended) · approx N cards", description: "Inferred automatically from video duration and information density (see Step 6 rules). This run estimates approx N cards. Substitute the real N (your autoCount) into the label." },
        { label: "Fewer · approx round(N × 0.6) cards", description: "Sparser cuts, each card holds longer — suits reflective / slow-paced content." },
        { label: "More · approx round(N × 1.5) cards", description: "Tighter cuts, faster rhythm — suits staccato / data-dense / short-form highlight content." }
      ]
    }
  ]
})
```

**关于“Other”** — `AskUserQuestion` 会自动向卡片数量问题添加一个“Other”选项。用户可以直接输入数字（例如“8”、“20”）作为 cardCount 目标值。将输入解析为整数：若解析成功 → 使用该值（最低为 5）；若解析失败 → 回退为“auto”。

**渠道 B — 纯文本回退方式**（Codex CLI、没有原生提问工具的运行时）。将以下内容作为一条普通消息发送，然后等待回复。使用 1/2/3/4 的项目符号格式可确保回复可被解析：

```
I need to confirm four visual decisions with you before I start cutting cards:

1) Output aspect ratio (canvas):
   A. 16:9 landscape (1920×1080) — TV / YouTube / desktop playback
   B. 9:16 portrait (1080×1920) — TikTok / Reels / short-form mobile
   C. 4:5 near-portrait (1080×1350) — Instagram feed / works for both platforms
   ▸ My recommendation:  <recommendedRatio>  (matches source video W×H = <sourceW>×<sourceH>)

2) Overall layout (how video & card coexist):
   A. split   side-by-side (50/50)
   B. stack   top-bottom (video top, card bottom)
   C. pip     picture-in-picture (card full canvas, video rounded corner window)
   D. overlay full-screen glass overlay (video full-bleed, card glass layer)

3) Card style group (maps to frame auto-pick matrix, pick 1 of 3):
   A. warm paper (warm-paper)      (academic / editorial / whiteboard / xhs)
   B. clinical / cold (clinical)   (audit / swiss / terminal / minimal)
   C. experimental (experimental)  (geom / spotlight)

4) Card count (takeaway pacing):
   A. Auto (recommended) — approx <autoCount> cards
   B. Fewer — approx round(<autoCount> × 0.6) cards
   C. More — approx round(<autoCount> × 1.5) cards
   D. Give me a specific number (e.g. "8", "20")

Reply format: "1A 2C 3B 4A" or natural language is fine.
If you want all recommended defaults, reply "default" / "auto" / "use all recommendations".
```

解析纯文本回复：

- 接受宽松格式：`"1A 2C 3B 4A"`、`"A C B A"`、`"16:9 / pip /
data / auto"`、完整句子或 `default`。
- 如果任一回答存在歧义 → 仅重新询问有歧义的部分（仍须满足 2–5 的上限）。
- 如果用户说“default / auto / use all recommendations” → 无需重新询问，直接跳过。

用户回答后（任意渠道）：

1. 根据比例回答**确定输出画布** — 以下是应写入的精确 `storyboard.composition.width / height` 值：

   | 用户选择 | composition.width × height | storyboard.layout 字段                                       |
   | ----------- | -------------------------- | ------------------------------------------------------------- |
   | `16:9`      | **1920 × 1080**            | `"landscape"`                                                 |
   | `9:16`      | **1080 × 1920**            | `"portrait"`                                                  |
   | `4:5`       | **1080 × 1350**            | `"portrait"`（schema 将 4:5 视为纵向 — height > width） |

   对于 `references/layouts/*.html` 内的 **4:5 边界** — 这些文件
   仅记录横向（1920×1080）和纵向（1080×1920）。对于
   4:5（1080×1350），通过**按比例缩放纵向布局**推导边界：
   保持水平值不变，将垂直值按
   `1350/1920 ≈ 0.703` 缩放。示例：`overlay` 纵向卡片 =
   `{ x: 24, y: 1280, w: 1032, h: 564 }` → 4:5 卡片 =
   `{ x: 24, y: round(1280 × 0.703), w: 1032, h: round(564 × 0.703) }`
   = `{ x: 24, y: 900, w: 1032, h: 397 }`。

2. **通过查看风格组来映射到具体风格**：根据
   文稿语调选择最匹配的风格，但需保持在
   用户选定的组内。如果你无法在该组内的两种具体风格之间确定，
   则使用这 2–4 个具体风格选项发起第二个 `AskUserQuestion`。

3. 根据密度回答，**确定最终 `cardCount`**：

   | 用户选择                | 最终 `cardCount`                          |
   | ----------------------- | ----------------------------------------- |
   | 自动（推荐）            | 你已计算出的 `autoCount`                  |
   | 更少                    | `max(5, round(autoCount × 0.6))`          |
   | 更多                    | `round(autoCount × 1.5)`（不设上限）      |
   | 其他 = "<n>"（整数）    | `max(5, parseInt(n))`                     |
   | 其他 = 任何其他内容     | 回退至 `autoCount`                        |

4. **从下表自动选择视频边框**（无需询问用户边框选择，边框由
   布局 × 风格决定）：

   | 布局      | warm-paper styles (academic / whiteboard / editorial / xhs) | clinical styles (audit / swiss / terminal / minimal) | experimental styles (geom / spotlight) |
   | --------- | ----------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
   | `split`   | `polaroid`                                                  | `hairline`                                           | `clean`                                |
   | `stack`   | `polaroid`                                                  | `hairline`                                           | `clean`                                |
   | `pip`     | `clean`（pip pill 已自带边框装饰）                          | `clean`                                              | `clean`                                |
   | `overlay` | `clean`（全出血布局禁止装饰性边框）                         | `clean`                                              | `clean`                                |

5. 用一句话**告知用户你的选择**：比例（+ 画布尺寸）、布局、具体风格、
   边框以及最终 `cardCount`，然后继续执行第 7 步的其余部分（逐卡布局、
   动效模式）。
6. 在工作记忆中记录这五个值（比例 / 布局 / 风格 / 边框 / `cardCount`）
   （无需 schema 字段）；你将在第 8 步编写每张卡片的 HTML 时，以及读取
   匹配的 `references/<dim>/<key>.html` 来获取 token 和结构时引用它们。

如果用户通过“其他”选择了不在 10 种风格库中的自由文本风格名称，
将其视为自行设计全新卡片视觉的提示，但仍需以所选布局的边界为基准。

#### 渲染策略输入

在第 7.0 步锁定比例 / 布局 / 风格 / `cardCount` / 边框后，
其余逐卡决策如下：

- **GSAP 目标内的源视频适配方式**：视频元素使用
  `object-fit: cover`，并被裁剪到 `#video-wrap` 的 tween 边界内。
  如果你希望完全不裁剪（例如，横向画布上的竖向源视频
  不应被截掉顶部/底部），应将 tween 目标设为与源视频宽高比相同的矩形，
  让周围画布透出（或用卡片 / 背景填充）。
- **每张卡片的 `card.zone`**：从你选定的构图布局中推导
  （split → side-panel，stack → lower-third，pip → fullscreen，overlay
  → video-overlay），或者为一次性变体选择不同区域
  （英雄卡 / 引言卡使用 fullscreen，密集数据使用 whiteboard-area）。
- **每张卡片的 `accentIndex`**：每张卡片使用 5 种主题强调色中的一种。
  在不同卡片间变化以形成节奏；当两张卡片属于同一叙事节拍时，复用相同索引。
- **动效词汇**：从 `data-anim` 类型中选择 2–3 种可重复使用的模式
  （见后文表格），并始终沿用，以使构图保持一致。

从这些 `themeId` 调色板中选择（在你的 composition `<style>` 块中将它们用作 `--accent-N` /
`--bg` / `--text` CSS 变量）：

| themeId | 强调色调色板（5 种颜色）                 | 画板背景          | 文本      |
| ------- | ----------------------------------------- | ----------------- | --------- |
| classic | `#1971c2 #e03131 #2f9e44 #e8590c #9c36b5` | `#FFF9E3`（纸张） | `#1e1e1e` |
| noir    | `#4cc9f0 #f72585 #4ade80 #fb923c #a78bfa` | `#1a1a1a`         | `#f1f1f1` |
| mint    | `#0077b6 #d62828 #2d6a4f #e76f51 #7209b7` | `#e8faf0`         | `#1b4332` |
| craft   | `#bf5700 #d62728 #6c757d #e9b54a #3d5a80` | `#f6efe1`         | `#2d2d2d` |
| slate   | `#0ea5e9 #ef4444 #22c55e #f97316 #a855f7` | `#1e293b`         | `#f1f5f9` |
| mono    | `#000 #555 #888 #aaa #ccc`                | `#fff`            | `#000`    |

可用字体（位于 `<SKILL_DIR>/assets/fonts/` 中的 woff2 文件，会在第 9 步暂存至工作目录）：`Caveat`（手写体）、
`LXGW WenKai TC`（中文手写体）、`Inter`（现代无衬线体）、`Virgil`
（几何手写体）。可通过 `@font-face` 或直接使用 `font-family` 引用。

如需获取视觉图案灵感，`<SKILL_DIR>/references/styles/`
提供了 10 张独立的参考卡片（academic / editorial / minimal
/ spotlight / geom / whiteboard / audit / terminal / swiss / xhs），你可以复制它们作为起点——但**不必受限于匹配其中任何一种**。每张卡片都应是你自己的设计。

#### 视觉设计库（<SKILL_DIR>/references/）

除 composition 层级的 `themeId` 之外，该技能还在 `<SKILL_DIR>/references/` 中提供了一个更丰富的**参考库**，
涵盖三个可自由组合的**正交**视觉维度：

```
Style  ×  Layout  ×  VideoFrame
 (10)      (4)         (3)
```

| 维度  | 键                                                                                              | 决定内容                                                          |
| ---------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **风格**  | `academic` `editorial` `minimal` `spotlight` `geom` `whiteboard` `audit` `terminal` `swiss` `xhs` | 卡片的视觉语言——字体、颜色、装饰、卡片内布局 |
| **布局** | `split` `stack` `pip` `overlay`                                                                   | 源视频和卡片如何共享画布                       |
| **边框**  | `clean` `hairline` `polaroid`                                                                     | 视频元素周围的装饰性外框                           |

阅读 `<SKILL_DIR>/references/DESIGN_INDEX.md`
以获取完整矩阵和宽松的决策指南（访谈 / 产品发布 / 数据分析 /
社交短片 / 技术教程 / 情感故事……）。当你决定使用特定的
风格 / 布局 / 边框时，阅读对应文件：

- `references/styles/<key>.html` —— 包含该风格 CSS 令牌（颜色、字体、内边距、装饰）和占位要点的独立卡片片段。复制 `.card[data-card-id="ref-<key>"]` 样式块，将 data-card-id 重命名为你的卡片 id，把占位内容替换为真实要点，即可完成。
- `references/layouts/<key>.html` —— 横向和纵向的精确 `videoBounds` + `cardBounds`，并提供可直接复制粘贴的 JSON 片段，用于 `storyboard.json` 中每张卡片的 `layout` 字段。
- `references/frames/<key>.html` —— 用于添加为 `#video-wrap` 同级元素的装饰性 HTML，以及在 composition CSS 中的放置说明。

为**每张卡片**选择 `style × layout × frame`——只要转场衔接流畅，你可以在卡片之间更改这三者。一个常见节奏是：以 `editorial × overlay × clean` 开场，数据卡切换为 `audit × split × hairline`，最后以 `whiteboard × pip × polaroid` 收尾。

这 10 种样式是 Skill 侧的设计令牌，**不是构图层级的主题**——它们无需在 `storyboard.composition` 中声明；它们存在于每张卡片的 HTML 内。`themeId` 字段仍可选择构图层级的调色板（见上表），用于控制页面主体背景和视频边框装饰。

#### 布局构图（卡片 + 视频）

每张卡片有两个相互协调的决策，用于定义它如何与源视频共享画布：

- **`card.zone`**（在 `storyboard.json` 中声明）——5 个 schema
  值之一；当你在第 9 步编写卡片宿主包装器的内联 `style` 时，
  将其解析为像素边界（依据第 6 步中的表格）。
- **此卡片时间窗口内的 `#video-wrap` 边界**（在构图的 GSAP 时间线中
  以命令式方式声明）——代理会在每次布局转场时将
  `#video-wrap` 补间动画到目标矩形。

Schema **不会**存储每张卡片的视频边界。`videoTrack.bounds` 是
构图层级的**一次性**设置（默认为完整画布）。视频在卡片之间的“移动”
纯粹是在 `index.html` 中编写的 GSAP 动画。不存在 `card.layout` 字段——本文档的早期版本虚构了该字段；真实 schema 只有 `card.zone`。

**4 种构图布局**（来自 `references/layouts/`）——每种都是将一个 `zone` 与一个 `#video-wrap` 补间目标配对的方案：

| 构图布局 | 推荐的 `card.zone` | `#video-wrap` 的 GSAP 目标（横向 1920×1080）                       | `#video-wrap` 的 GSAP 目标（纵向 1080×1920）                | 使用时机                                     |
| ------------------ | ----------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `split`            | `side-panel`            | `{ left: 960, top: 0, width: 960, height: 1080 }`                         | `{ left: 0, top: 960, width: 1080, height: 960 }`（下半部分）   | 演讲者 + 数据并排展示 / 50:50 比重      |
| `stack`            | `lower-third`           | `{ left: 14, top: 14, width: 1892, height: 548 }`（顶部 52%）               | `{ left: 0, top: 0, width: 1080, height: 844 }`（顶部 44%）         | 演讲者在上方 + 摘要卡片在下方             |
| `pip`              | `fullscreen`            | `{ left: 1480, top: 760, width: 400, height: 300 }` + 添加 `.framed` 类 | `{ left: 690, top: 28, width: 360, height: 203 }` + 添加 `.framed` | 内容密集型卡片 + 角落画中画                 |
| `overlay`          | `video-overlay`         | `{ left: 0, top: 0, width: 1920, height: 1080 }`（全幅出血）             | `{ left: 0, top: 0, width: 1080, height: 1920 }`                  | 电影感 / 戏剧感 / 全视频上的玻璃卡片 |

对于 4:5（1080×1350），将纵向 `y/h` 值按 `1350/1920 ≈ 0.703` 缩放
（参见步骤 7.0 的 Channel A / Channel B `recommendedRatio` 分辨率
表）。

**一次性变体的其他区域值**（仍使用 `card.zone`；不使用虚假的
“layout”字段）：

| `zone`            | 解析后的边界                                             | 常见用途                              |
| ----------------- | -------------------------------------------------------- | ------------------------------------- |
| `fullscreen`      | 覆盖整个画布                                             | 主视觉卡片、视频过渡到隐藏/pip        |
| `whiteboard-area` | 内嵌 40px 边距（横向）或底部 45%（纵向）                 | 密集数据卡片、自由边距                |
| `lower-third`     | 底部 30% 区带                                            | 访谈人物注释                          |
| `side-panel`      | 右侧 42%（横向）或底部 40%（纵向）                       | 侧边栏 / “split”方案                  |
| `video-overlay`   | 整个画布；预期卡片根节点透明                             | 全出血视频上的玻璃叠加层              |

你可以为每张卡片混用不同方案——根据当下需求选择 `card.zone`，
然后编写卡片之间 `#video-wrap` 的 GSAP 补间动画。

#### 分镜渲染契约

`storyboard.json` 是仅供智能体内部使用的规划产物——没有任何 CLI
命令会解析它。它的存在是为了让你在编写每张卡片的 HTML 之前，明确记录
时序和内容决策。请遵循以下 v3 风格结构，以便同一份大纲驱动你在
步骤 9 中组装的合成。

必需结构（完整示例见步骤 6）：

- `schemaVersion: 3`
- `composition: { fps, width, height, durationSeconds, layout, themeId, seed }` — 请注意，`durationSeconds`/`fps`/`themeId`/`layout` 位于 `composition` **内部**，而非顶层
- `videoTrack: { sourcePath, startSec, endSec, bounds? }` — 视频边界默认覆盖整个画布
- `subtitles: { enabled, ... }`
- `cards[]` — 每张卡片都包含 6 个必填字段：`id`、`intent`、`startSec`、`endSec`、`accentIndex`、`zone`、`contentHints`

规则：

- 卡片时间必须位于 `composition.durationSeconds` 内，且除非有意为之，否则不应重叠（重叠时使用 `data-track-index` 控制 z 轴顺序）。
- 视觉细节应位于卡片 HTML 片段中（步骤 8），而**不应**位于 `contentHints` 中。`contentHints` 是你用于设计卡片的自定义结构化提示；实际渲染外观由 HTML 决定。
- 保持分镜结构稳定——即使没有任何内容会解析它，你在编写步骤 8/9 时仍会回读它，一致性可使卡片 ID 和时序保持同步。
- 像“我选择了 overlay × geom × clean”这样的智能体侧决策不应放入 `storyboard.json`——请将它们保留在工作记忆中，并在编写卡片 HTML + GSAP 补间动画时使用。

**与视频共用画布的卡片应使用透明卡片背景。**
当 GSAP 补间动画使视频在卡片后方/旁边仍然可见时（叠加方案、
pip 方案，或任何 `card.zone = 'lower-third' | 'video-overlay'`
时刻），卡片的 `.root` **不得**绘制完整的不透明背景——
否则会遮挡视频。有两种模式：

```css
/* 模式 A：根元素透明，由页面主体提供奶油色背景 */
html,
body {
  background: var(--bg);
}
.card[data-card-id="card-X"] .root {
  background: transparent;
}

/* 模式 B：仅为全屏卡片显式设置每张卡片的背景 */
.card[data-card-id="card-hero"] .root {
  background: var(--bg);
}
.card[data-card-id="card-overlay"] .root {
  background: transparent;
}
```

对于 `side-panel` 区域的卡片（拆分式布局），卡片宿主本身已经只占画布的一半，因此不透明的卡片背景没有问题，它只会覆盖自身所在的那一半。

### 8. 编写每张卡片的 HTML

为每张卡片创建 `$WORK_DIR/public/cards/{card-id}.html`。每个文件包含一个遵循以下约定的单根 HTML 片段：

#### 卡片 HTML 约定

```html
<div class="card" data-card-id="{cardId}">
  <style>
    /* MUST: every rule starts with .card[data-card-id="{cardId}"] */
    .card[data-card-id="card-01"] .root {
      width: 100%; height: 100%;
      display: flex; ...;
      font-family: 'Caveat', 'LXGW WenKai TC', serif;
      color: var(--text);
      background: var(--bg);
    }
    .card[data-card-id="card-01"] .title { font-size: 84px; ... }
  </style>

  <div class="root">
    <h1
      id="card-01-title"
      data-anim="kinetic-chars"
      data-anim-at="0.3"
      data-anim-duration="0.5"
      data-anim-stagger="0.04"
      data-anim-pattern="pop"
    >
      <span class="char">S</span>
      <span class="char">u</span>
    </h1>
    <div
      id="card-01-line"
      data-anim="grow-x"
      data-anim-at="0.65"
      data-anim-duration="0.5"
      data-anim-target-w="420"
      style="width:0;height:8px;background:var(--accent-0);border-radius:4px;"
    ></div>
  </div>
</div>
```

**硬性规则**（`hyperframes` lint 会拒绝违规内容）：

- 单个根 `<div class="card" data-card-id="{cardId}">`
- 内联 `<style>` 规则**必须**以以上作用域选择器为前缀
- **不得使用 `<script>` 标签**
- `src=` / `href=` 中**不得使用外部 URL**（不得使用 CDN 或远程字体）
- **不得使用内联事件处理器**（如 `onclick=`）
- 所有资源均通过相对路径引用同一 `public/` 目录中的文件
- 为便于跨主题移植，颜色应通过 `var(--accent-N)` 等变量指定

**动画通过声明定义，而不是通过代码实现。** 仅使用 `data-anim-*` 属性；绝不要编写 `<script>` 来实现动画。你需要在第 9 步将每一项 `data-anim-*` 声明编译到唯一的主 GSAP 时间线中。

#### 卡片尺寸：竖屏移动端优先

这 10 个 `references/styles/*.html` 的尺寸针对 **1920×1080 横屏**预览而设计。当 `storyboard.layout = "portrait"` 时（1080×1920，是社交媒体 / 移动端的主流场景），**应增大所有视觉尺寸**：手机的观看距离更近，相同的像素数量相较于横屏电视式画布看起来会更小。

| token                     | 横屏基准           | **竖屏目标**        | 缩放          |
| ------------------------- | ------------------ | ------------------- | ------------- |
| title (h1/h2 hero)        | 64–96px            | **88–132px**        | ×1.35         |
| detail / body             | 24–30px            | **30–40px**         | ×1.30         |
| kicker / chip label       | 14–16px            | **18–22px**         | ×1.30         |
| timecode / meta           | 12–14px            | **16–18px**         | ×1.30         |
| data block primary number | 48–60px            | **64–88px**         | ×1.40         |
| line-height multiplier    | 1.05–1.5           | 相同                | （不缩放）    |

**经验法则：**`portraitPx = round(landscapePx × 1.3)`，然后向下取整
到附近的 4px 倍数，以保持视觉节奏。主视觉标题最高可使用
×1.4；较小的元文本保持在 ×1.2，以避免拥挤。

在竖版中，内边距会**略微缩小**——卡片更窄，因此较大的
横版内边距（40–64px）会占用过多宽度。竖版应使用 24–36px 的水平
内边距。

如果你要制作一张必须同时适用于**两种**布局的卡片，
应优先在卡片根元素上使用 `@container` 查询，而不是硬编码尺寸：

```css
.card[data-card-id="X"] .root {
  container-type: inline-size;
}
.card[data-card-id="X"] .title {
  font-size: clamp(64px, 8.5cqi, 132px);
}
.card[data-card-id="X"] .detail {
  font-size: clamp(24px, 3.2cqi, 40px);
}
```

但对于大多数卡片，选择单一布局即可——只需选择与故事板 `layout` 字段
匹配的尺寸表列。

#### 可用的 `data-anim` 类型

| 类型            | 用途                | 关键参数                                                                                      |
| --------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| `fade-in`       | 进入                | `at`、`duration`、`ease?`                                                                       |
| `fade-out`      | 退出                | `at`、`duration`、`ease?`                                                                       |
| `slide-in`      | 滑入                | `at`、`duration`、`from=left\|right\|top\|bottom`、`distance`                                   |
| `kinetic-chars` | 逐字符弹出          | `at`、`duration`、`stagger`、`pattern=pop\|fade` — 元素需要 `<span class="char">` 子元素 |
| `typewriter`    | 逐字符淡入          | 与 kinetic-chars 相同，但默认 stagger 更慢                                                |
| `count-up`      | 数字动画            | `at`、`duration`、`from`、`to`、`format=.0f\|.1f\|.2f\|,d`                                      |
| `draw-path`     | SVG 路径揭示        | `at`、`duration` — 元素应为 `<path>`                                                 |
| `grow-y`        | 柱状高度            | `at`、`duration`、`target-h`（px）— 元素初始为 `height:0`                                   |
| `grow-x`        | 柱状宽度            | `at`、`duration`、`target-w`（px）— 元素初始为 `width:0`                                    |
| `scale-pop`     | 弹出入场            | `at`、`duration`                                                                                |
| `blur-in`       | 失焦 → 聚焦         | `at`、`duration`                                                                                |
| `mask-reveal`   | 裁剪揭示            | `at`、`duration`、`direction=left\|right\|top\|bottom`                                          |
| `morph-to`      | 补间任意 CSS        | `at`、`duration`、`props='{...JSON...}'`                                                        |

`data-anim-at` 是**相对于卡片 startSec 的秒数**——当你在第 9 步将每个声明编译到 GSAP 时间线时，加上卡片的 `startSec` 以获得绝对时间，并量化到 1/fps。

### 9. 组装合成 HTML

暂存资源并写入 `$WORK_DIR/public/index.html`：

```bash
# SKILL_DIR is injected by the host ("Base directory for this skill: …")
SKILL_DIR="<SKILL_DIR>"

mkdir -p "$WORK_DIR/public/fonts" "$WORK_DIR/public/vendor" "$WORK_DIR/public/cards"
cp -n "$SKILL_DIR/assets/fonts/"*            "$WORK_DIR/public/fonts/"
cp -n "$SKILL_DIR/assets/vendor/gsap.min.js" "$WORK_DIR/public/vendor/"
# stage the input video — RE-ENCODE with dense keyframes. Sources with a sparse GOP
# (keyframe interval > ~1s) freeze on seek in the renderer (a frozen frame under the
# overlays); -g / -keyint_min set to your composition fps make every frame seekable.
# (Set both to your fps — 30 shown; use 24/25/60 to match.)
ffmpeg -y -i "$VIDEO_PATH" -c:v libx264 -crf 18 -g 30 -keyint_min 30 \
  -pix_fmt yuv420p -movflags +faststart -c:a aac "$WORK_DIR/public/input-video.mp4"
```

#### 合成模板

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {
        font-family: "Caveat";
        src: url("fonts/Caveat-400-latin.woff2") format("woff2");
        font-weight: 400;
        font-display: block;
      }
      @font-face {
        font-family: "Caveat";
        src: url("fonts/Caveat-700-latin.woff2") format("woff2");
        font-weight: 700;
        font-display: block;
      }
      @font-face {
        font-family: "LXGW WenKai TC";
        src: url("fonts/LXGWWenKaiTC-400-latin.woff2") format("woff2");
        font-weight: 400;
        font-display: block;
      }
      @font-face {
        font-family: "Inter";
        src: url("fonts/Inter-400-latin.woff2") format("woff2");
        font-weight: 400;
        font-display: block;
      }
      @font-face {
        font-family: "Inter";
        src: url("fonts/Inter-700-latin.woff2") format("woff2");
        font-weight: 700;
        font-display: block;
      }
      @font-face {
        font-family: "Virgil";
        src: url("fonts/Virgil.woff2") format("woff2");
        font-display: block;
      }

      :root {
        /* Pick from the themeId palette table in Step 7 — example: classic */
        --bg: #fff9e3;
        --text: #1e1e1e;
        --accent-0: #1971c2;
        --accent-1: #e03131;
        --accent-2: #2f9e44;
        --accent-3: #e8590c;
        --accent-4: #9c36b5;
        --font-family: "Caveat", "LXGW WenKai TC", serif;
      }
      * {
        box-sizing: border-box;
      }
      /* Body font-family MUST list concrete font names (not just var(--font-family)) —
   the HyperFrames renderer's static analyzer doesn't expand CSS variables when
   resolving fonts, so a var-only chain triggers `font_family_without_font_face`
   lint and falls back to a generic. Use the concrete chain here; cards that
   want the theme font can still reference var(--font-family) internally. */
      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #000;
        font-family: "Inter", "Caveat", "LXGW WenKai TC", ui-sans-serif, system-ui, sans-serif;
      }
      #stage {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      /* video-wrapper holds the source video. Its position / size are animated
   over time by the master timeline (one tween per layout transition). */
      .video-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        border-radius: 0;
        box-shadow: none;
      }
      .video-wrapper video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .card-host {
        position: absolute;
        pointer-events: none;
        overflow: hidden;
      }
      .card-host .card {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .card-host .char {
        display: inline-block;
        visibility: visible;
      }

      /* Subtle drop shadow + rounded corners for non-fullscreen video framings */
      .video-wrapper.framed {
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
      }
    </style>
  </head>
  <body>
    <div
      id="stage"
      data-composition-id="talking-head-recut"
      data-start="0"
      data-duration="121.2"
      data-fps="30"
      data-width="1920"
      data-height="1080"
    >
      <!-- Layer 1: source video — initial position matches card-01's layout -->
      <div class="video-wrapper" id="video-wrap">
        <video
          id="bg-video"
          src="input-video.mp4"
          muted
          playsinline
          data-start="0"
          data-duration="121.2"
          data-track-index="1"
        ></video>
      </div>
      <!-- Preserve the source program audio while the visual video stays muted. -->
      <audio
        id="source-audio"
        src="input-video.mp4"
        data-start="0"
        data-duration="121.2"
        data-track-index="10"
        data-volume="1"
      ></audio>

      <!-- Layer 2: each card-host sits at the bounds dictated by its layout. -->
      <!-- IMPORTANT: every card-host MUST carry BOTH "card-host" and "clip" classes. -->
      <!--   - "card-host"  → our positioning + pointer-events styles                 -->
      <!--   - "clip"       → HyperFrames runtime uses this to enforce visibility     -->
      <!--                    only during data-start … data-start+data-duration.      -->
      <!--                    Without "clip" the host stays visible the whole video   -->
      <!--                    (lint: timed_element_missing_clip_class).               -->
      <!-- Example: card-01 with zone="fullscreen" → card-host covers (0,0,1920,1080) -->
      <div
        class="card-host clip"
        data-card-id="card-01"
        data-start="1.0000"
        data-duration="6.5000"
        data-track-index="2"
        style="left:0;top:0;width:1920px;height:1080px;visibility:hidden;opacity:0;"
      >
        <!-- paste the contents of public/cards/card-01.html here -->
      </div>

      <!-- Example: card-02 with zone="side-panel" (split composition layout) → card on left half -->
      <div
        class="card-host clip"
        data-card-id="card-02"
        data-start="8.0000"
        data-duration="12.0000"
        data-track-index="2"
        style="left:0;top:0;width:960px;height:1080px;visibility:hidden;opacity:0;"
      >
        <!-- card-02 HTML -->
      </div>

      <!-- ...one "card-host clip" per card with inline bounds matching resolveZoneBounds(card.zone)... -->

      <script src="vendor/gsap.min.js"></script>
      <script>
        (function () {
          // count-up formatter helper
          window.__fmt = function (v, fmt) {
            if (typeof fmt === "string" && /^\.[0-9]+f$/.test(fmt)) {
              return Number(v).toFixed(Number(fmt.slice(1, -1)));
            }
            if (fmt === ",d") return Math.round(v).toLocaleString();
            return String(Math.round(v));
          };

          const tl = window.gsap.timeline({ paused: true });

          // ── Card lifecycle (one block per card) ──
          // Example for card-01 [1.0, 7.5] with kinetic-chars at +0.3, grow-x at +0.65:

          // Enter (fade in over 0.4s)
          tl.set('.card-host[data-card-id="card-01"]', { visibility: "visible" }, 1.0);
          tl.fromTo(
            '.card-host[data-card-id="card-01"]',
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: "power2.out" },
            1.0,
          );

          // Card-internal anims (compile each data-anim-* declaration here)
          tl.from(
            '.card[data-card-id="card-01"] #card-01-title .char',
            { opacity: 0, y: 8, scale: 0.8, duration: 0.5, ease: "power2.out", stagger: 0.04 },
            1.3,
          );
          tl.fromTo(
            '.card[data-card-id="card-01"] #card-01-line',
            { width: 0 },
            { width: 420, duration: 0.5, ease: "power2.out" },
            1.65,
          );

          // Exit (fade out over 0.35s, ending at endSec)
          tl.to(
            '.card-host[data-card-id="card-01"]',
            { opacity: 0, duration: 0.35, ease: "power2.in" },
            7.15,
          );
          tl.set('.card-host[data-card-id="card-01"]', { visibility: "hidden" }, 7.5);

          // ── Video framing transitions ──
          // When the next card uses a different composition layout, animate the
          // video-wrapper to its new bounds. Example: card-01 = fullscreen
          // (video hidden behind), card-02 = split composition (zone="side-panel"
          // → video on right, card on left).

          // Card-02 enters at 8.0s with the split composition. Animate video to
          // the right half during the card-01 → card-02 gap (between 7.5 and 8.0s).
          tl.set("#video-wrap", { className: "video-wrapper framed" }, 7.5);
          tl.to(
            "#video-wrap",
            { left: 960, top: 0, width: 960, height: 1080, duration: 0.6, ease: "power2.inOut" },
            7.5,
          );

          // Card-02 enter — same pattern as card-01
          tl.set('.card-host[data-card-id="card-02"]', { visibility: "visible" }, 8.0);
          tl.fromTo(
            '.card-host[data-card-id="card-02"]',
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: "power2.out" },
            8.0,
          );
          // ...card-02 internal anims...

          // ── repeat for each card; if the NEXT card's layout differs,
          //    insert another tl.to('#video-wrap', ...) tween before its enter ──

          window.__timelines = window.__timelines || {};
          window.__timelines["talking-head-recut"] = tl;
        })();
      </script>
    </div>
  </body>
</html>
```

#### GSAP 语句速查表

将每个 `data-anim` 属性编译为一条 GSAP 语句。时间为
**绝对秒数** = card.startSec + data-anim-at，并量化至 1/fps。
选择器为 `.card[data-card-id="X"] #elementId`。

| data-anim                       | GSAP 语句模板                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fade-in`                       | `tl.fromTo(SEL, { opacity: 0 }, { opacity: 1, duration: D, ease: 'power2.out' }, T);`                                                                                                                              |
| `fade-out`                      | `tl.to(SEL, { opacity: 0, duration: D, ease: 'power2.in' }, T);`                                                                                                                                                   |
| `slide-in` (from=left, dist=80) | `tl.fromTo(SEL, { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: D, ease: 'power2.out' }, T);`                                                                                                                |
| `kinetic-chars` (pop)           | `tl.from(SEL + ' .char', { opacity: 0, y: 8, scale: 0.8, duration: D, ease: 'power2.out', stagger: S }, T);`                                                                                                       |
| `count-up`                      | `(function(){const o={v:FROM};tl.to(o,{v:TO,duration:D,ease:'power2.out',onUpdate:function(){const el=document.querySelector(SEL);if(el)el.textContent=__fmt(o.v,'FMT');}},T);})();`                               |
| `draw-path`                     | `(function(){const el=document.querySelector(SEL);if(el){const L=el.getTotalLength();tl.set(SEL,{strokeDasharray:L,strokeDashoffset:L},T);tl.to(SEL,{strokeDashoffset:0,duration:D,ease:'power2.inOut'},T);}})();` |
| `grow-x` (target-w=W)           | `tl.fromTo(SEL, { width: 0 }, { width: W, duration: D, ease: 'power2.out' }, T);`                                                                                                                                  |
| `grow-y` (target-h=H)           | `tl.fromTo(SEL, { height: 0 }, { height: H, duration: D, ease: 'power2.out' }, T);                                                                                                                                |
| `scale-pop`                     | `tl.fromTo(SEL, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: D, ease: 'back.out(1.6)' }, T);`                                                                                                     |
| `mask-reveal` (direction=left)  | `tl.fromTo(SEL, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)', duration: D, ease: 'power2.inOut' }, T);`                                                                                         |

量化：`T = Math.round(absSec * fps) / fps`。在 30fps 下，最小
步长为 `1/30 ≈ 0.0333s`；在 JS 字面量中四舍五入到 4 位小数（`.toFixed(4)`）即可。

#### 视频取景参考（按 `layout` 值）

视频容器的选择器是 `#video-wrap`。使用 `tl.to('#video-wrap', { ...bounds }, T)` 在卡片之间为其
边界制作动画。初始边界应内联设置在元素上，以匹配 card-01 的
布局。选择 0.5–0.7s 的过渡时长，并使用 `ease: 'power2.inOut'`。

**装饰性边框**（`clean` / `hairline` / `polaroid`）作为 `#video-wrap` 的
**同级元素**，并在布局过渡期间随其移动。请参阅
[`references/frames/`](references/frames/)，其中包含每种边框的位置
HTML、建议的 CSS，以及它所搭配的布局。简要规则：
`overlay` 布局会禁用装饰性边框（全出血视频会与边框元素冲突）；
PiP 布局已有自己的胶囊式处理（border-radius + 白色描边 + 阴影），因此仅在
`split` / `stack` 顶部添加装饰性边框。

在每种合成布局下，`#video-wrap` 的 **GSAP 目标查找表**
（横向 1920×1080——纵向和 4:5 请参阅 `references/layouts/*.html`，
其中列出了全部三种比例）：

| 合成布局                               | 典型 card.zone     | `#video-wrap` GSAP 目标                                                  | 额外 css 类                                |
| ------------------------------------ | ----------------- | ------------------------------------------------------------------------- | ------------------------------------------ |
| `split`                              | `side-panel`      | `{ left: 960, top: 0, width: 960, height: 1080 }`                         | —                                          |
| `stack`                              | `lower-third`     | `{ left: 14, top: 14, width: 1892, height: 548 }` (顶部 52%)              | —                                          |
| `pip`（右下）                         | `fullscreen`      | `{ left: 1480, top: 760, width: 400, height: 300 }`                       | `pip-pill`（border-radius + 描边 + 阴影）  |
| `pip`（左上）                         | `fullscreen`      | `{ left: 40, top: 40, width: 400, height: 300 }`                          | `pip-pill`                                 |
| `overlay`（视频全出血）               | `video-overlay`   | `{ left: 0, top: 0, width: 1920, height: 1080 }`（相较默认值无变化）       | —                                          |
| **隐藏视频**（纯图形时刻）             | `fullscreen`      | `{ opacity: 0 }`（或移出画布）                                            | —                                          |

在进入或离开 pip 时刻时，切换 pip-pill 边框元素（border-radius + 白色描边 + 投影）：

```js
// Enter pip — add chrome
tl.set("#video-wrap", { className: "video-wrapper pip-pill" }, T);
tl.to(
  "#video-wrap",
  { left: 1480, top: 760, width: 400, height: 300, duration: 0.6, ease: "power2.inOut" },
  T,
);

// Leave pip — back to clean full-bleed
tl.set("#video-wrap", { className: "video-wrapper" }, T_NEXT);
tl.to(
  "#video-wrap",
  { left: 0, top: 0, width: 1920, height: 1080, duration: 0.6, ease: "power2.inOut" },
  T_NEXT,
);
```

**卡片宿主边界与区域一致**。使用第 6 步顶部的表格将卡片的 `zone` 解析为
像素边界，然后将这些值写入卡片宿主的内联 `style="left:Xpx;top:Ypx;width:Wpx;
height:Hpx;..."`。对于 `video-overlay` 区域（叠加配方），卡片宿主会填满整个画布——
`.card .root` 内的 CSS 决定实际可见卡片的位置。

#### HyperFrames 布局 / 动画 QA 规则

- 先构建每张卡片的静态主画面：卡片完全可见且可读的时刻。
- 确认视频、卡片、字幕/说明文字和图表不会意外重叠。
- 确认隐藏的视频区域被画面裁剪，且不会在预期边界之外可见。
- 将一个暂停的主时间线注册为 `window.__timelines["talking-head-recut"]`。
- 在页面加载时同步构建时间线；不要使用 `async`、`setTimeout`、Promises 或媒体 `play()` 调用。
- 不要在渲染路径中使用 `Math.random()` 或 `Date.now()`。
- 不要使用 `repeat: -1`；应根据视频时长计算有限次数的重复。
- 动画应优先使用 GSAP 变换和不透明度（`x`、`y`、`scale`、`rotation`、`opacity`），而非布局属性（`top`、`left`、`width`、`height`）。
- 为 `#video-wrap` 等包装器制作动画，而不是直接对视频元素尺寸制作动画。
- 避免同时从多个时间线对同一元素上的同一属性制作动画。
- 使用 `data-track-index`，不要使用 `data-layer`；使用 `data-duration`，不要使用 `data-end`。
- 每个定时元素（`card-host`、子合成等）都**必须**在其自身类名之外包含 `class="clip"`——例如 `class="card-host clip"`。HyperFrames 运行时使用 `.clip` 将可见性限制在 `data-start … data-start+data-duration` 窗口内。没有它，元素会在整个视频期间保持可见（lint：`timed_element_missing_clip_class`）。
- 对于 body / 全局 `font-family`，请列出**具体字体名称**（`'Inter', 'Caveat', …`）——不要使用诸如 `var(--font-family)` 的 CSS 变量。HyperFrames 字体解析器在静态分析期间不会展开 CSS 变量（lint：`font_family_without_font_face`）。卡片内部仍可使用 `var(--font-family)`，因为其 `@font-face` 声明已加载。

### 10. 渲染为 MP4

```bash
cd "$WORK_DIR"
PRODUCER_BROWSER_GPU_MODE=hardware npx hyperframes render public \
  --skill=talking-head-recut \
  -o output.mp4 \
  --fps 30
```

`hyperframes render <dir>` 会读取 `<dir>/index.html` 并生成 MP4。
规范合成会将视觉 `<video>` 静音，并将相同来源挂载为根 `#source-audio` 轨道，因此渲染出的 MP4 会保留
说话人头像音频，无需手动重新混流。这使用独立的音轨，
而不是 `data-has-audio="true"`，因此其音量和闪避仍可在时间线上独立
控制。
强烈建议在 macOS 上使用标志 `PRODUCER_BROWSER_GPU_MODE=hardware`（或 `--browser-gpu`）——
仅使用软件渲染的 Chrome 在大多数笔记本电脑上会超时。

在完整渲染之前进行健全性检查时，可在
特定时间戳捕获单帧：

```bash
npx hyperframes snapshot public --at 5    # → public/snapshots/frame-00-at-5s.png（单个 --at 会忽略 --out）
```

### 11. 报告结果

告知用户：

- 工作目录路径
- `storyboard.json`（你设计的卡片大纲）
- `public/cards/*.html`（每张卡片一个 HTML 文件）
- `public/index.html`（组装后的合成内容）
- `output.mp4`（最终视频）
- 所用的 ASR 提供商
- 卡片数量 + 你的选择方式（用 1 句话说明）
- 任何缺失的密钥或质量方面的注意事项

**可选实时预览（仅在请求时提供）。** 片段会原样在 `public/index.html` 内播放，并在其上方叠加覆盖层，因此能够如实预览。**运行期间不要打开它。** 当用户提出请求时，在渲染完成**后**启动一个长期运行的服务器，并报告该 URL：

```bash
(cd "$WORK_DIR/public" && npx hyperframes preview --background)   # or `npx hyperframes play` for a shareable link
```

除非用户提出要求，否则不要删除工作目录。