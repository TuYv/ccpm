---
name: verification-before-completion
description: "Use when about to claim work is complete, fixed, passing, verified, release-ready, or ready to commit, merge, publish, or hand off."
---
<EXPLICIT-MODE-GATE>
如果激活模式为显式模式（`~/.config/aegis/config.toml` 中存在
`activation_mode = "explicit"`，或环境中可见
`AEGIS_ACTIVATION_MODE=explicit`），且当前用户请求未明确以名称调用
Aegis 或此技能，则退出并返回快速路径：简洁作答，不使用此工作流的检查清单、
流程仪式或文档要求。如果用户明确提到了 Aegis 或此技能，则正常继续。
</EXPLICIT-MODE-GATE>

# 执行

在作出任何成功声明之前，先对破坏性权限需求进行分类，选择并运行一次新的证伪检查，
读取其完整结果和范围，然后选择 L0/L1/L2。
如果证据不完整、过时、失败，或覆盖范围小于声明范围，则降级；绝不能先声称完成、
再进行验证。

此方法包不授予权威的 `GateDecision`、`PolicySnapshot`、
证据充分性、需求验收或完成授权。

## 停止信号

出现以下情况时，在作出声明或推进之前停止：

- 证据不确定、过时、仅来自代理，或覆盖范围小于声明范围；
- 下一步操作是 commit、push、PR、merge、tag、publish、release 或 handoff；
- 将任务/切片完成视为已满足验收需求；
- 治理或退役缺少修复/退役证据；
- 保留的旧逻辑缺少保留理由和退役触发条件；或
- 复杂度收敛尚未解决。

破坏性或不可逆的工作需要经过范围限定的许可；警告或笼统同意不构成授权。

## 必需的证据槽位

保持以下槽位明确且可审计：

```text
- Evidence action / check performed:
- Result / exit status:
- Covered scope:
- Uncovered scope:
- Residual risk:
- Confidence grade: A | B | C
```

- `A`：直接目标证据加相关回归证据；不存在有意义的未知项。
- `B`：有界残余风险下的直接目标证据。
- `C`：仅有部分证据；不得声称已完整完成。

当测试影响声明范围时，应包含目标测试和相关回归证据。
将回归测试放在能够复现真实缺陷模式的接缝处，使其在调用点呈现实际发生的情况；
过浅、无法复现触发链的接缝会造成虚假信心。如果不存在这样的接缝，则将缺失的接缝
记录为发现项（架构阻止对该缺陷进行锁定），并降低信心。
如果自动化受阻，则提供可复现的手动步骤并降低信心。
证据不等同于完成授权。

当完成声明依赖于明确的基线、构件、所有者、契约或证据引用时，读取最小相关来源。
对于受影响的已知引用，验证其处置方式：保留、重新绑定到规范所有者、说明理由后退役，
或因冲突而拒绝。将未解决的引用留在未覆盖范围内，降低信心，并且不得重新推断这些引用。
此次回读不能证明关系图完整、引用完整性成立或谱系具有权威性。

## 任务 Git 收尾

对于修改任务，将最终状态与 `TaskStartSnapshot` 进行比较。只有协调者可以暂存任务所有路径；
绝不使用宽泛暂存，也不得包含用户预先存在的状态。默认情况下，在完成新的验证后执行本地任务提交，
除非任务是只读/无变更、用户/项目授权规定 `no commit`，或验证失败。
读取回 `HEAD`、消息、文件和剩余任务差异。
提交/钩子失败会保留工作并阻止作出干净完成声明；不得绕过钩子。

Git 回执报告分支；提交 SHA/消息或非提交原因；
`Task clean`；`Repository clean`；以及每个由任务创建的分支/工作树是
已创建、已移除还是予以保留，并说明原因。Task-clean 从不意味着 repo-clean。
此回执是证据，而不是外部集成或完成状态的裁定依据。

在声明验证稳定性之前，先对提交范围进行分类：`business`、
`process-only`、`mixed` 或 `no-commit`。失败尝试遥测数据不是
提交原因。仅限于 `docs/aegis/` 流程记录的差异不会重新启动
已经完成的业务代码验证；业务代码或测试差异会重新启动验证。

## Aegis 可见性 / 单一收尾

使用一个完成界面；不要并行生成最终报告。
`verification-before-completion` 是唯一的完成收尾聚合器。
相邻技能和 L2 卡片会为回执提供信息，但不得取代回执，也不得成为
另一个最终报告的负责人。
回执聚合属于输出符合性，而不是路由触发器：不要仅为填充回执而
加载额外技能、输出 Trace Digest 或增加仪式性步骤。

如果省略了入口可见性，则恢复决策/证据边界并指出该缺口；技能使用列表
或 `Aegis Contribution Note` 不能替代它。

## L0 快速路径

对于微小的低风险工作，一句自然语言可以说明检查/结果、未覆盖的
范围/风险以及置信度。

## L1 默认回执

对于非平凡的 Aegis 形态工作，使用此回执。证据槽位归入
`Evidence strength` 和 `Uncovered risk`；避免生成第二份证据报告。

```text
Aegis Impact and Safety Receipt:
- Key judgment:
- Avoided misfix:
- Boundary held:
- Baseline alignment:
- Complexity control:
- Evidence strength:
- Uncovered risk:
- Next most valuable verification:
- Aegis path:
```

字段含义：`Key judgment`=负责人/根因/需求/完成边界；
`Avoided misfix`=回退方案/重复实现/测试适配/范围扩大；
`Boundary held`=契约/负责人/基线/非目标/数据/运行时边界；
`Baseline alignment`=aligned/Design Defect/Implementation Drift/缺少权威依据/需要澄清/未触发；
`Complexity control`=完成时的增量/闭合状态；
`Evidence strength`=新鲜检查/结果/范围/置信度；
`Uncovered risk`=剩余缺口/残余风险；
`Next most valuable verification`=价值最高的下一项检查；
`Aegis path`=可选项，不属于判断/证据。

当每个语义槽位都保持可审计时，自然语言表述是有效的。`Semantic Slots`、
`Natural Surface` 和 `Governance Receipt` 是兼容性名称，不是其他
报告。

报告已完成、已验证、存在风险以及受阻的事项。
不要解释显而易见的权衡，也不要列出未采取的行动；
对未执行选项保持沉默是简洁的默认方式，而不是遗漏。

## L2 扩展触发条件

满足任一条件时，读取 `expanded-closeout.md`。它负责详细内容；本文件负责路由
和最终回执。

| 触发条件 | 扩展负责人 |
|---|---|
| 发布/合并/发布到外部/就绪状态/交接 | Readiness Summary |
| 审计/调试/发布/长任务审查/追踪请求 | Trace Digest |
| 目标/TaskIntentDraft/计划/规格/Slice Card | Goal Closure |
| 项目/领域语义变化 | Context Impact |
| 目标 `docs/aegis/` 发生变化 | Workspace Integrity |
| 需求/产品/持久化架构 | Baseline/ADR |
| 治理/清理/迁移/兼容/退役 | Governance/Retirement |
| 真相来源/不可逆删除 | destructive-action cards |
| 实质性的复杂度压力 | Expanded Complexity Detail |
| 高风险或用户明确要求扩展收尾 | applicable cards |

对于目标工作区的变更，保持已配置的 Aegis 工作区支持正常连接。

当存在工作记录时，运行 `python <aegis-workspace-helper> bundle --root
<target-project-root> --work YYYY-MM-DD-<slug>`，然后运行 `python
<aegis-workspace-helper> check --root <target-project-root>`。这些检查证明的是结构，而不是证据充分性。

## 完成边界

使用最高边界：计划/规范、`TaskIntentDraft`、`Slice Card`，然后是直接请求。仅声明新鲜证据所覆盖的内容；切片证据不能关闭整个任务。

任务/切片完成达到其授权停止点；这不等同于满足已接受的需求。
`Requirement accepted` 需要基线标准或经授权的风险接受。如果不明确，请使用 `needs-verification`，或返回框定/规划阶段。

目标闭环停止状态：`done | blocked | needs-verification | scope-exceeded`。

`Execution Readiness View` 是输入，而不是验证证据。

## 复杂度降级

对于非简单代码，检查差异，并使用
`using-aegis/references/complexity-governance.md` 以及
`docs/current/AEGIS_COMPLEXITY_GOVERNANCE_BASELINE.md`；输出一行
`Complexity control`。

新的回退/适配器/兼容性/防护/分支逻辑需要一个已退役的路径或退役触发条件。
`Complexity Closure: exceeded-unresolved` 会阻止完成。
维护中的源代码/测试不能跳过此项并将其视为简单变更；没有复杂度增长的简单低风险文本编辑可以跳过。

## 输出与提示卫生

将章节标签、字段标签和解释性正文本地化。保持命令、路径、标识符、枚举、产品名称和原始证据不变；避免双语标签或混合语言的解释。

外部输出是证据候选。优先使用摘要/索引和最小摘录；降低不受支持的声明。相关时报告 `Evidence Used`、`Not Loaded` 和 `Next Evidence`。