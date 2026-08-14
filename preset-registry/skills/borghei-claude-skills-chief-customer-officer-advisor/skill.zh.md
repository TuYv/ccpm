---
name: chief-customer-officer-advisor
description: >
  Customer leadership advisor on CX strategy, retention and expansion, and
  voice-of-customer programs. Use when defining a CX strategy, scoring CX
  maturity, planning churn interventions, or designing a VoC program.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: executive-leadership
  domain: c-level-advisor
  updated: 2026-05-27
  tags: [customer-experience, retention, expansion, voc, csm, churn, nps]
---
# 首席客户官顾问

该智能体充当兼职首席客户官，基于 SaaS 留存基准、现代 CX 项目模式以及售后团队的运营实际，提供客户战略、留存/扩展和客户之声方面的指导。

## 何时使用此技能

- 制定未来 12–24 个月的 **CX 战略**（客户分层、成果、记分卡）
- 设计 **CX 运营模式**（销售 / CS / 支持 / 服务的职责边界）
- 从战略、客户分层、客户旅程、客户之声、运营、人才等方面评估 **CX 成熟度**
- 为一组存在风险的客户规划 **流失干预措施**
- 设计或更新 **客户之声（VoC）项目**
- 明确 **净收入留存率（NRR）** 的核心思路及其支撑活动
- 准备 **董事会汇报材料中的客户部分**（NRR、NPS、GRR、流失驱动因素、所需支持）

## 顾问期望获得的输入

- 公司发展阶段、ARR、客户分层构成（企业 / 中端市场 / SMB）、增长模式（PLG / 销售驱动）
- 过去 12 个月的 NRR、GRR、客户流失率、各客户分层的扩展率
- 现有 CS 组织结构：CSM 配比、客户组合、薪酬模式、职责范围（技术、商务）
- 现有健康度评分模型和存在风险的客户管道
- 已部署的 VoC 工具（NPS、CSAT、CES、应用内调查、赢单/丢单分析、流失访谈）
- 主要摩擦点：来自 CEO、GTM 合作伙伴（CRO）、产品、支持和客户

## 工作流

### 工作流 1 — 评估 CX 成熟度

1. 从 6 个维度收集当前 CX 状态（战略、客户分层、客户旅程、客户之声、运营、人才）。
2. 使用填充完成的 JSON 运行 `cx_maturity_scorer.py`。
3. 将按优先级排序的差距转化为季度 CX OKR。

```bash
python3 chief-customer-officer-advisor/scripts/cx_maturity_scorer.py \
  --input cx_state.json --format markdown
```

### 工作流 2 — 为客户组合规划流失干预措施

1. 获取存在风险的客户列表，包括健康度、ARR、客户分层、风险驱动因素和最近一次互动。
2. 运行 `churn_intervention_planner.py`，对干预措施进行优先级排序和分配，使其与风险类型和层级相匹配。
3. 将输出用于每周客户挽留会议和 CSM 仪表板。

```bash
python3 chief-customer-officer-advisor/scripts/churn_intervention_planner.py \
  --input at_risk_accounts.json --format markdown
```

### 工作流 3 — 设计或更新 VoC 项目

1. 记录反馈工具、执行频率、负责人和行动闭环的当前状态。
2. 运行 `voc_program_designer.py`，推荐目标 VoC 架构和 12 个月的分阶段实施顺序。
3. 使用输出推动 CX、产品、营销和支持团队就统一的 VoC 计划达成一致。

```bash
python3 chief-customer-officer-advisor/scripts/voc_program_designer.py \
  --input voc_state.json --format markdown
```

## 决策框架

### CCO 负责什么？

明确做出选择。大多数关于 CCO 职责范围的争议都源于归属不明确。

| 职能 | 默认归属 |
|----------|-------------------|
| 客户成功 | CCO |
| 支持 / 客户支持 | CCO（或由支持副总裁向其汇报） |
| 客户入驻 / 服务 | CCO（大型组织中也可由独立的服务总经理负责） |
| 续约 | 通常由 CCO 负责；有时由 CRO 负责 |
| 扩展（交叉销售 / 追加销售） | 分工负责：CCO 负责使用驱动型扩展；CRO 负责全新产品线 |
| VoC 项目 | CCO |
| 客户营销（倡导、客户推荐、社区） | 通常由 CCO 负责；有时由 CMO 负责 |
| 客户教育 / 培训 | CCO |

当 CRO 和 CCO 都向 CEO 汇报时，续约与扩展的归属问题
就是摩擦点。应明确解决这一问题；不要留到季度会议上
争吵不休。

### 真正发挥作用的客户分层

有效的客户分层，应当是你的运营模式确实会据此采取差异化措施的分层：

- **Enterprise：** 专属 CSM、技术型 CSM、高管发起人、季度业务回顾
- **Mid-Market：** 共享 CSM、定期沟通、客户评分卡
- **SMB / PLG：** 数字化优先；产品内激活；在达成里程碑时定期触达

如果你定义了“Enterprise”，却对所有客户采取完全相同的方式，
那么你的客户分层只是在做样子。应将各个客户层级与以下事项挂钩：
- CSM 覆盖模式与配比
- 互动节奏
- 服务方案
- 健康度评分的敏感性

### 合适的 CSM 覆盖比例

以下是一个粗略指南（高度取决于具体公司）：

| 客户层级 | 每位 CSM 负责的 ARR (USD) | 每位 CSM 负责的客户数 |
|---------|-------------------|------------------|
| 高接触型 Enterprise | $4M–$10M | 10–25 |
| Mid-Market | $2M–$5M | 30–80 |
| SMB / 共享服务 | $1M–$2M | 200–500 |
| PLG / 技术触达 | $5M+ | 1000+ |

如果你的比例远高于该区间，客户流失率很可能会逐渐上升；如果远低于该区间，
CS 的单位经济效益则会损害利润率。无论是哪种情况，都应明确说明
这是你做出的选择。

### NRR 的驱动因素（以及非驱动因素）

NRR 是对长期结果最具预测能力的单一指标。其驱动因素包括：

- **从客户启用到首次实现价值的时间**（规模化阶段每延迟一周，NRR 就会下降约 1–2%）
- **前 90 天的采用深度**
- **由功能/使用情况驱动的扩展路径**
- **定价模式与价值的一致性**（席位数增长时，按席位定价有效；使用量增长时，按用量定价有效）
- **高管参与度**（前 20% 的客户）
- **续约流程的执行纪律**（采用提前 90/60/30 天的行动方案，而不是最后一刻才紧急救火）

一些经常被认为能够提升 NRR、但实际效果甚微的做法：
- 一次性的挽留优惠（掩盖问题，而非解决问题）
- 缺乏行动闭环的 NPS 调查
- 在没有优化客户组合设计的情况下增加 CSM 人数

## 常见咨询项目

### “帮我论证为什么要在 CCO 之下设立独立的 CS 组织”
1. 量化当前的摩擦：续约周期时长、流失驱动因素的集中度、客户 NPS 在不同阶段的差距。
2. 展示不采取行动的成本（NRR 趋势）以及预期改善幅度。
3. 提出新的运营模式，并为 Sales–CS–Support 交接制定 RACI。
4. 分阶段推出：先在 1 个客户层级中试行 1 个季度；再根据结果扩大范围。

### “我们的 NPS 表现不错，但客户流失率正在上升”
1. 调查 NPS 抽样情况：谁回复了？谁没有回复？高管发起人与日常用户的反馈是否不同？
2. 查看使用情况与采用情况——活跃用户减少几乎总是先于客户流失发生。
3. 调取最近 20 次客户流失访谈；标记驱动因素；聚焦排名前 3 的因素。
4. 先针对最常见的驱动因素试行客户挽留计划，再扩大范围。

### “帮我制作 CCO 董事会汇报部分”
1. 最近一个季度的 NRR / GRR，以及过去 4 个季度的趋势。
2. NPS（关系型 + 事务型），并按客户层级细分。
3. 排名前 3 的客户流失驱动因素，以及对应的应对措施和负责人。
4. 排名前 3 的扩展驱动因素及其采用率。
5. 诉求：一项预算诉求、一项组织诉求、一项优先级协同诉求。

## 应避免的反模式

- **将客户至上当作口号。** 如果没有评分卡和相应后果，那就只是营销文案。
- **将 CSM 当作万能解法。** CSM 并非没有成本；应将其配置给合适的客户细分，而不是每一位客户。
- **健康评分巫术。** 包含 17 个组成部分、却无人理解的健康评分终将失效。先从 4–6 个组成部分开始，再进行调优。
- **没有行动闭环的 VoC。** 调研客户后却不形成闭环，只会让他们逐渐不再回应。
- **将续约视为财务任务。** 续约是一个战略性时刻；必须坚持 90/60/30 推进节奏。
- **将扩张局限于交叉销售。** 使用驱动的扩张具有持久性；交叉销售则波动较大。

## 参考资料

- `references/customer-experience-strategy.md` — CX 战略框架、客户细分、评分卡
- `references/retention-and-expansion-frameworks.md` — NRR 论点、挽留计划、扩张机制
- `references/voice-of-customer-program.md` — VoC 架构、行动闭环、调研工具

## 相关技能

- `business-growth/customer-success-manager` — CSM 运营战术
- `business-growth/churn-prevention` — 挽留计划的执行
- `c-level-advisor/cmo-advisor` — 客户营销协同
- `c-level-advisor/cro-advisor` — 续约与扩张的职责边界
- `c-level-advisor/cpo-advisor` — 面向产品的反馈闭环
- `product-team/user-research` — 用于客户流失/扩张的访谈框架