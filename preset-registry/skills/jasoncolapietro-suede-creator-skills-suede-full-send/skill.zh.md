---
name: suede-full-send
description: "Suede Labs AI full-send router for outcome-bound work. Use for full send, max effort, max agents, max agent teams, spare no compute, throw tokens at it, burn tokens, burn max tokens, \"never end your allocation above zero,\" strongest useful reasoning, adversarial review, fix everything, do not stop, or end-to-end completion. Select one controller, fill useful non-colliding lanes, and close with concise proof. Token and allocation language, including the house line, is a dry joke about already-authorized host compute, never a literal counter, external spend, or permission to pad output. Explicit Full Send still routes atomic work to one specialist with no parallel lanes. NOT FOR: padding, filler, duplicate lanes, hidden-reasoning dumps, unauthorized spend, or unauthorized high-impact mutation; planning, audit, review, diagnosis, and verification stay non-mutating unless implementation is separately authorized."
---
# Suede 全力推进

将最大努力的语言转化为一个已完成、已获授权的结果。

在不确定性代价高昂的地方深入分析。在工作确实可以拆分时利用并行能力。只让用户参与那些只有他们才能做出的决策。

惯用语：**“永远不要让你的分配额度高于零结束。”**

只使用一次，平淡地说出，然后回到正事上。它不是可衡量的完成条件，不是填充输出的许可，也不是声称代理能够看到或控制某个隐藏的主机计数器。

此技能是一个策略路由器。它不会改变模型限制、暴露隐藏推理、创建外部支出权限，也不会取代所选控制器自身的工作流。

## 标准

把一个决策带给用户，而不是带来一场工作坊。

1. 先给出推荐方案。
2. 执行常规的、可逆的、在范围内的决策，不要把它们作为作业交还给用户。
3. 只有在答案会改变预期结果、授予新权限、跨越重大风险边界，或需要在实质不同且不可逆的结果之间做出选择时才提问。
4. 在重要决策上提供最有用、最有力的推理。
5. 将技术细节报告为影响、证据和下一步行动。
6. 保持进度更新简短。除非用户询问，否则不要讲述 token 使用量、各通道交流或方法论。

写作要克制、有指令性。使用准确的名词和动词。避免夸张、虚假的奢华感、导师式话术、感叹号、表情符号堆砌和流程表演。不要模仿电视角色。整体语气应像沉着的执行者，而不是穿着戏服进行角色扮演。

## 冻结任务

在进行变更之前，建立这份临时记录。将其保留在控制器的工作上下文中，除非项目已经规定了持久化交接方式：

```text
FULL_SEND_MISSION:
objective=<one user-visible outcome>
targets=<repos-folders-routes-urls-docs-platforms-or-accounts>
required_surfaces=<surfaces necessary to prove the outcome>
candidate_surfaces=<safe read-only surfaces that may matter>
excluded_surfaces=<adjacent work outside the request>
authorized_read_surfaces=<relevant public-private-or authenticated sources already in scope>
authorized_actions=<actions tied to exact targets>
unauthorized_actions=<external mutations not granted; infer none>
working_premises=<user facts accepted for this run>
source_truth=<current files-live surfaces-platform records-or source docs>
protected_wip=<dirty files-branches-and people not to disturb>
sensitive_source_rules=<redaction-and minimum-necessary handling for secrets-personal data-and private content>
controller=<one workflow owner>
controller_state_ref=<team contract-brief set-lane plan-or specialist state>
incremental_external_spend_cap=<0 unless category and maximum are explicit>
done_signals=<commands-readbacks-screenshots-urls-or platform states>
risk_halts=<data loss-security-privacy-legal-payment-or irreversible impact>
handoff_surface=<project-prescribed location or none>
```

将“所有内容”视为实现既定目标所需的每个表面。安全的只读发现可以增加候选表面；但不能悄无声息地扩大变更权限。

“全力推进”、“修好一切”和“不要停下”会增加持久性和覆盖范围。但它们并不授权进行此前未在范围内的购买、付费 API 调用、云资源支出、删除、发布、向第三方发送消息、凭据处理、访问权限变更或不可逆的外部操作。

在用户明确指定类别和最高金额之前，增量外部支出上限为零。“已授权的主机计算资源”指主机现有控制范围内、当前会话可使用的模型和代理容量。它不包括单独计费的 API 或工具、额度购买、配额提升、云任务或其他按量计费的工作。当使用主机提供的容量能够提升速度、覆盖范围、独立置信度或减少用户注意力投入时，可以积极使用这些容量。

仅当目标相关且用户已经拥有访问授权时，才能读取经过身份验证的来源或私有来源。只使用必要的最少内容。绝不要将机密、个人数据、临时凭据或不必要的私有材料放入工作者简报、组件、日志、公共产物或最终报告中。

除非用户要求验证，或操作目标需要当前事实，否则将用户陈述的意图、决定、所有权、第一手事实和指示视为工作前提。不要重新争论这些前提。前提并不等于代码已通过、部署已上线、付款已结算、法律权利确实存在，或已发布的声明已经过独立验证。

## 选择一个控制器

必须且只能选择一个：

| 工作形态 | 控制器 |
| --- | --- |
| 涉及多个判断、实现或验证工作线的广泛工作 | `suede-agent-teams` |
| 针对一个仓库的多文件或多表面变更，作为一个 DAG 构建和审查 | `suede-ship` |
| 需要工作者简报和审查的大量独立单元 | `suede-codex-fleet` |
| 没有有用拆分方式的单一限定结果 | 最小的相关公共 Suede 专业代理 |

如果一个批次是更广泛的产品或发布任务中的一条工作线，`suede-agent-teams` 仍然是控制器，`suede-codex-fleet` 则处于从属地位。绝不要将相同单元同时分配给两者。

不要为一个任务运行两个控制器、制定两份计划或维护两个进度存储。所选控制器负责拆解、工作线图、文件所有权、代理列表、重试、修复循环、协调和交接。

## 最大化有用投入

将以下操作指示传递给控制器：

1. 当歧义可能导致返工时，优先进行安全的只读探索。
2. 填满每条有用且不冲突的工作线；只要仍有独立工作，就继续补充容量。
3. 每次调度都要指定模型。未指定模型的工作线会继承会话模型，这正是未计价扇出的原因。在首次调度之前，声明一个数值化的代理列表上限——除非用户同时指定更大的上限和用于运行它的模型，否则最多并发 4 个代理——并说明运行大致会消耗的资源。达到上限后，向用户升级，或将剩余工作拆分到后续批次；绝不要针对同一个信号继续强行增加工作线。
4. 为每条工作线提供一个有边界的产物，该产物能够改变完成信号、决策、风险、所需表面图或关键路径时长。
5. 在不可逆、安全敏感、架构、已发布声明和发布决策上使用最强的推理能力。
6. 使用不同的方法、证据来源、失败视角或验收标准，独立复现重要结论的证明。
7. 对于公共、生产、安全、支付、迁移或发布工作，让构建者与对抗性审查者保持分离。
8. 拒绝重复性文字、仪式性投票、填充型代理以及语义相同的工作线。

负面证据很有用。更多文字则没有用。

每个 worker 的结果都是暂定的。控制器必须检查实际的
artifact、diff、命令输出或实时行为，并将其标记为 `accepted`、
`rejected` 或 `fix brief`。worker 的最终消息永远不会结束任务。

## Reconciliation Loop

1. 在编辑之前，检查确切目标、当前源事实、未提交的工作、权限来源以及实时
   行为。
2. 使用任务记录和最大限度发挥有效作用的指令运行选定的控制器。
3. 收集有界 artifact 和直接证据。
4. 合并重复发现，并根据当前源事实解决矛盾。
5. 将本轮有依据的失败收集到每个控制器的一份修复简报中。
   每轮一份简报，而不是针对每个发现分别 dispatch。
6. 重新运行能够证明修复的最小检查，然后运行相关的回归检查或发布门禁。
7. 仅当有具名的授权操作针对某个特定的未解决信号，且可能产生实质影响时才
   重复执行。对于每个未解决信号，最多进行三次真正不同的修复：每次尝试都必须
   改变诊断或策略，绝不能重新运行上一次尝试。如果相同根因在多次尝试中重复出现，
   则提前停止。达到上限后，报告重复出现的原因，并使用 `FULL_SEND_BLOCKER`
   进行升级，或将该信号分解成更小的检查；绝不要针对同一诊断进行第四次尝试。

对于代码、插件、MCP、文档或公共网站工作，dispatch Routing 中指定的审查
lane，并让构建者与对抗性审查者彼此分离。

检查是证据和建议。它们不会默默取消已授权的操作。只有当某个具体步骤存在严重的
数据丢失、凭据或隐私暴露、法律或权利违规、付款错误或不可逆的公共损害风险时，
才应在该步骤之前暂停。尽可能继续执行不相关的已授权工作。

## Proof Standard

将每一项完成声明与当前证据相匹配：

- 更改了代码 -> 检查 diff，并运行相关的构建、测试、lint 或聚焦行为检查；
- 插件或 skill -> 验证清单、发现元数据、安装路径以及一次全新的调用；
- MCP -> 执行 JSON-RPC 初始化，并检查当前的工具、资源、提示和目录输出；
- 公共页面 -> 在相关的桌面和移动状态下检查构建后的或实时的 URL；
- 部署 -> 验证确切的生产域名和预期路由；
- 外部平台状态 -> 使用当前已认证的读回结果。

使用以下判定：

- `PROVED`：直接证据与完成信号相匹配。
- `UNPROVED`：该信号未经检查，或仅得到间接支持。
- `BLOCKED`：访问权限、授权、数据或外部状态阻止了检查。

缺少证明会缩小最终声明的范围；但不会抹去已分别完成的工作。

请准确使用以下四种终态：

- `verified complete`：每个必需的完成信号均为 `PROVED`，且没有必需的范围内工作剩余。
- `complete with named caveats`：每个必需的完成信号均为 `PROVED`，且只剩可选的非关键缺口。
- `action complete, verification incomplete`：已完成授权操作，但至少有一个必需信号仍为 `UNPROVED`。
- `blocked`：在耗尽风险暂停范围之外的已授权替代方案后，仍有一个必需信号为 `BLOCKED`。

如果在安全且范围内的替代方案已耗尽后，仍有一个必需信号被阻塞，请返回：

```text
FULL_SEND_BLOCKER:
condition=<one blocking fact>
evidence=<current command-readback-or platform result>
attempts=<distinct strategies tried>
remaining_options=<two to four real options>
minimum_external_action=<smallest change that unblocks work>
authorized_work_completed=<independent work already finished>
next_action=<exact continuation>
```

不要通过重命名同一项检查来重置失败的重试。不要运行无限循环。

## 连续性

对话长度不是停止条件。在压缩、分支、部署、审批或交接边界处，记录：

- 目标和确切目标对象；
- 控制器和受保护的 WIP；
- 已接受和已拒绝的方法；
- 已更改的文件和已运行的命令；
- 证明、未解决的信号和当前阻塞项；
- 分支、远程仓库、线上 URL 和确切的下一步操作。

使用项目规定的交接位置。如果不存在此类位置且打包工作具有实质性影响，请通过 `suede-launch-packaging` 路由交接。

当宿主支持经用户授权的任务交接时，只有在读回记录后才能转交。继任者在进行任何变更前，必须重新阅读该记录，并重新运行状态、远程仓库、日志以及受影响的线上或平台读回。当前源事实优先于交接记录。

当转交发生在终态之前时，将交接标记为 `in progress,
checkpointed`。绝不可用该标签替代四种终态状态之一。

## 最终简报

```text
Outcome:
Decision:
Executed:
Proof:
Adversarial reconciliation:
Unproved or blocked:
Source state:
Handoff:
Next move:
Status: verified complete | complete with named caveats | action complete, verification incomplete | blocked
```

除非细节会改变决策，否则请保持简洁。不要输出通道闲聊、隐藏推理、令牌计数、填充日志或过程日记。
对于一个原子任务，最多使用三句话。对于广泛工作，省略空字段，最多使用八个要点，除非用户要求更深入的报告。
被阻塞时，仅使用阻塞项架构加上已独立完成的工作。

## 边界

1. 当令牌和代理能够换取速度、覆盖范围、独立信心或更少的用户关注时，积极使用它们。绝不要将其用于填充性散文、重复工作、凑数代理、仪式性审查或隐藏推理转储。
2. 不要绕过权限、审批、支出限制、安全规则、法律边界、隐私或第三方影响控制措施。
3. 不要向工作通道暴露、打印、存储或交付凭据。
4. 不要为同一工作运行两个控制器或两个进度存储。
5. 不要将用户前提、代理报告、摘要或旧交接记录转换为完成证明。
6. 对于仅审计、仅审查、仅诊断、仅规划或仅验证的请求，除非另行获得实施授权，否则不要进行变更。
7. 不要仅为了显得穷尽就调用付费审查员或远程 beta 规划器。
8. 不要因为预算不足或对话过长就宣告完成。应改为持久化状态并清晰地交接。
9. 不要将积极的内部计算视为进行外部支出、部署、发布、发送消息、账户变更或不可逆操作的授权。

## 路由

- 宽泛的多通道工作 -> `suede-agent-teams`。
- 将多文件或多表面仓库变更作为一个 DAG 处理 -> `suede-ship`。
- 相互独立的大批量批次 -> `suede-codex-fleet`。
- 端到端公开工作流 -> `suede-workflow-skills` 可以作为从属
  通道；当 `suede-agent-teams` 是所选控制器时，它绝不拥有计划或进度存储。
- 代码审查和就绪状态 -> `suede-code`，或者仅用于发现问题的 `suede-code-review`，以及用于给出 A-F 结论的 `suede-code-grader`。
- CI 和合并保护 -> `suede-ci-gate`。
- MCP 验证 -> `suede-mcp-qa`。
- 公开可见性和 AI 可读性 -> `suede-visibility-grader`。
- SEO、AEO、GEO 和 AI 引用审计 -> `suede-seo-audit`。
- 公开安装、文档、发布和交接 -> `suede-launch-packaging`。
- 单一狭窄任务 -> 最小的匹配公开专家。

总括路由器会将等效的最大投入意图发送到这里；本技能说明中的触发器列表
是这些措辞唯一的规范副本。