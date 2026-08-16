---
name: ima-sdk-client-side
description: >-
  Supports Interactive Media Ads (IMA) SDK.
  Use this skill for client-side ad insertion when you are requesting video ads
  for websites, apps, TVs or other platforms using VAST or VMAP.
  Do not use for Dynamic Ad Insertion (DAI), SSAI, or SGAI.
license: Apache-2.0
metadata:
  author: Google LLC
  version: "1.0.2"
  category: GoogleAds
---
# IMA SDK 客户端

Google IMA SDK（互动媒体广告）可让您将插播视频和音频广告加载到网站、应用、电视及其他数字平台中。使用 IMA SDK 可以从任何符合 VAST 标准的广告服务器请求广告并管理广告播放。

## 前提条件

在集成 IMA SDK 之前，您**必须**阅读以下平台专属指南，以支持您的应用能够支持的所有平台：

*   **Web/HTML5/ReactJs/NodeJs/Angular：** 阅读以下所有指南：
    [ima-sdk-web-guide.md](references/ima-sdk-web-guide.md)、
    [ima-sdk-web-iframe-mode.md](references/ima-sdk-web-iframe-mode.md)、
    [ima-sdk-web-mobile-safari.md](references/ima-sdk-web-mobile-safari.md)
*   **Android/AndroidTV/ReactNative：** 阅读 [ima-sdk-android-guide.md](references/ima-sdk-android-guide.md)
*   **iOS/tvOS/ReactNative：** 阅读以下所有指南：
    [ima-sdk-ios-guide.md](references/ima-sdk-ios-guide.md)、
    [ima-sdk-tvos-guide.md](references/ima-sdk-tvos-guide.md)

--------------------------------------------------------------------------------

## 快速开始（常规工作流程）

1.  导入 SDK：前提条件、依赖项。
2.  初始化：早期设置、预热、设置配置和广告 UI 设置。
3.  广告请求：创建并触发请求、遵循用户手势要求。
4.  广告加载成功/失败：处理加载事件以获取 AdsManager，或处理早期致命错误。
5.  广告播放事件：通过 AdsManager 监听播放事件，以协调内容的播放/暂停，并处理非致命 LOG 事件和播放期间的致命错误。
6.  清理：正确销毁 AdsManager 以释放资源并防止内存泄漏。

有关特定平台的详细实现信息，请始终参阅“前提条件”部分中的指南。