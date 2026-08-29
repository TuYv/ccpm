---
name: migrate-frontend-forms
description: Guide for migrating forms from the legacy JsonForm/FormModel system to the new TanStack-based form system.
---
# 表单迁移指南

此 skill 用于将表单从 Sentry 的旧版表单系统（JsonForm、FormModel）迁移到基于 TanStack 的新系统。

## 功能映射

| 旧系统              | 新系统                    | 说明                                      |
| ------------------- | ------------------------- | ----------------------------------------- |
| `saveOnBlur: true`  | `AutoSaveForm`            | 默认行为                                  |
| `confirm`           | `confirm` prop            | `string \| ((value) => string \| undefined)` |
| `showHelpInTooltip` | `variant="compact"`       | 用于布局组件                              |
| `disabledReason`    | `disabled="reason"`       | 字符串会显示工具提示                      |
| `extraHelp`          | 布局中的 JSX              | 在字段下方渲染 `<Text>`                   |
| `getData`            | `mutationFn`              | 在 mutation 函数中转换数据                |
| `mapFormErrors`      | 请求错误适配器            | 常规表单需显式提供；自动保存表单已提供     |
| `saveMessage`        | `onSuccess`               | 在 mutation 的 onSuccess 回调中显示 toast  |
| `formatMessageValue` | `onSuccess`               | 在 onSuccess 回调中控制 toast 内容         |
| `resetOnError`       | `onError`                 | 在 mutation 的 onError 中调用 form.reset() |
| `saveOnBlur: false`  | `useScrapsForm`           | 使用带显式 Save 按钮的常规表单             |
| （自动）             | `form.reset()`             | 如果成功 mutation 后表单仍停留在当前页面，则调用 |
| `help`               | `hintText`                | 用于布局组件                              |
| `label`              | `label`                   | 用于布局组件                              |
| `required`           | `required`                | 用于布局组件和 Zod schema                 |

## 功能详情

### confirm → `confirm` prop

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

**旧方式：**

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

**新方式：**

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

**更简单的模式** - 如果只需要包装值：

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

**重要：正确设置 mutation 的类型**

`mutationFn` 应使用 API 的数据类型（例如 `Partial<Organization>`、`Partial<Project>`）进行类型标注，**而不是**使用 schema 推断出的类型。schema 仅用于客户端字段验证 — mutation 接收的是 API 端点所接受的任意数据。将 mutation 与 schema 绑定会耦合两个互不相关的关注点；当 schema 类型与 API 类型并不完全匹配时，还可能导致类型错误。

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

请确保 zod schema 的类型与 API 类型兼容（即可以赋值给 API 类型）。例如，如果 API 需要类似 `'off' | 'low' | 'high'` 的字符串联合类型，请使用 `z.enum(['off', 'low', 'high'])`，而不要使用 `z.string()`。

**绝对不要向 `useMutation`、`mutationOptions` 或任何 TanStack Query 函数传递调用点泛型。** 这适用于**所有**泛型 — 数据、错误、变量和上下文。类型必须通过推断获得，而不是通过断言指定。完整规则请参阅 `static/AGENTS.md` 中的 “TanStack Query Type Inference” 部分。

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

### `mapFormErrors` → `requestErrorToFieldErrors` + `setFieldErrors`

`mapFormErrors` 函数会将 API 错误响应转换为特定字段的错误。在新系统中，使用
`requestErrorToFieldErrors` 转换 Sentry API 错误，然后将 Scraps 的 `FieldErrors` 结果传递给
`setFieldErrors`。

不要直接将 `RequestError` 传递给 `setFieldErrors`。Scraps 不依赖
Sentry 的 API 客户端类型。

**旧：**

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

**新：**

```tsx
import {setFieldErrors} from '@sentry/scraps/form';

import {RequestError} from 'sentry/utils/requestError/requestError';

const form = useScrapsForm({
  ...defaultFormOptions,
  defaultValues: {...},
  validators: {onDynamic: schema},
  onSubmit: async ({value, formApi}) => {
    try {
      await mutation.mutateAsync(value);
    } catch (error) {
      if (!(error instanceof RequestError)) {
        return;
      }

      // Keep custom mapping only when the legacy form reshaped the response.
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

**更简单的模式** - 对于扁平的错误响应：

```tsx
import {setFieldErrors} from '@sentry/scraps/form';

import {RequestError} from 'sentry/utils/requestError/requestError';
import {requestErrorToFieldErrors} from 'sentry/utils/requestError/requestErrorToFieldErrors';

onSubmit: async ({value, formApi}) => {
  try {
    await mutation.mutateAsync(value);
  } catch (error) {
    if (!(error instanceof RequestError)) {
      addErrorMessage(t('Unable to save changes.'));
      return;
    }

    const handled = setFieldErrors(
      formApi,
      requestErrorToFieldErrors(error, formApi.state.values)
    );

    if (!handled) {
      addErrorMessage(t('Unable to save changes.'));
    }
  }
},
```

`requestErrorToFieldErrors` 接受 `RequestError`。在 Sentry 调用点先收窄未知错误，再进行转换。该适配器会根据
`formApi.state.values` 过滤响应键，并返回 Scraps 字段错误格式。只有当迁移需要自定义响应重塑时，才直接使用
`FieldErrors` 对象，例如上面的嵌套 `config` 示例。

对于 `AutoSaveForm`，标准的请求错误处理会自动进行。Sentry 表单错误提供程序使用
`requestErrorToFieldErrors` 处理字段错误，并使用 `getRequestErrorUserMessage` 处理请求详情或状态消息。不要将常规表单的 catch 块添加到每个自动保存字段中。

> **注意**：`setFieldErrors` 支持使用点号表示法的嵌套路径：`'config.schedule': {message: 'Invalid schedule'}``

### saveMessage → `onSuccess`

`saveMessage` 会在保存成功后显示自定义 toast/alert。在新系统中，请在 mutation 的 `onSuccess` 回调中处理这一逻辑。

**旧版：**

```tsx
{
  name: 'fingerprintingRules',
  saveOnBlur: false,
  saveMessageAlertVariant: 'info',
  saveMessage: t('Changing fingerprint rules will apply to future events only.'),
}
```

**新版：**

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

`formatMessageValue` 控制更改后的值在成功 toast 中的显示方式。将其设置为 `false` 会完全禁用值的显示（适用于较大的文本字段）。在新系统中，你可以直接在 `onSuccess` 中控制这一点。

**旧版：**

```tsx
{
  name: 'fingerprintingRules',
  saveMessage: t('Rules updated'),
  formatMessageValue: false, // Don't show the (potentially huge) value in toast
}
```

**新版：**

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

**旧版：**

```tsx
// Form-level reset on error
<Form resetOnError apiEndpoint="/auth/" {...}>

// Or field-level (BooleanField always resets on error)
<FormField resetOnError name="enabled" {...}>
```

**新版（使用 useScrapsForm）：**

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

**新版（使用 AutoSaveForm）：**

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

> **注意**：结合 TanStack Query 使用的 AutoSaveForm 已经能够优雅地处理错误状态——mutation 的 `isError` 状态会反映在 UI 中。通常只有在密码字段等特定 UX 需求下，才需要手动重置。

### 保存后重置

使用 `useScrapsForm` 创建保存后仍停留在页面上的表单时，请在 mutation 成功后调用 `form.reset()`。这会将表单与更新后的 `defaultValues` 重新同步，使其再次变为 pristine 状态——任何依赖表单 dirty 状态的 UI（例如有条件显示的 Save/Cancel 按钮）都会正确更新。

```tsx
onSubmit: ({value}) =>
  mutation
    .mutateAsync(value)
    .then(() => form.reset())
    .catch(() => {}),
```

> **注意**：`AutoSaveForm` 会自动处理这一点。只有在使用 `useScrapsForm` 时，才需要添加此逻辑。

### saveOnBlur: false → `useScrapsForm`

设置了 `saveOnBlur: false` 的字段会显示带有 Save/Cancel 按钮的内联提示，而不是自动保存。这种方式用于危险操作（slug 变更）或大段文本编辑（指纹规则）。

在新系统中，请使用带有 `useScrapsForm` 的常规表单，并添加明确的 Save 按钮。这样可以保留**提交前**显示警告的 UX。

**旧版：**

```tsx
{
  name: 'slug',
  type: 'string',
  saveOnBlur: false,
  saveMessageAlertVariant: 'warning',
  saveMessage: t("Changing a project's slug can break your build scripts!"),
}
```

**新版：**

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

**使用此模式的场景：**

- 用户在提交前应看到警告的危险操作（slug 更改、安全令牌）
- 希望完成编辑后再保存的大型多行文本字段（指纹规则、过滤器）
- 任何不适合自动保存的字段

**通过表单提交，而不是绕过表单。** 遵循上面的 `SlugForm` 模式——mutation 在 `onSubmit` 中运行，Save 按钮使用 `<form.SubmitButton>`。不要在没有 `onSubmit` 的情况下渲染 `<form.AppForm>`，也不要从独立的 `<Button onClick>` 触发 mutation：

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

从未真正提交的表单会绕过验证、pending/disabled 状态以及字段错误处理。

## 保留表单搜索功能

Sentry 的 SettingsSearch 允许用户搜索单个设置字段。迁移表单时，必须通过使用 `FormSearch` 包装迁移后的表单来保留此搜索功能。

### `FormSearch` 组件

`FormSearch` 是一个**构建时标记组件**——它没有任何运行时行为，只会原样渲染其子项。静态提取脚本会读取其 `route` 属性，将表单字段与其导航路由关联起来，使这些字段能够出现在 SettingsSearch 结果中。

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

**属性：**

| 属性       | 类型        | 描述                                                                                          |
| ---------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `route`    | `string`    | 此表单的设置路由（例如 `'/settings/account/details/'`）。用于搜索导航。 |
| `children` | `ReactNode` | 表单内容——在运行时原样渲染。                                                    |

**规则：**

- `route` 必须与设置页面 URL 完全匹配（包括末尾斜杠）。
- 使用单个 `FormSearch` 包装**整个表单部分**，而不是单独包装各个字段。
- `FormSearch` 中的每个 `<AutoSaveForm>` 或 `<form.AppField>` 都会被索引。确保 `label` 和 `hintText` 是纯字符串字面量或 `t()` 调用——计算得出的字符串或动态字符串将被提取器跳过。

### 表单字段注册表

添加或更新 `FormSearch` 包装器后，重新生成字段注册表，以便搜索结果保持最新：

```bash
pnpm run extract-form-fields
```

此脚本（`./scripts/extractFormFields.ts`）会扫描所有 TSX 文件，查找 `<FormSearch>` 组件，提取字段元数据（`name`、`label`、`hintText`、`route`），并将生成的注册表写入 `static/app/views/settings/fieldRegistry.generated.ts`。**请将此生成文件与迁移 PR 一同提交**——它属于源代码树的一部分。

> 在 `FormSearch` 包装器中的表单发生**任何**变更后（添加、移除、修改标签），都要运行此命令。生成的文件已纳入版本控制，不应手动编辑。

### 迁移：已支持搜索的旧表单

如果正在迁移的旧版 `JsonForm` 已经被 SettingsSearch 索引（即它在 `sentry/data/forms` 中已有条目），则**必须**为新表单添加 `FormSearch` 包装器，以保留搜索功能。旧数据源和新数据源会共存——对于相同的路由 + 字段组合，新注册表条目的优先级高于旧条目——但一旦移除旧表单，旧条目也会消失。

## 处理可为空的初始值

旧版选择字段通常以空值/未定义值开始，并要求用户进行选择。在新系统中，请在 schema 中使用 `.nullable().refine()`，使用 `z.input<typeof schema>` 为 `defaultValues` 添加类型，并在 `onSubmit` 中调用 `schema.parse(value)`。

**旧版：**

```tsx
{
  name: 'provider',
  type: 'select',
  required: true,
  choices: [['github', 'GitHub'], ['launchdarkly', 'LaunchDarkly']],
}
```

**新版：**

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

只要必填字段没有有意义的初始值，就必须使用此模式。`z.input` / `z.output` 的区别确保表单可以接受 `null` 作为默认值，而 mutation 接收到的是经过验证的非空类型。

## 有意未迁移的功能

| 功能        | 使用情况 | 原因                                                                                 |
| ----------- | -------- | ------------------------------------------------------------------------------------ |
| `allowUndo` | 3 个表单 | Toast 中的撤销功能会增加复杂性，但收益很小。请改用简单的错误 Toast。 |

## 迁移检查清单

- [ ] 将 JsonForm/FormModel 替换为 useScrapsForm 或 AutoSaveForm
- [ ] `useMutation` 不使用泛型——为 `mutationFn` 的 payload 添加类型，并使用 `fetchMutation<T>` 指定返回类型
- [ ] 使用带 Save 按钮的 `useScrapsForm` 时：mutation 在 `onSubmit` 中运行，由 `<form.SubmitButton>` 触发（不要存在永远不会提交的表单）
- [ ] 将字段配置对象转换为 JSX AppField 组件
- [ ] 将布局中的 `help` 替换为 `hintText`
- [ ] 将 `showHelpInTooltip` 替换为 `variant="compact"`
- [ ] 将 `disabledReason` 替换为 `disabled="reason string"`
- [ ] 将 `extraHelp` 替换为布局中的额外 JSX
- [ ] 将 `confirm` 对象转换为函数：`(value) => message | undefined`
- [ ] 在 mutationFn 中处理 `getData`
- [ ] 对于普通表单，在传递给 `requestErrorToFieldErrors` 之前，将未知错误收窄为 `RequestError`，然后调用 `setFieldErrors`
- [ ] 对于 `AutoSaveForm`，使用应用提供的请求错误处理
- [ ] 仅当 `mapFormErrors` 重塑了 API 响应时，才保留自定义错误映射
- [ ] 在 onSuccess 回调中处理 `saveMessage`
- [ ] 将 `saveOnBlur: false` 字段转换为带 Save 按钮的普通表单
- [ ] mutation 成功后调用 `form.reset()`（对于仍停留在当前页面的表单）
- [ ] 确认 `onSuccess` 的缓存更新会与现有数据合并（使用 updater 函数）——某些 API 端点可能返回部分对象
- [ ] 如果旧表单已在 SettingsSearch 中支持搜索，则使用 `<FormSearch route="...">` 包装迁移后的表单
- [ ] 运行 `pnpm run extract-form-fields` 并提交更新后的 `fieldRegistry.generated.ts`