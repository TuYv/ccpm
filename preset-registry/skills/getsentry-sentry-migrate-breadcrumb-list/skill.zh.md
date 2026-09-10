---
name: migrate-breadcrumb-list
description: Migrates page-navigation breadcrumbs from the legacy `sentry/components/breadcrumbs` component to `@sentry/scraps/breadcrumbList`, splitting one flat crumb array across the TopBar `breadcrumbs` and `title` slots. Use when a page still renders `<Breadcrumbs crumbs={...}/>`, when parent crumbs and the page title need separating into two TopBar slots, when `Layout.Title` double-renders the page name, when a migrated crumb needs to keep the project or date selection, or when working through the BreadcrumbList migration backlog. Trigger on "migrate breadcrumbs", "migrate to BreadcrumbList", "replace sentry/components/breadcrumbs", "split breadcrumbs into TopBar slots", "BreadcrumbList.Title", "the page title renders twice", "preservePageFilters". Not for event breadcrumbs (`sentry/types/breadcrumbs`, the issue-detail timeline), and not for the route-driven SettingsBreadcrumb system.
---
我先定位仓库中的 `sentry/components/breadcrumbs` 使用点、目标页面以及现有 `BreadcrumbList` 迁移模式，确认 `$0` 未提供时应处理的下一个调用点。随后会按现有代码风格修改并运行针对性检查。我会先检查工作区状态和相关文件，确保不覆盖已有的用户修改。开始扫描面包屑组件及其迁移目标。# 将页面面包屑迁移到 BreadcrumbList

将 `$0`（文件、视图目录，或在省略时指定的下一个未迁移调用点）从 `sentry/components/breadcrumbs` 迁移出去。

## 迁移方式

旧 API 传入一个扁平数组，其中**最后一个**面包屑是当前页面（组件会自动移除它的 `to`）。新 API 将其拆分到两个 TopBar 插槽中。

```tsx
// Old — one array, leaf included
<Breadcrumbs crumbs={[{label: t('Monitors'), to: basePath}, {label: monitor.name}]} />

// New — parents in one slot, the current page in the other
<Fragment>
  <TopBar.Slot name="breadcrumbs">
    <BreadcrumbList items={[{type: 'link', label: t('Monitors'), to: basePath}]} />
  </TopBar.Slot>
  <TopBar.Slot name="title">
    <BreadcrumbList.Title item={{type: 'page-title', label: monitor.name}} />
  </TopBar.Slot>
</Fragment>
```

`BreadcrumbList.Title` **不会渲染标题**。`title` outlet 已经将其子元素包裹在 `<Heading as="h1">` 中，请通过 `grep -n 'Heading as="h1"' static/app/views/navigation/topBar.tsx` 进行确认。绝不要将 `BreadcrumbList.Title` 包裹在 `Heading` 中，也绝不要将 `breadcrumbs` 插槽嵌套在 `title` 插槽中。这两个错误都是不可见的：outlet 和 title item 都使用 `variant="inherit"`，因此嵌套的 heading 看起来完全相同，只会在 a11y 审计中失败。

## ⚠️ `preservePageFilters` 会在展开后保留

该 prop 不存在于 `BreadcrumbItemLinkProps` 上。作为**直接字面量**时，它会被捕获：

```tsx
// error TS2353: 'preservePageFilters' does not exist in type 'LinkBreadcrumbItem'
items={[{type: 'link', label: 'Issues', to: '/issues/', preservePageFilters: true}]}
```

通过**展开**传入时可以干净地编译通过，而展开 legacy crumbs 正是迁移惯用方式：

```tsx
// Compiles. Ships a page that silently drops project/environment/date filters on click.
.map(crumb => ({type: 'link' as const, ...crumb}))
```

多余属性检查只适用于新的对象字面量，因此携带 `preservePageFilters` 的 `Crumb` 会直接传递到 `<Link>`，而 `<Link>` 会忽略它。没有类型错误，也没有失败的测试。**不要展开，而应显式解构**，然后重新构造 query。

请注意其影响。丢失该标志的面包屑不只是无法携带筛选条件，它还会**清除**筛选条件。`PageFiltersContainer` 会在导航时将其 store 与 URL 进行协调，而缺失的 `project` 会被读取为空选择，而不是“保持不变”。复制该标志并非锦上添花；跳过它会改变目标页面显示的内容。

```tsx
import {extractSelectionParameters} from 'sentry/components/pageFilters/parse';

// Preserve all six — project, environment, statsPeriod, start, end, utc.
// A legacy `to` is often a bare pathname string; restructure it into an
// object, as there is nowhere to hang a query otherwise.
const preserveAll = {
  pathname: makeReleasesPathname({organization, path: '/'}),
  query: extractSelectionParameters(location.query),
};

// Preserve some — spread, then override. Clearing `start`/`end` is required
// whenever you set `statsPeriod`, or an absolute range and a relative period
// both travel and the destination picks one.
const preserveSome = {
  pathname: makeReleasesPathname({organization, path: '/'}),
  query: {
    ...extractSelectionParameters(location.query),
    statsPeriod: '24h',
    start: undefined,
    end: undefined,
  },
};
```

不要通过保留裸路径名来保留任何内容，这是不带该标志的 crumb 的行为，而迁移某个 crumb 并不是开始保留内容的时机。当 crumb 已经有一个 `to` 对象时，应进行合并而不是替换：`{...to, query: {...extractSelectionParameters(location.query), ...to.query}}`。

查找仍然传入该参数的调用点：`grep -rln "preservePageFilters: true" static/app --include='*.tsx'`。

## 各 API 接受的内容

|                                      | 接受                                                                                                                         | 形状             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `<BreadcrumbList items={...}/>`      | `'link'`（`label: string`、`to`、`leadingGraphic?`）、`'select-projects'`                                                    | 数组             |
| `<BreadcrumbList.Title item={...}/>` | `'page-title'`（`label: string`、`labelTooltip?`、`leadingGraphic?`、`pagination?`、`trailingActions?`）、`'editable-title'` | **单个对象** |

Title 操作是第三个联合类型，一个对象，或者一个数组，其中缺失的项为 `null`：

| `trailingActions`  | 必填字段                                                 |
| ------------------ | ------------------------------------------------------------ |
| `{type: 'copy'}`   | `text`、`label`                                                 |
| `{type: 'menu'}`   | `items`、`triggerLabel`                                         |
| `{type: 'button'}` | `element`、类型为 `ReactElement<ButtonProps \| LinkButtonProps>` 的 `element` |

导入始终使用 `import {BreadcrumbList} from '@sentry/scraps/breadcrumbList'`，这是指向 `static/app/components/core/` 的别名。该 barrel 只导出 `BreadcrumbList` 和类型 `BreadcrumbTitleItem`。`type: 'link'` 要求 `label: string` 和非空的 `to`；`leadingGraphic` 是可选的。

## 选择调用点形状

编辑前先进行分类，不同形状所需的工作量不同，其中三种形状会涉及多个文件。

| 形状  | 模式                                                                                                                                              | 额外工作                                                                                                                                                                                                                                                                                                                                  |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A1** | `TopBar.Slot name="title"` 内的 `<Breadcrumbs>`                                                                                                    | 仅拆分 slot。JSX 叶节点标签可能仍需要完整分解，请参阅 `references/title-item.md`。注意，该元素有时会先赋值给变量（`automations/detail.tsx`），或通过 `styled(Breadcrumbs)` 创建别名（`preprod/install/buildInstallHeader.tsx`），因此 `<Breadcrumbs` 可能不会出现在 slot 内 |
| **A2** | 在调用方的 `title` slot 内渲染的**包装组件**                                                                                    | **修改两个位置**。包装组件返回包含两个 slot 的 `Fragment`；调用方外层的 `title` slot 必须删除，否则 `breadcrumbs` 会嵌套在 `title` 中，父级链接也会渲染到 `<h1>` 内                                                                                                                                           |
| **B**  | `Layout.HeaderContent` 中与 `Layout.Title` 并列的 `<Breadcrumbs>`                                                                                      | 修复实际存在的重复渲染问题。标题由 `Layout.Title` 负责；被移出的叶节点通常是类别描述（例如“Cron Monitor”），需要一个当前文件中尚未存在的真实 `to`。**例外情况见下文**                                                                                                                                        |
| **C**  | 被其他页面使用的导出包装组件，**仅限于**某个消费者将其包装在 `title` slot 中的情况；拥有自身 slot 的导出 header 属于 B 或 E | 所有消费者都必须在同一个 PR 中修改。对于每个消费者：将外层 ternary 提升到 slot 之上，删除外层 slot，并放置或删除该 slot 中的每个兄弟节点                                                                                                                                                              |
| **E**  | 与原始 `<Heading as="h1">` 并列的 `<Breadcrumbs>`                                                                                                     | 删除本地标题，否则页面会包含两个 `<h1>`】【。

**如果没有任何一行匹配，就不要强行套用。** 表格描述的是编写此 skill 时存在的标题。请根据文件_实际具有的内容_进行分类：`Layout.Title`、原始标题、包装器中的标题插槽、导出的包装器，然后遵循最接近的一行。如果某个标题的结构与这些情况都不同，请先询问，再进行重构，不要猜测；确定结构后，在此处添加一行。

`views/performance/breadcrumb.tsx` 仅包含类型代码（`import type {Crumb}`，没有 JSX）。它要做的是删除旧适配器，但目前受阻，详见 `references/call-site-inventory.md`。

**Shape B 有一个例外，完全没有叶子 crumb**；此时机械地应用“`Layout.Title` 优先”会渲染两次相同文本，详见 `references/call-site-inventory.md`。

`Layout.Title` 已经是 `TopBar.Slot name="title"` 的 shim（`grep -n 'export function Title' static/app/components/layouts/thirds.tsx`），这正是 Shape B 页面当前会重复渲染的原因。

## 构建 `items`

只保留父级，叶子已变为标题。

```tsx
// Drop crumbs with no destination: `to` is required and non-nullable.
const items = parents.flatMap(c =>
  c.to ? [{type: 'link' as const, label: c.label, to: c.to}] : []
);
```

空的 `items` 不渲染任何内容，这是正确的，标题插槽仍会渲染。**不要为了避免这种情况而臆造父级链接。** 如果旧代码通过长度检查来控制 trail 的渲染，请移植该条件。

这与 Shape B 中“为被移出的叶子补充 `to`”并不冲突，因为它们是不同的 crumb。作为**页面名称**的叶子会变成标题，并离开 `items`。作为**类别描述**（“Cron Monitor”）的叶子是真正的父级，只是原本没有链接：请在已有导入的 `make*Pathname` 旁边查找该类别对应的 `make*Pathname`，并优先采用两链接 trail。只有在无处可链接时才将其丢弃。

## 逐页工作流程

1. 阅读文件。找到 crumb 数组；注意其最后一个元素是否有 `to`。
2. 对结构进行分类。对于 **A2/C**，立即执行 `grep -rn '<WrapperName'`，并列出每个消费者标题插槽中的所有同级节点，消费者也是此次变更的一部分，不能留到后续处理。仅当文件是包装器，或出现在其硬性行列表中时，才阅读 `references/call-site-inventory.md`；对于普通 A1/B/E 文件，上面的结构表已经足够。
3. **在写入任何内容之前确定标题。** 按以下优先级选择：(1) `Layout.Title` 的内容；(2) 同级的原始 `<Heading as="h1">`；(3) 最后一个 crumb。如果标题不渲染 heading，且最后一个 crumb 没有 `to`，则最后一个 crumb 就是标题。如果选择受布尔值控制，请将该布尔值提升到两个插槽之上，并为每个分支分别提供自己的 `BreadcrumbList.Title`，绝不要只迁移其中一个分支。名称可由用户编辑时使用 `editable-title`，否则使用 `page-title`。
4. 构建标题项。→ `references/title-item.md`
5. 根据剩余内容构建 `items`。移除叶子。丢弃没有 `to` 的 crumb，或为其重新指定链接。替换 `preservePageFilters`。移植任何长度保护条件。
6. 渲染两个插槽，顺序为 `breadcrumbs`，然后是 `title`。当组件直接返回它们时，使用 `Fragment` 包裹。然后检查旧包装器还剩下什么：**如果现在某个 `Layout.Header` 或 `Layout.HeaderContent` 中只剩 `TopBar.Slot` 子节点，就将其删除。** 插槽在其所在位置不渲染任何内容，而 `Layout.Header` 实际上是带有内边距和底部边框的 `<Grid as="header">`，保留它会在页面主体上方产生一个空的带边框条带。只有在它仍包含非插槽子节点时才保留，例如 `Layout.HeaderTabs`。
7. 只删除因迁移而成为孤立项的内容，详见下面的检查清单保护。
8. 修复规格测试。→ `references/tests.md`
9. 验证：`pnpm run typecheck`（整个项目，不接受路径参数）、`.venv/bin/prek run -q --files <files>`、`pnpm test-ci <spec>`，并重新运行计数；计数必须减少，同时仍然大于或等于 4。

步骤 3 先于步骤 5，因为它决定会留下哪些面包屑。先构建 `items` 会让叶节点重复渲染一次，并迫使两个槽位都重新处理。

## 参考资料

| 在以下情况下打开                                                                                           | 阅读                                |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 了解文件的结构、谁使用某个包装器，或文件包含哪些代码块                                        | `references/call-site-inventory.md` |
| 构建名称不只是普通字符串的标题 — 徽章、工具提示、可编辑字段、分页或操作 | `references/title-item.md`          |
| 为迁移后的页面编写或修复规范                                                                         | `references/tests.md`               |

## 参考实现

已完成迁移，按从简单到复杂排列。每个实现分别回答一个问题。

| 文件                                                                   | 回答的问题                                                                                  |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `views/detectors/components/details/common/header.tsx`                 | 最小的双槽拆分                                                               |
| `views/explore/conversations/components/conversationsBreadcrumbs.tsx`  | 替换 `preservePageFilters`；独立的 `copy` 操作                              |
| `views/performance/transactionSummary/transactionBreadcrumbs.tsx`      | 将共享的面包屑构建器映射为类型化的项；`leadingGraphic`；带子菜单的菜单 |
| `views/performance/newTraceDetails/traceHeader/traceBreadcrumbs.tsx`   | `pagination`；使用 `.flatMap` 丢弃未链接的面包屑                                   |
| `views/dashboards/dashboardBreadcrumbTitle.tsx`                        | `editable-title`；每种页面状态各使用一个提前返回                                                               |
| `views/explore/replays/detail/header/replayDetailsPageBreadcrumbs.tsx` | 最丰富的标题 — 同时包含分页、`leadingGraphic` 和置为 null 的操作数组     |
| `views/issueDetails/header/issueIdBreadcrumb.tsx`                      | 在 JSX 外部使用 `as const satisfies` 构建标题项                              |

## 有意未迁移的部分

四个导入方仍保留旧版组件 — 包括组件自身的规范，以及三个在页面 `<h1>` 外部渲染、需要 `<nav>` 地标而 `BreadcrumbList` 没有相应模式的调用点。**数量下限为 4；将其降到 0 会破坏一个地标。** 路由驱动的 `SettingsBreadcrumb` 系统也不在范围内。这两个列表都位于 `references/call-site-inventory.md` 中。

## 发布

数量就是进度状态 — 无需维护同步的临时文件。

```bash
grep -rl "from 'sentry/components/breadcrumbs'" static/app | wc -l
```

每个 PR 迁移一个视图区域。根据 `@.github/CODEOWNERS` 中的所有权边界进行拆分，每个 PR 大约包含 50 个变更文件。标题使用 `ref(<area>): Migrate breadcrumbs to BreadcrumbList`；如果页面操作被移入标题菜单，则使用 `feat(<area>): ...`。**没有功能开关**，`ui-migration-breadcrumbs` 和 `useHasNewBreadcrumbs()` 已被删除，因此合并后所有用户的页面都会切换。某些较早的参考 PR 仍然展示了功能开关分支；该模式现在已是死代码。

## 迁移检查清单

每一项都是 grep 或编译检查，因为这里每个依赖判断的检查，早期草稿都曾出错。

- [ ] diff 中没有 `preservePageFilters:`，并且没有将旧版面包屑展开到类型化条目中：使用 `preservePageFilters:`（带冒号）进行 `grep`，并搜索在生成 `type: 'link'` 的 `.map` 中的 `...crumb`。带展开的写法可以通过编译，却会静默丢弃页面筛选条件。
- [ ] 没有遗留只包含 `TopBar.Slot` 子项的包装器，槽位不会在原位置渲染内容，因此遗留的带内边距或边框的 `Layout.Header` 会变成页面主体上方的空白条。
- [ ] 文件中恰好有一个 `TopBar.Slot name="title"`、零个 `as="h1"`、零个 `Layout.Title`；其中任何一个残留都会使页面名称重复渲染，或产生两个 `<h1>`。
- [ ] `name="title"` 子树中没有 `TopBar.Slot name="breadcrumbs"`；嵌套会将父级链接渲染到页面标题中，由于两者都使用 `variant="inherit"`，看起来却是正确的。
- [ ] 每个 `type: 'link'` 都有真实的 `to`。空的 `items` 没问题，会渲染为空；虚构的父级链接则不行。
- [ ] 没有 `useHasNewBreadcrumbs` 或 `ui-migration-breadcrumbs`；二者在整个仓库中都已失效，因此功能开关分支永远不会被渲染。
- [ ] `label` 是普通字符串。将 JSX 标签转换为字符串会删除徽章、工具提示或复制操作。
- [ ] `leadingGraphic` 中的每个 `IdBadge`/`ProjectBadge` 都传入 `disableLink`；该槽位具有 `aria-hidden` 属性，而 `IdBadge`/`ProjectBadge` 在未传入该属性时会渲染可聚焦的 `<a href>`，从而将可通过 Tab 聚焦的链接放入隐藏子树中。类型检查可以通过，测试也可以通过，但 axe 审计会失败。
- [ ] `leadingGraphic` 中的头像传入 `avatarSize={16}`，并使用 `<Placeholder width="16px" height="16px"/>` 作为回退；该槽位固定为 16×16，因此 28px 的头像会被裁剪，而缺少图形时的回退会导致标题在数据到达后发生偏移。
- [ ] 在 JSX 外部构建的标题条目以 `as const satisfies BreadcrumbTitleItem` 结尾；否则 `type` 会被扩大为 `string`，联合类型将无法继续进行类型收窄。
- [ ] 数组形式的 `trailingActions` 对缺失的条目使用 `null`；单个操作应使用裸对象，而不是包含一个元素的数组。
- [ ] 每个受影响的 spec 都在 `<TopBar.Slot.Provider>` 内挂载 `<TopBar />`，或者声明一个 `breadcrumbs` outlet；仅模拟 `title`/`actions`/`feedback` 的 spec 不会渲染父级面包屑，并会像组件损坏一样失败。
- [ ] 叶节点应被断言为不在路径中，而不仅仅是作为标题存在。
- [ ] 数量有所减少，并且仍然大于或等于 4。

此列表中有意省略了 Overflow collapse，因为 jsdom 从不计算容器查询。请参阅 `references/tests.md`。