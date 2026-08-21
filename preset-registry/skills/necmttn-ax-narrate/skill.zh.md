---
name: ax-narrate
description: Write the agent-generated narration of the current session - the reviewable story of what changed, including what never reaches a PR (user corrections, abandoned attempts, tool failures). Triggers on "narrate this session", "summarize what changed", "write the session story", "narrate what we did", "session narration". Output is .ax/narrations/<session-id>.json for the ax studio narration view. Do NOT fire on "summarize this file" or generic recap questions answered inline - this skill writes a structured artifact.
role: verification
---
# ax:narrate - 将会话故事写成结构化叙事

你亲历了整个过程。此技能会将你自己对会话的记忆转化为一份
可供审阅的产物：按照阅读流程排列 3-7 个停靠点，每个停靠点都以
真实证据为锚点——代码片段、轮次编号、用户引述、失败记录。其
目的在于捕捉 PR 差异永远无法呈现的内容：纠正、死胡同与恢复过程。

该产物会依据
`apps/studio/src/routes/narration-types.ts` 中的 `SessionNarration`
进行验证，并在 ax studio 中渲染。

## 第 1 步 - 识别会话

- 首选：运行 `ax sessions here --days=1 --json`，然后选择当前
  会话的 id（即与本次对话匹配的会话）。使用短 id。
- 如果 `ax` 不可用，或者会话尚未被摄取，则生成一个
  slug：`<repo>-<YYYYMMDD-HHmm>`。在 `meta` 中注明，在这种情况下，
  轮次 seq 是尽力而为估算的序号。
- 如果可用，`ax sessions show <id> --json` 会提供可供锚定的真实轮次
  seq。优先使用真实 seq，而不是猜测值。

## 第 2 步 - 根据你自己的上下文重建故事

在开始写作之前，先在脑海中重新回顾这段对话：

1. 用户最初提出了什么要求？（意图）
2. 之前存在什么，现在又存在什么？（之前/之后）
3. 用户在哪里引导你改变方向或纠正了你？其中的每一处都要成为一个
   `correction` 锚点。无一例外。
4. 哪些工具失败真正产生了影响（改变了你的处理方式、耗费了
   实质性时间、迫使你采用变通方案）？每一次都要成为一个 `tool_failure`
   锚点。跳过那些没有造成任何改变的琐碎重试。
5. 哪些尝试被放弃了？它们应获得一个停靠点，或者至少一个
   `turn` 锚点——放弃也是故事的一部分。

## 第 3 步 - 按阅读流程顺序选择 3-7 个停靠点

停靠点是一个逻辑变更单元，而不是一个文件。如果三个文件出于同一个
原因发生变更，那么它们就是一个包含多个锚点的停靠点。排序规则
（借鉴自代码导览手册，因为它们确实有效）：

- 入口点优先：先呈现那个仅凭自身就能帮助理解其余内容的变更。
- 先因后果：先呈现纠正，再呈现由它引发的代码变更。
- 先定义后使用：类型/模式停靠点应位于使用方停靠点之前。
- 验证放在最后：测试、类型检查，以及过程中遇到的失败。
- 将琐碎的整理工作合并到最后一个停靠点中，或者将其省略。

## 第 4 步 - 编写每个停靠点

- **title**：简短而友好。使用“调用次数变成字符差异统计”，
  而不是“对 files-touched.ts 的更改”。
- **gist**：一句话。不能是两句。即使读者不看其他任何内容，也必须能
  从 gist 中理解这个停靠点。使用对话式表达，就像你向同事讲述一样。
- **detail**：2-4 句 markdown（段落、`inline code`、
  **加粗**）。说明变更为何采用这种形式；“我们选择 X 而不是 Y，
  因为 Z”正是读者想了解的内容。
- **transition**：连接到下一个停靠点的简短过渡语；最后一个停靠点使用空
  字符串 `""`。
- **anchors**：不得为空。没有锚点的停靠点就是没有依据的主张。锚点种类：

| kind | 必填字段 | 用途 |
|---|---|---|
| `file_hunk` | `file`, `old_text`, `new_text`, `label`, 可选 `turn_seq` | 真实的代码变更 |
| `code_state` | `artifact`, `label`, `lang`, `code`, 可选 `turn_seq` | 持续演变的架构快照 |
| `turn` | `turn_seq`, `label` | 对话记录中的普通时刻 |
| `user_direction` | `turn_seq`, `quote` | 用户引导（而非纠正） |
| `correction` | `turn_seq`, `quote`, `outcome` | 用户纠正方向 |
| `tool_failure` | `turn_seq`, `tool`, `error_excerpt`, `recovery` | 造成实际影响的失败 |
| `term` | `name`, `definition` | 故事所依赖的领域术语 |

### 硬性锚点规则

- `file_hunk` 包含你实际所做编辑中逐字一致的旧/新片段——复制真实文本，绝不要改述代码。保持代码块简短（每侧 5-15 行）；选择最能说明问题的片段，而不是整个编辑内容。纯插入时使用 `old_text: null`，纯删除时使用 `new_text: null`。绝不能两者都为 null。
- 会话中的每次用户纠正/调整方向都应有一个 `correction` 锚点，其中包含逐字一致（经过首尾裁剪）的 `quote` 和具体的 `outcome`——即因此实际发生了什么变化。
- 每次具有实质影响的工具故障都应有一个 `tool_failure` 锚点，其中包含真实的 `error_excerpt`，以及你如何恢复（或填写 `"abandoned"`）。
- 绝不要捏造轮次序号。如果可以获取，请使用 `ax sessions show` 中的序号；否则从对话开始计算用户轮次，并在详情中说明这一点。
- `code_state` 是叙述的架构主干：选择一个稳定的 `artifact` id（例如 `"review-architecture"`），并在设计发生变化的每一站重新陈述完整快照——类型/接口的伪代码、它们如何组合，以及调用栈（计划式：`Caller -> Callee // note`）。同一工件的连续快照会在 studio 中逐 token 动画呈现，因此各站之间共享的行必须逐字节完全一致，只让真实的差异发生变化——新增的方法、重命名的结构、增加的边界情况。使用 `code_state` 表示不断演进的设计；使用 `file_hunk` 表示一次性的代码跳变（它们会渲染为静态的前后差异，而不是动画）。

## 第 5 步——生成工件

将 `.ax/narrations/<session-id>.json` 写入磁盘（如有需要，创建目录），并且顶层结构必须严格如下：

```json
{
  "schema_version": 1,
  "kind": "narration",
  "meta": {
    "session_id": "<id>",
    "generated_at": "<ISO-8601 now>",
    "generator": "skill",
    "model": "<your model id>"
  },
  "title": "...",
  "intent": "...",
  "before": "...",
  "after": "...",
  "stops": [ { "title": "...", "gist": "...", "detail": "...", "transition": "...", "anchors": [ ... ] } ]
}
```

完成前，请依据验证器规则进行自检：

- `stops` 非空（3-7 个），且每一站的 `anchors` 都非空。
- 每个 gist 都是一个句子；每个 `correction` 都有一个 `outcome`；每个 `tool_failure` 都有一个 `recovery`；不存在两侧均为 null 或空值的 `file_hunk`。
- 字符串是普通 JSON 字符串（代码片段中的换行应转义为 `\n`）。

然后告诉用户文件保存到了哪里，并用两行概述你所写的故事。不要把完整的 JSON 粘贴到聊天中。