---
name: ios-design-guidelines
description: Apple Human Interface Guidelines for iPhone. Use when building, reviewing, or refactoring SwiftUI/UIKit interfaces for iOS. Triggers on tasks involving iPhone UI, iOS components, accessibility, Dynamic Type, Dark Mode, or HIG compliance.
license: MIT
metadata:
  author: platform-design-skills
  version: "1.0.0"
---
# iPhone 版 iOS 设计指南

根据 Apple《人机界面指南》整理的综合规则。在构建、审查或重构任何 iPhone 应用界面时，请应用这些规则。

---

## 1. 布局与安全区域
**影响：** 严重

### 规则 1.1：最小 44pt 触控目标
所有交互元素的最小点击区域必须为 44x44 点。这包括按钮、链接、开关和自定义控件。

**正确：**
```swift
Button("Save") { save() }
    .frame(minWidth: 44, minHeight: 44)
```

**错误：**
```swift
// 20pt icon with no padding — too small to tap reliably
Button(action: save) {
    Image(systemName: "checkmark")
        .font(.system(size: 20))
}
// Missing .frame(minWidth: 44, minHeight: 44)
```

### 规则 1.2：遵循安全区域
切勿将交互元素或必要内容放置在状态栏、灵动岛或主屏幕指示条下方。使用 SwiftUI 的自动安全区域处理机制或 UIKit 的 `safeAreaLayoutGuide`。

**正确：**
```swift
struct ContentView: View {
    var body: some View {
        VStack {
            Text("Content")
        }
        // SwiftUI respects safe areas by default
    }
}
```

**错误：**
```swift
struct ContentView: View {
    var body: some View {
        VStack {
            Text("Content")
        }
        .ignoresSafeArea() // Content will be clipped under notch/Dynamic Island
    }
}
```

仅对背景填充、图像或装饰性元素使用 `.ignoresSafeArea()`，绝不要对文本或交互控件使用。

### 规则 1.3：将主要操作置于拇指区域
将主要操作放置在屏幕底部，即用户拇指自然停留的位置。次要操作和导航应位于顶部。

**正确：**
```swift
VStack {
    ScrollView { /* content */ }
    Button("Continue") { next() }
        .buttonStyle(.borderedProminent)
        .padding()
}
```

**错误：**
```swift
VStack {
    Button("Continue") { next() } // Top of screen — hard to reach one-handed
        .buttonStyle(.borderedProminent)
        .padding()
    ScrollView { /* content */ }
}
```

### 规则 1.4：支持所有 iPhone 屏幕尺寸
设计应覆盖从 iPhone SE（宽 375pt）到 iPhone Pro Max（宽 430pt）的屏幕尺寸。使用灵活布局，避免硬编码宽度。

**正确：**
```swift
HStack(spacing: 12) {
    ForEach(items) { item in
        CardView(item: item)
            .frame(maxWidth: .infinity) // Adapts to screen width
    }
}
```

**错误：**
```swift
HStack(spacing: 12) {
    ForEach(items) { item in
        CardView(item: item)
            .frame(width: 180) // Breaks on SE, wastes space on Pro Max
    }
}
```

### 规则 1.5：8pt 网格对齐
将间距、内边距和元素尺寸与 8 点的倍数（8、16、24、32、40、48）对齐。使用 4pt 进行微调。

### 规则 1.6：横屏支持
除非应用针对特定任务（例如相机），否则应支持横屏方向。使用 `ViewThatFits` 或 `GeometryReader` 实现自适应布局。

---

## 2. 导航
**影响：** 严重

### 规则 2.1：使用标签栏展示顶级分区
对于 3 到 5 个顶级分区，请使用位于屏幕底部的标签栏。每个标签页都应代表一个不同的内容或功能类别。

**正确：**
```swift
TabView {
    HomeView()
        .tabItem {
            Label("Home", systemImage: "house")
        }
    SearchView()
        .tabItem {
            Label("Search", systemImage: "magnifyingglass")
        }
    ProfileView()
        .tabItem {
            Label("Profile", systemImage: "person")
        }
}
```

**错误：**
```swift
// Hamburger menu hidden behind three lines — discoverability is near zero
NavigationView {
    Button(action: { showMenu.toggle() }) {
        Image(systemName: "line.horizontal.3")
    }
}
```

### 规则 2.2：切勿使用汉堡菜单
汉堡（抽屉式）菜单会隐藏导航、降低可发现性，并且违反 iOS 规范。请改用标签栏。如果分区超过 5 个，请进行整合或使用一个“更多”标签页。

### 规则 2.3：在主视图中使用大标题
对顶层视图使用 `.navigationBarTitleDisplayMode(.large)`。当用户滚动时，标题会转为行内显示（`.inline`）。

**正确：**
```swift
NavigationStack {
    List(items) { item in
        ItemRow(item: item)
    }
    .navigationTitle("Messages")
    .navigationBarTitleDisplayMode(.large)
}
```

### 规则 2.4：切勿覆盖返回滑动手势
从屏幕左边缘滑动以返回是系统级交互预期。切勿附加会干扰该手势的自定义手势识别器。

**错误：**
```swift
.gesture(
    DragGesture()
        .onChanged { /* custom drawer */ } // Conflicts with system back swipe
)
```

### 规则 2.5：为层级内容使用 NavigationStack
对逐层深入的内容使用 `NavigationStack`（而不是已弃用的 `NavigationView`）。使用 `NavigationPath` 实现编程式导航。

**正确：**
```swift
NavigationStack(path: $path) {
    List(items) { item in
        NavigationLink(value: item) {
            ItemRow(item: item)
        }
    }
    .navigationDestination(for: Item.self) { item in
        ItemDetail(item: item)
    }
}
```

### 规则 2.6：在导航过程中保留状态
当用户返回后再次前进或切换标签页时，应恢复之前的滚动位置和输入状态。使用 `@SceneStorage` 或 `@State` 持久保存视图状态。

### 规则 2.7：优先让用户识别，而非回忆
保持当前位置、最近的选择和可用的目标位置可见。恢复标签页、滚动位置、筛选条件和选择状态，让用户通过识别继续操作，而不必依靠记忆重新构建上下文。

---

## 3. 排版与动态字体
**影响：** 高

### 规则 3.1：使用内置文本样式
始终使用语义化文本样式，而不是硬编码字号。这些样式会随动态字体自动缩放。

**正确：**
```swift
VStack(alignment: .leading, spacing: 4) {
    Text("Section Title")
        .font(.headline)
    Text("Body content that explains the section.")
        .font(.body)
    Text("Last updated 2 hours ago")
        .font(.caption)
        .foregroundStyle(.secondary)
}
```

**错误：**
```swift
VStack(alignment: .leading, spacing: 4) {
    Text("Section Title")
        .font(.system(size: 17, weight: .semibold)) // Won't scale with Dynamic Type
    Text("Body content")
        .font(.system(size: 15)) // Won't scale with Dynamic Type
}
```

### 规则 3.2：支持动态字体，包括辅助功能字号
在最大的辅助功能字号下，动态字体可将文本放大到约 200%。布局必须能够自动重排——绝不能截断或裁剪重要文本。

**正确：**
```swift
HStack {
    Image(systemName: "star")
    Text("Favorites")
        .font(.body)
}
// At accessibility sizes, consider using ViewThatFits or
// AnyLayout to switch from HStack to VStack
```

使用 `@Environment(\.dynamicTypeSize)` 检测字号类别并调整布局：

```swift
@Environment(\.dynamicTypeSize) var dynamicTypeSize

var body: some View {
    if dynamicTypeSize.isAccessibilitySize {
        VStack { content }
    } else {
        HStack { content }
    }
}
```

### 规则 3.3：自定义字体必须随动态字体缩放
如果使用自定义字体，请对其进行缩放，使其能够响应动态字体。不同框架使用的 API 不同。

**正确（SwiftUI）：**
```swift
extension Font {
    static func scaledCustom(size: CGFloat, relativeTo textStyle: Font.TextStyle) -> Font {
        .custom("CustomFont-Regular", size: size, relativeTo: textStyle)
    }
}

// Usage
Text("Hello")
    .font(.scaledCustom(size: 17, relativeTo: .body))
```

**正确（UIKit）：**
```swift
let metrics = UIFontMetrics(forTextStyle: .body)
let customFont = UIFont(name: "CustomFont-Regular", size: 17)!
label.font = metrics.scaledFont(for: customFont)
label.adjustsFontForContentSizeCategory = true
```

### 规则 3.4：使用 SF Pro 作为系统字体
除非品牌要求另有规定，否则请使用系统字体（SF Pro）。SF Pro 已针对 Apple 显示设备上的易读性进行优化。

### 规则 3.5：文本最小为 11pt
绝不要显示小于 11pt 的文本。正文文本优先使用 17pt。将 `caption2` 样式（11pt）作为绝对下限。

### 规则 3.6：通过字重和字号建立层级
通过字体字重和字号建立视觉层级。不要仅依赖颜色来区分文本层级。

---

## 4. 颜色与深色模式
**影响：** 高

### 规则 4.1：使用语义化系统颜色
使用系统提供的语义化颜色，使其能够自动适配浅色和深色模式。

**正确：**
```swift
Text("Primary text")
    .foregroundStyle(.primary) // Adapts to light/dark

Text("Secondary info")
    .foregroundStyle(.secondary)

VStack { }
    .background(Color(.systemBackground)) // White in light, black in dark
```

**错误：**
```swift
Text("Primary text")
    .foregroundColor(.black) // Invisible on dark backgrounds

VStack { }
    .background(.white) // Blinding in Dark Mode
```

### 规则 4.2：为自定义颜色提供浅色和深色变体
在资源目录中为自定义颜色同时定义 Any Appearance 和 Dark Appearance 变体。

```swift
// In Assets.xcassets, define "BrandBlue" with:
// Any Appearance: #0066CC
// Dark Appearance: #4DA3FF

Text("Brand text")
    .foregroundStyle(Color("BrandBlue")) // Automatically switches
```

### 规则 4.3：绝不要仅依赖颜色
始终将颜色与文本、图标或形状搭配使用来传达含义。大约 8% 的男性存在某种形式的色觉缺陷。

**正确：**
```swift
HStack {
    Image(systemName: "exclamationmark.triangle.fill")
        .foregroundStyle(.red)
    Text("Error: Invalid email address")
        .foregroundStyle(.red)
}
```

**错误：**
```swift
// Only color indicates the error — invisible to colorblind users
TextField("Email", text: $email)
    .border(isValid ? .green : .red)
```

### 规则 4.4：最低 4.5:1 对比度
所有文本都必须满足 WCAG AA 对比度要求：普通文本为 4.5:1，大号文本（18pt 及以上，或 14pt 及以上的粗体）为 3:1。

### 规则 4.5：支持 Display P3 广色域
使用 Display P3 色彩空间，在现代 iPhone 上呈现鲜艳、准确的色彩。在资源目录中使用 Display P3 色域定义颜色。

### 规则 4.6：背景层级
使用三级背景层级来营造纵深感：
- `systemBackground` — 主表面
- `secondarySystemBackground` — 分组内容、卡片
- `tertiarySystemBackground` — 分组内容中的元素

### 规则 4.7：交互元素使用一种强调色
为所有交互元素（按钮、链接、开关）选择一种统一的色调/强调色。这能形成一致且易于理解的视觉语言。

```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .tint(.indigo) // All interactive elements use indigo
        }
    }
}
```

---

## 5. 辅助功能
**影响：** 严重

### 规则 5.1：所有交互元素都应具有 VoiceOver 标签
每个按钮、控件和交互元素都必须具有含义明确的辅助功能标签。

**正确：**
```swift
Button(action: addToCart) {
    Image(systemName: "cart.badge.plus")
}
.accessibilityLabel("Add to cart")
```

**错误：**
```swift
Button(action: addToCart) {
    Image(systemName: "cart.badge.plus")
}
// VoiceOver reads "cart.badge.plus" — meaningless to users
```

### 规则 5.2：符合逻辑的 VoiceOver 导航顺序
确保 VoiceOver 按照符合逻辑的顺序朗读元素。当视觉布局与朗读顺序不一致时，使用 `.accessibilitySortPriority()` 进行调整。

```swift
VStack {
    Text("Price: $29.99")
        .accessibilitySortPriority(1) // Read second (lower number = lower priority)
    Text("Product Name")
        .accessibilitySortPriority(2) // Read first (higher number = higher priority)
}
```

### 规则 5.3：支持粗体文本
当用户在“设置”中启用粗体文本时，自定义渲染的文本必须相应调整。SwiftUI 文本样式会自动处理这一点。对于 SwiftUI 自定义渲染，请使用 `@Environment(\.legibilityWeight)` 应用更粗的字重。UIKit 代码必须检查 `UIAccessibility.isBoldTextEnabled`，并在收到 `UIAccessibility.boldTextStatusDidChangeNotification` 时重新查询。

**正确：**
```swift
// SwiftUI — standard text styles adapt automatically
Text("Section Header")
    .font(.headline)

// SwiftUI — custom rendering respects legibilityWeight
@Environment(\.legibilityWeight) var legibilityWeight

var body: some View {
    Text("Custom Label")
        .fontWeight(legibilityWeight == .bold ? .bold : .regular)
}
```

**错误：**
```swift
// Hardcoded weight ignores Bold Text preference
label.font = UIFont.systemFont(ofSize: 17, weight: .regular)
// Missing: re-query font when UIAccessibility.boldTextStatusDidChangeNotification fires
```

### 规则 5.4：支持“减弱动态效果”
启用“减弱动态效果”时，禁用装饰性动画和视差效果。使用 `@Environment(\.accessibilityReduceMotion)`。

**正确：**
```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

var body: some View {
    CardView()
        .animation(reduceMotion ? nil : .spring(), value: isExpanded)
}
```

### 规则 5.5：支持“增强对比度”
当用户启用“增强对比度”时，确保自定义颜色具有对比度更高的变体。使用 `@Environment(\.colorSchemeContrast)` 进行检测。

### 规则 5.6：不要仅通过颜色、形状或位置传达信息
信息必须通过多种渠道提供。将视觉指示与文本或辅助功能描述配合使用。

### 规则 5.7：为所有手势提供替代交互方式
每个自定义手势都必须提供等效的轻点操作或菜单操作，以便无法执行复杂手势的用户使用。

### 规则 5.8：支持“切换控制”和“全键盘控制”
确保所有交互都可通过“切换控制”（外部切换设备）和“全键盘控制”（蓝牙键盘）完成。测试导航顺序和焦点行为。

---

## 6. 手势与输入
**影响：** 高

### 规则 6.1：使用标准手势
使用标准的 iOS 手势体系：轻点、长按、轻扫、捏合、旋转。用户已经熟悉这些手势。

| 手势 | 标准用途 |
|---------|-------------|
| 轻点 | 主要操作、选择 |
| 长按 | 上下文菜单、预览 |
| 水平轻扫 | 删除、归档、返回导航 |
| 垂直轻扫 | 滚动、关闭表单 |
| 捏合 | 放大/缩小 |
| 双指旋转 | 旋转内容 |

### 规则 6.2：绝不要覆盖系统手势
以下手势由系统保留，不得拦截：
- 从左边缘轻扫（返回导航）
- 从左上方向下轻扫（通知中心）
- 从右上方向下轻扫（控制中心）
- 从底部向上轻扫（主屏幕/应用切换器）

### 规则 6.3：自定义手势必须易于发现
如果添加自定义手势，请提供视觉提示（例如拖动条），并确保该操作也可通过可见按钮或菜单项完成。

### 规则 6.4：支持所有输入方式
优先为触控进行设计，但也要支持：
- 硬件键盘（iPad 键盘配件、蓝牙键盘）
- 辅助设备（切换控制、头部跟踪）
- 指针输入（辅助触控）

---

## 7. 组件
**影响：** 高

### 规则 7.1：按钮样式
恰当地使用内置按钮样式：
- `.borderedProminent` — 主要行动号召
- `.bordered` — 次要操作
- `.borderless` — 第三级操作或行内操作
- `.destructive` 角色 — 为删除/移除操作显示红色色调

**正确：**
```swift
VStack(spacing: 16) {
    Button("Purchase") { buy() }
        .buttonStyle(.borderedProminent)

    Button("Add to Wishlist") { wishlist() }
        .buttonStyle(.bordered)

    Button("Delete", role: .destructive) { delete() }
}
```

### 规则 7.2：提醒 — 仅用于关键信息
谨慎使用提醒，仅将其用于需要用户做出决定的关键信息。优先使用 2 个按钮；最多使用 3 个。破坏性选项应使用 `.destructive` 角色。

**正确：**
```swift
.alert("Delete Photo?", isPresented: $showAlert) {
    Button("Delete", role: .destructive) { deletePhoto() }
    Button("Cancel", role: .cancel) { }
} message: {
    Text("This photo will be permanently removed.")
}
```

**错误：**
```swift
// Alert for non-critical info — should be a banner or toast
.alert("Tip", isPresented: $showTip) {
    Button("OK") { }
} message: {
    Text("Swipe left to delete items.")
}
```

### 规则 7.3：使用工作表处理范围明确的任务
使用工作表呈现独立完整的任务。始终提供一种关闭方式（关闭按钮或向下轻扫）。对于半高工作表，使用 `.presentationDetents()`。

```swift
.sheet(isPresented: $showCompose) {
    NavigationStack {
        ComposeView()
            .navigationTitle("New Message")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { showCompose = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Send") { send() }
                }
            }
    }
    .presentationDetents([.medium, .large])
}
```

### 规则 7.4：列表 — 默认使用内嵌分组样式
默认使用 `.insetGrouped` 列表样式。为常用操作提供轻扫操作支持。最小行高为 44pt。

**正确：**
```swift
List {
    Section("Recent") {
        ForEach(recentItems) { item in
            ItemRow(item: item)
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) { delete(item) } label: {
                        Label("Delete", systemImage: "trash")
                    }
                    Button { archive(item) } label: {
                        Label("Archive", systemImage: "archivebox")
                    }
                    .tint(.blue)
                }
        }
    }
}
.listStyle(.insetGrouped)
```

### 规则 7.5：标签栏行为
- 标签图标使用 SF Symbols — 选中标签使用填充变体，未选中标签使用轮廓变体
- 在标签内导航至更深层级时，绝不要隐藏标签栏
- 使用 `.badge()` 标记重要数量

```swift
TabView {
    MessagesView()
        .tabItem {
            Label("Messages", systemImage: "message")
        }
        .badge(unreadCount)
}
```

### 规则 7.6：搜索
使用 `.searchable()` 放置搜索功能。提供搜索建议并支持最近搜索记录。

```swift
NavigationStack {
    List(filteredItems) { item in
        ItemRow(item: item)
    }
    .searchable(text: $searchText, prompt: "Search items")
    .searchSuggestions {
        ForEach(suggestions) { suggestion in
            Text(suggestion.title)
                .searchCompletion(suggestion.title)
        }
    }
}
```

### 规则 7.7：上下文菜单
使用上下文菜单（长按）提供次要操作。绝不要将上下文菜单作为访问某项操作的唯一方式。

```swift
PhotoView(photo: photo)
    .contextMenu {
        Button { share(photo) } label: {
            Label("Share", systemImage: "square.and.arrow.up")
        }
        Button { favorite(photo) } label: {
            Label("Favorite", systemImage: "heart")
        }
        Button(role: .destructive) { delete(photo) } label: {
            Label("Delete", systemImage: "trash")
        }
    }
```

### 规则 7.8：进度指示器
- 对于时长已知的操作，使用确定型进度指示器（`ProgressView(value:total:)`）
- 对于时长未知的操作，使用不确定型进度指示器（`ProgressView()`）
- 切勿使用旋转指示器阻塞整个屏幕

### 规则 7.9：SF Symbols — 渲染模式
为每个符号使用适当的渲染模式。单色是默认模式；在适当的情况下，分层、调色板和多色模式可提供更丰富的表现力。始终优先选择最能传达含义的符号渲染模式——当多色模式能够传达关键状态时，不要默认使用单色模式。

**正确：**
```swift
// Hierarchical: single color with automatic opacity layers
Image(systemName: "person.crop.circle.fill")
    .symbolRenderingMode(.hierarchical)
    .foregroundStyle(.blue)

// Multicolor: system-defined color per layer (e.g., battery, weather)
Image(systemName: "battery.100percent.bolt")
    .symbolRenderingMode(.multicolor)

// Palette: explicit per-layer colors
Image(systemName: "folder.badge.plus")
    .symbolRenderingMode(.palette)
    .foregroundStyle(.white, .blue)
```

**错误：**
```swift
// Monochrome on a symbol that has meaningful multicolor layers
Image(systemName: "battery.100percent.bolt")
    .foregroundColor(.gray) // loses the contextual color meaning
```

### 规则 7.10：SF Symbols — 字重和缩放
使符号字重与相邻文本的字重匹配。使用缩放变体（`.small`、`.medium`、`.large`），而不是调整尺寸。符号的字重绝不能显得比相邻文本更粗。

**正确：**
```swift
Label("Download", systemImage: "arrow.down.circle.fill")
    .font(.body.weight(.semibold))
    // Symbol inherits .semibold weight automatically via Label
```

**错误：**
```swift
HStack {
    Image(systemName: "arrow.down.circle.fill")
        .font(.system(size: 32)) // explicit size ignores type scale
    Text("Download")
        .font(.body)
}
```

### 规则 7.11：SF Symbols — 动画（iOS 17+）
使用 `symbolEffect` 实现符号状态转换。对于操作，优先使用离散效果（`.bounce`、`.pulse`）；对于持续状态，优先使用无限期效果（`.variableColor`）。当 `contentTransition(.symbolEffect)` 可用时，不要在不同符号名称之间使用手动交叉淡化。

**正确：**
```swift
Image(systemName: isLoading ? "arrow.2.circlepath" : "checkmark.circle")
    .contentTransition(.symbolEffect(.replace))
    .symbolEffect(.pulse, isActive: isLoading)
```

**错误：**
```swift
// Manual opacity cross-fade between symbol names
if isLoading {
    Image(systemName: "arrow.2.circlepath")
} else {
    Image(systemName: "checkmark.circle")
}
```

---

## 8. 模式
**影响：** 中

### 规则 8.1：新手引导——最多 3 页，可跳过
将新手引导控制在 3 页以内。始终提供跳过选项。仅在用户需要使用身份验证功能时再要求登录。

```swift
TabView {
    OnboardingPage(
        image: "wand.and.stars",
        title: "Smart Suggestions",
        subtitle: "Get personalized recommendations based on your preferences."
    )
    OnboardingPage(
        image: "bell.badge",
        title: "Stay Updated",
        subtitle: "Receive notifications for things that matter to you."
    )
    OnboardingPage(
        image: "checkmark.shield",
        title: "Private & Secure",
        subtitle: "Your data stays on your device."
    )
}
.tabViewStyle(.page)
.overlay(alignment: .topTrailing) {
    Button("Skip") { completeOnboarding() }
        .padding()
}
```

### 规则 8.2：加载——使用骨架视图，不使用阻塞式加载指示器
使用与待加载内容布局相匹配的骨架视图或占位视图。绝不要显示阻塞全屏的加载指示器。

**正确：**
```swift
if isLoading {
    ForEach(0..<5) { _ in
        SkeletonRow() // Placeholder matching final row layout
            .redacted(reason: .placeholder)
    }
} else {
    ForEach(items) { item in
        ItemRow(item: item)
    }
}
```

**错误：**
```swift
if isLoading {
    ProgressView("Loading...") // Blocks the entire view
} else {
    List(items) { item in ItemRow(item: item) }
}
```

### 规则 8.3：启动屏幕——与首个屏幕保持一致
启动故事板必须在视觉上与应用的初始屏幕保持一致。不要使用闪屏徽标，也不要使用品牌展示屏幕。这样可以营造即时启动的感觉。

### 规则 8.4：模态界面——谨慎使用
仅当用户必须完成或放弃一项专注任务时，才呈现模态视图。始终提供清晰的关闭操作。绝不要在模态视图之上叠加模态视图。

### 规则 8.5：通知——仅限高价值内容
仅针对用户真正关心的内容发送通知。支持可操作通知。对通知进行分类，以便用户进行精细控制。

### 规则 8.6：设置的位置
- **常用设置：** 放在应用内的设置屏幕中，可通过个人资料或齿轮图标访问
- **隐私/权限设置：** 通过 URL scheme 跳转到系统“设置”应用
- 绝不要在应用内重复提供系统级控件

### 规则 8.7：反馈——视觉 + 触觉
为每个用户操作提供即时反馈：
- 视觉状态变化（按钮高亮、动画）
- 对重要操作使用 `UIImpactFeedbackGenerator`、`UINotificationFeedbackGenerator` 或 `UISelectionFeedbackGenerator` 提供触觉反馈

```swift
Button("Complete") {
    let generator = UINotificationFeedbackGenerator()
    generator.notificationOccurred(.success)
    completeTask()
}
```

### 规则 8.8：立即显示等待状态
如果某项操作无法立即完成，应立刻响应点击，然后显示行内进度、骨架视图或部分结果。绝不要在工作继续进行时让界面在视觉上毫无变化。

---

## 9. 隐私与权限
**影响：** 高

### 规则 9.1：在具体情境中请求权限
在用户执行需要相应权限的操作时请求权限——绝不要在应用启动时请求。

**正确：**
```swift
Button("Take Photo") {
    // Request camera permission only when the user taps this button
    AVCaptureDevice.requestAccess(for: .video) { granted in
        if granted { showCamera = true }
    }
}
```

**错误：**
```swift
// In AppDelegate.didFinishLaunching — too early, no context
func application(_ application: UIApplication, didFinishLaunchingWithOptions ...) {
    AVCaptureDevice.requestAccess(for: .video) { _ in }
    CLLocationManager().requestWhenInUseAuthorization()
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert]) { _, _ in }
}
```

### 规则 9.2：在系统提示前进行说明
在触发系统权限对话框之前，显示一个自定义说明界面。系统对话框只会出现一次——如果用户拒绝，应用必须引导他们前往“设置”。

```swift
struct LocationExplanation: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "location.fill")
                .font(.largeTitle)
            Text("Find Nearby Stores")
                .font(.headline)
            Text("We use your location to show stores within walking distance. Your location is never shared or stored.")
                .font(.body)
                .multilineTextAlignment(.center)
            Button("Enable Location") {
                locationManager.requestWhenInUseAuthorization()
            }
            .buttonStyle(.borderedProminent)
            Button("Not Now") { dismiss() }
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}
```

### 规则 9.3：支持“通过 Apple 登录”
如果应用提供任何第三方登录方式（Google、Facebook），也必须提供“通过 Apple 登录”，并将其作为第一个选项展示。

### 规则 9.4：除非必要，否则不要要求创建账户
在要求用户登录之前，允许他们探索应用。仅对确实需要身份验证的功能设置访问限制（购买、同步、社交功能）。

### 规则 9.5：应用跟踪透明度
如果你跨应用或网站跟踪用户，请显示 ATT 提示。尊重用户的拒绝——不要降低选择退出跟踪的用户的使用体验。

### 规则 9.6：使用定位按钮进行一次性访问
对于只需要获取一次位置、无需请求持续权限的操作，请使用 `LocationButton`。

```swift
import CoreLocationUI

LocationButton(.currentLocation) {
    fetchNearbyStores()
}
.labelStyle(.titleAndIcon)
```

---

## 10. 系统集成
**影响：** 中

### 规则 10.1：使用小组件展示一目了然的数据
对于用户经常查看的信息，使用 WidgetKit 提供小组件。展示最有用的信息快照。自 iOS 17 起，小组件支持交互式控件：对于用户无需打开应用即可直接从小组件执行的操作，请使用由 App Intents 支持的 `Button` 和 `Toggle`。

```swift
// iOS 17+ interactive widget with a Button
struct TimerWidgetView: View {
    let entry: TimerEntry

    var body: some View {
        VStack {
            Text(entry.remaining, style: .timer)
                .font(.title2.bold())
            Button(intent: ToggleTimerIntent()) {
                Label(entry.isRunning ? "Pause" : "Start",
                      systemImage: entry.isRunning ? "pause.fill" : "play.fill")
            }
            .buttonStyle(.borderedProminent)
        }
    }
}
```

### 规则 10.2：为关键操作提供 App Shortcuts
定义 App Shortcuts，让用户可以通过 Siri、Spotlight 和“快捷指令”App 触发关键操作。

```swift
struct MyAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: StartWorkoutIntent(),
            phrases: ["Start a workout in \(.applicationName)"],
            shortTitle: "Start Workout",
            systemImageName: "figure.run"
        )
    }
}
```

### 规则 10.3：Spotlight 索引
使用 `CSSearchableItem` 为 App 内容建立索引，让用户可以通过 Spotlight 搜索找到这些内容。

### 规则 10.4：集成系统共享表单
对于用户可能想发送到其他位置的内容，应支持系统共享表单。在 SwiftUI 中实现 `UIActivityItemSource` 或使用 `ShareLink`。

```swift
ShareLink(item: article.url) {
    Label("Share", systemImage: "square.and.arrow.up")
}
```

### 规则 10.5：实时活动
对于实时且有明确时间范围的事件（配送跟踪、体育比分、健身活动），使用实时活动和灵动岛。

### 规则 10.6：妥善处理中断
当发生以下中断时，保存状态并妥善暂停：
- 电话来电
- Siri 调用
- 通知
- App 切换器
- FaceTime 同播共享

使用 `scenePhase` 检测状态转换：

```swift
@Environment(\.scenePhase) var scenePhase

.onChange(of: scenePhase) { _, newPhase in
    switch newPhase {
    case .active: resumeActivity()
    case .inactive: pauseActivity()
    case .background: saveState()
    @unknown default: break
    }
}
```

---

## 快速参考

| 需求 | 组件 | 说明 |
|------|-----------|-------|
| 顶层分区（3-5 个） | 带有 `.tabItem` 的 `TabView` | 底部标签栏、SF Symbols |
| 分层深入导航 | `NavigationStack` | 根视图使用大标题，子视图使用行内标题 |
| 独立任务 | `.sheet` | 轻扫关闭、取消/完成按钮 |
| 关键决策 | `.alert` | 首选 2 个按钮，最多 3 个 |
| 次要操作 | `.contextMenu` | 长按；还必须能从其他位置访问 |
| 滚动内容 | 带有 `.insetGrouped` 的 `List` | 行高最小 44pt、轻扫操作 |
| 文本输入 | `TextField` / `TextEditor` | 标签位于上方，验证信息位于下方 |
| 选择（选项较少） | `Picker` | 2-5 个选项使用分段控件，选项较多时使用滚轮 |
| 选择（开/关） | `Toggle` | 在列表行中右对齐 |
| 搜索 | `.searchable` | 搜索建议、最近搜索记录 |
| 进度（已知） | `ProgressView(value:total:)` | 显示百分比或剩余时间 |
| 进度（未知） | `ProgressView()` | 行内显示，切勿全屏阻塞 |
| 单次位置访问 | `LocationButton` | 无需持久位置权限 |
| 共享内容 | `ShareLink` | 系统共享表单 |
| 触觉反馈 | `UIImpactFeedbackGenerator` | `.light`、`.medium`、`.heavy` |
| 破坏性操作 | `Button(role: .destructive)` | 红色色调，通过提醒确认 |

---

## 评估检查清单

使用此检查清单审核 iPhone App 是否符合 HIG：

### 布局与安全区域
- [ ] 所有触控目标均至少为 44x44pt
- [ ] 状态栏、灵动岛或主屏幕指示条下方没有内容被遮挡
- [ ] 主要操作位于屏幕下半部分（拇指热区）
- [ ] 布局从 iPhone SE 到 Pro Max 均可自适应，不会错乱
- [ ] 间距与 8pt 网格对齐

### 导航
- [ ] 标签栏用于 3–5 个顶级分区
- [ ] 不使用汉堡菜单或抽屉式菜单
- [ ] 主要视图使用大标题
- [ ] 从屏幕左边缘向右轻扫的返回导航在整个应用中均可用
- [ ] 切换标签页时保留状态

### 排版
- [ ] 所有文本均使用内置文本样式，或使用可随动态字体缩放的自定义字体（SwiftUI 中的 `Font.custom(_:size:relativeTo:)` 或 UIKit 中的 `UIFontMetrics`）
- [ ] 动态字体支持到辅助功能字号
- [ ] 在大字号下，布局会自动重排（必要文本不会被截断）
- [ ] 最小字号为 11pt

### 颜色与深色模式
- [ ] 应用使用语义化系统颜色，或提供浅色/深色资源变体
- [ ] 深色模式经过有意设计（而不只是简单反色）
- [ ] 不仅依靠颜色传达信息
- [ ] 文本对比度达到 4.5:1（普通文本）或 3:1（大文本）
- [ ] 交互元素使用单一强调色

### 辅助功能
- [ ] VoiceOver 能够以符合逻辑的顺序朗读所有屏幕，并提供有意义的标签
- [ ] 遵循粗体文本偏好设置
- [ ] 启用“减弱动态效果”时禁用装饰性动画
- [ ] 自定义颜色提供“增强对比度”变体
- [ ] 所有手势操作均有替代访问方式

### 组件
- [ ] 提醒仅用于关键决策
- [ ] 表单页提供关闭方式（按钮和/或轻扫）
- [ ] 列表行高度至少为 44pt
- [ ] 导航过程中绝不隐藏标签栏
- [ ] 破坏性按钮使用 `.destructive` 角色

### 隐私
- [ ] 在相关情境下请求权限，而不是在应用启动时请求
- [ ] 每次显示系统权限对话框前，先显示自定义说明
- [ ] 在提供其他登录方式的同时，也提供“通过 Apple 登录”
- [ ] 用户无需账户也能使用应用的基本功能
- [ ] 如果进行跟踪，则显示 ATT 提示，并尊重用户的拒绝选择

### 系统集成
- [ ] 小组件显示一目了然且及时更新的信息
- [ ] 为应用内容建立索引，以便 Spotlight 搜索
- [ ] 可分享内容支持系统分享表单
- [ ] 应用能够妥善处理中断（通话、进入后台、Siri）

---

## 反模式

以下是违反 iOS《人机界面指南》的常见错误。绝不要这样做：

1. **汉堡菜单** — 使用标签栏。汉堡菜单会隐藏导航，并使功能可发现性降低多达 50%。

2. **破坏轻扫返回功能的自定义返回按钮** — 如果替换返回按钮，请确保通过 `NavigationStack` 仍可使用从屏幕左边缘向右轻扫的手势。

3. **阻塞全屏的加载指示器** — 使用骨架视图或行内进度指示器。阻塞式加载指示器会让应用看起来像是卡死了。

4. **带有徽标的启动画面** — 启动画面必须与应用的首个屏幕保持一致。品牌展示造成的延迟会显得刻意且不自然。

5. **在启动时请求所有权限** — 首次启动时请求相机、位置、通知和通讯录权限，几乎必然会导致大多数权限被拒绝。

6. **硬编码字号** — 使用文本样式。硬编码字号会忽略动态字体和辅助功能偏好设置，使数百万用户无法正常使用应用。

7. **仅使用颜色表示状态** — 使用红色/绿色表示有效/无效会将色盲用户排除在外。始终同时搭配图标或文本。

8. **对非关键信息使用警告框** — 警告框会中断用户的操作流程，并且需要手动关闭。对于提示和非关键信息，请使用横幅、轻提示或行内消息。

9. **在导航推入时隐藏标签栏** — 在标签页内进行导航时，标签栏应始终保持可见。隐藏标签栏会使用户失去方向感。

10. **忽略安全区域** — 在内容视图上使用 `.ignoresSafeArea()` 会导致文本和按钮被刘海、灵动岛或主屏幕指示条遮挡。

11. **无法关闭的模态窗口** — 每个模态窗口都必须提供明确的关闭方式（关闭按钮、取消按钮、向下滑动）。将用户困在模态窗口中是一种不友好的设计。

12. **没有替代操作的自定义手势** — 对许多人来说，使用三指轻扫来撤销操作并不可行。还应提供可见的按钮或菜单项。

13. **过小的触控目标** — 小于 44pt 的按钮和链接容易导致误触，尤其是在列表和工具栏中。

14. **层叠的模态窗口** — 在一个工作表上再显示一个工作表，并继续层层叠加，会造成导航混乱。应改为在单个模态窗口内使用导航。

15. **事后才考虑深色模式** — 使用硬编码颜色意味着应用要么在深色模式下显示异常，要么在浅色模式下显示异常。请始终使用语义化颜色。