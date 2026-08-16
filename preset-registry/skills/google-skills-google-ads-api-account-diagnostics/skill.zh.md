---
name: google-ads-api-account-diagnostics
description: >-
  Diagnoses Google Ads account performance issues such as conversion loss (value or volume), low lead flow/volume, and lost impression share (opportunities) due to ad rank, bids, or budgets. Use when troubleshooting sudden performance drops, analyzing campaign impression share metrics, investigating low lead flow, or searching for bidding and budget constraints. Don't use for setting up new campaigns, uploading conversion events directly, or general Google Mobile Ads SDK integration issues (use gma-android-integrate instead).
metadata:
  category: GoogleAds
  author: google-ads-api-team
  version: "1.0"
---
# Google Ads API 账号效果诊断技能

此技能提供了有关如何使用 Google Ads MCP 服务器工具诊断常见账号效果问题的说明。

## 工作流

### 识别有效的客户账号
大多数诊断任务都需要向特定客户账号发送 GAQL 查询。如果用户未明确提供客户 ID，你必须先调用 `list_accessible_customers`（或 `customers_list_accessible_customers`）工具，以检索你有权访问的客户资源名称/ID。

获得可访问的客户 ID 列表后，在这些客户账号下使用 `search` 工具查询 `customer_client` 资源，以查找有效的客户账号。请确保只选择已启用的客户账号，并过滤掉经理账号：
```sql
SELECT
  customer_client.id,
  customer_client.descriptive_name,
  customer_client.status,
  customer_client.manager
FROM customer_client
WHERE customer_client.status = 'ENABLED' AND customer_client.manager = FALSE
```
后续诊断查询只能针对从此列表中检索到的已启用客户 ID 运行。不要查询已停用的账号或经理账号，否则会导致 API 错误。

### 直接使用 MCP 工具
要检索信息并运行查询，你必须直接调用 MCP 服务器上的 `search` 工具（使用 `customer_id`、`fields`、`resource` 和 `conditions` 等参数）。不要编写或执行自定义 Python 脚本，也不要使用 Google Ads 客户端库查询 API，因为它们在评估沙箱中会因身份验证失败而无法运行。

### 1. 转化次数和转化价值损失

当转化次数或转化价值突然下降时，请使用以下步骤诊断问题。

**步骤：**
1.  **发现字段**：对资源 `campaign` 或 `ad_group` 使用 `get_resource_metadata`，以确保字段名称正确。
2.  **查询效果**：使用 `search` 检索效果数据。
    *   **资源**：`campaign` 或 `ad_group`
    *   **字段**：包括 `campaign.name`、`metrics.conversions`、`metrics.conversions_value`、`metrics.cost_micros`。
    *   **细分维度**：要定位损失，请包括 `segments.date`、`segments.device`、`segments.conversion_action` 等细分维度。
    *   **条件**：将下降期间与之前的期间进行比较（例如 `segments.date >= '{start_date}'`）。
    *   *注意事项*：`metrics.cost_micros` 必须除以 1,000,000，才能得到标准货币金额。

    **GAQL 查询示例：**
    要查询客户账号 `{customer_id}` 在 `{start_date}` 和 `{end_date}` 之间的效果数据：
    ```sql
    SELECT
      campaign.name,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_micros,
      segments.date,
      segments.device,
      segments.conversion_action
    FROM campaign
    WHERE segments.date >= '{start_date}' AND segments.date <= '{end_date}'
    ```

3.  **分析**：检查损失是否仅限于某些设备（例如移动设备与桌面设备）或特定转化操作。
4.  **检查上传**：如果使用离线导入，请查询 `offline_conversion_upload_conversion_action_summary` 以验证上传流水线的运行状况。如果查询未返回结果，请报告该账号不存在离线上传，然后继续。

**GAQL 查询示例：**
    检查客户账号 `{customer_id}` 的上传管道健康状况：
    ```sql
    SELECT
      offline_conversion_upload_conversion_action_summary.conversion_action_name,
      offline_conversion_upload_conversion_action_summary.successful_event_count,
      offline_conversion_upload_conversion_action_summary.total_event_count,
      offline_conversion_upload_conversion_action_summary.status
    FROM offline_conversion_upload_conversion_action_summary
    ```

### 2. 错失的机会（展示次数份额）

要识别因广告排名、出价或预算而错失的机会，请分析展示次数份额指标。

**步骤：**
1.  **查询展示次数份额**：使用 `search` 获取展示次数份额指标。
    *   **资源**：`campaign`
    *   **字段**：包括 `campaign.name`、`metrics.search_impression_share`、`metrics.search_rank_lost_impression_share`、`metrics.search_budget_lost_impression_share`。
    *   *注意事项*：API 中的展示次数份额值以小数（例如，0.35 = 35%）或格式化字符串（例如，`"< 0.10"`）的形式返回。

    **GAQL 查询示例：**
    查询客户账号 `{customer_id}` 在 `{start_date}` 和 `{end_date}` 之间的展示次数份额指标：
    ```sql
    SELECT
      campaign.name,
      metrics.search_impression_share,
      metrics.search_rank_lost_impression_share,
      metrics.search_budget_lost_impression_share
    FROM campaign
    WHERE segments.date >= '{start_date}' AND segments.date <= '{end_date}'
    ```

2.  **分析**：
    *   `search_budget_lost_impression_share` 较高表示因预算有限而错失了机会。
    *   `search_rank_lost_impression_share` 较高表示因广告排名较低（出价或质量问题）而错失了机会。

### 3. 潜在客户流量偏低诊断

当用户询问“为什么过去几天我的潜在客户流量很低？”时，请遵循以下系统化方法。

**步骤：**
1.  **确认下降**：按日期细分查询最近几天与前一时间段的转化次数。
2.  **确定原因**：
    *   检查**流量**（点击次数、展示次数）是否下降。
    *   检查**转化率**（转化次数/点击次数）是否下降。
3.  **如果流量下降**：检查展示次数份额指标（参见工作流 2），以判断是预算问题、排名问题，还是搜索量整体下降。
4.  **如果转化率下降**：检查按 `segments.device` 或 `segments.conversion_action` 细分的数据，以确定是否有特定方面出现问题。
5.  **检查变更**：查询 `change_event` 资源，查看在下降开始前后是否对出价、预算或定位进行了任何更改。
    *   *注意事项（change_event 限制）*：对 `change_event` 资源的查询：
        *   必须指定小于或等于 10000 的 `LIMIT` 子句。
        *   必须按过去 30 天内的日期（`change_event.change_date_time`）进行过滤。
        *   不能选择效果指标（例如，不支持 `metrics.*`；只能选择 `change_event` 属性和允许的资源字段）。

**GAQL 查询示例：**
    查询客户账号 `{customer_id}` 在 `{start_date}` 与 `{end_date}` 之间的变更事件：
    ```sql
    SELECT
      change_event.change_date_time,
      change_event.change_resource_name,
      change_event.resource_change_operation,
      change_event.changed_fields
    FROM change_event
    WHERE change_event.change_date_time >= '{start_date}' AND change_event.change_date_time <= '{end_date}'
    LIMIT 10000
    ```

### 4. 离线上传流水线诊断

当特定操作（例如店内购买）的离线转化上传不再显示或上传失败时，请使用以下步骤诊断问题。

**步骤：**
1.  **检索客户账号**：如果未提供 `{customer_id}`，请先调用 `list_accessible_customers`（或 `customers_list_accessible_customers`）工具，检索您有权访问的客户资源名称/ID。然后查询 `customer_client` 资源以查找活跃的客户账号，并确保过滤掉经理账号以及已停用/已取消的账号，以避免查询错误。

    **GAQL 查询示例：**
    ```sql
    SELECT
      customer_client.id,
      customer_client.descriptive_name,
      customer_client.status,
      customer_client.manager
    FROM customer_client
    WHERE customer_client.status = 'ENABLED' AND customer_client.manager = FALSE
    ```

2.  **验证流水线运行状况**：查询活跃客户账号的 `offline_conversion_upload_conversion_action_summary`。
    *   **字段**：包括 `offline_conversion_upload_conversion_action_summary.conversion_action_name`、`offline_conversion_upload_conversion_action_summary.successful_event_count`、`offline_conversion_upload_conversion_action_summary.total_event_count` 和 `offline_conversion_upload_conversion_action_summary.status`。

    **GAQL 查询示例：**
    ```sql
    SELECT
      offline_conversion_upload_conversion_action_summary.conversion_action_name,
      offline_conversion_upload_conversion_action_summary.successful_event_count,
      offline_conversion_upload_conversion_action_summary.total_event_count,
      offline_conversion_upload_conversion_action_summary.status
    FROM offline_conversion_upload_conversion_action_summary
    ```

3.  **分析**：
    *   *注意事项*：如果对 `offline_conversion_upload_conversion_action_summary` 的查询未返回任何结果或结果为空（表示该客户账号未配置或没有活跃的离线转化上传），请立即停止/中断诊断工作流。直接向用户报告可访问账号中不存在离线转化上传数据或摘要，而不是重试或尝试生成自定义脚本。
    *   如果返回了结果，请通过比较 `successful_event_count` 与 `total_event_count` 来验证上传成功率。检查 `status` 字段以诊断失败原因。