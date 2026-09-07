---
name: team-composition-patterns
description: Design optimal agent team compositions with sizing heuristics, preset configurations, and agent type selection. Use this skill when deciding how many agents to spawn for a task, when choosing between a review team versus a feature team versus a debug team, when selecting the correct subagent_type for each role to ensure agents have the tools they need, when configuring display modes (tmux, iTerm2, in-process) for a CI or local environment, or when building a custom team composition for a non-standard workflow such as a migration or security audit.
version: 1.0.2
---
# 团队组建模式

用于组建多智能体团队的最佳实践，包括选择团队规模、选择智能体类型，以及为 Claude Code 的 Agent Teams 功能配置显示模式。

## 何时使用此技能

- 决定为某个任务生成多少个队友
- 在预设团队配置之间进行选择
- 为每个角色选择合适的智能体类型（subagent_type）
- 配置队友显示模式（tmux、iTerm2、in-process）
- 为非标准工作流构建自定义团队组合

## 团队规模经验法则

| 复杂度       | 团队规模 | 适用场景                                                   |
| ------------ | --------- | ----------------------------------------------------------- |
| 简单         | 1-2       | 单一维度审查、孤立的 bug、小特性                           |
| 中等         | 2-3       | 多文件变更、2-3 个关注点、中等特性                          |
| 复杂         | 3-4       | 横切关注点、大型特性、深度调试                              |
| 非常复杂     | 4-5       | 全栈特性、全面审查、系统性问题                              |

**经验法则**：从能够覆盖所有必需维度的最小团队开始。增加队友会提高协调开销。

## 预设团队组合

### 审查团队（Review Team）

- **规模**：3 名审查者
- **智能体**：3x `team-reviewer`
- **默认维度**：security（安全）、performance（性能）、architecture（架构）
- **适用场景**：代码变更需要多维度的质量评估

### 调试团队（Debug Team）

- **规模**：3 名调查者
- **智能体**：3x `team-debugger`
- **默认假设**：3 个相互竞争的假设
- **适用场景**：Bug 存在多个合理的根本原因

### 特性团队（Feature Team）

- **规模**：3 人（1 名负责人 + 2 名实现者）
- **智能体**：1x `team-lead` + 2x `team-implementer`
- **适用场景**：特性可以分解为并行的工作流

### 全栈团队（Fullstack Team）

- **规模**：4 人（1 名负责人 + 3 名实现者）
- **智能体**：1x `team-lead` + 1x 前端 `team-implementer` + 1x 后端 `team-implementer` + 1x 测试 `team-implementer`
- **适用场景**：特性横跨前端、后端和测试层

### 研究团队（Research Team）

- **规模**：3 名研究员
- **智能体**：3x `general-purpose`
- **默认领域**：每人分配不同的研究问题、模块或主题
- **能力**：代码库搜索（Grep、Glob、Read）、网络搜索（WebSearch、WebFetch）
- **适用场景**：需要理解代码库、研究库、比较方案，或并行地从代码和网络来源收集信息

### 安全团队（Security Team）

- **规模**：4 名审查者
- **智能体**：4x `team-reviewer`
- **默认维度**：OWASP/漏洞、认证/访问控制、依赖/供应链、机密信息/配置
- **适用场景**：覆盖多个攻击面的全面安全审计

### 迁移团队（Migration Team）

- **规模**：4 人（1 名负责人 + 2 名实现者 + 1 名审查者）
- **智能体**：1x `team-lead` + 2x `team-implementer` + 1x `team-reviewer`
- **适用场景**：需要并行工作并进行正确性验证的大型代码库迁移（框架升级、语言移植、API 版本升级）

## 智能体类型选择

使用 `Agent` 工具生成队友时，根据队友所需的工具来选择 `subagent_type`：

| 智能体类型                     | 可用工具                                             | 用途                                                        |
| ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------- |
| `general-purpose`              | 所有工具（Read、Write、Edit、Bash 等）               | 实现、调试、任何需要文件变更的任务                         |
| `Explore`                      | 只读工具（Read、Grep、Glob）                         | 研究、代码探索、分析                                        |
| `Plan`                         | 只读工具                                             | 架构规划、任务分解                                          |
| `agent-teams:team-reviewer`    | 读取/搜索/Bash 加 TaskList/TaskGet/TaskUpdate/SendMessage | 输出结构化发现的代码审查                           |
| `agent-teams:team-debugger`    | 读取/搜索/Bash 加 TaskList/TaskGet/TaskUpdate/SendMessage | 基于假设的调查                                    |
| `agent-teams:team-implementer` | 读取/写入/编辑/搜索/Bash 加 TaskList/TaskGet/TaskUpdate/SendMessage | 在文件所有权边界内构建特性       |
| `agent-teams:team-lead`        | 读取/搜索/Bash 加 Agent Teams 协调工具               | 团队编排与协调                                              |

**关键区别**：只读智能体（Explore、Plan）无法修改文件。切勿将实现任务分配给只读智能体。

## 显示模式配置

在 `~/.claude/settings.json` 中配置：

```json
{
  "teammateMode": "tmux"
}
```

| 模式           | 行为                           | 最适合                                            |
| -------------- | ------------------------------ | ------------------------------------------------- |
| `"tmux"`       | 每个队友位于一个 tmux 面板     | 开发工作流、监控多个智能体                        |
| `"iterm2"`     | 每个队友位于一个 iTerm2 标签页 | 偏好使用 iTerm2 的 macOS 用户                     |
| `"in-process"` | 所有队友在同一进程中          | 简单任务、CI/CD 环境                              |

## 自定义团队指南

构建自定义团队时：

1. **每个团队都需要一个协调者** —— 要么指定一个 `team-lead`，要么让用户直接协调
2. **角色与智能体类型匹配** —— 尽可能使用专门的智能体（reviewer、debugger、implementer）
3. **避免角色重复** —— 两个智能体做同样的事情会浪费资源
4. **事先定义边界** —— 每个队友需要对文件或职责有明确的所有权
5. **保持精简** —— 2-4 个队友是最佳规模；5 个及以上需要显著的协调开销

## 故障排除

**某个队友被生成为 `Explore` 类型，但需要写入文件。**
`Explore` 和 `Plan` 是只读智能体。请将 `subagent_type` 改为 `general-purpose` 或合适的专门智能体类型。切勿将实现任务分配给只读智能体。

**团队规模增长过大，协调拖慢了一切。**
每增加一个队友都会增加沟通开销。合并角色：一个智能体能否覆盖两个维度？一个由 4 人组成、执行 6 个独立任务的团队，通常由 3 个智能体各覆盖 2 个任务来承担会更好。

**tmux 模式没有显示面板。**
请确保在生成队友之前已安装 tmux 且已有一个正在运行的会话。`in-process` 模式无需 tmux 即可工作，适用于 CI 或脚本化环境。

**两个审查者标记了相同的问题。**
审查维度存在重叠。重新定义每个审查者的关注领域：一个负责正确性/逻辑，一个负责安全，一个负责性能/可扩展性。重叠的覆盖范围会浪费 token 并产生重复的发现。

**`team-lead` 生成了队友，但它们没有收到任务。**
请验证负责人是否正在使用 `Agent` 工具生成队友，并在提示中传递完整的上下文。队友启动时没有任何先前的对话历史——它们需要在初始提示中获得所有相关信息。

## 相关技能

- [parallel-feature-development](../parallel-feature-development/SKILL.md) —— 在团队组建完成后分解工作流并分配文件所有权
- [team-communication-protocols](../team-communication-protocols/SKILL.md) —— 为组建好的团队建立消息传递规范和关闭流程
