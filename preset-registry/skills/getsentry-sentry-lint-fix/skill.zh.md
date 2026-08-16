---
name: lint-fix
description: Fix violations of an eslintPluginScraps rule across the codebase. Use when asked to "fix lint violations", "apply a lint rule", "fix scraps rule errors", "roll out a lint rule", "enforce a rule codebase-wide", or "fix design system lint". Covers manual fixes, autofix, batching, and codemod strategies for large-scale rollouts.
---
修复匹配 `$1` 的文件中违反规则 `$0` 的问题。

## 参数

- `$0` — 规则名称（例如 `use-semantic-token`、`no-core-import`）
- `$1` — 文件或 glob 模式（例如 `static/app/components/`、`static/app/views/alerts/`）

## 第 1 步：理解规则

在修复违规问题之前，先了解正确的修复方式。加载 [references/fix-patterns.md](references/fix-patterns.md)，查看各规则的修复详情：

| 规则                         | 是否支持自动修复？ | 修复参考                                                                                          |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------------------------------- |
| `no-core-import`             | 是                 | [fix-patterns.md](references/fix-patterns.md) §no-core-import                                     |
| `no-token-import`            | 否                 | [fix-patterns.md](references/fix-patterns.md) §no-token-import                                    |
| `use-semantic-token`         | 否                 | [fix-patterns.md](references/fix-patterns.md) + [token-taxonomy.md](references/token-taxonomy.md) |
| `restrict-jsx-slot-children` | 否                 | [fix-patterns.md](references/fix-patterns.md) §restrict-jsx-slot-children                         |

对于 `use-semantic-token` 违规问题，你必须加载 [references/token-taxonomy.md](references/token-taxonomy.md)，以了解每个 CSS 属性应使用哪个令牌类别。

## 第 2 步：评估规模

在选择策略之前，先统计违规问题的数量：

```bash
pnpm exec eslint --rule '@sentry/scraps/$0: error' "$1" 2>&1 | tail -5
```

最后一行会显示数量（例如，“42 problems (42 errors, 0 warnings)”）。

**提示**：在整个 `static/app/` 上运行 eslint 可能需要 2 分钟以上。请先将范围缩小到某个子目录。

## 第 3 步：选择策略

### 可自动修复的规则（任何规模）

```bash
pnpm exec eslint --fix --rule '@sentry/scraps/$0: error' "$1"
```

提交前，始终要检查 `--fix` 生成的差异。如果规则只能部分自动修复，请先运行 `--fix`，然后手动修复剩余的违规问题。

### 少于 100 个违规问题——由代理手动修复

1. 在目标路径上运行 eslint
2. 每次修复 5-10 个文件中的违规问题
3. 每批修复后重新运行以验证
4. 重复执行，直到不再有违规问题

### 100-500 个违规问题——分批修复

1. 将目标拆分为多个子目录（例如 `static/app/views/`、`static/app/components/`）
2. 每次修复一个子目录
3. 每批修复后提交，以便 PR 易于审查
4. 每批修复后重新统计数量，以跟踪进度

### 500 个以上违规问题——代码模组或分阶段推行

- **机械式转换**：编写一个临时的 jscodeshift 代码模组，或使用 `@typescript-eslint/typescript-estree` 编写针对性脚本
- **导入路径规则**：无论规模多大，`--fix` 通常都能处理这些规则
- **复杂转换**：先将规则启用为 `warn`，再通过多个 PR 分批修复

## 修复工作流（紧密循环）

1. 运行：`pnpm exec eslint --rule '@sentry/scraps/$0: error' "$1"`
2. 修复报告文件中的违规问题
3. 在已更改的文件上重新运行以验证
4. 扩大范围并重复执行

## 协调大规模变更

- 根据 @.github/CODEOWNERS 中的所有权规则，将 PR 拆分为每个包含 **约 50 个变更文件**。
- PR 标题约定：`fix(lint): enforce @sentry/scraps/$0 for <codeowner>`
- 如果规则是新增的，且尚未加入 `eslint.config.ts`，请**先修复所有违规问题**，然后在后续 PR 中启用该规则。
- 提交前，对变更的文件运行预提交检查：
  ```bash
  .venv/bin/prek run -q --files <file1> [file2 ...]
  ```

## 验证

完成所有修复后：

```bash
pnpm exec eslint --rule '@sentry/scraps/$0: error' static/app/ 2>&1 | tail -5
```

应报告 0 个问题。