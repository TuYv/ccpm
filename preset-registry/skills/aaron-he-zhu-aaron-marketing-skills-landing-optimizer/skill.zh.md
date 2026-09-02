---
name: landing-optimizer
slug: landing-optimizer
displayName: "Landing Optimizer · 落地页优化"
summary: "流量落地页转化优化:信息匹配、首屏、CTA 与信任要素"
description: 'Use when the user asks to "optimize our landing page for influencer traffic", "fix our promo-code landing page", or "improve conversion from a creator campaign"; produces a message-match audit, page-structure and social-proof recommendations, a promo-code/CTA conversion plan, and an A/B test roadmap. Not for measuring campaign results after launch — use performance-analyzer. 落地页优化/达人流量转化提升'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate when the user wants to build or improve a landing page that receives influencer-driven traffic: message match between creator content and the page, dedicated creator pages, promo-code auto-apply, social-proof placement, mobile conversion fixes, friction reduction, or A/B test planning for influencer campaigns."
argument-hint: "<landing page URL or campaign> [influencer handle] [promo code]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "report", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "report"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 落地页优化器

此技能可帮助你专门针对网红营销流量创建和优化落地页。当用户从网红发布的内容点击进入时，落地体验应当保持关联性，并针对转化进行优化。

> **跨学科（付费广告）：** 这同时也是**付费广告**的点击后技能，即 ROAS **Offer** 消息匹配中的页面部分（它与 [ad-creative-builder](../../../ad/orchestrate/ad-creative-builder/SKILL.md) 配合使用，后者负责广告部分）。同样的诊断与修复流程适用于付费落地页；将付费运行结果保存到 `memory/ad/landing-optimizer/`。对于付费运行，如果存在 [offer-claims-registry](../../../protocol/offer-claims-registry/SKILL.md) 台账，则根据其进行页面消息匹配：将优惠条款、促销代码和日期与 `memory/claims/offers.md` 对照，将声明措辞与 `memory/claims/claims-ledger.md` 中已批准的变体对照。

## 快速开始

最简调用方式：

```
Optimize our landing page for traffic from [influencer campaign]
```

常见场景：诊断并修复转化率较低的创作者页面：

```
Our influencer landing page has [X%] conversion rate. How can we improve it?
```

## 技能契约

- **读取**：临时落地页定位信息，以及不透明的 `page_ref`/快照引用和当前状态、转化率与目标、流量来源、稳定的不透明 `creator_ref`、平台/内容类型，以及任何拟议使用的创作者显示名称、消息、引语、资产、嵌入内容或截图。当复用创作者内容时，还必须读取准确冻结的 `approved_asset_ref` 以及创作者内容审核器的 `approval_ref`，并读取一条权利记录；该记录必须处于 `active` 状态、带有日期/证据、未过期，并明确限定渠道、地域、格式、时长以及付费与自然流量使用范围。当未连接任何工具时，输入来自用户。
- **写入**：默认以内联方式返回优化计划；只有在获得确切的 WARM-save 授权后，才将其保存到 `memory/influencer/landing-optimizer/YYYY-MM-DD-<topic>.md`（或声明的付费路径）。保存的产物和交接内容仅保留 `creator_ref`、`page_ref`、`snapshot_ref`、冻结的资产/批准引用，以及不透明的权利/证据引用，不得包含原始创作者账号/姓名、个人资料/内容/页面 URL、电子邮件、提供商 ID 或嵌入的创作者媒体。
- **提升**：只有在获得单独的确切授权后，才能将持久性事实提升至 `memory/hot-cache.md`，包括有效的活动引用、不透明的页面引用、基线转化率、促销代码引用和主要 `creator_ref`。
- **完成条件**：
  - 已为页面生成消息匹配评分和明确列出的修复项。
  - 已形成按优先级排序的转化计划（CTA、促销代码体验、摩擦点、移动端），并为影响标注证据，或标记为 `Unknown/NEEDS_INPUT`。
  - 已编写 A/B 测试路线图，其中至少包含一个假设和一个成功指标。
  - 每个拟议复用的创作者姓名/引语/资产/嵌入内容/截图，都必须有准确冻结的审核器批准，以及一条覆盖整个实施/测试时长的、带日期且范围明确的有效权利记录；被阻止的复用仍标记为 `NEEDS_INPUT`，不得复制或测试。
- **主要后续技能**：[performance-analyzer](../performance-analyzer/SKILL.md) —— 衡量优化是否推动了转化。

### 交接摘要

> Emit the standard shape from [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md).

## 数据来源

此系列无需实时集成（Tier 1）。该技能基于临时页面定位器、当前转化数据、不透明的创作者/页面/证据引用、已批准的消息，以及用户提供的权利输入运行。简报、草稿、公开帖子或合同标签，均不能替代经过创作者内容审计员确切冻结的批准，以及当前适用范围内的权利证据。

可用时，可选连接器能够深化分析：

- `~~analytics` — 拉取实时转化率、跳出率、滚动深度和加入购物车事件，而不是询问用户。
- `~~A/B testing platform` — 读取过往测试结果，并提供样本量/持续时间估算。
- `~~CMS / landing page builder` — 检查当前页面结构并直接查看文案。
- `~~social platform analytics` — 确认创作者的实际消息和受众。

请参阅 [CONNECTORS.md](../../../CONNECTORS.md)，了解每个类别经过验证的免费/无需密钥方案。每个步骤都能优雅地降级为使用用户提供的输入。

## 指令

当用户请求落地页帮助时，按以下步骤执行。每个步骤的填充模板、ASCII 布局和 HTML 片段位于 [references/templates.md](references/templates.md) 中，并使用相同的步骤编号作为索引。

**创作者复用门禁**：在复制、提议、发布或测试任何创作者显示名称、引述、主张摘录、视频、图片、缩略图、嵌入内容、截图、徽章、推荐语、创作者专属路径或创作者关联的跟踪令牌之前，必须针对该确切复用满足以下全部条件：稳定的不透明 `creator_ref`；确切冻结的 `approved_asset_ref`；与该版本匹配且状态为已批准的 [creator-content-auditor](../../activate/creator-content-auditor/SKILL.md) `approval_ref`；权利状态为 `active`；`status_observed_at`；不透明的 `status_evidence_ref`；未过期的开始/结束时间或永久期限；以及与页面及其整个拟议实验/投放相匹配的明确渠道、地域、格式、期限和 `paid | organic | both` 范围。在拟议复用中，如果任何字段缺失、过期、不处于活动状态、在测试期间失效、存在争议、已撤销、未知或超出范围，则对该复用返回 `NEEDS_INPUT`，并且不得复制名称/引述、嵌入或截图该素材、发布变体或开始测试。你仍可使用不透明的快照引用审计非创作者页面元素，并提出通用占位符。

1. **评估当前状态** — 记录 campaign ref、临时页面定位器以及不透明的页面/快照引用、流量来源、当前转化率、目标和流量上下文（`creator_ref`、平台、内容类型、已批准的消息引用、促销代码引用、受众）。保持原始定位器为临时数据。
2. **评估消息匹配度** — 仅将通过复用门禁审核的创作者消息，与提供的页面快照进行比较，比较消息、价值主张、优惠、产品和语气；生成消息匹配度评分（X/10）并列出明确命名的修复项。如果缺少冻结批准或权利记录，则将创作者侧保持为 `Unknown`，返回 `NEEDS_INPUT`，并且不得将其引述或释义到页面文案中。对于付费投放，还要在账本存在时，根据 `memory/claims/offers.md` 核验页面的优惠/促销条款 — 广告中的“50% off”承诺只有在优惠记录处于有效状态期间才为真。
3. **页面结构** — 推荐适用于影响者流量的布局（首屏 → 社会证明 → 产品 → 更多证明 → 常见问题 → 最终 CTA），并逐区块给出修复项。任何创作者专属位置在复用门禁通过前都必须保留为不透明占位符。
4. **社会证明整合** — 仅当确切冻结的批准及权利范围通过时，才可使用创作者姓名、引述、素材、嵌入内容、截图、徽章或推荐语；否则将其省略并返回 `NEEDS_INPUT`。对每位额外创作者分别应用相同的门禁。
5. **转化优化** — 调整 CTA 文案/位置，设计促销代码体验（通过 URL 参数自动应用、醒目展示、确认状态），减少摩擦，并检查移动端体验（加载速度、适合拇指操作的 CTA、滚动深度）。
6. **A/B 测试计划** — 按影响/工作量对支持的测试进行排序，然后至少编写一个包含假设、变体、样本量、持续时间和成功指标的方案。如果批准的权利期限未覆盖整个计划测试期及其后续发布期，则不得包含或开始创作者姓名/素材/引述变体。
7. **影响者专属页面** — 判断是否需要专属创作者页面。路径或页面中的创作者姓名、创作者关联的跟踪令牌，以及每个个性化素材，都需要通过复用门禁；否则使用通用 campaign 页面和不透明的 tracking ref。
8. **性能跟踪** — 为加载时间、跳出率、CR、加入购物车和 AOV 设定目标；定义用于归因的 UTM 参数和事件。

请直接内联返回完成的计划。提供 `memory/influencer/landing-optimizer/YYYY-MM-DD-<topic>.md`（付费运行则使用 `memory/ad/landing-optimizer/`），以获得精确的 WARM 保存授权，并单独询问是否进行 HOT 推广。在保存/交接之前，将原始创作者身份、媒体/页面/个人资料 URL 以及复制的创作者文本替换为不透明引用；持久化的计划不得直接解析任何内容。

## 示例

**用户**：“我们有日期明确的分析导出数据，显示 CR 为 1.2%，低于来源日期明确的 2–3% 目标。使用 `creator_ref: creator-042`、`approved_asset_ref: asset-v7`，以及其冻结的 creator-content-auditor `approval_ref`。提供的权利记录处于有效状态，今天已通过不透明证据引用完成观测，并覆盖完整六周测试/投放期间美国网站落地页展示已批准的名称、确切引文、视频嵌入和截图格式，适用于付费和自然流量。已批准的素材写着 ‘smooth texture’；页面快照以 ‘high protein’ 为首要信息，未包含视频，不会自动应用促销优惠，并且将移动端 CTA 放置在首屏以下。制定一个计划。”

**输出**（节选，完整版本见 [references/templates.md](references/templates.md)）：

- **诊断**：CR 为 1.2%，低于所提供的网红流量 2–3% 目标。
- **问题**：信息不匹配（冻结的已批准素材写着 “smooth texture”，而页面快照以 “high protein” 为首要信息）；已批准的创作者素材缺失；促销优惠未自动应用；移动端 CTA 位于首屏以下。
- **优先修复项**：在当前有效且范围明确的权利许可内，在首屏中测试完整、冻结且已批准的视频，自动应用促销优惠，使标题与已批准措辞保持一致，并将移动端 CTA 移至首屏以上。在预先声明的 A/B 测试达到决策规则之前，任何提升均为 Unknown；不要将孤立的提升估算加入承诺的 CR 中。
- **测试计划**：第 1 周进行首屏修改，第 2 周进行标题 A/B 测试，第 3 周测试 CTA 文案。

## 参考资料

- [templates.md](references/templates.md) — 所有步骤填写模板、ASCII 布局、HTML 片段、完整演示示例和提示。

- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和 Handoff Summary 格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各连接器类别的免费/无密钥数据方案。
- [conversion-quality.md](../../../references/scoring-rubrics/conversion-quality.md) — 转化评分类目（仅供建议，不构成否决），用于检查优化计划的合理性。
- influencer-marketing 系列中的同级技能：
  - [content-amplifier](../../activate/content-amplifier/SKILL.md) — 为落地页获取创作者内容，并为其引流。
  - [brief-generator](../../target/brief-generator/SKILL.md) — 使创作者内容与落地页目标保持一致。

## 下一项最佳技能

**主要技能**：[performance-analyzer](../performance-analyzer/SKILL.md) — 衡量优化是否真正推动了转化、AOV 和归因。

**备选技能**（同属 Report 系列）：

- [content-amplifier](../../activate/content-amplifier/SKILL.md) — 当审计显示页面需要更多创作者内容来进行展示时。
- [roi-calculator](../roi-calculator/SKILL.md) — 当页面的转化效果已得到验证，并且你希望将其转化为 ROI 和回本周期计算时。

**终止说明**：在本次会话中维护一个已访问集合。如果某个推荐的 skill 已经被调用，则停止并报告链条已完成，而不是再次运行它。链条深度达到 3 时强制停止，以避免循环。