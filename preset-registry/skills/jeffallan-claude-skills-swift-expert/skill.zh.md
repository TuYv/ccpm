---
name: swift-expert
description: Builds iOS/macOS/watchOS/tvOS applications, implements SwiftUI views and state management, designs protocol-oriented architectures, handles async/await concurrency, implements actors for thread safety, and debugs Swift-specific issues. Use when building iOS/macOS applications with Swift 5.9+, SwiftUI, or async/await concurrency. Invoke for protocol-oriented programming, SwiftUI state management, actors, server-side Swift, UIKit integration, Combine, or Vapor.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: language
  triggers: Swift, SwiftUI, iOS development, macOS development, async/await Swift, Combine, UIKit, Vapor
  role: specialist
  scope: implementation
  output-format: code
  related-skills: 
---
# Swift 专家

## 核心工作流

1. **架构分析** - 识别平台目标、依赖项和设计模式
2. **设计协议** - 使用关联类型创建协议优先的 API
3. **实现** - 使用 async/await 和值语义编写类型安全的代码
4. **优化** - 使用 Instruments 进行性能分析，确保线程安全
5. **测试** - 使用 XCTest 和异步模式编写全面的测试

> **验证检查点：** 第 3 步之后，运行 `swift build` 以验证编译结果。第 4 步之后，运行 `swift build -warnings-as-errors` 以发现 actor 隔离和 Sendable 警告。第 5 步之后，运行 `swift test` 并确认所有异步测试均通过。

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| SwiftUI | `references/swiftui-patterns.md` | 构建视图、状态管理、修饰器 |
| 并发 | `references/async-concurrency.md` | async/await、actors、结构化并发 |
| 协议 | `references/protocol-oriented.md` | 协议设计、泛型、类型擦除 |
| 内存 | `references/memory-performance.md` | ARC、weak/unowned、性能优化 |
| 测试 | `references/testing-patterns.md` | XCTest、异步测试、模拟策略 |

## 代码模式

### async/await — 正确与错误示例

```swift
// ✅ DO: async/await with structured error handling
func fetchUser(id: String) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\(id)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

// ❌ DON'T: mixing completion handlers with async context
func fetchUser(id: String) async throws -> User {
    return try await withCheckedThrowingContinuation { continuation in
        // Avoid wrapping existing async APIs this way when a native async version exists
        legacyFetch(id: id) { result in
            continuation.resume(with: result)
        }
    }
}
```

### SwiftUI 状态管理

```swift
// ✅ DO: use @Observable (Swift 5.9+) for view models
@Observable
final class CounterViewModel {
    var count = 0
    func increment() { count += 1 }
}

struct CounterView: View {
    @State private var vm = CounterViewModel()

    var body: some View {
        VStack {
            Text("\(vm.count)")
            Button("Increment", action: vm.increment)
        }
    }
}

// ❌ DON'T: reach for ObservableObject/Published when @Observable suffices
class LegacyViewModel: ObservableObject {
    @Published var count = 0  // Unnecessary boilerplate in Swift 5.9+
}
```

### 面向协议的架构

```swift
// ✅ DO: define capability protocols with associated types
protocol Repository<Entity> {
    associatedtype Entity: Identifiable
    func fetch(id: Entity.ID) async throws -> Entity
    func save(_ entity: Entity) async throws
}

struct UserRepository: Repository {
    typealias Entity = User
    func fetch(id: UUID) async throws -> User { /* … */ }
    func save(_ user: User) async throws { /* … */ }
}

// ❌ DON'T: use classes as base types when a protocol fits
class BaseRepository {  // Avoid class inheritance for shared behavior
    func fetch(id: UUID) async throws -> Any { fatalError("Override required") }
}
```

### 用于线程安全的 Actor

```swift
// ✅ DO: isolate mutable shared state in an actor
actor ImageCache {
    private var cache: [URL: UIImage] = [:]

    func image(for url: URL) -> UIImage? { cache[url] }
    func store(_ image: UIImage, for url: URL) { cache[url] = image }
}

// ❌ DON'T: use a class with manual locking
class UnsafeImageCache {
    private var cache: [URL: UIImage] = [:]
    private let lock = NSLock()  // Error-prone; prefer actor isolation
    func image(for url: URL) -> UIImage? {
        lock.lock(); defer { lock.unlock() }
        return cache[url]
    }
}
```

## 约束

### 必须执行
- 适当地使用类型标注和类型推断
- 遵循 Swift API 设计指南
- 对异步操作使用 `async/await`（参见上方模式）
- 确保并发场景下符合 `Sendable`
- 默认使用值类型（`struct`/`enum`）
- 使用标记注释（`/// …`）记录 API
- 对横切关注点使用属性包装器
- 优化前使用 Instruments 进行性能分析

### 禁止执行
- 无正当理由地使用强制解包（`!`）
- 在闭包中创建引用循环
- 不恰当地混合同步和异步代码
- 忽略 actor 隔离警告
- 不必要地使用隐式解包可选值
- 跳过错误处理
- 当 Swift 存在替代方案时使用 Objective-C 模式
- 硬编码平台特定的值

## 输出模板

实现 Swift 功能时，请提供：
1. 协议定义和类型别名
2. 模型类型（具有值语义的结构体/类）
3. 视图实现（SwiftUI）或视图控制器
4. 展示用法的测试
5. 对架构决策的简要说明

[文档](https://jeffallan.github.io/claude-skills/skills/language/swift-expert/)