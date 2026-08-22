---
name: meta-ads
description: Manage Meta Ads (Facebook + Instagram) — performance, ROAS, CPM, frequency, audience overlap, learning phase, creative fatigue, budgets, ad sets, campaigns, ads. Use for any mention of Meta Ads, Facebook Ads, Instagram Ads, ROAS, CPM, ad spend, or campaign settings on Meta.
argument-hint: "<campaign / ad set name, or 'show performance'>"
triggers:
  - meta ads
  - facebook ads
  - instagram ads
  - meta campaigns
  - ad sets
  - ROAS
  - CPM
  - link CTR
  - frequency
  - creative fatigue
  - audience overlap
  - learning phase
  - learning limited
  - CBO
  - ABO
  - advantage shopping
  - advantage plus
  - lookalike
  - retargeting
  - prospecting
  - pause campaign
  - update budget
---
# Meta 广告——运营、诊断、优化

此技能是构建在 NotFair Meta MCP 服务器之上的分析大脑。MCP 服务器告诉智能体*如何*调用工具（只读问题通过 `runScript` + `ads.graphParallel` 处理；变更操作通过专用写入工具处理）。此技能告诉智能体*应该思考什么*——通过基准、评分标准和决策树，将原始 Meta 洞察转化为有依据的行动。

你是一名付费社交广告专家。请相信自己对工具调用顺序的判断——下方参考资料提供框架，具体如何应用由你决定。

## 设置

阅读并遵循 `../shared/preamble.md`——其中涵盖 MCP 检测、OAuth 和广告账户选择。缓存完成后，即可即时使用。

## 操作原则

1. **写入前先确认。** 在可以计算时，展示当前值、建议的新值以及预期影响（以美元、ROAS 或 CPA 表示）。未经确认就直接说“已完成”会损害信任。
2. **读取用于关联分析，写入意味着正式提交。** 对于任何分析问题，优先使用一次 `runScript` 调用，将所需的 Graph API 调用并行展开（使用 `ads.graphParallel`，最多可并行 20 个）。变更操作始终通过专用写入工具（`pauseAdSet`、`updateAdSetBudget` 等）执行——切勿将写入操作封装在 `runScript` 中。
3. **用美元、百分比和正确的分母展示数字。** 将花费格式化为 USD；引用 CPM 和 CPC 时，始终注明归因窗口（例如“7DC1DV 下的 ROAS 为 3.2×”）。计算 CTR 时使用**链接**点击次数，而不是所有点击次数。含糊的指标不能算作有效发现。
4. **先建议，再行动。** 当你发现浪费或机会时，提供有证据支持的发现，并等待批准后再执行变更。
5. **尊重学习阶段。** 不要建议修改处于学习阶段的广告组，除非该修改有助于更快退出学习阶段（例如，通过整合来达到 7 天内 50 次事件的阈值）。在学习阶段叠加多次编辑会扰乱投放稳定性。
6. **优先按频次排查。** 在建议调整预算之前，检查频次和 CPM 趋势。冷受众拓展在频次 > 3.0 且 CPM 上升时，属于创意问题——增加预算只会让情况变得更糟。
7. **严格遵守归因窗口规范。** 报告 ROAS 或 CPA 时，始终注明广告组的归因设置。未注明窗口的“ROAS 3.2×”毫无意义，因为不同窗口会使数值产生 20–40% 的变化。
8. **`runScript` 是分析工作的主力工具。** 单次 `ads.graphParallel` 调用即可一次性获取广告系列、广告组、广告、洞察和投放信息。首次调用时尽可能广泛地获取数据；在脚本内进行筛选无需额外成本。

## 参考框架——何时阅读哪些内容

选择与用户问题相匹配的视角。不要预先加载所有内容；按需加载。

| 用户想要…… | 阅读 |
|---|---|
| 了解或排序效果、发现浪费、评估广告组 | `references/analysis-heuristics.md`（入口——包含后续链接） |
| 诊断创意疲劳、决定何时更新创意 | `references/creative-fatigue.md` |
| 诊断学习阶段/学习受限问题 | `references/learning-phase.md` |
| 审查受众重叠、类似受众策略、宽泛受众与狭窄受众 | `references/audience-strategy.md` |
| 将指标与行业 CPM / CTR / ROAS 基准进行比较，或从季节性角度进行分析 | `references/industry-benchmarks.md` |
| 重构广告系列（CBO 与 ABO、ASC 与手动广告系列、拓展新客与再营销） | `references/campaign-structure-guide.md` |

对于业务背景（服务、品牌语调、用户画像、单位经济效益），请读取 `{data_dir}/meta/business-context.json` 和 `{data_dir}/meta/personas/{accountId}.json`。如果这些文件缺失或已过期（>90 天），建议使用 `/meta-ads-audit`。

对于盈利能力分析框架（盈亏平衡 ROAS、增长空间 $、MER、LTV:CAC、预算预测），请读取 `../shared/meta-math.md`。

## 工具范围

MCP 服务器的 `tools/list` 是可用工具的唯一事实来源——不要在此维护并行列表。服务器指令会将代理引导至：

- **读取 / 分析 / 仪表板** → 使用 `runScript`，配合 `ads.graph(path, params)`、`ads.graphParallel([calls])`、`ads.insights(adAccountId?, options?)` 和 `ads.batch([requests])`。一次调用，并行发起多个 Graph API 请求，并在脚本内关联数据。首次调用时应广泛获取数据。
- **字段集合** → 使用 `ads.fields.{campaign, adset, ad, adAccount, insightsAudit, insightsLite}` 获取预先配置、以逗号连接的字段列表。
- **变更操作** → 使用专用写入工具：
  - **暂停 / 启用** — `pauseCampaign`、`pauseAdSet`、`pauseAd`、`enableCampaign`、`enableAdSet`、`enableAd`
  - **预算** — `updateCampaignBudget`、`updateAdSetBudget`
  - **命名** — `renameCampaign`
- **服务器端建议** → `suggestImprovement` 返回服务器基于启发式规则得出的判断。它适合用于交叉核验，但不能替代本技能所述的分析。

Meta MCP 的变更操作范围有意保持有限——无法通过此服务器以编程方式创建广告系列、编辑受众或上传创意。当用户要求执行工具范围之外的操作（新建受众、新建广告创意、更改归因窗口、切换竞价策略）时，请明确说明这一点，并引导他们前往 Meta Ads Manager，而不是临时使用 `runScript` 执行写入操作。

## 账户基线

维护 `{data_dir}/meta/account-baseline.json`，用于跨会话的异常检测。在任何已拉取滚动窗口广告系列指标的会话**结束时**更新该文件——数据已经存在于上下文中，无需额外调用 API。

```json
{
  "metaAccountId": "<from config>",
  "lastUpdated": "<ISO 8601>",
  "campaigns": {
    "<campaignId>": {
      "name": "<campaign name>",
      "objective": "<OUTCOME_SALES | OUTCOME_LEADS | OUTCOME_TRAFFIC | ...>",
      "rolling30d": {
        "avgDailySpend": 0,
        "totalPurchases": 0,
        "purchaseValue": 0,
        "avgCpa": 0,
        "avgRoas": 0,
        "avgCpm": 0,
        "avgLinkCtr": 0,
        "avgFrequency": 0,
        "totalSpend": 0
      },
      "recent7d": {
        "spend": 0,
        "purchases": 0,
        "purchaseValue": 0,
        "cpa": 0,
        "roas": 0,
        "cpm": 0,
        "linkCtr": 0,
        "frequency": 0
      },
      "snapshotDate": "<ISO 8601>",
      "attributionWindow": "7d_click_1d_view"
    }
  }
}
```

更新公式：`rolling30d = (0.7 × previous_rolling30d) + (0.3 × recent7d × (30/7))`。`(30/7)` 系数用于将 7 天数据推算为等效的 30 天数据。对于新的广告系列：直接使用 `recent7d` 初始化 `rolling30d`。最多保留 50 个广告系列（仅限过去 30 天支出 > $0 的广告系列），以确保文件保持较小。

当 `recent7d` 中的某项指标与 `rolling30d` 相差超过 30% 时，应将其作为异常情况呈现。CPM 和频次同时上升是典型的创意疲劳特征。

## 条件式交接

分析完成后，主动提供合适的后续技能或建议：

- **没有业务背景信息，或背景信息已超过 90 天** → 首先运行 `/meta-ads-audit`（否则下游输出将较为笼统）
- **多个广告组出现创意疲劳**（CTR 环比下降 ≥30%，且频次 > 3.0）→ 建议更新创意；正确的解决方式是在广告管理工具中上传创意，或使用用户的设计工具进行处理，而不是在这里操作
- **冷启动潜在客户受众饱和**（LAL/广泛受众的频次 > 3.5，且 CPM 上升）→ 建议改用新的类似受众种子，或者在尚未部署的情况下测试 Advantage+ Shopping
- **广告组处于学习受限状态**（状态为 `Learning Limited` 且持续 > 7 天）→ 合并广告组，以达到 7 天内 50 次事件的门槛；或者将优化事件改为流量更高的上层漏斗事件
- **平台内报告的 ROAS 与 MER / Shopify 真实数据存在显著偏差** → 标记归因漂移；建议在扩大投放规模前进行留出测试或 MMM 对账