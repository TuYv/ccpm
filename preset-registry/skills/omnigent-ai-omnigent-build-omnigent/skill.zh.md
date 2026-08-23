---
name: build-omnigent
description: Patterns and templates for generating valid Omnigent agent directories. Load when ready to create files.
---
# Agent 生成

使用这些模式生成有效的 Agent 目录。始终只生成所需的最少文件集——不要过度设计。

以下每个模板都已经过与 `omnigent server` 所用解析器/验证器相同的验证。如果你的环境提供了 `validate_agent` 工具（专用的 Agent 编写环境会提供），请在生成文件后运行该工具，以确认规范能够加载。如果需要更深入的字段参考（执行器类型、os_env、护栏、沙箱机制），请加载 **`omnigent-knowledge`** Skill。

## 第 1 步：选择目录名称

使用 kebab-case 格式的 Agent 名称：`my-research-agent/`

## 第 2 步：生成 config.yaml

始终包含：
- `spec_version: 1`
- `name`（小写，可以使用连字符）
- `description`（一句话）
- `instructions`——文件路径（默认为 `AGENTS.md`）或内联文本。
  （`prompt:` 是可接受的别名；如果两者均已设置，则以 `instructions:` 为准。）
- `executor`——Agent 的运行方式。参见第 2a 步。

按需包含：
- `tools.builtins`——内置工具。当前集合为 `download_file`、
  `export_agent`、`list_files`、`search_conversations`、`upload_file`、
  `web_fetch`、`web_search`。如果 `list_builtin_tools` 工具可用，
  请调用它来获取权威的实时集合，而不要依赖此列表。
- `tools.agents`——子 Agent，使用每个子 Agent 在 `agents/` 下声明的 `name`
  （子 Agent 的目录名称可以与其名称不同）。
- `os_env`——供编排 Agent 使用的文件系统/shell 访问权限（参见
  支持 shell 的模板）。
- `interaction.modalities`——如果 Agent 需要处理图像或文件。
- `guardrails`——运行时策略门控（参见 `omnigent-knowledge`）。

## 第 2a 步：选择执行器

`executor.type` 必须是 **`claude_sdk`**、**`agents_sdk`** 或
**`omnigent`** 之一。**不存在 `llm` 执行器**——请勿使用。

| 需求 | executor |
|------|----------|
| 全新、简单的 LLM Agent（默认） | `claude_sdk`（Anthropic）或 `agents_sdk`（OpenAI），进程内运行 |
| 现有的 Claude SDK / OpenAI Agents SDK 代码 | `claude_sdk` / `agents_sdk` |
| CLI/编码编排工具、shell + 文件工具、子 Agent | `omnigent` + 一个 `config.harness` |

当 `executor.type: omnigent` 时，**必须提供 `config.harness`**，且其值必须是以下之一：`claude-native`（Claude Code，完整编码工具）、`claude-sdk`、
`codex-native`、`codex`、`openai-agents`、`open-responses`、`pi`。
（`claude` 是 `claude-native` 的别名。）

模型选择是可选的——如果省略，执行器将根据已配置的凭据解析提供商的默认模型（例如 Anthropic 密钥、Claude 订阅或 Databricks 配置文件）。仅在用户要求时固定模型；有关 `executor.model` / `auth`，请参见 `omnigent-knowledge`。

## 第 3 步：生成 AGENTS.md

编写重点明确的系统提示词：
- 身份：“你是一名[角色]，负责[工作内容]。”
- 能力：可使用哪些工具/Skill
- 约束：不得执行哪些操作
- 风格：如何沟通

对于入门级 Agent，将其控制在 500 词以内。用户之后可以进行扩展。

## 第 4 步：生成 Skill（可选）

仅当 Agent 具有不同的运行模式时才生成 Skill。
每个 Skill 需要：

```
skills/<dir>/SKILL.md
```

目录名称可自由指定，无需与技能的 `name` 匹配——
运行时通过技能 frontmatter 中的 `name` 识别该技能，并从其所在的任意目录加载文件。

使用 YAML frontmatter：
```markdown
---
name: skill-name
description: One-line description of what this skill does.
---

Detailed instructions for when this skill is loaded...
```

## 模板

### 最小化智能体（最简单——进程内 SDK）

**config.yaml：**
```yaml
spec_version: 1
name: {agent_name}
description: {description}
executor:
  type: claude_sdk      # or agents_sdk for OpenAI
instructions: AGENTS.md
```

**AGENTS.md：**
```markdown
You are {agent_name}, {description}.

Answer questions clearly and concisely. If you don't know something,
say so rather than guessing.
```

### 带网页搜索的智能体

**config.yaml：**
```yaml
spec_version: 1
name: {agent_name}
description: {description}
executor:
  type: claude_sdk
tools:
  builtins:
    - web_search        # one of the builtins listed in Step 2
interaction:
  modalities:
    input: [text]
    output: [text]
instructions: AGENTS.md
```

### 具有 shell 和文件系统访问权限的 Harness 智能体

当智能体需要运行命令以及读写文件时，请使用带有编码 Harness 的 `omnigent` 执行器。`os_env` 授予操作系统访问权限；该 Harness 会公开 `sys_os_read` / `sys_os_write` / `sys_os_edit` / `sys_os_shell`。

**config.yaml：**
```yaml
spec_version: 1
name: {agent_name}
description: {description}
executor:
  type: omnigent
  config:
    harness: claude-native
    # Headless runs can't answer approval prompts — bypass them. Pair
    # with a read-only prompt and/or a blast_radius guardrail for safety.
    permission_mode: bypassPermissions   # codex-native uses `yolo: true`
os_env:
  type: caller_process
  cwd: .
  sandbox:
    type: none          # or linux_bwrap / darwin_seatbelt to sandbox
instructions: AGENTS.md
```

### 集成 MCP 服务器的智能体

**目录结构：**
```
{agent_name}/
  config.yaml
  AGENTS.md
  tools/
    mcp/
      github.yaml
```

**config.yaml：**
```yaml
spec_version: 1
name: {agent_name}
description: {description}
executor:
  type: claude_sdk
instructions: AGENTS.md
```

**tools/mcp/github.yaml：**
```yaml
transport: http
url: https://your-mcp-server.example.com/sse
headers:
  Authorization: Bearer ${{{mcp_token_var}}}
```

### 带子智能体的多智能体系统

**父智能体**需要使用 `omnigent` 执行器——它负责提供生成工具。每个子智能体都是一个完整的智能体，可以使用任意执行器。

**目录结构：**
```
{agent_name}/
  config.yaml
  AGENTS.md
  agents/
    {sub_agent_1_dir}/
      config.yaml
    {sub_agent_2_dir}/
      config.yaml
```

目录名称可自由指定。子智能体的身份由其自身 `config.yaml` 中的 `name` 确定，父智能体也会在 `tools.agents` 中列出该名称——`{sub_agent_1_dir}` 和 `{sub_agent_1}` 可以不同。

**父智能体的 config.yaml：**
```yaml
spec_version: 1
name: {agent_name}
description: {description}
executor:
  type: omnigent
  config:
    harness: claude-sdk
tools:
  agents:
    - {sub_agent_1}
    - {sub_agent_2}
instructions: AGENTS.md
```

**子代理配置（agents/{sub_agent_1_dir}/config.yaml）：**
```yaml
spec_version: 1
name: {sub_agent_1}
description: {sub_agent_1_description}
executor:            # any executor works here — only the parent needs omnigent
  type: omnigent
  config:
    harness: claude-sdk
instructions: |
  You are {sub_agent_1}. {sub_agent_1_instructions}
```

**父代理的 AGENTS.md 应引用子代理：**
```markdown
You have sub-agents you can delegate to:
- **{sub_agent_1}** — {sub_agent_1_description}
- **{sub_agent_2}** — {sub_agent_2_description}

Call `sys_session_send(type="<name>", input="<task>")` to dispatch a
declared sub-agent. Emit multiple `sys_session_send` tool calls in the
same response to run them in parallel; results arrive via the inbox.
```

## 环境变量命名约定

使用 `${ENV_VAR}` 固定凭据时，请将提供商映射到其
标准环境变量名称：
- `openai` → `OPENAI_API_KEY`
- `anthropic` → `ANTHROPIC_API_KEY`
- `gemini` → `GEMINI_API_KEY` 或 `GOOGLE_API_KEY`
- `groq` → `GROQ_API_KEY`
- `deepseek` → `DEEPSEEK_API_KEY`
- `xai` → `XAI_API_KEY`
- `mistral` → `MISTRAL_API_KEY`
- `databricks` → `DATABRICKS_TOKEN`（或 `auth.profile`）

## 验证清单

向用户提供生成的文件之前，请进行验证（如果
`validate_agent` 可用，则运行它进行确认）：
- [ ] 存在 `spec_version: 1`
- [ ] 已设置 `name`，并使用小写字母 + 连字符
- [ ] `executor.type` 是 `claude_sdk`、`agents_sdk`、`omnigent` 之一
- [ ] 如果为 `executor.type: omnigent`，则已将 `executor.config.harness` 设置为
      有效的 harness
- [ ] `instructions`（或 `prompt`）指向存在的文件，或者是
      内联文本
- [ ] 声明 `tools.agents` 时，父代理使用 `executor.type:
      omnigent`，且每个条目都是 `agents/` 下某个子代理已声明的 `name`
      （其目录名称可以不同；子代理可以使用任意
      executor）
- [ ] `tools.builtins` 名称来自已知集合（第 2 步）——或者，如果
      `list_builtin_tools` 可用，则已通过它进行确认
- [ ] Skill 名称使用 `[a-z0-9-]+` 模式（无需与其
      目录名称一致）