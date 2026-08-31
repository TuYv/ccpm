---
name: expo-design-system
description: Framework (OSS). Build and maintain a design system inside an Expo app - a reusable theme of design tokens (color, spacing, typography, radius, shadow, motion), reusable component structure with variant/size/state prop conventions, and rules for when to extract a repeated view into a shared component. Use when creating or organizing theme files and design tokens (theme.ts / theme/), extending an existing theme or styling library (NativeWind, Tamagui, Restyle, Unistyles) in its own idiom, standardizing styles so screens (including AI-generated ones) look consistent and polished, building an in-app component library, or auditing an app for design-system drift (hardcoded colors, spacing, fonts). For platform styling specifics (semantic colors, HIG rules, native controls) use expo-native-ui; for folder layout of a new app use expo-project-structure.
version: 1.0.0
license: MIT
---
# Expo 设计系统

让应用中的每个屏幕都基于同一个视觉事实来源：一套 token 主题和一小组可复用组件。本技能定义 token 存放的位置、涵盖的内容、可复用组件的构成方式，以及何时应将一个重复视图提升为系统的一部分。

相邻技能负责本技能周边的层：

- `expo-native-ui` - 平台样式规则（HIG、语义颜色、控件、阴影语法）。遵循它来决定**哪些值看起来符合原生平台**；遵循本技能来决定**值存放在哪里以及如何复用**。
- `expo-project-structure` - 新应用的文件夹骨架。

对于 Tailwind 项目，将 token 作为 CSS 变量保存在 `global.css` 中，并遵循该样式库自身的配置指南。本技能中的尺度和命名仍然适用；只有存储格式发生变化。

## 参考资料

按需查阅以下资源：

```
references/
  audit.md      Audit an existing app for design-system drift: grep checks,
                scoring rubric, incremental adoption plan, and templates for
                documenting or extending components
```

## 先采用，再构建

对于已经存在屏幕的应用，第一步应该是检测，而不是构建。在编写任何 token 文件之前：

1. **查找已声明的系统。** 检查 `package.json` 中是否有样式库 - NativeWind/Tailwind、Tamagui、Restyle、Unistyles、styled-components。然后查找 token 文件：`theme.ts`、`src/theme/`、`constants/theme.ts` 或 `constants/Colors.ts`（`create-expo-app` 的默认文件）。
2. **如果存在这样的系统，它就是事实来源。** 使用它自身的惯用方式进行扩展 - 遵循它的命名、尺度和存储格式。应当针对该系统，而不是针对下面的示例，审查偏差。
3. **如果只存在约定俗成的值** - 相同的灰色和内边距在多个屏幕中重复出现，但没有主题文件 - 那么目前还没有系统。这些值是构建尺度的输入，而不是权威：根据出现频率最高的值推导 token，并对齐到 4 点网格（`references/audit.md` §5）。
4. **绝不要在已有系统旁边再引入第二套系统。** 在 Tamagui 配置旁边新建 `src/theme/` 属于设计系统偏差，而不是采用系统。

只有在完全不存在任何系统时，以下默认规则才按原样适用。

## 主题

对于没有现有系统的应用，所有设计 token 都存放在 `src/theme/` 下。对于没有 `src/` 文件夹的项目（默认的 `create-expo-app` 模板在根目录下有 `app/`、`components/` 和 `constants/`），使用等效的顶层位置 - 通常是 `theme/` 或现有的 `constants/` - 并保持相同的文件布局。先从小规模开始，随着规模增长按 token 类别拆分：

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

全新的应用可以先使用单个 `src/theme.ts` 保存下面的所有对象，然后在任意一个类别需要独立文件时，将其提升为文件夹形式（与组件采用相同的提升规则）。无论采用哪种方式，都只能有**一个**主题入口点 - 绝不能存在两个相互竞争的 token 文件。

使主题值得拥有的规则：

- **每个重复出现的视觉值都是一个令牌。** 一个字面量出现两次，就属于主题。
- **组件导入令牌；屏幕导入组件。** 屏幕文件导入 `spacing` 来设置布局内边距是合理的；屏幕文件重新定义按钮颜色则属于偏离。
- **绝不要硬编码** `src/theme/` 之外的十六进制颜色、字体大小或间距倍数。真正局部的一次性值（例如图标的 17px 视觉微调）可以内联保留——但要添加注释说明原因。

### 颜色

基于平台语义颜色构建调色板：将 `expo-router` 中的 `Color` 用 `Platform.select` 包装，集中放在 `theme/colors.ts` 中。语义颜色会在设备上解析，并自动适应浅色/深色模式——背景、标签和分隔线应优先使用它们。（`expo-native-ui` 的“Colors”涵盖了完整的调色板及其设计依据；最简版本如下：）

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

只有在品牌确实需要平台未提供的值时，才以明确的浅色/深色配对形式添加品牌颜色：

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

保持品牌颜色集合精简（强调色、强调色对比色，以及每个功能可能需要的一种着色）。其他一切都应保持语义化。

**静态安全与仅限 Hook。** 上述两种模式的适用范围不同——要明确保持边界：

- 语义/平台颜色（上面的 `colors`）是**静态安全的**：它们会在设备上解析，因此像 `theme/typography.ts` 这样的普通令牌文件可以在模块作用域导入它们。
- 品牌浅色/深色配对是**仅限 Hook 的**：`useBrandColors()` 会在渲染时读取颜色方案，因此品牌颜色只能在组件内部应用。静态令牌文件不能调用该 Hook。
- 绝不要在同一个文件中混用两者。如果静态样式（例如 `type` 字号阶梯中的一步、一个 `variants` 对象）需要品牌强调色，可以在渲染时于组件中应用品牌颜色，或者将这对颜色包装在静态动态颜色中（iOS 上使用 `DynamicColorIOS`），使其变为静态安全。

### 间距

基于 4 点网格使用一套统一尺度。按尺寸而非用途命名各级间距：

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

- 使用带有间距 token 的 `gap` 来保持布局节奏（`expo-native-ui` 更推荐使用 gap，而不是 margin）。
- 除非设计另有规定，否则屏幕边缘内边距使用 `spacing.md`——选定一种并保持一致。
- 如果布局需要使用两级之间的值，请使用最接近的级别。网格本身就是重点。
- 如果同一个 4 的中间倍数反复出现（12 和 20 很常见），请将其作为命名级别添加到尺度中，而不是到处散落字面量。此时审计白名单也必须包含该值。

### 排版

定义具名文本样式，而不是使用原始字体大小。参照平台的字号阶梯（Apple 文本样式），让字号呈现原生观感：

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

如果项目包含静态字体文件（每个字重一个文件，并通过 `expo-font` 或 config plugin 加载），请改用 `fontFamily` 名称设置字重，并省略 `fontWeight`——否则 iOS 会合成该字重，或回退到系统字体：

```tsx
headline: { fontSize: 17, fontFamily: "SFProRounded-Semibold", color: colors.label },
```

通过一个组件统一暴露这些样式，使屏幕无需直接接触 `fontSize`：

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

屏幕标题仍由导航栈的 header 提供（`expo-native-ui` 规则），因此 `largeTitle` 主要用于非栈上下文。

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

除胶囊形之外，每个圆角都要搭配 `borderCurve: "continuous"`（依据 `expo-native-ui`）。

### 阴影

阴影使用 `boxShadow` 字符串（绝不要使用旧版的 shadow/elevation 属性——参见 `expo-native-ui`）。两到三个层级的高度就足够了：

```tsx
// theme/shadows.ts
export const shadows = {
  card: "0 1px 2px rgba(0, 0, 0, 0.05)",
  raised: "0 4px 12px rgba(0, 0, 0, 0.10)",
  overlay: "0 8px 24px rgba(0, 0, 0, 0.18)",
} as const;
```

### 动效

统一使用时长以及共享的弹簧/缓动配置，使整个应用中的动画呈现关联感：

```tsx
// theme/motion.ts
export const motion = {
  fast: 150, // state feedback: press, toggle
  base: 250, // element transitions: enter/exit
  slow: 400, // large surfaces: sheets, screens
} as const;
```

Reanimated 注意事项：不要将 `Color`/`PlatformColor` 令牌值传入 Reanimated 样式中——在其中使用静态颜色（参见 `expo-native-ui`）。

## 可复用组件

主题控制值；组件控制结构。共享基础组件位于 `src/components/` 中（参见 `expo-project-structure`）。

### 组件契约

每个设计系统基础组件都应明确规定：

- **变体** - 视觉意图：`primary`、`secondary`、`ghost`、`destructive`。只有当真实屏幕确实需要时，才添加变体。
- **尺寸** - `sm`、`md`、`lg`。默认值为 `md`。尺寸映射到间距/排版令牌，绝不能使用新定义的数字。
- **状态** - 默认、**按下**（不是悬停——这是触摸设备）、禁用、加载。使用 `Pressable` 样式函数处理按下状态；可点击元素绝不能缺少按下反馈。
- **样式覆盖** - 接受 `style` 属性，并将其放在**最后**合并，这样调用方无需分叉组件即可调整布局（边距、`flex`）。调用方可以覆盖布局，但不能改变组件的身份——如果调用方要修改按钮颜色，说明现有的变体集合缺少某些内容。

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

当组件的属性开始描述*内容*（`leftIcon`、`subtitle`、`footerText`、`badgeCount`）时，不要继续添加属性，而应改为接受 `children`。一个使用令牌间距渲染 `children` 的 `Card`，比任何包含十二个内容属性的 `Card` 都更经久耐用。将属性限制在上述契约范围内：变体、尺寸、状态、样式。

### 何时提取，以及何时不提取

当**以下所有条件**都满足时，将一个视图提升到 `src/components/`：

1. 它已经出现在（或即将出现在）**两个或更多屏幕**中。在此之前，它应继续与 `screens/<name>/` 同置（参见 `expo-project-structure`）。
2. 它具有**可命名的职责**（“Card”、“EmptyState”、“Badge”），而不是“个人资料屏幕上的那个东西”。
3. 它的 API **小于其实现**。如果 props 只是重新暴露了每个内部样式，那么它还不是可复用组件——它只是一个屏幕片段。

提取路径：内联 JSX → `screens/<name>/` 中的组件 → `src/components/`。每次只前进一个步骤，在触发条件出现时再移动——绝不要凭空臆测。错误的抽象比重复代码代价更高；一个视图的第二份副本，也比一个 API 糟糕的基础组件更便宜。

**不要**仅仅为了让平台组件通过系统进行路由，就包装那些已经承载设计语言的平台组件（`Switch`、`DateTimePicker`、堆栈标题、`@expo/ui` 视图）。对于这些组件，本机样式**就是**设计系统。

## 决策所在位置

| 决策 | 所在位置 | 示例 |
|---|---|---|
| 在任意位置使用两次的视觉值 | `src/theme/` | 品牌强调色、间距级别 |
| 可复用元素的结构 + 变体 | `src/components/` | Button、Card、EmptyState |
| 单个屏幕的私有组合 | `screens/<name>/` | 个人资料页眉布局 |
| 一次性的本地调整 | 内联，并附带注释 | 对图标进行视觉微调 |
| 屏幕标题、顶层界面元素 | 导航堆栈选项 | 标题栏标题、大标题 |

## 自我批评检查

构建或修改屏幕后，截取屏幕截图，并依据以下原则进行检查（来自 [Expo 的设计原则指南](https://expo.dev/blog/how-to-apply-professional-design-principles-in-ai-app-development)）。每一项都应通过系统性修复来解决，而不是进行局部调整：

- **层级 / 对比度** - 最重要的元素是否显然处于首要位置？使用 `type` 级别步骤修复，而不是临时添加字体大小。
- **邻近 / 留白** - 相关项目是否比无关项目彼此更接近？使用 `gap` + 间距令牌修复。
- **重复 / 统一** - 所有圆角、阴影和强调色是否一致？如果不一致，说明某个值脱离了主题——将其移回主题中。
- **对齐** - 各边缘是否共享同一轴线？使用一致的屏幕边缘内边距修复。

只有在四项检查全部通过，或每个未通过检查的值都已移入主题或组件后，此检查才算完成。如果同一屏幕两次未通过同一项检查，那么修复就应归入主题或组件，而不是屏幕。

## 审查现有应用

要衡量一个已经包含多个屏幕的应用中的偏离程度——硬编码的十六进制值、任意间距、不一致的组件 API——请遵循 `./references/audit.md`。其中包含基于 grep 的检查、评分标准、用于修复已偏离应用的渐进式采用顺序，以及记录现有组件和提议新组件的模板。

## 提交反馈

如果你在此技能中发现错误、误导性信息或过时内容，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-design-system" "<actionable feedback>"
```
仅当你有具体且可执行的反馈时才提交。尽可能多地包含相关上下文。
如果 AI 代理反复失败，或用户不得不接管 Expo 任务，请加载 expo-skill-feedback 技能，并遵循其 eval-candidate 流程，而不要重复使用上面的命令。