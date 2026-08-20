---
name: better-ui
description: Design engineering principles for making interfaces feel polished. Use when building UI components, implementing animations or hover states, or doing any visual detail work. Triggers on UI polish, "feels off", stagger animations, enter animations, theme switch transitions, border radius, optical alignment, image outlines, box shadows, icons, icon stroke weight, motion restraint.
---
# UI 打磨

精致感来自大量微小细节的叠加。本技能可作为参考，说明哪些细节值得采用，以及应使用哪些具体值。

评审时，放慢界面的运行速度。在 10% 速度下感觉不对的地方，正是在正常速度下隐约显得不对的地方。

保留项目的组件库、设计令牌和信息密度，并遵循其动效语言，除非下方某条规则规定了确切的交互方式。

下方的每个时长、曲线、缩放比例和模糊值都是具体值，而不是可近似取值的范围。`cubic-bezier(0.2, 0, 0, 1)` 不等同于 `cubic-bezier(0.4, 0, 0.2, 1)`，`0.96` 也不等同于 `0.95`。请使用文中给出的值。

文本换行、字体渲染、表格数字和文本间距归 `better-typography` 管辖。点击区域、焦点、键盘支持、ARIA 和减少动态效果归 `better-accessibility` 管辖。分组、区块间距、断点和空间布局的 RTL 适配归 `better-layout` 管辖。

## 同心圆角

外层圆角 = 内层圆角 + 内边距。嵌套元素的圆角不匹配，是最常导致界面观感不协调的问题。圆角、阴影和轮廓线的方案见 [surfaces.md](surfaces.md)。

## 视觉对齐优先于几何对齐

当几何居中看起来不协调时，应采用视觉对齐。带图标的按钮、播放三角形和非对称图标都需要手动微调位置。

## 用阴影表现层级，用边框表达结构

如果边框仅用于营造深度，请优先使用多层透明的 `box-shadow` 值。保留用于传达结构或状态的边框：分隔线、区隔线，以及选中或聚焦状态。

## 可中断动画

交互状态变化应使用 CSS 过渡，因为它们可以在动画中途被中断。关键帧动画应留给只运行一次的分阶段序列。

## 拆分并错开入场动画

对于不频繁出现且通过顺序传达层级关系的分阶段入场，应将内容拆分为语义区块，并以约 100ms 的间隔错开。以相同成本为单个容器添加动画，所得效果较少。高频交互不要使用错开动画。参见 [enter-exit.md](enter-exit.md)。

## 细腻的退场动画

使用较小的固定 `translateY`，而不是完整高度。退场应比入场更柔和。两个方向都使用 `ease-out`。

## 上下文相关的图标动画

使用 `opacity`、`scale` 和 `blur` 为图标添加动画，而不是切换其可见性。严格使用以下值：缩放从 `0.25` 到 `1`，不透明度从 `0` 到 `1`，模糊从 `4px` 到 `0px`。

使用动效库时（`package.json` 中的 `motion` 或 `framer-motion`），应与该软件包的导入路径保持一致；如果两者都存在，则与附近代码中的导入方式保持一致。使用 `transition: { type: "spring", duration: 0.3, bounce: 0 }`。弹性值始终为 `0`。

如果没有动效库，则将两个图标都保留在 DOM 中，其中一个使用绝对定位，并通过 `cubic-bezier(0.2, 0, 0, 1)` 实现交叉淡化。这样无需依赖项即可同时实现入场和退场效果。这两种方案均见 [icon-transitions.md](icon-transitions.md)。

## 图像轮廓线

为图像添加低不透明度的 `1px` 轮廓线，以保持一致的深度感。浅色模式使用纯黑色（`oklch(0 0 0 / 0.1)`），深色模式使用纯白色（`oklch(1 0 0 / 0.1)`）。绝不要使用类似 slate 或 zinc 的近黑色，也不要使用带色调的中性色。带色调的轮廓线会沾染下方表面的颜色，看起来就像图像边缘有污垢。

## 按下时缩放

点击时应用 `scale(0.96)`，可为按钮提供触觉反馈。始终使用 `0.96`；低于 `0.95` 会显得过于夸张。添加 `static` 属性，以便在动画会分散注意力的地方将其关闭。请参阅 [CSS、Tailwind 和 Motion 的实现方案](animations.md#scale-on-press)。

## 页面加载时跳过动画

在 `AnimatePresence` 上使用 `initial={false}`，防止首次渲染时播放进入动画。检查并确保有意设计的页面进入动画不受影响。

## 切换主题时抑制过渡

切换主题会同时改变几乎所有元素的颜色、背景、边框和阴影。这些属性上的所有过渡会一起触发，导致切换效果拖沓模糊，而不是干脆利落地完成。注入 `*,*::before,*::after{transition:none !important}`，强制执行一次重排，然后在下一帧将其移除。请参阅[实现方案](animations.md#suppress-transitions-on-theme-switch)。

## 仅对发生变化的属性应用过渡

始终明确指定具体属性：`transition-property: scale, opacity`。Tailwind 的 `transition-transform` 涵盖 `transform, translate, scale, rotate`。

## 谨慎使用 `will-change`

仅将其用于 `transform`、`opacity` 和 `filter`，因为 GPU 可以对这些属性进行合成。切勿使用 `will-change: all`。只在发现首帧卡顿时添加，而不要提前添加。请参阅 [performance.md](performance.md)。

## 让图标描边与文字字重匹配

文字旁的图标应在视觉重量上与文字一致：常规（400）文字旁使用 `1.5px` 描边，半粗体（600）文字旁使用 `2px` 描边。每套图标仅使用一种描边粗细，每个界面仅使用一个图标库。尺寸调整和 RTL 翻转详见 [icons.md](icons.md)。

## 使用同一个 SVG，并根据状态重新着色

图标使用 `currentColor`，并通过 CSS 的颜色和不透明度呈现悬停、选中和禁用状态，绝不为不同状态使用单独的资源。轮廓是默认样式；填充表示激活状态。

## 克制使用动画

对于高频交互，应提供即时反馈，或仅在不透明度和颜色上使用时长不超过 `150ms` 的过渡。在这些交互中使用自定义动画，每次触发都会带来注意力成本。

每种带动画的状态变化还需要一个静态提示：颜色、图标或标签。动画绝不能作为唯一的反馈渠道。

## 完成前检查

| 错误 | 修复方式 |
| --- | --- |
| 图标看起来未居中 | 使用内边距进行视觉微调，或修复 SVG |
| 分阶段进入或退出效果突兀 | 对低频进入动画使用错峰效果；退出动画应保持克制 |
| 切换主题时整个页面出现交叉淡化 | 切换时禁用过渡，强制执行一次重排，并在下一帧恢复 |
| 在元素上使用 `transition: all` | 明确指定具体属性 |
| 首帧动画卡顿 | 添加 `will-change: transform`（谨慎使用） |
| 粗体文字旁的图标描边过细 | 使描边宽度与文字字重匹配 |

## 报告

**严重程度。** `HIGH` 表示交互被破坏、动画无法正常使用，或状态变化仅在动画播放期间可见。`MEDIUM` 表示界面、图标或动画存在明显的不一致。`LOW` 表示局部的细节优化问题。

**验证。** 无浏览器时：检查组件定义的每一种状态，即悬停、聚焦、激活、加载和空状态，以及从代码中读取的动画持续时间和缓动效果。有浏览器时：逐一检查每种状态，并在浏览器的 Animations 面板中以 10% 的速度重放动画。将每项无法执行的检查报告为 `Not verified`。

**格式。** 按每项发现所违反的原则进行分组，并按严重程度排序；每个根本原因占一行，并列出其出现的所有位置：

| 严重程度 | 位置 | 修改前 | 修改后 | 原因 |
| --- | --- | --- | --- | --- |

`Location` 的格式为 `path/to/file:line`。`Why` 应指出原则及其对用户的影响。

如果仍有任何 `HIGH` 级别的问题，则以 `Block` 结尾；否则以 `Approve` 结尾，并将表格中的其余问题保留为待办事项。绝不要对未经检查的覆盖范围给出 `Approve`。如果没有需要报告的问题，请说明“没有可操作的 UI 润色问题”，并报告验证情况。