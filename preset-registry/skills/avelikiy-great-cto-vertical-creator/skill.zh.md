---
name: vertical-creator
description: Domain-knowledge primer for the marketing & creator vertical (creators, newsletter writers, podcasters, course sellers) so architect/pm don't spec naively against incumbents (Substack ~10%, Patreon 8–12%, Kajabi $149+, beehiiv, Buffer/Hootsuite/Later). Supplies the vocabulary, the non-obvious take-rate/red-ocean rules, the entities a real scheduler/analytics/monetization/sponsorship product must model, and the per-product wedge — with sponsorship-crm flagged as the white-space wedge. Applied by architect/pm during spec authoring for any of the four products in this vertical — content-scheduler, analytics, monetization, sponsorship-crm.
when_to_use: |
  Apply when:
  - architect is writing ARCH-*.md for a marketing/creator product
    (content-scheduler, analytics, monetization, sponsorship-crm)
  - pm is decomposing one of these into tasks and needs to model the
    domain entities (Sponsor, Deal, MediaKit, ScheduledPost, ChannelMetric) correctly
  - any spec touches creator monetization, take-rate, brand deals, or cross-channel publishing
  Do NOT apply for other verticals (home services, restaurants, etc.) —
  the economics here (platform take-rate as the competitive lever, sponsorship
  white-space) are specific.
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - "docs/design/**"
---
# 垂直领域：营销与创作者——降低抽成比例，占领空白市场

创作者通过他们无法控制的多个渠道将受众变现。他们的收益结构主要受 **抽成比例**（平台分成）和**品牌赞助**支配，而大多数创作者仍在使用电子表格管理品牌赞助。这里的四款产品中，有两款（内容排期、数据分析）身处由根深蒂固的既有厂商占据的**红海**；另一款（**sponsorship-crm**）则处于真正的**空白市场**。应针对这种不对称性来制定产品规格——不要从同质化产品切入。

## 1. 领域术语

- **CPM（cost per mille，每千次展示成本）**——每 1,000 次展示对应的广告/赞助价格。代表供给侧。
- **RPM（revenue per mille，每千次展示收入）**——扣除平台分成后，创作者每 1,000 次观看/打开实际获得的收入。RPM < CPM；两者之间的差额来自费用和未售出的广告库存。
- **赞助 / 品牌合作**——品牌付费让创作者推广产品。这里的空白市场收入单元。
- **付费模式**——合作的结算方式：**固定费用**（每项交付物收取固定金额）、**联盟分成**（推荐销售额的百分比）或 **CPA**（按行动计费——每次注册/安装支付固定金额）。单笔合作可以混合使用多种模式（固定费用 + 联盟分成）。
- **交付物**——需要交付的具体内容资产：帖子、快拍、专属邮件、视频**植入**（较长视频中的一个片段）等。每项交付物都有对应的渠道和截止日期。
- **使用权**——品牌是否可以复用创作者的内容，以及可以复用多久（例如通过“白名单授权”将其作为付费广告投放）。应单独定价；很容易在无意中免费让渡。
- **媒体资料包**——创作者用于销售的一页式资料：受众规模、人口统计特征、互动情况、过往合作品牌。
- **报价单**——创作者针对各类交付物公布的价格。谈判的锚点。
- **受众人口统计特征**——地域、年龄、性别比例——品牌据此决定购买。
- **互动率**——互动次数 ÷ 覆盖人数/粉丝数。品牌定价所依据的质量信号。
- **抽成比例（平台分成）**——变现平台抽取的百分比（Substack 约 10%，Patreon 为 8–12%）。该垂直领域中最重要的单一竞争杠杆。
- **MRR**——会员/订阅产生的月度经常性收入；会员业务的 KPI。
- **UTM**——链接上的营销活动追踪参数；归因分析的原始输入。
- **跨渠道归因**——在使用不同 ID 的多个平台之间，将转化/收入归因至正确的渠道和帖子。实现难度高，也是数据分析产品的护城河。

## 2. 不明显的领域规则

- **内容排期和数据分析是红海——不要从这里切入。** Buffer、Hootsuite 和 Later 已占据跨渠道内容排期市场；所有数据分析厂商都只是在换皮包装各渠道的数据面板。构建“又一个排期工具”是毫无切入优势的同质化玩法。这两者只有作为套件的*连接组织*时才有存在价值，绝不能作为切入点。
- **赞助管理是空白市场——这才是真正的切入点。** 大多数创作者都在使用**电子表格**追踪赞助品牌、合作和交付物。这个品类尚无根基稳固的领导者。专门打造的赞助 CRM 是这里唯一一款从第一天起就有充分且可防御的存在理由的产品。
- **变现平台抽成 8–12%——以更低的抽成比例竞争。** 竞争杠杆不是功能，而是抽成。如果既有平台抽成 10%，而你只抽 3%，这*本身就是*卖点。抽成比例必须是首要的、可配置的设计决策，而不是事后才考虑的问题。
- **每个社交渠道都有不同的 API 和内容形态。** “帖子”并不是单一事物：X 帖子、IG 快拍、YouTube 植入和电子邮件在格式、限制、指标和身份验证方面各不相同。应在模型层进行标准化；绝不能假设所有渠道都遵循某一个渠道的形态。
- **品牌合作包含交付物 + 使用权 + 付款里程碑。** 一笔合作并非一条明细，而是一个小型项目：包含跨渠道的多项交付物、使用权条款和分阶段付款（例如签约时支付 50%，上线时支付 50%）。这三者都必须建模。

## 3. 天真的构建方式会犯哪些错误

- **又构建一个调度器** — 把 content-scheduler 当作主打产品。它是红海中的同质化商品；如果作为独立产品发布，就会与 Buffer 正面竞争并落败。
- **把 sponsorship-crm 做成通用 CRM** — 将“交易”建模为联系人 + 金额 + 阶段，忽略了领域特性。它需要**交付物**、**报价卡**、**使用权**、**费用模式**和**付款里程碑** — 而通用的销售管道 CRM 无法涵盖其中任何一项。
- **只是给单一渠道换皮的分析功能** — 把 YouTube Studio 的数据放进更漂亮的图表毫无增益。唯一具备防御力的分析功能是带归因的**标准化跨渠道**分析，而不是对单一渠道的镜像复刻。
- **忽视抽成比例这一杠杆的变现产品** — 复制 Substack 的功能集，同时照搬 Substack 10% 的抽成。如果不以抽成比例为设计中心，用户就没有切换的理由。

## 4. 必须建模的实体

明确规定这些实体；它们会反复出现在四款产品中。应按照
[[migration-ready-schema]] 构建它们（稳定的外部 ID、软删除、审计时间戳），因为
创作者往往会在业务进行到一半时从电子表格和现有平台迁移而来，并导入尚未完成的交易 + 会员。

- **Sponsor** — 品牌方：联系人、过往交易、状态。与 Deal 是不同的实体。
- **Deal** — 赞助收入的基本单位：**阶段**（潜在客户 → 谈判中 → 已签约 →
  交付中 → 已付款）、**费用模式**（固定费用 / 联盟分成 / CPA，也可能混合使用）、**交付物**
  （每项均包含渠道 + 截止日期 + 状态）、**使用权**（范围 + 期限），以及
  **付款里程碑**（金额 + 触发条件 + 付款状态）。这是市场空白产品 —
  应对其进行丰富的建模。
- **MediaKit / RateCard** — 受众统计数据 + 人口特征 + 互动情况（媒体资料包），以及
  各交付物的价格（报价卡）。这是面向销售的界面；为 Deal 谈判提供信息。
- **ScheduledPost** — 一条逻辑帖子，包含**各渠道变体**（不同渠道的内容、格式、
  限制和素材引用各不相同）、计划发布时间，以及各渠道的发布状态。
  绝不能让所有渠道共享同一个正文字符串。
- **ChannelMetric** — 一行**标准化跨渠道**指标（渠道、帖子引用、指标
  类型、值、周期），使分析功能能够对使用不同原生 ID 的各平台进行汇总和比较。
- **Membership / Paywall tier** — 名称、价格、周期、**抽成比例**、权益、会员
  数量；经常性收入（MRR）变现的基本单位。

## 5. 各产品说明（相较现有产品的切入点 + 唯一必须做好的事项）

- **sponsorship-crm** (crm) — **核心切入点。市场空白。** 创作者目前使用电子表格处理此类工作；
  该品类尚无领导者。**必须做好：将 Deal 视为项目，而不是联系人** — 交付物 +
  报价卡 + 使用权 + 费用模式 + 付款里程碑，并配备阶段状态机。通用
  CRM 根本不是答案。参见 [[vertical-onboarding]]：首次激活 = 从电子表格中
  导入第一个赞助方 + Deal。
- **monetization** (content) — 切入点：**以更低的抽成比例竞争**。以
  3% 的抽成提供付费墙、会员和打赏，而现有产品的抽成为 8–12%。**必须做好：将抽成比例作为一等、
  可配置的设计中心**，并跟踪 MRR；会员通信的同意管理交由 [[lifecycle-messaging]]。
- **content-scheduler** (content) — **同质化商品，红海。** 只有作为套件的
  发布层来构建才有价值，绝不能作为独立产品。**必须做好：各渠道的帖子变体**
  （一个日历，N 种渠道形态）— 这是唯一非同质化的部分。
- **analytics** (dashboard) — **除非实现跨渠道，否则就是同质化商品。** 给单一渠道换皮
  毫无价值。**必须做好：标准化跨渠道指标 + 归因**；每个
  渠道的 API 接入应由 [[connector-builder]] 完成，而不是使用临时定制的粘合代码。

## 6. 合规（简要）

保持适度——将资金流转和消息发送的具体事项交由相关工程师/Skill 处理。

- **FTC 披露要求**——赞助内容必须明确披露（`#ad` / “赞助” / 付费合作标签）。如果产品支持发布品牌合作内容，应将披露作为交付内容的一部分进行呈现并强制执行，而不是将其设为可选开关。
- **创作者收入的 1099 表格**——创作者（及其赞助商/关联方）会产生需要申报的收入；如果产品涉及付款，应追踪收款人的税务信息，以用于 1099-NEC/1099-K（美国）。注明这一点即可；不要在 CRM 中构建税务引擎。
- **会员通信的电子邮件/短信同意**——会员公告和生命周期消息发送需要获得同意（CAN-SPAM/TCPA、双重确认订阅、拒收名单）。将送达能力和同意机制完全交由 [[lifecycle-messaging]] 处理。
- **跨平台发布的平台服务条款**——每个渠道的条款都对 API 身份验证、自动化和重复发布作出规定。跨渠道发布必须遵守各平台的速率限制和自动化规则；不要假设一个渠道允许的行为也适用于所有渠道。

## 输出

应用后，在架构文档中补充一则**领域模型**说明，其中应涵盖：范围内的产品，以及哪些属于同质化产品、哪些属于切入点（sponsorship-crm = 市场空白）；该产品拥有的上述必建模实体；如果范围包含商业化，则记录**抽成比例**决策；如果范围包含 sponsorship-crm，则记录**交易**结构（交付物 + 使用权 + 费用模式 + 付款里程碑）；如果范围包含调度器/分析功能，则记录**各渠道变体**和**标准化跨渠道**契约。