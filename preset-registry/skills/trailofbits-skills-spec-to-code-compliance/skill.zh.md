---
name: spec-to-code-compliance
description: Check code against the documentation that specifies it - which requirements hold, which the code contradicts, which are absent, and what the code does that no document mentions. Use when comparing an implementation against a whitepaper, protocol spec, or design document.
allowed-tools: Workflow Task Read Grep Glob
---
# 规格到代码的合规性

两份工件之间存在分歧，而任务就是找出分歧在哪里。文档声称系统做什么；代码决定它实际做什么。两者之间的每一处差距，要么是一个 bug，要么是一处文档修正——而判定它属于哪一种，这本身就是发现。

## 何时使用

当你同时拥有描述预期行为的文档，以及理应实现该行为的代码时使用。白皮书对照协议实现，设计说明对照服务，README 中声明的保证对照其背后的函数。

当文档具有权威性时最有用——即客户撰写的、已发布的、或被用作审计依据的文档——因为此时一处分歧就是一个缺陷，而不是过时的文字。

## 何时不使用

不适用于没有预期行为文档的代码。没有可对照的东西，而从代码中推断出的需求，等于用它自己来检验自己。先用 `audit-context-building` 构建系统模型。

不适用于泛泛地找 bug。它只找一类问题：代码与文档不一致之处。两份工件都未提及的 bug 超出范围，而文档明确认可的 bug，则是针对文档的发现。

不用于撰写或改进文档，尽管它会产出一份需要修复之处的清单。

## 不要在此上下文中检查需求

运行 `/spec-to-code-compliance:spec-compliance <path>`。这个斜杠命令接受一个路径；若要直接指名规格或扩大扇出范围，请在发起运行时带上这些值——“对 ./contracts 运行 spec-compliance，以 SPEC.md 为规格，检查 20 条需求”——它们会以 `{path, spec, limit}` 的形式到达脚本。在斜杠命令后按字面输入该对象是行不通的；它会以字符串形式到达，并被当作路径。

它会找到文档，将其拆分为可逐条检查的需求，为每条需求分配一个专属 agent 在代码中搜寻，在每处分歧被报告之前安排独立的 agent 尝试驳斥它，并写出 `spec-compliance/REPORT.md`，以及在 `spec-compliance/requirements/` 下为每条需求各生成一个文件。只有精简记录会返回到这里。

对于单条需求，派出 `spec-to-code-compliance:spec-compliance-checker` agent 来处理。

这并不是关于输出落在哪里的偏好。如果诚实地执行，这项检查是装不进单个上下文窗口的：判定一条需求意味着阅读它的执行逻辑、被它调用的代码和调用它的代码，而对三十条需求都这样做，意味着同时持有三十条调用链。若尝试内联完成，前几条会得到真正的检查，其余的只会得到一个貌似合理的检查——而且无论哪种情况，对话记录看起来都一样，因为一个建立在看似靠谱的函数名之上的判定，读起来与一个建立在真正读过该函数之上的判定毫无二致。一条需求一个独立上下文，才能让这种差别显现出来。

以下两点性质来自脚本而非指令，在这里无法获得：

- **发现作者本人未曾执行的驳斥。** Claude 在被要求检查自己产出的发现时会偏袒它们。工作流把每处分歧发给并未产出它的 agent——一个重新阅读代码，一个重新阅读文档——任何一方驳倒的分歧都会被剔除。
- **无法以散文形式呈现的记录。** 绑定到返回 schema 的 subagent 必须指明它读过的代码行和执行过的搜索。一个 `absent` 判定会附带所尝试的模式及其结果，而这正是把真实的缺失与过早终止的搜索区分开的唯一东西。

在 `routes-not-inline` 评测上的测量结果：安装此插件时，每次运行都会派发这项工作；未安装时从不派发——Δ +1.00。删除这一节而保留工作流不会改变任何东西，因为工作流是一个真实的命令，会被自行发现并派发。应当这样理解：承载这一行为的是机制而非这段文字——这一节的存在是为了让人类知道什么在运行、为什么运行，而不是因为路由依赖于它。

## 返回什么，以及如何解读

每条需求会得到六种判定之一：`implemented`、`partial`、`contradicted`、`stronger-than-spec`、`absent` 或 `undecidable`。值得关注的是中间四个。

- **`partial`** 通常是报告中最严重的问题。需求在任何人都会测试的路径上成立，却在没人测过的某条路径上失效——这正是它得以存活到被发现的原因。
- **`absent`** 完全依赖其 `searched` 记录。去读它。执行逻辑常常位于搜索没有到过的地方——一个修饰符、一个基类、一个先行检查的调用方。
- **`undecidable`**，以及任何 `documentProblem`，都是针对文档的发现。一条模糊到无法检查的需求，是客户无法据此追究任何人的需求。
- **`stronger-than-spec`** 是一条未写入文档的约束。它今天工作正常，而没有任何东西告诉下一个修改那段代码的人：曾有东西依赖它。

报告还覆盖反方向——代码具备而任何文档都未提及的行为——这一方向是逐条需求检查从构造上就无法发现的，因为该检查由文档驱动。

在把报告视为完整之前，先读 `notChecked`、`unverified` 和 `unreadableDocuments`。落在扇出截断线以下的需求从未被检查过，而两个驳斥 agent 均告失败的分歧属于未验证，而非已确认。

## 工作流不会替你做出的判断

严重性取决于后果，而不是与文字的距离：[DIVERGENCE_RUBRIC.md](resources/DIVERGENCE_RUBRIC.md)。一个让资金池持续失血的舍入步骤，比一个以文档描述之外的方式满足的 MUST 更严重；而没有行为后果的文档漂移，只是一张文档工单。

判定本身并不等于发现。强制需求上的 `absent` 是一个发现；描述路线图事项的句子上的 `absent` 则不是。区分二者正是这项技能的用途，而工作流会把做出判断所需的证据交到你手上。

## 目标不必是合约

问题在任何地方都一样——这条需求要求什么、它会在哪里被强制执行、是否在每条路径上都被执行——但什么算作规格、强制执行藏在哪里，这两点都会随领域改变。[DOMAIN_NOTES.md](resources/DOMAIN_NOTES.md) 对合约、C 与 C++、服务、反编译固件分别给出了这方面的映射，并涵盖了规格是 RFC 或标准而非项目文档的情形。当目标不是合约，以及在针对一部大型标准界定检查范围时，请阅读它。

## 参考

- [ANALYSIS_FORMAT.md](resources/ANALYSIS_FORMAT.md) —— 逐条需求分析的落盘格式。在扩展此插件或判断某条记录是否可信时阅读。
- [WORKED_EXAMPLE.md](resources/WORKED_EXAMPLE.md) —— 三个被追查到最终判定的需求，每个对应一种容易出错的判定：一段满足了某个与它表面上并不相似的需求的算术；一次其搜索记录本身就是发现的缺失；以及在除了没人测过的那条路径之外的每条路径上都存在的执行逻辑。
- [DOMAIN_NOTES.md](resources/DOMAIN_NOTES.md) —— 规格与执行逻辑的按领域映射。
- [DIVERGENCE_RUBRIC.md](resources/DIVERGENCE_RUBRIC.md) —— 严重性，以及一处差距的两个方向。
