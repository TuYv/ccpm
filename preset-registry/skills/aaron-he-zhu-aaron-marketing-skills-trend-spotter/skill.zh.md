---
name: trend-spotter
slug: trend-spotter
displayName: "Trend Spotter · 趋势侦察"
summary: "排名化趋势报告:品牌契合评分、rising/peak/declining 判断与 go/skip 建议"
description: 'Use when the user asks to "find trending topics", "what trends should my brand jump on", or "time a campaign around a cultural moment"; produces a ranked trend report with brand-fit scores, format calls (rising/peak/declining), a cultural calendar, and go/skip recommendations. Not for finding the creators to run those trends — use influencer-discovery; not for building the brand posting calendar from a go verdict — use social-calendar-builder. 热点趋势洞察/借势营销'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when planning campaign timing and themes, deciding whether to join a hashtag, sound, or challenge, scouting trending content formats on a platform, mapping upcoming cultural moments to lead times, or checking which trends competitors have adopted or missed. Auto-activate when the request is about what is trending, what to post around, or when to act."
argument-hint: "<brand or industry> [platform] [time horizon]"
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "influencer", "phase": "scout", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "scout"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 趋势洞察

此技能可帮助你识别并利用与你的受众密切相关的趋势。它会监测社交讨论、新兴话题、病毒式传播的内容形式和文化热点，为网红营销活动的时机选择和内容策略提供依据。

## 快速开始

最简调用方式：

```
What trends are relevant for [brand/industry] right now?
```

常见场景——在决定参与之前分析某一特定趋势：

```
Should [brand] participate in [trend/challenge]? Score the brand fit and give a go/skip call.
```

## 技能契约

- **读取**：品牌/行业、目标平台、受众、地域重点、时间范围、内容类别；如果存在，则读取 `memory/influencer/` 中先前的受众和细分领域研究结果。
- **写入**：将趋势报告（趋势排名、品牌契合度评分、内容形式建议、文化日历、参与/跳过建议）写入 `memory/influencer/trend-spotter/YYYY-MM-DD-<topic>.md`。
- **提升**：将长期有效的信息（当前应采取行动的主要趋势、应避免的趋势、下次审查日期）提升至 `memory/hot-cache.md`。
- **完成条件**：
  1. 每个候选趋势都有品牌契合度评分，以及参与 / 谨慎 / 跳过的判断。
  2. 报告列出当前应采取行动的三大趋势，以及观察列表和避免列表。
  3. 行动项包含时间窗口和内容形式建议。
- **主要后续技能**：[网红发现](../influencer-discovery/SKILL.md)——寻找能够执行所选趋势的创作者。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中定义的标准结构。

## 数据源

此技能无需实时集成（第 1 层级）即可运行：向用户询问品牌、平台、受众和时间范围，然后根据这些输入进行推理。如果工具有助于提高判断的准确性，请使用 `~~` 连接器占位符：

- `~~social platform analytics`——各平台的热门话题标签、声音和观看次数。
- `~~trend database`——新兴话题、挑战参与情况和增长率。
- `~~social listening`——围绕某个话题的文化讨论和情绪。
- `~~competitor tracking`——竞争品牌采用了哪些趋势，以及这些趋势的表现。

无需连接器也能生成有用的报告。有关各类别的免费/免密钥方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。

如需以免密钥方式使用真实信号填充趋势表，请运行多源趋势侦察工具——Google Trends RSS + Hacker News + Reddit + YouTube 异常值，并通过内置标准库 `rss_monitor.py`（无需新增依赖项）根据品牌的垂直领域进行评分：[references/trend-scout-recipe.md](references/trend-scout-recipe.md)。这是 `~~trend database`（Google Trends RSS）背后的第 1 层级方案。

**免密钥新闻脉搏（Tavily）**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/tavily.py" search "<vertical or candidate trend>" --topic news --time-range w --limit 10` 会为侦察数据组合添加经过时效性筛选的新闻信息，并提供每条结果的相关性评分——这是第二个免密钥来源，可在将 RSS 峰值判定为上升趋势之前对其进行交叉验证。对于单一来源的信号，继续标记为**估算**；两个独立来源得出一致结论只会提升置信度说明，而不会改变该标签。

**无密钥的势头判断增强工具**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/pageviews.py" "<Topic_Article>" --granularity daily --days 30` 可显示某个主题在维基百科上的关注度是否确实在上升——为采用上升期 / 高峰期 / 衰退期的格式判断提供量化证据——而 Hacker News Algolia API（`https://hn.algolia.com/api/v1/search?query=<topic>`，无需密钥）则可在 HN RSS 读取结果的基础上补充积分和评论数，用作热度评分。

## 说明

当用户请求趋势分析时，请执行以下步骤。每个步骤在 [references/templates.md](references/templates.md) 中都有一个填空模板——复制对应区块并填写内容。

1. **定义趋势参数**——记录品牌/行业、平台、受众、地域重点、时间范围和内容类别。（模板：步骤 1。）
2. **识别当前趋势**——记录热门话题、标签、音频/声音和挑战，以及相应的规模、增长情况、生命周期和品牌安全标记。（模板：步骤 2。）
3. **分析内容形式趋势**——按平台列出热门、新兴和衰退中的内容形式，并附上如何适配的说明。（模板：步骤 3。）
4. **追踪文化热点**——建立文化日历（事件 + 提前准备时间），列出适合参与和应当回避的讨论，以及季节性机会。（模板：步骤 4。）
5. **评估趋势相关性**——针对每个候选趋势，从受众契合度、品牌价值契合度、内容适配性、风险和时机等维度评分（X/25），并得出 ✅ 参与 / ⚠️ 谨慎 / ❌ 跳过的结论。（模板：步骤 5。）
6. **监测竞争对手对趋势的采用情况**——记录竞争对手采用了哪些趋势、错过了哪些机会，以及过度使用了哪些趋势。（模板：步骤 6。）
7. **生成趋势报告**——汇总最应立即行动的 3 个趋势、观察清单、回避清单、带时间安排的行动项、内容形式与标签策略，以及下次复盘日期。保存至 `memory/influencer/trend-spotter/YYYY-MM-DD-<topic>.md`，并将长期有效的事实提升至 `memory/hot-cache.md`。（模板：步骤 7。）

## 示例

**用户**：“健身品牌现在应该跟进哪些 TikTok 趋势？”

输出应列出当前最值得立即采取行动的热门趋势——例如 Hot Girl Walk Evolution（23 亿次观看，仍在增长；通过“和我一起走”内容推广服装/补充剂的适配度为 ⭐⭐⭐⭐⭐）、75 Hard 挑战内容（⭐⭐⭐⭐，在创作者挑战进行到一半时提供赞助），以及 GRWM Gym Edition（增长初期，具备先发优势，⭐⭐⭐⭐⭐）——并给出 15-30 秒的内容形式建议（前 2 秒设置吸引点、使用热门音频、叠加文字、快速剪辑）、标签（#FitTok、#GymTok），以及本周行动项：向创作者下达制作 GRWM Gym Edition 内容的简报。完整版本：[references/templates.md](references/templates.md#extended-example--tiktok-fitness-trends)。

## 参考资料

- [references/templates.md](references/templates.md)——各步骤的填空模板、完整实操示例和执行技巧。

- [skill-contract.md](../../../references/skill-contract.md)——共享契约和 Handoff Summary 格式。
- [state-model.md](../../../references/state-model.md)——HOT/WARM/COLD 记忆层级和保存路径。
- [CONNECTORS.md](../../../CONNECTORS.md)——按连接器类别整理的免费/无密钥数据方案。
- [references/star-benchmark.md](../../../references/star-benchmark.md) 中的 STAR 基准评分——用于后续评估由趋势驱动的创意产出。
- 侦察阶段的同级技能：[audience-mapper](../audience-mapper/SKILL.md)、[influencer-discovery](../influencer-discovery/SKILL.md)、[fit-scorer](../fit-scorer/SKILL.md)。

## 下一最佳技能

- **首选**：[influencer-discovery](../influencer-discovery/SKILL.md) — 将选定的趋势转化为一份能够落地执行这些趋势的创作者候选名单。
- **备选**：[audience-mapper](../audience-mapper/SKILL.md) — 在做出决定之前，确认哪些趋势真正能引起你的受众共鸣。
- **备选**：[fit-scorer](../fit-scorer/SKILL.md) — 在做出决定之前，评估哪些创作者与选定的趋势及品牌相契合。

终止条件：维护一个包含本次会话中已调用技能的 visited-set。如果首选的下一技能在本轮中已经运行过，则停止并报告技能链已完成，而不是再次调用。最大移交深度为 3；达到该深度后，进行总结并将控制权交还给用户。