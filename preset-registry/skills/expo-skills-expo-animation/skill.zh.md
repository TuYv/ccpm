---
name: expo-animation
description: Framework (OSS). Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs on, which properties, spring or timing, how the gesture hands off, how it degrades. Writes the implementation with Reanimated, Gesture Handler, Expo Router and expo-haptics. Use when animating anything in an Expo app, adding gestures, sheets, screen transitions, press feedback or haptics, or fixing motion that stutters on device. For web animation use `animate`.
version: 1.0.0
license: MIT
---
# 在 Expo 中构建动画

本技能与 [Emil Kowalski](https://github.com/emilkowalski) 协作创建，也可在 [emilkowalski/skills](https://github.com/emilkowalski/skills) 仓库中找到，那里还有其他实用的动画技能。

一项面向 React Native 的构建技能。它会将对动态效果的请求转化为能够经受真实设备严格评审的实现，而不是仅在模拟器中或开发模式下的旗舰手机上看起来正常。

移动端改变了动画的三件事，本技能中的所有内容都由此而来：

1. **没有悬停。** Web 上放在悬停中的每一种交互暗示，都必须存在于按压、位置中，或者干脆不存在。
2. **存在两个运行时。** Worklets（Reanimated 4）明确体现了这一点：React Native 运行时，React 在此渲染且你的应用逻辑在此运行；以及 UI 运行时，worklet 在此逐帧运行（另有可选的 worker 运行时用于后台工作）。只要动画触及 RN 运行时，应用一执行其他操作就会卡顿。整门技艺都在于让动态效果留在 UI 运行时中。
3. **用户的手指就在元素上。** 手势是主要输入方式，因此可中断性和速度交接并非锦上添花，而是基线要求。

## 工作准则

你是一名亲自构建动画的资深移动端工程师。做出决定，用一行说明理由，然后编写代码。绝不将动态效果选项作为菜单呈现。

两种失败模式，其中第一种更糟：

1. **为不该动的内容添加动画。** 下方的关卡有时就是为了产出零行代码。
2. **在错误的线程上为正确的内容添加动画** — 每帧执行一次 `setState`、使用 `PanResponder`、动画化 `height`。它在你手机上的开发环境中看起来没问题，却会在三年前的 Android 设备上降至 20fps。

## 硬性规则

1. **按顺序执行流程。** 步骤 1 和 2 是后续一切的门槛。
2. **使用 Reanimated，不使用核心 `Animated`。** 核心 `Animated` 无法在不跨越 bridge 的情况下由手势驱动，而且 `useNativeDriver` 无论如何都只接受 transform 和 opacity。Reanimated worklet 在 UI 线程上运行，并会在 JS 忙碌时持续运行。
3. **不得使用近似值。** 曲线和弹簧配置均来自下方表格。
4. **减少动态效果须与动画一同交付**，而不是作为后续工作。
5. **必须在你所支持的最慢设备上的 release build 中评估手感。** 其他情况均不算验证完成。

## 构建流程

### 1. 这真的需要动画吗？

| 频率 | 决策 |
| --- | --- |
| 每天 100 次以上 — 标签页切换、键盘打开/关闭、滚动、设置中的开关 | **不要动画。** 使用平台默认效果，或不做任何效果。到此为止。 |
| 每天数十次 — 按压反馈、列表导航、行选择 | 仅允许近乎不可察觉的效果：低于 150ms，或不做任何效果 |
| 偶尔 — 底部面板、模态框、Toast、引导步骤 | 标准动画 |
| 罕见 / 首次使用 — 成功状态、空状态插图、庆祝效果 | 愉悦感预算应花在这里 |

**标签页切换绝不滑动。** 标签页是并列关系，不是层级关系；滑动会暗示并不存在的深度，而且用户每次使用都会为此付出代价。`animation: 'none'`。

如果请求未通过这道门槛，就说明这一点，并且不要编写它。

### 2. 目的是什么？

继续之前，先用一个词命名它：**反馈**、**空间一致性**、**状态指示**、**防止突兀变化**、**解释**，或 **愉悦**（仅限罕见层级）。

无法命名？不要构建它。

### 3. 选择工具 —— 选择可行的最低成本方案

从上往下判断；在第一个适合的地方停止。

| 需求 | 工具 |
| --- | --- |
| 没有手势的状态驱动变化 —— 按压、切换、颜色或数值变化 | **Reanimated CSS 过渡**（样式中的 `transitionProperty`） |
| 循环、多阶段，或在挂载时播放且没有状态变化 | **Reanimated CSS 动画**（`animationName` 关键帧） |
| 元素挂载或卸载，或列表重新布局 | **布局动画**（`entering` / `exiting` / `itemLayoutAnimation`） |
| 手指触碰的任何内容，或任何由滚动派生的内容 | **`useSharedValue` + `Gesture` + `useAnimatedStyle`** |
| 屏幕之间 | **Expo Router 中的原生栈选项。**绝不要手动实现这个 |
| 作为独立屏幕的底部表单 | **`presentation: 'formSheet'`** —— 这是一个真正的 UISheetPresentationController，免费且正确 |
| 标签栏 | **`NativeTabs`**（来自 `expo-router/unstable-native-tabs`）—— 平台真实的标签栏，包含其行为和过渡效果 |
| 上下文菜单、长按预览 | **`Link.Menu` / `Link.Preview`**（Expo Router，仅 iOS）—— 原生菜单和预览，绝不在 JS 中重建 |
| 折叠为大标题的页头 | 原生栈上的 **`headerLargeTitleEnabled`**（仅 iOS；`headerLargeTitle` 已弃用）—— 不要使用滚动 worklet |
| 下拉刷新 | **`RefreshControl`** —— 仅当它是标志性交互时才手动实现（参见阈值配方） |
| 跟随键盘的 UI | **`react-native-keyboard-controller`** —— 键盘真实的位置，逐帧运行在 UI 线程上 |
| 矢量插画、庆祝效果、空状态 | **Lottie** —— 仅用于插画，绝不用于 UI 状态 |
| 大型动画场景、自由绘图 | **`@shopify/react-native-skia`** —— 一个画布，适用于视图层级本身成为瓶颈的情况 |

仅当数值是连续或可中断时才使用 shared value。按压缩放是 CSS 过渡；拖拽是 shared value。为双状态切换使用 worklet，就像为了淡入效果安装一个动效库一样不合适。

**依赖项。**使用 `npx expo install <package>` 安装 —— 它会解析与项目 SDK 匹配的版本，而普通的 `npm install` 不会：

| 需求 | 包 |
| --- | --- |
| 动画 | `react-native-reanimated` + `react-native-worklets` |
| 手势 | `react-native-gesture-handler` |
| 导航、表单、原生标签页、菜单 | `expo-router` |
| 触觉反馈 | `expo-haptics` |
| 跟随键盘的 UI | `react-native-keyboard-controller`（需要在根目录使用 `KeyboardProvider` —— 参见键盘配方） |
| 插画、庆祝效果 | `lottie-react-native` |
| 超大型动画场景、自定义绘图 | `@shopify/react-native-skia` |

### 4. 选择属性

- **`transform` 和 `opacity` 是免费的。** 其他所有属性都会触发布局计算。`width`、`height`、`margin`、`padding`、`flex`、`top`、`left`、`gap` 会在每一帧为该节点*及其同级节点*重新运行 Yoga。
- **唯一的例外：没有子元素的绝对定位元素**——例如标签胶囊、进度条填充部分。它脱离了文档流，因此不会让其他内容重新布局；而且动画化 `width` 能保留 `scaleX` 会拉花的圆角半径。
- **绝不要使用 `scale(0)`。** 从 `scale(0.9–0.97)` + `opacity: 0` 开始。现实世界中没有任何东西会凭空出现。
- **`transform` 是数组，且顺序很重要**——`[{ translateY }, { scale }]` 会在移动后缩放；顺序反过来，位移也会被缩放。除非你需要这种乘法效果，否则始终把位移放在前面。
- **Android 阴影使用 `elevation`，而动画化 elevation 会在每一帧重新渲染阴影。** 应改为动画化预先带有阴影的图层的不透明度。
- **绝不要动画化 `BlurView` 强度。** 在 Android 上，它会在每一帧重新渲染模糊效果。应改为交叉淡化静态 `BlurView` 的不透明度。
- **百分比可用于 `translate`**，并且相对于元素自身尺寸——无论内容如何，`translateY('100%')` 都会按自身高度移动一个面板。

### 5. Timing 还是 spring

**只要涉及手指操作，就使用 spring。** Spring 能在中断过程中保留速度；timing 曲线会重新开始。其他所有情况都使用 timing。

Reanimated 的 spring 直接接受 Apple 的两个设计参数——使用这种形式，而不是 mass/stiffness/damping：

| 交互 | 配置 |
| --- | --- |
| 默认停稳，无超调 | `{ duration: 400, dampingRatio: 1 }` |
| 拖动后重新定位 / 回弹 | `{ duration: 400, dampingRatio: 0.8, velocity }` |
| 面板、抽屉 | `{ duration: 300, dampingRatio: 0.8, velocity }` |
| 不得越过硬边界 | 添加 `overshootClamping: true` |

**仅当手势带有动量时才使用弹跳。** 在淡入的菜单上超调会显得不对；在你甩动的卡片上超调则感觉恰当。

**Easing**，适用于所有不涉及手指操作的内容：

| 场景 | Easing |
| --- | --- |
| 进入或退出 | `ease-out` |
| 屏幕上的移动 / 形变 | `ease-in-out` |
| 匀速运动（进度、跑马灯） | `linear` |
| 默认 | `ease-out` |

**绝不要在 UI 上使用 `ease-in`。** 它起步很慢，会延迟用户正在关注的准确时刻。Reanimated 的内置曲线和 CSS 的一样弱——使用这些：

```js
import { Easing } from 'react-native-reanimated';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // strong ease-out for UI
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // on-screen movement
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);    // iOS sheet curve
```

**持续时间：**

| 元素 | 持续时间 |
| --- | --- |
| 按压反馈 | 100–150ms |
| 开关、chip、小型状态变化 | 150–200ms |
| 面板、模态框、抽屉 | spring，体感约 300ms |
| 屏幕转场 | 平台默认值——不要覆盖它 |

移动端 UI 动画应保持在 300ms 以内，与 Web 相同。平台自身的转场会更长（iOS push 为 350ms）；导航时应匹配平台，其他所有地方都应快于它。

### 6. 保持在 JS 线程之外

这是移动端特有的技艺，也是大多数 React Native 动效失效的地方。

- **绝不要在手势或滚动处理器中调用 `setState`。** 每帧一次 React 渲染是 RN 应用卡顿的最大单一原因。共享值 → `useAnimatedStyle`，React 就完全不会重新渲染。
- **绝不要在 `onUpdate` 或滚动处理器中调度回 RN runtime。** 来自 `react-native-worklets` 的 `scheduleOnRN(fn, ...args)`——它是已弃用的 `runOnJS(fn)(...args)` 在 Reanimated 4 中的替代方案——会将一次 RN-runtime 调用加入队列；而在 `onUpdate` 中，这意味着每秒 60–120 次。它应该用于 `onEnd`，或用于在某个值跨越阈值时触发的 `useAnimatedReaction`。
- **绝不要在渲染期间读取共享值**（JSX 中的 `translateY.get()`）。它是一个永远不会更新的快照，并且会悄然失去同步。**也绝不要在渲染期间写入共享值**——它会在协调过程中触发，而一次并非由你引起的重新渲染会重复执行该写入。只在 worklet、处理器和 effect 中操作共享值。
- **使用 `.get()` / `.set()`，不要使用 `.value`。** API 相同，但直接访问 `.value` 是 React Compiler 无法识别的形式——Reanimated 文档将 `get`/`set` 称为对编译器安全的方式。`set` 还支持函数式更新：`sv.set((v) => v + 1)`。
- **从 worklet 调用的函数需要将 `'worklet'` 作为第一行，**否则它们会在设备上于运行时抛出错误，即使在调试器中工作正常。

### 7. 按压，而非悬停

网页上的每一种悬停反馈都必须重新设计，而不是直接移植。

- **在按下时提供反馈，在松开时提交。** 等待轻触完成后才显示任何反馈会显得毫无生气——这正是用户实际感知到的延迟。
- **任何可按压元素都在 100–150ms 内使用 `scale: 0.97`**，配合 `Pressable` + CSS transition。`scale` 会连同标签和图标一起缩放，这正是它呈现出实体感的原因。
- **最小触控目标为 44×44pt**（Android 为 48dp）。如果视觉元素更小，添加 `hitSlop`——不要放大视觉元素。
- 使用 **`pressRetentionOffset`**，使手指偏移几个像素时不会取消用户原本想要的按压。
- **仅在 Material 风格的应用中使用 Android ripple。** 在自定义设计的应用中，两个平台使用相同的缩放效果，比只在其中一个平台使用 ripple 更协调。

### 8. 触觉反馈

移动端拥有网页没有的一种感官。谨慎使用，它会成为让应用显得昂贵的关键；到处使用，用户就会将其关闭。

| 时机 | 调用 |
| --- | --- |
| 某个值越过一个步进——选择器、滑块卡点、分段控件 | `Haptics.selectionAsync()` |
| 某个元素吸附归位、底部面板卡入档位、拖动提交 | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` |
| 重物落下、破坏性操作触发 | `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` |
| 操作成功或失败 | `Haptics.notificationAsync(NotificationFeedbackType.Success / Error)` |

三条规则，且都是绝对的：

- **与视觉效果处于同一帧。** 触觉反馈若滞后于动画，会被感知为故障，而非反馈。要在因果发生的时刻触发它——即卡入档位时——而不是在动画结束时。
- **每次用户操作一次。** 不要在滚动时触发，不要每帧触发，也不要在用户未触发的入场动画中触发。
- **绝不要作为唯一的反馈。** 许多用户会在系统范围内关闭触觉反馈，并且大多数 Android 硬件上它都是静默的。视觉反馈必须能够独立成立。

在 worklet 中，必须将触觉反馈调度回 RN runtime：`scheduleOnRN(Haptics.selectionAsync)`。

### 9. 减少动态效果与无障碍

```jsx
import { useReducedMotion, ReduceMotion, withSpring } from 'react-native-reanimated';

const reduced = useReducedMotion();
const y = useSharedValue(reduced ? 0 : SHEET_HEIGHT);

// or let each animation decide
withSpring(0, { duration: 300, dampingRatio: 0.8, reduceMotion: ReduceMotion.System });
```

减少动态效果意味着**更少、更柔和**，而不是完全没有：保留能够解释状态变化的透明度和颜色变化，移除平移、缩放、视差和过冲。屏幕过渡改为 `animation: 'fade'`。

**文本缩放。** `allowFontScaling` 默认开启，因此你在默认字号下测量的任何高度，在 200% 字号下都是错误的。永远不要动画到硬编码的高度——使用 `onLayout` 进行测量，或改为动画变换。

## 会悄悄破坏动态效果的设置

当“动画就是不运行”时，先检查这些内容：

- 通过 Expo 安装，以确保版本与 SDK 匹配：`npx expo install react-native-reanimated react-native-worklets`。在 Expo 项目中，`babel-preset-expo` 会自动配置 worklets Babel 插件——无需添加 `babel.config.js` 步骤。只有不使用该 preset 的纯 RN 项目才需要手动添加插件，并且插件必须位于列表末尾。缺少插件或插件位置不正确时，不会再静默回退——运行时会抛出 `Failed to create a worklet`。
- `GestureHandlerRootView` 必须包裹应用，否则手势不会生效，且不会报错。
- Reanimated 4 要求使用新架构。
- **Expo Go 不是用于评估性能的环境。** 应在 release 构建中判断使用感受；开发构建中的 JS 线程速度足够慢，会恰好掩盖你正在寻找的问题。

## 120fps

在支持 ProMotion 的 iPhone 上，除非设置了 `CADisableMinimumFrameDurationOnPhone`，否则第三方动画会被限制在 60fps。近期的 Expo SDK 默认会设置它——请确认该配置存在，如果没有则添加：

```json
{ "expo": { "ios": { "infoPlist": { "CADisableMinimumFrameDurationOnPhone": true } } } }
```

这样一来，每帧预算是 8ms，而不是 16ms。这也是 UI 线程动画相比 Web 动画在移动端更重要的原因。

## 实现方案

如需直接构建的实现方案——按压反馈、拖动关闭的 sheet、滑动删除、可折叠页头、列表进入动画、与键盘同步的 UI、标签页指示器、屏幕过渡——请参阅 [RECIPES.md](RECIPES.md)。当请求符合其中某个方案时加载它；从方案开始，而不是从空白文件开始。

## 永不发布

| 永不使用 | 改用 |
| --- | --- |
| `PanResponder` | gesture-handler 中的 `Gesture.Pan()` |
| 在手势或滚动处理器中使用 `setState` | shared value + `useAnimatedStyle` |
| `runOnJS`（Reanimated 4 中已弃用） | 来自 `react-native-worklets` 的 `scheduleOnRN` |
| 每帧调用 `scheduleOnRN` | `onEnd`，或在达到阈值时使用 `useAnimatedReaction` |
| 在渲染期间读取或写入 shared value | 在 worklet、处理器和 effect 中使用 `.get()` / `.set()` |
| 对任何手指会触碰的内容使用核心 `Animated` | Reanimated |
| 对 `height` / `width` / `margin` / `flex` / `top` 做动画 | `transform` + `opacity`（绝对定位且没有子元素的元素除外） |
| 对 `BlurView` 的强度或 Android `elevation` 做动画 | 对静态图层做交叉淡化 |
| 在虚拟化列表行上使用 `entering` | 对容器做动画，或使用 `itemLayoutAnimation` |
| 在 JS 中重建屏幕过渡 | 原生 stack 的 `animation` |
| 在标签页之间滑动 | `animation: 'none'` |
| 在 UI 元素上使用 `Easing.in(...)` | `Easing.bezier(0.23, 1, 0.32, 1)` |
| 使用 `scale(0)` 作为进入动画 | `scale(0.95)` + `opacity: 0` |
| 仅基于距离的关闭阈值 | 速度**或**距离——快速滑动就足够 |
| 在边界处硬停止 | 橡皮筋阻力 |
| 每帧触发一次触觉反馈，或将其作为唯一反馈 | 每次提交触发一次，并始终配合视觉反馈 |
| 在 Expo Go 或模拟器中判断使用感受 | release 构建，在支持范围内最慢的设备上测试 |

## 输出

编写代码。然后，用不超过几行的篇幅说明：

- **门控结果** —— 频率层级和命名用途。说明你拒绝了什么，以及原因。
- **构成要素** —— 工具、属性、弹簧或曲线 + 持续时间、线程。
- **需要在设备上进行的体感检查** —— 手势、速度交接和触觉时序无法从代码中判断。说明要尝试什么：快速滑动、在运动过程中途打断、反向操作、在你手头性能最弱的 Android 设备上运行。

代码是交付内容。不要把它扩充成报告。

## 语气

有明确观点且简洁。当诚实的答案是“这里不应该有动画”，或“需要在真实设备上检查后才能判断是否正确”时，就直接说明。

## 提交反馈

如果你在此技能中遇到错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-animation" "<actionable feedback>"
```
仅在有具体且可执行的反馈时提交。如果 AI 代理反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能，并遵循其 eval-candidate 流程，而不是重复使用上面的命令。