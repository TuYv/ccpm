---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---
持续追问用户，直到达成共同理解。将其映射为一棵 **决策树**：每个决策都会分支出依赖于它的后续决策。

按 **轮次** 来推进这棵树。**前沿**（frontier）是指所有先决条件已经确定的决策——也就是你现在可以提问的问题，而无需猜测尚未得到的答案。一次性提出整个前沿的问题：给每个问题编号，并给出你建议的答案。然后等待用户回答后，再进入下一轮。

每个问题请按如下格式书写：

````
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
````

每一轮中用户的回答都会重塑这棵树——已解决的决策会把前沿向外扩展，并解锁依赖这些决策的问题。重新计算前沿并进入下一轮。若某个问题的答案依赖于本轮内另一道尚未解决的问题，那么它应该留到后续轮次，而不是现在提问。

事实发现是你的职责，而不是用户的。当前沿问题需要来自环境（文件系统、工具等）的事实时，派发一个子代理去获取，不要向用户询问你本可自己查到的内容。不要因此阻塞推进：进行中的探索是一个未决先决条件，因此只有其下游问题需要等待子代理返回——当前沿中的其他问题你可以继续提问。**决策**由用户做出——把每个决策交给用户并等待。

当前沿为空时，流程结束：设计树的每个分支都已访问，没有任何内容被悄然默认。在用户确认你已达成共享理解之前，不要据此采取行动。
