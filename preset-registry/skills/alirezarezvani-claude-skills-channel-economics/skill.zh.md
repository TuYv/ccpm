---
name: channel-economics
description: "Use when reviewing or rebalancing direct vs. partner-led channel economics — computing fully-loaded cost-to-serve per channel, channel ROI with cash / LTV / marginal lenses, and optimal channel mix subject to constraints. For Head of Commercial, RevOps, and VP Sales doing quarterly channel review when pipeline is mixed (e.g., 60% direct + 40% partner-led) and nobody actually knows which channel makes money after CAC, support load, partner discount, deal-velocity differences, retention differential, and overhead allocation are all loaded in. Outputs cost to serve, channel ROI verdicts (DOUBLE-DOWN / MAINTAIN / DEFUND / EXIT), a sensitivity-tested channel-mix recommendation, and the diminishing-returns inflection (e.g., 'which channel actually makes money — direct or partner?')."
version: 2.8.0
author: claude-code-skills
license: MIT
tags: [commercial, channel-economics, cost-to-serve, channel-mix, channel-roi, direct-vs-partner, unit-economics]
compatible_tools: [claude-code, codex-cli, cursor, antigravity, opencode, gemini-cli]
---
# channel-economics

## 目的

帮助商务负责人 / RevOps / 销售副总裁在季度渠道复盘中回答三个问题：

1. **每个渠道完全加载后的实际服务成本是多少？**（直接人力成本、渠道经理归因成本、合作伙伴折扣、MDF、赋能时间、支持负载、分摊的间接费用）
2. **从三种视角来看，每个渠道的 ROI 是多少？**（第一年现金 ROI、经 LTV 调整的 ROI、边际 ROI——下一单位投资的回报）
3. **在满足战略约束的前提下，最优渠道组合是什么？**（直销占比下限、合作伙伴集中度上限、对 CAC 变化的敏感性）

该技能会输出**各渠道结论**（DOUBLE-DOWN / MAINTAIN / DEFUND / EXIT）、**经过敏感性测试的渠道组合建议**以及**收益递减拐点**。它不会替你选择战略——战略由人来决定，只是这一次，所有数字都首次得到了如实、完整的加载。

## 何时使用

- 季度渠道复盘：销售管道中直销与合作伙伴渠道的比例为 60/40 或 50/50，但你并不真正清楚哪个渠道能盈利
- 考虑招聘渠道经理——需要了解该渠道能否达到完全加载成本的门槛
- 董事会询问合作伙伴计划的 ROI（“我们在 MDF 上花了 $X——得到了什么？”）
- 某个细分市场过度依赖单一渠道，而你怀疑渠道组合方面的教条正在阻碍另一渠道的发展
- 即将拓展新区域，需要决定直销优先还是合作伙伴优先
- 并购尽职调查：目标公司声称“合作伙伴主导模式下毛利率为 70%”——需要在加载全部成本后进行验证

**请勿用于：**
- 设计合作伙伴层级、联合 GTM 模式、收入分成比例 → `partnerships-architect`
- SDR 到 AE 的路由、潜在客户评分、MQL 定义 → `business-growth/revenue-operations`
- CRO 战略决策（“我们是否应该招聘销售副总裁？”、薪酬方案设计）→ `c-level-advisor/cro-advisor`
- 季度结账、GAAP 收入确认、用于历史报告的渠道级 P&L → `finance/financial-analysis`
- 单笔交易折扣审批 → `deal-desk`
- 定价模型设计 → `pricing-strategist`

## 工作流程

### 第 1 步——收集渠道数据

填写 `assets/channel_data_template.md`（约 20 分钟）。按渠道采集：过去 12 个月的交易数量、过去 12 个月的 ARR、平均交易金额、毛利率、CAC、销售周期天数、留存率、扩张率、合作伙伴折扣率，以及所有可归因成本（SDR / AE / SE / 渠道经理 / CS / 支持 / 营销 / 合作伙伴 MDF / 工具 / 间接费用分摊比例）。

该模板会揭示团队最常遗漏的成本：合作伙伴赋能时间、认证投入、渠道冲突解决的间接成本、渠道经理的人力成本。

### 第 2 步——计算各渠道的服务成本

运行 `scripts/cost_to_serve_calculator.py --input channel.json --output markdown`。

输出：完全加载后的**单笔交易**服务成本和**每一美元 ARR**的服务成本，分别列出直接成本与分摊的间接费用，并提供加载渠道特定成本后的“真实毛利率”一行。标记重复计算并揭示隐藏成本。

每个渠道运行一次。“真实毛利率”一行是后续两个脚本所需的输入。

### 第 3 步 — 从三种视角计算各渠道的 ROI

运行 `scripts/channel_roi_analyzer.py --input roi.json --profile saas --output markdown`。

输出：每个渠道的三个 ROI 数值（首年现金、LTV 调整后、边际）、收益递减拐点，以及结论：DOUBLE-DOWN / MAINTAIN / DEFUND / EXIT。

结论逻辑是确定性的，并会在报告中呈现。人可以推翻结论；该技能不会。

### 第 4 步 — 在约束条件下优化渠道组合

运行 `scripts/channel_mix_optimizer.py --input mix.json --profile saas --output markdown`。

输出：在满足约束条件（直销占比下限、合作伙伴集中度上限）的前提下，使有效 ARR 最大化的推荐组合，以及一张敏感性分析表（如果直销 CAC 上升 20% 会怎样？如果合作伙伴折扣扩大 5 个百分点会怎样？）。

### 第 5 步 — 做出决策

将这三份报告带到季度渠道评审中。技能负责提出建议；人负责做出决定。

## 脚本

- `scripts/cost_to_serve_calculator.py` — 计算每笔交易以及每 $ ARR 的完全成本化服务成本，并揭示隐藏成本
- `scripts/channel_roi_analyzer.py` — 从 3 种视角分析 ROI（现金 / LTV / 边际），提供结论和收益递减拐点
- `scripts/channel_mix_optimizer.py` — 带约束条件和敏感性场景的渠道组合优化器

所有脚本：仅使用标准库。三个脚本均支持 `--help`、`--sample`、`--input`、`--output`。两个分析器可通过 `--profile {saas,api,enterprise-software,marketplace,hardware}` 进行行业调优。

## 快速示例

```bash
# Emits fully-loaded cost-to-serve per channel (direct vs partner-led) for the built-in sample channel data
cd commercial/skills/channel-economics && python3 scripts/cost_to_serve_calculator.py --sample
```

## 参考资料

- `references/channel_economics_canon.md` — Skok、Bessemer State of the Cloud、Tunguz、Pacific Crest / KeyBanc SaaS Survey、Ramanujam、Jay McBain（Canalys）
- `references/cost_to_serve_canon.md` — Kaplan & Cooper（ABC）、Horngren、Jeremy Hope、IBM CTS 案例研究、McKinsey、Gartner、BCG
- `references/channel_anti_patterns.md` — Forrester、Tunguz、Hessling、HBR、SiriusDecisions、MIT Sloan、Gartner

## 假设

- 渠道经济性是一个**前瞻性**问题。历史渠道损益是财务部门的职责；该技能为决策载入前瞻性经济数据。
- “渠道”是指一套连贯的市场进入模式（直接外呼、合作伙伴主导、市场平台、经销商、OEM），而不是营销来源。
- 服务成本需要进行**如实的间接费用分配**。脚本会验证各渠道的间接费用百分比是否一致——因分配不一致而造成虚假的合作伙伴利润提升，是最严重的反模式。
- LTV 输入（留存率、扩张率）按渠道划分，而不是汇总计算。合作伙伴来源客户的留存表现往往不同于直接来源客户——这种差异通常是最大的经济变量，却也是最常被忽视的变量。
- 行业配置文件（`--profile`）会针对基准调优默认值（例如，SaaS 直销 CAC 的目标回收期约为 12 个月，企业软件约为 18 个月），但不会覆盖你的数据。
- 这是一个决策支持技能。其输出是结论和推荐组合，绝不会自动重新分配资源。

## 反模式

- **将“参与影响”的交易视为“来源”的交易。** 如果某合作伙伴只是参与了你的 AE 已经在跟进的交易，这并不属于渠道来源收入。将其计为合作伙伴收入，会同时夸大合作伙伴 ROI 和直销 CAC。
- **管理费用分摊不一致。** 因为“合作伙伴承担了管理费用”，就给直销交易分摊 25% 的管理费用、给合作伙伴交易分摊 5%，这种做法是错误的。合作伙伴经理、合作伙伴计划、MDF、认证以及冲突解决的成本，全都体现在你的 P&L 中。
- **忽略赋能时间成本。** 你的 AE 与合作伙伴进行联合销售时投入的每一个小时，都是应计入合作伙伴渠道的直接成本——大多数团队都会漏算这一项。
- **MDF 缺乏 ROI 跟踪。** 如果发放市场开发基金，却无法归因到相应的销售管道 ROI，那么它只不过是合作伙伴折扣的延伸。该技能会标记没有回报的 MDF。
- **渠道组合教条。** “我们是一家合作伙伴优先的公司”／“我们不做直销”会阻碍企业进入有利可图的细分市场。渠道组合应遵循计算结果，而不是口号。
- **计算渠道 ROI 时不考虑留存率差异。** 如果合作伙伴来源客户的流失率比直销客户高 5 个百分点，忽略这一点会将合作伙伴 LTV 高估 30-50%。各渠道留存率是必填输入。
- **未将渠道经理人数计入成本归因。** 一名成本为 $200k、管理 $4M 合作伙伴 ARR 的渠道经理，意味着每 $1k ARR 对应 $50 的渠道经理成本——这足以对最终结论产生实质性影响。
- **将此技能与 partnerships-architect 混淆。** 后者用于设计合作伙伴计划。本技能则用于判断该计划能否收回自身成本。

## 区别于

- **commercial/partnerships-architect** — 合作伙伴层级设计、联合 GTM 模式、收入分成比例、合作伙伴赋能。关注的是合作伙伴计划的*结构*，而不是合作伙伴计划的*经济效益*。本技能将计划结构作为输入，并输出经济效益结论。
- **business-growth/revenue-operations** — 线索路由、SDR 运作模式、MQL 定义、销售管道运营。RevOps 负责漏斗机制；本技能则计入渠道层面的经济结果。
- **c-level-advisor/cro-advisor** — 战略性 CRO 判断：何时聘请 VP Sales、薪酬方案理念、区域设计、多年度收入战略。CRO advisor 将渠道经济效益输出作为众多输入之一。
- **finance/financial-analysis** — 按 GAAP 对历史渠道 P&L 进行结账与报告。本技能提供前瞻性决策支持；财务分析则记录历史数据。二者的时间范围、受众和输出均不相同。
- **commercial/deal-desk** — 单笔交易的折扣审批。该技能按日运作；本技能按季度运作。
- **commercial/pricing-strategist** — 定价模型和层级设计。定价是输入；渠道经济效益则反映该定价在各渠道中的实际结果。

## 追问问题库（Matt Pocock 盘问准则）

由 `/cs:grill-commercial` 或编排器逐一提问。每个问题均提供推荐答案和经典文献引用。绝不合并提问。

1. **“各渠道完全计入后的服务成本是多少——包括渠道经理人数、MDF、合作伙伴赋能时间以及管理费用分摊？”**
   推荐：将这四项全部计入。大多数团队会计入合作伙伴折扣，却漏掉渠道经理人数和赋能时间，从而将合作伙伴利润率夸大 8-15 个百分点。
   经典文献：Kaplan & Cooper（HBR 1988）— *正确衡量成本：做出正确决策*。作业成本法之所以被发明，正是因为渠道成本隐藏在管理费用中，并会扭曲利润率比较。

2. **“直接获客与合作伙伴获客的客户之间，留存率差异是多少？”**
   建议：在计算渠道 ROI **之前**，先按渠道检测留存率。5 个百分点的留存率差距会使 LTV 变动 30-50%。
   经典依据：David Skok（*For Entrepreneurs* — SaaS Metrics 2.0）。LTV =（ARPA × 毛利率）/ 流失率。不区分渠道的流失率，是导致渠道 ROI 失真的最常见原因。

3. **“在‘渠道来源’的销售管线中，实际由你们团队发起的占比是多少？”**
   建议：如果你的 AE 已经拥有该客户，那么它就不是渠道来源，而是受渠道影响。影响与来源是两条不同的经济核算线。
   经典依据：SiriusDecisions / Forrester 渠道归因研究——混淆来源与影响，是整个行业普遍高估合作伙伴 ROI 的首要原因。

4. **“投入合作伙伴计划与直销的下一美元，其边际 ROI 分别是多少？”**
   建议：计算两者的收益递减曲线。平均 ROI 掩盖了这样一个事实：下一美元可能只产生 0.3x 的回报，而平均回报为 2.1x。
   经典依据：Tomasz Tunguz（*Tomasz Tunguz blog* — 渠道 CAC 分析）。平均 ROI 是一种虚荣指标；边际 ROI 才是投资决策的依据。

5. **“过去 4 个季度中，你们的 MDF 与可归因销售管线之比是多少？”**
   建议：< 5:1（每 $1 的 MDF 应在 2 个季度内产生 ≥ $5 的可归因销售管线）。任何更宽松的标准都只是合作伙伴折扣表演。
   经典依据：Jay McBain（Canalys）——*State of the Channel* 研究。缺乏归因纪律的 MDF，是成本最高的渠道补贴形式。

6. **“你们对渠道组合的教条是否正在阻碍某个可盈利细分市场？”**
   建议：明确指出这种教条（“我们以合作伙伴为先”“我们不在 SMB 市场进行直销”）。渠道组合应遵循细分市场的经济账。
   经典依据：MIT Sloan Management Review——*When Channel Conflict Means Growth*。教条式的单一渠道战略会导致企业损失 15-25% 的 TAM，尤其是在中端市场。

7. **“你们采用的是哪种间接费用分摊方法——而且该方法是否一致地应用于直销和合作伙伴渠道？”**
   建议：两个渠道采用相同的方法、相同的分母。不一致的分摊方式，是渠道经济性分析的隐形杀手。
   经典依据：Charles Horngren（*Cost Accounting: A Managerial Emphasis*）——分摊一致性是比较不同细分市场利润率的前提。缺少这一前提，每个结论都会受到污染。

采用深度优先的方式推进。先锁定 1-3，再展开 4-7。回答完全部 7 个问题后，依次调用 `cost_to_serve_calculator.py` → `channel_roi_analyzer.py` → `channel_mix_optimizer.py`。