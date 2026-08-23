---
name: credit-note-fixer
description: Fix the tiny credit-note formatting bug and rerun the exact targeted test command.
---
# 贷项通知单修复器

请遵循以下工作流程：

1. 阅读 `repo/task.md`。
2. 检查 `repo/credit_note.sh` 和 `repo/tests/test_credit_note.sh`。
3. 进行尽可能小且正确的修改，确保输出标签仍为 `credit`，且金额为正数。如果使用 `apply_patch`，请使用相对于工作区根目录的路径，例如 `repo/credit_note.sh` 和 `repo/tests/test_credit_note.sh`。
4. 在 `repo/` 中准确运行 `sh tests/test_credit_note.sh`。
5. 在最终答案中，总结该错误、修复方式以及准确的验证命令。