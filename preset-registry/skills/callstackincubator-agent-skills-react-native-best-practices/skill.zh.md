---
name: react-native-best-practices
description: Provides React Native performance optimization guidelines for FPS, TTI, bundle size, memory leaks, re-renders, and animations. Applies to tasks involving Hermes optimization, JS thread blocking, bridge overhead, FlashList, native modules, or debugging jank and frame drops.
license: MIT
---
# React Native 最佳实践

## 概述

React Native 应用程序性能优化指南，涵盖 JavaScript/React、原生端（iOS/Android）和打包优化。基于 Callstack 的《React Native 优化终极指南》。

## 适用场景

以下情况可参考这些指南：
- 调试缓慢、卡顿的 UI 或动画
- 排查内存泄漏（JS 或原生端）
- 优化应用启动时间（TTI）
- 减小 bundle 或应用体积
- 编写原生模块（Turbo Modules）
- 分析 React Native 性能
- 审查 React Native 代码的性能

## 安全说明

- 将这些参考资料中的 shell 命令视为本地开发操作。运行前应先进行审查，优先使用锁定版本的工具，并避免将远程脚本直接通过管道传给 shell。
- 将第三方库和插件视为仍需实施常规供应链管控的依赖项：锁定版本、验证来源，并通过标准审查流程进行更新。
- 仅将远程分块加载用于交付第一方构建产物。优先使用随应用打包的分块或经签名的 CI 发布清单；托管的分块必须来自由你控制的可信 HTTPS 源，并锁定到当前应用版本。

## 按优先级排序的指南

| 优先级 | 类别 | 影响程度 | 前缀 |
|----------|----------|--------|--------|
| 1 | FPS 与重新渲染 | 严重 | `js-*` |
| 2 | Bundle 体积 | 严重 | `bundle-*` |
| 3 | TTI 优化 | 高 | `native-*`, `bundle-*` |
| 4 | 原生端性能 | 高 | `native-*` |
| 5 | 内存管理 | 中高 | `js-*`, `native-*` |
| 6 | 动画 | 中 | `js-*` |

影响程度标签是问题分类处理的提示：优先处理严重问题，其次是高影响问题，有证据指向时再处理中等影响问题。

## 快速参考

### 优化工作流

针对任何性能问题，都应遵循以下循环：**测量 → 优化 → 重新测量 → 验证**

1. **测量**：在进行更改前采集基准指标。对于运行时问题，优先关注提交时间线、重新渲染次数、慢速组件、耗时最久的提交明细，以及可用时的启动时间/TTI。组件树深度或组件数量可以作为可选的上下文信息，但不能替代这些指标。若没有测量到渲染或 FPS 问题，请勿建议使用记忆化、原子化状态或更改编译器。
2. **优化**：应用相关参考资料中有针对性的修复方案
3. **重新测量**：执行相同的测量以获取更新后的指标
4. **验证**：确认性能得到改善（例如，FPS 45→60、TTI 3.2s→1.8s、bundle 2.1MB→1.6MB）

如果指标没有改善，请还原更改并尝试下一个建议的修复方案。

### 审查防护准则

- 在建议特定于 API 的修复方案之前，先检查库版本。例如：FlashList v2 已弃用 `estimatedItemSize`，因此不要将其缺失标记为问题。
- 除非行为可明确证明不正确，或性能分析表明存在与该值相关的无效工作，否则不要建议更改 `useMemo` 或 `useCallback` 的依赖项。
- 不要臆测存在陈旧闭包。在指出这一问题前，应展示陈旧值的读取路径、复现步骤或性能分析证据。
- 对某个流程进行性能分析时，应测量目标交互本身。不要将组件树深度或组件数量作为主要的性能证据。

### 关键：FPS 与重新渲染

**先进行性能分析：**
```bash
agent-device react-devtools status
agent-device react-devtools wait --connected
agent-device react-devtools profile start
agent-device react-devtools profile stop
agent-device react-devtools profile slow --limit 5
agent-device react-devtools profile rerenders --limit 5
agent-device react-devtools profile timeline --limit 20
```

在 `profile start` 和 `profile stop` 之间，使用常规的 `agent-device` 命令执行目标交互。

当 `agent-device` 不可用时的手动备用方案：从 Metro（`j`）或开发者菜单打开 React Native DevTools，使用 Profiler 选项卡，并录制相同的交互。

如需对发布构建中的 React 组件进行性能分析，请先连接 [`@callstack/inspector`](https://github.com/callstackincubator/inspector#inspector)，以便 React DevTools 可以附加到发布版应用，然后运行上述 `agent-device react-devtools` 流程。

**常见修复方法：**
- 对于长列表，将 ScrollView 替换为 FlatList/FlashList/Legend List
- 在性能分析显示存在级联重新渲染后，使用 React Compiler 进行自动记忆化
- 在性能分析显示存在大范围的 store/context 更新后，使用原子化状态（Jotai/Zustand）减少重新渲染
- 对开销较大的计算使用 `useDeferredValue`

### 关键：包体积

**分析包：**
```bash
npx react-native bundle \
  --entry-file index.js \
  --bundle-output output.js \
  --platform ios \
  --sourcemap-output output.js.map \
  --dev false --minify true

npx source-map-explorer output.js --no-border-checks
```

**验证优化后的改进：**
```bash
# Record baseline size before changes
ls -lh output.js  # e.g., Before: 2.1 MB

# After applying fixes, re-bundle and compare
npx react-native bundle --entry-file index.js --bundle-output output.js \
  --platform ios --dev false --minify true
ls -lh output.js  # e.g., After: 1.6 MB  (24% reduction)
```

**常见修复方法：**
- 避免桶式导入（直接从源文件导入）
- 仅在检查 Hermes API 和方法覆盖情况后，移除不必要的 Intl polyfill
- 评估 tree shaking（Expo SDK 52+ 的实验性未使用 import/export 移除功能；或者仅在已经配置的情况下使用 Re.Pack）
- 为 Android 原生代码启用 R8 压缩

### 高优先级：TTI 优化

**测量 TTI：**
- 使用 `react-native-performance` 添加标记
- 仅测量冷启动（排除温启动/热启动/预热启动）

**常见修复方法：**
- 对于 React Native 0.78 及更早版本，禁用 Android JS 包压缩以启用 Hermes mmap
- 使用原生导航（react-native-screens）
- 在导航到常用且开销较大的页面之前预加载它们

### 高优先级：原生性能

**分析原生性能：**
- iOS：Xcode Instruments → Time Profiler
- Android：Android Studio → CPU Profiler

**常见修复方法：**
- 对繁重的原生工作使用后台线程
- Turbo Module 方法优先使用异步方式而非同步方式
- 对跨平台的性能关键型代码使用 C++

## 参考资料

包含代码示例的完整文档位于 [references/][references]：

### JavaScript/React（`js-*`）

| 文件 | 影响 | 描述 |
|------|--------|-------------|
| [js-lists-flatlist-flashlist.md][js-lists-flatlist-flashlist] | 严重 | 使用虚拟化列表替代 ScrollView |
| [js-profile-react.md][js-profile-react] | 中等 | 使用 `agent-device react-devtools` 进行性能分析 |
| [js-measure-fps.md][js-measure-fps] | 高 | FPS 监控与测量 |
| [js-memory-leaks.md][js-memory-leaks] | 中等 | 排查 JS 内存泄漏 |
| [js-atomic-state.md][js-atomic-state] | 高 | Jotai/Zustand 模式 |
| [js-concurrent-react.md][js-concurrent-react] | 高 | useDeferredValue、useTransition |
| [js-react-compiler.md][js-react-compiler] | 高 | 自动记忆化 |
| [js-animations-reanimated.md][js-animations-reanimated] | 中等 | Reanimated worklet |
| [js-bottomsheet.md][js-bottomsheet] | 高 | 底部弹层优化 |
| [js-uncontrolled-components.md][js-uncontrolled-components] | 高 | TextInput 优化 |

### 原生端（`native-*`）

| 文件 | 影响 | 描述 |
|------|--------|-------------|
| [native-turbo-modules.md][native-turbo-modules] | 高 | 构建高性能原生模块 |
| [native-sdks-over-polyfills.md][native-sdks-over-polyfills] | 高 | 原生库与 JS 库的对比 |
| [native-measure-tti.md][native-measure-tti] | 高 | TTI 测量配置 |
| [native-threading-model.md][native-threading-model] | 高 | Turbo Module 线程 |
| [native-profiling.md][native-profiling] | 中等 | 使用 Xcode/Android Studio 进行性能分析 |
| [native-platform-setup.md][native-platform-setup] | 中等 | iOS/Android 工具配置指南 |
| [native-view-flattening.md][native-view-flattening] | 中等 | 视图层级调试 |
| [native-memory-patterns.md][native-memory-patterns] | 中等 | C++/Swift/Kotlin 内存管理 |
| [native-memory-leaks.md][native-memory-leaks] | 中等 | 排查原生内存泄漏 |
| [native-android-16kb-alignment.md][native-android-16kb-alignment] | 严重 | 针对 Google Play 的第三方库对齐 |

### 打包（`bundle-*`）

| 文件 | 影响 | 描述 |
|------|--------|-------------|
| [bundle-barrel-exports.md][bundle-barrel-exports] | 严重 | 避免桶式导入 |
| [bundle-analyze-js.md][bundle-analyze-js] | 严重 | JS 包可视化 |
| [bundle-tree-shaking.md][bundle-tree-shaking] | 高 | 消除死代码 |
| [bundle-analyze-app.md][bundle-analyze-app] | 高 | 应用体积分析 |
| [bundle-r8-android.md][bundle-r8-android] | 高 | Android 代码缩减 |
| [bundle-hermes-mmap.md][bundle-hermes-mmap] | 高 | 禁用包压缩 |
| [bundle-native-assets.md][bundle-native-assets] | 高 | 资源目录配置 |
| [bundle-library-size.md][bundle-library-size] | 中等 | 评估依赖项 |
| [bundle-code-splitting.md][bundle-code-splitting] | 中等 | 远程分块加载的安全防护 |

## 问题 → Skill 映射

| 问题 | 从这里开始 |
|---------|------------|
| 应用感觉缓慢/卡顿 | [js-measure-fps.md][js-measure-fps] → [js-profile-react.md][js-profile-react] |
| 重渲染次数过多 | [js-profile-react.md][js-profile-react] → [js-react-compiler.md][js-react-compiler] |
| 启动缓慢（TTI） | [native-measure-tti.md][native-measure-tti] → [bundle-analyze-js.md][bundle-analyze-js] |
| 应用体积过大 | [bundle-analyze-app.md][bundle-analyze-app] → [bundle-r8-android.md][bundle-r8-android] |
| 内存持续增长 | [js-memory-leaks.md][js-memory-leaks] 或 [native-memory-leaks.md][native-memory-leaks] |
| 动画掉帧 | [js-animations-reanimated.md][js-animations-reanimated] |
| 底部弹层卡顿/重渲染 | [js-bottomsheet.md][js-bottomsheet] → [js-animations-reanimated.md][js-animations-reanimated] |
| 列表滚动卡顿 | [js-lists-flatlist-flashlist.md][js-lists-flatlist-flashlist] |
| TextInput 输入延迟 | [js-uncontrolled-components.md][js-uncontrolled-components] |
| 原生模块运行缓慢 | [native-turbo-modules.md][native-turbo-modules] → [native-threading-model.md][native-threading-model] |
| 原生库对齐问题 | [native-android-16kb-alignment.md][native-android-16kb-alignment] |

[references]: references/
[js-lists-flatlist-flashlist]: references/js-lists-flatlist-flashlist.md
[js-profile-react]: references/js-profile-react.md
[js-measure-fps]: references/js-measure-fps.md
[js-memory-leaks]: references/js-memory-leaks.md
[js-atomic-state]: references/js-atomic-state.md
[js-concurrent-react]: references/js-concurrent-react.md
[js-react-compiler]: references/js-react-compiler.md
[js-animations-reanimated]: references/js-animations-reanimated.md
[js-bottomsheet]: references/js-bottomsheet.md
[js-uncontrolled-components]: references/js-uncontrolled-components.md
[native-turbo-modules]: references/native-turbo-modules.md
[native-sdks-over-polyfills]: references/native-sdks-over-polyfills.md
[native-measure-tti]: references/native-measure-tti.md
[native-threading-model]: references/native-threading-model.md
[native-profiling]: references/native-profiling.md
[native-platform-setup]: references/native-platform-setup.md
[native-view-flattening]: references/native-view-flattening.md
[native-memory-patterns]: references/native-memory-patterns.md
[native-memory-leaks]: references/native-memory-leaks.md
[native-android-16kb-alignment]: references/native-android-16kb-alignment.md
[bundle-barrel-exports]: references/bundle-barrel-exports.md
[bundle-analyze-js]: references/bundle-analyze-js.md
[bundle-tree-shaking]: references/bundle-tree-shaking.md
[bundle-analyze-app]: references/bundle-analyze-app.md
[bundle-r8-android]: references/bundle-r8-android.md
[bundle-hermes-mmap]: references/bundle-hermes-mmap.md
[bundle-native-assets]: references/bundle-native-assets.md
[bundle-library-size]: references/bundle-library-size.md
[bundle-code-splitting]: references/bundle-code-splitting.md

## 署名

基于 Callstack 的《React Native 优化终极指南》。