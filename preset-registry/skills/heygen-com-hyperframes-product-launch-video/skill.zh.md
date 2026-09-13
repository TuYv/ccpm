---
name: product-launch-video
description: "Turn a product or marketing URL, pasted script, or brief into a product launch / promo video — SaaS promos, feature reveals, product demos, app and company launches. Use when the user wants to market, launch, promote, or reveal a product; the default for any commercial URL. Site tours / showcases of a website route here too — the brief carries the show-it-as-is intent. Unclear → /hyperframes."
---
> **首先，保持此技能为最新状态**：运行前先向用户确认：`npx hyperframes skills update product-launch-video`。如果一切都是最新的，这会快速空操作；否则，它会在依赖这些技能之前刷新此技能及其依赖的核心领域技能。

> **media-use**：在获取音频、图像或 logo 之前，调用 `/media-use`，以从 HeyGen catalog 中解析 BGM/SFX/images，并从官方来源获取品牌 logo。先运行 `--adopt`，以注册现有资源。请参阅 `/media-use` 技能。

> **figma source**：如果源文件是 figma.com URL，请先运行 `/figma`，根据需要执行资源导出、品牌令牌提取以及组件/分镜重建，然后再根据其输出构建此工作流。不要直接通过原始 MCP 工具驱动 Figma：这会跳过 SVG 清理、`.media/manifest.jsonl` 溯源以及品牌令牌 `var()` 绑定，后续品牌变更将无法在不完整重新导入的情况下传播。

# 从产品发布到 HyperFrames

使用此技能捕获产品、了解其品牌、规划发布视频，并在 HyperFrames 中逐帧构建视频。

> **入口是 `/hyperframes`。** 你是编排者。运行每个步骤，验证其门禁，然后才能继续下一步。此技能适用于正在营销、发布、推广或揭示的产品，包括“为我们的网站制作宣传视频”之类的请求，只要其目的是推广。网站导览/展示类请求仍归入此处：`BRIEF.md` 会记录按原样展示的意图，捕获的屏幕会成为视频重点展示的资产。任何其他意图、单纯的“制作一个视频”请求，或任何不确定情况，都应先阅读 `/hyperframes` —— 意图层负责所有路径决策；而且新创建的请求如果直接进入此处，在没有 `BRIEF.md` 的情况下也会经过它（Setup 的开场规则）。

你是编排者。在 `videos/<project>/` 中工作。按顺序运行各步骤，并在继续之前通过每个门禁。除步骤 5 外，所有步骤都由你亲自完成；步骤 5 中，每个画面分派一个子代理。不要在此处编写设计或运动规则；这些规则位于 frame-worker 子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/` 以及 `hyperframes-creative` 中。阅读 `../hyperframes-core/references/brief-contract.md`，了解门禁类型，以及 `BRIEF.md` 的 `flow`/`storyboard` 如何推导出决定步骤 3/4/6 门禁的模式。工作流：步骤 0 设置 -> `hyperframes.json`；步骤 1 捕获 -> `capture/`；步骤 2 设计系统 -> `frame.md`；步骤 3 分镜/脚本 -> `STORYBOARD.md` 和 `SCRIPT.md`；步骤 3.1 音频 -> `audio_meta.json`；步骤 4 视觉设计 -> 丰富后的 `STORYBOARD.md`；步骤 5 画面 -> `compositions/frames/NN-*.html` 和 `index.html`；步骤 6 最终渲染 -> `renders/video.mp4`。

---

## 步骤 0：设置

目标：在确认过的 brief 下开始，创建 HyperFrames 项目，并使 brief 持久化。

**brief 由意图层确认，而不是由此处提出的问题确认。** 开场规则按以下顺序执行：**(1)** `BRIEF.md` 存在 → 读取它，不提出任何问题 —— brief 已确定，其 `flow`/`storyboard` 会推导出模式（brief contract § 1）。**(2)** 没有 `BRIEF.md`，但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 根据 storyboard 的 frontmatter 和已记录的偏好继续；绝不要重新询问一个已进行到一半的项目。**(3)** 两者都不存在 —— 一个直接进入此处的新创建请求 → 阅读 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：它会检查 recipes 和已记忆的默认设置，执行此路径的问题（`../hyperframes/references/routes/product-launch-video.md`），并返回已锁定的 brief。编辑请求跳过所有这些步骤 —— 直接执行编辑。

仅当缺少 `hyperframes.json` 时才进行初始化。根据品牌或域名以 kebab-case 命名 `<project>`，例如 `acme-promo`；绝不要使用工作区名称或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=product-launch-video` — `init` 会将已安装的 skills 与 GitHub 上的最新版本进行检查，如有过期则更新全局集合。

初始化后，将 `<PROJECT_ROOT>` 设为 `videos/<project>`，并在该目录中运行后续所有相对路径命令。以下命令中的 `.` 表示 `<PROJECT_ROOT>`；绝不要在调用方目录中写入 `.media`、`capture` 或输出文件。

**在初始化后立即写入 `BRIEF.md`**（绝不要提前写入 — `init` 拒绝非空目录）：按 `../hyperframes-core/references/brief-format.md` 的结构写入意图层的锁定 brief。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` skill 目录。然后使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个由偏好支持的答案（`brief-format.md` 会列出其中的子集）。如果意图层采用了 recipe，则运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；它会将其 `frame.md` 复制到项目中（此时跳过 Step 2），并返回 Step 3 起草所依据的 skeleton。recipe 会填写答案，但不会代替审批；审查门禁仍然运行。

**在 Setup 之后继续前显示登录状态** — 运行 `npx hyperframes auth status` 并逐字转述其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时说明登录方式。注意退出码约定：未登录时（以及存储的凭据被拒绝时），`auth status` **以 1 退出** — 这种非零退出是正常的未登录状态，不是命令失败；不要将其视为错误，不要重试，也不要以会中止工作流的方式将它与 `&&`/`set -e` 链接。应用以下一种分支：

- **协作模式：** 等待用户登录，或明确选择 `offline` / `go`。
- **自主模式：** 陈述状态，并使用可用的本地引擎继续执行。

当不存在离线提供方时，不要默默省略必需的能力；应明确指出阻塞原因。不要将此决定并入其他问题，也不要将密钥写入每个仓库的 `.env`。认证归属和离线回退方案：`/media-use` `references/setup-providers.md` § Providers。

**门禁：** `hyperframes.json` 和 `BRIEF.md` 存在；由偏好支持的答案已记录（brief contract § 2）；登录状态已显示（已登录，或继续离线）。

---

## Step 1: 捕获素材

目标：收集视频的源材料、品牌信号和可用素材。

对输入进行分类并选择路径。明确的 URL -> 捕获该 URL，并使用网站内容进行旁白和素材制作。粘贴的脚本/brief -> 原样保存为 `user_script.txt`；`VO_MODE`（逐字或重构）来自 `BRIEF.md` — 意图层在收到脚本时会询问这一点（仅当 brief 中不知为何缺少它时，才在此处询问一次）。然后解析捕获目标：文本中有 URL -> 使用该 URL；仅有品牌名称 -> 使用 `WebSearch`，用一行确认 URL，然后进行爬取；没有 URL/网站（或 brief 说明不要抓取）-> 采用无捕获路径。

运行以下命令进行捕获：`npx hyperframes capture "<URL>" -o ./capture --json`。除非调用方负责一个更短的截止时间，否则保留默认的导航后预算；在这种情况下，传入一个为正数的 `--capture-budget <milliseconds>`，并为下游工作留出时间。`--timeout` 仅控制页面导航。仅当明确有意禁用可选的图像描述时，才使用 `--skip-vision`。

立即检查命令结果和输出目录。非零退出码、JSON 中的 `ok: false`，或存在 `capture/BLOCKED.md`，都是捕获路径的**硬停止条件**：报告记录的原因，不要使用部分截图、DOM、令牌或资源。URL 捕获失败后，不得构造合成的无捕获回退。只有在原始说明中提供了源材料，或用户在失败后明确切换到所提供的截图或说明时，才继续走无捕获路径。

诸如 `very little text content` 与空资源目录同时出现的警告，并不能证明页面可用。对于网站导览或按原样展示的说明，必须具备可信的捕获结构或用户提供的截图；如果两者都没有，则停止。不要仅仅因为捕获不可用，就凭空设计或重建页面。

对于网站导览或按原样展示的说明，捕获的页面是视觉事实来源。在 HTML 中使用真实截图作为基础，而不是重建整个网站。如果截图需要内部动效，请将截图保留为基础，并在经过测量的位置叠加真实捕获资源，或仅重建会移动的单个组件。对于滚动截图，在 `capture/screenshots/full-page.png` 上对视口进行动画处理——这是整篇文档的 1x 素材，适用于宽度为 1920 的视口沿页面向下移动，并且像素精确。当页面过高、无法一次性捕获完整内容时，该文件不会存在；此时回退到同一目录中具有重叠区域的滚动位置截图。放大超过 1:1 时，需要单独对该区域进行 2x 捕获，因为该素材在 1x 以上没有余量。仅当用户明确要求进行风格化诠释时，才重建整个页面；捕获不可用本身并不代表获得了这样的授权。

如果存在 `GEMINI_API_KEY`、`GOOGLE_API_KEY` 或 OpenRouter 密钥，捕获会自动将资源描述写入 `capture/extracted/asset-descriptions.md`。这不是审核门槛。没有视觉密钥时，使用 DOM 上下文并继续。

无捕获路径：手动创建 `capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/`。`tokens.json` 应为 `{ "title": "", "description": "", "colors": [], "fonts": [] }`；如有可能，根据说明填写标题和描述。`visible-text.txt` 包含完整说明或脚本。除非用户提供了资源备注，否则 `asset-descriptions.md` 应说明未捕获任何资源。

**门槛：**捕获 JSON 报告 `ok: true`；不存在 `capture/BLOCKED.md`；`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/` 均存在；并且你能够用一句清晰的话说明品牌。将 `asset-descriptions.md` 视为主要资源清单。如果实际捕获后该文件缺失，则停止并报告捕获未完成。只有在结构门槛仍然通过时，才可以接受有关可选阶段降级的警告。

---

## 第 2 步：设计系统

目标：选择一个已交付的画面预设，由脚本将其转换为本视频的 `frame.md` + 字幕皮肤。

当 `BRIEF.md` 指定了 `style_preset` 时——用户已在意图层的展示页中凭视觉选择了它——请使用该预设；只有当 brief 未指定时，才由你做判断。然后做出唯一的选择——**使用哪个预设**：阅读 `../hyperframes-creative/references/design-spec.md`，选择外观最符合品牌和 brief 的预设。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

脚本会确定性地完成其余工作：将预设的 `FRAME.md` 复制为 `frame.md`，并将其**重新混合**到 `capture/extracted/tokens.json` 中的品牌令牌上（按角色将品牌颜色映射到预设的颜色键——ink、canvas、accents——同时保留键、结构和组件；将预设的展示字体和正文字体替换为品牌字体），将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并进行自验证（映射损坏时退出并返回 1）。退出码为 0 后立即进入下一步——不要手动编辑规范。

`tokens.json` 中没有品牌颜色/字体（例如没有 capture）→ 脚本会保留预设自身的配色，得到一套完整且可交付的设计。如果 brief 指定了 capture 未捕获的品牌颜色/字体，请在运行前将其添加到 `capture/extracted/tokens.json` 中（或使用用户的 `design.md` 填充）；只有在确实需要调整映射时，之后才手动调整 `frame.md`。

**门禁：**`build-frame.mjs` 退出码为 0——`frame.md` 已由一个命名预设生成，并且（当预设提供该文件时）`.hyperframes/caption-skin.html` 作为字幕皮肤源文件存在；所选预设已记录为偏好（`--key style_preset --workflow <this workflow>`，brief 合约 § 2）。

---

## 第 3 步：分镜与脚本

目标：将 brief 和捕获的素材转化为一份经过批准的逐帧故事方案。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、先价值后证据、将分镜作为提案、可追溯到来源的视觉素材）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用这些内容编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。根据 brief 中的 `length` 设置 frontmatter 的 `duration:`——这只是一个粗略预期；assembly 会报告最终剪辑时长与该预期的差异。

使用 `story-design.md` 确定故事蓝图、钩子、说服逻辑、节拍、`VO_MODE` 和素材选择。作为**软性参考**，查阅 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单：对于每个节拍，在有合适蓝图时记录一个候选蓝图 id。故事事实仍然决定哪些节拍应当存在——绝不要为了适配蓝图而强行加入节拍，也绝不要仅仅因为有成熟的结构就凭空创造节拍。根据 `capture/extracted/asset-descriptions.md`（规范素材清单）为每个视觉画面选择 `asset_candidates`——不要浏览原始的 `capture/assets/`。除非该清单缺失或不可用，否则不要要求用户选择素材。使用分镜和脚本参考文档中要求的确切字段。

完成起草后，运行评审循环的计划阶段，即 `../hyperframes-core/references/review-loop.md` § 1：打开看板（不要询问是否打开），将计划作为提案呈现，并提出两个问题：批准还是修改，以及**先绘制草图**（推荐）还是跳过。反馈通过聊天或看板的评论文件持续进行，直到获得批准。这是一个**检查点门禁**（简要契约 § 1）：在自主模式下没有看板，也没有需要询问的问题，只需发布相同的摘要作为提示并继续；草图合并到构建过程中，唯一的预览问题在第 6 步提出。

**门禁：**`STORYBOARD.md` 存在，每个视觉帧都有 `asset_candidates`，需要旁白时 `SCRIPT.md` 存在，并且用户已批准逐帧计划（自主模式：已发布摘要作为提示）。

---

## 第 3.1 步：音频

目标：根据已批准的脚本生成旁白、单词时间、音乐和音频元数据。

在第 3 步获得批准后开始音频处理。在后台运行，然后继续执行第 4 步。

**在调用前，根据用户的要求选择旁白提供商和声音。** 使用第 0 步选择的提供商，并通过 `--provider <provider>` 传入（或设置 `HF_TTS_PROVIDER`）。如果请求中指定了声音、性别或语气，请选择匹配的声音 id，并通过 `--voice <id>` 传入。否则，管线默认使用 HeyGen 上的 **Marcia（女性）** / Kokoro 上的 `am_michael`，因此类似“使用男性声音”的请求如果不传入该标志就会被静默忽略。声音 id 因提供商而异：根据第 0 步的登录状态选择的提供商进行解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）解析；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表解析（男性使用 `am_`/`bm_` 前缀，女性使用 `af_`/`bf_` 前缀）。当用户没有表达偏好时，在使用管线默认值之前，先使用记忆中的声音（简要契约 § 2），并说明使用的是哪个声音；仅当用户没有指定声音且本次运行中也没有记忆的声音时，才省略 `--voice`。当用户在本次运行中明确选择了声音时，记录该声音（`prefs.mjs record --key voice`）。

```bash
node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --provider <provider> --voice <voice-id> &
```

音频脚本负责生成旁白、单词时间，从 HeyGen 的音乐库查找背景音乐，以及生成时间元数据。背景音乐的情绪来自看板中的 `music:` 字段；**`music: none` 会关闭背景音乐**。背景音乐通过 HeyGen Audio API 获取，而不是生成，并且使用与 TTS 相同的 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白且不存在 `SCRIPT.md`，则跳过声音生成。如果看板中设置了音乐情绪，背景音乐仍可能运行。

**规范的完全静音标记：**`STORYBOARD.md` 顶部 YAML 块中的 `music: none`，并且不存在 `SCRIPT.md`。这种组合表示项目静音：没有旁白、背景音乐或音效。`audio.mjs` 会识别这一标记并且不生成任何内容（它会移除过时的 `audio_meta.json`；不存在 `audio_meta.json` 时，assemble 会将项目视为静音），因此第 3.1 步可以直接跳过。当用户要求制作无声或无音乐视频时，请使用这一标记，不要自行使用其他拼写。

**门槛：**音频任务已开始，或项目已标记为静音（`music: none` + 没有 `SCRIPT.md`）。

---

## 步骤 4：设计画面视觉

目标：为每个分镜帧添加视觉方向、布局意图和运动选择。

**先绘制分镜板（仅协作模式）。**计划获批准后立即运行草图流程，即 `../hyperframes-core/references/review-loop.md` § 2（不要等待 Step 3.1；草图不使用时长）：自行绘制每个帧的线框图，将每个帧标记为 `built`，当分镜板完成后暂停，提出一个布局问题，并且只修改被点名的草图，直到分镜板确认。占位内容：使用带有标签的纯色块表示要捕获的资产，真实文件将在 Step 5 的 worker 中到位。只有这样，才能将视觉设计写入已确认的布局中。在自主模式下，或用户在 Step 3 选择跳过草图时，跳过此流程——帧将在 Step 5 直接从 `outline` 进入 `animated`。

就地编辑 `STORYBOARD.md`。不要创建另一个 storyboard。以 `frame.md` 作为色彩、字体、布局氛围和风格的事实来源。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 了解方法（按时间编码的镜头序列、内嵌的 Layout 词汇表，以及必需的 `## Video direction` 区块）。使用 `../hyperframes-animation/blueprints-index.md` 为每个帧选择镜头形态。使用 `motion-language.md`（运动词汇表 + 运动原则）和 `../hyperframes-animation/rules-index.md`（有效的规则名称）来描述运动——不要自行发明运动名称。

**设计任何命名风格前，先搜索实时目录。**对于简报中命名的每一种视觉风格、效果、处理方式或转场——“CRT scanlines”、“glitch”、“film grain”、“shimmer sweep”、“confetti burst”——运行 `npx hyperframes catalog --query "<the look, in plain English>" --json`，并在将该风格写入 `STORYBOARD.md` 之前阅读顶部结果。搜索**无需安装任何内容**：不需要项目、不需要之前的 `add`，也不需要账户。从任意目录都可以搜索整个托管注册表（约 400 个区块和组件）。如果已有区块能够完成这项工作，就将其作为该帧的 `focal`——在此处命名它，以便 Step 5 的 worker 安装并定制它，而不是重新构建。如果搜索结果中没有合适的内容，之后才能手动编写该视觉风格。

对于每个视觉帧，根据 `visual-design.md` 的方法，将**按时间编码的镜头序列**写入 `STORYBOARD.md`：选择该帧的 blueprint（或进行组合），使用**本产品的内容**对其进行实例化，并根据旁白安排每个 Scene 的揭示节奏，使帧在完整时长内持续发展，而不是开头集中呈现后一直静止。每个 Scene 中都要内联说明布局和运动（词汇表见 `visual-design.md` 和 `motion-language.md`）。添加一个全视频通用的 `## Video direction` 区块。

当某个元素明显跨越帧边界持续存在时，在 `STORYBOARD.md` 中为两个 worker 提供相同的数值交接信息：在前一个帧添加 `handoff_out:`，并在后一个帧添加匹配的 `handoff_in:`。写明该元素，并给出切点处精确的 x/y 位置、缩放、透明度以及运动方向/速度——即使某个字段没有变化，也必须写出每个字段，因为常量应写为 `opacity: 1`，而不是省略。只有在刻意进行干净切换时，才省略整个区块。目标很简单：并行 worker 不应各自编造同一交接处的两个不同版本。

不要更改故事、脚本、素材选择、`asset_candidates`、`transition_in` 或捕获的源素材。此步骤不要编写 HTML。

在视觉设计锁定后，对具名素材进行分阶段处理：

`node <SKILL_DIR>/scripts/stage-assets.mjs --storyboard ./STORYBOARD.md --hyperframes .`

**门槛：** 每个视觉帧都有按时间编码的镜头序列，且各个揭示内容与旁白节奏同步（不能前置展示全部内容）；存在 `## Video direction`；`assets/` 中包含具名素材。协作要求：草图板已确认。

---

## 第 5 步：构建帧

目标：将每个分镜帧构建为 HTML 组合，并组装可播放视频。

如果已启动音频，请等待第 3.1 步的音频完成。然后同步时长并获取 SFX；如果是静音，则跳过这两步。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械操作：以实际语音时长为准；静音帧保留估算时长；绝不要手动编辑同步后的时长。

在组装之前，根据最终剪辑检查音乐。素材库中的曲目可能符合所请求的情绪，但对于短篇发布视频而言，开头安静的铺陈可能会消耗最初几秒。将开头与之后各个五秒区间进行比较；如果后续某个区间具有更有力且音乐衔接干净的起点，则从该处截取，并保留较短的淡入和较长的淡出。如果帧或旁白时序发生变化，请针对新的最终时长重新执行此检查，确保音乐不会提前结束，也不会在结尾留下静音。

调度之前，阅读 `../hyperframes-core/references/subagent-dispatch.md`。构建每帧数据包和工作者角色负载：

`node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

构建器会在 `.hyperframes/frame-packets/` 下为每个帧写入一个有边界的数据包（该帧的完整分镜块 + 蓝图正文 + 所有被引用的规则配方，并以内联方式包含），以及 `_role.md`（`../hyperframes-core/references/frame-worker-core.md` + 此技能的 `sub-agents/frame-worker.md`，逐字拼接而成的完整工作者角色）。为每个帧调度一个子代理，如有可能则并行调度；否则分批运行工作者。每个工作者只能处理一个帧：其提示中包含 `_role.md` 和该帧的数据包——可以将两者完整粘贴，或交给工作者两个文件路径让其先读取（两种方式等价；工作者均从这两份文档开始）——以及调度上下文，其中包含 `PROJECT_DIR`、`frame_id`、该帧磁盘上是否存在**已确认的草图**（如果存在，工作者应在该布局上进行设计，而不是重新绘制——参见 frame-worker core § When a confirmed sketch exists）、画布尺寸，以及字幕状态和留白区域（启用字幕时）。

工作者只能读取其数据包和 `frame.md`；不得打开 `STORYBOARD.md` 或技能文档（数据包已内联上游选定的内容）。每个工作者只能写入 `compositions/frames/NN-*.html`。工作者绝不能编辑 `STORYBOARD.md`。

**全出血背景位于 `class="clip"` 层上，绝不能位于 `#root`。** 帧的底色（色彩区域 / 渐变 / 网格）是一个持续整个时长的独立背景 clip：设置在 `#root` / `data-composition-id` 元素上的 `background` 会受帧窗口限制，并不是可靠的底色，因此深色内容可能落在黑色宿主 `body` 上并渲染为不可见。视频的基础底色由 assembler 根据 `frame.md` 的 `canvas` 颜色绘制到索引 `#root` 上。（完整规则与自检：`../hyperframes-core/references/frame-worker-core.md`。）

每个 worker 返回后，orchestrator 会在 `STORYBOARD.md` 中将对应帧标记为 `animated`。

音频时间信息生成后，在后台构建字幕并组装索引：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在步骤 2 中复制）作为字幕样式，并注入来自 `frame.md` 的品牌令牌；如果不存在样式文件，则渲染内置的默认胶囊样式。`captions: skipped (<reason>)` 是有效状态。明确跳过字幕时，继续执行后续流程。

**门禁：** 每一帧都已标记为 `animated`（协作模式：画板已在步骤 4 确认），`index.html` 存在，并且字幕已构建或已明确跳过。

---

## 步骤 6：完成

目标：验证组装后的视频，获取用户批准，并渲染最终 MP4。

注入转场、运行检查、暂停等待审核，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints-and-each-cut-minus-0.1s-and-plus-0.2s>`

`snapshot` 会将捕获的帧拼接成一张联系表（`snapshots/contact-sheet.jpg`）。检查中点帧是否存在布局问题，然后比较每个切点附近的两张图像。持续存在的元素必须保持约定的位置、缩放、透明度和方向；在渲染前修复任何可见的跳变。

如果命令失败，显示 stderr 并停止，不要继续堆叠恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

检查通过后，暂停等待用户审核，遵循审核循环的最终查看步骤（`../hyperframes-core/references/review-loop.md` § 4）：在自步骤 3 起一直保持打开的 Studio 中提出一个问题：现在渲染，还是需要修改什么？（自主模式：保留“先预览还是渲染”这一个问题。）然后交付 MP4，同时提供联系表和帧 ID，以便后续修改可以定位到单个帧。

预览：`npx hyperframes preview --background`

仅在用户批准后进行渲染（自主模式：在“预览还是渲染”问题之后）：

`npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户要求。

**门禁条件：**渲染前 `lint` 和 `check` 已通过，并且已检查快照；用户在评审暂停点已批准（自主执行时：检查已通过，交付内容包含联系表）；`renders/video.mp4` 存在。最终回复需说明 MP4 路径和最终时长。

---

## 快速参考

**格式：**横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080` —— 根据目标平台确定（简报约定 § 2）。在故事板 frontmatter 中设置一次格式。

**背景脚本：**工作流仅在 `scripts/` 下提供以下脚本：用于将帧预设应用并进行品牌重混到 `frame.md`（包括字幕样式）的 `build-frame`；用于 TTS、转录、BGM、SFX 和时长同步的 `audio`；`captions`；用于注入和验证的 `transitions`；用于将帧命名的资源复制到 `assets/` 的 `stage-assets`；以及 `assemble-index`。其他所有操作均由 `hyperframes` CLI 处理。

可复用、与产品无关的镜头形状位于 `../hyperframes-animation/blueprints/` 中（由 `../hyperframes-animation/blueprints-index.md` 索引）。

| 阅读                                                                                                                                                          | 使用时机                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 门禁类型、根据 `BRIEF.md` 推导模式、字段语义。                                                          |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 第 3 步：故事原则 —— hook 语言、价值先于证据、提案结构、可追溯到来源的视觉素材。                       |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)`                                                                            | 第 2 步：选择并应用帧预设。                                                                            |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)`                                                    | 第 2 步：正确应用品牌 token。                                                                          |
| `[references/story-design.md](references/story-design.md)`                                                                                                    | 第 3 步：规划产品发布故事。                                                                            |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                                | 第 3 步：角色→蓝图菜单。第 4 步：选择镜头形状。                                                        |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 第 3 步：编写 `STORYBOARD.md`。                                                                        |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 第 3 步：编写 `SCRIPT.md`。                                                                            |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                                | 第 3.1 步：选择或了解 TTS 提供商和语音。                                                               |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                  | 第 4 步：编写帧的镜头序列（以及布局词汇）。                                                            |
| `[references/motion-language.md](references/motion-language.md)`                                                                                              | 第 4 步：动作词汇和动作原则。                                                                          |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                      | 第 4-5 步：剪辑目录（worker 在帧内构建衔接）。                                                          |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 第 5 步：所引用动作的本地规则配方正文。                                                                |
| `[../hyperframes-core/references/frame-worker-core.md](../hyperframes-core/references/frame-worker-core.md)`                                                | 第 5 步：共享 worker 契约（packet builder 会将其添加到增量说明之前）。                                  |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                    | 第 5 步：此工作流的 frame-worker 增量说明。                                                            |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 第 5 步：安全地调度子代理。                                                                            |