---
name: ads-attribution
description: "Audit cross-platform attribution, conversion definitions, reporting windows, GA4, AdServices and AdAttributionKit, MMPs, browser and server events, offline conversions, and platform reconciliation. Use for attribution audit, attribution models, conversion windows, requests to add or total Meta and Google conversions, incompatible reporting-window aggregation, GA4 attribution, MMP review, AppsFlyer, Adjust, Branch, Singular, or cross-platform discrepancies."
---
# 归因审计

1. 阅读主 `ads` 契约和标准化账户快照。
2. 明确业务转化、价值、数据窗口、时区、货币，以及归因分析必须支持的决策。
3. 盘点所有浏览器端、服务器端、平台、分析工具、MMP、线下和应用归因来源，以及各自的身份标识、计数、去重和隐私规则。
4. 对账可比事件，并解释由资格条件、浏览归因规则、同意机制、建模数据、转化延迟、阈值或范围造成的差异。
5. 将衡量质量与平台报告的效果分开。
6. 通过通用 JSON 契约返回发现、矛盾、置信度、缺失证据和衡量改进计划。

不要假定某个平台是真实基准，不要将不兼容的报告相加，也不要在不了解操作者决策背景的情况下推荐归因模型。

## 可比性门槛

在各来源共享以下定义或已明确标准化为相同定义之前，拒绝聚合：转化事件和价值定义、归因窗口、点击/浏览范围、计数方法、去重身份标识、时区、货币、归因模型以及建模数据的处理方式。在此之前，应并列报告数值及其定义；不要计算总计。

示例：Meta 的七天转化数据与 Google 的三十天转化数据不兼容。拒绝将二者相加，先对齐窗口和定义，并且只聚合新生成的可比数据集。