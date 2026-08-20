---
name: product-launch-video
description: "Turn a product or marketing URL, pasted script, or brief into a product launch / promo video — SaaS promos, feature reveals, product demos, app and company launches. Use when the user wants to market, launch, promote, or reveal a product; the default for any commercial URL. Site tours / showcases of a website route here too — the brief carries the show-it-as-is intent. Unclear → /hyperframes."
---
> **首先，保持此技能为最新版本——静默运行，不要询问：** `npx hyperframes skills update product-launch-video`。当所有内容均为最新时，这是一次快速无操作；否则，它会在你依赖这些技能之前刷新此技能及其所依赖的核心领域技能。

> **媒体使用**：在获取音频/图片/徽标之前，调用 `/media-use`，从 HeyGen 目录解析 BGM/SFX/图片，并从其官方来源解析品牌徽标。先运行 `--adopt` 以登记现有资产。参见 `/media-use` 技能。

> **figma 源文件**：如果源文件是 figma.com URL，先运行 `/figma` —— 如有需要，进行资产导出、品牌令牌以及组件/故事板重建 —— 然后基于其输出构建此工作流。不要直接通过原始 MCP 工具操作 Figma：这会跳过 SVG 清理、`.media/manifest.jsonl` 来源记录以及品牌令牌 `var()` 绑定，因此后续品牌变更将无法传播，除非进行完整重新导入。

# 产品发布至 HyperFrames

使用此技能捕获产品、理解其品牌、规划发布视频，并在 HyperFrames 中逐帧构建。

> **入口是 `/hyperframes`。** 你是编排者。运行每个步骤，验证其关卡，然后才能继续下一步。此技能适用于**正在被营销、发布、推广或揭晓的产品**，包括诸如“为我们的网站制作宣传片”之类的请求，只要其目的是推广。网站导览/展示请求也保留在此处：`BRIEF.md` 承载按原样展示的意图，而捕获的屏幕会成为视频展示的资产。任何其他意图、仅仅“制作一个视频”的请求，或任何不确定情况 → 先阅读 `/hyperframes` —— 意图层负责每个路由决策，而直接到达此处且没有 `BRIEF.md` 的全新创作无论如何都会经过它（Setup 的开场规则）。

你是编排者。在 `videos/<project>/` 中工作。按顺序运行步骤，并在继续之前通过每一关。需要用户确认的步骤为步骤 0、步骤 3 和步骤 6。在步骤 0 前阅读 `../hyperframes-core/references/brief-contract.md` —— 它定义了关卡类型，以及 `BRIEF.md` 的 `flow`/`storyboard` 如何推导出决定步骤 3/4/6 关卡的模式。除步骤 5 外，所有步骤均由你亲自完成；在步骤 5 中，你要为每一帧分派一个子代理。不要在此处放置设计或运动规则；它们位于帧工作者子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：步骤 0 设置 -> `hyperframes.json`；步骤 1 捕获 -> `capture/`；步骤 2 设计系统 -> `frame.md`；步骤 3 故事板/脚本 -> `STORYBOARD.md` 和 `SCRIPT.md`；步骤 3.1 音频 -> `audio_meta.json`；步骤 4 视觉设计 -> 充实后的 `STORYBOARD.md`；步骤 5 帧 -> `compositions/frames/NN-*.html` 和 `index.html`；步骤 6 最终渲染 -> `renders/video.mp4`。

---

## 步骤 0：设置

目标：以已确认的简报进入，创建 HyperFrames 项目，并使简报持久化。

**简报由意图层确认，而不是通过在此处提问来确认。** 开场规则，按顺序执行：**(1)** `BRIEF.md` 存在 → 阅读它且不提问 —— 简报已确定，其 `flow`/`storyboard` 会推导出模式（简报契约 § 1）。**(2)** 没有 `BRIEF.md`，但项目已存在（磁盘上存在 `hyperframes.json` / `STORYBOARD.md`）→ 从故事板的 frontmatter 和已记录的偏好中恢复；绝不重新盘问一个已构建到一半的项目。**(3)** 两者皆无 —— 一个直接到达此处的全新创作请求 → 阅读 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：它会检查配方和记忆的默认值，进行此路由的问题（`../hyperframes/references/routes/product-launch-video.md`），并交回已锁定的简报。编辑请求跳过所有这些步骤 —— 直接进行编辑。

仅当缺少 `hyperframes.json` 时才初始化。从品牌或域名以 kebab-case 命名 `<project>`，例如 `acme-promo`；绝不要使用工作区名称或时间戳。

`npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=product-launch-video` — `init` 会根据 GitHub 上的最新版本检查已安装的 skills，并在任一技能过期时更新全局集合。

初始化后，令 `<PROJECT_ROOT>` 为 `videos/<project>`，并将该目录设为所有后续相对路径命令的工作目录。在以下命令中，`.` 表示 `<PROJECT_ROOT>`；绝不要在调用方目录中写入 `.media`、`capture` 或输出文件。

**在 init 后立即写入 `BRIEF.md`**（绝不能在此之前——`init` 会拒绝非空目录）：这是意图层锁定的 brief，其结构参照 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` skill 目录。然后使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个基于偏好的回答（`brief-format.md` 指定了该子集）。如果意图层采用了 recipe，请运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；它会将其 `frame.md` 复制到项目中（随后跳过第 2 步），并返回第 3 步要起草的骨架。recipe 会填充回答，而不会填充批准；审核关卡仍会执行。

**在继续通过 Setup 之前显示登录状态** — 运行 `npx hyperframes auth status` 并逐字转述其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎，以及在未登录时如何登录。注意退出代码约定：`auth status` **在未登录时**（以及存储的凭据被拒绝时）**退出代码为 1** — 该非零退出是正常的未登录状态，而不是命令失败，因此不要将其视为错误，不要重试，也不要通过 `&&`/`set -e` 以会中止工作流的方式串联它。应用以下分支之一：

- **协作式：**等待用户登录，或明确选择 `offline` / `go`。
- **自主式：**说明状态，并继续使用可用的本地引擎。

当没有离线提供程序时，不要悄然省略必需功能；应明确指出阻塞因素。不要将此决定合并到其他问题中，也不要将密钥写入每个仓库的 `.env`。认证归属和离线回退方案：`/media-use` `references/setup-providers.md` § Providers。

**关卡：**`hyperframes.json` 和 `BRIEF.md` 存在；基于偏好的回答已记录（brief contract § 2）；已显示登录状态（已登录，或继续离线）。

---

## 第 1 步：采集资产

目标：收集视频的源材料、品牌信号和可用资产。

对输入进行分类并选择路径。明确 URL -> 采集它，并将该站点用于旁白和资产。粘贴的脚本/brief -> 原样保存为 `user_script.txt`；`VO_MODE`（逐字或重构）来自 `BRIEF.md` — 当收到脚本时，意图层会询问它（仅当 brief 不知为何缺少它时才在此询问一次）。然后解析采集目标：文本中的 URL -> 使用它；仅有品牌名称 -> `WebSearch`，用一行确认 URL，然后爬取；没有 URL/站点（或 brief 表示不要抓取）-> 不采集路径。

使用以下命令运行捕获：`npx hyperframes capture "<URL>" -o ./capture --json`。保留默认的
导航后预算，除非调用方承担了更短的截止时间；此时传入一个为下游工作预留时间的正值
`--capture-budget <milliseconds>`。`--timeout` 仅控制页面
导航。仅当有意禁用可选的图像描述功能时，才使用 `--skip-vision`。

立即检查命令结果和输出目录。非零退出码、JSON `ok: false` 或
`capture/BLOCKED.md` 都是捕获路径的**硬停止**条件：报告记录的原因，并且不要
使用部分截图、DOM、令牌或资产。URL 捕获失败后，不要人为构造合成的无捕获后备方案。仅当原始简报提供了源材料，
或者用户在失败后明确切换为使用提供的截图或简报时，才继续走无捕获路径。

诸如 `very little text content` 与空资产目录同时出现的警告，并不能证明页面可用。对于站点导览或按原样展示的简报，
要求存在可信赖的捕获结构或提供的截图；如果两者都不存在，则停止。不要仅仅因为
捕获不可用就虚构或重建页面。

对于站点导览或按原样展示的简报，捕获的页面是视觉事实来源。使用真实截图，而不是用 HTML 重建完整网站。
如果截图需要内部运动，则保留截图作为基础，并在测量后的位置叠加真实捕获的资产，或者只重建其中会移动的一个组件。
对于滚动截图，在 `capture/screenshots/full-page.png` 上为视口制作动画 — 这是整个文档的 1x 图板，对于沿其向下移动的 1920 宽视口而言像素精确。页面过高而无法一次捕获时，它不会存在；请回退到同一目录中的重叠滚动位置截图。
推进到超过 1:1 时，需要对该区域进行单独的 2x 捕获，因为图板在 1x 以上没有余量。仅当用户明确要求风格化诠释时，
才重建整个页面；捕获不可用本身并不构成授权。

如果存在 `GEMINI_API_KEY`、`GOOGLE_API_KEY` 或 OpenRouter 密钥，捕获会自动将资产描述写入 `capture/extracted/asset-descriptions.md`。这不是审核关卡。
没有视觉密钥时，使用 DOM 上下文并继续。

无捕获路径：手动创建 `capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、`capture/extracted/asset-descriptions.md` 和 `capture/assets/`。
`tokens.json` 应为 `{ "title": "", "description": "", "colors": [], "fonts": [] }`；尽可能从简报中填充标题/描述。
`visible-text.txt` 包含完整简报或脚本。除非用户提供了资产说明，
否则 `asset-descriptions.md` 应说明未捕获任何资产。

**关卡：**捕获 JSON 报告 `ok: true`；`capture/BLOCKED.md` 不存在；
`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt`、
`capture/extracted/asset-descriptions.md` 和 `capture/assets/` 存在；并且你可以用
一句清晰的话陈述品牌。将 `asset-descriptions.md` 视为主要资产清单。如果它在真实捕获后缺失，则停止并报告捕获不完整。
仅当这一结构性关卡仍然通过时，关于降级的可选阶段的警告才是可接受的。

---

## 第 2 步：设计系统

目标：选择一个已发布的画面预设；脚本会将其转换为本视频的 `frame.md` + 字幕皮肤。

当 `BRIEF.md` 指定了 `style_preset` 时——用户已在意图层通过展示案例凭视觉选择了它——就使用它；仅当 brief 未提及时，才由你自行判断。然后你做出这一个决定——**选择哪个预设**：阅读 `../hyperframes-creative/references/design-spec.md`，并选择其外观最适合品牌和 brief 的预设。然后运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

脚本会以确定性方式完成其余工作：将预设的 `FRAME.md` → `frame.md`，并将其**重混**到 `capture/extracted/tokens.json` 中的品牌 token 上（按角色将品牌颜色映射到预设的颜色键——墨色、画布、强调色——同时保留键/结构/组件；将预设的展示字体 + 正文字体替换为品牌字体）；将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并进行自验证（映射损坏时以退出码 1 退出）。一旦退出码为 0，立即进入下一步——不要手动编辑该规范。

不含品牌颜色/字体的 `tokens.json`（例如未进行捕获）→ 脚本保留预设自身的调色板，即一套完整、可发布的设计。如果 brief 指定了捕获遗漏的品牌颜色/字体，请在运行前将它们添加到 `capture/extracted/tokens.json`（或使用用户的 `design.md` 填充它）；仅当映射确实需要调整时，才随后手动修改 `frame.md`。

**关卡：** `build-frame.mjs` 以退出码 0 退出——`frame.md` 已由一个指定预设生成，并且（当该预设提供时）`.hyperframes/caption-skin.html` 已作为字幕皮肤源存在；所选预设已记录为偏好（`--key style_preset --workflow <this workflow>`，brief 合同 § 2）。

---

## 第 3 步：分镜和脚本

目标：将 brief 和已捕获的材料转化为经批准的逐帧故事计划。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、证据之前先呈现价值、将分镜作为提案）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用它们编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。根据 brief 的 `length` 设置 frontmatter 的 `duration:`——这只是一个粗略预期；组装过程会报告成片相对于该时长的落点。

使用 `story-design.md` 确定故事蓝图、钩子、说服逻辑、节拍、`VO_MODE` 和素材选择。作为**软性指南**，参考 `../hyperframes-animation/blueprints-index.md` 中按角色→蓝图组织的菜单：对于每个节拍，如有合适项，注明一个候选蓝图 id。故事真实性仍决定哪些节拍存在——绝不可强行让节拍适配蓝图，也绝不可仅因有已验证的形态可用就虚构一个节拍。从 `capture/extracted/asset-descriptions.md`（规范素材清单）中为每个视觉帧选择 `asset_candidates`——不要浏览原始 `capture/assets/`。除非该清单缺失或不可用，否则不要要求用户选择素材。使用分镜和脚本参考文档中规定的确切必填字段。

起草后，运行审阅循环的计划环节 — `../hyperframes-core/references/review-loop.md` § 1：打开看板（不要询问是否要打开），将计划作为提案呈现，并提出两个问题 — 批准还是修改，以及**先出草图**（推荐）还是跳过。反馈通过聊天或看板的评论文件循环，直至获得批准。这是一个**检查点闸门**（简要契约 § 1）：在自主模式下，没有看板，也无须提问 — 将相同的摘要作为提示发布后继续；草图会并入构建，唯一的预览问题将在第 6 步提出。

**闸门：** `STORYBOARD.md` 存在，每个视觉帧都具有 `asset_candidates`，需要旁白时 `SCRIPT.md` 存在，并且用户已批准逐帧计划（自主模式：摘要已作为提示发布）。

---

## 步骤 3.1：音频

目标：从已批准的脚本生成旁白、词语时序、音乐和音频元数据。

在第 3 步获批后启动音频。在后台运行，然后继续执行第 4 步。

**调用前，请根据用户请求选择旁白提供商和声音。** 通过 `--provider <provider>` 传入第 0 步选择的提供商（或设置 `HF_TTS_PROVIDER`）。如果请求指定了声音、性别或语调，请选择匹配的声音 id，并通过 `--voice <id>` 传入。否则，管道默认使用 HeyGen 上的 **Marcia（女声）** / Kokoro 上的 `am_michael` — 因此，像“男声”这样的请求会被静默忽略，除非你传入该标志。声音 id 因提供商而异；请根据第 0 步登录状态所选择的提供商进行解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表（前缀 `am_`/`bm_` 为男声，`af_`/`bf_` 为女声）。当用户未表达偏好时，先回退到已记住的声音（简要契约 § 2），再使用管道默认值，并说明所使用的是哪一个；仅当两者都未指定时才省略 `--voice`。当用户本次运行明确选择了声音时，记录它（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --provider <provider> --voice <voice-id> &`

音频脚本负责处理旁白、词语时序、从 HeyGen 音乐库查找 BGM，以及时序元数据。BGM 情绪来自故事板的 `music:` 字段；**`music: none` 会关闭 BGM**。这使用 HeyGen Audio API 进行检索，而非生成，并使用与 TTS 相同的 `~/.heygen` 凭据。有关提供商详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白且没有 `SCRIPT.md`，则跳过语音生成。如果故事板具有音乐情绪，BGM 仍可运行。

**规范的完全静音标记：** STORYBOARD.md 顶层 YAML 块中的 `music: none` **以及**没有 `SCRIPT.md`。该组合将项目标记为静音 — 无旁白、无 BGM、无 SFX。`audio.mjs` 能识别该标记且不会生成任何内容（它会移除任何残留的 `audio_meta.json`；缺少 `audio_meta.json` 是 assemble 视为静音的依据），因此步骤 3.1 会被干净地跳过。当用户请求静音 / 无音乐视频时使用它 — 不要自行改用其他拼写。

**门槛：**音频作业已启动，或项目已标记为静音（`music: none` + 没有 `SCRIPT.md`）。

---

## 第 4 步：帧视觉设计

目标：为每个故事板帧添加视觉方向、布局意图和运动选择。

**先绘制分镜板草图（仅协作模式）。** 计划一经批准，立即运行草图阶段——`../hyperframes-core/references/review-loop.md` § 2（不要等待第 3.1 步；草图不使用时序）：自行将每个帧绘制为线框图，将每个帧标记为 `built`，当分镜板完成时暂停以提出那一个布局问题，并且仅修改被点名的草图，直到分镜板获得确认。占位符：为已捕获资产使用带有纯文本标签的块——真实文件会随第 5 步的工作线程一同到达。只有在此之后，才能将下文的视觉设计写入已确认的布局中。在自主模式下，或当用户在第 3 步选择跳过草图时，跳过此阶段——帧将在第 5 步直接从 `outline` 变为 `animated`。

直接编辑 `STORYBOARD.md`。不要创建另一个故事板。以 `frame.md` 作为颜色、字体、布局氛围和风格的唯一事实来源。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 获取方法（带时间码的镜头序列、内联 Layout 词汇，以及必需的 `## Video direction` 块）。使用 `../hyperframes-animation/blueprints-index.md` 选择每个帧的镜头形态。使用 `motion-language.md`（运动词汇 + 运动原则）和 `../hyperframes-animation/rules-index.md`（有效规则名称）处理运动——不要自行创造运动名称。

对于每个视觉帧，按照 `visual-design.md` 的方法，在 `STORYBOARD.md` 中写入一个**带时间码的镜头序列**：选择该帧的蓝图（或进行组合），用此产品的内容将其具体化，并将每个 Scene 的呈现节奏与画外音对齐，使帧在其完整时长内逐步展开，而不是前段堆叠后冻结。针对每个 Scene **内联**说明布局和运动（词汇见 `visual-design.md` 和 `motion-language.md`）。添加一个覆盖全视频的 `## Video direction` 块。

当某个元素在帧边界之间可见地延续时，必须在 `STORYBOARD.md` 中向两个工作线程提供相同的数值交接信息：在输出帧中添加 `handoff_out:`，并在输入帧中添加匹配的 `handoff_in:`。注明元素名称及其在剪切点的精确 x/y 位置、缩放、透明度和运动方向/速度——即使字段没有变化，也要明确写出每个字段，因为常量是 `opacity: 1`，而不是省略。仅当有意进行干净切换时，才省略整个块。目标很简单：并行工作线程不得为同一处衔接各自发明两个不同版本。

不要更改故事、脚本、资产选择、`asset_candidates`、`transition_in` 或已捕获的源材料。此步骤中不要编写 HTML。

视觉设计锁定后，暂存具名资产：

`node <SKILL_DIR>/scripts/stage-assets.mjs --storyboard ./STORYBOARD.md --hyperframes .`

**门槛：**每个视觉帧都有带时间码的镜头序列，且其呈现节奏与画外音匹配（不前段堆叠）；存在 `## Video direction`；`assets/` 包含具名资产。协作模式：草图分镜板已获得确认。

---

## 步骤 5：构建帧

目标：将每个故事板帧构建为 HTML 合成，并组装成可播放的视频。

如果已启动音频，请等待步骤 3.1 的音频完成。然后同步时长并获取 SFX；如果静音，则两者均跳过。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械性的：以真实语音时长为准；静音帧保留估算值；绝不手动编辑已同步的时长。

组装前，请根据最终剪辑检查音乐。素材库曲目可能符合所需情绪，但会以安静的铺垫开场，消耗短启动视频的前几秒。将开场与后续的五秒片段比较；当后续片段有更强且音乐上干净的起点时，从那里开始裁剪，并保留短暂的淡入和较长的淡出。如果帧或旁白时序发生变化，请根据新的最终时长重新执行此检查，以确保音乐绝不会提前结束或在结尾留下静音。

分派前，请阅读 `../hyperframes-core/references/subagent-dispatch.md`。构建逐帧数据包和工作器角色载荷：

`node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

构建器会在 `.hyperframes/frame-packets/` 下为每一帧写入一个有边界的数据包（该帧的精确故事板块 + 蓝图正文 + 每条被引用的规则配方，均已内联），以及 `_role.md`（逐字拼接的 `../hyperframes-core/references/frame-worker-core.md` + 此技能的 `sub-agents/frame-worker.md` —— 完整的工作器角色）。每帧分派一个子代理；如有可能则并行，否则分批运行工作器。每个工作器恰好接收一帧：其提示词携带 `_role.md` 和该帧的数据包——完整粘贴两者，或提供这两个文件路径供工作器先读取（两者等效；无论哪种方式，工作器都恰好从这两份文档开始）——再加上包含 `PROJECT_DIR`、`frame_id`、该帧在磁盘上是否有**已确认草图**（工作器应装饰该布局而非重新绘制它——frame-worker core § 当存在已确认草图时）、画布尺寸，以及启用字幕时的字幕状态 + 禁入区域带的分派上下文。

工作器只读取自己的数据包和 `frame.md`；它们绝不打开 `STORYBOARD.md` 或技能文档（数据包已内联上游选中的内容）。每个工作器只写入 `compositions/frames/NN-*.html`。工作器绝不能编辑 `STORYBOARD.md`。

**全出血背景必须位于 `class="clip"` 图层上，绝不能放在 `#root` 上。** 一帧的底色（色块 / 渐变 / 网格）是其自身覆盖完整时长的背景剪辑——设置在 `#root` / `data-composition-id` 元素上的 `background` 会被剪辑限制在该帧的时间窗口内，并非可靠的底色，因此深色内容可能落在黑色宿主 `body` 上而渲染不可见。视频的基础底色由组装器根据 `frame.md` 的 `canvas` 颜色绘制到索引 `#root` 上。（完整规则 + 自检：`../hyperframes-core/references/frame-worker-core.md`。）

当每个工作线程返回时，编排器会在 `STORYBOARD.md` 中将该帧标记为 `animated`。

在音频时序生成后，在后台构建字幕并组装索引：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（在第 2 步中复制）作为字幕样式，并从 `frame.md` 注入品牌令牌；如果不存在字幕皮肤，则渲染内置的默认药丸样式。`captions: skipped (<reason>)` 是有效状态。明确跳过字幕时，继续执行但不生成字幕。

**门槛：**每一帧都标记为 `animated`（协作模式：草图板已在第 4 步确认），`index.html` 存在，且字幕已构建或被明确跳过。

---

## 第 6 步：完成

目标：验证组装后的视频，获得用户批准，并渲染最终 MP4。

注入转场、运行检查、暂停以供审阅，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints-and-each-cut-minus-0.1s-and-plus-0.2s>`

`snapshot` 会将捕获的帧拼接为一张联系表（`snapshots/contact-sheet.jpg`）。检查中点帧是否存在布局问题，然后比较每个剪切点前后的两张图像。持续出现的元素必须保持承诺的位置、缩放、不透明度和方向；在渲染前修复所有可见的跳变。

如果某个命令失败，显示 stderr 并停止——不要堆叠执行恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

检查通过后，暂停等待用户审阅——审阅循环的最终外观（`../hyperframes-core/references/review-loop.md` § 4）：在自第 3 步起一直打开的 Studio 中，只问一个问题——现在渲染，还是需要哪些更改？（自主模式：保留的唯一问题，先预览还是渲染。）然后交付 MP4、联系表和帧 ID，以便后续修订可以针对单个帧进行。

预览：`npx hyperframes preview --background`

仅在用户批准后渲染（自主模式：在“预览还是渲染”的问题之后）：

`npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4`

除非用户提出要求，否则渲染后不要重新运行 `lint`、`check` 或 `snapshot`。

**门槛：**渲染前 `lint` 和 `check` 已通过，且已检查快照；用户已在审阅暂停处批准（自主模式：检查通过且交付物包含联系表）；`renders/video.mp4` 存在。最终回复需说明 MP4 路径和最终时长。

---

## 快速参考

**格式：**横向 `1920x1080`；纵向 `1080x1920`；方形 `1080x1080`——由目标平台决定（简报约定 § 2）。在故事板 frontmatter 中仅设置一次格式。

**后台脚本：**该工作流在 `scripts/` 下仅提供以下脚本：`build-frame`，用于将帧预设采纳并进行品牌混搭，生成 `frame.md`（以及字幕皮肤）；`audio`，用于 TTS、转录、BGM、SFX 和时长同步；`captions`；`transitions`，用于注入和验证；`stage-assets`，用于将以帧命名的资产复制到 `assets/`；以及 `assemble-index`。其他所有工作均由 `hyperframes` CLI 处理。

可复用、与产品无关的镜头形态位于 `../hyperframes-animation/blueprints/`（由 `../hyperframes-animation/blueprints-index.md` 建立索引）。

| 阅读                                                                                                                                                        | 使用时机                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 门控类型、从 `BRIEF.md` 派生模式、字段语义。                  |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 第 3 步：故事原则——钩子语言、价值先于证据、提案形态。 |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)`                                                                          | 第 2 步：选择并采纳帧预设。                                       |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)`                                                    | 第 2 步：正确应用品牌令牌。                                          |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 第 3 步：规划产品发布故事。                                         |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 第 3 步：角色→蓝图菜单。第 4 步：选择镜头形态。                      |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 第 3 步：编写 `STORYBOARD.md`。                                                 |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 第 3 步：编写 `SCRIPT.md`。                                                     |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 第 3.1 步：选择或了解 TTS 提供商和语音。                       |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 第 4 步：编写帧的镜头序列（+ 布局词汇）。                 |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 第 4 步：运动词汇和运动原则。                           |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 第 4-5 步：剪辑目录（工作器构建帧内衔接）。                  |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 第 5 步：所引用运动的本地规则配方正文。                        |
| `[../hyperframes-core/references/frame-worker-core.md](../hyperframes-core/references/frame-worker-core.md)`                                                | 第 5 步：共享工作器契约（数据包构建器会将其前置到增量之前）。  |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 第 5 步：该工作流的帧工作器增量。                                     |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 第 5 步：安全地调度子代理。                                            |