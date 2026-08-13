---
name: migrate-to-shoehorn
description: Migrate test files from `as` type assertions to @total-typescript/shoehorn. Use when user mentions shoehorn, wants to replace `as` in tests, or needs partial test data.
---
# 迁移到 Shoehorn

## 为什么使用 shoehorn？

`shoehorn` 允许你在测试中传递部分数据，同时保持 TypeScript 类型检查正常。它使用类型安全的替代方案取代 `as` 断言。

**仅供测试代码使用。** 切勿在生产代码中使用 shoehorn。

测试中 `as` 的问题：

- 不应使用
- 必须手动指定目标类型
- 对故意错误的数据使用双重断言（`as unknown as Type`）

## 安装

```bash
npm i @total-typescript/shoehorn
```

## 迁移模式

### 只需少量属性的对象

Before:

```ts
type Request = {
  body: { id: string };
  headers: Record<string, string>;
  cookies: Record<string, string>;
  // ...20 more properties
};

it("gets user by id", () => {
  // Only care about body.id but must fake entire Request
  getUser({
    body: { id: "123" },
    headers: {},
    cookies: {},
    // ...fake all 20 properties
  });
});
```

After:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

it("gets user by id", () => {
  getUser(
    fromPartial({
      body: { id: "123" },
    }),
  );
});
```

### `as Type` → `fromPartial()`

Before:

```ts
getUser({ body: { id: "123" } } as Request);
```

After:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

getUser(fromPartial({ body: { id: "123" } }));
```

### `as unknown as Type` → `fromAny()`

Before:

```ts
getUser({ body: { id: 123 } } as unknown as Request); // wrong type on purpose
```

After:

```ts
import { fromAny } from "@total-typescript/shoehorn";

getUser(fromAny({ body: { id: 123 } }));
```

## 各场景使用说明

| 函数            | 使用场景                                           |
| --------------- | -------------------------------------------------- |
| `fromPartial()` | 传入仍能通过类型检查的部分数据                   |
| `fromAny()`     | 传入故意错误的数据（保留自动补全）                |
| `fromExact()`   | 强制完整对象（后续可与 fromPartial 替换）          |

## 工作流程

1. **收集需求** - 询问用户：
   - 哪些测试文件中的 `as` 断言正在造成问题？
   - 它们是否在处理仅有少数属性相关的大型对象？
   - 它们是否需要为了错误测试而故意传入错误数据？

2. **安装并迁移**：
   - [ ] 安装：`npm i @total-typescript/shoehorn`
   - [ ] 查找带有 `as` 断言的测试文件：`grep -r " as [A-Z]" --include="*.test.ts" --include="*.spec.ts"`
   - [ ] 将 `as Type` 替换为 `fromPartial()`
   - [ ] 将 `as unknown as Type` 替换为 `fromAny()`
   - [ ] 添加 `@total-typescript/shoehorn` 的导入
   - [ ] 运行类型检查进行验证
