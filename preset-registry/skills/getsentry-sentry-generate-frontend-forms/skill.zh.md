---
name: generate-frontend-forms
description: Guide for creating forms using Sentry's new form system. Use when implementing forms, form fields, validation, or auto-save functionality.
---
# 表单系统指南

此 Skill 提供了使用 Sentry 基于 TanStack React Form 和 Zod 验证构建的新表单系统来创建表单的模式。

## 核心原则

- 对于新表单，始终使用新的表单系统（`useScrapsForm`、`AutoSaveForm`）。切勿使用旧版 JsonForm 或基于 Reflux 的系统创建新表单。

- 所有表单都应基于 schema。请勿创建不包含 schema 验证的表单。

## 导入

所有表单组件均从 `@sentry/scraps/form` 导出：

```tsx
import {z} from 'zod';

import {
  AutoSaveForm,
  defaultFormOptions,
  setFieldErrors,
  useScrapsForm,
} from '@sentry/scraps/form';
```

> **重要**：请勿从更深层的路径导入，例如 '@sentry/scraps/form/field'。你只能使用 @sentry/scraps/form 的 index 文件中属于 PUBLIC 接口的内容。

---

## 表单 Hook：`useScrapsForm`

用于创建具备验证和提交处理功能的表单的主要 Hook。

### 基本用法

```tsx
import {z} from 'zod';

import {defaultFormOptions, useScrapsForm} from '@sentry/scraps/form';

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

function MyForm() {
  const form = useScrapsForm({
    ...defaultFormOptions,
    defaultValues: {
      email: '',
      name: '',
    },
    validators: {
      onDynamic: schema,
    },
    onSubmit: ({value, formApi}) => {
      // Handle submission
      console.log(value);
    },
  });

  return (
    <form.AppForm form={form}>
      <form.AppField name="email">
        {field => (
          <field.Layout.Stack label="Email" required>
            <field.Input value={field.state.value} onChange={field.handleChange} />
          </field.Layout.Stack>
        )}
      </form.AppField>

      <form.SubmitButton>Submit</form.SubmitButton>
    </form.AppForm>
  );
}
```

> **重要**：始终首先展开 `defaultFormOptions`。它会将验证配置为最初在提交时运行，并在首次提交后于每次更改时运行。这就是将验证器定义为 `onDynamic` 的原因，也是它能够提供一致用户体验的原因。

### 返回的属性

| 属性             | 描述                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `AppForm`        | 根包装器组件（提供表单上下文并渲染 `<form>` 元素）。必须接收 `form={form}` prop。                     |
| `AppField`       | 字段渲染器组件                                                                                        |
| `FieldGroup`     | 带标题的分区分组                                                                                      |
| `SubmitButton`   | 预先连接好的提交按钮                                                                                  |
| `Subscribe`      | 订阅表单状态变化                                                                                      |
| `reset()`        | 将表单重置为默认值                                                                                    |
| `handleSubmit()` | 手动触发提交                                                                                          |

---

## 字段组件

所有字段都通过 `field` render prop 访问，并遵循一致的模式。

### 输入字段（文本）

```tsx
<form.AppField name="firstName">
  {field => (
    <field.Layout.Stack label="First Name" required>
      <field.Input
        value={field.state.value}
        onChange={field.handleChange}
        placeholder="Enter your name"
      />
    </field.Layout.Stack>
  )}
</form.AppField>
```

### 数字字段

```tsx
<form.AppField name="age">
  {field => (
    <field.Layout.Stack label="Age" required>
      <field.Number
        value={field.state.value}
        onChange={field.handleChange}
        min={0}
        max={120}
        step={1}
      />
    </field.Layout.Stack>
  )}
</form.AppField>
```

### 选择字段（单选）

```tsx
<form.AppField name="country">
  {field => (
    <field.Layout.Stack label="Country">
      <field.Select
        value={field.state.value}
        onChange={field.handleChange}
        options={[
          {value: 'us', label: 'United States'},
          {value: 'uk', label: 'United Kingdom'},
        ]}
      />
    </field.Layout.Stack>
  )}
</form.AppField>
```

### 选择字段（多选）

```tsx
<form.AppField name="tags">
  {field => (
    <field.Layout.Stack label="Tags">
      <field.Select
        multiple
        value={field.state.value}
        onChange={field.handleChange}
        options={[
          {value: 'bug', label: 'Bug'},
          {value: 'feature', label: 'Feature'},
        ]}
        clearable
      />
    </field.Layout.Stack>
  )}
</form.AppField>
```

### 开关字段（布尔值）

```tsx
<form.AppField name="notifications">
  {field => (
    <field.Layout.Stack label="Enable notifications">
      <field.Switch checked={field.state.value} onChange={field.handleChange} />
    </field.Layout.Stack>
  )}
</form.AppField>
```

### 文本区域字段

```tsx
<form.AppField name="bio">
  {field => (
    <field.Layout.Stack label="Bio">
      <field.TextArea
        value={field.state.value}
        onChange={field.handleChange}
        rows={4}
        placeholder="Tell us about yourself"
      />
    </field.Layout.Stack>
  )}
</form.AppField>
```

### 范围字段（滑块）

```tsx
<form.AppField name="volume">
  {field => (
    <field.Layout.Stack label="Volume">
      <field.Range
        value={field.state.value}
        onChange={field.handleChange}
        min={0}
        max={100}
        step={10}
      />
    </field.Layout.Stack>
  )}
</form.AppField>
```

### 单选按钮字段

单选按钮字段使用由 `Radio.Group` 和 `Radio.Item` 组成的可组合 API。`Radio.Group` 提供组上下文，该上下文会更改标签的渲染方式，以实现正确的无障碍语义。

> **重要**：布局（及其标签）**必须**渲染在 `Radio.Group` _内部_。组上下文由 `Radio.Group` 提供，因此将布局放在外部会导致错误的无障碍语义。

```tsx
<form.AppField name="priority">
  {field => (
    <field.Radio.Group value={field.state.value} onChange={field.handleChange}>
      <field.Layout.Stack label="Priority">
        <field.Radio.Item value="low">Low</field.Radio.Item>
        <field.Radio.Item value="medium">Medium</field.Radio.Item>
        <field.Radio.Item value="high" description="Urgent issues">
          High
        </field.Radio.Item>
      </field.Layout.Stack>
    </field.Radio.Group>
  )}
</form.AppField>
```

若要水平排列单选项，请在布局内部使用 `Flex` 或 `Stack` 包装器：

```tsx
import {Flex} from '@sentry/scraps/layout';

<field.Radio.Group value={field.state.value} onChange={field.handleChange}>
  <field.Layout.Row label="Priority">
    <Flex gap="lg">
      <field.Radio.Item value="low">Low</field.Radio.Item>
      <field.Radio.Item value="high">High</field.Radio.Item>
    </Flex>
  </field.Layout.Row>
</field.Radio.Group>;
```

### 使用 BaseField 创建自定义字段

对于没有内置组件的一次性字段（例如颜色选择器或任何自定义输入控件），请使用 `field.Base`。它提供一个渲染属性，其中包含所有必要的无障碍和表单集成属性（`ref`、`disabled`、`aria-invalid`、`aria-describedby`、`onBlur`、`name`、`id`），你可以将这些属性展开到原生元素上。

```tsx
<form.AppField name="color">
  {field => (
    <field.Layout.Row label="Brand Color">
      <field.Base<HTMLInputElement>>
        {(baseProps, {indicator}) => (
          <Flex flexGrow={1}>
            <input
              {...baseProps}
              type="color"
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
            />
            {indicator}
          </Flex>
        )}
      </field.Base>
    </field.Layout.Row>
  )}
</form.AppField>
```

该渲染属性接收两个参数：

1. **`baseProps`** — 无障碍和表单集成属性（`ref`、`disabled`、`aria-invalid`、`aria-describedby`、`onBlur`、`name`、`id`），用于展开到你的元素上
2. **`{indicator}`** — 以 React 节点形式提供的自动保存状态指示器（旋转图标/勾选标记），你可以将其放置在自定义布局中任何合适的位置

元素类型会根据传入的 `ref` 推断，因此如果未传入 `ref`，就必须使用 `<field.Base<HTMLInputElement>>` 手动进行类型标注。

`field.Base` 会自动处理：

- 合并 ref（用于滚动到哈希位置和外部 ref 转发）
- 自动保存待完成时禁用字段
- 根据验证状态设置 `aria-invalid`
- 通过 `aria-describedby` 关联提示文本

请使用 `field.Base`，而不是构建重复实现这些逻辑的自定义包装器。它适用于任何接受标准属性的原生 HTML 元素或第三方组件。

---

## 布局

有两种布局选项可用于定位标签和字段。

### 堆叠布局（垂直）

标签在上，字段在下。最适合标签较长的表单或移动端布局。

```tsx
<field.Layout.Stack
  label="Email Address"
  hintText="We'll never share your email"
  required
>
  <field.Input value={field.state.value} onChange={field.handleChange} />
</field.Layout.Stack>
```

### 行布局（水平）

标签位于左侧（约占 50%），字段位于右侧。适用于设置页面的紧凑布局。

```tsx
<field.Layout.Row label="Email Address" hintText="We'll never share your email" required>
  <field.Input value={field.state.value} onChange={field.handleChange} />
</field.Layout.Row>
```

### 紧凑变体

Stack 和 Row 布局都支持 `variant="compact"` 属性。在紧凑模式下，提示文本会作为标签上的工具提示显示，而不是显示在标签下方。这样既能节省垂直空间，又能提供提示信息。

```tsx
// Default: hint text appears below the label
<field.Layout.Row label="Email" hintText="We'll never share your email">
  <field.Input ... />
</field.Layout.Row>

// Compact: hint text appears in tooltip when hovering the label
<field.Layout.Row label="Email" hintText="We'll never share your email" variant="compact">
  <field.Input ... />
</field.Layout.Row>

// Also works with Stack layout
<field.Layout.Stack label="Email" hintText="We'll never share your email" variant="compact">
  <field.Input ... />
</field.Layout.Stack>
```

**何时使用紧凑模式**：

- 包含大量字段且垂直空间有限的设置页面
- 提示文本属于补充信息而非必要信息的表单
- 高度受限的仪表板或面板

### 自定义布局

如有必要，你可以创建新布局，也可以完全不使用任何布局。如果不使用布局，出于无障碍考虑，你_应该_渲染 `field.meta.Label`，并可选择渲染 `field.meta.HintText`。

```tsx
<form.AppField name="firstName">
  {field => (
    <Flex gap="md">
      <field.Meta.Label required>First Name:</field.Meta.Label>
      <field.Input value={field.state.value ?? ''} onChange={field.handleChange} />
    </Flex>
  )}
</form.AppField>
```

### 布局属性

| 属性       | 类型        | 描述                                                   |
| ---------- | ----------- | ------------------------------------------------------------- |
| `label`    | `string`    | 字段标签文本                                              |
| `hintText` | `string`    | 辅助文本（默认显示在标签下方，紧凑模式下显示为工具提示） |
| `required` | `boolean`   | 显示必填指示符                                      |
| `variant`  | `"compact"` | 将提示文本显示在工具提示中，而不是标签下方             |

---

## 字段组

将相关字段分组到带标题的分区中。

```tsx
<form.FieldGroup title="Personal Information">
  <form.AppField name="firstName">{/* ... */}</form.AppField>
  <form.AppField name="lastName">{/* ... */}</form.AppField>
</form.FieldGroup>

<form.FieldGroup title="Contact Information">
  <form.AppField name="email">{/* ... */}</form.AppField>
  <form.AppField name="phone">{/* ... */}</form.AppField>
</form.FieldGroup>
```

---

## 禁用状态

字段接受布尔值或字符串形式的 `disabled`。当提供字符串时，该字符串会显示为工具提示，用于解释字段被禁用的原因。

```tsx
// ❌ Don't disable without explanation
<field.Input disabled value={field.state.value} onChange={field.handleChange} />

// ✅ Provide a reason when disabling
<field.Input
  disabled="This feature requires a Business plan"
  value={field.state.value}
  onChange={field.handleChange}
/>
```

---

## 使用 Zod 进行验证

### Schema 定义

```tsx
import {z} from 'zod';

const userSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().gte(13, 'You must be at least 13 years old'),
  bio: z.string().optional(),
  tags: z.array(z.string()).optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
  }),
});
```

### 使用 Refine 处理可空字段

当字段的初始值为 `null` 时（例如，一个尚未进行初始选择的必填选择框），请在 schema 中使用 `.nullable().refine()`。这会使 schema 的*输入*类型（接受 `null`）与其*输出*类型（不接受 `null`）之间产生差异。要正确处理这种情况：

1. 将 `defaultValues` 显式声明为 `z.input<typeof schema>` 类型——这样便允许将 `null` 作为初始值。
2. 在 `onSubmit` 中调用 `schema.parse(value)`，将类型从 `z.input` 收窄为 `z.output`，在传递给 mutation 之前去除 `null`。

```tsx
const schema = z.object({
  provider: z
    .enum(['GitHub', 'LaunchDarkly'])
    .nullable()
    .refine(v => v !== null, 'Provider is required'),
  name: z.string().min(1, 'Name is required'),
});

// z.input allows null for the provider field
const defaultValues: z.input<typeof schema> = {
  provider: null,
  name: '',
};

// z.output<typeof schema> has provider as non-null after refine
type FormOutput = z.output<typeof schema>;

const form = useScrapsForm({
  ...defaultFormOptions,
  defaultValues,
  validators: {onDynamic: schema},
  onSubmit: ({value}) => {
    // schema.parse narrows null away — mutation receives z.output
    return mutation.mutateAsync(schema.parse(value)).catch(() => {});
  },
});
```

> **重要**：请勿使用非空断言（`value.provider!`）或类型转换来绕过可空字段问题。使用 `schema.parse()` 的方法既能保证类型安全，也能在运行时进行验证。

### 条件验证

使用 `.refine()` 进行跨字段验证：

```tsx
const schema = z
  .object({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
```

### 条件字段

使用 `form.Subscribe` 根据其他字段的值显示或隐藏字段：

```tsx
<form.Subscribe selector={state => state.values.plan === 'enterprise'}>
  {showBilling =>
    showBilling ? (
      <form.AppField name="billingEmail">
        {field => (
          <field.Layout.Stack label="Billing Email" required>
            <field.Input value={field.state.value} onChange={field.handleChange} />
          </field.Layout.Stack>
        )}
      </form.AppField>
    ) : null
  }
</form.Subscribe>
```

---

## 错误处理

### 服务端错误

使用 `setFieldErrors` 显示后端验证错误：

```tsx
import {useMutation} from '@tanstack/react-query';

import {setFieldErrors} from '@sentry/scraps/form';

import {fetchMutation} from 'sentry/utils/queryClient';

function MyForm() {
  const mutation = useMutation({
    mutationFn: (data: {email: string; username: string}) => {
      return fetchMutation({
        url: '/users/',
        method: 'POST',
        data,
      });
    },
  });

  const form = useScrapsForm({
    ...defaultFormOptions,
    defaultValues: {email: '', username: ''},
    validators: {onDynamic: schema},
    onSubmit: async ({value, formApi}) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        // Set field-specific errors from backend
        setFieldErrors(formApi, {
          email: {message: 'This email is already registered'},
          username: {message: 'Username is taken'},
        });
      }
    },
  });

  // ...
}
```

> **重要**：`setFieldErrors` 支持使用点号表示法指定嵌套路径：`'address.city': {message: 'City not found'}`

### 错误显示

验证错误会自动在字段尾部区域显示为带有工具提示的警告图标。无需额外代码。

---

## 自动保存模式

对于每个字段独立保存的设置页面，请使用 `AutoSaveForm`。

### 基本自动保存表单

```tsx
import {z} from 'zod';

import {AutoSaveForm} from '@sentry/scraps/form';

import {fetchMutation} from 'sentry/utils/queryClient';

const schema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
});

function SettingsForm() {
  return (
    <AutoSaveForm
      name="displayName"
      schema={schema}
      initialValue={user.displayName}
      mutationOptions={{
        mutationFn: data => {
          return fetchMutation({
            url: '/user/',
            method: 'PUT',
            data,
          });
        },
        onSuccess: data => {
          // Update React Query cache
          queryClient.setQueryData(['user'], old => ({...old, ...data}));
        },
      }}
    >
      {field => (
        <field.Layout.Row label="Display Name">
          <field.Input value={field.state.value} onChange={field.handleChange} />
        </field.Layout.Row>
      )}
    </AutoSaveForm>
  );
}
```

### 按字段类型划分的自动保存行为

| 字段类型          | 保存时机                                                    |
| ----------------- | ----------------------------------------------------------- |
| Input, TextArea   | 失去焦点时（用户离开字段时）                                |
| Select（单选）    | 选项发生变化时立即保存                                      |
| Select（多选）    | 菜单关闭时，或在菜单关闭状态下点击 X/清除按钮时             |
| Switch            | 切换时立即保存                                              |
| Radio             | 选项发生变化时立即保存                                      |
| Range             | 用户释放滑块时，或使用键盘操作时立即保存                    |

### 自动保存状态指示器

表单系统会自动显示：

- 保存期间（待处理）显示**旋转指示器**
- 保存成功时显示**勾号**（2s 后淡出）
- 发生验证错误时显示**警告图标**（带有工具提示）

> **重要**：不要使用 toast 来传达自动保存状态。内置的行内指示器（旋转指示器、勾号、警告图标）才是正确的反馈机制。对于每次更改都会频繁保存的字段，toast 会产生干扰并打断用户操作。

### 确认对话框

对于危险操作（安全设置、权限），请使用 `confirm` 属性在保存前显示确认模态框。`confirm` 属性接受字符串或函数。

```tsx
<AutoSaveForm
  name="require2FA"
  schema={schema}
  initialValue={false}
  confirm={value =>
    value
      ? 'This will remove all members without 2FA. Continue?'
      : 'Are you sure you want to allow members without 2FA?'
  }
  mutationOptions={{...}}
>
  {field => (
    <field.Layout.Row label="Require Two-Factor Auth">
      <field.Switch checked={field.state.value} onChange={field.handleChange} />
    </field.Layout.Row>
  )}
</AutoSaveForm>
```

**确认配置选项：**

| 类型                             | 描述                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| `string`                         | 保存前始终显示此消息                                                      |
| `(value) => string \| undefined` | 根据新值返回消息的函数，或返回 `undefined` 以跳过确认 |

> **注意**：为确保安全，确认对话框始终将焦点置于“取消”按钮上，防止意外确认危险操作。

**示例：**

```tsx
// ✅ Simple string - always confirm
confirm="Are you sure you want to change this setting?"

// ✅ Only confirm when ENABLING (return undefined to skip)
confirm={value => value ? 'Are you sure you want to enable this?' : undefined}

// ✅ Only confirm when DISABLING
confirm={value => !value ? 'Disabling this removes security protection.' : undefined}

// ✅ Different messages for each direction
confirm={value =>
  value
    ? 'Enable 2FA requirement for all members?'
    : 'Allow members without 2FA?'
}

// ✅ For select fields - confirm specific values
confirm={value => value === 'delete' ? 'This will permanently delete all data!' : undefined}
```

---

## 表单提交

> **重要**：提交表单时始终使用 TanStack Query mutations（`useMutation`）。这样可以确保正确管理加载状态、错误处理和缓存。

### 使用 Mutations

```tsx
import {useMutation} from '@tanstack/react-query';

import {fetchMutation} from 'sentry/utils/queryClient';

function MyForm() {
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      return fetchMutation({
        url: '/endpoint/',
        method: 'POST',
        data,
      });
    },
    onSuccess: () => {
      // Handle success (e.g., show toast, redirect)
    },
  });

  const form = useScrapsForm({
    ...defaultFormOptions,
    defaultValues: {...},
    validators: {onDynamic: schema},
    onSubmit: ({value}) => {
      return mutation.mutateAsync(value).catch(() => {});
    },
  });

  // ...
}
```

### 保存后重置

当表单提交后仍保留在页面上时（例如设置页面），请在 mutation 成功后调用 `form.reset()`。这会使表单与更新后的 `defaultValues` 重新同步，从而再次变为未修改状态——任何依赖表单是否已修改的 UI（例如根据条件显示的“保存”/“取消”按钮）都会正确更新。

```tsx
onSubmit: ({value}) =>
  mutation
    .mutateAsync(value)
    .then(() => form.reset())
    .catch(() => {}),
```

> **注意**：`AutoSaveForm` 会自动处理此操作。仅当使用 `useScrapsForm` 时才需要添加此操作。

### 提交按钮

```tsx
<Flex gap="md" justify="end">
  <form.ResetButton>Reset</form.ResetButton>
  <form.SubmitButton>Save Changes</form.SubmitButton>
</Flex>
```

`SubmitButton` 会自动：

- 提交待处理时禁用
- 提交前触发表单验证

---

## 应该做与不应该做的事

### 表单系统选择

```tsx
// ❌ Don't use legacy JsonForm for new forms
<JsonForm fields={[{name: 'email', type: 'text'}]} />;

// ✅ Use useScrapsForm with Zod validation
const form = useScrapsForm({
  ...defaultFormOptions,
  defaultValues: {email: ''},
  validators: {onDynamic: schema},
});
```

### 默认选项

```tsx
// ❌ Don't forget defaultFormOptions
const form = useScrapsForm({
  defaultValues: {name: ''},
});

// ✅ Always spread defaultFormOptions first
const form = useScrapsForm({
  ...defaultFormOptions,
  defaultValues: {name: ''},
});
```

### 可空的默认值

```tsx
// ❌ Don't use non-null assertions or type casts
onSubmit: ({value}) => {
  return mutation.mutateAsync({...value, provider: value.provider!});
};

// ❌ Don't skip typing defaultValues when the schema has refine
const form = useScrapsForm({
  ...defaultFormOptions,
  defaultValues: {provider: null, name: ''}, // type is inferred but imprecise
});

// ✅ Use z.input for defaultValues and schema.parse in onSubmit
const defaultValues: z.input<typeof schema> = {provider: null, name: ''};

const form = useScrapsForm({
  ...defaultFormOptions,
  defaultValues,
  validators: {onDynamic: schema},
  onSubmit: ({value}) => {
    return mutation.mutateAsync(schema.parse(value)).catch(() => {});
  },
});
```

### 表单提交

```tsx
// ❌ Don't call API directly in onSubmit
onSubmit: async ({value}) => {
  await api.post('/users', value);
};

// ❌ Don't use mutateAsync without .catch() - causes unhandled rejection
onSubmit: ({value}) => {
  return mutation.mutateAsync(value);
};

// ✅ Use mutations with fetchMutation and .catch(() => {})
const mutation = useMutation({
  mutationFn: data => fetchMutation({url: '/users/', method: 'POST', data}),
});

onSubmit: ({value}) => {
  // Return the promise to keep form.isSubmitting working
  // Add .catch(() => {}) to avoid unhandled rejection - error handling
  // is done by TanStack Query (onError callback, mutation.isError state)
  // Add .then(() => form.reset()) if the form stays on the page after save
  return mutation
    .mutateAsync(value)
    .then(() => form.reset())
    .catch(() => {});
};
```

### 字段值处理

```tsx
// ❌ Don't use field.state.value directly when it might be undefined
<field.Input value={field.state.value} />

// ✅ Provide fallback for optional fields
<field.Input value={field.state.value ?? ''} />
```

### 验证消息

```tsx
// ❌ Don't use generic error messages
z.string().min(1);

// ✅ Provide helpful, specific error messages
z.string().min(1, 'Email address is required');
```

### 自动保存反馈

```tsx
// ❌ Don't use toasts for auto-save status
mutationOptions={{
  mutationFn: (data) => fetchMutation({url: '/user/', method: 'PUT', data}),
  onSuccess: () => {
    addSuccessMessage('Saved!'); // ❌ noisy and disruptive
  },
}}

// ✅ Rely on built-in inline indicators (spinner, checkmark, warning icon)
mutationOptions={{
  mutationFn: (data) => fetchMutation({url: '/user/', method: 'PUT', data}),
  onSuccess: (data) => {
    queryClient.setQueryData(['user'], old => ({...old, ...data}));
    // No toast needed - AutoSaveForm shows a checkmark automatically
  },
}}
```

### 自动保存缓存更新

始终在 `onSuccess` 中更新数据存储或缓存。否则，将字段切换回其原始值时不会触发保存——TanStack Form 会与 `defaultValues`（派生自 `initialValue`）进行比较，并在值相同时跳过提交。

```tsx
// ❌ Don't forget to update the cache after auto-save
mutationOptions={{
  mutationFn: (data) => fetchMutation({url: '/user/', method: 'PUT', data}),
}}

// ✅ Update React Query cache on success
mutationOptions={{
  mutationFn: (data) => fetchMutation({url: '/user/', method: 'PUT', data}),
  onSuccess: (data) => {
    queryClient.setQueryData(['user'], old => ({...old, ...data}));
  },
}}
```

### 自动保存 Mutation 类型定义

使用 API 的数据类型来定义 `mutationFn` 的类型，**不要**使用 zod schema 类型。schema 用于客户端字段验证——mutation 应接受 API 端点所接受的任何数据。也不要使用 `Record<string, unknown>` 之类的泛型类型，因为这会破坏 TanStack Form 缩小字段类型范围的能力。

**绝不要向 `mutationOptions`、`useMutation` 或任何 TanStack Query 函数传递调用点泛型。** 类型必须通过推断得出，而不是通过断言指定。完整规则请参阅 `static/AGENTS.md` 中的“TanStack Query Type Inference”。

```tsx
// ❌ NEVER pass generics to mutationOptions/useMutation
mutationOptions<unknown, RequestError, Variables, Context>({...})
useMutation<Response, RequestError, Variables>({...})

// ❌ Don't use generic types - breaks field type narrowing
const opts = mutationOptions({
  mutationFn: (data: Record<string, unknown>) => fetchMutation({...}),
});

// ❌ Don't tie mutation type to the zod schema
const opts = mutationOptions({
  mutationFn: (data: Partial<z.infer<typeof preferencesSchema>>) => fetchMutation({...}),
});

// ❌ Don't explicitly type context — it's inferred from onMutate return
type MyContext = {previousData: UserDetails};

// ❌ Don't use RequestError as the error generic — use runtime narrowing instead

// ✅ Use the API's data type on mutationFn, let everything else be inferred
const opts = mutationOptions({
  mutationFn: (data: Partial<UserDetails>) =>
    fetchMutation<UserDetails>({...}),
});
```

请确保 zod schema 的类型与 API 类型兼容。例如，如果 API 需要类似 `'off' | 'low' | 'high'` 的字符串联合类型，请使用 `z.enum(['off', 'low', 'high'])`，而不是 `z.string()`。

### 保存后重置表单

```tsx
// ❌ Don't forget to reset forms that stay on the page after save
onSubmit: ({value}) => {
  return mutation.mutateAsync(value).catch(() => {});
};

// ✅ Call form.reset() after successful save to sync with updated defaultValues
onSubmit: ({value}) => {
  return mutation
    .mutateAsync(value)
    .then(() => form.reset())
    .catch(() => {});
};
```

### 布局选择

```tsx
// ❌ Don't use Row layout when labels are very long
<field.Layout.Row label="Please enter the primary email address for your account">

// ✅ Use Stack layout for long labels
<field.Layout.Stack label="Please enter the primary email address for your account">
```

---

## 快速参考清单

创建新表单时：

- [ ] 从 `@sentry/scraps/form` 和 `zod` 导入
- [ ] 定义带有实用错误消息的 Zod schema
- [ ] 使用带有 `...defaultFormOptions` 的 `useScrapsForm`
- [ ] 设置与 schema 结构匹配的 `defaultValues`（如果 schema 包含 `.refine()`，请使用 `z.input<typeof schema>`）
- [ ] 设置 `validators: {onDynamic: schema}`
- [ ] 使用 `<form.AppForm form={form}>` 包裹
- [ ] 为每个字段使用 `<form.AppField>`
- [ ] 选择合适的布局（Stack 或 Row）
- [ ] 使用 `setFieldErrors` 处理服务器错误
- [ ] 添加 `<form.SubmitButton>` 以提交表单
- [ ] 如果表单成功变更后仍保留在页面上，请调用 `form.reset()`

创建自动保存字段时：

- [ ] 使用 `<AutoSaveForm>` 组件
- [ ] 传入 `schema` 以进行验证
- [ ] 从当前数据传入 `initialValue`
- [ ] 使用 `mutationFn` 配置 `mutationOptions`
- [ ] 在 `onSuccess` 回调中更新缓存

---

## 文件参考

| 文件                                               | 用途                     |
| -------------------------------------------------- | ------------------------ |
| `static/app/components/core/form/scrapsForm.tsx`   | 主表单 hook              |
| `static/app/components/core/form/autoSaveForm.tsx` | 自动保存包装器           |
| `static/app/components/core/form/field/*.tsx`      | 各个字段组件             |
| `static/app/components/core/form/layout/index.tsx` | 布局组件                 |
| `static/app/components/core/form/form.stories.tsx` | 使用示例                 |