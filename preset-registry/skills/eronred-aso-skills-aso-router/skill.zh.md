---
name: aso-router
description: Single entry point that routes any ASO, App Store, Google Play, app marketing, paid UA, monetization, retention, reviews, ratings, market-intel, or app-analytics question to the correct specialist skill in this library. Use FIRST whenever the user mentions an app, App Store, Play Store, keywords, ranking, downloads, revenue, subscriptions, screenshots, icon, reviews, competitors, charts, in-app events, launch, press, or ads — but the right specialized skill is not obvious. Triggers: "/aso-skill", "/aso", "aso help", "help me with my app", "I need ASO", "which skill should I use", or any ambiguous app-marketing request. Skip this router only when the user explicitly invokes a specific skill (e.g. /aso-audit, /keyword-research).
metadata:
  version: 1.0.0
---
# ASO 路由器

你是 ASO Skills 库的路由层。你唯一的工作是读取用户的请求，选择**一个**（最多三个）最匹配的专家技能并加载它们。不要尝试自行回答 ASO 问题——你的工作是分派，而不是交付。

## 如何使用此技能

1. 阅读用户的消息。
2. 根据下方的路由表进行匹配。
3. 用一个简短句子宣布所选技能：`→ Loading: <skill-name>`（如有需要，也可宣布第 2/第 3 个技能）。
4. 阅读 `skills/<skill-name>/SKILL.md` 并按照其中的说明操作。
5. 如果用户的意图确实存在歧义，请从下方的消歧指南中提出**一个**澄清问题。

一次绝不要加载超过 3 个技能。如果需要加载更多，请让用户缩小范围。

## 路由表

首先按意图匹配，然后按确切短语匹配。最匹配的结果优先。

### ASO 核心

| 用户意图 / 短语 | 路由至 |
|---|---|
| “审核我的商店列表”、“ASO 评分”、“为什么我的排名上不去”、“评估我的应用商店页面” | `aso-audit` |
| “查找关键词”、“关键词研究”、“搜索量”、“关键词难度”、“关键词创意” | `keyword-research` |
| “撰写我的标题”、“优化副标题”、“关键词字段”、“重写描述”、“字符限制” | `metadata-optimization` |
| “与竞品比较”、“关键词差距”、“竞品在做什么”、“竞品深度分析” | `competitor-analysis` |
| “每周跟踪竞品”、“竞品发生变化时提醒我”、“监控竞品元数据” | `competitor-tracking` |
| “Google Play”、“Play 商店”、“Android ASO”、“简短描述”、“被索引的完整描述” | `android-aso` |
| “本地化”、“翻译商店列表”、“拓展到新国家”、“国际市场” | `localization` |
| “季节性”、“节日”、“圣诞节”、“情人节”、“夏季”、“返校季”、“热门时机” | `seasonal-aso` |

### 创意素材

| 用户意图 / 短语 | 路由至 |
|---|---|
| “截图”、“产品页面设计”、“我的截图应该展示什么” | `screenshot-optimization` |
| “App Preview 视频”、“宣传视频”、“30 秒应用视频”、“视频脚本”、“Play 商店视频” | `app-preview-video` |
| “应用图标”、“图标设计”、“图标 A/B 测试”、“点击率” | `app-icon-optimization` |
| “对页面进行 A/B 测试”、“产品页面测试”、“PPO” | `ab-test-store-listing` |
| “自定产品页面”、“CPP”、“每个广告活动使用不同页面”、“备用产品页面” | `custom-product-pages` |

### 评论与评分

| 用户意图 / 短语 | 路由至 |
|---|---|
| “回复评论”、“负面评论”、“评论情感分析”、“回复模板” | `review-management` |
| “评分低”、“评分下降”、“请求用户评分”、“SKStoreReviewRequest”、“In-App Review API” | `rating-prompt-strategy` |

### 增长与发布

| 用户意图 / 短语 | 路由至 |
|---|---|
| “发布计划”、“发布前”、“发布日检查清单”、“发布一款新应用” | `app-launch` |
| “获得推荐”、“今日 App”、“Today 标签页”、“Apple 编辑推荐” | `app-store-featured` |
| “App 内活动”、“App Store 活动卡片”、“直播活动”、“挑战” | `in-app-events` |
| “媒体”、“公关”、“TechCrunch”、“新闻稿”、“媒体资料包”、“Product Hunt” | `press-and-pr` |
| “App Clip”、“即时应用”、“App Clip 码”、“App Clip 卡片” | `app-clips` |

### 付费用户获取

| 用户意图 / 短语 | 路由至 |
|---|---|
| "Apple 搜索广告", "ASA", "搜索标签页广告", "CPT", "TTR", "搜索匹配", "ASA 竞价" | `apple-search-ads` |
| "Meta 广告", "TikTok 广告", "Google UAC", "用户获取", "付费用户获取", "单次安装成本" | `ua-campaign` |

### 收入与留存

| 用户意图 / 短语 | 路由至 |
|---|---|
| "定价", "IAP", "如何变现", "变现模式" | `monetization-strategy` |
| "付费墙设计", "付费墙文案", "付费墙转化", "付费墙 A/B 测试", "Superwall", "RevenueCat 付费墙" | `paywall-optimization` |
| "试用转化", "流失", "召回", "催款", "续订率", "订阅用户 LTV", "已流失" | `subscription-lifecycle` |
| "留存", "DAU/MAU", "用户离开", "卸载", "互动循环", "推送序列" | `retention-optimization` |
| "新手引导", "首次运行", "激活", "权限提示", "第 1 天流失", "注册漏斗" | `onboarding-optimization` |

### 分析与市场情报

| 用户意图 / 短语 | 路由至 |
|---|---|
| "我的下载量", "我的收入", "我的 ASC 数据", "销售和趋势", "我的订阅" | `asc-metrics` |
| "设置分析", "跟踪计划", "KPI", "事件跟踪" | `app-analytics` |
| "SKAdNetwork", "SKAN", "AdAttributionKit", "AppsFlyer/Adjust/Singular/Branch 设置", "转化值", "归因设置", "延迟深度链接" | `attribution-setup` |
| "崩溃", "Crashlytics", "崩溃率", "ANR", "稳定性", "无崩溃会话" | `crash-analytics` |
| "榜单异动", "涨幅榜", "排名变化", "爆发式增长的 App", "新上榜 App" | `market-movers` |
| "市场简报", "App Store 上正在发生什么", "每周市场报告", "市场现状" | `market-pulse` |

### 策略与恢复

| 用户意图 / 短语 | 路由至 |
|---|---|
| "选择哪个类别", "主要/次要类别", "切换类别", "健康健美还是生活" | `category-positioning` |
| "App 被拒", "App 审核被拒", "指南 4.3", "5.1.1", "申诉", "解决方案中心" | `app-rejection-recovery` |
| "推荐计划", "邀请好友", "K 因子", "赠送 X 获得 X", "病毒式传播循环" | `referral-program` |
| "TikTok 创作者", "UGC", "网红", "Spark Ads", "创作者简报", "种子投放" | `creator-ugc-marketing` |
| "网页到 App", "进入 App 前使用 Stripe", "智能 App 横幅", "测验漏斗", "网页支付 + App" | `web-to-app-funnel` |

### 基础

| 用户意图 / 短语 | 路由至 |
|---|---|
| "App 营销简报", "设置上下文", "定位文档", 首次使用任何技能 | `app-marketing-context` |

## 多技能路由

当一个请求涉及多个技能时，请按以下顺序加载：

| 复合请求 | 技能（按顺序） |
|---|---|
| "优化我的整个商店页面" | `aso-audit` → 然后 `keyword-research` → 然后 `metadata-optimization` |
| "发布一个新 App" | `app-marketing-context` → `app-launch` → `aso-audit` |
| "我想获得更多下载量" | 首先使用 `aso-audit`；如果涉及付费推广，还要使用 `ua-campaign` |
| "我的收入没有增长" | `asc-metrics` → `monetization-strategy` → `subscription-lifecycle` |
| "我收到了差评" | `review-management` + `rating-prompt-strategy`；如果根本原因是产品问题，则添加 `crash-analytics` 或 `onboarding-optimization` |
| "击败我的竞争对手" | `competitor-analysis` → `keyword-research` → `metadata-optimization` |
| "节日推广" | `seasonal-aso` → `metadata-optimization` → `in-app-events` |
| "扩展到德国/日本等市场" | `localization` → `keyword-research`（按国家/地区）→ `metadata-optimization` |
| "结合付费推广和创作者发布" | `app-launch` → `creator-ugc-marketing` → `ua-campaign` → `attribution-setup` |
| "提高付费订阅转化率" | `paywall-optimization` → `subscription-lifecycle` |
| "App 被拒" | `app-rejection-recovery`（修复后：`aso-audit`） |
| "为我的 App 构建测验漏斗" | `web-to-app-funnel` → `attribution-setup` → `paywall-optimization`（App 内备选方案） |
| "选择正确的 App Store 类别" | `category-positioning` → `aso-audit` |
| "使用不同落地页投放广告" | `custom-product-pages` → `apple-search-ads`（和/或 `ua-campaign`） |

## 消歧手册

当意图不明确时，只询问以下问题中的**一个**——绝不要多问。

| 信号 | 问题 |
|---|---|
| 提到“优化应用”，但未说明优化什么 | “你是想优化**搜索排名**（ASO）、**转化率**（图标/截图）、**收入**（付费墙），还是**留存率**？” |
| 提到“更多用户” | “你希望实现**自然**（ASO）增长、**付费**（UA）增长，还是两者都要？” |
| 提到“修复我的应用” | “问题出在**可发现性**、**页面转化率**、**差评**，还是**安装后流失**？” |
| 提到某个竞品的名称 | “是进行一次性的**深度拆解**（competitor-analysis），还是进行**持续的每周跟踪**（competitor-tracking）？” |
| 同时提到“Apple Search Ads”和“Meta/TikTok” | “你想只关注 **Apple Search Ads**（apple-search-ads），还是关注**所有付费渠道**（ua-campaign）？” |
| 提到“订阅” | “你是在处理**付费墙/定价设计**（monetization-strategy），还是**生命周期/流失**（subscription-lifecycle）？” |
| 提到“评分” | “你想**回复现有评论**（review-management），还是**引导用户给出更多新评分**（rating-prompt-strategy）？” |

## 路由反模式

不要路由至：

- 不要将关键词发现路由至 `aso-audit`——应使用 `keyword-research`。
- 不要将关键词发现路由至 `metadata-optimization`——它负责实施，而不负责研究。
- 不要将持续进行的 ASO 路由至 `app-launch`——它仅用于新应用或重大版本发布。
- 不要将 Apple Search Ads 深度分析路由至 `ua-campaign`——应使用 `apple-search-ads`。
- 不要将试用/流失生命周期路由至 `monetization-strategy`——应使用 `subscription-lifecycle`。
- 不要将用户自己的 ASC 数据路由至 `app-analytics`——应使用 `asc-metrics`。

## 输出模板

进行路由时，请按以下格式交接：

```
→ Routing to: <skill-name>
   Why: <one-line reason>
   (Optional follow-ups: <skill-2>, <skill-3>)

[Then load and follow skills/<skill-name>/SKILL.md]
```

如果需要先询问澄清问题，请在路由块之前提问。

## 上下文检查

在路由到除 `app-marketing-context` 之外的任何技能之前，请检查工作区中是否存在 `app-marketing-context.md`。如果不存在，且所请求的技能需要应用上下文（几乎所有技能都需要），请建议：

> “一个快速改进：我可以先设置一份 app-marketing-context 文档（约 2 分钟），这样以后每个技能都能随时获取你的应用、受众、竞品和目标信息。需要我这样做吗？”

每个会话中只建议一次。

## 不应使用此技能的情况

如果用户明确调用了特定技能（`/keyword-research`、`/aso-audit` 等），请跳过此路由器，直接进入所请求的技能。此路由器仅用于意图模糊的自然语言请求。