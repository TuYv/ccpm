---
name: resolving-merge-conflicts
description: "Use when you need to resolve an in-progress git merge/rebase conflict."
---
1. **查看合并/rebase 的当前状态。** 检查 git 历史记录和存在冲突的文件。

2. **查找每个冲突的第一手资料。** 深入理解每项更改的原因及其原始意图。阅读提交消息、查看 PR，并查阅原始 issue/ticket。

3. **解决每个冲突区块。** 尽可能保留双方意图。如果两者不兼容，选择符合此次合并既定目标的一方，并注明所作的权衡。**不要**臆造新行为。始终解决冲突；绝不使用 `--abort`。

4. 找出项目的**自动化检查**并运行它们，通常依次执行类型检查、测试和格式化。修复此次合并导致的任何问题。

5. **完成合并/rebase。** 暂存所有内容并提交。如果正在执行 rebase，则继续该过程，直到所有提交都完成 rebase。