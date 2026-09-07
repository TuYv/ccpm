---
name: cleanup-unused
description: "Detect and delete unused code, exports, files, and dependencies. Runs knip/vulture/staticcheck/cargo-machete appropriate to the language, writes a critical assessment, and auto-applies HIGH-confidence deletions. Use when the user asks to remove dead code, find unused exports, clean up dependencies, or run dead-code analysis. Example queries — \"find dead code\", \"what's unused in this repo\", \"are there unused npm deps\", \"kill the cruft\"."
argument-hint: "[scope (optional path or glob)]"
user-invocable: true
---
检测未使用的代码、导出、文件和依赖项。仅自动删除可被证实为死代码的内容。撰写一份带置信度评级的批判性评估；将含糊不清的项目交由人工处理。

## 预检

1. 通过检查以下文件来**检测语言**：`package.json`（TS/JS）、`pyproject.toml`/`requirements.txt`（Py）、`go.mod`（Go）、`Cargo.toml`（Rust）。跳过不存在的语言。
2. **检查 git 状态。** 若工作区不干净，则拒绝自动应用——先请用户 stash 或 commit。验证步骤需要一个可供回退的干净基线。
3. **创建报告目录**：`mkdir -p .claude/cleanup-reports/`。若 `.gitignore` 中尚未包含 `.claude/cleanup-reports/`，则将其加入。
4. **扫描会使静态分析失效的动态导入模式**。保存该列表——这些区域内的发现将降至 MEDIUM 置信度。
   - JS/TS：`import(`、`require(`、`eval(`、`Function(`、`__webpack_require__`、动态路由文件约定（`pages/`、`app/`）
   - Python：`__import__`、`importlib`、`getattr`、`setup.py`/`pyproject.toml` 中的插件入口点
   - Go：`reflect.`、插件加载器、构建标签
   - Rust：`cfg(feature = ...)` 门控、过程宏、`extern crate`

## 检测

按语言运行合适的工具。仅在询问之后按需安装。

### TypeScript / JavaScript
```bash
# Knip is the gold standard. Most TS/JS repos already have it wired up.
bunx knip --reporter json > /tmp/knip.json 2>/dev/null || npx knip --reporter json > /tmp/knip.json
```
解析 `files`、`exports`、`types`、`dependencies`、`devDependencies`、`unlisted`、`binaries` 数组。

### Python
```bash
uvx vulture . --min-confidence 80 --json > /tmp/vulture.json 2>/dev/null || pipx run vulture . --min-confidence 80
```
Vulture 置信度 ≥80 大致对应我们的 HIGH；60-79 = MEDIUM。

### Go
```bash
go install honnef.co/go/tools/cmd/staticcheck@latest 2>/dev/null
staticcheck -checks=U1000 ./... > /tmp/staticcheck.txt
```
U1000 表示未使用的代码。

### Rust
```bash
cargo install cargo-machete 2>/dev/null
cargo machete --with-metadata > /tmp/machete.txt    # unused deps
cargo +nightly udeps 2>/dev/null || true            # optional, nightly-only
```
如需检测 crate 内部的死代码，使用 `RUSTFLAGS="-W dead_code"` 并重新构建。

## 评估

写入 `.claude/cleanup-reports/cleanup-unused-{YYYY-MM-DD}.md`，内容如下：

```markdown
# Unused Code Assessment — YYYY-MM-DD

## Scope
- Languages detected: [TS, Py, …]
- Tools run: [knip, vulture, …]
- Dynamic-import risk areas: [list paths]

## Summary
- Unused files: N (HIGH: x, MEDIUM: y)
- Unused exports: N (HIGH: x, MEDIUM: y)
- Unused dependencies: N (HIGH: x, MEDIUM: y)
- Total LOC removable (HIGH only): ~N

## Findings

| Conf | Type | Location | Tool said | Recommendation |
|------|------|----------|-----------|----------------|
| HIGH | export | src/utils/foo.ts:12 `parseDate` | knip: unused export | Delete export + function |
| MED  | file | src/legacy/old.ts | knip: unused file | Defer — referenced from dynamic import area |
| ...

## Critical Assessment

[2-4 paragraphs of human-readable analysis]
- What patterns emerged? (e.g., "8 of 12 unused exports are in `lib/legacy/` — consider deleting the whole directory")
- Why were items downgraded from HIGH to MEDIUM?
- Architectural observations.

## Out of scope
- [Items the tool flagged but skill won't touch — public API surfaces, framework conventions, etc.]
```

## 应用

**仅自动应用 HIGH 置信度项。** 将所有删除合并为一次提交。

### 置信度评级标准

**HIGH（自动应用）：**
- 工具标记了该项，且它不在动态导入风险区域内
- 不位于公共 API 表面上（`index.ts`、`__init__.py`、`pub` 项、包的 `main`/`exports`）
- 在整个仓库中零引用（用 grep 验证，而非仅凭工具的一面之词）
- 对于依赖项：未被任何脚本、配置或运行时 require 使用

**MEDIUM（仅报告，不应用）：**
- 工具已标记，但存在以下情况之一：位于动态导入区域、位于公共 API 表面、存在间接引用（重新导出）、是被外部消费的 `.d.ts` 中的纯类型导出
- Vulture 置信度为 60-79
- 出现在 `peerDependencies` 中或被构建工具使用的依赖项

**LOW（在报告中记录，不采取行动）：**
- 没有工具依据的启发式猜测
- 用户此前拒绝删除的内容（查看 git log 中的历史回退记录）

### 执行

1. 删除文件：`rm <path>` —— 但要先确认没有被 `.gitignore` 忽略的同级文件引用它们。
2. 移除导出：使用 `Edit` 移除 export 关键字 + 若内部使用量也为零，则一并删除该符号。
3. 卸载依赖：`bun remove <pkg>` / `pip uninstall <pkg>` / `cargo remove <pkg>` —— 根据 lockfile 的存在情况选择包管理器。
4. 单次提交：`git add -A && git commit -m "chore(cleanup): cleanup-unused — N items removed"`。

## 验证

按顺序运行**所有**适用的检查。首次失败即停止并回退。

```bash
# Typecheck
bun run typecheck 2>&1 || npx tsc --noEmit
mypy . 2>&1 || true
go build ./... 2>&1
cargo check 2>&1

# Tests (if scripts exist)
bun test 2>&1 || npm test 2>&1
pytest 2>&1
go test ./... 2>&1
cargo test 2>&1

# Lint
bunx biome check . 2>&1 || npx eslint . 2>&1
ruff check . 2>&1
golangci-lint run 2>&1
cargo clippy 2>&1
```

如果有任何检查失败：执行 `git revert HEAD --no-edit`，将报告中所有已自动应用的项降级为 MEDIUM，并追加一个包含错误输出的 "## Verify Failure" 章节。

## 输出

回合结束消息（≤4 行）：
- “已移除 N 个未使用项（X 个文件、Y 个导出、Z 个依赖）。M 项已推迟待审查。”
- 报告的路径。
- 验证状态（✓ 全部通过，✗ 已回退）。

## 绝不

- 绝不删除 `node_modules/`、`.next/`、`dist/`、`build/` 或其他生成目录中的任何内容。
- 即使看起来未使用，也绝不删除迁移文件（`drizzle/*.sql`、`alembic/`、`migrations/`）——它们记录着历史。
- 绝不仅凭 knip 的标记就删除测试夹具——它们通常通过 glob 加载。
- 绝不在脏工作区上自动应用——拒绝并询问。
- 对于框架约定目录（Next.js `app/`、`pages/`、Remix `routes/` 等）中的文件，绝不盲目相信 knip——这些目录存在基于路由的动态加载。
- 若移除依赖导致解析问题，绝不运行 `npm install --force` 或任何绕过 lockfile 完整性校验的标志。
