---
name: music-to-video
description: "Turn a music track (an audio file, a video to pull audio from, or a track generated from a mood brief) into a beat-synced video — lyric video, slideshow, or kinetic promo. The music drives all pacing; any user-supplied images/videos are cut onto the same beat grid, and a complete video needs zero assets. Narrated pieces → the input-matched workflow (see /hyperframes). Unclear → /hyperframes."
---
> **首先，让此技能保持最新——运行前请先与用户确认：** `npx hyperframes skills update music-to-video`。如果一切都是最新的，这是一个快速的空操作；否则它会在你依赖此技能及其所依赖的核心领域技能之前刷新它们。

# music-to-video — 一个以音乐为基础、与节拍同步的视频工作流

使用此技能将**音乐轨道**转换为与节拍同步的 HyperFrames 视频。你会分析一次轨道，规划帧，填写逐帧计划，并将每一帧构建为一个合成。输入是一条音乐轨道，加上可选的用户图片或视频——**没有旁白，也没有网站捕获**。排版和模板是基础（一个完整视频可以不需要任何素材）；用户提供的任何媒体都会在同一节拍网格上剪入。

你是**编排者**。在 `videos/<project>/` 中工作。按顺序运行各步骤，并在继续前通过每个 **Gate**。两个步骤需要用户参与：**Step 3**（计划审批）和 **Step 6**（渲染审批）——二者都是依据 `../hyperframes-core/references/brief-contract.md` 的检查点关卡（在 Step 0 前阅读它）：在自主模式下，发布摘要作为提醒并继续，而不是等待。除 **Step 4** 外，所有步骤都由你自己完成；在 **Step 4** 中，你会为每一帧派发**一个子代理**。不要把设计和动效规则放进此文件——它们位于 `references/` 和 `frame-worker` 子代理中。

`SKILL_DIR` = 此技能目录。`PROJECT_DIR` = `videos/<project-name>/`。

工作流：Step 0 设置 → `hyperframes.json` + `assets/bgm.mp3`；Step 1 分析 → `audiomap.json`；Step 2 骨架 → `STORYBOARD.md`（帧，组为 `TBD`）；Step 3 计划 → 完整的 `STORYBOARD.md` + `frame.md`；Step 4 构建 → `compositions/frames/NN-*.html`；Step 5 组装 → `index.html`；Step 6 渲染 → `renders/video.mp4`。

## 塑造一切的两个理念

- **一个分析器，并且你信任它。** `analyze-beatgrid.py` 是唯一的节拍分析器——绝不要用其他工具或凭耳朵重新测量节拍。它的能量 / 密度 / 滚奏 / 起音 / 静默始终可靠。它的 `bpm` 和 `beats_sec` **只有在音乐确实有节奏时才可靠**；在平缓音乐中，网格是跟踪器强加的节拍器，因此应改为按乐句和能量控制节奏，并且绝不要硬切到它。判断属于哪种情况是每一帧的 `pacing`（Step 2）。
- **一帧 = 一个文件；组存在于其中。** Step 2 将轨道切分为**帧**，每一帧都会成为一个合成文件 `compositions/frames/NN-<frame_id>.html`，由一个 frame-worker 构建。一帧可以细分为**组**（每组是一个模板或一个 motion-primitives 组合）。额外的密度放在一个组的_内部_，因此**帧数量对应的是不同处理方式，而不是节拍**——快速曲目不会导致子代理数量膨胀。

---

## Step 0：设置、BGM 和输入

目标：确定音乐源，创建 HyperFrames 项目，并记录任何用户提供的媒体。

**简报从意图层开始。** 开场规则，按顺序：**(1)** `BRIEF.md` 存在 → 读取它，不要询问其中已经回答的问题——它的 `flow`/`storyboard` 推导出模式（简报契约 § 1）。**(2)** 没有 `BRIEF.md` 但项目存在 → 从磁盘上的内容继续；绝不要重新盘问。**(3)** 直接到达这里的全新创建请求 → 阅读 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：它会确认此路线的必需项（音乐源、目标 → 宽高比——`../hyperframes/references/routes/music-to-video.md`）并说明哪些保持延后——品牌和类型按设计在 Step 3 选择。初始化后立即写入 `BRIEF.md`（绝不要在之前——`init` 会拒绝非空目录）并记录有偏好依据的答案（`brief-format.md`）。编辑请求跳过所有这些。

**音乐是骨架**——在做任何其他事情之前，先确定一条音轨。此技能针对**快速、高能量的 BGM**进行了调优：强烈的节拍网格驱动剪辑（平静曲目也可以使用，但应按乐句而非节拍来控制节奏）。如果用户提供了音频——音乐文件，或可从中提取音频的视频——就使用它。否则，根据请求选择情绪，并通过 `/media-use`（`references/bgm.md`）生成一条音轨。在第一次执行需要认证的提供商操作之前，运行 `npx hyperframes auth status` 并逐字转述其输出。如果已登出，应用以下一个分支：

- **协作式：** 等待登录，或等待明确选择使用本地提供商离线继续。
- **自主式：** 说明状态，并通过可用的本地提供商继续。

如果没有离线提供商能够满足所需的音乐能力，则暴露该阻塞项。绝不要将密钥写入每个仓库的 `.env`。认证所有权和离线回退位于 `/media-use` `references/setup-providers.md` § Providers。生成的音轨位于 `assets/bgm.mp3`。整理用户提供的图像或视频，以便帧可以在节拍网格上使用它们；否则由排版承担视频表现。

**歌词视频：** 对于与人声同步的歌词，通过 `/media-use` 转录音轨来获取单词/行时间，或向用户索取歌词文本并将行放置在节拍网格上。

仅当缺少 `hyperframes.json` 时才初始化。根据简报用 kebab-case 命名 `<project>`，例如 `midnight-drive-loop`——绝不要使用时间戳。`init` 会将已安装的技能与 GitHub 上的最新版本进行检查，如果有任何过期内容，则更新全局集合。

```bash
npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=music-to-video
mkdir -p "$PROJECT_DIR/assets" "$PROJECT_DIR/renders"
cp "<user-music>" "$PROJECT_DIR/assets/bgm.mp3"   # extract from a video first if needed
# only if the user gave you images/videos:
node <SKILL_DIR>/scripts/stage-assets.mjs --from <dir> --hyperframes "$PROJECT_DIR" --into public
```

**品牌**（字体 + 调色板）在 Step 3 选择，而不是在这里。不要预先选择流派或曲目类型——素材只是可选成分，流派会从逐帧选择中浮现。

**门槛：** `hyperframes.json` + `assets/bgm.mp3` 存在；aspect / length / fps 以及（如有）素材清单已记录。

---

## Step 1: 分析音乐

目标：生成整个视频所依据的唯一规范时序分析。

`analyze-beatgrid.py` 是**唯一**的节拍分析器——绝不要使用其他工具或凭听觉重新测量节拍。它读取音轨一次并写入 `audiomap.json`：能量阶段（level / density / feel）、onsets + `onset_rate`、rolls、silences、`hard_stops`、`key_moments`、phrases、tempo / grid，以及 `audio.duration_sec`。它是确定性的——同一个文件始终生成同一张映射。大多数字段对任何音乐都可靠；只有当音乐确实具有节奏性时，`bpm` 和 `beats_sec` 才可靠，而判断这一点是你在 Step 2 要做出的决策。

先决条件：Python 3，且可用 `librosa`、`numpy` 和 `soundfile`。如果导入失败，请在运行分析器之前将它们安装到当前 Python 环境中：

```bash
python3 -m pip install librosa numpy soundfile
```

```bash
python3 <SKILL_DIR>/scripts/analyze-beatgrid.py "$PROJECT_DIR/assets/bgm.mp3" \
  -o "$PROJECT_DIR/audiomap.json" --print
```

**门槛：** `audiomap.json` 存在；`audio.duration_sec` 已知。

---

## 步骤 2：帧骨架（仅结构）

目标：读取音乐并布局各帧 —— `STORYBOARD.md` 的骨架。

阅读 [`references/frame-skeleton.md`](references/frame-skeleton.md)。自行将 `audiomap.json` 转换为 `STORYBOARD.md` 的**骨架** —— 没有中间 JSON。在真实的音乐变化处将音轨切分为**帧**（`hard_stops`、SURGE / DROP `key_moments`、roll 的边缘、没有 onset 的一段、巨大的能量跃迁），并将每个边界吸附到 audiomap 锚点。为每个帧设置 `span_sec`、`pacing`（步骤 1 的信任判断结论 —— 当网格真实时用 `beat_cut`，当它是强加在平静音乐上的节拍器时用 `phrase_flow`）、`mood`，以及一行 `feel`（步骤 3 用来匹配模板的朴素音乐情境）。这里只做分类和布局：将每个帧的 `### Groups` 保持为 `TBD (Step 3)`，并将 frontmatter 的 `style` 留空 —— 不要模板、文案、颜色或字体。预计约 1–6 个帧。

**门槛：** 帧覆盖整条音轨（第一个从 0 开始，最后一个到 `duration_s`）；每个帧都带有 `span_sec` + `pacing` + `mood` + `feel`；每个 `### Groups` 都是 `TBD`；任何地方都没有内容。

---

## 步骤 3：填充计划（需用户把关）

目标：将骨架变成一个已批准、完整的 `STORYBOARD.md`。

阅读 [`references/planning.md`](references/planning.md)、[`storyboard-format.md`](references/storyboard-format.md)、[`template-catalog.md`](references/template-catalog.md)、[`motion-primitive-catalog.md`](references/motion-primitive-catalog.md)，以及 [`montage.md`](references/montage.md)（仅当用户提供了素材时）。在同一个文件中就地编辑，做两件事：

1. **选择品牌。** 使用 `../hyperframes-creative/references/design-spec.md` 中的表格，从 `../hyperframes-creative/frame-presets/` 里选择一个预设（匹配音轨的情绪；**只关心它的字体和颜色** —— 模板负责构图）。将其**原样**复制到 `frame.md`，并从中填写 frontmatter 的 `style`（字体 + 一个 ≤4–6 色的色板）。
2. **填充每个帧。** 决定它的组，并为每组给出处理方式：来自目录的匹配模板（带绑定参数和真实 audiomap 锚点）、来自 primitive 目录的自由组合，或一个**遵守 `pacing`** 的素材处理。**在你自由组合某个具名视觉效果之前，先在实时目录中搜索它**：对于用户要求的每一种视觉、效果、处理或转场 —— “CRT scanlines”、“glitch”、“film grain”、“shimmer sweep” —— 运行 `npx hyperframes catalog --query "<the look, in plain English>" --json` 并阅读顶部结果。`template-catalog.md` 和 `motion-primitive-catalog.md` 只列出此 skill 自己的本地材料；搜索会对整个托管注册表（约 400 个区块和组件）进行排序，并且**不需要安装任何东西** —— 不需要项目、不需要预先 `add`、不需要账号。只有在搜索没有返回合适结果后，才自由组合一种视觉效果。编写文案。你负责 WHAT（模板 / primitives + 内容 + 锚点）；frame-worker 负责 HOW —— **绝不要在 storyboard 中写毫秒级 tween**。

```bash
node <SKILL_DIR>/scripts/validate-plan.mjs --storyboard "$PROJECT_DIR/STORYBOARD.md" \
  --audiomap "$PROJECT_DIR/audiomap.json" --templates <SKILL_DIR>/references/templates
```

修复所有 `✗`（硬错误：时长不匹配、帧未铺满音轨、缺少 `src`）；警告尽力处理。然后向用户展示逐帧摘要，并持续迭代，直到用户批准。在自主模式下，这是一个检查点门控：发布摘要作为提示并继续（`validate-plan.mjs` 检查是质量门控，仍会阻塞流程）。

**门控条件：**`frame.md` 是逐字复制的预设；`validate-plan.mjs` 以 0 退出；用户已批准该计划（自主模式：已发布摘要作为提示）。

---

## 步骤 4：根据计划构建帧

目标：将每一帧构建为一个自包含的组合文件。

创建 `compositions/frames/`。阅读 [`sub-agents/frame-worker.md`](sub-agents/frame-worker.md) 和 `../hyperframes-core/references/subagent-dispatch.md`。为每一帧分派一个 `frame-worker`，尽可能并行执行（否则分波次执行）。每个 worker 只处理一帧，并获得以下上下文：

```text
PROJECT_DIR: <abs path>
frame_id: <NN-frame_id>              # = the frame file stem, e.g. 02-f2; the composition id
Your block: the `## Frame N — <frame_id>` block in PROJECT_DIR/STORYBOARD.md
audiomap: PROJECT_DIR/audiomap.json
frame.md: PROJECT_DIR/frame.md
Materials: for each group, <SKILL_DIR>/references/templates/<id>/index.html (templates) and
           <SKILL_DIR>/references/motion-primitives/<id>/ (free); staged assets/ (asset groups)
Contracts: ../hyperframes-core/references/sub-compositions.md + determinism-rules.md
Canvas: <w>×<h>   Pacing: <beat_cut|phrase_flow>
Write to: PROJECT_DIR/compositions/frames/<frame_id>.html
```

worker 会分叉所引用的材料，将每个锚点转换为帧本地秒数（`local_t = track_t − span_sec[0]`），使用 0ms 切点控制其各组，并写入一个可安全跳转的帧文件。worker **绝不会运行 `hyperframes` CLI** ——这些命令作用于已组装的项目，而项目此时尚不存在，因此它们会针对错误的文件进行报告。worker 只需按照契约写入文件，然后停止；组装完成后再进行验证（步骤 6）。每个 worker 返回后，你可以确认其文件已落盘。

**门控条件：**每一帧都已在磁盘上生成其 `compositions/frames/NN-*.html`。

---

## 步骤 5：组装

目标：将已构建的帧和 BGM 接入可播放的 `index.html`。

`assemble-index.mjs` 是确定性的 —— 不使用子代理，也不进行判断。它会根据每帧累计的 `data-start` 引用对应的帧文件，将 `assets/bgm.mp3` 挂载到轨道 11，并在帧与帧之间执行硬切（帧会无间隙地铺满音轨，因此**不存在转场注入器**）。

```bash
node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard "$PROJECT_DIR/STORYBOARD.md" \
  --hyperframes "$PROJECT_DIR" --audiomap "$PROJECT_DIR/audiomap.json"
```

修复它报告的所有 `✗` ——缺失或空白的帧文件意味着该 worker 写入了不完整的文件；重新分派它（步骤 4），然后重新组装。

**门槛：**`index.html` 存在；总时长 == `audiomap.audio.duration_sec`。

---

## 第 6 步：验证并渲染

目标：验证组装后的视频，获取用户批准，并渲染最终的 MP4。

在**组装后的项目**上运行 CLI——这是正确的操作单元（逐帧 worker 无法运行它）。`check` 会一次性执行结构 lint、无头浏览器运行时检查、布局检查、运动检查和对比度门槛检查；`--snapshots` 还会生成供审阅的帧。

```bash
( cd "$PROJECT_DIR" && npx hyperframes check . --snapshots )
```

检查 `t=0`、每个帧的起始位置、最强的 DROP / SURGE、每个 `hard_stops[].t`，以及最终帧。如果失败，请自行进行**成本最低且安全的修复**：编辑有问题的 `compositions/frames/NN-*.html`。绝不要通过修改时长或音频时间安排来掩盖同步问题。所有门槛通过后，暂停并等待用户审阅，然后仅在获得批准后进行渲染（自主模式：询问唯一保留的问题——“先预览，还是直接渲染？”——然后交付 MP4 和联系表）：

```bash
( cd "$PROJECT_DIR" && npx hyperframes render . --skill=music-to-video -q draft -o renders/video.mp4 --fps 30 )
```

**门槛：**`check` 已通过且快照已检查；用户已批准（自主模式：检查已通过，交付内容包含联系表）；`renders/video.mp4` 存在并带有音频，时长 == `audiomap.audio.duration_sec`。最终回复需说明 MP4 路径和时长。

---

## 恢复表

| 当前已有                   | 从此处继续 |
| -------------------------- | ---------- |
| 仅有 `assets/bgm.mp3`      | 第 1 步     |
| `audiomap.json`             | 第 2 步     |
| `STORYBOARD.md`（骨架）     | 第 3 步     |
| `STORYBOARD.md`（完整）     | 第 4 步     |
| 所有帧文件                  | 第 5 步     |
| `index.html`                | 第 6 步     |

## 快速参考

**格式：**默认使用横屏 `1920x1080`；竖屏为 `1080x1920`；正方形为 `1080x1080`。在 storyboard frontmatter 中设置一次画布（`canvas: { w, h, fps }`）。

`script/` 下的脚本包括：`analyze-beatgrid.py`（唯一的分析器）、`validate-plan.mjs`（计划检查）、`assemble-index.mjs`（索引组装）、`stage-assets.mjs`（暂存用户媒体）、`lib/storyboard.mjs`（内置解析器）。其他所有内容均为 `hyperframes` CLI。

| 阅读                                                                                                           | 时机                                                    |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`references/frame-skeleton.md`](references/frame-skeleton.md)                                                 | 第 2 步：阅读音乐、规划帧、设置节奏                         |
| [`references/planning.md`](references/planning.md) · [`references/storyboard-format.md`](references/storyboard-format.md) | 第 3 步：选择品牌、填充每个帧、编写计划                     |
| [`references/template-catalog.md`](references/template-catalog.md)                                             | 第 3 步：为每个组选择一个模板                             |
| [`references/motion-primitive-catalog.md`](references/motion-primitive-catalog.md)                             | 第 3/4 步：用于自由编排的 L0 配方                         |
| [`references/montage.md`](references/montage.md)                                                               | 第 3/4 步：素材处理（beat-cut / ken-burns）              |
| [`sub-agents/frame-worker.md`](sub-agents/frame-worker.md)                                                     | 第 4 步：调度并构建一个帧                                 |
| `../hyperframes-core/references/subagent-dispatch.md`                                                          | 第 4 步：安全地调度子代理                                 |
| `../hyperframes-creative/references/design-spec.md`                                                            | 第 3 步：选择预设（品牌）                                 |

## 目录结构

```
music-to-video/
  SKILL.md
  references/   frame-skeleton.md · planning.md · storyboard-format.md
                template-catalog.md · motion-primitive-catalog.md · montage.md
                templates/<id>/          { index.html (+ assets/ · program.json) }  ← L1 catalog impls
                motion-primitives/<id>/  { index.html } (+ ../assets/gsap.min.js shared by recipes) ← L0 catalog impls
  scripts/      analyze-beatgrid.py · assemble-index.mjs · validate-plan.mjs · stage-assets.mjs · lib/storyboard.mjs
  sub-agents/   frame-worker.md   ← the one subagent (one per frame)
```