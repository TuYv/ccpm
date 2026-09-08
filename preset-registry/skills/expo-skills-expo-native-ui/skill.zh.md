---
name: expo-native-ui
description: Framework (OSS). Build beautiful, native-feeling Expo screens. Covers Apple HIG styling, semantic colors, native controls, SF Symbols, media, visual effects, gradients, storage, and responsive layout. For routing and navigation, use the expo-router skill; for motion and animation, use the expo-animation skill.
version: 1.1.1
license: MIT
---
# Expo 原生 UI 指南

对于路由、链接、栈、选项卡、模态框、抽屉和标题栏，请使用 `expo-router` skill。对于任何动效——进入/退出、手势、弹簧动画、键盘驱动的 UI——请使用 `expo-animation` skill。

> **在选择任何 UI 组件之前，先检查 `expo-ui`。** `@expo/ui` 提供原生等价组件——BottomSheet、Button、Picker、Slider、Menu、Section、Switch、SegmentedControl 等——在 iOS 上以真实的 SwiftUI 呈现，在 Android 上以 Jetpack Compose 呈现，可在 Expo Go 中随 SDK 56+ 使用，无需自定义构建。先加载 **`expo-ui`** skill，在退回到 React Native 内置组件或社区库之前先找到合适的组件。这个 skill（`expo-native-ui`）负责周边结构：Expo Router 导航、布局、样式和视觉效果。

## 参考资料

按需查阅以下资源：

```
references/
  controls.md            原生 iOS：Switch、Slider、SegmentedControl、DateTimePicker、Picker
  gradients.md           通过 experimental_backgroundImage 的 CSS 渐变（仅限 New Arch）
  icons.md               通过 expo-symbols SymbolView 的 SF Symbols：名称、权重、动画
  media.md               摄像头、音频、视频和文件保存
  storage.md             SQLite、AsyncStorage、SecureStore
  visual-effects.md      模糊效果（expo-blur）和液态玻璃（expo-glass-effect）
  webgpu-three.md        3D 图形、游戏、GPU 可视化，使用 WebGPU 和 Three.js
```

## 运行应用

**关键：在创建自定义构建之前，始终先尝试 Expo Go。**

大多数 Expo 应用无需任何自定义原生代码即可在 Expo Go 中运行。在运行 `npx expo run:ios` 或 `npx expo run:android` 之前：

1. **先从 Expo Go 开始**：运行 `npx expo start`，然后用 Expo Go 扫描二维码
2. **检查功能是否可用**：在 Expo Go 中彻底测试你的应用
3. **仅在必要时创建自定义构建**——见下文

### 何时需要自定义构建

只有在使用以下内容时，你才需要 `npx expo run:ios/android` 或 `eas build`：

- **本地 Expo 模块**（`modules/` 中的自定义原生代码）
- **Apple 目标**（通过 `@bacons/apple-targets` 提供的小组件、App Clip、扩展）
- **第三方原生模块**，且不包含在 Expo Go 中
- **无法通过 `app.json` 表达的自定义原生配置**

### 何时 Expo Go 可用

Expo Go 开箱即支持广泛的功能：

- 大多数 `expo-*` 包（camera、location、sensors、sqlite 等）——但并非全部：自 SDK 53 起，Android 上的远程推送通知在 Expo Go 中不可用，而且某些包需要 Expo Go 未捆绑的原生能力（例如 WebGPU——见 `references/webgpu-three.md`）
- Expo Router 导航和深度链接
- 大多数 UI 库（reanimated、gesture handler 等）

**如果不确定，先尝试 Expo Go。** 创建自定义构建会增加复杂度、降低迭代速度，并且需要 Xcode/Android Studio 环境。

## 代码风格

- 注意未终止的字符串。确保嵌套的反引号已正确转义；切勿忘记正确转义引号。
- 始终在文件顶部使用 import 语句。
- 文件名始终使用 kebab-case，例如 `comment-card.tsx`
- 文件名中不要使用特殊字符
- 使用 path aliases 配置 tsconfig.json，并在重构时优先使用别名而不是相对导入。

## 库偏好

- **对于任何 sheet、picker、slider、toggle、menu，或分组表单区块：优先使用 `@expo/ui`（见 `expo-ui` skill），再考虑 React Native 内置或社区库** —— 它会渲染原生 SwiftUI/Compose，并且在 Expo Go 的 SDK 56+ 中可用。对于分组/设置样式的行（长度短且固定），使用 `@expo/ui` 的 `List` + `ListItem`。对于较大或长度未知的滚动列表（feed、搜索结果、目录），使用 `FlatList` 或 `FlashList` —— `@expo/ui` 的 `List` 不支持虚拟化。
- 不要使用已从 React Native 移除的模块，例如 Picker、WebView、SafeAreaView 或 AsyncStorage
- 不要使用旧版 `expo-permissions`
- 使用 `expo-audio`，不要用 `expo-av`
- 使用 `expo-video`，不要用 `expo-av`
- 使用 `expo-symbols`（`SymbolView`）来显示 SF Symbols，不要用 `@expo/vector-icons` —— 见 `references/icons.md`。SF Symbols 只适用于 Apple 平台：在 Android 上使用 Material 图标（NativeTabs 上的 `md` 属性会触发），或使用平台专用资源，绝不要使用仅限 SF 的图标样式
- 使用 `react-native-safe-area-context`，不要用 react-native 的 SafeAreaView
- 使用 `process.env.EXPO_OS`，不要用 `Platform.OS`
- 使用 `React.use`，不要用 `React.useContext`
- 使用 `expo-image` 的 Image 组件，而不是内置的 `img` 元素
- 使用 `expo-glass-effect` 实现液态玻璃背景
- 使用来自 `expo-router` 的 `Color` 表示原生语义颜色，不要用原始的 `PlatformColor`（类型安全，会自动适配浅色/深色）
- 在 SDK 56+ 中，不要直接从 `@react-navigation/*` 导入——改用 `expo-router/react-navigation`（覆盖 `@react-navigation/native`、`/core`、`/elements`、`/routers`）

## 响应式

- 包含可滚动内容的屏幕要用 ScrollView 包裹。根组件就是 FlatList/FlashList 的屏幕不要再加外层 ScrollView（列表本身就是滚动容器），而全屏页面（相机、地图、画布）则都不需要
- 使用 `<ScrollView contentInsetAdjustmentBehavior="automatic" />`，不要使用 `<SafeAreaView>`，这样可以获得更智能的安全区域内边距
- `contentInsetAdjustmentBehavior="automatic"` 也应应用到 FlatList 和 SectionList
- 使用 flexbox，而不是 Dimensions API
- 始终优先使用 `useWindowDimensions`，不要用 `Dimensions.get()` 来测量屏幕尺寸

## 行为

- 仅在 iOS 上有条件地使用 expo-haptics，以提供更愉悦的体验
- 使用带有内置触感反馈的视图，比如 React Native 的 `<Switch />` 和 `@react-native-community/datetimepicker`
- 当 Stack 路由包含可滚动内容时，把 ScrollView（或 FlatList）作为路由内的第一个组件，并设置 `contentInsetAdjustmentBehavior="automatic"`
- 对于可能被复制的数据文本，使用 `<Text selectable />` 属性
- 考虑将大数字格式化为 1.4M 或 38k
- 永远不要使用像 `img` 或 `div` 这样的内置元素，除非是在 webview 或 Expo DOM 组件中

## 样式

遵循 Apple Human Interface Guidelines。

### 通用样式规则

- 在样式中优先使用 flex gap，而不是 margin 和 padding
- 尽可能优先使用 padding，而不是 margin
- 始终考虑安全区域，要么通过 stack header 和 tabs，要么通过 ScrollView/FlatList 的 `contentInsetAdjustmentBehavior="automatic"`
- 同时确保顶部和底部安全区域内边距都被考虑到
- 优先使用内联样式，不要用 `StyleSheet.create`，除非复用样式更快
- 对于任何动效或动画工作，加载 `expo-animation` skill —— 它负责决定是否需要动画、时间参数和中断规则
- 除非要做胶囊形状，否则圆角都使用 `{ borderCurve: 'continuous' }`
- 始终使用导航栈标题，而不是页面上的自定义文本元素
- 为 ScrollView 设置内边距时，使用 `contentContainerStyle` 的 padding 和 gap，而不是直接给 ScrollView 设置 padding（这样能减少裁剪）
- 不支持 CSS 和 Tailwind - 使用内联样式

## 颜色

使用 `expo-router` 提供的 `Color` API 来获取原生语义颜色。它是对 `PlatformColor` 的类型安全封装，通过 `Color.ios.*` 暴露 iOS UIKit 颜色，通过 `Color.android.material.*`（静态）或 `Color.android.dynamic.*`（会根据 Android 12+ 上用户的壁纸自适应）暴露 Android Material 3 颜色。这些颜色会在设备端解析，并自动适配深色/浅色模式和辅助功能设置，因此你不再需要维护单独的深浅色 hex 表，也不需要 `colors.web.ts` 文件。

`Color` 是平台相关的，所以要用 `Platform.select` 包裹每个值，并为 web 提供 `default` hex 回退。将调色板集中放在 `theme/colors.ts` 中，并在各处导入 `colors`：

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
  secondarySystemBackground: Platform.select({
    ios: Color.ios.secondarySystemBackground,
    android: Color.android.dynamic.surfaceVariant,
    default: "#f2f2f7",
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

- iOS 会在系统主题变化时自动重新解析这些颜色。在 Android 上，在任何渲染这些颜色的组件中调用 `useColorScheme()`，这样主题切换时它会重新渲染（当 React Compiler 将组件 memoize 时这是必需的）。
- 不要把 `Color` / `PlatformColor` 值传给 Reanimated 样式——它们是透明的原生颜色对象，不是字符串；在这里请使用静态颜色。
- `Platform.select({...})!` 返回 `string | OpaqueColorValue`。大多数 React Native 样式属性接受 `ColorValue`（`string | OpaqueColorValue`），所以这样通常没问题。但有些第三方属性只接受 `string`（例如 `expo-image` 上的 `tintColor`）；在需要时请强制转换：`colors.label as string`。

## 文本样式

- 给每个显示重要数据或错误消息的 `<Text/>` 元素添加 `selectable` 属性
- 计数器应使用 `{ fontVariant: 'tabular-nums' }` 以便对齐

## 阴影

使用 CSS `boxShadow` 样式属性。**绝不要**使用旧式 React Native 阴影或 elevation 样式。

```tsx
<View style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }} />
```

支持 `'inset'` 阴影。

## 提交反馈

如果你遇到此 skill 中的错误、误导性或过时信息，请将其报告给 Expo 以便改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-native-ui" "<可执行的反馈>"
```
只有在你有具体且可操作的反馈时才提交。尽可能包含相关上下文。

如果某个 AI agent 在 Expo 任务上反复失败，或者用户不得不接手处理，请加载 expo-skill-feedback skill，并遵循其 eval-candidate 流程，而不是重复使用上面的命令。