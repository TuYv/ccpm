---
name: better-accessibility
description: Accessibility engineering for product interfaces, from focus states and keyboard support to ARIA, forms, and screen readers. Use when building or reviewing UI components, modals, menus, forms, custom widgets, or when the user says "make this accessible" or reports keyboard or screen-reader issues. Triggers on accessibility, a11y, WCAG, aria, focus ring, focus-visible, focus trap, keyboard navigation, tab order, tabindex, screen reader, sr-only, aria-live, alt text, hit area, touch target, pointer-events, hover on touch, prefers-reduced-motion, autoplay, toast duration, skip link, semantic HTML, aria-label, form errors, disabled buttons, "not keyboard accessible".
---
# 与工艺相伴的无障碍性

无障碍性不是最后才加上的合规性检查项；它是界面工艺的基础。只要使用平台提供的能力，大部分无障碍支持都不需要额外成本：原生元素自带键盘支持，真正的标签会自动播报，而可见的焦点环只需一条 CSS 规则。构建或审查 UI 代码时，请遵循这些原则，并使用项目自身的惯用方式编写每一项修复：使用项目当前已有的样式系统，绝不要在旁边再引入第二套系统。

进行审查时，先以纯键盘用户的方式操作界面（每条流程都必须不使用鼠标即可完成），然后再以屏幕阅读器用户的方式操作：每个控件是否都能播报名称、角色和状态？不确定时，优先使用平台默认行为，而不是自定义重做；与其添加 ARIA，不如移除它。

渲染后的成对对比度测量和颜色修复由 `better-colors` skill 覆盖；视觉文本大小和 iOS 输入框缩放由 `better-typography` 覆盖；空间上的 RTL 布局由 `better-layout` 覆盖。

## 快速参考

| 类别 | 使用时机 |
| --- | --- |
| [焦点与键盘](focus-and-keyboard.md) | 焦点环、跳过链接、tabindex、焦点捕获、APG 键盘模式 |
| [语义与 ARIA](semantics-and-aria.md) | 优先使用原生元素、按钮与链接的区别、地标、可访问名称、禁用状态 |
| [表单](forms.md) | 标签、autocomplete、错误消息、输入类型 |
| [屏幕阅读器](screen-readers.md) | 视觉隐藏内容、实时区域、toast、替代文本、SVG |
| [点击区域](hit-areas.md) | 目标尺寸、扩展点击区域、碰撞规则 |
| [动效与缩放](motion-and-zoom.md) | `prefers-reduced-motion`、自动播放和定时 UI、200% 缩放、重排、rem 与 px |
| [审查输出格式](review-output.md) | 严重程度等级、问题表、验证、结论 |

## 核心原则

### 1. 优先使用原生元素

ARIA 的第一条规则：原生元素存在时，不要使用 ARIA。操作使用 `<button>`，导航使用 `<a href>`（必须支持 Cmd/Ctrl/中键点击），绝不要使用 `<div onClick>`。没有 ARIA 总比错误的 ARIA 更好。

### 2. 可见的焦点环

设置 `:focus-visible` 的样式，而不是直接设置 `:focus`，这样键盘用户可以看到焦点环，而鼠标用户通常不会看到。优先使用浏览器未经修改的焦点指示器。如果设计需要自定义焦点环，请使用项目的焦点 token 或其他明确的颜色，并验证完整指示器穿过的每一种相邻颜色；只有在完成同样的检查后，`currentColor` 才是可接受的。至少使用 `2px` 的实线周边，或具有同等可见面积的方案。没有经过验证的替代方案时，绝不要使用 `outline: none`，并在强制颜色模式下保留系统颜色。

### 3. 完整的键盘支持

每个指针交互都必须有对应的键盘操作路径，并遵循 ARIA APG 模式：Escape 关闭覆盖层，方向键在复合控件（标签页、菜单、列表框）内部移动，Tab 在控件之间移动，Enter 和 Space 执行操作。只能使用 `tabindex="0"`（加入自然 Tab 顺序）和 `tabindex="-1"`（以编程方式获得焦点），绝不要使用正值，因为它会破坏自然顺序。复合控件使用 roving tabindex：活动项为 `0`，其他所有项为 `-1`。

### 4. 捕获并恢复焦点

模态框会对背景内容设置 `inert`，打开时将焦点移入其中，关闭时将焦点返回触发控件。添加 `overscroll-behavior: contain`，以防止背景内容滚动。

### 5. 最小点击区域

WCAG 2.5.8 的 AA 级基线要求目标区域达到 24×24 CSS 像素，或符合其规定的间距、等效控件、内联、用户代理或必要例外之一。为便于激活，在触摸场景中应以 44×44px 为目标；在桌面界面中，如果密度允许，应以 40×40px 为目标。如果可见元素应保持较小尺寸，可使用伪元素扩展点击区域。扩展后的点击区域绝不能相互重叠，并为装饰层设置 `pointer-events: none`，以确保发光或渐变效果不会吞掉原本应作用于下方控件的点击。

### 6. 为每个控件添加标签并指定类型

每个输入控件都要有 `<label for>` 或包裹它的 `<label>`；占位符永远不能充当标签，标签和控件应共享同一个点击目标：复选框与其文本之间不能存在无法点击的空白区域。为输入控件添加具有明确含义的 `name` 对应的 `autocomplete`，并根据键盘类型设置正确的 `type` 和 `inputmode`。绝不要阻止粘贴；用户需要粘贴密码和一次性验证码。

### 7. 会被播报的错误

在请求开始前保持提交按钮可用；请求开始后再将其禁用，并显示加载指示器，同时保留原始标签文本。提交时进行验证：为验证失败的字段设置 `aria-invalid="true"`，让 `aria-describedby` 指向内联错误文本，并将焦点移至第一个无效字段。只有当原生控件确实不可用时，才使用原生的 `disabled`。只有在有意保留焦点可达性或可发现性时，才使用 `aria-disabled="true"`；此时还必须在代码中阻止指针、键盘和表单行为，并明确设置该状态的样式。

### 8. 到处提供可访问名称

仅包含图标的按钮需要描述性的 `aria-label`。可见的标签文本必须出现在可访问名称中。装饰性元素应设置 `aria-hidden="true"`，绝不能将其设置在可聚焦元素上。

### 9. 不要只依赖颜色

状态需要冗余提示：在颜色之外，同时使用图标、文本或下划线。根据内容和状态判断适用的 WCAG 对比度要求，然后使用 `better-colors` 测量渲染后的前景色/背景色组合。当对比度不符合要求时，报告该颜色组合及其未满足的要求；除非用户明确要求，否则不要修改项目的颜色。

### 10. 遵循 prefers-reduced-motion

将动画包裹在 `@media (prefers-reduced-motion: no-preference)` 中，使其默认仅在用户允许时启用。在减少动画的情况下，用透明度交叉淡化替代滑动和缩放；完全禁用视差效果和自动播放。无论用户的偏好如何：自动播放的媒体都需要提供可见的暂停控件，包含操作或错误信息的 Toast 应一直保留，直到用户将其关闭。

### 11. 播报动态内容

对于特定字段的验证，使用 `aria-describedby`；对于与控件无关的非紧急更新（例如 Toast 或结果数量），使用礼貌型实时区域（`role="status"`）；只有对于与控件无关的紧急错误，才使用 `role="alert"`。为了可靠地重复播报礼貌型通知，应在更新文本之前先渲染一个稳定的空区域；动态插入的警报具有不同的支持情况，必须使用目标屏幕阅读器进行测试。

### 12. 按用途编写替代文本

装饰性图片使用 `alt=""`，信息性图片描述其含义，功能性图片描述其操作：搜索图标按钮应使用 `alt="Search"`，而不是 `alt="magnifying glass"`。

### 13. 结构就是导航

使用能够描述其所属部分并构成连贯大纲的标题；一个页面级 `<h1>` 以及正确嵌套的标题层级是推荐的默认做法，而不是独立的 WCAG 通过/不通过规则。提供一个可见的主 `<main>` 地标。当重复的导航或页面界面元素位于其前方时，将“跳转到内容”链接作为第一个可聚焦元素。锚定标题应设置 `scroll-margin-top`。

### 14. 经受缩放和文本调整

页面必须在 200% 缩放下正常工作，并在 320px 宽度下重新排版，且不出现水平滚动。文本容器应使用 `min-height`，而不是固定的 `height`；在符合代码库约定的情况下，优先使用 `rem` 断点；同时不要让 viewport meta 限制读者能够缩放的程度。

## 常见错误

| 错误 | 修复方法 |
| --- | --- |
| 使用 `outline: none` 移除焦点环 | 改为设置 `:focus-visible` 的样式；鼠标点击不会显示它 |
| 假定自定义焦点颜色在所有情况下都有效 | 针对每一种相邻颜色以及强制颜色模式，验证完整的焦点指示器 |
| 使用 `<div onClick>` 作为按钮或链接 | 操作用 `<button>`，导航用 `<a href>` |
| 将占位符作为唯一标签 | 添加可见的 `<label for>`；用户输入内容后占位符会消失 |
| 使用正数 `tabindex` 修复焦点顺序 | 修复 DOM 顺序；只使用 `0` 和 `-1` |
| 重复的 polite 更新播报不一致 | 保持一个稳定的空状态区域并更新其文本；测试目标屏幕阅读器 |
| 为常规 toast 使用 `assertive` 实时区域 | 使用 `polite`；将 `assertive` 留给错误 |
| 在可聚焦元素上设置 `aria-hidden="true"` | 移除它，或使该元素不可聚焦 |
| 功能性图标的 alt 描述图片本身 | 描述操作：使用 `alt="Search"`，而不是 `alt="magnifying glass"` |
| 直到表单有效后才启用提交按钮 | 保持按钮启用；在提交时验证，并将焦点移至第一个错误 |
| 装饰性发光或渐变层拦截点击 | 在该图层上设置 `pointer-events: none`，并添加 `aria-hidden="true"` |
| 触摸点击后 hover 样式仍保持激活 | 使用 `@media (hover: hover)` 控制 hover 样式 |
| 在原生 `disabled` 控件上使用工具提示 | 在控件旁提供持久文本，或使用 `aria-disabled` 使其保持可聚焦 |

## 报告

当每个已确认的问题都按照 [review-output.md](review-output.md) 中的格式完成报告，并包含验证结果和结论时，独立的无障碍审查即告完成。在 `better-interface` 下，则以其格式为准。