---
name: commercial-policy
description: >
  Commercial policy: the governance framework defining what terms sales can offer
  and what triggers approval. Use when authoring a policy charter, defining
  discount/payment/liability rules, auditing deals, or generating a regional policy.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: commercial
  domain: business-growth
  updated: 2026-05-27
  tags: [commercial-policy, governance, contract-policy, pricing-policy, sales-governance, deal-policy, gtm]
---
# 商业政策

端到端的商业政策编写与治理：定义销售团队可以提供哪些条件、哪些情况会触发审批，以及哪些行为被禁止。与我们的交易台（运营执行）和定价策略（价格制定）技能配合使用——本技能定义的正是它们据以执行的政策。

良好的商业政策能够：
- 提高交易台的处理速度（减少模棱两可的情况）
- 提高销售代表的自主性（权限更加明确）
- 减轻法务审查负担（大多数情况已有政策覆盖）
- 减少优惠条件随时间逐渐失控
- 提供可供审计的治理文档

---

## 何时使用此技能

| 情况 | 是否适用此技能 |
|-----------|---------------|
| 从零开始编写商业政策 | 是——从**政策章程模板** + `scripts/commercial_policy_generator.py` 开始 |
| 更新现有政策（年度） | 是——请参阅**年度政策审查**工作流 |
| 审核近期交易的政策合规性 | 是——`scripts/policy_compliance_checker.py` |
| 分析条款偏离模式 | 是——`scripts/terms_deviation_analyzer.py` |
| 针对新地区/垂直行业调整政策 | 是——`scripts/commercial_policy_generator.py --region <X>` |
| 起草有关政策的销售培训材料 | 是——请参阅**培训部分** |
| 制定价格（而非偏离价格的政策） | 使用 `business-growth/pricing-strategy` |
| 单笔交易审批 | 使用 `business-growth/deal-desk` |
| 编写具体合同 | 使用 `business-growth/contract-and-proposal-writer` |

---

## 商业政策涵盖的内容

标准范围：

| 领域 | 政策范围 |
|--------|-------------|
| **定价** | 标准定价、折扣阈值、最惠国待遇、返利、定制组合定价 |
| **合同** | 标准合同期限、付款条款、续约条款、终止条款、客户审计权 |
| **法务** | 可接受的 MSA 修改、责任上限、赔偿、司法管辖权、知识产权 |
| **运营** | SLA 等级、定制 SLA、安全承诺、专用基础设施 |
| **客户承诺** | 客户推荐/案例研究/新闻稿义务 |
| **渠道** | 合作伙伴折扣等级、渠道冲突规则、交易登记 |
| **特殊条款** | 基于绩效的付款、验收标准、渐进式交易 |

不涵盖的内容：
- 日常定价决策（属于定价策略）
- 单笔交易的审批机制（属于交易台运营）
- 销售目标/配额（属于薪酬政策）
- 客户成功/防止客户流失的策略

---

## 商业政策章程（模板）

基础性文档。每家 ARR 达到 $5M 以上的公司都需要一份。请使用此模板：

```markdown
# Commercial Policy Charter

## Purpose
This Commercial Policy defines the rules that govern commercial terms
offered to customers. It is binding on all customer-facing functions
(Sales, Customer Success, Partner / Channel) and is enforced by Deal Desk.

## Scope
Applies to:
- All new customer agreements
- All renewals (with material change)
- All partner-mediated deals
- All custom / non-standard agreements

Does not apply to:
- Self-serve / PLG transactions per standard published terms
- Auto-renewals at standard terms

## Owners and Approvers
- Policy owner: CRO + CFO + General Counsel (jointly)
- Operational enforcement: Deal Desk
- Updates: quarterly review by policy owners
- Material changes: board awareness

## Pricing Policy

### Standard pricing
- All new customers offered at published list pricing
- Published price is canonical; deviations require approval per matrix

### Discount approval matrix
[Per the deal-desk approval matrix — see business-growth/deal-desk]

### Maximum allowed discount
- Standard maximum: 50%
- Beyond 50%: CEO + Board awareness required
- Discount > 60%: only with explicit strategic-rationale documented and CEO sign-off

### Most Favored Nation (MFN)
- Not granted by default
- Granted only with: strategic-tier customer + CRO + CFO + GC approval
- Always scoped narrowly: same product, same volume, same term length, same geography
- Disclosure-only (never automatic price-match)

### Rebates
- Performance-based rebates allowed per partner-program tier
- Customer-tier rebates: discouraged; if granted, time-bounded and explicit

## Contract Policy

### Standard term
- 12-month contract with annual prepay
- Auto-renew unless 90-day notice

### Term flexibility
- < 12 months: requires Director approval
- 24-36 months: Director approval
- > 36 months: VP Sales approval
- Multi-year discounts: per discount matrix

### Payment terms
- Standard: Net 30, annual prepay
- Net 45-60: Director approval
- Net 90+: CFO approval
- Custom milestone-based: CFO approval; revenue recognition impact reviewed

### Renewal
- Standard: auto-renew, same terms, same price (or per published renewal pricing)
- Renewal expansion > 20%: deal-desk review
- Renewal contraction > 10%: deal-desk review + customer success consultation

### Termination
- Standard: termination for convenience requires 90-day notice
- Termination for cause: 30-day cure period
- Customer-requested termination flexibility: Director approval
- Mid-term termination rights: VP Sales approval

## Legal Policy

### MSA modifications
- Pre-approved modifications: tracked list in approved-modifications appendix
- Custom modifications: General Counsel approval required
- Customer-supplied MSA: full GC review; default to push back to our MSA

### Liability cap
- Standard: 1x annual fees
- 2x annual fees: GC + CFO approval
- > 2x annual fees: CEO sign-off
- Carve-outs: IP infringement, gross negligence, willful misconduct — always uncapped

### Indemnification
- Standard mutual indemnification per template
- Customer-favorable indemnification: GC approval
- Defense / settlement control: vendor by default; customer-controlled needs CEO

### Jurisdiction and governing law
- Standard: vendor's jurisdiction
- Customer jurisdiction: GC approval
- Arbitration vs litigation: per template; deviations need GC

### IP
- Standard: each party retains pre-existing; joint inventions per default
- Customer-favorable IP terms: GC approval
- Source code escrow: only for OEM / strategic; never standard customer

## Operational Policy

### SLA tiers
- Standard published SLA (99.5%)
- Enhanced SLA (99.9%): per published pricing
- Custom SLA: Customer Success + Engineering approval; pricing premium per agreement
- Custom SLA with penalties: CRO + CCO + Engineering approval

### Security commitments
- Standard SOC 2 / ISO 27001 commitments per template
- Custom security: CISO + GC approval
- Customer audit rights: GC approval (limited to annual, with notice, third-party auditor)

### Dedicated infrastructure
- Not standard; available only with CTO + GC approval
- Premium pricing required

## Customer Commitments

### Reference / case study requests
- Standard: requested but not required
- Discounted deals (> 15%): case study or reference required as condition
- Strategic logos: explicit case study + press release commitment

## Channel Policy

### Partner-mediated deals
- Per Partner Agreement; discount per tier
- Deal registration governs conflict
- Direct rep authority same as direct deals on partner-led opportunities

## Special Terms

### Performance-based payment
- Payment-on-acceptance / acceptance criteria: CFO + GC approval
- Milestone payments: CFO approval

### Ramp deals
- ≤ 3 months: Sales Manager
- 3-12 months: Director
- > 12 months: VP Sales

### Source code escrow (for customer)
- Not standard; available only with CTO + GC approval

## Documentation Requirements

Every non-standard deal documented per Deal Desk packet template:
- Deviation explicitly listed
- Justification documented
- Approver identified
- Customer commitments (if any) explicit
- Expiration / conditions clear

## Annual Review

This policy is reviewed annually by CRO + CFO + GC.
Material changes communicated to sales with training.

## Effective Date
<date>
## Last Updated
<date>
## Approved By
- CRO: <signature>
- CFO: <signature>
- GC: <signature>
- Board (acknowledgement): <date>
```

有关完整的带注释章程，以及每个章节中常见争议问题的说明，请参阅 [references/commercial-policy-charter.md](references/commercial-policy-charter.md)。

---

## 折扣与条款政策详情

有关以下内容的深入指导，请参阅 [references/discount-and-terms-policy.md](references/discount-and-terms-policy.md)：

- 按 ACV 区间划分的折扣百分比政策
- MFN 条款设计（何时允许、如何限定适用范围）
- 基于绩效的返利结构
- 多年期折扣机制
- 付款期限的灵活性及其对收入确认的影响
- 续约定价政策（递增、价格维持、规模缩减）

---

## 合同与商务管控规则

有关以下内容的深入指导，请参阅 [references/contract-and-commercial-guardrails.md](references/contract-and-commercial-guardrails.md)：

- 可接受的 MSA 修改（采用清单式方法，而非逐案处理）
- 责任上限谈判
- 终止权设计
- 知识产权与联合开发条款
- 客户审计权
- 跨司法管辖区条款（EU、US 与 APAC）

---

## 首先澄清

生成政策前，请确认以下输入。如果有任何一项未知或含糊，请询问——不要自行假设：

- [ ] **公司阶段 + ARR 规模** —— 决定是否有必要制定完整章程，以及阈值应设置得多严格
- [ ] **审批人结构** —— 谁负责该政策，以及审批链中有哪些角色（CRO/CFO/GC、销售副总裁、总监）（用于填充 Owners/Approvers 和每一条审批流程）
- [ ] **地区 / 司法管辖区** —— US / EU / APAC（会影响付款惯例、管辖法律，并决定是否需要地区附加政策）
- [ ] **最大折扣 + 责任风险偏好** —— 折扣上限及对责任上限的容忍度（决定定价和法律政策章节）

停止规则：仅询问对输出影响最大的 2-3 项。如果用户说“直接起草”，则继续，并在政策顶部列出你的假设。

## 端到端工作流

### 工作流：从零起草商务政策

1. **组建政策委员会** —— CRO + CFO + GC 发起人 + Deal Desk 负责人 + 销售运营
2. **盘点当前交易** —— 已提供过哪些条款？哪些是临时决定的？
3. **识别政策缺口** —— 哪些领域的临时处理方式正在造成损害（让步不断扩大、客户意外）
4. **使用模板起草章程**；每个领域对应一个章节
5. **内部审查** —— 销售副总裁、工程副总裁、CISO、客户成功副总裁，以及负责收入确认的财务团队
6. **由销售经理试行 30 天** —— 收集反馈
7. **最终批准** —— CRO + CFO + GC 签署批准；知会董事会
8. **销售培训** —— 研讨会 + 录播课程 + 快速参考卡
9. **发布**至销售 wiki / 合作伙伴门户 / 面向客户的沟通团队
10. 此后进行**季度审查**

### 工作流：更新现有政策（每年）

1. **提取交易数据**，覆盖过去 12 个月：折扣分布、条款偏差、审批情况
2. **识别偏离情况** —— 各政策类别的偏离率是多少？
3. **调研销售经理** —— 哪些方面有效 / 哪些方面造成阻碍
4. **调研客户** —— 客户曾要求但被拒绝过哪些条款？
5. **识别市场变化** —— 竞争格局、客户期望
6. **起草修订内容** —— 具体政策变更及其理由
7. **由 CRO + CFO + GC 批准**
8. **通过培训向销售团队传达变更**
9. **更新章程** + 生效日期

### 工作流：审计交易合规性

1. **导出交易**：从 CRM 中导出该时间段内的交易
2. **运行合规检查器** — `scripts/policy_compliance_checker.py --deals deals.csv --policy policy.yaml`
3. **审查不合规交易** — 逐一调查：偏差是否获得批准？是否有记录？
4. **分类**：
   - 存在已获批准偏差的合规交易：无需处理
   - 未获批准的不合规交易：调查并采取纠正措施
   - 合规但表明政策存在缺口：修订政策
5. **报告**：向政策委员会报告；跟踪纠正措施

### 工作流：生成特定区域的政策

1. **确定区域特定要求** — 货币、司法管辖区、付款惯例、监管要求
2. **运行** `scripts/commercial_policy_generator.py --base policy.yaml --region <region>`，以获得基础政策和区域附加政策
3. **进一步调整**：与当地团队（区域销售副总裁、区域总法律顾问、区域首席财务官）共同完成
4. **审批**：通过标准治理流程进行审批
5. **传达**：向区域销售团队传达

---

## 反模式

- **政策没有执行机制。** 书面政策 + 临时执行 = 政策只是做样子。
- **政策从不更新。** 市场在变化；竞争格局在变化；政策会过时。
- **政策没有合规审计。** 如果不衡量，就无法判断政策是否得到遵守。
- **政策限制过严。** 当销售团队不断绕过政策时，说明政策有问题；应收紧或放宽政策。
- **政策过于宽松。** 当所有人都“合规”但利润率仍在下降时，说明政策的约束力度不足。
- **制定政策时没有销售团队参与。** 销售代表会认为政策是强加的，只会最低限度地遵守。
- **政策没有配套培训。** 销售代表不知道自己可以提供哪些条件；默认会向交易支持团队提出过多请求。
- **政策只是合同附录。** 它被埋在法律文件中；从来没人阅读。
- **在市场条件差异显著时，各区域仍采用相同政策。**
- **只在客户投诉后才审查政策。** 完全是被动应对。

---

## 工具输出

| 脚本 | 输入 | 输出 |
|--------|-------|--------|
| `scripts/policy_compliance_checker.py` | 交易 CSV + 政策 YAML | 每笔交易：合规／不合规，并列出违反政策之处；汇总合规指标 |
| `scripts/terms_deviation_analyzer.py` | 交易 CSV | 偏差模式：哪些条款最常出现偏差？相对于哪个标准？偏差幅度有多大？ |
| `scripts/commercial_policy_generator.py` | 基础政策 YAML + 可选的区域附加政策 | 生成的政策文档（markdown），根据公司阶段、ICP 和区域进行定制 |

所有脚本：仅使用 stdlib，采用 argparse CLI，输出 JSON 或 markdown。

---

## 参考资料

- [commercial-policy-charter.md](references/commercial-policy-charter.md) — 完整的带注释章程，包含各部分的说明
- [discount-and-terms-policy.md](references/discount-and-terms-policy.md) — 深入说明折扣、MFN、返利和付款条款政策
- [contract-and-commercial-guardrails.md](references/contract-and-commercial-guardrails.md) — MSA 修改、责任、终止和知识产权

---

## 相关技能

- `business-growth/deal-desk` — 政策的运营执行
- `business-growth/pricing-strategy` — 设定价格，政策据此管理价格偏差
- `business-growth/contract-and-proposal-writer` — 起草符合政策的合同
- `business-growth/channel-economics` — 渠道交易受政策约束（并为合作伙伴提供附加政策）
- `business-growth/partnerships-architect` — 合作条款受商业政策监督
- `c-level-advisor/cs-cro-advisor` — CRO 是政策的共同负责人
- `c-level-advisor/cs-cfo-advisor` — CFO 是政策的共同负责人
- `ra-qm-team/soc2-compliance-expert` — 政策合规性是与审计相关的证据