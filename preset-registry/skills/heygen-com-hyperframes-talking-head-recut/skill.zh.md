---
name: talking-head-recut
description: Package an existing talking-head / interview / podcast video with timed, designed GRAPHIC OVERLAY cards — kinetic titles, lower-thirds, data callouts, quotes, side panels, picture-in-picture — synced to the transcript, on a 16:9 / 9:16 / 4:5 canvas of your choice; the clip plays untouched underneath. Trigger on "graphic overlays", "on-screen graphics", "package / dress up my video". Not plain subtitles (/embedded-captions). Unclear → /hyperframes.
---
> **首先，保持此 skill 为最新状态 — 运行前请先向用户确认：** `npx hyperframes skills update talking-head-recut`。如果一切都是最新的，该命令会快速空操作；否则，它会在你依赖这些 skill 之前，同时刷新此 skill 及其依赖的核心领域 skill。

# Talking Head Recut

Talking Head Recut 接收一个能够**完整播放**的本地视频，并在其上叠加一系列经过设计、带有时间控制的**图形卡片** — 标题、下三分之一字幕、数据标注、引语、侧边面板、画中画 — 与视频中正在讲述的内容同步。代理负责设计卡片（时间安排 + 内容），并**直接在对话中编写每张卡片的 HTML**，随后组装成单个组合 HTML，并通过 `hyperframes` 将其渲染为 MP4。这里没有固定的原型列表，也没有预设的卡片结构 — 叠加内容会根据转录文本的实际内容自然生成。

> **入口是 `/hyperframes`。** 此 skill 将一个**现有的真人出镜视频片段**与**经过设计的图形卡片**（标题、下三分之一字幕、数据标注、引语、侧边面板、画中画）组合起来 — 不是普通字幕（将说出的话以文本形式呈现）。**视频片段会原样播放。** 任何其他意图 — 普通字幕、独立图形、从零开始制作视频 — 或任何不确定情况 → 首先阅读 `/hyperframes`：意图层负责所有路由决策。

> **`embedded-captions` 的图形包装同类 skill。** 字幕会将_说出的话_
> 作为可读字幕添加；此 skill 则在播放中的视频上添加_经过设计的图形_。
> 普通字幕 → `embedded-captions`。从零开始制作视频 → 创建工作流（`product-launch-video` / `faceless-explainer` / …）。

通过 `/hyperframes` 路由时，意图层只确认输入内容（哪个视频片段），并将**渲染策略问题公告为延后询问** — 画面比例、布局、样式组和卡片数量保留到第 7 步，此时经过探测的素材和转录文本可以为推荐提供依据；该层的运行形态问题不适用。存在 `BRIEF.md` 时，其中包含已确认的输入和用户备注 — 请先阅读。

工作目录中的可检查中间文件：

- `metadata.json` — 时长 / 宽度 / 高度 / fps
- `audio.mp3` — 提取出的音频
- `transcript.json` — 扁平的**单词数组** `[{ text, start, end }, …]`（Whisper；没有 `segments`，也没有 `words` 包装层）
- `storyboard.json` — 轻量级卡片大纲（代理的计划）
- `public/cards/card-XX.html` — 每张卡片对应一个 HTML 片段
- `public/index.html` — 最终组装的组合内容
- `output.mp4` — 渲染后的视频

## CLI 解析

```bash
# hyperframes — transcription (local Whisper) + rendering the assembled HTML to MP4
npx hyperframes --help
```

此 skill 完全基于 **hyperframes** CLI 以及系统中的 `ffmpeg` / `ffprobe` 运行。
转录使用 `hyperframes transcribe` 调用本地 **Whisper** 完成 — 不需要第三方服务、API 密钥或受速率限制的代理。

## 工作流

### 1. 检查环境

```bash
npx hyperframes doctor          # ffmpeg, headless browser, render deps
# confirm bundled assets:
ls "<SKILL_DIR>/assets/fonts" "<SKILL_DIR>/assets/vendor/gsap.min.js"
```

必需项：

- `ffmpeg` / `ffprobe`（系统级）
- `<SKILL_DIR>/assets/fonts/*.woff2`、`<SKILL_DIR>/assets/vendor/gsap.min.js`（此 skill 内置，在步骤 9 中暂存到工作目录）

转录无需密钥 — `hyperframes transcribe` 在本地运行 Whisper（步骤 4）。

在 macOS 上强烈建议为 `hyperframes render` 设置：

```bash
export PRODUCER_BROWSER_GPU_MODE=hardware
```

### 2. 创建工作目录

所有产物都存放在 `videos/<project-name>/` 下 — 这与其他视频工作流（`product-launch-video` / `faceless-explainer` / `pr-to-video`）采用相同的约定。将 cwd 保持在工作区根目录；下面的所有操作都会写入这一个子目录。

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

输出：`metadata.json`（读取 `width` / `height` / `duration`；fps = 对 `r_frame_rate` 分数求值，例如 `30000/1001 → 29.97`）以及 `audio.mp3`。

### 4. 转录

```bash
npx hyperframes transcribe "$WORK_DIR/audio.mp3" -d "$WORK_DIR" --json --model small.en
```

本地 **Whisper** — 无需 API 密钥、代理或速率限制。它会将逐词级别的 `transcript.json` 写入工作目录（包含单词 `text` 以及 `start` / `end` 时间戳）。读取该文件，获取驱动步骤 6 中卡片时序的单词 / 句子时间；如果需要按片段分组，可自行根据标点 / 停顿将单词分组为句子。

**将时间限制在媒体时长内。** Whisper 返回的最后一个单词的 `end` 可能会略微超出实际片段长度 — 将每张卡片的 `endSec` 和 `composition.durationSeconds` 都限制在 `metadata.json` 的时长以内，否则渲染结果会在视频末尾显示黑色尾帧。

### 5. 修正转录文本

`transcript.json` 是一个**扁平的单词对象数组** — `[{ "text": "...", "start": s, "end": s }, …]`（没有 `segments` 数组，也没有 `words` 包装层；每个单词的键是 **`text`**）。读取并修正明显的 ASR 错误：

- 同音词、产品名称、技术术语、标点符号
- 直接编辑单词的 `text`；**保留其 `start` / `end`** 时间戳
- 不存在预先分组的 `segments` 数组 — 当你需要用于卡片时序的片段级内容时，**自行将单词分组为句子**（在终止标点 / 停顿处拆分）

### 6. 起草轻量级分镜（在聊天中）

**不涉及 CLI。**读取 `transcript.json` + `metadata.json`，直接设计卡片。`storyboard.json` 是 agent 内部的规划产物 — 没有 CLI 命令会读取它；它的作用是帮助你在为每张卡片编写 HTML 之前理清思路。保持其结构与下面的示例一致，这样同一份大纲就能指导你在步骤 9 中编写的 composition：

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

| field                   | type                                       | purpose                                                                                               |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `id`                    | string                                     | 用于卡片 HTML 和 GSAP 选择器的稳定 id                                                                  |
| `intent`                | string                                     | 自然语言描述；用于卡片合成                                                                           |
| `startSec` / `endSec`   | number                                     | 以秒为单位的时间（endSec > startSec）                                                                  |
| `accentIndex`           | 0 \| 1 \| 2 \| 3 \| 4                      | 指定该卡片使用 5 种主题强调色中的哪一种                                                               |
| `zone`                  | enum (see below)                           | 卡片在画布上的位置                                                                                     |
| `contentHints`          | object                                     | 自由格式的数据包；代理会将 kicker/title/detail/data/quote 放入其中                                     |
| `archetype` (optional)  | string                                     | 可附加的自由格式标签，用于记住卡片的模式；缺省时表示自由格式，这是默认设置                           |
| `transition` (optional) | enum: `cut` \| `fade` \| `slide` \| `wipe` | 声明卡片之间的过渡方式                                                                                 |

**五种 `zone` 值：**

| zone              | resolved bounds                                | when to use                             |
| ----------------- | ---------------------------------------------- | --------------------------------------- |
| `fullscreen`      | 覆盖整个画布                                     | 主视觉时刻、大数字、箴言                   |
| `whiteboard-area` | 内缩 40px 的边距（或纵向画布高度的 45%）          | 密集数据 / 带注释的内容                    |
| `lower-third`     | 底部 30% 的区域                                  | 在可见视频上叠加注释                       |
| `side-panel`      | 右侧 42%（横向）或底部 40%（纵向）               | 数据侧、视频另一侧                         |
| `video-overlay`   | 整个画布，要求卡片大部分透明                     | 在全出血视频上叠加注释                     |

在第 9 步组装构图时，根据上表将每张卡片的 `zone`
解析为卡片承载容器上的像素边界。
视频边界在构图层级通过 `videoTrack.bounds` **设置一次**；
若要让视频看起来像是在卡片之间“移动”，请在构图的 `<script>` 中针对
`#video-wrap` 编写 GSAP 补间（参见第 9 步）。

**不规定卡片角色，也不规定叙事弧线。** 卡片源自视频实际表达的内容——可以全部是引语，也可以全部是数据，
可以用一个数字开场，也可以用一个故事开场。让文字稿决定节奏。

**需要多少个要点卡片？——根据时长 + 信息密度自动推断。** 没有固定的
上限。先根据视频时长选择**基础节奏**，再根据**信息密度**进行调整。唯一固定的是
**下限：至少 5 张卡片**，这样即使是短视频也能保持节奏感。

**步骤 1 —— 根据时长确定基础节奏**（中等密度下每张卡片的自然时长）：

| 视频时长             | 基础节奏（每张卡片的秒数） | 理由                                   |
| ------------------ | ------------------------ | -------------------------------------- |
| < 60s（短视频） | **6–8s**                 | 观众期待短内容中有更快的切换      |
| 60s – 3 min        | **8–12s**                | 正常的社交媒体节奏                          |
| 3 – 10 min         | **12–20s**               | 留出呼吸空间；每张卡片承载更多内容 |
| 10 – 30 min        | **20–35s**               | 长篇讲座 / 访谈节奏        |
| > 30 min           | **30–60s**               | 分集式、接近章节的感觉                 |

**步骤 2 —— 信息密度乘数**（与基础节奏相乘）：

| 转录文本中的信号                                                                                                    | 乘数 | 效果                   |
| --------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------ |
| **高密度**——包含大量数字、明确的论点、短促的节奏、类似列表的枚举，每 1–2 句话就产生一个新观点 | **× 0.7**  | 更快切换，卡片更多  |
| **中等密度**——数据与叙述交织                                                               | **× 1.0**  | 基础节奏                |
| **低密度**——一个延展的故事、反复换角度阐释、缓慢的反思节奏、逐步展开的单一论点                 | **× 1.5**  | 更慢切换，卡片更少                   |

**步骤 3 —— 计算：**

```
secPerCard = basePace × densityMultiplier
cardCount  = max(5, round(videoDurationSec / secPerCard))
```

示例（注意——**没有上限约束**；长视频自然会产生更多卡片）：

- **30s 短视频，单个核心笑点（低密度）** → 7 × 1.5 = 10.5s/卡片 → round(30/10.5)=3 → 取下限为 **5** 张卡片
- **60s 反思式独白（低密度）** → 10 × 1.5 = 15s/卡片 → **4** → 取下限为 **5** 张卡片
- **121s 信息丰富的出镜讲解（高密度）** → 10 × 0.7 = 7s/卡片 → **17** 张卡片
- **5 min 访谈，混合密度** → 16 × 1.0 = 16s/卡片 → **19** 张卡片
- **10 min 深度解析，高密度** → 16 × 0.7 = 11s/卡片 → **55** 张卡片
- **30 min 讲座，中等密度** → 28 × 1.0 = 28s/卡片 → **64** 张卡片
- **1 hr 播客，低密度** → 45 × 1.5 = 67.5s/卡片 → **53** 张卡片

当一张卡片的持续时间超过约 15s 时，应规划更丰富的卡片（数据块、
多步骤展示、通过交错动画逐步展开的多个子要点）——静态的一行文字超过 8s 后会变得
乏味。对于包含许多超过 30s 的卡片的长内容，可以考虑将时间线拆分成
子合成（每个章节一个 .html，通过
`data-composition-src` 挂载），这样每个文件中的 GSAP 时间线更易于管理
——请参阅 `timeline_track_too_dense` HyperFrames lint 警告。

`content` 可以是普通字符串（"Title: annualized 5.69%\nNotes: ..."），也可以是能够表达这些数据的任意 JSON
结构。代理会为每张卡片决定结构。

**可选片尾。** 此技能**不包含固定的品牌片尾**。如果用户需要结束卡片，请自行设计一个中性的片尾（文字标志 + 单行标语，约 1.5-2 秒，淡入 -> 短暂停留 -> 淡出），将其追加到 `cards[]`，并将 `composition.durationSeconds` 延长至其 `endSec`。否则在最后一张内容卡片结束。

### 7. 决定渲染策略

#### 先与用户确认视觉方向（首先执行此操作）

在开始设计卡片或决定边界之前，**请用户选择输出比例、布局、样式和卡片密度预设**。帧会根据所选的布局 × 样式组合自动选择（参见下方的“自动选择帧”表）。发送问题之前，**预先计算以下两项**：

1. 根据源视频的宽高比（`metadata.json` 中的 width / height）计算 `recommendedRatio`：
   - `sourceAspect = width / height`
   - `sourceAspect ≥ 1.5`（≥ 约 3:2 宽屏）→ 推荐 **`16:9`**
   - `sourceAspect ≤ 0.7`（≤ 约 9:13 竖屏）→ 推荐 **`9:16`**
   - `0.7 < sourceAspect < 1.5`（接近正方形）→ 推荐 **`4:5`**

   在推荐选项的标签中添加“（推荐 · 与源视频 X:Y 匹配）”，
   让用户了解推荐理由。

2. 根据步骤 6 计算 `autoCount`（`max(5, round(videoSec / (basePace ×
   densityMultiplier)))`），这样“自动”选项的标签就可以显示具体数量。

**环境兼容性：选择可用的最佳提问渠道。**
并非每个运行时都提供相同的结构化提问工具。按以下顺序执行：

1. **原生澄清工具** —— 使用下方的结构化四问题调用。
2. **其他原生澄清工具**（例如 `ask_question`、
   `request_user_input`、特定 IDE 的提示工具）—— 使用该工具，并保留相同的四个问题文本和选项列表。保留推荐标记和预先计算的值。
3. **没有原生工具**（Codex CLI、纯文本运行时）—— **直接在普通对话中提问**。使用本节末尾的纯文本模板。保持为**一条消息、4 个编号问题**（全局限制为每轮 2–5 个问题；这里符合要求）。

适用于所有渠道的规则：

- 每轮**最多提出 2–5 个问题**。这里的 4 个问题符合要求。
- 即使缺少的信息不会阻止渲染，也要**询问一次，以确认会实质影响最终输出的参数**（比例、布局、样式、cardCount）。
- 如果用户已经预先批准默认值（“直接使用默认值”、“不需要询问”或“全部自动选择”）、要求你不要提问，或当前运行带有持续的自主执行信号（“给我惊喜”/“你来决定”——`../hyperframes-core/references/brief-contract.md` § 1）——**完全跳过提问**，并使用：`recommendedRatio`、`layout="stack"`（跨比例最安全的默认值）、根据对话语气从最中性的组别（编辑/数据）中选择的 `style`、`autoCount`。用一句话告知用户你选择的内容，然后继续。

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

**关于“Other”** — `AskUserQuestion` 会自动在卡片数量问题中添加一个“Other”选项。用户可以直接输入一个数字（例如“8”“20”）作为 `cardCount` 目标值。将输入解析为整数：如果解析成功 → 使用该值（最低限制为 5）；如果解析失败 → 回退到“auto”。

**通道 B — 纯文本回退**（Codex CLI、没有原生问题工具的运行时）。将以下内容作为一条普通消息发送，然后等待回复。使用 1/2/3/4 的项目样式可使回复更易解析：

```text
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

- 接受宽松格式：`"1A 2C 3B 4A"`、`"A C B A"`、`"16:9 / pip / data / auto"`、完整句子或 `default`。
- 如果任何答案含义不明确 → 仅重新询问含义不明确的选项（仍需保持在 2–5 个问题的上限内）。
- 如果用户说“default / auto / use all recommendations” → 跳过，不再重新询问。

用户通过任一通道回答后：

1. **根据比例答案解析输出画布** — 以下是要写入的确切 `storyboard.composition.width / height` 值：

   | 用户选择 | composition.width × height | storyboard.layout 字段                                       |
   | ----------- | -------------------------- | ------------------------------------------------------------- |
   | `16:9`      | **1920 × 1080**            | `"landscape"`                                                 |
   | `9:16`      | **1080 × 1920**            | `"portrait"`                                                  |
   | `4:5`       | **1080 × 1350**            | `"portrait"`（架构将 4:5 视为纵向 — 高度 > 宽度） |

   对于 `references/layouts/*.html` 中的 **4:5 边界** — 这些文件只记录横向（1920×1080）和纵向（1080×1920）。对于 4:5（1080×1350），通过**从纵向按比例缩放**来推导边界：保留水平值，将垂直值乘以 `1350/1920 ≈ 0.703`。示例：`overlay` 纵向卡片 =
   `{ x: 24, y: 1280, w: 1032, h: 564 }` → 4:5 卡片 =
   `{ x: 24, y: round(1280 × 0.703), w: 1032, h: round(564 × 0.703) }`
   = `{ x: 24, y: 900, w: 1032, h: 397 }`。

2. **根据转录文本的语气，将风格组映射到具体风格**——选择最符合的一种，但必须限定在用户选择的组内。如果无法在组内的两个具体风格之间做出判断，则再次发送 `AskUserQuestion`，提供这 2–4 个具体风格选项。

3. **根据密度回答确定最终的 `cardCount`**：

   | 用户选择             | 最终 `cardCount`                           |
   | -------------------- | ------------------------------------------ |
   | Auto（推荐）         | 已计算出的 `autoCount`                     |
   | Fewer                | `max(5, round(autoCount × 0.6))`            |
   | More                 | `round(autoCount × 1.5)`（不设上限）       |
   | Other = "<n>"（整数） | `max(5, parseInt(n))`                      |
   | Other = 其他任何内容 | 回退到 `autoCount`                         |

4. **根据下表自动选择视频帧**（帧不询问用户——由布局 × 风格决定）：

   | 布局      | warm-paper styles（academic / whiteboard / editorial / xhs） | clinical styles（audit / swiss / terminal / minimal） | experimental styles（geom / spotlight） |
   | --------- | ------------------------------------------------------------ | ----------------------------------------------------- | --------------------------------------- |
   | `split`   | `polaroid`                                                   | `hairline`                                            | `clean`                                 |
   | `stack`   | `polaroid`                                                   | `hairline`                                            | `clean`                                 |
   | `pip`     | `clean`（pip pill 已经带有 chrome）                          | `clean`                                               | `clean`                                 |
   | `overlay` | `clean`（全出血布局禁止装饰性帧）                             | `clean`                                               | `clean`                                 |

5. **用一句话告诉用户你的选择**——包括比例（+ 画布尺寸）、布局、具体风格、帧和最终的 `cardCount`——然后继续执行第 7 步的其余部分（逐卡布局、动态模式）。
6. 将这五个值（ratio / layout / style / frame / cardCount）记录到工作记忆中（无需 schema 字段）；在第 8 步编写每张卡片的 HTML 时，以及读取匹配的 `references/<dim>/<key>.html` 获取 tokens 和结构时引用它们。

如果用户通过“Other”选择了一个不在 10 种风格库中的自由文本风格名称，则将其视为自行设计全新卡片视觉效果的提示，但仍须以所选布局的边界为基础。

#### 渲染策略输入

在第 7.0 步锁定 ratio / layout / style / cardCount / frame 后，其余逐卡决策如下：

- **GSAP 目标内部的源视频适配方式**：视频元素使用 `object-fit: cover`，并裁剪到 `#video-wrap` 的 tween 边界内。如果希望完全不裁剪（例如横向画布中的纵向源视频不应被裁掉上下部分），应将 tween 的目标设为匹配源视频宽高比的矩形，并让周围画布透出（或使用卡片 / 背景填充）。
- **每张卡片的 `card.zone`**：根据所选的构图布局确定（split → side-panel、stack → lower-third、pip → fullscreen、overlay → video-overlay），或者为单次变体选择不同的 zone（hero / quote 使用 fullscreen，密集数据使用 whiteboard-area）。
- **每张卡片的 `accentIndex`**：每张卡片从 5 个主题强调色中取一个。跨卡片变化以形成节奏；当两张卡片属于同一个叙事节拍时，重复使用相同的 index。
- **动态词汇**：从 `data-anim` 类型中选择 2–3 种可重复使用的模式（见后面的表格），并坚持使用它们，以保持构图的一致性。

从这些 `themeId` 调色板中选择（在组合 `<style>` 块中将它们用作 `--accent-N` / `--bg` / `--text` CSS 变量）：

| themeId | accent 调色板（5 种颜色）                 | board 背景          | 文本      |
| ------- | ----------------------------------------- | ------------------- | --------- |
| classic | `#1971c2 #e03131 #2f9e44 #e8590c #9c36b5` | `#FFF9E3`（纸张） | `#1e1e1e` |
| noir    | `#4cc9f0 #f72585 #4ade80 #fb923c #a78bfa` | `#1a1a1a`          | `#f1f1f1` |
| mint    | `#0077b6 #d62828 #2d6a4f #e76f51 #7209b7` | `#e8faf0`          | `#1b4332` |
| craft   | `#bf5700 #d62728 #6c757d #e9b54a #3d5a80` | `#f6efe1`          | `#2d2d2d` |
| slate   | `#0ea5e9 #ef4444 #22c55e #f97316 #a855f7` | `#1e293b`          | `#f1f5f9` |
| mono    | `#000 #555 #888 #aaa #ccc`                | `#fff`             | `#000`    |

可用字体（`<SKILL_DIR>/assets/fonts/` 中的 woff2，在步骤 9 中暂存到工作目录）：`Caveat`（手写体）、`LXGW WenKai TC`（中文手写体）、`Inter`（现代无衬线字体）、`Virgil`（几何手写体）。通过 `@font-face` 或直接使用 `font-family` 引用。

如需获取视觉模式的灵感，`<SKILL_DIR>/references/styles/` 提供了 10 个独立的参考卡片（academic / editorial / minimal / spotlight / geom / whiteboard / audit / terminal / swiss / xhs），你可以复制它们作为起点，但**不必受限于匹配其中任何一种**。每张卡片都是独立的设计。

#### 视觉设计库（<SKILL_DIR>/references/）

除了组合级别的 `themeId` 之外，该 skill 还在 `<SKILL_DIR>/references/` 中提供了更丰富的**参考库**，涵盖三个可以自由组合的**正交**视觉维度：

```
Style  ×  Layout  ×  VideoFrame
 (10)      (4)         (3)
```

| 维度       | key                                                                                               | 决定的内容                                                   |
| ---------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **style**  | `academic` `editorial` `minimal` `spotlight` `geom` `whiteboard` `audit` `terminal` `swiss` `xhs` | 卡片的视觉语言——字体、颜色、装饰以及卡片内布局                 |
| **layout** | `split` `stack` `pip` `overlay`                                                                    | 源视频和卡片如何共享画布                                       |
| **frame**  | `clean` `hairline` `polaroid`                                                                      | 视频元素周围的装饰性外框                                       |

阅读 `<SKILL_DIR>/references/DESIGN_INDEX.md`
以了解完整矩阵和宽泛的选择指南（采访 / 产品发布 / 数据分析 /
社交片段 / 技术教程 / 情感故事……）。当你决定使用特定的
style / layout / frame 时，阅读对应的文件：

- `references/styles/<key>.html` — 包含该
  style 的 CSS token（颜色、字体、内边距、装饰）以及占位 takeaway 的独立卡片片段。复制 `.card[data-card-id="ref-<key>"]` 样式块，将 data-card-id 重命名为你卡片的 id，再用真实 takeaway 替换占位内容即可。
- `references/layouts/<key>.html` — 同时提供横屏和竖屏的精确 `videoBounds` + `cardBounds`，以及可复制粘贴到 `storyboard.json` 每张卡片 `layout` 字段中的 JSON 片段。
- `references/frames/<key>.html` — 添加为 `#video-wrap` 的同级元素的装饰性 HTML，以及组合 CSS 中的放置说明。

按卡片分别选择 `style × layout × frame`——只要过渡自然流畅，就可以在卡片之间同时切换这三项。常见的节奏是：
以 `editorial × overlay × clean` 开场，为数据卡切换到 `audit × split × hairline`，
最后以 `whiteboard × pip × polaroid` 收尾。

这 10 种样式是技能侧的设计令牌，**而不是构图级主题**——
无需在 `storyboard.composition` 中声明；它们存在于每张卡片的 HTML 中。
`themeId` 字段仍可选择构图级调色板（见上表），用于控制页面主体背景和视频边框装饰。

#### 布局构图（卡片 + 视频）

每张卡片需要协调做出两个决定，以确定它如何与源视频共享画布：

- **`card.zone`**（在 `storyboard.json` 中声明）——5 个架构值之一；在第 9 步为卡片宿主包装器的内联 `style` 编写时，根据第 6 步的表格将其解析为像素边界。
- **此卡片时间窗口内的 `#video-wrap` 边界**（在构图的 GSAP 时间线中以命令式方式声明）——代理会将 `#video-wrap` 补间到每次布局过渡的目标矩形区域。

架构不会存储每张卡片的视频边界。`videoTrack.bounds` 在构图级别只设置一次（默认为完整画布）。卡片之间视频的“移动”完全由 `index.html` 中编写的 GSAP 动画实现。不存在 `card.layout` 字段——本文档的早期版本曾虚构过该字段；实际架构只有 `card.zone`。

**4 种构图布局**（来自 `references/layouts/`）——每种都是将 `zone` 与 `#video-wrap` 补间目标配对的方案：

| 构图布局 | 推荐的 `card.zone` | GSAP 对 `#video-wrap` 的目标（横屏 1920×1080）                       | GSAP 对 `#video-wrap` 的目标（竖屏 1080×1920）                | 使用场景                                     |
| ------------------ | ----------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `split`            | `side-panel`            | `{ left: 960, top: 0, width: 960, height: 1080 }`                         | `{ left: 0, top: 960, width: 1080, height: 960 }`（下半部分）   | 演讲者 + 数据并排 / 50:50 权重      |
| `stack`            | `lower-third`           | `{ left: 14, top: 14, width: 1892, height: 548 }`（顶部 52%）               | `{ left: 0, top: 0, width: 1080, height: 844 }`（顶部 44%）         | 演讲者在上 + 摘要卡片在下             |
| `pip`              | `fullscreen`            | `{ left: 1480, top: 760, width: 400, height: 300 }` + 添加 `.framed` 类 | `{ left: 690, top: 28, width: 360, height: 203 }` + 添加 `.framed` | 内容为主的卡片 + 角落画中画                 |
| `overlay`          | `video-overlay`         | `{ left: 0, top: 0, width: 1920, height: 1080 }`（全出血）             | `{ left: 0, top: 0, width: 1080, height: 1920 }`                  | 全视频上的电影感 / 戏剧感 / 玻璃卡片 |

对于 4:5 (1080×1350)，将 portrait y/h 值按 `1350/1920 ≈ 0.703` 进行缩放
（参见第 7.0 步 Channel A / Channel B 的 `recommendedRatio` 分辨率
表）。

**一次性变体的其他区域值**（仍使用 `card.zone`；不要使用虚假的
"layout" 字段）：

| `zone`            | resolved bounds                                        | common use                            |
| ----------------- | ------------------------------------------------------ | ------------------------------------- |
| `fullscreen`      | 覆盖整个画布                                            | 主视觉卡片，视频渐变为隐藏状态/画中画 |
| `whiteboard-area` | 内缩 40px 边距（横向）或底部 45%（纵向）                 | 密集数据卡片，保留空白边距             |
| `lower-third`     | 底部 30% 区域                                           | 采访人物注释                           |
| `side-panel`      | 右侧 42%（横向）或底部 40%（纵向）                       | 侧边栏 / “分屏”配方                    |
| `video-overlay`   | 整个画布；预期卡片根元素为透明                          | 全出血视频上的玻璃叠加层                |

你可以为每张卡片混用不同配方——根据当前时刻的需要选择
`card.zone`，然后在卡片之间为 `#video-wrap` 编写 GSAP 补间。

#### 分镜渲染契约

`storyboard.json` 是代理内部的规划产物——没有 CLI
命令会解析它。它用于在你编写每张卡片的 HTML 之前，明确记录时序和内容决策。遵循下面的 v3 风格结构，以便同一份大纲驱动你在第 9 步中组装的构图。

必需结构（完整示例见第 6 步）：

- `schemaVersion: 3`
- `composition: { fps, width, height, durationSeconds, layout, themeId, seed }` — 注意 `durationSeconds`/`fps`/`themeId`/`layout` 位于 **`composition` 内部**，而不是顶层
- `videoTrack: { sourcePath, startSec, endSec, bounds? }` — 视频边界默认为整个画布
- `subtitles: { enabled, ... }`
- `cards[]` — 每张卡片包含 6 个必需字段：`id`、`intent`、`startSec`、`endSec`、`accentIndex`、`zone`、`contentHints`

规则：

- 卡片时间必须位于 `composition.durationSeconds` 范围内，除非有意重叠，否则不应重叠（发生重叠时，使用 `data-track-index` 控制 z 轴顺序）。
- 视觉细节位于卡片 HTML 片段中（第 8 步），而不是 `contentHints` 中。`contentHints` 是你用于设计卡片的结构化提示；最终渲染效果由 HTML 决定。
- 保持分镜结构稳定——尽管没有任何程序解析它，但你会在编写第 8/9 步时回读它；保持一致有助于让卡片 ID 和时序同步。
- 代理侧的决策，例如“I picked overlay × geom × clean”，不属于 `storyboard.json`——将其保留在工作记忆中，并在编写卡片 HTML 和 GSAP 补间时使用。

**与视频共享画布的卡片必须使用透明背景。**
当 GSAP 补间使视频在卡片后方/旁边保持可见时（叠加层配方、画中画配方，或任何
`card.zone = 'lower-third' | 'video-overlay'` 时刻），卡片的 `.root` **不得**绘制全不透明背景——
否则会遮挡视频。有两种模式：

```css
/* Pattern A: transparent root, page body provides the cream backdrop */
html,
body {
  background: var(--bg);
}
.card[data-card-id="card-X"] .root {
  background: transparent;
}

/* Pattern B: explicit per-card background ONLY for fullscreen cards */
.card[data-card-id="card-hero"] .root {
  background: var(--bg);
}
.card[data-card-id="card-overlay"] .root {
  background: transparent;
}
```

对于 `side-panel`-zone 卡片（split recipe），卡片宿主本身已经只占画布的一半，因此使用不透明的卡片背景没有问题——它只会覆盖自己所在的那一半。

### 8. 编写每张卡片的 HTML

为每张卡片创建 `$WORK_DIR/public/cards/{card-id}.html`。每个文件都包含一个遵循以下契约的单根 HTML 片段：

#### 卡片 HTML 契约

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

**硬性规则**（`hyperframes` lint 会拒绝违反这些规则的内容）：

- 单个根 `<div class="card" data-card-id="{cardId}">`
- 内联 `<style>` 规则必须以上述作用域选择器作为前缀
- **不得包含 `<script>` 标签**
- `src=` / `href=` 中**不得包含外部 URL**（不得使用 CDN 或远程字体）
- **不得使用内联事件处理器**（如 `onclick=` 等）
- 所有资源必须通过相对路径引用，并位于同一个 `public/` 目录中
- 颜色必须使用 `var(--accent-N)` 等形式，以便在不同主题之间移植

**动画通过声明定义，而不是编码实现。** 只能使用 `data-anim-*` 属性；绝不要编写 `<script>` 来实现动画。你会在第 9 步中将每个 `data-anim-*` 声明编译到单一的主 GSAP 时间轴中。

#### 卡片尺寸——肖像模式下优先适配移动端

`references/styles/*.html` 中的 10 个样式文件按照**1920×1080 横向**预览进行尺寸设置。当 `storyboard.layout = "portrait"`（1080×1920，这是社交媒体 / 移动端的主要使用场景）时，**放大每个视觉元素的尺寸**——手机通常距离屏幕较近，相同的像素数量在横向电视风格的画布上看起来会更小。

| token                     | landscape baseline | **portrait target** | scale         |
| ------------------------- | ------------------ | ------------------- | ------------- |
| title (h1/h2 hero)        | 64–96px            | **88–132px**        | ×1.35         |
| detail / body             | 24–30px            | **30–40px**         | ×1.30         |
| kicker / chip label       | 14–16px            | **18–22px**         | ×1.30         |
| timecode / meta           | 12–14px            | **16–18px**         | ×1.30         |
| data block primary number | 48–60px            | **64–88px**         | ×1.40         |
| line-height multiplier    | 1.05–1.5           | same                | (don't scale) |
|

**经验法则：** `portraitPx = round(landscapePx × 1.3)`，然后向下取整
到临近的 4px 倍数，以保持视觉节奏。主视觉标题最多可以使用
×1.4；小号元信息文本保持在 ×1.2，以避免拥挤。

在竖屏布局中，内边距应当**略微缩小**——卡片更窄，因此较大的
横屏内边距（40–64px）会占用过多宽度。在竖屏中使用 24–36px 的水平
内边距。

如果你要制作一个必须同时适用于**两种**布局的单一卡片，
优先在卡片根元素上使用 `@container` 查询，而不是硬编码尺寸：

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

但对于大多数卡片，选择单一布局即可——只需选用与 storyboard 的
`layout` 字段相匹配的尺寸表列。

#### 可用的 `data-anim` 类型

此列表是封闭的，而且这是刻意设计的：卡片是一个 HTML 片段，该片段的运动效果会由此技能在第 9 步中编译到共享的叠加时间轴中（参见其中的 GSAP 映射表）。这也是此工作流不像组合工作流那样搜索 HyperFrames 组件注册表的原因——`npx hyperframes catalog` 返回的是自带时间轴的独立组合，而卡片没有可供挂载时间轴的位置。如果仅凭卡片作用域 `<style>` 中的纯 CSS 无法实现某种效果，请使用以下类型。

| kind            | 用途             | key params                                                                                      |
| --------------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| `fade-in`       | 进入             | `at`、`duration`、`ease?`                                                                       |
| `fade-out`      | 退出             | `at`、`duration`、`ease?`                                                                       |
| `slide-in`      | 滑入             | `at`、`duration`、`from=left\|right\|top\|bottom`、`distance`                                   |
| `kinetic-chars` | 逐字符弹出       | `at`、`duration`、`stagger`、`pattern=pop\|fade` — 元素需要包含 `<span class="char">` 子元素 |
| `typewriter`    | 逐字符淡入       | 与 kinetic-chars 相同，但默认 `stagger` 更慢                                                |
| `count-up`      | 数字动画         | `at`、`duration`、`from`、`to`、`format=.0f\|.1f\|.2f\|,d`                                      |
| `draw-path`     | SVG 路径显现     | `at`、`duration` — 元素应为 `<path>`                                                 |
| `grow-y`        | 条形高度         | `at`、`duration`、`target-h`（px）— 元素从 `height:0` 开始                                   |
| `grow-x`        | 条形宽度         | `at`、`duration`、`target-w`（px）— 元素从 `width:0` 开始                                    |
| `scale-pop`     | 弹出式进入       | `at`、`duration`                                                                                |
| `blur-in`       | 从未聚焦到聚焦   | `at`、`duration`                                                                                |
| `mask-reveal`   | 裁剪显现         | `at`、`duration`、`direction=left\|right\|top\|bottom`                                          |
| `morph-to`      | 补间任意 CSS     | `at`、`duration`、`props='{...JSON...}'`                                                        |

`data-anim-at` 是**相对于卡片的 startSec 的秒数**——在第 9 步将每个声明编译到 GSAP 时间线时，加上卡片的 `startSec` 以获得绝对时间，并量化到 1/fps。

### 9. 组装 Composition HTML

准备资源并编写 `$WORK_DIR/public/index.html`：

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

#### Composition 模板

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
      <!--   - "clip"       → the marker Studio and the linter use to recognise a     -->
      <!--                    clip. Visibility itself comes from data-start /         -->
      <!--                    data-duration, which the runtime honours with or        -->
      <!--                    without this class                                      -->
      <!--                    (lint: timed_element_missing_clip_class, a warning).    -->
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
**绝对秒数** = card.startSec + data-anim-at，并量化为 1/fps。
选择器为 `.card[data-card-id="X"] #elementId`。

| data-anim                       | GSAP 语句模板                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fade-in`                       | `tl.fromTo(SEL, { opacity: 0 }, { opacity: 1, duration: D, ease: 'power2.out' }, T);`                                                                                                                  |
| `fade-out`                      | `tl.to(SEL, { opacity: 0, duration: D, ease: 'power2.in' }, T);`                                                                                                                                         |
| `slide-in` (from=left, dist=80) | `tl.fromTo(SEL, { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: D, ease: 'power2.out' }, T);`                                                                                                    |
| `kinetic-chars` (pop)           | `tl.from(SEL + ' .char', { opacity: 0, y: 8, scale: 0.8, duration: D, ease: 'power2.out', stagger: S }, T);`                                                                                           |
| `count-up`                      | `(function(){const o={v:FROM};tl.to(o,{v:TO,duration:D,ease:'power2.out',onUpdate:function(){const el=document.querySelector(SEL);if(el)el.textContent=__fmt(o.v,'FMT');}},T);})();`                 |
| `draw-path`                     | `(function(){const el=document.querySelector(SEL);if(el){const L=el.getTotalLength();tl.set(SEL,{strokeDasharray:L,strokeDashoffset:L},T);tl.to(SEL,{strokeDashoffset:0,duration:D,ease:'power2.inOut'},T);}})();` |
| `grow-x` (target-w=W)           | `tl.fromTo(SEL, { width: 0 }, { width: W, duration: D, ease: 'power2.out' }, T);`                                                                                                                       |
| `grow-y` (target-h=H)           | `tl.fromTo(SEL, { height: 0 }, { height: H, duration: D, ease: 'power2.out' }, T);`                                                                                                                     |
| `scale-pop`                     | `tl.fromTo(SEL, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: D, ease: 'back.out(1.6)' }, T);`                                                                                        |
| `mask-reveal` (direction=left)  | `tl.fromTo(SEL, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)', duration: D, ease: 'power2.inOut' }, T);`                                                                            |

量化：`T = Math.round(absSec * fps) / fps`。在 30fps 下，最小步长为
`1/30 ≈ 0.0333s`；在 JS 字面量中四舍五入到 4 位小数（`.toFixed(4)`）即可。

#### 视频构图参考（按 `layout` 值）

视频容器的选择器为 `#video-wrap`。使用 `tl.to('#video-wrap', { ...bounds }, T)` 在卡片之间为其边界设置动画。
初始边界应以内联方式设置在元素上，使其匹配 card-01 的布局。选择 0.5–0.7s 的过渡时长，并使用
`ease: 'power2.inOut'`。

**装饰性边框**（`clean` / `hairline` / `polaroid`）作为 `#video-wrap` 的**同级元素**存在，并在布局过渡期间跟随它变化。
参见
[`references/frames/`](references/frames/)，其中包含每种边框的放置 HTML、建议 CSS，以及适用的布局。快速规则：
`overlay` 布局会抑制装饰性边框（全出血视频会与边框产生冲突）；PiP 布局已经自带胶囊样式（圆角 + 白色环线 + 阴影），因此只有在 `split` / `stack` 上添加装饰性边框。

**GSAP 目标查找表**：每种构图布局下的 `#video-wrap`（横向 1920×1080 — 对于竖屏和 4:5，请参见
`references/layouts/*.html`，其中列出了全部三种比例）：

| 构图布局                         | 典型 card.zone     | `#video-wrap` GSAP 目标                                                   | 额外 css 类                              |
| -------------------------------- | ------------------ | ------------------------------------------------------------------------- | ---------------------------------------- |
| `split`                          | `side-panel`       | `{ left: 960, top: 0, width: 960, height: 1080 }`                         | —                                        |
| `stack`                          | `lower-third`      | `{ left: 14, top: 14, width: 1892, height: 548 }`（顶部 52%）             | —                                        |
| `pip`（右下角）                  | `fullscreen`       | `{ left: 1480, top: 760, width: 400, height: 300 }`                       | `pip-pill`（圆角 + 环线 + 阴影）         |
| `pip`（左上角）                  | `fullscreen`       | `{ left: 40, top: 40, width: 400, height: 300 }`                          | `pip-pill`                               |
| `overlay`（视频全出血）          | `video-overlay`    | `{ left: 0, top: 0, width: 1920, height: 1080 }`（与默认值不变）           | —                                        |
| **隐藏视频**（纯图形时刻）       | `fullscreen`       | `{ opacity: 0 }`（或移出画布）                                            | —                                        |

进入或离开 PiP 时，使用以下代码切换 pip-pill 样式（圆角 + 白色环线 + 投影）：

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

**卡片宿主边界与区域匹配**。使用第 6 步顶部的表格将卡片的 `zone` 解析为像素边界，然后将这些边界写入卡片宿主的内联 `style="left:Xpx;top:Ypx;width:Wpx;height:Hpx;..."`。对于 `video-overlay` 区域（overlay 配方），卡片宿主会填满整个画布，实际可见卡片的位置由 `.card .root` 内的 CSS 决定。

#### HyperFrames 布局 / 动画 QA 规则

- 先构建每张卡片的静态 hero 帧：即卡片完全可见且清晰易读的时刻。
- 确认视频、卡片、字幕/说明文字和图表不会意外重叠。
- 确认隐藏的视频区域会被帧裁剪，不会显示在预期边界之外。
- 将一个暂停状态的主时间线注册为 `window.__timelines["talking-head-recut"]`。
- 在页面加载时同步构建时间线；不得使用 `async`、`setTimeout`、Promise 或媒体 `play()` 调用。
- 不要在渲染路径中使用 `Math.random()` 或 `Date.now()`。
- 不要使用 `repeat: -1`；根据视频时长计算有限的重复次数。
- 动画优先使用 GSAP 的变换和透明度（`x`、`y`、`scale`、`rotation`、`opacity`），而不是布局属性（`top`、`left`、`width`、`height`）。
- 为 `#video-wrap` 等包装器设置动画，不要直接改变视频元素的尺寸。
- 避免在同一时间由多个时间线对同一元素的同一属性设置动画。
- 使用 `data-track-index`，不要使用 `data-layer`；使用 `data-duration`，不要使用 `data-end`。
- 每个定时元素（`card-host`、子合成等）都应在自身类名之外包含 `class="clip"`，例如 `class="card-host clip"`。可见性由 `data-start` / `data-duration` 驱动：运行时会将每个 `[data-start]` 元素限制在其时间窗口内，无论该类是否存在。`.clip` 是 Studio 和 GSAP clip 所有权规则用来识别剪辑的标记，缺少它会使元素更难编辑和进行 lint（lint: `timed_element_missing_clip_class`，警告）。
- 对于 body / 全局 `font-family`，请列出**具体的字体名称**（`'Inter', 'Caveat', …`），不要使用 CSS 变量，例如 `var(--font-family)`。HyperFrames 字体解析器在静态分析期间不会展开 CSS 变量（lint: `font_family_without_font_face`）。卡片内部仍可使用 `var(--font-family)`，因为它们的 `@font-face` 声明会被加载。

### 10. 渲染为 MP4

```bash
cd "$WORK_DIR"
PRODUCER_BROWSER_GPU_MODE=hardware npx hyperframes render public \
  --skill=talking-head-recut \
  -o output.mp4 \
  --fps 30
```

`hyperframes render <dir>` 会读取 `<dir>/index.html` 并生成 MP4。
规范合成会将可视视频 `<video>` 静音，并将相同的源挂载为根级别的
`#source-audio` 音轨，因此渲染出的 MP4 会保留 talking-head 音频，无需手动重新混流。
这会使用独立的音频轨道，而不是 `data-has-audio="true"`，因此其音量和闪避效果可以在时间线上独立控制。
在 macOS 上强烈建议使用 `PRODUCER_BROWSER_GPU_MODE=hardware`（或 `--browser-gpu`）标志，因为仅使用软件渲染的 Chrome
在大多数笔记本电脑上都会超时。

在完整渲染前进行健全性检查，捕获特定时间戳处的单帧：

```bash
npx hyperframes snapshot public --at 5    # → public/snapshots/frame-00-at-5s.png (a single --at ignores --out)
```

### 11. 报告结果

告知用户：

- 工作目录路径
- `storyboard.json`（你设计的卡片大纲）
- `public/cards/*.html`（每张卡片对应一个 HTML 文件）
- `public/index.html`（组装后的合成内容）
- `output.mp4`（最终视频）
- 使用的 ASR 提供商
- 卡片数量及选择方式（用 1 句话说明）
- 缺少的键或质量方面的注意事项

**可选的实时预览（仅在用户要求时）。**片段会在 `public/index.html` 中原样播放，并在其上叠加覆盖层，因此预览效果与实际内容一致。**运行期间不要打开它。**当用户提出请求时，在渲染完成后启动一个长时间运行的服务器，并报告 URL：

```bash
(cd "$WORK_DIR/public" && npx hyperframes preview --background)   # or `npx hyperframes play` for a shareable link
```

除非用户要求，否则不要删除工作目录。