---
name: channel-economics
description: >
  Channel economics: design and analyze the financial structure of go-to-market
  channels. Use when picking a channel mix, modeling partner margin or TCO,
  designing partner tiers and rebates, or analyzing channel conflict.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: commercial
  domain: business-growth
  updated: 2026-05-27
  tags: [channel-economics, channel-strategy, partner-program, margin-analysis, gtm, reseller, distributor, marketplace, msp]
---
# 渠道经济学

对市场进入渠道进行端到端的财务建模与设计：直销经济模型、经销商 / 分销商利润结构、市场平台费用、合作伙伴层级经济模型、渠道冲突解决方案，以及用于在统一口径下比较各渠道选项的 TCO 框架。

此技能为渠道战略提供财务基础。有关战略合作伙伴关系设计（投资哪种渠道、如何构建合作关系），请参阅 `business-growth/partnerships-architect`。有关合作伙伴交易层面的审批机制，请参阅 `business-growth/deal-desk`。

---

## 何时使用此技能

| 情形 | 是否适用此技能 |
|-----------|---------------|
| 为新产品决定采用直销还是合作伙伴主导模式 | 是 — 从**渠道模型决策树**开始 |
| 设计合作伙伴层级结构（白银/黄金/铂金） | 是 — 请参阅**合作伙伴层级经济模型** |
| 对特定合作伙伴交易的利润率 / 回收期进行建模 | 是 — `scripts/channel_margin_calculator.py` |
| 分析渠道冲突（直销与合作伙伴交易重叠） | 是 — 请参阅**渠道冲突** + `scripts/channel_mix_optimizer.py` |
| 构建合作伙伴计划的返利 / SPIFF 结构 | 是 — 请参阅**返利设计** |
| 比较 AWS Marketplace 与直接按标价销售的经济效益 | 是 — `scripts/channel_margin_calculator.py --channel marketplace` |
| 谈判特定的合作伙伴合同 | 合同请使用 `business-growth/contract-and-proposal-writer`；经济模型请使用此技能 |
| 战略合作伙伴关系设计（联合市场进入、OEM、白标） | 请先使用 `business-growth/partnerships-architect` |

---

## 渠道模型决策树

六种核心渠道模型。大多数公司会混合使用多种模型。

```
What's the product's complexity + price point?

Low complexity, low price (< $10k ACV):
├── Self-serve / PLG → no channel
├── E-commerce → direct via web
└── Marketplace (AWS / Azure / GCP / Salesforce AppExchange) → if buyer already there

Medium complexity, mid-market price ($10k - $250k ACV):
├── Inside sales / SDR-led direct → if buyer journey is well-understood
├── Reseller / VAR (Value-Added Reseller) → if local presence / language matters
├── Marketplace → if buyer prefers procurement via existing relationship
└── Embedded / OEM → if your product is a component in someone else's offering

High complexity, enterprise ($250k+ ACV):
├── Direct field sales → standard for high-touch enterprise
├── Strategic SI / Integrator (Accenture, Deloitte, etc.) → if implementation is a substantial project
├── ISV / Embedded → if you're a feature in a larger platform
└── Reseller / Distributor → for regional or vertical specialty

Operational / managed-service buyer:
└── MSP (Managed Service Provider) → if customer wants outsourced operations
```

有关各模型的深入介绍，包括经济结构、典型利润分配、各模型何时适用 / 失效以及合同模式，请参阅 [references/channel-models-direct-partner-marketplace.md](references/channel-models-direct-partner-marketplace.md)。

---

## 利润率与 TCO 框架

要对各渠道进行同口径比较，需要采用一致的 TCO 模型。简单粗暴的比较方式（“直销获得 100%，经销商获得 70%”）忽略了关键成本。

### 真实渠道 TCO 公式

```
Channel Contribution Margin
  = Channel-attributed Revenue
  − COGS
  − Partner Discount/Commission
  − Channel-specific Sales Cost (allocated)
  − Channel-specific Marketing Cost (MDF, co-marketing)
  − Partner Enablement Cost (training, certification)
  − Channel Operations Cost (channel manager headcount)
  − Channel-specific Support Cost (T1 partner support)
```

### 并列比较

以一笔 ACV 为 $100k 的交易为例：

| 构成项 | 直销 | 经销商（30% 折扣） | AWS Marketplace |
|-----------|--------|---------------------|-----------------|
| 客户付款 | $100,000 | $100,000 | $100,000 |
| 经销商 / 市场平台费用 | $0 | -$30,000（30% 折扣） | -$3,000（3% AWS 费用） |
| 我方收入 | $100,000 | $70,000 | $97,000 |
| COGS（15%） | -$15,000 | -$10,500 | -$14,550 |
| 销售成本（分摊后的 CAC） | -$25,000 | -$5,000 | -$8,000 |
| 营销成本（MDF / 上架） | -$2,000 | -$8,000 | -$5,000 |
| 合作伙伴赋能（摊销） | $0 | -$3,000 | -$1,500 |
| 渠道运营（摊销） | $0 | -$2,000 | -$1,000 |
| 支持成本 | -$5,000 | -$3,000 | -$5,000 |
| **净贡献** | **$53,000** | **$38,500** | **$61,950** |
| **占 ACV 的百分比** | 53% | 38.5% | 62% |

当所有因素都计算在内时，“30% 折扣”的经销商交易实际利润率差距更接近 14.5%。按单笔交易来看，Marketplace 可能比直销表现更好（Amazon 的销售团队会带来买家），但交易量会有所不同。

使用 `scripts/channel_margin_calculator.py --deal deal.yaml --channel <type>` 为任意交易建立此模型。

有关完整的 TCO 框架、各成本项指南，以及如何分摊“全负荷”销售 / 营销 / 运营成本，请参阅 [references/margin-and-tco-frameworks.md](references/margin-and-tco-frameworks.md)。

---

## 合作伙伴等级经济模型

多等级合作伙伴计划（授权级 → 银级 → 金级 → 白金级）很常见。如果设计不当，它们会奖励没有价值的投入；如果设计得当，它们会奖励能够推动增长的成果。

### 标准等级结构

| 等级 | 年收入门槛 | 折扣百分比 | 其他权益 | 要求 |
|------|-------------------------|------------|----------------|--------------|
| 授权级 | 无 | 10% | 标准支持 | 签署合作伙伴协议；1 人获得认证 |
| 银级 | $100k | 15% | 有资格参与联合营销（有限的 MDF） | 达到 $100k；3 人获得认证；赢得 2 个客户 |
| 金级 | $500k | 20% + 达到门槛时返利 5% | 专属渠道经理；MDF；商机报备；线索共享 | 达到 $500k；5 人获得认证；赢得 5 个客户；续约率达到 80% |
| 白金级 | $2M | 25% + 达到门槛时返利 7% | 最高级别支持；联合路线图；优先地位；新闻稿发布权 | 达到 $2M；10 人获得认证；赢得 10 个客户；续约率达到 90%；加入顾问委员会 |

### 等级设计原则

1. **基于成果，而非投入。** 奖励收入和留存，而不是培训时长或营销活动数量。
2. **可以实现，但具有挑战性。** 相较于前一等级，每个等级都应是需要 12-18 个月才能实现的进阶目标。
3. **权益具有差异化。** 每个等级都需要提供合作伙伴真正想要的权益（而不只是“更多支持”）。
4. **等级状态可续期。** 每年重新评估等级。如果合作伙伴未能维持要求，其等级可以下调。
5. **防止钻空子的保护机制。** 对折扣叠加、商机报备操纵、转移定价等行为，应通过设计予以杜绝。

使用 `scripts/partner_tier_economics.py --tiers tiers.yaml` 对层级经济效益进行建模：各层级的毛利率、合作伙伴侧激励，以及各层级中每个合作伙伴的盈亏平衡收入。

---

## 返利 / SPIFF 设计

三种常见的奖励结构，各有取舍：

### 前端折扣

合作伙伴以折扣价从你方购买，再以标价（或接近标价）销售给客户。利润 = 价差。

**优点：** 简单。现金收益立即流向合作伙伴。  
**缺点：** 难以激励特定行为。无论业绩如何，折扣都已固定。

### 后端返利

合作伙伴按全价（或接近全价）付款；根据收入 / 层级达成情况，按季度 / 年度获得返利。

**优点：** 将奖励与实际业绩挂钩；可以激励特定行为（例如，销售新产品可获得奖金）。  
**缺点：** 给合作伙伴带来现金流压力。管理复杂。

### MDF（市场开发基金）/ SPIFF

针对特定行动按交易或按周期发放奖金：引入潜在客户、参加活动、认证员工。

**优点：** 针对性极强。奖励你希望促成的特定行为。  
**缺点：** 容易被钻空子；管理开销高；合作伙伴常常期望获得奖励，却没有产出。

### 典型组合

| 合作伙伴类型 | 前端 | 后端 | MDF/SPIFF |
|--------------|-----------|----------|-----------|
| 经销商（交易型） | 总报酬的 70-80% | 10-20% | 5-10% |
| 增值经销商（顾问式销售） | 50-60% | 20-30% | 10-20% |
| 分销商（以量取胜） | 80-90% | 5-15% | 5% |
| ISV / 嵌入式合作伙伴 | 不适用（收入分成） | 100% | 0 |
| MSP | 40-60% | 20-30% | 10-30% |

---

## 渠道冲突

当多个销售路径争夺同一客户时，就会发生渠道冲突。常见形式如下：

### 直销与合作伙伴之间的冲突

| 场景 | 解决模式 |
|----------|---------------------|
| 直销代表发现合作伙伴也接触过的商机 | 交易注册：先注册者胜出；如果客户是由合作伙伴引入，则合作伙伴获得业绩归属 |
| 合作伙伴发现直销客户 | 如果直销团队已经介入：合作伙伴暂缓跟进（或许提供安抚性质的 MDF）；如果尚未介入：由合作伙伴主导 |
| 合作伙伴主导试点后，客户要求转为直销 | 在当前期限内尊重合作伙伴关系；如适当，在下次续约时转换 |

### 合作伙伴之间的冲突

| 场景 | 解决模式 |
|----------|---------------------|
| 两家经销商都在争取同一客户 | 先注册者胜出；向另一方提供其他潜在客户 / 区域互换 |
| 垂直行业专家与地域型合作伙伴竞争 | 垂直行业专家胜出（客户更看重垂直行业专业能力） |
| 新合作伙伴争取现有合作伙伴的客户 | 现有合作伙伴拥有 90 天的优先承接权 |

### 市场平台与直销之间的冲突

客户可以通过 AWS Marketplace 或直销渠道购买。如果直销价格更低，客户会觉得自己被套路了。如果价格相同，为什么不直接使用市场平台？常见的解决方式：

- 直销与市场平台采用**相同价格**（客户不会因采购方式的选择而受到惩罚）
- 当客户选择市场平台时，向直销代表提供**配额业绩归属**（避免直销代表因此缺乏动力）
- 将**市场平台上架带来的可见性**视为增值服务，而不是不同的定价渠道

完整的冲突解决操作手册请参见 [references/channel-conflict-resolution.md](references/channel-conflict-resolution.md)，其中包括商机报备流程、中立仲裁和利益冲突披露。

---

## 首先澄清

在对渠道经济性建模之前，请确认以下输入。如果有任何一项未知或含糊，请询问——不要假设：

- [ ] **范围内的渠道模式**——直销、经销商/VAR、分销商、市场平台、OEM 或 MSP（决定采用哪个决策树分支以及运行哪种 TCO 对比）
- [ ] **目标 ACV / 价格点**——低于 $10k、中端市场或企业级（用于选择可行的渠道分支并确定单笔交易的利润规模）
- [ ] **完全成本项目**——COGS 百分比、分摊的销售/营销/运营/支持成本（用于构建 TCO 贡献毛利模型，而不只是计算表面折扣）
- [ ] **合作伙伴贡献 + 层级意图**——合作伙伴负责什么（提供线索、销售、实施），以及你是否正在设计层级/返利（决定层级经济性以及返利/SPIFF 组合）

停止规则：只询问对输出影响最大的 2-3 项。如果用户说“直接起草即可”，则继续，并在模型顶部列出你的假设。

## 端到端工作流

### 工作流：设计新的合作伙伴计划

1. **选择渠道模式**——直销 + 经销商？市场平台？OEM？——使用决策树
2. **建立经济性模型**——针对预期 ACV 下的每个渠道选项运行 `scripts/channel_margin_calculator.py`
3. **设计层级结构**——使用 `scripts/partner_tier_economics.py` 确定门槛和权益规模
4. **定义返利 / SPIFF 组合**——按层级和合作伙伴类型设置
5. **编写合作伙伴协议**（使用 `business-growth/contract-and-proposal-writer`）
6. **搭建渠道运营体系**——商机报备、MDF 审批、认证跟踪
7. **招聘渠道经理**——通常每 10-15 个活跃合作伙伴配备 1 名经理
8. **与 3-5 个合作伙伴开展试点**——衡量、迭代，然后扩展

### 工作流：评估具体的合作伙伴交易

1. **输入**：ACV、合作伙伴折扣百分比、预期成交情况、合作伙伴的贡献（线索来源？销售投入？实施？）
2. **计算净贡献**——`scripts/channel_margin_calculator.py --deal deal.yaml --channel partner`
3. **与直销替代方案比较**——这笔交易通过直销是否也能成交？成本是多少？
4. **做出决定**：批准 / 还价 / 拒绝（如果合作伙伴折扣不符合标准，通常通过交易审批台处理）

### 工作流：渠道组合分析

1. **输入**：过去 4 个季度按渠道划分的实际收入
2. **运行组合优化器**——`scripts/channel_mix_optimizer.py --revenue revenue.csv` 检查各渠道的贡献毛利，并识别投入不足/过度投入的渠道
3. **建议重新平衡**——例如：“经销商渠道：占收入的 20%，但仅占贡献毛利的 8%——减少投入；市场平台：占收入的 15%，贡献了 25% 的贡献毛利——提高上架可见度”
4. **季度审查**：向 CRO / CFO 汇报

### 工作流：解决渠道冲突

1. **记录冲突**——涉及的客户、相关方和历史情况
2. **应用报备规则**——在没有压倒性事实的情况下，最先报备的合作伙伴胜出
3. **考虑例外情况**——战略标杆客户、客户偏好、垂直领域专业能力
4. **传达决定**——以书面形式向双方说明决定及理由
5. **补偿落选方**——提供其他线索、MDF、区域交换；维护合作关系

---

## 反面模式

- **直销与合作伙伴渠道采用相同价格。** 客户会觉得自己因为没有使用直销渠道而受到惩罚（反之亦然）；这也会扼杀合作伙伴的积极性。面向客户的价格必须在各渠道间保持一致。
- **仅提供折扣的合作伙伴计划。** 只获得折扣的合作伙伴与你的成功没有利益绑定；他们只会把你视为另一个供应商；也很容易转投其他厂商。
- **在缺乏赋能的情况下无休止地扩展合作伙伴。** 签下 200 家什么都卖不出去的合作伙伴；渠道经理的人力无法相应扩展；合作伙伴逐渐失去活跃度。
- **把云市场当作事后补充。** 在 AWS Marketplace 上架，却没有专项投入（商品信息优化、联合销售计划）= 云市场不会产生任何成果。
- **渠道经理沦为高级邮件转发员。** CM 应推动合作伙伴销售管道，而不只是转交销售线索。
- **返利缺乏审计。** 合作伙伴自行申报收入；你选择相信；实际数据却少了 20%。应建立核验机制。
- **MDF 被花在无法推动销售管道的活动上。** 合作伙伴举办了一场很棒的活动，却没有产生任何销售管道。MDF 应要求产生销售管道成果。
- **渠道冲突政策得不到执行。** 政策规定最先登记者胜出，但高管每次都会推翻决定 → 政策只是做做样子。
- **同一笔交易在不同渠道采用不同佣金。** 直销代表在一笔 $100k 的交易中获得 8%，渠道代表在同一笔 $100k 的交易中获得 6%——直销代表拒绝合作伙伴协助；渠道代表则压价竞争。
- **OEM / 嵌入式交易按照转售模式定价。** OEM = 客户完全看不到你；ASP 可以是标价的 50-80%。转售 = 客户能看到你。经济模型不同；价格点也应不同。

---

## 工具输出

| 脚本 | 输入 | 输出 |
|--------|-------|--------|
| `scripts/channel_margin_calculator.py` | 交易规格 YAML + 渠道类型 | 各渠道净贡献毛利率、成本明细、与直销基准的对比 |
| `scripts/partner_tier_economics.py` | 层级定义 YAML | 各层级：我方毛利、合作伙伴毛利、合作伙伴盈亏平衡点、层级晋升激励分析 |
| `scripts/channel_mix_optimizer.py` | 收入 CSV（按渠道 + 季度） | 各渠道收入贡献、各渠道利润贡献、建议的再平衡方案 |

所有脚本：仅使用 stdlib、argparse CLI，输出 JSON 或 markdown。

---

## 参考资料

- [channel-models-direct-partner-marketplace.md](references/channel-models-direct-partner-marketplace.md) — 深入介绍 6 种渠道模型 + 经济结构 + 各模型的适用场景
- [margin-and-tco-frameworks.md](references/margin-and-tco-frameworks.md) — 完整的 TCO 框架、分摊指南、各渠道成本模型
- [channel-conflict-resolution.md](references/channel-conflict-resolution.md) — 登记流程、冲突模式、仲裁

---

## 相关技能

- `business-growth/partnerships-architect` — 战略合作伙伴关系设计（本技能 = 经济模型；该技能 = 战略）
- `business-growth/deal-desk` — 合作伙伴交易的审批机制（本技能 = “成本是多少”；交易审批 = “是否应该批准”）
- `business-growth/pricing-strategy` — 设定渠道经济模型所偏离的标价
- `business-growth/revenue-operations` — 渠道收入在 RevOps 报告中进行细分
- `business-growth/contract-and-proposal-writer` — 起草合作伙伴协议
- `sales-success/sales-operations` — 运营渠道业务（交易登记、MDF 审批、认证跟踪）
- `c-level-advisor/cs-cro-advisor` — 战略性渠道组合决策属于 CRO 层级的职责