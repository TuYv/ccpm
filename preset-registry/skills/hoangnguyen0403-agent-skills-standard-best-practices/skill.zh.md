---
name: JavaScript Best Practices
description: Idiomatic JavaScript patterns and conventions for maintainable code.
metadata:
  labels: [javascript, best-practices, conventions, code-quality]
  triggers:
    files: ['**/*.js', '**/*.mjs']
    keywords: [module, import, export, error, validation]
---
# JavaScript 最佳实践

## **优先级：P1（操作规范）**

用于编写可维护 JavaScript 的约定和模式。

## 实施指南

- **命名**：变量和函数使用 `camelCase`，类使用 `PascalCase`，常量使用 `UPPER_SNAKE`。
- **错误**：仅抛出 `Error` 对象。处理所有异步错误。
- **注释**：API 使用 JSDoc。解释“为什么”，而不是“做什么”。
- **文件**：每个文件只包含一个实体。使用 `index.js` 导出。
- **模块**：仅使用命名导出。顺序：外部 -> 内部 -> 相对。

## 反模式

- **禁止全局变量**：封装状态。
- **禁止魔法数字**：使用 `const`。
- **禁止嵌套**：使用守卫子句或提前返回。
- **禁止默认导出**：使用命名导出。
- **禁止副作用**：保持函数纯粹。

## 代码

```javascript
// Constants
const STATUS = { OK: 200, ERROR: 500 };

// Errors
class APIError extends Error {
  constructor(msg, code) {
    super(msg);
    this.code = code;
  }
}

// Async + JDoc
/** @throws {APIError} */
export async function getData(id) {
  if (!id) throw new APIError('Missing ID', 400);
  const res = await fetch(`/api/${id}`);
  if (!res.ok) throw new APIError('Failed', res.status);
  return res.json();
}
```

## 参考资料与示例

有关模块模式和项目结构：
请参阅 [references/REFERENCE.md](references/REFERENCE.md)。

## 相关主题

语言 | 工具链