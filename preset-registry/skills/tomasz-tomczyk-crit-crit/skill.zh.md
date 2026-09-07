---
name: crit
description: "Review code changes, a plan, a live page (running dev server), or a local HTML file with Crit inline comments and structured human feedback. Use only when the user explicitly invokes /crit or directly asks to use Crit; a generic review request does not count."
---
# 使用 Crit 进行评审

这是交互式的、由人通过浏览器参与的评审循环。只有当用户显式调用 `/crit` 或直接要求使用 Crit 时才运行它。笼统地要求评审代码、计划、diff、PR 或页面并不算数。

使用 `crit` 以行内评论的形式评审并修订代码变更、计划、实时页面（运行中的开发服务器、staging URL）或本地 HTML 文件。

## 步骤 1：向 `crit` 传递参数

CLI 会根据参数自动检测评审模式。**不要询问用户使用哪种模式。** 按以下方式传递参数：

```
crit <arguments>               # file, dir, URL, .html — CLI auto-detects mode
crit --pr <num|url>            # GitHub PR (range mode)
crit --mr <iid|url>            # GitLab MR (range mode)
crit --range <base>..<head>    # commit range (range mode)
crit                           # no args → branch diff
```
如果没有参数，请检查对话上下文：

1. 本次对话中先前已写入计划文件 → `crit <plan-file>`
2. 否则 → 不带参数的 `crit`（分支 diff）

如果用户想从另一台设备打开评审——例如通过 Tailscale 连接的手机：

让 crit 保持在 loopback 上，通过反向代理接入。步骤 1 的参数依然适用（文件、不带参数的 `crit` 等）：

```bash
crit --public-url "https://<machine>.ts.net" --allow-unauthenticated-network --no-open [args…]
# then: tailscale serve --bg --https=443 http://127.0.0.1:<port>
```

- `--public-url` 只会更改 crit 打印出的 URL——它**不会**将服务器暴露出去。
- 使用 `--public-url` 时（即使在 loopback 上）以及使用任何非 loopback 的 `--host` 时，都需要 `--allow-unauthenticated-network`。Crit 没有身份验证：任何能访问该 URL 的人都可以读取仓库并发布可能触发 agent 的评论。请确认用户是否接受这种影响范围。
- **不要将 `--host` 绑定到 Tailscale/局域网 IP**——请使用 `tailscale serve`（或 SSH 隧道）进行代理。从 crit 的启动输出中获取 `<port>`，或用 `-p` 固定端口。转发 crit 打印的 URL（公网的那个），而不是 localhost。

## 步骤 2：启动 crit 并阻塞直至评审完成

**关键——你必须运行此步骤。不要跳过它。不要在未执行它的情况下继续。**

在前台运行 `crit` 并阻塞直至其退出：

```bash
crit <plan-file>   # specific file
crit               # git mode
```

如果本次对话先前已经有一个 crit 服务器在运行，`crit` 会自动连接到它。若是全新启动，它会启动守护进程、打开浏览器，并阻塞直到用户点击 "Finish Review"。

`crit` 在启动时会打印评审 URL（例如 `Started crit daemon at http://localhost:<port>`）。请一字不差地转发：

> **"Crit 已在 http://localhost:<port> 打开。请留下行内评论，然后点击 Finish Review。"**

**在 `crit` 完成之前不要继续。** 不要要求用户输入任何内容。不要提前读取评审文件。等待前台命令结束——这正是你确认人类已完成评审的方式。

## 步骤 3：读取评审输出

`crit` 完成后，读取 **stdout** 并按照其中的指示操作。检查 **stderr** 中的 `approved: true` 或 `approved: false`。

当评论包含 `quote`、`anchor` 或 `drifted` 时：
- `quote`：评审者选中的具体文本——将你的修改集中在被引用的文本上，而不是整个行范围
- `anchor`：用它来定位内容的当前位置；编辑之后行号可能已过时
- `drifted: true`：原始内容已被删除或大幅重写——行号至多只是近似值

**后备方案**（轮次中途重新进入、计划钩子或无头工作流）：`crit comments` / `crit comments --json`。计划模式的评审请使用 `crit comments --plan <slug>`。

## 步骤 4：处理每条评审评论

对每条未解决的评论：

1. 理解这条评论所要求的内容
2. 如果其中包含建议块，应用该具体变更
3. 修订所引用的文件（计划或 diff 中的代码文件）
4. 回复你做了什么：`crit comment --reply-to <id> --author 'Qwen' '<what you did>'`（回复正文支持 markdown）
5. **不要传递 `--resolve`。** 是否解决由评审者决定。只有当用户明确要求时才添加 `--resolve`。

编辑计划文件会触发 Crit 的实时重载——用户会立即在浏览器中看到变更。

### 回复多条评论时

使用 `--json` 进行单次批量调用，而不是为每条评论单独调用一次：

```bash
echo '[
  {"reply_to": "c_a1b2c3", "body": "Fixed"},
  {"reply_to": "c_d4e5f6", "body": "Refactored as suggested"}
]' | crit comment --json --author 'Qwen'
```

## 步骤 5：发出完成信号并开始下一轮

**关键——你必须运行此步骤。不要跳过它。不要在未执行它的情况下继续。**

stdout 上的结束提示中包含再次运行的命令——用它来开启新一轮。

在后续调用中，`crit` 会先自动发出轮次完成信号，然后阻塞直到下一次点击 "Finish Review"。

告诉用户：**“变更已应用。请在浏览器中查看 diff，准备好后点击 Finish Review。"**

**在 `crit` 完成之前不要继续。** 完成后，返回步骤 3。如果用户结束时没有留下任何评论，即表示评审已获批准——停止循环并继续。

## 分享

如果用户索要 URL、可分享的链接，或要求分享评审：

```bash
crit share <file>
```

**始终将完整输出转发给用户**——直接把 URL 复制到你的回复中。不要让用户去翻找工具输出。

要移除已分享的评审：

```bash
crit unpublish [file...]
```

### 二维码

只在支持等宽渲染的真实终端环境中使用 `--qr`。在移动应用或网页聊天界面中跳过它——Unicode 方块字符无法正常渲染。

```bash
crit share --qr <file>
```
