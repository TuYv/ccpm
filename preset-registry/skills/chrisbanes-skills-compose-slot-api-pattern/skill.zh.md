---
name: compose-slot-api-pattern
description: Use when designing or reviewing a reusable Jetpack Compose component whose visual regions vary by caller, or when primitive content parameters and boolean shape flags are accumulating.
---
# Compose：插槽 API 模式

## 核心原则

可复用的 Compose 组件用于描述布局结构。调用方通过插槽提供可变的视觉内容。

## API 审查流程

1. 确认组件是可复用的。对于真正只使用一次的 composable，不要引入插槽所带来的繁琐设计。
2. 标记哪些区域会因调用方而异：标题、辅助文本、前置视觉元素、后置视觉元素、操作项、主体。
3. 将由调用方控制的基础类型内容和形状标志替换为插槽。
4. 仅当插槽在某个布局内部发出，并且调用方应使用该布局的作用域 API 时，才添加接收者作用域。
5. 将不存在的可选区域设为可空（`null`），以便组件省略对应的容器和间距。
6. 将重复使用的默认内容或设计令牌放入 `XxxDefaults`。
7. 将此模式与 `compose-modifier-and-layout-style` 中的 `modifier` 规则配合使用。

## 1. 将基础类型内容替换为 `@Composable` 插槽

当组件要求调用方控制*内容*时，优先使用 `@Composable () -> Unit` 插槽。当插槽在结构上必需时，应保持其不可空且不提供默认值。当插槽是可选的时，应将其设为可空并以 `null` 作为默认值。

```kotlin
// ❌ BAD — primitive parameters; trailing area is the only slot; everything else is locked
@Composable
fun SettingsRow(
    title: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    leadingIcon: ImageVector? = null,
    trailing: (@Composable () -> Unit)? = null,
) { … }
```

```kotlin
// ✅ GOOD — every visual region is a slot; the row describes structure, not content
@Composable
fun SettingsRow(
    headlineContent: @Composable () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    supportingContent: (@Composable () -> Unit)? = null,
    leadingContent: (@Composable () -> Unit)? = null,
    trailingContent: (@Composable () -> Unit)? = null,
) { … }
```

当典型内容只有一行时，调用处仍然很简短：

```kotlin
SettingsRow(
    headlineContent = { Text("Account") },
    leadingContent = { Icon(Icons.Default.Person, contentDescription = null) },
    trailingContent = { SettingsRowDefaults.Chevron() },
    onClick = { … },
)
```

非典型场景也不再需要添加新的组件参数：

```kotlin
SettingsRow(
    headlineContent = {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Inbox")
            Spacer(Modifier.width(8.dp))
            Badge { Text("3") }
        }
    },
    onClick = { … },
)
```

### 插槽命名

- 对于自由形式的 `@Composable () -> Unit` 插槽，使用 `xxxContent`（`headlineContent`、`supportingContent`、`trailingContent`）——与 Material 3 保持一致。
- 当插槽在语义上受到约束，且组件名称足以消除歧义时，使用单数名词（`title`、`icon`、`actions`）（`Scaffold(topBar = { … }, bottomBar = { … }, floatingActionButton = { … })`）。
- 不要同时使用 `content` 和其他 `xxxContent` 插槽——每个组件应选择一种约定。

## 2. 当插槽在布局中发出内容时使用作用域接收者

如果插槽内容将位于 `Row`/`Column`/`Box` 内，并且需要让调用方使用其布局特性（`Modifier.weight`、`BoxScope.matchParentSize`、对齐方式），请将插槽声明为带接收者的 lambda：`@Composable RowScope.() -> Unit`。

```kotlin
// ❌ BAD — actions render inside a Row, but callers can't use RowScope.weight()
@Composable
fun MyTopBar(
    title: @Composable () -> Unit,
    actions: @Composable () -> Unit = {},   // ← caller has no Row scope
)
```

```kotlin
// ✅ GOOD — caller gets RowScope; .weight() and alignment-by works inside
@Composable
fun MyTopBar(
    title: @Composable () -> Unit,
    actions: @Composable RowScope.() -> Unit = {},
)
```

正是这一点使 `TopAppBar(actions = { IconButton(…); IconButton(…) })` 能够正常工作——调用方会隐式地处于 `RowScope` 中。

不要不加思考地为每个插槽都附加作用域接收者。接收者应与插槽实际输出到的父布局相匹配。如果插槽在 `Box` 内渲染，请使用 `BoxScope`。如果在 `Column` 内渲染，请使用 `ColumnScope`。如果父级不是标准布局（或者其作用域 API 对插槽内容都没有用处），则不要使用接收者。

## 3. 可选插槽——可空并以 `null` 为默认值

对于可能不存在的插槽，优先使用 `(@Composable () -> Unit)? = null`，而不是 `@Composable () -> Unit = {}`：

```kotlin
// ❌ BAD — empty default; "no leading content" is the empty lambda
leadingContent: @Composable () -> Unit = {}

// ✅ GOOD — null means "no slot"; the component can omit space/padding when absent
leadingContent: (@Composable () -> Unit)? = null
```

使用可空插槽时，组件可以根据 `leadingContent != null` 进行分支，并在插槽不存在时完全跳过其容器、间距和内边距。使用空 lambda 作为默认值时，布局通常仍会为不存在的内容分配空间。

## 4. 默认值应位于 `XxxDefaults` 中

当你发现自己需要说明“尾部插槽通常应该是一个 V 形箭头”或“传入 `MaterialTheme.colorScheme.surface` 作为默认背景”时，请将这些辅助项集中放在组件旁边的 `XxxDefaults` 对象中：

```kotlin
object SettingsRowDefaults {
    @Composable
    fun Chevron() = Icon(
        imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
        contentDescription = null,
    )

    @Composable
    fun TrailingValue(text: String) = Text(
        text = text,
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}
```

对于常见情况，调用点可以保持声明式风格；对于一次性的特殊情况，插槽仍然保持完全开放：

```kotlin
SettingsRow(
    headlineContent = { Text("Notifications") },
    trailingContent = { SettingsRowDefaults.Chevron() },
    onClick = { … },
)
```

这与 Material 3 的 `ButtonDefaults`、`TopAppBarDefaults` 等模式一致——本身可组合的默认值应放在这里，而不是作为新的组件参数，并在参数中内联展开 `MaterialTheme.x.y` 默认值。

## 快速参考

| 表现 | 诊断 | 修复方式 |
|---|---|---|
| 可复用组件上存在 `title: String, subtitle: String?, leadingIcon: ImageVector?` | 基元内容参数（§1） | 转换为 `xxxContent: (@Composable () -> Unit)?` 插槽 |
| 使用多个布尔标志（`showChevron`、`showSwitch`）选择尾部形态 | 枚举形态（§1） | 使用单个 `trailingContent: (@Composable () -> Unit)?` 插槽 |
| 使用 `mode: Mode.Sealed` 参数列出变体 | 与标志堆积相同（§1） | 将其改为插槽 |
| `Row` 主体内存在 `actions: @Composable () -> Unit = {}` | 缺少作用域接收者（§2） | 使用 `actions: @Composable RowScope.() -> Unit = {}` |
| 可选区域使用 `slot: @Composable () -> Unit = {}` | 空 lambda 默认值（§3） | 使用 `slot: (@Composable () -> Unit)? = null` 并根据它进行分支 |
| 组件参数 `defaultColor: Color = MaterialTheme.colorScheme.surface` | 内联默认值（§4） | 移至 `XxxDefaults.color` 并引用它 |
| 每个调用点都重复常见的尾部内容 | 缺少默认辅助项（§4） | 添加 `XxxDefaults.Chevron()` 等 |

## 不适用的情况

- **仅使用一次的组件。** 如果一个 Composable 只在一个地方使用，并且没有复用计划，那么插槽的灵活性并不会带来收益——而插槽的间接层反而会让代码对唯一的阅读者来说更难理解。使用基本类型参数 + 内联内容即可。（一旦出现第二个调用点，就改用插槽。）
- **所有调用方都必须具有相同外观的设计系统基础组件。** `Heading2(text: String)` 的存在，*正是因为*你希望每个 H2 看起来都一样；将其改为 `headlineContent: @Composable () -> Unit` 会诱使调用方打破这一规则。应继续使用基本类型参数。（反过来说：如果 `Heading2` 有一天需要内联徽章，就改用插槽。）
- **组件有意自行管理的语义参数。** 如果组件负责管理排版、图标、无障碍措辞或产品一致性，那么基本类型参数可能正是你想要的约束。
- **确实受到约束的受限类型参数。** `Switch(checked: Boolean, onCheckedChange: ...)` 不需要将其选中指示器设为插槽。带回调的布尔值不是“内容”。
- **性能关键型快速路径**（在应用代码中很少见，在框架基础组件中很常见）。插槽是一个需要分配的 lambda。在最深层的 LazyList 列表项中，有时基本类型参数更有优势。如果你不是在编写框架，这一点不适用。

## 评审期间的危险信号

| 想法 | 实际情况 |
|---|---|
| “标题*始终*是 String——把它做成插槽属于过度设计” | “目前始终如此”正是陷阱所在。Material 的 `ListItem.headlineContent` 之所以存在，是因为明天就可能有人想要 `Text + Badge`。在每个调用点，插槽只会额外增加 `8` 个字符的包装（`{ Text(…) }`）；而日后为其添加插槽的重构则需要修改所有现有调用点。 |
| “Lambda 比字符串更重” | 在典型 Compose UI 的规模下，这种差异无法测量——而且框架自身的组件（`Button`、`ListItem`、`TopAppBar`、`Scaffold`）全都使用插槽。如果你的组件位于最为关键的高频路径中，请参阅“不适用的情况”。 |
| “如果有人提出需求，我以后再添加插槽” | 插槽会将一个参数变成两个参数（插槽本身 + 可能存在的内部标志），并需要修改每个调用点。这种结构变化不是可以“以后再说”的改动。 |
| “我改用密封的 `Trailing` 类型来建模各种变体” | 密封枚举是有边界的；插槽则没有边界。密封类型只在有人需要你未曾预料的变体之前有效——到那时，你还是得回头修改组件。插槽可以避免这种循环。 |
| “前导区域*始终*是图标，尾随区域会变化——我只把尾随区域做成插槽” | 这是局部插槽陷阱。第一次有某一行需要头像、旗帜 emoji 或彩色形状时，“始终是图标”这一假设就会失效。前导区域也应使用插槽。 |
| “目前只有一个调用点” | 如果只有一个调用点，你可能还没有在设计可复用组件。请参阅“不适用的情况”——对于真正只使用一次的场景，使用基本类型参数即可。一旦你开始复制粘贴它，就改用插槽。 |

## 相关内容

- [`compose-modifier-and-layout-style`](../compose-modifier-and-layout-style/SKILL.md) ——修饰符参数规则（其中的第 1～3 节）也适用于插槽 API。可复用组件既要接受 `modifier` 参数，*也要*为其内容提供插槽；调用方同时决定放置位置以及要放置的内容。