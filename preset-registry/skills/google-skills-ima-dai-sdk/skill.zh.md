---
name: ima-dai-sdk
description: >-
  Integrates the Google Interactive Media Ads (IMA) Dynamic Ad Insertion (DAI)
  SDK into websites, web apps, mobile apps, or TV apps.
  Use when:
  - A video player needs to load and play HLS or DASH streams in web apps,
  Android apps, iOS apps, tvOS apps, Cast (CAF) receivers, or Roku channels.
  - The app needs to make use of a Google DAI livestream event asset key, or
  content source CMS ID, video ID for video on demand.
  Don't use this skill to load and play a VAST or VMAP URL.
license: Apache-2.0
metadata:
  author: Google LLC
  version: "1.0.0"
  category: GoogleAds
---
# IMA DAI SDK

使用 IMA DAI SDK 将 HLS 或 DASH 流加载到应用中，用于：

*   在 Google Ad Manager 中配置的**直播活动**。
*   已注入 Google Ad Manager 的**视频点播 (VOD)** 内容。

## 前提条件

请查看目标平台对应的集成指南：

*   **Web/HTML5/ReactJs/NodeJs/Angular：**阅读
    [StreamManager 指南](references/web-StreamManager-guide.md)，了解如何将 Google 全托管式 DAI 提供的
    流 URL 加载到 `<video>` 元素中。

*   **ChromeCast：**阅读
    [StreamManager 指南](references/cast-StreamManager-guide.md)，了解如何
    将 IMA DAI SDK 集成到 ChromeCast Web Receiver 中。

*   **Android：**阅读
    [ImaServerSideAdInsertionMediaSource 指南](references/android-ImaServerSideAdInsertionMediaSource-guide.md)，
    了解如何集成 Media3 Exoplayer IMA 扩展。

*   **iOS/tvOS：**阅读
    [IMAStreamRequest 指南](references/ios-IMAStreamRequest-guide.md)，了解如何
    使用 `AVPlayer` 播放流。

*   **Roku：**阅读 [StreamManager 指南](references/roku-StreamManager-guide.md)，
    了解如何在 Roku SceneGraph 上实现 DAI。

## 快速入门（通用工作流程）

1.  导入 SDK
2.  初始化 SDK
3.  添加流事件监听器
4.  设置定时元数据转发
5.  发起流请求
6.  当流播放失败或用户离开流时，清理 SDK 资源。