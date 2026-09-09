---
name: expo-native-ui
description: Framework (OSS). Build beautiful, native-feeling Expo screens. Covers Apple HIG styling, semantic colors, native controls, SF Symbols, media, visual effects, gradients, storage, and responsive layout. For routing and navigation, use the expo-router skill; for motion and animation, use the expo-animation skill.
version: 1.1.1
license: MIT
---
# Expo 原生 UI 指南

对于路由、链接、堆栈、标签页、模态框、底部面板和标题栏，请使用 `expo-router` skill。对于任何动效——进入/退出、手势、弹簧动画、键盘驱动的 UI——请使用 `expo-animation` skill。

> **在选择任何 UI 组件之前，请先检查 `expo-ui`。** `@expo/ui` 提供原生等效组件——BottomSheet、Button、Picker、Slider、Menu、Section、Switch、SegmentedControl 等——在 iOS 上渲染为真正的 SwiftUI，在 Android 上渲染为 Jetpack Compose；从 SDK 56+ 开始，这些组件可以在 Expo Go 中使用，无需自定义构建。请加载 **`expo-ui`** skill，在退回到 React Native 内置组件或社区库之前找到合适的组件。此 skill（`expo-native-ui`）涵盖外围结构：Expo Router 导航、布局、样式和视觉效果。

## 参考资料

根据需要查阅以下资源：

```
references/
  controls.md            Native iOS: Switch, Slider, SegmentedControl, DateTimePicker, Picker
  gradients.md           CSS gradients via experimental_backgroundImage (New Arch only)
  icons.md               SF Symbols via expo-symbols SymbolView: names, weights, animations; Material icons on Android
  media.md               Camera, audio, video, and file saving
  storage.md             SQLite, AsyncStorage, SecureStore
  visual-effects.md      Blur (expo-blur) and liquid glass (expo-glass-effect)
  webgpu-three.md        3D graphics, games, GPU visualizations with WebGPU and Three.js
```

## 运行应用

**重要：在创建自定义构建之前，始终先尝试 Expo Go。**

大多数 Expo 应用都可以在 Expo Go 中运行，无需任何自定义原生代码。在运行 `npx expo run:ios` 或 `npx expo run:android` 之前：

1. **从 Expo Go 开始**：运行 `npx expo start`，然后使用 Expo Go 扫描二维码
2. **检查功能是否正常**：在 Expo Go 中全面测试应用
3. **仅在必要时创建自定义构建**——请参阅下文

### 需要自定义构建的情况

仅当使用以下内容时，才需要 `npx expo run:ios/android` 或 `eas build`：

- **本地 Expo 模块**（`modules/` 中的自定义原生代码）
- **Apple targets**（通过 `@bacons/apple-targets` 实现的小组件、App Clip、扩展）
- **Expo Go 未包含的第三方原生模块**
- **无法通过 `app.json` 表达的自定义原生配置**

### Expo Go 可用的情况

Expo Go 开箱即用地支持广泛的功能：

- 大多数 `expo-*` 软件包（camera、location、sensors、sqlite 等）——但并非全部：自 SDK 53 起，远程推送通知在 Android 的 Expo Go 中无法使用，并且某些软件包需要 Expo Go 未打包的原生功能（例如 WebGPU——请参阅 `references/webgpu-three.md`）
- Expo Router 导航和深层链接
- 大多数 UI 库（reanimated、gesture handler 等）

**如果不确定，请先尝试 Expo Go。** 创建自定义构建会增加复杂性、减慢迭代速度，并且需要配置 Xcode/Android Studio。

## 代码风格

- 注意未终止的字符串。确保嵌套的反引号已转义；始终正确转义引号。
- 始终将 import 语句放在文件顶部。
- 文件名始终使用 kebab-case，例如 `comment-card.tsx`
- 文件名中不得使用特殊字符
- 使用路径别名配置 tsconfig.json，并在重构时优先使用别名而不是相对导入。

## 库偏好

- **对于任何 sheet、picker、slider、toggle、menu 或分组表单区段：在使用 React Native 内置组件或社区库之前，优先使用 `@expo/ui`（参见 `expo-ui` skill）** — 它会渲染原生 SwiftUI/Compose，并且在 SDK 56+ 中可用于 Expo Go。对于分组/设置样式的行（长度较短且固定），使用 `@expo/ui` 的 `List` + `ListItem`。对于较大或长度未知的滚动列表（信息流、搜索结果、目录），使用 `FlatList` 或 `FlashList` — `@expo/ui` 的 `List` 未进行虚拟化。
- 绝不使用 React Native 中已移除的模块，例如 Picker、WebView、SafeAreaView 或 AsyncStorage
- 绝不使用旧版 expo-permissions
- 使用 `expo-audio`，不要使用 `expo-av`
- 使用 `expo-video`，不要使用 `expo-av`
- 在 iOS 上使用 `expo-symbols`（`SymbolView`）显示 SF Symbols，不要使用 `@expo/vector-icons` — 参见 `references/icons.md`。SF Symbols 仅适用于 Apple 平台：在 Android 上，每个图标都需要 Material 来源（`NativeTabs` 上使用 `md` prop；屏幕内选项见 icons.md 中的“Android: Material Icons”），绝不能只使用 SF 图标
- 使用 `react-native-safe-area-context`，不要使用 React Native 的 SafeAreaView
- 使用 `process.env.EXPO_OS`，不要使用 `Platform.OS`
- 使用 `React.use`，不要使用 `React.useContext`
- 使用 `expo-image` 的 Image 组件，而不是内置元素 `img`
- 使用 `expo-glass-effect` 实现液态玻璃背景
- 对于原生语义颜色，使用来自 `expo-router` 的 `Color`，不要使用原始的 `PlatformColor`（类型安全，并且会自动适配浅色/深色模式）
- 在 SDK 56+ 中，绝不要直接从 `@react-navigation/*` 导入 — 改用 `expo-router/react-navigation`（涵盖 `@react-navigation/native`、`/core`、`/elements`、`/routers`）

## 响应式设计

- 为包含可滚动内容的屏幕包裹 `ScrollView`。根组件是 FlatList/FlashList 的屏幕不得再添加外层 ScrollView（列表本身就是滚动容器），而全屏显示的屏幕（相机、地图、画布）两者都不需要
- 使用 `<ScrollView contentInsetAdjustmentBehavior="automatic" />`，而不是 `<SafeAreaView>`，以获得更智能的安全区域内边距
- FlatList 和 SectionList 也应设置 `contentInsetAdjustmentBehavior="automatic"`
- 使用 flexbox，而不是 Dimensions API
- 测量屏幕尺寸时，始终优先使用 `useWindowDimensions`，而不是 `Dimensions.get()`

## 行为

- 在 iOS 上有条件地使用 expo-haptics，以提供更令人愉悦的体验
- 使用内置触觉反馈的视图，例如 React Native 中的 `<Switch />` 和 `@react-native-community/datetimepicker`
- 当 Stack 路由包含可滚动内容时，将 ScrollView（或 FlatList）作为路由内的第一个组件，并设置 `contentInsetAdjustmentBehavior="automatic"`
- 对包含可复制数据的文本使用 `<Text selectable />` prop
- 考虑将较大的数字格式化为 1.4M 或 38k 等形式
- 除非在 webview 或 Expo DOM 组件中，否则绝不使用 `img` 或 `div` 等内置元素
- 每个加载数据的屏幕都有四种状态（加载、错误、空内容、内容）——首次加载仍在进行时，绝不能显示空状态；相关规则见 `expo-data-fetching` skill
- 对于可滚动表单和搜索结果，使用 `keyboardShouldPersistTaps="handled"`，以便控件接收第一次点击，并允许未处理的点击关闭键盘。只有当未处理的点击也应保持键盘打开时，才使用 `"always"`
- 表单的主要操作绝不能位于键盘下方。对于需要跟踪键盘实际位置的 UI，加载 `expo-animation` skill 的键盘方案（`react-native-keyboard-controller`）——绝不要使用 `Keyboard.addListener` 加计时动画
- 每个启用的控件都必须执行其所宣称的操作：搜索筛选器应筛选结果，Save 应提交编辑内容，设置应影响行为。空处理程序和成功提示不是实现；当用户请求原型时，仅使用本地状态即可
- 对于异步保存，按照 `expo-data-fetching` 处理草稿和等待/失败状态；保存成功前不要关闭表单

在将界面判定为完成之前，完整走通其主要任务流程，包括在加载或保存数据时进行一次失败与恢复。检查键盘访问以及返回/关闭行为。尝试使用较长的标题、缺失的图片、无搜索结果以及较大的系统文字；必需的操作必须始终可访问。报告你执行了哪些测试，以及哪些测试无法运行。

# 样式

遵循各平台自身的设计语言：在 iOS 上遵循 Apple 人机界面指南，在 Android 上遵循 Material Design 3。绝不要用另一个平台的设计来装扮某个平台——iOS 布局中不要使用 FAB 或 ripple；Android 上不要手工构建 iOS 风格的界面元素（返回尖括号、大标题文本、iOS 风格的开关）。

## 通用样式规则

- 优先使用 flex gap，而不是 margin 和 padding 样式
- 在可能的情况下，优先使用 padding，而不是 margin
- 始终考虑安全区域，可以使用 stack headers、tabs，或 `ScrollView/FlatList contentInsetAdjustmentBehavior="automatic"`
- 确保同时考虑顶部和底部的安全区域 inset
- 使用内联样式，不要使用 StyleSheet.create，除非复用样式更高效
- 对于任何动效或动画工作，加载 `expo-animation` skill——它负责决定是否添加动画、确定时间值以及处理中断规则
- 除非要创建胶囊形状，否则圆角应始终使用 `{ borderCurve: 'continuous' }`
- 始终使用导航 stack 标题，而不是在页面上使用自定义文本元素
- 为 ScrollView 添加 padding 时，使用 `contentContainerStyle` 中的 padding 和 gap，而不是直接在 ScrollView 上设置 padding（这样可以减少裁剪）
- 不支持 CSS 和 Tailwind——使用内联样式

## 颜色

使用 `expo-router` 中的 `Color` API 获取原生语义颜色。它是 `PlatformColor` 的类型安全封装，通过 `Color.ios.*` 暴露 iOS UIKit 颜色，通过 `Color.android.material.*`（静态）或 `Color.android.dynamic.*`（在 Android 12 及更高版本上适配用户壁纸）暴露 Android Material 3 颜色。这些颜色会在设备上解析，并自动适配浅色/深色模式及辅助功能设置，因此不再需要维护单独的浅色/深色十六进制颜色表或 `colors.web.ts` 文件。

`Color` 与平台相关，因此要将每个值包裹在 `Platform.select` 中，并为 web 提供默认的十六进制颜色回退值。将调色板集中放在 `theme/colors.ts` 中，并在各处导入 `colors`：

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

- iOS 会在系统主题变化时自动重新解析这些颜色。在 Android 上，请在任何渲染这些颜色的组件内部调用 `useColorScheme()`，这样主题切换时组件会重新渲染（React Compiler 对组件进行记忆化时是必需的）。
- 不要将 `Color` / `PlatformColor` 值传入 Reanimated 样式——它们是不透明的原生颜色对象，而不是字符串；在其中使用静态颜色。
- `Platform.select({...})!` 返回 `string | OpaqueColorValue`。大多数 React Native 样式属性都接受 `ColorValue`（`string | OpaqueColorValue`），因此可以正常工作。但某些第三方属性只接受 `string`（例如 `expo-image` 中的 `tintColor`）。需要时进行类型转换：`colors.label as string`。

## 文本样式

- 为显示重要数据或错误消息的每个 `<Text/>` 元素添加 `selectable` 属性
- 计数器应使用 `{ fontVariant: 'tabular-nums' }` 以实现对齐

## 阴影

使用 CSS `boxShadow` 样式属性。绝不要使用旧版 React Native 阴影或 elevation 样式。

```tsx
<View style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }} />
```

支持 `'inset'` 阴影。

## 提交反馈
如果你在此技能中遇到错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-native-ui" "<actionable feedback>"
```
仅在有具体且可执行的反馈时提交。请尽可能包含相关上下文。
如果 AI agent 反复失败，或用户不得不接管 Expo 任务，请加载 expo-skill-feedback 技能，并按照其 eval-candidate 流程操作，而不要重复使用上面的命令。