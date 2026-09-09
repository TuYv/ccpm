---
name: expo-design-system
description: Framework (OSS). Build and maintain a design system inside an Expo app - a reusable theme of design tokens (color, spacing, typography, radius, shadow, motion), reusable component structure with variant/size/state prop conventions, and rules for when to extract a repeated view into a shared component. Use when creating or organizing theme files and design tokens (theme.ts / theme/), extending an existing theme or styling library (NativeWind, Tamagui, Restyle, Unistyles) in its own idiom, standardizing styles so screens (including AI-generated ones) look consistent and polished, fixing an app that looks AI-generated or generic instead of native (the named native-slop tells), building an in-app component library, or auditing an app for design-system drift (hardcoded colors, spacing, fonts). For platform styling specifics (semantic colors, HIG rules, native controls) use expo-native-ui; for folder layout of a new app use expo-project-structure.
version: 1.0.0
license: MIT
---
# Expo 设计系统

让应用中的每个屏幕都源自同一个视觉真相来源：一个 token 主题和一小组可复用组件。本技能定义了 token 放在哪里、涵盖哪些内容、可复用组件如何成形，以及何时将重复视图提升到系统中。

相邻技能负责围绕此技能的层级：

- `expo-native-ui` - 平台样式规则（HIG、语义颜色、控件、阴影语法）。关于**哪些值看起来原生**，遵循它；关于**值放在哪里以及如何复用**，遵循本技能。
- `expo-project-structure` - 新应用的文件夹骨架。

对于 Tailwind 项目，将 token 作为 CSS 变量保存在 `global.css` 中，并遵循样式库自身的设置指南。本技能中的尺度和命名仍然适用；只有存储格式发生变化。

## 参考资料

根据需要查阅这些资源：

```
references/
  audit.md        Audit an existing app for design-system drift: grep checks,
                  scoring rubric, incremental adoption plan, and templates for
                  documenting or extending components
  native-slop.md  The 20 named anti-pattern tells of AI-generated apps (The Web
                  Modal, Everything's a Card, ...) with grep checks for the greppable ones
```

## 先采用，再构建

在已经有屏幕的应用中，第一步是检测，而不是构建。在编写任何 token 文件之前：

1. **查找已声明的系统。** 检查 `package.json` 中是否有样式库 - NativeWind/Tailwind、Tamagui、Restyle、Unistyles、styled-components。然后查找 token 文件：`theme.ts`、`src/theme/`、`constants/theme.ts` 或 `constants/Colors.ts`（`create-expo-app` 的默认值）。
2. **如果存在，它就是真相来源。** 用它自身的惯用方式扩展它 - 它的名称、它的尺度、它的存储格式。根据该系统审计漂移，而不是根据下面的示例。
3. **如果只有事实上的值存在** - 相同的灰色和内边距在屏幕中重复出现，却没有主题文件 - 那么还没有系统。这些值是尺度的输入，而不是权威：从最常见的值中派生 token，并对齐到 4 点网格（`references/audit.md` §5）。
4. **绝不要在现有系统旁边引入第二套系统。** 在 Tamagui 配置旁边新建一个 `src/theme/` 是设计系统漂移，而不是采用。

只有在什么都不存在时，下面的默认设置才按原样适用。

## 主题

在没有现有系统的应用中，所有设计 token 都位于 `src/theme/` 下。在没有 `src/` 文件夹的项目中（默认的 `create-expo-app` 模板在根目录有 `app/`、`components/` 和 `constants/`），使用等效的顶层位置 - 通常是 `theme/` 或现有的 `constants/` - 并保持相同的文件布局。从小规模开始，并随着增长按 token 类别拆分：

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

一个全新的应用可以先使用单个 `src/theme.ts` 文件存放下面的所有对象，然后在任意一个类需要独立文件时，将其提升为文件夹形式（与组件采用相同的提升规则）。无论采用哪种形式，都必须始终只有**一个**主题入口点——绝不能存在两个相互竞争的 token 文件。

让主题值得存在的规则：

- **每个重复出现的视觉值都必须是 token。** 一个字面值出现两次，就应该放入主题中。
- **组件导入 token；屏幕导入组件。** 屏幕文件导入 `spacing` 来设置布局内边距是合理的；屏幕文件重新定义按钮颜色则会造成偏离。
- **绝不要**在 `src/theme/` 之外硬编码十六进制颜色、字号或间距倍数。确实属于局部的一次性值（例如图标 17px 的视觉微调）可以直接写在代码中——但必须附带注释说明原因。

### 颜色

基于平台语义颜色构建调色板：在 `theme/colors.ts` 中使用 `expo-router` 提供的 `Color`，并通过 `Platform.select` 进行封装。语义颜色会在设备上解析，并自动适配浅色/深色模式——背景、标签和分隔线应优先使用这些颜色。（`expo-native-ui` 的“颜色”涵盖了完整的调色板及其设计理由；最小版本如下：）

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

保持品牌颜色集合精简（强调色、强调色对比色，以及每个功能可能需要的一种色调）。其他所有颜色都继续使用语义颜色。

**静态安全与仅限 hook。** 上述两种模式的适用范围不同——必须明确保持这一边界：

- 语义/平台颜色（上面的 `colors`）是**静态安全的**：它们会在设备上解析，因此像 `theme/typography.ts` 这样的普通 token 文件可以在模块作用域导入它们。
- 品牌浅色/深色配对是**仅限 hook 的**：`useBrandColors()` 会在渲染时读取颜色模式，因此品牌颜色只能在组件内部应用。静态 token 文件不能调用该 hook。
- 绝不要在同一个文件中混用两者。如果静态样式（例如 `type` 字号阶梯中的某一步、`variants` 对象）需要品牌强调色，可以在渲染时于组件中应用品牌颜色，或者将这对颜色包装进静态动态颜色（iOS 上使用 `DynamicColorIOS`），使其变为静态安全。

### 间距

一套尺度，基于 4 点网格。按尺寸命名步级，而不是按用途命名：

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

- 使用带有间距 token 的 `gap` 来形成布局节奏（`expo-native-ui` 相比 margin 更偏好 gap）。
- 屏幕边缘内边距为 `spacing.md`，除非设计另有说明——选择一个并保持一致。
- 如果某个布局需要介于两个步级之间的值，使用最接近的步级。网格才是重点。
- 如果相同的 4 的中间倍数反复出现（12 和 20 很常见），将其作为命名步级添加到尺度中，而不是到处分散使用字面量。审计白名单也必须包含它。

### 排版

定义具名文本样式，而不是原始字号。对齐平台阶梯（Apple 文本样式），让尺寸感觉原生：

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

如果项目打包了静态字体文件（每种字重一个文件，通过 `expo-font` 或配置插件加载），则改用 `fontFamily` 名称来设置字重，并省略 `fontWeight`——否则 iOS 会合成字重或回退到系统字体：

```tsx
headline: { fontSize: 17, fontFamily: "SFProRounded-Semibold", color: colors.label },
```

通过一个组件暴露它们，这样屏幕永远不会直接接触 `fontSize`：

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

屏幕标题仍然来自导航栈 header（`expo-native-ui` 规则），因此 `largeTitle` 主要用于非栈上下文。

**动态字体。** 文本会随用户的系统文本大小设置缩放（`allowFontScaling` 默认开启）。在文本周围使用 padding 或 `minHeight`，以便行可以增长，并检查较大的无障碍文本大小。先让标签换行或重排，再考虑对受限界面元素使用逐元素的 `maxFontSizeMultiplier`；仅仅是密集行并不是限制可读文本的理由。绝不要用 `allowFontScaling={false}` 在全应用范围禁用缩放。

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

将每个非胶囊形圆角都搭配 `borderCurve: "continuous"`（按照 `expo-native-ui`）。

### 阴影

阴影是 `boxShadow` 字符串（绝不要使用旧式 shadow/elevation 属性——参见 `expo-native-ui`）。两到三个层级就足够了：

```tsx
// theme/shadows.ts
export const shadows = {
  card: "0 1px 2px rgba(0, 0, 0, 0.05)",
  raised: "0 4px 12px rgba(0, 0, 0, 0.10)",
  overlay: "0 8px 24px rgba(0, 0, 0, 0.18)",
} as const;
```

### 动效

持续时间以及共享的弹簧/缓动配置，让整个应用中的动画具有一致的关联感：

```tsx
// theme/motion.ts
export const motion = {
  fast: 150, // state feedback: press, toggle
  base: 250, // element transitions: enter/exit
  slow: 400, // large surfaces: sheets, screens
} as const;
```

Reanimated 注意事项：不要将 `Color`/`PlatformColor` token 值传入 Reanimated 样式中——在那里使用静态颜色（参见 `expo-native-ui`）。

## 可复用组件

主题控制取值；组件控制结构。共享的基础组件位于 `src/components/` 中（参见 `expo-project-structure`）。

### 组件契约

每个设计系统基础组件都要明确定义：

- **变体** - 视觉意图：`primary`、`secondary`、`ghost`、`destructive`。只有在实际页面需要时才添加变体。
- **尺寸** - `sm`、`md`、`lg`。默认为 `md`。尺寸映射到间距/排版 token，而不是新设数字。
- **状态** - 默认、**按下**（不是悬停——这是触摸设备）、禁用、加载。使用 `Pressable` 样式函数处理按下状态；绝不要让可点击元素缺少按下反馈。
- **样式覆盖** - 接受 `style` prop，并将其放在最后合并，这样调用方可以调整布局（边距、flex），而无需复制组件实现。调用方可以覆盖布局，而不能覆盖组件的身份——如果调用方修改按钮的颜色，这说明现有变体集合缺少某种变体。
- **可访问性** - 自定义交互基础组件应根据适用情况暴露其角色以及禁用/忙碌/选中状态。文本子元素可以提供标签；仅图标控件，以及用加载指示器替代文本的按钮，需要明确的标签，并且在加载期间该标签仍然可用。原生控件的标签也要进行验证。

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
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
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

### 优先组合而非配置

当组件的 props 开始描述*内容*（`leftIcon`、`subtitle`、`footerText`、`badgeCount`）时，停止继续添加 props，改为接受 `children`。一个使用 token padding 渲染 `children` 的 `Card`，比任何拥有十二个内容 props 的 `Card` 都更经久耐用。将 props 保留给更上层的契约：variant、size、state、style。

### 何时提取，以及何时不提取

当**以下所有条件**都满足时，将视图提升到 `src/components/`：

1. 它已经（或即将）出现在**两个或更多屏幕**中。在此之前，它应继续与 `screens/<name>/` 放在一起（参见 `expo-project-structure`）。
2. 它具有一个**可命名的职责**（“Card”“EmptyState”“Badge”），而不是“个人资料屏幕上的那个东西”。
3. 它的 API **小于其实现**。如果 props 只是重新暴露所有内部样式，那么它还不是可复用组件——它只是一个屏幕片段。

提取路径：内联 JSX → `screens/<name>/` 中的组件 → `src/components/`。仅在触发条件出现时一次前进一级，绝不要臆测性地提取。错误的抽象所付出的代价高于重复；复制一份视图的成本低于创建一个 API 糟糕的基础组件。

**不要**为了让已经承载设计语言的平台组件（`Switch`、`DateTimePicker`、堆栈标题、`@expo/ui` 视图）经过系统，而去包装它们。对于这些组件，本机样式**就是**设计系统。

## 决策所在的位置

| 决策 | 位于 | 示例 |
|---|---|---|
| 在任何地方使用两次的视觉值 | `src/theme/` | 品牌强调色、间距步长 |
| 可复用元素的结构 + 变体 | `src/components/` | Button、Card、EmptyState |
| 单个屏幕的私有组合 | `screens/<name>/` | 个人资料页眉布局 |
| 一次性的局部调整 | 内联，并附带注释 | 对图标进行视觉上的微调 |
| 屏幕标题、顶层界面元素 | 导航堆栈选项 | 页眉标题、大标题 |

## 自我批评检查

完成或修改屏幕后，截取屏幕截图，并根据以下原则检查它（这些原则来自 [Expo 的设计原则指南](https://expo.dev/blog/how-to-apply-professional-design-principles-in-ai-app-development)）。每一项都应通过系统修复，而不是局部调整：

- **层级 / 对比度** - 最重要的元素是否一眼就排在首位？使用 `type` 比例级别修复，而不是临时添加字号。
- **邻近 / 留白** - 相关项目是否比不相关项目彼此更接近？使用 `gap` + 间距 token 修复。
- **重复 / 统一** - 所有圆角、阴影和强调色是否一致？如果不一致，说明某个值逃逸了主题；将它移回主题。
- **对齐** - 各边缘是否共享同一轴线？使用一致的屏幕边缘内边距修复。

修复某个值后，重新检查渲染结果；将它移入主题本身并不会修复布局。如果同一个缺陷在多个屏幕中反复出现，请修复共享 token 或组件。同时运行 `expo-native-ui` 的 Behavior 部分中的主要任务检查和内容检查；仅凭屏幕截图无法验证交互。

## 已命名的失败模式：原生松垮感

使用这些名称来识别构建和审查时的常见错误：

- **Web 弹窗** - 用于编写内容或进行选择的自定义居中对话框。优先使用原生 sheet（`formSheet`、`@expo/ui` BottomSheet）或菜单；对于会产生重要后果的操作，原生确认警告框仍然适用。
- **万物皆卡片** - 每一行和每个区块都放在各自的白色圆角阴影盒子中。使用分组列表；通过背景和细分隔线进行分组，而不是使用边框。
- **Emoji 图标** - 使用 🔥 ⚙️ ✨ 作为标签页或按钮图标。iOS 使用 SF Symbols，Android 使用 Material 图标。
- **紫色渐变主视觉** - 以装饰性渐变介绍区域将任务推到首屏以下。以有用的内容引导任务页面；当主视觉有助于实现所请求的体验时，可以保留它。
- **加载指示器闪烁** - 每次状态切换之间都显示全屏加载指示器，或在首次加载期间闪现“暂时还没有项目”。每个页面都有四种状态（请参阅 `expo-data-fetching`）。

将这些视觉特征视为评审提示，而不是对卡片、字体或品牌元素的一概禁止。修复可观察到的问题，并遵循用户的要求以及现有的设计系统。完整的 20 项列表和候选 grep 检查位于 `./references/native-slop.md`；评审页面时，使用它们解释问题及替代方案。

## 审计现有应用

要衡量一个已有页面的应用中的设计偏移——硬编码的十六进制值、任意间距、不一致的组件 API——请遵循 `./references/audit.md`。其中包含基于 grep 的检查、评分标准、修复设计偏移应用的渐进式采用顺序，以及用于记录现有组件和提出新组件的模板。

## 提交反馈
如果你在此 skill 中遇到错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-design-system" "<actionable feedback>"
```
仅当你有具体且可执行的反馈时才提交。请尽可能包含相关上下文。
如果 AI agent 反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill，并遵循其 eval-candidate 流程，而不是重复使用上面的命令。