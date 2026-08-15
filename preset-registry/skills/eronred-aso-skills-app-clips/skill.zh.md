---
name: app-clips
description: When the user wants to implement, optimize, or use App Clips for app discovery and conversion. Use when the user mentions "App Clip", "app clip code", "mini app", "instant app", "App Clip card", "App Clip link", "no download required", "instant experience", or wants to understand how App Clips appear in App Store search. For general App Store discoverability, see aso-audit. For marketing campaigns, see ua-campaign.
metadata:
  version: 1.0.0
---
# App Clips

你帮助规划、实现和优化 App Clips——一种轻量级 iOS 体验（最大 15MB），用户无需安装完整 App 即可立即启动。

## 什么是 App Clips

App Clips 是 App 中小巧且专注的功能片段，用户无需下载完整 App 即可使用。它们会出现在：

- **App Store 搜索结果**中——与完整 App 一同显示
- 网站上的 **Smart App Banners**
- **二维码**和 App Clip 码（实体 NFC/二维码）
- **Safari** 中——访问关联 URL 时
- **信息**中——在 iMessage 中共享 URL 时
- **地图**中——适用于基于位置的商家
- **附近**中——现实环境中的 NFC 和可视代码
- **Siri 建议**中

## 大小限制

| 目标 | 限制 |
|--------|-------|
| App Clip 二进制文件 | 最大 **15MB**（经瘦身处理，按需下载） |
| App 本身 | 无变化 |

这迫使你只交付最核心的体验。

## 最佳使用场景

| App 类型 | App Clip 体验 |
|----------|-------------------|
| 停车/公共交通 | 支付停车费或购买车票 |
| 餐厅 | 查看菜单、点餐或付款 |
| 零售 | 产品预览或会员卡 |
| 健身 | 体验单次训练 |
| 游戏 | 试玩演示关卡 |
| 金融 | 计算器或快速报价 |
| 活动 | 购票或签到 |
| 实用工具 | 一次性使用核心功能 |

**关键问题：** 能够展现 App 核心价值的最小体验是什么？

## App Store 中的 App Clip 发现机制

App Clips 会在 **App Store 搜索**中以独立卡片的形式显示在完整 App 搜索结果下方——标有“App Clip”和“打开”按钮（而不是“获取”）。

- 用户轻点“打开”后，会立即启动 App Clip
- 使用后，他们会看到“获取完整 App”的横幅
- App Clip 用户 → 完整安装的转化率通常比自然冷流量高 **3–5 倍**

**ASO 影响：** App Clip 卡片会继承 App 的标题和描述元数据。优化主 App 的商店页面也能提高 App Clip 的可发现性。

## 技术要求

### App Clip 中应包含的内容

- 仅包含核心体验
- 使用 Apple Pay 或 Sign in with Apple 进行身份验证（无需创建完整账户）
- 不得包含仅限 App Clip 的内容——Clip 中的所有内容也应存在于完整 App 中
- 仅请求必要权限（App Clips 不支持推送通知）

### URL 方案

每个 App Clip 都由一个 URL 触发：
```
https://yourdomain.com/clip/[experience]
```

在 App Store Connect → Your App → App Clip Experiences 中进行配置。

### 移交至完整 App

始终包含清晰的升级提示：

```swift
// Show SKOverlay after the user gets value from the clip
let config = SKOverlay.AppClipConfiguration(position: .bottom)
let overlay = SKOverlay(configuration: config)
overlay.present(in: windowScene)
```

应在用户已经体验到价值**之后**显示浮层，而不是立即显示。

## App Clip 体验

你可以配置多个 App Clip 体验（每种 URL 模式对应一个）：

| 体验 | URL | 使用场景 |
|-----------|-----|---------|
| 默认 | `yourdomain.com` | 通用 / App Store 搜索 |
| 位置 | `yourdomain.com/location/123` | 地图、特定位置的 NFC |
| 营销活动 | `yourdomain.com/promo/summer` | 营销活动 |
| 功能 | `yourdomain.com/feature/x` | 特定功能演示 |

每个体验都可以拥有自己的：
- 标题（最多 18 个字符）
- 副标题（最多 13 个字符）
- 头图（3000×2000px）
- 操作按钮文本

## App Clip 卡片设计

该卡片会在 App Clip 启动前显示：

| 字段 | 限制 | 建议 |
|-------|-------|------|
| 标题 | 18 个字符 | 明确表达操作：使用“订购咖啡”，而不是“App 名称” |
| 副标题 | 13 个字符 | 强化价值：“无需排队” |
| 头图 | 3000×2000px | 展示结果，而不是 UI |
| 操作按钮 | — | 使用符合具体情境的文本：“订购”“支付”“开始游戏” |

## 衡量指标

在 App Store Connect → App Analytics → App Clips 中跟踪：
- App Clip 会话数
- App Clip 卡片展示次数
- App Clip → 完整 App 转化量
- App Clip 独立用户数

## App Clip 与安装完整 App 的权衡

| | App Clip | 完整安装 |
|---|---------|-------------|
| 用户阻力 | 非常低 | 较高 |
| 投入程度 | 低 | 高 |
| 留存率 | 低（一次性使用） | 高 |
| 从 Clip 转化 | — | 比冷流量高 3–5 倍 |
| 最适合 | 发现 + 转化 | 留存 + 变现 |

## 实施检查清单

```
Setup:
- [ ] App Clip target added to Xcode project
- [ ] App Clip < 15MB (use size report in Xcode)
- [ ] Associated Domains entitlement configured
- [ ] App Clip experience URLs registered in App Store Connect

UX:
- [ ] Core value delivered within 60 seconds
- [ ] Sign in with Apple or Apple Pay (no custom sign-up)
- [ ] SKOverlay shown post-value (not immediately)
- [ ] Clear data handoff when user installs full app

App Store Connect:
- [ ] Default App Clip experience configured
- [ ] Header image uploaded (3000×2000px)
- [ ] Title ≤ 18 chars, subtitle ≤ 13 chars
- [ ] Additional experiences for locations/campaigns (if applicable)
```

## 相关技能

- `aso-audit` — Clip 的可发现性取决于主 App 的 ASO
- `onboarding-optimization` — 将同样的“价值优先”原则应用于 Clip 体验
- `ua-campaign` — 在付费营销活动中为 App Clip URL 引流
- `app-store-featured` — App Clip 有助于满足获得推荐的条件