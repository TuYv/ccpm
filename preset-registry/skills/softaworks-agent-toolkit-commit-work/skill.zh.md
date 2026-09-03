---
name: commit-work
description: "Create high-quality git commits: review/stage intended changes, split into logical commits, and write clear commit messages (including Conventional Commits). Use when the user asks to commit, craft a commit message, stage changes, or split work into multiple commits."
---
# 提交工作

## 目标
创建易于评审且可安全上线的提交：
- 只包含有意的变更
- 提交具有合理的逻辑范围（必要时拆分）
- 提交信息说明改了什么以及为什么

## 需要确认的输入（如缺失）
- 单次提交还是多次提交？（如果不确定：当存在无关变更时，默认拆分为多个小提交。）
- 提交风格：必须使用 Conventional Commits。
- 其他规则：主题最大长度、必需的 scope 等。

## 工作流程（清单）
1) 暂存前先检查工作区
   - `git status`
   - `git diff`（未暂存的变更）
   - 如果变更很多：`git diff --stat`
2) 确定提交边界（必要时拆分）
   - 拆分依据：新功能 vs 重构、后端 vs 前端、格式化 vs 逻辑、测试 vs 生产代码、依赖升级 vs 行为变更。
   - 如果不同变更混在同一个文件里，计划使用补丁式暂存。
3) 只暂存属于下一个提交的内容
   - 混合变更优先使用补丁式暂存：`git add -p`
   - 取消暂存某个代码块/文件：`git restore --staged -p` 或 `git restore --staged <path>`
4) 检查实际将被提交的内容
   - `git diff --cached`
   - 合理性检查：
     - 没有密钥或令牌
     - 没有误留的调试日志
     - 没有无关的格式化改动
5) 用一到两句话描述已暂存的变更（在写提交信息之前）
   - “改了什么？”＋“为什么？”
   - 如果无法清晰描述，说明这个提交可能太大或太混杂；回到第 2 步。
6) 编写提交信息
   - 使用 Conventional Commits（必需）：
     - `type(scope): short summary`
     - 空行
     - 正文（改了什么/为什么，而不是实现过程记录）
     - 如有需要，附 footer（BREAKING CHANGE）
   - 多行提交信息优先使用编辑器：`git commit -v`
   - 如有帮助，可参考 `references/commit-message-template.md`。
7) 运行最小规模的相关验证
   - 在继续之前，运行仓库中最快且有效的检查（单元测试、lint 或构建）。
8) 对下一个提交重复上述步骤，直到工作区干净

## 交付物
提供：
- 最终的提交信息
- 每个提交的简短摘要（改了什么/为什么）
- 用于暂存/检查的命令（至少包括：`git diff --cached`，以及运行过的任何测试）
