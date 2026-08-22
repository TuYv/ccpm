---
name: google-ads-landing
description: Score and diagnose Google Ads landing pages. Use when asked to audit a landing page, check landing page quality, diagnose high-CTR but low-conversion-rate ad groups, improve Quality Score's Landing Page Experience component, or compare an ad group's messaging against its landing page. Trigger on "landing page audit", "landing page score", "landing page quality", "why is my conversion rate low", "LPX", "landing page experience", "ad to page match", or when `/google-ads-audit` surfaces a high-CTR / low-CVR ad group.
argument-hint: "<landing page URL or ad group name>"
---
## 设置

阅读并遵循 `../shared/preamble.md`（MCP 检测、账号选择）和 `../shared/analysis-principles.md`（证据要求、防护规则）。两者适用于本技能的整个执行过程——下文的每个维度都是测量结果，而非主观意见。

# 着陆页评分与诊断

Google Ads 广告系列失败在着陆页上的频率比失败在竞价环节更高。一个优秀的 RSA 如果将流量导向加载缓慢、重点不明确或与广告不匹配的页面，会造成两次预算浪费——第一次发生在点击时，第二次发生在转化流失时。本技能会从 **5 个加权维度**对着陆页进行评分，并给出具体的修复建议。

只对实际承接广告流量的页面进行评分。不要对随机的营销页面进行评分。在用户直接请求、由 `/google-ads-audit` 自动移交（高 CTR / 低 CVR 的广告组）、QS 诊断标记“Landing Page Experience: Below Average”时，或在 `/google-ads-copy` 为一个尚未经过验证的页面撰写新文案之前进行预检时，运行本技能。

当问题涉及广告与页面的匹配度、高 CTR / 低 CVR、LPX，或同时测试广告和着陆页时，请在评分前阅读 `references/message-chain-testing.md`。它能让诊断聚焦于付费搜索的信息链，避免偏离为通用的网站设计审计。

## 参考资料

- `references/scoring-rubric.md` — 包含 5 个维度的加权评分标准、阈值和证据字段。评分前阅读。
- `references/message-chain-testing.md` — 查询 → 广告 → 页面信息链诊断，以及广告与着陆页的测试设计。
- `../manage/references/quality-score-framework.md` — 仅当用户明确的目标是提升 QS 时使用。

## 阶段 1：确定目标页面

确定需要对哪些 URL 进行评分。按以下优先级处理：

1. **用户提供了 URL** — 对该页面进行评分，跳过发现流程。
2. **用户提供了广告组或广告系列名称** — 使用 `runScript` 对 `ad_group_ad` 执行按该广告组筛选的 GAQL 查询；提取唯一的 `final_urls`。进行标准化处理（移除跟踪参数，保留会影响路由的路径和查询参数）。
3. **由 `/google-ads-audit` 自动移交** — 移交内容会包含被标记的具体广告组。以相同方式提取其最终到达网址。
4. **未提供参数** — 使用 `runScript` 在整个账号中执行 `ad_group_ad` 查询，按照过去 30 天的花费对最终到达网址进行排名，提出排名前 3 的网址，并请用户确认。

**彻底去重。** 许多广告会指向同一个最终到达网址——对每个唯一 URL 仅评分一次，然后将结果映射回使用该 URL 的每个广告组。

## 阶段 2：收集信号（并行）

在一次工具调用轮次中完成以下所有操作：

1. **使用 WebFetch 获取着陆页** — 采集可见的标题、副标题、主要 CTA 文本、表单字段、信任信号和正文文案语气。采集完整 HTML，以便识别脚本膨胀和首屏内容。
2. **调用 PageSpeed Insights API** — 通过 WebFetch 请求 `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`。单 URL 查询无需 API 密钥。从 `lighthouseResult.audits` 中提取 LCP、CLS、INP、TTI、性能得分以及排名前 3 的优化机会。
3. **提取引流广告文案和广告组的转化指标** — 使用一次 `runScript` 调用，通过 `ads.gaqlParallel` 查询 `ad_group_ad`（获取标题和描述文本——作为信息匹配基准）以及 `ad_group` 或 `keyword_view`（获取点击次数、转化次数和 CVR——用于为金额影响估算提供依据）。一次调用即可涵盖两者。
4. **读取 `{data_dir}/business-context.json`** — 获取品牌语调、差异化优势、优惠和目标受众信息。如果文件缺失，请先引导用户使用 `/google-ads-audit`。不要猜测业务信息。

如果任何单次调用失败，继续执行——在报告中注明数据缺口，而不是让流程阻塞。PageSpeed Insights 可能会触发速率限制；如果发生这种情况，则回退到手动计时注释（"PSI unavailable — could not score Page Speed"），并降低最终报告的置信度，而不是跳过该维度。

## 阶段 3：为页面评分

阅读 `references/scoring-rubric.md`，根据证据为每个维度给出 0-100 的分数。各维度分数是实际测量结果（PageSpeed Insights 数值、逐字文案对比、表单字段数量等）——它们不是人为设定的评级，而是观测结果。

计算加权综合分，但仅将其作为下方美元收益提升公式的**内部参考数值**。不要将其呈现为字母等级。用户看到的是各维度的测量结果和预估美元收益提升——综合分只是底层计算参数。

```
internal_composite = 0.25 * Message Match
                   + 0.25 * Page Speed
                   + 0.20 * Mobile Experience
                   + 0.15 * Trust Signals
                   + 0.15 * Form & CTA
```

**美元收益提升是重点。**如果 `business-context.json.unit_economics` 中包含 `aov_usd` + `profit_margin`，则计算将综合分提高 15 分所带来的预估月度收益提升（参见 `../shared/ppc-math.md`）：

```
Target lift           = min(+15, 90 - internal_composite)    # cap at 90 internal
Assumed CVR lift      = target_lift / 100 * 0.5              # cap at 50% relative lift
Current conversions   = ad group conversions from last 30d
Additional conversions = current_conversions * assumed_CVR_lift
Additional revenue    = additional_conversions * AOV
Additional profit     = additional_conversions * AOV * profit_margin
```

将收益提升表述为 `fixing this page is worth ~$X/mo in profit`——绝不能将其表述为保证。将 CVR 提升上限设为 50%，并将分数提升上限设为 15 分，可以避免估算结果脱离现实。如果没有 `unit_economics`，则完全省略美元金额这一行，而不是编造数字——各维度的测量结果本身仍然有价值。

## 阶段 4：交付报告

最多 60 行。以美元收益提升（如果可用）和最重要的一项修复为开头。不要使用字母等级。

```
# Landing Page — [URL]
Ads sending traffic here: [N ad groups] · [X clicks/mo] · [$Y spent/mo] · CVR [Z%]
[If unit_economics available] **Estimated lift from top 3 fixes: ~$X/mo in profit**
[If unit_economics is missing] _(Dollar lift unavailable — no verified AOV/margin. Confirm unit economics in business-context.json for sharper estimates.)_

**Biggest leak:** [one sentence naming the dimension and the specific observation, e.g. "LCP is 5.8s on mobile — 2.8s slower than the 3s threshold that kills conversion rate."]

## Measurements
| Dimension | Measurement | Top Finding |
|-----------|-------------|-------------|
| Message Match | [word-for-word verdict: Match / Drift / Broken] | [one line citing ad H1 vs page H1] |
| Page Speed | LCP Xs · INP Xms · CLS X · PSI perf score X | [top blocking audit from Lighthouse] |
| Mobile Experience | PSI accessibility X · [mobile-specific issue count] | [one line: e.g. "No click-to-call, form below fold"] |
| Trust Signals | [review count, years in business, cert count] | [one line: e.g. "Zero named testimonials, copyright 2023"] |
| Form & CTA | [field count] fields · CTA text: "[button]" · [above/below fold] | [one line: e.g. "11 fields for a free quote"] |

## Fix First (top 3, ranked by estimated $ lift)
1. **[Action]** — est. +$X/mo · `<time_to_fix>`
   Evidence: [the actual text/number from the page or PSI audit]
2. **[Action]** — est. +$X/mo · `<time_to_fix>`
   Evidence: [...]
3. **[Action]** — est. +$X/mo · `<time_to_fix>`
   Evidence: [...]

## Message Match Detail
Ad headline: "[actual headline from top-spending ad]"
Page H1:    "[actual H1 from landing page]"
Observation: [Match / Drift / Broken] — [one-line rationale citing the specific words that match or don't]

## Handoff
[Pick one:]
- Page speed dominates the problem → "Share these fixes with your developer: [list]"
- Message mismatch dominates → "Run /google-ads-copy to rewrite ads to match the page, or update the page to match the ads"
- Form friction dominates → "Reduce form to [specific fields]. Every removed field is ~10% more conversions"
```

## 写入历史记录

将评分追加到 `{data_dir}/landing-page-history.json`，以便重新审计时显示变化：

```json
{
  "pages": {
    "https://example.com/services/roofing": {
      "history": [
        {
          "date": "2026-04-14",
          "internal_composite": 67,
          "dimensions": {
            "message_match": 72,
            "page_speed": 45,
            "mobile": 80,
            "trust": 70,
            "form_cta": 65
          },
          "psi_mobile_lcp_s": 4.2,
          "psi_mobile_cls": 0.15,
          "psi_mobile_inp_ms": 320,
          "estimated_lift_usd_per_month": 380,
          "ad_groups": ["Example City Search - Roofing"],
          "monthly_spend": 1240.50,
          "monthly_cvr": 2.1,
          "biggest_leak": "Page Speed — LCP 4.2s on mobile"
        }
      ]
    }
  }
}
```

`internal_composite` 仅用于趋势跟踪——它是美元提升公式所使用的内部参考数值，绝不会作为字母等级展示给用户。后续再次审计同一 URL 时，对原始维度测量值和美元提升额进行差异比较：`LCP 4.2s → 2.1s · Page Speed 45 → 78 · estimated lift $380/mo → $120/mo remaining`。三项测量值发生了变化，没有人为制造的等级跳变。

## 规则

1. **绝不要在未使用 WebFetch 获取页面的情况下对其评分。** 评分标准要求有证据。没有 WebFetch，就不能评分。如果页面受限或需要身份验证，请用户协助。
2. **绝不要报告未经实际测量的 PSI 数值。** 如果 PSI 执行失败，请说明“PSI 不可用”——不要估算。
3. **除非用户要求评估多个页面，否则一次只评估一个页面。** 在一轮中为三个页面评分会导致报告难以阅读。仅在用户明确要求时才进行批量处理。
4. **不要在此处重写文案。** 此技能用于诊断页面。如需新的标题，移交给 `/google-ads-copy`；如需调整出价、否定关键词或预算，移交给 `/google-ads`。
5. **考虑利润率的美元影响估算需要经过验证的单位经济数据。** 如果 `unit_economics.source == "inferred_from_template"`，请在提升额行末尾追加 `_(using industry defaults — confirm your AOV/margin for sharper estimates)_`。
6. **始终持久化保存。** 每个已评分的页面都要写入 `landing-page-history.json`，即使用户没有提出要求——未来的审计依赖这一基准数据。