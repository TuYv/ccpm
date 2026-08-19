---
name: google-mobile-ads-rewarded
description: >-
  Provides instructions for implementing, integrating, or configuring Google
  Mobile Ads (GMA) SDK rewarded ads in Android, iOS, or Unity mobile
  applications. Use when the task involves setting up rewarded ads. Don't use
  for "rewarded interstitial" ads.
metadata:
  version: 1.1.0
  category: GoogleAds
---
# Google Mobile Ads SDK - 激励广告

激励广告会在用户与全屏广告互动后，向用户奖励应用内物品。激励广告会在用户明确选择观看激励广告后进行投放。

## 工作流程

1.  **确定用户的平台**：识别项目是 Android、iOS 还是 Unity。如果不明确，请在继续之前询问。

2.  **阅读平台指南**以了解实现细节：
    -   Android：`references/android-rewarded.md`
    -   iOS：`references/ios-rewarded.md`
    -   Unity：`references/unity-rewarded.md`

3.  **按顺序执行以下步骤**：
    -   [ ] 加载广告
    -   [ ] 注册广告事件回调
    -   [ ] 添加一个用于观看广告以获取奖励的 UI 元素
    -   [ ] 展示广告
    -   [ ] 验证实现