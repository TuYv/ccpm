---
name: macos-design-guidelines
description: Apple Human Interface Guidelines for Mac. Use when building macOS apps with SwiftUI or AppKit, implementing menu bars, toolbars, window management, or keyboard shortcuts. Triggers on tasks involving Mac UI, desktop apps, or Mac Catalyst.
license: MIT
metadata:
  author: platform-design-skills
  version: "1.0.0"
---
# macOS 人机界面指南

Mac App 面向高级用户，他们期望获得全面的键盘控制、常驻菜单栏、可调整大小的多窗口布局，以及紧密的系统集成。这些指南将 Apple 的 HIG 编纂为可操作的规则，并提供 SwiftUI 和 AppKit 示例。

---

## 1. 菜单栏（关键）

每个 Mac App 都必须有菜单栏。它是用户发现命令的主要途径。当用户找不到某项功能时，他们首先会在菜单栏中查找。

### 规则 1.1 — 提供标准菜单

每个 App 至少必须包含：**App**、**文件**、**编辑**、**显示**、**窗口**、**帮助**。只有当 App 并非基于文稿时，才能省略“文件”菜单。应在“编辑”和“显示”之间，或“显示”和“窗口”之间添加 App 专用菜单。

```swift
// SwiftUI — Standard menu structure
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .commands {
            // Adds to existing standard menus
            CommandGroup(after: .newItem) {
                Button("New from Template...") { newFromTemplate() }
                    .keyboardShortcut("T", modifiers: [.command, .shift])
            }
            CommandMenu("Canvas") {
                Button("Zoom to Fit") { zoomToFit() }
                    .keyboardShortcut("0", modifiers: .command)
                Divider()
                Button("Add Artboard") { addArtboard() }
                    .keyboardShortcut("A", modifiers: [.command, .shift])
            }
        }
    }
}
```

```swift
// AppKit — Building menus programmatically
let editMenu = NSMenu(title: "Edit")
let undoItem = NSMenuItem(title: "Undo", action: #selector(UndoManager.undo), keyEquivalent: "z")
let redoItem = NSMenuItem(title: "Redo", action: #selector(UndoManager.redo), keyEquivalent: "Z")
editMenu.addItem(undoItem)
editMenu.addItem(redoItem)
editMenu.addItem(.separator())
```

### 规则 1.2 — 为所有菜单项提供键盘快捷键

每个执行操作的菜单项都必须有键盘快捷键。标准操作应使用标准快捷键（Cmd+C、Cmd+V、Cmd+Z 等）。自定义快捷键应使用 Cmd 加一个字母。将 Cmd+Shift、Cmd+Option 和 Cmd+Ctrl 组合键保留给次要操作。

**标准快捷键参考：**

| 操作 | 快捷键 |
|--------|----------|
| 新建 | Cmd+N |
| 打开 | Cmd+O |
| 关闭 | Cmd+W |
| 保存 | Cmd+S |
| 另存为 | Cmd+Shift+S |
| 打印 | Cmd+P |
| 撤销 | Cmd+Z |
| 重做 | Cmd+Shift+Z |
| 剪切 | Cmd+X |
| 拷贝 | Cmd+C |
| 粘贴 | Cmd+V |
| 全选 | Cmd+A |
| 查找 | Cmd+F |
| 查找下一个 | Cmd+G |
| 偏好设置/设置 | Cmd+, |
| 隐藏 App | Cmd+H |
| 退出 | Cmd+Q |
| 最小化 | Cmd+M |
| 全屏 | Cmd+Ctrl+F |

### 规则 1.3 — 动态更新菜单

菜单项必须反映当前状态。禁用当前不适用的菜单项。更新标题以匹配上下文（例如使用“撤销输入”，而不只是“撤销”）。对于开启/关闭状态，应切换显示勾选标记。

```swift
// SwiftUI — Add sidebar toggle alongside existing toolbar menu commands
CommandGroup(after: .toolbar) {
    Button(showingSidebar ? "Hide Sidebar" : "Show Sidebar") {
        showingSidebar.toggle()
    }
    .keyboardShortcut("S", modifiers: [.command, .control])
}
```

```swift
// AppKit — Validate menu items
override func validateMenuItem(_ menuItem: NSMenuItem) -> Bool {
    if menuItem.action == #selector(delete(_:)) {
        menuItem.title = selectedItems.count > 1 ? "Delete \(selectedItems.count) Items" : "Delete"
        return !selectedItems.isEmpty
    }
    return super.validateMenuItem(menuItem)
}
```

### 规则 1.4 — 上下文菜单

为所有交互元素提供右键上下文菜单。上下文菜单应包含与所点击元素最相关的菜单栏操作子集，以及该元素特有的操作。

```swift
// SwiftUI
Text(item.name)
    .contextMenu {
        Button("Rename...") { rename(item) }
        Button("Duplicate") { duplicate(item) }
        Divider()
        Button("Delete", role: .destructive) { delete(item) }
    }
```

### 规则 1.5 — App 菜单结构

App 菜单（最左侧、以粗体显示 App 名称）必须包含：关于、偏好设置/设置（Cmd+,）、服务子菜单、隐藏 App（Cmd+H）、隐藏其他（Cmd+Option+H）、全部显示、退出（Cmd+Q）。绝不要重命名或移除这些标准菜单项。

```swift
// SwiftUI — Settings scene
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
        Settings { SettingsView() }  // Automatically wired to Cmd+,
    }
}
```

### 规则 1.6 — 稳定的命令名称和位置

将菜单栏视为 App 的命令记忆。将常用操作放在固定的菜单中，并使用稳定的名称和快捷键，使用户能够快速识别，而不必寻找因上下文而异的变体。

---

## 2. 窗口（关键）

Mac 用户希望能够完全控制窗口的大小、位置和生命周期。在 Mac 上，与窗口管理相冲突的 App 会让人感觉其根本无法正常使用。

### 规则 2.1 — 可调整大小并设置合理的最小值

所有主窗口都必须能够自由调整大小。设置一个能保证 UI 可用的最小尺寸。除非内容确实无法缩放（这种情况很少见），否则绝不要设置最大尺寸。

```swift
// SwiftUI
WindowGroup {
    ContentView()
        .frame(minWidth: 600, minHeight: 400)
}
.defaultSize(width: 900, height: 600)
```

```swift
// AppKit
window.minSize = NSSize(width: 600, height: 400)
window.setContentSize(NSSize(width: 900, height: 600))
```

### 规则 2.2 — 支持全屏和分屏浏览

通过设置适当的窗口集合行为来启用原生全屏模式。绿色交通灯按钮必须能够进入全屏模式或显示平铺选择器。

```swift
// AppKit
window.collectionBehavior.insert(.fullScreenPrimary)
```

SwiftUI 窗口会自动获得全屏支持。

### 规则 2.3 — 多窗口

除非你的 App 是单一用途的实用工具，否则应支持多个窗口。基于文稿的 App 必须允许同时打开多个文稿。在 SwiftUI 中使用 `WindowGroup` 或 `DocumentGroup`。

```swift
// SwiftUI — Document-based app
@main
struct TextEditorApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: TextDocument()) { file in
            TextEditorView(document: file.$document)
        }
    }
}
```

### 规则 2.4 — 标题栏显示文档信息

对于基于文档的应用，标题栏必须显示文档名称。支持拖动代理图标。显示已编辑状态（关闭按钮中的圆点）。支持点击标题栏重命名。

```swift
// AppKit
window.representedURL = document.fileURL
window.title = document.displayName
window.isDocumentEdited = document.hasUnsavedChanges
```

```swift
// SwiftUI — NavigationSplitView titles
NavigationSplitView {
    SidebarView()
} detail: {
    DetailView()
        .navigationTitle(document.name)
}
```

### 规则 2.5 — 记住窗口状态

在应用多次启动之间持久保存窗口的位置、大小和状态。使用 `NSWindow.setFrameAutosaveName` 或 SwiftUI 内置的状态恢复功能。

```swift
// AppKit
window.setFrameAutosaveName("MainWindow")

// SwiftUI — Automatic with WindowGroup
WindowGroup(id: "main") {
    ContentView()
}
.defaultPosition(.center)
```

### 规则 2.6 — 红绿灯按钮

切勿隐藏或重新定位关闭（红色）、最小化（黄色）或缩放（绿色）按钮。它们必须保留在左上角。使用自定义标题栏时，这些按钮仍必须可见且可正常使用。

```swift
// AppKit — Custom title bar that preserves traffic lights
window.titlebarAppearsTransparent = true
window.styleMask.insert(.fullSizeContentView)
// Traffic lights remain functional and visible
```

---

## 3. 工具栏（高优先级）

工具栏是仅次于菜单栏的辅助命令界面。它们用于快速访问常用操作，并且应支持自定义。

### 规则 3.1 — 统一标题栏和工具栏

使用统一的标题栏和工具栏样式，以呈现现代化外观。工具栏位于标题栏区域，可节省垂直空间。

```swift
// SwiftUI
WindowGroup {
    ContentView()
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: compose) {
                    Label("Compose", systemImage: "square.and.pencil")
                }
            }
        }
}
.windowToolbarStyle(.unified)
```

```swift
// AppKit
window.titleVisibility = .hidden
window.toolbarStyle = .unified
```

### 规则 3.2 — 用户可自定义的工具栏

允许用户添加、移除和重新排列工具栏项目。提供一组默认项目以及一组包含所有可用项目的超集。

```swift
// SwiftUI — Customizable toolbar
.toolbar(id: "main") {
    ToolbarItem(id: "compose", placement: .primaryAction) {
        Button(action: compose) {
            Label("Compose", systemImage: "square.and.pencil")
        }
    }
    ToolbarItem(id: "filter", placement: .secondaryAction) {
        Button(action: toggleFilter) {
            Label("Filter", systemImage: "line.3.horizontal.decrease")
        }
    }
}
.toolbarRole(.editor)
```

### 规则 3.3 — 使用分段控件切换视图

使用工具栏中的分段控件或选择器在内容视图之间切换（例如列表/网格/分栏）。这是工具栏模式，而不是标签栏模式。

```swift
// SwiftUI
ToolbarItem(placement: .principal) {
    Picker("View Mode", selection: $viewMode) {
        Label("List", systemImage: "list.bullet").tag(ViewMode.list)
        Label("Grid", systemImage: "square.grid.2x2").tag(ViewMode.grid)
        Label("Column", systemImage: "rectangle.split.3x1").tag(ViewMode.column)
    }
    .pickerStyle(.segmented)
}
```

### 规则 3.4 — 工具栏中的搜索栏

将搜索栏放置在工具栏的尾部区域。在 SwiftUI 中使用 `.searchable()`，以实现带有建议和令牌的标准搜索行为。

```swift
// SwiftUI
NavigationSplitView {
    SidebarView()
} detail: {
    ContentListView()
        .searchable(text: $searchText, placement: .toolbar, prompt: "Search items")
        .searchSuggestions {
            ForEach(suggestions) { suggestion in
                Text(suggestion.title).searchCompletion(suggestion.title)
            }
        }
}
```

### 规则 3.5 — 工具栏标签和图标

工具栏项目应同时具有图标（SF Symbol）和文本标签。在紧凑模式下，仅显示图标。优先使用带标签的图标，以便用户发现其功能。使用 `Label` 同时提供二者。

---

## 4. 侧边栏（高优先级）

侧边栏是 Mac App 的主要导航界面。它们显示在起始边缘，为顶层分区和内容库提供持久的访问入口。

### 规则 4.1 — 位于起始边缘且可折叠

将侧边栏放置在左侧（起始）边缘。使其可通过工具栏按钮或键盘快捷键折叠。Apple 并未定义通用的侧边栏快捷键——请选择一个适合你的 App 的快捷键（例如，Cmd+Ctrl+S 很常见，但无法保证在所有 App 中都未被占用）。持久保存折叠状态。

```swift
// SwiftUI
NavigationSplitView(columnVisibility: $columnVisibility) {
    List(selection: $selection) {
        Section("Library") {
            Label("All Items", systemImage: "tray.full")
            Label("Favorites", systemImage: "star")
            Label("Recent", systemImage: "clock")
        }
        Section("Tags") {
            ForEach(tags) { tag in
                Label(tag.name, systemImage: "tag")
            }
        }
    }
    .navigationSplitViewColumnWidth(min: 180, ideal: 220, max: 320)
} detail: {
    DetailView(selection: selection)
}
.navigationSplitViewStyle(.prominentDetail)
```

### 规则 4.2 — 源列表样式

使用源列表样式（`.listStyle(.sidebar)`）进行内容库导航。源列表具有半透明背景，通过活力效果显示其背后的桌面或窗口。

```swift
// SwiftUI
List(selection: $selection) {
    ForEach(sections) { section in
        Section(section.name) {
            ForEach(section.items) { item in
                NavigationLink(value: item) {
                    Label(item.name, systemImage: item.icon)
                }
            }
        }
    }
}
.listStyle(.sidebar)
```

### 规则 4.3 — 使用大纲视图展示层级结构

当内容具有层级结构时（例如文件夹树、项目结构），使用披露组或大纲视图，让用户能够展开和折叠各个层级。

```swift
// SwiftUI — Recursive outline
List(selection: $selection) {
    OutlineGroup(rootNodes, children: \.children) { node in
        Label(node.name, systemImage: node.icon)
    }
}
```

### 规则 4.4 — 拖动重新排序

可以重新排序的侧边栏项目（书签、收藏项、自定义分区）必须支持拖动重新排序。实现 `onMove` 或 `NSOutlineView` 拖动委托。

```swift
// SwiftUI
ForEach(favorites) { item in
    Label(item.name, systemImage: item.icon)
}
.onMove { source, destination in
    favorites.move(fromOffsets: source, toOffset: destination)
}
```

### 规则 4.5 — 徽标计数

在侧边栏项目上显示徽标计数，用于表示未读数量、待处理项目或通知。使用 `.badge()` 修饰符。

```swift
// SwiftUI
Label("Inbox", systemImage: "tray")
    .badge(unreadCount)
```

---

## 5. 键盘（关键）

相比其他任何平台，Mac 用户都更加依赖键盘快捷键。缺乏全面键盘支持的应用就是一个有缺陷的 Mac 应用。

### 规则 5.1 — 所有操作都使用 Cmd 快捷键

每个可通过鼠标执行的操作都必须有对应的键盘操作。主要操作使用 Cmd+字母。次要操作使用 Cmd+Shift 或 Cmd+Option。第三级操作使用 Cmd+Ctrl。

**键盘快捷键约定：**

| 修饰键模式 | 用途 |
|-----------------|-------|
| Cmd+letter | 主要操作（新建、打开、保存等） |
| Cmd+Shift+letter | 主要操作的变体（另存为、查找上一个） |
| Cmd+Option+letter | 替代模式（粘贴并匹配样式） |
| Cmd+Ctrl+letter | 窗口/视图控制（全屏、侧边栏） |
| Ctrl+letter | Emacs 风格的文本导航（可接受） |
| Fn+key | 系统功能（F11 显示桌面等） |

### 规则 5.2 — 完整的键盘导航

支持使用 Tab 在控件之间移动。支持在列表、网格和表格中使用方向键。支持使用 Shift+Tab 反向导航。在 SwiftUI 中使用 `focusable()` 和 `@FocusState`。

```swift
// SwiftUI — Focus management
struct ContentView: View {
    @FocusState private var focusedField: Field?

    var body: some View {
        VStack {
            TextField("Name", text: $name)
                .focused($focusedField, equals: .name)
            TextField("Email", text: $email)
                .focused($focusedField, equals: .email)
        }
        .onSubmit { advanceFocus() }
    }
}
```

### 规则 5.3 — 使用 Escape 取消或关闭

Esc 必须关闭弹出框、表单、对话框，并取消正在进行的操作。在文本字段中，Esc 会恢复为之前的值。在模态对话框中，Esc 等同于单击“取消”。

```swift
// SwiftUI — Sheet with Esc support (automatic)
.sheet(isPresented: $showingSheet) {
    SheetView()  // Esc dismisses automatically
}

// AppKit — Custom responder
override func cancelOperation(_ sender: Any?) {
    dismiss(nil)
}
```

### 规则 5.4 — 使用 Return 执行默认操作

在对话框和表单中，Return/Enter 会激活默认按钮（以蓝色在视觉上突出显示）。默认按钮始终是最安全的主要操作。

```swift
// SwiftUI
Button("Save") { save() }
    .keyboardShortcut(.defaultAction)  // Enter key

Button("Cancel") { cancel() }
    .keyboardShortcut(.cancelAction)   // Esc key
```

### 规则 5.5 — 使用 Delete 删除

Delete 键（Backspace）必须能够删除列表、表格和集合中选中的项目。使用 Cmd+Delete 执行破坏性更强的删除操作（移到废纸篓）。始终支持使用 Cmd+Z 撤销删除。

### 规则 5.6 — 使用 Space 快速查看

当项目支持预览时，按空格键应调用 Quick Look。请在 AppKit 中使用 `QLPreviewPanel` API，或在 SwiftUI 中使用 `.quickLookPreview()`。

```swift
// SwiftUI
List(selection: $selection) {
    ForEach(files) { file in
        FileRow(file: file)
    }
}
.quickLookPreview($quickLookItem, in: files)
```

### 规则 5.7 — 方向键导航

在列表和网格中，按上/下方向键可移动所选项。按左/右方向键可折叠/展开披露组或在列之间导航。Cmd+上方向键跳转到开头，Cmd+下方向键跳转到末尾。

---

## 6. 指针和鼠标（高）

Mac 是一个以指针操作为主的平台。每个交互元素都必须响应悬停、单击、右键单击和拖放操作。

### 规则 6.1 — 悬停状态

所有交互元素都必须具有可见的悬停状态。按钮应高亮显示，行应显示选择指示器，链接应改变光标。请在 SwiftUI 中使用 `.onHover`。

```swift
// SwiftUI — Hover effect
struct HoverableRow: View {
    @State private var isHovered = false

    var body: some View {
        HStack {
            Text(item.name)
            Spacer()
            if isHovered {
                Button("Edit") { edit() }
                    .buttonStyle(.borderless)
            }
        }
        .padding(8)
        .background(isHovered ? Color.primary.opacity(0.05) : .clear)
        .cornerRadius(6)
        .onHover { hovering in isHovered = hovering }
    }
}
```

### 规则 6.2 — 右键上下文菜单

每个交互元素都必须响应右键单击并显示上下文菜单。上下文菜单应包含与所点击项目最相关的操作。

### 规则 6.3 — 拖放

支持通过拖放来操作内容：重新排序项目、在容器之间移动项目、从 Finder 导入文件以及导出内容。

```swift
// SwiftUI — Drag and drop
ForEach(items) { item in
    ItemView(item: item)
        .draggable(item)
}
.dropDestination(for: Item.self) { items, location in
    handleDrop(items, at: location)
    return true
}
```

```swift
// Accepting file drops from Finder
.dropDestination(for: URL.self) { urls, location in
    importFiles(urls)
    return true
}
```

### 规则 6.4 — 滚动行为

同时支持触控板的平滑/惯性滚动和鼠标滚轮的离散滚动。在内容边界处使用弹性/回弹滚动。在适当情况下支持水平滚动。

### 规则 6.5 — 光标变化

改变光标以表明可执行的操作：可点击元素使用指针光标，文本使用 I 形光标，绘图使用十字光标，窗口/分隔条边缘使用调整大小光标，可拖动内容使用抓取手形光标。

```swift
// AppKit — Custom cursor
override func resetCursorRects() {
    addCursorRect(bounds, cursor: .crosshair)
}
```

### 规则 6.6 — 多选

在列表、表格和网格中，支持使用 Cmd+单击进行不连续选择，并使用 Shift+单击进行范围选择。这是 Mac 上根深蒂固的交互模式。

```swift
// SwiftUI — Tables with multi-selection
Table(items, selection: $selectedItems) {
    TableColumn("Name", value: \.name)
    TableColumn("Date", value: \.dateFormatted)
    TableColumn("Size", value: \.sizeFormatted)
}
```

---

## 7. 通知与提醒（中等）

Mac 用户非常珍视自己的注意力。只有在确有必要时才打断他们。

### 规则 7.1 — 恰当地使用通知中心

仅针对发生在应用之外或需要用户操作的事件发送通知。切勿为常规操作发送通知。通知必须可供用户采取行动。

```swift
// UserNotifications
let content = UNMutableNotificationContent()
content.title = "Download Complete"
content.body = "project-assets.zip is ready"
content.categoryIdentifier = "DOWNLOAD"
content.sound = .default

let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
UNUserNotificationCenter.current().add(request)
```

### 规则 7.2 — 带有不再提示选项的提醒

对于重复出现的提醒，应提供“不再显示”复选框。尊重用户的选择并持久化保存该设置。

```swift
// AppKit — Alert with suppression
let alert = NSAlert()
alert.messageText = "Remove from library?"
alert.informativeText = "The file will be moved to the Trash."
alert.alertStyle = .warning
alert.addButton(withTitle: "Remove")
alert.addButton(withTitle: "Cancel")
alert.showsSuppressionButton = true
alert.suppressionButton?.title = "Do not ask again"

let response = alert.runModal()
if alert.suppressionButton?.state == .on {
    UserDefaults.standard.set(true, forKey: "suppressRemoveAlert")
}
```

### 规则 7.3 — 不要进行不必要的打断

切勿针对成功完成的操作显示提醒。应改用内联状态指示器、工具栏徽标或细微的动画。仅对破坏性或不可逆操作使用模态提醒。

### 规则 7.4 — Dock 徽标

在 Dock 图标上显示通知数量徽标。当用户处理完通知后，应及时将其清除。

```swift
// AppKit
NSApp.dockTile.badgeLabel = unreadCount > 0 ? "\(unreadCount)" : nil
```

### 规则 7.5 — 使反馈与认知成本相匹配

对于常规操作，应通过内联状态、工具栏状态或细微的动画来确认操作已完成。仅当用户必须停下来、评估后果并做出选择时，才使用模态提醒。

---

## 8. 系统集成（中等）

Mac 应用存在于一个丰富的生态系统中。深度集成能让应用呈现出原生体验。

### 规则 8.1 — Dock 图标与菜单

提供高质量的 1024x1024 应用图标。支持 Dock 右键菜单，以便用户执行快捷操作。在 Dock 菜单中显示最近使用的文稿。

```swift
// AppKit — Dock menu
override func applicationDockMenu(_ sender: NSApplication) -> NSMenu? {
    let menu = NSMenu()
    menu.addItem(withTitle: "New Window", action: #selector(newWindow(_:)), keyEquivalent: "")
    menu.addItem(withTitle: "New Document", action: #selector(newDocument(_:)), keyEquivalent: "")
    menu.addItem(.separator())
    for doc in recentDocuments.prefix(5) {
        menu.addItem(withTitle: doc.name, action: #selector(openRecent(_:)), keyEquivalent: "")
    }
    return menu
}
```

### 规则 8.2 — Spotlight 集成

使用 `CSSearchableItem` 和 Core Spotlight 为应用内容建立索引，以支持 Spotlight 搜索。用户期望能够通过 Cmd+Space 找到应用内容。

```swift
import CoreSpotlight

let attributeSet = CSSearchableItemAttributeSet(contentType: .text)
attributeSet.title = document.title
attributeSet.contentDescription = document.summary
attributeSet.thumbnailData = document.thumbnail?.pngData()

let item = CSSearchableItem(uniqueIdentifier: document.id, domainIdentifier: "documents", attributeSet: attributeSet)
CSSearchableIndex.default().indexSearchableItems([item])
```

### 规则 8.3 — Quick Look 支持

通过 Quick Look 预览扩展为自定义文件类型提供 Quick Look 预览。用户期望在 Finder 中按下空格键即可预览任何文件。

### 规则 8.4 — 共享扩展

实现共享菜单，以便用户将应用中的内容共享到“信息”“邮件”“备忘录”等应用。同时也应接收来自其他应用的共享内容。

```swift
// SwiftUI
ShareLink(item: document.url) {
    Label("Share", systemImage: "square.and.arrow.up")
}
```

### 规则 8.5 — 服务菜单

注册服务菜单，以接收来自其他应用的文本、URL 或文件。这是 Mac 独有的集成点，也是高级用户依赖的功能。

### 规则 8.6 — 快捷指令和 AppleScript

通过提供 App Intents 来支持“快捷指令”应用。对于高级自动化，可通过 `.sdef` 脚本字典添加 AppleScript/JXA 脚本支持。

```swift
// App Intents for Shortcuts
struct CreateDocumentIntent: AppIntent {
    static var title: LocalizedStringResource = "Create Document"
    static var description = IntentDescription("Creates a new document with the given title.")

    @Parameter(title: "Title")
    var title: String

    func perform() async throws -> some IntentResult {
        let doc = DocumentManager.shared.create(title: title)
        return .result(value: doc.title)
    }
}
```

---

## 9. 视觉设计（高优先级）

Mac 应用的外观和体验应当让人感觉它原生属于该平台。使用系统提供的材质、字体和颜色。

### 规则 9.1 — 使用系统字体

使用标准动态字体大小的 SF Pro（系统字体）。代码使用 SF Mono。切勿硬编码字体大小；应使用语义样式。

```swift
// SwiftUI — Semantic font styles
Text("Title").font(.title)
Text("Headline").font(.headline)
Text("Body text").font(.body)
Text("Caption").font(.caption)
Text("let x = 42").font(.system(.body, design: .monospaced))
```

### 规则 9.2 — 鲜明效果和材质

为侧边栏和工具栏背景使用系统材质。鲜明效果可使桌面或底层内容透显出来，让应用契合 Mac 的视觉语言。

```swift
// SwiftUI
List { ... }
    .listStyle(.sidebar)  // Automatic vibrancy

// Custom vibrancy
ZStack {
    VisualEffectView(material: .sidebar, blendingMode: .behindWindow)
    Text("Sidebar Content")
}
```

```swift
// AppKit — Visual effect view
let visualEffect = NSVisualEffectView()
visualEffect.material = .sidebar
visualEffect.blendingMode = .behindWindow
visualEffect.state = .followsWindowActiveState
```

### 规则 9.3 — 遵循系统强调色

使用系统强调色来表示选择、强调和交互元素。切勿在标准控件上使用固定的品牌颜色覆盖系统强调色。仅在适当情况下对自定义视图使用 `.accentColor` 或 `.tint`。

```swift
// SwiftUI — Follows system accent automatically
Button("Action") { doSomething() }
    .buttonStyle(.borderedProminent)  // Uses system accent color

Toggle("Enable feature", isOn: $isEnabled)  // Toggle tint follows accent
```

### 规则 9.4 — 支持深色模式

每个视图都必须同时支持浅色和深色外观。使用语义颜色（`Color.primary`、`Color.secondary`、`.background`），而不是硬编码颜色。请在两种模式下进行测试。

```swift
// SwiftUI — Semantic colors
Text("Title").foregroundStyle(.primary)
Text("Subtitle").foregroundStyle(.secondary)

RoundedRectangle(cornerRadius: 8)
    .fill(Color(nsColor: .controlBackgroundColor))

// Asset catalog: define colors for Both Appearances
// Never use Color.white or Color.black for UI surfaces
```

### 规则 9.5 — 半透明效果

遵循“降低透明度”辅助功能设置。降低透明度后，应使用纯色背景替代半透明材质。

```swift
// SwiftUI
@Environment(\.accessibilityReduceTransparency) var reduceTransparency

var body: some View {
    if reduceTransparency {
        Color(nsColor: .windowBackgroundColor)
    } else {
        VisualEffectView(material: .sidebar, blendingMode: .behindWindow)
    }
}
```

### 规则 9.6 — 保持一致的间距和布局

使用 20pt 的标准边距、相关控件之间使用 8pt 间距、分组之间使用 20pt 间距。将控件与网格对齐。使用 SwiftUI 的内置间距，或使用 AppKit 的 Auto Layout 及系统间距约束。

---

## 10. 弹出框（中等）

弹出框用于呈现锚定到某个控件的上下文内容。在 Mac 应用中，弹出框常用于选项面板、颜色选择器和上下文设置。

### 规则 10.1 — 将弹出框用于临时的上下文相关内容

弹出框附加到源视图，并在用户点击外部区域或按下 Esc 键时关闭。将其用于适用于特定元素的设置或选项。不要将弹出框用于主要工作流程或多步骤操作。

```swift
// SwiftUI
Button("Format...") { showingFormatPopover = true }
    .popover(isPresented: $showingFormatPopover, arrowEdge: .bottom) {
        FormatOptionsView()
            .frame(width: 280)
            .padding()
    }
```

### 规则 10.2 — 使用 Esc 键关闭弹出框

当用户按下 Esc 键时，弹出框必须关闭。对于 `.popover`，SwiftUI 会自动处理此行为。当 `behavior` 设置为 `.transient` 或 `.semitransient` 时，AppKit 的 `NSPopover` 也会在按下 Esc 键时关闭。

### 规则 10.3 — 根据内容调整弹出框大小

为弹出框的内容设置合理的宽度。不要让弹出框超出所需宽度。除非列表本身就很长（例如字体选择器），否则内容不应需要滚动。

---

## 11. 辅助功能（关键）

Mac 应用必须支持 VoiceOver、全键盘控制、切换控制及相关辅助技术。

### 规则 11.1 — 为所有交互元素提供 VoiceOver 标签

每个按钮、控件和交互元素都必须具有含义明确的辅助功能标签。仅包含图标的工具栏项目和图片按钮必须提供标签。

**正确：**
```swift
Button(action: deleteSelected) {
    Image(systemName: "trash")
}
.accessibilityLabel("Delete selected items")
```

**错误：**
```swift
Button(action: deleteSelected) {
    Image(systemName: "trash")
}
// VoiceOver reads "trash" — ambiguous without context
```

### 规则 11.2 — 完整键盘访问

所有可通过鼠标执行的操作也必须能够通过键盘执行。Tab 键必须能在所有控件之间移动焦点。方向键必须能在列表、表格和网格内导航。不得出现键盘焦点陷阱。

```swift
// SwiftUI — Ensure all custom views are focusable
MyCustomControl()
    .focusable()
    .onKeyPress(.return) { handleActivation(); return .handled }
```

### 规则 11.3 — 遵循“减弱动态效果”设置

当用户启用“减弱动态效果”时，禁用装饰性动画或使用其他效果替代。

```swift
@Environment(\.accessibilityReduceMotion) var reduceMotion

var body: some View {
    ContentView()
        .animation(reduceMotion ? nil : .spring(), value: isExpanded)
}
```

### 规则 11.4 — 遵循“降低透明度”设置

启用“降低透明度”时，使用纯色背景替代半透明材质（参见规则 9.5）。

### 规则 11.5 — 合理的焦点顺序

VoiceOver 必须以符合逻辑的阅读顺序遍历元素（对于从左到右的书写方向，应从左上到右下）。当视觉布局与阅读顺序不一致时，使用 `.accessibilitySortPriority()` 或 `accessibilityElement(children:)` 修正顺序。

### 规则 11.6 — 响应“粗体文本”设置

当用户在“系统设置”中启用“粗体文本”时，自定义渲染的文本必须相应调整。SwiftUI 文本样式会自动处理此设置。对于 AppKit，请检查 `NSWorkspace.shared.accessibilityDisplayShouldUseBoldText`；也可以在 SwiftUI 中使用 `@Environment(\.legibilityWeight)`，为自定义文本应用更粗的字重。

**正确：**
```swift
// SwiftUI — environment handles bold text automatically for standard styles
Text("Section Header")
    .font(.headline)

// SwiftUI — custom rendering responds to legibilityWeight
@Environment(\.legibilityWeight) var legibilityWeight

var body: some View {
    Text("Custom Label")
        .fontWeight(legibilityWeight == .bold ? .bold : .regular)
}
```

**错误：**
```swift
// Hardcoded weight ignores Bold Text preference
Text("Custom Label")
    .fontWeight(.regular) // Never adapts to Bold Text setting
```

### 规则 11.7 — 响应“增强对比度”设置

当用户在“系统设置”中启用“增强对比度”时，自定义颜色必须提供对比度更高的变体。在 AppKit 中使用 `NSWorkspace.shared.accessibilityDisplayShouldIncreaseContrast`，或在 SwiftUI 中使用 `@Environment(\.colorSchemeContrast)`，以检测该设置并应用适当的值。

**正确：**
```swift
// SwiftUI
@Environment(\.colorSchemeContrast) var contrast

var borderColor: Color {
    contrast == .increased ? Color.primary : Color.secondary
}

// AppKit
let shouldIncrease = NSWorkspace.shared.accessibilityDisplayShouldIncreaseContrast
let borderColor: NSColor = shouldIncrease ? .labelColor : .separatorColor
```

**错误：**
```swift
// Static color ignores Increase Contrast setting
let borderColor = NSColor.separatorColor // Always low-contrast; ignores user preference
```

---

## 键盘快捷键快速参考

### 导航
| 快捷键 | 操作 |
|----------|--------|
| Cmd+N | 新建窗口/文档 |
| Cmd+O | 打开 |
| Cmd+W | 关闭窗口/标签页 |
| Cmd+Q | 退出应用 |
| Cmd+, | 设置/偏好设置 |
| Cmd+Tab | 切换应用 |
| Cmd+` | 在应用内切换窗口 |
| Cmd+T | 新建标签页 |

### 编辑
| 快捷键 | 操作 |
|----------|--------|
| Cmd+Z | 撤销 |
| Cmd+Shift+Z | 重做 |
| Cmd+X / C / V | 剪切/复制/粘贴 |
| Cmd+A | 全选 |
| Cmd+D | 创建副本 |
| Cmd+F | 查找 |
| Cmd+G | 查找下一个 |
| Cmd+Shift+G | 查找上一个 |
| Cmd+E | 使用所选内容进行查找 |

### 视图
| 快捷键 | 操作 |
|----------|--------|
| Cmd+Ctrl+F | 切换全屏模式 |
| Cmd+Ctrl+S | 切换边栏（由应用定义；并非通用的 HIG 标准） |
| Cmd++ / Cmd+- | 放大/缩小 |
| Cmd+0 | 实际大小 |

---

## 评估检查清单

发布 Mac 应用之前，请确认：

### 菜单栏
- [ ] 应用具有包含标准菜单的完整菜单栏
- [ ] 所有操作都有键盘快捷键
- [ ] 菜单项会动态更新（启用/禁用、标题变更）
- [ ] 所有交互元素都有上下文菜单
- [ ] 应用菜单包含“关于”“设置”“隐藏”和“退出”

### 窗口
- [ ] 窗口可以自由调整大小，并具有合理的最小尺寸
- [ ] 全屏模式和分屏浏览可以正常使用
- [ ] 支持多个窗口（如适用）
- [ ] 窗口位置和大小在应用重新启动后保持不变
- [ ] 红绿灯按钮可见且功能正常
- [ ] 显示文档标题和编辑状态（如果是基于文档的应用）

### 工具栏
- [ ] 提供包含常用操作的工具栏
- [ ] 用户可以自定义工具栏
- [ ] 工具栏中提供搜索框

### 边栏
- [ ] 提供用于导航的边栏（如果应用包含多个部分）
- [ ] 边栏可以折叠
- [ ] 使用具有视觉特效的源列表样式

### 键盘
- [ ] 支持完整的键盘导航（Tab、方向键、Enter、Esc）
- [ ] 所有破坏性操作均支持使用 Cmd+Z 撤销
- [ ] 使用 Space 进行快速查看预览
- [ ] Delete 键可删除所选项目
- [ ] 不存在键盘焦点陷阱（用户始终可以按 Tab 移出）

### 指针
- [ ] 交互元素具有悬停状态
- [ ] 所有位置都提供右键上下文菜单
- [ ] 支持通过拖放操作内容
- [ ] 支持使用 Cmd+Click 进行多选
- [ ] 光标会进行适当变化

### 通知
- [ ] 仅针对重要事件发送通知
- [ ] 重复出现的提醒提供禁止再次显示选项
- [ ] 日常操作不使用模态提醒

### 系统集成
- [ ] 提供高质量的 Dock 图标
- [ ] 内容已编入 Spotlight 索引（如适用）
- [ ] 共享菜单可以正常使用
- [ ] 为快捷指令提供 App Intents

### 视觉设计
- [ ] 使用语义尺寸的系统字体
- [ ] 完整支持深色模式
- [ ] 遵循系统强调色
- [ ] 半透明效果遵循辅助功能设置
- [ ] 在 8pt 网格上保持一致的间距

### 弹出式窗口
- [ ] 弹出式窗口锚定到其来源元素，并使用箭头指向该元素
- [ ] 按 Esc 可关闭弹出式窗口
- [ ] 弹出式窗口的大小适应其内容，不出现不必要的滚动

### 辅助功能
- [ ] 所有仅含图标的工具栏项目和图像按钮都有辅助功能标签
- [ ] 所有可通过鼠标执行的操作也都可通过键盘执行（完全键盘控制）
- [ ] 启用“减弱动态效果”后禁用装饰性动画
- [ ] 启用“降低透明度”后使用纯色背景替换半透明表面
- [ ] VoiceOver 的遍历顺序符合逻辑（从左上到右下）
- [ ] 遵循“粗体文本”偏好设置（SwiftUI 会自动处理；AppKit 检查 `accessibilityDisplayShouldUseBoldText`）
- [ ] 遵循“增强对比度”偏好设置（自定义颜色通过 `colorSchemeContrast` 或 `accessibilityDisplayShouldIncreaseContrast` 提供对比度更高的变体）

---

## 反模式

**不要在 Mac 应用中做以下事情：**

1. **没有菜单栏** — 每个 Mac 应用都需要菜单栏。没有例外。没有菜单的 Mac 应用就像没有方向盘的汽车。

2. **汉堡菜单** — 切勿在 Mac 上使用汉堡菜单。菜单栏正是为此而存在的。汉堡菜单会给人一种这是粗制滥造的 iOS 移植应用的感觉。

3. **底部标签栏** — Mac 应用使用边栏和工具栏，而不是 iOS 风格的标签栏。如果需要标签页，请使用标签栏中真正的文档标签页（如 Safari 或 Finder）。

4. **适合触控的大尺寸操作目标** — Mac 控件应该紧凑（高度为 22-28pt）。用户使用的是精确的指针输入。巨大的按钮既浪费空间，又显得格格不入。

5. **浮动操作按钮** — FAB 是一种 Material Design 模式。在 Mac 上，应将主要操作放在工具栏、菜单栏中，或使用内联按钮。

6. **每个操作都使用工作表** — 不要为简单操作使用模态工作表。应使用弹出框、内联编辑或直接操作。工作表应仅用于多步骤工作流或重要决策。

7. **自定义窗口装饰** — 不要使用自定义实现来替换标准标题栏、交通灯按钮或窗口控件。用户希望这些元素在所有应用中都能以一致的方式工作。

8. **忽视键盘操作** — 如果高级用户必须使用鼠标才能执行常用操作，说明你的键盘支持还不够完善。

9. **仅支持单窗口** — 除非你的应用确实只有单一用途（计算器、计时器），否则应支持多个窗口。用户希望能通过 Cmd+N 新建窗口。

10. **固定窗口大小** — 不可调整大小的窗口在 Mac 上会让人感觉功能失常。用户使用的显示器多种多样，从 13 英寸的笔记本电脑屏幕到 32 英寸的外接显示器都有，他们希望能充分利用这些空间。

11. **不支持 Cmd+Z 撤销** — 每个具有破坏性或修改性的操作都必须可以撤销。用户已经形成了依靠 Cmd+Z 作为安全保障的肌肉记忆。

12. **通知轰炸** — 发送过多通知的 Mac 应用会被用户撤销通知权限。只应针对真正需要关注的事件发送通知。

13. **忽视深色模式** — 如果 Mac 应用在深色模式下显示异常，会显得像是已被放弃维护。始终测试浅色和深色两种外观。

14. **硬编码颜色** — 使用语义化系统颜色，而不是硬编码的十六进制值。你的颜色应能自动适应浅色/深色模式和辅助功能设置。

15. **不支持拖放** — Mac 是一个以拖放为核心的平台。如果用户能看到内容，就会期望能将它拖到其他地方。