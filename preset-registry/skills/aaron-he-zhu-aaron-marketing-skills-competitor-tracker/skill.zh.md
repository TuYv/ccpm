---
name: competitor-tracker
slug: aaron-competitor-tracker
displayName: "Competitor Tracker · 竞对红人追踪"
summary: "竞品创作者合作动向:合作名单、投放节奏与策略启示"
description: 'Use when the user asks to "track competitor influencer marketing", "see who my rivals partner with", or "benchmark my influencer program"; produces a competitor partnership roster, campaign and content-strategy breakdown, performance estimates, and a gap/opportunity list. Not for finding your own new creators — use influencer-discovery. 竞品达人合作追踪/竞品营销分析'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when the user wants to understand a competitor's influencer marketing: which creators they partner with, what campaigns and content formats they run, estimated reach and spend, and where they leave gaps. Activate for competitive benchmarking, finding untapped or former-competitor creators, and spotting strategy shifts over time."
argument-hint: "<your brand> [competitor names] [platform]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "target", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "target"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 竞争对手追踪器

监测并分析竞争对手的网红营销：他们与谁合作、开展什么活动、如何设计合作，以及他们看起来取得了什么结果。

## 快速开始

最短调用方式：

```
监测 [competitor name] 的网红营销活动
```

比较一组竞争对手并找出缺口：

```
比较 [competitor 1]、[competitor 2] 和 [competitor 3] 的网红策略，然后告诉我他们在 [category] 中缺少哪些 influencer
```

## 技能契约

- **读取**：你的品牌名称、竞争对手集合、平台、时间范围、关注领域，以及带日期的来源记录。原始 handle/profile URLs 可临时用于解析证据，但保存/报告/交接中的 creator 身份仅使用不透明的 `creator_ref`。
- **写入**：默认以内联方式返回竞争情报报告；仅在获得精确的 WARM-save 授权时才将其保存到 `memory/influencer/competitor-tracker/YYYY-MM-DD-<topic>.md`。
- **提升**：仅在获得单独的精确授权时，才将持久化事实（已命名的竞争对手、他们的主要层级/平台、已确认的独家合作方、重复出现的活动窗口）提升到 `memory/hot-cache.md`。对已编目 creator 的每次竞争对手-合作方或独家合作更新，都需要通过 `registry-events.py` 向 `memory/events/creators.ndjson` 发起另一次精确授权的 `operation: propose` 请求；只有 [creator-registry](../../../protocol/creator-registry/SKILL.md) 可以将其整合为规范状态。
- **完成条件**：
  1. 每个被追踪的竞争对手都有合作方名册和活动拆分，其事实行携带来源引用、观察日期和窗口；否则运行返回 `NEEDS_INPUT` 并附上收集计划。
  2. 一张并排比较表覆盖你的品牌以及每个竞争对手。
  3. 至少列出 3 个按优先级排序的机会（未覆盖的 creator、策略缺口，或空白平台）。
- **主要后续技能**：[campaign-planner](../campaign-planner/SKILL.md)

### 交接摘要

> 按 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 输出标准结构。

## 数据来源

Tier 1 可以生成追踪 schema 和精确的收集/查询计划。已命名的合作方、活动、当前动向、内容模式和表现事实需要带日期的用户记录、公开帖子证据或实时 connector 结果。没有这些内容时，返回 `NEEDS_INPUT`；不要仅凭通用知识重建名册或策略。估算需要明确的公式和输入引用，而且绝不是合作事实。

如果某个工具能加快处理，请使用 `~~` connector 占位符：

- `~~influencer database` — 拉取某个竞争对手已知的合作方名册和层级构成。
- `~~social platform analytics` — 估算每个 creator 的覆盖量、互动率和发帖频率。
- `~~CRM` — 交叉检查某个前竞争对手合作方是否已经接触过你的 pipeline。

**对竞争对手的无密钥新闻检索**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/gdelt.py" '"<competitor>"' --days 30` 会列出带来源 URL/日期的索引结果。仅将检索标记为对索引查询的 Measured；文章结果在底层带日期来源明确支持 creator 合作或独家关系之前，并不能验证这些事实。参见 [scripts/connectors/README.md](../../../scripts/connectors/README.md)。

**竞品-合作伙伴频道监测（免费 key / 无需 key）**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/youtube.py" channel <partner-handle>` 读取竞品合作伙伴真实的订阅者/观看次数（免费 `YOUTUBE_API_KEY`），而且每个 YouTube 频道也都有一个**无需 key 的 RSS 源**——`https://www.youtube.com/feeds/videos.xml?channel_id=UC…` 通过管道传给 `rss_monitor.py`——用于跟踪合作伙伴的发布节奏，并在完全不使用任何 API 的情况下发现赞助内容的激增。

将每个估算都标注为估算。请参见 [CONNECTORS.md](../../../CONNECTORS.md) 中按类别整理的无需 key/免费流程。

## Instructions

每一步都有一个可填写模板，见 [references/templates.md](references/templates.md)。

1. **定义竞争集合** — 记录你的品牌、优先级竞争对手（直接/间接）、平台、时间范围和关注领域。([template](references/templates.md#1-define-competitive-set))
2. **跟踪影响者合作关系** — 仅根据带日期的明确合作证据建立当前/近期名单。所有持久化输出中都使用 `creator_ref`；不要推断排他性。([template](references/templates.md#2-track-influencer-partnerships))
3. **分析活动** — 拆解有证据支持的活动，并为每个事实保留来源/日期/窗口。将“什么有效”的因果表述替换为可观察到的关联，并附上带标签的假设。([template](references/templates.md#3-analyze-campaigns))
4. **审查内容策略** — 记录形式偏好、内容主题、信息传递、标签策略和创意方向。([template](references/templates.md#4-review-content-strategy))
5. **估算表现** — 仅在已声明公式、来源输入、兼容性和时间窗口时进行。否则将指标保留为 `TBD/NEEDS_INPUT`。([template](references/templates.md#5-estimate-performance))
6. **生成竞争对比** — 一个并列表（你的品牌 + 每个竞争对手）、一个策略要素矩阵，以及一个份额可视化条。([template](references/templates.md#6-generate-competitive-comparison))
7. **识别机会** — 对尚未开发和曾合作过的创作者、策略空白，以及平台/细分领域/形式的空缺进行排序（至少 3 个，按优先级排序）。([template](references/templates.md#7-identify-opportunities))
8. **生成洞察报告** — 执行摘要、战略建议（立即/短期/长期）、跟踪建议，以及下次复审日期。以内联形式返回，并提供精确的 WARM 保存路径；不要保存、推广或在没有单独授权的情况下提出 registry 事实。

## Worked Example

**User**: "Track the influencer marketing activities of Glossier, Fenty Beauty, and Rare Beauty"

**Output**: `NEEDS_INPUT`。仅凭这些名称并不能证明当前合作伙伴或策略。返回精确的公开帖子/新闻/提供方查询，以及所需的 source/date/window 字段；在有带日期的证据之前，不要命名合作伙伴、描述策略、估算表现或排序机会。完整调用模式见 [references/templates.md](references/templates.md#when-to-use-this-skill)。

## 参考资料

- [references/templates.md](references/templates.md) — 8 个步骤的填空模板、调用模式、完整示例和提示。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接摘要格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 每个 `~~` 连接器类别的无密钥/免费数据方案。
- Scout 同级技能：[influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 找出竞争对手尚未合作的创作者；[fit-scorer](../../scout/fit-scorer/SKILL.md) — 为你的品牌评估竞争对手合作伙伴的匹配度。
- [trend-spotter](../../scout/trend-spotter/SKILL.md) — 发现竞争对手正在借势的趋势。

## 下一项最佳技能

- **主要技能**：[campaign-planner](../campaign-planner/SKILL.md) — 将竞争空白转化为差异化营销活动。
- **备选（Scout）**：[influencer-discovery](../../scout/influencer-discovery/SKILL.md) — 开拓本次分析发现的未被利用的创作者以及曾与竞争对手合作的创作者。
- **备选（Scout）**：[fit-scorer](../../scout/fit-scorer/SKILL.md) — 在挖掘竞争对手合作伙伴之前，根据你的品牌评估其合作名单。

终止说明：维护本次会话中已调用技能的访问集合。如果下一项技能已在本次会话中运行，则停止调用，并报告链条已完成。链条最大深度为 3 跳。