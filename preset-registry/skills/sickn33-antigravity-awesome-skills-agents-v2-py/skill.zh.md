---
name: agents-v2-py
description: "Build container-based Foundry Agents with Azure AI Projects SDK (ImageBasedHostedAgentDefinition). Use when creating hosted agents with custom container images in Azure AI Foundry."
risk: critical
source: community
date_added: "2026-02-27"
---
# Azure AI 托管代理（Python）

使用 `Azure AI Projects SDK` 中的 `ImageBasedHostedAgentDefinition` 构建基于容器的托管代理。

## 安装

```bash
pip install azure-ai-projects>=2.0.0b3 azure-identity
```

**最低 SDK 版本：**托管代理支持需要 `2.0.0b3` 或更高版本。

## 环境变量

```bash
AZURE_AI_PROJECT_ENDPOINT=https://<resource>.services.ai.azure.com/api/projects/<project>
```

## 先决条件

在创建托管代理之前：

1. **容器镜像** - 构建并推送到 Azure Container Registry（ACR）
2. **ACR 拉取权限** - 为项目的托管标识授予 `AcrPull` 角色
3. **能力主机** - 设置账户级能力主机，`enablePublicHostingEnvironment=true`
4. **SDK 版本** - 确保 `azure-ai-projects>=2.0.0b3`

## 身份验证

始终使用 `DefaultAzureCredential`：

```python
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

credential = DefaultAzureCredential()
client = AIProjectClient(
    endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    credential=credential
)
```

## 核心流程

### 1. 导入

```python
import os
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    ImageBasedHostedAgentDefinition,
    ProtocolVersionRecord,
    AgentProtocol,
)
```

### 2. 创建托管代理

```python
client = AIProjectClient(
    endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    credential=DefaultAzureCredential()
)

agent = client.agents.create_version(
    agent_name="my-hosted-agent",
    definition=ImageBasedHostedAgentDefinition(
        container_protocol_versions=[
            ProtocolVersionRecord(protocol=AgentProtocol.RESPONSES, version="v1")
        ],
        cpu="1",
        memory="2Gi",
        image="myregistry.azurecr.io/my-agent:latest",
        tools=[{"type": "code_interpreter"}],
        environment_variables={
            "AZURE_AI_PROJECT_ENDPOINT": os.environ["AZURE_AI_PROJECT_ENDPOINT"],
            "MODEL_NAME": "gpt-4o-mini"
        }
    )
)

print(f"Created agent: {agent.name} (version: {agent.version})")
```

### 3. 列出代理版本

```python
versions = client.agents.list_versions(agent_name="my-hosted-agent")
for version in versions:
    print(f"Version: {version.version}, State: {version.state}")
```

### 4. 删除代理版本

```python
client.agents.delete_version(
    agent_name="my-hosted-agent",
    version=agent.version
)
```

## ImageBasedHostedAgentDefinition 参数

| 参数 | 类型 | 必需 | 说明 |
|-----------|------|----------|-------------|
| `container_protocol_versions` | `list[ProtocolVersionRecord]` | 是 | 代理支持的协议版本 |
| `image` | `str` | 是 | 完整的容器镜像路径（registry/image:tag） |
| `cpu` | `str` | 否 | CPU 分配（例如 `"1"`、`"2"`） |
| `memory` | `str` | 否 | 内存分配（例如 `"2Gi"`、`"4Gi"`） |
| `tools` | `list[dict]` | 否 | 代理可用的工具 |
| `environment_variables` | `dict[str, str]` | 否 | 容器的环境变量 |

## 协议版本

`container_protocol_versions` 参数指定你的代理支持哪些协议：

```python
from azure.ai.projects.models import ProtocolVersionRecord, AgentProtocol

# RESPONSES protocol - standard agent responses
container_protocol_versions=[
    ProtocolVersionRecord(protocol=AgentProtocol.RESPONSES, version="v1")
]
```

**可用协议：**
| 协议 | 说明 |
|----------|-------------|
| `AgentProtocol.RESPONSES` | 标准代理交互响应协议 |

## 资源分配

为你的容器指定 CPU 和内存：

```python
definition=ImageBasedHostedAgentDefinition(
    container_protocol_versions=[...],
    image="myregistry.azurecr.io/my-agent:latest",
    cpu="2",      # 2 CPU cores
    memory="4Gi"  # 4 GiB memory
)
```

**资源限制：**
| 资源 | 最小值 | 最大值 | 默认值 |
|----------|-----|-----|---------|
| CPU | 0.5 | 4 | 1 |
| 内存 | 1Gi | 8Gi | 2Gi |

## 工具配置

将工具添加到你的托管代理：

### 代码解释器

```python
tools=[{"type": "code_interpreter"}]
```

### MCP 工具

```python
tools=[
    {"type": "code_interpreter"},
    {
        "type": "mcp",
        "server_label": "my-mcp-server",
        "server_url": "https://my-mcp-server.example.com"
    }
]
```

### 多个工具

```python
tools=[
    {"type": "code_interpreter"},
    {"type": "file_search"},
    {
        "type": "mcp",
        "server_label": "custom-tool",
        "server_url": "https://custom-tool.example.com"
    }
]
```

### 环境变量

向你的容器传递配置：

```python
environment_variables={
    "AZURE_AI_PROJECT_ENDPOINT": os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    "MODEL_NAME": "gpt-4o-mini",
    "LOG_LEVEL": "INFO",
    "CUSTOM_CONFIG": "value"
}
```

**最佳实践：**切勿硬编码密钥。请使用环境变量或 Azure Key Vault。

## 完整示例

```python
import os
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    ImageBasedHostedAgentDefinition,
    ProtocolVersionRecord,
    AgentProtocol,
)

def create_hosted_agent():
    """Create a hosted agent with custom container image."""
    
    client = AIProjectClient(
        endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
        credential=DefaultAzureCredential()
    )
    
    agent = client.agents.create_version(
        agent_name="data-processor-agent",
        definition=ImageBasedHostedAgentDefinition(
            container_protocol_versions=[
                ProtocolVersionRecord(
                    protocol=AgentProtocol.RESPONSES,
                    version="v1"
                )
            ],
            image="myregistry.azurecr.io/data-processor:v1.0",
            cpu="2",
            memory="4Gi",
            tools=[
                {"type": "code_interpreter"},
                {"type": "file_search"}
            ],
            environment_variables={
                "AZURE_AI_PROJECT_ENDPOINT": os.environ["AZURE_AI_PROJECT_ENDPOINT"],
                "MODEL_NAME": "gpt-4o-mini",
                "MAX_RETRIES": "3"
            }
        )
    )
    
    print(f"Created hosted agent: {agent.name}")
    print(f"Version: {agent.version}")
    print(f"State: {agent.state}")
    
    return agent

if __name__ == "__main__":
    create_hosted_agent()
```

## 异步模式

```python
import os
from azure.identity.aio import DefaultAzureCredential
from azure.ai.projects.aio import AIProjectClient
from azure.ai.projects.models import (
    ImageBasedHostedAgentDefinition,
    ProtocolVersionRecord,
    AgentProtocol,
)

async def create_hosted_agent_async():
    """Create a hosted agent asynchronously."""
    
    async with DefaultAzureCredential() as credential:
        async with AIProjectClient(
            endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
            credential=credential
        ) as client:
            agent = await client.agents.create_version(
                agent_name="async-agent",
                definition=ImageBasedHostedAgentDefinition(
                    container_protocol_versions=[
                        ProtocolVersionRecord(
                            protocol=AgentProtocol.RESPONSES,
                            version="v1"
                        )
                    ],
                    image="myregistry.azurecr.io/async-agent:latest",
                    cpu="1",
                    memory="2Gi"
                )
            )
            return agent
```

## 常见错误

| 错误 | 原因 | 解决方案 |
|-------|------|----------|
| `ImagePullBackOff` | ACR 拉取权限被拒绝 | 为项目的托管标识授予 `AcrPull` 角色 |
| `InvalidContainerImage` | 找不到镜像 | 验证镜像路径和标签在 ACR 中存在 |
| `CapabilityHostNotFound` | 未配置能力主机 | 创建账户级能力主机 |
| `ProtocolVersionNotSupported` | 协议版本无效 | 使用 `AgentProtocol.RESPONSES` 与版本 `"v1"` |

## 最佳实践

1. **版本化镜像** - 在生产环境中使用特定标签，而不是 `latest`
2. **最小化资源** - 从最低 CPU/内存开始，根据需要向上扩展
3. **环境变量** - 用于所有配置，绝不要硬编码
4. **错误处理** - 在 `try/except` 块中封装代理创建
5. **清理** - 删除未使用的代理版本以释放资源

## 参考链接

- [Azure AI Projects SDK](https://pypi.org/project/azure-ai-projects/)
- [Hosted Agents Documentation](https://learn.microsoft.com/azure/ai-services/agents/how-to/hosted-agents)
- [Azure Container Registry](https://learn.microsoft.com/azure/container-registry/)

## 使用时机
此技能适用于执行概览中描述的工作流或操作。

## 局限性
- 仅在任务明确符合上述范围时使用此技能。
- 不要将输出视为特定环境验证、测试或专家审查的替代方案。
- 如果缺少所需的输入、权限、安全边界或成功标准，请停止并要求澄清。
