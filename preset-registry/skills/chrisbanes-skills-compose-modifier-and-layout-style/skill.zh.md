---
name: compose-modifier-and-layout-style
description: Use when writing or reviewing Jetpack Compose layout APIs, modifier parameters, modifier chain construction, hardcoded root layout decisions, or layout wrappers around a single conditional.
---
# 组合 modifier 与布局样式

## 核心原则

一个会生成布局的可组合项，是由*父级*放置的叶子节点——父级决定其位置、尺寸、对齐方式和内边距。可组合项的职责是定义结构（内部有什么），而不是定义放置方式（放在哪里）。由此得出三条规则：

- **声明一个 `modifier` 参数并将其应用于根节点**，这样父级才能真正履行其职责。在可组合项的根节点上硬编码 `.fillMaxWidth()`，会剥夺所有未来调用方作出这一决定的权利。
- **将 modifier 链构造为一个流畅的表达式**，而不是逐步重新赋值。两种方式编译后的结果相同，但链式写法可以让人一次性读出其意图。
- **条件渲染应放在条件实际生效的位置。** 如果一个布局调用的唯一内容只是一个 `if`，那么它的存在就只是为了容纳这个条件——应将 `if` 移到外部。

这些规则通常会一起出现，因为同一个可组合项往往会同时触发这三种情况：你声明它的参数（规则 1），调用方构造一个链来放置它（规则 2），而其主体中包含一个你可能想用布局包裹起来的条件（规则 3）。

## 何时使用此技能

- 你正在编写一个调用布局（`Box`、`Column`、`Row`、`LazyColumn`、`Text`、`Image`、`Surface`、`Card`、`Layout { … }`，以及来自 `compose.foundation.layout` 或 `compose.material*` 的任何内容）的 `@Composable fun`，但其签名中没有 `modifier` 参数，或者虽然有该参数却未将其应用于根节点，又或者在根节点上硬编码了 `.fillMaxWidth()`/`.padding(...)`。
- 你看到 `var m = Modifier`，后面跟着 `m = m.padding(…)`、`m = m.background(…)` 等代码。
- 某个 `modifier = …` 参数在单行中包含三个或更多链式调用。
- 可组合项的主体是 `Layout { if (cond) Content() }`——只有一个条件，没有其他内容。

## 1. 声明一个 `modifier` 参数

对于会生成布局的可组合项，应优先在必需参数之后、内容/lambda 参数之前添加一个 `modifier` 参数，其默认值为 `Modifier`。名称必须是 `modifier`——不能是 `mod`、`m` 或 `wrapperModifier`。

```kotlin
// ❌ BAD — no modifier param; caller can't position, size, or constrain this
@Composable
fun HomeScreenHeader(title: String, subtitle: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(title, style = MaterialTheme.typography.headlineLarge)
        Text(subtitle, style = MaterialTheme.typography.bodyMedium)
    }
}
```

```kotlin
// ✅ GOOD — parent decides width and padding; the composable describes structure only
@Composable
fun HomeScreenHeader(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(title, style = MaterialTheme.typography.headlineLarge)
        Text(subtitle, style = MaterialTheme.typography.bodyMedium)
    }
}
```

现在，调用方只需在主屏幕中——也就是唯一真正知道布局需要这些设置的地方——编写一次 `HomeScreenHeader(title, subtitle, Modifier.fillMaxWidth().padding(horizontal = 16.dp))`。

## 2. 将调用方的修饰符应用到根节点，并且最先应用

当根布局已经接收其他参数（对齐方式、排列方式、*组合项固有的*内边距）时，调用方提供的修饰符仍应传给根布局的 `modifier` 参数，而组合项自身的局部修饰符链应追加在其后。

```kotlin
// ❌ BAD — modifier accepted but never applied
@Composable
fun Avatar(url: String, modifier: Modifier = Modifier) {
    Image(painter = rememberAsyncImagePainter(url), contentDescription = null)
}

// ❌ BAD — applied to a child, not the root; caller's size/position changes don't take
@Composable
fun Avatar(url: String, modifier: Modifier = Modifier) {
    Box {
        Image(
            painter = rememberAsyncImagePainter(url),
            contentDescription = null,
            modifier = modifier,
        )
    }
}

// ❌ BAD — caller's modifier ends up last, so the composable's own size wins
@Composable
fun Avatar(url: String, modifier: Modifier = Modifier) {
    Image(
        painter = rememberAsyncImagePainter(url),
        contentDescription = null,
        modifier = Modifier
            .clip(CircleShape)
            .size(48.dp)
            .then(modifier),
    )
}
```

```kotlin
// ✅ GOOD — caller's modifier first, then the composable's intrinsic chain
@Composable
fun Avatar(url: String, modifier: Modifier = Modifier) {
    Image(
        painter = rememberAsyncImagePainter(url),
        contentDescription = null,
        modifier = modifier
            .clip(CircleShape)
            .size(48.dp),
    )
}
```

顺序很重要：在修饰符链中，*更靠前的*部分是外层包装。调用方的修饰符应位于最外层，这样调用方提供的 `.size(...)` 或 `.padding(...)` 才能覆盖组合项的默认值，而不是被默认值覆盖。

## 3. 不要在根节点上硬编码布局决策

如果组合项的根节点包含 `.fillMaxWidth()`、`.padding(horizontal = 16.dp)`、`.height(56.dp)` 等修饰符，调用方就无法选择*不*使用它们。这些布局决策应由父级负责。

```kotlin
// ❌ BAD — every caller now fills max width whether they want to or not
@Composable
fun PrimaryButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Button(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),   // ← hardcoded
    ) { Text(text) }
}

// ✅ GOOD — caller adds .fillMaxWidth() if (and only if) they want it
@Composable
fun PrimaryButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Button(onClick = onClick, modifier = modifier) { Text(text) }
}
```

例外情况是那些构成组合项**身份特征**的修饰符——也就是使 `Avatar` 成为头像的特征（`.clip(CircleShape)` 和默认的 `.size(48.dp)`），而不是决定它在屏幕上的位置。判断方法是：你能否想象调用方会想要一个*不带*该修饰符的组合项版本？如果可以，就将其移到外部。如果不可以（没有 `clip(CircleShape)` 的头像就不是头像），则保留它——但应将其放在调用方修饰符之后的链中（参见 §2）。

## 4. 将修饰符链构造成一个流畅的表达式

重组会重新运行可组合项主体——每个修饰符表达式都会被重新求值。通过逐步重新赋值 `var modifier =` 来构建修饰符看似合理，但这会破坏视觉上的连贯性，诱发进一步的可变操作，而且无法实现修饰符链做不到的任何事情。

```kotlin
// ❌ BAD — visual flow broken into reassignments; `var` invites more mutation
@Composable
fun Demo() {
    var m = Modifier
    m = m.padding(16.dp)
    m = m.fillMaxSize()
    Box(m) { }
}

// ❌ ALSO BAD — same shape, dressed up with .then()
@Composable
fun Demo() {
    var m = Modifier
    m = m.padding(16.dp)
    m = m.then(Modifier.fillMaxSize())
    Box(m) { }
}
```

```kotlin
// ✅ GOOD
@Composable
fun Demo() {
    val m = Modifier
        .padding(16.dp)
        .fillMaxSize()
    Box(m) { }
}
```

使用 `val`，而不是 `var`：修饰符链构建完成后，不应再将它重新绑定。正是重新赋值的写法让 `var` 显得必不可少；修饰符链的写法并不需要它。

### 对于较短的修饰符链，可以直接在调用位置内联

对于一两次调用，直接以内联方式构建修饰符。只有当修饰符链长到值得命名，或同一个修饰符链会重复出现时，“提取到 `val`”这条规则才真正有价值。

```kotlin
// ✅ GOOD — short chain inline
Box(modifier = Modifier.fillMaxWidth()) { … }
Box(modifier = Modifier.padding(8.dp).background(Color.Red)) { … }
```

### 条件片段应保留在修饰符链中

使用 `var` 的一个常见理由是“修饰符取决于某个条件”。其实不必如此——直接在链中嵌入条件即可：

```kotlin
// ✅ GOOD — conditional inside the chain, still one expression
Box(
    modifier = Modifier
        .fillMaxWidth()
        .then(if (selected) Modifier.background(Color.Red) else Modifier),
)
```

`Modifier`（空修饰符）是 `.then` 的单位元——当某个分支不添加任何内容时，它能让你继续保持修饰符链的形式。

## 5. 调用位置的多行格式

当 `modifier` 实参的修饰符链包含**三次或更多**调用时，应采用多行格式，每行一次调用。缩进修饰符链，使带点号的调用在值的下方对齐。

```kotlin
// ❌ BAD — three+ calls on one line; hard to scan
Box(
    modifier = modifier.fillMaxSize().padding(16.dp).weight(1f),
)

// ✅ GOOD
Box(
    modifier = modifier
        .fillMaxSize()
        .padding(16.dp)
        .weight(1f),
)
```

一次或两次调用应保留在同一行——判断阈值是调用次数，而不是字符数。如果某一次调用的实参很长，那属于另一个问题（提取一个 `val`，或缩短实参）。

这*仅*适用于名为 `modifier` 的参数。其他流畅式风格的实参不在此规则的适用范围内。

## 6. 将单一条件语句提升到布局之外

当一个布局的*唯一*内容是一个 `if` 时，该布局的存在仅仅是为了“容纳”这个条件语句。将 `if` 移到外部——这样，只有在确实有内容要显示时，布局才会存在。

```kotlin
// ❌ BAD — Column always emitted; only its inner content is conditional
@Composable
fun A() {
    Column {
        if (showHeader) {
            Text("Title")
            Text("Subtitle")
        }
    }
}

// ✅ GOOD — Column only exists when it has content
@Composable
fun A() {
    if (showHeader) {
        Column {
            Text("Title")
            Text("Subtitle")
        }
    }
}
```

这样做的好处并不在于性能提升——运行时对两种形式都能很好地处理——而在于第二种形式*读起来*像是“有条件显示的标题区域”。第一种形式读起来则像是“始终存在但可能有内容、也可能没有内容的列”。

### 例外情况（以及原因）

- **布局承载了与条件无关的视觉语义。** 当布局调用传入 `modifier`、`contentAlignment`、`horizontalArrangement` 或 `verticalAlignment` 时，这些参数描述的是*容器*，而不是内容。将条件提升到布局外部，要么会丢失这些参数的效果（容器随内容一起消失），要么需要在两个分支中重复这些参数。保持原样。

  ```kotlin
  // ✅ KEEP AS-IS — modifier on the container is doing visible work
  @Composable
  fun A(modifier: Modifier = Modifier) {
      Box(modifier = modifier) {
          if (something) {
              Text("Bleh1")
              Text("Bleh2")
          }
      }
  }
  ```

- **`if` 还有同级内容。** 布局中还有其他内容；`if` 只是其中一部分。提升条件要么会将同级内容也移出布局（从而改变布局），要么会留下一个不同的结构。保持原样。

- **两个分支都提供可组合项的 `if … else …`。** 两个分支都会执行工作；没有什么可以提升；布局*就是*共享容器。

  ```kotlin
  // ✅ KEEP AS-IS — both branches contribute to the layout
  Box {
      if (something) Text("Hint") else innerTextField()
  }
  ```

## 7. 测量阶段的约束修饰

当可组合项 A 捕获一个尺寸，而可组合项 B 必须与之匹配时，**不要在 B 的可组合函数主体中读取捕获的尺寸**（`Modifier.height(state.dp)`）。这样一来，每当测量状态发生变化时，B 都会与组合阶段绑定。

在 A 的布局回调中捕获尺寸；在 B 的 `Modifier.layout` 中应用尺寸，这样只会使布局失效：

```kotlin
fun Modifier.decorateMeasureConstraints(
    decorate: (Constraints) -> Constraints,
): Modifier = layout { measurable, incoming ->
    val constraints = decorate(incoming).constrain(incoming)
    val placeable = measurable.measure(constraints)
    layout(placeable.width, placeable.height) {
        placeable.placeRelative(0, 0)
    }
}
```

```kotlin
// Hoisted at the common parent of both rows:
//   var anchorHeightPx by remember { mutableIntStateOf(0) }

// Measured row — write state only from onSizeChanged
RowAnchor(Modifier.onSizeChanged { size -> if (size.height != anchorHeightPx) anchorHeightPx = size.height })

// Sibling rows — read anchorHeightPx only inside layout
RowSibling(
    Modifier.decorateMeasureConstraints { incoming ->
        if (anchorHeightPx > 0) {
            // Clamp to incoming bounds so the constraint never exceeds the parent's max.
            incoming.copy(minHeight = anchorHeightPx, maxHeight = anchorHeightPx)
        } else {
            incoming
        }
    },
)
```

仅在 `anchorHeightPx` 为 `0` 时使用组合阶段的回退值（固定高度）。完整的跨行模式请参阅 [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md)。

## 快速参考

| 表象 | 诊断 | 修复方法 |
|---|---|---|
| `@Composable fun Foo(text: String)`，主体中包含 `Column`/`Box`/`Text` | 没有 `modifier` 参数（§1） | 添加 `modifier: Modifier = Modifier`；将其传给根节点 |
| 声明了 `modifier: Modifier = Modifier`，但从未引用 | 参数被忽略（§2） | 将其应用于根布局的 `modifier` 参数 |
| 将 `modifier` 传给子节点，而非根节点 | 目标错误（§2） | 将其移至最外层布局的 `modifier` |
| `modifier = Modifier.x().y().then(modifier)` | 调用方的修饰符位于最后（§2） | 重新排序：`modifier = modifier.x().y()` |
| 通用组件上存在 `modifier = modifier.fillMaxWidth().padding(...)` | 布局被硬编码（§3） | 移除硬编码调用；让调用方自行添加 |
| 文件中的同级可组合函数也没有 `modifier` | 反模式正在扩散 | 修复当前这个；视情况顺便修复同级项 |
| `mod: Modifier = Modifier` 或 `wrapperModifier: Modifier = Modifier` | 名称错误（§1） | 将其准确重命名为 `modifier` |
| `var m = Modifier`，后面跟着 `m = m.xxx()` 重新赋值 | 分步构建修饰符（§4） | 在 `val` 上使用一条流式调用链，或以内联方式构建 |
| `var m = Modifier; m = m.then(Modifier.xxx())` | 通过 `.then` 形成相同结构（§4） | 在调用链中将 `.then(Modifier.x())` 简化为 `.x()` |
| 修饰符分支需要条件 | 试图使用 `var`（§4） | 在调用链中使用 `.then(if (c) Modifier.x() else Modifier)` |
| 单行中存在 `modifier = modifier.a().b().c()` | 长调用链未格式化（§5） | 每行一个调用，并在值下方缩进 |
| `Layout { if (cond) X() }`，没有其他内容，也没有布局调节参数 | 提升条件（§6） | 将 `if` 移至布局外部 |
| `Box(modifier = …) { if (cond) X() }` | 布局承载语义——保持原样（§6 例外） | 保持原样 |
| `Box { if (cond) X() else Y() }` | 两个分支都提供内容——保持原样（§6 例外） | 保持原样 |
| 同级惰性行从另一行的测量结果中读取 `height(state)` | 组合阶段的尺寸耦合（§7） | 在被测量的行上捕获尺寸；通过同级行上的 `decorateMeasureConstraints` 应用 |

## 不应应用的情况

- **不生成布局的 Composable。** `@Composable fun computeColor(): Color` 或 `@Composable @ReadOnlyComposable` 访问器不会生成布局节点。不需要 `modifier` 参数（而且 `@ReadOnlyComposable` 也无法接受该参数——参见 `compose-state-authoring`）。
- **`@Preview` 函数。** Preview 是一次性的入口点；框架调用它们时没有调用方。`modifier` 参数只会成为无用的累赘。
- **仅用于测试的 Composable**，位于 `*Test` 源代码中，且唯一调用方是 `composeTestRule.setContent { … }`。理由与 Preview 相同。
- **将 `modifier` 作为其*第一个必需*参数的内部布局原语**（非常少见；通常属于框架级代码）。规则是“第一个*可选*参数”；一些私有工具将 `modifier` 放在最前面并设为必需参数是合理的。
- **根据动画状态以命令式方式组装的 Modifier。** 通过追加来自 `Animatable` 或其他过程式来源的值而构建的 Modifier，可能确实需要中间变量。链式调用本身并不是目的，可读性才是。如果链式调用反而使表达式更糟，就使用命令式写法。
- **将 Modifier 存储在数据类或构建器中的 Slot API**（很少见；通常属于框架级代码）。流畅链式调用的理念针对的是使用方构建过程。
- **用于固定特定重组形态的测试 Composable**——通常两种写法都可以；不要纯粹为了样式而重构测试 Composable。

不应仅仅因为“这个 Composable 是内部的”“只在一个地方使用”“我不想在签名中增加额外参数”或“我们已经知道所有调用方”，就跳过声明端规则（§1–§3）。恰恰是这些自我辩解，导致 Composable 在有人想要第二次调用它的那一天就沦为只能单次使用。

## 审查期间的危险信号

| 想法 | 事实 |
|---|---|
| “这个 Composable 仅供内部使用——添加 `modifier` 属于过度设计” | 该参数只有八个字符，而且有默认值。这不是过度设计，而是约定。不添加它才是过度设计——这是一个违背所有 Compose API 惯例的自定义决定。 |
| “它只在一个地方使用，所以我了解布局要求” | “只在一个地方使用”描述的是今天的情况。添加该参数的成本只需支付一次；当第二个使用位置出现时，重构调用方的成本则需要按调用方逐一支付。 |
| “这个文件中的同级 Composable 也没有 `modifier`，所以我是在保持风格一致” | 扩散反模式并不叫保持风格一致。修复这一个，并在合适的时机顺便修复其他同级 Composable。 |
| “父级在这里总是需要 `.fillMaxWidth()`” | 那就由父级传入 `.fillMaxWidth()`。Composable 不应替尚未遇到的调用方做出这个决定。 |
| “等有人需要时我再添加” | 你就是那个“有人”。现在你就需要它（为了遵循约定）。下一个调用方也不会添加它——他们只会设法绕过它的缺失。 |
| “这是个很小的 Composable——modifier 参数只是噪声” | 该参数在声明处只有八个字符，而在任何不需要它的调用位置都是零个字符。所谓的“噪声”只是想象出来的。 |
| “我添加了 `modifier`，但仍在根节点上保留 `.fillMaxWidth()`，这样主屏幕就不必传了” | 那么*非*主屏幕调用方就无法取消它。将 `.fillMaxWidth()` 移到调用方。 |
| “我需要为 Modifier 使用 `var`，因为链式调用取决于某个条件” | 条件片段可以写成 `.then(if (c) Modifier.x() else Modifier)`，仍然位于同一条链上。不需要 `var`。 |
| “只有三行，没必要改成多行” | 三个链式调用*就是*阈值。少于三个时使用单行；达到或超过三个时使用多行。 |
| “Column 没有增加任何作用，但为了对称性，我还是保留它” | 那就将条件提升到外部，并把 Column 保留在条件成立的分支内——既保持对称性，又不会产生始终存在的容器。 |
| “布局已经存在，所以我会把 `if` 放在里面” | “已经存在”本身就是问题所在。条件为 false 时，该布局就不应存在。 |

## 相关内容

- [`compose-slot-api-pattern`](../compose-slot-api-pattern/SKILL.md) — 声明可复用 Composable 公共 API 的另一半：使用 `@Composable () -> Unit` 插槽接收可变内容。可复用组件同时接收 `modifier` 参数*和*插槽——调用方既决定放置位置，*也*决定放置内容。
- [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md) — 跨阶段回写与延迟测量读取。