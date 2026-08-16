---
name: design-an-interface
description: Generate multiple radically different interface designs for a module using parallel sub-agents. Use when user wants to design an API, explore interface options, compare module shapes, or mentions "design it twice".
---
# 设计一个接口

基于《软件设计的哲学》中的“设计两次”原则：你的第一个想法不太可能是最佳方案。生成多个截然不同的设计，然后进行比较。

## 工作流程

### 1. 收集需求

在设计之前，先了解：

- [ ] 这个模块解决什么问题？
- [ ] 调用方是谁？（其他模块、外部用户、测试）
- [ ] 关键操作有哪些？
- [ ] 是否存在任何约束？（性能、兼容性、现有模式）
- [ ] 哪些内容应该隐藏在内部，哪些应该暴露出来？

询问：“这个模块需要做什么？谁会使用它？”

### 2. 生成设计（并行子智能体）

使用 Task 工具同时启动 3 个以上的子智能体。每个子智能体都必须提出一种**截然不同**的方案。

```
Prompt template for each sub-agent:

Design an interface for: [module description]

Requirements: [gathered requirements]

Constraints for this design: [assign a different constraint to each agent]
- Agent 1: "Minimize method count - aim for 1-3 methods max"
- Agent 2: "Maximize flexibility - support many use cases"
- Agent 3: "Optimize for the most common case"
- Agent 4: "Take inspiration from [specific paradigm/library]"

Output format:
1. Interface signature (types/methods)
2. Usage example (how caller uses it)
3. What this design hides internally
4. Trade-offs of this approach
```

### 3. 展示设计

展示每种设计时，应包含：

1. **接口签名**——类型、方法、参数
2. **使用示例**——调用方在实践中如何实际使用它
3. **它隐藏的内容**——保留在内部的复杂性

依次展示各个设计，以便用户在进行比较之前充分理解每种方案。

### 4. 比较设计

展示完所有设计后，从以下方面进行比较：

- **接口简洁性**：方法更少、参数更简单
- **通用与专用**：灵活性与专注度
- **实现效率**：接口形态是否允许高效的内部实现？
- **深度**：小型接口隐藏大量复杂性（好），还是大型接口搭配单薄实现（不好）
- **易于正确使用**与**易于误用**

使用文字而非表格讨论权衡。重点指出各个设计之间差异最大的方面。

### 5. 综合设计

最佳设计通常会结合多个方案中的洞见。询问：

- “哪种设计最适合你的主要使用场景？”
- “是否值得纳入其他设计中的某些元素？”

## 评估标准

源自《软件设计的哲学》：

**接口简洁性**：方法越少、参数越简单，就越容易学习和正确使用。

**通用性**：无需修改即可处理未来的使用场景。但要注意避免过度泛化。

**实现效率**：接口形态是否允许高效实现？还是会迫使内部实现变得别扭？

**深度**：小型接口隐藏大量复杂性 = 深模块（好）。大型接口搭配单薄实现 = 浅模块（应避免）。

## 反模式

- 不要让子智能体生成相似的设计——必须确保它们截然不同
- 不要跳过比较——价值在于对比
- 不要进行实现——这里纯粹关注接口形态
- 不要根据实现工作量进行评估