---
name: google-cloud-recipe-auth
metadata:
  category: GettingStarted
description: Provides expert guidance on authenticating and authorizing to Google Cloud services and APIs, covering human users, service identities, Application Default Credentials (ADC), and best practices for secure access.
---
# 向 Google Cloud 进行身份验证

[身份验证](https://docs.cloud.google.com/docs/authentication.md.txt)是证明**你是谁**的过程。在 Google Cloud 中，你代表一个**主体**（例如用户或服务之类的身份）。这是进行[授权](https://docs.cloud.google.com/iam/docs/overview.md.txt)（确定**你可以做什么**）之前的第一步。

## 身份验证

### Agent 需要提出的澄清问题

在提供具体解决方案之前，请向用户澄清以下问题：

1.  **谁或什么正在进行身份验证？**（人类开发者、本地脚本，还是在生产环境中运行的应用程序？）
2.  **代码在哪里运行？**（本地笔记本电脑、[Compute
    Engine](https://docs.cloud.google.com/compute/docs.md.txt)、
    [GKE](https://docs.cloud.google.com/kubernetes-engine/docs.md.txt)、[Cloud
    Run](https://docs.cloud.google.com/run/docs.md.txt)，还是 AWS/Azure 等其他云平台？）
3.  **目标是什么？**（Storage/BigQuery 等 Google Cloud API，还是你构建的自定义应用程序？）
4.  **你是否正在使用高级客户端库？**（例如，Python、Go、Node.js 库通常会自动处理 ADC。）

---

## 人类用户身份验证

用户需要拥有 Google Cloud 可以识别的身份，才能访问 Google Cloud。

### 用户身份的类型

Google Cloud 支持通过多种方式为内部员工（开发者、管理员、雇员）配置身份：

*   **[Google 管理的账号](https://docs.cloud.google.com/iam/docs/user-identities.md.txt)**：
    你可以使用 Cloud Identity 或 Google Workspace 创建托管用户账号。这些账号称为托管账号，因为你的组织控制其生命周期和配置。
*   **[使用 Cloud Identity 或 Google
    Workspace 进行联合身份验证](https://docs.cloud.google.com/iam/docs/user-identities.md.txt)**：
    你可以联合身份，让用户使用其现有身份和凭据登录 Google 服务。用户通过外部身份提供商（IdP）进行身份验证，但你必须使用 Google Cloud Directory Sync（GCDS）等工具，或 Active Directory、Microsoft Entra ID 等外部权威来源，将账号同步到 Google Cloud。
*   **[员工身份联合](https://docs.cloud.google.com/iam/docs/user-identities.md.txt)**：
    这使你可以使用外部 IdP，通过 IAM 直接对员工进行身份验证和授权。与标准联合身份验证不同，你不需要将现有 IdP 中的用户身份同步到 Google Cloud 身份。它支持无需同步、基于属性的单点登录。

### 开发者和管理员的访问方式

用于在开发和管理期间与 Google Cloud 资源和 API 进行交互。

*   **[Google Cloud 控制台](https://console.cloud.google.com/)**：主要的 Web 界面。你使用 Google 账号（Gmail 或 [Google
    Workspace](https://workspace.google.com/)）进行身份验证。
*   **[gcloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk.md.txt) (`gcloud
    auth login`)**：用于对 CLI 本身进行身份验证，以便你运行管理命令（例如 `gcloud compute instances list`）。它使用存储在本地的**凭据**（例如 OAuth 2.0 刷新令牌）。
*   **使用[应用默认凭据
    (ADC)](https://docs.cloud.google.com/docs/authentication/application-default-credentials.md.txt)
    (`gcloud auth application-default login`) 进行本地开发**：这与 CLI 身份验证不同。它会创建一个本地 JSON 文件，供 Google Cloud **客户端库**（Python、Java 等）在你于笔记本电脑上运行代码时用来以“你”的身份执行操作。
*   **[服务账号模拟](https://docs.cloud.google.com/docs/authentication/use-service-account-impersonation.md.txt)**：
    出于安全原因，开发者应完全避免下载服务账号密钥。相反，他们应以人类用户身份进行身份验证（`gcloud auth
    login`），并使用服务账号模拟来运行 CLI 命令或生成短期凭据。这是本地开发和问题排查的一项关键最佳实践。

### 面向最终用户和客户

当需要让人类用户（非开发者）访问你部署在 Google Cloud 上的 Web 应用时使用。注意：这些身份不同于员工身份。

*   **[Identity-Aware Proxy (IAP)](https://docs.cloud.google.com/iap/docs.md.txt)**：
    充当 Web 应用的中央授权层。它会拦截 Web 请求并验证用户身份（通过 Google Workspace、Cloud
    Identity 或外部提供商），然后才允许请求到达应用。它通常用于在没有 VPN 的情况下保护内部应用，或保障客户门户的安全。
*   **[Identity
    Platform](https://docs.cloud.google.com/identity-platform/docs.md.txt)**：一种客户身份与访问管理（CIAM）解决方案，用于将消费者登录功能（电子邮件/密码、电话、社交账号）直接添加到你自行构建的应用代码中。

---

## 服务间身份验证

当代码在生产环境中运行时，应使用**服务账号**，而不是人类用户账号。

### 服务账号和服务代理

*   **[服务账号](https://docs.cloud.google.com/iam/docs/service-account-overview.md.txt)**：
    一种供非人类用户使用的特殊身份。它类似于拥有自己电子邮件地址的“机器人身份”。
*   **[服务代理](https://docs.cloud.google.com/iam/docs/service-agents.md.txt)**：
    一种由 Google 管理的服务账号，使某项服务（如 Pub/Sub）能够代表你访问你的资源。

### 最佳实践：附加服务账号

你不应使用**服务账号密钥**（危险的 JSON 文件），而应将自定义服务账号**附加**到 Google Cloud 资源。随后，该资源的环境会通过本地元数据服务器提供**令牌**（一种短期有效的数字对象）。

*   **[Compute
    Engine](https://docs.cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances.md.txt)**：
    在创建虚拟机时分配服务账号。
*   **[Cloud
    Run](https://docs.cloud.google.com/run/docs/securing/service-identity.md.txt)**：
    在服务配置中分配服务账号。

### 特殊情况和高级主题

#### Kubernetes Engine (GKE)

使用 **[适用于 GKE 的 Workload Identity Federation](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/workload-identity.md.txt)**，将 Kubernetes 身份映射到 IAM 主体标识符。这样可授予特定 Kubernetes 工作负载访问特定 Google Cloud API 的权限。[在此了解更多信息。](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/workload-identity.md.txt)

#### 外部工作负载（[Workload Identity Federation](https://docs.cloud.google.com/iam/docs/workload-identity-federation.md.txt)）

对于在 Google Cloud **外部**运行的代码（例如 AWS、Azure 或本地环境），不要使用密钥。应改用 Workload Identity Federation，将外部令牌（如 AWS IAM 角色）交换为短期有效的 Google Cloud 访问令牌。

#### [API 密钥](https://docs.cloud.google.com/docs/authentication/api-keys.md.txt)

API 密钥是经过加密的字符串，用于访问公共数据（例如 Google 地图），或用于简化访问流程，例如 **[Vertex AI Express
模式](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/express-mode/overview.md.txt)**。
该模式无需复杂设置，即可快速测试 Gemini 模型。对于支持 API 密钥的服务，用户和服务
（例如基于 Cloud Run 的 AI 智能体）均可使用 API 密钥。

注意：应将 API 密钥
[限制](https://docs.cloud.google.com/api-keys/docs/add-restrictions-api-keys.md.txt)
为仅可用于特定 API 和项目，以最大限度地降低安全风险。请将 API 密钥存储在
[Secret
Manager](https://docs.cloud.google.com/secret-manager/docs.md.txt) 等密钥管理器中，以防止
意外泄露。

#### OAuth 2.0 访问范围

尽管 IAM 是现代的授权处理方式，但旧版 Compute Engine 虚拟机和 GKE 节点池仍需将
**访问范围**与 IAM 结合使用。如果虚拟机的访问范围受到限制，那么即使关联的服务账号
拥有正确的 IAM 权限，也无法成功调用 API。如果关联的服务账号意外调用失败，请首先
检查这一点。

#### 短期凭据

模拟身份和安全服务间通信的底层机制是 **IAM Service Account Credentials API**。该 API
可动态生成短期访问令牌、OpenID Connect (OIDC) ID 令牌或自签名 JSON Web Token
(JWT)，从而无需使用静态凭据。

---

## 授权

完成身份验证后，Google Cloud 使用 **[Identity and Access Management
(IAM)](https://docs.cloud.google.com/iam/docs/overview.md.txt)** 来确定经过身份验证的主体
可以执行哪些操作。

*   **允许政策**：将**主体**与**资源**上的**角色**绑定的记录。
*   **[预定义
    角色](https://docs.cloud.google.com/iam/docs/roles-permissions)**：
    预先构建的角色，例如 `roles/storage.objectViewer` 或
    `roles/bigquery.dataEditor`。**始终优先尝试使用这些角色。**
*   **[自定义
    角色](https://docs.cloud.google.com/iam/docs/creating-custom-roles.md.txt)**：
    如果预定义角色的权限范围过于宽泛，可以使用由用户定义的特定权限集合。

---

## 示例

### 用户到服务（本地 Python 开发）

1.  **身份验证**：运行 `gcloud auth application-default login` 以创建本地
    凭据 (ADC)。
2.  **授权**：为你的电子邮件账号授予存储桶上的 `roles/storage.objectViewer`
    角色。
3.  **代码**：使用 Python `storage.Client()`。它会通过 ADC 自动查找你的
    本地凭据。*注意：ADC 按特定顺序进行搜索——首先检查
    `GOOGLE_APPLICATION_CREDENTIALS` 环境变量，然后检查本地 gcloud JSON 文件，
    最后检查关联服务账号的元数据服务器。*

### 服务到服务（Cloud Run 到 Cloud SQL）

1.  **身份验证**：将自定义服务账号关联到你的 Cloud Run 服务。
2.  **授权**：为该服务账号授予项目上的 `roles/cloudsql.client`
    角色。
3.  **代码**：Cloud Run 环境会自动向连接驱动程序提供令牌。

### 调用自定义应用（[OIDC](https://docs.cloud.google.com/docs/authentication/get-id-token.md.txt)）

从一个服务调用私有 Cloud Run 服务时，调用方会生成由 Google 签名的 **OpenID Connect (OIDC) ID Token**，并通过 `Authorization: Bearer <TOKEN>` 标头传递该令牌。

---

## 验证清单

-   [ ] 用户是否在本地运行代码？建议使用 `gcloud auth
    application-default login` 或**服务账号模拟**。
-   [ ] 用户是否尝试在本地使用服务账号密钥？应强烈劝阻，并建议使用模拟。
-   [ ] 用户是否在生产环境中运行？建议附加一个具有最小权限的自定义服务账号，而不要使用密钥。
-   [ ] 用户是否依赖 Compute Engine 默认服务账号？建议改为创建自定义服务账号。
-   [ ] 用户是否在其他云平台上运行？建议使用工作负载身份联合。
-   [ ] 用户是否在调用自定义应用？建议使用 OIDC ID Token。
-   [ ] 用户是否限制了其 API 密钥？检查是否设置了适当的 [API 密钥限制](https://docs.cloud.google.com/docs/authentication/api-keys.md.txt)。

## 参考资料

-   [身份验证概览](https://docs.cloud.google.com/docs/authentication.md.txt)
-   [用户身份](https://docs.cloud.google.com/iam/docs/user-identities.md.txt)
-   [应用默认凭据](https://docs.cloud.google.com/docs/authentication/provide-credentials-adc.md.txt)
-   [服务账号最佳实践](https://docs.cloud.google.com/iam/docs/best-practices-service-accounts.md.txt)