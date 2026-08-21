---
name: moai-foundation-cc
description: >
  Canonical Claude Code authoring kit covering Skills, sub-agents, plugins, slash commands,
  hooks, memory, settings, sandboxing, headless mode, and advanced agent patterns.
  Use when creating Claude Code extensions or configuring Claude Code features.

when_to_use: >
  Use for Claude Code authoring and extension: Skills, sub-agents,
  plugins, slash commands, hooks, memory, settings, sandboxing, headless
  mode, orchestration, and delegation/agent-pattern authoring.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob
user-invocable: false
metadata:
  version: "5.0.0"
  category: "foundation"
  status: "active"
  updated: "2026-01-11"
  modularized: "false"
  tags: "foundation, claude-code, skills, sub-agents, plugins, slash-commands, hooks, memory, settings, sandboxing, headless, agent-patterns"
  aliases: "moai-foundation-cc"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# Claude Code 编写工具包

Claude Code Skills、子代理、插件、斜杠命令、钩子、记忆、设置、沙箱、无头模式和高级代理模式的综合参考。

## 文档索引

核心功能：

- reference/claude-code-skills-official.md - Agent Skills 的创建与管理
- reference/claude-code-sub-agents-official.md - 子代理的开发与委派
- reference/claude-code-plugins-official.md - 插件架构与分发
- reference/claude-code-custom-slash-commands-official.md - 命令创建与编排

配置：

- reference/claude-code-settings-official.md - 配置层级与管理
- reference/claude-code-memory-official.md - 上下文与知识持久化
- reference/claude-code-hooks-official.md - 事件驱动的自动化
- reference/claude-code-iam-official.md - 访问控制与安全

高级功能：

- reference/claude-code-sandboxing-official.md - 安全隔离
- reference/claude-code-headless-official.md - 编程式与 CI/CD 用法
- reference/claude-code-devcontainers-official.md - 容器化环境
- reference/claude-code-cli-reference-official.md - 命令行界面
- reference/claude-code-statusline-official.md - 自定义状态显示
- reference/advanced-agent-patterns.md - 工程最佳实践

## 快速参考

Skills：由模型调用的扩展，位于 ~/.claude/skills/（个人）或 .claude/skills/（项目）中。采用三级渐进式披露。最多 500 行。

子代理：通过 Agent(subagent_type="...") 使用的专用助手。上下文窗口取决于会话模型（Sonnet 5 = Anthropic API 原生支持 1M；Haiku / gateway / 较旧模型 = 200K — CC 2.1.197）。嵌套：仅当子代理的 `tools` 列表包含 `Agent` 时，它才能生成嵌套子代理（CC 2.1.172）；MoAI 保留代理不包含 `Agent`，因此无法嵌套。要创建或管理子代理，请让 Claude 执行，或直接编辑 `.claude/agents/`——`/agents` 向导已在 CC 2.1.198 中移除（截至 2026-07-03，官方子代理文档仍在介绍 `/agents` 选项卡式界面；文档存在滞后——请在实际的 2.1.198 会话中验证）。

插件：位于 .claude-plugin/plugin.json 中的可复用软件包。包含命令、代理、Skills、钩子和 MCP 服务器。

命令：由用户通过 /command 调用。参数：$ARGUMENTS、$1、$2。文件引用：@file。

钩子：settings.json 中的事件。PreToolUse、PostToolUse、SessionStart、SessionEnd、PreCompact、Notification。

记忆：CLAUDE.md 文件 + .claude/rules/*.md。层级顺序为企业、项目、用户。使用 @import 语法。

设置：六级层级结构。顺序为托管、文件托管、CLI、本地、共享、用户。

沙箱：操作系统级隔离。文件系统和网络限制。自动允许安全操作。

无头模式：使用 -p 标志进行非交互式运行。使用 --allowedTools、--json-schema、--agents 实现自动化。

## Skill 创建

### 渐进式披露架构

第 1 级（元数据）：启动时加载名称和描述，每个 Skill 约占 100 个 token

Level 2（说明）：触发时加载 SKILL.md 正文，建议少于 5K tokens

Level 3（资源）：按需加载其他文件，实际上不受限制

### 必需格式

创建一个带有 YAML frontmatter 的 SKILL.md 文件，其中包含采用 kebab-case 格式的 name，以及以第三人称说明其功能和使用时机的 description。description 最多 1024 个字符。在 frontmatter 之后，添加一个以技能名称命名的标题、一个包含简要说明的 Quick Start 部分，以及一个引用 REFERENCE.md 以获取更多信息的 Details 部分。

### 最佳实践

- 使用第三人称描述（描述它做什么，而不是我做什么）
- 包含用户会提及的触发词
- 保持在 500 行以内
- 引用深度为一层
- 使用 Haiku、Sonnet、Opus 进行测试

## 子代理创建

### 使用 /agents 命令

> **CC 2.1.198 CHANGELOG 变更**：`/agents` 向导已被**移除**——根据 CHANGELOG，应“让 Claude 创建或管理子代理，或直接编辑 `.claude/agents/`”。截至 2026-07-03，官方子代理文档仍记录了 `/agents` 选项卡式界面（可能是文档滞后，或者此次移除仅涉及创建向导）；在依赖以下流程之前，请先在实际的 2.1.198 会话中验证。

输入 /agents，选择 Create New Agent，定义用途和工具，然后按 e 编辑提示词。

### 文件格式

创建一个带有 YAML frontmatter 的 markdown 文件，其中包含 name、说明何时调用的 description（使用 PROACTIVELY 实现自动委派）、以逗号分隔的 tools 列表（Read, Write, Bash），以及模型规格（sonnet）。在 frontmatter 之后，添加系统提示词。

### 关键规则

- 默认情况下不能生成其他子代理（CC 2.1.172：当子代理的 `tools` 列表包含 `Agent` 时，该子代理可以生成嵌套子代理；MoAI 保留的代理省略了 `Agent`，因此它们不会嵌套）
- 无法有效使用 AskUserQuestion
- 所有用户交互都应在委派之前完成
- 上下文窗口取决于会话模型（Anthropic API 上的 Sonnet 5 原生支持 1M；Haiku / gateway / 较旧模型为 200K——CC 2.1.197）

## 插件创建

### 目录结构

创建 my-plugin 目录，其中包含 .claude-plugin/plugin.json、commands 目录、agents 目录、skills 目录、hooks/hooks.json 和 .mcp.json 文件。

### 清单（plugin.json）

创建一个 JSON 对象，其中包含 name、说明插件用途的 description、值为 1.0.0 的 version，以及包含 name 字段的 author 对象。

### 命令

使用 /plugin install owner/repo 从 GitHub 安装。
使用 /plugin validate . 验证当前目录。
使用 /plugin enable plugin-name 启用插件。

## 高级代理模式

### 用于长任务的双代理模式

初始化代理：设置环境、功能注册表和进度文档

执行代理：处理单项功能、更新注册表并维护进度

有关详细信息，请参阅 reference/advanced-agent-patterns.md。

### 编排器-工作器架构

主导代理：分解任务、生成工作器并综合结果

工作器代理：执行聚焦任务并返回精简摘要

### 上下文工程原则

- 最小化的高信号令牌集
- 即时检索，而非预先加载
- 为长会话压缩上下文
- 外部记忆文件持久保存在窗口之外

### 工具设计最佳实践

- 将相关功能整合到单一工具中
- 返回高信号且具备上下文感知能力的响应
- 使用清晰的参数名称（user_id 而非 user）
- 提供包含示例的指导性错误消息

### 探索/搜索性能优化

使用 Explore 代理或直接探索工具（Grep、Glob、Read）时，请应用以下优化措施，以防止 GLM 模型出现性能瓶颈：

**优先使用 AST-Grep**
- 在基于文本的搜索（Grep）之前，先使用结构化搜索（ast-grep）
- 运行 `moai ast-grep` 进行扫描，运行 `moai ast-edit` 重写匹配项
- 示例：`sg -p 'class $X extends Service' --lang python` 比 `grep -r "class.*extends.*Service"` 更快

**限制搜索范围**
- 始终使用 `path` 参数限制搜索范围
- 示例：使用 `Grep(pattern="func ", path="internal/core/")`，而不是 `Grep(pattern="async def")`

**文件模式具体化**
- 使用具体的 Glob 模式，而不是通配模式
- 示例：使用 `Glob(pattern="internal/core/*.go")`，而不是 `Glob(pattern="src/**/*.py")`

**并行处理**
- 并行执行相互独立的搜索（在单条消息中进行多次工具调用）
- 最多并行执行 5 次搜索，以防止上下文碎片化

## 工作流：探索-规划-编码-提交

阶段 1 探索：读取文件、理解结构、梳理依赖关系

阶段 2 规划：使用思考提示、概述方法、定义标准

阶段 3 编码：迭代实现、验证每个步骤、处理边界情况

阶段 4 提交：使用描述性消息、进行逻辑分组、保持历史记录整洁

## MoAI-ADK 集成

### 核心技能

- moai-foundation-cc：此创作工具包
- moai-foundation-core：SPEC 系统和工作流
- moai-foundation-philosopher：战略思考

### 必备子代理

- manager-spec：EARS 规范
- manager-develop：DDD 执行
- 包含安全指令的 Agent(general-purpose)：安全分析
- 包含后端指令的 Agent(general-purpose)：API 开发
- 包含前端指令的 Agent(general-purpose)：UI 实现

## 安全功能

### 沙箱

- 文件系统：写入操作仅限 cwd
- 网络：通过代理使用域名允许列表
- 操作系统级别：bubblewrap（Linux）、Seatbelt（macOS）

### 开发容器

- 通过防火墙强化安全性
- 仅允许列入白名单的出站连接
- --dangerously-skip-permissions 仅用于可信环境

### 无头模式安全

- 在 CI/CD 中始终使用 --allowedTools
- 将输入传递给 Claude 前进行验证
- 使用退出代码处理错误

## 资源

有关详细模式和可运行示例，请参阅 reference 目录。

版本历史：

- v5.0.0（2026-01-11）：根据 CLAUDE.md 文档标准转换为叙述格式
- v4.0.0（2026-01-06）：新增插件、沙箱、无头模式、状态栏、开发容器、CLI 参考和高级模式
- v3.0.0（2025-12-06）：新增渐进式披露、子代理详细信息和集成模式
- v2.0.0（2025-11-26）：首次全面发布

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我会使用 Bash sed 而不是 Edit，这样更快” | Edit 是更适合确保准确性和便于审查的工具。Bash sed 的错误不会明确显现，而且难以追踪。 |
| “这个钩子不需要超时，它很快就能完成” | 没有超时设置的钩子可能会使整个会话挂起。始终设置明确的超时时间。 |
| “我可以把所有逻辑都放进 CLAUDE.md，规则没有必要” | CLAUDE.md 有 40K 字符限制。规则可以按条件加载，并且能够扩展而不会使提示词臃肿。 |
| “对 settings.json 的更改风险很低” | 不正确的 settings.json 会破坏钩子、权限和模型路由。每次编辑后都要验证 JSON。 |
| “我会跳过渐进式披露，所有内容都是必需的” | 为每个技能加载 5K token 会浪费 67% 的上下文。第 1 级元数据足以用于路由。 |
| “这个技能不需要 allowed-tools，Claude 会自行处理” | 缺少 allowed-tools 意味着该技能会静默继承所有工具。显式声明比隐式继承更安全。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- CLAUDE.md 超过 40,000 个字符
- 在 settings.json 中注册了钩子，但没有对应的脚本文件
- 技能 frontmatter 中的 allowed-tools 使用空格分隔，而不是逗号分隔
- 代理定义中的 tools 使用 YAML 数组，而不是 CSV 字符串
- settings.json 包含硬编码的绝对路径，而不是 $CLAUDE_PROJECT_DIR
- 对超过 3000 个 token 的技能禁用了渐进式披露

来源（frontmatter CSV 格式漂移）：使用空格分隔的 `allowed-tools` 会静默破坏工具权限（CONST-V3R5-038）——已观察到重复出现，其来源仍待在记忆中确认。

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] CLAUDE.md 字符数少于 40,000（显示 wc -c 输出）
- [ ] settings.json 是有效的 JSON（显示 JSON 验证输出）
- [ ] settings.json 中的每个钩子在 .claude/hooks/ 中都有匹配的脚本文件
- [ ] 所有技能 frontmatter 中的 allowed-tools 均使用 CSV 格式
- [ ] 代理 frontmatter 中的 tools 使用 CSV，skills 使用 YAML 数组
- [ ] 技能 frontmatter 中的所有元数据值均为带引号的字符串
- [ ] 钩子命令使用 $CLAUDE_PROJECT_DIR，而不是绝对路径

<!-- moai:evolvable-end -->

---

## 决策启发式规则

快速默认原则——对于非简单决策，始终根据引用的正文小节进行确认。

- 如果需要延迟加载的工具（AskUserQuestion 等），默认先通过 `ToolSearch` 进行预加载（<- §文档索引 / 子代理）。
- 如果声明 `allowed-tools`，默认使用逗号分隔的字符串，绝不使用空格分隔（<- §危险信号）。
- 如果 CLAUDE.md 接近 40K 字符，默认将详细内容移入限定路径作用域的规则（<- §验证）。
- 如果注册了钩子，默认同时设置明确的超时时间（<- §常见的自我辩解）。
- 如果技能超过约 3000 个 token，默认保持启用渐进式披露（<- §常见的自我辩解）。