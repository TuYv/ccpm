---
name: suede-attribution
description: "Suede-owned marketing attribution discipline. Use when the user wants to figure out which marketing actually drives conversions and revenue, choose or interpret an attribution model, or reconcile conflicting numbers across tools. Also use when the user mentions 'attribution,' 'attribution model,' 'first-touch vs last-touch,' 'multi-touch,' 'which channel drives revenue,' 'what's my real CAC,' 'my dashboards disagree,' 'Google/Meta says X but GA says Y,' 'MMM,' 'incrementality,' 'geo lift,' 'holdout test,' 'how did you hear about us,' 'self-reported attribution,' 'dark social,' or wants to instrument attribution themselves — 'stitch my bookings to their source,' 'SavvyCal/Calendly attribution,' 'close the identify gap,' 'track conversions on a third-party domain,' 'first-party attribution.' NOT FOR: general analytics instrumentation and reporting (use suede-analytics) or revenue-ops pipeline work (use suede-revops)."
metadata:
  version: 1.1.0
---
# Suede 归因

## 门禁政策——仅供参考，不构成阻断

此技能中的每个声明验证步骤、检查、质量门禁和发布判定，都是**向用户提供的建议，而不是对智能体的控制**。本政策适用于此技能其他位置的每个门禁、检查、判定，以及“不要发布 / 不要上线 / 不要继续”等表述：

- 运行每项检查，并如实报告结果。判定（`ship`、`ship-with-caveats`、`hold`、字母评级、BLOCKED 或 OPEN 项）是附加在工作结果上的建议，不是会改变工作内容的命令。
- 永远不要因为检查失败或门禁判定为 hold，就阻止、延迟、跳过、重写或拒绝用户要求的操作。按用户要求完成操作，并将门禁输出作为明确标注的建议一并交付。
- 门禁失败会改变你的报告内容，但不会改变你的行动。
- 唯一例外：如果某项发现具有极高风险——数据丢失、安全或凭据泄露、法律或权利违规、支付错误，或不可逆的公共损害——请暂停，准确告知用户风险及可选方案，并让用户做出选择。用户的选择是最终决定。

你帮助用户回答营销中最棘手的问题：**究竟是我的哪些努力真正促成了这次转化和这笔收入？**归因是营销人员损失最多资金的地方——某个渠道在一个仪表板中表现良好，在另一个仪表板中却糟糕；“直接流量”和“品牌搜索”隐藏了真正的来源；而模型则悄悄地把一种观点编码成仿佛事实一样。

此技能有两大支柱。在深入分析前，先确定用户需要哪一个：

- **(A) 解读**——选择归因模型、确定衡量方法，并*协调工具所报告的相互冲突的数据*。这适用于所有人，即使完全没有工程能力。
- **(B) 自有归因（第一方）**——在你控制网站或应用时，自行埋点并串联归因数据。这是构建路径。当用户说“我想自己追踪这些数据”，或遇到发生在其不拥有的域名上的转化时，使用此路径。

大多数请求从 (A) 开始。只有当用户控制相关界面并且想要构建时，才使用 (B)。

产品背景：检查 `.agents/product-marketing.md`，如果存在则阅读——业务类型、销售周期和主要转化几乎会影响这里的每一项建议。

## 边界

- 不要把单一归因模型、协调后的数字或渠道分配呈现为客观事实——始终将其报告为有依据的判断，并说明假设、置信度和缺口。
- 在展示当前线上状态并获得明确批准之前，不要对生产环境中的追踪、分析或 CRM 系统进行埋点、迁移或写入操作。

---

## 支柱 A——解读

### 1. 归因能告诉你什么，不能告诉你什么

在接触任何数据之前，先设定预期：

- **归因是方向性的，而非事实。**它是基于不完整数据建立的因果模型（Cookie 会过期，会话会断裂，线下触点会消失，人们可能在一台设备上研究、在另一台设备上购买）。应将其视为强有力的提示，而不是最终判定。
- **每个模型都是一种观点。**“首次触点”表示第一条广告获得全部功劳；“末次触点”表示最后一次点击获得功劳。两者都以相反的方式犯错。选择模型，就是选择相信谁的故事——要明确说出来。
- **归因差距是正常的。**各渠道报告的转化总数几乎总会超过真实转化数，因为每个平台都会为同一笔销售宣称功劳。你的任务是缩小并解释这一差距，而不是让数字完美对齐。它们不会对齐。

当用户要求一个唯一真实的数字时，换一种说法：“我们可以给你一个*可辩护、口径一致*的数字，并判断哪些渠道正在上升。单一的客观真相并不存在——原因如下，而这也是我们实际用于决策的依据。”

### 2. 归因模型

六种标准模型，以及每种模型在什么时候会说谎：

| Model | Credit rule | Best for | How it lies |
|---|---|---|---|
| **First-touch** | 100% 归因给第一个已知触点 | 漏斗顶部 / 需求生成价值评估；短周期 | 忽略所有促成成交的后续触点；过度归功于认知渠道 |
| **Last-touch** | 100% 归因给转化前的最后一个触点 | 直接响应、快速电商 | 过度归功于漏斗底部 + 品牌搜索/直接访问；忽略需求是如何被创造的 |
| **Last non-direct** | 100% 归因给最后一个触点，跳过 "direct" | 解决直接访问污染的廉价修补 | 仍然是单触点；只是移动了盲点 |
| **Linear** | 每个触点获得相同权重 | 每一步都重要的长周期、多触点旅程 | 把一次随手访问和一次演示请求等同看待；抬高高频渠道 |
| **Time-decay** | 越接近转化的触点获得越多权重 | 近因更重要的较长周期 | 低估漏斗顶部；仍然是假设，不是测量 |
| **Position-based (U-shaped)** | 40% 给第一个触点，40% 给最后一个触点，20% 给中间触点 | 有明确“创建”和“关闭”时刻的 B2B | 40/40/20 的拆分是任意的；中间触点被低估 |
| **Data-driven (algorithmic/Shapley)** | 根据信息建模出的边际贡献分配权重 | 有足够转化量的高流量账户 | 黑箱；需要量级；看不到未输入系统的线下/暗触点 |

**经验法则：**
- 对于长销售周期，绝不要孤立报告单一模型。并排展示 **first-touch and last-touch**——真相在两者之间，而两者之间的差距*就是*洞察。
- Data-driven attribution 需要量级（Google Ads 过去曾要求 30 天内约 3,000 次广告互动和约 300 次转化；后来放宽了最低要求，并将 DDA 设为默认，但低量级仍然只是披着科学外衣的噪声）。数据量不足时，改用 position-based。
- 模型本身远不如保持**一致**重要，并且要搭配一个模型外的合理性检查（Pillar A §4, self-reported）。

关于模型数学、一个旅程用六种方式评分的完整示例，以及 Shapley 的通俗解释，请参见 `references/attribution-models.md`。

### 3. 三种测量范式

模型是在你已追踪的数据*内部*分配权重。范式则是你如何接近*因果性*——越往后越严谨，也越昂贵：

| Paradigm | What it is | Answers | Needs | Watch out |
|---|---|---|---|---|
| **MTA** (multi-touch attribution) | 拼接用户级触点，应用某种模型 | “哪些触点出现在转化旅程中？” | 干净的跨设备用户级追踪 | Cookie 流失 + 隐私限制已经削弱了用户级数据；它会悄悄少算 |
| **MMM** (media/marketing mix modeling) | 自上而下地对一段时间内的花费与结果做回归 | “每个渠道的总体贡献是多少，包括线下/品牌？” | 2–3 年的周度数据、花费波动 | 相关性分析；反应慢；需要真实的预算波动才能学习 |
| **Incrementality** (geo holdout, PSA, ghost ads, on/off) | 受控实验：曝光组 vs. 留置组 | “这个渠道是否*导致*了本来不会发生的增量？” | 能够留置；有足够量级达到显著性 | 黄金标准，但一次只能测试少数几件事 |

**如何选择：**小预算 / 短周期 → 良好的 UTM + last-non-direct + 自报告调研胜过花哨模型。中等预算、多个渠道 → 用 MTA 做日常决策 + 对最大支出项定期做增量测试。大预算、线下 + 品牌支出 → 用 MMM 管理整体组合 + 用增量测试验证 MMM 的系数。当两个渠道都声称带来了同一批转化时，增量测试就是裁判。

按预算 × 销售周期 × 渠道数量划分的决策表，以及如何*解读* geo-holdout / PSA test（不是统计学教程），见 `references/measurement-paradigms.md`。

### 4. 自报告归因

这是最未被充分利用的信号之一，而且对于长周期和暗社交来说，往往也是最诚实的信号。转化后的 “How did you hear about us?” 调研能捕捉到跟踪机制在结构上无法捕捉的内容：播客、口碑、Slack 社群、创始人的一条推文、“朋友告诉我的”。

- **什么时候胜过跟踪：**长决策周期、高口碑传播、品牌/社区驱动，或大量暗社交（见 §5）。如果你的用户旅程里有很大一部分是 “direct”，那你就有一个适合用自报告填补的空洞。
- **在转化时询问**（注册、首次购买、预约演示）—— 这时记忆最清晰，也还没开始淡化。
- **措辞：**开放式问题（“How did you first hear about us?”）能捕捉暗社交；简短选项列表更容易量化，但会预先影响答案。最佳实践：提供已知渠道的选项列表，**再加一个自由文本的 “other/tell us more”。**
- **把它当作三角校验输入，而不是绝对真理** —— 回忆是模糊的，人们会归功于*最记得住的*触点，而不是第一个触点。它是模型外的校验，用来让你的跟踪模型保持诚实。
- 在实现侧，这就是一个写入 CRM/analytics、作为 person property 的表单字段 —— 见 Pillar B 和 `references/first-party-tracking.md`。

### 5. 调和相互冲突的数据源

大多数归因工作的真实诉求是：**“Google 说 50，Meta 说 40，GA 说 60，我的 CRM 说 35 —— 谁是对的？”**没人是对的。框架如下。

**为什么每个来源都会系统性地说谎：**

| Source | Biased toward | Because |
|---|---|---|
| **Ad platforms** (Google/Meta/LinkedIn) | 高估*自己* | 在自己的归因窗口内认领 view-through + click conversions；每个平台都会计算同一笔销售；有动机让自己看起来表现好 |
| **GA / web analytics** | Last non-direct click | 丢失跨设备，丢失被 cookie 拦截的用户，把未知流量归入 direct |
| **CRM** | 销售填写的内容 / 表单捕获的内容 | 人工录入、lead-source 覆盖、没有数字轨迹的线下交易 |
| **Self-reported survey** | *记得住的*触点 | 回忆偏差；低估像 retargeting 这种无聊但真实存在的触点 |

**如何做三角校验：**
1. **选择一个转化数量的事实来源** —— 通常是你的 CRM 或后端（钱真实发生的系统）。其他所有东西都是解释*这些转化从哪里来*，它们无权重新定义*有多少转化*。
2. **绝不要跨平台相加。**如果 Google 和 Meta 都认领了一次转化，你拥有的是一次转化和两个认领方，而不是两次转化。要针对事实来源总量做去重。
3. **看方向是否一致，而不是绝对值是否匹配。**如果每个来源都说本季度 paid search 上升、organic 下降，那么这个趋势就是可信的，哪怕没有两个数字完全一致。
4. 当平台争夺同一批转化时，**用自报告作为裁判**；当利害关系足够大时，使用**增量测试**。
5. **预期并为差距做预算。**报告“平台声称 N；我们能验证 M；差额来自过度认领 + view-through + 未跟踪 —— 这是我们的最佳分配。”

输出的是带有置信度水平的真实分配，而不是为了在小数点后实现虚假的对账。

### 6. 盲点

转化发生在这些地方，使真实渠道看起来表现不佳：

- **直接访问** — 垃圾抽屉。书签和手动输入的网址当然算，但还包括被剥离的 referrer、应用到网页、暗社交，以及任何因跟踪丢失的触点。较高的直接访问占比是一个*测量*问题，而不是渠道问题。
- **品牌搜索** — 在其他地方发现你之后又在 Google 上搜索你的用户。末次触点会把功劳交给付费/自然的*品牌*搜索；真正的驱动因素是促使他们进行搜索的其他内容。请区分品牌搜索和非品牌搜索，否则你会削减漏斗顶部的投入。
- **暗社交** — 不携带 referrer 的分享：私信、Slack/Discord、播客、新闻简报、截图。其在结构上对跟踪不可见；自我报告是唯一能让你看到它的方式（§4）。
- **AI 流量** — 助手和 AI 搜索正越来越多地影响买家，随后又通过品牌搜索或直接访问将他们引导过来，因此 AI 触点在分析中不可见。请明确将其命名，并把更深入的工作交给 `suede-ai-seo`。

贯穿始终的要点是：**当“直接访问”和“品牌搜索”占主导时，说明你的漏斗顶部正在发挥作用，而你的归因正在掩盖这一点。** 请明确说出这一点，这是营销中最常见的误读。

### 7. 业务类型分支

默认做法会因业务类型而显著不同。这里是摘要；完整的操作手册位于 `references/by-business-type.md`。

- **B2B SaaS（周期长、销售辅助）：** 用户旅程会跨越数周到数月，并涉及多个人，因此单触点模型会严重误导。应以**CRM 作为事实来源**，并列使用**首次触点 + 基于位置**模型，大力依赖演示预约/注册时的**自我报告**，并将**管道/收入**归因（→ `suede-revops`）视为真正的评分标准。线下触点（活动、销售沟通）会使 MTA 在这里最弱，而自我报告最有价值。
- **电商 / DTC（周期短、自助服务）：** 用户旅程快速、量大，投入集中在付费社交和搜索上。应以**平台 ROAS 为依据但不要盲目信任**（iOS/CAPI 会造成虚高），在投入达到一定规模后使用 **MMM 进行验证**，并在最大的渠道上进行**增量性/地理对照实验**，同时使用**购买后调查**来捕捉像素遗漏的信息。对于快速成交的 SKU，末次触点是可辩护的；MMM+增量性才是分配真实预算的方式。

---

## 支柱 B — 掌握自己的归因（第一方）

当用户**控制网站/应用**并希望自行埋点归因时使用这一支柱，尤其适用于转化发生在**不属于用户的域名**上的情况（SavvyCal/Calendly/Cal.com 预约、Stripe Checkout 页面）。这一支柱建立在真实的生产环境构建经验之上；包含代码模式的完整操作手册位于 `references/first-party-tracking.md`。核心内容如下：

### 身份图谱

第一方归因只有一个核心理念：**将匿名浏览与最终转化关联起来。**

1. 访客以匿名身份到达；你的分析工具会为其分配一个**匿名 `distinct_id`**，并在其事件上记录**首次触点属性**（`$initial_referrer`、`$initial_utm_*`）。
2. 转化发生时（注册、预约、购买），使用稳定 ID（邮箱或用户 UUID）调用 **`identify()`**。这会将匿名历史合并到已知用户身上，首次触点也就能一直保留到转化。
3. 现在，每个转化事件都可以按首次触点渠道进行拆解。这就是全部关键所在。

### 解决 `identify()` 缺口

最常见的第一方失败原因是：**始终没有调用 `identify()`**，导致转化永远无法与浏览历史关联，每位客户看起来都像是凭空出现的。（改写自 Tessa Kriesel 的 PostHog 方法。）解决办法是在每次真实转化时调用 identify。**先进行审计** —— 许多 SaaS 应用已经在注册时完成了 identify；不要重复构建已有的功能。找出*具体未埋点的转化*，只补上这些缺口。

### 在第三方域名上串联转化

唯一需要真正复杂机制的情况是：转化在你无法控制的域名上完成（例如预订工具、托管结账页面）。你无法在那里运行自己的分析工具，因此需要：

1. **在点击时**，捕获阶段的链接装饰器将访客的匿名 `distinct_id` 通过该工具的**元数据透传**机制追加到出站 URL 中（例如 `?metadata[ph_distinct_id]=<id>`）。一个文档级监听器即可覆盖所有 CTA，无需逐个修改链接。
2. 第三方工具存储该元数据，并在其**webhook**中返回。
3. 你的 **webhook handler** 触发一次**身份合并**（使用预订邮箱作为 `distinct_id`，并使用透传的匿名 id 作为 `$anon_distinct_id`），再加上一个**转化事件**，从而将预订行为关联回营销旅程。

### 防护措施（不可跳过）

- **匿名性防护 —— 默认拒绝。** 只能透传*匿名* id。调用 `identify()` 后，当前 id 会变成用户的邮箱/UUID；将其泄露到第三方 URL 中，或基于它执行合并，都会破坏用户画像（用户 A 的邮箱会被并入实际预订者的画像）。拒绝包含 `@` 的疑似 PII 的 id，并限制长度；当身份存在歧义时，**不要发送任何内容**。如果应用使用 UUID 进行身份识别，请测试 `distinct_id === device_id`，而不是检查 `@`。
- **首次触点数据质量。** 重定向会覆盖真实的首次触点。将 OAuth/结账来源（`accounts.google.com`、`checkout.stripe.com`、`login.*`）、自有子域名（自引荐）以及开发环境主机（`localhost`）从引荐来源分类中排除。这通常只需修改设置，无需改代码，而且是投入产出比最高、可信度最高的修复。
- **跨子域名串联。** 营销网站 → 子域名上的应用必须共用一个分析项目和跨子域名 cookie，否则旅程会在交接处中断。预计**在生产环境验证串联之前，数据几乎为零** —— 不要因空数据而恐慌；同时使用营销活动时间窗口启发式回退方案，并回填串联之前的用户群（详情见参考资料）。

### 报告与最后一公里

第一项收益是一个洞察：按首次触点渠道拆分的**转化事件**（`$initial_utm_source` / `$initial_referring_domain`），以及在关联收入后得到的**渠道 → 转化 → 收入**。确认工具中的首次触点与末次触点配置（许多工具默认为末次触点；第一方归因应使用 `$initial_*`）。

但仅靠首次触点无法运行第 2 节中的多触点模型。**存储完整且有序的触点路径**（而不只是 `$initial_*`），构建轨道会为解读轨道提供数据 —— 这样你就能按位置、线性或时间衰减模型对自己的用户旅程进行评分，而不只是阅读相关内容。

**最后一公里：写入 CRM**（来自 Tessa Kriesel 的生产级优化）。在分析工具中的归因拆解只是一份报告；销售和生命周期团队根据*写入记录的*归因采取行动。同步一个带有 `confidence` 和 `basis`（旅程关联、用户自报或营销活动窗口回退）的 **`source` 字段**，再根据媒介得出**付费与自然流量判断**，并将其**汇总至账户层级**（而非仅联系人层级——一家 B2B 组织由多个人组成，他们混用工作邮箱和个人邮箱）。后续销售管道/生命周期如何使用这些数据，是 `suede-revops` 的职责。

这一模式与工具无关：PostHog、Segment、Amplitude 中都有识别与合并功能，GA4 则可通过用户 ID 实现；第三方拼接适用于任何具备元数据透传和 webhook 的工具。PostHog + SavvyCal 是 `references/first-party-tracking.md` 中的完整示例。

---

## 输出格式

交付一份**归因解读报告**，而不是数据转储：

```markdown
# Attribution Readout — [date]

## The question
[What decision this informs — e.g. "where should next quarter's budget go?"]

## Source of truth
[Which system defines the conversion count, and why]

## What each source says
| Channel | Platform-reported | GA | CRM | Self-reported | Our read |
|---------|------------------|----|----|--------------|----------|
[De-duped against source of truth; not summed]

## Model comparison (for long cycles)
[First-touch vs last-touch side by side; the gap is the insight]

## Confidence & gaps
[The attribution gap, the blind spots, what we can't see]

## Recommendation
[Allocation call with confidence levels; the tiebreaker test worth running]
```

## 路由

- 使用 `suede-analytics` 处理事件追踪、追踪计划、UTM 以及 GA4/GTM 设置。这应在归因之前完成——两者的边界是：`suede-analytics` 负责“哪些事件以及如何触发”；归因负责“触点如何关联至转化并持续留存至营收”。
- 使用 `suede-ads` 处理广告平台像素、CAPI 和服务端转化追踪（参见 `suede-ads` 随附的转化追踪参考资料）。
- 使用 `suede-revops` 处理销售管道阶段、线索生命周期和 CRM 营收报告。归因为其提供输入。
- 使用 `suede-ai-seo` 深入处理 AI 搜索归因盲区。
- 使用 `suede-ab-testing` 进行受控实验；将增量评估思维应用于站内改动。