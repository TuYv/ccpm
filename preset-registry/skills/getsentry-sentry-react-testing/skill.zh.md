---
name: react-testing
description: Write and review React/TypeScript tests for Sentry's frontend using Jest and React Testing Library. Use when adding or editing tests in static/ (*.spec.tsx), writing component/hook tests, mocking API responses with MockApiClient, testing routing or network requests, or when asked to "write a frontend test", "add a React test", "test this component", or "fix a flaky RTL test".
---
# React 测试指南

## 测试理念

- **以用户为中心的测试**：编写贴近用户与应用交互方式的测试。
- **避免实现细节**：关注行为，而不是组件的内部结构。
- **不要在测试之间共享状态**：测试行为不应受到测试套件中其他测试的影响。

## 导入

**始终**从 `sentry-test/reactTestingLibrary` 导入，而不是直接从 `@testing-library/react` 导入：

```tsx
import {
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from 'sentry-test/reactTestingLibrary';
```

## 查询优先级（按优先顺序排列）

1. **`getByRole`** - 大多数元素的首选选择器

   ```tsx
   screen.getByRole('button', {name: 'Save'});
   screen.getByRole('textbox', {name: 'Search'});
   ```

2. **`getByLabelText`/`getByPlaceholderText`** - 用于表单元素

   ```tsx
   screen.getByLabelText('Email Address');
   screen.getByPlaceholderText('Enter Search Term');
   ```

3. **`getByText`** - 用于非交互式元素

   ```tsx
   screen.getByText('Error Message');
   ```

4. **`getByTestId`** - 仅作为最后手段
   ```tsx
   screen.getByTestId('custom-component');
   ```

## 最佳实践

### 避免模拟钩子、函数或组件

不要使用 `jest.mocked()`。

```tsx
// ❌ Don't mock hooks
jest.mocked(useDataFetchingHook)

// ✅ Set the response data
MockApiClient.addMockResponse({
    url: '/data/',
    body: DataFixture(),
})

// ❌ Don't mock contexts
jest.mocked(useOrganization)

// ✅ Use the provided organization config on render()
render(<Component />, {organization: OrganizationFixture({...})})

// ❌ Don't mock router hooks
jest.mocked(useLocation)

// ✅ Use the provided router config
render(<TestComponent />, {
  initialRouterConfig: {
    location: {
      pathname: "/foo/",
    },
  },
});

// ❌ Don't mock page filters hook
jest.mocked(usePageFilters)

// ✅ Update the corresponding data store with your data
PageFiltersStore.onInitializeUrlState(
    PageFiltersFixture({ projects: [1]}),
)

// ❌ Don't recreate the basic context providers
renderHook(useNavigate, {
  wrapper: (children) => (<AllTheProviders>{children}</AllTheProviders>),
})

// ✅ Use the provided helpers that mock everything
renderHookWithProviders(useNavigate)
```

### 使用夹具

Sentry 夹具位于 tests/js/fixtures/，而 GetSentry 夹具位于 tests/js/getsentry-test/fixtures/。

```tsx

// ❌ Don't import type and initialize it
import type {Project} from 'sentry/types/project';
const project: Project = {...}

// ✅ Import a fixture instead
import {ProjectFixture} from 'sentry-fixture/project';

const project = ProjectFixture(partialProject)

```

### 使用 `screen` 而不是解构

```tsx
// ❌ Don't do this
const {getByRole} = render(<Component />);

// ✅ Do this
render(<Component />);
const button = screen.getByRole('button');
```

### 查询选择指南

- 对于应当存在的元素，使用 `getBy...`
- 仅在检查元素不存在时使用 `queryBy...`
- 等待元素出现时，使用 `await findBy...`

```tsx
// ❌ Wrong
expect(screen.queryByRole('alert')).toBeInTheDocument();

// ✅ Correct
expect(screen.getByRole('alert')).toBeInTheDocument();
expect(screen.queryByRole('button')).not.toBeInTheDocument();
```

### 异步测试

```tsx
// ❌ Don't use waitFor for appearance
await waitFor(() => {
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

// ✅ Use findBy for appearance
expect(await screen.findByRole('alert')).toBeInTheDocument();

// ✅ Use waitForElementToBeRemoved for disappearance
await waitForElementToBeRemoved(() => screen.getByRole('alert'));
```

### 避免等待加载指示器

不要对加载指示器使用带有 `.not.toBeInTheDocument()` 的 `findBy`。如果找不到元素，`findBy` 会报错，但我们断言的是它不应存在。加载指示器也很不稳定，因为它们只会在屏幕上短暂出现几个时刻。

```tsx
// ❌ Wrong - findBy errors if element not found, and loading indicators are flakey
expect(await screen.findByTestId('loading-indicator')).not.toBeInTheDocument();

// ✅ Correct - wait for the actual content you care about
await waitFor(() => {
  expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
});

// ✅ Also correct - use findBy on the content that appears after loading
expect(await screen.findByRole('button', {name: 'Submit'})).toBeInTheDocument();
```

### 用户交互

```tsx
// ❌ Don't use fireEvent
fireEvent.change(input, {target: {value: 'text'}});

// ✅ Use userEvent
await userEvent.click(input);
await userEvent.keyboard('text');
```

### 测试路由

```tsx
const {router} = render(<TestComponent />, {
  initialRouterConfig: {
    location: {
      pathname: '/foo/',
      query: {page: '1'},
    },
  },
});
// Uses passes in config to set initial location
expect(router.location.pathname).toBe('/foo');
expect(router.location.query.page).toBe('1');
// Clicking links goes to the correct location
await userEvent.click(screen.getByRole('link', {name: 'Go to /bar/'}));
// Can check current route on the returned router
expect(router.location.pathname).toBe('/bar/');
// Can test manual route changes with router.navigate
router.navigate('/new/path/');
router.navigate(-1); // Simulates clicking the back button
```

如果组件使用 `useParams()`，则可以使用 `route` 属性：

```tsx
function TestComponent() {
  const {id} = useParams();
  return <div>{id}</div>;
}
const {router} = render(<TestComponent />, {
  initialRouterConfig: {
    location: {
      pathname: '/foo/123/',
    },
    route: '/foo/:id/',
  },
});
expect(screen.getByText('123')).toBeInTheDocument();
```

### 测试会发起网络请求的组件

```tsx
// Simple GET request
MockApiClient.addMockResponse({
  url: '/projects/',
  body: [{id: 1, name: 'my project'}],
});

// POST request
MockApiClient.addMockResponse({
  url: '/projects/',
  method: 'POST',
  body: {id: 1, name: 'my project'},
});

// Complex matching with query params and request body
MockApiClient.addMockResponse({
  url: '/projects/',
  method: 'POST',
  body: {id: 2, name: 'other'},
  match: [
    MockApiClient.matchQuery({param: '1'}),
    MockApiClient.matchData({name: 'other'}),
  ],
});

// Error responses
MockApiClient.addMockResponse({
  url: '/projects/',
  body: {
    detail: 'Internal Error',
  },
  statusCode: 500,
});
```

#### 始终等待异步断言

网络请求是异步的。请始终使用 `findBy` 查询，或正确等待断言：

```tsx
// ❌ Wrong - will fail intermittently
expect(screen.getByText('Loaded Data')).toBeInTheDocument();

// ✅ Correct - waits for element to appear
expect(await screen.findByText('Loaded Data')).toBeInTheDocument();
```

#### 处理数据变更中的重新获取

测试会触发数据重新获取的数据变更时，请在重新获取发生之前更新模拟响应：

```tsx
it('adds item and updates list', async () => {
  // Initial empty state
  MockApiClient.addMockResponse({
    url: '/items/',
    body: [],
  });

  const createRequest = MockApiClient.addMockResponse({
    url: '/items/',
    method: 'POST',
    body: {id: 1, name: 'New Item'},
  });

  render(<ItemList />);

  await userEvent.click(screen.getByRole('button', {name: 'Add Item'}));

  // CRITICAL: Override mock before refetch happens
  MockApiClient.addMockResponse({
    url: '/items/',
    body: [{id: 1, name: 'New Item'}],
  });

  await waitFor(() => expect(createRequest).toHaveBeenCalled());
  expect(await screen.findByText('New Item')).toBeInTheDocument();
});
```