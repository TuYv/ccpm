---
name: capacity-planner
description: "Use when an ops leader (Director of CX, Head of Support, VP Ops, Head of BizOps, Head of IT ops, Head of Finance ops) is sizing ops capacity, building a headcount plan, modeling utilization risk, planning Q3 capacity or annual support capacity, or designing CS coverage — and needs Erlang-C queueing math, P90 demand sizing, shrinkage-adjusted FTE, manager-trigger thresholds, and a quarterly hiring sequence with ramp + attrition. Apply when sustained team utilization is above 80% or when the team is growing >50% in 12 months. Run before committing the headcount budget. This is NOT engineering capacity (see vpe-advisor for DORA + cycle time) and NOT strategic 3-year workforce planning (see chro-advisor)."
version: 2.8.0
author: claude-code-skills
license: MIT
tags: [bizops, capacity, headcount, utilization, queueing-theory, ops-planning, little-law, workforce]
compatible_tools: [claude-code, codex-cli, cursor, antigravity, opencode, gemini-cli]
---
# capacity-planner

面向**处理排队工作的运营团队**的规模规划工具——适用于支持、CX、
客户成功、BizOps、IT 运营、财务运营。基于 Erlang-C
排队论、Little's Law 以及运营领导力领域的经典理论
（Fournier、Larson、Cleveland、Reinertsen）。确定性计算，仅使用标准库，
不调用 LLM。

## 目的

你是一名运营负责人，团队规模将从 15 人扩大到 35 人，却不知道这个 35 人的组织
在峰值负载下实际会如何运作。或者，你的利用率已经达到 88%，
SLA 开始下滑。又或者，你的招聘预算已获批准，需要
将招聘安排到四个季度，同时避免现有团队过度疲劳。
此 Skill 用算术而非感觉来回答这些问题。

它会生成三项产出：

1. **容量规模规划**：针对 P50/P90/P99 需求，分别按 70/80/90% 的利用率
   进行测算，并给出每个点位的 P(SLA breach)，以及 SAFE/WATCH/AT_RISK/CRITICAL
   风险等级。
2. **利用率健康度**：提供成员级别的红黄绿灯状态，以及
   团队结论（HEALTHY/SQUEEZED/OVERLOADED/UNBALANCED）。
3. **12 个月季度招聘计划**：考虑爬坡曲线、
   人员流失、环比季度需求增长，以及管理幅度对应的经理招聘触发条件。

## 何时使用

- **年度运营容量规划**（在 10 月至 11 月规划下一
  财年）。
- 当需求变化超过 15% 或人员流失激增时，进行**季度规模重估**。
- **预算前论证**——用数学依据向
  CFO 证明人员编制申请的合理性。
- 当运营团队未达到 SLA，而你需要判断
  这是规模问题、流程问题还是瓶颈
  问题时，进行**诊断**。
- **并购/新细分市场启动**建模——规划新团队或
  合并后组织的规模。

## 工作流

1. **获取需求数据**。从你的工作系统
   （Zendesk、Intercom、JSM、ServiceNow、Salesforce）中提取每日工单/案例量的 P50/P90/P99。
   如果你只有平均值，请停止并获取完整分布。单点
   需求估算是运营中代价最高昂的反模式。
2. **建立吞吐量模型**。使用你的需求量、
   AHT、SLA 目标、当前 FTE 和收缩率运行 `capacity_modeler.py`。使用 `--profile`
   指定你的职能（support / cx / bizops / finance-ops / it-ops）。查看
   利用率为 80% 的那一行——这就是你的规模规划点。
3. **标记利用率风险**。针对当前团队的实际利用率数据运行
   `utilization_analyzer.py`。根据 Reinertsen 的理论，任何人持续高于 85%
   都存在吞吐量崩溃的风险。团队成员之间的利用率差距超过 30 个百分点
   意味着 UNBALANCED——在招聘前先解决这个问题。
4. **安排招聘顺序**。使用当前 FTE、
   年末目标、爬坡时间、人员流失率和增长率运行 `hiring_sequencer.py`。它会将招聘前置
   （Q1 35%，Q4 15%）、应用爬坡曲线，并在管理幅度超过
   每位经理 7 名 IC 时触发经理招聘。
5. **逐一回答强制问题库中的问题**（见下文）。一次只回答一个问题。
   不要跳过。必须先将答案写下来，
   然后才能确定计划。

## 脚本

- `scripts/capacity_modeler.py`——使用 Erlang-C 进行规模规划，包括收缩率
  调整及 P50/P90/P99 违约概率。使用 `--profile`
  获取行业默认值。
- `scripts/utilization_analyzer.py`——成员级红黄绿灯状态，以及
  包含差异检测的团队级健康度结论。
- `scripts/hiring_sequencer.py`——包含爬坡、
  人员流失、增长、每季度最大招聘人数约束和
  经理触发逻辑的 12 个月季度计划。

三者均接受 `--input <path>`（JSON）、`--output {markdown,json}`、
`--sample`（内置示例）和 `--help`。仅使用标准库。

## 快速示例

```bash
# Emits an Erlang-C capacity model (required headcount + P50/P90/P99 breach probabilities) for the built-in example
cd business-operations/skills/capacity-planner && python3 scripts/capacity_modeler.py --sample
```

## 参考资料

- `references/queueing_theory_canon.md` — Erlang、Little、Hopp &
  Spearman、Reinertsen、Kingman、Cleveland、ITIL、Armony 等（8
  个来源）。数学原理。
- `references/ops_workforce_planning_canon.md` — Fournier、Larson、
  Google SRE Workbook、Frei、Lawler、Bersin、Gartner、Grove（8
  个来源）。人员因素。
- `references/capacity_anti_patterns.md` — 11 个有明确名称的反模式，
  包含引用来源、工具防护机制，以及由
  Lencioni + Goldratt + Christensen 施加的元纪律。（8 个以上具名来源。）

## 资源

- `assets/capacity_brief_template.md` — 20 分钟填写模板，
  包含三个工具的 JSON 框架和输出检查清单。

## 假设

此技能假设：

- 工作是**排队处理的**（工单、案例、工作项），而非项目式工作。
  如果你团队的工作不排队，那么此技能并不适用。
- 一个季度内，需求具有**足够平稳的分布**。
  阶跃式变化（新产品发布、并购、监管变化）要求
  在季度中途重新运行。
- 你拥有**至少 90 天的历史需求数据**，以计算
  P50/P90/P99。否则，请先根据销售/
  用户群预测生成该分布。
- 一个队列内的服务属于**单一类别**。如果你有严格的
  优先级层级（P1/P2/P3，且各类别有特定 SLA），请将每一类
  建模为独立队列后再求和。
- **各渠道以一致的方式建模。**多渠道团队应使用
  合适的 `--profile`，其中包含内置的收缩率溢价。

## 反模式

有关包含来源的完整分类，请参阅 `references/capacity_anti_patterns.md`。
最主要的八种：

1. 按 100% 利用率规划（Reinertsen 原则 12）
2. 将爬坡期视为瞬时完成（Larson）
3. 在 12 个月规划中忽略人员流失（Bersin）
4. 持续招聘独立贡献者，却不设置管理者配置触发条件（Fournier）
5. 仅按 P50 需求确定规模（Cleveland）
6. 不进行收缩率调整（Cleveland、SRE Workbook）
7. 对多渠道工作使用单渠道模型（Gartner、Kingman）
8. 不为 P99 事件制定激增应对计划（Hopp & Spearman、Reinertsen）

## 与以下技能的区别

- **`c-level-advisor/vpe-advisor`** 通过 DORA 4 指标、
  故事点、部署频率和周期时间瓶颈衡量*工程*吞吐量。
  它适用于交付代码的工程团队。此技能适用于处理工单/案例的
  运营团队。工作单位不同，数学模型不同（Erlang-C 与 DORA），
  瓶颈也不同（忽视排队效应的人员配置与 WIP + 前置时间）。
- **`c-level-advisor/chro-advisor`** 进行*战略性*人力规划
  （1-5 年能力组合、人才供给、领导力继任）。此技能根据需求
  进行*运营性*的 0-12 个月产能规模测算。正如 Lawler 所言：
  混淆二者会导致你招聘人员来填补错误的岗位。
- **`project-management/*`** 跟踪项目的交付吞吐量
  （Jira 速率、冲刺产能）。此技能围绕稳定状态下的排队工作
  确定规模。
- **同级技能 `process-mapper`** 用于*发现*瓶颈。此技能则
  *围绕*已知瓶颈确定团队规模。操作顺序：
  先使用 process-mapper → 再使用 capacity-planner。围绕错误的
  约束进行招聘会浪费新增人员。
- **`business-growth/cs-coverage`**（如果存在）根据 ARR/CSM 比率
  和客户分层确定客户成功团队的覆盖规模。此技能根据排队工作量
  （工单、案例、升级事件）确定规模。对于同时处理客户关系工作
  和工单队列的客户成功团队，请同时运行二者。

## 强制追问库（Matt Pocock 盘问法则）

**法则**：逐一回答这些问题。不要跳到后面。答案必须
记录下来。如果你无法回答某个问题，它就是你接下来要调查的事项。

### Q1 — “你的瓶颈是什么？你是否已通过实证确认？”

**推荐答案**：工作流中一个有明确名称且经过测量的阶段，并有
队列时间数据表明工作在哪里等待。不能凭感觉。不能只说“升级处理
耗时太长”。必须是实际测量过的队列。

**为什么这是第一个问题**：Goldratt（*The Goal*，1984）指出，每个
系统在任一时刻都恰好只有一个起约束作用的瓶颈。围绕错误的约束
确定团队规模，会让招聘投入全部浪费。如果你不知道自己的
瓶颈，请在使用此 skill **之前**运行 `process-mapper`。

**经典依据**：Eli Goldratt，*The Goal*（1984）；Reinertsen，*Principles of
Product Development Flow*（2009）。

### Q2 — “你接受的服务取舍是什么？”

**推荐答案**：一个书面、明确的选择——快速还是有同理心、
广度还是深度、低成本还是高质量。Frances Frei 的观点毫不含糊：
你不可能在所有四个方面都胜出。试图兼得的团队最终会一无所获。

**为什么这很重要**：AHT、SLA 和 shrinkage 输入，是这种取舍在运营层面的
具体体现。如果它们彼此不一致（例如，你为“同理心”设定 AHT，
却为“速度”设定 SLA），该计划就会自相矛盾。

**经典依据**：Frances Frei 与 Anne Morriss，*Uncommon Service*（HBR Press，
2012）。

### Q3 — “你的需求量 P90 是多少？它与 P99 的差距是多少？”

**推荐答案**：基于最近 90 天的数据给出两个具体数值，并说明各自对应的
日历背景（例如，“正常周二的 P90 是每天 480 张工单；11 月版本发布后
第二天的 P99 是 720 张”）。按 P50 配置团队规模，会有一半时间无法达到 SLA。
按 P99 配置团队规模，则会造成 30%-50% 的人员过剩。根据
Cleveland 的观点，P90 是正确的运营规模配置点。

**经典依据**：Brad Cleveland，*Call Center Management on Fast Forward*（第 4
版，2019）；A.K. Erlang，*The Theory of Probabilities and Telephone
Conversations*（1909）。

### Q4 — “在计划利用率下，P90 和 P99 时的 P(SLA breach) 分别是多少？”

**推荐答案**：两个概率，使用你的具体 N、AHT 和 SLA 目标通过
Erlang-C 计算得出（而非猜测）。如果 P(breach at P90)
> 10%，说明你在规模配置点上的人员不足。如果 P(breach at P99) >
50%，说明你没有峰值应对计划，而下一次高峰事件将会惊动
CEO。

**经典依据**：Erlang（1909）；Hopp 与 Spearman，*Factory Physics*（第 3 版，
2008），VUT 方程。

### Q5 — “你是否已为今年人员流失所需的替补招聘编列预算？”

**推荐答案**：是，并给出一个具体数字。按 30% 的年度
流失率（Bersin BPO 中位数），一个 20-FTE 的团队今年将流失约 6 人。
如果你的“净增 5 人”计划实际上是一个“招聘 11 人”的计划，那么招聘
规模将发生巨大变化。反模式 #3。

**经典依据**：Bersin/Deloitte 人才基准（2015-2023）；Edward Lawler，
*Strategic Workforce Planning*（USC CEO，2008）。

### Q6 — “管理幅度何时会触发经理招聘？候选人是谁？”

**推荐答案**：一个具体季度（来自 `hiring_sequencer.py`），
以及至少一名已确定的候选人（内部负责人或外部招聘人选）。
每位经理管理超过 7 名 IC 后，1:1 的质量会下降、反馈周期会延误、人员流失率
会上升。超过 10 名后，就会出现管理覆盖危机。应在
超过 10 名**之前**招聘经理，而不是之后。

**典据**：Camille Fournier，*The Manager's Path*（O'Reilly，2017），
第 5 章；Andy Grove，*High Output Management*（1983）。

### Q7 — “你针对 P99 日的峰值应对方案是什么？”

**建议答案**：一份明确且有文档记录的方案——溢出处理层、
已签约的 BPO 产能、值班轮换机制、管理层升级处理树，
或者一份书面的服务降级约定，其中说明：“在 P99 日，我们会将 SLA
延长至 X 分钟，并主动通知客户。”如果答案是“到时候再想办法”，
那么 P99 日就会成为一场董事会都能看到的火灾。

**典据**：Hopp 与 Spearman，*Factory Physics*（2008）；Reinertsen（2009）
关于产能裕度纪律的论述。

---

**请按顺序逐一完成这七项。一次只处理一项。把答案写下来。你提交的
方案是否站得住脚，完全取决于你对这七个问题的回答。**