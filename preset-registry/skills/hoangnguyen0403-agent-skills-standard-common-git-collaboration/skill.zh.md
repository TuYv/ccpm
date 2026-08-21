---
name: common-git-collaboration
description: Enforce version control best practices for commits, branching, pull requests, and repository security. Use when writing commits, creating branches, merging, or opening pull requests.
metadata:
  triggers:
    keywords:
    - commit
    - branch
    - merge
    - pull-request
    - git
---
# Git 与协作

## **优先级：P0（关键）**

## 1. 编写约定式提交

- 格式：`<type>(<scope>): <description>`（例如，`feat(auth): add login validation`）。
- 类型：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`chore`。
- 使用祈使语气：使用“add feature”，而不是“added feature”。
- 一次提交 = 一项逻辑变更——不要创建巨型提交。

有关约定式提交的示例，请参阅[实现示例](references/implementation.md)。

## 2. 管理分支

- 使用以下前缀命名：`feat/`、`fix/`、`hotfix/`、`refactor/`、`docs/`。
- 为每项任务创建新分支，以确保 main 分支稳定且可部署。
- 切勿直接推送到 `main` 或 `develop`——应使用拉取请求。
- 推送前先拉取，以便在本地解决冲突。
- 在功能分支上，优先使用 `git rebase` 而不是合并，以保持线性历史。
- 推送前使用 `git rebase -i` 压缩杂乱的提交。

## 3. 提交高质量的拉取请求

- 将代码变更限制在 300 行以内，以便进行有效审查。
- 说明变更内容、变更原因以及测试方法。关联议题（`Closes #123`）。
- 请求同事审查前先自行审查，排除明显错误。
- 拉取请求必须通过所有 CI 检查（代码检查、测试、构建）后才能合并。

## 4. 保护机密信息和元数据

- 切勿提交 `.env`、密钥或证书——严格使用 `.gitignore`。
- 使用 `husky` 或 `lefthook` 在本地强制执行 Git 钩子。
- 使用 SemVer（`vX.Y.Z`）标记发布版本，并更新 `CHANGELOG.md`。

## 反模式

- **禁止直接推送到 main**：所有变更都必须通过拉取请求，无一例外。
- **禁止巨型提交**：一次提交 = 一项逻辑变更。拆分大型提交。
- **禁止在历史记录中保留机密信息**：使用 `git filter-repo` 清除，并轮换机密信息。

## 参考资料

- [整洁的线性历史与变基示例](references/CLEAN_HISTORY.md)