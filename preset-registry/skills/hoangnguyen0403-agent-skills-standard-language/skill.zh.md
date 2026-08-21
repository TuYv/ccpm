---
name: JavaScript Language Patterns
description: Modern JavaScript (ES2022+) patterns for clean, maintainable code.
metadata:
  labels: [javascript, language, es6, modern-js]
  triggers:
    files: ['**/*.js', '**/*.mjs', '**/*.cjs']
    keywords:
      [const, let, arrow, async, await, promise, destructuring, spread, class]
---
# JavaScript 语言模式

## **优先级：P0（关键）**

用于编写整洁、可维护代码的现代 JavaScript 标准。

## 实施指南

- **变量**：默认使用 `const`。需要时使用 `let`。禁止使用 `var`。
- **函数**：回调使用箭头函数。顶层函数使用函数声明。
- **异步**：使用 `async/await` + `try/catch`。
- **对象**：使用解构、展开运算符 `...`、可选链 `?.`、空值合并运算符 `??`。
- **字符串**：使用模板字面量 `${}`。
- **数组**：使用 `map`、`filter`、`reduce`。禁止使用循环。
- **模块**：使用 ESM `import`/`export`。仅导出必要内容。
- **类**：使用 `#private` 字段实现真正的私有性。

## 反模式

- **禁止使用 `var`**：仅使用块级作用域。
- **禁止使用 `==`**：使用严格相等运算符 `===`。
- **禁止使用 `new Object()`**：使用对象字面量 `{}`。
- **禁止使用回调**：将所有内容 Promise 化。
- **禁止修改**：不可变性优先。

## 代码

```javascript
// Modern Syntax
const [x, ...rest] = items;
const name = user?.profile?.name ?? 'Guest';

// Async
async function getUser(id) {
  try {
    const res = await fetch(`/api/${id}`);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Class + Private
class Service {
  #key;
  constructor(k) {
    this.#key = k;
  }
}
```

## 参考资料与示例

有关高级模式和函数式编程：
请参阅 [references/REFERENCE.md](references/REFERENCE.md)。

## 相关主题

最佳实践 | 工具链