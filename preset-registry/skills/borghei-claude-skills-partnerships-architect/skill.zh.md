---
name: partnerships-architect
description: >
  Design strategic partnerships — technology, channel, co-marketing — and the
  programs that scale them. Use when evaluating a partner, picking a partnership
  type, designing a partner program, structuring a deal, or modeling ROI.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: commercial
  domain: business-growth
  updated: 2026-05-27
  tags: [partnerships, strategic-alliances, channel-strategy, tech-partnerships, partner-program, partnership-design, gtm]
---
# 合作伙伴关系架构师

端到端的战略合作伙伴关系设计与规模化：合作伙伴关系类型选择（技术集成、渠道、OEM 或战略合作）、交易结构、合作伙伴计划设计（层级、权益、要求）、合作伙伴评估，以及用于论证（或否决）合作伙伴关系投资的 ROI 建模。

此技能不依赖特定提供商，适用于 SaaS、基础设施、市场平台和平台型公司。

---

## 何时使用此技能

| 场景 | 是否适用此技能 |
|-----------|---------------|
| 评估潜在合作伙伴 | 是 — 使用 `scripts/partner_evaluation_scorer.py` + **评估框架** |
| 为特定机会选择合作伙伴关系类型 | 是 — 参见**合作伙伴关系类型决策树** |
| 从零开始设计合作伙伴计划 | 是 — 参见**合作伙伴计划设计** + `scripts/partner_program_designer.py` |
| 设计特定合作伙伴交易的结构 | 是 — 参见**合作伙伴交易结构** |
| 对合作伙伴关系 ROI 进行建模 | 是 — `scripts/partnership_roi_modeler.py` |
| 审查现有合作伙伴组合 | 是 — 对所有合作伙伴使用评估评分器 |
| 单笔交易的合作伙伴经济效益 | 使用 `business-growth/channel-economics` |
| 单笔交易的合作伙伴审批 | 使用 `business-growth/deal-desk` |
| 撰写合作伙伴合同 | 使用 `business-growth/contract-and-proposal-writer` |

---

## 合作伙伴关系类型 — 决策树

五种主要的合作伙伴关系类型。目标不同；结构不同；成功指标也不同。

```
What's the primary goal of this partnership?

Grow our distribution reach
├── Customer-pays-them, they-pay-us → Reseller / Distributor / VAR
├── Customer-pays-us, we-pay-them → Affiliate / Referral
└── Joint sale to mutual customer → Co-sell

Embed our product in their offering
├── Customer doesn't see us (white-label) → OEM
├── Customer sees us as embedded → Embedded ISV / Powered-by
└── We're an option in their marketplace → Marketplace listing

Combine our product with theirs (better together)
├── Pre-integrated, certified → Tech / Integration Partner
├── Bundled offering → Solution Partner
└── Joint product (rare) → Joint Venture

Build market presence together
├── Joint events, content, PR → Co-marketing Partner
├── Industry positioning → Strategic Alliance
└── Standards / consortium → Standards Partner

Achieve a specific strategic goal
├── Block a competitor → Defensive partnership
├── Enter a new market → Market entry partnership
└── Acquire capability → Strategic alliance (often pre-acquisition)
```

有关每种类型的深入说明，包括经济结构、合同模式、KPI，以及各自适用或失败的情形，请参阅 [references/partnership-types.md](references/partnership-types.md)。

---

## 合作伙伴评估框架

并非每个潜在合作伙伴都值得投入资源。在作出承诺之前，请使用此框架。

### 六个评估维度

| 维度 | 评估内容 | 评分（1-5） |
|-----------|----------------|-------------|
| **战略契合度** | 此合作伙伴关系是否有助于推进我们的战略？客户群体、垂直行业或区域是否重叠？ | |
| **经济潜力** | 未来 24 个月内切合实际的商机管道或收入贡献是多少？ | |
| **合作伙伴可信度** | 品牌、财务稳定性、技术能力、客户证明 | |
| **共同投入程度** | 对方是否投入同等资源？对方是否有高管级发起人？是否已投入资源？ | |
| **运营契合度** | 双方的系统、流程和文化能否协同运作？ | |
| **退出能力** | 如果合作未能奏效，我们能否妥善终止？我们是否正在形成无法逆转的依赖关系？ |

### 评分标准

- 5 — 强烈肯定
- 4 — 肯定，但有少量注意事项
- 3 — 情况复杂；存在较大不确定性
- 2 — 较弱；存在重大顾虑
- 1 — 否定；存在致命问题

**总分 25-30**：绿灯；可放心投入
**总分 18-24**：黄灯；谨慎设计合作结构；先开展小规模试点
**总分 < 18**：红灯；拒绝合作或对合作结构进行大幅调整

使用 `scripts/partner_evaluation_scorer.py --partner partner.yaml` 对特定潜在合作伙伴进行评分。

### 必须提出的关键问题

在签署任何重大合作协议之前：

1. **12 个月后的成功是什么样的？** 如果双方无法给出一致的答案，就说明双方并未达成共识。
2. **对方的投入程度如何？** 分配了多少人员？预算是多少？是否有高管支持？
3. **未来 12 个月内切实可行的销售管道是什么？** 是否有明确的客户名单？还是只有含糊的“我们有客户”？
4. **双方各自由谁负责日常事务？** 姓名 + 任职年限 + 汇报关系。
5. **如果未能达成共同指标，会发生什么？** 调整方向？逐步终止？重新谈判？

如果无法获得明确答案，那么这项合作只是一厢情愿。

---

## 合作交易结构

不同的交易类型需要采用不同的结构。以下是标准模式：

### 结构 A：标准经销商协议

- **期限**：1-3 年，自动续约
- **折扣**：依据已发布的分级矩阵
- **排他性**：通常为非排他
- **终止**：双方均需提前 90 天通知
- **适用场景**：典型的渠道合作关系

### 结构 B：联合销售协议（共同客户）

- **期限**：1-2 年
- **报酬**：共享佣金或推荐费
- **联合营销承诺**：可选
- **适用场景**：产品或服务互补；拥有现有或目标共同客户

### 结构 C：OEM 协议

- **期限**：3-7 年（期限长；高度依赖合作关系）
- **特许权使用费 / 收益分成**：合作伙伴收入的百分比或按实例收取费用
- **排他性**：通常为部分排他（针对特定用例 / 市场）
- **源代码托管**：通常为必需
- **终止**：复杂（通常需提前 12-24 个月通知；包含过渡权利）
- **适用场景**：深度嵌入的技术合作关系；双方投入较高

### 结构 D：战略联盟

- **期限**：无固定期限；每年评审
- **投入的资源**：明确约定（例如，双方各投入 2 名 FTE，每年投入 $X 预算，每季度举行一次联合路线图会议）
- **治理**：指导委员会（高管发起人每季度会面）
- **具体交付成果**：联合产品功能、共同赢得客户、联合思想领导力建设
- **适用场景**：5 年以上的战略合作关系；非交易型合作

### 结构 E：技术 / 集成合作伙伴关系

- **期限**：1-3 年
- **报酬**：通常无直接报酬；通过共同客户实现互惠价值
- **认证流程**：明确定义（测试、文档）
- **市场平台上架**：通常包含在内
- **联合营销**：可选，但很常见
- **适用场景**：集成能够为共同客户创造价值；不存在直接收入流转

有关包含谈判指南的完整交易结构模板，请参阅 [references/partnership-deal-structures.md](references/partnership-deal-structures.md)。

---

## 合作伙伴计划设计

当合作伙伴数量扩展到数家以上时，你就需要一套计划。

### 合作伙伴计划的三大支柱

| 支柱 | 组成部分 |
|--------|------------|
| **招募** | 目标合作伙伴画像；拓展方式；申请受理 / 资格审核；入驻 |
| **赋能** | 培训；认证；技术资源；沙盒；合作伙伴门户；营销材料 |
| **激活** | 商机报备；线索共享；MDF / 联合营销；联合销售机制；季度业务回顾 |

### 标准计划要素

- **合作伙伴协议**（主协议）：合作关系的基础
- **等级结构**（授权级 → 银级 → 金级 → 铂金级）：每个等级具有不同的权益和要求
- **商机报备**：保护由合作伙伴开发的商机
- **认证计划**：针对你的产品培训和考核合作伙伴
- **合作伙伴门户**：商机报备、MDF、培训、营销材料、线索共享
- **MDF（营销发展基金）**：联合出资开展营销
- **渠道经理**：每 10-15 家活跃合作伙伴配备 1 名
- **年度合作伙伴大会**：社区建设和表彰

完整的计划模板请参阅 [references/partner-program-design.md](references/partner-program-design.md)，其中包括等级定义、权益 / 要求矩阵，以及“第 1 年 / 第 2 年 / 第 3 年”成熟度模型。

使用 `scripts/partner_program_designer.py --org-spec org.yaml`，根据公司阶段 + ICP + 目标合作伙伴数量生成基准计划设计。

---

## 合作伙伴关系 ROI 建模

合作伙伴关系需要实实在在的投入，包括人员、MDF、技术和高管时间。在作出承诺之前，应先对 ROI 进行建模。

### ROI 模型模板

```
3-year cumulative partnership P&L

Year 1 (investment year):
  Revenue from partnership: $X
  Costs:
    Partnership manager headcount: $200k
    Engineering integration (one-time): $300k
    Marketing / co-launch: $50k
    Partner enablement (content, training): $50k
    Travel / events: $30k
    TOTAL Y1 cost: $630k
  Y1 net: $X - $630k

Year 2:
  Revenue from partnership: $Y (growth)
  Costs:
    Partnership manager: $200k
    Engineering ongoing: $100k
    Marketing: $80k
    Enablement: $30k
    Travel / events: $40k
    TOTAL Y2 cost: $450k
  Y2 net: $Y - $450k

Year 3:
  Revenue: $Z (mature)
  Costs: $400k (stable)
  Y3 net: $Z - $400k

3-year cumulative net: ($X + $Y + $Z) - $1,480k
```

如果 3 年累计净收益为负，则该合作伙伴关系无法收回投入。常见原因包括：
- 收入估算过于乐观
- 遗漏了成本（高管时间、机会成本）
- 合作伙伴未能履行承诺
- 市场变化导致合作伙伴关系的相关性降低

使用 `scripts/partnership_roi_modeler.py --partnership partnership.yaml` 获取完整模型。

---

## 首先澄清

在设计合作伙伴关系之前，请确认以下输入信息。如果有任何信息未知或含糊，请询问——不要自行假设：

- [ ] **合作目标 + 类型**——分销、嵌入（OEM/ISV）、优势互补（技术/集成）、市场布局或战略合作（用于选择决策树分支和交易结构）
- [ ] **单笔交易还是规模化计划**——构建单个合作伙伴关系，还是设计等级/合作伙伴组合（决定输出交易结构还是计划设计）
- [ ] **用于评估的合作伙伴具体信息**——其销售管线预期、投入承诺和可信度（作为六维评分器及绿/黄/红判断的输入）
- [ ] **ROI 输入**——预期收入和实际成本（人员、集成、MDF）（决定 3 年 P&L 回收情况）

停止规则：只询问最能影响输出结果的 2-3 个问题。如果用户说“直接起草即可”，则继续，并在交付内容顶部列出你的假设。

## 端到端工作流

### 工作流：评估新的合作伙伴机会

1. 与潜在合作伙伴进行**初步沟通**——了解他们的提案
2. **收集评估数据**：他们的公司情况、对销售管道的预期、投入承诺
3. **使用评估框架评分**——`scripts/partner_evaluation_scorer.py`
4. **如果分数 < 18**：拒绝合作或仅开展小范围试点
5. **如果分数为 18-24**：开展小范围试点（3-6 个月，有限投入）
6. **如果分数为 25+**：签订标准合作伙伴协议；全面投入

### 工作流：建立合作伙伴计划

1. **定义目标合作伙伴画像（TPP）**：理想合作伙伴的属性（规模、垂直行业、区域、能力）
2. **选择计划涵盖的合作类型**（经销商？OEM？技术合作伙伴？）
3. **设计层级结构**——`scripts/partner_program_designer.py`
4. **构建基础工具**：合作伙伴门户、商机报备、认证
5. **招募试点群体**（3-5 家合作伙伴）——人工、高接触度
6. **根据试点反馈迭代**——通常为 6 个月
7. **扩大招募规模**——内容营销、主动拓展、合作伙伴活动
8. 随着合作伙伴组合扩大，**增加渠道经理**（每 10-15 家活跃合作伙伴配备 1 名）

### 工作流：设计具体的合作交易

1. **使用决策树确定合作类型**
2. **为合作伙伴评分**——`scripts/partner_evaluation_scorer.py`
3. **选择与该类型匹配的交易结构**
4. **建立 ROI 模型**——`scripts/partnership_roi_modeler.py`
5. **起草条款清单**（关键商务条款）
6. **谈判**——就投入承诺、时间安排、退出机制达成一致
7. **法务审查** + 合同——`business-growth/contract-and-proposal-writer`
8. **内部审批**——根据交易规模，由交易审批团队 + CRO/CFO/CEO 审批

### 工作流：审计现有合作伙伴组合

1. **列出所有活跃合作伙伴** + 关键数据：收入、成本、交易、层级
2. **依据评估框架对每家合作伙伴评分**——`scripts/partner_evaluation_scorer.py`
3. **识别低 ROI 合作伙伴**——按每投入一小时所产生的贡献排序，找出排名后四分之一的合作伙伴
4. **针对每家合作伙伴作出决定**：
   - **加大投入**（排名前四分之一，扩大投入承诺）
   - **维持现状**（中间群体，保持不变）
   - **逐步终止合作**（排名后四分之一；制定明确时间表，妥善退出）
5. 与 CRO **每季度审查**合作伙伴组合

---

## 反模式

- **名为“战略性”实为交易性的合作。** 如果双方交换的只有金钱，那就是交易性合作；应如实称呼。战略性意味着共同目标 + 共享路线图 + 高管层承诺。
- **合作伙伴体系缺乏组合策略。** 与每一个主动找上门的合作伙伴签约。质量 > 数量。10 家高产出的合作伙伴胜过 100 家僵尸合作伙伴。
- **没有合作负责人。** 合作关系不属于任何人的职责范围。它会逐渐枯萎。
- **资源投入不对称。** 你投入 3 名 FTE；对方投入 0.5 名。合作关系会向对方的便利倾斜。
- **只有承诺，没有具体投入。** “我们会联合举办网络研讨会。”什么时候？预算是多少？由谁负责组织？
- **无限期的排他性。** “永远在该区域独家合作”，却没有绩效门槛。没有获得任何回报，却失去了灵活性。
- **OEM 交易没有源代码托管。** 如果你的公司倒闭，将产生影响客户的风险。
- **战略联盟缺乏治理机制。** 没有季度审查 = 没有高管参与 = 合作关系偏离方向。
- **合作伙伴计划缺乏赋能。** 合作伙伴无法销售他们不了解的产品。
- **层级权益不值得满足相应的层级要求。** 合作伙伴不会晋级，因为没有激励。
- **联合营销资金浪费在无法产生销售管道的活动上。** 活动很精彩，归因却为零。

---

## 工具输出

| 脚本 | 输入 | 输出 |
|--------|-------|--------|
| `scripts/partner_evaluation_scorer.py` | 合作伙伴规格 YAML | 6 个维度的评分（每项 1-5 分）、总分、建议（green-light / yellow / red） |
| `scripts/partnership_roi_modeler.py` | 合作规格 YAML | 3 年期损益、回收期、敏感性分析 |
| `scripts/partner_program_designer.py` | 组织规格 YAML | 推荐的计划结构：层级、权益、要求、所需人员数量 |

所有脚本：仅使用标准库，提供 argparse CLI，输出 JSON 或 Markdown。

---

## 参考资料

- [partnership-types.md](references/partnership-types.md) — 深入介绍 5 种合作类型、经济结构，以及每种类型的适用情形
- [partnership-deal-structures.md](references/partnership-deal-structures.md) — 各类型的交易模板及谈判指南
- [partner-program-design.md](references/partner-program-design.md) — 完整的计划设计，包含层级矩阵和成熟度模型

---

## 相关技能

- `business-growth/channel-economics` — 合作结构底层的单笔交易财务机制
- `business-growth/deal-desk` — 由合作伙伴促成的交易所采用的单笔交易审批机制
- `business-growth/pricing-strategy` — 合作伙伴交易的定价灵活性与价格下限
- `business-growth/contract-and-proposal-writer` — 合作伙伴合同（MSA、合作伙伴协议、OEM 协议）
- `c-level-advisor/cs-cro-advisor` — 战略层面的合作决策
- `c-level-advisor/cs-ceo-advisor` — 董事会层面的联盟决策