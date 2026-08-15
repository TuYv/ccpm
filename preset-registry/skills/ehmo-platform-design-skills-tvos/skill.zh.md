---
name: tvos-design-guidelines
description: Apple Human Interface Guidelines for Apple TV. Use when building tvOS apps with focus-based navigation, Siri Remote input, or living room viewing experiences. Triggers on tasks involving Apple TV, tvOS, 10-foot UI, or media playback.
license: MIT
metadata:
  author: platform-design-skills
  version: "1.0.0"
---
# tvOS 设计指南

Apple TV 是一款客厅设备，完全依靠基于焦点的导航和 Siri Remote 进行操作。它没有指针、触摸屏和鼠标。每项设计决策都必须考虑 10 英尺的观看距离、遥控器的简洁性，以及电视消费场景中后仰放松的使用方式。

---

## 1. 基于焦点的导航（关键）

焦点系统是所有 tvOS 交互的基础。系统中没有光标 -- 用户通过 Siri Remote 的触控表面在元素之间移动焦点。

### 规则

**FOCUS-01：每个交互元素都必须具有清晰可见的焦点状态。**
获得焦点的项目必须与未获得焦点的项目形成明确无误的区别。可使用缩放（通常为 1.05x-1.1x）、通过阴影营造的抬升效果、亮度变化或边框高亮。切勿仅依赖颜色。

**FOCUS-02：焦点移动必须可预测，并遵循符合逻辑的空间布局。**
当用户向右轻扫时，焦点必须移动到视觉上位于右侧的元素。避免使用会导致焦点在屏幕上意外跳转的布局。网格布局和线性布局最为稳妥。

**FOCUS-03：使用焦点引导（UIFocusGuide）衔接布局中的间隙。**
当可聚焦元素之间存在视觉间隙时，应添加不可见的焦点引导，以免用户受困。每次轻扫都应将焦点移动到有意义的位置。

**FOCUS-04：为获得焦点的项目应用视差效果。**
获得焦点的卡片、海报和图标应呈现细微的视差倾斜，并响应触控表面的移动。使用包含前景、中景和背景图层的分层图像（LSR 格式）。这能够传达纵深感并确认焦点所在。

**正确：**
```swift
// SwiftUI — custom focus engine with explicit focus state
struct ContentView: View {
    @FocusState private var focusedItem: String?

    var body: some View {
        HStack(spacing: 40) {
            ForEach(items) { item in
                CardView(item: item)
                    .focusable()
                    .focused($focusedItem, equals: item.id)
                    .scaleEffect(focusedItem == item.id ? 1.1 : 1.0)
                    .shadow(radius: focusedItem == item.id ? 20 : 0)
                    .animation(.easeInOut(duration: 0.15), value: focusedItem)
            }
        }
    }
}
```

**错误：**
```swift
// SwiftUI — no focus state: unfocused and focused items look identical
struct ContentView: View {
    var body: some View {
        HStack(spacing: 40) {
            ForEach(items) { item in
                CardView(item: item)
                    .focusable()
                // No scale, shadow, or visual change on focus
                // User cannot tell which item is selected
            }
        }
    }
}
```

**FOCUS-05：确保焦点目标足够大，以便舒适地进行导航。**
建议卡片的最小触控目标尺寸为 250x150pt。使用基于轻扫的导航时，较小的元素很难准确聚焦。应尽可能将多个小型操作归入一个可聚焦的父元素下。

**FOCUS-06：在每个屏幕上提供默认获得焦点的元素。**
视图出现时，必须已有一个元素持有焦点。应根据用户最可能的意图进行选择 -- 通常是主要内容项目或集合中的第一个项目。

**FOCUS-07：返回某个屏幕时保留焦点记忆。**
如果用户离开后又返回，焦点应恢复到该屏幕上最后获得焦点的项目，而不是重置为默认项目。

**FOCUS-08：绝不要困住焦点。**
用户必须始终能够将焦点移出任何元素。如果焦点无法离开某个区域，应用会让人感觉出现了故障。

**FOCUS-09：降低重新定位的成本。**
保持行顺序稳定，返回时恢复之前的焦点，并优先选择附近的焦点目标，使用户不必在每次导航操作后重新浏览整个屏幕。

### 视差图层参考

| 图层 | 用途 | 移动幅度 |
|-------|---------|-----------------|
| 背景 | 静态背景、模糊图像 | 最小（1-2pt） |
| 中景 | 主要插图或内容图像 | 中等（3-5pt） |
| 前景 | 标题文本、徽标、徽章 | 最大（5-8pt） |

对于资源目录中的静态分层图像，请使用 Xcode 的 LSR（Layered Static Image）格式——系统会在图像获得焦点时自动为其添加动画。对于自定义的编程式视差效果，请堆叠 `UIImageView` 实例，并使用焦点引擎回调（`didUpdateFocus(in:with:)` 和 `UIFocusAnimationCoordinator`）在焦点转换期间驱动图层移动。（`UIMotionEffect` 仅响应 Siri Remote 遥控器陀螺仪细微的微运动，并非实现焦点驱动视差效果的机制。）

---

## 2. Siri Remote 遥控器（关键）

Siri Remote 遥控器是主要的输入设备（通常也是唯一的输入设备）。它配有触控表面、菜单按钮、播放/暂停按钮、Siri/麦克风按钮、音量按钮和电源按钮。

### 规则

**REMOTE-01：通过在触控表面轻扫来控制焦点移动。**
轻扫会使焦点向相应方向移动。点按触控表面会选择当前获得焦点的项目。这是两种最基本的交互方式——所有设计都应围绕它们展开。

**REMOTE-02：菜单按钮必须始终用于返回导航。**
按下菜单按钮应关闭当前屏幕、关闭叠加层或返回层级结构的上一级。在顶层，它会返回 Apple TV 主屏幕。绝不要违背这一使用预期。

**REMOTE-03：播放/暂停按钮必须控制媒体播放。**
如果媒体正在播放，无论当前显示哪个屏幕，播放/暂停按钮都应切换播放状态。不要将此按钮改作非媒体操作。

**REMOTE-04：绝不要要求复杂手势或多指手势。**
Siri Remote 遥控器的触控表面很小。不要要求捏合、旋转、多次点按或长按手势。仅使用单指轻扫和点按。

**REMOTE-05：轻扫方向必须直观且一致。**
水平轻扫用于水平滚动；垂直轻扫用于垂直滚动。绝不要反转轴向。对角线方向的内容移动应遵循占主导地位的轻扫轴向。

**REMOTE-06：支持使用 Siri 语音输入进行搜索和文本输入。**
在 tvOS 上使用屏幕键盘输入文本非常繁琐。应始终支持听写和 Siri 搜索，将其作为键盘输入的替代方式。

**REMOTE-07：提供点按反馈。**
当用户点按触控表面选择项目时，应立即提供视觉反馈（动画、高亮变化或类似触觉反馈的视觉脉冲），让点按操作显得响应迅速。

**REMOTE-08：绝不要让屏幕键盘成为唯一实用的文本输入方式。**
对于搜索、登录和设置流程，应优先采用听写、最近查询、自动填充或基于短代码的流程，而不是使用遥控器输入长文本。使用遥控器输入文本会带来较高的操作和认知成本。

---

## 3. 10 英尺 UI（高优先级）

用户通常会在房间另一端观看 Apple TV 内容，与屏幕的距离一般为 8-12 英尺（2.5-3.5 米）。所有视觉设计都必须考虑这一观看距离。

### 规则

**DISTANCE-01：正文文本的最小字号为 29pt。**
小于 29pt 的文本在客厅观看距离下会难以阅读。标题应为 48pt 或更大。使用 San Francisco Display 或具有类似高可读性的字体。

**DISTANCE-02：保持文本与背景之间的高对比度。**
默认使用深色背景上的浅色文本。tvOS 采用深色主题。对比度应达到 WCAG AA 或更高级别（正文文本为 4.5:1，大号文本为 3:1）。

**DISTANCE-03：限制每个屏幕上的文本量。**
电视是一种视觉媒介。应显示标题、简短说明和元数据，而不是段落。如果必须展示较长文本，请使用由用户明确打开的可滚动文本叠层。

**DISTANCE-04：使用醒目、清晰的高分辨率图像。**
全屏背景图像应为 1920x1080 或 3840x2160（4K）。内容图片应清晰且具有视觉吸引力。避免使用细节繁多的小型插图，因为它们在远距离观看时会失去清晰度。

**DISTANCE-05：保持布局简洁、宽松。**
使用充足的外边距和内边距。不要用大量小元素挤满屏幕。与包含 20+ 个缩略图的密集网格相比，包含 5-7 张卡片的单行布局更为合适。

**DISTANCE-06：使用电视安全区域。**
将所有关键内容保持在安全区域内（距离边缘 60pt）。由于过扫描，靠近屏幕边缘的内容在某些电视机上可能会被裁切。

**DISTANCE-07：避免使用细体字体和极细边框。**
细线条在电视显示器上会消失，尤其是在存在运动模糊和压缩伪影时。至少使用中等或半粗字重。

### 文本字号参考

| 元素 | 最小字号 | 推荐字号 |
|---------|-------------|-----------------|
| 正文文本 | 29pt | 31-35pt |
| 次要标签 | 25pt | 29pt |
| 标题 | 48pt | 52-76pt |
| 大标题 | 64pt | 76-96pt |
| 按钮 | 29pt | 35-38pt |

---

## 4. Top Shelf（高优先级）

Top Shelf 是用户在 Apple TV 主屏幕上聚焦你的应用图标时显示的醒目内容区域。它是展示内容的黄金位置。

### 规则

**SHELF-01：提供 Top Shelf 扩展。**
应用应包含一个返回动态内容的 `TVTopShelfContentProvider`（tvOS 14+）。自 tvOS 14 起，`TVTopShelfProvider` 已被弃用——请勿使用。静态 Top Shelf 会错失提升用户参与度的机会。

**SHELF-02：为你的内容使用正确的布局样式。**
- **嵌入式横幅**：1 个获得焦点的大型项目，两侧各有较小的项目。最适合精选或编辑推荐内容。
- **分区内容**：按类别分组的多行可滚动项目。最适合媒体库。

**SHELF-03：Top Shelf 项必须深度链接至 App 内部。**
选中每个项目时，必须打开对应的内容。切勿将所有项目都链接到同一个通用落地页。

**SHELF-04：使用高质量且引人入胜的图像。**
Top Shelf 图像会以较大尺寸显示在主屏幕上。模糊、低分辨率或包含大量文字的图像会显得不专业。推荐的图像尺寸：
- 内嵌横幅：1940x624pt (@1x) 或 3880x1248pt (@2x)
- 分区项目：404x608pt (@1x)

**SHELF-05：保持 Top Shelf 内容新鲜。**
定期更新 Top Shelf 内容——最好展示最近添加、当前热门或个性化的内容。陈旧的 Top Shelf 内容会让人觉得 App 已无人维护。

---

## 5. 媒体与播放（中等）

Apple TV 主要是一款媒体消费设备。播放界面必须遵循既有的电视端惯例。

### 规则

**MEDIA-01：使用标准播放控制项。**
提供播放、暂停、快进（10 秒）、快退（10 秒）以及时间轴拖动条。使用 `AVPlayerViewController` 即可直接获得这些控制项，并确保行为一致。

**MEDIA-02：播放期间向下轻扫时显示信息叠层。**
播放期间向下轻扫应显示一个信息面板，其中包含标题、描述和元数据。再次向下轻扫或按下 Menu 键可将其关闭。

**MEDIA-03：支持通过触控表面拖动播放进度。**
播放期间在触控表面上向左或向右轻扫，应可沿时间轴拖动播放进度。条件允许时，在拖动过程中显示缩略图预览。

**MEDIA-04：支持字幕和备选音轨。**
通过信息叠层或标准播放器控制项，提供字幕选择和音轨切换功能。

**MEDIA-05：在适当情况下支持画中画。**
对于视频内容，应支持 PiP，让用户可以在观看视频的同时浏览其他内容。实现 `AVPictureInPictureController` 集成。

**MEDIA-06：记住播放位置。**
当用户返回之前观看过的内容时，从上次停止的位置继续播放。在内容缩略图上显示进度指示器。

**MEDIA-07：妥善处理中断。**
如果用户在播放期间按下 TV 键或切换 App，应保存播放位置并平稳暂停。当用户返回时，无需重新缓冲即可恢复播放。

---

## 6. 标签栏（中等）

tvOS 标签栏位于屏幕顶部，这与标签栏位于底部的 iOS 不同。它用于在 App 的各个主要分区之间导航。

### 规则

**TAB-01：将标签栏放置在屏幕顶部。**
这是标准的 tvOS 惯例。底部标签栏属于 iOS 模式，在电视端会显得不自然。

**TAB-02：标签栏应采用半透明样式并叠加在内容上方。**
标签栏通过模糊效果悬浮在内容上方。当用户将焦点移至标签栏时，内容会向下移动以腾出空间。

**TAB-03：使用 3-7 个标签页。**
少于 3 个标签页，说明 App 过于简单，不适合采用标签导航。多于 7 个标签页，则难以通过水平轻扫进行导航。

**TAB-04：每个标签页都必须包含文本标签。**
在电视观看距离下，仅使用图标的标签页无法充分传达信息。为确保清晰易懂，必须提供文本标签。图标可以与文本搭配使用，但并非必需。

**TAB-05：聚焦标签栏时应感觉轻盈。**
当焦点移至标签栏时，标签栏应平滑显示。透过半透明栏应能看到下方的内容预览。切换标签页时，应立即更新下方内容或显示加载状态。

**TAB-06：在应用多次启动之间记住所选标签页。**
如果用户离开应用时位于“Search”标签页，那么当他们重新打开应用时，应返回“Search”标签页。

---

## 7. 辅助功能（关键）

Apple TV 支持 VoiceOver。视力正常的用户使用焦点导航；VoiceOver 用户还会听到语音描述。两者都必须正常工作。

### 规则

**ACCESS-01：每个交互元素都必须具有含义明确的辅助功能标签。**
仅包含图标的按钮和图片卡片必须具有标签。当焦点到达时，VoiceOver 会读出获得焦点的项目名称。

**ACCESS-02：为不明显的交互提供辅助功能提示。**
如果轻点卡片执行的操作不是打开内容（例如，启动预告片而不是完整播放），应使用辅助功能提示对此进行说明。

**ACCESS-03：确保 VoiceOver 焦点顺序与视觉焦点顺序一致。**
VoiceOver 必须按照焦点引擎导航所生成的相同顺序遍历元素。通过 `UIFocusGuide` 自定义焦点顺序时，不得造成 VoiceOver 朗读顺序不连续。

**ACCESS-04：遵循“减弱动态效果”设置。**
当用户在辅助功能设置中启用“减弱动态效果”时，必须减弱或禁用视差效果及其他动画。

**ACCESS-05：响应“粗体文本”设置。**
当用户启用“粗体文本”时，自定义渲染的文本必须相应调整。SwiftUI 动态字体样式会自动处理此设置；自定义文本渲染必须检查 `UIAccessibility.isBoldTextEnabled` 或使用 `@Environment(\.legibilityWeight)`。

**ACCESS-06：响应“增强对比度”设置。**
当用户启用“增强对比度”（加深系统颜色）时，自定义颜色必须提供对比度更高的变体。在 SwiftUI 中使用 `@Environment(\.colorSchemeContrast)`，或在 UIKit 中使用 `UIAccessibility.isDarkerSystemColorsEnabled` 来检测该设置并应用适当的值。

**ACCESS-07：遵循动态字体/更大字体设置。**
tvOS 通过 `UIContentSizeCategory` 支持“更大字体”辅助功能设置。使用 SwiftUI 语义文本样式（`Font.TextStyle`），使文本能够自动缩放。对于 UIKit，使用 `UIFontMetrics` 相对于基础 `UIFont.TextStyle` 缩放自定义字体。

**正确：**
```swift
// SwiftUI — semantic text styles scale with Larger Text automatically
Text("Now Playing")
    .font(.title2)        // Scales with UIContentSizeCategory
Text("Episode description")
    .font(.body)          // Scales with UIContentSizeCategory

// UIKit — scale custom font with UIFontMetrics
let baseFont = UIFont(name: "CustomFont-Regular", size: 29)!
let scaledFont = UIFontMetrics(forTextStyle: .body).scaledFont(for: baseFont)
label.font = scaledFont
label.adjustsFontForContentSizeCategory = true
```

**错误：**
```swift
// SwiftUI — hardcoded size ignores Larger Text preference
Text("Now Playing")
    .font(.system(size: 29)) // Does not scale

// UIKit — hardcoded font ignores UIContentSizeCategory
label.font = UIFont(name: "CustomFont-Regular", size: 29)
// Missing adjustsFontForContentSizeCategory = true
```

---

## 评估检查清单

在审查 tvOS 应用的设计或实现时，请使用此检查清单。

### 焦点系统
- [ ] 每个交互元素都有可见且易于区分的焦点状态
- [ ] 焦点向各个方向的移动都符合预期
- [ ] 应用中任何位置都不存在焦点陷阱
- [ ] 使用焦点引导跨越布局间隙
- [ ] 内容卡片和图标应用了视差效果
- [ ] 每个屏幕都设置了默认焦点
- [ ] 返回上一页时保留焦点记忆

### Siri Remote
- [ ] 菜单按钮可在每个屏幕上返回上一页
- [ ] 播放/暂停按钮可全局控制媒体播放
- [ ] 无需执行复杂手势
- [ ] 点击反馈即时且清晰可见
- [ ] 文本输入支持 Siri/听写

### 10 英尺 UI
- [ ] 正文字号不小于 29pt
- [ ] 所有文本均具有高对比度
- [ ] 文本内容简洁，避免大段文字
- [ ] 图像分辨率高且视觉清晰
- [ ] 布局采用宽松的间距，并留有电视安全边距
- [ ] 不使用细体字体或极细描边

### Top Shelf
- [ ] Top Shelf 扩展提供动态内容
- [ ] 所有 Top Shelf 项目均可正确深度链接
- [ ] 图像质量高且尺寸正确
- [ ] 内容定期更新

### 媒体与播放
- [ ] 提供标准播放控制
- [ ] 可通过触控表面拖动定位播放进度
- [ ] 可访问字幕和音轨
- [ ] 记住播放位置
- [ ] 能妥善处理中断

### 标签栏
- [ ] 标签栏位于屏幕顶部
- [ ] 标签带有文本标签
- [ ] 使用 3–7 个标签
- [ ] 所选标签在应用重新启动后保持不变

### 辅助功能
- [ ] 每个交互元素和内容卡片都有含义明确的辅助功能标签
- [ ] 不明显的交互具有辅助功能提示
- [ ] VoiceOver 焦点顺序与视觉焦点引擎的顺序一致
- [ ] 启用“减弱动态效果”后，禁用视差效果和装饰性动画
- [ ] 遵循“粗体文本”偏好设置（SwiftUI 会自动处理；自定义文本需检查 `isBoldTextEnabled`）
- [ ] 遵循“增强对比度”偏好设置（自定义颜色需提供对比度更高的变体）
- [ ] 遵循“更大字体”（动态字体）偏好设置（在 SwiftUI 中使用 `Font.TextStyle`，或在 UIKit 中使用 `UIFontMetrics`）

---

## 电视端反模式

**不要**将移动端模式直接照搬到 tvOS。以下是常见错误：

| 反模式 | 失败原因 | 正确做法 |
|-------------|-------------|-----------------|
| 底部标签栏 | 属于 iOS 惯例；在电视上感觉不自然 | 使用顶部标签栏 |
| 小型触控目标 | 使用轻扫导航时无法精准选中 | 卡片最小尺寸为 250x150pt |
| 文本密集的屏幕 | 在 10 英尺距离外无法阅读 | 仅使用标题和简短描述 |
| 汉堡菜单 | 电视上不存在点击后展开的交互方式 | 使用标签栏或焦点驱动的菜单 |
| 下拉刷新 | Siri Remote 不支持下拉手势 | 自动刷新或提供明确的刷新按钮 |
| Toast 通知 | 在大尺寸电视屏幕上容易错过 | 使用模态提醒或常驻横幅 |
| 滚动指示器 | 细滚动条在远距离下不可见 | 使用内容露出效果（让下一项部分可见） |
| 双指缩放 | Siri Remote 无法执行多指手势 | 提供明确的缩放控件 |
| 长表单 | 在 tvOS 上使用键盘输入非常不便 | 预先填充、使用用户资料，或转移到 iPhone 上完成 |
| 细体/轻字重排版 | 在电视显示屏上难以辨认 | 至少使用中等字重 |