---
name: better-ui
description: Design engineering principles for making interfaces feel polished. Use when building UI components, implementing animations or hover states, or doing any visual detail work. Triggers on UI polish, "feels off", stagger animations, enter animations, theme switch transitions, border radius, optical alignment, image outlines, box shadows, icons, icon stroke weight, motion restraint.
---
# UI 润色

润色来自大量不断累积的小细节。本 skill 是关于哪些细节值得具备及其取值的参考。

审查时，放慢界面的速度。在 10% 速度下感觉不对的地方，正是在全速下微妙出错的地方。

保留项目的组件库、令牌和密度，并匹配其动效语言，除非以下规则规定了精确的交互方式。

以下每个时长、曲线、缩放和模糊值都是特定值，而不是可近似的范围。`cubic-bezier(0.2, 0, 0, 1)` 不是 `cubic-bezier(0.4, 0, 0.2, 1)`，`0.96` 也不是 `0.95`。请使用原文所写的值。

文本换行、字体渲染、表格数字和文本间距属于 `better-typography`。点击区域、焦点、键盘支持、ARIA 和减少动态效果属于 `better-accessibility`。分组、区块间距、断点和空间 RTL 属于 `better-layout`。

## 同心圆角

外层圆角 = 内层圆角 + 内边距。嵌套元素的圆角不匹配，是最常让界面感觉不对的原因。圆角、阴影和轮廓线方案见 [surfaces.md](surfaces.md)。

## 视觉对齐优先于几何对齐

当几何居中看起来不对时，请进行视觉对齐。带图标的按钮、播放三角形和非对称图标都需要手动微调。

## 用阴影表达层级，用边框表达结构

当边框仅用于营造深度时，优先使用分层的透明 `box-shadow` 值。保留用于传达结构或状态的边框：分隔线、分隔符，以及选中或聚焦状态。

## 可中断动画

交互状态变化应使用 CSS 过渡，因为它们可以在动画中途被中断。仅将关键帧用于运行一次的分阶段序列。

## 拆分并错开进入动画

对于不常发生、且序列能够传达层级关系的分阶段进入效果，应将内容拆分为语义块，并以约 ~100ms 的间隔错开。为单个容器添加动画，以相同成本获得的效果更少。高频交互不要错开。参见 [enter-exit.md](enter-exit.md)。

## 微妙的退出动画

使用较小的固定 `translateY`，而不是完整高度。退出应比进入更柔和。两个方向都使用 `ease-out`。

## 上下文相关的图标动画

使用 `opacity`、`scale` 和 `blur` 为图标添加动画，而不是切换可见性。必须严格使用以下值：缩放从 `0.25` 到 `1`，不透明度从 `0` 到 `1`，模糊从 `4px` 到 `0px`。

使用动效库时（`package.json` 中的 `motion` 或 `framer-motion`），请匹配该包的导入路径；如果两者都存在，则匹配附近的导入。使用 `transition: { type: "spring", duration: 0.3, bounce: 0 }`。Bounce 始终为 `0`。

未使用动效库时，请将两个图标保留在 DOM 中，其中一个采用绝对定位，并使用 `cubic-bezier(0.2, 0, 0, 1)` 进行交叉淡入淡出。这样无需依赖即可实现进入和退出。两种方案都在 [icon-transitions.md](icon-transitions.md) 中。

## 图像轮廓线

为图像添加低不透明度的 `1px` 轮廓线，以保持一致的层次感。浅色模式使用纯黑（`oklch(0 0 0 / 0.1)`），深色模式使用纯白（`oklch(1 0 0 / 0.1)`）。绝不要使用 slate 或 zinc 这类近黑色，也绝不要使用带色调的中性色。带色调的轮廓线会吸收下方表面的颜色，看起来像是图像边缘有污渍。

## 按下时缩放

点击时使用 `scale(0.96)` 可为按钮提供触感反馈。始终使用 `0.96`；低于 `0.95` 会显得夸张。在动效会分散注意力的地方，添加 `static` prop 以将其关闭。参见 [CSS、Tailwind 和 Motion 的方案](animations.md#scale-on-press)。

## 页面加载时跳过动画

在 `AnimatePresence` 上使用 `initial={false}`，以便在首次渲染时禁用进入动画。确认这不会影响有意设计的页面入场效果。

## 切换主题时抑制过渡

主题切换会同时更改几乎所有元素的颜色、背景、边框和阴影。这些属性上的所有过渡会一起触发，导致切换效果变得模糊而不是立即完成。注入 `*,*::before,*::after{transition:none !important}`，强制重排，然后在下一帧将其移除。参见[方案](animations.md#suppress-transitions-on-theme-switch)。

## 仅为变化的属性设置过渡

始终指定确切的属性：`transition-property: scale, opacity`。Tailwind 的 `transition-transform` 覆盖 `transform, translate, scale, rotate`。

## 谨慎使用 `will-change`

仅用于 GPU 可以合成的 `transform`、`opacity` 和 `filter`。绝不要使用 `will-change: all`。只在发现首帧卡顿时添加，而不是提前添加。参见 [performance.md](performance.md)。

## 使图标描边匹配文本字重

文本旁的图标应具有与文本相称的视觉重量：常规（400）文本旁使用 `1.5px` 描边，半粗（600）文本旁使用 `2px` 描边。每个图标集只使用一种描边粗细，每个界面区域只使用一个图标库。尺寸和 RTL 翻转说明见 [icons.md](icons.md)。

## 一个 SVG，按状态重新着色

图标使用 `currentColor`，并通过 CSS 颜色和透明度呈现悬停、选中和禁用状态，绝不使用单独的资源文件。轮廓是默认变体；填充表示激活状态。

## 克制使用动效

为高频交互提供即时反馈，或者仅对透明度和颜色使用 `150ms` 或更短的过渡。此处的自定义动画会在每次触发时付出注意力成本。

每个动画状态变化还需要静态提示：颜色、图标或标签。动效绝不能是唯一的反馈通道。

## 完成前

| 错误 | 修复方式 |
| --- | --- |
| 图标看起来未居中 | 通过内边距进行视觉微调，或修复 SVG |
| 分阶段的进入或退出效果生硬 | 对低频进入效果使用错开动画；保持退出效果轻微 |
| 主题切换使整个页面交叉淡入淡出 | 在切换期间禁用过渡，强制重排，并在下一帧恢复 |
| 元素上使用 `transition: all` | 指定确切的属性 |
| 首帧动画卡顿 | 添加 `will-change: transform`（谨慎使用） |
| 粗体文本旁的细线图标 | 使描边宽度匹配文本字重 |

## 报告

**严重程度。** `HIGH` 会破坏交互、使动效无法使用，或让状态变化仅在动画运行期间可见。`MEDIUM` 是界面区域、图标或动效中可见的不一致。`LOW` 是局部的细节优化。

**验证。** 没有浏览器时：检查组件定义的每个状态，即悬停、聚焦、激活、加载和空状态，以及从代码中读取动效时长和缓动函数。有浏览器时：逐一检查每个状态，并在浏览器的 Animations 面板中以 10% 速度重放动效。将每个无法执行的检查报告为 `Not verified`。

**格式。** 按每项发现所违反的原则分组，并按严重程度排序。每个根本原因一行，列出其出现的所有位置：

| 严重程度 | 位置 | 修改前 | 修改后 | 原因 |
| --- | --- | --- | --- | --- |

`Location` 的格式为 `path/to/file:line`。`Why` 需说明原则及对用户的影响。

当仍存在任何 `HIGH` 时，以 `Block` 结束；否则以 `Approve` 结束，其余内容保留在表格中作为待完成工作。不得 `Approve` 未经检查的覆盖范围。若无可报告内容，请说明“无可操作的 UI 打磨发现”，并报告验证情况。