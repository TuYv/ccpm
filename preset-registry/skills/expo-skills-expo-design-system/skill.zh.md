---
name: expo-design-system
description: Framework (OSS). Build and maintain a design system inside an Expo app - a reusable theme of design tokens (color, spacing, typography, radius, shadow, motion), reusable component structure with variant/size/state prop conventions, and rules for when to extract a repeated view into a shared component. Use when creating or organizing theme files and design tokens (theme.ts / theme/), extending an existing theme or styling library (NativeWind, Tamagui, Restyle, Unistyles) in its own idiom, standardizing styles so screens (including AI-generated ones) look consistent and polished, building an in-app component library, or auditing an app for design-system drift (hardcoded colors, spacing, fonts). For platform styling specifics (semantic colors, HIG rules, native controls) use expo-native-ui; for Tailwind/CSS setup use expo-tailwind-setup; for folder layout of a new app use expo-project-structure.
version: 1.0.0
license: MIT
---
# Expo 设计系统

让应用中的每个屏幕都源自同一个视觉事实来源：一套令牌主题和一小组可复用组件。本技能定义了令牌的存放位置、覆盖范围、可复用组件的构建方式，以及何时应将重复出现的视图提升到系统中。

同级技能负责本技能周边的层次：

- `expo-native-ui` - 平台样式规则（HIG、语义化颜色、控件、阴影语法）。关于**哪些值符合原生风格**，请遵循该技能；关于**值存放在哪里以及如何复用**，请遵循本技能。
- `expo-tailwind-setup` - 如果项目使用 Tailwind，令牌将以 CSS 变量的形式存放在 `global.css` 中，而不是 TypeScript 中。本技能中的尺度和命名仍然适用；只有存储格式发生变化。
- `expo-project-structure` - 新应用的文件夹骨架。

## 参考资料

根据需要查阅以下资源：

```
references/
  audit.md      Audit an existing app for design-system drift: grep checks,
                scoring rubric, incremental adoption plan, and templates for
                documenting or extending components
```

## 构建之前先采用

对于已经存在屏幕的应用，第一步是检测，而不是构建。在编写任何令牌文件之前：

1. **查找已声明的系统。** 检查 `package.json` 中是否存在样式库——NativeWind/Tailwind（使用 `expo-tailwind-setup`）、Tamagui、Restyle、Unistyles、styled-components。然后查找令牌文件：`theme.ts`、`src/theme/`、`constants/theme.ts` 或 `constants/Colors.ts`（create-expo-app 的默认文件）。
2. **如果存在，它就是事实来源。** 按照其自身的惯用方式进行扩展——包括它的命名、尺度和存储格式。应根据该系统审查偏移，而不是根据下方的示例。
3. **如果只存在事实上的值**——相同的灰色和内边距在多个屏幕中重复出现，但没有主题文件——那么系统尚未建立。这些值是构建尺度的输入，而不是权威标准：从最常用的值中推导令牌，并对齐到 4 点网格（`references/audit.md` §5）。
4. **绝不要在现有系统旁边引入第二套系统。** 在 Tamagui 配置旁新建 `src/theme/` 会造成设计系统偏移，而不是采用现有系统。

只有在什么都不存在时，才按原样应用下方的默认设置。

## 主题

在没有现有系统的应用中，所有设计令牌都存放在 `src/theme/` 下。对于没有 `src/` 文件夹的项目（默认的 `create-expo-app` 模板在根目录下包含 `app/`、`components/` 和 `constants/`），请使用等效的顶层位置——通常是 `theme/` 或现有的 `constants/`——并保持相同的文件布局。开始时保持精简，随着规模增长再按令牌类别拆分：

```
src/theme/
  colors.ts       # see expo-native-ui "Colors" for the palette pattern
  spacing.ts
  typography.ts
  radius.ts
  shadows.ts
  motion.ts
  index.ts        # re-exports everything: import { spacing, type } from "@/theme"
```

全新的应用可以从单个 `src/theme.ts` 开始，在其中包含下方的所有对象；当任意一个类别需要独立文件时，再将其提升为文件夹形式（采用与组件相同的提升规则）。无论采用哪种形式，都只能有**一个**主题入口——绝不能存在两个相互竞争的令牌文件。

让主题值得存在的规则：

- **每个重复出现的视觉值都应成为令牌。** 同一个字面值出现两次，就应归入主题。
- **组件导入令牌；页面导入组件。** 页面文件导入 `spacing` 用作布局内边距没有问题；页面文件重新定义按钮颜色则属于样式漂移。
- **绝不要硬编码** `src/theme/` 之外的十六进制颜色、字号或间距倍数。真正仅用于局部的一次性值（例如，为图标添加 17px 的视觉微调）可以保留为内联值，但要通过注释说明原因。

### 颜色

基于平台语义颜色构建调色板：使用 `expo-router` 中的 `Color`，通过 `Platform.select` 封装，并集中放在 `theme/colors.ts` 中。语义颜色会在设备上解析并自动适配浅色/深色模式——背景、标签和分隔线应优先使用它们。（`expo-native-ui` 的“颜色”部分介绍了完整的调色板及其设计依据；最小版本如下：）

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
  // Deliberately fixed: text on a tinted (accent) surface stays white in both modes.
  onTint: "#ffffff",
};
```

仅当品牌需要平台未提供的值时，才以明确的浅色/深色配对形式添加品牌颜色：

```tsx
// theme/colors.ts (brand additions)
import { useColorScheme } from "react-native";

const brandPalette = {
  light: { accent: "#5B21B6", accentContrast: "#FFFFFF" },
  dark: { accent: "#A78BFA", accentContrast: "#1E1B4B" },
} as const;

export function useBrandColors() {
  const scheme = useColorScheme();
  return brandPalette[scheme === "dark" ? "dark" : "light"];
}
```

品牌颜色集应保持精简（强调色、强调色对比色，也许再为每项功能提供一种色调）。其他所有颜色都继续使用语义颜色。

**静态安全与仅限 Hook。** 上述两种模式的适用范围不同——应明确划分边界：

- 语义/平台颜色（上面的 `colors`）是**静态安全的**：它们在设备上解析，因此 `theme/typography.ts` 这类普通令牌文件可以在模块作用域导入它们。
- 品牌浅色/深色配对**仅限 Hook**：`useBrandColors()` 会在渲染时读取配色方案，因此品牌颜色只能在组件内部应用。静态令牌文件不能调用该 Hook。
- 绝不要将两者混合在同一个文件中。如果静态样式（`type` 比例层级、`variants` 对象）需要品牌强调色，要么在渲染时于组件中应用品牌颜色，要么将这对颜色封装为静态动态颜色（iOS 上使用 `DynamicColorIOS`），使其成为静态安全的颜色。

### 间距

使用一套基于 4 点网格的尺度。按尺寸而非用途命名各个层级：

```tsx
// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
```

- 使用带有间距令牌的 `gap` 来控制布局节奏（`expo-native-ui` 倾向于使用 gap 而非 margin）。
- 除非设计另有要求，否则屏幕边缘内边距使用 `spacing.md`——选定一个值并保持一致。
- 如果布局需要一个介于两个层级之间的值，请使用最接近的层级。网格本身才是重点。
- 如果同一个介于层级之间的 4 的倍数反复出现（常见的是 12 和 20），请将其作为一个命名层级添加到尺度中，而不是散布字面量。审计白名单也必须将其包含在内。

### 排版

定义命名文本样式，而不是使用原始字号。参照平台的字号梯度（Apple 文本样式），让字号具有原生观感：

```tsx
// theme/typography.ts
import { TextStyle } from "react-native";
import { colors } from "./colors";

export const type = {
  largeTitle: { fontSize: 34, fontWeight: "700", color: colors.label },
  title: { fontSize: 22, fontWeight: "600", color: colors.label },
  headline: { fontSize: 17, fontWeight: "600", color: colors.label },
  body: { fontSize: 17, fontWeight: "400", color: colors.label },
  subhead: { fontSize: 15, fontWeight: "400", color: colors.secondaryLabel },
  caption: { fontSize: 12, fontWeight: "400", color: colors.secondaryLabel },
} as const satisfies Record<string, TextStyle>;
```

如果项目打包了静态字体文件（每个字重对应一个文件，并通过 `expo-font` 或配置插件加载），请改为通过 `fontFamily` 名称设置字重，并省略 `fontWeight`——否则 iOS 会合成该字重或回退到系统字体：

```tsx
headline: { fontSize: 17, fontFamily: "SFProRounded-Semibold", color: colors.label },
```

通过单一组件暴露这些样式，使各个屏幕永远不直接使用 `fontSize`：

```tsx
// components/themed-text.tsx
import { Text, TextProps } from "react-native";
import { type } from "@/theme";

export function ThemedText({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: keyof typeof type }) {
  return <Text style={[type[variant], style]} {...props} />;
}
```

屏幕标题仍然来自导航堆栈标题栏（`expo-native-ui` 规则），因此 `largeTitle` 主要用于非堆栈上下文。

### 圆角

```tsx
// theme/radius.ts
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999, // capsules
} as const;
```

为每个非胶囊形圆角搭配 `borderCurve: "continuous"`（遵循 `expo-native-ui`）。

### 阴影

阴影使用 `boxShadow` 字符串（绝不使用旧版 shadow/elevation 属性——参见 `expo-native-ui`）。两到三个高度层级就足够了：

```tsx
// theme/shadows.ts
export const shadows = {
  card: "0 1px 2px rgba(0, 0, 0, 0.05)",
  raised: "0 4px 12px rgba(0, 0, 0, 0.10)",
  overlay: "0 8px 24px rgba(0, 0, 0, 0.18)",
} as const;
```

### 动效

定义持续时间以及共享的弹簧/缓动配置，让整个应用中的动画具有一致的观感：

```tsx
// theme/motion.ts
export const motion = {
  fast: 150, // state feedback: press, toggle
  base: 250, // element transitions: enter/exit
  slow: 400, // large surfaces: sheets, screens
} as const;
```

Reanimated 注意事项：不要将 `Color`/`PlatformColor` token 值传入 Reanimated 样式——请在那里使用静态颜色（参见 `expo-native-ui`）。

## 可复用组件

主题控制取值；组件控制结构。共享基础组件位于 `src/components/` 中（参见 `expo-project-structure`）。

### 组件契约

每个设计系统基础组件都需要明确定义：

- **变体**——视觉意图：`primary`、`secondary`、`ghost`、`destructive`。只有实际页面需要时才添加变体。
- **尺寸**——`sm`、`md`、`lg`。默认为 `md`。尺寸应映射到间距/排版 token，绝不使用新定义的数值。
- **状态**——默认、**按下**（不是悬停——这是触控交互）、禁用、加载中。使用 `Pressable` 样式函数处理按下状态；绝不能让可点击元素缺少按下反馈。
- **样式覆盖**——接受 `style` prop，并将其放在**最后**合并，这样调用方无需派生组件，就能调整布局（外边距、flex）。调用方可以覆盖布局，但不能改变组件标识——如果调用方需要更改按钮颜色，说明现有变体集合缺少某种变体。

```tsx
// components/button.tsx
import { Pressable, ActivityIndicator, ViewStyle, StyleProp } from "react-native";
import { colors, spacing, radius } from "@/theme";
import { ThemedText } from "./themed-text";

const variants = {
  primary: { backgroundColor: colors.systemBlue, color: colors.onTint },
  secondary: { backgroundColor: colors.separator, color: colors.label },
} as const;

const sizes = {
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
} as const;

export function Button({
  variant = "primary",
  size = "md",
  title,
  loading,
  disabled,
  style,
  onPress,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: variants[variant].backgroundColor,
          borderRadius: radius.md,
          borderCurve: "continuous",
          alignItems: "center",
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
          ...sizes[size],
        },
        style, // caller overrides merge last
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variants[variant].color as string} />
      ) : (
        <ThemedText variant="headline" style={{ color: variants[variant].color }}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}
```

### 组合优于配置

当组件的 props 开始描述*内容*（`leftIcon`、`subtitle`、`footerText`、`badgeCount`）时，应停止添加 props，转而接受 `children`。一个使用 token 间距来渲染 `children` 的 `Card`，会比一个拥有十二个内容 props 的 `Card` 更经久耐用。props 应仅用于上述契约：变体、尺寸、状态、样式。

### 何时提取——以及何时不提取

仅当**同时**满足以下所有条件时，才将视图提升到 `src/components/`：

1. 它已经（或即将）出现在**两个或更多屏幕**中。在此之前，它应与 `screens/<name>/` 保持共置（参见 `expo-project-structure`）。
2. 它具有一个**可命名的职责**（“Card”“EmptyState”“Badge”），而不是“个人资料屏幕上的那个东西”。
3. 它的 API **小于其实现**。如果 props 只是重新暴露每个内部样式，那么它还不是可复用组件——它只是一个屏幕片段。

提升路径：内联 JSX → `screens/<name>/` 中的组件 → `src/components/`。每次只移动一步，并且仅在触发条件满足时进行——绝不预先推测。错误抽象的成本高于重复；复制一份视图，比创建一个 API 设计不佳的基础组件成本更低。

不要仅仅为了让已经承载设计语言的平台组件（`Switch`、`DateTimePicker`、堆栈标题栏、`@expo/ui` 视图）接入系统而包装它们。对于这些组件，原生样式*就是*设计系统。

## 决策应位于何处

| 决策 | 所在位置 | 示例 |
|---|---|---|
| 在任意位置使用两次的视觉值 | `src/theme/` | 品牌强调色、间距步长 |
| 复用元素的结构和变体 | `src/components/` | Button、Card、EmptyState |
| 单个屏幕的私有组合 | `screens/<name>/` | 个人资料页头部布局 |
| 一次性的局部调整 | 内联，并附带注释 | 对图标进行视觉微调 |
| 屏幕标题、顶层界面框架 | 导航堆栈选项 | 标题栏标题、大标题 |

## 自我审查流程

构建或更改屏幕后，对其进行截图，并依据以下原则进行检查（这些原则来自 [Expo 的设计原则指南](https://expo.dev/blog/how-to-apply-professional-design-principles-in-ai-app-development)）。每一项都对应系统层面的修复，而不是局部调整：

- **层级 / 对比度**——最重要的元素是否显然处于首要位置？使用 `type` 字阶中的层级进行修复，而不是使用临时指定的字号。
- **邻近性 / 留白**——相关项目之间是否比不相关项目之间更靠近？使用 `gap` + 间距 token 进行修复。
- **重复性 / 统一性**——所有圆角、阴影和强调色是否一致？如果不一致，说明某个值游离在主题之外——将其移入主题。
- **对齐**——各边缘是否共用对齐轴？使用一致的屏幕边缘内边距进行修复。

只有当全部四项检查都通过，或者每个未通过检查的值都已移入主题或组件时，该流程才算完成。如果一个屏幕两次未通过同一项检查，修复就应放在主题或组件中，而不是屏幕中。

## 审查现有应用

要衡量一个已经包含多个屏幕的应用中的偏移情况——硬编码的十六进制值、随意的间距、不一致的组件 API——请遵循 `./references/audit.md`。其中包含基于 grep 的检查、评分标准、修复存在偏移的应用时采用的渐进式接入顺序，以及用于记录现有组件和提议新组件的模板。

## 提交反馈
如果你在此 skill 中发现错误、误导性信息或过时信息，请报告，以便 Expo 进行改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-design-system" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI agent 反复失败，或者用户不得不接管 Expo 任务，请加载 expo-skill-feedback skill 并遵循其 eval-candidate 流程，而不要重复使用上述命令。