---
name: google-mobile-ads-rewarded
description: Provides instructions for implementing, integrating, or configuring
  Google Mobile Ads (GMA) SDK rewarded ads in Android or iOS mobile
  applications. Use this skill when the task involves setting up rewarded
  ads. Don't use for "rewarded interstitial" ads.
metadata:
  version: 1.0.0
  category: GoogleAds
---
# Google 移动广告 SDK - 激励广告

激励广告通过让用户与全屏广告互动，向用户奖励应用内物品。只有在用户明确选择观看激励广告后，才会投放激励广告。

### 广告展示位置指南

**关键：** 在继续进行任何激励广告实现之前，你必须评估并应用以下广告展示位置指南。

*   **确定广告展示位置**：
    *   [ ] **确定目标文件**，即应放置广告的文件。如不确定，请询问。

## 工作流程

1.  **确定用户的平台**：识别项目是 Android 还是 iOS。如果不清楚，请先询问再继续。

2.  **阅读平台指南**以了解实现详情：
    -   Android：`references/android-rewarded.md`
    -   iOS：`references/ios-rewarded.md`

3.  **按顺序执行以下步骤**：
    -   [ ] 加载广告
    -   [ ] 注册广告事件回调
    -   [ ] 添加用户主动选择的 UI 元素
    -   [ ] 展示广告
    -   [ ] 验证实现