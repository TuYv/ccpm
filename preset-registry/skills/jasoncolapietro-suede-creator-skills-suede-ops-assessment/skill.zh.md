---
name: suede-ops-assessment
description: "Suede-owned operations-assessment discipline that maps how work actually happens before anyone designs a system: floor-level interviews with the people who do the work, an inventory of every silo including spreadsheets and inboxes used as databases, friction quantified in the requester's own numbers, opportunities ranked by annual value against build complexity, and adoption watched for the thirty days after launch. Use when nobody can answer what to automate, when an operation needs auditing before a build, when tribal-knowledge and key-person risk has to surface, or when a shipped system is quietly being routed around. NOT FOR: deciding what to build and in what order once the map exists (use suede-ops-architecture); researching external customers rather than internal operators (use suede-customer-research); lead lifecycle, scoring, and CRM routing rules (use suede-revops); product instrumentation and dashboards (use suede-analytics); getting a new user to first value (use suede-onboarding)."
metadata:
  version: 1.0.0
---
# Suede 运营评估

```text
Iron law: map the floor, not the org chart.
```

每项运营都有两张地图。领导层地图描述业务应当如何运行。现场地图描述工作实际上是如何完成的，包括每一种变通办法、每一份非正式电子表格，以及每一个因为某件事曾经出过问题而额外增加的步骤。根据领导层地图设计的系统会被绕开，因为实际执行工作的人从第一天起就能感受到其中的不匹配。

此技能产出现场地图及其对应的数据。它会在决定要构建什么之前停止。

## 请求方提供的数据

他们提供的工时、成本、业务量、错误率和历史记录都是输入，而不是需要审计的声明。本步骤不会验证、评分、加注限定条件，也不会根据请求方提供的任何数字设置门槛。

需要审计的是**本技能**产出的任何内容：它所参考的基准、它补充的估算值、它推断而非听取到的流程步骤。将其中每一项都以内联形式标记为 `[assumed]`，并在 Output Contract 中列出，以便读者区分运营本身的数据与本技能产生的数据。

绝不要用行业平均值替代请求方已有的数据。应询问他们的数据，或将该项记录为缺失。

## 开始之前

1. **范围** — 评估涵盖哪些流程、部门或界面。
2. **访问权限** — 请求方授权你读取哪些内容。在授权范围内工作。
3. **谁在执行工作** — 按流程列出姓名或角色，并区分执行工作的人和管理工作的人。
4. **自行应用还是代表他人应用** — 创始人评估自己的运营时，对第 5 步的理解不同于外部团队评估客户的运营。

在第一次访谈前阅读 `references/interview-guide.md`。

## 第 1 步 — 访谈现场执行者

**每个流程**至少访谈一名实际执行该流程的人，而不只是管理该流程的人。如果两种描述存在差异，则同时记录两者，并将执行者的版本标记为现场地图。

将访谈作为流程演练来进行，而不是调查：问题是接下来会发生什么，并不断重复，直到流程结束。指南包含完整的问题库；以下四个问题在每次访谈中都值得保留。

- 请从头到尾带我走一遍这个流程，包括那些小到通常不会提及的步骤。
- 哪些内容你需要手动输入或复制不止一次？
- 工作会在哪里停留等待，以及它在等待谁？
- 如果下个季度业务量翻倍，最先出问题的是什么？

最后一个问题带来的信息比其他问题加起来还多。人们每天都在运营中最薄弱的环节旁边工作，却很少有人询问他们对此的看法。

**数清例外，而不是描述例外。** 当有人说某条路径“只是偶尔”发生时，询问最近二十个案例中有多少个走了这条路径。如果一个例外最终占到业务量的五分之一，那它就是一条尚未被绘制出来的主路径。

**两天后跟进。** 等访谈内容沉淀下来后，人们会想起被遗忘的步骤、第二份电子表格以及季度例外情况。

**门槛。** 每个纳入范围的流程至少要有一名执行者访谈。当请求方自己执行该流程时，他们自己的流程演练就是执行者访谈——将其按此记录，然后继续进行，而不是为了一个并不存在的第二个人而停下来。

**暂停格式。** 停止。仅通过管理层描述覆盖的每个流程都要命名。  
提供以下选择：安排与执行人员的访谈；继续进行，并在整个蓝图中将该流程标记为  
`[leadership map only]`；或将其移出范围。等待选择。

## 步骤 2 — 盘点每个信息孤岛

信息孤岛是指任何存放运营信息、而其他系统无法看到的地方。  
将它们全部列出：软件、电子表格、共享驱动器、被当作数据库使用的收件箱，以及实际进行决策的消息渠道。

逐项记录：其中存放什么、谁向其中写入、谁读取其中的信息、它与哪些内容重叠，以及每月成本。

对于任何声称正在运行的内容，都要引用一条证据路径——最近一次写入的时间戳、席位数量、发票明细，或最近的导出文件。无法提供证据的工具记录为 **unknown**，绝不能擅自假定其已停用或仍在运行。

**没有任何系统支撑的步骤本身就是发现项，而不是盘点中的缺口。** 一个流程步骤如果只存在于某个人的记忆中，就是部落知识：记录下来，注明如果没有此人该运营就会停滞，并将其作为关键人员风险纳入排序。

**关卡。** 步骤 1 中的每个步骤都必须归入以下三类之一：盘点条目、明确指定的部落知识持有者，或完全不依赖任何系统的手工工作。体力劳动和判断性工作属于第三类；将其记录为部落知识会凭空制造并不存在的风险。

## 步骤 3 — 用他们的数据量化摩擦

为每个瓶颈附上一个数值，该数值由三个组成部分构成。在每个结果旁边列出输入数据，以便读者核对算术过程。

| 组成部分 | 公式 |
|---|---|
| 劳动力 | 每周小时数 × 负担后的时薪 × 52 |
| 错误 | 每次发生的成本 × 每年发生次数 |
| 吞吐量 | 团队无法承接的工作量，按照请求方对其定价的方式计价 |

吞吐量是三者中最不确定的，因为它衡量的是本未发生的工作。将其作为单独一行保留，而不要将其折入总额，并让步骤 4 如实标注其置信度。

如果缺少某个数值，请在该行写上 `missing: <what would settle it>`，并将其带入输出契约。没有数值的瓶颈仍然是发现项；但它的排序低于那些附有数值的瓶颈。

**量化流程，绝不要量化个人。** 应写“录入重输每年造成 40,000 美元的成本”，绝不要写“Dana 每周浪费八小时”。一旦将姓名附加到同一套算术上，它就会变成绩效评估；这既不是请求方要求的内容，也不是访谈开展时所依据的前提。

## 步骤 4 — 对机会进行排序

生成四十个机会很容易。真正的交付成果是了解其中哪六个最重要、哪三个应最先处理，以及哪十个听起来很有吸引力却回报甚微。

为每个机会评分：

- **价值** — 步骤 3 中的年度数值。
- **复杂度** — 从构建本身的 1 分开始，然后针对以下每项各加 1 分：除第一个系统之外所接触的每个系统、每条发生变化的写入路径、步骤 1 中的每个例外分支，以及每个仍保留的人为审批关卡。最低分为 1，这可以避免最简单的机会出现除以零的情况。
- **排名** — 价值除以复杂度，按从高到低排序。
- **置信度** — 请求方根据其自身记录提供数值时为 `measured`，根据记忆提供数值时为 `stated`，步骤 3 无法补齐数值时为 `missing`。

明确报告三组内容：首先要做什么、确实有价值但应稍后再做什么，以及看起来令人印象深刻但回报很少的工作。第三组正是这项评估值得收费的原因，因为否则没有人会主动拒绝这类工作。

## 第 5 步——读取参与信号

一次运营在评估期间的表现，可以预测它是否会使用最终构建的成果。这是要报告给请求方的观察结果，绝不能成为扣留或放慢工作的理由。

| 信号 | 可观察表现 |
|---|---|
| 强 | 访谈按计划进行；后续问题在一个工作日内得到答复；人员会主动提出痛点 |
| 弱 | 访谈被重新安排超过一次；对演练问题只做一句话回答；要求跳过地图，直接看演示 |

报告观察到的情况以及它所预测的结果。当评估由请求方自行实施时，应根据请求方自身的参与情况读取相同的信号，并直白说明这一点，而不是给一个从未参与其中的团队打分。

## 第 6 步——观察三十天的采用情况

在基于本评估构建的系统上线后执行。关注一个指标：**Adoption Rate**，即**系统构建时旨在承载的工作流**中，实际通过该系统运行的工作流所占的比例。

分母是已构建的范围，而不是第 1 步映射出的所有工作流。若以完整地图为基准，一个有意覆盖二十个工作流中的六个工作流的系统，即使完全被采用，也会显示为 30% 的采用率，这会把范围界定决策误报成失败。

从系统日志中计算该指标。询问人们是否在使用某项功能，测量的是他们是否愿意回答，而不是采用情况。

**需要关注的信号是影子系统。** 某人悄悄保留旧的跟踪表作为保险，这是一项诊断信息，而不是不服从：这意味着培训没有覆盖到他们，或者系统确实无法处理他们的情况。两者在第一个月都很容易修复，但到了第四个月就代价高昂，因为那时影子电子表格已经再次成为真正的系统。

当 Adoption Rate 较低时，应先检查评估，再责怪构建结果。基于仓促完成的地图或仅由领导层绘制的地图设计系统，会产生团队立刻感受到的不匹配，而第 1 步的门槛正是防止这种情况发生的地方。

**暂停格式。** 当不存在可用于计算 Adoption Rate 的日志时，停止。用一行说明这一点。提出以下选项：先为工作流添加监测，商定一种人工抽样方法及其误差范围，或者在没有该指标的情况下继续，并将这一点记录在输出契约中。等待选择。

## 输出契约

```text
FLOOR MAP
- process / steps / performer interviewed / [leadership map only] where it applies

EXCEPTIONS
- process / exception path / share of last twenty cases

SILO INVENTORY
- system / holds / writers / readers / overlaps / monthly cost / proof path or unknown

TRIBAL KNOWLEDGE
- step / holder / what stalls without them

FRICTION
- bottleneck / labor / error / annual total / confidence / missing inputs
- throughput, carried separately: work not taken on, priced, confidence

RANKED OPPORTUNITIES
- first / real but later / impressive and low-return, each with value, complexity, rank

ENGAGEMENT SIGNAL
- observed behavior / what it predicts

ADOPTION (when Step 6 has run)
- Adoption Rate / built scope used as the denominator / source of the log
- shadow systems found / cause assigned to training gap or system gap

ASSUMED BY THIS SKILL
- every [assumed] line, so the requester can separate their numbers from ours

OPEN
- unresolved halts, missing figures, and unknown systems
```

## 边界

- 报告地图和数字；不要取消工具、改变系统或决定构建方案。第 4 步对机会进行排序，到此为止。
- 绝不要核实、评分或质疑请求方提供的数字。只审计本技能自行提出的内容，并标记为 `[assumed]`。
- 绝不要用行业基准替代请求方已有的数字。
- 将成本归于流程，绝不要归于具名个人。
- 只有获得请求方授权后才能进行访谈，且只有参与者在当次会话中同意后才能录制会话。
- 只读取获准访问的系统。未纳入清单的系统应记录为未知，而不是尝试访问。
- 当实时系统可供读取时，不要将之前的蓝图、交接资料或清单作为当前事实沿用。

## 路由

- 需要在地图建立后确定 schema、写入路径、自动化与代理调用方式以及构建顺序 -> 使用
  `suede-ops-architecture`。
- 需要了解外部客户的反馈、需求和阻力 -> 使用
  `suede-customer-research`。
- 需要确定潜客生命周期、评分、阶段和 CRM 路由规则 -> 使用
  `suede-revops`。
- 需要为已发布的产品建立度量层和仪表板 -> 使用
  `suede-analytics`。
- 需要让新用户在产品中获得首次价值 -> 使用
  `suede-onboarding`。
- 需要并行分工，以跨部门开展大型评估 -> 先使用
  `suede-agent-teams`，然后返回此处执行方法。
- 来自 `suede-ops-architecture`：在绘制 schema 之前，将缺失的或仅供领导层使用的楼层地图路由回此处。