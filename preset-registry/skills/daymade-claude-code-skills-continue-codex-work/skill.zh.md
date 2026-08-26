---
name: continue-codex-work
description: >-
  Continues interrupted OpenAI Codex work only after read-codex-history verifies
  the selected rollout identity and complete fork/compaction lineage. Use when
  the user provides a Codex Session ID, asks to pick up a prior Codex run, says
  Codex was interrupted, fused, compacted, or stuck, or wants the current Agent
  to take over without `codex resume`. Restores the original business outcome,
  unfulfilled requests, user corrections, proven prior assets, current workspace
  truth, and the next action that directly advances the goal.
argument-hint: "[session-id]"
---
# 继续 Codex 工作

继续意味着完成仍未履行的业务任务。阅读历史记录是强制性的证据阶段，而不是交付物。

## 第 1 步：获取经过验证的 Codex 读取回执

针对准确的 Session ID 调用 `daymade-claude-code:read-codex-history`，并请求完整的按时间顺序排列的 Session 证据简报。如果 ID 未知，先使用该 Skill 的清单或有界搜索。

回执必须说明：

- 使用的 prompt-ledger、state-index 和 rollout 来源；
- 选定的 `session_meta.id`，以及它是否与请求的 ID 完全匹配；
- 从根节点到子节点的分叉谱系，以及准确继承的字节边界；
- 选定的和继承的按时间顺序排列的用户/助手轮次；
- 已压缩的上下文、最新计划、结束原因、未解决的调用、文件和缺口。

如果 rollout 不匹配、缺少子 rollout、物理副本存在歧义、缺少父节点、字节边界损坏，或存在延续提示但没有可恢复的父级目标，则必须安全终止。绝不能从“最接近”的文件继续。

## 第 2 步：重建延续契约

在第一次会改变项目的工具调用之前，根据读取回执和当前状态验证填写以下内部契约：

| 字段 | 所需证据 |
|---|---|
| 原始业务结果 | 在继承的时间线和选定的时间线中，最早且仍具约束力的人类请求 |
| 当前明确请求 | 最新的、并非仅仅是延续提示的人类请求 |
| 已完成事项 | 当前的独立验证，而不是旧的 Agent 叙述 |
| 仍未履行事项 | 缺少完成证据的请求结果 |
| 用户更正 / 不要重复的事项 | 人类消息中否定某条路线、假设或输出的内容 |
| 已证实的资产和成功路线 | 现有代码、文档、Skills、输出、命令以及之前成功的实验 |
| 下一步直接行动 | 一项成功后能明显减少未履行业务结果的行动 |

如果子节点只包含“继续”、“continue”或`/fork`，则从经过验证的父节点快照中继承任务。本地提示不是独立目标。

## 第 3 步：与当前现实对齐

1. 阅读当前目标项目的 `AGENTS.md`/`CLAUDE.md`。
2. 确认 cwd、分支、工作树、相关文件和外部状态。
3. 验证记录中的补丁、提交、推送、下载、作业或 Agent 输出确实已经落地；rollout 也会记录尝试过的操作。
4. 获取并复用之前成功的资产，然后再创建替代方案。
5. 对于使用限制或服务错误等暂时性故障，在重复工作之前，先确认原始进程是否后来恢复并完成。

## 第 4 步：执行业务任务

执行下一步直接行动并闭合其反馈回路。审查、Skill 工作、基础设施清理、格式润色以及额外的安全机制都应处于从属地位，除非它们直接解除原始结果的阻塞，或用户明确提升了它们的优先级。

在每个重要分支之前，先问：“如果这项行动成功，哪个原始的未履行结果会因此减少？”如果没有答案，则该分支不是延续工作。

不要运行 `codex resume` 或 `codex --continue`。不要覆盖无关的更改。

## 第 5 步：对照契约报告

- **已恢复的目标**：准确的 Session lineage 和原始业务结果。
- **已执行**：已执行的操作和独立验证。
- **现已完成**：实际已关闭的契约条目。
- **剩余事项**：未解决的条目和确切阻塞原因。
- **未重复执行**：有意避开的相关已拒绝路径。

上下文恢复、解析器成功、通过审查或子进程完成，本身都不代表成功继续执行。用户的业务结果才是完成单位。