---
name: product-launch-video
description: "Turn a product or marketing URL, pasted script, or brief into a product launch / promo video — SaaS promos, feature reveals, product demos, app and company launches. Use when the user wants to market, launch, promote, or reveal a product; the default for any commercial URL. Site tours / showcases of a website route here too — the brief carries the show-it-as-is intent. Unclear → /hyperframes."
---
> **首先，让此技能保持最新——静默运行，不要询问：** `npx hyperframes skills update product-launch-video`。如果所有内容均为最新状态，此命令会快速完成且不做任何更改；否则，它会刷新此技能及其依赖的核心领域技能，之后再使用它们。

> **media-use**：在获取音频/图像/徽标之前，调用 `/media-use`，以从 HeyGen 目录中解析 BGM/SFX/图像，并从品牌官方来源解析其徽标。先运行 `--adopt` 以登记现有资产。请参阅 `/media-use` 技能。

> **figma 来源**：如果来源是 figma.com URL，请先运行 `/figma`——按需完成资产导出、品牌令牌提取，以及组件/故事板重建——然后根据其输出构建此工作流。不要直接通过原始 MCP 工具操作 Figma：这样会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录和品牌令牌 `var()` 绑定，导致后续品牌变更无法在不完整重新导入的情况下传播。

# 从产品发布到 HyperFrames

使用此技能来捕捉产品、了解其品牌、规划发布视频，并在 HyperFrames 中逐帧构建视频。

> **入口是 `/hyperframes`。** 你是编排者。运行每个步骤，验证其关卡，只有通过后才能继续下一步。此技能适用于**正在进行营销、发布、推广或揭晓的产品**，包括当用途是推广时诸如“为我们的网站制作宣传片”之类的请求。网站导览/展示类请求也仍走此流程：`BRIEF.md` 会记录按原样展示的意图，而捕捉的屏幕画面会成为视频所展示的资产。任何其他意图、单纯的“制作一个视频”，或存在任何不确定性 → 请先阅读 `/hyperframes`——意图层负责所有路线决策，而且任何没有 `BRIEF.md` 的新建请求即使来到这里，无论如何也会经过该层（Setup 的开场规则）。

你是编排者。在 `videos/<project>/` 中工作。按顺序运行步骤，并在继续之前通过每个关卡。需要用户确认的步骤是 Step 0、Step 3 和 Step 6。在 Step 0 之前阅读 `../hyperframes-core/references/brief-contract.md`——它定义了关卡类型，以及 `BRIEF.md` 的 `flow`/`storyboard` 如何派生出用于控制 Step 3/4/6 关卡的模式。除 Step 5 外，所有步骤都由你亲自完成；在 Step 5 中，你需要为每一帧派遣一个子代理。不要在此处放置设计或动效规则；这些规则位于帧工作器子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：Step 0 设置 -> `hyperframes.json`；Step 1 捕捉 -> `capture/`；Step 2 设计系统 -> `frame.md`；Step 3 故事板/脚本 -> `STORYBOARD.md` 和 `SCRIPT.md`；Step 3.1 音频 -> `audio_meta.json`；Step 4 视觉设计 -> 增强后的 `STORYBOARD.md`；Step 5 帧 -> `compositions/frames/NN-*.html` 和 `index.html`；Step 6 最终渲染 -> `renders/video.mp4`。

---

## Step 0：设置

目标：在简报已经确认的前提下开始，创建 HyperFrames 项目，并将简报持久化。

**简报由意图层确认，而不是通过在此处提问来确认。** 开场规则按以下顺序执行：**(1)** `BRIEF.md` 存在 → 阅读它且不要提出任何问题——简报已经确定，其 `flow`/`storyboard` 会派生出模式（简报契约 § 1）。**(2)** 没有 `BRIEF.md`，但项目已存在（磁盘上存在 `hyperframes.json` / `STORYBOARD.md`）→ 根据故事板的 frontmatter 和已记录的偏好恢复工作；绝不要重新盘问一个构建到一半的项目。**(3)** 两者都不存在——一个直接来到这里的新建请求 → 阅读 `/hyperframes` 并运行其意图层（§ 4）：它会检查方案和已记忆的默认设置，执行此路线的问题流程（`../hyperframes/references/route-briefs.md`），并返回已锁定的简报。编辑请求跳过以上所有流程——直接执行编辑。

仅当 `hyperframes.json` 缺失时才初始化。根据品牌或域名以 kebab-case 命名 `<project>`，例如 `acme-promo`；切勿使用工作区名称或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank` — `init` 会将已安装的技能与 GitHub 上的最新版本进行比对；如果有任何技能已过时，则更新全局技能集。

初始化后，将 `<PROJECT_ROOT>` 设为 `videos/<project>`，并以该目录作为工作目录运行此后的每一条相对路径命令。在以下命令中，`.` 表示 `<PROJECT_ROOT>`；切勿在调用方目录中写入 `.media`、`capture` 或输出文件。

**初始化后立即写入 `BRIEF.md`**（切勿在初始化之前写入——`init` 会拒绝非空目录）：这是意图层锁定的简报，其结构遵循 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` 技能目录。然后，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个有偏好依据的答案（`brief-format.md` 指定了相应的子集）。如果意图层采用了某个方案，请运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；该命令会将方案的 `frame.md` 复制到项目中（随后跳过步骤 2），并返回供步骤 3 起草内容使用的骨架。方案会填充答案，但不会代替审批；审查关卡仍需执行。

**在继续完成设置之后的步骤前，显示登录状态**——运行 `npx hyperframes auth status` 并逐字转达其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时说明如何登录。根据情况采用以下一个分支：

- **协作模式：**等待用户登录，或明确选择 `offline` / `go`。
- **自主模式：**说明当前状态，并继续使用可用的本地引擎。

当不存在离线提供商时，不要悄悄省略必需的能力；应明确指出阻塞问题。不要将此决定并入其他问题，也不要将密钥写入每个仓库的 `.env`。有关身份验证归属和离线回退，请参阅：`/media-use` § 提供商。

**关卡：**`hyperframes.json` 和 `BRIEF.md` 已存在；有偏好依据的答案已被记录（简报约定 § 2）；登录状态已显示（已登录，或正在离线继续）。

---

## 步骤 1：采集素材

目标：收集视频所需的源材料、品牌信号和可用素材。

对输入进行分类并选择处理路径。明确的 URL -> 采集该 URL，并将网站用于旁白和素材。粘贴的脚本/简报 -> 原样保存为 `user_script.txt`；`VO_MODE`（逐字照用或重构）取自 `BRIEF.md`——当收到脚本时，由意图层询问此项（仅当简报因某种原因缺少此项时，才在这里询问一次）。然后确定采集目标：文本中有 URL -> 使用该 URL；只有品牌名称 -> 使用 `WebSearch`，用一行确认 URL，然后抓取；没有 URL/网站（或简报注明不要抓取）-> 采用不采集路径。

使用以下命令执行采集：`npx hyperframes capture "<URL>" -o ./capture`

如果存在 `GEMINI_API_KEY`、`GOOGLE_API_KEY` 或 OpenRouter 密钥，采集过程会自动为素材生成说明，并写入 `capture/extracted/asset-descriptions.md`。这不是审查关卡。如果没有视觉模型密钥，则使用 DOM 上下文并继续。

无采集路径：手动创建 `capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/`。`tokens.json` 应为 `{ "title": "", "description": "", "colors": [], "fonts": [] }`；尽可能根据简报填写标题和描述。`visible-text.txt` 包含完整的简报或脚本。除非用户提供了素材说明，否则 `asset-descriptions.md` 应注明未采集到任何素材。

**关卡：** `capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/` 均已存在；你能够用一句清晰的话描述品牌。将 `asset-descriptions.md` 视为主要素材清单。如果在实际采集后该文件缺失，请停止并报告采集未完成。如果 `capture/BLOCKED.md` 存在，请按其中的说明操作。

---

## 第 2 步：设计系统

目标：选择一个随附的画面预设；脚本会将其转换为该视频的 `frame.md` 和字幕皮肤。

当 `BRIEF.md` 指定了 `style_preset` 时——用户已在意图层通过查看展示示例直观选定它——请使用该预设；只有在简报未指定时，才由你作出判断。然后你只需作出一个决定——**选择哪个预设**：阅读 `../hyperframes-creative/references/design-spec.md`，并选择视觉效果最符合品牌和简报的预设。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

脚本会以确定性的方式完成其余工作：将预设的 `FRAME.md` 复制为 `frame.md`，并将其**重新混合**到 `capture/extracted/tokens.json` 中的品牌令牌上（按角色——墨色、画布、强调色——将品牌颜色映射到预设的颜色键，同时保留键、结构和组件；将预设的展示字体和正文字体替换为品牌字体），将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并执行自我验证（映射损坏时以状态码 1 退出）。一旦脚本以状态码 0 退出，就进入下一步——不要手动编辑规范。

如果 `tokens.json` 中没有品牌颜色或字体（例如未进行采集），脚本会保留预设自身的调色板，从而得到一套完整、可交付的设计。如果简报指定了采集过程中遗漏的品牌颜色或字体，请在运行脚本前将其添加到 `capture/extracted/tokens.json` 中（或者使用用户的 `design.md` 填充该文件）；只有在映射确实需要调整时，才在之后手动修改 `frame.md`。

**关卡：** `build-frame.mjs` 已以状态码 0 退出——`frame.md` 已基于指定名称的预设生成，并且（当预设附带字幕皮肤时）`.hyperframes/caption-skin.html` 已作为字幕皮肤源存在；所选预设已记录为偏好设置（`--key style_preset --workflow <this workflow>`，简报契约第 2 节）。

---

## 第 3 步：故事板和脚本

目标：将简报和采集到的素材转化为经过批准的逐画面故事方案。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、价值先于证据、将故事板视为提案）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用这些资料编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。

使用 `story-design.md` 来确定故事蓝图、钩子、说服逻辑、节拍、`VO_MODE` 和素材选择。作为**非强制性指南**，请参考 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单：对于每个节拍，如果存在合适的蓝图，请注明一个候选蓝图 id。故事事实仍然决定应存在哪些节拍——绝不要为了适配蓝图而强行加入节拍，也绝不要仅仅因为已有经过验证的结构可用就凭空编造节拍。请从 `capture/extracted/asset-descriptions.md`（规范素材清单）中为每个视觉画面选择 `asset_candidates`——不要浏览原始的 `capture/assets/`。除非该清单缺失或无法使用，否则不要让用户挑选素材。使用故事板和脚本参考文档中要求的确切字段。

起草完成后，执行审查循环中的方案审查阶段——`../hyperframes-core/references/review-loop.md` § 1：打开画板（不要询问是否需要打开），以提案形式展示方案，并提出两个问题——批准还是修改，以及选择**先看草图**（推荐）还是跳过。通过聊天或画板的评论文件循环收集反馈，直至获得批准。这是一个**检查点门禁**（简报契约 § 1）：在自主模式下没有画板，也无需提问——发布相同的摘要作为预先告知，然后继续；草图阶段合并到构建阶段，唯一的预览问题在第 6 步提出。

**门禁：** `STORYBOARD.md` 已存在，每个视觉画面都有 `asset_candidates`，需要旁白时 `SCRIPT.md` 已存在，并且用户已批准逐画面方案（自主模式：已发布摘要作为预先告知）。

---

## 第 3.1 步：音频

目标：根据已批准的脚本生成旁白、词语时间点、音乐和音频元数据。

在第 3 步获得批准后开始处理音频。在后台运行音频处理，然后继续执行第 4 步。

**调用前，根据用户的要求选择旁白提供商和声音。** 使用 `--provider <provider>` 传入第 0 步中选择的提供商（或设置 `HF_TTS_PROVIDER`）。如果请求中指定了声音、性别或语气，请选择匹配的声音 id，并使用 `--voice <id>` 传入。否则，流水线默认在 HeyGen 上使用 **Marcia（女声）**，在 Kokoro 上使用 `am_michael`——因此，除非传入该标志，否则像“使用男声”这样的请求会被静默忽略。声音 id 因提供商而异；请根据第 0 步中的登录状态所选择的提供商进行解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）解析；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表解析（前缀 `am_`/`bm_` 表示男声，`af_`/`bf_` 表示女声）。当用户未表达任何偏好时，应先回退到已记住的声音（简报契约 § 2），再回退到流水线默认值，并说明所使用的声音；只有当两者都未指定声音时，才省略 `--voice`。当用户在本次运行中明确选择了声音时，将其记录下来（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --provider <provider> --voice <voice-id> &`

音频脚本负责处理旁白、字词时间点、从 HeyGen 音乐库中查找 BGM，以及时间元数据。BGM 情绪来自故事板的 `music:` 字段。这里使用 HeyGen Audio API 进行检索，而非生成，并与 TTS 使用相同的 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白且不存在 `SCRIPT.md`，则跳过语音生成。如果故事板中指定了音乐情绪，BGM 仍可运行。

**门槛：**音频作业已启动，或项目已标记为静默。

---

## 步骤 4：画面视觉设计

目标：为故事板中的每个画面添加视觉方向、布局意图和动效选择。

**先绘制故事板草图（仅限协作模式）。** 方案一经批准，立即执行草图阶段——参见 `../hyperframes-core/references/review-loop.md` § 2（不要等待步骤 3.1；草图不使用时间点）：亲自为每个画面绘制线框图，将每个画面标记为 `built`，在故事板全部完成时暂停并提出一个布局问题，然后仅修改被点名的草图，直到故事板得到确认。占位元素：使用带有简单标签的区块表示待采集的素材——实际文件将由步骤 5 的工作进程提供。只有到那时，才能将下述视觉设计写入已确认的布局。在自主模式下，或者用户在步骤 3 中选择跳过草图时，跳过此阶段——画面将在步骤 5 中直接从 `outline` 进入 `animated`。

直接编辑 `STORYBOARD.md`。不要创建其他故事板。以 `frame.md` 作为颜色、字体、布局观感和风格的事实来源。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 中的方法（带时间码的镜头序列、内联的布局词汇，以及必需的 `## Video direction` 区块）。使用 `../hyperframes-animation/blueprints-index.md` 为每个画面选择镜头结构。使用 `motion-language.md`（动效词汇和动效原则）及 `../hyperframes-animation/rules-index.md`（有效的规则名称）来设计动效——不要自行创造动效名称。

对于每个视觉画面，按照 `visual-design.md` 中的方法，将一个**带时间码的镜头序列**写入 `STORYBOARD.md`：选择该画面的蓝图（或进行组合），用当前产品的内容将其实例化，并根据旁白调整每个场景的呈现节奏，使画面在其完整持续时间内逐步展开，而不是在开头集中呈现后便静止不动。为每个场景**内联**说明布局和动效（相关词汇见 `visual-design.md` 和 `motion-language.md`）。添加一个全视频通用的 `## Video direction` 区块。

不要更改故事、脚本、素材选择、`asset_candidates`、`transition_in` 或已采集的源材料。此步骤中不要编写 HTML。

视觉设计锁定后，暂存已命名的素材：

`node <SKILL_DIR>/scripts/stage-assets.mjs --storyboard ./STORYBOARD.md --hyperframes .`

**门槛：**每个视觉画面都具有带时间码的镜头序列，其呈现节奏与旁白匹配（不得在开头集中呈现）；存在 `## Video direction`；`assets/` 包含已命名的素材。协作模式：故事板草图已得到确认。

---

## 步骤 5：构建帧

目标：将每个故事板帧构建为 HTML 合成，并组装成可播放的视频。

如果已启动音频生成，请等待步骤 3.1 的音频处理完成。然后同步时长并获取音效；如果是无声视频，则跳过这两项操作。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械式的：以实际语音时长为准；无声帧保留估算时长；绝不要手动编辑同步后的时长。

分派任务前，请阅读 `sub-agents/frame-worker.md` 和 `../hyperframes-core/references/subagent-dispatch.md`。为每一帧分派一个子代理，尽可能并行执行；否则分批运行工作器。每个工作器只负责一帧。

每个工作器的上下文必须包含 `PROJECT_DIR`、`frame_id`、该帧在磁盘上是否有**已确认的草图**、画布尺寸、字幕状态以及启用字幕时的避让区域，并将 `RULES_DIR` 设置为此技能的 `../hyperframes-animation/rules/` 的绝对路径。每个工作器需读取 `frame.md`、`STORYBOARD.md` 中属于自己的 `## Frame N` 区块、已存在的确认草图（保留其布局——参见 frame-worker 的 § 有确认草图时）、每个所引用动效对应的本地规则方案（`../hyperframes-animation/rules/<id>.md`），以及该帧的蓝图模板（`../hyperframes-animation/blueprints/<id>.md`）。每个工作器只能写入 `compositions/frames/NN-*.html`。工作器绝不能编辑 `STORYBOARD.md`。

**满出血背景应放在 `class="clip"` 图层上，绝不能放在 `#root` 上。** 帧的底层背景（色块／渐变／网格）应作为独立的全时长背景剪辑——在 `#root`／`data-composition-id` 元素上设置的 `background` 会受剪辑限制，仅在该帧的时间窗口内生效，因此不能作为可靠的底层背景；深色内容可能会落在黑色宿主 `body` 上，从而无法显示。视频的基础底色由组装器根据 `frame.md` 中的 `canvas` 颜色绘制到索引页的 `#root` 上。（完整规则和自检方式请参见 `sub-agents/frame-worker.md`。）

每当一个工作器返回结果时，编排器都要在 `STORYBOARD.md` 中将该帧标记为 `animated`。

音频时间信息生成后，在后台构建字幕并组装索引页：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在步骤 2 中复制）作为字幕样式，并注入 `frame.md` 中的品牌令牌；如果不存在该样式文件，则使用内置的默认胶囊样式进行渲染。`captions: skipped (<reason>)` 是有效状态。明确跳过字幕时，继续执行后续流程。

**关卡：**每一帧均已标记为 `animated`（协作模式：草图板已在步骤 4 中确认），`index.html` 已存在，并且字幕已构建或已明确跳过。

---

## 步骤 6：完成制作

目标：验证组装后的视频、获取用户批准，并渲染最终的 MP4。

注入转场、运行检查、暂停以供审阅，然后渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints>`

`snapshot` 会将捕获的帧拼接成一张接触表（`snapshots/contact-sheet.jpg`）。快速查看一下；如果没有明显问题，就继续——不要在这里久留。

如果命令失败，显示 stderr 并停止——不要堆叠执行恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

检查通过后，暂停以供用户审阅——审阅循环的最终查看环节（`../hyperframes-core/references/review-loop.md` § 4）：只问一个问题，并在自步骤 3 起一直保持打开状态的 Studio 中进行——现在渲染，还是需要做哪些更改？（自主模式：保留的唯一问题是先预览还是渲染。）然后交付 MP4，同时提供接触表和帧 ID，以便修改时可以精准定位到单个帧。

预览：`npx hyperframes preview`

仅在用户批准后渲染（自主模式：在询问预览还是渲染之后）：

`npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户提出要求。

**门禁：** 渲染前 `lint` 和 `check` 已通过且快照已检查；用户已在审阅暂停环节批准（自主模式：检查已通过，且交付内容包含接触表）；`renders/video.mp4` 存在。最终回复需说明 MP4 路径和最终时长。

---

## 快速参考

**格式：** 横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080`——根据目标平台确定（简报契约 § 2）。在故事板 frontmatter 中只设置一次格式。

**后台脚本：** 工作流在 `scripts/` 下仅附带以下脚本：`build-frame`，用于将帧预设采用并进行品牌重混后写入 `frame.md`（并添加字幕皮肤）；`audio`，用于 TTS、转录、BGM、SFX 和时长同步；`captions`；`transitions`，用于注入和验证；`stage-assets`，用于将以帧命名的素材复制到 `assets/`；以及 `assemble-index`。其他所有工作均由 `hyperframes` CLI 处理。

可复用、与产品无关的镜头形态位于 `../hyperframes-animation/blueprints/`（索引见 `../hyperframes-animation/blueprints-index.md`）。

| 阅读                                                                                                                                                        | 时机                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 门禁类型、根据 `BRIEF.md` 推导模式、字段语义。                  |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 步骤 3：故事原则——钩子语言、价值先于证据、提案结构。 |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)`                                                                          | 步骤 2：选择并采用帧预设。                                       |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)`                                                    | 步骤 2：正确应用品牌 token。                                          |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 步骤 3：规划产品发布故事。                                         |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 步骤 3：角色→蓝图菜单。步骤 4：选择镜头形态。                      |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 步骤 3：编写 `STORYBOARD.md`。                                                 |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 步骤 3：编写 `SCRIPT.md`。                                                     |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 步骤 3.1：选择或了解 TTS 提供商和语音。                       |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 步骤 4：编写帧的镜头序列（以及布局词汇）。                 |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 步骤 4：动效词汇和动效原则。                           |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 步骤 4-5：剪辑目录（工作器构建帧内接缝）。                  |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 步骤 5：所引用动效的本地规则配方正文。                        |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 步骤 5：分派逐帧工作器。                                            |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 步骤 5：安全地分派子智能体。                                            |