---
name: quarterly-database-cleanup
description: "Run a comprehensive quarterly CRM audit covering list health, bounce monitoring, data quality, scoring calibration, engagement metrics, and property cleanup. Produces a health report with quarter-over-quarter trend comparison."
license: MIT
metadata:
  author: tomgranot
  version: "1.1"
  category: ongoing-maintenance
---
# 季度数据库清理

一项结构化的季度审计，可在数据漂移演变成危机之前将其捕获。请在每个季度开始时运行（如果数据库规模较大或增长迅速，则可每月运行）。

## 前置条件

- 一个 HubSpot 私有应用访问令牌（`.env` 中的 `HUBSPOT_ACCESS_TOKEN`）
- Python 3.10+ 并安装 [`uv`](https://github.com/astral-sh/uv)
- 上一季度的报告（用于趋势对比）——首次运行时可选

## 审计清单

### 1. 列表健康状况
- 统计活跃列表、静态列表以及未使用列表（成员数为零）的总数
- 识别未被任何工作流或邮件引用的列表
- 标记重复或重叠的列表

### 2. 退信监控
- 统计退信 1 次、2 次和 3 次以上的联系人数量
- 硬退信率与上一季度的对比
- 查看由退信监控工作流标记的联系人

### 3. 数据质量
- 缺失电子邮件、公司、行业、国家、生命周期阶段
- 将百分比与上一季度进行比较
- 标记任何属性完整度下降超过 5% 的情况

### 4. 评分校准
- 查看潜在客户评分分布（直方图）
- 检查 MQL 转化率——高评分的潜在客户是否真的在转化？
- 如果转化率低于 10% 或高于 50%，则调整评分模型

### 5. 互动指标
- 活跃联系人（过去 90 天内有互动）占总数的百分比
- 僵尸联系人（6 个月以上无互动）占总数的百分比
- 邮件打开率和点击率趋势

### 6. 属性清理
- 零填充记录的自定义属性
- 未在任何列表、工作流或表单中使用的属性
- 应归档的测试/临时属性

## 分步操作说明

### 阶段 1：事前——收集基线数据

1. 在 `reports/` 中找到上一季度的报告（如果存在）。
2. 运行 `/hubspot-audit` 以获取所有维度的最新数据。

### 阶段 2：执行——深度审查

针对上述每个清单项：

1. 通过 HubSpot API 获取当前指标（复用审计脚本的既有模式）。
2. 与上一季度的数据进行比较。
3. 标记任何恶化超过 5 个百分点的指标。
4. 记录需要采取行动的具体联系人、列表或属性。

### 阶段 3：事后——生成报告

将报告保存到 `reports/quarterly-cleanup-{YYYY-Q#}.md`，结构如下：

```markdown
# Quarterly Database Health Report — YYYY Q#

## Summary

| Metric | Last Quarter | This Quarter | Change |
|--------|-------------|-------------|--------|
| Total contacts | XX,XXX | XX,XXX | +X% |
| Data completeness | XX% | XX% | +X% |
| Bounce rate | X.X% | X.X% | -X% |
| Zombie contacts | XX% | XX% | -X% |
| Unused lists | XX | XX | -XX |

## Action Items

1. [item with owner and deadline]
2. ...

## Detailed Findings

[One section per checklist item with metrics and recommendations]
```

### 阶段 4：回滚

这是一项只读审计——无需回滚。报告中的行动项将通过各自对应的技能单独执行。

## 日程安排

- 为每个季度的第一个星期一设置重复的日历提醒。
- 为报告中的每个行动项指定负责人。
- 在开始新审计之前，先检查上一季度行动项的完成情况。
