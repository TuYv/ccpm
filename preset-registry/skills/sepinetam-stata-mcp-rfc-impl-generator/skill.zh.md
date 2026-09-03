---
name: rfc-impl-generator
description: Generate RFC and IMPL documents from a user-provided feature/fix description. Use when the user says something like "I want to add a feature with codex", "Implement this", "Write an RFC for...", or provides a short idea that needs to be formalized into the ai-driven/rfc + ai-driven/impl pipeline.
allowed-tools: Read Grep Write Edit AskUserQuestion
---
# RFC/IMPL 文档生成器

将用户的功能或修复想法转换为一对配套文档——RFC（面向人类的设计文档）和 IMPL（面向 AI 的实现提示词），存放在 `ai-driven/` 目录中。

## 何时使用

- 用户说"我想添加 X 功能"
- 用户描述一个缺陷修复或改进
- 用户说"为……写一个 RFC"
- 用户给出的想法很简短，需要在编码前先正式化

## 工作流程

### 第 1 步. 接收用户的描述

用户提供一段简短的描述，说明他们想要什么。可以是一句话、一个段落，或对一个 GitHub issue 的引用。

### 第 2 步. 评估信息完整度

判断该描述是否足以写出有意义的 RFC 和 IMPL。问自己：

- 我是否理解这解决了**什么问题**？
- 我是否理解用户期望改动之后**会发生什么**？
- 我是否理解用户**何时/在何处**会使用它？
- 我是否知道**范围**（包含什么、不包含什么）？

如果其中任何一项不明确，进入第 3 步。如果全部明确，直接跳到第 4 步。

### 第 3 步. 提出澄清问题（如有需要）

使用 `AskUserQuestion` 收集缺失的信息。**关注预期结果和用户体验，而不是技术实现细节。**

**好的问题（问这些）：**
- "这次改动之后，用户应该看到或体验到什么？"
- "什么情况下会有人使用它？能讲一个具体的使用场景吗？"
- "它为你解决了什么问题？"
- "和你正在考虑的其他功能相比，它有多重要？"

**不好的问题（避免这些）：**
- "这应该是一个新参数还是一个配置选项？"
- "你想用 threading 还是 multiprocessing？"
- "我们应该用什么数据结构？"
- "我们应该把它缓存在 Redis 里还是文件里？"

**提问规则：**
- 每次问 1-2 个问题
- 每得到一个回答后，重新评估信息是否足够
- 如果仍有不明确之处，继续追问
- 一旦能够写出连贯的 RFC 和 IMPL，就停止提问

### 第 4 步. 生成文档

信息足够后，生成这两份文档。

#### 4.1 确定文件名

使用 `.claude/rules/ai-driven-coding.md` 中的命名约定：
- 如果有对应的 GitHub issue：`{issue-number}-{short-name}.md`
- 如果没有 issue：`{prefix}-{short-name}.md`（prefix = feat-、fix-、refactor-、perf-、docs-）

`short-name` 应为 2-4 个英文单词，使用 kebab-case。

如果你不确定 issue 编号或前缀，**在写入之前，请让用户确认文件名**。

#### 4.2 撰写 RFC

创建 `ai-driven/rfc/{filename}`。阅读 [references/rfc-template.md](references/rfc-template.md) 了解确切的结构，并将其复制作为起始骨架。

**RFC 规则：**
- 使用用户的自然语言撰写
- 不包含具体代码（无 diff、无真实实现）
- 不包含"未来工作"章节
- 关注"是什么"和"为什么"，而不是"怎么做"

#### 4.3 撰写 IMPL

创建 `ai-driven/impl/{filename}`。阅读 [references/impl-template.md](references/impl-template.md) 了解确切的结构，并将其复制作为起始骨架。

**IMPL 规则：**
- 使用英文撰写（面向 AI）
- 只用伪代码，不含真实可运行的代码
- 使用 "suggested"、"recommended"、"consider" 等措辞——给 AI 的判断留出空间
- 必须以 Checking List 结尾

### 第 5 步. 呈现给用户

生成两个文件之后：
1. 向用户展示两个文件路径
2. 用 2-3 句话总结所写内容
3. 询问他们是否想在移交给 Coding Agent 之前审阅或修改任何内容

## 参考文件

| 名称 | 位置 | 描述 |
|:---|:---|:---|
| RFC 模板 | `references/rfc-template.md` | 用于复制到新设计文档的空白 RFC 骨架 |
| IMPL 模板 | `references/impl-template.md` | 用于复制到新 AI 提示词的空白 IMPL 骨架 |
| RFC 示例 | `references/rfc-example.md` | 针对 issue #60（exit-clear-unix）的完整 RFC |
| IMPL 示例 | `references/impl-example.md` | 针对 issue #60 的完整 IMPL |
| 工作流示例 | `references/workflow-example.md` | 从模糊想法到 RFC+IMPL 配对的完整演示 |
---
