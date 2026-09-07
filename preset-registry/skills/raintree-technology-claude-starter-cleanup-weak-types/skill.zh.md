---
name: cleanup-weak-types
description: "Replace weak types (any, unknown, interface{}, untyped Python) with strong, inferable types. Researches actual usage to determine the correct type, runs typecheck after each change, reverts individual changes that fail. Use when the user asks to remove any/unknown, strengthen typing, fix weak types, or make code more type-safe. Example queries — \"remove all the `any` types\", \"strengthen our typing\", \"stop using unknown everywhere\", \"make this more type-safe\"."
argument-hint: "[scope (optional path or glob)]"
user-invocable: true
---
用从实际用法推断出的强类型替换作为逃生舱口的弱类型。逐处验证——每次替换都单独进行类型检查，若失败即回滚。对公共 API 采取保守态度。

## 预检

1. **语言检测**：TS/JS（`any`、`unknown`、`as unknown as`、`Function`、`Object`）、Python（`Any`、缺失类型注解）、Go（`interface{}`、1.18 之后的 `any`）、Rust（`Box<dyn Any>` 少见；主要查找使用具体类型即可满足的 `Box<dyn Trait>`）。
2. **Git 状态**：工作区有未提交改动时拒绝执行。
3. **报告目录**：确保其存在。
4. **读取项目约定**：检查 package.json 中是否有 `check:weak-types`（或类似）脚本。检查 `tsconfig.json` 中的 `strict`/`noImplicitAny` 标志。检查 `mypy.ini` / `pyproject.toml [tool.mypy]` 中的严格性配置。
5. **读取允许列表**：许多项目允许在特定文件中使用弱类型（例如 `*.test.ts`、生成的代码、第三方垫片文件）。找到并遵守这些规则。

## 检测

### TypeScript / JavaScript
```bash
# Explicit `any`
grep -rn --include="*.ts" --include="*.tsx" -E "\b(: any\b|<any>|as any\b|as unknown as)" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.next . > /tmp/ts-weak.txt

# Compiler-derived implicit-any (more accurate than grep)
npx tsc --noImplicitAny --noEmit 2>&1 | grep "implicitly has an 'any' type" > /tmp/ts-implicit-any.txt
```

对每处出现的位置，捕获其上下文（函数签名、调用方）。

### Python
```bash
# Explicit Any imports + usage
grep -rn --include="*.py" -E "(from typing import.*Any|: Any\b|-> Any\b)" . > /tmp/py-any.txt

# Mypy strict mode finds untyped functions
mypy --disallow-untyped-defs --no-incremental . > /tmp/py-untyped.txt 2>&1 || true
```

### Go
```bash
grep -rn --include="*.go" -E "\binterface\{\}|\bany\b" . > /tmp/go-any.txt
```

### Rust
```bash
grep -rn --include="*.rs" -E "(Box<dyn |&dyn )" . > /tmp/rust-dyn.txt
```

## 评估

写入 `.claude/cleanup-reports/cleanup-weak-types-{YYYY-MM-DD}.md`：

```markdown
# Weak Types Assessment — YYYY-MM-DD

## Summary
- Total weak-type sites: N
- HIGH (safe to auto-fix): X
- MEDIUM (public API or cross-package): Y
- LOW (justified — e.g., genuine unknown JSON, third-party): Z

## Findings

### HIGH — `apps/app/lib/parse.ts:45` `function process(data: any)`
- Inferable type: `data` is always called with `{ id: string; events: Event[] }` (3 callers checked).
- Replacement: `function process(data: { id: string; events: Event[] })`.
- Even better: lift to a named type `ProcessInput`.

### MEDIUM — `packages/sdk/src/client.ts:12` `function send(payload: any): Promise<any>`
- Public API of an SDK package — changing the type is a breaking change.
- Recommendation: introduce a generic `<T, R>` and have callers specify, OR use `unknown` and require validation.

### LOW — `lib/json.ts:8` `function parseJson(s: string): unknown`
- Genuinely unknown — JSON.parse output. Keep as `unknown`, ensure callers narrow.

## Critical Assessment
[2-3 paragraphs: where are weak types concentrated? Boundary code (HTTP handlers, JSON parsing) often justifies them. Internal logic almost never does.]
```

## 应用

**只自动修复 HIGH 项，一次一处，每处之间进行类型检查。** 这一点至关重要——批量类型修改可能以难以预测的方式产生连锁反应。

### 置信度判定标准

**HIGH（逐个自动应用）：**
- 弱类型位于私有/内部函数中。
- 所有调用方都在同一仓库中，且传入相同的类型（或一个容易用联合类型表示的小型有限集合）。
- 替换类型可以从用法中机械地推导出来。
- 该符号未在包边界处被重新导出。

**MEDIUM（仅报告）：**
- 公共 API 面（从包中导出、被 `.d.ts` 使用、属于 SDK 的一部分）。
- 适合泛型化的签名（建议泛型方案但不应用）。
- 可识别联合的机会——由人来选择判别字段。
- `as unknown as` 类型断言——这些通常暗示更深层的类型设计问题。

**LOW（仅记录，不采取行动）：**
- 接收真正未知输入的边界代码（校验前的 HTTP 请求体、`JSON.parse`、动态配置）。
- 第三方垫片文件，其对应的实际库没有类型定义。
- 测试文件（在大多数弱类型允许列表中都是被允许的）。

### 执行（HIGH，逐个进行）

对每一条 HIGH 发现：
1. 捕获拟议改动的精确 `git diff`。
2. 应用改动（Edit）。
3. 运行限定范围的类型检查：`bun run typecheck` 或 `tsc --noEmit`。Python 用：`mypy <file>`。
4. 若类型检查失败或在其他位置引入新错误：`git checkout -- <file>`，在报告中将该发现降级为 MEDIUM，继续。
5. 若类型检查通过，处理下一条。

所有 HIGH 发现处理完毕后，进行单次提交：`chore(cleanup): cleanup-weak-types — strengthened N type signatures`。

## 验证

```bash
# Full typecheck across the repo (not just changed files)
bun run typecheck 2>&1
mypy --strict . 2>&1 || mypy . 2>&1
go build ./... 2>&1
cargo check 2>&1

# Tests — important here, since type changes can affect runtime via narrowing
bun test 2>&1
pytest 2>&1
go test ./... 2>&1
cargo test 2>&1

# Project-specific weak-types gate
bun run check:weak-types 2>/dev/null || true  # project-specific script, if defined
```

若逐文件通过之后仍出现失败（罕见，但跨文件推断有可能导致）：全部回滚并降级。这种情况应很少发生，因为我们在每次改动后都做了类型检查。

## 输出

- "Strengthened N weak types. M deferred for review."（已强化 N 处弱类型。M 处留待审查。）
- 报告路径，附 HIGH/MEDIUM/LOW 的分布情况。
- 验证状态。

## 严禁

- 批量将 `any` 替换为 `unknown`——那是另一种缺陷，而不是修复。二者都是弱类型；`unknown` 只是强制收窄。
- 将 `any` 替换为会破坏 N 个调用方之一的过窄类型——必须验证所有调用方都匹配。
- 触碰生成的类型（Drizzle 的 `$inferSelect`、OpenAPI 代码生成、Prisma）——应改为修复代码生成配置。
- 添加 `// @ts-ignore` 或 `# type: ignore` 来让改动通过——那是在掩盖问题。
- 修改第三方库的环境 `.d.ts` 声明。
- 在不理解其添加原因的情况下移除 `as unknown as` 断言——这类断言往往掩盖着值得调查的类型不兼容问题，不应悄悄修复。
- 自动向公共 API 添加泛型——那是需要人来设计的契约变更。
