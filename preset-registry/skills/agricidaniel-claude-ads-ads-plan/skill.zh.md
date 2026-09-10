---
name: ads-plan
description: "Create a professional paid-advertising strategy covering objectives, economics, platform selection, campaign architecture, audiences, budget, creative, measurement, experiments, governance, rollout, and reporting. Use for ad plan, media plan, PPC strategy, paid-social strategy, campaign architecture, advertising roadmap, or channel planning."
---
# 付费媒体计划

1. 读取设置配置文件、业务经济性、证据、当前账户状态，以及相关行业模板，作为可选输入。
2. 定义目标、客户、报价、转化、价值、约束条件、地理范围、受监管类别、时间范围和成功标准。
3. 从第一性原理评估渠道角色和排除项；不要求每个平台都必须使用。对于十二平台合约之外的渠道，加载 `ads/references/additional-platforms.md`，并返回一条研究线索，除非当前已有其投放、资格、衡量和创意证据。
4. 在提出 Meta 预算、学习阶段预期、出价、整合或绩效预测之前，按照 `skills/ads-meta/SKILL.md` 中的合约要求，收集账户、Pixel 和转化冷启动维度。当任何维度处于冷启动或 `unknown` 状态时，应规划衡量验证、明确的创意假设、分阶段且可逆的测试，并标注置信度；不得将成熟账户基准应用于缺失历史数据的情况。
5. 明确广告系列架构、受众策略、创意系统、预算与节奏、衡量方式、实验、政策控制和运营节奏。
6. 为发布、学习、优化和扩量阶段设定前置条件。
7. 为每项行动指定负责人、时间、依赖项、防护措施、证据、成功衡量指标，以及回滚或退出条件。
8. 返回规范 JSON，并呈现所请求的人工计划。

计划仅供建议。只有通过发布或优化变更门控后，计划才会成为账户变更。