---
name: trend-spotter
slug: trend-spotter
displayName: "Trend Spotter · 趋势侦察"
summary: "排名化趋势报告:品牌契合评分、rising/peak/declining 判断与 go/skip 建议"
description: 'Use when the user asks to "find trending topics", "what trends should my brand jump on", or "time a campaign around a cultural moment"; produces a ranked trend report with brand-fit scores, format calls (rising/peak/declining), a cultural calendar, and go/skip recommendations. Not for finding the creators to run those trends — use influencer-discovery; not for building the brand posting calendar from a go verdict — use social-calendar-builder. 热点趋势洞察/借势营销'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when planning campaign timing and themes, deciding whether to join a hashtag, sound, or challenge, scouting trending content formats on a platform, mapping upcoming cultural moments to lead times, or checking which trends competitors have adopted or missed. Auto-activate when the request is about what is trending, what to post around, or when to act."
argument-hint: "<brand or industry> [platform] [time horizon]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "scout", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "scout"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 趋势洞察

此技能帮助您识别并把握对受众重要的趋势。它会监测社交对话、新兴话题、病毒式传播的内容形式和文化时刻，以指导影响者营销活动时机和内容策略。

## 快速开始

最简调用方式：

```
What trends are relevant for [brand/industry] right now?
```

常见场景 — 在投入前分析某个具体趋势：

```
Should [brand] participate in [trend/challenge]? Score the brand fit and give a go/skip call.
```

## 技能契约

- **读取**：品牌/行业、目标平台、受众、地域重点、时间范围、内容类别；如存在，还会读取 `memory/influencer/` 中先前的受众和细分领域发现。
- **写入**：默认以内联方式返回趋势报告；仅在获得对该 WARM 路径的明确授权后，才将其保存至 `memory/influencer/trend-spotter/YYYY-MM-DD-<topic>.md`。
- **提升**：仅在获得单独的明确授权后，才将持久事实（当前应采取行动的热门趋势、应避免的趋势、下次复查日期）提升至 `memory/hot-cache.md`。
- **完成条件**：
  1. 每个具名的当前趋势、热度/增长/状态声明、文化时刻及竞争对手采用声明，都具有带日期的来源引用，以及所请求的平台、地域、观察窗口、指标定义和动量对比。
  2. 对于在该确切范围内具备完整当前证据的每个候选趋势，均给出品牌契合度评分以及执行 / 谨慎 / 跳过的结论；仅凭 RSS/标题重叠的仍属于 `Proxy candidate`，并保持 `score_state: NOT_SCORED`。
  3. 仅当当前证据支持时，报告才列出前 3 个趋势、观察列表和避免列表；否则返回 `NEEDS_INPUT` 以及精确的查询/收集计划。
- **主要后续技能**：[influencer-discovery](../influencer-discovery/SKILL.md) — 寻找能够执行所选趋势的创作者。

### 交接摘要

> 按照 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 中的标准格式输出。

## 数据来源

接收信息和查询计划无需实时集成即可运行。但有关当前情况的报告则不行：它需要针对所请求的平台、地域和时间范围，由用户提供的带日期证据、公开获取的数据，或实时连接器结果。仅凭品牌输入可支持搜索词和评估标准，不能支持趋势名称、计数、增长、上升/峰值/下降判断，或执行/跳过建议。没有当前证据时，返回 `NEEDS_INPUT` 以及需收集的精确查询和字段。在工具提供读取能力的场景中，使用 `~~` 连接器占位符：

- `~~social platform analytics` — 各平台的热门标签、音频和观看次数。
- `~~trend database` — 新兴话题、挑战参与情况和增长率。
- `~~social listening` — 围绕某个话题的文化对话和情绪。
- `~~competitor tracking` — 竞争品牌采用了哪些趋势，以及这些趋势的表现。

无需连接器即可生成有用的**查询计划**。具名的当前趋势报告需要上述来源记录。请参阅 [CONNECTORS.md](../../../CONNECTORS.md)，了解每个类别的免费/无需密钥方案。

如果要用一种无需密钥的方式发现值得衡量的话题，请运行 multi-source candidate scout ——通过内置的 stdlib `rss_monitor.py` 聚合 Google Trends RSS + Hacker News + Reddit + YouTube 上传标题（无需新增依赖）：[references/trend-scout-recipe.md](references/trend-scout-recipe.md)。RSS/标题重叠只算 `Proxy candidate`，并保持 `NOT_SCORED`；它不能证明平台趋势、观看量异常值、生命周期状态，也不能作为立即行动建议。这是 `~~trend database`（Google Trends RSS）背后的 Tier-1 候选配方。

**Keyless news pulse (Tavily)**: `python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/tavily.py" search "<vertical or candidate trend>" --topic news --time-range w --limit 10` 会增加带有时效过滤的发现参考。与 RSS 标题一致可能提高查询优先级，但它仍然是 `Proxy candidate/NOT_SCORED`；新闻重叠并不能证明 TikTok、Reels、YouTube 或其他所请求平台上的动量。

**Keyless source-specific sharpeners**: `python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/pageviews.py" "<Topic_Article>" --granularity daily --days 30` 测量 Wikipedia 页面关注度，而 Hacker News Algolia API（`https://hn.algolia.com/api/v1/search?query=<topic>`，无需密钥）测量 HN 的 points/comments。这些数值仅针对其命名来源和窗口进行 `Measured`。把它们视为另一所请求平台的 `Proxy`；在给出任何 rising / peak / declining 或 act-now 结论前，必须先获得来自精确平台/地理范围/时间窗口的带日期动量。

## Instructions

当用户请求趋势分析时，按以下步骤执行。每一步都有一个可填充模板，见 [references/templates.md](references/templates.md) —— 复制对应区块并填入内容。

1. **定义趋势参数** —— 捕捉品牌/行业、平台、受众、地理焦点、时间跨度和内容类别。（模板：Step 1。）
2. **确认当前证据** —— 对每个候选主题、标签、音频、挑战、格式、文化时刻和竞品观察，保留来源引用、观察/检索日期、测量窗口、平台/地理范围、指标定义、当前值和可比的先前值。仅 RSS/标题重叠保持为 `Proxy candidate/NOT_SCORED`。缺少当前证据会停止事实输出并返回查询计划。（模板：Step 2。）
3. **分析内容格式趋势** —— 仅基于精确请求的平台/地理范围/时间窗口上的带日期动量序列，列出上升/峰值/下降的格式；解释只能标注为 observed association 或 hypothesis，不能给出未经支持的因果关系。（模板：Step 3。）
4. **追踪文化时刻** —— 提供来源日期和当前讨论/情绪声明；否则将日历/搜索字段返回为 `TBD`。（模板：Step 4。）
5. **评估趋势相关性** —— 只对有证据支撑的候选项按受众契合度、品牌价值匹配度、内容适配性、风险和时机进行评分（X/25）。无依据的候选项保持 `NOT_SCORED`，不做 go/caution/skip 判断。（模板：Step 5。）
6. **监测竞品趋势采用** —— 需要带日期的帖子/活动证据；不要从一般品牌认知推断采用情况、表现、差距或过度使用。
7. **生成趋势报告** —— 仅对通过完整当前证据门槛、且对应精确平台/地理范围/时间窗口的候选项，填写 top-3-act-now、watch、avoid、timed action、format 和 hashtag 区块；否则将这些区块留为 `TBD` 并返回 `NEEDS_INPUT` 以及采集计划。将结果内联返回；先提供精确的 WARM 保存路径，然后在任何 HOT 升级前单独询问。 （模板：Step 7。）

用于可重复的监控，请先以内联计划的形式返回任何拟议的 ledger 写入。在用户分别给出一个明确授权之前，不要运行 `ledger.py record`；该授权必须命名规范化的 ledger 路径、`record` 操作，以及精确的 source/topic/platform/geography/window 范围。report-save 或 HOT-promotion 授权绝不覆盖该写入。

## 示例

**User**: "What TikTok trends should a fitness brand run right now?"

输出为 `NEEDS_INPUT`，因为该提示没有提供带日期的 TikTok 证据。它会返回针对 topic、hashtag、sound、format、safety 和 competitor-adoption records 的 platform/geography/window-specific queries，并包含字段 `source_ref`、`observed_at` 和 `measurement_window`。在这些 records 到来之前，它不会命名任何 trend、count、status、hashtag、format winner 或 this-week action。完整版本：[references/templates.md](references/templates.md#extended-example--tiktok-fitness-trends)。

## 参考材料

- [references/templates.md](references/templates.md) — 每个步骤的填充模板、完整的带注释示例，以及执行提示。

- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和 Handoff Summary 格式。
- [state-model.md](../../../references/state-model.md) — HOT/WARM/COLD memory 层级和保存路径。
- [CONNECTORS.md](../../../CONNECTORS.md) — 按 connector 类别划分的免费/无密钥数据方案。
- [references/star-benchmark.md](../../../references/star-benchmark.md) 中的 STAR benchmark 评分 — 用于后续对趋势驱动的创意输出进行评分。
- scout 阶段的同级技能： [audience-mapper](../audience-mapper/SKILL.md)、[influencer-discovery](../influencer-discovery/SKILL.md)、[fit-scorer](../fit-scorer/SKILL.md)。

## 下一个最佳技能

- **Primary**: [influencer-discovery](../influencer-discovery/SKILL.md) — 将选定的 trends 转化为一份能够执行它们的 creator shortlist。
- **Alternate**: [audience-mapper](../audience-mapper/SKILL.md) — 在投入之前确认哪些 trends  वास्तव上会与你的 audience 产生共鸣。
- **Alternate**: [fit-scorer](../fit-scorer/SKILL.md) — 评分哪些 creators 与选定的 trends 和品牌最匹配，再决定是否投入。

Termination: 保持本次会话中已调用 skill 的 visited-set。若 primary next skill 已在本轮运行过，则停止并报告 chain complete，而不要再次调用。最大 handoff depth 为 3；一旦达到上限，进行总结并将控制权交回用户。