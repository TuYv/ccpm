---
name: plugin-best-practices
description: This skill should be used when the user asks to "validate plugin structure", "review manifest files", "check frontmatter compliance", "verify tool invocation patterns", "explain plugin component types", or needs Claude Code plugin architectural guidance.
user-invocable: false
---
# 插件验证与最佳实践

依据架构标准验证 Claude Code 插件。本文件是一份导航指南；详细内容位于 `references/` 中。

## 快速开始

对插件运行验证：

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/validate-plugin.py <plugin-path>
```

仅执行特定检查：
```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/validate-plugin.py <plugin-path> --check=manifest,frontmatter
```

## 组件选择指南

| 组件 | 适用场景 | 关键要求 |
|-----------|-------------|------------------|
| **指令型 Skills** | 用户调用的工作流、线性流程 | 使用祈使语气、按阶段组织、在 `commands` 中声明；名称使用 `use-<action>` 前缀（例如 `use-kicad-cli`） |
| **知识型 Skills** | 供代理使用的参考知识 | 使用陈述语气、按主题组织、在 `skills` 中声明；名称使用 `using-<topic>` 前缀（例如 `using-git-worktrees`） |
| **代理** | 隔离的专业化决策 | 限制工具、包含 2–4 个 `<example>` 块、上下文隔离 |
| **MCP 服务器** | 外部工具/数据集成 | stdio/http/sse 传输方式、使用 ${CLAUDE_PLUGIN_ROOT} 路径 |
| **LSP 服务器** | IDE 功能（转到定义） | 语言服务器二进制文件、扩展名映射 |
| **钩子** | 事件驱动的自动化 | 生命周期事件、`command`/`http`/`mcp_tool`/`prompt`/`agent` 类型 |
| **监视器** | 长时间运行的监视任务（日志、部署） | 每个条目包含 `name`+`command`+`description`；需要 v2.1.105+ |
| **主题** | 捆绑的颜色预设 | 包含 `name`、`base`、`overrides` 的 JSON |
| **输出样式** | 调整响应格式 | Markdown，frontmatter 中包含 `name` + `description` |

有关详细的选择标准，请参阅 `./references/component-model.md`；有关实现指南，请参阅 `./references/components/`。

## 渐进式披露

三级 token 结构可确保高效利用上下文：

| 级别 | 内容 | Token 预算 | 加载时机 |
|-------|---------|--------------|---------|
| 1 | 元数据（名称 + 描述） | 约 100 个 token | 始终加载（启动时） |
| 2 | SKILL.md 正文 | 少于 5k 个 token | Skill 被触发时 |
| 3 | References/ 文件 | 实际上不受限制 | 通过 bash 按需加载 |

**实现模式**：
- SKILL.md：概述以及指向参考文件的导航
- References/：详细规范、示例、模式
- Scripts/：可执行实用工具（执行前不产生上下文成本）

有关完整的 token 预算指南，请参阅 `./references/component-model.md`。

## 验证工作流

五项顺序检查覆盖插件质量的所有维度：

1. **结构**：文件模式、目录布局、kebab-case 命名
2. **清单**：plugin.json 必填字段及 schema 合规性
3. **Frontmatter**：组件中的 YAML frontmatter、第三人称描述
4. **工具调用**：反模式检测（隐式与显式工具调用）
5. **Token 预算**：渐进式披露合规性（SKILL.md 少于 5k 个 token）

使用 `-v` 标志运行验证，以输出详细信息并显示所有通过的检查。

完整标准请参阅 `./references/validation-checklist.md`。

## 要求级别（RFC 2119）

插件文档使用 RFC 2119 要求级别：
- **MUST** / **MUST NOT**：绝对要求或禁止事项
- **SHOULD** / **SHOULD NOT**：存在已知例外的推荐做法
- **MAY**：真正可选

完整的 RFC 2119 规范请参阅 `./references/rfc-2119.md`。

## 关键模式

### 工具调用规则

| 工具 | 方式 | 示例 |
|------|-------|---------|
| Read, Write, Edit, Glob, Grep | 隐式 | “查找匹配的文件……” |
| Bash | 隐式 | “运行 `git status`” |
| Task | 隐式 | “启动 `plugin-name:agent-name` 代理” |
| Skill | **显式** | “使用 Skill 工具**加载 `plugin-name:skill-name` 技能**” |
| TaskCreate | **显式** | “**使用 TaskCreate 工具**跟踪进度” |
| AskUserQuestion | **显式** | “使用 `AskUserQuestion` 工具执行[操作]” |
| MCP Tools | **隐式** | “在数据库中查询用户记录” |

**限定名称**：插件组件必须使用 `plugin-name:component-name` 格式。

**allowed-tools**：绝不单独使用 `Bash`——始终使用类似 `Bash(git:*)` 的过滤器。

**内联 Bash**：对于动态上下文，使用内联语法（感叹号 + 反引号 + 命令 + 反引号）。

**MCP 工具调用**：使用自然语言描述意图——Claude 会自动识别适当的 MCP 工具。切勿在技能内容中指定类似 `mcp__server__tool` 的确切 MCP 工具名称。

完整的模式和反模式请参阅 `./references/tool-invocations.md`。
MCP 特定的调用模式请参阅 `./references/mcp-patterns.md`。

### 技能 Frontmatter（官方最佳实践）

**必填字段**：
- `name`：最多 64 个字符，仅限小写字母、数字和连字符。**按类型划分的命名约定**：指令型技能使用 `use-<action>` 前缀（例如 `use-kicad-cli`）；知识型技能使用 `using-<topic>` 前缀（例如 `using-git-worktrees`）。
- `description`：最多 1024 个字符。必须使用第三人称表述，并包含具体的触发短语。

**描述最佳实践**：

| 要求 | 描述 |
|-------------|-------------|
| **人称** | 仅使用第三人称（“此技能应在……时使用”） |
| **结构** | [它的作用]。在[场景 1]、[场景 2]或[用户短语]时使用。 |
| **用途** | 技能发现——Claude 使用此描述从 100 多个技能中进行选择 |
| **触发短语** | 包含具体的用户短语，例如“验证插件”“检查 frontmatter” |

完整的 frontmatter 规范请参阅 `./references/components/skills.md`。

### 代理 Frontmatter

**必填字段**（根据上游规范）：
- `name`：3-50 个字符，使用 kebab-case
- `description`：触发条件以及 2-4 个 `<example>` 块

**可选字段**：`model`、`color`、`effort`、`maxTurns`、`tools`、`disallowedTools`、`skills`、`memory`、`background`、`isolation`（只有 `"worktree"` 有效）。

插件代理中的**禁止字段**（出于安全考虑）：`hooks`、`mcpServers`、`permissionMode`。

**字段顺序**：`name` → `description`（一个包含触发条件和 `<example>` 块的 `|` 块标量）→ 其他 YAML 字段 → 结尾的 `---`。位于描述之外的裸 `<example>` 块会导致 YAML 解析失败。

有关完整的代理设计指南（包括 CO-STAR 框架），请参阅 `./references/components/agents.md`。

### 任务管理

包含 3 个或更多不同步骤、涉及多个文件或具有顺序依赖关系的任务应使用 TaskCreate。单文件编辑和 1-2 步操作则不需要。

**核心要求**：
- 双形式命名：subject（"Run tests"）+ activeForm（"Running tests"）
- 开始前标记为 `in_progress`，完成后标记为 `completed`
- 只有在完全完成后才能标记为 `completed`

有关完整的模式和示例，请参阅 `./references/task-management.md`。

### MCP 服务器配置

MCP 服务器可在插件根目录的 `.mcp.json` 中配置，也可在 `plugin.json` 的 `mcpServers` 下以内联方式配置。支持三种传输类型：stdio（本地 CLI 工具）、http（远程 API，支持最广泛）和 sse（实时流式传输）。

切勿硬编码密钥——始终使用 `${ENV_VAR}` 语法。

有关完整的 MCP 集成模式，请参阅 `./references/mcp-patterns.md`。
有关组件配置详情，请参阅 `./references/components/mcp-servers.md`。

### Hook 配置

Hook 事件覆盖完整的会话生命周期（28+ 个事件，包括 `PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PostToolBatch`、`PermissionRequest`、`PermissionDenied`、`UserPromptSubmit`、`UserPromptExpansion`、`Setup`、`Notification`、`Stop`/`StopFailure`、`SubagentStart`/`SubagentStop`、`TaskCreated`/`TaskCompleted`、`TeammateIdle`、`InstructionsLoaded`、`ConfigChange`、`CwdChanged`、`FileChanged`、`WorktreeCreate`/`WorktreeRemove`、`PreCompact`/`PostCompact`、`Elicitation`/`ElicitationResult`、`SessionStart`/`SessionEnd`）。共有五种 Hook 类型：`command`、`http`、`mcp_tool`、`prompt`、`agent`。

有关完整的事件表和 AI 原生结构化输出模式，请参阅 `./references/components/hooks.md`。

## Agent Teams 与 Subagents 的对比

Subagents 是隔离的单向子进程，会将结果返回给调用方。Agent Teams 是多个共享任务列表、可直接进行点对点通信的独立会话——适合并行调查、多模块功能开发和竞争性假设验证。

| | Subagents | Agent Teams |
|---|---|---|
| 上下文 | 返回给调用方 | 完全独立 |
| 通信 | 仅与主代理通信 | 直接进行点对点通信 |
| Token 成本 | 较低（经过总结） | 较高（完整实例） |

Agent Teams 仍处于实验阶段。使用 `export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 启用。

有关完整指南，请参阅 `./references/agent-teams.md`；有关并行协调模式，请参阅 `./references/parallel-execution.md`。

## 目录结构

**标准布局**：
```
plugin-name/
├── .claude-plugin/plugin.json    # Manifest (declare components here)
├── skills/                       # Agent Skills (RECOMMENDED)
│   └── skill-name/
│       ├── SKILL.md
│       └── references/
├── commands/                     # Skills as flat .md files (legacy)
├── agents/                       # Subagent definitions
├── output-styles/                # Output style markdown
├── themes/                       # Color theme JSON
├── monitors/monitors.json        # Background monitor configs
├── hooks/hooks.json              # Hook configuration
├── bin/                          # Executables added to Bash PATH
├── settings.json                 # Plugin default settings
├── .mcp.json                     # MCP server definitions
├── .lsp.json                     # LSP server configurations
└── scripts/                      # Executable scripts
```

**关键规则**：
- 组件位于插件根目录，而非 `.claude-plugin/` 内
- 脚本必须带有 shebang 且可执行
- 脚本必须使用 `${CLAUDE_PLUGIN_ROOT}` 指定路径
- 所有路径必须是相对路径，并以 `./` 开头

完整的目录布局指南请参阅 `./references/directory-structure.md`。

## 参考资料目录

### 验证与质量
- `./references/validation-checklist.md` - 完整的质量检查清单
- `./references/rfc-2119.md` - 要求级别（必须/应该/可以）

### 组件实现
- `./references/component-model.md` - 组件类型、选择标准、令牌预算
- `./references/components/skills.md` - Skill 结构、frontmatter、渐进式披露
- `./references/components/agents.md` - Agent 设计、CO-STAR 框架、禁用字段
- `./references/components/commands.md` - Command frontmatter、动态上下文
- `./references/components/hooks.md` - Hook 事件、类型、AI 原生模式、模板
- `./references/components/mcp-servers.md` - MCP 配置、stdio/http/sse
- `./references/components/lsp-servers.md` - LSP 设置、二进制文件要求
- `./references/components/monitors.md` - 后台 Monitor 配置
- `./references/components/themes.md` - Color theme JSON 结构
- `./references/components/output-styles.md` - Output style frontmatter

### 配置与集成
- `./references/directory-structure.md` - 插件布局、命名约定
- `./references/manifest-schema.md` - plugin.json schema、必填字段
- `./references/mcp-patterns.md` - MCP 传输类型、安全最佳实践

### 开发模式
- `./references/tool-invocations.md` - 工具使用模式与反模式
- `./references/tool-design-philosophy.md` - 设计能够发挥 Claude 优势的工具时应遵循的原则
- `./references/task-management.md` - TaskCreate 模式、双形式命名
- `./references/cli-commands.md` - 用于插件管理的 CLI 命令

### 高级主题
- `./references/agent-teams.md` - 可并行化任务、多视角分析
- `./references/parallel-execution.md` - 并行 Agent 协调模式
- `./references/debugging.md` - 常见问题、错误消息、故障排除