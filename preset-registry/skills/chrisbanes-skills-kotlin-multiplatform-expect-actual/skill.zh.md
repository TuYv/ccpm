---
name: kotlin-multiplatform-expect-actual
description: Use when designing Kotlin Multiplatform expect/actual or interface boundaries for platform services, native SDKs, source sets, Compose Multiplatform UI, permissions, files, settings, sensors, or platform interop.
---
# Kotlin Multiplatform：expect/actual 边界

## 核心原则

保持公共 API 具有明确的语义且稳定。将平台机制置于小型 `expect`/`actual` 声明或接口之后，并避免在 `commonMain` 中出现 Android/iOS/Desktop 的具体细节。

## 边界划分流程

1. 使用通用术语命名产品能力：分享文本、读取剪贴板、请求触觉反馈、解析当前区域。
2. 检查公共调用方是否需要伪实现、注入的依赖项、生命周期所有权或运行时实现选择。
3. 从下表中选择最小的边界。
4. 确保公共签名不包含平台类型和平台术语。
5. 将业务分支逻辑放在公共代码中；让 actual 实现/平台绑定仅充当转换层。
6. 通过编译每个受影响的源集进行验证，并尽可能使用伪实现测试公共代码。

## 选择边界

| 情况 | 首选方式 |
|---|---|
| 简单的编译期平台特化 | `expect`/`actual` 函数、值、类型别名或叶级 composable |
| 实现需要注入的依赖项、生命周期所有权、运行时选择或测试伪实现 | 公共接口加平台绑定 |
| UI 大部分共享，只有一个叶级组件不同 | 公共 composable 调用一个 `expect` 叶级组件 |
| 整个屏幕因平台而异 | 将独立的平台屏幕置于公共导航契约之后 |
| 只有常量/资源不同 | 公开语义值的公共 API，各平台提供 actual 值 |

## 保持公共 API 的语义性

编写公共 API 时，应让调用方描述意图，而不是平台机制：

```kotlin
// GOOD: common API is semantic
expect fun currentRegion(): Region
```

```kotlin
// BAD: common API leaks Android implementation
expect fun currentRegionFromAndroidLocale(context: Context): Region
```

Android actual 实现可以使用 `Locale` API。iOS actual 实现可以使用 Foundation API。公共调用方不应了解这些细节。

## 保持 actual 实现精简

Actual 实现应将语义 API 转换为平台调用。如果操作需要 Activity、视图控制器、生命周期所有者、DI 或伪实现，请停止使用 `expect class`，改为使用由平台代码提供的接口：

```kotlin
// commonMain
interface ShareSheet {
    suspend fun shareText(text: String)
}
```

```kotlin
// androidMain
class AndroidShareSheet(
    private val activity: Activity,
) : ShareSheet {
    override suspend fun shareText(text: String) {
        val intent = Intent(Intent.ACTION_SEND)
            .setType("text/plain")
            .putExtra(Intent.EXTRA_TEXT, text)
        activity.startActivity(Intent.createChooser(intent, null))
    }
}
```

Android 实现明确由 Activity 所有。使用通用的 `Context` 往往会掩盖 UI 生命周期要求。应明确定义 `suspend` 的含义：对于许多平台 UI 操作，它意味着“分享面板已启动”，而不是“用户已完成分享”。

如果 actual 实现开始累积业务规则，请将这些规则移回公共代码，只在 actual 实现中保留平台转换逻辑。

## 当测试或 DI 很重要时，优先使用接口

对于简单的编译期平台 API，使用 `expect/actual`。当公共代码需要伪实现、多个实现、运行时选择或生命周期所有权时，使用接口：

```kotlin
interface Clipboard {
    suspend fun setText(text: String)
}
```

平台模块将 `Clipboard` 绑定到 Android/iOS 实现。公共测试使用伪实现。

## Compose 专项指导

当共享 UI 到达平台叶节点时：

1. 将平台特定的 composable 保持在叶节点。
2. 对每个会生成 UI 的 expected composable，都要传递 `Modifier`。
3. 禁止在 `commonMain` 签名中使用平台类型（`Context`、`Activity`、Android 资源 ID、`Uri`、`Bundle`、`UIViewController`、`NSBundle`、平台权限枚举等）。
4. 将原生视图生命周期隐藏在平台 actual 内部，并使用正确的互操作容器（`AndroidView`、`UIKitView` 等）。
5. 不要直接从 composable 函数体启动平台操作。在 actual composable 内部，应像在公共 Compose 代码中一样使用 `remember`、`LaunchedEffect`、`DisposableEffect` 和稳定键。
6. 尽可能使用伪平台服务对公共纯 UI composable 进行预览/测试。

## 常见错误

| 错误 | 修复方式 |
|---|---|
| `commonMain` API 暴露 Android/iOS 类型 | 替换为具有语义的公共类型 |
| `expect` 函数包含仅供某个平台使用的参数 | 将这些细节移入 actual |
| 每个 actual 中都重复业务分支逻辑 | 将业务规则移至公共代码 |
| 使用一个庞大的 `Platform` expect 对象 | 按能力拆分：`Clipboard`、`ShareSheet`、`Haptics` |
| 平台 UI 泄漏到组件树的高层 | 将平台特定的 Composable 下推至叶节点 |
| 公共测试缺少可伪造的边界 | 使用接口，而不是直接调用 `expect` |
| 修改后只有一个目标可以编译 | 完成前编译所有受影响的源集 |

## 审查时的危险信号

- 公共代码导入了平台包。
- actual 实现了解产品状态、导航决策或领域规则。
- 平台 API 名称出现在公共函数名中。
- 添加第三个平台时需要修改公共调用方。
- 仅为了验证公共业务行为，测试就需要 Android/iOS 运行时。

## 相关内容（Compose / 共享 UI）

本技能应专注于平台边界；共享 UI 的接线方式与任何其他 Compose 目标相同：

- [`kotlin-control-flow`](../kotlin-control-flow/SKILL.md) — 使用 `when`、守卫条件、穷尽性和智能类型转换，使公共代码中的业务分支保持明确。
- [`compose-state-hoisting`](../compose-state-hoisting/SKILL.md) — 共享的纯 UI composable 与状态持有者接线。
- [`compose-side-effects`](../compose-side-effects/SKILL.md) — actual composable 中的副作用键和清理（`LaunchedEffect`、`DisposableEffect` 等）。
- [`compose-modifier-and-layout-style`](../compose-modifier-and-layout-style/SKILL.md) 和 [`compose-slot-api-pattern`](../compose-slot-api-pattern/SKILL.md) — 可复用的共享 Compose API（modifier、slot）。