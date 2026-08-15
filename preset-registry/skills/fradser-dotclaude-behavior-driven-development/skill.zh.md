---
name: behavior-driven-development
description: Applies behavior-driven development principles including Gherkin scenarios and test-driven development. This skill should be used when the user asks to implement features, fix bugs, or when writing executable specifications and tests before writing production code.
user-invocable: false
---
# 行为驱动开发（BDD）技能

本技能提供了一份全面指南，帮助你将行为驱动开发原则应用于编码任务。BDD 不仅仅关乎工具；它是一种促进共同理解和高质量实现的方法论。

## 如何使用本技能

当用户提出功能开发、缺陷修复或重构请求时，请采用以下思维方式：

1.  **先理解行为：** 在明确系统*应该做什么*之前，不要开始编码。
2.  **定义场景：** 创建或询问预期行为的具体示例（Gherkin）。
3.  **通过测试驱动实现：** 使用红-绿-重构循环。

## 核心概念

### 1. BDD 循环
该流程从需求推进到代码：
*   **发现：** 通过示例澄清需求（“三剑客”）。
*   **描述：** 将这些示例编写为具体场景（Given/When/Then）。
*   **自动化：** 使用 TDD 进行实现。

详细指南请参阅 [BDD 最佳实践](./references/bdd-best-practices.md)。

### 2. 编写场景（Gherkin）
场景是你的“可执行规范”。
*   保持声明式表达（聚焦业务）。
*   避免技术术语和 UI 细节。
*   每个场景只描述一种行为。
*   **将场景存储在 .feature 文件中，而不是作为代码注释**——这样可以使其可执行，并便于非技术利益相关者访问。

有关语法和存储结构，请参阅 [Cucumber Gherkin 指南](./references/gherkin-guide.md)。

### 3. 红-绿-重构（TDD）
实现过程的引擎：
1.  **红：** 为场景（或其中一个单元）编写一个失败的测试。
2.  **绿：** 编写使测试通过所需的最少代码。
3.  **重构：** 在保持测试通过的同时清理代码。

## 快速参考：铁律

> **“没有先失败的测试，就不编写生产代码。”**

如果你在测试之前编写代码：
1.  你无法知道该测试是否具备失败的能力（假阳性）。
2.  你会受到自身实现方式的影响。
3.  你从第一天起就在编写遗留代码。