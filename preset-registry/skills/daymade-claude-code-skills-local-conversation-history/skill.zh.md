---
name: local-conversation-history
description: >-
  Entry point for local AI conversation history across providers. Routes a
  request to the one skill that owns it, by platform (Claude Code, OpenAI Codex,
  Kimi CLI) and action (read evidence vs continue interrupted work), and owns the
  one job none of them own alone: a single inventory spanning all three
  providers. Use when the provider is unknown or plural ("our history", "what
  have I been working on", "which chats did I have"), when the user wants Kimi
  CLI history at all, when it is unclear whether they need evidence or
  resumption, or when they ask for this skill by name. Vague recall that names
  no platform ("we discussed this once, when was it?") belongs here rather than
  to a single-provider reader, because a Claude-only answer to an unscoped
  question cannot support an absence claim. When the platform and the action are
  both already clear, load that executor skill directly instead — except Kimi
  CLI, which has no reader or continuation skill of its own and always routes
  through here.
argument-hint: "[keywords | session-id | workspace-path]"
---
# 本地对话历史 — 路由器

此技能决定运行**哪个**技能。它本身不解析历史记录，不拥有某个单一提供商的命令，也绝不重新实现执行器已经完成的工作。如果你发现自己正在解释某个提供商的标志参数，那就说明你进入了错误的技能——交接后停止。

## 按平台 × 操作路由

路由前先确定两件事：对话所在的**平台**，以及用户想要的是**证据**（说过什么/做过什么）还是**继续**（将工作推进下去）。

| 平台 | 读取证据 | 继续工作 |
|---|---|---|
| Claude Code | `daymade-claude-code:read-claude-code-history` | `daymade-claude-code:continue-claude-code-work` |
| OpenAI Codex | `daymade-claude-code:read-codex-history` | `daymade-claude-code:continue-codex-work` |
| Kimi CLI | `read-claude-code-history`，并指定 Kimi 作用域——参见 **Provider scope** | 不存在继续技能 |

继续操作始终要先读取。继续技能要求经过验证的读取回执；没有回执就直接路由到继续技能属于缺陷，而不是捷径。

**未说明平台时**——例如只有一个会话 ID，或用户说“接着我们上次的进度继续”——不要猜测平台。先识别平台：在 `read-claude-code-history` 中尝试 Claude Code 精确会话查找，然后在 `read-codex-history` 中尝试 Codex rollout 定位。只有返回已验证身份的查找结果，才能决定运行哪个继续技能；看起来合理的 ID 前缀不能作为依据。

## Provider scope — 此入口唯一负责的工作

每个执行器默认使用自己的提供商，因此跨提供商的请求不会自动扩大范围。**命名作用域就是此技能的全部职责。**它有两个轴，并且使用不同的标志——混淆二者正是本节要防止的错误。

| 跨提供商需求 | 路由到 | 命名此作用域 |
|---|---|---|
| **清单**——“我一直在做什么”、“列出我最近的聊天”、会话标题/日期/ID | `read-claude-code-history`，其内置的清单功能 | `--source all`，或仅针对 Kimi 使用 `--source kimi` |
| **内容搜索**——“我们以前讨论过 X 吗”、查找包含某段引用、文件或工具结果的对话 | `read-claude-code-history`，其内置的完整事件搜索 | 在 Claude 搜索中添加 `--codex` 和 `--kimi`；每个都是独立的存储区，Claude 注册表永远不会覆盖它们 |

两个读取器都提供相同的清单命令，并且其 `--source` 默认值已经是
`all`——但每个读取器自己的任务表都会将其固定为该读取器对应的提供商
（`--source claude`、`--source codex`），因此默认值不会自行生效。
搜索则正好相反：除非显式添加另外两个存储区，否则它只搜索 Claude。

**Kimi CLI 在其他任何位置都没有入口**——两个轴都不存在专用技能，因此上面的两条路由都会进入 `read-claude-code-history`，由该技能说明其自身的 Kimi 主目录解析方式。

让执行器负责提供商作用域之外的所有标志：`--all-projects`、
`--recursive`、日期边界、`--include-archived`、`--include-subagents`、
`--include-automated`、输出格式，以及每个存储区的具体解析方式。本技能只命名哪些提供商属于作用域，不负责其他任何内容。

## 意图决定路径——“history”一词并不决定路径

| 用户请求的结果 | 路径 |
|---|---|
| 对话列表：标题、日期、会话 ID | **Provider scope** 下的 inventory 行，或在指定某个平台时使用相应的 reader |
| 出现过某个主题、引文、文件或工具结果的对话——“找到那个旧聊天”“我们之前讨论过 X 吗” | **Provider scope** 下的 **search** 行，绝不能使用 inventory。列出标题不是搜索内容，而标题匹配也不能证明内容存在 |
| 按时间顺序逐字获取他们自己的原始输入 | 使用相应 reader 的逐字输入路径。保留重复项和会话边界；重复项是记录的一部分，不是噪声 |
| 从已确定的会话继续工作 | 读取之后使用相应的 continuation skill |

请求的输出优先于背景动机。如果有人解释了一个
问题，然后请求一个包含其自身原始输入的窗口，就返回该窗口——
解释中的主题线索不会将请求转化为内容搜索。

## 路由后仍然成立的不变量

- **完整性。** Claude inventory 的源集合不可拆分：自动发现的活动主目录（`~/.claude`、配置文件主目录、当前的 `CLAUDE_CONFIG_DIR`）**以及**在
  `~/.claude/history-sources.json` 中注册的每个归档。除非输出显示已覆盖已注册的归档，否则绝不能声称某个对话不存在。必需的归档不可用属于配置错误，而不是返回部分结果的许可。
  `--claude-home` 是诊断覆盖项，绝不能用于支撑完整性声明。
- **自身匹配。** 当前会话会记录用户的问题和该代理自身的命令，因此几乎会匹配任何关于自身的查询。在将命中视为历史证据之前，排除当前会话 ID。
- **零结果不等于不存在。** 对于以不同措辞存在的内容，排序召回和有界搜索都会返回空结果。应扩大搜索范围，或说明搜索了哪些内容——不要将空结果转化为“从未发生过”。

## 不要

- 不要在此处运行特定于提供商的解析、SQLite、`rg`、`jq` 或 JSONL 管道。这些都属于已经处理其存储架构、归档和故障模式的执行器。
- 除了用于命名提供商范围的三个选项（`--source`、`--codex`、`--kimi`）之外，不要将执行器的选项复制到此文件中——这三个选项是此 skill 自身的主题。其他每个选项都会在执行器的计划中发生变化；将其中任何一个复制到这里，都会使此文件在不知不觉中偏离，并进而教授错误的命令。
- 不要为了回答关于过去的问题而路由到 continuation skill。读取是证据；继续操作会改变世界。