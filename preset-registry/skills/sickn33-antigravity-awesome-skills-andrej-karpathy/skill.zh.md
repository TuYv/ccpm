---
name: andrej-karpathy
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
risk: safe
source: community
source_repo: multica-ai/andrej-karpathy-skills
source_type: community
license: MIT
license_source: "https://github.com/multica-ai/andrej-karpathy-skills/blob/main/skills/karpathy-guidelines/SKILL.md"
date_added: '2026-03-06'
author: renat
tags:
- coding-guidelines
- code-review
- llm-coding
- simplicity
tools:
- claude-code
- antigravity
- cursor
- gemini-cli
- codex-cli
---
# Karpathy Guidelines

用于减少 LLM 编写代码时常见错误的行为准则，源自 Andrej Karpathy 关于 LLM 编码陷阱的[观察](https://x.com/karpathy/status/2015883857489522876)。

**权衡：** 这些准则倾向于谨慎优先于速度。对于琐碎任务，请自行斟酌。

## 何时使用此技能

- 在使用 LLM 编写、审查或重构代码时使用。
- 在改动必须保持外科手术式精准、避免投机性抽象时使用。
- 在需要明确说明假设、权衡和验证标准时使用。
- 在代码变得过于复杂、需要简化时使用。

## 1. 编码前先思考

**不要臆测。不要隐藏困惑。把权衡摆到明面上。**

实现之前：
- 明确说出你的假设。如果不确定，就提问。
- 如果存在多种理解，全部列出，不要默默挑一个。
- 如果存在更简单的做法，说出来。在必要时提出反对。
- 如果有不清楚的地方，停下来。指出困惑所在。提问。

## 2. 简单至上

**只写解决问题的最少代码。不写任何投机性的东西。**

- 不实现超出要求的功能。
- 不为一次性使用的代码引入抽象。
- 不添加未被要求的“灵活性”或“可配置性”。
- 不为不可能发生的场景做错误处理。
- 如果写了 200 行而其实 50 行就够，重写。

问问自己：“资深工程师会不会觉得这太复杂了？”如果会，就简化。

## 3. 外科手术式改动

**只动必须动的。只清理自己制造的烂摊子。**

编辑现有代码时：
- 不要“顺手改进”邻近的代码、注释或格式。
- 不要重构没有坏掉的东西。
- 遵循现有风格，即使你会用另一种方式来写。
- 如果注意到无关的死代码，提一下即可，不要删除。

当你的改动产生了孤儿代码：
- 移除因你自己的改动而不再被使用的导入/变量/函数。
- 不要移除原本就存在的死代码，除非被要求这么做。

检验标准：每一行被改动的代码都应能直接追溯到用户的请求。

## 4. 目标驱动执行

**定义成功标准。循环迭代直到验证通过。**

把任务转化为可验证的目标：
- “添加校验” -> “为非法输入编写测试，然后让测试通过”
- “修复 bug” -> “编写一个能复现它的测试，然后让测试通过”
- “重构 X” -> “确保重构前后测试都通过”

对于多步骤任务，先给出简要计划：

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

强成功标准让你能够自主循环迭代。诸如“让它跑起来”之类的弱标准则需要反复澄清。

## 示例

```text
User request: "Add validation to this form."

Better response:
1. Assumption: validation should run before submit and show inline errors.
2. Plan: add a small validator, add tests for invalid inputs, then verify existing submit behavior.
3. Scope: only touch the form component and its test file.
```

```text
User request: "Refactor this service."

Better response:
1. Ask what behavior must remain unchanged.
2. Identify a concrete smell, such as duplicated parsing logic.
3. Make the smallest refactor and run the existing service tests.
```

## 局限性

- 这些准则是行为上的护栏，不能替代项目特定的架构或风格规范。
- 对于紧急修复，应优先做经过验证的最小修正，而非大费周章的规划。
- 对于探索性原型，可以放宽部分谨慎要求，但假设和验证仍应表述明确。
