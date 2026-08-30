---
name: cavecrew
description: >
  When to delegate to `cavecrew-investigator` (locate code), `cavecrew-builder`
  (1-2 file edit) or `cavecrew-reviewer` (diff review) instead of working inline
  or using `Explore`. Their output is compressed, so main context lasts longer.
---
Cavecrew = 三个生成穴居人风格输出的子代理预设。与 Anthropic 默认预设（`Explore`、编辑型代理、审查器）执行相同的任务；区别在于它们返回的工具结果经过压缩，因此每次委派后主上下文占用更小。

## 何时使用 cavecrew，而不是其他替代方案

| 任务 | 使用 |
|---|---|
|“X 定义在哪里 / Y 被谁调用 / 列出 Z 的使用位置”| `cavecrew-investigator` |
|相同任务，但还希望获得建议/架构方面的评论| `Explore`（原版） |
|外科手术式编辑，≤2 个文件，范围明确| `cavecrew-builder` |
|新功能 / 3 个以上文件 / 跨领域重构|主线程或 `feature-dev:code-architect` |
|审查 diff、分支或文件中的 bug| `cavecrew-reviewer` |
|带理由和替代方案的深入代码审查| `Code Reviewer`（原版） |
|你已经知道答案的一行问题|主线程，不使用子代理 |

经验法则：**如果你希望子代理的输出只有原来的 1/3 token，就选择 cavecrew。如果你希望得到散文式说明，就选择原版。**

## 为什么要这样做（真正的收益）

子代理的工具结果会原样注入主上下文。一个返回 2k token 散文的原版 `Explore`，每次调用都会消耗主上下文预算中的 2k token。同样的发现由 `cavecrew-investigator` 返回时，大约只需 700 token。在一次会话中委派 20 次，这可能决定你是耗尽上下文，还是能够完成任务。

## 输出契约

主线程可以依赖每个代理遵守以下输出格式：

**`cavecrew-investigator`**
```
<Header>:
- path:line — `symbol` — short note
totals: <counts>.
```
或者 `No match.` 始终以文件路径开头，并附带行号，符号使用反引号括起。可安全地使用 `path:\d+` 进行 grep。

**`cavecrew-builder`**
```
<path:line-range> — <change ≤10 words>.
verified: <re-read OK | mismatch @ path:line>.
```
或者使用以下值之一：`too-big.` / `needs-confirm.` / `ambiguous.` / `regressed.`（第一个 token 必须位于终端输出的开头）。

**`cavecrew-reviewer`**
```
path:line: <emoji> <severity>: <problem>. <fix>.
totals: N🔴 N🟡 N🔵 N❓
```
或者 `No issues.` 发现按文件排序，再按行号升序排列。

## 链式调用模式

**定位 → 修复 → 验证**（最常见）：
1. `cavecrew-investigator` 返回位置列表。
2. 主线程选择 1–2 个位置，并将路径交给 `cavecrew-builder`。
3. `cavecrew-reviewer` 审查 diff。

**并行侦察**（调查范围较广时）：
在一条消息中生成 2–3 个 `cavecrew-investigator` 调用（从不同角度进行：定义、调用方、测试）。在主线程中汇总结果。

**单次编辑**（位置已知时）：
跳过 investigator，直接将准确的 path:line 交给 `cavecrew-builder`。

## 不要这样做

- 不要在尚不知道文件位置时使用 `cavecrew-builder`。应先生成 investigator，或者主线程会在传递上下文时消耗 token。
- 不要为 5 个文件的重构链式调用 `cavecrew-investigator → cavecrew-builder`。Builder 会返回 `too-big.`，而你会浪费一次调用机会。
- 不要向 `cavecrew-reviewer` 请求“总体反馈”——它只返回发现，不提供架构观点。需要这类反馈时，请使用 `Code Reviewer`。
- 不要期待散文式说明。Cavecrew 的输出是结构化的，有时会简略到近乎晦涩。如果需要直接给人阅读，请进行改写。

## 自动清晰度（继承）

对于安全警告、不可逆操作确认，以及任何可能因片段式表达的歧义而被误解的输出，子代理会从“原始人式表达”切换为正常英语。之后恢复使用“原始人式表达”。