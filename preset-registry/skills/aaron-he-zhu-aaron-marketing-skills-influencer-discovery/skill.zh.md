---
name: influencer-discovery
slug: influencer-discovery
displayName: "Influencer Discovery · 红人发现"
summary: "多平台红人挖掘:候选池、证据画像、真实性红旗筛查与 Fit 就绪队列"
description: 'Use when the user asks to "find influencers", "build an influencer list", or "discover creators in [niche]"; produces a multi-platform candidate pool, per-influencer evidence profiles, authenticity red-flag screening, and a Fit-readiness queue without action ranking. Not for STAR scoring or ranking a known shortlist — use fit-scorer. 达人挖掘/找达人/创作者名单'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate when building an influencer roster from scratch, expanding into a new platform or niche, replacing churned partners, finding micro and nano creators at scale, identifying which influencers a competitor partners with, or standing up an always-on discovery pipeline. The user names a niche, platform, follower band, or brand and wants a list of candidate creators to evaluate."
argument-hint: "<brand or niche> [platform] [follower-range]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "scout", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "scout"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# Influencer Discovery

跨平台查找有证据支持的创作者候选人，根据已声明的发现筛选条件对其进行筛选，并构建一个不排序的就绪队列，以供后续进行类型化 Fit 评估。

## Quick Start

```
Find 20 influencers in [niche] for [brand/product]
```

```
Find influencers in [niche] with 50K-200K followers on TikTok and Instagram,
based in [location], engagement above 4%, who have worked with brands like [brand]
```

## Skill Contract

- **Reads**：品牌/产品、细分领域或类别、目标平台、粉丝范围、最低互动率、与决策相关的地理位置/语言、受众人口统计信息、排除条件；来自用户导出数据、公开来源、名册或实时连接器的带日期候选人记录；提供时，当前 campaign 的 STAR `evidence_window`；此前的 `entity-registry` 品牌档案，以及内存中存在的任何 `audience-mapper` 输出；`memory/creators/` 下的现有名册记录（仅通过针对已由 [creator-registry](../../../protocol/creator-registry/SKILL.md) 纳入名册的创作者所验证的身份链接进行去重）。
- **Writes**：默认以内联方式返回发现结果；只有在获得单独的明确授权后，才将其保存到 `memory/influencer/influencer-discovery/YYYY-MM-DD-<topic>.md`。保存的产物使用稳定的不透明 `creator_ref`，以及假名化的 `recipient_ref`、`contact_source_ref` 和 `agency_ref`，保留原始 handle、个人资料 URL 和联系坐标仅用于临时处理，并且仅以已声明筛选条件所需的粒度保留地理位置。只有在获得授权的来源产物或经过验证的 creator-registry 链接能够解析时，才保存不透明的 `handle_ref`/`source_ref` 身份解析器。没有此类解析能力时，保留 `identity_status: unresolved`，不保存隐藏的原始定位符映射，并设置 `cross_session_locator_required: true`。如果已有经过验证的 creator-registry 聚合 ID，则重复使用；否则，为候选人沿袭生成一次 `creator-<UUIDv4>`。绝不将 `creator_ref` 设置为原始 handle、姓名、URL、电子邮件、提供商 ID 或其中任何内容的确定性哈希。每次值得纳入名册的创作者更新，都需要针对通过 `registry-events.py` 写入 `memory/events/creators.ndjson` 的 `operation: propose` 请求获得另一次明确授权；只有 `creator-registry` 才能写入 `memory/creators/` 下的规范记录。
- **Promotes**：只有在获得单独的明确授权后，才将持久事实（经过验证的创作者/handle 引用、已确认的细分领域/平台覆盖范围、竞争对手密集合作的创作者）提升至 `memory/hot-cache.md`；发现就绪状态或队列位置不是持久排名事实。
- **Done when**：
  - 必需的搜索条件均已提供；否则以 `NEEDS_INPUT` 停止，并列出缺失的条件，不得虚构候选人。
  - 在缺少完整条件/证据时，恰好两个原始定位符仍保持为 `NEEDS_INPUT`，而不是经过审核的候选名单。经单独授权的部分检查点标记为 `PARTIAL`，列出所有缺口，并且不包含任何层级或排名。
  - 候选池中至少有用户请求数量的候选人通过了粉丝数、互动率和品牌安全筛选。
  - 每个候选人都有字段级证据链（`provider/tool`、`source_ref`、`observed_at`、时间窗口、证据标签）、受众分析，以及证据完整性分流状态（`READY_FOR_FIT | NEEDS_REFRESH | INELIGIBLE`）；该状态既不是评分，也不是 STAR Suitability 判定。
  - 每个候选人在报告和交接过程中都保留一个稳定的不透明 `creator_ref`；原始身份定位符仅用于临时处理，绝不得复制到 `creator_ref` 中。
  - 冲突的观察结果保持分离，身份合并必须有经过验证的交叉链接，并且 Fit 交接要根据当前 STAR `evidence_window` 将每个易变字段标记为 `current`、`stale` 或 `unknown`，同时列出任何 `refresh_required` 字段。
  - 编制一个不排序的 Fit 就绪队列，并附带下一步指针；每个过期/未知的必需字段都会产生 `NEEDS_REFRESH`、`NOT_RANKED` 和 `NEEDS_INPUT`，直到完成刷新。
- **Primary next skill**：[fit-scorer](../fit-scorer/SKILL.md) — 使用加权条件对发现的候选人进行评分和排名。

### 交接摘要

> 按照 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 输出标准格式。

## 数据源

规划和筛选不需要实时集成（Tier 1），但真实的创作者列表仍然需要候选记录：公开账号/链接或用户提供的导出文件、现有名册记录，或实时搜索连接器。仅有搜索条件不能证明任何特定创作者或指标确实存在。如果没有可用的候选来源，则返回查询/采集计划和 `NEEDS_INPUT`；绝不能臆造账号、个人资料、数量或受众数据。

仅在报告模板中规范化证据，不要通过新的摄取层处理。对于每个事实字段，保留 `provider/tool`、`source_ref`、`observed_at`、测量窗口（或 `not-supplied`），以及以下标签之一：`Measured`、`Calculated`、`Estimated`、`User-provided` 或 `Proxy`。同一字段存在冲突值时，将其作为并行观测保留；不要对其求平均、自动优先采用最新值，或仅凭名称/账号合并身份。只有在存在经验证的跨链接或得到用户明确确认后，跨提供商身份才能视为同一位创作者。

如果某个工具*可以*提升结果质量，请使用 `~~` 连接器占位符：

- `~~influencer database` — 批量发现、粉丝数/互动指标、受众人口统计信息。
- `~~social platform analytics` — 原生创作者市场数据、热门声音、相关账号。
- `~~CRM` — 提取可能的现有合作伙伴匹配项，以供经验证的身份链接审查；绝不自动合并记录。
- `~~audience overlap` — 估算创作者受众与品牌受众的匹配度。

**无需密钥的候选卡元数据（oEmbed）**：YouTube（`https://www.youtube.com/oembed?url=<video-url>&format=json`）、TikTok（`https://www.tiktok.com/oembed?url=<post-url>`）和 X（`https://publish.twitter.com/oembed?url=<post-url>`）会返回帖子的标题、作者姓名/账号和缩略图，**无需密钥**，足以临时解析候选对象，并保留不透明的已验证账号证据引用，而无需手动复制身份数据。账号引用仍与 `creator_ref` 分开：只有显式传递的上游 `creator_ref` 或经过验证的创作者注册表身份链接，才能解析聚合结果；否则创建新的随机不透明引用，并保留身份缺口。仅限元数据：不包含粉丝数或互动指标，因此这些数据仍应来自 `~~influencer database` 或手动导出文件，**但**下文所述的 YouTube 除外。

**已测量的 YouTube 指标（免费密钥）**：`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/connectors/youtube.py" channel @handle` 返回实际显示的订阅人数、总观看次数和视频数量，`youtube.py videos @handle --limit 10` 还会增加每个视频的观看次数/点赞数/评论数，从而将 YouTube 候选对象的资料行从 Estimated 升级为 **Measured**。免费的 `YOUTUBE_API_KEY`（每天 10,000 个单位；检查一个频道约消耗 1–3 个单位）。服务条款边界：审查**已命名的候选名单**，不要构建批量创作者数据库；对于竞争性采集，不提供配额扩展。请参阅 [scripts/connectors/README.md](../../../scripts/connectors/README.md)。

请参阅 [CONNECTORS.md](../../../CONNECTORS.md)，了解每个类别的免费/无需密钥方案以及选择性启用的 MCP 层。以上均非必需，每个步骤都可以降级为由用户提供输入。

## 说明

每个步骤都在 [references/templates.md](references/templates.md) 中有一个填空块，请复制匹配的块。此 skill *不会*计算单个影响者评分、STAR Suitability 判定、触达优先级或行动排名。它记录证据完整性和声明式筛选结果；后续的类型化比较与排名由 [fit-scorer](../fit-scorer/SKILL.md) 负责。

1. **定义搜索标准。** 记录品牌、目标、受众定义、预算/粉丝层级、平台、最低互动率、地点/语言、排除条件，以及必需/偏好参数表。如果缺少任何必需标准，请以 `NEEDS_INPUT` 停止；仅当用户希望获得受众定义方面的帮助时，才提供 [audience-mapper](../audience-mapper/SKILL.md)。使用步骤 1 模板。
2. **执行搜索。** 使用主题标签、相似账号、竞争对手提及内容以及平台原生发现功能。原始账号句柄/个人资料 URL 只能出现在步骤 2 的临时查找块中，并且必须在任何保存或交接之前移除。记录可安全保存的批次，包括 `creator_ref`、身份状态、可解析时的透明 `handle_ref`/`source_ref`、提供商/工具、查询目的、`observed_at`、时间窗口和证据标签。如果没有公开账号句柄/链接、用户导出数据、名册记录或实时搜索连接器能够提供候选记录，则生成准确的查询包和采集模板，返回 `NEEDS_INPUT`，并在列出创作者之前停止。使用步骤 2 模板。
3. **初步筛选。** 根据粉丝范围、互动率、近期活跃度、相关性和品牌安全性筛选候选池；统计风险信号（疑似虚假粉丝、争议、竞争对手排他合作、不活跃）。这些属于发现信号，并非已验证的 STAR 失败项或否决条件；缺乏支持的适用证据在后续评分中仍保持为 Unknown。各平台的阅读提示参见：[references/platform-vetting.md](references/platform-vetting.md)。使用步骤 3 模板。
4. **构建影响者档案。** 对每位符合条件的创作者，首先复用明确传递过来的透明 `creator_ref`，或复用其账号链接已验证的创作者注册表聚合 ID。如果两者都不存在，则生成一个随机的 `creator-<UUIDv4>`，并在本报告谱系中始终原样复用。绝不能根据账号句柄或其他身份数据推导它。仅当授权工件或已验证的注册表链接能够解析账号句柄/证据时，才保存透明的句柄/证据引用；否则保持 `identity_status: unresolved`，不创建隐藏的定位符映射，并要求在后续会话中再次提供原始定位符。然后填写档案（假名化身份引用、字段级指标和受众证据、内容、合作历史、联系路径引用以及证据完整性分诊状态）。将冲突保留为并行行，并且只有在经过验证的交叉链接之后才合并提供商身份。将每条易变观察值与当前 campaign 的 STAR `evidence_window` 进行比较：在窗口内为 `current`；窗口外为 `stale`；缺少窗口/日期或不存在 STAR 窗口时为 `unknown`。过期或未知的必需字段必须保持可见，变为 `refresh_required`，并强制设置 `triage_state: NEEDS_REFRESH`、`ranking_status: NOT_RANKED` 和 `NEEDS_INPUT`；绝不能臆造全局 TTL。不要输出评分、推荐层级或 STAR Suitability 判定。如需对单个创作者进行深度阅读并建立联系路径，请使用 [references/creator-dossier.md](references/creator-dossier.md)。使用步骤 4 模板。
5. **汇编发现报告。** 将档案汇总为摘要统计数据、描述性的平台/粉丝区间拆分，以及三个不进行排名的证据队列：在声明式筛选条件下的 `READY_FOR_FIT`、`NEEDS_REFRESH` 和 `INELIGIBLE`。在完成类型化 Fit 之前，不得推荐创作者组合，不得给任何人标注 Priority/Highly Recommended，也不得对候选人进行行动排名。如果输入仅包含两个原始定位符，且标准/证据不完整，则返回 `NEEDS_INPUT`，并且不要保存经过审查的候选池。部分检查点需要单独获得准确的保存授权，必须注明 `PARTIAL`/`NOT_VETTED`，列出标准/证据缺口，并且不得包含排名、评分、“top”标签或交接给 fit-scorer 的内容。使用步骤 5 模板。
6. **添加洞察。** 记录细分领域的内容趋势、竞争格局，以及对未来搜索的建议。使用步骤 6 模板。

内联返回发现报告。保存报告、缓存候选名单，以及通过 `registry-events.py` 以 `operation: propose` 提交每位符合名册要求的创作者，是三项彼此独立的操作，且每项都需要获得明确授权；没有授权时，提供符合条件的路径，并且不写入任何内容。在经过审核的候选名单存在后，将字段级证据以及 STAR `evidence_window`、`freshness_status` 和 `refresh_required` 列表交给 [fit-scorer](../fit-scorer/SKILL.md)；如果不存在当前的 STAR 窗口，则将新鲜度标记为 `unknown`，而不是凭空编造。`fit-scorer` 记录 S1-S10 证据读取结果；只有 [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) 能确定已验证的 STAR 否决项并生成门禁结论。

## 紧凑示例

**用户**：“为一个新的环保服装品牌寻找 15 位可持续时尚领域的微型影响者（10K-100K 粉丝）。”

**当带日期的导出文件或实时连接器返回了候选记录时的示例输出**：为每个不透明的 `creator_ref` 创建一份字段级证据档案，然后根据声明的筛选条件，将每一行放入 `READY_FOR_FIT`、`NEEDS_REFRESH` 或 `INELIGIBLE`。所有行仍保持 `NOT_RANKED`；过期或未知的必需字段标记为 `NEEDS_INPUT`，只有当前且完整的行才会交给 `fit-scorer`。没有候选记录时，只返回查询/采集计划和 `NEEDS_INPUT`。报告以内联方式返回，然后分别提供保存、推广和注册表提案权限。[references/templates.md](references/templates.md#worked-example--sustainable-fashion-micro-influencers) 中提供了完整演练。

## 参考材料

- [references/templates.md](references/templates.md) — 所有步骤的填充块（标准、搜索、筛选、档案、报告、洞察）、演练示例、提示，以及“内容/时机”概览。
- [references/platform-vetting.md](references/platform-vetting.md) — 各平台的创作者操作手册（X/LinkedIn/TikTok/YouTube/Reddit），为第 3-4 步的筛选和档案建立提供依据。
- [references/creator-dossier.md](references/creator-dossier.md) — 基于公开数据构建的结构化创作者档案，包含联系人发现瀑布流。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和 Handoff Summary 格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 免费/无需密钥的数据方案和可选的 MCP 层。
- [STAR benchmark](../../../references/star-benchmark.md) — `fit-scorer` 在下游应用的评分框架。
- scout 阶段的兄弟技能：[fit-scorer](../fit-scorer/SKILL.md)、[audience-mapper](../audience-mapper/SKILL.md)、[trend-spotter](../trend-spotter/SKILL.md)。

## 下一最佳技能

**主要技能**：[fit-scorer](../fit-scorer/SKILL.md) — 在开展接触之前，使用加权标准对已发现的候选对象进行评分和排名。

**备选技能（同一影响者系列）**：
- [competitor-tracker](../../target/competitor-tracker/SKILL.md) — 当发现过程显示创作者已被竞争对手大量覆盖，并且你希望先绘制竞争格局时使用。
- [audience-mapper](../audience-mapper/SKILL.md) — 当目标受众仍然模糊，需要在重新搜索前进一步明确标准时使用。

**终止**：维护一个已访问集合。如果某项 skill 在本次会话中已经被调用，则停止调用，并报告 chain-complete，而不是再次调用。链的最大深度为从初始请求开始的 3 跳；达到上限时停止并进行总结。

## 相关 Skills

- [audience-mapper](../audience-mapper/SKILL.md) - 定义要触达的对象
- [fit-scorer](../fit-scorer/SKILL.md) - 为发现的影响者评分并排序
- [competitor-tracker](../../target/competitor-tracker/SKILL.md) - 查找竞争对手的影响者
- [outreach-manager](../../activate/outreach-manager/SKILL.md) - 联系发现的影响者