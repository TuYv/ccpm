---
name: paid-ads-launch
description: Plan and prepare a new paid-media campaign or cross-channel test before it can spend. Use when asked to create, launch, start, set up, or allocate budget to an advertising campaign on any supported platform.
argument-hint: "<business goal, budget, and target platform>"
---
# 付费广告上线

阅读 `../shared/operating-contract.md` 和 `../shared/measurement-framework.md`。

## 设置上线门槛

在明确以下信息之前，不要制定或推荐预算支出计划：主要转化目标及其验证方法、目标 CPA/ROAS 或客户经济模型、每日和每月预算、目标 URL、投放地域、已批准的优惠和宣传主张，以及能够批准支出的用户。在针对跟踪数据进行优化之前，应先诊断跟踪是否正常。

选择范围最窄且可行的测试。对于搜索需求，通常适合使用 Google Search；对于视觉发现，Meta 可能更合适；对于基于职位/公司的 B2B 定向，LinkedIn 可能更合适；对于电商平台上的商品需求，Amazon 可能更合适。将少量预算分散到多个渠道通常会导致实验效力不足：如果用户仍然选择这样做，应解释其中的权衡，并设定复盘日期。

## 制作投放前检查简报

将以下产物标记为 `ready_for_review`：

| 字段 | 必填内容 |
|---|---|
| 目标与衡量 | 转化、事实依据来源、归因窗口、基准、目标和复盘日期 |
| 渠道与结构 | 平台、campaign/ad-set 或 ad-group 结构、受众/查询意图和排除项 |
| 预算 | 币种、每日上限、推算的每月最高支出、预算分配和投放节奏护栏 |
| 信息链路 | 受众动机、已批准的宣传主张来源、广告创意概念、CTA 和与之匹配的落地页 URL |
| 实验 | 单一主要变量、成功指标、护栏、最短观察周期和停止条件 |
| 就绪情况 | 跟踪、政策/权利、创意素材、访问权限和依赖项，并标记为已完成或受阻 |

## 仅在已验证的操作界面上执行

对于 Google Ads，将已批准的简报交给 `/notfair:google-ads`，然后以暂停状态创建并回读确认。对于 Meta，使用 `/notfair:meta-ads` 执行其支持的操作，并将不支持的创建步骤转至 Ads Manager。对于所有其他平台，除非当前会话提供了具备所需能力且经过验证的 NotFair 连接器，否则应提供可供操作人员直接执行的简报。若无单独的明确批准，绝不要恢复广告系列。