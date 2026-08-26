---
name: continue-claude-code-work
description: >-
  Continues interrupted Claude Code work only after local history has been read
  and reconciled. Use when the user provides a Claude Code Session ID, asks to
  pick up prior Claude work, says a Claude run was interrupted or compacted, or
  wants the current Agent to take over without `claude --resume`. Reconstructs
  the original business outcome, unfulfilled requests, user corrections,
  successful prior assets, current workspace truth, and the next action that
  directly advances the goal. For Codex sessions use continue-codex-work.
argument-hint: "[session-id]"
---
# 继续 Claude Code 工作

继续意味着执行仍未完成的业务任务。它不意味着总结对话记录、完善历史工具或开始新的实验。

## 步骤 1：获取经过验证的读取回执

调用 `daymade-claude-code:read-claude-code-history` 读取确切的 Session。要求该 Skill 提供按时间顺序排列的证据简报，而不是分别归类的“最后一条用户消息”和“最后一条助手消息”。如果不知道 Session ID，先使用其搜索/清单路由。

在回执明确说明以下内容之前，不要采取行动：

- 确切的 Session ID 和项目；
- 来源和时间覆盖范围；
- 压缩内容和原始时间顺序的边界；
- 每一条保留的人类请求，包括排队中的提示；
- 结束原因、未解决的调用、涉及的文件以及明确的缺口。

如果被截断的部分可能包含目标或更正内容，请使用读取器的完整模式重新读取。如果身份、沿袭关系或作者归属尚未解决，请停止；基于猜测的 Session 继续执行，比请求补充缺失证据更糟糕。

## 步骤 2：重建继续执行契约

在第一次会改变项目的工具调用之前，根据证据写出以下精简的内部契约。不要编造值来填补空白。

| 字段 | 所需证据 |
|---|---|
| 原始业务结果 | 最早仍然有效的人类请求，而不是之后的实现细节 |
| 当前明确请求 | 最新一条并非单纯“继续”的人类请求 |
| 已完成内容 | 独立的当前状态验证，而不是旧 Agent 的声明 |
| 仍未履行的内容 | 没有完成证据的请求结果 |
| 用户更正 / 不要重复的事项 | 人类消息中否定某条路径、输出或假设的内容 |
| 已证实的资产和成功路径 | 之前运行成功的现有代码、文档、Skills、输出或命令 |
| 下一项直接行动 | 一项成功后能够明显减少未完成业务结果的行动 |

当最新消息仅为“继续”时，从经过验证的时间顺序中继承目标。绝不要把这个提示本身当作规格说明。

## 步骤 3：与当前现实进行核对

1. 阅读目标项目当前的 `AGENTS.md`/`CLAUDE.md` 和权威项目状态；历史指令可能已经过时。
2. 确认当前 cwd、分支、工作树和相关文件。
3. 验证之前的写入、提交、外部操作或后台任务是否确实已经生效。对话记录既记录尝试，也记录成功。
4. 在编写替代方案之前，先获取已证实的资产或之前成功的路径。
5. 如果其他进程可能仍会完成同一项暂时失败的工作，请先验证其当前结果，再进行重复操作。

## 步骤 4：执行业务任务

采取契约中的下一项直接行动，并验证其结果。Skill 编辑、评审扩展、文档系统和基础设施清理仍然处于从属地位，除非用户明确将其中一项设为业务结果，或者它们是解除阻塞所严格必需的。

在改变方向之前，机械地询问：“如果这项行动成功，哪个原始未完成结果会因此减少？”如果答案是没有任何结果，则将其记录为后续提案，并回到任务本身。

不要运行 `claude --resume` 或 `claude --continue`。不要覆盖无关的
工作树更改。

## 第 5 步：对照契约进行报告

- **已恢复的目标**：会话和原始业务结果。
- **已执行**：操作及独立验证。
- **现已完成**：实际已闭合的契约条目。
- **剩余事项**：未履行的条目及确切阻塞原因。
- **未重复执行**：在相关情况下，明确避开之前已被拒绝的路径。

当仅完成了上下文提取或某个流程步骤时，不要说“已成功继续”；业务结果才是完成的衡量单位。