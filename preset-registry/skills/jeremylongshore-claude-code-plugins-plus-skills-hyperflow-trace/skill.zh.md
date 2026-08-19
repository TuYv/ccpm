---
name: hyperflow-trace
description: Hyperflow debugging. Use for bugs, test failures, runtime errors, broken builds, or "this doesn't work" reports — verbs like debug, "fix it", solve, "why is X failing", "Y is broken", or a pasted stack trace. Systematic root-cause analysis before any patch — never blind-patch symptoms.
---
# hyperflow-trace — 根因阶段（Antigravity 单智能体）

在进行任何更改之前先找出根因。遵循 `hyperflow` 准则。

## 步骤

1. **复现 / 定位。** 阅读错误、堆栈跟踪或失败的测试。确定确切的失败行，以及实际行为与预期行为之间的差异。
2. **5 个为什么。** 反向追踪因果链——持续询问“为什么”，直到找到真正的原因，而不是症状。
3. **假设。** 列出 2-4 个最合理的原因。对于每个原因，说明一个低成本的测试（读取文件、添加日志、运行一个测试），用于确认或排除该原因。执行这些测试，将范围缩小到真正的原因。
4. **确认**根因并提供证据（失败的断言、打印出的值、复现的路径）。不要基于猜测进行修复。
5. **最小化地修复**根因。添加或更新一个本应捕获该问题的测试（在行为变更之前先添加特征测试）。
6. **验证**：重新运行失败用例及其周边测试套件。自查差异（L1-L3）。以 `fix(<scope>): <root cause>` 的形式提交（遵循 conventional，使用小写）。

## 规则

- 绝不要盲目修补症状来让错误消息消失。
- 除非有人要求，否则不得进行超出修复范围的行为变更。
- 如果在测试假设后仍无法明确根因，请说明你发现的内容以及仍未知的部分——不要提交推测性的修复。