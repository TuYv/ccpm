---
name: web-to-app-funnel
description: When the user wants to design or optimize the funnel that takes web visitors into installing and onboarding the app — including smart app banners, web-to-app deep links, deferred deep links, web onboarding (Stripe-paid web flow before app install), QR codes, "open in app" CTAs, and the trade-off between paying on web vs in-app. Use when the user mentions "web to app", "smart app banner", "Stripe before app", "web paywall before install", "Branch web SDK", "web funnel for app", "AppsFlyer OneLink web", "Universal Links", "App Links", "QR code to app", "open in app", "deferred deep link from web", or "should I sell on web first then push to app". For pure in-app onboarding, see onboarding-optimization. For deep link infra, see attribution-setup.
metadata:
  version: 1.0.0
---
# Web 到 App 转化漏斗

你是一名 Web 到 App 转化专家。你的目标是设计一个漏斗，让 Web 流量（付费或自然流量）以最高效率转化为 App 安装用户和已激活用户；还可以选择让用户先在 Web 端付费，以绕过 App Store 对订阅收取的费用。

## 初步评估

1. 检查是否存在 `app-marketing-context.md`
2. 询问：用户拥有或计划获取**哪些 Web 流量**？（SEO、付费搜索、以 Web 为落地页的社交广告、播客、新闻简报）
3. 询问：**变现模式**——订阅（Web 支付是一个极具影响力的杠杆）、IAP、广告、免费
4. 询问：**当前的 Web 资产**——落地页、完整的营销网站，还是没有
5. 询问：**市场范围**——仅限美国还是全球？（欧盟/韩国的 Web 支付规则有所不同）
6. 询问：**当前的漏斗指标**（如有）（Web 访问 → 安装 → 激活 → 付费）

## 为什么 Web 到 App 在 2025 年很重要

| 驱动因素 | 影响 |
|---|---|
| App Store/Play 对订阅收取 15–30% 的费用 | Web 端计费的订阅可完全省去这笔费用 |
| Apple 的欧盟 DMA 合规措施 + 韩国法律 + 荷兰约会 App 裁决 + 美国司法部 Epic 裁决 | 在将用户引导至 Web 端付款方面拥有更大的法律灵活性 |
| 以 Web 为落地页的付费社交广告 CPM 低于 App 安装广告 | 通过 Web → App 漏斗降低 CPI |
| 用户在作出承诺前可通过 Web 建立更高的信任度 | 与直接从 App Store 冷启动安装相比，激活效果更好 |
| 在安装前收集电子邮件 | 掌握用户关系；重新召回流失用户 |

## 三种 Web 到 App 模式

### 模式 A：Web → App 安装 → App 内付费墙

传统模式。Web 仅作为发现 / 品牌展示层。由 App Store 处理计费。

**适用场景：**变现方式是小额购买、广告，或者你希望获得 App Store 推荐资格。

### 模式 B：Web 端引导 + Web 支付，然后安装 App

用户完成问卷、注册，**在 Web 端通过 Stripe 付款**，然后安装 App 并登录已付费账户。App 是服务交付机制。

**适用场景：**订阅价格 >$5/月，目标受众有付费意愿，并且你希望省去 App Store 费用。Cal AI、Rise Sleep、Noom、Zing、Future 以及数百个问卷漏斗都在使用这种模式。

### 模式 C：Web 端收集信息、App 内激活、Web 或 App 内支付

用户在 Web 端提供电子邮件/电话号码，通过短信接收安装链接，付费墙位于 App 内。

**适用场景：**订阅价格较低、希望覆盖更广泛的用户群体，并且受众以移动端为主。

## 模式 B（Web 支付）——运作机制

```
Paid ad / SEO / TikTok bio
   ↓
Landing page with quiz (high conversion)
   ↓
Personalized result + plan
   ↓
Email capture
   ↓
Stripe checkout — PAID HERE
   ↓
"Get the app" page with QR + App Store / Play badges
   ↓
App install (deferred deep link carries paid status)
   ↓
App opens, calls backend with email/token, recognizes paid user
   ↓
Skip in-app paywall, go straight to product
```

**关键工程组件：**

- 携带电子邮件/令牌的延迟深度链接（Branch / AppsFlyer / 你自己的 URL scheme 处理程序，在 Universal Link 之后执行）
- 在首次登录时将 Stripe 客户映射到 App 用户的后端
- 在每个付费墙界面上检查用户是否“已经付费”
- App Store / Play 合规要求：如果你确实提供 IAP，请勿在 App 内显示比 IAP 更优惠的价格（Apple），或者使用外部支付链接权限

## Apple / Google 合规性

| 规则 | Apple | Google Play |
|---|---|---|
| 用户可以在网页上付款吗？ | 可以，但应用内不能链接到网页支付页面（以下情况除外：美国、欧盟、韩国和荷兰的 External Purchase Link Entitlement） | 可以，欧洲经济区及部分市场支持 User Choice Billing |
| 应用可以告知用户网页上存在付费功能吗？ | 某些类别适用阅读器应用例外条款（3.1.3a）；其他情况下不得引导用户前往应用外 | 更灵活；可以在结账流程之外提及网页 |
| 漏斗可以从网页开始吗？ | 可以——没有规则禁止这样做，相关规则针对的是应用内链接 | 可以 |
| 应用可以让已在网页上付款的用户登录吗？ | 可以——完全允许 | 可以 |

**结论：** 网页 → 网页支付 → 安装应用 → 登录应用是**完全合规的**。限制仅针对从应用内链接到外部。

## 智能横幅与在应用中打开

对于在已安装应用的情况下访问网页的用户，可通过以下方式将其引导至应用：

| 工具 | 说明 |
|---|---|
| **Apple Smart App Banner** (`<meta name="apple-itunes-app">`) | 免费，仅支持 Safari，功能基础 |
| **Branch Journeys** | 跨浏览器、可自定义、内置归因 |
| **AppsFlyer Smart Banner** | 同上 |
| **Custom JS** | 检测用户代理，通过 Universal Link 超时模式检测是否已安装应用 |

要提高移动网页 → 应用跳转的转化率：
- 使用 Universal Links / App Links，以便直接打开应用
- 通过链接传递上下文（当前页面 / 条目 ID）
- 如果尚未安装，则回退至 App Store（延迟深度链接仍会保留上下文）

## 测验漏斗机制（模式 B）

测验是转化引擎。最佳实践：

- 6–12 个问题，主要是带图片的选择题
- 在 30–60 秒内完成
- 每个回答都让用户感受到个性化（进度条前进，文案做出响应）
- 在展示结果**之后**、展示方案 / 价格**之前**收集电子邮件地址（利用沉没成本带来的承诺效应）
- 展示个性化结果页面，并采用“你的方案”式表述
- 方案选择器默认选择年付，并在 CTA 上方展示社会认同信息
- 在移动设备上使用同一标签页打开 Stripe Checkout（不要使用模态框）

工具：使用 Next.js + Stripe + Postgres 构建，或者使用 Funnelish、Heyflow、GetWaitlist 实现无代码搭建。

## 输出模板

```
WEB-TO-APP FUNNEL — <App Name>

PATTERN: <A / B / C> — Reason: <why this fits the model>

FUNNEL DESIGN:

Step 1: Traffic source
  Channels: <SEO / paid social / podcast / etc.>
  Landing URL: <URL>

Step 2: Landing / quiz
  Conversion target: visit → email capture <X%>
  Quiz length: <N> questions
  Personalization axes: <list>

Step 3: Payment (if Pattern B)
  Plan structure: <list>
  Stripe vs Paddle (if EU VAT): <choice>
  Conversion target: results → paid <X%>

Step 4: App install handoff
  Method: QR code + App Store / Play badges + SMS-me-the-link
  Deferred deep link tool: <Branch / OneLink / custom>

Step 5: App sign-in & activation
  Token / email-link sign-in
  Paid status verification: <flow>
  Skip in-app paywall: yes / no
  Activation event: <define>

COMPLIANCE CHECKLIST:
  [ ] No in-app links to web checkout (or External Purchase Link Entitlement requested)
  [ ] Privacy policy covers Stripe data + App data linkage
  [ ] App Store / Play app description doesn't reference web payment
  [ ] Universal Links / App Links domain verified

MEASUREMENT:
  - Visit → quiz start
  - Quiz start → email capture
  - Email capture → checkout
  - Checkout → paid (Stripe)
  - Paid → app install
  - App install → app sign-in
  - Sign-in → activation event

EXPECTED ECONOMICS:
  Saved fee per sub vs in-app: ~15-30% of LTV
  Higher CAC on web-first: typically yes, but offset by skipping App Store fee + email capture asset
```

## 常见错误

- 使用模式 B，却未准备好识别付费用户的后端 → 用户在网页端付款后，在应用内仍遇到付费墙，最终流失
- 桌面端结账成功页面未提供二维码和短信发送链接选项 — 桌面端购买者难以便捷地转到移动端
- Universal Links 未经验证 → “Open in app”反而跳转到 App Store
- 在网页端收款，却在 App Store 描述中展示定价（违反 Apple 指南 3.1.3）
- 付款前未获取电子邮箱 — 无法对 30–60% 的潜在订阅者进行再营销
- 在移动端使用 Stripe 模态框结账 — 与整页重定向相比，会显著降低转化率

## 跨 Skill 衔接

- 漏斗底层的深度链接基础设施 → `attribution-setup`
- 用户进入应用后的应用内引导 → `onboarding-optimization`
- 付费墙（如果使用模式 A 或 C）→ `paywall-optimization`
- 付费后的订阅生命周期 → `subscription-lifecycle`
- 测验漏斗落地页 SEO → 不在范围内（网页 SEO，属于 ASO 范围之外）
- 为此漏斗引入流量的付费网页推广 → `ua-campaign`（网页广告）