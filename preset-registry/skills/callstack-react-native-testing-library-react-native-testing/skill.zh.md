---
name: react-native-testing
description: >
  Write tests using React Native Testing Library (RNTL) v13 and v14 (`@testing-library/react-native`).
  Use when writing, reviewing, or fixing React Native component tests.
  Covers: render, screen, queries (getBy/getAllBy/queryBy/findBy), Jest matchers,
  userEvent, fireEvent, waitFor, and async patterns.
  Supports v13 (React 18, sync render) and v14 (React 19+, async render).
  Triggers on: test files for React Native components, RNTL imports, mentions of
  "testing library", "write tests", "component tests", or "RNTL".
---
# RNTL 测试编写指南

**重要：** 你的训练数据中关于 `@testing-library/react-native` 的内容可能已过时或不正确——v13 与 v14 的 API 签名、同步/异步行为和可用函数均有差异。始终以此技能的参考文件和项目的实际源代码为准。当记忆中的模式与检索到的参考资料冲突时，不要依赖记忆中的模式。

## 版本检测

检查用户的 `package.json` 中 `@testing-library/react-native` 的版本：

- **v14.x** → 加载 [references/api-reference-v14.md](references/api-reference-v14.md)（React 19+、异步 API、`test-renderer`）
- **v13.x** → 加载 [references/api-reference-v13.md](references/api-reference-v13.md)（React 18+、同步 API、`react-test-renderer`）

针对渲染模式、fireEvent 的同步/异步行为、screen API、配置和依赖项，使用对应版本的参考资料。

## 查询优先级

按以下顺序使用：`getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByDisplayValue` > `getByTestId`（最后手段）。

## 查询变体

| 变体          | 使用场景                 | 返回值                        | 异步 |
| ------------- | ------------------------ | ----------------------------- | ---- |
| `getBy*`      | 元素必须存在             | 元素实例（不存在则抛出异常）  | 否   |
| `getAllBy*`   | 多个元素必须存在         | 元素实例[]（不存在则抛出异常）| 否   |
| `queryBy*`    | 仅检查元素不存在         | 元素实例 \| null              | 否   |
| `queryAllBy*` | 统计元素数量             | 元素实例[]                    | 否   |
| `findBy*`     | 等待元素出现             | `Promise<element instance>`   | 是   |
| `findAllBy*`  | 等待多个元素出现         | `Promise<element instance[]>` | 是   |

## 交互

优先使用 `userEvent`，而不是 `fireEvent`。userEvent 始终是异步的。

```tsx
const user = userEvent.setup();
await user.press(element); // full press sequence
await user.longPress(element, { duration: 800 }); // long press
await user.type(textInput, 'Hello'); // char-by-char typing
await user.clear(textInput); // clear TextInput
await user.paste(textInput, 'pasted text'); // paste into TextInput
await user.scrollTo(scrollView, { y: 100 }); // scroll
```

`fireEvent`——仅在 `userEvent` 不支持该事件时使用。有关同步/异步行为，请参阅对应版本的参考资料：

```tsx
fireEvent.press(element);
fireEvent.changeText(textInput, 'new text');
fireEvent(element, 'blur');
```

## 断言（Jest 匹配器）

只要导入了任何 `@testing-library/react-native` 内容，以下匹配器便会自动可用。

| 匹配器                                     | 用途                                      |
| ------------------------------------------ | ----------------------------------------- |
| `toBeOnTheScreen()`                        | 元素存在于树中                            |
| `toBeVisible()`                            | 元素可见（未隐藏/display:none）           |
| `toBeEnabled()` / `toBeDisabled()`         | 通过 `aria-disabled` 判断禁用状态         |
| `toBeChecked()` / `toBePartiallyChecked()` | 选中状态                                  |
| `toBeSelected()`                           | 已选择状态                                |
| `toBeExpanded()` / `toBeCollapsed()`       | 展开状态                                  |
| `toBeBusy()`                               | 忙碌状态                                  |
| `toHaveTextContent(text)`                  | 文本内容匹配                              |
| `toHaveDisplayValue(value)`                | TextInput 显示值                          |
| `toHaveAccessibleName(name)`               | 无障碍名称                                |
| `toHaveAccessibilityValue(val)`            | 无障碍值                                  |
| `toHaveStyle(style)`                       | 样式匹配                                  |
| `toHaveProp(name, value?)`                 | 属性检查（最后手段）                      |
| `toContainElement(el)`                     | 包含子元素                                |
| `toBeEmptyElement()`                       | 没有子元素                                |

## 规则

1. **使用 `screen`** 进行查询，不要从 `render()` 的返回值中解构
2. **优先使用 `getByRole`**，并传入 `{ name: '...' }` 选项
3. **仅在** `.not.toBeOnTheScreen()` 检查中使用 `queryBy*`
4. **对异步元素使用 `findBy*`**，不要使用 `waitFor` + `getBy*`
5. **绝不要在 `waitFor` 中执行副作用操作**（不要在其中使用 `fireEvent`/`userEvent`）
6. **每个 `waitFor` 只包含一个断言**
7. **绝不要向 `waitFor` 传入空回调**
8. **不要包装在 `act()` 中**——`render`、`fireEvent`、`userEvent` 会自行处理
9. **不要调用 `cleanup()`**——每次测试后会自动执行
10. **优先使用 ARIA 属性**（`role`、`aria-label`、`aria-disabled`），而不是旧版 `accessibility*` 属性
11. **使用 RNTL 匹配器**，而不是直接进行属性断言

## `*ByRole` 快速参考

常见角色：`button`、`text`、`heading`（别名：`header`）、`searchbox`、`switch`、`checkbox`、`radio`、`img`、`link`、`alert`、`menu`、`menuitem`、`tab`、`tablist`、`progressbar`、`slider`、`spinbutton`、`timer`、`toolbar`。

`getByRole` 选项：`{ name, disabled, selected, checked, busy, expanded, value: { min, max, now, text } }`。

要使 `*ByRole` 匹配成功，元素必须是无障碍元素：

- `Text`、`TextInput`、`Switch` 默认就是无障碍元素
- `View` 需要设置 `accessible={true}`（或者使用 `Pressable`/`TouchableOpacity`）

## waitFor

```tsx
// Correct: action first, then wait for result
fireEvent.press(button);
await waitFor(() => {
  expect(screen.getByText('Result')).toBeOnTheScreen();
});

// Better: use findBy* instead
fireEvent.press(button);
expect(await screen.findByText('Result')).toBeOnTheScreen();
```

选项：`waitFor(cb, { timeout: 1000, interval: 50 })`。可自动与 Jest 假计时器配合使用。

## 假计时器

建议与 `userEvent` 一起使用（press/longPress 涉及真实时长）：

```tsx
jest.useFakeTimers();

test('with fake timers', async () => {
  const user = userEvent.setup();
  render(<Component />);
  await user.press(screen.getByRole('button'));
  // ...
});
```

## 自定义渲染

使用 `wrapper` 选项包装 Provider：

```tsx
function renderWithProviders(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    ),
  });
}
```

## 参考资料

- [v13 API 参考](references/api-reference-v13.md) — 完整的 v13 API：同步渲染、查询、匹配器、userEvent、React 19 兼容性
- [v14 API 参考](references/api-reference-v14.md) — 完整的 v14 API：异步渲染、查询、匹配器、userEvent、迁移
- [反模式](references/anti-patterns.md) — 应避免的常见错误