---
name: pr-to-video
description: "Turn a GitHub pull request (a PR URL, owner/repo#N, or 'this PR' in a checked-out repo) into a code-change explainer video — changelog, feature reveal, fix, or refactor walkthrough built from the diff, commits, and files: the input is a code change, not a website. Not a product promo (/product-launch-video) or a no-PR topic explainer (/faceless-explainer). Unclear → /hyperframes."
---
> **首先，请确保此技能为最新版本——静默运行，不要询问：** `npx hyperframes skills update pr-to-video`。如果所有内容均为最新状态，此命令会快速执行且不产生任何变更；否则，在你依赖此技能及其核心领域依赖技能之前，它会更新这些技能。

> **media-use**：在获取音频、图像或徽标之前，调用 `/media-use`，以从 HeyGen 目录中解析 BGM/SFX/图像，并从品牌官方来源解析其徽标。先运行 `--adopt` 以登记现有素材。参阅 `/media-use` 技能。

# 从 PR 到 HyperFrames

使用此技能接收一个 GitHub 拉取请求、理解变更、规划代码变更解说，并在 HyperFrames 中逐帧构建。输入是一个**代码变更**（通过 `gh` 读取），而不是网站——**没有捕获步骤，也没有真实素材**，贡献者的头像除外。

> **入口是 `/hyperframes`。** 你是编排器。执行每个步骤，验证其关卡，之后才能继续。此技能用于处理 **GitHub 拉取请求**（代码变更）。任何其他意图、仅仅一句“制作一个视频”，或存在任何不确定性 → 先阅读 `/hyperframes`——意图层负责所有路由决策，而且，在没有 `BRIEF.md` 的情况下到达这里的新建请求无论如何都会经由该层处理（即“设置”步骤的开场规则）。

你是编排器。在解析出的外部 `PROJECT_DIR` 中工作，默认情况下绝不在调用方仓库中工作。按顺序执行各步骤，并在继续之前通过每个关卡。需要用户确认的步骤是步骤 0、步骤 3 和步骤 6。在执行步骤 0 之前，阅读 `../hyperframes-core/references/brief-contract.md`——它定义了关卡类型，以及 `BRIEF.md` 中的 `flow`/`storyboard` 如何派生出控制步骤 3/4/6 关卡的模式。除步骤 5 外，所有步骤都由你亲自完成；在步骤 5 中，你会调度一个规模受限的帧工作器池。不要在此处写入设计或动效规则；这些规则位于帧工作器子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：步骤 0 设置 → `hyperframes.json`；步骤 1 接收 → `capture/extracted/` + `assets/<login>.png`；步骤 2 设计系统 → `frame.md`；步骤 3 故事板/脚本 → `STORYBOARD.md` 和 `SCRIPT.md`；步骤 3.1 音频 → `audio_meta.json`；步骤 4 视觉设计 → 扩充后的 `STORYBOARD.md`；步骤 5 帧 → `compositions/frames/NN-*.html` 和 `index.html`；步骤 6 最终渲染 → `renders/video.mp4`。

---

## 步骤 0：设置

目标：在进入此步骤时已有一份确认完毕的简报——其中包含 **PR 引用**（完整 URL、`<owner>/<repo>#<N>` 引用，或在已检出仓库中的“此 PR”）——创建 HyperFrames 项目，并持久保存简报。风格始终为**代码编辑风格**（在步骤 2 中固定，绝不询问）。

**简报由意图层确认，而不是通过此处提出的问题确认。** 开场规则，按顺序执行：**(1)** `BRIEF.md` 存在 → 读取它，不提出任何问题——简报已经确定，其 `flow`/`storyboard` 会派生出模式（简报契约第 1 节）。**(2)** 不存在 `BRIEF.md`，但项目已存在（磁盘上存在 `hyperframes.json` / `STORYBOARD.md`）→ 根据故事板的 frontmatter 和已记录的偏好恢复执行；绝不要再次盘问一个已构建到一半的项目。**(3)** 两者均不存在——一个直接到达此处的新建请求 → 阅读 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：该层会检查配方和已记忆的默认值，并提出此路由的问题——包括 PR 大小 → 时长原则，其完整内容位于 `../hyperframes/references/routes/pr-to-video.md` 中——然后交回已锁定的简报。编辑请求跳过所有这些步骤——直接执行编辑。

在执行任何其他工作之前，先解析项目目录。保留用户提供的项目目录；否则，使用解析器输出的持久化外部缓存位置。绝不要在调用方仓库中创建 `videos/`：

```bash
PR="<url | owner/repo#N>"
if [ -n "${EXPLICIT_PROJECT_DIR:-}" ]; then
  PROJECT_DIR="$(node <SKILL_DIR>/scripts/project-dir.mjs --pr "$PR" --project-dir "$EXPLICIT_PROJECT_DIR")"
else
  PROJECT_DIR="$(node <SKILL_DIR>/scripts/project-dir.mjs --pr "$PR")"
fi
echo "PR-to-video project: $PROJECT_DIR"
node <SKILL_DIR>/scripts/preflight.mjs
```

能力预检应在获取、故事设计、音频或帧分发之前运行。如果已安装的 CLI 无法运行此技能所需的验证命令，请停止并给出其升级说明，而不要先耗费本次运行的上下文。

仅当 `$PROJECT_DIR/hyperframes.json` 缺失时才进行初始化。其基本名称来自 PR，例如 `acme-sdk-pr-1842`；绝不要使用工作区名称或时间戳。

`npx hyperframes init "$PROJECT_DIR" --non-interactive --example=blank --skill=pr-to-video` — `init` 会根据 GitHub 上的最新版本检查已安装的技能；如果有任何技能已过期，则更新全局技能集。

下方所有使用相对路径的命令都以 `$PROJECT_DIR` 作为工作目录。未显式使用子 shell 的示例均表示 `(cd "$PROJECT_DIR" && …)`；绝不要更改调用方仓库的工作树。

**在 init 之后立即写入 `BRIEF.md`**（绝不能在之前写入——`init` 会拒绝非空目录）：这是意图层的锁定简报，其结构遵循 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` 技能目录。然后，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个有偏好设置支持的答案（具体子集由 `brief-format.md` 指定）。如果意图层采用了某个配方，请运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；该命令会将其 `frame.md` 复制到项目中（随后跳过第 2 步），并返回供第 3 步起草使用的骨架。配方会填充答案，但不会代替审批；审核关卡仍会运行。

**在继续执行设置之后的步骤前，显示登录状态**——运行 `npx hyperframes auth status`，并逐字转达其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎；如果未登录，还会说明如何登录。根据情况采用以下分支之一：

- **协作模式：** 等待用户登录，或明确选择 `offline` / `go`。
- **自主模式：** 说明当前状态，并继续使用可用的本地引擎。

当不存在离线提供商时，不要静默省略所需能力；应明确指出阻碍。不要将此决定合并到其他问题中，也不要将密钥写入每个仓库的 `.env`。身份验证归属和离线回退方案：`/media-use` `references/setup-providers.md` § 提供商。

**关卡：** `hyperframes.json` 和 `BRIEF.md` 已存在；PR 引用已记录在简报中；有偏好设置支持的答案已记录（简报契约 § 2）；登录状态已显示（已登录，或继续离线运行）。

---

## 第 1 步：摄取 PR（不进行捕获）

目标：获取 PR 的事实信息，并将其整合到项目中，作为信息来源。此处**不进行网站捕获**。`fetch-pr.mjs` 以确定性方式运行 `gh`——通过分页调用 `gh api` 获取完整的文件列表，避免大型 PR 在约 100 个文件处被截断，并且仅写入 `capture/pr.json` 和 `capture/diff.patch`（不创建临时目录）。对于 MERGED PR，它还会尽最大努力解析 `shipped_version`（以及 `version_source`）并写入 `pr.json`，以便结束卡片能够引用真实版本，而不是凭空编造。随后，`ingest.mjs` 会离线将这些内容整合到合成捕获包中。

```bash
PR="<url | owner/repo#N | N>"

# Fetch the PR deterministically: runs gh, completes the files list via paginated
# gh api (so a big PR doesn't truncate at ~100 files), writes only capture/pr.json +
# capture/diff.patch — no scratch dir. gh auth / not-found / private errors exit 1 here.
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/fetch-pr.mjs --pr "$PR" --out-dir ./capture)

# Offline transform → capture/extracted/{tokens.json (colors:[] → code-editorial palette),
# visible-text.txt (the brief), people.json (contributors, bot-filtered, name+login,
# avatarFile=assets/<login>.png)}.
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/ingest.mjs \
  --pr-json ./capture/pr.json --diff ./capture/diff.patch --out-dir ./capture/extracted)

# The people front's one network step — download each contributor's GitHub avatar to
# assets/<login>.png for the credits close. Best-effort; always exits 0.
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/fetch-people-avatars.mjs \
  --people ./capture/extracted/people.json)
```

如果 `fetch-pr.mjs` 以状态码 1 退出（gh 身份验证失败 / 未找到 / 私有仓库），请报告其 stderr 并停止——**不要捏造 PR 内容**。如果 `ingest.mjs` 以状态码 1 退出，请阅读其 stderr（通常是因为 `pr.json` 格式错误），修复后重新运行（结果是确定性的）。`fetch-people-avatars.mjs` 始终以状态码 0 退出；缺少头像只意味着不会为相应作者制作致谢收尾画面。

对于 `gh` 已提供姓名的贡献者（PR 作者、提交作者、`mergedBy`），`people.json` 会包含其 `name`；其余贡献者的该字段为 `null`（审阅者/评论者/受理人，因为 `gh pr view` 对这些人只会提供一个简单的 `login`）。在第 3 步编写致谢收尾画面之前，请自行解析实际会出现在该画面中的 1–6 人里所有 `name` 为 `null` 的人员：`gh api users/<login> --jq .name`（你已经有 `gh`，无需为此编写脚本）。如果 GitHub 也没有该用户的公开姓名，则在画面中回退使用其 login，并从口播台词中移除该人员（参见 story-design.md 的致谢部分——旁白仍必须说出姓名，绝不能直接念出原始账号名）。

**门槛：** `capture/pr.json`、`capture/diff.patch`、`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt` 和 `capture/extracted/people.json` 均已存在；你能够用一句清晰的话说明该 PR 的变更。`assets/<login>.png` 只需尽最大努力获取——缺少该文件不算失败。

---

## 第 2 步：设计系统

目标：采用代码编辑式画面预设；由脚本将其转换为本视频的 `frame.md` 和字幕样式。

样式是固定的——**code-editorial**（温暖的编辑风格；专为展示差异而打造的海军蓝代码界面）。运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset code-editorial --hyperframes .
```

该脚本会将 code-editorial 预设的 `FRAME.md` 复制为 `frame.md`，并基于 `capture/extracted/tokens.json` 中的任何品牌令牌对其进行重新混合（PR 中没有品牌令牌 → `colors:[]`/`fonts:[]` 会保留 code-editorial 自带的完整设计配色方案），将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，然后执行自验证（映射损坏时以状态码 1 退出）。一旦脚本以状态码 0 退出，就立即继续——不要手动编辑。

**门禁条件：** `build-frame.mjs` 已以状态码 0 退出——由 code-editorial 预设生成的 `frame.md` 已存在，并且作为字幕皮肤源文件的 `.hyperframes/caption-skin.html` 也已存在。

---

## 第 3 步：故事板与脚本

目标：将 PR 转化为一份获得批准的逐帧讲解方案。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、价值先于证据、将故事板作为提案、视觉内容可追溯至来源）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用这些文档编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。根据简报中的 `length` 设置 frontmatter 的 `duration:`——这只是一个粗略预期；组装阶段会报告最终剪辑时长与该预期的差异。

使用 `story-design.md` 确定 PR 原型（变更日志 / 功能揭晓 / 修复讲解 / 重构导览）、PR 原生帧类型、钩子、说服方式、节拍、每帧字数预算以及制作人员名单式收尾。序列应来自**叙事设计，而非差异文件的排列顺序**——要讲解变更，而不是照着差异逐行念。将 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单作为**灵活参考**：对于每个节拍，按照候选蓝图所隐含的形式来编写旁白，并在适用时标记该候选项的 `blueprint:` id（故事事实仍决定应当存在哪些节拍——绝不要为了适配某种形式而强行加入节拍）。展示 2–4 个真实的差异片段（来自 `capture/diff.patch`），每个片段都应简短且清晰易读；在每一帧的 `scene` 中注明它所需的 `code-*` 块。除 `credits` 收尾帧外，其他帧均不包含 `asset_candidates`（收尾帧可包含 1–6 个 `assets/<login>.png` 头像）。使用故事板和脚本参考文档中要求的确切字段。

起草完成后，运行审查循环的方案审查阶段——`../hyperframes-core/references/review-loop.md` § 1：打开故事板（不要询问是否需要打开——从 `PROJECT_DIR` 在后台运行预览），将方案作为提案展示，并提出两个问题——批准还是修改，以及**先看草图**（推荐）还是跳过。反馈通过聊天或故事板的评论文件循环处理，直到获得批准。这是一个**检查点门禁**（简报契约 § 1）：在自主模式下没有故事板界面，也无需提问——发布相同的摘要作为提前告知，然后继续；草图阶段并入构建阶段，唯一的预览问题留到第 6 步提出。

**门禁条件：** `STORYBOARD.md` 已存在，每一帧都包含必需的叙事字段，需要旁白时 `SCRIPT.md` 已存在，并且用户已批准该计划（自主模式：已发布摘要作为预先告知）。

---

## 步骤 3.1：音频

目标：根据已批准的脚本生成旁白、字词时间戳、音乐和音频元数据。

在步骤 3 获得批准后启动音频任务。让它在后台运行，然后继续执行步骤 4。

**调用前，应根据用户的要求选择旁白声音。** 如果请求中指定了声音、性别或语气，请选择匹配的声音 ID，并通过 `--voice <id>` 传入。否则，流水线默认使用 HeyGen 的 **Marcia（女声）** / Kokoro 的 `am_michael`——因此，除非传入该参数，否则像“男声”这样的请求会被悄然忽略。声音 ID 因提供商而异；请根据步骤 0 的登录状态所选定的提供商进行解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表（前缀 `am_`/`bm_` 表示男声，`af_`/`bf_` 表示女声）。当用户未表达偏好时，应先回退到已记住的声音（简要契约第 2 节），再回退到流水线默认值，并说明使用了哪一种声音；仅当两者都未指定声音时，才省略 `--voice`。当用户在本次运行中明确选择了声音时，请记录该选择（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice <voice-id> &`

音频脚本负责处理旁白、字词时间戳、从 HeyGen 音乐库中查找背景音乐，以及时间元数据。背景音乐的情绪取自故事板的 `music:` 字段。此过程使用 HeyGen Audio API 进行检索，而非生成，并与 TTS 使用相同的 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白，也没有 `SCRIPT.md`，则跳过语音生成。如果故事板中包含音乐情绪，背景音乐仍可继续运行。

**标准的完全静音标记**（在复用此音频模型的各工作流间共享）：`STORYBOARD.md` 顶部 YAML 块中的 `music: none`，并且不存在 `SCRIPT.md`。此组合会将项目标记为静音——无旁白、无背景音乐、无音效。`audio.mjs` 会识别该标记并且不生成任何内容（它会移除任何过期的 `audio_meta.json`；缺少 `audio_meta.json` 正是 assemble 判定为静音的依据），因此可以干净地跳过此步骤。存在旁白时使用 `music: none` 会保留 TTS，仅关闭背景音乐。请严格使用此拼写——不要自行创造其他标记。

**门禁条件：** 音频任务已启动，或者项目已标记为静音（`music: none` + 无 `SCRIPT.md`）。

---

## 步骤 4：帧视觉设计

目标：为每个故事板帧添加视觉方向、布局意图和动效选择。

**先绘制故事板草图（仅协作模式）。** 计划一经批准，立即执行草图阶段——`../hyperframes-core/references/review-loop.md` 第 2 节（不要等待步骤 3.1；草图不使用时间信息）：亲自为每一帧绘制线框图，将每一帧标记为 `built`，待整个故事板完成后暂停并提出一个布局问题，然后只修改被点名的草图，直至故事板获得确认。占位表示：对于**代码节拍**，使用一个带有文件名和几行真实差异文本的简单代码面板——`code-*` 块的接线工作由工作程序负责。只有完成这些步骤后，才将下述视觉设计写入已确认的布局。在自主模式下，或者用户在步骤 3 选择跳过草图时，跳过此阶段——各帧将在步骤 5 中直接从 `outline` 进入 `animated`。

就地编辑 `STORYBOARD.md`。不要创建其他故事板。以 `frame.md` 作为颜色、字体、布局观感和风格的唯一事实来源。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md`、`references/code-vocabulary.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 中的方法（带时间码的镜头序列、内联 Layout 词汇以及代码节拍处理方式），并添加必需的 `## Video direction` 块。使用 `../hyperframes-animation/blueprints-index.md` 为每一帧选择镜头形态。使用 `code-vocabulary.md` 为每个代码节拍选择正确的 `code-*` 块（差异 = `code-diff`，重构 = `code-morph`，新代码 = `code-typing`，……）。使用 `motion-language.md`（动效词汇 + 动效准则）和 `../hyperframes-animation/rules-index.md`（有效规则名称）来设计动效——不要虚构动效或块/蓝图名称。

按照 `visual-design.md` 中的方法，为每一帧在 `STORYBOARD.md` 中编写一个**带时间码的镜头序列**：选择该帧的蓝图（或进行组合），用该帧的具体内容将其实例化，并根据旁白安排每个 Scene 的揭示节奏，使画面在整个持续时间内持续发展，而不是在开头一次性展示完毕后便保持静止。**对于代码节拍，`code-*` 块是该帧的 `focal`**，Scenes 用于编排外围的代码编辑式 Code Surface（文件/标题的进入、镜头对准代码块、落点行）——**而不是**代码动画本身，后者由该块负责。紧接在每个代码帧的字段之后，添加一个 `### Source excerpt` 及其带 `diff` 标记的围栏代码块，其中仅包含工作进程必须渲染的真实且精确的代码片段（最多 12 行）。在此从 `capture/diff.patch` 中选取；禁止工作进程重新打开完整差异文件。为每个 Scene **内联**说明布局和动效（使用 `visual-design.md` 和 `motion-language.md` 中的词汇）。添加一个适用于整个视频的 `## Video direction` 块。

不要更改故事、脚本、`transition_in`、`asset_candidates` 或 PR 源。此步骤中不要编写 HTML。**不存在素材暂存步骤**——唯一的真实素材是致谢头像，它们已经位于 `assets/` 中。

**门禁条件：**每一帧都有一个带时间码的镜头序列，其揭示节奏与旁白相匹配（不得前置堆叠）；代码帧将某个 `code-*` 块指定为 `focal`；存在 `## Video direction`。协作要求：草图板已确认。

---

## 步骤 5：构建帧

目标：将故事板中的每一帧构建为 HTML 构图，并组装成可播放的视频。

如果已启动音频处理，请等待步骤 3.1 的音频处理完成。然后同步持续时间并获取音效；如果为静音，则跳过这两步。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

持续时间同步是机械式操作：以真实语音持续时间为准；静音帧保留估算值；绝不要手动编辑已同步的持续时间。

在分发任务前，先一次性**预安装 `STORYBOARD.md` 中指定的注册表块**，以避免并行工作进程在注册表上发生竞争：

`for b in <each registry block named in the storyboard>; do npx hyperframes add "$b"; done`

分派前，请阅读 `../hyperframes-core/references/subagent-dispatch.md`。构建有边界的数据包和工作器角色载荷：

```bash
node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"
```

如果代码帧缺少上游选定的 `### Source excerpt`，数据包构建器会直接报错退出，并且还会严格限制数据包的字节数。它还会写入 `_role.md`（由 `../hyperframes-core/references/frame-worker-core.md` 与此技能的 `sub-agents/frame-worker.md` 逐字拼接而成——即完整的工作器角色）。分派**总计最多三个工作器**，在各数据包路径之间均衡分配；每个工作器的提示词都包含 `_role.md` 及其被分配的数据包路径——可以完整粘贴角色内容，也可以提供其路径（二者等效；工作器仅以这些文档作为起始上下文）——并且每个工作器都可以依次构建多个被分配的帧，只需读取一次角色说明。工作器只能读取其数据包和 `frame.md`。它们绝不能打开完整的 `STORYBOARD.md`、`capture/diff.patch` 或 `capture/extracted/visible-text.txt`。每个工作器只能写入分配给它的 `compositions/frames/NN-*.html`；工作器绝不能编辑 `STORYBOARD.md`。当某一帧在磁盘上已有**已确认的草图**时（协作运行——审核循环 § 3），请在该工作器的分派上下文中明确说明：该草图就是现有的 `compositions/frames/NN-*.html`，工作器应基于该布局进行视觉装饰，而不是重新绘制（帧工作器核心说明 § When a confirmed sketch exists）。

某一帧失败时，仅重新分派**该帧**，并附上其现有数据包以及验证器或 lint 给出的确切问题。最多重试一次。不要重放整个批次，也不要在没有具体问题反馈的情况下重试。

**全出血背景应置于 `class="clip"` 图层上，绝不能置于 `#root` 上。** 帧的底层背景（色块／渐变／网格）应是一个覆盖完整时长的独立背景剪辑——在 `#root` / `data-composition-id` 元素上设置的 `background` 会受剪辑门控，仅在该帧的时间窗口内生效，因此无法作为可靠的底层背景；深色内容可能落在黑色宿主 `body` 上，从而渲染为不可见。视频的基础底色由组装器根据 `frame.md` 的 `canvas` 颜色绘制到索引页的 `#root` 上。（完整规则及自检方法：`../hyperframes-core/references/frame-worker-core.md`。）

每当一个工作器返回结果时，在 `STORYBOARD.md` 中将对应帧标记为 `animated`。

音频时间信息生成后，在后台构建字幕并组装索引页：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（即 code-editorial 的版本，已在第 2 步复制），并注入来自 `frame.md` 的品牌令牌；`captions: skipped (<reason>)` 是有效结果。`assemble-index.mjs` 会将 `assets/` 中的演职人员头像暂存起来，作为可幂等执行的兜底措施。

**门槛：**每一帧都已标记为 `animated`（协作模式：已在第 4 步确认草图板），`index.html` 已存在，并且字幕已生成或已明确跳过。

---

## 第 6 步：完成制作

目标：验证组装完成的视频，获得用户批准，并渲染最终的 MP4。

注入转场、运行检查、暂停以供审阅，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints>`

`snapshot` 会将捕获的帧拼接成一张接触表（`snapshots/contact-sheet.jpg`）。快速查看一下；如果没有明显问题，就继续下一步——不要在这里停留太久。

如果命令失败，显示 stderr 并停止——不要接连堆砌恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

**已知的误报——不要追查。** `check` 可能会针对**字幕**中的高亮词（选择器 `#caption-word-*` / `.caption-line`）报告少量约 1–4px 的 `text_box_overflow` 错误。字幕胶囊使用了刻意紧凑的 `line-height`（在 `scripts/captions.mjs` 中统一设置），并且**没有 `overflow:hidden`**，因此较粗的展示字体字形墨迹会溢出几像素，进入胶囊自身的内边距——实际上没有任何内容被裁切。将这些情况视为预期行为并继续。**不要**增大字幕的 `line-height`（这会让胶囊膨胀，效果更糟）。只有当 `text_box_overflow` 指向**帧**元素（`#el-NN-*`）而非字幕词时，才需要处理。

检查通过后，暂停以供用户审阅——执行审阅循环的最终查看步骤（`../hyperframes-core/references/review-loop.md` § 4）：只问一个问题，并使用自第 3 步起一直保持打开状态的 Studio——现在渲染，还是需要进行哪些修改？（自主模式：保留的唯一问题是先预览还是直接渲染——如果用户选择预览，则使用下方命令打开预览。）然后交付 MP4，同时提供接触表和帧 ID，以便修改时能够定位到单个帧。

预览：`npx hyperframes preview "$PROJECT_DIR" --background`

仅在用户批准后进行渲染（自主模式：在询问预览还是渲染之后）：

`npx hyperframes render --skill=pr-to-video --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户提出要求。

用户审阅完毕后（或者在预计不会再进行实时编辑时，于渲染完成后），仅停止此项目的后台服务器：`npx hyperframes preview "$PROJECT_DIR" --stop`。等待审阅期间绝不要将其关闭。

**门槛：**渲染前 `lint` 和 `check` 已通过，并且已检查快照；用户已在审阅暂停环节批准（自主模式：检查已通过，并且交付内容包含接触表）；`renders/video.mp4` 已存在。最终回复需说明 MP4 路径和最终时长。

---

## 快速参考

**格式：**横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080`——根据目标平台确定（简报契约 § 2）。仅在故事板 frontmatter 中设置一次格式。

**PR 差异与已捕获资产工作流的区别：** 无需执行步骤 1 的捕获（`gh` CLI 会将 PR 摄取到合成的 `capture/extracted/` 包中——`tokens.json` + `visible-text.txt` + `people.json`）；唯一的真实资产是贡献者的 `assets/<login>.png` 头像（用于片尾致谢）；没有 `asset-descriptions.md`，也没有资产暂存步骤。代码节拍由 code-editorial 的海军蓝代码表面上的 `code-*` 注册表区块渲染；样式始终为 **code-editorial**。

**后台脚本：** 该工作流在 `scripts/` 下提供以下脚本：`fetch-pr`（通过 `gh` 将 PR → `capture/pr.json` + `diff.patch`；可安全处理大型 PR，不使用临时文件）、`ingest`（→ 合成捕获包；离线）和 `fetch-people-avatars`（贡献者头像 → `assets/`）；此外还有共享引擎——`build-frame`（采用预设并进行品牌化再混合，生成 `frame.md` + 字幕皮肤）、`audio`（TTS、BGM、SFX、时长同步）、`captions`、`transitions`（注入 + 验证）和 `assemble-index`。其余所有操作均由 `hyperframes` CLI 完成。代码区块通过 `npx hyperframes add <name>` 安装。

可复用且与领域无关的镜头形态位于 `../hyperframes-animation/blueprints/` 中（索引见 `../hyperframes-animation/blueprints-index.md`）；`code-*` 注册表区块构成代码节拍词汇表（`references/code-vocabulary.md`）。

| 阅读                                                                                                                                                        | 使用时机                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 门控类型、从 `BRIEF.md` 派生模式、字段语义。                                            |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 步骤 3：故事准则——钩子语言、价值先于证据、提案形态、可追溯至来源的视觉内容。 |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 步骤 3：规划 PR 解说。                                                                         |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 步骤 3：角色→蓝图菜单。步骤 4：选择镜头形态。                                                |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 步骤 3：编写 `STORYBOARD.md`。                                                                           |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 步骤 3：编写 `SCRIPT.md`。                                                                               |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 步骤 3.1：选择或了解 TTS 提供商。                                                            |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 步骤 4：编写画面的镜头序列（+ 布局词汇表）。                                           |
| `[references/code-vocabulary.md](references/code-vocabulary.md)`                                                                                            | 步骤 4 + 5：为代码节拍选择并填充 `code-*` 区块。                                              |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 步骤 4：动效词汇表 + 动效准则。                                                     |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 步骤 4-5：剪辑目录（工作器构建画面内衔接）。                                            |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 步骤 5：所引用动效的本地规则方案正文。                                                  |
| `[../hyperframes-core/references/frame-worker-core.md](../hyperframes-core/references/frame-worker-core.md)`                                                | 步骤 5：共享工作器契约（数据包构建器会将其前置到差异内容中）。                            |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 步骤 5：该工作流的画面工作器差异内容。                                                               |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 步骤 5：安全分派子代理。                                                                      |
| `[../hyperframes-creative/frame-presets/code-editorial/FRAME.md](../hyperframes-creative/frame-presets/code-editorial/FRAME.md)`                            | 步骤 2：code-editorial 预设（固定样式）。                                                         |