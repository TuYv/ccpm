---
name: typescript
description: TypeScript strict mode with eslint and jest
when-to-use: When working on TypeScript files
user-invocable: false
paths: ["**/*.ts", "**/*.tsx", "tsconfig*.json"]
effort: medium
---
# TypeScript 技能


---

## 严格模式（不可妥协）

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## 项目结构

```
project/
├── src/
│   ├── core/               # Pure business logic
│   │   ├── types.ts        # Domain types/interfaces
│   │   ├── services/       # Pure functions
│   │   └── index.ts        # Public API
│   ├── infra/              # Side effects
│   │   ├── api/            # HTTP handlers
│   │   ├── db/             # Database operations
│   │   └── external/       # Third-party integrations
│   └── utils/              # Shared utilities
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

---

## 工具链（必需）

```json
// package.json scripts
{
  "scripts": {
    "lint": "eslint src/ --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "format": "prettier --write 'src/**/*.ts'"
  }
}
```

```javascript
// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      'max-lines-per-function': ['error', 20],
      'max-depth': ['error', 2],
      'max-params': ['error', 3],
    }
  }
);
```

---

## 使用 Jest 进行测试

```typescript
// tests/unit/services/user.test.ts
import { calculateTotal } from '../../../src/core/services/pricing';

describe('calculateTotal', () => {
  it('returns sum of item prices', () => {
    // Arrange
    const items = [{ price: 10 }, { price: 20 }];

    // Act
    const result = calculateTotal(items);

    // Assert
    expect(result).toBe(30);
  });

  it('returns zero for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('throws on invalid item', () => {
    expect(() => calculateTotal([{ invalid: 'item' }])).toThrow();
  });
});
```

---

## GitHub Actions

```yaml
name: TypeScript Quality Gate

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint
        
      - name: Type Check
        run: npm run typecheck
        
      - name: Test with Coverage
        run: npm run test:coverage
        
      - name: Coverage Threshold (80%)
        run: npm run test:coverage -- --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

---

## 提交前钩子

使用 Husky + lint-staged：

```bash
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
npx tsc --noEmit
npm run test -- --onlyChanged --passWithNoTests
```

每次提交时都会运行：
1. 对暂存文件运行 ESLint + Prettier
2. 对整个项目进行类型检查
3. 仅对发生更改的文件运行测试

---

## 类型模式

### 用于结果的判别联合
```typescript
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function parseUser(data: unknown): Result<User> {
  // Type-safe error handling without exceptions
}
```

### 用于 ID 的品牌类型
```typescript
type UserId = string & { readonly brand: unique symbol };
type OrderId = string & { readonly brand: unique symbol };

// Can't accidentally pass UserId where OrderId expected
function getOrder(orderId: OrderId): Order { ... }
```

### 用于字面量的 const 断言
```typescript
const STATUSES = ['pending', 'active', 'closed'] as const;
type Status = typeof STATUSES[number]; // 'pending' | 'active' | 'closed'
```

### 使用 Zod 进行运行时验证
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

type User = z.infer<typeof UserSchema>;
```

---

## TypeScript 反模式

- ❌ `any` 类型——使用 `unknown` 并进行收窄
- ❌ 类型断言（`as`）——使用类型守卫
- ❌ 非空断言（`!`）——显式处理 null
- ❌ 不加解释地使用 `@ts-ignore`
- ❌ 枚举——使用 const 对象或联合类型
- ❌ 用类表示数据——使用接口/类型
- ❌ 默认导出——使用具名导出