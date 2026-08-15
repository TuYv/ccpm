---
name: expo-ui-jetpack-compose
description: "`@expo/ui/jetpack-compose` package lets you use Jetpack Compose Views and modifiers in your app."
---
> 此技能中的说明仅适用于 SDK 55。对于其他 SDK 版本，请参阅对应版本的 Expo UI Jetpack Compose 文档，以获取最准确的信息。

## 安装

```bash
npx expo install @expo/ui
```

安装后需要执行原生重新构建（`npx expo run:android`）。

## 使用说明

- Expo UI 的 API 与 Jetpack Compose 的 API 保持一致。请运用 Jetpack Compose 和 Material Design 3 的相关知识来决定使用哪些组件或修饰符。如果需要更深入的 Jetpack Compose 或 Material 3 指导（例如选择哪个组件、布局模式、主题设置），请启动一个子代理来研究 [Jetpack Compose](https://developer.android.com/develop/ui/compose/components) 和 [Material Design 3](https://m3.material.io/) 的最佳实践。
- 组件从 `@expo/ui/jetpack-compose` 导入，修饰符从 `@expo/ui/jetpack-compose/modifiers` 导入。
- **始终阅读 `.d.ts` 类型文件**，以便在使用组件或修饰符之前确认其确切 API。运行 `node -e "console.log(path.dirname(require.resolve('@expo/ui/jetpack-compose')))"` 来定位该软件包，然后阅读相关的 `{ComponentName}/index.d.ts` 文件。这是最可靠的事实来源。
- 准备使用某个组件时，请获取其文档以确认 API：https://docs.expo.dev/versions/v55.0.0/sdk/ui/jetpack-compose/{component-name}/index.md
- 不确定某个修饰符的 API 时，请参阅文档：https://docs.expo.dev/versions/v55.0.0/sdk/ui/jetpack-compose/modifiers/index.md
- 每棵 Jetpack Compose 树都必须包装在 `Host` 中。需要固有尺寸时使用 `<Host matchContents>`；需要显式尺寸时（例如作为 `LazyColumn` 的父级）使用 `<Host style={{ flex: 1 }}>`。示例：

```jsx
import { Host, Column, Button, Text } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, paddingAll } from "@expo/ui/jetpack-compose/modifiers";

<Host matchContents>
  <Column verticalArrangement={{ spacedBy: 8 }} modifiers={[fillMaxWidth(), paddingAll(16)]}>
    <Text style={{ typography: "titleLarge" }}>Hello</Text>
    <Button onPress={() => alert("Pressed!")}>Press me</Button>
  </Column>
</Host>;
```

## 关键组件

- **LazyColumn** — 对于可滚动列表，请使用此组件代替 react-native 的 `ScrollView`/`FlatList`。将其包装在 `<Host style={{ flex: 1 }}>` 中。
- **Icon** — 使用 `<Icon source={require('./icon.xml')} size={24} />` 加载 Android XML 矢量可绘制资源。获取图标的方法：前往 [Material Symbols](https://fonts.google.com/icons)，选择一个图标，选择 Android 平台，然后下载 XML 矢量可绘制资源。将这些资源保存为项目 `assets/` 目录中的 `.xml` 文件（例如 `assets/icons/wifi.xml`）。Metro 会自动打包 `.xml` 资源，无需更改 metro 配置。