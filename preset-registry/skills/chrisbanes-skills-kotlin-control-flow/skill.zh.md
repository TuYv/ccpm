---
name: kotlin-control-flow
description: "Use when writing or reviewing Kotlin branching and control flow: when expressions, guard conditions, sealed type exhaustiveness, smart casts, nullable branching, early returns, or replacing complex if/else chains."
---
# Kotlin 控制流

## 目的

使用此技能编写或审查 Kotlin 分支代码的结构。将其视为一种重构流程，而不是一种风格偏好。

目标状态很简单：被分类的值清晰明确，分支局部谓词保留在所属分支中，智能类型转换仍然可用，并且编译器能够证明封闭域中的分支是穷尽的。

## 流程

按顺序执行以下检查。

### 1. 明确主体

找出代码正在分类的值。如果每个分支都在判断同一个值，则将该值作为 `when` 的主体。

```kotlin
// Replace repeated checks against `state` with a subject `when`.
val action = when (state) {
    State.SignedOut -> Action.ShowSignIn
    is State.SignedIn -> Action.ShowHome(state.user)
}
```

如果不存在单一主体，则保留无主体的 `when` 或 `if` 链。

### 2. 选择分支原语

编辑前使用以下决策表：

| 如果代码具有…… | 使用…… |
|---|---|
| 对一个值进行分类 | `when (subject)` |
| 互不相关的布尔条件 | 无主体的 `when` 或 `if`/`else` |
| 一个主要匹配条件加一个额外的分支局部谓词 | 守卫条件 |
| 主流程之前的无效输入 | 提前返回、`require` 或 `check` |
| 返回值的封闭枚举、Boolean、密封类型或可空封闭类型 | 穷尽的 `when` 表达式 |
| 开放的外部输入或真正的后备分支 | 显式 `else` |

### 3. 将分支局部谓词移入守卫条件

当一个分支先匹配类型或值，然后检查额外谓词时，请使用守卫条件：

```kotlin
return when (event) {
    is Event.Message if event.isUnread -> Row.Highlighted(event.message)
    is Event.Message -> Row.Normal(event.message)
    Event.Empty -> Row.Empty
}
```

仅在以下所有条件均成立时使用守卫：

- `when` 有主体。
- 分支有主要条件（`is Type`、枚举项、对象、值、范围等）。
- 额外条件仅属于该分支。
- 后续分支仍会处理相同的主要条件，或者表达式通过其他方式保持穷尽。

对于相同的主要条件，将带守卫的分支放在不带守卫的后备分支之前。

### 4. 保持穷尽性

对于封闭域上的 `when` 表达式，应显式处理每一种情况。不要只是为了让编译器停止报错而添加 `else`。

```kotlin
val action = when (state) {
    SessionState.SignedOut -> Action.ShowSignIn
    is SessionState.SignedIn -> Action.ShowHome(state.user)
    is SessionState.Expired if state.canRefresh -> Action.Refresh
    is SessionState.Expired -> Action.ShowSignIn
}
```

当域是开放的时，使用 `else`：来自服务器的字符串、整数状态码、未知的平台值，或者有意设置的后备或日志记录路径。

### 5. 拆分不支持守卫的分支

守卫条件不适用于以逗号分隔的分支条件。如果只有一种情况需要额外谓词，请拆分该分支：

```kotlin
when (status) {
    Status.Pending if canRetry -> retry()
    Status.Pending -> showPending()
    Status.Queued -> showQueued()
}
```

### 6. 扁平化无效的前置条件

当提前返回可以从主路径中移除可空或无效状态时，使用提前返回：

```kotlin
fun render(user: User?): UiModel {
    user ?: return UiModel.SignedOut

    return UiModel.SignedIn(
        name = user.name,
        avatar = user.avatar,
    )
}
```

如果嵌套结构承载着清理、事务或错误处理逻辑，则不要将其扁平化。

### 7. 检查智能类型转换

重塑结构后，验证每个分支在使用相应值的位置是否仍然可以获得类型收窄后的结果。如果改写后必须使用 `as`、`!!`、临时可变变量或重复的类型转换，请保留原有结构，或选择范围更小的重构。

## 改写方法

### `when` 中的嵌套分支

当嵌套分支仅对某个主要分支做进一步细分时，将其转换为带守卫条件的分支：

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

### 对同一个值进行重复检查

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

### 将空值作为多个分支中的一种情况

当空值是更大分类中的一个分支时，使用 `when (value)`：

```kotlin
return when (val selected = selection) {
    null -> SelectionUi.None
    is Selection.Single if selected.item.isArchived -> SelectionUi.Archived(selected.item)
    is Selection.Single -> SelectionUi.Active(selected.item)
    is Selection.Multiple -> SelectionUi.Count(selected.items.size)
}
```

## 审查清单

完成控制流变更前，请验证：

- 代码有一个明确的主语，或者有意不使用主语。
- 带守卫条件的分支位于与之匹配且不带守卫条件的分支之前。
- 以逗号分隔的分支不使用守卫条件。
- 封闭域的 `when` 表达式在不使用不必要的 `else` 时仍然保持穷尽性。
- 开放域的回退分支仍然是明确的。
- 智能类型转换仍然有效，无需使用 `as`、`!!` 或重复的类型转换。
- 新结构比旧结构更易于快速理解。

## 不应应用的情况

- 如果项目的 Kotlin 版本不支持守卫条件，请勿引入守卫条件。
- 不要将彼此无关的布尔检查转换为生硬的有主语 `when`。
- 不要删除为开放式外部输入而有意保留的 `else`。
- 如果扁平化会使清理、事务边界或错误处理变得不够清晰，请勿将代码扁平化。

## 相关内容

- [Kotlin 并发与 Flow](../kotlin-concurrency-and-flow/SKILL.md) - Flow 状态和事件原语的选择。
- [Kotlin API 设计](../kotlin-api-design/SKILL.md) - 将业务分支保留在公共代码中，并保持平台 `actual` 实现轻量。