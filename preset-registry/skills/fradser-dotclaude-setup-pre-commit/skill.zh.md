---
name: setup-pre-commit
description: Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. Use when user wants to add pre-commit hooks, set up Husky, configure lint-staged, or add commit-time formatting/typechecking/testing.
---
# 设置 Pre-Commit 钩子

## 此操作将设置的内容

- **Husky** pre-commit 钩子
- **lint-staged**，对所有暂存文件运行 Prettier
- **Prettier** 配置（如果缺失）
- pre-commit 钩子中的 **typecheck** 和 **test** 脚本

## 步骤

### 1. 检测包管理器

检查是否存在 `package-lock.json` (npm)、`pnpm-lock.yaml` (pnpm)、`yarn.lock` (yarn)、`bun.lockb` (bun)。使用检测到的包管理器。如果无法确定，则默认使用 npm。

### 2. 安装依赖项

将以下包安装为 devDependencies：

```
husky lint-staged prettier
```

### 3. 初始化 Husky

```bash
npx husky init
```

这会创建 `.husky/` 目录，并将 `prepare: "husky"` 添加到 package.json。

### 4. 创建 `.husky/pre-commit`

写入以下文件内容（Husky v9+ 不需要 shebang）：

```
npx lint-staged
npm run typecheck
npm run test
```

**调整**：将 `npm` 替换为检测到的包管理器。如果仓库的 package.json 中没有 `typecheck` 或 `test` 脚本，请省略对应行并告知用户。

### 5. 创建 `.lintstagedrc`

```json
{
  "*": "prettier --ignore-unknown --write"
}
```

### 6. 创建 `.prettierrc`（如果缺失）

仅当不存在 Prettier 配置时才创建。使用以下默认值：

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
- [ ] 运行 `npx lint-staged`，验证其是否正常工作

### 8. 提交

暂存所有已更改或创建的文件，并使用以下消息提交：`Add pre-commit hooks (husky + lint-staged + prettier)`

这将运行新的 pre-commit 钩子——这是验证一切是否正常工作的良好冒烟测试。

## 注意事项

- Husky v9+ 的钩子文件不需要 shebang
- `prettier --ignore-unknown` 会跳过 Prettier 无法解析的文件（图片等）
- pre-commit 会先运行 lint-staged（速度快，仅处理暂存文件），然后执行完整的 typecheck 和测试