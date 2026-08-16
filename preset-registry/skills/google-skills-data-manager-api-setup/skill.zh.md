---
name: data-manager-api-setup
description: >-
  Guides developers through client library installation and authentication setup
  steps for the Data Manager API. Use this skill when a user is getting started
  with the Data Manager API and needs to setup their local environment, install
  the client library, or setup access to the API. Don't use for implementing
  audience or event ingestion logic (use the data-manager-api-audience-ingestion
  or data-manager-api-event-ingestion skills instead).
metadata:
  version: 1.0
  category: GoogleAds
---
# Data Manager API 设置

## 设置身份验证

有关更多详细信息，请参阅[设置 API 访问权限](https://developers.google.com/data-manager/api/devguides/quickstart/set-up-access.md.txt)。

1.  **启用 API（前提条件）**：检查用户是否已在其 Google Cloud 项目中启用 Data Manager API。
2.  **生成 ADC**：通过 `gcloud auth application-default login`，使用应用默认凭据（ADC）对本地工作区进行身份验证。
    *   **必需的作用域**：包括作用域
        `https://www.googleapis.com/auth/datamanager` 和
        `https://www.googleapis.com/auth/cloud-platform`。
    *   **多 API 作用域**：如果将相同的凭据用于其他 API，
        请附加相应的作用域（例如
        `https://www.googleapis.com/auth/adwords`）。
    *   **服务账号**：确保服务账号具有
        `Service Usage Consumer` IAM 角色，并且执行 `gcloud`
        的用户拥有该服务账号的令牌创建者角色
        (`roles/iam.serviceAccountTokenCreator`)，以便进行模拟。

## 安装客户端库和实用工具库

有关更多详细信息，请参阅[安装客户端库](https://developers.google.com/data-manager/api/devguides/quickstart/install-library.md.txt)。

配套的实用工具库提供预构建的辅助类和函数，用于在通过 API 摄取数据之前，正确设置用户标识符（例如电子邮件地址、电话号码和实际地址）的格式，并对其进行哈希和加密。强烈建议使用这些库，以确保用户标识符的格式符合 API 的规范。

请在下方选择特定语言的安装指南：

*   [Python 设置参考](references/python.md)（软件包：`google-ads-datamanager` 和 `google-ads-datamanager-util`）
*   [Java 设置参考](references/java.md)（软件包：`com.google.api-ads:data-manager` 和 `data-manager-util`）
*   [Node 设置参考](references/node.md)（软件包：`@google-ads/datamanager` 和 `@google-ads/data-manager-util`）
*   [PHP 设置参考](references/php.md)（软件包：`googleads/data-manager` 和 `googleads/data-manager-util`）
*   [.NET 设置参考](references/dotnet.md)（软件包：`Google.Ads.DataManager.V1` 和 `Google.Ads.DataManager.Util.csproj`）