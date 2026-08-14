---
name: memory-ci-capture
description: Synthesize GitHub delivery context into a concise Basic Memory project update. Use in CI after `bm ci collect` prepares a ProjectUpdateContext; return only structured AgentSynthesis JSON for `bm ci publish`.
---
# Memory CI 捕获

将一次有意义的 GitHub 交付时刻转化为项目记忆。GitHub 记录过程机制。Basic Memory 记住发生了什么变化以及变化的原因。

## 输入

读取由 `bm ci collect` 生成、位于 `.github/basic-memory/project-update-context.json` 的 `ProjectUpdateContext` JSON。将其视为仓库、事件类型、PR 编号、工作流运行、SHA、源 URL、时间戳和部署环境不可变的事实来源。

不要虚构测试、部署检查、关联议题、产品影响或决策。如果缺少证据，请在 `verification` 中简要说明，或将该字段留空。

## 输出

仅返回符合 `AgentSynthesis` 结构的 JSON：

```json
{
  "summary": "What changed.",
  "why_it_matters": "Why this update matters for future humans and agents.",
  "user_facing_changes": [],
  "internal_changes": [],
  "verification": [],
  "follow_ups": [],
  "decision_candidates": [],
  "task_candidates": []
}
```

## 综合规则

- 优先使用简短说明，而不是逐条提交的变更日志。
- 保留上下文中存在的意图、行为变化、源链接、验证证据和具体的后续事项。
- 仅当源上下文明确包含产品或架构决策时，才将其放入 `decision_candidates`。
- 仅当未来工作足够具体、可以付诸行动时，才将其放入 `task_candidates`。
- 保持语气客观且实用。这是项目记忆，不是营销文案。

## 事件指南

对于已合并的拉取请求，重点说明该 PR 存在的原因、变更涉及的领域、推进或关闭了哪些议题，以及上下文中包含哪些验证证据。

对于生产环境部署，重点说明哪些内容已进入生产环境、已部署的 SHA、环境、工作流运行以及验证证据。不要对成功作出超出工作流和源事实所能支持的断言。