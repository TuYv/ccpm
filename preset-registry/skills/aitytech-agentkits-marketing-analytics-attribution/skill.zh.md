---
name: analytics-attribution
version: "1.0.0"
brand: AgentKits Marketing by AityTech
category: core
difficulty: advanced
description: Performance measurement, attribution modeling, and marketing ROI analysis. Use when setting up tracking, analyzing campaign performance, building attribution models, or creating marketing reports.
triggers:
  - analytics
  - attribution
  - tracking
  - ROI
  - CAC
  - LTV
  - dashboard
  - reporting
  - conversion tracking
  - marketing metrics
prerequisites:
  - marketing-fundamentals
related_skills:
  - ab-test-setup
  - paid-advertising
agents:
  - project-manager
  - researcher
mcp_integrations:
  optional:
    - google-analytics
    - google-search-console
success_metrics:
  - tracking_accuracy
  - attribution_confidence
---
# 分析与归因

为数据驱动的营销决策进行绩效衡量与归因建模。

## 语言与质量标准

**关键要求**：使用与用户相同的语言回复。如果用户使用越南语，则使用越南语回复。如果用户使用西班牙语，则使用西班牙语回复。

**标准**：提高 Token 效率，为简洁可牺牲语法，最后列出尚未解决的问题。

---

## 何时使用此技能

在以下场景中应用分析专业知识：
- 设置营销跟踪与衡量
- 分析营销活动或渠道表现
- 构建归因模型
- 创建仪表板和报告
- 计算营销 ROI 和 CAC/LTV
- 排查数据差异

## 核心概念

### 分析框架

**维度**（按什么来衡量）：
- 渠道、营销活动、来源/媒介
- 设备、地域、时间段
- 受众细分、用户画像
- 内容类型、落地页

**指标**（衡量什么）：
- 流量：会话数、用户数、页面浏览量
- 互动：网站停留时间、跳出率、每次会话页数
- 转化：目标完成次数、转化率
- 收入：交易价值、ROAS、ROI
- 成本：CPC、CPL、CAC

### 关键营销报告

| 报告 | 回答的问题 | 频率 |
|--------|-------------------|-----------|
| 获客 | 访客来自哪里？ | 每周 |
| 行为 | 访客在网站上做什么？ | 每周 |
| 转化 | 访客是否完成目标？ | 每日 |
| 归因 | 是什么促成了转化？ | 每月 |
| 漏斗 | 访客在哪里流失？ | 每周 |
| 队列 | 各细分群体随时间推移表现如何？ | 每月 |

### 归因模型

| 模型 | 功劳分配 | 最适用于 |
|-------|-------------------|----------|
| 最终点击 | 100% 分配给最终触点 | 短周期、直接响应 |
| 首次点击 | 100% 分配给首次触点 | 品牌认知、TOFU |
| 线性 | 在所有触点间平均分配 | 了解完整用户旅程 |
| 时间衰减 | 越接近转化的触点分配越多 | 长销售周期 |
| 基于位置 | 首次-中间-最终按 40/20/40 分配 | 平衡视角 |
| 数据驱动 | 基于 ML 进行分配 | 高数据量、成熟的营销项目 |

### 按漏斗阶段划分的营销 KPI

**TOFU（认知）**
- 展示量、触达人数、流量
- CPM、每位访客成本
- 品牌搜索量

**MOFU（考虑）**
- 潜在客户、MQL、互动
- CPL、每个 MQL 的成本
- 内容下载量、网络研讨会注册量

**BOFU（决策）**
- SQL、销售机会、客户
- CAC、每个销售机会的成本
- 演示申请、试用注册

**留存**
- NPS、留存率、流失率
- LTV、扩展收入
- 推荐、品牌拥护

## 最佳实践

### 卓越设置
1. **UTM 规范**：所有营销活动采用一致的命名约定
2. **目标层级**：主要转化 > 次要转化 > 微转化
3. **跨域跟踪**：为结账/支付流程进行正确设置
4. **事件分类体系**：为自定义事件采用清晰的命名

### 卓越报告
1. **始终提供背景**：绝不在缺少比较的情况下报告数字（与目标相比、与上一周期相比）
2. **以行动为导向**：每项洞察都应提出一项行动建议
3. **可视化**：使用合适的图表类型（趋势=折线图，比较=柱状图）
4. **细分**：按有意义的维度进行拆分

### 归因卓越实践
1. **窗口匹配**：归因窗口与销售周期相匹配
2. **模型选择**：根据营销成熟度选择模型
3. **多触点可见性**：跟踪完整旅程，而非仅关注最后一次触点
4. **线下整合**：纳入电话、活动和直接销售

## 智能体集成

| 智能体 | 如何使用此技能 |
|-------|------------------------|
| `researcher` | 汇总绩效数据和竞争基准 |
| `lead-qualifier` | 分析漏斗转化和潜在客户来源质量 |
| `planner` | 根据渠道 ROI 分配预算 |
| `project-manager` | 跟踪营销活动绩效 |

## 应避免的反模式

| 反模式 | 错误原因 | 应改为 |
|--------------|----------------|-----------------|
| 只看虚荣指标 | 展示次数 ≠ 实际影响 | 聚焦转化指标 |
| 最后点击偏差 | 忽略认知阶段的触点 | 使用多触点归因 |
| 没有对照组 | 无法证明因果关系 | 尽可能进行 A/B 测试 |
| 数据孤岛 | 无法了解全貌 | 整合 CRM 和分析数据 |
| 报告缺乏行动方案 | 浪费时间和注意力 | 加入建议 |

## 工作流集成

- `crm-workflow.md` - 潜在客户阶段定义、评分阈值
- `sales-workflow.md` - SQL 标准、交易推进速度指标

## 相关命令

- `/report/weekly` - 每周绩效报告
- `/report/monthly` - 每月战略报告
- `/checklist/analytics-monthly` - 每月分析审查
- `/analytics/roi` - 营销活动 ROI 计算
- `/analytics/funnel` - 漏斗绩效分析

## 参考资料

- `references/google-analytics.md` - GA4 设置与使用
- `references/search-console.md` - SEO 绩效跟踪
- `references/attribution-models.md` - 归因模型深入解析
- `references/dashboards.md` - 报告最佳实践
- `references/reporting-templates.md` - 面向客户的报告模板