---
name: react-native
description: React Native mobile patterns, platform-specific code
when-to-use: When working on React Native mobile app code
user-invocable: false
paths: ["**/*.tsx", "**/*.jsx", "ios/**", "android/**", "app.json"]
effort: medium
---
# React Native 技能


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
│   │   │   └── index.ts
│   │   └── index.ts            # Barrel export
│   ├── screens/                # Screen components
│   │   ├── Home/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── useHome.ts      # Screen-specific hook
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── navigation/             # Navigation configuration
│   ├── hooks/                  # Shared custom hooks
│   ├── store/                  # State management
│   └── utils/                  # Utilities
├── __tests__/
├── android/
├── ios/
└── CLAUDE.md
```

---

## 组件模式

### 仅使用函数组件
```typescript
// Good - simple, testable
interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function Button({ label, onPress, disabled = false }: ButtonProps): JSX.Element {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Text>{label}</Text>
    </Pressable>
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

  return { items, loading, refresh };
}

// HomeScreen.tsx - pure presentation
export function HomeScreen(): JSX.Element {
  const { items, loading, refresh } = useHome();
  
  return (
    <ItemList items={items} loading={loading} onRefresh={refresh} />
  );
}
```

### 始终显式定义 Props 接口
```typescript
// Always define props interface, even if simple
interface ItemCardProps {
  item: Item;
  onPress: (id: string) => void;
}

export function ItemCard({ item, onPress }: ItemCardProps): JSX.Element {
  ...
}
```

---

## 状态管理

### 优先使用局部状态
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
  setUser: (user: User | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### 使用 React Query 管理服务端状态
```typescript
// hooks/useItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

---

## 测试

### 使用 React Native Testing Library 进行组件测试
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Click me" onPress={onPress} />);
    
    fireEvent.press(getByText('Click me'));
    
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Click me" onPress={onPress} disabled />);
    
    fireEvent.press(getByText('Click me'));
    
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### Hook 测试
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
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

---

## 平台特定代码

### 谨慎使用 Platform.select
```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
    },
    android: {
      elevation: 2,
    },
  }),
});
```

### 对复杂差异使用独立文件
```
Component/
├── Component.tsx          # Shared logic
├── Component.ios.tsx      # iOS-specific
├── Component.android.tsx  # Android-specific
└── index.ts
```

---

## React Native 反模式

- ❌ 内联样式——使用 StyleSheet.create
- ❌ 在渲染过程中包含逻辑——提取到 Hook 中
- ❌ 组件嵌套过深——扁平化层级结构
- ❌ 在 props 中使用匿名函数——使用 useCallback
- ❌ 在列表中使用索引作为 key——使用稳定的 ID
- ❌ 直接修改状态——始终使用 setter
- ❌ 将业务逻辑与 UI 混合——保持 core/ 纯粹
- ❌ 忽略 TypeScript 错误——修复它们
- ❌ 组件过大——拆分成更小的部分