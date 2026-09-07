---
name: agent-evaluation-reporting
description: "Use when summarizing agent evaluations where autonomous, assisted, failed, timed-out, or invalid outcomes must remain distinct and comparable."
category: agent-evaluation
risk: none
source: self
source_type: self
date_added: "2026-08-18"
author: Whxuan0701
tags: [agent-evaluation, metrics, reporting, reliability, benchmarking]
tools: [claude, cursor, gemini, codex]
---
# 智能体评估报告

## 概述

将原始的智能体评估运行转化为可直接用于决策的报告，既不隐藏失败，也不夸大能力。明确给出结果总体、分母、延迟总体和实验条件，使读者能够复现每一个关键数字。

## 何时使用此技能

- 在为 AI 智能体报告基准测试、回归测试、试点或生产评估运行时使用。
- 当自主完成与人工辅助完成出现在同一结果集中时使用。
- 当失败、超时、基础设施导致的无效运行、重试或部分结果会影响分母时使用。
- 当比较两个智能体、提示词、评估框架或版本发布，并判断该比较是否有效时使用。

## 工作原理

### 步骤 1：冻结比较契约

记录任务集与采样方式、模型与提供商、提示词或策略版本、工具与评估框架版本、评估器评分标准、超时与重试策略、token 或成本预算、环境，以及人工干预策略。为该配置分配一个稳定的标签或摘要值。

如果各次运行之间存在实质性条件差异，请将该比较标记为非等价。只报告方向性观察；不要声称被更改的智能体导致了该差异。

### 步骤 2：构建互斥的结果台账

将每一个被调度的尝试恰好归类一次：

| 结果 | 含义 |
|---|---|
| `autonomous_success` | 智能体在无人工干预的情况下满足评估器标准。 |
| `assisted_success` | 任务仅在人工介入后才成功。 |
| `failure` | 运行达到了终态的、可评估的失败。 |
| `timeout` | 运行耗尽了其声明的时间或步数预算。 |
| `invalid` | 由于评估框架、环境或输入发生故障，智能体从未获得有效评估。 |

保留尝试 ID、任务 ID 或种子、重试索引、父尝试 ID、配置标签、结果、干预次数、时长、成本、评估器证据以及无效原因（如果有）。绝不静默丢弃无效运行或重试运行。

同时构建唯一任务汇总。对每个任务，保留其首次尝试结果，并在预先声明的重试策略结束后推导出一个最终结果。一次执行尝试在尝试级指标中可计入一次，但一个任务在任务级完成度指标中只能计入一次。如果缺少重试谱系或重试策略，则不要报告最终任务完成率。

### 步骤 3：为每个指标锁定明确的分母

设 `N_all` 为包括重试在内的全部执行尝试，`N_eval = N_all - N_invalid` 为可评估的尝试。设 `T_all` 为被调度的唯一任务数，`T_eval` 为在固定重试策略下具有有效任务级结果的任务数。在每个比率旁边同时报告计数。

```text
autonomous attempt success = N_autonomous / N_eval
assisted attempt success   = N_assisted / N_eval
attempt non-completion     = (N_failure + N_timeout) / N_eval
invalid-attempt rate       = N_invalid / N_all
first-attempt completion   = T_first_attempt_completed / T_all
eventual task completion   = T_eventual_completed / T_eval
operational task delivery  = T_eventual_completed / T_all
```

明确标注尝试级指标与唯一任务级指标；绝不要将尝试级比率称为工作流完成率。报告重试率和每任务尝试次数，使依赖重试策略的收益保持可见。检查可评估的尝试结果之和等于 `N_eval`，所有尝试结果之和等于 `N_all`，且任务汇总之和等于 `T_all`。

如果 `N_eval == 0`，请将所有尝试能力比率报告为 `unavailable`，而不是除以零，并将任何依赖这些比率的门槛标记为 `inconclusive`。对任何分母为零的指标应用相同规则，包括 `T_all == 0` 或 `T_eval == 0` 时的任务级比率。

### 步骤 4：如实呈现延迟与成本总体

分别报告自主完成延迟、人工辅助端到端延迟以及失败运行到达终态的时间。仅基于成功样本的 P50 并不是整体 P50，且子组中位数无法通过平均或加权来重建合并中位数。

仅基于逐次运行的观测值计算全运行百分位数，并说明如何处理超时。如果时长存在右删失，请报告删失策略或使用适当的生存分析估计。对 token 和成本指标应用相同的总体标签。

### 步骤 5：量化不确定性与可比性

对于随机性评估，在关键比率旁展示样本量以及区间或重复运行分布。对于比较，报告绝对差值，并验证双方是否共享步骤 1 中冻结的契约。如果数据缺失、条件不同或区间过宽，请使用 `inconclusive`，而不是选出优胜者。

### 步骤 6：将证据映射到预先声明的决策门槛

在查看结果之前定义就绪门槛，例如最低自主成功率、最高超时率、零关键安全违规以及延迟或成本界限。为每个门槛返回 `pass`、`fail` 或 `inconclusive`。

不要仅凭成功率推断生产就绪性。当未提供阈值或风险要求时，应说明就绪性尚未确定，并列出缺失的门槛。

## 示例

对于 120 个唯一任务、每个任务各一次尝试的情形，其中包括 12 次基础设施无效运行、48 次自主成功、24 次人工辅助成功、20 次失败和 16 次超时：

```text
Evaluable attempts:       108 / 120
Autonomous success:        48 / 108 = 44.4%
Assisted success:          24 / 108 = 22.2%
Attempt non-completion:     36 / 108 = 33.3%
First-attempt completion:   72 / 120 = 60.0%
Eventual task completion:   72 / 108 = 66.7% (no retries)
Operational task delivery: 72 / 120 = 60.0%
Infrastructure-invalid:    12 / 120 = 10.0%
Overall latency P50:       unavailable from subgroup aggregates
Readiness:                 inconclusive until gates are declared
```

## 最佳实践

- 将计数、公式、分母标签和排除项一并报告。
- 将自主能力与人工辅助的工作流完成率区分开。
- 即使发布的是有效运行得分，也要保留超时率和无效运行率。
- 将汇总指标与失败类别和代表性证据搭配呈现。
- 在做出因果性改进论断之前，先在同一冻结契约下重新运行两个候选对象。

## 局限性

- 此技能对所提供的评估证据进行结构化与解读；它不验证评估器本身，也不重建缺失的运行记录。
- 规模小或存在偏差的任务集可能产生看似精确但不具代表性的指标。
- 统计显著性并不能确立生产安全性、用户价值或可接受的成本。
- 当缺少验收阈值、严重程度策略或所需证据时，就绪性仍无法得出结论。

## 安全与保障说明

- 在报告中对凭据、私有提示词、个人数据和敏感的工具输出进行脱敏，同时保留稳定的证据引用。
- 将关键安全违规作为独立的发布门槛处理，而不是将其平均计入总体质量得分。

## 常见陷阱

- **问题：**人工辅助完成被呈现为自主成功。
  **解决方案：**分别发布自主完成率、辅助完成率和工作流完成率。
- **问题：**超时或无效运行从分母中消失。
  **解决方案：**在计算指标之前，将完整的结果台账与 `N_all` 进行对账。
- **问题：**更快的仅成功样本 P50 被呈现为更快的系统。
  **解决方案：**标注总体，并仅基于逐次运行数据报告全运行到达终态时间。
- **问题：**发布结论是在看到结果之后临时拼凑的。
  **解决方案：**应用预先声明的门槛，或返回 `inconclusive`。

## 相关技能

- `@agent-evaluation` - 设计行为测试、基准测试和可靠性评估。
- `@run-deep-swe` - 在报告其结果之前执行可复现的 DeepSWE 基准运行。
