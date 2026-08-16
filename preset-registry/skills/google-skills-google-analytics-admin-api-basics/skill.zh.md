---
name: google-analytics-admin-api-basics
metadata:
  category: GoogleAnalytics
description: >-
  Manages Google Analytics account and property settings, enables the Analytics Admin API via the Cloud CLI, lists accounts and properties, and manages data streams, custom dimensions, conversion events, and integrations. Use when you need to programmatically configure Google Analytics accounts, provision properties, manage data retention, configure Measurement Protocol secrets, or manage Firebase and Google Ads links.
---
# Google Analytics Admin API 入门

Google Analytics Admin API 提供对 Google Analytics 账号和媒体资源配置的编程访问。你可以使用它自动执行账号管理、管理数据流、配置自定义维度以及处理产品集成。

## 通过 Cloud CLI 启用 API

在进行 API 调用之前，请确保已在你的 Google Cloud 项目中启用 Google Analytics Admin API。

如果找不到 `gcloud`，请先提示用户安装 Google Cloud CLI，然后再运行以下命令。

1.  **启用 API：** 使用 Cloud CLI（`gcloud`）启用
    `analyticsadmin.googleapis.com`。

    ```bash
    gcloud services enable analyticsadmin.googleapis.com --quiet
    ```

    *原因：启用 API 可确保你的 Cloud 项目已获得管理 Google Analytics 配置所需的配额和权限。*

2.  **验证 API 是否已启用：**

    ```bash
    gcloud services list --enabled --filter="analyticsadmin.googleapis.com"
    ```

## 身份验证

要对 API 请求进行身份验证，你必须生成应用默认凭据（ADC），并为你的账号授予必要的权限范围。在终端中运行以下命令：

```bash
gcloud auth application-default login --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly"
```

*原因：这会在你的本地环境中配置 ADC，并授予所需的 Cloud Platform 和 Google Analytics 只读权限范围，使客户端库能够自动对你的请求进行身份验证。*

> [!NOTE] **配置更改**：更改 Google Analytics 账号/媒体资源配置的方法需要
> `https://www.googleapis.com/auth/analytics.edit` 权限范围。

## Admin API 用例

你可以使用 Google Analytics Admin API 执行以下操作：

*   运行数据访问报告（有关更多信息，请参阅
    https://developers.google.com/analytics/devguides/config/admin/v1/access-api.md.txt）
*   创建账号摘要
*   管理账号
*   配置新账号
*   搜索账号变更历史记录事件
*   管理和创建媒体资源
*   管理媒体资源数据保留设置
*   管理转化事件
*   管理自定义维度和指标
*   管理数据流并配置 Measurement Protocol 密钥
*   管理 Firebase 关联
*   管理 Google Ads 关联
*   管理关键事件

### 仅限 v1alpha 的用例

以下功能目前仅在 Admin API 的 `v1alpha` 版本中可用：

*   管理账号和媒体资源访问权限绑定
*   创建和管理汇总媒体资源
*   创建和管理子媒体资源
*   确认用户数据收集
*   更改媒体资源的归因、数据保留、Google 信号、报告身份和用户提供的数据设置
*   管理 AdSense 关联
*   管理 BigQuery 关联
*   管理受众群体
*   管理渠道组
*   管理计算指标
*   管理 DisplayVideo360Advertiser 关联
*   管理扩展数据集
*   管理报告数据注释
*   管理 SearchAds360 关联
*   管理数据流的事件创建规则
*   管理 iOS 数据流的 SKAdNetwork 转化价值架构
*   提交删除 Google Analytics 媒体资源用户数据的请求。

## 调用 Admin API

要与 Admin API 交互，请使用官方 Google Analytics Admin 客户端库。请注意，
`v1beta` 是 Admin API 最稳定的版本。如需使用最新功能，请考虑使用
`v1alpha`。

> [!IMPORTANT] **强制性 Agent 指令：** 当用户选择或要求使用
> 特定编程语言时，请阅读下面列出的 `references/` 中对应的客户端库设置
> 参考指南。

### 支持的客户端库

#### Python

如果需要为 Python 安装或设置 Google Analytics Admin API 客户端库，
请阅读设置指南：

*   [Python 安装参考](references/python.md) *（软件包：
    `google-analytics-admin`）*

#### Java

如果需要为 Java 安装或设置 Google Analytics Admin API 客户端库，
请阅读设置指南：

*   [Java 安装参考](references/java.md) *（构件：
    `com.google.cloud:google-cloud-analytics-admin`）*

#### PHP

如果需要为 PHP 安装或设置 Google Analytics Admin API 客户端库，
请阅读设置指南：

*   [PHP 安装参考](references/php.md) *（软件包：
    `google/analytics-admin`）*

#### Node.js

如果需要为 Node.js 安装或设置 Google Analytics Admin API 客户端库，
请阅读设置指南：

*   [Node.js 安装参考](references/nodejs.md) *（软件包：
    `@google-analytics/admin`）*

#### Go

如果需要为 Go 安装或设置 Google Analytics Admin API 客户端库，
请阅读设置指南：

*   [Go 安装参考](references/go.md) *（软件包：
    `cloud.google.com/go/analytics/admin/apiv1beta`）*

#### .NET

如果需要为 .NET / C# 安装或设置 Google Analytics Admin API 客户端库，
请阅读设置指南：

*   [.NET 安装参考](references/dotnet.md) *（软件包：
    `Google.Analytics.Admin.V1Beta`）*

#### Ruby

如果需要为 Ruby 安装或设置 Google Analytics Admin API 客户端库，
请阅读设置指南：

*   [Ruby 安装参考](references/ruby.md) *（Gem：
    `google-analytics-admin-v1alpha`）*

> [!NOTE] **其他资源**：如需查看使用 Java、PHP、Node.js、.NET、Python 和 REST
> 调用 Admin API 的更多示例，以及使用服务账号进行
> 身份验证的提示，请参阅官方
> [Admin API 快速入门](https://developers.google.com/analytics/devguides/config/admin/v1/quickstart)。
> 如需查看 `v1alpha` 和 `v1beta` 的完整 API 参考文档，请参阅
> 
> [Admin API 参考](https://developers.google.com/analytics/devguides/config/admin/v1/rest)。

### Python 快速入门

1.  **安装客户端库：**

    ```bash
    pip install google-analytics-admin
    ```

    如果 `pip` 不可用，请提示用户先安装 `pip`，然后再
    安装客户端库。

2.  **列出账号和媒体资源：** 以下是一个完整示例，演示了
    如何调用 Admin API，使用 `list_account_summaries()` 列出当前用户可用的所有账号及其子级
    媒体资源。

```python
    from google.analytics.admin import AnalyticsAdminServiceClient

    def sample_list_account_summaries():
        # Initialize the client.
        # Assumes Application Default Credentials (ADC) are configured in your environment.
        client = AnalyticsAdminServiceClient()

        # list_account_summaries returns a summary of all accounts accessible to the
        # user and their child properties.
        account_summaries = client.list_account_summaries()

        print("Available Google Analytics Accounts and Properties:")
        for summary in account_summaries:
            print(f"Account: {summary.display_name} ({summary.account})")
            for property_summary in summary.property_summaries:
                print(f"  Property: {property_summary.display_name} ({property_summary.property})")

    if __name__ == "__main__":
        sample_list_account_summaries()
    ```