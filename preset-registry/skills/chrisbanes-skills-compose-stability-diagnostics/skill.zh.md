---
name: compose-stability-diagnostics
description: Use when writing or reviewing Jetpack Compose parameter stability, compiler reports, skippability, unstable UI state classes, collection parameters, or Kotlin 2.0+ strong skipping behavior.
---
# Compose 稳定性诊断

## 核心原则

修复 Compose 参数问题应从证据出发。首先确定编译器模式和参数比较行为，然后修改真正导致无法跳过的模型或调用点。

从 Kotlin 2.0.20 开始，强跳过模式默认启用。不稳定参数不再自动导致可重启的 composable 不可跳过，但不稳定参数通过实例标识（`===`）进行比较，而稳定参数通过相等性（`equals`）进行比较。频繁创建的不稳定实例仍然可能导致无法跳过。

## 诊断流程

1. 确认症状：重组次数、编译器报告输出，或疑似频繁创建的参数。
2. 确定编译器模式：Kotlin/Compose 编译器版本，以及是否启用了强跳过模式。
3. 为发布的变体生成或读取 Compose 编译器报告。
4. 对于每个可疑参数，判断问题源自稳定性语义、实例频繁创建，还是调用方创建的 lambda/派生值。
5. 应用最轻量的修复，使类型/调用点如实反映其语义。
6. 在宣称问题已修复之前，重新测量相同的交互，或重新读取同一份报告。

## 1. 首先理解强跳过模式

在 Kotlin 2.0.20 及更高版本中，强跳过模式默认启用。在该模式下：

- 即使参数不稳定，可重启的 composable 也可以被跳过，除非明确选择退出。
- 稳定参数使用 `equals` 进行比较。
- 不稳定参数使用实例相等性（`===`）进行比较。
- composable 内部的 lambda 会根据其捕获项被自动记忆。

需要思考：“这些参数是否会按照我预期的方式进行比较？调用方是否在每一帧都创建新的不稳定实例？”

对于较旧的编译器配置或禁用了强跳过模式的情况，传统规则仍然适用：具有不稳定参数的可重启 composable 可能可以重启，但无法跳过。

## 2. 生成编译器报告

从 Kotlin 2.0 开始，Compose Compiler 通过 Kotlin Gradle 插件进行配置：

```kotlin
plugins {
    alias(libs.plugins.android.application) // or android.library / jvm
    alias(libs.plugins.kotlin.android)      // or kotlin.multiplatform / kotlin.jvm
    alias(libs.plugins.compose.compiler)
}

if (providers.gradleProperty("composeReports").orNull == "true") {
    composeCompiler {
        reportsDestination = layout.buildDirectory.dir("compose_compiler")
        metricsDestination = layout.buildDirectory.dir("compose_compiler")
    }
}
```

然后构建你所关注其编译器配置的变体，例如：

```bash
./gradlew :app:assembleRelease -PcomposeReports=true
```

使用发布版/不可调试构建进行运行时性能分析。编译器报告是构建时输出，因此关键在于使用与你实际发布版本相匹配的变体和编译器标志。

关键文件：

| 文件 | 提供的信息 |
|---|---|
| `<module>-classes.txt` | 类和属性的稳定性 |
| `<module>-composables.txt` | 可重启/可跳过状态以及参数稳定性 |
| `<module>-composables.csv` | 以可排序形式提供的相同数据 |
| `<module>-module.json` | 汇总指标 |

## 3. 只修复已证实的参数问题

选择最轻量的修复方式，使类型的不可变性或相等性语义成立。

### 不可变集合

如果报告显示 UI 状态中使用了集合接口，请优先在 UI 状态边界使用 `kotlinx.collections.immutable`：

```kotlin
// Before: unstable collection interfaces
data class UiState(val items: List<Item>, val tags: Set<String>)

// After: immutable collection contracts
import kotlinx.collections.immutable.ImmutableList
import kotlinx.collections.immutable.ImmutableSet

data class UiState(val items: ImmutableList<Item>, val tags: ImmutableSet<String>)
```

生产方在边界处使用 `.toImmutableList()` / `.toImmutableSet()` 转换一次。

### `@Immutable` / `@Stable`

- 当每个属性实际上都不可变，且相等性能够描述所有可观察状态时，使用 `@Immutable`。
- 对于可变状态能够被 Compose 观察到的类型（通常通过 `MutableState`），使用 `@Stable`。

不要为了消除报告而添加注解。错误的稳定性承诺可能导致 UI 陈旧。

### 第三方不可变类型

对于无法添加注解、但可以如实视为不可变的类型，请使用 `stabilityConfigurationFiles`：

```kotlin
composeCompiler {
    stabilityConfigurationFiles.add(
        rootProject.layout.projectDirectory.file("compose_stability.conf"),
    )
}
```

```text
java.math.BigDecimal
java.math.BigInteger
java.time.*
kotlinx.datetime.*
```

只列出你愿意承诺其不可变的类型。不要列出诸如 `java.util.Date` 之类的可变类型。

## 4. 稳定惰性列表项的输入

当惰性列表项重组是由调用点变化引起时，应稳定传递给各个列表项的值，而不是盲目地为模型添加注解。

提升并记住在列表项生命周期内保持稳定的逐项输入：

```kotlin
// ❌ BAD — new lambda instances when parent recomposes
items(list, key = { it.id }) { item ->
    RowCard(
        onClick = { onItemClick(item.id) },
        isHighlighted = { item.id == selectedId },
    )
}

// ✅ GOOD — stable captures for this item instance
items(list, key = { it.id }) { item ->
    val onClick = remember(item.id) { { onItemClick(item.id) } }
    val isHighlighted = remember(item.id, selectedId) { item.id == selectedId }
    RowCard(onClick = onClick, isHighlighted = isHighlighted)
}
```

当值仅取决于索引时，也应使用 `remember(index) { … }` 提升行位置元数据（`isFirst`、`isLast`、圆角半径），但不要指望仅靠这一点就能修复回写或跨行测量问题。

提升后，使用重组次数断言验证焦点移动和插入操作。

## 快速参考

| 症状 | 诊断 | 修复方法 |
|---|---|---|
| 使用 Kotlin 2.0.20+，但旧文档称不稳定意味着不可跳过 | 强跳过改变了默认行为 | 改为检查比较语义和实例变化 |
| `unstable val items: List<Item>` | 接口集合 | 使用 `ImmutableList<Item>` 或其他真正的不可变包装器 |
| `unstable val price: BigDecimal` | 外部不可变类型 | 添加到稳定性配置中 |
| 在具有可变内部状态的类型上使用 `@Immutable` | 错误承诺 | 修复模型或移除注解 |
| 尽管启用了强跳过，可组合项仍很少被跳过 | 每次重组都创建新的不稳定实例 | 使用记忆、提升，或使类型具有稳定性/基于相等性的语义 |
| 尽管数据未发生变化，惰性列表项仍会在父级重组时重组 | 每次父级重组都会创建新的 lambda 或派生值实例（§4） | 使用 `remember(item.id) { … }` 逐项提升 |
| 未生成报告 | 缺少 Compose 编译器插件或未设置标志 | 应用 `org.jetbrains.kotlin.plugin.compose` 并启用目标位置 |

## 不适用的情况

- 问题是跨阶段回写或跨行测量读取。请使用 [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md)。
- 问题是在组合过程中读取快速变化的 `State`，例如滚动或动画状态。请使用 [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md)。
- 重组次数与实际数据变化相符。
- 问题是数据错误或状态陈旧，而非工作量过多。
- 代码仅用于测试，且可读性比报告整洁度更重要。

## 相关内容

- [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md) - 对于以帧率变化的状态，通常应在布局/绘制阶段而非组合阶段读取。
- [`compose-recomposition-performance`](../compose-recomposition-performance/SKILL.md) - 当你不确定涉及哪个重组维度时，可从此处入手。