---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---
持续追问用户，直到双方达成共识。将这个过程绘制成一棵**设计树**：每个决策都会分叉出挂在其下的各项决策。

以**轮次**来推进这棵树。**边界**是指所有前置问题已经敲定的决策：即你_现在_就能提出、而无需猜测尚未听到的答案的那些问题。在每一轮中一次性提出整个边界上的所有问题：为每个问题编号，并给出你的推荐答案。然后等待用户作答，再进入下一轮。

每一轮的格式如下：

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

用户的每一次作答都会重塑这棵树：已敲定的决策将边界向外推进，并解锁依赖于它们的那些问题。重新计算边界，然后提出下一轮问题。如果某个问题的答案依赖于本轮中仍然悬而未决的另一个问题，它就属于_更晚_的轮次，而不是本轮。

查找_事实_是你的职责，永远不是用户的。当边界上的某个问题需要来自环境的事实（文件系统、工具等）时，派出一个子代理去查找；凡是自己能查到的东西，就不要去问用户。不要为此阻塞等待：一个仍在进行的探索就是尚未敲定的前置问题，因此只有位于其下游的问题需要等待子代理汇报；边界上的其余问题现在就提出来。而_决策_则属于用户：把每个决策摆到他们面前，然后等待。

当边界为空时，本次会话即告完成：设计树的每个分支都已遍历，没有任何事项被默默假定。在用户确认你们已达成共识之前，不要据此采取行动。
