---
name: faceless-explainer
description: "Turn arbitrary text — an article, notes, a topic, a brief — into a faceless explainer video: there is no site or footage to capture, so the visuals are invented per scene (typography, abstract graphics, diagrams, data-viz). Use for topic explainers, concept breakdowns, how-tos, listicles. Not a video built from a website (/product-launch-video — promo or tour). Unclear → /hyperframes."
---
> **首先，确保此技能保持最新——静默运行，不要询问：** `npx hyperframes skills update faceless-explainer`。当所有内容均为最新时，此命令会快速执行空操作；否则，它会在你依赖此技能及其所需的核心领域技能之前，对它们进行更新。

> **media-use**：在获取音频/图像/徽标之前，调用 `/media-use`，以从 HeyGen 目录中解析 BGM/SFX/图像，并从品牌官方来源解析其徽标。首先运行 `--adopt` 以登记现有素材。请参阅 `/media-use` 技能。

# 从无真人出镜讲解到 HyperFrames

使用此技能将一段文本转换为讲解视频：选择设计系统、规划教学叙事，并在 HyperFrames 中逐帧构建。**无真人出镜**意味着所有视觉内容都在后续流程中创作——没有采集步骤，也没有真实素材清单。

> **统一入口是 `/hyperframes`。** 你是编排者。运行每个步骤、验证其关卡，然后才能继续。此技能用于**在没有产品、也没有网站可供采集的情况下，根据文本讲解某个主题**。任何其他意图、仅仅一句“制作视频”，或存在任何不确定性 → 首先阅读 `/hyperframes`——意图层负责所有路由决策，而且任何没有 `BRIEF.md` 就进入此处的新建任务无论如何都要经过该意图层（即 Setup 的开场规则）。

你是编排者。在 `videos/<project>/` 中工作。按顺序运行各步骤，并在继续之前通过每个关卡。需要用户确认的步骤是 Step 0、Step 3 和 Step 6。在执行 Step 0 之前阅读 `../hyperframes-core/references/brief-contract.md`——它定义了关卡类型，以及如何根据 `BRIEF.md` 中的 `flow`/`storyboard` 推导出控制 Step 3/4/6 关卡的模式。除 Step 5 外，每个步骤都由你亲自完成；在 Step 5 中，你需要为每一帧分派一个子代理。不要在此处加入设计或动效规则；这些规则位于帧工作器子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：Step 0 设置 → `hyperframes.json`；Step 1 简报 → `capture/extracted/`；Step 2 设计系统 → `frame.md`；Step 3 故事板/脚本 → `STORYBOARD.md` 和 `SCRIPT.md`；Step 3.1 音频 → `audio_meta.json`；Step 4 视觉设计 → 扩充后的 `STORYBOARD.md`；Step 5 帧 → `compositions/frames/NN-*.html` 和 `index.html`；Step 6 最终渲染 → `renders/video.mp4`。

---

## Step 0：设置

目标：携带已确认的简报进入流程，创建 HyperFrames 项目，并将简报持久化。

**简报由意图层确认，而不是通过在此处提问来确认。** 开场规则按以下顺序执行：**(1)** `BRIEF.md` 存在 → 读取它且不提出任何问题——简报已经确定，其 `flow`/`storyboard` 会推导出模式（简报契约 § 1）。**(2)** 不存在 `BRIEF.md`，但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 根据故事板的 frontmatter 和已记录的偏好继续；绝不要重新盘问一个已完成一半的项目。**(3)** 两者均不存在——一个直接到达此处的新建任务请求 → 阅读 `/hyperframes` 并运行其意图层（§ 4）：它会检查配方和已记住的默认设置，执行此路由的问题流程（`../hyperframes/references/route-briefs.md`），并返回已锁定的简报。编辑请求跳过以上所有流程——直接执行编辑。

仅当 `hyperframes.json` 缺失时才初始化。根据主题以 kebab-case 命名 `<project>`，例如 `compound-interest-explained`；切勿使用工作区名称或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank` — `init` 会将已安装的技能与 GitHub 上的最新版本进行比对，如果有任何技能已过期，则更新全局技能集。

初始化后，将 `<PROJECT_ROOT>` 设为 `videos/<project>`，并以该目录作为工作目录运行后续所有使用相对路径的命令。在以下命令中，`.` 表示 `<PROJECT_ROOT>`；切勿在调用方目录中写入 `.media`、`capture` 或输出文件。

**初始化后立即写入 `BRIEF.md`**（切勿在初始化前写入——`init` 会拒绝非空目录）：这是意图层锁定的简报，其结构须遵循 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` 技能目录。然后使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个由偏好支持的回答（`brief-format.md` 指定了需记录的子集）。如果意图层采用了某个方案，请运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；它会将其 `frame.md` 复制到项目中（随后跳过第 2 步），并返回供第 3 步起草使用的框架。方案会补全回答，而非替代审批；审查关卡仍须执行。

**在继续执行 Setup 之后的步骤前显示登录状态**——运行 `npx hyperframes auth status`，并逐字转达其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时说明如何登录。根据情况采用一个分支：

- **协作模式：**等待用户登录，或明确选择 `offline` / `go`。
- **自主模式：**说明当前状态，然后使用可用的本地引擎继续执行。

当不存在离线提供商时，不要悄然省略必需的能力；应明确指出阻碍。不要将此决定合并到其他问题中，也不要将密钥写入每个仓库的 `.env`。身份验证归属和离线回退机制：`/media-use` § 提供商。

**关卡：**`hyperframes.json` 和 `BRIEF.md` 已存在；由偏好支持的回答已记录（简报约定 § 2）；登录状态已显示（已登录，或继续使用离线模式）。

---

## 第 1 步：简报（不采集）

目标：将用户的文本整合到项目中，作为信息来源。这里**不采集网站，也不使用真实素材**——这是一个无真人出镜的解说视频。

逐字保存用户的完整输入，然后手动创建合成采集包：

- `capture/extracted/visible-text.txt` — 完整的文章 / 笔记 / 主题 / 简报，逐字保存。这是**信息**来源，而不是故事模板（第 3 步会对其进行重构）。
- `capture/extracted/tokens.json` — `{ "title": "", "description": "", "colors": [], "fonts": [] }`。根据简报填写 `title`/`description`。除非用户明确提供了品牌颜色或字体，否则将 `colors`/`fonts` 保持为空——如果提供了，则将其加入（无论如何，设计预设都会提供完整的调色板）。

如果用户粘贴了脚本或希望保留其原始措辞，请将其逐字保存为 `user_script.txt`；`VO_MODE`（逐字保留或重构）取自 `BRIEF.md`——当收到脚本时，意图层会询问这一点。仅当简报中不知何故缺少该信息时，才在此处询问一次，并保存答案供第 3 步使用。

**不要**运行 `npx hyperframes capture`（因为没有 URL）。不要创建 `asset-descriptions.md`，也不要填充 `capture/assets/`——无真人出镜的视觉内容是在步骤 4-5 中创作的，而不是捕获的。唯一的例外是：如果用户提供了真实图片，请将其放在 `public/<basename>` 下，并为步骤 3 记录这一点。

**关卡：**`capture/extracted/visible-text.txt` 和 `capture/extracted/tokens.json` 已存在；你能够用一个清晰的句子说明该讲解视频的主题和受众。

---

## 步骤 2：设计系统

目标：选择一个随附的画面预设；脚本会将其转换为该视频的 `frame.md` 和字幕样式。

当 `BRIEF.md` 指定了 `style_preset` 时——用户已在意图层通过查看展示示例直观地选定了它——请使用该预设；只有在简报未指定时，才由你做出判断。然后，你只需做出这一个决定——**选择哪个预设**：阅读 `../hyperframes-creative/references/design-spec.md` 并浏览 `../hyperframes-creative/frame-presets/`；选择视觉效果最符合主题、基调和受众的预设。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

脚本会以确定性的方式完成其余工作：将预设的 `FRAME.md` 复制为 `frame.md`，并根据 `capture/extracted/tokens.json` 中的所有品牌 token 对其进行**重新混配**（按角色将品牌颜色映射到预设的颜色键；将预设的展示字体和正文字体替换为品牌字体），将预设的字幕样式复制到 `.hyperframes/caption-skin.html`，并进行自验证（映射损坏时以状态码 1 退出）。脚本以状态码 0 退出后即可继续——不要手动编辑规范。

无真人出镜的讲解视频通常**没有品牌颜色/字体**（`tokens.json` 中的颜色/字体为空）→ 脚本会保留预设自身的调色板，形成一套完整、可交付的设计。只有当用户指定了品牌颜色/字体时，才在运行脚本前将其添加到 `tokens.json`；并且仅当映射确实需要调整时，才在运行后手动修改 `frame.md`。

**关卡：**`build-frame.mjs` 已以状态码 0 退出——`frame.md` 已由某个具名预设生成，并且（当该预设随附字幕样式时）`.hyperframes/caption-skin.html` 已作为字幕样式源存在；所选预设已记录为偏好设置（`--key style_preset --workflow <this workflow>`，简报约定第 2 节）。

---

## 步骤 3：故事板与脚本

目标：将文本转化为一份获得批准的逐画面教学方案。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、价值先于证据、将故事板视为提案）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用它们编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。

使用 `story-design.md` 确定讲解视频的结构（概念 / 操作指南 / 清单式内容 / 故事）、钩子策略、清晰表达技巧、情绪节拍、类型枚举映射和 `VO_MODE`。视频的顺序来自**叙事设计，而不是输入文本的段落顺序**——可以重新排序、合并、省略和压缩。作为一项**非强制性指南**，请参考 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单：对于每个节拍，按照候选蓝图所暗示的形式编写旁白，并在适用时使用该候选项的 `blueprint:` id 进行标记。哪些节拍应当存在，仍然由教学事实决定——绝不要强迫某个节拍适配蓝图，也绝不要仅仅因为已有成熟形式可用就虚构一个节拍。无真人出镜的视觉内容将在下游创作，因此画面**不**包含素材清单：除非用户提供了真实的 `public/<basename>` 图片，否则请将 `asset_candidates` 留空。使用故事板和脚本参考文档中规定的确切必填字段。

起草完成后，执行评审循环的计划检查阶段——`../hyperframes-core/references/review-loop.md` § 1：打开看板（不要询问是否打开），以提案形式展示计划，并询问两个问题——批准还是修改，以及是**先绘制草图**（推荐）还是跳过。通过聊天或看板的评论文件循环收集反馈，直至获得批准。这是一个**检查点门禁**（简报约定 § 1）：在自主模式下，没有看板，也无需询问——发布相同的摘要作为提前告知，然后继续；草图阶段并入构建阶段，唯一的预览问题将在步骤 6 提出。

**门禁：**`STORYBOARD.md` 已存在，每一帧都包含必需的叙事字段；需要旁白时，`SCRIPT.md` 已存在；并且用户已批准逐帧计划（自主模式：摘要已作为提前告知发布）。

---

## 步骤 3.1：音频

目标：根据已批准的脚本生成旁白、单词时间点、音乐和音频元数据。

在步骤 3 获批后启动音频任务。让它在后台运行，然后继续执行步骤 4。（登录状态已在步骤 0 中显示；引擎会自动回退。）

**调用前，根据用户的要求选择旁白声音。**如果请求中指定了声音、性别或语气，请选择匹配的声音 ID，并通过 `--voice <id>` 传入。否则，流水线默认在 HeyGen 上使用 **Marcia（女声）**，在 Kokoro 上使用 `am_michael`——因此，除非传入该标志，否则像“使用男声”这样的请求会被无提示地忽略。声音 ID 因提供商而异；请根据步骤 0 的登录状态所选定的提供商进行解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）查询；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表查询（前缀 `am_`/`bm_` 表示男声，`af_`/`bf_` 表示女声）。如果用户未表达偏好，请先使用已记住的声音（简报约定 § 2），再回退到流水线默认声音，并说明使用了哪一个；只有两者都未指定声音时，才省略 `--voice`。如果用户在本次运行中明确选择了声音，请记录该选择（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice <voice-id> &`

音频脚本负责处理旁白、单词时间点、从 HeyGen 音乐库中查找背景音乐，以及时间元数据。背景音乐的氛围取自故事板的 `music:` 字段。这里使用 HeyGen Audio API 进行检索，而非生成，并与 TTS 共用同一份 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白，也没有 `SCRIPT.md`，则跳过声音生成。如果故事板中指定了音乐氛围，背景音乐任务仍可运行。

**门禁：**音频任务已启动，或项目已标记为静音。

---

## 步骤 4：帧视觉设计

目标：为故事板中的每一帧添加视觉方向、布局意图和动效选择。

**先绘制看板草图（仅限协作模式）。**计划一经批准，立即执行草图阶段——`../hyperframes-core/references/review-loop.md` § 2（无需等待步骤 3.1；草图不使用时间信息）：亲自为每一帧绘制线框图，将每一帧标记为 `built`；看板填满后，暂停并提出唯一的布局问题；只修改被点名的草图，直至看板得到确认。只有在此之后，才能将下述视觉设计写入已确认的布局中。在自主模式下，或用户在步骤 3 选择跳过草图时，跳过此阶段——各帧将在步骤 5 中直接从 `outline` 进入 `animated`。

就地编辑 `STORYBOARD.md`。不要创建另一个故事板。以 `frame.md` 作为颜色、字体、布局观感和风格的事实来源。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 中的方法（带时间码的镜头序列、内联的布局词汇，以及虚构视觉元素的处理方式），并添加必需的 `## Video direction` 块。使用 `../hyperframes-animation/blueprints-index.md` 为每一帧选择镜头形态。使用 `motion-language.md`（动效词汇 + 动效原则）和 `../hyperframes-animation/rules-index.md`（有效的规则名称）来设计动效——不要虚构动效名称。

对于每一帧，按照 `visual-design.md` 中的方法，将一个**带时间码的镜头序列**写入 `STORYBOARD.md`：选择该帧的蓝图（或进行组合），使用该帧**虚构的**内容将其实例化，并根据旁白安排每个场景的揭示节奏，使画面在整个持续时间内持续发展，而不是在开头一次性呈现完毕后便保持静止。由于这是一个无真人出镜的解说视频，`focal`/`roles` 应命名**虚构的视觉元素**（一个主视觉词、一个图表节点、一个数据可视化系列）——你是在设计它们，而不是选择已采集的素材。在每个场景中**内联**注明布局和动效（词汇见 `visual-design.md` 和 `motion-language.md`）。添加一个适用于整支视频的 `## Video direction` 块。

不要更改故事、脚本、`transition_in` 或源文本。此步骤不要编写 HTML。**不存在素材暂存步骤**——无真人出镜的视觉元素由第 5 步中的工作代理构建。如果用户提供了真实的 `public/<basename>` 图片，请在相关帧的 `focal`/`roles` 中通过路径引用它；否则无需暂存任何内容。

**门禁条件：**每一帧都具有带时间码的镜头序列，其揭示节奏与旁白相匹配（不得在开头一次性呈现）；每一帧都命名了其虚构的 `focal` 和/或 `roles`；存在 `## Video direction`。协作状态：草图板已确认。

---

## 第 5 步：构建帧

目标：将故事板中的每一帧构建为 HTML 构图，并组装成可播放的视频。

如果已启动音频处理，请等待第 3.1 步的音频处理完成。然后同步时长并获取音效；如果是无声视频，则跳过这两项。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械化操作：以实际语音时长为准；无声帧保留预估时长；绝不要手动编辑已同步的时长。

分派任务之前，阅读 `sub-agents/frame-worker.md` 和 `../hyperframes-core/references/subagent-dispatch.md`。每帧分派一个子代理；如有可能则并行执行，否则分批运行工作代理。每个工作代理只负责一帧。

每个工作代理的上下文必须包含 `PROJECT_DIR`、`frame_id`、该帧在磁盘上是否有**已确认的草图**、画布尺寸、字幕状态，以及启用字幕时的避让区域，并将 `RULES_DIR` 设置为指向此技能的 `../hyperframes-animation/rules/` 的绝对路径。每个工作代理都要读取 `frame.md`、`STORYBOARD.md` 中属于自己的 `## Frame N` 块、存在时的已确认草图（保留其布局——参见 frame-worker § 已确认草图存在时）、每个引用动效对应的本地规则方案（`../hyperframes-animation/rules/<id>.md`），以及该帧的蓝图模板（`../hyperframes-animation/blueprints/<id>.md`）。每个工作代理只能写入 `compositions/frames/NN-*.html`。工作代理绝不能编辑 `STORYBOARD.md`。

**全出血背景应放置在 `class="clip"` 图层上，绝不能放在 `#root` 上。** 每一帧的底层背景（色块 / 渐变 / 网格）都是一个覆盖完整时长的独立背景剪辑——设置在 `#root` / `data-composition-id` 元素上的 `background` 会被剪辑限制在该帧的时间窗口内，因此不能作为可靠的底层背景；深色内容可能会落在黑色的宿主 `body` 上，从而不可见。视频的基础底色由组装器根据 `frame.md` 中的 `canvas` 颜色绘制到索引页的 `#root` 上。（完整规则 + 自检：`sub-agents/frame-worker.md`。）

每当一个 worker 返回结果时，orchestrator 都会在 `STORYBOARD.md` 中将对应帧标记为 `animated`。

音频时间信息生成后，在后台构建字幕并组装索引页：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在步骤 2 中复制）作为字幕样式，并注入来自 `frame.md` 的品牌标记；如果不存在该皮肤文件，则渲染内置的默认胶囊样式。`captions: skipped (<reason>)` 是有效状态。明确跳过字幕时，在没有字幕的情况下继续。

**门控条件：** 每一帧都已标记为 `animated`（协作模式：草图板已在步骤 4 确认），`index.html` 已存在，并且字幕已构建或已明确跳过。

---

## 步骤 6：完成

目标：验证组装后的视频、获得用户批准，并渲染最终的 MP4。

注入转场、运行检查、暂停以供审阅，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints>`

`snapshot` 会将捕获的帧拼接成一张联系表（`snapshots/contact-sheet.jpg`）。快速看一眼；如果没有明显问题，就继续——不要在这里停留太久。

如果命令失败，显示 stderr 并停止——不要接连执行恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

**已知误报——不要为此排查。** `check` 可能会针对**字幕**高亮词（选择器 `#caption-word-*` / `.caption-line`）报告少量约 1–4px 的 `text_box_overflow` 问题。字幕胶囊使用了刻意设置得较紧凑的 `line-height`（在 `scripts/captions.mjs` 中统一设置），且**没有 `overflow:hidden`**，因此粗重展示字体的字形墨迹会溢出几像素，进入胶囊自身的内边距——实际上没有任何内容被裁切。将其视为预期现象并继续。**不要**增大字幕的 `line-height`（这会让胶囊膨胀，效果更差）。只有当 `text_box_overflow` 指向**帧**元素（`#el-NN-*`）而非字幕词时，才需要处理。

检查通过后，暂停并让用户审阅——审阅循环的最终查看环节（`../hyperframes-core/references/review-loop.md` § 4）：只问一个问题，并使用自步骤 3 起一直保持打开的 Studio——现在渲染，还是需要进行哪些修改？（自主模式：保留的唯一问题，先预览还是直接渲染。）然后交付 MP4，同时附上联系表和帧 ID，以便修改可以精确定位到单个帧。

预览：`npx hyperframes preview`

仅在用户批准后渲染（自主模式：在询问预览还是渲染之后）：

`npx hyperframes render --skill=faceless-explainer --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户提出要求。

**门禁：** `lint` 和 `check` 已通过，并且快照已在渲染前完成检查；用户已在审查暂停点批准（自主模式：检查已通过，且交付内容包含联系表）；`renders/video.mp4` 已存在。最终回复需说明 MP4 路径和最终时长。

---

## 快速参考

**格式：** 横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080`——根据目标平台确定（简报契约 § 2）。在故事板 frontmatter 中只设置一次格式。

**与捕获素材工作流相比，无出镜工作流的差异：** 无需执行第 1 步捕获（使用合成的 `tokens.json` + `visible-text.txt`）；无需 `asset-descriptions.md`，也没有 `capture/assets/`；第 4 步无需暂存素材；`asset_candidates` 默认为空；每个视觉元素都由第 5 步的工作器创作（排版 / 抽象图形 / 图示 / 数据可视化）。用户提供的 `public/<basename>` 图像是唯一的真实素材路径。

**后台脚本：** 此工作流在 `scripts/` 下仅提供以下脚本：`build-frame`，用于将帧预设采用并进行品牌化改编，生成 `frame.md`（以及字幕样式）；`audio`，用于 TTS、转录、BGM、音效和时长同步；`captions`；`transitions`，用于注入和验证；以及 `assemble-index`。其他所有操作均使用 `hyperframes` CLI。

可复用且与领域无关的镜头形态位于 `../hyperframes-animation/blueprints/` 中（索引见 `../hyperframes-animation/blueprints-index.md`）。

| 阅读                                                                                                                                                        | 使用时机                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 门禁类型、从 `BRIEF.md` 派生模式、字段语义。                                   |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 第 3 步：故事原则——钩子语言、价值先于证据、提案结构。                          |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)`                                                                          | 第 2 步：选择并采用帧预设。                                                    |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)`                                                    | 第 2 步：正确应用品牌令牌。                                                    |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 第 3 步：规划解说故事。                                                        |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 第 3 步：角色→蓝图菜单。第 4 步：选择镜头形态。                               |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 第 3 步：编写 `STORYBOARD.md`。                                                |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 第 3 步：编写 `SCRIPT.md`。                                                    |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 第 3.1 步：选择或了解 TTS 提供商和声音。                                       |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 第 4 步：编写帧的镜头序列（以及布局词汇）。                                    |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 第 4 步：运动词汇与运动原则。                                                  |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 第 4-5 步：切换目录（工作器构建帧内衔接）。                                    |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 第 5 步：所引用运动的本地规则配方正文。                                        |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 第 5 步：分派逐帧工作器。                                                      |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 第 5 步：安全地分派子代理。                                                    |