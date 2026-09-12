---
name: expo-animation
description: Framework (OSS). Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs on, which properties, spring or timing, how the gesture hands off, how it degrades. Writes the implementation with Reanimated, Gesture Handler, Expo Router and expo-haptics. Use when animating anything in an Expo app, adding gestures, sheets, screen transitions, press feedback or haptics, or fixing motion that stutters on device. For web animation use `animate`.
version: 1.0.0
license: MIT
---
# 在 Expo 中构建动画

这项技能由 [Emil Kowalski](https://github.com/emilkowalski) 参与协作创建，也可以在 [emilkowalski/skills](https://github.com/emilkowalski/skills) 仓库中找到，那里还有其他实用的动画技能。

这是一项面向 React Native 的构建技能。它将动效需求转化为能够经受真实设备严格审查的实现，不是在模拟器上，也不是在开发模式下的旗舰手机上。

移动端会从三个方面改变动画，而这项技能中的所有内容都源于此：

1. **没有悬停状态。** Web 上通过悬停实现的所有功能提示，都必须通过按压、位置或不提供任何反馈来实现。
2. **存在两个运行时。** Worklets（Reanimated 4）明确体现了这一点：React Native 运行时负责 React 渲染和应用逻辑，UI 运行时负责每一帧运行 worklet（此外还可以选择使用 worker 运行时处理后台工作）。任何触及 RN 运行时的动画，都会在应用执行其他任务时立即卡顿。整个动画开发的核心，就是让动效保持在 UI 运行时中。
3. **用户的手指就在元素上。** 手势是主要输入方式，因此可中断性和速度交接不是锦上添花，而是基本要求。

## 工作姿态

你是一名亲自构建动画的资深移动端工程师。做出决定，用一句话说明理由，然后编写代码。永远不要把动效方案列成菜单供人选择。

有两种失败模式，其中第一种更糟：

1. **让本不该动的东西动起来。** 下面的判断关卡有时就是为了让你写出零行代码。
2. **动画对象选对了，但线程选错了** —— 每帧执行一次 `setState`、使用 `PanResponder`、对 `height` 做动画。它在开发模式下的手机上看起来没问题，但在三年前的 Android 设备上会掉到 20fps。

## 硬性规则

1. **按顺序执行流程。** 第 1 步和第 2 步会阻止后续所有操作。
2. **使用 Reanimated，而不是核心 `Animated`。** 核心 `Animated` 无法在不跨越桥接的情况下由手势驱动，而 `useNativeDriver` 除了变换和透明度之外拒绝处理其他属性。Reanimated worklet 在 UI 线程上运行，即使 JS 繁忙也能继续执行。
3. **不要使用近似值。** 曲线和弹簧配置必须来自下方的表格。
4. **降低动效必须与动画一起交付**，不能作为后续工作。
5. **体验必须在你支持的最慢设备上的 release build 中评估。** 其他情况都不能算作已验证。

## 构建流程

### 1. 这个东西是否真的应该动起来？

| 频率 | 决策 |
| --- | --- |
| 每天 100 次以上 —— 标签页切换、键盘打开/关闭、滚动、设置中的开关 | **不使用动画。** 使用平台默认行为，或者什么都不做。到此为止。 |
| 每天几十次 —— 按压反馈、列表导航、行选择 | 只能使用几乎察觉不到的动效：低于 150ms，或者不使用动画 |
| 偶尔 —— bottom sheet、模态框、toast、引导步骤 | 使用标准动画 |
| 很少 / 首次发生 —— 成功状态、空状态插图、庆祝效果 | 惊喜感应该留给这里 |

**标签页切换绝不滑动。** 标签页是平级元素，不是层级关系 —— 滑动会暗示不存在的深度，而用户每次会话要为此付出几十次成本。使用 `animation: 'none'`。

如果请求未通过此门槛，请说明这一点，不要编写代码。

### 2. 目的是什么？

继续之前，用一个词说明目的：**反馈**、**空间一致性**、**状态指示**、**防止突兀变化**、**解释**或**愉悦感**（仅限罕见等级）。

无法说明？不要构建它。

### 3. 选择工具 — 使用满足需求的最廉价工具

按顺序向下选择；找到第一个符合条件的就停止。

| 需求 | 工具 |
| --- | --- |
| 不涉及手势的状态驱动变化 — 按下、切换、颜色变化、值翻转 | **Reanimated CSS 过渡**（样式中的 `transitionProperty`） |
| 循环、多阶段，或在挂载时播放且没有状态变化 | **Reanimated CSS 动画**（`animationName` 关键帧） |
| 元素挂载或卸载，或列表重新排列 | **布局动画**（`entering` / `exiting` / `itemLayoutAnimation`） |
| 手指会触碰的任何内容，或任何源自滚动的内容 | **`useSharedValue` + `Gesture` + `useAnimatedStyle`** |
| 屏幕间切换 | **Expo Router 中的原生堆栈选项。**绝不要手动实现 |
| 作为独立屏幕的底部抽屉 | **`presentation: 'formSheet'`** — 这是一个真正的 `UISheetPresentationController`，可直接使用且实现正确 |
| 标签栏 | **`NativeTabs`**（来自 `expo-router/unstable-native-tabs`）— 平台原生标签栏，其行为和过渡效果都已内置 |
| 上下文菜单、按住预览 | **`Link.Menu` / `Link.Preview`**（Expo Router，仅限 iOS）— 使用原生菜单和窥视预览，绝不要用 JS 重建 |
| 收缩为大标题的标题栏 | 原生堆栈中的 **`headerLargeTitleEnabled`**（仅限 iOS；`headerLargeTitle` 已弃用）— 不要使用滚动 worklet |
| 下拉刷新 | **`RefreshControl`** — 只有在这是标志性交互时才手动实现（参见阈值方案） |
| 跟随键盘的 UI | **`react-native-keyboard-controller`** — 键盘在 UI 线程上的真实位置，逐帧更新 |
| 矢量插图、庆祝效果、空状态 | **Lottie** — 仅用于插图，绝不要用于 UI 状态 |
| 大型动画场景、自由绘图 | **`@shopify/react-native-skia`** — 一个画布，仅在视图层级本身成为瓶颈时使用 |

只有当值是连续的或可中断的时，才使用 shared value。按下缩放属于 CSS 过渡；拖动才属于 shared value。为两态切换使用 worklet，就像为了实现淡入淡出而在移动端安装一套动画库一样。

**依赖项。** 使用 `npx expo install <package>` 安装 — 它会解析与项目 SDK 匹配的版本，而普通的 `npm install` 不会：

| 需求 | 包 |
| --- | --- |
| 动画 | `react-native-reanimated` + `react-native-worklets` |
| 手势 | `react-native-gesture-handler` |
| 导航、抽屉、原生标签栏、菜单 | `expo-router` |
| 触觉反馈 | `expo-haptics` |
| 跟随键盘的 UI | `react-native-keyboard-controller`（根节点需要 `KeyboardProvider` — 参见键盘方案） |
| 插图、庆祝效果 | `lottie-react-native` |
| 超大型动画场景、自定义绘图 | `@shopify/react-native-skia` |

### 4. 选择属性

- **`transform` 和 `opacity` 不受限制。** 其他属性都会触发布局计算。对某个节点设置 `width`、`height`、`margin`、`padding`、`flex`、`top`、`left`、`gap`，会在每一帧为该节点及其同级节点重新运行 Yoga。
- **唯一的例外是没有子节点的绝对定位元素**，例如标签胶囊、进度条填充部分。它脱离了布局流，因此不会让其他内容重新布局；而且动画化 `width` 能保持圆角半径，不会像 `scaleX` 那样造成变形。
- **永远不要使用 `scale(0)`。** 从 `scale(0.9–0.97)` + `opacity: 0` 开始。现实世界中没有任何东西会凭空出现。
- **`transform` 是一个数组，顺序很重要**：`[{ translateY }, { scale }]` 会在移动之后再缩放；反过来写，平移量也会被缩放。除非你需要这种乘法效果，否则应将 translate 放在前面。
- **Android 阴影使用 `elevation`，而动画化 elevation 会在每一帧重新渲染阴影。** 应改为对预先添加阴影的图层进行 opacity 动画。
- **永远不要动画化 `BlurView` 的 intensity。** 在 Android 上，这会导致每一帧重新渲染模糊效果。应改为对静态 `BlurView` 的 opacity 做交叉淡化。
- **`translate` 支持百分比**，并且相对于元素自身的尺寸计算：`translateY('100%')` 会让底部面板移动自身高度的距离，无论其内容是什么。

### 5. Timing 还是 spring

**如果交互中涉及手指操作，就使用 spring。** 手指中断操作时，spring 可以保留速度；而 timing 曲线会重新开始。其他情况都使用 timing。

Reanimated 的 spring 直接使用 Apple 的两个设计参数，使用以下形式，不要使用 mass/stiffness/damping：

| 交互 | 配置 |
| --- | --- |
| 默认停稳，不产生过冲 | `{ duration: 400, dampingRatio: 1 }` |
| 拖动后的重新定位 / 回弹 | `{ duration: 400, dampingRatio: 0.8, velocity }` |
| 面板、抽屉 | `{ duration: 300, dampingRatio: 0.8, velocity }` |
| 必须避免越过硬边界 | 添加 `overshootClamping: true` |

**只在手势携带动量时使用回弹。** 淡入的菜单出现过冲会让人感觉不对；而用户快速甩动的卡片产生过冲则会感觉自然。

**对于所有不涉及手指操作的动画，使用 Easing：**

| 情况 | Easing |
| --- | --- |
| 进入或退出 | `ease-out` |
| 在屏幕上移动 / 变形 | `ease-in-out` |
| 匀速运动（进度、跑马灯） | `linear` |
| 默认 | `ease-out` |

**UI 中永远不要使用 `ease-in`。** 它会从缓慢开始，延迟用户正在关注的准确时刻。Reanimated 的内置曲线和 CSS 的一样不够强，使用以下曲线：

```js
import { cubicBezier, Easing } from 'react-native-reanimated';

// transitionTimingFunction / animationTimingFunction
const CSS_EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);

// withTiming / .easing(...)
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // strong ease-out for UI
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // on-screen movement
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);    // iOS sheet curve
```

Reanimated 4.1.1 和 4.5.1 不接受原始的 `'cubic-bezier(...)'` 字符串。CSS 过渡和动画使用 `cubicBezier(...)`；`withTiming` 和 `.easing(...)` 使用 `Easing.bezier(...)`。

**持续时间：**

| 元素 | 持续时间 |
| --- | --- |
| 按压反馈 | 100–150ms |
| 切换、标签、小型状态变化 | 150–200ms |
| 页面、模态框、抽屉 | spring，感知约 300ms |
| 屏幕转场 | 使用平台默认值，不要覆盖 |

移动端 UI 动画应保持在 300ms 以内，与 Web 相同。平台自身的转场时间更长（iOS push 为 350ms）；导航应匹配平台，在其他地方则使用更短的时长。

### 6. 让动画脱离 JS 线程

这是移动端特有的工艺，也是大多数 React Native 动效卡顿的根源。

- **绝不要在手势或滚动处理器中调用 `setState`。** 每帧触发一次 React 渲染是 RN 应用卡顿的最大单一原因。使用 Shared Value → `useAnimatedStyle`，React 完全不需要重新渲染。
- **绝不要在 `onUpdate` 或滚动处理器中调度回 RN runtime。** `react-native-worklets` 中的 `scheduleOnRN(fn, ...args)` 是已弃用的 `runOnJS(fn)(...args)` 在 Reanimated 4 中的替代方案，它会将 RN runtime 调用加入队列，而在 `onUpdate` 中调用时频率会达到每秒 60–120 次。它应该放在 `onEnd` 中，或者放在一个值跨过阈值时触发的 `useAnimatedReaction` 中。
- **绝不要在渲染期间读取 Shared Value**（在 JSX 中使用 `translateY.get()`）。它只是一个不会更新的快照，并且会悄悄失去同步。**也绝不要在渲染期间写入 Shared Value**，这会在协调过程中触发写入，而一次并非由你发起的重新渲染又会重放这次写入。只能在 worklet、处理器和 effect 中操作 Shared Value。
- **使用 `.get()` / `.set()`，不要使用 `.value`。** API 相同，但直接访问 `.value` 是 React Compiler 无法分析的形式——Reanimated 文档将 `get`/`set` 称为对编译器安全的方式。`set` 还支持函数式更新：`sv.set((v) => v + 1)`。
- **从 worklet 中调用的函数需要将 `'worklet'` 作为第一行**，否则在设备上运行时会抛出异常，但在调试器中可以正常工作。

### 7. 使用按压，而不是悬停

Web 中的每一种悬停交互都必须重新设计，不能直接移植。

- **按下时提供反馈，松开时提交。** 等待点击完成后才显示任何反馈会让交互显得迟钝，这正是用户实际感知到的延迟。
- **对任何类似按钮的可按压元素，在 100–150ms 内使用 `scale: 0.97`**，并结合 `Pressable` 和 CSS transition。`scale` 会带动标签和图标一起变化，这正是它具有实体感的原因。全宽列表行是例外：改为突出显示背景，因为缩放列表行会让人感觉整个屏幕都在挤压。
- **触摸目标最小为 44×44pt**（Android 为 48dp）。如果视觉元素更小，请添加 `hitSlop`，不要放大视觉元素。
- **使用 `pressRetentionOffset`**，这样手指偏移几像素时不会取消用户本意的按压。
- **仅在采用 Material 风格的应用中使用 Android ripple。** 在自定义设计的应用中，让两个平台使用相同的缩放效果，比只在一个平台使用 ripple 更协调。

### 8. 触觉反馈

移动端拥有 Web 不具备的感官体验。适度使用时，它会让应用显得更加精致；到处使用则会让用户直接关闭它。

| 时机 | 调用 |
| --- | --- |
| 数值经过一个步进值——选择器、滑块卡点、分段控件 | `Haptics.selectionAsync()` |
| 某个元素归位、页面卡在某个停靠点、拖动提交 | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` |
| 重物落下、触发破坏性操作 | `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` |
| 操作成功或失败 | `Haptics.notificationAsync(NotificationFeedbackType.Success / Error)` |

三条规则，而且绝对不能违反：

- **与视觉保持同一时刻。** 延迟于动画的触觉反馈会让人感觉像是故障，而不是反馈。应在因果时刻触发，也就是卡位点卡住的瞬间，而不是动画结束时。
- **每次用户操作只触发一次。** 滚动时绝不触发，绝不按帧触发，也绝不为用户未触发的入场动画触发。
- **绝不能是唯一反馈。** 许多用户在系统范围内关闭了触觉反馈，而且大多数 Android 设备都没有声音。视觉反馈必须能够独立传达状态。

从 worklet 中必须将触觉反馈调度回 RN runtime：`scheduleOnRN(Haptics.selectionAsync)`。

### 9. 减少动效与无障碍

```jsx
import { useReducedMotion, ReduceMotion, withSpring } from 'react-native-reanimated';

const reduced = useReducedMotion();
const y = useSharedValue(reduced ? 0 : SHEET_HEIGHT);

// or let each animation decide
withSpring(0, { duration: 300, dampingRatio: 0.8, reduceMotion: ReduceMotion.System });
```

减少动效意味着**更少、更柔和**，而不是完全没有：保留能够解释状态变化的透明度和颜色变化，移除位移、缩放、视差和过冲。屏幕转场改为 `animation: 'fade'`。

**文本缩放。** `allowFontScaling` 默认开启，因此在默认字号下测量出的任何高度，在 200% 字号下都是错误的。绝不要为动画设置硬编码高度，应使用 `onLayout` 进行测量，或改为动画化 transform。

## 会悄悄破坏动效的设置

当“动画就是不运行”时，先检查这些内容：

- 通过 Expo 安装，以确保版本与 SDK 匹配：`npx expo install react-native-reanimated react-native-worklets`。在 Expo 项目中，`babel-preset-expo` 会自动配置 worklets Babel 插件，不需要执行 `babel.config.js` 步骤。只有不使用该 preset 的原生 RN 项目才需要手动添加插件，并且插件必须位于列表末尾。缺少插件或插件位置错误不再会静默回退，而是会在运行时抛出 `Failed to create a worklet`。
- `GestureHandlerRootView` 必须包裹整个应用，否则手势会无错误地失效。
- Reanimated 4 要求启用新架构。
- **Expo Go 不是性能评估环境。** 应在 release 构建中判断交互感受；开发构建中的 JS 线程速度足够慢，会恰好掩盖你要查找的问题。

## 120fps

在支持 ProMotion 的 iPhone 上，除非设置了 `CADisableMinimumFrameDurationOnPhone`，否则第三方动画会被限制在 60fps。近期的 Expo SDK 默认会设置该项，请确认它存在，不存在时添加：

```json
{ "expo": { "ios": { "infoPlist": { "CADisableMinimumFrameDurationOnPhone": true } } } }
```

此时每帧预算是 8ms，而不是 16ms。这也是 UI 线程动画在移动端比 Web 端更重要的原因。

## 配方

如需直接构建的实现方案，包括按压反馈、拖动关闭底部页、滑动删除、可折叠标题栏、列表入场动画、与键盘同步的 UI、标签页指示器和屏幕转场，请参阅 [RECIPES.md](RECIPES.md)。当请求匹配其中一项时加载该文件；从配方开始，而不是从空白文件开始。

## 绝不发布

| 绝不使用 | 应使用 |
| --- | --- |
| `PanResponder` | 来自 gesture-handler 的 `Gesture.Pan()` |
| 在手势或滚动处理器中使用 `setState` | shared value + `useAnimatedStyle` |
| `runOnJS`（在 Reanimated 4 中已弃用） | 来自 `react-native-worklets` 的 `scheduleOnRN` |
| 按帧调用 `scheduleOnRN` | `onEnd`，或在达到阈值时使用 `useAnimatedReaction` |
| 在渲染期间读取或写入 shared value | 在 worklet、处理器和 effect 中使用 `.get()` / `.set()` |
| 对任何手指会触碰的内容使用 Core `Animated` | Reanimated |
| 动画化 `height` / `width` / `margin` / `flex` / `top` | `transform` + `opacity`（绝对定位且没有子元素的元素除外） |
| 动画化 `BlurView` 的强度或 Android 的 `elevation` | 交叉淡化静态图层 |
| 在虚拟化列表行上使用 `entering` | 动画化容器，或使用 `itemLayoutAnimation` |
| 在 JS 中重建屏幕转场 | 原生 stack 的 `animation` |
| 在标签页之间滑动 | `animation: 'none'` |
| 在 UI 元素上使用 `Easing.in(...)` | `Easing.bezier(0.23, 1, 0.32, 1)` |
| 在 Reanimated CSS 样式中使用 `'cubic-bezier(...)'` | 来自 `react-native-reanimated` 的 `cubicBezier(...)` |
| 使用 `scale(0)` 入场 | `scale(0.95)` + `opacity: 0` |
| 仅基于距离的关闭阈值 | 速度**或**距离，快速滑动也应足够触发 |
| 在边界处硬停止 | 橡皮筋式阻力 |
| 每帧触发一次触觉反馈，或将其作为唯一反馈 | 每次提交触发一次，并始终与视觉反馈配对 |
| 在 Expo Go 或模拟器中判断交互感受 | release 构建，在性能最慢的受支持设备上测试 |

## 输出

编写代码。然后用不超过几行的篇幅说明：

- **门槛结果** — 频率等级和明确的用途名称。说明你拒绝了什么以及原因。
- **构成要素** — 工具、属性、弹簧或曲线 + 时长、线程。
- **在设备上进行体感检查的内容** — 手势、速度衔接和触觉反馈时机无法通过代码判断。请说明要尝试什么：快速滑动、在运动中途打断、反向操作、在你手头最慢的 Android 设备上运行。

代码是交付物。不要把它扩写成报告。

## 语气

有明确立场且简洁。当诚实的答案是“这里不应该添加动画”，或“这需要在真实设备上测试后才能判断是否合适”时，就直说。

## 提交反馈
如果你遇到此技能中的错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-animation" "<actionable feedback>"
```
只有在发现具体且可执行的改进反馈时才提交。如果 AI agent 反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能，并遵循其 eval-candidate 流程，而不要重复使用上面的命令。