---
name: plannotator
description: "Reference for using the Plannotator CLI: plan review, code review, annotating files, URLs, folders, and running local apps, annotating the last assistant message, browsing archived plan decisions, and exporting or sharing Guided Reviews. Invoke when asked to use Plannotator for anything not covered by a more specific plannotator-* skill."
---
# Plannotator CLI 参考

Plannotator 是一个用于智能体工作流的、本地运行且基于浏览器的审查层：它会在标注 UI 中打开计划、差异和文档，由人工进行标记，随后通过 stdout 将结构化反馈返回给你。它以单个 `plannotator` 二进制文件及各宿主环境对应的钩子形式安装，因此当你退出计划模式时，计划审查会自动触发；其他所有界面都需要通过 CLI 显式启动。会话运行在随机的 localhost 端口上（远程模式下固定使用端口 19432），并会阻塞，直到审查者提交反馈、批准或关闭标签页。

本技能是知识层。`plannotator-review`、`plannotator-annotate` 和 `plannotator-last` 技能是用于三种最常见操作的轻量启动器；当你需要自行选择正确的命令或标志时，请使用本参考。

## 选择命令

| 用户需求 | 运行 |
| --- | --- |
| 审查你生成的计划 | 无需执行任何操作。通过钩子，计划审查会在退出计划模式时自动打开。绝不要自行运行不带参数的 `plannotator`。 |
| 审查当前代码变更 | `plannotator review` |
| 审查 GitHub PR 或 GitLab MR | `plannotator review <PR_URL>` |
| 标注 markdown、文本、配置或 HTML 文件 | `plannotator annotate <file>` |
| 标注网页 | `plannotator annotate <https-url>` |
| 标注正在运行的本地应用（开发服务器） | `plannotator annotate <http://localhost:PORT/>` |
| 从文件夹中选择要标注的文件 | `plannotator annotate <folder/>` |
| 标注你最近一条助手消息 | `plannotator last` |
| 浏览过去的计划决策 | `plannotator archive` |
| 导出或共享引导式审查 | `plannotator guide export` / `plannotator guide share` |
| 重新打开或列出活动会话 | `plannotator sessions` |

## 会话模型

每条审查或标注命令都会启动一个本地 Web 服务器、打开浏览器，并阻塞到人工做出决定为止。这可能需要几分钟。启动时请设置较长的命令超时时间（或不设置超时），也可以在后台运行，然后在进程退出时读取 stdout。不要通过终止进程来“完成”审查；如果会话在没有做出决定的情况下结束，则会被视为没有反馈。

stdout 约定就是完整的接口：

- 纯文本（默认）：关闭时输出为空，批准时输出 `The user approved.`，否则输出反馈文本。在同一对话中处理返回的反馈。
- `--json`：输出一条 JSON 记录，`{"decision":"approved"|"dismissed"|"annotated","feedback":"..."}`。批准结果的 `feedback` 中仍可能包含备注；应将其视为指导意见，而不是变更请求。
- `--hook`：仅适用于真正的 PostToolUse/Stop 钩子上下文，输出钩子原生格式。批准或关闭时不输出任何内容（钩子通过）；存在标注时输出 `{"decision":"block","reason":"..."}`。`--hook` 隐含启用门控 UI。切勿将其用于普通的交互式调用。

`plannotator <command> --help` 会打印用法，而不会启动任何内容。不带参数的 `plannotator` 是钩子入口点，并期望从 stdin 接收钩子 JSON。

## plannotator review

```bash
plannotator review [--git | --gitbutler] [--local | --no-local] [--tailscale] [PR_URL]
```

审查本地 VCS 更改；如果提供了 URL，则审查拉取请求。审查者提交后，反馈和批注会输出到标准输出；如果批准，则会返回一条 LGTM 风格的消息。

- 系统会自动检测 VCS（在支持的情况下包括 JJ、GitButler、Git 和 P4）。`--git` 强制使用原生 Git；`--gitbutler` 强制使用 GitButler（需要 `but` CLI 0.21.0+）。如果从一个包含嵌套仓库的非 VCS 父文件夹中运行，则会生成组合工作区差异。
- 默认差异是“PR 现在会显示的所有内容”：主干与工作树的合并基准差异，加上未跟踪文件。审查者可以在 UI 中切换差异类型；你无法通过 CLI 控制该选项。
- PR 审查（`plannotator review https://github.com/owner/repo/pull/123`，也支持 GitLab MR URL）需要经过身份验证的 `gh` 或 `glab` CLI。`--local`（默认选项）会在后台为 PR 头部构建本地检出，以便完整访问文件；`--no-local` 会跳过此步骤，仅审查平台差异。
- `--tailscale` 通过 `tailscale serve` 将环回会话发布到用户的 tailnet（使用 HTTPS，绝不公开），并输出带有二维码的 URL。如果发布失败，程序会以非零状态退出，而不会让服务器继续挂起。

## plannotator annotate

```bash
plannotator annotate <target> [--markdown] [--no-jina] [--app | --static] [--render-html] [--tailscale] [--gate] [--json] [--hook]
```

在批注 UI 中打开一个文档、页面或应用，并将人工批注输出到标准输出。

目标：

- Markdown 和文本文件：`.md`、`.mdx`、`.txt`。
- 以文本形式呈现的纯文本配置和数据文件：`.yaml`、`.yml`、`.json`、`.jsonc`、`.json5`、`.toml`、`.ini`、`.cfg`、`.conf`、`.properties`、`.csv`、`.tsv`、`.log`、`.xml`、`.env.example`。程序会刻意拒绝 `.env` 本身（它通常包含机密信息，而批注历史记录会复制文件内容）。源代码文件应使用 `plannotator review`，而不是 annotate。
- HTML 文件（`.html`、`.htm`）：默认以原始页面形式呈现；使用 `--markdown` 则会将其转换为 markdown。出于兼容性考虑，仍接受 `--render-html`；原始呈现已经是默认行为。
- URL（`https://...`）：默认通过 Jina Reader 获取并转换；`--no-jina` 则改用普通获取方式和 Turndown 进行转换。
- 正在运行的本地应用：如果环回 `http://localhost:PORT/` URL 的探测结果返回 HTML，则会以实时应用模式打开（直接在真实运行的页面上添加批注）。`--app` 强制使用实时模式，并在无法应用时明确失败；`--static` 强制使用经典转换流程。非环回 URL 始终使用转换流程。
- 文件夹：`plannotator annotate docs/` 会打开文件浏览器，展示该文件夹中受支持的文件。

单个文件大小上限为 2MB。文件会从磁盘上的稳定项目路径读取；请将待审查的源文件保留在原位置。

参数容错：可以包含额外的词语（`plannotator annotate look at notes.md please` 会打开 `notes.md`），但如果存在两个可解析的目标，则会报错并列出二者；无法识别的带连字符标记会禁用此容错机制，使标记拼写错误明确失败。如果普通的多词调用无法解析出任何目标，CLI 会将一份面向代理的交接说明输出到标准输出并以状态 0 退出：读取该说明，确定具体目标，然后使用该目标的确切路径或 URL 重新运行。

### 严格门禁与退出码

若要设置可由机器检查的审批门禁，请添加 `--gate --json`，并加上一个或两个严格标志：

```bash
plannotator annotate report.md --gate --json --require-approval --result-file /tmp/decision.json
```

- `--require-approval`：退出码会反映人工审核结果。
- `--result-file <path>`：标准输出中的决策 JSON 也会以原子方式发布到 `<path>`。父目录必须存在，且该文件不得已存在；结果路径基于调用命令时的当前工作目录解析。

使用严格标志时的退出码（遵循 grep 惯例）：

| 退出码 | 含义 |
| --- | --- |
| 0 | 已批准。唯一的成功状态。 |
| 1 | 审核者未批准（已添加批注或已驳回）；决策记录仍然会发布。 |
| 2 | 门禁本身失败：标志组合无效、启动失败（文件缺失、URL 无法访问、文件过大），或无法发布结果文件。绝不能将其视为审核者的决定。 |
| 128+n | 被信号 n 终止。 |

未使用严格标志时，启动失败会以退出码 1 退出，且退出码不包含决策信息；应改为解析输出。这两个严格标志都要求同时使用 `--gate --json`，并且不能与 `--hook` 一起使用。

## plannotator annotate-last

```bash
plannotator annotate-last [--stdin] [--tailscale] [--gate] [--json] [--hook]
plannotator last
```

在批注 UI 中打开当前代理会话中最新渲染的助手消息（`last` 是其别名）。系统会根据主机自动查找会话日志；使用 `--stdin` 则从标准输入读取内容。

运行该命令前，不要立即输出说明或状态消息：该命令的目标是最新渲染的助手消息，因此前置说明会变成被批注的内容。

## plannotator copilot-last

```bash
plannotator copilot-last [--gate] [--json] [--hook]
```

这是面向实时 GitHub Copilot CLI 会话的 annotate-last 变体（读取 Copilot 的会话状态事件）。通常由 Copilot 插件的 /plannotator-last 命令调用；请仅在 Copilot CLI 会话中使用。

## plannotator archive

```bash
plannotator archive
```

打开一个只读浏览器，用于查看 Plannotator 数据目录中保存的计划决策（带有已批准/已拒绝徽章）。不会返回任何反馈；当用户点击 Done 时，会话即结束。

## plannotator guide

```bash
plannotator guide list
plannotator guide export --id <savedGuideId> [--out <file.html>]
plannotator guide export --guide <guide.json> --patch <diff.patch> [--out <file.html>]
plannotator guide export --snapshot <snapshot.json> [--out <file.html>]
plannotator guide share --id <savedGuideId> [--public] [--ttl <7d|24h|30m|3600>] [--json]
plannotator guide unshare <id> --token <deleteToken>
```

引导式审查是在代码审查 UI 中生成的、由 AI 驱动的差异变更演练。CLI 可用于处理已保存的引导式审查：

- `list` 显示 Plannotator 为当前仓库持久化保存的引导式审查。
- `export` 会写入一个可移植的独立 HTML 文件（查看器从 guides.show 加载）。使用 `--guide` + `--patch` 可导出你针对统一差异自行编写的引导式审查（`--patch -` 从标准输入读取；验证非常严格，并会列出引导式审查引用但补丁中缺失的任何文件）。`--out -` 会写入标准输出。`--viewer-url` 会覆盖固定的查看器基础 URL。
- `share` 会上传引导式审查并输出链接。默认采用加密方式：密钥仅存在于 URL 片段中，主机存储的是密文。`--public` 会以未加密方式存储，使聊天应用可以展开预览。`--ttl` 设置有效期；否则链接会一直保留到执行 `unshare`。已保存的引导式审查会记录其链接，再次执行 `share --id` 时将拒绝操作，以免第一个链接的删除令牌失去归属。
- `unshare <id> --token <t>` 使用分享时输出的删除令牌移除链接。

## plannotator 会话

```bash
plannotator sessions [--open [N]] [--clean]
```

列出活跃的 Plannotator 服务器会话。`--open` 会在浏览器中重新打开会话 N（默认为 1），适用于审阅过程中标签页被关闭的情况。`--clean` 会删除过期条目。

## 其他子命令

```bash
plannotator setup-goal <interview|facts> <bundle.json | -> [--json]
plannotator uninstall [--purge] [--yes] [--dry-run]
plannotator improve-context
```

- `setup-goal` 为 /goal 工作流打开访谈或事实接受 UI；它由 `plannotator-setup-goal` skill 驱动，并接收一个 bundle JSON（`-` 表示从 stdin 读取）。不要手动构建 bundle。
- `uninstall` 会移除由 Plannotator 安装的组件（`--purge` 还会删除本地数据；在没有 TTY 时必须使用 `--yes`；`--dry-run` 用于预览）。
- `improve-context` 和 `install-runtime` 是内部集成命令（用于 hook 管道和托管运行时安装）。切勿直接运行 `improve-context`；`plannotator install-runtime agent-terminal` 用于重新安装可选的 annotate-terminal 运行时，通常由安装程序运行。
- 其他宿主内部子命令（`opencode-*` 和 `copilot-plan` 系列）由其插件调用，而不是由你调用。

## 会改变行为的环境变量

| 变量 | 用途 |
| --- | --- |
| `PLANNOTATOR_REMOTE=1` | 为 SSH/devcontainer 会话强制启用远程模式（固定端口 19432，宽泛绑定）；`0` 强制启用本地模式。未设置时表示自动检测 SSH。 |
| `PLANNOTATOR_PORT` | 使用固定端口，而不是随机端口。 |
| `PLANNOTATOR_ORIGIN` | 覆盖代理来源检测（`claude-code`、`codex`、`opencode`、`pi`、`oh-my-pi`、`amp`、`droid`、`copilot-cli`、`gemini-cli`、`kiro-cli`）。当通过检测机制无法识别的包装器启动 Plannotator 时，请设置此变量。 |
| `PLANNOTATOR_AI=disabled` | 在 UI 中禁用 Ask AI 和由代理启动的审阅界面。 |
| `PLANNOTATOR_SHARE=disabled` | 禁用 URL 分享，包括指南分享链接。 |
| `PLANNOTATOR_DATA_DIR` | 移动数据目录（默认为 `~/.plannotator`）：计划、历史记录、草稿和配置。 |
| `PLANNOTATOR_BROWSER` | 在指定浏览器中打开会话。 |

## 将注释发布到实时会话中

正在运行的计划审阅会话会在其基础 URL 上公开一个用于接收外部注释的小型 HTTP API：`POST /api/external-annotations` 用于添加审阅者可立即看到的行内注释，PATCH/DELETE 用于更新和删除，并在 `/api/external-annotations/stream` 提供 SSE 流。UI 中的“复制代理指令”操作会将当前会话的完整 API 约定连同正确的基础 URL 复制到剪贴板，以便交给代理或脚本。如果用户粘贴了此类指令，请遵循这些指令；不要凭空编造该约定之外的端点。

## 禁止事项

- 不要解析或抓取浏览器 UI 的 HTML；CLI 的 stdout（以及上述文档化的 HTTP API）就是完整约定。
- 不要在真实 hook 上下文之外使用 `--hook`；需要结构化输出时，请使用 `--json`。
- 不要以交互方式直接运行 `plannotator`；它是 hook 入口点。
- 不要猜测标志。不确定时运行 `plannotator <command> --help`；未知的带短横线 token 会有意导致 annotate 失败。
- 不要让 `plannotator annotate` 指向源代码文件或 `.env` 文件；代码应通过 `plannotator review` 处理，而 `.env` 会被拒绝。
- 除非确实有人员在场进行审阅，否则不要启动严格门禁（`--require-approval`）；会话会一直阻塞，直到审阅者执行操作。