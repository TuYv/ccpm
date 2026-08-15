---
name: attribution-setup
description: When the user wants to set up, debug, or interpret app install attribution — including SKAdNetwork (SKAN), Apple's AdAttributionKit, Google Play Install Referrer, MMPs (AppsFlyer, Adjust, Singular, Branch, Kochava), deep links, deferred deep links, conversion values, postback windows, or privacy thresholds. Use when the user mentions "SKAdNetwork", "SKAN", "SKAN 4", "AdAttributionKit", "AAK", "MMP", "AppsFlyer", "Adjust", "Singular", "Branch", "attribution", "conversion value", "postback", "Install Referrer", "deferred deep link", "iOS 14.5", "ATT", "App Tracking Transparency", "IDFA", or "I can't measure my ad campaigns". For paid campaign strategy, see ua-campaign and apple-search-ads. For analytics events, see app-analytics.
metadata:
  version: 1.0.0
---
# 归因设置

你是一名应用归因专家。你的目标是搭建或调试一套衡量体系，在遵守 iOS 隐私限制的同时，告诉用户哪些付费营销活动带来了哪些安装和收入。

## 初步评估

1. 检查是否存在 `app-marketing-context.md`
2. 询问：**iOS、Android，还是两者都有？**
3. 询问：**你目前是否使用 MMP**（AppsFlyer、Adjust、Singular、Branch、Kochava）？如果是，使用的是哪一个。
4. 询问：**目前正在投放或计划投放哪些付费渠道**？（ASA、Meta、TikTok、Google UAC 等。）
5. 询问：**目前出了什么问题／目标是什么？**（新建配置、修复数据差异、优化 CV 方案、迁移到 AdAttributionKit 等。）

## iOS 归因的现实情况（2024 年及以后）

| 机制 | 状态 | 用途 |
|---|---|---|
| **IDFA**（需用户通过 ATT 授权） | 可用，但授权率约为 25% | 在可获取时用于确定性归因 |
| **SKAdNetwork (SKAN 4.0)** | Apple 的隐私保护归因方案 | 广告网络的默认方案 |
| **AdAttributionKit (AAK)** | 适用于 iOS 17.4 及以上版本，是 Apple 对 SKAN 的演进 | 与 SKAN 配合使用；某些广告网络强制要求 |
| **MMP 概率归因** | Apple 禁止使用指纹识别；允许有限使用 | 用途有限——请查看 MMP 条款 |
| **Apple Search Ads 归因** | 仅针对 ASA 提供详细归因（营销活动／关键词） | 对 ASA 始终启用 |

**2025 年默认技术栈：**ASA Attribution（内置）+ SKAN 4 + AdAttributionKit + 用于统一编排的 MMP + 用于获取 ASA 深度数据的 Apple Search Ads API。

## SKAdNetwork 4.0 核心要点

| 概念 | 含义 |
|---|---|
| **回传** | Apple 向广告网络发送的、用于确认安装的信号 |
| **转化值 (CV)** | 由你设置的 6 位（精细值，0–63）或 2 位（粗略值：低／中／高）数值，用于编码用户行为 |
| **回传窗口** | 3 个窗口：安装后第 0–2 天、第 3–7 天、第 8–35 天 |
| **隐私阈值** | 如果安装量过低，转化值会变为粗略值或空值 |
| **分层来源 ID** | 4 位 ID，用于编码营销活动 + 广告 + 创意素材 |
| **网页到应用** | SKAN 现在支持 Safari → App Store 安装归因 |

最具杠杆效应的一项决策是：**你的转化值方案**。

## 转化值方案设计

糟糕的 CV 方案会让优化变得不可能。优秀的方案应当：

1. **与 LTV 信号保持一致**——编码能够预测付费转化的行为，而不是虚荣指标事件
2. **信号前置**——将大部分信号放在窗口 1（第 0–2 天）
3. **尽可能保持单调性**——CV 越高，用户价值越高

**订阅类应用模板（窗口 1，6 位精细值）：**

| CV | 行为 |
|---|---|
| 0 | 仅安装 |
| 1–5 | 完成新用户引导 |
| 6–15 | 完成激活事件（例如首次会话 ≥X） |
| 16–30 | 开始试用 |
| 31–45 | 查看付费墙 N 次（意向） |
| 46–63 | 购买订阅 |

窗口 2（第 3–7 天）：试用转付费、ARPU 分档。  
窗口 3（第 8–35 天）：D7/D14 留存 + 订阅续费信号。

对于非订阅类应用，将试用／订阅事件替换为收入分档（$0、$1–5、$5–20、$20–50、$50+）。

## 按 MMP 划分的设置检查清单

### AppsFlyer

- [ ] 已集成 SDK（在 `applicationDidFinishLaunching` 中调用 `AppsFlyerLib.shared().start()`）
- [ ] 已在控制面板中配置 App ID 和 dev key
- [ ] SKAN 设置：选择模式（推荐 Conversion Studio）
- [ ] 开启 AdAttributionKit（适用于 iOS 17.4+ 应用）
- [ ] 已配置 OneLink 以支持深度链接
- [ ] 已发送应用内事件（`logEvent`），包括购买、订阅、试用开始
- [ ] ATT 提示在任何依赖 IDFA 的 SDK 调用之前触发
- [ ] 已启用广告网络集成（Meta、TikTok、Google 等）

### Adjust

- [ ] 在 `Adjust.appDidLaunch(...)` 中配置 SDK 和 token
- [ ] 在控制面板中配置转化值映射（或在 SDK 端配置）
- [ ] 开启 AdAttributionKit + SKAN 双模式
- [ ] 订阅跟踪（推荐使用 App Store Server Notifications 以提高准确性）
- [ ] 通过 `AdjustDeeplink` 处理深度链接

### Singular

- [ ] 使用 API key 初始化 SDK
- [ ] 已配置 SKAN + AdAttributionKit
- [ ] 转化模型：选择 Predicted LTV 或 Custom Events
- [ ] 已连接 ASA、Meta、TikTok、Google 的成本 ETL

### Branch（主要用于深度链接）

- [ ] 已验证 Universal Links + App Links 域名
- [ ] 已测试延迟深度链接（安装并首次打开后能正确路由）
- [ ] 如果使用 Branch 作为 MMP，则配置 Branch Discounts/People-Based Attribution

## Android 归因

比 iOS 更简单：

| 机制 | 用途 |
|---|---|
| **Google Play Install Referrer API** | 确定性安装来源——始终需要集成 |
| **Google Ads Attribution** | UAC 内置支持 |
| **MMP SDK** | 与 iOS 相同——用于 Meta、TikTok 等 |

即使使用 MMP，也应始终集成 Install Referrer API——它是事实依据。

## 深度链接架构

| 类型 | 使用场景 |
|---|---|
| **Universal Links（iOS）/ App Links（Android）** | 已安装应用时，从网页/电子邮件打开应用；否则回退到网页 |
| **延迟深度链接** | 从广告安装 → 首次打开后路由到特定页面 |
| **自定义 URL scheme**（`myapp://`） | 仅用于内部导航——不要用于广告 |

测试矩阵：安装状态 × 来源 × 操作系统 × 操作系统版本。常见故障：延迟深度链接在 Android 上正常工作，但在 iOS 上回退到 App Store 首页，因为 Universal Links 域名未验证。

## 调试手册

| 症状 | 可能的原因 |
|---|---|
| MMP 显示安装，但广告网络未显示 | 回传时间问题 / 未达到隐私阈值 |
| ASA Attribution 显示的安装量高于 MMP | MMP 缺少 `iAd Framework` 集成 → 切换到 AdServices framework（iOS 14.3+） |
| 转化值全部为 0 或 null | 隐私阈值（流量低）或应用中未实现 schema |
| Android 上的 Install Referrer 为空 | 未在首次启动后的 60 秒内调用 API |
| 延迟深度链接丢失参数 | 应用未处理冷启动参数 |
| MMP 与 RevenueCat/ASC 的收入不一致 | 货币换算 + 退款 + 家庭共享——预计存在 5–10% 的差异 |

## 输出模板

```
ATTRIBUTION SETUP — <App Name>

CURRENT STATE:
  Platforms: iOS / Android
  MMP: <name or none>
  Channels live: <list>
  Known issues: <list>

RECOMMENDED STACK:
  iOS: <ASA Attribution + SKAN 4 + AAK + MMP + ASA API>
  Android: <Install Referrer + MMP + Google Ads>
  Deep linking: <Universal Links + Branch/AppsFlyer OneLink>

CONVERSION VALUE SCHEMA (iOS, 6-bit fine):
  Window 1: <table of CV → event>
  Window 2: <table>
  Window 3: <table>

IMPLEMENTATION CHECKLIST:
  [ ] <step 1>
  [ ] <step 2>

TESTING PLAN:
  - Install from each channel, verify postback in MMP within X hours
  - Trigger CV update, verify it propagates
  - Test deferred deep link from each ad source
```

## 常见错误

- 过早触发 ATT 提示（会降低用户选择加入率；应在用户感受到产品价值后再展示）
- 围绕虚荣指标（会话数）而非收入信号设计 CV 架构
- 未测试隐私阈值——低投放量的广告系列会返回空 CV
- 在广告创意中使用 URL scheme 深度链接（如果应用尚未安装，则无法生效）
- 忘记为 ASA 集成 AdServices framework（这会导致你在不知情的情况下将 ASA 安装量少计 30–60%）
- 混用 SDK 端和控制面板端的 CV 映射——应只选择其中一种

## 跨 Skill 交接

- 设计由这些信号驱动优化的广告系列 → `ua-campaign`
- ASA 特有的关键词/广告系列结构 → `apple-search-ads`
- 设置该架构所依赖的应用内事件 → `app-analytics`
- 转化价值以付费收入为目标，但 ASC 总计数据不一致 → `asc-metrics`