---
name: jsdoc
description: Full JSDoc format guide for TypeScript, covering @example formats (short, multi-line, multi-variant), tag usage (@default, @deprecated, what to avoid), documentation patterns for properties/enums/functions, and tag order.
---
# JSDoc

详细的 JSDoc 格式指南，包含各种情况的示例。始终适用的基本要求位于
`jsdoc` 规则中。需要完整参考时，请查阅此处。

## `@example` 格式

### 简短单行示例：标签与 `@example` 位于同一行，代码以行内反引号形式置于下一行

```typescript
/**
 * @example Required parameter
 * `name: Type`
 *
 * @example Optional parameter
 * `name?: Type`
 */
```

### 多行示例：紧跟在 `@example` 之后使用围栏代码块

````typescript
/**
 * @example
 * ```ts
 * const result = buildParams(node, {
 *   paramsType: 'inline',
 * })
 * ```
 */
````

### 多种变体：使用多个 `@example` 块

```typescript
/**
 * @example Object mode
 * `{ id, data, params }: { id: string; data: Data; params?: QueryParams }`
 *
 * @example Inline mode
 * `id: string, data: Data, params?: QueryParams`
 */
```

### 规则

| 规则                    | 正确                                | 错误                                         |
| ----------------------- | ----------------------------------- | -------------------------------------------- |
| 标签 + 行内代码         | `@example Required\n\`name: Type\`` | `@example \`name: Type\``（代码位于标签行）  |
| 多行代码                | 围栏 ` ```ts ``` ` 代码块           | 未使用围栏的裸代码行                         |
| 简短示例                | 行内反引号                          | 三反引号围栏（过于繁重）                     |
| 每个示例只关注一件事    | 独立的 `@example` 块                | 一个示例涵盖所有情况                         |

## 标签

### 经常使用

| 标签          | 用途             | 说明                                                     |
| ------------- | ---------------- | -------------------------------------------------------- |
| `@default`    | 默认值           | 仅在默认值不明显时使用（若为 `undefined` 则省略）       |
| `@example`    | 用法示例         | 对于复杂或具有多种变体的 API，优先使用                   |
| `@note`       | 重要注意事项     | 版本信息、破坏性变更                                     |
| `@deprecated` | 标记为已弃用     | 包含迁移路径                                             |

### 谨慎使用

| 标签        | 用途               |
| ----------- | ------------------ |
| `@see`      | 引用外部文档       |
| `@internal` | 内部 API           |
| `@beta`     | 实验性功能         |

### 避免使用（TypeScript 已提供这些信息）

- `@param`：使用 TypeScript 参数类型
- `@returns`：使用 TypeScript 返回类型
- `@type`：使用 TypeScript 类型注解
- `@typedef`：使用 `type` 或 `interface`
- `@default undefined`：可选标记（`?`）已隐含此含义

## 文档编写模式

### 简单属性：始终使用多行格式

```typescript
/**
 * Output directory for generated files.
 */
outDir?: string
```

切勿使用单行 `/** description */`。始终展开为多行格式。

### 具有非显而易见默认值的属性

```typescript
/**
 * Maximum number of concurrent callbacks during traversal.
 * Higher values overlap I/O-bound work; lower values reduce memory pressure.
 *
 * @default 30
 */
concurrency?: number
```

当 TypeScript 类型已经明确表明默认值时，不要添加 `@default false` 或 `@default undefined`。

### 包含选项的枚举或联合类型

```typescript
/**
 * How path parameters are emitted in the function signature.
 * - `'object'` groups them as a single destructured parameter
 * - `'inline'` spreads them as individual parameters
 * - `'inlineSpread'` emits a single rest parameter
 */
pathParamsType: 'object' | 'inline' | 'inlineSpread'
```

### 嵌套属性：每个字段都有各自的多行 JSDoc

```typescript
names?: {
  /**
   * Name for the request body parameter.
   * @default 'data'
   */
  data?: string
  /**
   * Name for the query parameters group parameter.
   * @default 'params'
   */
  params?: string
}
```

### 函数文档

仅当 JSDoc 能提供函数签名之外的额外价值时才添加：

```typescript
// No JSDoc needed: the signature is self-explanatory
function camelCase(str: string): string { ... }

// JSDoc adds value: it explains behavior and non-obvious edge cases
/**
 * Returns `true` when the schema resolves to a plain string output.
 *
 * - `string`, `uuid`, `email`, `url`, `datetime` are always plain strings.
 * - `date` and `time` are plain strings when their `representation` is `'string'`.
 */
function isStringType(node: SchemaNode): boolean { ... }
```

## 指南

应该：

- 说明属性的作用，而不是它的 TypeScript 类型
- 为每个导出的类型、属性和函数添加 JSDoc 注释
- 始终使用多行 JSDoc 块
- 使用具体、完整的句子进行描述
- 仅当默认值不明显时才包含 `@default`
- 针对不同变体使用多个 `@example` 块
- 保持 `@example` 标签简短且具有描述性

不应该：

- 编写单行 `/** description */`
- 编写 `@default undefined`
- 将代码直接放在 `@example` 所在行
- 使用 `@param` 或 `@returns` 标签
- 为简单且不言自明的属性编写过多文档

## 标签顺序

1. 描述（必需）
2. 变体或行为的项目符号列表（如适用）
3. `@default`（如果默认值不明显）
4. `@example`（一个或多个）
5. `@note`（如需要）
6. `@deprecated`（如适用）
7. `@see`（如果提供参考信息）