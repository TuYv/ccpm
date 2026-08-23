---
name: verification-before-completion
description: "Use when about to claim work is complete, fixed, passing, verified, release-ready, or ready to commit, merge, publish, or hand off."
---
<EXPLICIT-MODE-GATE>
如果激活模式为显式（`~/.config/aegis/config.toml` 中包含
`activation_mode = "explicit"`，或环境中存在 `AEGIS_ACTIVATION_MODE=explicit`），
且当前用户请求未按名称显式调用 Aegis 或此技能，则退回快速路径：简洁作答，
不使用此工作流的检查清单、仪式或文档要求。如果用户显式点名了 Aegis 或此技能，
则正常继续。
</EXPLICIT-MODE-GATE>

# 执行

在任何成功声明之前，先对破坏性操作的权限需求进行分类，选择并运行一项全新的证伪检查，
阅读其完整结果和覆盖范围，然后选择 L0/L1/L2。如果证据不完整、过时、失败或覆盖范围
小于声明范围，则降低等级；绝不能先声称全部完成，之后再进行验证。

此方法包不授予任何权威性的 `GateDecision`、`PolicySnapshot`、证据充分性、
需求验收或完成认定权限。

## 停止信号

出现以下情况时，在作出声明或推进之前停止：

- 证据不确定、过时、仅来自代理，或覆盖范围小于声明范围；
- 下一项操作是提交、推送、PR、合并、打标签、发布、发行或移交；
- 将任务/切片完成视为需求已被验收；
- 治理或退役缺少修复/退役证据；
- 保留的旧逻辑缺少保留理由和退役触发条件；或
- 复杂度收尾尚未解决。

破坏性或不可逆的工作需要获得范围明确的权限；警告或宽泛的同意并不构成授权。

## 必需证据栏位

保持以下栏位明确且可审计：

```text
- Evidence action / check performed:
- Result / exit status:
- Covered scope:
- Uncovered scope:
- Residual risk:
- Confidence grade: A | B | C
```

- `A`：目标的直接证据加上相关回归证据；不存在有实质意义的未知项。
- `B`：目标的直接证据，且残余风险有明确边界。
- `C`：仅有部分证据；不得声称全部完成。

当测试会影响声明时，应包括目标测试和相关回归证据。如果自动化受阻，请提供可复现的手动步骤，
并降低置信等级。证据不等同于完成认定权限。

## 任务 Git 收尾

对于修改类任务，将最终状态与 `TaskStartSnapshot` 进行比较。只有协调者可以暂存任务所属路径；
绝不能进行宽泛暂存，也不能包含用户预先存在的状态。除非任务为只读/无变更、用户/项目权限要求
`no commit`，或验证失败，否则在完成全新验证后，默认创建本地任务提交。回读 `HEAD`、消息、
文件以及剩余的任务差异。提交/钩子失败时保留工作成果，并阻止作出无问题的声明；不得绕过钩子。

Git 回执需报告分支；提交 SHA/消息或未提交原因；`Task clean`；`Repository clean`；
以及每个由任务创建的分支/工作树是已创建、已移除，还是因某项原因而保留。任务干净绝不意味着
仓库干净。此回执属于证据，并不构成外部集成或完成认定权限。

## Aegis 可见性/单一收尾

仅使用一个完成信息出口；不得并行提供最终报告。
`verification-before-completion` 是唯一的完成收尾聚合器。
相邻技能和 L2 卡片为回执提供输入，但不得取代它，也不得成为相互竞争的最终报告负责人。
回执聚合属于输出一致性要求，而非路由触发条件：不得仅为填充回执而加载额外技能、
输出 Trace Digest 或增加仪式。

如果省略了条目可见性，请恢复决策/证据边界并指出缺口；已使用技能列表或 `Aegis Contribution Note` 不能替代这一点。

## L0 快速路径

对于极小型、低风险的工作，可以用一句自然语言说明检查/结果、未覆盖的范围/风险以及置信度。

## L1 默认回执

对于具有明显 Aegis 特征的非简单工作，请使用此回执。证据项应归入
`Evidence strength` 和 `Uncovered risk`；避免再提供第二份证据报告。

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

字段含义：`Key judgment`=归属方/根本原因/需求/完成边界；
`Avoided misfix`=回退方案/重复实现/迁就测试/范围扩张；
`Boundary held`=契约/归属方/基线/非目标/数据/运行时边界；
`Baseline alignment`=已对齐/设计缺陷/实现偏移/缺少权威依据/需要澄清/未触发；
`Complexity control`=完成时增量/闭环；
`Evidence strength`=最新检查/结果/范围/置信度；
`Uncovered risk`=剩余缺口/残余风险；
`Next most valuable verification`=下一项价值最高的检查；
`Aegis path`=可选，不属于判断/证据。

只要每个语义项都保持可审计，就可以使用自然语言表述。`Semantic Slots`、
`Natural Surface` 和 `Governance Receipt` 是兼容性名称，而不是其他报告。

报告已完成、已验证、存在风险以及受阻的事项。
不要解释显而易见的权衡，也不要列出未执行的操作；
不提及未执行的选项是简洁表达的默认方式，并不构成遗漏。

## L2 扩展触发条件

匹配任一条件时，请阅读 `expanded-closeout.md`。它负责详细内容；此文件负责路由
和最终回执。

| 触发条件 | 扩展内容归属方 |
|---|---|
| 发布/合并/发布/就绪性/交接 | 就绪性摘要 |
| 审计/调试/发布/长任务审查/追踪请求 | 追踪摘要 |
| 目标/TaskIntentDraft/计划/规格/Slice Card | 目标闭环 |
| 项目/领域语义变化 | 上下文影响 |
| 目标 `docs/aegis/` 已更改 | 工作区完整性 |
| 需求/产品/持久性架构 | 基线/ADR |
| 治理/清理/迁移/兼容性/退役 | 治理/退役 |
| 事实来源/不可逆删除 | 破坏性操作卡片 |
| 显著的复杂度压力 | 扩展复杂度详情 |
| 高风险或用户明确要求扩展收尾报告 | 适用的卡片 |

对于目标工作区的更改，请保持已配置的 Aegis 工作区支持正常接入。
如果存在工作记录，请运行 `python <aegis-workspace-helper> bundle --root
<target-project-root> --work YYYY-MM-DD-<slug>`，然后运行 `python
<aegis-workspace-helper> check --root <target-project-root>`。这些检查只能证明
结构正确，不能证明证据充分。

## 完成边界

使用最高层级的边界：计划/规格、`TaskIntentDraft`、`Slice Card`，然后才是直接
请求。仅声明最新证据能够覆盖的内容；切片证据无法为整个任务完成闭环。

任务/切片完成意味着已到达其获授权的停止点；这不代表需求已被接受并满足。
`Requirement accepted` 需要基线标准或经授权的风险
接受。若不明确，请使用 `needs-verification`，或返回界定/规划阶段。

目标闭环停止状态：`done | blocked | needs-verification | scope-exceeded`。

`Execution Readiness View` 是输入，而非验证证据。

## 复杂度降级

对于非平凡代码，请检查差异，并使用
`using-aegis/references/complexity-governance.md` 以及
`docs/current/AEGIS_COMPLEXITY_GOVERNANCE_BASELINE.md`；输出一行
`Complexity control`。

新增的回退/适配器/兼容性/防护/分支逻辑需要有已退役路径或
退役触发条件。`Complexity Closure: exceeded-unresolved` 会阻止完成。
维护中的源代码/测试不能以微小变更为由跳过；不增加复杂度的微小低风险文本编辑可以跳过。

## 输出和提示词规范

本地化章节标签、字段标签和说明性正文。命令、
路径、标识符、枚举、产品名称和原始证据保持不变；避免使用双语标签或混合语言说明。

外部输出是候选证据。优先使用摘要/索引以及最小必要
摘录；减少缺乏支持的断言。相关时，报告 `Evidence Used`、`Not
Loaded` 和 `Next Evidence`。