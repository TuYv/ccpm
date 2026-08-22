---
name: paid-ads-linkedin
description: Audit, diagnose, plan, and safely operate connected LinkedIn Ads accounts through the NotFair MCP, with an export-based fallback. Use for LinkedIn advertising, sponsored content, lead-generation forms, job-title or company targeting, campaign groups, creatives, conversions, lead quality, budgets, bids, or approved LinkedIn campaign changes.
argument-hint: "<B2B goal, audience, account, or date range>"
---
# LinkedIn 广告

执行操作前，请阅读 `../shared/operating-contract.md` 和 `../shared/measurement-framework.md`。优先使用通用 NotFair MCP 上的 `linkedin_ads_` 工具；仅当没有经过验证的连接器可用时，才使用用户提供的导出数据。

## 建立访问权限和合格需求上下文

1. 将 `~~linkedin-ads` 解析到通用连接器的 `linkedin_ads_` 工具接口，或经过验证的兼容连接器。使用 NotFair 时，调用 `listConnectedPlatforms`，然后通过无副作用的账户/设置读取操作确认所选账户。不要根据其他平台的工具推断 LinkedIn 的访问权限。
2. 如果连接器缺失或未经授权，请要求重新授权或提供当前导出数据，并将结果限制为仅制定计划/审核。
3. 在诊断效果之前，明确销售合格转化、CRM 反馈闭环、账户币种、归因依据、目标 CPA 或销售管道成果，以及完整的日期范围。

将潜在客户数量与潜在客户质量分开评估。仅当业务依据和受众限制合理且可辩护时，才基于职位职能、资历、公司、行业或账户列表构建定向假设。

## 读取和诊断

使用 `runScript` 对广告系列组、广告系列、创意和分析数据开展关联的只读操作。优先执行一次广泛读取。对于单个对象、转化规则、潜在客户表单、定向查询或潜在客户表单回复，使用专用的单点工具。

正确理解平台：

- 层级结构为账户 → 广告系列组 → 广告系列 → 创意。
- 金额以主要货币单位对象的形式返回，例如 `{ amount: "50", currencyCode: "USD" }`，而不是微单位或分。
- 定向在广告系列上以完整树结构存在。除非用户明确批准替换，否则应保留现有条件。
- 广告系列类型和费用类型在创建后不可更改。
- 潜在客户表单回复包含个人数据。仅在必要时检索，尽量减少回复中的暴露，并且绝不要将原始潜在客户个人身份信息复制到无关产物中。

审核时，按完整且等长的周期报告支出、展示次数、链接点击率、潜在客户数、合格潜在客户数、CPA，以及下游销售管道或收入。仅当数据支持时，才指出可能的驱动因素。

## 安全执行已批准的更改

使用专用写入工具，绝不要使用只读脚本接口。首先展示确切对象、当前状态和拟议状态、币种风险敞口、预期效果以及回滚方案。如果可用，对于影响支出的创建、预算、出价和定向操作，使用试运行预览。

- 优先选择暂停/激活，而不是硬删除；转化规则和匹配受众可能无法通过 API 删除。
- 以草稿状态创建广告系列组、广告系列和创意，然后在激活前审核定向、预算、转化关联和创意。
- 仅在重试同一个结果不确定的创建操作时，使用稳定的客户端请求 ID。
- 在设置完整定向树之前，将定向名称解析为 LinkedIn URN。
- 哈希处理和事件结构强制执行属于连接器的职责。不要在最终报告中暴露原始客户标识符。
- 通过返回的更改前后证据或重新读取来验证变更，并报告任何部分失败。

最后说明已确认的操作、质量指标、观察窗口和回滚触发条件。如果基于导出文件进行操作，请将建议标记为 `ready_for_review`，绝不能标记为 `published`。