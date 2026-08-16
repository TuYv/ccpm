---
name: pr-to-video
description: "Turn a GitHub pull request (a PR URL, owner/repo#N, or 'this PR' in a checked-out repo) into a code-change explainer video — changelog, feature reveal, fix, or refactor walkthrough built from the diff, commits, and files: the input is a code change, not a website. Not a product promo (/product-launch-video) or a no-PR topic explainer (/faceless-explainer). Unclear → /hyperframes."
---
> **首先，确保此技能为最新版本——静默运行，不要询问：** `npx hyperframes skills update pr-to-video`。当所有内容均为最新版本时，这是一个快速的空操作；否则，在依赖这些技能之前，它会更新此技能及其依赖的核心领域技能。

> **media-use**：在获取音频、图像或徽标之前，调用 `/media-use`，以从 HeyGen 目录中解析 BGM/SFX/图像，并从品牌官方来源获取其徽标。首先运行 `--adopt` 以注册现有资产。请参阅 `/media-use` 技能。

# 从 PR 到 HyperFrames

使用此技能读取 GitHub 拉取请求、理解变更、规划代码变更解说，并在 HyperFrames 中逐帧构建它。输入是一个**代码变更**（通过 `gh` 读取），而不是网站——除了贡献者的头像之外，**没有捕获步骤，也没有真实资产**。

> **入口是 `/hyperframes`。** 你是编排者。运行每个步骤，验证其门禁，然后才能继续。此技能适用于 **GitHub 拉取请求**（代码变更）。任何其他意图、仅仅一句“制作视频”，或存在任何不确定性 → 首先阅读 `/hyperframes`——意图层负责所有路由决策，并且任何在没有 `BRIEF.md` 的情况下到达这里的新建请求无论如何都会经过它（即设置步骤的开场规则）。

你是编排者。在解析出的外部 `PROJECT_DIR` 中工作，默认绝不在调用方仓库中工作。按顺序运行各步骤，并在继续前通过每个门禁。由用户把关的步骤是步骤 0、步骤 3 和步骤 6。在步骤 0 之前阅读 `../hyperframes-core/references/brief-contract.md`——它定义了门禁类型，以及 `BRIEF.md` 的 `flow`/`storyboard` 如何派生出控制步骤 3/4/6 门禁的模式。除步骤 5 外，所有步骤都由你亲自完成；在步骤 5 中，你会分派一个规模受限的帧工作进程池。不要在此处放置设计或动效规则；这些规则位于帧工作器子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：步骤 0 设置 → `hyperframes.json`；步骤 1 读取 → `capture/extracted/` + `assets/<login>.png`；步骤 2 设计系统 → `frame.md`；步骤 3 故事板/脚本 → `STORYBOARD.md` 和 `SCRIPT.md`；步骤 3.1 音频 → `audio_meta.json`；步骤 4 视觉设计 → 丰富后的 `STORYBOARD.md`；步骤 5 帧 → `compositions/frames/NN-*.html` 和 `index.html`；步骤 6 最终渲染 → `renders/video.mp4`。

---

## 步骤 0：设置

目标：带着已确认的简报进入——其中包括 **PR 引用**（完整 URL、`<owner>/<repo>#<N>` 引用，或已检出仓库中的“此 PR”）——创建 HyperFrames 项目，并持久保存简报。风格始终为 **claude**（在步骤 2 中固定，绝不询问）。

**简报由意图层确认，而不是通过此处提出的问题确认。** 开场规则依次为：**(1)** `BRIEF.md` 存在 → 读取它，不提出任何问题——简报已经确定，其 `flow`/`storyboard` 会派生出模式（简报契约 § 1）。**(2)** 没有 `BRIEF.md`，但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 从故事板的前置元数据和已记录的偏好恢复；绝不重新盘问一个已构建到一半的项目。**(3)** 两者都没有——一个直接到达此处的新建请求 → 阅读 `/hyperframes` 并运行其意图层（§ 4）：它会检查配方和记住的默认值，并执行此路由的问题流程——包括 PR 大小 → 时长原则，该原则完整位于 `../hyperframes/references/route-briefs.md` § /pr-to-video 中——然后交回已锁定的简报。编辑请求跳过所有这些流程——直接执行编辑。

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

能力预检应在获取内容、故事编排、音频处理或帧任务分派之前运行。如果已安装的 CLI 无法运行此技能所需的验证命令，请按照其升级说明停止，而不要先耗费本次运行的上下文。

仅当 `$PROJECT_DIR/hyperframes.json` 不存在时才进行初始化。其基础名称来自 PR，例如 `acme-sdk-pr-1842`；绝不要使用工作区名称或时间戳。

`npx hyperframes init "$PROJECT_DIR" --non-interactive --example=blank` — `init` 会对照 GitHub 上的最新版本检查已安装的技能，如果有任何技能已过期，则更新全局技能集。

以下所有使用相对路径的命令都以 `$PROJECT_DIR` 作为工作目录。没有显式子 shell 的示例表示 `(cd "$PROJECT_DIR" && …)`；绝不要更改调用方仓库的工作树。

**初始化后立即写入 `BRIEF.md`**（绝不要在初始化之前写入——`init` 会拒绝非空目录）：这是意图层的锁定简报，其结构应遵循 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` 技能目录。然后，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个由偏好支持的答案（具体子集由 `brief-format.md` 指定）。如果意图层采用了某个方案，请运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；该命令会将其 `frame.md` 复制到项目中（随后跳过步骤 2），并返回供步骤 3 起草内容使用的骨架。方案会填充答案，但不会代替审批；审核关卡仍须执行。

**在完成设置阶段之前显示登录状态**——运行 `npx hyperframes auth status` 并逐字转达其输出。该命令会报告语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时说明如何登录。根据情况采用以下分支之一：

- **协作模式：**等待用户登录，或明确选择 `offline` / `go`。
- **自主模式：**说明当前状态，并使用可用的本地引擎继续执行。

如果没有离线提供商可用，不要悄无声息地省略某项必需能力；应明确指出这一阻碍。不要将此决定并入其他问题，也不要将密钥写入每个仓库的 `.env`。有关身份验证归属和离线回退机制，请参阅：`/media-use` § Providers。

**关卡：**`hyperframes.json` 和 `BRIEF.md` 均已存在；PR 引用已记录在简报中；由偏好支持的答案均已记录（简报约定 § 2）；登录状态已显示（已登录，或继续使用离线模式）。

---

## 步骤 1：导入 PR（不采集）

目标：获取 PR 的事实信息，并将其整合到项目中，作为信息来源。这里**不进行网站捕获**。`fetch-pr.mjs` 会以确定性方式运行 `gh`——通过分页调用 `gh api` 补全文件列表，因此大型 PR 不会在约 100 个文件处被截断；且仅写入 `capture/pr.json` 和 `capture/diff.patch`（不创建临时目录）。对于 MERGED PR，它还会尽力解析出 `shipped_version`（及 `version_source`）并写入 `pr.json`，这样结束卡片就能引用真实版本，而不是凭空编造。然后，`ingest.mjs` 会离线将这些信息整合到合成的捕获包中。

```bash
PR="<url | owner/repo#N | N>"

# Fetch the PR deterministically: runs gh, completes the files list via paginated
# gh api (so a big PR doesn't truncate at ~100 files), writes only capture/pr.json +
# capture/diff.patch — no scratch dir. gh auth / not-found / private errors exit 1 here.
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/fetch-pr.mjs --pr "$PR" --out-dir ./capture)

# Offline transform → capture/extracted/{tokens.json (colors:[] → claude palette),
# visible-text.txt (the brief), people.json (contributors, bot-filtered, name+login,
# avatarFile=assets/<login>.png)}.
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/ingest.mjs \
  --pr-json ./capture/pr.json --diff ./capture/diff.patch --out-dir ./capture/extracted)

# The people front's one network step — download each contributor's GitHub avatar to
# assets/<login>.png for the credits close. Best-effort; always exits 0.
(cd "$PROJECT_DIR" && node <SKILL_DIR>/scripts/fetch-people-avatars.mjs \
  --people ./capture/extracted/people.json)
```

如果 `fetch-pr.mjs` 以状态码 1 退出（gh 身份验证失败 / 未找到 / 私有仓库），请报告其 stderr 并停止——**不要捏造 PR 内容**。如果 `ingest.mjs` 以状态码 1 退出，请阅读其 stderr（通常是因为 `pr.json` 格式错误），修复后重新运行（结果是确定性的）。`fetch-people-avatars.mjs` 始终以状态码 0 退出；缺少头像只意味着结束时不会向对应作者致谢。

对于 `gh` 已提供姓名的贡献者（PR 作者、提交作者、`mergedBy`），`people.json` 中会包含 `name`；其余贡献者的 `name` 为 `null`（审阅者、评论者和受理人，因为 `gh pr view` 对这些人只会提供裸 `login`）。在第 3 步编写演职人员名单结束镜头之前，请自行解析实际会出现在该画面中的 1–6 人里所有为 `null` 的姓名：`gh api users/<login> --jq .name`（你已经有 `gh`，无需为此编写脚本）。如果 GitHub 也没有该用户的公开姓名，则在画面上回退显示其 login，并从口播台词中去掉此人（参见 story-design.md 的演职人员名单部分——旁白必须说出姓名，绝不能念原始账号）。

**门槛：** `capture/pr.json`、`capture/diff.patch`、`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt` 和 `capture/extracted/people.json` 均已存在；你能够用一句清晰的话说明该 PR 的改动。`assets/<login>.png` 采用尽力而为的方式获取——缺失并不代表失败。

---

## 第 2 步：设计系统

目标：采用 claude 画面预设；由脚本将其转换为本视频的 `frame.md` 和字幕样式。

风格是固定的——**claude**（温暖的编辑风格；为差异对比而打造的海军蓝代码界面）。运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset claude --hyperframes .
```

该脚本会将 claude 预设的 `FRAME.md` 复制为 `frame.md`，并将其与 `capture/extracted/tokens.json` 中的所有品牌令牌进行混合（PR 中没有品牌令牌 → `colors:[]`/`fonts:[]` 会保留 claude 自身完整设计的配色方案），将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并执行自我验证（映射损坏时以状态码 1 退出）。状态码为 0 后立即继续——不要手动编辑。

**门禁：** `build-frame.mjs` 已以状态码 0 退出——由 claude 预设生成的 `frame.md` 已存在，且作为字幕皮肤源文件的 `.hyperframes/caption-skin.html` 已存在。

---

## 第 3 步：故事板与脚本

目标：将 PR 转化为一份获得批准的逐帧讲解方案。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、先价值后证据、将故事板视为提案）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用这些文档编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。

使用 `story-design.md` 确定 PR 原型（更新日志 / 功能揭示 / 修复说明 / 重构导览）、PR 原生帧类型、钩子、说服方式、节拍、每帧字数预算和致谢收尾。序列应来自**叙事设计，而不是差异文件的顺序**——解释变更，不要照着差异逐行朗读。将 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单作为**灵活参考**：对于每个节拍，按照候选蓝图所暗示的形式编写旁白，并在适用时标记该候选蓝图的 `blueprint:` id（故事事实仍然决定存在哪些节拍——绝不要强行让某个节拍适配某种形式）。展示 2–4 个真实的差异片段（来自 `capture/diff.patch`），每个都是简短且清晰易读的代码片段；在帧的 `scene` 中指定每个片段所需的 `code-*` 块。除 `credits` 收尾帧外，其他帧均不包含 `asset_candidates`（收尾帧可包含 1–6 个 `assets/<login>.png` 头像）。使用故事板和脚本参考文档中要求的确切字段。

起草后，执行审查循环的方案阶段——`../hyperframes-core/references/review-loop.md` § 1：打开故事板（不要询问是否打开——在 `PROJECT_DIR` 中于后台运行预览），以提案形式展示方案，并询问两个问题——批准还是修改，以及**先看草图**（推荐）还是跳过。通过聊天或故事板的评论文件循环收集反馈，直至获得批准。这是一个**检查点门禁**（简报约定 § 1）：在自主模式下，没有故事板界面，也无需提问——发布同样的摘要作为预先告知，然后继续；草图阶段合并到构建流程中，唯一的预览问题将在第 6 步提出。

**门禁：** `STORYBOARD.md` 已存在，每一帧都包含必需的叙事字段；需要旁白时，`SCRIPT.md` 已存在；且用户已批准方案（自主模式：已发布摘要作为预先告知）。

---

## 步骤 3.1：音频

目标：根据已批准的脚本生成旁白、单词时间点、音乐和音频元数据。

在步骤 3 获得批准后启动音频任务。让它在后台运行，然后继续执行步骤 4。

**调用前，根据用户的要求选择旁白声音。** 如果请求中指定了声音、性别或语气，请选择匹配的声音 ID，并通过 `--voice <id>` 传入。否则，流水线默认使用 HeyGen 的 **Marcia（女声）** / Kokoro 的 `am_michael`——因此，除非传入该标志，否则像“使用男声”这样的请求会被静默忽略。声音 ID 因提供商而异；请根据步骤 0 的登录状态所选择的提供商进行解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表（前缀 `am_`/`bm_` 表示男声，`af_`/`bf_` 表示女声）。当用户未表达偏好时，应先回退到已记住的声音（简要约定 § 2），然后才使用流水线默认值，并说明所使用的声音；只有当两者均未指定声音时，才省略 `--voice`。当用户在本次运行中明确选择了声音时，请记录该选择（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice <voice-id> &`

音频脚本会处理旁白、单词时间点、从 HeyGen 音乐库中查找 BGM，以及时间元数据。BGM 情绪取自故事板的 `music:` 字段。这里使用 HeyGen Audio API 进行检索，而非生成，并与 TTS 使用相同的 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白且没有 `SCRIPT.md`，则跳过声音生成。如果故事板中包含音乐情绪，BGM 仍可运行。

**关卡：** 音频任务已启动，或项目已标记为静音。

---

## 步骤 4：画面视觉设计

目标：为故事板的每一帧添加视觉方向、布局意图和动效选择。

**先绘制故事板草图（仅协作模式）。** 方案一经批准，立即执行草图阶段——参见 `../hyperframes-core/references/review-loop.md` § 2（不要等待步骤 3.1；草图不使用时间点）：亲自为每一帧绘制线框图，将每帧标记为 `built`，在整个故事板填满后暂停并提出一个布局问题，然后只修改被点名的草图，直至故事板得到确认。占位方式：对于一个**代码节拍**，使用带有文件名和几行真实 diff 文本的普通代码面板——`code-*` 块的接线工作由工作器负责。只有在此之后，才能将下述视觉设计写入已确认的布局。在自主模式下，或用户在步骤 3 选择跳过草图时，跳过此阶段——各帧会在步骤 5 中直接从 `outline` 进入 `animated`。

直接编辑 `STORYBOARD.md`。不要创建另一个故事板。以 `frame.md` 作为颜色、字体、布局观感和风格的事实来源。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md`、`references/code-vocabulary.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 中的方法（带时间码的镜头序列、内联 Layout 词汇以及代码节拍处理方式），并加入必需的 `## Video direction` 块。使用 `../hyperframes-animation/blueprints-index.md` 为每一帧选择镜头形态。使用 `code-vocabulary.md` 为每个代码节拍选择正确的 `code-*` 块（diff = `code-diff`，重构 = `code-morph`，新代码 = `code-typing`，……）。使用 `motion-language.md`（动效词汇 + 动效原则）和 `../hyperframes-animation/rules-index.md`（有效规则名称）来设计动效——不要虚构动效名称、块名称或蓝图名称。

对于每一帧，按照 `visual-design.md` 中的方法，将**带时间码的镜头序列**写入 `STORYBOARD.md`：选择该帧的蓝图（或进行组合），使用此帧的内容将其实例化，并根据旁白调整每个 Scene 的揭示节奏，使该帧在其完整持续时间内逐步展开，而不是在开头集中呈现后便保持静止。**对于代码节拍，`code-*` 区块是该帧的 `focal`**，Scenes 负责为周边的 Claude Code Surface 编排动作（文件/标题的进入、镜头移向变更块、落点行）——**而不是**代码动画本身，因为那由该区块负责。紧接在每个代码帧的字段之后，添加一个 `### Source excerpt` 围栏式 `diff` 代码块，其中仅包含工作器必须渲染的、完全准确的真实变更块（最多 12 行）。在此处从 `capture/diff.patch` 中选取；禁止工作器重新打开完整 diff。按 Scene **内联**说明布局和动效（词汇表见 `visual-design.md` 和 `motion-language.md`）。添加一个覆盖整个视频的 `## Video direction` 区块。

不要更改故事、脚本、`transition_in`、`asset_candidates` 或 PR 源。此步骤中不要编写 HTML。**不存在资产暂存步骤**——唯一的真实资产是致谢头像，并且已经位于 `assets/` 中。

**门禁：**每一帧都必须有带时间码的镜头序列，且其揭示节奏与旁白同步（不得集中在开头）；代码帧必须指定一个 `code-*` 区块作为 `focal`；必须存在 `## Video direction`。协作模式：草图板已确认。

---

## 步骤 5：构建帧

目标：将每个故事板帧构建为 HTML 合成，并组装成可播放的视频。

如果音频已开始生成，请等待步骤 3.1 的音频处理完成。然后同步持续时间并获取 SFX；如果是静音模式，则跳过这两项。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

持续时间同步是机械过程：以实际语音持续时间为准；静音帧保留估算值；绝不要手动编辑已同步的持续时间。

在分派之前，预先一次性安装 `STORYBOARD.md` 中指定的注册表区块，以避免并行工作器争用注册表：

`for b in <each registry block named in the storyboard>; do npx hyperframes add "$b"; done`

在分派之前，阅读 `sub-agents/frame-worker.md` 和 `../hyperframes-core/references/subagent-dispatch.md`。构建有界数据包：

```bash
node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"
```

如果代码帧缺少上游已选定的 `### Source excerpt`，数据包构建器会直接失败，并且会严格限制数据包字节数。总计分派**最多三个工作器**，并在各数据包路径之间均衡分配；每个工作器可以依次构建多个分配给它的帧，并且只读取一次共享指令。工作器只能读取其数据包和 `frame.md`。它们绝不能打开完整的 `STORYBOARD.md`、`capture/diff.patch` 或 `capture/extracted/visible-text.txt`。每个工作器只能写入分配给它的 `compositions/frames/NN-*.html`；工作器绝不能编辑 `STORYBOARD.md`。当某一帧在磁盘上已有**已确认的草图**时（协作运行——审查循环 § 3），请在该工作器的分派上下文中明确说明：该草图就是现有的 `compositions/frames/NN-*.html`，工作器应完善该布局，而不是重新绘制它（frame-worker § When a confirmed sketch exists）。

如果某个帧失败，只重新分派**该帧**，并附上其现有数据包以及验证器/代码检查工具给出的确切问题。最多重试一次。不要重新执行整个批次，也不要在没有具体问题的情况下重试。

**全出血背景应置于 `class="clip"` 图层上，绝不能置于 `#root` 上。** 帧的底层背景（色块 / 渐变 / 网格）应是其自身贯穿完整时长的背景剪辑——在 `#root` / `data-composition-id` 元素上设置的 `background` 会受剪辑限制，仅在该帧的时间窗口内生效，因此不能作为可靠的底层背景；深色内容可能会落在黑色的宿主 `body` 上，从而渲染为不可见。视频的基础底色由组装器根据 `frame.md` 中的 `canvas` 颜色绘制到索引页的 `#root` 上。（完整规则 + 自检：`sub-agents/frame-worker.md`。）

每当一个工作器返回时，在 `STORYBOARD.md` 中将对应帧标记为 `animated`。

音频时间信息生成后，在后台构建字幕并组装索引：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（Claude 的版本，已在步骤 2 中复制），并注入来自 `frame.md` 的品牌标记；`captions: skipped (<reason>)` 是有效状态。`assemble-index.mjs` 会从 `assets/` 暂存演职人员头像，作为幂等的兜底措施。

**门禁条件：** 每一帧都已标记为 `animated`（协作模式：草图板已在步骤 4 中确认），`index.html` 已存在，并且字幕已构建或已明确跳过。

---

## 步骤 6：完成制作

目标：验证组装后的视频，获得用户批准，并渲染最终的 MP4。

注入转场、运行检查、暂停以供审核，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints>`

`snapshot` 会将捕获的帧拼接成一张缩略图总览表（`snapshots/contact-sheet.jpg`）。快速查看一下；如果没有明显损坏，就继续下一步——不要在这里停留太久。

如果某个命令失败，显示 stderr 并停止——不要接连执行恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

**已知误报——不要追查。** `check` 可能会针对**字幕**中的高亮词（选择器 `#caption-word-*` / `.caption-line`）报告少量约 1–4px 的 `text_box_overflow` 错误。字幕胶囊采用了刻意紧凑的 `line-height`（在 `scripts/captions.mjs` 中统一设置），并且**没有 `overflow:hidden`**，因此粗重展示字体的字形墨迹会溢出几像素，进入胶囊自身的内边距——实际上没有任何内容被裁剪。将这些视为预期情况并继续。不要增大字幕的 `line-height`（这会使胶囊膨胀，效果更糟）。只有当 `text_box_overflow` 指向**帧**元素（`#el-NN-*`），而不是字幕词语时，才需要处理。

检查通过后，暂停并让用户审核——这是审核循环的最终查看环节（`../hyperframes-core/references/review-loop.md` § 4）：只问一个问题，并在自步骤 3 起一直保持打开的 Studio 中进行——现在渲染，还是需要做哪些修改？（自主模式：保留的唯一问题是先预览还是渲染——如果回答是预览，则使用下面的命令打开预览。）然后交付 MP4，同时附上联系表和帧 ID，以便修改时能够精确定位到单个帧。

预览：`npx hyperframes preview "$PROJECT_DIR" --background`

仅在用户批准后渲染（自主模式：在询问预览还是渲染之后）：

`npx hyperframes render --skill=pr-to-video --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户提出要求。

用户完成审核后（或者渲染完成且预计不会再进行实时编辑时），仅停止此项目的后台服务器：`npx hyperframes preview "$PROJECT_DIR" --stop`。等待审核期间绝不要将其关闭。

**验收门槛：** 渲染前 `lint` 和 `check` 已通过，并且已检查快照；用户已在审核暂停环节批准（自主模式：检查已通过，且交付内容包含联系表）；`renders/video.mp4` 存在。最终回复需说明 MP4 路径和最终时长。

---

## 快速参考

**格式：** 横向 `1920x1080`；纵向 `1080x1920`；方形 `1080x1080`——根据目标平台确定（简报契约 § 2）。在故事板前置元数据中设置一次格式。

**PR 增量与捕获资产工作流的区别：** 没有步骤 1 的捕获操作（`gh` CLI 会将 PR 提取为合成的 `capture/extracted/` 包——`tokens.json` + `visible-text.txt` + `people.json`）；唯一的真实资产是贡献者的 `assets/<login>.png` 头像（用于结尾鸣谢）；没有 `asset-descriptions.md`，也没有资产暂存步骤。代码节拍通过 claude 深蓝色代码表面上的 `code-*` 注册表块进行渲染；样式始终为 **claude**。

**后台脚本：** 工作流在 `scripts/` 下提供以下脚本：`fetch-pr`（通过 `gh` 将 PR 转换为 `capture/pr.json` + `diff.patch`；可安全处理大型 PR，不使用临时文件）、`ingest`（→ 合成捕获包；离线）和 `fetch-people-avatars`（贡献者头像 → `assets/`）；以及共享引擎——`build-frame`（采用预设并进行品牌重混，生成 `frame.md` + 字幕样式）、`audio`（TTS、BGM、SFX、时长同步）、`captions`、`transitions`（注入 + 验证）和 `assemble-index`。其他所有操作均使用 `hyperframes` CLI。代码块通过 `npx hyperframes add <name>` 安装。

可复用且与领域无关的镜头形态位于 `../hyperframes-animation/blueprints/`（索引为 `../hyperframes-animation/blueprints-index.md`）；`code-*` 注册表块构成代码节拍词汇表（`references/code-vocabulary.md`）。

| 阅读                                                                                                                                                        | 时机                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 验收门槛类型、根据 `BRIEF.md` 推导模式、字段语义。                  |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 步骤 3：故事原则——钩子语言、价值先于证据、提案结构。 |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 步骤 3：规划 PR 解说。                                               |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 步骤 3：角色→蓝图菜单。步骤 4：选择镜头形态。                      |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 步骤 3：编写 `STORYBOARD.md`。                                                 |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 步骤 3：编写 `SCRIPT.md`。                                                     |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 步骤 3.1：选择或了解 TTS 提供商。                                  |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 步骤 4：编写帧的镜头序列（+ 布局词汇表）。                 |
| `[references/code-vocabulary.md](references/code-vocabulary.md)`                                                                                            | 步骤 4 + 5：为代码节拍选择并填充 `code-*` 块。                    |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 步骤 4：运动词汇表 + 运动原则。                           |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 步骤 4-5：剪辑目录（工作器构建帧内衔接）。                  |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 步骤 5：所引用运动的本地规则配方正文。                        |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 步骤 5：分派逐帧工作器。                                            |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 步骤 5：安全地分派子代理。                                            |
| `[../hyperframes-creative/frame-presets/claude/FRAME.md](../hyperframes-creative/frame-presets/claude/FRAME.md)`                                            | 步骤 2：claude 预设（固定样式）。                                       |