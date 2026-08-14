# 使用 Microsoft AutoGen 与 Composio 构建智能体

使用 AutoGen 与 Composio Tool Router 构建多智能体对话系统。

## 安装

```bash
# For AgentChat (conversational agents)
pip install composio-autogen autogen-agentchat autogen-ext[openai]

# For AutoGen Studio (UI-based)
pip install autogenstudio
```

**查找最新版本：**
```bash
pip index versions autogen-agentchat | grep "Available versions" | head -1
pip index versions composio-autogen | grep "Available versions" | head -1
```

## 集成方法

**AutoGen 是智能体提供方**——使用 Tool Router 实现用户隔离。

### 搭配 Tool Router 使用原生工具

```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from composio_autogen import ComposioToolSet, App

toolset = ComposioToolSet()

async def create_agent(user_id: str):
    # Create session
    session = toolset.create(
        user_id=user_id,
        toolkits=["github"],
        manage_connections=True
    )

    tools = session.tools()

    # Create agent with tools
    agent = AssistantAgent(
        name="github_agent",
        model_client=OpenAIChatCompletionClient(model="gpt-4o"),
        tools=tools,
        system_message="You manage GitHub repositories"
    )

    return agent

async def main():
    agent = await create_agent("user_123")
    result = await agent.run(task="Create a GitHub issue titled 'Bug Report'")
    print(result)

asyncio.run(main())
```

### 多智能体对话

```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_ext.models.openai import OpenAIChatCompletionClient
from composio_autogen import ComposioToolSet, App

toolset = ComposioToolSet()

async def create_team(user_id: str):
    # Create session
    session = toolset.create(
        user_id=user_id,
        toolkits=["github", "slack"],
        manage_connections=True
    )

    tools = session.tools()

    # Create specialized agents
    github_agent = AssistantAgent(
        name="github_agent",
        model_client=OpenAIChatCompletionClient(model="gpt-4o"),
        tools=tools,
        system_message="You manage GitHub"
    )

    slack_agent = AssistantAgent(
        name="slack_agent",
        model_client=OpenAIChatCompletionClient(model="gpt-4o"),
        tools=tools,
        system_message="You manage Slack"
    )

    # Create team
    team = RoundRobinGroupChat(
        [github_agent, slack_agent],
        max_turns=10
    )

    return team

async def main():
    team = await create_team("user_123")
    result = await team.run(
        task="Create a GitHub issue and notify team on Slack"
    )
    print(result)

asyncio.run(main())
```

## 主要功能

- **多智能体对话**：智能体协作并相互通信
- **AutoGen Studio**：用于原型设计的无代码 UI
- **多个层级**：Studio、AgentChat、Core 可满足不同需求
- **团队模式**：RoundRobin、Swarm、自定义编排

## 关键资源

- **AutoGen 文档**：https://microsoft.github.io/autogen/stable/
- **工具路由指南**：`/building-agents`
- **GitHub**：https://github.com/microsoft/autogen
- **Microsoft Agent Framework**：AutoGen 的后继框架

## 环境变量

```bash
OPENAI_API_KEY=sk-...  # Or other LLM provider
COMPOSIO_API_KEY=...
```

## 后续步骤

1. 使用 `/building-agents` 获取完整指南
2. 查看 `python/providers/autogen/` 中的完整示例
3. 参阅 [AutoGen 文档](https://microsoft.github.io/autogen/stable/)了解对话模式
4. 对于新项目，可考虑使用 [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/)