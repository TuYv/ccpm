---
name: create-segment-lists
description: "Create business segment lists in HubSpot for customers, partners, competitors, employees, ICP tiers, and industries. Enables segment-based targeting, suppression, and analytics."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 创建细分列表

构建一个细分列表库，以支持精准营销、准确报告和合理抑制。这些列表构成了基于细分的运营工作的基础。

## 前提条件

- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`），需具备 `crm.lists.read` 和 `crm.lists.write` 权限范围
- Python 3.10+ 以及 [`uv`](https://github.com/astral-sh/uv)
- 已创建 ICP 层级属性（请先运行 `/create-icp-tiers`）
- 已完成生命周期阶段清理（请先运行 `/fix-lifecycle-stages`）

## 访谈：收集需求

在执行之前，请从用户处收集以下信息：

**Q1：你的关键客户细分有哪些？**
- 示例：行业垂直领域（制造业、专业服务、零售、教育、物流）、公司规模层级（大型企业、中端市场、中小型企业）、地理区域（北美、EMEA、亚太）
- 默认：核心业务细分（客户、合作伙伴、竞争对手、内部人员），加上 ICP 层级和基于互动的细分

**Q2：对你们的业务而言，哪些互动标准定义了“活跃”？**
- 示例：过去 90 天内打开或点击邮件、过去 60 天内访问网站、过去 30 天内提交表单、过去 90 天内预约会议
- 默认：过去 90 天内的任何邮件互动（打开或点击）

## 推荐细分

### 核心业务细分

| 列表名称 | 类型 | 条件 |
|-----------|------|----------|
| 所有客户 | 活跃 | 生命周期阶段 = 客户 |
| 所有合作伙伴 | 活跃 | 联系人类型 = 合作伙伴（或自定义属性） |
| 竞争对手 | 静态 | 从已知竞争对手域名中手动整理 |
| 内部员工 | 活跃 | 邮箱域名与公司域名匹配 |
| 已抑制联系人 | 活跃 |
