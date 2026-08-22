---
name: paid-ads-launch
description: Plan and prepare a new paid-media campaign or cross-channel test before it can spend. Use when asked to create, launch, start, set up, or allocate budget to an advertising campaign on any supported platform.
argument-hint: "<business goal, budget, and target platform>"
---
# 付费广告上线

阅读 `../shared/operating-contract.md` 和 `../shared/measurement-framework.md`。

## 设置上线门槛

在明确以下信息之前，不要制定或推荐支出计划：主要转化目标及其验证方法、目标 CPA/ROAS 或客户经济模型、每日和每月预算、目标 URL、投放地区、已获批准的优惠和宣传主张，以及有权批准支出的用户。在针对跟踪数据进行优化之前，先诊断跟踪是否正常。

选择范围最窄且可行的测试。搜索需求通常适合 Google Search；视觉发现类需求可能适合 Meta；基于职位/公司的 B2B 定向可能适合 LinkedIn；电商平台上的商品需求可能适合 Amazon。将少量预算分散到多个渠道通常会导致实验效力不足：说明其中的权衡；如果用户仍选择这样做，则设定复盘日期。

## 生成上线前检查简报

将以下交付物标记为 `ready_for_review`：

| 字段 | 必填内容 |
|---|---|
| 目标与衡量 | 转化、事实依据来源、归因窗口、基准、目标和复盘日期 |
| 渠道与结构 | 平台、广告系列/广告组结构、受众/查询意图和排除项 |
| 预算 | 币种、每日上限、推算的每月最高支出、预算分配和投放节奏护栏 |
| 信息链路 | 受众动机、已获批准的宣传主张来源、广告创意概念、CTA 和与之匹配的落地页 URL |
| 实验 | 单一主要变量、成功指标、护栏、最短观察窗口和停止条件 |
| 就绪情况 | 将跟踪、政策/权利、创意素材、访问权限和依赖项标记为已完成或受阻 |

## 仅在经过验证的操作界面上执行

对于 Google Ads，将已批准的简报交给 `/notfair:google-ads`，然后以暂停状态创建并回读确认。对于 Meta，使用 `/notfair:meta-ads` 执行受支持的操作，并将无法执行的创建步骤转至 Ads Manager。对于所有其他平台，提供可供操作人员直接执行的简报，除非当前会话提供了具备所需功能且经过验证的 NotFair 连接器。未经单独、明确的批准，绝不要恢复广告系列。