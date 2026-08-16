---
name: migrate-container-queries
description: Guide for migrating viewport media queries (@media, useMedia) to container queries in Sentry's frontend. Use when migrating responsive layout to container queries, replacing @media/useMedia, refactoring styled responsive components to Container/Flex/Grid primitives, or working on the DE container-query migration.
---
# 容器查询迁移指南

将基于视口的响应式逻辑（`@media` + `useMedia`）迁移到容器查询，使组件能够响应自身的可用空间，而不是原始视口。

> **始终进行视觉检查。** 每次迁移后，都要调整_元素_的大小（而不只是窗口大小），并确认布局保持一致，且会在预期宽度处切换。若要在不改变窗口大小的情况下缩窄元素，一个好方法是在它旁边打开一个可调整大小的面板——例如拖出 Seer 资源管理器侧边栏，从而挤压中间内容。两种令牌的刻度不同，因此机械式替换即使能够通过编译，渲染结果仍可能出错。

## 方法：先重构，再替换

在第一个适用的层级停止。相比机械式替换令牌，应优先使用基础组件替代手写 CSS。

| 层级                   | 适用情况                                                                                                    | 操作                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 基础组件属性     | `@media` 仅切换布局（`flex-direction`、`display`、`grid-template`、间距、可见性、宽度）   | 删除样式化组件；使用 `Container`/`Flex`/`Grid`/`Stack` 的响应式属性（`direction={{xs: 'column', md: 'row'}}`）                   |
| 2. 替换为 `@container`   | CSS 无法用属性表达（后代选择器、伪元素、`font-size`、复杂的 `grid-template-areas`） | 保留样式化组件；将 `@media` → `@container`，将 `theme.breakpoints.*` → `theme.container.*`                                            |
| 3. 容器作用域的 JS | 在 JS 中读取宽度以进行渲染分支                                                                 | 对于阈值布尔值，将 `useMedia(...)` 替换为 `useResponsivePropValue({...})`；或者使用 `useContainerBreakpoint()` 根据当前生效的键进行分支 |
| 4. 保留 `useMedia` | 真正的媒体特性，而非宽度                                                                        | 不做任何操作——这些情况不需要迁移                                                                                                               |

## ⚠️ 转换到最接近的容器刻度

断点刻度和容器刻度具有**不同的键和不同的像素值**——这并非简单重命名。**按像素值映射，而不是按键映射：**`breakpoints.sm` 不会变成 `container.sm`。复用相同的键是迁移中最常见的错误。

`theme.breakpoints`（视口 / `@media`），基础值为 `2xs`：

| `2xs` | `xs`  | `sm`  | `md`  | `lg`   | `xl`   | `2xl`  |
| ----- | ----- | ----- | ----- | ------ | ------ | ------ |
| 0px   | 500px | 800px | 992px | 1200px | 1440px | 2560px |

`theme.container`（容器 / `@container`），基础值为 `zero`：

| `zero` | `3xs` | `2xs` | `xs`  | `sm`  | `md`  | `lg`  | `xl`  | `2xl` | `3xl`  | `4xl`  | `5xl`  |
| ------ | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------ | ------ | ------ |
| 0px    | 320px | 384px | 448px | 512px | 576px | 640px | 768px | 896px | 1024px | 1152px | 1280px |

**规则：**取旧断点的像素值，并选择像素值与其_最接近_的 `container` token——而不是名称相同的 token。`breakpoints.sm` 是 800px，因此它映射到 `container.xl`（768px），而不是 `container.sm`（512px）。然后通过视觉检查进行确认：容器通常比视口窄，因此像素值最接近的 token 只是起点，并不保证一定正确。

## 真正的视口宽度 → `screen:` 键，而非 `useMedia`

当布局确实必须跟随_窗口_（而不是组件可用的空间）时，不要保留 `useMedia`——请使用带 `screen:` 前缀的响应式属性，它会根据 `theme.breakpoints` 刻度针对视口进行解析：`direction={{zero: 'column', 'screen:lg': 'row'}}`。不带前缀的键和 `screen:` 键可以在同一个属性中混用。优先使用不带前缀的（容器）键；只有当布局确实由视口驱动时，才使用 `screen:`。

## 仅为非宽度媒体特性保留 `useMedia`

对于宽度——无论是容器还是视口——上文都提供了相应的属性/hook 方案。仅在以下情况保留 `useMedia`：
`prefers-color-scheme`、`prefers-reduced-motion`、`hover`、`pointer`、`max-height` / 基于高度的查询、`resolution`、`print`。

## container-type：仅当作用域内没有查询容器时使用

**默认情况下：不要添加。**不带前缀的键和 `@container` 已经会根据最近的祖先容器进行解析，而且产品视图中已有这样的容器：`ContentStack`（`#main`、`views/organizationLayout/index.tsx`）使用 `containerType="inline-size"` 包裹路由的 `<Outlet />`；`topBar` 和 `#modal-portal` 则覆盖各自的子树。仅当某个子树必须响应_自身_宽度而非页面宽度时，才添加 `container-type`——此时：

- 使用 `inline-size`（仅宽度）。`size` 还会查询高度，如果未在其他位置设置高度，会导致内容折叠。
- 在可能已经位于容器内部的可复用组件中，应有条件地设置它，以避免创建冗余容器——通过 `useHasContainerQuery()` 使用 `containerType={hasParentQueryContainer ? 'normal' : 'inline-size'}`（参见 `components/core/breadcrumbList/breadcrumbList.tsx`）。

## 示例

### 层级 1——styled `@media` → 基础组件属性（首选）

```tsx
// Old — delete the styled component
const Row = styled('div')`
  display: flex;
  flex-direction: row;
  gap: ${p => p.theme.space.md};
  @media (max-width: ${p => p.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

// New
import {Flex} from '@sentry/scraps/layout';
<Flex direction={{xs: 'column', sm: 'row'}} gap="md">
```

### 层级 2——`@media` → `@container`（无法使用属性时）

```tsx
// Old
@media (max-width: ${p => p.theme.breakpoints.md}) { ... }

// New — swap at-rule AND scale; md breakpoint (992px) → nearest container token by px
// is 3xl (1024px), NOT theme.container.md by matching key
@container (max-width: ${p => p.theme.container['3xl']}) { ... }
```

### 第 3 级 — `useMedia`（宽度）→ 容器作用域的 JS

下面两个辅助工具都会读取最近的查询容器（应从其后代元素中调用），并在跨越断点时重新渲染。对于响应式值，使用单个 `max-width` 布尔值最为清晰；只有当你需要根据键本身进行分支时，才使用当前激活的键。

```tsx
// Old
const isNarrow = useMedia(`(max-width: ${theme.breakpoints.sm})`);

// New — resolve a responsive boolean against the container, same mobile-first
// cascade as CSS. A max-width query is "on by default, off past the threshold",
// so name only the threshold key. Map by pixel value: breakpoints.sm (800px) →
// nearest container token is xl (768px).
import {useResponsivePropValue} from '@sentry/scraps/layout';

const isNarrow = useResponsivePropValue({zero: true, xl: false});
// below xl → true, at/above xl → false — one key on each side, nothing to enumerate.
```

只有当你需要根据键本身进行分支（例如，从多个布局中选择一个）而不是处理单个阈值时，才改用 `useContainerBreakpoint()`。它返回容器当前激活的键（`'zero'` … `'5xl'`）——对于 `max-width` 场景，不要将其与 `=== 'zero'` 进行比较：这种判断只会在宽度低于 320px 时触发，并会遗漏原查询视为窄屏的 320–768px 范围。

## 迁移检查清单

采用了满足需求的最低级别（见上文）。然后验证以下注意事项：

- [ ] 映射到像素值最接近的 `container` 令牌，而不是同名令牌——例如 `breakpoints.sm` → `container.xl`，而不是 `container.sm`
- [ ] 对于在 JS 中读取的宽度，使用 `useResponsivePropValue({...})` 处理阈值布尔值；仅将 `useContainerBreakpoint()` 用于根据键进行分支——绝不要用 `=== 'zero'` 表示“窄屏”（它仅表示 <320px）
- [ ] 将真正基于视口宽度的场景转为使用 `screen:` 键；仅为非宽度媒体特性保留 `useMedia`
- [ ] 仅当子树需要自己的容器时才添加 `container-type`；使用 `inline-size`
- [ ] 确认存在查询容器祖先（如果没有，`@container` 会静默失效）
- [ ] **视觉检查：**调整元素大小，并确认输出结果会在预期宽度处发生与原来完全一致的切换