---
name: bm-decide
description: Capture a durable engineering decision in Basic Memory with rationale, alternatives, consequences, and affected work.
---
# 记录决策

当用户作出或要求记录一项长期有效的选择时使用此流程。决策是具有理由和后果的选择，而不是随意的偏好。

## 步骤

1. 依次解析 `~/.codex/basic-memory.json` 和最近项目中的 `.codex/basic-memory.json`；项目键会覆盖用户键：
   - 设置了 `primaryProject` 时，写入该项目
   - 当 `placementConventions` 对目录有明确规定时，遵循该规定
   - 否则使用 `codex/decisions`

   在起草笔记之前应用 `bm-writing` 技能。

2. 仅当选择本身存在歧义时才进行澄清。如果对话中已经包含理由，不要逐一询问每个字段。

3. 编写一条 `type: decision` 笔记：
   - 除非用户说明该决策已被接受、取代或拒绝，否则使用 `status: open`
   - `decided: <已知时填写 ISO 时间戳>`
   - `project: <已知时填写 primaryProject>`

4. 包括：
   - 决策
   - 背景
   - 理由
   - 考虑过的替代方案
   - 后果
   - 受影响的文件、规范、议题、PR 或笔记

5. 使用永久链接进行确认。如果此决策取代了较早的决策，请更新旧笔记，或使用 `supersedes` 链接旧笔记。