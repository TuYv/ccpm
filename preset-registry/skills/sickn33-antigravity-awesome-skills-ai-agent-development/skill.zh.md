---
name: ai-agent-development
description: "AI agent development workflow for building autonomous agents, multi-agent systems, and agent orchestration with CrewAI, LangGraph, and custom agents."
category: granular-workflow-bundle
risk: safe
source: personal
date_added: "2026-02-27"
---
# AI Agent 开发工作流

## 概述

用于构建 AI Agent 的专项工作流，涵盖单一自治 Agent、多 Agent 系统、Agent 编排、工具集成和 Human-in-the-loop 模式。

## 适用场景

在以下情况下使用此工作流：
- 构建自治 AI Agent
- 创建多智能体系统
- 实施 Agent 编排
- 为 Agent 添加工具集成
- 搭建 Agent 记忆

## 工作流阶段

### 第一阶段：Agent 设计

#### 需要调用的技能
- `ai-agents-architect` - Agent 架构
- `autonomous-agents` - 自主模式

#### 操作
1. 定义 Agent 目标
2. 设计 Agent 能力
3. 制定工具集成方案
4. 设计记忆系统
5. 定义成功指标

#### 复制粘贴提示词
```
Use @ai-agents-architect to design AI agent architecture
```

### 第二阶段：单一 Agent 实施

#### 需要调用的技能
- `autonomous-agent-patterns` - Agent 模式
- `autonomous-agents` - 自主 Agent

#### 操作
1. 选择 Agent 框架
2. 实现 Agent 逻辑
3. 添加工具集成
4. 配置记忆
5. 测试 Agent 行为

#### 复制粘贴提示词
```
Use @autonomous-agent-patterns to implement single agent
```

### 第三阶段：多 Agent 系统

#### 需要调用的技能
- `crewai` - CrewAI 框架
- `multi-agent-patterns` - 多 Agent 模式

#### 操作
1. 定义 Agent 角色
2. 建立 Agent 通信
3. 配置编排
4. 实施任务委派
5. 测试协作

#### 复制粘贴提示词
```
Use @crewai to build multi-agent system with roles
```

### 第四阶段：Agent 编排

#### 需要调用的技能
- `langgraph` - LangGraph 编排
- `workflow-orchestration-patterns` - 编排

#### 操作
1. 设计工作流图
2. 实现状态管理
3. 添加条件分支
4. 配置持久化
5. 测试工作流

#### 复制粘贴提示词
```
Use @langgraph to create stateful agent workflows
```

### 第五阶段：工具集成

#### 需要调用的技能
- `agent-tool-builder` - 工具构建
- `tool-design` - 工具设计

#### 操作
1. 识别工具需求
2. 设计工具接口
3. 实现工具
4. 添加错误处理
5. 测试工具使用

#### 复制粘贴提示词
```
Use @agent-tool-builder to create agent tools
```

### 第六阶段：记忆系统

#### 需要调用的技能
- `agent-memory-systems` - 记忆架构
- `conversation-memory` - 对话记忆

#### 操作
1. 设计记忆结构
2. 实现短期记忆
3. 建立长期记忆
4. 添加实体记忆
5. 测试记忆检索

#### 复制粘贴提示词
```
Use @agent-memory-systems to implement agent memory
```

### 第七阶段：评估

#### 需要调用的技能
- `agent-evaluation` - Agent 评估
- `evaluation` - AI 评估

#### 操作
1. 定义评估标准
2. 创建测试场景
3. 测量 Agent 性能
4. 测试边界用例
5. 持续迭代改进

#### 复制粘贴提示词
```
Use @agent-evaluation to evaluate agent performance
```

## Agent 架构

```
User Input -> Planner -> Agent -> Tools -> Memory -> Response
              |          |        |        |
         Decompose   LLM Core  Actions  Short/Long-term
```

## 质量门

- [ ] Agent 逻辑正常运行
- [ ] 工具已集成
- [ ] 记忆功能正常
- [ ] 编排已测试
- [ ] 评估通过

## 相关工作流套件

- `ai-ml` - AI/ML 开发
- `rag-implementation` - RAG 系统
- `workflow-automation` - 工作流模式

## 限制
- 仅在任务明确符合上述范围时使用该技能。
- 不要将输出当作特定环境验证、测试或专家评审的替代。
- 当缺少所需输入、权限、安全边界或成功标准时，请暂停并请求澄清。
