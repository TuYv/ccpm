---
name: create-branch
description: Create a git branch following Sentry naming conventions. Use when asked to "create a branch", "new branch", "start a branch", "make a branch", "switch to a new branch", or when starting new work on the default branch.
argument-hint: '[optional description of the work]'
---
# 创建分支

按照 Sentry 命名约定创建 git 分支。
除非用户明确要求手动选择名称，否则此工作流应保持非交互式。

## 工作流

1. 确定工作描述：
   - 如果存在 `$ARGUMENTS`，则使用它
   - 否则检查：
     ```bash
     git diff
     git diff --cached
     git status --short
     ```
   - 如果存在本地更改，则根据差异生成简短描述
   - 如果没有本地更改，则使用通用描述，例如 `repo-maintenance`、`tooling-update` 或 `work-in-progress`

2. 对分支类型进行分类：

| 类型 | 使用场景 |
|------|----------|
| `feat` | 新功能 |
| `fix` | 修复原本无法正常工作的行为 |
| `ref` | 行为保持不变，但结构发生变化 |
| `chore` | 维护现有工具或配置 |
| `perf` | 行为相同，但速度更快 |
| `style` | 仅视觉或格式变更 |
| `docs` | 仅文档变更 |
| `test` | 仅测试变更 |
| `ci` | CI/CD 配置 |
| `build` | 构建系统 |
| `meta` | 仓库元数据 |
| `license` | 许可证变更 |

   不确定时：新内容使用 `feat`，重构使用 `ref`，维护使用 `chore`。

3. 生成 `<type>/<short-description>`。
   `<short-description>` 应使用 kebab-case、仅包含 ASCII 字符，并且最好由 3 到 6 个单词组成。

4. 无需提示即可选择基础分支：
   ```bash
   git branch --show-current
   git remote | grep -qx origin && echo origin || git remote | head -1
   git symbolic-ref refs/remotes/<remote>/HEAD 2>/dev/null | sed 's|refs/remotes/<remote>/||' | tr -d '[:space:]'
   ```
   - 如果默认分支检测失败，则依次回退到 `main`、`master`，最后回退到当前分支
   - 如果当前处于分离 HEAD 状态，则从当前提交创建分支
   - 如果已经位于非默认分支，则从当前分支创建分支
   - 仅当用户明确要求时才切换到默认分支

5. 如果名称发生冲突，则依次追加 `-2`、`-3` 等，直到该名称在本地和远程均未被使用。

6. 创建分支：
   ```bash
   git checkout -b <branch-name>
   ```
   报告最终的分支名称，但不要停下来等待确认。

## 参考资料

- [Sentry 分支命名](https://develop.sentry.dev/sdk/getting-started/standards/code-submission/#branch-naming)