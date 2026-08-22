---
name: paid-ads-x
description: Audit, diagnose, and safely operate connected X Ads (Twitter Ads) accounts through the NotFair MCP. Use for X Ads performance, campaign or line-item analysis, spend, conversions, targeting, promoted posts, audiences, budgets, bids, creative, campaign setup, or approved X Ads changes.
argument-hint: "<account, campaign, date range, or X Ads goal>"
---
# X Ads

执行操作前，请阅读 `../shared/operating-contract.md` 和 `../shared/measurement-framework.md`。将通用 NotFair MCP 上的 `x_ads_` 工具作为事实依据。

## 确定实时操作范围

1. 将 `~~x-ads` 解析到通用连接器的 `x_ads_` 工具集，或经过验证的兼容连接器。在通用连接器上调用 `listConnectedPlatforms`，并要求 X Ads 已连接；不要根据其他平台的工具推断是否拥有 X 的访问权限。
2. 通过无副作用的账户/设置读取来确认所选账户。如果连接器缺失或未获授权，请引导用户连接或重新授权 X Ads，并在声称拥有实时访问权限之前停止操作。
3. 记录账户币种、时区、目标、转化定义、归因依据和请求的日期范围。将跟踪缺失视为局限性，而不是零效果。

## 通过一次广泛读取进行诊断

使用连接器的 `runScript` 分析接口执行审计和关联读取。尽可能一次性获取广告系列、广告组、资金/配置和效果数据；仅针对单个范围狭窄的对象，或脚本沙箱能力范围之外的功能，使用专门的点读取。

正确理解平台：

- 层级结构为：账户 → 资金工具 → 广告系列 → 广告组 → 推广帖子/账户。
- 以 `*_local_micro` 结尾的金额字段，表示当地货币主要单位乘以 1,000,000。显示或比较前，应除以 1,000,000。
- 广告组的 `primary_web_event_tag` 描述其优化配置。它并不能证明归因转化为零；应从效果数据中读取转化指标。
- 同步统计适用于较短且未细分的时间范围。当请求的时间范围或细分维度超出脚本接口的当前限制时，请使用连接器的长时间范围效果读取功能。
- 比较完整且等长的时间段，并且仅在返回字段支持时，列出花费、展示次数、互动/链接点击率、转化、CPA 或 ROAS。

首先给出业务决策相关结论：最主要的贡献者、最大的实质性风险、有数据支持的可能原因，以及最小且有用的下一步行动。将实测事实与推断分开说明。

## 安全地执行已获批准的变更

使用专用的变更工具，绝不要使用只读脚本接口。执行操作前，展示确切的账户、实体、当前值、拟议值、花费风险敞口、风险和回滚方案。对于预算、出价、定向、优化事件和创建操作，如果连接器支持，请优先使用试运行预览。

- 优先选择暂停/启用，而不是不可逆的删除。
- 创建广告系列和广告组时将其设为暂停状态，并在启用前验证配置。
- 仅当对响应不确定的同一次创建操作进行重试时，才重复使用相同的客户端请求 ID；对于真正的新实体，应使用新的 ID。
- 将优化事件变更视为学习重置，并在请求批准前明确说明。
- 应用定向条件前，先将定向名称解析为平台 ID；除非用户批准完全替换，否则保留不相关的定向设置。
- 执行已获批准的变更后，使用返回的变更前/后证据或重新读取来确认最终状态。如实报告部分失败。

最后说明已确认的操作、观察窗口、成功指标和回滚触发条件。提案仍处于 `ready_for_review` 状态；只有在实时连接器确认后，才能将其称为 `published`。