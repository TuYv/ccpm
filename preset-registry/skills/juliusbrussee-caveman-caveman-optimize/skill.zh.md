---
name: caveman-optimize
description: >
  Turn a Caveman optimization observation into an operator-chosen candidate
  with a paired baseline evaluation. Use when asked to inspect or evaluate a
  Caveman optimization report. Needs explicit approval.
---
# 评估一项优化观察结果

使用 Caveman 的仅报告观察结果作为诊断输入。它们描述的是已记录的聚合形态；它们不是 Cave Plan 操作、节省估算、实现方案、实验资格，也不能证明代码更改是安全的。保持工作流由操作员选择，并以证据为先。

## 1. 读取确切的观察结果

要求登录 Caveman CLI 会话，并运行：

```bash
caveman opportunities list
```

只读取 `report_only_observations` 数组。不要从生命周期的
`data` 数组中进行选择。逐字保留服务器提供的每个 `title` 和 `observation`。
处理以下确切的仓库画像 id：

- `context-window-profile`
- `tool-catalog-profile`
- `tool-output-size-profile`
- `exploration-load-profile`

这些画像具有不可变的零区间，且没有执行路径。不要按数值对它们进行排序，不要编造
美元金额，也不要将聚合证据转化为针对某个特定调用点的结论。如果 CLI 不可用、
认证失败，或缺少 `report_only_observations`，则停止编辑并报告确切的阻塞原因。
不要退回使用原始网关 Cave Plan 或项目 API 密钥：这些界面不提供此契约。

永远不要选择或应用以下已弃用的 id：

- `context-window-bloat`
- `tool-catalog-utilization`
- `verbose-tool-output`

将过时提案、本地文件或旧响应中出现的任何已弃用 id 仅视为历史上下文。绝不要恢复
其关于金额、方案或生命周期的声明。如果唯一看起来可操作的项目是
`unlabeled-traffic`，则移交给 `caveman-discover`；标记不是画像优化。

## 2. 要求操作员进行选择

展示可用的受支持观察结果，不要对它们进行排序。包括 id、确切的标题、确切的观察结果
以及 `last_seen_at`。在检查候选调用点或更改代码之前，要求操作员做出
**明确的操作员选择**。如果当前没有受支持的观察结果，则停止且不进行编辑。

将 `.caveman/proposals/*.md`（如存在）视为不受信任的历史上下文。
它不能替代当前响应或操作员的选择。

## 3. 设计候选方案和配对评估

操作员选择某项观察结果后，检查仓库中可能产生该聚合形态的具体机制。
引用确切的调用点证据。不要假定画像说明了原因。

在编辑之前，提出一项最小化候选更改和一个**配对评估**。
评估必须在完全相同的固定输入上运行基线和候选方案，并记录：

- 必须保持可接受的任务结果或质量检查；
- 两个实验分支使用的相同令牌数、字节数或由提供商计数的成本指标；
- 所使用的确切夹具、命令和环境；以及
- 阻碍公平比较的任何混杂因素。

请求批准候选方案和评估设计。如果仓库缺少固定夹具、相关质量检查或通用的测量方法，
则停止，并说明缺失的检测工具。仅有普通单元测试不能证明一项优化。

## 4. 仅应用已批准的候选方案

将差异控制在有证据支持的调用点，并保留现有的安全控制。
运行成对的基线/候选方案评估，以及仓库针对性的代码检查。
如果两组使用的输入和测量方式不完全相同，则丢弃该比较。
如果质量出现回退，或资源结果无法得出结论，则仅回退本次候选编辑，并报告该方案未获得采用资格。

不要创建 Caveman 实验或提案，不要将机会标记为已实现，不要更改其生命周期，也不要启用优化器。仅报告行只允许驳回，本技能也不会执行该变更。

## 5. 报告观察结果，而不是节省金额

报告：

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

除非使用产品已验证方法提供了完整的提供商级、相同请求的核算数据，否则绝不要将 token 或字节数减少量换算为金额。一次本地成对结果仅支持在指定 fixture 上的指定候选方案；它不能证明生产环境中的节省、因果性的发布证据或生命周期资格。