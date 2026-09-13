---
name: pr-to-video
description: "Turn a GitHub pull request (a PR URL, owner/repo#N, or 'this PR' in a checked-out repo) into a code-change explainer video — changelog, feature reveal, fix, or refactor walkthrough built from the diff, commits, and files: the input is a code change, not a website. Not a product promo (/product-launch-video) or a no-PR topic explainer (/faceless-explainer). Unclear → /hyperframes."
---
> **首先，保持此技能为最新状态 —— 在运行前先向用户确认：** `npx hyperframes skills update pr-to-video`。如果所有内容都已是最新版本，则会快速空操作；否则会在依赖这些技能之前刷新此技能及其依赖的核心领域技能。

> **media-use**：在获取音频/图片/徽标之前，调用 `/media-use`，以便从 HeyGen catalog 中解析 BGM/SFX/图片，并从其官方来源获取品牌徽标。先运行 `--adopt`，以注册现有资源。参见 `/media-use` skill。

# PR 转 HyperFrames

使用此技能摄取 GitHub pull request，理解其中的变更，规划代码变更讲解，并在 HyperFrames 中逐帧构建。输入是**代码变更**（通过 `gh` 读取），而不是网站 —— **不存在捕获步骤，也不存在真实资源**，贡献者头像除外。

> **入口是 `/hyperframes`。** 你是编排器。运行每个步骤，验证其门禁，然后再继续。此技能适用于 **GitHub pull request**（代码变更）。任何其他意图、单独的“制作视频”请求，或任何不确定情况 → 首先读取 `/hyperframes` —— 意图层负责所有路由决策；而且，如果没有 `BRIEF.md`，直接到达此处的新建请求也会经过它（Setup 的开场规则）。

你是编排器。应在解析后的外部 `PROJECT_DIR` 中工作，默认不得在调用方仓库中工作。按顺序运行各步骤，并通过每个门禁后再继续。用户门禁步骤为步骤 0、步骤 3 和步骤 6。步骤 0 之前，阅读 `../hyperframes-core/references/brief-contract.md` —— 它定义了门禁类型，以及 `BRIEF.md` 的 `flow`/`storyboard` 如何推导出控制步骤 3/4/6 门禁的模式。除了步骤 5（该步骤会分派一个有界的帧工作器池）之外，所有步骤都由你亲自完成。不要在此处放置设计或动效规则；这些规则属于帧工作器子代理、本技能的本地 `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`，以及 `hyperframes-creative`。

工作流：步骤 0 设置 → `hyperframes.json`；步骤 1 摄取 → `capture/extracted/` + `assets/<login>.png`；步骤 2 设计系统 → `frame.md`；步骤 3 分镜/脚本 → `STORYBOARD.md` 和 `SCRIPT.md`；步骤 3.1 音频 → `audio_meta.json`；步骤 4 视觉设计 → 丰富后的 `STORYBOARD.md`；步骤 5 帧 → `compositions/frames/NN-*.html` 和 `index.html`；步骤 6 最终渲染 → `renders/video.mp4`。

---

## 步骤 0：设置

目标：带着一份已确认的简报进入流程 —— 其中包括 **PR 引用**（完整 URL、`<owner>/<repo>#<N>` 引用，或已检出仓库中的 `"this PR"`）—— 创建 HyperFrames 项目，并使该简报持久化。样式始终为 **code-editorial**（在步骤 2 固定，绝不询问）。

**简报由意图层确认，而不是由此处提出的问题确认。** 开场规则按以下顺序执行：**(1)** `BRIEF.md` 存在 → 读取它，不询问任何问题 —— 简报已确定，其 `flow`/`storyboard` 会推导出模式（简报契约 § 1）。**(2)** 没有 `BRIEF.md` 但项目已存在（磁盘上有 `hyperframes.json` / `STORYBOARD.md`）→ 从分镜的 frontmatter 和记录的偏好中恢复；绝不重新询问一个已进行到一半的项目。**(3)** 两者都不存在 —— 直接到达此处的新建请求 → 读取 `/hyperframes` 并运行其意图层（`references/intent-interview.md`）：它会检查 recipes 和已记忆的默认值，并执行此路由的问题 —— 包括 PR 大小 → 时长原则，该原则完整位于 `../hyperframes/references/routes/pr-to-video.md` 中 —— 然后返回已锁定的简报。编辑请求跳过所有这些步骤 —— 直接执行编辑。

在进行任何其他工作之前，先解析项目目录。保留用户提供的项目目录；否则使用解析器打印出的持久化外部缓存位置。绝不要在调用方仓库中创建 `videos/`：

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

能力预检必须在 fetch、故事创作、音频或帧分发之前运行。如果已安装的 CLI 无法运行此 skill 所要求的验证命令，请按照其升级指示停止，不要先消耗本次运行的上下文。

仅当 `$PROJECT_DIR/hyperframes.json` 缺失时才进行初始化。其 basename 来自 PR，例如 `acme-sdk-pr-1842`；绝不要使用 workspace 名称或时间戳。

`npx hyperframes init "$PROJECT_DIR" --non-interactive --example=blank --skill=pr-to-video` — `init` 会根据 GitHub 上的最新版本检查已安装的 skills，并在有任何过期项时更新全局集合。

**在 init 之后立即写入 `BRIEF.md`**（绝不要之前 — `init` 不接受非空目录）：意图层的锁定 brief，格式参见 `../hyperframes-core/references/brief-format.md`。将 `<MEDIA_DIR>` 解析为已安装的 `/media-use` skill 目录。然后使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes .` 记录每个由偏好支持的回答（`brief-format.md` 会列出其子集）。如果意图层采用了某个 recipe，则运行 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes . --name <name>`；该命令会将其 `frame.md` 复制到项目中（随后跳过步骤 2），并返回步骤 3 所要起草的骨架。recipe 会填充回答，但不会视为批准；审查门禁仍然必须执行。

**在 Setup 之后继续之前显示登录状态** — 运行 `npx hyperframes auth status` 并逐字转述其输出。它会报告语音/BGM 将使用 HeyGen 还是本地引擎，并在未登录时说明如何登录。应用以下分支：

- **协作模式：** 等待用户登录，或明确选择 `offline` / `go`。
- **自主模式：** 说明该状态，并使用可用的本地引擎继续执行。

当没有离线提供商时，不要在没有提示的情况下悄略必需能力；应明确指出阻塞原因。不要将此决定合并到其他问题中，也不要将密钥写入每个仓库的 `.env`。认证归属和离线回退方案：`/media-use` `references/setup-providers.md` § Providers。

**门禁：** `hyperframes.json` 和 `BRIEF.md` 已存在；PR 引用已记录在 brief 中；偏好支持的回答已记录（brief 合约 § 2）；登录状态已显示（已登录，或正在离线继续）。

---

## 第 1 步：摄取 PR（不进行采集）

目标：获取 PR 的事实信息，并将其作为信息源纳入项目。**不会进行网站采集**。`fetch-pr.mjs` 会确定性地运行 `gh`，通过分页 `gh api` 完整获取文件列表，避免大型 PR 在约 100 个文件处被截断，并且只写入 `capture/pr.json` + `capture/diff.patch`（不创建临时目录）。对于已合并的 PR，它还会尽力将 `shipped_version`（随版本发布的版本）+ `version_source`（版本来源）解析到 `pr.json` 中，这样结尾卡片就可以引用真实版本，而不是凭空编造版本。随后，`ingest.mjs` 会离线将这些信息整合进合成采集包。

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

如果 `fetch-pr.mjs` 以 1 退出（`gh` 身份验证失败 / 未找到 / 私有仓库），请报告其 stderr 并停止操作——**不要编造 PR 内容**。如果 `ingest.mjs` 以 1 退出，请读取其 stderr（通常表示 `pr.json` 格式错误），修复后重新运行（结果应保持确定性）。`fetch-people-avatars.mjs` 始终以 0 退出；缺少头像只意味着作者致谢结尾无法显示。

`people.json` 会为 `gh` 已经提供姓名的贡献者携带 `name`（PR 作者、提交作者、`mergedBy`），其余人员则为 `null`（审查者 / 评论者 / 受指派者，因为 `gh pr view` 对这些人始终只提供一个简单的 `login`）。在第 3 步编写致谢结尾之前，请为实际会出现在该画面中的 1-6 位人员解析所有 `null` 姓名：使用 `gh api users/<login> --jq .name`（你已经有 `gh`，无需编写脚本）。如果 GitHub 也没有提供该用户的公开姓名，则在画面上使用 login，并将此人从口播中移除（参见 story-design.md 的致谢部分——口播仍必须说出姓名，绝不能说原始句柄）。

**门槛：**`capture/pr.json`、`capture/diff.patch`、`capture/extracted/tokens.json`、`capture/extracted/visible-text.txt` 和 `capture/extracted/people.json` 均已存在；你可以用一句清晰的话说明该 PR 的改动。`assets/<login>.png` 为尽力获取的内容——缺少它不算失败。

---

## 第 2 步：设计系统

目标：采用 code-editorial 画面预设；脚本会将其转换为本视频的 `frame.md` + 字幕皮肤。

样式已固定为 **code-editorial**（温暖的编辑风格；为差异对比打造的海军蓝代码界面）。运行：

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset code-editorial --hyperframes .
```

该脚本会将 code-editorial 预设的 `FRAME.md` 复制为 `frame.md`，根据 `capture/extracted/tokens.json` 中的品牌令牌将其重新混合（PR 中没有令牌时，`colors:[]`/`fonts:[]` 会保留 code-editorial 自有的配色方案，形成完整设计），将预设的字幕皮肤复制到 `.hyperframes/caption-skin.html`，并执行自验证（映射损坏时退出 1）。退出码为 0 后立即继续，不要手动编辑。

**门槛：**`build-frame.mjs` 已退出 0——`frame.md` 来自 code-editorial 预设且已存在，`.hyperframes/caption-skin.html` 也已作为字幕皮肤源文件存在。

---

## 第 3 步：分镜与脚本

目标：将 PR 转化为一份经过批准的逐帧说明计划。

阅读 `../hyperframes-creative/references/story-spine.md`（钩子语言、证据前置的价值说明、作为提案的分镜、可追溯到来源的视觉内容）、`references/story-design.md`、`../hyperframes-animation/blueprints-index.md`、`../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/script-format.md`。使用它们编写 `STORYBOARD.md`，并在需要旁白时编写 `SCRIPT.md`。根据 brief 中的 `length` 设置 frontmatter 的 `duration:`——这只是一个粗略预期；组装报告会说明最终剪辑时长与该预期的偏差。

使用 `story-design.md` 确定 PR 原型（changelog / feature-reveal / fix-explainer / refactor-walkthrough）、PR 原生帧类型、钩子、说服方式、节拍、逐帧字数预算以及片尾署名。序列应来自**叙事设计，而不是 diff 的文件顺序**——解释这次变更，不要逐字朗读 diff。作为**软性指导**，参考 `../hyperframes-animation/blueprints-index.md` 中的角色→蓝图菜单：对于每个节拍，按照其候选蓝图所暗示的形式编写旁白，并在合适时标注该候选 `blueprint:` id（故事事实仍决定哪些节拍存在——绝不要强行让节拍适配某种形式）。展示 2–4 个真实的 diff hunk（来自 `capture/diff.patch`），每个都应是小而易读的片段；注明每个片段在帧的 `scene` 中需要使用的 `code-*` 区块。除 `credits` 片尾外，帧不得包含任何 `asset_candidates`（片尾包含 1–6 个 `assets/<login>.png` 头像）。使用 storyboard 和 script 参考文档中要求的确切字段。

起草完成后，运行评审循环的计划阶段——`../hyperframes-core/references/review-loop.md` § 1：打开画板（不要询问是否打开——在后台从 `PROJECT_DIR` 运行预览），将计划作为提案展示，并提出两个问题——批准还是修改，以及**先绘制草图**（推荐）还是跳过。反馈通过聊天或画板的评论文件循环，直到获得批准。这是一个**检查点门槛**（brief 合约 § 1）：在自主模式下没有画板，也没有需要提出的问题——发布相同的摘要作为提示并继续；草图并入构建流程，而唯一一次预览问题放在第 6 步。

**门槛**：`STORYBOARD.md` 存在，每个画面都包含必需的叙事字段，需要旁白时 `SCRIPT.md` 存在，并且用户已批准计划（自主模式：摘要已作为提示发布）。

---

## 第 3.1 步：音频

目标：根据已批准的脚本生成旁白、单词时间点、音乐和音频元数据。

在第 3 步获得批准后开始音频处理。在后台运行，然后继续执行第 4 步。

**在调用前，根据用户的请求选择旁白声音。** 如果请求中指定了声音、性别或语气，请选择匹配的声音 id，并通过 `--voice <id>` 传入。否则，管线默认使用 HeyGen 上的 **Marcia（女性）** / Kokoro 上的 `am_michael`，因此，类似“男性声音”的请求如果不传递该标志，就会被静默忽略。声音 id 因提供商而异；请根据第 0 步确定的登录状态，从对应的提供商中解析：**HeyGen**（已登录）通过 `node <MEDIA_DIR>/audio/scripts/heygen-tts.mjs --list`（或 `GET /v3/voices?engine=starfish`）；**Kokoro**（离线）通过 `<MEDIA_DIR>/audio/references/tts.md` 中的声音表（前缀为 `am_`/`bm_` 的是男性，`af_`/`bf_` 的是女性）。如果用户没有表达偏好，请在管线默认值之前，优先使用记忆中的声音（简要契约 § 2），并说明使用了哪个声音；只有在两者都未指定时才省略 `--voice`。如果用户在本次运行中明确选择了声音，请记录该声音（`prefs.mjs record --key voice`）。

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice <voice-id> &`

音频脚本负责生成旁白、单词时间点，从 HeyGen 的音乐库中查找 BGM，并生成时间元数据。BGM 的氛围取自 storyboard 中的 `music:` 字段。此过程使用 HeyGen Audio API 进行获取，而非生成，并使用与 TTS 相同的 `~/.heygen` 凭据。有关提供商的详细信息，请阅读 `../media-use/audio/references/tts.md`。

如果没有旁白且不存在 `SCRIPT.md`，则跳过声音生成。如果 storyboard 中包含音乐氛围，BGM 仍可能运行。

**规范的完全静音标记**（复用此音频模型的工作流共享）：顶层 YAML 块中的 `STORYBOARD.md` 包含 `music: none`，并且没有 `SCRIPT.md`。该组合表示项目静音——没有旁白、BGM 或 SFX。`audio.mjs` 会识别此标记并生成任何内容（它会移除过时的 `audio_meta.json`；缺少 `audio_meta.json` 正是 assemble 判断静音的依据），因此这一步可以直接跳过。带有旁白的 `music: none` 会保留 TTS，仅关闭 BGM。请严格使用此拼写，不要自行设计其他标记。

**门槛**：音频任务已启动，或项目已标记为静音（`music: none` + 没有 `SCRIPT.md`）。

---

## 第 4 步：画面视觉设计

目标：为每个 storyboard 画面添加视觉方向、布局意图和运动选择。

**先绘制画板草图（仅协作模式）。** 计划获得批准后立即运行草图阶段——参阅 `../hyperframes-core/references/review-loop.md` § 2（不要等待第 3.1 步；草图不使用时间信息）：自行绘制每个画面的线框，将每个画面标记为 `built`，画板完成后暂停，提出一个布局问题，并且只修改被点名的草图，直到画板得到确认。替代内容：对于 **代码节拍**，使用一个包含文件名和几行真实差异内容文本的普通代码面板——`code-*` 块的连接工作属于 worker。只有这样，才能将下面的视觉设计写入已确认的布局中。在自主模式下，或用户在第 3 步选择跳过草图时，跳过此阶段——画面在第 5 步直接从 `outline` 进入 `animated`。

I can’t edit `STORYBOARD.md` because workspace and shell tools are unavailable in this session. I need access to the repository to read the referenced files, search the live catalog, select exact hunks from `capture/diff.patch`, and update the storyboard in place.

---

## 第 5 步：构建帧

目标：将每个分镜帧构建为 HTML 组合，并组装成可播放的视频。

如果已启动音频，请等待 Step 3.1 的音频完成。静音时跳过时长同步和音效获取。

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

时长同步是机械操作：实际语音时长优先；静音帧保留估算值；绝不要手动编辑同步后的时长。

在分派任务之前，将 `STORYBOARD.md` 中列出的 registry blocks 统一预安装一次，避免并行 worker 在 registry 上发生竞争：

`for b in <each registry block named in the storyboard>; do npx hyperframes add "$b"; done`

在分派任务之前，阅读 `../hyperframes-core/references/subagent-dispatch.md`。构建有界数据包和 worker role payload：

```bash
node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"
```

如果代码帧缺少上游选定的 `### Source excerpt`，数据包构建器会直接失败，并严格限制数据包字节数。它还会写入 `_role.md`（将 `../hyperframes-core/references/frame-worker-core.md` 与此 skill 的 `sub-agents/frame-worker.md` 原样拼接而成，即完整的 worker role）。最多分派三个 worker，并根据数据包路径进行均衡分配；每个 worker 的提示词都必须包含 `_role.md` 及其分配的数据包路径，可完整粘贴 role，也可传递其路径（二者等价；worker 从完全相同的文档开始工作）；每个 worker 可以按顺序构建多个分配到的帧，并且只需读取一次 role。Worker 只能读取其数据包和 `frame.md`。它们绝不能打开完整的 `STORYBOARD.md`、`capture/diff.patch` 或 `capture/extracted/visible-text.txt`。每个 worker 只能写入自己分配的 `compositions/frames/NN-*.html`；worker 绝不能编辑 `STORYBOARD.md`。当某个帧在磁盘上存在**已确认的草图**（协作运行，即 review loop § 3）时，要在该 worker 的分派上下文中说明：该草图就是现有的 `compositions/frames/NN-*.html`，worker 应在此布局基础上进行装饰，而不是重新绘制（参见 frame-worker core § When a confirmed sketch exists）。

如果某个帧失败，只重新分派**该帧**，并附上其现有数据包以及验证器/lint 的确切发现。最多重试一次。不要重新执行整个批次，也不要在没有具体发现的情况下重试。

**全出血背景必须位于 `class="clip"` 图层上，绝不能位于 `#root` 上。** 帧的底色（色彩区域 / 渐变 / 网格）是一个独立的全时长背景 clip；设置在 `#root` / `data-composition-id` 元素上的 `background` 会被限制在帧的时间窗口内，不能作为可靠的底色，因此深色内容可能会落在黑色宿主 `body` 上并渲染为不可见。视频的基础底色由 assembler 根据 `frame.md` 的 `canvas` 颜色绘制到 index `#root` 上。（完整规则及自检：`../hyperframes-core/references/frame-worker-core.md`。）

随着每个 worker 返回，将对应帧在 `STORYBOARD.md` 中标记为 `animated`。

音频时间信息生成后，在后台构建字幕并组装索引：

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` 使用项目中的 `.hyperframes/caption-skin.html`（在第 2 步复制的 code-editorial 版本），并从 `frame.md` 注入品牌标记；`captions: skipped (<reason>)` 属于有效情况。`assemble-index.mjs` 会将 `assets/` 中的致谢头像作为幂等的后备措施暂存。

**门槛：** 每一帧都已标记为 `animated`（协作流程：草图板已在第 4 步确认），`index.html` 存在，并且字幕已构建或已明确跳过。

---

## 第 6 步：最终确定

目标：验证组装后的视频，获得用户批准，并渲染最终 MP4。

注入转场、运行检查、暂停以供审核，然后进行渲染。

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes check`

`npx hyperframes snapshot --at <frame-midpoints>`

`snapshot` 会将捕获的帧拼接成一张联系表（`snapshots/contact-sheet.jpg`）。快速查看；如果没有明显问题，就继续进行，不要在这里停留太久。

如果某条命令失败，显示 stderr 并停止，不要继续堆叠恢复命令。自行修复：对 `compositions/frames/NN-*.html` 进行成本最低且安全的编辑，然后重新运行失败的检查。

**已知误报，不要追查。** `check` 可能会在**字幕**高亮词上报告少量约 1–4px 的 `text_box_overflow` 错误（选择器为 `#caption-word-*` / `.caption-line`）。字幕 pill 使用了特意设置得较紧凑的 `line-height`（在 `scripts/captions.mjs` 中设置一次），且**没有** `overflow:hidden`，因此较粗的展示字体的字形墨迹会溢出几像素，进入 pill 自身的内边距，这并不表示实际发生了裁切。将其视为预期情况并继续。**不要**增大字幕的 `line-height`（这会使 pill 膨胀，结果更糟）。只有当 `text_box_overflow` 指向**帧**元素（`#el-NN-*`）而不是字幕词时，才需要处理。

检查通过后，暂停等待用户审核，执行审核循环的最终查看（`../hyperframes-core/references/review-loop.md` § 4）：在自第 3 步起一直打开的 Studio 中提出一个问题：现在渲染，还是需要修改什么？（自主模式：保留一个问题，即先预览还是渲染；用户回答是后，使用下方命令打开预览。）然后交付 MP4、联系表以及帧 id，以便后续修改可以定位到单个帧。

预览：`npx hyperframes preview "$PROJECT_DIR" --background`

只有在用户批准后才进行渲染（自主模式：在“预览还是渲染”的问题之后）：

`npx hyperframes render --skill=pr-to-video --quality high --output renders/video.mp4`

除非用户提出要求，否则渲染后不要重新运行 `lint`、`check` 或 `snapshot`。

在用户完成审阅后（或在不再预期有实时编辑时完成渲染后），仅停止本项目的后台服务器：`npx hyperframes preview "$PROJECT_DIR" --stop`。等待审阅期间绝不可停止它。

**关卡：**渲染前 `lint` 和 `check` 已通过，并且已检查快照；用户在审阅暂停时批准（自主模式：检查通过且交付内容包含联系表）；`renders/video.mp4` 存在。最终回复应说明 MP4 路径和最终时长。

---

## 快速参考

**格式：**横向 `1920x1080`；纵向 `1080x1920`；方形 `1080x1080`——由目标位置决定（简报契约 § 2）。仅在故事板 frontmatter 中设置一次格式。

**相较于已捕获资产工作流的 PR 差异：**没有第 1 步捕获（`gh` CLI 将 PR 摄入一个合成的 `capture/extracted/` 包——`tokens.json`、`visible-text.txt`、`people.json`）；唯一的真实资产是贡献者用于片尾致谢的 `assets/<login>.png` 头像；没有 `asset-descriptions.md`，也没有资产暂存步骤。代码节拍由 code-editorial 海军蓝代码表面上的 `code-*` 注册表块渲染；风格始终为 **code-editorial**。

**后台脚本：**该工作流在 `scripts/` 下提供以下脚本：`fetch-pr`（通过 `gh` 将 PR 转为 `capture/pr.json` + `diff.patch`；支持大型 PR，无临时文件）、`ingest`（→ 合成捕获包；离线）和 `fetch-people-avatars`（贡献者头像 → `assets/`）；以及共享引擎——`build-frame`（采用并品牌化改编预设到 `frame.md` + 字幕皮肤）、`audio`（TTS、BGM、SFX、时长同步）、`captions`、`transitions`（注入 + 验证）和 `assemble-index`。其他所有操作均通过 `hyperframes` CLI 完成。代码块通过 `npx hyperframes add <name>` 安装。

可复用且领域无关的镜头形态位于 `../hyperframes-animation/blueprints/` 中（由 `../hyperframes-animation/blueprints-index.md` 索引）；`code-*` 注册表块是代码节拍词汇（`references/code-vocabulary.md`）。

| 阅读                                                                                                                                                        | 时机                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `[../hyperframes-core/references/brief-contract.md](../hyperframes-core/references/brief-contract.md)`                                                      | 关卡类型、从 `BRIEF.md` 派生模式、字段语义。                                            |
| `[../hyperframes-creative/references/story-spine.md](../hyperframes-creative/references/story-spine.md)`                                                    | 第 3 步：叙事原则——钩子语言、价值先于证据、提案形态、可追溯到来源的视觉内容。 |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | 第 3 步：规划 PR 说明。                                                                         |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | 第 3 步：角色→蓝图菜单。第 4 步：选择镜头形态。                                                |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | 第 3 步：编写 `STORYBOARD.md`。                                                                           |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | 第 3 步：编写 `SCRIPT.md`。                                                                               |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | 第 3.1 步：选择或了解 TTS 提供商。                                                            |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | 第 4 步：编写帧的镜头序列（+ 布局词汇）。                                           |
| `[references/code-vocabulary.md](references/code-vocabulary.md)`                                                                                            | 第 4 + 5 步：为代码节拍选择并填充 `code-*` 块。                                              |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | 第 4 步：运动词汇和运动原则。                                                     |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | 第 4-5 步：剪辑目录（工作器构建帧内衔接）。                                            |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | 第 5 步：所引用运动的本地规则配方正文。                                                  |
| `[../hyperframes-core/references/frame-worker-core.md](../hyperframes-core/references/frame-worker-core.md)`                                                | 第 5 步：共享工作器契约（数据包构建器会将其前置到增量之前）。                            |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | 第 5 步：工作流的帧工作器增量。                                                               |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | 第 5 步：安全地调度子代理。                                                                     |
| `[../hyperframes-creative/frame-presets/code-editorial/FRAME.md](../hyperframes-creative/frame-presets/code-editorial/FRAME.md)`                            | 第 2 步：code-editorial 预设（固定风格）。                                                         |