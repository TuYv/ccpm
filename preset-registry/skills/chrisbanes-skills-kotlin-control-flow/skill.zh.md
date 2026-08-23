---
name: kotlin-control-flow
description: "Use when writing or reviewing Kotlin branching and control flow: when expressions, guard conditions, sealed type exhaustiveness, smart casts, nullable branching, early returns, or replacing complex if/else chains."
---
# Kotlin 控制流

## 目的

使用此技能来编写或审查 Kotlin 分支代码的结构。将其视为一种重构流程，而不是一种风格偏好。

目标状态很简单：被分类的值清晰明确，分支局部谓词保留在其所属分支中，智能类型转换仍然可用，并且编译器能够证明封闭域的穷尽性。

## 流程

按顺序应用以下检查。

### 1. 为主体命名

找出代码正在分类的值。如果每个分支都在针对同一个值进行判断，请将该值作为 `when` 的主体。

```kotlin
// Replace repeated checks against `state` with a subject `when`.
val action = when (state) {
    State.SignedOut -> Action.ShowSignIn
    is State.SignedIn -> Action.ShowHome(state.user)
}
```

如果不存在单一主体，请保留无主体的 `when` 或 `if` 链。

### 2. 选择分支原语

编辑前请使用以下决策表：

| 如果代码具有…… | 使用…… |
|---|---|
| 对一个值进行分类 | `when (subject)` |
| 不相关的布尔条件 | 无主体的 `when` 或 `if`/`else` |
| 一个主要匹配加上一个额外的分支局部谓词 | 守卫条件 |
| 主路径之前存在无效输入 | 提前返回、`require` 或 `check` |
| 对封闭的枚举、Boolean、密封类型或可空封闭类型返回一个值 | 穷尽的 `when` 表达式 |
| 开放的外部输入或真正的回退逻辑 | 显式 `else` |

### 3. 将分支局部谓词移入守卫条件

当一个分支先匹配某个类型/值，然后检查额外谓词时，请使用守卫条件：

```kotlin
return when (event) {
    is Event.Message if event.isUnread -> Row.Highlighted(event.message)
    is Event.Message -> Row.Normal(event.message)
    Event.Empty -> Row.Empty
}
```

仅当以下所有条件均成立时才应用守卫：

- `when` 有主体。
- 分支具有主要条件（`is Type`、枚举条目、对象、值、范围等）。
- 额外条件仅属于该分支。
- 后续分支仍会处理相同的主要条件，或者该表达式通过其他方式保持穷尽性。

对于相同的主要条件，请将带守卫的分支放在其无守卫的回退分支之前。

### 4. 保持穷尽性

对于封闭域上的 `when` 表达式，请显式处理每一种情况。不要仅仅为了让编译器不再报错而添加 `else`。

按值匹配单例对象，但使用 `is` 匹配类和数据类子类型。在子类型分支中，使用映射本就需要的、调用者可见的任何有效载荷，以便使智能类型转换保持明确；不要用无效的裸类名替换 `else`，也不要仅仅为了声称具有穷尽性而丢弃子类型数据。

```kotlin
val action = when (state) {
    SessionState.SignedOut -> Action.ShowSignIn
    is SessionState.SignedIn -> Action.ShowHome(state.user)
    is SessionState.Expired if state.canRefresh -> Action.Refresh
    is SessionState.Expired -> Action.ShowSignIn
}
```

当域是开放的时，请使用 `else`：来自服务器的字符串、整数状态码、未知的平台值，或者刻意设置的回退/日志记录路径。

### 5. 拆分不支持守卫条件的分支

守卫条件不适用于以逗号分隔的分支条件。如果只有一种情况需要额外的谓词，请拆分该分支：

```kotlin
when (status) {
    Status.Pending if canRetry -> retry()
    Status.Pending -> showPending()
    Status.Queued -> showQueued()
}
```

### 6. 扁平化无效状态的前置检查

当前置返回能够从主路径中排除可空状态或无效状态时，请使用提前返回：

```kotlin
fun render(user: User?): UiModel {
    user ?: return UiModel.SignedOut

    return UiModel.SignedIn(
        name = user.name,
        avatar = user.avatar,
    )
}
```

如果嵌套结构承担着清理、事务或错误处理职责，则不要将其扁平化。

### 7. 检查智能类型转换

重构之后，请验证每个分支在使用已收窄类型的位置仍然能够获得该类型。如果改写后不得不使用 `as`、`!!`、临时可变变量或重复的类型转换，请保留原有结构，或选择范围更小的重构。

## 改写方案

### `when` 内的嵌套分支

当嵌套分支只对一个主要情况进行细分时，将其转换为带守卫条件的分支：

```kotlin
// Before
return when (event) {
    is Event.Message -> {
        if (event.isUnread) Row.Highlighted(event.message) else Row.Normal(event.message)
    }
    Event.Empty -> Row.Empty
}

// After
return when (event) {
    is Event.Message if event.isUnread -> Row.Highlighted(event.message)
    is Event.Message -> Row.Normal(event.message)
    Event.Empty -> Row.Empty
}
```

### 针对同一个值的重复检查

当每个条件都在对同一个值进行分类时，将其作为主语：

```kotlin
// Before
return when {
    result is Result.Success -> Ui.Success(result.value)
    result is Result.Failure && result.canRetry -> Ui.Retry(result.error)
    result is Result.Failure -> Ui.Error(result.error)
    else -> Ui.Loading
}

// After
return when (result) {
    is Result.Success -> Ui.Success(result.value)
    is Result.Failure if result.canRetry -> Ui.Retry(result.error)
    is Result.Failure -> Ui.Error(result.error)
    Result.Loading -> Ui.Loading
}
```

### 将空值作为多个情况之一

当空值是较大分类中的一个分支时，使用 `when (value)`：

```kotlin
return when (val selected = selection) {
    null -> SelectionUi.None
    is Selection.Single if selected.item.isArchived -> SelectionUi.Archived(selected.item)
    is Selection.Single -> SelectionUi.Active(selected.item)
    is Selection.Multiple -> SelectionUi.Count(selected.items.size)
}
```

## 审查清单

完成控制流变更之前，请验证：

- 代码具有一个明确的主语，或者有意不设主语。
- 带守卫条件的分支位于与其匹配的不带守卫条件的分支之前。
- 以逗号分隔的分支不使用守卫条件。
- 闭合领域中的 `when` 表达式仍然是穷尽的，且没有不必要的 `else`。
- 开放领域中的回退分支仍然是显式的。
- 智能类型转换仍然有效，无需使用 `as`、`!!` 或重复的类型转换。
- 新结构比旧结构更易于快速理解。

## RED/GREEN 代理场景

1. 直接示例：一个密封结果通过 `else` 将一个数据类子类型和两个单例结果进行映射。RED 建议将类名作为值分支，或丢弃数据载荷。GREEN 对类子类型使用 `is`，对对象使用值匹配，并在映射需要数据载荷时保留其智能类型转换。
2. 新颖示例：纯 Kotlin 导航使用一次性 Flow 加上密封路由渲染器。GREEN 将并发指导与此技能相结合，并显式处理数据路由；在没有 Compose API 或所有权证据的情况下，它不会推断存在 Compose 状态方面的问题。
3. 反例：外部整数状态码具有刻意设计的未知值回退逻辑。GREEN 保留 `else`，因为该领域是开放的。
4. 无需更改：一个穷尽的 `when` 已经在不进行类型转换的情况下使用了每个子类型的数据载荷。GREEN 报告无需更改控制流。

## 不适用的情况

- 如果项目使用的 Kotlin 版本不支持守卫条件，请勿引入守卫条件。
- 请勿将不相关的布尔检查转换成别扭的带主语 `when`。
- 对于开放世界的外部输入，请勿移除刻意设置的 `else`。
- 如果扁平化代码会使清理、事务边界或错误处理变得不够清晰，请勿这样做。

## 相关内容

- [Kotlin 并发与 Flow](../kotlin-concurrency-and-flow/SKILL.md) - Flow 状态和事件原语的选择。
- [Kotlin API 设计](../kotlin-api-design/SKILL.md) - 将业务分支逻辑保留在公共代码中，并保持平台 actual 实现精简。