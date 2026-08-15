---
name: crash-analytics
description: When the user wants to monitor, triage, or reduce their app's crash rate — including setting up Crashlytics, prioritizing which crashes to fix first, interpreting crash data, and understanding how crashes affect App Store ranking. Use when the user mentions "crash", "crashlytics", "crash rate", "ANR", "app not responding", "crash-free sessions", "crash-free users", "symbolication", "stability", "firebase crashes", "app crashing", or "crash report". For overall analytics setup, see app-analytics.
metadata:
  version: 1.0.0
---
# 崩溃分析

你帮助对应用崩溃进行分类、确定优先级并减少崩溃，同时了解崩溃率如何影响 App Store 的曝光度和评分。

## 为什么崩溃率是 ASO 信号

- **App Store 排名** — Apple 的算法会惩罚崩溃率较高的应用
- **App Store 推荐** — 高崩溃率会使应用失去获得编辑推荐的资格
- **评分** — 崩溃是导致一星评价的首要原因
- **留存率** — 首次会话中发生崩溃会严重破坏次日留存率

**目标：**无崩溃会话 > 99.5% | 无崩溃用户 > 99%

## 工具

| 工具 | 提供的功能 | 配置 |
|------|-----------------|-------|
| **Firebase Crashlytics** | 实时崩溃、ANR、符号化堆栈跟踪 | 添加 `FirebaseCrashlytics` pod/SPM 软件包 |
| **App Store Connect** | 崩溃率趋势、每次会话的崩溃次数 | 内置，无需编写代码 |
| **Xcode Organizer** | 汇总来自 TestFlight 和 App Store 的崩溃日志 | Xcode → Window → Organizer → Crashes |
| **MetricKit** | 设备端诊断、卡顿率、启动时间 | iOS 13+，自动运行 |

**推荐：**Crashlytics（实时警报和搜索）+ App Store Connect（趋势验证）

## Crashlytics 配置

### iOS (Swift)

```swift
// AppDelegate or @main App struct
import FirebaseCore
import FirebaseCrashlytics

@main
struct MyApp: App {
    init() {
        FirebaseApp.configure()
        // Crashlytics is auto-initialized
    }
}
```

### 非致命错误（在不导致崩溃的情况下进行跟踪）

```swift
// Log a non-fatal error
Crashlytics.crashlytics().record(error: error)

// Log a custom key for debugging context
Crashlytics.crashlytics().setCustomValue(userId, forKey: "user_id")
Crashlytics.crashlytics().setCustomValue(screenName, forKey: "current_screen")
```

### Android (Kotlin)

```kotlin
// build.gradle (app)
implementation("com.google.firebase:firebase-crashlytics:18.x.x")

// No additional code needed — auto-captures unhandled exceptions
// For non-fatal:
FirebaseCrashlytics.getInstance().recordException(throwable)
```

## 分类框架

并非所有崩溃都同等重要。应根据影响确定优先级：

**优先级分数 = 崩溃频率 × 受影响用户数 × 用户群体权重**

| 优先级 | 标准 | 响应时间 |
|----------|---------|---------------|
| P0 — 严重 | 在启动、结账或核心功能中崩溃；影响 >1% 的会话 | 当天修复 |
| P1 — 高 | 在常见流程中崩溃；影响 >0.1% 的会话 | 在当前版本中修复 |
| P2 — 中 | 边界情况崩溃；影响 <0.1% 的会话 | 在下一个版本中修复 |
| P3 — 低 | 罕见且不会造成阻塞的崩溃；影响 <0.01% 的会话 | 加入待办事项 |

### Crashlytics 仪表板分类

1. 按 **"Impact"**（受影响的独立用户数）排序，而不是按频率排序
2. 分组：`onboarding`、`checkout`、`core feature`、`background`、`launch`
3. 将排名前 3–5 的问题指定为 P0/P1
4. 在 Crashlytics 中为任何影响 >0.5% 用户的问题设置**速率警报**

## 阅读崩溃报告

```
Fatal Exception: com.example.NullPointerException
  at com.example.UserProfileVC.loadData:87
  at com.example.HomeVC.viewDidLoad:45

Keys:
  user_id: 12345
  current_screen: "home"
  app_version: "2.3.1"
  os_version: "iOS 17.3"
```

**调试步骤：**
1. 在 Xcode 中打开对应的文件和行（`UserProfileVC.swift:87`）
2. 检查该位置有哪些值可能为 nil
3. 使用对应的用户上下文（操作系统版本、设备、页面）复现问题
4. 修复前先编写一个会失败的测试

## 符号化

如果上传了 dSYM，Crashlytics 会自动进行符号化。如果看到未符号化的堆栈跟踪：

```bash
# Manually upload dSYMs
./Pods/FirebaseCrashlytics/upload-symbols -gsp GoogleService-Info.plist -p ios MyApp.app.dSYM
```

对于启用了 Bitcode 的构建版本，请从 App Store Connect → Activity → Build → dSYMs 下载 dSYM。

## App Store Connect 崩溃数据

- **App Store Connect → App Analytics → Crashes** — 各版本的崩溃率趋势
- 比较每次发布前后的崩溃率
- 某个特定版本出现峰值 = 该版本引入了回归问题

**崩溃率公式：** 崩溃次数 / 会话数 × 100

## 尽量缩小影响范围的发布策略

使用分阶段发布，在全面推出前发现崩溃：

**iOS：** App Store Connect → Version → Phased Release（7 天发布计划：1% → 2% → 5% → 10% → 20% → 50% → 100%）

**Android：** Play Console → Production → Managed publishing → Rollout percentage

**规则：** 每个阶段监控 Crashlytics 24 小时。如果崩溃率增幅 >0.2%，暂停发布。

## 应对由崩溃导致的一星评价

1. 确定开始出现崩溃相关一星评价的应用版本
2. 修复崩溃
3. 回复每一条与崩溃相关的评价：“已在 X.X 版本中修复——请更新”
4. 更新发布后，使用 `rating-prompt-strategy` 恢复评分

## 输出格式

### 崩溃审计报告

```
Stability Report — [App Name] v[version] ([period])

Crash-free sessions: [X]%  (target: >99.5%)
Crash-free users:    [X]%  (target: >99%)
Top crash issues:

P0 Issues (fix immediately):
  #1 [Exception type] — [X] users, [X]% of sessions
     File: [filename:line]
     Cause: [hypothesis]
     Fix: [specific action]

P1 Issues (this release):
  #2 [Exception type] — [X] users, [X]% of sessions
     ...

Action Plan:
  Today:     Fix P0 issue #1 → release hotfix
  This week: Fix P1 issues #2, #3 → include in v[X.X]
  Monitoring: Set velocity alert at 0.5% session threshold
```

## 相关技能

- `app-analytics` — 完整的分析技术栈；Crashlytics 是其中一部分
- `rating-prompt-strategy` — 修复导致一星评价的崩溃后恢复评分
- `review-management` — 回复与崩溃相关的评价
- `retention-optimization` — 第一天发生的崩溃会严重破坏留存指标
- `app-store-featured` — 崩溃率 > 2% 将失去获得编辑推荐的资格