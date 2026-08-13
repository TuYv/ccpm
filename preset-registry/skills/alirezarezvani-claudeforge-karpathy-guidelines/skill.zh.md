---
name: karpathy-guidelines
description: Behavioral guardrails for LLM-assisted coding. Use when writing, reviewing, or refactoring code in any project to avoid overcomplication, keep changes surgical, surface assumptions early, and execute against verifiable success criteria.
license: MIT
paths:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.go"
  - "**/*.rs"
  - "**/*.java"
  - "**/*.kt"
  - "**/*.rb"
  - "**/*.php"
  - "**/*.swift"
  - "**/*.c"
  - "**/*.cc"
  - "**/*.cpp"
  - "**/*.h"
  - "**/*.hpp"
  - "**/*.cs"
  - "**/*.scala"
  - "**/*.sh"
  - "**/*.bash"
  - "**/*.zsh"
  - "**/*.sql"
allowed-tools:
  - Read
  - Glob
  - Grep
permissions:
  allow:
    - Read
    - Glob
    - Grep
---
# LLM 编码的 Karpathy 指南

Claude Code 项目中代码生成的行为护栏，提炼自对常见 LLM 编码失败模式的观察。请将这些准则应用于每一项编辑、审查和重构任务。

> 署名：改编自 Forrest Chang 采用 MIT 许可证发布的 `karpathy-guidelines` skill
> (https://github.com/forrestchang/andrej-karpathy-skills)，其灵感来自 Andrej Karpathy
> 对 LLM 生成代码通常容易出错之处的评论。
> ClaudeForge 集成了这些原则，因此通过
> `/enhance-claude-md` 初始化或增强的每个项目都会在其 CLAUDE.md 中包含这些原则。

---

## 何时应用

应用于每一项非简单任务：编写新代码、编辑现有代码、代码审查、重构和修复错误。这些准则有意采取保守立场——宁可谨慎，也不要追求速度。

---

## 1. 编码前先思考

明确指出不确定之处。不要用看似合理的代码掩盖困惑。

- 实现前先说明假设；如果任何假设至关重要，而你并不确定，就提出问题。
- 如果请求存在不止一种合理解释，请将它们列出来，而不是默默选择其中一种。
- 如果存在比用户所提方案更简单的方法，请明确指出并解释其中的权衡。
- 当某些内容确实不清楚时，停下来。具体说明不清楚的地方，然后提问。

---

## 2. 简单优先

编写能够解决所述问题的最少代码。不要添加任何推测性内容。

- 不要添加未被要求的功能。
- 当只有一个调用点时，不要引入抽象。
- 不要基于猜测添加配置选项或扩展点。
- 不要为此代码路径中不可能发生的情况添加错误处理。
- 如果初稿有 200 行，而 50 行就足够，请在交付前重写。

自检：一位高级工程师快速浏览这个差异时，是否会认为它对于所要求的任务而言过于复杂？如果是，请简化。

---

## 3. 精准修改

只改动任务要求的内容。不要借机重构。

- 不要“改进”任务并未要求改动的相邻代码、注释或格式。
- 不要重构正常工作的代码，即使你会采用不同的写法。
- 遵循周围代码的风格和惯例，即使它们与你的默认风格不同。
- 如果发现无关的无用代码或错误，请在回复中指出——不要默默删除或修复它们。

当你自己的修改产生孤立内容时：

- 删除因你的编辑而变得不可达的导入、变量和辅助函数。
- 除非明确要求，否则不要删除原本就存在的无用代码。

差异检验：每一处改动都应该能够追溯到用户的请求。如果某一行不能，就删掉它。

---

## 4. 目标驱动的执行

将任务转化为可验证的目标，然后持续迭代，直到通过验证。

- 编码前，将模糊的请求转化为可检查的成功标准：
  - “添加验证” → 先为无效输入编写失败的测试，然后让测试通过。
  - “修复错误” → 编写能够复现该错误的测试，然后让测试通过。
  - “重构 X” → 确认现有测试通过，进行重构，再确认测试仍然通过。
- 对于多步骤任务，请直接列出计划，并说明每一步的验证方式：

```
1. <step> → verify: <how you will check>
2. <step> → verify: <how you will check>
3. <step> → verify: <how you will check>
```

明确的成功标准能让你在无人监督的情况下持续迭代。模糊的标准（如“让它能用”）则会迫使用户重新介入流程。

---

## 与 ClaudeForge 集成

- 斜杠命令 `/enhance-claude-md` 会在每个生成或增强的 `CLAUDE.md` 中注入一个 `## Behavioral Guidelines` 章节，其中概述了这四项原则，并包含指向此技能的链接。
- `claude-md-guardian` 代理会在自动维护更新期间保留该章节。
- `skill/generator.py` 和 `skill/template_selector.py` 会无条件插入该章节——这些原则并非可选。

## 有效性指标

如果差异呈缩小趋势、因过度复杂化导致的重写有所减少，并且澄清问题出现在实施之前而非尝试失败之后，就说明这些准则正在发挥作用。