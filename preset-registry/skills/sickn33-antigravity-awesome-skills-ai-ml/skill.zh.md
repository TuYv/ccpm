---
name: ai-ml
description: "AI and machine learning workflow covering LLM application development, RAG implementation, agent architecture, ML pipelines, and AI-powered features."
category: workflow-bundle
risk: safe
source: personal
date_added: "2026-02-27"
---
# AI/ML 工作流套件

## 概述

用于构建 LLM 应用、实现 RAG 系统、创建 AI 智能体以及开发机器学习流水线的综合 AI/ML 工作流。该套件编排面向生产级 AI 开发的各项技能。

## 何时使用此工作流

在以下情况下使用此工作流：
- 构建 LLM 驱动的应用
- 实现 RAG（检索增强生成）
- 创建 AI 智能体
- 开发机器学习流水线
- 为应用添加 AI 功能
- 搭建 AI 可观测性

## 工作流阶段

### 阶段 1：AI 应用设计

#### 要调用的技能
- `ai-product` - AI 产品开发
- `ai-engineer` - AI 工程
- `ai-agents-architect` - 智能体架构
- `llm-app-patterns` - LLM 模式

#### 操作
1. 定义 AI 用例
2. 选择合适的模型
3. 设计系统架构
4. 规划数据流
5. 定义成功指标

#### 复制粘贴提示词
```
Use @ai-product to design AI-powered features
```

```
Use @ai-agents-architect to design multi-agent system
```

### 阶段 2：LLM 集成

#### 要调用的技能
- `llm-application-dev-ai-assistant` - AI 助手开发
- `llm-application-dev-langchain-agent` - LangChain 智能体
- `llm-application-dev-prompt-optimize` - 提示词工程
- `gemini-api-dev` - Gemini API

#### 操作
1. 选择 LLM 提供商
2. 设置 API 访问
3. 实现提示词模板
4. 配置模型参数
5. 添加流式支持
6. 实现错误处理

#### 复制粘贴提示词
```
Use @llm-application-dev-ai-assistant to build conversational AI
```

```
Use @llm-application-dev-langchain-agent to create LangChain agents
```

```
Use @llm-application-dev-prompt-optimize to optimize prompts
```

### 阶段 3：RAG 实现

#### 要调用的技能
- `rag-engineer` - RAG 工程
- `rag-implementation` - RAG 实现
- `embedding-strategies` - 嵌入向量选择
- `vector-database-engineer` - 向量数据库
- `similarity-search-patterns` - 相似度搜索
- `hybrid-search-implementation` - 混合搜索

#### 操作
1. 设计数据流水线
2. 选择嵌入模型
3. 搭建向量数据库
4. 实现分块策略
5. 配置检索
6. 添加重排序
7. 实现缓存

#### 复制粘贴提示词
```
Use @rag-engineer to design RAG pipeline
```

```
Use @vector-database-engineer to set up vector search
```

```
Use @embedding-strategies to select optimal embeddings
```

### 阶段 4：AI 智能体开发

#### 要调用的技能
- `autonomous-agents` - 自主智能体模式
- `autonomous-agent-patterns` - 智能体模式
- `crewai` - CrewAI 框架
- `langgraph` - LangGraph
- `multi-agent-patterns` - 多智能体系统
- `computer-use-agents` - 计算机操作智能体

#### 操作
1. 设计智能体架构
2. 定义智能体角色
3. 实现工具集成
4. 搭建记忆系统
5. 配置编排
6. 添加人工介入环节

#### 复制粘贴提示词
```
Use @crewai to build role-based multi-agent system
```

```
Use @langgraph to create stateful AI workflows
```

```
Use @autonomous-agents to design autonomous agent
```

### 阶段 5：机器学习流水线开发

#### 要调用的技能
- `ml-engineer` - 机器学习工程
- `mlops-engineer` - MLOps
- `machine-learning-ops-ml-pipeline` - 机器学习流水线
- `ml-pipeline-workflow` - 机器学习工作流
- `data-engineer` - 数据工程

#### 操作
1. 设计机器学习流水线
2. 搭建数据处理
3. 实现模型训练
4. 配置评估
5. 搭建模型注册表
6. 部署模型

#### 复制粘贴提示词
```
Use @ml-engineer to build machine learning pipeline
```

```
Use @mlops-engineer to set up MLOps infrastructure
```

### 阶段 6：AI 可观测性

#### 要调用的技能
- `langfuse` - Langfuse 可观测性
- `manifest` - Manifest 遥测
- `evaluation` - AI 评估
- `llm-evaluation` - LLM 评估

#### 操作
1. 设置链路追踪
2. 配置日志记录
3. 实现评估
4. 监控性能
5. 跟踪成本
6. 设置告警

#### 复制粘贴提示词
```
Use @langfuse to set up LLM observability
```

```
Use @evaluation to create evaluation framework
```

### 阶段 7：AI 安全

#### 要调用的技能
- `prompt-engineering` - 提示词安全
- `security-scanning-security-sast` - 安全扫描

#### 操作
1. 实现输入验证
2. 添加输出过滤
3. 配置速率限制
4. 设置访问控制
5. 监控滥用行为
6. 实现审计日志

## AI 开发检查清单

### LLM 集成
- [ ] API 密钥已妥善保管
- [ ] 速率限制已配置
- [ ] 错误处理已实现
- [ ] 流式传输已启用
- [ ] Token 用量已跟踪

### RAG 系统
- [ ] 数据流水线正常运行
- [ ] 嵌入向量已生成
- [ ] 向量搜索已优化
- [ ] 检索准确性已测试
- [ ] 缓存已实现

### AI 智能体
- [ ] 智能体角色已定义
- [ ] 工具已集成
- [ ] 记忆系统正常运行
- [ ] 编排已测试
- [ ] 错误处理稳健可靠

### 可观测性
- [ ] 链路追踪已启用
- [ ] 指标已收集
- [ ] 评估已运行
- [ ] 告警已配置
- [ ] 仪表盘已创建

## 质量门禁

- [ ] 所有 AI 功能已测试
- [ ] 性能基准已达标
- [ ] 安全措施已到位
- [ ] 可观测性已配置
- [ ] 文档已完备

## 相关工作流套件

- `development` - 应用开发
- `database` - 数据管理
- `cloud-devops` - 基础设施
- `testing-qa` - AI 测试

## 局限性
- 仅当任务明确符合上述范围时才使用此技能。
- 不要将输出视为针对特定环境的验证、测试或专家评审的替代品。
- 如果缺少所需的输入、权限、安全边界或成功标准，请停止并请求澄清。
