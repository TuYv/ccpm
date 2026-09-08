---
name: agent-evaluation
description: "Evaluate agent behavior with versioned cases and explicit verifiers. Use when comparing agent or prompt changes, reproducing failures, or running agent regression tests."
risk: safe
source: vibeship-spawner-skills (Apache 2.0)
date_added: 2026-02-27
---
# 智能体评估

针对特定任务的用例评估可观察的智能体行为。由 AAS 维护者于 2026-09-05 修改，移除了不受支持的基准测试声明，更正了不确定性/错误报告方式，并将可选的架构草图与操作流程分离。

## 何时使用

在比较已更改的智能体、提示词或工具配置、复现观察到的失败，或在声明的任务分布上估计可靠性时使用。不要根据公开基准测试的百分比或通用的分数阈值推断产品是否就绪。

## 前提条件

- 带有预期可观察结果和权限边界的版本化用例集。
- 已知的基线与候选修订版本，包括模型、提示词、工具、配置和运行时版本。
- 经授权的合成或脱敏输入、隔离的目标环境，以及有界的 token、时间和成本预算。
- 能够区分错误结果、预期的安全拒绝、评估器故障和基础设施中断的验证器。仅当声明的评估会调用某个提供商时，才需要该提供商的访问权限。

## 评估流程

1. **冻结契约。** 在执行之前记录用例 ID 和数据集修订版本、基线/候选标识、目标环境、重复计划、预算、停止规则和决策标准。将关键的安全与授权失败与平均质量分开处理；它们不能被更高的分数抵消。
2. **验证测试装置。** 运行一个已知通过的用例、一个已知失败的用例，以及一次故意触发的验证器/基础设施故障。确认每一项都被正确分类，且轨迹留存不包含凭据和私有输入内容。如果分类有误，先修复测试装置并重复这些检查，然后再测量智能体。
3. **运行已冻结的用例。** 对基线和候选使用相同的用例定义和预算，并使用独立的夹具状态和已记录的执行顺序。保留每一次尝试及其运行 ID、结果、原因、延迟和资源总量。异常并不能证明不安全的请求已被安全拒绝。
4. **调查差异。** 保留原始失败。将不一致归类为智能体行为、共享状态污染、验证器歧义或一次服务中断。只使用预先声明的重复预算；不要重试直到通过为止、悄悄丢弃失败，或为了让候选通过而更改预期结果。未解决的测试装置故障会使受影响的结果无法定论。
5. **比较并决策。** 报告逐用例的结果和不确定性、回归、关键失败以及未完成的用例。同一用例的重复运行并不是任务分布的独立样本。更改预期需要经过单独评审的契约修订，并重新运行基线和候选两者；保留旧结果。
6. **修复并验证。** 进行一次有界的修复，重新运行失败用例以验证机制，然后从干净状态重新运行适用的冻结回归套件。如果分歧仍然存在，则在声明的预算处停止。连同确切证据一起记录通过、失败或无法定论；项目的发布/部署审批边界需另行遵循。

## 示例：变更后的工具参数处理

一个合成智能体更改了其在只读查询中选择租户标识符的方式。冻结三个用例：授权查询必须返回预置的夹具数据；未授权租户必须在没有任何工具调用的情况下被拒绝；模拟的工具中断必须被归类为基础设施故障。既不提供真实客户记录，也不提供生产凭据。

预先声明每个用例在全新状态下重复运行五次、基线与候选使用相同预算，并且对未授权工具调用零容忍。假设候选在全部五次运行中都返回了预期的授权结果，但在第二个用例中发起了一次未授权调用：那么即使其总体成功率有所提升，该候选仍然未通过权限契约。保留该次运行，修复参数授权，验证否定用例，然后重新运行冻结套件。如果中断检测器本身崩溃，则将该用例标记为无法定论，并在比较版本之前修复检测器。这些是示意性的结果，并非实测的智能体结果。

预期输出：

```text
contract: case-set revision, rules, repeat plan and budget
versions: baseline, candidate, model, prompt, tool and runtime
runs: one record per attempt, classified outcome and bounded evidence reference
comparison: per-case results, uncertainty, regressions and critical violations
decision: pass | fail | inconclusive; reason; unresolved work
```

## 不确定性演算示例

十次独立试验中的十次成功并不能证明 100% 的可靠性。这个无依赖的辅助函数返回近似的 95% Wilson 区间；对于 10/10，它约为 `[0.7225, 1]`。当试验次数为零时，它会拒绝该输入。

```javascript
function wilson95(passes, trials) {
  if (!Number.isSafeInteger(passes) || !Number.isSafeInteger(trials)
      || trials <= 0 || passes < 0 || passes > trials) throw new Error('Invalid counts');
  const z = 1.959963984540054;
  const p = passes / trials;
  const denominator = 1 + z * z / trials;
  const center = (p + z * z / (2 * trials)) / denominator;
  const margin = z * Math.sqrt(p * (1 - p) / trials + z * z / (4 * trials * trials)) / denominator;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}
```

预期检查：0/10 的上界为正；10/10 的下界小于 1；0/0 会失败。当重复运行共享用例或状态时，应使用用例级或聚簇的不确定性；将相关的运行汇总为独立观测会高估置信度。参见 [NIST 区间指南](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm)。

## 可选架构模式

仅在设计自定义测试装置时，才阅读随附的[架构草图](references/architecture-sketches.md)中的相应章节：

- [统计评估](references/architecture-sketches.md#statistical-test-evaluation)：重复的随机运行和描述性报告。
- [行为契约](references/architecture-sketches.md#behavioral-contract-testing)：预期行为和不变式。
- [对抗测试](references/architecture-sketches.md#adversarial-testing)：合成的、经授权的边界用例；关键词检测器需要经过评审的假阳性和假阴性示例。
- [回归流水线](references/architecture-sketches.md#regression-testing-pipeline)：基线/候选产物的比较。
- [陷阱](references/architecture-sketches.md#sharp-edges)：数据集不匹配、不稳定性、代理指标以及可能的泄漏。

这些类需要针对具体应用的适配器，并不是复制即可运行的实现。所列的任何工具、相关技能或委托都不是必需的依赖。

## 局限性

- 架构草图中的示例性 80/90% 阈值和分数权重并不是通用的合并/部署规则；请定义项目专用的标准，并将关键失败单独处理。
- 小样本卡方比较或显著性缺失并不能证明等价性；请使用适合计数、配对和多重比较的方法。
- 异常并不等同于自动的安全拒绝，测试重试不得抹除第一次失败。
- 与检索到的答案相似可能是合法的 RAG 行为；是否泄漏取决于评估允许智能体知晓的内容。
- LLM 评审不能替代真实用户反馈，输出截断也不会移除私有数据。请使用合成或经授权的脱敏输入，并进行有界留存。
