---
name: developer-device-platform-basics
description: >-
  Provides guidance and instructions on managing remote devices on Developer Device Platform (DDP).
  Use when reserving remote Android devices, establishing connection tunnels, checking session status, or extending/cancelling leases.
  Don't use for iOS or local device/hardware inquiries.
metadata:
  category: CloudInfrastructureAndServices
---
# 开发者设备平台

开发者设备平台（DDP）是由 Google 完全托管的全球基础设施，可供访问各种物理设备和虚拟设备。

> [!WARNING] 开发者设备平台（DDP）目前处于预览阶段。

> [!IMPORTANT] 对于所有 devicerun 和 devicestreaming API 操作（预留、检查状态、停止/取消、更新或列出会话），请始终核实并使用链接的参考 `.md` 文件中提供的确切说明和 curl 命令。

## 身份验证与设置

**关键要求**：在运行任何请求之前，你必须按照以下步骤确保环境已正确初始化：

在运行任何请求之前，请确认 `gcloud` 可执行文件是否存在。如果不存在，请参阅官方的 [Google Cloud CLI 安装指南](https://docs.cloud.google.com/sdk/docs/install-sdk.md.txt)，在当前平台（Linux、macOS、Windows 等）上安装它。

1.  **Google Cloud 身份验证**：使用你的 Google Cloud 凭据进行身份验证，并为开发者设备平台配置有效的应用默认凭据（ADC）：

    ```bash
    gcloud auth login --no-browser
    gcloud auth application-default login --no-browser
    ```

2.  **启用 API**（如果尚未启用）：

    ```bash
    gcloud services enable devicerun.googleapis.com devicestreaming.googleapis.com testing.googleapis.com --quiet
    ```

> [!NOTE] 在预览阶段，Device Streaming API 需要 Cloud Testing API。

3.  **启用 gcloud beta 组件**：

    ```bash
    gcloud components install beta
    ```

4.  **设置环境变量**：设置所需的项目变量和访问令牌：

    ```bash
    export PROJECT_ID=$(gcloud config get project)
    export ACCESS_TOKEN=$(gcloud auth application-default print-access-token 2>/dev/null)
    ```

5.  **Python 环境**：有关设置 Python 虚拟环境的说明，请参阅 [start_adb_forwarder.md]。

## 列出可用设备

要查找启动会话时应使用的正确 `modelCode` 和 `osVersion`，你可以列出可用设备：

1.  **列出型号**：运行以下命令以列出可用的 Android 设备型号：

    ```bash
    gcloud beta device-run devices list
    ```

    使用 `ID` 列查找 `CATALOG_ID` 参数的值，以描述特定设备（例如 `shiba-36`）。

2.  **描述型号**：运行 API 请求，以获取特定型号的更多详细信息（例如 supportedProducts、分辨率）。请始终以 [describe_device.md] 中提供的确切 curl 命令和说明为准。

## 启动设备会话

当用户要求预留或连接设备时：

1.  **检查设备可用性**：

    按照`列出可用设备`中的说明查找设备的 `CATALOG_ID`。使用 [describe_device.md] 中提供的确切 curl 命令和说明，检查该 `CATALOG_ID` 对应设备的可用性。设备必须在 "supportedProducts" 中包含 "deviceStreaming" 才能被预留。

如果未指定具体设备，请使用 `CATALOG_ID=shiba-34`（搭载
    SDK 34 的 Pixel 8）。

    如果用户未指定 `OS_VERSION`，请让用户从设备列表中选择一个
    版本（优先选择可用性最高的版本
    {"available": "AVAILABILITY_HIGH" }）。

    如果 `OS_VERSION` 不可用于 `deviceStreaming`，请勿预留设备。
    提示用户选择其他 `OS_VERSION`。

2.  **提取参数**：

    *   `model_id`：设备详情中的 `modelCode`。必需。
    *   `version_id`：设备详情中的 `osVersion`。必需。

3.  **预留设备**：

    **规则**：**需要用户明确确认**。预留设备会产生
    计费费用并创建云资源。代理必须始终明确警告
    用户，当前有效的 Google Cloud 项目（例如 `${PROJECT_ID}`）将产生
    计费费用。你必须停止操作并请求
    明确批准，然后才能继续执行任何会话创建命令。

    然后，使用 `model_id` 和 `version_id` 运行 API 请求以预留
    设备。始终严格采用 [reserve_device.md] 中提供的 curl 命令和说明。

    解析响应以获取 `session_name`（会话名称，例如
    `projects/${PROJECT_ID}/deviceSessions/session-xxxxxx`）。如果预留
    失败，请报告错误。

4.  **等待会话变为活跃状态**：

    在等待设备会话配置完成时，轮询会话
    状态，直到 `"state"` 为 `"ACTIVE"`。有关确切的
    curl 命令，请参阅 [session_status.md]。

    每 5 秒重复一次此检查，以避免触发 API 速率限制。如果会话
    未能在 2 分钟内变为活跃状态（通常不到 1 分钟），请报告
    失败并取消会话。会话变为活跃状态后，从
    会话 JSON 响应中提取 `expireTime`，并将其转换为用户当地时间的
    人类可读格式（例如，“June 9, 2026 at 2:44 PM PDT”）。

5.  **启动连接转发器**：启动 ADB 转发器脚本，将
    连接转发至远程设备。始终严格采用 [start_adb_forwarder.md] 中提供的确切命令和
    说明。确保记录
    **命令 ID**。

6.  **等待上线并解析端口**：等待转发器上线并
    提取监听端口。始终严格采用 [start_adb_forwarder.md] 中提供的确切逻辑和说明。

7.  **向用户提供说明**：

    上线后，运行 `adb -s localhost:{port} shell getprop ro.product.model` 以
    获取设备型号名称。然后，直接在聊天中向用户
    输出一条消息（请勿创建任何制品文件），其中包含以下
    说明：

    ### 设备已就绪！

    ```
    Device Model: {device_model}
    OS Version: {version_id}
    ADB Address: localhost:{port}
    Session Expiration: {expire_time_human_readable_local}
    ```

8.  **保存会话状态**：将 `{session_name}` 和 `{command_id}` 保存在你的
    对话记忆/上下文中，以便稍后进行清理。

## 查看已预留设备的屏幕

编码代理可以使用 `adb` 直接与远程设备交互。用户可以使用实用工具在 DDP 中显示屏幕并手动控制已预留的设备。有关实用工具的示例，请参阅 [view_device.md]。

## 停止设备会话

当用户要求停止、清理或释放设备时：

1.  **识别会话**：从上下文中检索当前的 `{session_name}` 和 `{command_id}`。如果没有这些信息，请先列出活动会话（参见下面的辅助命令），以查找会话名称。

2.  **通过 API 取消会话**：通过 API 取消会话。始终严格依照 [cancel_session.md] 中提供的确切 curl 命令和说明进行操作。

3.  **终止连接转发器**：使用当前环境的进程管理功能，终止与 `{command_id}` 匹配的后台进程。

4.  **确认**：向用户确认会话已取消且资源已释放。

## 更改设备会话过期时间

当用户要求更改活动设备会话的过期时间时：

**规则**：**需要用户明确确认**。延长设备会话会产生额外的计费费用并创建云资源。代理必须始终明确警告用户，活动 Google Cloud 项目（例如 `${PROJECT_ID}`）将产生额外的计费费用。在继续执行任何会话延长命令之前，你必须停止操作并请求用户明确批准。

1.  **提取参数**：

    *   `session_name`：活动会话名称。
    *   `ttl`：新的剩余时长（例如 `3600s`）。如果 `ttl` 以其他格式提供，请将其换算出来。

2.  **通过 API 更改会话**：使用 `updateMask=ttl` 通过 API 更改会话。始终严格依照 [update_session_expiration.md] 中提供的确切 curl 命令和说明进行操作。

3.  **重启连接转发器**：

    *   运行 `adb disconnect localhost:{port}`，确保旧的转发器连接已关闭。
    *   停止与 `{command_id}` 对应的旧连接转发器。
    *   按照“启动设备会话”中的第 5 步启动新的连接转发器（以秒为单位计算新的 `--ttl` 时长，并存储新返回的命令 ID）。

4.  **确认**：向用户确认会话时长已更新，并且连接转发器已使用新的 TTL 重启。

## 辅助操作：列出活动会话

如果上下文丢失，需要查找活动会话，请始终严格依照 [list_sessions.md] 中提供的 curl 命令和说明进行操作。

## 参考资料

*   [gcloud device-run CLI]
*   [Device Streaming API]
*   [describe_device.md]
*   [reserve_device.md]
*   [session_status.md]
*   [start_adb_forwarder.md]
*   [view_device.md]
*   [cancel_session.md]
*   [update_session_expiration.md]
*   [list_sessions.md]

[gcloud device-run CLI]: https://docs.cloud.google.com/sdk/gcloud/reference/beta/device-run
[Device Streaming API]: https://docs.cloud.google.com/device-streaming/docs/reference/rest.md.txt
[describe_device.md]: references/describe_device.md
[reserve_device.md]: references/reserve_device.md
[session_status.md]: references/session_status.md
[start_adb_forwarder.md]: references/start_adb_forwarder.md
[view_device.md]: references/view_device.md
[cancel_session.md]: references/cancel_session.md
[update_session_expiration.md]: references/update_session_expiration.md
[list_sessions.md]: references/list_sessions.md