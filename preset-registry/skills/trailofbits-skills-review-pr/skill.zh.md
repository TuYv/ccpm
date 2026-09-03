---
name: review-pr
description: "Reviews the current branch's changes against its base branch as a pull request: correctness of new and modified code, test coverage for it, and documentation accuracy. Use when asked to review a branch, a diff, or a pull request."
allowed-tools: Read Grep Glob Bash
---
# PR 审查

审查分支的变更范围，而不是整个仓库。

1. 确定差异：`git diff <base>...HEAD`（当工作区包含属于该分支的未提交更改时，还需执行 `git diff <base>`）。基准分支由调用方指定；若未指定，则回退到 `main`。
2. 审查每个变更代码块的正确性：边缘输入导致的错误结果、未处理的错误路径，以及与函数名称或调用方相矛盾的行为。
3. 检查已变更行为的测试覆盖情况：新逻辑若没有测试覆盖其边缘情况，即记为一条发现。
4. 检查因该差异而变得过时的文档：README 或 docs 中在基准分支上为真、但在更改后变为假的陈述。
5. 报告发现的每个缺陷，并各自标明严重程度；包括轻微和信息性发现。不要报告分支未改动文件中的缺陷——它们不在该拉取请求的范围内。
