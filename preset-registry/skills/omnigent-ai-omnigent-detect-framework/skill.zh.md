---
name: detect-framework
description: Detect Python agent frameworks from code imports and map them to Omnigent executor types. Load when the user has existing agent code to integrate.
---
# 框架检测

当用户已有希望集成到 Omnigent 中的 Python 代码时，请根据 import 语句检测所使用的框架，并推荐合适的执行器类型。

## 检测流程

1. 询问用户其智能体代码的路径（如果已启用文件系统访问，也可以在当前目录中查找 Python 文件）。

2. 扫描 Python 文件中的 import 模式。按以下优先级顺序检查：

| Import 模式 | 框架 | 执行器类型 |
|---------------|-----------|---------------|
| `import anthropic` 或 `from anthropic` + 智能体模式（例如 `Agent`、`tool`、系统提示词设置） | Claude SDK | `claude_sdk` |
| `import openai` 或 `from openai` + 智能体模式（例如 `Agent`、`Runner`、`function_tool`） | OpenAI Agents SDK | `agents_sdk` |
| `from langgraph` 或 `import langgraph` | LangGraph | 尚未原生支持 |
| `from deepagents` 或 `import deepagents` | DeepAgents | 尚未原生支持 |
| `from langchain` 或 `import langchain` | LangChain | 尚未原生支持 |
| `from crewai` 或 `import crewai` | CrewAI | 尚未原生支持 |
| `from autogen` 或 `import autogen` | AutoGen | 尚未原生支持 |
| 以上均不符合 | 未知 | 尚未原生支持 |

3. 报告检测结果并推荐执行器类型。

## 针对每种执行器类型应生成的内容

### `llm`（默认——没有现有代码）

生成标准智能体目录：
```yaml
executor:
  type: llm  # or omit entirely (llm is the default)
```

### `claude_sdk`

用户的 Claude SDK 代码将直接运行。生成指向其入口模块的配置：
```yaml
executor:
  type: claude_sdk
```

### `agents_sdk`

用户的 OpenAI Agents SDK 代码将直接运行：
```yaml
executor:
  type: agents_sdk
```

## 询问不受支持的框架

如果用户的框架尚未获得原生支持，请告知他们：
- 说明 Omnigent 当前没有支持该框架的执行器。
- 主动提出向他们展示一个预填充的 GitHub Issue URL，用于请求对其框架提供一等支持。
- 如果他们希望从头开始，则建议生成一个标准的 `llm` 智能体。
- Issue URL 格式：`https://github.com/dbczumar/omnigent/issues/new?title=...&body=...`