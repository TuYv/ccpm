---
name: plannotator
description: "Reference for using the Plannotator CLI: plan review, code review, annotating files, URLs, folders, and running local apps, annotating the last assistant message, browsing archived plan decisions, and exporting or sharing Guided Reviews. Invoke when asked to use Plannotator for anything not covered by a more specific plannotator-* skill."
---
# Plannotator CLI 参考

Plannotator 是面向代理工作流的本地、基于浏览器的审查层：它会在注释 UI 中打开计划、差异和文档，人工进行标注后，结构化反馈会通过 stdout 返回给你。它安装为单个 `plannotator` 二进制文件以及每个主机对应的钩子，因此当你退出计划模式时，计划审查会自动触发；其他所有界面都需要通过 CLI 显式启动。会话运行在随机的 localhost 端口上（远程模式下固定使用端口 19432），并会阻塞，直到审查者提交反馈、批准或关闭标签页。

此技能是知识层。`plannotator-review`、`plannotator-annotate` 和 `plannotator-last` 技能是三个最常见操作的轻量启动器；当你需要自行选择合适的命令或标志时，请使用本参考。

## 选择命令

| 用户希望 | 运行 |
| --- | --- |
| 审查你生成的计划 | 无需操作。计划审查会在退出计划时通过钩子自动打开。绝不要自行运行裸 `plannotator`。 |
| 审查并显式批准保存为文件的计划/规范 | `plannotator annotate <file> --gate --json` |
| 审查当前代码变更 | `plannotator review` |
| 审查 GitHub PR 或 GitLab MR | `plannotator review <PR_URL>` |
| 标注 Markdown、文本、配置或 HTML 文件 | `plannotator annotate <file>` |
| 标注网页 | `plannotator annotate <https-url>` |
| 标注正在运行的本地应用（开发服务器） | `plannotator annotate <http://localhost:PORT/>` |
| 从文件夹中选择文件进行标注 | `plannotator annotate <folder/>` |
| 标注你的最新助手消息 | `plannotator last` |
| 浏览过去的计划决策 | `plannotator archive` |
| 导出或分享引导式审查 | `plannotator guide export` / `plannotator guide share` |
| 重新打开或列出活动会话 | `plannotator sessions` |

## 会话模型

每个审查或标注命令都会启动本地 Web 服务器、打开浏览器，并阻塞直到人工做出决定。这可能需要数分钟。请使用较长（或无限制）的命令超时来启动它，或者在后台运行，然后在进程退出时读取 stdout。不要为了“完成”审查而终止进程；会话在没有决定的情况下结束意味着没有反馈。

Stdout 是接口，但其约定因命令而异。对于 `annotate` 及其最新消息变体：

- 纯文本（默认）：关闭时输出为空，批准时输出 `The user approved.`，其他情况输出反馈文本。请在同一对话中处理返回的反馈。
- `--json`：一条 JSON 记录，包含 `decision`（`approved`、`dismissed` 或 `annotated`）以及可选的原始 `feedback`。批准仍可能在 `feedback` 中附带备注；请将其视为指导，而非变更请求。
- `--hook`：仅用于真实 PostToolUse/Stop 钩子上下文的钩子原生输出。批准/关闭不输出任何内容（钩子通过）；标注输出 `{"decision":"block","reason":"..."}`。`--hook` 隐含 gate UI。绝不要将其用于正常的交互式调用。

`plannotator <command> --help` 会打印用法而不启动任何内容。裸 `plannotator` 是钩子入口点，并且期望从 stdin 接收钩子 JSON。

## plannotator review

```bash
plannotator review [--git | --gitbutler] [--local | --no-local] [--tailscale] [--json] [PR_URL]
```

审查本地 VCS 更改；如果提供 URL，则审查拉取请求。默认 stdout 保持纯文本：现有的结束消息、批准提示或反馈。

使用 `--json` 时，直接审查会输出一条记录：`{ decision: 'approved' | 'annotated' | 'dismissed', message: string }`。`message` 是 CLI 渲染的文本，与默认纯文本输出完全一致，但不包含末尾的控制台换行符。它包含自定义提示，以及带有备注的非阻塞批准说明；仅当 `annotations.length > 0` 时才会包含拒绝后缀，包括 PR 模式下也是如此；对于零注释的平台状态则不会包含。 

只能根据 `decision` 对结果进行分类，绝不能根据 `message` 文本进行分类。`approved` 审查中的备注属于指导建议，而不是阻塞性变更请求。此渲染后的 `message` 契约与 `annotate` 使用的原始反馈 JSON 彼此独立，`opencode-review` 集成保持不变。`--hook` 仅适用于 annotate。

- VCS 会自动检测（在支持的情况下包括 JJ、GitButler、Git 和 P4）。`--git` 强制使用普通 Git；`--gitbutler` 强制使用 GitButler（需要 `but` CLI 0.21.0+）。从包含嵌套仓库的非 VCS 父文件夹运行时，会生成合并后的工作区差异。
- 默认差异是“当前 PR 将展示的全部内容”：trunk 与工作树之间的 merge-base，加上未跟踪文件。审查者可以在 UI 中切换差异类型；CLI 无法控制该设置。
- PR 审查（例如 `plannotator review https://github.com/owner/repo/pull/123`，也支持 GitLab MR URL）需要已认证的 `gh` 或 `glab` CLI。`--local`（默认设置）会在后台构建 PR head 的本地检出，以便完整访问文件；`--no-local` 会跳过此步骤，仅审查平台差异。
- `--tailscale` 通过 `tailscale serve` 将 loopback 会话发布到用户的 tailnet（使用 HTTPS，绝不会公开到互联网），并输出带 QR 码的 URL。发布失败时会以非零状态退出，而不是让服务器持续挂起。

## plannotator annotate

```bash
plannotator annotate <target> [--markdown] [--no-jina] [--app | --static] [--render-html] [--tailscale] [--gate] [--json] [--hook]
```

在注释 UI 中打开一个文档、页面或应用，并将用户的注释返回到 stdout。

普通的 `annotate` 仅用于反馈：它显示**关闭**按钮，但不显示**批准**按钮。当用户要求审查、批准、接受或门控一个已保存为文件的生成计划、规范或文档时，始终添加 `--gate --json`。不要告诉用户可以批准普通的 `annotate` 会话。如果计划将通过宿主 agent 的原生计划流程交接，则不要启动 `annotate`；让计划退出 hook 自动打开批准 UI。

目标：

- Markdown 和文本文件：`.md`、`.mdx`、`.txt`。
- 以文本形式渲染的纯文本配置和数据文件：`.yaml`、`.yml`、`.json`、`.jsonc`、`.json5`、`.toml`、`.ini`、`.cfg`、`.conf`、`.properties`、`.csv`、`.tsv`、`.log`、`.xml`、`.env.example`。`.env` 本身会被有意拒绝（它通常包含机密信息，而 annotate 历史记录会复制文件内容）。源代码文件应使用 `plannotator review`，而不是 annotate。
- HTML 文件（`.html`、`.htm`）：默认按原始页面渲染；使用 `--markdown` 可转换为 markdown。为兼容性接受 `--render-html`；原始渲染已经是默认行为。
- URL（`https://...`）：默认通过 Jina Reader 获取并转换；`--no-jina` 则使用普通 fetch 加 Turndown。
- 运行中的本地应用：如果 loopback `http://localhost:PORT/` URL 的探测返回 HTML，则会以实时应用模式打开（对实际运行的页面进行注释）。`--app` 强制使用实时模式，并在无法应用时明确失败；`--static` 强制使用传统转换流程。非 loopback URL 始终使用转换流程。
- 文件夹：`plannotator annotate docs/` 会打开一个显示该文件夹中受支持文件的文件浏览器。

单个文件上限为 2MB。文件从磁盘上的稳定项目路径读取；请保持被审阅的源文件留在其原位。

参数容忍：多余的词是可以接受的（`plannotator annotate look at notes.md please` 会打开 `notes.md`），但如果有两个可解析目标，就会报错并同时指出这两个目标；如果出现一个无法识别的带连字符的 token，则会禁用这种容忍并让拼写错误直接报错。当前多词调用如果没有解析出任何内容，CLI 会在 stdout 打印一条面向 agent 的交接说明并以 0 退出：读取它，推断出具体目标，然后用那个精确的路径或 URL 重新运行。

### 严格门控与退出码

要进行机器可检查的审批门控，请加上 `--gate --json`，并再加一个或两个严格标志：

```bash
plannotator annotate report.md --gate --json --require-approval --result-file /tmp/decision.json
```

- `--require-approval`：退出码反映人工结果。
- `--result-file <path>`：stdout 中的决策 JSON 也会以原子方式发布到 `<path>`。父目录必须已存在，且该文件必须不存在；结果从调用时的 cwd 解析。

严格标志下的退出码（grep 约定）：

| 退出码 | 含义 |
| --- | --- |
| 0 | 已批准。唯一的成功结果。 |
| 1 | 审阅者未批准（已标注或已驳回）；决策记录仍然已发布。 |
| 2 | 门控本身失败：无效的标志组合、启动失败（缺少文件、URL 不可达、文件过大），或者结果文件无法发布。绝不要把它当作审阅结果。 |
| 128+n | 被信号 n 终止。 |

没有严格标志时，启动失败以 1 退出，退出码不携带决策；请解析输出。两个严格标志都要求 `--gate --json`，并会拒绝 `--hook`。

## plannotator annotate-last

```bash
plannotator annotate-last [--stdin] [--tailscale] [--gate] [--json] [--hook]
plannotator last
```

打开当前 agent 会话中最近一条渲染后的 assistant 消息进入标注 UI（`last` 是别名）。会话日志会按主机自动发现；`--stdin` 则从 stdin 读取内容。

运行前不要先打印 commentary 或状态消息：该命令会针对最新渲染的 assistant 消息，所以前置说明本身会成为被标注的内容。

## plannotator copilot-last

```bash
plannotator copilot-last [--gate] [--json] [--hook]
```

这是针对实时 GitHub Copilot CLI 会话的 annotate-last 变体（读取 Copilot 的 session-state 事件）。通常由 Copilot 插件的 `/plannotator-last` 命令调用；仅在 Copilot CLI 会话中使用。

## plannotator archive

```bash
plannotator archive
```

打开一个只读浏览器，查看保存在 Plannotator 数据目录中的计划决策（approved/denied 徽标）。不会返回任何反馈；用户点击 Done 后会结束会话。

## plannotator guide

```bash
plannotator guide list
plannotator guide export --id <savedGuideId> [--out <file.html>]
plannotator guide export --guide <guide.json> --patch <diff.patch> [--out <file.html>]
plannotator guide export --snapshot <snapshot.json> [--out <file.html>]
plannotator guide share --id <savedGuideId> [--public] [--ttl <7d|24h|30m|3600>] [--json]
plannotator guide unshare <id> --token <deleteToken>
```

Guided Reviews 是由 AI 生成的 diff 漫游说明，在代码审查 UI 中生成。CLI 处理已保存的版本：

- `list` 显示 Plannotator 已为当前仓库持久化保存的 guides。
- `export` 写出一个可移植、独立的 HTML 文件（viewer 从 guides.show 加载）。`--guide` + `--patch` 会将你自己编写的 guide 针对统一 diff 导出（`--patch -` 从 stdin 读取；验证严格，并会指出 guide 引用了但 patch 缺失的任何文件）。`--out -` 写到 stdout。`--viewer-url` 覆盖固定的 viewer 基础地址。
- `share` 上传 guide 并打印一个链接。默认加密：密钥只存在于 URL fragment 中，主机只存储密文。`--public` 会以未加密方式存储，这样聊天应用就能展开预览。`--ttl` 设置过期时间；否则链接会一直有效，直到执行 `unshare`。已保存的 guide 会记录其链接，而再次执行 `share --id` 会直接拒绝，而不是让第一个链接的删除 token 失效。
- `unshare <id> --token <t>` 使用分享时打印的删除 token 移除链接。

## plannotator sessions

```bash
plannotator sessions [--open [N]] [--clean]
```

列出活动的 Plannotator 服务器会话。`--open` 会在浏览器中重新打开第 N 个会话（默认 1），适用于审查过程中关闭了标签页的情况。`--clean` 会清理过期条目。

## 其他子命令

```bash
plannotator setup-goal <interview|facts> <bundle.json | -> [--json]
plannotator uninstall [--purge] [--yes] [--dry-run]
plannotator improve-context
```

- `setup-goal` 会为 `/goal` 工作流打开 interview 或 facts-acceptance UI；它由 `plannotator-setup-goal` skill 驱动，并接收一个 bundle JSON（`-` 从 stdin 读取）。不要手工构造 bundle。
- `uninstall` 移除 Plannotator 安装的组件（`--purge` 也会删除本地数据；在没有 TTY 时必须使用 `--yes`；`--dry-run` 预览执行内容）。
- `improve-context` 和 `install-runtime` 是内部集成命令（hook plumbing 和托管运行时安装）。不要直接运行 `improve-context`；`plannotator install-runtime agent-terminal` 用于重新安装可选的 annotate-terminal runtime，通常由安装程序运行。
- 其他 host 内部子命令（`opencode-*` 和 `copilot-plan` 系列）由它们的插件调用，而不是由你调用。

## 会改变行为的环境变量

| 变量 | 用途 |
| --- | --- |
| `PLANNOTATOR_REMOTE=1` | 强制远程模式（固定端口 19432，宽松绑定），用于 SSH/devcontainer 会话；`0` 强制本地模式。未设置时采用 SSH 自动检测。 |
| `PLANNOTATOR_PORT` | 固定端口，而不是随机端口。 |
| `PLANNOTATOR_ORIGIN` | 覆盖 agent-origin 检测（`claude-code`、`codex`、`opencode`、`pi`、`oh-my-pi`、`amp`、`droid`、`copilot-cli`、`gemini-cli`、`kiro-cli`）。当通过检测无法看穿的 wrapper 启动 Plannotator 时请设置它。 |
| `PLANNOTATOR_AI=disabled` | 在 UI 中禁用 Ask AI 和 agent 启动的 review 界面。 |
| `PLANNOTATOR_SHARE=disabled` | 禁用 URL 分享，包括 guide 分享链接。 |
| `PLANNOTATOR_DATA_DIR` | 移动数据目录（默认 `~/.plannotator`）：plans、history、drafts、config。 |
| `PLANNOTATOR_BROWSER` | 在指定浏览器中打开会话。 |

## 将注释发布到实时会话

正在运行的计划审查会话会在其基础 URL 上公开一个小型 HTTP API，用于接收外部注释：`POST /api/external-annotations` 会添加审查者立即可见的行内注释，更新和删除使用 PATCH/DELETE，SSE 流位于 `/api/external-annotations/stream`。UI 中的“复制代理指令”操作会将当前会话的完整 API 契约及正确的基础 URL 放入剪贴板，供代理或脚本使用。如果用户粘贴了此类指令，请遵循它们；不要自行构造该契约之外的端点。

## 禁止事项

- 不要解析或抓取浏览器 UI 的 HTML；CLI 的 stdout（以及上述文档化的 HTTP API）是完整的契约。
- 不要在真实 hook 上下文之外使用 `--hook`；当需要结构化输出时，请使用 `--json`。
- 不要以交互方式直接运行 `plannotator`；它是 hook 入口点。
- 不要猜测标志。不确定时运行 `plannotator <command> --help`；未知的虚线参数会导致 annotate 按设计失败。
- 不要将 `plannotator annotate` 指向源代码文件或 `.env` 文件；代码应通过 `plannotator review` 提交，而 `.env` 会被拒绝。
- 除非确实有人在场进行审查，否则不要启动严格门禁（`--require-approval`）；会话会一直阻塞，直到对方操作。