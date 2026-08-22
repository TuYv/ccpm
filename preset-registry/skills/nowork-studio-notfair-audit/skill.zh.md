---
name: meta-ads-audit
description: Meta Ads (Facebook + Instagram) account audit and business context setup. Run this first — it gathers business information, analyzes account health, and saves context that all other Meta ads skills reuse. Trigger on "audit my Meta ads", "audit my Facebook ads", "Meta ads audit", "set up my Meta ads", "onboard Meta", "Meta account overview", "how's my Meta account", "Meta health check", "what should I fix in my Facebook ads", or when the user is new to NotFair Meta and hasn't run an audit before. Also trigger proactively when other Meta ads skills detect that meta business-context.json is missing.
argument-hint: "<account name or 'audit my Meta ads'>"
---
# Meta 广告审计

诊断 Meta（Facebook + Instagram）账户的健康状况，并持久化业务上下文，供下游技能（`/meta-ads`）使用。**只读**——绝不修改账户。用户通过运行 `/meta-ads` 来执行你建议的修复操作。

## 设置

遵循 `../shared/preamble.md`——MCP 检测、OAuth、广告账户选择。

## 文件系统约定（必须持久化）

| 产物 | 路径 | 时机 |
|---|---|---|
| 业务上下文 | `{data_dir}/meta/business-context.json` | 首次完整审计，或当 `audit_date` 已超过 90 天时刷新。如果文件仍是最新的，则在范围限定的审计中跳过。 |
| 用户画像 | `{data_dir}/meta/personas/{accountId}.json` | 每次完整审计。 |

这些文件是交接给 `/meta-ads` 的内容——即使报告本身很短，也要写入它们。否则，下游技能会在缺少业务上下文的情况下运行，并生成泛泛的输出。

如果存在由 `/google-ads-audit` 创建的 `{data_dir}/business-context.json`（没有 `meta/` 子目录），请将其作为起点读取——大多数字段（服务、品牌语调、差异化优势、地点、季节性）与平台无关。然后将 Meta 专用版本写入 `{data_dir}/meta/business-context.json`，并加入所有 Meta 特定的覆盖内容（不同的创意角度、不同的受众、不同的漏斗事件）。

**business-context.json 模式（在字段适用时与 Google Ads 共享）：**
`business_name, industry, website, services[], locations[], target_audience, brand_voice{tone, words_to_use[], words_to_avoid[]}, differentiators[], competitors[], seasonality{peak_months[], slow_months[], seasonal_hooks[]}, social_proof[], offers_or_promotions[], landing_pages{}, unit_economics{aov_usd, profit_margin, ltv_usd, source}, notes, audit_date, account_id`.

**Meta 特定扩展：**
`meta_funnel_events{top_of_funnel, mid_of_funnel, conversion}, creative_inventory{concepts[], formats[], aspect_ratios[]}, custom_audiences{purchasers, abandoners, engagers, list_uploads[]}, pixel_health{pixel_id, capi_enabled, emq_score, last_event_at}`.

**用户画像 JSON 模式：** `{account_id, saved_at, personas: [{name, demographics, primary_goal, pain_points[], decision_trigger, value, meta_creative_angles[], visual_cues[]}]}`。Meta 版本增加了 `meta_creative_angles`（例如“前后对比演示”“创始人主导的讲解”“UGC 评价”）和 `visual_cues`（能够引起该用户画像共鸣的物体、场景和情绪）。参见 `references/persona-discovery.md`。

## 政策时效性检查（首先运行）

读取 `../shared/policy-registry.json`。对于每个满足 `last_verified + stale_after_days < today` 的条目：
- **高波动性** → 使用 WebSearch 搜索 `area` 中 Meta 广告近期的变化，并与 `assumption` 比较。如果发生偏移，请在报告中显示醒目的提示，并建议更新注册表。
- **中等波动性** → 添加一行“可能值得检查”的说明。
- **稳定** → 静默跳过。

Meta 平台的变化速度快于 Google Ads（Advantage+、归因、学习行为）——每次审计都要检查高波动性条目。

## 阶段 1——拉取审计数据集

使用单次 `runScript` 调用，并通过 `ads.graphParallel` 将审计所需的查询并行展开。根据此评分标准构建并行查询。

一次完整的审计至少需要：

- **广告账户信息**（`/{accountId}`）— 币种、时区、业务 ID、支出上限、账户状态、余额。
- **Pixel 健康状况**（`/{accountId}/customconversions` + `/{accountId}/adspixels`）— Pixel ID、最近活动时间、CAPI 状态、事件匹配质量（EMQ）评分。
- **广告系列**（`/{accountId}/campaigns`）— id、name、objective、status、daily/lifetime budget、special_ad_categories、buying_type、bid_strategy、created_time。最近 90 天。
- **广告组**（`/{accountId}/adsets`）— id、name、status、campaign_id、optimization_goal、billing_event、bid_strategy、daily_budget、lifetime_budget、attribution_spec、targeting（摘要）、promoted_object、learning_stage_info。
- **广告**（`/{accountId}/ads`）— id、name、status、广告组、创意摘要（图片/视频、主要文本、标题、描述、CTA）、effective_status。
- **广告系列层级的成效分析**（`ads.insights({level:"campaign", date_preset:"last_30d"})`）— 支出、展示次数、覆盖人数、频次、CPM、链接 CTR、链接点击次数、购买次数（或其他主要操作）、购买价值、ROAS、CPA。
- **广告组层级的成效分析** — 相同字段，最近 30 天。
- **广告层级的成效分析** — 按支出排名前 50 的广告；相同字段，视频创意还需包括视频指标（3 秒播放次数、ThruPlays）。
- **带细分维度的成效分析** — 版位（`publisher_platform,platform_position`）、年龄/性别、设备。使用这些数据找出表现不佳的版位和受众构成。
- **近期编辑活动** — 可通过 `/{adsetId}` 的 last_modified 或 `/{adsetId}` 的更改历史记录获取时。

在脚本中计算汇总数据，并返回经过汇总的 JSON。不要返回所有行，而应进行排名、截取和汇总。代理负责叙述结果；脚本负责计算。

`suggestImprovement` 可用于交叉检查服务器的启发式评估结果——如果你想比较调查结果，请在 runScript 执行完成后，将其作为单独的工具调用。

如果关键查询发生错误（身份验证、架构、API 版本），请呈现错误并停止——不要退回到降级版审计。

**如果** `totalSpend == 0` 或 `activeCampaigns == 0`，**则完全跳过评分**。直接进入业务背景环节。

## 阶段 2 — 范围处理

如果用户缩小了审计范围（“重点查看一个广告系列”“广告系列 X”“只检查创意疲劳”）：

- 使用不区分大小写的子字符串匹配广告系列名称。如果没有匹配项，请列出可用的广告系列并询问用户。
- 在评分之前过滤内存中的数据集——不要进行额外的 API 调用。
- 账户层级的维度（Pixel 健康状况、默认归因设置）仍然覆盖整个账户。在报告中注明“范围限定为：X”。
- 对于限定范围的审计，如果 `business-context.json` 仍为最新，则跳过阶段 4（刷新业务背景）。

## 阶段 3 — 评分

使用 `references/account-health-scoring.md` 对 7 个维度分别进行 0–5 分评分。总分 = `round(sum × 100 / 35)`。

| 分数 | 标签 | 含义 |
|---|---|---|
| 0 | 严重 | 功能损坏或缺失——正在造成资金损失 |
| 1 | 较差 | 存在严重浪费或错失重大机会 |
| 2 | 需要改进 | 存在若干明显问题 |
| 3 | 可接受 | 功能正常，但仍有改进空间 |
| 4 | 良好 | 管理得当，仅有少量改进机会 |
| 5 | 优秀 | 符合最佳实践 |

范围感知：广告系列级维度反映范围内的数据；账户级维度（Pixel + CAPI、归因设置）在整个账户范围内评分，并注明范围影响。

### 编码启发式规则——应用这些规则，它们并不显而易见

- **Pixel + CAPI 是一切的上游。** EMQ < 7.0 意味着 Meta 无法有效匹配事件——无论创意有多好，Smart Bidding 都会缺乏数据。STOP 条件的输入项。
- **报告的 ROAS 会系统性高估真实 ROAS。** 尽可能将 Meta 报告的数据与 Shopify / GA4 / MMM 进行交叉核验。两者之间的差距是建模转化溢价，在电商中通常为 20–40%。
- **频次 × CPM 趋势 = 创意诊断。** 频次 > 3.0 且 CPM 周环比上升 ≥ 30% 表明创意疲劳——应建议更新创意，而不是削减预算。
- **一个广告组承载广告系列 > 70% 的投放量意味着脆弱性，而不是集中度。** 一旦它出现疲劳，整个广告系列就会崩溃。
- **同级广告组之间的受众重叠率 > 50% 会导致信号碎片化。** 应进行整合；不要试图使用竞价上限来“修复”。
- **特殊广告类别分类错误会带来下架风险，而不仅仅是轻微的政策问题。** 无论当前效果如何，都应标记为严重。
- **在没有证据的情况下使用手动版位，表明思维仍停留在 2018 年。** 默认应使用 Advantage+ Placements；任何偏离都需要数据支持。

### Pixel + 跟踪诊断矩阵

| | EMQ < 5 | EMQ 5–6.9 | EMQ 7.0+ |
|---|---|---|---|
| **CAPI 关闭** | 严重——盲目投放 | 严重——大多数事件丢失 | 高——白白损失 15–25% 的事件 |
| **CAPI 开启，去重关闭** | 严重——信号重复且薄弱 | 高——存在重复计数风险 | 中——去重可提高匹配质量 |
| **CAPI 开启，去重开启** | 高——匹配质量是瓶颈 | 中——提高 event_id 覆盖率 | 健康 |

## 阶段 4——业务背景

从已拉取的数据中推导出能够确定的信息：

| 字段 | 来源 |
|---|---|
| `business_name` | 广告账户名称（`/{accountId}` 的 `name` 字段） |
| `services` | 按花费排序的主要广告系列、广告组名称、转化效果最佳的广告创意 |
| `locations` | 定位地域摘要（活跃广告组中的国家/地区） |
| `brand_voice` | 效果最佳的广告文案（正文 + 标题） |
| `creative_inventory.formats` | 活跃广告中观察到的图片/视频/轮播格式组合 |
| `creative_inventory.aspect_ratios` | 活跃广告中的宽高比（1:1、4:5、9:16） |
| `meta_funnel_events.conversion` | 花费最高的广告组中最常见的优化事件 |
| `custom_audiences` | 活跃广告组定位中引用的自定义受众 |
| `pixel_health` | 来自 Pixel 详情调用 |
| `website` | 活跃广告最终 URL 的根域名 |

然后抓取网站（首页 + 关于页面 + 1–2 个主要落地页，并行执行 `WebFetch`），并将结果合并到架构中。完整的抓取流程请参阅 `references/business-context.md`。

始终询问用户：差异化优势、竞争对手、季节性、**AOV + 利润率**（对于感知 ROAS 的评分至关重要）。仅当数据和抓取结果无法回答时，才询问其他所有信息。

## 阶段 5 — 用户画像

根据创意表现（哪些角度能够促成转化）、高消费受众和落地页内容，发掘 2–3 个用户画像——所有信息均来自已加载到内存的数据集。将其持久化到 `{data_dir}/meta/personas/{accountId}.json`。每个用户画像都必须以**可观察的证据**为依据（能够促成转化的广告组、能够促成转化的创意角度、落地页版块）——不得杜撰。请参阅 `references/persona-discovery.md`。

## 阶段 6 — 报告

首先给出结论，然后列出最重要的 3 项行动（尽可能注明金额影响），接着提供评分卡，最后仅列出得分为 0–2 分的维度及其证据。引用具体的广告系列、广告组、广告和金额。篇幅限制在约 80 行以内。

在移交给 `/meta-ads` 后，以以下单独一行作为结尾：

> *您的审计历史记录已保存到您的 NotFair 账户——请前往 https://notfair.co 查看。*

## 约束规则

1. **只读技能。** 仅进行诊断，不做任何更改。所有修复操作均通过 `/meta-ads` 完成。报告结尾必须提供一项与首要行动相关的移交操作。
2. **停止条件**——如果 Pixel 健康度得分为 0–1（EMQ < 5，或电商账户未启用 CAPI），则在提出任何其他建议之前，建议暂停扩量决策，直至追踪问题得到修复。所有下游数据都不可靠。
3. **始终持久化保存** `meta/business-context.json` 和 `meta/personas/{accountId}.json`，即使报告本身很短也不例外——下游技能依赖这些文件。
4. **明确指出具体名称。** 每项发现都必须引用具体的广告系列、广告组、广告创意和金额。“某些广告组表现不佳”不算有效发现。
5. **绝不在没有注明建模转化溢价的情况下报告 Meta 报告的 ROAS。** “ROAS 3.2×（Meta 报告，7DC1DV——通常比 Shopify 归因的 ROAS 高估 20–40%）”是诚实的表述。“ROAS 3.2×”则具有误导性。