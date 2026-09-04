---
name: lesson-learned
description: "Analyze recent code changes via git history and extract software engineering lessons. Use when the user asks 'what is the lesson here?', 'what can I learn from this?', 'engineering takeaway', 'what did I just learn?', 'reflect on this code', or wants to extract principles from recent work."
---
# 经验总结

从实际的代码变更中提炼具体、有据可依的软件工程经验。这不是说教 —— 而是一面镜子。向用户展示其代码本身已经体现出的东西。

## 开始之前

**先加载原则参考文档。**

1. 阅读 `references/se-principles.md`，确保原则目录可用
2. 如果你怀疑这些变更中存在可改进之处，可选择阅读 `references/anti-patterns.md`
3. 确定分析范围（见阶段 1）

**至少在加载了 `se-principles.md` 之后，才能继续。**

## 阶段 1：确定范围

向用户询问，或根据上下文推断要分析的内容。

| 范围 | Git 命令 | 使用时机 |
|-------|-------------|-------------|
| 功能分支 | `git log main..HEAD --oneline` + `git diff main...HEAD` | 用户位于非主分支（默认） |
| 最近 N 次提交 | `git log --oneline -N` + `git diff HEAD~N..HEAD` | 用户指定了范围，或位于主分支（默认 N=5） |
| 特定提交 | `git show <sha>` | 用户提到了某个特定的提交 |
| 工作区变更 | `git diff` + `git diff --cached` | 用户在提交前说“这些变更怎么样？” |

**默认行为：**
- 如果位于功能分支：分析分支提交与 main 的差异
- 如果位于 main：分析最近 5 次提交
- 如果用户给出了不同的范围，则按该范围分析

## 阶段 2：收集变更

1. 使用确定的范围运行 `git log`，获取提交列表和提交信息
2. 运行 `git diff` 获取该范围的完整差异
3. 如果差异很大（>500 行），先使用 `git diff --stat`，再选择性地阅读改动最多的前 3-5 个文件
4. **仔细阅读提交信息** —— 它们包含原始差异中看不到的意图
5. 只阅读已变更的文件。不要阅读整个代码仓库。

## 阶段 3：分析

识别**主导模式** —— 即这些变更中最具启发性的那一件事。

寻找：
- **结构性决策** —— 代码是如何组织的？为何划定这些边界？
- **做出的权衡** —— 得到了什么，又牺牲了什么？（可读性 vs. 性能、DRY vs. 清晰度、速度 vs. 正确性）
- **解决的问题** —— 变更前后有何不同？是什么让“变更后”更好？
- **错失的机会** —— 代码在哪些地方可以改进？（以温和的口吻呈现，如“下次可以考虑……”）

将发现对应到 `references/se-principles.md` 中的具体原则。要具体 —— 引用真实代码，指明实际的文件名和行变更。

## 阶段 4：呈现经验

使用以下模板：

```markdown
## Lesson: [Principle Name]

**What happened in the code:**
[2-3 sentences describing the specific change, referencing files and commits]

**The principle at work:**
[1-2 sentences explaining the SE principle]

**Why it matters:**
[1-2 sentences on the practical consequence -- what would go wrong without this, or what goes right because of it]

**Takeaway for next time:**
[One concrete, actionable sentence the user can apply to future work]
```

如果还有值得记录的第二条经验（最多额外 2 条）：

```markdown
---

### Also worth noting: [Principle Name]

**In the code:** [1 sentence]
**The principle:** [1 sentence]
**Takeaway:** [1 sentence]
```

## 不要做的事

| 应避免 | 原因 | 替代做法 |
|-------|-----|---------|
| 罗列每条勉强适用的原则 | 信息过载且流于空泛 | 只挑最相关的 1-2 条 |
| 分析未变更的文件 | 范围蔓延 | 只针对差异内容 |
| 忽略提交信息 | 它们包含差异所遗漏的意图 | 将其作为首要背景来阅读 |
| 与代码脱节的抽象建议 | 无法落地执行 | 始终引用具体的文件/行 |
| 只有负面反馈 | 打击士气 | 先肯定有效之处，再提出改进建议 |
| 超过 3 条经验 | 稀释了洞察 | 一条有理有据的经验胜过七条含糊的经验 |

## 对话风格

- **是反思，而非说教。** 以用户自己的代码作为主要证据。
- **绝不说“你本应该……”** —— 改用“这里的做法体现了……”或“下次遇到这种情况，可以考虑……”
- **如果代码写得好，就明说。** 并非每条经验都关于哪里做错了。认可好的模式有助于强化它们。
- **如果变更很琐碎**（单次配置微调、一处拼写修复），就如实说明，而不是硬凑一条经验。“这些变更很简单直接 —— 这里没有深刻的教训，只是良好的日常维护。”
- **要具体。** 泛泛的建议毫无价值。每个论断都必须指向具体的代码变更。
