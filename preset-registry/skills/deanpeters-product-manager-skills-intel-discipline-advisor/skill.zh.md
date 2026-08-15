---
name: intel-discipline-advisor
argument-hint: "[the decision or competitive question on your desk]"
description: "Triage a competitive or market question into the right intelligence disciplines, cadence, and executing skill. Use when you know something needs researching but not which channel to run."
intent: >-
  Interactive triage for market intelligence: three adaptive questions about the decision on your desk,
  then numbered recommendations naming the discipline mix (OSINT, FININT, TECHINT...), the cadence, and
  the investigation skill that executes — teaching the decision-to-discipline mapping through use, so
  you eventually stop needing the advisor.
type: interactive
theme: market-intelligence
best_for:
  - "Picking the two or three collection disciplines a specific decision actually needs"
  - "Setting up a watch cadence that matches how fast the evidence really changes"
  - "Learning the decision-to-discipline mapping instead of running everything on everything"
scenarios:
  - "I think a competitor is up to something but I don't know where to look first"
  - "I have four hours this quarter for competitive intel — where do they go?"
estimated_time: "5-10 min"
---
# 情报学科顾问

## 目的

将竞争或市场问题分流到正确的情报响应方案：应该运行八种收集学科中的哪些学科、采用什么节奏、为哪个工件提供输入，以及由哪个技能执行。[`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md) 汇编包含了各个渠道的全部信息；本顾问回答的是忙碌的 PM 真正关心的问题——
*“面对手头的问题，哪两三个渠道最重要，我有限的时间应该投入在哪里？”*
对每个问题都运行所有学科是一种失败模式；围绕决策界定范围才是真正的技艺。
顾问在进行分流时会教授这种映射，因此到第三次使用时，你就不再需要它了。这正是目标。

## 输入

**最适合提供：**用你自己的话描述手头的决策或问题——“我认为[竞争对手 A]正在开发某种东西”“我的 TAM 幻灯片被批得体无完肤”“销售团队总是措手不及。”
**同样有用：**你已经注意到的任何信号（职位发布、定价变化、财报中的言论）、你的时间预算，以及你是否只能使用免费来源。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文转储，或追加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些内容并跳过它们已经涵盖的问题；不要重复询问。

**两手空空也没关系。**顾问会先询问你手头有什么，并提供带编号的情形供你选择。

**调用示例：** `Intel discipline advisor: two of their senior engineers just followed our
CTO on a preprint server, and their careers page doubled — what do I run?`

## 关键概念

- **引导协议：**使用 [`workshop-facilitation`](../workshop-facilitation/SKILL.md) 作为默认交互协议（进入模式、每轮一个问题、进度标签、编号建议）。本文件定义领域逻辑。
- **分流中枢**是 `intelligence-collection-disciplines` 中的工件映射表：
  每种 PM 工件都有已知的学科组合和刷新节奏。顾问的工作是将用户的情形与某一行匹配——并且*展示匹配关系*，因为这种映射本身就是要传授的内容。
- **已经发现的信号就是领先一步。**如果用户注意到职位发布数量激增，则 HUMINT 已经发出过一次信号——建议将从置信度叠加阶梯上的“1 discipline flagged”开始，并指出哪些*独立*渠道可以进行佐证（参见
  [`autonomous-investigation`](../autonomous-investigation/SKILL.md)）。
- **节奏必须与证据变化速度和人员能力相匹配。**定价页面可能每月变化；统计数据发布可能每年才变化。用户无法持续维护的监测还不如不监测——它会让人误以为有人正在关注，从而产生虚假的信心。
- **坦诚的退出路径。**有些问题不需要调查：如果问题是“客户为什么流失”，答案是开展赢单/输单访谈和客户发现，而不是进行专利扫描。顾问会明确指出这一点。

## 应用

这个交互式技能会提出 **3 个自适应问题**，然后给出**编号且结合上下文的建议**。

### 问题 1：你目前要处理什么？

“目前是什么情况？请选择最接近的一项，或自行描述：

1. **怀疑竞争对手有新动作** — 你认为有人正在开发产品、进入市场或重新定位
2. **需要构建或更新某项产物** — TAM/SAM/SOM、竞争战卡、定位、ICP/用户画像、定价分析
3. **利润率或市场结构难题** — 利润率下降、品类发生变化、进入市场的决策
4. **设置持续监测** — 你需要持续跟踪，而不是一次性答案”

### 问题 2：自适应追问

- **如果选择 1（怀疑有新动作）：**“是什么引起了你的注意——招聘信息、定价变化、高管发布的内容、专利，还是客户的评论？（无论你看到了什么，都说明已有一个情报搜集领域发出了信号；我们将选择能够独立佐证该信号的渠道。）”
- **如果选择 2（产物）：**“具体是哪种产物？是否有以前的版本可供差异对比？”
- **如果选择 3（结构难题）：**“这个问题关乎整个行业的结构，还是其中某一家公司的市场地位？”
- **如果选择 4（监测）：**“实事求是地说，你或你的团队能投入多少固定时间——每周 30 分钟、每月半天，还是每季度一天？”

### 问题 3：约束条件

“还有两个简短的约束条件：只能使用免费来源，还是可以使用付费工具？是否有特定的地理区域重点？（区域不同，适用的登记机构和统计部门也不同。）”

### 然后：提出建议

综合信息并给出 **3-5 条编号建议**，每条均需注明：**情报搜集领域组合 → 节奏 → 执行技能 → 为哪个产物提供输入**，并用一行说明它适用于何种情况。始终说明选择这些情报搜集领域的*原因*（即映射表的逻辑），并在确实应当停止时提供退出路径。按照引导协议处理单项选择、组合选择（“1 和 3”）以及自定义方向。

**路由快速参考**（源自产物映射表）：

| 情况 | 情报搜集领域组合 | 执行技能 |
|---|---|---|
| 怀疑有新动作 | 佐证已发现的信号：TECHINT + HUMINT + SIGINT + FININT，并进行融合 | 先使用 [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md) 融合模板，再使用 [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md) |
| 竞争战卡 | SIGINT + OSINT + HUMINT | 使用 [`battle-card-builder`](../battle-card-builder/SKILL.md)，并通过监测保持更新 |
| TAM/SAM/SOM | GEOINT/DEMOINT + FININT 获取率 | [`tam-sam-som-calculator`](../tam-sam-som-calculator/SKILL.md) 模式 3 |
| 定位 / ICP | OSINT + GEOINT/DEMOINT（+ VoC） | [`voice-of-customer-miner`](../voice-of-customer-miner/SKILL.md) → [`positioning-statement`](../positioning-statement/SKILL.md) |
| 行业结构 | FININT + OSINT | [`porters-five-forces`](../porters-five-forces/SKILL.md) |
| 某一家公司的市场地位 | OSINT + FININT + HUMINT | [`swot-analysis`](../swot-analysis/SKILL.md) 或 [`company-intel`](../company-intel/SKILL.md) |
| 定价问题 | SIGINT + FININT | [`pricing-packaging-tracker`](../pricing-packaging-tracker/SKILL.md) |
| 宏观环境敞口 | GEOINT/DEMOINT + 监管类 FININT | [`pestel-delta-monitor`](../pestel-delta-monitor/SKILL.md) |
| 持续监测 | 每周进行 SIGINT，每月进行 OSINT+HUMINT，每季度进行 FININT+TECHINT——根据所述投入能力进行调整 | [`competitive-intel-watch`](../competitive-intel-watch/SKILL.md) |
| 全局视图 | 按顺序使用上述所有领域 | [`competitive-analysis-process`](../competitive-analysis-process/SKILL.md) |

最后，提供根据本次会话填写完成的单页**分诊卡**（[`template.md`](template.md)）——其中包括行动路线、选择该路线的“原因”以及复盘日期，作为交接材料。

## 示例

**示例流程（虚构）：**

> **Q1** → 用户：“1——我认为 [Competitor A] 正在布局数据平台。”
> **Q2** → 用户：“他们招聘页面上的职位数量翻了一番，主要是数据工程师。”
> **Q3** → 用户：“免费来源，仅限美国。”
>
> “你观察到的招聘动向意味着 **HUMINT 已经发出过一次信号**——单一情报学科提供的只是轶事性证据，
> 因此接下来的任务是通过*独立*渠道进行佐证。建议如下：
>
> 1. **本周开展 TECHINT 扫描**（patents.google.com + 他们的 GitHub 组织 + arXiv 机构关联，免费）——
>    如果在招聘激增所对应的同一专业领域发现论文或专利集群，这将构成当前可获得的最强融合证据组合。
>    *优先选择此项：每小时投入所获得的佐证价值最高。*
> 2. **进行 30 分钟的 SIGINT 检查**（使用 crt.sh 查找新子域名，对其产品页面执行 Wayback 差异比较）——
>    如果进展比招聘信号所暗示的更深入，这可以捕捉到发布前的准备活动。
> 3. **在他们下一次财报电话会议上开展 FININT 分析**——留意其是否回避资本支出问题，以及业务板块措辞是否发生
>    变化；可通过其 IR 页面免费获取。*速度较慢，但能够把假设转化为可供汇报的情报。*
> 4. **改为设置监测任务**——如果本季度无法为此投入工时，就把 [Competitor A] 接入
>    `competitive-intel-watch`，按月监测，让固定节奏来捕捉相关信号。
>
> 回复 1、2、3、4，或选择类似“1 和 2”的组合，也可以告诉我更多信息。（两个相互印证的情报学科 = 工作假设；
> 三个 = 向领导层汇报。）”

**实际应用退出路径：**用户选择了“交付物：更新 ICP”，但 Q2 揭示出真正的问题是
“为什么我们最近三笔企业级交易都停滞了？”诚实的建议应优先开展赢单/输单访谈（HUMINT 的事实核验层），并使用
[`discovery-interview-prep`](../discovery-interview-prep/SKILL.md)
——“如果流失的潜在客户自己能更好地回答这个问题，那么任何公开网络扫描都无法取而代之。”

如需查看完整的端到端会话，请参阅 [`examples/conversation-flow.md`](examples/conversation-flow.md)：
包括通过内联输入提前回答三个问题中的两个、一个被真正采信的容量回答、一次组合选择，以及一次通过“告诉我更多”换来的教学式回答。
[`examples/conversation-flow-industrial.md`](examples/conversation-flow-industrial.md) 展示了针对现实世界实体信号的
路由变化——使用许可证和海关数据，而非网站差异比较。

## 常见误区

- **把全部八种学科都开出来。** 推荐每一种情报学科，就等于拒绝进行分诊。与决策相匹配的两三个
  渠道胜过徒有其表的全面覆盖——映射表的存在就是为了让你有所取舍。
- **忽视已经发现的信号。** 用户提供的线索是沿证据叠加阶梯前进时无需成本的先发优势。
  推荐会*重新检测*同类信号的渠道无法增加任何佐证价值；只有独立性才能形成证据叠加。
- **不切实际的节奏。** 为只能按季度投入注意力的团队设计每周监测。询问容量问题，并相信用户的回答。
- **只做路由，不做教学。** 给出建议却不说明“原因”，就会抹去其中的经验价值。每项建议都应展示其映射表逻辑——
  用户离开时不仅应得到分诊结果，还应变得更擅长分诊。
- **没有退出路径。** 强行把每个问题都塞进调查流程。客户发现、赢单/输单分析和支持工单对某些问题的回答
  优于任何公开网络扫描；事实如此时，就应该明确指出。

## 参考资料

- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md)（组件）— 本顾问所导向的技能汇编；与本技能构成教学配对
- [`workshop-facilitation`](../workshop-facilitation/SKILL.md)（交互式）— 引导协议
- [`autonomous-investigation`](../autonomous-investigation/SKILL.md)（工作流）— 相关建议所依赖的置信度叠加与证据标签
- 执行类技能：[`competitive-intel-watch`](../competitive-intel-watch/SKILL.md)、[`battle-card-builder`](../battle-card-builder/SKILL.md)、[`tam-sam-som-calculator`](../tam-sam-som-calculator/SKILL.md)、[`porters-five-forces`](../porters-five-forces/SKILL.md)、[`swot-analysis`](../swot-analysis/SKILL.md)、[`voice-of-customer-miner`](../voice-of-customer-miner/SKILL.md)、[`pricing-packaging-tracker`](../pricing-packaging-tracker/SKILL.md)、[`pestel-delta-monitor`](../pestel-delta-monitor/SKILL.md)、[`competitive-analysis-process`](../competitive-analysis-process/SKILL.md)
- [`discovery-interview-prep`](../discovery-interview-prep/SKILL.md)（交互式）— 当问题属于探索范畴时的转接路径
- [`intelligence-collection-disciplines`](../intelligence-collection-disciplines/SKILL.md) 的交互式配套技能。