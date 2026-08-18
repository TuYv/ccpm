---
name: suede-recommend-next-action
description: "Next-action selector for the Suede pack: inspects current repo, terminal, plan, or handoff state read-only and returns one recommended next move plus a short, self-contained copy/paste prompt for it. Use when the user asks 'what's next', 'what should I do next', 'recommend the next move', 'give me the prompt', 'expand prompt', or 'make it granular', especially after a review, audit, plan, or stalled task. NOT FOR: executing the recommended action without the user's separate authorization, or coordinating a multi-lane build across specialists (use suede-agent-teams)."
---
# Suede 推荐下一步行动

推荐一项行动，并将其封装为一段简短、可运行的提示词。以只读方式检查当前状态；除非用户另行授权执行，否则不要执行所推荐的行动。在用户要求展开之前，隐藏完整的操作员契约。

## 推荐工作流

1. 根据当前请求、对话、交接记录、计划、代码仓库或实时界面，确定目标以及用户实际想要达成的结果。
2. 只检查足以区分下一步行动所需的证据。按以下优先顺序选择：当前终端/代码仓库/实时状态、当前源文档、当前计划或交接记录，然后是较早的记忆。执行读取，不要凭假设判断：使用 `git -C <target-repo> status --short --branch` 检查未提交文件以及领先/落后状态，使用 `git -C <target-repo> log --oneline -5` 检查实际已落地的内容，在指定的确切路径直接读取计划/STATE/交接文件，并且——当范围包含实时界面时——获取 URL 本身（`curl -sS -o /dev/null -w '%{http_code}' <url>`），不要相信上次记录的部署结果。任何不会改变候选行动排序的读取都可以跳过。
3. 在内部生成 2-4 个候选行动。排除已验证完成的工作、相邻的清理工作，以及超出用户授权范围的行动。
4. 按以下每项标准为每个候选行动打 0-2 分。推荐总分最高的行动。

| 标准 | 2 分 | 1 分 | 0 分 |
|---|---|---|---|
| 目标契合度 | 直接产生用户所需的完成信号 | 必需的前置条件 | 仅仅相关 |
| 解阻能力 | 解锁核心路径，或至少两个下游步骤 | 解锁一个步骤 | 没有已知的解锁作用 |
| 证据 | 已由当前来源确认 | 通过一次只读检查即可确认 | 依赖某个假设 |
| 紧迫性 | 当前故障、截止期限、安全风险或发布关卡 | 当前里程碑所需 | 当前没有压力 |
| 杠杆作用 | 适合一次专注的工作会话，并能防止返工或产出可复用结果 | 范围明确、收益中等的工作 | 无明确范围、需要数天或收益较低的工作 |

5. 如果出现平分，优先选择必需的前置条件，其次是基于当前证据的验证，最后是更可逆的行动。如果前两名的分数相差不超过 1 分，且目标歧义会改变答案，则最多再执行三次额外的只读检查。如果仍然平分，则展示两个选择，并说明决定二者的单一事实。
6. 将推荐内容转换为 2-4 句话的快速提示词。除非用户要求比较选项、`expand prompt` 或 `make it granular`，否则将评分和完整的操作员契约保留在内部。

## 路由规则

- 如果代码仓库或任务已经有自己的计划、进度文档、问题跟踪器或项目看板，不要再创建第二份。将其中记录的下一步作为一个候选行动，根据当前源进行验证，然后推荐胜出的行动——不要替换现有的跟踪工具。
- 如果用户需要在做出承诺前先探索选项，请说明这一点，并提议进行头脑风暴，而不是强行给出单一推荐。
- 如果缺失证据才是真正的阻塞因素，则将最小的只读检查作为推荐行动，并为该检查生成提示词。

## 提示词层级

三种提示词深度——简短复制/粘贴、完整操作员提示词、细化步骤——
位于 `references/prompt-levels.md`。默认使用简短提示词；仅当用户要求扩展或细化时才读取此文件。

## 输出格式

```text
Recommended action: <one sentence>
Why now: <one evidence-backed sentence>

Quick prompt: <2-4 runnable sentences>

Say "expand prompt" for the full operator version or "make it granular" for exact steps and commands.
```

仅当用户要求说明理由，或未解决的平局规则要求提供时，才展示路径、评分、证据列表、置信度或备选方案。当建议的下一步是收集证据时，应在 `Why now` 中说明这一点，而无需加载扩展提示词。

## 边界

- 在提出建议时，不要修改文件、代码仓库、部署、账户、消息或线上系统。
- 默认不要加载扩展提示词或细化提示词。
- 当可以选择一条当前执行路径时，不要重复进行宽泛审计。
- 不要虚构路径、URL、技能可用性、状态、指标、负责人或完成证据。
- 不要建议诸如“继续工作”“改进应用”或“做更多研究”等模糊行动。请明确指出命令、产物、决策、编辑内容或验证结果。
- 不要隐藏阻塞因素。如果缺少权限或决定性事实，应将解决它作为下一步行动。

## 路由

- 需要跨专业人员进行多路径协调 -> 使用 `suede-agent-teams`。
- 需要帮助选择哪个单一技能适合某个请求 -> 阅读此包的路由器（`suede-workflow-skills`），或直接询问。
- 需要在选择行动之前探索想法 -> 直接与用户进行头脑风暴，而不是强行给出单一建议。
- 需要执行 -> 使用生成的提示词中指定的专业人员。