---
name: continue-codex-work
description: >-
  Continues interrupted OpenAI Codex work only after read-codex-history verifies
  the selected rollout identity and complete fork/compaction lineage. Use when
  the user provides a Codex Session ID, asks to pick up a prior Codex run, says
  Codex was interrupted, fused, compacted, or stuck, or wants the current Agent
  to take over without `codex resume`. Restores the original business outcome,
  unfulfilled requests, user corrections, proven prior assets, current workspace
  truth, and the next action that directly advances the goal. Do not use when
  Codex itself natively resumed this same conversation and its prior turns or
  compaction state are already present in the current context.
argument-hint: "[session-id]"
---
# 继续 Codex 工作

Continue 的含义是完成尚未履行的业务任务。阅读历史记录是强制性的证据阶段，而不是交付物。

## 入口条件：外部接管，而非原生恢复

| 当前情况 | 操作 |
|---|---|
| Codex 自身原生恢复了同一对话，并且恢复的轮次或压缩状态已经位于当前上下文中 | 不要调用此 Skill 或 `read-codex-history`。直接基于保留的上下文继续，然后在进行任何更改之前，验证当前工作区和外部状态。 |
| 新的/不同的 Agent 上下文必须接管更早的 Codex rollout，或用户指出了另一个 Session ID，而该 Session 的连续性尚未存在于此处 | 使用此 Skill。第 1 步中经过验证的历史回执仍然是强制要求。 |

仅仅重启不足以选择第二行。决定因素是当前对话是否为同一 Session 的宿主恢复后续，而不是 Codex 进程是否被重启。

## 第 1 步：获取经过验证的 Codex 读取回执

针对确切的 Session ID 调用 `daymade-claude-code:read-codex-history`，并请求完整的按时间顺序排列的 Session 证据简报。如果 ID 未知，先使用该 Skill 的清单或有界搜索。

回执必须说明：

- 所使用的 prompt-ledger、state-index 和 rollout 来源；
- 选定的 `session_meta.id`，以及它是否与请求的 ID 完全匹配；
- 从根到子级的分叉谱系和准确的继承字节边界；
- 选定的以及继承的按时间顺序排列的用户/assistant 轮次；
- 已压缩的上下文、最新计划、结束原因、未解决的调用、文件和缺口。

如果出现 rollout 不匹配、缺少子 rollout、物理副本不明确、缺少父级、字节边界损坏，或存在连续性提示但没有可恢复的父级目标，则必须安全失败。绝不要从“最接近”的文件继续。

## 第 2 步：重建继续执行契约

在第一次会改变项目的工具调用之前，根据读取回执和当前状态验证结果，填写以下内部契约：

| 字段 | 所需证据 |
|---|---|
| 原始业务结果 | 在继承的时间线和选定的时间线中，最早的、仍然具有约束力的人类请求 |
| 当前明确请求 | 最新的、并非仅仅是继续提示的人类请求 |
| 已完成事项 | 当前的独立验证，而不是旧 Agent 的叙述 |
| 仍未履行事项 | 没有完成证据的请求结果 |
| 用户更正 / 不要重复的事项 | 人类消息中否定某条路径、假设或输出的内容 |
| 已证实的资产和成功路径 | 现有代码、文档、Skills、输出、命令和之前成功的实验 |
| 下一步直接行动 | 一个其成功能够明显减少未履行业务结果的行动 |

如果子级中只有“继续”、“continue”或 `/fork`，则从经过验证的父级快照中继承任务。本地提示不是独立目标。

## 第 3 步：与当前现实进行核对

1. 阅读当前目标项目的 `AGENTS.md`/`CLAUDE.md`。
2. 确认 cwd、分支、工作树、相关文件和外部状态。
3. 验证记录的补丁、提交、推送、下载、作业或 Agent 输出确实已经落地；rollout 也会记录尝试执行的操作。
4. 在创建替代方案之前，获取并复用之前成功的资产。
5. 对于使用限额或服务错误等暂时性失败，先验证原始进程之后是否恢复并完成，再避免重复工作。

## 第 4 步：执行业务任务

执行下一项直接操作并闭环其反馈。除非评审、Skill 工作、基础设施清理、格式润色和额外的安全机制能够直接解除原始结果的阻塞，或用户明确提升了它们的优先级，否则它们都应处于从属地位。

在每个重要分支之前，都要询问：“如果这项操作成功，哪个原始的未完成结果会因此缩小？”如果没有答案，就说明该分支不是延续性工作。

不要运行 `codex resume` 或 `codex --continue`。不要覆盖无关的更改。

## 第 5 步：根据契约进行报告

- **已恢复的目标**：准确的 Session lineage 和原始业务结果。
- **已执行**：执行的操作和独立验证。
- **现已完成**：实际已关闭的契约条目。
- **剩余事项**：未解决的条目和确切的阻塞因素。
- **未重复执行**：有意避开的相关已拒绝路径。

上下文恢复、解析器成功、评审通过或子进程完成，本身都不代表延续工作成功。用户的业务结果才是完成单位。