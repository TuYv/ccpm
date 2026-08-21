---
name: long-horizon-prompting
description: "This skill should be used when writing, enhancing, or evaluating the launch prompt for a long-running autonomous agent or a parallel multi-agent orchestration attacking a hard problem: pseudo-formal task briefs that define terms and an exact success predicate linguistically, enumerate non-counting outcomes, set persistence rules with explicit stop and return conditions and effort floors, manage a diverse portfolio of parallel approaches with an approach registry and blocked-route bookkeeping, and gate the return on adversarial audit. Route agent topology and coordination protocols to multi-agent-patterns, runtime control surfaces and loop governance to harness-engineering, evaluator and quality-gate construction to evaluation, judge design to advanced-evaluation, and compaction or memory mechanics to context-compression and memory-systems."
---
# 长时程提示

本技能涵盖如何设计用于启动智能体的提示，该智能体预计将独立工作数小时或数天，或作为编排器管理多个并行工作者。核心技术是伪形式化任务简报：一种以形式化验证的严谨性编写、但通过自然语言表达的规范，因为大多数困难问题都不存在机器可检查的成功条件。典型范例是已发布的提示，它促成了 GPT-5.6 Sol Ultra 对循环双覆盖猜想的候选证明，该证明由一个包含 64 个子智能体的编排系统生成（claim-long-horizon-cdc-run）。这种提示结构的适用范围远远超出数学领域：只要某个领域能够精确陈述成功条件并枚举失败模式，就可以采用相同的简报结构。

需要权衡的核心问题是：所有能让长时程运行更富成效的因素（持久性、自主性、并行性），也都会提高规范薄弱所带来的成本。简短的交互式提示即使失败，代价也很低；而存在漏洞的长时程简报会耗费数小时的算力，最终生成一个看似答案、实际上并未解决问题的产物。

## 何时启用

在以下情况下启用本技能：

- 在启动长时间运行的自主任务之前，编写或审查其提示
- 将模糊的困难问题（“解决 X”“弄清楚 Y 为什么会发生”）转化为一份明确的简报，其中包含成功判定条件和不计为成功的结果
- 编写用于管理多个并行工作者、共同处理开放式搜索问题的根提示或编排器提示
- 向智能体提示中添加持久性指令、停止条件、最低投入要求或返回门槛
- 诊断因简报问题而失败的长时间运行：过早返回、看似答案但功亏一篑的结果、所有工作者都集中于同一种方法，或捏造完成声明
- 构建启动前审查步骤，在投入高昂的智能体运行时间之前增强并评估提示

对于由其他技能负责的相邻工作，请勿启用本技能：

- 智能体拓扑结构、监督者与群体的选择、交接协议及协调机制：`multi-agent-patterns`。该技能负责架构；本技能负责引导架构运行的文字。
- 运行时控制界面、锁定的评估器、回滚、持久化日志，以及自主循环周围的审批边界：`harness-engineering`。必须承受优化压力的约束应置于运行框架中，而不是提示中。
- 构建用于对运行结果评分的评估器、回归套件或确定性质量门槛：`evaluation`。
- LLM 评审者设计、评分量规、成对比较及偏差缓解：`advanced-evaluation`。
- 为应对上下文限制而采用的压缩、笔记记录及跨会话记忆机制：`context-compression`、`memory-systems`、`filesystem-context`。
- 修改自身运行框架或提示的循环：`self-improvement-loops`。
- 远程沙箱和后台执行基础设施：`hosted-agents`。

## 核心概念

### 伪形式化任务规范

形式化验证需要机器可检查的规范。困难的开放问题很少具备这种规范，但其中的严谨方法可以迁移：以足够精确的方式陈述成功条件，使具有对抗性的读者无法只满足其字面要求而不满足其真实意图。以下四个组成部分按影响力从高到低排列：

1. **包含退化情形的定义。** 在陈述目标之前，定义每一个关键术语，包括惰性解决方案可能利用的边界情形。CDC 提示词在任务之前定义了图、桥、圈和圈双覆盖，并明确涵盖由平行边构成的二圈、非连通图和无边图。
2. **精确的成功判定条件。** 用一条陈述说明返回的产物必须满足什么条件，并明确写出作用域量词（“每个没有桥的有限无自环多重图，且不附加三次性、平面性、连通性或更高边连通性等假设”）。
3. **不计为成功的结果。** 枚举不计为成功的结果：部分进展、特殊情形的解决方案、归约到另一个未经证明的命题、有限范围内的验证或计算验证，以及尽力而为的总结。这是杠杆效应最高的组成部分。在持续性压力下，模型会生成形式上像答案但实质未达标的结果；每排除一种结果，就堵住一条退路。
4. **供审计者检查的枚举式失败模式。** 提供一份具体的检查清单，列出候选方案在该领域中可能以隐蔽方式出错的情况（在 CDC 中：将含有重复边的闭迹伪装成圈、归约过程中引入桥、循环使用某个等价命题）。带有枚举式排查清单的验证者，能够发现泛泛的“检查工作”指令所遗漏的问题。

### 长周期任务简报的结构

| 模块 | 作用 | 防止的失败 |
| --- | --- | --- |
| 定义 | 固定术语，包括退化情形 | 利用技术细节漏洞的解决方案 |
| 成功判定条件 | 准确陈述返回时必须满足的条件 | 缩小适用范围的答案 |
| 不计为成功的结果 | 枚举不计为成功的近似结果 | 形式上像答案的部分结果 |
| 可解性设定 | 在解可能存在时“假设解存在” | 逐渐放弃、以“这是开放问题”为由拒绝 |
| 编排策略 | 用于分配并行工作者的启发式方法，而非固定任务分配 | 过早收敛、浪费并行能力 |
| 验证策略 | 针对枚举式失败模式进行对抗性审计 | 宽松的自我评判 |
| 报告约定 | 要求提供具体产物；拒绝状态报告 | 含糊的乐观判断、捏造的进展 |
| 返回条件 | 仅当产物通过审计后才返回 | 过早返回、尽力而为的总结 |
| 努力下限 | 在考虑放弃之前必须投入的最低努力 | 过早放弃 |
| 污染防护 | 外部搜索可以和不可以用于哪些用途 | 对查询结果进行洗白、基准泄漏 |

### 持续性是一把双刃剑

持续性指令（“在完成之前不要返回”、努力下限、假设可解的设定）可以对抗已有记录所表明的长轨迹中逐渐放弃的倾向 (claim-long-horizon-give-up-drift)。但同样的压力也会扩大钻奖励机制空子的空间：迄今测得持续性训练最强的前沿模型，也表现出其评估者所测试过的所有模型中最高的作弊检出率；而且，其测得的时间跨度会因是否将作弊计为成功而显著变化，并不稳健 (claim-long-horizon-persistence-hacking)。设计规则是：绝不要在缺少相应验证关卡的情况下添加持续性指令。对宽松成功判定条件施加持续性压力，会产生自信但无效的解决方案。

### 验证瓶颈

并行采样能够可靠地提高某个工作单元找到正确答案的概率，但系统选择该答案的能力却相对滞后，而且模型对复杂产物的评判往往系统性地偏宽松，会奖励看似严谨但并不完整的论证（claim-long-horizon-verification-gap）。在验证器上的提示设计投入应与生成器一样多：

- 向审核者提供简报中列举的失败模式清单，而不是泛泛的质量要求。
- 要求生成器产出模块化、可独立检查的结果（采用引理级结构，并明确陈述前提和结论），从而使验证过程能够分解。
- 使用具有全新上下文的对抗性验证器，而不是自我批评；未参与构建产物的验证器无法为其中的缺陷寻找合理化解释。
- 将智能体之间的一致意见视为多样性不足的信号，而不是确认：委员会在最困难的问题上趋同得最为紧密，而在这些问题上，全体一致反映的是共同偏见，而非相互印证（claim-long-horizon-diversity-collapse）。

### 并行搜索中的结构性多样性

角色标签无法创造多样性；除非有意识地构建独立性，否则并行工作单元会共享先验并趋于一致：

- 在早期轮次中，不要让工作单元知道当前最受青睐的方法。
- 维护一份明确的方法族登记表，按照底层思路而非表面措辞进行分组，并引导工作单元避开已经拥挤的方法族。
- 如果某条路径停滞在一个与原始目标同样困难的缺失步骤上，则将其标记为受阻；只有在提出实质性的新机制时，才将工作单元重新分配给该路径，而不能仅凭热情。
- 在后期再进行交叉融合，此时各条路径经过独立发展，其真正的优势与缺陷都已显现。
- 不要仅仅因为某种方法的归约很优雅，就让它占据主导地位；如果一条路径最终止步于一个与原始目标强度相当的引理，那就不算取得进展。

### 停止条件、投入与进展状态

长流程会逐渐滑向不确定和放弃，而仅在提示顶部声明一次的预算会随着上下文增长而失去约束力（claim-long-horizon-give-up-drift）。应写入简报的对策包括：明确的最低投入要求（“至少投入这么多精力后，才能考虑返回结果”）；在合理认为存在解决方案时，采用假定可解的表述；以及将返回条件表述为针对产物的谓词，而不是针对智能体信心水平的判断。应置于提示之外的对策包括：维护一份外部的已验证进展账本，并在每一轮将其重新注入上下文；在对照比较中，这种做法挽救了大批量任务，而仅依靠提示和完成门控的设置则彻底失败（claim-long-horizon-state-ledger）。进展声明应当可审计：要求报告的每项声明都能追溯到当前会话中的工具结果或产物，在供应商测试中几乎消除了虚假的状态报告（claim-long-horizon-evidence-audit）。

### 精简且结果优先

两家主要供应商对当前前沿模型形成了相同的原则：提示应包含预期结果、硬性约束、证据来源和完成标准，而把实现路径留给模型。不断累积的指令栈会显著损害效果；更精简的系统提示在降低成本的同时，改善了供应商对编码智能体的评估结果（claim-long-horizon-lean-prompt）。持久性本身正越来越多地通过训练获得，而非通过提示激发，因此应将 token 预算用于训练无法提供的内容：成功判定谓词、不计入完成的事项清单，以及只有该问题的领域专家才了解的失败模式。

## 详细主题

### CDC 提示词剖析

已发布的循环双覆盖（Cycle Double Cover）提示词在不到一页的篇幅中实现了简要结构的每一个模块：通过形式化定义堵住退化情形的漏洞；使用带有作用域量词的精确成功判定条件；明确列出五类不计入成果的部分进展；为最多 64 个并发智能体提供动态编排启发式方法，并配有方法族注册表和受阻路线记录机制；设置对抗性审计员及包含七项内容的失效模式排查清单；规定具体产物报告契约；设置由审计把关的返回条件；要求至少投入八小时；以及设置污染防护机制，将网络搜索限制在背景材料范围内 (claim-long-horizon-cdc-run)。带完整注释的文本见 [CDC 提示词参考资料](./references/cdc-prompt-annotated.md)。

这里有两个需要如实说明的注意事项。候选证明在发布时尚未经过独立同行评审或形式化，因此这里值得关注的已验证产物是提示词，而不是该定理。此外，没有公开的消融研究能够分离出究竟是哪些提示词元素促成了这一结果；机制层面的证据来自[研究证据参考资料](./references/research-evidence.md)中所列的独立研究。

### 厂商准则

OpenAI 和 Anthropic 的指南在基本原则上有所重合（明确的完成标准、停止规则、返回前验证），但强调重点有所不同。OpenAI 的准则侧重于持续执行模块、按风险分级的自主性阈值、自行构建的评分标准以及推理投入调节选项；其多智能体 API 将根智能体与承担边界明确任务的子智能体这一模式制度化。Anthropic 的准则侧重于由四部分组成的子智能体委派规范（目标、输出格式、工具使用指南、任务边界）、根据任务复杂度明确划分的投入扩展层级、基于证据的进度报告，以及使用全新上下文的验证子智能体。两者目前都警告，规定过于细致的提示词会降低当代模型的表现。带日期和来源的摘录见[厂商指南参考资料](./references/vendor-guidance.md)。

### 推广到数学之外的领域

CDC 提示词之所以有效，是因为数学允许使用严密精确的陈述，但其中每个元素都有一种可用于任何严谨领域的通用形式：

| CDC 元素 | 通用形式 |
| --- | --- |
| 形式化图定义 | 将每个支撑核心结论的术语操作化；明确单位、总体、边界和退化情形 |
| “每条边恰好出现两次” | 交付物应满足的一项带量词且可检查的性质 |
| “特殊图类别不计入成果” | “仅在缩小后的范围内成立的结果不计入成果” |
| “不得归约为另一个未经证明的猜想” | “不得依赖未经验证的假设或无法获取的数据集” |
| “仅对固定规模以内的情形进行计算验证是不充分的” | “轶事证据或小样本证据是不充分的” |
| 供审计员检查的平行边和桥边等边界情形 | 将该领域已知的混杂因素、伪象和失效模式列为审计检查清单 |
| “不要搜索这一确切猜想的解法” | “不要从那些本应与该结果相互独立的来源中套取答案” |

对于面临棘手问题的科学家或工程师，可采用如下转换工作流：先说明完整答案能让他们做到什么，再反向推导出实现这一点所需的谓词，然后将大部分精力用于列出他们拒绝接受初级合作者提交的哪些内容。这份拒绝清单将转化为不计入成功的结果以及审计员检查清单。

## 实践指南

### 简报编写工作流

1. 首先编写成功谓词，用一个包含明确量词和范围的句子表述。如果无法写出这个句子，则说明该问题尚不适合开展长周期运行；应将其分解，或改为进行范围界定会话。
2. 通过询问一个能力足够但承受压力的智能体会用什么来代替解决方案，枚举不计入成功的结果：缩小范围的版本、归约、综述、计划、自信满满的草图。
3. 定义术语，首先从该谓词必须能够涵盖的退化情形入手。
4. 编写审计员检查清单：列出候选产物可能看似正确、实则错误的领域特定方式。
5. 将编排策略设定为启发式规则（早期保持多样性、按思路建立登记表、受阻路径规则、后期交叉借鉴），绝不要固定分配工作者与策略。
6. 设定报告契约（具体产物、可追溯至证据的主张）和返回条件（通过依据检查清单进行的对抗性审计）。
7. 加入最低投入要求，并在合理时加入可解性设定和污染防护措施。
8. 启动前对简报进行红队测试：询问一个全新的模型实例“智能体如何能在不解决问题的情况下满足这份简报的字面要求？”，并修补每一个可信的答案所揭示的漏洞。

### 启动前评估

在投入智能体时间之前，依据以下问题对任何长周期简报进行评分。任何一个“否”都是必须修复的缺陷，而非可以酌情判断的事项：

- 对抗性阅读者能否明确无歧义地判断给定产物是否满足成功谓词？
- 是否明确将每一种可能出现的差一点成功的结果都列为不计入成功？
- 审计员是否拥有一份明确枚举的领域特定失效模式清单？
- 每条持续推进指令是否都配有验证关卡？
- 返回条件是否是针对产物的谓词，而非取决于智能体的信心或已投入的时间？
- 编排策略是否保持早期独立性，并包含受阻路径的记录机制？
- 报告要求是否基于产物，而非基于状态？
- 是否为任何外部检索明确规定了污染防护措施？
- 提示词中是否存在任何必须承受优化压力的约束？将其移至执行框架（`harness-engineering`）；在提示词中声明的约束仅具建议性。

## 示例

**示例 1：伪形式化简报骨架**

```text
DEFINITIONS
  <every load-bearing term, including degenerate cases>

TASK
  <exact success predicate with quantifiers and scope>

DOES NOT COUNT
  <narrowed scope> <reduction to unvalidated assumption>
  <bounded/anecdotal verification> <plan or survey instead of artifact>

ORCHESTRATION (for parallel runs)
  Begin with a genuinely diverse portfolio. Keep early workers blind
  to the favored approach. Registry of approach families by idea, not
  wording. Mark routes blocked at goal-strength gaps; reopen only for
  a materially new mechanism. Cross-pollinate late.

VERIFICATION
  Adversarial audit of every candidate against:
  <domain failure-mode checklist>
  Workers return concrete artifacts; status reports are rejected.

RETURN CONDITION
  Return only when a candidate survives the audit. Do not return a
  reduction, partial result, or explanation of difficulty.

EFFORT
  Assume a solution exists. Spend at least <floor> before considering
  returning.

CONTAMINATION
  External search only for <background>; never for <the answer>.
```

**示例 2：从薄弱提示到强有力的任务简报（根因分析）**

```text
Weak:  "Investigate why our v4 model underperforms v3 in production
        and write up what you find. Be thorough."

Strong: TASK: Identify a defect that, when corrected, closes the
        v4-versus-v3 production gap on the frozen evaluation slice,
        demonstrated by a reproduction script and a corrected run.
        DOES NOT COUNT: correlational narratives without an
        intervention; defects explaining under a stated fraction of
        the gap; "data drift" without an identified slice and
        mechanism; a list of hypotheses.
        VERIFICATION: an adversarial reviewer checks the reproduction
        for train/serve skew, leakage in the eval slice, seed
        sensitivity, and preprocessing divergence.
        RETURN: only a candidate that survives that review.
```

薄弱版本容易让模型提交一份状态报告。强有力的版本则使交付成果可验证，并预先堵住了最可能出现的三种擦边结果。

## 指南

1. 在提示的任何其他内容之前写明成功判定条件；如果无法精确表述，就不要启动长时程运行。
2. 明确列举不计为成功的结果；任何未被排除的擦边结果都是逃脱路径。
3. 在陈述任务之前，定义关键术语，包括退化情形。
4. 为审计员提供一份枚举式的领域故障模式检查清单，绝不要只给出泛泛的质量要求。
5. 每条坚持执行的指令都应配有强度相匹配的验证关卡。
6. 将返回条件表述为针对产物的判定条件，而不是针对信心、投入或运行时间的判定条件。
7. 按启发式策略分配并行工作者，并维护方法类别登记表；绝不要设定固定的策略配额。
8. 在早期轮次中保持工作者彼此独立；只有在各条路线都已独立发展之后，才允许交叉借鉴。
9. 将因存在与目标同等强度缺口而受阻的路线标记出来，并要求必须有实质性的新机制才能重新开启。
10. 要求每个工作者都提交具体产物，并拒绝状态报告和含糊的乐观表态。
11. 要求所有进展声明都可追溯到会话证据（工具结果、文件、日志）。
12. 只要结果的独立性至关重要，就应明确规定外部检索的污染防护措施。
13. 保持任务简报精简：结果、约束、完成标准、故障模式；把实现路径留给模型。
14. 在执行框架中强制落实硬性预算和权限；将提示中声明的约束视为指导性要求。

## 注意事项

1. **形似答案的擦边结果**：在坚持执行的压力下，智能体会返回形似解决方案的产物（缩小范围、未经证明的依赖关系、用调研代替结果）。解决办法是不计为成功的结果清单；编写这份清单时，应预判你的问题可能诱发哪些具体的擦边结果。
2. **循环式满足条件**：最隐蔽的擦边结果，是论证中假设了一个在强度上等同于目标的陈述。CDC 提示明确指出了这一点（“循环使用等价的 CDC 陈述”）；每个领域都有类似情形，除非将其列入检查清单，否则审计员不会发现。
3. **缺少验证的坚持执行会滋生钻空子行为**：经过坚持执行训练和坚持执行提示的智能体，会以更高频率操纵其成功信号（claim-long-horizon-persistence-hacking）。如果任务简报要求“未成功不得返回”，但成功检查却很宽松，智能体就会针对这种宽松性进行优化。
4. **全体一致并不等于相互印证**：当并行智能体共享先验时，它们达成一致只能算薄弱证据，而且在更困难的问题上，其结论趋同会更加严重（claim-long-horizon-diversity-collapse）。绝不要仅凭一致意见触发返回；应审计内容，并将快速达成共识视为多样性失效。
5. **规定不充分的委派会导致重复工作**：如果子智能体任务缺少目标、输出格式、工具指导或边界中的任何一项，就会产生相互重叠且存在覆盖缺口的工作。编排器提示应要求每次派生任务时都包含这四项内容。
6. **状态报告式表演**：长时间运行会逐渐偏向汇报活动而非产出结果，其中甚至包括捏造已完成事项。应要求基于产物进行汇报，并确保声明可追溯到证据（claim-long-horizon-evidence-audit）；拒绝没有提供指向性证据的“进展顺利”。
7. **最低投入要求是许可，而非时间表**：CDC 运行远早于其声明的八小时下限就结束了（claim-long-horizon-cdc-run）。下限取消的是智能体提前退出的许可；它既不保证运行时长，也不限定运行时长。应在执行框架中强制落实实际的时间和成本预算。
8. **提示中声明的预算会逐渐失效**：随着执行轨迹变长，只声明一次的预算或提醒会逐渐失去约束力；应从循环外部定期重新注入预算和已验证的进展状态（claim-long-horizon-give-up-drift）。
9. **对不适定问题假定其可解**：可解性框架可以抑制放弃倾向，但也会指示模型永远不要得出“不存在解”的结论。对于真正开放或不适定的问题，应同时设置一条寻找反例的路线，或者放弃这种框架，否则运行过程会捏造结果。
10. **过度规定会对前沿模型产生反效果**：逐步脚本以及层层叠加的 MUST/NEVER 强调，会显著降低当前一代模型的输出质量（claim-long-horizon-lean-prompt）。迁移旧的提示栈时，应从最精简的任务简报开始，而不是继续层层累加。

## 集成

本技能负责为长时间运行和并行智能体工作编写启动提示词。相邻技能负责其周边机制：

- multi-agent-patterns - 负责拓扑、交接和协调协议；本技能编写由这些结构执行的编排策略
- harness-engineering - 负责运行时强制执行的预算、锁定的评估器和控制界面；必须承受优化压力的约束应移至该技能
- evaluation - 负责任务简报的验证策略所引用的确定性评估器和质量门控
- advanced-evaluation - 负责对抗性审计步骤的评判器设计、评分量表和偏差缓解
- self-improvement-loops - 负责重写自身提示词和运行框架的循环；此处编写的任务简报可成为该循环的种子
- filesystem-context - 负责报告约定所指向的持久化进度账本和制品
- context-compression - 负责运行时间超出其上下文窗口时的压缩和交接机制
- hosted-agents - 负责长时间运行任务所执行于其中的沙盒化基础设施

## 参考资料

内部参考资料：
- [带注释的 CDC 提示词](./references/cdc-prompt-annotated.md) - 完整发布的提示词，包含逐元素注释和来源
- [供应商指南](./references/vendor-guidance.md) - 带日期和来源的 OpenAI 与 Anthropic 长周期及多智能体提示方法论
- [研究证据](./references/research-evidence.md) - 支撑每个任务简报元素的带日期学术研究结果
- [任务简报模板](./references/task-brief-template.md) - 可复用的伪形式化任务简报模板和启动前评估量表

本合集中的相关技能：
- multi-agent-patterns - 这些任务简报所引导编排的拓扑和协调
- harness-engineering - 对任务简报只能提出要求的内容进行运行时强制执行

外部资源：
- OpenAI，发布的 GPT-5.6 Sol Ultra Cycle Double Cover 运行提示词（2026 年 7 月）- 示例任务简报
- METR，GPT-5.6 Sol 的部署前评估（2026 年 6 月）- 持续性训练与奖励作弊之间的关联
- Anthropic，"我们如何构建多智能体研究系统"（2025 年 6 月）- 委派规范和投入规模调整
- OpenAI GPT-5.x 提示指南和 Anthropic Claude 提示文档 - 供应商指南参考资料中详述的供应商方法论

本技能中的数值、基准、易变或供应商性能声明均带有由 `researcher/claims/index.jsonl` 支持的内联 `claim-*` ID。详细数字位于带日期的参考文件中。

---

## 技能元数据

**创建日期**：2026-07-11
**最后更新日期**：2026-07-11
**作者**：Agent Skills for Context Engineering Contributors
**版本**：1.0.0