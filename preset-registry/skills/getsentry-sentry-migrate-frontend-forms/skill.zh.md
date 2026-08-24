---
name: migrate-frontend-forms
description: Guide for migrating forms from the legacy JsonForm/FormModel system to the new TanStack-based form system.
---
# 表单迁移指南

此技能可帮助将表单从 Sentry 的旧版表单系统（JsonForm、FormModel）迁移到基于 TanStack 的新系统。

## 功能映射

| 旧系统               | 新系统              | 说明                                                 |
| -------------------- | ------------------- | ---------------------------------------------------- |
| `saveOnBlur: true`   | `AutoSaveForm`      | 默认行为                                             |
| `confirm`            | `confirm` 属性      | `string \| ((value) => string \| undefined)`         |
| `showHelpInTooltip`  | `variant="compact"` | 用于布局组件                                         |
| `disabledReason`     | `disabled="reason"` | 字符串将显示为工具提示                               |
| `extraHelp`          | 布局中的 JSX        | 在字段下方渲染 `<Text>`                              |
| `getData`            | `mutationFn`        | 在 mutation 函数中转换数据                           |
| `mapFormErrors`      | `setFieldErrors`    | 在 catch 块中转换 API 错误                           |
| `saveMessage`        | `onSuccess`         | 在 mutation 的 onSuccess 回调中显示 toast            |
| `formatMessageValue` | `onSuccess`         | 在 onSuccess 回调中控制 toast 内容                   |
| `resetOnError`       | `onError`           | 在 mutation 的 onError 中调用 form.reset()           |
| `saveOnBlur: false`  | `useScrapsForm`     | 使用带有显式保存按钮的常规表单                       |
| （自动）             | `form.reset()`      | 如果表单仍保留在页面上，则在 mutation 成功后调用     |
| `help`               | `hintText`          | 用于布局组件                                         |
| `label`              | `label`             | 用于布局组件                                         |
| `required`           | `required`          | 用于布局组件和 Zod schema                            |

## 功能详情

### confirm → `confirm` 属性

**旧版：**

```tsx
{
  name: 'require2FA',
  type: 'boolean',
  confirm: {
    true: 'Enable 2FA for all members?',
    false: 'Allow members without 2FA?',
  },
  isDangerous: true,
}
```

**新版：**

```tsx
<AutoSaveForm
  name="require2FA"
  confirm={value =>
    value
      ? 'Enable 2FA for all members?'
      : 'Allow members without 2FA?'
  }
  {...}
>
```

### showHelpInTooltip → `variant="compact"`

**旧版：**

```tsx
{
  name: 'field',
  help: 'This is help text',
  showHelpInTooltip: true,
}
```

**新版：**

```tsx
<field.Layout.Row
  label="Field"
  hintText="This is help text"
  variant="compact"
>
```

### disabledReason → `disabled="reason"`

**旧版：**

```tsx
{
  name: 'field',
  disabled: true,
  disabledReason: 'Requires Business plan',
}
```

**新版：**

```tsx
<field.Input
  disabled="Requires Business plan"
  {...}
/>
```

### extraHelp → JSX

**旧版：**

```tsx
{
  name: 'sensitiveFields',
  help: 'Main help text',
  extraHelp: 'Note: These fields apply org-wide',
}
```

**新版：**

```tsx
<field.Layout.Stack label="Sensitive Fields" hintText="Main help text">
  <field.TextArea {...} />
  <Text size="sm" variant="muted">
    Note: These fields apply org-wide
  </Text>
</field.Layout.Stack>
```

### getData → `mutationFn`

`getData` 函数会在将字段数据发送到 API 之前对其进行转换。在新系统中，请在 `mutationFn` 中处理此逻辑。

**旧版：**

```tsx
// Wrap field value in 'options' key
{
  name: 'sentry:csp_ignored_sources_defaults',
  type: 'boolean',
  getData: data => ({options: data}),
}

// Or extract/transform specific fields
{
  name: 'slug',
  getData: (data: {slug?: string}) => ({slug: data.slug}),
}
```

**新版：**

```tsx
<AutoSaveForm
  name="sentry:csp_ignored_sources_defaults"
  schema={schema}
  initialValue={project.options['sentry:csp_ignored_sources_defaults']}
  mutationOptions={{
    mutationFn: data => {
      // Transform data before API call (equivalent to getData)
      const transformed = {options: data};
      return fetchMutation({
        url: `/projects/${organization.slug}/${project.slug}/`,
        method: 'PUT',
        data: transformed,
      });
    },
  }}
>
  {field => (
    <field.Layout.Row label="Use default ignored sources">
      <field.Switch checked={field.state.value} onChange={field.handleChange} />
    </field.Layout.Row>
  )}
</AutoSaveForm>
```

**更简单的模式** - 如果只需包装该值：

```tsx
mutationOptions={{
  mutationFn: fieldData => {
    return fetchMutation({
      url: `/projects/${org}/${project}/`,
      method: 'PUT',
      data: {options: fieldData}, // getData equivalent
    });
  },
}}
```

**重要：为 mutation 正确指定类型**

应使用 API 的数据类型（例如 `Partial<Organization>`、`Partial<Project>`）为 `mutationFn` 指定类型，**而不是**使用从 schema 推断出的类型。schema 仅用于客户端字段验证——mutation 接收的是 API 端点所接受的任何数据。将 mutation 与 schema 绑定会耦合两个不相关的关注点，并且当 schema 类型与 API 类型不完全匹配时，可能导致类型错误。

```tsx
// ❌ Don't use generic types - breaks field type narrowing
mutationOptions={{
  mutationFn: (data: Record<string, unknown>) => {
    return fetchMutation({url: '/user/', method: 'PUT', data: {options: data}});
  },
}}

// ❌ Don't tie mutation type to the zod schema
mutationOptions={{
  mutationFn: (data: Partial<z.infer<typeof preferencesSchema>>) => {
    return fetchMutation({url: '/user/', method: 'PUT', data: {options: data}});
  },
}}

// ✅ Use the API's data type
mutationOptions={{
  mutationFn: (data: Partial<UserDetails>) => {
    return fetchMutation({url: '/user/', method: 'PUT', data: {options: data}});
  },
}}
```

请确保 zod schema 的类型与 API 类型兼容（即可赋值给 API 类型）。例如，如果 API 需要类似 `'off' | 'low' | 'high'` 的字符串联合类型，请使用 `z.enum(['off', 'low', 'high'])`，而不是 `z.string()`。

**绝不要在调用处向 `useMutation`、`mutationOptions` 或任何 TanStack Query 函数传递泛型。** 这适用于所有泛型——数据、错误、变量以及上下文。类型必须通过推断得出，而不能通过断言指定。完整规则请参阅 `static/AGENTS.md` 中的“TanStack Query Type Inference”。

```tsx
// ❌ Generics on useMutation — NEVER do this
const mutation = useMutation<CodeOwner, RequestError, [Payload]>({
  mutationFn: ([payload]) => fetchMutation({url, method: 'POST', data: payload}),
});

// ❌ Generics on mutationOptions — NEVER do this either
mutationOptions<unknown, RequestError, Variables, MyContext>({...})

// ❌ Explicit context type — inferred from onMutate return
type MyContext = {changeId: string};

// ❌ RequestError as error generic — it's a type assertion in disguise
// Other things can go wrong that would NOT yield a RequestError

// ✅ Type the mutationFn payload; fetchMutation<T> carries the return type
const mutation = useMutation({
  mutationFn: (payload: {codeMappingId: string; raw: string}) =>
    fetchMutation<CodeOwner>({
      url: `/projects/${org}/${project}/codeowners/`,
      method: 'POST',
      data: payload,
    }),
});

// ✅ Context is inferred from onMutate, error is Error by default
mutationOptions({
  mutationFn: (variables: MyVars) => fetchMutation<MyResponse>({...}),
  onMutate: async () => {
    return {changeId: uniqueId()};  // context type inferred from this
  },
  onError: (_error, _vars, context) => {
    // context?.changeId is typed automatically
    // _error is Error — use runtime narrowing for RequestError
  },
})
```

### mapFormErrors → `setFieldErrors`

`mapFormErrors` 函数将 API 错误响应转换为特定字段的错误。在新系统中，请在 catch 块中使用 `setFieldErrors` 处理此问题。

**旧版：**

```tsx
// Form-level error transformer
function mapMonitorFormErrors(responseJson?: any) {
  if (responseJson.config === undefined) {
    return responseJson;
  }
  // Flatten nested config errors to dot notation
  const {config, ...rest} = responseJson;
  const configErrors = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [`config.${key}`, value])
  );
  return {...rest, ...configErrors};
}

<Form mapFormErrors={mapMonitorFormErrors} {...}>
```

**新版：**

```tsx
import {setFieldErrors} from '@sentry/scraps/form';

const form = useScrapsForm({
  ...defaultFormOptions,
  defaultValues: {...},
  validators: {onDynamic: schema},
  onSubmit: async ({value, formApi}) => {
    try {
      await mutation.mutateAsync(value);
    } catch (error) {
      // Transform API errors and set on fields (equivalent to mapFormErrors)
      const responseJson = error.responseJSON;
      if (responseJson?.config) {
        // Flatten nested errors to dot notation
        const {config, ...rest} = responseJson;
        const errors: Record<string, {message: string}> = {};

        for (const [key, value] of Object.entries(rest)) {
          errors[key] = {message: Array.isArray(value) ? value[0] : String(value)};
        }
        for (const [key, value] of Object.entries(config)) {
          errors[`config.${key}`] = {message: Array.isArray(value) ? value[0] : String(value)};
        }

        setFieldErrors(formApi, errors);
      }
    }
  },
});
```

**更简单的模式** - 适用于扁平错误响应：

```tsx
onSubmit: async ({value, formApi}) => {
  try {
    await mutation.mutateAsync(value);
  } catch (error) {
    // API returns {email: ['Already taken'], username: ['Invalid']}
    const errors = error.responseJSON;
    if (errors) {
      setFieldErrors(formApi, {
        email: {message: errors.email?.[0]},
        username: {message: errors.username?.[0]},
      });
    }
  }
},
```

> **注意**：`setFieldErrors` 支持使用点号表示法的嵌套路径：`'config.schedule': {message: 'Invalid schedule'}`

### saveMessage → `onSuccess`

`saveMessage` 会在保存成功后显示自定义 toast/警告。在新系统中，请在 mutation 的 `onSuccess` 回调中处理此操作。

**旧方式：**

```tsx
{
  name: 'fingerprintingRules',
  saveOnBlur: false,
  saveMessageAlertVariant: 'info',
  saveMessage: t('Changing fingerprint rules will apply to future events only.'),
}
```

**新方式：**

```tsx
import {addSuccessMessage} from 'sentry/actionCreators/indicator';

<AutoSaveForm
  name="fingerprintingRules"
  schema={schema}
  initialValue={project.fingerprintingRules}
  mutationOptions={{
    mutationFn: data => fetchMutation({...}),
    onSuccess: () => {
      // Custom success message (equivalent to saveMessage)
      addSuccessMessage(t('Changing fingerprint rules will apply to future events only.'));
    },
  }}
>
```

### formatMessageValue → `onSuccess`

`formatMessageValue` 控制变更后的值在成功 toast 中的显示方式。将其设置为 `false` 会完全禁止显示该值（适用于大型文本字段）。在新系统中，你可以直接在 `onSuccess` 中控制此行为。

**旧方式：**

```tsx
{
  name: 'fingerprintingRules',
  saveMessage: t('Rules updated'),
  formatMessageValue: false, // Don't show the (potentially huge) value in toast
}
```

**新方式：**

```tsx
mutationOptions={{
  mutationFn: data => fetchMutation({...}),
  onSuccess: () => {
    // Just show the message, no value (equivalent to formatMessageValue: false)
    addSuccessMessage(t('Rules updated'));
  },
}}

// Or if you want to show a formatted value:
onSuccess: (data) => {
  addSuccessMessage(t('Slug changed to %s', data.slug));
},
```

### resetOnError → `onError`

`resetOnError` 选项会在保存失败时将字段恢复为之前的值。在新系统中，请在 mutation 的 `onError` 回调中调用 `form.reset()`。

**旧方式：**

```tsx
// Form-level reset on error
<Form resetOnError apiEndpoint="/auth/" {...}>

// Or field-level (BooleanField always resets on error)
<FormField resetOnError name="enabled" {...}>
```

**新方式（使用 useScrapsForm）：**

```tsx
const form = useScrapsForm({
  ...defaultFormOptions,
  defaultValues: {password: ''},
  validators: {onDynamic: schema},
  onSubmit: async ({value}) => {
    try {
      await mutation.mutateAsync(value);
    } catch (error) {
      // Reset form to previous values on error (equivalent to resetOnError)
      form.reset();
      throw error; // Re-throw if you want error handling to continue
    }
  },
});
```

**新方式（使用 AutoSaveForm）：**

```tsx
<AutoSaveForm
  name="enabled"
  schema={schema}
  initialValue={settings.enabled}
  mutationOptions={{
    mutationFn: data => fetchMutation({...}),
    onError: () => {
      // The field automatically shows error state via TanStack Query
      // If you need to reset the value, you can pass a reset callback
    },
  }}
>
```

> **注意**：使用 TanStack Query 的 AutoSaveForm 已经能够妥善处理错误状态——mutation 的 `isError` 状态会反映在 UI 中。通常只有在密码字段等具有特定 UX 要求的情况下，才需要手动重置。

### 保存后重置

当使用 `useScrapsForm` 构建保存后仍保留在页面上的表单时，请在 mutation 成功后调用 `form.reset()`。这会将表单与更新后的 `defaultValues` 重新同步，使其恢复为未修改状态——任何依赖表单是否已修改的 UI（例如有条件显示的保存/取消按钮）都将正确更新。

```tsx
onSubmit: ({value}) =>
  mutation
    .mutateAsync(value)
    .then(() => form.reset())
    .catch(() => {}),
```

> **注意**：`AutoSaveForm` 会自动处理此操作。仅在使用 `useScrapsForm` 时才需要添加此操作。

### saveOnBlur: false → `useScrapsForm`

设置了 `saveOnBlur: false` 的字段不会自动保存，而是显示一个包含保存/取消按钮的行内提醒。这种方式用于危险操作（更改 slug）或大段文本编辑（指纹规则）。

在新系统中，请使用通过 `useScrapsForm` 创建的常规表单，并提供明确的保存按钮。这样可以保留在提交**之前**显示警告的 UX。

**旧方式：**

```tsx
{
  name: 'slug',
  type: 'string',
  saveOnBlur: false,
  saveMessageAlertVariant: 'warning',
  saveMessage: t("Changing a project's slug can break your build scripts!"),
}
```

**新方式：**

```tsx
import {Alert} from '@sentry/scraps/alert';
import {Button} from '@sentry/scraps/button';
import {defaultFormOptions, useScrapsForm} from '@sentry/scraps/form';

const slugSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

function SlugForm({project}: {project: Project}) {
  const mutation = useMutation({
    mutationFn: (data: {slug: string}) =>
      fetchMutation({url: `/projects/${org}/${project.slug}/`, method: 'PUT', data}),
  });

  const form = useScrapsForm({
    ...defaultFormOptions,
    defaultValues: {slug: project.slug},
    validators: {onDynamic: slugSchema},
    onSubmit: ({value}) => mutation.mutateAsync(value).catch(() => {}),
  });

  return (
    <form.AppForm form={form}>
      <form.AppField name="slug">
        {field => (
          <field.Layout.Stack label="Project Slug">
            <field.Input value={field.state.value} onChange={field.handleChange} />
          </field.Layout.Stack>
        )}
      </form.AppField>

      {/* Warning shown before saving (equivalent to saveMessage) */}
      <Alert variant="warning">
        {t("Changing a project's slug can break your build scripts!")}
      </Alert>

      <Flex gap="sm" justify="end">
        <form.ResetButton>Reset</form.ResetButton>
        <form.SubmitButton>Save</form.SubmitButton>
      </Flex>
    </form.AppForm>
  );
}
```

**何时使用此模式：**

- 危险操作，用户应在提交前看到警告（更改 slug、安全令牌）
- 大型多行文本字段，需要在保存前完成编辑（指纹规则、过滤器）
- 任何不适合自动保存的字段

**通过表单提交，而不是绕过表单。** 请遵循上面的 `SlugForm` 模式——在 `onSubmit` 中执行 mutation，并使用 `<form.SubmitButton>` 作为保存按钮。不要在没有 `onSubmit` 的情况下渲染 `<form.AppForm>`，然后通过独立的 `<Button onClick>` 触发 mutation：

```tsx
// ❌ Form is never submitted; mutation fires from a separate button
const form = useScrapsForm({
  ...defaultFormOptions,
  defaultValues,
  validators: {onDynamic: schema},
  // no onSubmit
});

return (
  <form.AppForm form={form}>
    <form.AppField name="codeMappingId">{...}</form.AppField>
    <Button onClick={() => mutation.mutate(...)}>Save</Button>
  </form.AppForm>
);
```

从未实际提交的表单会绕过验证、待处理/禁用状态以及字段错误关联机制。

## 保留表单搜索功能

Sentry 的 SettingsSearch 允许用户搜索各个设置字段。迁移表单时，必须使用 `FormSearch` 包装迁移后的表单，以保留这种可搜索性。

### `FormSearch` 组件

`FormSearch` 是一个**构建时标记组件**——它在运行时没有任何行为，只会原样渲染其子元素。静态提取脚本会读取它的 `route` prop，将表单字段与其导航路由关联起来，使这些字段能够显示在 SettingsSearch 结果中。

```tsx
import {FormSearch} from 'sentry/components/core/form';

<FormSearch route="/settings/account/details/">
  <FieldGroup title={t('Account Details')}>
    <AutoSaveForm name="name" schema={schema} initialValue={user.name} mutationOptions={...}>
      {field => (
        <field.Layout.Row label={t('Name')} hintText={t('Your full name')} required>
          <field.Input />
        </field.Layout.Row>
      )}
    </AutoSaveForm>
  </FieldGroup>
</FormSearch>
```

**Props：**

| Prop       | Type        | 描述                                                                                          |
| ---------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `route`    | `string`    | 此表单的设置路由（例如 `'/settings/account/details/'`）。用于搜索导航。 |
| `children` | `ReactNode` | 表单内容——在运行时原样渲染。                                                    |

**规则：**

- `route` 必须与设置页面的 URL 完全匹配（包括末尾的斜杠）。
- 使用单个 `FormSearch` 包装**整个表单区段**，而不是单独包装各个字段。
- `FormSearch` 内的每个 `<AutoSaveForm>` 或 `<form.AppField>` 都会被索引。请确保 `label` 和 `hintText` 是纯字符串字面量或 `t()` 调用——提取器会跳过计算得到的字符串或动态字符串。

### 表单字段注册表

添加或更新 `FormSearch` 包装器后，请重新生成字段注册表，以确保搜索结果保持最新：

```bash
pnpm run extract-form-fields
```

此脚本（`scripts/extractFormFields.ts`）会扫描所有 TSX 文件，查找 `<FormSearch>` 组件，提取字段元数据（`name`、`label`、`hintText`、`route`），并将生成的注册表写入 `static/app/views/settings/fieldRegistry.generated.ts`。请在迁移 PR 中一并**提交这个生成的文件**——它是源码树的一部分。

> 对 `FormSearch` 包装器内的表单进行**任何**更改（添加、移除、标签更改）后，都要运行此命令。生成的文件已纳入版本控制，不应手动编辑。

### 迁移：已支持搜索的旧表单

如果要迁移的旧版 `JsonForm` 已经被 SettingsSearch 索引（即在 `sentry/data/forms` 中存在条目），则**必须**为新表单添加 `FormSearch` 包装器，以保留搜索功能。新旧数据源会共存——对于相同的路由和字段组合，新注册表条目的优先级高于旧条目——但一旦移除旧版表单，旧条目也会消失。

## 处理可为 Null 的初始值

旧版选择字段通常以空值/undefined 值作为初始值，并要求用户进行选择。在新系统中，请在 schema 中使用 `.nullable().refine()`，使用 `z.input<typeof schema>` 指定 `defaultValues` 的类型，并在 `onSubmit` 中调用 `schema.parse(value)`。

**旧写法：**

```tsx
{
  name: 'provider',
  type: 'select',
  required: true,
  choices: [['github', 'GitHub'], ['launchdarkly', 'LaunchDarkly']],
}
```

**新写法：**

```tsx
const schema = z.object({
  provider: z
    .enum(['github', 'launchdarkly'])
    .nullable()
    .refine(v => v !== null, 'Provider is required'),
});

// z.input accepts null; z.output (after refine) does not
const defaultValues: z.input<typeof schema> = {
  provider: null,
};

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

每当必填字段没有有意义的初始值时，都必须使用此模式。`z.input` / `z.output` 之间的区别可确保表单接受 `null` 作为默认值，同时 mutation 接收到经过验证的非 null 类型。

## 有意不迁移的功能

| 功能        | 使用情况 | 原因                                                        |
| ----------- | ------- | ----------------------------------------------------------- |
| `allowUndo` | 3 个表单 | 在 toast 中提供撤销功能会增加复杂性，但收益很小。请改用简单的错误 toast。 |

## 迁移检查清单

- [ ] 使用 useScrapsForm 或 AutoSaveForm 替换 JsonForm/FormModel
- [ ] 不要为 `useMutation` 指定泛型——为 `mutationFn` payload 指定类型，并使用 `fetchMutation<T>` 指定返回类型
- [ ] 使用带有保存按钮的 `useScrapsForm` 时：mutation 在 `onSubmit` 中运行，由 `<form.SubmitButton>` 触发（不要创建永远不会提交的表单）
- [ ] 将字段配置对象转换为 JSX AppField 组件
- [ ] 将布局上的 `help` 替换为 `hintText`
- [ ] 将 `showHelpInTooltip` 替换为 `variant="compact"`
- [ ] 将 `disabledReason` 替换为 `disabled="reason string"`
- [ ] 将 `extraHelp` 替换为布局中的额外 JSX
- [ ] 将 `confirm` 对象转换为函数：`(value) => message | undefined`
- [ ] 在 mutationFn 中处理 `getData`
- [ ] 在 catch 中使用 setFieldErrors 处理 `mapFormErrors`
- [ ] 在 onSuccess 回调中处理 `saveMessage`
- [ ] 将 `saveOnBlur: false` 字段转换为带有保存按钮的常规表单
- [ ] mutation 成功后调用 `form.reset()`（适用于仍停留在当前页面的表单）
- [ ] 验证 `onSuccess` 缓存更新是否与现有数据合并（使用 updater 函数）——某些 API 端点可能返回部分对象
- [ ] 如果旧表单可在 SettingsSearch 中搜索，请使用 `<FormSearch route="...">` 包装迁移后的表单
- [ ] 运行 `pnpm run extract-form-fields` 并提交更新后的 `fieldRegistry.generated.ts`