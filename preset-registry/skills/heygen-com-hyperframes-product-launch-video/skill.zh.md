---
name: product-launch-video
description: "Turn a product or marketing URL, pasted script, or brief into a product launch / promo video — SaaS promos, feature reveals, product demos, app and company launches. Use when the user wants to market, launch, promote, or reveal a product; the default for any commercial URL. Site tours / showcases of a website route here too — the brief carries the show-it-as-is intent. Unclear → /hyperframes."
---
> **首先，请保持此技能为最新状态——运行前先征得用户确认：** `npx hyperframes skills update product-launch-video`。如果所有内容均为最新版本，此命令会快速完成且不执行任何操作；否则，它会刷新此技能及其依赖的核心领域技能，然后你再使用它们。

> **media-use**：在获取音频、图像或徽标之前，调用 `/media-use`，从 HeyGen 目录中解析 BGM/SFX/图像，并从品牌官方来源获取徽标。首先运行 `--adopt` 以登记现有素材。请参阅 `/media-use` 技能。

> **figma 来源**：如果来源是 figma.com URL，请先运行 `/figma`——根据需要执行素材导出、品牌令牌提取，以及组件/故事板重建——然后基于其输出构建此工作流。不要直接通过原始 MCP 工具操作 Figma：这样会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录和品牌令牌 `var()` 绑定，导致后续品牌变更无法在不完整重新导入的情况下传播。

# 从产品发布到 HyperFrames

使用此技能来捕获产品、了解其品牌、规划发布视频，并在 HyperFrames 中逐帧构建视频。

> **入口是 `/hyperframes`。** 你是编排者。运行每个步骤，验证其关卡，只有通过后才能继续下一步。此技能适用于**正在被营销、发布、推广或揭晓的产品**，包括用途为推广的“为我们的网站制作宣传视频”之类的请求。网站导览/展示类请求也归入此处：`BRIEF.md` 会记录按原样展示的意图，而捕获的屏幕画面则成为视频所展示的素材。任何其他意图、仅仅一句“制作一个视频”，或任何不确定情况 → 先阅读 `/hyperframes`——意图层负责所有路由决策，而且没有 `BRIEF.md` 的新建请求即使直接到达这里，也仍需经过该层（即设置步骤的开场规则）。

你是编排者。在 `videos/<project>/` 中工作。按顺序运行各步骤，并在继续之前通过每个关卡。需要用户确认的步骤是步骤 0、步骤 3 和步骤 6。在步骤 0 之前阅读 `../hyperframes-core/references/brief-contract.md`——它定义了关卡类型，以及如何根据 `BRIEF.md` 的 `flow`/`storyboard` 推导出控制步骤 3/4/6 关卡的模式。除步骤 5 外，所有步骤均由你亲自完成；在步骤 5 中，你要为每一帧分派一个子代理。不要在此处加入设计或动效规则；这些规则位于帧工作器子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：步骤 0 设置 -> `hyperframes.json`；步骤 1 捕获 -> `capture/`；步骤 2 设计系统 -> `frame.md`；步骤 3 故事板/脚本 -> `STORYBOARD.md` 和 `SCRIPT.md`；步骤 3.1 音频 -> `audio_meta.json`；步骤 4 视觉设计 -> 丰富后的 `STORYBOARD.md`；步骤 5 帧 -> `compositions/frames/NN-*.html` 和 `index.html`；步骤 6 最终渲染 -> `renders/video.mp4`。

---

## 步骤 0：设置

目标：在简报已确认的前提下开始，创建 HyperFrames 项目，并将简报持久化。

**简报由意图层确认，而不是通过在此处提问来确认。** 开场规则依次为：**(1)** `BRIEF.md` 存在 → 读取它且不提出任何问题——简报已确定，其 `flow`/`storyboard` 会推导出相应模式（简报契约第 1 节）。**(2)** 不存在 `BRIEF.md`，但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 根据故事板的前置元数据和已记录的偏好恢复工作；绝不要重新盘问一个构建到一半的项目。**(3)** 两者都不存在——一个直接到达此处的新建请求 → 阅读 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：它会检查方案和已记住的默认设置，提出此路由所需的问题（`../hyperframes/references/routes/product-launch-video.md`），并返回已锁定的简报。编辑请求跳过所有这些步骤——直接执行编辑。

仅当 `hyperframes.json` 缺失时才初始化。根据品牌或域名，以 kebab-case 格式命名 `<project>`，例如 `acme-promo`；绝不能使用工作区名称或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=product-launch-video` — `init` 会将已安装的技能与 GitHub 上的最新版本进行比较，如果有任何技能已过时，则更新全局技能集。

初始化后，将 `<PROJECT_ROOT>` 设为 `videos/<project>`，并以该目录作为工作目录运行之后的每条相对路径命令。在以下命令中，`.` 表示 `<PROJECT_ROOT>`；绝不能在调用方目录中写入 `.media`、`capture` 或输出文件。

**初始化后立即写入 `BRIEF.md`**（绝不能在初始化之前写入——`init` 会拒绝非空目录）：这是意图层锁定的简报，结构遵循 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` 技能目录。然后，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个由偏好支持的答案（`brief-format.md` 指定了相应的子集）。如果意图层采用了某个方案，请运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；该命令会将其 `frame.md` 复制到项目中（随后跳过第 2 步），并返回供第 3 步起草时使用的框架。方案会填充答案，但不会代替审批；审核关卡仍然需要执行。

**在继续完成设置阶段之前显示登录状态**——运行 `npx hyperframes auth status` 并逐字转述其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时说明如何登录。请注意退出代码约定：`auth status` **在未登录时以状态码 1 退出**（存储的凭据被拒绝时也是如此）——这个非零退出状态是正常的未登录状态，并不表示命令失败，因此不要将其视为错误，不要重试，也不要通过 `&&`/`set -e` 进行串联而导致工作流中止。根据情况应用以下一个分支：

- **协作式：**等待用户登录，或明确选择 `offline` / `go`。
- **自主式：**说明当前状态，并继续使用可用的本地引擎。

当不存在离线提供商时，不要默默省略所需能力；应明确指出阻塞问题。不要将此决定并入其他问题，也不要将密钥写入每个仓库的 `.env`。有关身份验证归属和离线回退，请参阅：`/media-use` `references/setup-providers.md` § 提供商。

**关卡：**`hyperframes.json` 和 `BRIEF.md` 已存在；由偏好支持的答案已记录（简报契约 § 2）；已显示登录状态（已登录，或继续离线执行）。

---

## 第 1 步：采集素材

目标：收集视频所需的源材料、品牌信号和可用素材。

对输入进行分类并选择相应路径。明确的 URL -> 采集该 URL，并将网站用于旁白和素材。粘贴的脚本/简报 -> 原样保存为 `user_script.txt`；`VO_MODE`（逐字照读或重构）来自 `BRIEF.md`——意图层会在收到脚本时询问这一点（仅当简报由于某种原因缺少该项时，才在此处询问一次）。然后确定采集目标：文本中有 URL -> 使用该 URL；仅有品牌名称 -> 使用 `WebSearch`，用一行内容确认 URL，然后进行抓取；没有 URL/网站（或简报说明不要抓取）-> 采用不采集路径。

使用以下命令运行捕获：`npx hyperframes capture "<URL>" -o ./capture --json`。除非调用方的截止时间更短，否则保留默认的导航后预算；如果截止时间更短，则传入一个正数形式的 `--capture-budget <milliseconds>`，并为下游工作预留时间。`--timeout` 仅控制页面导航。仅当有意禁用可选的图像描述功能时，才使用 `--skip-vision`。

立即检查命令结果和输出目录。非零退出码、JSON 中的 `ok: false` 或存在 `capture/BLOCKED.md`，对于捕获路径而言都是**硬性停止条件**：报告其中记录的原因，并且不要使用不完整的截图、DOM、令牌或资产。URL 捕获失败后，不要凭空构造一个合成的无捕获回退方案。只有当原始需求已提供源材料，或者用户在失败后明确改为使用所提供的截图或需求说明时，才能继续执行无捕获路径。

出现 `very little text content` 之类的警告并且资产目录为空，并不能证明页面可用。对于网站导览或按原样展示的需求，必须有可信的已捕获结构或用户提供的截图；如果两者都没有，则停止。不要仅仅因为捕获结果不可用，就凭空构造或重建页面。

对于网站导览或按原样展示的需求，捕获的页面是视觉上的事实依据。使用真实截图，而不是用 HTML 重建整个网站。如果画面需要局部运动，请保留截图作为底图，并将真实捕获的资产按测量得到的位置叠加在其上，或者只重建发生运动的那一个组件。对于滚动镜头，在 `capture/screenshots/full-page.png` 上为视口设置动画——这是整个文档的 1x 底图，可让 1920 像素宽的视口沿页面向下移动，并保持像素级精确。当页面过高、无法一次性完整捕获时，该文件不会存在；此时应回退到同一目录中的重叠滚动位置截图。如果要推近到超过 1:1 的比例，则应单独对该区域进行 2x 捕获，因为该底图在 1x 以上没有可供放大的余量。只有当用户明确要求风格化诠释时，才重建整个页面；仅仅捕获不可用，并不构成重建授权。

如果存在 `GEMINI_API_KEY`、`GOOGLE_API_KEY` 或 OpenRouter 密钥，捕获工具会自动为资产生成描述并写入 `capture/extracted/asset-descriptions.md`。这不是审核关卡。没有视觉模型密钥时，使用 DOM 上下文并继续。

无捕获路径：手动创建 `capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/`。`tokens.json` 应为 `{ "title": "", "description": "", "colors": [], "fonts": [] }`；尽可能根据需求说明填写标题和描述。`visible-text.txt` 包含完整的需求说明或脚本。除非用户提供了资产备注，否则 `asset-descriptions.md` 应说明未捕获任何资产。

**关卡：**捕获 JSON 报告 `ok: true`；`capture/BLOCKED.md` 不存在；`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/` 均存在；并且你能用一句清晰的话说明品牌。将 `asset-descriptions.md` 视为主要的资产清单。如果实际捕获后缺少该文件，请停止并报告捕获不完整。只有在该结构性关卡仍然通过时，才可以接受有关可选阶段降级的警告。

---

## 第 2 步：设计系统

目标：选择一个随附的画面预设；脚本会将其转换为该视频的 `frame.md` 和字幕皮肤。

当 `BRIEF.md` 指定了 `style_preset` 时——用户已在意图层通过查看展示示例选定了它——请使用该预设；只有当简报未指定时，才由你自行判断。然后你只需做出一个决定——**选择哪个预设**：阅读 `../hyperframes-creative/references/design-spec.md`，并选择视觉风格最符合品牌和简报的预设。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

脚本会以确定性的方式完成其余工作：将预设的 `FRAME.md` 复制为 `frame.md`，并根据 `capture/extracted/tokens.json` 中的品牌令牌对其进行**重新混合**（按角色将品牌颜色映射到预设的颜色键——墨色、画布色、强调色——同时保留键、结构和组件；将预设的展示字体和正文字体替换为品牌字体），将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并执行自我验证（映射损坏时以状态码 1 退出）。一旦脚本以状态码 0 退出，就立即进入下一步——不要手动编辑规范。

如果 `tokens.json` 中没有品牌颜色或字体（例如没有执行捕获），脚本会保留预设自身的调色板，从而得到一套完整、可交付的设计。如果简报指定了捕获过程中遗漏的品牌颜色或字体，请在运行脚本前将它们添加到 `capture/extracted/tokens.json`（或者使用用户的 `design.md` 填充该文件）；只有当映射确实需要调整时，才在之后手动修改 `frame.md`。

**门禁条件：** `build-frame.mjs` 已以状态码 0 退出——`frame.md` 已基于某个具名预设生成，并且（当该预设随附字幕皮肤时）`.hyperframes/caption-skin.html` 已作为字幕皮肤源存在；所选预设已被记录为偏好设置（`--key style_preset --workflow <this workflow>`，简报契约 § 2）。

---

## 第 3 步：故事板与脚本

目标：将简报和捕获的素材转化为经批准的逐画面故事方案。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、价值先于证据、将故事板视为提案、视觉素材可追溯至来源）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用这些文档编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。根据简报中的 `length` 设置 frontmatter 的 `duration:`——这只是一个粗略预期；组装阶段会报告最终剪辑与该预期的偏差。

使用 `story-design.md` 确定故事蓝图、钩子、说服逻辑、节拍、`VO_MODE` 和素材选择。将 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单作为**灵活参考**：对于每个节拍，如果存在适合的蓝图，请注明候选蓝图 ID。故事本身的真实性仍决定应包含哪些节拍——绝不要强行让某个节拍适配蓝图，也不要仅仅因为存在一种经过验证的结构就凭空编造节拍。从 `capture/extracted/asset-descriptions.md`（规范素材清单）中选择每个视觉画面的 `asset_candidates`——不要浏览原始的 `capture/assets/`。除非该清单缺失或无法使用，否则不要让用户选择素材。严格使用故事板和脚本参考文档中要求的字段。

起草完成后，执行审查循环的计划阶段——`../hyperframes-core/references/review-loop.md` § 1：打开画板（不要询问是否打开），以提案形式展示计划，并提出两个问题——批准还是修改，以及**先做草图**（推荐）还是跳过。反馈通过聊天或画板的评论文件循环处理，直至获得批准。这是一个**检查点关卡**（简报约定 § 1）：在自主模式下，没有画板，也无需询问——将同一份摘要作为预先通知发布，然后继续；草图阶段合并到构建阶段，唯一的预览问题将在步骤 6 提出。

**关卡：** `STORYBOARD.md` 已存在，每个视觉帧都有 `asset_candidates`，需要旁白时 `SCRIPT.md` 已存在，并且用户已批准逐帧计划（自主模式：摘要已作为预先通知发布）。

---

## 步骤 3.1：音频

目标：根据已批准的脚本生成旁白、字词时间点、音乐和音频元数据。

在步骤 3 获得批准后启动音频处理。让它在后台运行，然后继续执行步骤 4。

**调用前，根据用户的要求选择旁白提供商和声音。** 使用 `--provider <provider>` 传入步骤 0 中选定的提供商（或设置 `HF_TTS_PROVIDER`）。如果请求中指定了声音、性别或语气，请选择匹配的声音 ID，并使用 `--voice <id>` 传入。否则，流水线默认在 HeyGen 上使用 **Marcia（女声）**，在 Kokoro 上使用 `am_michael`——因此，除非传入该参数，否则像“男声”这样的请求会被悄然忽略。声音 ID 因提供商而异；请根据步骤 0 的登录状态所选定的提供商进行查找：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表（前缀 `am_`/`bm_` 表示男声，`af_`/`bf_` 表示女声）。当用户未表达偏好时，应先回退到已记住的声音（简报约定 § 2），再回退到流水线默认值，并说明使用了哪个声音；只有在两者都未指定声音时，才省略 `--voice`。当用户在本次运行中明确选择了声音时，记录该选择（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --provider <provider> --voice <voice-id> &`

音频脚本负责处理旁白、字词时间点、从 HeyGen 音乐库中查找 BGM，以及生成时间元数据。BGM 的氛围取自故事板的 `music:` 字段；**`music: none` 会关闭 BGM**。这里使用 HeyGen Audio API 进行检索，而不是生成，并且与 TTS 使用相同的 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白且不存在 `SCRIPT.md`，则跳过语音生成。如果故事板中指定了音乐氛围，BGM 仍可运行。

**标准的完全静音标记：** `STORYBOARD.md` 顶部 YAML 块中的 `music: none`，**并且**不存在 `SCRIPT.md`。这一组合将项目标记为静音——无旁白、无 BGM、无音效。`audio.mjs` 能识别这一标记，并且不会生成任何内容（它会移除所有过期的 `audio_meta.json`；缺少 `audio_meta.json` 正是 assemble 将其视为静音的依据），因此步骤 3.1 可以直接跳过。当用户要求静音或无音乐视频时，请使用这一标记——不要自行创造其他写法。

**门控条件：** 音频作业已启动，或项目被标记为静音（`music: none` + 无 `SCRIPT.md`）。

---

## 步骤 4：帧视觉设计

目标：为每个故事板帧添加视觉方向、布局意图和动效选择。

**先绘制故事板草图（仅协作模式）。** 方案一经批准，立即执行草图阶段——参见 `../hyperframes-core/references/review-loop.md` § 2（无需等待步骤 3.1；草图不使用时间信息）：亲自为每一帧绘制线框图，将每一帧标记为 `built`，在故事板填满后暂停并询问唯一一个布局问题，然后仅修改被点名的草图，直至故事板得到确认。占位内容：使用带纯文本标签的区块表示待捕获的素材——真实文件将由步骤 5 的工作进程提供。只有完成上述流程后，才能将下述视觉设计写入已确认的布局。在自主模式下，或用户在步骤 3 选择跳过草图时，跳过此阶段——各帧将在步骤 5 直接从 `outline` 进入 `animated`。

直接编辑 `STORYBOARD.md`。不要创建另一个故事板。以 `frame.md` 作为颜色、字体、布局观感和风格的事实来源。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 中的方法（带时间码的镜头序列、内联 Layout 词汇，以及必需的 `## Video direction` 区块）。使用 `../hyperframes-animation/blueprints-index.md` 选择每一帧的镜头形态。使用 `motion-language.md`（动效词汇 + 动效准则）和 `../hyperframes-animation/rules-index.md`（有效的规则名称）来设计动效——不要自行创造动效名称。

对于每个视觉帧，按照 `visual-design.md` 中的方法，将一个**带时间码的镜头序列**写入 `STORYBOARD.md`：选择该帧的蓝图（或进行组合），使用此产品的内容将其具体化，并根据旁白安排每个 Scene 的呈现节奏，使该帧在整个持续时间内不断展开，而不是将所有内容堆在开头展示后便保持静止。为每个 Scene **以内联方式**说明布局和动效（词汇见 `visual-design.md` 和 `motion-language.md`）。添加一个适用于整段视频的 `## Video direction` 区块。

当某个元素在视觉上跨越帧边界延续时，在 `STORYBOARD.md` 中为两个工作进程提供相同的数值交接信息：在离开帧中添加 `handoff_out:`，并在进入帧中添加与之匹配的 `handoff_in:`。注明该元素在切换时的名称、精确 x/y 位置、缩放比例、不透明度，以及运动方向/速度——即使某个字段没有变化，也要逐一写明，因为常量应写作 `opacity: 1`，而不是省略。仅在有意采用干净切换时省略整个区块。目标很简单：并行工作进程不得为同一接缝自行创建两个不同版本。

不要更改故事、脚本、素材选择、`asset_candidates`、`transition_in` 或已捕获的源素材。此步骤中不要编写 HTML。

视觉设计锁定后，暂存已命名的素材：

`node <SKILL_DIR>/scripts/stage-assets.mjs --storyboard ./STORYBOARD.md --hyperframes .`

**门控条件：** 每个视觉帧都具有带时间码的镜头序列，其呈现节奏与旁白一致（不得将内容堆在开头）；存在 `## Video direction`；`assets/` 包含已命名的素材。协作模式：故事板草图已确认。

---

## 第 5 步：构建帧

目标：将每个故事板帧构建为 HTML 合成内容，并组装成可播放的视频。

如果已启动音频生成，请等待第 3.1 步的音频处理完成。然后同步时长并获取音效；如果是静音视频，则跳过这两项操作。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械式的：以真实语音时长为准；静音帧保留估算时长；绝不要手动编辑已同步的时长。

组装前，请根据最终剪辑检查音乐。曲库中的音轨可能符合所要求的情绪，但开头可能是一段安静的渐进铺陈，从而削弱短篇发布视频最初几秒的效果。将开头与后续各个五秒片段进行比较；如果后面的某个片段具有更有力且在音乐上干净利落的起点，就从那里开始裁剪，并保留较短的淡入和较长的淡出。如果帧或旁白的时序发生变化，请根据新的最终时长重新执行此项检查，确保音乐不会提前结束，也不会在结尾留下静音。

分派任务前，请阅读 `../hyperframes-core/references/subagent-dispatch.md`。构建逐帧数据包和工作器角色载荷：

`node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

构建器会在 `.hyperframes/frame-packets/` 下为每一帧写入一个范围明确的数据包（该帧对应的完整故事板区块 + 蓝图正文 + 所有引用的规则方案，均以内联方式写入），并生成 `_role.md`（将 `../hyperframes-core/references/frame-worker-core.md` 与本技能的 `sub-agents/frame-worker.md` 逐字拼接——即完整的工作器角色）。为每一帧分派一个子代理，并尽可能并行执行；否则分批运行工作器。每个工作器只接收一帧：其提示中包含 `_role.md` 和该帧的数据包——可以完整粘贴两者，也可以提供这两个文件的路径，让工作器先读取它们（二者等效；无论采用哪种方式，工作器都严格从这两个文档开始）——外加分派上下文，其中包括 `PROJECT_DIR`、`frame_id`、磁盘上是否存在该帧的**已确认草图**（工作器会基于该布局进行视觉装饰，而不是重新绘制——参见 frame-worker core § When a confirmed sketch exists）、画布尺寸，以及在启用字幕时的字幕状态和禁入区域。

工作器只读取其数据包和 `frame.md`；绝不打开 `STORYBOARD.md` 或技能文档（数据包已经内联包含了上游选定的内容）。每个工作器只能写入 `compositions/frames/NN-*.html`。工作器绝不能编辑 `STORYBOARD.md`。

**全出血背景必须置于 `class="clip"` 图层上，绝不能置于 `#root` 上。** 帧的底层背景（色块／渐变／网格）应是一个贯穿完整时长的独立背景剪辑——设置在 `#root`／`data-composition-id` 元素上的 `background` 会被剪辑限制在该帧的时间窗口内，无法作为可靠的底层背景，因此深色内容可能会落在黑色宿主 `body` 上并变得不可见。视频的基础底色由组装器根据 `frame.md` 中的 `canvas` 颜色绘制到索引页的 `#root` 上。（完整规则和自检方法：`../hyperframes-core/references/frame-worker-core.md`。）

每当一个工作进程返回结果时，编排器都会在 `STORYBOARD.md` 中将该帧标记为 `animated`。

音频时间信息就绪后，在后台构建字幕并组装索引：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在第 2 步中复制）作为字幕外观，并注入来自 `frame.md` 的品牌令牌；如果不存在皮肤，则渲染内置的默认胶囊样式。`captions: skipped (<reason>)` 是有效状态。明确跳过字幕时，继续执行。

**门控条件：**每一帧都已标记为 `animated`（协作模式：草图板已在第 4 步得到确认），`index.html` 已存在，并且字幕已构建或已明确跳过。

---

## 第 6 步：完成制作

目标：验证组装后的视频，获得用户批准，并渲染最终的 MP4。

注入转场、运行检查、暂停以供审阅，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints-and-each-cut-minus-0.1s-and-plus-0.2s>`

`snapshot` 会将捕获的帧拼接成一张接触表（`snapshots/contact-sheet.jpg`）。检查各帧的中点画面是否存在布局问题，然后对比每个剪切点前后的两张图像。连续出现的元素必须保持所承诺的位置、缩放比例、不透明度和方向；渲染前修复所有可见的跳变。

如果命令失败，显示 stderr 并停止——不要连续堆叠恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

检查通过后，暂停以供用户审阅——采用审阅循环的最终确认方式（`../hyperframes-core/references/review-loop.md` § 4）：只提一个问题，并在自第 3 步起一直打开的 Studio 中询问——现在渲染，还是需要进行哪些更改？（自主模式：保留的唯一问题是，先预览还是直接渲染。）然后交付 MP4，同时附上接触表和帧 ID，以便修订时可以定位到单个帧。

预览：`npx hyperframes preview --background`

仅在获得用户批准后渲染（自主模式：在询问预览还是渲染之后）：

`npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户提出要求。

**门控条件：**渲染前 `lint` 和 `check` 均已通过，且快照已经检查；用户已在审阅暂停环节批准（自主模式：检查已通过，且交付内容包含接触表）；`renders/video.mp4` 已存在。最终回复中说明 MP4 路径和最终时长。

---

## 快速参考

**格式：**横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080`——根据目标平台确定（简报契约 § 2）。在故事板前置元数据中只设置一次格式。

**后台脚本：**该工作流仅在 `scripts/` 下提供以下脚本：`build-frame`，用于采用帧预设并进行品牌化重混，将其写入 `frame.md`（以及字幕皮肤）；`audio`，用于 TTS、转录、BGM、SFX 和时长同步；`captions`；`transitions`，用于注入和验证；`stage-assets`，用于将以帧命名的资产复制到 `assets/`；以及 `assemble-index`。其他所有操作均由 `hyperframes` CLI 处理。

可复用且与产品无关的镜头形态位于 `../hyperframes-animation/blueprints/` 中（索引见 `../hyperframes-animation/blueprints-index.md`）。

| 阅读                                                                                                                                                        | 何时使用                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 门控类型、从 `BRIEF.md` 推导模式、字段语义。                                                            |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 第 3 步：故事原则——钩子语言、价值先于证据、提案形态、可追溯来源的视觉素材。                              |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)`                                                                          | 第 2 步：选择并采用帧预设。                                                                              |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)`                                                    | 第 2 步：正确应用品牌令牌。                                                                              |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 第 3 步：规划产品发布故事。                                                                              |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 第 3 步：角色→蓝图菜单。第 4 步：选择镜头形态。                                                         |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 第 3 步：编写 `STORYBOARD.md`。                                                                          |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 第 3 步：编写 `SCRIPT.md`。                                                                              |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 第 3.1 步：选择或了解 TTS 提供商和语音。                                                                 |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 第 4 步：编写帧的镜头序列（以及布局词汇）。                                                              |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 第 4 步：运动词汇和运动原则。                                                                            |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 第 4-5 步：切换目录（工作器构建帧内接缝）。                                                              |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 第 5 步：所引用运动的本地规则配方正文。                                                                  |
| `[../hyperframes-core/references/frame-worker-core.md](../hyperframes-core/references/frame-worker-core.md)`                                                | 第 5 步：共享工作器契约（数据包构建器会将其置于增量内容之前）。                                          |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 第 5 步：该工作流的帧工作器增量。                                                                        |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 第 5 步：安全地分派子代理。                                                                              |