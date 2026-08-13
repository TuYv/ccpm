---
name: mcp-builder
description: Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).
license: Complete terms in LICENSE.txt
---
# MCP 服务器开发指南

## 概述

创建 MCP（Model Context Protocol）服务器，使 LLM 能够通过设计良好的工具与外部服务进行交互。MCP 服务器的质量取决于其是否能帮助 LLM 有效完成真实世界任务。

---

# 流程

## 🚀 高层工作流

创建高质量的 MCP 服务器通常包含四个主要阶段：

### 阶段 1：深度调研与规划

#### 1.1 理解现代 MCP 设计

**API 覆盖 vs. 工作流工具：**
平衡全面的 API 端点覆盖与专用工作流工具。工作流工具在特定任务中更便捷，而全面覆盖可让代理更灵活地组合操作。不同客户端的性能表现不同——有些客户端受益于将基础工具组合使用的代码执行，而有些则更适合更高层次的工作流。若不确定，请优先考虑全面的 API 覆盖。

**工具命名与可发现性：**
清晰、描述性强的工具名称可帮助代理快速找到合适的工具。使用一致的前缀（例如 `github_create_issue`、`github_list_repos`）和面向动作的命名方式。

**上下文管理：**
代理从简洁的工具说明和可过滤/分页结果的能力中受益。设计工具时应返回聚焦且相关的数据。一些客户端支持代码执行，可帮助代理高效过滤和处理数据。

**可执行的错误提示：**
错误信息应通过具体建议和后续步骤引导代理走向可行方案。

#### 1.2 学习 MCP 协议文档

**浏览 MCP 规范：**

先从站点地图查找相关页面：`https://modelcontextprotocol.io/sitemap.xml`

然后用 `.md` 后缀获取具体页面（例如 `https://modelcontextprotocol.io/specification/draft.md`）以使用 Markdown 格式。

建议复查的关键页面：
- 规范概览与架构
- 传输机制（streamable HTTP、stdio）
- 工具、资源与提示词定义

#### 1.3 学习框架文档

**推荐技术栈：**
- **语言**：TypeScript（高质量 SDK 支持、在多种执行环境中有良好兼容性（例如 MCPB）。此外，AI 模型擅长生成 TypeScript 代码，得益于其广泛应用、静态类型和优秀的 lint 工具）
- **传输方式**：远程服务器使用 Streamable HTTP，并采用无状态 JSON（相比有状态会话和流式响应更易扩展和维护）；本地服务器使用 stdio。

**加载框架文档：**

- **MCP 最佳实践**：[📋 查看最佳实践](./reference/mcp_best_practices.md) - 核心指南

**面向 TypeScript（推荐）：**
- **TypeScript SDK**：使用 WebFetch 加载 `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- [⚡ TypeScript 指南](./reference/node_mcp_server.md) - TypeScript 模式与示例

**面向 Python：**
- **Python SDK**：使用 WebFetch 加载 `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- [🐍 Python 指南](./reference/python_mcp_server.md) - Python 模式与示例

#### 1.4 规划实现方案

**理解 API：**
审阅服务的 API 文档，以识别关键端点、认证要求和数据模型。按需使用网络搜索和 WebFetch。

**工具选型：**
优先考虑全面的 API 覆盖。列出要实现的端点，从最常见操作开始。

---

### 阶段 2：实现

#### 2.1 搭建项目结构

参见语言特定指南进行项目配置：
- [⚡ TypeScript 指南](./reference/node_mcp_server.md) - 项目结构、`package.json`、`tsconfig.json`
- [🐍 Python 指南](./reference/python_mcp_server.md) - 模块组织、依赖管理

#### 2.2 实现核心基础设施

创建共享工具：
- 带认证的 API 客户端
- 错误处理助手
- 响应格式化（JSON/Markdown）
- 分页支持

#### 2.3 实现工具

对每个工具：

**输入模式：**
- 使用 Zod（TypeScript）或 Pydantic（Python）
- 包含约束和清晰说明
- 在字段说明中添加示例

**输出模式：**
- 尽可能定义 `outputSchema` 以便结构化数据
- 在工具响应中使用 `structuredContent`（TypeScript SDK 特性）
- 帮助客户端理解并处理工具输出

**工具说明：**
- 简明功能摘要
- 参数说明
- 返回类型模式

**实现：**
- I/O 操作用 `Async/await`
- 使用可执行信息的完整错误处理
- 在适用场景下支持分页
- 使用现代 SDK 时同时返回文本内容和结构化数据

**注解：**
- `readOnlyHint`: true/false
- `destructiveHint`: true/false
- `idempotentHint`: true/false
- `openWorldHint`: true/false

---

### 阶段 3：评审与测试

#### 3.1 代码质量

审查要点：
- 无重复代码（DRY 原则）
- 一致的错误处理
- 完整的类型覆盖
- 清晰的工具说明

#### 3.2 构建与测试

**TypeScript：**
- 运行 `npm run build` 以验证编译
- 使用 MCP Inspector 测试：`npx @modelcontextprotocol/inspector`

**Python：**
- 验证语法：`python -m py_compile your_server.py`
- 使用 MCP Inspector 测试

详见语言特定指南获取更详细的测试方法与质量检查清单。

---

### 阶段 4：创建评测

在实现 MCP 服务器后，创建全面的评测来测试其有效性。

**加载 [✅ 评测指南](./reference/evaluation.md) 以获取完整的评测规范。**

#### 4.1 理解评测目的

使用评测测试 LLM 是否能够有效利用你的 MCP 服务器回答现实且复杂的问题。

#### 4.2 创建 10 个评测问题

遵循评测指南中给出的流程创建有效评测：

1. **工具检查**：列出可用工具并理解其能力
2. **内容探索**：使用只读操作探索可用数据
3. **问题生成**：创建 10 个复杂且真实的问题
4. **答案核验**：自行解答每个问题以验证答案

#### 4.3 评测要求

确保每个问题满足以下条件：
- **独立**：不依赖其他问题
- **只读**：仅需非破坏性操作
- **复杂**：需要多次工具调用和深入探索
- **真实**：基于人类关心的真实用例
- **可核验**：存在单一明确答案，可通过字符串比较验证
- **稳定**：答案不会随时间变化

#### 4.4 输出格式

按以下结构创建 XML 文件：

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

在开发过程中按需加载以下资源：

### 核心 MCP 文档（优先加载）
- **MCP 协议**：从 `https://modelcontextprotocol.io/sitemap.xml` 开始，然后使用 `.md` 后缀获取具体页面
- [📋 MCP 最佳实践](./reference/mcp_best_practices.md) - 通用 MCP 指南，内容包括：
  - 服务器与工具命名规范
  - 响应格式指南（JSON 与 Markdown）
  - 分页最佳实践
  - 传输选择（Streamable HTTP 与 stdio）
  - 安全与错误处理标准

### SDK 文档（阶段 1/2 期间加载）
- **Python SDK**：从 `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md` 加载
- **TypeScript SDK**：从 `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md` 加载

### 语言特定实现指南（阶段 2 期间加载）
- [🐍 Python 实现指南](./reference/python_mcp_server.md) - 完整的 Python/FastMCP 指南，包含：
  - 服务器初始化模式
  - Pydantic 模型示例
  - 使用 `@mcp.tool` 注册工具
  - 完整可运行示例
  - 质量检查清单

- [⚡ TypeScript Implementation Guide](./reference/node_mcp_server.md) - 包含完整 TypeScript 指南：
  - 项目结构
  - Zod schema 模式
  - 使用 `server.registerTool` 的工具注册
  - 完整可运行示例
  - 质量检查清单

### 评估指南（在第 4 阶段加载）
- [✅ Evaluation Guide](./reference/evaluation.md) - 完整的评估创建指南，包含：
  - 题目创建指南
  - 答案核验策略
  - XML 格式规范
  - 示例题目与答案
  - 使用提供脚本运行评估
