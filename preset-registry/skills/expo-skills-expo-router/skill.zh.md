---
name: expo-router
description: Framework (OSS). Navigation and routing for Expo Router. Covers file-based routes, groups and dynamic routes, folder organization, Link with previews and context menus, native Stack, page titles, modals and form sheets, NativeTabs, headers and toolbars, and header search bars.
version: 1.0.1
license: MIT
---
# Expo Router 导航

适用于 Expo Router 应用的导航和路由。对于屏幕样式、颜色、控件、媒体和视觉效果，请使用 `expo-native-ui` skill；对于动效和手势，请使用 `expo-animation`。

## 参考资料

根据需要查阅以下资源：

```
references/
  route-structure.md     路由约定、动态路由、分组、文件夹组织
  tabs.md                NativeTabs、从 JS tabs 迁移、iOS 26 功能
  toolbar-and-headers.md Stack 标题栏和工具栏按钮、菜单、搜索（仅限 iOS）
  form-sheet.md          expo-router 中的表单页：配置、页脚和背景交互
  search.md              配合标题栏的搜索栏、useSearch hook、筛选模式
  zoom-transitions.md    Apple Zoom：通过 Link.AppleZoom 实现流畅的缩放转场（iOS 18+）
```

## 代码风格

- 文件名始终使用 kebab-case，例如 `comment-card.tsx`
- 移动或重构导航时，始终删除旧的路由文件
- 文件名中不得使用特殊字符
- 使用路径别名配置 `tsconfig.json`，重构时优先使用别名而不是相对导入。

## 路由

详见 `./references/route-structure.md`，了解详细的路由约定。

- 路由应放在 `app` 目录中。
- 不要在 app 目录中与组件、类型或工具共存。这是一种反模式。
- 确保应用始终有一个匹配 "/" 的路由，该路由可以位于分组路由中。

## 库偏好

- 对于原生语义颜色，使用来自 `expo-router` 的 `Color`，而不是原始的 `PlatformColor`（类型安全，并且会自动适配浅色/深色模式）。有关完整的颜色调色板模式，请参阅 `expo-native-ui`。
- 在 SDK 56+ 中，禁止直接从 `@react-navigation/*` 导入，应改用 `expo-router/react-navigation`（涵盖 `@react-navigation/native`、`/core`、`/elements`、`/routers`）

## 行为

- 添加搜索栏时，优先使用 `Stack.SearchBar`

# 导航

## Link

使用来自 'expo-router' 的 `<Link href="/path" />` 在路由之间导航。

```tsx
import { Link } from 'expo-router';

// Basic link
<Link href="/path" />

// Wrapping custom components
<Link href="/path" asChild>
  <Pressable>...</Pressable>
</Link>
```

只要可能，就加入 `<Link.Preview>` 以遵循 iOS 惯例。经常添加上下文菜单和预览，以增强导航体验。

## Stack

- 始终使用 `_layout.tsx` 文件定义堆栈
- 使用来自 'expo-router/stack' 的 Stack 来实现原生导航堆栈

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

经常使用链接预览来增强导航：

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

链接预览可以与上下文菜单结合使用。

## 模态框

将屏幕呈现为模态框：

```tsx
<Stack.Screen name="modal" options={{ presentation: "modal" }} />
```

优先使用此方式，而不是构建自定义模态框组件。

## Sheet

将屏幕呈现为动态表单 Sheet：

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

- 在 iOS 26+ 上，使用 `contentStyle: { backgroundColor: "transparent" }` 会使背景呈现液态玻璃效果。

## 常见路由结构

包含选项卡、且每个选项卡内部都有堆栈的标准应用布局：

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

创建共享组路由，以便两个选项卡都可以推入共用屏幕：

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
        headerLargeTitleEnabled: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name={screen} options={{ title: titles[screen] }} />
      <Stack.Screen name="i/[id]" options={{ headerLargeTitleEnabled: false }} />
    </Stack>
  );
}
```

`headerLargeTitleEnabled` 是 SDK 56+ 中的选项名称；旧版 SDK 使用已在上游弃用的 `headerLargeTitle`。

## 提交反馈

如果遇到错误、误导性信息或过时信息，请报告，以便 Expo 改进此技能：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-router" "<actionable feedback>"
```
只有在发现具体且可执行的问题时才提交。请附上尽可能多的相关上下文。
如果 AI agent 反复执行 Expo 任务失败，或用户不得不接管 Expo 任务，请加载 expo-skill-feedback 技能，并遵循其 eval-candidate 流程，而不是重复使用上面的命令。