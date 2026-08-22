---
name: paid-ads-linkedin
description: Audit, diagnose, plan, and safely operate connected LinkedIn Ads accounts through the NotFair MCP, with an export-based fallback. Use for LinkedIn advertising, sponsored content, lead-generation forms, job-title or company targeting, campaign groups, creatives, conversions, lead quality, budgets, bids, or approved LinkedIn campaign changes.
argument-hint: "<B2B goal, audience, account, or date range>"
---
# LinkedIn 广告

执行操作前，请阅读 `../shared/operating-contract.md` 和 `../shared/measurement-framework.md`。优先使用通用 NotFair MCP 上的 `linkedin_ads_` 工具；仅当没有经过验证的连接器可用时，才使用用户提供的导出数据。

## 建立访问权限和合格需求的上下文

1. 将 `~~linkedin-ads` 解析到通用连接器的 `linkedin_ads_` 工具集，或经过验证的兼容连接器。使用 NotFair 时，调用 `listConnectedPlatforms`，然后通过无副作用的账户/设置读取来确认所选账户。不要根据其他平台的工具推断 LinkedIn 的访问权限。
2. 如果连接器缺失或未经授权，请要求重新授权或提供当前导出数据，并确保结果仅限于规划/审核。
3. 在诊断效果之前，明确销售合格转化、CRM 反馈闭环、账户币种、归因依据、目标 CPA 或销售管道成果，以及完整的日期范围。

将潜在客户数量与潜在客户质量分开评估。仅当业务依据和受众限制合理且站得住脚时，才根据职位职能、资历级别、公司、行业或账户列表构建定向假设。

## 读取和诊断

使用 `runScript` 对广告系列组、广告系列、创意和分析数据执行相互关联的只读操作。优先执行一次覆盖面广的读取。对于单个对象、转化规则、潜在客户表单、定向查询或潜在客户表单回复，请使用专用的单点工具。

正确理解平台：

- 层级结构为账户 → 广告系列组 → 广告系列 → 创意。
- 金额以主货币单位对象返回，例如 `{ amount: "50", currencyCode: "USD" }`，而不是以百万分之一货币单位或分为单位。
- 定向条件是广告系列上的一整棵树。除非用户明确批准替换，否则保留现有条件。
- 广告系列类型和计费类型在创建后不可更改。
- 潜在客户表单回复包含个人数据。仅在必要时检索，在回复中尽量减少数据暴露，绝不要将原始潜在客户个人身份信息复制到无关产物中。

进行审核时，按完整且等效的时间段报告支出、展示次数、链接 CTR、潜在客户数、合格潜在客户数、CPA，以及下游销售管道或收入。仅当数据足以支持时，才指出可能的驱动因素。

## 安全地执行已批准的更改

使用专用写入工具，绝不要使用只读脚本工具集。首先展示确切对象、当前状态和拟议状态、币种风险敞口、预期效果以及回滚方案。如果可用，对会影响支出的创建、预算、出价和定向操作使用试运行预览。

- 优先选择暂停/激活，而不是硬删除；转化规则和匹配受众可能无法通过 API 删除。
- 以草稿状态创建广告系列组、广告系列和创意，然后在激活前审核定向、预算、转化关联和创意。
- 仅在重试同一次结果不确定的创建操作时，使用稳定的客户端请求 ID。
- 在设置完整的定向树之前，将定向名称解析为 LinkedIn URN。
- 哈希处理和事件结构强制执行应由连接器负责。不要在最终报告中暴露原始客户标识符。
- 通过返回的更改前/后证据或重新读取来验证变更，并报告任何部分失败。

最后说明已确认的操作、质量指标、观察窗口和回滚触发条件。如果基于导出数据进行操作，请将建议标记为 `ready_for_review`，绝不能标记为 `published`。