---
name: blazor-layout
description: How to structure Blazor app chrome with the "empty layout + cascaded page-component shell" pattern — keep LayoutComponentBase empty and put header/nav/content/aside/footer in ONE shell component that pages wrap their content in and that cascades itself. Use when designing a Blazor app's layout/navigation, deciding where chrome belongs, building a layout shell, or when chrome must react to a state store or per-navigation lifecycle that a layout can't provide.
---
# Blazor 应用外壳：空布局 + 级联的页面组件外壳

一种决定应用 chrome（页眉、导航、内容区域、侧栏、页脚）在 Blazor 应用中如何安放的技术。

**该模式：**让路由布局（`LayoutComponentBase`）保持几乎为空，并把*所有* chrome 放入单个**外壳组件（shell component）**中，该组件 (a) 继承你应用的状态/基类组件，(b) 渲染各个布局区域，(c) 级联传递自身，并且 (d) 包裹每个页面的内容。页面不声明 chrome；它们把自身主体渲染在 `<Shell>` *内部*。

## 为什么不直接把 chrome 放进布局？

`LayoutComponentBase` 是显而易见的放置位置，但它有两个会困扰真实应用的限制：

- **它无法参与你的状态/渲染管线。**布局并不是你的状态存储基类组件，因此它得不到 store 的组件 id、随状态变化自动重新渲染的能力，也得不到其他组件所依赖的 DI/生命周期钩子。如果任何 chrome 必须响应全局状态——繁忙/活动指示器、当前用户、未读计数、主题——布局都无法干净地做到。
- **布局在多次导航之间持久存在。**你得不到干净的按导航划分的生命周期，而且布局也无法像普通组件的参数那样暴露每页的输入（标题、侧栏面板）。

一个**作为普通（具备状态感知的）组件的外壳**能同时解决这两个问题：它会随你的 store 重新渲染，拥有按实例的生命周期，并接受 `Title`/`Aside` 等作为参数。然后，你通过**级联传递它**使其可被后代组件访问，并让路由布局保持为空，以免它与外壳相互冲突。

## 如何构建

1. **空布局。**你的 `LayoutComponentBase` 只渲染 `@Body`（外加任何真正属于布局根的、只需运行一次的关注点——例如应用主题）。对任何使用 JS 互操作的代码加以防护，使其只在交互模式下运行（而非在服务器预渲染期间）。这里不放置页眉/导航/页脚。
2. **外壳组件。**一个**继承自你的状态/基类组件**的普通组件（而非 `LayoutComponentBase`）。它：
   - 使用你所用 UI 库的布局原语渲染各个 chrome 区域（页眉 / 导航 / 内容 / 侧栏 / 页脚）；
   - 为每页输入声明 `[Parameter]`（`Title`、`ChildContent`、可选的 `Aside`）；
   - 用 `<CascadingValue Value=@this>` 包裹其组件树，使后代组件能够访问外壳；
   - 在内容区域中渲染 `@ChildContent`，并且仅当提供了 `Aside` 时才条件性地渲染侧栏区域。
3. **页面把内容包裹在外壳中：** `<Shell Title="…">…page body…</Shell>`。路由仍是一个独立的关注点（你的 `@page`/路由特性），与外壳无关。

## 陷阱

- **一个外壳，靠参数区分——而不是多个。**克制住为每个分区创建外壳变体的冲动；应改为传递参数（标题、侧栏、各类标志）。
- **不要以你的路由概念来命名外壳。**如果你的框架/应用使用了 `Page` 或 `[Page]` 路由特性，把外壳命名为 `Page` 会发生冲突——请给它取一个不同的名字。
- **不要把外壳做成 `LayoutComponentBase`**（也不要将其注册为路由布局）——那会丢掉状态/生命周期方面的收益，而这正是整个模式的要点所在。
- **不要把 chrome 放在布局或各个页面中。**它只存在于外壳里。
- **为预渲染防护互操作调用。**布局或外壳中的主题/JS 互操作调用必须以“是否处于交互模式”为门控条件，否则在服务器端预渲染期间会抛出异常。

## 参考实现（timewarp-architecture）

该模式在本仓库中的具体实例：
- **空布局：** `components/layouts/MainLayout.razor` —— `@inherits LayoutComponentBase`，渲染 `@Body` + `<FluentUIRequiredFeatures/>`，在受 `RendererInfo.IsInteractive` 保护的 `OnAfterRenderAsync` 中通过 `IThemeService.SetThemeAsync` 应用品牌色阶。
- **外壳：** `components/TimeWarpPage.razor` —— `@inherits BaseComponent`（即 TimeWarp.State 的基类组件 → 为它提供状态 `Id` 和随状态变化重新渲染的能力，例如绑定到 `ActionTrackingState.IsActive` 的页脚活动指示器）。渲染 FluentUI `FluentLayout` 的各个区域 + 品牌/搜索/导航/页脚/`ModalController`，并通过 `<CascadingValue Value=@this>` 将自身级联传递。参数：`Title`、`ChildContent`、`Aside`。
- **页面：** `@inherits BaseComponent`，将内容包裹在 `<TimeWarpPage Title="…">…</TimeWarpPage>` 中；路由来自 `.razor.cs` 中的 `[Page("/route")]`（即 Moxy 的 `mixins/Page.mixin`）。外壳之所以命名为 `TimeWarpPage`（而非 `Page`），正是因为 `[Page]` 已经是路由概念。
- **外壳的样式：**参见 `blazor-css-strategy` 技能——本技能关注的是*结构*，那个技能关注的是*样式*（Tier-2 作用域句柄 `.twe-shell`）。
- **切片边界：**chrome/外壳位于 SliceRoot **之外**（例如 `…Components`）；产品页面和状态位于产品切片命名空间中（`…Features.<Id>`）。参见技能 `slice-isolation`。
