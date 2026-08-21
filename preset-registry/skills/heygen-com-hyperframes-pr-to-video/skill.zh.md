---
name: pr-to-video
description: "Turn a GitHub pull request (a PR URL, owner/repo#N, or 'this PR' in a checked-out repo) into a code-change explainer video — changelog, feature reveal, fix, or refactor walkthrough built from the diff, commits, and files: the input is a code change, not a website. Not a product promo (/product-launch-video) or a no-PR topic explainer (/faceless-explainer). Unclear → /hyperframes."
---
> **首先，保持此技能为最新版本——运行前需征得用户确认：** `npx hyperframes skills update pr-to-video`。如果所有内容均为最新，此命令会快速执行空操作；否则，它会刷新此技能及其依赖的核心领域技能，之后你便可使用它们。

> **media-use**：在获取音频、图像或徽标之前，调用 `/media-use`，从 HeyGen 目录中解析 BGM/SFX/图像，并从品牌官方来源获取徽标。先运行 `--adopt` 以登记现有资产。请参阅 `/media-use` 技能。

# 从 PR 到 HyperFrames

使用此技能读取 GitHub 拉取请求、理解变更、规划代码变更解说，并在 HyperFrames 中逐帧构建。输入是一个**代码变更**（通过 `gh` 读取），而不是网站——**没有捕获步骤，也没有真实资产**，贡献者头像除外。

> **入口是 `/hyperframes`。** 你是编排器。运行每个步骤、验证其门禁，然后才能继续。此技能适用于 **GitHub 拉取请求**（代码变更）。任何其他意图、单独一句“制作视频”，或任何不确定情况 → 先阅读 `/hyperframes`——意图层负责所有路由决策，而且未携带 `BRIEF.md` 而进入这里的新建请求无论如何都会经过该层（Setup 的开场规则）。

你是编排器。在解析后的外部 `PROJECT_DIR` 中工作，默认情况下绝不要在调用方仓库中工作。按顺序运行各步骤，并在继续之前通过每个门禁。需要用户确认的步骤是步骤 0、步骤 3 和步骤 6。在步骤 0 之前阅读 `../hyperframes-core/references/brief-contract.md`——它定义了门禁类型，以及如何从 `BRIEF.md` 的 `flow`/`storyboard` 推导出控制步骤 3/4/6 门禁的模式。除步骤 5 外，所有步骤都由你亲自完成；在步骤 5 中，你会调度一个规模受限的帧工作器池。不要在这里放置设计或动效规则；这些规则位于帧工作器子代理、此技能本地的 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative` 中。

工作流：步骤 0 设置 → `hyperframes.json`；步骤 1 读取 → `capture/extracted/` + `assets/<login>.png`；步骤 2 设计系统 → `frame.md`；步骤 3 故事板/脚本 → `STORYBOARD.md` 和 `SCRIPT.md`；步骤 3.1 音频 → `audio_meta.json`；步骤 4 视觉设计 → 丰富后的 `STORYBOARD.md`；步骤 5 帧 → `compositions/frames/NN-*.html` 和 `index.html`；步骤 6 最终渲染 → `renders/video.mp4`。

---

## 步骤 0：设置

目标：携带已确认的简报进入——其中包括 **PR 引用**（完整 URL、`<owner>/<repo>#<N>` 引用，或在已检出的仓库中使用“this PR”）——创建 HyperFrames 项目，并将简报持久化。风格始终为 **code-editorial**（在步骤 2 中固定，不进行询问）。

**简报由意图层确认，而不是通过在此处提问来确认。** 开场规则按以下顺序执行：**(1)** `BRIEF.md` 存在 → 读取它，不提出任何问题——简报已确定，其 `flow`/`storyboard` 会推导出模式（简报契约第 1 节）。**(2)** 不存在 `BRIEF.md`，但项目已存在（磁盘上存在 `hyperframes.json` / `STORYBOARD.md`）→ 根据故事板的 frontmatter 和已记录的偏好继续；绝不要重新盘问一个完成了一半的项目。**(3)** 两者均不存在——直接进入此处的新建请求 → 阅读 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：它会检查配方和已记忆的默认值，并执行此路由的问题流程——包括 PR 大小 → 时长原则，其完整内容位于 `../hyperframes/references/routes/pr-to-video.md`——然后交回已锁定的简报。编辑请求跳过以上所有流程——直接执行编辑。

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

能力预检应在获取内容、故事制作、音频处理或帧任务分发之前运行。如果已安装的 CLI 无法运行此技能所需的验证命令，请按照其升级说明停止执行，而不要先消耗本次运行的上下文。

仅当 `$PROJECT_DIR/hyperframes.json` 不存在时才初始化。其基本名称取自 PR，例如 `acme-sdk-pr-1842`；绝不要使用工作区名称或时间戳。

`npx hyperframes init "$PROJECT_DIR" --non-interactive --example=blank --skill=pr-to-video` — `init` 会将已安装的技能与 GitHub 上的最新版本进行比对，如果有任何技能已过时，则更新全局技能集。

下方所有使用相对路径的命令都以 `$PROJECT_DIR` 作为工作目录。没有显式子 shell 的示例均表示 `(cd "$PROJECT_DIR" && …)`；绝不要更改调用方仓库的工作树。

**初始化后立即写入 `BRIEF.md`**（绝不要在初始化之前写入——`init` 会拒绝非空目录）：这是意图层中已锁定的简报，其结构遵循 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` 技能目录。然后，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个由偏好支持的答案（具体子集由 `brief-format.md` 指定）。如果意图层采用了某个方案，请运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；该命令会将其 `frame.md` 复制到项目中（随后跳过步骤 2），并返回供步骤 3 起草内容使用的框架。方案会填充答案，但不会代替审批；审核关卡仍然需要执行。

**在完成设置阶段并继续之前显示登录状态**——运行 `npx hyperframes auth status`，并逐字转达其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时说明如何登录。根据情况采用以下一个分支：

- **协作模式：**等待用户登录，或明确选择 `offline` / `go`。
- **自主模式：**说明当前状态，然后继续使用可用的本地引擎。

当不存在离线提供程序时，不要静默省略所需能力；应明确指出阻塞问题。不要将此决定合并到其他问题中，也不要将密钥写入每个仓库各自的 `.env`。有关认证归属和离线回退的信息，请参阅 `/media-use` 的 `references/setup-providers.md` § Providers。

**关卡：**`hyperframes.json` 和 `BRIEF.md` 均已存在；PR 引用已记录在简报中；由偏好支持的答案已记录（简报约定 § 2）；登录状态已显示（已登录，或继续离线执行）。

---

## 第 1 步：摄取 PR（不进行捕获）

目标：获取 PR 的事实信息，并将其整合到项目中，作为信息来源。此过程**不进行网站捕获**。`fetch-pr.mjs` 会以确定性方式运行 `gh`——通过分页调用 `gh api` 补全文件列表，以免大型 PR 在约 100 个文件处被截断；并且仅写入 `capture/pr.json` 和 `capture/diff.patch`（不创建临时目录）。对于 MERGED PR，它还会尽力解析 `shipped_version`（以及 `version_source`）并写入 `pr.json`，这样结束卡片就能引用真实版本，而不是凭空编造。随后，`ingest.mjs` 会离线将这些内容整合到合成的捕获包中。

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

如果 `fetch-pr.mjs` 以状态码 1 退出（gh 身份验证失败 / 未找到 / 私有仓库），请报告其 stderr 并停止——**不要伪造 PR 内容**。如果 `ingest.mjs` 以状态码 1 退出，请读取其 stderr（通常是因为 `pr.json` 格式错误），修复后重新运行（结果是确定性的）。`fetch-people-avatars.mjs` 始终以状态码 0 退出；缺少头像只意味着无法为该作者制作致谢收尾画面。

对于 `gh` 已提供姓名的贡献者（PR 作者、提交作者、`mergedBy`），`people.json` 会包含其 `name`；其余贡献者的该字段为 `null`（审阅者、评论者和受理人，因为 `gh pr view` 对这些人只会提供一个简单的 `login`）。在第 3 步编写致谢收尾画面之前，请自行解析实际会出现在该画面中的 1–6 位人员里任何为 `null` 的姓名：`gh api users/<login> --jq .name`（你已经有 `gh`，无需为此编写脚本）。如果 GitHub 也没有该用户的公开姓名，则在画面中回退使用其登录名，并从口播台词中移除此人（参见 story-design.md 的致谢部分——旁白仍然必须念出姓名，绝不能直接念用户名）。

**检查点：** `capture/pr.json`、`capture/diff.patch`、`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt` 和 `capture/extracted/people.json` 均已存在；你能够用一句清晰的话说明该 PR 的改动。`assets/<login>.png` 采用尽力而为策略——缺少该文件不代表失败。

---

## 第 2 步：设计系统

目标：采用代码编辑风格的画面预设；由脚本将其转换为本视频的 `frame.md` 和字幕样式。

风格是固定的——**code-editorial**（温暖的编辑风格；专为展示差异而打造的海军蓝代码界面）。运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset code-editorial --hyperframes .
```

该脚本会将 code-editorial 预设的 `FRAME.md` 复制为 `frame.md`，根据 `capture/extracted/tokens.json` 中的品牌令牌对其进行重新混合（PR 中没有品牌令牌 → `colors:[]`/`fonts:[]` 会保留 code-editorial 自有的完整设计配色方案），将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并执行自我验证（映射损坏时以状态码 1 退出）。一旦它以状态码 0 退出，就立即继续——不要手动编辑。

**门禁：** `build-frame.mjs` 已以状态码 0 退出——基于 code-editorial 预设的 `frame.md` 已存在，且作为字幕皮肤源的 `.hyperframes/caption-skin.html` 已存在。

---

## 第 3 步：故事板与脚本

目标：将 PR 转化为经过批准的逐帧讲解方案。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、价值先于证据、将故事板视为提案、可追溯到来源的视觉内容）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用这些资料编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。根据简报中的 `length` 设置 frontmatter 的 `duration:`——这只是一个粗略预期；组装阶段会报告最终剪辑的时长与该预期的差异。

使用 `story-design.md` 确定 PR 原型（变更日志 / 功能揭晓 / 修复说明 / 重构演练）、PR 原生帧类型、钩子、说服方式、节拍、每帧字数预算以及致谢收尾。序列来自**叙事设计，而不是差异文件的顺序**——要解释变更，不要照着差异逐行朗读。将 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单作为**宽松指南**：针对每个节拍，按照候选蓝图所暗示的结构编写画外音，并在合适时标记该候选的 `blueprint:` id（仍由故事事实决定存在哪些节拍——绝不要强迫某个节拍适配某种结构）。展示 2–4 个真实的差异片段（来自 `capture/diff.patch`），每个都应是简短且清晰易读的代码片段；在对应帧的 `scene` 中指明每个片段所需的 `code-*` 块。除 `credits` 收尾帧外，其他帧均不包含 `asset_candidates`（收尾帧可包含 1–6 个 `assets/<login>.png` 头像）。使用故事板和脚本参考文档中明确要求的字段。

起草完成后，运行审核循环的方案审查阶段——`../hyperframes-core/references/review-loop.md` § 1：打开故事板（不要询问是否打开——从 `PROJECT_DIR` 在后台运行预览），将方案作为提案呈现，并询问两个问题——批准还是修改，以及**先看草图**（推荐）还是跳过。反馈通过聊天或故事板的评论文件进入循环，直至方案获批。这是一个**检查点门禁**（简报契约 § 1）：在自主模式下，没有故事板界面，也无需询问——发布相同的摘要作为预告，然后继续；草图环节并入构建过程，唯一的预览问题留到第 6 步提出。

**门控条件：** `STORYBOARD.md` 已存在，每一帧都包含必需的叙事字段，需要旁白时 `SCRIPT.md` 已存在，并且用户已批准该计划（自主模式：已发布摘要作为预先通知）。

---

## 步骤 3.1：音频

目标：根据已批准的脚本生成旁白、字词时间信息、音乐和音频元数据。

在步骤 3 获得批准后开始处理音频。在后台运行音频任务，然后继续执行步骤 4。

**调用前，根据用户的要求选择旁白音色。** 如果请求中指定了音色、性别或语气，请选择匹配的音色 ID，并通过 `--voice <id>` 传入。否则，流水线默认在 HeyGen 上使用 **Marcia（女声）**，在 Kokoro 上使用 `am_michael`——因此，除非传入该标志，否则像“男性声音”这样的请求会被悄然忽略。音色 ID 因提供商而异；请根据步骤 0 的登录状态所选定的提供商进行解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的音色表（前缀 `am_`/`bm_` 表示男声，`af_`/`bf_` 表示女声）。如果用户未表达偏好，请先使用已记住的音色（简要约定 § 2），然后才使用流水线默认音色，并说明使用了哪一个；只有当两者都未指定音色时，才省略 `--voice`。当用户在本次运行中明确选择了音色时，记录该偏好（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice <voice-id> &`

音频脚本负责处理旁白、字词时间信息、从 HeyGen 音乐库中查找 BGM，以及时间元数据。BGM 情绪取自故事板的 `music:` 字段。此流程使用 HeyGen Audio API 进行检索，而不是生成，并与 TTS 使用相同的 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白，也没有 `SCRIPT.md`，则跳过语音生成。如果故事板中指定了音乐情绪，BGM 仍可运行。

**标准的完全静音标记**（在复用此音频模型的工作流之间共享）：`STORYBOARD.md` 顶部 YAML 块中的 `music: none`，**并且**不存在 `SCRIPT.md`。此组合将项目标记为静音——无旁白、无 BGM、无 SFX。`audio.mjs` 能识别该标记并且不会生成任何内容（它会移除任何过期的 `audio_meta.json`；缺少 `audio_meta.json` 正是 assemble 将项目视为静音的依据），因此可以完全跳过此步骤。存在旁白时使用 `music: none`，会保留 TTS，仅关闭 BGM。请严格使用这一拼写——不要自行创造其他标记。

**门控条件：** 音频任务已启动，或者项目已标记为静音（`music: none` + 无 `SCRIPT.md`）。

---

## 步骤 4：帧视觉设计

目标：为故事板中的每一帧添加视觉指导、布局意图和动效选择。

**先绘制故事板草图（仅协作模式）。** 计划一经批准，立即运行草图流程——`../hyperframes-core/references/review-loop.md` § 2（不要等待步骤 3.1；草图不使用时间信息）：亲自为每一帧绘制线框图，将每一帧标记为 `built`，当故事板全部完成后暂停并提出一个布局问题，然后仅修改指定的草图，直到故事板得到确认。占位内容：对于**代码节拍**，使用一个简单的代码面板，其中以文本形式显示文件名和几行真实的差异内容——`code-*` 块的连接工作由工作进程负责。只有在此之后，才能将下述视觉设计写入已确认的布局。在自主模式下，或者用户在步骤 3 选择跳过草图时，跳过此流程——各帧将在步骤 5 中直接从 `outline` 进入 `animated`。

就地编辑 `STORYBOARD.md`。不要创建其他故事板。以 `frame.md` 作为色彩、字体、布局观感和风格的事实来源。

阅读 `references/visual-design.md`、`../hyperframes-animation/blueprints-index.md`、`references/motion-language.md`、`references/code-vocabulary.md` 和 `../hyperframes-animation/rules-index.md`。使用 `visual-design.md` 中的方法（带时间码的镜头序列、内联 Layout 词汇以及代码节拍处理方式），并加入必需的 `## Video direction` 区块。使用 `../hyperframes-animation/blueprints-index.md` 为每一帧选择镜头形态。使用 `code-vocabulary.md` 为每个代码节拍选择正确的 `code-*` 区块（差异 = `code-diff`，重构 = `code-morph`，新增代码 = `code-typing`，……）。使用 `motion-language.md`（动效词汇 + 动效准则）和 `../hyperframes-animation/rules-index.md`（有效规则名称）来设计动效——不要虚构动效、区块或蓝图名称。

对于每一帧，按照 `visual-design.md` 中的方法，在 `STORYBOARD.md` 中写入一个**带时间码的镜头序列**：选择该帧的蓝图（或进行组合），使用本帧的内容将其实例化，并让每个 Scene 的展示节奏与旁白同步，使画面在整个持续时间内逐步展开，而不是在开头一次性展示完毕后便静止不动。**对于代码节拍，`code-*` 区块是该帧的 `focal`**，Scenes 负责围绕它编排代码编辑式 Code Surface（文件/标题的进入、镜头移向代码块、最终落点行）——**而不是**编排代码动画本身，因为这由该区块负责。紧接在每个代码帧的字段之后，添加一个 `### Source excerpt` 围栏式 `diff` 代码块，其中只包含工作器必须渲染的准确真实代码片段（最多 12 行）。在此步骤中从 `capture/diff.patch` 选择该片段；禁止工作器重新打开完整差异文件。在每个 Scene 中**内联**注明布局和动效（使用 `visual-design.md` 和 `motion-language.md` 中的词汇）。添加一个视频全局的 `## Video direction` 区块。

不要更改故事、脚本、`transition_in`、`asset_candidates` 或 PR 来源。此步骤不要编写 HTML。**不存在素材暂存步骤**——唯一的真实素材是贡献者头像，且已位于 `assets/` 中。

**门禁条件：**每一帧都有带时间码的镜头序列，并且展示节奏与旁白同步（不得在开头一次性展示完毕）；代码帧将一个 `code-*` 区块指定为 `focal`；存在 `## Video direction`。协作状态：草图板已确认。

---

## 步骤 5：构建帧

目标：将故事板中的每一帧构建为 HTML 合成画面，并组装成可播放的视频。

如果已启动音频生成，请等待步骤 3.1 的音频完成。然后同步持续时间并获取音效；如果是静音视频，则跳过这两项操作。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

持续时间同步是机械式的：以真实语音时长为准；静音帧保留估算时长；绝不要手动编辑已同步的持续时间。

在分派任务之前，先一次性**预安装注册表区块**中 `STORYBOARD.md` 提到的区块，以免并行工作器在访问注册表时发生竞争：

`for b in <each registry block named in the storyboard>; do npx hyperframes add "$b"; done`

分派前，请阅读 `../hyperframes-core/references/subagent-dispatch.md`。构建有边界的数据包和工作器角色载荷：

```bash
node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"
```

如果代码帧缺少上游选定的 `### Source excerpt`，数据包构建器会直接报错，并且会严格限制数据包的字节数。它还会写入 `_role.md`（将 `../hyperframes-core/references/frame-worker-core.md` 与本技能的 `sub-agents/frame-worker.md` 逐字拼接——即完整的工作器角色）。分派的工作器**总数最多为三个**，并在各数据包路径之间均衡分配；每个工作器的提示词都包含 `_role.md` 及分配给它的数据包路径——可以完整粘贴角色内容，也可以提供其路径（两者等效；工作器完全从这些文档开始）——每个工作器都可以依次构建分配给它的多个帧，只需读取一次角色。工作器仅可读取其数据包和 `frame.md`。它们绝不打开完整的 `STORYBOARD.md`、`capture/diff.patch` 或 `capture/extracted/visible-text.txt`。每个工作器仅写入分配给它的 `compositions/frames/NN-*.html`；工作器绝不编辑 `STORYBOARD.md`。当某个帧在磁盘上已有**确认过的草图**时（协作运行——审查循环 § 3），请在该工作器的分派上下文中说明：该草图就是现有的 `compositions/frames/NN-*.html`，工作器应基于该布局进行装饰，而不是重新绘制（工作器核心文档的 § When a confirmed sketch exists）。

某个帧失败时，仅重新分派**该帧**，并附上其现有数据包以及验证器/代码检查工具的确切发现。最多重试一次。不要重新执行整个批次，也不要在没有具体发现的情况下重试。

**全出血背景应置于 `class="clip"` 图层上，而绝不能置于 `#root` 上。** 帧的底层背景（色块/渐变/网格）应作为独立的全时长背景剪辑——在 `#root` / `data-composition-id` 元素上设置的 `background` 会受剪辑限制，仅在该帧的时间窗口内生效，因此不能作为可靠的底层背景，否则深色内容可能落在黑色宿主 `body` 上而不可见。视频的基础底色由组装器根据 `frame.md` 的 `canvas` 颜色绘制到索引页的 `#root` 上。（完整规则与自检：`../hyperframes-core/references/frame-worker-core.md`。）

每当一个工作器返回后，将 `STORYBOARD.md` 中对应帧标记为 `animated`。

音频时间信息生成后，在后台构建字幕并组装索引页：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目的 `.hyperframes/caption-skin.html`（即 code-editorial 的版本，已在步骤 2 中复制），并注入来自 `frame.md` 的品牌令牌；`captions: skipped (<reason>)` 是有效结果。`assemble-index.mjs` 会从 `assets/` 暂存演职人员表头像，作为幂等的兜底措施。

**门槛：** 每一帧都标记为 `animated`（协作模式：已在第 4 步确认草图板），`index.html` 已存在，并且字幕已生成或已明确跳过。

---

## 第 6 步：完成

目标：验证组装后的视频，获得用户批准，并渲染最终 MP4。

注入转场、运行检查、暂停以供审核，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints>`

`snapshot` 会将捕获的帧拼接成一张联系表（`snapshots/contact-sheet.jpg`）。快速查看一下；如果没有明显问题，就继续下一步——不要在这里停留太久。

如果某个命令失败，显示 stderr 并停止——不要接连堆叠恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

**已知误报——不要追查。** `check` 可能会针对**字幕**高亮词（选择器 `#caption-word-*` / `.caption-line`）报告少量约 1–4px 的 `text_box_overflow` 错误。字幕胶囊使用了刻意紧凑的 `line-height`（在 `scripts/captions.mjs` 中统一设置），并且**没有 `overflow:hidden`**，因此较粗的展示字体字形墨迹会溢出几 px，进入胶囊自身的内边距——实际上没有任何内容被裁切。将这些视为预期情况并继续。**不要**增大字幕的 `line-height`（这会使胶囊膨胀，效果更糟）。仅当 `text_box_overflow` 指向**帧**元素（`#el-NN-*`），而不是字幕词时才采取行动。

检查通过后，暂停以供用户审核——这是审核循环的最终查看（`../hyperframes-core/references/review-loop.md` § 4）：只问一个问题，并在从第 3 步起一直打开的 Studio 上进行——现在渲染，还是需要修改？（自主模式：保留的唯一问题是先预览还是渲染——如果用户选择预览，则使用下方命令打开预览。）然后交付 MP4，同时提供联系表和帧 ID，以便修订时可以只针对单个帧。

预览：`npx hyperframes preview "$PROJECT_DIR" --background`

仅在用户批准后渲染（自主模式：在询问预览还是渲染之后）：

`npx hyperframes render --skill=pr-to-video --quality high --output renders/video.mp4`

渲染后不要重新运行 `lint`、`check` 或 `snapshot`，除非用户提出要求。

用户完成审核后（或者渲染后预计不会再进行实时编辑时），仅停止此项目的后台服务器：`npx hyperframes preview "$PROJECT_DIR" --stop`。等待审核期间绝不要将其关闭。

**门槛：** 渲染前 `lint` 和 `check` 已通过，且快照已经检查；用户已在审核暂停点批准（自主模式：检查已通过，且交付内容包括联系表）；`renders/video.mp4` 已存在。最终回复需说明 MP4 路径和最终时长。

---

## 快速参考

**格式：** 横屏 `1920x1080`；竖屏 `1080x1920`；方形 `1080x1080`——根据目标平台确定（简报约定 § 2）。在故事板 frontmatter 中仅设置一次格式。

**PR 与捕获资产工作流的差异：**没有第 1 步的捕获（`gh` CLI 将 PR 摄取到合成的 `capture/extracted/` 包中——`tokens.json` + `visible-text.txt` + `people.json`）；唯一的真实资产是贡献者的 `assets/<login>.png` 头像（用于致谢收尾）；没有 `asset-descriptions.md`，也没有资产暂存步骤。代码节拍由代码编辑风格的藏青色代码画布上的 `code-*` 注册表块渲染；样式始终为 **code-editorial**。

**后台脚本：**该工作流在 `scripts/` 下提供以下脚本：`fetch-pr`（通过 `gh` 将 PR 转换为 `capture/pr.json` + `diff.patch`；可安全处理大型 PR，不使用暂存空间）、`ingest`（转换为合成捕获包；离线运行）以及 `fetch-people-avatars`（将贡献者头像下载至 `assets/`）；此外还有共享引擎——`build-frame`（采用预设并进行品牌重混，生成 `frame.md` + 字幕皮肤）、`audio`（TTS、BGM、SFX、时长同步）、`captions`、`transitions`（注入 + 验证）和 `assemble-index`。其他所有操作均由 `hyperframes` CLI 完成。代码块通过 `npx hyperframes add <name>` 安装。

可复用且与领域无关的镜头形态位于 `../hyperframes-animation/blueprints/`（索引为 `../hyperframes-animation/blueprints-index.md`）；`code-*` 注册表块构成代码节拍词汇表（`references/code-vocabulary.md`）。

| 阅读                                                                                                                                                        | 时机                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 门控类型、从 `BRIEF.md` 派生模式、字段语义。                                            |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 第 3 步：故事准则——钩子语言、价值先于证据、提案形态、可追溯至来源的视觉内容。 |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 第 3 步：规划 PR 解说。                                                                         |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 第 3 步：角色→蓝图菜单。第 4 步：选择镜头形态。                                                |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 第 3 步：编写 `STORYBOARD.md`。                                                                           |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 第 3 步：编写 `SCRIPT.md`。                                                                               |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 第 3.1 步：选择或了解 TTS 提供商。                                                            |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 第 4 步：编写画面的镜头序列（+ 布局词汇表）。                                           |
| `[references/code-vocabulary.md](references/code-vocabulary.md)`                                                                                            | 第 4 + 5 步：为代码节拍选择并填充 `code-*` 块。                                              |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 第 4 步：动效词汇表 + 动效准则。                                                     |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 第 4-5 步：切换目录（工作器构建画面内的衔接）。                                            |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 第 5 步：所引用动效的本地规则配方正文。                                                  |
| `[../hyperframes-core/references/frame-worker-core.md](../hyperframes-core/references/frame-worker-core.md)`                                                | 第 5 步：共享工作器契约（数据包构建器将其前置到增量内容中）。                            |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 第 5 步：该工作流的画面工作器增量。                                                               |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 第 5 步：安全分派子代理。                                                                      |
| `[../hyperframes-creative/frame-presets/code-editorial/FRAME.md](../hyperframes-creative/frame-presets/code-editorial/FRAME.md)`                            | 第 2 步：code-editorial 预设（固定样式）。                                                         |