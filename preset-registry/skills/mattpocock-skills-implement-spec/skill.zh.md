---
name: implement-spec
description: "Implement a specification in code."
disable-model-invocation: true
---
你已获得一份 spec。该 spec 应有与之关联的 tickets，用于描述如何实现该 spec。

目标是在单个分支上创建一个实现完整 spec 的 PR。

这些 tickets 并不是步骤列表。它们是一个具有阻塞关系的**任务图**。这意味着始终存在一个由可立即领取的 tickets 构成的**前沿**。

与 subagents 之间的通信应尽量精简。主要通过指向 spec、tickets、研究笔记和先前 commits 的**上下文指针**进行沟通。不要重复指针所指内容中已有的信息。

应尽可能在后台运行 **Implementer subagents**，以实现**最大并发度**。

## 步骤

1. 阅读 spec 和 tickets。阅读足够的内容以理解任务图。

2. （可选）使用 **exploration subagent** 进行 tickets 所需的任何探索——包括相关的代码库文件或外部文档。确保 exploration subagent 能够保存文件——它应将 markdown 笔记保存在 repo 之外、所有后续 subagents 均可访问的目录中。这样可让 **implementer subagents** 专注于实现，而不是探索。

3. 创建一个分支和一个 draft PR。该 PR 应标记为“关闭”spec issue 和 tickets。

4. 使用 **implementer subagents** 实现每个 ticket。每个 implementer subagent 都应在自己的 worktree 和自己的分支中工作。

5. **implementer subagent** 完成后，使用 **merger subagent** 将其工作合并到 PR 分支。

6. 如果这改变了可用 tickets 的**前沿**，则启动更多 **implementer subagents** 来处理新的 tickets。这样可以实现最大并发度。

7. 所有 tickets 完成后，在 PR 分支上运行 /code-review。使用单个 **implementer subagent** 修复 code review 提出的所有问题。

8. 将 PR 标记为可供 review。

9. 清理所有 **implementer subagent** worktrees。