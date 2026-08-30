---
name: openagents-cli
description: Use the OpenAgents CLI to read and write issues, projects, repositories, and the forum, to call any API route, to sign a person in, and to run Autopilot. Use it whenever the work touches OpenAgents itself rather than the files in this repository, or when the person says run Autopilot.
---
# OpenAgents CLI

你运行在 `openagents coder` 中，这是 `openagents` CLI 的一个子命令。`openagents` 工具负责运行其余部分。由于使用的是同一个二进制文件，它给出的答案对应的是这台机器上的构建版本，而不是凭记忆得到的版本。

## 查找命令及阅读其回答

`openagents` 工具自身的描述列出了所有命令和子命令，这些信息读取自该二进制文件。你无需再四处查找，也不需要使用 `--help` 来确认某个命令是否存在。

对于你不知道的标志，使用 `<command> --help`。本文件有意不列出任何标志：书面副本在标志发生一次变更后就会过时，而帮助输出不会。

**阅读纯文本输出。** 这是人们实际阅读的内容，而且很小。三个问题的列表以纯文本表示只有 442 字节，而 JSON 表示为 20,000 字节，因为 JSON 携带了每个问题的完整正文——而且一个会话如果为了回答一个问题读取了 20,000 字节，那么之后的每一轮也都要为这些内容付费。

只有在需要从一条记录中获取某个字段时，才添加 `--json`。相比使用一个更宽泛的命令再跳过不需要的内容，优先使用更窄的命令：`--label`、`--state`、`--limit` 和搜索词不会增加成本，并且能将回答缩减到所询问的内容。

## 无凭据时可用的功能

- `openagents computer probe|policy|status` — 检查这台机器。本地机器控制所有访问；不涉及账户。
- `openagents coder --offline` — 使用内置的替代实现回答。
- `openagents coder --autopilot --dry-run` — 输出 Autopilot 计划；不需要模型、线程或令牌。
- 任意位置的 `--help`。

其他所有功能都会访问 API，并需要令牌。没有令牌时，你会得到：

```
openagents: No OpenAgents token is available for https://openagents.com.
Set OPENAGENTS_TOKEN.
```

应将其理解为“此人尚未登录”，而不是命令损坏。

## 登录涉及的内容

令牌按 API origin 区分，存储在操作系统凭据存储中，并携带作用域。其中有两个作用域很重要：

- `chat:account` — 打开线程并与模型对话。
- `forge:write` — 推送到 forge，并写入问题、项目和论坛。

普通登录会同时签发这两个作用域。不要单独请求其中一个作用域：仅为 `chat:account` 签发的令牌无法推送，仅为 `forge:write` 签发的令牌无法打开线程，而且每次失败都会延迟到下一个命令才出现，看起来就像产品出了问题。

除上述作用域外，还有一个特权作用域：`deployments:promote`。`openagents deploy` 命令需要该作用域，且服务器仅会为当前操作员签发它。除非对方是要求部署整个 fleet 的操作员，否则不要请求该作用域；`forge:write` 无法执行提升操作。

使用 `openagents auth status` 检查登录状态。该命令会显示账户、具备资格的命名空间以及到期时间，但不会打印令牌。

### 为用户登录

你无法替他们完成此操作；这需要浏览器和他们的批准。

1. 运行 `openagents auth login --headless`。它会返回一个 URL 和一个简短代码，并且不会阻塞。
2. 将 URL 和代码提供给对方，并说明他们批准的内容：在这台机器上使用此 CLI 访问其 OpenAgents 账户。
3. 对方表示已批准后，运行 `openagents auth login --resume`。
4. 使用 `openagents auth status` 确认。

用一句话告诉对方它的用途——“这样 CLI 就能推送到代码托管平台并开启讨论串”——而不是只丢给对方一个链接。要求某人批准一项未作解释的内容，对方拒绝是合理的。

绝不要打印令牌，也绝不要把令牌粘贴到文件、提交消息或议题中。

## Autopilot

当对方说运行 Autopilot，或希望 CLI 评估当前工作区并继续执行时，启动它：

```
openagents coder --autopilot
openagents coder --autopilot "work the open issues"
openagents coder --autopilot --dry-run
openagents --autopilot
```

它以无头模式运行。它会读取工作区快照、最近的本地 Coder 会话和未解决的议题，然后不断迭代，直到满足停止条件（默认为一小时，或某一轮无法连接到模型）。可选提示词用于筛选要处理的内容。

`--dry-run` 会打印计划，然后退出，不会调用模型或开启讨论串。当你需要查看 Autopilot 在启动前会评估哪些内容时，运行它。

托管执行通道需要令牌。使用 `--lane local` 时，如果 Ollama 能够响应，则可以无签名运行。`--offline` 不能与 Autopilot 组合使用；`--dry-run` 是不调用模型的路径。

这是唯一一种启动另一个 coder 进程本身就是工作内容的情况。不带 `--autopilot` 的交互式 `openagents coder` 仍然属于嵌套会话——不要启动它。并行的命名工作仍使用 `delegate` 工具。

## 访问没有对应命令的路由

`openagents api <path>` 会向任意 API 路由发送经过身份验证的请求，并将响应正文以 JSON 形式写出。不带前导斜杠的路径会解析到 `/api/v1/` 下。当没有命令能够覆盖你的需求时使用它——有几个路由没有各自对应的命令。

## 两点注意事项

**绝不要从工具调用中读取标准输入。** `--body-file -`（以及其他所有读取标准输入的标志，例如 `auth login --token-stdin`）在工具以无标准输入的方式启动 CLI 时会永久阻塞——没有输出、没有错误，也没有超时。现在工具路径会关闭标准输入，因此调用会快速失败而不是挂起，但正确的操作方式不变：使用写入工具将内容写入真实文件，然后传入该文件的路径。管道形式（`printf '%s' "$body" | openagents ...`）应放在 `bash` 工具中使用，因为那里会收到 EOF。挂起后恢复的轮次应使用文件路径重新发起失败的写入——绝不要原样重新发出之前的调用。

**你已经处于 coder 会话中。** 不要再启动另一个交互式会话。若要并行执行工作，请使用 `delegate` 工具。Autopilot（`openagents coder --autopilot`）是无人值守的循环；当对方要求运行 Autopilot 时，启动它。

**写入操作是真实发生的。** 关闭议题、在论坛发帖或推送到代码仓库，会立即对其他人可见，并且不是由你决定撤销的。在会话中进行首次写入前，说明你将要写入的内容并获得同意。读取操作无需这些步骤。