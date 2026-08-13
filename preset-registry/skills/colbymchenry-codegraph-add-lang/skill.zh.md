---
name: add-lang
description: Add tree-sitter language support to codegraph end-to-end — wire the grammar + extractor, write tests, then benchmark extraction quality and retrieval value on 3 popular real-world repos. Use when the user runs /add-lang <language> or asks to add/support a new language (e.g. Lua, Elixir, Zig, OCaml) in codegraph.
---
# 向 CodeGraph 添加语言

将一门新的 tree-sitter 语言接入 codegraph 的抽取流水线，在常见仓库上证明它能够提取真实符号，并证明它在 agent 场景下优于 no-codegraph。该流程会**完全自动化**——选择仓库、基准测试、更新文档，然后汇报结果。**严禁提交、推送、发布或打标签**（项目规则）；将所有变更留给用户审核。

参数是贯穿 `Language` 联合类型的语言 token，例如 `lua`、`elixir`、`zig`。若未提供 token，则询问是哪种语言。全程使用小写单词形式（`csharp`，而不是 `c#`）。

## 前置条件
- 在 codegraph 仓库根目录运行。需具备 `node`、`git`、`gh`，并已登录 `claude` CLI（基准测试会真实执行 `claude -p`）。
- 基准测试使用本地开发构建——第 8 步会构建并将其链接到 PATH。

## 工作流

将该清单原样复制并按顺序执行：
```
- [ ] 1. Resolve language; bail early if already supported (just benchmark)
- [ ] 2. Find a grammar + health-check it (ABI / heap corruption)
- [ ] 3. Discover the grammar's AST node types (dump-ast.mjs)
- [ ] 4. Wire the language (4 files; sometimes a 5th core touch)
- [ ] 5. Build + verify-extraction loop until PASS
- [ ] 6. Add extraction tests; make them green
- [ ] 7. Auto-pick 3 popular repos by size tier; add to corpus.json
- [ ] 8. Benchmark all 3: extraction + with/without A/B
- [ ] 9. Update README + CHANGELOG
- [ ] 10. Report; do NOT commit
```

### 步骤 1 — 解析 + 提前终止

检查该语言是否已经接入：在 `LANGUAGES` 常量（`src/types.ts`）和 `EXTRACTORS` 映射（`src/extraction/languages/index.ts`）中查找对应 token。若已支持（如 `typescript`、`rust`），则**跳过第 2–6 步**，直接进入基准测试（第 7–8 步）以验证和测量，并在报告中说明未做代码变更。

### 步骤 2 — 查找语法并进行健康检查

```bash
ls node_modules/tree-sitter-wasms/out/ | grep -i <lang>   # csharp -> c_sharp
```
- **存在** → 可能是开箱即用；`grammars.ts` 会自动从 `tree-sitter-wasms` 解析它。（多数语言：elixir、zig、ocaml、solidity、toml、yaml 等）
- **不存在** → 将 `.wasm` 自行放入 `src/extraction/wasm/`（如 `pascal` / `scala` / `lua`），并在第 4 步将 token 加入 vendored 分支。

**在编写 extractor 之前务必先做健康检查——即使语法*存在*也可能不可用：**
```bash
node scripts/add-lang/check-grammar.mjs <lang> path/to/valid-sample.<ext>
```
它会打印语法的 ABI 版本，并在多语法运行时中重复解析一个有效样例。如果返回 **FAIL**（在有效代码上出现 ERROR 树——旧 ABI 损坏了共享 WASM 堆，导致每个文件在首次之后都会悄无声息地丢弃嵌套调用/导入，例如 tree-sitter-wasms 的 **Lua** 语法是 ABI 13 且会失败），请勿使用该 wasm。**改为引入一个更新的（ABI 14/15）构建：**
```bash
npm pack @tree-sitter-grammars/tree-sitter-<lang>   # often ships a prebuilt *.wasm
# or build one: npx tree-sitter build --wasm   (needs Docker/emscripten)
cp <the>.wasm src/extraction/wasm/tree-sitter-<lang>.wasm
```
然后在第 4 步把 token 加入 vendored 分支，并在 vendored 路径上反复重跑 check-grammar，直到通过。**如果无法获得健康的 wasm，请立即停止并告知用户。**

### 步骤 3 — 发现 AST 节点类型

获取一个有代表性的源码文件（可写一段小样本，包含函数、类/结构体、导入、枚举；或从已知仓库 `curl` 一份原始文件），然后：
```bash
node scripts/add-lang/dump-ast.mjs <lang> path/to/sample.<ext>
# vendored grammar: pass the wasm path instead of the token
node scripts/add-lang/dump-ast.mjs src/extraction/wasm/tree-sitter-<lang>.wasm sample.<ext>
```
频次表和字段名（`name:`、`parameters:`、`body:`、`return_type:`）会告诉你需要映射哪些类型。打开语法范式最接近的现有 extractor 作为模板：`rust.ts`/`scala.ts`（函数式、trait）、`java.ts`/`csharp.ts`（面向对象）、`python.ts`/`ruby.ts`（脚本式）、`go.ts`（顶层方法 + receiver）。

### 步骤 4 — 接入语言（4 个文件）

这些是精确且脆弱的接入点，请严格按既有风格处理：

1. **`src/types.ts`** — 两处修改：
   - 向 `LANGUAGES` 常量中添加 `'<lang>',`（位于 `'unknown'` 之前）；
   - 向 `DEFAULT_CONFIG.include` 中添加 `'**/*.<ext>',`。**此项不可省略**——这是文件扫描白名单；若缺少该 glob，即使 detection/extraction 已接入，`codegraph init` 也会找到 **0** 个文件。
2. **`src/extraction/grammars.ts`** — 三个映射：
   - `WASM_GRAMMAR_FILES`: `<lang>: 'tree-sitter-<lang>.wasm',`
   - `EXTENSION_MAP`: 每个文件扩展名 → `'<lang>'`（例如 `'.lua': 'lua',`）
   - `getLanguageDisplayName`: `<lang>: '<Display Name>',`
   - **仅 vendored 情况**：将 `<lang>` 加入 `(lang === 'pascal' || lang === 'scala' || …)` 的 wasm 路径分支。
3. **`src/extraction/languages/<lang>.ts`** — 新建文件并导出
   `export const <lang>Extractor: LanguageExtractor = { … }`。映射第 3 步中的节点类型。必填字段包括：`functionTypes`、`classTypes`、`methodTypes`、`interfaceTypes`、`structTypes`、`enumTypes`、`typeAliasTypes`、`importTypes`、`callTypes`、`variableTypes`、`nameField`、`bodyField`、`paramsField`。按语法需要补充 hook（`getSignature`、`getVisibility`、`isExported`、`extractImport`、`visitNode`、`getReceiverType`、`interfaceKind`、`enumMemberTypes` 等）——参见 `src/extraction/tree-sitter-types.ts`。
4. **`src/extraction/languages/index.ts`** — 添加 `import { <lang>Extractor } from './<lang>';` 并在 `EXTRACTORS` 中加入 `<lang>: <lang>Extractor,`。

**有时还会需要第 5 个核心改动：`src/extraction/tree-sitter.ts`**——变量抽取在 `extractVariable` 中按语言有分支（通用后备只查找直接的 `identifier` / `variable_declarator` 子节点）。若该语法将声明名嵌套（如 Lua 的 `variable_declaration → variable_list`），就在此处新增一个 `} else if (this.language === '<lang>')` 分支，参考现有的 ts/python/go 分支实现。某些导入形式并非独立节点（Lua/Ruby 的 `require` 是一个*调用*），这类情况在 extractor 的 `visitNode` hook 中处理。

### 步骤 5 — 构建 + 验证循环

```bash
npm run build            # tsc + copy-assets (copies any vendored *.wasm into dist/)
```
索引一个小型样例仓库并检查抽取结果：
```bash
( cd <sample-repo> && codegraph init -i )
node scripts/add-lang/verify-extraction.mjs <sample-repo> <lang>
```
`verify-extraction.mjs` 在语言未被检测到，或仅产出 `file`/`import` 节点时会失败（退出码 1），这是节点类型映射错误的典型症状。出现 FAIL 或薄 WARN 时，需对更完整的文件重跑 `dump-ast.mjs`，修正 `<lang>.ts` 中的映射关系，再执行 `npm run build`，重新索引并重测。**重复直到 PASS。**

### 步骤 6 — 测试

按 `Rust Extraction` 区块的方式，新增到 `__tests__/extraction.test.ts`：
- 在 `describe('Language Detection')` 中添加 `detectLanguage` 断言；
- 添加一个 `describe('<Lang> Extraction')` 区块，断言从内联源码字符串中抽取到了 functions/classes/imports。
```bash
npx vitest run __tests__/extraction.test.ts
```
通过后再继续。

### 步骤 7 — 自动挑选 3 个仓库并写入 corpus

**无需询问**。先找候选项，再筛选出 3 个确实以 `<lang>` 为主且覆盖大小分层的仓库：
```bash
gh search repos --language=<lang> --sort=stars --limit 40 \
  --json fullName,stargazerCount,description
```
分层（匹配 `corpus.json`）：**Small** <~150 文件 · **Medium** ~150–1500 · **Large** >~1500。跳过虽然打了 `<lang>` 标签但主要使用其他语言的仓库。为每个仓库写一条跨文件架构问题（即需要跨文件追踪的问题）。向 `.claude/skills/agent-eval/corpus.json` 增加一个 `"<Language>"` 区块（字段：`name`、`repo`、`size`、`files`、`question`），便于 `/agent-eval` 复用。

### 步骤 8 — 基准测试全部 3 个仓库（含 A/B）

先将 codegraph 开发构建一次性放到 PATH，然后循环执行：
```bash
npm run build && ./scripts/local-install.sh
scripts/add-lang/bench.sh <lang> <name> <url> "<question>" headless   # ×3
```
`bench.sh` 会克隆到共享的 `/tmp/codegraph-corpus`，清空并索引仓库，运行 `verify-extraction.mjs`，然后通过 `scripts/agent-eval/run-all.sh` 进行带检索与不带检索 A/B 测试（若抽取坏掉，则跳过付费 A/B）。读取 `run-all.sh` 打印的每条 `parse-run.mjs` 摘要：工具调用、`Read` 文件次数、Grep/Bash、codegraph-tool 调用、耗时与**成本**——分别查看 `with` 与 `without` 两个分支。循环结束后，如有需要恢复开发链路：`./scripts/local-install.sh`。

### Step 9 — 文档 + CHANGELOG

- **README.md**: 将 `<Lang>` 添加到“19+ Languages”特性条目，并在 **Supported Languages** 表中新增一行：
  `| <Lang> | \`.ext\` | Full support (classes, methods, …) |`.
- **CHANGELOG.md**: 在顶部（最新版本上方）添加一个 `## [Unreleased]` 区块，并包含 `### Added` → 一条面向用户的 bullet，例如：
  *"CodeGraph 现已索引 **<Lang>** (`.ext`) — functions, classes, imports, and
  call edges."* 如果 `## [Unreleased]` 已存在，则将其追加到该区块下。（它会在发布时并入下一个版本区块。）

### Step 10 — 报告（请勿提交）

Summarize for review:
- **Files changed**: 4 个接线改动 + 新提取器 + 测试 + README + CHANGELOG + corpus.json（+ 任何 vendored 的 `.wasm`）。
- **Extraction** 每个仓库：files / nodes / edges / `verify-extraction` 结果。
- **A/B** 每个仓库：`with` vs `without`（工具调用、文件读取次数、成本）以及一行结论——codegraph 是否降低了工作量，以及两条路径是否都能得到正确答案？
- **Gaps / follow-ups**（尚未映射的节点类型、缺失的解析边、框架路由等）。

将变更交付给用户。**请勿**运行 `git commit`/`push` 或发布——发布流程通过 GitHub Actions Release workflow 执行。

## Notes
- A/B 会启动真实的 **付费** `claude -p` 运行（opus，`--max-budget-usd`），2 条 arm × 3 个仓库。语料库目录 `/tmp/codegraph-corpus` 与 `/agent-eval` 共享，因此会复用克隆副本。
- 任何新的 `*.wasm` 必须放在 `src/extraction/wasm/` 下——`copy-assets`（由 `npm run build` 执行）会将其打包；否则它不会出现在 `dist/` 中。
- 索引必须由构建它的 **同一** 二进制文件提供服务。第 8 步先构建并链接开发构建，所以这一点已满足。
- 如果无法获取语法，或提取无法达到 PASS，**请停止并上报**——不要发布一个半成品语言。
