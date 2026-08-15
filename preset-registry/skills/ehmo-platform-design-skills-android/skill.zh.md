---
name: android-design-guidelines
description: Material Design 3 and Android platform guidelines. Use when building Android apps with Jetpack Compose or XML layouts, implementing Material You, navigation, or accessibility. Triggers on tasks involving Android UI, Compose components, dynamic color, or Material Design compliance.
license: MIT
metadata:
  author: platform-design-skills
  version: "1.0.0"
---
# Android 平台设计指南 — Material Design 3

## 1. Material You 与主题 [关键]

### 1.1 动态配色

启用根据用户壁纸生成的动态配色。动态配色是 Android 12+ 上的默认方案，应作为主要的主题策略。

```kotlin
// Compose: Dynamic color theme
@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> darkColorScheme()
        else -> lightColorScheme()
    }
    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        content = content
    )
}
```

```xml
<!-- XML: Dynamic color in themes.xml -->
<style name="Theme.App" parent="Theme.Material3.DayNight.NoActionBar">
    <item name="dynamicColorThemeOverlay">@style/ThemeOverlay.Material3.DynamicColors.DayNight</item>
</style>
```

**规则：**
- R1.1：始终为 Android 12 以下的设备提供备用静态配色方案。
- R1.2：绝不要在组件中硬编码颜色十六进制值。始终引用主题中的颜色角色。
- R1.3：至少使用 3 张不同的壁纸进行测试，以验证动态配色的协调性。

### 1.2 颜色角色

Material 3 定义了一套结构化的颜色角色。应根据语义而非美观需求使用它们。

| 角色 | 用途 | 对应前景色角色 |
|------|-------|---------|
| `primary` | 关键操作、激活状态、FAB | `onPrimary` |
| `primaryContainer` | 不太突出的主要元素 | `onPrimaryContainer` |
| `secondary` | 辅助 UI、筛选条状标签 | `onSecondary` |
| `secondaryContainer` | 导航栏激活指示器 | `onSecondaryContainer` |
| `tertiary` | 强调、对比、互补 | `onTertiary` |
| `tertiaryContainer` | 输入字段、不太突出的强调元素 | `onTertiaryContainer` |
| `surface` | 背景、卡片、工作表 | `onSurface` |
| `surfaceVariant` | 装饰元素、分隔线 | `onSurfaceVariant` |
| `error` | 错误状态、破坏性操作 | `onError` |
| `errorContainer` | 错误背景 | `onErrorContainer` |
| `outline` | 边框、分隔线 | — |
| `outlineVariant` | 弱化边框 | — |
| `inverseSurface` | Snackbar 背景 | `inverseOnSurface` |

```kotlin
// Correct: semantic color roles
Text(
    text = "Error message",
    color = MaterialTheme.colorScheme.error
)
Surface(color = MaterialTheme.colorScheme.errorContainer) {
    Text(text = "Error detail", color = MaterialTheme.colorScheme.onErrorContainer)
}

// WRONG: hardcoded colors
Text(text = "Error", color = Color(0xFFB00020)) // Anti-pattern
```

**规则：**
- R1.4：每个前景元素都必须使用与其背景匹配的 `on` 颜色角色（例如，在 `primary` 背景上使用 `onPrimary` 文本）。
- R1.5：使用 `surface` 及其变体作为背景。绝不要将 `primary` 或 `secondary` 用于大面积背景。
- R1.6：仅将 `tertiary` 少量用于强调和互补对比。

### 1.3 浅色和深色主题

同时支持浅色和深色主题。默认遵循系统设置。

```kotlin
// Compose: Detect system theme
val darkTheme = isSystemInDarkTheme()
```

**规则：**
- R1.7：始终同时支持浅色和深色主题。绝不能发布仅支持浅色主题的应用。
- R1.8：深色主题表面应使用基于海拔高度的色调映射，而不是纯黑色（#000000）。使用会自动处理这一点的 `surface` 颜色角色。
- R1.9：在应用设置中提供手动主题覆盖选项（系统 / 浅色 / 深色）。

### 1.4 自定义颜色种子

当品牌设计需要自定义颜色时，提供一个种子颜色，并使用 Material Theme Builder 生成色调调色板。

```kotlin
// Custom color scheme with brand seed
private val BrandLightColorScheme = lightColorScheme(
    primary = Color(0xFF1B6D2F),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFA4F6A8),
    onPrimaryContainer = Color(0xFF002107),
    // ... generate full palette from seed
)
```

**规则：**
- R1.10：使用 Material Theme Builder 根据种子颜色生成色调调色板。绝不要手动选择单个色调。
- R1.11：使用自定义颜色时，仍应默认支持动态颜色，并将自定义颜色用作回退方案。

---

## 2. 导航 [关键]

### 2.1 导航栏（底部）

适用于手机上包含 3-5 个顶级目的地的主要导航模式。

```kotlin
// Compose: Navigation Bar
NavigationBar {
    items.forEachIndexed { index, item ->
        NavigationBarItem(
            icon = {
                Icon(
                    imageVector = if (selectedItem == index) item.filledIcon else item.outlinedIcon,
                    contentDescription = item.label
                )
            },
            label = { Text(item.label) },
            selected = selectedItem == index,
            onClick = { selectedItem = index }
        )
    }
}
```

**规则：**
- R2.1：在紧凑型屏幕上，当有 3-5 个顶级目的地时使用导航栏。少于 3 个或多于 5 个时绝不要使用。
- R2.2：始终在导航栏项目上显示标签。不允许使用仅含图标的导航栏。
- R2.3：选中状态使用实心图标，未选中状态使用轮廓图标。
- R2.4：活动指示器使用 `secondaryContainer` 颜色。不要覆盖此设置。

### 2.2 导航轨道

用于中等和扩展型屏幕（平板电脑、可折叠设备、桌面设备）。

```kotlin
// Compose: Navigation Rail for larger screens
NavigationRail(
    header = {
        FloatingActionButton(
            onClick = { /* primary action */ },
            containerColor = MaterialTheme.colorScheme.tertiaryContainer
        ) {
            Icon(Icons.Default.Add, contentDescription = "Create")
        }
    }
) {
    items.forEachIndexed { index, item ->
        NavigationRailItem(
            icon = { Icon(item.icon, contentDescription = item.label) },
            label = { Text(item.label) },
            selected = selectedItem == index,
            onClick = { selectedItem = index }
        )
    }
}
```

**规则：**
- R2.5：在中等（600-839dp）和扩展型（840dp+）窗口尺寸上使用导航轨道。在紧凑型窗口上与导航栏配套使用。
- R2.6：可以选择在导航轨道的页眉中加入用于主要操作的 FAB。
- R2.7：导航轨道上的标签是可选的，但为了清晰起见，建议使用。

### 2.3 导航抽屉

适用于 5 个以上的目的地或复杂的导航层级，通常用于展开屏幕。

```kotlin
// Compose: Permanent Navigation Drawer for large screens
PermanentNavigationDrawer(
    drawerContent = {
        PermanentDrawerSheet {
            Text("App Name", modifier = Modifier.padding(16.dp),
                 style = MaterialTheme.typography.titleMedium)
            HorizontalDivider()
            items.forEach { item ->
                NavigationDrawerItem(
                    label = { Text(item.label) },
                    selected = item == selectedItem,
                    onClick = { selectedItem = item },
                    icon = { Icon(item.icon, contentDescription = null) }
                )
            }
        }
    }
) {
    Scaffold { /* page content */ }
}
```

**规则：**
- R2.8：在紧凑屏幕上使用模态抽屉，在展开屏幕上使用永久抽屉。
- R2.9：使用分隔线和分区标题将抽屉项目分组到不同分区中。

### 2.4 预测性返回手势

Android 13+ 支持带动画预览的预测性返回。

```kotlin
// Compose: Predictive back with BackHandler (androidx.activity.compose)
BackHandler(enabled = true) {
    // Called when back is confirmed; navigate back in your nav controller
    navController.popBackStack()
}
```

```kotlin
// Compose: Predictive back progress animation using predictiveBackHandler modifier
// (androidx.activity:activity-compose 1.8+)
Modifier.predictiveBackHandler(enabled = true) { progress ->
    // progress is a Flow<BackEventCompat> with x, y, swipeEdge, progress (0.0–1.0)
    progress.collect { backEvent ->
        animationState = backEvent.progress
    }
}
```

```xml
<!-- AndroidManifest.xml: opt in to predictive back -->
<application android:enableOnBackInvokedCallback="true">
```

**规则：**
- R2.10：在清单中选择启用预测性返回。在 **Compose** 应用中，使用 `BackHandler`（来自 `androidx.activity.compose`）拦截返回事件。在**基于 View** 的应用中，实现 `OnBackInvokedCallback`（API 33+）或 `OnBackPressedCallback`（AndroidX），而不是重写 `onBackPressed()`。
- R2.11：系统返回手势在导航栈中向后导航。向上按钮（工具栏箭头）在应用层级结构中向上导航。两者的行为可能不同。
- R2.12：除非存在尚未保存的用户输入，否则绝不要拦截系统返回操作来显示“确定吗？”对话框。
- R2.13：不要抑制系统提供的返回预览动画。如果实现了自定义进入/退出过渡，请使用 `BackEventCompat.progress`（0.0–1.0）对其进行插值，并遵循 `BackEventCompat.swipeEdge`（`EDGE_LEFT`/`EDGE_RIGHT`），使正在退出的屏幕缩小并向发起手势的一侧移动，以匹配系统动画。
- R2.14：优先采用识别而非回忆。为目的地保留标签、让选中状态清晰可见，并保留返回栈上下文，使用户不必在每次导航后重新推断自己所在的位置。

```kotlin
// Compose: drive a custom animation from predictive back progress
Modifier.predictiveBackHandler(enabled = true) { progress ->
    progress.collect { backEvent ->
        // backEvent.progress: 0.0 (gesture start) → 1.0 (committed)
        // backEvent.swipeEdge: BackEventCompat.EDGE_LEFT or EDGE_RIGHT
        exitScale = 1f - (backEvent.progress * 0.1f)
        exitOffsetX = if (backEvent.swipeEdge == BackEventCompat.EDGE_LEFT) -backEvent.progress * 32.dp.toPx() else backEvent.progress * 32.dp.toPx()
    }
}
```

### 2.5 导航组件选择

| 屏幕尺寸 | 3-5 个目的地 | 5 个以上目的地 |
|-------------|-------------------|-----------------|
| 紧凑型（< 600dp） | 导航栏 | 模态抽屉式导航 + 导航栏 |
| 中等型（600-839dp） | 导航轨道 | 模态抽屉式导航 + 导航轨道 |
| 展开型（840dp+） | 导航轨道 | 常驻抽屉式导航 |

---

## 3. 布局与响应式设计 [高]

### 3.1 窗口尺寸类别

自适应布局应使用窗口尺寸类别，而不是原始像素断点。

```kotlin
// Compose: Window size classes
val windowSizeClass = calculateWindowSizeClass(this)
when (windowSizeClass.widthSizeClass) {
    WindowWidthSizeClass.Compact -> CompactLayout()
    WindowWidthSizeClass.Medium -> MediumLayout()
    WindowWidthSizeClass.Expanded -> ExpandedLayout()
}
```

| 类别 | 宽度 | 典型设备 | 列数 |
|-------|-------|----------------|---------|
| 紧凑型 | < 600dp | 手机竖屏 | 4 |
| 中等型 | 600-839dp | 平板竖屏、可折叠设备 | 8 |
| 展开型 | 840dp+ | 平板横屏、桌面设备 | 12 |

**规则：**
- R3.1：响应式布局决策始终使用 `material3-window-size-class` 中的 `WindowSizeClass`。
- R3.2：切勿使用固定像素断点。设备类别是动态变化的。
- R3.3：支持全部三种宽度尺寸类别。至少应支持紧凑型和展开型。

### 3.2 Material 网格

应用规范的 Material 网格边距和列间距。

| 尺寸类别 | 边距 | 列间距 | 列数 |
|------------|---------|---------|---------|
| 紧凑型 | 16dp | 8dp | 4 |
| 中等型 | 24dp | 16dp | 8 |
| 展开型 | 24dp | 24dp | 12 |

**规则：**
- R3.4：在展开型屏幕上，内容不应横跨整个宽度。使用约 840dp 的最大内容宽度或列表-详情布局。
- R3.5：应用与网格规范一致的水平边距。

### 3.3 边到边显示

Android 15+ 强制实施边到边显示。所有应用都应在系统栏后方进行绘制。

```kotlin
// Compose: Edge-to-edge setup
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            Scaffold(
                modifier = Modifier.fillMaxSize(),
                // Scaffold handles insets for top/bottom bars automatically
            ) { innerPadding ->
                Content(modifier = Modifier.padding(innerPadding))
            }
        }
    }
}
```

**规则：**
- R3.6：在 `setContent` 之前调用 `enableEdgeToEdge()`。在状态栏和导航栏后方进行绘制。
- R3.7：使用 `WindowInsets` 添加内边距，使内容避开系统栏。`Scaffold` 会自动为顶部栏和底部栏内容处理此问题。
- R3.8：可滚动内容应在透明系统栏后方滚动，并在列表顶部和底部应用适当的插入区域内边距。

### 3.4 可折叠设备支持

```kotlin
// Compose: Detect fold posture
val foldingFeatures = WindowInfoTracker.getOrCreate(context)
    .windowLayoutInfo(context)
    .collectAsState(initial = WindowLayoutInfo(emptyList()))
```

**规则：**
- R3.9：检测铰链/折叠位置，避免将关键内容放置在折叠区域两侧。
- R3.10：使用 Material3 自适应库中的 `ListDetailPaneScaffold` 或 `SupportingPaneScaffold` 实现可感知折叠屏的布局。

---

## 4. 排版 [高]

### 4.1 Material 字体层级

| 角色 | 默认字号 | 默认字重 | 用途 |
|------|-------------|----------------|-------|
| displayLarge | 57sp | 400 | 主视觉文本、引导流程 |
| displayMedium | 45sp | 400 | 大型功能文本 |
| displaySmall | 36sp | 400 | 醒目的展示文本 |
| headlineLarge | 32sp | 400 | 屏幕标题 |
| headlineMedium | 28sp | 400 | 分区标题 |
| headlineSmall | 24sp | 400 | 卡片标题 |
| titleLarge | 22sp | 400 | 顶部应用栏标题 |
| titleMedium | 16sp | 500 | 标签页、导航 |
| titleSmall | 14sp | 500 | 副标题 |
| bodyLarge | 16sp | 400 | 主要正文文本 |
| bodyMedium | 14sp | 400 | 次要正文文本 |
| bodySmall | 12sp | 400 | 说明文字 |
| labelLarge | 14sp | 500 | 按钮、醒目标签 |
| labelMedium | 12sp | 500 | 提示条、较小标签 |
| labelSmall | 11sp | 500 | 时间戳、注释 |

```kotlin
// Compose: Custom typography
val AppTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = FontFamily(Font(R.font.brand_regular)),
        fontWeight = FontWeight.Normal,
        fontSize = 57.sp,
        lineHeight = 64.sp,
        letterSpacing = (-0.25).sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily(Font(R.font.brand_regular)),
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    )
    // ... define all 15 roles
)
```

**规则：**
- R4.1：文本字号始终使用 `sp` 单位，以支持用户的字体缩放偏好。
- R4.2：正文内容的文本不得小于 12sp。标签最小可使用 11sp。
- R4.3：从 `MaterialTheme.typography` 引用排版角色，不要使用硬编码字号。
- R4.4：支持动态字体缩放。在 200% 字体缩放比例下进行测试。确保文本不会被裁剪或重叠。
- R4.5：为确保可读性，行高应约为字号的 1.2-1.5 倍。

---

## 5. 组件 [高]

### 5.1 浮动操作按钮（FAB）

FAB 表示屏幕上唯一最重要的操作。

```kotlin
// Compose: FAB variants
// Standard FAB
FloatingActionButton(onClick = { /* action */ }) {
    Icon(Icons.Default.Add, contentDescription = "Create new item")
}

// Extended FAB (with label - preferred for clarity)
ExtendedFloatingActionButton(
    onClick = { /* action */ },
    icon = { Icon(Icons.Default.Edit, contentDescription = null) },
    text = { Text("Compose") }
)

// Large FAB
LargeFloatingActionButton(onClick = { /* action */ }) {
    Icon(Icons.Default.Add, contentDescription = "Create", modifier = Modifier.size(36.dp))
}
```

**规则：**
- R5.1：每个屏幕最多使用一个 FAB。它代表主要操作。
- R5.2：将 FAB 放置在屏幕的底部末端。对于包含导航栏的屏幕，FAB 悬浮在导航栏上方。
- R5.3：FAB 默认应使用 `primaryContainer` 颜色。对于次级屏幕，使用 `tertiaryContainer`。
- R5.4：为了清晰起见，优先使用带标签的 `ExtendedFloatingActionButton`。如有需要，可在滚动时折叠为仅图标形式。

### 5.2 顶部应用栏

```kotlin
// Compose: Top app bar variants
// Small (default)
TopAppBar(
    title = { Text("Page Title") },
    navigationIcon = {
        IconButton(onClick = { /* navigate up */ }) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
        }
    },
    actions = {
        IconButton(onClick = { /* search */ }) {
            Icon(Icons.Default.Search, contentDescription = "Search")
        }
    }
)

// Medium — expands title area
MediumTopAppBar(
    title = { Text("Section Title") },
    scrollBehavior = TopAppBarDefaults.enterAlwaysScrollBehavior()
)

// Large — for prominent titles
LargeTopAppBar(
    title = { Text("Screen Title") },
    scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()
)
```

**规则：**
- R5.5：大多数屏幕使用 `TopAppBar`（小型）。对于醒目的分区或屏幕标题，使用 `MediumTopAppBar` 或 `LargeTopAppBar`。
- R5.6：将滚动行为连接到应用栏，使其随内容滚动而折叠或展开。
- R5.7：将操作图标限制在 2-3 个。将其他操作收纳到更多菜单中。

### 5.3 底部工作表

```kotlin
// Compose: Modal bottom sheet
ModalBottomSheet(
    onDismissRequest = { showSheet = false },
    sheetState = rememberModalBottomSheetState()
) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Sheet Title", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(16.dp))
        // Sheet content
    }
}
```

**规则：**
- R5.8：对于非关键的补充内容，使用模态底部工作表。对于常驻内容，使用标准底部工作表。
- R5.9：底部工作表必须具有可见的拖动手柄，以便用户发现其可拖动。
- R5.10：如果工作表内容可能超出可见区域，则必须能够滚动。

### 5.4 对话框

```kotlin
// Compose: Alert dialog
AlertDialog(
    onDismissRequest = { showDialog = false },
    title = { Text("Discard draft?") },
    text = { Text("Your unsaved changes will be lost.") },
    confirmButton = {
        TextButton(onClick = { /* confirm */ }) { Text("Discard") }
    },
    dismissButton = {
        TextButton(onClick = { showDialog = false }) { Text("Cancel") }
    }
)
```

**规则：**
- R5.11：对话框会打断用户。仅将其用于需要立即关注的关键决策。
- R5.12：确认按钮使用文本按钮，而不是填充按钮。取消按钮始终位于左侧。
- R5.13：对话框标题应为简洁的问题或陈述。正文文本用于提供上下文。

### 5.5 Snackbar

```kotlin
// Compose: Snackbar with action
val snackbarHostState = remember { SnackbarHostState() }
Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) {
    // trigger snackbar
    LaunchedEffect(key) {
        val result = snackbarHostState.showSnackbar(
            message = "Item archived",
            actionLabel = "Undo",
            duration = SnackbarDuration.Short
        )
        if (result == SnackbarResult.ActionPerformed) { /* undo */ }
    }
}
```

**规则：**
- R5.14：使用 snackbar 提供简短的非关键反馈。它们会自动消失，且不应包含关键信息。
- R5.15：Snackbar 显示在屏幕底部，位于 Navigation Bar 上方、FAB 下方。
- R5.16：当操作可撤销时，应包含一个操作（例如“撤销”）。最多只能提供一个操作。

### 5.6 Chip

```kotlin
// Filter Chip
FilterChip(
    selected = isSelected,
    onClick = { isSelected = !isSelected },
    label = { Text("Filter") },
    leadingIcon = if (isSelected) {
        { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) }
    } else null
)

// Assist Chip
AssistChip(
    onClick = { /* action */ },
    label = { Text("Add to calendar") },
    leadingIcon = { Icon(Icons.Default.CalendarToday, contentDescription = null) }
)
```

**规则：**
- R5.17：使用 `FilterChip` 切换筛选条件，使用 `AssistChip` 展示智能建议，使用 `InputChip` 展示用户输入的内容（标签），使用 `SuggestionChip` 展示动态生成的建议。
- R5.18：Chip 应排列在可水平滚动的行或流式布局中，而不应垂直堆叠。
- R5.19：立即呈现等待状态。如果某项操作无法立刻完成，应通过内联状态变化、进度指示或其他可见响应予以确认，而不是让 UI 保持静止。

### 5.7 组件选择指南

| 需求 | 组件 |
|------|-----------|
| 屏幕主要操作 | FAB |
| 简短反馈 | Snackbar |
| 关键决策 | Dialog |
| 补充内容 | Bottom Sheet |
| 切换筛选条件 | Filter Chip |
| 用户输入的标签 | Input Chip |
| 智能建议 | Assist Chip |
| 内容分组 | Card |
| 垂直项目列表 | 使用 LazyColumn 和 ListItem |
| 分段选项（2-5 个） | SegmentedButton |
| 二元切换 | Switch |
| 从列表中选择 | Radio buttons 或 exposed dropdown menu |

---

## 6. 无障碍功能 [关键]

### 6.1 TalkBack 与内容描述

```kotlin
// Compose: Accessible components
Icon(
    Icons.Default.Favorite,
    contentDescription = "Add to favorites" // Descriptive, not "heart icon"
)

// Decorative elements
Icon(
    Icons.Default.Star,
    contentDescription = null // null for purely decorative
)

// Merge semantics for compound elements
Row(modifier = Modifier.semantics(mergeDescendants = true) {}) {
    Icon(Icons.Default.Event, contentDescription = null)
    Text("March 15, 2026")
}

// Custom actions
Box(modifier = Modifier.semantics {
    customActions = listOf(
        CustomAccessibilityAction("Archive") { /* archive */ true },
        CustomAccessibilityAction("Delete") { /* delete */ true }
    )
})
```

**规则：**
- R6.1：每个交互元素都必须具有 `contentDescription`（如果仅用于装饰，则设为 `null`）。
- R6.2：内容描述必须说明操作或含义，而不是视觉外观。应使用“添加到收藏夹”，而不是“心形图标”。
- R6.3：使用 `mergeDescendants = true` 将相关元素组合成单个 TalkBack 焦点单元（例如，包含图标、文本和副标题的列表项）。
- R6.4：为滑动关闭或长按操作提供 `customActions`，以便 TalkBack 用户能够访问这些操作。

### 6.2 触控目标

```kotlin
// Compose: Ensure minimum touch target
IconButton(onClick = { /* action */ }) {
    // IconButton already provides 48dp minimum touch target
    Icon(Icons.Default.Close, contentDescription = "Close")
}

// Manual minimum touch target
Box(
    modifier = Modifier
        .sizeIn(minWidth = 48.dp, minHeight = 48.dp)
        .clickable { /* action */ },
    contentAlignment = Alignment.Center
) {
    Icon(Icons.Default.Info, contentDescription = "Info", modifier = Modifier.size(24.dp))
}
```

**规则：**
- R6.5：所有交互元素的最小触控目标必须为 48x48dp。Material 3 组件默认会满足此要求。
- R6.6：不要为了节省空间而缩小触控目标。如果视觉元素较小，请使用内边距增大可触控区域。

### 6.3 颜色对比度与视觉呈现

**规则：**
- R6.7：普通文本与其背景之间的对比度至少必须为 4.5:1，大号文本（18sp+ 或 14sp+ 粗体）至少必须为 3:1。
- R6.8：绝不能将颜色作为传达信息的唯一方式。应同时搭配图标、文本或图案。
- R6.9：支持粗体文本和高对比度无障碍设置。使用 `Configuration.fontWeightAdjustment`（API 31+）检测用户的粗体文本偏好，并相应调整自定义字体粗细。使用 `AccessibilityManager.isHighTextContrastEnabled()` 检测高对比度模式，并替换为对比度更高的颜色值。Material 3 组件会自动处理这两项设置；自定义文本渲染和颜色使用则必须显式选择启用。

```kotlin
// Detect bold text preference (API 31+)
val fontWeightAdjustment = resources.configuration.fontWeightAdjustment
val isBoldText = fontWeightAdjustment >= 700 // equivalent to FontWeight.Bold.weight

// Detect high contrast mode
val am = getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
val isHighContrast = am.isHighTextContrastEnabled

// Compose: use MaterialTheme.typography which respects fontWeightAdjustment automatically
Text(
    text = "Label",
    style = MaterialTheme.typography.bodyLarge // Adapts to fontWeightAdjustment
)

// For custom colors: provide high-contrast alternative
val labelColor = if (isHighContrast) {
    MaterialTheme.colorScheme.onSurface  // Strong contrast
} else {
    MaterialTheme.colorScheme.onSurfaceVariant  // Normal contrast
}
```

### 6.4 焦点与遍历顺序

```kotlin
// Compose: Custom focus order
Column {
    var focusRequester = remember { FocusRequester() }
    TextField(
        modifier = Modifier.focusRequester(focusRequester),
        value = text,
        onValueChange = { text = it }
    )
    LaunchedEffect(Unit) {
        focusRequester.requestFocus() // Auto-focus on screen load
    }
}
```

**规则：**
- R6.10：焦点顺序必须遵循符合逻辑的阅读顺序（从上到下、从起始端到末尾端）。除非默认顺序不正确，否则应避免使用自定义 `focusOrder`。
- R6.11：导航或关闭对话框后，将焦点移至最符合逻辑的目标元素。
- R6.12：所有界面都必须能够使用 TalkBack、Switch Access 和外接键盘进行完整操作。

### 6.5 自定义 Canvas 视图

在 Canvas 上绘制内容（图表、自定义选择器、绘图界面）的自定义 `View` 子类默认对 TalkBack 不可见，因为它们没有子视图。使用 `androidx.customview.widget` 中的 `ExploreByTouchHelper` 定义虚拟无障碍树。

- R6.13：自定义 Canvas 绘制的视图必须使用 `ExploreByTouchHelper` 向 TalkBack 公开虚拟无障碍树。重写 `getVirtualViewAt()`，将触摸坐标映射到虚拟视图 ID；并重写 `onPopulateNodeForVirtualView()`，为每个虚拟节点提供文本、边界和操作。

```kotlin
import androidx.customview.widget.ExploreByTouchHelper

class PieChartView(context: Context) : View(context) {

    private val helper = object : ExploreByTouchHelper(this) {
        override fun getVirtualViewAt(x: Float, y: Float): Int {
            // Return virtual view ID for the slice at (x, y), or INVALID_ID
            return sliceIndexAt(x, y)
        }

        override fun getVisibleVirtualViews(virtualViewIds: MutableList<Int>) {
            slices.indices.forEach { virtualViewIds.add(it) }
        }

        override fun onPopulateNodeForVirtualView(
            virtualViewId: Int,
            node: AccessibilityNodeInfoCompat
        ) {
            val slice = slices[virtualViewId]
            node.text = "${slice.label}: ${slice.percentage}%"
            node.setBoundsInParent(slice.bounds)
            node.addAction(AccessibilityNodeInfoCompat.ACTION_CLICK)
        }

        override fun onPerformActionForVirtualView(
            virtualViewId: Int, action: Int, arguments: Bundle?
        ): Boolean {
            if (action == AccessibilityNodeInfoCompat.ACTION_CLICK) {
                onSliceSelected(virtualViewId)
                return true
            }
            return false
        }
    }

    init {
        ViewCompat.setAccessibilityDelegate(this, helper)
    }

    override fun dispatchHoverEvent(event: MotionEvent) =
        helper.dispatchHoverEvent(event) || super.dispatchHoverEvent(event)
}
```

---

## 7. 手势与输入 [中等]

### 7.1 系统手势

**规则：**
- R7.1：切勿将交互元素放置在系统手势边衬区内（底部 20dp、左侧/右侧边缘 24dp），因为它们会与系统导航手势发生冲突。
- R7.2：使用 `WindowInsets.systemGestures` 检测并避开手势冲突区域。

### 7.2 常见手势模式

```kotlin
// Compose: Pull to refresh
PullToRefreshBox(
    isRefreshing = isRefreshing,
    onRefresh = { viewModel.refresh() }
) {
    LazyColumn { /* content */ }
}

// Compose: Swipe to dismiss
SwipeToDismissBox(
    state = rememberSwipeToDismissBoxState(),
    backgroundContent = {
        Box(
            modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.error),
            contentAlignment = Alignment.CenterEnd
        ) {
            Icon(Icons.Default.Delete, contentDescription = "Delete",
                 tint = MaterialTheme.colorScheme.onError)
        }
    }
) {
    ListItem(headlineContent = { Text("Swipeable item") })
}
```

**规则：**
- R7.3：所有滑动关闭操作都必须支持撤销（显示带有撤销操作的 snackbar），或要求用户确认。
- R7.4：为所有基于手势的操作提供非手势替代触发方式（以满足无障碍需求）。
- R7.5：为所有可点击元素应用 Material 涟漪效果。Compose 的 `clickable` 修饰符默认包含涟漪效果。

### 7.3 长按

**规则：**
- R7.6：使用长按打开上下文菜单和进入多选模式。绝不能将其作为访问某项功能的唯一方式。
- R7.7：通过 `HapticFeedbackType.LongPress` 为长按操作提供触觉反馈。

---

## 8. 通知 [中]

### 8.1 通知渠道

```kotlin
// Create notification channel (required for Android 8+)
val channel = NotificationChannel(
    "messages",
    "Messages",
    NotificationManager.IMPORTANCE_HIGH
).apply {
    description = "New message notifications"
    enableLights(true)
    lightColor = Color.BLUE
}
notificationManager.createNotificationChannel(channel)
```

| 重要性 | 行为 | 适用场景 |
|-----------|----------|---------|
| IMPORTANCE_HIGH | 声音 + 浮动通知 | 消息、通话 |
| IMPORTANCE_DEFAULT | 声音 | 社交动态、电子邮件 |
| IMPORTANCE_LOW | 无声音 | 推荐内容 |
| IMPORTANCE_MIN | 静默，不在状态栏显示 | 天气、持续进行的操作 |

**规则：**
- R8.1：为每种不同的通知类型创建单独的通知渠道。用户可以分别配置每个渠道。
- R8.2：谨慎选择重要性级别。过度使用 `IMPORTANCE_HIGH` 会导致用户完全禁用通知。
- R8.3：所有通知都必须具有点击操作（PendingIntent），用于导航至相关内容。
- R8.4：为通知图标添加 `contentDescription`，以满足无障碍需求。

### 8.2 通知设计

**规则：**
- R8.5：对话使用 `MessagingStyle`。包含发送者姓名和头像。
- R8.6：为消息通知添加直接回复操作。
- R8.7：为消息通知提供“标记为已读”操作。
- R8.8：对富媒体内容使用可展开通知（`BigTextStyle`、`BigPictureStyle`、`InboxStyle`）。
- R8.9：前台服务通知必须准确描述正在进行的操作，并在适当情况下提供停止操作。

---

## 9. 权限与隐私 [高]

### 9.1 运行时权限

```kotlin
// Compose: Permission request
val permissionState = rememberPermissionState(Manifest.permission.CAMERA)

if (permissionState.status.isGranted) {
    CameraPreview()
} else {
    Column {
        Text("Camera access is needed to scan QR codes.")
        Button(onClick = { permissionState.launchPermissionRequest() }) {
            Text("Grant Camera Access")
        }
    }
}
```

**规则：**
- R9.1：在需要权限时结合具体上下文请求权限，而不是在应用启动时请求。
- R9.2：在请求权限之前，始终说明需要该权限的原因（理由说明界面）。
- R9.3：妥善处理权限被拒绝的情况。提供降级功能，而不是阻止用户继续使用。
- R9.4：绝不请求未实际使用的权限。Google Play 会拒绝包含不必要权限的应用。

### 9.2 隐私保护 API

```kotlin
// Photo picker: no permission needed
val pickMedia = rememberLauncherForActivityResult(
    ActivityResultContracts.PickVisualMedia()
) { uri ->
    uri?.let { /* handle selected media */ }
}
pickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
```

**规则：**
- R9.5：使用照片选择器（Android 13+），而不是请求 `READ_MEDIA_IMAGES`。无需权限。
- R9.6：除非精确位置对于功能至关重要，否则使用 `ACCESS_COARSE_LOCATION`（大致位置）。
- R9.7：在非录制场景中，优先为相机和麦克风使用单次权限。
- R9.8：当相机或麦克风正在使用时，显示隐私指示器。

---

## 10. 系统集成 [中]

### 10.1 小组件

```kotlin
// Compose Glance API widget
class TaskWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            GlanceTheme {
                Column(
                    modifier = GlanceModifier
                        .fillMaxSize()
                        .background(GlanceTheme.colors.widgetBackground)
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Tasks",
                        style = TextStyle(fontWeight = FontWeight.Bold,
                                         color = GlanceTheme.colors.onSurface)
                    )
                    // Widget content
                }
            }
        }
    }
}
```

**规则：**
- R10.1：为新的小组件使用 Glance API。通过 `GlanceTheme` 支持动态颜色。
- R10.2：小组件必须提供默认配置，并且放置后能够立即使用。
- R10.3：在可行的情况下，提供多种小组件尺寸（小、中、大）。
- R10.4：使用与系统小组件形状一致的圆角（`system_app_widget_background_radius`）。

### 10.2 应用快捷方式

```xml
<!-- shortcuts.xml -->
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
    <shortcut
        android:shortcutId="compose"
        android:enabled="true"
        android:shortcutShortLabel="@string/compose_short"
        android:shortcutLongLabel="@string/compose_long"
        android:icon="@drawable/ic_shortcut_compose">
        <intent
            android:action="android.intent.action.VIEW"
            android:targetPackage="com.example.app"
            android:targetClass="com.example.app.ComposeActivity" />
    </shortcut>
</shortcuts>
```

**规则：**
- R10.5：为常用操作提供 2–4 个静态快捷方式。为最近使用的内容支持动态快捷方式。
- R10.6：快捷方式图标应是在圆形背景上的简单、易识别的轮廓。
- R10.7：通过长按应用图标以及在“设置 > 应用”的快捷方式列表中测试快捷方式。

### 10.3 深层链接与分享

**规则：**
- R10.8：为所有公开内容 URL 支持 Android App Links（经过验证的深层链接）。
- R10.9：使用 `ShareCompat` 或 `Intent.createChooser` 实现分享面板。提供包含标题、描述和缩略图的丰富预览。
- R10.10：通过适当的内容类型过滤处理传入的分享 Intent。

---

## 设计评估检查清单

使用此检查清单评估 Android UI 实现：

### 主题与颜色
- [ ] 已启用动态颜色，并提供静态回退方案
- [ ] 所有颜色均引用 Material 主题角色（无硬编码十六进制值）
- [ ] 同时支持浅色和深色主题
- [ ] 前景色与其背景颜色角色相匹配
- [ ] 使用 Material Theme Builder 根据种子颜色生成自定义颜色

### 导航
- [ ] 根据屏幕尺寸和目标页面数量选择正确的导航组件
- [ ] 导航栏标签始终可见
- [ ] 已选择启用并正确处理预测性返回手势
- [ ] Up 与 Back 的行为正确

### 布局
- [ ] 支持全部三种窗口尺寸类别
- [ ] 采用边到边布局并正确处理内边距
- [ ] 在大屏幕上，内容不会横跨整个宽度
- [ ] 避开可折叠设备的铰链区域

### 排版
- [ ] 所有文本均使用 sp 单位
- [ ] 所有文本均引用 MaterialTheme.typography 角色
- [ ] 已在 200% 字体缩放比例下测试，且无内容裁切
- [ ] 正文最小为 12sp，标签最小为 11sp

### 组件
- [ ] 每个屏幕最多使用一个 FAB
- [ ] 顶部应用栏已与滚动行为关联
- [ ] Snackbar 仅用于非关键反馈
- [ ] 对话框仅用于关键中断

### 无障碍
- [ ] 所有交互元素均具有 contentDescription
- [ ] 所有触控目标均 >= 48dp
- [ ] 文本颜色对比度 >= 4.5:1
- [ ] 不单独依靠颜色传达信息
- [ ] 已测试完整的 TalkBack 遍历
- [ ] Switch Access 和键盘导航可正常使用

### 手势
- [ ] 系统手势区域内无交互元素
- [ ] 所有手势操作均提供非手势替代方式
- [ ] 滑动关闭操作可以撤销

### 通知
- [ ] 每种通知类型使用单独的渠道
- [ ] 使用适当的重要性级别
- [ ] 点击操作会导航到相关内容

### 权限
- [ ] 在相关情境中请求权限，而非在启动时请求
- [ ] 请求权限前显示理由说明
- [ ] 权限被拒绝时可优雅降级
- [ ] 使用 Photo Picker，而非媒体权限

### 系统集成
- [ ] 微件使用支持动态颜色的 Glance API
- [ ] 为常用操作提供应用快捷方式
- [ ] 为公开内容处理深层链接

---

## 反模式

| 反模式 | 错误原因 | 正确做法 |
|-------------|----------------|------------------|
| 硬编码颜色十六进制值 | 会破坏动态颜色和深色主题 | 使用 `MaterialTheme.colorScheme` 角色 |
| 使用 `dp` 作为文本大小单位 | 会忽略用户的字体缩放设置 | 使用 `sp` 单位 |
| 自定义底部导航栏 | 与平台不一致 | 使用 Material `NavigationBar` |
| 导航栏不显示标签 | 违反 Material 指南 | 始终显示标签 |
| 使用对话框显示非关键信息 | 会不必要地打断用户 | 使用 Snackbar 或 Bottom Sheet |
| 将 FAB 用于次要操作 | 会削弱主要操作的突出程度 | 仅为主要操作使用一个 FAB |
| 重写 `onBackPressed()` | 已弃用；会破坏预测性返回 | 使用 `BackHandler`（Compose）或 `OnBackInvokedCallback`（基于 View）以支持预测性返回 |
| 触控目标 < 48dp | 违反无障碍要求 | 确保最小尺寸为 48x48dp |
| 启动时请求权限 | 用户会因缺乏上下文而拒绝 | 在相关情境中请求并提供理由说明 |
| 深色主题使用纯黑色 (#000000) | 会造成视觉疲劳；不符合 Material 3 | 使用 Material 表面颜色角色 |
| 仅使用图标的导航栏 | 用户无法识别目标页面 | 始终包含文本标签 |
| 平板电脑上的内容横跨全宽 | 浪费空间；可读性差 | 使用最大宽度或列表-详情布局 |
| 使用 `READ_EXTERNAL_STORAGE` 访问照片 | 自 Android 13 起已无必要 | 使用 Photo Picker API |
| 权限被拒绝时阻塞 UI | 会惩罚用户 | 优雅降级 |
| 手动选择调色板 | 色调关系不一致 | 使用 Material Theme Builder |