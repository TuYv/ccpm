---
name: performance-analyzer
slug: performance-analyzer
displayName: "Performance Analyzer · 效果分析"
summary: "活动效果分析:达成 vs 目标、平台与创作者维度拆解、优化建议"
description: 'Use when the user asks to "analyze influencer campaign performance", "compare influencers", or "find what content worked"; produces metric scorecards vs target and benchmark, platform/influencer/content rankings, engagement-quality and sentiment reads, conversion-attribution breakdowns, and ranked learnings. Not for dollar-level return math — use roi-calculator. 达人营销效果分析/投放复盘'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use mid-flight or post-campaign when a user wants to evaluate influencer results, compare creators against each other, find top-performing content or formats, judge engagement quality and comment sentiment, connect influencer activity to conversions, or build performance benchmarks for future planning."
argument-hint: "<campaign name> [platform or influencer handles]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "report", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "report"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# Performance Analyzer

分析影响者营销活动的表现，不止停留在表层指标：根据目标/基准对结果进行评分，对平台/创作者/内容进行排名，解读互动质量与情绪，归因转化，并撰写排名学习结论。

> **跨学科（付费广告）：**这同样是跨渠道的**付费广告**评分卡/异常分析视角：将全账户指标汇总结果与目标/基准进行对比，并将其提供给 [ad-test-designer](../../../ad/orchestrate/ad-test-designer/SKILL.md)（测试什么）和 [paid-measurement-loop](../../../ad/scale/paid-measurement-loop/SKILL.md)（回读什么）。将付费分析运行结果保存到 `memory/ad/performance-analyzer/`。

## 快速开始

```
Analyze performance of [campaign name] influencer campaign
```

比较同一活动中的创作者：

```
Compare performance of these influencers from [campaign]: @handle1, @handle2, @handle3
```

## Skill Contract

- **读取**：活动名称和日期范围；平台原生分析数据（触达、观看、互动）；影响者提供的报告或截图；网站/GA 流量和转化数据；销售和促销码兑换数据；目标、基准，以及在提供时的预注册决策规则/回读窗口；可选的轻量级活动跟踪器及其 `evidence_refs`；以及 [roi-calculator](../roi-calculator/SKILL.md) 已计算的任何 ROI/ROAS 工件。复用每个明确的上游不透明 `creator_ref` 或已验证的创作者注册表聚合 ID；原始句柄/名称/URL/提供商 ID 仅作为临时查询输入，绝不能成为已保存的身份标识。只有在授权工件或已验证的注册表链接解析出该 ref 时，才能从 `memory/creators/<aggregate-id>.md` 获取每位创作者的基准数据。绝不能根据原始定位信息推导路径。
- **写入**：默认以内联形式返回表现分析。当当前的非分叉跟踪器状态工件证明状态为 `measured` 或 `closed` 时，包含步骤 8 中与该活动、创作者、测量契约和决策规则绑定的精简版 Campaign Retro Card。只有获得精确的 WARM 保存授权时，才将分析和卡片一同保存到 `memory/influencer/performance-analyzer/YYYY-MM-DD-<campaign>.md`；保存的表格、标题、证据和交接内容只能使用 `creator_ref` 加不透明源引用，绝不能使用原始句柄、名称、个人资料 URL、电子邮件地址或提供商 ID。
- **提升**：只有获得单独的精确授权，才能将有证据支持的持久活动事实（已验证的指标结果以及描述性格式/平台关联）提升到 `memory/hot-cache.md`；任何 ROI/ROAS 数值都必须绑定到其确切的 roi-calculator 工件。Retro Card 中的定性 `renew | retest | retire | unknown` 决策、理由、下一步假设和限制仍属于 WARM 内容，绝不能提升为注册表事实。本技能不提出创作者注册表建议：创作者行关闭后，现有边界仍只允许由所属工作流提出单独授权且有证据支持的**实际费率**、**已签署的授权期限/到期时间**或**已测量的表现基线**；只有 [creator-registry](../../../protocol/creator-registry/SKILL.md) 决定其是否成为规范数据。
- **完成条件**：
  - 核心指标必须与兼容且带来源日期的目标/基准进行比较。缺失或不兼容的上下文记为 `Unknown`/`NOT_SCORED`，绝不能编造 `/10` 分数或形容词式结论。
  - 只有在声明了指标、兼容的窗口/依据、完整的候选集和预注册决策规则后，才能对创作者/平台/内容进行排名；描述性关联和因果假设必须明确分开。
  - 转化必须使用一种已声明的归因模型，并采用去重且相互排斥的计数分桶；重叠的促销码/UTM/直接观察结果仍属于对账证据，建模得到的影响力在计数总额之外标记为 Estimated。
  - 在已验证当前状态为 `measured` 或 `closed` 时，每项请求的下一周期决策都必须有一个与范围绑定的 Campaign Retro Card，其中包含活动/创作者/状态/测量/决策规则引用、有证据支持的理由、`evidence_refs`、下一次活动假设和未解决的限制；决策证据不足时结论为 `unknown`，而状态缺失或存在分叉时则阻止生成卡片。
- **主要下一技能**：[roi-calculator](../roi-calculator/SKILL.md) — 将已测量的表现转化为金额层面的回报。

### 交接摘要

> Emit the standard shape from [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md).

## 数据源

此系列无需实时集成（Tier 1）。该技能完全基于你提供的输入运行：粘贴平台导出数据、影响者报告截图、GA 数字和促销代码兑换数量，然后分析受支持的字段。缺少输入不会阻止部分描述性解读，但任何依赖这些输入的评分、结论、排名、因果解释、归因总数或决策，都必须标记为 `Unknown`/`NOT_SCORED`/`NEEDS_INPUT`，而不能自行填充。

如果连接器可以加快工作流程，该技能会使用 `~~` 占位符标记：

- `~~social platform analytics` — 每条帖子在原生平台中的触达、互动和视频指标。
- `~~web analytics` — 网站流量、点击率和站内转化数据。

**已测量的 YouTube 帖子表现（免费密钥）**：当营销活动内容发布在 YouTube 上时，`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/youtube.py" videos @creator --limit 20` 可以获取营销活动时间范围内每个视频的实际观看次数、点赞数和评论数，无需等待创作者提供截图导出数据。这些属于**已测量**的平台指标。请确保两个标签都准确：API 数字标记为 User-provided，创作者提供的数字标记为 User-provided；两者合理地可能存在差异（显示取整、时间差异）。免费 `YOUTUBE_API_KEY`。参见 [scripts/connectors/README.md](../../../scripts/connectors/README.md)。
- `~~ecommerce / sales platform` — 收入、订单、AOV、促销代码兑换次数。
- `~~influencer database` — 用于比较的创作者历史基准数据。

无需占位符即可运行。参见 [CONNECTORS.md](../../../CONNECTORS.md)，了解各类别经过验证的免费/免密钥数据方案。

## 说明

将以下步骤作为一次依赖感知的流程执行。每个填充模板都位于 [references/analysis-templates.md](references/analysis-templates.md) 中。完成数据采集后构建 Step 2 的框架，但必须先运行 Step 7，再填充或发布 Step 2 中的 `Conversions`、`Revenue`，或任何依赖这些数据的比率/成本；这些字段必须引用 Step 7 中经过对账的计数总额，否则保持为 `Unknown/NEEDS_INPUT`。

1. **收集表现数据** — 记录营销活动/周期/影响者/平台，以及可用的数据源（原生分析、影响者报告、网站分析、销售数据、促销代码）。模板：step 1。
2. **分析核心指标** — 将触达、展示次数、互动、ER、视频观看次数、点击、促销代码使用次数、转化次数和收入，与来源日期兼容的目标/基准进行比较。输出字段级比较状态；不要自行创建汇总评分或形容性结论。模板：step 2。
3. **按平台分析** — 在兼容的触达/ER/点击/转化/CPA 时间窗口内比较平台，并说明观察到的差异。除非设计好的比较能够支持解释，否则将任何解释放在单独标记的假设部分中。模板：step 3。
4. **按创作者分析** — 使用不透明的 `creator_ref`；仅根据声明的规则对可比较行进行排名。ROI/ROAS 只能从有引用的 roi-calculator 工件中获取，不要在此处计算，并将观察到的内容构成与因果假设分开。续约/重测/终止决策只能来自 Retro decision gate。模板：step 4。
5. **内容表现分析** — 在兼容的曝光和归因基础上比较格式/主题。指出观察到的较高/较低关联；只有在提供的设计通过测量协议时，才能将某个开场、信息或视觉描述为因果因素或“表现优胜者”。模板：step 5。
6. **互动质量分析** — 按类型/意图拆分互动，开展有证据支持的评论情绪分析，并突出购买意向信号。使用带类型的观察结果或 `Unknown`；如果没有提供评分标准、输入和计算过程，不得输出 `/10` 质量评分。模板：step 6。
7. **转化与归因分析** — 绘制观察到的漏斗并使用一种声明的归因模型。将事件去重为互斥的计数类别；保留促销代码/UTM/直接流量之间的重叠作为对账证据，并在计数总额之外报告 Estimated influence。模板：step 7。
8. **生成洞察与建议** — 撰写 3–5 条有证据支持的观察结果、单独标记的假设以及边界明确的下一轮测试。仅当经过验证的、当前且未分叉的跟踪器状态工件证明特定营销活动/创作者处于 `measured` 或 `closed` 状态，并且提供了匹配的测量契约和决策规则引用时，才针对所请求的每个创作者决策添加一张简洁的 Campaign Retro Card；仅有阶段字符串不符合要求。只能使用 `renew | retest | retire | unknown`。模板：step 8。

在将任何创作者/形式/平台命名为真正的赢家之前，先通过 [measurement-protocol.md](../../../references/measurement-protocol.md) 中的可比性、完整范围、预注册规则和显著性门槛；否则将其标记为 `Keep-testing` 或 `NOT_RANKED`。需要结构化评分时，按维度应用 STAR 分析（Suitability/Trust/Appeal/Return 维度解读），并将财务输入交给 [roi-calculator](../roi-calculator/SKILL.md) 进行 Return（R）计算——此 skill 负责提供输入，但不计算 ROI/ROAS 或 SQS（SQS 由 creator-content-auditor gate 计算）。

对于 Retro Card，仅当可比的实测证据通过预注册决策规则，且不存在尚未解决的重大限制时，才使用 `renew`；对于合理但尚无定论或可以纠正的测试，使用 `retest`；仅当实测证据或有记录的硬性约束通过已声明的停止规则时，才使用 `retire`；否则使用 `unknown`。这一运营决策不是 STAR 维度、SQS 或 creator-content-auditor verdict；不要模拟或沿用其中任何一项。

在获得授权并完成 WARM 保存后，提供移交给 [campaign-planner](../../target/campaign-planner/SKILL.md) 的选项，将已保存的分析/卡片引用追加到相关跟踪器行的 `evidence_refs`；跟踪器编辑需要单独的明确授权，并且卡片和此 skill 都不会推进 `stage`。同时提供 [fit-scorer](../../scout/fit-scorer/SKILL.md) 作为下一周期的明确移交选项，并附上卡片的证据引用和假设。不要自动调用它，也不要将 Retro 决策转换为 STAR/SQS verdict。

## 示例

**用户**：“分析这份针对 10 位创作者的、有日期标记的夏季护肤品导出数据。数据包含不透明的创作者引用、下方的指标/目标表、按创作者和平台划分的结果、一个去重后的归因模型，以及一份已完成的显著性解读。ROI 来自 roi-calculator 工件 `roi-ref-01`。”

**输出**（节选——完整版本见 [references/analysis-templates.md](references/analysis-templates.md)）：

```markdown
# Summer Skincare Campaign Performance Analysis — illustrative export-backed read

| Metric | Result | Target | Status |
|--------|--------|--------|--------|
| Total Reach | 2.4M | 2M | ✅ +20% |
| Engagement Rate | 4.2% | 3.5% | ✅ +20% |
| Conversions | 1,847 | 2,000 | ⚠️ -8% |
| Revenue | $142,500 | $150,000 | ⚠️ -5% |
| ROAS (from `roi-ref-01`) | 2.8:1 | 3:1 | ⚠️ -7% |

**Top 3**: the three `creator_ref` rows that clear the declared ranking and significance rule, using only comparable metrics in the export.
**Key learning**: report the export-backed TikTok/Instagram delta only if the comparison windows and attribution bases match; otherwise mark it Keep-testing.
**Recommendation**: renew/drop and reallocation calls remain conditional on the predeclared decision rule rather than invented from the campaign count alone.
```

## 参考材料

- [references/analysis-templates.md](references/analysis-templates.md) — 八个可填写的步骤模板及完整的演示示例。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和移交格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别经过验证的免费/无需密钥的数据方案。
- [measurement-protocol.md](../../../references/measurement-protocol.md) — 预注册的回读窗口、结果单位、alpha、实际效果边界、多重性/序贯策略、护栏和决策负责人。分别报告统计标记和实际标记；使用 `experiment.py` 获取确定性的 `Calculated` 证据，并且绝不要替换为通用的 p 值/提升规则，也不要将业务行动归因于该辅助工具。
- [references/star-benchmark.md](../../../references/star-benchmark.md) 中的 STAR 基准 — 需要结构化评分时使用的评分架构。
- 兄弟 skills：[roi-calculator](../roi-calculator/SKILL.md)、[report-generator](../report-generator/SKILL.md)、[fit-scorer](../../scout/fit-scorer/SKILL.md)、[campaign-planner](../../target/campaign-planner/SKILL.md)。

## 下一项最佳技能

**主要技能**：[roi-calculator](../roi-calculator/SKILL.md) — 将已测量的表现转化为金额级 ROI、单次结果成本和回本周期计算。

**备选技能**（同属 Report 系列）：

- [report-generator](../report-generator/SKILL.md) — 将分析整理为正式的利益相关者报告。
- [fit-scorer](../../scout/fit-scorer/SKILL.md) — 将已验证的高表现者反馈到创作者评分中，用于下一轮筛选。

**终止说明**：维护一个已访问集合。如果某项技能已在本次会话中调用，则停止并报告链路已完成，而不是再次运行该技能。将链路限制为最多 3 跳；如果在此之后结果仍不明确，则向用户指出未完成的事项，而不是继续执行。