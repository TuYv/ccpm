---
name: generate-snapshot-tests
description: Generate snapshot test files for Sentry frontend React components. Use when asked to "generate snapshot tests", "add snapshot tests", "create visual snapshots", "write snapshot tests", "add visual regression tests", or "snapshot this component". Accepts an optional component path or name via $ARGUMENTS.
type: workflow-process
---
# 生成快照测试

生成一个与 Sentry React 组件位于同一目录下的 `*.snapshots.tsx` 文件，遵循核心设计系统组件所使用的既有模式。

## 第 1 步：定位组件

如果提供了 `$ARGUMENTS`，将其视为路径或组件名称。否则，询问用户要为哪个组件生成快照。

搜索策略：

```
static/app/components/core/<name>/<name>.tsx
static/app/components/core/<name>/index.tsx
static/app/components/<name>.tsx
static/app/components/<name>/index.tsx
```

如果确切路径未知，使用 Glob 或 Grep 查找文件。

阅读组件源文件以了解：

- 组件名称及其导出的 `Props` / `<ComponentName>Props` 类型
- props 中的联合类型和类似枚举的字符串字面量（例如 `variant`、`priority`、`size`）
- 布尔切换 props（例如 `disabled`、`checked`、`busy`）
- 组件是否可交互（是否需要 `onChange={() => {}}` 或类似的空操作处理程序）

## 第 2 步：确定导入路径

| 条件                                                                                       | 导入方式                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 组件位于 `static/app/components/core/` 下，并且以 `@sentry/scraps/<name>` 发布 | `import {ComponentName, type ComponentNameProps} from '@sentry/scraps/<name>';`                                                                                                                                                       |
| 组件位于 `static/app/components/core/` 下，但不在 `@sentry/scraps` 中              | `// eslint-disable-next-line @sentry/scraps/no-core-import -- SSR snapshot needs direct import to avoid barrel re-exports with heavy deps`<br>`import {ComponentName, type ComponentNameProps} from 'sentry/components/core/<path>';` |
| 所有其他组件                                                                            | `import {ComponentName, type ComponentNameProps} from 'sentry/components/<path>';`                                                                                                                                                    |

要检查组件是否位于 `@sentry/scraps` 中，请在相邻文件中查找使用 `@sentry/scraps/<name>` 的现有导入，或者检查同一目录中的其他快照文件是否使用 `@sentry/scraps`。

## 第 3 步：确定要生成快照的 Props

阅读 TypeScript props 并对其进行分类：

| Prop 类型                                                 | 操作                                       |
| --------------------------------------------------------- | -------------------------------------------- |
| 字符串字面量联合类型（`'sm' \| 'md' \| 'lg'`）         | 使用 `it.snapshot.each` 为每个值生成快照  |
| 具有视觉影响的布尔切换项（`disabled`、`checked`） | 为 `true` 和 `false` 状态生成快照           |
| 没有视觉测试价值的布尔标志                    | 跳过，或添加一个具名快照          |
| `children` / `className` / `style` / 事件处理程序       | 跳过——它们本身在视觉上没有意义 |

优先选择会显著改变组件视觉外观的 props。对于交互式组件（输入框、切换开关），始终包含 disabled/checked 状态。

## 步骤 4：编写快照文件

将输出文件命名为 `<component-name>.snapshots.tsx`，并与组件源文件放置在同一位置。

### 必需的 imports（始终包含）

```tsx
import {ThemeProvider} from '@emotion/react';

import {ComponentName, type ComponentNameProps} from '@sentry/scraps/<name>'; // or appropriate path

// eslint-disable-next-line no-restricted-imports -- SSR snapshot rendering needs direct theme access
import {darkTheme, lightTheme} from 'sentry/utils/theme/theme';

const themes = {light: lightTheme, dark: darkTheme};
```

### 核心结构

始终使用 light/dark 主题循环进行包裹：

```tsx
describe('ComponentName', () => {
  describe.each(['light', 'dark'] as const)('%s', themeName => {
    // ... snapshot cases here
  });
});
```

### `it.snapshot.each` — 用于联合类型 prop 的变体

在遍历单个 prop 的多个值时使用：

```tsx
it.snapshot.each<ComponentProps['variant']>(['info', 'warning', 'success', 'danger'])(
  '%s',
  variant => (
    <ThemeProvider theme={themes[themeName]}>
      <div style={{padding: 8}}>
        <Component variant={variant}>Label</Component>
      </div>
    </ThemeProvider>
  ),
  variant => ({theme: themeName, variant: String(variant)})
);
```

`it.snapshot.each` 的第三个参数是元数据函数——应包含快照中所有会发生变化的 props。此元数据用于快照命名和差异比较。

### `it.snapshot` — 用于单个命名快照

用于一次性状态（disabled、checked 组合等）：

```tsx
it.snapshot('disabled-unchecked', () => (
  <ThemeProvider theme={themes[themeName]}>
    <div style={{padding: 8}}>
      <Component disabled onChange={() => {}} />
    </div>
  </ThemeProvider>
));
```

当元数据能够为快照提供有用的上下文时，将其作为第三个参数传入：

```tsx
it.snapshot(
  'bold',
  () => (
    <ThemeProvider theme={themes[themeName]}>
      <div style={{padding: 8}}>
        <Component bold>Bold text</Component>
      </div>
    </ThemeProvider>
  ),
  {theme: themeName}
);
```

### 设置容器尺寸

根据组件清晰可读所需的尺寸设置容器大小：

| 情况                           | 包裹元素                                 |
| ------------------------------ | ---------------------------------------- |
| 默认                           | `<div style={{padding: 8}}>`             |
| 对宽度敏感（警告、文本）       | `<div style={{padding: 8, width: 400}}>` |
| 窄小（图标、小型控件）         | `<div style={{padding: 8}}>`             |

### 交互式组件

对于需要事件处理程序的组件（输入框、复选框、单选按钮、开关），传入空操作处理程序以满足必需的 props：

```tsx
<Component onChange={() => {}} />
<Component checked onChange={() => {}} />
```

## 步骤 5：在主题循环中排列快照

按照影响从大到小排列各个用例：

1. 主要的 variant/priority prop（视觉上最明显的差异）
2. 次要的 variant props
3. 尺寸变体
4. 状态组合（disabled+unchecked、disabled+checked）
5. 布尔修饰项（bold、italic 等）
6. 边界情况和组合 props

## 示例

### 简单的变体组件（Button 风格）

```tsx
import {ThemeProvider} from '@emotion/react';

import {Button, type ButtonProps} from '@sentry/scraps/button';

// eslint-disable-next-line no-restricted-imports -- SSR snapshot rendering needs direct theme access
import {darkTheme, lightTheme} from 'sentry/utils/theme/theme';

const themes = {light: lightTheme, dark: darkTheme};

describe('Button', () => {
  describe.each(['light', 'dark'] as const)('%s', themeName => {
    it.snapshot.each<ButtonProps['priority']>([
      'default',
      'primary',
      'danger',
      'warning',
      'link',
      'transparent',
    ])(
      '%s',
      priority => (
        <ThemeProvider theme={themes[themeName]}>
          <div style={{padding: 8}}>
            <Button priority={priority}>{priority}</Button>
          </div>
        </ThemeProvider>
      ),
      priority => ({theme: themeName, priority: String(priority)})
    );
  });
});
```

### 包含状态组合的交互式组件（Switch 风格）

```tsx
import {ThemeProvider} from '@emotion/react';

import {Switch, type SwitchProps} from '@sentry/scraps/switch';

// eslint-disable-next-line no-restricted-imports -- SSR snapshot rendering needs direct theme access
import {darkTheme, lightTheme} from 'sentry/utils/theme/theme';

const themes = {light: lightTheme, dark: darkTheme};

describe('Switch', () => {
  describe.each(['light', 'dark'] as const)('theme-%s', themeName => {
    it.snapshot.each<SwitchProps['size']>(['sm', 'lg'])('size-%s-unchecked', size => (
      <ThemeProvider theme={themes[themeName]}>
        <div style={{padding: 8}}>
          <Switch size={size} onChange={() => {}} />
        </div>
      </ThemeProvider>
    ));

    it.snapshot.each<SwitchProps['size']>(['sm', 'lg'])('size-%s-checked', size => (
      <ThemeProvider theme={themes[themeName]}>
        <div style={{padding: 8}}>
          <Switch checked size={size} onChange={() => {}} />
        </div>
      </ThemeProvider>
    ));

    it.snapshot('disabled-unchecked', () => (
      <ThemeProvider theme={themes[themeName]}>
        <div style={{padding: 8}}>
          <Switch disabled onChange={() => {}} />
        </div>
      </ThemeProvider>
    ));

    it.snapshot('disabled-checked', () => (
      <ThemeProvider theme={themes[themeName]}>
        <div style={{padding: 8}}>
          <Switch checked disabled onChange={() => {}} />
        </div>
      </ThemeProvider>
    ));
  });
});
```

### 包含多个相互独立的变体 props 的组件（Alert 风格）

当一个组件包含多个可独立组合且有实际意义的布尔或变体 props 时，请为每种组合分别添加 `it.snapshot.each` 块：

```tsx
describe('Alert', () => {
  describe.each(['light', 'dark'] as const)('%s', themeName => {
    // Primary variants
    it.snapshot.each<AlertProps['variant']>([
      'info',
      'warning',
      'success',
      'danger',
      'muted',
    ])(
      '%s',
      variant => (
        <ThemeProvider theme={themes[themeName]}>
          <div style={{padding: 8, width: 400}}>
            <Alert variant={variant}>This is a {variant} alert</Alert>
          </div>
        </ThemeProvider>
      ),
      variant => ({theme: themeName, variant: String(variant)})
    );

    // Modifier combination: same variants but with showIcon={false}
    it.snapshot.each<AlertProps['variant']>([
      'info',
      'warning',
      'success',
      'danger',
      'muted',
    ])(
      '%s-no-icon',
      variant => (
        <ThemeProvider theme={themes[themeName]}>
          <div style={{padding: 8, width: 400}}>
            <Alert variant={variant} showIcon={false}>
              This is a {variant} alert without icon
            </Alert>
          </div>
        </ThemeProvider>
      ),
      variant => ({theme: themeName, variant: String(variant), showIcon: 'false'})
    );
  });
});
```

## 反模式

```tsx
// ❌ Don't import theme from the barrel re-export
import {theme} from 'sentry/utils/theme';

// ✅ Import directly and suppress the lint warning
// eslint-disable-next-line no-restricted-imports -- SSR snapshot rendering needs direct theme access
import {darkTheme, lightTheme} from 'sentry/utils/theme/theme';
```

```tsx
// ❌ Don't omit the metadata argument — snapshot names become ambiguous
it.snapshot.each<Props['variant']>(['a', 'b'])('%s', variant => (
  <Component variant={variant} />
));

// ✅ Include metadata that reflects all varying props
it.snapshot.each<Props['variant']>(['a', 'b'])(
  '%s',
  variant => <Component variant={variant} />,
  variant => ({theme: themeName, variant: String(variant)})
);
```

```tsx
// ❌ Don't snapshot implementation-detail props like className or style
it.snapshot('custom-class', () => <Component className="foo" />);
```

```tsx
// ❌ Don't use @sentry/scraps barrel import for components not in the scraps package
import {Badge} from '@sentry/scraps/badge'; // if Badge isn't published there

// ✅ Use the direct path with the no-core-import suppression comment
// eslint-disable-next-line @sentry/scraps/no-core-import -- SSR snapshot needs direct import to avoid barrel re-exports with heavy deps
import {Badge} from 'sentry/components/core/badge/badge';
```

## 检查清单

完成前：

- [ ] 文件命名为 `<component-name>.snapshots.tsx`，并与组件放置在同一位置
- [ ] 通过 `describe.each` 覆盖 `light` 和 `dark` 两种主题
- [ ] 为所有主要的变体/优先级属性生成快照
- [ ] 交互式组件包含禁用以及选中/未选中状态
- [ ] 主题导入处存在 `no-restricted-imports` ESLint 抑制注释
- [ ] 调用 `it.snapshot.each` 时提供了元数据参数
- [ ] 为必需的事件属性提供空操作处理程序（`onChange={() => {}}`）
- [ ] 如果可用，导入路径使用 `@sentry/scraps/<name>`；否则，使用直接的 `sentry/components/...` 路径并添加 `no-core-import` 抑制注释