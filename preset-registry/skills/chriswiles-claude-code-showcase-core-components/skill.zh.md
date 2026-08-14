---
name: core-components
description: Core component library and design system patterns. Use when building UI, using design tokens, or working with the component library.
---
# 核心组件

## 设计系统概览

请使用核心库中的组件，而不是原始平台组件。这可确保样式和行为保持一致。

## 设计令牌

**绝不要硬编码值。始终使用设计令牌。**

### 间距令牌

```tsx
// CORRECT - Use tokens
<Box padding="$4" marginBottom="$2" />

// WRONG - Hard-coded values
<Box padding={16} marginBottom={8} />
```

| 令牌 | 值 |
|-------|-------|
| `$1` | 4px |
| `$2` | 8px |
| `$3` | 12px |
| `$4` | 16px |
| `$6` | 24px |
| `$8` | 32px |

### 颜色令牌

```tsx
// CORRECT - Semantic tokens
<Text color="$textPrimary" />
<Box backgroundColor="$backgroundSecondary" />

// WRONG - Hard-coded colors
<Text color="#333333" />
<Box backgroundColor="rgb(245, 245, 245)" />
```

| 语义令牌 | 用途 |
|----------------|---------|
| `$textPrimary` | 主要文本 |
| `$textSecondary` | 辅助文本 |
| `$textTertiary` | 禁用状态/提示文本 |
| `$primary500` | 品牌色/强调色 |
| `$statusError` | 错误状态 |
| `$statusSuccess` | 成功状态 |

### 排版令牌

```tsx
<Text fontSize="$lg" fontWeight="$semibold" />
```

| 令牌 | 大小 |
|-------|------|
| `$xs` | 12px |
| `$sm` | 14px |
| `$md` | 16px |
| `$lg` | 18px |
| `$xl` | 20px |
| `$2xl` | 24px |

## 核心组件

### Box

支持令牌的基础布局组件：

```tsx
<Box
  padding="$4"
  backgroundColor="$backgroundPrimary"
  borderRadius="$lg"
>
  {children}
</Box>
```

### HStack / VStack

水平和垂直 Flex 布局：

```tsx
<HStack gap="$3" alignItems="center">
  <Icon name="user" />
  <Text>Username</Text>
</HStack>

<VStack gap="$4" padding="$4">
  <Heading>Title</Heading>
  <Text>Content</Text>
</VStack>
```

### Text

支持令牌的排版组件：

```tsx
<Text
  fontSize="$lg"
  fontWeight="$semibold"
  color="$textPrimary"
>
  Hello World
</Text>
```

### Button

具有多种变体的交互式按钮：

```tsx
<Button
  onPress={handlePress}
  variant="solid"
  size="md"
  isLoading={loading}
  isDisabled={disabled}
>
  Click Me
</Button>
```

| 变体 | 用途 |
|---------|---------|
| `solid` | 主要操作 |
| `outline` | 次要操作 |
| `ghost` | 第三级/弱化操作 |
| `link` | 行内操作 |

### Input

支持验证的表单输入组件：

```tsx
<Input
  value={value}
  onChangeText={setValue}
  placeholder="Enter text"
  error={touched ? errors.field : undefined}
  label="Field Name"
/>
```

### Card

内容容器：

```tsx
<Card padding="$4" gap="$3">
  <CardHeader>
    <Heading size="sm">Card Title</Heading>
  </CardHeader>
  <CardBody>
    <Text>Card content</Text>
  </CardBody>
</Card>
```

## 布局模式

### 屏幕布局

```tsx
const MyScreen = () => (
  <Screen>
    <ScreenHeader title="Page Title" />
    <ScreenContent padding="$4">
      {/* Content */}
    </ScreenContent>
  </Screen>
);
```

### 表单布局

```tsx
<VStack gap="$4" padding="$4">
  <Input label="Name" {...nameProps} />
  <Input label="Email" {...emailProps} />
  <Button isLoading={loading}>Submit</Button>
</VStack>
```

### 列表项布局

```tsx
<HStack
  padding="$4"
  gap="$3"
  alignItems="center"
  borderBottomWidth={1}
  borderColor="$borderLight"
>
  <Avatar source={{ uri: imageUrl }} size="md" />
  <VStack flex={1}>
    <Text fontWeight="$semibold">{title}</Text>
    <Text color="$textSecondary" fontSize="$sm">{subtitle}</Text>
  </VStack>
  <Icon name="chevron-right" color="$textTertiary" />
</HStack>
```

## 反模式

```tsx
// WRONG - Hard-coded values
<View style={{ padding: 16, backgroundColor: '#fff' }}>

// CORRECT - Design tokens
<Box padding="$4" backgroundColor="$backgroundPrimary">


// WRONG - Raw platform components
import { View, Text } from 'react-native';

// CORRECT - Core components
import { Box, Text } from 'components/core';


// WRONG - Inline styles
<Text style={{ fontSize: 18, fontWeight: '600' }}>

// CORRECT - Token props
<Text fontSize="$lg" fontWeight="$semibold">
```

## 组件 Props 模式

创建组件时，请使用基于 token 的 props：

```tsx
interface CardProps {
  padding?: '$2' | '$4' | '$6';
  variant?: 'elevated' | 'outlined' | 'filled';
  children: React.ReactNode;
}

const Card = ({ padding = '$4', variant = 'elevated', children }: CardProps) => (
  <Box
    padding={padding}
    backgroundColor="$backgroundPrimary"
    borderRadius="$lg"
    {...variantStyles[variant]}
  >
    {children}
  </Box>
);
```

## 与其他 Skill 的集成

- **react-ui-patterns**：为 UI 状态使用核心组件
- **testing-patterns**：在测试中模拟核心组件
- **storybook**：记录组件变体