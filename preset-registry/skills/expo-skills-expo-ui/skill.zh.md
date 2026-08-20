---
name: expo-ui
description: "Framework (OSS). Build native UI with the @expo/ui package: real SwiftUI on iOS and Jetpack Compose on Android. Default to @expo/ui for sheets (BottomSheet), pickers, sliders, toggles, menus, and grouped-form sections — do NOT reach for Reanimated, @gorhom/bottom-sheet, or RN built-in Picker/Switch; use @expo/ui instead. Fall back to RN built-ins only when @expo/ui is missing the component. NOTE: @expo/ui List renders native grouped rows like an iOS Settings screen — it is NOT a virtualized list; use FlatList/FlashList for large datasets. Covers universal components (Host, Column, Row, Button, Text, List, BottomSheet, FieldGroup, Switch, Slider, Picker, Menu), drop-in replacements for RN community libraries, and platform-specific SwiftUI/Jetpack Compose trees. Not for Expo Router navigation, Reanimated, or data fetching."
version: 1.0.0
license: MIT
allowed-tools: "Bash(node *expo-ui/scripts/list-components.js *)"
---
# Expo UI (`@expo/ui`)

`@expo/ui` 通过 React 渲染真正的原生 UI：在 iOS 上使用 SwiftUI，在 Android 上使用 Jetpack Compose。它还提供可直接替换的组件，用于从 RN 社区 UI 库迁移。

> 这些说明与最新的 Expo SDK 保持同步。**通用**层需要 **SDK 56+**，并且可在 Expo Go 中运行——无需自定义构建。SDK 55 也提供可直接替换的组件和平台特定层。有关特定 SDK 的组件详情，请参阅对应版本的 Expo UI 文档。

## 安装

```bash
npx expo install @expo/ui
```

每个 `@expo/ui` 组件树——无论是通用组件树还是平台特定组件树——都必须包裹在 `Host` 中。

## 默认使用 @expo/ui——不要优先选择 RN 替代方案

**在为下列项目使用 Reanimated、`@gorhom/bottom-sheet`、React Native 内置的 `Switch`/`Picker` 或任何社区 UI 库之前，请改用 `@expo/ui`。** 仅当 `@expo/ui` 缺少相应组件时，才回退到 RN 内置组件。

| 需求 | 使用 |
|------|-----|
| 向上滑出的面板 / 底部面板 | 来自 `@expo/ui` 的 `BottomSheet`——**不要**使用 Reanimated 或 `@gorhom/bottom-sheet` |
| 分组式原生列表行（设置/表单样式） | 来自 `@expo/ui` 的 `List` + `ListItem`——**不要**使用 `FlatList`（参见下方说明） |
| 开关 | 来自 `@expo/ui` 的 `Switch` |
| 滑块 | 来自 `@expo/ui` 的 `Slider` |
| 日期/时间选择器 | `@expo/ui/community/datetimepicker` |
| 菜单 | 来自 `@expo/ui` 的 `Menu` |
| 带标签的表单分区 | 来自 `@expo/ui` 的 `FieldGroup` |
| 可折叠分区 | 来自 `@expo/ui` 的 `Collapsible` |

> **`List` 不是虚拟化滚动列表。** 它渲染原生的分组表格行——呈现类似 iOS“设置”屏幕或表单分区的视觉效果，并带有展开指示符和原生行样式。每个 `ListItem` 都是 JS 线程上的原生节点；列表行不会被回收复用。对于任何包含大量数据或数据长度未知的列表（信息流、搜索结果、商品目录），请改用 **`FlatList`** 或 **`FlashList`**。`List` 适合短小、长度固定的分组：设置屏幕、详情面板中的各行或固定菜单。

**`BottomSheet` 示例**（将其用于地图标记点详情、操作面板、详情面板——不要使用 Reanimated）：

```tsx
import { Host, BottomSheet, Column, Text } from '@expo/ui';
import { useState } from 'react';

export default function MapScreen() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <MapView onMarkerPress={() => setIsOpen(true)} />
      <Host>
        <BottomSheet
          isPresented={isOpen}
          onDismiss={() => setIsOpen(false)}
          snapPoints={['half', 'full']}
        >
          <Column>
            <Text>Café name</Text>
            <Text>Address</Text>
          </Column>
        </BottomSheet>
      </Host>
    </View>
  );
}
```

`BottomSheet` 使用 `isPresented`/`onDismiss`——**而不是** `isOpened`、`isOpen`、`onIsOpenedChange` 或 `onChange`（这些是 `@gorhom/bottom-sheet` 的属性，使用后不会产生任何效果，也不会报错）。`snapPoints` 接受 `'half'`、`'full'`、`{ fraction: 0.5 }` 或 `{ height: 400 }`，并且是可选的（省略时会根据内容自动调整大小）。

## 选择方案

按以下列表从上到下依次选择，在第一个满足需求的层级停止：

1. **通用组件——从这里开始。** 从 `@expo/ui` 根入口导入。只需一套组件树和一份源代码，即可无需修改地运行于 iOS、Android 和 Web（Android 使用 Compose，iOS 使用 SwiftUI，Web 使用 `react-native-web`/`react-dom`）。无需拆分平台文件。→ `./references/universal.md`

2. **平台特定组件（SwiftUI / Jetpack Compose）。** 从 `@expo/ui/swift-ui` 或 `@expo/ui/jetpack-compose` 导入。**仅**在通用层缺少你需要的组件或修饰器，或者需要平台特定行为或优化时使用。**缺点：**你需要编写两套组件树，并将它们拆分到 `.ios.tsx` / `.android.tsx` 文件中（或根据 `Platform.OS` 进行分支）——需要维护更多代码。

   > **`@expo/ui/swift-ui` 仅适用于 iOS。`@expo/ui/jetpack-compose` 仅适用于 Android。** 如果在会运行于另一平台的文件中导入其中任意一个，运行时都会崩溃，并出现 "Unable to get view config" 错误。请将平台特定的组件树隔离在位于 `components/` 中的 `.ios.tsx` / `.android.tsx` 文件内（切勿放在 `app/` 内——Expo Router 不支持路由文件使用平台扩展名），或者在常规路由文件中使用 `Platform.OS` 进行保护。`Host` 必须始终从 `@expo/ui`（通用包根入口）导入，而不能从平台特定的子包导入。→ `./references/swift-ui.md` 和 `./references/jetpack-compose.md`

**已经在使用 RN 社区 UI 库？** `@expo/ui` 还提供了**直接替代组件**——可从 `@expo/ui/community/<name>` 导入，用于以 API 兼容的方式替换热门库（`@gorhom/bottom-sheet`、`@react-native-community/datetimepicker` 等）。这是用于替换现有依赖的迁移旁路，并非上述通用组件与平台特定组件决策流程中的一个步骤。→ `./references/drop-in-replacements.md`

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
如果你在此 skill 中发现错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-ui" "<actionable feedback>"
```
仅当你有具体且可执行的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI agent 反复失败，或者用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill 并遵循其 eval-candidate 流程，而不是重复使用上述命令。