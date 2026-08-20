---
name: landing-optimizer
slug: landing-optimizer
displayName: "Landing Optimizer · 落地页优化"
summary: "流量落地页转化优化:信息匹配、首屏、CTA 与信任要素"
description: 'Use when the user asks to "optimize our landing page for influencer traffic", "fix our promo-code landing page", or "improve conversion from a creator campaign"; produces a message-match audit, page-structure and social-proof recommendations, a promo-code/CTA conversion plan, and an A/B test roadmap. Not for measuring campaign results after launch — use performance-analyzer. 落地页优化/达人流量转化提升'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate when the user wants to build or improve a landing page that receives influencer-driven traffic: message match between creator content and the page, dedicated creator pages, promo-code auto-apply, social-proof placement, mobile conversion fixes, friction reduction, or A/B test planning for influencer campaigns."
argument-hint: "<landing page URL or campaign> [influencer handle] [promo code]"
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "influencer", "phase": "report", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "report"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 落地页优化器

此技能可帮助你专门针对网红营销流量创建和优化落地页。当用户从网红发布的内容点击进入时，落地页体验应与原内容保持连贯，并针对转化进行优化。

> **跨领域（付费广告）：**这也是**付费广告**的点击后技能——即 ROAS **Offer** 信息匹配中的页面部分（它与负责广告部分的 [ad-creative-builder](../../../ad/orchestrate/ad-creative-builder/SKILL.md) 配合使用）。同样的诊断和修复流程也适用于付费广告落地页；请将付费广告运行记录保存在 `memory/ad/landing-optimizer/` 下。对于付费广告运行，如果存在 [offer-claims-registry](../../../protocol/offer-claims-registry/SKILL.md) 台账，请据此进行页面信息匹配：根据 `memory/claims/offers.md` 核对优惠条款、促销代码和日期，并根据 `memory/claims/claims-ledger.md` 中已批准的变体核对声明措辞。

## 快速开始

最简调用方式：

```
Optimize our landing page for traffic from [influencer campaign]
```

常见场景——诊断并修复转化率较低的创作者页面：

```
Our influencer landing page has [X%] conversion rate. How can we improve it?
```

## 技能契约

- **读取**：落地页 URL 和当前状态、转化率和目标、流量来源（网红账号、平台、内容类型）、网红的关键信息/引语、促销代码、受众人口统计特征。如果没有连接工具，则由用户提供输入。
- **写入**：将优化计划保存到 `memory/influencer/landing-optimizer/YYYY-MM-DD-<topic>.md`（信息匹配审计、页面结构和社会认同建议、转化/CTA 计划、A/B 测试路线图）。
- **提升**：将长期有效的事实——当前活动名称、页面 URL、基准转化率、促销代码、主要创作者——提升至 `memory/hot-cache.md`。
- **完成条件**：
  - 已为页面生成信息匹配评分和具体修复项。
  - 已制定按优先级排序的转化计划（CTA、促销代码体验、阻碍因素、移动端），并包含预期影响。
  - 已编写 A/B 测试路线图，其中至少包含一个假设和成功指标。
- **主要后续技能**：[performance-analyzer](../performance-analyzer/SKILL.md)——衡量这些优化是否提升了转化率。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 数据源

此系列技能不需要实时集成（第 1 层）。此技能通过向用户询问页面 URL、当前转化率、网红传达的信息和促销代码，然后根据这些输入生成审计结果和计划。

可用时，以下可选连接器能够深化分析：

- `~~analytics`——提取实时转化率、跳出率、滚动深度和加入购物车事件，而不是询问用户。
- `~~A/B testing platform`——读取以往测试结果，并提供样本量/持续时间估算。
- `~~CMS / landing page builder`——直接检查当前页面结构和文案。
- `~~social platform analytics`——确认创作者实际传达的信息及其受众。

请参阅 [CONNECTORS.md](../../../CONNECTORS.md)，了解各类别中经过验证的免费/免密钥方案。每一步都可以平滑降级为由用户提供输入。

## 说明

当用户请求落地页方面的帮助时，请按照以下步骤操作。每一步的填空模板、ASCII 布局和 HTML 代码片段均位于 [references/templates.md](references/templates.md) 中，并使用相同的步骤编号进行索引。

1. **评估当前状态** — 记录营销活动、URL、流量来源、当前转化率、目标，以及流量背景（网红、平台、内容类型、核心信息、促销代码、受众）。
2. **评估信息匹配度** — 从信息、价值主张、优惠、产品和语气等方面，对比网红所说的内容与页面展示的内容；给出信息匹配度评分（X/10）和明确的修复建议。不匹配会导致困惑和用户流失。对于付费投放，如果存在记录台账，还要根据 `memory/claims/offers.md` 验证页面的优惠/促销条款——只有当优惠记录仍然有效时，广告中“立减 50%”的承诺才是真实的。
3. **页面结构** — 推荐适用于网红流量的布局（首屏 → 社会认同 → 产品 → 更多认同证明 → 常见问题 → 最终行动号召），并逐版块给出首屏/社会认同/产品方面的修复建议。
4. **整合社会认同** — 将引流创作者放在最显眼的位置，然后按照以下认同证明层级排列：其他网红 → 客户评价 → 信任标识。
5. **转化优化** — 优化行动号召文案和位置，设计促销代码体验（通过 URL 参数自动应用、醒目展示、确认提示），减少操作阻力，并检查移动端体验（加载速度、便于拇指操作的行动号召、滚动深度）。
6. **A/B 测试计划** — 根据影响和投入对测试进行排序，然后至少编写一个假设，并包含变体、样本量、持续时间和成功指标。
7. **网红专属页面** — 判断是否值得创建专用的 `/creator-name` 页面，以及应个性化哪些内容。
8. **效果跟踪** — 为加载时间、跳出率、转化率、加入购物车率和平均订单价值设定目标；定义用于归因的 UTM 参数和事件。

将完成的计划保存到 `memory/influencer/landing-optimizer/YYYY-MM-DD-<topic>.md`（付费投放保存到 `memory/ad/landing-optimizer/`），并将长期有效的信息提升至 `memory/hot-cache.md`。

## 示例

**用户**：“我们为 @fitnessanna 的蛋白粉营销活动制作的落地页转化率为 1.2%。该如何改进？”

**输出**（节选——完整版本请参阅 [references/templates.md](references/templates.md)）：

- **诊断**：转化率为 1.2%，低于网红流量 2-3% 的基准。
- **问题**：信息不匹配（Anna 强调“口感顺滑”，但页面首先突出“高蛋白”）；未展示 Anna 的内容；促销代码 `ANNA20` 未自动应用；移动端行动号召位于首屏以下。
- **优先修复项**：在首屏展示 Anna 的视频（+0.5%）、自动应用促销优惠（+0.3%）、匹配标题信息（+0.3%）、将移动端行动号召置于首屏（+0.2%）→ 转化率合计从 1.2% 提升至 2.5%。
- **测试计划**：第 1 周修改首屏，第 2 周进行标题 A/B 测试，第 3 周测试行动号召文案。

## 参考资料

- [templates.md](references/templates.md) — 所有步骤的填空模板、ASCII 布局、HTML 代码片段、完整示例和提示。

- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接摘要格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 按连接器类别划分的免费且无需密钥的数据方案。
- [conversion-quality.md](../../../references/scoring-rubrics/conversion-quality.md) — 用于对优化计划进行合理性检查的建议性转化评分标准（不具否决作用）。
- 网红营销系列中的同级技能：
  - [content-amplifier](../../activate/content-amplifier/SKILL.md) — 为落地页获取创作者内容并为其引流。
  - [brief-generator](../../target/brief-generator/SKILL.md) — 使创作者内容与落地页目标保持一致。

## 下一最佳技能

**首选**：[performance-analyzer](../performance-analyzer/SKILL.md) — 衡量优化是否确实改善了转化率、AOV 和归因。

**备选**（同属报告系列）：

- [content-amplifier](../../activate/content-amplifier/SKILL.md) — 当审计结果表明页面需要展示更多创作者内容时。
- [roi-calculator](../roi-calculator/SKILL.md) — 当页面转化效果已得到验证，并且你希望将其转化为 ROI 和回本周期计算时。

**终止说明**：在本次会话中维护一个已访问集合。如果推荐的技能已被调用，则停止并报告该链已完成，而不是再次运行该技能。链深度达到 3 时强制停止，以避免循环。