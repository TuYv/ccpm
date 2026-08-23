---
name: paid-ads-x
description: Audit, diagnose, and safely operate connected X Ads (Twitter Ads) accounts through the NotFair MCP. Use for X Ads performance, campaign or line-item analysis, spend, conversions, targeting, promoted posts, audiences, budgets, bids, creative, campaign setup, or approved X Ads changes.
argument-hint: "<account, campaign, date range, or X Ads goal>"
---
# X Ads

执行操作前，请阅读 `../shared/operating-contract.md` 和 `../shared/measurement-framework.md`。将通用 NotFair MCP 上的 `x_ads_` 工具作为事实依据。

## 确定实时操作范围

1. 将 `~~x-ads` 解析到通用连接器的 `x_ads_` 工具接口，或经过验证的兼容连接器。在通用连接器上调用 `listConnectedPlatforms`，并确认 X Ads 已连接；不得根据其他平台的工具推断 X 的访问权限。
2. 通过无副作用的账户/设置读取来确认所选账户。如果连接器缺失或未获授权，请引导用户连接或重新授权 X Ads，并且在声称拥有实时访问权限之前停止操作。
3. 记录账户币种、时区、目标、转化定义、归因依据和请求的日期范围。将跟踪缺口视为限制，而不是零绩效。

## 通过一次广泛读取进行诊断

使用连接器的 `runScript` 分析接口执行审计和关联读取。尽可能一次性拉取广告系列、广告组、资金/配置和绩效数据；仅针对单个狭窄对象或脚本沙盒范围之外的功能使用专用单点读取。

正确理解平台：

- 层级结构为账户 → 资金工具 → 广告系列 → 广告组 → 推广帖子/账户。
- 以 `*_local_micro` 结尾的金额字段表示本地货币主要单位乘以 1,000,000。显示或比较前除以 1,000,000。
- 广告组的 `primary_web_event_tag` 描述其优化配置。它不能证明归因转化为零；应从绩效数据中读取转化指标。
- 同步统计适用于较短且未细分的时间范围。当请求的时间范围或细分维度超出脚本接口当前限制时，使用连接器的长周期绩效读取功能。
- 比较完整且对等的周期，并且仅在返回字段支持时列出花费、展示次数、互动/链接点击率、转化次数、CPA 或 ROAS。

优先给出业务决策：贡献最大的因素、最重大的实质性风险、有数据支持的可能原因，以及最小且有效的下一步操作。将测量事实与推断分开。

## 安全执行已批准的更改

使用专用变更工具，绝不使用只读脚本接口。操作前展示确切的账户、实体、当前值、建议值、花费敞口、风险和回滚方案。当连接器提供相关功能时，对于预算、出价、定向、优化事件和创建操作，优先使用试运行预览。

- 优先选择暂停/启用，而不是不可逆的删除。
- 创建广告系列和广告组时将其设为暂停状态，然后在激活前验证配置。
- 仅当响应状态不确定并重试同一次创建操作时，才复用相同的客户端请求 ID；对于真正的新实体，应使用新的 ID。
- 将优化事件更改视为学习重置，并在请求批准前明确说明这一点。
- 应用条件前，将定向名称解析为平台 ID；除非用户批准完全替换，否则保留无关的定向设置。
- 完成已批准的变更后，使用返回的变更前后证据或重新读取来确认最终状态。如实报告部分失败。

最后写明确认的操作、观察窗口、成功指标和回滚触发条件。提案仍为 `ready_for_review`；只有在实时连接器确认后，才能将其称为 `published`。