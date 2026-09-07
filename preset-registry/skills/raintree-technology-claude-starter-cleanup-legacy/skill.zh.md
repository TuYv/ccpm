---
name: cleanup-legacy
description: "Find and remove deprecated, legacy, and fallback code paths with zero callers. Verifies callers via repo grep + LSP before deletion. Removes unreachable fallback branches. Use when the user asks to remove deprecated code, clean up legacy paths, drop fallbacks, or simplify code branches. Example queries — \"remove the deprecated API\", \"drop the v1 fallback\", \"this code is marked legacy, kill it\", \"simplify these branches\"."
argument-hint: "[scope (optional path or glob)]"
user-invocable: true
---
查找标记为 deprecated/legacy/old/v1 的代码，并在删除前确认其确实不再被使用。同时查找不可达的回退分支（例如已翻转的功能开关默认值、针对不再受支持运行时的版本检查）。

## 预检

1. **语言检测** — 适用于所有语言。
2. **Git 状态**：工作树有未提交改动时拒绝执行。
3. **报告目录**：确保其存在。
4. 读取项目使用的弃用标记。常见的有：
   - `@deprecated` JSDoc/TSDoc
   - `# deprecated` Python 注释，`warnings.warn(DeprecationWarning)`
   - `// Deprecated:` Go 惯例
   - `#[deprecated]` Rust 属性
   - 文件/目录命名：`legacy/`、`old/`、`v1/`、`_old.ts`
5. 如存在**功能开关配置**则读取它 — 对于 100% 开启且没有反向测试的开关，其 `else` 分支可以被删除。

## 检测

### 标记 grep（多语言）
```bash
grep -rn --include="*.ts" --include="*.tsx" --include="*.js" --include="*.py" --include="*.go" --include="*.rs" \
  -E "(@deprecated|# ?deprecated|// ?Deprecated|#\[deprecated|warnings\.warn.*Deprecation|TODO.*remove|FIXME.*legacy)" \
  --exclude-dir=node_modules --exclude-dir=dist . > /tmp/deprecated.txt

# Files/dirs with legacy naming
find . -type d \( -name "legacy" -o -name "old" -o -name "v1" -o -name "_archive" \) -not -path "*/node_modules/*" > /tmp/legacy-dirs.txt
find . -type f \( -name "*_old.*" -o -name "*-legacy.*" -o -name "*.deprecated.*" \) > /tmp/legacy-files.txt
```

### 调用方验证（TS/JS）
对每个被弃用的符号，若有 ts-server / LSP 可用则先用其统计引用数，否则回退到 grep：
```bash
# For function `oldFn` exported from `lib/old.ts`:
grep -rn "oldFn" --include="*.ts" --include="*.tsx" . | grep -v "lib/old.ts" | wc -l
```

### 调用方验证（Python）
```bash
grep -rn "from .*old_mod import\|import old_mod" --include="*.py" .
```

### 回退分支
寻找以下模式：
- `if (process.env.NEW_FEATURE === 'true') { /* new */ } else { /* old */ }` — 若该环境变量在所有配置中均为 true，则旧分支已死。
- `if version >= 2: /* new */ else: /* old */` — 若最低版本已提升超过阈值。
- 针对不受支持环境的浏览器/运行时检查（例如仅限浏览器包中的 `if (typeof window === 'undefined')`）。

## 评估

写入 `.claude/cleanup-reports/cleanup-legacy-{YYYY-MM-DD}.md`：

```markdown
# Legacy Code Assessment — YYYY-MM-DD

## Summary
- Deprecated symbols found: N
  - HIGH (zero callers): X — safe to delete
  - MEDIUM (1-5 callers): Y — needs migration
  - LOW (heavy use): Z — deprecated in name but actively used
- Legacy directories: M
- Dead fallback branches: K

## Findings

### HIGH — `packages/utils/src/format-old.ts`
- Marked `@deprecated` in an older commit and unused by current callers.
- Exports: `formatV1`, `parseV1`. Repo grep shows zero usages outside the file.
- Action: delete file.

### HIGH — `apps/app/lib/feature-flags.ts:45-60`
- Branch: `if (NEW_DASHBOARD_ENABLED) { ... } else { renderOldDashboard() }`.
- Flag is `true` in all envs (`.env`, `.env.staging`, `.env.production`) and has been for 6+ months per git log.
- Action: remove the else branch + the flag check + the `renderOldDashboard` function (cascade).

### MEDIUM — `domains/billing/legacy.ts`
- 8 callers across 3 packages.
- Marked deprecated 3 months ago. Migration path documented in inline comment to use `domains/billing/v2`.
- Recommendation: do NOT delete. Provide a migration list to the human; this needs sequencing.

### LOW — `lib/utils/oldHelper.ts`
- Marked `@deprecated` but has 47 active callers.
- Either the deprecation is aspirational with no migration plan, or it was incorrectly marked. Flag for human review of the deprecation.

## Critical Assessment
[2-3 paragraphs: what's the pattern of deprecation in this codebase? Are deprecations followed by deletion? Are there feature flags that should have been cleaned up months ago? Are "legacy" directories accumulating but not draining?]
```

## 执行

**仅自动删除 HIGH 级别的项。**

### 置信度评判标准

**HIGH（自动删除）：**
- 已标记弃用且在仓库中零引用（通过 grep 覆盖所有相关文件扩展名验证，而不仅是该文件自身的扩展名）。
- 回退分支的条件在所有环境中可证明恒为真或恒为假，且已持续 90 天以上（通过环境文件的 git blame 确认）。
- 位于 `legacy/` 或 `_archive/` 目录中且在非 legacy 代码中零引用的文件。

**MEDIUM（仅报告）：**
- 已弃用但有 1-N 个调用方 — 需要迁移计划。
- 回退分支的条件因环境而异或改动时间较近。
- 弃用不足 30 天的符号 — 给使用方留出时间。

**LOW（仅记录）：**
- 已标记弃用但被大量使用的符号 — 弃用标记本身存疑。
- 处理用户输入/运行时条件（而非功能开关）的回退分支 — 这些不是死代码，而是真实分支。

### 执行（仅 HIGH）

1. 删除文件或移除代码块。
2. 级联处理：若被删除的代码是某个内部辅助函数的唯一使用方，则该辅助函数现在也成了死代码 — 对其重新运行调用方检查。迭代直至稳定。
3. 若功能开关对应的分支被删除，则移除该开关的声明（环境变量、配置项、开关服务定义）。
4. 单次提交：`chore(cleanup): cleanup-legacy — removed N deprecated symbols and M dead branches`。

## 验证

```bash
bun run check 2>&1 || npx tsc --noEmit && npx eslint .
bun test 2>&1
pytest 2>&1
go test ./... 2>&1
cargo test 2>&1

# If knip is installed, run it — newly-orphaned exports may surface
bunx knip 2>&1 || true
```

若验证失败：回滚并降低该项级别。级联步骤是最可能出错的环节 — 某个“已死”的辅助函数可能被初始 grep 遗漏的代码所使用。

## 输出

- “已移除 N 个弃用项、M 个死分支。K 个项暂缓以待迁移规划。”
- 报告路径。
- 验证状态。

## 禁止事项

- 绝不在某个 `@deprecated` 符号仍有任何调用方时删除它，即使迁移方案看起来很“显而易见”。
- 绝不在检查全部（ALL）配置环境（`.env*`、`config/*.json`、开关服务设置）之前删除功能开关分支。
- 绝不删除 `legacy/` 目录中仍被其他生产代码导入的文件 — 必须先验证。
- 绝不删除支持多个运行时版本的库中的版本检查分支（例如 polyfill）。
- 绝不删除迁移文件，即使它们已经“过时”。
- 绝不删除用于防御运行时条件（网络故障、缺少环境变量等）的回退分支 — 那些不是死代码。
- 绝不在 CI/CD 或基础设施仍引用某个功能开关定义时自动删除它（检查 Terraform、GitHub Actions、部署脚本）。
