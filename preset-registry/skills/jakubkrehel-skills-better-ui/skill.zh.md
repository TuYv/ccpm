---
name: better-ui
description: Design engineering principles for making interfaces feel polished. Use when building UI components, reviewing frontend code, implementing animations, hover states, shadows, borders, micro-interactions, enter/exit animations, choosing or reviewing icons, or any visual detail work. Triggers on UI polish, design details, "make it feel better", "feels off", stagger animations, theme switch transitions, border radius, optical alignment, image outlines, box shadows, icons, icon stroke weight, icon states, motion restraint.
---
# 让界面更具质感的细节

优秀的界面很少只依靠单一因素。通常是一系列微小细节不断叠加，最终形成出色的体验。在构建或审查 UI 代码时，请应用以下原则。

进行审查时，要放慢界面的节奏：在浏览器的 Animations 面板中以 10% 的速度回放动画，并逐一检查每种状态：悬停、聚焦、激活、加载、空状态。在 10% 速度下感觉不对劲的地方，通常就是正常速度下隐约存在的问题。

保留项目现有的组件库、设计令牌和信息密度。遵循项目已经建立的动效语言，除非下面的某条原则规定了精确的交互模式。

排版（文本换行、字体渲染、表格数字、间距）由 `better-typography` 技能负责；任何与文本相关的内容都应使用该技能。无障碍（点击区域、聚焦状态、键盘支持、ARIA、减少动效）由 `better-accessibility` 技能负责。布局结构（分组、区块间距、断点、空间方向 RTL）由 `better-layout` 技能负责。

## 快速参考

| 类别 | 使用时机 |
| --- | --- |
| [表面](surfaces.md) | 边框圆角、视觉对齐、阴影、图像轮廓 |
| [动画](animations.md) | 可中断的过渡、按下时缩放、页面加载时跳过动画、主题切换、动效克制 |
| [进入与退出](enter-exit.md) | 分阶段进入、交错时间、退出过渡 |
| [图标过渡](icon-transitions.md) | 状态变化时对图标进行交叉淡化，无论是否使用动效库 |
| [图标](icons.md) | 图标描边粗细、通过 `currentColor` 表示状态、轮廓与填充、尺寸、RTL 翻转 |
| [性能](performance.md) | 过渡选择器、`will-change` 的使用 |
| [审查输出格式](review-output.md) | 严重程度等级、问题表、验证、结论 |

## 核心原则

### 1. 同心边框圆角

外层圆角 = 内层圆角 + 内边距。嵌套元素的圆角不匹配，是最常见的界面观感不协调原因。

### 2. 优先视觉对齐，而非几何对齐

当几何居中看起来不协调时，应采用视觉对齐。带图标的按钮、播放三角形以及不对称图标，都需要手动调整。

### 3. 用阴影表现层级，用边框表现结构

对于按钮、卡片和容器，如果边框的存在只是为了营造深度，优先使用分层的透明 `box-shadow` 值。保留那些能够传达结构或状态的边框：分隔线、布局分隔符，以及选中或聚焦状态。

### 4. 可中断的动画

使用 CSS 过渡处理交互状态变化：它们可以在动画进行到一半时被中断。将关键帧保留给只运行一次的分阶段序列。

### 5. 拆分并交错进入动画

对于不常见的分阶段进入动画，如果顺序有助于传达层级关系，应将内容拆分成具有语义的块，并以约 100ms 的间隔交错显示，而不是为单个容器设置动画。不要为常规、高频交互添加交错效果。[交错和退出方案](enter-exit.md)。

### 6. 细微的退出动画

使用较小的固定 `translateY`，而不是完整高度。退出动画应比进入动画更柔和。进入和退出过渡都使用 `ease-out`。

### 7. 上下文相关的图标动画

使用 `opacity`、`scale` 和 `blur` 为图标添加动画，而不是切换可见性。严格使用以下数值：scale 从 `0.25` 变为 `1`，opacity 从 `0` 变为 `1`，blur 从 `4px` 变为 `0px`。如果项目的 `package.json` 中存在 `motion` 或 `framer-motion`，请匹配该包的导入路径（如果两者都存在，则使用附近已经建立的导入方式），并使用 `transition: { type: "spring", duration: 0.3, bounce: 0 }`；bounce 必须始终为 `0`。如果没有安装 motion 库，请将两个图标都保留在 DOM 中（其中一个使用绝对定位），并通过 CSS 过渡使用 `cubic-bezier(0.2, 0, 0, 1)` 实现交叉淡化；这样无需任何依赖即可同时实现进入和退出动画。[两种实现方式](icon-transitions.md)。

### 8. 图片轮廓

为图片添加低透明度的细微 `1px` 轮廓，以保持一致的景深效果。浅色模式下颜色必须是纯黑色（`oklch(0 0 0 / 0.1)`），深色模式下必须是纯白色（`oklch(1 0 0 / 0.1)`），绝不能使用类似 slate、zinc 或任何带色调的中性近黑色。带色调的轮廓会吸收下方表面的颜色，在图片边缘看起来像污渍。

### 9. 按下时缩放

点击时使用细微的 `scale(0.96)` 可为按钮提供触觉反馈。始终使用 `0.96`；低于 `0.95` 的数值会显得过于夸张。当动画可能造成干扰时，添加 `static` 属性将其禁用。[CSS、Tailwind 和 Motion 的实现方式](animations.md#scale-on-press)。

### 10. 跳过页面加载时的动画

在 `AnimatePresence` 上使用 `initial={false}`，以防止首次渲染时播放进入动画。确认这不会破坏有意设置的入场动画。

### 11. 抑制主题切换时的过渡

主题切换会同时改变几乎所有元素的颜色、背景、边框和阴影，因此这些属性上的每个过渡都会同时触发，使切换过程变得拖沓，而不是瞬间完成。注入 `*,*::before,*::after{transition:none !important}`，强制触发回流，然后在下一帧移除它。[实现方式](animations.md#suppress-transitions-on-theme-switch)。

### 12. 只过渡发生变化的属性

始终明确指定具体属性：`transition-property: scale, opacity`。Tailwind 的 `transition-transform` 覆盖 `transform, translate, scale, rotate`。

### 13. 谨慎使用 `will-change`

仅用于 `transform`、`opacity`、`filter`，也就是 GPU 可以合成的属性。绝不要使用 `will-change: all`。只有在注意到首帧卡顿时才添加。

### 14. 使图标描边与文本字重匹配

文本旁边的图标应承载与文本相同的视觉重量：常规（400）文本旁使用 `1.5px` 描边，半粗（600）文本旁使用 `2px`。每套图标使用一种描边粗细；同一界面中绝不要混用多个图标库。

### 15. 使用单个 SVG，根据状态重新着色

图标使用 `currentColor`，并通过 CSS 的颜色和透明度表现其状态（悬停、选中、禁用），绝不要使用单独的资源。默认使用轮廓变体；填充变体用于标记激活状态。

### 16. 克制使用动画

高频交互不使用自定义动画：每次触发都会重复消耗注意力。动效绝不会是唯一的反馈渠道；每次动画状态变化还需要静态提示（颜色、图标、标签）。

## 常见错误

| 错误 | 修复方法 |
| --- | --- |
| 紧密嵌套的父元素和子元素使用相同的边框圆角 | 计算 `outerRadius = innerRadius + padding` |
| 图标看起来没有居中 | 通过内边距进行视觉调整，或直接修复 SVG |
| 仅使用边框来伪造悬浮效果 | 使用带透明度的分层 `box-shadow`；保留结构边框和状态边框 |
| 分阶段进入或上下文退出效果突兀 | 对低频进入效果使用错峰动画，并让保留上下文的退出效果保持微妙 |
| 有状态图标或切换控件在页面加载时为默认状态添加动画 | 为对应的 `AnimatePresence` 添加 `initial={false}`；保留有意设计的页面进入动画 |
| 主题切换使整个页面交叉淡化 | 在切换时禁用过渡，强制回流，并在下一帧恢复 |
| 元素使用 `transition: all` | 指定确切的属性 |
| 首帧动画卡顿 | 添加 `will-change: transform`（谨慎使用） |
| 粗体文本旁边的细线图标 | 使描边宽度与文本字重匹配 |
| 为每种状态分别准备图标资源 | 使用一个 `currentColor` SVG，通过 CSS 表示不同状态 |
| 到处使用实心图标 | 默认使用轮廓图标，仅在激活状态下使用实心图标 |
| 每次悬停或按键都使用进入动画 | 使用即时反馈，或使用 ≤150ms 的透明度/颜色过渡 |

## 报告

当所有已确认的问题都按照 [review-output.md](review-output.md) 中的格式报告，并包含验证结果和结论时，独立的 UI 细节优化审查即告完成。在 `better-interface` 下，则以其格式为准。