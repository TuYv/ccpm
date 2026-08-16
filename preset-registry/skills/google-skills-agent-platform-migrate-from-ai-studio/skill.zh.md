---
name: agent-platform-migrate-from-ai-studio
metadata:
  category: AiAndMachineLearning
description: >-
  Guides agents and users through migrating from Gemini API in Google AI Studio to Gemini Enterprise Agent Platform (formerly Vertex AI). Use this skill when moving applications to Google Cloud, to leverage Cloud credits, or to unify inferencing with other Cloud infrastructure (IAM, billing, telemetry).
---
# 从 AI Studio 中的 Gemini API 迁移到 Agent Platform

当你需要将应用程序从以开发者为中心的 Google AI Studio 生态系统
（`generativelanguage.googleapis.com`）迁移到企业级 Google Cloud Agent
Platform（`aiplatform.googleapis.com`）时，请使用此技能。

--------------------------------------------------------------------------------

## 何时调用此技能

*   你希望将应用程序从 Google AI Studio 迁移到 Agent Platform
    （原 Vertex AI）。
*   你拥有希望用于抵扣 Gemini API 推理费用的 **Google Cloud 赠金**
    （例如价值 300 美元的新用户免费试用赠金）。
*   你需要将推理流水线、IAM 权限、遥测和结算与现有 Google Cloud
    基础设施（Compute Engine、Cloud SQL、BigQuery）统一起来。
*   你正在 Google Cloud 虚拟机上部署开源编排引擎（例如 OpenClaw 或 ADK
    智能体），并希望整个系统采用统一的 Google Cloud 结算结构。

--------------------------------------------------------------------------------

## Gemini API 对比

功能 / 控制项          | Google AI Studio（Gemini Developer API）                              | Agent Platform（企业级 Gemini API）
:--------------------- | :-------------------------------------------------------------------- | :-------------------------------------
**API 端点**           | `generativelanguage.googleapis.com`                                   | `aiplatform.googleapis.com`
**目标用户**           | 构建生产应用的开发者、初创企业、学生和研究人员。                       | 企业生产环境、MLOps 工程师
**GCP 赠金支持**       | 否（**无法**使用 GCP 赠金/免费试用赠金）                              | 是（可由新用户赠金或自定义赠金完全抵扣）
**数据隐私**           | 数据可能会被审查，以改进 Google 产品                                  | 提示词/响应**绝不会**用于训练
**安全与 IAM**         | API 密钥、OAuth                                                        | Google Cloud IAM（服务账号、OAuth 2.0、VPC-SC）
**合规性与 SLA**       | 无（尽力而为的可用性）                                                 | 全天候企业支持、SLA、HIPAA、SOC2
**吞吐量选项**         | 共享 / 受速率限制                                                     | 按量付费或预配吞吐量
**MLOps 生态系统**     | 基础提示词管理                                                        | 模型注册表、模型监控、流水线评估
**推理范围**           | 仅限全局端点                                                          | 同时支持全局端点和严格区域端点

有关这两种服务之间差异的更多信息，请参阅
[Google Cloud 文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/migrate/migrate-google-ai.md.txt)。

--------------------------------------------------------------------------------

## 迁移指南

### 结算和赠金

Google Cloud 免费试用赠金
**[不适用于 AI Studio](https://docs.cloud.google.com/free/docs/free-cloud-features.md.txt)**。
要将赠金用于 Gemini 模型，必须通过 Agent Platform 路由调用。

1.  创建 Google Cloud 结算账号。在设置过程中，必须提供有效的付款方式以验证身份。
2.  如果你是新客户，请确保价值 300 美元的迎新赠金已在结算控制台中激活。
3.  **避免意外扣费：** 为防止赠金用尽后自动改用你的标准付款方式，你应设置预算提醒：
    *   前往 **结算** -> **预算和提醒** -> **创建预算**。
    *   将阈值设置为与你的赠金额度或可接受的最高支出相对应。

### 启用 Agent Platform API

你必须在目标 Google Cloud 项目中显式启用 Agent Platform API。通过本地 shell 运行以下命令：

```bash
gcloud services enable aiplatform.googleapis.com --project="{project_id}"
```

### 身份验证与授权 (IAM)

#### 用户身份验证

对于本地调试或脚本执行，请使用
[应用默认凭据](https://docs.cloud.google.com/docs/authentication/application-default-credentials.md.txt)
(ADC) 进行身份验证。

**选项 1 - 自动化脚本**：

```bash
bash <(curl -sSL https://storage.googleapis.com/cloud-samples-data/adc/setup_adc.sh)
```

**选项 2 - 手动设置**：

```bash
gcloud auth login
gcloud auth application-default login
```

为你的用户身份授予执行推理调用所需的 IAM 角色：

```bash
gcloud projects add-iam-policy-binding "{project_id}" \
    --member="user:YOUR_EMAIL@domain.com" \
    --role="roles/aiplatform.user"
```

#### 服务身份验证

在 Compute Engine 虚拟机等 Google Cloud 基础设施上运行应用程序时，请使用机器附加的服务账号进行身份验证。例如，
[Compute Engine 默认服务账号](https://docs.cloud.google.com/compute/docs/access/service-accounts#default_service_account.md.txt)。

1.  为虚拟机的底层服务账号授予用户角色：

```bash
gcloud projects add-iam-policy-binding "{project_id}" \
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/aiplatform.user"
```

2.  **[Compute Engine 访问权限范围](https://docs.cloud.google.com/compute/docs/access/service-accounts.md.txt)：**
    旧版访问权限范围可能会覆盖 IAM 绑定。在预配或修改 Compute Engine 实例时，必须确认虚拟机的访问权限范围已配置为 **允许对所有 Cloud API 的完全访问权限**
    (`https://www.googleapis.com/auth/cloud-platform`)，或明确包含标准的 cloud-platform 权限范围。

--------------------------------------------------------------------------------

## 在 Agent Platform 中使用 Gemini API

### SDK（客户端库）

你可以继续使用统一的
[Google GenAI SDK](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/sdks/overview.md.txt)
(`google-genai`)。此 SDK 同时适用于 AI Studio 和 Agent Platform。你只需通过运行时环境变量切换路由标志，即可将请求发送到 Agent Platform 后端。

设置目标环境的详细信息：

```bash
export GOOGLE_CLOUD_PROJECT="{project_id}"
export GOOGLE_CLOUD_LOCATION="global"  # Or your chosen regional endpoint
export GOOGLE_GENAI_USE_ENTERPRISE=TRUE
```

现在，您的标准 python 代码将从使用 AI Studio 切换为使用 Agent Platform，而无需更改核心初始化代码块：

```python
from google import genai

# The client automatically picks up the GOOGLE_GENAI_USE_ENTERPRISE=TRUE environment flag
client = genai.Client()

response = client.models.generate_content(
    model='gemini-3-flash-preview',
    contents='Hello world!',
)
print(response.text)
```

### Agent Development Kit (ADK)

要从 Agent Development Kit 智能体调用 Agent Platform 中的 Gemini 模型，请按照以下步骤操作。

1.  向 Google Cloud 进行身份验证。

如果在 Google Cloud 中运行 ADK 智能体（例如 Agent Platform Runtime），请使用分配给该智能体的服务账号。或者，如果在本地运行 ADK，请执行：

```bash
gcloud auth application-default login
```

1.  设置环境变量。无论您的 ADK 智能体是在 Google Cloud 中运行还是在本地运行，都请确保已设置以下变量：

```bash
export GOOGLE_CLOUD_PROJECT="{project_id}"
export GOOGLE_CLOUD_LOCATION="global"
export GOOGLE_GENAI_USE_ENTERPRISE=TRUE
```

2.  初始化 ADK 智能体。您可以使用与 AI Studio 相同的模型字符串（例如 `gemini-3-flash-preview`）。

```python
from google.adk.agents.llm_agent import Agent

def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city."""
    return {"status": "success", "city": city, "time": "10:30 AM"}

root_agent = Agent(
    model='gemini-3-flash-preview',
    name='root_agent',
    description="Tells the current time in a specified city.",
    instruction="You are a helpful assistant that tells the current time in cities. Use the 'get_current_time' tool for this purpose.",
    tools=[get_current_time],
)
```

要详细了解如何将 ADK 智能体与 Agent Platform 集成，请[参阅 ADK 文档](https://raw.githubusercontent.com/google/adk-docs/main/docs/agents/models/agent-platform.md)。

### Antigravity CLI

Google Cloud 用户现在[可以通过](https://antigravity.google/pricing) Gemini Enterprise Agent Platform 使用 Antigravity 2.0，包括 Antigravity CLI。

1.  将 [Antigravity CLI 安装](https://antigravity.google/docs/cli-install)到本地环境。
2.  启动 Antigravity CLI。

    ```bash
    agy
    ```

3.  按照 CLI 设置提示操作——选择 **使用 Google Cloud 项目**。

4.  使用经过身份验证的 Google Cloud Workspace 或用户身份，在打开的浏览器窗口中完成 OAuth 流程。

5.  复制确认令牌，并将其直接粘贴回终端。

6.  按照提示输入您的 Google Cloud Project ID。

7.  选择您的 Google Cloud 位置（例如 `global`）。

8.  您也可以选择运行 `/model` 命令，以在 Agent Platform 中选择其他 Gemini 模型。

### OpenClaw

要将 OpenClaw 智能体配置为使用 Agent Platform 中的 Gemini 模型，请按照以下步骤操作。

1.  [按照 OpenClaw 的官方说明安装 OpenClaw](https://docs.openclaw.ai/install)。

⚠️ 重要提示：OpenClaw 2026.5.28 当前存在一个 `google-vertex` 错误。请暂时使用
2026.5.20。

2.  确保运行 OpenClaw 的运行时环境（例如具有服务账号的 GCE VM）
    拥有 `aiplatform.user` IAM 角色——请参阅上文的身份验证和
    授权部分。

3.  根据用户的项目 ID 获取项目编号。在 GCE 外部运行：

```bash
export PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
echo "Project number: $PROJECT_NUMBER"

```

在 Compute Engine VM 内运行：

```bash
export PROJECT_NUMBER=$(curl "http://metadata.google.internal/computeMetadata/v1/project/project-id" -H "Metadata-Flavor: Google")
echo "Project number: $PROJECT_NUMBER"
```

4.  在 GCE 实例外部，使用 Google Cloud 项目编号生成 `GOOGLE_APPLICATION_CREDENTIALS`。
    然后，使用 `scp` 将这些凭据复制到 GCE VM。

```bash
mkdir -p ~/.config/gcloud
gcloud iam service-accounts keys create ~/.config/gcloud/application_default_credentials.json --iam-account="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
```

> ⚠️ **新组织的政策约束问题排查**：新的 Google
> Cloud 组织（创建于 2024 年 5 月 4 日或之后）会强制执行一项[限制创建服务账号密钥的旧版组织政策](https://docs.cloud.google.com/organization-policy/restrict-service-accounts.md.txt)。要完成此步骤，必须暂时停用这项组织政策。
> 组织政策管理员必须将此政策设置为“未启用”。
> 对代理的要求：检查此政策是否已强制执行；如果是，请暂停，并
> 提示用户通过以下控制台链接将其停用：
> https://console.cloud.google.com/iam-admin/orgpolicies


5.  编辑通常位于以下位置的配置文件：
    `~/.openclaw/openclaw.json`。确保为 Gemini 模型添加
    `google-vertex/` 前缀。

> ⚠️ 重要提示：请勿使用 Gemini 3.5 模型，因为 OpenClaw 的 `google-vertex`
> 提供商尚不支持该模型。较旧的模型可以正常使用。在 Agent Platform 中使用
> [Gemini 3 Flash Preview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-flash)
> 模型时，请始终将位置设置为 `global`，而不是区域
> 端点。

```json
{
  "env": {
    "vars": {
      "GOOGLE_CLOUD_PROJECT": "PROJECT_ID",
      "GOOGLE_CLOUD_LOCATION": "global",
      "GOOGLE_APPLICATION_CREDENTIALS": "~/.config/gcloud/application_default_credentials.json"
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "google-vertex/gemini-3-flash-preview"
      },
      "workspace": "~/.openclaw/workspace",
      "compaction": {
        "mode": "safeguard"
      },
      "heartbeat": {
        "model": "google-vertex/gemini-3-flash-preview"
      }
    },
    "list": [
      {
        "id": "main",
        "workspace": "~/.openclaw/workspace",
        "model": "google-vertex/gemini-3-flash-preview"
      }
    ]
  },
  "session": {
    "dmScope": "per-channel-peer"
  },
  "tools": {
    "profile": "coding"
  }
}

```

6.  重启 OpenClaw。

```bash
openclaw gateway restart

```

7.  验证 OpenClaw 与 Agent Platform 的连接：

```bash
openclaw models status
openclaw agent --agent main --message "Hello world!"

```

--------------------------------------------------------------------------------

## 其他资源

*   [Google Cloud 免费试用功能与限制](https://docs.cloud.google.com/free/docs/free-cloud-features.md.txt)
*   [从 Google AI Studio 迁移到 Gemini Enterprise Agent Platform](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/migrate/migrate-google-ai.md.txt)
*   [Gemini Enterprise Agent Platform - 模型](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/google-models.md.txt)
*   [Agent Development Kit 文档 - 连接到 Agent Platform 中的模型](https://adk.dev/agents/models/agent-platform/#agent-platform-setup)
*   [OpenClaw 文档 - 连接到 Google 模型](https://docs.openclaw.ai/providers/google)
*   [Google Cloud 预算提醒 - 设置指南](https://docs.cloud.google.com/billing/docs/how-to/budgets#steps-to-create-budget.md.txt)