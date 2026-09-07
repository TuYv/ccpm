---
name: agent-tool-builder
description: Tools are how AI agents interact with the world. A well-designed
  tool is the difference between an agent that works and one that hallucinates,
  fails silently, or costs 10x more tokens than necessary. This skill covers
  tool design from schema to error handling.
risk: critical
source: vibeship-spawner-skills (Apache 2.0)
date_added: 2026-02-27
---
# Agent 工具构建器

工具是 AI 智能体与世界交互的方式。一个设计良好的工具，决定了一个智能体是能够正常工作，还是会产生幻觉、静默失败，或者消耗十倍于实际所需的 token。

本技能涵盖了从 schema 到错误处理的工具设计，包括 JSON Schema 最佳实践、真正对 LLM 有帮助的描述撰写、验证，以及正在成为 AI 工具领域通用语言的 MCP 标准。

关键洞见：工具描述比工具实现更重要。LLM 永远看不到你的代码——它只能看到 schema 和描述。

## 详细指南

在执行本技能之前，请先阅读[详细指南](references/detailed-guide.md)。其中保留了完整的流程和参考资料。请将其中的安全要求、前提条件和验证要求视为强制性的。进行聚焦性工作时，加载相关章节即可；进行端到端工作时，请完整阅读该指南。

## Python 示例
"""
import anthropic
from anthropic import beta_tool

client = anthropic.Anthropic()

@beta_tool
def get_weather(location: str, unit: str = "fahrenheit") -> str:
    '''Get the current weather in a given location.

    Args:
        location: The city and state, e.g. San Francisco, CA
        unit: Temperature unit, either 'celsius' or 'fahrenheit'
    '''
    # Implementation
    return json.dumps({"temperature": "72°F", "conditions": "Sunny"})

@beta_tool
def search_web(query: str) -> str:
    '''Search the web for information.

    Args:
        query: The search query
    '''
    # Implementation
    return json.dumps({"results": [...]})

# Tool runner handles the loop
runner = client.beta.messages.tool_runner(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    tools=[get_weather, search_web],
    messages=[
        {"role": "user", "content": "What's the weather in Paris?"}
    ]
)

# Process each message
for message in runner:
    print(message.content[0].text)

# Or just get final result
final = runner.until_done()
"""

## 何时使用
- 用户提及或暗示：agent tool
- 用户提及或暗示：function calling
- 用户提及或暗示：tool schema
- 用户提及或暗示：tool design
- 用户提及或暗示：mcp server
- 用户提及或暗示：mcp tool
- 用户提及或暗示：tool use
- 用户提及或暗示：build tool for agent
- 用户提及或暗示：define function
- 用户提及或暗示：input_schema
- 用户提及或暗示：tool_use
- 用户提及或暗示：tool_result

## 局限性
- 仅当任务明确符合上述范围时才使用本技能。
- 不要将输出视为针对特定环境的验证、测试或专家评审的替代品。
- 如果缺少必需的输入、权限、安全边界或成功标准，请停下来请求澄清。
