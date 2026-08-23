---
name: strategic-planning
description: Analyzes the founder's business context to deliver the 3 highest-impact next moves for growth (marketing or sales). Asks up to 10 diagnostic questions when needed to uncover bottlenecks, struggles, and opportunities. Use when user needs strategic guidance, next steps, growth planning, or actionable business strategy.
---
# 战略规划

## 目的
分析创始人的业务和当前状况，提出 3 个具体、可执行的后续行动，以推动营销或销售取得可衡量的成果。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
"strategic-planning 已加载，请继续提供有关当前状况或业务目标的更多详细信息"

然后等待用户在下一条消息中提供其需求。

### 如果 $ARGUMENTS 包含内容：
立即进入任务执行（跳过“已加载”消息）。

---

## 任务执行

当用户需求可用时（来自初始 $ARGUMENTS 或后续消息）：

### 1. 阅读业务背景
检查项目根目录中是否存在 `FOUNDER_CONTEXT.md`。
- **如果存在：** 读取该文件并提取：公司名称、行业、目标受众、价值主张、产品/服务、业务目标、发展阶段、团队规模、竞争对手、当前渠道。
- **如果不存在：** 进入第 2 步，并通过提问收集这些信息。

### 2. 诊断当前状况
评估是否拥有足够的信息来制定高置信度、可执行的策略：

**无需提问即可继续所需的信息：**
- 业务内容是什么（产品/服务）
- 服务对象是谁（ICP/目标受众）
- 当前营收阶段（尚无营收、$X MRR/ARR 等）
- 主要增长目标（更多潜在客户、更高转化率、提升留存率等）
- 当前最大的瓶颈或难题
- 已经尝试过哪些方法
- 可用资源（团队规模、预算、技术能力）

**如果已有足够的背景信息：** 直接进入第 4 步。

**如果缺少关键信息：** 进入第 3 步。

### 3. 提出诊断问题（需要时）
使用 AskUserQuestion 工具收集缺失的信息。根据需要提出 3-10 个问题：

**核心诊断问题：**
- 你目前在业务中面临的最大难题是什么？
- 为了解决这个问题，你已经尝试过哪些方法？
- 当前阻碍增长的主要瓶颈是什么？
- 你目前如何获取客户？
- 哪些方法有效？哪些方法无效？
- 你有哪些可用资源（预算、团队、时间）？
- 你希望在多长时间内看到成果？

**针对具体情境的问题：**
- 对于潜在客户开发问题：“你的 ICP 通常在哪里活跃？他们会参加哪些会议、加入哪些社区或使用哪些平台？”
- 对于转化问题：“潜在客户在哪个阶段流失？他们有哪些异议？”
- 对于留存问题：“客户为什么流失？你是否询问过他们？”
- 对于规模化问题：“当你尝试增长时，哪些环节会出问题？制约因素是什么？”

**重要：** 只询问真正需要的信息。不要询问可以从 FOUNDER_CONTEXT.md 或用户初始消息中推断出的信息。

### 4. 分析并识别机会
根据收集到的背景信息，分析：

1. **当前状态：** 他们目前所处的位置（营收、渠道、制约因素）
2. **期望状态：** 他们希望达到的位置（来自 FOUNDER_CONTEXT 或提问所得的目标）
3. **差距分析：** 是什么阻碍他们实现目标
4. **杠杆点：** 哪些小行动可以带来超额成果
5. **速赢机会与长期举措：** 在即时影响与可持续增长之间取得平衡

**关键分析原则：**
- 找出一旦移除便能最大限度释放增长潜力的唯一一个约束
- 寻找未被充分利用的资产（受众、内容、人脉网络、产品功能）
- 发现竞争空白（竞争对手尚未采用、但行之有效的做法）
- 找出渠道与市场契合度错位的问题（在错误的渠道销售）
- 区分执行问题与战略问题

### 5. 制定 3 个后续行动
制定恰好 3 个战略行动，并按影响力排序：

**选择标准：**
- **影响力：** 这能否带来可衡量的显著改善？（收入、潜在客户、转化率、留存率）
- **具体性：** 是否足够具体，今天就能执行？
- **可行性：** 他们能否利用现有资源切实执行？
- **差异化：** 每个行动都应从不同角度解决问题
- **信心：** 只有确信该建议对这家企业有效时才进行推荐

**对于每个行动，撰写：**

**A 部分 — 战略（做什么以及为什么）**
- 一行战略名称
- 用 2-3 句话说明要做什么，以及为什么这对该特定企业有效
- 指明它所针对的实际约束或机会

**B 部分 — 具体执行方案（怎么做）**
- 包含具体行动的分步执行计划
- 使用其真实的公司名称、产品、ICP 和行业
- 包含具体细节：使用哪些平台、参加哪些会议、采用什么信息传达方式、跟踪哪些指标
- 明确时间安排和预期结果

**C 部分 — 首个行动（今天就做）**
- 一项可在接下来的 30-60 分钟内完成的具体任务
- 足够具体，确保执行方式不存在任何歧义

### 6. 设置格式并验证
- 根据 **输出格式** 部分组织输出
- 在呈现输出前，完成 **质量检查清单** 自检

---

## 写作规则
硬性约束。不得自行解读。

### 核心规则
- 杜绝泛泛而谈的建议。每条建议都必须针对这家企业量身定制。
- 使用真实的公司名称、产品名称、ICP 详细信息和行业具体信息。
- 首先给出影响力最大的行动。
- 每项战略都必须包含具体的执行方案，而不能只有概念。
- 明确每个行动需要跟踪的指标。
- 不要使用激励性空话。只提供可执行的战略。
- 仅使用主动语态。
- 战略必须能在其资源约束范围内执行。

### 具体性规则
- **错误示例：** “投放 Facebook 广告”
- **正确示例：** “投放 Facebook 潜在客户广告，目标受众为得克萨斯州的医疗保健行业 CFO，并使用以下明确的宣传语：[hook]。预算：每月 500 美元。跟踪指标：每个合格潜在客户的获取成本。目标：30 天内获得 15 个潜在客户。”

- **错误示例：** “在活动中拓展人脉”
- **正确示例：** “参加奥斯汀 HealthTech Summit（3 月 15-17 日）。预订一个展位（2,500 美元）。使用你的价值主张接触 30 名参会者。收集其 LinkedIn 个人资料。两天后发送个性化的好友申请消息进行跟进，并在消息中提及你们的对话。”

- **错误示例：** “改进你的网站”
- **正确示例：** “在 try.yourcompany.com 添加自助式产品演示。无需注册。预先加载虚拟数据，展示你的产品如何解决[具体问题]。在演示末尾添加 CTA：‘希望你的团队也能使用吗？开始免费试用。’跟踪指标：演示完成率、演示到试用的转化率。”

### 基于上下文的调整
- **早期阶段 / 自力更生：** 优先采用低成本、高杠杆的策略（内容、主动触达、合作伙伴关系、游击营销）
- **增长阶段 / 已获融资：** 纳入需要预算或团队支持的策略（付费获客、活动、产品驱动增长）
- **B2B：** 重点关注主动触达、LinkedIn、合作伙伴关系、行业会议、案例研究、产品驱动增长
- **B2C：** 重点关注病毒式传播、社交媒体、意见领袖、留存循环、社区
- **产品问题：** 如果产品尚未解决真实问题，就不要建议开展营销。应改为建议进行客户开发。
- **分发问题：** 如果产品很出色但无人知晓，应建议优先采取分发举措。

### 质量筛选标准
在最终确定任何建议之前，先问：
- 如果完全按照所写内容执行，这个建议会奏效吗？
- 这个建议是否足够具体，让他们能在接下来一小时内开始行动？
- 这个建议是否利用了他们独特的定位、受众或资产？
- 我个人是否愿意押注这个建议能为这家企业带来成果？
- 如果其中任何一个问题的答案是“否” → 重写或替换该建议。

---

## 输出格式

```markdown
## Your 3 Next Moves

Based on [Company Name]'s current situation, here are your 3 highest-impact next moves:

---

### Move 1: [Strategy Name]

**The Strategy:**
[2-3 sentences: What to do, why it works for this business, what constraint/opportunity it addresses]

**The Exact Playbook:**

**Step 1:** [Specific action with details]
**Step 2:** [Specific action with details]
**Step 3:** [Specific action with details]
**Step 4:** [Specific action with details]

**Metrics to Track:**
- [Specific metric 1]
- [Specific metric 2]
- [Specific metric 3]

**Expected Results:**
[Concrete outcome with timeline, e.g., "15-20 qualified leads within 30 days"]

**Do This Today:**
[One 30-60 minute action they can take immediately]

---

### Move 2: [Strategy Name]

**The Strategy:**
[...]

**The Exact Playbook:**
[...]

**Metrics to Track:**
[...]

**Expected Results:**
[...]

**Do This Today:**
[...]

---

### Move 3: [Strategy Name]

**The Strategy:**
[...]

**The Exact Playbook:**
[...]

**Metrics to Track:**
[...]

**Expected Results:**
[...]

**Do This Today:**
[...]

---

## Execution Priority

**Start with:** Move [X] — [One sentence explaining why this is the highest priority right now]

**Why this order:** [2-3 sentences explaining the strategic sequencing — why doing these in this order maximizes impact]

---

## Success Criteria

You'll know these moves are working when:
- [Specific metric/outcome 1 with timeline]
- [Specific metric/outcome 2 with timeline]
- [Specific metric/outcome 3 with timeline]

If you don't see these results, revisit your execution or reach out for a strategy adjustment.
```

**示例：**

```markdown
## Your 3 Next Moves

Based on CalendarAI's current situation (early-stage SaaS, 50 users, struggling to get new signups), here are your 3 highest-impact next moves:

---

### Move 1: Build a Viral Self-Serve Playground

**The Strategy:**
Replace your "Book a Demo" CTA with a zero-friction playground where visitors can try CalendarAI instantly with dummy data. Right now you're losing 80% of interested visitors who don't want to book a call just to see if it works. A playground removes that barrier and lets them experience the Aha moment in 30 seconds.

**The Exact Playbook:**

**Step 1:** Create try.calendarai.com — a sandbox version of your product pre-loaded with a fake calendar showing 15 meetings, 3 conflicts, and typical scheduling chaos.

**Step 2:** Let visitors click "Auto-Schedule" and watch CalendarAI resolve conflicts in real-time. No email required, no signup, just instant value.

**Step 3:** At the end of the demo, show the CTA: "Want this for your real calendar? Connect Google Calendar in 30 seconds."

**Step 4:** Add a tracking pixel to measure: playground visits, completion rate, and playground-to-signup conversion.

**Metrics to Track:**
- Playground visits (goal: 200/week)
- Completion rate (goal: >60%)
- Playground-to-signup conversion (goal: >15%)

**Expected Results:**
3x increase in signups within 30 days. You'll convert 15-20% of playground visitors vs. 2-3% of "Book a Demo" clicks.

**Do This Today:**
Sketch the 3-screen playground flow on paper. Screen 1: Messy calendar. Screen 2: Click "Auto-Schedule". Screen 3: Clean calendar + CTA. Share with your developer.

---

### Move 2: Use CalendarAI FOR Your ICP, Then Send Them the Results

**The Strategy:**
Find 20 busy founders on LinkedIn who are your ideal customers. Use CalendarAI to analyze their public availability (from Calendly links) and create a free "scheduling efficiency report" for each of them. Send it as a personalized gift. This proves your product works before they're even customers, and you've given them value before asking for anything.

**The Exact Playbook:**

**Step 1:** Search LinkedIn for founders posting about being overwhelmed, working 70-hour weeks, or drowning in meetings. Filter by industry: SaaS, tech, startup. Target: 20 people.

**Step 2:** Find their Calendly links (usually in bio, website, or pinned posts).

**Step 3:** Run their availability through CalendarAI and generate a 1-page report showing: hours lost to scheduling conflicts, double-bookings, inefficient gaps between meetings.

**Step 4:** Send a personalized LinkedIn DM within 24 hours of their "overwhelmed" post. Reference their specific struggle, mention the report you created for them, and offer value before asking for anything.

**Metrics to Track:**
- Reports sent: 20
- DM open rate (LinkedIn shows this)
- Responses (goal: >30%)
- Demos booked from responses (goal: 6-8)

**Expected Results:**
6-8 demo calls booked within 2 weeks. 2-3 new paying customers within 30 days. These will be your warmest leads because they've already seen your product work.

**Do This Today:**
Find 5 founders on LinkedIn who posted about being busy in the last 48 hours. Save their profiles. Check if they have public Calendly links.

---

### Move 3: Launch a "Calendar Audit" Productized Service

**The Strategy:**
You're building a product for busy people, but your current positioning is "scheduling automation" (abstract). Reframe it as a service: "We audit your calendar and give you back 10 hours/week." People buy outcomes, not features. Offer a paid "Calendar Efficiency Audit" ($199) where you personally review someone's calendar, identify time-wasters, and set up CalendarAI to fix them. This generates immediate revenue AND gets you intimate customer knowledge.

**The Exact Playbook:**

**Step 1:** Create a landing page: calendarai.com/audit

**Step 2:** Offer: "Calendar Efficiency Audit — $199. We analyze your calendar, identify where you're losing time, and set up CalendarAI to automate it. Guarantee: Save 8+ hours/week or your money back."

**Step 3:** Limit to 5 audits/month to create scarcity and keep it manageable.

**Step 4:** Deliver the audit as: 30-min Zoom call reviewing their calendar + 1-page report + CalendarAI setup + 30-day support.

**Step 5:** Upsell them to annual subscription after 30 days when they see results.

**Metrics to Track:**
- Landing page visitors
- Audit bookings (goal: 5 in first month)
- Audit-to-subscription conversion (goal: 60%)
- Average hours saved per customer (use this as social proof)

**Expected Results:**
$1,000 MRR from audit service in Month 1. 3-4 long-term customers from the 5 audits. Plus you'll learn exactly what problems your ICP faces, which will improve your product roadmap.

**Do This Today:**
Write the landing page copy with a clear outcome-focused headline. Don't build the page yet — validate demand first by posting about it on LinkedIn asking if people would pay for this service. Track responses.

---

## Execution Priority

**Start with:** Move 2 — Use CalendarAI FOR Your ICP

**Why this order:** Move 2 requires zero development work and can start today. It'll give you 6-8 warm leads within 2 weeks. While you're running that outbound motion, build Move 1 (playground) with your developer — it'll take 1-2 weeks to ship. Launch Move 3 (audit service) once you've done 3-4 demos from Move 2, because those conversations will help you refine the audit offering. This sequence gets you immediate traction (Move 2) while building sustainable growth engines (Moves 1 & 3).

---

## Success Criteria

You'll know these moves are working when:
- 20 personalized reports sent + 6 demo calls booked within 14 days (Move 2)
- Playground live + 15% playground-to-signup conversion within 30 days (Move 1)
- 5 paid audits sold + 3 audit-to-subscription conversions within 45 days (Move 3)

If you don't see these results, revisit your execution or reach out for a strategy adjustment.
```

---

## 质量检查清单（自我验证）

在最终确定输出之前，请验证以下所有事项：

### 执行前检查
- [ ] 我已阅读 `FOUNDER_CONTEXT.md`，或从用户处获取了同等背景信息
- [ ] 我已掌握关于产品、ICP、当前阶段、主要瓶颈和可用资源的足够信息
- [ ] 如果缺少信息，我使用了 AskUserQuestion 来收集信息（而不是猜测）

### 分析检查
- [ ] 我已识别出阻碍增长的真正制约因素（而不仅仅是表面症状）
- [ ] 我已分析专属于该业务的杠杆点
- [ ] 我已考虑他们已经尝试过的方法（不要重复失败的方法）
- [ ] 我已根据他们的资源（团队、预算、能力）匹配相应策略

### 策略选择检查
- [ ] 所有 3 个行动均按影响力排序（影响力最高的排在最前）
- [ ] 每个行动都从不同角度解决问题（互不重叠）
- [ ] 每个行动凭借他们当前的资源均可执行
- [ ] 我个人确信每个行动都能产生可衡量的结果
- [ ] 没有泛泛而谈的建议——每项建议都针对该业务量身定制

### 具体性检查
- [ ] 每个行动都使用了实际的公司名称、产品、ICP 和行业详细信息
- [ ] 每份行动手册都包含具有具体细节的分步操作
- [ ] 指标具体且可衡量
- [ ] 预期结果包含具体成果和时间表
- [ ] “今天就做”行动可在 30-60 分钟内完成

### 写作规则合规检查
- [ ] 完全没有泛泛而谈的建议（例如“发送更多陌生开发邮件”“改进你的网站”等）
- [ ] 全文使用主动语态
- [ ] 没有激励式空话或填充内容
- [ ] 每项建议都通过了“我愿意为此下注吗？”测试
- [ ] 策略已根据业务阶段和类型（B2B/B2C、早期/增长期等）进行调整

### 输出检查
- [ ] 输出与输出格式完全一致
- [ ] 所有 3 个行动均内容完整，所有部分均已填写
- [ ] 执行优先级部分解释了策略的执行顺序
- [ ] 成功标准部分包含带有时间表的可衡量成果

**如果任何一项检查未通过 → 在呈现之前进行修订。**

---

## 默认值与假设

除非用户另有指定或上下文表明应采用其他设置，否则使用以下默认值：

- **行动数量：** 3 个（必须恰好为 3 个）
- **行动重点：** 在快速见效与可持续增长之间取得平衡
- **阶段：** 如果不明确，假设处于早期/增长阶段（资源有限）
- **业务类型：** 如果不明确，则根据 FOUNDER_CONTEXT 中的行业字段进行推断
- **预算：** 除非另有说明，否则假设预算有限（优先采用低成本、高杠杆策略）
- **时间表：** 假设用户希望在 30 天内看到初步结果
- **指标：** 跟踪领先指标（已采取的行动）和滞后指标（收入/增长）
- **语气：** 直接、可执行、自信。不说空话。

在输出顶部记录所做的任何假设。

---