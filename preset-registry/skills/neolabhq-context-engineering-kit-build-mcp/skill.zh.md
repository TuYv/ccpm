---
name: build-mcp
description: Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).
---
# MCP 服务器开发指南

## 概述

要创建高质量的 MCP（模型上下文协议）服务器，使 LLM 能够有效地与外部服务交互，请使用此 Skill。MCP 服务器提供工具，使 LLM 能够访问外部服务和 API。MCP 服务器的质量取决于它能否通过所提供的工具，帮助 LLM 完成现实世界中的任务。

---

# 流程

## 🚀 高层工作流程

创建高质量的 MCP 服务器包括四个主要阶段：

### 阶段 1：深入研究与规划

#### 1.1 理解以智能体为中心的设计原则

在深入实现之前，请先阅读以下原则，了解如何为 AI 智能体设计工具：

**面向工作流构建，而非仅面向 API 端点：**

- 不要只是简单封装现有 API 端点，而应构建经过深思熟虑、具有高影响力的工作流工具
- 整合相关操作（例如，`schedule_event` 可同时检查可用时间并创建事件）
- 专注于能够完成完整任务的工具，而不只是单个 API 调用
- 考虑智能体实际需要完成哪些工作流

**针对有限上下文进行优化：**

- 智能体的上下文窗口有限——让每个 token 都发挥作用
- 返回高价值信息，而不是详尽的数据堆积
- 提供“简洁”和“详细”响应格式选项
- 默认使用人类可读的标识符，而不是技术代码（优先使用名称而非 ID）
- 将智能体的上下文预算视为稀缺资源

**设计可操作的错误消息：**

- 错误消息应引导智能体采用正确的使用方式
- 建议具体的后续步骤：“尝试使用 filter='active_only' 来减少结果数量”
- 让错误消息具有指导意义，而不只是用于诊断
- 通过清晰的反馈帮助智能体学习正确的工具用法

**遵循自然的任务划分方式：**

- 工具名称应反映人类思考任务的方式
- 使用一致的前缀对相关工具进行分组，以便发现
- 围绕自然工作流设计工具，而不只是遵循 API 结构

**采用评估驱动的开发方式：**

- 尽早创建真实的评估场景
- 让智能体反馈推动工具改进
- 快速构建原型，并根据智能体的实际表现进行迭代

#### 1.3 学习 MCP 协议文档

**获取最新的 MCP 协议文档：**

使用 WebFetch 加载：`https://modelcontextprotocol.io/llms-full.txt`

这份综合文档包含完整的 MCP 规范和指南。

#### 1.4 学习框架文档

**加载并阅读以下参考文件：**

- **MCP 最佳实践**：[📋 查看最佳实践](./reference/mcp_best_practices.md) - 适用于所有 MCP 服务器的核心指南

**对于 Python 实现，还需加载：**

- **Python SDK 文档**：使用 WebFetch 加载 `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- [🐍 Python 实现指南](./reference/python_mcp_server.md) - Python 专用的最佳实践和示例

**对于 Node/TypeScript 实现，还需加载：**

- **TypeScript SDK 文档**：使用 WebFetch 加载 `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- [⚡ TypeScript 实现指南](./reference/node_mcp_server.md) - Node/TypeScript 专用的最佳实践和示例

#### 1.5 全面研读 API 文档

要集成一项服务，请通读**所有**可用的 API 文档：

- 官方 API 参考文档
- 身份认证和授权要求
- 速率限制和分页模式
- 错误响应和状态码
- 可用端点及其参数
- 数据模型和模式

**为了收集全面的信息，请根据需要使用 Web 搜索和 WebFetch 工具。**

#### 1.6 制定全面的实施计划

根据你的研究，制定一份包含以下内容的详细计划：

**工具选择：**

- 列出最值得实现的端点/操作
- 优先考虑能够支持最常见和最重要用例的工具
- 考虑哪些工具可以协同工作，以支持复杂工作流

**共享实用程序和辅助函数：**

- 识别常见的 API 请求模式
- 规划分页辅助函数
- 设计筛选和格式化实用程序
- 规划错误处理策略

**输入/输出设计：**

- 定义输入验证模型（Python 使用 Pydantic，TypeScript 使用 Zod）
- 设计一致的响应格式（例如 JSON 或 Markdown），以及可配置的详细程度（例如详细或简洁）
- 规划大规模使用场景（数千名用户/数千个资源）
- 实现字符限制和截断策略（例如 25,000 个 token）

**错误处理策略：**

- 规划优雅的失败模式
- 设计清晰、可操作、对 LLM 友好的自然语言错误消息，以提示后续操作
- 考虑速率限制和超时场景
- 处理身份认证和授权错误

---

### 阶段 2：实施

现在你已经有了一份全面的计划，请遵循特定语言的最佳实践开始实施。

#### 2.1 设置项目结构

**对于 Python：**

- 创建单个 `.py` 文件；如果项目较复杂，则将其组织为多个模块（参见 [🐍 Python 指南](./reference/python_mcp_server.md)）
- 使用 MCP Python SDK 注册工具
- 定义用于输入验证的 Pydantic 模型

**对于 Node/TypeScript：**

- 创建适当的项目结构（参见 [⚡ TypeScript 指南](./reference/node_mcp_server.md)）
- 设置 `package.json` 和 `tsconfig.json`
- 使用 MCP TypeScript SDK
- 定义用于输入验证的 Zod 模式

#### 2.2 首先实现核心基础设施

**开始实施时，请先创建共享实用程序，再实现工具：**

- API 请求辅助函数
- 错误处理实用程序
- 响应格式化函数（JSON 和 Markdown）
- 分页辅助函数
- 身份认证/token 管理

#### 2.3 系统化地实现工具

对于计划中的每个工具：

**定义输入模式：**

- 使用 Pydantic（Python）或 Zod（TypeScript）进行验证
- 包含适当的约束（最小/最大长度、正则表达式模式、最小/最大值、范围）
- 提供清晰且具有描述性的字段说明
- 在字段说明中包含多样化的示例

**编写全面的文档字符串/说明：**

- 用一行概述工具的功能
- 详细说明其用途和功能
- 明确说明参数类型并提供示例
- 完整的返回类型模式
- 使用示例（何时使用、何时不应使用）
- 错误处理文档，说明遇到特定错误时应如何继续操作

**实现工具逻辑：**

- 使用共享实用工具以避免代码重复
- 对所有 I/O 遵循 async/await 模式
- 实现适当的错误处理
- 支持多种响应格式（JSON 和 Markdown）
- 遵循分页参数
- 检查字符限制并进行适当截断

**添加工具注解：**

- `readOnlyHint`: true（用于只读操作）
- `destructiveHint`: false（用于非破坏性操作）
- `idempotentHint`: true（如果重复调用具有相同效果）
- `openWorldHint`: true（如果与外部系统交互）

#### 2.4 遵循特定语言的最佳实践

**此时，请加载适当的语言指南：**

**对于 Python：加载 [🐍 Python 实现指南](./reference/python_mcp_server.md)并确保满足以下要求：**

- 使用 MCP Python SDK 并正确注册工具
- 使用带有 `model_config` 的 Pydantic v2 模型
- 全面使用类型提示
- 对所有 I/O 操作使用 async/await
- 正确组织导入
- 使用模块级常量（CHARACTER_LIMIT、API_BASE_URL）

**对于 Node/TypeScript：加载 [⚡ TypeScript 实现指南](./reference/node_mcp_server.md)并确保满足以下要求：**

- 正确使用 `server.registerTool`
- 使用带有 `.strict()` 的 Zod schema
- 启用 TypeScript 严格模式
- 不使用 `any` 类型——使用适当的类型
- 使用显式的 Promise<T> 返回类型
- 配置构建流程（`npm run build`）

---

### 阶段 3：审查与完善

完成初始实现后：

#### 3.1 代码质量审查

为确保质量，请从以下方面审查代码：

- **DRY 原则**：工具之间不存在重复代码
- **可组合性**：将共享逻辑提取到函数中
- **一致性**：相似操作返回相似的格式
- **错误处理**：所有外部调用都有错误处理
- **类型安全**：完整的类型覆盖（Python 类型提示、TypeScript 类型）
- **文档**：每个工具都有全面的文档字符串/描述

#### 3.2 测试与构建

**重要提示：**MCP 服务器是长时间运行的进程，通过 stdio/stdin 或 sse/http 等待请求。直接在主进程中运行它们（例如 `python server.py` 或 `node dist/index.js`）会导致进程无限期挂起。

**安全测试服务器的方法：**

- 使用评估工具（参见阶段 4）——推荐方法
- 在 tmux 中运行服务器，使其独立于主进程
- 测试时使用超时：`timeout 5s python server.py`

**对于 Python：**

- 验证 Python 语法：`python -m py_compile your_server.py`
- 通过检查文件确认导入可正常工作
- 手动测试：在 tmux 中运行服务器，然后在主进程中使用评估工具进行测试
- 或直接使用评估工具（它会管理使用 stdio 传输的服务器）

**对于 Node/TypeScript：**

- 运行 `npm run build` 并确保无错误完成
- 验证 dist/index.js 已创建
- 手动测试：在 tmux 中运行服务器，然后在主进程中使用评估工具进行测试
- 或直接使用评估工具（它会管理使用 stdio 传输的服务器）

#### 3.3 使用质量检查清单

要验证实现质量，请从特定语言的指南中加载相应的检查清单：

- Python：参见 [🐍 Python 指南](./reference/python_mcp_server.md)中的“质量检查清单”
- Node/TypeScript：参见 [⚡ TypeScript 指南](./reference/node_mcp_server.md)中的“质量检查清单”

---

### 阶段 4：创建评估

实现 MCP 服务器后，创建全面的评估来测试其有效性。

**加载 [✅ 评估指南](./reference/evaluation.md)以获取完整的评估准则。**

#### 4.1 了解评估目的

评估用于测试 LLM 能否有效使用你的 MCP 服务器来回答真实且复杂的问题。

#### 4.2 创建 10 个评估问题

要创建有效的评估，请遵循评估指南中概述的流程：

1. **工具检查**：列出可用工具并了解其功能
2. **内容探索**：使用只读操作探索可用数据
3. **问题生成**：创建 10 个复杂且真实的问题
4. **答案验证**：亲自解答每个问题以验证答案

#### 4.3 评估要求

每个问题都必须满足以下条件：

- **独立**：不依赖其他问题
- **只读**：仅需要非破坏性操作
- **复杂**：需要多次工具调用和深入探索
- **真实**：基于用户真正关心的实际用例
- **可验证**：具有可通过字符串比较进行验证的唯一明确答案
- **稳定**：答案不会随时间变化

#### 4.4 输出格式

创建一个具有以下结构的 XML 文件：

```xml
<evaluation>
  <qa_pair>
    <question>Find discussions about AI model launches with animal codenames. One model needed a specific safety designation that uses the format ASL-X. What number X was being determined for the model named after a spotted wild cat?</question>
    <answer>3</answer>
  </qa_pair>
<!-- More qa_pairs... -->
</evaluation>
```

---

# 参考文件

## 📚 文档库

在开发过程中根据需要加载以下资源：

### MCP 核心文档（优先加载）

- **MCP 协议**：从 `https://modelcontextprotocol.io/llms-full.txt` 获取——完整的 MCP 规范
- [📋 MCP 最佳实践](./reference/mcp_best_practices.md)——通用 MCP 准则，包括：
  - 服务器和工具命名约定
  - 响应格式准则（JSON 与 Markdown）
  - 分页最佳实践
  - 字符限制和截断策略
  - 工具开发准则
  - 安全和错误处理标准

### SDK 文档（在阶段 1/2 期间加载）

- **Python SDK**：从 `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md` 获取
- **TypeScript SDK**：从 `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md` 获取

### 特定语言的实现指南（在阶段 2 期间加载）

- [🐍 Python 实现指南](./reference/python_mcp_server.md)——完整的 Python/FastMCP 指南，包括：
  - 服务器初始化模式
  - Pydantic 模型示例
  - 使用 `@mcp.tool` 注册工具
  - 完整的可运行示例
  - 质量检查清单

- [⚡ TypeScript 实现指南](./reference/node_mcp_server.md) - 完整的 TypeScript 指南，涵盖：
  - 项目结构
  - Zod 模式
  - 使用 `server.registerTool` 注册工具
  - 完整的可运行示例
  - 质量检查清单

### 评估指南（在阶段 4 期间加载）

- [✅ 评估指南](./reference/evaluation.md) - 完整的评估创建指南，涵盖：
  - 问题创建准则
  - 答案验证策略
  - XML 格式规范
  - 示例问题与答案
  - 使用提供的脚本运行评估