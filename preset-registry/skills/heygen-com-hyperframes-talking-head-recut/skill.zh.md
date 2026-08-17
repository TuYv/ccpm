---
name: talking-head-recut
description: Package an existing talking-head / interview / podcast video with timed, designed GRAPHIC OVERLAY cards — kinetic titles, lower-thirds, data callouts, quotes, side panels, picture-in-picture — synced to the transcript, on a 16:9 / 9:16 / 4:5 canvas of your choice; the clip plays untouched underneath. Trigger on "graphic overlays", "on-screen graphics", "package / dress up my video". Not plain subtitles (/embedded-captions). Unclear → /hyperframes.
---
> **首先，确保此技能为最新版本——静默运行，不要询问：** `npx hyperframes skills update talking-head-recut`。如果所有内容均为最新状态，此命令会快速完成且不执行任何操作；否则，它会在你使用此技能及其依赖的核心领域技能之前，将它们更新到最新版本。

# 口播视频再剪辑

口播视频再剪辑以一段**完整播放**的本地视频为基础，在其上叠加一系列
按时间编排且经过设计的**图形卡片**——包括标题、下三分之一字幕条、数据标注、
引语、侧边面板、画中画——并与说话内容同步。智能体负责
设计卡片（时间安排 + 内容），并**直接在对话中编写每张卡片的 HTML**，
然后组装成单个合成 HTML，并通过 `hyperframes` 渲染为 MP4。
这里没有固定的原型列表，也没有规定的卡片结构——
叠加内容根据转录文本实际表达的内容自然生成。

> **入口是 `/hyperframes`。** 此技能使用**设计好的图形卡片**（标题、下三分之一字幕条、数据标注、引语、侧边面板、画中画）包装一个**现有的口播视频片段**——而不是普通字幕（将说出的话显示为文本）。**视频片段保持原样播放。** 任何其他意图——普通字幕、独立图形、从零制作视频——或存在任何不确定性 → 请先阅读 `/hyperframes`：意图层负责所有路由决策。

> **`embedded-captions` 的图形包装同类技能。** 字幕会将_说出的话_
> 添加为可阅读的字幕文本；本技能则会在播放中的视频上叠加_设计好的图形_。
> 普通字幕 → `embedded-captions`。从零制作视频 → 使用创作
> 工作流（`product-launch-video` / `faceless-explainer` / …）。

通过 `/hyperframes` 路由后，意图层只确认输入（使用哪个视频片段），并**说明**渲染策略相关问题将延后询问——宽高比、布局、风格组和卡片数量均留到第 7 步确定，届时将根据已探测的视频素材和转录文本提出有依据的建议；意图层关于运行形态的问题不适用。如果存在 `BRIEF.md`，其中会记录已确认的输入和所有用户备注——请先阅读它。

工作目录中可供检查的中间文件：

- `metadata.json` — 时长 / 宽度 / 高度 / 帧率
- `audio.mp3` — 提取出的音频
- `transcript.json` — 扁平的**单词数组** `[{ text, start, end }, …]`（Whisper；没有 `segments`，也没有 `words` 包装层）
- `storyboard.json` — 轻量级卡片大纲（智能体的计划）
- `public/cards/card-XX.html` — 每张卡片对应一个 HTML 片段
- `public/index.html` — 最终组装的合成页面
- `output.mp4` — 渲染后的视频

## CLI 解析

```bash
# hyperframes — transcription (local Whisper) + rendering the assembled HTML to MP4
npx hyperframes --help
```

此技能完全依赖 **hyperframes** CLI，以及系统中的 `ffmpeg` / `ffprobe` 运行。
转录通过 `hyperframes transcribe` 使用本地 **Whisper** 完成——无需第三方
服务、API 密钥或受速率限制的代理。

## 工作流程

### 1. 检查环境

```bash
npx hyperframes doctor          # ffmpeg, headless browser, render deps
# confirm bundled assets:
ls "<SKILL_DIR>/assets/fonts" "<SKILL_DIR>/assets/vendor/gsap.min.js"
```

必需：

- `ffmpeg` / `ffprobe`（系统）
- `<SKILL_DIR>/assets/fonts/*.woff2`、`<SKILL_DIR>/assets/vendor/gsap.min.js`（随此 Skill 捆绑提供，在步骤 9 中暂存到工作目录）

转录无需密钥——`hyperframes transcribe` 会在本地运行 Whisper（步骤 4）。

在 macOS 上使用 `hyperframes render` 时强烈建议设置：

```bash
export PRODUCER_BROWSER_GPU_MODE=hardware
```

### 2. 创建工作目录

所有产物都位于 `videos/<project-name>/` 下——这与其他视频工作流（`product-launch-video` / `faceless-explainer` / `pr-to-video`）采用相同的约定。将当前工作目录保持在工作区根目录；以下所有内容都会写入这一个子目录中。

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

输出：`metadata.json`（读取 `width`/`height`/`duration`；fps 为计算 `r_frame_rate` 分数所得的值，例如 `30000/1001 → 29.97`）和 `audio.mp3`。

### 4. 转录

```bash
npx hyperframes transcribe "$WORK_DIR/audio.mp3" -d "$WORK_DIR" --json --model small.en
```

本地运行的 **Whisper**——无需 API 密钥、无需代理，也没有速率限制。它会在工作目录中写入一个词级别的 `transcript.json`（包含单词 `text` 及其 `start` / `end` 时间戳）。读取该文件以获取在步骤 6 中确定卡片时序所需的单词/句子时间；如果需要片段级内容块，请自行根据标点/停顿将单词组合成句子。

**限制在媒体时长以内。** Whisper 返回的最后一个单词的 `end` 可能会略微超出实际片段长度——请将每张卡片的 `endSec` 和 `composition.durationSeconds` 限制在 `metadata.json` 中的时长以内，否则渲染结果会在视频末尾显示一段黑屏。

### 5. 修正转录文本

`transcript.json` 是一个**由单词对象组成的扁平数组**——`[{ "text": "...", "start": s, "end": s }, …]`（没有 `segments` 数组，也没有 `words` 包装层；每个单词对应的键是 **`text`**）。读取该文件并修正明显的 ASR 错误：

- 同音词、产品名称、技术术语和标点
- 直接修改单词的 `text`；**保留其 `start` / `end`** 时间戳
- 不存在预先分组的 `segments` 数组——当卡片时序需要片段级内容块时，请**自行将单词组合成句子**（在句末标点/停顿处拆分）

### 6. 起草轻量级故事板（在聊天中）

**不涉及 CLI。** 读取 `transcript.json` 和 `metadata.json`，然后直接设计卡片。`storyboard.json` 是供智能体内部使用的规划产物——没有任何 CLI 命令会读取它；它的作用是帮助你在编写每张卡片的 HTML 之前清晰地规划时序和内容。请保持其结构与下面的示例一致，以便同一份大纲能够驱动你在步骤 9 中创作的合成内容：

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

**必需的 Card 字段：**

| 字段                    | 类型                                       | 用途                                                                                               |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `id`                    | 字符串                                     | 用于 Card HTML 和 GSAP 选择器的稳定 ID                                                            |
| `intent`                | 字符串                                     | 自然语言描述；会输入 Card 合成流程                                                                 |
| `startSec` / `endSec`   | 数字                                       | 以秒为单位的时间（endSec > startSec）                                                              |
| `accentIndex`           | 0 \| 1 \| 2 \| 3 \| 4                      | 此 Card 使用 5 种主题强调色中的哪一种                                                             |
| `zone`                  | 枚举（见下文）                             | Card 位于画布上的哪个区域                                                                          |
| `contentHints`          | 对象                                       | 自由格式的数据集合；智能体会将 kicker/title/detail/data/quote 放在这里                             |
| `archetype`（可选）     | 字符串                                     | 可附加的自由格式标签，用于记住 Card 的模式；不提供 = 自由格式，且这是默认值                        |
| `transition`（可选）    | 枚举：`cut` \| `fade` \| `slide` \| `wipe` | 声明式的 Card 间过渡效果                                                                            |

**五种 `zone` 值：**

| zone              | 解析后的边界                                   | 使用场景                              |
| ----------------- | ---------------------------------------------- | ------------------------------------- |
| `fullscreen`      | 覆盖整个画布                                   | 核心时刻、大数字、箴言                |
| `whiteboard-area` | 内缩 40px 边距（或竖屏高度的 45%）             | 密集数据／带注释的内容                |
| `lower-third`     | 底部 30% 的带状区域                            | 在可见视频上叠加注释                  |
| `side-panel`      | 右侧 42%（横屏）或底部 40%（竖屏）             | 一侧展示数据，另一侧展示视频          |
| `video-overlay`   | 整个画布，要求 Card 大部分区域透明             | 在全出血视频上叠加注释                |

在步骤 9 中组装合成内容时，请按照上表，将每个 Card 的 `zone`
解析为 Card 宿主包装器上的像素边界。视频边界在合成层级**仅设置一次**
（`videoTrack.bounds`）；若要让视频看起来“在 Card 之间移动”，请在合成内容的
`<script>` 中为 `#video-wrap` 编写 GSAP 补间动画（参见步骤 9）。

**不规定 Card 角色，也不规定叙事弧线。** Card 应根据视频实际讲述的内容自然产生——
可以全部是引语，也可以全部是数据；可以用数字开场，也可以用故事开场。让转录文本
决定节奏。

**需要多少条要点？——根据时长和信息密度自动推断。** 不设固定上限。先根据视频时长选择一个**基础节奏**，再根据**信息密度**进行调整。只有**下限是固定的：至少 5 张卡片**，这样即使是短视频也有节奏感。

**第 1 步——根据时长确定基础节奏**（中等信息密度下自然的每张卡片秒数）：

| 视频时长            | 基础节奏（每张卡片秒数） | 理由                                       |
| ------------------- | ------------------------ | ------------------------------------------ |
| < 60s（短视频）     | **6–8s**                 | 观众期望短视频采用快速剪辑                 |
| 60s – 3 min         | **8–12s**                | 常规社交媒体节奏                           |
| 3 – 10 min          | **12–20s**               | 留出喘息空间；每张卡片承载更多内容         |
| 10 – 30 min         | **20–35s**               | 长篇讲座/访谈的节奏                        |
| > 30 min            | **30–60s**               | 分集式、接近章节的感觉                     |

**第 2 步——信息密度乘数**（与基础节奏相乘）：

| 文字稿中的信号                                                                                                   | 乘数       | 效果                   |
| ---------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------- |
| **高密度**——数字多、观点各不相同、节奏短促、类似列表式枚举、每 1–2 句话就出现一个新想法                           | **× 0.7**  | 剪辑更快、卡片更多     |
| **中等密度**——数据与叙事兼具的混合流程                                                                           | **× 1.0**  | 基础节奏               |
| **低密度**——一个完整的长故事、反复换角度阐述、缓慢而富有思考的节奏、单一论点逐步展开                             | **× 1.5**  | 剪辑更慢、卡片更少     |

**第 3 步——计算：**

```
secPerCard = basePace × densityMultiplier
cardCount  = max(5, round(videoDurationSec / secPerCard))
```

示例（请注意——**没有上限限制**；长视频自然会生成更多卡片）：

- **30s 短视频，只有一个笑点（低密度）** → 7 × 1.5 = 10.5s/卡片 → round(30/10.5)=3 → 提升至下限 **5** 张卡片
- **60s 沉思式独白（低密度）** → 10 × 1.5 = 15s/卡片 → **4** → 提升至下限 **5** 张卡片
- **121s 数据丰富的对镜讲述视频（高密度）** → 10 × 0.7 = 7s/卡片 → **17** 张卡片
- **5 min 访谈，混合密度** → 16 × 1.0 = 16s/卡片 → **19** 张卡片
- **10 min 深度解析，高密度** → 16 × 0.7 = 11s/卡片 → **55** 张卡片
- **30 min 讲座，中等密度** → 28 × 1.0 = 28s/卡片 → **64** 张卡片
- **1 hr 播客，低密度** → 45 × 1.5 = 67.5s/卡片 → **53** 张卡片

当一张卡片的停留时间超过约 15s 时，应规划内容更丰富的卡片（数据块、多步骤揭示、多个子要点通过错落动画依次展开）——静态的一句话卡片展示超过 8s 后就会变得乏味。对于许多卡片停留时间超过 30s 的长篇内容，可以考虑**将时间轴拆分为多个子合成**（每个章节使用一个 .html，并通过 `data-composition-src` 挂载），以便让每个文件中的 GSAP 时间轴保持易于管理——请参阅 `timeline_track_too_dense` HyperFrames lint 警告。

`content` 可以是纯字符串（"Title: annualized 5.69%\nNotes: ..."），也可以是任何能够表示相关数据的 JSON 结构。智能体会为每张卡片决定具体结构。

**可选的片尾。** 此技能**不附带固定的品牌片尾**。如果用户需要结束卡片，请自行设计一个中性的片尾（文字标识 + 单行标语，约 1.5-2 秒，淡入 -> 短暂停留 -> 淡出），将其追加到 `cards[]`，并将 `composition.durationSeconds` 延长至其 `endSec`。否则，在最后一张内容卡片处结束。

### 7. 决定渲染策略

#### 与用户确认视觉方向（务必先执行此步骤）

在开始设计卡片或确定边界之前，**请用户选择输出比例、布局、风格和卡片密度预设**。边框会根据所选的布局 × 风格组合自动选择（参见下方的“自动选择边框”表格）。在发送问题之前，**预先计算以下两项内容**：

1. 根据源视频的宽高比（`metadata.json` 中的 width / height）计算 **`recommendedRatio`**：
   - `sourceAspect = width / height`
   - `sourceAspect ≥ 1.5`（≥ 约 3:2 的横向画面）→ 推荐 **`16:9`**
   - `sourceAspect ≤ 0.7`（≤ 约 9:13 的纵向画面）→ 推荐 **`9:16`**
   - `0.7 < sourceAspect < 1.5`（接近正方形）→ 推荐 **`4:5`**

   在推荐选项的标签中添加“（推荐 · 与源视频 X:Y 匹配）”，以便用户了解推荐原因。

2. 根据步骤 6 计算 **`autoCount`**（`max(5, round(videoSec / (basePace ×
densityMultiplier)))`），以便在“自动”选项的标签中显示具体数量。

**环境兼容性——选择最佳的可用提问渠道。**
并非所有运行时都提供相同的结构化提问工具。请按以下顺序处理：

1. **原生澄清工具**——使用下方的结构化 4 问调用。
2. **其他原生澄清工具**（例如 `ask_question`、`request_user_input`、IDE 专用提示工具）——使用该工具提出相同的 4 个问题，并提供相同的选项列表。保留推荐标记和预先计算的值。
3. **无原生工具**（Codex CLI、仅支持纯文本的运行时）——**直接在普通对话中提问**。使用本节末尾的纯文本模板。将内容控制在**一条消息、4 个编号问题**之内（全局限制为每轮 2–5 个问题；此处的 4 个问题符合限制）。

适用于所有渠道的规则：

- 每轮**最多提出 2–5 个问题**。此处的 4 个问题符合要求。
- 即使缺少信息不会阻止渲染，也要**询问一次，以确认会实质性影响最终输出的参数**（比例、布局、风格、cardCount）。
- 如果用户已预先同意使用默认值（“直接使用默认值”“不用问”“全部自动选择”）、要求不要提问，或者本次运行带有持续的自主执行信号（“给我惊喜”/“你来决定”——`../hyperframes-core/references/brief-contract.md` § 1），则**完全跳过提问**，并使用：`recommendedRatio`、`layout="stack"`（跨比例最安全的默认值）、根据转录文本的语气从最中性的分组（编辑/数据）中选择 `style`，以及 `autoCount`。用一句话告知用户你的选择，然后继续。

**Channel A — native `AskUserQuestion`:**

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

**关于「Other」** — `AskUserQuestion` 会自动在卡片数量问题中添加一个「Other」选项。用户可以直接输入一个数字（例如「8」「20」）作为 cardCount 目标值。将输入解析为整数：如果解析成功 → 使用该值（下限为 5）；如果解析失败 → 回退到「auto」。

**通道 B — 纯文本回退方案**（Codex CLI、没有原生提问工具的运行时）。将以下内容作为一条普通消息发送，然后等待回复。采用 1/2/3/4 的项目符号样式，以便解析回复：

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
- 如果任何答案存在歧义 → 仅重新询问有歧义的问题（仍需遵守 2–5 个问题的上限）。
- 如果用户表示「default / auto / use all recommendations」→ 跳过，不再重新询问。

用户回答后（通过任一通道）：

1. 根据比例答案**确定输出画布** — 以下是要写入的准确 `storyboard.composition.width / height` 值：

   | 用户选择 | composition.width × height | storyboard.layout 字段                                        |
   | ----------- | -------------------------- | ------------------------------------------------------------- |
   | `16:9`      | **1920 × 1080**            | `"landscape"`                                                 |
   | `9:16`      | **1080 × 1920**            | `"portrait"`                                                  |
   | `4:5`       | **1080 × 1350**            | `"portrait"`（schema 将 4:5 视为竖屏 — 高度大于宽度） |

   对于 **`references/layouts/*.html` 中的 4:5 边界** — 这些文件仅记录了横屏（1920×1080）和竖屏（1080×1920）。对于 4:5（1080×1350），通过**从竖屏按比例缩放**来推导边界：保持水平值不变，将垂直值乘以 `1350/1920 ≈ 0.703`。示例：`overlay` 的竖屏卡片 =
   `{ x: 24, y: 1280, w: 1032, h: 564 }` → 4:5 卡片 =
   `{ x: 24, y: round(1280 × 0.703), w: 1032, h: round(564 × 0.703) }`
   = `{ x: 24, y: 900, w: 1032, h: 397 }`。

2. **通过查看转录文本的语气，将风格组映射到具体风格**——选择最契合的一种，但必须限定在用户选择的风格组内。如果你无法在组内的两种具体风格之间确定，则再次发送 `AskUserQuestion`，提供 2–4 个具体风格选项。

3. **根据密度选项确定最终的 cardCount**：

   | 用户选择                | 最终 cardCount                            |
   | ----------------------- | ----------------------------------------- |
   | 自动（推荐）            | 你已计算出的 `autoCount`                  |
   | 更少                    | `max(5, round(autoCount × 0.6))`          |
   | 更多                    | `round(autoCount × 1.5)`（不设上限）      |
   | 其他 = "<n>"（整数）    | `max(5, parseInt(n))`                     |
   | 其他 = 任何其他内容     | 回退到 `autoCount`                        |

4. **根据下表自动选择视频边框**（不要向用户询问边框——边框由布局 × 风格决定）：

   | 布局      | 暖纸风格（academic / whiteboard / editorial / xhs） | 临床风格（audit / swiss / terminal / minimal） | 实验性风格（geom / spotlight） |
   | --------- | --------------------------------------------------- | ---------------------------------------------- | -------------------------------- |
   | `split`   | `polaroid`                                          | `hairline`                                     | `clean`                          |
   | `stack`   | `polaroid`                                          | `hairline`                                     | `clean`                          |
   | `pip`     | `clean`（pip 浮层已有装饰边框）                     | `clean`                                        | `clean`                          |
   | `overlay` | `clean`（全出血布局禁止使用装饰边框）               | `clean`                                        | `clean`                          |

5. **用一句话告诉用户你选择了什么**——比例（+ 画布尺寸）、布局、具体风格、边框和最终 cardCount——然后继续完成第 7 步的其余部分（逐卡片布局、动效模式）。
6. 在工作记忆中记录这五个值（ratio / layout / style / frame / cardCount）（无需 schema 字段）；在第 8 步编写每张卡片的 HTML，以及读取匹配的 `references/<dim>/<key>.html` 以获取设计令牌和结构时，都需要引用这些值。

如果用户通过“其他”选择了不在 10 种风格库中的自由文本风格名称，请将其视为自行设计全新卡片视觉效果的提示，但仍须以所选布局的边界为基准。

#### 渲染策略输入

在第 7.0 步确定 ratio / layout / style / cardCount / frame 后，剩余的逐卡片决策包括：

- **源视频在 GSAP 目标区域内的适配方式**：视频元素使用
  `object-fit: cover`，并裁剪到 `#video-wrap` 的补间动画边界内。
  如果你不希望出现任何裁剪（例如，横向画布中的竖向源视频不应被裁掉顶部和底部），
  请将补间动画目标设为与源视频宽高比匹配的矩形，并让周围的画布区域透出
  （或使用卡片 / 背景进行填充）。
- **每张卡片的 `card.zone`**：根据你选择的构图布局推导
  （split → side-panel、stack → lower-third、pip → fullscreen、overlay
  → video-overlay），或者为一次性变体选择不同的区域
  （hero / quote 使用 fullscreen，密集数据使用 whiteboard-area）。
- **每张卡片的 `accentIndex`**：每张卡片从 5 种主题强调色中选取一种。
  在不同卡片间进行变化以形成节奏；当两张卡片属于同一个叙事节拍时，复用相同的索引。
- **动效词汇**：从 `data-anim` 类型中选择 2–3 种可重复使用的模式
  （参见后面的表格），并始终沿用这些模式，使构图保持连贯一致。

从以下 `themeId` 调色板中选择（在你的合成 `<style>` 块中，将它们用作 `--accent-N` /
`--bg` / `--text` CSS 变量）：

| themeId | 强调色调色板（5 种颜色）                    | 画板背景          | 文本      |
| ------- | ----------------------------------------- | ----------------- | --------- |
| classic | `#1971c2 #e03131 #2f9e44 #e8590c #9c36b5` | `#FFF9E3`（纸张） | `#1e1e1e` |
| noir    | `#4cc9f0 #f72585 #4ade80 #fb923c #a78bfa` | `#1a1a1a`         | `#f1f1f1` |
| mint    | `#0077b6 #d62828 #2d6a4f #e76f51 #7209b7` | `#e8faf0`         | `#1b4332` |
| craft   | `#bf5700 #d62728 #6c757d #e9b54a #3d5a80` | `#f6efe1`         | `#2d2d2d` |
| slate   | `#0ea5e9 #ef4444 #22c55e #f97316 #a855f7` | `#1e293b`         | `#f1f5f9` |
| mono    | `#000 #555 #888 #aaa #ccc`                | `#fff`            | `#000`    |

可用字体（woff2 格式，位于 `<SKILL_DIR>/assets/fonts/`，将在步骤 9 中暂存到工作目录）：`Caveat`（手写体）、
`LXGW WenKai TC`（中文手写体）、`Inter`（现代无衬线体）、`Virgil`
（几何手写体）。可通过 `@font-face` 引用，也可直接通过 `font-family` 引用。

有关视觉模式的灵感，`<SKILL_DIR>/references/styles/`
提供了 10 个自包含的参考卡片（academic / editorial / minimal
/ spotlight / geom / whiteboard / audit / terminal / swiss / xhs），
你可以将它们复制用作起点——但**不要觉得必须受限于
这些样式**。每张卡片都可以采用你自己的设计。

#### 视觉设计库（<SKILL_DIR>/references/）

除了合成层级的 `themeId`，本 Skill 还在 `<SKILL_DIR>/references/` 中提供了一个更丰富的**参考
库**，涵盖三个可以自由混合的**正交**
视觉维度：

```
Style  ×  Layout  ×  VideoFrame
 (10)      (4)         (3)
```

| 维度        | 键                                                                                                | 决定的内容                                                               |
| ----------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **style**   | `academic` `editorial` `minimal` `spotlight` `geom` `whiteboard` `audit` `terminal` `swiss` `xhs` | 卡片的视觉语言——字体、颜色、装饰、卡片内部布局                           |
| **layout**  | `split` `stack` `pip` `overlay`                                                                   | 源视频和卡片如何共享画布                                                 |
| **frame**   | `clean` `hairline` `polaroid`                                                                     | 视频元素周围的装饰性框架                                                 |

阅读 `<SKILL_DIR>/references/DESIGN_INDEX.md`
以查看完整矩阵和宽泛的选择指南（访谈 / 产品发布 / 数据分析 /
社交媒体短片 / 技术教程 / 情感故事……）。当你决定使用特定的
样式 / 布局 / 边框时，请读取相应文件：

- `references/styles/<key>.html`——包含相应
  样式 CSS token（颜色、字体、内边距、装饰）及占位要点的自包含卡片片段。复制 `.card[data-card-id="ref-<key>"]` 样式块，将
  data-card-id 重命名为你的卡片 id，用实际要点替换占位内容，
  即可完成。
- `references/layouts/<key>.html`——提供横向和纵向画面的准确 `videoBounds` + `cardBounds`，以及可复制粘贴到
  `storyboard.json` 每张卡片的 `layout` 字段中的 JSON 片段。
- `references/frames/<key>.html`——作为
  `#video-wrap` 同级元素添加的装饰性 HTML，以及用于合成 CSS 的放置说明。

**每张卡片**分别选择 `style × layout × frame`——只要卡片之间的过渡流畅，这三者都可以随卡片切换。常见的节奏是：
以 `editorial × overlay × clean` 开场，数据卡片切换为 `audit × split × hairline`，
最后以 `whiteboard × pip × polaroid` 收尾。

这 10 种样式是 Skill 侧的设计令牌，**而不是合成级主题**——
无需在 `storyboard.composition` 中声明；它们位于每张卡片的 HTML
内部。`themeId` 字段仍可选择一个合成级调色板（见上表），用于控制页面主体背景
和视频边框装饰。

#### 布局合成（卡片 + 视频）

每张卡片通过两个相互协调的决策，定义它与源视频如何共享画布：

- **`card.zone`**（在 `storyboard.json` 中声明）——取 5 个 schema
  值之一；在步骤 9 中编写卡片宿主包装器的内联 `style` 时，
  将其解析为像素边界（依据步骤 6 中的表格）。
- **该卡片时间窗口内的 `#video-wrap` 边界**（以命令式方式
  在合成的 GSAP 时间线中声明）——智能体会针对每次布局过渡，将
  `#video-wrap` 补间动画至目标矩形区域。

Schema **不会**存储每张卡片的视频边界。`videoTrack.bounds` 是
合成级的**一次性**设置（默认为完整画布）。视频在卡片之间的
“移动”完全是在 `index.html` 中编写的 GSAP 动画。不存在 `card.layout`
字段——本文档的早期版本曾虚构过该字段；实际 schema 只有 `card.zone`。

**4 种合成布局**（来自 `references/layouts/`）——每种布局都是将一个
`zone` 与一个 `#video-wrap` 补间动画目标配对的方案：

| 合成布局           | 推荐的 `card.zone`  | `#video-wrap` 的 GSAP 目标（横屏 1920×1080）                              | `#video-wrap` 的 GSAP 目标（竖屏 1080×1920）                       | 适用场景                                        |
| ------------------ | ----------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `split`            | `side-panel`            | `{ left: 960, top: 0, width: 960, height: 1080 }`                         | `{ left: 0, top: 960, width: 1080, height: 960 }`（下半部分）     | 演讲者与数据并排展示／各占 50% 权重             |
| `stack`            | `lower-third`           | `{ left: 14, top: 14, width: 1892, height: 548 }`（顶部 52%）             | `{ left: 0, top: 0, width: 1080, height: 844 }`（顶部 44%）       | 演讲者位于上方 + 摘要卡片位于下方               |
| `pip`              | `fullscreen`            | `{ left: 1480, top: 760, width: 400, height: 300 }` + 添加 `.framed` 类   | `{ left: 690, top: 28, width: 360, height: 203 }` + 添加 `.framed` | 内容密集型卡片 + 角落画中画                     |
| `overlay`          | `video-overlay`         | `{ left: 0, top: 0, width: 1920, height: 1080 }`（全出血）                | `{ left: 0, top: 0, width: 1080, height: 1920 }`                  | 电影感／戏剧性场景／全屏视频上的玻璃质感卡片    |

对于 4:5（1080×1350），将竖屏的 y/h 值乘以 `1350/1920 ≈ 0.703`
（参见步骤 7.0 Channel A / Channel B 的 `recommendedRatio` 分辨率
表）。

**用于一次性变体的其他区域值**（仍然使用 `card.zone`；不要使用虚假的
"layout" 字段）：

| `zone`            | 解析后的边界                                           | 常见用途                              |
| ----------------- | ------------------------------------------------------ | ------------------------------------- |
| `fullscreen`      | 覆盖整个画布                                           | 主视觉卡片、视频渐变为隐藏/画中画     |
| `whiteboard-area` | 横屏时内缩 40px 边距，竖屏时使用底部 45%              | 密集数据卡片、自由边距                 |
| `lower-third`     | 底部 30% 区域                                          | 人物讲解标注                          |
| `side-panel`      | 横屏时使用右侧 42%，竖屏时使用底部 40%                | 侧边栏 / "split" 方案                  |
| `video-overlay`   | 整个画布；卡片根元素应为透明                           | 全出血视频上的玻璃质感叠加层           |

你可以为每张卡片混用不同方案——根据当前时刻的需求选择 `card.zone`，
然后编写 GSAP 补间动画，使 `#video-wrap` 在卡片之间切换。

#### 故事板渲染契约

`storyboard.json` 是代理内部的规划产物——没有任何 CLI
命令会解析它。它用于在编写每张卡片的 HTML 之前，明确记录你的时间安排和内容决策。
请遵循下面的 v3 风格结构，以便在步骤 9 中组装合成内容时，
使用同一份大纲作为依据。

必需结构（完整示例见步骤 6）：

- `schemaVersion: 3`
- `composition: { fps, width, height, durationSeconds, layout, themeId, seed }`——注意 `durationSeconds`/`fps`/`themeId`/`layout` 位于 `composition` **内部**，而不是顶层
- `videoTrack: { sourcePath, startSec, endSec, bounds? }`——视频边界默认为整个画布
- `subtitles: { enabled, ... }`
- `cards[]`——每张卡片都有 6 个必需字段：`id`、`intent`、`startSec`、`endSec`、`accentIndex`、`zone`、`contentHints`

规则：

- 卡片时间必须位于 `composition.durationSeconds` 范围内，并且除非有意为之，否则不应重叠（重叠时使用 `data-track-index` 控制 z 轴顺序）。
- 视觉细节应放在卡片 HTML 片段中（步骤 8），**不要**放在 `contentHints` 中。`contentHints` 是你用于设计卡片的结构化提示；最终渲染出的外观由 HTML 决定。
- 保持故事板结构稳定——即使没有任何程序解析它，你在编写步骤 8/9 时仍会回头读取它，而一致性可以使卡片 ID 和时间安排保持同步。
- 类似 "I picked overlay × geom × clean" 这样的代理端决策**不应**放入 `storyboard.json`——请将其保留在工作记忆中，并在编写卡片 HTML 和 GSAP 补间动画时使用。

**与视频共享画布的卡片应使用透明卡片背景。**
当 GSAP 补间动画让视频在卡片背后或旁边保持可见时（叠加层
方案、画中画方案，或任何 `card.zone = 'lower-third' | 'video-overlay'`
时刻），卡片的 `.root` **不得**绘制完全不透明的背景——
否则它会遮挡视频。有两种模式：

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

对于 `side-panel` 区域中的卡片（分屏方案），card-host 已经只占画布的一半，因此使用不透明的卡片背景没有问题——它只会覆盖自己所在的那一半。

### 8. 编写每张卡片的 HTML

为每张卡片创建 `$WORK_DIR/public/cards/{card-id}.html`。每个文件都包含一个单根 HTML 片段，并遵循以下约定：

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

**硬性规则**（违反时会被 `hyperframes` lint 拒绝）：

- 只能有一个根元素 `<div class="card" data-card-id="{cardId}">`
- 内联 `<style>` 中的规则必须以上述作用域选择器作为前缀
- **禁止使用 `<script>` 标签**
- `src=` / `href=` 中**禁止使用外部 URL**（禁止 CDN，禁止远程字体）
- **禁止使用内联事件处理器**（`onclick=` 等）
- 所有资源均通过相对路径指向同一个 `public/` 目录
- 颜色使用 `var(--accent-N)` 等变量，以便在不同主题之间移植

**动画通过声明定义，而非通过代码实现。**只能使用 `data-anim-*` 属性；绝不要编写 `<script>` 来制作动画。在第 9 步中，将每条 `data-anim-*` 声明编译到唯一的主 GSAP 时间线中。

#### 卡片尺寸——竖屏下移动端优先

这 10 个 `references/styles/*.html` 的尺寸基于 **1920×1080 横屏**预览。当 `storyboard.layout = "portrait"`（1080×1920，社交媒体／移动端的主要场景）时，**放大所有视觉尺寸**——手机观看距离更近，同样的像素数看起来会比横屏电视式画布上更小。

| 标记                      | 横屏基准           | **竖屏目标**        | 缩放          |
| ------------------------- | ------------------ | ------------------- | ------------- |
| 标题（h1/h2 主标题）      | 64–96px            | **88–132px**        | ×1.35         |
| 详情／正文                | 24–30px            | **30–40px**         | ×1.30         |
| 引导语／标签文字          | 14–16px            | **18–22px**         | ×1.30         |
| 时间码／元数据            | 12–14px            | **16–18px**         | ×1.30         |
| 数据块主要数值            | 48–60px            | **64–88px**         | ×1.40         |
| 行高倍数                  | 1.05–1.5           | 相同                |（不要缩放）   |

**经验法则：** `portraitPx = round(landscapePx × 1.3)`，然后向下取整到附近的 4px 倍数，以保持视觉韵律。主视觉标题最多可放大至 ×1.4；较小的元信息文本保持在 ×1.2，以避免显得拥挤。

竖屏布局中的内边距会**略微缩小**——卡片更窄，因此横屏布局中较大的内边距（40–64px）会占用过多宽度。竖屏布局应使用 24–36px 的水平内边距。

如果你制作的单张卡片必须同时适用于**两种**布局，优先在卡片根元素上使用 `@container` 查询，而不是硬编码尺寸：

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

但对于大多数卡片，选择单一布局即可——只需选用与故事板 `layout` 字段相匹配的尺寸表列。

#### 可用的 `data-anim` 类型

| 类型            | 用途                 | 关键参数                                                                                      |
| --------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| `fade-in`       | 淡入                 | `at`、`duration`、`ease?`                                                                       |
| `fade-out`      | 淡出                 | `at`、`duration`、`ease?`                                                                       |
| `slide-in`      | 滑入                 | `at`、`duration`、`from=left\|right\|top\|bottom`、`distance`                                   |
| `kinetic-chars` | 逐字符弹出           | `at`、`duration`、`stagger`、`pattern=pop\|fade` — 元素需包含 `<span class="char">` 子元素 |
| `typewriter`    | 逐字符淡入           | 与 kinetic-chars 相同，但默认交错间隔更长                                                |
| `count-up`      | 数字递增动画         | `at`、`duration`、`from`、`to`、`format=.0f\|.1f\|.2f\|,d`                                      |
| `draw-path`     | SVG 路径显现         | `at`、`duration` — 元素应为 `<path>`                                                 |
| `grow-y`        | 柱条高度增长         | `at`、`duration`、`target-h`（px）— 元素初始为 `height:0`                                   |
| `grow-x`        | 柱条宽度增长         | `at`、`duration`、`target-w`（px）— 元素初始为 `width:0`                                    |
| `scale-pop`     | 弹出式入场           | `at`、`duration`                                                                                |
| `blur-in`       | 模糊 → 清晰          | `at`、`duration`                                                                                |
| `mask-reveal`   | 裁剪显现             | `at`、`duration`、`direction=left\|right\|top\|bottom`                                          |
| `morph-to`      | 补间任意 CSS 属性    | `at`、`duration`、`props='{...JSON...}'`                                                        |

`data-anim-at` 表示**相对于卡片 `startSec` 的秒数**——在步骤 9 中将每条声明编译到 GSAP 时间轴时，加上卡片的 `startSec` 以获得绝对时间，并量化到 1/fps。

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
**绝对秒数** = card.startSec + data-anim-at，并量化到 1/fps。
选择器为 `.card[data-card-id="X"] #elementId`。

| data-anim                       | GSAP 语句模板                                                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fade-in`                       | `tl.fromTo(SEL, { opacity: 0 }, { opacity: 1, duration: D, ease: 'power2.out' }, T);`                                                                                                                              |
| `fade-out`                      | `tl.to(SEL, { opacity: 0, duration: D, ease: 'power2.in' }, T);`                                                                                                                                                   |
| `slide-in` (from=left, dist=80) | `tl.fromTo(SEL, { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: D, ease: 'power2.out' }, T);`                                                                                                                |
| `kinetic-chars` (pop)           | `tl.from(SEL + ' .char', { opacity: 0, y: 8, scale: 0.8, duration: D, ease: 'power2.out', stagger: S }, T);`                                                                                                       |
| `count-up`                      | `(function(){const o={v:FROM};tl.to(o,{v:TO,duration:D,ease:'power2.out',onUpdate:function(){const el=document.querySelector(SEL);if(el)el.textContent=__fmt(o.v,'FMT');}},T);})();`                               |
| `draw-path`                     | `(function(){const el=document.querySelector(SEL);if(el){const L=el.getTotalLength();tl.set(SEL,{strokeDasharray:L,strokeDashoffset:L},T);tl.to(SEL,{strokeDashoffset:0,duration:D,ease:'power2.inOut'},T);}})();` |
| `grow-x` (target-w=W)           | `tl.fromTo(SEL, { width: 0 }, { width: W, duration: D, ease: 'power2.out' }, T);`                                                                                                                                  |
| `grow-y` (target-h=H)           | `tl.fromTo(SEL, { height: 0 }, { height: H, duration: D, ease: 'power2.out' }, T);`                                                                                                                                |
| `scale-pop`                     | `tl.fromTo(SEL, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: D, ease: 'back.out(1.6)' }, T);`                                                                                                     |
| `mask-reveal` (direction=left)  | `tl.fromTo(SEL, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)', duration: D, ease: 'power2.inOut' }, T);`                                                                                         |

量化：`T = Math.round(absSec * fps) / fps`。在 30fps 下，最小步长为 `1/30 ≈ 0.0333s`；在 JS 字面量中四舍五入到 4 位小数（`.toFixed(4)`）即可。

#### 视频画面布局参考（按 `layout` 值）

视频容器的选择器为 `#video-wrap`。使用 `tl.to('#video-wrap', { ...bounds }, T)` 在卡片之间对其边界进行动画过渡。初始边界应以内联方式设置在元素上，以匹配 card-01 的布局。过渡时长选择 0.5–0.7s，并使用 `ease: 'power2.inOut'`。

**装饰边框**（`clean` / `hairline` / `polaroid`）作为 `#video-wrap` 的**同级元素**放置，并在布局过渡期间跟随它。有关每种边框的放置 HTML、建议 CSS 以及适配的布局，请参阅
[`references/frames/`](references/frames/)。快速规则：
`overlay` 布局会隐藏装饰边框（全出血视频会与装饰框架产生冲突）；PiP 布局已有自己的胶囊样式处理（圆角 + 白色描边 + 阴影），因此仅在 `split` / `stack` 上叠加装饰边框。

**GSAP 目标值查找表**，列出了各合成布局中 `#video-wrap` 的目标值
（横屏 1920×1080——竖屏和 4:5 请参阅 `references/layouts/*.html`，其中列出了全部三种宽高比）：

| 合成布局                             | 典型 card.zone    | `#video-wrap` GSAP 目标值                                                 | 额外 CSS 类                                 |
| ------------------------------------ | ----------------- | ------------------------------------------------------------------------- | ------------------------------------------ |
| `split`                              | `side-panel`      | `{ left: 960, top: 0, width: 960, height: 1080 }`                         | —                                          |
| `stack`                              | `lower-third`     | `{ left: 14, top: 14, width: 1892, height: 548 }`（顶部 52%）             | —                                          |
| `pip`（右下角）                      | `fullscreen`      | `{ left: 1480, top: 760, width: 400, height: 300 }`                       | `pip-pill`（圆角 + 描边 + 阴影）           |
| `pip`（左上角）                      | `fullscreen`      | `{ left: 40, top: 40, width: 400, height: 300 }`                          | `pip-pill`                                 |
| `overlay`（视频全出血）              | `video-overlay`   | `{ left: 0, top: 0, width: 1920, height: 1080 }`（与默认值相比无变化）    | —                                          |
| **隐藏视频**（纯图形时刻）           | `fullscreen`      | `{ opacity: 0 }`（或移出画布）                                           | —                                          |

进入或离开 pip 时刻时，如需切换 pip-pill 装饰效果（圆角 + 白色描边 + 投影）：

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

**卡片宿主的边界与区域相匹配**。使用第 6 步顶部的表格，将卡片的 `zone` 解析为像素边界，然后将这些值写入卡片宿主的内联 `style="left:Xpx;top:Ypx;width:Wpx;
height:Hpx;..."`。对于 `video-overlay` 区域（叠加层方案），卡片宿主会填满整个画布——由 `.card .root` 内部的 CSS 决定实际可见卡片所在的位置。

#### HyperFrames 布局/动画 QA 规则

- 首先构建每张卡片的静态主视觉帧：即卡片完全可见且可读的时刻。
- 确认视频、卡片、字幕/说明文字和图表不会意外重叠。
- 确认视频的隐藏区域被画框裁剪，不会显示在预期边界之外。
- 将一个已暂停的主时间线注册为 `window.__timelines["talking-head-recut"]`。
- 在页面加载时同步构建时间线；不要使用 `async`、`setTimeout`、Promises 或媒体 `play()` 调用。
- 不要在渲染路径中使用 `Math.random()` 或 `Date.now()`。
- 不要使用 `repeat: -1`；根据视频时长计算有限的重复次数。
- 对于运动效果，优先使用 GSAP 的变换和不透明度属性（`x`、`y`、`scale`、`rotation`、`opacity`），而不是布局属性（`top`、`left`、`width`、`height`）。
- 为 `#video-wrap` 等包装器添加动画，不要直接对视频元素的尺寸添加动画。
- 避免同时通过多个时间线为同一元素的同一属性添加动画。
- 使用 `data-track-index`，不要使用 `data-layer`；使用 `data-duration`，不要使用 `data-end`。
- 每个定时元素（`card-host`、子合成等）除了自身的类之外，还必须包含 `class="clip"`——例如 `class="card-host clip"`。HyperFrames 运行时使用 `.clip` 将可见性限制在 `data-start … data-start+data-duration` 时间窗口内。如果缺少它，该元素将在整个视频期间始终可见（lint：`timed_element_missing_clip_class`）。
- 对于 body / 全局 `font-family`，请列出**具体的字体名称**（`'Inter', 'Caveat', …`），不要使用类似 `var(--font-family)` 的 CSS 变量。HyperFrames 字体解析器在静态分析期间不会展开 CSS 变量（lint：`font_family_without_font_face`）。卡片内部仍可使用 `var(--font-family)`，因为其 `@font-face` 声明会被加载。

### 10. 渲染为 MP4

```bash
cd "$WORK_DIR"
PRODUCER_BROWSER_GPU_MODE=hardware npx hyperframes render public \
  --skill=talking-head-recut \
  -o output.mp4 \
  --fps 30
```

`hyperframes render <dir>` 会读取 `<dir>/index.html` 并生成 MP4。
标准合成会将视觉 `<video>` 保持为静音状态，并将同一源挂载为根 `#source-audio` 轨道，因此渲染后的 MP4 无需手动重新混流即可保留出镜讲解者的音频。这里使用单独的音轨，而不是 `data-has-audio="true"`，从而使其音量和闪避效果可在时间线上保持独立控制。
强烈建议在 macOS 上使用 `PRODUCER_BROWSER_GPU_MODE=hardware` 标志（或 `--browser-gpu`）——在大多数笔记本电脑上，仅使用软件的 Chrome 渲染会超时。

在完整渲染之前进行合理性检查时，可在指定时间戳捕获单帧：

```bash
npx hyperframes snapshot public --at 5    # → public/snapshots/frame-00-at-5s.png (a single --at ignores --out)
```

### 11. 报告结果

告知用户：

- 工作目录路径
- `storyboard.json`（你设计的卡片大纲）
- `public/cards/*.html`（每张卡片对应一个 HTML）
- `public/index.html`（组装后的合成页面）
- `output.mp4`（最终视频）
- 使用的 ASR 提供商
- 卡片数量 + 你如何选择这些卡片（用一句话说明）
- 任何缺失的密钥或质量注意事项

**可选的实时预览（仅在用户请求时）。** 原始片段会在 `public/index.html` 中保持不变地播放，并在其上显示叠加层，因此能够提供忠实的预览。**运行期间不要打开它。** 当用户提出请求时，在渲染完成**之后**启动一个长期运行的服务器，并报告其 URL：

```bash
(cd "$WORK_DIR/public" && npx hyperframes preview)   # or `npx hyperframes play` for a shareable link
```

除非用户提出要求，否则不要删除工作目录。