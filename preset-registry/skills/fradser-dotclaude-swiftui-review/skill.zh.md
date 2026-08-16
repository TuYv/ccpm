---
name: swiftui-review
description: Reviews SwiftUI code for best practices on modern APIs, maintainability, and performance. This skill should be used when the user asks to review SwiftUI code, check for deprecated iOS/macOS APIs, validate data flow patterns, or audit accessibility compliance in Swift projects.
user-invocable: true
license: MIT
metadata:
  author: Paul Hudson
  version: "1.0"
---
审查 Swift 和 SwiftUI 代码的正确性、现代 API 使用情况以及是否遵循项目约定。仅报告确实存在的问题——不要吹毛求疵或虚构问题。

审查流程：

1. 使用 `references/api.md` 检查是否使用了已弃用的 API。
1. 使用 `references/views.md` 检查视图、修饰符和动画是否以最优方式编写。
1. 使用 `references/data.md` 验证数据流配置是否正确。
1. 使用 `references/navigation.md` 确保导航已更新且性能良好。
1. 使用 `references/design.md` 确保代码采用无障碍且符合 Apple《人机界面指南》的设计。
1. 使用 `references/accessibility.md` 验证无障碍合规性，包括动态字体、VoiceOver 和减弱动态效果。
1. 使用 `references/performance.md` 确保代码能够高效运行。
1. 使用 `references/swift.md` 快速验证 Swift 代码。
1. 使用 `references/hygiene.md` 进行最终的代码整洁性检查。
1. 对于架构审查，使用 `references/clean-architecture.md` 检查是否符合整洁架构。

如果进行部分审查，只加载相关的参考文件。


## 核心指令

- iOS 26 已存在，并且是新应用的默认部署目标。
- 目标版本为 Swift 6.2 或更高版本，并使用现代 Swift 并发。
- 作为 SwiftUI 开发者，除非用户明确要求，否则应避免使用 UIKit。
- 未事先询问，不要引入第三方框架。
- 将不同类型拆分到不同的 Swift 文件中，而不是把多个结构体、类或枚举放在同一个文件中。
- 使用一致的项目结构，并根据应用功能确定文件夹布局。


## 输出格式

按文件组织发现的问题。对于每个问题：

1. 指明文件和相关行。
2. 说明违反的规则（例如，“使用 `foregroundStyle()` 而不是 `foregroundColor()`”）。
3. 展示简短的修复前/修复后代码。

跳过没有问题的文件。最后，以按优先级排序的摘要列出最应优先进行且影响最大的更改。

输出示例：

### ContentView.swift

**第 12 行：使用 `foregroundStyle()` 而不是 `foregroundColor()`。**

```swift
// Before
Text("Hello").foregroundColor(.red)

// After
Text("Hello").foregroundStyle(.red)
```

**第 24 行：仅包含图标的按钮不利于 VoiceOver 使用——请添加文本标签。**

```swift
// Before
Button(action: addUser) {
    Image(systemName: "plus")
}

// After
Button("Add User", systemImage: "plus", action: addUser)
```

**第 31 行：避免在视图主体中使用 `Binding(get:set:)`——改用 `@State` 和 `onChange()`。**

```swift
// Before
TextField("Username", text: Binding(
    get: { model.username },
    set: { model.username = $0; model.save() }
))

// After
TextField("Username", text: $model.username)
    .onChange(of: model.username) {
        model.save()
    }
```

### 摘要

1. **无障碍（高）：** 第 24 行的添加按钮无法被 VoiceOver 识别。
2. **已弃用的 API（中）：** 第 12 行的 `foregroundColor()` 应替换为 `foregroundStyle()`。
3. **数据流（中）：** 第 31 行的手动绑定较为脆弱，也更难维护。

示例结束。


## 参考资料

- `references/accessibility.md` - 动态字体、旁白、减弱动态效果及其他无障碍要求。
- `references/api.md` - 更新代码以使用现代 API，以及其所取代的已弃用代码。
- `references/clean-architecture.md` - 整洁架构模式、分层、MVVM、依赖注入及现代 SwiftUI 架构。
- `references/design.md` - 关于构建符合 Apple《人机界面指南》的无障碍 App 的指导。
- `references/hygiene.md` - 使代码能够干净地编译，并具有长期可维护性。
- `references/navigation.md` - 使用 `NavigationStack`/`NavigationSplitView` 进行导航，以及使用提醒、确认对话框和工作表。
- `references/performance.md` - 优化 SwiftUI 代码以实现最佳性能。
- `references/data.md` - 数据流、共享状态和属性包装器。
- `references/swift.md` - 编写现代 Swift 代码的技巧，包括有效使用 Swift 并发。
- `references/views.md` - 视图结构、组合和动画。