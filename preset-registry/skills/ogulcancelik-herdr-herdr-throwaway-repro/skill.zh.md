---
name: herdr-throwaway-repro
description: Create and control a disposable named Herdr session from inside an existing Herdr session. Use for isolated Herdr runtime, pane, terminal, process, API, persistence, or agent reproductions that should be driven through the CLI/API without touching the default session.
---
# Herdr 一次性复现

当复现需要真实的 Herdr 服务器、窗格、PTY、代理或套接字 API 时，请使用一个可丢弃的具名 Herdr 会话，以免影响用户的主会话。

临时 TUI 仅用于保持可丢弃会话处于附加状态，并提供终端几何信息。通过 Herdr 的 CLI/API 从父会话驱动复现。除非该缺陷明确需要客户端输入，否则不要手动操作嵌套的 TUI。

## 不可妥协的安全要求

- 绝不要在默认会话中运行复现。
- 绝不要停止、重启、删除或终止主 Herdr 服务器。
- 绝不要使用 `pkill`、宽泛的进程匹配或猜测的 PID 进行清理。
- 创建唯一的会话名称。绝不要复用或删除不相关的具名会话。
- 创建一个新的外层窗格，并且在清理时仅关闭该窗格。
- 从命令输出中读取工作区、标签页、窗格、终端和代理 ID。绝不要自行构造这些 ID。
- 使用 `/var/tmp` 存放复现目录和可能较大的产物。
- 不要批准具有破坏性或不必要的代理操作。
- 未经用户批准，不要消耗付费代理令牌。使用请求的低成本模型和尽可能精简且有用的提示词。

## 先了解已安装的接口

以已安装的二进制文件为准。CLI 语法自本技能编写以来可能已经发生变化。

在执行任何操作之前，确认调用方位于 Herdr 内部，并查看相关帮助：

```bash
test "${HERDR_ENV:-}" = 1
herdr --version
herdr --help
herdr session
herdr pane
herdr agent
```

在使用不熟悉或可能产生变更的命令之前，请查看嵌套命令的帮助。不要运行不带参数的 `herdr` 来探索用法，因为它会启动或附加 TUI。

记录本次复现所测试的 Herdr 二进制文件及版本。如果测试的是检出代码构建，请遵循仓库中有关运行该构建的说明，而不要悄然替换为已安装的二进制文件。

## 创建外层窗格

在当前标签页中创建一个同级 shell 窗格，且不要移动焦点。当执行环境提供可用的 Herdr 布局工具时，请使用该工具。否则，请先查看已安装的窗格拆分命令的帮助，然后再使用该命令。

使用 `/var/tmp` 或专用复现目录作为新窗格的 cwd。保存返回的外层窗格 ID。这是清理时唯一可以关闭的父会话窗格。

## 启动可丢弃会话

选择一个简短且唯一的名称，例如 `repro-<topic>-<timestamp>`。

在新建的外层窗格中运行具名会话。清除继承的会话选择、套接字覆盖设置和调用方 ID，防止嵌套运行时意外访问父会话：

```bash
env \
  -u HERDR_SOCKET_PATH \
  -u HERDR_CLIENT_SOCKET_PATH \
  -u HERDR_SESSION \
  -u HERDR_WORKSPACE_ID \
  -u HERDR_TAB_ID \
  -u HERDR_PANE_ID \
  herdr --session <session-name>
```

需要时，在此启动命令中添加复现专用的环境变量。用于配置服务器的环境变量必须在具名服务器启动之前设置。

在具名会话的 API 准备就绪之前，不要继续。通过从父会话寻址该会话并列出其窗格来确认其已准备就绪。

## 仅操作一次性会话

从父会话发出的每条控制命令都必须清除继承的套接字覆盖设置，并明确选择临时会话：

```bash
env \
  -u HERDR_SOCKET_PATH \
  -u HERDR_CLIENT_SOCKET_PATH \
  -u HERDR_WORKSPACE_ID \
  -u HERDR_TAB_ID \
  -u HERDR_PANE_ID \
  HERDR_SESSION=<session-name> \
  herdr pane list
```

每条命令都要重复使用此前缀。不要依赖工具调用之间保留的 shell 状态。

从 `pane list` 中读取一次性根窗格 ID。在其中启动任何内容之前，确认其 cwd 和前台进程。

命名会话会隔离运行时状态、套接字、窗格和持久化数据。默认情况下，它们仍会共享全局 Herdr 配置和 agent 清单覆盖设置。当这些设置可能影响复现时，请检查配置来源。不要仅仅为了让测试通过而修改共享配置。

## 通过 API 驱动复现

对 shell 和普通进程使用窗格命令：

- 使用 `pane run` 在可用的 shell 提示符下启动命令。
- 使用 `pane wait-output` 等待确定性输出。
- 使用 `pane read` 捕获终端内容。
- 使用 `pane send-text` 发送字面输入。
- 使用 `pane send-keys` 发送受支持的按键。
- 使用 `pane get`、`pane process-info` 和 `pane layout` 获取运行时状态。

仅在 Herdr 识别出编码 agent 后使用 agent 命令：

- 使用 `agent start` 在现有 shell 窗格中启动受支持的 agent。
- 使用 `agent prompt` 以原子方式提交一条提示。
- 使用 `agent wait` 等待 `working`、`blocked`、`idle`、`done` 或 `unknown` 状态。
- 使用 `agent read` 捕获 agent 终端内容。
- 使用 `agent get` 和 `agent explain` 检查状态与检测结果。
- 使用 `agent send-keys` 进行交互式响应。

由于名称和选项可能发生变化，请先运行相关命令组的帮助命令。

优先使用等待，而不是任意时长的休眠。当时间本身是测试对象时，请记录时间戳并使用有界轮询。在被复现的状态转换之前、期间和之后捕获状态。

当高级命令不支持所需的终端按键时，请先确认目标应用程序所预期的按键，再通过一次性窗格发送其终端序列。切勿向父窗格发送原始控制序列。

## 谨慎启动 agent

启动 agent 前，请检查其已安装版本的 `--version` 和 `--help`。在 Herdr 的参数分隔符之后传递原生 agent 参数。

使用用户请求或批准的确切模型。请从实时 agent 屏幕验证模型，而不要相信别名。当 agent 支持时，基线测试应优先采用低推理强度、安全模式和手动权限。仅当所怀疑的行为依赖于钩子、插件或设置时，才使用用户的真实配置重复测试。

使用无害操作测试权限状态。捕获证据后拒绝待处理操作，并确认没有创建任何产物。

## 收集有用的证据

记录足够的信息，以便其他人重复该结果：

- Herdr 二进制文件及版本。
- 命名会话和启动环境。
- 目标应用程序或 agent 的版本和参数。
- 确切的命令或提示。
- 每次状态转换前后的窗格和 agent 状态。
- 相关的 `pane read`、`agent read`、`agent explain`、API 输出和会话日志。
- 全局配置或本地清单覆盖设置是否处于启用状态。

从 `herdr session list` 读取指定会话的目录和套接字，而不是假定其路径。除非用户要求保存在其他位置，否则将大型证据文件保留在 `/var/tmp` 下。

区分观察到的事实与推测的原因。先复现默认行为，然后每次只更改一个变量。

## 清理

清理是复现过程的一部分，失败后也不例外。

1. 在可行的情况下，拒绝待处理的提示，并正常停止测试应用程序。
2. 验证无害的探测文件或其他测试产物不存在；如果存在，仅删除本次复现创建的产物。
3. 使用已安装的会话命令停止临时的指定会话。
4. 删除刚刚停止的同一会话。
5. 确认该会话不再显示为正在运行。
6. 等待外层窗格返回其 shell。
7. 仅关闭此工作流创建的外层窗格。

绝不能因为另一个指定会话看起来已过期就将其删除。绝不能关闭运行当前代理的窗格，也不能关闭任何并非为本次复现创建的窗格。

## 报告结果

说明成功复现了什么、未复现什么，以及失败的确切转换步骤。包括清理状态。提及可能影响结果的共享配置或清单覆盖项。