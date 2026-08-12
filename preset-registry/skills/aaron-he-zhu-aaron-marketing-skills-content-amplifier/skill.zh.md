---
name: content-amplifier
slug: content-amplifier
displayName: "Content Amplifier · 内容放量"
summary: "把跑赢的创作者内容用付费放大，并将 UGC 复用到付费、网站、邮件与自然渠道"
description: 'Use when the user asks to "amplify influencer content with paid media", "set up whitelisting or Spark Ads", "decide which posts to boost", "repurpose influencer content", "turn one video into multiple ads", or "build a UGC asset library"; produces (paid mode) a content-selection scorecard, a paid amplification strategy (whitelisting/boosting/dark posts), audience targeting, and a budget+optimization plan, or (repurpose mode) a rights-tracked content inventory, a 1-video-to-10+-asset repurposing map, per-format transformation specs, and a 30-day distribution plan. Not for gating whether a deliverable is publishable or FTC-compliant — use creator-content-auditor; not for the always-on brand posting calendar — use social-calendar-builder; not for drafting a net-new idea into platform-native packages — use social-creative-builder. 复用达人内容 / 内容放量.'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when a brand has live, approved creator content and wants to extract more value from it. Paid mode: extend reach with paid spend — choosing which posts to boost, setting up whitelisted Partnership Ads or TikTok Spark Ads, planning dark posts, allocating an ad budget across creators and platforms, building audience targeting off creator lookalikes, running an optimization and scale/pause playbook. Repurpose mode: reuse one asset across paid, website, email, and organic social — generating ad variations from organic clips, building a searchable rights-tracked library, populating product pages with social proof, or planning a multi-channel rollout from a small source set."
argument-hint: "[--mode paid|repurpose] <campaign or content set> [budget] [platforms/channels]"
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "influencer", "phase": "activate", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "activate"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 内容放大器

从已上线且获批的创作者内容中挖掘更多价值。两种模式：**paid**（通过付费投放扩大触达范围——白名单授权、Spark Ads、暗帖、预算与优化）和 **repurpose**（将一项素材复用于付费广告、网站、电子邮件和社交媒体——素材清单、复用映射、格式规范、分发计划）。两种模式均从已经发布并获准使用的内容开始；二者都不审核内容是否可以发布——该门禁由 [creator-content-auditor](../creator-content-auditor/SKILL.md) 负责。

**范围约束**：此技能不会从品牌一致性、信息准确性或 FTC/披露合规性方面对交付物进行评分，也不会计算 STAR 信任度/吸引力评分或执行 `STAR-T1`/`STAR-T2` 否决——这些是 [creator-content-auditor](../creator-content-auditor/SKILL.md) 门禁的职责。此技能负责下游杠杆：将已获批内容转化为付费触达或多渠道素材，然后进行移交。在产品发布中，此技能负责**复用映射和付费放大/分发执行日历**（包括发布内容的 30 天计划）；发布领域的 [momentum-planner](../../../launch/prove/momentum-planner/SKILL.md) 仅安排发布的各个*时刻*，并将分发工作移交至此。在常态化自然社交媒体运营中，职责划分方式相同：长期品牌发帖日历归 [social-calendar-builder](../../../social/craft/social-calendar-builder/SKILL.md) 负责，从全新创意到多平台内容包的起草归 [social-creative-builder](../../../social/craft/social-creative-builder/SKILL.md) 负责——此技能负责现有素材的复用和所有付费放大，而社交媒体领域仅向其标记值得推广的自然流量优胜内容。

## 模式选择器

| 模式 | 适用情形 | 核心输出 |
|------|----------|-------------|
| **paid**（默认） | 通过付费投放扩大创作者自然内容的触达范围 | 内容选择评分卡、放大策略（白名单授权/推广/暗帖）、受众定向、预算分配、优化手册 |
| **repurpose** | 将一项已获批素材复用于付费广告、网站、电子邮件和社交媒体 | 带权利追踪的素材清单、从 1 个视频到 10+ 项素材的复用映射、格式转换规范、30 天分发计划、内容库与权利追踪器 |

使用 `--mode paid` 或 `--mode repurpose` 进行选择。如果未设置：“boost / amplify / whitelisting / Spark Ads / dark post / paid spend / budget” → **paid**；“repurpose / reuse / turn one video into many / asset library / social proof on pages / multi-channel rollout” → **repurpose**。如果请求同时涉及两者（例如，“制作广告变体*并且*规划付费投放”），先运行 **repurpose** 以产出素材，然后移交给 **paid**——不要在不说明的情况下合并；请说明你运行了哪种模式。

## 快速开始

最简调用方式：

```
Which influencer content should we amplify from [campaign]?          # paid
How can we repurpose this influencer content across channels?        # repurpose
```

常见场景：

```
--mode paid: Create a paid amplification plan for our influencer campaign with $5,000 across TikTok and Instagram
--mode repurpose: We have 3 great TikTok videos. Build a repurposing plan and a 30-day distribution calendar.
```

输出预期 — **paid**：对每个候选内容进行评分、分层并分配支出，支出总额须与预算一致，同时提供扩量/暂停操作手册。**repurpose**：为每个源素材标注权利信息，将至少一个源素材映射为 3 种以上格式并分发至 2 个以上渠道，同时提供带日期的分发计划。

## 技能契约

- **读取**：
  - *paid* — 自然流量内容集（创作者账号、平台、内容类型、触达人数、互动率、观看次数）、推广预算、营销活动目标（品牌认知/流量/转化）、目标平台，以及用户提供的任何历史表现数据。
  - *repurpose* — 源 UGC 素材（视频、短视频、评论、图片）、创作者账号和平台、每项素材的使用权、原始表现指标、目标渠道。对源内容进行原子化拆分时，还需读取粘贴的文字稿/配文/评论文本。
  - 当 `memory-management` 处于启用状态时，两种模式都会从 `memory/hot-cache.md` 中提取之前的营销活动上下文。
- **写入**：对应模式的交付物（paid：筛选评分卡、策略、定向、预算、优化操作手册；repurpose：素材清单、内容再利用映射、分发计划、格式规范、权利跟踪表），以及一份可复用的交接摘要。保存至 `memory/influencer/content-amplifier/YYYY-MM-DD-<topic>.md`。
- **提升保存**：将长期有效的事实 — *paid*：选定的推广组合、各创作者的支出层级、表现优异的受众、扩量/暂停阈值；*repurpose*：权利级别、到期日期、素材库命名规范、表现最佳的源素材 — 提升保存至 `memory/hot-cache.md`（须先询问）。
- **完成条件**：
  - *paid* — (1) 每个候选内容均按 /25 评分并分层（必须推广 / 可考虑 / 不推广），且附有建议支出；(2) 按内容、目标和平台分配预算，分配总额须与指定预算一致；(3) 记录包含 KPI 目标以及扩量/暂停规则的优化计划。
  - *repurpose* — (1) 每个源素材均记录权利级别和到期日期；(2) 至少一个源素材被映射为 3 种以上不同输出格式，并覆盖 2 个以上渠道；(3) 提供带日期的分发计划和素材检查清单。
- **主要后续技能**：*paid* → 营销活动上线后使用 [performance-analyzer](../../report/performance-analyzer/SKILL.md)；*repurpose* → 使用 [landing-optimizer](../../report/landing-optimizer/SKILL.md)，将再利用的社交证明放置在能够促进转化的位置。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。说明运行了哪种模式。将每项指标标记为 Measured / User-provided / Estimated — 绝不能将并非由用户提供的 CPM、ROAS、观看次数或权利日期标记为 Measured；如果缺少相关数据，则请求用户提供导出数据，或将其标记为 Estimated 并注明估算依据。

## 数据源

此技能系列属于 Tier 1：两种模式均无需实时集成即可运行。向用户索取对应模式所需的输入，并据此生成完整产物。绝不能虚构触达人数、互动率、CPM、ROAS 或权利相关数值 — 如果缺少某项值，则请求用户提供导出数据，或将其标记为 Estimated。

连接器可用于提升输出的准确性（均为可选项，需主动启用 Tier 2/3）：

- `~~social platform analytics` — 拉取自然触达量、互动率和观看次数（适用于两种模式），无需让用户粘贴这些数据。
- `~~ad platform`（Meta Ads Manager、TikTok Ads Manager、Google Ads）— 读取实时 CPM/CTR/CPC/ROAS，用于付费优化行动手册，并确认 Spark Ads / Partnership Ad 授权状态。
- `~~influencer database` — 验证创作者受众人口统计数据，以用于相似受众定向（付费）；拉取账号名称、平台和合同权利条款（再利用）。
- `~~DAM / asset library` — 存储并标记处理后的素材；强制执行命名规范（再利用）。
- `~~CRM` — 提供再营销/排除受众（付费）；核对创作者记录与使用权到期时间（再利用）。

有关各类别经过验证的免费/免密钥方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。这些连接器均非必需；如果没有连接器，则由用户提供数据。

## 说明

首先选择模式（参见模式选择器），然后执行该模式的步骤。每个步骤在 [references/templates.md](references/templates.md) 中都有一个待填写模板——请生成填写完成的产物，不要跳过表格。

### 模式：付费

1. **评估可用内容** — 构建内容清单：营销活动、内容数量、预算，以及效果概览表（创作者、平台、类型、自然触达量、ER、观看次数、潜力）。[付费步骤 1 模板](references/templates.md#paid-1-content-inventory-step-1)。
2. **选择要放大的内容** — 为选择标准设置权重（自然表现、开场吸引力、信息清晰度、制作质量、CTA），对每条内容按 /25 评分，然后划分为“必须放大”/“预算允许时考虑”/“不予放大”三个层级，并提供建议支出。[付费步骤 2 模板](references/templates.md#paid-2-content-selection-step-2)。
3. **制定放大策略** — 从三种方法中选择组合：白名单投放 / Spark Ads（通过创作者账号投放，最适合营造原生感和社会认同）、品牌账号推广（拥有完整的定向控制，但真实感较弱）和暗帖（测试不同版本、进行特定定向）。按方法输出预算分配表。[付费步骤 3 模板](references/templates.md#paid-3-amplification-strategy-step-3-method-detail)。
4. **设置定向** — 以创作者的互动受众为基础建立主要相似受众，并添加扩展细分受众（用于认知目标的兴趣/行为/人口统计受众；用于转化目标的再营销/自定义/相似受众）、各平台的广告组和排除项。[付费步骤 4 模板](references/templates.md#paid-4-audience-targeting-step-4)。
5. **分配预算** — 按内容、目标和平台（含 CPM 估算）拆分指定预算，并设置投放节奏（学习 → 优化 → 扩量）。各项分配之和必须等于指定预算。[付费步骤 5 模板](references/templates.md#paid-5-budget-allocation-step-5)。
6. **优化行动手册** — 提供 KPI 表（CPM、CTR、CPC、CVR、ROAS），其中包含低于/高于目标时的操作，以及优化时间表、A/B 测试和明确的扩量 / 暂停 / 素材更新阈值。[付费步骤 6 模板](references/templates.md#paid-6-optimization-playbook-step-6)。
7. **平台专属设置** — Meta Partnership Ads、TikTok Spark Ads 和 YouTube 视频广告的创作者授权及营销活动设置步骤。[付费步骤 7 指南](references/templates.md#paid-7-platform-specific-setup-step-7)。

保存已填写的产出物，并在用户同意后，推广采用选定的组合、各创作者支出层级、胜出受众以及扩量/暂停阈值。

### 模式：repurpose

1. **审核可用内容** — 建立内容清单和权利摘要：每项素材都应包含 ID、创作者、平台、类型、权利级别和状态。[再利用步骤 1 模板](references/templates.md#repurpose-1-content-inventory-step-1)。
2. **梳理再利用机会** — 针对每项源素材，列出输出格式、目标渠道、修改内容和所需工作量（一个视频 → 10+ 项素材）。[再利用步骤 2 模板](references/templates.md#repurpose-2-repurposing-opportunity-map-step-2)。
3. **制定再利用计划** — 根据表现和权利对源素材进行排序，然后制定覆盖付费、自有、社交和销售渠道的分发计划。[再利用步骤 3 模板](references/templates.md#repurpose-3-repurposing-plan-step-3)。
4. **明确格式转换规范** — 提供视频→视频、视频→静态素材、引语/评论和图像转换的宽高比、时长及修改规范。各平台的规范位于 [references/platforms/](../../../references/platforms)。[再利用步骤 4 规范](references/templates.md#repurpose-4-format-transformation-specs-step-4)。
5. **应用渠道指南** — 网站、电子邮件、付费渠道（包括创意测试矩阵）和自然社交渠道的最佳实践。[再利用步骤 5 指南](references/templates.md#repurpose-5-channel-specific-guidelines-step-5)。
6. **构建内容库** — 文件夹结构、`[campaign]_[creator]_[platform]_[type]_[variation]_[date]` 命名约定和元数据字段。[再利用步骤 6 结构](references/templates.md#repurpose-6-content-library-structure-step-6)。
7. **跟踪权利** — 按内容划分的权利矩阵、权利到期提醒和权利扩展机会。[再利用步骤 7 跟踪器](references/templates.md#repurpose-7-usage-rights-tracker-step-7)。

将一个源素材拆分为多个输出原子时，请应用 [references/atom-extraction.md](references/atom-extraction.md) 中的 7 层提取方法和近重复标记。保存已填写的产出物，并在用户同意后，推广采用权利级别、到期日期、内容库命名约定和表现最佳的源素材。

## 决策关卡

- **停止并询问** — 仅当继续执行所需的模式输入缺失且无法推断时：(1) *paid* 没有预算且无法推断 — 询问推广预算；(2) *repurpose* 中有素材的使用权利未知 — 在建议将其重新用于任何广告/网站/电子邮件之前，询问权利级别，因为重复使用受权利限制的素材会带来合规风险，你绝不能凭猜测处理。
- **静默继续** — 不要因以下情况而停止：需要从 N 个内容中选择 3 个进行深入分析（根据表现选择）；缺少可选的连接器数据（标记为 N/A，向用户询问相关数值，然后继续）；某个平台不在参考范围内（应用最接近的类似平台规范并注明）。缺少自然流量指标 → 询问一次，然后使用现有内容继续，并标注数据缺口。

## 示例

**paid** — *用户*：“我们有 5 条来自发布推广活动的网红 TikTok 视频。应该用 5,000 美元的付费预算放大哪些视频？”

```markdown
| Creator | Views | ER | Hook | Amplify? | Budget |
|---------|-------|-----|------|----------|--------|
| @creator1 | 245K | 8.2% | 5/5 | Yes | $2,000 |
| @creator3 | 89K | 6.5% | 4/5 | Yes | $1,500 |
| @creator4 | 34K | 9.8% | 4/5 | Yes | $800 |
| @creator2 | 156K | 4.1% | 3/5 | Maybe | $500 |
| @creator5 | 67K | 2.3% | 2/5 | No | $0 |
Testing reserve $200. Get Spark Ads auth from top 3; run @creator1 as awareness,
@creator3 as traffic; scale winners after the 3-day learning phase.
```

**repurpose** — *用户*：“我们有 3 条很棒的 TikTok 视频。应该如何对它们进行再利用？” → 对 3 个片段进行排名；将 @creator1 的 45 秒演示视频扩展为 6 项资产（Spark Ad、IG Reel、网站嵌入视频、3 张静态图片、15 秒 Stories 剪辑），并配套提供 30 天日历和资产检查清单。

完整排名、策略、设置和两个完整示例：[references/templates.md](references/templates.md)。

## 参考资料

- [templates.md](references/templates.md) — 两种模式下每个步骤的填空模板、平台设置指南、格式转换规范、两个完整示例及技巧。
- [atom-extraction.md](references/atom-extraction.md) — 7 级内容原子提取、病毒式传播启发法，以及用于在再利用模式下将一个来源切分为多个内容的 Jaccard 近重复标记。
- 各平台的格式和展示位置规范：[tiktok](../../../references/platforms/tiktok.md) · [youtube](../../../references/platforms/youtube.md) · [linkedin](../../../references/platforms/linkedin.md) · [x](../../../references/platforms/x.md) · [reddit](../../../references/platforms/reddit.md) · [grokipedia](../../../references/platforms/grokipedia.md)。
- [star-benchmark.md](../../../references/star-benchmark.md) — STAR 框架；creator-content-auditor 在此技能运行前强制执行的信任否决规则（`STAR-T1` FTC 披露、`STAR-T2` 声明真实性）。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接摘要格式。
- [state-model.md](../../../references/state-model.md) — HOT/WARM/COLD 记忆层级和保存约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别的免费/免密钥数据方案。
- 同级技能：[creator-content-auditor](../creator-content-auditor/SKILL.md)、[contract-helper](../contract-helper/SKILL.md)、[landing-optimizer](../../report/landing-optimizer/SKILL.md)、[budget-optimizer](../../target/budget-optimizer/SKILL.md)、[performance-analyzer](../../report/performance-analyzer/SKILL.md)。

## 保存结果

交付分析结果后，询问：“是否保存这些结果以供未来会话使用？”如果回答是，则写入 `memory/influencer/content-amplifier/YYYY-MM-DD-<topic>.md`，其中包含：一句话结论/标题、3-5 项最重要的可执行事项、尚未解决的问题或阻碍，以及源数据引用。只有审计类门控可以在不询问的情况下写入记忆——此技能必须先询问，并将类似否决项的风险（缺少披露、未经证实的声明）交由 [creator-content-auditor](../creator-content-auditor/SKILL.md) 处理，而不是在此处进行判断。

## 下一最佳 Skill

**首选**：
- *付费模式* → [performance-analyzer](../../report/performance-analyzer/SKILL.md) — 营销活动上线后，衡量放大效果。
- *内容再利用模式* → [landing-optimizer](../../report/landing-optimizer/SKILL.md) — 将重新利用的客户证言、主视觉视频和引言卡片放到能够促成转化的页面上。

**备选**：
- [content-amplifier --mode paid](SKILL.md) — 当重新利用的广告变体已准备好进行付费投放时使用（仅当本次会话已运行内容再利用模式且尚未运行付费模式时运行）。
- [contract-helper](../contract-helper/SKILL.md) — 在重新使用前获取或扩展使用权（内容再利用）。
- [budget-optimizer](../../target/budget-optimizer/SKILL.md) — 在建议的各层级之间重新分配付费预算（付费）。

**终止条件**：在本次会话中维护一个已访问集合。如果推荐的目标（包括此 Skill 的同级模式）已经运行，则停止并报告调用链已完成，而不是再次调用它。调用链最大深度为 3。当路由存在歧义时，列出选项并停止，而不是自动继续。