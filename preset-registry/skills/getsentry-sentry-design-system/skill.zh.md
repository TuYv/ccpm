---
name: design-system
description: Guide for using Sentry's layout and text primitives. Use when implementing UI components, layouts, or typography. Enforces use of core components over styled components.
---
# Sentry 中的布局与文本原语

## 核心原则

**始终使用 `@sentry/scraps` 中的核心组件，而不是使用 Emotion 创建样式化组件。**

核心组件可在整个代码库中提供一致的样式、响应式设计和更好的可维护性。

## 组件实现参考

有关受支持属性及其类型的完整列表，请参阅实现文件：

- **布局组件**：`/static/app/components/core/layout/`
  - `container.tsx` - 包含所有布局属性的基础容器
  - `flex.tsx` - Flex 布局原语
  - `grid.tsx` - Grid 布局原语
  - `stack.tsx` - Stack 布局原语（默认使用列方向的 Flex）
- **排版组件**：`/static/app/components/core/text/`
  - `text.tsx` - 文本原语
  - `heading.tsx` - 标题原语

## 布局原语

> **重要**：`Flex`、`Grid` 和 `Stack` 均扩展自 `Container`。这意味着 **Container 上可用的每个属性也都可用于 Flex、Grid 和 Stack**。使用 `<Flex>` 时，你将获得所有 Container 属性（定位、内边距、边框、溢出等），以及 Flex 特有的属性。Grid 和 Stack 同样如此。

### Container

支持所有常用布局属性的基础布局组件。Flex、Grid 和 Stack 扩展自 Container，并继承其所有属性。

**关键属性**（完整列表请参阅 `container.tsx`）：

- `position`："static" | "relative" | "absolute" | "fixed" | "sticky"
- `padding`、`paddingTop`、`paddingBottom`、`paddingLeft`、`paddingRight`：SpaceSize tokens
- `margin`、`marginTop` 等：SpaceSize tokens（已弃用，建议使用 gap）
- `width`、`height`、`minWidth`、`maxWidth`、`minHeight`、`maxHeight`
- `border`、`borderTop`、`borderBottom`、`borderLeft`、`borderRight`：BorderVariant tokens
- `radius`：RadiusSize tokens
- `overflow`、`overflowX`、`overflowY`："visible" | "hidden" | "scroll" | "auto"
- `background`：SurfaceVariant（"primary" | "secondary" | "tertiary"）
- `display`：各种 display 类型
- Flex 项目属性：`flex`、`flexGrow`、`flexShrink`、`flexBasis`、`alignSelf`、`order`
- Grid 项目属性：`area`、`row`、`column`

```tsx
import {Container} from '@sentry/scraps/layout';

// ❌ Don't create styled components
const Component = styled('div')`
  padding: ${p => p.theme.space.md};
  border: 1px solid ${p => p.theme.tokens.border.primary};
`;

// ✅ Use Container primitive
<Container padding="md" border="primary">
  Content
</Container>;
```

### Flex

使用 `<Flex>` 创建 Flex 布局。它扩展自 `Container`，继承所有 Container 属性以及 Flex 特有的属性。

**Flex 特有属性**（完整列表请参阅 `flex.tsx`）：

- `direction`："row" | "row-reverse" | "column" | "column-reverse"
- `align`："start" | "end" | "center" | "baseline" | "stretch"
- `justify`："start" | "end" | "center" | "between" | "around" | "evenly" | "left" | "right"
- `gap`：SpaceSize 或用于设置行间距/列间距的 `"${SpaceSize} ${SpaceSize}"`
- `wrap`："nowrap" | "wrap" | "wrap-reverse"
- `display`："flex" | "inline-flex" | "none"

**以及所有 Container 属性**：`position`、`padding`、`margin`、`width`、`height`、`border`、`radius`、`overflow`、`background`、flex/grid 子项属性等（参见上方的 Container 章节）。

```tsx
import {Flex} from '@sentry/scraps/layout';

// ❌ Don't create styled components
const Component = styled('div')`
  display: flex;
  flex-direction: column;
  position: relative;
`;

// ✅ Use Flex primitive with props
<Flex direction="column" position="relative" gap="md">
  <Child1 />
  <Child2 />
</Flex>;
```

### Grid

使用 `<Grid>` 实现网格布局。它扩展了 `Container`，继承所有 Container 属性以及网格特有的属性。

**Grid 特有属性**（完整列表请参见 `grid.tsx`）：

- `columns`：网格模板列（数字或 CSS 值）
- `rows`：网格模板行
- `areas`：命名网格区域
- `gap`：使用 SpaceSize 或 `"${SpaceSize} ${SpaceSize}"` 设置行/列间距
- `align`："start" | "end" | "center" | "baseline" | "stretch"（align-items）
- `alignContent`："start" | "end" | "center" | "between" | "around" | "evenly" | "stretch"
- `justify`："start" | "end" | "center" | "between" | "around" | "evenly" | "stretch"（justify-content）
- `justifyItems`："start" | "end" | "center" | "stretch"
- `flow`："row" | "column" | "row dense" | "column dense"
- `autoColumns`、`autoRows`：自动生成的轨道尺寸

**以及所有 Container 属性**：`position`、`padding`、`margin`、`width`、`height`、`border`、`radius`、`overflow`、`background`、flex/grid 子项属性等（参见上方的 Container 章节）。

```tsx
import {Grid} from '@sentry/scraps/layout';

// ❌ Don't create styled components
const Component = styled('div')`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${p => p.theme.space.md};
`;

// ✅ Use Grid primitive
<Grid columns="repeat(3, 1fr)" gap="md">
  <Item1 />
  <Item2 />
  <Item3 />
</Grid>;
```

### Stack

使用 `<Stack>` 实现垂直布局。Stack 本质上是默认设置了 `direction="column"` 的 `Flex`。它还提供了 `Stack.Separator`，用于在各项之间添加分隔符。

**属性**（完整列表请参见 `stack.tsx`）：

- 与 Flex 属性相同（继承所有 Flex 和 Container 属性）
- `direction` 默认为 "column"（但可以覆盖）
- `Stack.Separator` 组件用于在堆栈项之间添加分隔线

```tsx
import {Stack} from '@sentry/scraps/layout';

// ❌ Don't create styled components for vertical layouts
const Component = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${p => p.theme.space.md};
`;

// ✅ Use Stack primitive (automatically column direction)
<Stack gap="md">
  <Item1 />
  <Item2 />
  <Item3 />
</Stack>;

// ✅ With separators between items
<Stack gap="md">
  <Item1 />
  <Stack.Separator />
  <Item2 />
  <Stack.Separator />
  <Item3 />
</Stack>;

// ✅ Stack supports all Flex and Container props
<Stack gap="md" padding="lg" position="relative" border="primary">
  <Item1 />
  <Item2 />
</Stack>;
```

## 排版原语

### Text

对所有文本内容使用 `<Text>`。绝不要使用带文本样式的原始 `<p>`、`<span>` 或 `<div>` 元素。

**关键属性**（完整列表见 `text.tsx`）：

- `as`："span" | "p" | "label" | "div"（语义化 HTML 元素）
- `size`：TextSize（"xs" | "sm" | "md" | "lg" | "xl" | "2xl"）
- `variant`：ContentVariant | "muted"（参见下方的内容变体令牌）
- `align`："left" | "center" | "right" | "justify"
- `bold`：布尔值
- `italic`：布尔值
- `uppercase`：布尔值
- `monospace`：布尔值
- `tabular`：布尔值（等宽数字）
- `ellipsis`：布尔值（截断并显示省略号）
- `wrap`："nowrap" | "normal" | "pre" | "pre-line" | "pre-wrap"
- `textWrap`："wrap" | "nowrap" | "balance" | "pretty" | "stable"
- `wordBreak`："normal" | "break-all" | "keep-all" | "break-word"
- `density`："compressed" | "comfortable"（行高）
- `underline`：boolean | "dotted"
- `strikethrough`：布尔值

```tsx
import {Text} from '@sentry/scraps/text';

// ❌ Don't create styled text components
const Label = styled('span')`
  color: ${p => p.theme.tokens.content.secondary};
  font-size: ${p => p.theme.font.size.sm};
`;

// ❌ Don't use raw elements
<p>This is a paragraph</p>
<span>Status: Active</span>

// ✅ Use Text primitive with semantic 'as' prop
<Text as="p" variant="muted" density="comfortable">
  This is a paragraph
</Text>
<Text as="span" bold uppercase>
  Status: Active
</Text>
```

### 标题

所有标题都应使用 `<Heading>`。切勿使用原始的 `<h1>`、`<h2>` 等元素。

**关键属性**（完整列表见 `heading.tsx`）：

- `as`："h1" | "h2" | "h3" | "h4" | "h5" | "h6"（必填）
- `size`：HeadingSize（"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"）
- `variant`：与 Text 相同
- `align`：与 Text 相同
- `italic`、`monospace`、`tabular`：与 Text 相同
- `ellipsis`、`wrap`、`textWrap`、`wordBreak`：与 Text 相同
- `density`：与 Text 相同
- `underline`、`strikethrough`：与 Text 相同

注意：Heading 不支持 `bold` 和 `uppercase`（标题始终为粗体）。

```tsx
import {Heading} from '@sentry/scraps/text';

// ❌ Don't style heading elements
const Title = styled('h2')`
  font-size: ${p => p.theme.font.size.md};
  font-weight: bold;
`;

// ❌ Don't use raw heading elements
<h2>My Title</h2>

// ✅ Use Heading primitive with semantic 'as' prop
<Heading as="h2">My Title</Heading>

// ✅ With custom size
<Heading as="h3" size="xl">Large H3</Heading>
```

## 信息组件

> **重要提示**：应始终优先使用 `InfoTip` 和 `InfoText`，而不是使用原始的 `<Tooltip>` 组件。它们为上下文帮助提供了一致且无障碍的模式。

### InfoTip

使用 `<InfoTip>` 在标签或标题旁添加带有工具提示的信息图标。它支持键盘访问，并为补充性帮助提供了一致的模式。

```tsx
import {InfoTip} from '@sentry/scraps/info';
import {Flex} from '@sentry/scraps/layout';
import {Text} from '@sentry/scraps/text';

// ❌ Don't use Tooltip with arbitrary icons
<Flex gap="xs" align="center">
  <Text>Retention Period</Text>
  <Tooltip title="The number of days...">
    <IconInfo size="xs" />
  </Tooltip>
</Flex>

// ✅ Use InfoTip for contextual help icons
<Flex gap="xs" align="center">
  <Text>Retention Period</Text>
  <InfoTip title="The number of days event data is stored before being automatically deleted." />
</Flex>
```

**关键属性**：

- `title`：工具提示内容（必填）
- `size`："xs" | "sm"（默认）| "md"

**适用场景**：

- 为标题或章节标题添加上下文
- 在不使用行内文本的情况下显示补充信息
- 解释设置或配置选项

### InfoText

使用 `<InfoText>` 为行内文本添加工具提示。它会渲染带有点状下划线的文本，并在悬停或聚焦时显示工具提示。

```tsx
import {InfoText} from '@sentry/scraps/info';

// ❌ Don't wrap text with raw Tooltip
<Tooltip title="Time to First Byte measures the time...">
  <span style={{textDecoration: 'underline dotted'}}>TTFB</span>
</Tooltip>

// ✅ Use InfoText for inline explanations
<InfoText title="Time to First Byte measures the time from the request start until the first byte of the response is received.">
  TTFB
</InfoText>
```

**关键属性**：

- `title`：工具提示内容（必填）
- 扩展自 `Text`，因此支持所有 Text 属性：`size`、`variant`、`bold` 等。

```tsx
// With Text styling props
<InfoText title="Small muted text" size="sm" variant="muted">
  Hint text
</InfoText>
<InfoText title="Bold text" bold>
  Important term
</InfoText>
```

**适用场景**：

- 在行内定义技术术语或缩略词
- 在不增加视觉干扰的情况下提供额外上下文
- 创建一致且无障碍的行内帮助模式

## 创建轻量抽象

> **⚠️ 重要：当目的是通过 DRY（不要重复自己）来复用重复属性时，在基于布局原语（`Container`、`Flex`、`Grid`、`Stack`、`Text`、`Heading`）创建抽象之前，务必先提示用户进行确认。**

你可以基于原语创建轻量抽象，通过使用有意义的名称（例如 `TableCell`，而不是通用的 `Flex`）来改善语义结构，并提供一些默认属性。务必谨慎使用这种方式，并且只有在它确实能提高可读性时才这样做。例如，如果重复属性只出现了两次，并且它们彼此相邻，那么抽象所带来的代价会超过其简洁性收益。

**创建抽象之前，你必须：**

1. 请求用户确认
2. 说明你计划创建什么抽象
3. 解释为什么该抽象值得引入额外的复杂性
4. 等待用户明确批准后再继续

```tsx
import {Flex, type FlexProps} from '@sentry/scraps/layout';

// ❌ Don't repeat the same props everywhere
<Flex align="center" gap="xs" flex="1" padding="sm">Content 1</Flex>
<Flex align="center" gap="xs" flex="1" padding="sm">Content 2</Flex>
<Flex align="center" gap="xs" flex="1" padding="sm">Content 3</Flex>
<Flex align="center" gap="xs" flex="1" padding="sm">Content 4</Flex>

// ✅ Create a thin wrapper with default props (AFTER USER CONFIRMATION)
function TableCell(props: FlexProps) {
  return <Flex align="center" gap="md" {...props} />;
}

<TableCell>Content 1</TableCell>
<TableCell>Content 2</TableCell>
<TableCell align="start">Content 3</TableCell>{/* Can override defaults */}
```

**要点：**

- **在创建抽象之前，始终先提示用户确认**
- 扩展基础组件的 props 类型（`extends FlexProps`）
- 在 JSX 组件上设置默认值，并展开 `{...props}` 以允许覆盖这些默认值
- 不要使用 styled components——应改为组合基础组件

## 通用准则

### 1. 使用响应式 Props

大多数 props 都支持使用断点键的响应式语法。

```tsx
// ❌ Don't use styled media queries
const Component = styled('div')`
  display: flex;
  flex-direction: column;

  @media screen and (min-width: ${p => p.theme.breakpoints.md}) {
    flex-direction: row;
  }
`;

// ✅ Use responsive prop signature. `screen:` keys match the viewport, like the
// @media query above.
<Flex direction={{'screen:xs': 'column', 'screen:md': 'row'}}>
```

响应式 prop 键分为两种形式，并且可以在同一个 prop 上组合使用：

- **无前缀键**（`{xs: …}`）根据最近的**查询容器**进行解析——
  默认使用容器查询，因此不需要前缀。
- **带有 `screen:` 前缀的键**（`{'screen:md': …}`）根据
  **视口**进行解析。

如需响应组件的可用空间，请使用 `containerType="inline-size"` 将父元素声明为查询容器，并在子元素上使用无前缀键（元素永远无法查询自身尺寸，因此容器必须是其祖先元素）。

```tsx
// ✅ Reflow based on the parent's width, not the viewport's
<Container containerType="inline-size">
  <Flex direction={{'2xs': 'column', md: 'row'}}>{/* ... */}</Flex>
</Container>
```

当需要在 JS 中获取解析后的断点时，请使用 `useContainerBreakpoint(ref)`（它由 `ResizeObserver` 驱动、作用域限定于容器，用于替代基于宽度的 `useMedia`）。

### 2. 优先使用 Gap/Padding，而非 Margin

Container 支持 `margin` props，但它们已被弃用。请改用父容器上的 `gap`。

```tsx
// ❌ Don't use margin between children
const Child = styled('div')`
  margin-right: ${p => p.theme.space.lg};
`;

// ✅ Use gap on parent container
<Flex gap="lg">
  <Child1 />
  <Child2 />
</Flex>;
```

### 3. 将布局与排版分离

不要在单个 styled component 中将布局与排版耦合在一起。请使用独立的基础组件。

```tsx
// ❌ Don't couple layout and typography
const Component = styled('div')`
  display: flex;
  flex-direction: column;
  color: ${p => p.theme.tokens.content.secondary};
  font-size: ${p => p.theme.font.size.lg};
`;

// ✅ Split into layout and typography primitives
<Flex direction="column">
  <Text variant="muted" size="lg">
    Content
  </Text>
</Flex>;
```

### 4. 查看实现文件以了解所有 Props

实现文件包含完整且最新的受支持 props 列表及其 TypeScript 类型。如有疑问：

- 阅读 `/static/app/components/core/layout/container.tsx` 以了解基础布局 props
- 阅读 `/static/app/components/core/layout/flex.tsx` 以了解 Flex 特有的 props
- 阅读 `/static/app/components/core/layout/grid.tsx` 以了解 Grid 特有的 props
- 阅读 `/static/app/components/core/layout/stack.tsx` 以了解 Stack 特有的 props
- 阅读 `/static/app/components/core/text/text.tsx` 以了解 Text props
- 阅读 `/static/app/components/core/text/heading.tsx` 以了解 Heading props

## Token 参考

### 间距 Token（SpaceSize）

将这些值用于 `gap`、`padding`：

- `"0"`、`"2xs"`、`"xs"`、`"sm"`、`"md"`、`"lg"`、`"xl"`、`"2xl"`、`"3xl"`
- 多个值：`"md lg"`（垂直 水平）
- 响应式：`{{xs: "sm", md: "lg"}}`

### 边框 Token（BorderVariant）

将这些值用于 `border` 属性：

- `"primary"`、`"muted"`、`"accent"`、`"danger"`、`"promotion"`、`"success"`、`"warning"`

### 圆角 Token（RadiusSize）

将这些值用于 `radius` 属性：

- `"0"`、`"2xs"`、`"xs"`、`"sm"`、`"md"`、`"lg"`、`"xl"`、`"2xl"`、`"full"`

### 文本尺寸 Token

- **TextSize**："xs" | "sm" | "md" | "lg" | "xl" | "2xl"
- **HeadingSize**："xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"

### 表面变体 Token（SurfaceVariant）

将这些值用于布局组件的 `background` 属性：

- `"primary"`、`"secondary"`、`"tertiary"`

### 内容变体 Token（ContentVariant）

将这些值用于 Text 和 Heading 的 `variant` 属性：

- **ContentVariant**："primary" | "secondary" | "accent" | "danger" | "promotion" | "success" | "warning"
- **加上 "muted"**：除 ContentVariant 值外，Text 和 Heading 还接受 "muted"

## 快速参考检查清单

创建带样式的组件之前，请确认：

- ✅ 我可以使用 `<Flex>`、`<Grid>` 或 `<Stack>` 进行布局吗？
- ✅ 对于采用默认列方向的垂直布局，我可以使用 `<Stack>` 吗？
- ✅ 我可以使用 `<Container>` 实现边框、内边距和定位吗？
- ✅ 我可以使用 `<Text>` 或 `<Heading>` 实现排版吗？
- ✅ 我可以使用 `<InfoTip>` 或 `<InfoText>` 代替 `<Tooltip>` 吗？
- ✅ 我可以使用响应式属性代替媒体查询吗？
- ✅ 我可以使用 `gap` 代替外边距吗？
- ✅ 该基础组件是否支持我需要的属性？（请检查实现文件）

如果以上任一问题的答案为是，**请改用该基础组件**。

## 其他核心组件

### 头像

使用来自 `static/app/components/core/avatar` 的核心头像组件（`<UserAvatar/>`、`<TeamAvatar/>`、`<ProjectAvatar/>`、`<OrganizationAvatar/>`、`<SentryAppAvatar/>`、`<DocIntegrationAvatar/>`）。对于头像列表，请使用 `<AvatarList>`。

```tsx
// ✅ Use Avatar component and useUser
import {UserAvatar} from '@sentry/scraps/avatar';
import {useUser} from 'sentry/utils/useUser';

<UserAvatar user={user}>

// ❌ Do not use raw intrinsic elements or static paths
function Component() {
  return (
    <img
      src="/path/to/image.jpg"
      style={{
        border,
        width: 20,
        height: 20,
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'inline-block',
      }}
    />
  );
}
```

### 披露

使用核心披露组件，而不是自行构建。

```tsx
// ✅ Use Disclosure component
<Disclosure>
  <Disclosure.Title>Title</Disclosure.Title>
  <Disclosure.Content>Content that is toggled based on expanded state</Disclosure.Content>
</Disclosure>;

// ❌ Do not reimplement disclosure pattern manually
function Component() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        icon={<IconChevron direction={isExpanded ? 'down' : 'right'} />}
      >
        Title
      </Button>
      {isExpanded && (
        <Container>Content that is toggled based on expanded state</Container>
      )}
    </div>
  );
}
```

### 图片和图标

将所有图标放在 `static/app/icons` 文件夹中。切勿内联 SVG，也不要将其添加到任何其他文件夹。使用 svgo 或 svgomg 优化 SVG。

```tsx
// ❌ Never inline SVGs
function Component(){
  return (
    <Button icon={
      <svg viewbox="0 0 16 16>"}>
        // ❌ paths have excessive precision, optimize them with SVGO
        <circle cx="8.00134" cy="8.4314" r="5.751412" />
        <circle cx="8.00134" cy="8.4314" r="12.751412" />
        <line x1="8.41334" y1="5.255361" x2="8" y2="8.255421" />
      </svg>
    </Button>
  )
}

// ❌ Never place SVGs outside of icons folder.
import {CustomIcon} from "./customIcon"

// ✅ Import icon from our icon set
import {IconExclamation} from "sentry/icons"
```

所有图片都应放在 `static/app/images` 中，并且必须通过 webpack loader（即 `sentry-images` 别名）导入，绝不能通过静态路径引用。

```tsx
// ✅ Images are imported from sentry-images alias
import image from 'sentry-images/example.png';

function Component() {
  return <Image src={image} />;
}

// ❌ All images need to be imported using the webpack loader!
function Component() {
  return <Image src="/path/to/image.png" />;
}
```