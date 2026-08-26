---
name: kotlin-control-flow
description: "Use when writing or reviewing Kotlin branching and control flow: when expressions, guard conditions, sealed type exhaustiveness, smart casts, nullable branching, early returns, or replacing complex if/else chains."
---
# Kotlin 控制流

## 核心原则

明确指出被分类的值，将分支局部谓词保留在所属分支中，并让编译器验证封闭域的覆盖完整性。

## 操作步骤

1. 为被分类的值命名。如果每个分支都测试该值，请使用
   `when (subject)`；否则保留无主语的 `when` 或 `if` 链。
2. 选择分支形式：

   | 代码形式 | 优先选择 |
   |---|---|
   | 单个被分类的值 | `when (subject)` |
   | 互不相关的布尔条件 | 无主语的 `when` 或 `if`/`else` |
   | 主条件加分支局部谓词 | Guard 条件 |
   | 主路径之前的无效输入 | Early return、`require` 或 `check` |
   | 封闭的值返回域 | 穷尽式 `when` 表达式 |
   | 开放输入或有意保留的回退 | 显式 `else` |

3. 仅在有主语的 `when` 中、主条件之后使用 guard：额外谓词必须属于该分支，并且仍需有一个不带 guard 的分支处理该主条件。将带 guard 的分支放在前面。不要为逗号分隔的条件中的某一个添加 guard，而应将条件拆分开。
4. 对于封闭的枚举、布尔值、密封类型或可空的封闭类型，为每种情况命名并省略 `else`。按值匹配对象，并使用 `is` 匹配类/数据类子类型。如果映射需要负载数据，请保留智能转换后的负载。如果输入是开放的服务器/平台值，或确实需要回退/日志记录，则保留 `else`。
5. 仅当提前返回能够从主路径中移除无效或可空状态时才使用它。保留能够表达清理、事务或错误处理的嵌套结构。
6. 验证智能转换在不使用 `as`、`!!`、可变临时变量或重复转换的情况下仍然有效。如果无效，请保留原有结构或进行更小范围的重构。
7. 编译并测试。失败时，返回到前面最适用且改动最小的步骤，或保留之前的结构。当读者能够清楚看出主语、回退分支和分支数据，并且最终结构更易于浏览时即可完成。

## 示例方案

使用带 guard 的分支来细化一种情况，而不是嵌套 `if`：

```kotlin
return when (event) {
    is Event.Message if event.isUnread -> Row.Highlighted(event.message)
    is Event.Message -> Row.Normal(event.message)
    Event.Empty -> Row.Empty
}
```

当重复条件是在对同一个值进行分类时，使用有主语的 `when`；当 `null` 是更大分类中的一种情况时，将其作为一个分支：

```kotlin
return when (val selected = selection) {
    null -> SelectionUi.None
    is Selection.Single if selected.item.isArchived -> SelectionUi.Archived(selected.item)
    is Selection.Single -> SelectionUi.Active(selected.item)
    is Selection.Multiple -> SelectionUi.Count(selected.items.size)
}
```

不要在不受支持的 Kotlin 版本中引入 guard，不要将不相关的布尔检查强行放入有主语的 `when`，不要移除开放世界的回退分支，也不要为了扁平化代码而使清理、事务或错误处理变得难以理解。

## 相关内容

- [Kotlin 并发与 Flow](../kotlin-concurrency-and-flow/SKILL.md) — 状态/事件原语。
- [Kotlin API 设计](../kotlin-api-design/SKILL.md) — 明确的公共代码分支。