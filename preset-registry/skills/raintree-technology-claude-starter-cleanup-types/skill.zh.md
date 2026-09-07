---
name: cleanup-types
description: "Find duplicated or fragmented type/interface definitions across files and consolidate to a shared types module. TypeScript-first; also handles Python dataclasses/TypedDicts and Go structs. Use when the user asks to consolidate types, find duplicate interfaces, or organize type definitions. Example queries — \"consolidate our types\", \"find duplicate interfaces\", \"this same type is defined in three files\", \"organize the type definitions\"."
argument-hint: "[scope (optional path or glob)]"
user-invocable: true
---
查找本应共享却在多个文件中重复的类型定义，并将其整合为单一事实来源。默认采取保守策略——类型整合看似安全，但可能隐藏有意为之的差异。

## 预检

1. **语言检测**：TS/JS（主要）、Python（dataclass、TypedDict、Pydantic）、Go（struct）、Rust（struct/enum）。
2. **Git 状态**：工作树不干净时拒绝自动应用。
3. **报告目录**：确保其存在。
4. **确定类型存放位置**：项目目前把共享类型放在哪里？查找 `types/`、`models/`、`schema/`、包边界（例如，monorepo 通常将数据库类型集中存放在 `packages/db/src/schema/` 下）。

## 检测

没有现成的工具能可靠地跨语言查找语义等价的类型。使用 AST 扫描 + grep + 结构比较。

### TypeScript
```bash
# Find every `interface Foo` and `type Foo =` declaration
# Group by name, then by structural shape
grep -rn --include="*.ts" --include="*.tsx" -E "^export (interface|type) [A-Z]" . > /tmp/ts-types.txt
```

对每个出现在 2 个及以上文件中的名称，比较其形状。如果可用，将 `tsc --listFiles --noEmit` 的输出与 TypeScript 编译器 API 结合使用；否则退回到规范化空白字符后的文本比较。

### Python
```bash
# Find dataclass / TypedDict / Pydantic models
grep -rn --include="*.py" -E "^(class \w+\(.*?(BaseModel|TypedDict)\)|@dataclass)" . > /tmp/py-types.txt
```

### Go
```bash
grep -rn --include="*.go" -E "^type \w+ struct" . > /tmp/go-types.txt
```

### Rust
```bash
grep -rn --include="*.rs" -E "^pub (struct|enum) \w+" . > /tmp/rust-types.txt
```

**交叉核对**：对每个类型名称，检查是否由多个文件定义。对每一对定义，逐字段进行比较。

## 评估

写入 `.claude/cleanup-reports/cleanup-types-{YYYY-MM-DD}.md`：

```markdown
# Type Consolidation Assessment — YYYY-MM-DD

## Summary
- Type names with 2+ definitions: N
- HIGH (structurally identical): X
- MEDIUM (overlapping fields, may diverge intentionally): Y
- LOW (same name, different meaning): Z

## Findings

### `User` interface — HIGH
- Definitions:
  - `apps/app/features/auth/types.ts:8` — `{ id: string; email: string; createdAt: Date }`
  - `apps/admin/features/users/types.ts:12` — `{ id: string; email: string; createdAt: Date }`
- Identical shape. Consolidate to `packages/db/src/schema/user.ts` (already has the runtime model).

### `Account` interface — MEDIUM
- `domains/account/types.ts` — has 8 fields including `permissions: string[]`
- `features/billing/types.ts` — has 5 of those 8 fields, no `permissions`.
- Likely the billing one is a deliberate slice. Recommend: keep both, but rename billing's to `BillingAccount` for clarity. Don't auto-apply.

### `Config` type — LOW (different concepts)
- `lib/api-config.ts` — API client config
- `lib/feature-config.ts` — feature flag config
- Same name, unrelated. Recommendation: rename one for clarity, but no consolidation.

## Critical Assessment
[2-3 paragraphs: are types fragmented because there's no shared package, or because the architecture intentionally separates concerns?]
```

## 应用

**仅自动整合 HIGH 级别的项。** 类型整合经常跨越包边界并重塑导入图——务必保持保守。

### 置信度评级标准

**HIGH（自动应用）：**
- 同一类型名称出现在 2 个及以上文件中。
- 字段名、类型和修饰符（optional、readonly）全部完全一致。
- 语义概念相同（通过用法验证——两者用于同一领域实体）。
- 工作区中已存在共享类型模块。

**MEDIUM（仅报告）：**
- 字段重叠且存在有意差异（一个包含额外字段，另一个省略了部分字段）。
- 形状相同但名称不同——这可能是重命名的机会，但选择规范名称需要人工判断。
- 需要创建新共享包的跨包整合。

**LOW（仅备注）：**
- 名称相同但含义不同（Config、Options、Result 是常见的重灾区）。
- 生成的类型（来自 OpenAPI、GraphQL、Drizzle schema 等）——不要动代码生成产物。

### 执行（仅限 HIGH）

1. 选择规范存放位置：两个源文件都能导入的现有共享类型模块。
2. 将类型定义移动到该处（保留 JSDoc/注释）。
3. 用 `import type { Foo } from '...'` 替换两处原始定义。
4. 运行类型检查——如果出现任何错误（通常是由于 TS 中的名义类型差异或泛型参数不匹配），回退该项并降级处理。
5. 提交：`chore(cleanup): cleanup-types — consolidated N duplicate type definitions`。

## 验证

```bash
# Typecheck is the critical signal
bun run typecheck 2>&1 || npx tsc --noEmit
mypy . 2>&1 || true
go build ./... 2>&1
cargo check 2>&1

# Then standard test/lint
bun test && bunx biome check .
```

破坏下游用法的类型整合（例如，某个使用方依赖某字段在一个定义中是 `optional` 而在另一个定义中是 `required`）会在此处显现。出现任何新错误即回退。

## 输出

- “已整合 N 个重复的类型定义。M 个已推迟待审查。”
- 报告路径。
- 验证状态。

## 绝不

- 自动整合生成的类型（Drizzle 推断类型、OpenAPI 代码生成、Prisma 类型、GraphQL schema 类型）——正确做法是重新生成。
- 将公共 API 包中的 `Foo` 与私有应用包中的 `Foo` 合并——那会破坏 API 契约。
- 自动创建新的共享包。
- 整合带有名义标记的类型（branded types、opaque types）——这些类型的存在恰恰是为了*不*被合并。
- 修改 `*.d.ts` 环境声明文件中的类型，除非源文件本身也是 `.d.ts`。
- 自动重命名——重命名会产生连锁反应，需要人工批准。
