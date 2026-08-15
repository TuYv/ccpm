---
name: watchos-design-guidelines
description: Apple Human Interface Guidelines for Apple Watch. Use when building watchOS apps, complications, or workout features. Triggers on tasks involving Watch UI, Digital Crown, glanceable interfaces, or wrist-based interactions.
license: MIT
metadata:
  author: platform-design-skills
  version: "1.0.0"
---
# watchOS 设计指南

Apple Watch 是佩戴在手腕上的个性化设备，适合快速浏览。交互时长应以秒而非分钟衡量。每一项设计决策都必须优先考虑理解速度和交互简洁性。

---

## 1. 一目了然的设计（关键）

这是 watchOS 的决定性约束。如果用户抬起手腕后无法在 2 秒内获取关键信息，则设计即告失败。

### 规则

- **W-GL-01**：主要信息必须无需滚动即可看到。只有第一个屏幕能保证被用户看到。
- **W-GL-02**：将目标交互时长控制在 5 秒以内。围绕“抬腕—扫视—放下”的过程进行设计。
- **W-GL-03**：使用大号、高对比度文本。正文文本的最小有效字号为 16pt（系统字体）。标题应为 18pt 或更大。
- **W-GL-04**：将文本限制在必要内容范围内。应积极截断或缩写。在含义明确时，使用 SF Symbols 代替文本标签。
- **W-GL-05**：考虑手腕放下后的状态。手腕放下时，应用会进入非活动状态。不要假设用户会持续保持注意力。
- **W-GL-06**：每个屏幕优先呈现一项信息。如果要显示多个数据点，应通过字号、字重和颜色建立清晰的视觉层级。

### 屏幕尺寸参考

| 设备 | 屏幕宽度 | 屏幕高度 | 圆角半径 |
|--------|-------------|---------------|---------------|
| 41mm（Series 9） | 176px | 215px | 36px |
| 45mm（Series 9） | 198px | 242px | 39px |
| 42mm（Series 10） | 180px | 220px | 37px |
| 46mm（Series 10） | 205px | 251px | 40px |
| 49mm（Ultra 2） | 205px | 251px | 40px |

### 反模式

- 需要滚动才能理解上下文的大段文本
- 小而密集的数据表格
- 需要多次轻点后才显示有用信息
- 在 Watch 上照搬 iPhone 屏幕布局

---

## 2. 数码表冠（高）

数码表冠是用于滚动和精确选择数值的主要物理输入方式。它提供触觉反馈，其使用应具有明确目的。

### 规则

- **W-DC-01**：将数码表冠作为垂直内容的主要滚动机制。不要仅依赖轻扫手势进行滚动。
- **W-DC-02**：对于数值选择器（时间、数量、滑块），应将数码表冠绑定到精确调节，并在每个离散值处提供触觉刻度反馈。
- **W-DC-03**：不要覆盖系统的数码表冠行为，也不要与其冲突。系统会将数码表冠用于媒体播放期间的音量控制、系统 UI 中的滚动，以及复杂功能中的“时间旅行”。
- **W-DC-04**：提供与数码表冠旋转同步的视觉反馈。UI 必须逐帧响应数码表冠输入，不能有可感知的延迟。
- **W-DC-05**：在数码表冠每次递增时更新。数值、选择状态和高亮状态应随每个刻度同步变化。不要将数码表冠输入延迟到手势结束后再处理。

**正确——带触觉刻度反馈的数码表冠绑定：**
```swift
struct VolumePickerView: View {
    @State private var volume: Double = 0.5

    var body: some View {
        VStack {
            Text("\(Int(volume * 100))%")
                .font(.title.bold())
            Image(systemName: "speaker.wave.3")
        }
        .focusable()
        .digitalCrownRotation(
            $volume,
            from: 0.0,
            through: 1.0,
            by: 0.05,
            sensitivity: .medium,
            isContinuous: false,
            isHapticFeedbackEnabled: true
        )
    }
}
```

**错误示例——忽略数码表冠并强制仅使用触控交互：**
```swift
struct VolumePickerView: View {
    @State private var volume: Double = 0.5

    var body: some View {
        Slider(value: $volume)
        // No .digitalCrownRotation — Crown input is ignored
        // Users must use touch-only, which is imprecise and frustrating on Watch
    }
}
```

### 反模式

- 忽略数码表冠，强制所有交互都通过触控完成
- 自定义与系统预期冲突的表冠行为
- 离散值发生变化时缺少触觉反馈
- 对表冠旋转的响应存在延迟或批量处理

---

## 3. 导航（高）

Watch 导航必须层级浅且可预测。绝不能让用户感到迷失或无法返回已知状态。

### 规则

- **W-NV-01**：使用垂直页面滚动作为默认的内容导航模式。页面从上到下滚动，并通过数码表冠进行控制。
- **W-NV-02**：使用 `TabView` 展示顶层分区（最多 5 个标签页）。通过水平轻扫在标签页之间切换。每个标签页都是一个独立的功能区域。
- **W-NV-03**：使用 `NavigationStack` 实现分层深入导航。将层级限制在最多 2～3 层。每个推入的视图都必须具有返回按钮（由系统自动提供）。
- **W-NV-04**：避免在主要流程中使用模态表单。模态界面应仅用于专注且用途单一的任务（例如确认、快速输入）。
- **W-NV-05**：应用最重要的操作应在启动后轻点 1 次即可触达。不要将主要功能隐藏在菜单或导航之后。

### 导航模式参考

| 模式 | 使用场景 | 手势 |
|---------|----------|---------|
| 垂直滚动 | 单个视图中的长篇内容 | 数码表冠／向上或向下轻扫 |
| TabView（水平页面） | 应用的顶层分区 | 向左或向右轻扫 |
| NavigationStack（推入／弹出） | 分层深入导航 | 轻点以推入，向右轻扫或轻点返回按钮以弹出 |
| 模态表单 | 确认、专注输入 | 以编程方式呈现，通过按钮或向下轻扫关闭 |

### 反模式

- 过深的导航层级（4 层以上）
- 汉堡菜单或隐藏式导航抽屉
- 包含超过 5 个项目的标签栏
- 强制用户滚动浏览长列表才能找到关键操作

---

## 4. Complication（高）

Complication 是 Watch 应用最醒目的展示界面。它们位于表盘上，无需启动应用即可提供一目了然的数据。

### 规则

- **W-CP-01**：支持多种 Complication 系列，以最大限度提高表盘兼容性。至少支持 `accessoryCircular`、`accessoryCorner` 和 `accessoryRectangular`（WidgetKit，watchOS 9+）。
- **W-CP-02**：同时提供着色（单色）和全彩变体。当系统应用单一色调时，着色 Complication 必须仍然清晰可读。
- **W-CP-03**：通过 `TimelineProvider` 更新 Complication。当数据可预测时（例如下一个日历事件、天气预报），提供未来的时间线条目。保持数据新鲜——过时的 Complication 会损害用户信任。
- **W-CP-04**：Complication 内容必须在没有上下文的情况下仍具有明确含义。用户扫一眼表盘时，应立即理解数据的含义（例如使用“72F”，而不是“72”）。
- **W-CP-05**：轻点 Complication 时，必须在相关上下文中启动应用，而不能仅打开应用的根视图。

**正确示例 — 用于 `accessoryCircular` 复杂功能的 WidgetKit TimelineProvider：**
```swift
struct StepCountProvider: TimelineProvider {
    func placeholder(in context: Context) -> StepEntry {
        StepEntry(date: Date(), steps: 5000)
    }

    func getSnapshot(in context: Context, completion: @escaping (StepEntry) -> Void) {
        completion(StepEntry(date: Date(), steps: HealthStore.shared.todaySteps))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StepEntry>) -> Void) {
        let entry = StepEntry(date: Date(), steps: HealthStore.shared.todaySteps)
        // Refresh in 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }
}

struct StepCountComplicationView: View {
    let entry: StepEntry

    var body: some View {
        Gauge(value: Double(entry.steps), in: 0...10000) {
            Image(systemName: "figure.walk")
        } currentValueLabel: {
            Text("\(entry.steps / 1000)k")
        }
        .gaugeStyle(.accessoryCircular)
    }
}
```

### 复杂功能系列参考

使用 `WidgetFamily` 值：

| 系列 | 形状 | 典型内容 |
|--------|-------|-----------------|
| `accessoryCircular` | 小圆形 | 单个数值、图标或仪表 |
| `accessoryCorner` | 顶部角落的弧形区域 | 带标签的仪表，或带图标的文本 |
| `accessoryRectangular` | 宽矩形 | 多行文本、图表或详细视图 |
| `accessoryInline` | 文本行 | 简短标签或数值 |

### 反模式

- 仅支持一个复杂功能系列
- 数据长时间不更新
- 点击复杂功能后进入通用的 App 主页，而不是相关内容
- 复杂功能在着色模式下难以辨认（对比度不足）

---

## 5. 始终显示（中等）

当用户手腕垂下时，watchOS 会进入始终显示状态，展示当前 App 的调暗版本。必须有意识地处理此状态。

### 规则

- **W-AO-01**：在始终显示状态下降低视觉复杂度。移除动画、次要 UI 元素和非必要细节。仅保留最关键信息。
- **W-AO-02**：在调暗状态下隐藏敏感或私密数据（例如消息内容、健康详情和财务信息）。使用经过隐去处理的内容或占位内容。
- **W-AO-03**：降低始终显示状态下的更新频率。显示内容每分钟最多更新一次。对于时间敏感的内容，使用采用 `.everyMinute` 调度的 `TimelineView`。
- **W-AO-04**：使用系统提供的调暗行为。不要实现自定义调暗。系统会自动降低亮度，并且可以应用色调。确保内容在较低亮度下仍清晰可辨。
- **W-AO-05**：同时测试活跃状态和始终显示状态。状态之间的过渡必须流畅无缝——抬起手腕时，布局不应发生偏移或跳动。

### 反模式

- 在活跃状态和始终显示状态下展示相同的 UI（浪费电量，并且可能暴露私密数据）
- 在始终显示状态下使用动画或频繁更新
- 在活跃状态和调暗状态之间转换时发生布局偏移
- 忘记隐去敏感信息

---

## 6. 体能训练与健康（中等）

体能训练和健康类 App 有其独特要求：长时间会话、实时指标和身体感知功能。

### 规则

- **W-WK-01**：使用大号、高对比度文本显示实时体能训练指标。心率、时长、距离和卡路里应确保用户在运动过程中无需停下即可轻松读取。
- **W-WK-02**：为里程碑事件（完成一圈、达成目标、心率区间变化）使用触觉反馈。触觉反馈至关重要，因为用户运动时可能没有在看屏幕。
- **W-WK-03**：为适用的体能训练类型（跑步、步行）支持自动暂停检测。用户期望在停止移动时暂停体能训练，并在重新开始移动时恢复。
- **W-WK-04**：在游泳训练期间启用 WaterLock。此功能会停用触摸屏，以防止水造成误操作。使用 Digital Crown 排水并解锁。
- **W-WK-05**：体能训练结束时显示清晰的摘要屏幕，其中包含关键指标。允许用户通过单次操作保存或丢弃此次体能训练。

### 反模式

- 指标文本过小，用户必须眯眼或停下来才能阅读
- 重要体能训练事件缺少触觉反馈
- 户外体能训练不支持自动暂停
- 需要复杂交互才能结束或保存体能训练

---

## 7. 通知（中等）

Watch 通知必须简短且可操作。用户抬腕查看的时间只有一瞬间。

### 规则

- **W-NT-01**：设计 Short Look 通知时，仅包含标题、App 图标和 App 名称。这是用户最初抬腕时看到的内容。它必须立即传达通知的目的。
- **W-NT-02**：设计 Long Look 通知时，提供完整内容以及最多 4 个操作按钮。用户持续查看通知即可进入 Long Look。将最实用的操作直接包含在通知中。
- **W-NT-03**：使用适当的触觉通知类型。根据紧急程度进行匹配：标准提醒使用 `.notification`，积极事件使用 `.directionUp`，消极事件使用 `.directionDown`，操作结果使用 `.success`/`.failure`/`.retry`。
- **W-NT-04**：不要过度发送通知。过多通知会导致用户将其完全关闭。合并非紧急更新。仅将 Watch 通知用于时效性强或可操作的信息。

### 触觉类型参考

| 触觉类型 | 使用场景 |
|--------|----------|
| `.notification` | 一般提醒 |
| `.directionUp` | 积极事件（达成目标、股价上涨） |
| `.directionDown` | 消极事件（股价下跌、天气警告） |
| `.success` | 操作成功完成 |
| `.failure` | 操作失败 |
| `.retry` | 提示重试 |
| `.start` | 活动开始 |
| `.stop` | 活动结束 |
| `.click` | 离散选择（Crown 阻尼点、选取器） |

### 反模式

- 将每一条 iPhone 通知都发送到 Watch
- 通知中没有可操作按钮（迫使用户启动 App）
- 无论通知内容如何，都使用相同的触觉类型
- 通知文本过长，需要大量滚动才能阅读

---

## 8. 辅助功能（关键）

Apple Watch 支持 VoiceOver 和其他辅助技术。复杂功能和 App UI 必须具备无障碍支持。

### 规则

- **W-AC-01**：每个交互元素都必须具有含义明确的无障碍标签。SF Symbol 名称不足以作为标签。对于仅包含图像的按钮，请使用 `.accessibilityLabel()`。
- **W-AC-02**：VoiceOver 必须能够导航 App 的所有内容。不要在无障碍层级结构中隐藏关键信息。
- **W-AC-03**：为自定义控件（例如仪表、进度指示器、自定义选择器）提供无障碍值和提示。使用 `.accessibilityValue()` 和 `.accessibilityHint()`。
- **W-AC-04**：遵循“减弱动态效果”设置。启用该设置时，应禁用装饰性动画或使用其他效果替代。使用 `@Environment(\.accessibilityReduceMotion)`。
- **W-AC-05**：响应“粗体文本”设置。当用户启用“粗体文本”时，自定义文本必须相应调整。SwiftUI 动态字体会自动处理这一点；自定义绘制的文本必须检查 `@Environment(\.legibilityWeight)`。
- **W-AC-06**：响应“增强对比度”设置。当用户启用“增强对比度”时，自定义颜色必须提供对比度更高的变体。使用 `@Environment(\.colorSchemeContrast)` 检测用户的偏好设置。

**正确：**
```swift
Button(action: startWorkout) {
    Image(systemName: "play.fill")
}
.accessibilityLabel("Start workout")
```

**错误：**
```swift
Button(action: startWorkout) {
    Image(systemName: "play.fill")
}
// VoiceOver reads "play" — not clear what action this performs
```

### 反模式

- 仅包含图像但没有无障碍标签的按钮
- 没有无障碍值或提示的自定义控件
- 不遵循“减弱动态效果”设置的动画
- 在无障碍树中隐藏视力正常用户可以看到的内容

---

## 评估检查清单

评审 watchOS 设计或实现时，请使用此检查清单。

### 一目了然
- [ ] 用户能否在 2 秒内理解主要内容？
- [ ] 最重要的信息是否无需滚动即可看到？
- [ ] 正文字号是否至少为 16pt，并具有足够的对比度？
- [ ] 交互是否能在 5 秒内完成？

### 数码表冠
- [ ] 表冠能否滚动垂直内容？
- [ ] 数值选择器是否提供分段触感反馈？
- [ ] 是否不存在与系统表冠行为的冲突？

### 导航
- [ ] 启动后是否能在 1 次轻点内访问主要操作？
- [ ] 导航层级是否不超过 3 层？
- [ ] 每个推入的视图是否都有返回按钮？
- [ ] 顶层部分是否使用 TabView 进行组织（如适用）？

### 复杂功能
- [ ] 是否支持多种复杂功能系列？
- [ ] 复杂功能在着色模式和全彩模式下是否都能正常显示？
- [ ] 复杂功能数据是否通过 TimelineProvider 更新？
- [ ] 轻点复杂功能是否会打开相关上下文？

### 始终显示
- [ ] 敏感数据是否会在变暗状态下隐藏？
- [ ] 非活跃状态下是否会降低视觉复杂度？
- [ ] 更新频率是否限制为每分钟一次或更低？
- [ ] 活跃状态与变暗状态之间的过渡是否无缝（没有布局偏移）？

### 体能训练
- [ ] 实时指标是否以大号、高对比度文本显示？
- [ ] 是否在达到里程碑时使用触觉反馈？
- [ ] 是否为适用的体能训练类型提供自动暂停功能？
- [ ] 是否可以通过单次操作访问体能训练摘要？

### 通知
- [ ] 短视图是否信息明确（标题 + 图标）？
- [ ] 长视图是否包含内联操作？
- [ ] 触觉反馈类型是否与通知的紧急程度相匹配？
- [ ] 通知频率是否适当（不过于频繁）？

### 辅助功能
- [ ] 所有交互元素是否都有含义明确的辅助功能标签（不使用原始 SF Symbol 名称）
- [ ] 自定义控件是否通过 `.accessibilityValue()` / `.accessibilityHint()` 提供辅助功能值和提示
- [ ] VoiceOver 是否可以浏览应用中的所有内容——没有任何必要内容被隐藏在辅助功能树之外
- [ ] 动画是否遵循“减弱动态效果”设置（`@Environment(\.accessibilityReduceMotion)`）
- [ ] 是否遵循“粗体文本”偏好设置（SwiftUI 会自动处理；自定义文本需检查 `@Environment(\.legibilityWeight)`）
- [ ] 是否遵循“增强对比度”偏好设置（自定义颜色需提供对比度更高的变体）