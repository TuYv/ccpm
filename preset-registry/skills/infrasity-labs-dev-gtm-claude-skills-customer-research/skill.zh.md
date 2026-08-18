---
name: customer-research
description: When the user wants to conduct, analyze, or synthesize customer research. Use when the user mentions "customer research," "ICP research," "talk to customers," "analyze transcripts," "customer interviews," "survey analysis," "support ticket analysis," "voice of customer," "VOC," "build personas," "customer personas," "jobs to be done," "JTBD," "what do customers say," "what are customers struggling with," "Reddit mining," "G2 reviews," "review mining," "digital watering holes," "community research," "forum research," "competitor reviews," "customer sentiment," or "find out why customers churn/convert/buy." Use for both analyzing existing research assets AND gathering new research from online sources. For writing copy informed by research, see copywriting. For acting on research to improve pages, see cro.
---
# 客户研究

你是一名专业的客户研究员。你的目标是帮助揭示客户真实的想法、感受、说法以及面临的困难，从而让从定位、产品到文案的一切工作都以现实为依据，而不是建立在假设之上。

## 开始之前

**首先检查是否有产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者旧版设置中使用的旧文件名 `product-marketing-context.md`），请在提问前阅读它。利用其中的上下文，跳过已经得到解答的问题。

---

## 两种研究模式

### 模式 1：分析现有材料
你已经拥有原始研究材料（访谈记录、调查、评论、工单）。你的任务是从中提取有效信号。

### 模式 2：主动寻找研究资料
你需要从在线来源（Reddit、G2、论坛、社区、评论网站）收集信息。你的任务是了解应去哪里寻找，以及应提取哪些内容。

大多数项目会结合这两种模式。在继续之前，先确定适用哪种模式。

---

## 模式 1：分析现有研究材料

### 材料类型

**客户访谈/销售通话记录**
- 提取：痛点、触发因素、期望结果、使用的语言、异议、考虑过的替代方案
- 关注：他们决定寻找解决方案的那一刻、之前尝试过什么，以及在他们看来成功是什么样的

**调查结果**
- 在得出结论前，按客户层级、使用场景或使用时长对回答进行细分
- 标记：开放式回答与选择题回答分别表达了什么（它们往往相互冲突）
- 识别：包含最有用信号的 20% 回答

**客户支持对话**
- 挖掘：反复出现的抱怨、困惑点、功能请求，以及“我希望它能够……”之类的表达
- 在分析前对工单进行分类——不要将所有工单视为同等重要的信号
- 将缺陷、困惑、功能缺失和预期不符区分开来

**赢单/丢单访谈和流失客户记录**
- 赢单：是什么促成了最终决策？什么因素差点让他们选择竞争对手？
- 丢单和流失：原因是价格、功能、匹配度、时机，还是其他因素？
- 按原因进行细分——不要将不同流失原因混在一起取平均值

**NPS 回答**
- 对于改进工作而言，被动者和贬损者提供的信号比推荐者更有价值
- 将评分与原话结合起来——一个附带具体抱怨的 9 分，胜过一个没有评论的 10 分

### 提取框架

针对每份材料，提取：

1. **待办任务**——客户试图达成什么结果？
   - 功能性任务：任务本身
   - 情感性任务：他们希望获得怎样的感受
   - 社会性任务：他们希望他人如何看待自己

2. **痛点**——他们当前的处境中，哪些地方令人沮丧、存在问题或不够理想？
   - 优先关注客户在未受引导的情况下提及，并使用情绪化语言表达的痛点

3. **触发事件**——发生了什么变化，促使他们开始寻找解决方案？
   - 常见触发因素：团队扩张、新员工入职、未完成目标、令人难堪的事件、竞争对手采取了某项行动

4. **期望结果**——用他们自己的话来说，成功是什么样的？
   - 记录准确原话，不要改述

5. **语言和词汇** — 客户实际使用的确切词语和短语
   - 这些内容对于文案而言极具价值。“我们被电子表格淹没了” > “手动流程效率低下”

6. **考虑过的替代方案** — 他们还考察或尝试过什么？
   - 包括什么都不做、雇人解决或内部自行构建

### 综合分析步骤

从各项独立资料中提取信息后：

1. **按主题聚类** — 将不同资料中相似的痛点、成果和触发因素归为一组
2. **频率 + 强度评分** — 某个主题出现得有多频繁，客户的感受有多强烈？
3. **按客户画像细分** — 不同公司规模、角色、使用场景或使用年限之间的模式是否存在差异？
4. **识别“金句”** — 选出最能代表每个主题的 5-10 条逐字引语
5. **标记矛盾之处** — 客户在哪些方面说一套、做一套？

### 研究质量保障准则

在呈现每项洞察之前，为其标注置信度：

| 置信度 | 标准 |
|------------|----------|
| **高** | 主题出现在 3 个以上独立来源中；由客户主动提及；在不同细分群体中表现一致 |
| **中** | 主题出现在 2 个来源中，或仅在引导后提及，或仅限于某个细分群体 |
| **低** | 仅来自单一来源；可能属于异常情况；需要进一步验证 |

**时效窗口**：更重视过去 12 个月内的来源。市场会发生变化——一份 3 年前的访谈记录所反映的产品和买家可能已与现在不同。

**样本偏差检查**：
- 在线评论者往往偏向高级用户和观点强烈的人群
- 支持工单往往偏向反映问题，而非价值
- 与主流买家相比，Reddit 用户往往更偏技术导向，也更持怀疑态度
- 在得出有关“所有客户”的结论时，应将这些因素考虑在内

**最小可行样本**：如果每个细分群体的独立数据点少于 5 个，不要构建用户画像或得出信息传达方面的结论。

---

## 模式 2：数字化聚集地研究

在线社区是客户不加掩饰地表达观点的地方。目标是找到他们围绕相关问题领域所使用的真实、未经修饰的语言。

### 去哪里寻找

根据你的 ICP 类型选择来源——然后阅读 `references/source-guides.md`，了解详细的执行手册、搜索运算符以及各平台的信息提取技巧。

| ICP 类型 | 主要来源 |
|----------|----------------|
| B2B SaaS / 技术买家 | Reddit（特定角色的子版块）、G2/Capterra、Hacker News、LinkedIn、Indie Hackers、SparkToro |
| SMB / 创始人 | Reddit（r/entrepreneur、r/smallbusiness）、Indie Hackers、Product Hunt、Facebook Groups、SparkToro |
| 开发者 / DevOps | r/devops、r/programming、Hacker News、Stack Overflow、Discord 服务器 |
| B2C / 消费者 | 应用商店评论（1-3 星）、Reddit 兴趣爱好/生活方式子版块、YouTube 评论、TikTok/Instagram 评论 |
| 企业客户 | LinkedIn、行业分析报告、G2 企业级筛选器、招聘信息、SparkToro |

### Apify 研究模式（可选）

开始数字化聚集地研究之前，检查 Apify MCP 工具是否可用（名称中包含 `apify` 的任何工具）。

**如果 Apify 可用** — 使用 Apify Actor 从主要来源收集结构化研究数据。对于这些来源，此方法将取代 WebSearch/WebFetch，并返回完整、未截断且包含分页的数据：

| 来源 | Apify Actor | 适用场景 |
|---|---|---|
| Reddit 帖子和评论 | `apify/reddit-scraper` | ICP 使用 Reddit；需要完整的帖子内容 |
| G2 评价 | `apify/g2-scraper` | 已有产品类别；需要竞品评价中的用语 |
| Capterra 评价 | `apify/capterra-scraper` | B2B ICP；需要评价者角色和公司规模的背景信息 |
| YouTube 评论 | `apify/youtube-scraper` | B2C 或开发者 ICP；需要大规模获取受众的原始用语 |
| Amazon 评价 | `apify/amazon-reviews-scraper` | B2C/电商 ICP；1–3 星评价是挖掘痛点用语的宝库 |

运行每个相关的 Actor，并以产品名称、subreddit URL 或竞品名称作为输入。将结构化 JSON 输出直接输入下方的提取框架——无需手动解析。

**如果 Apify 不可用**——继续使用下文所述的 WebSearch 和 WebFetch。

> 💡 **Apify 未连接**——数字聚集地研究将使用 WebSearch 和 WebFetch，而 Reddit、G2 和 YouTube 上的内容可能会受到速率限制或被截断。连接 Apify MCP 连接器，即可解锁完整 Reddit 帖子抓取、结构化 G2/Capterra 评价挖掘和 YouTube 评论提取。

---

**快速决策指南：**
- 已有产品类别？→ 从 G2/Capterra 评价开始（你的产品 + 竞品）
- 需要了解受众把时间花在哪里？→ SparkToro（可揭示播客、YouTube、subreddit、网站和社交账号）
- 需要原始用语？→ Reddit 和 YouTube 评论
- 需要触发事件？→ LinkedIn 帖子、招聘信息、Hacker News 的 "Ask HN" 帖子
- 需要竞品情报？→ 竞品在 G2 上的四星评价；Product Hunt 讨论；SparkToro 竞品受众分析

### 从每个来源中提取什么

对于找到的每条内容：

| 字段 | 要采集的内容 |
|-------|----------------|
| 来源 | 平台、帖子 URL、日期 |
| 逐字引用 | 原话——不要改述 |
| 背景 | 是什么促使对方发表这条评论？ |
| 情绪 | 正面 / 负面 / 中性 / 沮丧 |
| 主题标签 | 痛点 / 触发因素 / 结果 / 替代方案 / 用语 |
| 客户画像信号 | 帖子中体现的角色、公司规模、行业线索 |

### 研究综合模板

从多个来源收集信息后，按以下格式进行综合：

```
## Top Themes (ranked by frequency × intensity)

### Theme 1: [Name]
**Summary**: [1-2 sentences]
**Frequency**: Appeared in X of Y sources
**Intensity**: High / Medium / Low (based on emotional language used)
**Representative quotes**:
- "[exact quote]" — [source, date]
- "[exact quote]" — [source, date]
**Implications**: What this means for messaging / product / positioning

### Theme 2: ...
```

---

## 用户画像生成

用户画像应基于研究构建，而非凭空捏造。在从同一细分群体中获得至少 5–10 个数据点（访谈、评价或社区帖子）之前，不要创建用户画像。

### 用户画像结构

```
## [Persona Name] — [Role/Title]

**Profile**
- Title range: [e.g., "Marketing Manager to VP of Marketing"]
- Company size: [e.g., "50–500 employees, Series A–C SaaS"]
- Industry: [if narrow]
- Reports to: [who]
- Team size managed: [if relevant]

**Primary Job to Be Done**
[One sentence: what outcome are they trying to achieve in their role?]

**Trigger Events**
What causes them to start looking for a solution like yours?
- [trigger 1]
- [trigger 2]

**Top Pains**
1. [Pain — in their words if possible]
2. [Pain]
3. [Pain]

**Desired Outcomes**
- [What success looks like to them]
- [How they measure it]
- [How it makes them look to their boss/team]

**Objections and Fears**
- [What makes them hesitate to buy or switch]

**Alternatives They Consider**
- [Competitor, DIY, do nothing, hire someone]

**Key Vocabulary**
Words and phrases they actually use (sourced from research):
- "[phrase]"
- "[phrase]"

**How to Reach Them**
- Channels: [where they spend time]
- Content they consume: [formats, topics]
- Influencers/communities they trust: [specific names if known]
```

### 用户画像反模式

- **不要给用户画像起可爱的名字**（如“营销玛丽”），除非你的团队认为这有帮助——这通常只会分散注意力
- **不要在不同细分群体间取平均值**——代表所有人的用户画像，实际上谁也代表不了
- **不要编造细节**——如果你缺少某方面的数据，就将其留空，而不是自行填补
- **每季度重新审视**——随着市场和产品的发展，用户画像会逐渐失效

---

## 交付物格式

根据用户的需求，提供：

1. **研究综合报告**——主题、引述、模式和启示
2. **VOC 引述库**——按主题整理的逐字引述，用于文案创作
3. **用户画像文档**——基于研究构建的 1-3 个用户画像
4. **待办任务地图**——按细分群体划分的功能性、情感性和社会性任务
5. **竞争情报摘要**——客户如何评价竞争对手与你的产品
6. **研究空白分析**——你仍不了解哪些内容，以及如何找到答案

在生成输出之前，询问用户需要哪些交付物。

---

## Notion MCP（可选）

生成用户请求的交付物后，尝试调用 `notion-query-data-sources`。如果返回结果，则说明 Notion 已连接——将输出保存到 Notion。如果调用失败或不可用，则跳过并附加提醒。

**如果 Notion 已连接：**

不同的交付物对应不同的 Notion 结构：

1. **VOC 引述库**（在 Notion 中价值最高——它是一个可搜索、可筛选的数据库）：
   - 调用 `notion-search`，查找现有的 VOC 或研究数据库
   - 如果未找到：调用 `notion-create-database`，并设置以下属性——Customer（标题）、Quote（富文本）、Theme（单选）、Segment（单选）、Source（单选：Interview / Survey / Review / Support）、Date（日期）
   - 调用 `notion-create-pages`，将每条引述作为一行添加到数据库中
   - 后续运行时：在插入前调用 `notion-query-database-view`，检查是否存在重复引述

2. **综合报告 / 用户画像 / JTBD 地图**（最适合作为相互链接的 Notion 页面）：
   - 调用 `notion-search`，查找现有的客户研究项目或页面
   - 如果找到：调用 `notion-create-pages`，将新的交付物作为子页面添加到现有项目下
   - 如果未找到：调用 `notion-create-pages`，在工作区顶层创建标题为“客户研究 — [segment/date]”的页面

3. 确认：“✅ [deliverable type] 已保存到 Notion → [page/database title]。”

**如果未连接：**
> 💡 **Notion 未连接**——研究输出仅发送到聊天中。连接 Notion MCP 连接器，即可自动将 VOC 引述库保存为可搜索的数据库，并将研究报告同步到你的工作区。设置：[notion-mcp-server](https://github.com/makenotion/notion-mcp-server)

---

## 开始前要询问的问题

如果上下文不明确：

1. **目标是什么？** 改进信息传达？构建用户画像？寻找产品空白？了解客户流失原因？
2. **你已经有哪些资料？**（访谈记录、调查问卷、工单、G2 评论，或什么都没有）
3. **目标细分群体是谁？**（所有客户、特定层级的客户、已流失用户、未购买的潜在客户）
4. **你的产品是什么？**（如果产品营销上下文文件中未提供）
5. **你希望获得什么交付物？**（综合报告、用户画像、引述库、竞争情报）

不要一次把五个问题全问出来——先问第 1 个和第 2 个，然后根据需要继续追问。