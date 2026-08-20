---
name: faceless-explainer
description: "Turn arbitrary text — an article, notes, a topic, a brief — into a faceless explainer video: there is no site or footage to capture, so the visuals are invented per scene (typography, abstract graphics, diagrams, data-viz). Use for topic explainers, concept breakdowns, how-tos, listicles. Not a video built from a website (/product-launch-video — promo or tour). Unclear → /hyperframes."
---
> **首先，请保持此技能为最新版本——静默运行，不要询问：** `npx hyperframes skills update faceless-explainer`。当所有内容均为最新时，这是一次快速无操作；否则，它会在你依赖它们之前刷新此技能及其依赖的核心领域技能。

> **media-use**：在获取音频/图像/徽标之前，调用 `/media-use` 从 HeyGen 目录中解析 BGM/SFX/图像，并从官方来源解析品牌徽标。先运行 `--adopt` 以登记现有资产。参见 `/media-use` 技能。

# 无出镜讲解视频到 HyperFrames

使用此技能将一段文本转化为讲解视频：选择设计系统，规划教学故事，并在 HyperFrames 中逐帧构建。**无出镜**意味着所有视觉内容均在下游创作——没有采集步骤，也没有真实资产清单。

> **入口是 `/hyperframes`。** 你是编排者。运行每个步骤，验证其关卡，然后才能继续。此技能用于**根据文本讲解某个主题，且没有需要采集的产品和网站**。任何其他意图、仅仅一句“制作视频”，或任何不确定情况 → 请先阅读 `/hyperframes`——意图层负责所有路径决策，并且无论如何，到达此处却没有 `BRIEF.md` 的新建请求都会经过它（Setup 的开篇规则）。

你是编排者。在 `videos/<project>/` 中工作。按顺序运行各步骤，并在继续之前通过每个关卡。需要用户把关的步骤是 Step 0、Step 3 和 Step 6。请在 Step 0 前阅读 `../hyperframes-core/references/brief-contract.md`——它定义了关卡类型，以及 `BRIEF.md` 的 `flow`/`storyboard` 如何推导出决定 Step 3/4/6 关卡的模式。除 Step 5 外，所有步骤均由你亲自完成；在 Step 5 中，你需要为每一帧分派一个子代理。不要在这里编写设计或运动规则；这些规则位于帧工作器子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：Step 0 设置 → `hyperframes.json`；Step 1 简报 → `capture/extracted/`；Step 2 设计系统 → `frame.md`；Step 3 分镜/脚本 → `STORYBOARD.md` 和 `SCRIPT.md`；Step 3.1 音频 → `audio_meta.json`；Step 4 视觉设计 → 充实后的 `STORYBOARD.md`；Step 5 帧 → `compositions/frames/NN-*.html` 和 `index.html`；Step 6 最终渲染 → `renders/video.mp4`。

---

## Step 0: 设置

目标：带着已确认的简报进入，创建 HyperFrames 项目，并使简报可持续留存。

**简报由意图层确认，而不是通过在这里提问来确认。** 开篇规则，依次如下：**(1)** 存在 `BRIEF.md` → 阅读它且不提任何问题——简报已确定，其 `flow`/`storyboard` 会推导出模式（简报契约 § 1）。**(2)** 没有 `BRIEF.md`，但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 从分镜的 frontmatter 和已记录的偏好中恢复；绝不重新盘问一个已构建到一半的项目。**(3)** 两者皆无——直接到达此处的新建请求 → 阅读 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：它会检查配方和已记住的默认值，进行此路径的问题询问（`../hyperframes/references/routes/faceless-explainer.md`），并返回锁定后的简报。编辑请求跳过上述所有内容——直接执行编辑。

仅当缺少 `hyperframes.json` 时初始化。根据主题以 kebab-case 命名 `<project>`，例如 `compound-interest-explained`；绝不要使用工作区名称或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=faceless-explainer` — `init` 会将已安装的 skills 与 GitHub 上的最新版本进行比对，如有过期项，则更新全局集合。

初始化后，将 `videos/<project>` 作为 `<PROJECT_ROOT>`，并让后续所有相对路径命令都以该目录作为工作目录。在下面的命令中，`.` 表示 `<PROJECT_ROOT>`；绝不要在调用方目录中写入 `.media`、`capture` 或输出文件。

**初始化后立即写入 `BRIEF.md`**（绝不要提前写入——`init` 拒绝非空目录）：写入意图层锁定的 brief，格式参见 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` skill 目录。然后使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个由偏好支持的答案（`brief-format.md` 中列出了相应子集）。如果意图层采用了某个 recipe，则运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；该命令会将其 `frame.md` 复制到项目中（随后跳过步骤 2），并返回步骤 3 所起草的骨架。recipe 会填充答案，但不会代替审批；审核门禁仍然执行。

**在 Setup 之后继续操作前显示登录状态**——运行 `npx hyperframes auth status`，并逐字转达其输出。该命令会报告语音/BGM 将使用 HeyGen 还是本地引擎；未登录时，还会说明如何登录。应用以下分支：

- **Collaborative：**等待用户登录，或明确选择 `offline` / `go`。
- **Autonomous：**说明当前状态，并通过可用的本地引擎继续执行。

当不存在离线提供方时，不要静默省略必需能力；应明确指出阻塞原因。不要将此决定合并到其他问题中，也不要将密钥写入每个仓库的 `.env`。认证归属和离线回退机制：`/media-use` `references/setup-providers.md` § Providers。

**门禁：**`hyperframes.json` 和 `BRIEF.md` 均已存在；由偏好支持的答案已记录（brief contract § 2）；登录状态已显示（已登录，或正在离线继续）。

---

## 步骤 1：Brief（不进行 capture）

目标：将用户文本作为信息来源纳入项目。**不会进行网站 capture，也不会使用真实资源**——这是一个无脸讲解视频。

原样保存用户的完整输入，然后手动创建合成 capture 包：

- `capture/extracted/visible-text.txt` — 完整的文章 / 笔记 / 主题 / brief，逐字保存。这是**信息**来源，而不是故事模板（步骤 3 会重新组织内容）。
- `capture/extracted/tokens.json` — `{ "title": "", "description": "", "colors": [], "fonts": [] }`。根据 brief 填写 `title`/`description`。除非用户明确提供了品牌颜色或字体，否则将 `colors`/`fonts` 留空——无论如何，design preset 都会提供完整的调色板。

如果用户粘贴了脚本或希望保留其措辞，请将其逐字保存为 `user_script.txt`；`VO_MODE`（逐字或重构）来自 `BRIEF.md`，意图层会在收到脚本时询问。如果 brief 不知为何缺少它，仅在此处询问一次，并将答案保存供步骤 3 使用。

**不要**运行 `npx hyperframes capture`（没有 URL）。不要创建 `asset-descriptions.md` 或填充 `capture/assets/`，无露脸视觉素材会在步骤 4-5 中构思，而不是捕获。唯一的例外是：如果用户提供了真实图片，请将其放到 `public/<basename>` 下，并为步骤 3 记录该图片。

**门槛：**`capture/extracted/visible-text.txt` 和 `capture/extracted/tokens.json` 存在；你能够用一句清晰的话说明该讲解视频的主题和受众。

---

## 步骤 2：设计系统

目标：选择一个已交付的画框预设；脚本会将其转换为本视频的 `frame.md` + 字幕皮肤。

当 `BRIEF.md` 指定了 `style_preset` 时，使用它；用户已通过意图层的展示示例凭视觉选择了它。只有当 brief 未指定时，才由你作出判断。然后你只需作出一个决定：**选择哪个预设**。阅读 `../hyperframes-creative/references/design-spec.md` 并浏览 `../hyperframes-creative/frame-presets/`；选择外观最符合主题、语调和受众的预设。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

该脚本会以确定性方式完成其余工作：将预设的 `FRAME.md` 复制为 `frame.md`，并将其**重混**到 `capture/extracted/tokens.json` 中的任意品牌 token 上（按角色将品牌颜色映射到预设的颜色键；将预设的展示字体和正文字体替换为品牌字体），将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并进行自我验证（映射损坏时以退出码 1 退出）。只要它以退出码 0 结束就继续，不要手动编辑该规范。

无露脸讲解视频通常**没有品牌颜色/字体**（`tokens.json` 中的 `colors/fonts` 为空）→ 脚本会保留预设自身的配色方案，形成一个完整且可交付的设计。只有当用户指定了品牌颜色/字体时，才在运行前将它们添加到 `tokens.json`；并且只有在映射确实需要调整时，才在之后手动修改 `frame.md`。

**门槛：**`build-frame.mjs` 以退出码 0 结束，`frame.md` 由具名预设生成，并且（当预设附带字幕皮肤时）`.hyperframes/caption-skin.html` 存在并作为字幕皮肤源；所选预设已记录为偏好（`--key style_preset --workflow <this workflow>`，brief 合约 § 2）。

---

## 步骤 3：分镜和脚本

目标：将文本转化为已批准的逐帧教学方案。

阅读 `../hyperframes-creative/references/story-spine.md`（开场钩子语言、证据之前先给价值、将分镜视为提案）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用它们编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。根据 brief 中的 `length` 设置 frontmatter 的 `duration:`，这只是粗略预期；组装过程会报告最终剪辑时长与该预期的差异。

使用 `story-design.md` 获取讲解视频结构（概念 / 操作指南 / 清单式 / 故事）、钩子策略、清晰度技巧、情绪节拍、类型枚举映射以及 `VO_MODE`。视频的顺序来自**叙事设计，而不是输入文本的段落顺序**——可重新排序、合并、省略、压缩。作为**软性指引**，参考 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单：对于每个节拍，按照其候选蓝图所暗示的形式编写旁白，并在适用时标注该候选 `blueprint:` id。教学真实性仍决定哪些节拍存在——绝不可为了适配蓝图而强行加入节拍，也绝不可仅因有可验证的结构可用就虚构节拍。无出镜视觉内容将在下游构思，因此帧**不**携带素材清单：除非用户提供了真实的 `public/<basename>` 图像，否则将 `asset_candidates` 留空。使用故事板和脚本参考文件中要求的精确字段。

起草后，运行审查循环的计划阶段——`../hyperframes-core/references/review-loop.md` § 1：打开看板（不要询问是否打开），将计划作为提案展示，并提出两个问题——批准还是修改，以及**先出草图**（推荐）还是跳过。反馈通过聊天或看板的评论文件循环处理，直到获得批准。这是一个**检查点关卡**（简要合同 § 1）：在自主模式下，没有看板，也无需提问——将相同摘要作为提示发布并继续；草图并入构建流程，并在第 6 步提出唯一的预览问题。

**关卡：**`STORYBOARD.md` 存在，每一帧均具备必需的叙事字段，需要旁白时 `SCRIPT.md` 存在，并且用户已批准逐帧计划（自主模式：摘要已作为提示发布）。

---

## 第 3.1 步：音频

目标：根据已批准的脚本生成旁白、词语时间点、音乐和音频元数据。

在第 3 步批准后启动音频生成。在后台运行，然后继续第 4 步。（登录状态已在第 0 步显示；引擎会自动回退。）

**调用前，根据用户的请求选择旁白声音。**如果请求指定了声音、性别或语调，请选择匹配的声音 id，并通过 `--voice <id>` 传入。否则，流水线默认使用 HeyGen 上的 **Marcia（女声）** / Kokoro 上的 `am_michael`——因此，诸如“男声”这样的请求会被静默忽略，除非你传入该标志。声音 id 因提供商而异；请根据第 0 步登录状态所选择的提供商进行解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表（前缀 `am_`/`bm_` 为男声，`af_`/`bf_` 为女声）。当用户未表达偏好时，先回退到记忆中的声音（简要合同 § 2），再使用流水线默认值，并说明你使用了哪一个；仅当两者均未指定时才省略 `--voice`。当用户本次运行明确选择了声音时，记录它（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice <voice-id> &`

音频脚本会处理旁白、词语时间点、从 HeyGen 音乐库查找 BGM，以及时间元数据。BGM 情绪来自故事板的 `music:` 字段。这里使用 HeyGen Audio API 进行检索，而非生成，并且使用与 TTS 相同的 `~/.heygen` 凭据。有关提供商详情，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白且不存在 `SCRIPT.md`，则跳过语音生成。如果故事板具有音乐情绪，BGM 仍可运行。

**规范的完全静音标记**（在复用此音频模型的各工作流之间共享）：在 STORYBOARD.md 顶部 YAML 块中设置 `music: none` **并且**没有 `SCRIPT.md`。该组合会将项目标记为静音——无旁白、无 BGM、无 SFX。`audio.mjs` 会识别它且不生成任何内容（它会移除任何过期的 `audio_meta.json`；`assemble` 将不存在 `audio_meta.json` 视为静音），因此此步骤可直接跳过。带有旁白时，`music: none` 会保留 TTS，并且仅关闭 BGM。请严格使用此拼写——不要自行使用其他标记。

**关卡：** 音频任务已启动，或者项目已标记为静音（`music: none` + 无 `SCRIPT.md`）。

---

## 步骤 4：画面视觉设计

目标：为每个故事板帧添加视觉方向、布局意图和运动选择。

**先绘制故事板草图（仅限协作模式）。** 计划一经批准，立即运行草图流程——`../hyperframes-core/references/review-loop.md` § 2（不要等待步骤 3.1；草图不使用时间点）：亲自为每个帧绘制线框图，将每个帧标记为 `built`，当故事板完整时暂停以提出那个布局问题，并且仅修改被点名的草图，直到故事板获得确认。只有这样，才能将下方的视觉设计写入已确认的布局中。在自主模式下，或者当用户在步骤 3 选择跳过草图时，跳过此流程——帧会在步骤 5 中直接从 `outline` 进入 `animated`。

就地编辑 `STORYBOARD.md`。不要创建另一个故事板。使用 `frame.md` 作为颜色、字体、布局感受和风格的事实依据。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 获取方法（带时间码的镜头序列、内联 Layout 词汇，以及虚构视觉内容处理方式），以及必需的 `## Video direction` 块。使用 `../hyperframes-animation/blueprints-index.md` 为每个帧选择镜头形态。运动方面，使用 `motion-language.md`（运动词汇 + 运动准则）和 `../hyperframes-animation/rules-index.md`（有效规则名称）——不要编造运动名称。

对于每个帧，按照 `visual-design.md` 的方法，将一个**带时间码的镜头序列**写入 `STORYBOARD.md`：选择该帧的蓝图（或自行组合），使用此帧的**虚构**内容将其具象化，并根据旁白节奏安排每个 Scene 的揭示过程，使帧在完整时长内逐步展开，而非一开始就堆满内容然后静止。由于该讲解视频不展示人物，`focal`/`roles` 应命名**虚构的视觉元素**（一个主角词语、一个图表节点、一个数据可视化序列）——你是在设计它们，而不是选择已捕获的素材。针对每个 Scene **内联**说明布局和运动（词汇见 `visual-design.md` 和 `motion-language.md`）。添加一个覆盖全视频的 `## Video direction` 块。

不要更改故事、脚本、`transition_in` 或源文本。此步骤中不要编写 HTML。**没有素材暂存步骤**——无脸视觉元素由第 5 步中的工作者构建。如果用户提供了真实的 `public/<basename>` 图像，请在相关帧的 `focal`/`roles` 中通过路径引用它；否则无需暂存任何内容。

**门槛：**每一帧都具有与画外音节奏同步的、带时间编码的镜头序列（不得前置揭示）；每一帧都要命名其虚构的 `focal` 和/或 `roles`；必须存在 `## Video direction`。协作：草图板已经确认。

---

## 第 5 步：构建帧

目标：将每个故事板帧构建为 HTML 合成，并组装可播放的视频。

如果已启动音频，请等待第 3.1 步音频完成。然后同步时长并获取 SFX；如果静音，则跳过这两项。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械化的：以真实画外音时长为准；静音帧保留估算值；绝不要手动编辑已同步的时长。

在分派之前，阅读 `../hyperframes-core/references/subagent-dispatch.md`。构建逐帧数据包和工作者角色载荷：

`node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

构建器会在 `.hyperframes/frame-packets/` 下为每一帧写入一个有边界的数据包（该帧的完整故事板块 + 蓝图正文 + 每个被引用的规则配方，均已内联），以及 `_role.md`（`../hyperframes-core/references/frame-worker-core.md` + 此技能的 `sub-agents/frame-worker.md`，逐字拼接——完整的工作者角色）。每帧分派一个子代理；如有可能则并行，否则分批运行工作者。每个工作者恰好处理一帧：其提示词携带 `_role.md` 和该帧的数据包——完整粘贴两者，或交给工作者先读取这两个文件路径（效果等同；无论哪种方式，工作者都恰好从这两份文档开始）——另加一个分派上下文，其中包含 `PROJECT_DIR`、`frame_id`、该帧在磁盘上是否有**已确认的草图**（工作者应装饰该布局而非重新绘制——frame-worker core § 当存在已确认的草图时）、画布尺寸，以及启用字幕时的字幕状态和避让区域。

工作者只读取其数据包和 `frame.md`；绝不打开 `STORYBOARD.md` 或技能文档（数据包已内联上游选中的内容）。每个工作者仅写入 `compositions/frames/NN-*.html`。工作者绝不能编辑 `STORYBOARD.md`。

**全画幅背景必须位于 `class="clip"` 层，绝不能放在 `#root` 上。**一帧的底层（色块 / 渐变 / 网格）应作为独立的、全时长的背景 clip——在 `#root` / `data-composition-id` 元素上设置的 `background` 会被限制在该帧的时间窗口内，并不是可靠的底层，因此深色内容可能会落在黑色宿主 `body` 上并渲染为不可见。视频的基础底色由组装器根据 `frame.md` 的 `canvas` 颜色绘制到索引 `#root` 上。（完整规则 + 自检：`../hyperframes-core/references/frame-worker-core.md`。）

随着每个工作器返回，编排器会在 `STORYBOARD.md` 中将该帧标记为 `animated`。

音频时序生成后，在后台构建字幕并组装索引：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在第 2 步中复制）作为字幕样式，并从 `frame.md` 注入品牌 token；如果没有皮肤文件，则渲染内置默认胶囊样式。`captions: skipped (<reason>)` 是有效状态。明确跳过字幕时，继续执行。

**关卡：**每一帧均标记为 `animated`（协作模式：草图板已在第 4 步确认），`index.html` 存在，并且字幕已构建或被明确跳过。

---

## 第 6 步：收尾

目标：验证已组装的视频，获得用户批准，并渲染最终 MP4。

注入转场，运行检查，暂停以供审阅，然后渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints>`

`snapshot` 会将捕获的帧拼接为一张联系表（`snapshots/contact-sheet.jpg`）。快速查看；如果没有明显损坏，就继续——不要在这里停留太久。

如果命令失败，显示 stderr 并停止——不要堆叠恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

**已知误报——不要处理。** `check` 可能会在**字幕**高亮词（选择器 `#caption-word-*` / `.caption-line`）上报告少量约 ~1–4px 的 `text_box_overflow` 发现。字幕胶囊使用了刻意紧凑的 `line-height`（在 `scripts/captions.mjs` 中一次性设置），且**没有 `overflow:hidden`**，因此粗重的展示字体字形墨迹会溢出几 px 到胶囊自身的内边距中——实际上没有任何内容被裁剪。将这些视为预期结果并继续。**不要**增大字幕的 `line-height`（这会使胶囊膨胀，更糟）。仅当 `text_box_overflow` 指向**帧**元素（`#el-NN-*`）而非字幕单词时才采取行动。

检查通过后，暂停以供用户审阅——审阅循环的最终外观（`../hyperframes-core/references/review-loop.md` § 4）：在自第 3 步起一直打开的 Studio 中提出一个问题——现在渲染，还是需要哪些更改？（自主模式：唯一保留的问题，先预览还是渲染。）然后交付 MP4、联系表和帧 id，以便修订可以定位到单个帧。

预览：`npx hyperframes preview --background`

仅在用户批准后渲染（自主模式：在“预览还是渲染”的问题之后）：

`npx hyperframes render --skill=faceless-explainer --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户提出要求。

**关卡：** 在渲染前，`lint` 和 `check` 已通过，且已检查快照；用户在审查暂停时已批准（自主模式：检查已通过，且交付物包含联系表）；`renders/video.mp4` 存在。最终回复需说明 MP4 路径和最终时长。

---

## 快速参考

**格式：** 横向 `1920x1080`；纵向 `1080x1920`；方形 `1080x1080` —— 根据目标平台派生（简报合同 § 2）。在分镜头脚本 frontmatter 中仅设置一次格式。

**与捕获资产工作流相比的无真人出镜差异：** 没有第 1 步捕获（合成的 `tokens.json` + `visible-text.txt`）；没有 `asset-descriptions.md` 和 `capture/assets/`；第 4 步中没有资产暂存；`asset_candidates` 默认为空；每个视觉元素均由第 5 步工作者创建（排版 / 抽象图形 / 图表 / 数据可视化）。用户提供的 `public/<basename>` 图像是唯一的真实资产路径。

**后台脚本：** 该工作流仅在 `scripts/` 下提供以下脚本：用于采用并按品牌重新混合帧预设至 `frame.md`（+ 字幕皮肤）的 `build-frame`；用于 TTS、转录、BGM、SFX 和时长同步的 `audio`；`captions`；用于注入和验证的 `transitions`；以及 `assemble-index`。其他所有操作均通过 `hyperframes` CLI 完成。

可复用、与领域无关的镜头形态位于 `../hyperframes-animation/blueprints/`（由 `../hyperframes-animation/blueprints-index.md` 索引）。

| 阅读                                                                                                                                                        | 时机                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 关卡类型、从 `BRIEF.md` 派生模式、字段语义。                                   |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 第 3 步：故事原则 —— 钩子语言、价值先于证据、提案形态。                        |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)`                                                                          | 第 2 步：选择并采用帧预设。                                                    |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)`                                                    | 第 2 步：正确应用品牌 token。                                                  |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 第 3 步：规划讲解视频故事。                                                    |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 第 3 步：角色→蓝图菜单。第 4 步：选择镜头形态。                                |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 第 3 步：编写 `STORYBOARD.md`。                                                |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 第 3 步：编写 `SCRIPT.md`。                                                    |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 第 3.1 步：选择或了解 TTS 提供商和语音。                                       |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 第 4 步：编写帧的镜头序列（+ 布局词汇）。                                      |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 第 4 步：运动词汇 + 运动原则。                                                 |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 第 4-5 步：剪辑目录（工作者构建帧内接缝）。                                    |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 第 5 步：所引用运动的本地规则配方正文。                                        |
| `[../hyperframes-core/references/frame-worker-core.md](../hyperframes-core/references/frame-worker-core.md)`                                                | 第 5 步：共享工作者合同（数据包构建器会将其前置于增量内容）。                  |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 第 5 步：工作流的帧工作者增量。                                                |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 第 5 步：安全地调度子代理。                                                    |