---
name: android-jetpack-compose-expert
description: "Expert guidance for building modern Android UIs with Jetpack Compose, covering state management, navigation, performance, and Material Design 3."
risk: safe
source: community
date_added: "2026-02-27"
---
# Android Jetpack Compose 专家

## 概述

一份关于使用 Jetpack Compose 构建生产级 Android 应用的综合指南。本技能涵盖架构模式、基于 ViewModel 的状态管理、类型安全的导航以及性能优化技术。

## 何时使用本技能

- 在使用 Jetpack Compose 启动新的 Android 项目时使用。
- 在将旧的 XML 布局迁移到 Compose 时使用。
- 在实现复杂的 UI 状态管理和副作用时使用。
- 在优化 Compose 性能（重组次数、稳定性）时使用。
- 在设置类型安全的 Navigation 时使用。

## 分步指南

### 1. 项目配置与依赖

确保你的 `libs.versions.toml` 中包含必要的 Compose BOM 及相关库。

```kotlin
[versions]
composeBom = "2024.02.01"
activityCompose = "1.8.2"

[libraries]
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
```

### 2. 状态管理模式（MVI/MVVM）

使用 `ViewModel` 配合 `StateFlow` 来暴露 UI 状态。避免暴露 `MutableStateFlow`。

```kotlin
// UI State Definition
data class UserUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null
)

// ViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(UserUiState())
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()

    fun loadUser() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val user = userRepository.getUser()
                _uiState.update { it.copy(user = user, isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message, isLoading = false) }
            }
        }
    }
}
```

### 3. 创建 Screen 可组合函数

在"Screen"可组合函数中消费状态，并将数据向下传递给无状态组件。

```kotlin
@Composable
fun UserScreen(
    viewModel: UserViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    UserContent(
        uiState = uiState,
        onRetry = viewModel::loadUser
    )
}

@Composable
fun UserContent(
    uiState: UserUiState,
    onRetry: () -> Unit
) {
    Scaffold { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when {
                uiState.isLoading -> CircularProgressIndicator()
                uiState.error != null -> ErrorView(uiState.error, onRetry)
                uiState.user != null -> UserProfile(uiState.user)
            }
        }
    }
}
```

## 示例

### 示例 1：类型安全的导航

使用新的 Navigation Compose 类型安全 API（在较新的版本中可用）。

```kotlin
// Define Destinations
@Serializable
object Home

@Serializable
data class Profile(val userId: String)

// Setup NavHost
@Composable
fun AppNavHost(navController: NavHostController) {
    NavHost(navController, startDestination = Home) {
        composable<Home> {
            HomeScreen(onNavigateToProfile = { id ->
                navController.navigate(Profile(userId = id))
            })
        }
        composable<Profile> { backStackEntry ->
            val profile: Profile = backStackEntry.toRoute()
            ProfileScreen(userId = profile.userId)
        }
    }
}
```

## 最佳实践

- ✅ **建议：** 使用 `remember` 和 `derivedStateOf` 来减少重组过程中不必要的计算。
- ✅ **建议：** 如果 UI 状态中使用的数据类包含 `List` 或其他不稳定类型，请将其标记为 `@Immutable` 或 `@Stable`，以启用智能的重组跳过。
- ✅ **建议：** 对由状态变化触发的一次性副作用（例如显示 Snackbar），使用 `LaunchedEffect`。
- ❌ **禁止：** 在没有 `remember` 的情况下，直接在 Composable 函数体内执行开销大的操作（例如对列表排序）。
- ❌ **禁止：** 将 `ViewModel` 实例传递给子组件。只传递数据（状态）和 lambda 回调（事件）。

## 故障排查

**问题：** 出现无限重组循环。
**解决方案：** 检查你是否在没有 `remember` 的情况下在组合过程中创建了新的对象实例（如 `List` 或 `Modifier`），或者是否在组合阶段而非副作用或回调中更新了状态。使用 Layout Inspector 来调试重组次数。

## 局限性
- 仅当任务明确符合上述描述的范围时，才使用本技能。
- 不要将输出视为针对特定环境的验证、测试或专家评审的替代品。
- 如果缺少必需的输入、权限、安全边界或成功标准，请停止并请求澄清。
