---
name: deal-desk
description: >
  Deal desk: reviews, approves, and structures non-standard sales deals. Use when
  standing up a deal desk, building approval-threshold matrices, designing
  deal-review packets, routing deals, or auditing deals for compliance.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: commercial
  domain: business-growth
  updated: 2026-05-27
  tags: [deal-desk, sales-operations, discount-approval, commercial-operations, contract-review, deal-velocity, gtm]
---
# 交易审批台

端到端的交易审批台运营实践：职能章程、审批阈值、交易审核材料包设计、路由自动化、成交速度分析，以及将“每笔交易都是特例”转变为“我们能够稳定地在 48 小时内完成非标准交易”的治理机制。

本技能与服务提供商无关：无论你的 CRM 是 Salesforce、HubSpot、Pipedrive 还是自研系统，都适用。其中的模式和决策方法均可迁移。

---

## 何时使用本技能

| 情况 | 是否适用本技能 |
|-----------|---------------|
| 从零开始建立交易审批台职能 | 是 — 从**章程设计**开始 |
| 审查现有交易审批台的迟缓或不一致问题 | 是 — 使用 `scripts/deal_velocity_analyzer.py` + **瓶颈模式** |
| 定义谁有权批准何种折扣或条款 | 是 — 使用**审批阈值矩阵** + `scripts/discount_authority_router.py` |
| 构建交易审核材料包模板 | 是 — 参阅**交易审核材料包**章节 + `scripts/deal_review_packet.py` |
| 批准或拒绝某笔具体交易 | 使用材料包生成器 + 审批路由器 |
| 制定定价策略 | 先使用 `business-growth/pricing-strategy` |
| 预测或衡量销售管道 | 使用 `business-growth/revenue-operations` |
| 谈判单份合同 | 与 `business-growth/contract-and-proposal-writer` 配合使用 |

---

## 交易审批台做什么（以及不做什么）

**负责：**
- 审核非标准交易：超出销售代表权限的折扣、自定义法律条款、自定义 SLA、多产品捆绑、政策范围外的付款条款
- 作出审批决定（或将申请路由给适当的审批人）
- 设计交易结构：定价、条款、渐进式安排、成功标准
- 维护交易审批台的**政策**——哪些属于标准情况，哪些需要审批
- 跟踪成交速度（从申请 → 决策 → 签署所需的时间）
- 为财务或审计提供证据（每项让步均可追溯）

**不负责：**
- 设定公开定价（这是定价策略的职责）
- 与客户谈判（这是销售代表或 AE 的职责）
- 完成销售成交（这是销售代表和客户成功团队的职责）
- 运行从订单到回款的工作流（这是计费或 RevOps 的职责）
- 取代法务审核（法务是审批方之一，而非该职能本身）

运作良好的交易审批台就像润滑剂。如果没有它，每笔非标准交易都会演变成工程、产品、法务、财务和管理层之间持续数周的谈判。有了它，交易审批台会根据需要征询这些人员的意见，而销售代表可在数日内获得批准或拒绝的明确答复。

---

## 交易审批台章程（模板）

每个交易审批台都需要一份书面章程。请使用以下模板：

```yaml
purpose:
  Deal Desk reviews, approves, and structures non-standard deals to enable
  sales to close faster while keeping commercial / legal / financial risk
  within company tolerance.

scope:
  In-scope:
    - All deals > $X ARR
    - All deals with discount > Y%
    - All deals with non-standard terms (custom SLAs, custom legal language,
      payment terms beyond Net 30, ramp deals, multi-year discounts > 12 months
      of standard, bundles spanning multiple product lines)
    - All renewals with > 20% expansion or > 10% contraction
    - All deals to enterprise (>1000 employees) or regulated industries
  Out-of-scope:
    - Self-serve / PLG transactions
    - Standard renewals within auto-renewal terms
    - Trial extensions < 30 days
    - Add-ons < $X per existing customer

sla:
  - Standard deal-desk review (no exec approval needed): 1 business day
  - Deal needing CFO/CRO approval: 2 business days
  - Deal needing CEO/Board approval: 5 business days
  - Legal-only review (no commercial concession): 2 business days

intake_format:
  Sales submits via [Salesforce form / CPQ tool / Slack form]. Required fields:
    - Customer name + size + industry
    - Product(s) + ACV
    - Requested deviation from standard (specific list)
    - Justification (competitor situation, customer constraint, strategic value)
    - Standard-pricing total + requested total
    - Contract length + payment terms
    - Implementation / SLA requirements

decision_inputs:
  - Customer LTV estimate
  - Strategic value (logo, reference, vertical foothold)
  - Risk (credit, compliance, integration)
  - Margin impact

outputs:
  - Approve / decline / counter
  - If approve: signed approval packet with terms, conditions, expiration date
  - If counter: list of negotiable items + non-negotiables
  - If decline: reasoning + alternatives

team:
  Deal-desk lead: <name>
  Deal-desk analysts: <names>
  Standing approvers: CRO, CFO, General Counsel, VP Product (escalation paths)
  Consulted as-needed: Engineering Lead, Security Lead, Customer Success Lead

metrics:
  - Median time-to-decision (target: 1 business day)
  - Decision distribution (% approved, % declined, % countered)
  - Discount-on-discount %  (deals where requested discount was further negotiated up)
  - Discount % vs ACV (correlation; outliers reviewed monthly)
  - Win rate of deal-desk-approved deals
  - Concession follow-through (did the customer keep their side?)
```

完整章程模板（包括各区域的分章程、受理表单规范和标准 SLA）请参阅 [references/deal-desk-charter-and-process.md](references/deal-desk-charter-and-process.md)。

---

## 审批阈值矩阵

该矩阵定义了：对于每种交易特征（折扣百分比、合同期限、自定义条款类型），谁有权批准。

### 标准矩阵模板

| 交易特征 | 销售代表 | 销售经理 | 总监 | 销售副总裁 | CRO | CFO | CEO |
|---------------------|-----|---------------|----------|----------|-----|-----|-----|
| 折扣 0-10% | ✓ | | | | | | |
| 折扣 10-20% | | ✓ | | | | | |
| 折扣 20-30% | | | ✓ | | | | |
| 折扣 30-40% | | | | ✓ | | | |
| 折扣 40-50% | | | | | ✓ | | |
| 折扣 > 50% | | | | | | | ✓ |
| ACV > $250k | | ✓ | | | | | |
| ACV > $1M | | | | ✓ | | | |
| ACV > $5M | | | | | | | ✓ |
| 多年期 > 12 个月标准期限 | | ✓ | | | | | |
| 非标准付款条款 | | | | | | ✓ | |
| 自定义 SLA / 违约赔偿 | | | |（需 CCO 共同批准）| | | |
| 自定义法律措辞 | | | | | | |（法务必须同意）|
| MSA 中责任上限条款的修订 | | | | | | |（法务必须同意）|
| 最惠国条款 | | | | | | ✓ | |
| 验收标准 / 验收后付款 | | | | | | ✓ | |
| 多产品 / 跨 BU 捆绑 | | |（每个 BU 负责人均须批准）| | | | |
| 白标 / OEM 权利 | | | | | | | ✓ |

请根据公司所处阶段、ACV 分布和授权偏好进行定制（有些组织要求折扣达到 30% 时由 CRO 审批，另一些组织则会将权限进一步下放）。

### 叠加规则

当存在多个非标准事项时，**以所需最高级别的审批人为准。** 一笔 ACV 为 $1M、折扣为 25% 且包含自定义 SLA 的交易，需要销售副总裁（ACV）、总监（折扣）以及销售副总裁 + CCO（自定义 SLA）审批 → 实际上需要销售副总裁签字批准 + CCO 批准 + 法务同意。

使用 `scripts/discount_authority_router.py --deal deal.yaml` 计算任意交易所需的审批人。

有关完整的矩阵设计指南、区域变体、升级路径和路由自动化模式，请参阅 [references/approval-thresholds-and-routing.md](references/approval-thresholds-and-routing.md)。

---

## 交易审查材料包

每笔非标准交易都需要一份材料包。没有材料包，审批人就会反复询问相同的问题，决策过程也会从数小时延长至数天。

### 标准材料包结构

```markdown
# Deal Review: <Customer Name>

## Summary
- Customer: <name, size, industry>
- ACV: $<amount>
- Discount %: <%> (vs standard $<list-price>)
- Contract: <length>, <payment terms>
- Decision needed by: <date>

## Standard vs Requested
| Item | Standard | Requested | Delta |
|------|----------|-----------|-------|
| ACV  | $X       | $Y        | -Z%   |
| Term | 12mo     | 36mo      | +24mo |
| Payment | Net 30 | Net 60   | +30d  |
| SLA  | 99.5%    | 99.9%     | +0.4% |
| Liability cap | 1x fees | 2x fees | +1x |
| Termination for convenience | No | Yes (90d) | New |

## Justification
- Why customer wants this: <competitor situation, budget cycle, etc.>
- Why we're considering: <strategic value, logo, vertical>
- Customer leverage: <alternatives they have>

## Financial impact
- Standard ARR: $X
- Discounted ARR: $Y (Z% off)
- Net new gross margin: $A (with cost overlay)
- Projected LTV with this discount: $B
- Discount payback if customer renews: <years>

## Strategic value
- Logo value: <high/medium/low — reasoning>
- Reference value: <will they be a public ref? case study?>
- Vertical foothold: <do we want this vertical?>
- Competitive replacement: <who are we displacing?>

## Risk
- Credit risk: <score / payment history>
- Compliance risk: <regulated? data residency?>
- Technical fit risk: <integration complexity>
- Concession follow-through: <are they likely to honor commitments?>

## Required approvers (per matrix)
- [ ] Director: <name>
- [ ] VP Sales: <name>
- [ ] CFO: <name>
- [ ] Legal: <name>

## Recommendation (from deal desk)
<Approve / Counter / Decline> — with reasoning

## Conditions if approved
- Discount expires <date>
- Customer must agree to: <reference call, case study, etc.>
- Customer agrees this is single-instance (not precedent)
- Payment must close by <date>
```

使用 `scripts/deal_review_packet.py --deal deal.yaml` 根据交易规格生成此材料包。

---

## 速度分析

迟缓的交易审批台会扼杀销售。应对其进行衡量和调优。

### 关键指标

| 指标 | 健康 | 警告 |
|--------|---------|---------|
| 决策时间中位数 | < 1 个工作日 | > 3 天 |
| 决策时间第 90 百分位数 | < 3 个工作日 | > 7 天 |
| 等待单一审批人超过 24 小时的交易占比 | < 10% | > 30% |
| 卡住超过 7 天的交易 | 0 | > 5 |
| 销售代表对交易审批台的满意度（NPS） | > 50 | < 0 |
| 获批比例（高批准率可能意味着门槛过低） | 60-80% | > 95% 或 < 40% |
| 折扣后再让步：在交易审批台批准后，客户又谈得更多优惠的交易 | < 10% | > 30% |

运行 `scripts/deal_velocity_analyzer.py --deals deals.csv`，根据 CRM 导出数据计算这些指标。

### 常见瓶颈

| 瓶颈 | 诊断 | 修复措施 |
|------------|-----------|-----|
| 单一审批人瓶颈（所有事项都由一个人审批） | 路由矩阵中的权限过于集中 | 授权他人；增加后备审批人；提高审批门槛 |
| 法务审查需要一周 | 法务审查每笔交易 | 采用标准 MSA + 预批准条款库；仅在存在偏差时交由法务审查 |
| SLA 审查需要工程团队参与 | 每次都定制 SLA | 发布标准 SLA 等级；仅将偏差交由工程团队审查 |
| 审批流程反复往返 | 材料包缺少关键信息 | 使用标准材料包模板；拒绝不完整的提交 |
| 高管审批延迟时间长 | 高管不了解每笔交易的背景 | 每周召开交易评审会议，批量决定较小事项 |
| 销售提交的材料包不完整 | 销售代表不知道需要包含哪些内容 | 使用强制填写必填字段的受理表单 |
| 未执行 SLA | 交易停留在队列中，缺乏紧迫性 | 发布并报告 SLA；向管理层展示交易积压时长仪表板 |

有关折扣/让步模式，请参阅 [references/discount-and-concession-playbook.md](references/discount-and-concession-playbook.md)：包括每种让步类型的合理理由、如何评估、折扣的替代方案，以及如何设计基于绩效的折扣。

---

## 首先明确

在生成交易审批台产物之前，请确认以下输入。如果任何输入未知或含糊，请提问——不要自行假设：

- [ ] **任务类型**——搭建交易审批台（章程 + 矩阵）还是评审单笔交易（材料包）（决定生成哪个模板）
- [ ] **交易详情：ACV + 请求的偏差**——折扣百分比、期限、付款、自定义 SLA/法律条款（用于设置“标准与请求”对照表，并确定矩阵要求哪些审批人）
- [ ] **审批权限结构**——谁可以批准什么（销售代表→经理→总监→副总裁→CRO/CFO/CEO + 法务）（决定门槛矩阵和路由）
- [ ] **战略价值 + 风险**——品牌客户/参考客户价值、信用/合规风险（决定材料包中的理由和建议）

停止规则：仅询问对输出影响最大的 2-3 项。如果用户说“直接起草”，则继续执行，并在产物顶部列出你的假设。

## 端到端工作流

### 工作流：销售代表提交一笔非标准交易

1. **销售代表提交申请**，通过受理表单提供：客户 + ACV + 请求的例外条款 + 理由
2. **交易审批团队进行初步处理**，在 4 小时内：指派分析师、验证材料完整性、要求补充缺失信息
3. **交易审批团队进行审核**，在 1 个工作日内：评估财务影响、战略价值和风险
4. **交易审批团队提出建议**：批准 / 还价 / 拒绝
5. **将申请转交审批人**，按照矩阵执行（通过 `scripts/discount_authority_router.py` 自动转交）
6. **审批人在 SLA 规定时间内作出决定**
7. **如果批准**：材料完成签核，并将附有有效期的条件发送给销售代表
8. **如果还价**：交易审批团队与销售代表协作制定替代方案
9. **如果拒绝**：将明确的拒绝理由 + 替代方案发送给销售代表 + 客户

### 工作流：从零开始建立交易审批团队

1. **起草章程**，并获得销售、财务和法务部门的签核
2. **建立审批矩阵** — 访谈关键利益相关者，记录现有的隐性经验知识
3. **设计受理表单** — 与 CRM 集成或使用 Slack 机器人
4. **招聘 / 任命交易审批团队负责人 + 分析师**
5. **培训销售团队** — 哪些情况会触发交易审批、需要哪些信息、应有何预期
6. **试运行** — 手动运行 1 个月；跟踪指标
7. **迭代** — 优化阈值、自动执行转交流程、发布 SLA
8. **季度审查** — 审查指标、调整阈值、更新章程

### 工作流：审计交易审批团队的绩效

1. **从 CRM 导出交易**，范围为审计期间（包含交易 ID、阶段、审批时间戳和折扣的 CSV）
2. **运行速度分析器** — 计算中位数、百分位数、滞留时长和审批人瓶颈
3. **抽取 10-20 笔交易**进行定性审查（材料是否完整？条件是否得到满足？）
4. **识别规律** — 是否有某些销售代表过度打折？是否有某些客户不恰当地获得了 MFN 条款？
5. **提出调整建议** — 针对章程、阈值、受理表单和培训
6. **向管理层汇报**，并提供指标 + 建议

### 工作流：季度阈值审查

阈值会逐渐偏离实际情况。每季度：

1. **提取该季度的折扣分布**
2. **识别异常值** — 折扣百分比相对于 ACV / 客户细分而言异常的交易
3. **按阈值比较批准率** — 如果折扣 30% 以上的交易有 95% 以上获得批准，则阈值过低
4. **按折扣区间比较赢单率** — 更大幅度的折扣是否确实提高了赢单率，还是仅仅牺牲了利润？
5. **根据数据 + 市场变化调整阈值**
6. **发布新矩阵**并注明生效日期；培训销售团队

---

## 反模式

- **交易审批团队成为瓶颈。** SLA 已发布但无人遵守；交易不断积压；销售团队开始寻找变通办法。衡量并强制执行 SLA。
- **总是同意的交易审批团队。** 批准率 > 95% 意味着阈值过低 — 你只是在走过场。收紧政策或提高阈值。
- **总是拒绝的交易审批团队。** 批准率 < 40% 意味着政策过于严格，或者销售团队不了解政策。调查根本原因。
- **没有交易审批政策。** 每笔交易都按个案评估。决策不一致；存在法律风险；销售代表会钻制度空子。
- **审批权过度集中。** 由一个人审批所有事项 → 形成瓶颈 + 关键人员单点风险。应下放审批权。
- **以交易审批政策为名的定价策略。** 如果 80% 的交易都需要打折，说明公开价格有问题。修正定价。
- **折扣不断加码。** 每笔交易都为下一笔交易抬高折扣标准；最终公开价格失去意义。持续跟踪 + 重置标准。
- **让步却没有对价。** 客户要求 20% 的折扣；你就给出 20% 的折扣。始终要进行交换：用 20% 的折扣换取客户案例、用 20% 的折扣换取 3 年期合同，等等。
- **报价没有有效期。** 客户可以在 6 个月后回来要求同样的条款。始终设定期限（通常为 30-60 天）。
- **从不落实仅限单次的表述。** “这是一次性例外” → 第二年，客户将其援引为先例。

---

## 工具输出

| 脚本 | 输入 | 输出 |
|--------|-------|--------|
| `scripts/deal_review_packet.py` | 交易规范 YAML | Markdown 格式的交易审查材料包，包含摘要、财务信息、战略价值、风险、审批人列表和建议模板 |
| `scripts/discount_authority_router.py` | 交易规范 YAML + 审批矩阵 YAML | 必需的审批人、流转顺序、升级路径、考虑 SLA 的排序 |
| `scripts/deal_velocity_analyzer.py` | 从 CRM 导出的交易 CSV | 决策用时中位数 / p90、账龄仪表板、审批人瓶颈识别、折扣叠加分析 |

所有脚本：仅使用 stdlib，提供 argparse CLI，输出 JSON 或 Markdown。

---

## 参考资料

- [deal-desk-charter-and-process.md](references/deal-desk-charter-and-process.md) — 完整章程模板、受理表单规范、SLA 框架
- [approval-thresholds-and-routing.md](references/approval-thresholds-and-routing.md) — 矩阵设计、区域变体、升级路径、自动化模式
- [discount-and-concession-playbook.md](references/discount-and-concession-playbook.md) — 让步类型、合理理由、替代方案、基于绩效的结构

---

## 相关技能

- `business-growth/pricing-strategy` — 设定交易审批台用于判定偏离的价格基准
- `business-growth/revenue-operations` — 衡量销售管道；交易审批台指标会汇入 RevOps 仪表板
- `business-growth/contract-and-proposal-writer` — 在交易审批台批准后起草最终合同
- `business-growth/channel-economics` — 渠道交易有其自身的交易审批台模式
- `business-growth/partnerships-architect` — 合作伙伴促成的交易需同时经由交易审批台和合作伙伴关系流程
- `business-growth/commercial-policy` — 交易审批台所执行的更广泛治理框架
- `sales-success/sales-engineer` — 在材料包中提供技术验证
- `sales-success/sales-operations` — 负责交易审批台所支持的 CRM / 预测准确性