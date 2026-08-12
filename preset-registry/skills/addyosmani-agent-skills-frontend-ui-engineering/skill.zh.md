---
name: frontend-ui-engineering
description: Builds production-quality, accessible, responsive user-facing UIs. Use when building or modifying interfaces and pages, creating components, implementing layouts, meeting WCAG accessibility requirements, managing state, or when the output needs to look and feel production-quality rather than AI-generated.
---
# 前端 UI 工程

## 概述

构建具备生产级质量、可访问、高性能且视觉精致的用户界面。目标是让 UI 看起来像是由顶尖公司的、具备设计意识的工程师打造，而不是由 AI 生成。这意味着真正遵循设计系统、正确实现可访问性、采用经过深思熟虑的交互模式，并且不带有千篇一律的“AI 审美”。

## 何时使用

- 构建新的 UI 组件或页面
- 修改现有的面向用户的界面
- 实现响应式布局
- 添加交互功能或状态管理
- 修复视觉或 UX 问题

## 组件架构

### 文件结构

将与组件相关的所有内容放在同一位置：

```
src/components/
  TaskList/
    TaskList.tsx          # Component implementation
    TaskList.test.tsx     # Tests
    TaskList.stories.tsx  # Storybook stories (if using)
    use-task-list.ts      # Custom hook (if complex state)
    types.ts              # Component-specific types (if needed)
```

### 组件模式

**优先使用组合，而非配置：**

```tsx
// Good: Composable
<Card>
  <CardHeader>
    <CardTitle>Tasks</CardTitle>
  </CardHeader>
  <CardBody>
    <TaskList tasks={tasks} />
  </CardBody>
</Card>

// Avoid: Over-configured
<Card
  title="Tasks"
  headerVariant="large"
  bodyPadding="md"
  content={<TaskList tasks={tasks} />}
/>
```

**保持组件职责单一：**

```tsx
// Good: Does one thing
export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className="flex items-center gap-3 p-3">
      <Checkbox checked={task.done} onChange={() => onToggle(task.id)} />
      <span className={task.done ? 'line-through text-muted' : ''}>{task.title}</span>
      <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
        <TrashIcon />
      </Button>
    </li>
  );
}
```

**将数据获取与展示分离：**

```tsx
// Container: handles data
export function TaskListContainer() {
  const { tasks, isLoading, error } = useTasks();

  if (isLoading) return <TaskListSkeleton />;
  if (error) return <ErrorState message="Failed to load tasks" retry={refetch} />;
  if (tasks.length === 0) return <EmptyState message="No tasks yet" />;

  return <TaskList tasks={tasks} />;
}

// Presentation: handles rendering
export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul role="list" className="divide-y">
      {tasks.map(task => <TaskItem key={task.id} task={task} />)}
    </ul>
  );
}
```

## 状态管理

**选择能够满足需求的最简单方案：**

```
Local state (useState)           → Component-specific UI state
Lifted state                     → Shared between 2-3 sibling components
Context                          → Theme, auth, locale (read-heavy, write-rare)
URL state (searchParams)         → Filters, pagination, shareable UI state
Server state (React Query, SWR)  → Remote data with caching
Global store (Zustand, Redux)    → Complex client state shared app-wide
```

**避免让 prop 逐层传递超过 3 层。** 如果你正在通过并不使用这些 prop 的组件传递它们，请引入 context，或重新组织组件树。

## 遵循设计系统

### 避免 AI 风格

AI 生成的 UI 具有一些易于识别的模式。应避免所有这些模式：

| AI 默认做法 | 为何存在问题 | 生产级质量做法 |
|---|---|---|
| 到处使用紫色/靛蓝色 | 模型默认采用视觉上“安全”的配色方案，导致每个应用看起来都千篇一律 | 使用项目实际的调色板 |
| 过度使用渐变 | 渐变会增加视觉噪声，并且与大多数设计系统冲突 | 使用符合设计系统的纯色或细微渐变 |
| 所有元素都使用圆角（rounded-2xl） | 最大圆角虽然传达出“友好”的感觉，却忽略了真实设计中的圆角层级 | 使用设计系统中一致的圆角半径 |
| 通用的首屏区块 | 模板驱动的布局与实际内容或用户需求毫无关联 | 内容优先的布局 |
| 类似 Lorem ipsum 的文案 | 占位文本会掩盖真实内容暴露出的布局问题（长度、换行、溢出） | 使用贴近真实情况的占位内容 |
| 到处使用超大内边距 | 一律宽松且相同的内边距会破坏视觉层级并浪费屏幕空间 | 使用一致的间距尺度 |
| 千篇一律的卡片网格 | 统一网格是一种布局捷径，忽略了信息优先级和浏览模式 | 以用途为导向的布局 |
| 大量使用阴影的设计 | 层叠阴影增加的深度会与内容争夺注意力，并降低低端设备的渲染速度 | 除非设计系统明确要求，否则使用轻微阴影或不使用阴影 |

### 间距和布局

使用一致的间距尺度。不要随意创造数值：

```css
/* Use the scale: 0.25rem increments (or whatever the project uses) */
/* Good */  padding: 1rem;      /* 16px */
/* Good */  gap: 0.75rem;       /* 12px */
/* Bad */   padding: 13px;      /* Not on any scale */
/* Bad */   margin-top: 2.3rem; /* Not on any scale */
```

### 排版

遵循文字层级：

```
h1 → Page title (one per page)
h2 → Section title
h3 → Subsection title
body → Default text
small → Secondary/helper text
```

不要跳过标题层级。不要将标题样式用于非标题内容。

### 颜色

- 使用语义化颜色令牌：`text-primary`、`bg-surface`、`border-default`——不要使用原始十六进制值
- 确保具有足够的对比度（普通文本为 4.5:1，大号文本为 3:1）
- 不要仅依赖颜色来传达信息（还应使用图标、文本或图案）

## 无障碍（WCAG 2.1 AA）

每个组件都必须符合以下标准：

### 键盘导航

```tsx
// Every interactive element must be keyboard accessible
<button onClick={handleClick}>Click me</button>        // ✓ Focusable by default
<div onClick={handleClick}>Click me</div>               // ✗ Not focusable
<div role="button" tabIndex={0} onClick={handleClick}    // ✓ But prefer <button>
     onKeyDown={e => {
       if (e.key === 'Enter') handleClick();
       if (e.key === ' ') e.preventDefault();
     }}
     onKeyUp={e => {
       if (e.key === ' ') handleClick();
     }}>
  Click me
</div>
```

### ARIA 标签

```tsx
// Label interactive elements that lack visible text
<button aria-label="Close dialog"><XIcon /></button>

// Label form inputs
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Or use aria-label when no visible label exists
<input aria-label="Search tasks" type="search" />
```

### 焦点管理

```tsx
// Move focus when content changes
function Dialog({ isOpen, onClose }: DialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  // Trap focus inside dialog when open
  return (
    <dialog open={isOpen}>
      <button ref={closeRef} onClick={onClose}>Close</button>
      {/* dialog content */}
    </dialog>
  );
}
```

### 有意义的空状态和错误状态

```tsx
// Don't show blank screens
function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div role="status" className="text-center py-12">
        <TasksEmptyIcon className="mx-auto h-12 w-12 text-muted" />
        <h3 className="mt-2 text-sm font-medium">No tasks</h3>
        <p className="mt-1 text-sm text-muted">Get started by creating a new task.</p>
        <Button className="mt-4" onClick={onCreateTask}>Create Task</Button>
      </div>
    );
  }

  return <ul role="list">...</ul>;
}
```

## 响应式设计

优先为移动设备设计，然后扩展：

```tsx
// Tailwind: mobile-first responsive
<div className="
  grid grid-cols-1      /* Mobile: single column */
  sm:grid-cols-2        /* Small: 2 columns */
  lg:grid-cols-3        /* Large: 3 columns */
  gap-4
">
```

在以下断点进行测试：320px、768px、1024px、1440px。

## 加载和过渡

```tsx
// Skeleton loading (not spinners for content)
function TaskListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}

// Optimistic updates for perceived speed
function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: Task[]) =>
        old.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
      );

      return { previous };
    },
    onError: (_err, _taskId, context) => {
      queryClient.setQueryData(['tasks'], context?.previous);
    },
  });
}
```

## 另请参阅

有关详细的无障碍要求和测试工具，请参阅 `../../references/accessibility-checklist.md`。

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “无障碍功能可有可无” | 在许多司法管辖区，无障碍是一项法律要求，也是一项工程质量标准。 |
| “我们以后再适配响应式设计” | 后期改造响应式设计的难度是从一开始就进行构建的 3 倍。 |
| “设计还没有定稿，所以我先跳过样式” | 使用设计系统的默认样式。无样式的 UI 会给评审者留下功能残缺的第一印象。 |
| “这只是一个原型” | 原型会变成生产代码。应正确构建基础。 |
| “目前这种 AI 风格也没问题” | 它传达的是低质量的信号。从一开始就使用项目实际采用的设计系统。 |

## 危险信号

- 组件超过 200 行（应进行拆分）
- 使用内联样式或任意像素值
- 缺少错误状态、加载状态或空状态
- 未进行键盘导航测试
- 仅使用颜色指示状态（仅用红色/绿色，不搭配文字或图标）
- 千篇一律的“AI 风格”（紫色渐变、超大卡片、模板化布局）

## 验证

构建 UI 后：

- [ ] 组件渲染时控制台无错误
- [ ] 所有交互元素均可通过键盘访问（使用 Tab 键遍历页面）
- [ ] 屏幕阅读器能够传达页面的内容和结构
- [ ] 响应式：在 320px、768px、1024px、1440px 下均可正常工作
- [ ] 加载、错误和空状态均已处理
- [ ] 遵循项目的设计系统（间距、颜色、字体排版）
- [ ] 开发者工具或 axe-core 中无无障碍警告