---
name: data-manager-api-event-ingestion
description: >-
  Guides developers through implementing event and conversion ingestion to
  Google products using the Data Manager API /v1/events/ingest endpoint
  and its associated client libraries. Use this skill when the user wants to upload
  offline conversions, enhanced conversions for leads, click conversions, Google
  Analytics web or app events, or any other event ingestion use case supported by
  the Data Manager API. Don't use for uploading audience members (use the
  data-manager-api-audience-ingestion skill).
metadata:
  version: 1.1
  category: GoogleAds
---
# Data Manager API 事件注入

## 实现工作流

### 前提条件

-   **身份验证与库安装**：如果需要设置 Data Manager API 的访问权限，或安装客户端库和实用工具库，请参阅 `data-manager-api-setup` skill。

### 第 1 步：确定用例并阅读文档

-   **确定目标账号类型**：[关键] 如果未明确说明，请停止并向用户确认数据将发送到何处（例如 Google Ads、Floodlight、Google Analytics），然后再生成任何代码。不要默认假设为 Google Ads。这对应于 `Destination` 中 `operating_account` 的 `account_type` 字段，同时也决定了有效的事件标识符和要求。
-   **阅读文档**：[关键] 按照[发送事件指南](https://developers.google.com/data-manager/api/devguides/events/send-events.md.txt)实现集成，因为配置和发送请求的步骤可能因目标平台而异。

### 第 2 步：获取代码示例

> [!IMPORTANT]
> 如果要编写或更新注入脚本，务必获取相关代码示例作为参考：

| 语言 | 示例 |
| :--- | :--- |
| **Python** | [`ingest_events.py`](https://github.com/googleads/data-manager-python/blob/main/samples/events/ingest_events.py) |
| **Java** | [`IngestEvents.java`](https://github.com/googleads/data-manager-java/blob/main/data-manager-samples/src/main/java/com/google/ads/datamanager/samples/IngestEvents.java) |
| **PHP** | [`ingest_events.php`](https://github.com/googleads/data-manager-php/blob/main/samples/events/ingest_events.php) |
| **Node** | [`ingest_events.ts`](https://github.com/googleads/data-manager-node/blob/main/samples/events/ingest_events.ts) |
| **.NET**| [`IngestEvents.cs`](https://github.com/googleads/data-manager-dotnet/blob/main/samples/IngestEvents.cs) |

### 第 3 步：获取迁移指南

> [!IMPORTANT]
> 如果要重构代码以从其他 Google API 升级，务必提取相关字段映射指南的完整内容。

#### Google Ads

*   **Google Ads API 离线转化**：
    [Google Ads 离线转化迁移字段映射](https://developers.google.com/data-manager/api/devguides/events/google-ads/offline/upgrade/field-mappings.md.txt)
*   **Google Ads API 门店销售**：
    [Google Ads 门店销售迁移字段映射](https://developers.google.com/data-manager/api/devguides/events/google-ads/store-sales/upgrade/field-mappings.md.txt)

#### Google Analytics

*   **Measurement Protocol (Google Analytics)**：
    [Google Analytics Measurement Protocol 迁移字段映射](https://developers.google.com/data-manager/api/devguides/events/analytics/measurement-protocol/upgrade/field-mappings.md.txt)

#### Campaign Manager 360 (CM360)

*   **Campaign Manager 360 API 离线转化**：
    [Campaign Manager 360 离线转化迁移字段映射](https://developers.google.com/data-manager/api/devguides/events/cm360/offline/upgrade/field-mappings.md.txt)

### 步骤 4：实现

使用以下检查点实现数据注入逻辑：

-   [ ] **初始化客户端**：实例化 Data Manager 客户端
    (`IngestionServiceClient`)。
-   [ ] **定义目标位置**：使用 `product_destination_id` 和适当的账号配置构建
    `Destination` 对象：`operating_account`（接收数据的目标账号）、
    `login_account`（使用经理账号或数据合作伙伴账号进行身份验证时），以及
    `linked_account`（如果你是数据合作伙伴，并通过指向经理账号的合作伙伴链接访问该账号）。
    **强烈建议**：有关配置目标位置的更多详细信息，请参阅
    [配置目标位置和标头](https://developers.google.com/data-manager/api/devguides/concepts/destinations.md.txt)
    指南。
-   [ ] **准备事件数据**：使用实用工具库中的辅助函数，正确设置用户标识符的格式并进行规范化。
-   [ ] **构造载荷**：构建包含目标位置、事件记录和用户意见权限的请求载荷
    (`IngestEventsRequest`)。
-   [ ] **支持验证**：支持在 `IngestEventsRequest` 中发送 `validate_only` 布尔选项，
    以便开发者在不实际上传数据的情况下验证架构。
-   [ ] **发送请求**：执行 `ingest_events`，并记录返回的
    `request_id`，以供后续诊断使用。
-   [ ] **检查数据注入警告**：如果任何非必填字段验证失败，
    `ingest_events` 的响应还会包含 `field_warnings`，这是一个
    `FieldWarning` 对象列表，其中详细说明了相关问题。
-   [ ] **检索请求状态**：使用诊断功能检查数据注入请求的状态。由于请求处理是异步的，
    成功的数据注入响应（HTTP 200 OK 并返回 `request_id`）仅表示已收到载荷。
    若要检查记录是处理成功、部分成功还是处理失败，请使用 `request_id` 查询
    `client.retrieve_request_status` 端点。跳过此步骤是用户常犯的错误。

## 格式设置

*   获取[设置用户数据格式](https://developers.google.com/data-manager/api/devguides/concepts/formatting.md.txt)
    指南，并将其作为格式设置和规范化规则的权威依据。

*   使用实用工具库设置用户数据（电子邮件地址、电话号码、地址）的格式、对其进行哈希处理和加密。

    **Python 示例：**

    ```python
    from google.ads.datamanager_util import Formatter
    from google.ads.datamanager_util.format import Encoding

    formatter: Formatter = Formatter()

    processed_email: str = formatter.process_email_address(
        email, Encoding.HEX
    )
    ```

## 关键注意事项

*   将 `product_destination_id` 格式化为数字字符串。它不是资源名称路径。
*   严格按照 RFC 3339 格式设置 `event_timestamp`。在可用的情况下，使用 SDK 的强类型时间戳对象，而不是原始字符串。
*   将点击标识符（`gclid`、`gbraid`、`wbraid`）嵌套在
    `ad_identifiers` 块内，而不是直接放在基础事件载荷中。
*   `ConsentStatus` 的枚举值为 `CONSENT_GRANTED` 和
    `CONSENT_DENIED`。请勿使用 `GRANTED` 和 `DENIED`。
*   请注意，`consent` 可以在 `IngestEventsRequest` 上全局设置，也可以在单个
    `Event` 上设置。
*   验证 `UserIdentifier` 使用的是 `email_address` 和 `phone_number`。
    请勿使用 Google Ads API 字段 `hashed_email` 和
    `hashed_phone_number`。
*   确保事件中的货币字段名为 `currency`，而不是
    `currency_code`。
*   如果 `validate_only` 设置为 `true`，请勿调用诊断端点
    (`retrieve_request_status`)。

## 错误处理与问题排查

### 检查错误载荷与数据注入警告

> [!IMPORTANT]
> 请参阅[了解 API 错误](https://developers.google.com/data-manager/api/devguides/concepts/understand-errors.md.txt)，
> 获取有关如何理解 API 返回的错误和警告结构的详细指南。

### 检索请求状态（诊断）

定期使用指数退避轮询状态，最早应在发送 `IngestEventsRequest`
30 分钟后开始。

1.  使用 `RetrieveRequestStatusRequest(request_id=...)` 调用
    `client.retrieve_request_status`。
2.  遍历响应中的 `request_status_per_destination`，检查
    每个目标的 `request_status`。
3.  如果处理已完成，且 `request_status` 为 `SUCCESS`、
    `PARTIAL_SUCCESS` 或 `FAILED`，请检查诊断值：
    *   **事件记录数**：检查 `events_ingestion_status.record_count`
        （包括成功和失败的记录）。
    *   **错误详情**：如果状态为 `FAILED` 或 `PARTIAL_SUCCESS`，请检查
        `error_info.error_counts` 下每个错误的 `reason` 和 `record_count`。
    *   **警告详情**：检查 `warning_info.warning_counts` 下每个警告的
        `reason` 和 `record_count`（即使目标状态为 `SUCCESS`）。

## API 参考

*   [REST API 参考](https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest.md.txt)
*   [诊断指南](https://developers.google.com/data-manager/api/devguides/diagnostics.md.txt)