---
name: accint-commitments
description: Triage acc's open promises and close them with honest real-world verdicts via acc_act(runtime="outcome").
risk: critical
source: https://github.com/maxbaluev/accreted-intelligence/tree/main/plugins/claude/skills/commitments
source_repo: maxbaluev/accreted-intelligence
source_type: community
date_added: 2026-07-01
license: Apache-2.0
license_source: https://github.com/maxbaluev/accreted-intelligence/blob/main/LICENSE
---
# 承诺管理

## 何时使用

当你需要对 acc 的未关闭承诺进行分类处理，并通过 `acc_act(runtime="outcome")` 以真实世界的裁决结果将其关闭时，使用此技能。

这是在两个 MCP 动词上的路由封装——这里不包含任何逻辑。

1. 列出未关闭的承诺：`acc commitments`（CLI，只读观察）。
2. 对每个可关闭项执行：`acc_act(runtime="outcome", input={"ref": "<id>", "good": true|false, "note": "..."})`。
3. 证据来源规范：默认的 `self_graded` 是一个 WEAK 先验（信誉按 0.25× 计入）。
   仅在拥有者已核实时才传入 `owner`；仅当真实发生时才传入 `external`/`runtime`
   （真实回复、通过的测试、实际结果）。切勿将你自己的评分标记为真实。
4. 保持真正等待中的承诺处于打开状态——`waiting` 是一类一等公民的清洁状态。

## 限制

- 仅在任务与其上游来源及本地项目上下文明确匹配时使用此技能。
- 在应用更改前，先验证命令、生成的代码、依赖项、凭据以及外部服务行为。
- 不要将示例视为特定环境测试、安全评审或针对破坏性/高成本操作的用户批准替代。
