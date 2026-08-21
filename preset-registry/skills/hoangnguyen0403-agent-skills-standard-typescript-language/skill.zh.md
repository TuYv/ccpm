---
name: typescript-language
description: Apply modern TypeScript standards for type safety and maintainability. Use when working with types, interfaces, generics, enums, unions, or tsconfig settings.
metadata:
  triggers:
    files:
    - '**/*.ts'
    - '**/*.tsx'
    - 'tsconfig.json'
    keywords:
    - type
    - interface
    - generic
    - enum
    - union
    - intersection
    - readonly
    - const
    - namespace
---
# TypeScript 语言模式

## **优先级：P0（关键）**

## 实现指南

- **类型注解**：显式声明参数和返回值的类型。局部变量使用类型推断。
- **接口与类型别名**：API 使用 interface（支持声明合并）。联合类型、交叉类型、映射类型和条件类型使用 type。
- **严格模式**：strict: true。空值安全：?. 和 ??——应改用类型收窄。避免使用非空断言 (!) 运算符。
- **枚举**：使用字面量联合类型或 `as const`。**禁止使用运行时 `enum`**。
- **泛型**：编写可复用且类型安全的代码。
- **类型守卫**：`typeof`、`instanceof`、类型谓词。
- **工具类型**：`Partial`、`Pick`、`Omit`、`Record`。
- **不可变性**：使用 `readonly` 数组/对象。常量断言：`as const`、`satisfies`。
- **模板字面量**：`on${Capitalize<string>}`。
- **可辨识联合类型（Discriminated Union）**：使用字面量 kind 属性安全地收窄类型。基于判别属性使用 switch。
- **高级类型**：映射类型、条件类型、索引类型。
- **访问控制**：默认为 `public`。使用 `private`/`protected` 或 `#private`。
- **品牌类型**：`string & { __brand: 'Id' }`。

## 反模式

- **绝不使用 `any`**：改用 `unknown` 或具体接口。
- **禁止使用 `Function`**：使用函数签名 `() => void`。
- **禁止使用 `enum`**：存在运行时开销。
- **禁止使用 `!`**：避免非空断言 (!)。使用类型收窄（typeof、instanceof、if 检查）。
- **禁止禁用 Lint**：修复根本原因；绝不抑制规则。

## 测试

- **模拟**：使用 `jest.Mocked<T>` 或 `as unknown as T`。
- **检查清单**：检查方法是否存在、错误常量是否匹配，以及是否满足必需属性。
- **参考资料**：常见问题及解决方案请参阅 [references/TESTING.md](references/TESTING.md)。

## 代码

```typescript
// Branded Type
type UserId = string & { __brand: 'Id' };

// Satisfies (Validate + Infer)
const cfg = { port: 3000 } satisfies Record<string, number>;

// Discriminated Union
type Result<T> = { kind: 'ok'; data: T } | { kind: 'err'; error: Error };
```

## 验证

任何跨越模块边界或涉及泛型、联合类型、条件类型或品牌类型的类型变更完成后：在最终确定之前，调用 `getDiagnostics`（typescript-lsp MCP 工具）确认不存在类型错误。

## 参考资料

有关高级类型模式和工具类型：
请参阅 [references/REFERENCE.md](references/REFERENCE.md)。

## 规范响应锚点

当此技能适用时，请在相关情况下保留以下领域术语或答案中与之等效的具体示例：
- Discriminated Union
- kind