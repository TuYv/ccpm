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

React Native 和 Expo 应用的全面最佳实践。包含多个类别的规则，涵盖性能、动画、UI 模式和平台特定优化。

## 适用场景

在以下情况下参考这些指南：

- 构建 React Native 或 Expo 应用
- 优化列表和滚动性能
- 使用 Reanimated 实现动画
- 处理图像和媒体
- 配置原生模块或字体
- 使用原生依赖组织 monorepo 项目

## 按优先级划分的规则类别

| 优先级 | 类别         | 影响程度 | 前缀                 |
| ------ | ------------ | -------- | -------------------- |
| 1      | 列表性能     | 严重     | `list-performance-`  |
| 2      | 动画         | 高       | `animation-`         |
| 3      | 导航         | 高       | `navigation-`        |
| 4      | UI 模式      | 高       | `ui-`                |
| 5      | 状态管理     | 中       | `react-state-`       |
| 6      | 渲染         | 中       | `rendering-`         |
| 7      | Monorepo     | 中       | `monorepo-`          |
| 8      | 配置         | 低       | `fonts-`, `imports-` |

## 快速参考

### 1. 列表性能（严重）

- `list-performance-virtualize` - 对大型列表使用 FlashList
- `list-performance-item-memo` - 对列表项组件进行记忆化
- `list-performance-callbacks` - 保持回调引用稳定
- `list-performance-inline-objects` - 避免使用内联样式对象
- `list-performance-function-references` - 将函数提取到渲染过程之外
- `list-performance-images` - 优化列表中的图像
- `list-performance-item-expensive` - 将高开销工作移到列表项之外
- `list-performance-item-types` - 对异构列表使用列表项类型

### 2. 动画（高）

- `animation-gpu-properties` - 仅对 transform 和 opacity 进行动画处理
- `animation-derived-value` - 对计算型动画使用 useDerivedValue
- `animation-gesture-detector-press` - 使用 Gesture.Tap 而非 Pressable

### 3. 导航（高）

- `navigation-native-navigators` - 优先使用原生堆栈和原生标签页，而非 JS 导航器

### 4. UI 模式（高）

- `ui-expo-image` - 所有图像均使用 expo-image
- `ui-image-gallery` - 使用 Galeria 实现图像灯箱
- `ui-pressable` - 使用 Pressable 而非 TouchableOpacity
- `ui-safe-area-scroll` - 在 ScrollViews 中处理安全区域
- `ui-scrollview-content-inset` - 对页眉使用 contentInset
- `ui-menus` - 使用原生上下文菜单
- `ui-native-modals` - 尽可能使用原生模态框
- `ui-measure-views` - 使用 onLayout，而非 measure()
- `ui-styling` - 使用 StyleSheet.create 或 Nativewind

### 5. 状态管理（中）

- `react-state-minimize` - 尽量减少状态订阅
- `react-state-dispatcher` - 对回调使用分发器模式
- `react-state-fallback` - 在首次渲染时显示后备内容
- `react-compiler-destructure-functions` - 为 React Compiler 使用解构
- `react-compiler-reanimated-shared-values` - 使用编译器处理共享值

### 6. 渲染（中）

- `rendering-text-in-text-component` - 将文本包裹在 Text 组件中
- `rendering-no-falsy-and` - 避免使用 falsy && 进行条件渲染

### 7. Monorepo（中）

- `monorepo-native-deps-in-app` - 将原生依赖保留在 app 包中
- `monorepo-single-dependency-versions` - 在各个包中使用统一版本

### 8. 配置（低）

- `fonts-config-plugin` - 为自定义字体使用 config 插件
- `imports-design-system-folder` - 组织设计系统的导入
- `js-hoist-intl` - 提升 Intl 对象的创建

## 使用方法

阅读各个规则文件以获取详细说明和代码示例：

```
rules/list-performance-virtualize.md
rules/animation-gpu-properties.md
```

每个规则文件包含：

- 关于其重要性的简要说明
- 带有说明的错误代码示例
- 带有说明的正确代码示例
- 更多背景信息和参考资料

## 完整编译文档

包含所有规则完整说明的完整指南：`AGENTS.md`