---
name: cmdk-actions
description: Guide for adding new actions to Sentry's Command+K palette. Use when implementing new cmdk actions, registering page-level or global actions, building async resource pickers, or adding contextual actions to a view.
---
# 向命令面板（cmdk）添加操作

Sentry 的 Command+K 面板构建于树形集合系统之上，其中 `CMDKAction` 组件通过 React 上下文注册自身。操作会在组件树中其所在的位置进行渲染——无需更新中央注册表。

## 核心文件

- **`static/app/components/commandPalette/ui/cmdk.tsx`** — `CMDKAction` 组件（你唯一需要的基础组件）
- **`static/app/components/commandPalette/types.tsx`** — 公共类型 + `cmdkQueryOptions` 辅助函数
- **`static/app/components/commandPalette/ui/commandPaletteSlot.tsx`** — 用于限定作用域的 `CommandPaletteSlot`
- **`static/app/components/commandPalette/ui/commandPaletteGlobalActions.tsx`** — 始终启用的全局操作

---

## 三种插槽

插槽控制排序顺序和生命周期。从 `commandPaletteSlot.tsx` 导入：

```tsx
import {CommandPaletteSlot} from 'sentry/components/commandPalette/ui/commandPaletteSlot';
```

| 插槽     | 在面板中的顺序         | 生命周期                                   | 用途                                                                 |
| -------- | ------------------------ | ------------------------------------------ | ----------------------------------------------------------------------- |
| `task`   | 第一（最高优先级） | 保留——尚未在生产环境中使用      | 未来的临时工作流步骤                                         |
| `page`   | 第二                   | 与页面组件的挂载/卸载绑定 | 当前视图的上下文操作（问题详情、设置页面） |
| `global` | 最后                     | 对任何组织始终存在                 | 组织范围的导航、创建操作、帮助                               |

将页面级操作包装在插槽提供者中：

```tsx
// In a page component or its sub-tree
<CommandPaletteSlot name="page">
  <CMDKAction display={{label: t('Resolve Issue')}} onAction={handleResolve} />
</CommandPaletteSlot>
```

全局操作会在 `GlobalCommandPaletteActions` 中注册一次——请将操作添加到该组件，而不是创建新的全局插槽使用者。

---

## `CMDKAction` 属性

```ts
interface CMDKActionProps {
  // Required: what the user sees
  display: {
    label: string; // primary text
    details?: string; // secondary description line
    icon?: React.ReactNode; // icon on the left — use default size for section icons,
    // size={16} for avatars (ProjectAvatar, ActorAvatar, TeamAvatar)
    trailingItem?: React.ReactNode; // right-side decoration (overrides link indicator)
  };

  // Optional: improve search recall
  keywords?: string[];

  // Optional stable key. Prefix with "cmdk:supplementary:" to sort last in
  // search results regardless of fuzzy score (used for the Help section).
  id?: string;

  // --- Choose one action type (TypeScript union enforces mutual exclusivity) ---

  // 1. Navigate
  to?: LocationDescriptor;

  // 2. Callback
  onAction?: () => void;

  // 3. Group/resource — requires children or resource to render anything.
  //    Without at least one of those the component returns null.
  resource?: (query: string, context: CMDKResourceContext) => CMDKQueryOptions;
  children?: React.ReactNode | ((data: CommandPaletteAction[]) => React.ReactNode);

  // --- Group display ---

  // Overrides the input placeholder when the user drills into this action.
  // Has no effect without children or resource — the node still needs content
  // to drill into.
  prompt?: string;

  // Max results shown before a "See all" expansion item appears.
  // Default: 4 when resource is set and children is a render-prop function.
  // No default for static children.
  limit?: number;
}
```

---

## 操作模式

### 1. 导航链接

```tsx
import {CMDKAction} from 'sentry/components/commandPalette/ui/cmdk';
import {IconIssues} from 'sentry/icons';

<CMDKAction
  display={{
    label: t('Go to Issues'),
    icon: <IconIssues />,
  }}
  keywords={['bugs', 'errors', 'problems']}
  to={`/organizations/${org.slug}/issues/`}
/>;
```

### 2. 回调操作

```tsx
<CMDKAction
  display={{label: t('Resolve Issue'), details: t('Mark as resolved')}}
  onAction={() => handleResolve(group.id)}
/>
```

### 3. 静态分组

嵌套 `CMDKAction` 子元素可创建一个可逐层进入的分组。父级标签会作为面包屑前缀显示在搜索结果中（例如 `Set Priority > High`），因此应使用能够标识上下文的标签。

**将分组图标用作当前状态指示器**：将分组自身的图标设置为反映当前值，这样用户在逐层进入之前就能看到状态。优先级选择器和负责人选择器都采用了这种方式：

```tsx
// Icon reflects current priority — user sees state at a glance
<CMDKAction
  display={{
    label: t('Set Priority'),
    icon: <IconCellSignal bars={PRIORITY_BARS[group.priority ?? PriorityLevel.MEDIUM]} />,
  }}
>
  <CMDKAction
    display={{label: t('High'), icon: <IconCellSignal bars={3} />}}
    onAction={() => setPriority('high')}
  />
  <CMDKAction
    display={{label: t('Medium'), icon: <IconCellSignal bars={2} />}}
    onAction={() => setPriority('medium')}
  />
  <CMDKAction
    display={{label: t('Low'), icon: <IconCellSignal bars={1} />}}
    onAction={() => setPriority('low')}
  />
</CMDKAction>;

// Icon reflects current assignee — avatar when assigned, generic icon when not
const assigneeIcon = group.assignedTo ? (
  <ActorAvatar actor={group.assignedTo} size={16} hasTooltip={false} />
) : (
  <IconUser />
);

<CMDKAction display={{label: t('Assign to'), icon: assigneeIcon}}>
  {/* children */}
</CMDKAction>;
```

### 4. 异步资源选择器

使用 `resource` + `cmdkQueryOptions` 从 API 加载项目。用户通过输入内容进行筛选。查询进行期间，加载指示器会自动启用。

注意：当用户逐层进入资源节点时，命令面板会清空查询。你的 `resource` 函数最初会收到一个空字符串——请据此设计查询参数。

```tsx
import {cmdkQueryOptions} from 'sentry/components/commandPalette/types';
import {apiOptions} from 'sentry/utils/api/apiOptions';
import {ProjectAvatar} from '@sentry/scraps/avatar';

<CMDKAction
  display={{label: t('Switch Project')}}
  prompt={t('Select a project...')}
  limit={5}
  resource={(query, context) =>
    cmdkQueryOptions({
      ...apiOptions.as<Project[]>()('/organizations/$organizationIdOrSlug/projects/', {
        path: {organizationIdOrSlug: org.slug},
        query: {query, per_page: 20},
        staleTime: 30_000,
      }),
      // Only fetch once the user has drilled into this node
      enabled: context.state === 'selected',
      select: projects =>
        projects.map(project => ({
          display: {
            label: project.slug,
            icon: <ProjectAvatar project={project} size={16} />,
          },
          to: `/organizations/${org.slug}/projects/${project.slug}/`,
        })),
    })
  }
/>;
```

**`resource` 的规则：**

- **始终**使用 `cmdkQueryOptions(...)` 包裹——它会注入 `meta: { cmdk: true }`，使面板的加载指示器能够通过 `useIsFetching` 跟踪请求。
- 使用 `enabled: context.state === 'selected'`，将数据获取推迟到用户实际进入该层级时。
- `select` 字段必须将 API 响应转换为 `CommandPaletteAction[]`。
- `query` 是实时搜索输入值（未经防抖）——将其作为搜索参数传递。
- 对于很少变化的数据（项目列表、设置导航项），使用 `staleTime: Infinity`。对于用户/会话数据，使用 `staleTime: 30_000`。

### 5. 使用渲染属性子元素的资源

当你需要自定义渲染或混合静态项和异步项时，请使用渲染属性。

`CommandPaletteAction` 是一个联合类型，其中包含分组（分组具有 `actions`，而不是 `children`）。不要盲目地将项展开到 `CMDKAction` 中——应进行类型收窄，仅处理 `to` 和 `onAction` 变体，就像代码库自身的 `renderAsyncResult` 辅助函数所做的那样：

```tsx
// Type-safe helper — skip groups, which can't be spread into CMDKAction
function renderAsyncResult(item: CommandPaletteAction, index: number) {
  if ('to' in item) return <CMDKAction key={index} {...item} />;
  if ('onAction' in item) return <CMDKAction key={index} {...item} />;
  return null;
}

<CMDKAction
  display={{label: t('Assign to')}}
  prompt={t('Search teammates...')}
  resource={(query, context) =>
    cmdkQueryOptions({
      queryKey: ['members', org.slug, query],
      queryFn: () => fetchMembers(org.slug, query),
      enabled: context.state === 'selected',
      select: members =>
        members.map(m => ({
          display: {label: m.name, details: m.email},
          onAction: () => assignTo(m.id),
        })),
    })
  }
>
  {members => (
    <>
      {/* Static first entry */}
      <CMDKAction display={{label: t('Assign to me')}} onAction={assignToMe} />
      {/* Dynamic entries from resource */}
      {members.map(renderAsyncResult)}
    </>
  )}
</CMDKAction>;
```

**自动渲染的限制**：当 `children` _不是_渲染属性（静态子元素 + `resource`）时，资源结果中的 `CommandPaletteActionGroup` 项会被静默跳过。只有 `to` 和 `onAction` 结果会被自动渲染。如果需要渲染资源中的分组，请使用渲染属性模式。

### 6. 通过 hook 使用静态异步子元素

当数据集较小且已被缓存时，使用 hook 获取数据，并将其渲染为静态 JSX 子元素。面板内置的模糊搜索会在客户端处理筛选——无需使用 `resource` 属性：

```tsx
// useProjectMembers fetches once and caches; palette fuzzy-searches the results
const {data: members = []} = useProjectMembers(project.id);
const assignableUsers = members.filter(m => m.id !== currentUser.id);

<CMDKAction display={{label: t('Assign to'), icon: assigneeIcon}}>
  <CMDKAction
    display={{label: t('Assign to me')}}
    onAction={() => handleAssign(currentUser)}
  />
  {assignableUsers.map(member => (
    <CMDKAction
      key={`member-${member.id}`}
      display={{
        label: member.name || member.email,
        icon: (
          <ActorAvatar
            actor={{id: member.id, name: member.name, type: 'user'}}
            size={16}
            hasTooltip={false}
          />
        ),
      }}
      onAction={() => handleAssign(member)}
    />
  ))}
  {teams.map(team => (
    <CMDKAction
      key={`team-${team.id}`}
      display={{
        label: `#${team.slug}`,
        icon: <TeamAvatar team={team} size={16} hasTooltip={false} />,
      }}
      onAction={() => handleAssign(team)}
    />
  ))}
</CMDKAction>;
```

**何时使用静态子项，何时使用 `resource`：**

|          | 通过 hook 提供静态子项 | `resource` prop        |
| -------- | ---------------------- | ---------------------- |
| 数据集大小 | 小且有界               | 大或无界               |
| 筛选       | 客户端模糊搜索         | 服务端搜索             |
| 获取时机   | 立即（组件挂载时）     | 延迟（深入查看时）     |
| 查询更新   | 渲染时固定             | 响应输入的查询内容     |

**混合实体列表的键命名**：为键添加实体类型前缀以防止冲突——`member-${id}`、`team-${id}`、`${owner.type}-${owner.id}`、`coding-agent:${id}`。

### 7. `trailingItem`——标记当前项

仅对用户需要在不同对象之间切换的**实体选择**使用带有 `"Current"` 徽章的 `trailingItem`，例如项目、组织、用户、环境及类似实体。当各项在其他方面难以区分时，该徽章用于回答“我当前在哪一个实体上？”这一问题。

**不要**对设置或模式（排序顺序、主题、显示密度等）使用 `"Current"`。这些选项在任意时刻都有唯一的正确值，并且分组自身的标签或图标已经反映了该值（请参阅上文将分组图标用作状态指示器的模式）。在设置选项上添加 `"Current"` 徽章只会重复信息，并不会让含义更加清晰。

```tsx
import {Tag} from '@sentry/scraps/badge';

// ✅ Entity selection — badge makes sense: user sees which project they're on
<CMDKAction
  display={{label: t('Switch Project')}}
  prompt={t('Select a project...')}
  resource={(query, context) => cmdkQueryOptions({...})}
>
  {/* Current project rendered statically so it always appears first */}
  <CMDKAction
    display={{
      label: currentProject.slug,
      icon: <ProjectAvatar project={currentProject} size={16} />,
      trailingItem: <Tag variant="muted">{t('Current')}</Tag>,
    }}
    to={`/organizations/${org.slug}/projects/${currentProject.slug}/`}
  />
</CMDKAction>

// ❌ Settings/mode — do not use a badge; the group label already shows the active value
<CMDKAction
  display={{
    label: t('Sort by: %s', getSortLabel(sort)), // label reflects current state
    icon: <IconSort />,
  }}
>
  {sortKeys.map(key => (
    <CMDKAction
      key={key}
      display={{
        label: getSortLabel(key),
        // trailingItem: key === sort ? <Tag variant="muted">{t('Current')}</Tag> : undefined
        // ❌ Don't do this — the group label already communicates the active sort
      }}
      onAction={() => onSortChange(key)}
    />
  ))}
</CMDKAction>
```

### 7. 由查询内容控制的资源

资源可以根据用户输入的内容激活，而不仅仅取决于深入查看状态。此方式适用于仅对特定查询形式有意义的上下文查找工具：

```tsx
const DSN_PATTERN = /^https?:\/\/.+@.+\/.+/;

<CMDKAction
  display={{label: t('DSN Lookup')}}
  prompt={t('Paste a DSN...')}
  resource={(query, context) =>
    cmdkQueryOptions({
      ...apiOptions.as<DsnLookupResponse>()(/* ... */),
      // Only fetch when the query looks like a DSN
      enabled: context.state === 'selected' && DSN_PATTERN.test(query),
      select: result => result.navTargets.map(/* ... */),
    })
  }
/>;
```

### 8. 状态条件操作

根据实体的当前状态渲染不同的操作，而不仅仅依据功能标志。不适用于当前状态的操作应直接不予渲染：

```tsx
<CommandPaletteSlot name="page">
  <CMDKAction display={{label: issueTitle}} icon={<ProjectAvatar ... />}>
    {!isResolved && !isArchived && (
      <CMDKAction display={{label: t('Resolve')}} onAction={handleResolve} />
    )}
    {!isResolved && !isArchived && (
      <CMDKAction display={{label: t('Archive')}} onAction={handleArchive} />
    )}
    {isResolved && (
      <CMDKAction display={{label: t('Unresolve')}} onAction={handleUnresolve} />
    )}
    {isArchived && (
      <CMDKAction display={{label: t('Unarchive')}} onAction={handleUnarchive} />
    )}
  </CMDKAction>
</CommandPaletteSlot>
```

### 9. 补充（始终位于最后）部分

为 `id` 添加 `cmdk:supplementary:` 前缀，可使该部分无论搜索得分如何，都排在所有其他结果之后。该部分保留用于帮助链接等绝不应出现在实际操作上方的内容。

```tsx
<CMDKAction
  id="cmdk:supplementary:help"
  display={{label: t('Help')}}
  resource={helpResource}
/>
```

---

## 跨组件拆分操作

当页面的操作集较为复杂时，将其拆分到多个组件中。注册操作的子组件**不需要自己的插槽**——它们会继承由父组件建立的插槽上下文。只需直接输出 `<CMDKAction>` 节点：

```tsx
// views/issueDetails/groupPriorityActions.tsx
// No slot here — registers under whatever parent mounts this
function GroupPriorityActions({group}: {group: Group}) {
  return (
    <CMDKAction display={{label: t('Set Priority')}}>
      <CMDKAction display={{label: t('High')}} onAction={() => setPriority('high')} />
      <CMDKAction display={{label: t('Medium')}} onAction={() => setPriority('medium')} />
      <CMDKAction display={{label: t('Low')}} onAction={() => setPriority('low')} />
    </CMDKAction>
  );
}

// views/issueDetails/seerActions.tsx
// Returns a Fragment of siblings — adds actions into the parent group without
// creating an extra nesting level
function SeerActions({group}: {group: Group}) {
  if (!canShowSeer) return null;
  return (
    <Fragment>
      <CMDKAction
        display={{label: t('Fix with Seer'), icon: <IconSeer />}}
        onAction={startAutofix}
      />
    </Fragment>
  );
}

// views/issueDetails/issueCommandPaletteActions.tsx
// Only this component owns the slot
function IssueCommandPaletteActions({group, issue}: Props) {
  return (
    <CommandPaletteSlot name="page">
      <CMDKAction
        display={{
          label: issue.title,
          icon: <ProjectAvatar project={project} size={16} />,
        }}
      >
        <GroupPriorityActions group={group} />
        <SeerActions group={group} />
      </CMDKAction>
    </CommandPaletteSlot>
  );
}
```

当子组件需要向现有父分组中添加扁平的同级项时，请使用 `<Fragment>`（而不是用 `<CMDKAction>` 包裹）。

---

## 注册全局操作

将操作添加到 `commandPaletteGlobalActions.tsx` 中的 `GlobalCommandPaletteActions`。不要创建第二个 `global` 插槽使用者——导航外壳中只有一个插槽出口，因此第二个使用者会与其竞争，而不是对其进行扩展。它是一个 JSX 组件——只需在相关分组中插入新的 `CMDKAction`，或创建一个新的命名分组：

```tsx
// Inside GlobalCommandPaletteActions render:
<CMDKAction display={{label: t('Go to')}}>
  {/* existing actions... */}
  <CMDKAction
    display={{label: t('Monitors'), icon: <IconTimer />}}
    to={`/organizations/${organization.slug}/crons/`}
  />
</CMDKAction>
```

---

## 注册页面级操作

创建一个使用 `<CommandPaletteSlot name="page">` 包装操作的组件，并将其挂载到相关页面组件中。这些操作会随页面的挂载/卸载生命周期自动注册和注销。

```tsx
// views/myFeature/myFeatureCommandPaletteActions.tsx
function MyFeatureCommandPaletteActions({item}: {item: MyItem}) {
  return (
    <CommandPaletteSlot name="page">
      <CMDKAction
        display={{label: t('Archive'), details: item.name}}
        onAction={() => archiveItem(item.id)}
      />
    </CommandPaletteSlot>
  );
}

// views/myFeature/myFeaturePage.tsx
function MyFeaturePage() {
  return (
    <div>
      <MyFeatureCommandPaletteActions item={item} />
      {/* rest of page */}
    </div>
  );
}
```

---

## 功能标志和权限门控

直接在行内基于其他标志或权限进行门控：

```tsx
{
  organization.features.includes('my-feature') && (
    <CMDKAction display={{label: t('My New Action')}} onAction={doThing} />
  );
}

{
  user.isStaff && <CMDKAction display={{label: t('Admin Panel')}} to="/admin/" />;
}
```

**页面被禁用时，对整个插槽进行门控**——不要渲染单独的禁用操作；完全不要渲染该插槽：

```tsx
// ✅ Gate at the slot level
{
  !disabled && (
    <CommandPaletteSlot name="page">
      <CMDKAction display={{label: entity.title}}>{/* all actions */}</CMDKAction>
    </CommandPaletteSlot>
  );
}
```

---

## 能力配置

当实体类型决定哪些操作可用时，应从配置对象中派生这些操作，而不是使用行内条件判断。`getConfigForIssueType(group, project)` 会返回各操作对应的能力标志：

```tsx
const config = useMemo(() => getConfigForIssueType(group, project), [group, project]);
const {
  actions: {resolve: resolveCap, delete: deleteCap},
} = config;

// Only render actions the issue type supports
{
  resolveCap.enabled && (
    <CMDKAction display={{label: t('Resolve')}} onAction={handleResolve} />
  );
}
```

对于新的实体类型，请遵循相同的模式：定义一个包含能力标志的配置结构，然后基于这些标志对渲染进行门控，而不是到处使用 `group.type === '...'` 检查。

---

## 工作流／顺序状态机

当操作表示多阶段工作流中的步骤时，只显示_下一个有效操作_——不要一次显示所有可能的步骤。仅当前一步已完成且下一步尚未开始时，才显示对应步骤：

```tsx
// Extract state into a dedicated hook in the same file
function useSeerState(group: Group, project: Project) {
  const autofix = useExplorerAutofix(group.id);
  const sections = getOrderedAutofixSections(autofix.runState);

  return {
    autofix,
    completedRootCause: sections.some(
      s => isRootCauseSection(s) && s.status === 'completed'
    ),
    completedSolution: sections.some(
      s => isSolutionSection(s) && s.status === 'completed'
    ),
    completedCodeChanges: sections.some(
      s => isCodeChangesSection(s) && s.status === 'completed'
    ),
    hasPR: sections.some(isPullRequestsSection),
    runId: autofix.runState?.run_id,
    isPolling: autofix.isPolling,
  };
}

function WorkflowActions({group, project}: Props) {
  const {
    autofix,
    completedRootCause,
    completedSolution,
    completedCodeChanges,
    hasPR,
    runId,
    isPolling,
  } = useSeerState(group, project);

  // Guard: can only advance the workflow when not mid-operation and run exists
  const canContinue = !isPolling && defined(runId);

  return (
    <Fragment>
      {(!autofix.runState || autofix.runState.status === 'error') && (
        <CMDKAction display={{label: t('Fix with Seer')}} onAction={startFix} />
      )}
      {canContinue && completedRootCause && !completedSolution && (
        <CMDKAction
          display={{label: t('Generate solution')}}
          onAction={() => nextStep('solution', runId)}
        />
      )}
      {canContinue && completedSolution && !completedCodeChanges && (
        <CMDKAction
          display={{label: t('Generate code changes')}}
          onAction={() => nextStep('code_changes', runId)}
        />
      )}
      {canContinue && completedCodeChanges && !hasPR && (
        <CMDKAction
          display={{label: t('Open pull request')}}
          onAction={() => createPR(runId)}
        />
      )}
    </Fragment>
  );
}
```

要点：

- 将状态逻辑提取到操作组件文件内专用的 `use*State` hook 中——让 JSX 保持简洁。
- 使用 `canContinue` 守卫，避免在异步操作进行期间显示推进流程的操作。
- 当功能不适用时，在组件顶部提前返回 `null`：

```tsx
// Guard clause — return null before any hooks if possible, else after
if (!aiConfig.areAiFeaturesAllowed || !isExplorer || !issueTypeSupportsSeer || !event) {
  return null;
}
```

---

## 动态标签

在操作标签中嵌入当前值，以便在无需用户先深入查看的情况下提供上下文：

```tsx
// Shows who is currently assigned
<CMDKAction
  display={{label: t('Unassign from %s', currentAssigneeName)}}
  onAction={() => handleAssigneeChange(null)}
/>

// Shows the current value being changed
<CMDKAction
  display={{label: t('Change theme: %s', currentTheme)}}
  onAction={openThemePicker}
/>
```

使用 `t('... %s', value)`（printf 风格），而不是模板字面量，以确保字符串可翻译。

---

## 检查清单

- [ ] 将页面级操作包装在 `<CommandPaletteSlot name="page">` 中；将全局操作添加到 `GlobalCommandPaletteActions`
- [ ] 拆分页面操作集的子组件**不要**添加自己的 slot——它们会从父组件继承
- [ ] 所有 `resource` 函数都使用 `cmdkQueryOptions(...)`
- [ ] `resource` 函数设置 `enabled: context.state === 'selected'` 以延迟获取数据（对于上下文资源，则使用查询内容检查）
- [ ] 资源选项中的 `select` 返回 `CommandPaletteAction[]`
- [ ] 在任何会替换搜索占位文本的下钻目标上设置 `prompt`
- [ ] 在资源节点上设置 `limit`，避免列表内容过多（默认值 4 仅在同时存在 `resource` 且 `children` 为 render-prop 函数时适用；自动渲染模式没有默认值）
- [ ] 对稳定列表（项目、导航项）使用 `staleTime: Infinity`；对动态数据使用 `staleTime: 30_000`
- [ ] 对任何应始终排在最后的分区使用 `id="cmdk:supplementary:..."`
- [ ] 为不直观的操作添加 `keywords`，以提高搜索召回率
- [ ] 分区/分组图标使用默认尺寸；头像图标（`ProjectAvatar`、`ActorAvatar`、`TeamAvatar`）使用 `size={16}`
- [ ] 根据状态决定是否存在的操作（已解决、已归档等）应通过条件渲染控制，而不是禁用
- [ ] `disabled` 状态应控制整个 `<CommandPaletteSlot>`，而不是单个操作
- [ ] 分组图标应反映其所控制设置的当前值（优先级、负责人、主题）
- [ ] 动态操作标签使用 `t('... %s', value)` 而不是模板字面量，以确保字符串可翻译
- [ ] 工作流操作组件将状态逻辑提取到专用的 `use*State` hook 中，并使用 `canContinue` 守卫
- [ ] 不适用的组件通过守卫子句在渲染任何 JSX 之前提前返回 `null`
- [ ] 实体能力配置（例如 `getConfigForIssueType`）决定操作是否可用，而不是使用分散的类型检查
- [ ] 动态列表键使用 `type-id` 格式（`member-${id}`、`team-${id}`），以防止不同类型之间发生冲突