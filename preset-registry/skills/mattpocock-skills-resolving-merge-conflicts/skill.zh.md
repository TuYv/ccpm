---
name: resolving-merge-conflicts
description: "Use when you need to resolve an in-progress git merge/rebase conflict."
---
1. **查看当前状态** of the merge/rebase。检查 git 历史和冲突文件。

2. **查找每个冲突的主要来源**。深入理解每个变更为何被做出，以及其原始意图。阅读提交信息，查看 PR，查看原始的 issues/tickets。

3. **逐个解决 hunk。** 尽可能保留两个意图。若存在冲突，则选择与此次合并目标一致的方案，并说明取舍。**不要**发明新行为。始终解决冲突；切勿 `--abort`。

4. 找出项目的**自动化检查**并运行它们——通常是先 typecheck，再 tests，再 format。修复合并破坏的任何问题。

5. **完成 merge/rebase。** 暂存所有内容并提交。如果正在 rebase，请继续 rebase 流程，直到所有提交都完成 rebase。
