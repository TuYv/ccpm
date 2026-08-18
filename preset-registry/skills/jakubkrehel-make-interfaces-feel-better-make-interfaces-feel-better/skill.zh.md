---
name: make-interfaces-feel-better
description: >-
  Design engineering principles for making interfaces feel polished. Use when building UI components, reviewing frontend code, implementing animations, hover states, shadows, borders, typography, icons, micro-interactions, enter/exit animations, or any visual detail work. Supports quick and full review modes. Triggers on UI polish, design details, "make it feel better", "feels off", stagger animations, border radius, optical alignment, font smoothing, tabular numbers, image outlines, box shadows, icons, icon stroke weight, icon states, motion restraint.
---
# 让界面体验更出色的细节

优秀的界面很少只依靠单一因素。通常是一系列细节不断叠加，最终形成出色的体验。构建或审查 UI 代码时，请应用这些原则。在提出或编写修复方案之前，先识别项目现有的样式系统，并使用该系统表达改动：Tailwind 项目使用 Tailwind，CSS 项目使用普通 CSS，使用 CSS-in-JS 的项目则采用其既有的 CSS-in-JS 方案。不要仅为了应用一项细节优化，就引入第二套样式系统。

进行审查时，放慢界面的运行速度：在浏览器的 Animations 面板中以 10% 的速度回放动画，并逐一检查每种状态：悬停、聚焦、激活、加载、空状态。在 10% 的速度下感觉不对的地方，通常就是全速运行时隐约存在的问题。

## 快速参考

| 类别 | 使用场景 |
| --- | --- |
| [Typography](typography.md) | 文本换行、字体平滑、等宽数字 |
| [Surfaces](surfaces.md) | 边框圆角、视觉对齐、阴影、图片轮廓、点击区域 |
| [Animations](animations.md) | 可中断动画、进入/退出过渡、图标动画、按下时缩放、克制使用动效 |
| [Icons](icons.md) | 图标描边粗细、使用 `currentColor` 表示状态、轮廓与填充、尺寸、RTL 翻转 |
| [Performance](performance.md) | 过渡的 specificity、`will-change` 的使用 |

## 核心原则

### 1. 同心边框圆角

外层圆角 = 内层圆角 + 内边距。嵌套元素的圆角不匹配，是最常让界面感觉不对的因素。

### 2. 优先视觉对齐，而非几何对齐

当几何居中看起来不对时，应进行视觉对齐。带图标的按钮、播放三角形以及不对称图标，都需要手动调整。

### 3. 使用阴影表现层级，使用边框表现结构

对于按钮、卡片和容器，如果边框的存在只是为了营造深度，优先使用分层的透明 `box-shadow` 值。保留那些用于传达结构或状态的边框：分隔线、布局分隔符，以及选中或聚焦状态。

### 4. 可中断的动画

对于交互状态变化，使用 CSS transitions —— 它们可以在动画进行到一半时被中断。将 keyframes 保留给只运行一次的分阶段序列。

### 5. 拆分并错开进入动画

对于不频繁发生、且通过顺序有助于传达层级关系的分阶段进入动画，应将内容拆分为语义块，并以约 100ms 的间隔错开它们，而不是对单个容器进行动画。不要对常规、高频交互进行错开处理。

### 6. 细微的退出动画

使用较小的固定 `translateY`，而不是完整的高度变化。退出动画应该比进入动画更柔和。进入和退出过渡都使用 `ease-out`。

### 7. 与上下文相关的图标动画

使用 `opacity`、`scale` 和 `blur` 为图标添加动画，而不是切换可见性。严格使用以下值：scale 从 `0.25` 变为 `1`，opacity 从 `0` 变为 `1`，blur 从 `4px` 变为 `0px`。如果项目的 `package.json` 中存在 `motion` 或 `framer-motion`，请匹配该包的导入路径（如果两者都存在，则遵循附近代码中已经建立的导入方式），并使用 `transition: { type: "spring", duration: 0.3, bounce: 0 }` —— bounce 必须始终为 `0`。如果没有安装动效库，则将两个图标都保留在 DOM 中（其中一个使用绝对定位），并通过 CSS transitions 和 `cubic-bezier(0.2, 0, 0, 1)` 实现交叉淡化 —— 这样无需任何依赖即可同时获得进入和退出动画。

### 8. 字体平滑

在 macOS 上，将 `-webkit-font-smoothing: antialiased` 应用于根布局，以获得更清晰的文本效果。

### 9. 表格数字

对任何动态更新的数字使用 `font-variant-numeric: tabular-nums`，以防止布局偏移。

### 10. 文本换行

在标题上使用 `text-wrap: balance`。对正文使用 `text-wrap: pretty`，以避免孤行。

### 11. 图像轮廓

为图像添加低透明度的细微 `1px` 轮廓，以保持一致的层次感。浅色模式下颜色必须是纯黑色（`oklch(0 0 0 / 0.1)`），深色模式下必须是纯白色（`oklch(1 0 0 / 0.1)`），绝不能使用类似 slate、zinc 或任何带色调的中性色的近黑色。带色调的轮廓会吸收下方表面的颜色，在图像边缘呈现出污迹感。

### 12. 按下时缩放

点击时使用细微的 `scale(0.96)` 为按钮提供触感反馈。始终使用 `0.96`。绝不要使用小于 `0.95` 的值，因为任何低于该值的效果都会显得夸张。添加 `static` prop，以便在动画会造成干扰时将其禁用。

### 13. 页面加载时跳过动画

在 `AnimatePresence` 上使用 `initial={false}`，以防止首次渲染时播放进入动画。确认这不会破坏有意设置的入场动画。

### 14. 绝不使用 `transition: all`

始终指定精确的属性：`transition-property: scale, opacity`。Tailwind 的 `transition-transform` 覆盖 `transform, translate, scale, rotate`。

### 15. 谨慎使用 `will-change`

仅用于 `transform`、`opacity`、`filter`，这些属性可以由 GPU 合成。绝不要使用 `will-change: all`。只有在注意到首帧卡顿时才添加它。

### 16. 最小点击区域

交互元素在触摸或移动端场景下应优先使用 44×44px 的点击区域。在高密度桌面界面中，至少使用 40×40px。如果可见元素更小，则使用伪元素扩展点击区域。绝不要让两个元素的点击区域发生重叠。

### 17. 让图标描边与文本字重匹配

文本旁边的图标应承载与文本相同的视觉重量：常规（400）文本旁使用 `1.5px` 描边，半粗体（600）文本旁使用 `2px` 描边。每组图标只能使用一种描边粗细；同一界面绝不要混用多个图标库。

### 18. 一个 SVG，按状态重新着色

图标使用 `currentColor`，并通过 CSS 的颜色和透明度来呈现其状态（悬停、选中、禁用），绝不要使用单独的资源。默认使用轮廓变体；填充变体表示激活状态。

### 19. 克制使用动效

高频交互中不要使用自定义动画：每次触发都会重复产生注意力成本。动效绝不能成为唯一的反馈渠道；每次动画状态变化还必须提供颜色、图标或标签等静态提示。

## 常见错误

| 错误 | 修复方法 |
| --- | --- |
| 父元素和子元素使用相同的圆角半径 | 计算 `outerRadius = innerRadius + padding` |
| 图标看起来没有居中 | 通过内边距进行视觉调整，或直接修复 SVG |
| 仅使用边框伪造高度感 | 使用带透明度的分层 `box-shadow`；保留结构边框和状态边框 |
| 分阶段入场或保留上下文的退出效果令人突兀 | 对低频入场进行错开处理，并让保留上下文的退出效果保持细微 |
| 数字导致布局偏移 | 应用 `tabular-nums` |
| macOS 上的文本过粗 | 对根布局应用 `antialiased` |
| 动画在页面加载时播放 | 向 `AnimatePresence` 添加 `initial={false}` |
| 元素上使用 `transition: all` | 指定精确的属性 |
| 首帧动画卡顿 | 添加 `will-change: transform`（谨慎使用） |
| 小型控件的点击区域过小 | 使用伪元素将触摸/移动端点击区域扩展到 44×44px，或在高密度桌面 UI 中至少扩展到 40×40px |
| 粗体文本旁的图标描边过细 | 让描边宽度与文本字重匹配 |
| 为每种状态分别使用独立的图标资源 | 使用一个 `currentColor` SVG，通过 CSS 表示不同状态 |
| 到处使用填充图标 | 默认使用轮廓图标，仅在激活状态下使用填充图标 |
| 每次悬停或按键时都播放入场动画 | 使用即时反馈，或使用不超过 150ms 的透明度/颜色过渡 |

## Review 输出格式

未提供审查模式时，使用 `full`。

| 模式 | 覆盖范围 | 问题上限 |
| --- | --- | --- |
| `quick` | 主要用户路径和流量最高的状态；仅报告 `HIGH` 和 `MEDIUM` 级问题 | 5 |
| `full` | 覆盖排版、表面样式、动画、图标和性能的全部请求范围 | 15 |

### 范围与覆盖情况

说明审查模式、确切范围、框架、样式约定以及任何审查边界。展示实际检查过的内容：

| 类别 | 检查的证据 | 结果 |
| --- | --- | --- |
| 排版 | 文件、组件、状态或检查项 | 问题数量、`Clear`，或说明原因的 `Not reviewed` |

包含全部五个 Quick Reference 类别。绝不能暗示已审查未检查的界面或范围。

### 问题

按原则对问题分组。使用包含 **Severity**、**Location**、**Before**、**After** 和 **Why** 列的 Markdown 表格。包含所有已实施或提议的更改，不要只列出其中一部分。绝不要单独使用“Before:”/“After:”行。

- **Severity**：`HIGH` 表示交互不可访问、具有误导性、无法阅读或会反复造成干扰；`MEDIUM` 表示明显的可用性或一致性问题；`LOW` 表示局部的细节优化，且仅出现在 `full` 模式中。
- **Location**：引用 `path/to/file:line`。如果产物没有源文件，则引用确切的屏幕和组件。
- **Before / After**：展示当前实现和可执行的替换方案。
- **Why**：指出违反的原则，并解释其对用户的影响。

将重复出现的系统性问题合并为一行，并列出所有受影响的位置。没有问题的原则不要列出，也不要为了达到上限而填充报告。

### 示例

#### 同心边框圆角
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `src/Card.tsx:28` | 卡片和内部按钮（`p-2`）都使用 `rounded-xl` | 卡片使用 `rounded-2xl`（`8 + 8 = 16`），内部按钮使用 `rounded-lg` | 嵌套圆角应保持同心 |
| LOW | `src/card.css:11` | 两个嵌套表面都使用 `border-radius: 16px` | 外层使用 `24px`，内层使用 `16px`，内边距为 `8px` | 相同的嵌套圆角会让内层表面显得向内收缩 |

#### 表格式数字
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `src/Counter.tsx:17` | `<span>{count}</span>` | `<span className="tabular-nums">{count}</span>` | 比例数字会导致数值变化时位置发生偏移 |
| LOW | `src/timer.css:8` | 计时器使用默认数字 | 为计时器添加 `font-variant-numeric: tabular-nums` | 等宽数字可以保持计时器稳定 |

#### 按下时的缩放
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `src/Button.tsx:19` | `<button className="...">` | 添加 `active:scale-[0.96] transition-transform` | 按下反馈能让控件响应感更强 |
| MEDIUM | `src/button.css:24` | 按下时使用 `scale(0.9)` | 提高到 `scale(0.96)` | 低于 `0.95` 的缩放会显得过于夸张 |

### 考虑过但放弃的方案

在 `quick` 模式中包含 1–3 个真实候选项，在 `full` 模式中包含 2–5 个真实候选项：

| 位置 | 候选项 | 拒绝原因 |
| --- | --- | --- |
| `src/Card.tsx:28` | 增加阴影 | 现有层次感与共享表面设计令牌一致；修改单个卡片会降低一致性 |

不要编造填充内容。如果范围内的边界候选项较少，请列出实际存在的候选项并说明这一点。

### 验证与结论

在列出问题之后：

1. **验证**：列出实际运行的确切命令或执行的交互操作，以及观察到的结果。检查每一种相关状态；涉及动画时，以 10% 的速度检查动效。如果某项检查未运行，请标记为 **未验证** 并说明仍需完成的内容。
2. **结论**：如果仍有任何 `HIGH` 级别的问题，结论为 `Block`；如果只剩 `MEDIUM` 或 `LOW` 级别的问题，结论为 `Needs changes`；只有在不存在任何可操作的问题时，结论才为 `Approve`。在结论旁列出所有未验证的检查。

如果没有问题，请省略问题表，写明“没有可操作的界面润色问题”，报告验证结果和被拒绝的候选项，并以 `Approve` 结尾。