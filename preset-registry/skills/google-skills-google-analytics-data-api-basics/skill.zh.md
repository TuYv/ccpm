---
name: google-analytics-data-api-basics
metadata:
  category: GoogleAnalytics
description: >-
  Manages Google Analytics reporting data, enables the Analytics Data API via the Cloud CLI, and creates reports using the Google Analytics Data API (v1beta). Use when you need to interact with Google Analytics properties, run customized analytics reports, query metrics (like activeUsers, screenPageViews) and dimensions (like city, date), check metrics and dimensions compatibility, or verify API enablement. Don't use for Google Analytics Admin API operations (e.g., creating properties, managing users) or for front-end tracking installation.
---
# Google Analytics Data API 入门

Google Analytics Data API v1beta 提供对 Google Analytics 报告数据的编程访问。借助该 API，你可以构建自定义信息中心、自动执行报告工作流，并将 Google Analytics 数据集成到企业应用中。

## 通过 Cloud CLI 启用 API

在调用 API 之前，请确保已在 Google Cloud 项目中启用 Google Analytics Data API。

如果找不到 `gcloud`，请先提示用户安装 Google Cloud CLI，然后再运行以下命令。

1.  **启用 API：** 使用 Cloud CLI（`gcloud`）启用
    `analyticsdata.googleapis.com`。

    ```bash
    gcloud services enable analyticsdata.googleapis.com --quiet
    ```

    *原因：启用 API 可确保你的 Cloud 项目已获得运行 Google Analytics 报告所需的配额和权限。*

2.  **验证 API 是否已启用：**

    ```bash
    gcloud services list --enabled --filter="analyticsdata.googleapis.com"
    ```

## 身份验证

要对 API 请求进行身份验证，你必须生成应用默认凭据（ADC），并为你的账号授予必要的作用域。在终端中运行以下命令：

```bash
gcloud auth application-default login --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly"
```

*原因：此命令会在本地环境中配置 ADC，并授予所需的 Cloud Platform 和 Google Analytics 只读作用域，使客户端库能够自动对你的请求进行身份验证。*

## 创建 Data API 报告（v1beta）

要创建报告，请使用官方 Google Analytics Data 客户端库。应始终优先使用 API 的 `v1beta` 版本，以获得稳定性并使用当前的 Google Analytics 报告功能。

> [!IMPORTANT] **代理强制指令：** 当用户选择或要求使用特定编程语言时，请阅读下方列出的 `references/` 中对应的客户端库设置参考指南。

### 支持的客户端库

#### Python

如果需要为 Python 安装或设置 Google Analytics Data API 客户端库，请阅读设置指南：

*   [Python 安装参考](references/python.md) *（软件包：
    `google-analytics-data`）*

#### Java

如果需要为 Java 安装或设置 Google Analytics Data API 客户端库，请阅读设置指南：

*   [Java 安装参考](references/java.md) *（制品：
    `com.google.cloud:google-cloud-analytics-data`）*

#### PHP

如果需要为 PHP 安装或设置 Google Analytics Data API 客户端库，请阅读设置指南：

*   [PHP 安装参考](references/php.md) *（软件包：
    `google/analytics-data`）*

#### Node.js

如果需要为 Node.js 安装或设置 Google Analytics Data API 客户端库，请阅读设置指南：

*   [Node.js 安装参考](references/nodejs.md) *（软件包：
    `@google-analytics/data`）*

#### Go

如果需要为 Go 安装或设置 Google Analytics Data API 客户端库，请阅读设置指南：

*   [Go 安装参考](references/go.md) *（软件包：
    `cloud.google.com/go/analytics/data/apiv1beta`）*

#### .NET

如果需要安装或设置适用于 .NET / C# 的 Google Analytics Data API 客户端库，
请阅读设置指南：

*   [.NET 安装参考](references/dotnet.md) *（软件包：
    `Google.Analytics.Data.V1Beta`）*

#### Ruby

如果需要安装或设置适用于 Ruby 的 Google Analytics Data API 客户端库，
请阅读设置指南：

*   [Ruby 安装参考](references/ruby.md) *（Gem：
    `google-analytics-data-v1beta`）*

> [!NOTE] **其他资源**：如需进一步了解如何使用 Java、PHP、Node.js、.NET、Python
> 和 REST 调用 Data API 的示例，以及使用服务账号进行身份验证的提示，请参阅官方
> [Data API 快速入门](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart)。

### Python 快速入门

1.  **安装客户端库：**

    ```bash
    pip install google-analytics-data
    ```

    如果 `pip` 不可用，请提示用户先安装 `pip`，然后再安装客户端库。

2.  **运行报告请求：** 以下是一个完整示例，演示如何查询 Google Analytics 媒体资源，
    获取按城市和日期分组的活跃用户数及会话数。请将 `YOUR-PROPERTY-ID` 替换为实际的
    Google Analytics 媒体资源 ID（例如 `1234567`）。

    ```python
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

    def sample_run_report(property_id: str):
        # Initialize the client.
        # Assumes Application Default Credentials (ADC) are configured in your environment.
        client = BetaAnalyticsDataClient()

        request = RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[
                Dimension(name="city"),
                Dimension(name="date")
            ],
            metrics=[
                Metric(name="activeUsers"),
                Metric(name="sessions")
            ],
            date_ranges=[
                DateRange(start_date="2026-05-01", end_date="today")
            ],
        )

        response = client.run_report(request)

        print(f"Report result for property {property_id}:")
        for row in response.rows:
            print(
                f"City: {row.dimension_values[0].value}, "
                f"Date: {row.dimension_values[1].value}, "
                f"Active Users: {row.metric_values[0].value}, "
                f"Sessions: {row.metric_values[1].value}"
            )

    if __name__ == "__main__":
        sample_run_report("YOUR-PROPERTY-ID")
    ```

    *原因：使用 `BetaAnalyticsDataClient` 和 `RunReportRequest` 可确保
    与 v1beta 端点兼容，并提供强类型的请求验证。*

## 指标和维度架构

构造 `RunReportRequest` 时，必须为维度和指标使用有效的 API 名称。有关可用字段的完整、
权威列表，请参阅官方
[Data API 架构文档](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)。

### 常用维度

维度表示数据的分类属性。

*   `city`：用户所在的城镇或城市。
*   `country`：用户所在的国家/地区。
*   `date`：事件的日期，格式为 YYYYMMDD。
*   `deviceCategory`：移动设备的类别（例如桌面设备、移动设备、
    平板电脑）。
*   `eventName`：触发的事件名称。
*   `pageTitle`：网页的标题。

### 常用指标

指标表示定量测量值。

*   `activeUsers`：活跃用户数。
*   `eventCount`：事件总数。
*   `sessions`：会话总数。
*   `screenPageViews`：浏览的应用屏幕或网页数量。
*   `totalRevenue`：来自购买、订阅和
    广告的总收入。

### 指标和维度兼容性检查

某些维度和指标无法在同一个报告请求中一起查询。
如果遇到与字段不兼容有关的 `INVALID_ARGUMENT` 错误，请验证字段组合。若要以编程方式访问 Data API
架构，请使用 `getMetadata()`。若要在运行报告之前以编程方式检查
特定维度和指标组合的兼容性，请使用
`checkCompatibility()` 方法。

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import CheckCompatibilityRequest, Compatibility, Dimension, Metric

def sample_check_compatibility(property_id: str):
    client = BetaAnalyticsDataClient()

    # Define the dimensions and metrics you want to query together.
    # For example, checking if 'itemName' (an e-commerce dimension)
    # is compatible with 'activeUsers' and 'totalRevenue'.
    request = CheckCompatibilityRequest(
        property=f"properties/{property_id}",
        dimensions=[
            Dimension(name="itemName"),
            Dimension(name="date")
        ],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="totalRevenue")
        ],
    )
    response = client.check_compatibility(request)

    print(f"Compatibility check for property {property_id}:")
    for dim in response.dimension_compatibilities:
        is_compatible = dim.compatibility == Compatibility.COMPATIBLE
        print(f"Dimension '{dim.dimension_metadata.api_name}' is compatible: {is_compatible}")

    for metric in response.metric_compatibilities:
        is_compatible = metric.compatibility == Compatibility.COMPATIBLE
        print(f"Metric '{metric.metric_metadata.api_name}' is compatible: {is_compatible}")

if __name__ == "__main__":
    sample_check_compatibility("YOUR-PROPERTY-ID")
```