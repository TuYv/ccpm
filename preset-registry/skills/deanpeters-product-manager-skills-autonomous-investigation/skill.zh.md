---
name: autonomous-investigation
description: "The protocol behind every investigation skill. Use when AI research must proceed without you: search-plan gate, Fact/Inference/Assumption labels, confidence stacking, diffable outputs."
intent: >-
  Provide the canonical contract for autonomous research skills: a bounded question budget, a search-plan
  gate, three-level evidence labeling, do-not-invent lists, just-enough output, stable diffable schemas,
  and confidence stacking — so investigations are trustworthy, schedulable, and comparable run over run.
type: workflow
theme: market-intelligence
best_for:
  - "Defining consistent behavior for research skills that run as agent tasks or on schedules"
  - "Keeping AI research honest: labeled evidence, real citations, no invented facts"
  - "Making run N and run N+1 diffable so delta monitoring is possible"
scenarios:
  - "Set up a competitive scan that can re-run quarterly without me babysitting it"
  - "I want research output where I can tell facts from the AI's guesses"
estimated_time: "protocol reference; investigations vary (15-45 min per run)"
---
# 自主调查协议

## 目的

为**调查技能**提供规范契约——AI 在现实世界中开展研究（网络搜索、已发布数据、公开申报材料），而你只需审查证据，无须向其提供上下文。`workshop-facilitation` 规范的是每次向你提出一个问题的技能，而本协议规范的是那些*无需你参与即可推进*的技能：它们会控制问题数量、展示计划、为每项主张添加标签，并生成足够稳定的输出，以便与上一季度的运行结果进行差异比较。最后这一特性正是其价值所在——遵循本契约的调查可以作为智能体任务运行、循环运行或按计划运行。

## 输入

**无需提供任何内容**——本技能定义了其他调查技能所遵循的协议。  
**单独调用时，以下信息也很有用：**调查目标，以及最重要的，**研究应支持的决策**。没有决策的研究只是一种业余爱好；每个调查技能都会询问相关决策，因为它决定了何谓“恰到好处”。

调用时一并提供的任何内容——技能名称之后的文本、粘贴的上下文转储，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。请使用这些内容，将其计入问题预算，并且不要重复提问。

**两手空空也没关系。**本协议的整体设计就是：当无人回答问题时，基于当前可获得的最佳证据继续推进，并明确标注假设。当其他技能引用本协议时，应提供哪些内容由该技能的“输入”部分规定。

**调用示例：** `Run an autonomous investigation on [TARGET]'s move into workflow automation —
this supports our Q3 roadmap bet on the same space.`

## 核心概念

### 两种协议，两种职责

| | `workshop-facilitation` | `autonomous-investigation` |
|---|---|---|
| 谁掌握上下文 | 用户 | 外部世界（公共来源） |
| 交互形式 | 每轮一个问题 | 在问题预算内提问，然后继续推进 |
| 会因无人回应而受阻吗？ | 会——等待回答 | 不会——标注假设并继续 |
| 可按计划运行吗？ | 不可以 | 可以——这正是其意义所在 |

### 契约

每个调查技能都必须遵守全部七项条款。它们并非可选菜单。

1. **问题预算**——对澄清问题设置严格上限（通常为 3 个）。当预算用尽或无人回答时，基于明确标注的假设继续推进。正是这一点使调查能够按计划运行：无人值守的运行不会陷入停滞，而是以可控方式降级。

2. **搜索计划关卡**——在开始研究之前，展示一份包含 3 个要点的计划：将搜索什么、使用哪些类型的来源，以及如何区分事实与推断。除非用户修改计划，否则继续推进。*其教学意义在于：*审查一份计划只需 10 秒；审查一份错误报告则需要 10 分钟。这一关卡是整个工作流中成本最低的纠偏点。

3. **证据标签**——每项关键主张都必须且只能带有一个标签：
   - **事实**——有来源支持；旁边附有可验证的 URL
   - **推断**——基于证据的解读；证据会被引用，其中的推演由你自行判断
   - **假设**——为继续推进而作出的工作性猜测；列出以供验证
   标签应保持简短。你*未能找到*的内容不属于第四种标签——应将其放入明确的缺口列表中。*其教学意义在于：*战略演示文稿中的大多数竞争“事实”，其实都是未标注的推断。保持这三个层级的诚实，是区分情报分析与自信叙事的关键习惯。

4. **禁止编造清单** — 每项调查技能都会列出其所属领域中特有的编造风险
   （竞争对手、定价、市场份额、专利内容、客户成果……），并禁止编造这些内容。
   只使用真实、可核查的 URL；没有来源和日期的主张，不过是戴着徽章的观点。
   *教学意义：*该清单能让人类明确知道最先需要核实什么。

5. **恰到好处模式** — 默认输出是与决策规模相匹配的、以简短项目符号呈现的最有力发现。
   仅在用户请求时才使用详细模式。研究的价值在于支持决策，而不在于页数。

6. **稳定的输出模式** — 各次运行之间的章节顺序和结构绝不变动，因此第 N 次运行和
   第 N+1 次运行可以进行差异比较。增量监控、定期更新以及“自上季度以来发生了什么变化”
   都依赖这一条款。

7. **最终步骤区块** — 结尾必须恰好提供 4 个带编号的后续选项（要构建的产物、要执行的深度分析、
   要验证的假设）。接受 `1`、`1 and 3`、`Verbose Mode` 或自定义路径。

### 置信度叠加规则

标签评定单项主张；叠加评定的是*整体叙事*。当信号来自相互独立的
收集渠道时（参见 `intelligence-collection-disciplines`）：

~~~
1 channel flags it   → Watch item. Log it, do nothing.
2 channels agree     → Working hypothesis. Assign someone to probe.
3+ channels agree    → Actionable intelligence. Brief leadership, adjust plans.
Channels conflict    → The most interesting case. Someone is bluffing. Dig.
~~~

一条普遍适用的推论是：**在资金、采购、招聘或合同提供佐证之前，应将公告视为意向。**
雄心壮志体现在新闻稿中；实际承诺则体现在申报文件、招聘信息和采购订单中。

### 防护准则

本协议下的所有信息收集工作都必须合法、合乎道德，并基于开源信息：

- **可以：**任何已发布、已申报、已发布到网上或可公开观察到的信息。
- **不可以：**使用虚假身份或借口（谎报自己的身份）、索取受 NDA 保护的信息、专门雇用某人
  以套取其前雇主的秘密，或违反你已接受的条款进行数据抓取。

借用竞争情报行业的一条经验法则（SCIP 道德准则）：**如果你不愿意在目标公司的用户大会舞台上
解释自己的方法，就不要使用这种方法。**

## 应用

### 对于实施本协议的技能

1. 在参考资料中声明本技能是适用的治理协议。
2. 说明该技能的问题预算（默认为 3）以及具体问题。
3. 定义该领域的禁止编造清单 — 明确列出 AI 在这一领域中会编造的具体内容。
4. 使用带编号的章节定义稳定的输出模式；将其标记为“不得重新排序”。
5. 以恰好包含 4 个选项的最终步骤区块结束该模式。

### 对于执行调查的智能体

1. 首先阅读调用时提供的内联上下文；将其计入问题预算。
2. 只询问预算范围内尚未得到回答的问题。如果没有回复，则继续执行 — 将每个用于填补信息缺口的猜测
   标记为**假设**。
3. 展示包含 3 个项目符号的搜索计划。除非该计划被修改，否则继续执行。
4. 以恰到好处模式开展研究：混合使用不同类型的来源，并记录真实 URL 及日期。
5. 将每项关键主张标记为**事实 / 推断 / 假设**。将无法找到的信息列入缺口清单。
6. 当多个渠道都对同一动向提供信息时，应用置信度叠加；报告叠加等级，
   而不只是各个信号。
7. 严格按照该技能的模式输出 — 使用相同的章节和相同的顺序 — 以便将本次运行与上次运行进行差异比较。
8. 以最终步骤区块收尾。如果用户选择了某个编号，则执行该选项；如果用户没有回答（即
   定期运行），则将输出归档并停止。

一份可复制粘贴的**调查简报**——将契约的七项条款作为待填写的决策，用于向智能体下达简报或设计新的调查技能——位于 [`template.md`](template.md)。

## 示例

**遵循协议的一次运行的开场（用户已在行内给出目标和决策，因此没有占用任何提问次数）：**

> **搜索计划**（如需更改，请回复“revise”）：
> - 搜索 [TARGET] 的定价页面、发布说明和最近两次财报电话会议文字记录
> - 来源组合：公司网站、监管文件、可信媒体、评测网站
> - 事实附带 URL；解读标记为“推断”；信息缺口转为待验证的“假设”
>
> *（开展研究）*
>
> **关键发现：**[TARGET] 于 5 月取消了其中档套餐——**事实**
>（[5 月 12 日的定价页面差异](https://example.com/archive)）。产品套餐正向
> 企业级整合——**推断**（取消该档套餐 + 自 4 月以来发布了两项仅限企业级的功能）。
> 他们将在两个季度内提高入门价格——**假设**（基于模式；需根据其定价页面的下一次变更
> 进行验证）。
>
> **最后一步——回复 1、2、3、4、任意组合，或“Verbose Mode”：**
> 1. 根据这些发现制作竞争作战卡
> 2. 高管对比矩阵
> 3. 未来两个季度的风险/机会
> 4. 用于验证这些假设的探索性问题

**无人值守的定时运行：**同一技能通过已保存的调用按季度运行。提问额度已用完（零个问题——上下文已在行内提供），计划关卡自动继续，而且由于架构未发生变化，输出可以与上一季度清晰地进行差异比较。团队阅读的是变化，而不是报告。

请参阅 [`examples/protocol-in-action.md`](examples/protocol-in-action.md)，其中包含一个完整的运行示例（虚构），展示每项条款在实际压力下的表现——包括用户在关卡处修改搜索计划，以及在“不得虚构”清单发挥作用时如实列出信息缺口。
[`examples/protocol-in-action-industrial.md`](examples/protocol-in-action-industrial.md) 展示了冲突情形：四个渠道结论一致，一个渠道持不同意见，而深入调查改变了战略响应。

## 常见陷阱

- **报告作秀。**二十页内容传递的是付出了多少努力，而不是获得了多少情报。如果一页带标签的发现就足以支撑决策，那么二十页就是缺陷。Just Enough Mode 是契约，而不是建议。
- **未标记的推断。**将“竞争对手 X 正在转向 AI”表述为事实，而它其实只是对两则招聘信息的解读。标签不是装饰——它告诉读者在据此下注之前应该核查什么。
- **虚构引用。**无法访问的 URL、不存在的引文。“不得虚构”清单列出了该领域中容易诱发虚构的内容；必须遵守，否则整个输出都会令人怀疑。
- **跳过计划关卡。**沿错误方向研究十分钟，其成本高于用十秒钟审查计划。设置关卡是因为调整计划的成本很低，而调整报告则不然。
- **夸大公告。**将新闻稿视为承诺。公告表达的是意图；在据此重新规划之前，应通过资金投入、招聘或合同进行佐证。
- **架构漂移。**在不同运行之间“改进”输出结构，会悄无声息地破坏差异比较能力——下游的变化监控器此时比较的就不再是同类事物，而是苹果与重新规划后的果园。
- **单一来源带来的确定性。**一个信号只能算轶事。只有当相互独立的渠道得出一致结论时，才能提高置信度——这正是信号叠加规则发挥作用的体现。

## 参考资料

- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）—
  本协议所标记和叠加的信号所来自的八种情报收集渠道
- [`workshop-facilitation`](../workshop-facilitation/SKILL.md)（交互式）— 适用于由*用户*掌握上下文的
  技能的同级协议
- 遵循本契约的调查技能：`market-landscape-scan`、`competitive-research-snapshot`、
  `competitive-intel-watch`、`battle-card-builder`（每项技能的“参考资料”部分均指明了本协议）
- SCIP 道德准则 — 竞争情报专业的参考标准
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的
  市场情报调查契约。