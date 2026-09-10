---
name: expo-animation
description: Framework (OSS). Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs on, which properties, spring or timing, how the gesture hands off, how it degrades. Writes the implementation with Reanimated, Gesture Handler, Expo Router and expo-haptics. Use when animating anything in an Expo app, adding gestures, sheets, screen transitions, press feedback or haptics, or fixing motion that stutters on device. For web animation use `animate`.
version: 1.0.0
license: MIT
---
# 在 Expo 中构建动画

这项技能是在 [Emil Kowalski](https://github.com/emilkowalski) 的协作下创建的，也可以在 [emilkowalski/skills](https://github.com/emilkowalski/skills) 仓库中找到，其中还包含其他实用的动画技能。

这是一项面向 React Native 的构建技能。它会将动效需求转化为一种能够经受真实设备严格审查的实现——不是在模拟器上，也不是在开发模式下的旗舰手机上。

移动端会对动画产生三点影响，而这项技能中的一切都由此而来：

1. **不存在 hover。** Web 端通过 hover 提供的每一种可用性提示，都必须通过按压、位置或完全不提供来实现。
2. **存在两个运行时。** Worklets（Reanimated 4）明确体现了这一点：React Native 运行时负责 React 渲染和应用逻辑，UI 运行时负责每一帧运行 worklets（另外还可以选择使用 worker 运行时处理后台工作）。一旦动画触及 RN 运行时，只要应用同时执行其他工作就会出现卡顿。整个动画技术的核心，就是让动效保持在 UI 运行时中。
3. **用户的手指就在元素上。** 手势是主要输入方式，因此可中断性和速度衔接不是锦上添花，而是基础要求。

## 工作立场

你是一名亲自构建动画的资深移动端工程师。做出决定，用一句话说明理由，然后编写代码。绝不要把动效方案列成菜单供人选择。

有两种失败模式，其中第一种更糟：

1. **为不该动的东西添加动画。** 下面的门槛有时就是为了让最终完全不产生代码。
2. **动画对象正确，但运行在线程错误**——每帧调用一次 `setState`、使用 `PanResponder`、制作动画 `height`。在开发模式下用你的手机看起来一切正常，但在三年前的 Android 设备上会掉到 20fps。

## 硬性规则

1. **按顺序执行流程。** 第 1 步和第 2 步会决定后续所有内容。
2. **使用 Reanimated，而不是核心 `Animated`。** 核心 `Animated` 无法在不跨越 bridge 的情况下由手势驱动，而 `useNativeDriver` 除了 transform 和 opacity 外拒绝处理任何属性。Reanimated worklets 运行在 UI 线程上，即使 JS 繁忙也能持续运行。
3. **不要使用近似值。** 曲线和弹簧配置均来自下方的表格。
4. **减少动效应与动画一起交付**，而不是后续再补。
5. **体验必须在你支持的最慢设备上的 release 构建中评估。** 除此之外都不算经过验证。

## 构建流程

### 1. 这应该添加动画吗？

| 频率 | 决策 |
| --- | --- |
| 每天 100 次以上——切换标签页、打开/关闭键盘、滚动、设置中的开关 | **不添加动画。** 使用平台默认行为，或什么都不做。在此停止。 |
| 每天数十次——按压反馈、列表导航、选择行 | 只能使用几乎无法察觉的动效：少于 150ms，或者不使用动效 |
| 偶尔——底部面板、模态框、toast、引导步骤 | 使用标准动画 |
| 很少/首次发生——成功状态、空状态插图、庆祝效果 | 将愉悦感预算用在这里 |

**标签页切换绝不滑动。** 标签页彼此平级，而不是层级关系——滑动会暗示并不存在的深度，而且用户每次会话要为此付出数十次代价。`animation: 'none'`。

如果请求未通过此关卡，请说明这一点，不要编写代码。

### 2. 用途是什么？

在继续之前，用一个词命名它：**反馈**、**空间一致性**、**状态指示**、**防止突兀变化**、**解释**，或**愉悦感**（仅限罕见级别）。

无法命名？不要构建它。

### 3. 选择工具：能满足需求的最廉价工具

从上往下查看；第一个符合条件的工具即停止。

| 需求 | 工具 |
| --- | --- |
| 无手势、由状态驱动的变化：按下、切换、颜色、值翻转 | **Reanimated CSS transition**（样式中的 `transitionProperty`） |
| 循环、多阶段，或在挂载时播放且没有状态变化 | **Reanimated CSS animation**（`animationName` keyframes） |
| 元素挂载或卸载，或列表重新布局 | **Layout animations**（`entering` / `exiting` / `itemLayoutAnimation`） |
| 手指会触碰的任何内容，或任何由滚动派生的内容 | **`useSharedValue` + `Gesture` + `useAnimatedStyle`** |
| 屏幕之间的切换 | **Expo Router 中的 Native stack options。** 永远不要手动实现 |
| 作为独立屏幕的 bottom sheet | **`presentation: 'formSheet'`**：它是真正的 UISheetPresentationController，免费且正确 |
| Tab bar | **`NativeTabs`**（来自 `expo-router/unstable-native-tabs`）：平台真正的 tab bar，包括其行为和过渡效果 |
| Context menu、按住预览 | **`Link.Menu` / `Link.Preview`**（Expo Router，仅限 iOS）：原生菜单和 peek，绝不要用 JS 重建 |
| 收缩为大标题的 Header | 原生 stack 上的 **`headerLargeTitleEnabled`**（仅限 iOS；`headerLargeTitle` 已弃用）：不要使用滚动 worklet |
| 下拉刷新 | **`RefreshControl`**：只有在这是标志性交互时才手动实现（参见 threshold recipe） |
| 跟随键盘的 UI | **`react-native-keyboard-controller`**：键盘在 UI 线程上逐帧的真实位置 |
| 矢量插图、庆祝效果、空状态 | **Lottie**：仅用于插图，绝不要用于 UI 状态 |
| 大型动画场景、自由绘制 | **`@shopify/react-native-skia`**：一个 canvas，适用于视图层级本身成为瓶颈的情况 |

仅当值是连续的或可中断的时，才使用 shared value。按下缩放属于 CSS transition；拖动属于 shared value。为一个两状态切换开关使用 worklet，就像为了实现淡入淡出而在移动端安装一个动效库一样。

**依赖项。** 使用 `npx expo install <package>` 安装：它会解析与项目 SDK 匹配的版本，而直接执行 `npm install` 不会：

| 需求 | 包 |
| --- | --- |
| 动画 | `react-native-reanimated` + `react-native-worklets` |
| 手势 | `react-native-gesture-handler` |
| 导航、sheets、原生 tabs、菜单 | `expo-router` |
| 触觉反馈 | `expo-haptics` |
| 跟随键盘的 UI | `react-native-keyboard-controller`（需要在根部使用 `KeyboardProvider`，参见 keyboard recipe） |
| 插图、庆祝效果 | `lottie-react-native` |
| 超大型动画场景、自定义绘制 | `@shopify/react-native-skia` |

### 4. 选择属性

- **`transform` 和 `opacity` 不会触发布局。** 其他属性都会触发布局计算。`width`、`height`、`margin`、`padding`、`flex`、`top`、`left`、`gap` 会在每一帧为该节点*及其兄弟节点*重新运行 Yoga。
- **唯一的例外：没有子节点的绝对定位元素** —— 标签胶囊、进度条填充等。它脱离了布局流，因此不会导致其他元素重新布局；为 `width` 添加动画还能保留圆角半径，而使用 `scaleX` 会使圆角变形。
- **永远不要使用 `scale(0)`。** 从 `scale(0.9–0.97)` + `opacity: 0` 开始。现实世界中的事物不会凭空出现。
- **`transform` 是一个数组，顺序很重要** —— `[{ translateY }, { scale }]` 会先移动再缩放；反过来时，translate 也会被缩放。除非你确实需要这种乘法效果，否则应将 translate 放在前面。
- **Android 阴影使用 `elevation`，而为 elevation 添加动画会在每一帧重新渲染阴影。** 改为为预先添加阴影的图层设置 opacity 动画。
- **永远不要为 `BlurView` 的 intensity 添加动画。** 在 Android 上，这会导致每一帧重新渲染模糊效果。改为对静态 `BlurView` 的 opacity 做交叉淡化。
- **百分比可用于 `translate`**，并且相对于元素自身的尺寸 —— `translateY('100%')` 会将一个面板移动其自身高度的距离，无论其内容是什么。

### 5. 使用 timing 还是 spring

**如果交互中涉及手指，就使用 spring。** 手指动作被打断时，spring 会保留速度；timing 曲线则会重新开始。其他情况都使用 timing。

Reanimated 的 spring 直接使用 Apple 提供的两个设计参数 —— 使用以下形式，不要使用 mass/stiffness/damping：

| 交互 | 配置 |
| --- | --- |
| 默认稳定，无超调 | `{ duration: 400, dampingRatio: 1 }` |
| 拖动后的重新定位 / 弹回 | `{ duration: 400, dampingRatio: 0.8, velocity }` |
| 面板、抽屉 | `{ duration: 300, dampingRatio: 0.8, velocity }` |
| 不得越过硬边界 | 添加 `overshootClamping: true` |

**只有当手势带有动量时才使用回弹。** 淡入的菜单出现超调会让人感觉不对；快速甩动的卡片出现超调则很自然。

**Easing**，用于所有没有手指参与的情况：

| 情况 | Easing |
| --- | --- |
| 进入或退出 | `ease-out` |
| 在屏幕上移动 / 变形 | `ease-in-out` |
| 匀速运动（进度、跑马灯） | `linear` |
| 默认 | `ease-out` |

**永远不要在 UI 中使用 `ease-in`。** 它会从缓慢开始，延后用户正在关注的准确时刻。Reanimated 内置的曲线和 CSS 的一样不够理想 —— 使用以下曲线：

```js
import { Easing } from 'react-native-reanimated';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // strong ease-out for UI
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // on-screen movement
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);    // iOS sheet curve
```

**持续时间：**

| 元素 | 持续时间 |
| --- | --- |
| 按下反馈 | 100–150ms |
| 开关、标签、小型状态变化 | 150–200ms |
| 面板、模态框、抽屉 | spring，感知时长约 300ms |
| 屏幕过渡 | 平台默认值 —— 不要覆盖它 |

移动端 UI 动画应保持在 300ms 以内，与 Web 相同。平台自身的过渡时间更长（iOS push 为 350ms）；导航应遵循平台标准，其他地方则应比它更迅速。

### 6. 避免占用 JS 线程

这是移动端特有的要点，也是大多数 React Native 动效失效的地方。

- **永远不要在手势或滚动处理器中调用 `setState`。** 每帧触发一次 React 渲染，是 RN 应用卡顿的最大原因。使用 Shared Value → `useAnimatedStyle`，React 完全不会重新渲染。
- **永远不要在 `onUpdate` 或滚动处理器中调度回 RN runtime。** `react-native-worklets` 中的 `scheduleOnRN(fn, ...args)` 是已弃用的 `runOnJS(fn)(...args)` 在 Reanimated 4 中的替代方案，它会将一次 RN runtime 调用加入队列，而在 `onUpdate` 中，这种调用频率是每秒 60–120 次。它应该放在 `onEnd` 中，或者放在值跨过阈值时触发的 `useAnimatedReaction` 中。
- **永远不要在渲染期间读取 Shared Value**（例如 JSX 中的 `translateY.get()`）。它只是一个不会更新的快照，并且会静默地产生不同步。**渲染期间也不要写入 Shared Value**——它会在协调过程中途触发写入，而一次并非由你触发的重新渲染会再次执行这次写入。只在 worklet、处理器和 effect 中访问 Shared Value。
- **使用 `.get()` / `.set()`，不要使用 `.value`。** API 相同，但直接访问 `.value` 是 React Compiler 无法识别的形式——Reanimated 文档将 `get`/`set` 称为对编译器安全的方式。`set` 还支持函数式更新：`sv.set((v) => v + 1)`。
- **从 worklet 调用的函数需要将 `'worklet'` 作为第一行代码，**否则它在调试器中运行正常，但在设备上会在运行时抛出异常。

### 7. 使用按压，而不是悬停

Web 上的每一种悬停交互都必须重新设计，不能直接移植。

- **按下时提供反馈，松开时提交操作。** 等待点击完成后才显示任何反馈会让交互显得迟钝——这正是用户实际感知到的延迟。
- **对任何类似按钮的可按压元素，在 100–150ms 内将 `scale` 设置为 `0.97`，**使用 `Pressable` + CSS transition。`scale` 会带着标签和图标一起缩放，这正是它呈现出实体感的原因。全宽列表行是例外：它们应改为高亮背景，因为缩放列表行会让人感觉整个屏幕都在挤压。
- **触控目标最小尺寸为 44×44pt**（Android 为 48dp）。如果视觉元素更小，请添加 `hitSlop`——不要放大视觉元素。
- **使用 `pressRetentionOffset`，**这样手指偏移几像素时不会取消用户原本想要执行的按压。
- **仅在采用 Material 风格的应用中使用 Android ripple。** 在自定义设计的应用中，两端使用相同的缩放效果，比只在一个平台上使用 ripple 更协调。

### 8. 触觉反馈

移动端拥有 Web 所没有的一种感知。适度使用，它会成为让应用显得高品质的关键；到处使用，用户就会将其关闭。

| 时机 | 调用 |
| --- | --- |
| 数值越过一个步进值——选择器、滑块卡点、分段控件 | `Haptics.selectionAsync()` |
| 某个元素回到初始位置、面板卡点卡住、拖动操作提交 | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` |
| 重物落下、破坏性操作触发 | `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` |
| 操作成功或失败 | `Haptics.notificationAsync(NotificationFeedbackType.Success / Error)` |

三条规则，而且绝对不能违背：

- **与视觉效果处于同一时刻。** 如果触觉反馈落后于动画，读起来就像故障，而不是反馈。应在因果时刻触发，也就是卡点扣入的瞬间，而不是动画结束时。
- **每次用户操作只触发一次。** 滚动时绝不触发，绝不每帧触发，也绝不为用户未触发的入场动画触发。
- **绝不能是唯一的反馈。** 许多用户在系统层面关闭了触觉反馈，而且大多数 Android 设备上都没有声音。视觉效果必须能够独立传达信息。

在 worklet 中，必须将触觉反馈调度回 RN runtime：`scheduleOnRN(Haptics.selectionAsync)`。

### 9. 减少动效与无障碍

```jsx
import { useReducedMotion, ReduceMotion, withSpring } from 'react-native-reanimated';

const reduced = useReducedMotion();
const y = useSharedValue(reduced ? 0 : SHEET_HEIGHT);

// or let each animation decide
withSpring(0, { duration: 300, dampingRatio: 0.8, reduceMotion: ReduceMotion.System });
```

减少动效意味着**更少、更柔和**，而不是完全没有：保留能够解释状态变化的透明度和颜色变化，移除位移、缩放、视差和过冲。屏幕过渡改为 `animation: 'fade'`。

**文本缩放。** `allowFontScaling` 默认启用，因此在默认字体大小下测量的任何高度，在 200% 缩放时都会失效。绝不要动画到硬编码的高度，应使用 `onLayout` 进行测量，或改为动画变换。

## 会悄悄破坏动效的设置

当“动画就是不运行”时，先检查这些内容：

- 通过 Expo 安装，以确保版本与 SDK 匹配：`npx expo install react-native-reanimated react-native-worklets`。在 Expo 项目中，`babel-preset-expo` 会自动配置 worklets Babel 插件，不需要进行 `babel.config.js` 配置。只有不使用该 preset 的裸 RN 项目才需要手动添加插件，并且插件必须位于列表末尾。缺少插件或插件位置错误时，现在不会再静默回退，而是会在运行时抛出 `Failed to create a worklet`。
- `GestureHandlerRootView` 必须包裹整个应用，否则手势不会生效且不会报错。
- Reanimated 4 要求启用新架构。
- **Expo Go 不是性能评估环境。** 应在 release 构建中评估交互感受；开发构建中的 JS 线程速度足够慢，反而会掩盖你正在寻找的问题。

## 120fps

在支持 ProMotion 的 iPhone 上，除非设置了 `CADisableMinimumFrameDurationOnPhone`，否则第三方动画的帧率会被限制在 60fps。近期的 Expo SDK 默认会设置它，请确认该配置存在，如果没有则添加：

```json
{ "expo": { "ios": { "infoPlist": { "CADisableMinimumFrameDurationOnPhone": true } } } }
```

此时每帧预算是 8ms，而不是 16ms。这也是 UI 线程动画相比 Web 动画在移动端更重要的原因。

## 配方

如需可直接构建的实现方案，包括按压反馈、拖动关闭的 sheet、滑动删除、可折叠标题栏、列表入场动画、与键盘同步的 UI、标签页指示器和屏幕过渡，请参阅 [RECIPES.md](RECIPES.md)。当请求匹配其中一项时，加载该文件；应从对应配方开始，而不是从空白文件开始。

## 绝不发布

| 绝不使用 | 改用 |
| --- | --- |
| `PanResponder` | gesture-handler 中的 `Gesture.Pan()` |
| 在手势或滚动处理器中使用 `setState` | shared value + `useAnimatedStyle` |
| `runOnJS`（在 Reanimated 4 中已弃用） | 来自 `react-native-worklets` 的 `scheduleOnRN` |
| 每帧调用 `scheduleOnRN` | `onEnd`，或在达到阈值时使用 `useAnimatedReaction` |
| 在渲染期间读取或写入 shared value | 在 worklets、处理器和 effects 中使用 `.get()` / `.set()` |
| 对任何手指会触碰的内容使用 Core `Animated` | Reanimated |
| 为 `height` / `width` / `margin` / `flex` / `top` 添加动画 | `transform` + `opacity`（绝对定位且无子元素的元素除外） |
| 为 `BlurView` 的强度或 Android 的 `elevation` 添加动画 | 对静态层进行交叉淡化 |
| 在虚拟化列表行上使用 `entering` | 对容器添加动画，或使用 `itemLayoutAnimation` |
| 在 JS 中重建屏幕过渡 | 原生 stack 的 `animation` |
| 在标签页之间滑动 | `animation: 'none'` |
| 在 UI 元素上使用 `Easing.in(...)` | `Easing.bezier(0.23, 1, 0.32, 1)` |
| 使用 `scale(0)` 入场 | `scale(0.95)` + `opacity: 0` |
| 仅基于距离的关闭阈值 | 速度**或**距离，快速滑动一次就足够 |
| 在边界处硬停止 | 橡皮筋阻力 |
| 每帧触发触觉反馈，或将其作为唯一反馈 | 每次提交触发一次，并始终配合视觉反馈 |
| 在 Expo Go 或模拟器中评估交互感受 | release 构建，以及支持范围内性能最弱的设备 |

## 输出

编写代码。然后用不超过几行的篇幅说明：

- **门控结果**：频率层级和明确命名的用途。说明你拒绝了什么，以及原因。
- **组成要素**：工具、属性、弹簧或曲线 + 持续时间、线程。
- **需要在设备上进行的体感检查**：手势、速度交接和触觉时机无法仅凭代码判断。说明要尝试什么：快速滑动它、在运动过程中途打断、反向操作、在你拥有的最慢 Android 设备上运行。

代码才是交付物。不要把它扩写成报告。

## 语气

观点鲜明且简洁。当诚实的答案是“这里不应该有动画”，或“需要在真实设备上测试后，我才能判断它是否正确”时，就直说。

## 提交反馈
如果你在此技能中遇到错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-animation" "<actionable feedback>"
```
仅在你有具体且可执行的反馈时提交。尽可能包含相关上下文。
如果 AI agent 反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill，并按照其 eval-candidate 流程操作，而不是重复使用上面的命令。