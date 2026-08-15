---
name: expo-native-ui
description: Framework (OSS). Build beautiful, native-feeling Expo screens. Covers Apple HIG styling, semantic colors, native controls, SF Symbols, media, animations, visual effects, gradients, storage, and responsive layout. For routing and navigation, use the expo-router skill.
version: 1.1.1
license: MIT
---
# Expo 原生 UI 指南

对于路由、链接、堆栈、选项卡、模态框、工作表和标题栏，请使用 `expo-router` skill。

## 参考资料

根据需要查阅以下资源：

```
references/
  animations.md          Reanimated: entering, exiting, layout, scroll-driven, gestures
  controls.md            Native iOS: Switch, Slider, SegmentedControl, DateTimePicker, Picker
  gradients.md           CSS gradients via experimental_backgroundImage (New Arch only)
  icons.md               SF Symbols via expo-image (sf: source), names, animations, weights
  media.md               Camera, audio, video, and file saving
  storage.md             SQLite, AsyncStorage, SecureStore
  visual-effects.md      Blur (expo-blur) and liquid glass (expo-glass-effect)
  webgpu-three.md        3D graphics, games, GPU visualizations with WebGPU and Three.js
```

## 运行应用

**关键：在创建自定义构建之前，始终先尝试 Expo Go。**

大多数 Expo 应用无需任何自定义原生代码即可在 Expo Go 中运行。在运行 `npx expo run:ios` 或 `npx expo run:android` 之前：

1. **从 Expo Go 开始**：运行 `npx expo start`，然后使用 Expo Go 扫描二维码
2. **检查功能是否正常**：在 Expo Go 中全面测试你的应用
3. **仅在必要时创建自定义构建**——见下文

### 何时需要自定义构建

仅在使用以下内容时，才需要 `npx expo run:ios/android` 或 `eas build`：

- **本地 Expo 模块**（`modules/` 中的自定义原生代码）
- **Apple targets**（通过 `@bacons/apple-targets` 实现的 widgets、app clips、extensions）
- **Expo Go 中未包含的第三方原生模块**
- **无法在 `app.json` 中表达的自定义原生配置**

### 何时可以使用 Expo Go

Expo Go 原生支持大量功能：

- 所有 `expo-*` 软件包（camera、location、notifications 等）
- Expo Router 导航
- 大多数 UI 库（reanimated、gesture handler 等）
- 推送通知、深度链接等更多功能

**如果不确定，请先尝试 Expo Go。** 创建自定义构建会增加复杂性、减慢迭代速度，并且需要配置 Xcode/Android Studio。

## 代码风格

- 谨防未终止的字符串。确保嵌套反引号已转义；绝不要忘记正确转义引号。
- 始终将 import 语句放在文件顶部。
- 文件名始终使用 kebab-case，例如 `comment-card.tsx`
- 切勿在文件名中使用特殊字符
- 使用路径别名配置 tsconfig.json，并在重构时优先使用别名而非相对导入。

## 库偏好

- 切勿使用已从 React Native 中移除的模块，例如 Picker、WebView、SafeAreaView 或 AsyncStorage
- 切勿使用旧版 expo-permissions
- 使用 `expo-audio`，而非 `expo-av`
- 使用 `expo-video`，而非 `expo-av`
- 对于 SF Symbols，使用带有 `source="sf:name"` 的 `expo-image`，而非 `expo-symbols` 或 `@expo/vector-icons`
- 使用 `react-native-safe-area-context`，而非 react-native SafeAreaView
- 使用 `process.env.EXPO_OS`，而非 `Platform.OS`
- 使用 `React.use`，而非 `React.useContext`
- 使用 `expo-image` 的 Image 组件，而非内置元素 `img`
- 使用 `expo-glass-effect` 实现液态玻璃背景
- 对于原生语义化颜色，使用来自 `expo-router` 的 `Color`，而非原始的 `PlatformColor`（类型安全，可自动适配浅色/深色模式）
- 在 SDK 56+ 中，切勿直接从 `@react-navigation/*` 导入——应改用 `expo-router/react-navigation`（涵盖 `@react-navigation/native`、`/core`、`/elements`、`/routers`）

## 响应式设计

- 始终将根组件包裹在滚动视图中，以实现响应式布局
- 使用 `<ScrollView contentInsetAdjustmentBehavior="automatic" />` 代替 `<SafeAreaView>`，以更智能地处理安全区域内边距
- `contentInsetAdjustmentBehavior="automatic"` 也应应用于 FlatList 和 SectionList
- 使用 flexbox，而不是 Dimensions API
- 测量屏幕尺寸时，始终优先使用 `useWindowDimensions`，而不是 `Dimensions.get()`

## 行为

- 在 iOS 上有条件地使用 expo-haptics，以提供更令人愉悦的体验
- 使用具有内置触觉反馈的视图，例如 React Native 中的 `<Switch />` 和 `@react-native-community/datetimepicker`
- 当路由属于 Stack 时，其第一个子组件几乎总是应为设置了 `contentInsetAdjustmentBehavior="automatic"` 的 ScrollView
- 向页面添加 `ScrollView` 时，它几乎总是应作为路由组件内部的第一个组件
- 对包含可复制数据的文本使用 `<Text selectable />` 属性
- 考虑将大数字格式化为 1.4M 或 38k
- 除非在 webview 或 Expo DOM 组件中，否则绝不要使用类似 'img' 或 'div' 的原生元素

# 样式

遵循 Apple 人机界面指南。

## 通用样式规则

- 优先使用 flex gap，而不是 margin 和 padding 样式
- 尽可能优先使用 padding，而不是 margin
- 始终考虑安全区域，可通过 stack headers、tabs 或 ScrollView/FlatList 的 `contentInsetAdjustmentBehavior="automatic"` 实现
- 确保同时考虑顶部和底部安全区域内边距
- 使用内联样式，而不是 StyleSheet.create，除非复用样式效率更高
- 为状态变化添加进入和退出动画
- 对圆角使用 `{ borderCurve: 'continuous' }`，除非要创建胶囊形状
- 始终使用导航 stack 标题，而不是页面上的自定义文本元素
- 为 ScrollView 添加内边距时，请使用 `contentContainerStyle` 的 padding 和 gap，而不要在 ScrollView 本身设置 padding（可减少裁剪）
- 不支持 CSS 和 Tailwind——请使用内联样式

## 颜色

使用 `expo-router` 中的 `Color` API 获取原生语义化颜色。它是 `PlatformColor` 的类型安全封装，通过 `Color.ios.*` 提供 iOS UIKit 颜色，并通过 `Color.android.material.*`（静态）或 `Color.android.dynamic.*`（在 Android 12+ 上根据用户的壁纸进行调整）提供 Android Material 3 颜色。这些颜色会在设备上解析，并自动适应浅色/深色模式和辅助功能设置，因此无需再维护单独的浅色/深色十六进制颜色表或 `colors.web.ts` 文件。

`Color` 与平台相关，因此请使用 `Platform.select` 包裹每个值，并为 web 提供 `default` 十六进制回退值。将调色板集中定义在 `theme/colors.ts` 中，并在各处导入 `colors`：

```tsx
// theme/colors.ts
import { Platform } from "react-native";
import { Color } from "expo-router";

export const colors = {
  label: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: "#000000",
  })!,
  secondaryLabel: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#3c3c43",
  })!,
  separator: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outlineVariant,
    default: "#c6c6c8",
  })!,
  systemBackground: Platform.select({
    ios: Color.ios.systemBackground,
    android: Color.android.dynamic.surface,
    default: "#ffffff",
  })!,
  systemBlue: Platform.select({
    ios: Color.ios.systemBlue,
    android: Color.android.dynamic.primary,
    default: "#007aff",
  })!,
};
```

```tsx
import { colors } from "@/theme/colors";

<View style={{ backgroundColor: colors.systemBackground }}>
  <Text style={{ color: colors.label }}>Title</Text>
</View>;
```

- 当系统主题发生变化时，iOS 会自动重新解析这些颜色。在 Android 上，请在任何渲染这些颜色的组件内调用 `useColorScheme()`，以便在主题切换时触发重新渲染（当 React Compiler 对组件进行记忆化时，这是必需的）。
- 不要将 `Color` / `PlatformColor` 值传入 Reanimated 样式——应在其中使用静态颜色（参见 `references/animations.md`）。
- `Platform.select({...})!` 返回 `string | OpaqueColorValue`。大多数 React Native 样式属性都接受 `ColorValue`（`string | OpaqueColorValue`），因此这样使用没有问题。但某些第三方属性只接受 `string`（例如 `expo-image` 上的 `tintColor`）。需要时进行类型断言：`colors.label as string`。

## 文本样式

- 为每个显示重要数据或错误消息的 `<Text/>` 元素添加 `selectable` 属性
- 计数器应使用 `{ fontVariant: 'tabular-nums' }` 以实现对齐

## 阴影

使用 CSS `boxShadow` 样式属性。绝不要使用旧版 React Native 阴影或 elevation 样式。

```tsx
<View style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }} />
```

支持 'inset' 阴影。

## 提交反馈
如果你在此 skill 中发现错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-native-ui" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI 智能体反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill 并遵循其 eval-candidate 流程，而不要重复使用上述命令。