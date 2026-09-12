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
# 本地对话历史记录 — 路由器

此技能决定运行**哪个**技能。它不自行解析历史记录，不拥有某个单一提供商的命令，也绝不重新实现执行器已经完成的工作。如果你发现自己正在解释某个提供商的标志参数，就说明你处在错误的技能中，请转交并停止。

## 按平台 × 操作进行路由

路由前先确定两件事：对话所在的**平台**，以及用户想要的是**证据**（说过或做过什么）还是**继续工作**（推进工作）。

| 平台 | 读取证据 | 继续工作 |
|---|---|---|
| Claude Code | `daymade-claude-code:read-claude-code-history` | `daymade-claude-code:continue-claude-code-work` |
| OpenAI Codex | `daymade-claude-code:read-codex-history` | `daymade-claude-code:continue-codex-work` |
| Kimi CLI | `read-claude-code-history`，并指定 Kimi 作用域，参见**提供商作用域** | 不存在继续工作技能 |

继续工作始终要在读取之后进行。继续工作技能要求已验证的读取回执；未经过读取就直接路由到这些技能是缺陷，而不是捷径。

**未说明平台时**——例如只有一个会话 ID，或用户说“从我们上次停下的地方继续”——不要猜测平台。先进行身份识别：在 `read-claude-code-history` 中尝试 Claude Code 精确会话查找，然后在 `read-codex-history` 中尝试 Codex rollout 定位。只有返回已验证身份的查找结果，才能决定运行哪个继续工作技能；看起来合理的 ID 前缀不能作为依据。

## 提供商作用域 — 此入口仅负责路由

每个执行器默认使用自己的提供商，因此跨提供商的请求不会自动扩大范围。**命名作用域就是此技能的全部职责。**它有两个维度，并且使用不同的标志参数——混淆二者正是本节要防止的错误。

| 跨提供商需求 | 路由到 | 指定此作用域 |
|---|---|---|
| **清单**——“我一直在做什么”、“列出我最近的聊天”、会话标题/日期/ID | `read-claude-code-history`，其内置清单功能 | `--source all`，或仅针对 Kimi 使用 `--source kimi` |
| **内容搜索**——“我们之前讨论过 X 吗”、查找包含某段引文、文件或工具结果的对话 | `read-claude-code-history`，其内置完整事件搜索 | 在 Claude 搜索中添加 `--codex` 和 `--kimi`；每个参数对应一个独立存储，Claude 注册表不会覆盖它们 |
| **排序召回**——相同的问题，但表述可能已经变化，或者扫描范围没有会话 ID、日期或项目可用于限定 | `read-claude-code-history`，其可选的混合召回索引 | 索引会声明其包含哪些提供商；读取它打印的覆盖范围说明，而不是假定它覆盖全部三个提供商 |

两个读取器都提供相同的清单命令，并且其中的 `--source` 默认值都是 `all`——但每个读取器自身的任务表会将其固定为该读取器对应的提供商（`--source claude`、`--source codex`），因此默认值不会自行生效。搜索则恰好相反：它仅搜索 Claude，除非显式添加另外两个存储。

**将最后两行按顺序执行，而不是二选一。** 跨提供商内容搜索是成本高昂的方案：它会读取每个存储中的每条事件，因此成本随整个语料库扩展，而不是随问题规模扩展。当存在索引且覆盖范围内的提供商时，召回大约一秒即可给出答案，并返回线索：会话、日期、项目，这些线索可以将穷举扫描转换为有界扫描。先运行它，然后只扫描索引未包含的内容。当请求需要穷举保证时，直接跳过搜索，因为排序召回只返回排名靠前的候选项，永远无法支持“缺失”断言。

索引是可选的。在从未构建索引的机器上，召回会以非零状态退出，并说明索引不存在——这是路由信号，不是报告失败：回退到搜索行，并说明已执行未建立索引的扫描。

**Kimi CLI 没有其他入口**——任一轴都不存在专用 skill，因此上面的两条路径都会进入 `read-claude-code-history`，该 skill 会说明自身如何解析 Kimi home。

让执行器负责提供商范围之外的所有 flag：`--all-projects`、`--recursive`、日期边界、`--include-archived`、`--include-subagents`、`--include-automated`、输出格式，以及每个存储的具体解析方式。本 skill 只命名范围内的提供商，不处理其他内容。

## 意图决定路径——“history”一词不能决定路径

| 用户请求的结果 | 路径 |
|---|---|
| 对话列表：标题、日期、会话 ID | **Provider scope** 下的 inventory 行，或用户明确指定某个平台时使用相应的 reader |
| 出现过某个主题、引文、文件或工具结果的对话——“找找那次旧聊天”“我们以前讨论过 X 吗” | **Provider scope** 下的 **search** 行，绝不能使用 inventory。列出标题不是搜索内容，标题匹配也不能证明内容存在 |
| 按时间顺序逐字返回他们自己的原始输入 | 相应 reader 的逐字输入路径。保留重复项和会话边界；重复项属于记录账本的一部分，不是噪声 |
| 从已识别的会话继续工作 | 读取之后使用相应的 continuation skill |

请求的输出优先于背景动机。如果某人解释了一个问题，随后请求一个时间窗口内的自己原始输入，就返回该窗口——解释中的主题线索不会将请求转换为内容搜索。

## 路由后仍然有效的不变量

- **完整性。** Claude inventory 的源集合不可拆分：自动发现的活动 home（`~/.claude`、profile home、当前的 `CLAUDE_CONFIG_DIR`）**以及**在 `~/.claude/history-sources.json` 中注册的每个 archive。除非输出显示已覆盖注册的 archive，否则绝不能断言某个对话不存在。必需的 archive 不可用属于配置错误，不能以此为理由返回部分结果。`--claude-home` 是诊断覆盖项，绝不能用于支撑完整性声明。
- **自匹配。** 当前会话会记录用户的问题和本 agent 自己执行的命令，因此几乎会匹配任何关于自身的查询。在将命中视为历史证据之前，排除当前会话 ID。
- **零结果不代表不存在。** 对于使用不同措辞表达的内容，排序召回和有界搜索都可能返回空结果。应扩大搜索范围，或说明搜索了什么——不要将空结果转换为“从未发生过”。
- **零结果有三个原因，只有其中一个是“没有历史记录”。** 另外两个原因是从未找到 home，以及范围排除了所有内容，而这三种情况在空表中看起来完全相同。这对 Kimi 的影响最大：其文档记录的默认 home 并不是每种安装方式都会使用的位置——桌面客户端可能会将 CLI 捆绑在自己的运行时中，并将会话保存在那里——而且它的会话属于各自的 workspace，因此在某个其他 repository 中运行默认命令，可能会在一个存满对话的存储上返回空结果。在报告不存在之前，先排除这两种情况：指出实际读取的 home，并说明生效的项目范围。inventory 在 home 缺失时会打印诊断行，出现时应引用该行——但已定位的 home 即使产生零结果也不会打印任何诊断信息，而 search 路径在这两种情况下都不会打印诊断信息，因此绝不要将无提示的空结果视为 reader 已确认不存在。`read-claude-code-history` 负责如何定位 home，以及 inventory 需要哪些范围 flags。

## 不要

- 不要在这里执行特定于提供商的解析、SQLite、`rg`、`jq` 或 JSONL 管道。这些工作都属于已经处理其存储架构、归档和故障模式的执行器。
- 不要将执行器的标志复制到此文件中，除了用于指定提供商范围的三个标志（`--source`、`--codex`、`--kimi`）之外。它们是此技能自身的主题。其他所有标志都会随执行器的计划变化；将其复制到这里会导致此文件悄然偏离，进而教导用户使用错误的命令。
- 不要通过后续技能来回答有关过去的问题。读取是获取证据；继续操作会改变现状。