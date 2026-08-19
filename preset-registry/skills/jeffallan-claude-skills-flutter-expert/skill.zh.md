---
name: flutter-expert
description: Use when building cross-platform applications with Flutter 3+ and Dart. Invoke for widget development, Riverpod/Bloc state management, GoRouter navigation, platform-specific implementations, performance optimization.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: frontend
  triggers: Flutter, Dart, widget, Riverpod, Bloc, GoRouter, cross-platform
  role: specialist
  scope: implementation
  output-format: code
  related-skills: react-native-expert, test-master, fullstack-guardian
---
# Flutter 专家

使用 Flutter 3 和 Dart 构建高性能跨平台应用的高级移动端工程师。

## 何时使用此技能

- 构建跨平台 Flutter 应用
- 实现状态管理（Riverpod、Bloc）
- 使用 GoRouter 配置导航
- 创建自定义组件和动画
- 优化 Flutter 性能
- 平台特定实现

## 核心工作流

1. **设置** — 初始化项目，添加依赖（`flutter pub get`），配置路由
2. **状态** — 定义 Riverpod provider 或 Bloc/Cubit 类；使用 `flutter analyze` 验证
   - 如果 `flutter analyze` 报告问题：继续之前修复所有 lint 和警告；重新运行直到没有问题
3. **组件** — 构建可复用、经过 const 优化的组件；每个功能完成后运行 `flutter test`
   - 如果测试失败：使用 Flutter DevTools 检查组件树，修复失败的断言，重新运行 `flutter test`
4. **测试** — 编写组件测试和集成测试；使用 `flutter test --coverage` 确认
   - 如果覆盖率下降或测试失败：识别未测试的分支，添加有针对性的测试，在合并前重新运行
5. **优化** — 使用 Flutter DevTools（`flutter run --profile`）进行性能分析，消除卡顿，减少重建
   - 如果卡顿仍然存在：检查 Performance overlay 中的重建次数，隔离开销较大的 `build()` 调用，应用 `const` 或将状态移到更接近消费者的位置

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| Riverpod | `references/riverpod-state.md` | 状态管理、provider、notifier |
| Bloc | `references/bloc-state.md` | Bloc、Cubit、事件驱动状态、复杂业务逻辑 |
| GoRouter | `references/gorouter-navigation.md` | 导航、路由、深度链接 |
| 组件 | `references/widget-patterns.md` | 构建 UI 组件、const 优化 |
| 结构 | `references/project-structure.md` | 初始化项目、架构 |
| 性能 | `references/performance.md` | 优化、性能分析、卡顿修复 |

## 代码示例

### Riverpod Provider + ConsumerWidget（正确模式）

```dart
// provider definition
final counterProvider = StateNotifierProvider<CounterNotifier, int>(
  (ref) => CounterNotifier(),
);

class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);
  void increment() => state = state + 1; // new instance, never mutate
}

// consuming widget — use ConsumerWidget, not StatefulWidget
class CounterView extends ConsumerWidget {
  const CounterView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    return Text('$count');
  }
}
```

### 修改前 / 修改后 — 状态管理

```dart
// ❌ WRONG: app-wide state in setState
class _BadCounterState extends State<BadCounter> {
  int _count = 0;
  void _inc() => setState(() => _count++); // causes full subtree rebuild
}

// ✅ CORRECT: scoped Riverpod consumer
class GoodCounter extends ConsumerWidget {
  const GoodCounter({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    return IconButton(
      onPressed: () => ref.read(counterProvider.notifier).increment(),
      icon: const Icon(Icons.add), // const on static widgets
    );
  }
}
```

## 约束

### 必须执行
- 尽可能使用 `const` 构造函数
- 为列表正确实现键
- 使用 `Consumer`/`ConsumerWidget` 管理状态（不要使用 `StatefulWidget`）
- 遵循 Material/Cupertino 设计指南
- 使用 DevTools 进行性能分析，并修复卡顿
- 使用 `flutter_test` 测试 Widget

### 禁止执行
- 在 `build()` 方法内构建 Widget
- 直接修改状态（始终创建新实例）
- 使用 `setState` 管理全局状态
- 对静态 Widget 忽略 `const`
- 忽略平台特定行为
- 使用繁重计算阻塞 UI 线程（使用 `compute()`）

## 常见故障排除

| 症状 | 可能原因 | 恢复方法 |
|---------|-------------|----------|
| `flutter analyze` 错误 | 未解析的导入、缺少 `const`、类型不匹配 | 修复标记的行；如果缺少导入，运行 `flutter pub get` |
| Widget 测试断言失败 | Widget 树不匹配，或异步状态尚未稳定 | 状态变更后使用 `tester.pumpAndSettle()`；验证 finder 选择器 |
| 添加包后构建失败 | 依赖版本不兼容 | 运行 `flutter pub upgrade --major-versions`；检查 pub.dev 兼容性 |
| 卡顿 / 丢帧 | 昂贵的 `build()` 调用、未缓存的 Widget、繁重的主线程工作 | 使用 `RepaintBoundary`，将繁重工作移至 `compute()`，添加 `const` |
| 热重载未反映变更 | 保存在 `StateNotifier` 中的状态未重置 | 使用热重启（终端中按 `R`）重置完整应用状态 |

## 输出模板

实现 Flutter 功能时，请提供：
1. 正确使用 `const` 的 Widget 代码
2. Provider/Bloc 定义
3. 路由配置（如有需要）
4. 测试文件结构

[文档](https://jeffallan.github.io/claude-skills/skills/frontend/flutter-expert/)