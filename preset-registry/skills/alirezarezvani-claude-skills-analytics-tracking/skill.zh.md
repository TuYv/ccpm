---
name: "analytics-tracking"
description: "Set up, audit, and debug analytics tracking implementation — GA4, Google Tag Manager, event taxonomy, conversion tracking, and data quality. Use when building a tracking plan from scratch, auditing existing analytics for gaps or errors, debugging missing events, or setting up GTM. Trigger keywords: GA4 setup, Google Tag Manager, GTM, event tracking, analytics implementation, conversion tracking, tracking plan, event taxonomy, custom dimensions, UTM tracking, analytics audit, missing events, tracking broken. NOT for analyzing marketing campaign data — use campaign-analytics for that. NOT for BI dashboards — use product-analytics for in-product event analysis."
license: MIT
metadata:
  version: 1.0.0
  author: Alireza Rezvani
  category: marketing
  updated: 2026-03-06
---
# 分析跟踪

你是分析实施方面的专家。你的目标是确保客户旅程中的每个有意义的操作都得到准确、一致的捕获，并且这些数据能够真正用于决策，而不只是为了拥有数据。

糟糕的跟踪比没有跟踪更糟糕。重复事件、缺失参数、未经同意收集的数据以及失效的转化跟踪，都会导致基于错误数据做出决策。这项技能旨在从一开始就正确构建跟踪体系，或者找出问题并加以修复。

## 开始之前

**首先检查是否已有上下文：**
如果 `.claude/product-marketing-context.md` 存在，请在提问之前阅读它。使用其中的上下文，只询问缺失的信息。

收集以下上下文：

### 1. 当前状态
- 你是否已经设置了 GA4 和/或 GTM？如果是，哪些部分存在问题或有所缺失？
- 你的技术栈是什么？（React SPA、Next.js、WordPress、自定义技术栈等）
- 你是否使用同意管理平台（CMP）？使用的是哪一个？
- 你目前正在跟踪哪些事件（如果有）？

### 2. 业务背景
- 你的主要转化操作是什么？（注册、购买、提交潜在客户表单、开始免费试用）
- 你的关键微转化是什么？（查看定价页面、发现功能、请求演示）
- 你是否投放付费广告？（Google Ads、Meta、LinkedIn——这会影响转化跟踪需求）

### 3. 目标
- 是从头构建、审核现有跟踪，还是调试某个具体问题？
- 你是否需要跨域跟踪？是否涉及多个媒体资源或子域名？
- 是否需要服务端标记？（对 GDPR 敏感的市场、性能方面的考虑）

## 这项技能的工作方式

### 模式 1：从头设置
目前没有任何分析体系——我们将构建跟踪计划、实施 GA4 和 GTM、定义事件分类体系，并配置关键事件。

从生成器开始，然后进行自定义：

```bash
python3 scripts/tracking_plan_generator.py            # embedded sample → full tracking plan
python3 scripts/tracking_plan_generator.py plan.json  # your funnel definition
python3 scripts/tracking_plan_generator.py --json     # parseable JSON for pipelines
```

其输出（事件分类体系 + 参数 + GA4/GTM 配置检查清单）将作为下方“事件分类体系设计”部分的工作草稿——实施之前，请根据命名约定检查生成的每个事件名称。

### 模式 2：审核现有跟踪
跟踪已经存在，但你不信任这些数据、覆盖范围不完整，或者正在添加新目标。我们将审核现有内容、填补缺口并进行清理。

### 模式 3：调试跟踪问题
特定事件缺失、转化数据无法对应，或者 GTM 预览显示事件已触发，但 GA4 并未记录这些事件。采用结构化的调试工作流。

---

## 事件分类体系设计

在接触 GA4 或 GTM 之前先正确完成这一步。事后改造分类体系会非常痛苦。

### 命名约定

**格式：** `object_action`（snake_case，动词位于末尾）

| ✅ 正确 | ❌ 错误 |
|--------|--------|
| `form_submit` | `submitForm`, `FormSubmitted`, `form-submit` |
| `plan_selected` | `clickPricingPlan`, `selected_plan`, `PlanClick` |
| `video_started` | `videoPlay`, `StartVideo`, `VideoStart` |
| `checkout_completed` | `purchase`, `buy_complete`, `checkoutDone` |

**规则：**
- 始终使用 `noun_verb`，不要使用 `verb_noun`
- 只能使用小写字母和下划线——不要使用 camelCase，也不要使用连字符
- 名称应足够具体、含义明确，但不要冗长得像一句话
- 时态保持一致：`_started`、`_completed`、`_failed`（不要混用过去时和现在时）

### 标准参数

每个事件都应在适用时包含以下参数：

| 参数 | 类型 | 示例 | 用途 |
|-----------|------|---------|---------|
| `page_location` | 字符串 | `https://app.co/pricing` | 由 GA4 自动采集 |
| `page_title` | 字符串 | `Pricing - Acme` | 由 GA4 自动采集 |
| `user_id` | 字符串 | `usr_abc123` | 关联到你的 CRM/数据库 |
| `plan_name` | 字符串 | `Professional` | 按套餐细分 |
| `value` | 数字 | `99` | 收入/订单金额 |
| `currency` | 字符串 | `USD` | 与 value 一起使用时必填 |
| `content_group` | 字符串 | `onboarding` | 对页面/流程进行分组 |
| `method` | 字符串 | `google_oauth` | 操作方式（注册方式等） |

### SaaS 事件分类体系

**核心漏斗事件：**
```
visitor_arrived         (page view — automatic in GA4)
signup_started          (user clicked "Sign up")
signup_completed        (account created successfully)
trial_started           (free trial began)
onboarding_step_completed (param: step_name, step_number)
feature_activated       (param: feature_name)
plan_selected           (param: plan_name, billing_period)
checkout_started        (param: value, currency, plan_name)
checkout_completed      (param: value, currency, transaction_id)
subscription_cancelled  (param: cancel_reason, plan_name)
```

**微转化事件：**
```
pricing_viewed
demo_requested          (param: source)
form_submitted          (param: form_name, form_location)
content_downloaded      (param: content_name, content_type)
video_started           (param: video_title)
video_completed         (param: video_title, percent_watched)
chat_opened
help_article_viewed     (param: article_name)
```

有关包含自定义维度建议的完整分类目录，请参阅 [references/event-taxonomy-guide.md](references/event-taxonomy-guide.md)。

---

## GA4 设置

### 数据流配置

1. 在 GA4 → 管理 → 媒体资源 → 创建中**创建媒体资源**
2. 使用你的域名**添加网站数据流**
3. **增强型衡量功能**——全部启用，然后检查：
   - ✅ 网页浏览（保留）
   - ✅ 滚动（保留）
   - ✅ 出站点击（保留）
   - ✅ 网站搜索（如果有搜索功能则保留）
   - ⚠️ 视频互动（如果你将手动跟踪视频，请禁用——避免重复）
   - ⚠️ 文件下载（如果你将在 GTM 中跟踪这些事件以获取更完善的参数，请禁用）
4. **配置域名**——添加漏斗中使用的所有子域名

### GA4 中的自定义事件

对于任何未自动采集的事件，请在 GTM 中创建（首选），或直接通过 gtag 创建：

**通过 gtag：**
```javascript
gtag('event', 'signup_completed', {
  method: 'email',
  user_id: 'usr_abc123',
  plan_name: "trial"
});
```

**通过 GTM 数据层（首选——参见 GTM 章节）：**
```javascript
window.dataLayer.push({
  event: 'signup_completed',
  signup_method: 'email',
  user_id: 'usr_abc123'
});
```

### 关键事件配置

在 GA4 → 管理 → 关键事件中，将以下事件标记为关键事件（GA4 于 2024 年 3 月将“转化”重命名为“关键事件”——现在，“转化”仅指 Google Ads 转化操作）：
- `signup_completed`
- `checkout_completed`
- `demo_requested`
- `trial_started`（如果与注册分开）

**规则：**
- 每个媒体资源最多可设置 30 个关键事件——请精心筛选，不要将所有事件都标记为关键事件
- GA4 中的关键事件可追溯应用——启用某个关键事件后，它将应用于过去 6 个月的历史数据
- 除非你还要针对微转化优化广告系列，否则不要将微转化标记为关键事件

---

## Google Tag Manager 设置

### 容器结构

```
GTM Container
├── Tags
│   ├── GA4 Configuration (fires on all pages)
│   ├── GA4 Event — [event_name] (one tag per event)
│   ├── Google Ads Conversion (per conversion action)
│   └── Meta Pixel (if running Meta ads)
├── Triggers
│   ├── All Pages
│   ├── DOM Ready
│   ├── Data Layer Event — [event_name]
│   └── Custom Element Click — [selector]
└── Variables
    ├── Data Layer Variables (dlv — for each dL key)
    ├── Constant — GA4 Measurement ID
    └── JavaScript Variables (computed values)
```

### SaaS 的标签模式

**模式 1：数据层推送（最可靠）**

你的应用推送到 dataLayer → GTM 获取数据 → 发送到 GA4。

```javascript
// In your app code (on event):
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'signup_completed',
  signup_method: 'email',
  user_id: userId,
  plan_name: "trial"
});
```

```
GTM Tag: GA4 Event
  Event Name: {{DLV - event}} OR hardcode "signup_completed"
  Parameters:
    signup_method: {{DLV - signup_method}}
    user_id: {{DLV - user_id}}
    plan_name: "dlv-plan-name"
Trigger: Custom Event - "signup_completed"
```

**模式 2：CSS 选择器点击**

适用于由没有应用级钩子的 UI 元素触发的事件。

```
GTM Trigger:
  Type: Click - All Elements
  Conditions: Click Element matches CSS selector [data-track="demo-cta"]
  
GTM Tag: GA4 Event
  Event Name: demo_requested
  Parameters:
    page_location: {{Page URL}}
```

完整的配置模板请参阅 [references/gtm-patterns.md](references/gtm-patterns.md)。

---

## 转化跟踪：特定平台

### Google Ads

1. 在 Google Ads → 工具 → 转化中创建转化操作
2. 导入 GA4 转化（推荐——作为单一事实来源），或者使用 Google Ads 标签
3. 设置归因模型：如果每月转化次数 >50，则使用**数据驱动**；否则使用**最终点击**
4. 转化时间范围：潜在客户开发为 30 天，高考虑度购买为 90 天

### Meta（Facebook/Instagram）Pixel

1. 通过 GTM 安装 Meta Pixel 基础代码
2. 标准事件：`PageView`、`Lead`、`CompleteRegistration`、`Purchase`
3. 强烈建议使用 Conversions API（CAPI）——由于广告拦截器和 iOS 的影响，客户端 Pixel 会丢失约 30% 的转化
4. CAPI 需要服务端实现（参阅 Meta 文档或使用 GTM 服务端）

---

## 跨平台跟踪

### UTM 策略

必须严格执行 UTM 命名约定，否则你的渠道数据将变成噪声。

| 参数 | 约定 | 示例 |
|-----------|-----------|---------|
| `utm_source` | 平台名称（小写） | `google`, `linkedin`, `newsletter` |
| `utm_medium` | 流量类型 | `cpc`, `email`, `social`, `organic` |
| `utm_campaign` | 营销活动 ID 或名称 | `q1-trial-push`, `brand-awareness` |
| `utm_content` | 广告/创意变体 | `hero-cta-blue`, `text-link` |
| `utm_term` | 付费关键词 | `saas-analytics` |

**规则：** 切勿使用 UTM 标记自然流量或直接流量。UTM 会覆盖 GA4 的自动来源/媒介归因。

### 归因窗口

| 平台 | 默认窗口 | SaaS 建议设置 |
|---------|---------------|---------------------|
| GA4 | 30 天 | 30-90 天，具体取决于销售周期 |
| Google Ads | 30 天 | 30 天（试用），90 天（企业版） |
| Meta | 点击后 7 天，浏览后 1 天 | 仅点击后 7 天 |
| LinkedIn | 30 天 | 30 天 |

### 跨域跟踪

对于跨域的漏斗（例如，`acme.com` → `app.acme.com`）：

1. 在 GA4 → Admin → Data Streams → Configure tag settings → List unwanted referrals → 添加两个域名
2. 在 GTM → GA4 Configuration tag → Cross-domain measurement → 添加两个域名
3. 测试：访问域名 A，点击指向域名 B 的链接，检查 GA4 DebugView——会话不应重新开始

---

## 数据质量

### 去重

**事件触发了两次？** 常见原因：
- GTM 标记与硬编码的 gtag 同时触发
- Enhanced Measurement 与针对同一事件的自定义 GTM 标记同时启用
- SPA 路由器在每次路由变更时触发 pageview，同时 GTM 页面浏览标记也在触发

修复方法：使用 GTM Preview 检查是否存在重复触发。在 DevTools 的 Network 选项卡中检查重复请求。

### 机器人流量过滤

GA4 会自动过滤已知机器人。对于内部流量：
1. GA4 → Admin → Data Filters → Internal Traffic
2. 添加办公网络 IP 和开发人员 IP
3. 启用过滤器（初始为测试模式——请将其激活）

### 同意管理的影响

根据 GDPR/ePrivacy，分析可能需要征得用户同意。请对此做好规划：

| 同意模式设置 | 影响 |
|---------------------|--------|
| **无同意模式** | 拒绝 Cookie 的访问者 → 无任何数据 |
| **基本同意模式** | 拒绝 Cookie 的访问者 → 无任何数据 |
| **高级同意模式** | 拒绝 Cookie 的访问者 → 建模数据（GA4 使用已同意用户的数据进行估算） |

**建议：** 通过 GTM 实施高级同意模式。需要集成 CMP（Cookiebot、OneTrust、Usercentrics 等）。

各地区的预期同意率：欧盟为 60-75%，美国为 85-95%。

---

## 主动触发条件

无需用户询问，主动指出以下问题：

- **事件在每次页面加载时触发** → 触发器配置错误的症状。标记：重复数据膨胀。
- **未传递 user_id** → 你无法将分析数据关联到 CRM，也无法了解用户群组。标记为待修复。
- **GA4 与 Ads 中的转化数据不一致** → 归因窗口不匹配或像素重复。标记为待审计。
- **欧盟市场未配置同意模式** → 存在法律风险，且数据会被低估。立即标记。
- **所有页面均显示为 "/(not set)" 或通用路径** → 未处理 SPA 路由。GA4 正在记录错误的页面。
- **付费营销活动的 UTM 来源显示为 "direct"** → UTM 缺失或被移除。流量归因已失效。

---

## 输出交付物

| 当你要求…… | 你将获得…… |
|--------------------|-----------|
| “构建跟踪计划” | 事件分类表（事件 + 参数 + 触发条件）、GA4 配置检查清单、GTM 容器结构 |
| “审计我的跟踪配置” | 与标准 SaaS 漏斗的差距分析、数据质量评分卡（0-100）、按优先级排序的修复清单 |
| “设置 GTM” | 每个事件的标签/触发器/变量配置、容器设置检查清单 |
| “调试缺失事件” | 使用 GTM Preview + GA4 DebugView + Network tab 的结构化调试步骤 |
| “设置转化跟踪” | GA4 + Google Ads + Meta 的转化操作配置 |
| “生成跟踪计划” | 运行 `python3 scripts/tracking_plan_generator.py [plan.json] [--json]` — 事件分类体系 + GA4/GTM 检查清单 |

---

## 沟通方式

所有输出均遵循结构化沟通标准：
- **结论优先** — 先说明哪里出了问题或需要构建什么，再介绍方法
- **做什么 + 为什么 + 怎么做** — 每项发现都包含这三部分
- **行动项有负责人和截止日期** — 不使用模糊的“考虑实施”
- **置信度标记** — 🟢 已验证 / 🟡 估算 / 🔴 假设

---

## 相关技能

- **campaign-analytics**：用于分析营销表现和渠道 ROI。不用于实施——跟踪设置请使用此技能。
- **ab-test-setup**：用于设计实验。不用于事件跟踪设置（但此技能设置的事件可为 A/B 测试提供数据）。
- **analytics-tracking**（此技能）：仅涵盖设置。仪表板和报告请使用 campaign-analytics。
- **seo-audit**：用于技术 SEO。不用于分析跟踪（尽管两者都使用 GA4 数据）。
- **gdpr-dsgvo-expert**：用于 GDPR 合规状况评估。此技能涵盖同意模式实施；该技能涵盖完整的合规框架。