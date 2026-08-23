---
name: omnigent-knowledge
description: Deep reference on Omnigent config format, executor types, skill/tool structure, and conventions. Load when you need to look up how the platform works.
---
# Omnigent 知识库

## 什么是 Omnigent？

智能体平面是一个服务器，通过兼容 OpenResponses 的 API 托管、管理和执行智能体。用户创建包含配置、指令、技能和工具的**智能体目录**（也称为智能体镜像）。服务器加载这些目录，并通过 HTTP 提供服务。

## 智能体目录布局

```
my-agent/
├── config.yaml          # REQUIRED — agent spec
├── AGENTS.md            # Recommended — instructions/personality
├── skills/              # Optional — load-on-demand skills
│   └── <dir>/           # Free-form; skill name comes from SKILL.md
│       └── SKILL.md
├── tools/               # Optional — packaged tools
│   ├── python/          # Local Python tools (auto-discovered *.py)
│   ├── typescript/      # Local TypeScript tools (auto-discovered *.ts)
│   └── mcp/             # MCP server declarations (*.yaml)
└── agents/              # Optional — sub-agent directories (recursive)
    └── <dir>/           # Free-form; sub-agent name comes from config.yaml
        ├── config.yaml
        └── ...
```

## config.yaml 参考

这是唯一必需的文件。除 `spec_version` 外，所有字段均为可选字段。

```yaml
spec_version: 1               # REQUIRED, must be 1

name: my-agent                # Display name
description: Does X and Y.    # One-line summary

# Instructions — path to a file or inline text.
# Default: looks for AGENTS.md in the agent directory.
instructions: AGENTS.md

executor:
  # REQUIRED area. type must be one of: claude_sdk | agents_sdk | omnigent.
  # There is NO `llm` executor type.
  type: claude_sdk     # Anthropic Claude SDK, in-process (simplest)
  # type: agents_sdk   — OpenAI Agents SDK, in-process
  # type: omnigent     — subprocess harness; requires config.harness below

  # Only for type: omnigent — pick the harness that runs the loop.
  # One of: claude-native | claude-sdk | codex-native | codex |
  #         openai-agents | open-responses | pi
  # config:
  #   harness: claude-native
  #   permission_mode: bypassPermissions   # claude-native headless
  #   yolo: true                           # codex-native headless

  # Model is OPTIONAL — omit to use the configured provider's default.
  # Pin one directly on the executor when needed:
  # model: anthropic/claude-sonnet-4-20250514   # LiteLLM provider/model
  # model: databricks-claude-opus-4-7           # or a serving-endpoint name
  # connection:                                 # provider credentials
  #   api_key: ${ANTHROPIC_API_KEY}
  # auth:                                        # or Databricks profile auth
  #   type: databricks
  #   profile: oss

  timeout: 3600        # Task deadline in seconds (default: 3600)
  max_iterations: 1000 # Max LLM calls per task (default: 1000)

# os_env — grant filesystem/shell access (harness agents). Exposes
# sys_os_read / sys_os_write / sys_os_edit / sys_os_shell.
os_env:
  type: caller_process
  cwd: .
  sandbox:
    type: none         # or linux_bwrap / darwin_seatbelt to sandbox

# guardrails — runtime policy gates (optional).
guardrails:
  ask_timeout: 86400   # seconds to wait on an approval prompt
  policies:
    blast_radius:
      type: function
      function:
        path: omnigent.inner.nessie.policies.blast_radius

interaction:
  conversational: true   # Maintain turn history (default: true)
  modalities:
    input: [text, image, file]   # default: [text]
    output: [text]               # default: [text]

tools:
  # Sub-agents this agent can spawn (declared names of agents/ sub-agents)
  agents:
    - researcher
    - summarizer

  # Built-in tools — string name or dict with config
  builtins:
    - web_search                 # auto-detects backend based on model provider
    - terminal_run               # persistent bash shell scoped to the conversation
    - upload_file
    - search_conversations

  timeout: 60          # Default tool timeout in seconds

params:                # Arbitrary key-value (readable by skills/tools)
  max_results: 10
```

## 执行器类型

| 类型 | 何时使用 | 工作方式 |
|------|------------|--------------|
| `claude_sdk` | 新建简单智能体；已有 Claude SDK 代码 | 进程内 Anthropic Claude SDK；自行管理循环 |
| `agents_sdk` | 新建简单智能体；已有 OpenAI Agents SDK 代码 | 进程内 OpenAI Agents SDK 运行器 |
| `omnigent` | 编码/CLI 工具框架、Shell 与文件工具、子智能体 | 启动由 `config.harness` 选择的子进程工具框架 |

**不存在 `llm` 执行器类型**——唯一有效的值是
`claude_sdk`、`agents_sdk` 和 `omnigent`。对于**大多数新建的简单智能体**，
请使用 `claude_sdk`（或 `agents_sdk`）——在进程内运行，无需额外配置。当智能体需要特定工具框架、Shell/文件访问权限或
子智能体时，请使用 `omnigent`；它**必须**提供 `config.harness`：

| `config.harness` | 说明 |
|------------------|------------|
| `claude-native`（别名 `claude`） | Claude Code——完整的编码工具和原生权限 |
| `claude-sdk` | Claude Agent SDK 循环 |
| `codex-native` / `codex` | Codex CLI / 工具框架 |
| `openai-agents` | OpenAI Agents 工具框架（支持任意网关模型） |
| `open-responses` | 与 OpenResponses 兼容的工具框架 |
| `pi` | 无头多模型工作进程（桥接 `sys_os_*` 工具） |

## AGENTS.md 格式

自由格式的 Markdown。它会成为系统提示词中由智能体编写的部分；Omnigent 可能会在运行时附加由框架管理的生命周期或元数据指令。最佳实践：

- 以清晰的身份声明开头（“你是一个……”）
- 列出能力和约束
- 按名称引用技能（“你有一个名为 deep-research 的技能”）
- 如有子智能体，请引用它们（“你可以启动 fact_checker 智能体”）
- 保持内容聚焦——模型会在每一轮读取这些内容

## 技能格式

每个技能都位于 `skills/<dir>/SKILL.md` 中（目录名称可自由指定，
无需与技能的 `name` 匹配）：

```markdown
---
name: deep-research
description: Investigate a topic in depth using web search and source synthesis.
---

When researching a topic:

1. Search broadly first using web search...
2. Cross-reference multiple sources...
```

规则：
- YAML 前置元数据必须包含 `name` 和 `description`（两者均为必填项）
- `name` 必须为小写，并使用 `[a-z0-9-]+`；它无需与
  目录名称匹配（目录决定从何处加载技能文件）
- 正文是智能体按需加载的 Markdown 指令
- 在 AGENTS.md 或 config.yaml 中引用

## 工具

### 内置工具

调用 `list_builtin_tools` 获取当前可用的
内置工具及其说明。不要依赖硬编码的
列表——随时可能添加新工具。

**工具推荐指南：**

- “我想要一个研究智能体” → `web_search` + `web_fetch`
- “我想要一个编码智能体” → `terminal_run` + `upload_file`
- “我想要一个数据分析智能体” → `terminal_run` + `upload_file` + `download_file`
- “我想要一个对话助手” → 无需工具（当前信息可使用 `web_search`）
- “我想要一个能够访问外部 API 的智能体” → 考虑使用 MCP 服务器（见下文）

### MCP 服务器（外部工具集成）

MCP（模型上下文协议，Model Context Protocol）允许智能体连接到外部服务——
数据库、API、Slack、GitHub 等。每个 MCP 服务器都通过
`tools/mcp/` 中的一个 YAML 文件声明：

```
my-agent/
  tools/
    mcp/
      github.yaml
      slack.yaml
```

**MCP 服务器配置格式**（`tools/mcp/github.yaml`）：

```yaml
transport: http
url: https://mcp-server.example.com/sse
headers:
  Authorization: Bearer ${GITHUB_TOKEN}
```

- `transport`：必须为 `http`
- `url`：MCP 服务器的 SSE 端点 URL
- `headers`：可选的身份验证标头（使用 `${ENV_VAR}` 表示密钥）

**何时推荐 MCP：**

- 用户希望连接到外部服务（数据库、API、SaaS 工具）
- 用户提到了 Slack、GitHub、Jira、Postgres 等
- 内置工具未涵盖该集成

**查找 MCP 服务器：** 使用 `web_search`（如果可用）或 `web_fetch`
搜索可用的 MCP 服务器。以下是一些不错的起点：
- https://modelcontextprotocol.io — 官方 MCP 目录
- https://github.com/modelcontextprotocol — 官方 GitHub 组织
- 搜索“<service-name> MCP server”（例如“Slack MCP server”、
  “Postgres MCP server”）

如果用户提到了他们想要连接的特定服务，
请使用 `web_search` 或 `web_fetch` 查找是否存在适用于该服务的 MCP 服务器，
以及如何配置该服务器。

**需要告知用户的内容：** MCP 服务器是通过 HTTP
公开工具的外部进程。用户需要单独运行 MCP 服务器
（或使用托管的服务器），并在配置中提供 URL。

### 本地工具（自定义 Python/TypeScript）

`tools/python/` 中的 Python 文件会被自动发现。这些文件中每个
使用 `@tool` 装饰的模块级函数都会成为一个独立工具——一个文件可以导出多个工具。该装饰器
根据函数的类型提示和 Google 风格的文档字符串派生 JSON schema。

```python
# tools/python/my_tools.py
from omnigent.tools import tool


@tool
def my_tool(text: str, count: int = 1) -> str:
    """
    Repeat the text count times.

    Args:
        text: The text to repeat.
        count: Number of repetitions (default 1).
    """
    return text * count
```

编写规则：

- 装饰**模块级**函数，而不是类方法、
  lambda 或嵌套函数（装饰器会在装饰时拒绝这些函数，并给出清晰的错误）。
- 参数的类型提示决定了面向 LLM 的 JSON schema。请使用
  具体类型——`Any` 和 `object` 会生成不进行验证的宽松 schema。
- 函数名称会成为面向 LLM 的工具名称。名称不得
  与内置工具或同一智能体中的其他自定义工具冲突
  （发生冲突时，智能体加载会明确失败）。
- 同时支持 `def` 和 `async def`。同步 `def` 函数体会
  自动包装在 `asyncio.to_thread` 中，因此不会
  阻塞事件循环。
- Pydantic `BaseModel` 参数是一等公民——它们会
  正确展开到 schema 中，并接受完整验证。

**何时推荐本地工具：** 当用户需要内置工具或 MCP 服务器
未涵盖的自定义逻辑时。

## 示例：最小化 Agent

```yaml
spec_version: 1
name: my-assistant
description: A helpful assistant.
executor:
  type: claude_sdk
instructions: |
  You are a helpful assistant. Answer questions clearly and concisely.
```

这是最简单的有效 Agent——包含名称、执行器和指令。
由于未固定模型，因此它会使用已配置提供商的默认模型。没有
技能、工具或子 Agent。

## 示例：使用工具和技能的研究型 Agent

```yaml
spec_version: 1
name: researcher
description: A research agent that searches the web and synthesizes findings.
executor:
  type: agents_sdk
tools:
  builtins:
    - web_search
    - upload_file
interaction:
  modalities:
    input: [text, file]
    output: [text]
instructions: AGENTS.md
```

## 子 Agent（多 Agent 系统）

Agent 可以生成子 Agent 来委派任务。子 Agent 是
拥有各自 config.yaml 的完整 Agent，位于 `agents/`
目录中：

```
my-agent/
  config.yaml
  AGENTS.md
  agents/
    researcher/
      config.yaml        # sub-agent spec — declares name: researcher
    fact-check-worker/
      config.yaml        # declares name: fact-checker (dir may differ)
```

### 声明子 Agent

父 Agent 的 config.yaml 在 `tools.agents` 下列出子 Agent 名称：

```yaml
tools:
  agents:
    - researcher
    - fact-checker
  builtins:
    - web_search
```

每个名称都必须是 `agents/` 下某个子 Agent 声明的 `name`；
其所在目录的名称可以不同。**父 Agent** 必须使用
`executor.type: omnigent`——它会提供生成工具。每个
子 Agent 都是完整的 Agent，并且可以使用任意执行器（`claude_sdk`、
`agents_sdk` 或 `omnigent`）。

### 子 Agent 配置

每个子 Agent 都有自己完整的 config.yaml：

```yaml
# agents/researcher/config.yaml
spec_version: 1
name: researcher
description: Sub-agent that searches the web for information.
executor:
  type: claude_sdk
tools:
  builtins:
    - web_search
    - web_fetch
instructions: |
  You are a researcher. When given a topic, search the web
  and return a summary with sources.
```

### 生成机制

声明子 Agent 后，父 Agent 会自动获得 `sys_session_send`（单数形式）、`check_task`
和 `sys_cancel_task` 工具。父 Agent 的 AGENTS.md 应引用这些工具：

```markdown
You have two sub-agents you can delegate to:
- **researcher** — searches the web for information
- **fact-checker** — verifies claims with evidence

Call `sys_session_send(type="<name>", input="<task>")` to
dispatch one. Emit multiple `sys_session_send` tool calls in the
same response to run sub-agents in parallel. Each result auto-
delivers as a system message when ready — `check_task` polls,
`sys_cancel_task` aborts.
```

### 何时推荐使用子 Agent

- 用户需要专门化角色（研究员 + 总结员 + 审核员）
- 用户需要并行执行（同时搜索多个来源）
- 用户需要关注点分离（每个子 Agent 都有聚焦的指令）

**对于简单的 Agent，使用子 Agent 属于过度设计。** 仅当
用户描述的工作流包含不同步骤或角色时，才建议使用子 Agent。

## 运行智能体

创建智能体目录后：

```bash
# Start the server with the agent pre-registered
ap server --agent ./my-agent/

# Or deploy to a running server
ap deploy ./my-agent/ --server http://localhost:6767
```