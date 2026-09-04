---
name: product-economics
description: "Does this product make money at a price someone will pay? Forces contribution margin, a price with a stated basis, and a bottom-up market size — each number labelled measured / assumed / unknown, so a guess can never be read as a calculation."
when_to_use: |
  Apply BEFORE gate:product, while the brief is being written:
  - product-owner, in Step 4 — the Economics section of BRIEF-*.md
  - architect, when a design choice moves variable cost per user (model tier,
    context size, retrieval, image generation)
  - any time the answer to "should we build this" depends on money rather than
    on feasibility
effort: medium
allowed-tools: Read, Write, WebSearch, WebFetch
paths:
  - "docs/product/**"
  - "docs/architecture/**"
---
# 产品经济性

一个产品可以通过这条流水线拥有的每一道关卡——架构已评审、测试通过、安全签署、已经部署——却仍然在每个用户身上亏钱。流水线对此保持沉默，而沉默看起来就像批准。

这就是缺失的问题，而它包含三个问题：

1. **一个单位能否为自己买单？**（贡献利润）
2. **价格是多少，基于什么定价？**（定价）
3. **是否有足够多的单位使其重要？**（市场规模，自下而上）

## 让这件事值得做的规则

**每个数字都带有其来源**，使用简报已经采用的记法——不要为此发明第二套词汇：

- `[source: <where it was read>]` —— 一张发票、一条使用日志、竞争对手公布的价格以及你核查它的日期
- `[assumption]` —— 这是你编出来的，而明确说明这一点正是重点

`artifact-lint` 已经会拒绝没有携带这两者之一的数字。那条规则是为 Problem 部分写的；但在这里它至少同样严格适用，因为算术会洗掉来源：一个 `[assumption]` 转化率和一个 `[source:]` 转化率一旦相乘，就再也无法区分，而两个猜测的乘积会以和测量值相同的置信度呈现出来。

**第三种状态是这个记法没有符号表示的状态：一个没人知道的数字。** 不要用一个看似合理的数字填补这个空洞——看似合理的数字会变成 `[assumption]`，被拿去相乘，然后消失在利润率里。把这一行写成一个开放问题，并把它带入 **风险与终止标准**，附上会终止项目的阈值。一个决定答案的未知项是一项发现，而不是一个缺口。

## 1. 贡献利润——每单位、每月

```
price per unit                              $
  − variable cost per unit                  $
      LLM tokens (in + out, at list price)  $   ← usually the largest, often forgotten
      inference / GPU seconds               $
      storage + egress attributable to one unit
      per-unit third-party fees (payments %, SMS, maps, email)
      support minutes × loaded hourly cost
= contribution margin                       $     ← this must be POSITIVE
```

固定成本（你的时间、基础设施、域名）不属于这里。它们决定产品什么时候实现盈亏平衡，而不是一个单位是否可行。负的贡献利润无法通过规模来修复——用户越多，亏得越多。

**对于 AI 产品，LLM 这一行就是整个问题。** 在前沿模型上，用不计量的固定价格服务重度用户，是打造出优秀但无法销售的东西的经典方式。按**实际配置模型的标价**、以预期使用量的**第 95 百分位**来计算，而不是按均值：固定费率套餐是按尾部定价的，而尾部才是真正会到来的。

`cost-model` 覆盖 BUILD 阶段的基础设施和 LLM 成本。这里覆盖的是产品整个 LIFE 中单个用户的成本。在这里使用它的数字，而不是重新推导。

## 2. 价格，以及它的依据

说明价格建立在以下三者中的哪一个之上。不是三者全部——而是真正决定它的那一个：

- **成本加成** — 在单位成本之上加利润。诚实，而且是一个底线；但它从来不会告诉你某人愿意支付多少钱。
- **竞争对手锚定** — 以一个明确点名的现有产品为基准定价，并说明差价的依据。点名该现有产品，以及你查询的价格和日期。
- **基于价值** — 定价为买方节省金额或时间的一定比例。需要提供他们节省了多少这一数字，而这个数字通常是 `assumed`；请明确说明。

然后进行最能发现大多数问题的合理性检查：**买方现在为这个问题支付多少？** 零是一个有效且棘手的答案——这意味着目前还不存在预算，必须先创造预算，而这属于另一种产品。

## 3. 市场规模 — 仅限自下而上

自上而下的 TAM（“CRM 市场规模为 900 亿美元，0.1% 就是 9,000 万美元”）不是证据。这只是对他人报告中的数字进行算术运算。

自下而上：

```
你能点名或枚举的买方数量
  × 现实的年度价格
  × 一个可触达的比例，以及触达他们的渠道
= 你有可能实际获得的收入
```

如果无法点名渠道，该比例就是 `unknown`，而不是乐观估计。

对于单人运营者，诚实的门槛很少是“市场够不够大”——真正的问题是**“我能否在没有销售团队的情况下触达 100 个买方”**。就问这一件事。

## 这会产出什么

在建议之前，将以下内容作为一个章节写入 `BRIEF-*.md`：

```markdown
## Economics

| | value | basis |
|---|---|---|
| Price / unit / month | $X | competitor-anchored `[source: <name> pricing page, <date>]` |
| Variable cost / unit | $Z | `[source: LLM list price, <model>, p95 usage]` |
| Contribution margin | $X−Z | derived |
| What buyers pay today | $W | `[source: …]` or `[assumption]` |
| Reachable buyers (bottom-up) | N | via <named channel> `[assumption]` |

**Kill criterion:** <the number that, if it turns out worse than T, ends this>
**Cheapest way to find out:** <the test that resolves the largest `unknown`>
```

表格中的每一个 `unknown` 都要带着阈值记录在 **Risks & kill-criteria** 中，这样简报就不能把尚未解决的经济问题记录成已经解决的问题。

## 这不是什么

- **不是预测。** 不要绘制三年的收入曲线。建立在 `assumed` 输入之上的曲线只是经过装饰的猜测；它的形状在输入无法做到的地方产生说服力。
- **不是拒绝构建的理由。** 有很多东西值得亏损构建——作品集项目、切入点，或者某个你希望存在的东西。规则是，这种亏损必须是**明确说明并主动选择的**，而不是到第四个月才发现。
- **不是投资建议**，也不能替代运营者对自己市场的判断。