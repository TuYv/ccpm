---
name: cleanup-dashboards
description: "Audit and consolidate HubSpot reporting dashboards. Identifies unused, duplicate, or outdated dashboards. Must be performed manually — no dashboard API is available."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 清理仪表盘

审计 HubSpot 仪表盘，去除冗余内容并整合报告。仪表盘过多意味着没有人能有效地使用其中任何一个。

## 重要限制

HubSpot 不提供仪表盘 API。整个过程必须在 HubSpot UI 的 Reports > Dashboards 下手动完成。

## 前置条件

- 拥有仪表盘管理权限的 HubSpot 门户访问权限
- 来自团队成员的反馈，说明他们实际在使用哪些仪表盘

## 分步操作说明

### 阶段 1：事前 — 盘点所有仪表盘

1. 在 HubSpot 中导航到 Reports > Dashboards。
2. 创建一个电子表格，列出每个仪表盘：
   - 名称、所有者/创建者、报告数量、最后查看日期（如果可见）、用途

### 阶段 2：执行 — 识别待移除对象

标记符合以下任一条件的仪表盘：

1. 超过 90 天**未被查看**（先与所有者确认）
2. 覆盖相同指标的**重复**仪表盘
3. **测试仪表盘**（名称包含 "test"、"draft"、"copy of"）
4. 已离职员工的**个人仪表盘**
5. 从未被自定义过的**默认仪表盘**

整合目标：
- 将报告小部件存在重叠的多个仪表盘合并为一个综合性仪表盘。
- 核心仪表盘最多控制在 5-10 个（例如：营销总览、销售管道、邮件健康状况、数据质量、执行摘要）。

### 阶段 3：事后 — 清理与重组

1. 删除已确认不再使用的仪表盘。
2. 使用清晰的命名规范重命名剩余仪表盘（例如 `[Team] - Purpose`）。
3. 为每个仪表盘设置适当的共享/可见性。
4. 将变更告知团队 — 分享整合后仪表盘的链接。

### 阶段 4：回滚

- 已删除的仪表盘无法恢复。
- 删除前，对每个仪表盘截图，或记录其中包含哪些报告。
- 仪表盘被移除时，其中的单个报告并不会被删除 — 它们仍可重复使用。

## 提示

- 为每个核心仪表盘指定一名仪表盘负责人 — 由其负责保持仪表盘内容的时效性。
- 作为数据库清理例程的一部分，每季度审查一次仪表盘。
- 如果仪表盘上的某个报告显示过期或损坏的数据，应修复底层报告，而不是新建仪表盘。
