---
name: feature-tracking
description: Maintain portable Feature Track docs for project features. Use when designing, planning, implementing, reviewing, or finishing feature work; creating or updating PRD/API/design/implementation docs; adding a new feature; or validating docs/features.
---
# 功能跟踪

将功能跟踪用作功能工作的当前操作记忆。中立规范是唯一事实来源；此 Codex skill 仅作为适配器。

在更改功能文档之前，请先阅读 `references/spec.md`。

## 默认工作流程

在开始功能工作之前：

1. 如果存在，请阅读 `docs/features/README.md`。
2. 从请求、代码模块、路由、领域名称或现有文档中识别功能 ID。
3. 如果存在，请阅读 `docs/features/<feature-id>/README.md`。
4. 如果不存在跟踪记录，请创建一个并将其添加到索引中。

在工作期间，当行为、决策、端点、数据模型、依赖项、发布约束、测试或唯一事实来源链接发生变化时，更新功能跟踪记录。

完成之前：

1. 根据实际结果更新功能 README。
2. 如果状态、唯一事实来源链接、日期或备注发生变化，请更新 `docs/features/README.md`。
3. 在可用时运行验证：

```bash
python3 cli/feature_track.py validate --root .
```

如果项目未包含此 CLI，请使用此 skill 中的 `scripts/validate_feature_tracks.py`。