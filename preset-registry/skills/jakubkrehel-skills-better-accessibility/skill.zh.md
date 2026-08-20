---
name: better-accessibility
description: Accessibility engineering for product interfaces. Use when building or reviewing UI components and custom widgets, or when the user reports a keyboard or screen-reader problem. Triggers on accessibility, a11y, WCAG, aria, focus ring, focus trap, keyboard navigation, tabindex, screen reader, sr-only, alt text, hit area, hover on touch, prefers-reduced-motion, autoplay, skip link, semantic HTML, form errors, disabled buttons, "not keyboard accessible".
---
# 无障碍

如果使用平台原生能力，大多数无障碍支持都能免费获得。原生元素自带键盘支持，真正的标签会被自动读出，而可见的焦点环只需一条 CSS 规则即可实现。

所有修复都应使用项目的样式系统，并严格采用下文给出的值，而不是看起来相近的替代值。

审查需要进行两轮。第一轮仅使用键盘，确保每个流程都能在不使用鼠标的情况下完成。第二轮使用屏幕阅读器，确保每个控件都会读出其名称、角色和状态。如果不确定，应优先采用平台默认实现，而不是自定义重建；应删除 ARIA，而不是添加它。

对比度测量和颜色修复属于 `better-colors`。文本大小和 iOS 输入框缩放属于 `better-typography`。RTL 空间布局属于 `better-layout`。

## 原生元素优先

ARIA 的第一条规则：存在原生元素时，不要使用 ARIA。操作使用 `<button>`，导航使用 `<a href>`，绝不要使用 `<div onClick>`。真正的链接必须支持 Cmd/Ctrl/鼠标中键点击。没有 ARIA 胜过错误的 ARIA。有关地标、按钮与链接的区别以及禁用状态，请参阅 [semantics-and-aria.md](semantics-and-aria.md)。

## 可见的焦点环

为 `:focus-visible` 设置样式，而不是直接为 `:focus` 设置样式。键盘用户会看到焦点环，而鼠标用户通常不会。优先使用浏览器未经修改的焦点指示器。

自定义焦点环需要使用项目的焦点令牌或其他明确指定的颜色。应针对指示器经过的每一种相邻颜色验证整个指示器，包括 `currentColor`。至少使用 `2px` 的实线边框，或具有等效可见面积的样式。绝不要在没有经过验证的替代方案时使用 `outline: none`，并在强制颜色模式下保留系统颜色。相关实现方法见 [focus-and-keyboard.md](focus-and-keyboard.md)。

## 完整的键盘支持

每种指针交互都需要对应的键盘操作路径。遵循 ARIA APG 模式：Escape 关闭浮层，方向键在复合组件内部移动，Tab 在组件之间移动，Enter 和 Space 执行激活操作。

仅使用 `tabindex="0"` 将元素加入自然 Tab 顺序，并使用 `tabindex="-1"` 实现编程式聚焦。正值会破坏该顺序。复合组件使用流动式 tabindex，其中当前活动项为 `0`，其他所有项均为 `-1`。

## 限制并恢复焦点

模态框应对背景内容设置 `inert`，打开时将焦点移入其中，关闭时将焦点返回触发控件。添加 `overscroll-behavior: contain`，防止背景内容滚动。

## 最小点击区域

WCAG 2.5.8 的 AA 级基准要求目标区域达到 24×24 CSS 像素，或符合其间距、等效控件、内联、用户代理和必要性例外之一。在密度允许的情况下，触摸设备应以 44×44px 为目标，桌面设备应以 40×40px 为目标。当可见元素需要保持较小时，可使用伪元素扩展点击区域。

绝不要让扩展后的点击区域相互重叠。为装饰层设置 `pointer-events: none`，这样发光效果就不会拦截本应传递给下方控件的点击。尺寸和冲突规则见 [hit-areas.md](hit-areas.md)。

## 为每个控件添加标签并指定类型

每个输入框都应具有 `<label for>` 或由 `<label>` 包裹。占位符绝不能代替标签。标签与控件应共享同一个点击区域，复选框与其文本之间不得存在无法点击的空白区域。

添加具有明确含义的 `name` 的 `autocomplete`，并设置能够调出正确键盘的 `type` 和 `inputmode`。绝不要阻止粘贴；用户会粘贴密码和一次性验证码。请参阅 [forms.md](forms.md)。

## 可被宣告的错误

在请求开始前保持提交按钮可用，请求开始后将其禁用，同时显示加载指示器和原始标签。在提交时进行验证。将验证失败的字段标记为 `aria-invalid="true"`，让 `aria-describedby` 指向内联错误文本，并将焦点移至第一个无效字段。

当控件确实不可用时，使用原生 `disabled`。只有当控件需要保持可聚焦时才使用 `aria-disabled="true"`，然后在代码中阻止指针、键盘和表单行为，并为该状态明确设置样式。

## 确保所有元素都有无障碍名称

只有图标的按钮需要描述性的 `aria-label`。可见的标签文本必须出现在无障碍名称中。装饰性元素应设置 `aria-hidden="true"`，但绝不要将其用于可聚焦元素。

## 不要仅依赖颜色

状态需要冗余提示：除颜色外，还应提供图标、文本或下划线。确定适用的 WCAG 对比度要求，然后使用 `better-colors` 测量实际渲染的颜色组合。如果未通过，请报告该颜色组合及其未满足的要求；除非收到明确要求，否则不要改动颜色。

## 尊重 prefers-reduced-motion

将动效包装在 `@media (prefers-reduced-motion: no-preference)` 中，使其仅在用户选择后启用。在减少动态效果模式下，用透明度交叉淡化替代滑动和缩放，并完全禁用视差效果和自动播放。

无论用户的偏好如何，都必须遵守两条规则。自动播放的媒体需要提供可见的暂停控件，而包含操作或错误信息的提示消息在被关闭前应始终保留。请参阅 [motion-and-zoom.md](motion-and-zoom.md)。

## 宣告动态内容

三种机制，各司其职。`aria-describedby` 用于字段特定的验证信息。礼貌型实时区域（`role="status"`）用于与控件无关的非紧急更新，例如提示消息和结果数量。`role="alert"` 仅用于与控件无关的紧急错误，不应用于其他内容。

重复的礼貌型宣告需要一个预先渲染的、稳定的空区域，然后再更新其中的文本。不同屏幕阅读器对动态插入的警报支持不一，因此请在目标屏幕阅读器上进行测试。请参阅 [screen-readers.md](screen-readers.md)。

## 根据用途编写替代文本

装饰性图像应设置 `alt=""`。信息性图像应描述其含义。功能性图像应描述其操作：搜索图标按钮应使用 `alt="Search"`，而不是 `alt="magnifying glass"`。

## 结构即导航

使用能够描述各自章节并形成连贯大纲的标题。每个页面只使用一个 `<h1>`，其下的标题层级应依次嵌套，不要跳级。提供一个可见的主要 `<main>` 地标。当重复的导航或界面框架位于其前面时，将“跳转到内容”链接设为第一个可聚焦元素。带锚点的标题应设置 `scroll-margin-top`。

## 适应缩放和文本大小调整

页面必须在 200% 缩放下正常工作，并能在 320px 宽度下重排，且不出现水平滚动。对文本容器使用 `min-height`，而不是固定的 `height`。在适合现有代码库的情况下，优先使用 `rem` 断点，并且绝不要通过视口元数据限制读者可缩放的程度。

## 完成之前

| 错误 | 修复方式 |
| --- | --- |
| 假定自定义焦点颜色在所有位置都有效 | 对照每一种相邻颜色进行验证，并在强制颜色模式下进行验证 |
| 重复的礼貌更新未得到一致播报 | 保留一个稳定的空状态区域，并更新其文本 |
| 对常规提示消息使用 `assertive` 实时区域 | 使用 `polite`；仅为错误保留 `assertive` |
| 在可聚焦元素上使用 `aria-hidden="true"` | 将其移除，或使该元素不可聚焦 |
| 在表单有效之前禁用提交按钮 | 保持启用；提交时进行验证，并将焦点移至第一个错误 |
| 在触摸设备上轻点后，悬停样式仍然保留 | 使用 `@media (hover: hover)` 限制悬停样式 |
| 在原生 `disabled` 控件上使用工具提示 | 将文本放在控件旁边，或使用 `aria-disabled` 使其保持可聚焦 |

## 报告

**严重级别。** `HIGH` 表示阻止任务完成、向辅助技术隐藏内容或造成系统性故障。`MEDIUM` 表示使交互明显更加困难。`LOW` 表示局部的细节完善问题。

**验证。** 在没有浏览器的情况下：检查每个交互元素的无障碍名称、非原生控件上的键盘处理程序、焦点样式、`prefers-reduced-motion` 防护，以及是否已将表单标签绑定到对应输入控件。在有浏览器的情况下：按顺序使用 Tab 键遍历流程，从无障碍树中读取计算后的名称和角色，确认每个焦点停留位置都有可见的焦点指示器，并运行自动化审计。将每项无法执行的检查报告为 `Not verified`。

**格式。** 按调查发现所违反的原则进行分组，并按严重级别排序；每个根本原因占一行，列出其出现的所有位置：

| 严重级别 | 位置 | 修改前 | 修改后 | 原因 |
| --- | --- | --- | --- | --- |

`Location` 的格式为 `path/to/file:line`。`Why` 应说明原则和对用户的影响。

如果仍存在任何 `HIGH`，以 `Block` 结尾；否则以 `Approve` 结尾，并将其余问题保留在表格中作为待办事项。绝不要对未检查的覆盖范围给出 `Approve`。如果没有需要报告的内容，请注明“没有可处理的无障碍问题”，并报告验证情况。