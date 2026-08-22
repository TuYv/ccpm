---
name: paid-ads-review
description: Produce a read-only, evidence-based paid-media performance review across connected platforms or supplied exports. Use for weekly or monthly reports, scorecards, performance, CPA, ROAS, CTR, spend trends, pacing, or conversion-tracking health.
argument-hint: "<date range, platform, or 'weekly review'>"
---
# 付费广告审查

阅读 `../shared/operating-contract.md` 和 `../shared/measurement-framework.md`。此操作为只读。

## 汇总可比证据

检查哪些数据源已实际连接；若缺少数据源，应请求提供缺失的导出文件，而不是报告调用失败；使用最新且完整的同等时间窗口。对于每个数据源，清晰列出币种、转化定义、归因窗口和报告延迟。在将 CPA、ROAS 或收入视为可用于决策的指标之前，先验证追踪是否有效。

对于在线平台账户，将数据收集和诊断交给 `/notfair:google-ads`、`/notfair:meta-ads`、`/notfair:paid-ads-x` 或 `/notfair:paid-ads-linkedin`。对 TikTok、Amazon 和 ChatGPT Ads 的审查必须基于经过验证的连接器或用户提供的平台导出数据。

## 报告决策，而不是照抄仪表板

开头应说明贡献最大的渠道、最重大的风险，以及一项建议采取的后续行动。提供平台评分卡，其中包括支出、合格转化次数、CPA、可归因收入/ROAS（如有）、链接 CTR，以及相对于已声明预算的支出进度。将每一行与前一个同等周期进行比较，并且仅在数据支持的情况下说明可能的驱动因素。

不要呈现未附带限定条件的混合 CPA 或 ROAS。如果跨渠道汇总数据有用，应标明一致的转化定义、归因来源、按支出加权的公式，以及纳入统计的渠道。将已确认的事实与推断分开，并将追踪或数据缺失标记为阻断性限制。

以 `hold`、`investigate` 或一项建议执行的操作作为结尾；将变更操作交由 `/notfair:paid-ads-optimize` 或相关平台的操作技能处理。