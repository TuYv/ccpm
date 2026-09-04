---
name: cleanup-cycles
description: "Detect and untangle circular dependencies. Runs madge/skott (TS), pycycle (Py), or compiler-only checks (Go/Rust). Auto-fixes leaf-extractable cycles; reports core cycles for human review. Use when the user asks to find circular imports, fix dependency cycles, or untangle module graph. Example queries — \"find circular imports\", \"fix dependency cycles\", \"untangle our module graph\", \"why is madge complaining\"."
argument-hint: "[scope (optional path or glob)]"
user-invocable: true
---
检测循环导入依赖，并在可安全机械化处理的范围内打破它们。叶子工具之间的循环可以通过提取来修复；核心模块之间的循环需要架构层面的决策，只报告而不自动修复。

## 预检

1. **语言检测**：`package.json`（TS/JS）、`pyproject.toml`（Py）、`go.mod`（Go）、`Cargo.toml`（Rust）。注意：Go 和 Rust 在编译期就会阻止循环，因此本技能的工作主要面向 TS/Py。
2. **Git 状态**：工作树不干净（有未提交改动）时拒绝自动应用。
3. **报告目录**：确保 `.claude/cleanup-reports/` 存在。
4. **现有脚本**：检查 `package.json` 中是否有 `cycle:check`（或类似）脚本——如果仓库已经用自定义配置接入了 madge，应优先使用它而非默认配置。

## 检测

### TypeScript / JavaScript
```bash
# Madge is the standard. Skott is faster for large repos.
bunx madge --circular --extensions ts,tsx,js,jsx --json src/ apps/ packages/ > /tmp/madge.json 2>/dev/null \
  || npx madge --circular --extensions ts,tsx --json . > /tmp/madge.json
```
每个条目都是一个描述单个循环的数组：`["a.ts", "b.ts", "a.ts"]`。

### Python
```bash
pipx run pycycle --here --verbose > /tmp/pycycle.txt 2>&1 || true
# Fallback: import-linter with auto-config
pipx run import-linter > /tmp/import-linter.txt 2>&1 || true
```

### Go
```bash
# Go enforces acyclic at compile; this just confirms build is clean.
go build ./... 2>&1
# Optional: visualize with goda for ergonomics
go install github.com/loov/goda@latest 2>/dev/null
goda graph ./... > /tmp/goda.dot 2>/dev/null || true
```
如果 `go build` 因 `import cycle` 报错，那本身就是报告内容。

### Rust
```bash
cargo build 2>&1   # rustc rejects cycles
# For visibility into module graph: cargo-modules
cargo install cargo-modules 2>/dev/null
cargo modules generate tree 2>/dev/null || true
```

## 评估

写入 `.claude/cleanup-reports/cleanup-cycles-{YYYY-MM-DD}.md`：

```markdown
# Circular Dependencies Assessment — YYYY-MM-DD

## Summary
- Total cycles: N
- HIGH confidence (auto-fixable by leaf extraction): X
- MEDIUM confidence (refactor needed): Y
- LOW (architectural redesign): Z

## Cycles

### Cycle 1 — HIGH
- Path: `a/util.ts → b/helper.ts → a/util.ts`
- Shared piece: `formatCurrency` defined in `b/helper.ts`, called by `a/util.ts`. `b/helper.ts` imports a single constant `LOCALE` from `a/util.ts`.
- Plan: Extract `LOCALE` to new `a/constants.ts`. `b/helper.ts` imports from there. Cycle broken.

### Cycle 2 — MEDIUM
- Path: `domains/user/index.ts → domains/account/index.ts → domains/user/index.ts`
- Both modules export and consume each other's primary types. No leaf to extract.
- Recommendation: introduce a `domains/shared/types.ts` for cross-domain types, OR invert one direction with dependency injection.

## Critical Assessment
[2-3 paragraphs: what does the cycle pattern reveal about the architecture? Are cycles concentrated in one area? Is there a missing layer?]
```

## 应用

**仅自动修复可通过叶子提取解决的 HIGH 置信度循环。**

### 置信度判定标准

**HIGH（自动应用）：**
- 循环恰好包含 2 个模块。
- 循环的其中一个方向只涉及一项很小的内容：一个常量、一个类型、一个不超过 20 行的纯工具函数，且在循环内部没有进一步的依赖。
- 把该项内容提取到新模块可以确凿地打破该循环。

**MEDIUM（仅报告）：**
- 循环包含 3 个及以上模块。
- 两个方向都消费了对方非平凡的 API。
- 提取将需要连带迁移各自带有依赖尾巴的类/函数。

**LOW（留给人工处理）：**
- 循环是结构性的（例如双向 ORM 关系、父/子组件引用）——可能是有意为之。
- 循环在条件导入下即消失——不要动它，记录说明即可。

### 执行（仅限 HIGH）

1. 识别叶子内容（常量/类型/工具函数）。
2. 在合适的位置创建新文件：`src/<area>/<name>.ts`。优先放入外部导入较少的那一方消费者中。
3. 把叶子内容迁移过去。
4. 更新原先两个模块的导入。
5. 重新运行 madge/pycycle，确认循环已消除。
6. 提交：`chore(cleanup): cleanup-cycles — N cycles broken via leaf extraction`。

## 验证

```bash
# Re-run cycle detection — should report 0 for HIGH-applied cycles
bunx madge --circular . 2>&1
pycycle --here 2>&1
go build ./... 2>&1
cargo build 2>&1

# Then standard typecheck/test/lint (see cleanup-unused for full list)
bun run check 2>&1 || npx tsc --noEmit && npx eslint .
pytest 2>&1
```

如果验证失败或出现新的循环：执行 `git revert HEAD`，将这些修复标记为 MEDIUM，并上报处理。

## 输出

- “已打破 N 个循环依赖。M 个循环推迟至架构评审处理。”
- 报告的路径。
- 验证状态。

## 绝不

- 对包含 3 个及以上模块的循环自动应用修复——这类循环始终需要人工判断。
- 把 barrel 文件（`index.ts` 再导出）当作打破循环的解决方案——它们往往只是掩盖循环而非修复。
- 动框架强加的循环（例如 React 组件文件从同级文件导入自己的类型）——那是约定，不是缺陷。
- 把类型挪进一个 `types.ts` 巨型文件——应优先与打破循环所需的最小作用域就近放置。
- 通过工具配置压制循环警告——要么修复，要么报告，绝不静默处理。
