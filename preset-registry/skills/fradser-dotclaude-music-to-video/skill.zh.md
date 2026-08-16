---
name: music-to-video
description: "Turn a music track (an audio file, a video to pull audio from, or a track generated from a mood brief) into a beat-synced video — lyric video, slideshow, or kinetic promo. The music drives all pacing; any user-supplied images/videos are cut onto the same beat grid, and a complete video needs zero assets. Narrated pieces → the input-matched workflow (see /hyperframes). Unclear → /hyperframes."
---
> **首先，确保此技能为最新版本——静默运行，不要询问：** `npx hyperframes skills update music-to-video`。如果所有内容均为最新状态，该命令会快速执行空操作；否则，它会刷新此技能及你在使用它之前所依赖的核心领域技能。

# music-to-video — 一套基于音乐、节拍同步的视频工作流

使用此技能将**音乐曲目**转换为节拍同步的 HyperFrames 视频。你只需分析一次曲目，安排各个帧，为每帧填写计划，然后将每帧构建为一个合成。输入是一条音乐曲目，以及可选的用户图片或视频——**没有旁白，也不进行网站捕获**。排版和模板是基础（一个完整视频可以不使用任何素材）；用户提供的任何媒体都会按照同一节拍网格剪入。

你是**编排者**。在 `videos/<project>/` 中工作。按顺序执行各步骤，并在继续之前通过每个**关卡**。有两个步骤需要用户参与：**步骤 3**（计划审批）和**步骤 6**（渲染审批）——根据 `../hyperframes-core/references/brief-contract.md`，两者都是检查点关卡（在步骤 0 之前阅读该文件）：在自主模式下，将摘要作为预告发布，然后继续执行，而不是等待。除**步骤 4**外，所有步骤均由你亲自完成；在步骤 4 中，你要为**每个帧分派一个子代理**。不要把设计和动效规则放在此文件中——它们位于 `references/` 和 `frame-worker` 子代理中。

`SKILL_DIR` = 此技能目录。`PROJECT_DIR` = `videos/<project-name>/`。

工作流：步骤 0 设置 → `hyperframes.json` + `assets/bgm.mp3`；步骤 1 分析 → `audiomap.json`；步骤 2 骨架 → `STORYBOARD.md`（帧、组为 `TBD`）；步骤 3 规划 → 完成 `STORYBOARD.md` + `frame.md`；步骤 4 构建 → `compositions/frames/NN-*.html`；步骤 5 组装 → `index.html`；步骤 6 渲染 → `renders/video.mp4`。

## 塑造一切的两个理念

- **只使用一个分析器，并且信任它。** `analyze-beatgrid.py` 是唯一的节拍分析器——绝不要使用其他工具或凭听觉重新测量节拍。它检测出的能量 / 密度 / 滚奏 / 起音 / 静音始终可靠。它的 `bpm` 和 `beats_sec` **仅在音乐确实具有明显节奏时**才可靠；对于舒缓音乐，该网格只是跟踪器强加的节拍器，因此应按照乐句和能量来控制节奏，绝不要依据该网格进行硬切。判断属于哪种情况，是每个帧的 `pacing`（步骤 2）。
- **一个帧 = 一个文件；组位于帧内部。** 步骤 2 将曲目切分为多个**帧**，每个帧都会成为一个合成文件 `compositions/frames/NN-<frame_id>.html`，由一个 frame-worker 构建。一个帧可以细分为多个**组**（每个组可以是一个模板或一个动效基元组合）。额外的密度放在组的_内部_，因此**帧数对应的是不同的处理方式，而不是节拍数量**——快速曲目不会导致子代理数量激增。

---

## 步骤 0：设置、BGM 和输入

目标：确定音乐来源，创建 HyperFrames 项目，并记录用户提供的所有媒体。

**需求简报从意图层开始。** 开场规则按以下顺序执行：**(1)** `BRIEF.md` 存在 → 阅读它，不要询问其中已经回答的问题——其 `flow`/`storyboard` 用于推导模式（需求简报契约 § 1）。**(2)** 不存在 `BRIEF.md`，但项目已存在 → 根据磁盘上的现有内容恢复；绝不要重新盘问。**(3)** 一个直接到达此处的全新创建请求 → 阅读 `/hyperframes` 并运行其意图层（§ 4）：它会确认此路径的必需信息（音乐来源、目标位置 → 宽高比——`route-briefs.md` § /music-to-video），并说明哪些内容仍会延后处理——品牌和类型按设计在步骤 3 中选择。初始化后立即写入 `BRIEF.md`（绝不要在初始化之前写入——`init` 会拒绝非空目录），并记录由偏好支持的答案（`brief-format.md`）。编辑请求跳过以上所有内容。

**音乐是脊梁**——在进行其他任何操作之前，先确定一条音乐。本技能针对**快节奏、高能量的 BGM**进行了调优：强劲的节拍网格会驱动剪辑（舒缓曲目也适用，但应按乐句而非节拍来控制节奏）。如果用户提供了音频——音乐文件，或可从中提取音频的视频——就使用它。否则，根据请求选择情绪，并通过 `/media-use`（`references/bgm.md`）生成曲目。在首次执行需要身份验证的提供商操作之前，运行 `npx hyperframes auth status`，并原样转达其输出。如果处于未登录状态，采用以下分支之一：

- **协作模式：**等待用户登录，或等待用户明确选择使用本地提供商继续离线操作。
- **自主模式：**说明当前状态，并通过可用的本地提供商继续操作。

如果没有任何离线提供商能够满足所需的音乐能力，请明确指出这一阻碍。切勿将密钥写入每个仓库自己的 `.env`。身份验证归属和离线回退方案见 `/media-use` § Providers。生成的曲目存放在 `assets/bgm.mp3`。对用户提供的图像或视频进行暂存，以便画面能够按照节拍网格使用它们；否则，由动态排版承担视频的视觉呈现。

**歌词视频：**对于需要与人声同步的歌词，通过 `/media-use` 转录曲目以获取单词/歌词行的时间信息，或者向用户索取歌词文本，并将各行放置到节拍网格上。

仅当 `hyperframes.json` 缺失时才进行初始化。根据简述以 kebab-case 命名 `<project>`，例如 `midnight-drive-loop`——绝不要使用时间戳。`init` 会对照 GitHub 上的最新版本检查已安装的技能；如果有任何技能已过期，则会更新全局技能集。

```bash
npx hyperframes init "videos/<project>" --non-interactive --example=blank
mkdir -p "$PROJECT_DIR/assets" "$PROJECT_DIR/renders"
cp "<user-music>" "$PROJECT_DIR/assets/bgm.mp3"   # extract from a video first if needed
# only if the user gave you images/videos:
node <SKILL_DIR>/scripts/stage-assets.mjs --from <dir> --hyperframes "$PROJECT_DIR" --into public
```

**品牌风格**（字体 + 调色板）在第 3 步选择，而不是在这里。不要预先选择风格类型或曲目类型——素材只是可选的组成部分，而整体风格会从每一帧的选择中自然形成。

**关卡条件：**`hyperframes.json` + `assets/bgm.mp3` 已存在；宽高比 / 时长 / fps，以及素材清单（如有）均已记录。

---

## 第 1 步：分析音乐

目标：生成整支视频所依据的唯一标准时间分析。

`analyze-beatgrid.py` 是**唯一**的节拍分析器——绝不要使用其他工具或凭听觉重新测量节拍。它会读取曲目一次并写入 `audiomap.json`：能量阶段（level / density / feel）、onsets + `onset_rate`、rolls、silences、`hard_stops`、`key_moments`、phrases、tempo / grid，以及 `audio.duration_sec`。它具有确定性——相同的文件总会生成相同的映射。大多数字段对于任何音乐都可靠；仅当音乐确实具有明显节奏时，`bpm` 和 `beats_sec` 才可靠，而是否满足这一条件需要你在第 2 步中进行判断。

前置条件：Python 3 环境中必须提供 `librosa`、`numpy` 和 `soundfile`。如果导入失败，请先将它们安装到当前活动的 Python 环境中，再运行分析器：

```bash
python3 -m pip install librosa numpy soundfile
```

```bash
python3 <SKILL_DIR>/scripts/analyze-beatgrid.py "$PROJECT_DIR/assets/bgm.mp3" \
  -o "$PROJECT_DIR/audiomap.json" --print
```

**门禁：** `audiomap.json` 已存在；`audio.duration_sec` 已知。

---

## 第 2 步：帧骨架（仅结构）

目标：读取音乐并规划各帧——即 `STORYBOARD.md` 的骨架。

阅读 [`references/frame-skeleton.md`](references/frame-skeleton.md)。自行将 `audiomap.json` 转换为 `STORYBOARD.md` 的**骨架**——不生成中间 JSON。根据真实的音乐变化将音轨切分为**帧**（`hard_stops`、SURGE / DROP `key_moments`、滚奏的起止边界、没有起音的一段、能量大幅跃升），并将每个边界吸附到 audiomap 锚点。为每一帧设置 `span_sec`、`pacing`（来自第 1 步可信度判断的结论——当节拍网格真实可信时使用 `beat_cut`；当它只是强加在舒缓音乐上的节拍器时使用 `phrase_flow`）、`mood`，以及一行 `feel`（第 3 步用来匹配模板的直白音乐情境描述）。此处只进行分类和布局：将每一帧的 `### Groups` 保留为 `TBD (Step 3)`，并将 frontmatter 中的 `style` 留空——不使用模板、文案、颜色或字体。预计约 1–6 帧。

**门禁：** 各帧完整铺满音轨（第一帧从 0 开始，最后一帧结束于 `duration_s`）；每一帧都包含 `span_sec` + `pacing` + `mood` + `feel`；所有 `### Groups` 均为 `TBD`；任何位置都没有内容。

---

## 第 3 步：填写规划（需用户确认）

目标：将骨架转变为经批准且完整的 `STORYBOARD.md`。

阅读 [`references/planning.md`](references/planning.md)、[`storyboard-format.md`](references/storyboard-format.md)、[`template-catalog.md`](references/template-catalog.md)、[`motion-primitive-catalog.md`](references/motion-primitive-catalog.md)，以及 [`montage.md`](references/montage.md)（仅当用户提供了素材时）。直接编辑同一文件，完成以下两项工作：

1. **选择品牌。** 使用 `../hyperframes-creative/references/design-spec.md` 中的表格，从 `../hyperframes-creative/frame-presets/` 选择一个预设（匹配音轨的情绪；**只有其字体和颜色需要采用**——构图由模板决定）。将其**不作任何修改**地复制到 `frame.md`，并根据它填写 frontmatter 中的 `style`（字体 + 一个不超过 4–6 个色样的调色板）。
2. **填写每一帧。** 确定其分组，并为每个分组指定一种处理方式：目录中匹配的模板（包含已绑定的参数和真实的 audiomap 锚点）、基于基础元素目录的自由编排，或**遵循 `pacing`** 的素材处理。撰写文案。你负责内容和选择（模板 / 基础元素 + 内容 + 锚点）；frame-worker 负责实现方式——**绝不要在 storyboard 中写入毫秒级补间动画**。

```bash
node <SKILL_DIR>/scripts/validate-plan.mjs --storyboard "$PROJECT_DIR/STORYBOARD.md" \
  --audiomap "$PROJECT_DIR/audiomap.json" --templates <SKILL_DIR>/references/templates
```

修复每一个 `✗`（硬性错误：时长不匹配、各帧未完整铺满音轨、缺少 `src`）；警告则尽力处理。然后向用户展示逐帧摘要并持续迭代，直到他们批准。在自主模式下，这是一个检查点门禁：发布摘要作为预先告知，然后继续执行（通过 `validate-plan.mjs` 仍是质量门禁，未通过时依然会阻止继续执行）。

**门禁：** `frame.md` 是逐字复制的预设文件；`validate-plan.mjs` 以状态码 0 退出；用户已批准计划（自主模式：已发布摘要作为事先告知）。

---

## 步骤 4：根据计划构建帧

目标：将每一帧构建为自包含的合成文件。

创建 `compositions/frames/`。阅读 [`sub-agents/frame-worker.md`](sub-agents/frame-worker.md) 和 `../hyperframes-core/references/subagent-dispatch.md`。为**每一帧派发一个 frame-worker**，尽可能并行执行（否则分批执行）。每个 worker 只负责一帧，并获得以下上下文：

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

worker 会派生所引用的素材，将每个锚点转换为帧内局部秒数（`local_t = track_t − span_sec[0]`），使用 0ms 切换控制其各个组，并写入一个可安全跳转的帧文件。**worker 绝不运行 `hyperframes` CLI**——这些命令针对的是组装后的项目，而该项目此时尚不存在，因此它们会对错误的文件进行报告。worker 只需按照契约写入文件，然后停止；你将在组装完成后进行验证（步骤 6）。每个 worker 返回时，你可以确认其文件已写入磁盘。

**门禁：**每一帧对应的 `compositions/frames/NN-*.html` 都已存在于磁盘上。

---

## 步骤 5：组装

目标：将已构建的帧和 BGM 接入可播放的 `index.html`。

`assemble-index.mjs` 是确定性的——无需 subagent，也不需要判断。它在各自累计的 `data-start` 处引用每个帧文件，将 `assets/bgm.mp3` 挂载到轨道 11，并在帧与帧之间进行硬切（各帧无缝铺满整个轨道，因此**不存在转场注入器**）。

```bash
node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard "$PROJECT_DIR/STORYBOARD.md" \
  --hyperframes "$PROJECT_DIR" --audiomap "$PROJECT_DIR/audiomap.json"
```

修复它报告的所有 `✗`——缺失或空白的帧文件意味着对应 worker 写入了不完整的文件；重新派发该 worker（步骤 4），然后重新组装。

**门禁：**`index.html` 已存在；总时长 == `audiomap.audio.duration_sec`。

---

## 步骤 6：验证并渲染

目标：验证组装后的视频、获得用户批准，并渲染最终 MP4。

在**组装后的项目**上运行 CLI——这才是正确的验证单元（各帧 worker 无法运行它）。`check` 会在一次执行中完成结构 lint，以及基于无头浏览器的运行时、布局、动效和对比度门禁检查；`--snapshots` 还会输出用于审阅的帧。

```bash
( cd "$PROJECT_DIR" && npx hyperframes check . --snapshots )
```

检查 `t=0`、每一帧的起始位置、最强的 DROP / SURGE、每个 `hard_stops[].t`，以及最后一帧。如果失败，请自行进行**成本最低且安全的修复**：编辑有问题的 `compositions/frames/NN-*.html`。绝不要通过更改时长或音频时间来掩盖同步问题。所有门禁通过后，暂停并等待用户审阅，然后仅在获得批准后进行渲染（自主模式：询问唯一保留的问题——“先预览，还是直接渲染？”——然后交付 MP4 和联系表）：

```bash
( cd "$PROJECT_DIR" && npx hyperframes render . --skill=music-to-video -q draft -o renders/video.mp4 --fps 30 )
```

**门禁条件：** `check` 已通过且快照已检查；用户已批准（自主模式：检查已通过，且交付内容包含联系表）；`renders/video.mp4` 存在并带有音频，时长 == `audiomap.audio.duration_sec`。最终回复中注明 MP4 路径和时长。

---

## 恢复进度表

| 现有内容                   | 从此步骤继续 |
| -------------------------- | ------------ |
| 仅有 `assets/bgm.mp3`      | 步骤 1       |
| `audiomap.json`            | 步骤 2       |
| `STORYBOARD.md`（骨架）    | 步骤 3       |
| `STORYBOARD.md`（完整）    | 步骤 4       |
| 所有帧文件                 | 步骤 5       |
| `index.html`               | 步骤 6       |

## 快速参考

**格式：** 横屏默认为 `1920x1080`；竖屏为 `1080x1920`；方形为 `1080x1080`。在故事板 frontmatter 中统一设置一次画布（`canvas: { w, h, fps }`）。

`scripts/` 下的**脚本：** `analyze-beatgrid.py`（唯一的分析器）、`validate-plan.mjs`（计划检查）、`assemble-index.mjs`（索引组装）、`stage-assets.mjs`（暂存用户媒体）、`lib/storyboard.mjs`（内置的解析器）。其他所有操作均使用 `hyperframes` CLI。

| 阅读                                                                                                           | 使用时机                                                |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`references/frame-skeleton.md`](references/frame-skeleton.md)                                                 | 步骤 2：理解音乐、规划帧并设定节奏                      |
| [`references/planning.md`](references/planning.md) · [`storyboard-format.md`](references/storyboard-format.md) | 步骤 3：选择品牌、完善每一帧并编写计划                  |
| [`references/template-catalog.md`](references/template-catalog.md)                                             | 步骤 3：为每个组选择模板                                |
| [`references/motion-primitive-catalog.md`](references/motion-primitive-catalog.md)                             | 步骤 3/4：用于自由编排的 L0 配方                        |
| [`references/montage.md`](references/montage.md)                                                               | 步骤 3/4：素材处理方式（节拍剪辑 / 肯·伯恩斯效果）      |
| [`sub-agents/frame-worker.md`](sub-agents/frame-worker.md)                                                     | 步骤 4：分派任务并构建单帧                              |
| `../hyperframes-core/references/subagent-dispatch.md`                                                          | 步骤 4：安全地分派子代理                                |
| `../hyperframes-creative/references/design-spec.md`                                                            | 步骤 3：选择预设（品牌）                                |

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