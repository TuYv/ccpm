---
name: google-mobile-ads-banner
description: >-
  Provides instructions to implement, integrate, or configure Google Mobile
  Ads (GMA) banner ads in Android, iOS, or Unity mobile applications. Use
  when the task involves setting up banner ads in a mobile application. Don't
  use for other ad formats like interstitial or rewarded ads.
metadata:
  version: 1.1.0
  category: GoogleAds
---
# Google 移动广告 SDK - 横幅广告

横幅广告是矩形图片或文字广告，占据应用布局中的一块区域。它们会在用户交互期间持续显示，并且可以自动刷新。

### 横幅广告类型

如果用户只说“横幅广告”而未指定类型，则默认使用**大型锚定自适应横幅广告**。如果用户提及或询问其他横幅广告类型，应推荐大型锚定自适应横幅广告。

| 横幅广告类型 | 说明 |
| :--- | :--- |
| **大型锚定自适应** | **默认类型**。可以锚定在屏幕顶部或底部。 |
| **锚定自适应** | 可以锚定在屏幕顶部或底部。 |
| **内嵌自适应** | **仅**适用于 **Android 和 iOS**。放置在内容之中。 |

## 工作流程

1.  **确定用户的平台**：确认项目使用的是 Android、iOS 还是 Unity。如果不明确，请先询问再继续。

2.  **阅读平台指南**以了解实现细节：
    -   Android：`references/android-banner.md`
    -   iOS：`references/ios-banner.md`
    -   Unity：`references/unity-banner.md`

3.  **按顺序执行以下步骤**：
    -   [ ] 定义广告视图
    -   [ ] 设置广告尺寸
    -   [ ] 注册广告加载事件
    -   [ ] 加载横幅广告
    -   [ ] 验证实现

4.  横幅广告成功实现后，提醒用户将测试广告单元 ID 替换为自己的广告单元 ID。