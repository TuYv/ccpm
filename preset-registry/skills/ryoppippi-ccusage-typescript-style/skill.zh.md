---
name: typescript-style
description: Guides ccusage TypeScript and JavaScript reading, writing, and review. Use before opening or editing .ts, .tsx, .js, or .jsx files, including mocks, fixtures, satisfies, or suppressions.
paths:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/*.js'
  - '**/*.jsx'
globs: '*.ts,*.tsx,*.js,*.jsx'
---
# TypeScript 风格

## 优先使用 `satisfies` 而非 `as`

避免使用 `as` 类型断言，尤其是 `as any`。在检查对象字面量、mock、配置对象、fixture 数据和期望行时，请使用 `satisfies`。

反例：

```ts
const config = { port: 3000, host: 'localhost' } as ServerConfig;
const ctx = { fetchDirent: vi.fn(), addReadHistory: vi.fn() } as any;
```

正例：

```ts
const config = { port: 3000, host: 'localhost' } satisfies ServerConfig;
const ctx = { fetchDirent: vi.fn(), addReadHistory: vi.fn() } satisfies MockContext;
```

## 使用 `as const satisfies`

当保留精确的字面量值或只读元组有助于 TypeScript 捕获错误时，对静态字面量数据使用 `as const satisfies`。

正例：

```ts
const ROUTES = {
	home: '/',
	about: '/about',
} as const satisfies Record<string, string>;
```

表驱动用例的正例：

```ts
const reportCases = [
	{ type: 'daily', period: '2026-05-16' },
	{ type: 'monthly', period: '2026-05' },
] as const satisfies readonly ReportCase[];
```

## 可接受的 `as`

仅当 `satisfies` 无法表达该操作时才使用 `as`，例如收窄从外部无类型边界返回的数据，或适配要求名义类型的 API。应将其限制在局部范围内，并避免使用 `as any`。

## 优先使用 `@ts-expect-error`

使用 `@ts-expect-error` 而非 `@ts-ignore`，并附上简短说明。当底层的类型错误消失时，`@ts-expect-error` 会报错，因此过时的错误抑制会被发现。

反例：

<!-- eslint-skip -->

```ts
// @ts-ignore
import privateApi from 'some-package/private-api';
```

## 穷尽式 Switch

在对可辨识联合类型或字面量联合类型进行 switch 判断后使用 `satisfies never`，这样在对应分支得到处理之前，新增的变体会导致类型检查失败。

正例：

```ts
switch (agent) {
	case 'claude':
		return loadClaude();
	case 'codex':
		return loadCodex();
	default:
		// exhaustiveness check for new agents added to the union
		agent satisfies never;
		throw new Error(`Unsupported agent: ${agent}`);
}
```

正例：

```ts
// @ts-expect-error Private runtime API has no public type declaration.
import privateApi from 'some-package/private-api';
```
