---
name: tw-blazor-layout
description: How to structure Blazor app chrome with the "empty layout + cascaded page-component shell" pattern — keep LayoutComponentBase empty and put header/nav/content/aside/footer in ONE shell component that pages wrap their content in and that cascades itself. Use when designing a Blazor app's layout/navigation, deciding where chrome belongs, building a layout shell, or when chrome must react to a state store or per-navigation lifecycle that a layout can't provide.
---
# Blazor 应用外壳：空布局 + 级联的页面组件外壳

一项关于应用界面框架（页眉、导航、内容区域、侧边栏、页脚）在 Blazor 应用中应当安放于何处的技术。

**该模式：**让路由布局（`LayoutComponentBase`）几乎保持为空，并把*所有*界面框架放入单个**外壳组件（shell component）**中，该组件 (a) 继承你应用的状态/基类组件，(b) 渲染各个布局区域，(c) 级联传递自身，(d) 包裹每个页面的内容。页面不声明界面框架；它们把自己的主体渲染在 `<Shell>` *内部*。

## 为什么不直接把界面框架放进布局？

`LayoutComponentBase` 是显而易见的选择，但它有两个会给真实应用带来麻烦的限制：

- **它无法参与你的状态/渲染管线。**布局不是你的状态存储基类组件，因此它拿不到存储的组件 id、随状态变化自动重新渲染的能力，也拿不到其他组件所依赖的 DI/生命周期钩子。如果任何界面框架必须响应全局状态——忙碌/活动指示器、当前用户、未读计数、主题——布局无法干净地做到这一点。
- **布局在导航之间持久存在。**你得不到干净的按次导航的生命周期，而且布局无法像普通组件的参数那样暴露逐页输入（标题、侧边面板）。

一个**本身是普通（具备状态感知的）组件的外壳**可以同时解决这两点：它会随你的存储一起重新渲染，拥有按实例的生命周期，并接受 `Title`/`Aside` 等作为参数。然后，你通过**级联传递**使子代组件能够访问它，并让路由布局保持为空，这样它就不会与外壳相互冲突。

## 如何构建

1. **空布局。**你的 `LayoutComponentBase` 只渲染 `@Body`（再加上任何真正属于布局根、只需运行一次的关注点——例如应用主题）。对任何使用 JS 互操作的逻辑加以防护，使其只在交互模式下运行（而非在服务器预渲染期间）。这里不要放页眉/导航/页脚。
2. **外壳组件。**一个**继承你的状态/基类组件**的普通组件（而不是 `LayoutComponentBase`）。它：
   - 使用你的 UI 库的布局原语渲染各界面框架区域（页眉 / 导航 / 内容 / 侧边栏 / 页脚）；
   - 为逐页输入声明 `[Parameter]`（`Title`、`ChildContent`、可选的 `Aside`）；
   - 用 `<CascadingValue Value=@this>` 包裹其组件树，使子代组件能够访问外壳；
   - 在内容区域中渲染 `@ChildContent`，并且仅当提供了 `Aside` 时才有条件地渲染侧边栏区域。
3. **页面把内容包裹在外壳里：**`<Shell Title="…">…page body…</Shell>`。路由保持为独立的关注点（你的 `@page`/路由特性），与外壳无关。

## 陷阱

- **一个外壳，靠参数化——而不是多个。**抵制按区块制作外壳变体的做法；改为传递参数（标题、侧边栏、标志位）。
- **不要以你的路由概念为外壳命名。**如果你的框架/应用使用了 `Page` 或 `[Page]` 路由特性，把外壳命名为 `Page` 会发生冲突——给它起一个不同的名字。
- **不要把外壳做成 `LayoutComponentBase`**（也不要把它注册为路由布局）——那会丢掉状态/生命周期上的好处，而这正是该模式的全部意义所在。
- **不要把界面框架放进布局或各个页面中。**它只存在于外壳里。
- **为预渲染防护互操作调用。**布局或外壳中的主题/JS 互操作调用必须以“是否处于交互状态”为条件进行门控，否则它们会在服务器端预渲染期间抛出异常。

## 参考实现（timewarp-architecture）

该模式在本仓库中的具体实例：
- **空布局：**`components/layouts/MainLayout.razor` — `@inherits LayoutComponentBase`，渲染 `@Body` + `<FluentUIRequiredFeatures/>`，在 `OnAfterRenderAsync` 中通过 `IThemeService.SetThemeAsync` 应用品牌色阶，并以 `RendererInfo.IsInteractive` 做防护。
- **外壳：**`components/TimeWarpPage.razor` — `@inherits BaseComponent`（TimeWarp.State 的基类组件 → 为其提供状态 `Id` 和随状态变化重新渲染的能力，例如绑定到 `ActionTrackingState.IsActive` 的页脚活动指示器）。渲染 FluentUI `FluentLayout` 的各个区域 + 品牌/搜索/导航/页脚/`ModalController`，并通过 `<CascadingValue Value=@this>` 将自身级联传递出去。参数：`Title`、`ChildContent`、`Aside`。
- **页面：**`@inherits BaseComponent`，把内容包裹在 `<TimeWarpPage Title="…">…</TimeWarpPage>` 中；路由来自 `.razor.cs` 分部类上的 `[Page("/route")]`（`PageSourceGenerator` 会生成 `[Route]`、`GetPageUrl` 以及路由参数）。外壳之所以命名为 `TimeWarpPage`（而不是 `Page`），正是因为 `[Page]` 是路由概念。
- **外壳的样式：**参见 `tw-blazor-css-strategy` 技能——本技能讲的是*结构*，那个技能讲的是*样式*（Tier-2 作用域句柄 `.twe-shell`）。
- **Slice 边界：**界面框架/外壳位于 SliceRoot **之外**（例如 `…Components`）；产品页面和状态位于产品 slice 命名空间（`…Features.<Id>`）中。参见技能 `tw-slice-isolation`。
