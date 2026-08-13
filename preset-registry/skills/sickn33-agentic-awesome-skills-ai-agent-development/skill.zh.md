---
name: ai-agent-development
description: "AI agent development workflow for building autonomous agents, multi-agent systems, and agent orchestration with CrewAI, LangGraph, and custom agents."
category: granular-workflow-bundle
risk: safe
source: personal
date_added: "2026-02-27"
---
# AI 代理开发工作流

## 概览

用于构建 AI 代理的专用工作流，涵盖单个自治代理、多代理系统、代理编排、工具集成以及人类在环（human-in-the-loop）模式。

## 何时使用此工作流

在以下情况使用本工作流：
- 构建自治 AI 代理
- 创建多代理系统
- 实施代理编排
- 为代理添加工具集成
- 搭建代理记忆

## 工作流阶段

### 第1阶段：代理设计

#### 需调用的 Skill
- `ai-agents-architect` - 代理架构
- `autonomous-agents` - 自治模式

#### 操作
1. 定义代理目标
2. 设计代理能力
3. 规划工具集成
4. 设计记忆系统
5. 定义成功指标

#### 复制粘贴提示词
```
Use @ai-agents-architect to design AI agent architecture
```

### 第2阶段：单代理实现

#### 需调用的 Skill
- `autonomous-agent-patterns` - 代理模式
- `autonomous-agents` - 自治代理

#### 操作
1. 选择代理框架
2. 实现代理逻辑
3. 添加工具集成
4. 配置记忆
5. 测试代理行为

#### 复制粘贴提示词
```
Use @autonomous-agent-patterns to implement single agent
```

### 第3阶段：多代理系统

#### 需调用的 Skill
- `crewai` - CrewAI 框架
- `multi-agent-patterns` - 多代理模式

#### 操作
1. 定义代理角色
2. 建立代理通信
3. 配置编排
4. 实现任务委派
5. 测试协调性

#### 复制粘贴提示词
```
Use @crewai to build multi-agent system with roles
```

### 第4阶段：代理编排

#### 需调用的 Skill
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

### 第5阶段：工具集成

#### 需调用的 Skill
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

### 第6阶段：记忆系统

#### 需调用的 Skill
- `agent-memory-systems` - 记忆架构
- `conversation-memory` - 对话记忆

#### 操作
1. 设计记忆结构
2. 实现短期记忆
3. 搭建长期记忆
4. 添加实体记忆
5. 测试记忆检索

#### 复制粘贴提示词
```
Use @agent-memory-systems to implement agent memory
```

### 第7阶段：评估

#### 需调用的 Skill
- `agent-evaluation` - 代理评估
- `evaluation` - AI 评估

#### 操作
1. 定义评估标准
2. 创建测试场景
3. 测量代理性能
4. 测试边界案例
5. 持续迭代改进

#### 复制粘贴提示词
```
Use @agent-evaluation to evaluate agent performance
```

## 代理架构

```
User Input -> Planner -> Agent -> Tools -> Memory -> Response
              |          |        |        |
         Decompose   LLM Core  Actions  Short/Long-term
```

## 质量门禁

- [ ] 代理逻辑正常运行
- [ ] 工具已集成
- [ ] 记忆功能正常
- [ ] 编排已测试
- [ ] 评估通过

## 相关工作流包

- `ai-ml` - AI/ML 开发
- `rag-implementation` - RAG 系统
- `workflow-automation` - 工作流模式

## 局限性
- 仅在任务明显符合上述范围时使用此技能。
- 不要将本输出视为替代特定环境验证、测试或专家评审。
- 若缺少所需输入、权限、安全边界或成功标准，请停止并请求澄清。
