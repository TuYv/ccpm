---
name: influencer-discovery
slug: influencer-discovery
displayName: "Influencer Discovery · 红人发现"
summary: "多平台红人挖掘:候选池、画像与互动指标、真实性红旗筛查、分层短名单"
description: 'Use when the user asks to "find influencers", "build an influencer list", or "discover creators in [niche]"; produces a multi-platform candidate pool, per-influencer profiles, authenticity red-flag screening, and a tiered shortlist with preliminary triage signals. Not for STAR scoring or ranking a known shortlist — use fit-scorer. 达人挖掘/找达人/创作者名单'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate when building an influencer roster from scratch, expanding into a new platform or niche, replacing churned partners, finding micro and nano creators at scale, identifying which influencers a competitor partners with, or standing up an always-on discovery pipeline. The user names a niche, platform, follower band, or brand and wants a list of candidate creators to evaluate."
argument-hint: "<brand or niche> [platform] [follower-range]"
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "influencer", "phase": "scout", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "scout"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 网红发掘

通过跨平台搜索、筛选受众契合度与真实性，并构建可供评分的分层候选名单，为你的品牌找到合适的网红。

## 快速开始

```
Find 20 influencers in [niche] for [brand/product]
```

```
Find influencers in [niche] with 50K-200K followers on TikTok and Instagram,
based in [location], engagement above 4%, who have worked with brands like [brand]
```

## 技能契约

- **读取**：品牌/产品、细分领域或类别、目标平台、粉丝数量范围、最低互动率、地点/语言、受众人口统计特征、排除条件；内存中已有的 `entity-registry` 品牌档案以及任何 `audience-mapper` 输出（如存在）；`memory/creators/` 下的现有名册记录（根据已由 [creator-registry](../../../protocol/creator-registry/SKILL.md) 收录的创作者对候选池进行去重）。
- **写入**：仅在获得单独、明确授权的情况下，将发掘结果写入 `memory/influencer/influencer-discovery/YYYY-MM-DD-<topic>.md`——包括搜索条件、候选池统计数据、各网红档案、带有初步筛选信号的分层候选名单。值得纳入名册的入围创作者（已验证账号、联系途径、受众统计数据）仅可通过另行授权的 `operation: propose` 请求调用 `registry-events.py`，以单行更新形式写入 `memory/events/creators.ndjson`——只有 `creator-registry` 才能在 `memory/creators/` 下写入规范记录。
- **提升**：仅在获得单独、明确授权的情况下，将持久性事实（最高层级账号、已确认的细分领域/平台组合、竞品合作饱和的创作者）写入 `memory/hot-cache.md`。
- **完成条件**：
  - 已提供必要的搜索条件；否则以 `NEEDS_INPUT` 停止，并指出缺失的条件，不得虚构候选人。
  - 已建立候选池，其中至少有用户要求数量的候选人通过了粉丝数量、互动率和品牌安全筛选。
  - 每位入围网红均有包含指标、受众分析和初步发掘筛选信号的档案，且该信号并非 STAR 适配度评分。
  - 已编制分层候选名单（必须联系 / 强力推荐 / 可考虑），并附有后续步骤指引。
- **主要后续技能**：[fit-scorer](../fit-scorer/SKILL.md)——使用加权标准对发掘出的候选人进行评分和排名。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 数据源

此技能系列不需要实时集成（第 1 层）：该技能仅使用用户提供的输入即可运行。向用户询问细分领域、平台、粉丝数量区间、最低互动率、地点和排除条件，然后基于用户提供的信息以及其分享的任何公开账号进行推理。

如果某个工具*可以*提高结果的准确性，请使用 `~~` 连接器占位符：

- `~~influencer database`——批量发掘、粉丝数量/互动率指标、受众人口统计特征。
- `~~social platform analytics`——原生创作者市场数据、热门音频、相关账号。
- `~~CRM`——导入候选名单，并与现有合作伙伴进行去重。
- `~~audience overlap`——估算创作者受众与品牌受众的匹配度。

**无密钥的候选人卡片元数据（oEmbed）**：YouTube（`https://www.youtube.com/oembed?url=<video-url>&format=json`）、TikTok（`https://www.tiktok.com/oembed?url=<post-url>`）和 X（`https://publish.twitter.com/oembed?url=<post-url>`）无需密钥即可返回帖子的标题、作者姓名/账号和缩略图——这些信息足以根据粘贴的链接自动填充候选人的资料行，无需手动复制。仅限元数据：不包含粉丝数或互动指标，因此这些信息仍需使用 `~~influencer database` 或手动导出——**但 YouTube 除外**，详见下文。

**实测 YouTube 指标（免费密钥）**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/youtube.py" channel @handle` 可返回实际显示的订阅者数量、总观看次数和视频数量，而 `youtube.py videos @handle --limit 10` 还会添加每个视频的观看次数、点赞数和评论数——从而将 YouTube 候选人的资料行从估算值升级为**实测值**。免费的 `YOUTUBE_API_KEY`（每天 10,000 个配额单位；每次频道检查约消耗 1–3 个单位）。服务条款边界：审核**具名的候选名单**，不要构建批量创作者数据库——用于竞争性数据采集的配额扩展申请会被拒绝。参见 [scripts/connectors/README.md](../../../scripts/connectors/README.md)。

有关各类别的免费/无密钥方案和可选启用的 MCP 层，请参见 [CONNECTORS.md](../../../CONNECTORS.md)。这些都不是必需的——每个步骤都可以降级为使用用户提供的输入。

## 说明

每个步骤在 [references/templates.md](references/templates.md) 中都有一个待填写区块——复制对应的区块。此技能*不会*计算 STAR 适配度评分；第 4 步中任何针对单个网红的评分都只是用于发现阶段的初筛信号，后续会由 [fit-scorer](../fit-scorer/SKILL.md) 通过类型化证据评估取代。

1. **定义搜索标准。** 记录品牌、目标、受众定义、预算/粉丝层级、平台、最低互动率、地点/语言、排除项，以及必需/首选参数表。如果缺少任何必需标准，请以 `NEEDS_INPUT` 停止；仅当用户希望获得定义受众方面的帮助时，才提供 [audience-mapper](../audience-mapper/SKILL.md)。第 1 步模板。
2. **开展搜索。** 从话题标签、相似账号、竞品提及和平台原生发现功能入手；记录使用过的所有工具查询。第 2 步模板。
3. **初步筛选。** 根据粉丝数量范围、互动情况、内容时效性、相关性和品牌安全性筛选候选池；统计危险信号（疑似虚假粉丝、争议、竞品独家合作、长期不活跃）。这些属于发现阶段的信号，并非经验证的 STAR 不通过项或否决项；缺少支持证据的适用项，在后续评分中仍保持为未知。各平台的判读提示：[references/platform-vetting.md](references/platform-vetting.md)。第 3 步模板。
4. **构建网红资料。** 为每位符合条件的创作者填写资料（基本信息、指标、受众、内容、合作历史、联系方式、初步发现阶段初筛信号）。不要根据不完整的信息覆盖范围输出 STAR 适配度评分。如需对单个创作者进行深入评估并采用分层联系方式查找流程，请使用 [references/creator-dossier.md](references/creator-dossier.md)。第 4 步模板。
5. **汇总发现报告。** 将资料汇总为统计摘要、按平台和层级划分的明细、三级候选名单、组合建议和后续步骤。第 5 步模板。
6. **补充洞察。** 记录细分领域的内容趋势、竞争格局，以及对未来搜索的建议。第 6 步模板。

以内联方式返回发现报告。保存报告、缓存候选名单，以及将每位值得列入名册的创作者以 `operation: propose` 提交，是三项彼此独立的操作，每项都需要明确授权；如果未获授权，则提供符合条件的操作路径，但不要写入任何内容。在经过审核的候选名单形成后，将其连同注明日期的证据移交给 [fit-scorer](../fit-scorer/SKILL.md)。`fit-scorer` 记录所读取的 S1-S10 证据；只有 [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) 才能判定经验证的 STAR 否决项并给出门禁裁决。

## 简明示例

**用户**：“为一个新的环保服装品牌寻找 15 位可持续时尚领域的微型影响者（粉丝数 10K-100K）。”

**输出**：共发现 43 位候选人，其中 15 位通过声明的发现筛选条件，初步筛查信号得分高于 18/25。首选候选人 @sustainablestyle_sarah（IG 47K + TikTok 23K，互动率 5.2%，曾与环保品牌合作）的发现信号得分为 24/25；候选名单分为 5 位高互动潜在线索、7 位中层候选人和 3 位新星。报告以内联方式返回，随后分别请求保存、晋级和注册表提案权限。完整演练请参阅 [references/templates.md](references/templates.md#worked-example--sustainable-fashion-micro-influencers)。

## 参考资料

- [references/templates.md](references/templates.md) — 所有步骤的填空块（标准、搜索、筛选、档案、报告、洞察）、完整示例、技巧以及“内容/时机”概览。
- [references/platform-vetting.md](references/platform-vetting.md) — 各平台的创作者操作手册（X/LinkedIn/TikTok/YouTube/Reddit），用于支持步骤 3-4 中的筛选和建档。
- [references/creator-dossier.md](references/creator-dossier.md) — 基于公开数据构建的结构化单个创作者档案，包含联系人发现瀑布流程。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和移交摘要格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 免费/免密钥的数据方案和可选启用的 MCP 层。
- STAR 基准位于 [references/star-benchmark.md](../../../references/star-benchmark.md) — 供 fit-scorer 在下游应用的评分框架。
- 侦察阶段的同级技能：[fit-scorer](../fit-scorer/SKILL.md)、[audience-mapper](../audience-mapper/SKILL.md)、[trend-spotter](../trend-spotter/SKILL.md)。

## 下一最佳技能

**首选**：[fit-scorer](../fit-scorer/SKILL.md) — 在开展外联之前，使用加权标准对发现的候选人进行评分和排名。

**备选（同一影响者技能系列）**：
- [competitor-tracker](../../target/competitor-tracker/SKILL.md) — 当发现结果中出现大量已被竞争对手覆盖的创作者，并且你希望先绘制竞争格局时使用。
- [audience-mapper](../audience-mapper/SKILL.md) — 当目标受众仍不清晰，需要在重新搜索前进一步明确标准时使用。

**终止条件**：维护一个已访问集合。如果某项技能已在本会话中调用，则停止并报告调用链已完成，而不是再次调用它。从初始请求开始，调用链的最大深度为 3 跳；达到该深度时停止并进行总结。

## 相关技能

- [audience-mapper](../audience-mapper/SKILL.md) - 定义目标受众
- [fit-scorer](../fit-scorer/SKILL.md) - 对发现的影响者进行评分和排名
- [competitor-tracker](../../target/competitor-tracker/SKILL.md) - 查找竞品的影响者
- [outreach-manager](../../activate/outreach-manager/SKILL.md) - 联系发现的影响者