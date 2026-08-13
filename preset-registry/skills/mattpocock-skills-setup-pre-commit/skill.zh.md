---
name: setup-pre-commit
description: Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. Use when user wants to add pre-commit hooks, set up Husky, configure lint-staged, or add commit-time formatting/typechecking/testing.
---
# 设置 Pre-Commit Hooks

## 这一步配置了什么

- **Husky** pre-commit hook
- **lint-staged** 对所有已暂存文件运行 Prettier
- **Prettier** 配置（若缺失）
- 在 pre-commit hook 中的 **typecheck** 和 **test** 脚本

## 步骤

### 1. 检测包管理器

检查 `package-lock.json`（npm）、`pnpm-lock.yaml`（pnpm）、`yarn.lock`（yarn）、`bun.lockb`（bun）。使用存在的那个。无法确定时默认使用 npm。

### 2. 安装依赖

以 devDependencies 安装：

```bash
husky lint-staged prettier
```

### 3. 初始化 Husky

```bash
npx husky init
```

这会创建 `.husky/` 目录，并在 package.json 中添加 `prepare: "husky"`。

### 4. 创建 `.husky/pre-commit`

写入此文件（Husky v9+ 不需要 shebang）：

```bash
npx lint-staged
npm run typecheck
npm run test
```

**调整**：将 `npm` 替换为检测到的包管理器。如果仓库的 package.json 中没有 `typecheck` 或 `test` 脚本，则省略这些行，并告知用户。

### 5. 创建 `.lintstagedrc`

```json
{
  "*": "prettier --ignore-unknown --write"
}
```

### 6. 创建 `.prettierrc`（若缺失）

仅在不存在 Prettier 配置时创建。使用以下默认值：

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 80,
  "singleQuote": false,
  "trailingComma": "es5",
  "semi": true,
  "arrowParens": "always"
}
```

### 7. 验证

- [ ] `.husky/pre-commit` 存在且可执行
- [ ] `.lintstagedrc` 存在
- [ ] package.json 中的 `prepare` 脚本为 `"husky"`
- [ ] `prettier` 配置存在
- [ ] 运行 `npx lint-staged` 验证其可用性

### 8. 提交

暂存所有已修改/新建文件，并使用以下信息提交：`Add pre-commit hooks (husky + lint-staged + prettier)`

这会通过新的 pre-commit hooks 运行一次，作为良好的冒烟测试，确认一切工作正常。

## 注意事项

- Husky v9+ 的 hook 文件不需要 shebang
- `prettier --ignore-unknown` 会跳过 Prettier 无法解析的文件（如图片等）
- pre-commit 先运行 lint-staged（快速，仅限暂存），再运行完整的 typecheck 和 tests
