---
name: agent-introspection-debugging
description: Structured self-debugging workflow for AI agent failures using capture, diagnosis, contained recovery, and introspection reports. Use when an agent run fails and you need a reproducible diagnosis instead of a retry.
---
# Agent 内省调试

当 Agent 运行反复失败、消耗 token 却毫无进展、在相同工具上循环，或偏离预期任务时，使用此技能。

这是一项工作流技能，而非隐藏的运行时。它指导 Agent 在升级给人工处理之前，先对自身进行系统化调试。

## 何时启用

- 达到最大工具调用次数 / 循环限制而失败
- 反复重试但没有取得任何进展
- 上下文膨胀或提示词漂移，开始导致输出质量下降
- 文件系统或环境状态与预期不一致
- 工具故障可能通过诊断和较小的纠正操作恢复

## 范围边界

在以下情况下启用此技能：
- 在盲目重试之前捕获失败状态
- 诊断常见的 Agent 特有失败模式
- 执行有限且受控的恢复操作
- 生成结构化、便于人工阅读的调试报告

不要将此技能用作以下情况的主要依据：
- 代码更改后的功能验证；使用 `verification-loop`
- 已存在范围更窄的 ECC 技能时，进行特定于框架的调试
- 当前执行框架无法自动强制兑现的运行时承诺

## 四阶段循环

### 阶段 1：失败捕获

在尝试恢复之前，精确记录失败情况。

捕获以下内容：
- 错误类型、消息，以及可用时的堆栈跟踪
- 最近一次有实际意义的工具调用序列
- Agent 当时试图执行的操作
- 当前上下文压力：重复的提示词、过大的粘贴日志、重复的计划或失控增长的笔记
- 当前环境假设：cwd、分支、相关服务状态、预期文件

最小捕获模板：

```markdown
## Failure Capture
- Session / task:
- Goal in progress:
- Error:
- Last successful step:
- Last failed tool / command:
- Repeated pattern seen:
- Environment assumptions to verify:
```

### 阶段 2：根因诊断

在进行任何更改之前，先将失败与已知模式进行匹配。

| 模式 | 可能的原因 | 检查项 |
| --- | --- | --- |
| 达到最大工具调用次数 / 重复执行相同命令 | 循环或观察路径没有退出条件 | 检查最近 N 次工具调用是否存在重复 |
| 上下文溢出 / 推理能力下降 | 无限制增长的笔记、重复的计划、过大的日志 | 检查近期上下文中是否存在重复内容和大量低信号信息 |
| `ECONNREFUSED` / 超时 | 服务不可用或端口错误 | 验证服务运行状况、URL 和端口假设 |
| `429` / 配额耗尽 | 重试风暴或缺少退避机制 | 统计重复调用次数并检查重试间隔 |
| 写入后文件缺失 / 差异过期 | 竞态、cwd 错误或分支漂移 | 重新检查路径、cwd、git 状态以及文件是否确实存在 |
| “修复”后测试仍然失败 | 假设错误 | 隔离确切失败的测试并重新推导缺陷原因 |

诊断问题：
- 这是逻辑故障、状态故障、环境故障，还是策略故障？
- Agent 是否丢失了真正的目标，转而开始优化错误的子任务？
- 故障是确定性的还是暂时性的？
- 能够验证诊断结论的最小可逆操作是什么？

### 阶段 3：受控恢复

使用能够改变诊断范围的最小操作进行恢复。

安全的恢复操作：
- 停止重复重试，并重新陈述假设
- 精简低信号上下文，仅保留当前目标、阻碍因素和证据
- 重新检查实际的文件系统 / 分支 / 进程状态
- 将任务缩小到一个失败的命令、一个文件或一个测试
- 从推测性推理切换为直接观察
- 当故障具有高风险或受到外部因素阻碍时，升级给人工处理

除非你确实正在当前环境中通过真实工具执行这些操作，否则不要声称进行了缺乏依据的自动修复操作，例如“重置智能体状态”或“更新运行框架配置”。

受控恢复检查清单：

```markdown
## Recovery Action
- Diagnosis chosen:
- Smallest action taken:
- Why this is safe:
- What evidence would prove the fix worked:
```

### 阶段 4：自省报告

最后提供一份报告，使下一个智能体或人工能够清楚理解恢复过程。

```markdown
## Agent Self-Debug Report
- Session / task:
- Failure:
- Root cause:
- Recovery action:
- Result: success | partial | blocked
- Token / time burn risk:
- Follow-up needed:
- Preventive change to encode later:
```

## 恢复启发式方法

按以下顺序优先采用这些干预措施：

1. 用一句话重新陈述真正的目标。
2. 验证现实状态，而不是依赖记忆。
3. 缩小故障范围。
4. 执行一次具有鉴别力的检查。
5. 只有在此之后才重试。

不良模式：
- 使用略有不同的措辞重试同一操作三次

良好模式：
- 捕获故障
- 对模式进行分类
- 执行一次直接检查
- 仅当检查结果支持时才更改计划

## 与 ECC 集成

- 如果恢复后更改了代码，请使用 `verification-loop`。
- 当故障模式值得转化为一种本能或后续技能时，请使用 `continuous-learning-v2`。
- 当问题不是技术故障，而是决策存在歧义时，请使用 `council`。
- 如果故障源于相互冲突的本地状态或仓库漂移，请使用 `workspace-surface-audit`。

## 输出标准

启用此技能时，不要仅以“我已修复”作为结尾。

始终提供：
- 故障模式
- 根本原因假设
- 恢复操作
- 证明情况现已改善或仍然受阻的证据