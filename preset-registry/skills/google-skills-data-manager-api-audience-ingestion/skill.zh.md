---
name: data-manager-api-audience-ingestion
description: >-
  Guides developers through managing (adding, removing, and clearing) audience members for Google products using
  the Data Manager API and its associated client libraries. Use this skill when the user wants to upload audience
  members, remove specific users, or clear/replace an entire audience for Customer Match, mobile device ID audiences, or any
  other audience use case supported by the Data Manager API. Don't use for uploading events or
  conversions (use the data-manager-api-event-ingestion skill).
metadata:
  version: 1.1
  category: GoogleAds
---
# Data Manager API 受众数据注入

## 实施工作流

### 前提条件

-   **身份验证与库安装**：如果需要设置 Data Manager API 的访问权限，或安装客户端库和实用工具库，请参阅 `data-manager-api-setup` skill。
-   **创建受众（如需要）**：如果用户没有现有受众或需要创建新受众，请使用 [创建受众](references/create-audience.md) 参考文档。此步骤会提供数据注入或移除请求所需的 `product_destination_id`。

### 第 1 步：确定使用场景并阅读文档

-   **确定目标账号类型**：[关键] 如果不清楚数据将发送到哪里（例如 Google Ads、Display & Video 360 等），请在生成任何代码之前停止并向用户澄清。不要默认假定为 Google Ads。此类型映射到 `Destination` 中 `operating_account` 的 `account_type` 字段。
-   **阅读实施指南**：阅读与目标平台和使用场景相关的指南。请在回答问题或编写代码之前完成此操作，因为每个目标平台都有独特的载荷结构、用户意见征求规则和必填字段。

| 目标平台 | 受众类型 | 接受的数据类型 | 上传指南 | 全部移除/全部替换指南 |
| :--- | :--- | :--- | :--- | :--- |
| **Google Ads** | 客户匹配 | `composite_data.user_data`（联系信息）、`mobile_data`（设备 ID）、`user_id_data`（用户 ID） | [上传数据](https://developers.google.com/data-manager/api/devguides/audiences/google-ads/customer-match/upload-data.md.txt) | [全部移除/全部替换](https://developers.google.com/data-manager/api/devguides/audiences/google-ads/customer-match/remove-all-members.md.txt) |
| **Display & Video 360** (DV360) | 客户匹配 | `composite_data.user_data`（联系信息）、`mobile_data`（设备 ID） | [上传数据](https://developers.google.com/data-manager/api/devguides/audiences/display-video/customer-match/upload-data.md.txt) | [全部移除/全部替换](https://developers.google.com/data-manager/api/devguides/audiences/display-video/customer-match/remove-all-members.md.txt) |

### 第 2 步：获取代码示例

> [!IMPORTANT] 如果要编写或更新数据注入脚本，请务必获取相关代码示例作为参考：

| 语言 | 示例 |
| :--- | :--- |
| **Python** | [`ingest_audience_members.py`](https://github.com/googleads/data-manager-python/blob/main/samples/audiences/ingest_audience_members.py) |
| **Java** | [`IngestAudienceMembers.java`](https://github.com/googleads/data-manager-java/blob/main/data-manager-samples/src/main/java/com/google/ads/datamanager/samples/IngestAudienceMembers.java) |
| **PHP** | [`ingest_audience_members.php`](https://github.com/googleads/data-manager-php/blob/main/samples/audiences/ingest_audience_members.php) |
| **Node** | [`ingest_audience_members.ts`](https://github.com/googleads/data-manager-node/blob/main/samples/audiences/ingest_audience_members.ts) |
| **.NET**| [`IngestAudienceMembers.cs`](https://github.com/googleads/data-manager-dotnet/blob/main/samples/IngestAudienceMembers.cs) |

### 步骤 3：获取迁移指南

> [!IMPORTANT] 如果通过重构代码从其他 Google API 升级，请务必
> 提取相关字段映射指南的完整内容。

#### Google Ads

*   **Google Ads API 客户匹配**：[Google Ads API 到客户匹配的
    迁移字段
    映射](https://developers.google.com/data-manager/api/devguides/audiences/google-ads/customer-match/upgrade/field-mappings.md.txt)

#### Display & Video 360

*   **Display & Video 360 API 客户匹配**：[Display & Video 360 API 到
    客户匹配的迁移字段
    映射](https://developers.google.com/data-manager/api/devguides/audiences/display-video/customer-match/upgrade/field-mappings.md.txt)

### 步骤 4：实现

使用以下检查点实现数据注入逻辑：

-   [ ] **初始化客户端**：实例化 Data Manager 客户端
    (`IngestionServiceClient`)。
-   [ ] **定义目标位置**：使用 `product_destination_id` 和适当的账号配置构建
    `Destination` 对象：
    `operating_account`（接收数据的目标账号）、`login_account`（如果
    使用经理账号或数据合作伙伴账号进行身份验证）以及
    `linked_account`（如果你是通过指向经理账号的合作伙伴关联来访问该账号的
    数据合作伙伴）。**强烈建议**：请参阅
    [配置目标位置和标头](https://developers.google.com/data-manager/api/devguides/concepts/destinations.md.txt)
    指南，详细了解如何配置目标位置。
-   [ ] **格式化用户数据**：如果发送 `IngestAudienceMembersRequest` 或
    `RemoveAudienceMembersRequest`，请参阅**[格式化用户
    数据](references/formatting.md)**，以使用实用工具库正确规范化用户标识符并对其进行哈希处理。
-   [ ] **构造载荷**：根据操作构建相应的请求载荷：
    *   **添加**：`IngestAudienceMembersRequest`
    *   **移除**：`RemoveAudienceMembersRequest`
    *   **全部移除**：`RemoveAllAudienceMembersRequest`
-   [ ] **支持验证**：支持在载荷中发送 `validate_only` 布尔
    选项，以便开发者在不实际应用更改的情况下验证架构。
-   [ ] **发送请求**：执行相应的方法，并记录返回的
    `request_id`，以供后续诊断：
    *   **添加**：`ingest_audience_members`
    *   **移除**：`remove_audience_members`
    *   **全部移除**：`remove_all_audience_members`
-   [ ] **检查数据注入警告**：如果任何非必填字段
    验证失败，`ingest_audience_members` 的响应还将
    包含 `field_warnings`，即详细说明相关问题的 `FieldWarning` 对象列表。
-   [ ] **获取请求状态**：使用诊断功能检查数据注入请求的状态。
    由于请求处理是异步进行的，因此成功响应（HTTP 200 OK，并返回 `request_id`）
    仅表示载荷已被接收。要检查记录实际是处理成功、部分成功还是失败，
    请使用 `request_id` 查询 `client.retrieve_request_status`。
    跳过此步骤是用户常犯的错误。

## 关键注意事项

*   如果在 `ingest_audience_members` 或 `remove_audience_members` 的
    `user_data` 中发送经过哈希处理的用户标识符，则必须将
    `IngestAudienceMembersRequest` 的 `encoding` 字段设置为 `HEX` 或 `BASE64`。
*   如果向 Customer Match 受众群体*上传*数据，则必须在
    `IngestAudienceMembersRequest` 中设置 `terms_of_service` 字段，以表明用户已
    接受相关政策。
*   仅当所有必填字段（`postal_code`、`family_name`、`given_name`、
    `region_code`）均存在时，才应设置 `UserIdentifier` 的 `address` 字段；
    不完整的 `address` 字段将导致 API 请求失败。
*   `product_destination_id` 必须是数字字符串。它不是资源名称。
*   `ConsentStatus` 的枚举值为 `CONSENT_GRANTED` 和
    `CONSENT_DENIED`。请勿使用值 `GRANTED` 和 `DENIED`。
*   `UserIdentifier` 的字段名称为 `email_address` 和 `phone_number`。请
    勿使用 Google Ads API 的字段名称 `hashed_email` 和
    `hashed_phone_number`。
*   如果 `validate_only` 设置为 `true`，请勿调用诊断端点
    （`retrieve_request_status`）。

## 错误处理与问题排查

### 检查错误载荷与注入警告

> [!IMPORTANT]
> 有关如何理解 API 返回的错误和警告结构的详细指南，请参阅
> [了解 API 错误](https://developers.google.com/data-manager/api/devguides/concepts/understand-errors.md.txt)。

### 检索请求状态（诊断）

使用指数退避策略定期轮询状态，并且应至少在发送请求 30 分钟后开始。

1.  使用 `RetrieveRequestStatusRequest(request_id=...)` 调用
    `client.retrieve_request_status`。
2.  遍历响应中的 `request_status_per_destination`，检查
    每个目标的 `request_status`。
3.  如果处理已完成，且 `request_status` 为 `SUCCESS`、
    `PARTIAL_SUCCESS` 或 `FAILED`，请检查诊断值：
    *   **受众群体状态**：检查特定于请求的状态：
        *   **注入**：检查嵌套在
            `audience_members_ingestion_status` 下的特定数据类型状态（例如
            `composite_data_ingestion_status`）。
        *   **移除单个成员**：检查嵌套在
            `audience_members_removal_status` 下的特定数据类型状态（例如
            `composite_data_removal_status`）。
        *   **移除所有成员**：对于此请求类型，没有可供检查的嵌套状态字段或记录
            计数。
        *   **记录计数**：如果适用（注入或移除单个
            成员），请检查 `record_count`（嵌套在特定数据类型的
            状态对象中），其中同时包含成功和失败的数量。
        *   **标识符计数**：如果适用（注入或移除单个
            成员），请检查嵌套在状态对象中的特定数据类型计数字段
            （例如，上传或移除复合数据时为 `data_type_counts`，上传或移除
            移动 ID 时为 `mobile_id_count`）。有关其他计数字段，请参阅[诊断
            指南](https://developers.google.com/data-manager/api/devguides/diagnostics.md.txt)。
        *   **匹配率范围**：对于 `user_data` 和
            `composite_data` 的上传，请检查嵌套在状态对象中的
            `upload_match_rate_range`。
    *   **错误详情**：如果状态为 `FAILED` 或 `PARTIAL_SUCCESS`，请检查
        `error_info.error_counts` 下每个错误的 `reason` 和 `record_count`。
    *   **警告详情**：检查 `warning_info.warning_counts` 下每个警告的
        `reason` 和 `record_count`（即使目标状态为 `SUCCESS`）。

## API 参考

*   [发送受众成员指南](https://developers.google.com/data-manager/api/devguides/audiences/send-audience-members.md.txt)
*   [REST API 参考：注入](https://developers.google.com/data-manager/api/reference/rest/v1/audienceMembers/ingest.md.txt)
*   [REST API 参考：移除](https://developers.google.com/data-manager/api/reference/rest/v1/audienceMembers/remove.md.txt)
*   [REST API 参考：全部移除](https://developers.google.com/data-manager/api/reference/rest/v1/audienceMembers/removeAll.md.txt)