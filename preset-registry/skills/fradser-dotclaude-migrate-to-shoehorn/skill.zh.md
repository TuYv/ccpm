---
name: migrate-to-shoehorn
description: Migrate test files from `as` type assertions to @total-typescript/shoehorn. Use when user mentions shoehorn, wants to replace `as` in tests, or needs partial test data.
---
# 迁移到 Shoehorn

## 为什么使用 shoehorn？

`shoehorn` 允许你在测试中传入部分数据，同时确保 TypeScript 类型检查正常。它使用类型安全的替代方案来取代 `as` 断言。

**仅限测试代码。**切勿在生产代码中使用 shoehorn。

在测试中使用 `as` 的问题：

- 已被要求不要使用它
- 必须手动指定目标类型
- 需要使用双重断言（`as unknown as Type`）来传入故意错误的数据

## 安装

```bash
npm i @total-typescript/shoehorn
```

## 迁移模式

### 只需要少量属性的大型对象

迁移前：

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

迁移后：

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

迁移前：

```ts
getUser({ body: { id: "123" } } as Request);
```

迁移后：

```ts
import { fromPartial } from "@total-typescript/shoehorn";

getUser(fromPartial({ body: { id: "123" } }));
```

### `as unknown as Type` → `fromAny()`

迁移前：

```ts
getUser({ body: { id: 123 } } as unknown as Request); // wrong type on purpose
```

迁移后：

```ts
import { fromAny } from "@total-typescript/shoehorn";

getUser(fromAny({ body: { id: 123 } }));
```

## 各函数的使用场景

| 函数            | 使用场景                                           |
| --------------- | -------------------------------------------------- |
| `fromPartial()` | 传入仍能通过类型检查的部分数据                     |
| `fromAny()`     | 传入故意错误的数据（保留自动补全）                 |
| `fromExact()`   | 强制传入完整对象（之后可替换为 fromPartial）       |

## 工作流程

1. **收集需求**——询问用户：
   - 哪些测试文件中的 `as` 断言造成了问题？
   - 是否需要处理只用到少量属性的大型对象？
   - 是否需要传入故意错误的数据来测试错误处理？

2. **安装并迁移**：
   - [ ] 安装：`npm i @total-typescript/shoehorn`
   - [ ] 查找包含 `as` 断言的测试文件：`grep -r " as [A-Z]" --include="*.test.ts" --include="*.spec.ts"`
   - [ ] 将 `as Type` 替换为 `fromPartial()`
   - [ ] 将 `as unknown as Type` 替换为 `fromAny()`
   - [ ] 添加从 `@total-typescript/shoehorn` 导入的内容
   - [ ] 运行类型检查以进行验证