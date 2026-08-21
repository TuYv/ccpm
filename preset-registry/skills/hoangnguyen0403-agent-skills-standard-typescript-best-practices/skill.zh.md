---
name: typescript-best-practices
description: Write idiomatic TypeScript patterns for clean, maintainable code. Use when writing or refactoring TypeScript classes, functions, modules, or async logic.
metadata:
  triggers:
    files:
    - '**/*.ts'
    - '**/*.tsx'
    keywords:
    - class
    - function
    - module
    - import
    - export
    - async
    - promise
---
# TypeScript 最佳实践

## **优先级：P1（高）**

## 实现指南

- **命名**：类、类型和接口使用 **`PascalCase`**，变量和函数使用 **`camelCase`**，静态常量使用 **`UPPER_SNAKE`**。
- **函数**：回调和逻辑使用 **`arrow functions`**；顶层导出使用 **`function declaration`**。始终为 **`public API`** 的返回值显式指定类型。
- **模块**：仅使用 **`Named exports`**，以便更好地进行重构和自动导入。
- **异步**：使用 **`async/await`**，并通过 **`Promise.all()`** 并行执行。使用 **`try-catch`** 处理错误；将 **`catch(e) as unknown`** 类型化，并在使用前进行类型收窄。避免使用 **`.then().catch()`** 链。
- **类**：显式使用 **`private`**、**`protected`** 和 **`public`** 修饰符。优先使用 **`composition`** 而非继承；为提高可测试性，优先使用基于接口的 **`dependency injection`** 和 **`constructor injection`**，而非单例。
- **类型安全**：在 switch-case 中使用 **`never`** 进行穷尽性检查。
- **可选值**：优先使用 **`optional chaining`**（`?.`）和 **`nullish coalescing`**（`??`），而不是手动检查。
- **导入**：通过 **`eslint-plugin-import`** 自动强制执行 **`external packages → internal modules → relative imports`** 的顺序。对接口和类型使用 **`import type`**，以确保更好的 tree-shaking 且不会产生运行时开销。
- **验证**：使用 **`Zod`** 或 **`Tsoa`** 进行运行时边界验证。

## 反模式

- **禁止默认导出**：使用具名导出。
- **禁止隐式返回**：指定返回类型。
- **禁止未使用的变量**：启用 `noUnusedLocals`。
- **禁止使用 `require`**：使用 ES6 `import`。
- **禁止空接口**：使用 `type` 或非空接口。
- **禁止使用 `any`**：使用 `unknown` 或具体类型。
- **禁止不安全的 Mock**：使用 `jest.Mocked<T>` 或 `as unknown as T` 进行类型转换。
- **禁止 eslint-disable**：修复根本原因；绝不抑制警告。

## 参考资料

有关不可变接口、穷尽性检查、断言函数、依赖注入模式和导入组织方式，请参阅 [references/examples.md](references/examples.md)。

## 规范响应锚点

应用此技能时，请在相关情况下保留以下领域术语或等效的具体示例：
- async/await
- injection