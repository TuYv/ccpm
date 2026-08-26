---
name: better-harness
description: Use when /better-harness reviews the outer coding-agent Harness for lifecycle controls, repeated work, project feedback, agent assets, session outcomes, repair planning, durable reports, finding-bound fixes, or manual direct fixes. Invoke only via slash command.
---
# 更好的 Harness

审查 coding-agent 系统：上下文、执行、控制、反馈和学习；保持 Sessions、项目和 Agent 资产彼此独立。

## 步骤 1：确定范围并收集证据包

路由：
- `<better-harness-fix-output>`： [基于发现的修复](references/finding-bound-fix.md)。
- 没有回调，且以 `fix`、`repair` 或 `\u4fee\u590d` 开头： [手动直接修复](references/manual-direct-fix.md)。
- 审查/评估/报告，或混合审查与修复：步骤 1。

解析 Skill 路径，将 `<better-harness-root>` 设为 `../..`，解析受支持的 `<node>`，并将 `<cli>` 设为 `<node> <better-harness-root>/scripts/better-harness.mjs`。如果缺少任何一个所有者则停止；绝不要按搜索顺序选择其他缓存或运行时。

解析绝对目标、决策、验收边界、风险、区域设置（默认使用请求语言）、输出模式、提供商和深度。Quick 使用三个项目和 7 天；normal 使用五个项目和 30 天。默认将 Qoder/Cursor 设为持久化 Canvas，将其他渲染主机设为 HTML。不支持 REPORT_RENDERING 的提供商只能以内联方式或无文件方式继续，不得创建 HTML、Markdown 或 Canvas 输出。保持提供商彼此独立。除非项目级审查明确授权多个受支持的提供商，否则使用当前提供商。Qoder 项目 Memory 标题元数据属于所选工作区基线的一部分。Memory 正文、Codex Memory、Qoder 全局 Memory、用户主目录、原始 Session、已安装插件、市场以及历史洞察的访问都需要明确的范围授权。

在委派之前，为每个获授权的提供商收集一个带版本的证据包：

```text
<cli> harness evidence-bundle --platform <provider> --workspace <target> --cwd <effective-cwd> --language <locale> --depth <quick|normal> --since <window-start> --until <window-end> --format json [--include-memories] [--include-user-home] [--canvas-out <run-dir>/canvas.json]
```

仅对 Qoder/Cursor 的持久化报告使用 `--canvas-out`。对于 Qoder，保留默认的项目 Memory 标题扫描；`--include-user-home` 会将其扩展到已授权的全局 Memory/配置及其他用户资产。对于 Codex，Memory 元数据需要 `--include-memories`；用户/全局或已安装插件的元数据需要 `--include-user-home`。如果两个范围都已获授权，则同时应用这两个标志。这两个标志都不会授权访问 Memory 正文。

它会冻结拓扑、提供商、时间窗口、深度、限制和权限。在委派之前，读取 `bundle.context.topology.target`；报告 `kind`、`route` 和 `packageRoute`（`memberRoute` 或 `null`）。提供商之间必须保持一致。它会返回 `sessionEvidence`、`projectHarness`、`agentCustomize` 和主导封套。Agent Customize 包含来自同一个共享资产快照的有界 `lint`、`inventory` 和 `integrity` 封套。保持通道/阶段状态以及提供商彼此区分。只有在诊断某个明确命名的不可用阶段或证据丢失阶段时，才使用单独的 `session-analysis facts`、`core-change-watch evidence-pack`、`coding-agent-practices asset-baseline` 或 `harness analyze` 命令；不得将诊断输出替代证据包，也不得重新运行所有所有者。Rules、Skills、MCP、Memory、Agents、Hooks、Commands、Workflows 和 Plugins 的计数仅用于路由检查。计数为零或很高都不会产生发现或评分。如果完整性阶段不可用，且报告包含项目 Memories，则正常的 Qoder 报告会被阻塞；不要用 `unobserved` 处置来替代缺失的审查。

如果提供方发现或用户提供了历史洞察来源，负责人只能检查少量经过授权的架构/历史记录。
绝不能假定或搜索某个约定路径；记录无法证明当前行为、
已配置的能力或实际效果。

## 步骤 2：运行三轮独立证据收集

并行启动恰好三个全新的只读智能体。在 Codex 中使用
`spawn_agent`，并设置 `fork_turns: "none"`；否则在本地按照相同的任务简述分别独立运行。
任何证据智能体都不得委派工作。

### 2.1 会话证据

负责人从 `bundle.lanes.sessionEvidence.data` 获取提供方标记的事实信封，其生产采集器由
[会话诊断](../../references/session-evidence/sessions-diagnostics.md) 路由，
且只能使用生产环境的 `facts` 路由。不要将完整 bundle、
采集引用、调试输出或原始会话传递给智能体 1。

仅向智能体 1 提供提供方标记的事实信封、用于注意到 Skills 数量为零的精简步骤 1
资产计数，以及已解析的范围。要求它阅读
[会话证据](references/session-evidence.md)，并在重复流程需求属于范围内时有条件地阅读
[重复工作流发现](references/session-repeated-workflows.md)。
它不得检查项目、已配置资产、原始会话或其他任务简述。

### 2.2 项目 Harness 证据

仅向智能体 2 提供目标、限定范围的历史/当前变更边界、
`bundle.lanes.projectHarness.data`、决策、风险和所有者限制。要求它阅读
[项目 Harness 证据](references/project-harness.md)。不得向其提供
会话或智能体定制结论。

### 2.3 智能体定制证据

仅向智能体 3 提供 `bundle.lanes.agentCustomize.data` 及其中提供方标记的
lint、清单和完整性信封；资产权限；决策；风险；
以及所有者限制。要求它阅读[智能体定制证据](references/agent-customize.md)。它使用
确定性信封，不得重新运行其中的命令，也不得接收会话/项目结论。

每个智能体都遵循其参考文档中的自由格式返回契约：通常返回三到五个候选项，
快速模式下最多三个，证据稀疏时则更少。专家绝不分配最终严重性或分数。

在它们运行期间，只能使用 `bundle.lead.data` 作为负责人分析器的结果。
该 bundle 将 `--include-user-home` 映射到分析器的全局能力边界；
这会保留经过授权的 MCP、Plugin、Skill、Hook 和 Memory 计数，但不会授权读取内容，也不能证明实际使用。

如果 bundle 为 `failed`、负责人通道不可用，或其数据缺少
`evidence` 或 `summaryFacts`，则停止。在快速模式下，`partial` bundle 会降低置信度，
且每个不可用的专家都必须明确标出；在正常模式下，任何不可用或部分可用的专家通道都会阻止报告生成。
本轮证据收集最多只能委派三个智能体。

## 步骤 3：负责人协调与重新分级

阅读[Harness 发现输入](../../templates/reporting/harness-findings.input.json)
以了解字段职责，并阅读[智能体工作循环](../../models/agent-work-loop.md)以了解
五个维度、检查项、证据状态、评分和学习捕获规则。
替换所有示例内容。绝不要从之前的报告、
Memory、建议文件或验证器中推导该契约。

执行一次协调。首先保留每个专业候选项。  
仅合并目标、已观察到的后果、负责人和修复路径均相同的候选项；即使多个后果共享更宽泛的主题，也要保留彼此独立的后果。为每个不受支持或延期处理的候选项保留一个工作理由。绝不要为了达到五行、缩短报告、简化评分或匹配三个优先行动而丢弃符合条件的发现。然后仅由负责人：

- 验证后果、原因链、最小负责人、证据边界、置信度和验证者；
- 分配最终严重性，并指定一个主要的 Agent Work Loop 检查项；
- 独立于发现数量推导保守的维度评分；
- 在低置信度下保留分歧和不可用的证据；
- 写入每个彼此不同且有充分支持的发现，并在编排优先行动、修复提示或读者文案之前冻结最终严重性和维度评分。

起草前，阅读 [Findings Quality Gates](references/findings-review.md)，并直接应用其中的资格、一致性、隐私、资产、候选项晋升和修复提示检查。对于重复性流程或知识需求，还要阅读
[Asset Demand Reconciliation](references/asset-demand-reconciliation.md)。

不要在新报告中编写 `summary.suggestions`。只有当建议候选项通过与每个发现相同的后果、负责人、证据、输出、验证者和修复提示检查时，才将其提升为普通的 `Low` 发现；否则将其保留在工作协调中，延期处理。

在冻结发现和维度评分后，根据证据和请求的结果恰好选择一个支持轨道。括号中的范围是用户旅程标签，而不是评分阈值：

- **Bootstrap (0 -> 1)：** 明确请求了初始指导，或保留的发现表明缺少基础性的导航、验证或风险处理路径。
- **Operationalize (1 -> 60)：** 相关机制已经存在，但保留的发现表明它们尚未接入日常工作，或尚未通过某个结果得到实际运用。
- **Optimize (60 -> 100)：** 充分完整的 Session 证据中，针对重复目标或摩擦点，至少包含两个彼此不同且可比较的 Task Episode。
- **Undetermined：** 选择轨道所需的证据不可用。

只阅读所选轨道：[Bootstrap Support](references/support-bootstrap.md)、[Operationalize Support](references/support-operationalize.md) 或
[Optimize Support](references/support-optimize.md)。一个轨道最多只能为已有支持的发现拟定三个优先行动、修复提示和读者文案。它不得新增发现、改变严重性、重新评估维度、添加报告字段，或扩大证据和变更权限。

对于持久化报告，仅在三个证据代理完成后起草 `findings.json`。不要启动第四个审查代理。负责人执行一次质量门检查，保留所有符合条件的发现，并在渲染前修复任何机器验证失败。

## 报告输出 — 第 4 步：渲染已获授权的报告

内联分析不写入任何内容。通过前置检查后，将草稿视为唯一的
最终 `findings.json`，然后渲染并验证一次：

```text
Qoder/Cursor: <mode>=<provider>-canvas; <host-root>=<target>/.<provider>/better-harness
Other providers: <mode>=html; <host-root>=<target>/.<provider>/better-harness
<cli> harness render --findings <run-dir>/findings.json --mode <mode> --out <host-root> --run-dir <run-dir> --target <target> --validate --json
```

Qoder/Cursor 分析负责相邻的 `canvas.json`；不要将其中的
`summaryFacts` 复制到 findings 中。HTML 原样保留分析器的 `summaryFacts`。
仅当 `status: pass` 时才算成功，并返回 render 报告的确切路径。绝不要手写
Canvas、Markdown 或 HTML。

最后用一个简洁的句子结束：`<count> findings. [Open the report](<renderer-path>).`
链接到渲染器报告的主报告；绝不要返回内联代码路径、单独的目录或输出文件清单。

## 步骤 5：后续跟进

- 基于 Finding 的修复使用[基于 Finding 的修复](references/finding-bound-fix.md)；
  独立的修复后代理可以更新已验证的 finding 状态和 Repair Progress；
  Loop Effectiveness 需等待可比较的后续 Task Episodes。
- 使用情况/模型问题只运行一次 `session-analysis usage-summary`。
- 重复工作通过
  [Loop Discovery](../../references/loop-engineering/loop-discovery.md)继续。
- 路由：[Agent Customize](../../references/agent-customize/routing.md)、
  [Core Change Watch](../../references/project-harness/core-change-watch.md)、
  [Report Routing](../../templates/reporting/routing.md)、
  [Source Review](references/report-source-review.md)。

持久路由仅授权在其 host root 中创建由渲染器负责的工件。
其他创建、激活、修改、清理、调度、外部写入和高风险访问都需要任务本地授权。
如果所有者或值未确定，则以恢复条件停止；不要臆造替代工件，也不要检查
内部验证器。