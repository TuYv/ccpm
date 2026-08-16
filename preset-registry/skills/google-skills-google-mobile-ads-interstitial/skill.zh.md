---
name: google-mobile-ads-interstitial
description: >-
  Provides instructions for implementing, integrating, or configuring Google
  Mobile Ads (GMA) SDK interstitial ads in Android, iOS, or Unity mobile
  applications. Use when the task involves setting up interstitial ads. Don't
  use for "rewarded interstitial" ads.
metadata:
  version: 1.1.0
  category: GoogleAds
---
# Google 移动广告 SDK - 插页式广告

插页式广告会在移动应用中向用户展示全屏广告。插页式广告旨在放置于内容之间，最适合展示在应用自然的过渡节点。

## 工作流程

1.  **确定用户的平台**：识别项目使用的是 Android、iOS 还是 Unity。如果不明确，请先询问再继续。

2.  **阅读相应平台的指南**以了解实现细节：
    -   Android：`references/android-interstitial.md`
    -   iOS：`references/ios-interstitial.md`
    -   Unity：`references/unity-interstitial.md`

3.  **按顺序执行以下步骤**：
    -   [ ] 加载广告
    -   [ ] 注册广告事件回调
    -   [ ] 展示广告
    -   [ ] 验证实现