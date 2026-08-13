---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions
---
<SUBAGENT-STOP>
如果你被派遣为执行某个具体任务的子代理，请忽略这个技能。
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
如果你认为某个技能即使只有 1% 的几率可能适用于你正在做的事情，你就**必须**调用该技能。

如果某个技能适用于你的任务，你没有任何选择余地。你**必须**使用它。

这不允许协商。你不能通过合理化来绕过这个要求。
</EXTREMELY-IMPORTANT>

## 规则

**在任何响应或操作之前调用相关或被请求的技能**——包括澄清问题、探索代码库或检查文件。如果结果表明该技能在当前情境下不合适，你不必使用它。

**在进入 plan mode 前：**如果你尚未进行过头脑风暴，请先调用 `brainstorming` 技能。

然后宣布 "Using [skill] to [purpose]" 并严格按该技能执行。如果它有检查清单，请为每项创建一个待办事项。

## 技能优先级

当多个技能适用时，流程技能优先——它们决定方法，然后由实施技能（如 `frontend-design` 等）执行。`superpowers:brainstorming` 和 `systematic-debugging` 是 Superpowers 最常见的流程技能，但规则对任何此类技能都成立。

- "Let's build X" → `superpowers:brainstorming` first，然后实施技能。
- "Fix this bug" → `superpowers:systematic-debugging` first，然后领域技能。

## 红旗信号

这些想法意味着停止——你在进行自我合理化：

| 想法 | 现实 |
|------|------|
| “这只是一个简单问题” | 问题就是任务。检查是否有可用技能。 |
| “我先需要更多上下文” | 技能检查发生在澄清问题之前。 |
| “让我先探索代码库” | 技能告诉你该如何探索。先检查。 |
| “我可以快速检查 git/文件” | 文件不具备对话上下文。先检查技能。 |
| “让我先收集信息” | 技能告诉你如何收集信息。 |
| “这不需要正式技能” | 只要存在技能，就要使用。 |
| “我记得这个技能” | 技能会变化。请查看当前版本。 |
| “这不算是任务” | 行动就是任务。检查技能。 |
| “这个技能太复杂了” | 简单的事情会变复杂。使用它。 |
| “我先做这件事” | 先检查，然后再做任何事。 |
| “这看起来很有成效” | 无纪律的行动会浪费时间。技能能防止这种情况。 |
| “我知道这是什么意思” | 了解概念不等于调用技能。 |

## 平台适配

如果你的 harness 在这里出现，请读取其参考文件以获取特殊说明：

- Codex: `references/codex-tools.md`
- Pi: `references/pi-tools.md`
- Antigravity: `references/antigravity-tools.md`
- Hermes Agent: `references/hermes-tools.md`

## 用户说明

用户说明（`CLAUDE.md`、`AGENTS.md`、`GEMINI.md` 等，或直接请求）优先于技能，而技能又优于默认行为。只有当你的合作伙伴明确告诉你时，才可跳过技能流程或说明。
