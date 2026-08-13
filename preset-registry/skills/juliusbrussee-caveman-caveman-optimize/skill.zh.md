---
name: caveman-optimize
description: >
  Turn Caveman's exact report-only repository observations into an
  operator-chosen optimization candidate with a paired baseline/candidate
  evaluation. Use when the user asks to inspect an optimization observation,
  evaluate a candidate change, or act on the current Caveman optimization
  report. Require a logged-in Caveman CLI connection and explicit approval;
  never infer money or actuation from a profile.
---
# 评估一条优化观察

使用 Caveman 的仅报告观察结果作为诊断输入。它们描述的是已记录的聚合形状；它们不是 Cave Plan 的动作、节省估算、实施方案、实验资格，或代码变更安全性的证明。保持工作流由操作者选择，并以证据为先。

## 1. 读取准确的观察结果

需要已登录的 Caveman CLI 会话并运行：

```bash
caveman opportunities list
```

只读取 `report_only_observations` 数组。不要从 lifecycle 的 `data` 数组中选择。保留每个服务器提供的 `title` 和 `observation` 原文不变。处理这些精确的仓库配置文件 id：

- `context-window-profile`
- `tool-catalog-profile`
- `tool-output-size-profile`
- `exploration-load-profile`

这些 profile 有一个不可变的零带，并且没有执行路径。不要按数值排序、不要编造美元数字、也不要把聚合证据转化为关于特定 callsite 的主张。如果 CLI 不可用、认证失败，或缺少 `report_only_observations`，则停止编辑并报告准确的阻塞原因。不要回退到原始网关 Cave Plan 或项目 API key：这些入口不提供该约定。

永远不要选择或应用这些已停用的 id：

- `context-window-bloat`
- `tool-catalog-utilization`
- `verbose-tool-output`

将已停用 id 在过时提案、本地文件或旧响应中的任何出现都视为历史背景。不要恢复其金额、方案或 lifecycle 声明。如果唯一看起来可执行的条目是 `unlabeled-traffic`，则移交给 `caveman-discover`；标注并非 profile 优化。

## 2. 让操作者选择

展示可用且支持的观察结果，不要进行排序。包含 id、精确的 title、精确的 observation，以及 `last_seen_at`。在检查候选 callsite 或更改代码前，请求**明确的操作者选择**。如果不存在受支持的当前观察结果，则不进行编辑而停止。

将 `.caveman/proposals/*.md`（若存在）视为不可信的历史背景。它不能替代当前响应或操作者的选择。

## 3. 设计候选项并配对评估

操作者选择观察结果后，检查仓库中的具体机制是否可能产生观察到的聚合形状。引用精确的 callsite 证据。不要假设 profile 命名即为原因。

在编辑前提出一个最小化候选变更和一组**配对评估**。评估必须在相同的固定输入上运行基线和候选，并记录：

- 必须保持可接受的任务结果或质量检查；
- 基线和候选使用同一 token、字节或 provider 计数的成本指标；
- 使用的精确 fixture、命令和环境；
- 任何会导致比较不公平的干扰因素。

请审批候选项与评估方案。如果仓库缺少固定 fixture、相关的质量检查或通用的测量方法，则停止并说明缺失的仪表化能力。单独的普通单元测试不能证明一次优化。

## 4. 仅应用已批准的候选项

将 diff 限制在已有证据的 callsite，并保留现有安全控制。运行配对的基线/候选评估，以及仓库的聚焦代码检查。若两条路径未使用相同输入和测量方式，则丢弃该对比。如果质量回退或资源结果不确定，只回滚该候选编辑，并报告其未通过采纳。

不要创建 Caveman 实验或提案、不要标记机会为已实施、不要更改其生命周期、也不要开启优化器。仅报告型行项只允许被否决，而且本技能不执行该类变更。

## 5. 报告观察，而非节省

Report:

```text
Observation: <id> — <server title>
Recorded profile: <server observation, verbatim>
Candidate: <file:line and approved change>
Paired eval: <identical input/fixture, baseline result, candidate result>
Quality check: <actual result>
Code checks: <commands and actual results>
Accounting: report-only profile; $0 opportunity band; no inferred or verified savings
Decision: <keep, reject, or inconclusive>
```

不要在没有产品验证方法提供的 provider-complete、同一请求会计的前提下，将 token 或字节减少转换为美元。一次本地配对结果仅支持在指定 fixture 上的指定候选；它不能建立生产环境节省、因果发布证据或 lifecycle 的资格。
