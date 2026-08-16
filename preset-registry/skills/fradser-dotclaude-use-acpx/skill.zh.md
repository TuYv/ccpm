---
name: acpx
description: Use acpx as a headless ACP CLI for agent-to-agent communication, always inside an isolated SubAgent. Use when running coding agents through acpx, managing persistent ACP sessions, queueing prompts, consuming structured agent output from scripts, comparing the same prompt across multiple agents, or composing multi-agent workflows with defineFlow/decision/decisionEdge. Never invoke the claude adapter (nested-instance blacklist).
---
# acpx

## acpx 是什么

`acpx` 是一个用于智能体客户端协议（ACP）的无头、可脚本化 CLI 客户端。它专为通过命令行进行智能体间通信而构建，并避免使用 PTY 抓取。

核心功能：

- 按仓库/当前工作目录（cwd）维护持久化多轮会话
- 单次执行模式（`exec`）
- 多智能体比较（`compare`）
- 命名并行会话（`-s/--session`）
- 幂等会话创建（`sessions ensure`）
- 会话保留控制（使用带有时间筛选和历史记录清理功能的 `sessions prune`）
- 可移植的会话导出/导入，用于跨机器迁移记录和历史
- 支持队列感知的提示提交，并可选择发送后不等待（`--no-wait`）
- 用于取消正在进行的轮次的协作式取消命令（`cancel`）
- 中断时通过 ACP `session/cancel` 优雅取消
- 会话控制方法（`set-mode`、`set <key> <value>`）
- 检测到子进程失效后重新连接/恢复智能体
- 通过 stdin 或 `--file` 输入提示
- 支持全局与项目配置合并的配置文件，以及 `config show|init`
- 从外部文件加载会话作用域的 MCP 服务器（`--mcp-config`）
- 会话元数据/历史记录检查（`sessions show`、`sessions history`）
- 通过 `status` 检查本地智能体进程
- 用于文件系统和终端请求的稳定 ACP 客户端方法
- 通过环境变量/配置凭据进行稳定的 ACP `authenticate` 握手
- 结构化流式输出（`text`、`json`、`quiet`），并可选择使用 `--suppress-reads`
- 内置智能体注册表，以及用于绕过限制的原始 `--agent` 选项
- 通过 `--system-prompt` / `--append-system-prompt` 覆盖 Claude 系统提示
- 可通过 `--no-terminal` 选择禁用终端功能，用于仅审查流程
- 可通过 `--no-fs` 选择禁用文件系统功能，用于智能体原生文件操作
- 工具白名单（`--allowed-tools`）、轮次上限（`--max-turns`）、瞬时故障重试（`--prompt-retries`）
- 通过 `acpx flow run` 和 `acpx/flows` 编写 API（`defineFlow`、`decision`、`decisionEdge`、`acp`、`action`、`compute`、`checkpoint`）实现多智能体流程

## 安装

```bash
npm i -g acpx
```

为了正常复用会话，建议优先全局安装，而不是使用 `npx`。

## 操作协议（在 Claude Code 内加载时）

关键要求：当此技能在 Claude Code 内加载时，以下协议适用于每次调用。这些规则会覆盖本文档中的任何上游默认设置或示例。

### 1. 在专用、干净的 SubAgent 中运行

每个由 `acpx` 驱动的任务都必须在为该任务启动的隔离 SubAgent 中执行（例如通过 Task/Agent 工具），并拥有各自全新的上下文。不要在主对话线程中以内联方式运行 `acpx` 工作。原因：智能体间调用耗时长、噪声多且消耗大量 token；将其隔离可以保持父上下文干净，并让 SubAgent 仅返回提炼后的结果。

### 2. 永远不要调用 `claude` 适配器

内置的 `claude` 已被列入黑名单（请参阅下方的注册表规则）。调用 `acpx claude ...` 会启动一个嵌套的 Claude 实例——这是被禁止的。请改为路由到非 Claude 智能体。

### 3. 执行顺序

对于每个用户请求，请在子代理内部按以下顺序执行：

1. **首先发现可用的代理。** 在选择代理之前，先探查此计算机上实际安装了哪些 ACP 适配器。运行：

   ```bash
   acpx --help                                  # lists built-in agent names
   command -v codex gemini cursor copilot 2>/dev/null   # which CLIs are on PATH
   ```

   选择第一个已安装且适合该任务的非 Claude 代理（默认使用 `codex`；依次回退到 `gemini`、`qwen`、`cursor`、`copilot`、`droid`、`opencode` 等）。不要假定某个代理已经安装——先验证，再使用。

2. **将用户的实际请求分派**给所选代理（多轮任务使用 `prompt`，一次性任务使用 `exec`，跨代理比较使用 `compare`）。

3. **不要重复上游技能内容。** 在为某项任务调用代理之前，检查上游 `acpx` 技能/参考资料是否已记录所需能力（例如会话生命周期、流程编写、输出格式、`references/` 中的权限策略）。如果已有记录，请遵循该知识并运行文档中说明的命令——不要重新推导或解释。只有当上游尚未涵盖该请求时，才综合制定新步骤。

子代理返回一份简短摘要，说明执行了什么、使用了哪个代理以及提炼后的结果——而不是原始 ACP 流。

### 4. 在采取行动前，使用一个全新的空白子代理反思每个结果

关键要求：绝不能将 `acpx` 子代理的结果直接视为最终结论。无论 acpx 子代理返回什么——审查、评估、差异、建议或“已完成”——都只是外部代理提出的*方案*，而不是定论。在采取行动之前，启动第二个独立的空白子代理，让它反思该结果；只有在反思结果返回后，才能决定下一步。

- 反思子代理必须是一个全新的代理（一次全新的 Task/Agent 调用），它不了解 acpx 运行过程、原始提示词或实现。它不能是运行 acpx 的子代理，也不能是主线程。复用 acpx 子代理或直接在当前上下文中进行判断，会破坏使反思具有价值的独立性——结果的生产者和评判者必须是不同的代理。
- 只向反思子代理提供待审查的产物（acpx 输出以及相关文件/差异），不要提供产生该产物的推理过程。它必须独立得出结论。
- 反思结果决定后续分支：**接受**、**返工**（带着修正意见重新分派给 acpx）或**上报**给用户。例如：在执行 `acpx ... review` 后，由空白子代理对审查本身进行批判——哪些发现确实存在、哪些只是噪声、遗漏了什么——然后依据这份批判而不是原始审查结果来决定下一步。

这与本项目其他部分使用的 GAN 评估器/独立审计模式相同：产生结果的代理绝不能成为评判该结果的代理。

## 命令模型

`prompt` 是默认动词。

```bash
acpx [global_options] [prompt_text...]
acpx [global_options] prompt [prompt_options] [prompt_text...]
acpx [global_options] exec [prompt_options] [prompt_text...]
acpx [global_options] compare <agent>... '<prompt_text>'
acpx [global_options] compare <agent>... --file <path>
acpx [global_options] cancel [-s <name>]
acpx [global_options] set-mode <mode> [-s <name>]
acpx [global_options] set <key> <value> [-s <name>]
acpx [global_options] status [-s <name>]
acpx [global_options] sessions [list | new [--name <name>] | ensure [--name <name>] | close [name] | show [name] | history [name] [--limit <count>] | export [name] --output <path> | import <archive> [--name <name>] [--cwd <dir>] | prune [--dry-run] [--before <date> | --older-than <days>] [--include-history]]
acpx [global_options] config [show | init]
acpx [global_options] flow run <file> [--input-json '<json>' | --input-file <path>] [--default-agent <name>]
```

如果省略提示文本且通过管道传入 stdin，`acpx` 会从 stdin 读取提示文本。

## 内置智能体注册表

易记的智能体名称会解析为以下命令：

- `pi` -> `npx pi-acp@^0.0.31`
- `openclaw` -> `openclaw acp`
- `codex` -> `npx -y @agentclientprotocol/codex-acp@^1.1.5`
- `claude` -> `npx -y @agentclientprotocol/claude-agent-acp@^0.60.0`
- `gemini` -> `gemini --acp`
- `cursor` -> `cursor-agent acp`
- `copilot` -> `copilot --acp --stdio`
- `droid` -> `droid exec --output-format acp`
- `fast-agent` -> `uvx fast-agent-mcp acp`
- `grok-build` -> `grok agent stdio`
- `iflow` -> `iflow --experimental-acp`
- `kilocode` -> `npx -y @kilocode/cli acp`
- `kimi` -> `kimi acp`
- `kiro` -> `kiro-cli-chat acp`
- `mux` -> `npx -y mux@^0.28.0 acp`
- `opencode` -> `npx -y opencode-ai acp`
- `pool` -> `pool acp`
- `qoder` -> `qodercli --acp`
- `qwen` -> `qwen --acp`
- `trae` -> `traecli acp serve`
- `zeroclaw` -> `zeroclaw acp`

规则：

- 对于顶层的 `prompt`、`exec`、`compare` 和 `sessions`，默认智能体为 `codex`。
- `factory-droid` 和 `factorydroid` 也会解析为内置的 `droid` 适配器。
- `grok-build` 通过已安装的 `grok` CLI 进行身份验证：当服务器通告 `cached_token` 时，使用其由智能体管理的缓存登录；当服务器通告 `xai.api_key` 时，则使用 `XAI_API_KEY`。
- 未知的位置智能体标记会被视为原始智能体命令。
- `--agent <command>` 显式设置原始 ACP 适配器命令。
- 不要在同一条命令中同时使用位置智能体和 `--agent`。
- 关键要求：绝不要调用 `claude` 适配器。此 Skill 在 Claude Code 内运行，因此 `acpx claude` 会生成一个嵌套的 Claude 实例——这既多余、速度更慢，也无法增加模型多样性。优先使用 `codex`（默认）、`gemini`、`qwen` 或其他非 Claude 智能体。仅当用户明确点名要求第二个 Claude 实例时，才调用 `claude`。

## 关键命令

### Prompt（默认，持久会话）

```bash
acpx codex 'fix flaky tests'
acpx codex prompt 'fix flaky tests'
acpx prompt 'fix flaky tests'   # defaults to codex
```

- 对会话作用域键使用已保存的会话，并自动恢复先前的会话
- 如果该作用域不存在会话，则以 `NO_SESSION` 退出，并提示使用 `sessions new`
- 当同一会话已有另一个提示正在运行时，支持队列感知
- 在活动轮次期间中断时，会先发送 ACP `session/cancel`，然后才使用强制终止作为后备方案

Prompt 选项：`-s, --session <name>`、`--no-wait`、`-f, --file <path>`

### Exec（单次执行）

```bash
acpx exec 'summarize this repo'
acpx codex exec 'summarize this repo'
```

在临时 ACP 会话中运行单个提示。不会复用或保存持久会话状态。

### Compare（多智能体，单次执行）

```bash
acpx compare codex gemini qwen 'summarize this repo in 3 lines'
acpx compare codex gemini --file ./prompt.md
acpx compare codex gemini -- '--looks-like-a-flag'
```

在多个智能体上运行相同的提示，每个智能体都使用临时的 `exec` 风格会话。遵循与 `exec` 相同的全局执行控制项（`--cwd`、`--timeout`、权限标志、`--policy`、身份验证、终端通告、重试、模型/系统选项、`--format`）。

- 当提示词可能被解析为标志时，请在代理列表后使用 `--`（参见第三个示例）。

- `--format text` 为每个代理输出一行汇总表信息（耗时、令牌用量、停止原因、权限、最终输出）
- `--format json` 或命令局部的 `--json` 输出 `CompareRow[]` 汇总载荷
- `--format quiet` 每行输出 `<agent>\t<status>`
- `CompareRow.status` 的值为 `ok`、`cancelled`、`permission_denied` 或 `error`
- 代理会在请求的工作区中串行运行；不会创建已保存的会话或单独的转录目录

### 取消 / 模式 / 配置 / 模型

```bash
acpx codex cancel
acpx codex set-mode auto
acpx codex set model gpt-5.2[high]
acpx codex set model gpt-5.4
```

- `cancel`：通过队列所有者 IPC 发送协作式 `session/cancel`
- `set-mode`：调用 ACP `session/set_mode`
- `set`：调用 ACP `session/set_config_option`
- `set model <id>`：调用 `session/set_model` 以在会话中途切换模型

### 会话

```bash
acpx sessions list                          # list all sessions
acpx sessions new --name backend            # create fresh session
acpx sessions ensure --name backend         # idempotent: get or create
acpx sessions close backend                 # close a session
acpx sessions show backend                  # show metadata
acpx sessions history backend --limit 20    # show turn history
acpx sessions export backend --output backend-session.json
acpx sessions import backend-session.json --name backend-restored
acpx sessions prune --dry-run --older-than 7
acpx sessions prune --older-than 30 --include-history
acpx status                                 # check local agent process
```

在任意命令前加上代理名称：`acpx codex sessions ensure --name backend`

## 全局选项

- `--agent <command>`：原始 ACP 代理命令（逃生通道）
- `--cwd <dir>`：会话作用域的工作目录（默认：当前目录）
- `--mcp-config <path>`：为本次调用从外部 JSON 文件加载 `mcpServers`，替换项目/全局 MCP 配置。相对路径基于 `--cwd` 解析。活动中的持久会话会拒绝 MCP 配置变更，直至会话关闭。
- `--approve-all`：自动批准所有权限请求
- `--approve-reads`：自动批准读取/搜索操作，写入操作则提示确认（默认模式）
- `--deny-all`：拒绝所有权限请求
- `--non-interactive-permissions <policy>`：当无法进行提示确认时，选择 `deny` 或 `fail`
- `--permission-policy <json-or-file>` / `--policy`：按工具设置的 ACP 权限规则
- `--format <fmt>`：输出格式（`text`、`json`、`quiet`）
- `--json-strict`：严格 JSON 模式；要求使用 `--format json`，并抑制 stderr 中的非 JSON 输出
- `--suppress-reads`：抑制原始文件读取内容，同时保留所选格式
- `--timeout <seconds>`：最长等待时间（正数）
- `--ttl <seconds>`：队列所有者关闭前的空闲 TTL（默认值为 `300`，`0` 表示禁用 TTL）
- `--model <id>`：在创建会话期间请求代理模型
- `--system-prompt <text>`：替换代理的系统提示词（持久化到会话中）
- `--append-system-prompt <text>`：将文本附加到代理的系统提示词
- `--allowed-tools <list>`：以逗号分隔的工具白名单（使用 `""` 表示不允许任何工具）
- `--max-turns <count>`：限制会话轮次
- `--prompt-retries <count>`：提示轮次因瞬时错误失败时进行重试（默认值为 `0`）
- `--no-fs`：将 ACP 文件系统读写能力声明为禁用，使兼容的代理使用其原生文件系统实现
- `--no-terminal`：不声明 ACP 终端能力
- `--verbose`：将详细的 ACP/调试日志输出到 stderr

权限标志互斥。

## 系统提示词覆盖（Claude 专用机制）

注意：根据上面的代理注册表规则，`claude` 适配器被禁止用于常规用途。覆盖机制本身仅受 Claude 适配器支持，因此下面的示例展示 Claude 形式以供参考。仅当用户明确要求使用嵌套的 Claude 实例时才使用它们。

```bash
# Replace the system prompt for a named session, persisted across reuse
acpx --system-prompt "You are a code reviewer who challenges every implicit assumption." claude -s review

# Append a guideline on top of the default system prompt
acpx --append-system-prompt "Always explain trade-offs before recommending a fix." claude -s impl
```

覆盖内容通过 `session/new` 上的 ACP `_meta.systemPrompt` 转发，并存储在 `session_options.system_prompt` 中。同一作用域内后续的 `prompt`/`ensure` 调用会保留该覆盖，除非你显式创建新会话。非 Claude 适配器会忽略该字段。

## 配置文件

配置文件按以下顺序合并（后者优先）：

- 全局：`~/.acpx/config.json`
- 项目：`<cwd>/.acpxrc.json`

支持的键：`defaultAgent`、`defaultPermissions`、`nonInteractivePermissions`、`authPolicy`、`ttl`、`timeout`、`format`、`agents` 映射、`auth` 映射。

使用 `acpx config show` 检查解析后的配置，使用 `acpx config init` 创建全局模板。

Windows 上的自定义代理：定义结构化的 `agents.<name>.argv`（命令加参数数组）。无歧义的旧版 `command` + `args` 条目会自动迁移；原始或有歧义的命令以及 `.sh` 包装脚本必须迁移到 `argv`（并提供明确的迁移指导），且没有 `argv` 的已保存自定义代理会话必须重新创建。

对于 ACP `authenticate` 握手，请使用配置中的 `auth` 条目，或使用显式的 `ACPX_AUTH_<METHOD_ID>` 环境变量，例如 `ACPX_AUTH_OPENAI_API_KEY`。诸如 `OPENAI_API_KEY` 之类的环境中已有的提供商环境变量会传递给子代理，但它们本身不会触发 ACP 身份验证方法的选择。

## 环境变量

- `ACPX_CLAUDE_INCLUDE_USER_SETTINGS=1`：选择为内置 `claude` 会话加载 Claude Code 用户设置。默认情况下仅加载项目/本地设置，因此全局启用的通道或守护进程插件不会干扰派生的 ACP 会话。
- `ACPX_AUTH_<METHOD_ID>`：ACP `authenticate` 方法的显式凭据。
- 会话存储路径从操作系统主目录派生（`~/.acpx/sessions`）；默认情况下，子进程继承当前环境。

## 会话行为

持久化提示会话的作用域由以下内容确定：`agentCommand`、绝对路径 `cwd`、可选的会话 `name`。

- 会话记录存储在 `~/.acpx/sessions/*.json` 中
- `-s/--session` 会在同一代码仓库中创建并行的命名对话
- 更改 `--cwd` 会改变作用域，从而改变会话查找结果
- 已关闭的会话会保留在磁盘上，并带有 `closed: true` 和 `closedAt`，直至被清理
- 按作用域自动恢复时会跳过已关闭的会话
- 提示模式会尝试重新连接到已保存的会话；如果适配器端的会话无效或未找到，`acpx` 会创建新会话并更新已保存的记录

## 提示词排队与 `--no-wait`

队列按持久会话划分。正在运行的提示词所对应的活动 `acpx` 进程会成为队列所有者。其他调用通过本地 IPC 提交提示词。

- 默认：入队并等待队列中的提示词执行完成，同时流式返回更新
- `--no-wait`：入队，并在收到队列确认后返回
- 在活动轮次期间按下 `Ctrl+C` 会发送 ACP `session/cancel`，短暂等待后，仅当取消操作未能及时完成时才强制终止进程
- `cancel` 会发送相同的协作式取消请求，无需借助终端信号
- 队列清空后，所有者进程的关闭由 TTL 控制（默认 300 秒，可通过 `--ttl` 配置）

## 输出格式

使用 `--format <fmt>`：

- `text`（默认）：便于阅读的流式输出，包含更新、工具状态和完成行
- `json`：NDJSON 事件流（适合自动化）
- `quiet`：仅输出助手的最终文本
- `--suppress-reads`：将原始的文件读取内容替换为 `[read output suppressed]`
- `--json-strict`：与 `--format json` 配合使用，以抑制 stderr 中的非 JSON 噪声

自动化示例：

```bash
acpx --format json codex exec 'review changed files' \
  | jq -r 'select(.type=="tool_call") | [.status, .title] | @tsv'
```

## 流程（多智能体工作流）

流程允许你将多智能体工作流声明为一个由边连接的类型化节点图，并由 `acpx` 运行时执行。运行时负责持久化、重试、超时和路由——流程文件声明的是结构，而不是引擎。

```bash
acpx flow run ./my-flow.flow.ts --input-file ./flow-input.json
acpx flow run ./my-flow.flow.ts --input-json '{"task":"FIX: add a regression test"}'
acpx --approve-all flow run examples/flows/pr-triage/pr-triage.flow.ts \
  --input-json '{"repo":"openclaw/acpx","prNumber":150}'
acpx flow run ./my-flow.flow.ts --default-agent codex
```

运行产物持久保存在 `~/.acpx/flows/runs/<runId>/` 下。未设置 `--timeout` 时，默认的单步骤超时时间为 15 分钟。

编写接口位于 `acpx/flows` 中。节点类型：`acp`（模型驱动的步骤）、`decision`（受限选项的 LLM 步骤）、`action`（由运行时监管的确定性操作）、`compute`（纯本地数据转换）、`checkpoint`（供人工或外部触发器使用的暂停点）。

有关完整的编写示例、边的结构和详细的节点类型参考，以及完整的**实用工作流**示例集（持久化助手、命名流、专用审查器、幂等引导、`--no-wait` 后续操作、一次性 `exec`、跨智能体 `compare`、`--mcp-config`、JSON 编排、原始适配器、定期清理、分类流程、仓库范围的审查），请参阅 `references/advanced.md`。