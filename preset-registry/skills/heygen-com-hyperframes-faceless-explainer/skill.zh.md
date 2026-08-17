---
name: faceless-explainer
description: "Turn arbitrary text — an article, notes, a topic, a brief — into a faceless explainer video: there is no site or footage to capture, so the visuals are invented per scene (typography, abstract graphics, diagrams, data-viz). Use for topic explainers, concept breakdowns, how-tos, listicles. Not a video built from a website (/product-launch-video — promo or tour). Unclear → /hyperframes."
---
> **首先，确保此技能保持最新——静默运行，不要询问：** `npx hyperframes skills update faceless-explainer`。如果所有内容均为最新，此命令会快速执行且不做任何更改；否则，它会在你依赖此技能及其核心领域依赖技能之前对它们进行更新。

> **media-use**：在获取音频/图像/徽标之前，调用 `/media-use`，从 HeyGen 目录中解析 BGM/SFX/图像，并从品牌官方来源解析其徽标。先运行 `--adopt` 以注册现有素材。请参阅 `/media-use` 技能。

# 从无真人出镜讲解内容到 HyperFrames

使用此技能可将一段文本制作成讲解视频：选择设计系统、规划教学叙事，并在 HyperFrames 中逐帧构建。**无真人出镜**意味着所有视觉内容都将在后续流程中创作——没有采集步骤，也没有真实素材清单。

> **统一入口是 `/hyperframes`。** 你是编排器。运行每个步骤，验证其关卡，之后才能继续。此技能用于**根据文本讲解某个主题，不涉及需要采集的产品或网站**。任何其他意图、仅仅一句“制作视频”的请求，或存在任何不确定性 → 先阅读 `/hyperframes`——意图层负责所有路由决策，而且，如果一个没有 `BRIEF.md` 的全新创作请求到达这里，无论如何都会经过该流程（即设置步骤的开场规则）。

你是编排器。在 `videos/<project>/` 中工作。按顺序运行各步骤，并通过每个关卡后再继续。需要用户确认的步骤是步骤 0、步骤 3 和步骤 6。在步骤 0 之前阅读 `../hyperframes-core/references/brief-contract.md`——它定义了关卡类型，以及如何根据 `BRIEF.md` 中的 `flow`/`storyboard` 推导出控制步骤 3/4/6 关卡的模式。除步骤 5 外，所有步骤都由你亲自完成；在步骤 5 中，你需要为每一帧分派一个子代理。不要在此处写入设计或动效规则；这些规则位于帧工作器子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：步骤 0 设置 → `hyperframes.json`；步骤 1 简报 → `capture/extracted/`；步骤 2 设计系统 → `frame.md`；步骤 3 故事板/脚本 → `STORYBOARD.md` 和 `SCRIPT.md`；步骤 3.1 音频 → `audio_meta.json`；步骤 4 视觉设计 → 扩充后的 `STORYBOARD.md`；步骤 5 帧 → `compositions/frames/NN-*.html` 和 `index.html`；步骤 6 最终渲染 → `renders/video.mp4`。

---

## 步骤 0：设置

目标：带着已确认的简报进入流程，创建 HyperFrames 项目，并将简报持久化。

**简报由意图层确认，而不是通过在此处提问来确认。** 开场规则，按以下顺序执行：**(1)** `BRIEF.md` 存在 → 读取它，不要提出任何问题——简报已经确定，其 `flow`/`storyboard` 会推导出相应模式（简报契约第 1 节）。**(2)** 不存在 `BRIEF.md`，但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 根据故事板的 frontmatter 和已记录的偏好恢复流程；绝不要重新盘问一个构建到一半的项目。**(3)** 两者都不存在——一个直接到达此处的全新创作请求 → 阅读 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：它会检查配方和已记住的默认设置，执行此路由的问题流程（`../hyperframes/references/routes/faceless-explainer.md`），并返回已锁定的简报。编辑请求跳过以上所有流程——直接执行编辑。

仅当 `hyperframes.json` 缺失时才初始化。根据主题使用 kebab-case 命名 `<project>`，例如 `compound-interest-explained`；切勿使用工作区名称或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=faceless-explainer` — `init` 会将已安装的技能与 GitHub 上的最新版本进行比对，如果有任何技能已过期，则更新全局技能集。

初始化后，将 `<PROJECT_ROOT>` 设为 `videos/<project>`，并以该目录作为工作目录，运行后续所有使用相对路径的命令。在下方命令中，`.` 表示 `<PROJECT_ROOT>`；切勿在调用方目录中写入 `.media`、`capture` 或输出文件。

**初始化后立即写入 `BRIEF.md`**（切勿在初始化之前写入——`init` 会拒绝非空目录）：这是意图层锁定的简报，其结构遵循 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` 技能目录。然后，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个有偏好依据的答案（`brief-format.md` 指明了对应的子集）。如果意图层采用了某个方案，请运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；该命令会将其 `frame.md` 复制到项目中（随后跳过第 2 步），并返回供第 3 步起草使用的框架。方案会填充答案，但不会代替审批；审查关卡仍须执行。

**在继续完成设置阶段之前显示登录状态** — 运行 `npx hyperframes auth status` 并逐字转达其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时说明如何登录。根据情况采用一个分支：

- **协作模式：**等待用户登录，或明确选择 `offline` / `go`。
- **自主模式：**说明当前状态，并继续使用可用的本地引擎。

当没有离线提供商时，不要悄无声息地省略必需的能力；应明确指出阻塞问题。不要将此决定并入其他问题，也不要将密钥写入每个仓库的 `.env`。身份验证归属和离线回退机制：`/media-use` `references/setup-providers.md` § 提供商。

**关卡：**`hyperframes.json` 和 `BRIEF.md` 均已存在；有偏好依据的答案已记录（简报契约 § 2）；登录状态已显示（已登录，或继续离线运行）。

---

## 第 1 步：简报（不抓取）

目标：将用户的文本纳入项目，作为信息来源。这里**不抓取网站，也不使用真实素材**——这是一个无真人出镜的讲解视频。

逐字保存用户的完整输入，然后手动创建合成抓取包：

- `capture/extracted/visible-text.txt` — 完整的文章 / 笔记 / 主题 / 简报，逐字保存。这是**信息**来源，而非故事模板（第 3 步会重塑其结构）。
- `capture/extracted/tokens.json` — `{ "title": "", "description": "", "colors": [], "fonts": [] }`。根据简报填写 `title`/`description`。除非用户明确提供了品牌颜色或字体，否则将 `colors`/`fonts` 留空——如果提供了，则将其添加进去（无论如何，设计预设都会提供完整的调色板）。

如果用户粘贴了脚本或希望保留其原始措辞，请将其逐字保存为 `user_script.txt`；`VO_MODE`（verbatim 或 restructured）来自 `BRIEF.md`——当收到脚本时，意图层会询问这一点。只有在简报中不知为何缺少该信息时，才在此询问一次，并存储答案供步骤 3 使用。

**不要**运行 `npx hyperframes capture`（因为没有 URL）。不要创建 `asset-descriptions.md`，也不要填充 `capture/assets/`——无真人出镜视觉内容是在步骤 4-5 中构思的，而不是捕获的。唯一的例外是：如果用户提供了真实图像，请将其放在 `public/<basename>` 下，并为步骤 3 记录此事。

**关卡：**`capture/extracted/visible-text.txt` 和 `capture/extracted/tokens.json` 已存在；你能够用一个清晰的句子说明该解说视频的主题和受众。

---

## 步骤 2：设计系统

目标：选择一个随附的画面预设；脚本会将其转换为本视频的 `frame.md` + 字幕皮肤。

当 `BRIEF.md` 指定了 `style_preset` 时——用户已在意图层通过查看展示示例凭视觉效果选定它——请使用该预设；只有当简报未指定时，才由你作出判断。然后你只需作出一个决定——**选择哪个预设**：阅读 `../hyperframes-creative/references/design-spec.md` 并浏览 `../hyperframes-creative/frame-presets/`；选择视觉风格最符合主题、基调和受众的预设。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

脚本会以确定性的方式完成其余工作：将预设的 `FRAME.md` 复制为 `frame.md`，并根据 `capture/extracted/tokens.json` 中的所有品牌令牌对其进行**重新混合**（按角色将品牌颜色映射到预设的颜色键；将预设的展示字体和正文字体替换为品牌字体），将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并执行自我验证（映射损坏时以退出码 1 退出）。脚本以退出码 0 退出后即可继续——无需手动编辑规范。

无真人出镜解说视频通常**没有品牌颜色/字体**（`tokens.json` 中的颜色/字体为空）→ 脚本会保留预设自身的调色板，形成一套完整、可交付的设计。只有当用户指定了品牌颜色/字体时，才应在运行脚本前将它们添加到 `tokens.json`；也只有在映射确实需要调整时，才应在运行后手动调整 `frame.md`。

**关卡：**`build-frame.mjs` 以退出码 0 退出——`frame.md` 已根据某个具名预设生成，并且（当预设随附字幕皮肤时）`.hyperframes/caption-skin.html` 已作为字幕皮肤源存在；所选预设已记录为偏好设置（`--key style_preset --workflow <this workflow>`，简报约定第 2 节）。

---

## 步骤 3：故事板和脚本

目标：将文本转化为已获批准的逐画面教学计划。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、先展示价值再提供证据、将故事板视为提案）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用它们编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。根据简报中的 `length` 设置 frontmatter 的 `duration:`——这是一个粗略预期；组装阶段会报告最终剪辑相对于该预期的落点。

使用 `story-design.md` 来确定解说视频的结构（概念型 / 操作指南型 / 清单型 / 故事型）、钩子策略、清晰度技巧、情绪节拍、类型枚举映射以及 `VO_MODE`。视频的顺序来自**叙事设计，而不是输入文本的段落顺序**——可以重排、合并、省略、压缩。将 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单作为**非强制性指南**：对于每个节拍，按照候选蓝图所暗示的形式撰写旁白，并在适用时标记该候选蓝图的 `blueprint:` id。教学内容的真实性仍然决定应包含哪些节拍——绝不要为了适配蓝图而强行加入某个节拍，也不要仅仅因为存在经过验证的结构就凭空编造节拍。无真人出镜的视觉内容会在下游构思，因此帧中**不**包含素材清单：除非用户提供了真实的 `public/<basename>` 图像，否则将 `asset_candidates` 留空。使用故事板和脚本参考资料中要求的确切字段。

起草完成后，运行评审循环的计划阶段——`../hyperframes-core/references/review-loop.md` § 1：打开看板（不要询问是否需要打开），将计划作为提案展示，并提出两个问题——批准还是修改，以及是**先看草图**（推荐）还是跳过。反馈通过聊天或看板的评论文件循环处理，直至获得批准。这是一个**检查点门禁**（简报约定 § 1）：在自主模式下，没有看板，也没有需要询问的内容——发布相同的摘要作为预告，然后继续；草图并入构建过程，唯一的预览问题在第 6 步提出。

**门禁：** `STORYBOARD.md` 已存在，每一帧都包含必需的叙事字段，需要旁白时 `SCRIPT.md` 已存在，并且用户已批准逐帧计划（自主模式：已将摘要作为预告发布）。

---

## 第 3.1 步：音频

目标：根据已批准的脚本生成旁白、逐词时间信息、音乐和音频元数据。

在第 3 步获得批准后启动音频任务。让它在后台运行，然后继续执行第 4 步。（登录状态已在第 0 步显示；引擎会自动回退。）

**在调用前，根据用户的要求选择旁白声音。** 如果请求中指定了声音、性别或语气，请选择匹配的声音 id，并通过 `--voice <id>` 传入。否则，流水线默认使用 HeyGen 上的 **Marcia（女性）** / Kokoro 上的 `am_michael`——因此，除非传入该标志，否则像“一名男性声音”这样的请求会被静默忽略。声音 id 因提供商而异；应根据第 0 步的登录状态所选择的提供商来解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表（前缀 `am_`/`bm_` 表示男性，`af_`/`bf_` 表示女性）。当用户未表达偏好时，应先回退到记住的声音（简报约定 § 2），然后再使用流水线默认值，并说明使用了哪个声音；仅当两者都未指定声音时才省略 `--voice`。当用户在本次运行中明确选择了声音时，将其记录下来（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice <voice-id> &`

音频脚本负责处理旁白、单词时间点、从 HeyGen 音乐库中查找 BGM，以及生成时间元数据。BGM 的情绪取自故事板的 `music:` 字段。此处使用 HeyGen Audio API 进行检索，而非生成，并与 TTS 使用相同的 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白，也没有 `SCRIPT.md`，则跳过语音生成。如果故事板中指定了音乐情绪，BGM 仍可运行。

**标准的完全静音标记**（由复用此音频模型的各个工作流共享）：STORYBOARD.md 顶部 YAML 块中的 `music: none`，**并且**没有 `SCRIPT.md`。这一组合会将项目标记为静音——没有旁白、没有 BGM、没有 SFX。`audio.mjs` 会识别该标记并且不生成任何内容（它会删除任何过期的 `audio_meta.json`；缺少 `audio_meta.json` 正是 assemble 将其视为静音的依据），因此可以干净地跳过此步骤。存在旁白时使用 `music: none` 会保留 TTS，仅关闭 BGM。请严格使用这一拼写——不要自行创造其他标记。

**门控条件：** 音频作业已启动，或者项目已标记为静音（`music: none` + 没有 `SCRIPT.md`）。

---

## 第 4 步：帧视觉设计

目标：为每个故事板帧添加视觉方向、布局意图和动效选择。

**先绘制故事板草图（仅限协作模式）。** 方案一经批准，立即执行草图阶段——参见 `../hyperframes-core/references/review-loop.md` § 2（不要等待第 3.1 步；草图不使用时间点）：亲自为每一帧绘制线框图，将每一帧标记为 `built`，在故事板填满时暂停并提出唯一一个布局问题，然后仅修改被点名的草图，直到故事板得到确认。只有在这之后，才能将下述视觉设计写入已确认的布局中。在自主模式下，或用户在第 3 步选择跳过草图时，跳过此阶段——帧将在第 5 步直接从 `outline` 进入 `animated`。

直接编辑 `STORYBOARD.md`。不要创建另一个故事板。以 `frame.md` 作为颜色、字体、布局感和风格的事实依据。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 中的方法（带时间码的镜头序列、内联 Layout 词汇和原创视觉元素处理方式），并加入必需的 `## Video direction` 块。使用 `../hyperframes-animation/blueprints-index.md` 为每一帧选择镜头结构。使用 `motion-language.md`（动效词汇 + 动效准则）和 `../hyperframes-animation/rules-index.md`（有效的规则名称）来设计动效——不要自行创造动效名称。

按照 `visual-design.md` 中的方法，为每一帧在 `STORYBOARD.md` 中编写一个**带时间码的镜头序列**：选择该帧的蓝图（或进行组合），使用这一帧的**原创**内容将其实例化，并根据旁白安排每个 Scene 的呈现节奏，使画面在整个持续时间内持续发展，而不是在开头集中呈现后便静止不动。由于该解说视频不出镜，`focal`/`roles` 指的是**原创视觉元素**（一个主视觉词、一处图表节点、一个数据可视化系列）——你是在设计这些元素，而不是选择采集到的素材。为每个 Scene **内联**注明布局和动效（词汇表见 `visual-design.md` 和 `motion-language.md`）。添加一个适用于整段视频的 `## Video direction` 块。

不得更改 story、script、`transition_in` 或源文本。此步骤中不要编写 HTML。这里**没有素材暂存步骤**——无露脸视觉素材由工作器在步骤 5 中构建。如果用户提供了真实的 `public/<basename>` 图像，请在相关帧的 `focal`/`roles` 中通过路径引用；否则无需暂存任何内容。

**门禁条件：**每一帧都有带时间码的镜头序列，其揭示节奏与旁白同步（不得前置堆积）；每一帧都注明其虚构的 `focal` 和/或 `roles`；存在 `## Video direction`。协作模式：草图板已获确认。

---

## 步骤 5：构建帧

目标：将每个故事板帧构建为 HTML 构图，并组装成可播放的视频。

如果已启动音频生成，请等待步骤 3.1 的音频完成。然后同步时长并获取音效；如果是静音视频，则跳过这两项。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械化操作：以实际语音时长为准；静音帧保留估算值；绝不手动编辑已同步的时长。

分派前，请阅读 `../hyperframes-core/references/subagent-dispatch.md`。构建逐帧数据包和工作器角色载荷：

`node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

构建器会在 `.hyperframes/frame-packets/` 下为每一帧写入一个有明确边界的数据包（该帧的完整故事板区块 + 蓝图正文 + 每一条被引用的规则配方，全部内联），并写入 `_role.md`（由 `../hyperframes-core/references/frame-worker-core.md` + 此 Skill 的 `sub-agents/frame-worker.md` 逐字拼接而成——即完整的工作器角色）。每帧分派一个子代理；如有可能则并行执行，否则分批运行工作器。每个工作器只接收一帧：其提示词包含 `_role.md` 和该帧的数据包——可以完整粘贴两者，也可以提供这两个文件的路径，让工作器先行读取（两种方式等效；无论采用哪种方式，工作器都只从这两份文档开始）——此外还需提供分派上下文，其中包括 `PROJECT_DIR`、`frame_id`、该帧在磁盘上是否存在**已确认的草图**（工作器会在该布局上进行视觉装饰，而不是重新绘制——参见 frame-worker core § When a confirmed sketch exists）、画布尺寸，以及在启用字幕时的字幕状态 + 避让区域。

工作器只读取其数据包和 `frame.md`；绝不打开 `STORYBOARD.md` 或 Skill 文档（数据包已内联上游选定的内容）。每个工作器只写入 `compositions/frames/NN-*.html`。工作器绝不能编辑 `STORYBOARD.md`。

**全出血背景必须位于 `class="clip"` 图层上，绝不能放在 `#root` 上。**帧的底层背景（色块 / 渐变 / 网格）应作为独立的全时长背景 clip——设置在 `#root` / `data-composition-id` 元素上的 `background` 会被 clip 限制在该帧的时间窗口内，因此无法作为可靠的底层背景；深色内容可能落在黑色宿主 `body` 上，从而渲染为不可见。视频的基础底色由组装器根据 `frame.md` 中的 `canvas` 颜色绘制到索引页的 `#root` 上。（完整规则 + 自检：`../hyperframes-core/references/frame-worker-core.md`。）

当每个工作器返回结果时，编排器会在 `STORYBOARD.md` 中将对应帧标记为 `animated`。

音频时间信息生成后，在后台构建字幕并组装索引：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在步骤 2 中复制）作为字幕外观，并注入来自 `frame.md` 的品牌令牌；如果不存在皮肤，则渲染内置的默认胶囊样式。`captions: skipped (<reason>)` 是有效状态。当字幕被明确跳过时，继续执行。

**门禁条件：** 每一帧都已标记为 `animated`（协作模式：草图板已在步骤 4 中确认），`index.html` 已存在，并且字幕已构建或已明确跳过。

---

## 步骤 6：完成制作

目标：验证组装后的视频、获得用户批准，并渲染最终的 MP4。

注入转场、运行检查、暂停以供审阅，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints>`

`snapshot` 会将捕获的帧拼接成一张联系表（`snapshots/contact-sheet.jpg`）。快速查看一下；如果没有明显异常，就继续——不要在此耗费过多时间。

如果命令失败，呈现 stderr 并停止——不要接连运行恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

**已知误报——不要追查。** `check` 可能会在**字幕**高亮词（选择器 `#caption-word-*` / `.caption-line`）上报告少量约 1–4px 的 `text_box_overflow` 问题。字幕胶囊有意使用了紧凑的 `line-height`（在 `scripts/captions.mjs` 中统一设置），并且**没有 `overflow:hidden`**，因此较粗的展示字体字形墨迹会溢出几像素，进入胶囊自身的内边距——实际上没有任何内容被裁剪。将这些视为预期情况并继续。**不要**增大字幕的 `line-height`（这会让胶囊膨胀，效果更糟）。仅当 `text_box_overflow` 指向**帧**元素（`#el-NN-*`）而非字幕词时，才采取行动。

检查通过后，暂停以供用户审阅——执行审阅循环的最终查看（`../hyperframes-core/references/review-loop.md` § 4）：在从步骤 3 起一直保持打开的 Studio 中，只问一个问题——现在渲染，还是需要进行哪些修改？（自主模式：保留的唯一问题，先预览还是直接渲染。）然后交付 MP4、联系表和帧 ID，以便将修订精准定位到单个帧。

预览：`npx hyperframes preview`

仅在用户批准后渲染（自主模式：在询问预览还是渲染之后）：

`npx hyperframes render --skill=faceless-explainer --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户提出要求。

**门禁：** `lint` 和 `check` 已通过，并且在渲染前已检查快照；用户已在审查暂停点批准（自主模式：检查已通过，且交付内容包含联系表）；`renders/video.mp4` 存在。最终回复中注明 MP4 路径和最终时长。

---

## 快速参考

**格式：** 横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080`——根据目标平台确定（简报约定 § 2）。在故事板 frontmatter 中设置一次格式。

**无真人素材流程与捕获素材工作流的差异：** 没有步骤 1 的捕获环节（使用合成的 `tokens.json` + `visible-text.txt`）；没有 `asset-descriptions.md`，也没有 `capture/assets/`；步骤 4 中没有素材暂存；`asset_candidates` 默认为空；每个视觉元素均由步骤 5 的工作器创作（排版 / 抽象图形 / 图解 / 数据可视化）。用户提供的 `public/<basename>` 图像是唯一的真实素材路径。

**后台脚本：** 此工作流在 `scripts/` 下仅提供以下脚本：`build-frame`，用于采用帧预设并对其进行品牌化再混合，生成 `frame.md`（以及字幕样式）；`audio`，用于 TTS、转录、BGM、音效和时长同步；`captions`；`transitions`，用于注入和验证；以及 `assemble-index`。其他所有功能均使用 `hyperframes` CLI。

可复用且与领域无关的镜头形态位于 `../hyperframes-animation/blueprints/` 中（索引位于 `../hyperframes-animation/blueprints-index.md`）。

| 阅读                                                                                                                                                        | 时机                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 门禁类型、根据 `BRIEF.md` 推导模式、字段语义。                  |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 步骤 3：故事原则——钩子语言、价值先于证据、提案形态。 |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)`                                                                          | 步骤 2：选择并采用帧预设。                                       |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)`                                                    | 步骤 2：正确应用品牌令牌。                                          |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 步骤 3：规划解说故事。                                              |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 步骤 3：角色→蓝图菜单。步骤 4：选择镜头形态。                      |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 步骤 3：编写 `STORYBOARD.md`。                                                 |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 步骤 3：编写 `SCRIPT.md`。                                                     |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 步骤 3.1：选择或了解 TTS 提供商及语音。                       |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 步骤 4：编写帧的镜头序列（以及布局词汇）。                 |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 步骤 4：动态词汇和动态原则。                           |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 步骤 4-5：剪辑目录（工作器构建帧内衔接）。                  |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 步骤 5：所引用动态的本地规则配方正文。                        |
| `[../hyperframes-core/references/frame-worker-core.md](../hyperframes-core/references/frame-worker-core.md)`                                                | 步骤 5：共享工作器约定（数据包构建器会将其前置到增量内容中）。  |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 步骤 5：工作流的帧工作器增量内容。                                     |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 步骤 5：安全分派子代理。                                            |