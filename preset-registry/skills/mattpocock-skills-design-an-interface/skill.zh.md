---
name: design-an-interface
description: Generate multiple radically different interface designs for a module using parallel sub-agents. Use when user wants to design an API, explore interface options, compare module shapes, or mentions "design it twice".
---
# 设计一个接口

基于《A Philosophy of Software Design》中的“Design It Twice”：你的第一个想法不太可能是最好的。先生成多个根本不同的设计，再进行比较。

## 工作流

### 1. 收集需求

在设计前，先了解：

- [ ] 这个模块要解决什么问题？
- [ ] 谁会调用它？（其他模块、外部用户、测试）
- [ ] 关键操作有哪些？
- [ ] 有哪些约束？（性能、兼容性、现有模式）
- [ ] 哪些内容应隐藏在内部，哪些应暴露？

提问：“这个模块需要做什么？谁会使用它？”

### 2. 生成设计（并行子代理）

使用 Task 工具同时启动 3 个以上子代理。每个代理必须给出一种**根本不同**的方案。

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

### 3. 呈现设计

展示每种设计时包括：

1. **接口签名** - 类型、方法、参数
2. **使用示例** - 调用方在实际中如何使用
3. **其隐藏内容** - 保持内部的复杂性

按顺序呈现各个设计，便于用户在比较前逐个吸收每种方案。

### 4. 比较设计

在展示全部设计后，比较以下方面：

- **接口简洁性**：更少的方法、更简单的参数
- **通用性与专用性**：灵活性与聚焦之间的平衡
- **实现效率**：接口形状是否允许高效实现？
- **深度**：小接口隐藏大量复杂性（良好）与大接口下薄实现（不佳）之间的差异
- **正确使用的便捷性**与**误用的风险**

用连贯文字讨论权衡，不要用表格。强调各设计差异最大的部分。

### 5. 综合

通常最佳设计往往融合多个方案的洞见。提问：

- “哪种设计最符合你的主要使用场景？”
- “其他设计中有哪些值得吸收的元素？”

## 评估标准

摘自《A Philosophy of Software Design》：

**接口简洁性**：更少的方法、更简单的参数，意味着更容易学习和正确使用。

**通用性**：无需改动即可应对未来用例。但是要警惕过度通用化。

**实现效率**：接口形态是否允许高效实现？还是会迫使出现笨拙的内部实现？

**深度**：小接口隐藏大量复杂性 = 深层模块（良好）。大接口配薄弱实现 = 浅层模块（应避免）。

## 反模式

- 不要让子代理产出相似的设计——要强制保持根本差异
- 不要跳过比较——价值在于对比
- 不要实现——这里只讨论接口形态
- 不要按实现工作量来评估
