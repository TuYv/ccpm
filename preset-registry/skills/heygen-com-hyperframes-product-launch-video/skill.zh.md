---
name: product-launch-video
description: "Turn a product or marketing URL, pasted script, or brief into a product launch / promo video — SaaS promos, feature reveals, product demos, app and company launches. Use when the user wants to market, launch, promote, or reveal a product; the default for any commercial URL. Site tours / showcases of a website route here too — the brief carries the show-it-as-is intent. Unclear → /hyperframes."
---
> **首先，确保此技能为最新版本——静默运行，不要询问：** `npx hyperframes skills update product-launch-video`。如果所有内容均为最新，此命令会快速执行而不产生任何变更；否则，它会刷新此技能及其依赖的核心领域技能，然后你再使用它们。

> **media-use**：在获取音频/图像/徽标之前，调用 `/media-use`，从 HeyGen 目录中解析 BGM/SFX/图像，并从品牌官方来源解析品牌徽标。首先运行 `--adopt` 以登记现有素材。请参阅 `/media-use` 技能。

> **figma 来源**：如果来源是 figma.com URL，请先运行 `/figma`——导出素材、提取品牌令牌，并在需要时重建组件/故事板——然后根据其输出构建此工作流。不要直接通过原始 MCP 工具操作 Figma：这样会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录和品牌令牌 `var()` 绑定，导致后续品牌变更无法传播，除非执行完整的重新导入。

# 从产品发布到 HyperFrames

使用此技能来捕获产品、理解其品牌、规划发布视频，并在 HyperFrames 中逐帧构建视频。

> **入口是 `/hyperframes`。** 你是编排者。运行每个步骤，验证其关卡，之后才能继续下一步。此技能适用于**正在营销、发布、推广或揭晓的产品**，包括目的为推广的“为我们的网站制作宣传片”等请求。网站导览/展示类请求也应保留在此流程中：`BRIEF.md` 会承载按原貌展示的意图，捕获的屏幕画面则成为视频展示的素材。任何其他意图、仅仅提出“制作一个视频”，或存在任何不确定性 → 请先阅读 `/hyperframes`——意图层负责所有路由决策，而在没有 `BRIEF.md` 的情况下进入此处的新建请求，无论如何都要先经过该层（即 Setup 的开场规则）。

你是编排者。在 `videos/<project>/` 中工作。按顺序运行各步骤，并在通过每个关卡后再继续。需要用户把关的步骤是 Step 0、Step 3 和 Step 6。在 Step 0 之前阅读 `../hyperframes-core/references/brief-contract.md`——它定义了关卡类型，以及 `BRIEF.md` 中的 `flow`/`storyboard` 如何派生出控制 Step 3/4/6 关卡的模式。除 Step 5 外，所有步骤均由你亲自完成；在 Step 5 中，你需要为每一帧分派一个子代理。不要在此处放置设计或动效规则；这些规则位于帧工作器子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：Step 0 设置 -> `hyperframes.json`；Step 1 捕获 -> `capture/`；Step 2 设计系统 -> `frame.md`；Step 3 故事板/脚本 -> `STORYBOARD.md` 和 `SCRIPT.md`；Step 3.1 音频 -> `audio_meta.json`；Step 4 视觉设计 -> 丰富后的 `STORYBOARD.md`；Step 5 帧 -> `compositions/frames/NN-*.html` 和 `index.html`；Step 6 最终渲染 -> `renders/video.mp4`。

---

## Step 0：设置

目标：在已有已确认简报的前提下进入流程，创建 HyperFrames 项目，并将简报持久化。

**简报由意图层确认，而不是通过在此处提问来确认。** 开场规则，按顺序执行：**(1)** `BRIEF.md` 存在 → 阅读它，不要询问任何问题——简报已确定，其 `flow`/`storyboard` 会派生出模式（简报契约 § 1）。**(2)** 不存在 `BRIEF.md`，但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 根据故事板的前置元数据和已记录的偏好恢复工作；绝不重新盘问一个已构建到一半的项目。**(3)** 两者都不存在——一个直接进入此处的新建请求 → 阅读 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：它会检查方案和已记住的默认设置，执行此路由的问题流程（`../hyperframes/references/routes/product-launch-video.md`），并返回已锁定的简报。编辑请求跳过上述所有流程——直接执行编辑。

仅当 `hyperframes.json` 缺失时才初始化。根据品牌或域名，以 kebab-case 格式命名 `<project>`，例如 `acme-promo`；绝不要使用工作区名称或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=product-launch-video` — `init` 会对照 GitHub 上的最新版本检查已安装的技能，如果有任何技能已过时，则更新全局技能集。

初始化后，将 `<PROJECT_ROOT>` 设为 `videos/<project>`，并以该目录作为工作目录运行后续所有使用相对路径的命令。在以下命令中，`.` 表示 `<PROJECT_ROOT>`；绝不要在调用方目录中写入 `.media`、`capture` 或输出文件。

**初始化后立即写入 `BRIEF.md`**（绝不要在初始化前写入——`init` 会拒绝非空目录）：这是意图层锁定的简报，其格式遵循 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` 技能目录。然后，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个有偏好设置依据的答案（`brief-format.md` 指明了相应的子集）。如果意图层采用了某个配方，请运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；它会将自身的 `frame.md` 复制到项目中（随后跳过步骤 2），并返回供步骤 3 起草使用的框架。配方会填写答案，但不会替代审批；审核关卡仍须执行。

**在继续执行设置之后的步骤前显示登录状态**——运行 `npx hyperframes auth status` 并逐字转述其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时说明如何登录。请注意退出代码约定：`auth status` **在未登录时退出码为 1**（存储的凭据被拒绝时也是如此）——这个非零退出码是正常的未登录状态，并非命令失败，因此不要将其视为错误，不要重试，也不要通过 `&&`/`set -e` 进行串联而导致工作流中止。根据情况执行以下一个分支：

- **协作模式：**等待用户登录，或明确选择 `offline` / `go`。
- **自主模式：**说明当前状态，并继续使用可用的本地引擎。

如果不存在离线提供商，不要悄然省略必需的能力；应明确指出阻塞因素。不要将此决定并入另一个问题，也不要将密钥写入每个仓库的 `.env`。有关身份验证归属和离线回退，请参阅：`/media-use` `references/setup-providers.md` § 提供商。

**关卡：**`hyperframes.json` 和 `BRIEF.md` 已存在；有偏好设置依据的答案已记录（简报约定 § 2）；已显示登录状态（已登录，或继续离线执行）。

---

## 步骤 1：采集素材

目标：收集视频所需的源材料、品牌信号和可用素材。

对输入进行分类并选择处理路径。明确的 URL -> 采集该 URL，并将该网站用于旁白和素材。粘贴的脚本/简报 -> 原样保存为 `user_script.txt`；`VO_MODE`（逐字照录或重构）来自 `BRIEF.md`——当收到脚本时，意图层会询问该项（仅当简报中不知为何缺少此项时，才在这里询问一次）。然后确定采集目标：文本中有 URL -> 使用该 URL；只有品牌名称 -> 使用 `WebSearch`，用一行内容确认 URL，然后抓取；没有 URL/网站（或简报要求不要抓取）-> 采用不采集路径。

使用以下命令运行捕获：`npx hyperframes capture "<URL>" -o ./capture --json`。除非调用方的截止时间更短，否则请保留默认的导航后预算；在这种情况下，传入一个正数形式的 `--capture-budget <milliseconds>`，为下游工作留出时间。`--timeout` 仅控制页面导航。只有在有意禁用可选的图像描述功能时，才使用 `--skip-vision`。

立即检查命令结果和输出目录。非零退出码、JSON `ok: false` 或存在 `capture/BLOCKED.md`，对于捕获路径而言都是**必须停止**的情况：报告其中记录的原因，并且不要使用不完整的截图、DOM、令牌或资源。URL 捕获失败后，不要编造合成的无捕获回退方案。只有当原始需求说明提供了源素材，或者用户在失败后明确切换为使用所提供的截图或需求说明时，才能继续采用无捕获路径。

`very little text content` 等警告与空的资源目录同时出现，并不能证明页面可用。对于网站导览或按原样展示的需求，必须有可信的已捕获结构或用户提供的截图；如果两者都没有，请停止。不要仅仅因为捕获结果不可用，就凭空构造或重建页面。

对于网站导览或按原样展示的需求，捕获到的页面是视觉效果的事实来源。请使用真实截图，而不是用 HTML 重建整个网站。如果画面需要内部运动，请将截图保留为基础，并在测量得到的位置叠加真实捕获的资源，或者仅重建需要运动的那一个组件。对于滚动镜头，让视口在 `capture/screenshots/full-page.png` 上移动——这是整个文档的 1x 图版，可让 1920 像素宽的视口以像素级精度沿其向下移动。当页面过高、无法一次性完整捕获时，该文件不会存在；请回退使用同一目录中的重叠滚动位置截图。若要推近到超过 1:1 的比例，应改用该区域单独的 2x 捕获，因为该图版在 1x 以上没有额外的分辨率余量。只有当用户明确要求风格化诠释时，才重建整个页面；仅仅因为捕获不可用，并不代表获得了重建授权。

如果存在 `GEMINI_API_KEY`、`GOOGLE_API_KEY` 或 OpenRouter 密钥，捕获过程会自动为资源生成描述，并写入 `capture/extracted/asset-descriptions.md`。这不是审核关卡。如果没有视觉模型密钥，请使用 DOM 上下文并继续。

无捕获路径：手动创建 `capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/`。`tokens.json` 应为 `{ "title": "", "description": "", "colors": [], "fonts": [] }`；如果可能，请根据需求说明填写标题和描述。`visible-text.txt` 包含完整的需求说明或脚本。除非用户提供了资源说明，否则 `asset-descriptions.md` 应注明未捕获任何资源。

**关卡：**捕获 JSON 报告 `ok: true`；`capture/BLOCKED.md` 不存在；`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/` 均存在；并且你能够用一句清晰的话说明品牌。将 `asset-descriptions.md` 作为主要资源清单。如果在真实捕获后该文件缺失，请停止并报告捕获不完整。只有当此结构关卡仍然通过时，关于可选阶段降级的警告才可以接受。

---

## 第 2 步：设计系统

目标：选择一个随附的画面预设；脚本会将其转换为该视频的 `frame.md` 和字幕皮肤。

当 `BRIEF.md` 指定了 `style_preset` 时——用户已在意图层根据展示示例直观选定它——请直接使用；只有当简报未指定时，才由你做出判断。然后你只需做出一个决定——**选择哪个预设**：阅读 `../hyperframes-creative/references/design-spec.md`，选择视觉效果最符合品牌和简报的预设。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

脚本会以确定性的方式完成其余工作：将预设的 `FRAME.md` 复制为 `frame.md`，并将其**重新混合**到 `capture/extracted/tokens.json` 中的品牌令牌上（按角色将品牌颜色映射到预设的颜色键——墨色、画布色、强调色——同时保留键、结构和组件；将预设的展示字体和正文字体替换为品牌字体），将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并进行自我验证（映射损坏时以 1 退出）。一旦它以 0 退出，立即进入下一步——不要手动编辑规范。

如果 `tokens.json` 中没有品牌颜色或字体（例如没有进行采集），脚本会保留预设自身的调色板，形成一套完整且可交付的设计。如果简报指定了采集时遗漏的品牌颜色或字体，请在运行脚本前将其添加到 `capture/extracted/tokens.json`（或者使用用户的 `design.md` 填充该文件）；只有当映射确实需要调整时，才在之后手动修改 `frame.md`。

**关卡：** `build-frame.mjs` 已以 0 退出——`frame.md` 已由一个具名预设生成，并且（当该预设随附字幕皮肤时）`.hyperframes/caption-skin.html` 已作为字幕皮肤源存在；所选预设已记录为偏好（`--key style_preset --workflow <this workflow>`，简报契约 § 2）。

---

## 第 3 步：故事板和脚本

目标：将简报和采集的素材转化为经批准的逐帧故事计划。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、价值先于证据、将故事板作为提案、视觉内容可追溯至来源）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用这些内容编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。根据简报中的 `length` 设置前置元数据中的 `duration:`——这只是粗略预期；组装阶段会报告最终剪辑时长与该预期的差异。

使用 `story-design.md` 确定故事蓝图、钩子、说服逻辑、节拍、`VO_MODE` 和素材选择。作为**非强制性指南**，请参考 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单：对于每个节拍，如果存在合适的蓝图，请记录一个候选蓝图 ID。故事本身的真实性仍然决定应包含哪些节拍——绝不要强迫某个节拍去适配蓝图，也绝不要仅仅因为有成熟的结构可用就凭空创造节拍。从 `capture/extracted/asset-descriptions.md`（规范素材清单）中为每个视觉画面选择 `asset_candidates`——不要浏览原始的 `capture/assets/`。除非该清单缺失或不可用，否则不要让用户选择素材。使用故事板和脚本参考文档中明确要求的字段。

完成草拟后，执行审查循环的计划阶段——`../hyperframes-core/references/review-loop.md` § 1：打开看板（不要询问是否打开），以提案形式呈现计划，并询问两个问题——批准还是修改，以及是**先制作草图**（推荐）还是跳过。反馈通过聊天或看板的评论文件循环处理，直至获得批准。这是一个**检查点门禁**（简报约定 § 1）：在自主模式下没有看板，也无需询问任何问题——发布相同的摘要作为预先告知，然后继续；草图阶段并入构建过程，唯一的预览问题将在步骤 6 提出。

**门禁：**`STORYBOARD.md` 已存在，每个视觉帧都有 `asset_candidates`，需要旁白时 `SCRIPT.md` 已存在，并且用户已批准逐帧计划（自主模式：摘要已作为预先告知发布）。

---

## 步骤 3.1：音频

目标：根据已批准的脚本生成旁白、单词时间点、音乐和音频元数据。

在步骤 3 获得批准后开始处理音频。在后台运行音频处理，然后继续执行步骤 4。

**调用前，应根据用户的要求选择旁白提供商和声音。**使用 `--provider <provider>` 传入步骤 0 中选定的提供商（或设置 `HF_TTS_PROVIDER`）。如果请求指定了声音、性别或语气，请选择匹配的声音 ID，并使用 `--voice <id>` 传入。否则，流水线默认使用 HeyGen 上的 **Marcia（女性）** / Kokoro 上的 `am_michael`——因此，除非传入该标志，否则像“男性声音”这样的请求会被悄然忽略。声音 ID 因提供商而异；请根据步骤 0 的登录状态所选定的提供商进行解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表（前缀 `am_`/`bm_` 表示男性，`af_`/`bf_` 表示女性）。如果用户未表达偏好，请先使用已记住的声音（简报约定 § 2），然后才回退到流水线默认声音，并说明所使用的声音；只有在两者均未指定声音时，才省略 `--voice`。如果用户在本次运行中明确选择了声音，请记录该选择（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --provider <provider> --voice <voice-id> &`

音频脚本负责处理旁白、单词时间点、从 HeyGen 音乐库中查找背景音乐，以及时间元数据。背景音乐的情绪取自故事板的 `music:` 字段；**`music: none` 会关闭背景音乐**。这里使用 HeyGen Audio API 进行检索，而非生成，并使用与 TTS 相同的 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白且没有 `SCRIPT.md`，请跳过语音生成。如果故事板中设置了音乐情绪，背景音乐仍可继续处理。

**规范的完全静音标记：**`STORYBOARD.md` 顶部 YAML 块中的 `music: none` **并且**不存在 `SCRIPT.md`。这一组合表示项目为静音——没有旁白、背景音乐或音效。`audio.mjs` 会识别该组合并且不生成任何内容（它会移除任何过期的 `audio_meta.json`；缺少 `audio_meta.json` 正是 assemble 将其视为静音的依据），因此步骤 3.1 可以直接跳过。当用户要求制作静音/无音乐视频时，请使用这一组合——不要自行创造其他写法。

**关卡：** 音频任务已启动，或项目被标记为静音（`music: none` + 无 `SCRIPT.md`）。

---

## 步骤 4：画面视觉设计

目标：为每个故事板帧添加视觉方向、布局意图和动效选择。

**先绘制故事板草图（仅协作模式）。** 方案一经批准，立即执行草图阶段——参见 `../hyperframes-core/references/review-loop.md` § 2（无需等待步骤 3.1；草图不使用时间信息）：亲自为每一帧绘制线框图，将每一帧标记为 `built`，故事板填满后暂停并提出唯一一个布局问题，然后只修改被点名的草图，直到故事板得到确认。占位内容：为捕获的素材使用带有简单标签的区块——真实文件将由步骤 5 的工作进程提供。只有在此之后，才将下述视觉设计写入已确认的布局。在自主模式下，或用户在步骤 3 选择跳过草图时，跳过此阶段——各帧将在步骤 5 中直接从 `outline` 进入 `animated`。

直接编辑 `STORYBOARD.md`。不要创建另一个故事板。以 `frame.md` 作为颜色、字体、布局感受和风格的事实来源。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 中的方法（带时间码的镜头序列、内联 Layout 词汇，以及必需的 `## Video direction` 区块）。使用 `../hyperframes-animation/blueprints-index.md` 为每一帧选择镜头形态。使用 `motion-language.md`（动效词汇 + 动效准则）和 `../hyperframes-animation/rules-index.md`（有效的规则名称）来设计动效——不要自行创造动效名称。

对于每个视觉帧，按照 `visual-design.md` 中的方法，将一个**带时间码的镜头序列**写入 `STORYBOARD.md`：选择该帧的蓝图（或进行组合），使用当前产品的内容将其实例化，并让每个 Scene 的呈现节奏与旁白保持一致，使该帧在整个持续时间内逐步展开，而不是将内容集中在开头呈现后便保持静止。为每个 Scene **以内联方式**注明布局和动效（词汇见 `visual-design.md` 和 `motion-language.md`）。添加一个适用于整段视频的 `## Video direction` 区块。

当某个元素明显跨越帧边界延续时，在 `STORYBOARD.md` 中为两个工作进程提供相同的数值化交接信息：在传出帧中添加 `handoff_out:`，并在传入帧中添加与之匹配的 `handoff_in:`。注明该元素及其在切换点的精确 x/y 位置、缩放比例、不透明度，以及运动方向/速度——即使某个字段没有变化，也要明确写出每个字段，因为常量应写为 `opacity: 1`，而不是省略。只有在有意使用干净切换时，才省略整个区块。目标很简单：并行工作进程不得为同一个衔接处自行创建两个不同的版本。

不要更改故事、脚本、素材选择、`asset_candidates`、`transition_in` 或捕获的源素材。此步骤中不要编写 HTML。

视觉设计锁定后，暂存已命名的素材：

`node <SKILL_DIR>/scripts/stage-assets.mjs --storyboard ./STORYBOARD.md --hyperframes .`

**关卡：** 每个视觉帧都包含一个带时间码的镜头序列，其呈现节奏与旁白保持一致（不得集中在开头呈现）；存在 `## Video direction`；`assets/` 包含已命名的素材。协作模式：故事板草图已确认。

---

## 步骤 5：构建帧

目标：将每个故事板帧构建为 HTML 构图，并组装成可播放的视频。

如果已启动音频生成，请等待步骤 3.1 的音频处理完成。然后同步时长并获取音效；如果是静音视频，则跳过这两项。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械式的：以实际语音时长为准；静音帧保留估算时长；切勿手动编辑同步后的时长。

组装前，根据最终剪辑检查音乐。素材库中的曲目可能符合要求的情绪，但开头可能是一段安静的渐进，从而削弱短篇发布视频最初几秒的效果。将开头与后续的五秒片段进行比较；如果后面的某个片段拥有更有力且音乐衔接干净的起点，就从那里开始裁剪，并保留较短的淡入和较长的淡出。如果帧或旁白的时间发生变化，请根据新的最终时长重新检查，确保音乐不会提前结束，也不会在尾部留下静音。

分派前，请阅读 `../hyperframes-core/references/subagent-dispatch.md`。构建逐帧数据包和工作器角色载荷：

`node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

构建器会在 `.hyperframes/frame-packets/` 下为每一帧写入一个范围明确的数据包（包含该帧的精确故事板区块 + 蓝图正文 + 每一条被引用的规则方案，全部内联），并写入 `_role.md`（将 `../hyperframes-core/references/frame-worker-core.md` 与此技能的 `sub-agents/frame-worker.md` 逐字拼接——即完整的工作器角色）。为每一帧分派一个子代理，尽可能并行执行；否则分批运行工作器。每个工作器只处理一帧：其提示中包含 `_role.md` 和该帧的数据包——可以将两者完整粘贴进去，也可以提供这两个文件路径，让工作器先行读取（两者等效；无论采用哪种方式，工作器都严格从这两份文档开始）——此外还应包含分派上下文，其中包括 `PROJECT_DIR`、`frame_id`、磁盘上是否存在该帧的**已确认草图**（工作器会基于该布局进行视觉装饰，而不是重新绘制——参见 frame-worker core § 存在已确认草图时）、画布尺寸，以及字幕状态；如果启用了字幕，还包括避让带。

工作器只读取自己的数据包和 `frame.md`；绝不打开 `STORYBOARD.md` 或技能文档（数据包已经内联了上游所选内容）。每个工作器只写入 `compositions/frames/NN-*.html`。工作器绝不能编辑 `STORYBOARD.md`。

**全出血背景应位于 `class="clip"` 图层上，绝不能位于 `#root` 上。** 帧的底层背景（色块／渐变／网格）应是其自身覆盖完整时长的背景剪辑——在 `#root`／`data-composition-id` 元素上设置的 `background` 会受剪辑限制，仅在该帧的时间窗口内生效，因此不能作为可靠的底层背景；这可能导致深色内容落在黑色宿主 `body` 上，渲染后不可见。视频的基础底色由组装器从 `frame.md` 的 `canvas` 颜色中读取，并绘制到索引页的 `#root` 上。（完整规则 + 自检：`../hyperframes-core/references/frame-worker-core.md`。）

每当一个工作器返回结果时，编排器都会在 `STORYBOARD.md` 中将对应帧标记为 `animated`。

音频时间信息生成后，在后台构建字幕并组装索引：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在步骤 2 中复制）作为字幕外观，并注入来自 `frame.md` 的品牌令牌；如果不存在皮肤，则渲染内置的默认胶囊样式。`captions: skipped (<reason>)` 是有效状态。明确跳过字幕时，继续执行。

**关卡：** 每一帧都已标记为 `animated`（协作模式：草图板已在步骤 4 确认），`index.html` 存在，并且字幕已构建或已明确跳过。

---

## 步骤 6：完成制作

目标：验证组装后的视频、获得用户批准，并渲染最终 MP4。

注入转场、运行检查、暂停以供审阅，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints-and-each-cut-minus-0.1s-and-plus-0.2s>`

`snapshot` 会将捕获的帧拼接成一张联系表（`snapshots/contact-sheet.jpg`）。检查各帧中点处的画面是否存在布局问题，然后比较每个剪切点前后的两张图像。连续出现的元素必须保持承诺的位置、缩放比例、不透明度和方向；渲染前修复任何可见的跳变。

如果某个命令失败，显示 stderr 并停止——不要连续堆叠恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

检查通过后，暂停以供用户审阅——使用自步骤 3 起一直保持打开状态的 Studio，执行审阅循环的最终查看（`../hyperframes-core/references/review-loop.md` § 4）：只问一个问题——现在渲染，还是需要哪些修改？（自主模式：保留的唯一问题是，先预览还是直接渲染。）然后交付 MP4，同时提供联系表和帧 ID，以便修订可以精准定位到单个帧。

预览：`npx hyperframes preview --background`

仅在用户批准后渲染（自主模式：在提出“预览还是渲染”的问题后）：

`npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户提出要求。

**关卡：** 渲染前，`lint` 和 `check` 已通过，并且快照已检查；用户已在审阅暂停环节批准（自主模式：检查已通过，并且交付内容包含联系表）；`renders/video.mp4` 存在。最终回复需说明 MP4 路径和最终时长。

---

## 快速参考

**格式：** 横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080`——根据发布目标确定（需求简报契约 § 2）。仅在故事板 frontmatter 中设置一次格式。

**后台脚本：**该工作流仅在 `scripts/` 下提供以下脚本：`build-frame`，用于采用帧预设并进行品牌化重混，将其写入 `frame.md`（并包含字幕皮肤）；`audio`，用于 TTS、转录、BGM、音效和时长同步；`captions`；`transitions`，用于注入和验证；`stage-assets`，用于将以帧命名的资源复制到 `assets/`；以及 `assemble-index`。其他所有工作均由 `hyperframes` CLI 处理。

可复用且与产品无关的镜头形态位于 `../hyperframes-animation/blueprints/` 中（索引见 `../hyperframes-animation/blueprints-index.md`）。

| 阅读                                                                                                                                                        | 时机                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 门控类型、根据 `BRIEF.md` 推导模式、字段语义。                                                           |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 第 3 步：故事准则——钩子语言、价值先于证据、提案形态、可追溯来源的视觉内容。                              |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)`                                                                          | 第 2 步：选择并采用帧预设。                                                                              |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)`                                                    | 第 2 步：正确应用品牌令牌。                                                                              |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 第 3 步：规划产品发布故事。                                                                              |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 第 3 步：角色→蓝图菜单。第 4 步：选择镜头形态。                                                         |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 第 3 步：编写 `STORYBOARD.md`。                                                                          |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 第 3 步：编写 `SCRIPT.md`。                                                                              |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 第 3.1 步：选择或了解 TTS 提供商和语音。                                                                 |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 第 4 步：编写帧的镜头序列（以及布局词汇）。                                                              |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 第 4 步：动效词汇与动效准则。                                                                            |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 第 4-5 步：切换目录（工作器构建帧内接缝）。                                                              |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 第 5 步：所引用动效的本地规则配方正文。                                                                  |
| `[../hyperframes-core/references/frame-worker-core.md](../hyperframes-core/references/frame-worker-core.md)`                                                | 第 5 步：共享工作器契约（数据包构建器会将其添加到增量内容之前）。                                        |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 第 5 步：该工作流的帧工作器增量内容。                                                                    |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 第 5 步：安全分派子代理。                                                                                |