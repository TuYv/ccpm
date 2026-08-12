---
name: ads-launch
description: "Draft or explicitly apply a paid-ad campaign launch through Claude Ads capability-gated adapters. Use for campaign creation, launch plans, publishing ads, activating campaigns, uploading creative, or requests to push a campaign live."
---
# 广告系列启动

默认为 `--draft`。

1. 加载已验证的设置配置文件、账户快照、广告系列计划、创意素材清单、平台能力清单、政策审查结果和跟踪检查结果。
2. 如果草稿缺少账户/对象范围、目标、转化、预算、日期、定向、素材、目标地址、衡量方案或政策资格，则拒绝该草稿。
3. 生成确定性的变更计划，其中包含准确的拟议对象、变更前/后状态、影响范围、学习影响、负责人、成功衡量标准、验证窗口、幂等键、审计目标位置和回滚方案。
4. 对于 `--apply`，要求启用并独立测试确切的操作，然后获取对该确切计划的明确批准。
5. 应用最小的可逆变更，验证远程状态，并保留不可变的审计和回滚记录。

缺少上限、账户状态过期、远程状态发生变化、跟踪不完整、政策审查失败或适配器不可用时，都会阻止应用。不支持永久删除。