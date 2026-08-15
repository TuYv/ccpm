---
name: company-intel
argument-hint: "[company, industry, or competitor set]"
description: Research a company, industry, or competitor set using web search and seven analytical lenses. Use when you need structured intel that feeds downstream PM skills.
intent: >-
  Act as a research engine that builds deep, structured understanding of companies, industries,
  and competitor sets through **seven analytical lenses** — financial landscape, market offer,
  product portfolio, competitive dynamics, rising trends, PM implications, and strategic signals
  (patents, hiring, leadership). Produces a stable, structured output that downstream skills
  consume to generate battlecards, SWOT analyses, positioning statements, PESTEL assessments,
  and market sizing. Supports four entry points: single company, industry/sector, named competitor
  set, or company + "discover my competitors" (researches the company first, identifies likely
  competitors, confirms the list, then runs the full competitor set analysis).
type: workflow
best_for:
  - "Building deep company or industry knowledge before a client engagement or workshop"
  - "Generating structured research that feeds battlecards, SWOT, positioning, or PESTEL"
  - "Running a competitive scan across 3-5 companies with cross-company comparison"
  - "Refreshing intel quarterly on companies you track"
scenarios:
  - "Run company-intel on [company or their domain, e.g. helix-motion.com]"
  - "Give me intel on the clinical data management industry"
  - "Compare [Company A], [Company B], and [Company C]"
  - "Run company-intel on [company] competitors"
  - "Refresh my intel on [company] — what's changed since last quarter?"
theme: market-intelligence
estimated_time: "30-60 min"
---
## 目的

构建对公司、行业和竞争对手集合深入且结构化理解的研究引擎。生成稳定的输出格式，可交由其他技能和智能体进一步制作竞争作战卡、SWOT 分析、定位陈述、PESTEL 评估、市场规模测算和研讨会内容。

这并非通用的百科全书式查询。每个部分都旨在推动对商业的理解、产品层面的启示以及可执行的情报。其输出是一种研究基础单元——供其他技能使用的结构化数据——而非最终交付成果。

## 输入

**最适合提供：** 研究目标：一家公司、一个行业或一组竞争对手。  
**同样有用：** 下游用途（竞争作战卡、SWOT、定位、市场规模测算），以便研究侧重于恰当的分析视角，以及任何关于深度或时效性的限制。

调用时随附的任何内容——技能名称后的文本、粘贴的上下文信息，或追加的 `ARGUMENTS:` 行——均视为已经给出的答案。直接使用这些信息，并跳过其中已经涵盖的问题；不要重复询问。

**没有准备任何信息？也没问题。** 工作流会先询问研究目标，以及这些情报将用于何种用途。

**调用示例：** `Research Figma and its top 3 competitors — output feeds a positioning workshop next week.`

## 核心概念

### 四种入口

该技能会根据用户输入自动检测入口类型。如果含义不明确，则提出一个澄清问题：“这是关于某家具体公司、某个行业，还是一组竞争对手？”

**单一公司** —— 用户指定一家公司（例如，“Helix Motion Systems”“Brightwater Biologics”，或任何真实公司）。为该公司生成包含全部 11 个部分的输出。

**行业/领域** —— 用户指定一个行业、领域或细分市场（例如，“临床数据管理”“嵌入式金融”“上游石油和天然气”）。先建立宏观行业背景，再聚焦到细分市场，并将研究发现与产品经理层面的启示联系起来。采用相同的 11 部分结构，并针对行业层面的分析进行调整。

**指定的竞争对手集合** —— 用户指定 2 至 5 家公司（例如，“比较 Helix Motion、Northfield Automation 和 Corvid Industrial”）。分别为每家公司生成包含 11 个部分的输出，然后添加**第 12 部分：跨公司比较**，对整个集合进行综合分析。

**发现竞争对手** —— 用户指定一家公司并加上“竞争对手”一词（例如，`helix-motion.com competitors` 或 `Helix Motion Systems competitors`）。该技能将：
1. 首先研究指定的公司——达到足以了解其业务、服务对象和所在市场的程度（对分析视角 1-4 进行轻量级研究）
2. 根据研究结果确定 3 至 5 个可能的竞争对手，并说明各自为何构成竞争对手（直接竞争者、相邻领域竞争者、替代者或新兴颠覆者）
3. 展示列表以供确认：“根据我的研究，[Company] 最接近的竞争对手似乎是 [A, B, C, D, E]。是否要针对这些公司运行完整的竞争对手集合流程，还是先调整列表？”
4. 确认后，进入指定竞争对手集合流程——分别为每家公司生成包含全部 11 个部分的输出，并添加第 12 部分的跨公司比较

用户也可以提供 URL，而不是公司名称（例如，“helix-motion.com”）。该技能应根据 URL 确定对应的公司，开展相应研究，然后继续执行。

---

### 七个研究视角

这些视角构成所有分析的框架。将每个视角应用于每个入口点。

**视角 1 — 财务格局与业务成果**
该实体如何赚钱。主要收入来源和成本驱动因素、利润率压力、增长杠杆、客户留存与扩张动态、资本密集度、季节性或周期性模式，以及影响业绩的主要风险。

**视角 2 — 市场供给与商业模式**
该实体如何创造和获取价值。目标市场、购买者、用户、影响者、管理员和阻碍者。各细分市场有何差异。多边或多利益相关方动态。

**视角 3 — 产品组合与产品成果**
主要供给、产品系列、服务、平台和渠道。捆绑式解决方案、生态系统布局。数字化组件与人工辅助组件。传统供给与新兴供给。区分业务线、供给、产品、功能集、服务层和赋能平台。

**视角 4 — 竞争动态**
直接竞争对手、相邻领域竞争对手、替代方案和新兴颠覆者。差异化优势在哪些方面建立或丧失。

**视角 5 — 上升趋势与战略关切**
市场趋势、监管力量、技术变革（尤其是 AI 和自动化）、运营约束、购买者期望的变化，以及整合或商品化带来的威胁。

**视角 6 — 此处的产品管理如何运作**
产品驱动、销售驱动或服务驱动的行为。集中式或联邦式产品组织。平台导向或解决方案导向。路线图与创新姿态。合规或治理负担。用户发现成熟度、数据成熟度、实验成熟度和 AI 成熟度。跨职能摩擦。明确标注推断。

**视角 7 — 战略信号**
三类信号——始终检查全部三类：
- **专利活动：** 通过专利数据库查看近期申请和授权。技术领域、研发集群，以及专利活动与公开产品叙事之间的差距。
- **招聘信号：** 大量开放的职位、职位描述中的技能和工具、所招聘人员的资历级别，以及能够揭示产品文化的措辞（用户发现、成果、AI 原生、监管、实验）。
- **领导层变动：** 过去 12-18 个月内高管和产品领导者的到任或离职。新领导者的来源（平台公司、咨询公司、竞争对手）。新设、撤销或重组的 CPO、CTO 或 CDO 职位。董事会层面的变动。

专门用于解读产品组织的敏锐启发式规则：
- **CPO/VP Product 任期：** 过去 12-18 个月内新聘产品领导者，几乎总是意味着此前的方法失败了——分析其此前任职的机构类型（平台公司？咨询公司？竞争对手？），以判断预期的纠偏方向。
- **将 PM 招聘信息视为文化文档：** 他们如何定义 PM 角色——成果导向的语言还是功能/路线图导向的语言、对用户发现的要求、PM 向谁汇报——比任何“关于我们”页面都更能揭示产品在该组织中实际如何运作。
- **员工评价主题：** 围绕“路线图混乱”“优先级每周都变”或“产品与工程之间关系紧张”等内容形成的主题集群，可作为视角 6 的证据——置信度为社区级，需加以标注，但往往是最早出现的真实信号。

**解读组织困境（可选深化内容，用于互动或合作准备）。** 当情报支持与公司展开对话时——无论是合作、销售推进还是求职面试——都应加入
困境解读：最可能的**表象问题**（他们会说哪里出了问题）与可能的
**根本问题**（证据表明实际出了什么问题）分别是什么？是否发生过**触发事件**
——未达业绩指引、产品发布失败、组织重组，或新任高管接手了一个烂摊子？评估其
困境程度：*运营良好，正在优化* → *知道出了问题* → *已经陷入困境，但尚未意识到*。
将整段解读标记为“推断”；这是文件中最有用、但确定性最低的部分。

---

### 需要始终保持的关键区分

始终严谨对待以下区别——混淆它们会导致分析流于肤浅：
- 市场 vs 细分市场
- 购买者 vs 用户
- 产品 vs 服务
- 业务成果 vs 产品成果 vs 产出
- 战略 vs 战术
- 发现 vs 交付
- 平台 vs 应用
- 信号 vs 假设
- 收入增长 vs 市场份额增长 vs 客户终身价值提升 vs 成本降低

---

### 值得揭示的矛盾

突出呈现所有出现的冲突与权衡：
- 增长 vs 合规
- 规模化 vs 定制化
- 数字化自助服务 vs 高接触度服务
- 标准化 vs 特定领域工作流
- 创新 vs 遗留负担
- AI 雄心 vs 治理现实
- 客户价值 vs 内部效率
- 短期收入 vs 长期平台投资

---

### 为什么这种方法有效

- **基于网络信息：** 使用实时搜索，而非依赖训练数据记忆——输出中包含引用
- **贴合产品经理思维：** 每个部分都关联到对产品管理的启示，而不只是罗列业务事实
- **可组合：** 输出格式稳定，下游技能可以解析和使用
- **可重复：** 下个季度使用相同输入可获得最新情报——变化本身就是故事
- **信号驱动：** 战略信号（专利、招聘、领导层）往往是最真实的可用数据——它们揭示的是公司实际上在做什么，而不是公司声称自己在做什么

---

### 反模式

- **不是维基百科式摘要：** 不要止步于“他们做什么”，而要深入到“这对产品决策意味着什么”
- **不是财务分析：** 重点是产品战略和商业动态，而不是估值或股票推荐
- **不是提示词生成器：** 输出是包含引用的实际研究，而不是供未来会话使用的提示词
- **不是一次性工作：** 按季度更新进行设计——再次运行并比较变化

---

### 研究要求

**积极使用网络搜索。** 此技能要求实时收集数据，而不是依赖训练数据记忆。搜索并引用：
- 投资者关系资料、年度报告、财报电话会议记录
- 公司产品页面和官方战略页面
- 监管披露和备案文件
- 专利数据库（Google Patents、USPTO）
- 公司招聘页面和职位聚合平台（LinkedIn、Indeed、Glassdoor）
- 高管任命公告和领导层变动报道
- 行业分析机构（Gartner、Forrester、IDC）以及信誉良好的新闻报道

**引用来源。** 每项事实性主张都应包含来源。使用 [`autonomous-investigation`](../autonomous-investigation/SKILL.md) 中的规范证据标签：**Fact**
（有来源支持）、**Inference**（基于证据的解读）、**Assumption**（暂定猜测）。
当你进行推断时——尤其是在视角 6（产品经理文化）和视角 7（战略信号）中——应说明
依据：“基于 [evidence] 的 Inference。”

**来源优先级阶梯。** 一手来源（监管文件、财报电话会议、投资者资料）→ 可信的二手来源
（主流商业媒体、行业出版物）→ 社区来源（Glassdoor、评论网站、论坛——置信度较低）
→ 推断性信号（招聘信息、公告）。说明每项主张位于哪个层级。

**时效性很重要。** 优先采用过去 12-24 个月内的来源。明确标记任何早于 18
个月的内容。

**不要粉饰。** 尖锐的产品评价、对领导层的公开批评、员工对路线图混乱的描述——
这些都应纳入文件，并加上标签和来源。吹捧研究对象的情报只是营销；读者需要的是真实情况。

## 应用

### 第 1 步：识别入口类型

根据用户输入确定：
- **单家公司** → 针对一个实体进入第 2 步
- **行业/领域** → 进入第 2 步，调整各部分以适应行业层面的分析
- **指定的竞争对手集合**（列出 2-5 家公司）→ 对每家公司执行第 2 步，然后进入第 3 步
- **发现竞争对手**（一家公司 + “竞争对手”）→ 进入第 1b 步，然后对每家公司执行第 2 步，再进入第 3 步
- **提供了 URL**（例如，“helix-motion.com”）→ 解析出公司名称，然后根据任何其他上下文识别入口类型

如果存在歧义，询问一个问题：“这是关于某家特定公司、某个行业，还是一组竞争对手？”

如果用户提供了其他上下文（例如，“我正在准备与他们开展客户合作”或“我们在 SMB 细分市场与他们竞争”），请利用该上下文来决定应更深入分析哪些视角。

---

### 第 1b 步：发现竞争对手（当入口类型为“发现竞争对手”时）

1. **研究指定的公司**，使用网页搜索。对视角 1-4 进行一次轻量级梳理——足以了解该公司做什么、服务哪些客户、参与哪个市场，以及如何创造价值。

2. **根据研究结果识别 3-5 个可能的竞争对手。** 对每个竞争对手说明：
   - 公司名称
   - 为什么它是竞争对手（直接竞争者、相邻竞争者、替代者或新兴颠覆者）
   - 用一句话描述它如何展开竞争

3. **展示列表以供确认：**

   “根据我的研究，[Company] 是[简要描述——它做什么以及服务哪些客户]。

   它最接近的竞争对手似乎是：
   1. **[Competitor A]** — [关系：直接竞争者/相邻竞争者/替代者/颠覆者]。[原因。]
   2. **[Competitor B]** — [关系]。[原因。]
   3. **[Competitor C]** — [关系]。[原因。]
   4. **[Competitor D]** — [关系]。[原因。]
   5. **[Competitor E]** — [关系]。[原因。]

   要我对这些公司执行完整的竞争对手集合分析吗？在我继续之前，你也可以添加、移除或替换其中任何一家公司。”

4. **确认后，** 对每家公司（包括最初的公司）执行第 2 步，然后执行第 3 步（跨公司比较）。

---

### 第 2 步：研究并生成输出

使用网络搜索，从全部七个视角收集数据。生成以下包含 11 个部分的输出：

```markdown
## 1. What This Entity Is
[Business definition, founding, market position, scale. What makes it distinct.]

## 2. How It Makes Money
[Revenue streams, cost structure, margin dynamics, financial logic.
Seasonal or cyclical patterns. Growth levers and risks.]

## 3. Who It Serves
[Buyers, users, influencers, administrators, blockers.
Segment differences. Multi-stakeholder complexity.]

## 4. What It Sells or Delivers
[Core value propositions. Key offers in plain language.
How the offer creates value for the customer.]

## 5. Key Product Lines or Offers
[Mapped by product family, platform, service, channel.
Digital vs human-assisted. Legacy vs emerging.
Distinguish: business line, offer, product, feature set,
service layer, enabling platform.]

## 6. Business and Market Pressures
[Competitive forces, regulatory pressure, technology shifts,
operational constraints. Name the tensions.]

## 7. Competitors and Alternatives
[Direct competitors, adjacent competitors, substitutes,
emerging disruptors. Where differentiation is won or lost.]

## 8. Important Trends and Risks
[Macro forces, buyer expectation shifts, AI and automation impact,
consolidation or commoditization threats.]

## 9. Strategic Signals
[Patent activity: recent filings, technology domains, R&D bets.
Hiring signals: volume roles, skills language, seniority patterns.
Leadership changes: arrivals, departures, origins, new roles created.
Include sources for each signal.]

## 10. What This Means for Product Management
[PM implications: org dynamics, discovery maturity, delivery model,
cross-functional friction, AI readiness. Product-led vs sales-led.
Likely PM challenges. Domain-specific skills PMs would need.
Label inferences.]

## 11. Sources and Confidence
[List all sources used, organized by section.
Flag assumptions and inferences explicitly.
Note any sections where data was thin or unavailable.]
```

**每个部分的质量检查：**
- 是否超越了描述，进一步阐明其影响？
- 是否指出了具体矛盾，而不只是罗列事实？
- 是否引用了来源？
- 是否标明了推断？

---

### 第 3 步：跨公司比较（仅适用于竞争对手集合）

当入口为竞争对手集合时，先为每家公司分别生成第 1 至第 11 部分的输出，然后添加：

```markdown
## 12. Cross-Company Comparison

### Where They're Betting Differently
[Patent clusters, hiring patterns, leadership hires that diverge.
Which companies are investing in AI, which in services,
which in platform plays.]

### Where They're Converging
[Same platform moves, same market pivots, same talent profiles.
When everyone zigs together, that's table stakes — not differentiation.]

### Gaps and White Space
[What none of them are covering. Segments underserved.
Capabilities nobody is building. Buyer needs unaddressed.]

### Tensions That Play Out Differently
[e.g., Company A chose scale over customization;
Company B chose the opposite. Who's winning, and for whom?]

### PM Implications Across the Set
[What a PM at each company would face differently.
Which org is better set up for discovery?
Which is most constrained by legacy?]
```

---

### 第 4 步：交接菜单

生成输出后，向用户提供一个交接菜单。每个选项都要说明将构建什么内容，以及由哪个技能或智能体使用这些研究：

“你的研究已准备就绪。你希望基于它构建什么？

1. **竞争对手作战卡** — 我会为你的销售或战略团队构建一份一对一对比分析
2. **SWOT 分析** — 我会以研究结果为输入，分析优势、劣势、机会和威胁
3. **定位陈述** — 使用 `positioning-statement` 技能，并加载这家公司及市场的相关背景
4. **PESTEL 评估** — 使用 `pestel-analysis` 技能，并将第 6 节和第 8 节中的趋势与压力作为输入
5. **市场规模测算（TAM/SAM/SOM）** — 使用 `tam-sam-som-calculator` 技能，并将第 2-3 节中的市场及细分市场数据作为输入
6. **用于深入调查的研究提示词** — 针对每个分析视角生成 3-5 个有针对性的研究提示词，供后续会话使用
7. **产品经理简报备忘录** — 将这 11 个部分压缩成一份面向产品经理受众的单页执行摘要
8. **研讨会讨论指南** — 提取可用于教学的矛盾点和案例研究角度，供培训使用

请选择一个编号，也可以组合选择（例如“1 和 4”），或描述你的需求。”

---

### 重新运行模式（高管信号刷新）

当用户针对之前研究过的实体重新运行该技能，或要求进行季度刷新时，
应将其作为增量调查运行，而不是重新生成：

- **搜索前完整阅读之前的输出**；将其作为基准进行差异比较。将网络搜索聚焦于此后
  的时间段（通常是最近 90 天），并优先使用一手来源：财报电话会议实录、监管文件、
  投资者日资料、高管直接访谈。必须*准确*引用高管原话——绝不能捏造引语、
  数据或指引。
- 在所有完整章节之前，先提供一份 **“发生了什么变化”** 摘要。对于每项重大变化，使用
  之前/现在的形式：
  - **之前：** 上一次运行记录的内容
  - **现在：** 新信号——“准确引语或观察”（来源、日期、URL）
  - **解读：** 这对战略或产品可能意味着什么（标注为“推断”）
  - **置信度：** 高 / 中 / 低
- 包含一个 **不再使用的表述** 小节：列出公司环比不再
  提及的举措、措辞或指标。领导者不再说什么，往往是最强烈的信号——某项
  转型计划从财报讲稿中消失，可能意味着它在没有新闻稿的情况下已经终止。应将
  财报材料视为战略文件，而不是财务惯例：该技能的关键在于区分叙事变化与
  指标变化。
- 在第 9 节（战略信号）中，突出显示与上一次运行相比的增量变化：新招聘、新专利、领导层变动
- 标记没有实质性变化的章节：“自 [prior date] 以来无重大变化”——如果
  多次运行期间持续保持平静，则将这种平静本身也视为一种信号。

用户无需说“刷新”——如果智能体的上下文中已有之前的输出，则应默认
优先进行增量报告。若要以较低深度监控整个竞争对手*集合*，请交接给
[`competitive-intel-watch`](../competitive-intel-watch/SKILL.md)；本刷新模式会针对一家公司进行深入研究。

完整的刷新示例（虚构的工业企业）参见 [`examples/executive-signal-refresh.md`](examples/executive-signal-refresh.md)——包括「过去/现在」的变化、足以支撑标题的「弃用语言」解读，以及宁可标注信息等级也不填充内容的冷门章节。[`examples/executive-signal-refresh-saas.md`](examples/executive-signal-refresh-saas.md)
是其 SaaS 对应版本，其中需要关注的词汇有所不同——套餐名称、"self-serve"、NRR 表述方式——
但整体模式不变。

## 示例

### 示例：单家公司 — Helix Motion Systems *（虚构公司，本节所有示例中的公司均为虚构）*

**触发语：** "对 Helix Motion Systems 运行 company-intel"

**入口点：** 单家公司

**第 1 节摘录：**
Helix Motion Systems 是一家大型多元化工业制造商，专注于运动与控制技术。这家拥有百年历史的企业设有两个业务部门：多元化工业（约占营收的 85%）和航空航天系统（约占 15%）。近期一项价值数十亿美元的航空航天收购显著扩展了第二个业务部门。

**第 9 节摘录：**
- **专利：** 集中在电液控制和氢燃料电池组件领域。电气化研发投入增速超过公开产品发布速度——这表明公司正押注工业脱碳。*（来源：Google Patents，2024-2025 年申请文件）*
- **招聘：** 多元化工业部门正在大规模招聘「数字孪生」工程师和物联网平台架构师。职位描述中提及 AWS IoT 和 Azure Digital Twins。*（来源：LinkedIn、Indeed — 2026 年 6 月）*
- **领导层：** 2025 年从一家平台导向型自动化竞争对手处聘请了新的数字化转型副总裁。2024 年从一家多元化企业集团聘请了新的工程材料集团总裁。呈现出的模式是：从平台优先型工业企业引进人才。*（来源：公司新闻稿）*

**第 10 节摘录：**
Helix 的产品经理面临典型的工业领域矛盾：较长的产品生命周期（10-20 年）与数字化及构建经常性收入服务层的压力相冲突。产品管理历来由工程驱动，而非客户驱动。探索工作受到以下事实的制约：客户（OEM、公用事业公司、国防承包商）的采购周期很长，而且对实验的容忍度很低。招聘信号表明公司正在推动平台化思维，但其组织结构（以业务部门为基础的 P&L）会激励各部门进行局部优化，而不是构建横向平台。*推断：数字孪生相关招聘的进展可能已经超出了组织消化此类能力的准备程度。*

---

### 示例：竞争对手集合 — 工业运动控制

**触发语：** "使用 company-intel 比较 Helix Motion、Northfield Automation 和 Corvid Industrial"

**入口点：** 竞争对手集合（3 家公司）

**第 12 节摘录（跨公司比较）：**

**它们押注的不同方向：**
- Helix 正在大力投资电气化和氢能（有专利证据）。Northfield 押注软件定义自动化（进行了一项重大工业软件收购）。Corvid 正拆分为三家公司，并进一步押注航空航天自主技术。

**空白与市场机会：**
- 三家公司都没有为其数字产品建立可信的 PLG 模式——全部依赖企业销售。一家能够突破自助式工业物联网工具瓶颈的初创公司，可能会凭借更快的采用速度击败这三家公司。

**这组公司对 PM 的启示：**
- Helix PM = 工程师优先，对平台感兴趣，但受业务分部壁垒限制
- Northfield PM = 收购后由软件驱动，同时需要应对传统 OT 文化
- Corvid PM = 拆分后陷入身份危机，航空航天 PM 和工业 PM 如今分属不同公司

---

### 反面模式示例

**较弱：**“Helix Motion Systems 制造工业设备，财务状况稳健。”

**较强：**指出 Helix 的运动与控制平台业务（经常性收入、较长的服务周期）与其向智能制造和 IIoT 领域拓展之间的张力，并解释这种张力为何会在自建还是合作的决策、售后市场变现，以及资产密集型行业采用数字产品的速度等方面带来具体的 PM 挑战。

## 常见陷阱

### 陷阱 1：只有表层描述，没有阐明影响
**症状：**摘要读起来像维基百科词条或新闻稿。
**后果：**没有可执行的情报。下游技能无法从中获得任何有用信息。
**修正：**推动每个章节回答“这对产品决策意味着什么？”如果某项事实无法关联到某种张力、权衡或 PM 启示，它就没有发挥应有的作用。

### 陷阱 2：忽略战略信号
**症状：**分析仅来自新闻稿和“关于我们”页面。第 1-8 节内容扎实；第 9 节却空洞或泛泛而谈。
**后果：**你看到的是公司*声称*自己正在做什么，而不是它*实际上*正在做什么。专利、招聘和领导层变动往往是最真实可信的信号。
**修正：**始终将搜索专利、招聘和领导层信息作为必需步骤——即使搜索结果很少。“未发现重大专利活动”本身也是一种信号。

### 陷阱 3：混淆产出与成果
**症状：**只罗列功能或产品，却不解释它们为客户或企业带来了什么结果。
**后果：**第 5 节变成了产品目录，而非战略情报。
**修正：**对于每项产品或服务，都要回答：它解决了什么问题、为谁解决、改善了什么成果，以及促成了什么行为变化？

### 陷阱 4：没有引用来源
**症状：**“CEO 表示公司正专注于 AI。”没有来源、日期或上下文。
**后果：**陈述无法核实。下游使用者无法信任这项研究。
**修正：**注明来源和日期。“CEO Jane Doe 在 2026 年第一季度财报电话会议中表示 X（来源：Seeking Alpha 文字记录，2026 年 2 月）。”

### 陷阱 5：将所有行业视为相同
**症状：**应用通用 PM 框架，却未根据具体领域进行调整。“他们应该开展更多探索”，却没有意识到国防合同领域的探索与消费级 SaaS 的探索截然不同。
**后果：**第 10 节对真正从事该领域工作的人毫无用处。
**修正：**明确 PM 在这一特定领域有何*不同*——监管负担、买方与用户分离、资本密集度、销售周期长度、服务依赖性。

### 陷阱 6：一次性调研，永不更新
**症状：** 情报只收集一次，此后从不更新。基于 18 个月前的招聘信号做出决策。
**后果：** 过时的情报比没有情报更糟糕——它会造成虚假的信心。
**修复：** 设定重新运行的周期（对活跃竞争对手每季度一次，对行业背景每年一次）。重新运行时，以“发生了什么变化”开篇。

## 下游组合指南

本节面向希望使用 company-intel 输出的其他技能作者和智能体构建者。

### 此技能会生成什么

一份包含 11 个编号章节的结构化 Markdown 文档（竞争对手集合为 12 个章节）。每个章节都有稳定的标题和明确的内容类型：

| 章节 | 内容类型 | 下游用途 |
|---------|-------------|----------------|
| 1. 此实体是什么 | 实体定义、规模、市场地位 | 为任何下游技能提供背景信息 |
| 2. 它如何赚钱 | 收入、成本、利润率、财务逻辑 | `business-health-diagnostic`、`feature-investment-advisor` |
| 3. 它服务谁 | 买家、用户、细分市场、利益相关者图谱 | `proto-persona`、`jobs-to-be-done`、`positioning-statement` |
| 4. 它销售或交付什么 | 价值主张、核心产品或服务 | `positioning-statement`、竞争作战卡 |
| 5. 关键产品线 | 产品系列、平台、服务 | 竞争分析、产品组合映射 |
| 6. 业务和市场压力 | 竞争、监管、技术力量 | `pestel-analysis`、`derisk-measurement-advisor` |
| 7. 竞争对手和替代方案 | 直接竞争者、相邻竞争者、替代品、颠覆者 | 竞争作战卡、竞争定位 |
| 8. 重要趋势和风险 | 宏观力量、AI 影响、行业整合 | `pestel-analysis`、`derisk-measurement-advisor` |
| 9. 战略信号 | 专利、招聘、领导层变动 | 竞争情报、趋势分析 |
| 10. 这对产品经理意味着什么 | 组织动态、探索成熟度、产品管理挑战 | 研讨会内容、辅导、合作准备 |
| 11. 来源和置信度 | 引用、假设、数据质量标记 | 为所有下游用途提供质量保证 |
| 12. 跨公司比较 | 差异、趋同、差距、矛盾 | 竞争作战卡、SWOT、竞争战略 |

### 如何引用此技能

在你的技能的“参考资料”部分中：
```markdown
- **[company-intel](../company-intel/SKILL.md)** (Workflow) — Run first to generate structured company/industry research; this skill consumes Sections [X, Y, Z] as input
```

### 将输出传递给下游技能

移交给下游技能时，请明确传递相关章节：
- **竞争作战卡** → 第 4、5、7、9、12 节
- **SWOT** → 第 2、6、7、8、9 节
- **定位** → 第 3、4、7 节
- **PESTEL** → 第 6、8、9 节
- **TAM/SAM/SOM** → 第 2、3、5 节
- **业务健康状况** → 第 2、5、8 节
- **产品经理简报** → 第 1、5、9、10 节
- **研讨会指南** → 第 6、9、10 节（矛盾和对产品经理的影响）

## 参考资料

### 相关技能
- **[company-research](../company-research/SKILL.md)**（组件）——更轻量的公司概况，重点关注高管言论和产品战略；`company-intel` 更深入、更广泛，可生成供下游使用的结构化输出
- **[autonomous-investigation](../autonomous-investigation/SKILL.md)**（工作流）——此技能的研究所遵循的证据标签和置信度协议
- **[intelligence-collection-disciplines](../intelligence-collection-disciplines/SKILL.md)**（组件）——支撑视角 1、6 和 7 的 OSINT/FININT/HUMINT 来源表和信号链
- **[competitive-intel-watch](../competitive-intel-watch/SKILL.md)**（工作流）——侧重广度的同类技能：按固定周期监控整个竞争对手集合，而此技能则深入研究单个实体
- **[pestel-analysis](../pestel-analysis/SKILL.md)**（组件）——深度 PESTEL 模板；使用 company-intel 的第 6 节和第 8 节
- **[derisk-measurement-advisor](../derisk-measurement-advisor/SKILL.md)**（交互式）——风险扫描，将第 6 节和第 8 节作为背景输入可提升其效果
- **[tam-sam-som-calculator](../tam-sam-som-calculator/SKILL.md)**（组件）——市场规模估算；使用第 2、3、5 节
- **[business-health-diagnostic](../business-health-diagnostic/SKILL.md)**（交互式）——SaaS 健康状况诊断；使用第 2 节
- **[positioning-statement](../positioning-statement/SKILL.md)**（组件）——定位；使用第 3、4、7 节
- **[acquisition-channel-advisor](../acquisition-channel-advisor/SKILL.md)**（交互式）——市场进入分析；使用第 2、3、7 节
- **[proto-persona](../proto-persona/SKILL.md)**（组件）——创建人物角色；使用第 3 节

### 研究来源
- 公司投资者关系页面——年度报告、财报电话会议记录、前瞻性声明
- 专利数据库——Google Patents、USPTO
- 招聘信息聚合平台——LinkedIn、Indeed、Glassdoor（招聘信号）
- 行业分析机构——Gartner、Forrester、IDC
- 监管申报文件——SEC（美国）、Companies House（英国）、相关行业监管机构
- 新闻报道——Reuters、Bloomberg、行业出版物

### 来源说明
- 改编自 product-manager-prompts 仓库中 Dean Peters 的 company-profile-executive-insights-research 提示词和 TAM-SAM-SOM 提示词生成器
- 融合了为 Productside 企业级产品经理培训开发的 Seven Research Lenses 框架