---
name: next
description: "Use this skill when the user doesn't know what to work on next, asks 'what should I do?', wants to find high-value opportunities, or needs help deciding where to spend their time. Also use when the user mentions 'what should I do next,' 'what should I work on,' 'where should I focus,' 'find low-hanging fruit,' 'what's the most valuable thing I could do,' or 'I don't know what to do.' Scans the full project — code, infrastructure, marketing, growth, business — and surfaces 3-5 high-impact, low-effort opportunities ranked by value. Routes each recommendation to the right skill."
---
# 接下来该做什么

你坐下来准备干活，却不知道从哪里开始。这个技能会扫描你的项目——代码、基础设施、营销、增长、业务——并找出当下最值得做的 3-5 件高价值事项。

**这个技能用于在你不知道该做什么时发现值得投入的工作。** 要评估某项具体活动是否值得你花时间，请使用 **focus**。要对已经确定的功能候选进行排序，请使用 **prioritize**。要提升代码性能，请使用 **optimize**。

## 工作原理

1. 我读取你的项目上下文（文件、代码库、文档）
2. 如果无法判断你所处的阶段，我会问 1-2 个快速问题
3. 我扫描你的整个业务，寻找高价值缺口
4. 你会得到一份排好序的机会列表，附带工作量估算以及该使用哪个技能

---

## 第 1 步：收集上下文

如果以下文件存在，就读取它们（静默进行——不要列出你在读什么）：
- about-me 技能的输出，或任何创始人背景文档
- `product-marketing-context.md` 或 `.agents/product-marketing-context.md`
- CLAUDE.md、README、package.json
- 任何分析、指标或状态文档

扫描代码库以了解结构：
- 哪些已经建成、哪些缺失、哪些只完成了一半
- 重要代码上的 TODO/FIXME/HACK 注释
- 部署配置、监控、CI/CD、错误追踪
- 营销页面、分析工具集成、SEO 配置
- 测试覆盖率、错误处理模式

**只问你无法推断的内容。** 如果现有上下文已经能回答这些问题，就直接跳到扫描环节。

最多 2 个问题，放在一条消息里：

```
Quick context so I can find the right opportunities:

1. What stage are you at?
   a) Still building, not launched
   b) Launched, few/no users yet
   c) Have users, no revenue
   d) Have paying customers

2. What's your biggest frustration right now?
   a) Not sure what to build next
   b) Built it but nobody's using it
   c) People sign up but don't stick
   d) Growing but everything feels fragile
   e) Something else: ___
```

---

## 第 2 步：扫描机会

在以下类别中寻找信号。根据创始人所处的阶段运用判断力来决定哪些重要——不要机械地逐条核对。

**产品与代码**
- 关键路径缺少错误处理或测试
- 重要代码上的 TODO/FIXME/HACK 注释
- 明显的性能问题（缺少索引、N+1 查询）
- 只完成一半或被搁置的功能
- 安全缺口（未受保护的路由、暴露的密钥）

**基础设施与运维**
- 已上线的应用没有错误监控
- 已发布的产品没有数据分析
- 没有备份、没有 CI/CD、部署全靠手动
- 缺少环境变量管理

**营销与增长**
- 已发布却没有落地页（或落地页很糟糕）
- 内容驱动型产品没有基础的 SEO
- 有用户却没有新用户引导流程
- 有付费用户却没有留存或流失应对策略
- 有客户却在任何地方都看不到社会证明

**业务与战略**
- 有收入却没有财务追踪
- 已上线的产品没有服务条款或隐私政策
- 有客户却没有反馈收集机制
- 在增长却没有文档或支持资源

### 按阶段加权

不要平等对待所有类别：
- **上线前：** 重点放在产品/代码上。营销和业务信号在这个阶段基本是噪音。
- **已上线、用户很少：** 转向增长/激活。产品已经存在——现在需要触达并留住用户。
- **有收入：** 业务/战略信号要给予真正的权重。法律、财务、留存方面的缺口有直接成本。

对每个机会，评估：
- **影响力：** 在这个阶段能带来多大推进？
- **工作量：** 现实来看能在今天或本周完成吗？

无情地筛选。只呈现影响力/工作量比明显有利的机会。如果某件事影响力很大但需要一个月，它就不算「下一步」该做的事。

---

## 第 3 步：输出

呈现 3-5 个机会，按影响力/工作量比排序。

### 格式

```
## What to do next

Based on: [stage summary] — [app name/type]

1. **[Action]** — [Why this matters right now, referencing what you found in their project]
   ~[time estimate] · Use `/[skill]`

2. **[Action]** — [Why this matters]
   ~[time estimate] · Use `/[skill]`

3. **[Action]** — [Why this matters]
   ~[time estimate] · Use `/[skill]`
```

### 输出规则

- **说人话** —— 「你已经上线了，却没有任何办法知道什么时候会出问题」，而不是「缺少可观测性层」
- **针对其项目具体情况** —— 引用你实际发现的内容，而不是泛泛的建议
- **工作量用人类时间表示** —— 「~1 小时」或「~2-3 小时」，而不是「低工作量」
- **每项只对应一个技能** —— 如果多个技能都适用，选最先要用的那个
- **最多 3-5 项** —— 砍掉任何达不到影响力/工作量门槛的内容
- **不要开场白** —— 不解释方法论，不加「这是我发现的」之类的引入。直接给列表。

---

## 技能路由参考

将每条建议路由到最相关的技能：

| 领域 | 技能 |
|--------|--------|
| 构建功能 | **build**、**plan**（先做范围界定） |
| 修复 Bug | **debug** |
| 性能 | **optimize** |
| 监控/错误 | **monitor** |
| 安全 | **secure** |
| 测试 | **test** |
| 部署/上线 | **deploy**、**go-live** |
| 数据库 | **database** |
| 落地页 | **landing-page** |
| 新用户引导 | **growth**（激活部分） |
| SEO | **seo**、**technical-seo**、**seo-content** |
| 邮件 | **email** |
| 数据分析 | **analytics** |
| 定价 | **pricing** |
| 法务 | **legal** |
| 留存 | **retention** |
| 支付 | **payments** |
| 支持/文档 | **support** |
| 设计/UI | **beautify**、**ux-design** |
| 内容/文案 | **content**、**copywriting** |
| 广告投放 | **ads** |
| 社交媒体 | **social-media** |
| 发布 | **launch** |
| 销售 | **sales** |
| 客户调研 | **customer-research** |
| 财务 | **finances** |
| 招聘 | **hiring** |

---

## 相关技能

- **focus** —— 评估某项具体活动是否值得你花时间（砍掉/改进/转向）
- **prioritize** —— 用 RICE 评分对功能候选排序
- **growth** —— 设计产品驱动型增长策略和激活漏斗
- **validate** —— 在构建之前验证需求
- **optimize** —— 让现有代码更快更精简
