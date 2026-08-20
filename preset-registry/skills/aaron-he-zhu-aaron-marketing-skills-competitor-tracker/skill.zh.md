---
name: competitor-tracker
slug: aaron-competitor-tracker
displayName: "Competitor Tracker · 竞对红人追踪"
summary: "竞品创作者合作动向:合作名单、投放节奏与策略启示"
description: 'Use when the user asks to "track competitor influencer marketing", "see who my rivals partner with", or "benchmark my influencer program"; produces a competitor partnership roster, campaign and content-strategy breakdown, performance estimates, and a gap/opportunity list. Not for finding your own new creators — use influencer-discovery. 竞品达人合作追踪/竞品营销分析'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when the user wants to understand a competitor's influencer marketing: which creators they partner with, what campaigns and content formats they run, estimated reach and spend, and where they leave gaps. Activate for competitive benchmarking, finding untapped or former-competitor creators, and spotting strategy shifts over time."
argument-hint: "<your brand> [competitor names] [platform]"
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "influencer", "phase": "target", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "target"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 竞品追踪器

监测并分析竞品的网红营销活动：他们与谁合作、开展哪些营销活动、如何设计合作模式，以及他们似乎取得了哪些成果。

## 快速开始

最简调用方式：

```
Monitor [competitor name]'s influencer marketing activities
```

比较一组竞品并找出空白机会：

```
Compare influencer strategies across [competitor 1], [competitor 2], and [competitor 3], then show me which influencers they're missing in [category]
```

## 技能契约

- **读取**：你的品牌名称、竞品集合、要监测的平台、时间范围、重点领域（合作关系/营销活动/内容/全部）。用户提供的，或由 ~~social platform analytics 返回的公开创作者账号和帖子数据。
- **写入**：保存至 `memory/influencer/competitor-tracker/YYYY-MM-DD-<topic>.md` 的竞争情报报告（合作伙伴名单、营销活动分析、内容策略审查、效果估算、并排比较、机会清单）。
- **提升**：将持久性事实（已命名的竞品、其主要层级/平台、已确认的独家合作伙伴、周期性营销活动窗口）提升至 `memory/hot-cache.md`。对于已在名册中的创作者，其竞品合作伙伴和独家合作标记将通过已授权的 `operation: propose` 请求发送给 `registry-events.py`，并以单行更新的形式写入 `memory/events/creators.ndjson`，由 [creator-registry](../../../protocol/creator-registry/SKILL.md) 进行协调。
- **完成条件**：
  1. 每个被追踪的竞品都有合作伙伴名单和营销活动细分，并附有来源或明确标注的估算。
  2. 并排比较表涵盖你的品牌及所有竞品。
  3. 列出至少 3 个经过排序的机会（尚未开发的创作者、策略空白或尚未覆盖的平台）。
- **主要后续技能**：[campaign-planner](../campaign-planner/SKILL.md)

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中的标准结构。

## 数据源

此系列属于第 1 层级——无需实时集成即可运行。向用户询问竞品集合、平台以及他们已知的任何创作者账号，然后基于公开帖子和明确标注的估算构建分析。

如果某种工具能够提高效率，请使用 `~~` 连接器占位符：

- `~~influencer database`——获取竞品的已知合作伙伴名单和层级组合。
- `~~social platform analytics`——估算每位创作者的覆盖人数、互动率和发帖频率。
- `~~CRM`——交叉核查竞品的前合作伙伴是否已经进入你的业务管线。

**免密钥读取竞品新闻**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/gdelt.py" '"<competitor>"' --days 30` 无需密钥即可列出竞品的全球新闻报道，包括营销活动发布、合作公告和公关推广——数据从 GDELT 的新闻索引中**实测**获得（仅限新闻媒体，不包括社交帖子；调用间隔 ≥5 秒）。请参阅 [scripts/connectors/README.md](../../../scripts/connectors/README.md)。

**竞品合作伙伴频道监测（免费密钥/免密钥）**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/youtube.py" channel <partner-handle>` 可读取竞品合作伙伴的真实订阅者数和观看次数（使用免费的 `YOUTUBE_API_KEY`），并且每个 YouTube 频道也都有一个**免密钥 RSS 订阅源**——`https://www.youtube.com/feeds/videos.xml?channel_id=UC…`，可将其传入 `rss_monitor.py`——从而无需任何 API 即可追踪合作伙伴的发帖频率，并发现赞助内容的集中爆发。

将每项估算都标注为估算值。有关每个类别的无密钥/免费方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。

## 说明

每个步骤都在 [references/templates.md](references/templates.md) 中提供了填空模板。

1. **定义竞争范围** — 记录你的品牌、按优先级排列的竞争对手（直接/间接）、平台、时间段和重点关注领域。([模板](references/templates.md#1-define-competitive-set))
2. **跟踪网红合作关系** — 针对每个竞争对手，建立当前/近期合作伙伴名单（账号、平台、粉丝数、合作类型、持续时间），然后记录观察到的筛选标准、关系类型组合、合作频率和重要合作伙伴。([模板](references/templates.md#2-track-influencer-partnerships))
3. **分析营销活动** — 拆解近期营销活动（时间线、平台、层级组合、内容类型、话题标签、CTA、估算支出、哪些方面有效/无效），并整理活动日历以及季节性/发布规律。([模板](references/templates.md#3-analyze-campaigns))
4. **审查内容策略** — 记录形式偏好、内容主题、传播信息、话题标签策略和创意方向。([模板](references/templates.md#4-review-content-strategy))
5. **估算效果** — 估算整体项目指标、各平台和各层级的效果，以及表现最佳/欠佳的内容。将每个数字都标注为估算值。([模板](references/templates.md#5-estimate-performance))
6. **生成竞争对比** — 制作横向对比表（你的品牌 + 每个竞争对手）、策略要素矩阵和声量份额条形图。([模板](references/templates.md#6-generate-competitive-comparison))
7. **识别机会** — 对尚未开发的创作者、曾与竞争对手合作的创作者、策略缺口以及平台/细分领域/内容形式机会进行排名（至少列出 3 项并排序）。([模板](references/templates.md#7-identify-opportunities))
8. **生成洞察报告** — 包括执行摘要、战略建议（即时/短期/长期）、跟踪建议和下次审查日期。保存到上述记忆路径。([模板](references/templates.md#8-generate-insights-report))

## 完整示例

**用户**：“跟踪 Glossier、Fenty Beauty 和 Rare Beauty 的网红营销活动”

**输出**：竞争对手分析，展示 Glossier 以 UGC 为主的方法、Fenty 多元化的创作者网络，以及 Rare Beauty 聚焦心理健康的合作关系，并识别差距和按优先级排列的机会。完整的调用模式、“此 Skill 的作用”和成功技巧，请参阅 [references/templates.md](references/templates.md#when-to-use-this-skill)。

## 参考资料

- [references/templates.md](references/templates.md) — 全部 8 个步骤的填空模板、调用模式、完整示例和技巧。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接摘要格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 每个 `~~` 连接器类别的无密钥/免费数据方案。
- 同级 Scout Skill：[influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 寻找竞争对手尚未合作的创作者；[fit-scorer](../../scout/fit-scorer/SKILL.md) — 评估竞争对手的合作伙伴与你的品牌的匹配度。
- [trend-spotter](../../scout/trend-spotter/SKILL.md) — 发现竞争对手正在借势的趋势。

## 下一最佳技能

- **首选**：[campaign-planner](../campaign-planner/SKILL.md) — 将竞争差距转化为差异化营销活动。
- **备选（Scout）**：[influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 寻找本次分析所发现的尚未开发的创作者以及曾与竞争对手合作的创作者。
- **备选（Scout）**：[fit-scorer](../../scout/fit-scorer/SKILL.md) — 在挖走竞争对手的创作者之前，根据你的品牌评估其创作者阵容。

终止说明：维护一个包含本次会话中已调用技能的 visited-set。如果下一个技能已在本次会话中运行，则停止并报告技能链已完成，而不是再次调用。技能链最大深度为 3 跳。