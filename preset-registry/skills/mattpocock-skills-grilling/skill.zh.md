---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---
坚持不懈地访谈用户，直到达成共识。将其映射为一棵**设计树**：每项决策都会分支出依赖于它的其他决策。

按**轮次**推进这棵树。**前沿**是所有先决条件均已确定的决策：也就是你在_当前_无需猜测尚未获知的答案便可以提出的问题。在一轮中询问整个前沿：为每个问题编号，并给出你推荐的答案。然后等待用户回答，再进入下一轮。

每轮的格式如下：

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

用户在每轮中的回答都会重塑这棵树：已确定的决策会将前沿向外推进，并解锁依赖于这些决策的问题。重新计算前沿并询问下一轮问题。如果某个问题的答案依赖于本轮中另一个仍未确定的问题，那么它属于_后续_轮次，而不是本轮。

查明_事实_是你的工作，绝不能交给用户。当某个前沿问题需要从环境（文件系统、工具等）获取事实时，派遣子代理去查明；凡是你能自行查找的信息，都不要询问用户。不要因此阻塞：正在进行的探索是一项尚未确定的先决条件，因此只有其下游问题需要等待子代理报告；立即询问前沿中的其余问题。_决策_属于用户：将每项决策提交给用户，并等待其回答。

当前沿为空时，会话即告完成：设计树的每个分支都已遍历，没有任何未明说的假设。在用户确认你们已达成共识之前，不要据此采取行动。