---
name: expo-app-clip
description: Framework (OSS). Add an iOS App Clip target to an Expo app. Use when the user mentions App Clip, AASA, apple-app-site-association, appclips, smart app banner, or wants to ship a lightweight iOS Clip invoked from a URL alongside their parent app.
---
# 向 Expo 应用添加 App Clip

> **要求。** 添加 App Clip target 本身是开源的。发布 App Clip 需要加入 Apple Developer Program 并通过 App Store 审核，而且必须通过你的域名使用 HTTPS 提供 AASA 文件（任何 HTTPS 主机均可；EAS Hosting 是其中一种选择）。通过 EAS Build 或 `bunx testflight` 构建会消耗你的 EAS 套餐构建分钟数。请参阅 https://expo.dev/pricing 和 https://developer.apple.com/app-clips/。

向 Expo 项目添加一个 iOS App Clip target。Clip 位于 `targets/clip/` 中，与父应用一同发布，并通过 Apple App Site Association (AASA) 文件，由应用域名上的 URL 唤起。

父应用的 bundle ID 将变为 `com.<username>.<app-name>`，Clip 的 bundle ID 则会自动派生为 `<parent>.clip`（例如 `com.bacon.may20.clip`）。

## 1. 设置 `bundleIdentifier` 和 `appleTeamId`

如果缺少这些字段，`bun create target` 会发出警告。将以下内容添加到 `app.json`：

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.<username>.<app-name>",
      "appleTeamId": "XX57RJ5UTD"
    }
  }
}
```

## 2. 添加 App Clip target

```sh
bun create target clip
```

此命令会安装 [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets)，将其添加到 `app.json` 的 `plugins` 数组中，并写入：

- `targets/clip/expo-target.config.js` — target 的 config plugin
- `targets/clip/Info.plist` — Clip Info.plist
- `targets/clip/AppDelegate.swift`、`Assets.xcassets` 等

选择一个合适的图标，或复用应用中已定义的现有图标——使用 `bunx expo config` 检查 `icon` 或 `ios.icon` 键下的配置。

## 3. 配置 associated domains

父应用和 Clip 都需要 Associated Domains entitlement，并指向托管 AASA 文件的域名。

在 `app.json` 中，同时添加 `applinks:`（父应用）和 `appclips:`（Clip 唤起）条目：

```json
{
  "expo": {
    "ios": {
      "associatedDomains": [
        "applinks:may20.expo.app",
        "appclips:may20.expo.app"
      ]
    }
  }
}
```

在 `targets/clip/expo-target.config.js` 中声明 Clip 的 entitlement：

```js
/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "clip",
  icon: "https://github.com/expo.png",
  entitlements: {
    "com.apple.developer.associated-domains": ["appclips:may20.expo.app"],
  },
});
```

> 如果跳过此步骤，`expo prebuild` 将输出：`Apple App Clip may require the associated domains entitlement but none were found`。

## 4. 注册 bundle ID 并创建 App Store 条目

```sh
bunx setup-safari
```

此命令会登录 Apple Developer 账户、注册 `com.bacon.may20`、创建 App Store Connect 条目，并输出：

- 一个初始的 `apple-app-site-association` JSON
- 一个包含 iTunes app id 的 `<meta name="apple-itunes-app">` 标签
- Team ID、iTunes ID 和 Bundle ID

## 5. 托管 AASA 文件

当 iOS 获取 `https://<your-domain>/.well-known/apple-app-site-association` 并找到匹配的 `appclips` 条目时，App Clip 会被唤起。

```sh
mkdir -p public/.well-known
touch public/.well-known/apple-app-site-association
```

粘贴 `setup-safari` 输出的 JSON，但需要为 App Clip 的完整应用 ID（`<TeamID>.<ClipBundleID>`）**添加一个 `appclips` 块**。`setup-safari` 的输出仅包含父应用：

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["XX57RJ5UTD.com.bacon.may20"],
        "components": [{ "/": "*", "comment": "Matches all routes" }]
      }
    ]
  },
  "appclips": {
    "apps": ["XX57RJ5UTD.com.bacon.may20.clip"]
  },
  "activitycontinuation": {
    "apps": ["XX57RJ5UTD.com.bacon.may20"]
  },
  "webcredentials": {
    "apps": ["XX57RJ5UTD.com.bacon.may20"]
  }
}
```

注意：

- 该文件**没有扩展名**，除了按原样提供之外，**没有 `Content-Type` 要求**。Expo Router 静态导出会按原样提供 `public/` 中的文件。
- `appclips` 块使域名上的 URL 能够启动 App Clip。
- `webcredentials` 用于在网站、父应用和 App Clip 之间共享凭据。
- `activitycontinuation` 是可选的，用于在移动端和桌面端之间共享链接。必须与 expo-router 中的 `Head` 一起使用——参见 https://docs.expo.dev/router/advanced/apple-handoff/
- 表示法和路由禁用详情：https://sosumi.ai/documentation/xcode/supporting-associated-domains

## 6. 添加智能应用横幅 meta 标签

创建 `src/app/+html.tsx`（Expo Router 的 HTML 外壳），并添加 `setup-safari` 提供的标签。如果带版本的模板不存在，请创建它：

```sh
bunx expo customize src/app/+html.tsx
```

将 meta 标签添加到 `<head>`：

```tsx
import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-itunes-app" content="app-id=6771566491" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

要让网站显示 App Clip 卡片而不是安装卡片，请使用：

```html
<meta
  name="apple-itunes-app"
  content="app-id=6771566491, app-clip-bundle-id=com.bacon.may20.clip, app-clip-display=card"
/>
```

## 7. 部署网站

在 iOS 信任该关联之前，AASA 文件必须已上线。使用 [EAS Hosting](https://docs.expo.dev/eas/hosting/)：

```sh
bunx expo export -p web
eas deploy --prod
```

这会将网站（包括 `/.well-known/apple-app-site-association`）发布到 `https://<slug>.expo.app`。验证：

```sh
curl https://may20.expo.app/.well-known/apple-app-site-association
```

## 8. 复制权限

在预构建后检查父应用的权限：

```sh
npx expo config --type introspect
```

查看 `infoPlist` 对象——在 App Clip 的 `Info.plist` 中复制相应的权限键，以便在 App Clip 中使用对应的 API。

在 App Clip 的目标配置中设置 `deploymentTarget: "17.6"`——App Clip 在 iOS 17.6 中具有更高的最低大小限制。

如果应用使用推送通知或定位服务，请在 App Clip 的 `Info.plist` 中添加以下内容，以请求必要的权限：

```xml
<key>NSAppClip</key>
<dict>
  <key>NSAppClipRequestEphemeralUserNotification</key>
  <false/>
  <key>NSAppClipRequestLocationConfirmation</key>
  <true/>
</dict>
```

## 9. 构建并提交到 TestFlight

```sh
bunx testflight
```

这将：

1. 如果缺少 `eas.json`，则生成该文件。
2. 为**两个**目标（父应用 + Clip）设置凭证。每个目标都有自己的预置描述文件，但可以共享同一个分发证书。
3. 同步功能配置——请注意 Clip 目标的 `Enabled: Associated Domains`。
4. 构建、上传并安排 TestFlight 提交。

## 10. 配置 App Clip 元数据

将现有的 App Store 元数据拉取到本地：

```sh
eas metadata:pull
```

将 `apple.appClip` 添加到 `store.config.json`。最多可以使用 3 个调用 URL 从网页启动 Clip：

```json
{
  "configVersion": 0,
  "apple": {
    "appClip": {
      "defaultExperience": {
        "action": "PLAY",
        "releaseWithAppStoreVersion": true,
        "reviewDetail": {
          "invocationUrls": ["https://may20.expo.app/", null, null]
        },
        "info": {
          "en-US": {
            "subtitle": "Instantly native with Expo",
            "headerImage": "store/apple/app-clip/en-US/asc-app-clip.png"
          }
        }
      }
    }
  }
}
```

`headerImage` 必须是尺寸为 1800x1200 且不含透明度的 PNG。

推送回商店：

```sh
eas metadata:push
```

Apple 推荐的 App Clip 元数据指南：https://sosumi.ai/documentation/appclip/configuring-the-launch-experience-of-your-app-clip

## 最终成果

- 父应用目标：`com.bacon.may20`
- App Clip 目标：`com.bacon.may20.clip`，位于 `targets/clip/`
- AASA 托管于 `https://may20.expo.app/.well-known/apple-app-site-association`
- 每个 Web 路由上都有 Smart App Banner 元标签
- 每个路由都链接到其对应的原生路由
- 包含嵌入式 Clip 的父应用 TestFlight 构建版本

当 Apple 通过该域名上的 URL 调用 Clip 后，iOS 会打开 `targets/clip/` 的入口点，该入口点将加载 React Native 应用。

## 原生检测（可选）

要让 JS 检测它是否正在 App Clip 内运行，并显示安装完整应用的提示，请创建一个本地 Expo 模块（`bunx create-expo-module --local`），公开 `navigator.appClip.prompt()`。

有关 Swift 模块、TypeScript 接口和用法，请参阅 [./references/native-module.md](./references/native-module.md)。

## 参考资料

- ./references/native-module.md — 用于检测 App Clip 上下文并显示 SKOverlay 安装提示的本地 Expo 模块

## 提交反馈
如果你在此 skill 中遇到错误、误导性信息或过时信息，请报告，以便 Expo 进行改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-app-clip" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供更多相关上下文。
如果 AI 智能体反复失败，或者用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill，并按照其 eval-candidate 流程操作，而不要重复使用上述命令。