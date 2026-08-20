---
name: better-accessibility
description: Accessibility engineering for product interfaces. Use when building or reviewing UI components and custom widgets, or when the user reports a keyboard or screen-reader problem. Triggers on accessibility, a11y, WCAG, aria, focus ring, focus trap, keyboard navigation, tabindex, screen reader, sr-only, alt text, hit area, hover on touch, prefers-reduced-motion, autoplay, skip link, semantic HTML, form errors, disabled buttons, "not keyboard accessible".
---
# 无障碍

如果你使用平台，大多数无障碍能力都是免费获得的。原生元素自带键盘支持，真实标签会自行被读出，并且可见焦点环只需一条 CSS 规则。

在项目的样式系统中编写每一项修复，并使用下方给出的精确值，而不是看起来相似的常见替代值。

审查意味着进行两轮检查。首先是仅使用键盘，确保无需鼠标即可完成每个流程。然后是使用屏幕阅读器，确保每个控件都会读出名称、角色和状态。拿不准时，选择平台默认行为而非自定义重建，并且应移除 ARIA，而不是添加它。

对比度测量和颜色修复属于 `better-colors`。文字大小和 iOS 输入缩放属于 `better-typography`。空间 RTL 布局属于 `better-layout`。

## 原生元素优先

ARIA 的第一条规则：存在原生元素时，不要使用 ARIA。操作使用 `<button>`，导航使用 `<a href>`，绝不使用 `<div onClick>`。真实链接必须支持 Cmd/Ctrl/中键点击。没有 ARIA 比错误的 ARIA 更好。有关地标、按钮与链接的区别以及禁用状态，请参阅 [semantics-and-aria.md](semantics-and-aria.md)。

## 可见焦点环

为 `:focus-visible` 设置样式，而不是裸用 `:focus`。键盘用户会获得焦点环，而鼠标用户通常不会。优先使用浏览器未修改的指示器。

自定义焦点环需要项目焦点令牌或其他明确的颜色。针对其跨越的每一种相邻颜色验证整个指示器，`currentColor` 也包括在内。至少使用 `2px` 实线边界，或等效的可见面积。绝不要在没有经过验证的替代方案时使用 `outline: none`，并在强制颜色模式下保留系统颜色。相关方案见 [focus-and-keyboard.md](focus-and-keyboard.md)。

## 完整键盘支持

每一种指针交互都需要对应的键盘路径。遵循 ARIA APG 模式：Escape 关闭浮层，方向键在复合组件内移动，Tab 在组件之间移动，Enter 和 Space 激活。

仅使用 `tabindex="0"` 加入自然 Tab 顺序，并使用 `tabindex="-1"` 实现程序化焦点。正值会破坏该顺序。复合组件使用漫游 tabindex，其中活动项为 `0`，其他所有项均为 `-1`。

## 捕获并恢复焦点

模态框应对背景内容设置 `inert`，打开时将焦点移入内部，关闭时将焦点返回给触发器。添加 `overscroll-behavior: contain`，以避免背景内容滚动。

## 最小点击区域

WCAG 2.5.8 的 AA 级基线是 `24×24` CSS 像素的目标区域，或其间距、等效控件、行内、用户代理和必要例外之一。在密度允许时，触摸设备的目标应为 `44×44px`，桌面端应为 `40×40px`。当可见元素应保持更小时，使用伪元素扩展。

绝不要让扩展后的点击区域重叠。为装饰层设置 `pointer-events: none`，这样光晕就不会吞掉原本应由其下方控件接收的点击。尺寸和碰撞规则见 [hit-areas.md](hit-areas.md)。

## 为每个控件添加标签和类型

每个输入项都应有 `<label for>` 或包裹它的 `<label>`。占位符绝不是标签。标签和控件共享同一个点击区域，复选框与其文本之间不得存在无响应区域。

添加具有明确 `name` 的 `autocomplete`，以及能调出正确键盘的 `type` 和 `inputmode`。绝不要阻止粘贴；用户会粘贴密码和一次性验证码。参见 [forms.md](forms.md)。

## 可宣告的错误

在请求开始前保持提交按钮启用，然后禁用它，并显示加载指示器和原始标签。在提交时进行验证。为失败的字段标记 `aria-invalid="true"`，让 `aria-describedby` 指向行内错误文本，并将焦点移至第一个无效字段。

当控件确实不可用时，使用原生 `disabled`。只有在控件应保持可聚焦时才使用 `aria-disabled="true"`，然后在代码中阻止指针、键盘和表单行为，并明确设置该状态的样式。

## 无处不在的可访问名称

仅图标按钮需要描述性的 `aria-label`。可见标签文本必须出现在可访问名称中。装饰性元素使用 `aria-hidden="true"`，绝不要将其用于可聚焦元素。

## 不要只依赖颜色

状态需要冗余提示：除颜色外，还应有图标、文本或下划线。确定适用的 WCAG 对比度要求，然后使用 `better-colors` 测量渲染后的颜色组合。若不符合要求，请报告该颜色组合及其未满足的要求；除非被要求，否则不要更改颜色。

## 尊重 prefers-reduced-motion

将动画包裹在 `@media (prefers-reduced-motion: no-preference)` 中，使其成为可选项。在减少动态效果时，用不透明度交叉淡入淡出替代滑动和缩放，并完全禁用视差和自动播放。

无论偏好设置如何，以下两条规则始终适用。自动播放的媒体需要可见的暂停控件，包含操作或错误的提示消息在被关闭前应一直保留。参见 [motion-and-zoom.md](motion-and-zoom.md)。

## 宣告动态内容

三种机制，三项职责。`aria-describedby` 用于传递字段特定的验证信息。礼貌实时区域（`role="status"`）用于传递与控件无关的非紧急更新，例如提示消息和结果数量。`role="alert"` 用于传递紧急且与控件无关的错误，且不应用于其他内容。

重复的礼貌宣告需要在文本更新前渲染一个稳定的空区域。动态插入的警报在支持情况上有所不同，因此请在目标屏幕阅读器上进行测试。参见 [screen-readers.md](screen-readers.md)。

## 按用途编写替代文本

装饰性图片使用 `alt=""`。信息性图片描述其含义。功能性图片描述其操作：搜索图标按钮应为 `alt="Search"`，而不是 `alt="magnifying glass"`。

## 结构即导航

使用能描述其所属区段并构成连贯大纲的标题。为页面提供一个 `<h1>`，并在其下嵌套各级标题，不要跳级。提供一个可见的主要 `<main>` 地标。当重复的导航或页面框架位于其前时，将“跳至内容”链接设为第一个可聚焦元素。锚定标题使用 `scroll-margin-top`。

## 经受住缩放和文本大小调整

页面必须在 200% 缩放下正常工作，并在 320px 宽度下重排而不出现水平滚动。在文本容器上使用 `min-height` 而非固定的 `height`。在适合代码库的情况下优先使用 `rem` 断点，并且绝不要让 viewport meta 限制读者可缩放的程度。

## 完成之前

| 错误 | 修复方式 |
| --- | --- |
| 假定自定义焦点颜色在所有情况下都有效 | 针对每个相邻颜色以及强制颜色模式进行验证 |
| 重复的礼貌性更新以不一致的方式播报 | 保持一个稳定的空状态区域，并更新其文本 |
| 对常规 toast 使用 `assertive` 实时区域 | 使用 `polite`；将 `assertive` 留给错误 |
| 在可聚焦元素上使用 `aria-hidden="true"` | 将其移除，或使该元素不可聚焦 |
| 在表单有效之前禁用提交 | 保持其启用；在提交时验证并将焦点移至第一个错误 |
| 在触摸设备上轻触后悬停样式仍然保留 | 使用 `@media (hover: hover)` 限制悬停样式 |
| 在原生 `disabled` 控件上使用工具提示 | 在其旁边提供文本，或使用 `aria-disabled` 使其保持可聚焦 |

## 报告

**严重程度。** `HIGH` 会阻止完成任务、向辅助技术隐藏内容，或造成系统性故障。`MEDIUM` 会使交互明显更困难。`LOW` 是孤立的细节优化。

**验证。** 没有浏览器时：检查每个交互元素的可访问名称、非原生控件上的键盘处理程序、焦点样式、`prefers-reduced-motion` 防护，以及与其输入字段绑定的表单标签。有浏览器时：按顺序使用 Tab 键遍历流程，从无障碍树中读取计算后的名称和角色，确认每个停留点都有可见的焦点指示器，并运行自动化审计。将每项未能运行的检查报告为 `Not verified`。

**格式。** 按所违反的原则对发现项分组，按严重程度排序，每个根本原因一行，列出其出现的每个位置：

| 严重程度 | 位置 | 修改前 | 修改后 | 原因 |
| --- | --- | --- | --- | --- |

`Location` 是 `path/to/file:line`。`Why` 应说明原则和对用户的影响。

当仍存在任何 `HIGH` 时，以 `Block` 结束；否则以 `Approve` 结束，并将其余项保留在表格中作为待完成工作。绝不 `Approve` 未检查的覆盖范围。若没有任何需要报告的内容，请说明 "No actionable accessibility findings" 并报告验证情况。