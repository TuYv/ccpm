# 使用 CrewAI 和 Composio 构建智能体

使用 CrewAI 和 Composio Tool Router 构建多智能体团队。

## 安装

```bash
pip install composio-crewai crewai crewai-tools
```

**查找最新版本：**
```bash
pip index versions crewai | grep "Available versions" | head -1
pip index versions composio-crewai | grep "Available versions" | head -1
```

## 集成方法

**CrewAI 是一个智能体提供方**——请使用 MCP 构建多智能体团队。

### MCP 集成

```python
from crewai import Agent, Task, Crew
from crewai.mcp import MCPServerHTTP
from composio import Composio

composio = Composio()

def create_crew(user_id: str):
    # Create session
    session = composio.create(user_id=user_id, toolkits=["github"])

    # Create agent with MCP server
    agent = Agent(
        role="GitHub Manager",
        goal="Manage GitHub repositories",
        backstory="You are an expert at GitHub operations",
        mcps=[
            MCPServerHTTP(
                url=session.mcp.url,
                headers=session.mcp.headers
            )
        ]
    )

    # Define task
    task = Task(
        description="Create a GitHub issue titled 'Bug Report'",
        expected_output="Confirmation of issue creation",
        agent=agent
    )

    # Execute crew
    crew = Crew(agents=[agent], tasks=[task])
    return crew

crew = create_crew("user_123")
result = crew.kickoff()
print(result)
```

### 多智能体团队示例

```python
from crewai import Agent, Task, Crew, Process
from crewai.mcp import MCPServerHTTP
from composio import Composio

composio = Composio()

def create_team(user_id: str):
    session = composio.create(user_id=user_id, toolkits=["github", "slack"])

    # Create MCP server connection
    mcp_server = MCPServerHTTP(
        url=session.mcp.url,
        headers=session.mcp.headers
    )

    # Create specialized agents
    researcher = Agent(
        role="GitHub Researcher",
        goal="Analyze repositories",
        backstory="Expert at code analysis",
        mcps=[mcp_server]
    )

    reporter = Agent(
        role="Report Writer",
        goal="Create reports",
        backstory="Expert at documentation",
        mcps=[mcp_server]
    )

    # Define tasks
    research_task = Task(
        description="Analyze the repository",
        expected_output="Analysis report",
        agent=researcher
    )

    report_task = Task(
        description="Create a summary report",
        expected_output="Markdown report",
        agent=reporter,
        context=[research_task]
    )

    crew = Crew(
        agents=[researcher, reporter],
        tasks=[research_task, report_task],
        process=Process.sequential
    )

    return crew

team = create_team("user_123")
result = team.kickoff()
```

## 主要功能

- **多智能体团队**：智能体协作完成任务
- **任务依赖关系**：顺序执行或分层执行
- **YAML 配置**：简洁的智能体和任务定义
- **生产就绪**：成熟的框架

## 关键资源

- **CrewAI 文档**：https://docs.crewai.com/
- **工具路由指南**：`/building-agents`
- **快速入门**：https://docs.crewai.com/en/quickstart
- **GitHub**：https://github.com/crewAIInc/crewAI

## 环境变量

```bash
OPENAI_API_KEY=sk-...  # Or other LLM provider
COMPOSIO_API_KEY=...
```

## 后续步骤

1. 使用 `/building-agents` 获取综合指南
2. 查看 `python/providers/crewai/` 获取完整示例
3. 参阅 [CrewAI 文档](https://docs.crewai.com/) 了解多智能体模式