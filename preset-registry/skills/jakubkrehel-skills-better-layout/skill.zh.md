---
name: better-layout
description: Layout structure for web interfaces, from grouping and alignment to reading order, progressive disclosure, and adaptive breakpoints. Use when structuring a page or component, spacing or aligning controls, deciding what collapses at small sizes, handling RTL layout direction, or reviewing frontend code for layout. Triggers on layout, spacing, alignment, grouping, negative space, whitespace, visual hierarchy, reading order, progressive disclosure, breakpoints, responsive layout, container queries, safe area, full-bleed, edge-to-edge, layout margins, RTL layout, logical properties.
---
# 传达结构的布局

布局在阅读任何文字之前就传达了信息：位置、间距和对齐本身就承载着层级关系，充足的留白胜过装饰。优秀的布局也能经受压力测试：调整尺寸、翻译文本、为 RTL 镜像后，仍应保持完整。在构建或审查 UI 代码时应用这些原则，并使用项目自身的惯用方式编写每一项修复：使用现有的样式系统，绝不要在旁边再引入第二套系统。

命中区域大小和焦点行为由 `better-accessibility` skill 负责；视觉润色（圆角、阴影、动画）由 `better-ui` skill 负责；行长和文本间距由 `better-typography` skill 负责。

对于尚未建立密度或间距系统的界面，可将下面的数值视为起始点。当预设的平台界面元素、紧凑的专业工具以及项目令牌在命中区域、缩放、本地化和视口压力测试下仍保持可用时，应予以保留。

## 快速参考

| 类别 | 使用场景 |
| --- | --- |
| [分组与对齐](grouping-and-alignment.md) | 间距与分隔线、对齐边缘、逻辑属性、重要性排序 |
| [间距与自适应](spacing-and-adaptivity.md) | 目标之间的间距、布局边距、渐进式展示、全出血内容、断点、i18n 增长 |
| [审查输出格式](review-output.md) | 严重性等级、发现项表格、验证、结论 |

## 核心原则

### 1. 用留白分组，而不是用线条

负空间是主要的分组工具；背景形状次之；分隔线应最后使用，而且仅在单靠留白无法承载结构时使用。组间间距必须至少是组内间距的 2 倍（组内 `8px` → 组间 `16px`+），否则分组会显得杂乱。

### 2. 保持控件与内容的区分

交互元素必须看起来具有交互性：使用背景形状、边框或一致的放置区域。绝不要将控件设计得与相邻的静态文本完全相同。

### 3. 对齐到共享边缘

选择对齐边缘并保持一致；每一条多余的边缘都会显得杂乱。对于每一级从属关系，使用项目统一的间距步进（`16px` 是一个实用的默认值）。对于依赖方向的布局，使用逻辑属性（`padding-inline-start`、`margin-inline-end`）；只有在确实表示物理几何关系时，才使用物理上的 left/right。

### 4. 按重要性排序

最重要的内容应靠近顶部和起始边缘；阅读顺序应从上到下、从起始方向到末尾方向流动。应思考起始/末尾，而不是左/右。

### 5. 暗示隐藏内容

渐进式展示需要一个可见的提示。使用项目中既有的提示方式；如果没有，则让下一项从滚动边缘多露出 `16–32px`，或显示一个展开控件。隐藏内容却完全没有提示，效果就等同于它不存在。

### 6. 在目标之间留出呼吸空间

在没有既定密度系统的情况下，相邻的带边框或填充控件之间可从 `12px` 的间距开始；无边框的纯文本或纯图标控件周围可留出 `24px` 的间隔。只要 `better-accessibility` 的命中区域不会重叠，且控件仍能在视觉上清晰区分，紧凑布局可以使用更小的间距。

### 7. 将按钮从边缘向内嵌入

在内容布局中，将全宽按钮放置在布局边距以内（移动端从内联方向的 `16px` 附近开始），并设置明显的圆角。当按钮有意遵循既有的平台或应用界面框架、考虑了安全区域，并且能够与系统 UI 清晰区分时，可以采用贴边操作。

### 8. 内容延伸至边缘，控件悬浮其上

背景和媒体内容延伸至视口边缘；控件和文本则保持在布局边距与安全区域（`env(safe-area-inset-*)`）以内。粘性界面框架悬浮在内容层之上，而不是截断内容。

### 9. 在结构确实无法维持前保持原样

断点应由内容决定，而不是由设备预设决定。只要扩展布局确实能够容纳，就尽可能保持该布局并延后折叠；组件级适配优先使用容器查询。首先测试最小和最大尺寸。

### 10. 为增长和裁切做好规划

应针对大量且依赖语言的字符串增长进行规划，而不是依赖通用百分比：文本容器不得设置固定宽度或高度，并允许行换行。不要将关键操作放置在调整大小或滚动时容易被裁切的位置；应将其保留在正常流程中，或放置在适合该产品的稳定界面框架中，确保始终可访问。

## 常见错误

| 错误 | 修复方式 |
| --- | --- |
| 在使用间距即可解决的地方添加分隔线 | 移除分隔线，将组之间的间距加倍 |
| 可本地化布局中使用 `margin-left` / `padding-right` | 使用 `margin-inline-start` / `padding-inline-end` |
| 内容布局中的按钮意外贴到视口边缘 | 将其嵌入项目边距以内；保留有意设计的平台界面框架 |
| 看起来已经到末尾的轮播图/滚动区域 | 让下一项从边缘露出 `16–32px` |
| 相邻控件合并，或扩大的点击区域相互重叠 | 使用项目间距尺度增大间距；以 `12px`/`24px` 作为起始值 |
| 因为默认值而在 768/1024 设置断点 | 在内容实际无法容纳时设置断点 |
| 按照单一语言设置固定宽度的文本容器 | 使用 `max-width` + 换行；测试伪本地化和具有代表性的语言环境 |
| 将主要操作放在面板底部容易被裁切的位置 | 使用粘性定位，或结合安全区域内边距的稳定界面框架 |

## 报告

当所有已确认的问题都按照 [review-output.md](review-output.md) 中的格式报告，并包含验证结果和结论时，独立布局审查即告完成。在 `better-interface` 下，则以其格式为准。