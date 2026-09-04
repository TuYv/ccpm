---
name: tw-blazor-css-strategy
description: How to style Blazor + FluentUI components in this repo without Tailwind. The "isolation-first hybrid" convention — CSS isolation by default, global design tokens, and two documented exceptions for FluentUI shadow-DOM and light-DOM children. Use when authoring or restyling any .razor component, choosing where CSS lives, or styling a FluentUI component.
---
# Blazor CSS 策略（隔离优先的混合方案）

我们不使用 Tailwind。设计系统是基于全局设计令牌手写的纯 CSS。本技能是**组件 CSS 应放在哪里以及如何限定其作用域**的标准。

之所以制定本技能，是因为 Blazor CSS 隔离存在两道硬性壁垒，一旦组件组合使用 FluentUI，它们就会立刻构成障碍：

- **壁垒 A —— 隔离作用域。** 隔离的 `*.razor.css` 只会在**组件自身编写的原生 HTML 元素**上打上其作用域属性（`[b-xxxxx]`）。子组件的根元素（即使是 light-DOM 的 `<FluentStack>` div）永远接收不到该作用域属性，因此隔离 CSS 无法命中它。`::deep` 只有在存在可供锚定的、带作用域的原生祖先时才有用，而且速度慢、易出错。
- **壁垒 B —— shadow DOM。** FluentUI 的交互原语（`fluent-button`、`fluent-text`、各类字段……）是带**开放 shadow root** 的 web 组件——**v4 和 v5 皆是如此**。它们的内部**只能**通过 `::part()` + CSS 自定义属性触及。没有任何作用域策略能穿透 shadow 边界。

## 规则

1. **默认 = Blazor CSS 隔离（`Foo.razor.css`）。** 隔离组件**必须渲染原生 HTML 根元素**（`<section>`/`<button>`/`<div>`/`<span>`），绝不能以 FluentUI/子组件作为其根。这正是让隔离得以正常工作的前提。
2. **品牌令牌是全局的**，位于 `web-spa/wwwroot/css/tokens.css`，以 CSS 自定义属性的形式存在。使用 `var(--twe-*)` 来消费它们。令牌是颜色、字阶、圆角、阴影层级（elevation）和状态色板的唯一事实来源——绝不要在组件 CSS 中硬编码这些值。
3. **例外 A —— 为 FluentUI 原语*内部*（shadow DOM）设置样式：** 只能使用 `::part()` + CSS 自定义属性。其他方法都行不通。
4. **例外 B —— 为无法包裹的 FluentUI light-DOM 子元素或运行时动态 CSS 设置样式：** 持有一个**作用域句柄（scope handle）**，并编写一个以其为作用域的共置（co-located）`<style>`；通过 `Class=` 把句柄传给 FluentUI 组件。**禁止 `::deep`。禁止内联 `style=`**（在 strict-CSP / 受锁定的浏览器下内联样式是被禁止的——`Style=@Value` 仅保留给真正按实例动态取值的情况）。
   - **多实例**组件 → 用 `.@(Id)` 划分作用域（`Id` 来自状态基类组件，见下文的层级说明）。
   - **单例**（例如布局/外壳）→ 固定的带命名空间的根类（`.twe-shell`）。

## 两个基类层级（保持彼此分离）

- **Tier-1 —— 叶子原语**（Card、Button、StatusBadge、各类字段）：继承一个仅提供属性展开（attribute splat）的轻量 `ComponentBase` 派生类。**没有 `Id`。** 渲染原生根元素 → 使用隔离（`*.razor.css`）。实例众多、样式静态——这里用隔离成本最低。
- **Tier-2 —— 状态/容器组件**（布局、外壳、页面组合、区块）：继承 `BaseComponent : TimeWarpStateDevComponent`，它已经暴露了公共的 `string Id`。该 `Id` 就是例外 B 的作用域句柄。实例较少、有时需要动态——作用域句柄正合适。

## 仓库内规范示例（Tier-2 / 例外 B）

`web-spa/components/TimeWarpPage.razor`（应用外壳）就是这样做的——它渲染 `FluentLayout` / `FluentNav` / `FluentTextInput`（light-DOM 子元素，壁垒 A），并通过一个以固定根类 `.twe-shell` 为作用域的共置 `<style>` 为它们设置样式（外壳是单例，因此用固定类而不是 `.@(Id)`）：

```razor
<FluentLayout Class=@($"{Id} twe-shell")> … <FluentNav Class="twe-nav"/> … </FluentLayout>

<style>
  @(@"
    .twe-shell .twe-nav { background: var(--twe-paper-2); border-right: 1px solid var(--twe-rule); }
    .twe-shell .twe-appbar__search fluent-text-input { width: 100%; }
  ")
</style>
```

`.twe-shell .twe-nav` 可以触达 FluentNav 的 light-DOM 根元素（从带 Id 的祖先出发的一条普通后代选择器——不用 `::deep`，不用包裹 div）。请使用**逐字（verbatim）**字符串 `@(@"…")`，这样 CSS 花括号就是字面量；只有在需要 `{Id}` 时才使用插值形式 `@($@"… {{ }} …")`。

## Tier-1 示例（叶子组件，隔离）

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
| 带原生根元素的叶子组件 | 隔离（`*.razor.css`） |
| 需要品牌色 / 尺寸 / 圆角 | `tokens.css` 中的 `var(--twe-*)` |
| 为 FluentUI light-DOM 子元素设置样式（FluentStack、FluentNav、分隔器……） | 例外 B：`Class=@($"{Id} …")` + 共置 `<style>` 中的 `.{Id}` |
| 单例布局/外壳 | 例外 B，使用固定根类（`.twe-shell`） |
| 修改 FluentUI 原语内部（按钮背景、文字颜色） | 例外 A：`::part()` + CSS 变量 |
| 真正按实例动态取值的值 | `Style=@Value`（仅节制使用） |
| 任何情况 | **绝不**把 `global.css` 当作倾倒处；**绝不**以内联 `style=` 作为体系 |

## 备注

- FluentUI v5 并**没有**消除壁垒 A 或壁垒 B（已经过实证验证）。该策略在 v4 和 v5 之间保持一致。
- 参考实现：crunchit 的 web-spa（`Crunchitfs/crunchit` 的 `Cramer/2026-05-29/initial` 分支，`source/web-spa`）在 FluentUI v5 上运行了这套方案——参见其中的 `tokens.css`、`MainLayout.razor`（`.crunchit-shell`）以及 `Card.razor`(.css)。
