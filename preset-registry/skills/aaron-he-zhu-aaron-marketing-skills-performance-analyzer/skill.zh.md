---
name: performance-analyzer
slug: performance-analyzer
displayName: "Performance Analyzer · 效果分析"
summary: "活动效果分析:达成 vs 目标、平台与创作者维度拆解、优化建议"
description: 'Use when the user asks to "analyze influencer campaign performance", "compare influencers", or "find what content worked"; produces metric scorecards vs target and benchmark, platform/influencer/content rankings, engagement-quality and sentiment reads, conversion-attribution breakdowns, and ranked learnings. Not for dollar-level return math — use roi-calculator. 达人营销效果分析/投放复盘'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use mid-flight or post-campaign when a user wants to evaluate influencer results, compare creators against each other, find top-performing content or formats, judge engagement quality and comment sentiment, connect influencer activity to conversions, or build performance benchmarks for future planning."
argument-hint: "<campaign name> [platform or influencer handles]"
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "influencer", "phase": "report", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "report"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 效果分析器

深入分析网红营销活动效果，而不止停留在表层指标——对照目标/基准为结果评分，对平台/创作者/内容进行排名，解读互动质量和情感倾向，归因转化，并撰写按优先级排序的经验总结。

> **跨领域（付费广告）：**这也是跨渠道**付费广告**的评分卡/异常分析视角——汇总整个账户的指标并与目标/基准对比，为 [ad-test-designer](../../../ad/orchestrate/ad-test-designer/SKILL.md)（测试什么）和 [paid-measurement-loop](../../../ad/scale/paid-measurement-loop/SKILL.md)（回读什么）提供输入。将付费广告运行结果保存在 `memory/ad/performance-analyzer/` 下。

## 快速开始

```
Analyze performance of [campaign name] influencer campaign
```

比较同一营销活动中的创作者：

```
Compare performance of these influencers from [campaign]: @handle1, @handle2, @handle3
```

## 技能契约

- **读取**：营销活动名称和日期范围；平台原生分析数据（覆盖人数、观看量、互动）；网红提供的报告或截图；网站/GA 流量和转化数据；销售和促销码兑换数据；用户提供的目标和基准；若存在，则读取 `memory/creators/<handle-slug>.md` 中每位创作者的效果基线（[creator-registry](../../../protocol/creator-registry/SKILL.md) 名册记录）。
- **写入**：将效果分析写入 `memory/influencer/performance-analyzer/YYYY-MM-DD-<campaign>.md`，涵盖核心指标评分卡、平台/网红/内容排名、互动质量和情感倾向解读、转化归因，以及按优先级排序的经验总结。
- **提升**：将持久有效的事实（表现最佳的创作者、胜出形式、各平台 ROI 占比、名册续约/淘汰决策）提升至 `memory/hot-cache.md`。
- **完成条件**：
  - 对照目标和基准为核心指标评分，并给出效果结论。
  - 对表现最佳和最差者进行排名并说明原因，同时指出行之有效的内容模式。
  - 按方法（促销码 / UTM / 直接 / 估算）归因转化，并撰写 3-5 条经验总结。
- **主要后续技能**：[roi-calculator](../roi-calculator/SKILL.md) — 将测得的效果转化为金额层面的回报。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 数据源

此技能系列无需实时集成（一级）。该技能完全基于你提供的输入运行——粘贴平台导出数据、网红报告截图、GA 数据和促销码兑换次数，即可构建完整分析。缺少任何信息时，应向用户询问，而不是阻塞流程。

如果某个连接器可以加快工作，该技能会使用 `~~` 占位符进行标记：

- `~~social platform analytics` — 每条帖子的原生覆盖人数/互动/视频指标。
- `~~web analytics` — 网站流量、点击率和站内转化数据。

**实测 YouTube 帖子效果（免费密钥）**：当营销活动内容发布在 YouTube 上时，`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/youtube.py" videos @creator --limit 20` 会拉取营销活动时间窗口内每个视频的实际观看量/点赞数/评论数——无需等待创作者导出截图即可获得**实测**平台指标。请如实保留两种标签：API 数据属于实测数据，创作者提供的数据属于用户提供的数据，两者可能合理地存在差异（显示值取整、时间差异）。使用免费的 `YOUTUBE_API_KEY`。参见 [scripts/connectors/README.md](../../../scripts/connectors/README.md)。
- `~~ecommerce / sales platform` — 收入、订单、AOV、促销码兑换次数。
- `~~influencer database` — 用于比较的创作者历史基准。

运行时无需任何占位符。有关各类别已验证的免费/无密钥数据方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。

## 说明

请按顺序执行以下步骤。每个填充模板都位于 [references/analysis-templates.md](references/analysis-templates.md) 中——复制匹配的区块并填写内容。

1. **收集绩效数据**——记录活动/周期/影响者/平台以及可用的数据来源（原生分析、影响者报告、网站分析、销售数据、促销码）。模板：步骤 1。
2. **分析核心指标**——根据目标和基准，对覆盖人数、展示次数、互动次数、ER、视频观看次数、点击次数、促销码使用次数、转化次数和收入进行评分；给出绩效结论，并指出表现超出/低于预期的对象。模板：步骤 2。
3. **按平台分析**——比较各平台的覆盖人数/ER/点击次数/转化次数/CPA，说明表现最佳和最差的平台及其原因，并分别分析平台特定的内容形式（IG feed/Reels/Stories、TikTok watch time/completion）。模板：步骤 3。
4. **按影响者分析**——根据覆盖人数/ER/转化次数/ROI 对创作者进行排名，深入分析表现最佳者（胜出原因、内容结构、续约建议），并解释表现不佳者的情况。模板：步骤 4。
5. **内容绩效分析**——对最佳内容进行排名，比较内容形式和主题，并指出胜出的开场钩子/信息传达/视觉模式。模板：步骤 5。
6. **互动质量分析**——按类型和意图拆分互动，分析评论情感，找出购买意向信号，并以 /10 评分衡量质量。模板：步骤 6。
7. **转化与归因分析**——绘制漏斗，对照基准评估转化指标，按归因方式（promo / UTM / direct / estimated）进行归因，并用表格展示促销码绩效。模板：步骤 7。
8. **生成洞察与建议**——撰写 5 项最重要的经验、哪些做法有效/哪些无效、优化机会、创作者阵容的续约/淘汰建议，以及未来活动指导。模板：步骤 8。

在将任何创作者/内容形式/平台认定为真正的胜出者之前，必须达到 [measurement-protocol.md](../../../references/measurement-protocol.md) 中的显著性门槛——否则将其标记为 Keep-testing。需要结构化评分时，应采用 [star-benchmark.md](../../../references/star-benchmark.md) 中按维度进行的 STAR 分析（Suitability/Trust/Appeal/Return 维度解读），并将测量输入交给 [roi-calculator](../roi-calculator/SKILL.md)，以获取实测的 Return (R) 证据——此技能负责提供输入，但不计算 SQS（该计算由 creator-content-auditor gate 负责）。

## 示例

**用户**：“分析我们由 10 位影响者参与的夏季护肤活动绩效”

**输出**（节选——完整版本见 [references/analysis-templates.md](references/analysis-templates.md)）：

```markdown
# Summer Skincare Campaign Performance Analysis — Above Average (7.5/10)

| Metric | Result | Target | Status |
|--------|--------|--------|--------|
| Total Reach | 2.4M | 2M | ✅ +20% |
| Engagement Rate | 4.2% | 3.5% | ✅ +20% |
| Conversions | 1,847 | 2,000 | ⚠️ -8% |
| Revenue | $142,500 | $150,000 | ⚠️ -5% |
| ROI | 2.8:1 | 3:1 | ⚠️ -7% |

**Top 3**: @skincaresarah (ROI 4.2:1), @glowwithgrace (ER 6.8%), @beautyreview (reach/$).
**Key learning**: TikTok beat Instagram (3.5:1 vs 2.1:1 ROI) — shift 20% of IG budget to TikTok.
**Recommendation**: Renew top 5; replace bottom 2 with TikTok-native creators.
```

## 参考资料

- [references/analysis-templates.md](references/analysis-templates.md) — 八个可填写的分步模板以及完整的实际示例。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 按连接器类别整理、经过验证的免费且无需密钥的数据方案。
- [measurement-protocol.md](../../../references/measurement-protocol.md) — 预注册的回读窗口、结果单位、alpha、实际效应边界、多重性/序贯策略、护栏和决策负责人。分别报告统计标志和实际意义标志；使用 `experiment.py` 生成确定性的 `Calculated` 证据，绝不能以通用的 p 值/提升幅度规则替代，也不能将业务行动归因于该辅助工具。
- [references/star-benchmark.md](../../../references/star-benchmark.md) 中的 STAR 基准 — 需要结构化评分时使用的评分架构。
- 同级技能：[roi-calculator](../roi-calculator/SKILL.md)、[report-generator](../report-generator/SKILL.md)、[fit-scorer](../../scout/fit-scorer/SKILL.md)、[campaign-planner](../../target/campaign-planner/SKILL.md)。

## 下一最佳技能

**首选**：[roi-calculator](../roi-calculator/SKILL.md) — 将实测绩效转换为金额层面的 ROI、单次结果成本和回收期计算。

**备选**（同属“报告”系列）：

- [report-generator](../report-generator/SKILL.md) — 将分析整理成正式的利益相关者报告。
- [fit-scorer](../../scout/fit-scorer/SKILL.md) — 将已验证的高绩效创作者反馈到创作者评分中，供下一轮使用。

**终止说明**：维护一个已访问集合。如果某项技能已在本会话中调用过，则停止并报告链已完成，而不是重新运行。将链的最大深度限制为 3 跳；如果此后结果仍无定论，则向用户说明尚未解决的问题，而不是继续执行。