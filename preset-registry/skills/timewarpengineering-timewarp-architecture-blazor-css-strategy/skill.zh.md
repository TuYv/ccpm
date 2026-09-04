---
name: blazor-css-strategy
description: How to style Blazor + FluentUI components in this repo without Tailwind. The "isolation-first hybrid" convention — CSS isolation by default, global design tokens, and two documented exceptions for FluentUI shadow-DOM and light-DOM children. Use when authoring or restyling any .razor component, choosing where CSS lives, or styling a FluentUI component.
---
# Blazor CSS 策略（隔离优先的混合模式）

我们不使用 Tailwind。设计系统是基于全局设计令牌手写的原生 CSS。本技能定义的是**组件 CSS 存放在哪里、以及如何限定其作用域**的标准。

它之所以存在，是因为 Blazor CSS 隔离有两堵硬墙，一旦组件组合 FluentUI 就会立即踩坑：

- **墙 A —— 隔离作用域。** 一个隔离的 `*.razor.css` 只会把它的作用域属性（`[b-xxxxx]`）打在**组件自己编写的原生 HTML 元素**上。子组件的根（即使是 light-DOM 的 `<FluentStack>` div）永远不会获得该作用域属性，因此隔离 CSS 无法选中它。`::deep` 只有在存在一个带作用域的原生祖先可供锚定时才有用，而且又慢又容易出错。
- **墙 B —— shadow DOM。** FluentUI 的交互原语（`fluent-button`、`fluent-text`、各类字段……）是带有**开放 shadow root** 的 web 组件——**v4 和 v5 皆是如此**。它们的内部**只能**通过 `::part()` + CSS 自定义属性来触达。任何作用域策略都无法穿透 shadow 边界。

## 规则

1. **默认 = Blazor CSS 隔离（`Foo.razor.css`）。** 一个隔离组件**必须渲染原生 HTML 根**（`<section>`/`<button>`/`<div>`/`<span>`），绝不能以 FluentUI/子组件作为根。这正是让隔离得以工作的前提。
2. **品牌令牌是全局的**，位于 `web-spa/wwwroot/css/tokens.css`，以 CSS 自定义属性的形式存在。通过 `var(--twe-*)` 来消费它们。令牌是颜色、字阶、圆角、海拔和状态色板的唯一事实来源——绝不要在组件 CSS 中硬编码这些值。
3. **例外 A —— 在 FluentUI 原语*内部*（shadow DOM）进行样式化：** 只使用 `::part()` + CSS 自定义属性。别无他法。
4. **例外 B —— 为一个你无法包裹的 FluentUI light-DOM 子组件做样式化，或运行时动态 CSS：** 拥有一个**作用域句柄**，并编写一个与之同位置（co-located）、以该句柄限定作用域的 `<style>`；通过 `Class=` 把句柄传给 FluentUI 组件。**不用 `::deep`。不用内联 `style=`**（在 strict-CSP / 锁定浏览器下内联样式是被禁止的——`Style=@Value` 仅保留给真正动态的按实例值使用）。
   - **多实例**组件 → 用 `.@(Id)` 限定作用域（`Id` 来自状态基类组件，见下面的分层）。
   - **单例**（例如布局/外壳）→ 一个固定的带命名空间根类（`.twe-shell`）。

## 两个基类层级（保持分开）

- **Tier-1 —— 叶子原语**（Card、Button、StatusBadge、各类字段）：继承一个精简的、仅提供属性展开（attribute splat）的 `ComponentBase` 派生类。**没有 `Id`。** 渲染原生根 → 使用隔离（`*.razor.css`）。实例多、样式静态——隔离在这里成本最低。
- **Tier-2 —— 状态/容器组件**（布局、外壳、页面复合组件、区块）：继承 `BaseComponent : TimeWarpStateDevComponent`，它已暴露公共的 `string Id`。该 `Id` 就是例外 B 的作用域句柄。实例少、有时是动态的——作用域句柄正合适。

## 仓库内规范示例（Tier-2 / 例外 B）

`web-spa/components/TimeWarpPage.razor`（应用外壳）就是这样做的——它渲染 `FluentLayout` / `FluentNav` / `FluentTextInput`（light-DOM 子组件，墙 A），并通过一个同位置（co-located）、限定在固定根类 `.twe-shell` 上的 `<style>` 来为它们做样式化（外壳是单例，所以用固定类而不是 `.@(Id)`）：

```razor
<FluentLayout Class=@($"{Id} twe-shell")> … <FluentNav Class="twe-nav"/> … </FluentLayout>

<style>
  @(@"
    .twe-shell .twe-nav { background: var(--twe-paper-2); border-right: 1px solid var(--twe-rule); }
    .twe-shell .twe-appbar__search fluent-text-input { width: 100%; }
  ")
</style>
```

`.twe-shell .twe-nav` 能触达 FluentNav 的 light-DOM 根（从带 Id 的祖先出发的普通后代选择器——无需 `::deep`，也无需包装 div）。使用**逐字**字符串 `@(@"…")` 让 CSS 花括号保持字面量；只有需要 `{Id}` 时才使用插值形式 `@($@"… {{ }} …")`。

## Tier-1 示例（叶子，隔离）

```razor
@* Card.razor *@
<section @attributes="Attributes" class="@CssClass">
  <div class="twe-card__body">@ChildContent</div>
</section>
```
```css
/* Card.razor.css */
.twe-card {
  background: var(--twe-paper);
  border: 1px solid var(--twe-rule);
  border-radius: var(--twe-radius);
}
```

## 决策速查表

| 情形 | 做法 |
|---|---|
| 带原生根的叶子组件 | 隔离（`*.razor.css`） |
| 需要品牌颜色 / 尺寸 / 圆角 | 来自 `tokens.css` 的 `var(--twe-*)` |
| 为 FluentUI light-DOM 子组件做样式（FluentStack、FluentNav、splitter……） | 例外 B：`Class=@($"{Id} …")` + 同位置 `<style>` 中的 `.{Id}` |
| 单例布局/外壳 | 例外 B，使用固定根类（`.twe-shell`） |
| 修改 FluentUI 原语内部（按钮背景、文本颜色） | 例外 A：`::part()` + CSS 变量 |
| 真正动态的按实例值 | `Style=@Value`（仅谨慎少量使用） |
| 任何情形 | **绝不**把 `global.css` 当垃圾场；**绝不**把内联 `style=` 作为体系 |

## 备注

- FluentUI v5 并**没有**移除墙 A 或墙 B（已实证验证）。该策略在 v4 和 v5 上完全相同。
- 参考实现：crunchit web-spa（`Crunchitfs/crunchit` 仓库 `Cramer/2026-05-29/initial` 分支，`source/web-spa`）在 FluentUI v5 上运行此策略——参见其 `tokens.css`、`MainLayout.razor`（`.crunchit-shell`）以及 `Card.razor`（.css）。
