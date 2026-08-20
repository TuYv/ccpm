---
name: trend-spotter
slug: trend-spotter
displayName: "Trend Spotter · 趋势侦察"
summary: "排名化趋势报告:品牌契合评分、rising/peak/declining 判断与 go/skip 建议"
description: 'Use when the user asks to "find trending topics", "what trends should my brand jump on", or "time a campaign around a cultural moment"; produces a ranked trend report with brand-fit scores, format calls (rising/peak/declining), a cultural calendar, and go/skip recommendations. Not for finding the creators to run those trends — use influencer-discovery; not for building the brand posting calendar from a go verdict — use social-calendar-builder. 热点趋势洞察/借势营销'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when planning campaign timing and themes, deciding whether to join a hashtag, sound, or challenge, scouting trending content formats on a platform, mapping upcoming cultural moments to lead times, or checking which trends competitors have adopted or missed. Auto-activate when the request is about what is trending, what to post around, or when to act."
argument-hint: "<brand or industry> [platform] [time horizon]"
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "influencer", "phase": "scout", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "scout"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 趋势洞察

此技能可帮助你识别对受众有意义的趋势，并利用这些趋势创造价值。它会监测社交讨论、新兴话题、病毒式传播的内容形式和文化热点，为影响者营销活动的时机选择和内容策略提供依据。

## 快速开始

最简调用方式：

```
What trends are relevant for [brand/industry] right now?
```

常见场景——在决定投入之前分析某个特定趋势：

```
Should [brand] participate in [trend/challenge]? Score the brand fit and give a go/skip call.
```

## 技能契约

- **读取**：品牌/行业、目标平台、受众、地理区域重点、时间范围、内容类别；以及 `memory/influencer/` 中已有的受众和细分领域分析结果（如有）。
- **写入**：将趋势报告（趋势排名、品牌契合度评分、内容形式建议、文化日历、参与/跳过建议）写入 `memory/influencer/trend-spotter/YYYY-MM-DD-<topic>.md`。
- **提升**：将持久有效的信息（当前应把握的热门趋势、应避免的趋势、下次审查日期）提升至 `memory/hot-cache.md`。
- **完成条件**：
  1. 每个候选趋势都有品牌契合度评分，以及参与 / 谨慎 / 跳过的判断。
  2. 报告列出当前最值得采取行动的 3 个趋势，以及观察列表和避免列表。
  3. 行动项包含执行时间窗口和内容形式建议。
- **主要后续技能**：[影响者发现](../influencer-discovery/SKILL.md)——寻找能够执行所选趋势的创作者。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 数据源

此技能无需实时集成（第 1 层级）即可运行：向用户询问品牌、平台、受众和时间范围，然后根据这些输入进行推理。如果某项工具能够提高判断的准确性，请使用 `~~` 连接器占位符：

- `~~social platform analytics`——各平台的热门话题标签、声音和观看次数。
- `~~trend database`——新兴话题、挑战参与度和增长率。
- `~~social listening`——围绕某个话题的文化讨论和情感倾向。
- `~~competitor tracking`——竞争品牌采用了哪些趋势及其表现。

无需任何连接器也能生成有用的报告。有关各类别无需密钥的免费方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。

如需以无需密钥的方式使用真实信号填充趋势表，请运行多源趋势侦察工具——Google Trends RSS + Hacker News + Reddit + YouTube 异常热视频，并通过捆绑的标准库 `rss_monitor.py` 根据品牌所属垂直领域进行评分（无需新增依赖）：[references/trend-scout-recipe.md](references/trend-scout-recipe.md)。这是 `~~trend database`（Google Trends RSS）背后的第 1 层级方案。

**无需密钥的新闻脉搏（Tavily）**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/tavily.py" search "<vertical or candidate trend>" --topic news --time-range w --limit 10` 可将经过时效性筛选、并附带单条结果相关性评分的新闻分析添加到侦察信号组合中——这是第二个无需密钥的数据源，可在将某个 RSS 峰值判定为上升趋势之前对其进行交叉验证。对于单一来源的信号，继续标记为**估算**；两个独立来源得出一致结论时，仅提升置信度说明，而不更改该标签。

**无密钥趋势动量增强器**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/pageviews.py" "<Topic_Article>" --granularity daily --days 30` 可显示某个主题在维基百科上的关注度是否确实正在上升——为采用上升期 / 高峰期 / 衰退期的判断格式提供量化证据——而 Hacker News Algolia API（`https://hn.algolia.com/api/v1/search?query=<topic>`，无需密钥）则使用可作为热度分数的得分和评论数，增强对 HN RSS 的分析。

## 说明

当用户请求趋势分析时，执行以下步骤。每个步骤在 [references/templates.md](references/templates.md) 中都有一个填空模板——复制匹配的区块并填写内容。

1. **定义趋势参数**——记录品牌/行业、平台、受众、地理重点、时间范围和内容类别。（模板：步骤 1。）
2. **识别当前趋势**——记录热门话题、标签、音频/声音和挑战，并注明规模、增长率、生命周期和品牌安全标记。（模板：步骤 2。）
3. **分析内容形式趋势**——按平台列出热门、新兴和衰退中的内容形式，并附上调整适配说明。（模板：步骤 3。）
4. **追踪文化热点时刻**——构建文化日历（事件 + 提前准备时间），确定应参与和应避开的讨论，以及季节性机会。（模板：步骤 4。）
5. **评估趋势相关性**——针对每个候选趋势，从受众契合度、品牌价值契合度、内容适配性、风险和时机方面评分（X/25），并给出 ✅ 参与 / ⚠️ 谨慎 / ❌ 跳过的结论。（模板：步骤 5。）
6. **监测竞争对手对趋势的采用情况**——记录竞争对手采用了哪些趋势、错过了哪些机会，以及过度使用了哪些趋势。（模板：步骤 6。）
7. **生成趋势报告**——汇总最应立即行动的 3 个趋势、观察列表、避开列表、定时行动项、内容形式和标签策略，以及下次复盘日期。保存至 `memory/influencer/trend-spotter/YYYY-MM-DD-<topic>.md`，并将长期有效的事实提升至 `memory/hot-cache.md`。（模板：步骤 7。）

## 示例

**用户**：“健身品牌目前应该采用哪些 TikTok 趋势？”

输出应指出当前最值得立即采用的趋势——例如“Hot Girl Walk”演变趋势（23 亿次观看，仍在增长，通过“walk with me”内容推广服装/补充剂的适配度为 ⭐⭐⭐⭐⭐）、“75 Hard”挑战内容（⭐⭐⭐⭐，赞助正在挑战过程中的创作者），以及 GRWM 健身房版（早期增长阶段，具有先发优势，⭐⭐⭐⭐⭐）——并给出 15-30 秒的内容形式建议（前 2 秒设置吸引点、使用热门音频、添加文字叠加、快速剪辑）、标签（#FitTok、#GymTok），以及本周行动项：向创作者简要说明 GRWM 健身房版的创作要求。完整版本：[references/templates.md](references/templates.md#extended-example--tiktok-fitness-trends)。

## 参考资料

- [references/templates.md](references/templates.md)——每个步骤的填空模板、完整的实践示例和执行技巧。

- [skill-contract.md](../../../references/skill-contract.md)——共享契约和交接摘要格式。
- [state-model.md](../../../references/state-model.md)——HOT/WARM/COLD 记忆层级和保存路径。
- [CONNECTORS.md](../../../CONNECTORS.md)——按连接器类别划分的免费/无密钥数据方案。
- [references/star-benchmark.md](../../../references/star-benchmark.md) 中的 STAR 基准评分——用于下游趋势驱动型创意输出的评级。
- 侦察阶段的同级技能：[audience-mapper](../audience-mapper/SKILL.md)、[influencer-discovery](../influencer-discovery/SKILL.md)、[fit-scorer](../fit-scorer/SKILL.md)。

## 下一最佳技能

- **主要**：[influencer-discovery](../influencer-discovery/SKILL.md) — 将选定的趋势转化为一份能够将其付诸实践的创作者候选名单。
- **备选**：[audience-mapper](../audience-mapper/SKILL.md) — 在做出决定前，确认哪些趋势真正能引起受众共鸣。
- **备选**：[fit-scorer](../fit-scorer/SKILL.md) — 在做出决定前，评估哪些创作者与选定趋势及品牌最契合。

终止条件：维护一个本次会话中已调用技能的访问集合。如果主要的下一技能在本轮中已经运行，则停止并报告该调用链已完成，而不是再次调用。最大移交深度为 3；达到该深度后，进行总结并将控制权交还给用户。