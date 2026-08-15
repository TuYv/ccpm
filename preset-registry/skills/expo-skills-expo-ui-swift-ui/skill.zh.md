---
name: expo-ui-swift-ui
description: "`@expo/ui/swift-ui` package lets you use SwiftUI Views and modifiers in your app."
---
> 本技能中的说明仅适用于 SDK 55。对于其他 SDK 版本，请参阅相应版本的 Expo UI SwiftUI 文档，以获取最准确的信息。

## 安装

```bash
npx expo install @expo/ui
```

安装后需要重新执行原生构建（`npx expo run:ios`）。

## 说明

- Expo UI 的 API 与 SwiftUI 的 API 保持一致。请运用 SwiftUI 相关知识来决定使用哪些组件或修饰符。
- 组件从 `@expo/ui/swift-ui` 导入，修饰符从 `@expo/ui/swift-ui/modifiers` 导入。
- 准备使用某个组件时，请获取其文档以确认 API：https://docs.expo.dev/versions/v55.0.0/sdk/ui/swift-ui/{component-name}/index.md
- 不确定某个修饰符的 API 时，请参阅文档：https://docs.expo.dev/versions/v55.0.0/sdk/ui/swift-ui/modifiers/index.md
- 每个 SwiftUI 树都必须包装在 `Host` 中。
- `RNHostView` 专门用于在 SwiftUI 树中嵌入 RN 组件。示例：

```jsx
import { Host, VStack, RNHostView } from "@expo-ui/swift-ui";
import { Pressable } from "react-native";

<Host matchContents>
  <VStack>
    <RNHostView matchContents>
      // Here, `Pressable` is an RN component so it is wrapped in `RNHostView`.
      <Pressable />
    </RNHostView>
  </VStack>
</Host>;
```

- 如果 Expo UI 中缺少所需的修饰符或 View，可以通过本地 Expo 模块进行扩展。请参阅：https://docs.expo.dev/guides/expo-ui-swift-ui/extending/index.md。扩展前请先征得用户确认。