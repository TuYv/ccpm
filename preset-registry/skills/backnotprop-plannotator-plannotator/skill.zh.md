---
name: plannotator
description: "Reference for using the Plannotator CLI: plan review, code review, annotating files, URLs, folders, and running local apps, annotating the last assistant message, browsing archived plan decisions, and exporting or sharing Guided Reviews. Invoke when asked to use Plannotator for anything not covered by a more specific plannotator-* skill."
---
# Plannotator CLI 参考

Plannotator 是一个面向代理工作流的本地、基于浏览器的审阅层：它会在标注 UI 中打开计划、差异和文档，由人工进行标注，然后结构化反馈会通过 stdout 返回给你。它作为单个 `plannotator` 二进制文件加上每个主机的钩子进行安装，因此当你退出计划模式时会自动触发计划审阅；其他所有界面都需要通过 CLI 显式启动。一个会话会运行在随机 localhost 端口上（远程模式下固定端口为 19432），并会阻塞，直到审阅者提交反馈、批准或关闭标签页。

此技能是知识层。`plannotator-review`、`plannotator-annotate` 和 `plannotator-last` 技能是针对三种最常见操作的轻量启动器；当你需要自行选择正确的命令或标志时，请使用此参考。

## 选择命令

| 用户想要 | 运行 |
| --- | --- |
| 审阅你生成的计划 | 不需要做任何事。计划审阅会在退出计划模式时通过钩子自动打开。切勿自行运行裸 `plannotator`。 |
| 审阅并显式批准保存为文件的计划/规范 | `plannotator annotate <file> --gate --json` |
| 审阅当前代码更改 | `plannotator review` |
| 审阅 GitHub PR 或 GitLab MR | `plannotator review <PR_URL>` |
| 标注 markdown、text、config 或 HTML 文件 | `plannotator annotate <file>` |
| 标注网页 | `plannotator annotate <https-url>` |
| 标注正在运行的本地应用（开发服务器） | `plannotator annotate <http://localhost:PORT/>` |
| 从文件夹中选择一个文件进行标注 | `plannotator annotate <folder/>` |
| 标注你最新的助手消息 | `plannotator last` |
| 浏览过去的计划决策 | `plannotator archive` |
| 导出或分享 Guided Review | `plannotator guide export` / `plannotator guide share` |
| 重新打开或列出实时会话 | `plannotator sessions` |

## 会话模型

每个 review 或 annotate 命令都会启动一个本地 Web 服务器，打开浏览器，并阻塞直到人工做出决定。这可能需要几分钟。请使用较长的（或不设置）命令超时来启动它，或者在后台启动，然后在进程退出时读取 stdout。不要为了“完成”审阅而杀掉进程；没有决策就结束的会话会被视为没有反馈。

Stdout 是接口，但其契约因命令而异。对于 `annotate` 及其最新消息变体：

- 纯文本（默认）：关闭时输出为空，批准时输出 `The user approved.`，否则输出反馈文本。在同一对话中处理返回的反馈。
- `--json`：一条 JSON 记录，包含 `decision`（`approved`、`dismissed` 或 `annotated`）以及可选的原始 `feedback`。批准仍可能在 `feedback` 中携带备注；请将其视为指导，而不是变更请求。
- `--hook`：仅适用于真实 PostToolUse/Stop 钩子上下文的钩子原生输出。批准/关闭不输出任何内容（钩子通过）；标注会输出 `{"decision":"block","reason":"..."}`。`--hook` 隐含门控 UI。切勿将其用于普通交互式调用。

`plannotator <command> --help` 会打印用法而不启动任何内容。裸 `plannotator` 是钩子入口点，并期望从 stdin 接收钩子 JSON。

## plannotator review

```bash
plannotator review [--git | --gitbutler] [--base <ref>] [--diff-type <type>] [--local | --no-local] [--tailscale] [--json] [PR_URL]
```

审查本地 VCS 更改，或在提供 URL 时审查拉取请求。默认 stdout 保持纯文本：现有的结束消息、批准提示或反馈。

使用 `--json` 时，直接审查会输出一条记录：`{ decision: 'approved' | 'annotated' | 'dismissed', message: string }`。`message` 是 CLI 渲染的文本，与默认纯文本输出完全一致，但不包含末尾的控制台换行符。其中包括自定义提示和带有备注的非阻塞批准提示；仅当 `annotations.length > 0` 时才会包含拒绝后缀，包括 PR 模式在内；对于没有注释的平台状态则不会包含。只能根据 `decision` 对结果进行分类，绝不能根据 `message` 文本进行分类。`approved` 审查中的备注属于指导信息，不是阻塞性的修改请求。此渲染后的 `message` 契约与 `annotate` 使用的原始反馈 JSON 分开，`opencode-review` 集成保持不变。`--hook` 仅适用于 annotate。

- VCS 会自动检测（支持 JJ、GitButler、Git 以及 P4）。`--git` 强制使用普通 Git；`--gitbutler` 强制使用 GitButler（要求 `but` CLI 0.21.0+）。从包含嵌套仓库的非 VCS 父文件夹运行时，会生成合并后的工作区 diff。
- 默认 diff 是“当前 PR 将显示的全部内容”：trunk 与工作树的合并基点，加上未跟踪文件。`--base <ref>` 会以不同的比较目标（分支、`origin/<branch>`、标签或提交）打开会话，`--diff-type <type>` 会以不同模式（`since-base`、`merge-base`、`branch`、`uncommitted`、`staged`、`unstaged`、`last-commit`、`local-vs-remote`、`all`）打开会话。两者都**仅对当前会话有效**：审查者可以在 UI 中更改任一设置，且两者都不会写入用户保存的默认设置。
- **审查堆叠分支中的一层？传入 `--base <the branch below yours>`** —— `plannotator review --base feature/part-1` 只显示该层新增的内容，而不是显示自 `main` 以来的全部内容。
- 两个标志都仅适用于 git：在 jj、GitButler、Perforce、多仓库工作区审查以及 PR URL 中都会报错。无法解析的 `--base` 引用会导致启动错误，并列出相近匹配的分支；绝不会静默生成错误的 diff。
- PR 审查（也支持 GitLab MR URL）需要经过身份验证的 `gh` 或 `glab` CLI。`--local`（默认）会在后台为 PR head 创建本地检出，以便完整访问文件；`--no-local` 会跳过此步骤，仅审查平台 diff。
- `--tailscale` 会通过 `tailscale serve` 将回环会话发布到用户的 tailnet（使用 HTTPS，绝不会公开），并输出带有二维码的 URL。发布失败时会以非零状态退出，而不是让服务器一直挂起。

## plannotator annotate

```bash
plannotator annotate <target> [--markdown] [--no-jina] [--app | --static] [--render-html] [--tailscale] [--gate] [--json] [--hook]
```

打开注释 UI 中的一个文档、页面或应用，并将人工注释输出到 stdout。

普通的 `annotate` 仅用于反馈：它会显示 **Close**，但不会显示 **Approve** 按钮。当用户要求审阅、批准、接受或门控某个保存为文件的生成计划/规范/文档时，始终添加 `--gate --json`。不要告诉用户他们可以批准普通的 `annotate` 会话。如果计划是通过宿主代理的原生计划流程移交的，则不要启动 `annotate`；让计划退出钩子自动打开审批 UI。

目标：

- Markdown 和文本文件：`.md`、`.mdx`、`.txt`。
- 纯文本配置和数据文件，以文本形式渲染：`.yaml`、`.yml`、`.json`、`.jsonc`、`.json5`、`.toml`、`.ini`、`.cfg`、`.conf`、`.properties`、`.csv`、`.tsv`、`.log`、`.xml`、`.env.example`。`.env` 本身会被明确拒绝（其中通常包含机密信息，而 annotate 历史记录会复制文件内容）。源代码文件应使用 `plannotator review`，而不是 annotate。
- HTML 文件（`.html`、`.htm`）：默认将原始页面渲染为页面；`--markdown` 会将其转换为 markdown。为兼容性而接受 `--render-html`；原始渲染已经是默认行为。
- URL（`https://...`）：默认通过 Jina Reader 获取并转换；`--no-jina` 则使用普通 fetch 加 Turndown。
- 正在运行的本地应用：对于探测结果返回 HTML 的回环 `http://localhost:PORT/` URL，将以实时应用模式打开（对实际运行的页面进行注释）。`--app` 强制使用实时模式，并在无法应用时明确失败；`--static` 强制使用经典转换流程。非回环 URL 始终使用转换流程。
- 文件夹：`plannotator annotate docs/` 会打开一个文件浏览器，用于浏览该文件夹中受支持的文件。

单个文件大小上限为 2MB。文件从稳定的项目路径读取；将接受审阅的源文件保留在其原位置。

参数容错：允许存在额外的单词（`plannotator annotate look at notes.md please` 会打开 `notes.md`），但如果解析出两个目标，则会报错并指出这两个目标；未识别的带短横线 token 会禁用容错，因此标志拼写错误会明确失败。当普通多词调用无法解析出任何目标时，CLI 会在 stdout 上输出一段面向代理的移交信息，并以 0 退出：读取该信息，确定具体目标，然后使用准确的路径或 URL 重新运行。

### 严格门控与退出代码

对于机器可检查的审批门控，添加 `--gate --json` 以及以下一个或两个严格标志：

```bash
plannotator annotate report.md --gate --json --require-approval --result-file /tmp/decision.json
```

- `--require-approval`：退出代码报告人工结果。
- `--result-file <path>`：stdout 中的决策 JSON 也会以原子方式发布到 `<path>`。父目录必须存在，并且该文件不能已存在；结果相对于调用时的 cwd 解析。

严格标志下的退出代码（遵循 grep 约定）：

| 退出 | 含义 |
| --- | --- |
| 0 | 已批准。唯一的成功状态。 |
| 1 | 审阅者未批准（已添加注释或已关闭）；但决策记录仍已发布。 |
| 2 | 门控本身失败：标志组合错误、启动失败（文件缺失、URL 无法访问、文件过大）或结果文件无法发布。绝不能将其视为审阅者结果。 |
| 128+n | 被信号 n 终止。 |

未设置严格标志时，启动失败会退出码为 1，且该退出码不携带决策信息；请改为解析输出。两个严格标志都需要 `--gate --json`，并会拒绝 `--hook`。

## plannotator annotate-last

```bash
plannotator annotate-last [--stdin] [--tailscale] [--gate] [--json] [--hook]
plannotator last
```

在注释界面中打开当前代理会话中最近一次渲染的助手消息（`last` 是别名）。会话日志会按主机自动发现；`--stdin` 则改为从 stdin 读取内容。

不要在运行它之前立即打印解说或状态信息：该命令面向最近一次渲染的助手消息，因此前置说明会成为被注释的内容。

## plannotator copilot-last

```bash
plannotator copilot-last [--gate] [--json] [--hook]
```

这是用于实时 GitHub Copilot CLI 会话的 `annotate-last` 变体（读取 Copilot 的会话状态事件）。通常由 Copilot 插件的 `/plannotator-last` 命令调用；仅应在 Copilot CLI 会话内部使用。

## plannotator archive

```bash
plannotator archive
```

打开一个只读浏览器，查看 Plannotator 数据目录中已保存的计划决策（approved/denied 徽章）。不会返回反馈；当用户点击 Done 时会话结束。

## plannotator guide

```bash
plannotator guide list
plannotator guide export --id <savedGuideId> [--out <file.html>]
plannotator guide export --guide <guide.json> --patch <diff.patch> [--out <file.html>]
plannotator guide export --snapshot <snapshot.json> [--out <file.html>]
plannotator guide share --id <savedGuideId> [--public] [--ttl <7d|24h|30m|3600>] [--json]
plannotator guide unshare <id> --token <deleteToken>
```

Guided Reviews 是在代码评审界面内生成的差异 AI 演示。CLI 可处理已保存的结果：

- `list` 显示 Plannotator 为当前仓库持久化的 guides。
- `export` 会写入一个可移植、独立的 HTML 文件（查看器从 guides.show 加载）。`--guide` + `--patch` 可导出你基于统一 diff 编写的 guide（`--patch -` 从 stdin 读取；校验严格，并会指出 guide 引用但 patch 中缺失的文件）。`--out -` 会输出到 stdout。`--viewer-url` 会覆盖固定的 viewer 基址。
- `share` 会上传 guide 并打印链接。默认加密：密钥仅存在于 URL 片段中，主机只存储密文。`--public` 会以明文存储，便于聊天应用展开预览。`--ttl` 用于设置过期时间；否则链接会一直保留，直到执行 `unshare`。已保存的 guide 会记录其链接，随后再次运行 `share --id` 会被拒绝，而不会丢弃第一条链接的删除 token。
- `unshare <id> --token <t>` 使用分享时打印的删除 token 移除链接。

## plannotator sessions

```bash
plannotator sessions [--open [N]] [--clean]
```

列出活动中的 Plannotator 服务器会话。`--open` 在浏览器中重新打开会话 N（默认为 1），适用于评审过程中标签页被关闭的情况。`--clean` 会清理过期条目。

## 其他子命令

```bash
plannotator setup-goal <interview|facts> <bundle.json | -> [--json]
plannotator uninstall [--purge] [--yes] [--dry-run]
plannotator improve-context
```

- `setup-goal` 为 /goal 工作流打开访谈或事实接受 UI；它由 `plannotator-setup-goal` skill 驱动，并接收一个 bundle JSON（`-` 从 stdin 读取）。不要手动构建 bundles。
- `uninstall` 移除 Plannotator 安装的组件（`--purge` 还会删除本地数据；没有 TTY 时必须使用 `--yes`；`--dry-run` 用于预览）。
- `improve-context` 和 `install-runtime` 是内部集成命令（hook 管理和托管 runtime 安装）。永远不要直接运行 `improve-context`；`plannotator install-runtime agent-terminal` 可用于重新安装可选的 annotate-terminal runtime，通常由安装程序运行。
- 其他宿主内部子命令（`opencode-*` 和 `copilot-plan` 系列）由其插件调用，而不是由你调用。

## 会改变行为的环境变量

| 变量 | 用途 |
| --- | --- |
| `PLANNOTATOR_REMOTE=1` | 强制使用远程模式（固定端口 19432，宽范围绑定），用于 SSH/devcontainer 会话；`0` 强制使用本地模式。未设置时会自动检测 SSH。 |
| `PLANNOTATOR_PORT` | 固定端口，而不是使用随机端口。 |
| `PLANNOTATOR_ORIGIN` | 覆盖 agent-origin 检测（`claude-code`、`codex`、`opencode`、`pi`、`oh-my-pi`、`amp`、`droid`、`copilot-cli`、`gemini-cli`、`kiro-cli`）。当从检测无法穿透的 wrapper 启动 Plannotator 时设置此变量。 |
| `PLANNOTATOR_AI=disabled` | 在 UI 中禁用 Ask AI 和由 agent 启动的 review 界面。 |
| `PLANNOTATOR_SHARE=disabled` | 禁用 URL sharing，包括 guide share links。 |
| `PLANNOTATOR_DATA_DIR` | 移动数据目录（默认为 `~/.plannotator`）：plans、history、drafts、config。 |
| `PLANNOTATOR_BROWSER` | 在指定的浏览器中打开会话。 |

## 将注释发布到实时会话中

正在运行的 plan-review 会话会在其基础 URL 上提供一个小型 HTTP API，用于外部注释：`POST /api/external-annotations` 会添加行内注释，reviewer 可立即看到；更新和删除使用 PATCH/DELETE，SSE 流位于 `/api/external-annotations/stream`。UI 中的“copy agent instructions”操作会将当前会话的完整 API contract（包含正确的 base URL）复制到剪贴板，以便交给 agent 或脚本。如果用户粘贴了此类 instructions，请遵循其中的内容；不要在该 contract 之外自行构造 endpoints。

## 不要

- 不要解析或抓取浏览器 UI 的 HTML；CLI 的 stdout（以及上文记录的 HTTP API）就是完整 contract。
- 不要在真实 hook context 之外使用 `--hook`；需要结构化输出时使用 `--json`。
- 不要直接运行裸 `plannotator` 进入交互模式；它是 hook entry point。
- 不要猜测 flags。不确定时运行 `plannotator <command> --help`；未知的带短横线 token 会被故意视为 annotate 失败。
- 不要让 `plannotator annotate` 指向源代码文件或 `.env` 文件；代码应通过 `plannotator review` 处理，而 `.env` 会被拒绝。
- 除非确实有人工在场进行 review，否则不要启动严格 gate（`--require-approval`）；会话会一直阻塞，直到人工采取操作。