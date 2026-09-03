---
name: plannotator
description: "Reference for using the Plannotator CLI: plan review, code review, annotating files, URLs, folders, and running local apps, annotating the last assistant message, browsing archived plan decisions, and exporting or sharing Guided Reviews. Invoke when asked to use Plannotator for anything not covered by a more specific plannotator-* skill."
---
# Plannotator CLI 参考

Plannotator 是一个面向代理工作流的本地、基于浏览器的审查层：它会在批注界面中打开计划、差异和文档，由人工进行标注，然后将结构化反馈通过 stdout 返回给你。它会安装为一个单独的 `plannotator` 二进制文件以及按主机配置的钩子，因此当你退出计划模式时，计划审查会通过钩子自动触发；其他所有界面都需要通过 CLI 显式启动。会话会运行在随机的 localhost 端口上（远程模式下固定使用端口 19432），并持续阻塞，直到审查者提交反馈、批准或关闭标签页。

此 skill 是知识层。`plannotator-review`、`plannotator-annotate` 和 `plannotator-last` skill 是三个最常见操作的轻量启动器；当你需要自行选择正确的命令或标志时，请使用此参考。

## 选择命令

| 用户想要 | 运行 |
| --- | --- |
| 审查你生成的计划 | 无需操作。退出计划模式时，计划审查会通过钩子自动打开。不要自行运行裸 `plannotator`。 |
| 审查并明确批准保存为文件的计划/规范 | `plannotator annotate <file> --gate --json` |
| 审查当前代码变更 | `plannotator review` |
| 审查 GitHub PR 或 GitLab MR | `plannotator review <PR_URL>` |
| 批注 markdown、文本、配置或 HTML 文件 | `plannotator annotate <file>` |
| 批注网页 | `plannotator annotate <https-url>` |
| 批注正在运行的本地应用（开发服务器） | `plannotator annotate <http://localhost:PORT/>` |
| 从文件夹中选择要批注的文件 | `plannotator annotate <folder/>` |
| 批注你最新的助手消息 | `plannotator last` |
| 浏览过去的计划决策 | `plannotator archive` |
| 导出或共享 Guided Review | `plannotator guide export` / `plannotator guide share` |
| 重新打开或列出活动会话 | `plannotator sessions` |

## 会话模型

每个 review 或 annotate 命令都会启动一个本地 Web 服务器、打开浏览器，并持续阻塞，直到人工做出决定。这可能需要几分钟。请使用较长的（或不设置）命令超时时间启动它，或者在后台启动，然后在进程退出时读取 stdout。不要为了“完成”审查而终止进程；会话在没有决策的情况下结束时，会被视为没有反馈。

stdout 契约就是完整的接口：

- 纯文本（默认）：关闭时无输出，批准时输出 `The user approved.`，否则输出反馈文本。在同一对话中处理返回的反馈。
- `--json`：输出一条 JSON 记录，`{"decision":"approved"|"dismissed"|"annotated","feedback":"..."}`。批准仍可能在 `feedback` 中包含备注；请将其视为指导，而不是变更请求。
- `--hook`：仅用于真正的 PostToolUse/Stop hook 上下文时的钩子原生输出。批准/关闭时不输出任何内容（钩子放行）；有批注时输出 `{"decision":"block","reason":"..."}`。`--hook` 隐含 gate UI。不要将其用于普通交互式调用。

`plannotator <command> --help` 会打印用法信息而不会启动任何内容。裸 `plannotator` 是钩子入口点，并要求从 stdin 接收钩子 JSON。

## plannotator review

```bash
plannotator review [--git | --gitbutler] [--local | --no-local] [--tailscale] [PR_URL]
```

审查本地 VCS 更改；如果提供 URL，则审查拉取请求。审查者提交时，反馈和批注会通过 stdout 返回；批准则会返回一条 LGTM 风格的消息。

- VCS 会自动检测（支持 JJ、GitButler、Git 和 P4）。`--git` 强制使用普通 Git；`--gitbutler` 强制使用 GitButler（要求 `but` CLI 0.21.0+）。从包含嵌套仓库的非 VCS 父文件夹运行时，会生成合并后的工作区差异。
- 默认差异是“当前 PR 会显示的全部内容”：主干分支与工作树的 merge-base，加上未跟踪文件。审查者可以在 UI 中切换差异类型；CLI 不控制这一点。
- PR 审查（`plannotator review https://github.com/owner/repo/pull/123`，也支持 GitLab MR URL）需要已完成身份验证的 `gh` 或 `glab` CLI。`--local`（默认值）会在后台构建 PR head 的本地检出，以便完整访问文件；`--no-local` 会跳过此步骤，仅审查平台差异。
- `--tailscale` 会通过用户的 tailnet，使用 `tailscale serve` 发布回环会话（HTTPS，绝不公开），并打印带 QR 码的 URL。发布失败时会以非零状态退出，而不是让服务器一直挂起。

## plannotator annotate

```bash
plannotator annotate <target> [--markdown] [--no-jina] [--app | --static] [--render-html] [--tailscale] [--gate] [--json] [--hook]
```

在批注 UI 中打开一个文档、页面或应用，并通过 stdout 返回人工批注。

普通的 `annotate` 仅用于反馈：它会显示 **Close**，但不会显示 **Approve** 按钮。当用户要求审查、批准、接受或门控一个以文件形式保存的生成计划/规范/文档时，始终添加 `--gate --json`。不要告诉用户可以批准普通的 `annotate` 会话。如果计划是通过宿主代理的原生计划流程交接的，不要启动 `annotate`；让计划退出 hook 自动打开批准 UI。

目标：

- Markdown 和文本文件：`.md`、`.mdx`、`.txt`。
- 纯文本配置和数据文件，以文本形式渲染：`.yaml`、`.yml`、`.json`、`.jsonc`、`.json5`、`.toml`、`.ini`、`.cfg`、`.conf`、`.properties`、`.csv`、`.tsv`、`.log`、`.xml`、`.env.example`。`.env` 本身会被明确拒绝（它通常包含机密信息，而 annotate 历史记录会复制文件内容）。源代码文件应使用 `plannotator review`，而不是 annotate。
- HTML 文件（`.html`、`.htm`）：默认将原始页面渲染出来；`--markdown` 则转换为 markdown。为兼容性接受 `--render-html`；原始渲染本来就是默认行为。
- URL（`https://...`）：默认通过 Jina Reader 获取并转换；`--no-jina` 则改用普通 fetch 加 Turndown。
- 运行中的本地应用：探测结果返回 HTML 的回环 `http://localhost:PORT/` URL 会以实时应用模式打开（对真实运行中的页面进行批注）。`--app` 强制使用实时模式，并在无法应用时明确失败；`--static` 强制使用经典转换流程。非回环 URL 始终使用转换流程。
- 文件夹：`plannotator annotate docs/` 会在该文件夹的受支持文件上打开文件浏览器。

单个文件上限为 2MB。文件会从磁盘上的稳定项目路径读取；请将接受审查的源文件保留在其原位置。

参数容错：允许额外的单词（`plannotator annotate look at notes.md please` 会打开 `notes.md`），但两个可解析的目标会被视为错误，并列出这两个目标；而无法识别的带连字符令牌会禁用该容错机制，因此标志拼写错误会明确报错。当普通的多单词调用无法解析出任何目标时，CLI 会在 stdout 上打印一段面向 agent 的交接信息并以 0 退出：请读取该信息，确定具体目标，然后使用该确切路径或 URL 重新运行。

### 严格门控与退出代码

对于机器可检查的批准门控，请添加 `--gate --json` 以及以下一个或两个严格标志：

```bash
plannotator annotate report.md --gate --json --require-approval --result-file /tmp/decision.json
```

- `--require-approval`：退出代码报告人工审核结果。
- `--result-file <path>`：stdout 中的决策 JSON 也会以原子方式发布到 `<path>`。父目录必须存在，且文件不得已存在；结果根据调用时的 cwd 解析。

启用严格标志时的退出代码（grep 约定）：

| Exit | Meaning |
| --- | --- |
| 0 | 已批准。唯一表示成功的代码。 |
| 1 | 审核者未批准（已添加批注或已关闭）；但决策记录仍已发布。 |
| 2 | 门控本身失败：标志组合错误、启动失败（文件缺失、URL 无法访问、文件过大），或结果文件无法发布。绝不能将其视为审核结果。 |
| 128+n | 被信号 n 终止。 |

未使用严格标志时，启动失败会以 1 退出，退出代码不携带任何决策；请改为解析输出。两个严格标志都要求使用 `--gate --json`，并会拒绝 `--hook`。

## plannotator annotate-last

```bash
plannotator annotate-last [--stdin] [--tailscale] [--gate] [--json] [--hook]
plannotator last
```

在批注 UI 中打开当前 agent 会话中最新渲染的 assistant 消息（`last` 是别名）。系统会自动按主机发现会话日志；使用 `--stdin` 则改为从 stdin 读取内容。

运行该命令前不要立即打印评论或状态消息：该命令的目标是最新渲染的 assistant 消息，因此前导语会成为被批注的内容。

## plannotator copilot-last

```bash
plannotator copilot-last [--gate] [--json] [--hook]
```

适用于实时 GitHub Copilot CLI 会话的 annotate-last 变体（读取 Copilot 的会话状态事件）。通常由 Copilot 插件的 /plannotator-last 命令调用；仅在 Copilot CLI 会话内部使用。

## plannotator archive

```bash
plannotator archive
```

打开一个只读浏览器，查看 Plannotator 数据目录中保存的计划决策（已批准/已拒绝标记）。不会返回反馈；用户点击 Done 后会话结束。

## plannotator guide

```bash
plannotator guide list
plannotator guide export --id <savedGuideId> [--out <file.html>]
plannotator guide export --guide <guide.json> --patch <diff.patch> [--out <file.html>]
plannotator guide export --snapshot <snapshot.json> [--out <file.html>]
plannotator guide share --id <savedGuideId> [--public] [--ttl <7d|24h|30m|3600>] [--json]
plannotator guide unshare <id> --token <deleteToken>
```

Guided Reviews 是在代码审查 UI 中生成的、由 AI 编写的 diff 演练说明。CLI 可处理已保存的演练说明：

- `list` 显示 Plannotator 为当前仓库持久化保存的演练说明。
- `export` 将一个可移植、自包含的 HTML 文件写入磁盘（查看器从 guides.show 加载）。`--guide` + `--patch` 可针对 unified diff 导出由你自行编写的演练说明（`--patch -` 从标准输入读取；验证严格执行，并会指出演练说明引用但补丁中缺失的任何文件）。`--out -` 将内容写入标准输出。`--viewer-url` 覆盖固定的查看器基础 URL。
- `share` 上传演练说明并打印链接。默认加密：密钥仅存在于 URL 片段中，主机只存储密文。`--public` 以未加密方式存储，以便聊天应用展开预览。`--ttl` 设置过期时间；否则链接会一直保留，直到执行 `unshare`。已保存的演练说明会记录其链接，第二次执行 `share --id` 时会拒绝操作，以免使第一个链接的删除令牌失效且无法清理。
- `unshare <id> --token <t>` 使用分享时打印的删除令牌移除链接。

## plannotator sessions

```bash
plannotator sessions [--open [N]] [--clean]
```

列出活动的 Plannotator 服务器会话。`--open` 在浏览器中重新打开第 N 个会话（默认为 1），适用于在审查过程中途关闭标签页后重新打开。`--clean` 清理过期条目。

## Other subcommands

```bash
plannotator setup-goal <interview|facts> <bundle.json | -> [--json]
plannotator uninstall [--purge] [--yes] [--dry-run]
plannotator improve-context
```

- `setup-goal` 为 /goal 工作流打开访谈或事实接受 UI；它由 `plannotator-setup-goal` skill 驱动，并接收一个 bundle JSON（`-` 从标准输入读取）。不要手动构建 bundle。
- `uninstall` 移除 Plannotator 安装的组件（`--purge` 还会删除本地数据；无 TTY 时必须使用 `--yes`；`--dry-run` 用于预览）。
- `improve-context` 和 `install-runtime` 是内部集成命令（钩子接入和托管运行时安装）。绝不要直接运行 `improve-context`；`plannotator install-runtime agent-terminal` 可用于重新安装可选的 annotate-terminal 运行时，通常由安装程序运行。
- 其他主机内部子命令（`opencode-*` 和 `copilot-plan` 系列）由其插件调用，而不是由你调用。

## Environment variables that change behavior

| Variable | Use |
| --- | --- |
| `PLANNOTATOR_REMOTE=1` | 强制使用远程模式（固定端口 19432，宽范围绑定），用于 SSH/devcontainer 会话；`0` 强制使用本地模式。未设置时表示自动检测 SSH。 |
| `PLANNOTATOR_PORT` | 固定端口，而不是使用随机端口。 |
| `PLANNOTATOR_ORIGIN` | 覆盖 agent-origin 检测（`claude-code`、`codex`、`opencode`、`pi`、`oh-my-pi`、`amp`、`droid`、`copilot-cli`、`gemini-cli`、`kiro-cli`）。从检测无法穿透的 wrapper 启动 Plannotator 时设置此变量。 |
| `PLANNOTATOR_AI=disabled` | 禁用 UI 中的 Ask AI 和由 agent 启动的审查界面。 |
| `PLANNOTATOR_SHARE=disabled` | 禁用 URL 分享，包括演练说明分享链接。 |
| `PLANNOTATOR_DATA_DIR` | 更改数据目录位置（默认为 `~/.plannotator`）：计划、历史记录、草稿、配置。 |
| `PLANNOTATOR_BROWSER` | 在指定的浏览器中打开会话。 |

## 向实时会话发布注释

正在运行的计划审查会话会在其基础 URL 上提供一个小型 HTTP API，用于外部注释：`POST /api/external-annotations` 会添加审查者立即可见的内联注释，并通过 PATCH/DELETE 支持更新；`/api/external-annotations/stream` 提供 SSE 流。UI 中的“复制代理指令”操作会将当前会话的完整 API 契约（包含正确的基础 URL）复制到剪贴板，以便交给代理或脚本。如果用户粘贴了此类指令，请遵循其中的指令；不要在该契约之外自行发明端点。

## 不要

- 不要解析或抓取浏览器 UI 的 HTML；CLI 的 stdout（以及上述文档化的 HTTP API）就是完整契约。
- 不要在真实的 hook 上下文之外使用 `--hook`；需要结构化输出时使用 `--json`。
- 不要裸运行 `plannotator` 进行交互；它是 hook 的入口点。
- 不要猜测 flags。不确定时运行 `plannotator <command> --help`；未知的带短横线标记会有意导致 annotate 失败。
- 不要将 `plannotator annotate` 指向源代码文件或 `.env` 文件；代码应通过 `plannotator review` 处理，并且 `.env` 会被拒绝。
- 除非确实有人在场进行审查，否则不要启动严格门禁（`--require-approval`）；会话会一直阻塞，直到有人采取操作。