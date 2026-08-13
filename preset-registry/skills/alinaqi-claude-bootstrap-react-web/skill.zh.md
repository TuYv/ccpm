---
name: react-web
description: React web development with hooks, React Query, Zustand
when-to-use: When working on React web components or pages
user-invocable: false
paths: ["**/*.tsx", "**/*.jsx", "src/components/**", "src/pages/**", "src/app/**"]
effort: medium
---
# React Web 技能


---

## 测试优先开发（强制要求）

**关键要求：必须先编写测试，再编写实现代码。对于前端组件，这一点没有商量余地。**

### TFD 工作流程

```
1. Write test file first → Defines expected behavior
2. Run test (it fails) → Confirms test is valid
3. Write minimal code → Just enough to pass
4. Run test (it passes) → Validates implementation
5. Refactor if needed → Tests catch regressions
```

### 组件开发顺序

```bash
# CORRECT ORDER - Test first
1. Create Button.test.tsx    # Write tests for expected behavior
2. Run tests (they fail)     # npm test -- Button
3. Create Button.tsx         # Implement to pass tests
4. Run tests (they pass)     # Verify implementation
5. Create Button.module.css  # Style after logic works

# WRONG ORDER - Never do this
1. Create Button.tsx         # ❌ No tests exist yet
2. Create Button.module.css  # ❌ Still no tests
3. "I'll add tests later"    # ❌ Tests never get written
```

### 测试文件结构（首先创建）

```typescript
// Button.test.tsx - CREATE THIS FIRST
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  // Define ALL expected behaviors upfront
  describe('rendering', () => {
    it('renders with label', () => {
      render(<Button label="Click me" onClick={() => {}} />);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('applies variant class', () => {
      render(<Button label="Click" onClick={() => {}} variant="secondary" />);
      expect(screen.getByRole('button')).toHaveClass('secondary');
    });
  });

  describe('interactions', () => {
    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<Button label="Click me" onClick={onClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn();
      render(<Button label="Click me" onClick={onClick} disabled />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has correct aria attributes when disabled', () => {
      render(<Button label="Click" onClick={() => {}} disabled />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
```

### Hook 测试优先模式

```typescript
// useCounter.test.ts - CREATE THIS FIRST
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('starts at initial value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('increments', () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });

  it('decrements', () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => result.current.decrement());
    expect(result.current.count).toBe(4);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    act(() => result.current.increment());
    act(() => result.current.reset());
    expect(result.current.count).toBe(10);
  });
});
```

### 强制执行检查清单

在编写任何组件/Hook 实现之前：

- [ ] 测试文件已存在：`Component.test.tsx`
- [ ] 所有预期行为都有对应的测试用例
- [ ] 测试已运行且失败（证明测试有效）
- [ ] 只有在此之后才能创建实现文件

**如果跳过测试，Claude 必须：**
```
⚠️ TEST-FIRST VIOLATION

Cannot create [Component].tsx - no test file exists.

Creating [Component].test.tsx first with tests for:
- Rendering with required props
- User interactions
- Edge cases
- Accessibility
```

---

## 项目结构

```
project/
├── src/
│   ├── core/                   # Pure business logic (no React)
│   │   ├── types.ts
│   │   └── services/
│   ├── components/             # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.module.css  # or .styles.ts
│   │   │   └── index.ts
│   │   └── index.ts            # Barrel export
│   ├── pages/                  # Route-level components
│   │   ├── Home/
│   │   │   ├── HomePage.tsx
│   │   │   ├── useHome.ts      # Page-specific hook
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── hooks/                  # Shared custom hooks
│   ├── store/                  # State management
│   ├── api/                    # API client and queries
│   ├── utils/                  # Utilities
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── unit/
│   └── e2e/
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts              # or next.config.js
└── CLAUDE.md
```

---

## 组件模式

### 仅使用函数组件
```typescript
// Good - simple, testable
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({
  label,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps): JSX.Element {
  return (
    <button
      className={styles[variant]}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
```

### 将逻辑提取到 Hook 中
```typescript
// useHome.ts - all logic here
export function useHome() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchItems();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh };
}

// HomePage.tsx - pure presentation
export function HomePage(): JSX.Element {
  const { items, loading, refresh } = useHome();

  if (loading) return <Spinner />;

  return <ItemList items={items} onRefresh={refresh} />;
}
```

### Props 接口始终显式定义
```typescript
// Always define props interface, even if simple
interface ItemCardProps {
  item: Item;
  onClick: (id: string) => void;
}

export function ItemCard({ item, onClick }: ItemCardProps): JSX.Element {
  return (
    <div onClick={() => onClick(item.id)}>
      <h3>{item.title}</h3>
    </div>
  );
}
```

---

## 状态管理

### 优先使用本地状态
```typescript
// Start with useState, escalate only when needed
const [value, setValue] = useState('');
```

### 使用 Zustand 管理全局状态（如有需要）
```typescript
// store/useAppStore.ts
import { create } from 'zustand';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  setUser: (user: User | null) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  theme: 'light',
  setUser: (user) => set({ user }),
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
}));
```

### 使用 React Query 管理服务端状态
```typescript
// api/queries/useItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../client';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: itemsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: itemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

---

## 路由

### React Router（Vite/CRA）
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items/:id" element={<ItemPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 受保护的路由
```typescript
interface ProtectedRouteProps {
  children: JSX.Element;
}

function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { user } = useAppStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

---

## 样式

### CSS Modules（首选）
```typescript
// Button.module.css
.primary {
  background: var(--color-primary);
  color: white;
}

.secondary {
  background: transparent;
  border: 1px solid var(--color-primary);
}

// Button.tsx
import styles from './Button.module.css';

<button className={styles.primary}>Click</button>
```

### Tailwind（替代方案）
```typescript
// Use consistent patterns, extract repeated combinations
const buttonVariants = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  secondary: 'bg-transparent border border-blue-500 text-blue-500',
} as const;

<button className={buttonVariants[variant]}>{label}</button>
```

---

## 表单

### React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm(): JSX.Element {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // handle submit
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 测试

### 使用 React Testing Library 进行组件测试
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button label="Click me" onClick={onClick} />);

    fireEvent.click(screen.getByText('Click me'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button label="Click me" onClick={onClick} disabled />);

    fireEvent.click(screen.getByText('Click me'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies correct variant class', () => {
    render(<Button label="Click" onClick={() => {}} variant="secondary" />);

    expect(screen.getByRole('button')).toHaveClass('secondary');
  });
});
```

### Hook 测试
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### 使用 Playwright 进行 E2E 测试
```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

---

## 性能

### 记忆化
```typescript
// Memoize expensive components
const ItemList = memo(function ItemList({ items }: ItemListProps) {
  return items.map(item => <ItemCard key={item.id} item={item} />);
});

// Memoize callbacks passed to children
const handleClick = useCallback((id: string) => {
  setSelectedId(id);
}, []);

// Memoize expensive computations
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

### 代码分割
```typescript
// Lazy load routes
const ItemPage = lazy(() => import('./pages/Item'));

<Suspense fallback={<Spinner />}>
  <Route path="/items/:id" element={<ItemPage />} />
</Suspense>
```

---

## React Web 反模式

- ❌ 在 JSX 中使用内联函数 - 使用 useCallback
- ❌ 在渲染过程中包含逻辑 - 提取到 hooks 中
- ❌ 组件嵌套过深 - 扁平化层级结构
- ❌ 在列表中使用索引作为 key - 使用稳定的 ID
- ❌ 直接修改状态 - 始终使用 setter
- ❌ Prop 逐层传递超过 2 层 - 使用 context 或状态管理
- ❌ 使用 useEffect 处理派生状态 - 使用 useMemo
- ❌ 在 useEffect 中获取数据 - 使用 React Query
- ❌ 将业务逻辑与 UI 混合 - 保持 core/ 纯净
- ❌ 大型组件（超过 100 行）- 拆分为更小的部分
- ❌ 在 JS 对象中编写 CSS - 使用 CSS modules 或 Tailwind
- ❌ 忽略 TypeScript 错误 - 修复它们