---
name: product-launch-video
description: "Turn a product or marketing URL, pasted script, or brief into a product launch / promo video — SaaS promos, feature reveals, product demos, app and company launches. Use when the user wants to market, launch, promote, or reveal a product; the default for any commercial URL. Site tours / showcases of a website route here too — the brief carries the show-it-as-is intent. Unclear → /hyperframes."
---
> **首先，确保此 skill 为最新版本——静默运行，不要询问：** `npx hyperframes skills update product-launch-video`。当所有内容均为最新时，此命令会快速执行且不产生任何变更；否则，它会在你依赖此 skill 之前更新它及其所依赖的核心领域 skills。

> **media-use**：在获取音频、图像或 logo 之前，调用 `/media-use`，从 HeyGen 目录中解析 BGM/SFX/图像，并从品牌官方来源获取 logo。首先运行 `--adopt` 以登记现有素材。参阅 `/media-use` skill。

> **figma 来源**：如果来源是 figma.com URL，请先运行 `/figma`——按需导出素材、提取品牌 token，以及重建组件/故事板——然后基于其输出构建此工作流。不要通过原始 MCP 工具直接操作 Figma：这样会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录和品牌 token 的 `var()` 绑定，导致后续品牌变更若不完整重新导入便无法传播。

# 从产品发布到 HyperFrames

使用此 skill 来捕获产品、理解其品牌、规划发布视频，并在 HyperFrames 中逐帧构建视频。

> **入口是 `/hyperframes`。** 你是编排者。运行每个步骤，验证其关卡，并且只有在通过后才能继续下一步。此 skill 适用于**正在进行营销、发布、推广或揭晓的产品**，包括目的为推广时的“为我们的网站制作宣传片”等请求。网站导览/展示类请求也归于此处：`BRIEF.md` 会记录按原貌展示的意图，而捕获的屏幕画面将成为视频所展示的素材。任何其他意图、仅仅一句“制作一个视频”，或存在任何不确定性 → 请先阅读 `/hyperframes`——意图层负责所有路径决策，并且在没有 `BRIEF.md` 的情况下到达此处的新建请求无论如何都要先经过该层（Setup 的起始规则）。

你是编排者。在 `videos/<project>/` 中工作。按顺序运行各步骤，并在继续之前通过每个关卡。需要用户确认的步骤是步骤 0、步骤 3 和步骤 6。在执行步骤 0 之前阅读 `../hyperframes-core/references/brief-contract.md`——它定义了关卡类型，以及 `BRIEF.md` 的 `flow`/`storyboard` 如何推导出控制步骤 3/4/6 关卡的模式。除步骤 5 外，每一步都由你自己完成；在步骤 5 中，你需要为每一帧分派一个子代理。不要在此处加入设计或动效规则；这些规则位于 frame-worker 子代理、本 skill 的本地 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：步骤 0 设置 -> `hyperframes.json`；步骤 1 捕获 -> `capture/`；步骤 2 设计系统 -> `frame.md`；步骤 3 故事板/脚本 -> `STORYBOARD.md` 和 `SCRIPT.md`；步骤 3.1 音频 -> `audio_meta.json`；步骤 4 视觉设计 -> 扩充后的 `STORYBOARD.md`；步骤 5 帧 -> `compositions/frames/NN-*.html` 和 `index.html`；步骤 6 最终渲染 -> `renders/video.mp4`。

---

## 步骤 0：设置

目标：在已有已确认 brief 的情况下进入，创建 HyperFrames 项目，并持久保存该 brief。

**brief 由意图层确认，而不是通过在此处提问来确认。** 起始规则，按顺序执行：**(1)** `BRIEF.md` 存在 → 阅读它，不要询问任何问题——brief 已确定，其 `flow`/`storyboard` 会推导出模式（brief contract § 1）。**(2)** 没有 `BRIEF.md`，但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 根据故事板的 frontmatter 和已记录的偏好继续；切勿对一个构建到一半的项目重新盘问。**(3)** 两者都不存在——一个直接到达此处的新建请求 → 阅读 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：它会检查 recipes 和已记住的默认设置，执行此路径的问题流程（`../hyperframes/references/routes/product-launch-video.md`），并返回已锁定的 brief。编辑请求跳过以上所有流程——直接执行编辑。

仅当 `hyperframes.json` 缺失时才初始化。根据品牌或域名，以 kebab-case 格式命名 `<project>`，例如 `acme-promo`；切勿使用工作区名称或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=product-launch-video` — `init` 会将已安装的技能与 GitHub 上的最新版本进行比对，如果有任何技能已过期，则更新全局技能集。

初始化后，将 `<PROJECT_ROOT>` 设为 `videos/<project>`，并以该目录作为工作目录运行后续所有使用相对路径的命令。在以下命令中，`.` 表示 `<PROJECT_ROOT>`；切勿在调用方目录中写入 `.media`、`capture` 或输出文件。

**初始化后立即写入 `BRIEF.md`**（切勿在初始化之前写入——`init` 会拒绝非空目录）：这是意图层锁定的简报，其结构遵循 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` 技能目录。然后，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个由偏好支持的答案（`brief-format.md` 指明了所需的答案子集）。如果意图层采用了某个方案，请运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；该命令会将方案的 `frame.md` 复制到项目中（随后跳过步骤 2），并返回供步骤 3 起草使用的骨架。方案会填写答案，但不会代替审批；审核关卡仍然需要执行。

**在继续完成设置之后的步骤前，显示登录状态**——运行 `npx hyperframes auth status`，并逐字转达其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时说明如何登录。请注意退出码约定：`auth status` **在未登录时以状态码 1 退出**（存储的凭据被拒绝时同样如此）——这个非零退出码是正常的未登录状态，而不是命令失败，因此不要将其视为错误，不要重试，也不要以可能导致工作流中止的方式将其与 `&&`/`set -e` 串联。选择以下一个分支执行：

- **协作模式：** 等待用户登录，或明确选择 `offline` / `go`。
- **自主模式：** 说明当前状态，并继续使用可用的本地引擎。

当不存在离线提供程序时，不要悄无声息地省略必需的能力；应明确指出阻塞问题。不要将此决策并入其他问题，也不要将密钥写入每个仓库的 `.env`。身份验证归属和离线回退：`/media-use` `references/setup-providers.md` § 提供程序。

**关卡：** `hyperframes.json` 和 `BRIEF.md` 已存在；由偏好支持的答案已记录（简报契约 § 2）；登录状态已显示（已登录，或继续离线运行）。

---

## 步骤 1：采集素材

目标：为视频收集源材料、品牌信号和可用素材。

对输入进行分类并选择相应路径。明确的 URL -> 采集该 URL，并将网站用于旁白和素材。粘贴的脚本/简报 -> 将其逐字保存为 `user_script.txt`；`VO_MODE`（逐字照用或重构）取自 `BRIEF.md`——收到脚本时由意图层询问（仅当简报中不知何故缺少该项时，才在此询问一次）。然后确定采集目标：文本中有 URL -> 使用该 URL；只有品牌名称 -> 使用 `WebSearch`，用一行文字确认 URL，然后抓取；没有 URL/网站（或简报要求不要抓取）-> 采用不采集路径。

使用以下命令运行捕获：`npx hyperframes capture "<URL>" -o ./capture --json`。除非调用方的截止时间更短，否则保持默认的导航后预算；在这种情况下，传入一个正数值的 `--capture-budget <milliseconds>`，并为下游工作留出时间。`--timeout` 仅控制页面导航。仅当有意禁用可选的图像描述功能时，才使用 `--skip-vision`。

立即检查命令结果和输出目录。非零退出码、JSON 中的 `ok: false` 或 `capture/BLOCKED.md` 都是捕获路径的**硬性停止条件**：报告其中记录的原因，不要使用不完整的截图、DOM、令牌或资源。URL 捕获失败后，不要编造合成的无捕获后备方案。仅当原始需求已提供源材料，或用户在失败后明确改用所提供的截图或需求说明时，才继续执行无捕获路径。

诸如 `very little text content` 之类的警告与空的资源目录同时出现，并不能证明页面可用。对于网站导览或按原样展示的需求，必须有可信的已捕获结构或用户提供的截图；如果两者都没有，则停止。不要仅仅因为捕获不可用就虚构或重建页面。

对于网站导览或按原样展示的需求，捕获的页面是视觉上的事实来源。使用真实截图，而不是用 HTML 重建整个网站。如果画面需要内部运动，请将截图保留为基础，并在测量后的位置上叠加真实捕获的资源，或者只重建需要移动的那一个组件。对于滚动镜头，在 `capture/screenshots/full-page.png` 上为视口运动制作动画——这是整个文档的 1x 底图，可供 1920 宽的视口沿其向下移动，并保持像素级精确。当页面过高而无法一次性完整捕获时，该文件不会存在；请改用同一目录中相互重叠的滚动位置截图。如果要推近到超过 1:1，则应单独对该区域进行 2x 捕获，因为该底图在 1x 以上没有额外的分辨率余量。仅当用户明确要求风格化演绎时，才重建整个页面；捕获不可用本身并不构成授权。

如果存在 `GEMINI_API_KEY`、`GOOGLE_API_KEY` 或 OpenRouter 密钥，捕获过程会自动为资源生成描述，并写入 `capture/extracted/asset-descriptions.md`。这不是审核关卡。如果没有视觉模型密钥，请使用 DOM 上下文并继续。

无捕获路径：手动创建 `capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/`。`tokens.json` 应为 `{ "title": "", "description": "", "colors": [], "fonts": [] }`；如果可行，根据需求说明填写 title/description。`visible-text.txt` 包含完整的需求说明或脚本。除非用户提供了资源备注，否则 `asset-descriptions.md` 应注明未捕获任何资源。

**关卡：**捕获 JSON 报告 `ok: true`；`capture/BLOCKED.md` 不存在；`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/` 均存在；并且你能够用一句清晰的话说明品牌。将 `asset-descriptions.md` 视为主要的资源清单。如果在实际捕获后该文件缺失，请停止并报告捕获不完整。仅当此结构关卡仍然通过时，关于可选阶段降级的警告才可接受。

---

## 第 2 步：设计系统

目标：选择一个已提供的画框预设；脚本会将其转换为该视频的 `frame.md` 和字幕皮肤。

当 `BRIEF.md` 指定了 `style_preset` 时——用户已在意图层通过目视展示案例选定了它——直接使用该预设；只有简报未指定时，才由你作出判断。然后，你只需作出一个决定——**选择哪个预设**：阅读 `../hyperframes-creative/references/design-spec.md`，选择视觉效果最符合品牌和简报的预设。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

脚本会以确定性方式完成其余工作：将预设的 `FRAME.md` 复制为 `frame.md`，并根据 `capture/extracted/tokens.json` 中的品牌令牌对其进行**重新混合**（按角色将品牌颜色映射到预设的颜色键——墨色、画布色、强调色——同时保留键、结构和组件；将预设的展示字体和正文字体替换为品牌字体）；将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`；并执行自我验证（映射损坏时以状态码 1 退出）。脚本以状态码 0 退出后，立即进入下一步——不要手动编辑规范。

如果 `tokens.json` 中没有品牌颜色或字体（例如未执行采集），脚本会保留预设自身的调色板，形成一套完整、可交付的设计。如果简报指定了采集过程中遗漏的品牌颜色或字体，请在运行脚本前将其添加到 `capture/extracted/tokens.json`（或使用用户的 `design.md` 填充该文件）；只有在映射确实需要调整时，才在之后手动修改 `frame.md`。

**门禁条件：** `build-frame.mjs` 已以状态码 0 退出——`frame.md` 已基于某个具名预设生成，并且（当该预设附带字幕皮肤时）`.hyperframes/caption-skin.html` 已作为字幕皮肤源生成；所选预设已记录为偏好（`--key style_preset --workflow <this workflow>`，简报契约第 2 节）。

---

## 第 3 步：故事板和脚本

目标：将简报和采集的素材转化为经批准的逐帧故事方案。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、先价值后证据、将故事板视为提案）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用这些文档编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。根据简报中的 `length` 设置 frontmatter 的 `duration:`——这只是一个粗略预期；组装阶段会报告最终剪辑的实际时长与该预期的差异。

使用 `story-design.md` 确定故事蓝图、钩子、说服逻辑、节拍、`VO_MODE` 和素材选择。作为**软性指南**，参考 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单：对于每个节拍，如果存在合适的蓝图，请记录一个候选蓝图 ID。故事真实性仍然决定应包含哪些节拍——绝不要强行让节拍适配蓝图，也绝不要仅仅因为有经过验证的结构可用就凭空编造节拍。请从 `capture/extracted/asset-descriptions.md`（规范素材清单）中选择每个视觉画面的 `asset_candidates`——不要浏览原始的 `capture/assets/`。除非该清单缺失或不可用，否则不要让用户选择素材。使用故事板和脚本参考文档中明确要求的字段。

起草完成后，执行评审循环的计划审查阶段——`../hyperframes-core/references/review-loop.md` § 1：打开看板（不要询问是否要打开），以提案形式展示计划，并提出两个问题——批准还是修改，以及**先制作草图**（推荐）还是跳过。通过聊天或看板的评论文件反复收集反馈，直至获得批准。这是一个**检查点关卡**（简报契约 § 1）：在自主模式下，没有看板，也没有需要询问的问题——发布相同的摘要作为预告，然后继续；草图阶段合并到构建阶段，唯一的预览问题将在步骤 6 提出。

**关卡：** `STORYBOARD.md` 已存在，每个视觉帧都有 `asset_candidates`，需要旁白时 `SCRIPT.md` 已存在，并且用户已批准逐帧计划（自主模式：摘要已作为预告发布）。

---

## 步骤 3.1：音频

目标：根据已批准的脚本生成旁白、词语时间戳、音乐和音频元数据。

在步骤 3 获得批准后启动音频流程。让它在后台运行，然后继续执行步骤 4。

**调用之前，根据用户的要求选择旁白提供商和声音。** 使用 `--provider <provider>` 传入步骤 0 中选定的提供商（或设置 `HF_TTS_PROVIDER`）。如果请求中指定了声音、性别或语气，请选择匹配的声音 ID，并通过 `--voice <id>` 传入。否则，流水线默认使用 HeyGen 的 **Marcia（女性）** / Kokoro 的 `am_michael`——因此，除非传入该标志，否则像“男性声音”这样的请求会被无提示地忽略。声音 ID 因提供商而异；请根据步骤 0 的登录状态所选定的提供商进行解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）查询；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表查询（前缀 `am_`/`bm_` 表示男性，`af_`/`bf_` 表示女性）。当用户未表达偏好时，应先回退到记忆中的声音（简报契约 § 2），再回退到流水线默认值，并说明使用了哪一种声音；只有当两者都未指定声音时，才省略 `--voice`。当用户在本次运行中明确选择了声音时，记录该选择（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --provider <provider> --voice <voice-id> &`

音频脚本负责处理旁白、词语时间戳、从 HeyGen 音乐库中查找 BGM，以及生成时间元数据。BGM 的情绪取自故事板的 `music:` 字段；**`music: none` 会关闭 BGM**。该流程使用 HeyGen Audio API 进行检索，而非生成，并使用与 TTS 相同的 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白且不存在 `SCRIPT.md`，则跳过声音生成。如果故事板中指定了音乐情绪，BGM 仍可运行。

**规范的完全静音标记：** `STORYBOARD.md` 顶部 YAML 块中的 `music: none` **并且**不存在 `SCRIPT.md`。这一组合会将项目标记为静音——无旁白、无 BGM、无音效。`audio.mjs` 会识别该设置并且不生成任何内容（它会移除任何陈旧的 `audio_meta.json`；`audio_meta.json` 不存在时，assemble 会将其视为静音），因此可以干净地跳过步骤 3.1。当用户要求静音/无音乐视频时，请使用该标记——不要自行采用其他拼写。

**门禁条件：** 音频任务已启动，或项目被标记为静音（`music: none` + 不存在 `SCRIPT.md`）。

---

## 第 4 步：画面视觉设计

目标：为每个故事板帧添加视觉方向、布局意图和动效选择。

**先绘制故事板草图（仅协作模式）。** 方案一经批准，立即执行草图阶段——参见 `../hyperframes-core/references/review-loop.md` § 2（不要等待第 3.1 步；草图不使用时间信息）：亲自为每一帧绘制线框图，将每一帧标记为 `built`，在故事板全部完成后暂停并提出一个布局问题，然后仅修改被点名的草图，直到故事板得到确认。占位内容：使用带普通标签的区块表示待采集素材——真实文件将由第 5 步的工作进程提供。只有完成这些后，才能将下述视觉设计写入已确认的布局。在自主模式下，或者用户在第 3 步选择跳过草图时，跳过此阶段——各帧将在第 5 步直接从 `outline` 进入 `animated`。

就地编辑 `STORYBOARD.md`。不要创建另一个故事板。以 `frame.md` 作为颜色、字体、布局观感和风格的事实来源。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 中的方法（带时间码的镜头序列、内联 Layout 词汇以及必需的 `## Video direction` 区块）。使用 `../hyperframes-animation/blueprints-index.md` 选择每一帧的镜头形态。使用 `motion-language.md`（动效词汇 + 动效原则）和 `../hyperframes-animation/rules-index.md`（有效的规则名称）来设计动效——不要自行创造动效名称。

对于每个视觉帧，按照 `visual-design.md` 中的方法，将一个**带时间码的镜头序列**写入 `STORYBOARD.md`：选择该帧的蓝图（或进行组合），使用当前产品的内容将其实例化，并根据旁白安排每个 Scene 的呈现节奏，使该帧在完整持续时间内持续推进，而不是将内容集中在开头展示后便停滞不动。为每个 Scene **内联**注明布局和动效（词汇表见 `visual-design.md` 和 `motion-language.md`）。添加一个适用于整个视频的 `## Video direction` 区块。

当某个元素明显跨越帧边界延续时，在 `STORYBOARD.md` 中为两个工作进程提供相同的数值化衔接信息：在前一帧添加 `handoff_out:`，并在后一帧添加与之匹配的 `handoff_in:`。注明该元素及其在剪切点的精确 x/y 位置、缩放比例、不透明度以及运动方向/速度——即使某个字段没有变化，也要明确写出每个字段，因为常量应写作 `opacity: 1`，而不是省略。仅在刻意进行干净切换时才省略整个区块。目标很简单：并行工作进程不得为同一处接缝各自臆造两个不同版本。

不要更改故事、脚本、素材选择、`asset_candidates`、`transition_in` 或采集的源素材。此步骤中不要编写 HTML。

视觉设计锁定后，暂存具名素材：

`node <SKILL_DIR>/scripts/stage-assets.mjs --storyboard ./STORYBOARD.md --hyperframes .`

**门禁条件：** 每个视觉帧都包含带时间码的镜头序列，其呈现节奏与旁白相匹配（不得集中在开头）；存在 `## Video direction`；`assets/` 包含具名素材。协作模式：故事板草图已确认。

---

## 步骤 5：构建帧

目标：将每个故事板帧构建为 HTML 合成，并组装成可播放的视频。

如果已启动音频生成，请等待步骤 3.1 的音频完成。然后同步时长并获取音效；如果是静音视频，则跳过这两项。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械化流程：以实际语音时长为准；静音帧保留估算值；绝不要手动编辑同步后的时长。

组装前，请对照最终剪辑检查音乐。素材库中的曲目可能符合所要求的氛围，但开头却是一段安静的铺垫，削弱了短篇发布视频最初几秒的表现力。将开头与后续各个五秒片段进行比较；如果后面的某个片段具有更有力且在音乐结构上干净利落的起点，就从那里开始裁剪，并保留较短的淡入和较长的淡出。如果帧或旁白的时间安排发生变化，请根据新的最终时长重新进行此项检查，确保音乐不会提前结束，也不会在末尾留下静音。

分派任务前，请阅读 `../hyperframes-core/references/subagent-dispatch.md`。构建逐帧数据包和工作器角色载荷：

`node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

构建器会在 `.hyperframes/frame-packets/` 下为每一帧写入一个边界明确的数据包（该帧的完整故事板区块 + 蓝图正文 + 每条被引用的规则方案，全部内联），并写入 `_role.md`（由 `../hyperframes-core/references/frame-worker-core.md` + 此技能的 `sub-agents/frame-worker.md` 逐字拼接而成——即完整的工作器角色）。为每一帧分派一个子代理，尽可能并行执行；否则分批运行工作器。每个工作器只负责一帧：其提示词包含 `_role.md` 和该帧的数据包——可以完整粘贴二者，也可以提供这两个文件的路径，要求工作器首先读取（两种方式等效；无论采用哪种方式，工作器都只以这两份文档作为起点）——此外还要提供分派上下文，其中包含 `PROJECT_DIR`、`frame_id`、磁盘上是否存在该帧的**已确认草图**（工作器基于该布局进行视觉装饰，而不是重新绘制——参见帧工作器核心文档的 § When a confirmed sketch exists）、画布尺寸，以及字幕状态和保留区域（如果已启用字幕）。

工作器只读取自己的数据包和 `frame.md`；绝不打开 `STORYBOARD.md` 或技能文档（数据包已内联上游选定的内容）。每个工作器只写入 `compositions/frames/NN-*.html`。工作器绝不能编辑 `STORYBOARD.md`。

**全出血背景应放置在 `class="clip"` 图层上，绝不能放在 `#root` 上。** 每一帧的底图（色块／渐变／网格）都是其自身覆盖完整时长的背景剪辑——在 `#root` / `data-composition-id` 元素上设置的 `background` 会受到剪辑门控，仅在该帧的时间窗口内生效，因此不能作为可靠的底图；这可能导致深色内容落在黑色宿主 `body` 上，从而无法看见。视频的基础底色由组装器根据 `frame.md` 中的 `canvas` 颜色绘制到索引页的 `#root` 上。（完整规则及自检方法：`../hyperframes-core/references/frame-worker-core.md`。）

当每个工作进程返回结果时，编排器会在 `STORYBOARD.md` 中将对应帧标记为 `animated`。

音频时间信息生成后，在后台构建字幕并汇编索引：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在步骤 2 中复制）作为字幕样式，并注入来自 `frame.md` 的品牌令牌；如果没有样式文件，则渲染内置的默认胶囊样式。`captions: skipped (<reason>)` 是有效状态。明确跳过字幕时，无需字幕即可继续。

**关卡：** 每一帧都已标记为 `animated`（协作模式：草图板已在步骤 4 确认），`index.html` 已存在，并且字幕已构建或已明确跳过。

---

## 步骤 6：完成制作

目标：验证组装后的视频，获得用户批准，并渲染最终的 MP4。

注入转场、运行检查、暂停以供审阅，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints-and-each-cut-minus-0.1s-and-plus-0.2s>`

`snapshot` 会将捕获的帧拼接成一张接触表（`snapshots/contact-sheet.jpg`）。检查各帧中点处的画面是否存在布局问题，然后比较每个剪切点前后的两张图像。连续出现的元素必须保持所承诺的位置、缩放比例、不透明度和方向；渲染前修复所有肉眼可见的跳变。

如果命令失败，显示 stderr 并停止——不要连续堆叠恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

检查通过后，暂停以供用户审阅——审阅循环的最终确认（`../hyperframes-core/references/review-loop.md` § 4）：只问一个问题，并在自步骤 3 起一直保持打开的 Studio 中进行——现在渲染，还是需要哪些修改？（自主模式：保留的那个问题，先预览还是渲染。）然后交付 MP4，并附上接触表和帧 ID，以便将修改精确定位到单个帧。

预览：`npx hyperframes preview`

仅在用户批准后渲染（自主模式：在询问预览还是渲染之后）：

`npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户提出要求。

**关卡：** 渲染前 `lint` 和 `check` 已通过，且已检查快照；用户已在审阅暂停环节批准（自主模式：检查已通过，且交付内容包含接触表）；`renders/video.mp4` 已存在。最终回复中说明 MP4 路径和最终时长。

---

## 快速参考

**格式：** 横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080`——根据目标发布平台确定（简报约定 § 2）。仅在故事板前置元数据中设置一次格式。

**后台脚本：**该工作流仅在 `scripts/` 下提供以下脚本：`build-frame`，用于将帧预设采纳并进行品牌化重混，生成 `frame.md`（及字幕皮肤）；`audio`，用于 TTS、转录、BGM、音效和时长同步；`captions`；`transitions`，用于注入和验证；`stage-assets`，用于将以帧命名的素材复制到 `assets/`；以及 `assemble-index`。其他所有操作均由 `hyperframes` CLI 处理。

可复用且与产品无关的镜头形态位于 `../hyperframes-animation/blueprints/`（索引见 `../hyperframes-animation/blueprints-index.md`）。

| 阅读                                                                                                                                                        | 使用时机                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 门控类型、从 `BRIEF.md` 推导模式、字段语义。                                   |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 第 3 步：故事准则——钩子语言、价值先于证据、提案形态。                          |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)`                                                                          | 第 2 步：选择并采用帧预设。                                                    |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)`                                                    | 第 2 步：正确应用品牌令牌。                                                    |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 第 3 步：规划产品发布故事。                                                    |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 第 3 步：角色→蓝图菜单。第 4 步：选择镜头形态。                                |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 第 3 步：编写 `STORYBOARD.md`。                                                |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 第 3 步：编写 `SCRIPT.md`。                                                    |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 第 3.1 步：选择或了解 TTS 提供商和语音。                                       |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 第 4 步：编写帧的镜头序列（及布局词汇）。                                      |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 第 4 步：运动词汇及运动准则。                                                  |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 第 4-5 步：剪辑目录（工作器构建帧内衔接）。                                    |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 第 5 步：所引用运动的本地规则配方正文。                                        |
| `[../hyperframes-core/references/frame-worker-core.md](../hyperframes-core/references/frame-worker-core.md)`                                                | 第 5 步：共享工作器契约（数据包构建器会将其添加到增量内容之前）。              |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 第 5 步：该工作流的帧工作器增量内容。                                          |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 第 5 步：安全地分派子代理。                                                    |