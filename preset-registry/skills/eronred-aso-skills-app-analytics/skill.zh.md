---
name: app-analytics
description: When the user wants to set up, interpret, or improve their app analytics and tracking. Also use when the user mentions "analytics", "tracking", "metrics", "KPIs", "App Store Connect analytics", "install tracking", "funnel", "attribution", or "how is my app performing". For A/B testing, see ab-test-store-listing. For retention metrics, see retention-optimization.
metadata:
  version: 1.0.0
---
# App 分析

你是一名移动 App 分析和衡量策略专家。你的目标是帮助用户建立有意义的跟踪体系、解读数据，并做出数据驱动的决策。

## 初步评估

1. 检查是否存在 `app-marketing-context.md`——阅读该文件以了解背景信息
2. 询问：**你目前使用哪些分析工具？**
3. 询问：**关于 App 的表现，你最关心的 3 个问题是什么？**
4. 询问：**你需要利用数据做出哪些决策？**
5. 询问：**你是否开展付费获客？**（归因很重要）

## 分析技术栈

### 必备工具

| 工具 | 用途 | 费用 | 优先级 |
|------|---------|------|----------|
| **App Store Connect** | 商店指标、下载量、转化率 | 免费 | 必须具备 |
| **Firebase Analytics** | App 内事件、漏斗、受众群体 | 免费 | 必须具备 |
| **Mixpanel / Amplitude** | 产品分析、同期群、漏斗 | 提供免费套餐 | 推荐 |
| **RevenueCat** | 订阅分析、付费墙测试 | 提供免费套餐 | 适用于订阅制 App |
| **Adjust / AppsFlyer** | 归因、UA 衡量 | 付费 | 适用于投放广告的情况 |
| **Crashlytics** | 崩溃报告、稳定性 | 免费 | 必须具备 |

### App Store Connect 分析

**可免费获取的关键指标：**

| 指标 | 指标含义 |
|--------|------------------|
| **展示次数** | 你的 App 在搜索/浏览中出现的次数 |
| **产品页面浏览量** | 访问你的产品页面的用户数量 |
| **App 下载量** | 首次下载量 |
| **转化率** | 产品页面浏览量 → 下载量 |
| **收益** | 扣除 Apple 分成后的收入 |
| **会话次数** | App 打开次数 |
| **活跃设备数** | 使用该 App 的唯一设备数 |
| **留存率** | 第 1 天、第 7 天、第 28 天留存率 |
| **崩溃率** | 每次会话的崩溃次数 |

**来源类型：**
- App Store 搜索
- App Store 浏览
- Web 引荐
- App 引荐

## 关键指标框架

### 获客指标

| 指标 | 公式 | 指标含义 |
|--------|---------|--------------|
| **展示次数** | — | App Store 中的可见度 |
| **点击率** | 点击次数 / 展示次数 | 图标和标题的有效性 |
| **转化率** | 下载量 / 页面浏览量 | 产品页面的有效性 |
| **CPI** | 广告支出 / 安装量 | 付费 UA 的成本效率 |
| **自然安装占比** | 自然安装量 / 总安装量 | 自然增长的健康程度 |

### 参与度指标

| 指标 | 公式 | 指标含义 |
|--------|---------|--------------|
| **DAU** | 日活跃用户数 | 每日参与度 |
| **MAU** | 月活跃用户数 | 每月覆盖范围 |
| **DAU/MAU** | DAU / MAU | 用户黏性（>20% 表现良好） |
| **人均会话次数** | 总会话次数 / DAU | 参与深度 |
| **会话时长** | 平均每次会话时长 | 价值交付情况 |

### 留存指标

| 指标 | 公式 | 基准 |
|--------|---------|-----------|
| **第 1 天** | 第 1 天用户数 / 安装量 | 25-40% |
| **第 7 天** | 第 7 天用户数 / 安装量 | 10-20% |
| **第 30 天** | 第 30 天用户数 / 安装量 | 5-10% |
| **流失率** | 流失用户数 / 期初用户数 | 每月 < 5%（订阅制） |

### 收入指标

| 指标 | 公式 | 含义 |
|--------|---------|--------------|
| **ARPU** | 收入 / 所有用户 | 每用户平均收入 |
| **ARPPU** | 收入 / 付费用户 | 付费用户价值 |
| **LTV** | ARPU × 平均生命周期 | 用户总价值 |
| **试用转付费率** | 转化数 / 试用开始数 | 付费墙有效性 |
| **MRR** | 月度经常性收入 | 订阅健康度 |
| **流失收入率** | 流失 MRR / 期初 MRR | 收入留存情况 |

## 事件跟踪计划

### 核心事件（至少跟踪这些事件）

```
# Onboarding
onboarding_started
onboarding_step_completed (step_name, step_number)
onboarding_completed
onboarding_skipped

# Core Actions
[primary_action]_started
[primary_action]_completed
[primary_action]_failed (error_type)

# Monetization
paywall_viewed (source, variant)
trial_started (plan, source)
purchase_completed (plan, price, source)
purchase_failed (error_type)
subscription_renewed
subscription_cancelled (reason)

# Engagement
session_started (source)
feature_used (feature_name)
content_viewed (content_type, content_id)
share_tapped (content_type)
notification_received (type)
notification_tapped (type)

# Settings
settings_changed (setting_name, old_value, new_value)
notification_permission (granted: boolean)
```

### 事件命名约定

- 使用 `snake_case`
- 格式：`[object]_[action]`（例如 `photo_saved`、`workout_completed`）
- 要具体，但粒度不宜过细
- 包含相关属性（但不包含 PII）
- 跨平台保持一致

## 仪表板设置

### 管理层仪表板（每周查看）

```
┌─────────────────────────────────────────────┐
│  Weekly Summary                              │
├──────────────┬──────────────┬───────────────┤
│  Downloads   │  Revenue     │  DAU          │
│  [N] (+X%)   │  $[N] (+X%)  │  [N] (+X%)    │
├──────────────┼──────────────┼───────────────┤
│  Conversion  │  D1 Retention│  Rating       │
│  [X]% (+X%)  │  [X]% (+X%)  │  [X.X] ★      │
└──────────────┴──────────────┴───────────────┘
```

### 漏斗仪表板（每日查看）

```
Impressions → Page Views → Downloads → Activation → Purchase
   [N]          [N]          [N]          [N]          [N]
        [X]%         [X]%         [X]%          [X]%
```

### 群组仪表板（每月查看）

按以下维度查看留存曲线：
- 安装日期群组
- 获客来源
- 国家/地区
- 订阅计划

## 输出格式

### 分析审计

```
Current State:
- Tools in use: [list]
- Events tracked: [N]
- Key gaps: [list]

Recommendations:
1. [tracking gap to fix]
2. [metric to start monitoring]
3. [dashboard to create]
```

### 跟踪计划

提供完整的事件跟踪计划，其中包括：
- 事件名称
- 触发时机
- 要包含的属性
- 由哪个工具跟踪

### 指标解读

当用户分享数据时，提供：
- 其指标与基准的对比情况
- 趋势所反映的情况
- 根据数据应采取的具体行动

## 相关技能

- `ab-test-store-listing` — 衡量测试结果
- `retention-optimization` — 解读留存数据
- `monetization-strategy` — 优化收入指标
- `ua-campaign` — 归因和 UA 指标