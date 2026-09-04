---
name: vercel-react-native-skills
description:
  React Native and Expo best practices for building performant mobile apps. Use
  when building React Native components, optimizing list performance,
  implementing animations, or working with native modules. Triggers on tasks
  involving React Native, Expo, mobile performance, or native platform APIs.
license: MIT
metadata:
  author: vercel
  version: '1.0.0'
---
# React Native 技能

面向 React Native 和 Expo 应用的全面最佳实践。其中包含跨多个类别的规则，涵盖性能、动画、UI 模式以及针对特定平台的优化。

## 何时应用

在以下情况下参考这些指南：

- 构建 React Native 或 Expo 应用
- 优化列表和滚动性能
- 使用 Reanimated 实现动画
- 处理图像和媒体
- 配置原生模块或字体
- 组织带有原生依赖的 monorepo 项目结构

## 按优先级划分的规则类别

| 优先级 | 类别     | 影响 | 前缀                 |
| ------ | -------- | ---- | -------------------- |
| 1      | 列表性能 | 严重 | `list-performance-`  |
| 2      | 动画     | 高   | `animation-`         |
| 3      | 导航     | 高   | `navigation-`        |
| 4      | UI 模式  | 高   | `ui-`                |
| 5      | 状态管理 | 中   | `react-state-`       |
| 6      | 渲染     | 中   | `rendering-`         |
| 7      | Monorepo | 中   | `monorepo-`          |
| 8      | 配置     | 低   | `fonts-`、`imports-` |

## 快速参考

### 1. 列表性能（严重）

- `list-performance-virtualize` - 对大型列表使用 FlashList
- `list-performance-item-memo` - 对列表项组件进行记忆化
- `list-performance-callbacks` - 稳定回调引用
- `list-performance-inline-objects` - 避免内联样式对象
- `list-performance-function-references` - 将函数提取到 render 之外
- `list-performance-images` - 优化列表中的图像
- `list-performance-item-expensive` - 将高开销操作移出列表项
- `list-performance-item-types` - 对异构列表使用 item 类型

### 2. 动画（高）

- `animation-gpu-properties` - 仅对 transform 和 opacity 做动画
- `animation-derived-value` - 使用 useDerivedValue 处理计算型动画
- `animation-gesture-detector-press` - 使用 Gesture.Tap 代替 Pressable

### 3. 导航（高）

- `navigation-native-navigators` - 使用原生 stack 和原生 tabs，而非 JS 导航器

### 4. UI 模式（高）

- `ui-expo-image` - 对所有图像使用 expo-image
- `ui-image-gallery` - 使用 Galeria 实现图片灯箱
- `ui-pressable` - 使用 Pressable 而非 TouchableOpacity
- `ui-safe-area-scroll` - 在 ScrollView 中处理安全区域
- `ui-scrollview-content-inset` - 使用 contentInset 处理头部
- `ui-menus` - 使用原生上下文菜单
- `ui-native-modals` - 尽可能使用原生模态框
- `ui-measure-views` - 使用 onLayout，而非 measure()
- `ui-styling` - 使用 StyleSheet.create 或 Nativewind

### 5. 状态管理（中）

- `react-state-minimize` - 尽量减少状态订阅
- `react-state-dispatcher` - 对回调使用 dispatcher 模式
- `react-state-fallback` - 在首次渲染时显示 fallback
- `react-compiler-destructure-functions` - 为 React Compiler 进行解构
- `react-compiler-reanimated-shared-values` - 配合编译器处理 shared values

### 6. 渲染（中）

- `rendering-text-in-text-component` - 将文本包裹在 Text 组件中
- `rendering-no-falsy-and` - 避免在条件渲染中使用 falsy &&

### 7. Monorepo（中）

- `monorepo-native-deps-in-app` - 将原生依赖保留在应用包中
- `monorepo-single-dependency-versions` - 在各个包之间使用统一版本

### 8. 配置（低）

- `fonts-config-plugin` - 使用 config 插件配置自定义字体
- `imports-design-system-folder` - 组织设计系统的导入
- `js-hoist-intl` - 提升 Intl 对象的创建

## 如何使用

阅读各个规则文件以获取详细解释和代码示例：

```
rules/list-performance-virtualize.md
rules/animation-gpu-properties.md
```

每个规则文件包含：

- 简要说明该规则为何重要
- 附带说明的错误代码示例
- 附带说明的正确代码示例
- 补充背景和参考资料

## 完整汇编文档

如需展开所有规则的完整指南：`AGENTS.md`
