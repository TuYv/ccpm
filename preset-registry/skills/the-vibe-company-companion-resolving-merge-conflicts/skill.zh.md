---
name: resolving-merge-conflicts
description: "Use when you need to resolve an in-progress git merge/rebase conflict."
---
1. **查看 merge/rebase 的当前状态**。检查 git 历史和发生冲突的文件。

2. **找到每个冲突的主要来源**。深入理解每处改动为何而做、原始意图是什么。阅读提交信息，查看 PR，查看原始 issue/ticket。

3. **解决每个 hunk。** 在可能的情况下保留双方的意图。当两者不兼容时，选择符合合并既定目标的那一方，并注明权衡取舍。**不要**发明新的行为。始终解决冲突，绝不使用 `--abort`。

4. 找出项目的**自动化检查**并运行它们，通常先是类型检查，然后是测试，最后是格式化。修复合并破坏的所有内容。

5. **完成 merge/rebase。** 暂存所有内容并提交。如果是在进行 rebase，则继续 rebase 流程，直到所有提交都完成 rebase。
