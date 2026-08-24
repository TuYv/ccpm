---
name: crewai-multi-agent
description: Multi-agent orchestration framework for autonomous AI collaboration. Use when building teams of specialized agents working together on complex tasks, when you need role-based agent collaboration with memory, or for production workflows requiring sequential/hierarchical execution. Built without LangChain dependencies for lean, fast execution.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Agents, CrewAI, Multi-Agent, Orchestration, Collaboration, Role-Based, Autonomous, Workflows, Memory, Production]
dependencies: [crewai>=1.2.0, crewai-tools>=1.2.0]
---
# CrewAI - 多智能体编排框架

构建由自主 AI 智能体组成的团队，通过协作解决复杂任务。

## 何时使用 CrewAI

**在以下情况使用 CrewAI：**
- 构建具有专业化角色的多智能体系统
- 需要智能体之间进行自主协作
- 希望基于角色进行任务委派（研究员、撰稿人、分析师）
- 需要按顺序或层级执行流程
- 构建具备记忆和可观测性的生产工作流
- 需要比 LangChain/LangGraph 更简单的设置方式

**主要特性：**
- **独立运行**：不依赖 LangChain，占用空间小
- **基于角色**：智能体拥有角色、目标和背景故事
- **双重范式**：Crews（自主式）+ Flows（事件驱动式）
- **50 多种工具**：网页抓取、搜索、数据库、AI 服务
- **记忆**：短期记忆、长期记忆和实体记忆
- **生产就绪**：追踪和企业级功能

**以下情况改用其他方案：**
- **LangChain**：通用 LLM 应用、RAG 流水线
- **LangGraph**：包含循环的复杂有状态工作流
- **AutoGen**：微软生态系统、多智能体对话
- **LlamaIndex**：文档问答、知识检索

## 快速开始

### 安装

```bash
# Core framework
pip install crewai

# With 50+ built-in tools
pip install 'crewai[tools]'
```

### 使用 CLI 创建项目

```bash
# Create new crew project
crewai create crew my_project
cd my_project

# Install dependencies
crewai install

# Run the crew
crewai run
```

### 简单的 crew（仅使用代码）

```python
from crewai import Agent, Task, Crew, Process

# 1. Define agents
researcher = Agent(
    role="Senior Research Analyst",
    goal="Discover cutting-edge developments in AI",
    backstory="You are an expert analyst with a keen eye for emerging trends.",
    verbose=True
)

writer = Agent(
    role="Technical Writer",
    goal="Create clear, engaging content about technical topics",
    backstory="You excel at explaining complex concepts to general audiences.",
    verbose=True
)

# 2. Define tasks
research_task = Task(
    description="Research the latest developments in {topic}. Find 5 key trends.",
    expected_output="A detailed report with 5 bullet points on key trends.",
    agent=researcher
)

write_task = Task(
    description="Write a blog post based on the research findings.",
    expected_output="A 500-word blog post in markdown format.",
    agent=writer,
    context=[research_task]  # Uses research output
)

# 3. Create and run crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential,  # Tasks run in order
    verbose=True
)

# 4. Execute
result = crew.kickoff(inputs={"topic": "AI Agents"})
print(result.raw)
```

## 核心概念

### 智能体 - 自主工作者

```python
from crewai import Agent

agent = Agent(
    role="Data Scientist",                    # Job title/role
    goal="Analyze data to find insights",     # What they aim to achieve
    backstory="PhD in statistics...",         # Background context
    llm="gpt-4o",                             # LLM to use
    tools=[],                                 # Tools available
    memory=True,                              # Enable memory
    verbose=True,                             # Show reasoning
    allow_delegation=True,                    # Can delegate to others
    max_iter=15,                              # Max reasoning iterations
    max_rpm=10                                # Rate limit
)
```

### 任务——工作单元

```python
from crewai import Task

task = Task(
    description="Analyze the sales data for Q4 2024. {context}",
    expected_output="A summary report with key metrics and trends.",
    agent=analyst,                            # Assigned agent
    context=[previous_task],                  # Input from other tasks
    output_file="report.md",                  # Save to file
    async_execution=False,                    # Run synchronously
    human_input=False                         # No human approval needed
)
```

### Crew——智能体团队

```python
from crewai import Crew, Process

crew = Crew(
    agents=[researcher, writer, editor],      # Team members
    tasks=[research, write, edit],            # Tasks to complete
    process=Process.sequential,               # Or Process.hierarchical
    verbose=True,
    memory=True,                              # Enable crew memory
    cache=True,                               # Cache tool results
    max_rpm=10,                               # Rate limit
    share_crew=False                          # Opt-in telemetry
)

# Execute with inputs
result = crew.kickoff(inputs={"topic": "AI trends"})

# Access results
print(result.raw)                             # Final output
print(result.tasks_output)                    # All task outputs
print(result.token_usage)                     # Token consumption
```

## 流程类型

### 顺序流程（默认）

任务按顺序执行，每个智能体完成其任务后，下一个智能体再继续：

```python
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential  # Task 1 → Task 2 → Task 3
)
```

### 分层流程

自动创建一个负责委派和协调工作的管理智能体：

```python
crew = Crew(
    agents=[researcher, writer, analyst],
    tasks=[research_task, write_task, analyze_task],
    process=Process.hierarchical,  # Manager delegates tasks
    manager_llm="gpt-4o"           # LLM for manager
)
```

## 使用工具

### 内置工具（50 多种）

```bash
pip install 'crewai[tools]'
```

```python
from crewai_tools import (
    SerperDevTool,           # Web search
    ScrapeWebsiteTool,       # Web scraping
    FileReadTool,            # Read files
    PDFSearchTool,           # Search PDFs
    WebsiteSearchTool,       # Search websites
    CodeDocsSearchTool,      # Search code docs
    YoutubeVideoSearchTool,  # Search YouTube
)

# Assign tools to agent
researcher = Agent(
    role="Researcher",
    goal="Find accurate information",
    backstory="Expert at finding data online.",
    tools=[SerperDevTool(), ScrapeWebsiteTool()]
)
```

### 自定义工具

```python
from crewai.tools import BaseTool
from pydantic import Field

class CalculatorTool(BaseTool):
    name: str = "Calculator"
    description: str = "Performs mathematical calculations. Input: expression"

    def _run(self, expression: str) -> str:
        try:
            result = eval(expression)
            return f"Result: {result}"
        except Exception as e:
            return f"Error: {str(e)}"

# Use custom tool
agent = Agent(
    role="Analyst",
    goal="Perform calculations",
    tools=[CalculatorTool()]
)
```

## YAML 配置（推荐）

### 项目结构

```
my_project/
├── src/my_project/
│   ├── config/
│   │   ├── agents.yaml    # Agent definitions
│   │   └── tasks.yaml     # Task definitions
│   ├── crew.py            # Crew assembly
│   └── main.py            # Entry point
└── pyproject.toml
```

### agents.yaml

```yaml
researcher:
  role: "{topic} Senior Data Researcher"
  goal: "Uncover cutting-edge developments in {topic}"
  backstory: >
    You're a seasoned researcher with a knack for uncovering
    the latest developments in {topic}. Known for your ability
    to find relevant information and present it clearly.

reporting_analyst:
  role: "Reporting Analyst"
  goal: "Create detailed reports based on research data"
  backstory: >
    You're a meticulous analyst who transforms raw data into
    actionable insights through well-structured reports.
```

### tasks.yaml

```yaml
research_task:
  description: >
    Conduct thorough research about {topic}.
    Find the most relevant information for {year}.
  expected_output: >
    A list with 10 bullet points of the most relevant
    information about {topic}.
  agent: researcher

reporting_task:
  description: >
    Review the research and create a comprehensive report.
    Focus on key findings and recommendations.
  expected_output: >
    A detailed report in markdown format with executive
    summary, findings, and recommendations.
  agent: reporting_analyst
  output_file: report.md
```

### crew.py

```python
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import SerperDevTool

@CrewBase
class MyProjectCrew:
    """My Project crew"""

    @agent
    def researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['researcher'],
            tools=[SerperDevTool()],
            verbose=True
        )

    @agent
    def reporting_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['reporting_analyst'],
            verbose=True
        )

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config['research_task'])

    @task
    def reporting_task(self) -> Task:
        return Task(
            config=self.tasks_config['reporting_task'],
            output_file='report.md'
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True
        )
```

### main.py

```python
from my_project.crew import MyProjectCrew

def run():
    inputs = {
        'topic': 'AI Agents',
        'year': 2025
    }
    MyProjectCrew().crew().kickoff(inputs=inputs)

if __name__ == "__main__":
    run()
```

## Flows——事件驱动的编排

对于包含条件逻辑的复杂工作流，请使用 Flows：

```python
from crewai.flow.flow import Flow, listen, start, router
from pydantic import BaseModel

class MyState(BaseModel):
    confidence: float = 0.0

class MyFlow(Flow[MyState]):
    @start()
    def gather_data(self):
        return {"data": "collected"}

    @listen(gather_data)
    def analyze(self, data):
        self.state.confidence = 0.85
        return analysis_crew.kickoff(inputs=data)

    @router(analyze)
    def decide(self):
        return "high" if self.state.confidence > 0.8 else "low"

    @listen("high")
    def generate_report(self):
        return report_crew.kickoff()

# Run flow
flow = MyFlow()
result = flow.kickoff()
```

完整文档请参阅 [Flows 指南](references/flows.md)。

## 记忆系统

```python
# Enable all memory types
crew = Crew(
    agents=[researcher],
    tasks=[research_task],
    memory=True,           # Enable memory
    embedder={             # Custom embeddings
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"}
    }
)
```

**记忆类型：** 短期记忆（ChromaDB）、长期记忆（SQLite）、实体记忆（ChromaDB）

## LLM 提供商

```python
from crewai import LLM

llm = LLM(model="gpt-4o")                              # OpenAI (default)
llm = LLM(model="claude-sonnet-4-5-20250929")                       # Anthropic
llm = LLM(model="ollama/llama3.1", base_url="http://localhost:11434")  # Local
llm = LLM(model="azure/gpt-4o", base_url="https://...")              # Azure

agent = Agent(role="Analyst", goal="Analyze data", llm=llm)
```

## CrewAI 与其他方案的对比

| 特性 | CrewAI | LangChain | LangGraph |
|---------|--------|-----------|-----------|
| **最适合** | 多智能体团队 | 通用 LLM 应用 | 有状态工作流 |
| **学习曲线** | 低 | 中等 | 较高 |
| **智能体范式** | 基于角色 | 基于工具 | 基于图 |
| **记忆** | 内置 | 基于插件 | 自定义 |

## 最佳实践

1. **明确角色** - 每个智能体都应具有不同的专长
2. **YAML 配置** - 更适合组织较大的项目
3. **启用记忆** - 改善跨任务的上下文
4. **设置 max_iter** - 防止无限循环（默认值为 15）
5. **限制工具数量** - 每个智能体最多使用 3-5 个工具
6. **速率限制** - 设置 max_rpm 以避免触及 API 限制

## 常见问题

**智能体陷入循环：**
```python
agent = Agent(
    role="...",
    max_iter=10,           # Limit iterations
    max_rpm=5              # Rate limit
)
```

**任务未使用上下文：**
```python
task2 = Task(
    description="...",
    context=[task1],       # Explicitly pass context
    agent=writer
)
```

**记忆错误：**
```python
# Use environment variable for storage
import os
os.environ["CREWAI_STORAGE_DIR"] = "./my_storage"
```

## 参考资料

- **[Flows 指南](references/flows.md)** - 事件驱动工作流、状态管理
- **[工具指南](references/tools.md)** - 内置工具、自定义工具、MCP
- **[故障排除](references/troubleshooting.md)** - 常见问题、调试

## 资源

- **GitHub**：https://github.com/crewAIInc/crewAI（超过 2.5 万颗星）
- **文档**：https://docs.crewai.com
- **工具**：https://github.com/crewAIInc/crewAI-tools
- **示例**：https://github.com/crewAIInc/crewAI-examples
- **版本**：1.2.0+
- **许可证**：MIT