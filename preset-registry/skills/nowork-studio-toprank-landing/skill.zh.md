---
name: google-ads-landing
description: Score and diagnose Google Ads landing pages. Use when asked to audit a landing page, check landing page quality, diagnose high-CTR but low-conversion-rate ad groups, improve Quality Score's Landing Page Experience component, or compare an ad group's messaging against its landing page. Trigger on "landing page audit", "landing page score", "landing page quality", "why is my conversion rate low", "LPX", "landing page experience", "ad to page match", or when `/google-ads-audit` surfaces a high-CTR / low-CVR ad group.
argument-hint: "<landing page URL or ad group name>"
---
## 设置

阅读并遵循 `../shared/preamble.md`（MCP 检测、账号选择）和 `../shared/analysis-principles.md`（证据要求、安全边界）。二者适用于整个技能——下文的每个维度都是测量结果，而非主观意见。

# 落地页评分与诊断

Google Ads 广告系列失败在落地页上的情况比失败在竞价环节更常见。一个出色的 RSA，如果将流量引向加载缓慢、重点不明确或与广告不匹配的页面，会造成双重预算浪费——第一次浪费在点击上，第二次浪费在转化流失上。此技能从 **5 个加权维度**对落地页进行评分，并给出具体的修复建议。

只对实际承接广告流量的页面进行评分。不要对随机的营销页面评分。在用户直接请求时、从 `/google-ads-audit` 自动移交时（高 CTR / 低 CVR 的广告组）、QS 诊断标记“Landing Page Experience: Below Average”时，或者在 `/google-ads-copy` 为一个从未经过验证的页面撰写新文案前的预检阶段，运行此技能。

当问题涉及广告与页面的匹配度、高 CTR / 低 CVR、LPX，或者同时测试广告和落地页时，请在评分前阅读 `references/message-chain-testing.md`。它能让诊断聚焦于付费搜索的消息链，避免偏离成泛泛的网站设计审计。

## 参考资料

- `references/scoring-rubric.md` — 包含 5 个维度的加权评分标准、阈值和证据字段。评分前请先阅读。
- `references/message-chain-testing.md` — 查询 → 广告 → 页面消息链诊断，以及广告与落地页的测试设计。
- `../manage/references/quality-score-framework.md` — 仅当用户的明确目标是提升 QS 时使用。

## 阶段 1：确定目标页面

确定要对哪些 URL 进行评分。按以下优先级处理：

1. **用户提供了 URL** — 对该页面评分，跳过发现流程。
2. **用户提供了广告组或广告系列名称** — 使用 `runScript` 对 `ad_group_ad` 执行 GAQL 查询，并按该广告组进行筛选；提取唯一的 `final_urls`。进行规范化处理（移除跟踪参数，保留会影响路由的路径和查询参数）。
3. **从 `/google-ads-audit` 自动移交** — 移交内容中会包含被标记的具体广告组。以相同方式提取其最终到达网址。
4. **没有参数** — 使用 `runScript` 在整个账号范围内执行 `ad_group_ad` 查询，按过去 30 天的支出对最终到达网址进行排名，提出排名前 3 的网址，并请用户确认。

**积极去重。** 许多广告会指向同一个最终到达网址——每个唯一 URL 只评分一次，然后再映射回使用该 URL 的每个广告组。

## 阶段 2：收集信号（并行）

在单次工具调用轮次中完成以下所有操作：

1. **使用 WebFetch 获取落地页** — 采集可见的标题、副标题、主要 CTA 文本、表单字段、信任信号和正文文案语气。采集完整 HTML，以便发现脚本臃肿问题和首屏内容。
2. **调用 PageSpeed Insights API** — 通过 WebFetch 访问 `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`。单 URL 查询不需要 API 密钥。从 `lighthouseResult.audits` 中提取 LCP、CLS、INP、TTI、性能得分以及排名前 3 的优化机会。
3. **提取引荐广告文案和广告组的转化指标** — 通过一次 `runScript` 调用，使用 `ads.gaqlParallel` 查询 `ad_group_ad`（获取标题和描述文本——作为消息匹配基准）以及 `ad_group` 或 `keyword_view`（获取点击次数、转化次数和 CVR——用于为预算影响估算提供事实依据）。一次调用即可覆盖两者。
4. **读取 `{data_dir}/business-context.json`** — 获取品牌语调、差异化优势、优惠和目标受众。如果文件缺失，请先引导用户使用 `/google-ads-audit`。不要猜测业务信息。

如果任何单次调用失败，请继续执行——在报告中注明缺失项，而不是阻塞流程。PageSpeed Insights 可能会触发速率限制；如果发生这种情况，请改用手动计时注释（"PSI unavailable — could not score Page Speed"），并降低最终报告的置信度，而不是跳过该维度。

## 阶段 3：为页面评分

阅读 `references/scoring-rubric.md`，根据证据为每个维度打出 0-100 分。各维度分数是真实测量结果（PageSpeed Insights 数值、逐字文案对比、表单字段数量等）——它们不是人为设定的评级，而是观测结果。

计算加权综合分，但仅将其作为下方美元收益提升公式的**内部参考数值**。不要将其呈现为字母等级。用户会看到各维度的测量结果和预估美元收益提升——综合分只是内部计算的一环。

```
internal_composite = 0.25 * Message Match
                   + 0.25 * Page Speed
                   + 0.20 * Mobile Experience
                   + 0.15 * Trust Signals
                   + 0.15 * Form & CTA
```

**美元收益提升是核心结论。**如果 `business-context.json.unit_economics` 中包含 `aov_usd` 和 `profit_margin`，请计算将综合分提高 15 分所带来的预估月度收益提升（参见 `../shared/ppc-math.md`）：

```
Target lift           = min(+15, 90 - internal_composite)    # cap at 90 internal
Assumed CVR lift      = target_lift / 100 * 0.5              # cap at 50% relative lift
Current conversions   = ad group conversions from last 30d
Additional conversions = current_conversions * assumed_CVR_lift
Additional revenue    = additional_conversions * AOV
Additional profit     = additional_conversions * AOV * profit_margin
```

将收益提升表述为 `fixing this page is worth ~$X/mo in profit`——绝不要将其表述为保证。CVR 提升 50% 的上限和分数提升 15 分的上限可避免估算结果脱离现实。如果没有 `unit_economics`，请完全跳过美元金额这一行，而不是编造数字——各维度的测量结果本身仍然成立。

## 阶段 4：交付报告

最多 60 行。以美元收益提升（如可用）和最重要的一项修复作为开头。不要使用字母等级。

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

## 写回历史记录

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

`internal_composite` 仅用于趋势跟踪——它是美元提升公式所使用的内部参考数值，绝不会以字母等级的形式向用户展示。后续针对同一 URL 运行时，对原始维度测量值和美元提升额进行差异比较：`LCP 4.2s → 2.1s · Page Speed 45 → 78 · estimated lift $380/mo → $120/mo remaining`。三项测量值发生了变化，没有人为制造的等级跳变。

## 规则

1. **如果没有使用 WebFetch 获取页面，绝不要对其评分。** 评分标准要求提供证据。没有 WebFetch = 没有评分。如果页面受限或需要身份验证，请让用户协助。
2. **绝不要报告未经实际测量的 PSI 数值。** 如果 PSI 失败，请说明“PSI 不可用”——不要估算。
3. **除非用户要求多个页面，否则一次只处理一个页面。** 在一次交互中为三个页面评分会生成难以阅读的报告。仅在用户明确要求时进行批量处理。
4. **不要在这里重写文案。** 此技能用于诊断页面。需要新标题时移交给 `/google-ads-copy`，需要调整出价、否定关键词或预算时移交给 `/google-ads`。
5. **考虑利润率的美元影响估算需要经过验证的单位经济数据。** 如果 `unit_economics.source == "inferred_from_template"`，请在提升额一行后附加 `_(using industry defaults — confirm your AOV/margin for sharper estimates)_`。
6. **始终持久化保存。** 每个已评分的页面都要写入 `landing-page-history.json`，即使用户没有提出要求——未来的审计依赖该基准。