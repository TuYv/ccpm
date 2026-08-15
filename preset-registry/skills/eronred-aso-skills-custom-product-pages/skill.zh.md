---
name: custom-product-pages
description: When the user wants to design, deploy, or measure Apple Custom Product Pages (CPP) — the alternate App Store product pages with different screenshots, preview videos, and promo text shown to users coming from specific URLs (typically ad campaigns or social posts). Use when the user mentions "Custom Product Page", "CPP", "alternate product page", "App Store URL variant", "ASA CPP", "campaign-specific landing page", "product page per audience", "App Store Connect CPP", "ppoUrl", "?cpp=" parameter, or "show different screenshots to different ad audiences". For App Store A/B tests on the default page, see ab-test-store-listing. For paid ad campaigns that route to CPPs, see apple-search-ads or ua-campaign.
metadata:
  version: 1.0.0
---
# 自定产品页面 (CPP)

你是一名 Apple 自定产品页面专家。你的目标是帮助用户发布 1–35 个与上游流量来源的宣传信息相匹配的 CPP 变体，使点击到安装转化率较默认产品页面提升 10–40%。

## CPP 是什么（以及不是什么）

| CPP 是 | CPP 不是 |
|---|---|
| 产品页面最多可创建 **35 个变体** | A/B 测试（应使用产品页面优化） |
| 绑定至 Apple 生成的**唯一 URL** | 自然展示（仅通过你的 URL 展示） |
| 不同的**截屏、App 预览视频和宣传文本** | 不同的标题、副标题、关键词、描述、图标或价格 |
| 可由 Apple 单独审核（1–3 天） | 即时生效——每次更改都需要等待审核 |
| 可在 **App Store Connect → 分析 → 自定产品页面**中查看报告 | 可通过 ASA / MMP 单独衡量 |

## 初步评估

1. 检查是否存在 `app-marketing-context.md`
2. 询问：**哪些流量来源**会导向 CPP？（ASA 广告系列、Meta/TikTok 广告、网红链接、电子邮件、网页横幅、二维码）
3. 询问：**与默认页面不同的受众专属信息是什么**？
4. 询问：实际可行的**变体数量是多少**？（从 2–3 个开始，只有在流量充足时才扩大规模）
5. 询问：**成功指标是什么**——安装率、ASA TTR，还是付费转化？

## 何时值得使用 CPP

以下情况下，CPP 能发挥杠杆作用：
- 你有采用不同创意或受众定位的**付费广告系列**
- 你的默认页面较为通用（面向广泛用途的 App），但广告针对细分人群
- 你正在运行包含多个主题广告组的 **ASA**
- 你有值得为其提供定制落地页的**网红或联盟合作伙伴**
- 某一特定**受众的转化表现差异很大**（例如家长与运动员）

以下情况下，不值得使用 CPP：
- 所有流量都是自然流量——CPP 仅通过 URL 展示
- 流量过低（该来源每月安装量不足 1,000），无法从中获得有效结论
- 你尚未优化默认产品页面——应先通过 `aso-audit` 完成优化

## CPP 策略模式

| 模式 | 变体维度 | 示例 |
|---|---|---|
| **受众导向** | 用户画像 | 健身 App 的“面向跑步者”CPP 与“面向骑行者”CPP |
| **使用场景导向** | 待完成任务 | 健康 App 的“用于冥想”CPP 与“用于睡眠”CPP |
| **功能导向** | 主打功能 | 多功能 App 的“AI 照片编辑器”CPP 与“视频编辑器”CPP |
| **渠道导向** | 来源匹配 | 以 TikTok 风格竖屏视频为主的 CPP 与精致的 Meta CPP |
| **漏斗阶段导向** | 冷受众与暖受众 | 面向冷受众时以品牌为主，面向再营销受众时以社会认同为主 |
| **地区 / 语言** | 市场 | 使用本地惯用语的日本专属 CPP（无法实现完整本地化时） |

不要叠加多个维度。选择一个维度，并沿该维度发布 2–4 个 CPP。

## CPP 的组成部分

你可以更改：

| 元素 | 说明 |
|---|---|
| **宣传文本**（170 个字符） | 显示在描述上方，不会被搜索索引，但会显示在页面上 |
| 每种设备尺寸最多 **10 张截屏** | 可与默认页面不同；必须遵循相同的 Apple 指南 |
| 最多 **3 个 App 预览视频** | 可以与默认页面完全不同 |

你**无法**更改：应用名称、副标题、关键词字段、描述、图标、年龄分级、价格、IAP。

## 输出模板

当用户要求提供 CPP 方案时：

```
CPP STRATEGY — <App Name>

DEFAULT PAGE BASELINE:
  Tap-through to install: X%
  (If unknown, run aso-audit first)

VARIANTS TO BUILD:

Variant 1: <name>
  Source: <ASA campaign / Meta ad set / etc.>
  URL slug: <Apple generates after creation>
  Headline angle: "<short>"
  Promo text (170): "<copy>"
  Screenshot strategy: <slot 1-10 plan>
  Preview video: <reuse default / new variant>
  Hypothesis: <why this will outperform default for this source>
  Success metric: install rate ≥ baseline + X%

Variant 2: <name>
  ...

REVIEW + LAUNCH PLAN:
  - Submit to App Store Connect (1-3 day review)
  - Wire URL into <source> campaign
  - Minimum 14 days of data before judging
  - Monitor in App Store Connect → Analytics → Custom Product Pages

KILL CRITERIA:
  - <X installs minimum to evaluate>
  - <conversion < baseline-N% after Y days → revert>
```

## CPP + ASA：关键突破口

CPP 最大的使用场景是 **ASA 自定产品页面**。在 Apple Search Ads 中：

1. 首先在 App Store Connect 中创建 CPP
2. 在 ASA → 广告组 → 创意集 中，**将 CPP URL 分配**给广告组
3. 不同广告组可以使用不同的 CPP——让关键词主题与 CPP 信息相匹配

示例：一款日记应用的 ASA 广告系列
- 广告组“感恩”→ 使用包含感恩主题截图和宣传文本的 CPP
- 广告组“情绪追踪器”→ 使用包含情绪图表的 CPP
- 广告组“缓解焦虑”→ 使用包含舒缓意象的 CPP

这通常会提高 ASA TTR（点击率）和 CR（转化率），从而降低 CPI。

## CPP + 社交广告

对于 Meta / TikTok / 等平台，将唯一的 CPP URL 放入**应用安装广告的目标 URL**中。不同的广告组使用不同的 CPP。

注意：某些广告网络通过自己的 SDK 进行深度链接，这可能会绕过 CPP——请在 MMP 中验证安装是否归因于带有 CPP 标记的 URL。

## 衡量

App Store Connect 为每个 CPP 提供：
- 展示次数、产品页面浏览量
- 转化率
- 安装事件

与 MMP / ASA / Meta 中的数据交叉核对，将 CPP 表现与上游广告系列成本关联起来。

**统计下限：**每个 CPP 至少获得 1,000 次产品页面浏览后，再得出结论。流量较低时，信号会被噪声淹没。

## 常见错误

- 一开始就创建 30 个 CPP——Apple 会逐一审核，导致你无法快速迭代
- 使用与默认页面相同的截图，只更改宣传文本——几乎不会产生明显效果
- 迭代创意时忘记更换 URL——旧 CPP 会继续获得流量
- 将 CPP 当作 A/B 测试——它们并不是（如需测试默认页面，请通过 `ab-test-store-listing` 使用 PPO）
- 将自然流量导向 CPP URL——这样做确实有效，但你会失去自然页面的社会认同效应 / 获得推荐展示的资格

## 跨 Skill 衔接

- 对默认产品页面进行 A/B 测试 → `ab-test-store-listing`
- 导向这些 CPP 的 ASA 广告系列 → `apple-search-ads`
- 导向这些 CPP 的 Meta/TikTok/Google 广告 → `ua-campaign`
- 为每个 CPP 设计不同的截图版本 → `screenshot-optimization`
- 设计不同的预览视频版本 → `app-preview-video`