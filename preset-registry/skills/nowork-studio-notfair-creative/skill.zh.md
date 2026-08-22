---
name: meta-ads-creative
description: Create evidence-based Meta ad creative briefs, copy angles, and testable asset concepts for Facebook and Instagram. Use when asked for Meta ad creative, Facebook ads copy, Instagram ad assets, UGC concepts, creative briefs, new ad concepts, or creative refreshes.
argument-hint: "<campaign, audience, or 'build a creative slate'>"
---
# Meta 广告创意工作室

基于真实客户语言和账户证据，创建可供审核的创意方案集。本技能用于生成简报和文案；这并不意味着 NotFair Meta MCP 能够上传创意素材或创建广告系列。

## 设置

阅读并遵循 `../shared/preamble.md`。首先读取 `{data_dir}/meta/business-context.json` 和 `{data_dir}/meta/personas/{accountId}.json`。如果任一文件缺失或已过时，请在撰写前建议运行 `/meta-ads-audit`。审计中的创意素材清单和用户画像是基准；不要因为请求描述不够具体而凭空编造受众。

如果拥有账户访问权限，请使用 `runScript` + `ads.graphParallel` 拉取当前广告和广告层级的成效分析数据。使用链接点击率、CPA 或购买价值、频次、归因窗口以及明确命名的时间段。如果用户提供了评论、销售通话记录或客户研究，仅在来源可识别时才将其视为证据。

## 创建概念方案集

每个概念都必须是一个真实的假设：

`persona × motivation × angle × format × one variable to test`

从三个截然不同的概念开始，而不是同一创意的三个表面变体。有效的组合可以包括证据、问题/痛点、产品演示、创始人/专家讲解或已获批准的优惠，但只能选择有证据支持的角度。

对于每个概念，请包含：

| 字段 | 必填内容 |
|---|---|
| 概念 ID 和假设 | 面向谁、为何应当有效，以及要测试的单一变量 |
| 证据 | 明确命名的广告系列、广告或客户来源，指标和时间窗口，或已批准的业务背景字段 |
| 钩子和正文 | 首帧或首行钩子，以及针对版位调整的文案 |
| 视觉简报 | 主体、场景、动作、屏幕上展示的证据以及制作说明 |
| CTA 和目标页面 | CTA，以及已批准的落地页/信息匹配说明 |
| 声明台账 | 每项评分、结果、价格、保证、引语或前后对比声明的来源及批准状态 |
| 解读计划 | 主要指标、护栏指标、计划持续时间/曝光量，以及什么结果会证伪该假设 |

未经支持的声明应标记为 `needs_substantiation`，而不是作为广告文案。应提供真实可信的替代方案，而不是使用含糊的免责声明。不要捏造 UGC 推荐语、评论数量、客户成果或视觉证据。

## 创意更新和测试

对于创意疲劳，应首先验证信号：按周比较链接点击率和 CPM，引用频次，并保持归因窗口不变。频次上升且链接点击率显著下降是一项创意更新假设，而不是普遍规则。

每次测试一个战略变量：角度、钩子、证据、格式、受众或目标页面。在发布前设定胜出指标和护栏指标；不要根据早期点击率激增或未经限定的站内 ROAS 数值判定胜出者。保留简短的迭代日志：概念 ID、发布日期、受众、花费、结果、决策和下一个挑战方案。

## 制作和执行边界

Meta MCP 有意专注于读取和运营，不提供创意素材上传或广告系列创建工具。应为用户已批准的设计流程或广告管理工具工作流交付可直接用于制作的简报；不要擅自执行 Graph API 写入操作。在人工发布之前，必须审核声明证据、权利/授权书、目标页面、政策敏感型定向以及适用于各版位的安全裁剪。

使用 `/meta-ads` 诊断效果，或在其支持的变更范围内执行操作。当缺少背景信息、追踪数据或创意素材清单时，使用 `/meta-ads-audit`。