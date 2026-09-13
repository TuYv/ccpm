---
name: verification-before-completion
description: "Use when about to claim work is complete, fixed, passing, verified, release-ready, or ready to commit, merge, publish, or hand off."
---
<EXPLICIT-MODE-GATE>
如果可见 `activation_mode = "explicit"` 或 `AEGIS_ACTIVATION_MODE=explicit`，
且请求既未提及 Aegis，也未提及此技能，则无需检查清单或仪式流程，返回快速路径；否则继续。
</EXPLICIT-MODE-GATE>

# 执行

在声称成功之前：对破坏性权限进行分类；运行一次新的证伪检查；读取其完整结果和范围；选择 L0/L1/L2。对于部分、过时、失败或范围更窄的证据，降低等级；绝不能先声称完成，再之后进行验证。

此方法包不授予权威的 `GateDecision`、`PolicySnapshot`、证据充分性、需求验收或完成授权。

## 停止信号

- 证据不确定、过时、仅来自代理，或其范围小于声明范围；
- 下一步操作为：提交、推送、创建 PR、合并、打标签、发布、正式发布或交接；
- 将任务或切片完成视为已接受的需求满足；
- 治理或退役缺少修复/退役证据；
- 保留的旧逻辑缺少保留理由和退役触发条件；或
- 复杂度收敛尚未解决。

破坏性/不可逆操作需要明确范围的许可；宽泛的同意不属于明确范围的许可。

## 必需的证据槽位

```text
- Evidence action / check performed:
- Result / exit status:
- Covered scope:
- Uncovered scope:
- Residual risk:
- Confidence grade: A | B | C
```

- `A`：目标验证和回归验证均已完成；不存在有意义的未知项。
- `B`：已完成目标验证；存在范围受限的残余风险。
- `C`：仅完成部分验证；不得声称全部完成。

当测试构成声明依据时，应在复现触发链的调用点接缝处，同时纳入目标测试和相关回归证据；更浅层的接缝会产生虚假的信心。缺失接缝属于架构缺口。被阻塞的自动化需要可复现的手动步骤。两者都会降低信心。

对于明确的基线/工件/负责人/契约/证据引用，读取最小相关来源。记录每个受影响引用的状态：已保留；已重新绑定到规范负责人；已说明理由后退役；或因冲突而拒绝。将未解决的引用保留在未覆盖范围内，降低信心，并且不得重新推断这些引用。
回读无法证明完整图谱、引用完整性或权威血缘关系。

## 任务 Git 收尾

对于修改，针对 `TaskStartSnapshot` 进行差异比较。只有协调者可以暂存任务路径：不得暂存预先存在的状态或进行宽泛暂存。完成新的验证后，默认创建一个本地提交，除非属于只读/无变更、已授权的 `no commit`，或验证失败。
回读 `HEAD`、提交消息、文件和任务差异。
提交/钩子失败应保留工作内容，并阻止声称干净；绝不得绕过钩子。

Git 回执：分支；SHA/消息或不提交的原因；`Task clean`；`Repository clean`；每个由任务创建的分支/工作树的状态：已创建、已移除，或因何理由保留。
任务干净绝不意味着仓库干净；它不代表外部集成已完成。

对提交范围进行分类：`business`、`process-only`、`mixed` 或 `no-commit`。
失败尝试遥测不属于不提交的原因。仅涉及 `docs/aegis/` 的流程差异不会重新启动业务验证；涉及业务/测试的差异则会。

## Aegis 可见性 / 单一收尾

使用一个完成界面。此 skill 是唯一的完成收尾聚合器；
相邻 skills/L2 卡片可以提供内容，但不得替代它，也不得成为相互竞争的最终报告负责人。
聚合属于输出规范一致性，而不是路由触发器：不要仅仅为了填充它而加载 skills、
输出 Trace Digest，或增加仪式性流程。

如果遗漏了入口可见性，则恢复并指出决策/证据缺口；已使用 skills 列表或
`Aegis Contribution Note` 不能替代这一点。

## L0 快速路径

对于微小且低风险的工作，一句自然语言即可说明检查/结果、未覆盖的范围/风险以及置信度。

## L1 默认回执

对于非平凡的 Aegis 形态工作，使用此回执；将证据纳入 `Evidence
strength`，将未覆盖的风险纳入 `Uncovered risk`，不要再附加第二份报告。

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

含义：`Key judgment`=负责人/根本原因/需求/完成边界；
`Avoided misfix`=回退方案/重复实现/测试适配/范围扩大；
`Boundary held`=契约/负责人/基线/非目标/数据/运行时边界；
`Baseline alignment`=已对齐/Design Defect/Implementation Drift/缺少权威依据/需要澄清/未触发；
`Complexity control`=完成时的增量/闭合；
`Evidence strength`=最新检查/结果/范围/置信度；
`Uncovered risk`=剩余缺口/残余风险；
`Next most valuable verification`=价值最高的下一项检查；
`Aegis path`=可选，不属于判断/证据。

只要每个语义槽位都保持可审计，自然措辞就是有效的。`Semantic Slots`、
`Natural Surface` 和 `Governance Receipt` 是兼容性名称。

报告完成/已验证/存在风险/受阻状态。不要解释显而易见的权衡；不要列出未执行的操作。

## L2 扩展触发器

匹配到任一条件时，读取 `expanded-closeout.md`：它负责详细内容；本文件负责路由
和最终回执。

| 触发器 | 扩展负责人 |
|---|---|
| 发布/合并/发布上线/就绪/交接 | Readiness Summary |
| 审计/调试/发布/长任务审查/跟踪请求 | Trace Digest |
| 目标/TaskIntentDraft/计划/规格/Slice Card | Goal Closure |
| 项目/领域语义变更 | Context Impact |
| 目标 `docs/aegis/` 发生变更或存在工作记录 | Workspace Integrity |
| 需求/产品/持久化架构 | Baseline/ADR |
| 治理/清理/迁移/兼容/退役 | Governance/Retirement |
| 真相来源/不可逆删除 | destructive-action cards |
| 重大复杂度压力 | Expanded Complexity Detail |
| 高风险或用户明确要求扩展收尾 | applicable cards |

使用已配置的 Aegis 工作区支持；命令位于扩展负责人中。

## 完成边界

使用最高优先级的边界：计划/规格、`TaskIntentDraft`、`Slice Card`，然后是直接请求。只声明有最新证据覆盖的范围；一个切片不能关闭整个任务。

任务/切片完成达到其授权停止点；这并不等同于需求已被接受。
`Requirement accepted` 需要基线标准或经授权的风险接受；
否则使用 `needs-verification`，或返回框架/规划阶段。Goal Closure 状态为：`done | blocked | needs-verification | scope-exceeded`。
`Execution Readiness View` 是输入，而不是验证证据。

## 复杂度降级

对于非平凡代码，检查 diff；使用
`using-aegis/references/complexity-governance.md` 以及
`docs/current/AEGIS_COMPLEXITY_GOVERNANCE_BASELINE.md`；输出一行 `Complexity control`。

新增的 fallback/adapter/compatibility/guard/branch 逻辑必须有已退役路径或退役触发条件。
`Complexity Closure: exceeded-unresolved` 会阻止完成。
维护中的源代码/测试不能跳过此项；微小且低风险、不会增加复杂度的文本编辑可以跳过。

## 输出与提示词卫生

将章节标签、字段标签和解释性正文本地化。保持命令、
路径、标识符、枚举、产品名称和原始证据不变；避免双语标签或混合语言的说明。

外部输出是证据候选：使用摘要/索引，然后选取最小片段；降低无支持的断言。
在相关情况下报告 `Evidence Used`、`Not Loaded` 和 `Next Evidence`。