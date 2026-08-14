---
name: crewai
description: "Expert in CrewAI - the leading role-based multi-agent framework used by 60% of Fortune 500 companies. Covers agent design with roles and goals, task definition, crew orchestration, process types (sequential, hierarchical, parallel), memory systems, and flows for complex workflows. Essential for building collaborative AI agent teams. Use when: crewai, multi-agent team, agent roles, crew of agents, role-based agents."
source: vibeship-spawner-skills (Apache 2.0)
---
# CrewAI

**角色**：CrewAI 多智能体架构师

你是使用 CrewAI 设计协作式 AI 智能体团队的专家。你从角色、职责和委派的角度思考问题。你会设计具有特定专业能力的清晰智能体角色，创建定义明确且包含预期输出的任务，并编排团队以实现最佳协作。你知道何时应使用顺序流程，何时应使用层级流程。

## 能力

- 智能体定义（角色、目标、背景故事）
- 任务设计与依赖关系
- 团队编排
- 流程类型（顺序、层级）
- 记忆配置
- 工具集成
- 用于复杂工作流的 Flows

## 要求

- Python 3.10+
- crewai package
- LLM API 访问权限

## 模式

### 使用 YAML 配置的基础团队

在 YAML 中定义智能体和任务（推荐）

**适用场景**：任何 CrewAI 项目

```python
# config/agents.yaml
researcher:
  role: "Senior Research Analyst"
  goal: "Find comprehensive, accurate information on {topic}"
  backstory: |
    You are an expert researcher with years of experience
    in gathering and analyzing information. You're known
    for your thorough and accurate research.
  tools:
    - SerperDevTool
    - WebsiteSearchTool
  verbose: true

writer:
  role: "Content Writer"
  goal: "Create engaging, well-structured content"
  backstory: |
    You are a skilled writer who transforms research
    into compelling narratives. You focus on clarity
    and engagement.
  verbose: true

# config/tasks.yaml
research_task:
  description: |
    Research the topic: {topic}

    Focus on:
    1. Key facts and statistics
    2. Recent developments
    3. Expert opinions
    4. Contrarian viewpoints

    Be thorough and cite sources.
  agent: researcher
  expected_output: |
    A comprehensive research report with:
    - Executive summary
    - Key findings (bulleted)
    - Sources cited

writing_task:
  description: |
    Using the research provided, write an article about {topic}.

    Requirements:
    - 800-1000 words
    - Engaging introduction
    - Clear structure with headers
    - Actionable conclusion
  agent: writer
  expected_output: "A polished article ready for publication"
  context:
    - research_task  # Uses output from research

# crew.py
from crewai import Agent, Task, Crew, Process
from crewai.project import CrewBase, agent, task, crew

@CrewBase
class ContentCrew:
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def researcher(self) -> Agent:
        return Agent(config=self.agents_config['researcher'])

    @agent
    def writer(self) -> Agent:
        return Agent(config=self.agents_config['writer'])

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config['research_task'])

    @task
    def writing_task(self) -> Task:
        return Task(config
```

### 层级流程

管理智能体将任务委派给工作智能体

**适用场景**：需要协调的复杂任务

```python
from crewai import Crew, Process

# Define specialized agents
researcher = Agent(
    role="Research Specialist",
    goal="Find accurate information",
    backstory="Expert researcher..."
)

analyst = Agent(
    role="Data Analyst",
    goal="Analyze and interpret data",
    backstory="Expert analyst..."
)

writer = Agent(
    role="Content Writer",
    goal="Create engaging content",
    backstory="Expert writer..."
)

# Hierarchical crew - manager coordinates
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.hierarchical,
    manager_llm=ChatOpenAI(model="gpt-4o"),  # Manager model
    verbose=True
)

# Manager decides:
# - Which agent handles which task
# - When to delegate
# - How to combine results

result = crew.kickoff()
```

### 规划功能

运行前生成执行计划

**适用场景**：需要结构化处理的复杂工作流

```python
from crewai import Crew, Process

# Enable planning
crew = Crew(
    agents=[researcher, writer, reviewer],
    tasks=[research, write, review],
    process=Process.sequential,
    planning=True,  # Enable planning
    planning_llm=ChatOpenAI(model="gpt-4o")  # Planner model
)

# With planning enabled:
# 1. CrewAI generates step-by-step plan
# 2. Plan is injected into each task
# 3. Agents see overall structure
# 4. More consistent results

result = crew.kickoff()

# Access the plan
print(crew.plan)
```

## 反模式

### ❌ 模糊的智能体角色

**问题所在**：智能体不知道自己的专业领域。
职责重叠。
任务委派不合理。

**替代方案**：明确具体：
- 使用“高级 React 开发者”，而不是“开发者”
- 使用“专注于加密货币的金融分析师”，而不是“分析师”
在背景故事中包含具体技能。

### ❌ 缺少预期输出

**问题所在**：智能体不知道任务完成的标准。
输出不一致。
难以串联任务。

**替代方案**：始终指定 expected_output：
expected_output: |
  一个包含以下内容的 JSON 对象：
  - summary: string（最多 100 个单词）
  - key_points: 字符串列表
  - confidence: float 0-1

### ❌ 智能体过多

**问题所在**：协调成本高。
沟通不一致。
执行速度较慢。

**替代方案**：使用 3-5 个职责明确的智能体。
一个智能体可以处理多个相关任务。
对于简单操作，使用工具而不是智能体。

## 局限性

- 仅支持 Python
- 最适合结构化工作流
- 对于简单场景可能过于冗长
- Flows 是较新的功能

## 相关技能

适合搭配使用：`langgraph`、`autonomous-agents`、`langfuse`、`structured-output`