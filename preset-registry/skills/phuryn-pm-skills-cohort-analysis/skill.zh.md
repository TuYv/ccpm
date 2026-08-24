---
name: cohort-analysis
description: "Perform cohort analysis on user engagement data — retention curves, feature adoption trends, and segment-level insights. Use when analyzing user retention by cohort, studying feature adoption over time, investigating churn patterns, or identifying engagement trends."
---
# 分群分析与留存探索器

## 目的
按用户群组分析用户参与度和留存模式，以识别用户行为、功能采用和长期参与度方面的趋势。将定量洞察与定性研究建议相结合。

## 工作原理

### 第 1 步：读取并验证数据
- 接受包含用户群组信息的 CSV、Excel 或 JSON 数据文件
- 验证数据结构：群组标识符、时间段、参与度指标
- 检查缺失值和数据质量问题
- 汇总关键统计信息（群组规模、日期范围、可用指标）

### 第 2 步：生成定量分析
- 计算群组留存率和参与度趋势
- 识别留存曲线、流失模式和异常情况
- 计算不同群组的功能采用率
- 计算环比变化或相邻周期变化
- 根据请求，使用 pandas 和 numpy 生成 Python 分析脚本

### 第 3 步：创建可视化
- 生成留存热力图（群组与时间段）
- 创建展示群组变化进程的折线图
- 构建功能采用情况对比图
- 可视化流失节点和参与度趋势
- 输出为交互式图表或静态图像

### 第 4 步：识别洞察与模式
- 发现一个或多个显著模式：
  - 特定群组的早期流失
  - 后期参与度变化
  - 功能采用集群
  - 季节性或时间趋势
- 突出显示令人意外的发现和偏差
- 比较群组表现以建立基准

### 第 5 步：建议后续研究
- 推荐定性研究方法：
  - 对流失用户进行有针对性的用户访谈
  - 对高参与度群组开展功能使用情况调查
  - 回放关键交互模式的用户会话
  - 对高留存群组与低留存群组进行赢单/失单分析
- 设计后续定量研究
- 建议开展 A/B 测试或功能实验

## 使用示例

**示例 1：上传 CSV 数据**
```
Upload cohort_engagement.csv with columns: cohort_month, weeks_active,
user_id, feature_x_usage, engagement_score

Request: "Analyze retention patterns and identify why Q4 2025 cohorts
underperform compared to Q3"
```

**示例 2：描述数据格式**
```
"I have monthly user cohorts from Jan-Dec 2025. Each row shows:
cohort date, user ID, purchase frequency, and support tickets.
Analyze which cohorts show best long-term retention."
```

**示例 3：功能采用分析**
```
Upload feature_usage.xlsx with cohort adoption data.

Request: "Compare adoption curves for our new feature across cohorts.
Which cohorts adopted fastest? Any patterns?"
```

## 核心能力

- **数据读取**：导入 CSV、Excel、JSON 和 SQL 查询结果
- **留存分析**：计算并可视化随时间变化的留存率
- **群组比较**：比较不同群组之间的指标
- **异常检测**：标记异常模式或流失情况
- **Python 脚本**：生成可复用的分析代码，用于持续分析
- **可视化**：创建热力图、图表和交互式仪表板
- **研究设计**：建议有针对性的后续研究和访谈方法
- **统计摘要**：提供定量指标和相关性分析

## 获得最佳结果的技巧

1. **包含时间维度**：提供跨多个时间段的数据
2. **明确定义同期群**：明确同期群的分组方式（注册月份、功能发布日期等）
3. **提供背景信息**：说明该期间内的产品变更、发布或事件
4. **使用多个指标**：包括留存率、参与度、功能使用情况、收入等
5. **提供充足数据**：至少包含 3-4 个同期群，以便识别有意义的模式
6. **指定所需输出**：请求可视化图表、Python 脚本或研究建议

## 输出格式

你将收到：
- **数据摘要**：同期群概览和数据质量评估
- **定量分析结果**：关键指标、留存率和趋势分析
- **可视化图表**：展示留存曲线和采用模式的图表
- **模式识别**：从数据中发现的 2-3 项重要洞察
- **研究建议**：具体的定性和定量后续研究建议
- **分析脚本**（如有要求）：用于可复现分析的 Python 代码
- **后续步骤**：根据分析结果确定优先级的行动

---

### 延伸阅读

- [同期群分析入门：如何减少用户流失并做出更好的产品决策](https://www.productcompass.pm/p/cohort-analysis)
- [产品分析实战指南：面向产品经理的 AARRR、HEART、同期群与漏斗分析](https://www.productcompass.pm/p/the-product-analytics-playbook-aarrr)
- [你正在追踪正确的指标吗？](https://www.productcompass.pm/p/are-you-tracking-the-right-metrics)