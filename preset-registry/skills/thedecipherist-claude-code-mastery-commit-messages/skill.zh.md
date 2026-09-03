---
name: commit-messages
description: Generate clear, conventional commit messages from git diffs. Use when writing commit messages, reviewing staged changes, or preparing releases.
---
# Commit Message Skill

按照 Conventional Commits 规范生成一致且信息充分的提交信息。

## 何时使用此技能

- 用户要求 "commit"、"write a commit message" 或 "prepare commit"
- 用户已暂存更改并提到提交
- 在执行任何 `git commit` 命令之前

## 流程

1. **分析更改**：运行 `git diff --staged` 查看将要提交的内容
2. **确定类型**：判断主要更改类别
3. **确定作用域**：识别受影响的主要区域
4. **撰写信息**：遵循以下格式

## 提交信息格式

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 类型

| 类型 | 说明 | 示例 |
|------|-------------|---------|
| `feat` | 新功能 | `feat(auth): add OAuth2 login` |
| `fix` | Bug 修复 | `fix(api): handle null response` |
| `docs` | 仅文档更改 | `docs(readme): add setup instructions` |
| `style` | 格式调整，不改变代码 | `style: fix indentation` |
| `refactor` | 代码更改，既非新功能也非修复 | `refactor(db): extract query builder` |
| `perf` | 性能改进 | `perf(search): add result caching` |
| `test` | 添加/修复测试 | `test(auth): add login unit tests` |
| `build` | 构建系统更改 | `build: update webpack config` |
| `ci` | CI 配置 | `ci: add GitHub Actions workflow` |
| `chore` | 维护任务 | `chore(deps): update dependencies` |
| `revert` | 回退之前的提交 | `revert: feat(auth): add OAuth2` |

### 作用域

作用域应是一个描述代码库相关部分的名词：
- `auth`、`api`、`db`、`ui`、`config`
- 功能名称：`search`、`checkout`、`dashboard`
- 若更改涉及面较广，则可省略

### 主题行规则

- 使用祈使语气：用 "add" 而非 "added" 或 "adds"
- 冒号后的首字母不要大写
- 结尾不加句号
- 总长不超过 72 个字符

### 正文（如有需要）

- 与主题之间用空行分隔
- 解释*是什么*和*为什么*，而非*怎么做*
- 每 72 个字符换行
- 多项更改时使用项目符号列表

### 脚注（如有需要）

- `BREAKING CHANGE:` 用于标记破坏性更改
- `Fixes #123` 用于关闭 issue
- `Refs #456` 用于仅引用而不关闭

## 示例

### 简单功能
```
feat(search): add fuzzy matching support

Implement Levenshtein distance algorithm for typo tolerance
in search queries. Configurable via FUZZY_THRESHOLD env var.
```

### 带 issue 引用的缺陷修复
```
fix(cart): prevent duplicate items on rapid clicks

Add debounce to add-to-cart button and check for existing
items before insertion.

Fixes #234
```

### 破坏性更改
```
feat(api)!: change response format to JSON:API

BREAKING CHANGE: API responses now follow JSON:API spec.
All clients need to update their parsers.

- Wrap data in `data` object
- Move metadata to `meta` object  
- Add `links` for pagination
```

### 多项相关更改
```
refactor(auth): consolidate authentication logic

- Extract JWT handling to dedicated service
- Move session management from controller to middleware
- Add refresh token rotation

This prepares for the upcoming OAuth2 integration.
```

## 输出

生成提交信息时：

1. 展示已暂存更改的摘要
2. 提出提交信息建议
3. 若类型/作用域的选择不够直观，则解释原因
4. 询问用户是否继续或修改
