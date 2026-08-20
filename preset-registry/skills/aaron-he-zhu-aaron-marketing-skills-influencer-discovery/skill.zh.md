---
name: influencer-discovery
slug: influencer-discovery
displayName: "Influencer Discovery · 红人发现"
summary: "多平台红人挖掘:候选池、画像与互动指标、真实性红旗筛查、分层短名单"
description: 'Use when the user asks to "find influencers", "build an influencer list", or "discover creators in [niche]"; produces a multi-platform candidate pool, per-influencer profiles, authenticity red-flag screening, and a tiered shortlist with preliminary triage signals. Not for STAR scoring or ranking a known shortlist — use fit-scorer. 达人挖掘/找达人/创作者名单'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate when building an influencer roster from scratch, expanding into a new platform or niche, replacing churned partners, finding micro and nano creators at scale, identifying which influencers a competitor partners with, or standing up an always-on discovery pipeline. The user names a niche, platform, follower band, or brand and wants a list of candidate creators to evaluate."
argument-hint: "<brand or niche> [platform] [follower-range]"
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "influencer", "phase": "scout", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "scout"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 达人发现

通过跨平台搜索、筛选受众匹配度和真实性，并构建可供评分的分层候选名单，为你的品牌找到合适的达人。

## 快速开始

```
Find 20 influencers in [niche] for [brand/product]
```

```
Find influencers in [niche] with 50K-200K followers on TikTok and Instagram,
based in [location], engagement above 4%, who have worked with brands like [brand]
```

## 技能契约

- **读取**：品牌/产品、细分领域或类别、目标平台、粉丝数量范围、最低互动率、位置/语言、受众人口统计特征、排除条件；内存中已有的 `entity-registry` 品牌档案以及任何 `audience-mapper` 输出；`memory/creators/` 下的现有名册记录（根据已由 [creator-registry](../../../protocol/creator-registry/SKILL.md) 收录的创作者对候选池去重）。
- **写入**：仅在获得单独的明确授权后，将发现结果写入 `memory/influencer/influencer-discovery/YYYY-MM-DD-<topic>.md`——包括搜索条件、候选池统计数据、每位达人的档案，以及带有初步筛选信号的分层候选名单。值得纳入名册的入围创作者（已验证的账号、联系途径、受众统计数据），仅可通过单独授权的、发往 `registry-events.py` 的 `operation: propose` 请求，以单行更新的形式写入 `memory/events/creators.ndjson`——只有 `creator-registry` 可以在 `memory/creators/` 下写入规范记录。
- **提升**：仅在获得单独的明确授权后，将持久性事实（最高层级账号、已确认的细分领域/平台组合、竞品合作饱和的创作者）写入 `memory/hot-cache.md`。
- **完成条件**：
  - 已提供必需的搜索条件；否则停止并返回 `NEEDS_INPUT`，指出缺失的条件，不得捏造候选人。
  - 已建立候选池，其中至少有用户所要求数量的候选人通过了粉丝数量、互动率和品牌安全筛选。
  - 每位入围达人都有包含指标、受众分析和初步发现筛选信号的档案，该信号并非 STAR 适配度评分。
  - 已编制分层候选名单（必须联系 / 强力推荐 / 可考虑），并附有后续步骤指引。
- **主要后续技能**：[fit-scorer](../fit-scorer/SKILL.md)——使用加权标准对发现的候选人进行评分和排名。

### 交接摘要

> 输出 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 中的标准格式。

## 数据源

此技能系列不要求实时集成（第 1 级）：该技能仅使用用户提供的输入即可运行。向用户询问细分领域、平台、粉丝数量区间、最低互动率、位置和排除条件，然后根据用户提供的信息以及其分享的任何公开账号进行推理。

如果某种工具*能够*提高结果的准确度，请使用 `~~` 连接器占位符：

- `~~influencer database`——批量发现、粉丝数量/互动率指标、受众人口统计特征。
- `~~social platform analytics`——平台原生创作者市场数据、热门声音、相关账号。
- `~~CRM`——导入候选名单，并根据现有合作伙伴进行去重。
- `~~audience overlap`——估算创作者受众与品牌受众的匹配程度。

**无密钥候选人卡片元数据（oEmbed）**：YouTube（`https://www.youtube.com/oembed?url=<video-url>&format=json`）、TikTok（`https://www.tiktok.com/oembed?url=<post-url>`）和 X（`https://publish.twitter.com/oembed?url=<post-url>`）无需密钥即可返回帖子的标题、作者姓名/账号和缩略图——这些信息足以根据粘贴的链接自动填充候选人的资料行，无需手动复制。仅限元数据：不包含粉丝数或互动指标，因此这些数据仍需通过 `~~influencer database` 或手动导出获取——但下文所述的 **YouTube 除外**。

**实测 YouTube 指标（免费密钥）**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/youtube.py" channel @handle` 可返回实际显示的订阅者数量、总观看次数和视频数量，而 `youtube.py videos @handle --limit 10` 还会添加每个视频的观看次数、点赞数和评论数——将 YouTube 候选人的资料行从「估算」升级为**实测**。免费的 `YOUTUBE_API_KEY`（每天 10,000 个单位；检查一个频道约消耗 1–3 个单位）。服务条款边界：审核一份**具名的候选短名单**，不要构建批量创作者数据库——针对竞争性采集的配额扩展申请会被拒绝。请参阅 [scripts/connectors/README.md](../../../scripts/connectors/README.md)。

有关各类别的免费/无密钥方案以及可选启用的 MCP 层，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。这些都不是必需的——每个步骤都可以退化为使用用户提供的输入。

## 说明

每个步骤在 [references/templates.md](references/templates.md) 中都有一个待填写区块——复制对应的区块。此技能*不会*计算 STAR 适配度分数；第 4 步中的任何单个网红分数都只是发现阶段的分流信号，后续会由 [fit-scorer](../fit-scorer/SKILL.md) 使用类型化证据评估来取代。

1. **定义搜索条件。** 记录品牌、目标、受众定义、预算/粉丝量级、平台、互动率下限、地区/语言、排除项，以及必需/首选参数表。如果缺少任何必需条件，则以 `NEEDS_INPUT` 停止；仅当用户希望获得受众定义方面的帮助时，才推荐 [audience-mapper](../audience-mapper/SKILL.md)。第 1 步模板。
2. **执行搜索。** 搜索话题标签、相似账号、竞争对手提及和平台原生发现渠道；记录使用过的所有工具查询。第 2 步模板。
3. **初步筛选。** 根据粉丝数量范围、互动率、近期活跃度、相关性和品牌安全性筛选候选池；统计危险信号（疑似虚假粉丝、争议、竞争对手排他合作、不活跃）。这些是发现阶段的信号，并非经过验证的 STAR 不合格项或否决项；对于适用但缺乏支持证据的情况，在下游评分中仍应标记为「未知」。各平台的解读要点：[references/platform-vetting.md](references/platform-vetting.md)。第 3 步模板。
4. **构建网红资料。** 为每位符合条件的创作者填写资料（基本信息、指标、受众、内容、合作历史、联系方式、初步发现分流信号）。不要根据不完整的信息覆盖范围输出 STAR 适配度分数。如需对单个创作者进行深入评估并采用分层联系方式查找流程，请使用 [references/creator-dossier.md](references/creator-dossier.md)。第 4 步模板。
5. **编制发现报告。** 将资料汇总为总体统计数据、按平台和量级划分的明细、三级候选短名单、组合建议和后续步骤。第 5 步模板。
6. **补充洞察。** 记录细分领域的内容趋势、竞争格局，以及对未来搜索的建议。第 6 步模板。

以内联方式返回发现报告。保存报告、缓存候选短名单，以及将每位符合名册要求的创作者作为 `operation: propose` 提交，是三项相互独立的操作，每项操作都需要明确授权；如果没有授权，则提供符合条件的操作路径，且不写入任何内容。在经过审核的候选短名单形成后，将其连同注明日期的证据移交给 [fit-scorer](../fit-scorer/SKILL.md)。`fit-scorer` 记录所读取的 S1-S10 证据；只有 [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) 能确定经验证的 STAR 否决项并给出关卡裁决。

## 简明示例

**用户**：“为一个新的环保服装品牌寻找 15 位可持续时尚领域的微型影响者（粉丝数 10K-100K）。”

**输出**：共发现 43 位候选人，其中 15 位通过了已声明的发现筛选条件，初步分诊信号得分均高于 18/25。排名第一的候选人 @sustainablestyle_sarah（IG 47K + TikTok 23K，互动率 5.2%，曾与环保品牌合作）的发现信号得分为 24/25；候选短名单分为 5 位高互动潜在线索、7 位中等层级候选人和 3 位冉冉升起的新星。报告以内联方式返回，随后分别请求保存、晋级和注册表提案权限。完整演练见 [references/templates.md](references/templates.md#worked-example--sustainable-fashion-micro-influencers)。

## 参考资料

- [references/templates.md](references/templates.md) — 所有步骤的填充块（标准、搜索、筛选、档案、报告、洞察）、完整示例、技巧以及“做什么/何时做”概览。
- [references/platform-vetting.md](references/platform-vetting.md) — 各平台的创作者操作手册（X/LinkedIn/TikTok/YouTube/Reddit），用于支持步骤 3-4 中的筛选和档案构建。
- [references/creator-dossier.md](references/creator-dossier.md) — 基于公开数据构建的结构化单个创作者档案，包含联系人发现瀑布流程。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接摘要格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 免费、无密钥的数据方法和可选启用的 MCP 层。
- STAR 基准见 [references/star-benchmark.md](../../../references/star-benchmark.md) — 供 fit-scorer 在下游应用的评分框架。
- 侦察阶段的同级技能：[fit-scorer](../fit-scorer/SKILL.md)、[audience-mapper](../audience-mapper/SKILL.md)、[trend-spotter](../trend-spotter/SKILL.md)。

## 下一最佳技能

**首选**：[fit-scorer](../fit-scorer/SKILL.md) — 在开展外联之前，使用加权标准对已发现的候选人进行评分和排名。

**备选（同一影响者技能系列）**：
- [competitor-tracker](../../target/competitor-tracker/SKILL.md) — 当发现结果中出现大量已与竞争对手合作的创作者，并且你希望先梳理竞争格局时使用。
- [audience-mapper](../audience-mapper/SKILL.md) — 当目标受众仍不明确，需要先细化标准再重新搜索时使用。

**终止条件**：维护一个已访问集合。如果某项技能在本会话中已被调用，则停止并报告链条已完成，而不是再次调用该技能。从原始请求开始计算，最大链深度为 3 跳；达到上限时停止并总结。

## 相关技能

- [audience-mapper](../audience-mapper/SKILL.md) - 定义目标受众
- [fit-scorer](../fit-scorer/SKILL.md) - 对发现的影响者进行评分和排名
- [competitor-tracker](../../target/competitor-tracker/SKILL.md) - 查找竞品影响者
- [outreach-manager](../../activate/outreach-manager/SKILL.md) - 联系发现的影响者