---
name: autogpt-agents
description: Autonomous AI agent platform for building and deploying continuous agents. Use when creating visual workflow agents, deploying persistent autonomous agents, or building complex multi-step AI automation systems.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Agents, AutoGPT, Autonomous Agents, Workflow Automation, Visual Builder, AI Platform]
dependencies: [autogpt-platform>=0.4.0]
---
# AutoGPT - 自主 AI 智能体平台

一个用于通过可视化界面或开发工具包构建、部署和管理持续运行的 AI 智能体的综合平台。

## 何时使用 AutoGPT

**在以下情况下使用 AutoGPT：**
- 构建持续运行的自主智能体
- 创建基于可视化工作流的 AI 智能体
- 部署由外部触发器（Webhook、定时任务）触发的智能体
- 构建复杂的多步骤自动化流水线
- 需要无代码/低代码智能体构建器

**主要功能：**
- **可视化智能体构建器**：基于节点的拖放式工作流编辑器
- **持续执行**：智能体通过触发器持久运行
- **市场**：可供分享和复用的预构建智能体与块
- **块系统**：用于 LLM、工具和集成的模块化组件
- **Forge 工具包**：用于创建自定义智能体的开发工具
- **基准测试系统**：标准化的智能体性能测试

**以下情况请改用其他方案：**
- **LangChain/LlamaIndex**：如果你需要更精细地控制智能体逻辑
- **CrewAI**：适用于基于角色的多智能体协作
- **OpenAI Assistants**：适用于简单的托管式智能体部署
- **Semantic Kernel**：适用于 Microsoft 生态系统集成

## 快速开始

### 安装（Docker）

```bash
# Clone repository
git clone https://github.com/Significant-Gravitas/AutoGPT.git
cd AutoGPT/autogpt_platform

# Copy environment file
cp .env.example .env

# Start backend services
docker compose up -d --build

# Start frontend (in separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 访问平台

- **前端 UI**：http://localhost:3000
- **后端 API**：http://localhost:8006/api
- **WebSocket**：ws://localhost:8001/ws

## 架构概览

AutoGPT 包含两个主要系统：

### AutoGPT 平台（生产环境）
- 配备 React 前端的可视化智能体构建器
- 配备执行引擎的 FastAPI 后端
- PostgreSQL + Redis + RabbitMQ 基础设施

### AutoGPT Classic（开发环境）
- **Forge**：智能体开发工具包
- **Benchmark**：性能测试框架
- **CLI**：用于开发的命令行界面

## 核心概念

### 图与节点

智能体表示为由**链接**连接多个**节点**所构成的**图**：

```
Graph (Agent)
  ├── Node (Input)
  │   └── Block (AgentInputBlock)
  ├── Node (Process)
  │   └── Block (LLMBlock)
  ├── Node (Decision)
  │   └── Block (SmartDecisionMaker)
  └── Node (Output)
      └── Block (AgentOutputBlock)
```

### 块

块是可复用的功能组件：

| 块类型 | 用途 |
|------------|---------|
| `INPUT` | 智能体入口点 |
| `OUTPUT` | 智能体输出 |
| `AI` | LLM 调用、文本生成 |
| `WEBHOOK` | 外部触发器 |
| `STANDARD` | 通用操作 |
| `AGENT` | 嵌套智能体执行 |

### 执行流程

```
User/Trigger → Graph Execution → Node Execution → Block.execute()
     ↓              ↓                 ↓
  Inputs      Queue System      Output Yields
```

## 构建智能体

### 使用可视化构建器

1. 在 http://localhost:3000 **打开智能体构建器**
2. 从 BlocksControl 面板中**添加块**
3. 通过在连接点之间拖动来**连接节点**
4. 在每个节点中**配置输入**
5. 使用 PrimaryActionBar **运行智能体**

### 可用块

**AI 块：**
- `AITextGeneratorBlock` - 使用 LLM 生成文本
- `AIConversationBlock` - 多轮对话
- `SmartDecisionMakerBlock` - 条件逻辑

**集成块：**
- GitHub、Google、Discord、Notion 连接器
- Webhook 触发器和处理程序
- HTTP 请求块

**控制块：**
- 输入/输出块
- 分支和决策节点
- 循环和迭代块

## 智能体执行

### 触发器类型

**手动执行：**
```http
POST /api/v1/graphs/{graph_id}/execute
Content-Type: application/json

{
  "inputs": {
    "input_name": "value"
  }
}
```

**Webhook 触发：**
```http
POST /api/v1/webhooks/{webhook_id}
Content-Type: application/json

{
  "data": "webhook payload"
}
```

**定时执行：**
```json
{
  "schedule": "0 */2 * * *",
  "graph_id": "graph-uuid",
  "inputs": {}
}
```

### 监控执行

**WebSocket 更新：**
```javascript
const ws = new WebSocket('ws://localhost:8001/ws');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(`Node ${update.node_id}: ${update.status}`);
};
```

**REST API 轮询：**
```http
GET /api/v1/executions/{execution_id}
```

## 使用 Forge（开发）

### 创建自定义智能体

```bash
# Setup forge environment
cd classic
./run setup

# Create new agent from template
./run forge create my-agent

# Start agent server
./run forge start my-agent
```

### 智能体结构

```
my-agent/
├── agent.py          # Main agent logic
├── abilities/        # Custom abilities
│   ├── __init__.py
│   └── custom.py
├── prompts/          # Prompt templates
└── config.yaml       # Agent configuration
```

### 实现自定义能力

```python
from forge import Ability, ability

@ability(
    name="custom_search",
    description="Search for information",
    parameters={
        "query": {"type": "string", "description": "Search query"}
    }
)
def custom_search(query: str) -> str:
    """Custom search ability."""
    # Implement search logic
    result = perform_search(query)
    return result
```

## 智能体基准测试

### 运行基准测试

```bash
# Run all benchmarks
./run benchmark

# Run specific category
./run benchmark --category coding

# Run with specific agent
./run benchmark --agent my-agent
```

### 基准测试类别

- **编码**：代码生成和调试
- **检索**：信息查找
- **Web**：Web 浏览和交互
- **写作**：文本生成任务

### VCR 录制带

基准测试使用录制的 HTTP 响应来确保可复现性：

```bash
# Record new cassettes
./run benchmark --record

# Run with existing cassettes
./run benchmark --playback
```

## 集成

### 添加凭据

1. 导航至 Profile > Integrations
2. 选择提供商（OpenAI、GitHub、Google 等）
3. 输入 API 密钥或授权 OAuth
4. 凭据将被加密并安全存储

### 在块中使用凭据

块会自动访问用户凭据：

```python
class MyLLMBlock(Block):
    def execute(self, inputs):
        # Credentials are injected by the system
        credentials = self.get_credentials("openai")
        client = OpenAI(api_key=credentials.api_key)
        # ...
```

### 支持的提供商

| 提供商 | 身份验证类型 | 使用场景 |
|----------|-----------|-----------|
| OpenAI | API 密钥 | LLM、嵌入 |
| Anthropic | API 密钥 | Claude 模型 |
| GitHub | OAuth | 代码、仓库 |
| Google | OAuth | Drive、Gmail、Calendar |
| Discord | 机器人令牌 | 消息传递 |
| Notion | OAuth | 文档 |

## 部署

### Docker 生产环境配置

```yaml
# docker-compose.prod.yml
services:
  rest_server:
    image: autogpt/platform-backend
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    ports:
      - "8006:8006"

  executor:
    image: autogpt/platform-backend
    command: poetry run executor

  frontend:
    image: autogpt/platform-frontend
    ports:
      - "3000:3000"
```

### 环境变量

| 变量 | 用途 |
|----------|---------|
| `DATABASE_URL` | PostgreSQL 连接 |
| `REDIS_URL` | Redis 连接 |
| `RABBITMQ_URL` | RabbitMQ 连接 |
| `ENCRYPTION_KEY` | 凭证加密 |
| `SUPABASE_URL` | 身份验证 |

### 生成加密密钥

```bash
cd autogpt_platform/backend
poetry run cli gen-encrypt-key
```

## 最佳实践

1. **从简单开始**：从包含 3-5 个节点的智能体开始
2. **增量测试**：每次更改后都运行并测试
3. **使用 Webhook**：为事件驱动型智能体设置外部触发器
4. **监控成本**：通过积分系统跟踪 LLM API 使用情况
5. **对智能体进行版本管理**：更改前保存可用版本
6. **基准测试**：使用 agbenchmark 验证智能体质量

## 常见问题

**服务无法启动：**
```bash
# Check container status
docker compose ps

# View logs
docker compose logs rest_server

# Restart services
docker compose restart
```

**数据库连接问题：**
```bash
# Run migrations
cd backend
poetry run prisma migrate deploy
```

**智能体执行卡住：**
```bash
# Check RabbitMQ queue
# Visit http://localhost:15672 (guest/guest)

# Clear stuck executions
docker compose restart executor
```

## 参考资料

- **[高级用法](references/advanced-usage.md)** - 自定义块、部署、扩展
- **[故障排除](references/troubleshooting.md)** - 常见问题、调试

## 资源

- **文档**：https://docs.agpt.co
- **仓库**：https://github.com/Significant-Gravitas/AutoGPT
- **Discord**：https://discord.gg/autogpt
- **许可证**：MIT（经典版）/ Polyform Shield（平台版）