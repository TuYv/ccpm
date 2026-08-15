---
name: ipados-design-guidelines
description: Apple Human Interface Guidelines for iPad. Use when building iPad-optimized interfaces, implementing multitasking, pointer support, keyboard shortcuts, or responsive layouts. Triggers on tasks involving iPad, Split View, Stage Manager, sidebar navigation, or trackpad support.
license: MIT
metadata:
  author: platform-design-skills
  version: "1.0.0"
---
# iPadOS 设计指南

遵循 Apple《人机界面指南》构建原生 iPad 应用的全面规则。iPad 并不是放大版的 iPhone——它需要自适应布局、多任务处理支持、指针交互、键盘快捷键以及跨应用拖放。这些规则针对更大、功能更强的画布扩展了 iOS 设计模式。

---

## 1. 响应式布局（关键）

### 1.1 使用自适应尺寸类别

iPad 提供两种水平尺寸类别：**常规**（全屏、大比例分屏）和**紧凑**（Slide Over、小比例分屏）。请同时针对这两种类别进行设计。切勿硬编码尺寸。

```swift
struct AdaptiveView: View {
    @Environment(\.horizontalSizeClass) var sizeClass

    var body: some View {
        if sizeClass == .regular {
            TwoColumnLayout()
        } else {
            StackedLayout()
        }
    }
}
```

### 1.2 不要简单放大 iPhone UI

iPad 布局必须专门设计。将 iPhone 布局拉伸到 13" 显示屏上既浪费空间，又会显得不协调。在常规宽度下，应使用多栏布局、主从模式，并提高信息密度。

### 1.3 支持所有 iPad 屏幕尺寸

应针对完整的设备范围进行设计：iPad Mini（8.3"）、iPad（11"）、iPad Air（11"/13"）和 iPad Pro（11"/13"）。使用能够重新分配内容的灵活布局，而不是简单地缩放。

### 1.4 在常规宽度下使用分栏布局

在常规宽度下，将内容组织为多栏。双栏布局最为常见（边栏 + 详情）。三栏布局适用于较深的层级结构（边栏 + 列表 + 详情）。在大屏幕上避免使用单栏全宽布局。

```swift
struct ThreeColumnLayout: View {
    var body: some View {
        NavigationSplitView {
            SidebarView()
        } content: {
            ContentListView()
        } detail: {
            DetailView()
        }
    }
}
```

### 1.5 遵循安全区域

iPad 的安全区域与 iPhone 不同。较旧的 iPad 没有主屏幕指示条。iPad 横屏时的边距也与竖屏时不同。始终使用 `safeAreaInset`，切勿针对刘海或指示条硬编码内边距。

### 1.6 支持两种屏幕方向

iPad 应用必须在竖屏和横屏模式下都能良好运行。横屏是生产力场景中的主要方向，竖屏则常用于阅读。根据屏幕方向调整栏数和布局密度。

---

## 2. 多任务处理（关键）

### 2.1 支持 Split View

你的应用必须能够在 Split View 的 1/3、1/2 和 2/3 屏幕宽度下正常运行。在 1/3 宽度下，应用会采用紧凑水平尺寸类别。内容必须在每一种分屏比例下都保持可用。

### 2.2 支持 Slide Over

Slide Over 会将应用显示为位于右侧边缘的紧凑宽度浮层。其行为类似于 iPhone 宽度的应用。确保所有功能在这种窄幅模式下仍然可以访问。

### 2.3 处理台前调度

台前调度允许窗口自由调整大小，并可同时显示多个窗口。你的应用必须：
- 能够流畅调整至任意尺寸
- 支持显示不同内容的多个场景（窗口）
- 不假定任何固定尺寸或宽高比

```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        // Support multiple windows
        WindowGroup("Detail", for: Item.ID.self) { $itemId in
            DetailView(itemId: itemId)
        }
    }
}
```

### 2.4 切勿假设应用以全屏运行

应用可能会直接在分屏浏览或台前调度模式下启动。在设置、引导或任何流程中，都不要依赖全屏尺寸。请在所有可能的尺寸下测试你的应用。

### 2.5 妥善处理尺寸变化

当用户通过多任务处理调整窗口大小时，应流畅地为布局变化添加动画。在尺寸变化过程中保留滚动位置、选择状态和用户上下文。切勿因窗口大小调整而重新加载内容。

### 2.6 支持多个场景

使用 `UIScene` / SwiftUI `WindowGroup`，让用户能够打开应用的多个实例并显示不同内容。每个场景都相互独立。支持使用 `NSUserActivity` 恢复状态。

---

## 3. 导航（关键）

### 3.1 使用侧边栏进行主要导航

在常规宽度下，用侧边栏取代 iPhone 标签栏。侧边栏可为导航项提供更多空间，支持分区，并且在 iPad 上更符合原生体验。

```swift
struct AppNavigation: View {
    @State private var selection: NavigationItem? = .inbox

    var body: some View {
        NavigationSplitView {
            List(selection: $selection) {
                Section("Main") {
                    Label("Inbox", systemImage: "tray")
                        .tag(NavigationItem.inbox)
                    Label("Drafts", systemImage: "doc")
                        .tag(NavigationItem.drafts)
                    Label("Sent", systemImage: "paperplane")
                        .tag(NavigationItem.sent)
                }
                Section("Labels") {
                    // Dynamic sections
                }
            }
            .navigationTitle("Mail")
        } detail: {
            DetailView(for: selection)
        }
    }
}
```

### 3.2 自动将标签栏转换为侧边栏

使用 `.sidebarAdaptable` 样式的 SwiftUI `TabView` 会在常规宽度下自动转换为侧边栏。使用此方式可实现从 iPhone 到 iPad 的无缝适配。

```swift
TabView {
    Tab("Home", systemImage: "house") { HomeView() }
    Tab("Search", systemImage: "magnifyingglass") { SearchView() }
    Tab("Profile", systemImage: "person") { ProfileView() }
}
.tabViewStyle(.sidebarAdaptable)
```

### 3.3 为复杂层级结构使用三栏布局

当你的信息架构包含三个层级时，使用包含三栏的 `NavigationSplitView`：类别 > 列表 > 详情。例如：邮件（账户 > 邮件列表 > 邮件）、文件管理器和设置。

### 3.4 将工具栏置于顶部

在 iPad 上，工具栏位于屏幕顶部的导航栏区域，而不像 iPhone 那样位于底部。使用 `.toolbar` 将上下文操作放置在适当位置。

```swift
.toolbar {
    ToolbarItemGroup(placement: .primaryAction) {
        Button("Compose", systemImage: "square.and.pencil") { }
    }
    ToolbarItemGroup(placement: .secondaryAction) {
        Button("Archive", systemImage: "archivebox") { }
        Button("Delete", systemImage: "trash") { }
    }
}
```

### 3.5 详情视图绝不应为空

当列表/侧边栏中没有选中任何项目时，应在详情区域显示有意义的空状态。使用带有图标和操作提示文本的占位内容，而不是空白屏幕。

### 3.6 减少大画布导航中的记忆负担

在尺寸变化和场景切换时，保持侧边栏选中项、搜索词和展开状态可见并予以保留。在多栏布局中，用户应能从屏幕上显示的结构继续操作，而不必依赖记忆。

---

## 4. 指针与触控板（高优先级）

### 4.1 为交互元素添加悬停效果

所有可轻点的元素都应响应指针悬停。系统会为标准控件自动提供悬停效果。对于自定义视图，请使用 `.hoverEffect()`。

```swift
Button("Action") { }
    .hoverEffect(.highlight)  // Subtle highlight on hover

// Custom hover effect
MyCustomView()
    .hoverEffect(.lift)  // Lifts and adds shadow
```

### 4.2 按钮的指针磁吸效果

指针应吸附到（被吸引至）按钮边界。标准 UIKit/SwiftUI 按钮会自动获得此效果。对于自定义点击目标，请使用 `.contentShape()` 确保指针区域与可轻点区域一致。

### 4.3 支持右键单击上下文菜单

右键单击（辅助点按）应显示上下文菜单。使用 `.contextMenu`，它会自动同时支持长按（触控）和右键单击（指针）。

```swift
Text(item.title)
    .contextMenu {
        Button("Copy", systemImage: "doc.on.doc") { }
        Button("Share", systemImage: "square.and.arrow.up") { }
        Divider()
        Button("Delete", systemImage: "trash", role: .destructive) { }
    }
```

### 4.4 触控板滚动行为

支持具有惯性的双指滚动。在适当场景下支持双指捏合缩放。遵循滚动方向偏好设置。对于自定义滚动视图，应确保触控板手势与触控手势配合使用时感觉自然。

### 4.5 为内容区域自定义光标

根据上下文更改光标外观。文本区域显示 I 形光标。链接显示手形指针。调整大小控制柄显示调整大小光标。可拖动项目显示抓取光标。

### 4.6 指针驱动的拖放

指针用户希望通过单击并拖动来重新排列、选择和移动内容。结合 Shift-click 和 Cmd-click 实现多选。

---

## 5. 键盘（高优先级）

### 5.1 为所有主要操作提供 Cmd+按键快捷键

每个主要操作都必须有键盘快捷键。以下标准快捷键为必备项：

| 快捷键 | 操作 |
|----------|--------|
| Cmd+N | 新建项目 |
| Cmd+F | 查找/搜索 |
| Cmd+S | 保存 |
| Cmd+Z | 撤销 |
| Cmd+Shift+Z | 重做 |
| Cmd+C/V/X | 复制/粘贴/剪切 |
| Cmd+A | 全选 |
| Cmd+P | 打印 |
| Cmd+W | 关闭窗口/标签页 |
| Cmd+, | 设置/偏好设置 |
| Delete | 删除选中的项目 |

```swift
Button("New Document") { createDocument() }
    .keyboardShortcut("n", modifiers: .command)
```

### 5.2 通过长按 Cmd 显示快捷键浮层以提高可发现性

当用户按住 Cmd 键时，iPadOS 会显示快捷键浮层。使用 `.keyboardShortcut()` 注册所有快捷键，使其显示在此浮层中。对相关快捷键进行合理分组。

### 5.3 使用 Tab 键在字段之间导航

支持使用 Tab 在表单字段和可聚焦元素之间向前移动，并使用 Shift+Tab 向后移动。使用 `.focusable()` 和 `@FocusState` 管理键盘焦点顺序。

```swift
struct FormView: View {
    @FocusState private var focusedField: Field?

    var body: some View {
        Form {
            TextField("Name", text: $name)
                .focused($focusedField, equals: .name)
            TextField("Email", text: $email)
                .focused($focusedField, equals: .email)
            TextField("Phone", text: $phone)
                .focused($focusedField, equals: .phone)
        }
    }
}
```

### 5.4 切勿覆盖系统快捷键

不要占用系统保留的快捷键：Cmd+H（主屏幕）、Cmd+Tab（应用切换器）、Cmd+Space（Spotlight）、地球键组合。这些快捷键不会生效，还会造成困惑。

### 5.5 检测硬件键盘

连接硬件键盘时调整 UI。隐藏屏幕键盘的快捷键栏。显示针对键盘优化的控件。使用 `GCKeyboard` 或跟踪键盘可见性来检测状态。

### 5.6 方向键导航

支持使用方向键在列表、网格和集合中导航。与 Shift 组合使用以进行多选。这对于注重生产力的应用至关重要。

### 5.7 快捷键必须易于发现

不要依赖用户记忆快捷键组合。通过长按 Cmd 时显示的浮层、菜单标签和可见的焦点移动来展示命令，让用户通过识别和重复操作来掌握快捷键。

---

## 6. Apple Pencil（中等）

### 6.1 支持“随手写”

iPadOS 会自动将任何标准文本字段中的手写内容转换为文本。不要禁用“随手写”。对于自定义文本输入，请采用 `UIScribbleInteraction`。测试所有文本输入位置，确保“随手写”均可正常工作。

### 6.2 双击切换工具

Apple Pencil 2 及更新款支持通过双击切换工具（例如，从画笔切换到橡皮擦）。如果你的应用包含绘图工具，请实现 `UIPencilInteraction` 委托以处理双击操作。

### 6.3 组图时支持压力和倾斜度

对于绘图应用，应响应来自 Pencil 触控事件的 `force`（压力）以及 `altitudeAngle`/`azimuthAngle`（倾斜度）。利用这些数据实现可变线条宽度、不透明度或阴影效果。

### 6.4 悬停检测（M2+ Pencil）

支持悬停的 Apple Pencil（M2 iPad Pro 及更新机型）可在笔尖接触屏幕之前提供位置数据。利用此功能实现预览效果、工具大小指示器并提高精确度。

```swift
// UIKit hover support via UIHoverGestureRecognizer
let hoverRecognizer = UIHoverGestureRecognizer(target: self, action: #selector(pencilHoverChanged(_:)))
hoverRecognizer.allowedTouchTypes = [NSNumber(value: UITouch.TouchType.pencil.rawValue)]
canvas.addGestureRecognizer(hoverRecognizer)

@objc func pencilHoverChanged(_ hover: UIHoverGestureRecognizer) {
    let location = hover.location(in: canvas)
    showBrushPreview(at: location)
}
```

### 6.5 PencilKit 集成

对于笔记和批注功能，请使用 PencilKit 中的 `PKCanvasView`。它开箱即用，提供包含工具选取器、撤销和墨迹识别功能的完整绘图体验。

```swift
import PencilKit

struct DrawingView: UIViewRepresentable {
    @Binding var canvasView: PKCanvasView

    func makeUIView(context: Context) -> PKCanvasView {
        canvasView.tool = PKInkingTool(.pen, color: .black, width: 5)
        canvasView.drawingPolicy = .anyInput
        return canvasView
    }
}
```

---

## 7. 拖放（高）

### 7.1 应支持跨 App 拖放

iPad 用户希望能在不同 App 之间拖动内容。应支持将内容拖出（作为拖动源）以及将内容拖入（作为放置目标）。这是 iPad 的核心交互方式。

```swift
// As drag source
Text(item.title)
    .draggable(item.title)

// As drop destination
DropTarget()
    .dropDestination(for: String.self) { items, location in
        handleDrop(items)
        return true
    }
```

### 7.2 多项目拖动

用户可以先拖起一个项目，然后轻点其他项目，将它们添加到当前拖动中。通过提供多个 `NSItemProvider` 项目来支持多项目拖动。在拖动预览上显示数量徽标。

### 7.3 弹簧加载交互

将内容拖到导航元素（文件夹、标签页、边栏项目）上方时，短暂停留后应“弹开”该目标。在导航容器上实现弹簧加载，以支持深层放置目标。

### 7.4 拖放的视觉反馈

提供清晰的视觉状态：
- **提起**：开始拖动时，项目提起并显示阴影
- **移动**：拖动内容悬停在有效目标上时，高亮显示目标
- **放置**：在放置点以动画方式插入
- **取消**：项目以动画方式返回原位置

### 7.5 支持通用控制

通用控制允许用户在 iPad 和 Mac 之间拖动内容。如果 App 使用标准 `NSItemProvider` 和 UTTypes 支持拖放，通用控制将自动生效。

### 7.6 使用放置委托实现自定义行为

使用 `DropDelegate` 对放置行为进行精细控制，包括验证放置内容、在列表内重新排序以及处理放置位置。

```swift
struct ReorderDropDelegate: DropDelegate {
    let item: Item
    @Binding var items: [Item]
    @Binding var draggedItem: Item?

    func performDrop(info: DropInfo) -> Bool {
        draggedItem = nil
        return true
    }

    func dropEntered(info: DropInfo) {
        guard let draggedItem,
              let fromIndex = items.firstIndex(of: draggedItem),
              let toIndex = items.firstIndex(of: item) else { return }
        withAnimation {
            items.move(fromOffsets: IndexSet(integer: fromIndex),
                      toOffset: toIndex > fromIndex ? toIndex + 1 : toIndex)
        }
    }
}
```

---

## 8. 外接显示器（中）

### 8.1 提供扩展内容，而非仅进行镜像显示

连接外接显示器时，应显示互补内容，而不是复制 iPad 屏幕。演示文稿、参考资料或扩展视图应显示在外接显示器上，而控制界面则保留在 iPad 上。

```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        // Additional scene for external display
        WindowGroup(id: "presentation") {
            PresentationView()
        }
    }
}
```

### 8.2 处理显示器连接与断开

通过 `SceneDelegate` 中的 `UIWindowScene` 事件观察外接显示器的生命周期，或监听 `UIScene` 会话通知（`UIApplication.didConnectSceneSessionNotification` / `UIApplication.didDisconnectSceneSessionNotification`）。平稳地完成转换——如果外接显示器在演示过程中断开连接，应将内容恢复到 iPad 屏幕上，且不得丢失数据。

```swift
// SceneDelegate: detect when a scene (external display window) connects or disconnects
func scene(_ scene: UIScene,
           willConnectTo session: UISceneSession,
           options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = scene as? UIWindowScene else { return }
    configureExternalDisplay(for: windowScene)
}

func sceneDidDisconnect(_ scene: UIScene) {
    restoreContentToiPad()
}
```

### 8.3 支持外接显示器的完整分辨率

使用外接显示器的完整分辨率和宽高比。不要以信箱模式或柱箱模式显示内容。在 iOS 16+ 的多场景上下文中，`UIScreen.main` 已被弃用——请通过 `UIWindowScene.coordinateSpace.bounds` 和 `UIWindowScene.screen.scale` 查询已连接的显示器，或在 SwiftUI 中使用 `@Environment(\.displayScale)`。

---

## 9. 辅助功能（关键）

**影响：** 关键

### 规则 9.1：所有交互元素都应具有 VoiceOver 标签

每个按钮、控件和交互元素都必须具有含义明确的辅助功能标签。仅含图标的工具栏项目和自定义视图必须使用 `.accessibilityLabel()`。

**正确：**
```swift
Button(action: compose) {
    Image(systemName: "square.and.pencil")
}
.accessibilityLabel("Compose new message")
```

**错误：**
```swift
Button(action: compose) {
    Image(systemName: "square.and.pencil")
}
// VoiceOver reads "square.and.pencil" — meaningless to users
```

### 规则 9.2：支持动态字体，包括辅助功能字号

使用语义化文本样式（`title`、`body`、`caption`），使文本可根据用户的首选字号进行缩放。在 iPad 更大的画布上，绝不要限制文本字号或禁用缩放。应测试全部五档辅助功能字号。

```swift
Text("Section Header")
    .font(.headline)  // Scales with Dynamic Type automatically
```

### 规则 9.3：指针辅助功能——悬停不得是唯一提示

悬停状态（`.hoverEffect`）可以增强指针输入体验，但不得作为可交互性的唯一指示。确保所有交互元素还可通过颜色、形状或标签加以区分，以便 VoiceOver 用户和仅使用键盘的用户识别。

### 规则 9.4：全键盘控制与焦点路由

启用全键盘控制后，按 Tab 键必须以合理的顺序让焦点依次经过所有交互元素。在分屏浏览和多窗口布局中，焦点不得转移到隐藏或被遮挡的窗口。使用 `@FocusState` 和 `.focusable()` 控制键盘焦点图。

```swift
struct FormView: View {
    @FocusState private var focusedField: Field?

    var body: some View {
        VStack {
            TextField("Name", text: $name)
                .focused($focusedField, equals: .name)
            TextField("Email", text: $email)
                .focused($focusedField, equals: .email)
        }
    }
}
```

### 规则 9.5：分屏浏览中的 VoiceOver——独立的焦点上下文

在分屏浏览中，每个 App 都有自己的 VoiceOver 焦点上下文。你的 App 不得假定自身会占据整个屏幕。请确保即使在 1/3 或 1/2 的分屏宽度下，VoiceOver 也能导航你的整个可见界面。不要将可操作内容隐藏在可见区域之外，却不同时将其从辅助功能树中移除。

### 规则 9.6：响应粗体文本设置

当用户在“设置”中启用粗体文本时，自定义渲染的文本必须相应调整。SwiftUI 文本样式会自动处理这一点。UIKit 代码必须检查 `UIAccessibility.isBoldTextEnabled`，或在 SwiftUI 中使用 `@Environment(\.legibilityWeight)`。

**正确：**
```swift
// SwiftUI — handled automatically for standard text styles
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

### 规则 9.7：响应增强对比度设置

当用户在“设置”中启用增强对比度时，自定义颜色必须提供对比度更高的变体。在 SwiftUI 中使用 `@Environment(\.colorSchemeContrast)`，或在 UIKit 中使用 `UIAccessibility.isDarkerSystemColorsEnabled`。

**正确：**
```swift
// SwiftUI
@Environment(\.colorSchemeContrast) var contrast

var separatorColor: Color {
    contrast == .increased ? Color.primary : Color.secondary
}

// UIKit
let useHighContrast = UIAccessibility.isDarkerSystemColorsEnabled
let borderColor: UIColor = useHighContrast ? .label : .separator
```

**错误：**
```swift
// Static color ignores Increase Contrast setting
let borderColor = UIColor.separator // Always low-contrast; ignores user preference
```

---

## 评估检查清单

使用此检查清单验证 iPad 就绪情况：

### 布局与多任务处理
- [ ] App 使用带有 `horizontalSizeClass` 的自适应布局
- [ ] 已在所有分屏浏览比例（1/3、1/2、2/3）下测试
- [ ] 已在侧拉模式（紧凑宽度）下测试
- [ ] 台前调度：可流畅调整至任意尺寸
- [ ] 支持多个场景/窗口
- [ ] 两种屏幕方向（竖屏和横屏）均可正常工作
- [ ] 任何尺寸下均无内容被裁切
- [ ] 在所有 iPad 机型上均遵循安全区域

### 导航
- [ ] 常规宽度下显示侧边栏
- [ ] 紧凑宽度下使用标签栏
- [ ] 未选择任何项目时，详细信息视图显示占位内容
- [ ] 工具栏项目放置在顶部，而非底部
- [ ] 在适当情况下使用三栏布局

### 指针与触控板
- [ ] 所有交互元素均具有悬停效果
- [ ] 提供右键单击上下文菜单
- [ ] 指针光标会根据内容调整（例如，文本使用 I 形光标）
- [ ] 支持通过单击并拖动进行重新排序

### 键盘
- [ ] 所有主要操作均提供 Cmd+按键快捷键
- [ ] 快捷键会显示在长按 Cmd 的浮层中
- [ ] Tab 键可在表单字段之间导航
- [ ] 不与系统快捷键冲突
- [ ] 方向键可用于导航列表和网格
- [ ] Return/Enter 可激活默认操作

### Apple Pencil
- [ ] 所有文本字段均支持“随手写”
- [ ] 绘图 App 支持压力和倾斜感应
- [ ] 已处理轻点两下交互（如适用）

### 拖放
- [ ] 内容可拖出至其他 App
- [ ] 可从其他 App 拖入内容
- [ ] 支持多项目拖移
- [ ] 所有拖移状态均有视觉反馈

### 外接显示器
- [ ] 显示扩展内容（而非仅镜像）
- [ ] 可妥善处理连接和断开连接

### 辅助功能
- [ ] 所有仅含图标的按钮和自定义交互元素均有 VoiceOver 标签
- [ ] 文本使用语义化字体样式，并随动态字体缩放（包括辅助功能字号）
- [ ] 所有功能均可通过全键盘控制访问（Tab 键导航、合理的焦点顺序）
- [ ] 无须仅依赖悬停状态即可辨别交互元素
- [ ] VoiceOver 在所有分屏浏览宽度下均可正确导航
- [ ] 遵循粗体文本偏好设置（SwiftUI 会自动处理；UIKit 检查 `UIAccessibility.isBoldTextEnabled`）
- [ ] 遵循增强对比度偏好设置（自定义颜色通过 `colorSchemeContrast` 或 `isDarkerSystemColorsEnabled` 提供更高对比度的变体）

---

## 反模式

### 禁止：放大 iPhone 布局
拉伸单栏 iPhone UI 以填满 iPad 屏幕会浪费空间，显得敷衍，并带来糟糕的体验。始终针对更大的画布重新设计。

### 禁止：停用多任务处理
绝不要选择不支持多任务处理。用户期望每个 App 都能在分屏浏览和侧拉中运行。强制要求全屏不利于 iPad 工作流程。

### 禁止：忽略键盘
许多 iPad 用户使用妙控键盘或智能键盘。不提供键盘快捷键的 App 会迫使他们频繁伸手触碰屏幕。为所有常用操作提供快捷键。

### 禁止：在常规宽度下使用 iPhone 风格的底部标签栏
底部标签栏会浪费 iPad 的垂直空间，并且显得格格不入。在常规宽度下，应改用侧边栏导航。SwiftUI 会通过 `.sidebarAdaptable` 自动完成此转换。

### 禁止：将弹出框显示为全屏工作表
在 iPad 上，弹出框应作为浮动面板锚定到其来源元素。仅对沉浸式内容或确实需要使用整个屏幕的流程使用全屏工作表。避免沿用 iPhone 上所有内容都以工作表呈现的模式。

### 禁止：忽略指针悬停状态
缺少悬停效果会让使用触控板时的 App 显得像是出了故障。用户无法判断哪些元素可以交互。始终为自定义交互元素添加悬停反馈。

### 禁止：硬编码尺寸
绝不要根据特定 iPad 型号硬编码宽度、高度或位置。使用自动布局约束、SwiftUI 灵活框架和 `GeometryReader` 实现动态尺寸调整。

### 禁止：忘记拖放
在 iPad 上，App 之间的拖放是核心工作流程。不支持拖放会使你的 App 成为内容流转的死胡同。至少应支持将文本、图像和 URL 拖入和拖出。

### 禁止：覆盖系统键盘快捷键
占用 Cmd+H、Cmd+Tab、Cmd+Space 或地球键快捷键不仅不会生效，还会让习惯系统行为的用户感到困惑。分配快捷键前，请查看 Apple 的保留快捷键列表。

### 不要：在不滚动的情况下呈现密集内容
大尺寸 iPad 屏幕容易让设计师倾向于一次性展示所有内容。当内容超出可见区域时，仍应支持滚动。切勿为了避免滚动而截断内容。