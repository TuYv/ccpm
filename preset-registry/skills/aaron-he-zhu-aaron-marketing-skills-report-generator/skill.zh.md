---
name: report-generator
slug: aaron-report-generator
displayName: "Report Generator · 报告生成"
summary: "面向干系人的营销活动报告:叙事结构、图表建议与洞察提炼"
description: 'Use when the user asks to "create a campaign report", "build an executive summary", or "deliver client results"; produces audience-tailored influencer marketing reports (executive, client, internal team) with data tables, narrative, key learnings, and recommendations. Not for raw metric computation — use performance-analyzer. 达人营销报告/结案汇报'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate after a campaign or reporting period ends and the user needs a written report for a specific stakeholder. Triggers include post-campaign wrap-ups, executive or board summaries, client-facing results decks, internal team retrospectives, and monthly or quarterly performance reports. Pick this when the inputs are already-computed metrics that need structure, narrative, and recommendations for a named audience."
argument-hint: "<campaign name> [audience: executive|client|team|board]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "report", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "report"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 报告生成器

此技能可帮助你创建专业的网红营销报告，讲述你的活动表现故事。它会根据受众调整内容和深度。

> **跨学科（付费广告）：**这也是 **paid-ads** 报告界面 — 基于 RQS 历史记录（`memory/audits/ad/`）和 measurement-loop 回读结论构建高管/客户/渠道报告。它呈现指标；不计算指标（回报计算仍在 [roi-calculator](../roi-calculator/SKILL.md) 中）。将付费投放运行保存到 `memory/ad/report-generator/` 下。

## 快速开始

最短调用：

```
Create a campaign report for [campaign name] for [audience: executive/client/team]
```

常见场景：

```
Generate an executive summary for our Q3 influencer campaigns
```

## 技能契约

- **读取**：活动名称、报告周期、目标受众、在这些角色出现时使用的不透明 `client_ref`、`preparer_ref`、`contact_ref` 和 `owner_ref` 值，以及已计算指标及其来源、窗口、目标/对照项和源工件引用。ROI/ROAS/net-return 值必须来自 [roi-calculator](../roi-calculator/SKILL.md)，表现差异/排名必须来自 [performance-analyzer](../performance-analyzer/SKILL.md)；原始花费加收入不是已计算 ROI 的交接内容。复用这些工件中的不透明 `creator_ref` 值、可选的 tracker/stage，以及现有的 Campaign Retro Card。原始客户/员工/负责人姓名、电子邮件地址和组织标签仅作为临时解析器输入。
- **写入**：默认内联返回适合受众的完成版报告。仅保留来自 `performance-analyzer` 的当前范围绑定 Campaign Retro Card；如果缺失或无效，则包含 `unknown` 占位符，而不是推导决策。只有在获得精确的 WARM 保存授权时，才将报告/卡片一起保存到 `memory/influencer/report-generator/YYYY-MM-DD-<topic>.md`。每个已保存的报告、模板字段、附录和交接都使用不透明 `client_ref`、`preparer_ref`、`contact_ref`、`owner_ref`、`creator_ref` 以及工件/来源引用，绝不使用已解析的客户/员工/负责人/创作者姓名、组织标签、联系邮箱、个人资料 URL 或提供商 ID。仅在内存中为一个明确命名受众的临时渲染解析这些引用，随后丢弃解析结果，并且绝不保存映射。任何外部发送/共享/导出都需要新的精确授权，授权中需指明报告工件/版本、接收受众、交付渠道，以及允许面向该受众使用的身份/资产引用；报告创建或 WARM 保存并不授权分发。
- **提升**：只有在获得单独的精确授权时，才将有持久证据支持的事实（已验证的最终 ROI/ROAS、已测量的表现基线和重点洞察）提升到 `memory/hot-cache.md`。Retro Card 的定性 `renew | retest | retire | unknown` 决策、理由、下一个假设和限制仍保持 WARM，且不是 creator-registry 事实。此技能不提出 creator-registry 提案：在创作者行关闭后，只有由所属工作流单独授权且有证据支持的 **actual rate**、**signed rights window/expiry** 或 **measured performance baseline** 才可被提出；是否成为规范事实仅由 [creator-registry](../../../protocol/creator-registry/SKILL.md) 决定。
- **完成条件**：
  1. 报告符合请求的受众模板（executive、client、team 或 board）。
  2. 每个指标都配有兼容的带来源日期上下文（目标、基准或上一周期），或明确标记为 `Unknown`/`NEEDS_INPUT`；报告不会编造上下文，也不会重新计算缺失的表现/回报指标。
  3. 报告以具体建议结尾，并在相关情况下包含行动项。
  4. 当当前 tracker-state 证据证明为 `measured` 或 `closed` 时，报告包会保留匹配的 performance-analyzer Retro Card，并包含精确的 campaign/creator/state/measurement/decision-rule 引用；缺失或无效的卡片会生成 `unknown` 占位符和 `NEEDS_INPUT`，绝不会新推导决策。
  5. 已保存/可复制的输出仅包含不透明 client/preparer/contact/owner/creator 引用；任何已解析标签/联系方式仅存在于面向声明受众的临时渲染中，并且没有新的受众范围精确授权时，外部分发会被阻止。
- **主要下一个技能**：[content-quality-auditor](../../../seo-geo/tune/content-quality-auditor/SKILL.md)

### 交接摘要

> 按照 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中的标准结构输出。

## 数据来源

此系列提供 Tier 1：不需要实时集成。向其提供已计算完成、带有来源标签的活动指标，它就会生成报告。如果只提供了原始观察数据，请先将指标分析路由到 `performance-analyzer`；如果只提供了支出/收入/LTV 输入，请先将回报计算路由到 `roi-calculator`，然后再生成报告。

可在可用时预填数据的可选连接器：

- `~~social platform analytics` — 每条帖子的覆盖人数、展示次数、互动、视频观看量
- `~~influencer database` — 创作者账号、层级、费用、受众人口统计
- `~~analytics` — 链接点击、转化、归因收入
- `~~CRM` — 新客户数量和下游收入

如果没有这些连接器，技能会要求提供现有的已计算产物/指标。它可以返回部分报告框架，但任何缺失依赖项的结论都保持为 `Unknown`/`NEEDS_INPUT`；它不会在这里计算 ROI/ROAS、排名、归因或因果驱动因素。请参阅 [CONNECTORS.md](../../../CONNECTORS.md)，了解各类别的免费/无需密钥数据方案。

## 指令

当用户请求报告时：

1. **确定报告参数** — 设置报告类型（post-campaign/monthly/quarterly/annual）、活动、周期、一个明确的受众、适用时的不透明 `client_ref`/`preparer_ref`/`contact_ref`/`owner_ref` 值，以及存在时提供的 tracker 阶段。根据受众匹配深度：高管需要高层级的 ROI 和策略；客户需要结果和价值；团队需要详细经验和优化；董事会需要业务影响。任何原始身份/联系定位信息都只保持临时状态。请参阅 [report-templates.md](references/report-templates.md) 中的受众需求矩阵。

2. **选择受众模板并填充** — 完整的高管、客户和内部团队模板位于 [report-templates.md](references/report-templates.md)。仅从 `performance-analyzer` 输出中提取绩效指标/差值，仅从 `roi-calculator` 输出中提取财务比率。如果缺少所需的已计算产物，返回部分框架加 `NEEDS_INPUT` 和确切交接内容；不要根据原始数字重新计算。为每个指标配上兼容的、带来源日期的上下文，或将比较标记为待处理。

3. **应用可视化和写作指导** — 根据每个数据点和每类受众选择合适的图表，并遵循以结果开篇的叙事弧线。请参阅 [report-templates.md](references/report-templates.md) 中的可视化建议和写作最佳实践。

4. **以建议和行动项收尾** — 每份报告都以具体的下一步结束；对于团队和董事会受众，添加包含不透明 `owner_ref`/截止日期的行动项表。

5. **表示已测量周期而不重新决策** — 仅当来自 `performance-analyzer` 的现有 Campaign Retro Card 明确绑定相同的 `campaign_id`、不透明 `creator_ref`、当前非分叉的已测量/已关闭 tracker-state ref、锁定的 measurement contract，以及预先承诺的 decision-rule ref 时，才保留它。绝不要在此报告技能中推导或更改决策。如果卡片缺失、不匹配或已过期，则输出一个已绑定的 `decision: unknown` 占位符，并为 `performance-analyzer` 产物添加 `NEEDS_INPUT`。除非用户要求，否则不要将该卡片放入面向客户/董事会的文案中。

6. **返回，然后提供持久化或分发选项** — 返回仅含 ref 的报告以及任何内联的 Retro Card。提供 `memory/influencer/report-generator/YYYY-MM-DD-<topic>.md`（或付费运行使用 `memory/ad/report-generator/`）以获取精确的 WARM 保存授权；保存的产物会保持 `client_ref`、`preparer_ref`、`contact_ref` 和 `owner_ref` 未解析。如果用户请求面向受众的人类可读副本，仅在内存中为该一个明确受众解析已批准的 refs，并在渲染后丢弃映射。在任何外部发送/分享/导出之前，要求新的精确授权，命名确切的报告产物/版本、接收受众、交付渠道以及允许的身份/资产 refs；绝不要从报告生成、临时渲染或 WARM 保存中推断分发权限。在将任何符合条件的持久事实提升到 `memory/hot-cache.md` 之前，请求单独授权。在授权保存后，提供移交给 [campaign-planner](../../target/campaign-planner/SKILL.md)，以将保存的产物引用追加到相关 tracker 行的 `evidence_refs`；该 tracker 编辑需要新的、限定路径和操作范围的精确 WARM 授权，且此技能既不编辑 tracker，也不推进其 `stage`。

7. **提供但不启动下一周期评估** — 如果用户想选择下一批 roster，提供明确移交给 [fit-scorer](../../scout/fit-scorer/SKILL.md)，并附上 Retro Card 中引用的证据和 `next_campaign_hypothesis`。不要自动调用它，也不要从定性的 Retro 决策中翻译、发明或延续 STAR/SQS verdict。

## 示例

**User**: "Create an executive report for Holiday Campaign 2024. `roi-ref-01` already reports $50K spend, $165K attributed revenue, 230% arithmetic ROI and 3.3:1 ROAS on its declared verified basis. `performance-ref-01` reports 3.5M reach across 15 opaque creator refs and calculated target deltas. The preregistered targets were $100K attributed revenue, 2:1 ROAS, and 2M reach. No segmented breakdown or reallocation rule is included."

**Output**（摘录 — 完整模板见 [report-templates.md](references/report-templates.md)）：

```markdown
# Holiday Campaign 2024: Executive Summary

## Bottom Line: Campaign Exceeded the Supplied Targets ✅

**ROI: 230% (`roi-ref-01`)** | **ROAS: 3.3:1 (`roi-ref-01`)** | **Attributed Revenue: $165,000**

Metric status: financial values and their calculation/provenance come from `roi-ref-01`; reach and target deltas come from `performance-ref-01`. This report formats those outputs and performs no return or attribution recomputation. No incremental-revenue claim is made.

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Attributed revenue | $100K | $165K | ✅ +65% |
| ROAS | 2:1 | 3.3:1 | ✅ +65% |
| Reach | 2M | 3.5M | ✅ +75% |

### Recommendation

The supplied overall figures clear the supplied targets. A platform, creator-tier, content-format, or budget-change recommendation is `NEEDS_INPUT` because no segmented results or decision rule was supplied; request that evidence before proposing a Q1 reallocation.
```

## 参考资料

- [report-templates.md](references/report-templates.md) — 完整的高管/客户/团队模板、可视化建议、写作最佳实践、示例
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接格式
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定
- [CONNECTORS.md](../../../CONNECTORS.md) — 按连接器类别划分的免费/免密钥数据方案
- [performance-analyzer](../performance-analyzer/SKILL.md) — 生成此报告所消耗的指标
- [roi-calculator](../roi-calculator/SKILL.md) — 提供 ROI/ROAS 数据
- [campaign-planner](../../target/campaign-planner/SKILL.md) — 用于对比结果的原始计划
- [content-amplifier](../../activate/content-amplifier/SKILL.md) — 要报告的放大结果
- [content-quality-auditor](../../../seo-geo/tune/content-quality-auditor/SKILL.md) — 报告本身的质量门禁

## 下一个最佳 Skill

**主要**：[content-quality-auditor](../../../seo-geo/tune/content-quality-auditor/SKILL.md) — 在完成的报告发送给利益相关者之前，通过发布就绪门禁运行它。

**替代项（同一报告阶段 / 影响者家族）**：

- [performance-analyzer](../performance-analyzer/SKILL.md) — 如果报告暴露出数据缺口，请在重新报告前重新分析。
- [roi-calculator](../roi-calculator/SKILL.md) — 如果财务输入发生变化，请重新计算回报数据。

**终止说明**（visited-set）：如果推荐的 skill 已在本次会话中被调用过，则停止并报告链路已完成，而不是重新运行它。遵守最大链路深度 3 跳，以避免循环。