---
name: expo-router
description: Framework (OSS). Navigation and routing for Expo Router. Covers file-based routes, groups and dynamic routes, folder organization, Link with previews and context menus, native Stack, page titles, modals and form sheets, NativeTabs, headers and toolbars, and header search bars.
version: 1.0.1
license: MIT
---
# Expo Router 导航

Expo Router 应用的导航和路由。有关屏幕样式、颜色、控件、动画、媒体和视觉效果，请使用 `expo-native-ui` skill。

## 参考资料

根据需要查阅以下资源：

```
references/
  route-structure.md     Route conventions, dynamic routes, groups, folder organization
  tabs.md                NativeTabs, migration from JS tabs, iOS 26 features
  toolbar-and-headers.md Stack headers and toolbar buttons, menus, search (iOS only)
  form-sheet.md          Form sheets in expo-router: configuration, footers and background interaction.
  search.md              Search bar with headers, useSearch hook, filtering patterns
  zoom-transitions.md    Apple Zoom: fluid zoom transitions with Link.AppleZoom (iOS 18+)
```

## 代码风格

- 文件名始终使用 kebab-case，例如 `comment-card.tsx`
- 移动或重构导航时，始终删除旧的路由文件
- 文件名中绝不使用特殊字符
- 使用路径别名配置 tsconfig.json，并在重构时优先使用别名而非相对导入。

## 路由

有关详细的路由约定，请参阅 `./references/route-structure.md`。

- 路由应位于 `app` 目录中。
- 绝不要将组件、类型或工具与路由放在 app 目录中。这是一种反模式。
- 确保应用始终有一个匹配 "/" 的路由，它可以位于分组路由中。

## 库使用偏好

- 使用 `expo-router` 中的 `Color` 表示原生语义颜色，而不是原始的 `PlatformColor`（类型安全，可自动适配浅色/深色模式）。有关完整的调色板模式，请参阅 `expo-native-ui`。
- 在 SDK 56+ 中，绝不要直接从 `@react-navigation/*` 导入——改用 `expo-router/react-navigation`（涵盖 `@react-navigation/native`、`/core`、`/elements`、`/routers`）

## 行为

- 优先使用 `Stack.SearchBar` 为屏幕添加搜索栏

# 导航

## Link

使用 'expo-router' 中的 `<Link href="/path" />` 在路由之间导航。

```tsx
import { Link } from 'expo-router';

// Basic link
<Link href="/path" />

// Wrapping custom components
<Link href="/path" asChild>
  <Pressable>...</Pressable>
</Link>
```

只要可行，就添加 `<Link.Preview>` 以遵循 iOS 惯例。经常添加上下文菜单和预览，以增强导航体验。

## Stack

- 始终使用 `_layout.tsx` 文件定义栈
- 使用 'expo-router/stack' 中的 Stack 实现原生导航栈

### 页面标题

使用 `Stack.Title` 设置页面标题：

```tsx
<Stack.Title>Home</Stack.Title>
```

## 上下文菜单

为 Link 组件添加长按上下文菜单：

```tsx
import { Link } from "expo-router";

<Link href="/settings" asChild>
  <Link.Trigger>
    <Pressable>
      <Card />
    </Pressable>
  </Link.Trigger>
  <Link.Menu>
    <Link.MenuAction
      title="Share"
      icon="square.and.arrow.up"
      onPress={handleSharePress}
    />
    <Link.MenuAction
      title="Block"
      icon="nosign"
      destructive
      onPress={handleBlockPress}
    />
    <Link.Menu title="More" icon="ellipsis">
      <Link.MenuAction title="Copy" icon="doc.on.doc" onPress={() => {}} />
      <Link.MenuAction
        title="Delete"
        icon="trash"
        destructive
        onPress={() => {}}
      />
    </Link.Menu>
  </Link.Menu>
</Link>;
```

## 链接预览

经常使用链接预览以增强导航体验：

```tsx
<Link href="/settings">
  <Link.Trigger>
    <Pressable>
      <Card />
    </Pressable>
  </Link.Trigger>
  <Link.Preview />
</Link>
```

链接预览可以与上下文菜单一起使用。

## 模态窗口

将屏幕以模态窗口形式呈现：

```tsx
<Stack.Screen name="modal" options={{ presentation: "modal" }} />
```

优先使用这种方式，而不是构建自定义模态组件。

## 表单页

将屏幕以动态表单页形式呈现：

```tsx
<Stack.Screen
  name="sheet"
  options={{
    presentation: "formSheet",
    sheetGrabberVisible: true,
    sheetAllowedDetents: [0.5, 1.0],
    contentStyle: { backgroundColor: "transparent" },
  }}
/>
```

- 使用 `contentStyle: { backgroundColor: "transparent" }` 可使背景在 iOS 26+ 上呈现液态玻璃效果。

## 常见路由结构

一种标准的应用布局，其中包含标签页，并在每个标签页内使用堆栈：

```
app/
  _layout.tsx — <NativeTabs />
  (index,search)/
    _layout.tsx — <Stack />
    index.tsx — Main list
    search.tsx — Search view
```

```tsx
// app/_layout.tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { ThemeProvider, DarkTheme, DefaultTheme } from "expo-router/react-navigation";
import { useColorScheme } from "react-native";

export default function Layout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NativeTabs>
        <NativeTabs.Trigger name="(index)">
          <NativeTabs.Trigger.Icon sf="list.dash" md="list" />
          <NativeTabs.Trigger.Label>Items</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(search)" role="search" />
      </NativeTabs>
    </ThemeProvider>
  );
}
```

创建共享分组路由，使两个标签页都能推入公共屏幕：

```tsx
// app/(index,search)/_layout.tsx
import { Stack } from "expo-router/stack";
import { colors } from "@/theme/colors";

export default function Layout({ segment }) {
  const screen = segment.match(/\((.*)\)/)?.[1]!;
  const titles: Record<string, string> = { index: "Items", search: "Search" };

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: { color: colors.label },
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name={screen} options={{ title: titles[screen] }} />
      <Stack.Screen name="i/[id]" options={{ headerLargeTitle: false }} />
    </Stack>
  );
}
```

## 提交反馈
如果你在此技能中遇到错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-router" "<actionable feedback>"
```
仅当你有具体且可执行的问题需要报告时才提交。请尽可能包含更多相关上下文。
如果 AI 智能体反复失败，或者用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并遵循其 eval-candidate 流程，而不要重复使用上述命令。