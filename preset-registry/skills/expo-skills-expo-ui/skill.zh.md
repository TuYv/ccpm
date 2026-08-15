---
name: expo-ui
description: "Framework (OSS). Build native UI with the @expo/ui package: real SwiftUI on iOS and Jetpack Compose on Android rendered from React in an Expo or React Native app. Covers universal cross-platform components (Host, Column, Row, Button, Text, List, and more imported from @expo/ui), drop-in replacements for popular React Native community libraries (BottomSheet, DateTimePicker, Slider, Menu, etc.), and platform-specific SwiftUI (@expo/ui/swift-ui, iOS only) and Jetpack Compose (@expo/ui/jetpack-compose, Android only) trees and modifiers. Use when adding or reviewing @expo/ui Host/RNHostView trees, building native-feeling UI where standard React Native components fall short (grouped settings forms with toggles, sections, menus, sheets, pickers, sliders), choosing between universal and platform-specific components, or replacing an RN community UI library with a native @expo/ui equivalent. Not for custom native modules, Expo Router navigation, Reanimated, or data fetching."
version: 1.0.0
license: MIT
allowed-tools: "Bash(node *expo-ui/scripts/list-components.js *)"
---
# Expo UI (`@expo/ui`)

`@expo/ui` 通过 React 渲染真正的原生 UI：iOS 上使用 SwiftUI，Android 上使用 Jetpack Compose。请从其通用组件开始（为 iOS、Android 和 Web 使用同一棵组件树），只有在通用层无法满足需求时，才使用平台专属的 SwiftUI/Jetpack Compose。它还提供用于从 RN 社区 UI 库迁移的即插即用替代品。

> 这些说明与最新的 Expo SDK 保持同步。**通用**层要求使用 **SDK 56+**。即插即用替代品和平台专属层在 SDK 55 上也可使用。有关特定 SDK 的组件详情，请参阅该版本的 Expo UI 文档。

## 安装

```bash
npx expo install @expo/ui
```

在 SDK 56 上，`@expo/ui` 可在 Expo Go 中运行，因此执行 `npx expo start` 即可直接运行它——无需自定义构建。在更早的 SDK 上，请先构建开发客户端（`npx expo run:ios` / `npx expo run:android`）。

每棵 `@expo/ui` 组件树——无论是通用树还是平台专属树——都必须包裹在 `Host` 中。

## 选择实现方式（请先阅读）

按以下列表依次选择，并在找到第一个满足需求的层时停止：

1. **通用组件——从这里开始。** 从 `@expo/ui` 根包导入。使用单一源代码的一棵组件树，无需修改即可在 iOS、Android 和 Web 上运行（Android 上使用 Compose，iOS 上使用 SwiftUI，Web 上使用 `react-native-web`/`react-dom`）。无需拆分平台文件。→ `./references/universal.md`

2. **平台专属（SwiftUI / Jetpack Compose）。** 从 `@expo/ui/swift-ui` 或 `@expo/ui/jetpack-compose` 导入。**仅当**通用层缺少你所需的组件或修饰器，或者你需要平台专属行为或优化时使用。**缺点：**你需要编写两棵组件树，并将它们拆分到 `.ios.tsx` / `.android.tsx` 文件中（或根据 `Platform.OS` 进行分支）——需要维护更多代码。

   > **`@expo/ui/swift-ui` 仅适用于 iOS。`@expo/ui/jetpack-compose` 仅适用于 Android。** 如果在会运行于另一平台的文件中导入其中任意一个，运行时将崩溃并出现 "Unable to get view config" 错误。请将平台专属组件树隔离到放置于 `components/` 中的 `.ios.tsx` / `.android.tsx` 文件内（绝不要放在 `app/` 中——Expo Router 不支持路由文件的平台扩展名），或者在普通路由文件中使用 `Platform.OS` 进行保护。`Host` 必须始终从 `@expo/ui`（通用包根目录）导入，而不是从平台专属子包导入。→ `./references/swift-ui.md` 和 `./references/jetpack-compose.md`

**已经在使用 RN 社区 UI 库？** `@expo/ui` 还提供**即插即用替代品**——与热门库 API 兼容的替代实现（`@gorhom/bottom-sheet`、`@react-native-community/datetimepicker` 等），可从 `@expo/ui/community/<name>` 导入。这是用于替换现有依赖项的迁移旁路，而不是上述通用层与平台专属层决策中的一个步骤。→ `./references/drop-in-replacements.md`

## 参考资料

根据需要查阅以下资源：

```
references/
  universal.md             Universal @expo/ui components and when to use them (SDK 56+)
  drop-in-replacements.md  API-compatible replacements for RN community UI libraries
  swift-ui.md              Platform-specific iOS UI: @expo/ui/swift-ui components, modifiers, RNHostView, useNativeState
  jetpack-compose.md       Platform-specific Android UI: @expo/ui/jetpack-compose components, modifiers, LazyColumn caveat, icons, useNativeState
```

## 提交反馈
如果你在此技能中发现错误、误导性或过时的信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-ui" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI 代理反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并按照其 eval-candidate 流程操作，而不要重复使用上述命令。