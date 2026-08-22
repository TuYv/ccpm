---
name: go-to-market-plan
description: Analyzes the founder's business context to deliver 3 best go-to-market strategies tailored to their current stage, product, and market. Asks up to 10 diagnostic questions when needed to understand product readiness, target market clarity, competitive positioning, and distribution channels. Use when user needs go-to-market strategy, launch planning, market entry strategy, or actionable GTM roadmap.
---
# 市场进入计划

## 目的
分析创始人的业务及当前阶段，提供 3 项具体、可执行的市场进入策略，以推动可衡量的市场渗透和客户获取。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
"go-to-market-plan 已加载，请继续提供有关你的产品、目标市场或当前发布情况的详细信息"

然后等待用户在下一条消息中提供需求。

### 如果 $ARGUMENTS 包含内容：
立即进入任务执行（跳过“已加载”消息）。

---

## 任务执行

当用户需求可用时（无论来自初始 $ARGUMENTS 还是后续消息）：

### 1. 读取业务背景
检查项目根目录中是否存在 `FOUNDER_CONTEXT.md`。
- **如果存在：** 读取该文件并提取：公司名称、行业、目标受众、价值主张、产品/服务、业务阶段、竞争对手、定价模式、独特优势。
- **如果不存在：** 进入第 2 步，并通过提问收集这些信息。

### 2. 诊断市场进入准备情况
评估你是否掌握了足够的信息，以制定高可信度、可执行的市场进入策略：

**无需提问即可继续所需的信息：**
- 产品解决什么问题（核心价值主张）
- 理想客户是谁（具体的 ICP，而不是“小型企业”或“所有人”）
- 产品准备阶段（MVP、测试版、可扩展阶段等）
- 竞争格局（还有谁在解决这个问题，以及你的差异化优势）
- 分销模式（直销、渠道合作伙伴、市场平台等）
- 定价策略（免费增值、付费、企业版等）
- 当前市场位置（发布前、已发布但进展不佳、准备扩展）
- 可用资源（团队、预算、资金可维持时间）

**如果掌握了足够的背景信息：** 直接进入第 4 步。

**如果缺少关键信息：** 进入第 3 步。

### 3. 提出诊断问题（需要时）
使用 AskUserQuestion 工具收集缺失的信息。根据需要提出 3-10 个问题：

**核心市场进入问题：**
- 你的产品目前处于什么阶段？（构思、MVP、测试版、已发布、扩展中）
- 谁是你理想的首批客户？（请具体说明：职位、公司规模、行业、痛点）
- 你的产品解决的核心问题是什么？人们目前如何解决这个问题？
- 客户目前如何发现与你类似的解决方案？
- 你目前在市场进入方面遇到的最大困难是什么？
- 你已经尝试过哪些客户获取方式？哪些有效？哪些无效？
- 你有哪些可用资源？（预算、团队、时间线、人脉网络）

**特定情境问题：**
- 对于发布前阶段：“你是否已经验证了产品与市场的匹配度？你与多少人交流过？”
- 对于已发布但进展不佳的阶段：“你目前从哪里获取客户？当前的 CAC 与 LTV 分别是多少？”
- 对于扩展阶段：“哪些渠道有效？阻碍你实现 10 倍增长的限制因素是什么？”
- 对于竞争定位：“你最主要的 3 个竞争对手是谁？为什么有人会选择你而不是他们？”
- 对于定价清晰度：“你是否测试过定价？哪些信号表明客户愿意支付这个金额？”

**重要提示：** 只询问你确实需要的信息。不要询问可以从 FOUNDER_CONTEXT.md 或用户初始消息中推断出的信息。

### 4. 分析市场进入策略
根据收集到的背景信息，分析：

1. **产品市场契合度状态：** 他们是否已实现产品市场契合？你如何判断？
2. **市场切入点：** 楔入点在哪里？（特定细分市场、使用场景或渠道）
3. **竞争定位：** 哪个独特角度能够突破市场噪声？
4. **分销渠道：** ICP 实际会在哪里花时间并做出购买决策？
5. **市场进入模式：** 产品驱动、销售驱动、社区驱动，还是混合模式？
6. **市场时机：** 为什么是现在？市场或技术发生了什么变化？

**关键分析原则：**
- **先聚焦，后扩张：** 最佳 GTM 始于一个范围明确、需求未被充分满足的细分市场
- **在早期，渠道与产品的契合比产品市场契合更重要：** 优秀产品选错渠道 = 无法获得增长动力
- **识别不公平优势：** 人脉网络、专业知识、分销、品牌、技术
- **找到“保龄球瓶”策略：** 哪个客户细分市场能够解锁相邻细分市场？
- **先验证，再扩张：** 不要为假想客户构建 GTM

### 5. 生成 3 个市场进入策略
创建恰好 3 个 GTM 策略，并按契合度和影响力排序：

**选择标准：**
- **具体性：** 是否足够具体，可以在本周执行？
- **渠道市场契合：** ICP 是否真的会在购买旅程中看到它？
- **差异化：** 与竞争对手相比，这是否能让你形成独特定位？
- **可扩展性：** 能否在获得前 10 个客户后继续增长？
- **资源契合：** 他们能否利用当前团队、预算和能力执行？
- **信心：** 只有当你确信它对这个特定产品和市场有效时，才推荐它

**对于每个策略，请撰写：**

**A 部分 — 策略（做什么及为什么）**
- 一行策略名称
- 用 2-3 句话说明 GTM 方法是什么，以及为什么它适合此产品/市场
- 指明它利用了哪个具体的市场楔入点、竞争角度或渠道优势

**B 部分 — 精确执行手册（如何做）**
- 包含具体行动的分步执行计划
- 使用其实际产品名称、ICP 详情和市场具体信息
- 包含具体细节：使用哪些渠道、采用什么信息传达方式、针对哪些细分市场、跟踪哪些指标
- 明确时间表和预期里程碑

**C 部分 — 首个行动（今天就做）**
- 一项可在接下来 30-60 分钟内完成的具体任务
- 必须足够明确，不得存在任何执行歧义

### 6. 格式化并验证
- 按照**输出格式**部分组织输出
- 在呈现输出前，完成**质量检查清单**自检

---

## 写作规则
硬性约束。不得自行解释。

### 核心规则
- 不得提供任何泛泛的 GTM 建议。每个策略都必须针对这个特定产品和市场。
- 使用实际产品名称、ICP 详情、市场具体信息和竞争定位。
- 将契合度最高的策略放在首位（不一定是最具创新性的策略，但必须是最有可能奏效的策略）。
- 每个策略都必须包含具体的执行手册，而不能只是一个概念。
- 明确每个策略需要跟踪的指标。
- 不要使用激励性空话。只提供可执行的 GTM 策略。
- 只使用主动语态。
- 策略必须能在其资源限制范围内执行。

### 具体性规则
- **差：**“使用内容营销”
- **好：**“每周撰写 1 篇深度案例研究，展示 [Product] 如何帮助 [Specific ICP] 解决 [Specific Problem]。发布到 LinkedIn，并以 [Job Titles] 为目标受众。包含 ROI 指标。将内容重新利用为用于出站营销的电子邮件序列。目标：每篇帖子获得 500 次浏览，每月获得 20 条入站线索。”

- **差：**“建立一个社区”
- **好：**“为 [Specific ICP] 创建一个名为‘[Community Name]’的私密 Slack 社区。邀请 20 位精心挑选的客户作为种子成员。每周举办‘Office Hours’，让成员可以提出有关 [Problem Space] 的问题。通过奖励机制鼓励推荐：邀请 3 位同行 = 终身折扣。目标：60 天内达到 100 名成员，周活跃率达到 30%。”

- **差：**“与网红合作”
- **好：**“找出 [Industry] 领域中 10 位拥有 5 万至 20 万订阅者、内容涵盖 [Topic] 的 YouTube 博主。联系他们，提供 [Product] 的免费使用权限，并支付 500 美元固定费用，请他们制作真实客观的评测视频。跟踪：每个视频的观看量、点击率和注册量。目标：达成 3 项合作，在 90 天内获得 500 次以上注册。”

### 基于情境的调整
- **产品市场契合之前：**专注于验证策略（客户访谈、试点项目、设计合作伙伴关系、早期采用者社区）
- **实现产品市场契合之后、规模化之前：**专注于可重复的获客方式（内容引擎、出站营销手册、推荐循环、战略合作伙伴关系）
- **规模化阶段：**专注于渠道多元化、市场扩张、品牌建设以及向高端企业市场进军

- **B2B SaaS：**优先考虑出站营销、内容、产品驱动增长、合作伙伴关系、垂直行业活动
- **B2C 应用：**优先考虑应用商店优化、网红营销、病毒式传播循环、付费社交媒体营销
- **市场平台：**优先发展供给侧（更难获取），需求会随之而来
- **开发者工具：**优先考虑开源、技术内容、开发者社区、产品驱动增长

- **品类创建：**专注于教育优先的内容、思想领导力、品类命名与框架构建
- **竞争激烈的市场：**专注于切入点定位、差异化信息传达、转换激励

### 质量筛选标准
在最终确定任何策略之前，先问：
- 这是否针对这个特定产品和市场，还是适用于任何公司？
- ICP 在其购买旅程中是否真的会看到这些内容或与之互动？
- 这是否利用了难以复制的优势或独特定位？
- 他们能否利用当前资源执行这项策略？
- 我个人是否愿意押注这项策略能够带来市场牵引力？
- 如果其中任何一项的答案是“否”→ 重写或替换该策略。

---

## 输出格式

```markdown
## Your 3 Go-to-Market Strategies

Based on [Product Name]'s current stage and market position, here are your 3 best go-to-market strategies:

---

### Strategy 1: [Strategy Name]

**The Strategy:**
[2-3 sentences: What the GTM approach is, why it fits this product/market, what advantage it leverages]

**The Exact Playbook:**

**Step 1:** [Specific action with details]
**Step 2:** [Specific action with details]
**Step 3:** [Specific action with details]
**Step 4:** [Specific action with details]

**Metrics to Track:**
- [Specific metric 1]
- [Specific metric 2]
- [Specific metric 3]

**Expected Milestones:**
[Concrete outcomes with timeline, e.g., "50 qualified leads within 30 days, 10 customers by day 60"]

**Do This Today:**
[One 30-60 minute action they can take immediately]

---

### Strategy 2: [Strategy Name]

**The Strategy:**
[...]

**The Exact Playbook:**
[...]

**Metrics to Track:**
[...]

**Expected Milestones:**
[...]

**Do This Today:**
[...]

---

### Strategy 3: [Strategy Name]

**The Strategy:**
[...]

**The Exact Playbook:**
[...]

**Metrics to Track:**
[...]

**Expected Milestones:**
[...]

**Do This Today:**
[...]

---

## Execution Priority

**Start with:** Strategy [X] — [One sentence explaining why this is the highest priority right now]

**Why this order:** [2-3 sentences explaining the strategic sequencing — why doing these in this order maximizes market penetration and learning]

---

## Success Criteria

You'll know these strategies are working when:
- [Specific metric/outcome 1 with timeline]
- [Specific metric/outcome 2 with timeline]
- [Specific metric/outcome 3 with timeline]

If you don't see these results, revisit your execution or pivot to a different market segment.
```

**示例：**

```markdown
## Your 3 Go-to-Market Strategies

Based on DevAnalytics's current stage (MVP launched, 12 beta users, targeting engineering managers at Series A-C startups), here are your 3 best go-to-market strategies:

---

### Strategy 1: Design Partnership Program with 5 Target Companies

**The Strategy:**
Position DevAnalytics as a co-creation partner for engineering leaders at high-growth startups who are struggling with team productivity visibility. Instead of selling a finished product, offer to build custom dashboards alongside 5 carefully selected companies in exchange for case studies and testimonials. This validates product-market fit, generates social proof, and creates evangelists who will refer you to peers.

**The Exact Playbook:**

**Step 1:** Identify 5 Series A-C startups (50-150 employees) in your network or LinkedIn 2nd connections who recently raised funding and are likely hiring aggressively. Focus on companies using your tech stack (GitHub, Jira, Linear).

**Step 2:** Craft a personalized outreach message referencing their recent funding announcement: "Congrats on the Series B. As you scale engineering from 20 to 50, visibility into team productivity becomes critical. I'm building DevAnalytics specifically for this problem. Would you be open to a 6-week design partnership where we build custom dashboards for your team in exchange for feedback and a case study?"

**Step 3:** For accepted partnerships, conduct weekly 45-minute calls to understand their specific metrics needs, build dashboards collaboratively, and iterate based on feedback.

**Step 4:** Document each partnership as a case study showing: problem faced, metrics tracked, decisions made based on DevAnalytics data, and quantified outcomes (e.g., "Reduced deployment time by 30%").

**Metrics to Track:**
- Outreach sent: 20 (to get 5 partnerships)
- Partnership acceptance rate (goal: 25%)
- Weekly active users per partnership (goal: >70%)
- Case study completion rate (goal: 100%)

**Expected Milestones:**
5 active design partnerships within 30 days, 3 completed case studies by day 60, 2 paid conversions by day 90.

**Do This Today:**
Open LinkedIn and identify 10 engineering leaders at Series A-C startups who you have a mutual connection with. Export their names, companies, and connection paths to a spreadsheet.

---

### Strategy 2: "Engineering Metrics Playbook" Content + Inbound Engine

**The Strategy:**
Engineering managers at scaling startups are overwhelmed with metric choices (velocity, cycle time, DORA metrics, etc.) but don't know which to track or how to act on them. Create an authoritative "Engineering Metrics Playbook" that becomes the go-to resource for this audience. Position DevAnalytics as the tool that makes implementing these metrics effortless. This builds SEO authority, generates inbound leads, and establishes thought leadership.

**The Exact Playbook:**

**Step 1:** Write a 3,000-word "Engineering Metrics Playbook" covering: which metrics matter at each stage (pre-PMF, scaling, enterprise), how to measure them, what benchmarks to target, and common pitfalls to avoid. Use real examples from your design partnerships.

**Step 2:** Publish on your blog at devanalytics.com/playbook with SEO-optimized title: "Engineering Metrics That Actually Matter: A Playbook for Scaling Startups [2026]". Optimize for keywords: "engineering metrics", "DORA metrics for startups", "engineering KPIs".

**Step 3:** Gate a downloadable PDF version (with additional templates and spreadsheets) behind an email signup. Use ConvertKit or similar to capture leads.

**Step 4:** Distribute aggressively: post on Hacker News, Reddit r/engineering, LinkedIn (tag 10 engineering influencers), Engineering Manager communities (Rands Leadership Slack, LeadDev community), and email to your 12 beta users asking them to share.

**Step 5:** Follow up with email sequence: Day 1: Send the playbook. Day 3: Case study from design partnership. Day 7: Product demo video. Day 14: Free trial offer.

**Metrics to Track:**
- Playbook page views (goal: 1,000 in first 30 days)
- Email conversion rate (goal: 15%)
- Email-to-trial conversion rate (goal: 10%)

**Expected Milestones:**
150 email signups within 30 days, 15 trial signups within 60 days, 3 paid conversions within 90 days.

**Do This Today:**
Outline the Engineering Metrics Playbook table of contents. List 10 metrics you'll cover and identify which of your beta users can provide examples for each.

---

### Strategy 3: Strategic Partnership with Engineering Enablement Consultants

**The Strategy:**
Engineering leaders at scaling startups often hire consultants (ex-VPEs, fractional CTOs) to help them build processes and teams. These consultants need data to make recommendations but don't have analytics tools to provide to clients. Partner with 3-5 engineering enablement consultants to make DevAnalytics their default tool for client engagements. They get better insights for clients, you get distribution into their customer base.

**The Exact Playbook:**

**Step 1:** Identify 5 engineering enablement consultants who work with Series A-C startups. Search LinkedIn for "Fractional CTO", "Engineering Consultant", "Engineering Leadership Coach". Look for people with 10k+ followers and active posting about scaling teams.

**Step 2:** Reach out with a partnership proposition: "I noticed you work with engineering leaders at scaling startups. I built DevAnalytics to give teams visibility into productivity metrics. Would you be interested in a partnership where you get free access to offer to your clients, and in return, you promote it as your recommended analytics tool? You get better client outcomes, we get distribution."

**Step 3:** Create a "Consultant Partner Program" with: free DevAnalytics access for consultants + their clients, co-branded case studies, 20% revenue share on client conversions, joint webinar opportunities.

**Step 4:** Provide partners with enablement materials: pitch deck, demo scripts, ROI calculator, case studies, setup guides.

**Step 5:** Track partner activity and double down on top performers with co-marketing initiatives.

**Metrics to Track:**
- Partner outreach sent: 15
- Partnership acceptance rate (goal: 30%)
- Client referrals per partner per month (goal: 2)
- Partner-referred conversions (goal: 5 in 90 days)

**Expected Milestones:**
3 active consultant partners within 30 days, 10 partner-referred trials within 60 days, 5 paid conversions from partners within 90 days.

**Do This Today:**
Search LinkedIn for "Fractional CTO" and "Engineering Consultant" and create a list of 10 people with 5k+ followers who actively post about scaling engineering teams. Export to spreadsheet with their names, companies, and follower counts.

---

## Execution Priority

**Start with:** Strategy 1 — Design Partnership Program

**Why this order:** Design partnerships validate product-market fit and generate case studies, which fuel Strategy 2 (content) and Strategy 3 (partner enablement). Starting with partnerships ensures you're building GTM on top of real customer stories, not hypothetical positioning. Launch Strategy 2 (content) once you have 2-3 case studies to reference (week 4-6). Launch Strategy 3 (consultant partnerships) once you have proven client outcomes to show partners (week 8-10). This sequence builds compounding momentum: partnerships → case studies → content → inbound leads + partner referrals.

---

## Success Criteria

You'll know these strategies are working when:
- 5 active design partnerships + 3 case studies completed within 60 days (Strategy 1)
- 150 email signups + 15 product trials from content within 60 days (Strategy 2)
- 3 active consultant partners + 10 partner-referred trials within 90 days (Strategy 3)

If you don't see these results, revisit your ICP targeting or pivot to a different market segment (e.g., enterprise vs. startup, or different tech stack).
```

---

## 质量检查清单（自我验证）

在最终确定输出之前，请验证以下所有事项：

### 执行前检查
- [ ] 我已阅读 `FOUNDER_CONTEXT.md`，或已从用户处获取同等背景信息
- [ ] 我已掌握关于产品、ICP、所处阶段、竞争格局、分销模式和可用资源的足够信息
- [ ] 如果缺少信息，我使用 AskUserQuestion 获取了相关信息（并且没有猜测）

### 分析检查
- [ ] 我基于证据而非假设评估了产品市场契合状态
- [ ] 我明确了具体的市场切入点或突破口（而不是“所有人”或“小型企业”）
- [ ] 我分析了渠道与产品的契合度（ICP 实际做出购买决策的地方）
- [ ] 我根据当前所处阶段（PMF 前、规模化阶段等）匹配了相应策略
- [ ] 我利用了他们的不公平优势（人脉、专业能力、定位）

### 策略选择检查
- [ ] 所有 3 项策略均按契合度和成功可能性排序（最高者优先）
- [ ] 每项策略都从不同角度切入市场（互不重叠）
- [ ] 每项策略在当前资源条件下均切实可行
- [ ] 我个人确信每项策略都能产生可衡量的增长势头
- [ ] 不提供泛泛的 GTM 建议——每项策略都针对该产品和市场量身定制

### 具体性检查
- [ ] 每项策略都使用了实际产品名称、ICP 详情和具体市场信息
- [ ] 每份行动手册都包含具有具体细节的分步行动
- [ ] 指标具体且可衡量
- [ ] 预期里程碑包含有明确时间节点的具体成果
- [ ] “今天就做”行动可在 30-60 分钟内完成

### 写作规则合规检查
- [ ] 完全没有泛泛而谈的建议（例如“建立网站”“开展内容营销”等）
- [ ] 全文使用主动语态
- [ ] 没有励志式空话或填充内容
- [ ] 每项策略都通过“我愿意为此押注吗？”测试
- [ ] 策略已针对业务阶段和类型（B2B/B2C、PMF 前/规模化阶段等）进行调整

### 输出检查
- [ ] 输出与输出格式完全一致
- [ ] 所有 3 项策略均完整，且所有部分都已填写
- [ ] 执行优先级部分解释了策略的执行顺序
- [ ] 成功标准部分包含有明确时间节点的可衡量成果

**如果任何一项检查未通过 → 修改后再呈现。**

---

## 默认设置与假设

除非用户另有指定或上下文表明应采用其他设置，否则使用以下默认设置：

- **策略数量：** 3 项（必须恰好为 3 项）
- **策略重点：** 从狭窄领域入手，之后再扩展（聚焦明确的 ICP、特定渠道和清晰定位）
- **阶段：** 如果不明确，则假设处于 MVP 之后、正在验证产品市场契合度的阶段
- **业务类型：** 如果不明确，则根据 FOUNDER_CONTEXT 的 industry 字段推断
- **预算：** 除非另有说明，否则假设预算有限（优先采用低成本、高杠杆的策略）
- **时间线：** 假设用户希望在 60-90 天内看到初步增长势头
- **指标：** 同时跟踪领先指标（活动）和滞后指标（转化、收入）
- **语气：** 直接、可执行、自信。不说空话。

在输出顶部记录所做的任何假设。

---